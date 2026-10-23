// Source: sourcescript/frontend/interface_fsm.py (same logical owner); pseudocode/frontend/interface_fsm.pcal.
import { BACKEND_REFERENCE_EVENTS, PROJECT_COMMANDS, appFSM } from '../application/adapter.js';
import { debugLog } from './renderer.js';

export class InterfaceStateMachine {
  constructor(definitions) {
    this.definitions = definitions;
    this.state = Object.freeze({
      lifecycle: "booting",
      workspace: "project",
      overlay: "none",
      assetSelection: "none",
      assetPath: null,
      graphObject: "none",
      graphObjectIndex: null,
      direction: "model-to-ui",
      revision: 0,
      error: null,
    });
    this.listeners = new Set();
    this.transitioning = 0;
    this.writeLocks = new Set();
  }
  definition(region, state = this.state[region]) {
    let definition = this.definitions[region]?.[state];
    if (!definition) throw Error(`${region}.${state} FSM 상태가 등록되지 않았습니다.`);
    return definition;
  }
  context(region, state, event, payload) {
    return {
      machine: this,
      region,
      state,
      event,
      payload,
      direction: payload.direction || this.state.direction || "model-to-ui",
      canWrite: (scope) => !this.writeLocks.has(scope),
    };
  }
  withWriteLocks(scopes, operation) {
    scopes.forEach((scope) => this.writeLocks.add(scope));
    try {
      return operation();
    } finally {
      scopes.forEach((scope) => this.writeLocks.delete(scope));
    }
  }
  assertWritable(scope, event) {
    if (this.writeLocks.has(scope))
      throw Error(`${event} 전이 중 잠긴 ${scope} 모델을 수정할 수 없습니다.`);
  }
  publish(event) {
    document.body.dataset.appLifecycle = this.state.lifecycle;
    document.body.dataset.appWorkspace = this.state.workspace;
    document.body.dataset.appOverlay = this.state.overlay;
    document.body.dataset.appAssetSelection = this.state.assetSelection;
    document.body.dataset.appGraphObject = this.state.graphObject;
    this.listeners.forEach((listener) => listener(this.state, event));
    debugLog("fsm:transition", { event, ...this.state });
    return this.state;
  }
  transition(region, target, event, payload = {}) {
    if (typeof target === "function")
      target = target(this.context(region, this.state[region], event, payload));
    let previous = this.state[region];
    if (!target || (target === previous && payload.reenter !== true)) {
      let definition = this.definition(region, previous);
      if (payload.direction)
        this.state = Object.freeze({
          ...this.state,
          direction: payload.direction,
        });
      let update = () =>
        definition.update?.(this.context(region, previous, event, payload));
      if (payload.direction === "model-to-fsm" && region === "workspace")
        this.withWriteLocks(["workspace", "editor"], update);
      else update();
      return this.publish(`${event}:${region}:update`);
    }
    this.transitioning++;
    try {
      this.definition(region, previous).exit?.(
        this.context(region, previous, event, payload),
      );
      this.state = Object.freeze({
        ...this.state,
        [region]: target,
        direction: payload.direction || this.state.direction,
      });
      let enter = () =>
        this.definition(region, target).entry?.(
          this.context(region, target, event, payload),
        );
      if (payload.direction === "model-to-fsm" && region === "workspace")
        this.withWriteLocks(["workspace", "editor"], enter);
      else enter();
    } finally {
      this.transitioning--;
    }
    return this.publish(`${event}:${region}:${previous}->${target}`);
  }
  transitionLifecycle(event, payload = {}) {
    const origin = payload.event || event;
    if (event === "LIFECYCLE_START") {
      this.state = Object.freeze({ ...this.state, error: null });
      return this.transition("lifecycle", payload.lifecycle, `${origin}:start`);
    }
    if (event === "LIFECYCLE_COMPLETE") {
      this.state = Object.freeze({ ...this.state, error: null });
      return this.transition("lifecycle", "ready", `${origin}:${payload.outcome || "complete"}`);
    }
    if (event === "LIFECYCLE_FAILED") {
      const error = payload.error;
      this.state = Object.freeze({
        ...this.state,
        error: { event: origin, message: error?.message || String(error) },
      });
      this.transition("lifecycle", "error", `${origin}:failed`, { error });
      return this.transition("lifecycle", "ready", `${origin}:recovered`);
    }
    return this.state;
  }
  send(event, payload = {}) {
    if (PROJECT_COMMANDS.has(event)) return this.state;
    if (BACKEND_REFERENCE_EVENTS.has(event) && payload.validatedInput?.accepted !== true)
      return this.state;
    if (event === "LIFECYCLE_START" || event === "LIFECYCLE_COMPLETE" ||
        event === "LIFECYCLE_FAILED")
      return this.transitionLifecycle(event, payload);
    if (event === "SELECT_ASSET") {
      // Source40: publish the final selection and receipt, not intermediate regions.
      const input = payload.validatedInput;
      this.assertWritable("editor", event);
      this.state = Object.freeze({ ...this.state,
        assetSelection: input.selectionHint || "none", assetPath: input.reference ?? null,
        graphObject: "none", graphObjectIndex: null,
        direction: payload.direction || this.state.direction, revision: this.state.revision + 1,
      });
      return this.publish(event);
    }
    if (event === "SET_DASHBOARD_ZOOM") {
      if (interfaceRuntime.dashboardZoomLocked) return this.state;
      let numeric;
      try { numeric = Number(payload.value); } catch { numeric = NaN; }
      const value = Number.isFinite(numeric) ? Math.max(50, Math.min(200, numeric)) : 100;
      if (value === interfaceRuntime.dashboardZoomIntent) return this.state;
      interfaceRuntime.dashboardZoomIntent = value;
      return this.notify("layout", event);
    }
    if (event === "SET_DASHBOARD_ZOOM_LOCK" || event === "RESET_DASHBOARD_ZOOM") {
      if (event === "SET_DASHBOARD_ZOOM_LOCK" && payload.locked === true) {
        if (interfaceRuntime.dashboardZoomLocked || !Number.isFinite(payload.renderedWidth) || payload.renderedWidth <= 0) return this.state;
        interfaceRuntime.dashboardZoomLocked = true;
        interfaceRuntime.dashboardZoomLockedWidth = payload.renderedWidth;
      } else {
        if (!interfaceRuntime.dashboardZoomLocked && interfaceRuntime.dashboardZoomLockedWidth === null && interfaceRuntime.dashboardZoomIntent === 100) return this.state;
        interfaceRuntime.dashboardZoomLocked = false;
        interfaceRuntime.dashboardZoomLockedWidth = null;
        interfaceRuntime.dashboardZoomIntent = 100;
      }
      return this.notify("layout", event);
    }
    let handled = false;
    for (let region of [
      "lifecycle",
      "workspace",
      "overlay",
      "assetSelection",
      "graphObject",
    ]) {
      let transition = this.definition(region).on?.[event];
      if (!transition) continue;
      handled = true;
      if (typeof transition === "function")
        transition = transition(this.context(region, this.state[region], event, payload));
      let target = transition?.target ?? transition;
      transition?.action?.(this.context(region, this.state[region], event, payload));
      if (target) this.transition(region, target, event, payload);
    }
    if (!handled) debugLog("fsm:event-unhandled", { event, state: this.state }, "warn");
    return this.state;
  }
  readState() {
    return Object.freeze({ ...this.state, selectedSlotId: interfaceRuntime.selectedSlotId,
      dashboardZoomIntent: interfaceRuntime.dashboardZoomIntent, dashboardZoomLocked: interfaceRuntime.dashboardZoomLocked, dashboardZoomLockedWidth: interfaceRuntime.dashboardZoomLockedWidth });
  }
  reconcileProjectResult(event, input) {
    interfaceRuntime.selectedSlotId = input.selectedSlot;
    this.state = Object.freeze({
      ...this.state,
      workspace: input.workspaceHint,
      assetSelection: input.assetKind,
      assetPath: input.assetSelection,
      graphObject: input.graphObject === null ? "none" : "selected",
      graphObjectIndex: input.graphObject,
      direction: "model-to-ui",
      revision: this.state.revision + 1,
    });
    return this.publish(`${event}:reconcile`);
  }
  notify(object, event, payload = {}) {
    if (this.state.lifecycle === "booting" || this.transitioning) return this.state;
    this.state = Object.freeze({
      ...this.state,
      direction: "model-to-ui",
      revision: this.state.revision + 1,
    });
    for (let region of ["workspace", "overlay"]) {
      let definition = this.definition(region);
      if (definition.objects?.includes(object))
        definition.update?.(
          this.context(region, this.state[region], event, {
            ...payload,
            direction: "model-to-ui",
          }),
        );
    }
    return this.publish(event);
  }
  ready(workspaceHint = "project") {
    this.transition("lifecycle", "ready", "READY");
    this.transition("workspace", workspaceHint, "WORKSPACE_INIT", {
      direction: "model-to-fsm",
    });
    this.transition("overlay", "none", "OVERLAY_INIT", { reenter: true });
    return this.state;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export function requestedWorkspaceState({ payload }) {
  return interfaceRuntime.selectedSlotId === null ? "project" : payload.validatedInput.workspaceHint;
}

export function applySlotSelectionAction({ machine, payload }) {
  let input = payload.validatedInput,
    same = input.reference !== null && interfaceRuntime.selectedSlotId === input.reference;
  machine.assertWritable("workspace", "SELECT_SLOT");
  interfaceRuntime.selectedSlotId = same && input.selectionHint === "toggle-clear" ? null : input.reference;
  machine.state = Object.freeze({
    ...machine.state,
    graphObject: "none",
    graphObjectIndex: null,
  });
}

export function applyGraphObjectSelectionAction({ machine, payload }) {
  machine.assertWritable("editor", "SELECT_GRAPH_OBJECT");
  let index = payload.validatedInput?.event === "SELECT_GRAPH_OBJECT"
    ? payload.validatedInput.reference : null;
  machine.state = Object.freeze({
    ...machine.state,
    graphObjectIndex: index,
    ...(index !== null && payload.validatedInput.selectionHint ? {
      assetSelection: "csv", assetPath: payload.validatedInput.selectionHint,
    } : {}),
  });
}

export function selectedGraphObjectGuard() {
  return (
    appFSM?.state.graphObject === "selected" &&
    Number.isInteger(appFSM.state.graphObjectIndex)
  );
}

export function applyAssetSelectionAction({ machine, payload }) {
  if (payload.validatedInput?.event === "SELECT_SLOT" &&
      payload.validatedInput.reference !== null &&
      payload.validatedInput.selectionHint === "clear-graph-object") return;
  let path = payload.validatedInput?.event === "SELECT_ASSET"
    ? payload.validatedInput.reference : null;
  machine.state = Object.freeze({
    ...machine.state,
    assetPath: path ?? null,
  });
}

export function assetSelectionTarget({ payload }) {
  return payload.validatedInput.selectionHint || "none";
}

export function requestedOverlayState({ state, payload }) {
  return state === payload.overlay ? "none" : payload.overlay;
}

export function exitGraphWorkspaceState({ machine }) {
  machine.state = Object.freeze({
    ...machine.state,
    graphObject: "none",
    graphObjectIndex: null,
  });
}

export function enterLifecycleState({ state, payload }) {
  let busy = state === "importing" || state === "exporting";
  document.body.classList.toggle("app-busy", busy);
  document.body.setAttribute("aria-busy", String(busy));
  if (state === "error" && payload.error)
    debugLog("fsm:lifecycle-error", payload.error, "error");
}

export const SHARED_WORKSPACE_EVENTS = {
    SELECT_SLOT: {
      action: applySlotSelectionAction,
      target: requestedWorkspaceState,
    },
  };

export const SHARED_OVERLAY_EVENTS = {
    TOGGLE_OVERLAY: { target: requestedOverlayState },
    CLOSE_OVERLAY: { target: "none" },
    OUTSIDE_CLICK: { target: "none" },
    ESCAPE: { target: "none" },
    SELECT_SLOT: {
      target: ({ state, payload }) => payload.slotId == null ? state : "none",
    },
  };

export const GRAPH_OBJECT_EVENTS = {
    SELECT_ASSET: {
      action: applyGraphObjectSelectionAction,
      target: "none",
    },
    SELECT_GRAPH_OBJECT: {
      action: applyGraphObjectSelectionAction,
      target: ({ payload }) => payload.validatedInput.reference !== null ? "selected" : "none",
    },
    CLEAR_GRAPH_OBJECT: {
      action: applyGraphObjectSelectionAction,
      target: "none",
    },
    SELECT_SLOT: {
      action: applyGraphObjectSelectionAction,
      target: "none",
    },
  };

export const ASSET_SELECTION_EVENTS = {
    SELECT_ASSET: {
      action: applyAssetSelectionAction,
      target: assetSelectionTarget,
    },
    CLEAR_ASSET_SELECTION: {
      action: applyAssetSelectionAction,
      target: "none",
    },
    SELECT_SLOT: {
      action: applyAssetSelectionAction,
      target: ({ machine, payload }) => payload.validatedInput.reference !== null &&
        payload.validatedInput.selectionHint === "clear-graph-object" ? machine.state.assetSelection : "none",
    },
  };

export const APP_STATE_DEFINITIONS = {
    lifecycle: {
      booting: {
        objects: ["project"],
        entry: enterLifecycleState,
        on: { READY: { target: "ready" } },
      },
      ready: {
        objects: ["project", "ui"],
        entry: enterLifecycleState,
        on: {
          BEGIN_IMPORT: { target: "importing" },
          BEGIN_EXPORT: { target: "exporting" },
          FAIL: { target: "error" },
        },
      },
      importing: {
        objects: ["project", "data", "images", "charts", "slots"],
        entry: enterLifecycleState,
        on: { COMPLETE: { target: "ready" }, FAIL: { target: "error" } },
      },
      exporting: {
        objects: ["project", "layout", "labels", "captions", "data", "images", "charts", "slots"],
        entry: enterLifecycleState,
        on: { COMPLETE: { target: "ready" }, FAIL: { target: "error" } },
      },
      error: {
        objects: ["project", "ui"],
        entry: enterLifecycleState,
        on: { RECOVER: { target: "ready" } },
      },
    },
    workspace: {
      project: {
        objects: [
          "project",
          "layout",
          "labels",
          "captions",
          "data",
          "images",
          "files",
          "charts",
          "slots",
          "ui",
        ],
        on: SHARED_WORKSPACE_EVENTS,
      },
      "slot.graph": {
        objects: [
          "slots",
          "charts",
          "data",
          "images",
          "files",
          "layout",
          "labels",
          "captions",
          "ui",
        ],
        exit: exitGraphWorkspaceState,
        on: SHARED_WORKSPACE_EVENTS,
      },
      "slot.image": {
        objects: [
          "slots",
          "charts",
          "data",
          "images",
          "files",
          "layout",
          "labels",
          "captions",
          "ui",
        ],
        on: SHARED_WORKSPACE_EVENTS,
      },
    },
    overlay: {
      none: {
        objects: ["ui"],
        on: SHARED_OVERLAY_EVENTS,
      },
      layout: {
        objects: ["layout", "slots", "ui"],
        on: SHARED_OVERLAY_EVENTS,
      },
      label: {
        objects: ["labels", "slots", "ui"],
        on: SHARED_OVERLAY_EVENTS,
      },
      caption: {
        objects: ["captions", "slots", "labels", "ui"],
        on: SHARED_OVERLAY_EVENTS,
      },
      print: {
        objects: ["project", "layout", "labels", "captions", "charts", "images", "slots", "ui"],
        on: SHARED_OVERLAY_EVENTS,
      },
      readme: {
        objects: ["project", "ui"],
        on: SHARED_OVERLAY_EVENTS,
      },
    },
    assetSelection: {
      none: {
        objects: ["data", "images", "ui"],
        on: ASSET_SELECTION_EVENTS,
      },
      csv: {
        objects: ["data", "images", "ui"],
        on: ASSET_SELECTION_EVENTS,
      },
      image: {
        objects: ["data", "images", "ui"],
        on: ASSET_SELECTION_EVENTS,
      },
      directory: {
        objects: ["data", "images", "ui"],
        on: ASSET_SELECTION_EVENTS,
      },
    },
    graphObject: {
      none: {
        objects: ["slots", "charts"],
        on: GRAPH_OBJECT_EVENTS,
      },
      selected: {
        objects: ["slots", "charts"],
        on: GRAPH_OBJECT_EVENTS,
      },
    },
  };

export let interfaceFSM;
export function initializeInterfaceFSM() {
  interfaceFSM = new InterfaceStateMachine(APP_STATE_DEFINITIONS);
}

export function isSlotSelected(slot) {
  return !!slot && slot.id === interfaceRuntime.selectedSlotId;
}

export const interfaceRuntime = {
  selectedSlotId: null,
  dashboardZoomIntent: 100,
  dashboardZoomLocked: false,
  dashboardZoomLockedWidth: null
};
