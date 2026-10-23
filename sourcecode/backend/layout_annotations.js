// Source: sourcescript/backend/layout_annotations.py (same logical owner); pseudocode/backend/layout_annotations.pcal.
import { activeProject, getProjectImage, normalizeSlotContent, normalizeSlotContents, projectClone, projectObjects, slotHasNonDefaultLocalState, validateProjectObjectState } from './project_state.js';
import { DEFAULT_IMAGE_SETTINGS } from './settings.js';

export function resolveLayoutCommandSlots(candidate, slotIds) {
  if (!Array.isArray(slotIds) || !slotIds.length || !slotIds.every(Number.isInteger))
    throw Error("현재 표시된 슬롯 ID를 선택하세요.");
  return [...new Set(slotIds)].map((id) => {
    const slot = candidate.slots.find((item) => item.id === id);
    if (!slot || slot.hidden) throw Error("현재 표시된 슬롯을 확인할 수 없습니다.");
    return slot;
  });
}

export function dashboardReferenceWidth() {
  return activeProject.layout.slotStyle.referenceWidth;
}

export function dashboardAspectValue() {
  return activeProject.layout.slotStyle.aspect;
}

export function dashboardOuterMarginPixels() {
  return activeProject.layout.slotStyle.outerMargin;
}

export function slotGapPixels() {
  return activeProject.layout.slotStyle.gap;
}

export function slotRadiusPixels() {
  return activeProject.layout.slotStyle.radius;
}

export function dashboardGeometry(width = dashboardReferenceWidth(), heightOverride = null) {
  return dashboardGeometryInProject(activeProject._state, width, heightOverride);
}

export function dashboardGeometryInProject(project, width, heightOverride = null) {
  let style = project.layout.slotStyle,
    referenceWidth = style.referenceWidth,
    scale = width / referenceWidth,
    configuredAspect = style.aspect,
    naturalHeight = width / configuredAspect,
    height =
      Number.isFinite(heightOverride) && heightOverride > 0
        ? Number(heightOverride)
        : naturalHeight,
    aspect = configuredAspect,
    outerMargin = Math.min(
      style.outerMargin * scale,
      Math.min(width, height) * 0.49,
    );
  return {
    referenceWidth,
    width: referenceWidth * scale,
    height,
    scale,
    aspect,
    outerMargin,
    gap: style.gap * scale,
    radius: style.radius * scale,
  };
}

export function gridSlotGeometry(layout, geometry, slot = null) {
  let gap = geometry.gap,
    colWidth =
      (geometry.width - geometry.outerMargin * 2 - gap * (layout.gridCols - 1)) /
      layout.gridCols,
    rowHeight =
      (geometry.height - geometry.outerMargin * 2 - gap * (layout.gridRows - 1)) /
      layout.gridRows,
    target = slot && !slot.hidden ? slot : { rowSpan: 1, colSpan: 1 };
  return {
    colWidth,
    rowHeight,
    width: colWidth * target.colSpan + gap * (target.colSpan - 1),
    height: rowHeight * target.rowSpan + gap * (target.rowSpan - 1),
  };
}

export function newGridSlot(id, row, col) {
  return normalizeSlotContent({
    id,
    row,
    col,
    rowSpan: 1,
    colSpan: 1,
    hidden: false,
    content: {
      chart: null,
      imageId: null,
      contentType: "graph",
      imageSettings: { ...DEFAULT_IMAGE_SETTINGS },
    },
    caption: null,
  });
}

export function buildGridResizeCandidate(rows, cols) {
  if(!Number.isInteger(rows)||!Number.isInteger(cols)||rows<1||rows>8||cols<1||cols>8)
    throw Error("레이아웃 행과 열은 1~8의 정수여야 합니다.");
  let candidate=projectClone(activeProject._state);
  normalizeSlotContents(candidate.slots);
  const source = activeProject._state, oldRows = source.layout.gridRows, oldCols = source.layout.gridCols;
  let nextId = Math.max(-1, ...source.slots.map(slot => slot.id)) + 1;
  let removed=candidate.slots.filter(slot=>slot.row>rows||slot.col>cols);
  if(removed.some(slot=>slot.hidden||slot.rowSpan!==1||slot.colSpan!==1||slotHasNonDefaultLocalState(slot)))
    throw Error("내용이나 병합 상태가 있는 영역은 그리드 축소로 제거할 수 없습니다.");
  let retained=candidate.slots.filter(slot=>slot.row<=rows&&slot.col<=cols);
  if(retained.filter(slot=>!slot.hidden).some(slot=>
    slot.row+slot.rowSpan-1>rows||slot.col+slot.colSpan-1>cols))
    throw Error("병합된 슬롯을 가로지르도록 그리드를 축소할 수 없습니다.");
  candidate.layout.gridRows=rows; candidate.layout.gridCols=cols; candidate.slots=retained;
  for(let row=1;row<=rows;row++) for(let col=1;col<=cols;col++){
    if(row>oldRows||col>oldCols) candidate.slots.push(newGridSlot(nextId++,row,col));
  }
  validateProjectObjectState(candidate,{requireSlots:true});
  return candidate;
}

export function slotImage(slot, collection = activeProject.images) {
  return getProjectImage(slot?.imageId, collection);
}

export function normalizeImageSettings(slot) {
  if (!slot) return null;
  const content = slot.content && typeof slot.content === "object" && !Array.isArray(slot.content)
    ? slot.content : {};
  const settings = content.imageSettings && typeof content.imageSettings === "object"
    ? content.imageSettings
    : slot.imageSettings && typeof slot.imageSettings === "object"
      ? slot.imageSettings : DEFAULT_IMAGE_SETTINGS;
  return readImageSettings(settings);
}

export function readImageSettings(settings) {
  let source = settings && typeof settings === "object" && !Array.isArray(settings)
      ? settings
      : {},
    fit = ["contain", "cover", "manual"].includes(source.fit) ? source.fit : "contain",
    number = (value, fallback, min, max) =>
      Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : fallback));
  return {
    fit,
    scale: number(source.scale, 100, 1, 1000),
    x: number(source.x, 50, -100, 200),
    y: number(source.y, 50, -100, 200),
  };
}

export function alphaIdentifier(index, upper = false) {
  let label = "";
  do {
    label = String.fromCharCode((upper ? 65 : 97) + (index % 26)) + label;
    index = Math.floor(index / 26) - 1;
  } while (index >= 0);
  return label;
}

export function romanIdentifier(index) {
  let value = index + 1,
    parts = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ],
    result = "";
  for (let [amount, symbol] of parts)
    while (value >= amount) {
      result += symbol;
      value -= amount;
    }
  return result;
}

export function slotIdentifier(index, project = activeProject) {
  let settings = project.annotations?.labels.settings ?? project.labelSettings;
  if (settings.format === "decimal") return String(index + 1);
  if (settings.format === "lower-roman") return romanIdentifier(index).toLowerCase();
  if (settings.format === "upper-roman") return romanIdentifier(index);
  return alphaIdentifier(index, settings.format === "upper-alpha");
}

export function displayedSlotIdentifier(index, project = activeProject) {
  let identifier = slotIdentifier(index, project);
  return project.labelSettings.parentheses === true ? `(${identifier})` : identifier;
}

export function orderedVisibleSlots(project = activeProject) {
  let settings = project.annotations?.labels.settings ?? project.labelSettings;
  return project.slots
    .filter((slot) => !slot.hidden)
    .sort((a, b) =>
      settings.order === "column-major"
        ? a.col - b.col || a.row - b.row
        : a.row - b.row || a.col - b.col,
    );
}

export function slotLabel(slot, project = activeProject) {
  let index = orderedVisibleSlots(project).findIndex((item) => item.id === slot?.id);
  return slotIdentifier(Math.max(0, index), project);
}

export function normalizeLegacySlotCaptionDefaults(project = activeProject) {
  orderedVisibleSlots(project).forEach((slot) => {
    if (slot.caption === `${slotLabel(slot, project)} 슬롯 캡션`)
      slot.caption = "슬롯 캡션";
  });
}

export function orderedSlotLabels(project) {
  let settings = project.annotations.labels.settings;
  return Object.freeze(orderedVisibleSlots(project).map((slot, ordinal) => {
    let identifier = slotIdentifier(ordinal, project);
    return Object.freeze({ slotId: slot.id, ordinal, identifier,
      displayLabel: settings.parentheses ? `(${identifier})` : identifier });
  }));
}

export function insertSlotCaptions(project, slotIds = null) {
  let labels = orderedSlotLabels(project), selected = null;
  if (slotIds !== null) {
    if (!Array.isArray(slotIds)) throw Error("캡션 대상은 슬롯 ID 목록이어야 합니다.");
    selected = new Set(slotIds);
    let visible = new Set(labels.map((label) => label.slotId));
    for (let id of selected)
      if (!visible.has(id)) throw Error("캡션 대상 슬롯이 없거나 숨겨져 있습니다.");
  }
  let groups = [], current = null;
  for (let label of labels) {
    if (selected && !selected.has(label.slotId)) continue;
    let text = project.slots.find((slot) => slot.id === label.slotId).caption ?? "";
    if (current && label.ordinal === current.endOrdinal + 1 &&
        (text === "" || text === current.text)) {
      current.endOrdinal = label.ordinal;
      current.last = label.identifier;
    } else {
      current = { first: label.identifier, last: label.identifier,
        endOrdinal: label.ordinal, text };
      groups.push(current);
    }
  }
  let inserted = groups.map((group) =>
    `(${group.first}${group.first === group.last ? "" : `-${group.last}`})` +
    (group.text === "" ? "" : ` ${group.text}`)).join(" "),
    before = project.annotations.captions.text;
  if (!inserted) return before;
  return before + (before && !before.endsWith(" ") ? " " : "") + inserted;
}

export function activeCaptionView(caption=projectObjects.read("captions")) {
  return {
    enabled:caption.enabled,text:caption.text,afterText:caption.afterText,
    sections:[],aggregate:false,label:"",name:caption.name,nameBold:caption.nameBold,
    settings:caption.settings,slot:null,exportText:caption.text,
  };
}
