// Source: sourcescript/application/public_api/__init__.py; pseudocode/application/public_api/contract.pcal.
// Public API composition; domain operations are implemented in the sibling modules.
import { appFSM, dispatchProjectCommand, renderProjectObject, renderWholeWorkspace } from '../adapter.js';
import { connectProjectAssetPathToSlot, createProjectDirectory, deleteProjectAsset, downloadProjectAsset, draggableProjectAsset, emptyProjectTrash, importProjectAssetFiles, importProjectFileToSlot, importProjectFilesToDirectory, moveProjectNode, prepareCopiedImportFiles, projectNodeMoveOptions, readAssetCollisionModel, readAssetDeletionTarget, readAssetFileKind, readAssetImportPlan, readProjectTrash, selectDirectoryFromTree, selectImageFromTree, selectProjectCsv } from './assets.js';
import { createEmptyProjectCsvAndSelect, downloadPlotlyJson, downloadSlotFfsx, graphEditorAdd, graphEditorApplyPalette, graphEditorDelete, graphEditorHeaderLines, graphEditorMove, graphEditorObjectValues, graphEditorSelectCsv, graphEditorSelectObject, graphEditorSetEditable, graphEditorUpdateLayout, importSelectedGraphFile, readGraphDataApi, readGraphLayoutApi, readGraphPaletteApi } from './graphs.js';
import { applyImageSettingsFromValues, capturePrintApi, commitLayoutApiZoom, finishDashboardFileDrop, finishLabelsApiPositionInteraction, insertCaptionsApiSlotCaptions, insertEmptyImageIntoSelectedSlot, mergeSlots, prepareDashboardFileDrop, readAppearanceApiPalette, readGlobalCaptionState, readImageEditorApi, readLabelsApiState, readLayoutApiControls, readLayoutApiState, readPrintApiSettings, readSelectedSlotApi, readSlotCaptionState, resetAppearanceApiPalette, resetLabelsApiPosition, resetLayoutApiZoom, resetSlotApi, savePrintApi, setAppearanceApiPalette, setCaptionsApiEnabled, setCaptionsApiName, setCaptionsApiNameBold, setCaptionsApiSettings, setGlobalCaptionText, setLabelsApiEnabled, setLabelsApiPosition, setLabelsApiSettings, setLayoutApiGrid, setLayoutApiStyle, setLayoutApiZoom, setPrintApiSettings, setSelectedSlot, setSlotCaptionText, setSlotContentType, splitSlots, swapSlots } from './layout_annotations.js';
import { interfaceFSM } from '../../frontend/interface_fsm.js';
import { downloadExportPayload, status } from '../../frontend/renderer.js';

export function importProjectFile(file) {
  return appFSM.run("importing", "project.importFile", async () => {
    const [copied] = await prepareCopiedImportFiles([file]),
      [result, state, projection] = dispatchProjectCommand("PROJECT_LOADED", { file: copied });
    if (!result.committed) return result;
    const snapshot = appFSM.query("export", {});
    renderProjectObject(projection, state);
    appFSM.send("CLOSE_OVERLAY", { reason: "project-loaded" });
    status(`${file.name} 프로젝트를 불러왔습니다.`);
    return snapshot;
  });
}

export function downloadProject() {
  return appFSM.run("exporting", "project.exportFile", async () => {
    if (interfaceFSM.readState().selectedSlotId !== null) {
      status("프로젝트 내보내기는 슬롯 선택을 해제한 뒤 사용할 수 있습니다.");
      return;
    }
    const payload = appFSM.query("export", {
      operation: "project.exportFile", stamp: new Date().toISOString().replace(/[:.]/g, "-"),
    });
    await downloadExportPayload(payload);
  });
}

export function setProjectName(value, trim = false) {
  const [result] = dispatchProjectCommand("PROJECT_NAME_CHANGED", { value, trim });
  if (!result.committed) return null;
  return appFSM.query("project-api", { operation: "project.readName" });
}

export function createPublicApi() {
return Object.freeze({
  workspace: Object.freeze({ render: renderWholeWorkspace }),
  project: Object.freeze({
    readName: () => appFSM.query("project-api", { operation: "project.readName" }),
    setName: setProjectName,
    importFile: importProjectFile,
    exportFile: downloadProject,
  }),
  slots: Object.freeze({
    readSelected: readSelectedSlotApi,
    readDisplay: () => appFSM.query("project-api", { operation: "slots.readDisplay" }),
    select: (slotId, pendingContentType = null, direction = "ui-to-fsm") =>
      setSelectedSlot(slotId, direction, pendingContentType),
    setContentType: setSlotContentType,
    reset: resetSlotApi,
    swap: swapSlots,
    prepareFileDrop: prepareDashboardFileDrop,
    finishFileDrop: finishDashboardFileDrop,
  }),
  images: Object.freeze({
    readEditor: readImageEditorApi,
    readSettings: () => appFSM.query("project-api", { operation: "images.readSettings", slotId: interfaceFSM.readState().selectedSlotId }),
    setSettings: applyImageSettingsFromValues,
    insertEmpty: insertEmptyImageIntoSelectedSlot,
  }),
  assets: Object.freeze({
    readDeletionTarget: readAssetDeletionTarget,
    readList: kind => appFSM.query("project-api", { operation: "assets.readList", kind }),
    readPreview: (csvId, start = 0, count = 30) => appFSM.query("project-api", { operation: "assets.readPreview", csvId, start, count }),
    delete: deleteProjectAsset,
    readTree: () => appFSM.query("project-api", { operation: "assets.readTree" }),
    isTrashed: (path) => appFSM.query("project-api", { operation: "assets.isTrashed", path }),
    movable: (path) => appFSM.query("project-api", { operation: "assets.movable", path }),
    readTrash: readProjectTrash,
    moveOptions: projectNodeMoveOptions,
    planMove: (path, directory) => appFSM.query("project-api", { operation: "assets.planMove", path, directory }),
    move: moveProjectNode,
    createDirectory: createProjectDirectory,
    createEmptyCsv: createEmptyProjectCsvAndSelect,
    emptyTrash: emptyProjectTrash,
    draggableAsset: draggableProjectAsset,
    connectToSlot: connectProjectAssetPathToSlot,
    importToDirectory: (...args) => appFSM.run("importing", "assets.importToDirectory", () =>
      importProjectFilesToDirectory(...args)),
    importToSlot: (...args) => appFSM.run("importing", "assets.importToSlot", () =>
      importProjectFileToSlot(...args)),
    fileKind: readAssetFileKind,
    importFiles: importProjectAssetFiles,
    collisionModel: readAssetCollisionModel,
    resolveImportPlan: readAssetImportPlan,
    selectDirectory: selectDirectoryFromTree,
    selectCsv: selectProjectCsv,
    selectImage: selectImageFromTree,
    download: path => downloadProjectAsset(path === undefined ? interfaceFSM.readState().assetPath : path),
  }),
  graphs: Object.freeze({
    readData: readGraphDataApi,
    readControls: (csvId = null) => appFSM.query("project-api", { operation: "graphs.readControls", csvId, frontendState: interfaceFSM.readState() }),
    readColumns: (csvId, chartId = null) => appFSM.query("project-api", { operation: "graphs.readColumns", csvId, chartId }),
    readLayout: readGraphLayoutApi,
    readPalette: readGraphPaletteApi,
    selectCsv: graphEditorSelectCsv,
    setHeaderLines: graphEditorHeaderLines,
    setEditable: graphEditorSetEditable,
    addObject: graphEditorAdd,
    moveObject: graphEditorMove,
    selectObject: graphEditorSelectObject,
    setObjectValues: graphEditorObjectValues,
    deleteObject: graphEditorDelete,
    updateLayout: graphEditorUpdateLayout,
    applyPalette: graphEditorApplyPalette,
    defaultColors: () => appFSM.query("project-api", { operation: "graphs.defaultColors" }),
    hasSelectedSlot: () => appFSM.query("project-api", {
      operation: "graphs.hasSelectedSlot", selectedSlotId: interfaceFSM.readState().selectedSlotId,
    }),
    importFile: (slotId, file) => appFSM.run("importing", "graphs.importFile", () =>
      importSelectedGraphFile(file, slotId)),
    exportFfsx: downloadSlotFfsx,
    exportPlotlyJson: downloadPlotlyJson,
  }),
  print: Object.freeze({
    readSettings: readPrintApiSettings,
    setSettings: setPrintApiSettings,
    save: (statusSink) => savePrintApi({ onStatus: statusSink }),
    capture: (statusSink) => capturePrintApi({ onStatus: statusSink }),
  }),
  captions: Object.freeze({
    readGlobal: readGlobalCaptionState,
    readSettings: () => appFSM.query("project-api", { operation: "captions.readSettings" }),
    readSlot: readSlotCaptionState,
    setEnabled: setCaptionsApiEnabled,
    setGlobalText: setGlobalCaptionText,
    setSlotText: setSlotCaptionText,
    insertSlotCaptions: insertCaptionsApiSlotCaptions,
    setName: setCaptionsApiName,
    setNameBold: setCaptionsApiNameBold,
    setSettings: setCaptionsApiSettings,
  }),
  labels: Object.freeze({
    readState: readLabelsApiState,
    readSettings: () => appFSM.query("project-api", { operation: "labels.readSettings", slotId: interfaceFSM.readState().selectedSlotId }),
    setEnabled: setLabelsApiEnabled,
    setSettings: setLabelsApiSettings,
    setPosition: setLabelsApiPosition,
    finishPositionInteraction: finishLabelsApiPositionInteraction,
    resetPosition: resetLabelsApiPosition,
  }),
  appearance: Object.freeze({
    readPalette: readAppearanceApiPalette,
    setPalette: setAppearanceApiPalette,
    resetPalette: resetAppearanceApiPalette,
  }),
  layout: Object.freeze({
    readState: readLayoutApiState,
    readControls: readLayoutApiControls,
    setStyle: setLayoutApiStyle,
    setGrid: setLayoutApiGrid,
    setZoom: setLayoutApiZoom,
    commitZoom: commitLayoutApiZoom,
    resetZoom: resetLayoutApiZoom,
    mergeSlots,
    splitSlots,
  }),
});
}

export function publishPublicApi() {
  const api = createPublicApi();
  window.FastFigureApi = api;
  return api;
}
