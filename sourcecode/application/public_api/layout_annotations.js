// Source: sourcescript/application/public_api/layout_annotations.py (same logical owner); pseudocode/application/public_api/layout_annotations.pcal.
import { appFSM, applyCommittedDashboardProjection, dispatchProjectCommand, renderDashboard, syncDashboardCaption, applyDashboardZoom, applySlotStyle, applyUiPaletteValues, updateGraphView } from '../adapter.js';
import { activeProject } from '../../backend/project_state.js';
import { DEFAULT_UI_PALETTE } from '../../backend/settings.js';
import { interfaceFSM, interfaceRuntime } from '../../frontend/interface_fsm.js';
import { clearSlotDragState, debugLog, exportDashboard, exportDashboardTarget, readDashboardRenderedWidth, schedulePlotResize, syncSlotImageElement } from '../../frontend/renderer.js';

export function swapSlots(sourceSlotId, targetSlotId) {
  const result = dispatchProjectCommand("SLOTS_SWAPPED", { sourceSlotId, targetSlotId });
  if (result.committed) renderDashboard();
  return result.committed;
}

export function setSelectedSlot(slotId = null, direction = "fsm-to-model") {
  debugLog("setSelectedSlot:command", {
    slotId,
    previous: interfaceRuntime.selectedSlotId,
    direction,
  });
  appFSM.send("SELECT_SLOT", { slotId, direction });
  updateGraphView();
  requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  return interfaceFSM.readState();
}

export function mergeSlots(slotIds=[]) {
  const result = dispatchProjectCommand("SLOTS_MERGED", { slotIds });
  if (!result.committed) return false;
  renderDashboard();
  return readLayoutApiState();
}

export function splitSlots(slotIds=[]) {
  const result = dispatchProjectCommand("SLOTS_SPLIT", { slotIds });
  if (!result.committed) return false;
  renderDashboard();
  return readLayoutApiState();
}

export function insertEmptyImageIntoSelectedSlot() {
  const slotId = interfaceFSM.readState().selectedSlotId,
    context = appFSM.query("slot-selection-context", { slotId });
  if (!context || context.contentType !== "image") return null;
  const imageInput = { bytes: new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"></svg>'),
    name: "빈 이미지.svg", mime: "image/svg+xml" },
    result = dispatchProjectCommand("SLOT_IMAGE_IMPORTED", { slotId, operation: "images.insertEmpty", imageInput });
  if (!result.committed) return null;
  const path = result.changed.assets.find(asset => asset.role === "created" && asset.kind === "image").path,
    target = appFSM.query("project-api", { operation: "assets.readDeletionTarget", path }).target;
  renderDashboard();
  return target;
}

export function setSlotContentType(slotId, contentType) {
  const result = dispatchProjectCommand("SLOT_TYPE_CHANGED", { slotId, contentType });
  if (result.committed) renderDashboard();
  return null;
}

export function applyImageSettingsFromValues(slotId, values={}) {
  if (!appFSM.query("project-api", { operation: "images.readEditor", slotId })) return false;
  let result=dispatchProjectCommand("SLOT_IMAGE_SETTINGS_CHANGED", { slotId, settings: values });
  if (!result.committed) return false;
  applyCommittedDashboardProjection("SLOT_IMAGE_SETTINGS_CHANGED", result);
  appFSM.notify("images","IMAGE_SETTINGS_CHANGED");
  return appFSM.query("project-api", { operation: "images.readEditor", slotId });
}

export function readSelectedSlotApi() {
  return appFSM.query("project-api", {
    operation: "slots.readSelected", frontendState: interfaceFSM.readState(),
  });
}

export function resetSlotApi(slotId) {
  const result = dispatchProjectCommand("SLOTS_RESET", { slotIds: [slotId] });
  if (result.committed) renderDashboard();
  return null;
}

export function prepareDashboardFileDrop(slotId) {
  const context = appFSM.query("slot-selection-context", { slotId });
  if (!context) return false;
  if (interfaceFSM.readState().selectedSlotId === slotId) return true;
  appFSM.send("SELECT_SLOT", { slotId, direction: "model-to-fsm" });
  if (interfaceFSM.readState().selectedSlotId !== slotId) return false;
  renderDashboard();
  return true;
}

export function finishDashboardFileDrop() {
  clearSlotDragState();
  return null;
}

export function readImageEditorApi() {
  return appFSM.query("project-api", {
    operation: "images.readEditor", slotId: appFSM.readState().selectedSlotId,
  });
}

export function setAnnotationEnabled(kind, enabled) {
  if (kind === "label")
    appFSM.send("LABEL_SETTINGS_CHANGED", { enabled, direction: "ui-to-fsm" });
  else
    appFSM.send("CAPTION_SETTINGS_CHANGED", { enabled, direction: "ui-to-fsm" });
  renderDashboard();
  debugLog(`annotation:${kind}`, { enabled });
  appFSM.notify(
    kind === "label" ? "labels" : "captions",
    "ANNOTATION_VISIBILITY_CHANGED",
  );
}

export function applyCaptionSettings(notify = true) {
  syncDashboardCaption();
  debugLog("annotation:caption-settings", {
    name: activeProject.captionName,
    bold: activeProject.captionNameBold,
    ...activeProject.captionSettings,
  });
  if (notify) appFSM.notify("captions", "CAPTION_SETTINGS_CHANGED");
}

export function readGlobalCaptionState() {
  return appFSM.query("project-api", { operation: "captions.readGlobal" });
}

export function readSlotCaptionState(slotId) {
  return appFSM.query("project-api", { operation: "captions.readSlot", slotId });
}

export function setCaptionsApiEnabled(enabled) {
  let result = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { enabled });
  if (!result.committed) return false;
  const state = readGlobalCaptionState();
  applyCommittedDashboardProjection("CAPTION_SETTINGS_CHANGED", result);
  debugLog("annotation:caption", { enabled: state.enabled });
  appFSM.notify("captions", "ANNOTATION_VISIBILITY_CHANGED");
  return state;
}

export function setGlobalCaptionText(text) {
  let result = dispatchProjectCommand("CAPTION_TEXT_INPUT", {
    target: { kind: "global" }, text,
  });
  if (!result.committed) return false;
  const state = readGlobalCaptionState();
  syncDashboardCaption(state);
  return state;
}

export function setSlotCaptionText(slotId,text) {
  let result = dispatchProjectCommand("CAPTION_TEXT_INPUT", {
    target: { kind: "slot", id: slotId }, text,
  });
  return result.committed ? readSlotCaptionState(slotId) : false;
}

export function insertCaptionsApiSlotCaptions(slotIds = null) {
  let result = dispatchProjectCommand("SLOT_CAPTIONS_INSERTED", { slotIds });
  if (!result.committed) return false;
  let state = readGlobalCaptionState();
  syncDashboardCaption(state);
  return state;
}

export function setCaptionsApiName(name) {
  let result = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { name });
  if (!result.committed) return false;
  const state = readGlobalCaptionState();
  syncDashboardCaption(state);
  appFSM.notify("captions", "CAPTION_NAME_CHANGED");
  return state;
}

export function setCaptionsApiNameBold(bold) {
  let result = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { nameBold: bold });
  if (!result.committed) return false;
  const state = readGlobalCaptionState();
  syncDashboardCaption(state);
  appFSM.notify("captions", "CAPTION_NAME_WEIGHT_CHANGED");
  return state;
}

export function setCaptionsApiSettings(patch = {}) {
  let result = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { settings: patch });
  if (!result.committed) return false;
  const state = readGlobalCaptionState();
  syncDashboardCaption(state);
  appFSM.notify("captions", "CAPTION_SETTINGS_CHANGED");
  return state;
}

export function readPrintApiSettings() {
  return appFSM.query("project-api", { operation: "print.readSettings" });
}

export function setPrintApiSettings(values={}) {
  let result = dispatchProjectCommand("EXPORT_SETTINGS_CHANGED", { settings: values });
  return result.committed ? readPrintApiSettings() : false;
}

export function savePrintApi(options={}) {
  const snapshot = appFSM.query("export", { operation: "print.save" });
  return exportDashboardTarget(snapshot, options.onStatus);
}

export function capturePrintApi(options={}) {
  const snapshot = appFSM.query("export", { operation: "print.capture" });
  return exportDashboard(snapshot, options.onStatus);
}

export function readLabelsApiState() {
  return appFSM.query("project-api", {
    operation: "labels.readState", slotId: interfaceFSM.readState().selectedSlotId,
  });
}

export function setLabelsApiEnabled(enabled) {
  let result = dispatchProjectCommand("LABEL_SETTINGS_CHANGED", { enabled });
  if (!result.committed) return false;
  applyCommittedDashboardProjection("LABEL_SETTINGS_CHANGED", result);
  debugLog("annotation:label", { enabled });
  appFSM.notify("labels", "ANNOTATION_VISIBILITY_CHANGED");
  return readLabelsApiState();
}

export function setLabelsApiSettings(patch = {}) {
  let result = dispatchProjectCommand("LABEL_SETTINGS_CHANGED", { settings: patch });
  if (!result.committed) return false;
  applyCommittedDashboardProjection("LABEL_SETTINGS_CHANGED", result);
  debugLog("mantine:label-settings", { ...patch });
  appFSM.notify("labels", "LABEL_SETTINGS_CHANGED");
  return readLabelsApiState();
}

export function updateLabelsApiPosition(x, y, eventName = null) {
  let result = dispatchProjectCommand("LABEL_POSITION_CHANGED", { x, y });
  if (!result.committed) return false;
  applyCommittedDashboardProjection("LABEL_POSITION_CHANGED", result);
  if (eventName) {
    debugLog("mantine:label-settings", { x, y });
    appFSM.notify("labels", eventName);
  }
  return readLabelsApiState();
}

export function setLabelsApiPosition(x, y) {
  return updateLabelsApiPosition(x, y, "LABEL_POSITION_CHANGED");
}

export function finishLabelsApiPositionInteraction() {
  debugLog("mantine:label-position", {});
  appFSM.notify("labels","LABEL_POSITION_DRAGGED");
  return readLabelsApiState();
}

export function resetLabelsApiPosition() {
  let result = dispatchProjectCommand("LABEL_POSITION_CHANGED", { reset: true });
  if (!result.committed) return false;
  applyCommittedDashboardProjection("LABEL_POSITION_CHANGED", result);
  appFSM.notify("labels", "LABEL_POSITION_RESET");
  return readLabelsApiState();
}

export function readAppearanceApiPalette() {
  return appFSM.query("project-api", { operation: "appearance.readPalette" });
}

export function setAppearanceApiPalette(values) {
  return applyUiPaletteValues(values);
}

export function resetAppearanceApiPalette() {
  return applyUiPaletteValues({ ...DEFAULT_UI_PALETTE });
}

export function readLayoutApiState(previewWidth = null) {
  const layout = appFSM.query("project-api", { operation: "layout.readState", renderedWidth: previewWidth }),
    session = interfaceFSM.readState();
  return Object.freeze({ ...layout, zoom: session.dashboardZoomIntent, zoomLocked: session.dashboardZoomLocked });
}

export function setLayoutApiStyle(patch = {}) {
  const result = dispatchProjectCommand("LAYOUT_STYLE_CHANGED", patch);
  if (!result.committed) return false;
  applySlotStyle(false);
  applyDashboardZoom(false);
  schedulePlotResize();
  return readLayoutApiState();
}

export function setLayoutApiGrid(rows, cols) {
  const result = dispatchProjectCommand("GRID_LAYOUT_CHANGED", { rows, cols });
  if (!result.committed) return false;
  renderDashboard();
  applySlotStyle(false);
  schedulePlotResize();
  return readLayoutApiState();
}

export function setLayoutApiZoom(value) {
  appFSM.send("SET_DASHBOARD_ZOOM", { value });
  applyDashboardZoom(false);
  return readLayoutApiState();
}

export function commitLayoutApiZoom() {
  renderDashboard();
  appFSM.notify("layout", "DASHBOARD_ZOOM_CHANGED");
  return readLayoutApiState();
}

export function setLayoutApiZoomLocked(locked) {
  const session = interfaceFSM.readState();
  let renderedWidth = null;
  if (locked === true && !session.dashboardZoomLocked) {
    renderedWidth = readDashboardRenderedWidth();
    if (!Number.isFinite(renderedWidth) || renderedWidth <= 0) return false;
  }
  appFSM.send("SET_DASHBOARD_ZOOM_LOCK", { locked: locked === true, renderedWidth });
  applyDashboardZoom(false);
  schedulePlotResize();
  return readLayoutApiState();
}

export function resetLayoutApiZoom() {
  appFSM.send("RESET_DASHBOARD_ZOOM");
  applyDashboardZoom(false);
  schedulePlotResize();
  return readLayoutApiState();
}
