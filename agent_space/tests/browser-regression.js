/* Runs after the application scripts in a headless file:// browser. */
const FAST_FIGURE_REGRESSION_TARGET = Object.freeze({
  sourceScript: "r19",
  plusCal: "r5",
  verificationModel: "r16",
  sourceCode: "r23",
  appBuild: "1.1.43-wip",
});
(async () => {
  const api = window.FastFigureApi;
  const results = [];
  const check = (condition, message) => {
    if (!condition) throw Error(message);
  };
  const run = async (number, name, action) => {
    try {
      const outcome = await action();
      results.push({ number, name, result: outcome?.blocked ? "blocked" : "pass", detail: outcome?.blocked });
  
  } catch (error) {
      results.push({ number, name, result: "fail", detail: String(error?.stack || error) });
    }
  };
  const ffpxFile = () => new File([ffpxZipStore(ffpxBuildProject().assets)], "roundtrip.ffpx");
  const ffsxFile = (slot) => new File(
    [ffpxZipStore(ffsxBuildSlot(slot, slot.chart ? getChart(slot.chart) : null).assets)],
    "roundtrip.ffsx",
  );
  const select = (slot) => {
    if (api.slots.readSelected()?.id !== slot.id) api.slots.select(slot.id);
  };
  const csv = (name, body) => new File([body], name, { type: "text/csv" });
  const choose = (choice) => async (file, directory) =>
    api.assets.resolveImportPlan(api.assets.collisionModel(file, directory), choice);
  const tick = (delay = 0) => new Promise((resolve) => setTimeout(resolve, delay));
  const waitFor = async (reader, message, timeout = 1500) => {
    const started = performance.now();
    while (performance.now() - started < timeout) {
      const value = reader();
      if (value) return value;
      await tick(10);
    }
    throw Error(message);
  };
  const slotElement = (slotId) =>
    document.querySelector(`#dashboard .slot[data-slot="${slotId}"]`);
  const click = (element) => {
    check(!!element, "interaction target absent");
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
    );
  };
  const slotPayloadSignature = (slot) =>
    JSON.stringify({
      chart: slot?.chart ?? null,
      imageId: slot?.imageId ?? null,
      contentType: slot?.contentType ?? "graph",
      caption: slot?.caption ?? "",
    });
  const save = () => ({
    slots: activeProject.slots.map((s) => ({ id: s.id, chart: s.chart, imageId: s.imageId,
      contentType: s.contentType, hidden: s.hidden, rowSpan: s.rowSpan, colSpan: s.colSpan })),
    csv: activeProject.csvFiles.map((c) => c.name),
    images: activeProject.images.map((i) => i.name),
    graphs: activeProject.charts.length,
    labels: api.labels.readState(),
    captions: api.captions.readGlobal(),
    exportSettings: api.print.readSettings(),
    palette: api.appearance.readPalette(),
  });
  try {
    await new Promise((resolve) => setTimeout(resolve, 100));
    check(api && appFSM.state.lifecycle === "ready", "application not ready");
    await run(15, "startup projects initial slots before interaction", async () => {
      check(activeProject.slots.length === 4, "default project does not contain four slots");
      const rendered = document.querySelectorAll("#dashboard .slot:not(.hidden)");
      check(rendered.length === 4, "default 2x2 slots were not rendered before interaction");
    });
    await run(16, "layout preview cells follow grid tracks", async () => {
      appFSM.send("TOGGLE_OVERLAY", { overlay: "layout", source: "regression" });
      await new Promise((resolve) => setTimeout(resolve, 0));
      const grid = document.querySelector(
        "[data-fastfigure-overlay='layout'] [role='grid']",
      );
      const cell = grid?.querySelector(":scope > button");
      check(!!grid && !!cell, "layout preview grid or cell absent");
      check(!cell.classList.contains("mantine-Button-root"), "layout preview cell uses sized Button");
      const computed = getComputedStyle(grid);
      const rowGap = parseFloat(computed.rowGap) || 0;
      const paddingTop = parseFloat(computed.paddingTop) || 0;
      const paddingBottom = parseFloat(computed.paddingBottom) || 0;
      const expectedRowHeight =
        (grid.clientHeight - paddingTop - paddingBottom - rowGap * (activeProject.gridRows - 1)) /
        activeProject.gridRows;
      check(
        Math.abs(cell.getBoundingClientRect().height - expectedRowHeight) < 1.5,
        "layout preview cell does not fill its grid track",
      );
      appFSM.send("CLOSE_OVERLAY", { reason: "regression-layout-preview" });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await run(17, "label preview typography matches dashboard label", async () => {
      const wasEnabled = api.labels.readState().enabled;
      api.labels.setEnabled(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
      const dashboardLabel = document.querySelector("#dashboard .slot-label");
      check(!!dashboardLabel, "dashboard label absent");
      appFSM.send("TOGGLE_OVERLAY", { overlay: "label", source: "regression" });
      await new Promise((resolve) => setTimeout(resolve, 0));
      const previewLabel = document.querySelector(
        "[data-fastfigure-overlay='label'] [aria-label='레이블 위치 드래그']",
      );
      check(!!previewLabel, "label preview absent");
      const metric = (element) => {
        const computed = getComputedStyle(element);
        return parseFloat(computed.lineHeight) / parseFloat(computed.fontSize);
      };
      check(
        Math.abs(metric(previewLabel) - metric(dashboardLabel)) < 0.01,
        "label preview line-height does not match dashboard label",
      );
      appFSM.send("CLOSE_OVERLAY", { reason: "regression-label-preview" });
      if (!wasEnabled) api.labels.setEnabled(false);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await run(18, "annotation font selectors preserve predefined and custom values", async () => {
      const selectInput = (kind) => {
        const root = document.querySelector(`[data-fastfigure-font-select='${kind}']`);
        return root?.tagName === "INPUT" ? root : root?.querySelector?.("input");
      };
      const labelOriginal = api.labels.readState().settings.fontFamily;
      api.labels.setSettings({ fontFamily: "Arial, sans-serif" });
      appFSM.send("TOGGLE_OVERLAY", { overlay: "label", source: "regression" });
      await new Promise((resolve) => setTimeout(resolve, 0));
      let input = selectInput("label");
      check(!!input && input.classList.contains("mantine-Select-input"), "label font is not a Select");
      check(input.value === "Arial", "label predefined font option missing");
      api.labels.setSettings({ fontFamily: "Legacy Label Font, sans-serif" });
      await new Promise((resolve) => setTimeout(resolve, 0));
      input = selectInput("label");
      check(input?.value === "기존: Legacy Label Font, sans-serif", "label custom font not preserved");
      appFSM.send("CLOSE_OVERLAY", { reason: "regression-label-font" });
      api.labels.setSettings({ fontFamily: labelOriginal });

      const captionOriginal = api.captions.readGlobal().settings.fontFamily;
      api.captions.setSettings({ fontFamily: "Legacy Caption Font, serif" });
      appFSM.send("TOGGLE_OVERLAY", { overlay: "caption", source: "regression" });
      await new Promise((resolve) => setTimeout(resolve, 0));
      input = selectInput("caption");
      check(!!input && input.classList.contains("mantine-Select-input"), "caption font is not a Select");
      check(input.value === "기존: Legacy Caption Font, serif", "caption custom font not preserved");
      appFSM.send("CLOSE_OVERLAY", { reason: "regression-caption-font" });
      api.captions.setSettings({ fontFamily: captionOriginal });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await run(1, "FFPX save and reload", async () => {
      api.project.setName("Roundtrip regression");
      const file = ffpxFile();
      api.project.setName("changed before reload");
      await api.project.importFile(file);
      check(api.project.readName() === "Roundtrip regression", "project name lost");
    });
    await run(2, "mixed assets, graph, merge, labels, captions", async () => {
      api.layout.setGrid(2, 2);
      const slots = activeProject.slots;
      select(slots[0]);
      await api.assets.importToSlot(csv("regression.csv", "X,Y\n1,2\n3,4\n"), slots[0].id, choose("rename"));
      select(slots[1]);
      api.slots.setContentType(api.slots.readSelected()?.id, "image");
      api.images.insertEmpty();
      api.images.setSettings({ fit: "manual", scale: 135, x: 42, y: 61 });
      api.layout.mergeSlots([slots[2].id, slots[3].id]);
      api.labels.setEnabled(true);
      api.captions.setEnabled(true);
      api.captions.setGlobalText("Regression caption");
      const before = save();
      await api.project.importFile(ffpxFile());
      const after = save();
      check(before.graphs === after.graphs && before.graphs > 0, "graph lost");
      check(after.images.length > 0 && after.slots.some((s) => s.imageId), "image lost");
      check(after.slots.some((s) => s.rowSpan > 1 || s.colSpan > 1), "merge lost");
      check(after.labels.enabled && after.captions.enabled, "annotations lost");
      check(after.exportSettings.width === before.exportSettings.width, "export settings lost");
      const imageSlot = activeProject.slots.find((s) => s.imageId);
      check(imageSlot?.content?.imageSettings?.scale === 135, "slot-local image settings lost");
    });
    await run(3, "empty image and graph slots", async () => {
      api.layout.setGrid(2, 3);
      const slots = activeProject.slots;
      select(slots[4]); api.slots.setContentType(api.slots.readSelected()?.id, "image");
      select(slots[5]); api.slots.setContentType(api.slots.readSelected()?.id, "graph");
      await api.project.importFile(ffpxFile());
      check(activeProject.slots[4].contentType === "image" && !activeProject.slots[4].imageId, "empty image lost");
      check(activeProject.slots[5].contentType === "graph" && !activeProject.slots[5].chart, "empty graph lost");
    });
    await run(4, "FFSX blank graph", async () => {
      const slot = activeProject.slots[5];
      select(slot);
      await api.graphs.importFile(new File(
        [JSON.stringify({ data: [], layout: { title: "Blank graph" } })],
        "blank.json",
      ));
      const originalCsvAssets = JSON.stringify(activeProject.csvFiles), originalNextCsv = activeProject._state.nextId.csv;
      api.graphs.setEditable(true);
      let currentSlot = slotAt(slot.id);
      const chart = getChart(currentSlot.chart);
      check(chart && chart.editor.objects.length === 0 && !Object.hasOwn(chart.editor, "conversionRows"),
        "blank chart is not zero-object or kept conversion-only rows");
      check(JSON.stringify(activeProject.csvFiles) === originalCsvAssets && activeProject._state.nextId.csv === originalNextCsv,
        "blank conversion allocated unreferenced synthetic CSV or consumed next-id");
      const file = ffsxFile(currentSlot);
      const payload = await ffsxReadSlot(file);
      check(payload.chart && payload.csvFiles.length === 0, "blank FFSX contains synthetic CSV");
      await api.graphs.importFile(file);
      currentSlot = slotAt(slot.id);
      check(!!currentSlot.chart && getChart(currentSlot.chart).editor.objects.length === 0, "blank FFSX import failed");
    });
    await run(19, "graph font selector preserves auto and custom values", async () => {
      api.graphs.setEditable(true);
      const slotId = api.slots.readSelected()?.id;
      const original = api.graphs.readLayout().settings.graphFontFamily;
      api.graphs.updateLayout({ globalSettings: { graphFontFamily: "" } });
      await new Promise((resolve) => setTimeout(resolve, 0));
      const selectInput = () => {
        const root = document.querySelector("[data-fastfigure-font-select='graph']");
        return root?.tagName === "INPUT" ? root : root?.querySelector?.("input");
      };
      let input = selectInput();
      check(!!input && input.classList.contains("mantine-Select-input"), "graph font is not a Select");
      check(input.value === "자동", "graph automatic font option missing");
      api.graphs.updateLayout({ globalSettings: { graphFontFamily: "Legacy Graph Font, sans-serif" } });
      check(
        api.graphs.readLayout().settings.graphFontFamily === "Legacy Graph Font, sans-serif",
        "graph custom font was not stored",
      );
      api.slots.select(null);
      await new Promise((resolve) => setTimeout(resolve, 0));
      api.slots.select(slotId);
      await new Promise((resolve) => setTimeout(resolve, 0));
      input = selectInput();
      check(input?.value === "기존: Legacy Graph Font, sans-serif", "graph custom font not preserved");
      api.graphs.updateLayout({ globalSettings: { graphFontFamily: original } });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await run(5, "multi-CSV FFSX", async () => {
      const slotId = activeProject.slots[0].id;
      select(slotAt(slotId));
      const extra = createProjectCsv([["X", "Y"], ["9", "8"]], "second.csv");
      api.graphs.addObject(extra.id);
      const currentBeforeExport = slotAt(slotId);
      const file = ffsxFile(currentBeforeExport);
      check((await ffsxReadSlot(file)).csvFiles.length >= 2, "second CSV missing");
      await api.graphs.importFile(file);
      const current = slotAt(slotId);
      check(current && chartCsvIds(getChart(current.chart)).length >= 2, "multi-CSV references lost");
    });
    await run(6, "imported Plotly edit and FFPX", async () => {
      const slotId = activeProject.slots[5].id;
      select(slotAt(slotId));
      const figure = {
        data: [{ x: [1, 2], y: [3, 4], type: "scatter" }],
        layout: { title: "Plotly import" },
      };
      await api.graphs.importFile(new File([JSON.stringify(figure)], "plotly.json"));
      let current = slotAt(slotId),
        imported = getChart(current.chart);
      check(imported.editor.editable === false, "Plotly import did not remain non-editable");
      check(Array.isArray(imported.editor.conversionRows) && imported.editor.conversionRows.length > 0,
        "Plotly conversion rows were not preserved");
      api.graphs.setEditable(true);
      current = slotAt(slotId);
      const editable = getChart(current.chart);
      check(editable.editor.editable !== false, "Plotly edit mode unavailable");
      check(chartCsvIds(editable).length === 1, "Plotly editable conversion did not allocate one CSV");
      await api.project.importFile(ffpxFile());
      current = slotAt(slotId);
      check(getChart(current.chart)?.editor.editable !== false, "edited Plotly lost");
    });
    await run(7, "Plotly export and import", async () => {
      const source = activeProject.slots.find((s) => s.chart),
        slotId = source.id,
        oldChartId = source.chart;
      select(source);
      const figure = chartFigure(getChart(oldChartId));
      check(Array.isArray(figure.data), "Plotly export invalid");
      await api.graphs.importFile(new File([JSON.stringify(figure)], "export.json"));
      const current = slotAt(slotId),
        imported = current?.chart ? getChart(current.chart) : null;
      check(imported && current.chart !== oldChartId, "Plotly import did not replace the chart");
      check(imported.editor.editable === false, "Plotly import unexpectedly became editable");
      check(Array.isArray(imported.graph.imported?.data), "Plotly imported semantics were not preserved");
    });
    await run(8, "persistent export settings", async () => {
      api.print.setSettings({
        width: 1777,
        heightMode: "explicit",
        height: 1111,
        dpi: 450,
        format: "jpeg",
      });
      await api.project.importFile(ffpxFile());
      const settings = api.print.readSettings();
      check(
        settings.width === 1777 &&
        settings.heightMode === "explicit" &&
        settings.height === 1111 &&
        settings.dpi === 450 &&
        settings.format === "jpeg",
        "export settings roundtrip failed",
      );
    });
    await run(9, "palette save and load", async () => {
      const original = api.appearance.readPalette();
      const key = Object.keys(original)[0];
      check(!!key, "empty palette");
      const changed = { ...original, [key]: "#123456" };
      api.appearance.setPalette(changed);
      const expected = api.appearance.readPalette()[key];
      await api.project.importFile(ffpxFile());
      check(api.appearance.readPalette()[key] === expected, "palette lost");
    });
    await run(10, "collision replace and rename", async () => {
      api.slots.select(null);
      const file = csv("collision.csv", "X,Y\n1,2\n");
      await api.assets.importFiles([file], choose("rename"));
      const before = activeProject.csvFiles.find((c) => c.name === file.name);
      check(!!before, "initial CSV absent");
      await api.assets.importFiles([csv("collision.csv", "X,Y\n5,6\n")], choose("replace"));
      check(activeProject.csvFiles.find((c) => c.id === before.id)?.rows[1][1] === "6", "replace did not preserve ID or data");
      await api.assets.importFiles([file], choose("rename"));
      check(activeProject.csvFiles.filter((c) => c.name.startsWith("collision")).length >= 2, "rename failed");
    });
    await run(11, "asset delete cascade", async () => {
      const slot = activeProject.slots[5]; select(slot);
      const item = createProjectCsv([["X", "Y"], ["1", "2"]], "delete.csv");
      api.graphs.addObject(item.id);
      check(chartCsvIds(getChart(slot.chart)).includes(item.id), "CSV reference absent");
      api.assets.delete({ kind: "csv", id: item.id, name: item.name });
      check(!activeProject.csvFiles.some((c) => c.id === item.id), "CSV not deleted");
      check(activeProject.charts.every((c) => !chartCsvIds(c).includes(item.id)), "dangling reference");
    });
    await run(12, "move to trash cascade", async () => {
      const created = createProjectCsv([["X", "Y"], ["1", "2"]], "trash.csv"),
        csvId = created.id,
        slotId = activeProject.slots[5].id;
      select(slotAt(slotId));
      api.graphs.addObject(csvId);
      let currentSlot = slotAt(slotId),
        currentCsv = getProjectCsv(csvId);
      check(chartCsvIds(getChart(currentSlot.chart)).includes(csvId), "CSV reference absent before trash move");
      const plan = api.assets.planMove(projectAssetPath(currentCsv), "/assets/trash");
      check(plan?.enteringTrash && plan.referenceCount > 0, "trash plan misses references");
      api.assets.move(plan);
      currentCsv = getProjectCsv(csvId);
      check(currentCsv && api.assets.isTrashed(projectAssetPath(currentCsv)), "move did not enter trash");
      check(activeProject.charts.every((c) => !chartCsvIds(c).includes(csvId)), "trashed CSV still referenced");
    });
    await run(13, "layout and label preview geometry", async () => {
      const layout = api.layout.readState(600).previewGeometry;
      const labels = api.labels.readState().reference;
      check(Number.isFinite(layout.width) && layout.width > 0, "layout width invalid");
      check(Number.isFinite(labels.width) && labels.width > 0, "label width invalid");
      const slot = document.querySelector(".slot:not(.hidden)");
      check(slot && slot.getBoundingClientRect().width > 0, "rendered slot has no width");
    });
    await run(14, "Mantine primary button follows UI color", async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const button = document.querySelector(".mantine-Button-root[data-variant='filled']");
      check(!!button, "filled Mantine button absent");
      const probe = document.createElement("span");
      probe.style.color = api.appearance.readPalette().uiColor;
      document.body.appendChild(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();
      check(
        getComputedStyle(button).backgroundColor === expected,
        "filled Mantine button does not use appearance uiColor",
      );
    });
    await run(20, "slot selection is state-first and background deselects", async () => {
      const contentSlot = activeProject.slots.find(
        (slot) => !slot.hidden && (slot.chart || slot.imageId),
      );
      check(!!contentSlot, "content slot absent");
      api.slots.select(null);
      await tick();

      let element = slotElement(contentSlot.id);
      const body = contentSlot.chart
        ? element?.querySelector(".plot-item")
        : element?.querySelector(".slot-image-frame");
      click(body);
      await tick();
      check(
        api.slots.readSelected()?.id === contentSlot.id,
        "unselected content slot surface did not select its slot",
      );

      click(body);
      await tick();
      check(
        api.slots.readSelected()?.id === contentSlot.id,
        "selected content interaction changed slot selection",
      );

      click(document.getElementById("dashboard"));
      await tick();
      check(api.slots.readSelected() === null, "dashboard background did not deselect");

      click(slotElement(contentSlot.id)?.querySelector(".slot-tab"));
      await tick();
      check(
        api.slots.readSelected()?.id === contentSlot.id,
        "bookmark did not select content slot",
      );
      click(slotElement(contentSlot.id)?.querySelector(".slot-tab"));
      await tick();
      check(api.slots.readSelected() === null, "second bookmark click did not deselect");
    });
    await run(21, "empty slot surface remains selectable", async () => {
      let emptySlot = activeProject.slots.find(
        (slot) => !slot.hidden && !slot.chart && !slot.imageId,
      );
      if (!emptySlot) {
        emptySlot = activeProject.slots.find((slot) => !slot.hidden);
        check(!!emptySlot, "visible slot absent");
        api.slots.reset(emptySlot.id);
      }
      api.slots.select(null);
      await tick();
      click(slotElement(emptySlot.id));
      await tick();
      check(
        api.slots.readSelected()?.id === emptySlot.id,
        "empty slot surface did not select slot",
      );
      click(slotElement(emptySlot.id));
      await tick();
      check(api.slots.readSelected() === null, "selected empty slot surface did not toggle off");
      await tick();
    });
    await run(22, "bookmark drag consumes post-drag click", async () => {
      if (typeof DataTransfer !== "function" || typeof DragEvent !== "function")
        return { blocked: "DragEvent/DataTransfer unavailable in this browser" };

      let contentSlots = activeProject.slots.filter(
        (slot) => !slot.hidden && (slot.chart || slot.imageId),
      );
      let source = contentSlots[0];
      let target = contentSlots.find(
        (slot) =>
          slot.id !== source?.id &&
          slotPayloadSignature(slot) !== slotPayloadSignature(source),
      );
      if (!source || !target) {
        source = source || activeProject.slots.find((slot) => !slot.hidden);
        target = activeProject.slots.find(
          (slot) => !slot.hidden && slot.id !== source?.id,
        );
        check(!!source && !!target, "two visible slots are required");
        api.slots.reset(target.id);
        select(target);
        api.slots.setContentType(api.slots.readSelected()?.id, "graph");
        const helperCsv = createProjectCsv(
          [["DX", "DY"], ["1", "2"]],
          "drag-target.csv",
        );
        api.graphs.addObject(helperCsv.id);
        source = slotAt(source.id);
        target = slotAt(target.id);
      }

      const sourceId = source.id;
      const targetId = target.id;
      const sourceBefore = slotPayloadSignature(source);
      const targetBefore = slotPayloadSignature(target);
      api.slots.select(null);
      await tick();

      const transfer = new DataTransfer();
      const sourceDomBefore = slotElement(sourceId);
      const targetDomBefore = slotElement(targetId);
      const sourceTab = sourceDomBefore?.querySelector(".slot-tab");
      check(!!sourceTab, "source bookmark absent");
      sourceTab.dispatchEvent(
        new DragEvent("dragstart", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );
      slotElement(targetId)?.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );

      check(
        slotPayloadSignature(slotAt(sourceId)) === targetBefore &&
          slotPayloadSignature(slotAt(targetId)) === sourceBefore,
        "bookmark drag did not swap slot-local payloads",
      );
      check(
        slotElement(sourceId) !== sourceDomBefore &&
          slotElement(targetId) !== targetDomBefore,
        "bookmark drag changed project state without immediately rerendering dashboard",
      );
      check(api.slots.readSelected() === null, "drag unexpectedly selected a slot");

      click(slotElement(sourceId)?.querySelector(".slot-tab"));
      await tick();
      check(
        api.slots.readSelected() === null,
        "post-drag synthetic-equivalent click was not consumed",
      );

      click(slotElement(sourceId)?.querySelector(".slot-tab"));
      await tick();
      check(
        api.slots.readSelected()?.id === sourceId,
        "bookmark did not recover normal selection after guarded click",
      );
      api.slots.select(null);
      await tick();
    });
    await run(23, "image asset selection does not link until explicit add", async () => {
      let target = activeProject.slots.find(
        (slot) => !slot.hidden && !slot.chart && !slot.imageId,
      );
      target = target || activeProject.slots.find((slot) => !slot.hidden);
      check(!!target, "image test slot absent");
      api.slots.reset(target.id);
      select(slotAt(target.id));
      api.slots.setContentType(api.slots.readSelected()?.id, "image");
      api.images.insertEmpty();
      const beforeImageId = slotAt(target.id).imageId;
      check(Number.isInteger(beforeImageId), "baseline image was not inserted");

      const image = createProjectImage(
        new TextEncoder().encode(
          '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"></svg>',
        ),
        "selection-only.svg",
        "image/svg+xml",
      );
      const path = projectAssetPath(image);
      api.assets.selectImage(path);
      await tick();
      check(appFSM.state.assetSelection === "image", "image asset was not selected");
      check(appFSM.state.assetPath === path, "selected image path mismatch");
      check(
        slotAt(target.id).imageId === beforeImageId,
        "image selection implicitly linked asset to slot",
      );

      api.assets.connectToSlot(path, "image", target.id);
      await tick();
      check(
        slotAt(target.id).imageId === image.id,
        "explicit image add did not link selected asset",
      );
    });
    await run(24, "graph readData separates current CSV from objectColumns", async () => {
      let target = activeProject.slots.find(
        (slot) => !slot.hidden && slot.contentType !== "image",
      );
      check(!!target, "graph projection slot absent");
      api.slots.reset(target.id);
      select(slotAt(target.id));
      api.slots.setContentType(api.slots.readSelected()?.id, "graph");

      const currentCsv = createProjectCsv(
        [["AX", "AY"], ["1", "2"]],
        "projection-current.csv",
      );
      const objectCsv = createProjectCsv(
        [["BX", "BY", "BZ"], ["3", "4", "5"]],
        "projection-object.csv",
      );
      api.assets.selectCsv(projectAssetPath(currentCsv));
      api.graphs.addObject(currentCsv.id);
      let editor = api.graphs.readData();
      check(editor.selectedIndex !== null, "new graph object was not selected");
      const index = editor.selectedIndex;

      api.graphs.setObjectValues(index, { csvId: objectCsv.id });
      editor = api.graphs.readData();
      check(editor.csv?.id === currentCsv.id, "current CSV selection was replaced by object csvId");
      check(
        editor.objects[index]?.csvId === objectCsv.id,
        "selected graph object did not keep its own csvId",
      );
      check(editor.csv?.columns?.length === 2, "current CSV columns are incorrect");
      check(editor.objectColumns.length === 3, "objectColumns did not use object CSV");
      check(
        editor.objectColumns.some((column) => column.label.includes("BZ")),
        "objectColumns are not projected from the selected object's CSV",
      );
    });
    await run(25, "non-editable imported graph rejects object mutation", async () => {
      const slot = api.slots.readSelected();
      check(!!slot, "graph mutation test requires selected slot");
      const figure = {
        data: [{ x: [1, 2], y: [4, 8], type: "scatter", name: "guard" }],
        layout: { title: "non-editable guard" },
      };
      await api.graphs.importFile(
        new File([JSON.stringify(figure)], "non-editable-guard.json"),
      );
      await tick();

      const currentSlot = slotAt(slot.id);
      const chart = getChart(currentSlot.chart);
      check(chart?.editor?.editable === false, "imported graph became editable");
      const guardCsv = createProjectCsv(
        [["GX", "GY"], ["7", "9"]],
        "non-editable-guard.csv",
      );
      const before = JSON.stringify(chart.editor.objects);

      let addRejected = false;
      try { api.graphs.addObject(guardCsv.id); } catch { addRejected = true; }
      check(addRejected, "non-editable add did not reject through the command");
      check(
        JSON.stringify(getChart(slotAt(slot.id).chart).editor.objects) === before,
        "addObject mutated non-editable chart",
      );
      if (chart.editor.objects.length) {
        let rejected = false;
        try { api.graphs.setObjectValues(0, { legendName: "should-not-change" }); } catch { rejected = true; }
        check(rejected, "non-editable edit did not reject through the command");
        rejected = false;
        try { api.graphs.deleteObject(0); } catch { rejected = true; }
        check(rejected, "non-editable delete did not reject through the command");
        rejected = false;
        try { api.graphs.moveObject(0, 0); } catch { rejected = true; }
        check(rejected, "non-editable equal move bypassed command preconditions");
        check(
          JSON.stringify(getChart(slotAt(slot.id).chart).editor.objects) === before,
          "object edit/delete/move mutated non-editable chart",
        );
      }

      await tick();
      const addButton = Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "오브젝트 추가",
      );
      check(!!addButton && addButton.disabled, "non-editable add button is enabled");
      const deleteButton = document.querySelector(
        "[aria-label$='그래프 오브젝트 삭제']",
      );
      if (deleteButton)
        check(deleteButton.disabled, "non-editable object delete control is enabled");
    });
    await run(26, "collision modal dismissal cancels import", async () => {
      if (typeof DataTransfer !== "function" || typeof DragEvent !== "function")
        return { blocked: "DragEvent/DataTransfer unavailable in this browser" };

      const slot = api.slots.readSelected();
      check(!!slot, "collision cancel test requires selected slot");
      const existing = createProjectCsv(
        [["X", "Y"], ["1", "2"]],
        "collision-dismiss.csv",
      );
      const existingPath = projectAssetPath(existing);
      const beforeRows = JSON.stringify(existing.rows);
      const beforeCount = activeProject.csvFiles.filter(
        (item) => item.name.startsWith("collision-dismiss"),
      ).length;
      const beforeChart = slotAt(slot.id).chart;

      const transfer = new DataTransfer();
      transfer.items.add(
        csv("collision-dismiss.csv", "X,Y\n99,100\n"),
      );
      const dropTarget = slotElement(slot.id);
      check(!!dropTarget, "collision drop target absent");
      dropTarget.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );

      await waitFor(
        () =>
          Array.from(document.querySelectorAll("body *")).find(
            (element) =>
              element.children.length === 0 &&
              element.textContent?.trim() === "같은 이름의 파일",
          ),
        "collision modal did not open",
        5000,
      );
      const closeButton =
        document.querySelector(".mantine-Modal-close") ||
        document.querySelector("[aria-label='Close modal']") ||
        document.querySelector("[aria-label='닫기']");
      const overlay = document.querySelector(".mantine-Modal-overlay");
      if (closeButton) {
        click(closeButton);
      } else if (overlay) {
        click(overlay);
      } else {
        const escape = () =>
          new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            bubbles: true,
            cancelable: true,
          });
        (document.activeElement || document.body).dispatchEvent(escape());
        document.dispatchEvent(escape());
        window.dispatchEvent(escape());
      }
      await waitFor(
        () => appFSM.state.lifecycle === "ready",
        "application did not return to ready after collision cancel",
        5000,
      );
      await tick();

      const after = projectVfs.resolve(existingPath)?.asset;
      check(!!after, "existing collision asset disappeared");
      check(JSON.stringify(after.rows) === beforeRows, "dismissal replaced existing CSV");
      check(
        activeProject.csvFiles.filter((item) => item.name.startsWith("collision-dismiss")).length === beforeCount,
        "dismissal created a renamed CSV",
      );
      check(slotAt(slot.id).chart === beforeChart, "dismissal mutated slot chart");
    });
    await run(27, "empty CSV creation selects a normal project CSV only", async () => {
      const beforeCharts = activeProject.charts.length;
      const beforeObjectCounts = activeProject.charts.map((chart) => chart.editor?.objects?.length || 0);
      const csvAsset = api.assets.createEmptyCsv();
      await tick();
      check(!!csvAsset && activeProject.csvFiles.some((item) => item.id === csvAsset.id), "empty CSV was not created");
      check(csvAsset.name.startsWith("빈 CSV"), "empty CSV name is incorrect");
      check(JSON.stringify(csvAsset.rows) === JSON.stringify([["X", "Y"], ["", ""]]), "empty CSV template is incorrect");
      check(csvAsset.headerLines === 1, "empty CSV headerLines is incorrect");
      check(appFSM.state.assetSelection === "csv", "empty CSV was not selected");
      check(appFSM.state.assetPath === projectAssetPath(csvAsset), "empty CSV selected path mismatch");
      check(activeProject.charts.length === beforeCharts, "empty CSV creation changed chart count");
      check(
        JSON.stringify(activeProject.charts.map((chart) => chart.editor?.objects?.length || 0)) ===
          JSON.stringify(beforeObjectCounts),
        "empty CSV creation changed graph objects",
      );
    });

    await run(28, "layout preview preserves aspect without a preview resize handle", async () => {
      appFSM.send("TOGGLE_OVERLAY", { overlay: "layout", source: "regression" });
      await tick();
      const overlay = document.querySelector("[data-fastfigure-overlay='layout']");
      const grid = overlay?.querySelector("[role='grid']");
      const oldHandle = overlay?.querySelector("[aria-label='레이아웃 미리보기 크기 조절']");
      const frame = grid?.parentElement;
      const content = frame?.parentElement;
      check(!!grid && !!frame && !!content, "layout preview ownership elements absent");
      check(!oldHandle, "obsolete layout preview resize handle still exists");
      const gridRect = grid.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      check(
        Math.abs((frameRect.left + frameRect.right - contentRect.left - contentRect.right) / 2) < 1.5,
        "layout preview is not horizontally centered in its content area",
      );
      const layoutState = api.layout.readState(gridRect.width);
      const expected = layoutState.previewGeometry;
      check(
        Math.abs(gridRect.height - expected.height) < 1.5,
        "layout preview height is not derived from rendered width",
      );
      check(
        Math.abs(gridRect.width / gridRect.height - layoutState.slotStyle.aspect) < 0.02,
        "layout preview rendered aspect differs from configured aspect",
      );
      appFSM.send("CLOSE_OVERLAY", { reason: "regression-layout-ownership" });
      await tick();
    });
    await run(29, "settings overlays share width and resize their own height", async () => {
      const widths = [];
      for (const overlayName of ["label", "caption", "print", "layout"]) {
        appFSM.send("TOGGLE_OVERLAY", { overlay: overlayName, source: "regression" });
        await tick();
        const overlay = document.querySelector(`[data-fastfigure-overlay='${overlayName}']`);
        const modal = overlay?.querySelector?.("[data-modal-content]") || null;
        const handle = overlay?.querySelector(
          `[data-fastfigure-modal-resize='${overlayName}']`,
        );
        check(!!modal && !!handle, `${overlayName} modal resize elements absent`);
        const centeredBefore = modal.getBoundingClientRect();
        check(
          Math.abs((centeredBefore.left + centeredBefore.right) / 2 - window.innerWidth / 2) < 2,
          `${overlayName} modal is not horizontally centered`,
        );
        widths.push(modal.getBoundingClientRect().width);
        const before = modal.getBoundingClientRect();
        const maxHeight = Math.max(240, window.innerHeight - before.top - 12);
        const delta = before.height < maxHeight - 40 ? 60 : -60;
        handle.dispatchEvent(
          new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
            button: 0,
            clientY: before.bottom - 2,
            view: window,
          }),
        );
        check(
          document.body.style.cursor === "ns-resize",
          `${overlayName} resize handler did not start`,
        );
        window.dispatchEvent(
          new MouseEvent("mousemove", {
            bubbles: true,
            cancelable: true,
            buttons: 1,
            clientY: before.bottom - 2 + delta,
            view: window,
          }),
        );
        check(
          /px$/.test(modal.style.getPropertyValue("--modal-content-height")),
          `${overlayName} resize handler did not project the Mantine content height`,
        );
        window.dispatchEvent(
          new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            button: 0,
            clientY: before.bottom - 2 + delta,
            view: window,
          }),
        );
        await tick();
        const after = modal.getBoundingClientRect();
        check(
          Math.abs(after.height - before.height) > 20,
          `${overlayName} modal height did not resize`,
        );
        check(
          Math.abs(after.width - before.width) < 1.5,
          `${overlayName} modal resize changed width`,
        );
        check(
          Math.abs(after.top - before.top) < 1.5,
          `${overlayName} modal resize moved the top edge`,
        );
        check(
          Math.abs((after.left + after.right) / 2 - window.innerWidth / 2) < 2,
          `${overlayName} modal resize lost horizontal centering`,
        );
        appFSM.send("CLOSE_OVERLAY", { reason: "regression-modal-size" });
        await tick();
      }
      check(
        Math.max(...widths) - Math.min(...widths) < 1.5,
        `settings modal widths differ: ${widths.join(", ")}`,
      );
    });
    await run(30, "trashed asset remains selectable and can be dragged out of trash", async () => {
      if (typeof DataTransfer !== "function" || typeof DragEvent !== "function")
        return { blocked: "DragEvent/DataTransfer unavailable in this browser" };
      const csvAsset = createProjectCsv([["X", "Y"], ["1", "2"]], "trash-recovery.csv");
      const sourcePath = projectAssetPath(csvAsset);
      const referenceSlot = activeProject.slots.find((slot) => !slot.hidden);
      check(!!referenceSlot, "trash recovery reference slot absent");
      api.slots.reset(referenceSlot.id);
      select(slotAt(referenceSlot.id));
      api.slots.setContentType(api.slots.readSelected()?.id, "graph");
      api.graphs.addObject(csvAsset.id);
      check(
        chartCsvIds(getChart(slotAt(referenceSlot.id).chart)).includes(csvAsset.id),
        "trash recovery test reference was not created",
      );
      const plan = api.assets.planMove(sourcePath, "/assets/trash");
      check(!!plan, "trash recovery move plan absent");
      api.assets.move(plan);
      await tick();
      const trashed = activeProject.csvFiles.find((item) => item.id === csvAsset.id);
      const trashedPath = projectAssetPath(trashed);
      check(!!trashed && api.assets.isTrashed(trashedPath), "test CSV did not enter trash");

      const trashDirectoryRow = document.querySelector(
        '[data-fastfigure-tree-path="/assets/trash"]',
      );
      check(!!trashDirectoryRow, "trash directory tree row absent");
      if (trashDirectoryRow.getAttribute("aria-expanded") !== "true") {
        click(trashDirectoryRow);
        await tick();
      }

      const trashedRow = document.querySelector(
        `[data-fastfigure-tree-path="${trashedPath}"]`,
      );
      check(!!trashedRow, "trashed resource row absent");
      check(!trashedRow.disabled, "trashed resource row is disabled");
      click(trashedRow);
      await tick();
      check(appFSM.state.assetPath === trashedPath, "trashed resource row is not selectable");

      const csvDirectoryRow = document.querySelector(
        '[data-fastfigure-tree-path="/assets/csv"]',
      );
      check(!!csvDirectoryRow, "CSV target directory tree row absent");
      const transfer = new DataTransfer();
      trashedRow.dispatchEvent(
        new DragEvent("dragstart", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );
      const targetRect = csvDirectoryRow.getBoundingClientRect();
      csvDirectoryRow.dispatchEvent(
        new DragEvent("dragover", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
          clientY: targetRect.top + targetRect.height * 0.75,
        }),
      );
      csvDirectoryRow.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
          clientY: targetRect.top + targetRect.height * 0.75,
        }),
      );
      await tick();
      const recovered = activeProject.csvFiles.find((item) => item.id === csvAsset.id);
      check(
        !!recovered && !api.assets.isTrashed(projectAssetPath(recovered)),
        "tree drag did not recover trashed asset",
      );
      check(
        activeProject.charts.every((chart) => !chartCsvIds(chart).includes(csvAsset.id)),
        "trash recovery unexpectedly restored old graph references",
      );
    });

    await run(31, "Mantine Tree resource drags to slot connection target", async () => {
      if (typeof DataTransfer !== "function" || typeof DragEvent !== "function")
        return { blocked: "DragEvent/DataTransfer unavailable in this browser" };
      const asset = createProjectCsv([["X", "Y"], ["3", "4"]], "tree-slot-drag.csv");
      await tick();
      const path = projectAssetPath(asset);
      const parentPath = projectParentPath(path);
      const parentRow = document.querySelector(
        `[data-fastfigure-tree-path="${parentPath}"]`,
      );
      if (parentRow?.getAttribute("aria-expanded") !== "true") {
        click(parentRow);
        await tick();
      }
      const resourceRow = document.querySelector(
        `[data-fastfigure-tree-path="${path}"]`,
      );
      check(!!resourceRow, "normal resource tree row absent");
      const targetButton = Array.from(
        document.querySelectorAll("button"),
      ).find((button) => /^\[row=\d+,col=\d+\]/.test(button.textContent?.trim() || ""));
      check(!!targetButton, "slot tree drop target absent");
      const transfer = new DataTransfer();
      resourceRow.dispatchEvent(
        new DragEvent("dragstart", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );
      targetButton.dispatchEvent(
        new DragEvent("dragover", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );
      targetButton.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );
      await tick();
      const slotMatch = (targetButton.textContent || "").match(/^\[row=(\d+),col=(\d+)\]/);
      const slot = activeProject.slots.find(
        (item) =>
          item.row === Number(slotMatch?.[1]) &&
          item.col === Number(slotMatch?.[2]) &&
          !item.hidden,
      );
      check(!!slot, "slot drop target could not be resolved");
      check(
        slot.chart && chartCsvIds(getChart(slot.chart)).includes(asset.id),
        "tree resource drop did not connect CSV to target slot",
      );
      check(
        projectAssetPath(activeProject.csvFiles.find((item) => item.id === asset.id)) === path,
        "slot connection unexpectedly moved source asset",
      );
    });

    await run(32, "new project layout outer margin defaults to zero", async () => {
      const fresh = createProjectState();
      check(
        fresh.layout?.slotStyle?.outerMargin === 0,
        `new project outerMargin default is ${fresh.layout?.slotStyle?.outerMargin}`,
      );
    });


    await run(33, "layout selection clears on non-slot modal content", async () => {
      appFSM.send("TOGGLE_OVERLAY", { overlay: "layout", source: "regression-selection" });
      await tick();
      const overlay = document.querySelector("[data-fastfigure-overlay='layout']");
      const grid = overlay?.querySelector("[role='grid']");
      const slotButton = grid?.querySelector("button");
      const content = overlay?.querySelector("[data-fastfigure-settings-content='layout']");
      check(!!slotButton && !!content, "layout selection test controls absent");
      click(slotButton);
      await tick();
      check(slotButton.getAttribute("aria-pressed") === "true", "layout slot did not become selected");
      click(content);
      await tick();
      check(slotButton.getAttribute("aria-pressed") !== "true", "layout selection survived non-slot content click");
      appFSM.send("CLOSE_OVERLAY", { reason: "regression-layout-selection" });
      await tick();
    });

    await run(34, "trash reference detach invalidates dashboard immediately", async () => {
      let target = activeProject.slots.find((slot) => !slot.hidden);
      check(!!target, "trash invalidation slot absent");
      api.slots.reset(target.id);
      select(slotAt(target.id));
      api.slots.setContentType(api.slots.readSelected()?.id, "image");
      const image = createProjectImage(
        new TextEncoder().encode(
          '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8"/></svg>',
        ),
        "trash-invalidation.svg",
        "image/svg+xml",
      );
      const imagePath = projectAssetPath(image);
      api.assets.connectToSlot(imagePath, "image", target.id);
      await tick();
      check(!!slotElement(target.id)?.querySelector(".slot-image"), "baseline image projection absent");
      const plan = api.assets.planMove(imagePath, "/assets/trash");
      check(!!plan?.enteringTrash, "image trash plan absent");
      api.assets.move(plan);
      await tick();
      check(slotAt(target.id).imageId == null, "trash move did not detach image reference");
      check(!slotElement(target.id)?.querySelector(".slot-image"), "dashboard retained stale image projection");
    });
    await run(35, "image editor and dashboard reads preserve project authority", async () => {
      const target = activeProject.slots.find((slot) => !slot.hidden);
      check(!!target, "image read regression slot absent");
      select(target);
      if (slotAt(target.id).contentType !== "image") api.slots.setContentType(api.slots.readSelected()?.id, "image");
      if (!slotAt(target.id).imageId) api.images.insertEmpty();
      const slot = slotAt(target.id);
      check(!!slot?.imageId, "image read regression asset absent");
      const contentBefore = slot.content;
      const settingsBefore = contentBefore.imageSettings;
      const valuesBefore = JSON.stringify(settingsBefore);
      const selected = api.slots.readSelected();
      const editor = api.images.readEditor();
      check(Object.isFrozen(selected), "selected slot read is not immutable");
      check(!!editor && Object.isFrozen(editor), "image editor read is not immutable");
      check(Object.isFrozen(editor.settings), "image settings read is not immutable");
      check(slot.content === contentBefore, "image editor read replaced live slot content");
      check(slot.content.imageSettings === settingsBefore, "image editor read replaced live settings");
      renderDashboard();
      check(slot.content === contentBefore, "dashboard render replaced live slot content");
      check(slot.content.imageSettings === settingsBefore, "dashboard render replaced live settings");
      check(JSON.stringify(slot.content.imageSettings) === valuesBefore,
        "image projection read changed authoritative settings values");
    });
    await run(36, "application lifecycle task owns execution and Frontend FSM receives events", async () => {
      const published = [];
      const unsubscribe = appFSM.subscribe((_state, event) => {
        if (event?.startsWith("LIFECYCLE_PROBE_")) published.push(event);
      });
      try {
        const outcome = await appFSM.run("importing", "LIFECYCLE_PROBE_SYNC", () => {
          check(appFSM.state.lifecycle === "importing", "lifecycle start not published before task");
          return { outcome: "rejected" };
        });
        check(outcome.outcome === "rejected" && appFSM.state.lifecycle === "ready",
          "rejected lifecycle did not return to ready");
        let finish;
        const pending = appFSM.run("exporting", "LIFECYCLE_PROBE_ASYNC",
          () => new Promise((resolve) => { finish = resolve; }));
        check(appFSM.state.lifecycle === "exporting", "async lifecycle not busy");
        let invokedWhileBusy = false;
        const busyError = await appFSM.run("importing", "LIFECYCLE_PROBE_BLOCKED", () => {
          invokedWhileBusy = true;
        }).then(() => null, (error) => error);
        check(!!busyError && !invokedWhileBusy, "busy lifecycle accepted nested task");
        finish({ outcome: "complete" });
        await pending;
        check(appFSM.state.lifecycle === "ready", "async lifecycle did not complete");
        const failure = await appFSM.run("importing", "LIFECYCLE_PROBE_FAIL", () => {
          throw Error("expected lifecycle failure");
        }).then(() => null, (error) => error);
        check(failure?.message === "expected lifecycle failure",
          "lifecycle failure was not returned");
        check(appFSM.state.lifecycle === "ready" &&
          appFSM.state.error?.message === "expected lifecycle failure",
          "Frontend FSM did not record and recover from lifecycle failure");
        check(published.some((event) => event.includes("LIFECYCLE_PROBE_SYNC:rejected")),
          "lifecycle rejection event was not published");
        check(published.some((event) => event.includes("LIFECYCLE_PROBE_FAIL:failed")) &&
          published.some((event) => event.includes("LIFECYCLE_PROBE_FAIL:recovered")),
          "lifecycle failure/recovery events were not published");
      } finally {
        unsubscribe();
      }
    });

    await run(37, "selection validation is read-only and rejected references preserve Frontend state", async () => {
      const target = activeProject.slots.find((slot) => !slot.hidden);
      api.slots.reset(target.id);
      select(slotAt(target.id));
      api.slots.setContentType(api.slots.readSelected()?.id, "graph");
      const resource = createProjectCsv([["X", "Y"], ["1", "2"]], "boundary-selection.csv");
      api.graphs.addObject(resource.id);
      const authority = JSON.stringify(activeProject._state);
      const chart = getChart(slotAt(target.id).chart);
      const editor = chart.editor, objects = editor.objects;
      api.graphs.selectObject(0);
      check(appFSM.state.graphObjectIndex === 0 && appFSM.state.assetSelection === "csv",
        "validated graph selection did not select CSV");
      check(appFSM.state.assetPath === projectAssetPath(getProjectCsv(objects[0].csvId)),
        "graph selection CSV path mismatch");
      check(JSON.stringify(activeProject._state) === authority && chart.editor === editor &&
        chart.editor.objects === objects, "selection normalized or mutated live graph state");
      appFSM.send("TOGGLE_OVERLAY", { overlay: "layout" });
      const previous = appFSM.state, slotId = selectedSlotId;
      for (const [event, payload] of [
        ["SELECT_SLOT", { slotId: -999 }],
        ["SELECT_ASSET", { kind: "csv", path: "/missing-boundary.csv" }],
        ["SELECT_ASSET", { kind: "image", path: projectAssetPath(resource) }],
        ["SELECT_GRAPH_OBJECT", { index: -1 }],
        ["SELECT_GRAPH_OBJECT", { index: 999999 }],
      ]) {
        appFSM.send(event, payload);
        check(appFSM.state === previous && selectedSlotId === slotId,
          `${event} rejected reference changed Frontend state`);
      }
      api.graphs.selectObject(-1);
      check(appFSM.state === previous, "public graph selector cleared invalid input");
      check(JSON.stringify(activeProject._state) === authority, "validation changed project authority");
      const validated = validateFrontendIntent("SELECT_SLOT", { slotId: target.id });
      check(Object.isFrozen(validated) && validated.reference === target.id,
        "validated reference is not immutable");
      appFSM.send("CLOSE_OVERLAY");
      appFSM.send("SELECT_ASSET", { kind: "csv", path: projectAssetPath(resource) });
      check(appFSM.state.graphObjectIndex === null && appFSM.state.graphObject === "none",
        "asset selection retained graph selection");
      api.slots.select(null);
      check(selectedSlotId === null && appFSM.state.workspace === "project",
        "explicit deselection did not clear slot workspace");
    });
    await run(38, "post-commit reconciliation preserves unrelated references and resolves moved assets", async () => {
      const target = activeProject.slots.find((slot) => !slot.hidden);
      select(target);
      const resource = createProjectCsv([["X", "Y"], ["3", "4"]], "boundary-reconcile.csv");
      appFSM.send("SELECT_ASSET", { kind: "csv", path: projectAssetPath(resource) });
      const original = appFSM.state.assetPath;
      api.project.setName("boundary reconciliation");
      check(selectedSlotId === target.id && appFSM.state.assetPath === original,
        "unrelated project command cleared selection");
      const beforeFailure = appFSM.state, beforeAuthority = JSON.stringify(activeProject._state);
      let failed = false;
      try { appFSM.send("SLOT_TYPE_CHANGED", { slotId: -999, type: "image" }); }
      catch { failed = true; }
      check(failed && appFSM.state === beforeFailure &&
        JSON.stringify(activeProject._state) === beforeAuthority,
        "failed Backend command reconciled success or changed authority");
      api.assets.createDirectory("/assets/csv", "boundary-reconcile");
      const destination = "/assets/csv/boundary-reconcile";
      appFSM.send("SELECT_ASSET", { kind: "csv", path: original });
      api.assets.move(api.assets.planMove(original, destination));
      check(appFSM.state.assetPath === `${destination}/boundary-reconcile.csv`,
        "asset move did not reconcile selected path");
      const input = buildFrontendReconciliationInput("PROBE", { payload: {} }, interfaceFSM.readState());
      check(Object.isFrozen(input) && input.selectedSlot === target.id,
        "reconciliation input is not an immutable resolved reference");
      const moved = appFSM.state.assetPath;
      api.assets.move(api.assets.planMove(moved, "/assets/trash"));
      check(appFSM.state.assetPath === null && appFSM.state.assetSelection === "none",
        "trash move retained selected asset");
    });

    await run(39, "image settings use current Backend authority and projection-only renderer", async () => {
      const target = activeProject.slots.find((slot) => !slot.hidden);
      api.slots.reset(target.id);
      select(slotAt(target.id));
      api.slots.setContentType(api.slots.readSelected()?.id, "image");
      api.images.insertEmpty();
      const imageId = slotAt(target.id).imageId;
      const other = activeProject.slots.find((slot) => !slot.hidden && slot.id !== target.id);
      if (other) {
        api.assets.connectToSlot(projectAssetPath(getProjectImage(imageId)), "image", other.id);
        select(slotAt(target.id));
      }
      const othersBefore = JSON.stringify(activeProject.slots.filter((slot) => slot.id !== target.id));
      const stale = api.images.readEditor();
      const result = api.images.setSettings({ fit: "manual", scale: 175, x: 25, y: 75 });
      check(result.slotId === target.id && Object.isFrozen(result.settings), "image query projection missing");
      check(result.settings.scale === 175 && stale.settings.scale === 100, "image read snapshot became authority");
      check(JSON.stringify(activeProject.slots.filter((slot) => slot.id !== target.id)) === othersBefore,
        "image settings changed another slot sharing the asset");
      const image = slotElement(target.id)?.querySelector(".slot-image");
      check(image?.classList.contains("manual") && image.style.width === "175%" &&
        image.style.left === "25%" && image.style.top === "75%", "targeted image projection missing");
      const patched = api.images.setSettings({ scale: 190 });
      check(patched.settings.scale === 190 && patched.settings.x === 25 && patched.settings.y === 75,
        "partial image edit did not preserve untouched current Backend settings");
      const projection = appFSM.query("renderer", { operation: "slot-image", slotId: target.id });
      const authority = JSON.stringify(activeProject._state), frontend = appFSM.state;
      check(syncSlotImageElement(projection), "renderer rejected supplied image projection");
      check(JSON.stringify(activeProject._state) === authority && appFSM.state === frontend,
        "image renderer changed Backend or Frontend authority");
      check(!/slotAt|slotImage|normalizeImageSettings|activeProject|appFSM/.test(syncSlotImageElement.toString()),
        "narrow image renderer retains direct query or command path");
      api.images.setSettings({ fit: "contain" });
      check(!image.classList.contains("manual") && image.style.objectFit === "contain" && image.style.width === "",
        "contain projection retained manual styling");
      api.images.setSettings({ fit: "manual", scale: 5000, x: -500, y: 500 });
      const normalized = slotAt(target.id).content.imageSettings;
      check(normalized.scale === 1000 && normalized.x === -100 && normalized.y === 200,
        "Backend did not normalize image settings");
      const beforeFailure = JSON.stringify(activeProject._state), frontendBeforeFailure = appFSM.state;
      let failed = false;
      try { dispatchProjectCommand("SLOT_IMAGE_SETTINGS_CHANGED", { slotId: -999, settings: { fit: "cover" } }); }
      catch { failed = true; }
      check(failed && JSON.stringify(activeProject._state) === beforeFailure && appFSM.state === frontendBeforeFailure,
        "failed image command changed authority or reconciled success");
      api.slots.select(target.id);
      check(api.images.readEditor() === null && api.images.setSettings({ fit: "cover" }) === false,
        "missing selection must not update an image");
    });

    await run(40, "print settings use Backend queries and current-authority partial commands", async () => {
      api.print.setSettings({ width: 1400, heightMode: "explicit", height: 800, dpi: 300, format: "png" });
      const beforeRead = JSON.stringify(activeProject._state), frontendBeforeRead = appFSM.state;
      const stale = api.print.readSettings();
      check(Object.isFrozen(stale) && stale !== activeProject.exportSettings, "print projection is not immutable/detached");
      check(JSON.stringify(activeProject._state) === beforeRead && appFSM.state === frontendBeforeRead,
        "print query changed authority");
      api.print.setSettings({ width: 1800, dpi: 600 });
      const result = dispatchProjectCommand("EXPORT_SETTINGS_CHANGED", { settings: { format: "jpeg" } });
      const current = api.print.readSettings();
      check(result.committed && current.width === 1800 && current.dpi === 600 && current.height === 800 &&
        current.format === "jpeg" && stale.width === 1400 && stale.format === "png",
        "partial command used defaults or stale projection instead of Backend authority");
      check(!/activeProject|projectEFSM|readProjectNumber/.test(readPrintApiSettings.toString() + setPrintApiSettings.toString()),
        "print API retains direct Backend authority or candidate calculations");
      const clamped = api.print.setSettings({ width: 99999, heightMode: "explicit", height: 1, dpi: 9999 });
      check(clamped.width === 20000 && clamped.height === 100 && clamped.dpi === 1200 && clamped.format === "jpeg",
        "Backend did not preserve print normalization semantics");
      const auto = api.print.setSettings({ heightMode: "auto", height: 1234, format: "invalid" });
      check(auto.height === null && auto.format === "jpeg" && auto.width === 20000,
        "auto height or invalid-format fallback changed");
      const beforeFailure = JSON.stringify(activeProject._state), frontendBeforeFailure = appFSM.state;
      let failed = false;
      try { api.print.setSettings({ width: Symbol("invalid-width") }); } catch { failed = true; }
      check(failed && JSON.stringify(activeProject._state) === beforeFailure && appFSM.state === frontendBeforeFailure,
        "failed print command changed Project or reconciled Frontend success");
    });

    await run(41, "caption insertion follows exact Backend grouping and committed query boundaries", async () => {
      const fixture = projectClone(activeProject._state);
      fixture.annotations.labels.enabled = false;
      fixture.annotations.labels.settings = { ...fixture.annotations.labels.settings,
        format: "lower-alpha", order: "row-major", parentheses: false };
      fixture.annotations.captions.text = "";
      fixture.slots = ["A", "A", "", "B"].map((caption, id) =>
        ({ id, row: 1, col: id + 1, hidden: false, caption }));
      const frozenBefore = JSON.stringify(fixture);
      check(insertSlotCaptions(fixture) === "(a-c) A (d) B", "equal/empty consecutive grouping failed");
      check(insertSlotCaptions(fixture, [2, 0, 0]) === "(a) A (c)", "subset order/gaps/dedup changed numbering");
      check(JSON.stringify(fixture) === frozenBefore, "caption calculation mutated its input");
      fixture.slots[0].caption = "";
      fixture.slots[1].caption = "";
      check(insertSlotCaptions(fixture) === "(a-c) (d) B", "initial empty group lost labels");
      fixture.slots[0].caption = " A";
      fixture.slots[1].caption = "A";
      fixture.annotations.captions.text = "prefix\n";
      check(insertSlotCaptions(fixture) === "prefix\n (a)  A (b-c) A (d) B", "exact text/append separator changed");
      fixture.annotations.captions.text = "prefix ";
      check(insertSlotCaptions(fixture, [3]) === "prefix (d) B", "existing U+0020 boundary not reused");
      fixture.annotations.labels.settings.format = "decimal";
      fixture.annotations.labels.settings.order = "column-major";
      fixture.slots[0].row = 2;
      fixture.slots[1].row = 1;
      fixture.slots[1].col = 1;
      check(orderedSlotLabels(fixture)[0].slotId === 1 &&
        insertSlotCaptions(fixture, [0]) === "prefix (2)  A", "label order/format not read from supplied Project");
      const slot = activeProject.slots.find((item) => !item.hidden);
      api.captions.setGlobalText("existing");
      api.captions.setSlotText(slot.id, "body");
      api.labels.setEnabled(false);
      const beforeRead = JSON.stringify(activeProject._state), frontendBeforeRead = appFSM.state;
      const snapshot = api.captions.readGlobal();
      check(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.settings) &&
        JSON.stringify(activeProject._state) === beforeRead && appFSM.state === frontendBeforeRead,
        "caption read is mutable or changes authority");
      const expected = insertSlotCaptions(projectClone(activeProject._state), [slot.id]);
      const actual = api.captions.insertSlotCaptions([slot.id]);
      check(actual.text === expected && snapshot.text === "existing", "public insertion did not return fresh detached read");
      const before = JSON.stringify(activeProject._state), frontend = appFSM.state;
      check(api.captions.insertSlotCaptions([]) === false && JSON.stringify(activeProject._state) === before &&
        appFSM.state === frontend, "empty target committed or reconciled success");
      let failed = false;
      try { api.captions.insertSlotCaptions([Number.MIN_SAFE_INTEGER]); } catch { failed = true; }
      check(failed && JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
        "invalid target partially changed Project/Frontend");
      check(!/activeProject|projectObjects|slotAt|projectEFSM/.test(
        insertCaptionsApiSlotCaptions.toString() + readGlobalCaptionState.toString()),
        "caption Application wrapper retains direct Backend read/calculation");
    });

    await run(42, "Backend config packaging and caption settings preserve current command ownership", async () => {
      const configBefore = JSON.stringify(BackendSettings), fresh = createProjectState();
      check(Object.isFrozen(BackendSettings) && Object.isFrozen(BackendSettings.defaults.limits.captions.fontSize) &&
        JSON.stringify(fresh.annotations.labels) === JSON.stringify(BackendSettings.project_object.annotations.labels) &&
        fresh.annotations.captions.settings.fontSize === BackendSettings.project_object.annotations.captions.settings.fontSize,
        "packaged configuration is mutable or initial annotation defaults diverge");
      fresh.annotations.labels.settings.fontSize = 91;
      fresh.annotations.captions.settings.lineHeight = 3;
      check(JSON.stringify(BackendSettings) === configBefore, "Project instance writes reached shared configuration");
      const slot = activeProject.slots.find((item) => !item.hidden);
      const slotRead = api.captions.setSlotText(slot.id, "settings-test");
      check(Object.isFrozen(slotRead) && slotRead.text === "settings-test" &&
        readSlotCaptionState(Number.MIN_SAFE_INTEGER) === null, "slot caption did not use detached Backend query");
      const originalSend = projectEFSM.send;
      try {
        projectEFSM.send = function(event, payload) {
          if (event === "CAPTION_SETTINGS_CHANGED") {
            check(Object.keys(payload.settings).join() === "fontSize", "Application sent a copied current settings record");
            const intervening = projectClone(activeProject._state);
            intervening.annotations.captions.settings.fontFamily = "serif";
            activeProject.initialize(intervening);
          }
          return originalSend.call(this, event, payload);
        };
        const updated = api.captions.setSettings({ fontSize: 0 });
        check(updated.settings.fontSize === BackendSettings.defaults.limits.captions.fontSize[0] &&
          updated.settings.fontFamily === "serif", "Backend did not merge new edits against command-time authority");
      } finally { projectEFSM.send = originalSend; }
      const bounded = api.captions.setSettings({ fontSize: Infinity, lineHeight: 100 });
      check(bounded.settings.fontSize === BackendSettings.project_object.annotations.captions.settings.fontSize &&
        bounded.settings.lineHeight === BackendSettings.defaults.limits.captions.lineHeight[1],
        "caption fallback or upper bound diverged from configuration");
      const before = JSON.stringify(activeProject._state), frontend = appFSM.state;
      let failed = false;
      try { api.captions.setSettings({ fontSize: Symbol("invalid-size") }); } catch { failed = true; }
      check(failed && JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
        "throwing caption edit committed or reconciled success");
      try {
        projectEFSM.send = () => Object.freeze({ committed: false });
        for (const action of [
          () => api.captions.setEnabled(true), () => api.captions.setGlobalText("ignored"),
          () => api.captions.setSlotText(slot.id, "ignored"), () => api.captions.setName("ignored"),
          () => api.captions.setNameBold(true), () => api.captions.setSettings({ fontSize: 40 }),
        ]) check(action() === false, "uncommitted caption command exposed a successful read");
      } finally { projectEFSM.send = originalSend; }
      check(JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
        "uncommitted caption API changed authority");
      check(!/activeProject|projectObjects|slotAt/.test(
        setCaptionsApiSettings.toString() + readSlotCaptionState.toString()),
        "caption Application wrapper retains direct Backend authority access");
    });

    await run(43, "Labels use current Backend edits and immutable reference geometry", async () => {
      activeProject.initialize(createProjectState());
      const slot = activeProject.slots.find((item) => !item.hidden);
      select(slot);
      const initial = api.labels.readState(), source = activeProject._state,
        style = source.layout.slotStyle, width = style.referenceWidth,
        height = width / style.aspect,
        margin = Math.min(style.outerMargin, Math.min(width, height) * 0.49),
        cellWidth = (width - 2 * margin - style.gap * (source.layout.gridCols - 1)) / source.layout.gridCols;
      check(Object.isFrozen(initial) && Object.isFrozen(initial.settings) && Object.isFrozen(initial.reference) &&
        initial.reference.width === cellWidth && initial.sampleText === "a",
        "label read is mutable or reference/sample projection differs from specification");
      const originalSend = projectEFSM.send;
      try {
        projectEFSM.send = function(event, payload) {
          if (event === "LABEL_SETTINGS_CHANGED" && payload.settings) {
            check(Object.keys(payload.settings).join() === "fontSize", "Application copied current label settings");
            const current = projectClone(activeProject._state);
            current.annotations.labels.settings.fontFamily = "serif";
            activeProject.initialize(current);
          }
          return originalSend.call(this, event, payload);
        };
        const edited = api.labels.setSettings({ fontSize: 0 });
        check(edited.settings.fontSize === BackendSettings.defaults.limits.labels.fontSizeMin &&
          edited.settings.fontFamily === "serif" && initial.settings.fontFamily !== "serif",
          "label command did not preserve intervening current state or detached earlier read");
      } finally { projectEFSM.send = originalSend; }
      check(api.labels.setSettings({ fontSize: 501, format: "decimal", parentheses: false }).settings.fontSize === 501,
        "label font size received an undeclared upper bound");
      check(api.labels.readState().sampleText === "1", "sample label ignores current format/parentheses");
      api.labels.setSettings({ fontSize: 14 });
      const moved = api.labels.setPosition(0, -12);
      check(moved.settings.x === 0 && moved.settings.y === -12, "zero/negative label positions lost");
      const reset = api.labels.resetPosition(), defaults = BackendSettings.project_object.annotations.labels.settings;
      check(reset.settings.x === defaults.x && reset.settings.y === defaults.y, "reset bypassed Backend config defaults");
      mergeSlots([0, 1]);
      select(activeProject.slots.find((item) => item.id === 0));
      const merged = api.labels.readState();
      check(merged.reference.width === 2 * cellWidth + style.gap &&
        readBackendProjection("project-api", { operation: "labels.readState", slotId: -99 }).reference.width === cellWidth,
        "merged or missing-slot reference geometry is not read-only current layout geometry");
      const before = JSON.stringify(activeProject._state), frontend = appFSM.state;
      let failed = false;
      try { api.labels.setPosition(Infinity, 2); } catch { failed = true; }
      check(failed && JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
        "invalid label position changed Project/Frontend state");
      try {
        projectEFSM.send = () => Object.freeze({ committed: false });
        for (const action of [() => api.labels.setEnabled(false), () => api.labels.setSettings({ fontSize: 20 }),
          () => api.labels.setPosition(1, 2), () => api.labels.resetPosition()])
          check(action() === false, "uncommitted label command exposed successful read");
      } finally { projectEFSM.send = originalSend; }
      check(JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
        "uncommitted label command mutated state");
      const finished = api.labels.finishPositionInteraction();
      check(Object.isFrozen(finished) && JSON.stringify(activeProject._state) === before,
        "label interaction completion committed persistent state");
      check(!/activeProject|projectObjects|getSelectedSlot/.test(
        readLabelsApiState.toString() + setLabelsApiSettings.toString() + updateLabelsApiPosition.toString() +
        finishLabelsApiPositionInteraction.toString() + resetLabelsApiPosition.toString()),
        "label Application still reads Backend state directly");
    });

    await run(44, "Palette command and renderer use detached one-way projections", async () => {
      const defaults = BackendSettings.project_object.appearance.uiPalette,
        oldRead = api.appearance.readPalette();
      check(Object.isFrozen(oldRead), "public palette read is mutable");
      const changed = api.appearance.setPalette({ uiColor: "#aBcDeF", paperColor: "#123456", unknown: "#123456" });
      check(Object.isFrozen(changed) && changed.uiColor === "#aBcDeF" && changed.paperColor === "#123456" &&
        changed.uiSurfaceColor === defaults.uiSurfaceColor && !("unknown" in changed) &&
        Object.keys(changed).length === Object.keys(defaults).length,
        "palette does not use known whole-set defaults/case preservation");
      const fallback = api.appearance.setPalette({ uiColor: "rgb(1,2,3)", fontColor: "#abc" });
      check(JSON.stringify(fallback) === JSON.stringify(defaults) && oldRead !== fallback,
        "invalid/missing palette fields retained prior values instead of defaults");
      const before = JSON.stringify(activeProject._state), frontend = appFSM.state,
        rootStyle = document.documentElement.style;
      const originalQuery = appFSM.query;
      let rendered;
      try {
        appFSM.query = () => { throw Error("renderer queried authority"); };
        rendered = applyUiPalette({ ...defaults, uiColor: "#112233" }, false);
      } finally { appFSM.query = originalQuery; }
      check(Object.isFrozen(rendered) && rootStyle.getPropertyValue("--ui-color") === "#112233" &&
        JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
        "renderer did not consume only supplied palette or wrote authority");
      applyUiPalette(fallback, false);
      const broken = {};
      Object.defineProperty(broken, "uiColor", { get() { throw Error("broken palette input"); } });
      let failed = false;
      try { api.appearance.setPalette(broken); } catch { failed = true; }
      check(failed && JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
        "throwing palette input committed or reconciled");
      const originalSend = projectEFSM.send, originalRender = renderDashboard;
      let renderCount = 0;
      try {
        projectEFSM.send = () => Object.freeze({ committed: false });
        renderDashboard = () => { renderCount++; };
        check(api.appearance.setPalette({ uiColor: "#abcdef" }) === false && api.appearance.resetPalette() === false,
          "uncommitted palette API returned successful read");
      } finally { projectEFSM.send = originalSend; renderDashboard = originalRender; }
      check(renderCount === 0 && JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
        "uncommitted palette input rendered or mutated state");
      check(JSON.stringify(api.appearance.resetPalette()) === JSON.stringify(defaults), "palette reset differs from sole config");
      check(!/activeProject|projectObjects/.test(readAppearanceApiPalette.toString() + applyUiPaletteValues.toString() +
        applyCurrentUiPalette.toString() + applyUiPalette.toString()), "palette adapter/renderer directly reads Backend");
      check(!/appFSM.query|renderDashboard/.test(applyUiPalette.toString()), "palette renderer performs queries or dashboard orchestration");
    });

    await run(45, "Layout reads and partial style commands use current Backend authority", async () => {
      const preview = BackendSettings.defaults.preview, limits = BackendSettings.defaults.limits.layout,
        beforeRead = JSON.stringify(activeProject._state), frontend = appFSM.state,
        read = api.layout.readState(800), backend = appFSM.query("project-api", { operation: "layout.readState", renderedWidth: 800 });
      check(Object.isFrozen(read) && Object.isFrozen(read.slotStyle) && Object.isFrozen(read.visibleSlots) &&
        read.visibleSlots.every(Object.isFrozen) && Object.isFrozen(read.previewGeometry), "layout projection contains mutable fields");
      check(JSON.stringify(activeProject._state) === beforeRead && appFSM.state === frontend &&
        !("zoom" in backend) && !("zoomLocked" in backend), "layout query mutated state or Backend read Frontend zoom");
      check(read.zoom === interfaceFSM.readState().dashboardZoomIntent &&
        read.zoomLocked === interfaceFSM.readState().dashboardZoomLocked, "Application did not compose Frontend zoom scalars");
      check(api.layout.readState(null).previewGeometry.width === preview.fallbackWidth &&
        api.layout.readState(Infinity).previewGeometry.width === preview.fallbackWidth &&
        api.layout.readState(0).previewGeometry.width === preview.widthRange[0] &&
        api.layout.readState(1e9).previewGeometry.width === preview.widthRange[1], "preview width does not use Backend config");
      const current = api.layout.setStyle({ referenceWidth: 1600, gap: 14, outerMargin: 12, radius: 0, aspect: 2, showBorders: false });
      check(current.slotStyle.referenceWidth === 1600 && current.slotStyle.gap === 14 && current.slotStyle.radius === 0 &&
        !current.slotStyle.showBorders && read.slotStyle !== current.slotStyle && read.previewGeometry.width === 800,
        "style edit discarded zero/false or rewrote detached snapshot");
      dispatchProjectCommand("LAYOUT_STYLE_CHANGED", { gap: 21 });
      const partial = api.layout.setStyle({ aspect: 4 });
      check(partial.slotStyle.gap === 21 && partial.slotStyle.referenceWidth === 1600 && partial.slotStyle.aspect === 4 &&
        !partial.slotStyle.showBorders, "Application sent a stale full style instead of new edits");
      check(partial.previewGeometry.height === preview.fallbackWidth / 4 &&
        partial.previewGeometry.scale === preview.fallbackWidth / 1600, "preview uses inconsistent width/reference context");
      const bounded = api.layout.setStyle({ referenceWidth: 1e9, gap: -1, outerMargin: 1e9, radius: -1, aspect: NaN, showBorders: 1, ignored: 7 });
      check(bounded.slotStyle.referenceWidth === limits.referenceWidth[1] && bounded.slotStyle.gap === limits.gap[0] &&
        bounded.slotStyle.outerMargin === limits.outerMargin[1] && bounded.slotStyle.radius === limits.radius[0] &&
        bounded.slotStyle.aspect === 4 && !bounded.slotStyle.showBorders && !("ignored" in bounded.slotStyle),
        "style limits/invalid fallback/known-field Boolean rule differ from pseudocode");
      const beforeFailure = JSON.stringify(activeProject._state), beforeFrontend = appFSM.state, broken = { gap: 19 };
      Object.defineProperty(broken, "aspect", { get() { throw Error("broken layout edit"); } });
      let failed = false;
      try { api.layout.setStyle(broken); } catch { failed = true; }
      check(failed && JSON.stringify(activeProject._state) === beforeFailure && appFSM.state === beforeFrontend,
        "failed style normalization partially committed or reconciled");
      const send = projectEFSM.send, apply = applySlotStyle, zoom = applyDashboardZoom, resize = schedulePlotResize;
      let rendered = 0;
      try {
        projectEFSM.send = () => Object.freeze({ committed: false });
        applySlotStyle = applyDashboardZoom = schedulePlotResize = () => { rendered++; };
        check(api.layout.setStyle({ gap: 8 }) === false, "uncommitted style returned successful layout read");
      } finally { projectEFSM.send = send; applySlotStyle = apply; applyDashboardZoom = zoom; schedulePlotResize = resize; }
      check(rendered === 0 && JSON.stringify(activeProject._state) === beforeFailure && appFSM.state === beforeFrontend,
        "uncommitted style rendered or mutated state");
      check(!/activeProject|projectObjects|readProjectNumber|dashboardGeometry/.test(readLayoutApiState.toString() + setLayoutApiStyle.toString()),
        "layout Application still owns Backend reads or normalization");
      api.layout.setStyle(BackendSettings.project_object.layout.slotStyle);
    });

    await run(46, "Layout zoom is Frontend-owned with stable lock anchor and no persistent writes", async () => {
      api.layout.resetZoom();
      const authority = JSON.stringify(activeProject._state);
      check(api.layout.setZoom(125).zoom === 125, "zoom intent event not applied");
      const stable = appFSM.state;
      api.layout.setZoom(125);
      check(appFSM.state === stable, "same zoom republished runtime");
      check(api.layout.setZoom(0).zoom === 50 && api.layout.setZoom(1000).zoom === 200 &&
        api.layout.setZoom(NaN).zoom === 100 && api.layout.setZoom(Symbol("invalid zoom")).zoom === 100,
        "zoom limits/invalid fallback do not match Frontend contract");
      const readWidth = readDashboardRenderedWidth;
      let measured = 0;
      try {
        readDashboardRenderedWidth = () => { measured++; return 0; };
        const beforeInvalid = appFSM.state;
        check(api.layout.setZoomLocked(true) === false && appFSM.state === beforeInvalid &&
          !interfaceFSM.readState().dashboardZoomLocked, "invalid initial lock changed runtime");
        readDashboardRenderedWidth = () => { measured++; return 840; };
        check(api.layout.setZoomLocked(true).zoomLocked && measured === 2 &&
          interfaceFSM.readState().dashboardZoomLockedWidth === 840, "initial lock did not capture exactly one valid width");
        const locked = appFSM.state;
        readDashboardRenderedWidth = () => { throw Error("repeated lock measured again"); };
        api.layout.setZoomLocked(true);
        api.layout.setZoom(175);
        check(appFSM.state === locked && interfaceFSM.readState().dashboardZoomLockedWidth === 840 &&
          api.layout.readState().zoom === 100, "lock changed anchor/intent or republished on no-op");
        check(!api.layout.setZoomLocked(false).zoomLocked && api.layout.readState().zoom === 100 &&
          interfaceFSM.readState().dashboardZoomLockedWidth === null, "unlock did not reset session atomically");
        api.layout.setZoom(150);
        api.layout.resetZoom();
        const reset = appFSM.state;
        api.layout.resetZoom();
        check(appFSM.state === reset && api.layout.readState().zoom === 100, "repeated reset published a change");
      } finally { readDashboardRenderedWidth = readWidth; }
      const revision = appFSM.state.revision;
      api.layout.commitZoom();
      check(appFSM.state.revision === revision + 1 && JSON.stringify(activeProject._state) === authority,
        "zoom completion did not notify once or zoom wrote persistent layout");
      check(!/dashboardZoom\w*\s*=|activeProject|readProjectNumber/.test(setLayoutApiZoom.toString() +
        setLayoutApiZoomLocked.toString() + resetLayoutApiZoom.toString()), "zoom Application owns session mutation or Backend normalization");
    });

    await run(47, "Grid resize uses one-based coordinates and preserves ownership before one commit", async () => {
      const saved = projectClone(activeProject._state);
      try {
        const fresh = createProjectState();
        check(fresh.slots.every((slot, i) => slot.row === Math.floor(i / fresh.layout.gridCols) + 1 &&
          slot.col === i % fresh.layout.gridCols + 1 && slot.id === i), "initial grid coordinate/id contract differs");
        fresh.slots.forEach((slot, i) => { slot.id = [1, 90, 2, 100][i]; });
        fresh.slots[0].caption = "retained";
        activeProject.initialize(validateProjectObjectState(fresh, { requireSlots: true }));
        const before = JSON.stringify(activeProject._state), candidate = buildGridResizeCandidate(3, 1);
        check(JSON.stringify(activeProject._state) === before, "candidate builder committed authority");
        check(candidate.slots.length === 3 && candidate.slots[0].id === 1 && candidate.slots[1].id === 2 &&
          candidate.slots[2].id === 101 && candidate.slots[2].row === 3 && candidate.slots[2].col === 1 &&
          candidate.slots[0].caption === "retained", "mixed-axis resize reflowed or reused pre-resize ids");
        const read = api.layout.setGrid(3, 1);
        check(read.gridRows === 3 && read.gridCols === 1 && JSON.stringify(activeProject._state) === JSON.stringify(candidate),
          "public resize did not commit the calculated candidate");
        const oldSlots = projectClone(activeProject.slots);
        api.layout.setGrid(3, 2);
        check(oldSlots.every(old => {
          const current = slotAt(old.id);
          return ["id", "row", "col", "rowSpan", "colSpan", "hidden"].every(key => current[key] === old[key]) &&
            JSON.stringify(slotLocalState(current)) === JSON.stringify(slotLocalState(old));
        }), "expansion changed retained geometry/local state");
        check(activeProject.slots.filter(slot => slot.col === 2).map(slot => slot.id).join() === "102,103,104",
          "expansion did not assign new-cell row-major ids from pre-resize maximum");
        api.captions.setSlotText(104, "protected");
        const protectedState = JSON.stringify(activeProject._state), session = appFSM.state;
        let rejected = false;
        try { api.layout.setGrid(2, 2); } catch { rejected = true; }
        check(rejected && JSON.stringify(activeProject._state) === protectedState && appFSM.state === session,
          "non-default removed slot was committed or reconciled");
        for (const invalid of [["2", 2], [0, 2], [2, 9], [2.5, 2]]) {
          rejected = false;
          try { api.layout.setGrid(...invalid); } catch { rejected = true; }
          check(rejected && JSON.stringify(activeProject._state) === protectedState && appFSM.state === session,
            "invalid grid input changed authority/session");
        }
        activeProject.initialize(createProjectState());
        api.layout.mergeSlots([activeProject.slots[0].id, activeProject.slots[1].id]);
        const merged = JSON.stringify(activeProject._state), mergedSession = appFSM.state;
        rejected = false;
        try { api.layout.setGrid(2, 1); } catch { rejected = true; }
        check(rejected && JSON.stringify(activeProject._state) === merged && appFSM.state === mergedSession,
          "crossing merged footprint was removed");
        const send = projectEFSM.send, render = renderDashboard;
        let renders = 0;
        try {
          projectEFSM.send = () => Object.freeze({ committed: false });
          renderDashboard = () => { renders++; };
          check(api.layout.setGrid(2, 2) === false && renders === 0, "uncommitted resize rendered or returned successful state");
        } finally { projectEFSM.send = send; renderDashboard = render; }
        check(!/activeProject|Number\(|makeSlots|buildGridResizeCandidate/.test(setLayoutApiGrid.toString()),
          "Application still owns grid calculation/current Backend state");
      } finally { activeProject.initialize(saved); renderDashboard(); }
    });

    await run(48, "Merge/split preserve one current payload and return official layout reads", async () => {
      const saved = projectClone(activeProject._state);
      try {
        const fresh = createProjectState();
        fresh.charts = [createChartModel({ id: 1, editor: { editable: true, objects: [] } })];
        fresh.nextId.chart = 2;
        fresh.slots[1].content.chart = 1;
        fresh.slots[1].caption = " exact text ";
        fresh.slots[1].content.imageSettings = { ...DEFAULT_IMAGE_SETTINGS, fit: "manual", x: 0 };
        activeProject.initialize(validateProjectObjectState(fresh, { requireSlots: true }));
        const original = slotLocalState(slotAt(1));
        appFSM.send("SELECT_SLOT", { slotId: 1, direction: "model-to-fsm" });
        const state = api.layout.mergeSlots([1, 0, 1]);
        check(!Array.isArray(state) && Object.isFrozen(state) && Object.isFrozen(state.visibleSlots) &&
          state.visibleSlots.length === 3, "merge did not return detached official layout state");
        check(slotAt(0).rowSpan === 1 && slotAt(0).colSpan === 2 && !slotAt(0).hidden && slotAt(1).hidden &&
          JSON.stringify(slotLocalState(slotAt(0))) === JSON.stringify(original) &&
          !slotHasNonDefaultLocalState(slotAt(1)) && activeProject.charts.length === 1 &&
          activeProject.charts[0].id === 1 && interfaceFSM.readState().selectedSlotId === 0,
          "merge did not transfer exactly one full payload/chart owner and reconcile the selected anchor");
        const unchanged = JSON.stringify(activeProject._state), stableSession = appFSM.state;
        for (const ids of [[], [0, 1], [0, 99], ["0", 2], [0, 2]]) {
          let rejected = false;
          try { api.layout.mergeSlots(ids); } catch { rejected = true; }
          check(rejected && JSON.stringify(activeProject._state) === unchanged && appFSM.state === stableSession,
            "invalid/hidden/non-rectangular merge partially changed authority/session");
        }
        const split = api.layout.splitSlots([0, 0]);
        check(split.visibleSlots.length === 4 && Object.isFrozen(split) &&
          JSON.stringify(slotLocalState(slotAt(0))) === JSON.stringify(original) &&
          slotAt(0).rowSpan === 1 && slotAt(0).colSpan === 1 && !slotAt(1).hidden &&
          !slotHasNonDefaultLocalState(slotAt(1)) && slotAt(1).rowSpan === 1 && slotAt(1).colSpan === 1,
          "split did not retain the full anchor payload and restore default visible cells");
        const afterSplit = JSON.stringify(activeProject._state), session = appFSM.state;
        let rejected = false;
        try { api.layout.splitSlots([0, 2]); } catch { rejected = true; }
        check(rejected && JSON.stringify(activeProject._state) === afterSplit && appFSM.state === session,
          "split silently filtered non-merged input");
        activeProject.initialize(createProjectState());
        slotAt(0).caption = "first"; slotAt(1).caption = "second";
        const twoOwners = JSON.stringify(activeProject._state);
        rejected = false;
        try { api.layout.mergeSlots([0, 1]); } catch { rejected = true; }
        check(rejected && JSON.stringify(activeProject._state) === twoOwners, "merge concatenated two non-default payloads");
        activeProject.initialize(createProjectState());
        api.layout.mergeSlots([0, 1]);
        api.layout.mergeSlots([2, 3]);
        const whole = api.layout.mergeSlots([0, 2]);
        check(whole.visibleSlots.length === 1 && slotAt(0).rowSpan === 2 && slotAt(0).colSpan === 2 &&
          api.layout.splitSlots([0]).visibleSlots.length === 4 &&
          activeProject.slots.every(slot => slot.rowSpan === 1 && slot.colSpan === 1 && !slot.hidden),
          "nested merged footprints did not combine/split without lost cells");
        for (const caption of ["", "슬롯 캡션"]) {
          activeProject.initialize(createProjectState());
          slotAt(1).caption = caption;
          api.layout.mergeSlots([0, 1]);
          check(slotAt(0).caption === caption, "merge normalized saved caption text instead of preserving it");
          api.layout.splitSlots([0]);
          check(slotAt(0).caption === caption, "split normalized saved caption text instead of preserving it");
        }
        activeProject.initialize(createProjectState());
        const send = projectEFSM.send, read = readLayoutApiState, render = renderDashboard;
        try {
          projectEFSM.send = function(event, payload) {
            if (event === "SLOTS_MERGED") slotAt(1).caption = "command-time";
            return send.call(this, event, payload);
          };
          check(api.layout.mergeSlots([0, 1]).visibleSlots.length === 3 && slotAt(0).caption === "command-time",
            "merge candidate came from an Application snapshot instead of command-time authority");
          projectEFSM.send = () => Object.freeze({ committed: false });
          readLayoutApiState = () => { throw Error("uncommitted success query"); };
          renderDashboard = () => { throw Error("uncommitted render"); };
          check(api.layout.mergeSlots([0]) === false && api.layout.splitSlots([0]) === false,
            "uncommitted command exposed success state");
        } finally { projectEFSM.send = send; readLayoutApiState = read; renderDashboard = render; }
        check(!/activeProject|try\s*\{|status\(|anchorId|restoredSlotIds/.test(
          mergeSlots.toString() + splitSlots.toString()), "Application still owns candidates/legacy returns or catches rejection");
      } finally { activeProject.initialize(saved); renderDashboard(); }
    });

    await run(49, "Image edits preserve valid zero, current fields and explicit target ownership", async () => {
      const saved = projectClone(activeProject._state);
      try {
        const target = activeProject.slots.find(slot => !slot.hidden);
        api.slots.reset(target.id);
        select(slotAt(target.id));
        api.slots.setContentType(api.slots.readSelected()?.id, "image");
        api.images.insertEmpty();
        const id = target.id, other = activeProject.slots.find(slot => !slot.hidden && slot.id !== id);
        const first = api.images.setSettings({ fit: "manual", scale: 0, x: 0, y: 0 });
        check(first.settings.scale === 1 && first.settings.x === 0 && first.settings.y === 0 &&
          Object.isFrozen(first.settings), "valid zero was replaced by a truthiness fallback");
        let next = api.images.setSettings({ fit: "invalid", scale: "invalid", x: Infinity, y: null });
        check(next.settings.fit === "manual" && next.settings.scale === 1 && next.settings.x === 0 && next.settings.y === 0,
          "invalid supplied image fields replaced current settings");
        next = api.images.setSettings({ fit: "contain", scale: 500, x: 180, y: -50, unknown: true });
        check(next.settings.scale === 1 && next.settings.x === 0 && next.settings.y === 0 &&
          !Object.prototype.hasOwnProperty.call(slotAt(id).content.imageSettings, "unknown"),
          "non-manual or undeclared numeric edits changed the candidate");
        api.images.setSettings({ fit: "manual" });
        const send = projectEFSM.send;
        try {
          projectEFSM.send = function(event, payload) {
            if (event === "SLOT_IMAGE_SETTINGS_CHANGED") slotAt(id).content.imageSettings.x = 88;
            return send.call(this, event, payload);
          };
          next = api.images.setSettings({ scale: 125 });
          check(next.settings.x === 88 && next.settings.scale === 125 && first.settings.x === 0,
            "image edit used a stale read projection rather than command-time current settings");
        } finally { projectEFSM.send = send; }
        if (other) {
          select(slotAt(other.id));
          const result = applyImageSettingsFromValues(id, { x: 0, y: 0 });
          check(result.slotId === id && result.settings.x === 0 && result.settings.y === 0 &&
            interfaceFSM.readState().selectedSlotId === other.id,
            "explicit image operation targeted or read back the unrelated current selection");
        }
        const before = JSON.stringify(activeProject._state), frontend = appFSM.state;
        let failed = false;
        try { applyImageSettingsFromValues(id, { get x() { throw Error("image getter failure"); } }); }
        catch { failed = true; }
        check(failed && JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
          "throwing image edit partially committed or reconciled success");
        for (const value of [Symbol("image conversion"), { valueOf() { throw Error("image conversion failure"); } }]) {
          failed = false;
          try { applyImageSettingsFromValues(id, { x: value }); } catch { failed = true; }
          check(failed && JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
            "image conversion exception was swallowed or partially committed");
        }
        for (const badId of [String(id), -999]) {
          failed = false;
          try { dispatchProjectCommand("SLOT_IMAGE_SETTINGS_CHANGED", { slotId: badId, settings: { x: 4 } }); }
          catch { failed = true; }
          check(failed && JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
            "invalid image identity was coerced or changed authority");
        }
        const query = readBackendProjection, sync = syncSlotImageElement;
        try {
          projectEFSM.send = () => Object.freeze({ committed: false });
          let reads = 0;
          readBackendProjection = function(kind, request) {
            if (kind === "project-api" && request.operation === "images.readEditor" && ++reads > 1)
              throw Error("uncommitted success read");
            return query(kind, request);
          };
          syncSlotImageElement = () => { throw Error("uncommitted image render"); };
          check(applyImageSettingsFromValues(id, { x: 9 }) === false && reads === 1,
            "uncommitted image operation exposed a success projection");
        } finally { projectEFSM.send = send; readBackendProjection = query; syncSlotImageElement = sync; }
      } finally { activeProject.initialize(saved); renderDashboard(); }
    });

    await run(50, "Print edits follow config limits, current fields and conversion failure boundaries", async () => {
      const saved = projectClone(activeProject._state), send = projectEFSM.send, read = readPrintApiSettings;
      try {
        api.print.setSettings({ width: 1400, heightMode: "explicit", height: 800, dpi: 300, format: "png" });
        const stale = api.print.readSettings();
        const values = Object.create({ width: 9999, format: "jpeg" });
        values.height = null; values.dpi = "invalid"; values.heightMode = "invalid"; values.unknown = true;
        let result = api.print.setSettings(values);
        check(result.width === 1400 && result.height === 800 && result.dpi === 300 && result.format === "png" &&
          !Object.prototype.hasOwnProperty.call(activeProject._state.export, "unknown"),
          "print edits consumed inherited/unknown fields or replaced invalid/NoValue fields");
        let reads = 0;
        result = api.print.setSettings({ get width() { reads++; return 0; }, dpi: Infinity });
        check(reads === 1 && result.width === BackendSettings.defaults.limits.export.logicalWidth[0] &&
          result.dpi === 300 && stale.width === 1400 && Object.isFrozen(result),
          "print numeric edits were read more than once or used truthiness/stale defaults");
        projectEFSM.send = function(event, payload) {
          if (event === "EXPORT_SETTINGS_CHANGED") activeProject._state.export.width = 1750;
          return send.call(this, event, payload);
        };
        check(api.print.setSettings({ dpi: 600 }).width === 1750, "print candidate came from an Application snapshot");
        projectEFSM.send = send;
        api.print.setSettings({ heightMode: "auto" });
        result = api.print.setSettings({ heightMode: "explicit" });
        check(result.height === BackendSettings.defaults.limits.export.logicalHeight[0],
          "explicit height without current height did not use configured lower bound");
        const before = JSON.stringify(activeProject._state), frontend = appFSM.state;
        for (const values of [{ get width() { throw Error("print getter"); } },
          { height: Symbol("conversion") }, { dpi: { valueOf() { throw Error("print conversion"); } } }]) {
          let failed = false;
          try { api.print.setSettings(values); } catch { failed = true; }
          check(failed && JSON.stringify(activeProject._state) === before && appFSM.state === frontend,
            "print getter/conversion failure partially committed or reconciled success");
        }
        projectEFSM.send = () => Object.freeze({ committed: false });
        readPrintApiSettings = () => { throw Error("uncommitted print success read"); };
        check(api.print.setSettings({ width: 1900 }) === false, "uncommitted print command exposed success settings");
      } finally {
        projectEFSM.send = send; readPrintApiSettings = read;
        activeProject.initialize(saved); renderDashboard();
      }
    });

    await run(51, "Reference caption lines, fonts and target geometry translate the supplied layout", async () => {
      const before = JSON.stringify(activeProject._state), originalLoad = document.fonts.load;
      const snapshot = {
        layout: { gridRows: 2, gridCols: 2, slotStyle: { referenceWidth: 80, aspect: 2, gap: 33, outerMargin: 500, radius: 44 } },
        annotations: { captions: { enabled: true, name: "HEAD", nameBold: true,
          text: "one two\n\nthree\n", afterText: "NEVER APPEND", settings: { fontFamily: "sans-serif", fontSize: 10, lineHeight: 2 } } },
        captionReferenceStyle: { padding: 8, dashboardGap: 7, borderHeight: 4, minimumTextWidth: 10 },
      };
      let loads = [], measures = [];
      try {
        document.fonts.load = async function(font) { loads.push(font); return []; };
        const read = await exportCaptionLayout(snapshot, (text, family, size, weight) => {
          check(loads.length === 2, "measurement ran before both required fonts resolved");
          measures.push({ text, family, size, weight }); return text.length * 10;
        });
        check(JSON.stringify(read.lines.map(line => line.text)) === JSON.stringify(["", "one", "two", "", "three", ""])  &&
          read.lines[0].prefix === "HEAD " && read.lines[0].prefixWidth === 50 &&
          read.lines.slice(1).every(line => line.prefix === "" && line.prefixWidth === 0),
          "prefix-only overflow retry, empty paragraphs or trailing newline changed");
        check(read.height === 16 + 6 * 20 + 4 && read.gap === 7 && read.fontSize === 10 &&
          measures.every(call => call.size === 10 && call.family === "sans-serif") &&
          !measures.some(call => call.text.includes("NEVER")), "caption used output scale/config/afterText instead of supplied reference input");
        snapshot.annotations.captions.name = "";
        snapshot.annotations.captions.text = "aVeryLongUnbreakableWord";
        const long = await exportCaptionLayout(snapshot, text => text.length * 10);
        check(long.lines.length === 1 && long.lines[0].text === snapshot.annotations.captions.text,
          "overlong word was dropped, split or retried indefinitely");
        snapshot.annotations.captions.text = "";
        check((await exportCaptionLayout(snapshot, () => 0)).lines.length === 1, "enabled empty caption lost its blank line");
        snapshot.annotations.captions.enabled = false;
        document.fonts.load = () => { throw Error("disabled caption requested fonts"); };
        const disabled = await exportCaptionLayout(snapshot, () => { throw Error("disabled caption measured"); });
        check(disabled.height === 0 && disabled.gap === 0 && disabled.lines.length === 0, "disabled caption reserved geometry");
        snapshot.annotations.captions.enabled = true;
        const failure = Error("font resolution failed"); let caught;
        document.fonts.load = async () => { throw failure; };
        try { await exportCaptionLayout(snapshot, () => 0); } catch (error) { caught = error; }
        check(caught === failure, "font failure was swallowed or replaced");
        const g = targetExportGeometry(snapshot.layout, 40), explicit = targetExportGeometry(snapshot.layout, 40, -1);
        check(g.scale === 0.5 && g.height === 20 && g.gap === 16.5 && g.radius === 22 && g.outerMargin === 9.8 &&
          explicit.height === -1, "target geometry silently clamped/defaulted supplied values or replaced invalid explicit height");
        check(JSON.stringify(activeProject._state) === before, "reference measurement changed Project authority");
      } finally { document.fonts.load = originalLoad; }
    });

    await run(52, "Target export uniformly scales one reference layout and rejects before download", async () => {
      const source = createTargetExportSnapshot, encode = exportCanvasBlob, click = HTMLAnchorElement.prototype.click;
      const before = JSON.stringify(activeProject._state);
      const captions = { enabled: true, name: "Caption", nameBold: false, text: "one two three four five six seven eight",
        afterText: "separate", settings: { fontFamily: "sans-serif", fontSize: 10, lineHeight: 2 } };
      const snapshot = {
        revision: 0, layout: { gridRows: 2, gridCols: 2, slotStyle: { referenceWidth: 200, aspect: 2, gap: 0, outerMargin: 0, radius: 0 } },
        annotations: { captions }, captionView: captions,
        captionReferenceStyle: { padding: 8, dashboardGap: 10, borderHeight: 2, minimumTextWidth: 10 },
        rasterLimits: { rasterDimension: 16384, rasterArea: 64000000 },
        slots: [], charts: [], images: [], labels: { enabled: false }, bordersVisible: false,
        dashboardStyle: { background: "#fff" }, captionStyle: { background: "#fff", color: "#000" },
      };
      let downloads = 0, sizes = [];
      try {
        createTargetExportSnapshot = () => snapshot;
        exportCanvasBlob = async canvas => { sizes.push([canvas.width, canvas.height]); return new Blob(["raster"]); };
        HTMLAnchorElement.prototype.click = () => { downloads++; };
        const one = await exportDashboardTarget({ width: 200, height: null, dpi: 96 });
        const dpiOnly = await exportDashboardTarget({ width: 200, height: null, dpi: 600 });
        const two = await exportDashboardTarget({ width: 400, height: null, dpi: 96 });
        check(one.outcome === "saved" && one.height === dpiOnly.height && two.height === one.height * 2 &&
          two.width === 400 && downloads === 3 && sizes[2][1] === two.height,
          "caption rewrapped at output width, DPI changed pixel geometry, or handoff returned different raster dimensions");
        snapshot.rasterLimits.rasterDimension = 300;
        check((await exportDashboardTarget({ width: 400 })).reason === "raster-limit" && downloads === 3,
          "supplied raster limits were ignored or rejected output downloaded");
        snapshot.rasterLimits.rasterDimension = 16384;
        captions.text = Array(30).fill("paragraph").join("\n");
        check((await exportDashboardTarget({ width: 200, height: 100 })).reason === "caption-height" && downloads === 3,
          "explicit total height was silently enlarged or auto-substituted");
        captions.enabled = false;
        snapshot.layout.slotStyle.gap = 1000;
        check((await exportDashboardTarget({ width: 200 })).reason === "grid-geometry" && downloads === 3,
          "nonpositive grid cell threw/downloaded instead of returning its declared rejection");
        check(JSON.stringify(activeProject._state) === before, "target render changed persistent state");
      } finally {
        createTargetExportSnapshot = source; exportCanvasBlob = encode; HTMLAnchorElement.prototype.click = click;
      }
    });

    await run(53, "Graph figures resolve only their supplied Project and export copied JSON bytes", async () => {
      const target = activeProject.slots.find(slot => !slot.hidden);
      api.slots.reset(target.id); select(slotAt(target.id)); api.slots.setContentType(api.slots.readSelected()?.id, "graph");
      const csv = createProjectCsv([["X", "Y"], ["11", "22"]], "figure-context.csv");
      api.graphs.addObject(csv.id);
      const source = projectClone(activeProject._state), chart = source.charts.find(item => item.id === slotAt(target.id).chart);
      source.assets.csvFiles.find(item => item.id === csv.id).rows[1] = ["101", "202"];
      source.appearance.uiPalette.paperColor = "#123456";
      const before = JSON.stringify(source), authority = JSON.stringify(activeProject._state), normalize = normalizeGlobalSettings;
      let figure;
      try {
        normalizeGlobalSettings = () => { throw Error("figure read attempted editor normalization/write"); };
        figure = chartFigure(chart, source);
      } finally { normalizeGlobalSettings = normalize; }
      const trace = figure.data.find(item => !item.meta?.fastFigureAxisPlaceholder);
      check(trace.x[0] === 101 && trace.y[0] === 202 && figure.layout.paper_bgcolor === "#123456",
        "figure mixed live CSV/palette into supplied Project");
      check(JSON.stringify(source) === before && JSON.stringify(activeProject._state) === authority,
        "figure calculation wrote supplied or live Project");
      const payload = appFSM.query("export", { operation: "graphs.exportPlotlyJson", slotId: target.id, stamp: "probe" });
      const exported = JSON.parse(new TextDecoder().decode(Uint8Array.from(payload.bytes)));
      check(Object.isFrozen(payload) && Object.isFrozen(payload.bytes) && payload.mime === "application/json" &&
        payload.name === `plotly-figure-${target.id}-probe.json` && exported.data[0].y[0] === 22,
        "export did not encode current same-project figure into immutable name/MIME/bytes");
      check(appFSM.query("export", { operation: "graphs.exportPlotlyJson", slotId: -999, stamp: "probe" }) === null,
        "missing graph did not return none");
      const imported = { data: [{ x: [1], y: [2] }], layout: { title: "original" },
        frames: [{ name: "frame", data: [{ y: [3] }] }], config: { scrollZoom: true } };
      chart.editor.editable = false; chart.graph.imported = imported;
      check(JSON.stringify(chartFigure(chart, source)) === JSON.stringify(imported),
        "noneditable imported figure/frames were regenerated or lost");
      source.assets.csvFiles.length = 0; chart.editor.editable = true;
      let missing = false;
      try { chartFigure(chart, source); } catch (_) { missing = true; }
      check(missing && JSON.stringify(activeProject._state) === authority, "missing supplied CSV fell back to live authority");
    });

    await run(54, "Plotly export owns one lifecycle, consumes copied payload and releases handoff resources", async () => {
      const create = URL.createObjectURL, revoke = URL.revokeObjectURL,
        click = HTMLAnchorElement.prototype.click, query = readBackendProjection;
      const before = JSON.stringify(activeProject._state);
      let created = [], revoked = [], clicked = [], calls = 0, fail = false;
      const failure = Error("expected JSON download handoff failure");
      try {
        URL.createObjectURL = blob => { const url = `blob:probe-${created.length}`; created.push({ url, blob }); return url; };
        URL.revokeObjectURL = url => revoked.push(url);
        HTMLAnchorElement.prototype.click = function () {
          check(appFSM.state.lifecycle === "exporting", "public JSON handoff ran outside export lifecycle");
          if (fail) throw failure;
          clicked.push(this.download);
          check(!revoked.includes(this.href), "resource revoked before browser handoff");
        };
        readBackendProjection = (kind, request) => {
          check(kind === "export" && request.operation === "graphs.exportPlotlyJson" && appFSM.state.lifecycle === "exporting",
            "JSON wrapper made an extra query or queried before lifecycle start");
          calls++; return query(kind, request);
        };
        check(await api.graphs.exportPlotlyJson() === undefined && calls === 1 && clicked.length === 1 &&
          revoked.includes(created[0]?.url) && appFSM.state.lifecycle === "ready",
          `successful handoff leaked owned URL/result/lifecycle: calls=${calls},clicks=${clicked.length},created=${created.length},revoked=${JSON.stringify(revoked)},state=${appFSM.state.lifecycle}`);
        const figure = JSON.parse(await created[0].blob.text());
        check(figure.data[0].y[0] === 22 && /^plotly-figure-\d+-.*\.json$/.test(clicked[0]), "copied figure/name changed in renderer");
        fail = true; let caught;
        try { await api.graphs.exportPlotlyJson(); } catch (error) { caught = error; }
        check(caught === failure && revoked.includes(created[1]?.url) && appFSM.state.lifecycle === "ready",
          "handoff failure was swallowed, resource leaked or lifecycle stuck");
        fail = false;
        const pending = appFSM.run("exporting", "JSON_BUSY_PROBE", () => api.graphs.exportPlotlyJson());
        check((await pending.then(() => null, error => error)) && calls === 2 && appFSM.state.lifecycle === "ready",
          "busy public export queried/reentered lifecycle");
        readBackendProjection = () => null;
        check(await api.graphs.exportPlotlyJson() === undefined && created.length === 2,
          "missing query payload allocated/downloaded a resource");
        check(JSON.stringify(activeProject._state) === before, "export changed persistent Project");
        check(!/activeProject|getSelectedSlot|getChart|chartFigure/.test(exportSelectedGraph.toString() + downloadPlotlyJson.toString()) &&
          !/activeProject|appFSM|chartFigure|getProjectCsv/.test(downloadExportPayload.toString()),
          "Application/renderer export directly reads Backend domain state");
      } finally {
        URL.createObjectURL = create; URL.revokeObjectURL = revoke;
        HTMLAnchorElement.prototype.click = click; readBackendProjection = query;
      }
    });

    await run(55, "FFSX packages real references from one supplied Project and preserves conversion views", async () => {
      const source = projectClone(activeProject._state), slot = source.slots.find(item => item.id === selectedSlotId),
        chart = source.charts.find(item => item.id === slot.chart), csvId = chart.editor.objects[0].csvId,
        csv = source.assets.csvFiles.find(item => item.id === csvId);
      chart.editor.objects.push(projectClone(chart.editor.objects[0]));
      csv.bytesBase64 = ffpxBytesToBase64(new TextEncoder().encode("X,Y\n303,404\n"));
      const before = JSON.stringify(source), authority = JSON.stringify(activeProject._state);
      const bundle = ffsxBuildSlot(slot, chart, source);
      check(JSON.stringify(source) === before, "FFSX builder mutated the supplied Project");
      check(bundle.manifest.csvFiles.length === 1 && bundle.manifest.chart.id === undefined &&
        bundle.manifest.chart.editor.objects.every(object => object.csvId === 1),
        "FFSX did not deduplicate/remap real references or leaked Project chart id");
      check(bundle.manifest.csvFiles[0].dataRef === "assets/data/csv-1.csv", "FFSX dataRef differs from current-version pseudocode");
      const read = await ffsxReadSlot(new File([ffpxZipStore(bundle.assets)], "context.ffsx"));
      check(read.csvFiles.length === 1 && read.csvFiles[0].rows[1][1] === "404" &&
        read.chart.editor.objects.every(object => object.csvId === 1), "package bytes came from live CSV or local references broke");
      chart.editor.editable = false;
      check(ffsxBuildSlot(slot, chart, source).manifest.csvFiles.length === 1,
        "frozen real-CSV graph was treated as conversion data");
      source.assets.csvFiles = []; let rejected = false;
      try { ffsxBuildSlot(slot, chart, source); } catch (_) { rejected = true; }
      check(rejected, "frozen dangling real CSV bypassed reference validation");
      chart.editor.conversionRows = [["X", "Y"], ["1", "2"]];
      chart.editor.objects.forEach(object => { object.csvId = 999999; });
      chart.graph.imported = { data: [{ x: [1], y: [2] }], layout: {}, frames: [{ name: "kept", data: [] }] };
      const converted = ffsxBuildSlot(slot, chart, source);
      check(converted.manifest.csvFiles.length === 0 && converted.assets.length === 2 &&
        converted.manifest.chart.editor.objects[0].csvId === 999999 &&
        converted.manifest.chart.graph.imported.frames[0].name === "kept",
        "conversion views were resolved/remapped as fake CSVs or imported frames lost");
      chart.editor.objects = []; delete chart.editor.conversionRows; chart.editor.editable = true;
      const blank = await ffsxReadSlot(new File([ffpxZipStore(ffsxBuildSlot(slot, chart, source).assets)], "blank-query.ffsx"));
      check(blank.csvFiles.length === 0 && blank.chart.editor.objects.length === 0, "blank chart lacks required empty asset document");
      const payload = appFSM.query("export", { operation: "graphs.exportFfsx", slotId: slot.id, stamp: "probe" });
      check(Object.isFrozen(payload) && Object.isFrozen(payload.entries) && payload.entries.every(entry =>
        Object.isFrozen(entry) && Object.isFrozen(entry.data)) && payload.name === `fast-figure-slot-${slot.id}-probe.ffsx` &&
        payload.mime === "application/vnd.fast-figure-slot", "query did not detach/freeze copied package entries");
      check(appFSM.query("export", { operation: "graphs.exportFfsx", slotId: -999 }) === null &&
        JSON.stringify(activeProject._state) === authority && before !== JSON.stringify(source),
        "package/export query changed authority or missing target semantics");
    });

    await run(56, "Public FFSX export queries once and hands off only copied ZIP entries", async () => {
      const create = URL.createObjectURL, revoke = URL.revokeObjectURL, click = HTMLAnchorElement.prototype.click,
        query = readBackendProjection, before = JSON.stringify(activeProject._state), failure = Error("FFSX handoff failed");
      let calls = 0, blob, releases = [], fail = false, clicks = 0;
      try {
        URL.createObjectURL = value => { blob = value; return "blob:ffsx-owned"; };
        URL.revokeObjectURL = url => releases.push(url);
        HTMLAnchorElement.prototype.click = function () {
          check(appFSM.state.lifecycle === "exporting" && /^fast-figure-slot-.*\.ffsx$/.test(this.download), "FFSX handoff/name outside lifecycle");
          if (fail) throw failure;
          clicks++;
        };
        readBackendProjection = (kind, request) => {
          check(kind === "export" && request.operation === "graphs.exportFfsx" && appFSM.state.lifecycle === "exporting", "FFSX bypassed official query/lifecycle");
          calls++; return query(kind, request);
        };
        check(await api.graphs.exportFfsx() === undefined && calls === 1 && clicks === 1 &&
          releases.includes("blob:ffsx-owned") && appFSM.state.lifecycle === "ready", "FFSX leaked result/resource/lifecycle");
        readBackendProjection = () => { throw Error("renderer reread Backend"); };
        const read = await ffsxReadSlot(new File([blob], "download.ffsx"));
        check(blob.type === "application/vnd.fast-figure-slot" && read.csvFiles.length === 1, "copied entry handoff did not encode readable FFSX");
        readBackendProjection = query; fail = true; let caught;
        try { await api.graphs.exportFfsx(); } catch (error) { caught = error; }
        check(caught === failure && releases.filter(url => url === "blob:ffsx-owned").length === 2 &&
          appFSM.state.lifecycle === "ready", "FFSX failure swallowed or resource/lifecycle leaked");
        readBackendProjection = () => null; fail = false;
        check(await api.graphs.exportFfsx() === undefined && clicks === 1, "missing target caused an FFSX handoff");
        check(JSON.stringify(activeProject._state) === before && !/getSelectedSlot|getChart|activeProject|status\(/.test(downloadSlotFfsx.toString()),
          "FFSX Application wrapper owns Backend/status state");
      } finally { URL.createObjectURL = create; URL.revokeObjectURL = revoke;
        HTMLAnchorElement.prototype.click = click; readBackendProjection = query; }
    });

    await run(57, "Original asset export returns detached immutable bytes/name/MIME without mutation", async () => {
      const image = createProjectImage(new TextEncoder().encode(
        '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"/>'), "original-export.svg", "image/svg+xml");
      const source = activeProject._state, asset = source.assets.csvFiles.find(item => item.bytesBase64),
        path = projectAssetPath(asset), original = asset.bytesBase64, mime = asset.mime,
        before = JSON.stringify(source), frontend = JSON.stringify(interfaceFSM.readState()),
        create = URL.createObjectURL;
      try {
        URL.createObjectURL = () => { throw Error("Backend query allocated a resource"); };
        const payload = appFSM.query("export", { operation: "assets.download", path });
        check(Object.isFrozen(payload) && Object.isFrozen(payload.bytes) && payload.name === asset.name &&
          payload.mime === (mime || "application/octet-stream") &&
          ffpxBytesToBase64(Uint8Array.from(payload.bytes)) === original, "CSV original bytes/name/MIME changed");
        asset.bytesBase64 = ffpxBytesToBase64(new Uint8Array([0, 255, 17])); asset.mime = "";
        const fallback = appFSM.query("export", { operation: "assets.download", path });
        check(fallback !== payload && fallback.bytes !== payload.bytes && fallback.mime === "application/octet-stream" &&
          JSON.stringify(fallback.bytes) === "[0,255,17]" &&
          ffpxBytesToBase64(Uint8Array.from(payload.bytes)) === original, "query reused a read store or lost original bytes");
        asset.bytesBase64 = "";
        for (const target of [path, "/", "/missing-original-asset.csv", null])
          check(appFSM.query("export", { operation: "assets.download", path: target }) === null,
            "absent/directory/no-byte target did not return none");
        asset.bytesBase64 = "invalid base64 %"; let caught;
        try { appFSM.query("export", { operation: "assets.download", path }); } catch (error) { caught = error; }
        check(caught, "invalid byte encoding was silently repaired or swallowed");
        const imagePayload = appFSM.query("export", { operation: "assets.download", path: projectAssetPath(image) });
        check(imagePayload.name === image.name && imagePayload.mime === image.mime &&
          ffpxBytesToBase64(Uint8Array.from(imagePayload.bytes)) === image.bytesBase64, "image export regenerated original bytes");
      } finally { asset.bytesBase64 = original; asset.mime = mime; URL.createObjectURL = create; }
      check(JSON.stringify(source) === before && JSON.stringify(interfaceFSM.readState()) === frontend,
        "export query changed Project or selection");
    });

    await run(58, "Public original download owns lifecycle, copied handoff and failure cleanup", async () => {
      const asset = activeProject._state.assets.csvFiles.find(item => item.bytesBase64), path = projectAssetPath(asset);
      api.assets.selectCsv(path);
      const selection = () => {
        const state = interfaceFSM.readState();
        return JSON.stringify([state.selectedSlotId, state.assetPath, state.assetSelection, state.graphObjectIndex, state.workspace]);
      };
      const before = JSON.stringify(activeProject._state), frontend = selection(),
        create = URL.createObjectURL, revoke = URL.revokeObjectURL, click = HTMLAnchorElement.prototype.click,
        element = document.createElement, query = readBackendProjection, failure = Error("original download failure");
      let calls = 0, created = [], released = [], clicked = [], fail = false, failElement = false;
      try {
        URL.createObjectURL = blob => { const url = `blob:original-${created.length}`; created.push({ url, blob }); return url; };
        URL.revokeObjectURL = url => released.push(url);
        HTMLAnchorElement.prototype.click = function () {
          check(appFSM.state.lifecycle === "exporting" && !released.includes(this.href), "asset handoff outside lifecycle or early release");
          if (fail) throw failure;
          clicked.push(this.download);
        };
        document.createElement = function (tag, ...args) {
          if (failElement && tag === "a") throw failure;
          return element.call(this, tag, ...args);
        };
        readBackendProjection = (kind, request) => {
          check(kind === "export" && request.operation === "assets.download" && request.path === path &&
            appFSM.state.lifecycle === "exporting", "asset wrapper bypassed official query/current selection binding/lifecycle");
          calls++; return query(kind, request);
        };
        check(await api.assets.download() === true && calls === 1 && clicked[0] === asset.name &&
          released.includes(created[0]?.url) && appFSM.state.lifecycle === "ready", "successful original handoff result/resource/lifecycle wrong");
        check(created[0].blob.type === (asset.mime || "application/octet-stream") &&
          ffpxBytesToBase64(new Uint8Array(await created[0].blob.arrayBuffer())) === asset.bytesBase64,
          "renderer did not consume copied original bytes/MIME");
        fail = true; let caught;
        try { await api.assets.download(path); } catch (error) { caught = error; }
        check(caught === failure && released.includes(created[1]?.url) && appFSM.state.lifecycle === "ready",
          "asset handoff failure swallowed or URL/lifecycle leaked");
        fail = false; failElement = true; caught = null;
        try { await api.assets.download(path); } catch (error) { caught = error; }
        check(caught === failure && released.includes(created[2]?.url) && appFSM.state.lifecycle === "ready",
          "resource leaked when anchor creation failed");
        failElement = false;
        const busy = await appFSM.run("exporting", "ORIGINAL_BUSY_PROBE", () => api.assets.download(path)).then(() => null, error => error);
        check(busy && calls === 3 && appFSM.state.lifecycle === "ready", "busy download queried/reentered lifecycle");
        readBackendProjection = () => null;
        check(await api.assets.download(null) === false && created.length === 3, "missing original allocated a resource or wrong result");
        readBackendProjection = () => { throw failure; }; caught = null;
        try { await api.assets.download(path); } catch (error) { caught = error; }
        check(caught === failure && created.length === 3 && appFSM.state.lifecycle === "ready", "query failure swallowed or allocated resources");
        check(JSON.stringify(activeProject._state) === before && selection() === frontend &&
          !/activeProject|projectVfs|ffpxBase64ToBytes|status\(/.test(downloadProjectAsset.toString()),
          "original download changed selection/Project or Application owns Backend/status semantics");
      } finally {
        URL.createObjectURL = create; URL.revokeObjectURL = revoke; HTMLAnchorElement.prototype.click = click;
        document.createElement = element; readBackendProjection = query;
      }
    });

    await run(59, "FFPX query packages one supplied Project without normalizing authority", async () => {
      const source = projectClone(activeProject._state), live = JSON.stringify(activeProject._state);
      source.meta.projectName = "supplied FFPX";
      const before = JSON.stringify(source), bundle = ffpxBuildProject(source),
        roundtrip = await ffpxReadProject(new File([ffpxZipStore(bundle.assets)], "supplied.ffpx"));
      check(roundtrip.projectName === "supplied FFPX" && bundle.manifest.projectName === "supplied FFPX" &&
        JSON.stringify(source) === before && JSON.stringify(activeProject._state) === live,
        "FFPX used live metadata or mutated its read source");
      const stamp = "2030-01-02T03-04-05-000Z", payload = appFSM.query("export", { operation: "project.exportFile", stamp }),
        again = appFSM.query("export", { operation: "project.exportFile", stamp });
      check(payload.mime === "application/vnd.fast-figure-project" && payload.name.endsWith(`-${stamp}.ffpx`) &&
        Object.isFrozen(payload) && Object.isFrozen(payload.entries) && payload.entries !== again.entries &&
        payload.entries.every((entry, i) => Object.isFrozen(entry) && Object.isFrozen(entry.data) && entry.data !== again.entries[i].data),
        "FFPX query did not return detached immutable entries/name/MIME");
      const invalid = projectClone(source); invalid.layout.gridRows = 0;
      let failed = false;
      try { ffpxBuildProject(invalid); } catch (_) { failed = true; }
      check(failed, "invalid whole Project was packaged");
      const trimmed = projectClone(source), chart = trimmed.charts.find(item => chartCsvIds(item).length),
        referenced = chart && trimmed.assets.csvFiles.find(item => item.id === chartCsvIds(chart)[0]);
      check(referenced, "FFPX reference fixture missing");
      referenced.directory = "/assets/trash";
      failed = false; const trashBefore = JSON.stringify(trimmed);
      try { ffpxBuildProject(trimmed); } catch (_) { failed = true; }
      check(failed && JSON.stringify(trimmed) === trashBefore, "FFPX retained a reference to excluded trash or mutated failure source");
      check(!/projectObjects|getProjectCsv|getProjectImage/.test(ffpxBuildProject.toString()) &&
        JSON.stringify(activeProject._state) === live, "FFPX builder consulted global registry or query changed authority");
    });

    await run(60, "Public project export gates selection and owns copied ZIP handoff lifecycle", async () => {
      const create = URL.createObjectURL, revoke = URL.revokeObjectURL,
        click = HTMLAnchorElement.prototype.click, query = readBackendProjection,
        initial = interfaceFSM.readState().selectedSlotId;
      let created = [], revoked = [], downloads = [], calls = 0, fail = false;
      const failure = Error("expected FFPX handoff failure");
      try {
        URL.createObjectURL = blob => { const url = `blob:ffpx-${created.length}`; created.push({ url, blob }); return url; };
        URL.revokeObjectURL = url => revoked.push(url);
        HTMLAnchorElement.prototype.click = function () {
          check(appFSM.state.lifecycle === "exporting", "project handoff outside lifecycle");
          if (fail) throw failure;
          downloads.push(this.download);
          check(!revoked.includes(this.href), "FFPX URL released before handoff");
        };
        readBackendProjection = (kind, request) => {
          if (kind !== "export") return query(kind, request);
          check(request.operation === "project.exportFile" && appFSM.state.lifecycle === "exporting" &&
            /^\d{4}-.*Z$/.test(request.stamp) && !/[:.]/.test(request.stamp), "project query outside lifecycle or wrong request");
          calls++; return query(kind, request);
        };
        const slot = activeProject.slots.find(item => !item.hidden);
        select(slot);
        check(await api.project.exportFile() === undefined && calls === 0 && created.length === 0 &&
          interfaceFSM.readState().selectedSlotId === slot.id && appFSM.state.lifecycle === "ready",
          "selected-slot precondition queried/downloaded or changed selection/result");
        api.slots.select(null);
        const before = JSON.stringify(activeProject._state);
        check(await api.project.exportFile() === undefined && calls === 1 && created.length === 1 &&
          revoked.includes(created[0].url) && downloads[0].endsWith(".ffpx") && appFSM.state.lifecycle === "ready",
          "project export result/resource/lifecycle mismatch");
        const payload = await ffpxReadProject(new File([created[0].blob], "download.ffpx"));
        check(payload.projectName === activeProject.projectName, "handoff ZIP changed Project metadata");
        fail = true; let caught;
        try { await api.project.exportFile(); } catch (error) { caught = error; }
        check(caught === failure && revoked.includes(created[1]?.url) && appFSM.state.lifecycle === "ready",
          "project handoff swallowed failure or leaked resource/lifecycle");
        const busy = await appFSM.run("exporting", "FFPX_BUSY_PROBE", () => api.project.exportFile()).then(() => null, error => error);
        check(busy && calls === 2 && appFSM.state.lifecycle === "ready", "busy project export queried/reentered lifecycle");
        readBackendProjection = () => { throw failure; }; caught = null;
        try { await api.project.exportFile(); } catch (error) { caught = error; }
        check(caught === failure && created.length === 2 && JSON.stringify(activeProject._state) === before &&
          interfaceFSM.readState().selectedSlotId === null && appFSM.state.lifecycle === "ready",
          "query failure swallowed, allocated resources or changed Project/selection");
        check(!/activeProject|ffpxBuildProject|ffpxZipStore|new Blob|createObjectURL/.test(downloadProject.toString()),
          "Application owns Backend/renderer project export work");
      } finally {
        URL.createObjectURL = create; URL.revokeObjectURL = revoke;
        HTMLAnchorElement.prototype.click = click; readBackendProjection = query;
        api.slots.select(initial);
      }
    });

    await run(61, "Asset target query copies original positions and excludes only conversion views", () => {
      const before = JSON.stringify(activeProject._state), csv = activeProject.csvFiles[0], path = projectAssetPath(csv),
        first = appFSM.query("project-api", { operation: "assets.readDeletionTarget", path }),
        second = appFSM.query("project-api", { operation: "assets.readDeletionTarget", path });
      check(first.target.id === csv.id && first.path === path && first.kind === "csv" &&
        Object.isFrozen(first.target) && Object.isFrozen(first.references) &&
        Object.isFrozen(first.target.rows) && first.target !== second.target && first.target.rows !== second.target.rows,
        "target query is not a fresh immutable copy");
      check(appFSM.query("project-api", { operation: "assets.readDeletionTarget", path: null }) === null &&
        appFSM.query("project-api", { operation: "assets.readDeletionTarget", path: "/assets/csv" }) === null,
        "missing/directory query produced an asset");
      const state = projectClone(activeProject._state), object = { csvId: csv.id },
        real = { id: 801, editor: { editable: false, objects: [object, { csvId: -1 }, { ...object }] } },
        conversion = { id: 802, editor: { editable: false, conversionRows: [], objects: [object] } };
      state.charts = [real, conversion]; state.slots = [{ id: 803, content: { imageId: 804 } }];
      const refs = collectAssetReferences(new Set([csv.id]), new Set([804]), state);
      check(refs.length === 3 && refs[0].chartId === 801 && refs[0].originalObjectIndex === 0 &&
        refs[1].originalObjectIndex === 2 && refs[2].kind === "image" && refs[2].slotId === 803,
        "real frozen/duplicate references or conversion/image scope is wrong");
      check(JSON.stringify(activeProject._state) === before, "asset query/reference collection mutated authority");
    });

    await run(62, "Header edit uses current candidate, actual changed path and commit-gated read", () => {
      const saved = projectClone(activeProject._state), query = readBackendProjection,
        render = renderDashboard, send = projectEFSM.send, initialize = activeProject.initialize,
        validate = validateProjectObjectState;
      const csv = activeProject.csvFiles.find((item) => item.rows.length >= 2);
      check(csv, "header fixture requires a nonempty CSV");
      const id = csv.id, stable = (item) => JSON.stringify({ id: item.id, path: projectAssetPath(item),
        rows: item.rows, bytes: item.bytesBase64, mime: item.mime });
      let queries = [], renders = 0, commits = 0, last, reject = false;
      try {
        const prepared = projectClone(saved);
        prepared.assets.csvFiles.find((item) => item.id === id).headerLines = 0;
        initialize.call(activeProject, prepared);
        renderDashboard = () => { renders++; };
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        projectEFSM.send = function (event, payload) {
          check(event === "DATA_OBJECT_REPLACED" && Number.isInteger(payload.csvId) &&
            !Object.hasOwn(payload, "model") && !Object.hasOwn(payload, "candidate"), "Application supplied asset state");
          if (reject) return { committed: false };
          last = send.call(this, event, payload); return last;
        };
        readBackendProjection = (kind, request) => {
          if (kind === "project-api" && request.operation === "assets.readDeletionTarget") {
            queries.push(request.path);
            check(commits > 0 && request.path === last.changed.assets[0].path, "query did not use actual committed path");
          }
          return query(kind, request);
        };
        const identity = stable(csv);
        check(api.graphs.setHeaderLines(id, 2.9) === 2 && commits === 1 && queries.length === 1 && renders === 1,
          "header edit did not commit once then read/render");
        check(stable(getProjectCsv(id)) === identity && Object.isFrozen(last.changed.assets[0].owners) &&
          last.changed.assets[0].id === id && last.changed.csvIds.includes(id), "header changed identity/bytes/rows or wrong facts");
        for (const [value, expected] of [[Infinity, 0], [-4, 0], ["bad", 0], [99999, csv.rows.length]])
          check(api.graphs.setHeaderLines(id, value) === expected, "header clamp/finite fallback mismatch");
        const failure = Error("expected header conversion failure"), before = JSON.stringify(activeProject._state),
          count = commits, reads = queries.length, painted = renders;
        let caught;
        try { api.graphs.setHeaderLines(id, { valueOf() { throw failure; } }); } catch (error) { caught = error; }
        check(caught === failure && commits === count && queries.length === reads && renders === painted &&
          JSON.stringify(activeProject._state) === before, "conversion failure committed or ran success work");
        validateProjectObjectState = () => { throw failure; }; caught = null;
        try { api.graphs.setHeaderLines(id, 1); } catch (error) { caught = error; }
        validateProjectObjectState = validate;
        check(caught === failure && commits === count && queries.length === reads &&
          JSON.stringify(activeProject._state) === before, "validation failure partially changed authority");
        reject = true;
        check(api.graphs.setHeaderLines(id, 1).committed === false && queries.length === reads && renders === painted,
          "noncommit performed a success read/render");
        reject = false; caught = null;
        try { api.graphs.setHeaderLines(-1, 1); } catch (error) { caught = error; }
        check(caught && commits === count && queries.length === reads && JSON.stringify(activeProject._state) === before,
          "missing current CSV committed or queried success");
        let attempts = 0;
        const result = api.graphs.setHeaderLines(id, { valueOf() {
          if (!attempts++) {
            const newer = projectClone(activeProject._state); newer.meta.projectName = "new authority during header conversion";
            initialize.call(activeProject, newer);
          }
          return 1;
        } });
        check(result === 1 && attempts === 2 && activeProject.projectName === "new authority during header conversion",
          "stale header candidate overwrote a newer authority instead of recalculating");
        check(!/getProjectCsv|activeProject|headerLineCount|rebuildEditableGraph/.test(graphEditorHeaderLines.toString()),
          "Application still owns header calculation or persistent mutation");
      } finally {
        readBackendProjection = query; renderDashboard = render; projectEFSM.send = send;
        activeProject.initialize = initialize; validateProjectObjectState = validate;
        activeProject.initialize(saved);
      }
    });

    await run(63, "CSV selection queries copied authority then sends only one revalidated Frontend event", () => {
      const query = readBackendProjection, send = interfaceFSM.send, validate = validateFrontendIntent,
        saved = projectClone(activeProject._state), session = interfaceFSM.state,
        csv = activeProject.csvFiles[0], path = projectAssetPath(csv), before = JSON.stringify(activeProject._state),
        slot = selectedSlotId, workspace = appFSM.state.workspace;
      let reads = 0, events = [], projection, reject = false, queryError = null, adapterError = null, stale = false;
      const failure = Error("expected CSV selection error"), publications = [],
        unsubscribe = interfaceFSM.subscribe((state, event) => {
          if (event.startsWith("SELECT_ASSET")) publications.push(state);
        });
      try {
        // The final receipt must not expose the graph selection that this intent clears.
        interfaceFSM.state = Object.freeze({ ...interfaceFSM.state, graphObject: "selected", graphObjectIndex: 0 });
        readBackendProjection = (kind, request) => {
          if (kind === "project-api" && request.operation === "assets.readDeletionTarget") {
            reads++;
            if (queryError) throw queryError;
            const result = query(kind, request);
            if (stale) {
              const newer = projectClone(activeProject._state);
              newer.assets.csvFiles.find((item) => item.id === csv.id).name = "renamed-after-selection-query.csv";
              activeProject.initialize(newer);
            }
            projection = result;
            return result;
          }
          return query(kind, request);
        };
        validateFrontendIntent = (event, payload) => reject && event === "SELECT_ASSET"
          ? Object.freeze({ event, accepted: false }) : validate(event, payload);
        interfaceFSM.send = function (event, payload) {
          events.push(event);
          if (adapterError) throw adapterError;
          check(event === "SELECT_ASSET" && payload.kind === "csv" && payload.path === path &&
            !Object.hasOwn(payload, "target") && !Object.hasOwn(payload, "candidate"), "selection supplied domain state or separate clear event");
          return send.call(this, event, payload);
        };
        const selected = api.assets.selectCsv(path);
        check(selected === projection.target && Object.isFrozen(selected) && selected !== getProjectCsv(csv.id) &&
          selected.rows !== getProjectCsv(csv.id).rows && reads === 1 && events.join() === "SELECT_ASSET",
          "CSV selection did not return detached query target via exactly one event");
        check(appFSM.state.assetPath === path && appFSM.state.assetSelection === "csv" &&
          appFSM.state.graphObjectIndex === null && appFSM.state.graphObject === "none" &&
          selectedSlotId === slot && appFSM.state.workspace === workspace && JSON.stringify(activeProject._state) === before,
          "selection changed Project/slot/workspace or failed to clear graph selection");
        check(publications.length === 1 && publications[0] === interfaceFSM.state &&
          publications[0].graphObject === "none" && publications[0].graphObjectIndex === null,
          "selection published an intermediate state instead of one final receipt");
        const priorRevision = interfaceFSM.state.revision;
        check(api.assets.selectCsv(path)?.id === csv.id && interfaceFSM.state.revision === priorRevision + 1 &&
          publications.length === 2 && publications[1] === interfaceFSM.state,
          "accepted repeat selection did not publish exactly one final revision receipt");
        const stable = interfaceFSM.state, count = events.length;
        check(api.assets.selectCsv("/missing.csv") === null && api.assets.selectCsv("/assets/csv") === null &&
          events.length === count && interfaceFSM.state === stable, "invalid CSV selection changed Frontend");
        reject = true;
        check(api.assets.selectCsv(path) === null && interfaceFSM.state === stable && events.length === count && publications.length === 2,
          "rejected repeat selection reported success or published old selection");
        reject = false;
        queryError = failure; let caught;
        try { api.assets.selectCsv(path); } catch (error) { caught = error; }
        check(caught === failure && events.length === count && interfaceFSM.state === stable, "query failure was swallowed or selected");
        queryError = null; adapterError = failure; caught = null;
        try { api.assets.selectCsv(path); } catch (error) { caught = error; }
        check(caught === failure && interfaceFSM.state === stable, "adapter failure was swallowed or changed Frontend");
        adapterError = null; stale = true;
        check(api.assets.selectCsv(path) === null && interfaceFSM.state === stable,
          "stale query target bypassed Backend reference revalidation");
        check(!/projectVfs|getProjectCsv|activeProject|CLEAR_GRAPH_OBJECT|notify\(/.test(selectProjectCsv.toString()),
          "Application CSV selection owns Backend resolution or separate legacy effects");
      } finally {
        unsubscribe(); readBackendProjection = query; interfaceFSM.send = send; validateFrontendIntent = validate;
        activeProject.initialize(saved); interfaceFSM.state = session;
      }
    });

    await run(64, "Official graph read separates current CSV, object columns and immutable chart", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId;
      try {
        const slot = activeProject.slots.find((item) => !item.hidden && item.contentType !== "image");
        api.slots.reset(slot.id); select(slotAt(slot.id));
        const first = createProjectCsv([["X", "Y", "Z"], [1, 2, 3]], "graph-read-object.csv"),
          second = createProjectCsv([["Only"], [7]], "graph-read-current.csv");
        api.graphs.addObject(first.id);
        const chartId = slotAt(slot.id).chart, request = { operation: "graphs.readData", chartId,
          frontendState: { assetSelection: "csv", assetPath: projectAssetPath(second), graphObjectIndex: 0 } },
          before = JSON.stringify(activeProject._state), read = appFSM.query("project-api", request),
          again = appFSM.query("project-api", request);
        check(read.chart.id === chartId && read.selectedIndex === 0 && read.currentCsv.id === second.id &&
          read.columns.length === 1 && read.objectColumns.length === 3 && read.objects[0].csvId === first.id,
          "graph read mixed current CSV with object reference or lost explicit owner");
        check(Object.isFrozen(read.chart.editor.objects[0]) && Object.isFrozen(read.currentCsv.rows[0]) &&
          read.chart !== again.chart && read.chart !== getChart(chartId) && read.objects !== getChart(chartId).editor.objects &&
          JSON.stringify(activeProject._state) === before, "graph read aliases authority, is mutable or repairs live state");
        const absent = appFSM.query("project-api", { operation: "graphs.readData", chartId: -1 });
        check(absent.chart === null && absent.objects.length === 0 && absent.selectedIndex === null &&
          absent.currentCsv === null && absent.objectColumns.length === 0, "missing graph projection mismatch");
        getChart(chartId).editor.editable = false;
        const frozen = appFSM.query("project-api", request);
        check(frozen.selectedIndex === null && frozen.objectColumns.length === 0 && frozen.currentCsv.id === second.id,
          "non-editable graph supplied editable object columns or replaced current CSV");
      } finally { activeProject.initialize(saved); selectedSlotId = selected; interfaceFSM.state = session; }
    });

    await run(65, "One-object edit calculates current candidate, retries and gates copied success read", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, query = readBackendProjection, render = renderDashboard,
        send = projectEFSM.send, validate = validateProjectObjectState, rebuild = rebuildEditableGraph,
        reconcile = interfaceFSM.reconcileProjectResult;
      let commits = 0, successReads = 0, renders = 0, reconciliations = 0, result;
      try {
        const slot = activeProject.slots.find((item) => !item.hidden && item.contentType !== "image");
        api.slots.reset(slot.id); select(slotAt(slot.id));
        const first = createProjectCsv([["X", "Y", "Z"], [1, 2, 3]], "object-edit-first.csv"),
          second = createProjectCsv([["Only"], [7]], "object-edit-second.csv");
        api.graphs.addObject(first.id); api.graphs.addObject(first.id);
        const chartId = slotAt(slot.id).chart, assetPath = interfaceFSM.state.assetPath;
        getChart(chartId).editor.objects[1].plotlyTrace = { meta: { retained: "extension" } };
        const other = JSON.stringify(getChart(chartId).editor.objects[1]);
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        renderDashboard = () => { renders++; };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        readBackendProjection = (kind, request) => {
          if (kind === "project-api" && request.operation === "graphs.readData" && Object.hasOwn(request, "chartId")) successReads++;
          return query(kind, request);
        };
        projectEFSM.send = function (event, payload) {
          if (event === "GRAPH_OBJECTS_REPLACED") check(payload.operation === "graphs.setObjectValues" &&
            payload.chartId === chartId && !Object.hasOwn(payload, "objects") && !Object.hasOwn(payload, "candidate"),
            "Application supplies candidate/objects or wrong scalar command");
          return result = send.call(this, event, payload);
        };
        const edited = api.graphs.setObjectValues(0, { color: "rgb(1, 2, 3)", legendName: "", lineDash: "invalid", markerSymbol: "invalid",
          lineWidth: 999, markerSize: 0, barOpacity: Infinity, barLineWidth: 0, csvId: -1, x: "bad" });
        const object = getChart(chartId).editor.objects[0];
        check(edited !== getChart(chartId) && Object.isFrozen(edited.editor.objects[0]) && commits === 1 &&
          successReads === 1 && renders === 1 && reconciliations === 1, "edit did not commit once then copied read/render/reconcile");
        check(object.color === "rgb(1, 2, 3)" && object.legendName === "" && object.lineDash === "solid" &&
          object.markerSymbol === "circle" && object.lineWidth === 20 && object.markerSize === 1 &&
          object.barOpacity === 1 && object.barLineWidth === 0 && object.csvId === first.id && object.x === "C1" &&
          JSON.stringify(getChart(chartId).editor.objects[1]) === other, "edit normalization or one-object isolation mismatch");
        check(interfaceFSM.state.assetPath === assetPath && interfaceFSM.state.graphObjectIndex === 0 &&
          result.selectionHints.chartId === chartId && result.selectionHints.selectedIndexHint === 0 &&
          result.changed.chartIds.includes(chartId) && result.changed.csvIds.length === 0,
          "edit replaced selected CSV or lost actual facts/index hint");
        graphEditorObjectValues(chartId, 0, { csvId: second.id, x: "bad", y: "bad", type: "bar" });
        check(getChart(chartId).editor.objects[0].csvId === second.id && getChart(chartId).editor.objects[0].x === "C1" &&
          getChart(chartId).editor.objects[0].y === "C1", "requested current CSV did not revalidate/fallback columns");
        graphEditorObjectValues(chartId, 0, Object.assign(Object.create({ color: "red", csvId: first.id }),
          { lineWidth: null, markerSize: NaN, legendName: 23, color: "" }));
        check(getChart(chartId).editor.objects[0].csvId === second.id && getChart(chartId).editor.objects[0].color === "rgb(1, 2, 3)" &&
          getChart(chartId).editor.objects[0].lineWidth === 20 && getChart(chartId).editor.objects[0].markerSize === 1 &&
          getChart(chartId).editor.objects[0].legendName === "", "invalid/omitted/inherited edits overwrote current fields");
        const before = JSON.stringify(activeProject._state), stable = interfaceFSM.state,
          count = commits, reads = successReads, painted = renders, reconciled = reconciliations,
          failure = Error("expected one-object failure");
        for (const mode of ["getter", "validator", "projection"]) {
          if (mode === "validator") validateProjectObjectState = () => { throw failure; };
          if (mode === "projection") rebuildEditableGraph = () => { throw failure; };
          let caught;
          try { graphEditorObjectValues(chartId, 0, mode === "getter" ? { get color() { throw failure; } } : { legendName: "failed" }); }
          catch (error) { caught = error; }
          validateProjectObjectState = validate; rebuildEditableGraph = rebuild;
          check(caught === failure && commits === count && successReads === reads && renders === painted &&
            reconciliations === reconciled && interfaceFSM.state === stable && JSON.stringify(activeProject._state) === before,
            "failed candidate committed, reconciled or performed success work");
        }
        const noncommit = Object.freeze({ committed: false });
        projectEFSM.send = () => noncommit;
        check(graphEditorObjectValues(chartId, 0, {}) === noncommit && successReads === reads && renders === painted &&
          reconciliations === reconciled, "noncommit performed success work");
        projectEFSM.send = send;
        let rejected = false;
        try { graphEditorObjectValues(chartId, -1, {}); } catch { rejected = true; }
        check(rejected && commits === count && JSON.stringify(activeProject._state) === before, "invalid current index changed authority");
        let attempts = 0;
        graphEditorObjectValues(chartId, 0, { get legendName() {
          if (!attempts++) { const newer = projectClone(activeProject._state); newer.meta.projectName = "new object authority";
            initialize.call(activeProject, newer); }
          return "retry";
        } });
        check(attempts === 2 && commits === count + 1 && activeProject.projectName === "new object authority" &&
          getChart(chartId).editor.objects[0].legendName === "retry", "stale graph candidate overwrote newer authority instead of recalculating");
        check(!/getProjectCsv|activeProject|ensureGraphObjects|baseGraphObject|graphEditorCommit/.test(graphEditorObjectValues.toString()),
          "Application still calculates graph candidate or reads domain state");
      } finally {
        activeProject.initialize = initialize; readBackendProjection = query; renderDashboard = render; projectEFSM.send = send;
        validateProjectObjectState = validate; rebuildEditableGraph = rebuild; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session;
      }
    });

    await run(66, "Shared coordinate validation preserves zero-column real references without fake columns", () => {
      const before = JSON.stringify(activeProject._state),
        csv = { id: 99101, rows: [], headerLines: 0 },
        style = BackendSettings.defaults.chartSettings.editor.objectStyle,
        chart = createChartModel({ id: 99102, editor: { editable: true,
          objects: [{ ...style, csvId: csv.id, x: "", y: "" }] } });
      const rejects = (model, collection = [csv]) => {
        const snapshot = JSON.stringify(model); let rejected = false;
        try { validateChartModel(model, "coordinate fixture", collection); } catch { rejected = true; }
        check(rejected && JSON.stringify(model) === snapshot, "invalid coordinates accepted or validator repaired input");
      };
      for (const rows of [[], [[]], [[], []]]) {
        csv.rows = rows;
        const snapshot = JSON.stringify(chart), selection = graphDataSelection(rows, 0);
        check(selection.x === "" && selection.y === "", `zero-column selection: ${JSON.stringify({ rows, selection })}`);
        check(validateChartModel(chart, "empty", [csv]) === chart && JSON.stringify(chart) === snapshot,
          "zero-column validator rejected or repaired candidate");
        const projected = traces(chart, { assets: { csvFiles: [csv] } });
        check(tracesSingle({ ...chart.editor.objects[0], rows, headerLines: 0 }).length === 0,
          "zero-column object manufactured a data trace");
        check(projected.length > 0 && projected.every(trace => trace.meta?.fastFigureAxisPlaceholder === true &&
          trace.x.length === 0 && trace.y.length === 0 && trace.showlegend === false && trace.hoverinfo === "skip" &&
          trace.marker.size === 0 && trace.marker.opacity === 0 && trace.line.width === 0),
          `zero-column axis-only projection: ${JSON.stringify({ rows, projected })}`);
        for (const pair of [["C1", ""], ["", "C1"], ["C1", "C1"], [undefined, ""], [null, ""]]) {
          const invalid = projectClone(chart); invalid.editor.objects[0].x = pair[0]; invalid.editor.objects[0].y = pair[1];
          rejects(invalid);
        }
      }
      rejects(chart, []);
      csv.rows = [[""]];
      rejects(chart);
      chart.editor.objects[0].x = "C1"; chart.editor.objects[0].y = "C1";
      check(validateChartModel(chart, "single", [csv]) === chart, "single actual column could not supply both coordinates");
      const outside = projectClone(chart); outside.editor.objects[0].y = "C2"; rejects(outside);
      chart.editor.editable = false;
      rejects(chart, []);
      chart.editor.conversionRows = [];
      chart.editor.objects[0].x = ""; chart.editor.objects[0].y = "";
      check(validateChartModel(chart, "conversion", []) === chart, "zero-column conversion required a fake CSV");
      chart.editor.conversionRows = [["x", "y"]];
      rejects(chart, []);
      chart.editor.objects[0].x = "C1"; chart.editor.objects[0].y = "C2";
      check(validateChartModel(chart, "conversion", []) === chart, "real conversion columns rejected");
      chart.editor.conversionRows = [null]; rejects(chart, []);
      check(JSON.stringify(activeProject._state) === before, "supplied reference validation changed Project");
    });

    await run(67, "Current one-object command can move between empty and populated CSV references", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        render = renderDashboard;
      try {
        const slot = activeProject.slots.find((item) => !item.hidden && item.contentType !== "image");
        api.slots.reset(slot.id); select(slotAt(slot.id));
        const populated = createProjectCsv([["X", "Y"], [1, 2]], "column-switch-populated.csv"),
          empty = createProjectCsv([["temporary"]], "column-switch-empty.csv");
        api.graphs.addObject(populated.id);
        const chartId = slotAt(slot.id).chart, fixture = projectClone(activeProject._state);
        fixture.assets.csvFiles.find((item) => item.id === empty.id).rows = [];
        activeProject.initialize(fixture);
        const assets = JSON.stringify(activeProject._state.assets), path = interfaceFSM.state.assetPath;
        renderDashboard = () => {};
        const result = graphEditorObjectValues(chartId, 0, { csvId: empty.id, x: "C99", y: "C1" }),
          object = getChart(chartId).editor.objects[0];
        check(object.csvId === empty.id && object.x === "" && object.y === "" &&
          result !== getChart(chartId) && Object.isFrozen(result.editor.objects[0]) &&
          getChart(chartId).graph.data.length > 0 && getChart(chartId).graph.data.every(trace =>
            trace.meta?.fastFigureAxisPlaceholder === true && trace.x.length === 0 && trace.y.length === 0) &&
          JSON.stringify(activeProject._state.assets) === assets &&
          interfaceFSM.state.assetPath === path, `empty CSV switch: ${JSON.stringify({ object, emptyId: empty.id,
            copy: result !== getChart(chartId), frozen: Object.isFrozen(result?.editor?.objects?.[0]), data: getChart(chartId).graph.data,
            sameAssets: JSON.stringify(activeProject._state.assets) === assets, path, actualPath: interfaceFSM.state.assetPath })}`);
        const base = baseGraphObject(getChart(chartId), getProjectCsv(empty.id));
        check(base.csvId === empty.id && base.x === "" && base.y === "", "ordinary base object invented columns");
        graphEditorObjectValues(chartId, 0, { csvId: populated.id });
        const restored = getChart(chartId).editor.objects[0];
        check(restored.csvId === populated.id && restored.x === "C1" && restored.y === "C2" &&
          getChart(chartId).graph.data.some(trace => trace.meta?.fastFigureAxisPlaceholder !== true && trace.x.length > 0) &&
          JSON.stringify(activeProject._state.assets) === assets,
          "populated CSV did not recover current valid column fallback/projection");
      } finally { renderDashboard = render; activeProject.initialize(saved); selectedSlotId = selected; interfaceFSM.state = session; }
    });

    await run(68, "Graph move/delete calculate current order and explicit hints without public arrays", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, query = readBackendProjection, render = renderDashboard,
        send = projectEFSM.send, reconcile = interfaceFSM.reconcileProjectResult;
      let commits = 0, renders = 0, reconciliations = 0, result, reads = 0;
      try {
        const slot = activeProject.slots.find(item => !item.hidden && item.contentType !== "image");
        api.slots.reset(slot.id); select(slotAt(slot.id));
        const csv = createProjectCsv([["X", "Y"], [1, 2]], "graph-order.csv");
        api.graphs.addObject(csv.id); api.graphs.addObject(csv.id); api.graphs.addObject(csv.id);
        const chartId = slotAt(slot.id).chart, fixture = projectClone(activeProject._state),
          chart = fixture.charts.find(item => item.id === chartId);
        chart.editor.objects.forEach((object, index) => { object.legendName = `item${index}`;
          object.plotlyTrace = { meta: { original: index } }; });
        initialize.call(activeProject, fixture);
        const objects = projectClone(getChart(chartId).editor.objects), assets = JSON.stringify(activeProject._state.assets),
          assetPath = interfaceFSM.state.assetPath;
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        renderDashboard = () => { renders++; };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        readBackendProjection = (kind, request) => { if (kind === "project-api" && request.operation === "graphs.readData") reads++;
          return query(kind, request); };
        projectEFSM.send = function (event, payload) {
          check(event === "GRAPH_OBJECTS_REPLACED" && ["graphs.moveObject", "graphs.deleteObject"].includes(payload.operation) &&
            payload.chartId === chartId && !Object.hasOwn(payload, "objects") && !Object.hasOwn(payload, "candidate"),
            "Application supplied graph candidate or incorrect operation");
          return result = send.call(this, event, payload);
        };
        const moved = api.graphs.moveObject(0, 2);
        check(JSON.stringify(getChart(chartId).editor.objects) === JSON.stringify([objects[1], objects[2], objects[0]]) &&
          moved !== getChart(chartId) && Object.isFrozen(moved.editor.objects[0]) && commits === 1 && renders === 1 &&
          reconciliations === 1 && result.selectionHints.chartId === chartId && result.selectionHints.selectedIndexHint === 2 &&
          interfaceFSM.state.graphObjectIndex === 2 && result.changed.chartIds.includes(chartId),
          "arbitrary move lost order/extensions, copied read, one commit or actual hint");
        graphEditorMove(chartId, 2, 0);
        check(JSON.stringify(getChart(chartId).editor.objects) === JSON.stringify(objects) &&
          interfaceFSM.state.graphObjectIndex === 0 && commits === 2, "reverse move did not preserve original order");
        const before = JSON.stringify(activeProject._state), stable = interfaceFSM.state, count = commits,
          paints = renders, reconciled = reconciliations, readCount = reads;
        const noop = graphEditorMove(chartId, 1, 1);
        check(noop !== getChart(chartId) && Object.isFrozen(noop.editor.objects[0]) && commits === count &&
          interfaceFSM.state === stable && renders === paints && reconciliations === reconciled && reads === readCount + 1 &&
          JSON.stringify(activeProject._state) === before, "valid equal-index move mutated/reconciled/rendered instead of copied no-op");
        const directNoop = dispatchProjectCommand("GRAPH_OBJECTS_REPLACED", { chartId, operation: "graphs.moveObject", from: 0, to: 0 });
        check(!directNoop.committed && directNoop.selectionHints === null && commits === count &&
          reconciliations === reconciled && interfaceFSM.state === stable, "Backend equal move committed or published hint");
        api.graphs.deleteObject(1);
        check(JSON.stringify(getChart(chartId).editor.objects) === JSON.stringify([objects[0], objects[2]]) &&
          result.selectionHints.selectedIndexHint === null && interfaceFSM.state.graphObjectIndex === null,
          "delete lost retained order or invented neighboring selection");
        graphEditorDelete(chartId, 1); const empty = graphEditorDelete(chartId, 0);
        check(empty.editor.objects.length === 0 && getChart(chartId).editor.objects.length === 0 && commits === 5 &&
          Object.isFrozen(empty.editor.objects) && JSON.stringify(activeProject._state.assets) === assets &&
          interfaceFSM.state.assetPath === assetPath && interfaceFSM.readState().selectedSlotId === slot.id,
          "last delete repaired fake object, changed assets/CSV selection or failed empty chart");
        for (const wrapper of [graphEditorMove, graphEditorDelete]) check(!/ensureGraphObjects|graphEditorCommit|activeProject|baseGraphObject/.test(wrapper.toString()),
          "Application still computes order/removal candidate from live objects");
      } finally {
        activeProject.initialize = initialize; readBackendProjection = query; renderDashboard = render;
        projectEFSM.send = send; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session;
      }
    });

    await run(69, "Graph order rejection, noncommit and stale-authority retry preserve boundaries", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, query = readBackendProjection, render = renderDashboard,
        send = projectEFSM.send, validate = validateProjectObjectState, rebuild = rebuildEditableGraph,
        reconcile = interfaceFSM.reconcileProjectResult;
      let commits = 0, paints = 0, reconciliations = 0, reads = 0;
      try {
        const slot = activeProject.slots.find(item => !item.hidden && item.contentType !== "image");
        api.slots.reset(slot.id); select(slotAt(slot.id));
        const csv = createProjectCsv([["X", "Y"], [1, 2]], "graph-order-fail.csv");
        api.graphs.addObject(csv.id); api.graphs.addObject(csv.id); api.graphs.addObject(csv.id);
        const chartId = slotAt(slot.id).chart, fixture = projectClone(activeProject._state);
        fixture.charts.find(item => item.id === chartId).editor.objects.forEach((object, index) => object.legendName = `${index}`);
        initialize.call(activeProject, fixture);
        const before = JSON.stringify(activeProject._state), stable = interfaceFSM.state, failure = Error("expected graph-order failure");
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        renderDashboard = () => { paints++; };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        readBackendProjection = (kind, request) => { if (kind === "project-api" && request.operation === "graphs.readData") reads++;
          return query(kind, request); };
        for (const action of [() => graphEditorMove(chartId, -1, -1), () => graphEditorMove(chartId, 0, 3),
          () => graphEditorMove(chartId, "0", 0), () => graphEditorMove(-1, 0, 0),
          () => graphEditorDelete(chartId, 3), () => graphEditorDelete(chartId, 0.5), () => graphEditorDelete(null, 0)]) {
          let caught = false; try { action(); } catch { caught = true; }
          check(caught && commits === 0 && paints === 0 && reconciliations === 0 &&
            interfaceFSM.state === stable && JSON.stringify(activeProject._state) === before, "invalid identity/index performed success work or writes");
        }
        for (const mode of ["validator", "projection"]) {
          if (mode === "validator") validateProjectObjectState = () => { throw failure; };
          else rebuildEditableGraph = () => { throw failure; };
          let caught; try { graphEditorDelete(chartId, 0); } catch (error) { caught = error; }
          validateProjectObjectState = validate; rebuildEditableGraph = rebuild;
          check(caught === failure && commits === 0 && paints === 0 && reconciliations === 0 &&
            interfaceFSM.state === stable && JSON.stringify(activeProject._state) === before, "failed candidate changed authority or swallowed error");
        }
        const noCommit = Object.freeze({ committed: false }), count = reads;
        projectEFSM.send = () => noCommit;
        check(graphEditorDelete(chartId, 0) === noCommit && reads === count && paints === 0 && reconciliations === 0,
          "noncommit deletion read/rendered/reconciled");
        check(graphEditorMove(chartId, 0, 1) === noCommit && reads === count + 1 && paints === 0 && reconciliations === 0,
          "noncommit move performed post-commit success work");
        projectEFSM.send = send;
        let attempts = 0;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) { const newer = projectClone(activeProject._state), chart = newer.charts.find(item => item.id === chartId);
            chart.editor.objects.unshift({ ...projectClone(chart.editor.objects[0]), legendName: "new" });
            newer.meta.projectName = "new order authority"; initialize.call(activeProject, newer); }
          return valid;
        };
        const moved = graphEditorMove(chartId, 0, 2);
        validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && reconciliations === 1 && paints === 1 &&
          activeProject.projectName === "new order authority" && moved.editor.objects.map(object => object.legendName).join() === "0,1,new,2" &&
          interfaceFSM.state.graphObjectIndex === 2, "stale order committed old snapshot instead of re-resolving current indices");
        const final = JSON.stringify(activeProject._state), frozenSession = interfaceFSM.state;
        getChart(chartId).editor.editable = false;
        let rejected = false; try { graphEditorMove(chartId, 0, 0); } catch { rejected = true; }
        check(rejected && commits === 1 && interfaceFSM.state === frozenSession && paints === 1 && reconciliations === 1,
          "noneditable equal move bypassed command precondition");
        getChart(chartId).editor.editable = true;
        check(JSON.stringify(activeProject._state) === final, "noneditable rejection repaired current graph");
      } finally {
        activeProject.initialize = initialize; readBackendProjection = query; renderDashboard = render; projectEFSM.send = send;
        validateProjectObjectState = validate; rebuildEditableGraph = rebuild; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session;
      }
    });

    await run(70, "Graph palette changes only current object colors with omitted index hint", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, query = readBackendProjection, render = renderDashboard,
        send = projectEFSM.send, reconcile = interfaceFSM.reconcileProjectResult;
      let commits = 0, paints = 0, reconciliations = 0, reads = 0, outcome;
      try {
        const slot = activeProject.slots.find(item => !item.hidden && item.contentType !== "image");
        api.slots.reset(slot.id); select(slotAt(slot.id));
        const csv = createProjectCsv([["X", "Y"], [1, 2]], "graph-palette.csv");
        api.graphs.addObject(csv.id); api.graphs.addObject(csv.id); api.graphs.addObject(csv.id);
        const chartId = slotAt(slot.id).chart, fixture = projectClone(activeProject._state);
        fixture.charts.find(item => item.id === chartId).editor.objects.forEach((object, index) => {
          object.legendName = `palette${index}`; object.plotlyTrace = { meta: { retained: index } };
        });
        initialize.call(activeProject, fixture);
        api.assets.selectCsv(csv.path); api.graphs.selectObject(1);
        const objects = projectClone(getChart(chartId).editor.objects), assets = JSON.stringify(activeProject._state.assets),
          appearance = JSON.stringify(activeProject._state.appearance), path = interfaceFSM.state.assetPath,
          others = JSON.stringify(activeProject.charts.filter(chart => chart.id !== chartId));
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        renderDashboard = () => { paints++; };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        readBackendProjection = (kind, request) => { if (kind === "project-api" && request.operation === "graphs.readData") reads++;
          return query(kind, request); };
        const colors = Object.freeze(["  red  ", "rgb(1, 2, 3)"]);
        projectEFSM.send = function (event, payload) {
          check(event === "GRAPH_OBJECTS_REPLACED" && payload.operation === "graphs.applyPalette" && payload.chartId === chartId &&
            payload.colors === colors && !Object.hasOwn(payload, "objects") && !Object.hasOwn(payload, "candidate"),
            "Application palette constructed graph candidate or supplied wrong context");
          return outcome = send.call(this, event, payload);
        };
        const copied = api.graphs.applyPalette(colors), expected = objects.map((object, index) => ({ ...object,
          color: index % 2 ? "rgb(1, 2, 3)" : "red" }));
        check(JSON.stringify(getChart(chartId).editor.objects) === JSON.stringify(expected) && copied !== getChart(chartId) &&
          Object.isFrozen(copied.editor.objects[0]) && reads === 2 && commits === 1 && paints === 1 && reconciliations === 1 &&
          outcome.selectionHints.chartId === chartId && !Object.hasOwn(outcome.selectionHints, "selectedIndexHint") &&
          interfaceFSM.state.graphObjectIndex === 1 && interfaceFSM.state.assetPath === path &&
          JSON.stringify(activeProject._state.assets) === assets && JSON.stringify(activeProject._state.appearance) === appearance &&
          JSON.stringify(activeProject.charts.filter(chart => chart.id !== chartId)) === others &&
          JSON.stringify(colors) === '["  red  ","rgb(1, 2, 3)"]', "palette changed non-color authority/selection, lost color text or emitted explicit index hint");
        projectEFSM.send = send;
        const zero = projectClone(activeProject._state); zero.charts.find(chart => chart.id === chartId).editor.objects = [];
        initialize.call(activeProject, zero);
        interfaceFSM.state = Object.freeze({ ...interfaceFSM.state, graphObject: "none", graphObjectIndex: null });
        const empty = graphEditorApplyPalette(chartId, ["not-a-parser-authority"]);
        check(empty.editor.objects.length === 0 && getChart(chartId).editor.objects.length === 0 && commits === 2 &&
          paints === 2 && reconciliations === 2 && interfaceFSM.state.graphObjectIndex === null &&
          JSON.stringify(activeProject._state.assets) === assets, "valid zero-object palette created an object/asset or rejected color text");
        check(!/ensureGraphObjects|graphEditorCommit|activeProject|graphEditorChart/.test(graphEditorApplyPalette.toString()),
          "Application still owns palette candidate");
      } finally {
        activeProject.initialize = initialize; readBackendProjection = query; renderDashboard = render; projectEFSM.send = send;
        interfaceFSM.reconcileProjectResult = reconcile; initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session;
      }
    });

    await run(71, "Graph palette validates every text and retries current authority without failure effects", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, query = readBackendProjection, render = renderDashboard,
        send = projectEFSM.send, validate = validateProjectObjectState, rebuild = rebuildEditableGraph,
        reconcile = interfaceFSM.reconcileProjectResult;
      let commits = 0, paints = 0, reads = 0, reconciliations = 0;
      try {
        const slot = activeProject.slots.find(item => !item.hidden && item.contentType !== "image");
        api.slots.reset(slot.id); select(slotAt(slot.id));
        const csv = createProjectCsv([["X", "Y"], [1, 2]], "graph-palette-fail.csv");
        api.graphs.addObject(csv.id); api.graphs.addObject(csv.id);
        const chartId = slotAt(slot.id).chart;
        api.graphs.selectObject(1);
        const before = JSON.stringify(activeProject._state), stable = interfaceFSM.state, failure = Error("expected graph-palette failure");
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        renderDashboard = () => { paints++; };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        readBackendProjection = (kind, request) => { if (kind === "project-api" && request.operation === "graphs.readData") reads++;
          return query(kind, request); };
        const noEffects = () => check(commits === 0 && paints === 0 && reads === 0 && reconciliations === 0 &&
          interfaceFSM.state === stable && JSON.stringify(activeProject._state) === before, "invalid palette/failure performed success work or persistent writes");
        for (const colors of [null, "red", [], ["red", " "], ["red", 2], [null], Array(1), ["red", undefined]]) {
          let caught = false; try { graphEditorApplyPalette(chartId, colors); } catch { caught = true; }
          check(caught, "invalid or sparse palette accepted"); noEffects();
        }
        const throwing = []; Object.defineProperty(throwing, 0, { get() { throw failure; } });
        let caught; try { graphEditorApplyPalette(chartId, throwing); } catch (error) { caught = error; }
        check(caught === failure, "palette element error replaced"); noEffects();
        for (const mode of ["validator", "projection"]) {
          if (mode === "validator") validateProjectObjectState = () => { throw failure; };
          else rebuildEditableGraph = () => { throw failure; };
          caught = null; try { graphEditorApplyPalette(chartId, ["red"]); } catch (error) { caught = error; }
          validateProjectObjectState = validate; rebuildEditableGraph = rebuild;
          check(caught === failure, "candidate error replaced"); noEffects();
        }
        const noCommit = Object.freeze({ committed: false }); projectEFSM.send = () => noCommit;
        check(graphEditorApplyPalette(chartId, ["red"]) === noCommit, "noncommit result replaced"); noEffects();
        projectEFSM.send = send;
        getChart(chartId).editor.editable = false;
        caught = null; try { graphEditorApplyPalette(chartId, ["red"]); } catch (error) { caught = error; }
        check(caught && commits === 0 && reads === 0 && paints === 0 && reconciliations === 0 && interfaceFSM.state === stable,
          "noneditable palette did not reject before success work");
        getChart(chartId).editor.editable = true; noEffects();
        let attempts = 0;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) { const newer = projectClone(activeProject._state), chart = newer.charts.find(item => item.id === chartId);
            chart.editor.objects.unshift({ ...projectClone(chart.editor.objects[0]), legendName: "new first" });
            newer.meta.projectName = "new palette authority"; initialize.call(activeProject, newer); }
          return valid;
        };
        const copied = graphEditorApplyPalette(chartId, [" red ", "blue"]);
        validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && reads === 1 && paints === 1 && reconciliations === 1 &&
          activeProject.projectName === "new palette authority" && copied.editor.objects.length === 3 &&
          copied.editor.objects[0].legendName === "new first" && copied.editor.objects.map(object => object.color).join() === "red,blue,red" &&
          interfaceFSM.state.graphObjectIndex === 1, "palette committed stale objects instead of recalculating color positions on current authority");
      } finally {
        activeProject.initialize = initialize; readBackendProjection = query; renderDashboard = render; projectEFSM.send = send;
        validateProjectObjectState = validate; rebuildEditableGraph = rebuild; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session;
      }
    });

    await run(72, "Graph add resolves scalar inputs, creates once and preserves CSV selection", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, query = readBackendProjection, render = renderDashboard, send = projectEFSM.send;
      let commits = 0, paints = 0, reads = 0, result;
      try {
        const slot = activeProject.slots.find(item => !item.hidden && item.contentType !== "image");
        api.slots.reset(slot.id); select(slotAt(slot.id));
        const csv = createProjectCsv([["X", "Y"], [1, 2]], "graph-add-current.csv"),
          other = createProjectCsv([["A", "B"], [3, 4]], "graph-add-selected.csv");
        api.assets.selectCsv(projectAssetPath(other));
        const path = interfaceFSM.state.assetPath, assets = JSON.stringify(activeProject._state.assets), next = activeProject._state.nextId.chart;
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        renderDashboard = () => { paints++; };
        readBackendProjection = (kind, request) => {
          if (kind === "project-api" && request.operation === "graphs.readData") reads++;
          return query(kind, request);
        };
        projectEFSM.send = function (event, payload) {
          check(payload.operation === "graphs.addObject" && payload.slotId === slot.id && payload.csvId === csv.id &&
            !Object.hasOwn(payload, "objects") && !Object.hasOwn(payload, "candidate") && !Object.hasOwn(payload, "chart"), "add sent projected model/array");
          result = send.call(this, event, payload); return result;
        };
        const first = api.graphs.addObject(csv.id), live = getChart(slotAt(slot.id).chart),
          base = first.editor.objects[0], defaults = BackendSettings.defaults.chartSettings.editor.objectStyle;
        check(commits === 1 && paints === 1 && reads === 1 && first.id === next && first.editor.title === csv.name &&
          activeProject._state.nextId.chart === next + 1 && base.csvId === csv.id && base.x === "C1" && base.y === "C2" &&
          Object.entries(defaults).every(([key, value]) => base[key] === value) && base.color === DEFAULT_COLORS[0] && base.legendName === "" &&
          Object.isFrozen(first.editor.objects) && first !== live && result.changed.chartIds.includes(first.id) &&
          result.changed.slotIds.includes(slot.id) && result.selectionHints.selectedIndexHint === 0 &&
          interfaceFSM.state.graphObjectIndex === 0 && interfaceFSM.state.assetPath === path, "first add not a single copied candidate commit or selected CSV changed");
        live.editor.objects[0].plotlyTrace = { customdata: ["preserved"] };
        live.editor.type = "bar"; live.editor.legendName = "not a base default";
        const retained = JSON.stringify(live.editor.objects[0]), second = api.graphs.addObject(csv.id);
        check(commits === 2 && paints === 2 && reads === 2 && second.editor.objects.length === 2 &&
          JSON.stringify(second.editor.objects[0]) === retained && second.editor.objects[1].type === defaults.type &&
          second.editor.objects[1].legendName === "" && first.editor.objects.length === 1 &&
          result.selectionHints.selectedIndexHint === 1 && interfaceFSM.state.graphObjectIndex === 1 &&
          interfaceFSM.state.assetPath === path && JSON.stringify(activeProject._state.assets) === assets,
          "append lost extension/order/defaults, reused old copy or changed selected CSV/assets");
        projectEFSM.send = send;
        const bySelection = api.graphs.addObject();
        check(bySelection.editor.objects[2].csvId === other.id && interfaceFSM.state.assetPath === path,
          "omitted CSV did not bind current official selected CSV");
      } finally {
        activeProject.initialize = initialize; readBackendProjection = query; renderDashboard = render; projectEFSM.send = send;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session;
      }
    });
    await run(73, "Graph add rejects stale routing, validates before commit and retries current CSV", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, query = readBackendProjection, render = renderDashboard, send = projectEFSM.send,
        validate = validateProjectObjectState, rebuild = rebuildEditableGraph, reconcile = interfaceFSM.reconcileProjectResult;
      let commits = 0, paints = 0, reads = 0, reconciliations = 0;
      try {
        const slot = activeProject.slots.find(item => !item.hidden && item.contentType !== "image");
        api.slots.reset(slot.id); select(slotAt(slot.id));
        const csv = createProjectCsv([["X", "Y"], [1, 2]], "graph-add-fail.csv"), before = JSON.stringify(activeProject._state), stable = interfaceFSM.state,
          failure = Error("expected graph-add failure");
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        renderDashboard = () => { paints++; };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        readBackendProjection = (kind, request) => { if (kind === "project-api" && request.operation === "graphs.readData") reads++;
          return query(kind, request); };
        const noEffects = () => check(commits === 0 && paints === 0 && reads === 0 && reconciliations === 0 &&
          interfaceFSM.state === stable && JSON.stringify(activeProject._state) === before, "rejected add performed success work");
        for (const csvId of [-1, null]) { let caught; try { graphEditorAdd(slot.id, csvId); } catch (error) { caught = error; }
          check(caught, "missing current CSV accepted"); noEffects(); }
        for (const mode of ["validator", "projection"]) {
          if (mode === "validator") validateProjectObjectState = () => { throw failure; };
          else rebuildEditableGraph = () => { throw failure; };
          let caught; try { graphEditorAdd(slot.id, csv.id); } catch (error) { caught = error; }
          validateProjectObjectState = validate; rebuildEditableGraph = rebuild;
          check(caught === failure, "first add candidate failure replaced"); noEffects();
        }
        const uncommitted = Object.freeze({ committed: false }); projectEFSM.send = () => uncommitted;
        check(graphEditorAdd(slot.id, csv.id) === uncommitted, "add replaced noncommit result"); noEffects(); projectEFSM.send = send;
        let attempts = 0;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) { const newer = projectClone(activeProject._state);
            newer.assets.csvFiles.find(item => item.id === csv.id).rows = [];
            newer.meta.projectName = "new graph-add authority"; initialize.call(activeProject, newer); }
          return valid;
        };
        const empty = graphEditorAdd(slot.id, csv.id); validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && paints === 1 && reads === 1 && reconciliations === 1 &&
          activeProject.projectName === "new graph-add authority" && empty.editor.objects[0].csvId === csv.id &&
          empty.editor.objects[0].x === "" && empty.editor.objects[0].y === "", "first add committed stale CSV/next chart");
        const occupied = JSON.stringify(activeProject._state); let caught;
        try { dispatchProjectCommand("SLOT_DATA_CONNECTED", { slotId: slot.id, csvId: csv.id, operation: "graphs.addObject" }); }
        catch (error) { caught = error; }
        check(caught && commits === 1 && JSON.stringify(activeProject._state) === occupied, "stale empty-slot route appended/committed");
        let swaps = 0;
        readBackendProjection = (kind, request) => { const copy = query(kind, request);
          if (kind === "project-api" && request.operation === "slots.readSelected" && !swaps++) {
            const newer = projectClone(activeProject._state), owned = newer.slots.find(item => item.id === slot.id).chart;
            newer.charts = newer.charts.filter(item => item.id !== owned); newer.slots.find(item => item.id === slot.id).chart = null;
            initialize.call(activeProject, newer);
          }
          return copy;
        };
        caught = null; try { graphEditorAdd(slot.id, csv.id); } catch (error) { caught = error; }
        check(caught && commits === 1 && paints === 1 && reads === 1 && reconciliations === 1,
          "stale existing-chart route created a new chart or performed success work");
      } finally {
        activeProject.initialize = initialize; readBackendProjection = query; renderDashboard = render; projectEFSM.send = send;
        validateProjectObjectState = validate; rebuildEditableGraph = rebuild; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session;
      }
    });

    await run(74, "Editable conversion owns CSV creation, copied return and selection preservation", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, query = readBackendProjection, render = renderDashboard, send = projectEFSM.send;
      let commits = 0, paints = 0, reads = 0, result;
      try {
        const slot = activeProject.slots.find(item => !item.hidden && item.contentType !== "image");
        select(slot);
        await api.graphs.importFile(new File([JSON.stringify({ data: [{ x: [1, 2], y: [3, 4], customdata: ["kept"] }],
          layout: { title: "candidate conversion", xaxis: { title: "retained axis" } }, config: { responsive: true } })], "editable.json"));
        const chartId = slotAt(slot.id).chart, imported = getChart(chartId),
          original = JSON.stringify(imported.graph.imported), global = JSON.stringify(imported.editor.globalSettings),
          collision = createProjectCsv([["X", "Y"], [8, 9]], "Plotly JSON.csv");
        api.assets.selectCsv(projectAssetPath(collision));
        const path = interfaceFSM.state.assetPath, csvBefore = JSON.stringify(activeProject.csvFiles), next = activeProject._state.nextId.csv;
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        renderDashboard = () => { paints++; };
        readBackendProjection = (kind, request) => { if (kind === "project-api" && request.operation === "graphs.readData") reads++;
          return query(kind, request); };
        projectEFSM.send = function (event, payload) {
          check(event === "CHART_MODEL_REPLACED" && payload.slotId === slot.id && payload.chartId === chartId &&
            typeof payload.editable === "boolean" && !Object.hasOwn(payload, "candidate") && !Object.hasOwn(payload, "chart"),
            "Application sent editable candidate/model instead of scalar command");
          result = send.call(this, event, payload); return result;
        };
        check(api.graphs.setEditable(true) === true && commits === 1 && paints === 1 && reads === 2, "editable did not commit/read once");
        const chart = getChart(chartId), csv = getProjectCsv(next), fact = result.changed.assets[0];
        check(csv && csv.mime === "text/csv" && csv.headerLines === 1 && csv.bytesBase64 &&
          projectAssetPath(csv) !== projectAssetPath(collision) && activeProject._state.nextId.csv === next + 1 &&
          chart.editor.objects.every(object => object.csvId === csv.id) && !Object.hasOwn(chart.editor, "conversionRows") &&
          JSON.stringify(chart.graph.imported) === original && JSON.stringify(chart.editor.globalSettings) === global &&
          JSON.stringify(activeProject.csvFiles.filter(item => item.id !== next)) === csvBefore &&
          interfaceFSM.state.assetPath === path && fact.role === "created" && fact.kind === "csv" && fact.id === next &&
          fact.path === projectAssetPath(csv) && fact.owners[0].slotId === slot.id && fact.owners[0].chartId === chartId &&
          result.changed.csvIds.includes(next) && result.changed.chartIds.includes(chartId) && Object.isFrozen(fact.owners),
          "conversion lost import/settings/reference, generated wrong CSV/facts or selected new CSV");
        const allocated = JSON.stringify(activeProject.csvFiles);
        projectEFSM.send = send;
        appFSM.send("SELECT_GRAPH_OBJECT", { index: 0, selectAsset: false });
        check(graphEditorSetEditable(slot.id, chartId, false) === false && interfaceFSM.state.graphObjectIndex === null &&
          interfaceFSM.state.assetPath === path, "noneditable transition retained graph selection or changed CSV selection");
        check(graphEditorSetEditable(slot.id, chartId, true) === true && graphEditorSetEditable(slot.id, chartId, true) === true &&
          JSON.stringify(activeProject.csvFiles) === allocated && activeProject._state.nextId.csv === next + 1 &&
          JSON.stringify(getChart(chartId).graph.imported) === original, "real-reference/repeat conversion allocated duplicate CSV or lost imported source");
      } finally {
        activeProject.initialize = initialize; readBackendProjection = query; renderDashboard = render; projectEFSM.send = send;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session;
      }
    });
    await run(75, "Editable failures are atomic and retry resolves current next-id and collision path", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, query = readBackendProjection, render = renderDashboard, send = projectEFSM.send,
        validate = validateProjectObjectState, rebuild = rebuildEditableGraph, reconcile = interfaceFSM.reconcileProjectResult;
      let commits = 0, paints = 0, reads = 0, reconciliations = 0;
      try {
        const slot = activeProject.slots.find(item => !item.hidden && item.contentType !== "image");
        select(slot);
        await api.graphs.importFile(new File([JSON.stringify({ data: [{ x: [1], y: [2] }] })], "editable-failure.json"));
        const chartId = slotAt(slot.id).chart, before = JSON.stringify(activeProject._state), stable = interfaceFSM.state,
          failure = Error("expected editable candidate failure");
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        renderDashboard = () => { paints++; };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        readBackendProjection = (kind, request) => { if (kind === "project-api" && request.operation === "graphs.readData") reads++;
          return query(kind, request); };
        const noEffects = () => check(commits === 0 && paints === 0 && reads === 0 && reconciliations === 0 &&
          interfaceFSM.state === stable && JSON.stringify(activeProject._state) === before, "editable rejection did success work/partial CSV or chart commit");
        for (const args of [[-1, chartId, true], [slot.id, -1, true], [slot.id, chartId, "true"]]) {
          let caught; try { graphEditorSetEditable(...args); } catch (error) { caught = error; }
          check(caught, "invalid current chart/slot/boolean accepted"); noEffects();
        }
        for (const mode of ["validator", "projection"]) {
          if (mode === "validator") validateProjectObjectState = () => { throw failure; };
          else rebuildEditableGraph = () => { throw failure; };
          let caught; try { graphEditorSetEditable(slot.id, chartId, true); } catch (error) { caught = error; }
          validateProjectObjectState = validate; rebuildEditableGraph = rebuild;
          check(caught === failure, "editable candidate error replaced"); noEffects();
        }
        const noncommit = Object.freeze({ committed: false }); projectEFSM.send = () => noncommit;
        check(graphEditorSetEditable(slot.id, chartId, true) === noncommit, "editable noncommit result replaced"); noEffects(); projectEFSM.send = send;
        let attempts = 0, finalNext;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) {
            const newer = projectClone(activeProject._state), csv = buildProjectCsvModel([["A"], [7]], "Plotly JSON.csv",
              newer.nextId.csv++, "", "text/csv", 1, newer);
            newer.assets.csvFiles.push(csv); newer.meta.projectName = "new editable authority";
            finalNext = newer.nextId.csv; initialize.call(activeProject, newer);
          }
          return valid;
        };
        check(graphEditorSetEditable(slot.id, chartId, true) === true, "retry conversion failed");
        validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && paints === 1 && reads === 1 && reconciliations === 1 &&
          activeProject.projectName === "new editable authority" && getProjectCsv(finalNext) &&
          getChart(chartId).editor.objects.every(object => object.csvId === finalNext) &&
          activeProject._state.nextId.csv === finalNext + 1 && getProjectCsv(finalNext - 1).rows[0][0] === "A",
          "conversion committed stale next-id/path/source or more than one partial commit");
      } finally {
        activeProject.initialize = initialize; readBackendProjection = query; renderDashboard = render; projectEFSM.send = send;
        validateProjectObjectState = validate; rebuildEditableGraph = rebuild; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session;
      }
    });

    await run(76, "FFPX retains slot image settings with null reference without creating assets", async () => {
      const live = JSON.stringify(activeProject._state), source = projectClone(activeProject._state),
        settings = { ...DEFAULT_IMAGE_SETTINGS, fit: "manual", scale: 125, x: 17, y: 23 };
      // Normalize only this private fixture before observation; legacy tests may leave flat slots.
      normalizeSlotContents(source.slots);
      source.assets.images = [];
      source.slots.forEach(slot => { slot.content.imageId = null; });
      const slot = source.slots[0];
      source.charts = source.charts.filter(chart => chart.id !== slot.content.chart);
      slot.content.chart = null; slot.content.contentType = "image";
      slot.content.imageSettings = projectClone(settings);
      const before = JSON.stringify(source), bundle = ffpxBuildProject(source),
        entries = new Map(bundle.assets.map(entry => [entry.name, entry.data])),
        root = ffpxReadXmlDocument(entries, `slots/slot-${slot.id}.xml`, "fastFigureSlot"),
        node = root.querySelector(":scope > slot > imageObject"),
        typed = node && ffpxXmlReadValue(node.firstElementChild),
        roundtrip = await ffpxReadProject(new File([ffpxZipStore(bundle.assets)], "empty-image.ffpx")),
        restored = roundtrip.slots.find(item => item.id === slot.id);
      check(node && !node.hasAttribute("imageRef") && typed.imageRef === null &&
        JSON.stringify(typed.settings) === JSON.stringify(settings), "null image settings omitted or typed ref changed");
      check(restored.imageId === null && JSON.stringify(restored.imageSettings) === JSON.stringify(settings) &&
        roundtrip.images.length === 0 && !bundle.assets.some(entry => entry.name.startsWith("assets/media/")) &&
        JSON.stringify(source) === before, "null image settings did not roundtrip or created asset/mutated source");
      // Positive image references still retain real asset identity and original bytes.
      const image = { id: source.nextId.image++, name: "settings-roundtrip.svg", directory: "/assets/images",
        mime: "image/svg+xml", bytesBase64: ffpxBytesToBase64(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>')) };
      source.assets.images.push(image); slot.content.imageId = image.id;
      const attachedBefore = JSON.stringify(source), attached = ffpxBuildProject(source),
        attachedRoot = ffpxReadXmlDocument(new Map(attached.assets.map(entry => [entry.name, entry.data])),
          `slots/slot-${slot.id}.xml`, "fastFigureSlot"),
        attachedNode = attachedRoot.querySelector(":scope > slot > imageObject"),
        attachedRead = await ffpxReadProject(new File([ffpxZipStore(attached.assets)], "attached-image.ffpx")),
        attachedSlot = attachedRead.slots.find(item => item.id === slot.id);
      check(attachedNode.getAttribute("imageRef") === String(image.id) && attachedSlot.imageId === image.id &&
        JSON.stringify(attachedSlot.imageSettings) === JSON.stringify(settings) &&
        attachedRead.images.length === 1 && attachedRead.images[0].id === image.id &&
        attachedRead.images[0].bytesBase64 === image.bytesBase64 && JSON.stringify(source) === attachedBefore &&
        JSON.stringify(activeProject._state) === live, "positive image package changed identity/bytes/settings or live authority");
    });

    await run(77, "CSV create owns current candidate, bytes, location and immutable success read", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, query = readBackendProjection;
      let commits = 0, command, queries = 0;
      try {
        const next = activeProject._state.nextId.csv, chartState = JSON.stringify(activeProject.charts),
          bytes = ffpxBytesToBase64(new TextEncoder().encode('original\tbytes\r\n'));
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        projectEFSM.send = function (event, payload) { if (event === "DATA_OBJECT_CREATED") {
          check(!Object.hasOwn(payload, "model") && !Object.hasOwn(payload, "candidate"), "Application supplied candidate");
          command = send.call(this, event, payload); return command;
        } return send.call(this, event, payload); };
        readBackendProjection = (kind, request) => { if (request.operation === "assets.readDeletionTarget") queries++;
          return query(kind, request); };
        const csv = createProjectCsv([["X", "Y"], [1, 2]], "candidate.csv", null, bytes, "text/tab-separated-values", 0);
        check(commits === 1 && queries === 1 && csv.id === next && csv.bytesBase64 === bytes && csv.headerLines === 0 &&
          csv.mime === "text/tab-separated-values" && Object.isFrozen(csv) && Object.isFrozen(csv.rows[0]) &&
          csv !== getProjectCsv(csv.id) && command.changed.assets[0].path === projectAssetPath(csv) &&
          command.changed.csvIds[0] === csv.id && activeProject._state.nextId.csv === next + 1 &&
          JSON.stringify(activeProject.charts) === chartState, "create lost bytes/identity/copies or partial commit");
        const collision = createProjectCsv([[1]], "candidate.csv");
        check(collision.name === "candidate (2).csv" && getProjectCsv(csv.id).bytesBase64 === bytes, "create replaced collision");
        const rows = [[null, { a: 1 }, 'quote"', "a\tb", "a\nb"]];
        for (const name of ["serialize.json", "serialize.tsv", "serialize.csv"]) {
          const created = createProjectCsv(rows, name), text = new TextDecoder().decode(ffpxBase64ToBytes(created.bytesBase64));
          const expected = name.endsWith(".json") ? JSON.stringify(dataTable(rows)) : name.endsWith(".tsv") ?
            '\t"{""a"":1}"\t"quote"""\t"a\tb"\t"a\nb"' : ',"{""a"":1}","quote""",a\tb,"a\nb"';
          check(text === expected, `Source filename-aware synthetic bytes failed: ${name}: ${JSON.stringify(text)}`);
        }
        check(interfaceFSM.readState().selectedSlotId === selected && interfaceFSM.state.assetPath === session.assetPath,
          "CSV create changed selection");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; readBackendProjection = query;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session; }
    });

    await run(78, "CSV create retries authority and preserves commit boundary on failures and selection rejection", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, validate = validateProjectObjectState, send = projectEFSM.send,
        query = readBackendProjection, selectCsv = selectProjectCsv;
      let commits = 0, reads = 0;
      try {
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        readBackendProjection = (kind, request) => { if (request.operation === "assets.readDeletionTarget") reads++;
          return query(kind, request); };
        const baseline = JSON.stringify(activeProject._state), failure = Error("expected CSV create failure");
        for (const args of [[[], "invalid.csv"], [[[1]], "invalid.csv", 0], [[[1]], "invalid.csv", null, "@@@"],
          [[[1]], "invalid.csv", null, "", "text/csv", 1, "/missing-parent/test.csv"]]) {
          let caught; try { createProjectCsv(...args); } catch (error) { caught = error; }
          check(caught && commits === 0 && reads === 0 && JSON.stringify(activeProject._state) === baseline,
            "invalid create did success work/partial mutation");
        }
        validateProjectObjectState = () => { throw failure; };
        let caught; try { createProjectCsv([[1]], "invalid.csv"); } catch (error) { caught = error; }
        check(caught === failure && commits === 0 && reads === 0, "validation error changed or committed");
        validateProjectObjectState = validate;
        const noncommit = Object.freeze({ committed: false }); projectEFSM.send = () => noncommit;
        check(createEmptyProjectCsvAndSelect() === noncommit && commits === 0 && reads === 0, "noncommit selected/read CSV");
        projectEFSM.send = send;
        let attempts = 0, assigned;
        validateProjectObjectState = function (candidate, options) {
          const result = validate(candidate, options);
          if (options?.requireSlots && !attempts++) {
            const newer = projectClone(activeProject._state), csv = buildProjectCsvModel([["new"]], "retry.csv",
              newer.nextId.csv++, "", "text/csv", 1, newer);
            newer.assets.csvFiles.push(csv); newer.meta.projectName = "new CSV authority"; assigned = newer.nextId.csv;
            initialize.call(activeProject, newer);
          }
          return result;
        };
        const created = createProjectCsv([["old"]], "retry.csv"); validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && created.id === assigned && created.name === "retry (2).csv" &&
          activeProject.projectName === "new CSV authority", "create used stale id/path/authority or multiple commits");
        selectProjectCsv = () => null;
        const count = activeProject.csvFiles.length;
        check(createEmptyProjectCsvAndSelect() === null && activeProject.csvFiles.length === count + 1 && commits === 2,
          "postcommit selection rejection rolled back asset or disguised noncommit");
        selectProjectCsv = selectCsv;
        const empty = createEmptyProjectCsvAndSelect();
        check(empty && Object.isFrozen(empty) && JSON.stringify(empty.rows) === JSON.stringify([["X", "Y"], ["", ""]]) &&
          interfaceFSM.state.assetPath === projectAssetPath(empty), "empty create did not use ordinary selected copied asset");
        const beforeReadFailure = activeProject.csvFiles.length;
        readBackendProjection = (kind, request) => { if (request.operation === "assets.readDeletionTarget") throw failure;
          return query(kind, request); };
        caught = null; try { createProjectCsv([[1]], "query-failure.csv"); } catch (error) { caught = error; }
        check(caught === failure && activeProject.csvFiles.length === beforeReadFailure + 1,
          "postcommit query error swallowed or rolled back committed CSV");
      } finally { activeProject.initialize = initialize; validateProjectObjectState = validate; projectEFSM.send = send;
        readBackendProjection = query; selectProjectCsv = selectCsv;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session; }
    });

    await run(79, "Image create owns current identity, original bytes and immutable read without slot settings", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, query = readBackendProjection;
      let commits = 0, reads = 0, result;
      try {
        const next = activeProject._state.nextId.image, bytes = new Uint8Array([0, 255, 17, 128]),
          before = JSON.stringify({ slots: activeProject._state.slots, charts: activeProject.charts, csv: activeProject.csvFiles });
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        projectEFSM.send = function (event, payload) {
          check(event === "IMAGE_OBJECT_CREATED" && !Object.hasOwn(payload, "model") && !Object.hasOwn(payload, "candidate") &&
            !Object.hasOwn(payload, "imageId"), "Application supplies authoritative image model");
          if (commits === 0) {
            bytes[0] = 99;
            check(payload.bytes !== bytes && payload.bytes[0] === 0, "Application did not copy bytes before dispatch");
          }
          result = send.call(this, event, payload); return result;
        };
        readBackendProjection = (kind, request) => { if (request.operation === "assets.readDeletionTarget") reads++;
          return query(kind, request); };
        const image = createProjectImage(bytes.buffer, "candidate-image.bin", "image/custom"), fact = result.changed.assets[0];
        bytes[0] = 99;
        check(commits === 1 && reads === 1 && image.id === next && image.mime === "image/custom" &&
          JSON.stringify(Array.from(ffpxBase64ToBytes(image.bytesBase64))) === "[0,255,17,128]" && Object.isFrozen(image) &&
          image !== getProjectImage(image.id) && fact.kind === "image" && fact.role === "created" && fact.id === image.id &&
          fact.path === projectAssetPath(image) && Object.isFrozen(fact.owners) && fact.owners.length === 0 &&
          result.changed.imageIds[0] === next && result.changed.csvIds.length === 0 && activeProject._state.nextId.image === next + 1 &&
          !Object.hasOwn(image, "settings") && !Object.hasOwn(image, "fit"), "image bytes/identity/result ownership wrong");
        const collision = createProjectImage(image.bytesBase64, "candidate-image.bin", ""),
          explicit = createProjectImage(new Uint8Array([9]), "ignored.bin", "image/test", next + 20, "/assets/images/explicit.bin");
        check(collision.name === "candidate-image (2).bin" && collision.mime === "application/octet-stream" &&
          collision.bytesBase64 === image.bytesBase64 && explicit.id === next + 20 && explicit.name === "explicit.bin" &&
          activeProject._state.nextId.image === next + 21 && getProjectImage(image.id).bytesBase64 === image.bytesBase64 &&
          JSON.stringify({ slots: activeProject._state.slots, charts: activeProject.charts, csv: activeProject.csvFiles }) === before &&
          interfaceFSM.state.assetPath === session.assetPath && interfaceFSM.readState().selectedSlotId === selected,
          "collision replaced asset, explicit path/id ignored, or create changed slot/selection/CSV");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; readBackendProjection = query;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session; }
    });
    await run(80, "Image create validates before commit, retries current authority and preserves postcommit failures", () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, validate = validateProjectObjectState, send = projectEFSM.send, query = readBackendProjection,
        reconcile = interfaceFSM.reconcileProjectResult;
      let commits = 0, reads = 0, reconciliations = 0;
      try {
        const fixture = projectClone(activeProject._state), existing = buildProjectImageModel(new Uint8Array([7]), "retry-image.bin",
          "image/test", fixture.nextId.image++, fixture);
        fixture.assets.images.push(existing); initialize.call(activeProject, fixture);
        const baseline = JSON.stringify(activeProject._state), stable = interfaceFSM.state, failure = Error("expected image create failure"),
          noEffects = () => check(commits === 0 && reads === 0 && reconciliations === 0 && interfaceFSM.state === stable &&
            JSON.stringify(activeProject._state) === baseline, "rejected image create performed success work");
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        readBackendProjection = (kind, request) => { if (request.operation === "assets.readDeletionTarget") reads++;
          return query(kind, request); };
        for (const args of [[new Uint8Array(), "bad.bin"], ["@@@", "bad.bin"], [new Uint8Array([1]), "bad.bin", "", 0],
          [new Uint8Array([1]), "bad.bin", "", existing.id], [new Uint8Array([1]), "bad.bin", "", null, "/missing-parent/bad.bin"]]) {
          let caught; try { createProjectImage(...args); } catch (error) { caught = error; }
          check(caught, "invalid image input accepted"); noEffects();
        }
        validateProjectObjectState = () => { throw failure; };
        let caught; try { createProjectImage(new Uint8Array([1]), "bad.bin"); } catch (error) { caught = error; }
        check(caught === failure, "image validator exception replaced"); noEffects(); validateProjectObjectState = validate;
        const noncommit = Object.freeze({ committed: false }); projectEFSM.send = () => noncommit;
        check(createProjectImage(new Uint8Array([1]), "bad.bin") === noncommit, "noncommit image result replaced"); noEffects(); projectEFSM.send = send;
        let attempts = 0, assigned;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) {
            const newer = projectClone(activeProject._state), asset = buildProjectImageModel(new Uint8Array([8]), "retry-image.bin",
              "image/test", newer.nextId.image++, newer);
            newer.assets.images.push(asset); newer.meta.projectName = "new image authority"; assigned = newer.nextId.image;
            initialize.call(activeProject, newer);
          }
          return valid;
        };
        const created = createProjectImage(new Uint8Array([0, 255]), "retry-image.bin"); validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && reads === 1 && reconciliations === 1 && created.id === assigned &&
          created.name === "retry-image (3).bin" && activeProject.projectName === "new image authority" &&
          getProjectImage(assigned - 1).bytesBase64 === ffpxBytesToBase64(new Uint8Array([8])), "image create committed stale authority/id/path");
        const count = activeProject.images.length;
        readBackendProjection = (kind, request) => { if (request.operation === "assets.readDeletionTarget") throw failure;
          return query(kind, request); };
        caught = null; try { createProjectImage(new Uint8Array([2]), "read-fails.bin"); } catch (error) { caught = error; }
        check(caught === failure && commits === 2 && activeProject.images.length === count + 1,
          "postcommit query error swallowed or rolled back image asset");
      } finally { activeProject.initialize = initialize; validateProjectObjectState = validate; projectEFSM.send = send;
        readBackendProjection = query; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session; }
    });

    await run(81, "Directory create commits current candidate and selects actual immutable result path", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        send = projectEFSM.send, initialize = activeProject.initialize, frontendSend = interfaceFSM.send;
      let commits = 0, result, selections = 0;
      try {
        const before = projectClone(activeProject._state), parent = PROJECT_ASSET_DIRECTORIES.csv;
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        projectEFSM.send = function (event, payload) {
          check(event === "PROJECT_DIRECTORY_CREATED" && payload.parent === parent && payload.name === "directory-candidate" &&
            !payload.candidate && !payload.path && !payload.model, "Application passed directory authority rather than new inputs");
          result = send.call(this, event, payload); return result;
        };
        interfaceFSM.send = function (event, payload) {
          if (event === "SELECT_ASSET") { selections++;
            check(result.committed && payload.kind === "directory" && payload.path === result.changed.createdDirectoryPath,
              "directory selection used stale request path"); }
          return frontendSend.call(this, event, payload);
        };
        const path = api.assets.createDirectory(parent, "directory-candidate");
        check(path === `${parent}/directory-candidate` && commits === 1 && selections === 1 &&
          projectVfs.resolve(path).kind === "directory" && interfaceFSM.state.assetPath === path &&
          interfaceFSM.state.assetSelection === "directory", "directory not committed/selected once");
        check(Object.isFrozen(result.changed) && result.changed.createdDirectoryPath === path &&
          result.changed.chartIds.length === 0 && result.changed.csvIds.length === 0 && result.changed.imageIds.length === 0 &&
          result.changed.slotIds.length === 0 && result.changed.assets.length === 0, "directory actual changed facts wrong");
        const expected = projectClone(before); expected.fileSystem.directories.push(path); expected.fileSystem.directories.sort();
        check(JSON.stringify(activeProject._state) === JSON.stringify(expected), "directory create changed assets/slots/next-id");
        projectEFSM.send = send; interfaceFSM.send = frontendSend;
        const nested = api.assets.createDirectory(path, "nested"), root = api.assets.createDirectory("/", "root-candidate");
        check(nested === `${path}/nested` && root === "/root-candidate" && projectVfs.resolve(nested).kind === "directory",
          "nested/root current parent creation failed");
        check(!/status\(|projectVfs\.|activeProject/.test(createProjectDirectory.toString()), "Application owns directory calculation/status");
      } finally { projectEFSM.send = send; activeProject.initialize = initialize; interfaceFSM.send = frontendSend;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session; }
    });
    await run(82, "Directory create retries latest parent and gates selection on commit without rollback", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, validate = validateProjectObjectState, send = projectEFSM.send,
        frontendSend = interfaceFSM.send, reconcile = interfaceFSM.reconcileProjectResult, parent = PROJECT_ASSET_DIRECTORIES.csv,
        failure = Error("directory original failure");
      let commits = 0, selections = 0, reconciliations = 0;
      try {
        const baseline = JSON.stringify(activeProject._state), stable = interfaceFSM.state;
        activeProject.initialize = function (state) { commits++; return initialize.call(this, state); };
        interfaceFSM.send = function (event, payload) { if (event === "SELECT_ASSET") selections++;
          return frontendSend.call(this, event, payload); };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        const noEffects = () => check(commits === 0 && selections === 0 && reconciliations === 0 &&
          JSON.stringify(activeProject._state) === baseline && interfaceFSM.state === stable, "rejected directory performed success work");
        for (const args of [["/no-parent", "folder"], [parent, ""], [parent, ".."], [parent, "a/b"],
          [projectParentPath(parent), projectPathName(parent)]]) {
          let caught; try { api.assets.createDirectory(...args); } catch (error) { caught = error; }
          check(caught, "invalid/colliding directory accepted"); noEffects();
        }
        let caught; try { api.assets.createDirectory(parent, { toString() { throw failure; } }); } catch (error) { caught = error; }
        check(caught === failure, "directory input error replaced"); noEffects();
        validateProjectObjectState = () => { throw failure; };
        caught = null; try { api.assets.createDirectory(parent, "validator-fails"); } catch (error) { caught = error; }
        check(caught === failure, "directory validation error replaced"); noEffects(); validateProjectObjectState = validate;
        projectEFSM.send = () => Object.freeze({ committed: false });
        check(api.assets.createDirectory(parent, "uncommitted") === null, "directory noncommit return leaked result");
        noEffects(); projectEFSM.send = send;
        let attempts = 0;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) {
            const newer = projectClone(activeProject._state); newer.meta.projectName = "latest directory authority";
            newer.fileSystem.directories.push(`${parent}/concurrent`); initialize.call(activeProject, newer);
          }
          return valid;
        };
        const path = api.assets.createDirectory(parent, "retry-directory"); validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && selections === 1 && reconciliations === 1 &&
          activeProject.projectName === "latest directory authority" && projectVfs.resolve(`${parent}/concurrent`) && projectVfs.resolve(path),
          "directory create overwrote newer source or committed more than once");
        let stateBeforeSelection;
        interfaceFSM.send = function (event, payload) { if (event === "SELECT_ASSET") {
          selections++; stateBeforeSelection = this.state; return this.state; } return frontendSend.call(this, event, payload); };
        const rejected = api.assets.createDirectory(parent, "selection-rejected");
        check(rejected === `${parent}/selection-rejected` && projectVfs.resolve(rejected) && interfaceFSM.state === stateBeforeSelection,
          "rejected selection rolled back committed directory/changed return");
        interfaceFSM.send = function (event, payload) { if (event === "SELECT_ASSET") throw failure;
          return frontendSend.call(this, event, payload); };
        caught = null; try { api.assets.createDirectory(parent, "selection-throws"); } catch (error) { caught = error; }
        check(caught === failure && projectVfs.resolve(`${parent}/selection-throws`), "selection error swallowed or rolled back directory");
        // Parent disappearance during validation must reject the recalculated attempt, not commit stale directory.
        const disappearing = `${parent}/disappearing`, prep = projectClone(activeProject._state);
        prep.fileSystem.directories.push(disappearing); initialize.call(activeProject, prep); attempts = 0;
        const priorCommits = commits, priorSelections = selections;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) { const newer = projectClone(activeProject._state);
            newer.fileSystem.directories = newer.fileSystem.directories.filter(path => path !== disappearing);
            initialize.call(activeProject, newer); }
          return valid;
        };
        caught = null; try { api.assets.createDirectory(disappearing, "child"); } catch (error) { caught = error; }
        check(caught && commits === priorCommits && selections === priorSelections &&
          !projectVfs.resolve(`${disappearing}/child`), "stale removed parent candidate committed");
      } finally { activeProject.initialize = initialize; validateProjectObjectState = validate; projectEFSM.send = send;
        interfaceFSM.send = frontendSend; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); selectedSlotId = selected; interfaceFSM.state = session; }
    });


    await run(83, "project name Backend normalization and official success read", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, query = readBackendProjection,
        reconcile = interfaceFSM.reconcileProjectResult;
      let commits = 0, reads = 0, reconciliations = 0, last;
      try {
        activeProject.initialize = function (candidate) { commits++; return initialize.call(this, candidate); };
        projectEFSM.send = function (event, payload) {
          if (event === "PROJECT_NAME_CHANGED") check(Object.keys(payload).sort().join(",") === "trim,value",
            "Application normalized name or supplied candidate");
          return last = send.call(this, event, payload);
        };
        readBackendProjection = function (kind, request) {
          if (kind === "project-api" && request.operation === "project.readName") {
            reads++; check(commits > 0, "success query before commit");
          }
          return query(kind, request);
        };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        const prior = projectClone(activeProject._state), path = interfaceFSM.state.assetPath,
          maximum = BackendSettings.defaults.naming.projectNameMaxLength;
        let result = api.project.setName("  project name  ");
        check(result === "  project name  " && commits === 1 && reads === 1 && reconciliations === 1,
          "default no-trim/result/commit/query contract wrong");
        prior.meta.projectName = result;
        check(JSON.stringify(prior) === JSON.stringify(activeProject._state), "name changed another Project field");
        check(last.committed && Object.isFrozen(last.changed) && Object.values(last.changed).every(value => value.length === 0),
          "name command invented changed identity/asset facts");
        check(api.project.setName("  trimmed  ", true) === "trimmed", "explicit trim ignored");
        check(api.project.setName("  not boolean  ", "true") === "  not boolean  ", "truthy input treated as trim=True");
        check(api.project.setName("a".repeat(maximum + 20), true).length === maximum, "configured name limit ignored");
        check(api.project.setName(42) === "42" && api.project.setName(null) === "null" &&
          api.project.setName(undefined) === "undefined" && api.project.setName("", true) === "",
          "scalar text or empty name meaning changed");
        const detached = api.project.readName();
        check(typeof detached === "string" && detached === "", "official public read shape wrong");
        api.project.setName("later");
        check(detached === "" && api.project.readName() === "later" && interfaceFSM.state.assetPath === path &&
          interfaceFSM.readState().selectedSlotId === selected, "name read stale/shared or selection changed");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; readBackendProjection = query;
        interfaceFSM.reconcileProjectResult = reconcile; initialize.call(activeProject, saved);
        interfaceFSM.state = session; selectedSlotId = selected; }
    });

    await run(84, "project name failure boundaries and current-authority retries", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, query = readBackendProjection,
        validate = validateProjectObjectState, reconcile = interfaceFSM.reconcileProjectResult,
        failure = Error("name boundary failure");
      let commits = 0, reads = 0, reconciliations = 0, caught;
      const noEffects = (source, runtime) => check(activeProject._state === source && interfaceFSM.state === runtime &&
        commits === 0 && reads === 0 && reconciliations === 0, "failed name command produced success work");
      try {
        activeProject.initialize = function (candidate) { commits++; return initialize.call(this, candidate); };
        readBackendProjection = function (kind, request) {
          if (kind === "project-api" && request.operation === "project.readName") reads++;
          return query(kind, request);
        };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        const source = activeProject._state, runtime = interfaceFSM.state;
        caught = null; try { api.project.setName({ toString() { throw failure; } }); } catch (error) { caught = error; }
        check(caught === failure, "text conversion error replaced"); noEffects(source, runtime);
        validateProjectObjectState = () => { throw failure; };
        caught = null; try { api.project.setName("invalid candidate"); } catch (error) { caught = error; }
        check(caught === failure, "name validator error replaced"); noEffects(source, runtime);
        validateProjectObjectState = validate;
        projectEFSM.send = () => Object.freeze({ committed: false });
        check(api.project.setName("uncommitted") === null, "name noncommit exposed adapter/current value");
        noEffects(source, runtime); projectEFSM.send = send;
        let conversions = 0;
        const input = { toString() {
          if (!conversions++) { const newer = projectClone(activeProject._state); newer.meta.appBuild = "name-newer-conversion";
            initialize.call(activeProject, newer); }
          return "retry name";
        } };
        check(api.project.setName(input) === "retry name" && conversions === 2 && commits === 1 && reads === 1 &&
          reconciliations === 1 && activeProject._state.meta.appBuild === "name-newer-conversion",
          "name conversion captured authority too late or overwrote concurrent state");
        let attempts = 0;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) { const newer = projectClone(activeProject._state);
            newer.meta.appBuild = "name-newer-validation"; initialize.call(activeProject, newer); }
          return valid;
        };
        const before = commits;
        check(api.project.setName("validation retry") === "validation retry" && attempts === 2 &&
          commits === before + 1 && activeProject._state.meta.appBuild === "name-newer-validation",
          "name validation stale attempt committed"); validateProjectObjectState = validate;
        readBackendProjection = function (kind, request) {
          if (kind === "project-api" && request.operation === "project.readName") throw failure;
          return query(kind, request);
        };
        caught = null; try { api.project.setName("committed before query error"); } catch (error) { caught = error; }
        check(caught === failure && activeProject.projectName === "committed before query error", "name query error swallowed/rolled back");
        readBackendProjection = query;
        interfaceFSM.reconcileProjectResult = () => { throw failure; };
        caught = null; try { api.project.setName("committed before reconcile error"); } catch (error) { caught = error; }
        check(caught === failure && activeProject.projectName === "committed before reconcile error", "name reconcile error swallowed/rolled back");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; readBackendProjection = query;
        validateProjectObjectState = validate; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); interfaceFSM.state = session; selectedSlotId = selected; }
    });


    await run(85, "Explicit slot type edits preserve payload and selection without pending state", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, render = renderDashboard;
      try {
        api.layout.setGrid(2, 2);
        const prepared = projectClone(activeProject._state); normalizeSlotContents(prepared.slots);
        const [first, target] = prepared.slots.filter(slot => !slot.hidden);
        first.content.contentType = "image"; target.content.contentType = "graph";
        initialize.call(activeProject, prepared);
        select(slotAt(first.id));
        let commits = 0, renders = 0, last;
        activeProject.initialize = function (candidate) { commits++; return initialize.call(this, candidate); };
        projectEFSM.send = function (event, payload) {
          if (event === "SLOT_TYPE_CHANGED") check(Object.keys(payload).sort().join(",") === "contentType,slotId" &&
            payload.slotId === target.id, "slot wrapper substituted selected id/model/pending type");
          return last = send.call(this, event, payload);
        };
        renderDashboard = () => { renders++; };
        const before = projectClone(activeProject._state), assetPath = interfaceFSM.state.assetPath;
        check(api.slots.setContentType(target.id, "image") === null, "slot type leaked result/boolean");
        const expectedTarget = before.slots.find(slot => slot.id === target.id);
        (expectedTarget.content || expectedTarget).contentType = "image";
        check(JSON.stringify(activeProject._state) === JSON.stringify(before) && commits === 1 && renders === 1,
          "slot type mutated payload/geometry/assets or missed one candidate commit/render");
        check(interfaceFSM.readState().selectedSlotId === first.id && interfaceFSM.state.assetPath === assetPath,
          "explicit other-slot edit replaced current selection");
        check(Object.isFrozen(last.changed) && last.changed.slotIds.join(",") === String(target.id) &&
          last.changed.chartIds.length === 0 && last.changed.assets.length === 0, "slot changed facts wrong");
        check(api.slots.setContentType(target.id, "other") === null && slotAt(target.id).contentType === "graph",
          "non-image normalization differs from Source");
        const source = activeProject._state, count = commits;
        appFSM.send("SELECT_SLOT", { slotId: target.id, toggle: false, direction: "ui-to-fsm" });
        check(activeProject._state === source && commits === count && slotAt(target.id).contentType === "graph",
          "selection applied remembered image type or mutated Project");
        check(!("pendingSlotContentType" in projectObjects.read("ui")), "pending type authority survived");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; renderDashboard = render;
        initialize.call(activeProject, saved); interfaceFSM.state = session; selectedSlotId = selected; }
    });

    await run(86, "Slot type validates explicit current target and retries before one commit", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, render = renderDashboard,
        validate = validateProjectObjectState, reconcile = interfaceFSM.reconcileProjectResult, failure = Error("slot type boundary");
      try {
        api.layout.setGrid(2, 2);
        const id = activeProject.slots.find(slot => !slot.hidden).id;
        let commits = 0, renders = 0, reconciliations = 0, caught;
        activeProject.initialize = function (candidate) { commits++; return initialize.call(this, candidate); };
        renderDashboard = () => { renders++; };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        const source = activeProject._state, runtime = interfaceFSM.state;
        for (const bad of [undefined, null, -1, String(id)]) {
          caught = null; try { api.slots.setContentType(bad, "image"); } catch (error) { caught = error; }
          check(caught && activeProject._state === source && interfaceFSM.state === runtime &&
            commits === 0 && renders === 0 && reconciliations === 0, "invalid slot id changed state or stored pending type");
        }
        validateProjectObjectState = () => { throw failure; };
        caught = null; try { api.slots.setContentType(id, "image"); } catch (error) { caught = error; }
        check(caught === failure && activeProject._state === source && commits === 0 && renders === 0, "slot validation failed partially");
        validateProjectObjectState = validate;
        projectEFSM.send = () => Object.freeze({ committed: false });
        check(api.slots.setContentType(id, "image") === null && renders === 0 && reconciliations === 0,
          "slot noncommit executed success work"); projectEFSM.send = send;
        let attempts = 0;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) { const newer = projectClone(activeProject._state);
            newer.meta.projectName = "latest slot type"; initialize.call(activeProject, newer); }
          return valid;
        };
        api.slots.setContentType(id, "image"); validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && renders === 1 && reconciliations === 1 &&
          activeProject.projectName === "latest slot type" && slotAt(id).contentType === "image",
          "slot type committed stale state or multiple attempts");
        renderDashboard = () => { throw failure; };
        caught = null; try { api.slots.setContentType(id, "graph"); } catch (error) { caught = error; }
        check(caught === failure && slotAt(id).contentType === "graph", "postcommit slot render error swallowed/rolled back");
        renderDashboard = () => { renders++; }; attempts = 0; const prior = commits;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) { const newer = projectClone(activeProject._state);
            newer.slots.find(slot => slot.id === id).hidden = true; initialize.call(activeProject, newer); }
          return valid;
        };
        caught = null; try { api.slots.setContentType(id, "image"); } catch (error) { caught = error; }
        check(caught && commits === prior && slotAt(id).hidden && slotAt(id).contentType === "graph",
          "retry committed a now-hidden target");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; renderDashboard = render;
        validateProjectObjectState = validate; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); interfaceFSM.state = session; selectedSlotId = selected; }
    });


    await run(87, "Slot reset restores config local defaults and removes only owned chart", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, render = renderDashboard;
      try {
        api.layout.setGrid(2, 2);
        const [target, other] = activeProject.slots.filter(slot => !slot.hidden);
        const csv = createProjectCsv([["X", "Y"], [1, 2]], "reset-contract.csv");
        // Build this test's owned chart independently of earlier cases.
        api.slots.reset(target.id); select(slotAt(target.id)); api.graphs.addObject(csv.id);
        const chartId = slotAt(target.id).chart;
        const image = createProjectImage(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'), "reset.svg", "image/svg+xml");
        const prepared = projectClone(activeProject._state); normalizeSlotContents(prepared.slots);
        const first = prepared.slots.find(slot => slot.id === target.id), second = prepared.slots.find(slot => slot.id === other.id);
        first.caption = "owned caption"; first.content.imageSettings = { fit: "manual", scale: 130, x: 2, y: 3 };
        second.content.imageId = image.id; second.content.contentType = "image"; second.caption = "other caption";
        second.content.imageSettings = { fit: "manual", scale: 150, x: 4, y: 5 };
        initialize.call(activeProject, prepared);
        select(slotAt(other.id)); api.assets.selectCsv(projectAssetPath(getProjectCsv(csv.id)));
        const path = interfaceFSM.state.assetPath, before = projectClone(activeProject._state);
        let commits = 0, paints = 0, result;
        activeProject.initialize = function (candidate) { commits++; return initialize.call(this, candidate); };
        projectEFSM.send = function (event, payload) {
          if (event === "SLOTS_RESET") check(Object.keys(payload).join(",") === "slotIds" &&
            payload.slotIds.length === 1 && payload.slotIds[0] === target.id, "reset wrapper passed model or selected target");
          return result = send.call(this, event, payload);
        };
        renderDashboard = () => { paints++; };
        check(api.slots.reset(target.id) === null, "reset exposed internal result");
        const expected = before.slots.find(slot => slot.id === target.id);
        Object.assign(expected.content || expected, projectClone(BackendSettings.defaults.slotSettings.content), { chart: null, imageId: null });
        expected.caption = null; before.charts = before.charts.filter(chart => chart.id !== chartId);
        check(JSON.stringify(before) === JSON.stringify(activeProject._state) && commits === 1 && paints === 1 &&
          !getChart(chartId) && getProjectCsv(csv.id) && getProjectImage(image.id), "reset changed placement/assets/other slot or failed defaults");
        check(interfaceFSM.state.assetPath === path && interfaceFSM.readState().selectedSlotId === other.id,
          "reset unconditionally cleared asset or selected slot");
        check(Object.isFrozen(result.changed) && result.changed.slotIds.join(",") === String(target.id) &&
          result.changed.chartIds.join(",") === String(chartId) && result.changed.csvIds.length === 0 &&
          result.changed.imageIds.length === 0 && result.changed.assets.length === 0, "reset actual changed facts wrong");
        projectEFSM.send = send;
        check(api.slots.reset(other.id) === null && slotAt(other.id).imageId === null && slotAt(other.id).caption === null &&
          JSON.stringify(slotAt(other.id).content.imageSettings) === JSON.stringify(DEFAULT_IMAGE_SETTINGS) &&
          getProjectImage(image.id) && interfaceFSM.state.assetPath === path, "image reset deleted asset/defaults/selection");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; renderDashboard = render;
        initialize.call(activeProject, saved); interfaceFSM.state = session; selectedSlotId = selected; }
    });

    await run(88, "Slot reset rejects hidden references, retries latest payload and gates success", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, render = renderDashboard,
        validate = validateProjectObjectState, reconcile = interfaceFSM.reconcileProjectResult, failure = Error("reset boundary");
      try {
        api.layout.setGrid(2, 2);
        const id = activeProject.slots.find(slot => !slot.hidden).id;
        const prepared = projectClone(activeProject._state); normalizeSlotContents(prepared.slots);
        prepared.slots.find(slot => slot.id === id).caption = "initial reset target"; initialize.call(activeProject, prepared);
        let commits = 0, paints = 0, reconciliations = 0, caught;
        activeProject.initialize = function (candidate) { commits++; return initialize.call(this, candidate); };
        renderDashboard = () => { paints++; };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        const source = activeProject._state, runtime = interfaceFSM.state;
        for (const bad of [undefined, null, -1, String(id)]) {
          caught = null; try { api.slots.reset(bad); } catch (error) { caught = error; }
          check(caught && activeProject._state === source && interfaceFSM.state === runtime && commits === 0 && paints === 0 &&
            reconciliations === 0, "invalid reset partially changed state");
        }
        validateProjectObjectState = () => { throw failure; };
        caught = null; try { api.slots.reset(id); } catch (error) { caught = error; }
        check(caught === failure && activeProject._state === source && commits === 0 && paints === 0, "reset validation failure swallowed/partially committed");
        validateProjectObjectState = validate; projectEFSM.send = () => Object.freeze({ committed: false });
        check(api.slots.reset(id) === null && paints === 0 && reconciliations === 0, "reset noncommit ran success work"); projectEFSM.send = send;
        let attempts = 0;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) {
            const newer = projectClone(activeProject._state); newer.meta.projectName = "latest reset authority";
            newer.slots.find(slot => slot.id === id).caption = "new caption"; initialize.call(activeProject, newer);
          }
          return valid;
        };
        api.slots.reset(id); validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && paints === 1 && reconciliations === 1 &&
          activeProject.projectName === "latest reset authority" && slotAt(id).caption === null, "reset committed stale candidate or multiple commits");
        const hidden = projectClone(activeProject._state); hidden.slots.find(slot => slot.id === id).hidden = true;
        initialize.call(activeProject, hidden); const hiddenSource = activeProject._state, count = commits;
        caught = null; try { api.slots.reset(id); } catch (error) { caught = error; }
        check(caught && activeProject._state === hiddenSource && commits === count, "reset accepted hidden target");
        hidden.slots.find(slot => slot.id === id).hidden = false; hidden.slots.find(slot => slot.id === id).caption = "keep until commit";
        initialize.call(activeProject, hidden); renderDashboard = () => { throw failure; };
        caught = null; try { api.slots.reset(id); } catch (error) { caught = error; }
        check(caught === failure && slotAt(id).caption === null, "postcommit reset renderer error swallowed/rolled back");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; renderDashboard = render;
        validateProjectObjectState = validate; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); interfaceFSM.state = session; selectedSlotId = selected; }
    });


    await run(89, "Slot swap exchanges complete local payload and reconciles selection without clearing assets", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, render = renderDashboard;
      try {
        api.layout.setGrid(2, 2);
        const [a, b] = activeProject.slots.filter(slot => !slot.hidden);
        api.slots.reset(a.id); api.slots.reset(b.id);
        const csv = createProjectCsv([["X", "Y"], [1, 2]], "swap-csv.csv");
        select(slotAt(a.id)); api.graphs.addObject(csv.id);
        const chartId = slotAt(a.id).chart, fixture = projectClone(activeProject._state); normalizeSlotContents(fixture.slots);
        fixture.slots.find(slot => slot.id === a.id).caption = "A";
        const second = fixture.slots.find(slot => slot.id === b.id);
        second.caption = "B"; second.content.contentType = "image"; second.content.imageSettings = { fit: "manual", scale: 140, x: 8, y: 9 };
        second.content.extension = { preserved: [1, 2] };
        initialize.call(activeProject, fixture); select(slotAt(a.id)); api.assets.selectCsv(projectAssetPath(getProjectCsv(csv.id)));
        appFSM.send("SELECT_GRAPH_OBJECT", { index: 0, selectAsset: false });
        check(interfaceFSM.state.graphObjectIndex === 0, "swap fixture did not establish validated object selection");
        const before = projectClone(activeProject._state), path = interfaceFSM.state.assetPath;
        let commits = 0, paints = 0, result;
        activeProject.initialize = function (candidate) { commits++; return initialize.call(this, candidate); };
        renderDashboard = () => { paints++; };
        projectEFSM.send = function (event, payload) {
          if (event === "SLOTS_SWAPPED") check(Object.keys(payload).sort().join(",") === "sourceSlotId,targetSlotId", "swap passed payload authority");
          return result = send.call(this, event, payload);
        };
        check(api.slots.swap(a.id, b.id) === true, "swap did not return committed Boolean");
        normalizeSlotContents(before.slots);
        const firstExpected = before.slots.find(slot => slot.id === a.id), secondExpected = before.slots.find(slot => slot.id === b.id),
          content = firstExpected.content, caption = firstExpected.caption;
        firstExpected.content = secondExpected.content; firstExpected.caption = secondExpected.caption;
        secondExpected.content = content; secondExpected.caption = caption;
        check(JSON.stringify(activeProject._state) === JSON.stringify(before) && commits === 1 && paints === 1 &&
          slotAt(b.id).chart === chartId && getChart(chartId) &&
          JSON.stringify(slotAt(a.id).content.extension) === JSON.stringify({ preserved: [1, 2] }),
          "swap lost local extension/geometry/assets or made partial commits");
        check(interfaceFSM.readState().selectedSlotId === b.id && interfaceFSM.state.graphObjectIndex === 0 &&
          interfaceFSM.state.assetPath === path, "swap cleared selections instead of following payload");
        check(result.selectionHints.swapSlotIds.join(",") === [a.id, b.id].join(",") &&
          Object.keys(result.selectionHints).length === 1 && Object.isFrozen(result.selectionHints.swapSlotIds) &&
          result.changed.slotIds.length === 2 && !result.changed.chartIds.length && !result.changed.assets.length, "swap facts/hints invented changes");
        // Equal ordinary fields but different canonical extension must still be actual changed slots.
        projectEFSM.send = send;
        const onlyExtensions = projectClone(activeProject._state); normalizeSlotContents(onlyExtensions.slots);
        const x = onlyExtensions.slots.find(slot => slot.id === a.id), y = onlyExtensions.slots.find(slot => slot.id === b.id);
        x.content = { ...projectClone(BackendSettings.defaults.slotSettings.content), chart: null, imageId: null, extension: "left" };
        y.content = { ...projectClone(x.content), extension: "right" }; x.caption = y.caption = null;
        onlyExtensions.charts = onlyExtensions.charts.filter(chart => chart.id !== chartId);
        initialize.call(activeProject, onlyExtensions);
        const canonicalResult = dispatchProjectCommand("SLOTS_SWAPPED", { sourceSlotId: a.id, targetSlotId: b.id });
        check(canonicalResult.changed.slotIds.length === 2 && slotAt(a.id).content.extension === "right" &&
          slotAt(b.id).content.extension === "left", "extension-only swap omitted actual changed slot facts");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; renderDashboard = render;
        initialize.call(activeProject, saved); interfaceFSM.state = session; selectedSlotId = selected; }
    });

    await run(90, "Slot swap noops invalid targets and retries current payload with original failure boundaries", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, render = renderDashboard,
        validate = validateProjectObjectState, reconcile = interfaceFSM.reconcileProjectResult, failure = Error("swap boundary");
      try {
        api.layout.setGrid(2, 2);
        const [a, b] = activeProject.slots.filter(slot => !slot.hidden);
        let commits = 0, paints = 0, reconciliations = 0, caught;
        activeProject.initialize = function (candidate) { commits++; return initialize.call(this, candidate); };
        renderDashboard = () => { paints++; };
        interfaceFSM.reconcileProjectResult = function (...args) { reconciliations++; return reconcile.apply(this, args); };
        const source = activeProject._state, runtime = interfaceFSM.state;
        for (const [x, y] of [[a.id, a.id], [null, b.id], [a.id, -1], [String(a.id), b.id]]) {
          check(api.slots.swap(x, y) === false && activeProject._state === source && interfaceFSM.state === runtime &&
            !commits && !paints && !reconciliations, "invalid/equal swap threw or ran success work");
        }
        validateProjectObjectState = () => { throw failure; };
        try { api.slots.swap(a.id, b.id); } catch (error) { caught = error; }
        check(caught === failure && activeProject._state === source && !commits && !paints, "swap validation error lost/partially committed");
        validateProjectObjectState = validate; projectEFSM.send = () => Object.freeze({ committed: false });
        check(api.slots.swap(a.id, b.id) === false && !paints && !reconciliations, "noncommit swap rendered/reconciled"); projectEFSM.send = send;
        let attempts = 0;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) {
            const newer = projectClone(activeProject._state); newer.meta.projectName = "latest swap authority";
            newer.slots.find(slot => slot.id === a.id).caption = "newest A"; newer.slots.find(slot => slot.id === b.id).caption = "newest B";
            initialize.call(activeProject, newer);
          }
          return valid;
        };
        check(api.slots.swap(a.id, b.id), "retry swap not committed"); validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && paints === 1 && reconciliations === 1 &&
          activeProject.projectName === "latest swap authority" && slotAt(a.id).caption === "newest B" &&
          slotAt(b.id).caption === "newest A", "swap used stale payload/authority or multiple commits");
        const hidden = projectClone(activeProject._state); hidden.slots.find(slot => slot.id === b.id).hidden = true;
        initialize.call(activeProject, hidden); const latest = activeProject._state;
        check(api.slots.swap(a.id, b.id) === false && activeProject._state === latest && commits === 1, "hidden swap committed");
        hidden.slots.find(slot => slot.id === b.id).hidden = false; initialize.call(activeProject, hidden);
        renderDashboard = () => { throw failure; }; caught = null;
        try { api.slots.swap(a.id, b.id); } catch (error) { caught = error; }
        check(caught === failure && slotAt(a.id).caption === "newest A", "postcommit renderer error swallowed or rolled back");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; renderDashboard = render;
        validateProjectObjectState = validate; interfaceFSM.reconcileProjectResult = reconcile;
        initialize.call(activeProject, saved); interfaceFSM.state = session; selectedSlotId = selected; }
    });


    await run(91, "Empty image inserts raw SVG using one current candidate and copied actual-path read", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, query = readBackendProjection, render = renderDashboard;
      try {
        api.layout.setGrid(2, 2); const id = activeProject.slots.find(slot => !slot.hidden).id;
        select(slotAt(id)); api.slots.setContentType(id, "graph");
        const noImage = activeProject._state;
        check(api.images.insertEmpty() === null && activeProject._state === noImage, "non-image empty insertion changed Project");
        api.slots.setContentType(id, "image");
        const fixture = projectClone(activeProject._state); normalizeSlotContents(fixture.slots);
        const slot = fixture.slots.find(slot => slot.id === id); slot.caption = "retained";
        slot.content.imageSettings = { fit: "manual", scale: 140, x: 8, y: 9 }; initialize.call(activeProject, fixture);
        const before = projectClone(activeProject._state), runtime = interfaceFSM.readState();
        let commits = 0, paints = 0, reads = 0, result, actualPath;
        activeProject.initialize = function (candidate) { commits++; return initialize.call(this, candidate); };
        renderDashboard = () => { paints++; };
        projectEFSM.send = function (event, payload) {
          if (event === "SLOT_IMAGE_IMPORTED") {
            check(payload.slotId === id && payload.operation === "images.insertEmpty" &&
              Object.keys(payload).sort().join(",") === "imageInput,operation,slotId" &&
              Object.keys(payload.imageInput).sort().join(",") === "bytes,mime,name" &&
              payload.imageInput.bytes instanceof Uint8Array, "empty image passed Project/model authority");
          }
          return result = send.call(this, event, payload);
        };
        readBackendProjection = function (kind, request) {
          if (kind === "project-api" && request.operation === "assets.readDeletionTarget") {
            reads++; check(result.committed && commits === 1 && request.path === result.changed.assets[0].path, "empty image read before commit/wrong path");
            actualPath = request.path;
          }
          return query(kind, request);
        };
        const image = api.images.insertEmpty(), model = getProjectImage(image.id),
          expectedSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"></svg>';
        check(commits === 1 && reads === 1 && paints === 1 && Object.isFrozen(image) && image !== model &&
          image.id === before.nextId.image && image.name.startsWith("빈 이미지") && image.mime === "image/svg+xml" &&
          new TextDecoder().decode(ffpxBase64ToBytes(image.bytesBase64)) === expectedSvg &&
          activeProject._state.nextId.image === image.id + 1 && slotAt(id).imageId === image.id, "empty image wrong copied bytes/identity or multi-commit");
        check(JSON.stringify(activeProject._state.assets.csvFiles) === JSON.stringify(before.assets.csvFiles) &&
          activeProject.images.length === before.assets.images.length + 1 && JSON.stringify(activeProject.charts) === JSON.stringify(before.charts.filter(chart => chart.id !== before.slots.find(slot => slot.id === id).chart)) &&
          slotAt(id).chart === null && slotAt(id).caption === "retained" && slotAt(id).content.imageSettings.scale === 140 &&
          interfaceFSM.readState().selectedSlotId === runtime.selectedSlotId && interfaceFSM.state.assetPath === runtime.assetPath,
          "empty image changed unrelated assets/chart/settings/caption/selection");
        check(Object.isFrozen(result.changed.assets) && result.changed.slotIds.join(",") === String(id) &&
          result.changed.assets[0].owners[0].slotId === id && result.changed.assets[0].owners[0].chartId === null &&
          projectAssetPath(model) === actualPath, "empty image actual facts incorrect");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; readBackendProjection = query; renderDashboard = render;
        initialize.call(activeProject, saved); interfaceFSM.state = session; selectedSlotId = selected; }
    });

    await run(92, "Empty image retries current ids/path and rejects stale slot without partial commit", async () => {
      const saved = projectClone(activeProject._state), session = interfaceFSM.state, selected = selectedSlotId,
        initialize = activeProject.initialize, send = projectEFSM.send, query = readBackendProjection, render = renderDashboard,
        validate = validateProjectObjectState, failure = Error("empty image boundary");
      try {
        const id = activeProject.slots.find(slot => !slot.hidden).id; select(slotAt(id)); api.slots.setContentType(id, "image");
        let commits = 0, paints = 0, successReads = 0, caught;
        activeProject.initialize = function (candidate) { commits++; return initialize.call(this, candidate); };
        renderDashboard = () => { paints++; };
        readBackendProjection = function (kind, request) {
          if (kind === "project-api" && request.operation === "assets.readDeletionTarget") successReads++;
          return query(kind, request);
        };
        const source = activeProject._state;
        validateProjectObjectState = () => { throw failure; };
        try { api.images.insertEmpty(); } catch (error) { caught = error; }
        check(caught === failure && activeProject._state === source && !commits && !paints && !successReads, "empty validation error partially committed");
        validateProjectObjectState = validate; projectEFSM.send = () => Object.freeze({ committed: false });
        check(api.images.insertEmpty() === null && !commits && !paints && !successReads, "empty noncommit read/rendered"); projectEFSM.send = send;
        let attempts = 0, expectedId, expectedPath;
        validateProjectObjectState = function (candidate, options) {
          const valid = validate(candidate, options);
          if (options?.requireSlots && !attempts++) {
            const newer = projectClone(activeProject._state), extra = buildProjectImageModel(new Uint8Array([1]), "빈 이미지.svg", "image/svg+xml", newer.nextId.image++, newer);
            // Assign an explicit existing image in this newer authority to force fresh id/path resolution.
            extra.name = "빈 이미지.svg"; extra.directory = PROJECT_ASSET_DIRECTORIES.image;
            newer.assets.images.push(extra); newer.meta.projectName = "new image authority";
            expectedId = newer.nextId.image; expectedPath = projectVfs.uniquePath(PROJECT_ASSET_DIRECTORIES.image, "빈 이미지.svg", newer);
            initialize.call(activeProject, newer);
          }
          return valid;
        };
        const image = api.images.insertEmpty(); validateProjectObjectState = validate;
        check(attempts === 2 && commits === 1 && paints === 1 && successReads === 1 && image.id === expectedId &&
          projectAssetPath(image) === expectedPath && activeProject.projectName === "new image authority", "empty image committed stale next-id/path or multiple commits");
        readBackendProjection = function (kind, request) {
          if (kind === "project-api" && request.operation === "assets.readDeletionTarget") throw failure;
          return query(kind, request);
        };
        const previousId = slotAt(id).imageId; caught = null;
        try { api.images.insertEmpty(); } catch (error) { caught = error; }
        check(caught === failure && slotAt(id).imageId !== previousId && commits === 2, "late empty query failure swallowed/rolled back");
        readBackendProjection = function (kind, request) {
          const value = query(kind, request);
          if (kind === "slot-selection-context") {
            const newer = projectClone(activeProject._state); normalizeSlotContents(newer.slots);
            newer.slots.find(slot => slot.id === id).content.contentType = "graph"; initialize.call(activeProject, newer);
          }
          return value;
        };
        const imageCount = activeProject.images.length; caught = null;
        try { api.images.insertEmpty(); } catch (error) { caught = error; }
        check(caught && activeProject.images.length === imageCount && commits === 2, "stale slot accepted image creation");
      } finally { activeProject.initialize = initialize; projectEFSM.send = send; readBackendProjection = query; renderDashboard = render;
        validateProjectObjectState = validate; initialize.call(activeProject, saved); interfaceFSM.state = session; selectedSlotId = selected; }
    });

  } catch (error) {
    results.push({ number: 0, name: "setup", result: "fail", detail: String(error?.stack || error) });
  } finally {
    document.documentElement.setAttribute(
      "data-fast-figure-regression-target",
      btoa(unescape(encodeURIComponent(JSON.stringify(FAST_FIGURE_REGRESSION_TARGET)))),
    );
    document.documentElement.setAttribute("data-fast-figure-regression",
      btoa(unescape(encodeURIComponent(JSON.stringify(results)))));
  }
})();
