// Source: sourcescript/frontend/renderer.py (same logical owner); pseudocode/frontend/renderer.pcal.
import { ffpxBase64ToBytes, ffpxZipStore } from '../backend/assets_files.js';
import { scalePlotlyFigure } from '../backend/graphs.js';
import { alphaIdentifier, gridSlotGeometry, readImageSettings, romanIdentifier } from '../backend/layout_annotations.js';
import { APP_BUILD } from '../backend/settings.js';
import { auditApp } from '../system.js';

export const $ = (id) => document.getElementById(id);

export const uiTelemetryListeners = new Set();

export let uiTelemetryState = Object.freeze({
  revision: 0,
  status: "",
  debugEnabled: false,
  debugLines: [],
});

export function publishUiTelemetry(patch = {}) {
  uiTelemetryState = Object.freeze({
    ...uiTelemetryState,
    ...patch,
    revision: uiTelemetryState.revision + 1,
  });
  uiTelemetryListeners.forEach((listener) => listener());
  return uiTelemetryState;
}

export function subscribeUiTelemetry(listener) {
  uiTelemetryListeners.add(listener);
  return () => uiTelemetryListeners.delete(listener);
}

export function getUiTelemetrySnapshot() {
  return uiTelemetryState;
}

export function status(message) {
  let text = String(message ?? "");
  publishUiTelemetry({ status: text });
  return text;
}

export let debugEnabled = false;

export let debugSequence = 0;

export function setDebugEnabled(enabled) {
  debugEnabled = enabled === true;
  publishUiTelemetry({ debugEnabled });
  return debugEnabled;
}

export function clearDebugOutput() {
  debugSequence = 0;
  publishUiTelemetry({ debugLines: [] });
}

export function saveDebugOutput() {
  auditApp("debug:save");
  debugLog("debugLog:save", {
    build: APP_BUILD,
    userAgent: navigator.userAgent,
    location: location.href,
  });
  let blob = new Blob([getUiTelemetrySnapshot().debugLines.join("\n")], {
      type: "text/plain;charset=utf-8",
    }),
    link = document.createElement("a"),
    stamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.href = URL.createObjectURL(blob);
  link.download = `chart-builder-debug-${stamp}.log`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

export function debugValue(value) {
  if (value instanceof Error)
    return { name: value.name, message: value.message, stack: value.stack };
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return { serializationError: error.message, value: String(value) };
  }
}

export function debugLog(event, data = {}, level = "debug") {
  if (!debugEnabled) return;
  let payload = debugValue(data),
    line = `${String(++debugSequence).padStart(4, "0")} ${new Date().toISOString().slice(11, 23)} ${level.toUpperCase()} ${event} ${JSON.stringify(payload)}`;
  let method = console[level] || console.debug;
  method.call(console, "[chart-builder]", event, payload);
  let lines = [...uiTelemetryState.debugLines, line].slice(-500);
  publishUiTelemetry({ debugEnabled, debugLines: lines });
}

export function readmeContentHtml() {
  let template = $("readmeContent");
  return template ? template.innerHTML.replaceAll("{{APP_BUILD}}", APP_BUILD) : "";
}

export function applyReferenceGeometryProjection(element, style, width) {
  if (!element) return;
  const scale = width / style.referenceWidth,
    geometry = { outerMargin: Math.min(style.outerMargin * scale, Math.min(width, width / style.aspect) * .49),
      gap: style.gap * scale, radius: style.radius * scale, scale };
  element.style.setProperty("--dashboard-outer-margin", `${geometry.outerMargin}px`);
  element.style.setProperty("--slot-gap", `${geometry.gap}px`);
  element.style.setProperty("--slot-radius", `${geometry.radius}px`);
  return geometry;
}

export function syncDashboardCaptionWidth() {
  let dashboard = $("dashboard"),
    caption = $("dashboardCaption");
  if (!dashboard || !caption) return;
  let width = dashboard.getBoundingClientRect().width;
  caption.style.marginLeft = "0px";
  caption.style.width = `${width}px`;
  caption.style.minWidth = `${width}px`;
}

export function applySlotStyleProjection(style, interfaceState) {
  const dashboard = $("dashboard"), border = style.showBorders ? "var(--ui-color)" : "transparent",
    width = interfaceState.dashboardZoomLocked ? interfaceState.dashboardZoomLockedWidth
      : style.referenceWidth * interfaceState.dashboardZoomIntent / 100;
  for (const id of ["dashboard", "dashboardCaption"]) {
    const host = $(id);
    host?.style.setProperty("--slot-border-color", border);
    host?.style.setProperty("--layout-slot-border-style", style.showBorders ? "solid" : "dashed");
  }
  const hasAspect = Number.isFinite(style.aspect) && style.aspect > 0;
  dashboard.classList.toggle("fixed-aspect", hasAspect);
  if (hasAspect) dashboard.style.setProperty("--dashboard-aspect", `${style.aspect} / 1`);
  else dashboard.style.removeProperty("--dashboard-aspect");
  applyReferenceGeometryProjection(dashboard, style, width);
  syncDashboardCaptionWidth();
}

export const projectImageDisplayUrls = new Map();

export function projectImageDisplayUrl(image) {
  if (!image) return "";
  let cached = projectImageDisplayUrls.get(image);
  if (cached) return cached;
  let url = URL.createObjectURL(
    new Blob([ffpxBase64ToBytes(image.bytesBase64 || "")], {
      type: image.mime || "application/octet-stream",
    }),
  );
  projectImageDisplayUrls.set(image, url);
  return url;
}

export function releaseProjectImageDisplayUrl(image) {
  let url = image && projectImageDisplayUrls.get(image);
  if (!url) return;
  URL.revokeObjectURL(url);
  projectImageDisplayUrls.delete(image);
}

export function releaseProjectImageDisplayUrls(collection) {
  (Array.isArray(collection) ? collection : []).forEach(releaseProjectImageDisplayUrl);
}

export function esc(v) {
  return String(v).replace(
    /[&<>'"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c],
  );
}

function currentResizeRequests() {
  return [...rendererRuntime.graphInstances.values()].map(record => ({
    record, generation: record.generation, operation: record.operation,
    slotId: record.slotId, chartId: record.chartId, host: record.host, plot: record.plot,
  }));
}

export function resizePlots(requests = currentResizeRequests()) {
  for (const { record, generation, operation, slotId, chartId, host, plot } of requests) {
    if (generation !== rendererRuntime.dashboardRenderGeneration || record.generation !== generation ||
        record.operation !== operation || record.slotId !== slotId || record.chartId !== chartId ||
        record.host !== host || record.plot !== plot || rendererRuntime.graphInstances.get(slotId) !== record ||
        !host.isConnected || !plot.isConnected) continue;
    try {
      Plotly.Plots.resize(plot);
    } catch (_) {}
  }
}

export function schedulePlotResize() {
  // Coalesce to the latest explicit request, never implicitly acquire a newer
  // graph operation when an older frame callback finally runs.
  rendererRuntime.resizeRequests = currentResizeRequests();
  if (rendererRuntime.resizePending) return;
  rendererRuntime.resizePending = true;
  requestAnimationFrame(() => {
    const requests = rendererRuntime.resizeRequests;
    rendererRuntime.resizeRequests = [];
    rendererRuntime.resizePending = false;
    resizePlots(requests);
  });
}

export function installResizeObserver(frontendActions = {}) {
  if (rendererRuntime.resizeObserverInstalled) return;
  const target = $("dashboard"), area = $("graphArea"), handleResize = () => {
    if (frontendActions.refreshDashboard) { frontendActions.refreshDashboard(); return; }
    schedulePlotResize();
  };
  if (window.ResizeObserver) {
    let dashboardObserver, graphAreaObserver;
    try {
      dashboardObserver = new ResizeObserver(() => {
        syncDashboardCaptionWidth(); schedulePlotResize();
      });
      dashboardObserver.observe(target);
      graphAreaObserver = new ResizeObserver(handleResize);
      if (area) graphAreaObserver.observe(area);
    } catch (error) {
      // Partial installation owns only these observers; release without masking
      // the original failure or marking a failed installation as ready.
      try { dashboardObserver?.disconnect(); } catch {}
      try { graphAreaObserver?.disconnect(); } catch {}
      throw error;
    }
    rendererRuntime.dashboardObserver = dashboardObserver;
    rendererRuntime.graphAreaObserver = graphAreaObserver;
  } else window.addEventListener("resize", handleResize);
  rendererRuntime.resizeObserverInstalled = true;
}

export function clearSlotDragState() {
  rendererRuntime.slotDragSourceId = null;
  document
    .querySelectorAll("#dashboard .slot.drag-over")
    .forEach((slot) => slot.classList.remove("drag-over"));
}

export function scheduleSlotDragClickSuppressionRelease() {
  const suppression = rendererRuntime.slotDragSuppressClick;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // A previous drag's cleanup must not consume a later interaction's click.
      if (rendererRuntime.slotDragSourceId === null && rendererRuntime.slotDragSuppressClick === suppression)
        rendererRuntime.slotDragSuppressClick = false;
    });
  });
}

export function installSlotClickControllerProjection(frontendActions) {
  const dashboard = $("dashboard");
  if (dashboard.dataset.clickController) return;
  dashboard.dataset.clickController = "true";
  const hostFor = event => {
    const host = event.target.closest?.(".slot");
    return host?.parentElement === dashboard ? host : null;
  };
  dashboard.addEventListener("click", event => {
    const host = hostFor(event), bookmark = !!event.target.closest?.(".slot-tab");
    if (bookmark && rendererRuntime.slotDragSuppressClick) {
      event.preventDefault(); event.stopPropagation();
      rendererRuntime.slotDragSuppressClick = false;
      return;
    }
    if (!host) {
      if (dashboard.querySelector(".slot.selected")) frontendActions.slots.select(null, "fsm-to-model");
    } else if (!host.classList.contains("selected") || bookmark || host.classList.contains("empty")) {
      event.preventDefault(); event.stopPropagation();
      frontendActions.slots.select(Number(host.dataset.slot), "ui-to-fsm");
    }
  }, true);
  dashboard.addEventListener("dragstart", event => {
    const host = hostFor(event), bookmark = event.target.closest?.('.slot-tab[draggable="true"]');
    if (!host || !bookmark) { event.preventDefault(); return; }
    rendererRuntime.slotDragSourceId = Number(host.dataset.slot);
    // Truthy token owns this interaction's suppression, not a second selection state.
    rendererRuntime.slotDragSuppressClick = {};
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(rendererRuntime.slotDragSourceId));
  });
  dashboard.addEventListener("dragover", event => {
    const host = hostFor(event);
    if (!host) return;
    const files = dataTransferHasFiles(event.dataTransfer);
    if (!files && (rendererRuntime.slotDragSourceId === null ||
        rendererRuntime.slotDragSourceId === Number(host.dataset.slot))) return;
    event.preventDefault(); event.dataTransfer.dropEffect = files ? "copy" : "move";
    dashboard.querySelectorAll(".slot.drag-over").forEach(other => other.classList.toggle("drag-over", other === host));
    host.classList.add("drag-over");
  });
  dashboard.addEventListener("dragleave", event => {
    const host = hostFor(event);
    if (host && !host.contains(event.relatedTarget)) host.classList.remove("drag-over");
  });
  dashboard.addEventListener("drop", event => {
    if (dataTransferHasFiles(event.dataTransfer)) return;
    const host = hostFor(event), source = rendererRuntime.slotDragSourceId;
    clearSlotDragState(); scheduleSlotDragClickSuppressionRelease();
    if (!host || source === null || source === Number(host.dataset.slot)) return;
    event.preventDefault(); event.stopPropagation();
    frontendActions.slots.swap(source, Number(host.dataset.slot));
  });
  dashboard.addEventListener("dragend", () => {
    clearSlotDragState(); scheduleSlotDragClickSuppressionRelease();
  });
}

export function syncDashboardCaptionProjection(view, scale = 1) {
  let box = $("dashboardCaption"),
    input = $("captionText"),
    prefix = $("captionPrefix");
  if (!box || !input || !prefix) return;
  box.classList.toggle("hidden", !view.enabled);
  box.classList.toggle("slot-caption-view", !!view.slot);
  let prefixText = view.label || view.name;
  prefix.textContent = prefixText;
  prefix.classList.toggle("hidden", !prefixText);
  prefix.classList.toggle("bold", view.nameBold);
  if (view.aggregate) {
    input.contentEditable = "false";
    let before = input.querySelector('[data-caption-region="before"]'),
      sections = input.querySelector('[data-caption-region="sections"]'),
      after = input.querySelector('[data-caption-region="after"]');
    if (!before || !sections || !after) {
      before = document.createElement("span");
      before.dataset.captionRegion = "before";
      before.className = "caption-edit-region";
      before.contentEditable = "true";
      sections = document.createElement("span");
      sections.dataset.captionRegion = "sections";
      sections.contentEditable = "false";
      after = document.createElement("span");
      after.dataset.captionRegion = "after";
      after.className = "caption-edit-region";
      after.contentEditable = "true";
      input.replaceChildren(before, sections, after);
    }
    if (before.textContent !== view.text) before.textContent = view.text;
    if (after.textContent !== view.afterText) after.textContent = view.afterText;
    let signature = JSON.stringify(view.sections);
    if (sections.dataset.signature !== signature) {
      sections.dataset.signature = signature;
      sections.replaceChildren(
        ...view.sections.map((section) => {
          let wrapper = document.createElement("span");
          wrapper.className = "caption-section";
          if (section.label) {
            let label = document.createElement("span");
            label.className = "caption-section-label";
            label.textContent = section.label;
            label.contentEditable = "false";
            wrapper.append(label);
          }
          wrapper.append(document.createTextNode(section.text));
          return wrapper;
        }),
      );
    }
  } else {
    input.contentEditable = "true";
    if (
      input.querySelector("[data-caption-region]") ||
      input.textContent !== view.text
    )
      input.textContent = view.text;
  }
  box.style.fontFamily = view.settings.fontFamily;
  box.style.fontSize = `${view.settings.fontSize * scale}px`;
  box.style.lineHeight = view.settings.lineHeight;
}

// One host has one latest presentation attempt, including narrow palette refreshes.
function presentSuppliedGraph(record, slot, selected, generation, scale, frontendActions) {
  record.generation = generation;
  const operation = {}, slotId = slot.id, chartId = slot.content.chart;
  record.operation = operation;
  const current = () => generation === rendererRuntime.dashboardRenderGeneration &&
    record.generation === generation && record.operation === operation && rendererRuntime.graphInstances.get(slotId) === record && record.host.isConnected;
  // Serialize updates to a reused Plotly host; old work must settle before the next
  // react. A superseded queued generation skips work rather than overwriting it.
  record.pending = record.pending.catch(() => {}).then(async () => {
    if (!current()) return;
    const figure = scalePlotlyFigure(slot.figure, scale);
    await Plotly.react(record.plot, figure.data, figure.layout,
      { ...figure.config, staticPlot: !selected, responsive: true, displaylogo: false, doubleClick: "reset" });
    if (!current()) return;
    record.plot.removeAllListeners?.("plotly_relayout"); record.plot.removeAllListeners?.("plotly_doubleclick");
    const report = (event = {}, all = false) => {
      if (!current() || rendererRuntime.programmaticPlotlyRelayout.get(record.plot) > 0) return;
      const ranges = {};
      for (const axis of ["xaxis", "xaxis2", "yaxis", "yaxis2"]) {
        if (all || Object.keys(event).some(key => key === axis + ".autorange" || key === axis + ".range" || key.startsWith(axis + ".range["))) {
          const range = record.plot._fullLayout?.[axis]?.range;
          if (Array.isArray(range) && range.length === 2) ranges[axis] = [...range];
        }
      }
      frontendActions.graphRangesChanged?.(slotId, chartId, ranges);
    };
    record.plot.on?.("plotly_relayout", event => report(event));
    record.plot.on?.("plotly_doubleclick", () => setTimeout(() => report({}, true), 0));
    requestAnimationFrame(() => { if (current()) { try { Plotly.Plots.resize(record.plot); } catch {} } });
  }).catch(error => {
    if (!current()) return;
    try { status(`그래프 렌더링 오류: ${error?.message || error}`); } catch {}
    throw error;
  });
}

// Post-reconciliation presentation effect; result facts and domain values are supplied.
export function applyDashboardProjectionInvalidation(event, mutationResult, interfaceState, projectProjection, frontendActions = {}) {
  if (mutationResult.projectionEffect?.pathOnly && !mutationResult.projectionEffect?.referencesRemoved)
    return "NONE";
  const slots = projectProjection.visibleSlots, dashboard = $("dashboard"),
    hosts = [...dashboard.querySelectorAll(":scope > .slot")],
    sameHosts = hosts.length === slots.length && slots.every(slot => {
      const host = hosts.find(host => host.dataset.slot === String(slot.id));
      if (!host) return false;
      if (slot.contentType !== "image" && slot.figure) {
        const record = rendererRuntime.graphInstances.get(slot.id);
        return record?.host === host && record.chartId === slot.content.chart && record.plot.isConnected;
      }
      if (slot.imageView) {
        const surface = rendererRuntime.imageSurfaces.get(slot.id);
        return surface?.host === host && surface.element.isConnected && surface.imageInput.src === slot.imageView.src;
      }
      return host.classList.contains("empty");
    }),
    narrow = ["CAPTION_TEXT_INPUT", "SLOT_CAPTIONS_INSERTED", "CAPTION_SETTINGS_CHANGED",
      "LABEL_SETTINGS_CHANGED", "LABEL_POSITION_CHANGED", "SLOT_IMAGE_SETTINGS_CHANGED", "APPEARANCE_CHANGED"].includes(event);
  if (mutationResult.projectionEffect?.referencesRemoved || !narrow || !sameHosts) {
    renderDashboardProjection(projectProjection, interfaceState, frontendActions);
    return "FULL_DASHBOARD";
  }
  const style = projectProjection.layout.slotStyle,
    width = interfaceState.dashboardZoomLocked ? interfaceState.dashboardZoomLockedWidth
      : style.referenceWidth * interfaceState.dashboardZoomIntent / 100,
    scale = width / style.referenceWidth;
  if (["CAPTION_TEXT_INPUT", "SLOT_CAPTIONS_INSERTED", "CAPTION_SETTINGS_CHANGED"].includes(event)) {
    syncDashboardCaptionProjection(projectProjection.annotations.captions, scale);
    syncDashboardCaptionWidth();
  } else if (event === "APPEARANCE_CHANGED") {
    applyUiPaletteProjection(projectProjection.appearance.uiPalette);
    for (const slot of slots) {
      const record = rendererRuntime.graphInstances.get(slot.id);
      if (record) presentSuppliedGraph(record, slot, slot.id === interfaceState.selectedSlotId,
        rendererRuntime.dashboardRenderGeneration, scale, frontendActions);
    }
    // Passive observation does not convert the original per-host rejection to success.
    Promise.all([...rendererRuntime.graphInstances.values()].map(record => record.pending)).catch(() => {});
  } else if (event === "SLOT_IMAGE_SETTINGS_CHANGED") {
    for (const slot of slots) {
      if (!slot.imageView) continue;
      const element = rendererRuntime.imageSurfaces.get(slot.id).element, settings = slot.imageView.settings;
      element.classList.toggle("manual", settings.fit === "manual");
      element.style.width = settings.fit === "manual" ? `${settings.scale}%` : "";
      element.style.left = settings.fit === "manual" ? `${settings.x}%` : "";
      element.style.top = settings.fit === "manual" ? `${settings.y}%` : "";
      element.style.objectFit = settings.fit === "manual" ? "" : settings.fit;
    }
  } else {
    const labels = new Map(projectProjection.orderedSlotLabels.map(label => [label.slotId, label.displayLabel])),
      settings = projectProjection.annotations.labels.settings;
    for (const slot of slots) {
      const host = hosts.find(host => host.dataset.slot === String(slot.id));
      host.querySelectorAll(":scope > .slot-label").forEach(label => label.remove());
      if (!projectProjection.annotations.labels.enabled || !labels.has(slot.id)) continue;
      const label = document.createElement("span");
      label.className = "slot-label"; label.textContent = labels.get(slot.id);
      label.setAttribute("aria-label", "슬롯 식별자");
      label.style.left = `${settings.x * scale}px`; label.style.top = `${settings.y * scale}px`;
      label.style.fontFamily = settings.fontFamily; label.style.fontSize = `${settings.fontSize * scale}px`;
      host.append(label);
    }
  }
  return "TARGETED_PROJECTION";
}

// One-call resolved relation, never a retained editing pointer or Backend lookup.
export function resolveSelectedChart(projectProjection, interfaceState) {
  const slot = projectProjection.visibleSlots.find(slot => slot.id === interfaceState.selectedSlotId);
  return slot && slot.contentType !== "image" ? slot.chart || null : null;
}

// Selection/workspace presentation owns existing surfaces, not domain selection.
// React workspace controls subscribe to the final FSM state and use public reads;
// no chart/image snapshot is published as another editor store here.
export function updateGraphViewProjection(projectProjection, interfaceState, frontendActions = {}) {
  const dashboard = $("dashboard"), slots = projectProjection.visibleSlots,
    hosts = new Map([...dashboard.children].filter(host => host.classList.contains("slot"))
      .map(host => [host.dataset.slot, host])), generation = rendererRuntime.dashboardRenderGeneration;
  // Association/host checks are presentation-lifetime guards, not project reads.
  // A structural/content replacement must use the normal owner cleanup path.
  if (hosts.size !== slots.length || slots.some(slot => {
    const host = hosts.get(String(slot.id)), record = rendererRuntime.graphInstances.get(slot.id),
      surface = rendererRuntime.imageSurfaces.get(slot.id);
    if (!host?.isConnected) return true;
    if (slot.contentType !== "image" && slot.figure)
      return !record || record.host !== host || !record.plot.isConnected || record.chartId !== slot.content.chart;
    if (record) return true;
    return slot.imageView ? !surface || surface.host !== host || !surface.element.isConnected || surface.imageInput.src !== slot.imageView.src : !!surface;
  })) return renderDashboardProjection(projectProjection, interfaceState, frontendActions);
  const chart = resolveSelectedChart(projectProjection, interfaceState), style = projectProjection.layout.slotStyle,
    scale = (interfaceState.dashboardZoomLocked ? interfaceState.dashboardZoomLockedWidth
      : style.referenceWidth * interfaceState.dashboardZoomIntent / 100) / style.referenceWidth;
  for (const slot of slots) {
    const selected = slot.id === interfaceState.selectedSlotId, record = rendererRuntime.graphInstances.get(slot.id);
    hosts.get(String(slot.id)).classList.toggle("selected", selected);
    if (record) presentSuppliedGraph(record, slot, selected && slot.chart === chart, generation, scale, frontendActions);
  }
  const completion = Promise.all([
    ...[...rendererRuntime.graphInstances.values()].map(record => record.pending),
    ...[...rendererRuntime.imageSurfaces.values()].map(surface => surface.pending),
  ]);
  completion.catch(() => {});
  return { generation, completion };
}

// Source startupCoreRuntime: one supplied initial read, in the declared order.
// Lifecycle ready and Backend acquisition belong to the Application boundary.
export function startupCoreRuntimeProjection(projectProjection, interfaceState, frontendActions) {
  applyDashboardZoomProjection(projectProjection.layout, interfaceState);
  installSlotClickControllerProjection(frontendActions);
  const presentation = renderDashboardProjection(projectProjection, interfaceState, frontendActions);
  applySlotStyleProjection(projectProjection.layout.slotStyle, interfaceState);
  return presentation;
}

// Physical renderer entry for Source renderDashboard(projectProjection, interfaceState).
// All domain content is supplied by Application; associations below own only DOM lifetimes.
export function renderDashboardProjection(projectProjection, interfaceState, frontendActions = {}) {
  const generation = ++rendererRuntime.dashboardRenderGeneration,
    dashboard = $("dashboard"), style = projectProjection.layout.slotStyle,
    width = interfaceState.dashboardZoomLocked ? interfaceState.dashboardZoomLockedWidth
      : style.referenceWidth * interfaceState.dashboardZoomIntent / 100,
    scale = width / style.referenceWidth,
    geometry = { scale, outerMargin: Math.min(style.outerMargin * scale, Math.min(width, width / style.aspect) * .49),
      gap: style.gap * scale, radius: style.radius * scale },
    slots = projectProjection.visibleSlots,
    labels = new Map(projectProjection.orderedSlotLabels.map(label => [label.slotId, label.displayLabel]));
  dashboard.style.width = dashboard.style.minWidth = `${width}px`;
  dashboard.style.setProperty("--grid-cols", projectProjection.layout.gridCols);
  dashboard.style.setProperty("--grid-rows", projectProjection.layout.gridRows);
  dashboard.style.setProperty("--dashboard-outer-margin", `${geometry.outerMargin}px`);
  dashboard.style.setProperty("--slot-gap", `${geometry.gap}px`);
  dashboard.style.setProperty("--slot-radius", `${geometry.radius}px`);
  dashboard.style.setProperty("--dashboard-aspect", `${style.aspect} / 1`);
  dashboard.classList.toggle("fixed-aspect", Number.isFinite(style.aspect) && style.aspect > 0);
  for (const host of [dashboard, $("dashboardCaption")]) {
    host?.style.setProperty("--slot-border-color", style.showBorders ? "var(--ui-color)" : "transparent");
    host?.style.setProperty("--layout-slot-border-style", style.showBorders ? "solid" : "dashed");
  }
  applyUiPaletteProjection(projectProjection.appearance.uiPalette);
  const discard = record => {
    rendererRuntime.graphInstances.delete(record.slotId);
    record.host.remove();
    try { Plotly.purge(record.plot); } catch {}
    // A pending Plotly operation may finish after detach; it must never revive a live view.
    record.pending?.finally(() => { try { Plotly.purge(record.plot); } catch {} }).catch(() => {});
  };
  for (const record of rendererRuntime.graphInstances.values()) {
    const slot = slots.find(slot => slot.id === record.slotId);
    if (!slot || slot.contentType === "image" || !slot.figure || slot.content.chart !== record.chartId ||
        !record.host.isConnected) discard(record);
  }
  // Image elements are surface-owned decode handles, never shared asset handles.
  // Detach before dropping src; an obsolete decode may reject but is no longer current.
  for (const surface of rendererRuntime.imageSurfaces.values()) {
    rendererRuntime.imageSurfaces.delete(surface.slotId);
    surface.element.remove();
    surface.element.removeAttribute("src");
  }
  const ids = new Set(slots.map(slot => String(slot.id)));
  dashboard.querySelectorAll(":scope > .slot").forEach(host => {
    if (!ids.has(host.dataset.slot)) host.remove();
  });
  for (const slot of slots) {
    const graph = slot.contentType !== "image" && slot.figure,
      image = !graph && slot.imageView,
      selected = slot.id === interfaceState.selectedSlotId;
    let record = rendererRuntime.graphInstances.get(slot.id),
      host = record?.host || [...dashboard.children].find(host => host.dataset.slot === String(slot.id));
    if (!host) { host = document.createElement("section"); host.dataset.slot = slot.id; }
    host.className = "slot" + (!graph && !image ? " empty" : "") + (selected ? " selected" : "");
    host.style.gridArea = `${slot.row} / ${slot.col} / span ${slot.rowSpan} / span ${slot.colSpan}`;
    if (graph && !record) {
      host.replaceChildren();
      const card = document.createElement("div"), plot = document.createElement("div");
      card.className = "chart-card"; plot.className = "plot-item"; plot.id = `plot-${slot.id}`;
      card.append(plot); host.append(card);
      record = { host, plot, slotId: slot.id, chartId: slot.content.chart, generation, pending: Promise.resolve() };
      rendererRuntime.graphInstances.set(slot.id, record);
    } else if (!graph) {
      // Copied pure URLs avoid shared revocation. Each native decode still belongs
      // to this surface/generation and must settle without reviving replaced DOM.
      host.replaceChildren();
      if (image) {
        const frame = document.createElement("div"), element = document.createElement("img"),
          settings = image.settings;
        frame.className = "slot-image-frame"; element.className = "slot-image";
        element.alt = image.name || "슬롯 이미지"; element.src = image.src;
        if (settings.fit === "manual") {
          element.classList.add("manual");
          element.style.width = `${settings.scale}%`; element.style.left = `${settings.x}%`; element.style.top = `${settings.y}%`;
        } else element.style.objectFit = settings.fit;
        frame.append(element); host.append(frame);
        const surface = { host, element, slotId: slot.id, imageInput: image, generation, pending: null };
        rendererRuntime.imageSurfaces.set(slot.id, surface);
        const current = () => generation === rendererRuntime.dashboardRenderGeneration &&
          rendererRuntime.imageSurfaces.get(slot.id) === surface && surface.imageInput === image &&
          host.isConnected && element.parentElement === frame;
        surface.pending = Promise.resolve().then(async () => {
          if (!current()) return;
          try {
            await element.decode();
            if (!current()) return;
          } catch (error) {
            if (!current()) return;
            // A failed temporary surface owns only this element; preserve decode's
            // original failure without invalidating another surface of the same asset.
            rendererRuntime.imageSurfaces.delete(slot.id);
            element.remove(); element.removeAttribute("src");
            throw error;
          }
        });
      }
    }
    host.querySelectorAll(".slot-tab,.slot-label").forEach(element => element.remove());
    if (graph || image) {
      const tab = document.createElement("button"); tab.className = "slot-tab"; tab.type = "button"; tab.draggable = true;
      tab.setAttribute("aria-label", "슬롯 이동 및 선택"); tab.innerHTML = '<span class="slot-tab-shape"></span>'; host.append(tab);
    }
    if (projectProjection.annotations.labels.enabled && labels.has(slot.id)) {
      const label = document.createElement("span"), settings = projectProjection.annotations.labels.settings;
      label.className = "slot-label"; label.textContent = labels.get(slot.id); label.setAttribute("aria-label", "슬롯 식별자");
      label.style.left = `${settings.x * scale}px`; label.style.top = `${settings.y * scale}px`;
      label.style.fontFamily = settings.fontFamily; label.style.fontSize = `${settings.fontSize * scale}px`; host.append(label);
    }
    dashboard.append(host);
    if (record) presentSuppliedGraph(record, slot, selected, generation, scale, frontendActions);
  }
  syncDashboardCaptionProjection(projectProjection.annotations.captions, scale);
  syncDashboardCaptionWidth();
  installResizeObserver(frontendActions);
  const completion = Promise.all([
    ...[...rendererRuntime.graphInstances.values()].map(record => record.pending),
    ...[...rendererRuntime.imageSurfaces.values()].map(surface => surface.pending),
  ]);
  // Presentation callers may await the original rejection. The passive observer
  // prevents an unhandled-rejection side effect when UI event callers ignore it.
  completion.catch(() => {});
  return { generation, completion };
}

export function plotlyConfig(chart, extra = {}) {
  return {
    ...(chart.graph?.config || {}),
    ...extra,
    responsive: true,
    displaylogo: false,
    doubleClick: "reset",
  };
}

export function syncSlotImageElement(projectProjection) {
  if (!projectProjection) return false;
  let element=document.querySelector(`.slot[data-slot="${projectProjection.slotId}"] .slot-image`);
  if(!element)return false;
  let settings=projectProjection.settings;
  element.classList.toggle("manual",settings.fit==="manual");
  element.removeAttribute("style");
  if(settings.fit==="manual"){
    element.style.width=`${settings.scale}%`;
    element.style.left=`${settings.x}%`;
    element.style.top=`${settings.y}%`;
  } else element.style.objectFit=settings.fit;
  return true;
}

export function dataTransferHasFiles(dataTransfer) {
  return Array.from(dataTransfer?.types || []).includes("Files");
}

export function exportImageLoad(src) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(Error("이미지를 읽을 수 없습니다."));
    image.src = src;
  });
}

export function exportDrawImage(ctx,image,rect,slot,scaleX,scaleY) {
  let settings=readImageSettings(slot?.content?.imageSettings),
    width=rect.width,height=rect.height,ratio=image.naturalWidth/image.naturalHeight||1,
    fit=settings.fit||"contain",drawW,drawH,left,top;
  if(fit==="manual"){
    drawW=(width*(Number(settings.scale)||100))/100; drawH=drawW/ratio;
    left=rect.left+width*((Number(settings.x)||50)/100)-drawW/2;
    top=rect.top+height*((Number(settings.y)||50)/100)-drawH/2;
  } else {
    let contain=fit!=="cover", fitWidth=width, fitHeight=fitWidth/ratio;
    if((contain&&fitHeight>height)||(!contain&&fitHeight<height)){
      fitHeight=height; fitWidth=fitHeight*ratio;
    }
    drawW=fitWidth; drawH=fitHeight;
    left=rect.left+(width-drawW)/2; top=rect.top+(height-drawH)/2;
  }
  ctx.drawImage(image,left*scaleX,top*scaleY,drawW*scaleX,drawH*scaleY);
}

export function exportWrapText(ctx, text, x, y, maxWidth, lineHeight) {
  let words = (text || "").split(/\s+/),
    line = "";
  for (let word of words) {
    let trial = line ? line + " " + word : word;
    if (ctx.measureText(trial).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else line = trial;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

export function exportCrc32(bytes) {
  let crc = 0xffffffff;
  for (let byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function exportSetPngDpi(bytes, dpi) {
  let meter = Math.round(dpi / 0.0254),
    chunk = new Uint8Array(21),
    view = new DataView(chunk.buffer);
  view.setUint32(0, 9);
  chunk.set([112, 72, 89, 115], 4);
  view.setUint32(8, meter);
  view.setUint32(12, meter);
  chunk[16] = 1;
  view.setUint32(17, exportCrc32(chunk.slice(4, 17)));
  let ihdrLength = new DataView(bytes.buffer, bytes.byteOffset + 8, 4).getUint32(0),
    offset = 8 + 4 + 4 + ihdrLength + 4,
    result = new Uint8Array(bytes.length + chunk.length);
  result.set(bytes.slice(0, offset));
  result.set(chunk, offset);
  result.set(bytes.slice(offset), offset + chunk.length);
  return result;
}

export function exportSetJpegDpi(bytes, dpi) {
  let result = new Uint8Array(bytes);
  for (let i = 0; i + 17 < result.length; i++)
    if (
      result[i] === 74 &&
      result[i + 1] === 70 &&
      result[i + 2] === 73 &&
      result[i + 3] === 70 &&
      result[i + 4] === 0
    ) {
      let value = Math.max(1, Math.min(65535, Math.round(dpi)));
      result[i + 7] = 1;
      result[i + 8] = value >> 8;
      result[i + 9] = value & 255;
      result[i + 10] = value >> 8;
      result[i + 11] = value & 255;
      break;
    }
  return result;
}

export async function exportCanvasBlob(canvas, mime, dpi) {
  let blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(Error("이미지 인코딩에 실패했습니다."))),
        mime,
        mime === "image/jpeg" ? 0.92 : undefined,
      ),
    ),
    bytes = new Uint8Array(await blob.arrayBuffer()),
    withDpi =
      mime === "image/png" ? exportSetPngDpi(bytes, dpi) : exportSetJpegDpi(bytes, dpi);
  return new Blob([withDpi], { type: mime });
}

export async function exportDashboard(snapshot, statusSink) {
  let dashboard = $("dashboard"),
    caption = $("dashboardCaption"),
    statusOut = {
      set textContent(value) {
        // Progress delivery cannot veto capture, rejection, or a completed handoff.
        try { statusSink?.(value); } catch {}
      },
    },
    bordersVisible = snapshot.layout.slotStyle.showBorders,
    captionView = snapshot.annotations.captions,
    dashboardRect = dashboard.getBoundingClientRect();
  if (!dashboardRect.width || !dashboardRect.height) {
    statusOut.textContent = "저장할 그래프 영역이 없습니다.";
    return { outcome: "rejected", reason: "grid-geometry" };
  }
  let captionShown = captionView.enabled && !caption.classList.contains("hidden"),
    captionRect = captionShown ? caption.getBoundingClientRect() : null,
    labels = snapshot.annotations.labels.enabled ? [...dashboard.querySelectorAll(".slot-label")].flatMap(element => {
      const slotId = Number(element.closest(".slot")?.dataset.slot),
        label = snapshot.orderedSlotLabels.find(item => item.slotId === slotId);
      if (!label) return [];
      const style = getComputedStyle(element);
      return [{ rect: element.getBoundingClientRect(), text: label.displayLabel,
        color: style.color, fontWeight: style.fontWeight, fontSize: parseFloat(style.fontSize),
        fontFamily: style.fontFamily, paddingLeft: parseFloat(style.paddingLeft || 0) }];
    }) : [],
    left = dashboardRect.left,
    top = dashboardRect.top,
    right = dashboardRect.right,
    bottom = Math.max(dashboardRect.bottom, captionRect?.bottom || 0);
  labels.forEach((label) => {
    let rect = label.rect;
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  });
  let sourceWidth = right - left,
    sourceHeight = bottom - top,
    width = Math.round(sourceWidth), height = Math.round(sourceHeight),
    dpi = snapshot.export.dpi, format = snapshot.export.format;
  if (width > snapshot.rasterLimits.rasterDimension || height > snapshot.rasterLimits.rasterDimension ||
      width * height > snapshot.rasterLimits.rasterArea) {
    return { outcome: "rejected", reason: "raster-limit" };
  }
  // Read viewport presentation once, before any asynchronous raster work.
  const slotElements = [...dashboard.querySelectorAll(".slot")].flatMap(element => {
    const slot = snapshot.visibleSlots.find(item => item.id === Number(element.dataset.slot));
    if (!slot) return [];
    const style = getComputedStyle(element);
    return [{ slot, rect: element.getBoundingClientRect(), background: style.backgroundColor,
      border: style.borderColor, plot: element.querySelector(".plot-item") }];
  }), captionStyle = captionShown ? getComputedStyle(caption) : null,
    captionColors = captionStyle ? { background: captionStyle.backgroundColor,
      border: captionStyle.borderColor, color: captionStyle.color } : null;
  let canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d"),
    scaleX = width / sourceWidth,
    scaleY = height / sourceHeight,
    point = (rect) => ({
      left: rect.left - left,
      top: rect.top - top,
      width: rect.width,
      height: rect.height,
    });
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = getComputedStyle(dashboard).backgroundColor || "#fff";
  ctx.fillRect(0, 0, width, height);
  statusOut.textContent = "그래프를 합성하는 중…";
  try {
    for (let element of slotElements) {
      let rect = point(element.rect);
      ctx.fillStyle = element.background || "#fff";
      ctx.fillRect(
        rect.left * scaleX,
        rect.top * scaleY,
        rect.width * scaleX,
        rect.height * scaleY,
      );
      if (bordersVisible) {
        ctx.strokeStyle = element.border || "#B0CFCE";
        ctx.lineWidth = Math.max(1, scaleX);
        ctx.strokeRect(
          rect.left * scaleX,
          rect.top * scaleY,
          rect.width * scaleX,
          rect.height * scaleY,
        );
      }
      let plot = element.plot, imageView = element.slot.imageView;
      if (plot) {
        let uri = await Plotly.toImage(plot, {
          format: "png",
          width: Math.max(2, Math.round(rect.width * scaleX)),
          height: Math.max(2, Math.round(rect.height * scaleY)),
        });
        let image = await exportImageLoad(uri);
        ctx.drawImage(
          image,
          rect.left * scaleX,
          rect.top * scaleY,
          rect.width * scaleX,
          rect.height * scaleY,
        );
      } else if (imageView) {
        let image = await exportImageLoad(imageView.src);
        exportDrawImage(ctx, image, rect, element.slot, scaleX, scaleY);
      }
    }
    for (let label of labels) {
      let rect = point(label.rect);
      ctx.fillStyle = label.color || "#383A42";
      ctx.font = `${label.fontWeight} ${label.fontSize * scaleY}px ${label.fontFamily}`;
      ctx.textBaseline = "middle";
      ctx.fillText(
        label.text,
        (rect.left + label.paddingLeft) * scaleX,
        (rect.top + rect.height / 2) * scaleY,
      );
    }
    if (captionShown && captionRect) {
      let rect = point(captionRect), style = captionColors;
      ctx.fillStyle = style.background || "#fff";
      ctx.fillRect(
        rect.left * scaleX,
        rect.top * scaleY,
        rect.width * scaleX,
        rect.height * scaleY,
      );
      ctx.strokeStyle = style.border || "#B0CFCE";
      ctx.strokeRect(
        rect.left * scaleX,
        rect.top * scaleY,
        rect.width * scaleX,
        rect.height * scaleY,
      );
      let prefix = captionView.name || "",
        body = captionView.text || "",
        fontSize = captionView.settings.fontSize * scaleY,
        lineHeight =
          captionView.settings.fontSize * captionView.settings.lineHeight * scaleY,
        baseX = (rect.left + 8) * scaleX,
        y = (rect.top + 8) * scaleY + fontSize;
      ctx.fillStyle = style.color || "#383A42";
      if (prefix) {
        ctx.font = `${captionView.nameBold ? "700" : "400"} ${fontSize}px ${captionView.settings.fontFamily}`;
        ctx.fillText(prefix, baseX, y);
        let prefixWidth = ctx.measureText(prefix + " ").width,
          available = Math.max(10, (rect.width - 16) * scaleX),
          words = body.split(/\s+/).filter(Boolean),
          firstLine = "";
        ctx.font = `400 ${fontSize}px ${captionView.settings.fontFamily}`;
        while (words.length) {
          let trial = firstLine ? `${firstLine} ${words[0]}` : words[0];
          if (
            firstLine &&
            ctx.measureText(trial).width > Math.max(10, available - prefixWidth)
          )
            break;
          firstLine = trial;
          words.shift();
        }
        if (firstLine) ctx.fillText(firstLine, baseX + prefixWidth, y);
        body = words.join(" ");
        if (body) y += lineHeight;
      }
      ctx.font = `400 ${fontSize}px ${captionView.settings.fontFamily}`;
      if (body)
        exportWrapText(
          ctx,
          body,
          baseX,
          y,
          Math.max(10, (rect.width - 16) * scaleX),
          lineHeight,
        );
    }
    let mime = format === "jpeg" ? "image/jpeg" : "image/png",
      blob = await exportCanvasBlob(canvas, mime, dpi),
      stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await downloadExportPayload({ blob,
      name: `전체-그래프-${width}x${height}-${dpi}dpi-${stamp}.${format === "jpeg" ? "jpg" : "png"}`,
    });
    statusOut.textContent = `${width} × ${height}px, ${dpi} DPI로 저장했습니다.`;
    try { debugLog("dashboard:export", { format, width, height, dpi, slots: slotElements.length }); } catch {}
    return { outcome: "saved", width, height, automaticHeight: false };
  } catch (error) {
    // Progress/debug reporting is not authority over an already failed export.
    try { statusOut.textContent = "저장 실패: " + (error?.message ?? String(error)); } catch {}
    try { debugLog("dashboard:export-error", { message: error?.message ?? String(error) }); } catch {}
    throw error;
  }
}

export async function exportChartImage(suppliedFigure, width, height, layoutScale, rasterScale) {
  let host = document.createElement("div"),
    figure = scalePlotlyFigure(suppliedFigure, layoutScale);
  host.style.cssText =
    "position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none;";
  host.style.width = `${Math.max(2, width)}px`;
  host.style.height = `${Math.max(2, height)}px`;
  document.body.append(host);
  let failed = false;
  try {
    await Plotly.newPlot(
      host,
      figure.data,
      { ...figure.layout, width, height, autosize: false },
      { ...figure.config, staticPlot: true, responsive: false },
    );
    return await Plotly.toImage(host, {
      format: "png",
      width: Math.max(2, Math.round(width)),
      height: Math.max(2, Math.round(height)),
      scale: rasterScale,
    });
  } catch (error) {
    failed = true;
    throw error;
  } finally {
    try {
      try { Plotly.purge(host); } finally { host.remove(); }
    } catch (cleanupError) {
      // Cleanup must not replace the original render failure (including throw undefined).
      // With no render failure, preserve the existing cleanup-only rejection.
      if (!failed) throw cleanupError;
    }
  }
}

export async function exportCaptionLayout(snapshot, measureText) {
  const view = snapshot.annotations.captions,
    style = snapshot.captionReferenceStyle,
    referenceWidth = snapshot.layout.slotStyle.referenceWidth;
  if (!view.enabled)
    return {
      height: 0,
      gap: 0,
      padding: 0,
      fontSize: 0,
      lineHeight: 0,
      lines: [],
    };
  const fontFamily = view.settings.fontFamily,
    fontSize = view.settings.fontSize;
  await document.fonts.load(`400 ${fontSize}px ${fontFamily}`);
  if (view.name && view.nameBold)
    await document.fonts.load(`700 ${fontSize}px ${fontFamily}`);
  let padding = style.padding,
    lineHeight = fontSize * view.settings.lineHeight,
    available = Math.max(style.minimumTextWidth, referenceWidth - padding * 2),
    prefix = view.name || "",
    body = view.text || "",
    lines = [],
    firstLine = true,
    prefixWidth = 0;
  if (prefix) {
    prefix += " ";
    prefixWidth = measureText(prefix, fontFamily, fontSize, view.nameBold ? 700 : 400);
  }
  let paragraphs = String(body).split(/\n/);
  paragraphs.forEach((paragraph) => {
    let words = paragraph.split(/\s+/).filter(Boolean),
      line = "";
    let wi = 0;
    while (wi < words.length) {
      let word = words[wi],
        trial = line ? `${line} ${word}` : word,
        budget = Math.max(style.minimumTextWidth, available - (firstLine ? prefixWidth : 0));
      if (measureText(trial, fontFamily, fontSize, 400) > budget &&
          (line !== "" || (firstLine && prefix !== ""))) {
        lines.push({ text: line, prefix: firstLine ? prefix : "", prefixWidth: firstLine ? prefixWidth : 0 });
        line = "";
        firstLine = false;
      } else {
        line = trial;
        wi += 1;
      }
    }
    lines.push({ text: line, prefix: firstLine ? prefix : "", prefixWidth: firstLine ? prefixWidth : 0 });
    firstLine = false;
  });
  return {
    referenceWidth,
    height: padding * 2 + lines.length * lineHeight + style.borderHeight,
    gap: style.dashboardGap,
    padding,
    fontFamily,
    fontSize,
    prefixWeight: view.nameBold ? 700 : 400,
    bodyWeight: 400,
    lineHeight,
    lines,
  };
}

export function targetExportGeometry(layout, width, heightOverride = null) {
  let slotStyle = layout.slotStyle,
    referenceWidth = slotStyle.referenceWidth,
    scale = width / referenceWidth,
    height = heightOverride === null ? width / slotStyle.aspect : heightOverride,
    outerMargin = Math.min(slotStyle.outerMargin * scale, Math.min(width, height) * 0.49);
  return {
    referenceWidth,
    width,
    height,
    scale,
    aspect: width / height,
    outerMargin,
    gap: slotStyle.gap * scale,
    radius: slotStyle.radius * scale,
  };
}

export function targetSlotIdentifier(index, settings) {
  if (settings.format === "decimal") return String(index + 1);
  if (settings.format === "lower-roman") return romanIdentifier(index).toLowerCase();
  if (settings.format === "upper-roman") return romanIdentifier(index);
  return alphaIdentifier(index, settings.format === "upper-alpha");
}

export function createTargetExportView(input) {
  const palette = input.appearance.uiPalette,
    style = { background: palette.paperColor, border: palette.uiColor, color: palette.fontColor };
  return {
    ...input, slots: input.visibleSlots, labels: input.annotations.labels,
    bordersVisible: input.layout.slotStyle.showBorders,
    slotColors: Object.fromEntries(input.visibleSlots.map(slot => [slot.id, style])),
    labelText: Object.fromEntries(input.orderedSlotLabels.map(label => [label.slotId, label.displayLabel])),
    dashboardStyle: style, captionStyle: style,
  };
}

export async function exportDashboardTarget(suppliedSnapshot, statusSink) {
  // Like current capture, progress is not an export outcome authority.
  let statusOut = { set textContent(value) { try { statusSink?.(value); } catch {} } },
    snapshot = createTargetExportView(suppliedSnapshot), options = snapshot.export,
    captionView = snapshot.annotations.captions,
    width = options.width,
    requestedHeight = options.height,
    dpi = options.dpi,
    rasterScale = 1,
    format = options.format,
    bordersVisible = snapshot.bordersVisible,
    visibleSlots = snapshot.slots.filter((slot) => !slot.hidden),
    captionShown = captionView.enabled;
  let canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d"),
    baseReference = targetExportGeometry(snapshot.layout, width),
    outputScale = width / baseReference.referenceWidth,
    captionReference = await exportCaptionLayout(snapshot, (text, family, size, weight) => {
      ctx.font = `${weight} ${size}px ${family}`;
      return ctx.measureText(text).width;
    }),
    captionLayout = {
      ...captionReference,
      padding: captionReference.padding * outputScale,
      fontSize: captionReference.fontSize * outputScale,
      lineHeight: captionReference.lineHeight * outputScale,
      height: captionReference.height * outputScale,
      gap: captionReference.gap * outputScale,
    },
    automaticHeight = options.heightMode === "auto",
    height = automaticHeight
      ? Math.ceil(baseReference.height + captionLayout.height + captionLayout.gap)
      : requestedHeight,
    rasterWidth = Math.round(width),
    rasterHeight = Math.round(height),
    maxRasterDimension = snapshot.rasterLimits.rasterDimension,
    maxRasterArea = snapshot.rasterLimits.rasterArea;
  if (
    rasterWidth > maxRasterDimension ||
    rasterHeight > maxRasterDimension ||
    rasterWidth * rasterHeight > maxRasterArea
  ) {
    statusOut.textContent = `요청한 ${rasterWidth} × ${rasterHeight}px 래스터가 출력 한도(한 변 16384px, 총 64MP)를 넘습니다. 가로 또는 세로 크기를 낮추세요.`;
    return { outcome: "rejected", reason: "raster-limit" };
  }
  canvas.width = rasterWidth;
  canvas.height = rasterHeight;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = snapshot.dashboardStyle.background;
  ctx.fillRect(0, 0, width, height);
  let reference = targetExportGeometry(snapshot.layout, width),
    dashboardHeight = automaticHeight ? baseReference.height : height - captionLayout.height - captionLayout.gap,
    minimumDashboardHeight = Math.ceil(
      reference.outerMargin * 2 +
        reference.gap * Math.max(0, snapshot.layout.gridRows - 1) +
        snapshot.layout.gridRows,
    );
  if (dashboardHeight <= 0) {
    let minimumHeight = Math.ceil(
      captionLayout.height + captionLayout.gap + minimumDashboardHeight,
    );
    statusOut.textContent = `캡션 높이 ${Math.ceil(captionLayout.height)}px를 배치하기에는 설정된 세로 ${height}px가 너무 작습니다. 세로를 최소 ${minimumHeight}px로 늘리세요.`;
    return { outcome: "rejected", reason: "caption-height" };
  }
  let geometry = targetExportGeometry(snapshot.layout, width, dashboardHeight),
    dashboardLeft = 0,
    dashboardTop = 0,
    gap = geometry.gap,
    grid = gridSlotGeometry(snapshot.layout, geometry),
    colWidth = grid.colWidth,
    rowHeight = grid.rowHeight;
  if (colWidth <= 0 || rowHeight <= 0)
    return { outcome: "rejected", reason: "grid-geometry" };
  let slotRect = (slot) => ({
    left: dashboardLeft + geometry.outerMargin + (slot.col - 1) * (colWidth + gap),
    top: dashboardTop + geometry.outerMargin + (slot.row - 1) * (rowHeight + gap),
    width: colWidth * slot.colSpan + gap * (slot.colSpan - 1),
    height: rowHeight * slot.rowSpan + gap * (slot.rowSpan - 1),
  });
  let slotRadius = () => geometry.radius;
  statusOut.textContent = "출력 크기로 그래프를 다시 렌더링하는 중…";
  try {
    for (let slot of visibleSlots) {
      let rect = slotRect(slot),
        colors = snapshot.slotColors[slot.id],
        figure = slot.figure,
        imageModel = slot.imageView;
      ctx.save();
      ctx.beginPath();
        ctx.roundRect(rect.left, rect.top, rect.width, rect.height, slotRadius());
      ctx.clip();
      ctx.fillStyle = colors?.background || "#fff";
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      if (slot.content.contentType !== "image" && figure) {
        let uri = await exportChartImage(
            figure,
            rect.width,
            rect.height,
            geometry.scale,
            rasterScale,
          ),
          image = await exportImageLoad(uri);
        ctx.drawImage(image, rect.left, rect.top, rect.width, rect.height);
      } else if (imageModel) {
        let image = await exportImageLoad(imageModel.src);
        exportDrawImage(ctx, image, rect, slot, 1, 1);
      }
      ctx.restore();
      if (bordersVisible) {
        ctx.strokeStyle = colors?.border || "#B0CFCE";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(
          rect.left + 0.5,
          rect.top + 0.5,
          Math.max(0, rect.width - 1),
          Math.max(0, rect.height - 1),
          slotRadius(),
        );
        ctx.stroke();
      }
    }
    if (snapshot.labels.enabled) {
      let ordered = snapshot.orderedSlotLabels.map(label => visibleSlots.find(slot => slot.id === label.slotId));
      for (let slot of ordered) {
        let rect = slotRect(slot),
          text = snapshot.labelText[slot.id],
          x = rect.left + snapshot.labels.settings.x * geometry.scale,
          y = rect.top + snapshot.labels.settings.y * geometry.scale;
        let scaledLabelFontSize =
          snapshot.labels.settings.fontSize * geometry.scale;
        ctx.font = `800 ${scaledLabelFontSize}px ${snapshot.labels.settings.fontFamily}`;
        let labelHeight = Math.ceil(scaledLabelFontSize * 1.2) + 4 * geometry.scale;
        ctx.fillStyle = snapshot.dashboardStyle.color;
        ctx.textBaseline = "middle";
        ctx.fillText(text, x + 6 * geometry.scale, y + labelHeight / 2);
      }
    }
    if (captionShown) {
      let top = dashboardTop + geometry.height + captionLayout.gap;
      ctx.fillStyle = snapshot.captionStyle.background;
      ctx.fillRect(0, top, width, captionLayout.height);
      if (bordersVisible) {
        ctx.strokeStyle = snapshot.captionStyle.border;
        ctx.strokeRect(
          0.5,
          top + 0.5,
          Math.max(0, width - 1),
          captionLayout.height - 1,
        );
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top, width, captionLayout.height);
      ctx.clip();
      let y = top + captionLayout.padding + captionLayout.fontSize;
      ctx.fillStyle = snapshot.captionStyle.color;
      for (let line of captionLayout.lines) {
        let x = captionLayout.padding;
        if (line.prefix) {
          ctx.font = `${captionView.nameBold ? "700" : "400"} ${captionLayout.fontSize}px ${captionView.settings.fontFamily}`;
          ctx.fillText(line.prefix, x, y);
          x += line.prefixWidth * outputScale;
        }
        ctx.font = `400 ${captionLayout.fontSize}px ${captionView.settings.fontFamily}`;
        ctx.fillText(line.text, x, y);
        y += captionLayout.lineHeight;
      }
      ctx.restore();
    }
    let mime = format === "jpeg" ? "image/jpeg" : "image/png",
      blob = await exportCanvasBlob(canvas, mime, dpi),
      stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await downloadExportPayload({ blob,
      name: `전체-그래프-${width}x${height}-r${rasterWidth}x${rasterHeight}-${dpi}dpi-${stamp}.${format === "jpeg" ? "jpg" : "png"}`,
    });
    statusOut.textContent = `레이아웃 ${width} × ${height}px · 래스터 ${rasterWidth} × ${rasterHeight}px · ${dpi} DPI로 저장했습니다.`;
    try { debugLog("dashboard:export-target", {
      format,
      width,
      height,
      rasterWidth,
      rasterHeight,
      dpi,
      rasterScale,
      slots: visibleSlots.length,
      gridRows: snapshot.layout.gridRows,
      gridCols: snapshot.layout.gridCols,
      gap,
      referenceWidth: reference.referenceWidth,
      renderScale: geometry.scale,
      dashboardWidth: geometry.width,
      dashboardHeight: geometry.height,
      dashboardAspect: geometry.aspect,
      captionHeight: captionLayout.height,
      automaticHeight,
      revision: snapshot.revision,
    }); } catch {}
    return { outcome: "saved", width: rasterWidth, height: rasterHeight, automaticHeight };
  } catch (error) {
    // Progress/debug reporting is not authority over an already failed export.
    try { statusOut.textContent = "저장 실패: " + (error?.message ?? String(error)); } catch {}
    try { debugLog("dashboard:export-error", { message: error?.message ?? String(error) }); } catch {}
    throw error;
  }
}

export async function downloadExportPayload(payload) {
  const blob = payload.blob || new Blob([
      payload.entries ? ffpxZipStore(payload.entries) : Uint8Array.from(payload.bytes),
    ], { type: payload.mime }),
    url = URL.createObjectURL(blob);
  let failed = false;
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = payload.name;
    link.click();
    // Let the browser consume the handoff before releasing this job's URL.
    await new Promise((resolve) => setTimeout(resolve, 0));
  } catch (error) {
    failed = true;
    throw error;
  } finally {
    try { URL.revokeObjectURL(url); } catch (cleanupError) {
      if (!failed) throw cleanupError;
    }
  }
}

export function applyDashboardZoomProjection(layout, interfaceState, resize = true) {
  const dashboard = $("dashboard"), style = layout.slotStyle,
    width = interfaceState.dashboardZoomLocked ? interfaceState.dashboardZoomLockedWidth
      : style.referenceWidth * interfaceState.dashboardZoomIntent / 100;
  dashboard.style.minWidth = dashboard.style.width = `${width}px`;
  applyReferenceGeometryProjection(dashboard, style, width);
  syncDashboardCaptionWidth();
  if (resize) schedulePlotResize();
}

export function readDashboardRenderedWidth() {
  const width = $("dashboard")?.getBoundingClientRect().width;
  return Number.isFinite(width) && width > 0 ? width : null;
}

export function applyUiPaletteProjection(palette) {
  document.documentElement.style.setProperty("--ui-color", palette.uiColor);
  document.documentElement.style.setProperty(
    "--paper",
    palette.uiBackgroundColor,
  );
  document.documentElement.style.setProperty("--ui-subtle", palette.uiSubtleColor);
  document.documentElement.style.setProperty("--ink", palette.fontColor);
  document.documentElement.style.setProperty("--graph-bg", palette.paperColor);
  return Object.freeze({
    "--ui-color": palette.uiColor, "--paper": palette.uiBackgroundColor,
    "--ui-subtle": palette.uiSubtleColor, "--ink": palette.fontColor,
    "--graph-bg": palette.paperColor,
  });
}

export const rendererRuntime = {
  graphInstances: new Map(),
  imageSurfaces: new Map(),
  dashboardObserver: null,
  graphAreaObserver: null,
  resizePending: false,
  resizeRequests: [],
  resizeObserverInstalled: false,
  programmaticPlotlyRelayout: new WeakMap(),
  dashboardRenderGeneration: 0,
  slotDragSourceId: null,
  slotDragSuppressClick: false
};
