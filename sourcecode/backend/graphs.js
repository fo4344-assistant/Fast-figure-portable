// Source: sourcescript/backend/graphs.py (same logical owner); pseudocode/backend/graphs.pcal.
import { appFSM, selectedProjectCsv } from '../application/adapter.js';
import { activeProject, getProjectCsv, projectClone } from './project_state.js';
import { BackendSettings, DEFAULT_COLORS } from './settings.js';

export function createCandidateBaseGraphObject(csv) {
  const selection = graphDataSelection(csv.rows, csv.headerLines);
  return { ...projectClone(BackendSettings.defaults.chartSettings.editor.objectStyle),
    csvId: csv.id, x: selection.x, y: selection.y, color: DEFAULT_COLORS[0], legendName: "" };
}

export const ALLOWED_CHART_TYPES = new Set(["scatter", "markers", "lines+markers", "bar", "hidden"]);

export const ALLOWED_LINE_DASHES = new Set(["solid", "dot", "dash", "dashdot"]);

export const ALLOWED_MARKER_SYMBOLS = new Set([
  "circle",
  "square",
  "diamond",
  "cross",
  "x",
  "triangle-up",
  "triangle-down",
]);

export const ALLOWED_AXIS_SIDES = { x: new Set(["bottom", "top"]), y: new Set(["left", "right"]) };

export const CURRENT_OBJECT_KEYS = new Set([
  "csvId",
  "x",
  "y",
  "xAxisSide",
  "yAxisSide",
  "type",
  "color",
  "legendName",
  "lineWidth",
  "lineDash",
  "markerSymbol",
  "markerSize",
  "barOpacity",
  "barLineWidth",
  "plotlyTrace",
]);

export function currentAxes(settings = {}) {
  let saved = settings.axes && typeof settings.axes === "object" ? settings.axes : {},
    axis = (key, savedAxis = {}) => ({
      ...savedAxis,
      min: savedAxis.min ?? "",
      max: savedAxis.max ?? "",
      tick: savedAxis.tick ?? "",
      tickMode:
        savedAxis.scaleType !== "log" && savedAxis.tickMode === "increment"
          ? "increment"
          : "plotly",
      minorTicks: savedAxis.minorTicks === true,
      notation: savedAxis.notation ?? "none",
      scaleType: savedAxis.scaleType ?? "linear",
      divide: savedAxis.divide ?? "1",
      title: savedAxis.title ?? "",
      titleSize: savedAxis.titleSize ?? "14",
      lineWidth: savedAxis.lineWidth ?? "1",
      showGrid: savedAxis.showGrid !== false,
      visible: savedAxis.visible ?? (key === "xBottom" || key === "yLeft"),
      showValues: savedAxis.showValues !== false,
      fontSize: savedAxis.fontSize ?? "12",
    });
  return {
    xBottom: axis("xBottom", saved.xBottom),
    xTop: axis("xTop", saved.xTop),
    yLeft: axis("yLeft", saved.yLeft),
    yRight: axis("yRight", saved.yRight),
  };
}

export function axisRangeValueFromPlotly(value, scaleType) {
  if (value === "" || value === null || value === undefined) return "";
  let number = Number(value);
  if (!Number.isFinite(number)) return "";
  let converted = scaleType === "log" ? 10 ** number : number;
  return Number.isFinite(converted) ? String(converted) : "";
}

export function readGlobalSettings(chart) {
  let previous =
      chart.editor.globalSettings && typeof chart.editor.globalSettings === "object"
        ? chart.editor.globalSettings
        : {},
    settings = {
      ...previous,
      showLegend: previous.showLegend !== false,
      showTitle: previous.showTitle !== false,
      showZeroLine: previous.showZeroLine === true,
      graphFontFamily:
        typeof previous.graphFontFamily === "string" ? previous.graphFontFamily : "",
      titleFontSize: previous.titleFontSize ?? "",
      legendFontSize: previous.legendFontSize ?? "",
      axes: currentAxes(previous),
    };
  return settings;
}

export function normalizeGraphLayoutSettings(input) {
  const defaults = BackendSettings.defaults.chartSettings.editor,
    source = input && typeof input === "object" && !Array.isArray(input) ? input : {},
    scalar = value => (typeof value === "number" || typeof value === "string") && value !== "" ? Number(value) : NaN,
    positive = (value, fallback) => { const number = scalar(value); return Number.isFinite(number) && number > 0 ? number : fallback; },
    settings = { ...projectClone(defaults.globalSettings),
      showLegend: Object.hasOwn(source, "showLegend") ? source.showLegend !== false : defaults.globalSettings.showLegend,
      showTitle: Object.hasOwn(source, "showTitle") ? source.showTitle !== false : defaults.globalSettings.showTitle,
      showZeroLine: source.showZeroLine === true,
      graphFontFamily: typeof source.graphFontFamily === "string" ? source.graphFontFamily : "",
      titleFontSize: positive(source.titleFontSize, ""), legendFontSize: positive(source.legendFontSize, ""), axes: {} };
  for (const key of ["xBottom", "xTop", "yLeft", "yRight"]) {
    const raw = source.axes?.[key], axis = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {},
      result = { ...projectClone(defaults.axis), visible: defaults.axisVisibility[key] };
    for (const field of ["min", "max", "tick"]) {
      const number = scalar(axis[field]); result[field] = Number.isFinite(number) ? number : "";
    }
    result.title = typeof axis.title === "string" ? axis.title : defaults.axis.title;
    result.titleSize = positive(axis.titleSize, defaults.axis.titleSize);
    result.fontSize = positive(axis.fontSize, defaults.axis.fontSize);
    const width = scalar(axis.lineWidth), divide = scalar(axis.divide);
    result.lineWidth = Number.isFinite(width) && width >= 0 ? width : defaults.axis.lineWidth;
    result.divide = Number.isFinite(divide) && divide !== 0 ? divide : 1;
    if (Object.hasOwn(axis, "showGrid")) result.showGrid = axis.showGrid !== false;
    if (Object.hasOwn(axis, "showValues")) result.showValues = axis.showValues !== false;
    if (typeof axis.visible === "boolean") result.visible = axis.visible;
    result.minorTicks = axis.minorTicks === true;
    result.notation = ["none", "e", "power"].includes(axis.notation) ? axis.notation : "none";
    result.scaleType = ["linear", "log", "reciprocal"].includes(axis.scaleType) ? axis.scaleType : "linear";
    result.tickMode = result.scaleType !== "log" && axis.tickMode === "increment" ? "increment" : "plotly";
    settings.axes[key] = result;
  }
  return settings;
}

export function normalizeGlobalSettings(chart, force = false) {
  let settings = readGlobalSettings(chart);
  if (force || !appFSM.writeLocks.has("editor")) chart.editor.globalSettings = settings;
  return settings;
}

export function axisKey(kind, side) {
  return kind === "x"
    ? side === "top"
      ? "xTop"
      : "xBottom"
    : side === "right"
      ? "yRight"
      : "yLeft";
}

export function dataTable(data) {
  if (!Array.isArray(data) || !data.length) throw Error("행이 하나 이상이어야 합니다.");
  if (data.every(Array.isArray)) return structuredClone(data);
  if (data.every((row) => row !== null && typeof row === "object" && !Array.isArray(row))) {
    let headers = [...new Set(data.flatMap((row) => Object.keys(row)))];
    return [headers, ...data.map((row) => headers.map((header) =>
      Object.hasOwn(row, header) ? structuredClone(row[header]) : ""))];
  }
  throw Error("CSV 행 배열 또는 객체 배열이어야 합니다.");
}

export function requireProjectCsv(chart, label = "차트", collection = activeProject.csvFiles) {
  let csv = getProjectCsv(
    chart?.editor?.objects?.[0]?.csvId ?? chart?.csvId,
    collection,
  );
  if (!csv) throw Error(`${label}가 참조하는 프로젝트 CSV가 없습니다.`);
  return csv;
}

export function chartUsesConversionView(chart) {
  return chart?.editor?.editable === false && Object.hasOwn(chart.editor, "conversionRows");
}

export function chartCsvIds(chart) {
  if (chartUsesConversionView(chart)) return [];
  return [
    ...new Set(
      (chart?.editor?.objects || [])
        .map((object) => object.csvId)
        .filter((id) => Number.isInteger(id)),
    ),
  ];
}

export function headerLineCount(value, table = []) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(Math.max(0, Math.trunc(number)), Array.isArray(table) ? table.length : 0)
    : 0;
}

export function columnIndex(column) {
  let match = /^C([1-9]\d*)$/.exec(String(column || ""));
  return match ? Number(match[1]) - 1 : -1;
}

export function columnDefinitions(table = [], headerLines = 1) {
  let width = (table || []).reduce(
      (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
      0,
    ),
    count = headerLineCount(headerLines, table),
    header = count > 0 && Array.isArray(table[count - 1]) ? table[count - 1] : [];
  return Array.from({ length: width }, (_, index) => {
    let id = `C${index + 1}`,
      name = String(header[index] ?? "").trim();
    return { id, index, name, label: name ? `${id} — ${name}` : id };
  });
}

export function dataRows(table = [], headerLines = 1) {
  return (table || []).slice(headerLineCount(headerLines, table));
}

export function value(v) {
  let n = Number(v);
  return v !== "" && Number.isFinite(n) ? n : v;
}

export function graphDataSelection(matrix, headerLines, editor = {}) {
  let definitions = columnDefinitions(matrix, headerLines),
    body = dataRows(matrix, headerLines),
    numeric = definitions.filter((column) =>
      body.some(
        (row) => row?.[column.index] !== "" && Number.isFinite(Number(row?.[column.index])),
      ),
    ),
    valid = (id) => definitions.some((column) => column.id === id),
    x = valid(editor.x) ? editor.x : numeric[0]?.id || definitions[0]?.id || "",
    y = valid(editor.y)
      ? editor.y
      : numeric.find((column) => column.id !== x)?.id ||
        definitions.find((column) => column.id !== x)?.id ||
        definitions[0]?.id ||
        "";
  return { x, y };
}

export function defaultChartEditor(slot, matrix, headerLines) {
  let selection = graphDataSelection(matrix, headerLines);
  return {
    objects: [],
    editable: true,
    globalSettings: {
      showLegend: true,
      showTitle: true,
      showZeroLine: false,
      graphFontFamily: "",
      titleFontSize: "",
      legendFontSize: "",
      axes: currentAxes({}),
    },
    colors: [...DEFAULT_COLORS],
    x: selection.x,
    y: selection.y,
    xAxisSide: "bottom",
    yAxisSide: "left",
    legendName: "",
    type: "scatter",
    lineWidth: 2,
    lineDash: "solid",
    markerSymbol: "circle",
    markerSize: 6,
    barOpacity: 1,
    barLineWidth: 0,
    xDivide: 1,
    yDivide: 1,
    title: selection.y,
  };
}

export function tracesSingle(c) {
  let b = {},
    colors = c.colors?.length ? c.colors : DEFAULT_COLORS,
    i = 0,
    xDivide = Number(c.xDivide) || 1,
    yDivide = Number(c.yDivide) || 1,
    xIndex = columnIndex(c.x),
    yIndex = columnIndex(c.y);
  if (xIndex < 0 || yIndex < 0) return [];
  dataRows(c.rows || [], c.headerLines ?? 1).forEach((r) => {
    let x = value(r?.[xIndex]),
      y = Number(r?.[yIndex]);
    if (x === "" || x === undefined || !Number.isFinite(y)) return;
    if (typeof x === "number") x /= xDivide;
    y /= yDivide;
    if (c.xScaleType === "reciprocal") {
      x = Number(x);
      if (!Number.isFinite(x) || x === 0) return;
      x = 1 / x;
    } else if (c.xScaleType === "log" && (!Number.isFinite(Number(x)) || Number(x) <= 0))
      return;
    if (c.yScaleType === "reciprocal") {
      if (y === 0) return;
      y = 1 / y;
    } else if (c.yScaleType === "log" && y <= 0) return;
    if (!Number.isFinite(y)) return;
    let g = "";
    (b[g] ??= []).push({ x, y });
  });
  return Object.entries(b).map(([g, p]) => {
    let color = colors[i++ % colors.length],
      isBar = c.type === "bar";
    return {
      x: p.map((v) => v.x),
      y: p.map((v) => v.y),
      name: c.y,
      type: isBar ? "bar" : "scatter",
      mode: isBar ? undefined : c.type === "hidden" ? "lines" : c.type,
      visible: c.type === "hidden" ? false : true,
      opacity: isBar ? Math.max(0.05, Math.min(1, Number(c.barOpacity) || 1)) : undefined,
      line: {
        color,
        width: isBar
          ? Math.max(0, Math.min(10, Number(c.barLineWidth) || 0))
          : Math.max(0.1, Math.min(20, Number(c.lineWidth) || 2)),
        dash: isBar ? undefined : c.lineDash || "solid",
      },
      marker: {
        color,
        symbol: c.markerSymbol || "circle",
        size: Math.max(1, Math.min(40, Number(c.markerSize) || 6)),
        line: isBar
          ? { color, width: Math.max(0, Math.min(10, Number(c.barLineWidth) || 0)) }
          : undefined,
      },
    };
  });
}

export function traces(c, project = activeProject._state) {
  let settings = readGlobalSettings(c),
    editor = c.editor,
    axes = settings.axes,
    objectList =
      Array.isArray(editor.objects) ? editor.objects : [],
    result = [];
  objectList.forEach((object, index) => {
    let csv = requireProjectCsv({ editor: { objects: [object] } }, `그래프 객체 ${index + 1}`, project.assets.csvFiles),
      xSide = object.xAxisSide || editor.xAxisSide || "bottom",
      ySide = object.yAxisSide || editor.yAxisSide || "left",
      xAxis = axes[axisKey("x", xSide)],
      yAxis = axes[axisKey("y", ySide)],
      axisRefs = {
        xaxis: xSide === "top" ? "x2" : "x",
        yaxis: ySide === "right" ? "y2" : "y",
      };
    result.push(
      ...tracesSingle({
        ...editor,
        ...object,
        rows: csv.rows,
        headerLines: csv.headerLines,
        xDivide: Number(xAxis.divide) || 1,
        yDivide: Number(yAxis.divide) || 1,
        xScaleType: xAxis.scaleType,
        yScaleType: yAxis.scaleType,
        colors: [object.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]],
      }).map((trace) => {
        let extension =
          object.plotlyTrace &&
          typeof object.plotlyTrace === "object" &&
          !Array.isArray(object.plotlyTrace)
            ? projectClone(object.plotlyTrace)
            : {};
        return {
          ...extension,
          ...trace,
          line: { ...(extension.line || {}), ...(trace.line || {}) },
          marker: { ...(extension.marker || {}), ...(trace.marker || {}) },
          name: object.legendName || trace.name,
          ...axisRefs,
        };
      }),
    );
  });
  let placeholder = (xaxis, yaxis) => ({
      x: [],
      y: [],
      type: "scatter",
      mode: "markers",
      xaxis,
      yaxis,
      showlegend: false,
      hoverinfo: "skip",
      visible: true,
      marker: { size: 0, opacity: 0 },
      line: { width: 0 },
      name: "",
      meta: { fastFigureAxisPlaceholder: true },
    }),
    xRefs = [],
    yRefs = [];
  if (axes.xBottom.visible === true) xRefs.push("x");
  if (axes.xTop.visible === true) xRefs.push("x2");
  if (axes.yLeft.visible === true) yRefs.push("y");
  if (axes.yRight.visible === true) yRefs.push("y2");
  if (!xRefs.length) xRefs.push("x");
  if (!yRefs.length) yRefs.push("y");
  xRefs.forEach((xaxis) => yRefs.forEach((yaxis) => result.push(placeholder(xaxis, yaxis))));
  return result;
}

export function layout(c, project = activeProject._state) {
  let bg = project.appearance.uiPalette.paperColor,
    ink = project.appearance.uiPalette.fontColor,
    editor = c.editor,
    settings = readGlobalSettings(c),
    numberOrEmpty = (v) =>
      v === "" || v === undefined || v === null ? undefined : Number(v),
    axis = (title, key) => {
      let setting = settings.axes[key],
        min = numberOrEmpty(setting.min),
        max = numberOrEmpty(setting.max),
        tick = numberOrEmpty(setting.tick),
        notation = setting.notation || "none",
        scaleType = setting.scaleType || "linear";
      return {
        type: scaleType === "log" ? "log" : "linear",
        title: {
          text: setting.visible === true ? setting.title || "" : "",
          font: { size: Number(setting.titleSize) || 14 },
        },
        visible: true,
        showgrid: setting.visible === true && setting.showGrid !== false,
        showticklabels: setting.visible === true && setting.showValues !== false,
        ticks: setting.visible === true ? "outside" : "",
        gridcolor: "#E5E7EB",
        zeroline: setting.visible === true && settings.showZeroLine === true,
        zerolinecolor: "#CBD5E1",
        showline: setting.visible === true,
        linewidth: Number(setting.lineWidth) || 0,
        range:
          Number.isFinite(min) && Number.isFinite(max)
            ? scaleType === "log"
              ? min > 0 && max > 0
                ? [Math.log10(min), Math.log10(max)]
                : undefined
              : [min, max]
            : undefined,
        dtick:
          scaleType === "log"
            ? 1
            : Number.isFinite(tick) && tick > 0
              ? tick
              : undefined,
        minor:
          scaleType === "log"
            ? setting.minorTicks === true
              ? {
                  dtick: "D1",
                  ticks: "outside",
                  showgrid: setting.visible === true && setting.showGrid !== false,
                  gridcolor: "#E5E7EB",
                }
              : { ticks: "", showgrid: false }
            : undefined,
        minorloglabels: scaleType === "log" ? "none" : undefined,
        tickfont: { size: Number(setting.fontSize) || 12 },
        automargin: true,
        exponentformat: notation === "power" ? "power" : notation === "e" ? "e" : "none",
        showexponent: notation === "none" ? "none" : "all",
        tickformat: notation === "e" ? ".3e" : undefined,
      };
    };
  let extension =
      editor.plotlyExtensions?.layout &&
      typeof editor.plotlyExtensions.layout === "object" &&
      !Array.isArray(editor.plotlyExtensions.layout)
        ? editor.plotlyExtensions.layout
        : {},
    known = {
      uirevision: String(c.id),
      title: {
        text: settings.showTitle === false ? "" : editor.title,
        automargin: true,
        font: {
          ...(settings.graphFontFamily ? { family: settings.graphFontFamily } : {}),
          size: Number(settings.titleFontSize) > 0 ? Number(settings.titleFontSize) : 17,
        },
      },
      legend: {
        font: {
          ...(settings.graphFontFamily ? { family: settings.graphFontFamily } : {}),
          size: Number(settings.legendFontSize) > 0 ? Number(settings.legendFontSize) : 12,
        },
      },
      xaxis: axis(editor.x, "xBottom"),
      xaxis2: { ...axis(editor.x, "xTop"), overlaying: "x", side: "top" },
      yaxis: axis(editor.y, "yLeft"),
      yaxis2: { ...axis(editor.y, "yRight"), overlaying: "y", side: "right" },
      paper_bgcolor: bg,
      plot_bgcolor: bg,
      font: {
        color: ink,
        ...(settings.graphFontFamily ? { family: settings.graphFontFamily } : {}),
      },
      margin: { l: 58, r: 58, t: 42, b: 50 },
      showlegend: settings.showLegend !== false,
    };
  return {
    ...extension,
    ...known,
    title: {
      ...(extension.title || {}),
      ...known.title,
      font: { ...(extension.title?.font || {}), ...(known.title.font || {}) },
    },
    legend: {
      ...(extension.legend || {}),
      ...known.legend,
      font: { ...(extension.legend?.font || {}), ...(known.legend.font || {}) },
    },
    xaxis: { ...(extension.xaxis || {}), ...known.xaxis },
    xaxis2: { ...(extension.xaxis2 || {}), ...known.xaxis2 },
    yaxis: { ...(extension.yaxis || {}), ...known.yaxis },
    yaxis2: { ...(extension.yaxis2 || {}), ...known.yaxis2 },
    font: { ...(extension.font || {}), ...known.font },
    margin: { ...(extension.margin || {}), ...known.margin },
  };
}

export function createChartModel({ id = null, editor = {}, graph = {} } = {}) {
  let model = {
    id,
    editor: {
      ...editor,
      objects: Array.isArray(editor.objects) ? editor.objects : [],
      editable: editor.editable !== false,
      globalSettings:
        editor.globalSettings && typeof editor.globalSettings === "object"
          ? editor.globalSettings
          : {},
    },
    graph: {
      data: Array.isArray(graph.data) ? graph.data : [],
      layout:
        graph.layout && typeof graph.layout === "object" && !Array.isArray(graph.layout)
          ? graph.layout
          : {},
      config:
        graph.config && typeof graph.config === "object" && !Array.isArray(graph.config)
          ? graph.config
          : {},
      frames: Array.isArray(graph.frames) ? graph.frames : [],
    },
  };
  if (graph.imported && typeof graph.imported === "object")
    model.graph.imported = {
      data: Array.isArray(graph.imported.data) ? graph.imported.data : [],
      layout:
        graph.imported.layout && typeof graph.imported.layout === "object"
          ? graph.imported.layout
          : {},
      config:
        graph.imported.config && typeof graph.imported.config === "object"
          ? graph.imported.config
          : {},
      frames: Array.isArray(graph.imported.frames) ? graph.imported.frames : [],
    };
  return model;
}

export function validateChartModel(chart, label = "차트", csvCollection = activeProject.csvFiles) {
  if (!chart || typeof chart !== "object" || Array.isArray(chart))
    throw Error(`${label} 구조가 올바르지 않습니다.`);
  if (
    !chart.editor ||
    typeof chart.editor !== "object" ||
    !Array.isArray(chart.editor.objects)
  )
    throw Error(`${label} editor.objects가 없습니다.`);
  if (
    !chart.graph ||
    typeof chart.graph !== "object" ||
    !Array.isArray(chart.graph.data) ||
    !chart.graph.layout ||
    typeof chart.graph.layout !== "object" ||
    !chart.graph.config ||
    typeof chart.graph.config !== "object" ||
    !Array.isArray(chart.graph.frames)
  )
    throw Error(`${label} graph 구조가 올바르지 않습니다.`);
  const conversion = chartUsesConversionView(chart);
  if (conversion && (!Array.isArray(chart.editor.conversionRows) ||
      !chart.editor.conversionRows.every(Array.isArray)))
    throw Error(`${label} conversionRows table이 올바르지 않습니다.`);
  chart.editor.objects.forEach((object, index) => {
    if (!object || typeof object !== "object" || Array.isArray(object))
      throw Error(`${label} 그래프 객체 ${index + 1} 구조가 올바르지 않습니다.`);
    const csv = conversion ? null : getProjectCsv(object.csvId, csvCollection);
    if (!conversion && (!Number.isInteger(object.csvId) || !csv))
      throw Error(`${label} 그래프 객체 ${index + 1}의 csvId가 올바르지 않습니다.`);
    const columns = columnDefinitions(conversion ? chart.editor.conversionRows : csv.rows,
      conversion ? chart.editor.headerLines : csv.headerLines),
      valid = (id) => columns.some((column) => column.id === id);
    if (columns.length ? !valid(object.x) || !valid(object.y) : object.x !== "" || object.y !== "")
      throw Error(`${label} 그래프 객체 ${index + 1}의 x/y column이 올바르지 않습니다.`);
  });
  return chart;
}

export function rebuildEditableGraph(chart, project = activeProject._state) {
  chart.graph.data = traces(chart, project);
  chart.graph.layout = layout(chart, project);
  return chart.graph;
}

export function chartExportCopy(chart) {
  let copy = projectClone(chart);
  return copy;
}

export function scalePlotlyFigure(figure, scale = 1) {
  let copy = projectClone(figure),
    factor = Math.max(0.01, Number(scale) || 1),
    scaleNumber = (value) =>
      Number.isFinite(Number(value)) ? Number(value) * factor : value,
    scaleFont = (font) =>
      font && typeof font === "object" ? { ...font, size: scaleNumber(font.size) } : font;
  if (factor === 1) return copy;
  let layout = copy.layout || {};
  layout.font = scaleFont(layout.font);
  if (layout.title?.font) layout.title.font = scaleFont(layout.title.font);
  if (layout.title?.pad)
    layout.title.pad = Object.fromEntries(
      Object.entries(layout.title.pad).map(([key, value]) => [key, scaleNumber(value)]),
    );
  if (layout.legend?.font) layout.legend.font = scaleFont(layout.legend.font);
  if (layout.legend) layout.legend.borderwidth = scaleNumber(layout.legend.borderwidth);
  if (layout.margin)
    layout.margin = Object.fromEntries(
      Object.entries(layout.margin).map(([key, value]) => [
        key,
        ["l", "r", "t", "b", "pad"].includes(key) ? scaleNumber(value) : value,
      ]),
    );
  ["xaxis", "xaxis2", "yaxis", "yaxis2"].forEach((key) => {
    let axis = layout[key];
    if (!axis) return;
    axis.linewidth = scaleNumber(axis.linewidth);
    axis.tickwidth = scaleNumber(axis.tickwidth);
    axis.ticklen = scaleNumber(axis.ticklen);
    axis.tickfont = scaleFont(axis.tickfont);
    if (axis.title?.font) axis.title.font = scaleFont(axis.title.font);
    if (axis.minor) {
      axis.minor.tickwidth = scaleNumber(axis.minor.tickwidth);
      axis.minor.ticklen = scaleNumber(axis.minor.ticklen);
    }
  });
  (copy.data || []).forEach((trace) => {
    if (trace.line) trace.line.width = scaleNumber(trace.line.width);
    if (trace.marker) {
      trace.marker.size = scaleNumber(trace.marker.size);
      if (trace.marker.line)
        trace.marker.line.width = scaleNumber(trace.marker.line.width);
    }
  });
  return copy;
}

export function chartFigure(chart, project = activeProject._state, scale = 1) {
  let copy = chartExportCopy(chart);
  if (copy.editor.editable === false && copy.graph.imported)
    return scalePlotlyFigure(copy.graph.imported, scale);
  rebuildEditableGraph(copy, project);
  return scalePlotlyFigure(copy.graph, scale);
}

export function setNestedAxisFromPlotly(target, axis = {}) {
  target.title = typeof axis.title === "string" ? axis.title : axis.title?.text || "";
  let scaleType = axis.type === "log" ? "log" : "linear";
  target.min = Array.isArray(axis.range)
    ? axisRangeValueFromPlotly(axis.range[0], scaleType)
    : "";
  target.max = Array.isArray(axis.range)
    ? axisRangeValueFromPlotly(axis.range[1], scaleType)
    : "";
  let linearTick =
      scaleType !== "log" &&
      typeof axis.dtick === "string" &&
      /^L(?:\d|\.)/.test(axis.dtick),
    denseLogTicks =
      scaleType === "log" &&
      (axis.dtick === "D1" ||
        (axis.minor &&
          (axis.minor.dtick === "D1" ||
            axis.minor.ticks === "inside" ||
            axis.minor.ticks === "outside" ||
            axis.minor.showgrid === true)));
  target.tick = linearTick
      ? axis.dtick.slice(1)
      : typeof axis.dtick === "number"
        && scaleType !== "log"
        ? axis.dtick
        : "";
  target.tickMode = linearTick ? "increment" : "plotly";
  target.minorTicks = denseLogTicks;
  target.titleSize = axis.title?.font?.size ?? target.titleSize;
  target.fontSize = axis.tickfont?.size ?? target.fontSize;
  target.lineWidth = axis.linewidth ?? target.lineWidth;
  target.showGrid = axis.showgrid !== false;
  target.visible = axis.visible !== false;
  target.showValues = axis.showticklabels !== false;
  target.scaleType = scaleType;
  target.notation =
    axis.exponentformat === "e" ? "e" : axis.exponentformat === "power" ? "power" : "none";
}

export function parsePlotlyToEditor(figure, id) {
  let data = Array.isArray(figure.data) ? figure.data : [],
    rowsOut = [],
    objects = [];
  data.forEach((trace, index) => {
    let x = Array.isArray(trace.x) ? trace.x : [],
      y = Array.isArray(trace.y) ? trace.y : [],
      length = Math.max(x.length, y.length);
    let xKey = `trace${index + 1}_x`,
      yKey = `trace${index + 1}_y`;
    for (let i = 0; i < length; i++) {
      rowsOut[i] ??= {};
      rowsOut[i][xKey] = x[i] ?? "";
      rowsOut[i][yKey] = y[i] ?? "";
    }
    if (length) {
      let isBar = trace.type === "bar",
        mode = isBar ? "bar" : trace.visible === false ? "hidden" : trace.mode || "scatter";
      let plotlyTrace = projectClone(trace);
      delete plotlyTrace.x;
      delete plotlyTrace.y;
      objects.push({
        x: xKey,
        y: yKey,
        xAxisSide: trace.xaxis === "x2" ? "top" : "bottom",
        yAxisSide: trace.yaxis === "y2" ? "right" : "left",
        type: mode,
        color:
          trace.line?.color ||
          trace.marker?.color ||
          DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        legendName: trace.name || "",
        lineWidth: trace.line?.width ?? 2,
        lineDash: trace.line?.dash || "solid",
        markerSymbol: trace.marker?.symbol || "circle",
        markerSize: Array.isArray(trace.marker?.size) ? 6 : (trace.marker?.size ?? 6),
        barOpacity: trace.opacity ?? 1,
        barLineWidth: trace.marker?.line?.width ?? 0,
        plotlyTrace,
      });
    }
  });
  let sourceHeaders = [...new Set(rowsOut.flatMap((row) => Object.keys(row || {})))],
    columnMap = Object.fromEntries(
      sourceHeaders.map((header, index) => [header, `C${index + 1}`]),
    );
  objects = objects.map((object) => ({
    ...object,
    x: columnMap[object.x] || object.x,
    y: columnMap[object.y] || object.y,
  }));
  rowsOut = rowsOut.length ? dataTable(rowsOut) : [];
  let layoutIn = figure.layout && typeof figure.layout === "object" ? figure.layout : {},
    chart = createChartModel({
      id,
      editor: { editable: false, conversionRows: rowsOut, objects },
      graph: {
        data: [],
        layout: {},
        config: {},
        frames: [],
        imported: {
          data: projectClone(data),
          layout: projectClone(layoutIn),
          config: projectClone(figure.config || {}),
          frames: projectClone(figure.frames || []),
        },
      },
    });
  let settings = normalizeGlobalSettings(chart);
  chart.editor.title =
    typeof layoutIn.title === "string" ? layoutIn.title : layoutIn.title?.text || "";
  settings.showTitle = !!chart.editor.title;
  settings.showLegend = layoutIn.showlegend !== false;
  settings.graphFontFamily =
    layoutIn.title?.font?.family ||
    layoutIn.font?.family ||
    layoutIn.legend?.font?.family ||
    "";
  settings.titleFontSize = layoutIn.title?.font?.size ?? "";
  settings.legendFontSize = layoutIn.legend?.font?.size ?? "";
  setNestedAxisFromPlotly(settings.axes.xBottom, layoutIn.xaxis || {});
  setNestedAxisFromPlotly(settings.axes.xTop, layoutIn.xaxis2 || {});
  setNestedAxisFromPlotly(settings.axes.yLeft, layoutIn.yaxis || {});
  setNestedAxisFromPlotly(settings.axes.yRight, layoutIn.yaxis2 || {});
  chart.editor.globalSettings = settings;
  chart.editor.plotlyExtensions = {
    layout: projectClone(layoutIn),
    config: projectClone(figure.config || {}),
  };
  chart.graph.config = projectClone(figure.config || {});
  chart.graph.frames = projectClone(figure.frames || []);
  if (objects.length) {
    Object.assign(chart.editor, objects[0]);
    chart.editor.colors = objects.map((object) => object.color);
  }
  return chart;
}

export function baseGraphObject(chart, csv = selectedProjectCsv()) {
  let editor = chart.editor || {};
  if (!csv) throw Error("그래프 오브젝트에 연결할 프로젝트 CSV가 없습니다.");
  let selection = graphDataSelection(csv.rows, csv.headerLines, editor);
  return {
    csvId: csv.id,
    x: selection.x,
    y: selection.y,
    xAxisSide: editor.xAxisSide || "bottom",
    yAxisSide: editor.yAxisSide || "left",
    type: editor.type || "scatter",
    color: editor.colors?.[0] || DEFAULT_COLORS[0],
    legendName: editor.legendName || "",
    lineWidth: Math.max(0.1, Math.min(20, Number(editor.lineWidth) || 2)),
    lineDash: editor.lineDash || "solid",
    markerSymbol: editor.markerSymbol || "circle",
    markerSize: Math.max(1, Math.min(40, Number(editor.markerSize) || 6)),
    barOpacity: Math.max(0.05, Math.min(1, Number(editor.barOpacity) || 1)),
    barLineWidth: Math.max(0, Math.min(10, Number(editor.barLineWidth) || 0)),
  };
}

export function normalizedGraphObjects(chart) {
  if(!chart)return [];
  if(chart.editor?.editable===false)
    return projectClone(Array.isArray(chart.editor?.objects)?chart.editor.objects:[]);
  return (Array.isArray(chart.editor?.objects)?chart.editor.objects:[]).map((object,index)=>{
    let csv=getProjectCsv(object?.csvId);
    if(!csv)throw Error(`그래프 객체 ${index+1}에 연결할 프로젝트 CSV가 없습니다.`);
    let selection=graphDataSelection(csv.rows,csv.headerLines,object||{});
    return {...baseGraphObject(chart,csv),...(object||{}),csvId:csv.id,x:selection.x,y:selection.y};
  });
}

export function ensureGraphObjects(chart) {
  if (!chart) return [];
  chart.editor = chart.editor || {};
  chart.editor.objects = normalizedGraphObjects(chart);
  return chart.editor.objects;
}
