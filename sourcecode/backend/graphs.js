// Source: sourcescript/backend/graphs.py (same logical owner); pseudocode/backend/graphs.pcal.
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
  return normalizeGlobalSettings(chart.editor.globalSettings);
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

export function normalizeGlobalSettings(settings) {
  return normalizeGraphLayoutSettings(settings);
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
  const number = graphScalarNumber(value);
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
      name = header[index] ?? "", text = String(name).trim();
    return { id, index, name, label: text ? `${id} — ${text}` : id };
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
        (row) => row?.[column.index] !== "" && Number.isFinite(graphScalarNumber(row?.[column.index])),
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

// Scalar primitives for NormalizeDivisor / ScaleCoordinate / tracesSingle.
function graphScalarNumber(input) {
  return input === null || ["number", "string", "boolean"].includes(typeof input)
    ? Number(input) : NaN;
}

function graphDivisor(input) {
  const number = graphScalarNumber(input);
  return Number.isFinite(number) && number !== 0 ? number : 1;
}

function graphScaleCoordinate(value, numeric, scaleType) {
  if (scaleType === "linear") return value;
  if (!numeric) return undefined;
  if (scaleType === "log") return Number.isFinite(value) && value > 0 ? value : undefined;
  const reciprocal = value !== 0 ? 1 / value : NaN;
  return Number.isFinite(value) && Number.isFinite(reciprocal) ? reciprocal : undefined;
}

export function tracesSingle(c) {
  const rows = c.rows || [], width = columnDefinitions(rows, c.headerLines).length,
    xi = columnIndex(c.x), yi = columnIndex(c.y),
    dx = graphDivisor(c.xDivide), dy = graphDivisor(c.yDivide),
    defaults = BackendSettings.defaults.chartSettings.editor.objectStyle,
    limits = BackendSettings.defaults.limits.graphObject,
    style = key => {
      const number = graphScalarNumber(c[key]), [min, max] = limits[key];
      return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : defaults[key];
    }, xs = [], ys = [];
  if (xi < 0 || yi < 0 || xi >= width || yi >= width) return [];
  for (const row of dataRows(rows, c.headerLines ?? 1)) {
    const rawX = row?.[xi], rawY = row?.[yi];
    if (rawX === undefined || rawX === "" || rawY === undefined) continue;
    let x = graphScalarNumber(rawX), y = graphScalarNumber(rawY);
    if (!Number.isFinite(y)) continue;
    const numericX = Number.isFinite(x);
    if (!numericX) {
      if (typeof rawX !== "string") continue;
      x = rawX;
    }
    if (numericX) x /= dx;
    y /= dy;
    if (!Number.isFinite(y) || (numericX && !Number.isFinite(x))) continue;
    x = graphScaleCoordinate(x, numericX, c.xScaleType ?? "linear");
    y = graphScaleCoordinate(y, true, c.yScaleType ?? "linear");
    if (x === undefined || y === undefined) continue;
    xs.push(x); ys.push(y);
  }
  if (!xs.length) return [];
  const trace = { x: xs, y: ys, name: c.y, visible: true,
    line: { color: c.color }, marker: { color: c.color } };
  if (c.type === "bar") {
    trace.type = "bar";
    trace.line.width = style("barLineWidth");
    trace.marker.line = { color: c.color, width: trace.line.width };
    trace.opacity = style("barOpacity");
  } else {
    trace.type = "scatter";
    trace.mode = ["markers", "lines+markers"].includes(c.type) ? c.type : "lines";
    trace.visible = c.type !== "hidden";
    trace.line.width = style("lineWidth");
    trace.line.dash = ALLOWED_LINE_DASHES.has(c.lineDash) ? c.lineDash : defaults.lineDash;
    trace.marker.symbol = ALLOWED_MARKER_SYMBOLS.has(c.markerSymbol) ? c.markerSymbol : defaults.markerSymbol;
    trace.marker.size = style("markerSize");
  }
  return [trace];
}

export function traces(c, project = activeProject._state) {
  const owners = project.slots.filter(slot => slot.content.chart === c.id),
    current = project.charts.find(chart => chart.id === c.id);
  if (owners.length !== 1 || !current || chartUsesConversionView(c))
    throw Error("그래프 투영에 같은 프로젝트의 유일한 owning chart가 필요합니다.");
  let settings = normalizeGraphLayoutSettings(c.editor.globalSettings),
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
        xDivide: xAxis.divide,
        yDivide: yAxis.divide,
        xScaleType: xAxis.scaleType,
        yScaleType: yAxis.scaleType,
        color: object.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }).map((trace) => {
        let extension =
          object.plotlyTrace &&
          typeof object.plotlyTrace === "object" &&
          !Array.isArray(object.plotlyTrace)
            ? projectClone(object.plotlyTrace)
            : {};
        const record = value => value && typeof value === "object" && !Array.isArray(value) ? value : {},
          merged = {
            ...extension, ...trace,
            line: { ...record(extension.line), ...trace.line },
            marker: { ...record(extension.marker), ...trace.marker },
            name: object.legendName || object.y,
            ...axisRefs,
          };
        if (!Object.hasOwn(trace, "mode")) delete merged.mode;
        return merged;
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
    settings = normalizeGraphLayoutSettings(editor.globalSettings),
    renderDefaults = BackendSettings.defaults.graphRendering,
    axisDefaults = BackendSettings.defaults.chartSettings.editor.axis,
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
          font: { size: setting.titleSize || axisDefaults.titleSize },
        },
        visible: true,
        showgrid: setting.visible === true && setting.showGrid !== false,
        showticklabels: setting.visible === true && setting.showValues !== false,
        ticks: setting.visible === true ? "outside" : "",
        gridcolor: renderDefaults.gridColor,
        zeroline: setting.visible === true && settings.showZeroLine === true,
        zerolinecolor: renderDefaults.zeroLineColor,
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
                  gridcolor: renderDefaults.gridColor,
                }
              : { ticks: "", showgrid: false }
            : undefined,
        minorloglabels: scaleType === "log" ? "none" : undefined,
        tickfont: { size: setting.fontSize || axisDefaults.fontSize },
        automargin: true,
        exponentformat: notation === "power" ? "power" : notation === "e" ? "e" : "none",
        showexponent: notation === "none" ? "none" : "all",
        tickformat: notation === "e" ? ".3e" : undefined,
      };
    };
  const record = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  let extension = projectClone(record(editor.plotlyExtensions?.layout)),
    known = {
      uirevision: String(c.id),
      title: {
        text: settings.showTitle === false ? "" : editor.title,
        automargin: true,
        font: {
          ...(settings.graphFontFamily ? { family: settings.graphFontFamily } : {}),
          size: settings.titleFontSize || renderDefaults.titleFontSize,
        },
      },
      legend: {
        font: {
          ...(settings.graphFontFamily ? { family: settings.graphFontFamily } : {}),
          size: settings.legendFontSize || renderDefaults.legendFontSize,
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
      margin: projectClone(renderDefaults.margin),
      showlegend: settings.showLegend !== false,
    };
  const merged = { ...extension, ...known };
  for (const key of ["title", "legend", "font", "margin", "xaxis", "xaxis2", "yaxis", "yaxis2"])
    merged[key] = { ...record(extension[key]), ...known[key] };
  for (const key of ["title", "legend"])
    merged[key].font = { ...record(extension[key]?.font), ...known[key].font };
  for (const key of ["xaxis", "xaxis2", "yaxis", "yaxis2"])
    for (const field of ["range", "dtick", "minor", "minorloglabels", "tickformat"])
      if (known[key][field] === undefined) delete merged[key][field];
  return merged;
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
  const record = value => value !== null && typeof value === "object" && !Array.isArray(value),
    figureShape = figure => record(figure) && Array.isArray(figure.data) && figure.data.every(record) &&
      record(figure.layout) && record(figure.config) && Array.isArray(figure.frames),
    fail = detail => { throw Error(`${label} ${detail}`); };
  if (!record(chart)) fail("구조가 올바르지 않습니다.");
  if (Object.hasOwn(chart, "id") && (!Number.isInteger(chart.id) || chart.id <= 0))
    fail("id는 양의 정수여야 합니다.");
  if (
    !record(chart.editor) || typeof chart.editor.editable !== "boolean" ||
    !Array.isArray(chart.editor.objects)
  )
    throw Error(`${label} editor.objects가 없습니다.`);
  if (!figureShape(chart.graph) ||
      (Object.hasOwn(chart.graph, "imported") && !figureShape(chart.graph.imported)))
    fail("graph/imported 구조가 올바르지 않습니다.");
  const settings = chart.editor.globalSettings;
  if (!record(settings) || (Object.hasOwn(settings, "axes") && !record(settings.axes)))
    fail("globalSettings/axes 구조가 올바르지 않습니다.");
  for (const key of ["xBottom", "xTop", "yLeft", "yRight"])
    if (settings.axes && Object.hasOwn(settings.axes, key) && !record(settings.axes[key]))
      fail(`${key} axis 구조가 올바르지 않습니다.`);
  if (Object.hasOwn(chart.editor, "plotlyExtensions")) {
    const extension = chart.editor.plotlyExtensions;
    if (!record(extension) || ["layout", "config"].some(key =>
      Object.hasOwn(extension, key) && !record(extension[key]))) fail("plotlyExtensions 구조가 올바르지 않습니다.");
  }
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
    if (!ALLOWED_CHART_TYPES.has(object.type) || !ALLOWED_AXIS_SIDES.x.has(object.xAxisSide) ||
        !ALLOWED_AXIS_SIDES.y.has(object.yAxisSide) || !ALLOWED_LINE_DASHES.has(object.lineDash) ||
        !ALLOWED_MARKER_SYMBOLS.has(object.markerSymbol)) fail(`그래프 객체 ${index + 1} enum이 올바르지 않습니다.`);
    for (const [key, [min, max]] of Object.entries(BackendSettings.defaults.limits.graphObject))
      if (!Number.isFinite(object[key]) || object[key] < min || object[key] > max)
        fail(`그래프 객체 ${index + 1} ${key} 범위가 올바르지 않습니다.`);
    if (Object.hasOwn(object, "plotlyTrace") && !record(object.plotlyTrace))
      fail(`그래프 객체 ${index + 1} plotlyTrace 구조가 올바르지 않습니다.`);
  });
  return chart;
}

export function rebuildEditableGraph(chart, project = activeProject._state) {
  chart.graph.data = traces(chart, project);
  chart.graph.layout = layout(chart, project);
  return chart;
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

export function setNestedAxisFromPlotly(target, input = {}, key = "xBottom") {
  const axis = input && typeof input === "object" && !Array.isArray(input) ? input : {},
    scaleType = axis.type === "log" ? "log" : "linear",
    range = Array.isArray(axis.range) && axis.range.length === 2 ? axis.range : [],
    bound = value => typeof value === "number" && Number.isFinite(value)
      ? axisRangeValueFromPlotly(value, scaleType) : "",
    linearTick = scaleType !== "log" && typeof axis.dtick === "string" &&
      axis.dtick.startsWith("L") && axis.dtick.slice(1).trim() !== "" &&
      Number.isFinite(Number(axis.dtick.slice(1))),
    raw = {
      title: typeof axis.title === "string" ? axis.title :
        typeof axis.title?.text === "string" ? axis.title.text : "",
      scaleType, divide: 1, min: bound(range[0]), max: bound(range[1]),
      tick: linearTick ? Number(axis.dtick.slice(1)) :
        scaleType !== "log" && typeof axis.dtick === "number" && Number.isFinite(axis.dtick) ? axis.dtick : "",
      tickMode: linearTick ? "increment" : "plotly",
      minorTicks: scaleType === "log" && (axis.dtick === "D1" || axis.minor?.dtick === "D1" ||
        ["inside", "outside"].includes(axis.minor?.ticks) || axis.minor?.showgrid === true),
      titleSize: axis.title?.font?.size, fontSize: axis.tickfont?.size, lineWidth: axis.linewidth,
      showGrid: axis.showgrid !== false, showValues: axis.showticklabels !== false,
      visible: axis.visible !== false,
      notation: ["e", "power"].includes(axis.exponentformat) ? axis.exponentformat : "none",
    };
  Object.assign(target, normalizeGraphLayoutSettings({ axes: { [key]: raw } }).axes[key]);
}

export function parsePlotlyToEditor(figure, id) {
  const record = value => value !== null && typeof value === "object" && !Array.isArray(value),
    text = value => typeof value === "string" ? value : "",
    titleText = value => typeof value === "string" ? value : text(value?.text);
  if (!record(figure) || (!Array.isArray(figure.data) && !record(figure.layout)) ||
      (figure.data !== undefined && !Array.isArray(figure.data)) ||
      (figure.layout !== undefined && !record(figure.layout)) ||
      (figure.config !== undefined && !record(figure.config)) ||
      (figure.frames !== undefined && !Array.isArray(figure.frames)) ||
      (figure.data || []).some(trace => !record(trace)))
    throw Error("유효한 Plotly figure 구조가 아닙니다.");
  const data = figure.data || [], layoutIn = figure.layout || {},
    defaults = BackendSettings.defaults.chartSettings.editor.objectStyle,
    limits = BackendSettings.defaults.limits.graphObject,
    style = (value, key) => {
      const number = graphScalarNumber(value), [min, max] = limits[key];
      return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : defaults[key];
    },
    headers = [], points = [], objects = [];
  data.forEach((trace, index) => {
    const x = Array.isArray(trace.x) ? trace.x : [], y = Array.isArray(trace.y) ? trace.y : [],
      length = Math.max(x.length, y.length), column = headers.length;
    headers.push(`trace${index + 1}_x`, `trace${index + 1}_y`);
    for (let i = 0; i < length; i++) points[i] ??= [];
    for (let i = 0; i < points.length; i++) {
      points[i][column] = x[i] !== undefined ? projectClone(x[i]) : "";
      points[i][column + 1] = y[i] !== undefined ? projectClone(y[i]) : "";
    }
    if (!length) return;
    const plotlyTrace = projectClone(trace), modes = text(trace.mode).split("+");
    delete plotlyTrace.x; delete plotlyTrace.y;
    objects.push({
      ...projectClone(defaults),
      x: `C${column + 1}`, y: `C${column + 2}`,
      xAxisSide: trace.xaxis === "x2" ? "top" : "bottom",
      yAxisSide: trace.yaxis === "y2" ? "right" : "left",
      type: trace.visible === false ? "hidden" : trace.type === "bar" ? "bar" :
        modes.includes("markers") ? modes.includes("lines") ? "lines+markers" : "markers" : "scatter",
      color: [trace.line?.color, trace.marker?.color].find(value => typeof value === "string" && value.length) ||
        DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      legendName: text(trace.name),
      lineWidth: style(trace.line?.width, "lineWidth"),
      lineDash: ALLOWED_LINE_DASHES.has(trace.line?.dash) ? trace.line.dash : defaults.lineDash,
      markerSymbol: ALLOWED_MARKER_SYMBOLS.has(trace.marker?.symbol) ? trace.marker.symbol : defaults.markerSymbol,
      markerSize: style(trace.marker?.size, "markerSize"),
      barOpacity: style(trace.opacity, "barOpacity"),
      barLineWidth: style(trace.marker?.line?.width, "barLineWidth"),
      plotlyTrace,
    });
  });
  // Pad earlier trace columns when a later trace extends the point sequence.
  const rows = objects.length ? [headers, ...points.map(row =>
    headers.map((_, column) => Object.hasOwn(row, column) ? row[column] : ""))] : [];
  const chart = createChartModel({
    id, editor: { editable: false, conversionRows: rows, objects, title: titleText(layoutIn.title) },
    graph: { config: projectClone(figure.config || {}), frames: projectClone(figure.frames || []),
      imported: projectClone({ data, layout: layoutIn, config: figure.config || {}, frames: figure.frames || [] }) },
  });
  if (id === null || id === undefined) delete chart.id;
  const settings = {
    showTitle: chart.editor.title.length > 0, showLegend: layoutIn.showlegend !== false, showZeroLine: false,
    graphFontFamily: [layoutIn.title?.font?.family, layoutIn.font?.family, layoutIn.legend?.font?.family]
      .find(value => typeof value === "string" && value.length) || "",
    titleFontSize: layoutIn.title?.font?.size, legendFontSize: layoutIn.legend?.font?.size, axes: {},
  };
  for (const [key, plotlyKey] of [["xBottom", "xaxis"], ["xTop", "xaxis2"], ["yLeft", "yaxis"], ["yRight", "yaxis2"]]) {
    settings.axes[key] = {};
    setNestedAxisFromPlotly(settings.axes[key], layoutIn[plotlyKey], key);
  }
  chart.editor.globalSettings = normalizeGraphLayoutSettings(settings);
  chart.editor.plotlyExtensions = projectClone({ layout: layoutIn, config: figure.config || {} });
  return chart;
}

export function baseGraphObject(chart, csv) {
  if (!csv) throw Error("그래프 오브젝트에 연결할 프로젝트 CSV가 없습니다.");
  return createCandidateBaseGraphObject(csv);
}

export function normalizedGraphObjects(chart) {
  const objects = projectClone(chart.editor.objects), defaults = BackendSettings.defaults.chartSettings.editor.objectStyle;
  for (const object of objects)
    for (const [key, value] of Object.entries(defaults))
      if (!Object.hasOwn(object, key)) object[key] = projectClone(value);
  return objects;
}

export function ensureGraphObjects(chart) {
  if (!chart) return [];
  chart.editor = chart.editor || {};
  chart.editor.objects = normalizedGraphObjects(chart);
  return chart.editor.objects;
}
