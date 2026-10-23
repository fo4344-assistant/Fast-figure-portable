// Source: sourcescript/system.py (same logical owner); pseudocode/system.pcal.
import { appFSM, readWorkspaceHint, renderDashboard, startupCoreRuntime, renderProjectObject } from './application/adapter.js';
import { downloadProject, publishPublicApi } from './application/public_api/index.js';
import { applyImageSettingsFromValues } from './application/public_api/layout_annotations.js';
import { buildProjectObject, ffpxBase64ToBytes, ffpxBytesToBase64, ffpxDataUrlBytes, ffpxReadProject, projectVfs } from './backend/assets_files.js';
import { ALLOWED_AXIS_SIDES, ALLOWED_CHART_TYPES, ALLOWED_LINE_DASHES, ALLOWED_MARKER_SYMBOLS, CURRENT_OBJECT_KEYS, layout, normalizeGlobalSettings, traces } from './backend/graphs.js';
import { normalizeImageSettings } from './backend/layout_annotations.js';
import { ProjectStateMachine, initializeProjectEFSM, projectEFSM } from './backend/project_efsm.js';
import { ProjectObject, ProjectObjectRegistry, activeProject, getProjectCsv, initializeActiveProject, initializeProjectObjects, projectClone, projectObjects, readProjectNumber, validateProjectObject } from './backend/project_state.js';
import { APP_STATE_DEFINITIONS, InterfaceStateMachine, initializeInterfaceFSM, interfaceFSM } from './frontend/interface_fsm.js';
import { mountMantineUi } from './frontend/mantine_ui.js';
import { debugLog } from './frontend/renderer.js';

export const REQUIRED_APP_FUNCTIONS = [
  ["readProjectNumber", () => typeof readProjectNumber === "function"],
  ["importProject", () => typeof importProject === "function"],
  ["ffpxReadProject", () => typeof ffpxReadProject === "function"],
  ["downloadProject", () => typeof downloadProject === "function"],
  ["ffpxDataUrlBytes", () => typeof ffpxDataUrlBytes === "function"],
  ["ffpxBase64ToBytes", () => typeof ffpxBase64ToBytes === "function"],
  ["ffpxBytesToBase64", () => typeof ffpxBytesToBase64 === "function"],
  ["normalizeGlobalSettings", () => typeof normalizeGlobalSettings === "function"],
  ["normalizeImageSettings", () => typeof normalizeImageSettings === "function"],
  ["traces", () => typeof traces === "function"],
  ["layout", () => typeof layout === "function"],
  ["renderDashboard", () => typeof renderDashboard === "function"],
  ["makeSlots", () => typeof makeSlots === "function"],
  ["applyImageSettingsFromValues", () => typeof applyImageSettingsFromValues === "function"],
  ["projectClone", () => typeof projectClone === "function"],
  ["ProjectObject", () => activeProject instanceof ProjectObject],
  ["buildProjectObject", () => typeof buildProjectObject === "function"],
  ["validateProjectObject", () => typeof validateProjectObject === "function"],
  ["renderProjectObject", () => typeof renderProjectObject === "function"],
  ["projectObjects", () => projectObjects instanceof ProjectObjectRegistry],
  ["interfaceFSM", () => interfaceFSM instanceof InterfaceStateMachine],
  ["projectEFSM", () => projectEFSM instanceof ProjectStateMachine],
  ["auditApp", () => typeof auditApp === "function"],
];

export function auditObject(object, chartId, index, issues, allowNoCsv = false) {
  if (!object || typeof object !== "object") {
    issues.push({ kind: "invalid-object", chartId, index, value: object });
    return;
  }
  let keys = Object.keys(object),
    unknown = keys.filter((key) => !CURRENT_OBJECT_KEYS.has(key));
  if (unknown.length)
    issues.push({ kind: "unknown-object-keys", chartId, index, keys: unknown });
  if (typeof object.x !== "string" || typeof object.y !== "string")
    issues.push({ kind: "invalid-object-columns", chartId, index, x: object.x, y: object.y });
  if (!allowNoCsv && (!Number.isInteger(object.csvId) || !getProjectCsv(object.csvId)))
    issues.push({ kind: "orphan-object-csv", chartId, index, csvId: object.csvId });
  if (!ALLOWED_CHART_TYPES.has(object.type))
    issues.push({ kind: "invalid-chart-type", chartId, index, value: object.type });
  if (!ALLOWED_AXIS_SIDES.x.has(object.xAxisSide))
    issues.push({ kind: "invalid-x-axis-side", chartId, index, value: object.xAxisSide });
  if (!ALLOWED_AXIS_SIDES.y.has(object.yAxisSide))
    issues.push({ kind: "invalid-y-axis-side", chartId, index, value: object.yAxisSide });
  if (!ALLOWED_LINE_DASHES.has(object.lineDash || "solid"))
    issues.push({ kind: "invalid-line-dash", chartId, index, value: object.lineDash });
  if (!ALLOWED_MARKER_SYMBOLS.has(object.markerSymbol || "circle"))
    issues.push({
      kind: "invalid-marker-symbol",
      chartId,
      index,
      value: object.markerSymbol,
    });
  [
    ["lineWidth", 0.1, 20],
    ["markerSize", 1, 40],
    ["barOpacity", 0.05, 1],
    ["barLineWidth", 0, 10],
  ].forEach(([key, min, max]) => {
    let value = Number(object[key]);
    if (!Number.isFinite(value) || value < min || value > max)
      issues.push({
        kind: "invalid-numeric-value",
        chartId,
        index,
        key,
        value: object[key],
        min,
        max,
      });
  });
}

export function auditApp(context = "manual") {
  let issues = [],
    ids = [...document.querySelectorAll("[id]")].map((node) => node.id),
    duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
    missingControls = ["dashboard", "dashboardCaption", "graphArea", "readmeContent"].filter(
      (id) => !document.getElementById(id),
    ),
    missingFunctions = REQUIRED_APP_FUNCTIONS.filter(([, check]) => !check()).map(
      ([name]) => name,
    );
  if (missingFunctions.length)
    issues.push({ kind: "missing-functions", names: missingFunctions });
  if (duplicates.length) issues.push({ kind: "duplicate-controls", ids: duplicates });
  if (missingControls.length) issues.push({ kind: "missing-controls", ids: missingControls });
  if (!["booting", "ready", "importing", "exporting", "error"].includes(appFSM.state.lifecycle))
    issues.push({ kind: "invalid-fsm-lifecycle", lifecycle: appFSM.state.lifecycle });
  if (!["project", "slot.graph", "slot.image"].includes(appFSM.state.workspace))
    issues.push({ kind: "invalid-fsm-workspace", workspace: appFSM.state.workspace });
  if (!["none", "layout", "label", "caption", "print", "readme"].includes(appFSM.state.overlay))
    issues.push({ kind: "invalid-fsm-overlay", overlay: appFSM.state.overlay });
  if (
    !["fsm-to-model", "model-to-fsm", "model-to-ui"].includes(
      appFSM.state.direction,
    )
  )
    issues.push({
      kind: "invalid-fsm-direction",
      direction: appFSM.state.direction,
    });
  if (appFSM.state.lifecycle === "ready" && appFSM.writeLocks.size)
    issues.push({
      kind: "fsm-write-lock-leak",
      locks: [...appFSM.writeLocks],
    });
  let derivedWorkspace = readWorkspaceHint();
  if (appFSM.state.workspace !== derivedWorkspace)
    issues.push({
      kind: "fsm-workspace-out-of-sync",
      state: appFSM.state,
      derived: derivedWorkspace,
    });
  for (let region of ["lifecycle", "workspace", "overlay"]) {
    let definition = appFSM.definition(region);
    (definition.objects || []).forEach((name) => {
      try {
        projectObjects.read(name);
      } catch (error) {
        issues.push({
          kind: "fsm-object-unavailable",
          region,
          state: appFSM.state[region],
          object: name,
          message: error.message,
        });
      }
    });
  }
  for (let state of ["project", "slot.graph", "slot.image"]) {
    let names = APP_STATE_DEFINITIONS.workspace[state].objects || [],
      missing = ["data", "images", "charts", "slots"].filter(
        (name) => !names.includes(name),
      );
    if (missing.length)
      issues.push({
        kind: "fsm-data-tree-objects-missing",
        state,
        missing,
      });
  }
  try {
    validateProjectObject(activeProject, { requireSlots: true });
  } catch (error) {
    issues.push({
      kind: "invalid-project-object",
      message: error.message,
    });
  }
  let selectedPathAsset = appFSM.state.assetPath
    ? projectVfs.resolve(appFSM.state.assetPath)
    : null;
  if (
    (appFSM.state.assetSelection === "none") !== (selectedPathAsset === null) ||
    (selectedPathAsset && selectedPathAsset.kind !== appFSM.state.assetSelection)
  )
    issues.push({
      kind: "fsm-asset-path-out-of-sync",
      selection: appFSM.state.assetSelection,
      path: appFSM.state.assetPath,
    });
  if (typeof activeProject.captionAfterText !== "string")
    issues.push({
      kind: "invalid-caption-after-text",
      value: activeProject.captionAfterText,
    });
  document.querySelectorAll("select[id]").forEach((select) => {
    if (select.value && ![...select.options].some((option) => option.value === select.value))
      issues.push({ kind: "invalid-select-value", id: select.id, value: select.value });
  });
  let csvIds = new Set();
  activeProject.csvFiles.forEach((csv, index) => {
    if (
      !csv ||
      !Number.isInteger(csv.id) ||
      csvIds.has(csv.id) ||
      Object.prototype.hasOwnProperty.call(csv, "path") ||
      typeof csv.name !== "string" ||
      typeof csv.directory !== "string" ||
      !Array.isArray(csv.rows) ||
      typeof csv.bytesBase64 !== "string" ||
      !Number.isInteger(csv.headerLines)
    )
      issues.push({ kind: "invalid-project-csv", index, id: csv?.id });
    else csvIds.add(csv.id);
  });
  let imageIds = new Set();
  activeProject.images.forEach((image, index) => {
    if (
      !image ||
      !Number.isInteger(image.id) ||
      imageIds.has(image.id) ||
      Object.prototype.hasOwnProperty.call(image, "path") ||
      typeof image.name !== "string" ||
      typeof image.directory !== "string" ||
      typeof image.mime !== "string" ||
      typeof image.bytesBase64 !== "string" ||
      !image.bytesBase64
    )
      issues.push({ kind: "invalid-project-image", index, id: image?.id });
    else imageIds.add(image.id);
  });
  let chartIds = new Set();
  activeProject.charts.forEach((chart, index) => {
    if (!chart || typeof chart !== "object") {
      issues.push({ kind: "invalid-chart", index, value: chart });
      return;
    }
    if (!Number.isInteger(chart.id) || chartIds.has(chart.id))
      issues.push({ kind: "invalid-or-duplicate-chart-id", index, id: chart.id });
    chartIds.add(chart.id);
    if (!chart.editor || !Array.isArray(chart.editor.objects))
      issues.push({ kind: "missing-object-array", chartId: chart.id });
    else
      chart.editor.objects.forEach((object, objectIndex) =>
        auditObject(
          object,
          chart.id,
          objectIndex,
          issues,
          chart.editor.editable === false,
        ),
      );
  });
  activeProject.slots.forEach((slot, index) => {
    if (!slot || typeof slot !== "object") issues.push({ kind: "invalid-slot", index });
    else {
      if (slot.chart !== null && slot.chart !== undefined && !chartIds.has(slot.chart))
        issues.push({ kind: "orphan-slot-chart", slotId: slot.id, chart: slot.chart });
      if (slot.imageId !== null && slot.imageId !== undefined && !imageIds.has(slot.imageId))
        issues.push({ kind: "orphan-slot-image", slotId: slot.id, imageId: slot.imageId });
      if (slot.caption !== null && typeof slot.caption !== "string")
        issues.push({
          kind: "invalid-slot-caption",
          slotId: slot.id,
          caption: slot.caption,
        });
    }
  });
  let summary = {
    context,
    build: projectObjects.read("project").appBuild,
    controls: ids.length,
    csvFiles: activeProject.csvFiles.length,
    images: activeProject.images.length,
    charts: activeProject.charts.length,
    slots: activeProject.slots.length,
    issues: issues.length,
  };
  debugLog("audit:summary", summary, issues.length ? "warn" : "info");
  issues.forEach((issue) => debugLog("audit:issue", issue, "warn"));
  return { summary, issues };
}



export function initializeFastFigure() {
  initializeActiveProject();
  initializeProjectObjects();
  initializeInterfaceFSM();
  initializeProjectEFSM();
  publishPublicApi();
window.addEventListener("error", (event) =>
  debugLog("window:error", {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
  }),
);

window.addEventListener("unhandledrejection", (event) =>
  debugLog("window:unhandledrejection", {
    message: event.reason?.message || String(event.reason),
  }),
);

debugLog("app:init", {
  build: projectObjects.read("project").appBuild,
  userAgent: navigator.userAgent,
  location: location.href,
});

startupCoreRuntime();

appFSM.ready();

debugLog(
  "app:init-complete",
  {
    slots: activeProject.slots.length,
    charts: activeProject.charts.length,
    build: projectObjects.read("project").appBuild,
  },
  "info",
);

auditApp("app:init");
  mountMantineUi();
}
initializeFastFigure();
