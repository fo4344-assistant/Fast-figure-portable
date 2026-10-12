/* Runs after the application scripts in a headless file:// browser. */
const FAST_FIGURE_REGRESSION_TARGET = Object.freeze({
  sourceScript: "r15",
  plusCal: "r15",
  verificationModel: "r6-stale",
  sourceCode: "r11",
  appBuild: "1.1.32-wip",
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
    await run(20, "content slots use bookmark-only selection", async () => {
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
      check(api.slots.readSelected() === null, "content body selected its slot");

      click(slotElement(contentSlot.id)?.querySelector(".slot-tab"));
      await tick();
      check(
        api.slots.readSelected()?.id === contentSlot.id,
        "bookmark did not select content slot",
      );

      click(document.getElementById("dashboard"));
      await tick();
      check(
        api.slots.readSelected()?.id === contentSlot.id,
        "dashboard background cleared content-slot selection",
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
      api.slots.select(null);
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
      const sourceTab = slotElement(sourceId)?.querySelector(".slot-tab");
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
      slotElement(slot.id)?.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );

      const closeButton = await waitFor(
        () =>
          document.querySelector(".mantine-Modal-close") ||
          document.querySelector("[aria-label='Close modal']") ||
          document.querySelector("[aria-label='닫기']"),
        "collision modal close button absent",
      );
      click(closeButton);
      await waitFor(
        () => appFSM.state.lifecycle === "ready",
        "application did not return to ready after collision cancel",
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
