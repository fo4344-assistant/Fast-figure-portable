// Source: sourcescript/backend/project_efsm.py (same logical owner); pseudocode/backend/project_efsm.pcal.
import { PROJECT_ASSET_DIRECTORIES, buildProjectAssetImportCandidate, buildProjectCsvModel, buildProjectObject, collectAssetReferences, ffpxBase64ToBytes, ffpxBytesToBase64, ffpxReadProjectBytes, ffsxReadSlotBytes, normalizeProjectPath, planProjectNodeMove, projectAssetPath, projectCsvName, projectParentPath, projectPathInDirectory, projectPathName, projectVfs, removeProjectAssetReferences, serializeNewDataTable } from './assets_files.js';
import { chartCsvIds, chartUsesConversionView, columnDefinitions, createCandidateBaseGraphObject, createChartModel, dataTable, graphDataSelection, headerLineCount, normalizeGlobalSettings, normalizeGraphLayoutSettings, parsePlotlyToEditor, readGlobalSettings, rebuildEditableGraph, validateChartModel } from './graphs.js';
import { buildGridResizeCandidate, insertSlotCaptions, resolveLayoutCommandSlots } from './layout_annotations.js';
import { activeProject, getChart, getProjectCsv, getProjectImage, immutableProjectCopy, normalizeSlotContents, projectClone, projectObjects, projectRuntime, readProjectNumber, resetSlotLocalState, setSlotLocalState, slotAt, slotHasNonDefaultLocalState, slotLocalState, validateProjectObjectState } from './project_state.js';
import { BackendSettings, DEFAULT_IMAGE_SETTINGS, DEFAULT_UI_PALETTE } from './settings.js';
import { releaseProjectImageDisplayUrl, releaseProjectImageDisplayUrls } from '../frontend/renderer.js';

// Physical translation of VisualCommitFacts / CalculateProjectionEffect.
// Both inputs belong to this successful commit; never retained as a read store.
export function calculateProjectionEffect(event, pre, post) {
  const visualFacts = source => {
    const render = { layout: source.layout, annotations: source.annotations, appearance: source.appearance,
      slots: [], charts: [], csv: [], images: [] }, references = new Map(),
      reference = parts => { const key = JSON.stringify(parts); references.set(key, (references.get(key) || 0) + 1); };
    for (const slot of source.slots) {
      if (slot.hidden) continue;
      reference(["slot", slot.id]); render.slots.push(slot);
      if (slot.content.contentType === "graph" && slot.content.chart != null) {
        const chart = source.charts.find(chart => chart.id === slot.content.chart);
        if (!chart) throw Error("화면 commit fact의 chart reference가 없습니다.");
        reference(["chart", slot.id, chart.id]); render.charts.push(chart);
        if (!chartUsesConversionView(chart)) for (const object of chart.editor.objects) {
          const csv = source.assets.csvFiles.find(csv => csv.id === object.csvId);
          if (!csv) throw Error("화면 commit fact의 CSV reference가 없습니다.");
          reference(["csv", chart.id, csv.id]);
          render.csv.push({ id: csv.id, rows: csv.rows, headerLines: csv.headerLines });
        }
      } else if (slot.content.contentType === "image" && slot.content.imageId != null) {
        const image = source.assets.images.find(image => image.id === slot.content.imageId);
        if (!image) throw Error("화면 commit fact의 image reference가 없습니다.");
        reference(["image", slot.id, image.id]);
        render.images.push({ id: image.id, bytesBase64: image.bytesBase64, mime: image.mime });
      }
    }
    return { render, references };
  }, before = visualFacts(pre), after = visualFacts(post),
    canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === "object"
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value,
    tree = ["PROJECT_NAME_CHANGED", "PROJECT_DIRECTORY_CREATED", "PROJECT_NODE_MOVED", "PROJECT_TRASH_EMPTIED", "ASSETS_IMPORTED",
      "DATA_OBJECT_CREATED", "DATA_OBJECT_REPLACED", "DATA_OBJECT_DELETED", "IMAGE_OBJECT_CREATED", "IMAGE_OBJECT_REPLACED", "IMAGE_OBJECT_DELETED"];
  return Object.freeze({
    referencesRemoved: [...before.references].some(([key, count]) => count > (after.references.get(key) || 0)),
    pathOnly: tree.includes(event) && JSON.stringify(canonical(before.render)) === JSON.stringify(canonical(after.render)),
  });
}

// Commit and form this attempt's projection facts at the existing replacement boundary.
// No global pre-state, revision token or callback into Frontend is introduced.
function commitProjectCandidate(candidate, event, payload) {
  const pre = activeProject._state;
  activeProject.initialize(candidate);
  payload.projectionEffect = calculateProjectionEffect(event, pre, activeProject._state);
}

export class ProjectStateMachine {
  constructor(objects, actions) {
    this.objects = objects;
    this.actions = actions;
    this.writeLocks = new Set();
  }
  assertWritable(scope, event) {
    if (this.writeLocks.has(scope))
      throw Error(`${event} 전이 중 잠긴 ${scope} 프로젝트 범위를 수정할 수 없습니다.`);
  }
  send(event, payload = {}) {
    let action = this.actions[event];
    if (!action) throw Error(`${event}는 등록된 ProjectObject command가 아닙니다.`);
    // Caller-provided effect flags are never accepted as commit facts.
    delete payload.projectionEffect;
    let committed = action({ machine: this, event, payload }) !== false;
    return Object.freeze({
      event,
      committed,
      changed: immutableProjectCopy(committed ? payload.changed || {} : {}),
      payload,
      removedGraphReferenceCount: payload.removedGraphReferenceCount || 0,
      resetImageSlotCount: payload.resetImageSlotCount || 0,
      selectionHints: payload.selectionHints || null,
      projectionEffect: committed ? payload.projectionEffect || null : null,
    });
  }
}

export function applySlotTypeAction({ machine, event, payload }) {
  machine.assertWritable("slots", "SLOT_TYPE_CHANGED");
  while (true) {
    const source = activeProject._state,
      current = source.slots.find(slot => slot.id === payload.slotId && !slot.hidden);
    if (!Number.isInteger(payload.slotId) || !current) throw Error("콘텐츠 종류를 변경할 visible 슬롯이 없습니다.");
    const candidate = projectClone(source);
    normalizeSlotContents(candidate.slots);
    candidate.slots.find(slot => slot.id === current.id).content.contentType = payload.contentType === "image" ? "image" : "graph";
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const after = activeProject._state.slots.find(slot => slot.id === current.id);
    payload.changed = { slotIds: JSON.stringify(current) === JSON.stringify(after) ? [] : [after.id],
      chartIds: [], csvIds: [], imageIds: [], assets: [] };
    return;
  }
}

export function applyCaptionTextAction({ machine, event, payload }) {
  machine.assertWritable("captions","CAPTION_TEXT_INPUT");
  machine.assertWritable("slots","CAPTION_TEXT_INPUT");
  while (true) {
    const source = activeProject._state, target = payload.target;
    if (target?.kind !== "global" && target?.kind !== "slot") throw Error("캡션 변경 대상이 올바르지 않습니다.");
    const slot = target.kind === "slot" ? source.slots.find(item => item.id === target.id && !item.hidden) : null;
    if (target.kind === "slot" && (!Number.isInteger(target.id) || !slot)) throw Error("캡션을 변경할 visible 슬롯이 없습니다.");
    const text = String(payload.text ?? ""), candidate = projectClone(source);
    normalizeSlotContents(candidate.slots);
    for (const item of candidate.slots) {
      const original = source.slots.find(before => before.id === item.id);
      if (original?.content) item.content = projectClone(original.content);
    }
    if (slot) candidate.slots.find(item => item.id === slot.id).caption = text || null;
    else candidate.annotations.captions.text = text;
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    payload.changed = { slotIds: candidate.slots.filter(after =>
      JSON.stringify(source.slots.find(before => before.id === after.id)) !== JSON.stringify(after)).map(item => item.id),
      chartIds: [], csvIds: [], imageIds: [], assets: [] };
    return;
  }
}

export function applySlotCaptionsInsertedAction({ machine, event, payload }) {
  machine.assertWritable("captions", "SLOT_CAPTIONS_INSERTED");
  while (true) {
    const source = activeProject._state, candidate = projectClone(source);
    normalizeSlotContents(candidate.slots);
    for (const item of candidate.slots) {
      const original = source.slots.find(before => before.id === item.id);
      if (original?.content) item.content = projectClone(original.content);
    }
    const text = insertSlotCaptions(candidate, payload.slotIds ?? null);
    if (text === candidate.annotations.captions.text) return false;
    candidate.annotations.captions.text = text;
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    payload.changed = { slotIds: [], chartIds: [], csvIds: [], imageIds: [], assets: [] };
    return;
  }
}

export function applyDataObjectCreatedAction({ machine, event, payload }) {
  machine.assertWritable("data","DATA_OBJECT_CREATED");
  machine.assertWritable("files","DATA_OBJECT_CREATED");
  while (true) {
    const source = activeProject._state, candidate = projectClone(source),
      rows = projectClone(dataTable(payload.data)),
      requested = payload.path || `${PROJECT_ASSET_DIRECTORIES.csv}/${projectCsvName(payload.name)}`,
      normalized = normalizeProjectPath(requested), directory = projectParentPath(normalized);
    if (!source.fileSystem.directories.includes(directory)) throw Error("CSV 상위 directory가 없습니다.");
    const path = projectVfs.uniquePath(directory, projectPathName(normalized), source),
      id = payload.id == null ? source.nextId.csv : payload.id;
    if (!Number.isInteger(id) || id <= 0 || source.assets.csvFiles.some(csv => csv.id === id))
      throw Error(`CSV ID ${id}가 올바르지 않거나 중복되었습니다.`);
    const original = payload.bytesBase64,
      bytesBase64 = original != null && original !== "" ?
        (ffpxBase64ToBytes(original), original) : ffpxBytesToBase64(serializeNewDataTable(rows, path)),
      csv = { id, rows, bytesBase64, mime: payload.mime || "text/csv",
        headerLines: headerLineCount(payload.headerLines, rows),
        directory: projectParentPath(path), name: projectPathName(path) };
    candidate.assets.csvFiles.push(csv);
    candidate.nextId.csv = Math.max(candidate.nextId.csv, id + 1);
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const committed = activeProject._state.assets.csvFiles.find(item => item.id === id);
    payload.changed = { slotIds: [], chartIds: [], csvIds: [id], imageIds: [],
      assets: [{ role: "created", kind: "csv", id, path: projectAssetPath(committed), owners: [] }] };
    return;
  }
}

export function applyAssetObjectReplacedAction({ machine, payload }, kind) {
  let image=kind==="image",
    event=image?"IMAGE_OBJECT_REPLACED":"DATA_OBJECT_REPLACED",
    scope=image?"images":"data",
    collection=image?activeProject.images:activeProject.csvFiles,
    model=payload.model,
    index=collection.findIndex((item)=>item.id===model?.id),
    previous=index>=0?collection[index]:null;
  machine.assertWritable(scope,event);
  machine.assertWritable("files",event);
  if(!previous||projectAssetPath(model)!==projectAssetPath(previous))
    throw Error(`교체할 ${image?"이미지":"CSV"} 또는 참조 경로가 올바르지 않습니다.`);
  let candidate=projectClone(activeProject._state),
    next=projectClone(model),
    candidateCollection=image?candidate.assets.images:candidate.assets.csvFiles;
  if(image&&previous.settings)next.settings=projectClone(previous.settings);
  candidateCollection[index]=next;
  commitProjectCandidate(validateProjectObjectState(candidate,{requireSlots:true}), event, payload);
  if(image)releaseProjectImageDisplayUrl(previous);
  payload[image?"image":"csv"]=image?getProjectImage(next.id):getProjectCsv(next.id);
}

export function applyDataObjectReplacedAction(context) {
  const { machine, payload } = context;
  if (!Object.hasOwn(payload, "headerLines")) {
    applyAssetObjectReplacedAction(context, "csv");
    return;
  }
  machine.assertWritable("data", "DATA_OBJECT_REPLACED");
  machine.assertWritable("files", "DATA_OBJECT_REPLACED");
  machine.assertWritable("charts", "DATA_OBJECT_REPLACED");
  while (true) {
    const source = activeProject._state,
      current = source.assets.csvFiles.find((csv) => csv.id === payload.csvId);
    if (!current) throw Error("헤더를 변경할 프로젝트 CSV가 없습니다.");
    const candidate = projectClone(source),
      csv = candidate.assets.csvFiles.find((item) => item.id === current.id);
    csv.headerLines = headerLineCount(payload.headerLines, csv.rows);
    candidate.charts.forEach((chart) => {
      if (chart.editor?.editable !== false && chartCsvIds(chart).includes(csv.id))
        rebuildEditableGraph(chart, candidate);
    });
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const post = activeProject._state,
      committed = post.assets.csvFiles.find((item) => item.id === current.id),
      changedIds = (before, after) => after.filter((item) =>
        JSON.stringify(before.find((old) => old.id === item.id)) !== JSON.stringify(item)).map((item) => item.id),
      owners = post.charts.filter((chart) => chartCsvIds(chart).includes(committed.id)).map((chart) => ({
        chartId: chart.id, slotId: post.slots.find((slot) => (slot.content?.chart ?? slot.chart) === chart.id).id,
      }));
    payload.changed = { slotIds: changedIds(source.slots, post.slots),
      chartIds: changedIds(source.charts, post.charts),
      csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles),
      imageIds: changedIds(source.assets.images, post.assets.images),
      assets: [{ role: "updated", kind: "csv", id: committed.id, path: projectAssetPath(committed), owners }] };
    return;
  }
}

export function applyDataObjectDeletedAction(context) {
  return applyAssetObjectDeletedAction(context, "csv");
}

export function applyAssetObjectDeletedAction({ machine, payload }, kind) {
  const event = kind === "csv" ? "DATA_OBJECT_DELETED" : "IMAGE_OBJECT_DELETED",
    target = payload.target;
  machine.assertWritable(kind === "csv" ? "data" : "images", event);
  machine.assertWritable("files", event);
  if (!target || target.kind !== kind || !Number.isInteger(target.id) || typeof target.path !== "string")
    throw Error("삭제할 asset의 kind/id/path reference가 올바르지 않습니다.");
  while (true) {
    const source = activeProject._state, node = projectVfs.resolve(target.path, source);
    if (!node) return false;
    if (node.kind !== kind || node.asset.id !== target.id || projectAssetPath(node.asset) !== target.path)
      throw Error("삭제할 asset의 현재 kind/id/path가 요청과 다릅니다.");
    const candidate = projectClone(source);
    candidate.slots.forEach(slot => {
      const original = source.slots.find(item => item.id === slot.id);
      if (original?.content) slot.content = projectClone(original.content);
    });
    const csvIds = new Set(kind === "csv" ? [target.id] : []),
      imageIds = new Set(kind === "image" ? [target.id] : []);
    if (collectAssetReferences(csvIds, imageIds, candidate).length) {
      for (const domain of ["charts", "slots", "editor"]) machine.assertWritable(domain, event);
    }
    const removedReferences = removeProjectAssetReferences(csvIds, imageIds, candidate),
      collection = kind === "csv" ? "csvFiles" : "images";
    candidate.assets[collection] = candidate.assets[collection].filter(item => item.id !== target.id);
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const post = activeProject._state,
      changedIds = (before, after) => [...new Set([...before, ...after].map(item => item.id))]
        .filter(id => JSON.stringify(before.find(item => item.id === id)) !==
          JSON.stringify(after.find(item => item.id === id)));
    payload.changed = { slotIds: changedIds(source.slots, post.slots), chartIds: changedIds(source.charts, post.charts),
      csvIds: [...csvIds], imageIds: [...imageIds], ...removedReferences,
      assets: [{ role: "deleted", kind, id: target.id, path: target.path, name: node.asset.name }] };
    payload.selectionHints = immutableProjectCopy({ graphObjectIndexMaps: removedReferences.graphObjectIndexMaps });
    if (kind === "image") releaseProjectImageDisplayUrl(node.asset);
    return;
  }
}

export function applyImageObjectCreatedAction({ machine, event, payload }) {
  machine.assertWritable("images","IMAGE_OBJECT_CREATED");
  machine.assertWritable("files","IMAGE_OBJECT_CREATED");
  while (true) {
    const source = activeProject._state, candidate = projectClone(source),
      requested = payload.path || `${PROJECT_ASSET_DIRECTORIES.image}/${projectCsvName(payload.name, "image.bin")}`,
      normalized = normalizeProjectPath(requested), directory = projectParentPath(normalized);
    if (!source.fileSystem.directories.includes(directory)) throw Error("이미지 상위 directory가 없습니다.");
    const path = projectVfs.uniquePath(directory, projectPathName(normalized), source),
      id = payload.id == null ? source.nextId.image : payload.id;
    if (!Number.isInteger(id) || id <= 0 || source.assets.images.some(image => image.id === id))
      throw Error(`이미지 ID ${id}가 올바르지 않거나 중복되었습니다.`);
    const input = payload.bytes,
      bytes = typeof input === "string" ? ffpxBase64ToBytes(input) : new Uint8Array(input || []);
    if (!bytes.length) throw Error("이미지 데이터가 비어 있습니다.");
    candidate.assets.images.push({ id, name: projectPathName(path), directory: projectParentPath(path),
      mime: typeof payload.mime === "string" && payload.mime ? payload.mime : "application/octet-stream",
      bytesBase64: ffpxBytesToBase64(bytes) });
    candidate.nextId.image = Math.max(candidate.nextId.image, id + 1);
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const image = activeProject._state.assets.images.find(item => item.id === id);
    payload.changed = { slotIds: [], chartIds: [], csvIds: [], imageIds: [id],
      assets: [{ role: "created", kind: "image", id, path: projectAssetPath(image), owners: [] }] };
    return;
  }
}

export function applyImageObjectReplacedAction(context) {
  applyAssetObjectReplacedAction(context, "image");
}

export function applyImageObjectDeletedAction(context) {
  return applyAssetObjectDeletedAction(context, "image");
}

export function applySlotsResetAction({ machine, event, payload }) {
  machine.assertWritable("slots", "SLOTS_RESET");
  machine.assertWritable("charts", "SLOTS_RESET");
  machine.assertWritable("workspace", "SLOTS_RESET");
  machine.assertWritable("editor", "SLOTS_RESET");
  while (true) {
    const source = activeProject._state;
    if (!Array.isArray(payload.slotIds) || payload.slotIds.some(id => !Number.isInteger(id)))
      throw Error("초기화할 explicit 슬롯 ID가 올바르지 않습니다.");
    const ids = [...new Set(payload.slotIds)], targets = ids.map(id => source.slots.find(slot => slot.id === id && !slot.hidden));
    if (targets.some(slot => !slot)) throw Error("초기화할 visible 슬롯이 없습니다.");
    const candidate = projectClone(source);
    normalizeSlotContents(candidate.slots);
    const chartIds = new Set();
    for (const id of ids) {
      const slot = candidate.slots.find(slot => slot.id === id);
      if (Number.isInteger(slot.chart)) chartIds.add(slot.chart);
      slot.content = { ...projectClone(BackendSettings.defaults.slotSettings.content), chart: null, imageId: null };
      slot.caption = null;
    }
    candidate.charts = candidate.charts.filter(chart => !chartIds.has(chart.id));
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const after = activeProject._state;
    payload.changed = { slotIds: ids.filter(id => JSON.stringify(source.slots.find(slot => slot.id === id)) !==
      JSON.stringify(after.slots.find(slot => slot.id === id))),
      chartIds: source.charts.filter(chart => !after.charts.some(next => next.id === chart.id)).map(chart => chart.id),
      csvIds: [], imageIds: [], assets: [] };
    return;
  }
}

export function applySlotsSwappedAction({ machine, event, payload }) {
  machine.assertWritable("slots", "SLOTS_SWAPPED");
  machine.assertWritable("workspace", "SLOTS_SWAPPED");
  machine.assertWritable("editor", "SLOTS_SWAPPED");
  while (true) {
    const source = activeProject._state,
      first = source.slots.find(slot => slot.id === payload.sourceSlotId && !slot.hidden),
      second = source.slots.find(slot => slot.id === payload.targetSlotId && !slot.hidden);
    if (!first || !second || first.id === second.id) return false;
    const candidate = projectClone(source);
    normalizeSlotContents(candidate.slots);
    // Legacy slot.toJSON flattens known fields; preserve the complete canonical content instead.
    for (const slot of candidate.slots) {
      const current = source.slots.find(item => item.id === slot.id);
      if (current?.content) slot.content = projectClone(current.content);
    }
    const a = candidate.slots.find(slot => slot.id === first.id), b = candidate.slots.find(slot => slot.id === second.id),
      content = a.content, caption = a.caption;
    a.content = b.content; a.caption = b.caption;
    b.content = content; b.caption = caption;
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const after = activeProject._state;
    const localKey = slot => JSON.stringify([slot.content, slot.caption]);
    payload.changed = { slotIds: [first.id, second.id].filter(id => localKey(source.slots.find(slot => slot.id === id)) !==
      localKey(after.slots.find(slot => slot.id === id))), chartIds: [], csvIds: [], imageIds: [], assets: [] };
    payload.selectionHints = immutableProjectCopy({ swapSlotIds: [first.id, second.id] });
    return;
  }
}

export function applySlotImageLinkedAction(context) {
  return applyProjectAssetConnectedAction(context, "image");
}

export function applyProjectAssetConnectedAction({ machine, payload }, kind) {
  const event = kind === "csv" ? "SLOT_DATA_CONNECTED" : "SLOT_IMAGE_LINKED";
  machine.assertWritable("slots", event);
  if (kind === "csv") machine.assertWritable("charts", event);
  while (true) {
    const source = activeProject._state,
      slot = source.slots.find(item => item.id === payload.slotId && !item.hidden),
      node = typeof payload.path === "string" ? projectVfs.resolve(payload.path, source) : null;
    if (payload.kind !== kind || node?.kind !== kind || projectVfs.isTrashed(payload.path) ||
        !slot || slot.contentType !== (kind === "csv" ? "graph" : "image"))
      throw Error("연결할 현재 non-trash asset kind/path 또는 visible slot type이 올바르지 않습니다.");
    const candidate = projectClone(source);
    candidate.slots.forEach((item, index) => { item.content = projectClone(source.slots[index].content); });
    normalizeSlotContents(candidate.slots);
    const target = candidate.slots.find(item => item.id === slot.id);
    let chart = null;
    if (kind === "image") target.imageId = node.asset.id;
    else {
      chart = candidate.charts.find(item => item.id === target.chart);
      if (chart?.editor?.editable === false) throw Error("편집 가능한 graph slot이 필요합니다.");
      if (!chart) {
        chart = createChartModel({ id: candidate.nextId.chart++, editor: { title: node.asset.name,
          globalSettings: readGlobalSettings({ editor: {} }), plotlyExtensions: { layout: {}, config: {} }, objects: [] } });
        candidate.charts.push(chart); target.chart = chart.id;
      }
      chart.editor.objects.push(createCandidateBaseGraphObject(candidate.assets.csvFiles.find(item => item.id === node.asset.id)));
      rebuildEditableGraph(chart, candidate);
    }
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    payload.changed = { slotIds: slot.chart !== target.chart || slot.imageId !== target.imageId ? [slot.id] : [],
      chartIds: chart ? [chart.id] : [], csvIds: [], imageIds: [], assets: [] };
    if (chart) payload.selectionHints = Object.freeze({ chartId: chart.id, selectedIndexHint: null });
    return;
  }
}

export function applyGraphFirstObjectAction({ machine, event, payload }) {
  machine.assertWritable("slots", "SLOT_DATA_CONNECTED");
  machine.assertWritable("charts", "SLOT_DATA_CONNECTED");
  machine.assertWritable("editor", "SLOT_DATA_CONNECTED");
  while (true) {
    const source = activeProject._state,
      slot = source.slots.find((item) => item.id === payload.slotId && !item.hidden),
      csv = source.assets.csvFiles.find((item) => item.id === payload.csvId);
    if (!slot || slot.contentType !== "graph" || !csv || (slot.content?.chart ?? slot.chart) != null)
      throw Error("첫 오브젝트의 현재 빈 graph 슬롯 또는 CSV가 없습니다.");
    const candidate = projectClone(source);
    normalizeSlotContents(candidate.slots);
    const target = candidate.slots.find((item) => item.id === slot.id),
      candidateCsv = candidate.assets.csvFiles.find((item) => item.id === csv.id),
      chart = createChartModel({ id: candidate.nextId.chart++, editor: {
        title: candidateCsv.name, globalSettings: readGlobalSettings({ editor: {} }),
        plotlyExtensions: { layout: {}, config: {} }, objects: [createCandidateBaseGraphObject(candidateCsv)],
      } });
    candidate.charts.push(chart); target.chart = chart.id;
    rebuildEditableGraph(chart, candidate);
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    payload.changed = { slotIds: [slot.id], chartIds: [chart.id], csvIds: [], imageIds: [], assets: [] };
    payload.selectionHints = Object.freeze({ chartId: chart.id, selectedIndexHint: 0 });
    return;
  }
}

export function applySlotDataConnectedAction(context) {
  if (context.payload.operation === "graphs.addObject") return applyGraphFirstObjectAction(context);
  return applyProjectAssetConnectedAction(context, "csv");
}

export function applyGraphObjectEditAction({ machine, event, payload }) {
  machine.assertWritable("charts", "GRAPH_OBJECTS_REPLACED");
  const defaults = BackendSettings.defaults.chartSettings.editor.objectStyle,
    limits = BackendSettings.defaults.limits.graphObject,
    enums = { type: ["scatter", "markers", "lines+markers", "bar", "hidden"],
      xAxisSide: ["bottom", "top"], yAxisSide: ["left", "right"],
      lineDash: ["solid", "dot", "dash", "dashdot"],
      markerSymbol: ["circle", "square", "diamond", "cross", "x", "triangle-up", "triangle-down"] };
  while (true) {
    const source = activeProject._state, operation = payload.operation,
      target = operation === "graphs.addObject" ? source.slots.find((slot) => slot.id === payload.slotId && !slot.hidden) : null,
      chartId = operation === "graphs.addObject" ? target?.content?.chart ?? target?.chart : payload.chartId,
      current = source.charts.find((chart) => chart.id === chartId),
      owners = source.slots.filter((slot) => (slot.content?.chart ?? slot.chart) === chartId),
      index = payload.index, values = payload.values || {};
    if (!current || owners.length !== 1 || owners[0].hidden || owners[0].contentType === "image" ||
        current.editor?.editable === false)
      throw Error("변경할 현재 편집 가능 차트 또는 유일한 visible graph owner가 없습니다.");
    const validIndex = (value) => Number.isInteger(value) && value >= 0 && value < current.editor.objects.length;
    if (operation === "graphs.moveObject") {
      if (!validIndex(payload.from) || !validIndex(payload.to)) throw Error("이동할 현재 오브젝트 index가 없습니다.");
      if (payload.from === payload.to) return false;
    } else if (!["graphs.applyPalette", "graphs.addObject"].includes(operation) && !validIndex(index)) throw Error("변경할 현재 오브젝트 index가 없습니다.");
    const candidate = projectClone(source), chart = candidate.charts.find((item) => item.id === current.id);
    let selectedIndexHint = index;
    if (operation === "graphs.addObject") {
      const csv = candidate.assets.csvFiles.find((item) => item.id === payload.csvId);
      if (!csv) throw Error("추가할 현재 CSV가 없습니다.");
      chart.editor.objects.push(createCandidateBaseGraphObject(csv));
      selectedIndexHint = chart.editor.objects.length - 1;
    } else if (operation === "graphs.moveObject") {
      const moved = chart.editor.objects.splice(payload.from, 1)[0];
      chart.editor.objects.splice(payload.to, 0, moved);
      selectedIndexHint = payload.to;
    } else if (operation === "graphs.deleteObject") {
      chart.editor.objects.splice(index, 1);
      selectedIndexHint = null;
    } else if (operation === "graphs.applyPalette") {
      if (!Array.isArray(payload.colors) || !payload.colors.length) throw Error("적용할 non-empty 색상 배열이 없습니다.");
      const colors = [];
      for (const color of payload.colors) {
        if (typeof color !== "string" || !color.trim()) throw Error("팔레트 색상은 non-empty text여야 합니다.");
        colors.push(color.trim());
      }
      chart.editor.objects.forEach((object, position) => { object.color = colors[position % colors.length]; });
    } else {
      const object = chart.editor.objects[index], requestedCsvId = Object.hasOwn(values, "csvId") ? values.csvId : null,
        csv = candidate.assets.csvFiles.find((item) => item.id === requestedCsvId) ||
          candidate.assets.csvFiles.find((item) => item.id === object.csvId);
      if (!csv) throw Error("그래프 오브젝트에 연결할 현재 CSV가 없습니다.");
      const columns = new Set(columnDefinitions(csv.rows, csv.headerLines).map((column) => column.id)),
        selection = graphDataSelection(csv.rows, csv.headerLines);
      object.csvId = csv.id;
      for (const key of ["x", "y"]) {
        const value = Object.hasOwn(values, key) ? values[key] : undefined;
        object[key] = columns.has(value) ? value : columns.has(object[key]) ? object[key] : selection[key];
      }
      for (const [key, value] of Object.entries(defaults))
        if (!Object.hasOwn(object, key)) object[key] = projectClone(value);
      for (const [key, allowed] of Object.entries(enums)) {
        if (Object.hasOwn(values, key)) {
          const value = values[key];
          if (allowed.includes(value)) object[key] = value;
        }
      }
      for (const [key, [min, max]] of Object.entries(limits)) {
        if (Object.hasOwn(values, key)) {
          const edit = values[key], value = edit === null ? NaN : Number(edit);
          if (Number.isFinite(value)) object[key] = Math.max(min, Math.min(max, value));
        }
      }
      if (Object.hasOwn(values, "color")) {
        const color = values.color;
        if (typeof color === "string" && color.length) object.color = color;
      }
      if (Object.hasOwn(values, "legendName")) {
        const legend = values.legendName;
        if (typeof legend === "string") object.legendName = legend;
      }
    }
    // NormalizeCommandObjects fills only missing style, never references/order/extensions.
    for (const item of chart.editor.objects) {
      for (const [key, value] of Object.entries(defaults))
        if (!Object.hasOwn(item, key)) item[key] = projectClone(value);
      for (const [key, allowed] of Object.entries(enums))
        if (!allowed.includes(item[key])) throw Error(`그래프 오브젝트 ${key} enum이 올바르지 않습니다.`);
      for (const [key, [min, max]] of Object.entries(limits))
        if (!Number.isFinite(item[key]) || item[key] < min || item[key] > max)
          throw Error(`그래프 오브젝트 ${key} 범위가 올바르지 않습니다.`);
    }
    validateChartModel(chart, "변경할 차트", candidate.assets.csvFiles);
    rebuildEditableGraph(chart, candidate);
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const post = activeProject._state,
      changedIds = (before, after) => after.filter((item) =>
        JSON.stringify(before.find((old) => old.id === item.id)) !== JSON.stringify(item)).map((item) => item.id);
    payload.changed = { slotIds: changedIds(source.slots, post.slots),
      chartIds: changedIds(source.charts, post.charts),
      csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles),
      imageIds: changedIds(source.assets.images, post.assets.images), assets: [] };
    payload.selectionHints = Object.freeze(operation === "graphs.applyPalette" ?
      { chartId: current.id } : { chartId: current.id, selectedIndexHint });
    return;
  }
}

export function applyGraphObjectsReplacedAction(context) {
  const { machine, event, payload } = context;
  if (["graphs.setObjectValues", "graphs.moveObject", "graphs.deleteObject", "graphs.applyPalette", "graphs.addObject"].includes(payload.operation))
    return applyGraphObjectEditAction(context);
  machine.assertWritable("charts", "GRAPH_OBJECTS_REPLACED");
  let current=getChart(payload.chartId);
  if(!current||!current.editor||current.editor.editable===false)
    throw Error("그래프 오브젝트를 변경할 편집 가능 차트가 없습니다.");
  let candidate=projectClone(activeProject._state),
    chart=candidate.charts.find(item=>item.id===payload.chartId);
  chart.editor.objects=Array.isArray(payload.objects)?projectClone(payload.objects):[];
  validateChartModel(chart,"변경할 차트",candidate.assets.csvFiles);
  validateProjectObjectState(candidate,{requireSlots:true});
  commitProjectCandidate(candidate, event, payload);
  chart=getChart(payload.chartId);
  if(chart.editor.editable!==false)rebuildEditableGraph(chart);
  payload.graphObjectCount = chart.editor.objects.length;
  payload.chart=chart;
}

export function applyChartLayoutChangedAction({ machine, event, payload }) {
  machine.assertWritable("charts", "CHART_LAYOUT_CHANGED");
  machine.assertWritable("editor", "CHART_LAYOUT_CHANGED");
  while (true) {
    const source = activeProject._state, slot = source.slots.find(item => item.id === payload.slotId && !item.hidden),
      chartId = slot?.content?.chart ?? slot?.chart, current = source.charts.find(item => item.id === chartId),
      owners = source.slots.filter(item => (item.content?.chart ?? item.chart) === chartId), values = payload.settings;
    if (!slot || slot.contentType === "image" || !current || current.id !== payload.chartId ||
        owners.length !== 1 || current.editor?.editable === false)
      throw Error("전역 설정을 변경할 현재 편집 가능 owning chart가 없습니다.");
    if (!values || typeof values !== "object" || Array.isArray(values)) throw Error("적용할 그래프 설정이 없습니다.");
    const candidate = projectClone(source), chart = candidate.charts.find(item => item.id === chartId),
      settings = projectClone(chart.editor.globalSettings || {}), edits = values.globalSettings;
    if (Object.hasOwn(values, "title")) chart.editor.title = String(values.title ?? "");
    if (edits && typeof edits === "object") {
      for (const key of Object.keys(edits)) if (key !== "axes") settings[key] = edits[key];
      if (edits.axes && typeof edits.axes === "object") {
        settings.axes = { ...settings.axes };
        for (const key of ["xBottom", "xTop", "yLeft", "yRight"])
          if (Object.hasOwn(edits.axes, key)) settings.axes[key] = { ...settings.axes[key], ...edits.axes[key] };
      }
    }
    const key = values.axisKey;
    if (["xBottom", "xTop", "yLeft", "yRight"].includes(key))
      settings.axes = { ...settings.axes, [key]: { ...settings.axes?.[key], ...values.axisValues } };
    chart.editor.globalSettings = normalizeGraphLayoutSettings(settings);
    rebuildEditableGraph(chart, candidate);
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const after = activeProject._state;
    payload.changed = { slotIds: [], chartIds: after.charts.filter(item =>
      JSON.stringify(item) !== JSON.stringify(source.charts.find(before => before.id === item.id))).map(item => item.id),
      csvIds: [], imageIds: [], assets: [] };
    return;
  }
}

export function applyChartModelReplacedAction({ machine, event, payload }) {
  for (const target of ["charts", "editor", "data", "files"])
    machine.assertWritable(target, "CHART_MODEL_REPLACED");
  while (true) {
    const source = activeProject._state,
      owners = source.slots.filter((slot) => (slot.content?.chart ?? slot.chart) === payload.chartId),
      current = source.charts.find((chart) => chart.id === payload.chartId);
    if (!current || owners.length !== 1 || owners[0].hidden || owners[0].contentType === "image" ||
        owners[0].id !== payload.slotId || typeof payload.editable !== "boolean")
      throw Error("편집 상태를 변경할 현재 차트 또는 유일한 graph owner가 없습니다.");
    const candidate = projectClone(source),
      chart = candidate.charts.find((item) => item.id === current.id);
    let created = null;
    if (payload.editable && chart.editor.editable === false && Object.hasOwn(chart.editor, "conversionRows")) {
      if (chart.editor.objects.length) {
        if (!Array.isArray(chart.editor.conversionRows) || !chart.editor.conversionRows.length ||
            !chart.editor.conversionRows.every(Array.isArray))
          throw Error("Plotly 변환 데이터가 없어 편집 가능한 차트로 바꿀 수 없습니다.");
        created = buildProjectCsvModel(chart.editor.conversionRows, "Plotly JSON.csv",
          candidate.nextId.csv, "", "text/csv", 1, candidate);
        projectVfs.prepare(created, "csv", candidate);
        candidate.assets.csvFiles.push(created);
        candidate.nextId.csv = created.id + 1;
        for (const object of chart.editor.objects) object.csvId = created.id;
      }
      delete chart.editor.conversionRows;
    }
    chart.editor.editable = payload.editable;
    validateChartModel(chart, "편집 상태 변경 차트", candidate.assets.csvFiles);
    if (chart.editor.editable) rebuildEditableGraph(chart, candidate);
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const post = activeProject._state,
      changedIds = (before, after) => after.filter((item) =>
        JSON.stringify(before.find((old) => old.id === item.id)) !== JSON.stringify(item)).map((item) => item.id);
    payload.changed = { slotIds: changedIds(source.slots, post.slots),
      chartIds: changedIds(source.charts, post.charts),
      csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles),
      imageIds: changedIds(source.assets.images, post.assets.images),
      assets: created ? [{ role: "created", kind: "csv", id: created.id, path: projectAssetPath(created),
        owners: [{ slotId: owners[0].id, chartId: chart.id }] }] : [] };
    return;
  }
}

export function applyEmptyImageInsertedAction({ machine, event, payload }) {
  machine.assertWritable("slots", "SLOT_IMAGE_IMPORTED");
  machine.assertWritable("images", "SLOT_IMAGE_IMPORTED");
  machine.assertWritable("files", "SLOT_IMAGE_IMPORTED");
  while (true) {
    const source = activeProject._state, current = source.slots.find(slot => slot.id === payload.slotId && !slot.hidden);
    if (!current || (current.content?.contentType ?? current.contentType) !== "image")
      throw Error("빈 이미지를 삽입할 현재 visible image 슬롯이 없습니다.");
    const input = payload.imageInput, bytes = new Uint8Array(input.bytes || []), directory = PROJECT_ASSET_DIRECTORIES.image;
    if (!bytes.length || !source.fileSystem.directories.includes(directory)) throw Error("이미지 데이터 또는 directory가 없습니다.");
    const path = projectVfs.uniquePath(directory, projectCsvName(input.name, "image.bin"), source), id = source.nextId.image;
    if (!Number.isInteger(id) || id <= 0 || source.assets.images.some(image => image.id === id))
      throw Error("이미지 next-id가 올바르지 않습니다.");
    const candidate = projectClone(source);
    normalizeSlotContents(candidate.slots);
    for (const slot of candidate.slots) {
      const original = source.slots.find(item => item.id === slot.id);
      if (original?.content) slot.content = projectClone(original.content);
    }
    candidate.assets.images.push({ id, name: projectPathName(path), directory: projectParentPath(path),
      mime: typeof input.mime === "string" && input.mime ? input.mime : "application/octet-stream", bytesBase64: ffpxBytesToBase64(bytes) });
    candidate.nextId.image = id + 1;
    const target = candidate.slots.find(slot => slot.id === current.id), removedChartId = target.content.chart;
    candidate.charts = candidate.charts.filter(chart => chart.id !== removedChartId);
    target.content.chart = null;
    target.content.imageId = id;
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const image = activeProject._state.assets.images.find(item => item.id === id);
    payload.changed = { slotIds: [current.id], chartIds: Number.isInteger(removedChartId) ? [removedChartId] : [], csvIds: [], imageIds: [id],
      assets: [{ role: "created", kind: "image", id, path: projectAssetPath(image), owners: [{ slotId: current.id, chartId: null }] }] };
    return;
  }
}

export function applySlotImageImportedAction(context) {
  const { machine, event, payload } = context;
  if (payload.operation === "images.insertEmpty") return applyEmptyImageInsertedAction(context);
  machine.assertWritable("slots","SLOT_IMAGE_IMPORTED");
  machine.assertWritable("images","SLOT_IMAGE_IMPORTED");
  machine.assertWritable("charts","SLOT_IMAGE_IMPORTED");
  machine.assertWritable("workspace","SLOT_IMAGE_IMPORTED");
  machine.assertWritable("files","SLOT_IMAGE_IMPORTED");
  let slot=slotAt(payload.slotId),source=payload.model||getProjectImage(payload.imageId);
  if(!slot||!source||!Number.isInteger(source.id)||source.id<1||
    typeof source.name!=="string"||typeof source.bytesBase64!=="string"||!source.bytesBase64)
    throw Error("이미지를 연결할 슬롯 또는 이미지가 없습니다.");
  let candidate=projectClone(activeProject._state);
  normalizeSlotContents(candidate.slots);
  let imageId=source.id;
  if(payload.model){
    if(candidate.assets.images.some(item=>item.id===imageId))
      throw Error(`이미지 ID ${imageId}가 중복되었습니다.`);
    let model=projectClone(source);delete model.settings;
    projectVfs.prepare(model,"image",candidate);
    candidate.assets.images.push(model);
    candidate.nextId.image=Math.max(candidate.nextId.image,imageId+1);
  }
  let target=candidate.slots.find(item=>item.id===slot.id);
  if(Number.isInteger(target.chart))
    candidate.charts=candidate.charts.filter(chart=>chart.id!==target.chart);
  target.chart=null;target.imageId=imageId;target.contentType="image";
  target.content.imageSettings={...DEFAULT_IMAGE_SETTINGS};
  validateProjectObjectState(candidate,{requireSlots:true});
  commitProjectCandidate(candidate, event, payload);
  payload.image=getProjectImage(imageId);
  payload.clearGraphSelection = true;
}

export function applySlotChartImportedAction({ machine, event, payload }) {
  for (const scope of ["slots", "data", "charts", "files"])
    machine.assertWritable(scope, "SLOT_CHART_IMPORTED");
  while (true) {
    const source = activeProject._state,
      slot = source.slots.find(item => item.id === payload.slotId && !item.hidden),
      file = payload.file;
    if (!Number.isInteger(payload.slotId) || !slot) throw Error("불러올 visible 슬롯이 없습니다.");
    if (!file || !(file.bytes instanceof Uint8Array)) throw Error("불러올 copied file bytes가 없습니다.");
    const bytes = new Uint8Array(file.bytes),
      packaged = bytes[0] === 0x50 && bytes[1] === 0x4b,
      input = packaged ? ffsxReadSlotBytes(bytes) : JSON.parse(new TextDecoder().decode(bytes)),
      candidate = projectClone(source);
    normalizeSlotContents(candidate.slots);
    for (const target of candidate.slots) {
      const original = source.slots.find(item => item.id === target.id);
      if (original?.content) target.content = projectClone(original.content);
    }
    if (!packaged && (!input || typeof input !== "object" || (!Array.isArray(input.data) && !input.layout)))
      throw Error("유효한 Plotly JSON이 아닙니다.");
    let chart = packaged ? projectClone(input.chart) : parsePlotlyToEditor(input, null);
    normalizeGlobalSettings(chart);
    const csvIds = [], assets = [];
    if (packaged) {
      const mapping = new Map();
      for (const localId of chartCsvIds(chart)) {
        const local = input.csvFiles.find(item => item.id === localId);
        if (!local || typeof local.name !== "string" || !local.name ||
            projectCsvName(local.name, "") !== local.name)
          throw Error("FFSX CSV 이름 또는 reference가 올바르지 않습니다.");
        const model = projectClone(local);
        model.id = candidate.nextId.csv++;
        model.bytesBase64 = ffpxBytesToBase64(ffpxBase64ToBytes(local.bytesBase64));
        projectVfs.assignLocation(model,
          projectVfs.uniquePath(PROJECT_ASSET_DIRECTORIES.csv, local.name, candidate));
        candidate.assets.csvFiles.push(model);
        mapping.set(localId, model.id); csvIds.push(model.id);
        assets.push({ role: "created", kind: "csv", id: model.id, path: projectAssetPath(model),
          owners: [{ slotId: slot.id, chartId: candidate.nextId.chart }] });
      }
      if (!chartUsesConversionView(chart))
        for (const object of chart.editor.objects) object.csvId = mapping.get(object.csvId);
    }
    chart.id = candidate.nextId.chart++;
    validateChartModel(chart, "불러온 슬롯 차트", candidate.assets.csvFiles);
    const target = candidate.slots.find(item => item.id === slot.id),
      oldChartId = target.content.chart;
    candidate.charts = candidate.charts.filter(item => item.id !== oldChartId);
    candidate.charts.push(chart);
    target.content.chart = chart.id;
    target.content.imageId = null;
    target.content.contentType = "graph";
    if (packaged) target.caption = input.slot.caption;
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    payload.changed = { slotIds: [slot.id],
      chartIds: [...new Set([oldChartId, chart.id].filter(Number.isInteger))],
      csvIds, imageIds: [], assets };
    payload.selectionHints = immutableProjectCopy({ chartId: chart.id, selectedIndexHint: null });
    return;
  }
}

export function applyGridLayoutChangedAction({ machine, event, payload }) {
  machine.assertWritable("layout", "GRID_LAYOUT_CHANGED");
  machine.assertWritable("slots", "GRID_LAYOUT_CHANGED");
  const candidate = buildGridResizeCandidate(payload.rows, payload.cols);
  commitProjectCandidate(candidate, event, payload);
  payload.clearGraphSelection = true;
  payload.selectionHints = { reResolveSlotSelection: true, clearAssetSelection: true };
}

export function applyProjectDirectoryCreatedAction({ machine, event, payload }) {
  machine.assertWritable("files","PROJECT_DIRECTORY_CREATED");
  while (true) {
    const source = activeProject._state,
      parent = normalizeProjectPath(payload.parent, { directory: true }),
      rawName = String(payload.name || "").trim(), name = projectCsvName(rawName, "");
    if (parent !== "/" && !source.fileSystem.directories.includes(parent))
      throw Error(`상위 폴더 ${parent}가 없습니다.`);
    if (!name || name !== rawName || /[\\/]/.test(rawName))
      throw Error("폴더 이름이 올바르지 않습니다.");
    const path = normalizeProjectPath(`${parent}/${name}`, { directory: true });
    if (projectVfs.exists(path, source)) throw Error(`${path}가 이미 존재합니다.`);
    const candidate = projectClone(source);
    candidate.fileSystem.directories.push(path);
    candidate.fileSystem.directories.sort();
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const actual = projectVfs.resolve(path, activeProject._state);
    payload.changed = { slotIds: [], chartIds: [], csvIds: [], imageIds: [], assets: [],
      createdDirectoryPath: actual.path };
    return;
  }
}

export function applyProjectTrashEmptiedAction({ machine, event, payload }) {
  machine.assertWritable("files","PROJECT_TRASH_EMPTIED");
  machine.assertWritable("data","PROJECT_TRASH_EMPTIED");
  machine.assertWritable("images","PROJECT_TRASH_EMPTIED");
  while (true) {
    const source = activeProject._state, candidate = projectClone(source);
    candidate.slots.forEach(slot => {
      const original = source.slots.find(item => item.id === slot.id);
      if (original?.content) slot.content = projectClone(original.content);
    });
    const csvFiles = candidate.assets.csvFiles.filter(csv => projectVfs.isTrashed(projectAssetPath(csv))),
      images = candidate.assets.images.filter(image => projectVfs.isTrashed(projectAssetPath(image))),
      directories = candidate.fileSystem.directories.filter(path =>
        !projectVfs.isFixedDirectory(path) && projectVfs.isTrashed(path)),
      csvIds = new Set(csvFiles.map(csv => csv.id)), imageIds = new Set(images.map(image => image.id));
    if (collectAssetReferences(csvIds, imageIds, candidate).length) {
      machine.assertWritable("charts", "PROJECT_TRASH_EMPTIED");
      machine.assertWritable("slots", "PROJECT_TRASH_EMPTIED");
      machine.assertWritable("editor", "PROJECT_TRASH_EMPTIED");
    }
    const removedReferences = removeProjectAssetReferences(csvIds, imageIds, candidate);
    candidate.assets.csvFiles = candidate.assets.csvFiles.filter(csv => !csvIds.has(csv.id));
    candidate.assets.images = candidate.assets.images.filter(image => !imageIds.has(image.id));
    candidate.fileSystem.directories = candidate.fileSystem.directories.filter(path => !directories.includes(path));
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const post = activeProject._state,
      changedIds = (before, after) => [...new Set([...before, ...after].map(item => item.id))]
        .filter(id => JSON.stringify(before.find(item => item.id === id)) !==
          JSON.stringify(after.find(item => item.id === id)));
    Object.assign(payload, removedReferences, { csvCount: csvFiles.length, imageCount: images.length,
      directoryCount: directories.length,
      removedReferenceCount: removedReferences.removedGraphReferenceCount + removedReferences.resetImageSlotCount });
    payload.changed = { slotIds: changedIds(source.slots, post.slots), chartIds: changedIds(source.charts, post.charts),
      csvIds: [...csvIds], imageIds: [...imageIds], assets: [], ...removedReferences,
      csvCount: csvFiles.length, imageCount: images.length, directoryCount: directories.length };
    payload.selectionHints = immutableProjectCopy({ graphObjectIndexMaps: removedReferences.graphObjectIndexMaps });
    images.forEach(releaseProjectImageDisplayUrl);
    return;
  }
}

export function applyProjectNodeMovedAction({ machine, event, payload }) {
  machine.assertWritable("files", "PROJECT_NODE_MOVED");
  while (true) {
    const source = activeProject._state,
      plan = planProjectNodeMove(payload.path, payload.directory, source);
    if (!plan) return false;
    const candidate = projectClone(source);
    candidate.slots.forEach(slot => {
      const original = source.slots.find(item => item.id === slot.id);
      if (original?.content) slot.content = projectClone(original.content);
    });
    const match = projectVfs.resolve(plan.path, candidate),
      moving = match.kind === "directory" ? projectVfs.descendants(plan.path, candidate) : [match],
      csvIds = new Set(moving.filter(node => node.kind === "csv").map(node => node.asset.id)),
      imageIds = new Set(moving.filter(node => node.kind === "image").map(node => node.asset.id));
    if (csvIds.size) machine.assertWritable("data", "PROJECT_NODE_MOVED");
    if (imageIds.size) machine.assertWritable("images", "PROJECT_NODE_MOVED");
    let destination = plan.destination;
    if (projectVfs.exists(destination, candidate)) {
      if (!payload.useUniqueName) throw Error(`${destination}가 이미 존재합니다.`);
      destination = projectVfs.uniquePath(plan.directory, projectPathName(plan.path), candidate);
    }
    const enteringTrash = !projectVfs.isTrashed(plan.path) && projectVfs.isTrashed(destination);
    let removed = { removedGraphReferenceCount: 0, resetImageSlotCount: 0, graphObjectIndexMaps: [] };
    if (enteringTrash) {
      for (const domain of ["charts", "slots", "editor"]) machine.assertWritable(domain, "PROJECT_NODE_MOVED");
      removed = removeProjectAssetReferences(csvIds, imageIds, candidate);
    }
    const rewrite = path => `${destination}${path.slice(plan.path.length)}`;
    if (match.kind === "directory") {
      candidate.fileSystem.directories = candidate.fileSystem.directories.map(path =>
        projectPathInDirectory(path, plan.path) ? rewrite(path) : path).sort();
      moving.forEach(({ asset }) => { asset.directory = projectParentPath(rewrite(projectAssetPath(asset))); });
    } else {
      match.asset.directory = projectParentPath(destination);
      match.asset.name = projectPathName(destination);
    }
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const post = activeProject._state,
      changedIds = (before, after) => [...new Set([...before, ...after].map(item => item.id))]
        .filter(id => JSON.stringify(before.find(item => item.id === id)) !==
          JSON.stringify(after.find(item => item.id === id)));
    payload.changed = { slotIds: changedIds(source.slots, post.slots), chartIds: changedIds(source.charts, post.charts),
      csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles),
      imageIds: changedIds(source.assets.images, post.assets.images),
      movedPathFrom: plan.path, movedPathTo: destination, ...removed };
    payload.selectionHints = immutableProjectCopy({ movedPathFrom: plan.path, movedPathTo: destination,
      enteringTrash, graphObjectIndexMaps: removed.graphObjectIndexMaps });
    return;
  }
}

export function applyProjectNameChangedAction({ machine, event, payload }) {
  machine.assertWritable("project", "PROJECT_NAME_CHANGED");
  while (true) {
    const source = activeProject._state;
    let name = String(payload.value);
    if (payload.trim === true) name = name.trim();
    const candidate = projectClone(source);
    candidate.meta.projectName = name.slice(0, BackendSettings.defaults.naming.projectNameMaxLength);
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const post = activeProject._state,
      changedIds = (before, after) => [...new Set([...before, ...after].map(item => item.id))]
        .filter(id => JSON.stringify(before.find(item => item.id === id)) !==
          JSON.stringify(after.find(item => item.id === id)));
    payload.changed = { slotIds: changedIds(source.slots, post.slots),
      chartIds: changedIds(source.charts, post.charts),
      csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles),
      imageIds: changedIds(source.assets.images, post.assets.images), assets: [] };
    return;
  }
}

export function applyLabelSettingsChangedAction({ machine, event, payload }) {
  machine.assertWritable("labels", "LABEL_SETTINGS_CHANGED");
  let candidate = projectClone(activeProject._state);
  if (Object.prototype.hasOwnProperty.call(payload, "enabled"))
    candidate.annotations.labels.enabled = payload.enabled === true;
  if (payload.settings && typeof payload.settings === "object") {
    const edits = payload.settings, settings = candidate.annotations.labels.settings;
    if (["lower-alpha", "upper-alpha", "decimal", "lower-roman", "upper-roman"].includes(edits.format))
      settings.format = edits.format;
    if (["row-major", "column-major"].includes(edits.order)) settings.order = edits.order;
    if (Object.prototype.hasOwnProperty.call(edits, "parentheses"))
      settings.parentheses = edits.parentheses === true;
    if (Object.prototype.hasOwnProperty.call(edits, "fontFamily"))
      settings.fontFamily = String(edits.fontFamily ?? "");
    if (Object.prototype.hasOwnProperty.call(edits, "fontSize")) {
      const number = Number(edits.fontSize);
      if (Number.isFinite(number))
        settings.fontSize = Math.max(BackendSettings.defaults.limits.labels.fontSizeMin, number);
    }
    for (const key of ["x", "y"]) {
      if (!Object.prototype.hasOwnProperty.call(edits, key)) continue;
      if (!Number.isFinite(edits[key])) throw Error("레이블 위치는 유한한 수여야 합니다.");
      settings[key] = edits[key];
    }
  }
  validateProjectObjectState(candidate, { requireSlots: true });
  commitProjectCandidate(candidate, event, payload);
}

export function applyLabelPositionChangedAction({ machine, event, payload }) {
  machine.assertWritable("labels", "LABEL_POSITION_CHANGED");
  let candidate = projectClone(activeProject._state),
    settings = candidate.annotations.labels.settings,
    defaults = BackendSettings.project_object.annotations.labels.settings,
    x = payload.reset === true ? defaults.x : payload.x,
    y = payload.reset === true ? defaults.y : payload.y;
  if (!Number.isFinite(x) || !Number.isFinite(y))
    throw Error("레이블 위치는 유한한 수여야 합니다.");
  settings.x = x;
  settings.y = y;
  validateProjectObjectState(candidate, { requireSlots: true });
  commitProjectCandidate(candidate, event, payload);
}

export function applyAppearanceChangedAction({ machine, event, payload }) {
  machine.assertWritable("appearance", "APPEARANCE_CHANGED");
  let candidate = projectClone(activeProject._state);
  candidate.appearance.uiPalette = Object.fromEntries(
    Object.entries(DEFAULT_UI_PALETTE).map(([key, fallback]) => {
      const value = payload.palette?.[key];
      return [key, typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback];
    }),
  );
  validateProjectObjectState(candidate, { requireSlots: true });
  commitProjectCandidate(candidate, event, payload);
}

export function applyExportSettingsChangedAction({ machine, event, payload }) {
  machine.assertWritable("export", "EXPORT_SETTINGS_CHANGED");
  while (true) {
    const source = activeProject._state, candidate = projectClone(source), current = source.export,
      next = { ...current }, values = payload.settings || {}, limits = BackendSettings.defaults.limits.export;
    // Legacy slot.toJSON omits canonical content extensions; export edits do not own them.
    normalizeSlotContents(candidate.slots);
    for (const slot of candidate.slots) {
      const original = source.slots.find(item => item.id === slot.id);
      if (original?.content) slot.content = projectClone(original.content);
    }
    for (const [key, allowed] of [["heightMode", ["auto", "explicit"]], ["format", ["png", "jpeg"]]]) {
      if (!Object.prototype.hasOwnProperty.call(values, key)) continue;
      const value = values[key];
      if (allowed.includes(value)) next[key] = value;
    }
    for (const [key, limitKey] of [["width", "logicalWidth"], ["height", "logicalHeight"], ["dpi", "dpi"]]) {
      if (!Object.prototype.hasOwnProperty.call(values, key)) continue;
      const value = values[key];
      // NoValue is not numeric zero; conversion exceptions otherwise propagate.
      const number = value === null ? NaN : Number(value);
      if (Number.isFinite(number)) {
        const [min, max] = limits[limitKey];
        next[key] = Math.max(min, Math.min(max, number));
      }
    }
    next.height = next.heightMode === "auto" ? null
      : next.height ?? current.height ?? limits.logicalHeight[0];
    candidate.export = next;
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const post = activeProject._state, changedIds = (before, after) => after.filter(item =>
      JSON.stringify(before.find(old => old.id === item.id)) !== JSON.stringify(item)).map(item => item.id);
    payload.changed = { slotIds: changedIds(source.slots, post.slots), chartIds: changedIds(source.charts, post.charts),
      csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles), imageIds: changedIds(source.assets.images, post.assets.images), assets: [] };
    return;
  }
}

export function applySlotImageSettingsChangedAction({ machine, event, payload }) {
  machine.assertWritable("slots", "SLOT_IMAGE_SETTINGS_CHANGED");
  while (true) {
    const source = activeProject._state, candidate = projectClone(source);
    normalizeSlotContents(candidate.slots);
    const target = candidate.slots.find((slot) => slot.id === payload.slotId);
    if (!target || target.hidden || !candidate.assets.images.some((image) => image.id === target.imageId))
      throw Error("이미지 설정을 변경할 슬롯이 없습니다.");
    const next = { ...target.content.imageSettings }, values = payload.settings || {},
      limits = BackendSettings.defaults.limits.imageSettings;
    if (Object.prototype.hasOwnProperty.call(values, "fit")) {
      const fit = values.fit;
      if (["contain", "cover", "manual"].includes(fit)) next.fit = fit;
    }
    if (next.fit === "manual") {
      for (const key of ["scale", "x", "y"]) {
        if (!Object.prototype.hasOwnProperty.call(values, key)) continue;
        const value = values[key];
        const number = value === null ? NaN : Number(value);
        if (Number.isFinite(number)) {
          const [min, max] = limits[key];
          next[key] = Math.max(min, Math.min(max, number));
        }
      }
    }
    target.content.imageSettings = next;
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const post = activeProject._state, changedIds = (before, after) => after.filter(item =>
      JSON.stringify(before.find(old => old.id === item.id)) !== JSON.stringify(item)).map(item => item.id);
    payload.changed = { slotIds: changedIds(source.slots, post.slots),
      chartIds: changedIds(source.charts, post.charts), csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles),
      imageIds: changedIds(source.assets.images, post.assets.images), assets: [] };
    return;
  }
}

export function applyCaptionSettingsChangedAction({ machine, event, payload }) {
  machine.assertWritable("captions", "CAPTION_SETTINGS_CHANGED");
  while (true) {
    const source = activeProject._state, candidate = projectClone(source), captions = candidate.annotations.captions;
    normalizeSlotContents(candidate.slots);
    for (const slot of candidate.slots) {
      const original = source.slots.find(item => item.id === slot.id);
      if (original?.content) slot.content = projectClone(original.content);
    }
    if (Object.prototype.hasOwnProperty.call(payload, "enabled"))
      captions.enabled = payload.enabled === true;
    if (Object.prototype.hasOwnProperty.call(payload, "name"))
      captions.name = String(payload.name ?? "");
    if (Object.prototype.hasOwnProperty.call(payload, "nameBold"))
      captions.nameBold = payload.nameBold === true;
    if (payload.settings && typeof payload.settings === "object") {
      const edits = payload.settings,
        defaults = BackendSettings.project_object.annotations.captions.settings,
        limits = BackendSettings.defaults.limits.captions;
      if (Object.prototype.hasOwnProperty.call(edits, "fontFamily"))
        captions.settings.fontFamily = String(edits.fontFamily ?? "");
      for (const key of ["fontSize", "lineHeight"]) {
        if (!Object.prototype.hasOwnProperty.call(edits, key)) continue;
        const number = Number(edits[key]), [min, max] = limits[key];
        captions.settings[key] = Number.isFinite(number)
          ? Math.max(min, Math.min(max, number)) : defaults[key];
      }
    }
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    const post = activeProject._state, changedIds = (before, after) => after.filter(item =>
      JSON.stringify(before.find(old => old.id === item.id)) !== JSON.stringify(item)).map(item => item.id);
    payload.changed = { slotIds: changedIds(source.slots, post.slots), chartIds: changedIds(source.charts, post.charts),
      csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles), imageIds: changedIds(source.assets.images, post.assets.images), assets: [] };
    return;
  }
}

export function applyLayoutStyleChangedAction({ machine, event, payload }) {
  machine.assertWritable("layout", "LAYOUT_STYLE_CHANGED");
  let candidate = projectClone(activeProject._state);
  const style = candidate.layout.slotStyle, limits = BackendSettings.defaults.limits.layout;
  for (const key of ["referenceWidth", "gap", "outerMargin", "radius", "aspect"]) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) continue;
    style[key] = readProjectNumber(payload[key], style[key], ...limits[key]);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "showBorders"))
    style.showBorders = payload.showBorders === true;
  validateProjectObjectState(candidate, { requireSlots: true });
  commitProjectCandidate(candidate, event, payload);
}

export function applySlotsMergedAction({ machine, event, payload }) {
  machine.assertWritable("slots", "SLOTS_MERGED");
  machine.assertWritable("charts", "SLOTS_MERGED");
  let candidate = projectClone(activeProject._state);
  normalizeSlotContents(candidate.slots);
  let selected = resolveLayoutCommandSlots(candidate, payload.slotIds);
  let top = Math.min(...selected.map((slot) => slot.row)),
    left = Math.min(...selected.map((slot) => slot.col)),
    bottom = Math.max(...selected.map((slot) => slot.row + slot.rowSpan - 1)),
    right = Math.max(...selected.map((slot) => slot.col + slot.colSpan - 1)),
    selectedCells = new Set();
  selected.forEach((slot) => {
    for (let row = slot.row; row < slot.row + slot.rowSpan; row++)
      for (let col = slot.col; col < slot.col + slot.colSpan; col++)
        selectedCells.add(`${row}:${col}`);
  });
  if (selectedCells.size !== (bottom - top + 1) * (right - left + 1))
    throw Error("선택한 슬롯의 전체 영역이 빈칸 없는 직사각형이어야 합니다.");
  let cells = candidate.slots.filter((slot) =>
    slot.row >= top && slot.row <= bottom && slot.col >= left && slot.col <= right);
  if (cells.length !== selectedCells.size) throw Error("선택 영역을 확인할 수 없습니다.");
  let nonDefault = selected.filter(slotHasNonDefaultLocalState);
  if (nonDefault.length > 1)
    throw Error("로컬 상태가 두 개 이상 있는 슬롯은 합칠 수 없습니다.");
  let anchor = cells.find((slot) => slot.row === top && slot.col === left),
    source = nonDefault[0] || anchor,
    local = slotLocalState(source);
  cells.forEach((cell) => {
    cell.hidden = cell !== anchor;
    if (cell !== anchor) resetSlotLocalState(cell);
  });
  setSlotLocalState(anchor, local);
  anchor.rowSpan = bottom - top + 1;
  anchor.colSpan = right - left + 1;
  anchor.hidden = false;
  validateProjectObjectState(candidate, { requireSlots: true });
  commitProjectCandidate(candidate, event, payload);
  payload.selectionHints = {
    mergeSlotIds: selected.map((slot) => slot.id),
    anchorId: anchor.id,
  };
}

export function applySlotsSplitAction({ machine, event, payload }) {
  machine.assertWritable("slots", "SLOTS_SPLIT");
  let candidate = projectClone(activeProject._state);
  normalizeSlotContents(candidate.slots);
  let selected = resolveLayoutCommandSlots(candidate, payload.slotIds);
  if (selected.some((slot) => slot.rowSpan <= 1 && slot.colSpan <= 1))
    throw Error("나눌 합쳐진 슬롯을 선택하세요.");
  for (let source of selected) {
    let anchor = candidate.slots.find((slot) => slot.id === source.id),
      endRow = anchor.row + anchor.rowSpan,
      endCol = anchor.col + anchor.colSpan,
      local = slotLocalState(anchor);
    candidate.slots.forEach((cell) => {
      if (
        cell.row >= anchor.row && cell.row < endRow &&
        cell.col >= anchor.col && cell.col < endCol
      ) {
        cell.hidden = false;
        cell.rowSpan = 1;
        cell.colSpan = 1;
        if (cell.id === anchor.id) setSlotLocalState(cell, local);
        else resetSlotLocalState(cell);
      }
    });
  }
  validateProjectObjectState(candidate, { requireSlots: true });
  commitProjectCandidate(candidate, event, payload);
}

export function applyAssetsImportedAction({ machine, event, payload }) {
  for (const scope of ["data", "images", "files", "charts", "slots"])
    machine.assertWritable(scope, "ASSETS_IMPORTED");
  while (true) {
    const source = activeProject._state, calculation = buildProjectAssetImportCandidate(source, payload);
    if (!calculation) return false;
    const { candidate, imported } = calculation;
    try { validateProjectObjectState(candidate, { requireSlots: true }); } catch { return false; }
    if (activeProject._state !== source) continue;
    const changedIds = (before, after) => after.filter(item =>
      JSON.stringify(before.find(old => old.id === item.id)) !== JSON.stringify(item)).map(item => item.id);
    const changed = { slotIds: changedIds(source.slots, candidate.slots),
      chartIds: changedIds(source.charts, candidate.charts),
      csvIds: changedIds(source.assets.csvFiles, candidate.assets.csvFiles),
      imageIds: changedIds(source.assets.images, candidate.assets.images), assets: imported };
    commitProjectCandidate(candidate, event, payload);
    payload.changed = changed;
    for (const fact of imported)
      if (fact.kind === "image") releaseProjectImageDisplayUrl(source.assets.images.find(image => image.id === fact.id));
    return;
  }
}

export const PROJECT_COMMAND_ACTIONS = Object.freeze({
  PROJECT_LOADED: applyProjectLoadedAction,
  PROJECT_NAME_CHANGED: applyProjectNameChangedAction,
  PROJECT_DIRECTORY_CREATED: applyProjectDirectoryCreatedAction,
  PROJECT_NODE_MOVED: applyProjectNodeMovedAction,
  PROJECT_TRASH_EMPTIED: applyProjectTrashEmptiedAction,
  DATA_OBJECT_CREATED: applyDataObjectCreatedAction,
  DATA_OBJECT_REPLACED: applyDataObjectReplacedAction,
  DATA_OBJECT_DELETED: applyDataObjectDeletedAction,
  IMAGE_OBJECT_CREATED: applyImageObjectCreatedAction,
  IMAGE_OBJECT_REPLACED: applyImageObjectReplacedAction,
  IMAGE_OBJECT_DELETED: applyImageObjectDeletedAction,
  SLOT_TYPE_CHANGED: applySlotTypeAction,
  SLOTS_RESET: applySlotsResetAction,
  SLOTS_SWAPPED: applySlotsSwappedAction,
  SLOT_IMAGE_LINKED: applySlotImageLinkedAction,
  SLOT_IMAGE_SETTINGS_CHANGED: applySlotImageSettingsChangedAction,
  SLOT_DATA_CONNECTED: applySlotDataConnectedAction,
  GRAPH_OBJECTS_REPLACED: applyGraphObjectsReplacedAction,
  CHART_LAYOUT_CHANGED: applyChartLayoutChangedAction,
  CHART_MODEL_REPLACED: applyChartModelReplacedAction,
  SLOT_IMAGE_IMPORTED: applySlotImageImportedAction,
  SLOT_CHART_IMPORTED: applySlotChartImportedAction,
  GRID_LAYOUT_CHANGED: applyGridLayoutChangedAction,
  LAYOUT_STYLE_CHANGED: applyLayoutStyleChangedAction,
  SLOTS_MERGED: applySlotsMergedAction,
  SLOTS_SPLIT: applySlotsSplitAction,
  CAPTION_TEXT_INPUT: applyCaptionTextAction,
  SLOT_CAPTIONS_INSERTED: applySlotCaptionsInsertedAction,
  CAPTION_SETTINGS_CHANGED: applyCaptionSettingsChangedAction,
  LABEL_SETTINGS_CHANGED: applyLabelSettingsChangedAction,
  LABEL_POSITION_CHANGED: applyLabelPositionChangedAction,
  APPEARANCE_CHANGED: applyAppearanceChangedAction,
  EXPORT_SETTINGS_CHANGED: applyExportSettingsChangedAction,
  ASSETS_IMPORTED: applyAssetsImportedAction,
});

export let projectEFSM;
export function initializeProjectEFSM() {
  projectEFSM = new ProjectStateMachine(projectObjects, PROJECT_COMMAND_ACTIONS);
}

export function applyProjectLoadedAction({ machine, event, payload }) {
  for (const scope of projectObjects.names()) machine.assertWritable(scope, "PROJECT_LOADED");
  while (true) {
    const source = activeProject._state, file = payload.file;
    if (!file || !(file.bytes instanceof Uint8Array)) throw Error("불러올 copied FFPX bytes가 없습니다.");
    const candidate = buildProjectObject(ffpxReadProjectBytes(new Uint8Array(file.bytes)), file.name)._state;
    validateProjectObjectState(candidate, { requireSlots: true });
    if (activeProject._state !== source) continue;
    commitProjectCandidate(candidate, event, payload);
    projectRuntime.projectObjectGeneration += 1;
    const changedIds = (before, after) => [...new Set([...before, ...after].map(item => item.id))]
      .filter(id => JSON.stringify(before.find(item => item.id === id) && { ...before.find(item => item.id === id) }) !==
        JSON.stringify(after.find(item => item.id === id) && { ...after.find(item => item.id === id) }));
    payload.changed = { slotIds: changedIds(source.slots, candidate.slots),
      chartIds: changedIds(source.charts, candidate.charts),
      csvIds: changedIds(source.assets.csvFiles, candidate.assets.csvFiles),
      imageIds: changedIds(source.assets.images, candidate.assets.images), assets: [] };
    payload.generation = projectRuntime.projectObjectGeneration;
    payload.selectionHints = Object.freeze({ resetInterfaceSelection: true });
    releaseProjectImageDisplayUrls(source.assets.images);
    return;
  }
}
