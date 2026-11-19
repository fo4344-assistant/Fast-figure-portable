// Source: sourcescript/application/adapter.py (same logical owner); pseudocode/application/adapter.pcal.
import { projectVfs } from '../backend/assets_files.js';
import { PROJECT_COMMAND_ACTIONS, projectEFSM } from '../backend/project_efsm.js';
import { buildFrontendReconciliationInput, getChart, getProjectCsv, readBackendProjection, validateFrontendIntent } from '../backend/project_state.js';
import { interfaceFSM } from '../frontend/interface_fsm.js';
import { applyDashboardProjectionInvalidation, applyWorkspaceTransform, clearWorkspacePresentation, renderWholeWorkspaceProjection, updateSelectionDecoration, applyReferenceGeometryProjection, applyUiPaletteProjection, debugLog, installSlotClickControllerProjection, renderDashboardProjection, startupCoreRuntimeProjection, syncDashboardCaptionProjection, updateGraphViewProjection } from '../frontend/renderer.js';
import { axisRangeValueFromPlotly } from '../backend/graphs.js';
import { readAppearanceApiPalette, setSelectedSlot, swapSlots } from './public_api/layout_annotations.js';

// Startup/audit resolve domain references here; the Frontend FSM receives only
// the workspace scalar and never imports a Backend model or retains this read.
export function readWorkspaceHint() {
  const slot = readBackendProjection("slot-selection-context", { slotId: interfaceFSM.readState().selectedSlotId });
  return !slot ? "project" : slot.contentType === "image" ? "slot.image" : "slot.graph";
}

export function installSlotClickController() {
  return installSlotClickControllerProjection({ slots: { select: setSelectedSlot, swap: swapSlots } });
}

// Commands supply their call-local final projection/state; standalone refreshes
// read current authority here. Callbacks carry intents, not writable models.
export function renderDashboard(projection = dispatchProjectQuery("renderer"), state = interfaceFSM.readState()) {
  return renderDashboardProjection(projection, state, dashboardFrontendActions());
}

export function startupCoreRuntime() {
  const projection = dispatchProjectQuery("renderer", { operation: "workspace-structure" }), state = interfaceFSM.readState(),
    actions = { ...dashboardFrontendActions(), slots: { select: setSelectedSlot, swap: swapSlots } },
    runtime = startupCoreRuntimeProjection(projection, state, actions);
  return runtime;
}

export function applyCommittedDashboardProjection(event, result, state, projection) {
  if (!result.committed) return "NONE";
  return applyDashboardProjectionInvalidation(event, result, state, projection, dashboardFrontendActions());
}

function dashboardFrontendActions() {
  return {
    transformWorkspace,
    graphRangesChanged(slotId, chartId, ranges) {
      const current = readBackendProjection("project-api", { operation: "graphs.readLayout", selectedSlotId: slotId });
      if (!current || current.chartId !== chartId || !current.editable) return false;
      const axes = {}, keys = { xaxis: "xBottom", xaxis2: "xTop", yaxis: "yLeft", yaxis2: "yRight" };
      for (const [axis, range] of Object.entries(ranges)) {
        const key = keys[axis], setting = current.settings.axes[key];
        if (!setting || !Array.isArray(range) || range.length !== 2) continue;
        const min = axisRangeValueFromPlotly(range[0], setting.scaleType),
          max = axisRangeValueFromPlotly(range[1], setting.scaleType);
        if (min !== setting.min || max !== setting.max) axes[key] = { min, max };
      }
      if (!Object.keys(axes).length) return false;
      const [result] = dispatchProjectCommand("CHART_LAYOUT_CHANGED", { slotId, chartId,
        settings: { globalSettings: { axes } } });
      return result.committed;
    },
  };
}

export function syncDashboardCaption(view, projection = dispatchProjectQuery("renderer")) {
  return syncDashboardCaptionProjection(view || projection.annotations.captions, projection.geometry.scale);
}

export function applyReferenceGeometry(element) {
  return applyReferenceGeometryProjection(element, dispatchProjectQuery("renderer").geometry);
}
export function transformWorkspace() {
  const projection = dispatchProjectQuery("renderer", { operation: "workspace-structure" });
  return applyWorkspaceTransform(projection, interfaceFSM.readState());
}
export function renderWholeWorkspace() {
  if (interfaceFSM.readState().lifecycle !== "ready") return null;
  const projection = dispatchProjectQuery("renderer", { operation: "whole-workspace" });
  return renderWholeWorkspaceProjection(projection, interfaceFSM.readState(), dashboardFrontendActions()).completion;
}
export function applySlotStyle() {
  return transformWorkspace();
}
export function applyDashboardZoom() {
  return transformWorkspace();
}
export function syncDashboardZoomDisplay() {
  return Math.round(interfaceFSM.readState().dashboardZoomIntent);
}
export function updateFileAvailability() {
  const state = interfaceFSM.readState();
  if (state.selectedSlotId !== null && state.overlay === "readme")
    appFSM.send("CLOSE_OVERLAY", { reason: "slot-selected" });
}
export function dispatchSlotSelection(slotId, pendingContentType = null, direction = "ui-to-fsm") {
  const before = interfaceFSM.readState();
  const validatedInput = validateFrontendIntent("SELECT_SLOT", { slotId, direction });
  if (!validatedInput.accepted) return [interfaceFSM.readState(), null, null];
  let state = interfaceFSM.send("SELECT_SLOT", { validatedInput }), commandTuple = null;
  if (state.selectedSlotId !== null && pendingContentType !== null) {
    const context = readBackendProjection("slot-selection-context", { slotId: state.selectedSlotId });
    if (context?.empty && context.contentType !== pendingContentType)
      commandTuple = dispatchProjectCommand("SLOT_TYPE_CHANGED", {
        slotId: state.selectedSlotId, contentType: pendingContentType,
      }, false);
  }
  state = interfaceFSM.readState();
  if (before.overlay !== state.overlay) uiDisplay?.overlay(state.overlay);
  uiDisplay?.selection(state);
  updateSelectionDecoration(state);
  if (state.selectedSlotId === null)
    return [state, commandTuple?.[0] ?? null, dispatchProjectQuery("renderer", { operation: "workspace-structure" })];
  if (commandTuple?.[0].committed && commandTuple[2] &&
      commandTuple[1].selectedSlotId === state.selectedSlotId)
    return [state, commandTuple[0], commandTuple[2]];
  const projection = dispatchProjectQuery("renderer", { operation: "selected-slot" });
  updateGraphView(projection, state);
  return [state, commandTuple?.[0] ?? null, projection];
}

export function updateGraphView(projection = dispatchProjectQuery("renderer"), state = interfaceFSM.readState()) {
  debugLog("updateGraphView", { selectedSlotId: state.selectedSlotId });
  return updateGraphViewProjection(projection, state, dashboardFrontendActions());
}
export function swapSlotContents(source, target) {
  return swapSlots(source?.id, target?.id);
}
export function applyUiPalette(palette) {
  const result = applyUiPaletteProjection(palette);
  uiDisplay?.palette(palette);
  return result;
}
export function applyCurrentUiPalette() {
  applyUiPalette(dispatchProjectQuery("renderer", { operation: "ui-palette" }));
  return null;
}
export function applyUiPaletteValues(values) {
  const [result, state, projection] = dispatchProjectCommand("APPEARANCE_CHANGED", { palette: values });
  if (!result.committed) return false;
  const palette = readAppearanceApiPalette();
  applyUiPaletteProjection(palette);
  uiDisplay?.palette(palette);
  return palette;
}
export function renderProjectObject(projection, state) {
  updateFileAvailability();
  return projection;
}

export const BACKEND_REFERENCE_EVENTS = new Set(["SELECT_SLOT", "SELECT_ASSET", "SELECT_GRAPH_OBJECT"]);

export const PROJECT_COMMANDS = new Set(Object.keys(PROJECT_COMMAND_ACTIONS));

export function dispatchProjectQuery(query, payload = {}) {
  const request = { ...payload };
  if (query === "renderer" && !["slot-image", "ui-palette"].includes(request.operation)) {
    const state = interfaceFSM.readState(),
      layout = readBackendProjection("project-api", { operation: "layout.readControls" });
    request.operation ??= "selected-slot";
    if (request.operation === "selected-slot") request.slotId = state.selectedSlotId;
    request.frontendState = state;
    request.width = layout.slotStyle.referenceWidth * state.dashboardZoomIntent / 100;
  }
  return readBackendProjection(query, request);
}

export function dispatchInterfaceEvent(event, payload = {}) {
  const before = interfaceFSM.readState();
  const request = event === "SELECT_GRAPH_OBJECT"
    ? { ...payload, selectedSlotId: before.selectedSlotId } : payload ?? {},
    validatedInput = BACKEND_REFERENCE_EVENTS.has(event) ? validateFrontendIntent(event, request)
      : { event, accepted: true, payload };
  if (!validatedInput.accepted) return before;
  const current = interfaceFSM.send(event, { ...payload, validatedInput });
  if (event === "SELECT_ASSET" || event === "CLEAR_ASSET_SELECTION" ||
      (event === "SELECT_GRAPH_OBJECT" &&
        (before.assetSelection !== current.assetSelection || before.assetPath !== current.assetPath)))
    uiDisplay?.assetSelection(current);
  if (["SELECT_ASSET", "CLEAR_ASSET_SELECTION", "SELECT_GRAPH_OBJECT", "CLEAR_GRAPH_OBJECT"].includes(event))
    uiDisplay?.graphObject(current);
  if (["TOGGLE_OVERLAY", "CLOSE_OVERLAY", "OUTSIDE_CLICK", "ESCAPE"].includes(event))
    uiDisplay?.overlay?.(current.overlay);
  return current;
}

export function runLifecycleTask(lifecycle, event, task) {
  const state = interfaceFSM.readState();
  if (state.lifecycle !== "ready")
    return Promise.reject(
      Error(`현재 ${state.lifecycle} 상태에서는 ${event} 작업을 시작할 수 없습니다.`),
    );
  if (lifecycle !== "importing" && lifecycle !== "exporting")
    return Promise.reject(Error("작업 lifecycle은 importing 또는 exporting이어야 합니다."));
  const started = dispatchInterfaceEvent("LIFECYCLE_START", { lifecycle, event });
  uiDisplay?.lifecycle(started.lifecycle);
  const complete = (result) => {
    const completed = dispatchInterfaceEvent("LIFECYCLE_COMPLETE", { event, outcome: result });
    uiDisplay?.lifecycle(completed.lifecycle);
    return result;
  };
  const fail = (error) => {
    try {
      const failed = dispatchInterfaceEvent("LIFECYCLE_FAILED", { event, message: error?.message || String(error) });
      uiDisplay?.taskError(failed.error);
    } catch { /* Keep the original task error. */ }
    try {
      const recovered = interfaceFSM.recoverLifecycle();
      uiDisplay?.lifecycle(recovered.lifecycle);
    } catch { /* Keep the original task error. */ }
    throw error;
  };
  let completion;
  try { completion = task(); }
  catch (error) { return Promise.reject(error).then(undefined, fail); }
  return Promise.resolve(completion).then(complete, fail);
}

let uiDisplay = null;

export function displayDashboardZoom(value) {
  uiDisplay?.zoom(value);
}

export function setUiDisplay(display) {
  uiDisplay = display;
}

function refreshCommittedUi(event, payload, result, before, current, showSelectedEditor) {
  if (event === "PROJECT_LOADED") {
    const palette = readAppearanceApiPalette();
    applyUiPaletteProjection(palette);
    if (uiDisplay) {
      uiDisplay.palette(palette);
      uiDisplay.projectName();
      uiDisplay.assetTree();
      uiDisplay.slotConnections();
      const csvOptions = uiDisplay.csvOptions();
      uiDisplay.selection?.(current, csvOptions, true);
      if (before.overlay !== current.overlay) uiDisplay.overlay?.(current.overlay);
    }
    return;
  }
  if (!uiDisplay) return;
  const { changed } = result, operation = payload.operation;
  let tree = false, connections = false, options = false;
  for (const { role, kind, replaced } of changed.assets) {
    const listChanged = ["created", "deleted", "moved"].includes(role) || (role === "imported" && !replaced);
    if (listChanged) {
      tree = true;
      if (kind === "csv") options = true;
    } else if (kind === "csv" && (role === "updated" || (role === "imported" && replaced))) tree = true;
  }
  if (changed.linkedAssetMovesOrRemovals.length || [
    "GRID_LAYOUT_CHANGED", "SLOTS_MERGED", "SLOTS_SPLIT", "SLOTS_SWAPPED", "SLOT_TYPE_CHANGED",
    "SLOTS_RESET", "SLOT_IMAGE_LINKED", "SLOT_DATA_CONNECTED", "SLOT_IMAGE_IMPORTED",
    "SLOT_CHART_IMPORTED", "CHART_MODEL_REPLACED",
  ].includes(event) || (event === "ASSETS_IMPORTED" && payload.targetSlotId != null)) connections = true;
  if (changed.targetSlotReferencesChanged || event === "SLOT_DATA_CONNECTED") tree = true;
  if (event === "GRAPH_OBJECTS_REPLACED") {
    if (operation === "graphs.addObject" || operation === "graphs.deleteObject" ||
      (operation === "graphs.setObjectValues" && changed.graphObjectCsvChanged)) tree = connections = true;
    else if (operation === "graphs.moveObject") connections = true;
  }
  if (event === "PROJECT_NAME_CHANGED") uiDisplay.projectName();
  if (tree) uiDisplay.assetTree();
  if (connections) uiDisplay.slotConnections();
  const csvOptions = options ? uiDisplay.csvOptions() : null;
  if (showSelectedEditor) {
    let initialized = false;
    if (before.selectedSlotId !== current.selectedSlotId || before.workspace !== current.workspace) {
      initialized = uiDisplay.selection?.(current, csvOptions);
    } else {
      if (changed.slotIds.includes(current.selectedSlotId))
        initialized = uiDisplay.slot?.(current, csvOptions, event);
      if (!initialized) {
        if (before.assetSelection !== current.assetSelection || before.assetPath !== current.assetPath)
          uiDisplay.assetSelection?.(current);
        if (before.graphObjectIndex !== current.graphObjectIndex) uiDisplay.graphObject?.(current);
      }
    }
    if (before.overlay !== current.overlay) uiDisplay.overlay?.(current.overlay);
    if (!initialized) {
      if (changed.chartIds.length) uiDisplay.graph?.(changed.chartIds, event, operation,
        changed.removedObjectChartIds, changed.appendedObjectChartIds);
      if (changed.imageIds.length) uiDisplay.image?.(changed.imageIds);
      if (changed.csvIds.length) uiDisplay.csv?.(changed.csvIds);
    }
  }
  if (["GRID_LAYOUT_CHANGED", "LAYOUT_STYLE_CHANGED", "SLOTS_MERGED", "SLOTS_SPLIT",
    "SLOTS_SWAPPED"].includes(event)) uiDisplay.layout?.();
  if (["LABEL_SETTINGS_CHANGED", "LABEL_POSITION_CHANGED"].includes(event)) uiDisplay.labels?.(event);
  if (["CAPTION_TEXT_INPUT", "SLOT_CAPTIONS_INSERTED", "CAPTION_SETTINGS_CHANGED"].includes(event))
    uiDisplay.captions?.(event, changed.slotIds);
  if (event === "EXPORT_SETTINGS_CHANGED") uiDisplay.printSettings?.();
}

export function dispatchProjectCommand(event, payload = {}, showSelectedEditor = true) {
  if (!PROJECT_COMMANDS.has(event)) throw Error(`${event}는 등록된 ProjectObject command가 아닙니다.`);
  const result = projectEFSM.send(event, payload), frontendBefore = interfaceFSM.readState();
  if (!result.committed) return [result, frontendBefore, null];
  const reconciliationInput = buildFrontendReconciliationInput(event, result, frontendBefore),
    state = interfaceFSM.reconcileProjectResult(event, reconciliationInput),
    effect = reconciliationInput.projectionEffect ?? result.projectionEffect ?? {};
  if (event === "PROJECT_LOADED") clearWorkspacePresentation();
  const structural = ["PROJECT_LOADED", "GRID_LAYOUT_CHANGED", "SLOTS_MERGED", "SLOTS_SPLIT",
    "SLOTS_SWAPPED", "LAYOUT_STYLE_CHANGED"].includes(event),
    skipContent = structural || (effect.pathOnly && !effect.referencesRemoved) || event === "EXPORT_SETTINGS_CHANGED",
    projection = dispatchProjectQuery("renderer", {
      operation: skipContent || state.selectedSlotId === null ? "workspace-structure" : "selected-slot",
    });
  if (structural) applyWorkspaceTransform(projection, state);
  else if (!skipContent) applyCommittedDashboardProjection(event, result, state, projection);
  refreshCommittedUi(event, payload, result, frontendBefore, state, event === "PROJECT_LOADED" || showSelectedEditor);
  return [result, state, projection];
}

export const appFSM = Object.freeze({
  get state() { return interfaceFSM.readState(); },
  get writeLocks() { return interfaceFSM.writeLocks; },
  readState: () => interfaceFSM.readState(),
  query: (kind, request) => dispatchProjectQuery(kind, request),
  definition: (...args) => interfaceFSM.definition(...args),
  send(event, payload = {}) {
    if (PROJECT_COMMANDS.has(event)) {
      const [, state] = dispatchProjectCommand(event, payload);
      return state;
    }
    return dispatchInterfaceEvent(event, payload);
  },
  run: (...args) => runLifecycleTask(...args),
  ready() {
    const state = interfaceFSM.ready(readWorkspaceHint());
    uiDisplay?.lifecycle(state.lifecycle);
    return state;
  },
});

export function selectedProjectAsset() {
  let path = appFSM.state.assetPath;
  return path ? projectVfs.resolve(path) : null;
}

export function selectedProjectCsv() {
  let selected = selectedProjectAsset();
  return selected?.kind === "csv" ? selected.asset : null;
}

export function dashboardProjectionEffect(event, payload = {}) {
  if (event === "PROJECT_NODE_MOVED" || event === "PROJECT_TRASH_EMPTIED")
    return (payload.removedGraphReferenceCount || 0) > 0 ||
      (payload.resetImageSlotCount || 0) > 0
      ? "FULL_DASHBOARD"
      : "NONE";
  if (event === "SLOTS_SWAPPED") return "FULL_DASHBOARD";
  return "NONE";
}

export function dispatchDashboardAffectingEvent(event, payload = {}) {
  const [result, state, projection] = dispatchProjectCommand(event, payload),
    projectionEffect = result.committed ? projection.operation : "NONE";
  return { state, payload, projectionEffect };
}

export function activateChartModel(id) {
  let chart=getChart(id);
  if(!chart){debugLog("chart:activate-missing",{chartId:id});return null;}
  if(chart.editor?.editable!==false)
    for(let object of chart.editor?.objects||[])
      if(!getProjectCsv(object.csvId))
        throw Error("차트가 참조하는 프로젝트 CSV가 없습니다.");
  debugLog("chart:activate",{chartId:id});
  return chart;
}
