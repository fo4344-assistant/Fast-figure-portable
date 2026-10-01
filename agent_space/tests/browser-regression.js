/* Runs after the application scripts in a headless file:// browser. */
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
  const save = () => ({
    slots: activeProject.slots.map((s) => ({ id: s.id, chart: s.chart, imageId: s.imageId,
      contentType: s.contentType, hidden: s.hidden, rowSpan: s.rowSpan, colSpan: s.colSpan })),
    csv: activeProject.csvFiles.map((c) => c.name),
    images: activeProject.images.map((i) => i.name),
    graphs: activeProject.charts.length,
    labels: api.labels.readState(),
    captions: api.captions.readState(),
    palette: api.appearance.readPalette(),
  });
  try {
    await new Promise((resolve) => setTimeout(resolve, 100));
    check(api && appFSM.state.lifecycle === "ready", "application not ready");
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
      api.layout.mergeSlots([slots[2].id, slots[3].id]);
      api.labels.setEnabled(true);
      api.captions.setEnabled(true);
      api.captions.setText("Regression caption");
      const before = save();
      await api.project.importFile(ffpxFile());
      const after = save();
      check(before.graphs === after.graphs && before.graphs > 0, "graph lost");
      check(after.images.length > 0 && after.slots.some((s) => s.imageId), "image lost");
      check(after.slots.some((s) => s.rowSpan > 1 || s.colSpan > 1), "merge lost");
      check(after.labels.enabled && after.captions.enabled, "annotations lost");
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
      api.graphs.addObject(activeProject.csvFiles[0].id);
      const file = ffsxFile(slot);
      const payload = await ffsxReadSlot(file);
      check(payload.chart && Array.isArray(payload.csvFiles), "blank FFSX invalid");
      await api.graphs.importFile(file);
      check(!!slot.chart, "blank FFSX import failed");
    });
    await run(5, "multi-CSV FFSX", async () => {
      const slot = activeProject.slots[0]; select(slot);
      const extra = createProjectCsv([["X", "Y"], ["9", "8"]], "second.csv");
      api.graphs.addObject(extra.id);
      const file = ffsxFile(slot);
      check((await ffsxReadSlot(file)).csvFiles.length >= 2, "second CSV missing");
      await api.graphs.importFile(file);
      check(chartCsvIds(getChart(slot.chart)).length >= 2, "multi-CSV references lost");
    });
    await run(6, "imported Plotly edit and FFPX", async () => {
      const slot = activeProject.slots[5]; select(slot);
      const figure = { data: [{ x: [1, 2], y: [3, 4], type: "scatter" }], layout: { title: "Plotly import" } };
      await api.graphs.importFile(new File([JSON.stringify(figure)], "plotly.json"));
      api.graphs.setEditable(true);
      check(getChart(slot.chart).editor.editable !== false, "Plotly edit mode unavailable");
      await api.project.importFile(ffpxFile());
      check(activeProject.charts.some((chart) => chart.editor.editable !== false), "edited Plotly lost");
    });
    await run(7, "Plotly export and import", async () => {
      const slot = activeProject.slots.find((s) => s.chart); select(slot);
      const figure = chartFigure(getChart(slot.chart));
      check(Array.isArray(figure.data), "Plotly export invalid");
      await api.graphs.importFile(new File([JSON.stringify(figure)], "export.json"));
      check(!!slot.chart, "Plotly import lost graph");
    });
    await run(8, "palette save and load", async () => {
      const original = api.appearance.readPalette();
      const key = Object.keys(original)[0];
      check(!!key, "empty palette");
      const changed = { ...original, [key]: "#123456" };
      api.appearance.setPalette(changed);
      const expected = api.appearance.readPalette()[key];
      await api.project.importFile(ffpxFile());
      check(api.appearance.readPalette()[key] === expected, "palette lost");
    });
    await run(9, "collision replace and rename", async () => {
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
    await run(10, "asset delete cascade", async () => {
      const slot = activeProject.slots[5]; select(slot);
      const item = createProjectCsv([["X", "Y"], ["1", "2"]], "delete.csv");
      api.graphs.addObject(item.id);
      check(chartCsvIds(getChart(slot.chart)).includes(item.id), "CSV reference absent");
      api.assets.delete({ kind: "csv", id: item.id, name: item.name });
      check(!activeProject.csvFiles.some((c) => c.id === item.id), "CSV not deleted");
      check(activeProject.charts.every((c) => !chartCsvIds(c).includes(item.id)), "dangling reference");
    });
    await run(11, "move to trash cascade", async () => {
      const item = createProjectCsv([["X", "Y"], ["1", "2"]], "trash.csv");
      const slot = activeProject.slots[5]; select(slot); api.graphs.addObject(item.id);
      check(chartCsvIds(getChart(slot.chart)).includes(item.id), "CSV reference absent before trash move");
      const path = projectAssetPath(item);
      const plan = api.assets.planMove(path, "/assets/trash");
      check(plan?.enteringTrash && plan.referenceCount > 0, "trash plan misses references");
      api.assets.move(plan);
      check(api.assets.isTrashed(projectAssetPath(item)), "move did not enter trash");
      check(activeProject.charts.every((c) => !chartCsvIds(c).includes(item.id)), "trashed CSV still referenced");
    });
    await run(12, "layout and label preview geometry", async () => {
      const layout = api.layout.readState(600).previewGeometry;
      const labels = api.labels.readState().reference;
      check(Number.isFinite(layout.width) && layout.width > 0, "layout width invalid");
      check(Number.isFinite(labels.width) && labels.width > 0, "label width invalid");
      const slot = document.querySelector(".slot:not(.hidden)");
      check(slot && slot.getBoundingClientRect().width > 0, "rendered slot has no width");
    });
  } catch (error) {
    results.push({ number: 0, name: "setup", result: "fail", detail: String(error?.stack || error) });
  } finally {
    document.documentElement.setAttribute("data-fast-figure-regression",
      btoa(unescape(encodeURIComponent(JSON.stringify(results)))));
  }
})();
