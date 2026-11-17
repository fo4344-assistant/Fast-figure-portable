// Source: sourcescript/frontend/interface_fsm.py; pseudocode/frontend/interface_fsm.pcal.
import { debugLog } from './renderer.js';

const REFERENCE_EVENTS = new Set(["SELECT_SLOT", "SELECT_ASSET", "SELECT_GRAPH_OBJECT"]);
const INTERFACE_EVENTS = new Set([...REFERENCE_EVENTS, "CLEAR_ASSET_SELECTION", "CLEAR_GRAPH_OBJECT",
  "TOGGLE_OVERLAY", "CLOSE_OVERLAY", "OUTSIDE_CLICK", "ESCAPE", "SET_DASHBOARD_ZOOM",
  "SET_DASHBOARD_ZOOM_LOCK", "RESET_DASHBOARD_ZOOM", "LIFECYCLE_START", "LIFECYCLE_COMPLETE", "LIFECYCLE_FAILED"]);

export class InterfaceStateMachine {
  constructor(definitions) {
    this.definitions = definitions;
    this.state = Object.freeze({ lifecycle: "booting", workspace: "project", overlay: "none",
      assetSelection: "none", assetPath: null, graphObject: "none", graphObjectIndex: null,
      direction: "model-to-ui", revision: 0, error: null });
    this.listeners = new Set();
    this.writeLocks = new Set();
  }
  definition(region, state = this.state[region]) {
    const definition = this.definitions[region]?.[state];
    if (!definition) throw Error(`${region}.${state} FSM 상태가 등록되지 않았습니다.`);
    return definition;
  }
  assertWritable(scope, event) {
    if (this.writeLocks.has(scope)) throw Error(`${event} 전이 중 잠긴 ${scope} 모델을 수정할 수 없습니다.`);
  }
  publish(event) {
    this.state = Object.freeze({ ...this.state, revision: this.state.revision + 1 });
    const state = this.readState(), busy = state.lifecycle === "importing" || state.lifecycle === "exporting";
    document.body.classList.toggle("app-busy", busy);
    document.body.setAttribute("aria-busy", String(busy));
    document.body.dataset.appLifecycle = state.lifecycle;
    document.body.dataset.appWorkspace = state.workspace;
    document.body.dataset.appOverlay = state.overlay;
    document.body.dataset.appAssetSelection = state.assetSelection;
    document.body.dataset.appGraphObject = state.graphObject;
    this.listeners.forEach(listener => listener(state, event));
    debugLog("fsm:transition", { event, ...state });
    return state;
  }
  send(event, payload = {}) {
    // validatedInput is the existing Application transport envelope, not domain state.
    const input = payload.validatedInput ?? (REFERENCE_EVENTS.has(event)
      ? { accepted: false } : { accepted: payload.accepted !== false, payload });
    if (input.accepted !== true) return this.readState();
    if (!INTERFACE_EVENTS.has(event)) throw Error(`${event}는 등록된 Frontend event가 아닙니다.`);
    const values = input.payload ?? payload, next = { ...this.state };
    if (event === "SELECT_SLOT") {
      const reference = input.reference;
      interfaceRuntime.selectedSlotId = reference === null ||
        (input.selectionHint === "toggle-clear" && reference === interfaceRuntime.selectedSlotId) ? null : reference;
      next.workspace = interfaceRuntime.selectedSlotId === null ? "project" : input.workspaceHint;
      next.graphObject = "none"; next.graphObjectIndex = null;
      if (interfaceRuntime.selectedSlotId === null || input.selectionHint === "toggle-clear") {
        next.assetSelection = "none"; next.assetPath = null;
      }
      if (interfaceRuntime.selectedSlotId !== null) next.overlay = "none";
    } else if (event === "SELECT_ASSET") {
      next.assetSelection = input.selectionHint ?? "none"; next.assetPath = input.reference;
      next.graphObject = "none"; next.graphObjectIndex = null;
    } else if (event === "SELECT_GRAPH_OBJECT") {
      next.graphObject = input.reference === null ? "none" : "selected";
      next.graphObjectIndex = input.reference;
      if (input.reference !== null && input.selectionHint != null) {
        next.assetSelection = "csv"; next.assetPath = input.selectionHint;
      }
    } else if (event === "CLEAR_ASSET_SELECTION") {
      next.assetSelection = "none"; next.assetPath = null;
    } else if (event === "CLEAR_GRAPH_OBJECT") {
      next.graphObject = "none"; next.graphObjectIndex = null;
    } else if (event === "TOGGLE_OVERLAY") {
      next.overlay = next.overlay === values.overlay ? "none" : values.overlay;
    } else if (["CLOSE_OVERLAY", "OUTSIDE_CLICK", "ESCAPE"].includes(event)) {
      next.overlay = "none";
    } else if (event === "SET_DASHBOARD_ZOOM") {
      if (interfaceRuntime.dashboardZoomLocked) return this.readState();
      const raw = values.value, numeric = typeof raw === "number" ||
        (typeof raw === "string" && raw.trim() !== "") ? Number(raw) : NaN,
        value = Number.isFinite(numeric) ? Math.max(50, Math.min(200, numeric)) : 100;
      if (value === interfaceRuntime.dashboardZoomIntent) return this.readState();
      interfaceRuntime.dashboardZoomIntent = value;
    } else if (event === "SET_DASHBOARD_ZOOM_LOCK" || event === "RESET_DASHBOARD_ZOOM") {
      if (event === "SET_DASHBOARD_ZOOM_LOCK" && values.locked === true) {
        if (interfaceRuntime.dashboardZoomLocked || !Number.isFinite(values.renderedWidth) || values.renderedWidth <= 0)
          return this.readState();
        interfaceRuntime.dashboardZoomLocked = true;
        interfaceRuntime.dashboardZoomLockedWidth = values.renderedWidth;
      } else {
        if (!interfaceRuntime.dashboardZoomLocked && interfaceRuntime.dashboardZoomLockedWidth === null &&
            interfaceRuntime.dashboardZoomIntent === 100) return this.readState();
        interfaceRuntime.dashboardZoomLocked = false; interfaceRuntime.dashboardZoomLockedWidth = null;
        interfaceRuntime.dashboardZoomIntent = 100;
      }
    } else if (event === "LIFECYCLE_START") {
      next.lifecycle = values.lifecycle; next.error = null;
    } else if (event === "LIFECYCLE_COMPLETE") {
      next.lifecycle = "ready"; next.error = null;
    } else if (event === "LIFECYCLE_FAILED") {
      next.lifecycle = "error";
      next.error = Object.freeze({ event: values.event, message: values.message });
      this.state = Object.freeze(next);
      this.publish(`${values.event}:failed`);
      this.state = Object.freeze({ ...this.state, lifecycle: "ready" });
      return this.publish(`${values.event}:recovered`);
    }
    this.state = Object.freeze(next);
    const outcomeLabel = event === "LIFECYCLE_COMPLETE"
      ? (typeof values.outcome === "string" ? values.outcome : values.outcome?.outcome) : null;
    const label = event === "LIFECYCLE_START" ? `${values.event}:start` :
      event === "LIFECYCLE_COMPLETE" ? `${values.event}:${outcomeLabel || "complete"}` : event;
    return this.publish(label);
  }
  readState() {
    return Object.freeze({ ...this.state, selectedSlotId: interfaceRuntime.selectedSlotId,
      dashboardZoomIntent: interfaceRuntime.dashboardZoomIntent, dashboardZoomLocked: interfaceRuntime.dashboardZoomLocked,
      dashboardZoomLockedWidth: interfaceRuntime.dashboardZoomLockedWidth });
  }
  reconcileProjectResult(event, input) {
    interfaceRuntime.selectedSlotId = input.selectedSlot;
    this.state = Object.freeze({ ...this.state, workspace: input.workspaceHint, direction: "model-to-fsm",
      assetSelection: input.assetKind ?? "none", assetPath: input.assetSelection,
      graphObject: input.graphObject === null ? "none" : "selected", graphObjectIndex: input.graphObject });
    return this.publish(`${event}:reconcile`);
  }
  notify(objectName, event, payload = {}) {
    this.state = Object.freeze({ ...this.state, direction: "model-to-fsm" });
    return this.publish(event);
  }
  ready(workspaceHint = "project") {
    this.state = Object.freeze({ ...this.state, workspace: workspaceHint, overlay: "none" });
    return this.send("LIFECYCLE_COMPLETE", { event: "READY" });
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
    interfaceFSM?.state.graphObject === "selected" &&
    Number.isInteger(interfaceFSM.state.graphObjectIndex)
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
