// Source: sourcescript/application/adapter.py (same logical owner); pseudocode/application/adapter.pcal.
import { projectVfs } from '../backend/assets_files.js';
import { PROJECT_COMMAND_ACTIONS, projectEFSM } from '../backend/project_efsm.js';
import { buildFrontendReconciliationInput, getChart, getProjectCsv, readBackendProjection, validateFrontendIntent } from '../backend/project_state.js';
import { interfaceFSM, interfaceRuntime } from '../frontend/interface_fsm.js';
import { applyDashboardProjectionInvalidation, applyDashboardZoomProjection, applyReferenceGeometryProjection, applySlotStyleProjection, applyUiPaletteProjection, debugLog, installSlotClickControllerProjection, readDashboardRenderedWidth, renderDashboardProjection, startupCoreRuntimeProjection, syncDashboardCaptionProjection, updateGraphViewProjection } from '../frontend/renderer.js';
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

// Every refresh reads the current authority at the Application boundary, never
// a renderer-retained domain snapshot. Callbacks carry intents, not writable models.
export function renderDashboard() {
  return renderDashboardProjection(readBackendProjection("renderer"), interfaceFSM.readState(), dashboardFrontendActions());
}

export function startupCoreRuntime() {
  const projection = readBackendProjection("renderer"), state = interfaceFSM.readState(),
    actions = { ...dashboardFrontendActions(), slots: { select: setSelectedSlot, swap: swapSlots } },
    presentation = startupCoreRuntimeProjection(projection, state, actions);
  appFSM.notify("layout", "LAYOUT_STYLE_CHANGED");
  return presentation;
}

export function applyCommittedDashboardProjection(event, result) {
  if (!result.committed) return "NONE";
  return applyDashboardProjectionInvalidation(event, result, interfaceFSM.readState(),
    readBackendProjection("renderer"), dashboardFrontendActions());
}

function dashboardFrontendActions() {
  return {
    refreshDashboard: renderDashboard,
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
      return dispatchProjectCommand("CHART_LAYOUT_CHANGED", { slotId, chartId,
        settings: { globalSettings: { axes } } }).committed;
    },
  };
}

export function syncDashboardCaption(view) {
  const projection = readBackendProjection("renderer"), state = interfaceFSM.readState(),
    style = projection.layout.slotStyle,
    width = state.dashboardZoomLocked ? state.dashboardZoomLockedWidth : style.referenceWidth * state.dashboardZoomIntent / 100;
  return syncDashboardCaptionProjection(view || projection.annotations.captions, width / style.referenceWidth);
}

export function applyReferenceGeometry(element) {
  const style = readBackendProjection("renderer").layout.slotStyle, state = interfaceFSM.readState(),
    width = state.dashboardZoomLocked ? state.dashboardZoomLockedWidth : style.referenceWidth * state.dashboardZoomIntent / 100;
  return applyReferenceGeometryProjection(element, style, width);
}
export function applySlotStyle(_fromControls = false, notify = true) {
  applySlotStyleProjection(readBackendProjection("renderer").layout.slotStyle, interfaceFSM.readState());
  if (notify) appFSM.notify("layout", "LAYOUT_STYLE_CHANGED");
}
export function applyDashboardZoom(resize = true) {
  return applyDashboardZoomProjection(readBackendProjection("renderer").layout, interfaceFSM.readState(), resize);
}
export function syncDashboardZoomDisplay() {
  const width = readDashboardRenderedWidth(), state = interfaceFSM.readState();
  if (!width) return;
  const reference = readBackendProjection("renderer").layout.slotStyle.referenceWidth;
  return state.dashboardZoomLocked ? Math.max(50, Math.min(200, Math.round(width / reference * 100)))
    : Math.round(state.dashboardZoomIntent);
}
export function updateFileAvailability() {
  const state = interfaceFSM.readState();
  if (state.selectedSlotId !== null && state.overlay === "readme")
    appFSM.send("CLOSE_OVERLAY", { reason: "slot-selected" });
}
export function updateGraphView() {
  const projection = readBackendProjection("renderer"), state = interfaceFSM.readState();
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
  applyUiPalette(readBackendProjection("renderer", { operation: "ui-palette" }), notify);
  return renderDashboard();
}
export function applyUiPaletteValues(values, notify = true) {
  const result = dispatchProjectCommand("APPEARANCE_CHANGED", { palette: values });
  if (!result.committed) return false;
  applyCommittedDashboardProjection("APPEARANCE_CHANGED", result);
  if (notify) appFSM.notify("ui", "UI_PALETTE_CHANGED");
  return readAppearanceApiPalette();
}
export function renderProjectObject() {
  const presentation = renderDashboard();
  updateFileAvailability();
  return presentation;
}

export const BACKEND_REFERENCE_EVENTS = new Set(["SELECT_SLOT", "SELECT_ASSET", "SELECT_GRAPH_OBJECT"]);

export const PROJECT_COMMANDS = new Set(Object.keys(PROJECT_COMMAND_ACTIONS));

export function runLifecycleTask(lifecycle, event, task) {
  if (interfaceFSM.state.lifecycle !== "ready")
    return Promise.reject(
      Error(`현재 ${interfaceFSM.state.lifecycle} 상태에서는 ${event} 작업을 시작할 수 없습니다.`),
    );
  interfaceFSM.send("LIFECYCLE_START", { lifecycle, event });
  const complete = (result) => {
    const outcome = result?.outcome === "rejected" ? "rejected" : result?.outcome || "complete";
    interfaceFSM.send("LIFECYCLE_COMPLETE", { event, outcome });
    return result;
  };
  const fail = (error) => {
    interfaceFSM.send("LIFECYCLE_FAILED", { event, error });
    throw error;
  };
  try {
    const result = task();
    return result && typeof result.then === "function"
      ? result.then(complete, fail)
      : Promise.resolve(complete(result));
  } catch (error) {
    try {
      fail(error);
    } catch (failed) {
      return Promise.reject(failed);
    }
  }
}

export function dispatchProjectCommand(event, payload = {}) {
  let result = projectEFSM.send(event, payload);
  if (result.committed)
    interfaceFSM.reconcileProjectResult(event,
      buildFrontendReconciliationInput(event, result, interfaceFSM.readState()));
  return result;
}

export const appFSM = Object.freeze({
  get state() { return interfaceFSM.state; },
  get writeLocks() { return interfaceFSM.writeLocks; },
  readState: () => interfaceFSM.readState(),
  query: (kind, request) => readBackendProjection(kind, request),
  definition: (...args) => interfaceFSM.definition(...args),
  send(event, payload = {}) {
    if (PROJECT_COMMANDS.has(event)) {
      dispatchProjectCommand(event, payload);
      return interfaceFSM.state;
    }
    let validatedInput = BACKEND_REFERENCE_EVENTS.has(event)
      ? validateFrontendIntent(event, { ...payload, selectedSlotId: interfaceRuntime.selectedSlotId }) : null;
    if (validatedInput && !validatedInput.accepted) return interfaceFSM.state;
    interfaceFSM.send(event, validatedInput ? { ...payload, validatedInput } : payload);
    return interfaceFSM.state;
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
  const result = dispatchProjectCommand(event, payload),
    projectionEffect = applyCommittedDashboardProjection(event, result);
  return { state: appFSM.state, payload, projectionEffect };
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
