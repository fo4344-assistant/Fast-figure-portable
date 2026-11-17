// Source: sourcescript/backend/project_state.py (same logical owner); pseudocode/backend/project_state.pcal.
import { fillMissingSettingRecord, buildProjectObject, collectAssetReferences, ffpxBase64ToBytes, ffpxBuildProject, ffsxBuildSlot, normalizeProjectPath, planProjectNodeMove, projectAssetImportCollisionModel, projectAssetPath, projectFileStem, projectImageDataUrl, projectParentPath, projectPathInDirectory, projectPathName, projectVfs, resolveProjectAssetImportPlan, slotFileKind } from './assets_files.js';
import { chartFigure, chartUsesConversionView, columnDefinitions, normalizeGraphLayoutSettings, validateChartModel } from './graphs.js';
import { dashboardGeometryInProject, gridSlotGeometry, newGridSlot, orderedSlotLabels, slotIdentifier } from './layout_annotations.js';
import { APP_BUILD, BackendSettings, DEFAULT_COLORS, DEFAULT_IMAGE_SETTINGS, DEFAULT_UI_PALETTE, PROJECT_OBJECT_PATHS, SLOT_LOCAL_DEFAULTS } from './settings.js';

export function createProjectState() {
  let state = {
    kind: "fast-figure-project-object",
    meta: { projectName: "", appBuild: APP_BUILD },
    layout: structuredClone(BackendSettings.project_object.layout),
    annotations: {
      labels: projectClone(BackendSettings.project_object.annotations.labels),
      captions: {
        ...projectClone(BackendSettings.project_object.annotations.captions),
        text: "", afterText: "", name: "",
      },
    },
    assets: { csvFiles: [], images: [] },
    fileSystem: {
      directories: Object.values(BackendSettings.defaults.vfs),
    },
    charts: [],
    slots: [],
    nextId: { csv: 1, image: 1, chart: 1 },
    appearance: { uiPalette: { ...DEFAULT_UI_PALETTE } },
    export: {
      ...structuredClone(BackendSettings.project_object.export),
      width: BackendSettings.project_object.layout.slotStyle.referenceWidth,
      height: BackendSettings.project_object.export.heightMode === "auto" ? null
        : BackendSettings.defaults.limits.export.logicalHeight[0],
    },
  };
  for (let index = 0; index < state.layout.gridRows * state.layout.gridCols; index++)
    state.slots.push(newGridSlot(index, Math.floor(index / state.layout.gridCols) + 1,
      (index % state.layout.gridCols) + 1));
  return validateProjectObjectState(state, { requireSlots: true });
}

export function projectObjectPath(state, path) {
  return String(path)
    .split(".")
    .reduce((value, key) => value?.[key], state);
}

export class ProjectObject {
  constructor(state = createProjectState()) {
    const next = structuredClone(state instanceof ProjectObject ? state._state : state);
    normalizeSlotContents(next.slots);
    normalizeProjectSettings(next);
    validateProjectObjectState(next, { requireSlots: true });
    this._state = next;
  }
  static fromFFPX(payload, fileName) {
    return buildProjectObject(payload, fileName);
  }
  read(path) {
    let value = projectObjectPath(this._state, path);
    if (value === undefined) throw Error(`프로젝트 오브젝트 경로 ${path}가 없습니다.`);
    return value;
  }
  initialize(source) {
    let next = projectClone(source instanceof ProjectObject ? source._state : source);
    normalizeSlotContents(next.slots);
    normalizeProjectSettings(next);
    validateProjectObjectState(next, { requireSlots: true });
    let previous = this._state;
    this._state = next;
    return previous;
  }
  get meta() {
    return this._state.meta;
  }
  get layout() {
    return this._state.layout;
  }
  get annotations() {
    return this._state.annotations;
  }
  get assets() {
    return this._state.assets;
  }
  get appearance() {
    return this._state.appearance;
  }
  get projectName() {
    return this.meta.projectName;
  }
  set projectName(value) {
    this.meta.projectName = value;
  }
  get appBuild() {
    return this.meta.appBuild;
  }
  get gridRows() {
    return this.layout.gridRows;
  }
  set gridRows(value) {
    this.layout.gridRows = value;
  }
  get gridCols() {
    return this.layout.gridCols;
  }
  set gridCols(value) {
    this.layout.gridCols = value;
  }
  get csvFiles() {
    return this.assets.csvFiles;
  }
  set csvFiles(value) {
    this.assets.csvFiles = value;
  }
  get images() {
    return this.assets.images;
  }
  set images(value) {
    this.assets.images = value;
  }
  get fileSystem() {
    return this._state.fileSystem;
  }
  set fileSystem(value) {
    this._state.fileSystem = value;
  }
  get charts() {
    return this._state.charts;
  }
  set charts(value) {
    this._state.charts = value;
  }
  get slots() {
    return this._state.slots;
  }
  set slots(value) {
    this._state.slots = normalizeSlotContents(value);
  }
  get csvId() {
    return this._state.nextId.csv;
  }
  set csvId(value) {
    this._state.nextId.csv = value;
  }
  get imageId() {
    return this._state.nextId.image;
  }
  set imageId(value) {
    this._state.nextId.image = value;
  }
  get chartId() {
    return this._state.nextId.chart;
  }
  set chartId(value) {
    this._state.nextId.chart = value;
  }
  get labelsEnabled() {
    return this.annotations.labels.enabled;
  }
  set labelsEnabled(value) {
    this.annotations.labels.enabled = value;
  }
  get labelSettings() {
    return this.annotations.labels.settings;
  }
  set labelSettings(value) {
    this.annotations.labels.settings = value;
  }
  get captionsEnabled() {
    return this.annotations.captions.enabled;
  }
  set captionsEnabled(value) {
    this.annotations.captions.enabled = value;
  }
  get captionText() {
    return this.annotations.captions.text;
  }
  set captionText(value) {
    this.annotations.captions.text = value;
  }
  get captionAfterText() {
    return this.annotations.captions.afterText;
  }
  set captionAfterText(value) {
    this.annotations.captions.afterText = value;
  }
  get captionName() {
    return this.annotations.captions.name;
  }
  set captionName(value) {
    this.annotations.captions.name = value;
  }
  get captionNameBold() {
    return this.annotations.captions.nameBold;
  }
  set captionNameBold(value) {
    this.annotations.captions.nameBold = value;
  }
  get captionSettings() {
    return this.annotations.captions.settings;
  }
  set captionSettings(value) {
    this.annotations.captions.settings = value;
  }
  get exportSettings() {
    return this._state.export;
  }
  set exportSettings(value) {
    this._state.export = value;
  }
}

export let activeProject;
export function initializeActiveProject() {
  const candidate = createProjectState();
  validateProjectObjectState(candidate, { requireSlots: true });
  activeProject = new ProjectObject(candidate);
}

export class ProjectObjectRegistry {
  constructor(projectProvider) {
    if (typeof projectProvider !== "function")
      throw Error("프로젝트 오브젝트 공급자가 없습니다.");
    this.projectProvider = projectProvider;
    this.adapters = new Map();
  }
  register(name, adapter) {
    if (!name || this.adapters.has(name) || typeof adapter?.read !== "function")
      throw Error(`프로젝트 오브젝트 어댑터 ${name}을 등록할 수 없습니다.`);
    this.adapters.set(name, Object.freeze({ ...adapter }));
    return this;
  }
  registerPath(name, path) {
    return this.register(name, {
      path,
      read: (project) => project.read(path),
    });
  }
  read(name) {
    let adapter = this.adapters.get(name);
    if (!adapter) throw Error(`프로젝트 오브젝트 ${name}이 없습니다.`);
    let project = this.projectProvider();
    if (!(project instanceof ProjectObject))
      throw Error("활성 프로젝트 오브젝트가 없습니다.");
    return adapter.read(project);
  }
  snapshot(names = Object.keys(PROJECT_OBJECT_PATHS)) {
    const project = this.projectProvider();
    if (!(project instanceof ProjectObject)) throw Error("활성 프로젝트 오브젝트가 없습니다.");
    const source = project._state;
    return immutableProjectCopy(Object.fromEntries(names.map(name => {
      const adapter = this.adapters.get(name);
      if (!Object.hasOwn(PROJECT_OBJECT_PATHS, name) || !adapter?.path)
        throw Error(`프로젝트 오브젝트 ${name}이 없습니다.`);
      const value = projectObjectPath(source, adapter.path);
      if (value === undefined) throw Error(`프로젝트 오브젝트 경로 ${adapter.path}가 없습니다.`);
      return [name, value];
    })));
  }
  names() {
    return [...this.adapters.keys()];
  }
}

const BACKEND_QUERY_KINDS = new Set(["project-api", "slot-selection-context",
  "interface-reconciliation", "renderer", "export"]);
const PUBLIC_BACKEND_READ_OPERATIONS = new Set([
  "project.readName", "slots.readSelected", "images.readEditor", "print.readSettings", "appearance.readPalette",
  "graphs.readData", "graphs.readLayout", "graphs.readPalette", "graphs.hasSelectedSlot", "graphs.defaultColors",
  "captions.readGlobal", "captions.readSlot", "labels.readState", "layout.readState", "assets.readTree",
  "assets.readTrash", "assets.isTrashed", "assets.movable", "assets.draggableAsset", "assets.readDeletionTarget",
  "assets.moveOptions", "assets.planMove", "assets.resolveTreeSelection", "assets.fileKind", "assets.collisionModel",
  "assets.resolveImportPlan", "project.exportFile", "assets.download", "graphs.exportFfsx", "graphs.exportPlotlyJson",
]);

function buildSlotAssetDisplay(slot, source) {
  const display = { kind: "empty", assets: [] };
  if (slot.content.contentType === "image") {
    const image = source.assets.images.find(item => item.id === slot.content.imageId);
    if (image) {
      display.kind = "assets";
      display.assets.push({ kind: "image", id: image.id, name: image.name, path: projectAssetPath(image) });
    }
  } else if (slot.content.contentType === "graph") {
    const chart = source.charts.find(item => item.id === slot.content.chart);
    if (chart?.editor.editable === false) display.kind = "embedded";
    else if (chart) {
      const seen = new Set();
      for (const object of chart.editor.objects) {
        const csv = source.assets.csvFiles.find(item => item.id === object.csvId);
        if (csv && !seen.has(csv.id)) {
          seen.add(csv.id);
          display.assets.push({ kind: "csv", id: csv.id, name: csv.name, path: projectAssetPath(csv) });
        }
      }
      if (display.assets.length) display.kind = "assets";
    }
  }
  return immutableProjectCopy(display);
}

function buildBackendVfsTree(source) {
  const nodes = new Map(source.fileSystem.directories.map(path => [path, {
    kind: "directory", path, name: projectPathName(path), children: [],
  }]));
  for (const [kind, assets] of [["csv", source.assets.csvFiles], ["image", source.assets.images]]) {
    for (const asset of assets) {
      const path = projectAssetPath(asset);
      nodes.set(path, { kind, path, id: asset.id, name: asset.name, asset: structuredClone(asset) });
    }
  }
  for (const node of nodes.values()) {
    const parent = nodes.get(projectParentPath(node.path));
    if (parent && parent !== node) parent.children.push(node);
  }
  return nodes;
}

export function readBackendProjection(kind, request = {}) {
  if (!BACKEND_QUERY_KINDS.has(kind) ||
      (kind === "project-api" && !PUBLIC_BACKEND_READ_OPERATIONS.has(request.operation)))
    throw Error(`알 수 없는 Backend query: ${kind}/${request.operation}`);
  if (kind === "project-api" && ["project.exportFile", "assets.download", "graphs.exportFfsx", "graphs.exportPlotlyJson"].includes(request.operation))
    return readBackendProjection("export", request);
  if (kind === "interface-reconciliation")
    return buildFrontendReconciliationInput(request.event, request.mutationResult, request.frontendReferences);
  if (kind === "project-api" && request.operation === "project.readName")
    return activeProject._state.meta.projectName;
  if ((kind === "project-api" && request.operation === "appearance.readPalette") ||
      (kind === "renderer" && request.operation === "ui-palette"))
    return Object.freeze({ ...activeProject._state.appearance.uiPalette });
  if (kind === "project-api" && request.operation === "layout.readState") {
    const source = activeProject._state, preview = BackendSettings.defaults.preview,
      width = request.renderedWidth == null ? preview.fallbackWidth : readProjectNumber(
        request.renderedWidth, preview.fallbackWidth, ...preview.widthRange);
    return immutableProjectCopy({
      gridRows: source.layout.gridRows, gridCols: source.layout.gridCols,
      gridLimits: structuredClone(BackendSettings.defaults.limits.layout),
      slotStyle: Object.freeze({ ...source.layout.slotStyle }),
      visibleSlots: Object.freeze(source.slots.filter((slot) => !slot.hidden).map((slot) => Object.freeze({
        id: slot.id, row: slot.row, col: slot.col, rowSpan: slot.rowSpan, colSpan: slot.colSpan,
        contentType: slot.content.contentType, chart: slot.content.chart, imageId: slot.content.imageId,
        assetDisplay: buildSlotAssetDisplay(slot, source),
      }))),
      previewGeometry: Object.freeze(dashboardGeometryInProject(source, width)),
    });
  }
  if (kind === "project-api" && request.operation === "labels.readState") {
    const source = activeProject._state, labels = source.annotations.labels,
      slot = source.slots.find((item) => item.id === request.slotId && !item.hidden) ?? null,
      geometry = dashboardGeometryInProject(source, source.layout.slotStyle.referenceWidth),
      reference = gridSlotGeometry(source.layout, geometry, slot),
      identifier = slotIdentifier(0, source);
    return immutableProjectCopy({
      enabled: labels.enabled, settings: Object.freeze({ ...labels.settings }),
      reference: Object.freeze(reference),
      sampleText: labels.settings.parentheses ? `(${identifier})` : identifier,
    });
  }
  if (kind === "project-api" && request.operation === "captions.readGlobal") {
    let captions = activeProject._state.annotations.captions;
    return immutableProjectCopy(captions);
  }
  if (kind === "project-api" && request.operation === "captions.readSlot") {
    const slot = activeProject._state.slots.find((item) => item.id === request.slotId && !item.hidden);
    return slot ? Object.freeze({
      id: slot.id, row: slot.row, col: slot.col, text: slot.caption ?? "",
    }) : null;
  }
  if (kind === "project-api" && request.operation === "assets.isTrashed")
    return projectVfs.isTrashed(request.path);
  if (kind === "project-api" && request.operation === "assets.planMove")
    return planProjectNodeMove(request.path, request.directory, activeProject._state);
  if (kind === "project-api" && ["assets.movable", "assets.moveOptions",
      "assets.draggableAsset", "assets.resolveTreeSelection"].includes(request.operation)) {
    const source = activeProject._state, path = normalizeProjectPath(request.path, { directory: true }),
      node = projectVfs.resolve(path, source), fixed = projectVfs.isFixedDirectory(path);
    if (request.operation === "assets.movable") return !!node && !fixed;
    if (request.operation === "assets.moveOptions")
      return immutableProjectCopy(!node || fixed ? [] : source.fileSystem.directories.filter(directory =>
        node.kind !== "directory" || !projectPathInDirectory(directory, path)));
    if (request.operation === "assets.resolveTreeSelection")
      return immutableProjectCopy(node ? { accepted: true, kind: node.kind,
        path: node.kind === "directory" ? node.path : projectAssetPath(node.asset) }
        : { accepted: false, kind: null, path: null });
    if (!node || !["csv", "image"].includes(node.kind) || projectVfs.isTrashed(path)) return null;
    return immutableProjectCopy({ kind: node.kind, id: node.asset.id,
      path: projectAssetPath(node.asset), name: node.asset.name });
  }
  if (kind === "project-api" && request.operation === "assets.fileKind")
    return slotFileKind(request.file);
  if (kind === "project-api" && request.operation === "assets.collisionModel")
    return immutableProjectCopy(projectAssetImportCollisionModel(request.file, request.directory,
      new Set(request.reservedPaths || [])));
  if (kind === "project-api" && request.operation === "assets.resolveImportPlan")
    return immutableProjectCopy(resolveProjectAssetImportPlan(request.model, request.choice,
      new Set(request.reservedPaths || [])));
  if (kind === "project-api" && request.operation === "assets.readDeletionTarget") {
    const source = activeProject._state,
      node = request.path ? projectVfs.resolve(request.path, source) : null;
    if (!["csv", "image"].includes(node?.kind)) return null;
    const references = collectAssetReferences(
      new Set(node.kind === "csv" ? [node.asset.id] : []),
      new Set(node.kind === "image" ? [node.asset.id] : []), source);
    return immutableProjectCopy({ target: node.asset, kind: node.kind,
      path: projectAssetPath(node.asset), referenceCount: references.length, references });
  }
  if (kind === "project-api" && request.operation === "slots.readSelected") {
    const source = activeProject._state,
      slot = source.slots.find((item) => item.id === request.frontendState?.selectedSlotId && !item.hidden);
    return slot ? immutableProjectCopy({ id: slot.id, row: slot.row, col: slot.col,
      rowSpan: slot.rowSpan, colSpan: slot.colSpan, hidden: slot.hidden,
      content: slot.content, caption: slot.caption }) : null;
  }
  if (kind === "project-api" && request.operation === "assets.readTrash") {
    const source = activeProject._state, tree = buildBackendVfsTree(source);
    return immutableProjectCopy(tree.get(BackendSettings.defaults.vfs.trash) ?? null);
  }
  if (kind === "project-api" && request.operation === "assets.readTree") {
    const source = activeProject._state;
    return immutableProjectCopy(Array.from(buildBackendVfsTree(source).values()));
  }
  if (kind === "project-api" && request.operation === "graphs.defaultColors")
    return immutableProjectCopy(DEFAULT_COLORS);
  if (kind === "project-api" && request.operation === "graphs.hasSelectedSlot")
    return activeProject._state.slots.some(slot => slot.id === request.selectedSlotId && !slot.hidden && slot.content.contentType === "graph");
  if (kind === "project-api" && request.operation === "graphs.readPalette") {
    const source = activeProject._state,
      slot = source.slots.find(item => item.id === request.selectedSlotId && !item.hidden && item.content.contentType === "graph"),
      chart = slot ? source.charts.find(item => item.id === slot.content.chart) : null;
    return immutableProjectCopy((chart?.editor?.objects || []).map(object => object.color));
  }
  if (kind === "project-api" && request.operation === "graphs.readLayout") {
    const source = activeProject._state, slot = source.slots.find(item => item.id === request.selectedSlotId && !item.hidden),
      chartId = slot?.content.chart,
      chart = slot?.content.contentType === "graph" ? source.charts.find(item => item.id === chartId) : null;
    return chart ? immutableProjectCopy({ chartId: chart.id, editable: chart.editor?.editable !== false,
      title: chart.editor?.title ?? "", settings: normalizeGraphLayoutSettings(chart.editor?.globalSettings) }) : null;
  }
  if (kind === "project-api" && request.operation === "graphs.readData") {
    const source = activeProject._state, state = request.frontendState || {},
      slot = Object.hasOwn(request, "chartId") ? resolveOwningSlot(request.chartId, source)
        : source.slots.find((item) => item.id === state.selectedSlotId && !item.hidden),
      chartId = slot?.content.chart,
      chart = slot && slot.content.contentType === "graph"
        ? source.charts.find((item) => item.id === chartId) || null : null,
      objects = chart?.editor?.objects || [], index = state.graphObjectIndex,
      selectedIndex = chart && chart.editor.editable !== false && Number.isInteger(index) && index >= 0 && index < objects.length
        ? index : null,
      node = state.assetSelection === "csv" && state.assetPath ? projectVfs.resolve(state.assetPath, source) : null,
      csv = node?.kind === "csv" ? node.asset : null,
      objectCsv = selectedIndex === null ? null : source.assets.csvFiles.find((item) => item.id === objects[selectedIndex].csvId);
    return immutableProjectCopy({ chart, objects, selectedIndex, currentCsv: csv,
      columns: csv ? columnDefinitions(csv.rows, csv.headerLines) : [],
      objectColumns: objectCsv ? columnDefinitions(objectCsv.rows, objectCsv.headerLines) : [] });
  }
  if (kind === "project-api" && request.operation === "print.readSettings")
    return immutableProjectCopy(activeProject._state.export);
  if ((kind === "project-api" && request.operation === "images.readEditor") ||
      (kind === "renderer" && request.operation === "slot-image")) {
    return immutableProjectCopy(buildBackendImageRead(activeProject._state, request.slotId));
  }
  if (kind === "renderer" ||
      (kind === "export" && ["print.save", "print.capture"].includes(request.operation))) {
    const source = activeProject._state, output = buildBackendSurfaceRead(source);
    if (kind === "renderer") {
      if (!Number.isFinite(request.width) || request.width <= 0)
        throw Error("renderer 너비는 유한한 양수여야 합니다.");
      output.geometry = dashboardGeometryInProject(source, request.width);
    }
    if (kind === "export") {
      output.export = structuredClone(source.export);
      output.rasterLimits = structuredClone(BackendSettings.defaults.limits.export);
    }
    return immutableProjectCopy(output);
  }
  if (kind === "export" && request.operation == null) {
    const source = activeProject._state;
    return immutableProjectCopy({ ...source,
      slots: source.slots.map(slot => ({ ...slot, content: { ...slot.content } })),
    });
  }
  if (kind === "export" && request.operation === "project.exportFile") {
    const source = activeProject._state, bundle = ffpxBuildProject(source);
    return Object.freeze({
      name: `${projectFileStem(source.meta.projectName)}-${request.stamp}.ffpx`,
      mime: "application/vnd.fast-figure-project",
      entries: Object.freeze(bundle.assets.map((entry) => Object.freeze({
        name: entry.name, data: Object.freeze(Array.from(entry.data)),
      }))),
    });
  }
  if (kind === "export" && request.operation === "assets.download") {
    const source = activeProject._state,
      selected = request.path ? projectVfs.resolve(request.path, source) : null,
      asset = ["csv", "image"].includes(selected?.kind) ? selected.asset : null;
    if (!asset?.bytesBase64) return null;
    return Object.freeze({
      name: asset.name, mime: asset.mime || "application/octet-stream",
      bytes: Object.freeze(Array.from(ffpxBase64ToBytes(asset.bytesBase64))),
    });
  }
  if (kind === "export" && ["graphs.exportPlotlyJson", "graphs.exportFfsx"].includes(request.operation)) {
    const source = activeProject._state,
      slot = source.slots.find((item) => item.id === request.slotId && !item.hidden),
      chart = slot && slot.content.contentType === "graph"
        ? source.charts.find((item) => item.id === slot.content.chart) : null;
    if (!chart) return null;
    if (request.operation === "graphs.exportFfsx") {
      const bundle = ffsxBuildSlot(slot, chart, source);
      return Object.freeze({
        name: `fast-figure-slot-${slot.id}-${request.stamp}.ffsx`, mime: "application/vnd.fast-figure-slot",
        entries: Object.freeze(bundle.assets.map((entry) => Object.freeze({
          name: entry.name, data: Object.freeze(Array.from(entry.data)),
        }))),
      });
    }
    const bytes = new TextEncoder().encode(JSON.stringify(chartFigure(chart, source)));
    return Object.freeze({
      name: `plotly-figure-${slot.id}-${request.stamp}.json`, mime: "application/json",
      bytes: Object.freeze(Array.from(bytes)),
    });
  }
  if (kind !== "slot-selection-context") throw Error(`알 수 없는 Backend query: ${kind}`);
  let slot = request.slotId == null ? null : slotAt(request.slotId);
  return slot && !slot.hidden ? Object.freeze({
    id: slot.id,
    empty: slot.content.chart === null && slot.content.imageId === null,
    contentType: slot.content.contentType,
  }) : null;
}

export function buildBackendImageRead(source, slotId) {
  const original = source.slots.find(item => item.id === slotId && !item.hidden);
  if (!original || original.content.contentType !== "image") return null;
  const image = source.assets.images.find(item => item.id === original.content.imageId);
  if (!image) return null;
  const slot = normalizeSlotContent(structuredClone(original));
  return { slotId: slot.id, name: image.name,
    bytes: Array.from(ffpxBase64ToBytes(image.bytesBase64 || "")),
    src: projectImageDataUrl(image), settings: structuredClone(slot.content.imageSettings),
  };
}

export function buildBackendSurfaceRead(source) {
  const output = {
    layout: structuredClone(source.layout), appearance: structuredClone(source.appearance),
    annotations: structuredClone(source.annotations), visibleSlots: [],
    orderedSlotLabels: orderedSlotLabels(source),
    captionReferenceStyle: structuredClone(BackendSettings.defaults.captionReferenceStyle),
  };
  for (const original of source.slots) {
    if (original.hidden) continue;
    const slot = structuredClone(original), chart = source.charts.find(item => item.id === original.content.chart);
    if (chart) {
      slot.chart = structuredClone(chart);
      slot.figure = chartFigure(structuredClone(chart), source);
      slot.csvViews = [];
      if (!chartUsesConversionView(chart)) {
        for (const object of chart.editor.objects) {
          const csv = source.assets.csvFiles.find(item => item.id === object.csvId);
          if (csv) slot.csvViews.push({ csv: structuredClone(csv), columns: columnDefinitions(csv.rows, csv.headerLines) });
        }
      }
    }
    if (original.content.imageId !== null) slot.imageView = buildBackendImageRead(source, original.id);
    output.visibleSlots.push(slot);
  }
  return output;
}

export function validateFrontendIntent(event, payload = {}) {
  let input = { event, accepted: true, reference: null, workspaceHint: null, selectionHint: null };
  if (event === "SELECT_SLOT") {
    if (!Object.hasOwn(payload, "slotId")) input.accepted = false;
    else if (payload.slotId === null) {
      input.workspaceHint = "project";
      input.selectionHint = "toggle-clear";
    } else {
      let slot = slotAt(payload.slotId);
      if (!slot || slot.hidden) input.accepted = false;
      else {
        input.reference = slot.id;
        input.workspaceHint = slot.content.contentType === "image" ? "slot.image" : "slot.graph";
        input.selectionHint = payload.direction === "model-to-fsm" ? "clear-graph-object" : "toggle-clear";
      }
    }
  } else if (event === "SELECT_ASSET") {
    if (!Object.hasOwn(payload, "path")) input.accepted = false;
    else if (payload.path !== null) {
      let match = projectVfs.resolve(payload.path);
      if (!match || match.kind !== payload.kind || !["csv", "image", "directory"].includes(match.kind))
        input.accepted = false;
      else {
        input.reference = match.kind === "directory" ? match.path : projectAssetPath(match.asset);
        input.selectionHint = match.kind;
      }
    }
  } else if (event === "SELECT_GRAPH_OBJECT") {
    if (!Object.hasOwn(payload, "index")) input.accepted = false;
    else if (payload.index !== null) {
      let slot = slotAt(payload.selectedSlotId),
        chart = slot && !slot.hidden && slot.content.contentType === "graph" ? getChart(slot.content.chart) : null,
        object = Number.isInteger(payload.index) && payload.index >= 0
          ? chart?.editor?.objects?.[payload.index] : null,
        csv = object ? getProjectCsv(object.csvId) : null;
      if (chart?.editor?.editable === false || !object || !csv) input.accepted = false;
      else {
        input.reference = payload.index;
        input.selectionHint = payload.selectAsset === true ? projectAssetPath(csv) : null;
      }
    }
  } else input.accepted = false;
  return Object.freeze(input);
}

export function buildFrontendReconciliationInput(event, result, references) {
  if (result.committed !== true) throw Error("commit된 Project 결과만 재조정할 수 있습니다.");
  let hints = result.selectionHints || {},
    slotId = references.selectedSlotId,
    assetPath = references.assetPath,
    graphObjectIndex = references.graphObjectIndex;
  if (hints.resetInterfaceSelection) {
    slotId = assetPath = graphObjectIndex = null;
  } else {
    if (Array.isArray(hints.swapSlotIds) && hints.swapSlotIds.length === 2) {
      let [source, target] = hints.swapSlotIds;
      if (slotId === source) slotId = target;
      else if (slotId === target) slotId = source;
    }
    if (hints.mergeSlotIds?.includes(slotId)) slotId = hints.anchorId;
    if (assetPath && hints.movedPathFrom && projectPathInDirectory(assetPath, hints.movedPathFrom))
      assetPath = `${hints.movedPathTo}${assetPath.slice(hints.movedPathFrom.length)}`;
  }
  let slot = slotId == null ? null : slotAt(slotId);
  if (!slot || slot.hidden) slotId = null;
  let asset = assetPath ? projectVfs.resolve(assetPath) : null;
  if (hints.clearAssetSelection || !asset ||
      (hints.enteringTrash && projectVfs.isTrashed(assetPath))) {
    asset = null;
    assetPath = null;
  } else assetPath = asset.kind === "directory" ? asset.path : projectAssetPath(asset.asset);
  let chart = slotId !== null && slot.content.contentType === "graph" ? getChart(slot.content.chart) : null;
  if (chart?.editor?.editable === false) chart = null;
  if (chart && hints.chartId === chart.id && Object.hasOwn(hints, "selectedIndexHint"))
    graphObjectIndex = hints.selectedIndexHint;
  else if (chart) {
    const map = hints.graphObjectIndexMaps?.find(item => item.chartId === chart.id);
    if (map) graphObjectIndex = Number.isInteger(graphObjectIndex) ? map.indices[graphObjectIndex] ?? null : null;
  }
  if (hints.resetInterfaceSelection || hints.clearGraphSelection ||
      !Number.isInteger(graphObjectIndex) || graphObjectIndex < 0 ||
      graphObjectIndex >= (chart?.editor?.objects?.length || 0))
    graphObjectIndex = null;
  return Object.freeze({
    event, selectedSlot: slotId,
    projectionEffect: result.projectionEffect ? immutableProjectCopy(result.projectionEffect) : result.projectionEffect,
    assetSelection: assetPath, assetKind: asset?.kind ?? null,
    graphObject: graphObjectIndex,
    workspaceHint: slotId === null ? "project" : slot.content.contentType === "image" ? "slot.image" : "slot.graph",
  });
}

export function immutableProjectCopy(value) {
  const freeze = (copy) => {
    if (copy && typeof copy === "object") {
      Object.values(copy).forEach(freeze);
      Object.freeze(copy);
    }
    return copy;
  };
  return freeze(structuredClone(value));
}

export let projectObjects;
export function initializeProjectObjects() {
  projectObjects = new ProjectObjectRegistry(() => activeProject)
  .registerPath("project", PROJECT_OBJECT_PATHS.project)
  .registerPath("layout", PROJECT_OBJECT_PATHS.layout)
  .registerPath("labels", PROJECT_OBJECT_PATHS.labels)
  .registerPath("captions", PROJECT_OBJECT_PATHS.captions)
  .registerPath("data", PROJECT_OBJECT_PATHS.data)
  .registerPath("images", PROJECT_OBJECT_PATHS.images)
  .registerPath("files", PROJECT_OBJECT_PATHS.files)
  .registerPath("charts", PROJECT_OBJECT_PATHS.charts)
  .registerPath("slots", PROJECT_OBJECT_PATHS.slots)
  .registerPath("sequences", PROJECT_OBJECT_PATHS.sequences)
  .registerPath("appearance", PROJECT_OBJECT_PATHS.appearance)
  .registerPath("export", PROJECT_OBJECT_PATHS.export);
}

export function getProjectCsv(id, collection = activeProject.csvFiles) {
  return collection.find((csv) => csv.id === id) || null;
}

export function getProjectImage(id, collection = activeProject.images) {
  return collection.find((image) => image.id === id) || null;
}

export function resolveOwningSlot(chartId, state) {
  if (!state.charts.some(chart => chart.id === chartId)) return null;
  const owners = state.slots.filter(slot => slot.content.chart === chartId);
  return owners.length === 1 ? owners[0] : null;
}

export function getChart(id) {
  return activeProject.charts.find((chart) => chart.id === id) ?? null;
}

export function slotAt(id) {
  return activeProject.slots.find((s) => s.id === id);
}

export function projectClone(value) {
  const projectState = value?.kind === "fast-figure-project-object" && Array.isArray(value.slots),
    source = projectState ? { ...value, slots: value.slots.map(slot => ({ ...slot })) } : value,
    copy = JSON.parse(JSON.stringify(source));
  if (projectState) normalizeSlotContents(copy.slots);
  return copy;
}

export function slotLocalState(slot) {
  const local = normalizeSlotContent(structuredClone(slot));
  return { ...local.content, caption: local.caption };
}

export function setSlotLocalState(slot, localState) {
  const next = structuredClone(localState || SLOT_LOCAL_DEFAULTS);
  slot.content = { ...next };
  delete slot.content.caption;
  slot.caption = next.caption;
  return normalizeSlotContent(slot);
}

export function resetSlotLocalState(slot) {
  return setSlotLocalState(slot, SLOT_LOCAL_DEFAULTS);
}

function projectValuesEqual(left, right) {
  if (left === right) return true;
  if (!left || !right || typeof left !== "object" || typeof right !== "object" ||
      Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key =>
    Object.hasOwn(right, key) && projectValuesEqual(left[key], right[key]));
}

export function normalizeProjectSettings(state) {
  for (const key of ["layout", "annotations", "export"])
    state[key] = Object.hasOwn(state, key)
      ? fillMissingSettingRecord(state[key], BackendSettings.project_object[key])
      : structuredClone(BackendSettings.project_object[key]);
  if (!Object.hasOwn(state, "appearance")) state.appearance = {};
  const palette = state.appearance.uiPalette;
  state.appearance.uiPalette = Object.fromEntries(Object.entries(DEFAULT_UI_PALETTE).map(([key, fallback]) =>
    [key, typeof palette?.[key] === "string" && /^#[0-9a-fA-F]{6}$/.test(palette[key]) ? palette[key] : fallback]));
  delete state.layout.layoutMapWidth;
  return state;
}

export function slotHasNonDefaultLocalState(slot) {
  return !projectValuesEqual(slotLocalState(slot), SLOT_LOCAL_DEFAULTS);
}

export function slotLegacyState(slot) {
  let local = slotLocalState(slot);
  return {
    ...Object.fromEntries(Object.entries(slot).filter(([key]) => key !== "content")),
    chart: local.chart,
    imageId: local.imageId,
    contentType: local.contentType,
    imageSettings: projectClone(local.imageSettings),
    caption: local.caption,
  };
}

export function normalizeSlotContent(slot) {
  if (!slot || typeof slot !== "object" || Array.isArray(slot)) return slot;
  if (Object.hasOwn(slot, "content") &&
      (!slot.content || typeof slot.content !== "object" || Array.isArray(slot.content)))
    throw Error("슬롯 content 구조가 올바르지 않습니다.");
  const content = Object.hasOwn(slot, "content") ? structuredClone(slot.content) : {},
    caption = Object.hasOwn(slot, "caption") ? structuredClone(slot.caption)
      : Object.hasOwn(content, "caption") ? structuredClone(content.caption) : null;
  for (const key of ["chart", "imageId", "contentType", "imageSettings"]) {
    if (!Object.hasOwn(content, key)) {
      const legacy = Object.getOwnPropertyDescriptor(slot, key);
      content[key] = structuredClone(legacy?.enumerable && Object.hasOwn(legacy, "value")
        ? legacy.value : SLOT_LOCAL_DEFAULTS[key]);
    }
  }
  if (content.imageSettings && typeof content.imageSettings === "object" && !Array.isArray(content.imageSettings)) {
    for (const key of Object.keys(DEFAULT_IMAGE_SETTINGS))
      if (!Object.hasOwn(content.imageSettings, key))
        content.imageSettings[key] = structuredClone(DEFAULT_IMAGE_SETTINGS[key]);
  }
  delete content.caption;
  slot.content = content;
  slot.caption = caption;
  Object.defineProperties(slot, {
    chart: {
      configurable: true,
      enumerable: false,
      get() { return this.content.chart; },
      set(value) { this.content.chart = value; },
    },
    imageId: {
      configurable: true,
      enumerable: false,
      get() { return this.content.imageId; },
      set(value) { this.content.imageId = value; },
    },
    contentType: {
      configurable: true,
      enumerable: false,
      get() { return this.content.contentType; },
      set(value) { this.content.contentType = value; },
    },
    imageSettings: {
      configurable: true,
      enumerable: false,
      get() { return this.content.imageSettings; },
      set(value) { this.content.imageSettings = value; },
    },
    toJSON: {
      configurable: true,
      enumerable: false,
      value() { return slotLegacyState(this); },
    },
  });
  return slot;
}

export function normalizeSlotContents(slots) {
  if (!Array.isArray(slots)) return slots;
  slots.forEach(normalizeSlotContent);
  return slots;
}

export function projectColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : fallback;
}

export function validateProjectObjectState(state, { requireSlots = false } = {}) {
  let record=(value)=>!!value&&typeof value==="object"&&!Array.isArray(value);
  if(!record(state)||state.kind!=="fast-figure-project-object"||!record(state.meta)||
    !record(state.layout)||!record(state.layout.slotStyle)||!record(state.annotations?.labels)||
    !record(state.annotations?.labels?.settings)||!record(state.annotations?.captions)||
    !record(state.annotations?.captions?.settings)||!record(state.assets)||
    !record(state.fileSystem)||!record(state.nextId)||!record(state.appearance)||
    !record(state.appearance.uiPalette)||!record(state.export))
    throw Error("프로젝트 오브젝트 구조가 올바르지 않습니다.");
  if(typeof state.meta.projectName!=="string"||typeof state.meta.appBuild!=="string"||
    !Number.isInteger(state.layout.gridRows)||!Number.isInteger(state.layout.gridCols)||
    state.layout.gridRows<BackendSettings.defaults.limits.layout.gridRows[0]||
    state.layout.gridRows>BackendSettings.defaults.limits.layout.gridRows[1]||
    state.layout.gridCols<BackendSettings.defaults.limits.layout.gridCols[0]||
    state.layout.gridCols>BackendSettings.defaults.limits.layout.gridCols[1]||
    typeof state.annotations.labels.enabled!=="boolean"||
    typeof state.annotations.captions.enabled!=="boolean"||
    typeof state.annotations.captions.text!=="string"||
    typeof state.annotations.captions.afterText!=="string"||
    typeof state.annotations.captions.name!=="string"||
    typeof state.annotations.captions.nameBold!=="boolean")
    throw Error("프로젝트 메타데이터 또는 레이아웃이 올바르지 않습니다.");
  let style=state.layout.slotStyle;
  const limits = BackendSettings.defaults.limits;
  for(let key of ["referenceWidth","gap","outerMargin","radius","aspect"])
    if(!Number.isFinite(style[key])||style[key]<limits.layout[key][0]||style[key]>limits.layout[key][1])
      throw Error(`프로젝트 슬롯 스타일 ${key}가 올바르지 않습니다.`);
  if(typeof style.showBorders!=="boolean")throw Error("프로젝트 슬롯 외곽선 설정이 올바르지 않습니다.");
  let labelSettings=state.annotations.labels.settings;
  if(!Number.isFinite(labelSettings.x)||!Number.isFinite(labelSettings.y)||
    !Number.isFinite(labelSettings.fontSize)||labelSettings.fontSize<limits.labels.fontSizeMin)
    throw Error("프로젝트 레이블 위치 또는 크기가 올바르지 않습니다.");
  let output=state.export, explicit=output.heightMode==="explicit";
  if(!Number.isFinite(output.width)||output.width<limits.export.logicalWidth[0]||output.width>limits.export.logicalWidth[1]||
    !["auto","explicit"].includes(output.heightMode)||
    (!explicit&&output.height!==null)||
    (explicit&&(!Number.isFinite(output.height)||output.height<limits.export.logicalHeight[0]||output.height>limits.export.logicalHeight[1]))||
    !Number.isFinite(output.dpi)||output.dpi<limits.export.dpi[0]||output.dpi>limits.export.dpi[1]||
    !["png","jpeg"].includes(output.format))
    throw Error("프로젝트 출력 설정이 올바르지 않습니다.");
  for(let key of Object.keys(DEFAULT_UI_PALETTE))
    if(projectColor(state.appearance.uiPalette[key],null)===null)
      throw Error(`프로젝트 UI 색상 ${key}가 올바르지 않습니다.`);
  if(!Array.isArray(state.assets.csvFiles)||!Array.isArray(state.assets.images)||
    !Array.isArray(state.fileSystem.directories)||!Array.isArray(state.charts)||
    !Array.isArray(state.slots)||(requireSlots&&state.slots.length===0))
    throw Error("프로젝트 자산, 차트 또는 슬롯 목록이 올바르지 않습니다.");
  let filePaths=new Set(),directoryPaths=new Set();
  state.fileSystem.directories.forEach(path=>{
    let normalized=normalizeProjectPath(path,{directory:true});
    if(normalized==="/"||normalized!==path||directoryPaths.has(path))
      throw Error("프로젝트 폴더 경로가 올바르지 않습니다.");
    directoryPaths.add(path);
  });
  for(let required of Object.values(BackendSettings.defaults.vfs))
    if(!directoryPaths.has(required))throw Error(`프로젝트 기본 폴더 ${required}가 없습니다.`);
  let csvIds=new Set();
  state.assets.csvFiles.forEach(csv=>{
    let path;try{path=projectAssetPath(csv)}catch(_){throw Error("프로젝트 CSV 오브젝트가 올바르지 않습니다.")}
    if(!record(csv)||!Number.isInteger(csv.id)||csv.id<1||csvIds.has(csv.id)||
      typeof csv.name!=="string"||typeof csv.directory!=="string"||!Array.isArray(csv.rows)||
      typeof csv.bytesBase64!=="string"||!csv.bytesBase64||
      normalizeProjectPath(csv.directory,{directory:true})!==csv.directory||
      filePaths.has(path)||!directoryPaths.has(csv.directory))
      throw Error("프로젝트 CSV 오브젝트가 올바르지 않습니다.");
    csvIds.add(csv.id);filePaths.add(path);
  });
  let imageIds=new Set();
  state.assets.images.forEach(image=>{
    let path;try{path=projectAssetPath(image)}catch(_){throw Error("프로젝트 이미지 오브젝트가 올바르지 않습니다.")}
    if(!record(image)||!Number.isInteger(image.id)||image.id<1||imageIds.has(image.id)||
      typeof image.name!=="string"||typeof image.directory!=="string"||
      typeof image.bytesBase64!=="string"||!image.bytesBase64||
      normalizeProjectPath(image.directory,{directory:true})!==image.directory||
      filePaths.has(path)||!directoryPaths.has(image.directory))
      throw Error("프로젝트 이미지 오브젝트가 올바르지 않습니다.");
    imageIds.add(image.id);filePaths.add(path);
  });
  let chartIds=new Set();
  state.charts.forEach((chart,index)=>{
    if(!Number.isInteger(chart?.id)||chart.id<1||chartIds.has(chart.id))
      throw Error("프로젝트 차트 ID가 올바르지 않습니다.");
    chartIds.add(chart.id);validateChartModel(chart,`프로젝트 차트 ${index+1}`,state.assets.csvFiles);
  });
  let slotIds=new Set(),owners=new Map([...chartIds].map(id=>[id,0]));
  state.slots.forEach(slot=>{
    if(!record(slot)||!Number.isInteger(slot.id)||slotIds.has(slot.id)||
      !Number.isInteger(slot.row)||!Number.isInteger(slot.col)||
      !Number.isInteger(slot.rowSpan)||!Number.isInteger(slot.colSpan)||
      slot.row<1||slot.col<1||slot.rowSpan<1||slot.colSpan<1||
      slot.row+slot.rowSpan-1>state.layout.gridRows||
      slot.col+slot.colSpan-1>state.layout.gridCols||
      !record(slot.content)||!["graph","image"].includes(slot.content.contentType)||
      (slot.content.chart!==null&&slot.content.imageId!==null)||
      (slot.content.chart!==null&&!chartIds.has(slot.content.chart))||
      (slot.content.imageId!==null&&!imageIds.has(slot.content.imageId))||
      !(slot.caption===null||typeof slot.caption==="string"))
      throw Error("프로젝트 슬롯 오브젝트가 올바르지 않습니다.");
    const settings=slot.content.imageSettings;
    if(!record(settings)||!["contain","cover","manual"].includes(settings.fit)||
      !Number.isFinite(settings.scale)||settings.scale<limits.imageSettings.scale[0]||settings.scale>limits.imageSettings.scale[1]||
      !Number.isFinite(settings.x)||settings.x<limits.imageSettings.x[0]||settings.x>limits.imageSettings.x[1]||
      !Number.isFinite(settings.y)||settings.y<limits.imageSettings.y[0]||settings.y>limits.imageSettings.y[1])
      throw Error("프로젝트 슬롯 이미지 설정이 올바르지 않습니다.");
    if(slot.content.chart!==null)owners.set(slot.content.chart,owners.get(slot.content.chart)+1);
    slotIds.add(slot.id);
  });
  for(let [chartId,count] of owners)
    if(count!==1)throw Error(`프로젝트 차트 ${chartId}의 슬롯 소유권이 올바르지 않습니다.`);
  let maximums={csv:Math.max(0,...csvIds),image:Math.max(0,...imageIds),chart:Math.max(0,...chartIds)};
  for(let key of ["csv","image","chart"])
    if(!Number.isInteger(state.nextId[key])||state.nextId[key]<=maximums[key])
      throw Error(`프로젝트 ${key} ID 시퀀스가 올바르지 않습니다.`);
  return state;
}

export function validateProjectObject(project, options = {}) {
  if (!(project instanceof ProjectObject))
    throw Error("ProjectObject 인스턴스가 아닙니다.");
  validateProjectObjectState(project._state, options);
  return project;
}

export function readProjectNumber(value, fallback, min, max) {
  let number = ["number", "string", "boolean"].includes(typeof value) || value === null ? Number(value) : NaN;
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

export function readFiniteProjectNumber(value, fallback) {
  let number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export const projectRuntime = {
  projectObjectGeneration: 0
};
