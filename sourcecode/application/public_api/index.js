// Source: sourcescript/application/public_api/__init__.py; pseudocode/application/public_api/contract.pcal.
// Public API composition; domain operations are implemented in the sibling modules.
import { appFSM, dispatchProjectCommand, renderDashboard, renderProjectObject } from '../adapter.js';
import { connectProjectAssetPathToSlot, createProjectDirectory, deleteProjectAsset, downloadProjectAsset, draggableProjectAsset, emptyProjectTrash, importProjectAssetFiles, importProjectFileToSlot, importProjectFilesToDirectory, moveProjectNode, prepareCopiedImportFiles, projectDataTreeObjects, projectNodeMoveOptions, readAssetCollisionModel, readAssetDeletionTarget, readAssetFileKind, readAssetImportPlan, readProjectTrash, selectDirectoryFromTree, selectImageFromTree, selectProjectCsv } from './assets.js';
import { addGraphObjectApi, applyGraphPaletteApi, createEmptyProjectCsvAndSelect, deleteGraphObjectApi, downloadPlotlyJson, downloadSlotFfsx, graphEditorHeaderLines, graphEditorSelectCsv, graphEditorSelectObject, importSelectedGraphFile, moveGraphObjectApi, readGraphDataApi, readGraphLayoutApi, readGraphPaletteApi, setGraphEditableApi, setGraphObjectValuesApi, updateGraphLayoutApi } from './graphs.js';
import { applyImageSettingsFromValues, capturePrintApi, commitLayoutApiZoom, finishDashboardFileDrop, finishLabelsApiPositionInteraction, insertCaptionsApiSlotCaptions, insertEmptyImageIntoSelectedSlot, mergeSlots, prepareDashboardFileDrop, readAppearanceApiPalette, readGlobalCaptionState, readImageEditorApi, readLabelsApiState, readLayoutApiState, readPrintApiSettings, readSelectedSlotApi, readSlotCaptionState, resetAppearanceApiPalette, resetLabelsApiPosition, resetLayoutApiZoom, resetSlotApi, savePrintApi, setAppearanceApiPalette, setCaptionsApiEnabled, setCaptionsApiName, setCaptionsApiNameBold, setCaptionsApiSettings, setGlobalCaptionText, setLabelsApiEnabled, setLabelsApiPosition, setLabelsApiSettings, setLayoutApiGrid, setLayoutApiStyle, setLayoutApiZoom, setLayoutApiZoomLocked, setPrintApiSettings, setSelectedSlot, setSlotCaptionText, setSlotContentType, splitSlots, swapSlots } from './layout_annotations.js';
import { movableProjectNode, planProjectNodeMove, projectDataTreeSnapshot, projectVfs } from '../../backend/assets_files.js';
import { DEFAULT_COLORS } from '../../backend/settings.js';
import { interfaceFSM } from '../../frontend/interface_fsm.js';
import { downloadExportPayload, status } from '../../frontend/renderer.js';

export function importProjectFile(file) {
  return appFSM.run("importing", "project.importFile", async () => {
    const [copied] = await prepareCopiedImportFiles([file]),
      result = dispatchProjectCommand("PROJECT_LOADED", { file: copied });
    if (!result.committed) return result;
    const snapshot = appFSM.query("export", {});
    renderProjectObject(); renderDashboard();
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
  const result = dispatchProjectCommand("PROJECT_NAME_CHANGED", { value, trim });
  if (!result.committed) return null;
  return appFSM.query("project-api", { operation: "project.readName" });
}

export function publishPublicApi() {
window.FastFigureApi = Object.freeze({
  project: Object.freeze({
    readName: () => appFSM.query("project-api", { operation: "project.readName" }),
    setName: setProjectName,
    importFile: importProjectFile,
    exportFile: downloadProject,
  }),
  slots: Object.freeze({
    readSelected: readSelectedSlotApi,
    select: setSelectedSlot,
    setContentType: setSlotContentType,
    reset: resetSlotApi,
    swap: swapSlots,
    prepareFileDrop: prepareDashboardFileDrop,
    finishFileDrop: finishDashboardFileDrop,
  }),
  images: Object.freeze({
    readEditor: readImageEditorApi,
    setSettings: (values) => applyImageSettingsFromValues(appFSM.readState().selectedSlotId, values),
    insertEmpty: insertEmptyImageIntoSelectedSlot,
  }),
  assets: Object.freeze({
    readDeletionTarget: readAssetDeletionTarget,
    delete: deleteProjectAsset,
    readTree: () => projectDataTreeSnapshot(projectDataTreeObjects()),
    isTrashed: (path) => projectVfs.isTrashed(path),
    movable: movableProjectNode,
    readTrash: readProjectTrash,
    moveOptions: projectNodeMoveOptions,
    planMove: planProjectNodeMove,
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
    download: downloadProjectAsset,
  }),
  graphs: Object.freeze({
    readData: readGraphDataApi,
    readLayout: readGraphLayoutApi,
    readPalette: readGraphPaletteApi,
    selectCsv: graphEditorSelectCsv,
    setHeaderLines: graphEditorHeaderLines,
    setEditable: setGraphEditableApi,
    addObject: addGraphObjectApi,
    moveObject: moveGraphObjectApi,
    selectObject: graphEditorSelectObject,
    setObjectValues: setGraphObjectValuesApi,
    deleteObject: deleteGraphObjectApi,
    updateLayout: updateGraphLayoutApi,
    applyPalette: applyGraphPaletteApi,
    defaultColors: () => [...DEFAULT_COLORS],
    hasSelectedSlot: () => !!readSelectedSlotApi(),
    importFile: (...args) => appFSM.run("importing", "graphs.importFile", () =>
      importSelectedGraphFile(...args)),
    exportFfsx: downloadSlotFfsx,
    exportPlotlyJson: downloadPlotlyJson,
  }),
  print: Object.freeze({
    readSettings: readPrintApiSettings,
    setSettings: setPrintApiSettings,
    save: savePrintApi,
    capture: capturePrintApi,
  }),
  captions: Object.freeze({
    readGlobal: readGlobalCaptionState,
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
    setStyle: setLayoutApiStyle,
    setGrid: setLayoutApiGrid,
    setZoom: setLayoutApiZoom,
    commitZoom: commitLayoutApiZoom,
    setZoomLocked: setLayoutApiZoomLocked,
    resetZoom: resetLayoutApiZoom,
    mergeSlots,
    splitSlots,
  }),
});
}
