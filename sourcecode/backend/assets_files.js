// Source: sourcescript/backend/assets_files.py (same logical owner); pseudocode/backend/assets_files.pcal.
import { appFSM, dispatchProjectCommand } from '../application/adapter.js';
import { chartCsvIds, chartExportCopy, chartUsesConversionView, createCandidateBaseGraphObject, createChartModel, dataTable, headerLineCount, normalizeGlobalSettings, readGlobalSettings, rebuildEditableGraph, validateChartModel } from './graphs.js';
import { ProjectObject, activeProject, getProjectCsv, immutableProjectCopy, normalizeSlotContent, normalizeSlotContents, projectClone, projectColor, validateProjectObjectState } from './project_state.js';
import { BackendSettings, DEFAULT_IMAGE_SETTINGS, DEFAULT_UI_PALETTE, PACKAGE_FORMAT_VERSION } from './settings.js';

export function projectImageDataUrl(image) {
  return image
    ? `data:${image.mime || "application/octet-stream"};base64,${image.bytesBase64 || ""}`
    : "";
}

export function collectAssetReferences(csvIds, imageIds, state) {
  const refs = [];
  state.charts.forEach((chart) => {
    if (chartUsesConversionView(chart)) return;
    chart.editor.objects.forEach((object, originalObjectIndex) => {
      if (csvIds.has(object.csvId)) refs.push({ kind: "csv", assetId: object.csvId,
        chartId: chart.id, originalObjectIndex, object });
    });
  });
  state.slots.forEach((slot) => {
    const imageId = slot.content?.imageId ?? slot.imageId;
    if (imageIds.has(imageId)) refs.push({ kind: "image", assetId: imageId, slotId: slot.id, slot });
  });
  return refs;
}

export function projectAssetReferenceCount(csvIds, imageIds, state = activeProject._state) {
  return collectAssetReferences(csvIds, imageIds, state).length;
}

export function removeProjectAssetReferences(csvIds, imageIds, state=activeProject._state) {
  normalizeSlotContents(state.slots);
  const refs = collectAssetReferences(csvIds, imageIds, state), graphObjectIndexMaps = [];
  let removedGraphReferenceCount = 0, resetImageSlotCount = 0;
  state.charts.forEach(chart => {
    const removed = new Set(refs.filter(ref => ref.kind === "csv" && ref.chartId === chart.id)
      .map(ref => ref.originalObjectIndex));
    if (!removed.size) return;
    const indices = [], objects = [];
    chart.editor.objects.forEach((object, index) => {
      indices.push(removed.has(index) ? null : objects.length);
      if (!removed.has(index)) objects.push(object);
    });
    chart.editor.objects = objects;
    graphObjectIndexMaps.push({ chartId: chart.id, indices });
    removedGraphReferenceCount += removed.size;
    rebuildEditableGraph(chart, state);
  });
  refs.filter(ref => ref.kind === "image").forEach(ref => {
    ref.slot.content.imageId = null;
    resetImageSlotCount++;
  });
  return { removedGraphReferenceCount, resetImageSlotCount, graphObjectIndexMaps };
}

export function buildProjectAssetImportCandidate(source, payload) {
  const { files, choices, targetSlotId } = payload;
  if (!Array.isArray(files) || !files.length || !Array.isArray(choices) || files.length !== choices.length ||
      typeof payload.directory !== "string" || projectVfs.resolve(payload.directory, source)?.kind !== "directory")
    return null;
  const directory = normalizeProjectPath(payload.directory, { directory: true }),
    candidate = projectClone(source), reserved = new Set(), imported = [];
  candidate.slots.forEach(slot => {
    const original = source.slots.find(item => item.id === slot.id);
    if (original?.content) slot.content = projectClone(original.content);
  });
  normalizeSlotContents(candidate.slots);
  const target = targetSlotId == null ? null : candidate.slots.find(slot => slot.id === targetSlotId && !slot.hidden);
  if (targetSlotId != null && !target) return null;
  for (let i = 0; i < files.length; i++) {
    const file = files[i], plan = choices[i], kind = slotFileKind(file);
    if (!["data", "image"].includes(kind) || !plan || typeof plan.path !== "string" ||
        !(plan.replaceId === null || (Number.isInteger(plan.replaceId) && plan.replaceId > 0))) return null;
    const path = normalizeProjectPath(plan.path), current = projectVfs.resolve(path, candidate),
      assetKind = kind === "data" ? "csv" : "image";
    if (path !== plan.path || projectParentPath(path) !== directory || reserved.has(path) ||
        (plan.replaceId === null ? !!current : current?.kind !== assetKind || current.asset.id !== plan.replaceId))
      return null;
    let staged;
    try { staged = stageProjectAssetImport(candidate, { file, kind, path, replaceId: plan.replaceId }); }
    catch { return null; }
    reserved.add(path);
    if (target) {
      if (kind === "image") {
        candidate.charts = candidate.charts.filter(chart => chart.id !== target.content.chart);
        target.content.chart = null;
        target.content.contentType = "image";
        target.content.imageId = staged.id;
      } else {
        if (target.contentType !== "graph") return null;
        let chart = candidate.charts.find(item => item.id === target.chart);
        if (chart?.editor?.editable === false) return null;
        const csv = candidate.assets.csvFiles.find(item => item.id === staged.id);
        if (!chart) {
          chart = createChartModel({ id: candidate.nextId.chart++, editor: { title: csv.name,
            globalSettings: readGlobalSettings({ editor: {} }), plotlyExtensions: { layout: {}, config: {} },
            objects: [] } });
          candidate.charts.push(chart); target.chart = chart.id;
        }
        chart.editor.objects.push(createCandidateBaseGraphObject(csv));
      }
    }
    imported.push({ role: "imported", kind: assetKind, id: staged.id, path });
  }
  const csvIds = new Set(imported.filter(item => item.kind === "csv").map(item => item.id));
  candidate.charts.forEach(chart => {
    if (chart.editor?.editable !== false && chartCsvIds(chart).some(id => csvIds.has(id)))
      rebuildEditableGraph(chart, candidate);
  });
  for (const fact of imported)
    fact.owners = collectAssetReferences(new Set(fact.kind === "csv" ? [fact.id] : []),
      new Set(fact.kind === "image" ? [fact.id] : []), candidate);
  try { validateProjectObjectState(candidate, { requireSlots: true }); } catch { return null; }
  return { candidate, imported };
}

export function parseCSV(text, d = ",") {
  const rows = [];
  let row = [], field = "", quoted = false, afterQuote = false,
    explicitLine = false, pendingBlankLines = 0;
  const finish = () => {
    if (explicitLine || field.length || row.length || afterQuote) {
      while (pendingBlankLines > 0) { rows.push([""]); pendingBlankLines--; }
      rows.push([...row, field]);
    } else pendingBlankLines++;
    row = []; field = ""; afterQuote = false; explicitLine = false;
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; afterQuote = true; }
      } else field += char;
      continue;
    }
    if (char === d) { row.push(field); field = ""; afterQuote = false; explicitLine = true; }
    else if (char === "\r" || char === "\n") {
      finish();
      if (char === "\r" && text[i + 1] === "\n") i++;
    } else if (char === '"') {
      if (field.length || afterQuote) throw Error("CSV 인용 문자열 위치가 올바르지 않습니다.");
      quoted = true; explicitLine = true;
    } else {
      if (afterQuote) throw Error("CSV 닫는 인용부호 뒤에 문자가 있습니다.");
      field += char; explicitLine = true;
    }
  }
  if (quoted) throw Error("CSV 인용 문자열이 닫히지 않았습니다.");
  if (explicitLine || field.length || row.length || afterQuote) finish();
  return rows;
}

export function buildProjectImageModel(
  bytes,
  name,
  mime,
  id,
  state = activeProject._state,
) {
  let model = {
    id,
    name: projectCsvName(name, "image.bin"),
    directory: PROJECT_ASSET_DIRECTORIES.image,
    mime: typeof mime === "string" && mime ? mime : "application/octet-stream",
    bytesBase64:
      typeof bytes === "string" ? bytes : ffpxBytesToBase64(bytes || new Uint8Array()),
  };
  projectVfs.assignUniqueLocation(model, PROJECT_ASSET_DIRECTORIES.image, state);
  if (!model.bytesBase64) throw Error("이미지 데이터가 비어 있습니다.");
  return model;
}

export function createProjectImage(bytes, name, mime, id = null, path = null) {
  const copiedBytes = typeof bytes === "string" ? bytes : new Uint8Array(bytes || []).slice(),
    [result] = dispatchProjectCommand("IMAGE_OBJECT_CREATED", { bytes: copiedBytes, name, mime, id, path });
  if (!result.committed) return result;
  const created = result.changed.assets.find(asset => asset.role === "created" && asset.kind === "image");
  return appFSM.query("project-api", { operation: "assets.readDeletionTarget", path: created.path }).target;
}

export function projectCsvName(value, fallback = "data.csv") {
  let name = String(value || "")
    .split(/[\\/]/)
    .pop()
    .trim()
    .replace(/[\x00-\x1F:*?"<>|]/g, "-")
    .replace(/\.{2,}/g, "-")
    .replace(/[. ]+$/, "")
    .slice(0, 180);
  return name || fallback;
}

export function buildProjectCsvModel(
  data,
  name,
  id,
  bytesBase64 = "",
  mime = "text/csv",
  headerLines = 1,
  state = activeProject._state,
) {
  let model = {
    id,
    name: projectCsvName(name),
    directory: PROJECT_ASSET_DIRECTORIES.csv,
    rows: projectClone(dataTable(data)),
    bytesBase64:
      typeof bytesBase64 === "string" && bytesBase64
        ? bytesBase64
        : ffpxBytesToBase64(
            serializeNewDataTable(dataTable(data), projectCsvName(name)),
          ),
    mime: typeof mime === "string" && mime ? mime : "text/csv",
    headerLines: headerLineCount(headerLines, data),
  };
  projectVfs.assignUniqueLocation(model, PROJECT_ASSET_DIRECTORIES.csv, state);
  return model;
}

export function createProjectCsv(
  data,
  name,
  id = null,
  bytesBase64 = "",
  mime = "text/csv",
  headerLines = 1,
  path = null,
) {
  const [result] = dispatchProjectCommand("DATA_OBJECT_CREATED", {
    data, name, id, bytesBase64, mime, headerLines, path,
  });
  if (!result.committed) return result;
  const created = result.changed.assets.find(asset => asset.role === "created" && asset.kind === "csv");
  return appFSM.query("project-api", { operation: "assets.readDeletionTarget", path: created.path }).target;
}

export function createEmptyProjectCsv() {
  return createProjectCsv(
    [["X", "Y"], ["", ""]],
    "빈 CSV.csv",
    null,
    "",
    "text/csv",
    1,
  );
}

export const PROJECT_ASSET_DIRECTORIES = Object.freeze({
  csv: BackendSettings.defaults.vfs.csv,
  image: BackendSettings.defaults.vfs.image,
});

export const PROJECT_TRASH_DIRECTORY = BackendSettings.defaults.vfs.trash;

export const PROJECT_FIXED_DIRECTORIES = Object.freeze(Object.values(BackendSettings.defaults.vfs));

export function projectPathInDirectory(path, directory) {
  let normalized = normalizeProjectPath(path, { directory: true }),
    parent = normalizeProjectPath(directory, { directory: true });
  return parent === "/" || normalized === parent || normalized.startsWith(`${parent}/`);
}

export function normalizeProjectPath(value, { directory = false } = {}) {
  let raw = String(value || "").replace(/\\/g, "/").trim(),
    segments = raw.split("/").filter(Boolean);
  if (segments.some((segment) => segment === "." || segment === ".."))
    throw Error("프로젝트 경로에는 . 또는 .. 구간을 사용할 수 없습니다.");
  segments = segments.map((segment) => {
    let clean = projectCsvName(segment, "");
    if (!clean) throw Error("프로젝트 경로 이름이 올바르지 않습니다.");
    return clean;
  });
  let path = `/${segments.join("/")}`;
  if (path === "/" && !directory) throw Error("루트는 파일 경로가 될 수 없습니다.");
  return path;
}

export function projectParentPath(path) {
  let normalized = normalizeProjectPath(path, { directory: true }),
    index = normalized.lastIndexOf("/");
  return index <= 0 ? "/" : normalized.slice(0, index);
}

export function projectPathName(path) {
  return normalizeProjectPath(path, { directory: true }).split("/").filter(Boolean).pop() || "/";
}

export function projectAssetPath(asset) {
  if (!asset || typeof asset !== "object") throw Error("프로젝트 자산이 올바르지 않습니다.");
  if (typeof asset.directory !== "string" || typeof asset.name !== "string")
    throw Error("프로젝트 자산 위치가 올바르지 않습니다.");
  let directory = normalizeProjectPath(asset.directory, { directory: true }),
    name = projectCsvName(asset.name, "");
  if (!name || name !== asset.name) throw Error("프로젝트 자산 이름이 올바르지 않습니다.");
  return normalizeProjectPath(`${directory}/${name}`);
}

export const projectVfs = Object.freeze({
  exists(path, state = activeProject._state) {
    return this.resolve(path, state) !== null;
  },
  uniquePath(directory, name, state = activeProject._state, reservedPaths = null) {
    let parent = normalizeProjectPath(directory, { directory: true }),
      safeName = projectCsvName(name, "asset"),
      dot = safeName.lastIndexOf("."),
      stem = dot > 0 ? safeName.slice(0, dot) : safeName,
      extension = dot > 0 ? safeName.slice(dot) : "",
      candidate = normalizeProjectPath(`${parent}/${safeName}`),
      suffix = 2;
    while (this.exists(candidate, state) || reservedPaths?.has(candidate))
      candidate = normalizeProjectPath(`${parent}/${stem} (${suffix++})${extension}`);
    return candidate;
  },
  ensure(state) {
    let directories = new Set(PROJECT_FIXED_DIRECTORIES),
      sourceDirectories = Array.isArray(state.fileSystem?.directories)
        ? state.fileSystem.directories
        : [];
    sourceDirectories.forEach((path) => {
      let normalized = normalizeProjectPath(path, { directory: true });
      if (normalized !== "/") {
        let current = normalized;
        while (current !== "/") {
          directories.add(current);
          current = projectParentPath(current);
        }
      }
    });
    state.fileSystem = { directories: [...directories].sort() };
    let occupied = new Set(state.fileSystem.directories);
    for (let [kind, assets] of [
      ["csv", state.assets.csvFiles],
      ["image", state.assets.images],
    ]) {
      for (let asset of assets) {
        let directory = normalizeProjectPath(asset.directory, { directory: true }),
          fullPath = projectAssetPath(asset);
        if (occupied.has(fullPath)) throw Error(`프로젝트 자산 경로 ${fullPath}가 중복되었습니다.`);
        occupied.add(fullPath);
        while (directory !== "/") {
          directories.add(directory);
          directory = projectParentPath(directory);
        }
      }
    }
    state.fileSystem.directories = [...directories].sort();
    return state.fileSystem;
  },
  resolve(path, state = activeProject._state) {
    const normalized = normalizeProjectPath(path, { directory: true }),
      directories = state.fileSystem?.directories || [],
      matches = directories.filter(item => item === normalized).map(path => ({ kind: "directory", path }));
    if (PROJECT_FIXED_DIRECTORIES.includes(normalized) && !directories.includes(normalized))
      matches.push({ kind: "directory", path: normalized });
    for (const [kind, assets] of [["csv", state.assets.csvFiles], ["image", state.assets.images]])
      for (const asset of assets)
        if (projectAssetPath(asset) === normalized) matches.push({ kind, asset });
    if (matches.length > 1) throw Error("프로젝트 경로에 둘 이상의 소유자가 있습니다.");
    return matches[0] || null;
  },
  isFixedDirectory(path) {
    let normalized = normalizeProjectPath(path, { directory: true });
    return PROJECT_FIXED_DIRECTORIES.includes(normalized);
  },
  isTrashed(path) {
    return projectPathInDirectory(path, PROJECT_TRASH_DIRECTORY);
  },
  descendants(path, state = activeProject._state) {
    const parent = normalizeProjectPath(path, { directory: true });
    return [
      ...(state.fileSystem?.directories || []).map(path => ({ kind: "directory", path })),
      ...(state.assets?.csvFiles || []).map(asset => ({ kind: "csv", asset })),
      ...(state.assets?.images || []).map(asset => ({ kind: "image", asset })),
    ].filter(node => {
      const path = node.kind === "directory" ? node.path : projectAssetPath(node.asset);
      return path !== parent && projectPathInDirectory(path, parent);
    });
  },
  assignLocation(model, path) {
    let fullPath = normalizeProjectPath(path);
    model.directory = projectParentPath(fullPath);
    model.name = projectPathName(fullPath);
    return model;
  },
  assignUniqueLocation(model, directory, state = activeProject._state, reservedPaths = null) {
    return this.assignLocation(
      model,
      this.uniquePath(directory, model?.name, state, reservedPaths),
    );
  },
  prepare(model, kind, state = activeProject._state) {
    this.ensure(state);
    let directory = normalizeProjectPath(
        model?.directory || PROJECT_ASSET_DIRECTORIES[kind],
        { directory: true },
      ),
      preferred = projectAssetPath({ ...model, directory });
    if (this.exists(preferred, state)) {
      this.assignUniqueLocation(model, directory, state);
      directory = model.directory;
    } else model.directory = directory;
    let parent = directory;
    while (parent !== "/") {
      if (!state.fileSystem.directories.includes(parent)) state.fileSystem.directories.push(parent);
      parent = projectParentPath(parent);
    }
    state.fileSystem.directories.sort();
    return model;
  },
});

export function calculateAssetCollisionInProject(source, kind, directory, filename, reservedPaths) {
  if (!["data", "image"].includes(kind)) throw Error("지원하지 않는 자산 파일 형식입니다.");
  const parent = normalizeProjectPath(directory, { directory: true });
  if (projectVfs.resolve(parent, source)?.kind !== "directory") throw Error("대상 폴더가 없습니다.");
  const name = projectCsvName(filename, kind === "data" ? "data.csv" : "image.bin"),
    path = normalizeProjectPath(`${parent}/${name}`), collision = projectVfs.resolve(path, source),
    sameKind = collision?.kind === (kind === "data" ? "csv" : "image"),
    mode = reservedPaths?.has(path) ? "rename-only" : !collision ? "available" :
      sameKind ? "replace-or-rename" : "rename-only",
    replaceId = mode === "replace-or-rename" ? collision.asset.id : null,
    message = mode === "replace-or-rename"
      ? `${path}에 같은 이름의 파일이 이미 있습니다.\n\n[확인] 기존 파일을 교체하고 참조를 유지합니다.\n[취소] 이름을 바꿔 새 파일로 추가합니다.` : "",
    notice = mode === "rename-only" ? `${path}은 이미 사용 중입니다. 이름을 바꿔 추가합니다.` : "";
  return Object.freeze({ assetKind: kind, parent, name, path, mode, replaceId, message, notice });
}

export function projectAssetImportCollisionModel(file, directory, reservedPaths = null) {
  const source = activeProject._state;
  return calculateAssetCollisionInProject(source, slotFileKind(file), directory, file?.name, reservedPaths);
}

export function resolveProjectAssetImportPlan(model, choice = "rename", reservedPaths = null) {
  const source = activeProject._state;
  if (!model || !["data", "image"].includes(model.assetKind) ||
      typeof model.parent !== "string" || typeof model.name !== "string" || !model.name ||
      typeof model.path !== "string" || !["available", "replace-or-rename", "rename-only"].includes(model.mode) ||
      !(model.replaceId === null || (Number.isInteger(model.replaceId) && model.replaceId > 0)) ||
      model.parent !== normalizeProjectPath(model.parent, { directory: true }) ||
      model.name !== projectCsvName(model.name, "asset") ||
      model.path !== normalizeProjectPath(`${model.parent}/${model.name}`))
    throw Error("프로젝트 자산 가져오기 계획이 올바르지 않습니다.");
  const fresh = calculateAssetCollisionInProject(source, model.assetKind, model.parent, model.name, reservedPaths);
  if (choice === "replace" && model.replaceId !== null &&
      (fresh.mode !== "replace-or-rename" || fresh.replaceId !== model.replaceId))
    throw Error("교체할 자산이 변경되었습니다.");
  if (fresh.mode === "available") return Object.freeze({ path: fresh.path, replaceId: null });
  if (choice === "replace" && fresh.mode === "replace-or-rename" && model.replaceId === fresh.replaceId)
    return Object.freeze({ path: fresh.path, replaceId: fresh.replaceId });
  return Object.freeze({ path: projectVfs.uniquePath(fresh.parent, fresh.name, source, reservedPaths), replaceId: null });
}

export function stageProjectAssetImport(candidate, item) {
  if (!["data", "image"].includes(item.kind)) throw Error("지원하지 않는 자산 종류입니다.");
  const bytes = new Uint8Array(item.file.bytes), kind = item.kind === "data" ? "csv" : "image",
    id = item.replaceId === null ? candidate.nextId[kind]++ : item.replaceId,
    model = projectVfs.assignLocation({ id, mime: item.file.type, bytesBase64: ffpxBytesToBase64(bytes) }, item.path),
    collection = candidate.assets[kind === "csv" ? "csvFiles" : "images"],
    index = collection.findIndex(asset => asset.id === id);
  if (kind === "csv") {
    model.rows = parseProjectCsvAsset(item.file.name, bytes);
    if (item.replaceId !== null && index < 0) throw Error("교체할 자산이 없습니다.");
    model.headerLines = headerLineCount(item.replaceId === null ? 1 : collection[index].headerLines, model.rows);
  }
  if (item.replaceId !== null) {
    if (index < 0) throw Error("교체할 자산이 없습니다.");
    collection[index] = model;
  } else {
    if (index >= 0) throw Error(`자산 ID ${id}가 중복되었습니다.`);
    collection.push(model);
  }
  return { kind, id, name: model.name, model };
}

export function projectDataTreeSnapshot(objects = {}) {
  return {
    directories: Array.isArray(objects.files?.directories)
      ? [...objects.files.directories]
      : [...PROJECT_FIXED_DIRECTORIES],
    data: (Array.isArray(objects.data) ? objects.data : []).map((csv) => ({
      id: csv.id,
      name: csv.name,
      path: projectAssetPath(csv),
      readable: Array.isArray(csv.rows),
      rowCount: Array.isArray(csv.rows)
        ? Math.max(0, csv.rows.length - (Number(csv.headerLines) || 0))
        : 0,
    })),
    images: (Array.isArray(objects.images) ? objects.images : []).map((image) => ({
      id: image.id,
      name: image.name,
      path: projectAssetPath(image),
    })),
    charts: (Array.isArray(objects.charts) ? objects.charts : []).map((chart) => ({
      id: chart.id,
      editable: chart.editor?.editable !== false,
      csvIds: chartCsvIds(chart),
      csvReferences: (chart.editor?.objects || [])
        .map((object) => object.csvId)
        .filter((id) => Number.isInteger(id)),
    })),
    slots: (Array.isArray(objects.slots) ? objects.slots : []).map((slot) => ({
      id: slot.id,
      row: slot.row,
      col: slot.col,
      hidden: slot.hidden === true,
      contentType: slot.contentType,
      chart: slot.chart,
      imageId: slot.imageId,
    })),
  };
}

export function importedProjectCsvState(payload) {
  if (!Array.isArray(payload.csvFiles)) throw Error("프로젝트 CSV 목록이 없습니다.");
  let ids = new Set(),
    nextCsvFiles = payload.csvFiles.map((source, index) => {
      if (
        !source ||
        typeof source !== "object" ||
        !Number.isInteger(source.id) ||
        source.id < 1 ||
        !Array.isArray(source.rows)
      )
        throw Error("프로젝트 CSV 데이터가 올바르지 않습니다.");
      let id = source.id;
      if (ids.has(id)) throw Error("프로젝트 CSV ID가 중복되었습니다.");
      ids.add(id);
      return {
        id,
        name: projectCsvName(source.name, `data-${index + 1}.csv`),
        directory: typeof source.directory === "string" ? source.directory : null,
        rows: projectClone(source.rows),
        bytesBase64:
          typeof source.bytesBase64 === "string" && source.bytesBase64
            ? source.bytesBase64
            : ffpxBytesToBase64(
                serializeNewDataTable(source.rows, projectCsvName(source.name, `data-${index + 1}.csv`)),
              ),
        mime: typeof source.mime === "string" ? source.mime : "text/csv",
        headerLines: headerLineCount(Object.hasOwn(source, "headerLines") ? source.headerLines : 1, source.rows),
      };
    });
  return {
    csvFiles: nextCsvFiles,
    csvId: nextCsvFiles.reduce((next, csv) => Math.max(next, csv.id + 1), 1),
  };
}

export function importedProjectImageState(payload) {
  if (!Array.isArray(payload.images)) throw Error("프로젝트 이미지 목록이 없습니다.");
  let nextImages = [],
    ids = new Set();
  payload.images.forEach((source) => {
    if (
      !source ||
      !Number.isInteger(source.id) ||
      source.id < 1 ||
      ids.has(source.id) ||
      typeof source.bytesBase64 !== "string" ||
      !source.bytesBase64
    )
      throw Error("프로젝트 이미지 데이터가 올바르지 않습니다.");
    ids.add(source.id);
    nextImages.push({
      id: source.id,
      name: projectCsvName(source.name, "image.bin"),
      directory: typeof source.directory === "string" ? source.directory : null,
      mime:
        typeof source.mime === "string" && source.mime
          ? source.mime
          : "application/octet-stream",
      bytesBase64: source.bytesBase64,
    });
  });
  return {
    images: nextImages,
    imageId: nextImages.reduce((next, image) => Math.max(next, image.id + 1), 1),
  };
}

export function fillMissingSettingRecord(current, defaults) {
  if (!current || typeof current !== "object" || Array.isArray(current))
    throw Error("프로젝트 설정 구조가 올바르지 않습니다.");
  const copy = projectClone(current);
  for (const [key, value] of Object.entries(defaults)) {
    if (!Object.hasOwn(copy, key)) copy[key] = projectClone(value);
    else if (value && typeof value === "object" && !Array.isArray(value) &&
        copy[key] && typeof copy[key] === "object" && !Array.isArray(copy[key]))
      copy[key] = fillMissingSettingRecord(copy[key], value);
  }
  return copy;
}

export function buildProjectObject(payload, fileName) {
  if (payload?.schema !== "fast-figure-project" || payload.version !== PACKAGE_FORMAT_VERSION)
    throw Error("지원하지 않는 FFPX 프로젝트 형식입니다.");
  const defaults = BackendSettings.project_object, limits = BackendSettings.defaults.limits,
    own = (source, key, fallback) => Object.hasOwn(source, key) ? source[key] : fallback,
    record = value => !!value && typeof value === "object" && !Array.isArray(value);
  if (payload.kind !== "fast-figure-project-object" || !record(payload.meta) ||
      typeof payload.meta.projectName !== "string" ||
      payload.meta.projectName.length > BackendSettings.defaults.naming.projectNameMaxLength || !record(payload.layout) ||
      !Number.isInteger(payload.layout.gridRows) || !Number.isInteger(payload.layout.gridCols) ||
      payload.layout.gridRows < limits.layout.gridRows[0] || payload.layout.gridRows > limits.layout.gridRows[1] ||
      payload.layout.gridCols < limits.layout.gridCols[0] || payload.layout.gridCols > limits.layout.gridCols[1] ||
      !Array.isArray(payload.charts) || !Array.isArray(payload.slots) || !record(payload.fileSystem) || !record(payload.assets))
    throw Error("프로젝트 이름, grid 또는 목록 구조가 올바르지 않습니다.");
  const candidate = structuredClone(payload);
  delete candidate.schema; delete candidate.version; delete candidate.layout.layoutMapWidth;
  candidate.assets = { csvFiles: [], images: [] }; candidate.slots = []; candidate.nextId = {};
  const paths = new Set();
  for (const [kind, collection] of [["csv", payload.assets.csvFiles], ["image", payload.assets.images]]) {
    if (!Array.isArray(collection)) throw Error("프로젝트 자산 목록이 없습니다.");
    const ids = new Set();
    for (const raw of collection) {
      if (!record(raw) || !Number.isInteger(raw.id) || raw.id < 1 || ids.has(raw.id) ||
          typeof raw.bytesBase64 !== "string" || (kind === "image" && Object.hasOwn(raw, "imageSettings")))
        throw Error("프로젝트 자산 데이터가 올바르지 않습니다.");
      const path = projectAssetPath(raw);
      if (paths.has(path) || !candidate.fileSystem.directories?.includes(projectParentPath(path)))
        throw Error("프로젝트 자산 경로가 중복되거나 parent가 없습니다.");
      ids.add(raw.id); paths.add(path);
      const asset = { id: raw.id, directory: projectParentPath(path), name: projectPathName(path),
        mime: raw.mime, bytesBase64: ffpxBytesToBase64(ffpxBase64ToBytes(raw.bytesBase64)) };
      if (kind === "csv") {
        asset.rows = dataTable(raw.rows);
        asset.headerLines = headerLineCount(own(raw, "headerLines", 1), asset.rows);
      }
      candidate.assets[kind === "csv" ? "csvFiles" : "images"].push(asset);
    }
  }
  for (const chart of candidate.charts) {
    if (!record(chart?.editor) || !Array.isArray(chart.editor.objects) || !Number.isInteger(chart.id) || chart.id < 1)
      throw Error("프로젝트 차트 구조가 올바르지 않습니다.");
    chart.editor.globalSettings = normalizeGlobalSettings(chart.editor.globalSettings);
    chart.editor.objects = chart.editor.objects.map(object =>
      fillMissingSettingRecord(object, BackendSettings.defaults.chartSettings.editor.objectStyle));
    validateChartModel(chart, "프로젝트 차트", candidate.assets.csvFiles);
  }
  const slotIds = new Set(), owners = new Map(candidate.charts.map(chart => [chart.id, 0]));
  for (const raw of payload.slots) {
    const slot = normalizeSlotContent(structuredClone(raw));
    if (!slot || !Number.isInteger(slot.id) || slotIds.has(slot.id) || typeof slot.hidden !== "boolean" ||
        ![slot.row, slot.col, slot.rowSpan, slot.colSpan].every(value => Number.isInteger(value) && value > 0) ||
        slot.row + slot.rowSpan - 1 > candidate.layout.gridRows || slot.col + slot.colSpan - 1 > candidate.layout.gridCols ||
        !["graph", "image"].includes(slot.content.contentType) ||
        (slot.content.chart !== null && slot.content.imageId !== null) ||
        (slot.content.chart !== null && !owners.has(slot.content.chart)) ||
        (slot.content.imageId !== null && !candidate.assets.images.some(image => image.id === slot.content.imageId)) ||
        !(slot.caption === null || typeof slot.caption === "string"))
      throw Error("프로젝트 슬롯 데이터가 올바르지 않습니다.");
    slotIds.add(slot.id);
    if (slot.content.chart !== null) owners.set(slot.content.chart, owners.get(slot.content.chart) + 1);
    if (!["contain", "cover", "manual"].includes(slot.content.imageSettings.fit) ||
        Object.entries(limits.imageSettings).some(([key, [min, max]]) =>
          !Number.isFinite(slot.content.imageSettings[key]) || slot.content.imageSettings[key] < min || slot.content.imageSettings[key] > max))
      throw Error("프로젝트 슬롯 이미지 설정이 올바르지 않습니다.");
    candidate.slots.push(slot);
  }
  if ([...owners.values()].some(count => count !== 1)) throw Error("프로젝트 차트의 슬롯 소유권이 올바르지 않습니다.");
  candidate.layout = fillMissingSettingRecord(candidate.layout, defaults.layout);
  if (!Object.hasOwn(candidate, "annotations")) candidate.annotations = {};
  if (!record(candidate.annotations)) throw Error("프로젝트 annotation 구조가 올바르지 않습니다.");
  for (const key of ["labels", "captions"])
    candidate.annotations[key] = fillMissingSettingRecord(own(candidate.annotations, key, {}), defaults.annotations[key]);
  for (const key of ["text", "afterText", "name"])
    if (!Object.hasOwn(candidate.annotations.captions, key)) candidate.annotations.captions[key] = "";
  if (!Object.hasOwn(candidate, "appearance")) candidate.appearance = {};
  if (!record(candidate.appearance)) throw Error("프로젝트 appearance 구조가 올바르지 않습니다.");
  const palette = own(candidate.appearance, "uiPalette", {});
  if (!record(palette)) throw Error("프로젝트 palette 구조가 올바르지 않습니다.");
  candidate.appearance.uiPalette = Object.fromEntries(Object.entries(DEFAULT_UI_PALETTE)
    .map(([key, fallback]) => [key, projectColor(palette[key], fallback)]));
  candidate.export = fillMissingSettingRecord(own(candidate, "export", {}), defaults.export);
  if (!Object.hasOwn(candidate.export, "width")) candidate.export.width = candidate.layout.slotStyle.referenceWidth;
  if (!Object.hasOwn(candidate.export, "height")) candidate.export.height = candidate.export.heightMode === "auto"
    ? null : limits.export.logicalHeight[0];
  for (const [kind, collection] of [["csv", candidate.assets.csvFiles], ["image", candidate.assets.images],
      ["chart", candidate.charts]]) candidate.nextId[kind] = Math.max(0, ...collection.map(item => item.id)) + 1;
  validateProjectObjectState(candidate, { requireSlots: true });
  return new ProjectObject(candidate);
}

export function ffpxBytesToBase64(bytes) {
  let text = "",
    step = 0x8000;
  for (let i = 0; i < bytes.length; i += step)
    text += String.fromCharCode(...bytes.subarray(i, i + step));
  return btoa(text);
}

export function ffpxBase64ToBytes(value) {
  let text = atob(value),
    bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  return bytes;
}

export function ffpxConcat(parts, total) {
  let result = new Uint8Array(total),
    offset = 0;
  for (let part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

export let ffpxCrcTable = null;

export function ffpxCrc32(bytes) {
  if (!ffpxCrcTable) {
    ffpxCrcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let value = i;
      for (let bit = 0; bit < 8; bit++)
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      ffpxCrcTable[i] = value >>> 0;
    }
  }
  let value = 0xffffffff;
  for (let byte of bytes) value = ffpxCrcTable[(value ^ byte) & 255] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

export function ffpxZipStore(entries) {
  let encoder = new TextEncoder(),
    prepared = entries.map((entry) => {
      if (
        !entry ||
        typeof entry.name !== "string" ||
        !entry.name ||
        entry.name.split(/[\\/]/).includes("..") ||
        /^[\\/]|^[A-Za-z]:[\\/]/.test(entry.name)
      )
        throw Error("FFPX 자산 경로가 올바르지 않습니다.");
      let name = encoder.encode(entry.name),
        data = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data);
      if (name.length > 0xffff || data.length > 0xffffffff)
        throw Error("FFPX 자산 크기가 너무 큽니다.");
      return { name, data, crc: ffpxCrc32(data) };
    }),
    localSize = prepared.reduce(
      (sum, entry) => sum + 30 + entry.name.length + entry.data.length,
      0,
    ),
    centralSize = prepared.reduce((sum, entry) => sum + 46 + entry.name.length, 0),
    parts = [],
    offset = 0;
  for (let entry of prepared) {
    let header = new Uint8Array(30),
      view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(8, 0, true);
    view.setUint32(14, entry.crc, true);
    view.setUint32(18, entry.data.length, true);
    view.setUint32(22, entry.data.length, true);
    view.setUint16(26, entry.name.length, true);
    parts.push(header, entry.name, entry.data);
    entry.offset = offset;
    offset += header.length + entry.name.length + entry.data.length;
  }
  let central = [];
  for (let entry of prepared) {
    let header = new Uint8Array(46),
      view = new DataView(header.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint32(16, entry.crc, true);
    view.setUint32(20, entry.data.length, true);
    view.setUint32(24, entry.data.length, true);
    view.setUint16(28, entry.name.length, true);
    view.setUint32(42, entry.offset, true);
    central.push(header, entry.name);
  }
  let end = new Uint8Array(22),
    endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, prepared.length, true);
  endView.setUint16(10, prepared.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, localSize, true);
  return ffpxConcat([...parts, ...central, end], localSize + centralSize + end.length);
}

export function ffpxZipRead(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 22)
    throw Error("FFPX ZIP 파일이 너무 작습니다.");
  let view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 0x10016); i--)
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  if (end < 0) throw Error("FFPX ZIP 종료 정보를 찾을 수 없습니다.");
  if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true))
    throw Error("분할 ZIP은 지원하지 않습니다.");
  let count = view.getUint16(end + 10, true),
    centralSize = view.getUint32(end + 12, true),
    offset = view.getUint32(end + 16, true);
  if (offset + centralSize > end)
    throw Error("FFPX ZIP 중앙 디렉터리가 올바르지 않습니다.");
  let decoder = new TextDecoder(),
    assets = new Map(),
    cursor = offset;
  for (let index = 0; index < count; index++) {
    if (cursor + 46 > offset + centralSize || view.getUint32(cursor, true) !== 0x02014b50)
      throw Error("FFPX ZIP 항목이 올바르지 않습니다.");
    let flags = view.getUint16(cursor + 8, true),
      method = view.getUint16(cursor + 10, true),
      crc = view.getUint32(cursor + 16, true),
      compressed = view.getUint32(cursor + 20, true),
      size = view.getUint32(cursor + 24, true),
      nameLength = view.getUint16(cursor + 28, true),
      extraLength = view.getUint16(cursor + 30, true),
      commentLength = view.getUint16(cursor + 32, true),
      localOffset = view.getUint32(cursor + 42, true),
      next = cursor + 46 + nameLength + extraLength + commentLength;
    if (flags || method !== 0 || compressed !== size || next > offset + centralSize)
      throw Error("FFPX는 압축되지 않은 STORE ZIP만 지원합니다.");
    let name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    if (
      !name ||
      name.split(/[\\/]/).includes("..") ||
      /^[\\/]|^[A-Za-z]:[\\/]/.test(name) ||
      assets.has(name) ||
      localOffset + 30 > bytes.length ||
      view.getUint16(cursor + 34, true) !== 0 ||
      view.getUint32(localOffset, true) !== 0x04034b50
    )
      throw Error("FFPX 자산 경로가 올바르지 않습니다.");
    let localNameLength = view.getUint16(localOffset + 26, true),
      localExtraLength = view.getUint16(localOffset + 28, true),
      start = localOffset + 30 + localNameLength + localExtraLength;
    if (start + size > offset ||
        view.getUint16(localOffset + 6, true) !== flags || view.getUint16(localOffset + 8, true) !== method ||
        view.getUint32(localOffset + 14, true) !== crc ||
        view.getUint32(localOffset + 18, true) !== compressed || view.getUint32(localOffset + 22, true) !== size ||
        decoder.decode(bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength)) !== name)
      throw Error("FFPX ZIP local entry가 올바르지 않습니다.");
    let data = bytes.slice(start, start + size);
    if (ffpxCrc32(data) !== crc) throw Error("FFPX 자산 CRC 검증에 실패했습니다.");
    assets.set(name, data);
    cursor = next;
  }
  return assets;
}

export function serializeNewDataTable(rows, path) {
  const extension = String(path).toLowerCase();
  if (extension.endsWith(".json")) return new TextEncoder().encode(JSON.stringify(rows));
  const delimiter = extension.endsWith(".tsv") ? "\t" : ",",
    cell = value => {
      const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
      return text.includes(delimiter) || /["\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
  return new TextEncoder().encode(rows.map(row => row.map(cell).join(delimiter)).join("\n"));
}

export function parseProjectCsvAsset(name, bytes) {
  let text = new TextDecoder().decode(bytes);
  if (String(name).toLowerCase().endsWith(".json")) {
    let data = JSON.parse(text);
    if (!Array.isArray(data) && Array.isArray(data?.data)) data = data.data;
    return dataTable(data);
  }
  const extension = /\.[^./]+$/.exec(String(name))?.[0]?.toLowerCase();
  if (![".csv", ".tsv"].includes(extension)) throw Error("지원하는 데이터 확장자가 아닙니다.");
  return parseCSV(text, extension === ".tsv" ? "\t" : ",");
}

export function projectCsvDataRef(csv) {
  const extension = /\.[^./]+$/.exec(csv.name || "")?.[0]?.toLowerCase();
  return `data/csv-${csv.id}${[".json", ".tsv", ".csv"].includes(extension) ? extension : ".csv"}`;
}

export function ffpxDataUrlBytes(url) {
  let match = /^data:([^,]*),(.*)$/s.exec(url || "");
  if (!match) throw Error("이미지 데이터 URL이 올바르지 않습니다.");
  let meta = match[1].split(";"),
    mime = meta[0] || "application/octet-stream",
    base64 = meta.slice(1).some((value) => value.toLowerCase() === "base64");
  return {
    mime,
    data: base64
      ? ffpxBase64ToBytes(match[2])
      : new TextEncoder().encode(decodeURIComponent(match[2])),
  };
}

export function ffpxMimeExtension(mime) {
  return (
    {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/bmp": "bmp",
      "image/svg+xml": "svg",
    }[mime] || "bin"
  );
}

export function ffpxXmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function ffpxXmlValue(value) {
  if (value === null) return '<value type="null"/>';
  if (Array.isArray(value))
    return `<value type="array">${Array.from(value)
      .map((item) => `<item>${ffpxXmlValue(item)}</item>`)
      .join("")}</value>`;
  if (typeof value === "object")
    return `<value type="object">${Object.entries(value)
      .map(
        ([name, item]) =>
          `<property name="${ffpxXmlEscape(name)}">${ffpxXmlValue(item)}</property>`,
      )
      .join("")}</value>`;
  if (!["boolean", "number", "string"].includes(typeof value) ||
      (typeof value === "number" && !Number.isFinite(value)))
    throw Error("FFPX XML로 기록할 수 없는 값입니다.");
  return `<value type="${typeof value}">${ffpxXmlEscape(value)}</value>`;
}

export function ffpxXmlReadValue(element) {
  if (!element || element.tagName !== "value")
    throw Error("FFPX XML 값 형식이 올바르지 않습니다.");
  const type = element.getAttribute("type"),
    children = [...element.children],
    hasScalarText = (node) => [...node.childNodes].some(child =>
      (child.nodeType === 3 || child.nodeType === 4) && child.textContent.trim() !== ""),
    requireShape = (valid) => {
      if (!valid) throw Error("FFPX XML 값 구조가 올바르지 않습니다.");
    };
  if (type === "null") {
    requireShape(children.length === 0 && !hasScalarText(element));
    return null;
  }
  if (type === "array" || type === "object") {
    requireShape(!hasScalarText(element));
    const result = type === "array" ? [] : {};
    for (const child of children) {
      requireShape(child.tagName === (type === "array" ? "item" : "property") &&
        child.children.length === 1 && child.firstElementChild.tagName === "value" &&
        !hasScalarText(child) && (type === "array" || child.hasAttribute("name")));
      const decoded = ffpxXmlReadValue(child.firstElementChild);
      if (type === "array") result.push(decoded);
      else Object.defineProperty(result, child.getAttribute("name"), {
        value: decoded, enumerable: true, configurable: true, writable: true,
      });
    }
    return result;
  }
  requireShape(children.length === 0);
  if (type === "boolean") {
    requireShape(element.textContent === "true" || element.textContent === "false");
    return element.textContent === "true";
  }
  if (type === "number") {
    let number = Number(element.textContent);
    if (!element.textContent.trim() || !Number.isFinite(number))
      throw Error("FFPX XML 숫자 값이 올바르지 않습니다.");
    return number;
  }
  if (type === "string") return element.textContent;
  throw Error("FFPX XML 값 유형이 올바르지 않습니다.");
}

export function ffpxXmlDocument(root, version, children) {
  return `<?xml version="1.0" encoding="UTF-8"?><${root} version="${version}">${children}</${root}>`;
}

export function ffpxReadXmlDocument(assets, name, root) {
  let bytes = assets.get(name);
  if (!bytes) throw Error(`FFPX ${name}이 없습니다.`);
  let documentNode = new DOMParser().parseFromString(
      new TextDecoder().decode(bytes),
      "application/xml",
    ),
    rootNode = documentNode.documentElement;
  if (
    documentNode.querySelector("parsererror") ||
    rootNode?.tagName !== root ||
    rootNode.getAttribute("version") !== String(PACKAGE_FORMAT_VERSION)
  )
    throw Error(`FFPX ${name} 형식이 올바르지 않습니다.`);
  return rootNode;
}

export function ffpxDirectChild(root, name, optional = false) {
  const nodes = [...root.children].filter((child) => child.tagName === name);
  if (nodes.length === 0 && optional) return null;
  if (nodes.length !== 1) throw Error(`FFPX ${name} 단일 요소가 필요합니다.`);
  return nodes[0];
}

export function ffpxWrappedValue(node) {
  const children = [...node.children];
  if (children.length !== 1 || children[0].tagName !== "value" ||
      [...node.childNodes].some((child) => (child.nodeType === 3 || child.nodeType === 4) && child.textContent.trim()))
    throw Error("FFPX 단일 typed value가 필요합니다.");
  return ffpxXmlReadValue(children[0]);
}

export function ffpxNamedValue(root, name) {
  return ffpxWrappedValue(ffpxDirectChild(root, name));
}

export function ffpxDeriveHiddenSlots(slotList) {
  const slots = projectClone(slotList);
  for (const slot of slots) slot.hidden = false;
  for (const anchor of slots) {
    if (!Number.isInteger(anchor.rowSpan) || anchor.rowSpan < 1 ||
        !Number.isInteger(anchor.colSpan) || anchor.colSpan < 1 ||
        !Number.isInteger(anchor.row) || !Number.isInteger(anchor.col))
      throw Error("FFPX 병합 geometry가 올바르지 않습니다.");
    if (anchor.rowSpan === 1 && anchor.colSpan === 1) continue;
    for (let row = anchor.row; row < anchor.row + anchor.rowSpan; row++)
      for (let col = anchor.col; col < anchor.col + anchor.colSpan; col++) {
        if (row === anchor.row && col === anchor.col) continue;
        const matches = slots.filter(slot => slot.row === row && slot.col === col);
        if (matches.length !== 1) throw Error("FFPX 병합 영역에 단일 슬롯이 필요합니다.");
        const covered = matches[0];
        if ((covered.content?.chart ?? covered.chart) != null || (covered.content?.imageId ?? covered.imageId) != null)
          throw Error("FFPX 병합 영역의 가려진 슬롯은 비어 있어야 합니다.");
        covered.hidden = true;
      }
  }
  return slots;
}

export function ffpxBuildProject(source = activeProject._state) {
  // Legacy validation installs slot accessors: confine that work to the detached read.
  const snapshot = projectClone(source);
  validateProjectObjectState(snapshot, { requireSlots: true });
  let projectObject = snapshot.meta,
    layoutObject = snapshot.layout,
    labelObject = snapshot.annotations.labels,
    captionObject = snapshot.annotations.captions,
    dataObjects = snapshot.assets.csvFiles.filter((csv) => !projectVfs.isTrashed(projectAssetPath(csv))),
    imageObjects = snapshot.assets.images.filter((image) => !projectVfs.isTrashed(projectAssetPath(image))),
    chartObjects = snapshot.charts,
    slotObjects = snapshot.slots,
    appearanceObject = snapshot.appearance,
    exportObject = snapshot.export,
    manifest = {
      schema: "fast-figure-project",
      version: PACKAGE_FORMAT_VERSION,
      appBuild: projectObject.appBuild,
      projectName: projectObject.projectName,
      exportedAt: new Date().toISOString(),
      gridRows: layoutObject.gridRows,
      gridCols: layoutObject.gridCols,
      csvFiles: [],
      images: [],
      charts: [],
      slots: [],
      annotations: {
        labelsEnabled: labelObject.enabled,
        labelSettings: projectClone(labelObject.settings),
        captionsEnabled: captionObject.enabled,
        captionText: captionObject.text,
        captionAfterText: captionObject.afterText,
        captionName: captionObject.name,
        captionNameBold: captionObject.nameBold,
        captionSettings: projectClone(captionObject.settings),
      },
      slotStyle: projectClone(layoutObject.slotStyle),
      uiPalette: projectClone(appearanceObject.uiPalette),
      export: projectClone(exportObject),
    },
    assets = [];
  for (let csv of dataObjects) {
    let copy = projectClone(csv),
      dataRef = `assets/${projectCsvDataRef(copy)}`;
    delete copy.rows;
    delete copy.bytesBase64;
    copy.dataRef = dataRef;
    manifest.csvFiles.push(copy);
    assets.push({
      name: dataRef,
      data: ffpxBase64ToBytes(csv.bytesBase64),
    });
  }
  for (let image of imageObjects) {
    let copy = projectClone(image),
      dataRef = `assets/media/${image.id}/${projectCsvName(image.name, "image.bin")}`;
    delete copy.bytesBase64;
    delete copy.settings;
    copy.dataRef = dataRef;
    manifest.images.push(copy);
    assets.push({ name: dataRef, data: ffpxBase64ToBytes(image.bytesBase64) });
  }
  for (let chart of chartObjects) {
    chartCsvIds(chart).forEach((id) => {
      let csv = dataObjects.find((item) => item.id === id);
      if (!csv)
        throw Error(`FFPX 차트가 내보낼 수 없는 CSV ${id}를 참조합니다.`);
    });
    manifest.charts.push(chartExportCopy(chart));
  }
  for (let slot of slotObjects) {
    let copy = projectClone(slot);
    if (copy.imageId != null) {
      let image = imageObjects.find((item) => item.id === copy.imageId);
      if (!image)
        throw Error(`FFPX 슬롯이 내보낼 수 없는 이미지 ${copy.imageId}를 참조합니다.`);
    }
    manifest.slots.push(copy);
  }
  let projectDocument = {
      schema: manifest.schema,
      version: manifest.version,
      appBuild: manifest.appBuild,
      projectName: manifest.projectName,
      exportedAt: manifest.exportedAt,
      fileSystem: {
        directories: snapshot.fileSystem.directories.filter((path) => !projectVfs.isTrashed(path)),
      },
      appearance: {
        slotStyle: manifest.slotStyle,
        uiPalette: manifest.uiPalette,
      },
      export: manifest.export,
    },
    layoutDocument = {
      gridRows: manifest.gridRows,
      gridCols: manifest.gridCols,
      placements: manifest.slots.map((slot) => ({
        slotId: slot.id,
        row: slot.row,
        col: slot.col,
        rowSpan: slot.rowSpan,
        colSpan: slot.colSpan,
      })),
    },
    captionDocument = {
      enabled: manifest.annotations.captionsEnabled,
      beforeText: manifest.annotations.captionText,
      afterText: manifest.annotations.captionAfterText,
      name: manifest.annotations.captionName,
      nameBold: manifest.annotations.captionNameBold,
      settings: manifest.annotations.captionSettings,
    },
    labelDocument = {
      enabled: manifest.annotations.labelsEnabled,
      settings: manifest.annotations.labelSettings,
    },
    slotDocuments = manifest.slots.map((slot) => {
      let chart = manifest.charts.find((item) => item.id === slot.chart),
        image = imageObjects.find((item) => item.id === slot.imageId),
        graphObjects = chart?.editor?.objects || [],
        chartState = chart
          ? {
              ...projectClone(chart),
              editor: {
                ...projectClone(chart.editor || {}),
                objects: [],
              },
            }
          : null;
      return {
        slot: {
          id: slot.id,
          contentType: slot.contentType,
        },
        caption: {
          text: typeof slot.caption === "string" ? slot.caption : null,
        },
        graphObjects: chart
          ? graphObjects.map((object) => projectClone(object))
          : [],
        chartState,
        imageObject: {
          imageRef: image?.id ?? null,
          settings: projectClone(slot.imageSettings || DEFAULT_IMAGE_SETTINGS),
        },
      };
    }),
    refs =
      '<assets ref="assets/assets.xml"/><slots ref="slots/"/><layout ref="layout/layout.xml"/><caption ref="caption/caption.xml"/><labels ref="labels/labels.xml"/>';
  manifest.slots.forEach((slot) => {
    delete slot.row;
    delete slot.col;
    delete slot.rowSpan;
    delete slot.colSpan;
  });
  return {
    manifest,
    assets: [
      {
        name: "project.xml",
        data: new TextEncoder().encode(
          ffpxXmlDocument(
            "fastFigureProject",
            PACKAGE_FORMAT_VERSION,
            `${refs}<settings>${ffpxXmlValue(projectDocument)}</settings>`,
          ),
        ),
      },
      {
        name: "assets/assets.xml",
        data: new TextEncoder().encode(
          ffpxXmlDocument(
            "fastFigureAssets",
            PACKAGE_FORMAT_VERSION,
            `<dataAssets>${manifest.csvFiles
              .map(
                (csv) =>
                  `<dataAsset id="${csv.id}" src="${ffpxXmlEscape(csv.dataRef)}">${ffpxXmlValue(csv)}</dataAsset>`,
              )
              .join("")}</dataAssets><imageAssets>${manifest.images
              .map(
                (image) =>
                  `<imageAsset id="${image.id}" src="${ffpxXmlEscape(image.dataRef)}">${ffpxXmlValue(image)}</imageAsset>`,
              )
              .join("")}</imageAssets>`,
          ),
        ),
      },
      {
        name: "layout/layout.xml",
        data: new TextEncoder().encode(
          ffpxXmlDocument(
            "fastFigureLayout",
            PACKAGE_FORMAT_VERSION,
            `<layout>${ffpxXmlValue(layoutDocument)}</layout>`,
          ),
        ),
      },
      {
        name: "caption/caption.xml",
        data: new TextEncoder().encode(
          ffpxXmlDocument(
            "fastFigureCaption",
            PACKAGE_FORMAT_VERSION,
            `<caption>${ffpxXmlValue(captionDocument)}</caption>`,
          ),
        ),
      },
      {
        name: "labels/labels.xml",
        data: new TextEncoder().encode(
          ffpxXmlDocument(
            "fastFigureLabels",
            PACKAGE_FORMAT_VERSION,
            `<labels>${ffpxXmlValue(labelDocument)}</labels>`,
          ),
        ),
      },
      ...slotDocuments.map((document) => ({
        name: `slots/slot-${document.slot.id}.xml`,
        data: new TextEncoder().encode(
          ffpxXmlDocument(
            "fastFigureSlot",
            PACKAGE_FORMAT_VERSION,
            `<slot id="${document.slot.id}" contentType="${ffpxXmlEscape(
              document.slot.contentType,
            )}"><settings>${ffpxXmlValue(document.slot)}</settings><caption>${ffpxXmlValue(
              document.caption,
            )}</caption>${
              document.chartState
                ? `<graph><settings>${ffpxXmlValue(
                    document.chartState,
                  )}</settings><graphObjects>${document.graphObjects
                    .map(
                      (object, index) =>
                        `<graphObject index="${index}">${ffpxXmlValue(object)}</graphObject>`,
                    )
                    .join("")}</graphObjects></graph>`
                : ""
            }${
              document.imageObject
                ? `<imageObject${document.imageObject.imageRef === null ? "" : ` imageRef="${document.imageObject.imageRef}"`}>${ffpxXmlValue(
                    document.imageObject,
                  )}</imageObject>`
                : ""
            }</slot>`,
          ),
        ),
      })),
      ...assets,
    ],
  };
}

export async function ffpxReadProject(file) {
  return ffpxReadProjectBytes(new Uint8Array(await file.arrayBuffer()));
}

export function ffpxReadProjectBytes(bytes) {
  let assets = ffpxZipRead(bytes),
    xmlBytes = assets.get("project.xml");
  if (!xmlBytes) throw Error("FFPX project.xml이 없습니다.");
  let projectRoot = ffpxReadXmlDocument(
        assets,
        "project.xml",
        "fastFigureProject",
      ),
      project = ffpxNamedValue(projectRoot, "settings");
  if (project?.schema !== "fast-figure-project" || project.version !== PACKAGE_FORMAT_VERSION)
    throw Error("지원하지 않는 FFPX 프로젝트 형식입니다.");
  let assetRoot = ffpxReadXmlDocument(
        assets,
        "assets/assets.xml",
        "fastFigureAssets",
      ),
      layoutRoot = ffpxReadXmlDocument(
        assets,
        "layout/layout.xml",
        "fastFigureLayout",
      ),
      captionRoot = ffpxReadXmlDocument(
        assets,
        "caption/caption.xml",
        "fastFigureCaption",
      ),
      labelRoot = ffpxReadXmlDocument(
        assets,
        "labels/labels.xml",
        "fastFigureLabels",
      ),
      layout = ffpxNamedValue(layoutRoot, "layout"),
      caption = ffpxNamedValue(captionRoot, "caption"),
      labels = ffpxNamedValue(labelRoot, "labels"),
      csvFiles = [...ffpxDirectChild(assetRoot, "dataAssets").children]
        .filter((node) => node.tagName === "dataAsset").map(ffpxWrappedValue),
      images = [...ffpxDirectChild(assetRoot, "imageAssets").children]
        .filter((node) => node.tagName === "imageAsset").map(ffpxWrappedValue),
      charts = [],
      slots = [];
    for (let placement of layout.placements || []) {
      let slotRoot = ffpxReadXmlDocument(
          assets,
          `slots/slot-${placement.slotId}.xml`,
          "fastFigureSlot",
        ),
        slotNode = ffpxDirectChild(slotRoot, "slot"),
        slotSettings = ffpxNamedValue(slotNode, "settings"),
        slotCaption = ffpxNamedValue(slotNode, "caption"),
        graphNode = ffpxDirectChild(slotNode, "graph", true),
        imageNode = ffpxDirectChild(slotNode, "imageObject", true),
        chart = graphNode ? ffpxNamedValue(graphNode, "settings") : null;
      if (chart) {
        chart.editor.objects = [...ffpxDirectChild(graphNode, "graphObjects").children]
          .filter((node) => node.tagName === "graphObject").map(ffpxWrappedValue);
        charts.push(chart);
      }
      let imageObject = imageNode ? ffpxWrappedValue(imageNode) : null;
      slots.push({
        ...slotSettings,
        ...placement,
        id: placement.slotId,
        chart: chart?.id ?? null,
        imageId: imageObject?.imageRef ?? null,
        ...(imageObject && Object.hasOwn(imageObject, "settings") ? { imageSettings: projectClone(imageObject.settings) } : {}),
        caption: slotCaption.text,
      });
    }
    slots = ffpxDeriveHiddenSlots(slots);
    let appearance =
      project.appearance && typeof project.appearance === "object"
        ? project.appearance
        : {};
    let payload = {
      ...project,
      schema: "fast-figure-project",
      version: PACKAGE_FORMAT_VERSION,
      gridRows: layout.gridRows,
      gridCols: layout.gridCols,
      slotStyle: appearance.slotStyle,
      uiPalette: appearance.uiPalette,
      csvFiles,
      images,
      charts,
      slots,
      annotations: {
        labelsEnabled: labels.enabled,
        labelSettings: labels.settings,
        captionsEnabled: caption.enabled,
        captionText: caption.beforeText,
        captionAfterText: caption.afterText,
        captionName: caption.name,
        captionNameBold: caption.nameBold,
        captionSettings: caption.settings,
      },
    };
  if (
    payload?.schema !== "fast-figure-project" ||
    payload.version !== PACKAGE_FORMAT_VERSION ||
    !Array.isArray(payload.charts) ||
    !Array.isArray(payload.slots)
  )
    throw Error("지원하지 않는 FFPX 프로젝트 형식입니다.");
  if (!Array.isArray(payload.csvFiles)) throw Error("FFPX CSV 목록이 없습니다.");
  for (let csv of payload.csvFiles) {
    let dataRef = csv?.dataRef;
    if (
      !csv ||
      !Number.isInteger(csv.id) ||
      typeof csv.name !== "string" ||
      typeof dataRef !== "string" ||
      !dataRef.startsWith("assets/data/") ||
      !assets.has(dataRef)
    )
      throw Error("FFPX CSV 자산이 없습니다.");
    csv.rows = parseProjectCsvAsset(csv.name, assets.get(dataRef));
    csv.headerLines = headerLineCount(Object.hasOwn(csv, "headerLines") ? csv.headerLines : 1, csv.rows);
    csv.bytesBase64 = ffpxBytesToBase64(assets.get(dataRef));
    delete csv.dataRef;
  }
  if (!Array.isArray(payload.images)) throw Error("FFPX 이미지 목록이 없습니다.");
  for (let image of payload.images) {
    let dataRef = image?.dataRef;
    if (
      !image ||
      !Number.isInteger(image.id) ||
      typeof image.name !== "string" ||
      typeof dataRef !== "string" ||
      !dataRef.startsWith("assets/media/") ||
      !assets.has(dataRef)
    )
      throw Error("FFPX 이미지 자산이 없습니다.");
    image.bytesBase64 = ffpxBytesToBase64(assets.get(dataRef));
    delete image.dataRef;
  }
  if (!payload.fileSystem || !Array.isArray(payload.fileSystem.directories))
    throw Error("FFPX 폴더 목록이 없습니다.");
  for (const path of PROJECT_FIXED_DIRECTORIES)
    if (!payload.fileSystem.directories.includes(path)) payload.fileSystem.directories.push(path);
  if (!Object.hasOwn(payload, "export")) {
    payload.export = projectClone(BackendSettings.project_object.export);
    payload.export.width = payload.slotStyle?.referenceWidth ?? BackendSettings.project_object.layout.slotStyle.referenceWidth;
    payload.export.height = payload.export.heightMode === "auto" ? null : BackendSettings.defaults.limits.export.logicalHeight[0];
  }
  const captionState = {};
  for (const [source, target] of [["enabled", "enabled"], ["beforeText", "text"],
      ["afterText", "afterText"], ["name", "name"], ["nameBold", "nameBold"], ["settings", "settings"]])
    if (Object.hasOwn(caption, source)) captionState[target] = projectClone(caption[source]);
  const decoded = {
    schema: project.schema, version: project.version, kind: "fast-figure-project-object",
    meta: { projectName: project.projectName, appBuild: project.appBuild },
    layout: { gridRows: layout.gridRows, gridCols: layout.gridCols },
    annotations: { labels: projectClone(labels), captions: captionState },
    fileSystem: payload.fileSystem, assets: { csvFiles: payload.csvFiles, images: payload.images },
    charts, slots: slots.map(slot => ({
      id: slot.id, row: slot.row, col: slot.col, rowSpan: slot.rowSpan, colSpan: slot.colSpan,
      hidden: slot.hidden, caption: slot.caption,
      content: { contentType: slot.contentType, chart: slot.chart, imageId: slot.imageId,
        ...(Object.hasOwn(slot, "imageSettings") ? { imageSettings: slot.imageSettings } : {}) },
    })), appearance: {}, export: payload.export,
  };
  if (Object.hasOwn(appearance, "slotStyle")) decoded.layout.slotStyle = projectClone(appearance.slotStyle);
  if (Object.hasOwn(appearance, "uiPalette")) decoded.appearance.uiPalette = projectClone(appearance.uiPalette);
  return decoded;
}

export function projectFileStem(value) {
  let stem = String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|\x00-\x1F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/, "")
    .slice(0, BackendSettings.defaults.naming.exportStemMaxLength);
  return stem || "fast-figure-project";
}

export function slotFileKind(file) {
  let name = String(file?.name || "").toLowerCase(),
    type = String(file?.type || "").toLowerCase();
  if (name.endsWith(".ffsx")) return "slot";
  if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".json")) return "data";
  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name))
    return "image";
  return "";
}

export function movableProjectNode(path, state = activeProject._state) {
  let match = path ? projectVfs.resolve(path, state) : null;
  if (!match) return false;
  if (match.kind === "directory") return !projectVfs.isFixedDirectory(path);
  return true;
}

export function projectNodeReferenceCount(path, state = activeProject._state) {
  let match = projectVfs.resolve(path, state);
  if (!match) return 0;
  let movingAssets = match.kind === "directory"
    ? projectVfs.descendants(path, state)
    : [{ kind: match.kind, asset: match.asset }];
  return projectAssetReferenceCount(
    new Set(movingAssets.filter(({ kind }) => kind === "csv").map(({ asset }) => asset.id)),
    new Set(movingAssets.filter(({ kind }) => kind === "image").map(({ asset }) => asset.id)), state,
  );
}

export function planProjectNodeMove(path, directory, state = activeProject._state) {
  const match = projectVfs.resolve(path, state);
  if (!match || !movableProjectNode(path, state)) throw Error("이동할 수 없는 프로젝트 항목입니다.");
  const source = match.kind === "directory" ? match.path : projectAssetPath(match.asset),
    targetDirectory = normalizeProjectPath(directory, { directory: true });
  if (!state.fileSystem.directories.includes(targetDirectory)) throw Error("대상 폴더가 없습니다.");
  if (match.kind === "directory" && projectPathInDirectory(targetDirectory, source))
    throw Error("폴더를 자기 자신 또는 하위 폴더로 이동할 수 없습니다.");
  const destination = normalizeProjectPath(`${targetDirectory}/${projectPathName(source)}`,
    { directory: match.kind === "directory" });
  if (destination === source) return null;
  const collision = projectVfs.exists(destination, state),
    uniquePath = collision ? projectVfs.uniquePath(targetDirectory, projectPathName(source), state) : destination,
    enteringTrash = projectVfs.isTrashed(destination) && !projectVfs.isTrashed(source);
  return immutableProjectCopy({ path: source, kind: match.kind, directory: targetDirectory,
    destination, collision, uniqueName: projectPathName(uniquePath), enteringTrash,
    referenceCount: projectNodeReferenceCount(source, state) });
}

export function ffsxBuildSlot(slot, chart, source = activeProject._state) {
  validateChartModel(chart, "FFSX 차트", source.assets.csvFiles);
  let copy = chartExportCopy(chart),
    referenced = chartCsvIds(chart).map((id) => {
      let csv = getProjectCsv(id, source.assets.csvFiles);
      if (!csv) throw Error(`FFSX가 참조하는 CSV ${id}가 없습니다.`);
      return csv;
    }),
    slotIds = new Map(referenced.map((csv, index) => [csv.id, index + 1])),
    packaged = referenced.map((source) => {
      let csv = projectClone(source);
      csv.id = slotIds.get(source.id);
      delete csv.rows;
      delete csv.bytesBase64;
      delete csv.directory;
      csv.dataRef = `assets/${projectCsvDataRef(csv)}`;
      return csv;
    });
  delete copy.id;
  if (!chartUsesConversionView(copy)) copy.editor.objects.forEach((object) => {
    object.csvId = slotIds.get(object.csvId);
  });
  let manifest = {
      schema: "fast-figure-slot",
      version: PACKAGE_FORMAT_VERSION,
      appBuild: source.meta.appBuild,
      exportedAt: new Date().toISOString(),
      slot: {
        contentType: "graph",
        caption: typeof slot.caption === "string" ? slot.caption : null,
      },
      chart: copy,
      csvFiles: packaged,
    };
  let graphObjects = projectClone(manifest.chart.editor?.objects || []),
    chartState = {
      ...projectClone(manifest.chart),
      editor: {
        ...projectClone(manifest.chart.editor || {}),
        objects: [],
      },
    },
    refs = '<assets ref="assets/assets.xml"/>';
  return {
    manifest,
    assets: [
      {
        name: "slot.xml",
        data: new TextEncoder().encode(
          ffpxXmlDocument(
            "fastFigureSlot",
            PACKAGE_FORMAT_VERSION,
            `${refs}<slot contentType="graph"><settings>${ffpxXmlValue(
              { ...manifest.slot, appBuild: manifest.appBuild },
            )}</settings><caption>${ffpxXmlValue({
              text: manifest.slot.caption,
            })}</caption><graph><settings>${ffpxXmlValue(
              chartState,
            )}</settings><graphObjects>${graphObjects
              .map(
                (object, index) =>
                  `<graphObject index="${index}">${ffpxXmlValue(object)}</graphObject>`,
              )
              .join("")}</graphObjects></graph></slot>`,
          ),
        ),
      },
      {
        name: "assets/assets.xml",
        data: new TextEncoder().encode(
          ffpxXmlDocument(
            "fastFigureAssets",
            PACKAGE_FORMAT_VERSION,
            `<dataAssets>${manifest.csvFiles
              .map(
                (csv) =>
                  `<dataAsset id="${csv.id}" src="${ffpxXmlEscape(csv.dataRef)}">${ffpxXmlValue(csv)}</dataAsset>`,
              )
              .join("")}</dataAssets>`,
          ),
        ),
      },
      ...referenced.map((csv, index) => ({
        name: `assets/${projectCsvDataRef({ ...csv, id: index + 1 })}`,
        data: ffpxBase64ToBytes(csv.bytesBase64),
      })),
    ],
  };
}

export async function ffsxReadSlot(file) {
  return ffsxReadSlotBytes(new Uint8Array(await file.arrayBuffer()));
}

export function ffsxReadSlotBytes(bytes) {
  let assets = ffpxZipRead(new Uint8Array(bytes)),
    xmlBytes = assets.get("slot.xml");
  if (!xmlBytes) throw Error("FFSX slot.xml이 없습니다.");
  let slotRoot = ffpxReadXmlDocument(assets, "slot.xml", "fastFigureSlot"),
      slotNode = ffpxDirectChild(slotRoot, "slot"),
      slot = ffpxNamedValue(slotNode, "settings"),
      caption = ffpxNamedValue(slotNode, "caption"),
      graphNode = ffpxDirectChild(slotNode, "graph"),
      chart = ffpxNamedValue(graphNode, "settings"),
      assetRoot = ffpxReadXmlDocument(
        assets,
        "assets/assets.xml",
        "fastFigureAssets",
      );
    if (slot?.contentType !== "graph") throw Error("FFSX graph 슬롯이 필요합니다.");
    delete chart.id;
    delete slot.appBuild;
    chart.editor.objects = [...ffpxDirectChild(graphNode, "graphObjects").children]
      .filter((node) => node.tagName === "graphObject").map(ffpxWrappedValue);
    let payload = {
      schema: "fast-figure-slot",
      version: PACKAGE_FORMAT_VERSION,
      slot: {
        ...slot,
        caption: caption.text,
      },
      chart,
      csvFiles: [...ffpxDirectChild(assetRoot, "dataAssets").children]
        .filter((node) => node.tagName === "dataAsset").map(ffpxWrappedValue),
    };
  if (
    payload?.schema !== "fast-figure-slot" ||
    payload.version !== PACKAGE_FORMAT_VERSION ||
    !payload.chart ||
    typeof payload.chart !== "object"
  )
    throw Error("지원하지 않는 FFSX 슬롯 형식입니다.");
  if (!Array.isArray(payload.csvFiles))
    throw Error("FFSX CSV 목록이 올바르지 않습니다.");
  let slotCsvIds = new Set();
  for (let csv of payload.csvFiles) {
    let dataRef = csv?.dataRef,
      data = typeof dataRef === "string" ? assets.get(dataRef) : null;
    if (
      !csv ||
      typeof csv.name !== "string" ||
      typeof dataRef !== "string" ||
      !dataRef.startsWith("assets/data/") ||
      !data
    )
      throw Error("FFSX 슬롯 CSV 자산이 없습니다.");
    if (!Number.isInteger(csv.id) || csv.id < 1 || slotCsvIds.has(csv.id))
      throw Error("FFSX 슬롯 내부 CSV ID가 올바르지 않습니다.");
    slotCsvIds.add(csv.id);
    csv.rows = parseProjectCsvAsset(csv.name, data);
    csv.headerLines = headerLineCount(Object.hasOwn(csv, "headerLines") ? csv.headerLines : 1, csv.rows);
    csv.bytesBase64 = ffpxBytesToBase64(data);
    delete csv.dataRef;
  }
  validateChartModel(chart, "FFSX 차트", payload.csvFiles);
  return payload;
}
