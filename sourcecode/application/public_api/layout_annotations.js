// Source: sourcescript/application/public_api/layout_annotations.py (same logical owner); pseudocode/application/public_api/layout_annotations.pcal.
import { appFSM, dispatchProjectCommand, dispatchSlotSelection, transformWorkspace, applyUiPaletteValues } from '../adapter.js';
import { activeProject } from '../../backend/project_state.js';
import { DEFAULT_UI_PALETTE } from '../../backend/settings.js';
import { interfaceFSM } from '../../frontend/interface_fsm.js';
import { clearSlotDragState, debugLog, exportDashboard, exportDashboardTarget } from '../../frontend/renderer.js';

export function swapSlots(sourceSlotId, targetSlotId) {
  const [result, frontendState, projection] = dispatchProjectCommand("SLOTS_SWAPPED", { sourceSlotId, targetSlotId });

  return result.committed;
}

export function setSelectedSlot(slotId, direction = "ui-to-fsm", pendingContentType = null) {
  const [state] = dispatchSlotSelection(slotId, pendingContentType, direction);
  return state;
}

export function mergeSlots(slotIds=[]) {
  const [result, frontendState, projection] = dispatchProjectCommand("SLOTS_MERGED", { slotIds });
  if (!result.committed) return false;

  return readLayoutApiState();
}

export function splitSlots(slotIds=[]) {
  const [result, frontendState, projection] = dispatchProjectCommand("SLOTS_SPLIT", { slotIds });
  if (!result.committed) return false;

  return readLayoutApiState();
}

export function insertEmptyImageIntoSelectedSlot() {
  const slotId = interfaceFSM.readState().selectedSlotId,
    context = appFSM.query("slot-selection-context", { slotId });
  if (!context || context.contentType !== "image") return null;
  const imageInput = { bytes: new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"></svg>'),
    name: "빈 이미지.svg", mime: "image/svg+xml" },
    [result, frontendState, projection] = dispatchProjectCommand("SLOT_IMAGE_IMPORTED", { slotId, operation: "images.insertEmpty", imageInput });
  if (!result.committed) return null;
  const path = result.changed.assets.find(asset => asset.role === "created" && asset.kind === "image").path,
    target = appFSM.query("project-api", { operation: "assets.readDeletionTarget", path }).target;

  return target;
}

export function setSlotContentType(slotId, contentType) {
  const [result, frontendState, projection] = dispatchProjectCommand("SLOT_TYPE_CHANGED", { slotId, contentType });

  return null;
}

export function applyImageSettingsFromValues(slotId, values={}) {
  if (!appFSM.query("project-api", { operation: "images.readEditor", slotId })) return false;
  let [result, frontendState, projection] = dispatchProjectCommand("SLOT_IMAGE_SETTINGS_CHANGED", { slotId, settings: values });
  if (!result.committed) return false;

  appFSM.notify("images","IMAGE_SETTINGS_CHANGED");
  return appFSM.query("project-api", { operation: "images.readEditor", slotId });
}

export function readSelectedSlotApi() {
  return appFSM.query("project-api", {
    operation: "slots.readSelected", frontendState: interfaceFSM.readState(),
  });
}

export function resetSlotApi(slotId) {
  const [result, frontendState, projection] = dispatchProjectCommand("SLOTS_RESET", { slotIds: [slotId] });

  return null;
}

export function prepareDashboardFileDrop(slotId) {
  const context = appFSM.query("slot-selection-context", { slotId });
  if (!context) return false;
  if (interfaceFSM.readState().selectedSlotId === slotId) return true;
  const [state, , projection] = dispatchSlotSelection(slotId, null, "model-to-fsm");
  if (projection === null || state.selectedSlotId !== slotId) return false;

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

  debugLog(`annotation:${kind}`, { enabled });
  appFSM.notify(
    kind === "label" ? "labels" : "captions",
    "ANNOTATION_VISIBILITY_CHANGED",
  );
}

export function applyCaptionSettings(notify = true) {

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
  let [result, frontendState, projection] = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { enabled });
  if (!result.committed) return false;
  const state = readGlobalCaptionState();

  debugLog("annotation:caption", { enabled: state.enabled });
  appFSM.notify("captions", "ANNOTATION_VISIBILITY_CHANGED");
  return state;
}

export function setGlobalCaptionText(text) {
  let [result, frontendState, projection] = dispatchProjectCommand("CAPTION_TEXT_INPUT", {
    target: { kind: "global" }, text,
  });
  if (!result.committed) return false;
  const state = readGlobalCaptionState();

  return state;
}

export function setSlotCaptionText(slotId,text) {
  let [result] = dispatchProjectCommand("CAPTION_TEXT_INPUT", {
    target: { kind: "slot", id: slotId }, text,
  });
  return result.committed ? readSlotCaptionState(slotId) : false;
}

export function insertCaptionsApiSlotCaptions(slotIds = null) {
  let [result, frontendState, projection] = dispatchProjectCommand("SLOT_CAPTIONS_INSERTED", { slotIds });
  if (!result.committed) return false;
  let state = readGlobalCaptionState();

  return state;
}

export function setCaptionsApiName(name) {
  let [result, frontendState, projection] = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { name });
  if (!result.committed) return false;
  const state = readGlobalCaptionState();

  appFSM.notify("captions", "CAPTION_NAME_CHANGED");
  return state;
}

export function setCaptionsApiNameBold(bold) {
  let [result, frontendState, projection] = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { nameBold: bold });
  if (!result.committed) return false;
  const state = readGlobalCaptionState();

  appFSM.notify("captions", "CAPTION_NAME_WEIGHT_CHANGED");
  return state;
}

export function setCaptionsApiSettings(patch = {}) {
  let [result, frontendState, projection] = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { settings: patch });
  if (!result.committed) return false;
  const state = readGlobalCaptionState();

  appFSM.notify("captions", "CAPTION_SETTINGS_CHANGED");
  return state;
}

export function readPrintApiSettings() {
  return appFSM.query("project-api", { operation: "print.readSettings" });
}

export function setPrintApiSettings(values={}) {
  let [result] = dispatchProjectCommand("EXPORT_SETTINGS_CHANGED", { settings: values });
  return result.committed ? readPrintApiSettings() : false;
}

export function savePrintApi(options={}) {
  return appFSM.run("exporting", "print.save", () => {
    const snapshot = appFSM.query("export", { operation: "print.save" });
    return exportDashboardTarget(snapshot, options.onStatus);
  });
}

export function capturePrintApi(options={}) {
  return appFSM.run("exporting", "print.capture", () => {
    const snapshot = appFSM.query("export", { operation: "print.capture" });
    return exportDashboard(snapshot, options.onStatus);
  });
}

export function readLabelsApiState() {
  return appFSM.query("project-api", {
    operation: "labels.readState", slotId: interfaceFSM.readState().selectedSlotId,
  });
}

export function setLabelsApiEnabled(enabled) {
  let [result, frontendState, projection] = dispatchProjectCommand("LABEL_SETTINGS_CHANGED", { enabled });
  if (!result.committed) return false;

  debugLog("annotation:label", { enabled });
  appFSM.notify("labels", "ANNOTATION_VISIBILITY_CHANGED");
  return readLabelsApiState();
}

export function setLabelsApiSettings(patch = {}) {
  let [result, frontendState, projection] = dispatchProjectCommand("LABEL_SETTINGS_CHANGED", { settings: patch });
  if (!result.committed) return false;

  debugLog("mantine:label-settings", { ...patch });
  appFSM.notify("labels", "LABEL_SETTINGS_CHANGED");
  return readLabelsApiState();
}

export function updateLabelsApiPosition(x, y, eventName = null) {
  let [result, frontendState, projection] = dispatchProjectCommand("LABEL_POSITION_CHANGED", { x, y });
  if (!result.committed) return false;

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
  let [result, frontendState, projection] = dispatchProjectCommand("LABEL_POSITION_CHANGED", { reset: true });
  if (!result.committed) return false;

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
  return Object.freeze({ ...layout, zoom: session.dashboardZoomIntent });
}

export function setLayoutApiStyle(patch = {}) {
  const [result, frontendState, projection] = dispatchProjectCommand("LAYOUT_STYLE_CHANGED", patch);
  if (!result.committed) return false;

  appFSM.notify("layout", "LAYOUT_STYLE_CHANGED");
  return readLayoutApiState();
}

export function setLayoutApiGrid(rows, cols) {
  const [result, frontendState, projection] = dispatchProjectCommand("GRID_LAYOUT_CHANGED", { rows, cols });
  if (!result.committed) return false;

  appFSM.notify("layout", "LAYOUT_STYLE_CHANGED");
  return readLayoutApiState();
}

export function setLayoutApiZoom(value) {
  const session = interfaceFSM.readState();
  const state = appFSM.send("SET_DASHBOARD_ZOOM", { value });
  if (state.revision !== session.revision) transformWorkspace();
  return readLayoutApiState();
}

export function commitLayoutApiZoom() {
  appFSM.notify("layout", "DASHBOARD_ZOOM_CHANGED");
  return readLayoutApiState();
}

export function resetLayoutApiZoom() {
  const session = interfaceFSM.readState();
  const state = appFSM.send("RESET_DASHBOARD_ZOOM");
  if (state.revision !== session.revision) transformWorkspace();
  return readLayoutApiState();
}
