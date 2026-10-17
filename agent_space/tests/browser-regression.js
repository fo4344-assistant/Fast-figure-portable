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
      api.slots.setContentType("image");
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
      select(slots[4]); api.slots.setContentType("image");
      select(slots[5]); api.slots.setContentType("graph");
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
      api.graphs.setEditable(true);
      let currentSlot = slotAt(slot.id);
      const chart = getChart(currentSlot.chart);
      check(chart && chart.editor.objects.length === 0, "blank chart is not zero-object");
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
        api.slots.setContentType("graph");
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
      api.slots.setContentType("image");
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
      api.slots.setContentType("graph");

      const currentCsv = createProjectCsv(
        [["AX", "AY"], ["1", "2"]],
        "projection-current.csv",
      );
      const objectCsv = createProjectCsv(
        [["BX", "BY", "BZ"], ["3", "4", "5"]],
        "projection-object.csv",
      );
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

      api.graphs.addObject(guardCsv.id);
      check(
        JSON.stringify(getChart(slotAt(slot.id).chart).editor.objects) === before,
        "addObject mutated non-editable chart",
      );
      if (chart.editor.objects.length) {
        api.graphs.setObjectValues(0, { legendName: "should-not-change" });
        api.graphs.deleteObject(0);
        check(
          JSON.stringify(getChart(slotAt(slot.id).chart).editor.objects) === before,
          "object edit/delete mutated non-editable chart",
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
      api.slots.setContentType("graph");
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
      api.slots.setContentType("image");
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
      if (slotAt(target.id).contentType !== "image") api.slots.setContentType("image");
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
      api.slots.setContentType("graph");
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
      api.slots.setContentType("image");
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
