// Source: sourcescript/application/public_api/graphs.py (same logical owner); pseudocode/application/public_api/graphs.pcal.
import { appFSM, dispatchProjectCommand, renderDashboard, updateFileAvailability } from '../adapter.js';
import { prepareCopiedImportFiles, selectProjectCsv } from './assets.js';
import { createEmptyProjectCsv, projectAssetPath } from '../../backend/assets_files.js';
import { interfaceFSM } from '../../frontend/interface_fsm.js';
import { downloadExportPayload, status } from '../../frontend/renderer.js';

export function graphEditorSelectCsv(path) {
  return appFSM.send("SELECT_ASSET", { kind: "csv", path, direction: "ui-to-fsm" });
}

export function createEmptyProjectCsvAndSelect() {
  const csv = createEmptyProjectCsv();
  if (csv?.committed === false) return csv;
  return selectProjectCsv(projectAssetPath(csv));
}

export function graphEditorSelectObject(index) {
  return appFSM.send("SELECT_GRAPH_OBJECT", {
    index, selectedSlotId: interfaceFSM.readState().selectedSlotId,
    selectAsset: true, direction: "ui-to-fsm",
  });
}

export function graphEditorObjectValues(chartId, index, values = {}) {
  const result = dispatchProjectCommand("GRAPH_OBJECTS_REPLACED", {
    chartId, operation: "graphs.setObjectValues", index, values,
  });
  if (!result.committed) return result;
  const chart = appFSM.query("project-api", { operation: "graphs.readData", chartId }).chart;
  renderDashboard();
  return chart;
}

export function setGraphObjectValuesApi(index, values = {}) {
  const context = appFSM.query("project-api", {
    operation: "graphs.readData", frontendState: interfaceFSM.readState(),
  });
  return graphEditorObjectValues(context.chart?.id ?? null, index, values);
}

export function graphEditorAdd(slotId, csvId) {
  const slot = appFSM.query("project-api", { operation: "slots.readSelected", frontendState: { selectedSlotId: slotId } }),
    event = slot?.chart == null ? "SLOT_DATA_CONNECTED" : "GRAPH_OBJECTS_REPLACED",
    result = dispatchProjectCommand(event, { slotId, csvId, operation: "graphs.addObject" });
  if (!result.committed) return result;
  const chart = appFSM.query("project-api", { operation: "graphs.readData", frontendState: { selectedSlotId: slotId } }).chart;
  renderDashboard();
  return chart;
}

export function addGraphObjectApi(csvId) {
  const state = interfaceFSM.readState();
  if (csvId === undefined) csvId = appFSM.query("project-api", {
    operation: "graphs.readData", frontendState: state,
  }).currentCsv?.id;
  return graphEditorAdd(state.selectedSlotId, csvId);
}

export function graphEditorMove(chartId, from, to) {
  const context = appFSM.query("project-api", { operation: "graphs.readData", chartId });
  if (from === to && context.chart?.editor.editable !== false && Number.isInteger(from) &&
      from >= 0 && from < context.objects.length) return context.chart;
  const result = dispatchProjectCommand("GRAPH_OBJECTS_REPLACED", {
    chartId, operation: "graphs.moveObject", from, to,
  });
  if (!result.committed) return result;
  const chart = appFSM.query("project-api", { operation: "graphs.readData", chartId }).chart;
  renderDashboard();
  return chart;
}

export function graphEditorDelete(chartId, index) {
  const result = dispatchProjectCommand("GRAPH_OBJECTS_REPLACED", {
    chartId, operation: "graphs.deleteObject", index,
  });
  if (!result.committed) return result;
  const chart = appFSM.query("project-api", { operation: "graphs.readData", chartId }).chart;
  renderDashboard();
  return chart;
}

export function moveGraphObjectApi(from, to) {
  const context = appFSM.query("project-api", {
    operation: "graphs.readData", frontendState: interfaceFSM.readState(),
  });
  return graphEditorMove(context.chart?.id ?? null, from, to);
}

export function deleteGraphObjectApi(index) {
  const context = appFSM.query("project-api", {
    operation: "graphs.readData", frontendState: interfaceFSM.readState(),
  });
  return graphEditorDelete(context.chart?.id ?? null, index);
}

export function graphEditorHeaderLines(csvId, value) {
  const result = dispatchProjectCommand("DATA_OBJECT_REPLACED", { csvId, headerLines: value });
  if (!result.committed) return result;
  const updated = result.changed.assets.find((asset) => asset.kind === "csv" && asset.role === "updated"),
    read = appFSM.query("project-api", { operation: "assets.readDeletionTarget", path: updated.path });
  renderDashboard();
  return read.target.headerLines;
}

export function graphEditorSetEditable(slotId, chartId, editable) {
  const result = dispatchProjectCommand("CHART_MODEL_REPLACED", { slotId, chartId, editable });
  if (!result.committed) return result;
  const chart = appFSM.query("project-api", { operation: "graphs.readData", chartId }).chart;
  renderDashboard();
  return chart.editor.editable;
}

export function setGraphEditableApi(editable = null) {
  const state = interfaceFSM.readState(),
    context = appFSM.query("project-api", { operation: "graphs.readData", frontendState: state });
  if (!context.chart) return null;
  const next = typeof editable === "boolean" ? editable : context.chart.editor.editable === false;
  return graphEditorSetEditable(state.selectedSlotId, context.chart.id, next);
}

export function readGraphDataApi() {
  const state = interfaceFSM.readState();
  return appFSM.query("project-api", { operation: "graphs.readData", frontendState: {
    selectedSlotId: state.selectedSlotId, assetPath: state.assetPath,
    assetSelection: state.assetSelection, graphObjectIndex: state.graphObjectIndex,
  } });
}

export function readGraphLayoutApi() {
  return appFSM.query("project-api", { operation: "graphs.readLayout", selectedSlotId: interfaceFSM.readState().selectedSlotId });
}

export function readGraphPaletteApi() {
  return appFSM.query("project-api", {
    operation: "graphs.readPalette", selectedSlotId: interfaceFSM.readState().selectedSlotId,
  });
}

export async function importSelectedGraphFile(file, slotId = interfaceFSM.readState().selectedSlotId) {
  const [copied] = await prepareCopiedImportFiles([file]),
    result = dispatchProjectCommand("SLOT_CHART_IMPORTED", { slotId, file: copied });
  if (!result.committed) return result;
  const chart = appFSM.query("project-api", {
    operation: "graphs.readData", frontendState: { selectedSlotId: slotId },
  }).chart;
  renderDashboard(); updateFileAvailability();
  status(`${file.name}을 슬롯에 불러왔습니다.`);
  return chart;
}

export function graphEditorUpdateLayout(slotId, chartId, values) {
  const result = dispatchProjectCommand("CHART_LAYOUT_CHANGED", { slotId, chartId, settings: values });
  if (!result.committed) return result;
  const output = appFSM.query("project-api", { operation: "graphs.readLayout", selectedSlotId: slotId });
  renderDashboard();
  return output;
}

export function updateGraphLayoutApi(values = {}) {
  const slotId = interfaceFSM.readState().selectedSlotId,
    context = appFSM.query("project-api", { operation: "graphs.readLayout", selectedSlotId: slotId });
  return graphEditorUpdateLayout(slotId, context?.chartId ?? null, values);
}

export function graphEditorApplyPalette(chartId, colors) {
  const result = dispatchProjectCommand("GRAPH_OBJECTS_REPLACED", { chartId, operation: "graphs.applyPalette", colors });
  if (!result.committed) return result;
  const chart = appFSM.query("project-api", { operation: "graphs.readData", chartId }).chart;
  renderDashboard();
  return chart;
}

export function applyGraphPaletteApi(colors) {
  const context = appFSM.query("project-api", { operation: "graphs.readData", frontendState: interfaceFSM.readState() });
  return graphEditorApplyPalette(context.chart?.id ?? null, colors);
}

export function downloadSlotFfsx() {
  return appFSM.run("exporting", "graphs.exportFfsx", () =>
    exportSelectedGraph(interfaceFSM.readState().selectedSlotId, "graphs.exportFfsx"));
}

export async function exportSelectedGraph(slotId, operation) {
  const payload = appFSM.query("export", {
    operation, slotId, stamp: new Date().toISOString().replace(/[:.]/g, "-"),
  });
  if (payload === null) return;
  await downloadExportPayload(payload);
}

export function downloadPlotlyJson() {
  return appFSM.run("exporting", "graphs.exportPlotlyJson", () =>
    exportSelectedGraph(interfaceFSM.readState().selectedSlotId, "graphs.exportPlotlyJson"));
}
