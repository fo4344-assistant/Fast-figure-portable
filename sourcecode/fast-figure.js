
      function readBackendSettings() {
        const config = JSON.parse(document.getElementById("ff-backend-settings").textContent);
        if (!config.backend?.project_object || !config.backend?.defaults)
          throw Error("Backend 설정 원천이 올바르지 않습니다.");
        const freeze = (value) => {
          if (value && typeof value === "object") {
            Object.values(value).forEach(freeze);
            Object.freeze(value);
          }
          return value;
        };
        return freeze(config.backend);
      }
      const BackendSettings = readBackendSettings();
      const PACKAGE_FORMAT_VERSION = BackendSettings.project_object.ffpx.formatVersion;
      const APP_BUILD = "1.1.43-wip";
      const PROJECT_OBJECT_PATHS = Object.freeze({
        project: "meta",
        layout: "layout",
        labels: "annotations.labels",
        captions: "annotations.captions",
        data: "assets.csvFiles",
        images: "assets.images",
        files: "fileSystem",
        charts: "charts",
        slots: "slots",
        sequences: "nextId",
        appearance: "appearance",
        export: "export",
      });
      const DEFAULT_SLOT_STYLE = BackendSettings.project_object.layout.slotStyle;
      const DEFAULT_UI_PALETTE = BackendSettings.project_object.appearance.uiPalette;
      const DEFAULT_COLORS = BackendSettings.defaults.graphColors;
      const DEFAULT_IMAGE_SETTINGS = BackendSettings.defaults.slotSettings.content.imageSettings;
      const SLOT_LOCAL_DEFAULTS = Object.freeze({
        chart: null,
        imageId: null,
        contentType: "graph",
        imageSettings: DEFAULT_IMAGE_SETTINGS,
        caption: null,
      });
      function createProjectState() {
        let state = {
          kind: "fast-figure-project-object",
          meta: { projectName: "", appBuild: APP_BUILD },
          layout: {
            gridRows: BackendSettings.project_object.layout.gridRows,
            gridCols: BackendSettings.project_object.layout.gridCols,
            slotStyle: { ...DEFAULT_SLOT_STYLE },
          },
          annotations: {
            labels: projectClone(BackendSettings.project_object.annotations.labels),
            captions: {
              ...projectClone(BackendSettings.project_object.annotations.captions),
              text: "", afterText: "", name: "",
            },
          },
          assets: { csvFiles: [], images: [] },
          fileSystem: {
            directories: Object.values(BackendSettings.defaults.vfs),
          },
          charts: [],
          slots: [],
          nextId: { csv: 1, image: 1, chart: 1 },
          appearance: { uiPalette: { ...DEFAULT_UI_PALETTE } },
          export: {
            width: DEFAULT_SLOT_STYLE.referenceWidth,
            ...BackendSettings.project_object.export,
            height: null,
          },
        };
        for (let index = 0; index < state.layout.gridRows * state.layout.gridCols; index++)
          state.slots.push(newGridSlot(index, Math.floor(index / state.layout.gridCols) + 1,
            (index % state.layout.gridCols) + 1));
        return state;
      }
      function projectObjectPath(state, path) {
        return String(path)
          .split(".")
          .reduce((value, key) => value?.[key], state);
      }
      class ProjectObject {
        constructor(state = createProjectState()) {
          normalizeSlotContents(state.slots);
          validateProjectObjectState(state);
          this._state = state;
        }
        static fromFFPX(payload, fileName) {
          return buildProjectObject(payload, fileName);
        }
        read(path) {
          let value = projectObjectPath(this._state, path);
          if (value === undefined) throw Error(`프로젝트 오브젝트 경로 ${path}가 없습니다.`);
          return value;
        }
        initialize(source) {
          let next = source instanceof ProjectObject ? source._state : source;
          normalizeSlotContents(next.slots);
          validateProjectObjectState(next);
          let previous = this._state;
          this._state = next;
          return previous;
        }
        get meta() {
          return this._state.meta;
        }
        get layout() {
          return this._state.layout;
        }
        get annotations() {
          return this._state.annotations;
        }
        get assets() {
          return this._state.assets;
        }
        get appearance() {
          return this._state.appearance;
        }
        get projectName() {
          return this.meta.projectName;
        }
        set projectName(value) {
          this.meta.projectName = value;
        }
        get appBuild() {
          return this.meta.appBuild;
        }
        get gridRows() {
          return this.layout.gridRows;
        }
        set gridRows(value) {
          this.layout.gridRows = value;
        }
        get gridCols() {
          return this.layout.gridCols;
        }
        set gridCols(value) {
          this.layout.gridCols = value;
        }
        get csvFiles() {
          return this.assets.csvFiles;
        }
        set csvFiles(value) {
          this.assets.csvFiles = value;
        }
        get images() {
          return this.assets.images;
        }
        set images(value) {
          this.assets.images = value;
        }
        get fileSystem() {
          return this._state.fileSystem;
        }
        set fileSystem(value) {
          this._state.fileSystem = value;
        }
        get charts() {
          return this._state.charts;
        }
        set charts(value) {
          this._state.charts = value;
        }
        get slots() {
          return this._state.slots;
        }
        set slots(value) {
          this._state.slots = normalizeSlotContents(value);
        }
        get csvId() {
          return this._state.nextId.csv;
        }
        set csvId(value) {
          this._state.nextId.csv = value;
        }
        get imageId() {
          return this._state.nextId.image;
        }
        set imageId(value) {
          this._state.nextId.image = value;
        }
        get chartId() {
          return this._state.nextId.chart;
        }
        set chartId(value) {
          this._state.nextId.chart = value;
        }
        get labelsEnabled() {
          return this.annotations.labels.enabled;
        }
        set labelsEnabled(value) {
          this.annotations.labels.enabled = value;
        }
        get labelSettings() {
          return this.annotations.labels.settings;
        }
        set labelSettings(value) {
          this.annotations.labels.settings = value;
        }
        get captionsEnabled() {
          return this.annotations.captions.enabled;
        }
        set captionsEnabled(value) {
          this.annotations.captions.enabled = value;
        }
        get captionText() {
          return this.annotations.captions.text;
        }
        set captionText(value) {
          this.annotations.captions.text = value;
        }
        get captionAfterText() {
          return this.annotations.captions.afterText;
        }
        set captionAfterText(value) {
          this.annotations.captions.afterText = value;
        }
        get captionName() {
          return this.annotations.captions.name;
        }
        set captionName(value) {
          this.annotations.captions.name = value;
        }
        get captionNameBold() {
          return this.annotations.captions.nameBold;
        }
        set captionNameBold(value) {
          this.annotations.captions.nameBold = value;
        }
        get captionSettings() {
          return this.annotations.captions.settings;
        }
        set captionSettings(value) {
          this.annotations.captions.settings = value;
        }
        get exportSettings() {
          return this._state.export;
        }
        set exportSettings(value) {
          this._state.export = value;
        }
      }
      const activeProject = new ProjectObject();
      let selectedSlotId = null,
        dashboardObserver = null,
        graphAreaObserver = null,
        resizePending = false,
        programmaticPlotlyRelayout = new WeakMap(),
        dashboardRenderGeneration = 0,
        projectObjectGeneration = 0,
        slotDragSourceId = null,
        slotDragSuppressClick = false,
        dashboardZoomIntent = 100,
        dashboardZoomLocked = false,
        dashboardZoomLockedWidth = null;
      const $ = (id) => document.getElementById(id);
      const uiTelemetryListeners = new Set();
      let uiTelemetryState = Object.freeze({
        revision: 0,
        status: "",
        debugEnabled: false,
        debugLines: [],
      });
      function publishUiTelemetry(patch = {}) {
        uiTelemetryState = Object.freeze({
          ...uiTelemetryState,
          ...patch,
          revision: uiTelemetryState.revision + 1,
        });
        uiTelemetryListeners.forEach((listener) => listener());
        return uiTelemetryState;
      }
      function subscribeUiTelemetry(listener) {
        uiTelemetryListeners.add(listener);
        return () => uiTelemetryListeners.delete(listener);
      }
      function getUiTelemetrySnapshot() {
        return uiTelemetryState;
      }
      function status(message) {
        let text = String(message ?? "");
        publishUiTelemetry({ status: text });
        return text;
      }
      let debugEnabled = false,
        debugSequence = 0;
      function setDebugEnabled(enabled) {
        debugEnabled = enabled === true;
        publishUiTelemetry({ debugEnabled });
        return debugEnabled;
      }
      function clearDebugOutput() {
        debugSequence = 0;
        publishUiTelemetry({ debugLines: [] });
      }
      function saveDebugOutput() {
        auditApp("debug:save");
        debugLog("debugLog:save", {
          build: projectObjects.read("project").appBuild,
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
      function debugValue(value) {
        if (value instanceof Error)
          return { name: value.name, message: value.message, stack: value.stack };
        try {
          return JSON.parse(JSON.stringify(value));
        } catch (error) {
          return { serializationError: error.message, value: String(value) };
        }
      }
      function debugLog(event, data = {}, level = "debug") {
        if (!debugEnabled) return;
        let payload = debugValue(data),
          line = `${String(++debugSequence).padStart(4, "0")} ${new Date().toISOString().slice(11, 23)} ${level.toUpperCase()} ${event} ${JSON.stringify(payload)}`;
        let method = console[level] || console.debug;
        method.call(console, "[chart-builder]", event, payload);
        let lines = [...uiTelemetryState.debugLines, line].slice(-500);
        publishUiTelemetry({ debugEnabled, debugLines: lines });
      }
      class ProjectObjectRegistry {
        constructor(projectProvider) {
          if (typeof projectProvider !== "function")
            throw Error("프로젝트 오브젝트 공급자가 없습니다.");
          this.projectProvider = projectProvider;
          this.adapters = new Map();
        }
        register(name, adapter) {
          if (!name || this.adapters.has(name) || typeof adapter?.read !== "function")
            throw Error(`프로젝트 오브젝트 어댑터 ${name}을 등록할 수 없습니다.`);
          this.adapters.set(name, Object.freeze({ ...adapter }));
          return this;
        }
        registerPath(name, path) {
          return this.register(name, {
            path,
            read: (project) => project.read(path),
          });
        }
        read(name) {
          let adapter = this.adapters.get(name);
          if (!adapter) throw Error(`프로젝트 오브젝트 ${name}이 없습니다.`);
          let project = this.projectProvider();
          if (!(project instanceof ProjectObject))
            throw Error("활성 프로젝트 오브젝트가 없습니다.");
          return adapter.read(project);
        }
        snapshot(names = [...this.adapters.keys()]) {
          return Object.fromEntries(names.map((name) => [name, projectClone(this.read(name))]));
        }
        names() {
          return [...this.adapters.keys()];
        }
      }
      // Backend read providers: resolve references from current authority, never normalize live models.
      function readBackendProjection(kind, request = {}) {
        if (kind === "project-api" && request.operation === "project.readName")
          return activeProject._state.meta.projectName;
        if ((kind === "project-api" && request.operation === "appearance.readPalette") ||
            (kind === "renderer" && request.operation === "ui-palette"))
          return Object.freeze({ ...activeProject._state.appearance.uiPalette });
        if (kind === "project-api" && request.operation === "layout.readState") {
          const source = activeProject._state, preview = BackendSettings.defaults.preview,
            width = request.renderedWidth == null ? preview.fallbackWidth : readProjectNumber(
              request.renderedWidth, preview.fallbackWidth, ...preview.widthRange);
          return Object.freeze({
            gridRows: source.layout.gridRows, gridCols: source.layout.gridCols,
            slotStyle: Object.freeze({ ...source.layout.slotStyle }),
            visibleSlots: Object.freeze(source.slots.filter((slot) => !slot.hidden).map((slot) => Object.freeze({
              id: slot.id, row: slot.row, col: slot.col, rowSpan: slot.rowSpan, colSpan: slot.colSpan,
            }))),
            previewGeometry: Object.freeze(dashboardGeometryInProject(source, width)),
          });
        }
        if (kind === "project-api" && request.operation === "labels.readState") {
          const source = activeProject._state, labels = source.annotations.labels,
            slot = source.slots.find((item) => item.id === request.slotId && !item.hidden) ?? null,
            geometry = dashboardGeometryInProject(source, source.layout.slotStyle.referenceWidth),
            reference = gridSlotGeometry(source.layout, geometry, slot),
            identifier = slotIdentifier(0, source);
          return Object.freeze({
            enabled: labels.enabled, settings: Object.freeze({ ...labels.settings }),
            reference: Object.freeze(reference),
            sampleText: labels.settings.parentheses ? `(${identifier})` : identifier,
          });
        }
        if (kind === "project-api" && request.operation === "captions.readGlobal") {
          let captions = activeProject._state.annotations.captions;
          return immutableProjectCopy({
            enabled: captions.enabled, text: captions.text, afterText: captions.afterText,
            name: captions.name, nameBold: captions.nameBold, settings: captions.settings,
          });
        }
        if (kind === "project-api" && request.operation === "captions.readSlot") {
          const slot = activeProject._state.slots.find((item) => item.id === request.slotId);
          return slot ? Object.freeze({
            id: slot.id, row: slot.row, col: slot.col, text: slot.caption ?? "",
          }) : null;
        }
        if (kind === "project-api" && request.operation === "assets.isTrashed")
          return projectVfs.isTrashed(request.path);
        if (kind === "project-api" && request.operation === "assets.fileKind")
          return slotFileKind(request.file);
        if (kind === "project-api" && request.operation === "assets.collisionModel")
          return immutableProjectCopy(projectAssetImportCollisionModel(request.file, request.directory,
            new Set(request.reservedPaths || [])));
        if (kind === "project-api" && request.operation === "assets.resolveImportPlan")
          return immutableProjectCopy(resolveProjectAssetImportPlan(request.model, request.choice,
            new Set(request.reservedPaths || [])));
        if (kind === "project-api" && request.operation === "assets.readDeletionTarget") {
          const source = activeProject._state,
            node = request.path ? projectVfs.resolve(request.path, source) : null;
          if (!["csv", "image"].includes(node?.kind)) return null;
          const references = collectAssetReferences(
            new Set(node.kind === "csv" ? [node.asset.id] : []),
            new Set(node.kind === "image" ? [node.asset.id] : []), source);
          return immutableProjectCopy({ target: node.asset, kind: node.kind,
            path: projectAssetPath(node.asset), referenceCount: references.length, references });
        }
        if (kind === "project-api" && request.operation === "slots.readSelected") {
          const source = activeProject._state,
            slot = source.slots.find((item) => item.id === request.frontendState?.selectedSlotId && !item.hidden);
          return slot ? immutableProjectCopy({ id: slot.id, row: slot.row, col: slot.col,
            contentType: slot.contentType, chart: slot.content?.chart ?? slot.chart,
            imageId: slot.content?.imageId ?? slot.imageId }) : null;
        }
        if (kind === "project-api" && request.operation === "graphs.readLayout") {
          const source = activeProject._state, slot = source.slots.find(item => item.id === request.selectedSlotId && !item.hidden),
            chartId = slot?.content?.chart ?? slot?.chart,
            chart = slot?.contentType !== "image" ? source.charts.find(item => item.id === chartId) : null;
          return chart ? immutableProjectCopy({ chartId: chart.id, editable: chart.editor?.editable !== false,
            title: chart.editor?.title ?? "", settings: normalizeGraphLayoutSettings(chart.editor?.globalSettings) }) : null;
        }
        if (kind === "project-api" && request.operation === "graphs.readData") {
          const source = activeProject._state, state = request.frontendState || {},
            owners = Object.hasOwn(request, "chartId")
              ? source.slots.filter((slot) => (slot.content?.chart ?? slot.chart) === request.chartId) : [],
            slot = Object.hasOwn(request, "chartId") ? (owners.length === 1 ? owners[0] : null)
              : source.slots.find((item) => item.id === state.selectedSlotId && !item.hidden),
            chartId = slot?.content?.chart ?? slot?.chart,
            chart = source.charts.find((item) => item.id === chartId) || null,
            objects = chart?.editor?.objects || [], index = state.graphObjectIndex,
            selectedIndex = chart && chart.editor.editable !== false && Number.isInteger(index) && index >= 0 && index < objects.length
              ? index : null,
            node = state.assetSelection === "csv" && state.assetPath ? projectVfs.resolve(state.assetPath, source) : null,
            csv = node?.kind === "csv" ? node.asset : null,
            objectCsv = selectedIndex === null ? null : source.assets.csvFiles.find((item) => item.id === objects[selectedIndex].csvId);
          return immutableProjectCopy({ chart, objects, selectedIndex, currentCsv: csv,
            columns: csv ? columnDefinitions(csv.rows, csv.headerLines) : [],
            objectColumns: objectCsv ? columnDefinitions(objectCsv.rows, objectCsv.headerLines) : [] });
        }
        if (kind === "project-api" && request.operation === "print.readSettings")
          return immutableProjectCopy(activeProject._state.export);
        if ((kind === "project-api" && request.operation === "images.readEditor") ||
            (kind === "renderer" && request.operation === "slot-image")) {
          const source = activeProject._state,
            slot = source.slots.find(item => item.id === request.slotId && !item.hidden),
            image = slot ? source.assets.images.find(item => item.id === (slot.content?.imageId ?? slot.imageId)) : null;
          return image ? immutableProjectCopy({
            slotId: slot.id, name: image.name,
            bytes: Array.from(ffpxBase64ToBytes(image.bytesBase64 || "")),
            src: projectImageDataUrl(image), settings: normalizeImageSettings(slot),
          }) : null;
        }
        if (kind === "export" && request.operation == null) {
          const source = activeProject._state;
          return immutableProjectCopy({ ...source,
            slots: source.slots.map(slot => ({ ...slot, content: { ...slot.content } })),
          });
        }
        if (kind === "export" && request.operation === "project.exportFile") {
          const source = activeProject._state, bundle = ffpxBuildProject(source);
          return Object.freeze({
            name: `${projectFileStem(source.meta.projectName)}-${request.stamp}.ffpx`,
            mime: "application/vnd.fast-figure-project",
            entries: Object.freeze(bundle.assets.map((entry) => Object.freeze({
              name: entry.name, data: Object.freeze(Array.from(entry.data)),
            }))),
          });
        }
        if (kind === "export" && request.operation === "assets.download") {
          const source = activeProject._state,
            selected = request.path ? projectVfs.resolve(request.path, source) : null,
            asset = ["csv", "image"].includes(selected?.kind) ? selected.asset : null;
          if (!asset?.bytesBase64) return null;
          return Object.freeze({
            name: asset.name, mime: asset.mime || "application/octet-stream",
            bytes: Object.freeze(Array.from(ffpxBase64ToBytes(asset.bytesBase64))),
          });
        }
        if (kind === "export" && ["graphs.exportPlotlyJson", "graphs.exportFfsx"].includes(request.operation)) {
          const source = activeProject._state,
            slot = source.slots.find((item) => item.id === request.slotId && !item.hidden),
            chart = slot && slot.contentType !== "image"
              ? source.charts.find((item) => item.id === slot.chart) : null;
          if (!chart) return null;
          if (request.operation === "graphs.exportFfsx") {
            const bundle = ffsxBuildSlot(slot, chart, source);
            return Object.freeze({
              name: `fast-figure-slot-${slot.id}-${request.stamp}.ffsx`, mime: "application/vnd.fast-figure-slot",
              entries: Object.freeze(bundle.assets.map((entry) => Object.freeze({
                name: entry.name, data: Object.freeze(Array.from(entry.data)),
              }))),
            });
          }
          const bytes = new TextEncoder().encode(JSON.stringify(chartFigure(chart, source)));
          return Object.freeze({
            name: `plotly-figure-${slot.id}-${request.stamp}.json`, mime: "application/json",
            bytes: Object.freeze(Array.from(bytes)),
          });
        }
        if (kind !== "slot-selection-context") throw Error(`알 수 없는 Backend query: ${kind}`);
        let slot = request.slotId == null ? null : slotAt(request.slotId);
        return slot && !slot.hidden ? Object.freeze({
          id: slot.id,
          empty: !slot.chart && !slot.imageId,
          contentType: slot.contentType,
        }) : null;
      }
      function validateFrontendIntent(event, payload = {}) {
        let input = { event, accepted: true, reference: null, workspaceHint: "project", selectionHint: null };
        if (event === "SELECT_SLOT") {
          if (payload.slotId != null) {
            let slot = slotAt(payload.slotId);
            if (!slot || slot.hidden) input.accepted = false;
            else {
              input.reference = slot.id;
              input.workspaceHint = slot.contentType === "image" ? "slot.image" : "slot.graph";
              input.selectionHint = payload.direction === "model-to-fsm" ? "clear-graph-object" : "toggle-clear";
            }
          }
        } else if (event === "SELECT_ASSET") {
          if (payload.path != null) {
            let match = projectVfs.resolve(payload.path);
            if (!match || match.kind !== payload.kind || !["csv", "image", "directory"].includes(match.kind))
              input.accepted = false;
            else {
              input.reference = match.kind === "directory" ? match.path : projectAssetPath(match.asset);
              input.selectionHint = match.kind;
            }
          }
        } else if (event === "SELECT_GRAPH_OBJECT") {
          if (payload.index != null) {
            let slot = slotAt(payload.selectedSlotId),
              chart = slot && !slot.hidden && slot.contentType !== "image" ? getChart(slot.chart) : null,
              object = Number.isInteger(payload.index) && payload.index >= 0
                ? chart?.editor?.objects?.[payload.index] : null,
              csv = object ? getProjectCsv(object.csvId) : null;
            if (!object || !csv) input.accepted = false;
            else {
              input.reference = payload.index;
              input.selectionHint = payload.selectAsset === true ? projectAssetPath(csv) : null;
            }
          }
        } else input.accepted = false;
        return Object.freeze(input);
      }
      function buildFrontendReconciliationInput(event, result, references) {
        let payload = result.payload || {}, hints = result.selectionHints || {},
          slotId = references.selectedSlotId,
          assetPath = references.assetPath,
          graphObjectIndex = references.graphObjectIndex;
        if (hints.resetInterfaceSelection) {
          slotId = assetPath = graphObjectIndex = null;
        } else {
          if (Array.isArray(hints.swapSlotIds) && hints.swapSlotIds.length === 2) {
            let [source, target] = hints.swapSlotIds;
            if (slotId === source) slotId = target;
            else if (slotId === target) slotId = source;
          }
          if (hints.mergeSlotIds?.includes(slotId)) slotId = hints.anchorId;
          if (assetPath && hints.movedPathFrom && projectPathInDirectory(assetPath, hints.movedPathFrom))
            assetPath = `${hints.movedPathTo}${assetPath.slice(hints.movedPathFrom.length)}`;
        }
        let slot = slotId == null ? null : slotAt(slotId);
        if (!slot || slot.hidden) slotId = null;
        let asset = assetPath ? projectVfs.resolve(assetPath) : null;
        if (hints.clearAssetSelection || !asset ||
            (hints.enteringTrash && projectVfs.isTrashed(assetPath))) {
          asset = null;
          assetPath = null;
        }
        let chart = slotId !== null && slot.contentType !== "image" ? getChart(slot.chart) : null;
        if (chart?.editor?.editable === false) chart = null;
        if (chart && hints.chartId === chart.id && Object.hasOwn(hints, "selectedIndexHint"))
          graphObjectIndex = hints.selectedIndexHint;
        else if (chart) {
          const map = hints.graphObjectIndexMaps?.find(item => item.chartId === chart.id);
          if (map) graphObjectIndex = Number.isInteger(graphObjectIndex) ? map.indices[graphObjectIndex] ?? null : null;
        }
        if (payload.clearGraphSelection || hints.clearGraphSelection ||
            !Number.isInteger(graphObjectIndex) || graphObjectIndex < 0 ||
            graphObjectIndex >= (chart?.editor?.objects?.length || 0))
          graphObjectIndex = null;
        return Object.freeze({
          event, selectedSlot: slotId,
          assetSelection: assetPath, assetKind: asset?.kind || "none",
          graphObject: graphObjectIndex,
          workspaceHint: slotId === null ? "project" : slot.contentType === "image" ? "slot.image" : "slot.graph",
        });
      }
      const BACKEND_REFERENCE_EVENTS = new Set(["SELECT_SLOT", "SELECT_ASSET", "SELECT_GRAPH_OBJECT"]);

      class InterfaceStateMachine {
        constructor(definitions) {
          this.definitions = definitions;
          this.state = Object.freeze({
            lifecycle: "booting",
            workspace: "project",
            overlay: "none",
            assetSelection: "none",
            assetPath: null,
            graphObject: "none",
            graphObjectIndex: null,
            direction: "model-to-ui",
            revision: 0,
            error: null,
          });
          this.listeners = new Set();
          this.transitioning = 0;
          this.writeLocks = new Set();
        }
        definition(region, state = this.state[region]) {
          let definition = this.definitions[region]?.[state];
          if (!definition) throw Error(`${region}.${state} FSM 상태가 등록되지 않았습니다.`);
          return definition;
        }
        context(region, state, event, payload) {
          return {
            machine: this,
            region,
            state,
            event,
            payload,
            direction: payload.direction || this.state.direction || "model-to-ui",
            canWrite: (scope) => !this.writeLocks.has(scope),
          };
        }
        withWriteLocks(scopes, operation) {
          scopes.forEach((scope) => this.writeLocks.add(scope));
          try {
            return operation();
          } finally {
            scopes.forEach((scope) => this.writeLocks.delete(scope));
          }
        }
        assertWritable(scope, event) {
          if (this.writeLocks.has(scope))
            throw Error(`${event} 전이 중 잠긴 ${scope} 모델을 수정할 수 없습니다.`);
        }
        publish(event) {
          document.body.dataset.appLifecycle = this.state.lifecycle;
          document.body.dataset.appWorkspace = this.state.workspace;
          document.body.dataset.appOverlay = this.state.overlay;
          document.body.dataset.appAssetSelection = this.state.assetSelection;
          document.body.dataset.appGraphObject = this.state.graphObject;
          this.listeners.forEach((listener) => listener(this.state, event));
          debugLog("fsm:transition", { event, ...this.state });
          return this.state;
        }
        transition(region, target, event, payload = {}) {
          if (typeof target === "function")
            target = target(this.context(region, this.state[region], event, payload));
          let previous = this.state[region];
          if (!target || (target === previous && payload.reenter !== true)) {
            let definition = this.definition(region, previous);
            if (payload.direction)
              this.state = Object.freeze({
                ...this.state,
                direction: payload.direction,
              });
            let update = () =>
              definition.update?.(this.context(region, previous, event, payload));
            if (payload.direction === "model-to-fsm" && region === "workspace")
              this.withWriteLocks(["workspace", "editor"], update);
            else update();
            return this.publish(`${event}:${region}:update`);
          }
          this.transitioning++;
          try {
            this.definition(region, previous).exit?.(
              this.context(region, previous, event, payload),
            );
            this.state = Object.freeze({
              ...this.state,
              [region]: target,
              direction: payload.direction || this.state.direction,
            });
            let enter = () =>
              this.definition(region, target).entry?.(
                this.context(region, target, event, payload),
              );
            if (payload.direction === "model-to-fsm" && region === "workspace")
              this.withWriteLocks(["workspace", "editor"], enter);
            else enter();
          } finally {
            this.transitioning--;
          }
          return this.publish(`${event}:${region}:${previous}->${target}`);
        }
        transitionLifecycle(event, payload = {}) {
          const origin = payload.event || event;
          if (event === "LIFECYCLE_START") {
            this.state = Object.freeze({ ...this.state, error: null });
            return this.transition("lifecycle", payload.lifecycle, `${origin}:start`);
          }
          if (event === "LIFECYCLE_COMPLETE") {
            this.state = Object.freeze({ ...this.state, error: null });
            return this.transition("lifecycle", "ready", `${origin}:${payload.outcome || "complete"}`);
          }
          if (event === "LIFECYCLE_FAILED") {
            const error = payload.error;
            this.state = Object.freeze({
              ...this.state,
              error: { event: origin, message: error?.message || String(error) },
            });
            this.transition("lifecycle", "error", `${origin}:failed`, { error });
            return this.transition("lifecycle", "ready", `${origin}:recovered`);
          }
          return this.state;
        }
        send(event, payload = {}) {
          if (PROJECT_COMMANDS.has(event)) return this.state;
          if (BACKEND_REFERENCE_EVENTS.has(event) && payload.validatedInput?.accepted !== true)
            return this.state;
          if (event === "LIFECYCLE_START" || event === "LIFECYCLE_COMPLETE" ||
              event === "LIFECYCLE_FAILED")
            return this.transitionLifecycle(event, payload);
          if (event === "SELECT_ASSET") {
            // Source40: publish the final selection and receipt, not intermediate regions.
            const input = payload.validatedInput;
            this.assertWritable("editor", event);
            this.state = Object.freeze({ ...this.state,
              assetSelection: input.selectionHint || "none", assetPath: input.reference ?? null,
              graphObject: "none", graphObjectIndex: null,
              direction: payload.direction || this.state.direction, revision: this.state.revision + 1,
            });
            return this.publish(event);
          }
          if (event === "SET_DASHBOARD_ZOOM") {
            if (dashboardZoomLocked) return this.state;
            let numeric;
            try { numeric = Number(payload.value); } catch { numeric = NaN; }
            const value = Number.isFinite(numeric) ? Math.max(50, Math.min(200, numeric)) : 100;
            if (value === dashboardZoomIntent) return this.state;
            dashboardZoomIntent = value;
            return this.notify("layout", event);
          }
          if (event === "SET_DASHBOARD_ZOOM_LOCK" || event === "RESET_DASHBOARD_ZOOM") {
            if (event === "SET_DASHBOARD_ZOOM_LOCK" && payload.locked === true) {
              if (dashboardZoomLocked || !Number.isFinite(payload.renderedWidth) || payload.renderedWidth <= 0) return this.state;
              dashboardZoomLocked = true;
              dashboardZoomLockedWidth = payload.renderedWidth;
            } else {
              if (!dashboardZoomLocked && dashboardZoomLockedWidth === null && dashboardZoomIntent === 100) return this.state;
              dashboardZoomLocked = false;
              dashboardZoomLockedWidth = null;
              dashboardZoomIntent = 100;
            }
            return this.notify("layout", event);
          }
          let handled = false;
          for (let region of [
            "lifecycle",
            "workspace",
            "overlay",
            "assetSelection",
            "graphObject",
          ]) {
            let transition = this.definition(region).on?.[event];
            if (!transition) continue;
            handled = true;
            if (typeof transition === "function")
              transition = transition(this.context(region, this.state[region], event, payload));
            let target = transition?.target ?? transition;
            transition?.action?.(this.context(region, this.state[region], event, payload));
            if (target) this.transition(region, target, event, payload);
          }
          if (!handled) debugLog("fsm:event-unhandled", { event, state: this.state }, "warn");
          return this.state;
        }
        readState() {
          return Object.freeze({ ...this.state, selectedSlotId,
            dashboardZoomIntent, dashboardZoomLocked, dashboardZoomLockedWidth });
        }
        reconcileProjectResult(event, input) {
          selectedSlotId = input.selectedSlot;
          this.state = Object.freeze({
            ...this.state,
            workspace: input.workspaceHint,
            assetSelection: input.assetKind,
            assetPath: input.assetSelection,
            graphObject: input.graphObject === null ? "none" : "selected",
            graphObjectIndex: input.graphObject,
            direction: "model-to-ui",
            revision: this.state.revision + 1,
          });
          return this.publish(`${event}:reconcile`);
        }
        notify(object, event, payload = {}) {
          if (this.state.lifecycle === "booting" || this.transitioning) return this.state;
          this.state = Object.freeze({
            ...this.state,
            direction: "model-to-ui",
            revision: this.state.revision + 1,
          });
          for (let region of ["workspace", "overlay"]) {
            let definition = this.definition(region);
            if (definition.objects?.includes(object))
              definition.update?.(
                this.context(region, this.state[region], event, {
                  ...payload,
                  direction: "model-to-ui",
                }),
              );
          }
          return this.publish(event);
        }
        ready(workspaceHint = "project") {
          this.transition("lifecycle", "ready", "READY");
          this.transition("workspace", workspaceHint, "WORKSPACE_INIT", {
            direction: "model-to-fsm",
          });
          this.transition("overlay", "none", "OVERLAY_INIT", { reenter: true });
          return this.state;
        }
        subscribe(listener) {
          this.listeners.add(listener);
          return () => this.listeners.delete(listener);
        }
      }

      class ProjectStateMachine {
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
          let committed = action({ machine: this, event, payload }) !== false;
          return Object.freeze({
            event,
            committed,
            changed: immutableProjectCopy(committed ? payload.changed || {} : {}),
            payload,
            removedGraphReferenceCount: payload.removedGraphReferenceCount || 0,
            resetImageSlotCount: payload.resetImageSlotCount || 0,
            selectionHints: payload.selectionHints || null,
          });
        }
      }

      function workspaceStateFromModel(slotId = selectedSlotId) {
        let slot = slotId == null ? null : slotAt(slotId);
        return !slot ? "project" : slot.contentType === "image" ? "slot.image" : "slot.graph";
      }
      function requestedWorkspaceState({ payload }) {
        return selectedSlotId === null ? "project" : payload.validatedInput.workspaceHint;
      }
      function applySlotSelectionAction({ machine, payload }) {
        let input = payload.validatedInput,
          same = input.reference !== null && selectedSlotId === input.reference;
        machine.assertWritable("workspace", "SELECT_SLOT");
        selectedSlotId = same && input.selectionHint === "toggle-clear" ? null : input.reference;
        machine.state = Object.freeze({
          ...machine.state,
          graphObject: "none",
          graphObjectIndex: null,
        });
      }
      function applySlotTypeAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const after = activeProject._state.slots.find(slot => slot.id === current.id);
          payload.changed = { slotIds: JSON.stringify(current) === JSON.stringify(after) ? [] : [after.id],
            chartIds: [], csvIds: [], imageIds: [], assets: [] };
          return;
        }
      }
      function applyGraphObjectSelectionAction({ machine, payload }) {
        machine.assertWritable("editor", "SELECT_GRAPH_OBJECT");
        let index = payload.validatedInput?.event === "SELECT_GRAPH_OBJECT"
          ? payload.validatedInput.reference : null;
        machine.state = Object.freeze({
          ...machine.state,
          graphObjectIndex: index,
          ...(index !== null && payload.validatedInput.selectionHint ? {
            assetSelection: "csv", assetPath: payload.validatedInput.selectionHint,
          } : {}),
        });
      }
      function selectedGraphObjectGuard() {
        return (
          appFSM?.state.graphObject === "selected" &&
          Number.isInteger(appFSM.state.graphObjectIndex)
        );
      }

      function applyCaptionTextAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          payload.changed = { slotIds: candidate.slots.filter(after =>
            JSON.stringify(source.slots.find(before => before.id === after.id)) !== JSON.stringify(after)).map(item => item.id),
            chartIds: [], csvIds: [], imageIds: [], assets: [] };
          return;
        }
      }
      function applySlotCaptionsInsertedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          payload.changed = { slotIds: [], chartIds: [], csvIds: [], imageIds: [], assets: [] };
          return;
        }
      }
      function applyDataObjectCreatedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const committed = activeProject._state.assets.csvFiles.find(item => item.id === id);
          payload.changed = { slotIds: [], chartIds: [], csvIds: [id], imageIds: [],
            assets: [{ role: "created", kind: "csv", id, path: projectAssetPath(committed), owners: [] }] };
          return;
        }
      }
      function applyAssetObjectReplacedAction({ machine, payload }, kind) {
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
        activeProject.initialize(validateProjectObjectState(candidate,{requireSlots:true}));
        if(image)releaseProjectImageDisplayUrl(previous);
        payload[image?"image":"csv"]=image?getProjectImage(next.id):getProjectCsv(next.id);
      }
      function applyDataObjectReplacedAction(context) {
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
          activeProject.initialize(candidate);
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
      function applyDataObjectDeletedAction(context) {
        return applyAssetObjectDeletedAction(context, "csv");
      }
      function applyAssetObjectDeletedAction({ machine, payload }, kind) {
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
          activeProject.initialize(candidate);
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
      function applyImageObjectCreatedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const image = activeProject._state.assets.images.find(item => item.id === id);
          payload.changed = { slotIds: [], chartIds: [], csvIds: [], imageIds: [id],
            assets: [{ role: "created", kind: "image", id, path: projectAssetPath(image), owners: [] }] };
          return;
        }
      }
      function applyImageObjectReplacedAction(context) {
        applyAssetObjectReplacedAction(context, "image");
      }
      function applyImageObjectDeletedAction(context) {
        return applyAssetObjectDeletedAction(context, "image");
      }
      function applySlotsResetAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const after = activeProject._state;
          payload.changed = { slotIds: ids.filter(id => JSON.stringify(source.slots.find(slot => slot.id === id)) !==
            JSON.stringify(after.slots.find(slot => slot.id === id))),
            chartIds: source.charts.filter(chart => !after.charts.some(next => next.id === chart.id)).map(chart => chart.id),
            csvIds: [], imageIds: [], assets: [] };
          return;
        }
      }
      function applySlotsSwappedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const after = activeProject._state;
          const localKey = slot => JSON.stringify([slot.content, slot.caption]);
          payload.changed = { slotIds: [first.id, second.id].filter(id => localKey(source.slots.find(slot => slot.id === id)) !==
            localKey(after.slots.find(slot => slot.id === id))), chartIds: [], csvIds: [], imageIds: [], assets: [] };
          payload.selectionHints = immutableProjectCopy({ swapSlotIds: [first.id, second.id] });
          return;
        }
      }
      function applySlotImageLinkedAction(context) {
        return applyProjectAssetConnectedAction(context, "image");
      }
      function applyProjectAssetConnectedAction({ machine, payload }, kind) {
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
          activeProject.initialize(candidate);
          payload.changed = { slotIds: slot.chart !== target.chart || slot.imageId !== target.imageId ? [slot.id] : [],
            chartIds: chart ? [chart.id] : [], csvIds: [], imageIds: [], assets: [] };
          if (chart) payload.selectionHints = Object.freeze({ chartId: chart.id, selectedIndexHint: null });
          return;
        }
      }
      function createCandidateBaseGraphObject(csv) {
        const selection = graphDataSelection(csv.rows, csv.headerLines);
        return { ...projectClone(BackendSettings.defaults.chartSettings.editor.objectStyle),
          csvId: csv.id, x: selection.x, y: selection.y, color: DEFAULT_COLORS[0], legendName: "" };
      }
      function applyGraphFirstObjectAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          payload.changed = { slotIds: [slot.id], chartIds: [chart.id], csvIds: [], imageIds: [], assets: [] };
          payload.selectionHints = Object.freeze({ chartId: chart.id, selectedIndexHint: 0 });
          return;
        }
      }
      function applySlotDataConnectedAction(context) {
        if (context.payload.operation === "graphs.addObject") return applyGraphFirstObjectAction(context);
        return applyProjectAssetConnectedAction(context, "csv");
      }
      function applyGraphObjectEditAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
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
      function applyGraphObjectsReplacedAction(context) {
        const { machine, payload } = context;
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
        activeProject.initialize(candidate);
        chart=getChart(payload.chartId);
        if(chart.editor.editable!==false)rebuildEditableGraph(chart);
        payload.graphObjectCount = chart.editor.objects.length;
        payload.chart=chart;
      }
      function applyChartLayoutChangedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const after = activeProject._state;
          payload.changed = { slotIds: [], chartIds: after.charts.filter(item =>
            JSON.stringify(item) !== JSON.stringify(source.charts.find(before => before.id === item.id))).map(item => item.id),
            csvIds: [], imageIds: [], assets: [] };
          return;
        }
      }
      function applyChartModelReplacedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
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
      function applyEmptyImageInsertedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const image = activeProject._state.assets.images.find(item => item.id === id);
          payload.changed = { slotIds: [current.id], chartIds: Number.isInteger(removedChartId) ? [removedChartId] : [], csvIds: [], imageIds: [id],
            assets: [{ role: "created", kind: "image", id, path: projectAssetPath(image), owners: [{ slotId: current.id, chartId: null }] }] };
          return;
        }
      }
      function applySlotImageImportedAction(context) {
        const { machine, payload } = context;
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
        activeProject.initialize(candidate);
        payload.image=getProjectImage(imageId);
        payload.clearGraphSelection = true;
      }
      function applySlotChartImportedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          payload.changed = { slotIds: [slot.id],
            chartIds: [...new Set([oldChartId, chart.id].filter(Number.isInteger))],
            csvIds, imageIds: [], assets };
          payload.selectionHints = immutableProjectCopy({ chartId: chart.id, selectedIndexHint: null });
          return;
        }
      }
      function applyGridLayoutChangedAction({ machine, payload }) {
        machine.assertWritable("layout", "GRID_LAYOUT_CHANGED");
        machine.assertWritable("slots", "GRID_LAYOUT_CHANGED");
        const candidate = buildGridResizeCandidate(payload.rows, payload.cols);
        activeProject.initialize(candidate);
        payload.clearGraphSelection = true;
        payload.selectionHints = { reResolveSlotSelection: true, clearAssetSelection: true };
      }
      function applyProjectDirectoryCreatedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const actual = projectVfs.resolve(path, activeProject._state);
          payload.changed = { slotIds: [], chartIds: [], csvIds: [], imageIds: [], assets: [],
            createdDirectoryPath: actual.path };
          return;
        }
      }
      function immutableProjectCopy(value) {
        const freeze = (copy) => {
          if (copy && typeof copy === "object") {
            Object.values(copy).forEach(freeze);
            Object.freeze(copy);
          }
          return copy;
        };
        return freeze(projectClone(value));
      }
      function collectAssetReferences(csvIds, imageIds, state) {
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
      function projectAssetReferenceCount(csvIds, imageIds, state = activeProject._state) {
        return collectAssetReferences(csvIds, imageIds, state).length;
      }
      function removeProjectAssetReferences(csvIds, imageIds, state=activeProject._state) {
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
      function applyProjectTrashEmptiedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
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
      function applyProjectNodeMovedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
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
      function applyProjectNameChangedAction({ machine, payload }) {
        machine.assertWritable("project", "PROJECT_NAME_CHANGED");
        while (true) {
          const source = activeProject._state;
          let name = String(payload.value);
          if (payload.trim === true) name = name.trim();
          const candidate = projectClone(source);
          candidate.meta.projectName = name.slice(0, BackendSettings.defaults.naming.projectNameMaxLength);
          validateProjectObjectState(candidate, { requireSlots: true });
          if (activeProject._state !== source) continue;
          activeProject.initialize(candidate);
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
      function applyLabelSettingsChangedAction({ machine, payload }) {
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
        activeProject.initialize(candidate);
      }
      function applyLabelPositionChangedAction({ machine, payload }) {
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
        activeProject.initialize(candidate);
      }
      function applyAppearanceChangedAction({ machine, payload }) {
        machine.assertWritable("appearance", "APPEARANCE_CHANGED");
        let candidate = projectClone(activeProject._state);
        candidate.appearance.uiPalette = Object.fromEntries(
          Object.entries(DEFAULT_UI_PALETTE).map(([key, fallback]) => {
            const value = payload.palette?.[key];
            return [key, typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback];
          }),
        );
        validateProjectObjectState(candidate, { requireSlots: true });
        activeProject.initialize(candidate);
      }
      function applyExportSettingsChangedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const post = activeProject._state, changedIds = (before, after) => after.filter(item =>
            JSON.stringify(before.find(old => old.id === item.id)) !== JSON.stringify(item)).map(item => item.id);
          payload.changed = { slotIds: changedIds(source.slots, post.slots), chartIds: changedIds(source.charts, post.charts),
            csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles), imageIds: changedIds(source.assets.images, post.assets.images), assets: [] };
          return;
        }
      }
      function applySlotImageSettingsChangedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const post = activeProject._state, changedIds = (before, after) => after.filter(item =>
            JSON.stringify(before.find(old => old.id === item.id)) !== JSON.stringify(item)).map(item => item.id);
          payload.changed = { slotIds: changedIds(source.slots, post.slots),
            chartIds: changedIds(source.charts, post.charts), csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles),
            imageIds: changedIds(source.assets.images, post.assets.images), assets: [] };
          return;
        }
      }
      function applyCaptionSettingsChangedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          const post = activeProject._state, changedIds = (before, after) => after.filter(item =>
            JSON.stringify(before.find(old => old.id === item.id)) !== JSON.stringify(item)).map(item => item.id);
          payload.changed = { slotIds: changedIds(source.slots, post.slots), chartIds: changedIds(source.charts, post.charts),
            csvIds: changedIds(source.assets.csvFiles, post.assets.csvFiles), imageIds: changedIds(source.assets.images, post.assets.images), assets: [] };
          return;
        }
      }
      function applyLayoutStyleChangedAction({ machine, payload }) {
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
        activeProject.initialize(candidate);
      }
      function resolveLayoutCommandSlots(candidate, slotIds) {
        if (!Array.isArray(slotIds) || !slotIds.length || !slotIds.every(Number.isInteger))
          throw Error("현재 표시된 슬롯 ID를 선택하세요.");
        return [...new Set(slotIds)].map((id) => {
          const slot = candidate.slots.find((item) => item.id === id);
          if (!slot || slot.hidden) throw Error("현재 표시된 슬롯을 확인할 수 없습니다.");
          return slot;
        });
      }
      function applySlotsMergedAction({ machine, payload }) {
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
        activeProject.initialize(candidate);
        payload.selectionHints = {
          mergeSlotIds: selected.map((slot) => slot.id),
          anchorId: anchor.id,
        };
      }
      function applySlotsSplitAction({ machine, payload }) {
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
        activeProject.initialize(candidate);
      }
      function applyAssetsImportedAction({ machine, payload }) {
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
          activeProject.initialize(candidate);
          payload.changed = changed;
          for (const fact of imported)
            if (fact.kind === "image") releaseProjectImageDisplayUrl(source.assets.images.find(image => image.id === fact.id));
          return;
        }
      }
      function buildProjectAssetImportCandidate(source, payload) {
        const { files, choices, targetSlotId } = payload;
        if (!Array.isArray(files) || !files.length || !Array.isArray(choices) || files.length !== choices.length ||
            typeof payload.directory !== "string" || projectVfs.resolve(payload.directory, source)?.kind !== "directory" || projectVfs.isTrashed(payload.directory))
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
              if (target.contentType !== "image") return null;
              target.imageId = staged.id;
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
        return { candidate, imported };
      }

      function applyAssetSelectionAction({ machine, payload }) {
        if (payload.validatedInput?.event === "SELECT_SLOT" &&
            payload.validatedInput.reference !== null &&
            payload.validatedInput.selectionHint === "clear-graph-object") return;
        let path = payload.validatedInput?.event === "SELECT_ASSET"
          ? payload.validatedInput.reference : null;
        machine.state = Object.freeze({
          ...machine.state,
          assetPath: path ?? null,
        });
      }
      function assetSelectionTarget({ payload }) {
        return payload.validatedInput.selectionHint || "none";
      }
      function requestedOverlayState({ state, payload }) {
        return state === payload.overlay ? "none" : payload.overlay;
      }
      function exitGraphWorkspaceState({ machine }) {
        machine.state = Object.freeze({
          ...machine.state,
          graphObject: "none",
          graphObjectIndex: null,
        });
      }
      function readmeContentHtml() {
        let template = $("readmeContent");
        return template ? template.innerHTML.replaceAll("{{APP_BUILD}}", APP_BUILD) : "";
      }
      function enterLifecycleState({ state, payload }) {
        let busy = state === "importing" || state === "exporting";
        document.body.classList.toggle("app-busy", busy);
        document.body.setAttribute("aria-busy", String(busy));
        if (state === "error" && payload.error)
          debugLog("fsm:lifecycle-error", payload.error, "error");
      }
      const SHARED_WORKSPACE_EVENTS = {
          SELECT_SLOT: {
            action: applySlotSelectionAction,
            target: requestedWorkspaceState,
          },
        },
        SHARED_OVERLAY_EVENTS = {
          TOGGLE_OVERLAY: { target: requestedOverlayState },
          CLOSE_OVERLAY: { target: "none" },
          OUTSIDE_CLICK: { target: "none" },
          ESCAPE: { target: "none" },
          SELECT_SLOT: {
            target: ({ state, payload }) => payload.slotId == null ? state : "none",
          },
        },
        GRAPH_OBJECT_EVENTS = {
          SELECT_ASSET: {
            action: applyGraphObjectSelectionAction,
            target: "none",
          },
          SELECT_GRAPH_OBJECT: {
            action: applyGraphObjectSelectionAction,
            target: ({ payload }) => payload.validatedInput.reference !== null ? "selected" : "none",
          },
          CLEAR_GRAPH_OBJECT: {
            action: applyGraphObjectSelectionAction,
            target: "none",
          },
          SELECT_SLOT: {
            action: applyGraphObjectSelectionAction,
            target: "none",
          },
        },
        ASSET_SELECTION_EVENTS = {
          SELECT_ASSET: {
            action: applyAssetSelectionAction,
            target: assetSelectionTarget,
          },
          CLEAR_ASSET_SELECTION: {
            action: applyAssetSelectionAction,
            target: "none",
          },
          SELECT_SLOT: {
            action: applyAssetSelectionAction,
            target: ({ machine, payload }) => payload.validatedInput.reference !== null &&
              payload.validatedInput.selectionHint === "clear-graph-object" ? machine.state.assetSelection : "none",
          },
        },
        APP_STATE_DEFINITIONS = {
          lifecycle: {
            booting: {
              objects: ["project"],
              entry: enterLifecycleState,
              on: { READY: { target: "ready" } },
            },
            ready: {
              objects: ["project", "ui"],
              entry: enterLifecycleState,
              on: {
                BEGIN_IMPORT: { target: "importing" },
                BEGIN_EXPORT: { target: "exporting" },
                FAIL: { target: "error" },
              },
            },
            importing: {
              objects: ["project", "data", "images", "charts", "slots"],
              entry: enterLifecycleState,
              on: { COMPLETE: { target: "ready" }, FAIL: { target: "error" } },
            },
            exporting: {
              objects: ["project", "layout", "labels", "captions", "data", "images", "charts", "slots"],
              entry: enterLifecycleState,
              on: { COMPLETE: { target: "ready" }, FAIL: { target: "error" } },
            },
            error: {
              objects: ["project", "ui"],
              entry: enterLifecycleState,
              on: { RECOVER: { target: "ready" } },
            },
          },
          workspace: {
            project: {
              objects: [
                "project",
                "layout",
                "labels",
                "captions",
                "data",
                "images",
                "files",
                "charts",
                "slots",
                "ui",
              ],
              on: SHARED_WORKSPACE_EVENTS,
            },
            "slot.graph": {
              objects: [
                "slots",
                "charts",
                "data",
                "images",
                "files",
                "layout",
                "labels",
                "captions",
                "ui",
              ],
              exit: exitGraphWorkspaceState,
              on: SHARED_WORKSPACE_EVENTS,
            },
            "slot.image": {
              objects: [
                "slots",
                "charts",
                "data",
                "images",
                "files",
                "layout",
                "labels",
                "captions",
                "ui",
              ],
              on: SHARED_WORKSPACE_EVENTS,
            },
          },
          overlay: {
            none: {
              objects: ["ui"],
              on: SHARED_OVERLAY_EVENTS,
            },
            layout: {
              objects: ["layout", "slots", "ui"],
              on: SHARED_OVERLAY_EVENTS,
            },
            label: {
              objects: ["labels", "slots", "ui"],
              on: SHARED_OVERLAY_EVENTS,
            },
            caption: {
              objects: ["captions", "slots", "labels", "ui"],
              on: SHARED_OVERLAY_EVENTS,
            },
            print: {
              objects: ["project", "layout", "labels", "captions", "charts", "images", "slots", "ui"],
              on: SHARED_OVERLAY_EVENTS,
            },
            readme: {
              objects: ["project", "ui"],
              on: SHARED_OVERLAY_EVENTS,
            },
          },
          assetSelection: {
            none: {
              objects: ["data", "images", "ui"],
              on: ASSET_SELECTION_EVENTS,
            },
            csv: {
              objects: ["data", "images", "ui"],
              on: ASSET_SELECTION_EVENTS,
            },
            image: {
              objects: ["data", "images", "ui"],
              on: ASSET_SELECTION_EVENTS,
            },
            directory: {
              objects: ["data", "images", "ui"],
              on: ASSET_SELECTION_EVENTS,
            },
          },
          graphObject: {
            none: {
              objects: ["slots", "charts"],
              on: GRAPH_OBJECT_EVENTS,
            },
            selected: {
              objects: ["slots", "charts"],
              on: GRAPH_OBJECT_EVENTS,
            },
          },
        };
      const projectObjects = new ProjectObjectRegistry(() => activeProject)
        .registerPath("project", PROJECT_OBJECT_PATHS.project)
        .registerPath("layout", PROJECT_OBJECT_PATHS.layout)
        .registerPath("labels", PROJECT_OBJECT_PATHS.labels)
        .registerPath("captions", PROJECT_OBJECT_PATHS.captions)
        .registerPath("data", PROJECT_OBJECT_PATHS.data)
        .registerPath("images", PROJECT_OBJECT_PATHS.images)
        .registerPath("files", PROJECT_OBJECT_PATHS.files)
        .registerPath("charts", PROJECT_OBJECT_PATHS.charts)
        .registerPath("slots", PROJECT_OBJECT_PATHS.slots)
        .registerPath("sequences", PROJECT_OBJECT_PATHS.sequences)
        .registerPath("appearance", PROJECT_OBJECT_PATHS.appearance)
        .registerPath("export", PROJECT_OBJECT_PATHS.export)
        .register("ui", {
          read: (project) => ({
            selectedSlotId,
            palette: project.appearance.uiPalette,
          }),
        });
      const PROJECT_COMMAND_ACTIONS = Object.freeze({
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
      const PROJECT_COMMANDS = new Set(Object.keys(PROJECT_COMMAND_ACTIONS));
      const interfaceFSM = new InterfaceStateMachine(APP_STATE_DEFINITIONS);
      const projectEFSM = new ProjectStateMachine(projectObjects, PROJECT_COMMAND_ACTIONS);

      function runLifecycleTask(lifecycle, event, task) {
        if (interfaceFSM.state.lifecycle !== "ready")
          return Promise.reject(
            Error(`현재 ${interfaceFSM.state.lifecycle} 상태에서는 ${event} 작업을 시작할 수 없습니다.`),
          );
        interfaceFSM.send("LIFECYCLE_START", { lifecycle, event });
        const complete = (result) => {
          const outcome = result?.outcome === "rejected" ? "rejected" : result?.outcome || "complete";
          interfaceFSM.send("LIFECYCLE_COMPLETE", { event, outcome });
          return result;
        };
        const fail = (error) => {
          interfaceFSM.send("LIFECYCLE_FAILED", { event, error });
          throw error;
        };
        try {
          const result = task();
          return result && typeof result.then === "function"
            ? result.then(complete, fail)
            : Promise.resolve(complete(result));
        } catch (error) {
          try {
            fail(error);
          } catch (failed) {
            return Promise.reject(failed);
          }
        }
      }

      function dispatchProjectCommand(event, payload = {}) {
        let result = projectEFSM.send(event, payload);
        if (result.committed)
          interfaceFSM.reconcileProjectResult(event,
            buildFrontendReconciliationInput(event, result, interfaceFSM.readState()));
        return result;
      }

      const appFSM = Object.freeze({
        get state() { return interfaceFSM.state; },
        get writeLocks() { return interfaceFSM.writeLocks; },
        readState: () => interfaceFSM.readState(),
        query: (kind, request) => readBackendProjection(kind, request),
        definition: (...args) => interfaceFSM.definition(...args),
        send(event, payload = {}) {
          if (PROJECT_COMMANDS.has(event)) {
            dispatchProjectCommand(event, payload);
            return interfaceFSM.state;
          }
          let validatedInput = BACKEND_REFERENCE_EVENTS.has(event)
            ? validateFrontendIntent(event, { ...payload, selectedSlotId }) : null;
          if (validatedInput && !validatedInput.accepted) return interfaceFSM.state;
          interfaceFSM.send(event, validatedInput ? { ...payload, validatedInput } : payload);
          return interfaceFSM.state;
        },
        notify: (...args) => interfaceFSM.notify(...args),
        run: (...args) => runLifecycleTask(...args),
        ready: () => interfaceFSM.ready(workspaceStateFromModel()),
        subscribe: (...args) => interfaceFSM.subscribe(...args),
      });
      function selectedProjectAsset() {
        let path = appFSM.state.assetPath;
        return path ? projectVfs.resolve(path) : null;
      }
      function selectedProjectCsv() {
        let selected = selectedProjectAsset();
        return selected?.kind === "csv" ? selected.asset : null;
      }
      const ALLOWED_CHART_TYPES = new Set(["scatter", "markers", "lines+markers", "bar", "hidden"]);
      const ALLOWED_LINE_DASHES = new Set(["solid", "dot", "dash", "dashdot"]);
      const ALLOWED_MARKER_SYMBOLS = new Set([
        "circle",
        "square",
        "diamond",
        "cross",
        "x",
        "triangle-up",
        "triangle-down",
      ]);
      const ALLOWED_AXIS_SIDES = { x: new Set(["bottom", "top"]), y: new Set(["left", "right"]) };
      const CURRENT_OBJECT_KEYS = new Set([
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
      const REQUIRED_APP_FUNCTIONS = [
        ["readProjectNumber", () => typeof readProjectNumber === "function"],
        ["importProject", () => typeof importProject === "function"],
        ["ffpxReadProject", () => typeof ffpxReadProject === "function"],
        ["downloadProject", () => typeof downloadProject === "function"],
        ["ffpxDataUrlBytes", () => typeof ffpxDataUrlBytes === "function"],
        ["ffpxBase64ToBytes", () => typeof ffpxBase64ToBytes === "function"],
        ["ffpxBytesToBase64", () => typeof ffpxBytesToBase64 === "function"],
        ["normalizeGlobalSettings", () => typeof normalizeGlobalSettings === "function"],
        ["normalizeImageSettings", () => typeof normalizeImageSettings === "function"],
        ["traces", () => typeof traces === "function"],
        ["layout", () => typeof layout === "function"],
        ["renderDashboard", () => typeof renderDashboard === "function"],
        ["makeSlots", () => typeof makeSlots === "function"],
        ["applyImageSettingsFromValues", () => typeof applyImageSettingsFromValues === "function"],
        ["projectClone", () => typeof projectClone === "function"],
        ["ProjectObject", () => activeProject instanceof ProjectObject],
        ["buildProjectObject", () => typeof buildProjectObject === "function"],
        ["validateProjectObject", () => typeof validateProjectObject === "function"],
        ["renderProjectObject", () => typeof renderProjectObject === "function"],
        ["projectObjects", () => projectObjects instanceof ProjectObjectRegistry],
        ["interfaceFSM", () => interfaceFSM instanceof InterfaceStateMachine],
        ["projectEFSM", () => projectEFSM instanceof ProjectStateMachine],
        ["auditApp", () => typeof auditApp === "function"],
      ];
      function auditObject(object, chartId, index, issues, allowNoCsv = false) {
        if (!object || typeof object !== "object") {
          issues.push({ kind: "invalid-object", chartId, index, value: object });
          return;
        }
        let keys = Object.keys(object),
          unknown = keys.filter((key) => !CURRENT_OBJECT_KEYS.has(key));
        if (unknown.length)
          issues.push({ kind: "unknown-object-keys", chartId, index, keys: unknown });
        if (typeof object.x !== "string" || typeof object.y !== "string")
          issues.push({ kind: "invalid-object-columns", chartId, index, x: object.x, y: object.y });
        if (!allowNoCsv && (!Number.isInteger(object.csvId) || !getProjectCsv(object.csvId)))
          issues.push({ kind: "orphan-object-csv", chartId, index, csvId: object.csvId });
        if (!ALLOWED_CHART_TYPES.has(object.type))
          issues.push({ kind: "invalid-chart-type", chartId, index, value: object.type });
        if (!ALLOWED_AXIS_SIDES.x.has(object.xAxisSide))
          issues.push({ kind: "invalid-x-axis-side", chartId, index, value: object.xAxisSide });
        if (!ALLOWED_AXIS_SIDES.y.has(object.yAxisSide))
          issues.push({ kind: "invalid-y-axis-side", chartId, index, value: object.yAxisSide });
        if (!ALLOWED_LINE_DASHES.has(object.lineDash || "solid"))
          issues.push({ kind: "invalid-line-dash", chartId, index, value: object.lineDash });
        if (!ALLOWED_MARKER_SYMBOLS.has(object.markerSymbol || "circle"))
          issues.push({
            kind: "invalid-marker-symbol",
            chartId,
            index,
            value: object.markerSymbol,
          });
        [
          ["lineWidth", 0.1, 20],
          ["markerSize", 1, 40],
          ["barOpacity", 0.05, 1],
          ["barLineWidth", 0, 10],
        ].forEach(([key, min, max]) => {
          let value = Number(object[key]);
          if (!Number.isFinite(value) || value < min || value > max)
            issues.push({
              kind: "invalid-numeric-value",
              chartId,
              index,
              key,
              value: object[key],
              min,
              max,
            });
        });
      }
      function auditApp(context = "manual") {
        let issues = [],
          ids = [...document.querySelectorAll("[id]")].map((node) => node.id),
          duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
          missingControls = ["dashboard", "dashboardCaption", "graphArea", "readmeContent"].filter(
            (id) => !document.getElementById(id),
          ),
          missingFunctions = REQUIRED_APP_FUNCTIONS.filter(([, check]) => !check()).map(
            ([name]) => name,
          );
        if (missingFunctions.length)
          issues.push({ kind: "missing-functions", names: missingFunctions });
        if (duplicates.length) issues.push({ kind: "duplicate-controls", ids: duplicates });
        if (missingControls.length) issues.push({ kind: "missing-controls", ids: missingControls });
        if (!["booting", "ready", "importing", "exporting", "error"].includes(appFSM.state.lifecycle))
          issues.push({ kind: "invalid-fsm-lifecycle", lifecycle: appFSM.state.lifecycle });
        if (!["project", "slot.graph", "slot.image"].includes(appFSM.state.workspace))
          issues.push({ kind: "invalid-fsm-workspace", workspace: appFSM.state.workspace });
        if (!["none", "layout", "label", "caption", "print", "readme"].includes(appFSM.state.overlay))
          issues.push({ kind: "invalid-fsm-overlay", overlay: appFSM.state.overlay });
        if (
          !["fsm-to-model", "model-to-fsm", "model-to-ui"].includes(
            appFSM.state.direction,
          )
        )
          issues.push({
            kind: "invalid-fsm-direction",
            direction: appFSM.state.direction,
          });
        if (appFSM.state.lifecycle === "ready" && appFSM.writeLocks.size)
          issues.push({
            kind: "fsm-write-lock-leak",
            locks: [...appFSM.writeLocks],
          });
        let derivedWorkspace = workspaceStateFromModel();
        if (appFSM.state.workspace !== derivedWorkspace)
          issues.push({
            kind: "fsm-workspace-out-of-sync",
            state: appFSM.state,
            derived: derivedWorkspace,
          });
        for (let region of ["lifecycle", "workspace", "overlay"]) {
          let definition = appFSM.definition(region);
          (definition.objects || []).forEach((name) => {
            try {
              projectObjects.read(name);
            } catch (error) {
              issues.push({
                kind: "fsm-object-unavailable",
                region,
                state: appFSM.state[region],
                object: name,
                message: error.message,
              });
            }
          });
        }
        for (let state of ["project", "slot.graph", "slot.image"]) {
          let names = APP_STATE_DEFINITIONS.workspace[state].objects || [],
            missing = ["data", "images", "charts", "slots"].filter(
              (name) => !names.includes(name),
            );
          if (missing.length)
            issues.push({
              kind: "fsm-data-tree-objects-missing",
              state,
              missing,
            });
        }
        try {
          validateProjectObject(activeProject, { requireSlots: true });
        } catch (error) {
          issues.push({
            kind: "invalid-project-object",
            message: error.message,
          });
        }
        let selectedPathAsset = appFSM.state.assetPath
          ? projectVfs.resolve(appFSM.state.assetPath)
          : null;
        if (
          (appFSM.state.assetSelection === "none") !== (selectedPathAsset === null) ||
          (selectedPathAsset && selectedPathAsset.kind !== appFSM.state.assetSelection)
        )
          issues.push({
            kind: "fsm-asset-path-out-of-sync",
            selection: appFSM.state.assetSelection,
            path: appFSM.state.assetPath,
          });
        if (typeof activeProject.captionAfterText !== "string")
          issues.push({
            kind: "invalid-caption-after-text",
            value: activeProject.captionAfterText,
          });
        document.querySelectorAll("select[id]").forEach((select) => {
          if (select.value && ![...select.options].some((option) => option.value === select.value))
            issues.push({ kind: "invalid-select-value", id: select.id, value: select.value });
        });
        let csvIds = new Set();
        activeProject.csvFiles.forEach((csv, index) => {
          if (
            !csv ||
            !Number.isInteger(csv.id) ||
            csvIds.has(csv.id) ||
            Object.prototype.hasOwnProperty.call(csv, "path") ||
            typeof csv.name !== "string" ||
            typeof csv.directory !== "string" ||
            !Array.isArray(csv.rows) ||
            typeof csv.bytesBase64 !== "string" ||
            !Number.isInteger(csv.headerLines)
          )
            issues.push({ kind: "invalid-project-csv", index, id: csv?.id });
          else csvIds.add(csv.id);
        });
        let imageIds = new Set();
        activeProject.images.forEach((image, index) => {
          if (
            !image ||
            !Number.isInteger(image.id) ||
            imageIds.has(image.id) ||
            Object.prototype.hasOwnProperty.call(image, "path") ||
            typeof image.name !== "string" ||
            typeof image.directory !== "string" ||
            typeof image.mime !== "string" ||
            typeof image.bytesBase64 !== "string" ||
            !image.bytesBase64
          )
            issues.push({ kind: "invalid-project-image", index, id: image?.id });
          else imageIds.add(image.id);
        });
        let chartIds = new Set();
        activeProject.charts.forEach((chart, index) => {
          if (!chart || typeof chart !== "object") {
            issues.push({ kind: "invalid-chart", index, value: chart });
            return;
          }
          if (!Number.isInteger(chart.id) || chartIds.has(chart.id))
            issues.push({ kind: "invalid-or-duplicate-chart-id", index, id: chart.id });
          chartIds.add(chart.id);
          if (!chart.editor || !Array.isArray(chart.editor.objects))
            issues.push({ kind: "missing-object-array", chartId: chart.id });
          else
            chart.editor.objects.forEach((object, objectIndex) =>
              auditObject(
                object,
                chart.id,
                objectIndex,
                issues,
                chart.editor.editable === false,
              ),
            );
        });
        activeProject.slots.forEach((slot, index) => {
          if (!slot || typeof slot !== "object") issues.push({ kind: "invalid-slot", index });
          else {
            if (slot.chart !== null && slot.chart !== undefined && !chartIds.has(slot.chart))
              issues.push({ kind: "orphan-slot-chart", slotId: slot.id, chart: slot.chart });
            if (slot.imageId !== null && slot.imageId !== undefined && !imageIds.has(slot.imageId))
              issues.push({ kind: "orphan-slot-image", slotId: slot.id, imageId: slot.imageId });
            if (slot.caption !== null && typeof slot.caption !== "string")
              issues.push({
                kind: "invalid-slot-caption",
                slotId: slot.id,
                caption: slot.caption,
              });
          }
        });
        let summary = {
          context,
          build: projectObjects.read("project").appBuild,
          controls: ids.length,
          csvFiles: activeProject.csvFiles.length,
          images: activeProject.images.length,
          charts: activeProject.charts.length,
          slots: activeProject.slots.length,
          issues: issues.length,
        };
        debugLog("audit:summary", summary, issues.length ? "warn" : "info");
        issues.forEach((issue) => debugLog("audit:issue", issue, "warn"));
        return { summary, issues };
      }
      function currentAxes(settings = {}) {
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
      function axisRangeValueFromPlotly(value, scaleType) {
        if (value === "" || value === null || value === undefined) return "";
        let number = Number(value);
        if (!Number.isFinite(number)) return "";
        let converted = scaleType === "log" ? 10 ** number : number;
        return Number.isFinite(converted) ? String(converted) : "";
      }
      function readGlobalSettings(chart) {
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
      function normalizeGraphLayoutSettings(input) {
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
      function normalizeGlobalSettings(chart, force = false) {
        let settings = readGlobalSettings(chart);
        if (force || !appFSM.writeLocks.has("editor")) chart.editor.globalSettings = settings;
        return settings;
      }
      function axisKey(kind, side) {
        return kind === "x"
          ? side === "top"
            ? "xTop"
            : "xBottom"
          : side === "right"
            ? "yRight"
            : "yLeft";
      }
      function dashboardReferenceWidth() {
        return activeProject.layout.slotStyle.referenceWidth;
      }
      function dashboardAspectValue() {
        return activeProject.layout.slotStyle.aspect;
      }
      function dashboardOuterMarginPixels() {
        return activeProject.layout.slotStyle.outerMargin;
      }
      function slotGapPixels() {
        return activeProject.layout.slotStyle.gap;
      }
      function slotRadiusPixels() {
        return activeProject.layout.slotStyle.radius;
      }
      function dashboardGeometry(width = dashboardReferenceWidth(), heightOverride = null) {
        return dashboardGeometryInProject(activeProject._state, width, heightOverride);
      }
      function dashboardGeometryInProject(project, width, heightOverride = null) {
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
      function gridSlotGeometry(layout, geometry, slot = null) {
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
      function applyReferenceGeometry(element) {
        if (!element) return;
        let rect = element.getBoundingClientRect(),
          geometry = dashboardGeometry(rect.width || dashboardReferenceWidth());
        element.style.setProperty("--dashboard-outer-margin", `${geometry.outerMargin}px`);
        element.style.setProperty("--slot-gap", `${geometry.gap}px`);
        element.style.setProperty("--slot-radius", `${geometry.radius}px`);
        return geometry;
      }
      function syncDashboardCaptionWidth() {
        let dashboard = $("dashboard"),
          caption = $("dashboardCaption");
        if (!dashboard || !caption) return;
        let width = dashboard.getBoundingClientRect().width;
        caption.style.marginLeft = "0px";
        caption.style.width = `${width}px`;
        caption.style.minWidth = `${width}px`;
      }
      function applySlotStyle(_fromControls = false, notify = true) {
        let style = activeProject.layout.slotStyle,
          bordersVisible = style.showBorders,
          border = bordersVisible ? "var(--ui-color)" : "transparent",
          aspect = style.aspect,
          hasAspect = Number.isFinite(aspect) && aspect > 0,
          dashboard = $("dashboard");
        ["dashboard", "dashboardCaption"].forEach((id) => {
          let el = $(id);
          if (el) {
            el.style.setProperty("--slot-border-color", border);
            el.style.setProperty("--layout-slot-border-style", bordersVisible ? "solid" : "dashed");
          }
        });
        dashboard.classList.toggle("fixed-aspect", hasAspect);
        if (hasAspect) dashboard.style.setProperty("--dashboard-aspect", `${aspect} / 1`);
        else dashboard.style.removeProperty("--dashboard-aspect");
        requestAnimationFrame(() => {
          applyReferenceGeometry(dashboard);
        });
        let width =
            dashboard.getBoundingClientRect().width ||
            Number.parseFloat(dashboard.style.width) ||
            0,
          minWidth = Number.parseFloat(dashboard.style.minWidth) || width;
        if (width) syncDashboardCaptionWidth();
        if (notify) appFSM.notify("layout", "LAYOUT_STYLE_CHANGED");
      }
      function newGridSlot(id, row, col) {
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
      function buildGridResizeCandidate(rows, cols) {
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
      function parseCSV(text, d = ",") {
        let a = [],
          r = [],
          c = "",
          q = false,
          rowStarted = false;
        for (let i = 0; i < text.length; i++) {
          let z = text[i],
            n = text[i + 1];
          rowStarted = true;
          if (z === '"' && q && n === '"') {
            c += '"';
            i++;
          } else if (z === '"') q = !q;
          else if (z === d && !q) {
            r.push(c);
            c = "";
          } else if ((z === "\n" || z === "\r") && !q) {
            if (z === "\r" && n === "\n") i++;
            r.push(c);
            a.push(r);
            r = [];
            c = "";
            rowStarted = false;
          } else c += z;
        }
        if (q) throw Error("CSV 인용 문자열이 닫히지 않았습니다.");
        if (rowStarted || r.length) {
          r.push(c);
          a.push(r);
        }
        return a;
      }
      function dataTable(data) {
        if (!Array.isArray(data) || !data.length) throw Error("행이 하나 이상이어야 합니다.");
        if (data.every(Array.isArray)) return structuredClone(data);
        if (data.every((row) => row !== null && typeof row === "object" && !Array.isArray(row))) {
          let headers = [...new Set(data.flatMap((row) => Object.keys(row)))];
          return [headers, ...data.map((row) => headers.map((header) =>
            Object.hasOwn(row, header) ? structuredClone(row[header]) : ""))];
        }
        throw Error("CSV 행 배열 또는 객체 배열이어야 합니다.");
      }
      function getProjectCsv(id, collection = activeProject.csvFiles) {
        return collection.find((csv) => csv.id === id) || null;
      }
      function getProjectImage(id, collection = activeProject.images) {
        return collection.find((image) => image.id === id) || null;
      }
      function slotImage(slot, collection = activeProject.images) {
        return getProjectImage(slot?.imageId, collection);
      }
      function projectImageDataUrl(image) {
        return image
          ? `data:${image.mime || "application/octet-stream"};base64,${image.bytesBase64 || ""}`
          : "";
      }
      const projectImageDisplayUrls = new Map();
      function projectImageDisplayUrl(image) {
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
      function releaseProjectImageDisplayUrl(image) {
        let url = image && projectImageDisplayUrls.get(image);
        if (!url) return;
        URL.revokeObjectURL(url);
        projectImageDisplayUrls.delete(image);
      }
      function releaseProjectImageDisplayUrls(collection) {
        (Array.isArray(collection) ? collection : []).forEach(releaseProjectImageDisplayUrl);
      }
      function buildProjectImageModel(
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
      function createProjectImage(bytes, name, mime, id = null, path = null) {
        const copiedBytes = typeof bytes === "string" ? bytes : new Uint8Array(bytes || []).slice(),
          result = dispatchProjectCommand("IMAGE_OBJECT_CREATED", { bytes: copiedBytes, name, mime, id, path });
        if (!result.committed) return result;
        const created = result.changed.assets.find(asset => asset.role === "created" && asset.kind === "image");
        return appFSM.query("project-api", { operation: "assets.readDeletionTarget", path: created.path }).target;
      }
      function projectCsvName(value, fallback = "data.csv") {
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
      function buildProjectCsvModel(
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
      function createProjectCsv(
        data,
        name,
        id = null,
        bytesBase64 = "",
        mime = "text/csv",
        headerLines = 1,
        path = null,
      ) {
        const result = dispatchProjectCommand("DATA_OBJECT_CREATED", {
          data, name, id, bytesBase64, mime, headerLines, path,
        });
        if (!result.committed) return result;
        const created = result.changed.assets.find(asset => asset.role === "created" && asset.kind === "csv");
        return appFSM.query("project-api", { operation: "assets.readDeletionTarget", path: created.path }).target;
      }
      function createEmptyProjectCsv() {
        return createProjectCsv(
          [["X", "Y"], ["", ""]],
          "빈 CSV.csv",
          null,
          "",
          "text/csv",
          1,
        );
      }
      function requireProjectCsv(chart, label = "차트", collection = activeProject.csvFiles) {
        let csv = getProjectCsv(
          chart?.editor?.objects?.[0]?.csvId ?? chart?.csvId,
          collection,
        );
        if (!csv) throw Error(`${label}가 참조하는 프로젝트 CSV가 없습니다.`);
        return csv;
      }



      function chartUsesConversionView(chart) {
        return chart?.editor?.editable === false && Object.hasOwn(chart.editor, "conversionRows");
      }
      function chartCsvIds(chart) {
        if (chartUsesConversionView(chart)) return [];
        return [
          ...new Set(
            (chart?.editor?.objects || [])
              .map((object) => object.csvId)
              .filter((id) => Number.isInteger(id)),
          ),
        ];
      }
      const PROJECT_ASSET_DIRECTORIES = Object.freeze({
        csv: "/assets/csv",
        image: "/assets/images",
      });
      const PROJECT_TRASH_DIRECTORY = "/assets/trash";
      const PROJECT_FIXED_DIRECTORIES = Object.freeze([
        "/assets",
        PROJECT_ASSET_DIRECTORIES.csv,
        PROJECT_ASSET_DIRECTORIES.image,
        PROJECT_TRASH_DIRECTORY,
      ]);
      function projectPathInDirectory(path, directory) {
        let normalized = normalizeProjectPath(path, { directory: true }),
          parent = normalizeProjectPath(directory, { directory: true });
        return normalized === parent || normalized.startsWith(`${parent}/`);
      }
      function normalizeProjectPath(value, { directory = false } = {}) {
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
      function projectParentPath(path) {
        let normalized = normalizeProjectPath(path, { directory: true }),
          index = normalized.lastIndexOf("/");
        return index <= 0 ? "/" : normalized.slice(0, index);
      }
      function projectPathName(path) {
        return normalizeProjectPath(path, { directory: true }).split("/").filter(Boolean).pop() || "/";
      }
      function projectAssetPath(asset) {
        if (!asset || typeof asset !== "object") throw Error("프로젝트 자산이 올바르지 않습니다.");
        if (typeof asset.directory !== "string" || typeof asset.name !== "string")
          throw Error("프로젝트 자산 위치가 올바르지 않습니다.");
        let directory = normalizeProjectPath(asset.directory, { directory: true }),
          name = projectCsvName(asset.name, "");
        if (!name || name !== asset.name) throw Error("프로젝트 자산 이름이 올바르지 않습니다.");
        return normalizeProjectPath(`${directory}/${name}`);
      }
      const projectVfs = Object.freeze({
        exists(path, state = activeProject._state) {
          let target = normalizeProjectPath(path, { directory: true });
          return (
            (state.fileSystem?.directories || []).includes(target) ||
            [...(state.assets?.csvFiles || []), ...(state.assets?.images || [])].some(
              (asset) => projectAssetPath(asset) === target,
            )
          );
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
          let normalized = normalizeProjectPath(path, { directory: true });
          if ((state.fileSystem?.directories || []).includes(normalized))
            return { kind: "directory", path: normalized };
          for (let [kind, assets] of [
            ["csv", state.assets.csvFiles],
            ["image", state.assets.images],
          ]) {
            let asset = assets.find((item) => projectAssetPath(item) === normalized);
            if (asset) return { kind, asset };
          }
          return null;
        },
        isFixedDirectory(path) {
          let normalized = normalizeProjectPath(path, { directory: true });
          return PROJECT_FIXED_DIRECTORIES.includes(normalized);
        },
        isTrashed(path) {
          return projectPathInDirectory(path, PROJECT_TRASH_DIRECTORY);
        },
        descendants(path, state = activeProject._state) {
          let root = normalizeProjectPath(path, { directory: true }),
            prefix = `${root}/`;
          return [
            ...(state.assets?.csvFiles || []).map((asset) => ({ kind: "csv", asset })),
            ...(state.assets?.images || []).map((asset) => ({ kind: "image", asset })),
          ].filter(({ asset }) => {
            let path = projectAssetPath(asset);
            return path === root || path.startsWith(prefix);
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
      function calculateAssetCollisionInProject(source, kind, directory, filename, reservedPaths) {
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
      function projectAssetImportCollisionModel(file, directory, reservedPaths = null) {
        const source = activeProject._state;
        return calculateAssetCollisionInProject(source, slotFileKind(file), directory, file?.name, reservedPaths);
      }
      function resolveProjectAssetImportPlan(model, choice = "rename", reservedPaths = null) {
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
      function readAssetFileKind(file) {
        return readBackendProjection("project-api", { operation: "assets.fileKind",
          file: { name: file?.name, type: file?.type } });
      }
      function readAssetCollisionModel(file, directory, reservedPaths = null) {
        return readBackendProjection("project-api", { operation: "assets.collisionModel",
          file: { name: file?.name, type: file?.type }, directory, reservedPaths: Array.from(reservedPaths || []) });
      }
      function readAssetImportPlan(model, choice = "rename", reservedPaths = null) {
        return readBackendProjection("project-api", { operation: "assets.resolveImportPlan",
          model: immutableProjectCopy(model), choice, reservedPaths: Array.from(reservedPaths || []) });
      }
      function stageProjectAssetImport(candidate, item) {
        let bytes = new Uint8Array(item.file.bytes);
        if (item.kind === "data") {
          const data = parseProjectCsvAsset(item.file.name, bytes);
          let id = Number.isInteger(item.replaceId) ? item.replaceId : candidate.nextId.csv++,
            model = buildProjectCsvModel(
              data,
              item.file.name,
              id,
              ffpxBytesToBase64(bytes),
              item.file.type || "text/csv",
              1,
              candidate,
            );
          projectVfs.assignLocation(model, item.path);
          let index = candidate.assets.csvFiles.findIndex((asset) => asset.id === id);
          if (Number.isInteger(item.replaceId)) {
            if (index < 0) throw Error("교체할 CSV가 없습니다.");
            candidate.assets.csvFiles[index] = model;
          } else {
            if (index >= 0) throw Error(`CSV ID ${id}가 중복되었습니다.`);
            candidate.assets.csvFiles.push(model);
          }
          return { kind: "csv", id, name: model.name, model };
        }

        let id = Number.isInteger(item.replaceId) ? item.replaceId : candidate.nextId.image++,
          model = buildProjectImageModel(
            bytes,
            item.file.name,
            item.file.type,
            id,
            candidate,
          );
        projectVfs.assignLocation(model, item.path);
        let index = candidate.assets.images.findIndex((asset) => asset.id === id);
        if (Number.isInteger(item.replaceId)) {
          if (index < 0) throw Error("교체할 이미지가 없습니다.");
          if (candidate.assets.images[index]?.settings)
            model.settings = projectClone(candidate.assets.images[index].settings);
          candidate.assets.images[index] = model;
        } else {
          if (index >= 0) throw Error(`이미지 ID ${id}가 중복되었습니다.`);
          candidate.assets.images.push(model);
        }
        return { kind: "image", id, name: model.name, model };
      }

      async function prepareCopiedImportFiles(files) {
        const copied = [];
        for (const file of files)
          copied.push({ name: file.name, type: file.type, bytes: new Uint8Array(await file.arrayBuffer()).slice() });
        return copied;
      }
      async function collectCompletedImportChoices(files, directory, choosePlan) {
        if (typeof choosePlan !== "function") throw Error("프로젝트 자산 가져오기 계획이 없습니다.");
        const reserved = new Set(), choices = [];
        for (const file of files) {
          const plan = await choosePlan(file, directory, reserved);
          if (!plan) return null;
          if (typeof plan.path !== "string" ||
              !(plan.replaceId === null || (Number.isInteger(plan.replaceId) && plan.replaceId > 0)))
            throw Error("프로젝트 자산 가져오기 계획이 올바르지 않습니다.");
          choices.push({ path: plan.path, replaceId: plan.replaceId }); reserved.add(plan.path);
        }
        return choices;
      }
      function readImportedAssets(result) {
        return result.changed.assets.map(fact => readBackendProjection("project-api",
          { operation: "assets.readDeletionTarget", path: fact.path }).target);
      }
      async function importProjectFilesToDirectory(files, directory, planImport) {
        const list = Array.from(files || []);
        if (!list.length) return [];
        const choices = await collectCompletedImportChoices(list, directory, planImport);
        if (!choices) return null;
        const copied = await prepareCopiedImportFiles(list),
          result = dispatchProjectCommand("ASSETS_IMPORTED", { files: copied, directory, choices });
        if (!result.committed) return result;
        const imported = readImportedAssets(result);
        updateFileAvailability(); renderDashboard(); status(`${imported.length}개 자산을 프로젝트에 추가했습니다.`);
        return imported;
      }

      function projectDataTreeSnapshot(objects = {}) {
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

      function projectDataTreeObjects() {
        return {
          files: projectObjects.read("files"),
          data: projectObjects.read("data"),
          images: projectObjects.read("images"),
          charts: projectObjects.read("charts"),
          slots: projectObjects.read("slots"),
        };
      }
      function connectProjectAssetToSlot(path, kind, slotId) {
        if (!["csv", "image"].includes(kind)) throw Error("연결할 asset kind가 올바르지 않습니다.");
        const result = dispatchProjectCommand(kind === "csv" ? "SLOT_DATA_CONNECTED" : "SLOT_IMAGE_LINKED", { path, kind, slotId });
        if (!result.committed) return null;
        setSelectedSlot(slotId, "model-to-fsm");
        renderDashboard();
        status("프로젝트 파일을 슬롯에 연결했습니다.");
        return null;
      }
      function headerLineCount(value, table = []) {
        const number = Number(value);
        return Number.isFinite(number)
          ? Math.min(Math.max(0, Math.trunc(number)), Array.isArray(table) ? table.length : 0)
          : 0;
      }
      function columnIndex(column) {
        let match = /^C([1-9]\d*)$/.exec(String(column || ""));
        return match ? Number(match[1]) - 1 : -1;
      }
      function columnDefinitions(table = [], headerLines = 1) {
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
      function dataRows(table = [], headerLines = 1) {
        return (table || []).slice(headerLineCount(headerLines, table));
      }
      function esc(v) {
        return String(v).replace(
          /[&<>'"]/g,
          (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c],
        );
      }
      function value(v) {
        let n = Number(v);
        return v !== "" && Number.isFinite(n) ? n : v;
      }
      function graphDataSelection(matrix, headerLines, editor = {}) {
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
      function defaultChartEditor(slot, matrix, headerLines) {
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
      function tracesSingle(c) {
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
      function traces(c, project = activeProject._state) {
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
      function layout(c, project = activeProject._state) {
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
      function getChart(id) {
        return activeProject.charts.find((chart) => chart.id === id);
      }
      function slotAt(id) {
        return activeProject.slots.find((s) => s.id === id);
      }
      function resizePlots() {
        document.querySelectorAll(".plot-item").forEach((el) => {
          try {
            Plotly.Plots.resize(el);
          } catch (_) {}
        });
      }
      function schedulePlotResize() {
        if (resizePending) return;
        resizePending = true;
        requestAnimationFrame(() => {
          resizePending = false;
          resizePlots();
        });
      }
      function syncDashboardZoomDisplay() {
        let dashboard = $("dashboard"),
          dashboardWidth = dashboard?.getBoundingClientRect().width || 0;
        if (!dashboardWidth) return;
        return dashboardZoomLocked
          ? Math.max(
              50,
              Math.min(200, Math.round((dashboardWidth / dashboardReferenceWidth()) * 100)),
            )
          : Math.round(dashboardZoomIntent);
      }
      function installResizeObserver() {
        if (dashboardObserver) return;
        let target = $("dashboard"),
          area = $("graphArea"),
          handleResize = () => {
            applyDashboardZoom(false);
            syncDashboardZoomDisplay();
            schedulePlotResize();
          };
        if (window.ResizeObserver) {
          dashboardObserver = new ResizeObserver(() => {
            applyReferenceGeometry(target);
            syncDashboardZoomDisplay();
            schedulePlotResize();
          });
          dashboardObserver.observe(target);
          graphAreaObserver = new ResizeObserver(handleResize);
          if (area) graphAreaObserver.observe(area);
        } else window.addEventListener("resize", handleResize);
      }
      function isSlotSelected(slot) {
        return !!slot && slot.id === selectedSlotId;
      }
      function getSelectedSlot() {
        let slot = selectedSlotId === null ? null : slotAt(selectedSlotId);
        return slot && !slot.hidden ? slot : null;
      }
      function normalizeImageSettings(slot) {
        if (!slot) return null;
        const content = slot.content && typeof slot.content === "object" && !Array.isArray(slot.content)
          ? slot.content : {};
        const settings = content.imageSettings && typeof content.imageSettings === "object"
          ? content.imageSettings
          : slot.imageSettings && typeof slot.imageSettings === "object"
            ? slot.imageSettings : DEFAULT_IMAGE_SETTINGS;
        return readImageSettings(settings);
      }
      function readImageSettings(settings) {
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
      function updateFileAvailability() {
        let hasSlot = !!getSelectedSlot();
        if (hasSlot && appFSM.state.overlay === "readme")
          appFSM.send("CLOSE_OVERLAY", { reason: "slot-selected" });
      }
      function updateGraphView() {
        debugLog("updateGraphView", { selectedSlotId });
        renderDashboard();
      }
      function dashboardProjectionEffect(event, payload = {}) {
        if (event === "PROJECT_NODE_MOVED" || event === "PROJECT_TRASH_EMPTIED")
          return (payload.removedGraphReferenceCount || 0) > 0 ||
            (payload.resetImageSlotCount || 0) > 0
            ? "FULL_DASHBOARD"
            : "NONE";
        if (event === "SLOTS_SWAPPED") return "FULL_DASHBOARD";
        return "NONE";
      }
      function dispatchDashboardAffectingEvent(event, payload = {}) {
        appFSM.send(event, payload);
        let projectionEffect = dashboardProjectionEffect(event, payload);
        if (projectionEffect === "FULL_DASHBOARD") renderDashboard();
        return { state: appFSM.state, payload, projectionEffect };
      }
      function swapSlots(sourceSlotId, targetSlotId) {
        const result = dispatchProjectCommand("SLOTS_SWAPPED", { sourceSlotId, targetSlotId });
        if (result.committed) renderDashboard();
        return result.committed;
      }
      function swapSlotContents(source, target) {
        return swapSlots(source?.id, target?.id);
      }
      function clearSlotDragState() {
        slotDragSourceId = null;
        document
          .querySelectorAll("#dashboard .slot.drag-over")
          .forEach((slot) => slot.classList.remove("drag-over"));
      }
      function scheduleSlotDragClickSuppressionRelease() {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (slotDragSourceId === null) slotDragSuppressClick = false;
          });
        });
      }
      function installSlotClickController() {
        let dashboard = $("dashboard");
        if (dashboard.dataset.clickController) return;
        dashboard.dataset.clickController = "true";
        dashboard.addEventListener(
          "click",
          (e) => {
            let el = e.target.closest?.(".slot");
            if (!el) {
              let wasSelected = selectedSlotId !== null;
              debugLog("slotClick:dashboard-background", {
                target: e.target.className?.baseVal || e.target.className || e.target.tagName,
                wasSelected,
              });
              if (wasSelected) setSelectedSlot(null);
              return;
            }
            let slot = slotAt(+el.dataset.slot),
              tab = !!e.target.closest?.(".slot-tab");
            if (!slot) return;
            if (tab && slotDragSuppressClick) {
              e.preventDefault();
              e.stopPropagation();
              if (slotDragSourceId === null) slotDragSuppressClick = false;
              debugLog("slotClick:post-drag-suppressed", { slotId: slot.id });
              return;
            }
            let hasInteractiveContent = !!slot.chart || !!slot.imageId,
              selected = isSlotSelected(slot);
            debugLog("slotClick", {
              slotId: slot.id,
              hasChart: !!slot.chart,
              hasImage: !!slot.imageId,
              tab,
              wasSelected: selected,
              target: e.target.className?.baseVal || e.target.className || e.target.tagName,
            });
            if (!selected || tab || !hasInteractiveContent) {
              e.preventDefault();
              e.stopPropagation();
              setSelectedSlot(slot.id);
            } else debugLog("slotClick:content-pass-through", { slotId: slot.id });
          },
          true,
        );
        dashboard.addEventListener("dragstart", (e) => {
          let tab = e.target.closest?.('.slot-tab[draggable="true"]'),
            el = tab?.closest(".slot"),
            slot = el && slotAt(+el.dataset.slot);
          if (!tab || !slot || slot.hidden || (!slot.chart && !slot.imageId)) {
            e.preventDefault();
            return;
          }
          slotDragSourceId = slot.id;
          slotDragSuppressClick = true;
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", String(slot.id));
          debugLog("slot:drag-start", { slotId: slot.id, row: slot.row, col: slot.col });
        });
        dashboard.addEventListener("dragover", (e) => {
          let el = e.target.closest?.(".slot"),
            target = el && slotAt(+el.dataset.slot);
          if (dataTransferHasFiles(e.dataTransfer)) {
            if (!target || target.hidden) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            dashboard.querySelectorAll(".slot.drag-over").forEach((slot) => {
              if (slot !== el) slot.classList.remove("drag-over");
            });
            el.classList.add("drag-over");
            return;
          }
          let source = slotDragSourceId === null ? null : slotAt(slotDragSourceId);
          if (!source || !target || target.hidden || source === target) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          dashboard.querySelectorAll(".slot.drag-over").forEach((slot) => {
            if (slot !== el) slot.classList.remove("drag-over");
          });
          el.classList.add("drag-over");
        });
        dashboard.addEventListener("dragleave", (e) => {
          let el = e.target.closest?.(".slot");
          if (el && !el.contains(e.relatedTarget)) el.classList.remove("drag-over");
        });
        dashboard.addEventListener("drop", (e) => {
          let el = e.target.closest?.(".slot"),
            target = el && slotAt(+el.dataset.slot);
          if (dataTransferHasFiles(e.dataTransfer)) return;
          let source = slotDragSourceId === null ? null : slotAt(slotDragSourceId);
          if (!source || !target || target.hidden || source === target) {
            clearSlotDragState();
            scheduleSlotDragClickSuppressionRelease();
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          el.classList.remove("drag-over");
          swapSlotContents(source, target);
          clearSlotDragState();
          scheduleSlotDragClickSuppressionRelease();
        });
        dashboard.addEventListener("dragend", () => {
          clearSlotDragState();
          scheduleSlotDragClickSuppressionRelease();
        });
      }
      function setSelectedSlot(slotId = null, direction = "fsm-to-model") {
        debugLog("setSelectedSlot:command", {
          slotId,
          previous: selectedSlotId,
          direction,
        });
        appFSM.send("SELECT_SLOT", { slotId, direction });
        updateGraphView();
        requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      }
      function alphaIdentifier(index, upper = false) {
        let label = "";
        do {
          label = String.fromCharCode((upper ? 65 : 97) + (index % 26)) + label;
          index = Math.floor(index / 26) - 1;
        } while (index >= 0);
        return label;
      }
      function romanIdentifier(index) {
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
      function slotIdentifier(index, project = activeProject) {
        let settings = project.annotations?.labels.settings ?? project.labelSettings;
        if (settings.format === "decimal") return String(index + 1);
        if (settings.format === "lower-roman") return romanIdentifier(index).toLowerCase();
        if (settings.format === "upper-roman") return romanIdentifier(index);
        return alphaIdentifier(index, settings.format === "upper-alpha");
      }
      function displayedSlotIdentifier(index, project = activeProject) {
        let identifier = slotIdentifier(index, project);
        return project.labelSettings.parentheses === true ? `(${identifier})` : identifier;
      }
      function orderedVisibleSlots(project = activeProject) {
        let settings = project.annotations?.labels.settings ?? project.labelSettings;
        return project.slots
          .filter((slot) => !slot.hidden)
          .sort((a, b) =>
            settings.order === "column-major"
              ? a.col - b.col || a.row - b.row
              : a.row - b.row || a.col - b.col,
          );
      }
      function slotLabel(slot, project = activeProject) {
        let index = orderedVisibleSlots(project).findIndex((item) => item.id === slot?.id);
        return slotIdentifier(Math.max(0, index), project);
      }


      function normalizeLegacySlotCaptionDefaults(project = activeProject) {
        orderedVisibleSlots(project).forEach((slot) => {
          if (slot.caption === `${slotLabel(slot, project)} 슬롯 캡션`)
            slot.caption = "슬롯 캡션";
        });
      }

      function orderedSlotLabels(project) {
        let settings = project.annotations.labels.settings;
        return Object.freeze(orderedVisibleSlots(project).map((slot, ordinal) => {
          let identifier = slotIdentifier(ordinal, project);
          return Object.freeze({ slotId: slot.id, ordinal, identifier,
            displayLabel: settings.parentheses ? `(${identifier})` : identifier });
        }));
      }
      function insertSlotCaptions(project, slotIds = null) {
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
      function activeCaptionView(caption=projectObjects.read("captions")) {
        return {
          enabled:caption.enabled,text:caption.text,afterText:caption.afterText,
          sections:[],aggregate:false,label:"",name:caption.name,nameBold:caption.nameBold,
          settings:caption.settings,slot:null,exportText:caption.text,
        };
      }
      function labelStyle() {
        let scale = dashboardGeometry($("dashboard")?.getBoundingClientRect().width).scale;
        return `left:${activeProject.labelSettings.x * scale}px;top:${activeProject.labelSettings.y * scale}px;font-family:${esc(activeProject.labelSettings.fontFamily)};font-size:${activeProject.labelSettings.fontSize * scale}px`;
      }
      function syncDashboardCaption(view = activeCaptionView()) {
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
        let scale = dashboardGeometry($("dashboard")?.getBoundingClientRect().width).scale;
        box.style.fontSize = `${view.settings.fontSize * scale}px`;
        box.style.lineHeight = view.settings.lineHeight;
      }
      function renderDashboard() {
        let renderGeneration = ++dashboardRenderGeneration;
        debugLog("renderDashboard", {
          selectedSlotId,
          charts: activeProject.charts.length,
          slots: activeProject.slots.filter((s) => !s.hidden).length,
        });
        let d = $("dashboard");
        d.style.setProperty("--grid-cols", activeProject.gridCols);
        d.style.setProperty("--grid-rows", activeProject.gridRows);
        applyDashboardZoom(false);
        d.querySelectorAll(".plot-item").forEach((plot) => {
          try {
            Plotly.purge(plot);
          } catch (error) {
            debugLog("plotly:purge-error", {
              slotId: Number(plot.closest(".slot")?.dataset.slot) || null,
              message: error?.message || String(error),
            }, "warn");
          }
        });
        d.innerHTML = "";
        let visibleSlots = activeProject.slots.filter((s) => !s.hidden),
          orderedSlots = orderedVisibleSlots(),
          labelIndexes = new Map(orderedSlots.map((slot, index) => [slot.id, index]));
        visibleSlots.forEach((s, visibleIndex) => {
          let c = s.chart && getChart(s.chart),
            image = slotImage(s),
            imageSettings = normalizeImageSettings(s),
            el = document.createElement("section");
          el.className =
            "slot" +
            (!c && !image ? " empty" : "") +
            (isSlotSelected(s) ? " selected" : "");
          el.dataset.slot = s.id;
          el.style.gridArea = `${s.row} / ${s.col} / span ${s.rowSpan} / span ${s.colSpan}`;
          el.innerHTML =
            c && s.contentType !== "image"
              ? `<div class="chart-card" title="위쪽 손잡이를 눌러 이 슬롯의 그래프 설정을 엽니다."><div id="plot-${s.id}" class="plot-item"></div></div><button class="slot-tab" type="button" draggable="true" aria-label="그래프 슬롯 이동 및 선택"><span class="slot-tab-shape"></span></button>`
              : image
                ? `<div class="slot-image-frame"><img class="slot-image${imageSettings.fit === "manual" ? " manual" : ""}" src="${esc(projectImageDisplayUrl(image))}" alt="${esc(image.name || "슬롯 이미지")}" style="${imageSettings.fit === "manual" ? `width:${imageSettings.scale}%;left:${imageSettings.x}%;top:${imageSettings.y}%;` : `object-fit:${imageSettings.fit};`}"></div><button class="slot-tab" type="button" draggable="true" aria-label="이미지 슬롯 이동 및 선택"><span class="slot-tab-shape"></span></button>`
                : "";
          if (activeProject.labelsEnabled)
            el.insertAdjacentHTML(
              "beforeend",
              `<span class="slot-label" style="${labelStyle()}" aria-label="슬롯 식별자">${displayedSlotIdentifier(labelIndexes.get(s.id) ?? visibleIndex)}</span>`,
            );
          d.append(el);
          if (c && s.contentType !== "image") {
            Promise.resolve()
              .then(() => {
                let plot = el.querySelector(".plot-item");
                if (
                  renderGeneration !== dashboardRenderGeneration ||
                  !plot?.isConnected ||
                  plot !== document.getElementById(`plot-${s.id}`)
                ) return null;
                let figure = chartFigure(
                  c, activeProject._state,
                  dashboardGeometry(d.getBoundingClientRect().width).scale,
                );
                return Promise.resolve(Plotly.react(
                  plot,
                  figure.data,
                  figure.layout,
                  plotlyConfig(c, { ...figure.config, staticPlot: !isSlotSelected(s) }),
                )).then(() => plot);
              })
              .then((plot) => {
                if (
                  !plot?.on ||
                  renderGeneration !== dashboardRenderGeneration ||
                  !plot.isConnected ||
                  plot !== document.getElementById(`plot-${s.id}`)
                ) return;
                let full = plot._fullLayout,
                  axisState = (axis) => ({
                    visible: full?.[axis]?.visible,
                    showline: full?.[axis]?.showline,
                    showticklabels: full?.[axis]?.showticklabels,
                    showgrid: full?.[axis]?.showgrid,
                    zeroline: full?.[axis]?.zeroline,
                    title: full?.[axis]?.title?.text,
                    range: full?.[axis]?.range,
                  });
                debugLog("plotly:axis-layout", {
                  chartId: c.id,
                  xBottom: axisState("xaxis"),
                  xTop: axisState("xaxis2"),
                  yLeft: axisState("yaxis"),
                  yRight: axisState("yaxis2"),
                });
                plot.removeAllListeners?.("plotly_relayout");
                plot.removeAllListeners?.("plotly_doubleclick");
                let syncPlotlyRanges = (event = {}, all = false) =>
                  requestAnimationFrame(() => {
                    if (
                      renderGeneration !== dashboardRenderGeneration ||
                      !plot.isConnected ||
                      plot !== document.getElementById(`plot-${s.id}`)
                    ) return;
                    let settings = normalizeGlobalSettings(c),
                      full = plot._fullLayout,
                      changed = Object.keys(event),
                      copyRange = (plotlyAxis, key) => {
                        let range = full?.[plotlyAxis]?.range;
                        if (!Array.isArray(range) || range.length !== 2) return;
                        let setting = settings.axes[key];
                        setting.min = axisRangeValueFromPlotly(range[0], setting.scaleType);
                        setting.max = axisRangeValueFromPlotly(range[1], setting.scaleType);
                      },
                      axisChanged = (plotlyAxis) =>
                        all ||
                        changed.some(
                          (name) =>
                            name === `${plotlyAxis}.autorange` ||
                            name.startsWith(`${plotlyAxis}.range[`),
                        );
                    [
                      ["xaxis", "xBottom"],
                      ["xaxis2", "xTop"],
                      ["yaxis", "yLeft"],
                      ["yaxis2", "yRight"],
                    ].forEach(([plotlyAxis, key]) => {
                      if (axisChanged(plotlyAxis)) copyRange(plotlyAxis, key);
                    });
                    c.editor.globalSettings = settings;
                    debugLog("plotly:range-sync", { chartId: c.id, event, all, settings });
                  });
                plot.on("plotly_relayout", (event) => {
                  if (!(programmaticPlotlyRelayout.get(plot) > 0))
                    syncPlotlyRanges(event, false);
                });
                plot.on("plotly_doubleclick", () =>
                  setTimeout(() => {
                    if (
                      renderGeneration === dashboardRenderGeneration &&
                      plot.isConnected &&
                      plot === document.getElementById(`plot-${s.id}`)
                    )
                      syncPlotlyRanges({}, true);
                  }, 0),
                );
              })
              .catch((error) => {
                if (renderGeneration !== dashboardRenderGeneration || !el.isConnected)
                  return;
                debugLog("plotly:render-error", {
                  slotId: s.id,
                  chartId: c.id,
                  message: error?.message || String(error),
                });
                status(
                  `그래프 렌더링 오류(슬롯 ${s.row}행 ${s.col}열): ${error?.message || error}`,
                );
              });
          }
        });
        installResizeObserver();
        schedulePlotResize();
        updateFileAvailability();
        syncDashboardCaption();
      }
      function activateChartModel(id) {
        let chart=getChart(id);
        if(!chart){debugLog("chart:activate-missing",{chartId:id});return null;}
        if(chart.editor?.editable!==false)
          for(let object of chart.editor?.objects||[])
            if(!getProjectCsv(object.csvId))
              throw Error("차트가 참조하는 프로젝트 CSV가 없습니다.");
        debugLog("chart:activate",{chartId:id});
        return chart;
      }
      function mergeSlots(slotIds=[]) {
        const result = dispatchProjectCommand("SLOTS_MERGED", { slotIds });
        if (!result.committed) return false;
        renderDashboard();
        return readLayoutApiState();
      }
      function splitSlots(slotIds=[]) {
        const result = dispatchProjectCommand("SLOTS_SPLIT", { slotIds });
        if (!result.committed) return false;
        renderDashboard();
        return readLayoutApiState();
      }
      function createChartModel({ id = null, editor = {}, graph = {} } = {}) {
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
      function validateChartModel(chart, label = "차트", csvCollection = activeProject.csvFiles) {
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
      function plotlyConfig(chart, extra = {}) {
        return {
          ...(chart.graph?.config || {}),
          ...extra,
          responsive: true,
          displaylogo: false,
          doubleClick: "reset",
        };
      }
      function rebuildEditableGraph(chart, project = activeProject._state) {
        chart.graph.data = traces(chart, project);
        chart.graph.layout = layout(chart, project);
        return chart.graph;
      }
      function chartExportCopy(chart) {
        let copy = projectClone(chart);
        return copy;
      }
      function scalePlotlyFigure(figure, scale = 1) {
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
      function chartFigure(chart, project = activeProject._state, scale = 1) {
        let copy = chartExportCopy(chart);
        if (copy.editor.editable === false && copy.graph.imported)
          return scalePlotlyFigure(copy.graph.imported, scale);
        rebuildEditableGraph(copy, project);
        return scalePlotlyFigure(copy.graph, scale);
      }
      function setNestedAxisFromPlotly(target, axis = {}) {
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
      function parsePlotlyToEditor(figure, id) {
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
      function projectClone(value) {
        return JSON.parse(JSON.stringify(value));
      }
      function slotLocalState(slot) {
        normalizeSlotContent(slot);
        return {
          chart: slot.content.chart,
          imageId: slot.content.imageId,
          contentType: slot.content.contentType,
          imageSettings: readImageSettings(slot.content.imageSettings),
          caption: typeof slot.caption === "string" ? slot.caption : null,
        };
      }
      function setSlotLocalState(slot, localState) {
        normalizeSlotContent(slot);
        let next = localState && typeof localState === "object" ? localState : SLOT_LOCAL_DEFAULTS;
        slot.content.chart = Number.isInteger(next.chart) ? next.chart : null;
        slot.content.imageId = Number.isInteger(next.imageId) ? next.imageId : null;
        slot.content.contentType = next.contentType === "image" ? "image" : "graph";
        slot.content.imageSettings = readImageSettings(next.imageSettings);
        slot.caption = typeof next.caption === "string" ? next.caption : null;
        return slot;
      }
      function resetSlotLocalState(slot) {
        return setSlotLocalState(slot, SLOT_LOCAL_DEFAULTS);
      }
      function slotHasNonDefaultLocalState(slot) {
        let local = slotLocalState(slot),
          defaults = SLOT_LOCAL_DEFAULTS;
        return (
          local.chart !== defaults.chart ||
          local.imageId !== defaults.imageId ||
          local.contentType !== defaults.contentType ||
          local.caption !== defaults.caption ||
          local.imageSettings.fit !== defaults.imageSettings.fit ||
          local.imageSettings.scale !== defaults.imageSettings.scale ||
          local.imageSettings.x !== defaults.imageSettings.x ||
          local.imageSettings.y !== defaults.imageSettings.y
        );
      }
      function slotLegacyState(slot) {
        let local = slotLocalState(slot);
        return {
          ...Object.fromEntries(Object.entries(slot).filter(([key]) => key !== "content")),
          chart: local.chart,
          imageId: local.imageId,
          contentType: local.contentType,
          imageSettings: projectClone(local.imageSettings),
          caption: local.caption,
        };
      }
      function normalizeSlotContent(slot) {
        if (!slot || typeof slot !== "object" || Array.isArray(slot)) return slot;
        let sourceContent =
            slot.content && typeof slot.content === "object" && !Array.isArray(slot.content)
              ? slot.content
              : {},
          legacyCaption = Object.prototype.hasOwnProperty.call(slot, "caption")
            ? slot.caption
            : Object.prototype.hasOwnProperty.call(sourceContent, "caption") ? sourceContent.caption : null,
          legacySettings =
            sourceContent.imageSettings && typeof sourceContent.imageSettings === "object"
              ? sourceContent.imageSettings
              : slot.imageSettings && typeof slot.imageSettings === "object"
                ? slot.imageSettings
                : DEFAULT_IMAGE_SETTINGS;
        slot.content = {
          ...sourceContent,
          chart: Number.isInteger(sourceContent.chart)
            ? sourceContent.chart
            : Number.isInteger(slot.chart) ? slot.chart : null,
          imageId: Number.isInteger(sourceContent.imageId)
            ? sourceContent.imageId
            : Number.isInteger(slot.imageId) ? slot.imageId : null,
          contentType:
            (sourceContent.contentType ?? slot.contentType) === "image" ? "image" : "graph",
          imageSettings: readImageSettings(legacySettings),
        };
        delete slot.content.caption;
        slot.caption = legacyCaption;
        Object.defineProperties(slot, {
          chart: {
            configurable: true,
            enumerable: false,
            get() { return this.content.chart; },
            set(value) { this.content.chart = value; },
          },
          imageId: {
            configurable: true,
            enumerable: false,
            get() { return this.content.imageId; },
            set(value) { this.content.imageId = value; },
          },
          contentType: {
            configurable: true,
            enumerable: false,
            get() { return this.content.contentType; },
            set(value) { this.content.contentType = value; },
          },
          imageSettings: {
            configurable: true,
            enumerable: false,
            get() { return this.content.imageSettings; },
            set(value) { this.content.imageSettings = value; },
          },
          toJSON: {
            configurable: true,
            enumerable: false,
            value() { return slotLegacyState(this); },
          },
        });
        return slot;
      }
      function normalizeSlotContents(slots) {
        if (!Array.isArray(slots)) return slots;
        slots.forEach(normalizeSlotContent);
        return slots;
      }
      function projectColor(value, fallback) {
        return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : fallback;
      }
      function validateProjectObjectState(state, { requireSlots = false } = {}) {
        let record=(value)=>!!value&&typeof value==="object"&&!Array.isArray(value);
        if(!record(state)||state.kind!=="fast-figure-project-object"||!record(state.meta)||
          !record(state.layout)||!record(state.layout.slotStyle)||!record(state.annotations?.labels)||
          !record(state.annotations?.labels?.settings)||!record(state.annotations?.captions)||
          !record(state.annotations?.captions?.settings)||!record(state.assets)||
          !record(state.fileSystem)||!record(state.nextId)||!record(state.appearance)||
          !record(state.appearance.uiPalette)||!record(state.export))
          throw Error("프로젝트 오브젝트 구조가 올바르지 않습니다.");
        if(typeof state.meta.projectName!=="string"||typeof state.meta.appBuild!=="string"||
          !Number.isInteger(state.layout.gridRows)||!Number.isInteger(state.layout.gridCols)||
          state.layout.gridRows<1||state.layout.gridRows>8||state.layout.gridCols<1||state.layout.gridCols>8||
          typeof state.annotations.labels.enabled!=="boolean"||
          typeof state.annotations.captions.enabled!=="boolean"||
          typeof state.annotations.captions.text!=="string"||
          typeof state.annotations.captions.afterText!=="string"||
          typeof state.annotations.captions.name!=="string"||
          typeof state.annotations.captions.nameBold!=="boolean")
          throw Error("프로젝트 메타데이터 또는 레이아웃이 올바르지 않습니다.");
        let style=state.layout.slotStyle;
        for(let [key,min,max] of [["referenceWidth",100,20000],["gap",0,2000],["outerMargin",0,5000],
          ["radius",0,2000],["aspect",0.1,10]])
          if(!Number.isFinite(style[key])||style[key]<min||style[key]>max)
            throw Error(`프로젝트 슬롯 스타일 ${key}가 올바르지 않습니다.`);
        if(typeof style.showBorders!=="boolean")throw Error("프로젝트 슬롯 외곽선 설정이 올바르지 않습니다.");
        let labelSettings=state.annotations.labels.settings;
        if(!Number.isFinite(labelSettings.x)||!Number.isFinite(labelSettings.y)||
          !Number.isFinite(labelSettings.fontSize)||labelSettings.fontSize<6)
          throw Error("프로젝트 레이블 위치 또는 크기가 올바르지 않습니다.");
        let output=state.export, explicit=output.heightMode==="explicit";
        if(!Number.isFinite(output.width)||output.width<100||output.width>20000||
          !["auto","explicit"].includes(output.heightMode)||
          (explicit&&(!Number.isFinite(output.height)||output.height<100||output.height>20000))||
          !Number.isFinite(output.dpi)||output.dpi<36||output.dpi>1200||
          !["png","jpeg"].includes(output.format))
          throw Error("프로젝트 출력 설정이 올바르지 않습니다.");
        for(let key of Object.keys(DEFAULT_UI_PALETTE))
          if(projectColor(state.appearance.uiPalette[key],null)===null)
            throw Error(`프로젝트 UI 색상 ${key}가 올바르지 않습니다.`);
        if(!Array.isArray(state.assets.csvFiles)||!Array.isArray(state.assets.images)||
          !Array.isArray(state.fileSystem.directories)||!Array.isArray(state.charts)||
          !Array.isArray(state.slots)||(requireSlots&&state.slots.length===0))
          throw Error("프로젝트 자산, 차트 또는 슬롯 목록이 올바르지 않습니다.");
        let filePaths=new Set(),directoryPaths=new Set();
        state.fileSystem.directories.forEach(path=>{
          let normalized=normalizeProjectPath(path,{directory:true});
          if(normalized==="/"||normalized!==path||directoryPaths.has(path))
            throw Error("프로젝트 폴더 경로가 올바르지 않습니다.");
          directoryPaths.add(path);
        });
        for(let required of ["/assets","/assets/csv","/assets/images","/assets/trash"])
          if(!directoryPaths.has(required))throw Error(`프로젝트 기본 폴더 ${required}가 없습니다.`);
        let csvIds=new Set();
        state.assets.csvFiles.forEach(csv=>{
          let path;try{path=projectAssetPath(csv)}catch(_){throw Error("프로젝트 CSV 오브젝트가 올바르지 않습니다.")}
          if(!record(csv)||!Number.isInteger(csv.id)||csv.id<1||csvIds.has(csv.id)||
            typeof csv.name!=="string"||typeof csv.directory!=="string"||!Array.isArray(csv.rows)||
            typeof csv.bytesBase64!=="string"||!csv.bytesBase64||
            normalizeProjectPath(csv.directory,{directory:true})!==csv.directory||
            filePaths.has(path)||!directoryPaths.has(csv.directory))
            throw Error("프로젝트 CSV 오브젝트가 올바르지 않습니다.");
          csvIds.add(csv.id);filePaths.add(path);
        });
        let imageIds=new Set();
        state.assets.images.forEach(image=>{
          let path;try{path=projectAssetPath(image)}catch(_){throw Error("프로젝트 이미지 오브젝트가 올바르지 않습니다.")}
          if(!record(image)||!Number.isInteger(image.id)||image.id<1||imageIds.has(image.id)||
            typeof image.name!=="string"||typeof image.directory!=="string"||
            typeof image.bytesBase64!=="string"||!image.bytesBase64||
            normalizeProjectPath(image.directory,{directory:true})!==image.directory||
            filePaths.has(path)||!directoryPaths.has(image.directory))
            throw Error("프로젝트 이미지 오브젝트가 올바르지 않습니다.");
          imageIds.add(image.id);filePaths.add(path);
        });
        let chartIds=new Set();
        state.charts.forEach((chart,index)=>{
          if(!Number.isInteger(chart?.id)||chart.id<1||chartIds.has(chart.id))
            throw Error("프로젝트 차트 ID가 올바르지 않습니다.");
          chartIds.add(chart.id);validateChartModel(chart,`프로젝트 차트 ${index+1}`,state.assets.csvFiles);
        });
        normalizeSlotContents(state.slots);
        let slotIds=new Set(),owners=new Map([...chartIds].map(id=>[id,0]));
        state.slots.forEach(slot=>{
          if(!record(slot)||!Number.isInteger(slot.id)||slotIds.has(slot.id)||
            !Number.isInteger(slot.row)||!Number.isInteger(slot.col)||
            !Number.isInteger(slot.rowSpan)||!Number.isInteger(slot.colSpan)||
            slot.row<1||slot.col<1||slot.rowSpan<1||slot.colSpan<1||
            slot.row+slot.rowSpan-1>state.layout.gridRows||
            slot.col+slot.colSpan-1>state.layout.gridCols||
            !["graph","image"].includes(slot.contentType)||
            (slot.chart!=null&&slot.imageId!=null)||
            (slot.chart!=null&&!chartIds.has(slot.chart))||
            (slot.imageId!=null&&!imageIds.has(slot.imageId))||
            !(slot.caption===null||typeof slot.caption==="string"))
            throw Error("프로젝트 슬롯 오브젝트가 올바르지 않습니다.");
          slot.content.imageSettings=readImageSettings(slot.content.imageSettings);
          if(slot.chart!=null)owners.set(slot.chart,owners.get(slot.chart)+1);
          slotIds.add(slot.id);
        });
        for(let [chartId,count] of owners)
          if(count!==1)throw Error(`프로젝트 차트 ${chartId}의 슬롯 소유권이 올바르지 않습니다.`);
        let maximums={csv:Math.max(0,...csvIds),image:Math.max(0,...imageIds),chart:Math.max(0,...chartIds)};
        for(let key of ["csv","image","chart"])
          if(!Number.isInteger(state.nextId[key])||state.nextId[key]<=maximums[key])
            throw Error(`프로젝트 ${key} ID 시퀀스가 올바르지 않습니다.`);
        return state;
      }
      function validateProjectObject(project, options = {}) {
        if (!(project instanceof ProjectObject))
          throw Error("ProjectObject 인스턴스가 아닙니다.");
        validateProjectObjectState(project._state, options);
        return project;
      }
      function importedProjectCsvState(payload) {
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
      function importedProjectImageState(payload) {
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
      function readProjectNumber(value, fallback, min, max) {
        let number = Number(value);
        return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
      }
      function readFiniteProjectNumber(value, fallback) {
        let number = Number(value);
        return Number.isFinite(number) ? number : fallback;
      }
      function buildProjectObject(payload,fileName) {
        if(payload?.schema!=="fast-figure-project"||payload.version!==PACKAGE_FORMAT_VERSION)
          throw Error("지원하지 않는 FFPX 프로젝트 형식입니다.");
        let candidate=new ProjectObject();
        candidate.projectName=typeof payload.projectName==="string"?payload.projectName.trim().slice(0,120):"";
        if(!candidate.projectName)
          candidate.projectName=String(fileName||"").replace(/\.[^.]+$/,"").trim().slice(0,120);
        let rows=Number(payload.gridRows),cols=Number(payload.gridCols);
        if(!Number.isInteger(rows)||!Number.isInteger(cols)||rows<1||rows>8||cols<1||cols>8)
          throw Error("프로젝트의 행 또는 열 값이 올바르지 않습니다.");
        if(!Array.isArray(payload.charts)||!Array.isArray(payload.slots))
          throw Error("프로젝트의 charts 또는 slots 배열이 없습니다.");
        let csvState=importedProjectCsvState(payload),imageState=importedProjectImageState(payload),
          charts=projectClone(payload.charts),chartIds=new Set();
        charts.forEach((chart,index)=>{
          validateChartModel(chart,`프로젝트 차트 ${index+1}`,csvState.csvFiles);
          if(!Number.isInteger(chart.id)||chartIds.has(chart.id))throw Error("프로젝트 차트 ID가 올바르지 않습니다.");
          chartIds.add(chart.id);normalizeGlobalSettings(chart,true);
        });
        let slotIds=new Set(),slots=projectClone(payload.slots).map(raw=>{
          if(!raw||typeof raw!=="object"||!Number.isInteger(raw.id)||slotIds.has(raw.id))
            throw Error("프로젝트 슬롯 데이터가 올바르지 않습니다.");
          slotIds.add(raw.id);
          let row=Number(raw.row),col=Number(raw.col),rowSpan=Number(raw.rowSpan??1),colSpan=Number(raw.colSpan??1);
          if(!Number.isInteger(row)||!Number.isInteger(col)||!Number.isInteger(rowSpan)||!Number.isInteger(colSpan)||
            row<1||col<1||rowSpan<1||colSpan<1||row+rowSpan-1>rows||col+colSpan-1>cols)
            throw Error("프로젝트 슬롯 위치가 올바르지 않습니다.");
          let chart=raw.chart==null?null:(chartIds.has(raw.chart)?raw.chart:null),
            imageId=raw.imageId==null?null:(getProjectImage(raw.imageId,imageState.images)?.id??null);
          if(raw.chart!=null&&chart===null)throw Error("프로젝트 슬롯이 존재하지 않는 차트를 참조합니다.");
          if(raw.imageId!=null&&imageId===null)throw Error("프로젝트 슬롯이 존재하지 않는 이미지를 참조합니다.");
          return normalizeSlotContent({
            id:raw.id,row,col,rowSpan,colSpan,hidden:raw.hidden===true,
            content:{
              chart,imageId,
              contentType:raw.contentType==="image"?"image":"graph",
              imageSettings:readImageSettings(raw.imageSettings||raw.content?.imageSettings),
            },
            caption:typeof raw.caption==="string"&&raw.caption?raw.caption:null,
          });
        });
        if(!slots.length)throw Error("프로젝트 슬롯이 없습니다.");
        candidate.gridRows=rows;candidate.gridCols=cols;
        candidate.csvFiles=csvState.csvFiles;candidate.images=imageState.images;
        candidate.charts=charts;candidate.slots=slots;
        candidate.fileSystem={directories:Array.isArray(payload.fileSystem?.directories)?projectClone(payload.fileSystem.directories):[]};
        projectVfs.ensure(candidate._state);
        candidate.csvId=Math.max(Number.isInteger(payload.csvId)?payload.csvId:1,csvState.csvId);
        candidate.imageId=Math.max(Number.isInteger(payload.imageId)?payload.imageId:1,imageState.imageId);
        candidate.chartId=Math.max(Number.isInteger(payload.chartId)?payload.chartId:1,1,...charts.map(chart=>chart.id+1));
        let annotations=payload.annotations&&typeof payload.annotations==="object"?payload.annotations:{},
          labelPatch=annotations.labelSettings&&typeof annotations.labelSettings==="object"?annotations.labelSettings:{},
          captionPatch=annotations.captionSettings&&typeof annotations.captionSettings==="object"?annotations.captionSettings:{};
        candidate.labelsEnabled=annotations.labelsEnabled===true;
        candidate.labelSettings={...candidate.labelSettings,...labelPatch,
          parentheses:labelPatch.parentheses===true,
          x:readFiniteProjectNumber(labelPatch.x,candidate.labelSettings.x),
          y:readFiniteProjectNumber(labelPatch.y,candidate.labelSettings.y),
          fontSize:Math.max(6,readFiniteProjectNumber(labelPatch.fontSize,candidate.labelSettings.fontSize))};
        candidate.captionsEnabled=annotations.captionsEnabled===true;
        candidate.captionText=typeof annotations.captionText==="string"?annotations.captionText:"";
        candidate.captionAfterText=typeof annotations.captionAfterText==="string"?annotations.captionAfterText:"";
        candidate.captionName=typeof annotations.captionName==="string"?annotations.captionName:"";
        candidate.captionNameBold=annotations.captionNameBold===true;
        candidate.captionSettings={...candidate.captionSettings,...captionPatch,
          fontSize:readProjectNumber(captionPatch.fontSize,candidate.captionSettings.fontSize,6,96),
          lineHeight:readProjectNumber(captionPatch.lineHeight,candidate.captionSettings.lineHeight,0.8,4)};
        let style=payload.slotStyle&&typeof payload.slotStyle==="object"?payload.slotStyle:{},
          palette=payload.uiPalette&&typeof payload.uiPalette==="object"?payload.uiPalette:{},
          output=payload.export&&typeof payload.export==="object"?payload.export:{};
        candidate.layout.slotStyle={
          referenceWidth:readProjectNumber(style.referenceWidth,1200,100,20000),
          gap:readProjectNumber(style.gap,0,0,2000),
          outerMargin:readProjectNumber(
            style.outerMargin,
            DEFAULT_SLOT_STYLE.outerMargin,
            0,
            5000,
          ),
          radius:readProjectNumber(style.radius,0,0,2000),
          aspect:readProjectNumber(style.aspect,1.618,0.1,10),
          showBorders:style.showBorders!==false};
        candidate.appearance.uiPalette=Object.fromEntries(Object.entries(DEFAULT_UI_PALETTE)
          .map(([key,fallback])=>[key,projectColor(palette[key],fallback)]));
        let heightMode=output.heightMode==="explicit"?"explicit":"auto";
        candidate.exportSettings={
          width:readProjectNumber(output.width,candidate.layout.slotStyle.referenceWidth,100,20000),
          heightMode,
          height:heightMode==="explicit"?readProjectNumber(output.height,100,100,20000):null,
          dpi:readProjectNumber(output.dpi,300,36,1200),
          format:output.format==="jpeg"?"jpeg":"png"};
        validateProjectObject(candidate,{requireSlots:true});
        return candidate;
      }
      function renderProjectObject(project = activeProject) {
        applySlotStyle(false, false);
        applyCurrentUiPalette(false);
        syncDashboardCaption();
        updateFileAvailability();
      }
      function applyProjectLoadedAction({ machine, payload }) {
        for (const scope of projectObjects.names()) machine.assertWritable(scope, "PROJECT_LOADED");
        while (true) {
          const source = activeProject._state, file = payload.file;
          if (!file || !(file.bytes instanceof Uint8Array)) throw Error("불러올 copied FFPX bytes가 없습니다.");
          const candidate = buildProjectObject(ffpxReadProjectBytes(new Uint8Array(file.bytes)), file.name)._state;
          validateProjectObjectState(candidate, { requireSlots: true });
          if (activeProject._state !== source) continue;
          activeProject.initialize(candidate);
          projectObjectGeneration += 1;
          const changedIds = (before, after) => [...new Set([...before, ...after].map(item => item.id))]
            .filter(id => JSON.stringify(before.find(item => item.id === id) && { ...before.find(item => item.id === id) }) !==
              JSON.stringify(after.find(item => item.id === id) && { ...after.find(item => item.id === id) }));
          payload.changed = { slotIds: changedIds(source.slots, candidate.slots),
            chartIds: changedIds(source.charts, candidate.charts),
            csvIds: changedIds(source.assets.csvFiles, candidate.assets.csvFiles),
            imageIds: changedIds(source.assets.images, candidate.assets.images), assets: [] };
          payload.generation = projectObjectGeneration;
          payload.selectionHints = Object.freeze({ resetInterfaceSelection: true });
          releaseProjectImageDisplayUrls(source.assets.images);
          return;
        }
      }
      function importProjectFile(file) {
        return appFSM.run("importing", "project.importFile", async () => {
          const [copied] = await prepareCopiedImportFiles([file]),
            result = dispatchProjectCommand("PROJECT_LOADED", { file: copied });
          if (!result.committed) return result;
          const snapshot = appFSM.query("export", {});
          renderProjectObject(); renderDashboard();
          appFSM.send("CLOSE_OVERLAY", { reason: "project-loaded" });
          status(`${file.name} 프로젝트를 불러왔습니다.`);
          return snapshot;
        });
      }
      function ffpxBytesToBase64(bytes) {
        let text = "",
          step = 0x8000;
        for (let i = 0; i < bytes.length; i += step)
          text += String.fromCharCode(...bytes.subarray(i, i + step));
        return btoa(text);
      }
      function ffpxBase64ToBytes(value) {
        let text = atob(value),
          bytes = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
        return bytes;
      }
      function ffpxConcat(parts, total) {
        let result = new Uint8Array(total),
          offset = 0;
        for (let part of parts) {
          result.set(part, offset);
          offset += part.length;
        }
        return result;
      }
      let ffpxCrcTable = null;
      function ffpxCrc32(bytes) {
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
      function ffpxZipStore(entries) {
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
      function ffpxZipRead(bytes) {
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
        if (count > 10000 || offset + centralSize > end)
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
            view.getUint32(localOffset, true) !== 0x04034b50
          )
            throw Error("FFPX 자산 경로가 올바르지 않습니다.");
          let localNameLength = view.getUint16(localOffset + 26, true),
            localExtraLength = view.getUint16(localOffset + 28, true),
            start = localOffset + 30 + localNameLength + localExtraLength;
          if (start + size > bytes.length) throw Error("FFPX 자산 범위를 벗어났습니다.");
          let data = bytes.slice(start, start + size);
          if (ffpxCrc32(data) !== crc) throw Error("FFPX 자산 CRC 검증에 실패했습니다.");
          assets.set(name, data);
          cursor = next;
        }
        return assets;
      }
      function serializeNewDataTable(rows, path) {
        const extension = String(path).toLowerCase();
        if (extension.endsWith(".json")) return new TextEncoder().encode(JSON.stringify(rows));
        const delimiter = extension.endsWith(".tsv") ? "\t" : ",",
          cell = value => {
            const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
            return text.includes(delimiter) || /["\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
          };
        return new TextEncoder().encode(rows.map(row => row.map(cell).join(delimiter)).join("\n"));
      }
      function parseProjectCsvAsset(name, bytes) {
        let text = new TextDecoder().decode(bytes);
        if (String(name).toLowerCase().endsWith(".json")) {
          let data = JSON.parse(text);
          if (!Array.isArray(data) && Array.isArray(data?.data)) data = data.data;
          return dataTable(data);
        }
        const extension = /\.[^./]+$/.exec(String(name))?.[0]?.toLowerCase();
        if (![".csv", ".tsv"].includes(extension)) throw Error("지원하는 데이터 확장자가 아닙니다.");
        return dataTable(parseCSV(text, extension === ".tsv" ? "\t" : ","));
      }
      function projectCsvDataRef(csv) {
        const extension = /\.[^./]+$/.exec(csv.path || "")?.[0]?.toLowerCase();
        return `data/csv-${csv.id}${[".json", ".tsv", ".csv"].includes(extension) ? extension : ".csv"}`;
      }
      function ffpxDataUrlBytes(url) {
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
      function ffpxMimeExtension(mime) {
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
      function ffpxXmlEscape(value) {
        return String(value)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&apos;");
      }
      function ffpxXmlValue(value) {
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
      function ffpxXmlReadValue(element) {
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
      function ffpxXmlDocument(root, version, children) {
        return `<?xml version="1.0" encoding="UTF-8"?><${root} version="${version}">${children}</${root}>`;
      }
      function ffpxReadXmlDocument(assets, name, root) {
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
      function ffpxDirectChild(root, name, optional = false) {
        const nodes = [...root.children].filter((child) => child.tagName === name);
        if (nodes.length === 0 && optional) return null;
        if (nodes.length !== 1) throw Error(`FFPX ${name} 단일 요소가 필요합니다.`);
        return nodes[0];
      }
      function ffpxWrappedValue(node) {
        const children = [...node.children];
        if (children.length !== 1 || children[0].tagName !== "value" ||
            [...node.childNodes].some((child) => (child.nodeType === 3 || child.nodeType === 4) && child.textContent.trim()))
          throw Error("FFPX 단일 typed value가 필요합니다.");
        return ffpxXmlReadValue(children[0]);
      }
      function ffpxNamedValue(root, name) {
        return ffpxWrappedValue(ffpxDirectChild(root, name));
      }
      function ffpxDeriveHiddenSlots(slotList) {
        let byCell = new Map(
          slotList.map((slot) => [`${Number(slot.row)},${Number(slot.col)}`, slot]),
        );
        slotList.forEach((slot) => {
          slot.hidden = false;
        });
        for (let anchor of slotList) {
          let rowSpan = Number(anchor.rowSpan) || 1,
            colSpan = Number(anchor.colSpan) || 1;
          if (rowSpan === 1 && colSpan === 1) continue;
          for (let row = Number(anchor.row); row < Number(anchor.row) + rowSpan; row++)
            for (let col = Number(anchor.col); col < Number(anchor.col) + colSpan; col++) {
              if (row === Number(anchor.row) && col === Number(anchor.col)) continue;
              let covered = byCell.get(`${row},${col}`);
              if (!covered) throw Error("FFPX 병합 영역에 대응하는 슬롯이 없습니다.");
              if (covered.chart != null || covered.imageId != null)
                throw Error("FFPX 병합 영역의 가려진 슬롯은 비어 있어야 합니다.");
              covered.hidden = true;
            }
        }
        return slotList;
      }
      function ffpxBuildProject(source = activeProject._state) {
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
      async function ffpxReadProject(file) {
        return ffpxReadProjectBytes(new Uint8Array(await file.arrayBuffer()));
      }
      function ffpxReadProjectBytes(bytes) {
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
          debugLog("project:read-version", {
            format: "FFPX",
            appBuild: typeof project?.appBuild === "string" ? project.appBuild : null,
          });
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
              imageSettings: readImageSettings(imageObject?.settings),
              caption:
                typeof slotCaption?.text === "string" ? slotCaption.text : null,
            });
          }
          ffpxDeriveHiddenSlots(slots);
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
        return payload;
      }
      function projectFileStem(value) {
        let stem = String(value || "")
          .trim()
          .replace(/[\\/:*?"<>|\x00-\x1F]/g, "-")
          .replace(/\s+/g, " ")
          .replace(/[. ]+$/, "")
          .slice(0, 100);
        return stem || "fast-figure-project";
      }
      function downloadProject() {
        return appFSM.run("exporting", "project.exportFile", async () => {
          if (interfaceFSM.readState().selectedSlotId !== null) {
            status("프로젝트 내보내기는 슬롯 선택을 해제한 뒤 사용할 수 있습니다.");
            return;
          }
          const payload = appFSM.query("export", {
            operation: "project.exportFile", stamp: new Date().toISOString().replace(/[:.]/g, "-"),
          });
          await downloadExportPayload(payload);
        });
      }
      function downloadProjectAsset(path) {
        return appFSM.run("exporting", "assets.download", async () => {
          const target = path === undefined ? interfaceFSM.readState().assetPath : path,
            payload = appFSM.query("export", { operation: "assets.download", path: target });
          if (payload === null) return false;
          await downloadExportPayload(payload);
          return true;
        });
      }
      function selectDirectoryFromTree(path) {
        let match = projectVfs.resolve(path);
        if (match?.kind !== "directory") return status("프로젝트 폴더를 선택할 수 없습니다.");
        appFSM.send("SELECT_ASSET", {
          kind: "directory",
          path: match.path,
          direction: "ui-to-fsm",
        });
        status(`${match.path} 폴더를 선택했습니다.`);
      }
      function selectProjectCsv(path) {
        const resolved = appFSM.query("project-api", { operation: "assets.readDeletionTarget", path });
        if (resolved?.kind !== "csv") return null;
        const priorRevision = interfaceFSM.readState().revision, state = appFSM.send("SELECT_ASSET", {
          kind: "csv", path: resolved.path, direction: "ui-to-fsm",
        });
        return state.revision > priorRevision && state.assetSelection === "csv" && state.assetPath === resolved.path
          ? resolved.target : null;
      }
      function selectImageFromTree(path) {
        let slot = getSelectedSlot(),
          match = projectVfs.resolve(path),
          image = match?.kind === "image" ? match.asset : null;
        if (!image) return status("프로젝트 이미지를 먼저 선택하세요.");
        appFSM.send("CLEAR_GRAPH_OBJECT", {
          index: null,
          direction: "ui-to-fsm",
        });
        appFSM.send("SELECT_ASSET", {
          kind: "image",
          path: projectAssetPath(image),
          direction: "ui-to-fsm",
        });
        updateFileAvailability();
        if (!slot) {
          status(`${image.name}을 선택했습니다.`);
          return;
        }
        status(`${image.name}을 선택했습니다. 이미지 슬롯의 추가 버튼이나 드롭으로 연결할 수 있습니다.`);
      }
      function insertEmptyImageIntoSelectedSlot() {
        const slotId = interfaceFSM.readState().selectedSlotId,
          context = appFSM.query("slot-selection-context", { slotId });
        if (!context || context.contentType !== "image") return null;
        const imageInput = { bytes: new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"></svg>'),
          name: "빈 이미지.svg", mime: "image/svg+xml" },
          result = dispatchProjectCommand("SLOT_IMAGE_IMPORTED", { slotId, operation: "images.insertEmpty", imageInput });
        if (!result.committed) return null;
        const path = result.changed.assets.find(asset => asset.role === "created" && asset.kind === "image").path,
          target = appFSM.query("project-api", { operation: "assets.readDeletionTarget", path }).target;
        renderDashboard();
        return target;
      }
      function setSlotContentType(slotId, contentType) {
        const result = dispatchProjectCommand("SLOT_TYPE_CHANGED", { slotId, contentType });
        if (result.committed) renderDashboard();
        return null;
      }
      function syncSlotImageElement(projectProjection) {
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
      function applyImageSettingsFromValues(slotId, values={}) {
        if (!appFSM.query("project-api", { operation: "images.readEditor", slotId })) return false;
        let result=dispatchProjectCommand("SLOT_IMAGE_SETTINGS_CHANGED", { slotId, settings: values });
        if (!result.committed) return false;
        // Reconciliation has finished; the renderer receives only a fresh read projection.
        syncSlotImageElement(appFSM.query("renderer", { operation: "slot-image", slotId }));
        appFSM.notify("images","IMAGE_SETTINGS_CHANGED");
        return appFSM.query("project-api", { operation: "images.readEditor", slotId });
      }
      function readSelectedSlotApi() {
        let slot = getSelectedSlot();
        return slot ? Object.freeze({
          id: slot.id, row: slot.row, col: slot.col,
          contentType: slot.contentType, chart: slot.chart, imageId: slot.imageId,
        }) : null;
      }
      function resetSlotApi(slotId) {
        const result = dispatchProjectCommand("SLOTS_RESET", { slotIds: [slotId] });
        if (result.committed) renderDashboard();
        return null;
      }
      function prepareDashboardFileDrop(slotId) {
        const context = appFSM.query("slot-selection-context", { slotId });
        if (!context) return false;
        if (interfaceFSM.readState().selectedSlotId === slotId) return true;
        appFSM.send("SELECT_SLOT", { slotId, direction: "model-to-fsm" });
        if (interfaceFSM.readState().selectedSlotId !== slotId) return false;
        renderDashboard();
        return true;
      }
      function finishDashboardFileDrop() {
        clearSlotDragState();
        return null;
      }
      function readImageEditorApi() {
        return appFSM.query("project-api", {
          operation: "images.readEditor", slotId: appFSM.readState().selectedSlotId,
        });
      }
      function setProjectName(value, trim = false) {
        const result = dispatchProjectCommand("PROJECT_NAME_CHANGED", { value, trim });
        if (!result.committed) return null;
        return appFSM.query("project-api", { operation: "project.readName" });
      }
      function slotFileKind(file) {
        let name = String(file?.name || "").toLowerCase(),
          type = String(file?.type || "").toLowerCase();
        if (name.endsWith(".ffsx")) return "slot";
        if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".json")) return "data";
        if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name))
          return "image";
        return "";
      }
      function dataTransferHasFiles(dataTransfer) {
        return Array.from(dataTransfer?.types || []).includes("Files");
      }
      function baseGraphObject(chart, csv = selectedProjectCsv()) {
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
      function normalizedGraphObjects(chart) {
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
      function ensureGraphObjects(chart) {
        if (!chart) return [];
        chart.editor = chart.editor || {};
        chart.editor.objects = normalizedGraphObjects(chart);
        return chart.editor.objects;
      }
      function graphEditorChart() {
        let slot = getSelectedSlot();
        return slot?.chart ? getChart(slot.chart) : null;
      }
      function graphEditorCommit(objects,index=null) {
        let chart=graphEditorChart();
        if(!chart)return null;
        if(chart.editor?.editable===false){
          status("원본 JSON 그래프는 편집 가능 상태로 전환한 뒤 변경할 수 있습니다.");
          return null;
        }
        let payload={chartId:chart.id,objects:[...objects],index,direction:"fsm-to-model"};
        appFSM.send("GRAPH_OBJECTS_REPLACED",payload);
        chart=payload.chart;
        let selected=Number.isInteger(index)&&index>=0&&index<chart.editor.objects.length?index:null;
        appFSM.send(selected===null?"CLEAR_GRAPH_OBJECT":"SELECT_GRAPH_OBJECT",
          {index:selected,direction:"fsm-to-model"});
        renderDashboard(); updateFileAvailability();
        appFSM.notify("charts","GRAPH_OBJECTS_CHANGED");
        return chart;
      }
      function graphEditorSelectCsv(csvId) {
        let csv = getProjectCsv(Number(csvId));
        if (!csv) return null;
        appFSM.send("CLEAR_GRAPH_OBJECT", { index: null, direction: "ui-to-fsm" });
        appFSM.send("SELECT_ASSET", { kind: "csv", path: projectAssetPath(csv), direction: "ui-to-fsm" });
        appFSM.notify("data", "CSV_SELECTION_CHANGED");
        return csv;
      }
      function createEmptyProjectCsvAndSelect() {
        const csv = createEmptyProjectCsv();
        if (csv?.committed === false) return csv;
        return selectProjectCsv(projectAssetPath(csv));
      }
      function graphEditorSelectObject(index) {
        let input = validateFrontendIntent("SELECT_GRAPH_OBJECT", { index, selectedSlotId, selectAsset: true });
        if (!input.accepted) return null;
        appFSM.send("SELECT_GRAPH_OBJECT", { index: input.reference, selectAsset: true, direction: "fsm-to-model" });
        appFSM.notify("charts", "GRAPH_OBJECT_SELECTION_CHANGED");
        return input.reference;
      }
      function graphEditorObjectValues(chartId, index, values = {}) {
        const result = dispatchProjectCommand("GRAPH_OBJECTS_REPLACED", {
          chartId, operation: "graphs.setObjectValues", index, values,
        });
        if (!result.committed) return result;
        const chart = appFSM.query("project-api", { operation: "graphs.readData", chartId }).chart;
        renderDashboard();
        return chart;
      }
      function setGraphObjectValuesApi(index, values = {}) {
        const context = appFSM.query("project-api", {
          operation: "graphs.readData", frontendState: interfaceFSM.readState(),
        });
        return graphEditorObjectValues(context.chart?.id ?? null, index, values);
      }
      function graphEditorAdd(slotId, csvId) {
        const slot = appFSM.query("project-api", { operation: "slots.readSelected", frontendState: { selectedSlotId: slotId } }),
          event = slot?.chart == null ? "SLOT_DATA_CONNECTED" : "GRAPH_OBJECTS_REPLACED",
          result = dispatchProjectCommand(event, { slotId, csvId, operation: "graphs.addObject" });
        if (!result.committed) return result;
        const chart = appFSM.query("project-api", { operation: "graphs.readData", frontendState: { selectedSlotId: slotId } }).chart;
        renderDashboard();
        return chart;
      }
      function addGraphObjectApi(csvId) {
        const state = interfaceFSM.readState();
        if (csvId === undefined) csvId = appFSM.query("project-api", {
          operation: "graphs.readData", frontendState: state,
        }).currentCsv?.id;
        return graphEditorAdd(state.selectedSlotId, csvId);
      }
      function graphEditorMove(chartId, from, to) {
        const context = appFSM.query("project-api", { operation: "graphs.readData", chartId });
        if (from === to && context.chart?.editor.editable !== false && Number.isInteger(from) &&
            from >= 0 && from < context.objects.length) return context.chart;
        const result = dispatchProjectCommand("GRAPH_OBJECTS_REPLACED", {
          chartId, operation: "graphs.moveObject", from, to,
        });
        if (!result.committed) return result;
        const chart = appFSM.query("project-api", { operation: "graphs.readData", chartId }).chart;
        renderDashboard();
        return chart;
      }
      function graphEditorDelete(chartId, index) {
        const result = dispatchProjectCommand("GRAPH_OBJECTS_REPLACED", {
          chartId, operation: "graphs.deleteObject", index,
        });
        if (!result.committed) return result;
        const chart = appFSM.query("project-api", { operation: "graphs.readData", chartId }).chart;
        renderDashboard();
        return chart;
      }
      function moveGraphObjectApi(from, to) {
        const context = appFSM.query("project-api", {
          operation: "graphs.readData", frontendState: interfaceFSM.readState(),
        });
        return graphEditorMove(context.chart?.id ?? null, from, to);
      }
      function deleteGraphObjectApi(index) {
        const context = appFSM.query("project-api", {
          operation: "graphs.readData", frontendState: interfaceFSM.readState(),
        });
        return graphEditorDelete(context.chart?.id ?? null, index);
      }
      function graphEditorHeaderLines(csvId, value) {
        const result = dispatchProjectCommand("DATA_OBJECT_REPLACED", { csvId, headerLines: value });
        if (!result.committed) return result;
        const updated = result.changed.assets.find((asset) => asset.kind === "csv" && asset.role === "updated"),
          read = appFSM.query("project-api", { operation: "assets.readDeletionTarget", path: updated.path });
        renderDashboard();
        return read.target.headerLines;
      }
      function graphEditorSetEditable(slotId, chartId, editable) {
        const result = dispatchProjectCommand("CHART_MODEL_REPLACED", { slotId, chartId, editable });
        if (!result.committed) return result;
        const chart = appFSM.query("project-api", { operation: "graphs.readData", chartId }).chart;
        renderDashboard();
        return chart.editor.editable;
      }
      function setGraphEditableApi(editable = null) {
        const state = interfaceFSM.readState(),
          context = appFSM.query("project-api", { operation: "graphs.readData", frontendState: state });
        if (!context.chart) return null;
        const next = typeof editable === "boolean" ? editable : context.chart.editor.editable === false;
        return graphEditorSetEditable(state.selectedSlotId, context.chart.id, next);
      }
      function readGraphDataApi() {
        let chart = graphEditorChart(), objects = normalizedGraphObjects(chart);
        let index = appFSM.state.graphObjectIndex;
        let selectedIndex = Number.isInteger(index) && objects[index] ? index : null;
        let csv = selectedProjectCsv();
        let objectCsv = selectedIndex === null ? null : getProjectCsv(objects[selectedIndex].csvId);
        return {
          objectColumns: objectCsv ? columnDefinitions(objectCsv.rows, objectCsv.headerLines) : [],
          chartId: chart?.id ?? null,
          editable: chart?.editor?.editable !== false,
          objects: projectClone(objects),
          selectedIndex,
          csv: csv ? {
            id: csv.id, headerLines: csv.headerLines, rowCount: csv.rows.length,
            rows: projectClone(csv.rows.slice(0, 30)),
            columns: columnDefinitions(csv.rows, csv.headerLines),
          } : null,
          csvOptions: activeProject.csvFiles.map((item) => ({
            value: String(item.id), label: item.name,
          })),
        };
      }
      function readGraphLayoutApi() {
        return appFSM.query("project-api", { operation: "graphs.readLayout", selectedSlotId: interfaceFSM.readState().selectedSlotId });
      }
      function readGraphPaletteApi() {
        let chart = graphEditorChart();
        return {
          slotId: getSelectedSlot()?.id ?? null,
          chartId: chart?.id ?? null,
          editable: chart?.editor?.editable !== false,
          colors: normalizedGraphObjects(chart).map((object) => object.color),
        };
      }
      async function importSelectedGraphFile(file, slotId = interfaceFSM.readState().selectedSlotId) {
        const [copied] = await prepareCopiedImportFiles([file]),
          result = dispatchProjectCommand("SLOT_CHART_IMPORTED", { slotId, file: copied });
        if (!result.committed) return result;
        const chart = appFSM.query("project-api", {
          operation: "graphs.readData", frontendState: { selectedSlotId: slotId },
        }).chart;
        renderDashboard(); updateFileAvailability();
        status(`${file.name}을 슬롯에 불러왔습니다.`);
        return chart;
      }
      function readAssetDeletionTarget() {
        const resolved = appFSM.query("project-api", {
          operation: "assets.readDeletionTarget", path: interfaceFSM.readState().assetPath,
        });
        return resolved ? immutableProjectCopy({ kind: resolved.kind, id: resolved.target.id,
          path: resolved.path, name: resolved.target.name, referenceCount: resolved.referenceCount }) : null;
      }
      function deleteProjectAsset(target) {
        if (!target || !["csv", "image"].includes(target.kind)) return null;
        const result = dispatchProjectCommand(target.kind === "csv" ? "DATA_OBJECT_DELETED" : "IMAGE_OBJECT_DELETED", {
          target: { kind: target.kind, id: target.id, path: target.path },
        });
        if (!result.committed) return null;
        const removed = result.changed.assets[0], count = result.changed.removedGraphReferenceCount + result.changed.resetImageSlotCount;
        if (count) renderDashboard();
        status(`${removed.name}을 프로젝트에서 삭제했습니다.`);
        return null;
      }
      function movableProjectNode(path, state = activeProject._state) {
        let match = path ? projectVfs.resolve(path, state) : null;
        if (!match) return false;
        if (match.kind === "directory") return !projectVfs.isFixedDirectory(path);
        return true;
      }
      function projectNodeReferenceCount(path, state = activeProject._state) {
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
      function readProjectTrash() {
        let snapshot = projectDataTreeSnapshot(projectDataTreeObjects());
        let csvIds = new Set(snapshot.data.filter((asset) =>
          projectVfs.isTrashed(asset.path)).map((asset) => asset.id));
        let imageIds = new Set(snapshot.images.filter((asset) =>
          projectVfs.isTrashed(asset.path)).map((asset) => asset.id));
        return {
          hasContents: snapshot.directories.some((path) =>
            path !== PROJECT_TRASH_DIRECTORY && projectVfs.isTrashed(path)) ||
            csvIds.size > 0 || imageIds.size > 0,
          referenceCount: projectAssetReferenceCount(csvIds, imageIds),
        };
      }
      function projectNodeMoveOptions(path) {
        let match = path ? projectVfs.resolve(path) : null;
        return activeProject.fileSystem.directories.filter((directory) =>
          (directory === "/assets" || directory.startsWith("/assets/")) &&
          !projectVfs.isTrashed(directory) &&
          !(match?.kind === "directory" && projectPathInDirectory(directory, path)));
      }
      function planProjectNodeMove(path, directory, state = activeProject._state) {
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
          referenceCount: enteringTrash ? projectNodeReferenceCount(source, state) : 0 });
      }
      function moveProjectNode(plan, useUniqueName = false) {
        if (!plan) return null;
        const result = dispatchProjectCommand("PROJECT_NODE_MOVED", {
          path: plan.path, directory: plan.directory, useUniqueName,
        });
        if (!result.committed) return null;
        const path = result.changed.movedPathTo,
          trashed = appFSM.query("project-api", { operation: "assets.isTrashed", path });
        if (dashboardProjectionEffect("PROJECT_NODE_MOVED", result.changed) === "FULL_DASHBOARD") renderDashboard();
        status(trashed
          ? `${projectPathName(result.changed.movedPathFrom)}을 휴지통으로 이동했습니다.`
          : `${projectPathName(result.changed.movedPathFrom)}을 ${projectParentPath(path)}로 이동했습니다.`);
        return immutableProjectCopy({ path, trashed });
      }
      function createProjectDirectory(parent, name) {
        const result = dispatchProjectCommand("PROJECT_DIRECTORY_CREATED", { parent, name });
        if (!result.committed) return null;
        const path = result.changed.createdDirectoryPath;
        appFSM.send("SELECT_ASSET", { kind: "directory", path, direction: "ui-to-fsm" });
        return path;
      }
      function emptyProjectTrash() {
        const result = dispatchProjectCommand("PROJECT_TRASH_EMPTIED", {});
        if (!result.committed) return null;
        if (dashboardProjectionEffect("PROJECT_TRASH_EMPTIED", result.changed) === "FULL_DASHBOARD") renderDashboard();
        updateFileAvailability();
        status(`휴지통을 비웠습니다. 폴더 ${result.changed.directoryCount}개, CSV ${result.changed.csvCount}개, 이미지 ${result.changed.imageCount}개를 삭제했습니다.`);
        return null;
      }
      function draggableProjectAsset(path) {
        let match = path ? projectVfs.resolve(path) : null;
        return match && match.kind !== "directory" && !projectVfs.isTrashed(path)
          ? { path, kind: match.kind } : null;
      }
      function connectProjectAssetPathToSlot(path, kind, slotId) {
        return connectProjectAssetToSlot(path, kind, slotId);
      }
      async function importProjectFileToSlot(file, slotId, choosePlan) {
        const target = readBackendProjection("slot-selection-context", { slotId }), kind = readAssetFileKind(file);
        if (!target) throw Error("가져올 대상 슬롯이 없습니다.");
        if (kind === "slot") return importSelectedGraphFile(file, target.id);
        if (!["data", "image"].includes(kind)) throw Error("지원하지 않는 파일 형식입니다.");
        const directory = PROJECT_ASSET_DIRECTORIES[kind === "data" ? "csv" : "image"],
          choices = await collectCompletedImportChoices([file], directory, choosePlan);
        if (!choices) return null;
        const files = await prepareCopiedImportFiles([file]),
          result = dispatchProjectCommand("ASSETS_IMPORTED", { files, directory, choices, targetSlotId: slotId });
        if (!result.committed) return result;
        const imported = readImportedAssets(result)[0];
        renderDashboard(); updateFileAvailability();
        return imported;
      }
      async function importProjectAssetFiles(files, choosePlan) {
        const inputs = Array.from(files && typeof files[Symbol.iterator] === "function" ? files : files ? [files] : []);
        if (!inputs.length) return [];
        const targetSlotId = interfaceFSM.readState().selectedSlotId;
        return runLifecycleTask("importing", "ASSET_IMPORT", async () => {
          const output = [];
          for (const file of inputs) {
            const kind = readAssetFileKind(file);
            let item;
            if (kind === "slot") {
              if (targetSlotId == null) throw Error("FFSX를 불러올 슬롯을 먼저 선택하세요.");
              item = await importSelectedGraphFile(file, targetSlotId);
            } else if (kind === "data" || kind === "image") {
              if (targetSlotId != null) item = await importProjectFileToSlot(file, targetSlotId, choosePlan);
              else {
                const directory = PROJECT_ASSET_DIRECTORIES[kind === "data" ? "csv" : "image"];
                item = await importProjectFilesToDirectory([file], directory, choosePlan);
                if (Array.isArray(item)) item = item[0];
              }
            } else throw Error(`${file?.name || "파일"}: 지원하지 않는 파일 형식입니다.`);
            if (item == null || item.committed === false) return item;
            output.push(item);
          }
          return output;
        });
      }
      function graphEditorUpdateLayout(slotId, chartId, values) {
        const result = dispatchProjectCommand("CHART_LAYOUT_CHANGED", { slotId, chartId, settings: values });
        if (!result.committed) return result;
        const output = appFSM.query("project-api", { operation: "graphs.readLayout", selectedSlotId: slotId });
        renderDashboard();
        return output;
      }
      function updateGraphLayoutApi(values = {}) {
        const slotId = interfaceFSM.readState().selectedSlotId,
          context = appFSM.query("project-api", { operation: "graphs.readLayout", selectedSlotId: slotId });
        return graphEditorUpdateLayout(slotId, context?.chartId ?? null, values);
      }
      function graphEditorApplyPalette(chartId, colors) {
        const result = dispatchProjectCommand("GRAPH_OBJECTS_REPLACED", { chartId, operation: "graphs.applyPalette", colors });
        if (!result.committed) return result;
        const chart = appFSM.query("project-api", { operation: "graphs.readData", chartId }).chart;
        renderDashboard();
        return chart;
      }
      function applyGraphPaletteApi(colors) {
        const context = appFSM.query("project-api", { operation: "graphs.readData", frontendState: interfaceFSM.readState() });
        return graphEditorApplyPalette(context.chart?.id ?? null, colors);
      }
      function setAnnotationEnabled(kind, enabled) {
        if (kind === "label")
          appFSM.send("LABEL_SETTINGS_CHANGED", { enabled, direction: "ui-to-fsm" });
        else
          appFSM.send("CAPTION_SETTINGS_CHANGED", { enabled, direction: "ui-to-fsm" });
        renderDashboard();
        debugLog(`annotation:${kind}`, { enabled });
        appFSM.notify(
          kind === "label" ? "labels" : "captions",
          "ANNOTATION_VISIBILITY_CHANGED",
        );
      }
      function applyCaptionSettings(notify = true) {
        syncDashboardCaption();
        debugLog("annotation:caption-settings", {
          name: activeProject.captionName,
          bold: activeProject.captionNameBold,
          ...activeProject.captionSettings,
        });
        if (notify) appFSM.notify("captions", "CAPTION_SETTINGS_CHANGED");
      }
      function exportImageLoad(src) {
        return new Promise((resolve, reject) => {
          let image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(Error("이미지를 읽을 수 없습니다."));
          image.src = src;
        });
      }
      function exportDrawImage(ctx,image,rect,slot,scaleX,scaleY) {
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
      function exportWrapText(ctx, text, x, y, maxWidth, lineHeight) {
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
      function exportCrc32(bytes) {
        let crc = 0xffffffff;
        for (let byte of bytes) {
          crc ^= byte;
          for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
        return (crc ^ 0xffffffff) >>> 0;
      }
      function exportSetPngDpi(bytes, dpi) {
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
      function exportSetJpegDpi(bytes, dpi) {
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
      async function exportCanvasBlob(canvas, mime, dpi) {
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
      async function exportDashboard(capture = false, options = null) {
        let dashboard = $("dashboard"),
          caption = $("dashboardCaption"),
          statusOut = {
            set textContent(value) {
              options?.onStatus?.(value);
            },
          },
          bordersVisible = activeProject.layout.slotStyle.showBorders,
          captionView = activeCaptionView(),
          dashboardRect = dashboard.getBoundingClientRect();
        if (!dashboardRect.width || !dashboardRect.height) {
          statusOut.textContent = "저장할 그래프 영역이 없습니다.";
          return;
        }
        let captionShown = !caption.classList.contains("hidden"),
          captionRect = captionShown ? caption.getBoundingClientRect() : null,
          labels = [...dashboard.querySelectorAll(".slot-label")],
          left = dashboardRect.left,
          top = dashboardRect.top,
          right = dashboardRect.right,
          bottom = Math.max(dashboardRect.bottom, captionRect?.bottom || 0);
        labels.forEach((label) => {
          let rect = label.getBoundingClientRect();
          left = Math.min(left, rect.left);
          top = Math.min(top, rect.top);
          right = Math.max(right, rect.right);
          bottom = Math.max(bottom, rect.bottom);
        });
        let sourceWidth = right - left,
          sourceHeight = bottom - top,
          width = capture
            ? Math.round(sourceWidth)
            : Math.max(
                100,
                Math.min(20000, Number(options?.width) || Math.round(sourceWidth)),
              ),
          height = capture
            ? Math.round(sourceHeight)
            : Math.max(
                100,
                Math.min(20000, Number(options?.height) || Math.round(sourceHeight)),
              ),
          dpi = Math.max(36, Math.min(1200, Number(options?.dpi) || 300)),
          format = options?.format === "jpeg" ? "jpeg" : "png";
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
          let slotElements = [...dashboard.querySelectorAll(".slot")];
          for (let element of slotElements) {
            let rect = point(element.getBoundingClientRect());
            ctx.fillStyle = getComputedStyle(element).backgroundColor || "#fff";
            ctx.fillRect(
              rect.left * scaleX,
              rect.top * scaleY,
              rect.width * scaleX,
              rect.height * scaleY,
            );
            if (bordersVisible) {
              ctx.strokeStyle = getComputedStyle(element).borderColor || "#B0CFCE";
              ctx.lineWidth = Math.max(1, scaleX);
              ctx.strokeRect(
                rect.left * scaleX,
                rect.top * scaleY,
                rect.width * scaleX,
                rect.height * scaleY,
              );
            }
            let plot = element.querySelector(".plot-item"),
              imageElement = element.querySelector(".slot-image");
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
            } else if (imageElement) {
              let image = await exportImageLoad(imageElement.currentSrc || imageElement.src),
                slot = slotAt(+element.dataset.slot);
              exportDrawImage(ctx, image, rect, slot, scaleX, scaleY);
            }
          }
          for (let label of labels) {
            let rect = point(label.getBoundingClientRect()),
              style = getComputedStyle(label);
            ctx.fillStyle = style.color || "#383A42";
            ctx.font = `${style.fontWeight} ${parseFloat(style.fontSize) * scaleY}px ${style.fontFamily}`;
            ctx.textBaseline = "middle";
            ctx.fillText(
              label.textContent || "",
              (rect.left + parseFloat(style.paddingLeft || 0)) * scaleX,
              (rect.top + rect.height / 2) * scaleY,
            );
          }
          if (captionShown && captionRect) {
            let rect = point(captionRect),
              style = getComputedStyle(caption);
            ctx.fillStyle = style.backgroundColor || "#fff";
            ctx.fillRect(
              rect.left * scaleX,
              rect.top * scaleY,
              rect.width * scaleX,
              rect.height * scaleY,
            );
            ctx.strokeStyle = style.borderColor || "#B0CFCE";
            ctx.strokeRect(
              rect.left * scaleX,
              rect.top * scaleY,
              rect.width * scaleX,
              rect.height * scaleY,
            );
            let prefix = $("captionPrefix").textContent || "",
              body = captionView.aggregate
                ? captionView.exportText
                : $("captionText").textContent || "",
              fontSize = captionView.settings.fontSize * scaleY,
              lineHeight =
                captionView.settings.fontSize * captionView.settings.lineHeight * scaleY,
              baseX = (rect.left + 8) * scaleX,
              y = (rect.top + 8) * scaleY + fontSize;
            ctx.fillStyle = getComputedStyle(caption).color || "#383A42";
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
            link = document.createElement("a"),
            stamp = new Date().toISOString().replace(/[:.]/g, "-");
          link.href = URL.createObjectURL(blob);
          link.download = `전체-그래프-${width}x${height}-${dpi}dpi-${stamp}.${format === "jpeg" ? "jpg" : "png"}`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 0);
          statusOut.textContent = `${width} × ${height}px, ${dpi} DPI로 저장했습니다.`;
          debugLog("dashboard:export", { format, width, height, dpi, slots: slotElements.length });
        } catch (error) {
          statusOut.textContent = "저장 실패: " + error.message;
          debugLog("dashboard:export-error", { message: error.message });
          throw error;
        }
      }
      async function exportChartImage(chart, width, height, layoutScale, rasterScale) {
        let host = document.createElement("div"),
          figure = chartFigure(chart, activeProject._state, layoutScale);
        host.style.cssText =
          "position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none;";
        host.style.width = `${Math.max(2, width)}px`;
        host.style.height = `${Math.max(2, height)}px`;
        document.body.append(host);
        try {
          await Plotly.newPlot(
            host,
            figure.data,
            { ...figure.layout, width, height, autosize: false },
            plotlyConfig(chart, { ...figure.config, staticPlot: true, responsive: false }),
          );
          return await Plotly.toImage(host, {
            format: "png",
            width: Math.max(2, Math.round(width)),
            height: Math.max(2, Math.round(height)),
            scale: rasterScale,
          });
        } finally {
          Plotly.purge(host);
          host.remove();
        }
      }
      async function exportCaptionLayout(snapshot, measureText) {
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
      function targetExportGeometry(layout, width, heightOverride = null) {
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
      function targetSlotIdentifier(index, settings) {
        if (settings.format === "decimal") return String(index + 1);
        if (settings.format === "lower-roman") return romanIdentifier(index).toLowerCase();
        if (settings.format === "upper-roman") return romanIdentifier(index);
        return alphaIdentifier(index, settings.format === "upper-alpha");
      }
      function createTargetExportSnapshot() {
        let objects = projectObjects.snapshot([
            "layout",
            "labels",
            "captions",
            "images",
            "charts",
            "slots",
          ]),
          dashboard = $("dashboard"),
          caption = $("dashboardCaption"),
          visibleSlots = objects.slots.filter((slot) => !slot.hidden),
          ordered = [...visibleSlots].sort((a, b) =>
            objects.labels.settings.order === "column-major"
              ? a.col - b.col || a.row - b.row
              : a.row - b.row || a.col - b.col,
          );
        return Object.freeze({
          revision: appFSM.state.revision,
          ...objects,
          annotations: { captions: objects.captions },
          captionReferenceStyle: projectClone(BackendSettings.defaults.captionReferenceStyle),
          rasterLimits: projectClone(BackendSettings.defaults.limits.export),
          bordersVisible: activeProject.layout.slotStyle.showBorders,
          slotColors: Object.fromEntries(
            visibleSlots.map((slot) => {
              let element = $(`plot-${slot.id}`)?.closest(".slot"),
                style = element ? getComputedStyle(element) : null;
              return [
                slot.id,
                {
                  background: style?.backgroundColor || "#fff",
                  border: style?.borderColor || "#B0CFCE",
                },
              ];
            }),
          ),
          labelText: Object.fromEntries(
            ordered.map((slot, index) => {
              let identifier = targetSlotIdentifier(index, objects.labels.settings),
                text =
                  objects.labels.settings.parentheses === true
                    ? `(${identifier})`
                    : identifier;
              return [slot.id, text];
            }),
          ),
          dashboardStyle: {
            background: getComputedStyle(dashboard).backgroundColor || "#fff",
            color: getComputedStyle(dashboard).color || "#383A42",
          },
          captionStyle: {
            background: getComputedStyle(caption).backgroundColor || "#fff",
            border: getComputedStyle(caption).borderColor || "#B0CFCE",
            color: getComputedStyle(caption).color || "#383A42",
          },
        });
      }
      async function exportDashboardTarget(options = null) {
        let statusOut = {
            set textContent(value) {
              options?.onStatus?.(value);
            },
          },
          snapshot = createTargetExportSnapshot(),
          captionView = snapshot.annotations.captions,
          width = Math.max(
            100,
            Math.min(20000, Number(options?.width) || 1000),
          ),
          requestedHeight = Number(options?.height),
          dpi = Math.max(36, Math.min(1200, Number(options?.dpi) || 300)),
          rasterScale = 1,
          format = options?.format === "jpeg" ? "jpeg" : "png",
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
          automaticHeight = !Number.isFinite(requestedHeight) || requestedHeight <= 0,
          height = automaticHeight
            ? Math.ceil(baseReference.height + captionLayout.height + captionLayout.gap)
            : Math.max(100, Math.min(20000, requestedHeight)),
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
              chart = slot.chart && snapshot.charts.find((item) => item.id === slot.chart),
              imageModel = slotImage(slot, snapshot.images);
            ctx.save();
            ctx.beginPath();
              ctx.roundRect(rect.left, rect.top, rect.width, rect.height, slotRadius());
            ctx.clip();
            ctx.fillStyle = colors?.background || "#fff";
            ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
            if (slot.contentType !== "image" && chart) {
              let uri = await exportChartImage(
                  chart,
                  rect.width,
                  rect.height,
                  geometry.scale,
                  rasterScale,
                ),
                image = await exportImageLoad(uri);
              ctx.drawImage(image, rect.left, rect.top, rect.width, rect.height);
            } else if (imageModel) {
              let image = await exportImageLoad(projectImageDataUrl(imageModel));
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
            let ordered = [...visibleSlots].sort((a, b) =>
              snapshot.labels.settings.order === "column-major"
                ? a.col - b.col || a.row - b.row
                : a.row - b.row || a.col - b.col,
            );
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
            link = document.createElement("a"),
            stamp = new Date().toISOString().replace(/[:.]/g, "-");
          link.href = URL.createObjectURL(blob);
          link.download = `전체-그래프-${width}x${height}-r${rasterWidth}x${rasterHeight}-${dpi}dpi-${stamp}.${format === "jpeg" ? "jpg" : "png"}`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 0);
          statusOut.textContent = `레이아웃 ${width} × ${height}px · 래스터 ${rasterWidth} × ${rasterHeight}px · ${dpi} DPI로 저장했습니다.`;
          debugLog("dashboard:export-target", {
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
          });
          return { outcome: "saved", width: rasterWidth, height: rasterHeight, automaticHeight };
        } catch (error) {
          statusOut.textContent = "저장 실패: " + error.message;
          debugLog("dashboard:export-error", { message: error.message });
          throw error;
        }
      }
      function ffsxBuildSlot(slot, chart, source = activeProject._state) {
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
      async function ffsxReadSlot(file) {
        return ffsxReadSlotBytes(new Uint8Array(await file.arrayBuffer()));
      }
      function ffsxReadSlotBytes(bytes) {
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
          debugLog("slotFfsx:read-version", {
            format: "FFSX",
            appBuild: typeof slot?.appBuild === "string" ? slot.appBuild : null,
          });
          delete slot.appBuild;
          chart.editor.objects = [...ffpxDirectChild(graphNode, "graphObjects").children]
            .filter((node) => node.tagName === "graphObject").map(ffpxWrappedValue);
          let payload = {
            schema: "fast-figure-slot",
            version: PACKAGE_FORMAT_VERSION,
            slot: {
              ...slot,
              caption: typeof caption?.text === "string" ? caption.text : null,
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
            !chartCsvIds(chart).includes(csv.id) ||
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
      function downloadSlotFfsx() {
        return appFSM.run("exporting", "graphs.exportFfsx", () =>
          exportSelectedGraph(interfaceFSM.readState().selectedSlotId, "graphs.exportFfsx"));
      }
      async function downloadExportPayload(payload) {
        const bytes = payload.entries ? ffpxZipStore(payload.entries) : Uint8Array.from(payload.bytes),
          blob = new Blob([bytes], { type: payload.mime }),
          url = URL.createObjectURL(blob);
        try {
          const link = document.createElement("a");
          link.href = url;
          link.download = payload.name;
          link.click();
          // Let the browser consume the handoff before releasing this job's URL.
          await new Promise((resolve) => setTimeout(resolve, 0));
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      async function exportSelectedGraph(slotId, operation) {
        const payload = appFSM.query("export", {
          operation, slotId, stamp: new Date().toISOString().replace(/[:.]/g, "-"),
        });
        if (payload === null) return;
        await downloadExportPayload(payload);
      }
      function downloadPlotlyJson() {
        return appFSM.run("exporting", "graphs.exportPlotlyJson", () =>
          exportSelectedGraph(interfaceFSM.readState().selectedSlotId, "graphs.exportPlotlyJson"));
      }
      function applyDashboardZoom(resize = true) {
        let dashboard = $("dashboard"),
          width;
        if (dashboardZoomLocked && Number.isFinite(dashboardZoomLockedWidth)) {
          width = dashboardZoomLockedWidth;
        } else {
          width = dashboardReferenceWidth() * (dashboardZoomIntent / 100);
        }
        dashboard.style.minWidth = `${width}px`;
        dashboard.style.width = `${width}px`;
        applyReferenceGeometry(dashboard);
        syncDashboardCaptionWidth();
        if (resize) schedulePlotResize();
        requestAnimationFrame(syncDashboardZoomDisplay);
      }
      function readDashboardRenderedWidth() {
        return $("dashboard")?.getBoundingClientRect().width ?? 0;
      }
      function applyUiPalette(palette, notify = true) {
        document.documentElement.style.setProperty("--ui-color", palette.uiColor);
        document.documentElement.style.setProperty(
          "--paper",
          palette.uiBackgroundColor,
        );
        document.documentElement.style.setProperty("--ui-subtle", palette.uiSubtleColor);
        document.documentElement.style.setProperty("--ink", palette.fontColor);
        document.documentElement.style.setProperty("--graph-bg", palette.paperColor);
        if (notify) appFSM.notify("ui", "UI_PALETTE_CHANGED");
        return Object.freeze({
          "--ui-color": palette.uiColor, "--paper": palette.uiBackgroundColor,
          "--ui-subtle": palette.uiSubtleColor, "--ink": palette.fontColor,
          "--graph-bg": palette.paperColor,
        });
      }
      function applyCurrentUiPalette(notify = true) {
        applyUiPalette(appFSM.query("renderer", { operation: "ui-palette" }), notify);
        renderDashboard();
      }
      function applyUiPaletteValues(values, notify = true) {
        let result = dispatchProjectCommand("APPEARANCE_CHANGED", { palette: values });
        if (!result.committed) return false;
        applyCurrentUiPalette(notify);
        return readAppearanceApiPalette();
      }
      function readGlobalCaptionState() {
        return appFSM.query("project-api", { operation: "captions.readGlobal" });
      }
      function readSlotCaptionState(slotId) {
        return appFSM.query("project-api", { operation: "captions.readSlot", slotId });
      }
      function setCaptionsApiEnabled(enabled) {
        let result = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { enabled });
        if (!result.committed) return false;
        const state = readGlobalCaptionState();
        renderDashboard();
        debugLog("annotation:caption", { enabled: state.enabled });
        appFSM.notify("captions", "ANNOTATION_VISIBILITY_CHANGED");
        return state;
      }
      function setGlobalCaptionText(text) {
        let result = dispatchProjectCommand("CAPTION_TEXT_INPUT", {
          target: { kind: "global" }, text,
        });
        if (!result.committed) return false;
        const state = readGlobalCaptionState();
        syncDashboardCaption(state);
        return state;
      }
      function setSlotCaptionText(slotId,text) {
        let result = dispatchProjectCommand("CAPTION_TEXT_INPUT", {
          target: { kind: "slot", id: slotId }, text,
        });
        return result.committed ? readSlotCaptionState(slotId) : false;
      }
      function insertCaptionsApiSlotCaptions(slotIds = null) {
        let result = dispatchProjectCommand("SLOT_CAPTIONS_INSERTED", { slotIds });
        if (!result.committed) return false;
        let state = readGlobalCaptionState();
        syncDashboardCaption(state);
        return state;
      }

      function setCaptionsApiName(name) {
        let result = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { name });
        if (!result.committed) return false;
        const state = readGlobalCaptionState();
        syncDashboardCaption(state);
        appFSM.notify("captions", "CAPTION_NAME_CHANGED");
        return state;
      }
      function setCaptionsApiNameBold(bold) {
        let result = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { nameBold: bold });
        if (!result.committed) return false;
        const state = readGlobalCaptionState();
        syncDashboardCaption(state);
        appFSM.notify("captions", "CAPTION_NAME_WEIGHT_CHANGED");
        return state;
      }
      function setCaptionsApiSettings(patch = {}) {
        let result = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", { settings: patch });
        if (!result.committed) return false;
        const state = readGlobalCaptionState();
        syncDashboardCaption(state);
        appFSM.notify("captions", "CAPTION_SETTINGS_CHANGED");
        return state;
      }
      function readPrintApiSettings() {
        return appFSM.query("project-api", { operation: "print.readSettings" });
      }
      function setPrintApiSettings(values={}) {
        let result = dispatchProjectCommand("EXPORT_SETTINGS_CHANGED", { settings: values });
        return result.committed ? readPrintApiSettings() : false;
      }
      function savePrintApi(options={}) {
        let settings=readPrintApiSettings();
        return exportDashboardTarget({
          width:settings.width,
          height:settings.heightMode==="explicit"?settings.height:"",
          dpi:settings.dpi,
          format:settings.format,
          onStatus:options.onStatus,
        });
      }
      function capturePrintApi(options={}) {
        let settings=readPrintApiSettings();
        return exportDashboard(true,{
          dpi:settings.dpi,
          format:settings.format,
          onStatus:options.onStatus,
        });
      }
      function readLabelsApiState() {
        return appFSM.query("project-api", {
          operation: "labels.readState", slotId: interfaceFSM.readState().selectedSlotId,
        });
      }
      function setLabelsApiEnabled(enabled) {
        let result = dispatchProjectCommand("LABEL_SETTINGS_CHANGED", { enabled });
        if (!result.committed) return false;
        renderDashboard();
        debugLog("annotation:label", { enabled });
        appFSM.notify("labels", "ANNOTATION_VISIBILITY_CHANGED");
        return readLabelsApiState();
      }
      function setLabelsApiSettings(patch = {}) {
        let result = dispatchProjectCommand("LABEL_SETTINGS_CHANGED", { settings: patch });
        if (!result.committed) return false;
        renderDashboard();
        schedulePlotResize();
        debugLog("mantine:label-settings", { ...patch });
        appFSM.notify("labels", "LABEL_SETTINGS_CHANGED");
        return readLabelsApiState();
      }
      function updateLabelsApiPosition(x, y, eventName = null) {
        let result = dispatchProjectCommand("LABEL_POSITION_CHANGED", { x, y });
        if (!result.committed) return false;
        renderDashboard();
        schedulePlotResize();
        if (eventName) {
          debugLog("mantine:label-settings", { x, y });
          appFSM.notify("labels", eventName);
        }
        return readLabelsApiState();
      }
      function setLabelsApiPosition(x, y) {
        return updateLabelsApiPosition(x, y, "LABEL_POSITION_CHANGED");
      }

      function finishLabelsApiPositionInteraction() {
        debugLog("mantine:label-position", {});
        appFSM.notify("labels","LABEL_POSITION_DRAGGED");
        return readLabelsApiState();
      }
      function resetLabelsApiPosition() {
        let result = dispatchProjectCommand("LABEL_POSITION_CHANGED", { reset: true });
        if (!result.committed) return false;
        renderDashboard();
        schedulePlotResize();
        appFSM.notify("labels", "LABEL_POSITION_RESET");
        return readLabelsApiState();
      }
      function readAppearanceApiPalette() {
        return appFSM.query("project-api", { operation: "appearance.readPalette" });
      }
      function setAppearanceApiPalette(values) {
        return applyUiPaletteValues(values);
      }
      function resetAppearanceApiPalette() {
        return applyUiPaletteValues({ ...DEFAULT_UI_PALETTE });
      }
      function readLayoutApiState(previewWidth = null) {
        const layout = appFSM.query("project-api", { operation: "layout.readState", renderedWidth: previewWidth }),
          session = interfaceFSM.readState();
        return Object.freeze({ ...layout, zoom: session.dashboardZoomIntent, zoomLocked: session.dashboardZoomLocked });
      }
      function setLayoutApiStyle(patch = {}) {
        const result = dispatchProjectCommand("LAYOUT_STYLE_CHANGED", patch);
        if (!result.committed) return false;
        applySlotStyle(false);
        applyDashboardZoom(false);
        schedulePlotResize();
        return readLayoutApiState();
      }
      function setLayoutApiGrid(rows, cols) {
        const result = dispatchProjectCommand("GRID_LAYOUT_CHANGED", { rows, cols });
        if (!result.committed) return false;
        renderDashboard();
        applySlotStyle(false);
        schedulePlotResize();
        return readLayoutApiState();
      }
      function setLayoutApiZoom(value) {
        appFSM.send("SET_DASHBOARD_ZOOM", { value });
        applyDashboardZoom(false);
        return readLayoutApiState();
      }
      function commitLayoutApiZoom() {
        renderDashboard();
        appFSM.notify("layout", "DASHBOARD_ZOOM_CHANGED");
        return readLayoutApiState();
      }
      function setLayoutApiZoomLocked(locked) {
        const session = interfaceFSM.readState();
        let renderedWidth = null;
        if (locked === true && !session.dashboardZoomLocked) {
          renderedWidth = readDashboardRenderedWidth();
          if (!Number.isFinite(renderedWidth) || renderedWidth <= 0) return false;
        }
        appFSM.send("SET_DASHBOARD_ZOOM_LOCK", { locked: locked === true, renderedWidth });
        applyDashboardZoom(false);
        schedulePlotResize();
        return readLayoutApiState();
      }
      function resetLayoutApiZoom() {
        appFSM.send("RESET_DASHBOARD_ZOOM");
        applyDashboardZoom(false);
        schedulePlotResize();
        return readLayoutApiState();
      }
      window.FastFigureApi = Object.freeze({
        project: Object.freeze({
          readName: () => appFSM.query("project-api", { operation: "project.readName" }),
          setName: setProjectName,
          importFile: importProjectFile,
          exportFile: downloadProject,
        }),
        slots: Object.freeze({
          readSelected: readSelectedSlotApi,
          select: setSelectedSlot,
          setContentType: setSlotContentType,
          reset: resetSlotApi,
          swap: swapSlots,
          prepareFileDrop: prepareDashboardFileDrop,
          finishFileDrop: finishDashboardFileDrop,
        }),
        images: Object.freeze({
          readEditor: readImageEditorApi,
          setSettings: (values) => applyImageSettingsFromValues(appFSM.readState().selectedSlotId, values),
          insertEmpty: insertEmptyImageIntoSelectedSlot,
        }),
        assets: Object.freeze({
          readDeletionTarget: readAssetDeletionTarget,
          delete: deleteProjectAsset,
          readTree: () => projectDataTreeSnapshot(projectDataTreeObjects()),
          isTrashed: (path) => projectVfs.isTrashed(path),
          movable: movableProjectNode,
          readTrash: readProjectTrash,
          moveOptions: projectNodeMoveOptions,
          planMove: planProjectNodeMove,
          move: moveProjectNode,
          createDirectory: createProjectDirectory,
          createEmptyCsv: createEmptyProjectCsvAndSelect,
          emptyTrash: emptyProjectTrash,
          draggableAsset: draggableProjectAsset,
          connectToSlot: connectProjectAssetPathToSlot,
          importToDirectory: importProjectFilesToDirectory,
          importToSlot: importProjectFileToSlot,
          fileKind: readAssetFileKind,
          importFiles: importProjectAssetFiles,
          collisionModel: readAssetCollisionModel,
          resolveImportPlan: readAssetImportPlan,
          selectDirectory: selectDirectoryFromTree,
          selectCsv: selectProjectCsv,
          selectImage: selectImageFromTree,
          download: downloadProjectAsset,
        }),
        graphs: Object.freeze({
          readData: readGraphDataApi,
          readLayout: readGraphLayoutApi,
          readPalette: readGraphPaletteApi,
          selectCsv: graphEditorSelectCsv,
          setHeaderLines: graphEditorHeaderLines,
          setEditable: setGraphEditableApi,
          addObject: addGraphObjectApi,
          moveObject: moveGraphObjectApi,
          selectObject: graphEditorSelectObject,
          setObjectValues: setGraphObjectValuesApi,
          deleteObject: deleteGraphObjectApi,
          updateLayout: updateGraphLayoutApi,
          applyPalette: applyGraphPaletteApi,
          defaultColors: () => [...DEFAULT_COLORS],
          hasSelectedSlot: () => !!getSelectedSlot(),
          importFile: importSelectedGraphFile,
          exportFfsx: downloadSlotFfsx,
          exportPlotlyJson: downloadPlotlyJson,
        }),
        print: Object.freeze({
          readSettings: readPrintApiSettings,
          setSettings: setPrintApiSettings,
          save: savePrintApi,
          capture: capturePrintApi,
        }),
        captions: Object.freeze({
          readGlobal: readGlobalCaptionState,
          readSlot: readSlotCaptionState,
          setEnabled: setCaptionsApiEnabled,
          setGlobalText: setGlobalCaptionText,
          setSlotText: setSlotCaptionText,
          insertSlotCaptions: insertCaptionsApiSlotCaptions,
          setName: setCaptionsApiName,
          setNameBold: setCaptionsApiNameBold,
          setSettings: setCaptionsApiSettings,
        }),
        labels: Object.freeze({
          readState: readLabelsApiState,
          setEnabled: setLabelsApiEnabled,
          setSettings: setLabelsApiSettings,
          setPosition: setLabelsApiPosition,
          finishPositionInteraction: finishLabelsApiPositionInteraction,
          resetPosition: resetLabelsApiPosition,
        }),
        appearance: Object.freeze({
          readPalette: readAppearanceApiPalette,
          setPalette: setAppearanceApiPalette,
          resetPalette: resetAppearanceApiPalette,
        }),
        layout: Object.freeze({
          readState: readLayoutApiState,
          setStyle: setLayoutApiStyle,
          setGrid: setLayoutApiGrid,
          setZoom: setLayoutApiZoom,
          commitZoom: commitLayoutApiZoom,
          setZoomLocked: setLayoutApiZoomLocked,
          resetZoom: resetLayoutApiZoom,
          mergeSlots,
          splitSlots,
        }),
      });
      window.addEventListener("error", (event) =>
        debugLog("window:error", {
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
        }),
      );
      window.addEventListener("unhandledrejection", (event) =>
        debugLog("window:unhandledrejection", {
          message: event.reason?.message || String(event.reason),
        }),
      );
      debugLog("app:init", {
        build: projectObjects.read("project").appBuild,
        userAgent: navigator.userAgent,
        location: location.href,
      });
      applyDashboardZoom();
      installSlotClickController();
      applySlotStyle();
      renderDashboard();
      appFSM.ready();
      debugLog(
        "app:init-complete",
        {
          slots: activeProject.slots.length,
          charts: activeProject.charts.length,
          build: projectObjects.read("project").appBuild,
        },
        "info",
      );
      auditApp("app:init");
    