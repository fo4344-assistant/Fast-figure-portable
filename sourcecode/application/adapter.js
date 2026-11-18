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
export function applySlotStyle(_fromControls = false, notify = true) {
  const result = transformWorkspace();
  if (notify) appFSM.notify("layout", "LAYOUT_STYLE_CHANGED");
  return result;
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
  const validatedInput = validateFrontendIntent("SELECT_SLOT", { slotId, direction });
  if (!validatedInput.accepted) return [interfaceFSM.readState(), null, null];
  let state = interfaceFSM.send("SELECT_SLOT", { validatedInput }), commandTuple = null;
  if (state.selectedSlotId !== null && pendingContentType !== null) {
    const context = readBackendProjection("slot-selection-context", { slotId: state.selectedSlotId });
    if (context?.empty && context.contentType !== pendingContentType)
      commandTuple = dispatchProjectCommand("SLOT_TYPE_CHANGED", {
        slotId: state.selectedSlotId, contentType: pendingContentType,
      });
  }
  state = interfaceFSM.readState();
  updateSelectionDecoration(state);
  if (state.selectedSlotId === null)
    return [state, commandTuple?.[0] ?? null, dispatchProjectQuery("renderer", { operation: "workspace-structure" })];
  if (commandTuple && commandTuple[1].selectedSlotId === state.selectedSlotId)
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
export function applyUiPalette(palette, notify = true) {
  const result = applyUiPaletteProjection(palette);
  if (notify) appFSM.notify("ui", "UI_PALETTE_CHANGED");
  return result;
}
export function applyCurrentUiPalette(notify = true) {
  applyUiPalette(dispatchProjectQuery("renderer", { operation: "ui-palette" }), notify);
  return null;
}
export function applyUiPaletteValues(values, notify = true) {
  const [result, state, projection] = dispatchProjectCommand("APPEARANCE_CHANGED", { palette: values });
  if (!result.committed) return false;
  if (notify) appFSM.notify("ui", "UI_PALETTE_CHANGED");
  return readAppearanceApiPalette();
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
      layout = readBackendProjection("project-api", { operation: "layout.readState" });
    request.operation ??= "selected-slot";
    if (request.operation === "selected-slot") request.slotId = state.selectedSlotId;
    request.frontendState = state;
    request.width = layout.slotStyle.referenceWidth * state.dashboardZoomIntent / 100;
  }
  return readBackendProjection(query, request);
}

export function dispatchInterfaceEvent(event, payload = {}) {
  const request = event === "SELECT_GRAPH_OBJECT"
    ? { ...payload, selectedSlotId: interfaceFSM.readState().selectedSlotId } : payload ?? {},
    validatedInput = BACKEND_REFERENCE_EVENTS.has(event) ? validateFrontendIntent(event, request)
      : { event, accepted: true, payload };
  if (!validatedInput.accepted) return interfaceFSM.readState();
  return interfaceFSM.send(event, { ...payload, validatedInput });
}

export function runLifecycleTask(lifecycle, event, task) {
  const state = interfaceFSM.readState();
  if (state.lifecycle !== "ready")
    return Promise.reject(
      Error(`현재 ${state.lifecycle} 상태에서는 ${event} 작업을 시작할 수 없습니다.`),
    );
  if (lifecycle !== "importing" && lifecycle !== "exporting")
    return Promise.reject(Error("작업 lifecycle은 importing 또는 exporting이어야 합니다."));
  dispatchInterfaceEvent("LIFECYCLE_START", { lifecycle, event });
  const complete = (result) => {
    dispatchInterfaceEvent("LIFECYCLE_COMPLETE", { event, outcome: result });
    return result;
  };
  const fail = (error) => {
    dispatchInterfaceEvent("LIFECYCLE_FAILED", { event, message: error?.message || String(error) });
    throw error;
  };
  let completion;
  try { completion = task(); }
  catch (error) { return Promise.reject(error).then(undefined, fail); }
  return Promise.resolve(completion).then(complete, fail);
}

export function dispatchProjectCommand(event, payload = {}) {
  if (!PROJECT_COMMANDS.has(event)) throw Error(`${event}는 등록된 ProjectObject command가 아닙니다.`);
  const result = projectEFSM.send(event, payload), frontendBefore = interfaceFSM.readState();
  if (!result.committed) return [result, frontendBefore, null];
  const reconciliationInput = buildFrontendReconciliationInput(event, result, frontendBefore),
    state = interfaceFSM.reconcileProjectResult(event, reconciliationInput),
    effect = reconciliationInput.projectionEffect ?? result.projectionEffect ?? {};
  if (event === "PROJECT_LOADED") clearWorkspacePresentation();
  if (event === "PROJECT_LOADED" || event === "APPEARANCE_CHANGED")
    applyUiPaletteProjection(dispatchProjectQuery("renderer", { operation: "ui-palette" }));
  const structural = ["PROJECT_LOADED", "GRID_LAYOUT_CHANGED", "SLOTS_MERGED", "SLOTS_SPLIT",
    "SLOTS_SWAPPED", "LAYOUT_STYLE_CHANGED"].includes(event),
    skipContent = structural || (effect.pathOnly && !effect.referencesRemoved) || event === "EXPORT_SETTINGS_CHANGED",
    projection = dispatchProjectQuery("renderer", {
      operation: skipContent || state.selectedSlotId === null ? "workspace-structure" : "selected-slot",
    });
  if (structural) applyWorkspaceTransform(projection, state);
  else if (!skipContent) applyCommittedDashboardProjection(event, result, state, projection);
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
  notify: (...args) => interfaceFSM.notify(...args),
  run: (...args) => runLifecycleTask(...args),
  ready: () => interfaceFSM.ready(readWorkspaceHint()),
  subscribe: (...args) => interfaceFSM.subscribe(...args),
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
