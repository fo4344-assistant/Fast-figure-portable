
      const PACKAGE_FORMAT_VERSION = 3;
      const APP_BUILD = "1.1.127-alpha";
      const ICONOIR_GLYPHS = Object.freeze({
        "nav-arrow-right": '<path d="M9 6L15 12L9 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
        folder: '<path d="M2 11V4.6C2 4.26863 2.26863 4 2.6 4H8.77805C8.92127 4 9.05977 4.05124 9.16852 4.14445L12.3315 6.85555C12.4402 6.94876 12.5787 7 12.722 7H21.4C21.7314 7 22 7.26863 22 7.6V11M2 11V19.4C2 19.7314 2.26863 20 2.6 20H21.4C21.7314 20 22 19.7314 22 19.4V11M2 11H22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
        "folder-plus": '<path d="M18 6H20M22 6H20M20 6V4M20 6V8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.4 20H2.6C2.26863 20 2 19.7314 2 19.4V11H21.4C21.7314 11 22 11.2686 22 11.6V19.4C22 19.7314 21.7314 20 21.4 20Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 11V4.6C2 4.26863 2.26863 4 2.6 4H8.77805C8.92127 4 9.05977 4.05124 9.16852 4.14445L12.3315 6.85555C12.4402 6.94876 12.5787 7 12.722 7H14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
        page: '<path d="M4 21.4V2.6C4 2.26863 4.26863 2 4.6 2H16.2515C16.4106 2 16.5632 2.06321 16.6757 2.17574L19.8243 5.32426C19.9368 5.43679 20 5.5894 20 5.74853V21.4C20 21.7314 19.7314 22 19.4 22H4.6C4.26863 22 4 21.7314 4 21.4Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10L16 10M8 18L16 18M8 14L12 14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
        "media-image": '<path d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 16L10 13L21 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 10C14.8954 10 14 9.10457 14 8C14 6.89543 14.8954 6 16 6C17.1046 6 18 6.89543 18 8C18 9.10457 17.1046 10 16 10Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
        "view-grid": '<path d="M14 20.4V14.6C14 14.2686 14.2686 14 14.6 14H20.4C20.7314 14 21 14.2686 21 14.6V20.4C21 20.7314 20.7314 21 20.4 21H14.6C14.2686 21 14 20.7314 14 20.4Z" stroke="currentColor"/><path d="M3 20.4V14.6C3 14.2686 3.26863 14 3.6 14H9.4C9.73137 14 10 14.2686 10 14.6V20.4C10 20.7314 9.73137 21 9.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z" stroke="currentColor"/><path d="M14 9.4V3.6C14 3.26863 14.2686 3 14.6 3H20.4C20.7314 3 21 3.26863 21 3.6V9.4C21 9.73137 20.7314 10 20.4 10H14.6C14.2686 10 14 9.73137 14 9.4Z" stroke="currentColor"/><path d="M3 9.4V3.6C3 3.26863 3.26863 3 3.6 3H9.4C9.73137 3 10 3.26863 10 3.6V9.4C10 9.73137 9.73137 10 9.4 10H3.6C3.26863 10 3 9.73137 3 9.4Z" stroke="currentColor"/>',
        upload: '<path d="M6 20L18 20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16V4M12 4L15.5 7.5M12 4L8.5 7.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
        "more-vert": '<path d="M12 12.5C12.2761 12.5 12.5 12.2761 12.5 12C12.5 11.7239 12.2761 11.5 12 11.5C11.7239 11.5 11.5 11.7239 11.5 12C11.5 12.2761 11.7239 12.5 12 12.5Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 20.5C12.2761 20.5 12.5 20.2761 12.5 20C12.5 19.7239 12.2761 19.5 12 19.5C11.7239 19.5 11.5 19.7239 11.5 20C11.5 20.2761 11.7239 20.5 12 20.5Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 4.5C12.2761 4.5 12.5 4.27614 12.5 4C12.5 3.72386 12.2761 3.5 12 3.5C11.7239 3.5 11.5 3.72386 11.5 4C11.5 4.27614 11.7239 4.5 12 4.5Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
        printer: '<path d="M17 13.01L17.01 12.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 17H17M6 10V3.6C6 3.26863 6.26863 3 6.6 3H17.4C17.7314 3 18 3.26863 18 3.6V10M21 20.4V14C21 11.7909 19.2091 10 17 10H7C4.79086 10 3 11.7909 3 14V20.4C3 20.7314 3.26863 21 3.6 21H20.4C20.7314 21 21 20.7314 21 20.4Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
        download: '<path d="M6 20L18 20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 4V16M12 16L15.5 12.5M12 16L8.5 12.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
        camera: '<path d="M2 19V9C2 7.89543 2.89543 7 4 7H4.5C5.12951 7 5.72229 6.70361 6.1 6.2L8.32 3.24C8.43331 3.08892 8.61115 3 8.8 3H15.2C15.3889 3 15.5667 3.08892 15.68 3.24L17.9 6.2C18.2777 6.70361 18.8705 7 19.5 7H20C21.1046 7 22 7.89543 22 9V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
      });
      function iconoirSvg(name) {
        let glyph = ICONOIR_GLYPHS[name];
        if (!glyph) throw new Error(`Unknown Iconoir icon: ${name}`);
        return `<svg class="iconoir" viewBox="0 0 24 24" fill="none" stroke-width="1.5" aria-hidden="true" focusable="false">${glyph}</svg>`;
      }
      function setIconoirIcon(element, name) {
        element.innerHTML = iconoirSvg(name);
        return element;
      }
      document.querySelectorAll(".iconoir-mount[data-iconoir]").forEach((element) =>
        setIconoirIcon(element, element.dataset.iconoir),
      );
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
      });
      const DEFAULT_SLOT_STYLE = Object.freeze({
        referenceWidth: 1200,
        gap: 0,
        outerMargin: 120,
        radius: 0,
        aspect: 1.618,
        showBorders: true,
      });
      const DEFAULT_UI_PALETTE = Object.freeze({
        uiColor: "#B0CFCE",
        uiBackgroundColor: "#FAFAFA",
        uiSurfaceColor: "#FFFFFF",
        uiMutedColor: "#4F525D",
        uiSubtleColor: "#94A3B8",
        uiDisabledBgColor: "#E5E7EB",
        uiDisabledTextColor: "#64748B",
        uiShadowColor: "#383A42",
        paperColor: "#FFFFFF",
        fontColor: "#383A42",
      });
      const DEFAULT_COLORS = [
        "#383A42",
        "#E45649",
        "#50A14F",
        "#B37901",
        "#0184BC",
        "#A626A4",
        "#0997B3",
        "#FAFAFA",
      ];
      const GRAPH_FONT_OPTIONS = [
        ["", "자동"],
        ["Arial, sans-serif", "Arial"],
        ["Helvetica, Arial, sans-serif", "Helvetica"],
        ["Open Sans, Arial, sans-serif", "Open Sans"],
        ["Verdana, sans-serif", "Verdana"],
        ["Times New Roman, serif", "Times New Roman"],
        ["Georgia, serif", "Georgia"],
        ["Courier New, monospace", "Courier New"],
      ];
      function fillGraphFontSelect(id) {
        let control = $(id);
        if (!control) return;
        control.innerHTML = GRAPH_FONT_OPTIONS.map(
          ([value, label]) => `<option value="${value}">${label}</option>`,
        ).join("");
      }
      function setGraphFontSelectValue(id, value) {
        let control = $(id),
          normalized = typeof value === "string" ? value : "";
        if (!control) return;
        if (
          normalized &&
          !Array.from(control.options).some((option) => option.value === normalized)
        ) {
          let option = document.createElement("option");
          option.value = normalized;
          option.textContent = `기존: ${normalized}`;
          option.dataset.custom = "true";
          control.append(option);
        }
        control.value = normalized;
      }
      function createProjectState() {
        return {
          kind: "fast-figure-project-object",
          meta: {
            projectName: "",
            appBuild: APP_BUILD,
          },
          layout: {
            gridRows: 2,
            gridCols: 2,
            layoutMapWidth: null,
            slotStyle: { ...DEFAULT_SLOT_STYLE },
          },
          annotations: {
            labels: {
              enabled: false,
              settings: {
                format: "lower-alpha",
                parentheses: false,
                x: 0,
                y: 0,
                order: "row-major",
                fontFamily: "system-ui, sans-serif",
                fontSize: 14,
              },
            },
            captions: {
              enabled: false,
              slotMode: false,
              text: "",
              afterText: "",
              name: "",
              nameBold: false,
              settings: {
                fontFamily: "system-ui, sans-serif",
                fontSize: 14,
                lineHeight: 1.45,
              },
            },
          },
          assets: {
            csvFiles: [],
            images: [],
          },
          fileSystem: {
            directories: ["/assets", "/assets/csv", "/assets/images", "/assets/trash"],
          },
          charts: [],
          slots: [],
          nextId: {
            csv: 1,
            image: 1,
            chart: 1,
          },
          appearance: {
            uiPalette: { ...DEFAULT_UI_PALETTE },
          },
        };
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
        get layoutMapWidth() {
          return this.layout.layoutMapWidth;
        }
        set layoutMapWidth(value) {
          this.layout.layoutMapWidth = value;
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
        get slotCaptionsEnabled() {
          return this.annotations.captions.slotMode;
        }
        set slotCaptionsEnabled(value) {
          this.annotations.captions.slotMode = value;
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
      }
      const activeProject = new ProjectObject();
      let rows = [],
        columns = [],
        editing = null,
        selectedSlotId = null,
        pendingSlotContentType = "graph",
        layoutSelected = new Set(),
        activeDataName = "",
        activeDataReady = false,
        activeCsvId = null,
        activeImageId = null,
        activeAssetKind = null,
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
        dashboardZoomLockedWidth = null,
        selectedExplorerDirectory = "/assets",
        selectedObjectIndex = null;
      const $ = (id) => document.getElementById(id),
        status = (t) => ($("status").textContent = t);
      let debugEnabled = false,
        debugSequence = 0;
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
        let out = $("debugLog");
        if (out) {
          out.textContent += line + "\n";
          let lines = out.textContent.split("\n");
          if (lines.length > 501) out.textContent = lines.slice(-501).join("\n");
          out.scrollTop = out.scrollHeight;
        }
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
      class ApplicationStateMachine {
        constructor(objects, definitions) {
          this.objects = objects;
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
          let definition = this.definition(region, state),
            names = definition.objects || [];
          return {
            machine: this,
            region,
            state,
            event,
            payload,
            direction: payload.direction || this.state.direction || "model-to-ui",
            canWrite: (scope) => !this.writeLocks.has(scope),
            objects: Object.fromEntries(names.map((name) => [name, this.objects.read(name)])),
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
        send(event, payload = {}) {
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
        run(lifecycle, event, task) {
          if (this.state.lifecycle !== "ready")
            return Promise.reject(
              Error(`현재 ${this.state.lifecycle} 상태에서는 ${event} 작업을 시작할 수 없습니다.`),
            );
          this.transition("lifecycle", lifecycle, `${event}:start`);
          let complete = (result) => {
              let outcome =
                result?.outcome === "rejected" ? "rejected" : result?.outcome || "complete";
              this.transition("lifecycle", "ready", `${event}:${outcome}`);
              return result;
            },
            fail = (error) => {
              this.state = Object.freeze({
                ...this.state,
                error: { event, message: error?.message || String(error) },
              });
              this.transition("lifecycle", "error", `${event}:failed`, { error });
              this.transition("lifecycle", "ready", `${event}:recovered`);
              throw error;
            };
          try {
            let result = task();
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
        ready() {
          this.transition("lifecycle", "ready", "READY");
          this.transition("workspace", workspaceStateFromModel(), "WORKSPACE_INIT", {
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
      function workspaceStateForSelection() {
        let slot = getSelectedSlot();
        if (!slot) return "project";
        return slot.contentType === "image" ? "slot.image" : "slot.graph";
      }
      function workspaceStateFromModel(slotId = selectedSlotId) {
        let slot = slotId == null ? null : slotAt(slotId);
        return !slot ? "project" : slot.contentType === "image" ? "slot.image" : "slot.graph";
      }
      function requestedWorkspaceState({ payload }) {
        return payload.direction === "model-to-fsm"
          ? workspaceStateFromModel(payload.slotId)
          : workspaceStateForSelection();
      }
      function applySlotSelectionAction({ machine, payload }) {
        let slot = payload.slotId == null ? null : slotAt(payload.slotId),
          same = !!slot && selectedSlotId === slot.id,
          hydrating = payload.direction === "model-to-fsm";
        machine.assertWritable("workspace", "SELECT_SLOT");
        selectedSlotId = !slot || (!hydrating && same) ? null : slot.id;
        editing = null;
        activeDataReady = false;
        activeCsvId = null;
        activeImageId = null;
        activeAssetKind = null;
        selectedObjectIndex = null;
        machine.state = Object.freeze({
          ...machine.state,
          graphObject: "none",
          graphObjectIndex: null,
        });
        if (!hydrating && activeProject.slotCaptionsEnabled && selectedSlotId !== null)
          initializeSlotCaption(slot);
        if (
          !hydrating &&
          selectedSlotId !== null &&
          !slot.chart &&
          !slot.imageId
        )
          slot.contentType = pendingSlotContentType;
      }
      function applySlotTypeAction({ machine, payload }) {
        machine.assertWritable("workspace", "SLOT_TYPE_CHANGED");
        let slot = getSelectedSlot();
        if (!slot) {
          pendingSlotContentType = payload.type;
          return;
        }
        slot.contentType = payload.type === "image" ? "image" : "graph";
        editing = null;
        activeDataReady = false;
        activeCsvId = null;
        activeImageId = null;
        activeAssetKind = null;
        selectedObjectIndex = null;
        machine.state = Object.freeze({
          ...machine.state,
          graphObject: "none",
          graphObjectIndex: null,
        });
      }
      function applyGraphObjectSelectionAction({ machine, payload }) {
        machine.assertWritable("editor", "SELECT_GRAPH_OBJECT");
        let slot = getSelectedSlot(),
          chart = slot?.chart ? getChart(slot.chart) : null,
          objects = ensureGraphObjects(chart),
          index = Number.isInteger(payload.index) ? payload.index : null;
        if (!slot || slot.contentType === "image" || !chart || index < 0 || index >= objects.length)
          index = null;
        selectedObjectIndex = index;
        machine.state = Object.freeze({
          ...machine.state,
          graphObjectIndex: index,
        });
      }
      function selectedGraphObjectGuard() {
        return (
          appFSM?.state.graphObject === "selected" &&
          Number.isInteger(appFSM.state.graphObjectIndex) &&
          appFSM.state.graphObjectIndex === selectedObjectIndex
        );
      }
      function applySlotCaptionModeAction({ machine, payload }) {
        machine.assertWritable("workspace", "SLOT_CAPTION_MODE_CHANGED");
        activeProject.slotCaptionsEnabled = payload.enabled === true;
        if (activeProject.slotCaptionsEnabled) {
          activeProject.captionsEnabled = true;
          initializeSlotCaptions();
        }
      }
      function applyCaptionTextAction({ machine, payload }) {
        machine.assertWritable("workspace", "CAPTION_TEXT_INPUT");
        let slot = activeSlotCaptionTarget();
        if (slot) slot.caption = String(payload.text || "");
        else activeProject.captionText = String(payload.text || "");
      }
      function applySlotCaptionsInsertedAction({ machine }) {
        machine.assertWritable("workspace", "SLOT_CAPTIONS_INSERTED");
        let inserted = slotCaptionSections()
          .map((section) => [section.label, section.text].filter(Boolean).join(" "))
          .join(" ");
        if (!inserted) return;
        activeProject.captionText += activeProject.captionText && !/\s$/.test(activeProject.captionText) ? ` ${inserted}` : inserted;
      }
      function applyDataObjectCreatedAction({ machine, payload }) {
        machine.assertWritable("data", "DATA_OBJECT_CREATED");
        machine.assertWritable("files", "DATA_OBJECT_CREATED");
        let model = payload.model;
        if (!model || activeProject.csvFiles.some((csv) => csv.id === model.id))
          throw Error(`CSV ID ${model?.id}가 중복되었습니다.`);
        projectVfs.prepare(model, "csv");
        activeProject.csvFiles.push(model);
        activeProject.csvId = Math.max(activeProject.csvId, model.id + 1);
      }
      function applyAssetObjectReplacedAction({ machine, payload }, kind) {
        let image = kind === "image",
          event = image ? "IMAGE_OBJECT_REPLACED" : "DATA_OBJECT_REPLACED",
          scope = image ? "images" : "data",
          collection = image ? activeProject.images : activeProject.csvFiles,
          model = payload.model,
          index = collection.findIndex((item) => item.id === model?.id),
          previous = index >= 0 ? collection[index] : null;
        machine.assertWritable(scope, event);
        machine.assertWritable("files", event);
        if (!previous || projectAssetPath(model) !== projectAssetPath(previous))
          throw Error(`교체할 ${image ? "이미지" : "CSV"} 또는 참조 경로가 올바르지 않습니다.`);
        if (image) model.settings = projectClone(previous.settings);
        else if (previous.isDefaultEmpty === true) model.isDefaultEmpty = true;
        try {
          let next = collection.map((item, itemIndex) => itemIndex === index ? model : item);
          if (image) activeProject.images = next;
          else activeProject.csvFiles = next;
          validateProjectObject(activeProject, { requireSlots: true });
        } catch (error) {
          if (image) activeProject.images = collection;
          else activeProject.csvFiles = collection;
          throw error;
        }
        if (image) releaseProjectImageDisplayUrl(previous);
        payload[image ? "image" : "csv"] = model;
      }
      function applyDataObjectReplacedAction(context) {
        applyAssetObjectReplacedAction(context, "csv");
      }
      function applyDataObjectDeletedAction({ machine, payload }) {
        machine.assertWritable("data", "DATA_OBJECT_DELETED");
        let csv = getProjectCsv(payload.csvId);
        if (csv?.isDefaultEmpty === true)
          throw Error("프로젝트 기본 빈 CSV는 삭제할 수 없습니다.");
        activeProject.csvFiles = activeProject.csvFiles.filter((item) => item.id !== payload.csvId);
        if (activeCsvId === payload.csvId) activeCsvId = null;
      }
      function applyImageObjectCreatedAction({ machine, payload }) {
        machine.assertWritable("images", "IMAGE_OBJECT_CREATED");
        machine.assertWritable("files", "IMAGE_OBJECT_CREATED");
        let model = payload.model;
        if (!model || activeProject.images.some((image) => image.id === model.id))
          throw Error(`이미지 ID ${model?.id}가 중복되었습니다.`);
        projectVfs.prepare(model, "image");
        activeProject.images.push(model);
        activeProject.imageId = Math.max(activeProject.imageId, model.id + 1);
      }
      function applyImageObjectReplacedAction(context) {
        applyAssetObjectReplacedAction(context, "image");
      }
      function applyImageObjectDeletedAction({ machine, payload }) {
        machine.assertWritable("images", "IMAGE_OBJECT_DELETED");
        if (activeProject.slots.some((slot) => slot.imageId === payload.imageId))
          throw Error("참조 슬롯을 초기화하지 않은 이미지는 삭제할 수 없습니다.");
        releaseProjectImageDisplayUrl(getProjectImage(payload.imageId));
        activeProject.images = activeProject.images.filter((item) => item.id !== payload.imageId);
      }
      function detachSlotChart(slot) {
        let chartId = slot?.chart;
        if (!Number.isInteger(chartId)) return null;
        slot.chart = null;
        if (!activeProject.slots.some((item) => item !== slot && item.chart === chartId)) {
          activeProject.charts = activeProject.charts.filter((chart) => chart.id !== chartId);
          if (editing?.id === chartId) editing = null;
        }
        return chartId;
      }
      function applySlotsResetAction({ machine, payload }) {
        machine.assertWritable("slots", "SLOTS_RESET");
        machine.assertWritable("charts", "SLOTS_RESET");
        machine.assertWritable("workspace", "SLOTS_RESET");
        machine.assertWritable("editor", "SLOTS_RESET");
        let slotIds = new Set(
            (Array.isArray(payload.slotIds) ? payload.slotIds : [payload.slotId])
              .map(Number)
              .filter(Number.isInteger),
          ),
          targets = activeProject.slots.filter((slot) => slotIds.has(slot.id)),
          chartIds = new Set(targets.map((slot) => slot.chart).filter(Number.isInteger));
        if (!targets.length) throw Error("초기화할 슬롯이 없습니다.");
        activeProject.charts = activeProject.charts.filter((chart) => !chartIds.has(chart.id));
        targets.forEach((slot) => {
          slot.chart = null;
          slot.imageId = null;
          slot.contentType = "graph";
        });
        if (editing && chartIds.has(editing.id)) editing = null;
        selectedObjectIndex = null;
        rows = [];
        columns = [];
        activeDataName = "";
        activeDataReady = false;
        activeCsvId = null;
        activeImageId = null;
        activeAssetKind = null;
        $("file").value = "";
        payload.resetCount = targets.length;
        payload.removedChartIds = [...chartIds];
      }
      function applySlotsSwappedAction({ machine, payload }) {
        machine.assertWritable("slots", "SLOTS_SWAPPED");
        machine.assertWritable("workspace", "SLOTS_SWAPPED");
        machine.assertWritable("editor", "SLOTS_SWAPPED");
        let source = slotAt(Number(payload.sourceSlotId)),
          target = slotAt(Number(payload.targetSlotId));
        if (!source || !target || source === target || source.hidden || target.hidden)
          throw Error("교환할 슬롯이 올바르지 않습니다.");
        let sourceContent = source.content,
          targetContent = target.content,
          previous = {
            selectedSlotId,
            editing,
            selectedObjectIndex,
            activeDataReady,
            activeCsvId,
            activeImageId,
            activeAssetKind,
          };
        try {
          source.content = targetContent;
          target.content = sourceContent;
          if (selectedSlotId === source.id) selectedSlotId = target.id;
          else if (selectedSlotId === target.id) selectedSlotId = source.id;
          editing = null;
          selectedObjectIndex = null;
          activeDataReady = false;
          activeCsvId = null;
          activeImageId = null;
          activeAssetKind = null;
          validateProjectObject(activeProject, { requireSlots: true });
        } catch (error) {
          source.content = sourceContent;
          target.content = targetContent;
          selectedSlotId = previous.selectedSlotId;
          editing = previous.editing;
          selectedObjectIndex = previous.selectedObjectIndex;
          activeDataReady = previous.activeDataReady;
          activeCsvId = previous.activeCsvId;
          activeImageId = previous.activeImageId;
          activeAssetKind = previous.activeAssetKind;
          throw error;
        }
        [source, target].forEach((slot) => {
          if (slotImage(slot)) normalizeImageSettings(slotImage(slot));
        });
        payload.slotId = selectedSlotId;
        debugLog("slot:swap", {
          sourceSlotId: source.id,
          targetSlotId: target.id,
          sourceChartBefore: sourceContent.chart || null,
          targetChartBefore: targetContent.chart || null,
          sourceChartAfter: source.chart || null,
          targetChartAfter: target.chart || null,
        });
        renderDashboard();
        status(
          `${source.row}행 ${source.col}열과 ${target.row}행 ${target.col}열의 슬롯 내용을 교환했습니다.`,
        );
        auditApp("slot:swap");
      }
      function applySlotImageLinkedAction({ machine, payload }) {
        machine.assertWritable("slots", "SLOT_IMAGE_LINKED");
        machine.assertWritable("charts", "SLOT_IMAGE_LINKED");
        machine.assertWritable("editor", "SLOT_IMAGE_LINKED");
        let slot = slotAt(payload.slotId);
        if (!slot || slot.contentType !== "image" || !getProjectImage(payload.imageId))
          throw Error("이미지를 연결할 슬롯 또는 이미지가 없습니다.");
        let previous = {
          charts: activeProject.charts,
          slotChart: slot.chart,
          slotImageId: slot.imageId,
          editing,
          selectedObjectIndex,
        };
        try {
          detachSlotChart(slot);
          slot.imageId = payload.imageId;
          editing = null;
          selectedObjectIndex = null;
          validateProjectObject(activeProject, { requireSlots: true });
        } catch (error) {
          activeProject.charts = previous.charts;
          slot.chart = previous.slotChart;
          slot.imageId = previous.slotImageId;
          editing = previous.editing;
          selectedObjectIndex = previous.selectedObjectIndex;
          throw error;
        }
        machine.state = Object.freeze({
          ...machine.state,
          graphObject: "none",
          graphObjectIndex: null,
        });
      }
      function applySlotDataConnectedAction({ machine, payload }) {
        machine.assertWritable("slots", "SLOT_DATA_CONNECTED");
        machine.assertWritable("charts", "SLOT_DATA_CONNECTED");
        machine.assertWritable("editor", "SLOT_DATA_CONNECTED");
        let slot = slotAt(payload.slotId),
          csv = getProjectCsv(payload.csvId);
        if (!slot || (!payload.replaceSlotContent && slot.contentType === "image") || !csv)
          throw Error("데이터를 연결할 슬롯 또는 CSV가 없습니다.");
        if (slot.chart && !payload.replaceSlotContent && getChart(slot.chart)?.editor?.editable === false)
          throw Error("편집 가능 토글을 켠 뒤 CSV를 추가하세요.");
        let previous = payload.replaceSlotContent
          ? {
              charts: activeProject.charts,
              chartId: activeProject.chartId,
              slotChart: slot.chart,
              slotImageId: slot.imageId,
              slotContentType: slot.contentType,
              editing,
              selectedObjectIndex,
              activeCsvId,
            }
          : null;
        try {
          if (payload.replaceSlotContent) {
            activeProject.charts = [...activeProject.charts];
            detachSlotChart(slot);
            slot.imageId = null;
            slot.contentType = "graph";
            selectedObjectIndex = null;
          }
          payload.chart = connectDataToSlotModel(slot, csv.rows, csv.name, csv);
          if (payload.replaceSlotContent)
            validateProjectObject(activeProject, { requireSlots: true });
        } catch (error) {
          if (previous) {
            activeProject.charts = previous.charts;
            activeProject.chartId = previous.chartId;
            slot.chart = previous.slotChart;
            slot.imageId = previous.slotImageId;
            slot.contentType = previous.slotContentType;
            editing = previous.editing;
            selectedObjectIndex = previous.selectedObjectIndex;
            activeCsvId = previous.activeCsvId;
          }
          throw error;
        }
      }
      function applyGraphObjectsReplacedAction({ machine, payload }) {
        machine.assertWritable("charts", "GRAPH_OBJECTS_REPLACED");
        let chart = getChart(payload.chartId);
        if (!chart || !chart.editor || chart.editor.editable === false)
          throw Error("그래프 오브젝트를 변경할 편집 가능 차트가 없습니다.");
        let objects = Array.isArray(payload.objects) ? [...payload.objects] : [];
        if (!objects.length) {
          let csv = ensureDefaultCsv(),
            selection = graphDataSelection(csv.rows, csv.headerLines, chart.editor);
          objects = [
            {
              ...baseGraphObject(chart, csv),
              csvId: csv.id,
              ...selection,
            },
          ];
          payload.recovered = true;
        }
        chart.editor.objects = objects;
        ensureGraphObjects(chart);
        if (editing?.id === chart.id) editing = chart;
        if (
          selectedObjectIndex !== null &&
          selectedObjectIndex >= chart.editor.objects.length
        )
          selectedObjectIndex = null;
        rebuildEditableGraph(chart);
        payload.chart = chart;
      }
      function applyChartLayoutChangedAction({ machine, payload }) {
        machine.assertWritable("charts", "CHART_LAYOUT_CHANGED");
        machine.assertWritable("editor", "CHART_LAYOUT_CHANGED");
        let slot = slotAt(payload.slotId),
          chart = slot?.chart ? getChart(slot.chart) : null;
        if (
          !slot ||
          slot.contentType === "image" ||
          !chart ||
          chart.id !== payload.chartId
        )
          throw Error("전역 설정을 변경할 그래프 슬롯 또는 차트가 없습니다.");
        if (chart.editor?.editable === false)
          throw Error("편집 가능 토글을 켠 뒤 설정을 변경하세요.");
        if (!payload.globalSettings || typeof payload.globalSettings !== "object")
          throw Error("적용할 그래프 전역 설정이 없습니다.");
        chart.editor.title = String(payload.title || "");
        chart.editor.globalSettings = projectClone(payload.globalSettings);
        chart.graph.layout = layout(chart);
        if (editing?.id === chart.id) editing = chart;
        payload.chart = chart;
        payload.layout = chart.graph.layout;
      }
      function applyChartModelReplacedAction({ machine, payload }) {
        machine.assertWritable("charts", "CHART_MODEL_REPLACED");
        machine.assertWritable("editor", "CHART_MODEL_REPLACED");
        let slot = slotAt(payload.slotId),
          chart = payload.chart,
          index = activeProject.charts.findIndex((item) => item.id === payload.chartId);
        if (
          !slot ||
          slot.contentType === "image" ||
          slot.chart !== payload.chartId ||
          !chart ||
          chart.id !== payload.chartId ||
          index < 0
        )
          throw Error("교체할 그래프 슬롯 또는 차트가 없습니다.");
        if (!chart.editor || chart.editor.editable === false)
          throw Error("편집 가능한 차트 모델이 아닙니다.");
        rebuildEditableGraph(chart);
        activeProject.charts[index] = chart;
        editing = chart;
        payload.chart = chart;
      }
      function applySlotImageImportedAction({ machine, payload }) {
        machine.assertWritable("slots", "SLOT_IMAGE_IMPORTED");
        machine.assertWritable("images", "SLOT_IMAGE_IMPORTED");
        machine.assertWritable("charts", "SLOT_IMAGE_IMPORTED");
        machine.assertWritable("workspace", "SLOT_IMAGE_IMPORTED");
        machine.assertWritable("editor", "SLOT_IMAGE_IMPORTED");
        machine.assertWritable("files", "SLOT_IMAGE_IMPORTED");
        let slot = slotAt(payload.slotId),
          model = payload.model,
          image = model || getProjectImage(payload.imageId);
        if (
          !slot ||
          !image ||
          !Number.isInteger(image.id) ||
          image.id < 1 ||
          typeof image.name !== "string" ||
          typeof image.bytesBase64 !== "string" ||
          !image.bytesBase64 ||
          !image.settings ||
          typeof image.settings !== "object" ||
          Array.isArray(image.settings) ||
          (model && activeProject.images.some((item) => item.id === model.id))
        )
          throw Error("이미지를 연결할 슬롯 또는 이미지가 없습니다.");
        let previous = {
          fileSystem: projectClone(activeProject.fileSystem),
          images: activeProject.images,
          imageId: activeProject.imageId,
          charts: activeProject.charts,
          slotChart: slot.chart,
          slotImageId: slot.imageId,
          slotContentType: slot.contentType,
          editing,
          selectedObjectIndex,
        };
        try {
          if (model) {
            projectVfs.prepare(model, "image");
            activeProject.images = [...activeProject.images, model];
            activeProject.imageId = Math.max(activeProject.imageId, model.id + 1);
          }
          detachSlotChart(slot);
          slot.contentType = "image";
          slot.imageId = image.id;
          if (slot.id === selectedSlotId) {
            editing = null;
            selectedObjectIndex = null;
          }
          validateProjectObject(activeProject, { requireSlots: true });
        } catch (error) {
          activeProject.fileSystem = previous.fileSystem;
          activeProject.images = previous.images;
          activeProject.imageId = previous.imageId;
          activeProject.charts = previous.charts;
          slot.chart = previous.slotChart;
          slot.imageId = previous.slotImageId;
          slot.contentType = previous.slotContentType;
          editing = previous.editing;
          selectedObjectIndex = previous.selectedObjectIndex;
          throw error;
        }
        payload.image = image;
        if (slot.id === selectedSlotId) {
          machine.state = Object.freeze({
            ...machine.state,
            graphObject: "none",
            graphObjectIndex: null,
          });
        }
      }
      function applySlotChartImportedAction({ machine, payload }) {
        machine.assertWritable("slots", "SLOT_CHART_IMPORTED");
        machine.assertWritable("data", "SLOT_CHART_IMPORTED");
        machine.assertWritable("charts", "SLOT_CHART_IMPORTED");
        machine.assertWritable("workspace", "SLOT_CHART_IMPORTED");
        machine.assertWritable("editor", "SLOT_CHART_IMPORTED");
        machine.assertWritable("files", "SLOT_CHART_IMPORTED");
        let slot = slotAt(payload.slotId),
          sourceChart = payload.chart,
          packagedCsvFiles = Array.isArray(payload.csvFiles) ? payload.csvFiles : [],
          packagedIds = new Set(),
          nextCsvId = activeProject.csvId,
          defaultCsv = activeProject.csvFiles.find((csv) => csv.isDefaultEmpty === true),
          csvMap = new Map(defaultCsv ? [[0, defaultCsv.id]] : []),
          csvModels = packagedCsvFiles.map((source) => {
            if (
              !source ||
              !Number.isInteger(source.id) ||
              source.id < 1 ||
              packagedIds.has(source.id) ||
              !Array.isArray(source.rows)
            )
              throw Error("FFSX CSV 데이터가 올바르지 않습니다.");
            packagedIds.add(source.id);
            let model = buildProjectCsvModel(
              source.rows,
              source.name || source.sourceName,
              nextCsvId++,
              source.bytesBase64,
              source.mime,
              source.headerLines,
            );
            csvMap.set(source.id, model.id);
            return model;
          });
        if (!slot || !sourceChart)
          throw Error("불러온 차트를 적용할 슬롯 또는 차트가 없습니다.");
        let chart = projectClone(sourceChart),
          oldId = slot?.chart,
          index = activeProject.charts.findIndex((item) => item.id === oldId),
          shared = activeProject.slots.some((item) => item !== slot && item.chart === oldId);
        (chart.editor?.objects || []).forEach((object) => {
          if (csvMap.has(object.csvId)) object.csvId = csvMap.get(object.csvId);
        });
        validateChartModel(chart, "불러온 슬롯 차트", [
          ...activeProject.csvFiles,
          ...csvModels,
        ]);
        let previous = {
          fileSystem: projectClone(activeProject.fileSystem),
          csvFiles: activeProject.csvFiles,
          csvId: activeProject.csvId,
          charts: activeProject.charts,
          chartId: activeProject.chartId,
          slotChart: slot.chart,
          slotImageId: slot.imageId,
          slotContentType: slot.contentType,
          slotCaption: slot.caption,
          editing,
          selectedObjectIndex,
        };
        try {
          csvModels.forEach((model) => {
            projectVfs.prepare(model, "csv");
            activeProject.csvFiles = [...activeProject.csvFiles, model];
          });
          activeProject.csvId = nextCsvId;
          chart.id = activeProject.chartId++;
          activeProject.charts =
            index >= 0 && !shared
              ? activeProject.charts.map((item, chartIndex) =>
                  chartIndex === index ? chart : item,
                )
              : [...activeProject.charts, chart];
          slot.chart = chart.id;
          slot.imageId = null;
          slot.contentType = "graph";
          if (payload.slotCaption !== undefined)
            slot.caption =
              payload.slotCaption === `${slotLabel(slot)} 슬롯 캡션`
                ? "슬롯 캡션"
                : payload.slotCaption;
          editing = chart;
          selectedObjectIndex = null;
          validateProjectObject(activeProject, { requireSlots: true });
        } catch (error) {
          activeProject.fileSystem = previous.fileSystem;
          activeProject.csvFiles = previous.csvFiles;
          activeProject.csvId = previous.csvId;
          activeProject.charts = previous.charts;
          activeProject.chartId = previous.chartId;
          slot.chart = previous.slotChart;
          slot.imageId = previous.slotImageId;
          slot.contentType = previous.slotContentType;
          slot.caption = previous.slotCaption;
          editing = previous.editing;
          selectedObjectIndex = previous.selectedObjectIndex;
          throw error;
        }
        machine.state = Object.freeze({
          ...machine.state,
          graphObject: "none",
          graphObjectIndex: null,
        });
        payload.chart = chart;
        payload.createdCsvIds = csvModels.map((csv) => csv.id);
      }
      function applyGridLayoutChangedAction({ machine, payload }) {
        machine.assertWritable("layout", "GRID_LAYOUT_CHANGED");
        machine.assertWritable("slots", "GRID_LAYOUT_CHANGED");
        machine.assertWritable("workspace", "GRID_LAYOUT_CHANGED");
        machine.assertWritable("editor", "GRID_LAYOUT_CHANGED");
        rebuildGridSlots(payload.rows, payload.cols);
      }
      function applyProjectDirectoryCreatedAction({ machine, payload }) {
        machine.assertWritable("files", "PROJECT_DIRECTORY_CREATED");
        projectVfs.ensure(activeProject._state);
        let parent = normalizeProjectPath(payload.parent || "/assets", { directory: true }),
          rawName = String(payload.name || "").trim(),
          name = projectCsvName(rawName, "");
        if (parent !== "/" && !activeProject.fileSystem.directories.includes(parent))
          throw Error(`상위 폴더 ${parent}가 없습니다.`);
        if (!name || name !== rawName || /[\\/]/.test(rawName))
          throw Error("폴더 이름이 올바르지 않습니다.");
        let path = normalizeProjectPath(`${parent}/${name}`, { directory: true });
        if (projectVfs.exists(path)) throw Error(`${path}가 이미 존재합니다.`);
        activeProject.fileSystem.directories.push(path);
        activeProject.fileSystem.directories.sort();
        payload.path = path;
      }
      function projectAssetReferenceCount(csvIds, imageIds) {
        return activeProject.charts.reduce(
          (count, chart) => count + chartCsvIds(chart).filter((id) => csvIds.has(id)).length,
          0,
        ) + activeProject.slots.filter((slot) => imageIds.has(slot.imageId)).length;
      }
      function removeProjectAssetReferences(csvIds, imageIds) {
        let removedGraphReferenceCount = 0,
          resetImageSlotCount = 0;
        activeProject.charts.forEach((chart) => {
          if (!Array.isArray(chart.editor?.objects)) return;
          let objects = chart.editor.objects.filter((object) => !csvIds.has(object.csvId));
          removedGraphReferenceCount += chart.editor.objects.length - objects.length;
          if (objects.length === chart.editor.objects.length) return;
          if (!objects.length && chart.editor.editable !== false) {
            let defaultCsv = activeProject.csvFiles.find((csv) => csv.isDefaultEmpty === true);
            if (defaultCsv) {
              let selection = graphDataSelection(defaultCsv.rows, defaultCsv.headerLines, chart.editor);
              objects = [{ ...baseGraphObject(chart, defaultCsv), ...selection }];
            }
          }
          chart.editor.objects = objects;
          if (chart.editor.editable !== false) rebuildEditableGraph(chart);
        });
        activeProject.slots.forEach((slot) => {
          if (!imageIds.has(slot.imageId)) return;
          resetImageSlotCount += 1;
          slot.imageId = null;
          slot.chart = null;
          slot.contentType = "graph";
        });
        return { removedGraphReferenceCount, resetImageSlotCount };
      }
      function applyProjectTrashEmptiedAction({ machine, payload }) {
        machine.assertWritable("files", "PROJECT_TRASH_EMPTIED");
        machine.assertWritable("data", "PROJECT_TRASH_EMPTIED");
        machine.assertWritable("images", "PROJECT_TRASH_EMPTIED");
        let csvFiles = activeProject.csvFiles.filter((csv) => projectVfs.isTrashed(projectAssetPath(csv))),
          images = activeProject.images.filter((image) => projectVfs.isTrashed(projectAssetPath(image))),
          directories = activeProject.fileSystem.directories.filter(
            (path) => path !== PROJECT_TRASH_DIRECTORY && projectVfs.isTrashed(path),
          ),
          csvIds = new Set(csvFiles.map((csv) => csv.id)),
          imageIds = new Set(images.map((image) => image.id));
        if (csvFiles.some((csv) => csv.isDefaultEmpty === true))
          throw Error("프로젝트 기본 빈 CSV는 휴지통에 있을 수 없습니다.");
        let hasReferences = projectAssetReferenceCount(csvIds, imageIds) > 0;
        if (hasReferences) {
          machine.assertWritable("charts", "PROJECT_TRASH_EMPTIED");
          machine.assertWritable("slots", "PROJECT_TRASH_EMPTIED");
          machine.assertWritable("editor", "PROJECT_TRASH_EMPTIED");
        }
        let removedReferences = removeProjectAssetReferences(csvIds, imageIds);
        images.forEach(releaseProjectImageDisplayUrl);
        activeProject.csvFiles = activeProject.csvFiles.filter((csv) => !csvIds.has(csv.id));
        activeProject.images = activeProject.images.filter((image) => !imageIds.has(image.id));
        activeProject.fileSystem.directories = activeProject.fileSystem.directories.filter(
          (path) => path === PROJECT_TRASH_DIRECTORY || !projectVfs.isTrashed(path),
        );
        payload.csvCount = csvFiles.length;
        payload.imageCount = images.length;
        payload.directoryCount = directories.length;
        payload.removedReferenceCount =
          removedReferences.removedGraphReferenceCount + removedReferences.resetImageSlotCount;
        validateProjectObject(activeProject, { requireSlots: true });
      }
      function applyProjectNodeMovedAction({ machine, payload }) {
        machine.assertWritable("files", "PROJECT_NODE_MOVED");
        let match = projectVfs.resolve(payload.path),
          directory = normalizeProjectPath(payload.directory, { directory: true });
        if (!match) throw Error("이동할 프로젝트 파일 또는 폴더가 없습니다.");
        if (!activeProject.fileSystem.directories.includes(directory))
          throw Error("대상 폴더가 없습니다.");
        let source = match.kind === "directory" ? match.path : projectAssetPath(match.asset);
        if (match.kind === "directory") {
          if (projectVfs.isFixedDirectory(source))
            throw Error("기본 프로젝트 폴더는 이동할 수 없습니다.");
          if (projectPathInDirectory(directory, source))
            throw Error("폴더를 자기 자신 또는 하위 폴더로 이동할 수 없습니다.");
        }
        let movingAssets = match.kind === "directory"
            ? projectVfs.descendants(source)
            : [{ kind: match.kind, asset: match.asset }],
          protectedCsv = movingAssets.find(
            ({ kind, asset }) => kind === "csv" && asset.isDefaultEmpty === true,
          );
        if (protectedCsv) throw Error("프로젝트 기본 빈 CSV는 이동할 수 없습니다.");
        if (movingAssets.some(({ kind }) => kind === "csv"))
          machine.assertWritable("data", "PROJECT_NODE_MOVED");
        if (movingAssets.some(({ kind }) => kind === "image"))
          machine.assertWritable("images", "PROJECT_NODE_MOVED");
        let destination = normalizeProjectPath(`${directory}/${projectPathName(source)}`, {
          directory: match.kind === "directory",
        });
        if (destination === source) return;
        if (projectVfs.exists(destination)) throw Error(`${destination}가 이미 존재합니다.`);
        let enteringTrash = projectVfs.isTrashed(destination) && !projectVfs.isTrashed(source);
        if (enteringTrash) {
          machine.assertWritable("charts", "PROJECT_NODE_MOVED");
          machine.assertWritable("slots", "PROJECT_NODE_MOVED");
          machine.assertWritable("editor", "PROJECT_NODE_MOVED");
        }
        let rewritePath = (path) =>
          match.kind === "directory" && projectPathInDirectory(path, source)
            ? `${destination}${path.slice(source.length)}`
            : destination;
        if (match.kind === "directory") {
          activeProject.fileSystem.directories = activeProject.fileSystem.directories
            .map((path) => projectPathInDirectory(path, source) ? rewritePath(path) : path)
            .sort();
          movingAssets.forEach(({ asset }) => {
            asset.directory = projectParentPath(rewritePath(projectAssetPath(asset)));
          });
        } else match.asset.directory = directory;
        if (enteringTrash) {
          let csvIds = new Set(
              movingAssets.filter(({ kind }) => kind === "csv").map(({ asset }) => asset.id),
            ),
            imageIds = new Set(
              movingAssets.filter(({ kind }) => kind === "image").map(({ asset }) => asset.id),
            ),
            removedReferences = removeProjectAssetReferences(csvIds, imageIds),
            removedGraphReference = removedReferences.removedGraphReferenceCount > 0,
            resetImageSlot = removedReferences.resetImageSlotCount > 0;
          selectedObjectIndex = null;
          if (csvIds.has(activeCsvId)) activeCsvId = null;
          if (imageIds.has(activeImageId)) activeImageId = null;
          if (machine.state.assetPath && projectVfs.isTrashed(rewritePath(machine.state.assetPath))) {
            payload.clearAssetSelection = true;
          }
          payload.clearGraphSelection = removedGraphReference || resetImageSlot;
        } else if (machine.state.assetPath && projectPathInDirectory(machine.state.assetPath, source)) {
          machine.state = Object.freeze({
            ...machine.state,
            assetPath: rewritePath(machine.state.assetPath),
          });
        }
        validateProjectObject(activeProject, { requireSlots: true });
        payload.path = destination;
        payload.trashed = enteringTrash;
      }
      function applyAssetSelectionAction({ machine, payload }) {
        let kind = ["csv", "image", "directory"].includes(payload.kind) ? payload.kind : null,
          match = payload.path ? projectVfs.resolve(payload.path) : null,
          asset = match?.kind === kind ? match.asset : null,
          path = kind === "directory" && match?.kind === "directory" ? match.path : asset ? projectAssetPath(asset) : null;
        if (!path) {
          kind = null;
        }
        activeAssetKind = kind;
        if (kind === "csv") {
          activeCsvId = asset.id;
          activeImageId = null;
        } else if (kind === "image") {
          activeCsvId = null;
          activeImageId = asset.id;
        } else {
          activeCsvId = null;
          activeImageId = null;
        }
        machine.state = Object.freeze({
          ...machine.state,
          assetPath: path ?? null,
        });
      }
      function assetSelectionTarget({ payload }) {
        let match = payload.path ? projectVfs.resolve(payload.path) : null;
        if (match?.kind === payload.kind) return payload.kind;
        return "none";
      }
      function syncAssetSelectionState() {
        updateFileAvailability();
        renderProjectDataTree(projectDataTreeObjects());
      }
      function requestedOverlayState({ state, payload }) {
        return state === payload.overlay ? "none" : payload.overlay;
      }
      function syncSettingToggle(idOrButton, active, labels = null) {
        let button =
          typeof idOrButton === "string" ? $(idOrButton) : idOrButton;
        if (!button) return;
        button.dataset.active = String(active);
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
        if (labels) button.textContent = labels[active ? 1 : 0];
      }
      function syncLabelControlsFromObject(label) {
        if (!label) return;
        syncSettingToggle("labelEnabled", label.enabled, ["표시 안 함", "표시"]);
        $("labelFormat").value = label.settings.format;
        syncSettingToggle("labelParentheses", label.settings.parentheses === true);
        $("labelOrder").value = label.settings.order;
        $("labelFontFamily").value = label.settings.fontFamily;
        $("labelFontSize").value = label.settings.fontSize;
        $("labelPositionX").value = label.settings.x;
        $("labelPositionY").value = label.settings.y;
        renderLabelPreview();
      }
      function syncCaptionControlsFromObject(caption) {
        if (!caption) return;
        let slot = activeSlotCaptionTarget(),
          view = activeCaptionView(caption);
        syncSettingToggle("captionEnabled", caption.enabled, ["표시 안 함", "표시"]);
        syncSettingToggle(
          "slotCaptionMode",
          caption.slotMode,
          ["슬롯별 캡션", "슬롯별 캡션 사용 중"],
        );
        $("captionTargetInfo").textContent = slot
          ? `${slotLabel(slot)} 슬롯 캡션 편집`
          : "전체 캡션 편집";
        $("captionName").value = caption.name;
        $("captionName").disabled = !!slot;
        syncSettingToggle("captionNameBold", caption.nameBold, ["이름 굵게", "이름 굵게"]);
        $("captionNameBold").disabled = !!slot;
        $("captionFontFamily").value = caption.settings.fontFamily;
        $("captionFontSize").value = caption.settings.fontSize;
        $("captionLineHeight").value = caption.settings.lineHeight;
        syncDashboardCaption(view);
      }
      function syncLegacyProjectWorkspacePresentation({ objects, availability } = {}) {
        $("targetInfo").textContent = "빈 슬롯 또는 그래프를 선택하세요.";
        setFileName();
        clearPreview();
        updateFileAvailability(availability);
        refreshImageControls();
        renderProjectDataTree(objects);
        syncLabelControlsFromObject(objects?.labels || projectObjects.read("labels"));
        syncCaptionControlsFromObject(objects?.captions || projectObjects.read("captions"));
        $("buildBox").classList.add("hidden");
        $("imageBox").classList.add("hidden");
      }
      function syncProjectWorkspaceState({ objects } = {}) {
        let domain = syncProjectWorkspaceDomainState();
        syncLegacyProjectWorkspacePresentation({ objects, ...domain });
      }
      function syncLegacyGraphWorkspacePresentation({ objects, slot, availability, selection }) {
        $("targetInfo").textContent = `선택한 슬롯: ${slot.row}행 ${slot.col}열`;
        updateFileAvailability(availability);
        if (selection) syncLegacyGraphEditorSelection(selection);
        else if (!slot.chart) {
          setFileName();
          clearPreview();
          $("buildBox").classList.add("hidden");
        }
        renderProjectDataTree(objects);
        syncCaptionControlsFromObject(projectObjects.read("captions"));
      }
      function syncGraphWorkspaceState({ objects } = {}) {
        let domain = syncGraphWorkspaceDomainState();
        if (!domain) return;
        syncLegacyGraphWorkspacePresentation({ objects, ...domain });
      }
      function syncLegacyImageWorkspacePresentation({ objects, slot, availability }) {
        $("targetInfo").textContent = `선택한 슬롯: ${slot.row}행 ${slot.col}열`;
        updateFileAvailability(availability);
        setFileName(slotImage(slot)?.name);
        clearPreview();
        $("buildBox").classList.add("hidden");
        refreshImageControls(slot.imageId);
        renderProjectDataTree(objects);
        syncCaptionControlsFromObject(projectObjects.read("captions"));
      }
      function syncImageWorkspaceState({ objects } = {}) {
        let domain = syncImageWorkspaceDomainState();
        if (!domain) return;
        syncLegacyImageWorkspacePresentation({ objects, ...domain });
      }
      function exitLegacyGraphWorkspacePresentation() {
        $("buildBox").classList.add("hidden");
      }
      function exitGraphWorkspaceState() {
        exitGraphWorkspaceDomainState();
        exitLegacyGraphWorkspacePresentation();
      }
      function exitImageWorkspaceState() {
        $("imageBox").classList.add("hidden");
      }
      function setOverlayDomState(name) {
        let panels = {
            layout: "layoutPanel",
            label: "labelPanel",
            caption: "captionPanel",
            print: "printPanel",
          },
          toggles = {
            layout: "layoutToggle",
            label: "labelToggle",
            caption: "captionToggle",
            print: "printToggle",
          };
        Object.entries(panels).forEach(([key, id]) => {
          $(id).classList.toggle("hidden", key !== name);
        });
        Object.entries(toggles).forEach(([key, id]) => {
          let active = key === name;
          $(id).classList.toggle("active", active);
          $(id).dataset.active = String(active);
          $(id).setAttribute("aria-expanded", String(active));
        });
        let main = $("dashboard").closest("main"),
          popup = Object.prototype.hasOwnProperty.call(panels, name);
        main.classList.toggle("layout-open", name === "layout");
        main.classList.toggle("dashboard-popup-open", popup);
        $("layoutToggle").textContent = "레이아웃";
        if (name !== "readme" && $("readmeDialog").open) $("readmeDialog").close();
        if (name === "readme" && !$("readmeDialog").open) {
          $("readmeDialog").showModal();
          $("readmeDialog").focus({ preventScroll: true });
          requestAnimationFrame(() => ($("readmeDialog").scrollTop = 0));
        }
      }
      function enterOverlayDomainState({ state }) {
        return applyOverlayOpenPolicy(state);
      }
      function syncLegacyOverlayPresentation({ state, objects }) {
        if (state === "layout") {
          renderLayout();
          requestAnimationFrame(() => {
            syncLayoutMapSize();
            let map = $("layoutMap");
            debugLog("layoutPanel:open", {
              mapWidth: Math.round(map.getBoundingClientRect().width),
              mapHeight: Math.round(map.getBoundingClientRect().height),
              panelHeight: Math.round($("layoutPanel").getBoundingClientRect().height),
            });
          });
        } else if (state === "label") syncLabelControlsFromObject(objects.labels);
        else if (state === "caption") syncCaptionControlsFromObject(objects.captions);
        else if (state === "print") {
          $("printWidth").value = Math.max(100, Math.round(dashboardReferenceWidth()));
          $("printHeight").value = "";
          syncPopupBounds();
        }
      }
      function enterOverlayState(context) {
        setOverlayDomState(context.state);
        enterOverlayDomainState(context);
        syncLegacyOverlayPresentation(context);
      }
      function exitOverlayState({ state }) {
        let panelId = {
            layout: "layoutPanel",
            label: "labelPanel",
            caption: "captionPanel",
            print: "printPanel",
          }[state],
          toggleId = {
            layout: "layoutToggle",
            label: "labelToggle",
            caption: "captionToggle",
            print: "printToggle",
          }[state];
        if (panelId) $(panelId).classList.add("hidden");
        if (toggleId) {
          $(toggleId).classList.remove("active");
          $(toggleId).dataset.active = "false";
          $(toggleId).setAttribute("aria-expanded", "false");
        }
        if (state === "layout")
          $("dashboard").closest("main").classList.remove("layout-open");
        if (state === "readme" && $("readmeDialog").open) $("readmeDialog").close();
      }
      function syncLegacyLifecyclePresentation({ state }) {
        let busy = state === "importing" || state === "exporting";
        document.body.classList.toggle("app-busy", busy);
        document.body.setAttribute("aria-busy", String(busy));
        [
          "importProject",
          "importSlotJson",
          "exportProject",
          "exportSlotJson",
          "exportPlotlyJson",
          "savePrint",
          "capturePrint",
        ].forEach((id) => {
          let control = $(id);
          if (!control) return;
          if (busy) {
            if (!Object.prototype.hasOwnProperty.call(control.dataset, "fsmWasDisabled"))
              control.dataset.fsmWasDisabled = String(control.disabled);
            control.disabled = true;
          } else if (Object.prototype.hasOwnProperty.call(control.dataset, "fsmWasDisabled")) {
            control.disabled = control.dataset.fsmWasDisabled === "true";
            delete control.dataset.fsmWasDisabled;
          }
        });
      }
      function enterLifecycleState(context) {
        syncLegacyLifecyclePresentation(context);
        applyLifecycleDomainState(context);
      }
      const SHARED_WORKSPACE_EVENTS = {
          SELECT_SLOT: {
            action: applySlotSelectionAction,
            target: requestedWorkspaceState,
          },
          SLOT_TYPE_CHANGED: {
            action: applySlotTypeAction,
            target: requestedWorkspaceState,
          },
          SLOT_CAPTION_MODE_CHANGED: {
            action: applySlotCaptionModeAction,
            target: ({ state }) => state,
          },
          CAPTION_TEXT_INPUT: {
            action: applyCaptionTextAction,
            target: ({ state }) => state,
          },
          SLOT_CAPTIONS_INSERTED: {
            action: applySlotCaptionsInsertedAction,
            target: ({ state }) => state,
          },
          PROJECT_DIRECTORY_CREATED: {
            action: applyProjectDirectoryCreatedAction,
            target: ({ state }) => state,
          },
          PROJECT_NODE_MOVED: {
            action: applyProjectNodeMovedAction,
            target: requestedWorkspaceState,
          },
          PROJECT_TRASH_EMPTIED: {
            action: applyProjectTrashEmptiedAction,
            target: ({ state }) => state,
          },
          DATA_OBJECT_CREATED: {
            action: applyDataObjectCreatedAction,
            target: ({ state }) => state,
          },
          DATA_OBJECT_REPLACED: {
            action: applyDataObjectReplacedAction,
            target: ({ state }) => state,
          },
          DATA_OBJECT_DELETED: {
            action: applyDataObjectDeletedAction,
            target: ({ state }) => state,
          },
          IMAGE_OBJECT_CREATED: {
            action: applyImageObjectCreatedAction,
            target: ({ state }) => state,
          },
          IMAGE_OBJECT_REPLACED: {
            action: applyImageObjectReplacedAction,
            target: ({ state }) => state,
          },
          IMAGE_OBJECT_DELETED: {
            action: applyImageObjectDeletedAction,
            target: ({ state }) => state,
          },
          SLOTS_RESET: {
            action: applySlotsResetAction,
            target: requestedWorkspaceState,
          },
          SLOTS_SWAPPED: {
            action: applySlotsSwappedAction,
            target: requestedWorkspaceState,
          },
          SLOT_IMAGE_LINKED: {
            action: applySlotImageLinkedAction,
            target: ({ state }) => state,
          },
          SLOT_DATA_CONNECTED: {
            action: applySlotDataConnectedAction,
            target: requestedWorkspaceState,
          },
          GRAPH_OBJECTS_REPLACED: {
            action: applyGraphObjectsReplacedAction,
            target: ({ state }) => state,
          },
          CHART_LAYOUT_CHANGED: {
            action: applyChartLayoutChangedAction,
            target: ({ state }) => state,
          },
          CHART_MODEL_REPLACED: {
            action: applyChartModelReplacedAction,
            target: ({ state }) => state,
          },
          SLOT_IMAGE_IMPORTED: {
            action: applySlotImageImportedAction,
            target: requestedWorkspaceState,
          },
          SLOT_CHART_IMPORTED: {
            action: applySlotChartImportedAction,
            target: requestedWorkspaceState,
          },
          GRID_LAYOUT_CHANGED: {
            action: applyGridLayoutChangedAction,
            target: "project",
          },
          PROJECT_LOADED: {
            action: applyProjectLoadedAction,
            target: "project",
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
          SLOT_CAPTION_MODE_CHANGED: { target: ({ state }) => state },
          CAPTION_TEXT_INPUT: { target: ({ state }) => state },
          SLOT_CAPTIONS_INSERTED: { target: ({ state }) => state },
          SLOTS_SWAPPED: { target: ({ state }) => state },
        },
        GRAPH_OBJECT_EVENTS = {
          SELECT_GRAPH_OBJECT: {
            action: applyGraphObjectSelectionAction,
            target: ({ payload }) => Number.isInteger(payload.index) ? "selected" : "none",
          },
          CLEAR_GRAPH_OBJECT: {
            action: applyGraphObjectSelectionAction,
            target: "none",
          },
          SELECT_SLOT: {
            action: applyGraphObjectSelectionAction,
            target: "none",
          },
          SLOT_TYPE_CHANGED: {
            action: applyGraphObjectSelectionAction,
            target: "none",
          },
          SLOTS_RESET: {
            action: applyGraphObjectSelectionAction,
            target: "none",
          },
          SLOTS_SWAPPED: {
            action: applyGraphObjectSelectionAction,
            target: "none",
          },
          GRAPH_OBJECTS_REPLACED: {
            action: applyGraphObjectSelectionAction,
            target: () => Number.isInteger(selectedObjectIndex) ? "selected" : "none",
          },
          PROJECT_NODE_MOVED: ({ state, payload }) =>
            payload.clearGraphSelection
              ? { action: applyGraphObjectSelectionAction, target: "none" }
              : { target: state },
          GRID_LAYOUT_CHANGED: {
            action: applyGraphObjectSelectionAction,
            target: "none",
          },
          PROJECT_LOADED: {
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
          DATA_OBJECT_REPLACED: { target: ({ state }) => state },
          IMAGE_OBJECT_REPLACED: { target: ({ state }) => state },
          PROJECT_NODE_MOVED: ({ state, payload }) =>
            payload.clearAssetSelection
              ? { action: applyAssetSelectionAction, target: "none" }
              : { target: state },
          SELECT_SLOT: {
            action: applyAssetSelectionAction,
            target: "none",
          },
          SLOTS_SWAPPED: {
            action: applyAssetSelectionAction,
            target: "none",
          },
          GRID_LAYOUT_CHANGED: {
            action: applyAssetSelectionAction,
            target: "none",
          },
          PROJECT_LOADED: {
            action: applyAssetSelectionAction,
            target: "none",
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
              entry: syncProjectWorkspaceState,
              update: syncProjectWorkspaceState,
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
              entry: syncGraphWorkspaceState,
              exit: exitGraphWorkspaceState,
              update: syncGraphWorkspaceState,
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
              entry: syncImageWorkspaceState,
              exit: exitImageWorkspaceState,
              update: syncImageWorkspaceState,
              on: SHARED_WORKSPACE_EVENTS,
            },
          },
          overlay: {
            none: {
              objects: ["ui"],
              entry: enterOverlayState,
              on: SHARED_OVERLAY_EVENTS,
            },
            layout: {
              objects: ["layout", "slots", "ui"],
              entry: enterOverlayState,
              exit: exitOverlayState,
              update: () => {
                renderLayout();
                syncLayoutMapSize();
              },
              on: SHARED_OVERLAY_EVENTS,
            },
            label: {
              objects: ["labels", "slots", "ui"],
              entry: enterOverlayState,
              exit: exitOverlayState,
              update: ({ objects }) => syncLabelControlsFromObject(objects.labels),
              on: SHARED_OVERLAY_EVENTS,
            },
            caption: {
              objects: ["captions", "slots", "labels", "ui"],
              entry: enterOverlayState,
              exit: exitOverlayState,
              update: ({ objects }) => syncCaptionControlsFromObject(objects.captions),
              on: SHARED_OVERLAY_EVENTS,
            },
            print: {
              objects: ["project", "layout", "labels", "captions", "charts", "images", "slots", "ui"],
              entry: enterOverlayState,
              exit: exitOverlayState,
              on: SHARED_OVERLAY_EVENTS,
            },
            readme: {
              objects: ["project", "ui"],
              entry: enterOverlayState,
              exit: exitOverlayState,
              on: SHARED_OVERLAY_EVENTS,
            },
          },
          assetSelection: {
            none: {
              objects: ["data", "images", "ui"],
              entry: syncAssetSelectionState,
              update: syncAssetSelectionState,
              on: ASSET_SELECTION_EVENTS,
            },
            csv: {
              objects: ["data", "images", "ui"],
              entry: syncAssetSelectionState,
              update: syncAssetSelectionState,
              on: ASSET_SELECTION_EVENTS,
            },
            image: {
              objects: ["data", "images", "ui"],
              entry: syncAssetSelectionState,
              update: syncAssetSelectionState,
              on: ASSET_SELECTION_EVENTS,
            },
            directory: {
              objects: ["data", "images", "ui"],
              entry: syncAssetSelectionState,
              update: syncAssetSelectionState,
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
        .register("ui", {
          read: (project) => ({
            selectedSlotId,
            pendingSlotContentType,
            selectedObjectIndex,
            activeCsvId,
            activeDataName,
            palette: project.appearance.uiPalette,
          }),
        });
      const appFSM = new ApplicationStateMachine(projectObjects, APP_STATE_DEFINITIONS);
      function buildFastFigureUiSnapshot() {
        let slot = getSelectedSlot();
        return Object.freeze({
          fsm: appFSM.state,
          projectName: activeProject.projectName,
          selectedSlot: slot
            ? Object.freeze({
                id: slot.id,
                row: slot.row,
                col: slot.col,
                contentType: slot.contentType,
                hasChart: !!slot.chart,
                hasImage: !!slot.imageId,
                caption: typeof slot.caption === "string" ? slot.caption : null,
              })
            : null,
          pendingSlotContentType,
          selectedObjectIndex,
          activeCsvId,
          activeImageId,
          activeAssetKind,
          layout: projectClone(projectObjects.read("layout")),
          labels: projectClone(projectObjects.read("labels")),
          captions: projectClone(projectObjects.read("captions")),
          appearance: projectClone(projectObjects.read("appearance")),
        });
      }
      const fastFigureUiListeners = new Set();
      let fastFigureUiStoreSnapshot = Object.freeze({
        version: 0,
        state: appFSM.state,
        event: "init",
      });
      function publishFastFigureUiStore(state = appFSM.state, event = "domain-update") {
        fastFigureUiStoreSnapshot = Object.freeze({
          version: fastFigureUiStoreSnapshot.version + 1,
          state,
          event,
        });
        fastFigureUiListeners.forEach((listener) => listener());
      }
      appFSM.subscribe((state, event) => publishFastFigureUiStore(state, event));
      const fastFigureUiBridge = Object.freeze({
        subscribe(listener) {
          fastFigureUiListeners.add(listener);
          return () => fastFigureUiListeners.delete(listener);
        },
        getSnapshot() {
          return fastFigureUiStoreSnapshot;
        },
        getServerSnapshot() {
          return fastFigureUiStoreSnapshot;
        },
        read() {
          return buildFastFigureUiSnapshot();
        },
        send(event, payload = {}) {
          return appFSM.send(event, payload);
        },
        notify(object, event, payload = {}) {
          return appFSM.notify(object, event, payload);
        },
        run(lifecycle, event, task) {
          return appFSM.run(lifecycle, event, task);
        },
        applyLayoutSettings(values) {
          return applyLayoutSettingsFromValues(values);
        },
        renderLayoutPreview(target) {
          return renderLayout(target);
        },
        mergeSelectedSlots() {
          return mergeSelected();
        },
        splitSelectedSlots() {
          return splitSelected();
        },
        applyLabelSettings(values) {
          return applyLabelSettingsFromValues(values);
        },
        applyLabelPosition(values) {
          return applyLabelPositionFromValues(values);
        },
        renderLabelPreview(values, preview, label) {
          return renderLabelPreviewFromValues(values, false, preview, label);
        },
        labelPreviewPosition(clientX, clientY, offsetX = 0, offsetY = 0, preview, label) {
          return labelPreviewPositionFromPointer(clientX, clientY, offsetX, offsetY, preview, label);
        },
        setAnnotationEnabled(kind, enabled) {
          return applyAnnotationVisibilityFromValues(kind, enabled);
        },
        resetLabelPosition() {
          return resetLabelPositionFromValues();
        },
        applyCaptionSettings(values, notify = true) {
          return applyCaptionSettingsFromValues(values, notify);
        },
        readCaptionEditor() {
          return readCaptionEditorState();
        },
        applyCaptionEditor(values) {
          return applyCaptionEditorFromValues(values);
        },
        insertSlotCaptions() {
          return insertSlotCaptionsFromCurrentLayout();
        },
        exportTarget(values, statusTarget) {
          return exportDashboardTargetFromValues(values, statusTarget);
        },
        readReadmeHtml() {
          let source = document.querySelector("#readmeDialog .readme-content");
          if (!source) return "";
          let clone = source.cloneNode(true);
          clone.querySelector("#closeReadme")?.remove();
          return clone.innerHTML;
        },
        readAssetActions() {
          return selectedAssetTreeActionModel();
        },
        runAssetAction(key, context) {
          return runAssetTreeAction(key, context);
        },
        readAssetTree() {
          return projectDataTreeSnapshot(projectDataTreeObjects());
        },
        selectAssetPath(path) {
          let match = projectVfs.resolve(path);
          if (match?.kind === "directory") selectDirectoryFromTree(match.path);
          else if (match?.kind === "csv") selectCsvAsset(projectAssetPath(match.asset));
          else if (match?.kind === "image") selectImageAsset(projectAssetPath(match.asset));
          else return false;
          return true;
        },
        canDragAsset(path) {
          let match = projectVfs.resolve(path);
          return !!match && !(match.kind === "directory" && projectVfs.isFixedDirectory(match.path));
        },
        beginAssetDrag(path, dataTransfer) {
          let match = projectVfs.resolve(path);
          if (!match || !dataTransfer) return false;
          if (match.kind === "directory" && projectVfs.isFixedDirectory(match.path)) return false;
          let resolvedPath = match.kind === "directory" ? match.path : projectAssetPath(match.asset);
          dataTransfer.effectAllowed = "all";
          dataTransfer.setData(
            ASSET_TREE_DRAG_TYPE,
            JSON.stringify({ kind: match.kind, path: resolvedPath }),
          );
          if (match.kind === "csv" && match.asset.isDefaultEmpty === true)
            dataTransfer.setData(ASSET_TREE_LOCKED_TYPE, "1");
          dataTransfer.setData("text/plain", resolvedPath);
          return true;
        },
        readAssetDropPolicy(dataTransfer, target) {
          let node = {
            dataset: {
              explorerTarget: target?.kind || "",
              path: target?.path || "",
              slotId: target?.slotId == null ? "" : String(target.slotId),
            },
          };
          return assetTreeDropPolicy(dataTransfer, node);
        },
        async dropAsset(dataTransfer, target) {
          let node = {
              dataset: {
                explorerTarget: target?.kind || "",
                path: target?.path || "",
                slotId: target?.slotId == null ? "" : String(target.slotId),
              },
            },
            policy = assetTreeDropPolicy(dataTransfer, node);
          if (!policy.allowed) {
            status(policy.reason);
            return false;
          }
          await executeAssetTreeDrop(dataTransfer, node, policy, {
            preserveLegacyOpenState: false,
          });
          publishFastFigureUiStore(appFSM.state, "asset:drop");
          return true;
        },
        createAssetDirectory() {
          return createAssetDirectory();
        },
        downloadSelectedAsset() {
          return downloadProjectAsset();
        },
        deleteSelectedAsset() {
          return deleteSelectedAsset();
        },
        resetSelectedSlot() {
          return $("resetSelectedSlot").click();
        },
        setProjectName(value, commit = false) {
          let name = setProjectNameFromValue(value, commit);
          publishFastFigureUiStore(appFSM.state, commit ? "project:name-commit" : "project:name-input");
          return name;
        },
        exportProject() {
          return appFSM.run("exporting", "PROJECT_EXPORT", () => downloadProjectFromValue());
        },
        importProjectFile(file) {
          return appFSM.run("importing", "PROJECT_IMPORT", () => loadProjectFile(file));
        },
        changeSlotContentType(type) {
          if (type !== "graph" && type !== "image") return false;
          let hasSlot = !!getSelectedSlot();
          setSlotContentType(type);
          if (!hasSlot) publishFastFigureUiStore(appFSM.state, "slot:pending-content-type");
          return true;
        },
        readFileInput() {
          return projectFileInputModel();
        },
        loadFiles(files) {
          return loadProjectFiles(files);
        },
        readImageSettings() {
          return selectedImageSettingsModel();
        },
        applyImageSettings(values) {
          return applyImageSettingsFromValues(values);
        },
        insertEmptyImage() {
          return insertEmptySlotImage();
        },
        readCsvHeader() {
          return selectedCsvHeaderModel();
        },
        applyCsvHeader(value, csvId) {
          return !!applyCsvHeaderLinesToModel(value, csvId);
        },
        readChartLayout() {
          return selectedChartLayoutModel();
        },
        applyChartLayout(values, chartId) {
          return applyGraphLayoutSettings(values, chartId);
        },
        readGraphObject() {
          return selectedGraphObjectModel();
        },
        readGraphObjects() {
          return selectedGraphObjectsModel();
        },
        readGraphPalette() {
          return selectedGraphPaletteModel();
        },
        readGraphFileActions() {
          return selectedGraphFileActionsModel();
        },
        setGraphEditorEditable(editable, chartId) {
          return setGraphEditorEditableFromValue(editable, chartId);
        },
        readGraphObjectAdd() {
          return selectedGraphObjectAddModel();
        },
        addGraphObject(slotId, chartId) {
          return addGraphObjectFromModel(slotId, chartId);
        },
        selectGraphObject(index, chartId) {
          return selectGraphObjectFromIndex(index, chartId);
        },
        setGraphObjectColor(index, color, chartId) {
          return setGraphObjectColorFromIndex(index, color, chartId);
        },
        setGraphObjectColors(colors, chartId) {
          return setGraphObjectColorsFromPalette(colors, chartId);
        },
        removeGraphObject(index, chartId) {
          return removeGraphObjectFromIndex(index, chartId);
        },
        moveGraphObject(from, to, chartId) {
          return moveGraphObjectFromIndex(from, to, chartId);
        },
        applyGraphObject(values, chartId, objectIndex) {
          return applySelectedGraphObjectFromValues(values, chartId, objectIndex);
        },
      });
      function useFastFigureFsmSnapshot() {
        let React = window.FastFigureUiRuntime?.React;
        if (!React) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        return React.useSyncExternalStore(
          fastFigureUiBridge.subscribe,
          fastFigureUiBridge.getSnapshot,
          fastFigureUiBridge.getServerSnapshot,
        );
      }
      window.FastFigureUiBridge = fastFigureUiBridge;
      function FastFigureToolbarStaging() {
        useFastFigureFsmSnapshot();
        let runtime = window.FastFigureUiRuntime,
          snapshot = fastFigureUiBridge.read();
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Button, Group, Text } = MantineCore,
          overlay = snapshot.fsm.overlay,
          toggleOverlay = (name) =>
            fastFigureUiBridge.send("TOGGLE_OVERLAY", { overlay: name, source: "mantine-toolbar" });
        return React.createElement(
          Group,
          {
            align: "center",
            gap: "xs",
            wrap: "nowrap",
            "data-fast-figure-ui": "toolbar",
          },
          React.createElement(
            Button,
            {
              variant: overlay === "layout" ? "filled" : "default",
              onClick: () => toggleOverlay("layout"),
            },
            "레이아웃",
          ),
          React.createElement(
            Button,
            {
              variant: overlay === "label" ? "filled" : "default",
              onClick: () => toggleOverlay("label"),
            },
            "레이블",
          ),
          React.createElement(
            Button,
            {
              variant: overlay === "caption" ? "filled" : "default",
              onClick: () => toggleOverlay("caption"),
            },
            "캡션",
          ),
          React.createElement(
            Text,
            { size: "sm", c: "dimmed", style: { flex: "1 1 auto" } },
            snapshot.selectedSlot
              ? `슬롯 ${snapshot.selectedSlot.id} 선택됨`
              : "빈 슬롯 또는 그래프를 선택하세요.",
          ),
          React.createElement(
            Button,
            {
              variant: overlay === "print" ? "filled" : "default",
              onClick: () => toggleOverlay("print"),
            },
            "프린트",
          ),
          snapshot.selectedSlot
            ? null
            : React.createElement(
                Button,
                {
                  variant: overlay === "readme" ? "filled" : "default",
                  onClick: () => toggleOverlay("readme"),
                },
                "README",
              ),
        );
      }
      function FastFigureGraphAxisStaging({ chartLayout, axisKey, label }) {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Accordion, Button, NumberInput, Select, SimpleGrid, Stack, Switch, TextInput } =
            MantineCore,
          axis = chartLayout.globalSettings.axes?.[axisKey] || {},
          isLog = axis.scaleType === "log",
          tickMode = !isLog && axis.tickMode === "increment" ? "increment" : "plotly",
          commit = (changes) =>
            fastFigureUiBridge.applyChartLayout(
              { axes: { [axisKey]: changes } },
              chartLayout.chartId,
            ),
          commitBlur = (key) => (event) => commit({ [key]: event.currentTarget.value }),
          blurOnEnter = (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            event.currentTarget.blur();
          },
          numberInput = (key, inputLabel, options = {}) =>
            React.createElement(NumberInput, {
              key: `${axisKey}-${key}-${chartLayout.chartId}-${axis[key] ?? ""}`,
              label: inputLabel,
              defaultValue: axis[key] ?? "",
              onBlur: commitBlur(key),
              onKeyDown: blurOnEnter,
              ...options,
            });
        return React.createElement(
          Accordion.Item,
          { value: axisKey },
          React.createElement(Accordion.Control, null, label),
          React.createElement(
            Accordion.Panel,
            null,
            React.createElement(
              Stack,
              { gap: "xs" },
              React.createElement(TextInput, {
                key: `${axisKey}-title-${chartLayout.chartId}-${axis.title ?? ""}`,
                label: "축 이름",
                defaultValue: axis.title ?? "",
                onBlur: commitBlur("title"),
                onKeyDown: blurOnEnter,
              }),
              React.createElement(
                SimpleGrid,
                { cols: 2, spacing: "xs" },
                numberInput("min", "최소"),
                numberInput("max", "최대"),
              ),
              React.createElement(
                Button,
                {
                  variant: "default",
                  onClick: () =>
                    isLog
                      ? commit({
                          tickMode: "plotly",
                          minorTicks: axis.minorTicks !== true,
                        })
                      : commit({
                          tickMode: tickMode === "increment" ? "plotly" : "increment",
                        }),
                },
                isLog
                  ? axis.minorTicks === true
                    ? "minor tick 해제"
                    : "minor tick 표시"
                  : tickMode === "increment"
                    ? "increment"
                    : "tick 간격",
              ),
              isLog ? null : numberInput("tick", "tick 간격", { placeholder: "자동" }),
              React.createElement(Select, {
                label: "표기",
                value: axis.notation || "none",
                data: [
                  { value: "none", label: "숫자" },
                  { value: "power", label: "지수" },
                  { value: "e", label: "과학 표기" },
                ],
                allowDeselect: false,
                onChange: (value) => value && commit({ notation: value }),
              }),
              React.createElement(Select, {
                label: "축 유형",
                value: axis.scaleType || "linear",
                data: [
                  { value: "linear", label: "선형" },
                  { value: "log", label: "로그" },
                  { value: "reciprocal", label: "역수" },
                ],
                allowDeselect: false,
                onChange: (value) => {
                  if (!value) return;
                  commit(
                    value === "log"
                      ? { scaleType: value, tickMode: "plotly" }
                      : { scaleType: value },
                  );
                },
              }),
              numberInput("divide", "값 나누기"),
              React.createElement(
                SimpleGrid,
                { cols: 2, spacing: "xs" },
                numberInput("titleSize", "축 이름 크기"),
                numberInput("fontSize", "숫자 크기"),
              ),
              numberInput("lineWidth", "축선 굵기", { min: 0 }),
              React.createElement(
                SimpleGrid,
                { cols: 3, spacing: "xs" },
                [
                  ["showGrid", "격자 표시"],
                  ["visible", "축 표시"],
                  ["showValues", "값 표시"],
                ].map(([key, switchLabel]) =>
                  React.createElement(Switch, {
                    key,
                    label: switchLabel,
                    checked: axis[key] === true,
                    onChange: (event) => commit({ [key]: event.currentTarget.checked }),
                  }),
                ),
              ),
            ),
          ),
        );
      }
      function FastFigureGraphPaletteFileStaging({ graphPalette }) {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Button, Group, Stack } = MantineCore,
          inputRef = React.useRef(null),
          loadDisabled = graphPalette.editable === false,
          save = () => {
            let stamp = new Date().toISOString().replace(/[:.]/g, "-");
            downloadJsonFile(
              { colors: [...graphPalette.colors] },
              `chart-palette-${stamp}.json`,
            );
            debugLog("graphPalette:save", { slotId: graphPalette.slotId });
          },
          load = async (event) => {
            let file = event.target.files?.[0];
            if (!file) return;
            try {
              let colors = parseGraphPaletteText(await file.text());
              if (!fastFigureUiBridge.setGraphObjectColors(colors, graphPalette.chartId))
                throw Error("색상 구성을 적용하지 못했습니다.");
              status(`${file.name} 색상 구성을 덮어썼습니다.`);
              debugLog("graphPalette:load", {
                slotId: graphPalette.slotId,
                name: file.name,
                colors: colors.length,
              });
            } catch (error) {
              status("팔레트 불러오기 실패: " + error.message);
              debugLog("graphPalette:load-error", { message: error.message });
            } finally {
              event.target.value = "";
            }
          };
        return React.createElement(
          Stack,
          { gap: "xs" },
          React.createElement(
            Group,
            { grow: true },
            React.createElement(
              Button,
              { variant: "light", size: "xs", onClick: save },
              "색상 저장",
            ),
            React.createElement(
              Button,
              {
                variant: "light",
                size: "xs",
                disabled: loadDisabled,
                onClick: () => inputRef.current?.click(),
              },
              "색상 불러오기",
            ),
          ),
          React.createElement("input", {
            ref: inputRef,
            type: "file",
            accept: ".json,application/json",
            hidden: true,
            onChange: load,
          }),
        );
      }
      function FastFigureGraphFileActionsStaging({ graphFileActions }) {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Button, Group, Stack, Text } = MantineCore,
          inputRef = React.useRef(null),
          currentTarget = () => {
            let current = fastFigureUiBridge.readGraphFileActions();
            if (
              !current ||
              current.slotId !== graphFileActions.slotId ||
              current.chartId !== graphFileActions.chartId
            ) {
              status("선택한 그래프 슬롯이 변경되었습니다.");
              return null;
            }
            return current;
          },
          exportFfsx = () => {
            if (!currentTarget()?.canExport) return;
            downloadSlotFfsx();
          },
          exportPlotly = () => {
            if (!currentTarget()?.canExport) return;
            downloadPlotlyJson();
          },
          toggleEditable = () => {
            let current = currentTarget();
            if (!current?.canToggleEditable) return;
            fastFigureUiBridge.setGraphEditorEditable(!current.editable, current.chartId);
          },
          load = async (event) => {
            let file = event.target.files?.[0];
            if (!file) return;
            try {
              let current = currentTarget(),
                slot = getSelectedSlot();
              if (!current || !slot || slot.id !== current.slotId)
                throw Error("선택한 그래프 슬롯이 변경되었습니다.");
              await importSlotFile(file, slot);
            } catch (error) {
              refreshCsvControls();
              status("슬롯 불러오기 오류: " + error.message);
              debugLog("slot:import-error", { message: error.message });
            } finally {
              event.target.value = "";
            }
          };
        return React.createElement(
          Stack,
          { gap: "xs" },
          React.createElement(Text, { size: "sm", fw: 600 }, "그래프 파일"),
          React.createElement(
            Group,
            { grow: true },
            React.createElement(
              Button,
              {
                variant: "light",
                size: "xs",
                disabled: !graphFileActions.canExport,
                onClick: exportFfsx,
              },
              "FFSX 내보내기",
            ),
            React.createElement(
              Button,
              {
                variant: "light",
                size: "xs",
                disabled: !graphFileActions.canExport,
                onClick: exportPlotly,
              },
              "Plotly JSON",
            ),
          ),
          React.createElement(
            Group,
            { grow: true },
            React.createElement(
              Button,
              {
                variant: "light",
                size: "xs",
                onClick: () => inputRef.current?.click(),
              },
              "불러오기",
            ),
            React.createElement(
              Button,
              {
                variant: "light",
                size: "xs",
                disabled: !graphFileActions.canToggleEditable,
                onClick: toggleEditable,
              },
              graphFileActions.editable === false ? "편집 가능" : "원본 JSON",
            ),
          ),
          React.createElement("input", {
            ref: inputRef,
            type: "file",
            accept: ".ffsx,.json,application/json,application/vnd.fast-figure-slot",
            hidden: true,
            onChange: load,
          }),
        );
      }
      function FastFigureGraphObjectAddStaging({ graphObjectAdd }) {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Button } = MantineCore;
        return React.createElement(
          Button,
          {
            variant: "light",
            fullWidth: true,
            disabled: graphObjectAdd.editable === false,
            onClick: () =>
              fastFigureUiBridge.addGraphObject(
                graphObjectAdd.slotId,
                graphObjectAdd.chartId,
              ),
          },
          "그래프 오브젝트 추가",
        );
      }
      function FastFigureGraphObjectListStaging({ graphObjects }) {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { ActionIcon, Button, ColorInput, Group, Paper, Stack, Text, Title } = MantineCore,
          disabled = graphObjects.editable === false,
          dragType = "application/x-fast-figure-graph-object-index";
        return React.createElement(
          Stack,
          { gap: "xs" },
          React.createElement(Title, { order: 3, size: "h6" }, "그래프 오브젝트"),
          React.createElement(
            Button,
            {
              variant: "light",
              size: "xs",
              disabled: disabled || !graphObjects.objects.length,
              onClick: () =>
                fastFigureUiBridge.setGraphObjectColors(DEFAULT_COLORS, graphObjects.chartId),
            },
            "기본 색상",
          ),
          graphObjects.objects.length
            ? graphObjects.objects.map((item) =>
                React.createElement(
                  Paper,
                  {
                    key: `${graphObjects.chartId}-${item.index}`,
                    withBorder: true,
                    radius: "sm",
                    p: "xs",
                    shadow: item.selected ? "xs" : undefined,
                    style: { cursor: disabled ? "default" : "pointer" },
                    draggable: !disabled,
                    role: "button",
                    tabIndex: disabled ? -1 : 0,
                    "aria-pressed": item.selected,
                    onClick: () =>
                      fastFigureUiBridge.selectGraphObject(
                        item.index,
                        graphObjects.chartId,
                      ),
                    onKeyDown: (event) => {
                      if (disabled || (event.key !== "Enter" && event.key !== " ")) return;
                      event.preventDefault();
                      fastFigureUiBridge.selectGraphObject(
                        item.index,
                        graphObjects.chartId,
                      );
                    },
                    onDragStart: (event) => {
                      if (disabled || event.target.closest?.("input,button")) {
                        event.preventDefault();
                        return;
                      }
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData(dragType, String(item.index));
                    },
                    onDragOver: (event) => {
                      if (
                        !disabled &&
                        Array.from(event.dataTransfer.types || []).includes(dragType)
                      )
                        event.preventDefault();
                    },
                    onDrop: (event) => {
                      if (disabled) return;
                      event.preventDefault();
                      let from = Number(event.dataTransfer.getData(dragType));
                      if (!Number.isInteger(from) || from === item.index) return;
                      fastFigureUiBridge.moveGraphObject(
                        from,
                        item.index,
                        graphObjects.chartId,
                      );
                    },
                  },
                  React.createElement(
                    Group,
                    { gap: "xs", wrap: "nowrap" },
                    React.createElement(
                      Text,
                      {
                        size: "sm",
                        fw: item.selected ? 700 : 400,
                        style: { flex: 1, minWidth: 0 },
                      },
                      item.label,
                    ),
                    React.createElement(ColorInput, {
                      value: item.color,
                      format: "hex",
                      withEyeDropper: false,
                      disabled,
                      "aria-label": "그래프 객체 색상",
                      onClick: (event) => event.stopPropagation(),
                      onChange: (color) =>
                        fastFigureUiBridge.setGraphObjectColor(
                          item.index,
                          color,
                          graphObjects.chartId,
                        ),
                      w: 112,
                    }),
                    React.createElement(
                      ActionIcon,
                      {
                        variant: "subtle",
                        disabled,
                        "aria-label": "그래프 객체 삭제",
                        title: "삭제",
                        onClick: (event) => {
                          event.stopPropagation();
                          fastFigureUiBridge.removeGraphObject(
                            item.index,
                            graphObjects.chartId,
                          );
                        },
                      },
                      "×",
                    ),
                  ),
                ),
              )
            : React.createElement(
                Text,
                { size: "sm", c: "dimmed" },
                "추가된 그래프 객체가 없습니다.",
              ),
        );
      }
      function FastFigureGraphObjectStaging({ graphObject }) {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { NumberInput, Select, SimpleGrid, Stack, Text, TextInput, Title } = MantineCore,
          object = graphObject.object || {},
          disabled = graphObject.editable === false,
          visibility = graphObjectTypeVisibility(object.type),
          columnData = graphObject.columns.map(({ id, label }) => ({ value: id, label })),
          apply = (changes) =>
            fastFigureUiBridge.applyGraphObject(
              changes,
              graphObject.chartId,
              graphObject.objectIndex,
            ),
          commitOnEnter = (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            event.currentTarget.blur();
          },
          textProps = (key) => ({
            key: `${key}-${graphObject.chartId}-${graphObject.objectIndex}-${object[key] ?? ""}`,
            defaultValue: object[key] ?? "",
            disabled,
            onBlur: (event) => apply({ [key]: event.currentTarget.value }),
            onKeyDown: commitOnEnter,
          }),
          numberProps = (key) => ({
            key: `${key}-${graphObject.chartId}-${graphObject.objectIndex}-${object[key] ?? ""}`,
            defaultValue: object[key],
            disabled,
            onBlur: (event) => apply({ [key]: event.currentTarget.value }),
            onKeyDown: commitOnEnter,
          });
        return React.createElement(
          Stack,
          { gap: "xs" },
          React.createElement(Title, { order: 3, size: "h6" }, "그래프 오브젝트 설정"),
          React.createElement(
            Text,
            { size: "xs", c: "dimmed" },
            graphObject.csvName ? `CSV: ${graphObject.csvName}` : "참조 CSV 없음",
          ),
          React.createElement(
            SimpleGrid,
            { cols: 2, spacing: "xs" },
            React.createElement(Select, {
              label: "X축 열",
              value: object.x || "",
              data: columnData,
              allowDeselect: false,
              disabled,
              onChange: (value) => apply({ x: value ?? "" }),
            }),
            React.createElement(Select, {
              label: "X축 위치",
              value: object.xAxisSide || "bottom",
              data: [
                { value: "bottom", label: "아래" },
                { value: "top", label: "위" },
              ],
              allowDeselect: false,
              disabled,
              onChange: (value) => apply({ xAxisSide: value ?? "bottom" }),
            }),
            React.createElement(Select, {
              label: "Y축 열",
              value: object.y || "",
              data: columnData,
              allowDeselect: false,
              disabled,
              onChange: (value) => apply({ y: value ?? "" }),
            }),
            React.createElement(Select, {
              label: "Y축 위치",
              value: object.yAxisSide || "left",
              data: [
                { value: "left", label: "왼쪽" },
                { value: "right", label: "오른쪽" },
              ],
              allowDeselect: false,
              disabled,
              onChange: (value) => apply({ yAxisSide: value ?? "left" }),
            }),
          ),
          React.createElement(Select, {
            label: "그래프 종류",
            value: object.type || "scatter",
            data: [
              { value: "scatter", label: "선 그래프" },
              { value: "markers", label: "산점도" },
              { value: "lines+markers", label: "선 + 점" },
              { value: "bar", label: "막대 그래프" },
              { value: "hidden", label: "표시 안 함" },
            ],
            allowDeselect: false,
            disabled,
            onChange: (value) => apply({ type: value ?? "scatter" }),
          }),
          React.createElement(TextInput, {
            label: "범례 이름",
            ...textProps("legendName"),
          }),
          visibility.line
            ? React.createElement(
                SimpleGrid,
                { cols: 2, spacing: "xs" },
                React.createElement(NumberInput, {
                  label: "선 굵기(px)",
                  min: 0.1,
                  max: 20,
                  step: 0.1,
                  ...numberProps("lineWidth"),
                }),
                React.createElement(Select, {
                  label: "선 스타일",
                  value: object.lineDash || "solid",
                  data: [
                    { value: "solid", label: "실선" },
                    { value: "dot", label: "점선" },
                    { value: "dash", label: "파선" },
                    { value: "dashdot", label: "일점쇄선" },
                  ],
                  allowDeselect: false,
                  disabled,
                  onChange: (value) => apply({ lineDash: value ?? "solid" }),
                }),
              )
            : null,
          visibility.marker
            ? React.createElement(
                SimpleGrid,
                { cols: 2, spacing: "xs" },
                React.createElement(Select, {
                  label: "점 모양",
                  value: object.markerSymbol || "circle",
                  data: [
                    { value: "circle", label: "원" },
                    { value: "square", label: "사각형" },
                    { value: "diamond", label: "마름모" },
                    { value: "cross", label: "십자" },
                    { value: "x", label: "X" },
                    { value: "triangle-up", label: "위 삼각형" },
                    { value: "triangle-down", label: "아래 삼각형" },
                  ],
                  allowDeselect: false,
                  disabled,
                  onChange: (value) => apply({ markerSymbol: value ?? "circle" }),
                }),
                React.createElement(NumberInput, {
                  label: "점 크기(px)",
                  min: 1,
                  max: 40,
                  step: 1,
                  ...numberProps("markerSize"),
                }),
              )
            : null,
          visibility.bar
            ? React.createElement(
                SimpleGrid,
                { cols: 2, spacing: "xs" },
                React.createElement(NumberInput, {
                  label: "막대 투명도",
                  min: 0.05,
                  max: 1,
                  step: 0.05,
                  ...numberProps("barOpacity"),
                }),
                React.createElement(NumberInput, {
                  label: "막대 외곽선(px)",
                  min: 0,
                  max: 10,
                  step: 0.5,
                  ...numberProps("barLineWidth"),
                }),
              )
            : null,
        );
      }
      function FastFigureAssetTreeStaging({ tree, selectedPath }) {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { NavLink, Stack, Text } = MantineCore,
          target = (kind, path = "", slotId = null) => ({ kind, path, slotId }),
          dropProps = (dropTarget) => ({
            onDragOver: (event) => {
              let policy = fastFigureUiBridge.readAssetDropPolicy(
                event.dataTransfer,
                dropTarget,
              );
              if (!policy.allowed) return;
              event.preventDefault();
              event.dataTransfer.dropEffect =
                policy.operation === "link"
                  ? "link"
                  : policy.operation === "move"
                    ? "move"
                    : "copy";
            },
            onDrop: async (event) => {
              event.preventDefault();
              event.stopPropagation();
              await fastFigureUiBridge.dropAsset(event.dataTransfer, dropTarget);
            },
          }),
          dragProps = (path) => ({
            draggable: fastFigureUiBridge.canDragAsset(path),
            onDragStart: (event) => {
              if (!fastFigureUiBridge.beginAssetDrag(path, event.dataTransfer))
                event.preventDefault();
            },
          }),
          directories = tree.directories
            .filter((path) => path === "/assets" || path.startsWith("/assets/"))
            .sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b)),
          directorySet = new Set(directories),
          csvById = new Map(tree.data.map((csv) => [csv.id, csv])),
          imageById = new Map(tree.images.map((image) => [image.id, image])),
          chartById = new Map(tree.charts.map((chart) => [chart.id, chart])),
          directoryChildren = (parent) =>
            directories.filter((path) => path !== parent && projectParentPath(path) === parent),
          assetChildren = (parent) => [
            ...tree.data
              .filter((csv) => projectParentPath(csv.path) === parent)
              .map((csv) => ({
                key: `csv:${csv.id}`,
                path: csv.path,
                label: projectPathName(csv.path),
                meta: `${csv.rowCount}행`,
              })),
            ...tree.images
              .filter((image) => projectParentPath(image.path) === parent)
              .map((image) => ({
                key: `image:${image.id}`,
                path: image.path,
                label: projectPathName(image.path),
                meta: "이미지",
              })),
          ].sort((a, b) => a.path.localeCompare(b.path)),
          renderDirectory = (path) => {
            let children = [
              ...directoryChildren(path).map(renderDirectory),
              ...assetChildren(path).map((asset) =>
                React.createElement(
                  NavLink,
                  {
                    key: asset.key,
                    label: asset.label,
                    description: asset.meta,
                    active: selectedPath === asset.path,
                    onClick: () => fastFigureUiBridge.selectAssetPath(asset.path),
                    ...dragProps(asset.path),
                  },
                ),
              ),
            ];
            return React.createElement(
              NavLink,
              {
                key: path,
                label: path === "/assets" ? "/assets" : projectPathName(path),
                active: selectedPath === path,
                defaultOpened: path === "/assets",
                onClick: () => fastFigureUiBridge.selectAssetPath(path),
                ...dragProps(path),
                ...dropProps(target("folder", path)),
              },
              children,
            );
          },
          slotItems = tree.slots
            .filter((slot) => !slot.hidden)
            .sort((a, b) => a.row - b.row || a.col - b.col)
            .map((slot) => {
              let references = [];
              if (slot.contentType === "image") {
                let image = imageById.get(slot.imageId);
                if (image) references.push(image.path);
              } else {
                let chart = chartById.get(slot.chart);
                if (chart?.editable === false) references.push("Plotly JSON 내부 데이터");
                else
                  (chart?.csvIds || []).forEach((id) => {
                    let csv = csvById.get(id);
                    if (csv) references.push(csv.path);
                  });
              }
              return React.createElement(
                NavLink,
                {
                  key: `slot:${slot.id}`,
                  label: `[row=${slot.row},col=${slot.col}]`,
                  description: references.length ? references.join(" · ") : "(에셋 없음)",
                  ...dropProps(target("slot", "", slot.id)),
                },
              );
            });
        return React.createElement(
          Stack,
          { gap: 0, "data-fast-figure-ui": "asset-tree" },
          React.createElement(Text, { size: "xs", fw: 700, mb: 4 }, "PROJECT DATA"),
          directorySet.has("/assets") ? renderDirectory("/assets") : null,
          React.createElement(
            NavLink,
            { label: "/slots", defaultOpened: true },
            slotItems.length
              ? slotItems
              : React.createElement(Text, { size: "xs", c: "dimmed", px: "sm", py: "xs" }, "(표시 슬롯 없음)"),
          ),
        );
      }
      function FastFigureSidebarStaging() {
        useFastFigureFsmSnapshot();
        let runtime = window.FastFigureUiRuntime,
          snapshot = fastFigureUiBridge.read(),
          assetActions = fastFigureUiBridge.readAssetActions(),
          assetTree = fastFigureUiBridge.readAssetTree(),
          fileInput = fastFigureUiBridge.readFileInput();
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Accordion, Box, Button, Divider, FileButton, Group, Menu, NumberInput, SegmentedControl, Select, SimpleGrid, Stack, Switch, Text, TextInput, Title } = MantineCore,
          slot = snapshot.selectedSlot,
          workspace = snapshot.fsm.workspace,
          assetSelection = snapshot.fsm.assetSelection,
          imageSettings = fastFigureUiBridge.readImageSettings(),
          csvHeader = fastFigureUiBridge.readCsvHeader(),
          chartLayout = fastFigureUiBridge.readChartLayout(),
          graphFileActions = fastFigureUiBridge.readGraphFileActions(),
          graphObjectAdd = fastFigureUiBridge.readGraphObjectAdd(),
          graphPalette = fastFigureUiBridge.readGraphPalette(),
          graphObjects = fastFigureUiBridge.readGraphObjects(),
          graphObject = fastFigureUiBridge.readGraphObject();
        return React.createElement(
          Box,
          {
            component: "aside",
            p: "sm",
            w: 280,
            "data-fast-figure-ui": "sidebar",
          },
          React.createElement(
            Stack,
            { gap: "xs" },
            React.createElement(Title, { order: 2, size: "h5" }, "프로젝트"),
            React.createElement(TextInput, {
              label: "프로젝트 이름",
              value: snapshot.projectName || "",
              maxLength: 120,
              onChange: (event) => fastFigureUiBridge.setProjectName(event.currentTarget.value),
              onBlur: (event) =>
                fastFigureUiBridge.setProjectName(event.currentTarget.value, true),
            }),
            React.createElement(
              Group,
              { grow: true },
              React.createElement(
                Button,
                {
                  variant: "default",
                  disabled: !!slot || snapshot.fsm.lifecycle !== "ready",
                  onClick: () => fastFigureUiBridge.exportProject(),
                },
                "FFPX 내보내기",
              ),
              React.createElement(
                FileButton,
                {
                  accept: ".ffpx,.json,application/json,application/vnd.fast-figure-project",
                  onChange: (file) => file && fastFigureUiBridge.importProjectFile(file),
                },
                (props) =>
                  React.createElement(
                    Button,
                    {
                      ...props,
                      variant: "default",
                      disabled: !!slot || snapshot.fsm.lifecycle !== "ready",
                    },
                    "FFPX 불러오기",
                  ),
              ),
            ),
            React.createElement(SegmentedControl, {
              fullWidth: true,
              value: slot ? slot.contentType : snapshot.pendingSlotContentType,
              data: [
                { label: "그래프", value: "graph" },
                { label: "이미지", value: "image" },
              ],
              onChange: (value) => fastFigureUiBridge.changeSlotContentType(value),
            }),
            React.createElement(
              FileButton,
              {
                accept: fileInput.accept,
                multiple: fileInput.multiple,
                onChange: (files) => fastFigureUiBridge.loadFiles(files),
              },
              (props) =>
                React.createElement(
                  Button,
                  { ...props, variant: "default", fullWidth: true },
                  fileInput.label,
                ),
            ),
            React.createElement(Text, { size: "xs", c: "dimmed" }, fileInput.hint),
            React.createElement(FastFigureAssetTreeStaging, {
              tree: assetTree,
              selectedPath: assetActions.context?.path || null,
            }),
            React.createElement(
              SimpleGrid,
              { cols: 2, spacing: "xs" },
              React.createElement(
                Button,
                { variant: "default", onClick: () => fastFigureUiBridge.createAssetDirectory() },
                "새 폴더",
              ),
              React.createElement(
                Button,
                {
                  variant: "default",
                  disabled: !["csv", "image"].includes(assetSelection),
                  onClick: () => fastFigureUiBridge.downloadSelectedAsset(),
                },
                "에셋 다운로드",
              ),
              React.createElement(
                Button,
                {
                  variant: "default",
                  disabled: !["csv", "image"].includes(assetSelection),
                  onClick: () => fastFigureUiBridge.deleteSelectedAsset(),
                },
                "에셋 삭제",
              ),
              React.createElement(
                Button,
                {
                  variant: "default",
                  disabled: !slot,
                  onClick: () => fastFigureUiBridge.resetSelectedSlot(),
                },
                "슬롯 초기화",
              ),
            ),
            slot?.contentType === "image"
              ? React.createElement(
                  Stack,
                  { gap: "xs" },
                  React.createElement(
                    Button,
                    { variant: "default", onClick: () => fastFigureUiBridge.insertEmptyImage() },
                    "빈 이미지 삽입",
                  ),
                  imageSettings
                    ? React.createElement(
                        React.Fragment,
                        null,
                        React.createElement(Select, {
                          label: "이미지 설정 유형",
                          value: imageSettings.fit,
                          data: [
                            { label: "슬롯에 맞춰 축소", value: "contain" },
                            { label: "슬롯에 맞춰 자르기", value: "cover" },
                            { label: "수동 설정", value: "manual" },
                          ],
                          allowDeselect: false,
                          onChange: (fit) =>
                            fit && fastFigureUiBridge.applyImageSettings({ ...imageSettings, fit }),
                        }),
                        imageSettings.fit === "manual"
                          ? React.createElement(
                              SimpleGrid,
                              { cols: 2, spacing: "xs" },
                              [
                                ["scale", "크기 비율(%)", 1, 1000],
                                ["x", "X 위치(%)", -100, 200],
                                ["y", "Y 위치(%)", -100, 200],
                              ].map(([key, label, min, max]) =>
                                React.createElement(NumberInput, {
                                  key,
                                  label,
                                  min,
                                  max,
                                  value: imageSettings[key],
                                  onChange: (value) =>
                                    fastFigureUiBridge.applyImageSettings({
                                      ...imageSettings,
                                      [key]: value,
                                    }),
                                }),
                              ),
                            )
                          : null,
                      )
                    : React.createElement(
                        Text,
                        { size: "xs", c: "dimmed" },
                        "이미지를 추가하면 맞춤 및 위치 설정을 사용할 수 있습니다.",
                      ),
                )
              : null,
            csvHeader
              ? React.createElement(NumberInput, {
                  label: "선택 CSV 헤더 줄 수",
                  description: "선택한 프로젝트 CSV에서 헤더로 취급할 줄 수입니다.",
                  min: 0,
                  max: csvHeader.max,
                  step: 1,
                  value: csvHeader.headerLines,
                  onChange: (value) =>
                    fastFigureUiBridge.applyCsvHeader(value, csvHeader.csvId),
                })
              : null,
            chartLayout
              ? React.createElement(
                  Stack,
                  { gap: "xs" },
                  React.createElement(Title, { order: 3, size: "h6" }, "그래프 전역 설정"),
                  React.createElement(TextInput, {
                    key: `graph-title-${chartLayout.chartId}-${chartLayout.title}`,
                    label: "그래프 제목",
                    defaultValue: chartLayout.title,
                    onBlur: (event) =>
                      fastFigureUiBridge.applyChartLayout(
                        { title: event.currentTarget.value },
                        chartLayout.chartId,
                      ),
                    onKeyDown: (event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      event.currentTarget.blur();
                    },
                  }),
                  React.createElement(
                    SimpleGrid,
                    { cols: 3, spacing: "xs" },
                    [
                      ["showLegend", "범례 표시"],
                      ["showTitle", "타이틀 표시"],
                      ["showZeroLine", "0선 표시"],
                    ].map(([key, label]) =>
                      React.createElement(Switch, {
                        key,
                        label,
                        checked: chartLayout.globalSettings[key] === true,
                        onChange: (event) =>
                          fastFigureUiBridge.applyChartLayout(
                            { [key]: event.currentTarget.checked },
                            chartLayout.chartId,
                          ),
                      }),
                    ),
                  ),
                  React.createElement(Select, {
                    label: "그래프 폰트",
                    value: chartLayout.globalSettings.graphFontFamily || "",
                    data: GRAPH_FONT_OPTIONS.map(([value, label]) => ({ value, label })),
                    allowDeselect: false,
                    onChange: (value) =>
                      fastFigureUiBridge.applyChartLayout(
                        { graphFontFamily: value ?? "" },
                        chartLayout.chartId,
                      ),
                  }),
                  React.createElement(
                    SimpleGrid,
                    { cols: 2, spacing: "xs" },
                    [
                      ["titleFontSize", "타이틀 글자 크기"],
                      ["legendFontSize", "범례 글자 크기"],
                    ].map(([key, label]) =>
                      React.createElement(NumberInput, {
                        key: `${key}-${chartLayout.chartId}-${chartLayout.globalSettings[key]}`,
                        label,
                        min: 1,
                        step: 1,
                        placeholder: "자동",
                        defaultValue: chartLayout.globalSettings[key],
                        onBlur: (event) =>
                          fastFigureUiBridge.applyChartLayout(
                            { [key]: event.currentTarget.value },
                            chartLayout.chartId,
                          ),
                        onKeyDown: (event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          event.currentTarget.blur();
                        },
                      }),
                    ),
                  ),
                )
              : null,
            graphFileActions
              ? React.createElement(FastFigureGraphFileActionsStaging, { graphFileActions })
              : null,
            chartLayout
              ? React.createElement(
                  Stack,
                  { gap: "xs" },
                  React.createElement(Title, { order: 3, size: "h6" }, "그래프 축 설정"),
                  React.createElement(
                    Accordion,
                    { variant: "separated" },
                    [
                      ["xBottom", "아래 X축"],
                      ["xTop", "위 X축"],
                      ["yLeft", "왼쪽 Y축"],
                      ["yRight", "오른쪽 Y축"],
                    ].map(([axisKey, label]) =>
                      React.createElement(FastFigureGraphAxisStaging, {
                        key: axisKey,
                        chartLayout,
                        axisKey,
                        label,
                      }),
                    ),
                  ),
                )
              : null,
            graphObjectAdd
              ? React.createElement(FastFigureGraphObjectAddStaging, { graphObjectAdd })
              : null,
            graphPalette
              ? React.createElement(FastFigureGraphPaletteFileStaging, { graphPalette })
              : null,
            graphObjects
              ? React.createElement(FastFigureGraphObjectListStaging, { graphObjects })
              : null,
            graphObject
              ? React.createElement(FastFigureGraphObjectStaging, { graphObject })
              : null,
            React.createElement(Divider),
            React.createElement(Title, { order: 2, size: "h5" }, "선택"),
            React.createElement(
              Group,
              { gap: "xs", justify: "space-between", wrap: "nowrap" },
              React.createElement(Text, { size: "sm", c: "dimmed" }, "Workspace"),
              React.createElement(Text, { size: "sm" }, workspace),
            ),
            React.createElement(
              Group,
              { gap: "xs", justify: "space-between", wrap: "nowrap" },
              React.createElement(Text, { size: "sm", c: "dimmed" }, "Slot"),
              React.createElement(Text, { size: "sm" }, slot ? slot.id : "없음"),
            ),
            React.createElement(
              Group,
              { gap: "xs", justify: "space-between", wrap: "nowrap" },
              React.createElement(Text, { size: "sm", c: "dimmed" }, "Content"),
              React.createElement(Text, { size: "sm" }, slot?.contentType || "없음"),
            ),
            React.createElement(
              Group,
              { gap: "xs", justify: "space-between", wrap: "nowrap" },
              React.createElement(Text, { size: "sm", c: "dimmed" }, "Asset"),
              React.createElement(Text, { size: "sm" }, assetSelection || "none"),
            ),
            React.createElement(
              Menu,
              { position: "bottom-end", withinPortal: true },
              React.createElement(
                Menu.Target,
                null,
                React.createElement(
                  Button,
                  {
                    variant: "default",
                    disabled: !assetActions.nodeType,
                    title: assetActions.title,
                  },
                  "선택 항목 작업",
                ),
              ),
              React.createElement(
                Menu.Dropdown,
                null,
                assetActions.items.length
                  ? assetActions.items.map((item) =>
                      React.createElement(
                        Menu.Item,
                        {
                          key: item.key,
                          disabled: item.disabled,
                          title: item.disabled ? item.disabledTitle : undefined,
                          onClick: () =>
                            fastFigureUiBridge.runAssetAction(item.key, assetActions.context),
                        },
                        item.label,
                      ),
                    )
                  : React.createElement(Menu.Item, { disabled: true }, "사용 가능한 작업 없음"),
              ),
            ),
          ),
        );
      }
      function FastFigureOverlayModalStaging({ opened, title, children }) {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Modal } = MantineCore;
        return React.createElement(
          Modal,
          {
            opened,
            onClose: () => fastFigureUiBridge.send("CLOSE_OVERLAY", { source: "mantine-modal" }),
            title,
            centered: true,
          },
          children,
        );
      }
      function FastFigureDashboardZoomStaging() {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Button, Group, Slider, Stack, Text } = MantineCore,
          [model, setModel] = React.useState(() => readDashboardZoomModel());
        return React.createElement(
          Stack,
          { gap: "xs" },
          React.createElement(
            Group,
            { justify: "space-between", wrap: "nowrap" },
            React.createElement(Text, { size: "sm" }, "대시보드 확대"),
            React.createElement(
              Text,
              { size: "sm", c: "dimmed" },
              `${Math.round(model.zoom)}% · ${Math.round(model.width)}px`,
            ),
          ),
          React.createElement(Slider, {
            min: 50,
            max: 200,
            step: 1,
            value: model.zoom,
            disabled: model.locked,
            onChange: (value) => setModel(setDashboardZoomFromValue(value, false)),
            onChangeEnd: (value) => setModel(setDashboardZoomFromValue(value, true)),
          }),
          React.createElement(
            Group,
            { gap: "xs" },
            React.createElement(
              Button,
              {
                variant: "light",
                onClick: () => setModel(setDashboardZoomLockedFromValue(!model.locked)),
              },
              model.locked ? "폭 고정 해제" : "현재 폭 고정",
            ),
            React.createElement(
              Button,
              {
                variant: "light",
                onClick: () => setModel(resetDashboardZoomFromValue()),
              },
              "100%",
            ),
          ),
        );
      }
      function FastFigureLayoutModalStaging({ opened }) {
        useFastFigureFsmSnapshot();
        let runtime = window.FastFigureUiRuntime,
          snapshot = fastFigureUiBridge.read();
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Button, Group, NumberInput, SimpleGrid, Stack, Switch } = MantineCore,
          buildDraft = () => ({
            gridRows: snapshot.layout.gridRows,
            gridCols: snapshot.layout.gridCols,
            slotStyle: { ...snapshot.layout.slotStyle },
          }),
          [draft, setDraft] = React.useState(buildDraft),
          layoutMapRef = React.useRef(null);
        React.useEffect(() => {
          if (opened) setDraft(buildDraft());
        }, [opened]);
        let setLayoutValue = (key, value) => setDraft((current) => ({ ...current, [key]: value })),
          setSlotStyleValue = (key, value) =>
            setDraft((current) => ({
              ...current,
              slotStyle: { ...current.slotStyle, [key]: value },
            }));
        React.useEffect(() => {
          if (!opened) return;
          requestAnimationFrame(() => fastFigureUiBridge.renderLayoutPreview(layoutMapRef.current));
        });
        return React.createElement(
          FastFigureOverlayModalStaging,
          { opened, title: "레이아웃" },
          React.createElement(
            Stack,
            { gap: "sm" },
            React.createElement(
              SimpleGrid,
              { cols: 2, spacing: "sm" },
              React.createElement(NumberInput, {
                label: "행",
                min: 1,
                max: 8,
                value: draft.gridRows,
                onChange: (value) => setLayoutValue("gridRows", value),
              }),
              React.createElement(NumberInput, {
                label: "열",
                min: 1,
                max: 8,
                value: draft.gridCols,
                onChange: (value) => setLayoutValue("gridCols", value),
              }),
              React.createElement(NumberInput, {
                label: "기준 가로(px)",
                min: 100,
                max: 20000,
                value: draft.slotStyle.referenceWidth,
                onChange: (value) => setSlotStyleValue("referenceWidth", value),
              }),
              React.createElement(NumberInput, {
                label: "칸 간격(px)",
                min: 0,
                max: 2000,
                value: draft.slotStyle.gap,
                onChange: (value) => setSlotStyleValue("gap", value),
              }),
              React.createElement(NumberInput, {
                label: "외곽 여백(px)",
                min: 0,
                max: 5000,
                value: draft.slotStyle.outerMargin,
                onChange: (value) => setSlotStyleValue("outerMargin", value),
              }),
              React.createElement(NumberInput, {
                label: "모서리(px)",
                min: 0,
                max: 2000,
                value: draft.slotStyle.radius,
                onChange: (value) => setSlotStyleValue("radius", value),
              }),
              React.createElement(NumberInput, {
                label: "종횡비",
                min: 0.1,
                max: 10,
                decimalScale: 6,
                value: draft.slotStyle.aspect,
                onChange: (value) => setSlotStyleValue("aspect", value),
              }),
              React.createElement(Switch, {
                label: "기본 경계선",
                checked: !!draft.slotStyle.showBorders,
                onChange: (event) => setSlotStyleValue("showBorders", event.currentTarget.checked),
              }),
              React.createElement(
                Button,
                {
                  variant: "light",
                  onClick: () => setSlotStyleValue("aspect", 1.618),
                },
                "종횡비 초기화",
              ),
            ),
            React.createElement(FastFigureDashboardZoomStaging),
            React.createElement("div", {
              ref: layoutMapRef,
              className: "layout-map",
              style: {
                width: "100%",
                aspectRatio: `${draft.slotStyle.aspect || 1.618} / 1`,
              },
            }),
            React.createElement(
              Group,
              { justify: "space-between", wrap: "wrap" },
              React.createElement(
                Group,
                { gap: "xs" },
                React.createElement(
                  Button,
                  {
                    variant: "light",
                    onClick: () => fastFigureUiBridge.mergeSelectedSlots(),
                  },
                  "선택 슬롯 합치기",
                ),
                React.createElement(
                  Button,
                  {
                    variant: "light",
                    onClick: () => fastFigureUiBridge.splitSelectedSlots(),
                  },
                  "선택 슬롯 나누기",
                ),
              ),
              React.createElement(
                Button,
                { onClick: () => fastFigureUiBridge.applyLayoutSettings(draft) },
                "레이아웃 적용",
              ),
            ),
          ),
        );
      }
      function FastFigureLabelPreviewStaging({ draft, setDraft }) {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React } = runtime,
          dragging = React.useRef(null),
          previewRef = React.useRef(null),
          labelRef = React.useRef(null);
        React.useEffect(() => {
          requestAnimationFrame(() =>
            fastFigureUiBridge.renderLabelPreview(draft, previewRef.current, labelRef.current),
          );
        }, [draft]);
        return React.createElement(
          "div",
          {
            ref: previewRef,
            className: "label-preview",
            "aria-label": "레이블 위치 미리보기",
          },
          React.createElement("div", {
            className: "label-preview-slot",
            "aria-hidden": "true",
          }),
          React.createElement(
            "span",
            {
              ref: labelRef,
              className: "label-preview-label",
              onPointerDown: (event) => {
                event.preventDefault();
                event.stopPropagation();
                let rect = event.currentTarget.getBoundingClientRect();
                dragging.current = {
                  pointerId: event.pointerId,
                  offsetX: event.clientX - rect.left,
                  offsetY: event.clientY - rect.top,
                };
                event.currentTarget.setPointerCapture?.(event.pointerId);
              },
              onPointerMove: (event) => {
                if (dragging.current?.pointerId !== event.pointerId) return;
                let position = fastFigureUiBridge.labelPreviewPosition(
                  event.clientX,
                  event.clientY,
                  dragging.current.offsetX,
                  dragging.current.offsetY,
                  previewRef.current,
                  labelRef.current,
                );
                if (position)
                  setDraft((current) => ({
                    ...current,
                    x: position.x,
                    y: position.y,
                  }));
              },
              onPointerUp: (event) => {
                if (dragging.current?.pointerId !== event.pointerId) return;
                event.currentTarget.releasePointerCapture?.(event.pointerId);
                dragging.current = null;
              },
              onPointerCancel: (event) => {
                if (dragging.current?.pointerId !== event.pointerId) return;
                dragging.current = null;
              },
            },
            "a",
          ),
        );
      }
      function FastFigureLabelModalStaging({ opened }) {
        useFastFigureFsmSnapshot();
        let runtime = window.FastFigureUiRuntime,
          snapshot = fastFigureUiBridge.read();
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Button, Group, NumberInput, Select, SimpleGrid, Stack, Switch } = MantineCore,
          buildDraft = () => ({
            enabled: !!snapshot.labels.enabled,
            ...snapshot.labels.settings,
          }),
          [draft, setDraft] = React.useState(buildDraft);
        React.useEffect(() => {
          if (opened) setDraft(buildDraft());
        }, [opened]);
        let setValue = (key, value) => setDraft((current) => ({ ...current, [key]: value })),
          applyDraft = () => {
            fastFigureUiBridge.setAnnotationEnabled("label", draft.enabled);
            fastFigureUiBridge.applyLabelSettings({
              format: draft.format,
              parentheses: draft.parentheses,
              order: draft.order,
              fontFamily: draft.fontFamily,
              fontSize: draft.fontSize,
            });
            fastFigureUiBridge.applyLabelPosition({ x: draft.x, y: draft.y });
          },
          resetPosition = () => {
            let position = fastFigureUiBridge.resetLabelPosition();
            if (position) setDraft((current) => ({ ...current, ...position }));
          };
        return React.createElement(
          FastFigureOverlayModalStaging,
          { opened, title: "레이블" },
          React.createElement(
            Stack,
            { gap: "sm" },
            React.createElement(Switch, {
              label: "레이블 표시",
              checked: !!draft.enabled,
              onChange: (event) => setValue("enabled", event.currentTarget.checked),
            }),
            React.createElement(FastFigureLabelPreviewStaging, { draft, setDraft }),
            React.createElement(Select, {
              label: "레이블 형식",
              value: draft.format,
              data: [
                { value: "lower-alpha", label: "a, b, c" },
                { value: "upper-alpha", label: "A, B, C" },
                { value: "decimal", label: "1, 2, 3" },
                { value: "lower-roman", label: "i, ii, iii" },
                { value: "upper-roman", label: "I, II, III" },
              ],
              onChange: (value) => value != null && setValue("format", value),
            }),
            React.createElement(Switch, {
              label: "괄호 사용",
              checked: !!draft.parentheses,
              onChange: (event) => setValue("parentheses", event.currentTarget.checked),
            }),
            React.createElement(Select, {
              label: "순서",
              value: draft.order,
              data: [
                { value: "row-major", label: "행 방향 우선" },
                { value: "column-major", label: "열 방향 우선" },
              ],
              onChange: (value) => value != null && setValue("order", value),
            }),
            React.createElement(Select, {
              label: "글꼴",
              value: draft.fontFamily,
              data: [
                { value: "system-ui, sans-serif", label: "기본" },
                { value: "Arial, sans-serif", label: "Arial" },
                { value: "Times New Roman, serif", label: "Times New Roman" },
                { value: "Georgia, serif", label: "Georgia" },
                { value: "Courier New, monospace", label: "Courier New" },
              ],
              onChange: (value) => value != null && setValue("fontFamily", value),
            }),
            React.createElement(
              SimpleGrid,
              { cols: 3, spacing: "sm" },
              React.createElement(NumberInput, {
                label: "글자 크기(px)",
                min: 6,
                value: draft.fontSize,
                onChange: (value) => setValue("fontSize", value),
              }),
              React.createElement(NumberInput, {
                label: "X 위치(px)",
                decimalScale: 2,
                value: draft.x,
                onChange: (value) => setValue("x", value),
              }),
              React.createElement(NumberInput, {
                label: "Y 위치(px)",
                decimalScale: 2,
                value: draft.y,
                onChange: (value) => setValue("y", value),
              }),
            ),
            React.createElement(
              Group,
              { justify: "space-between" },
              React.createElement(Button, { variant: "default", onClick: resetPosition }, "위치 초기화"),
              React.createElement(Button, { onClick: applyDraft }, "레이블 적용"),
            ),
          ),
        );
      }
      function FastFigureCaptionModalStaging({ opened }) {
        useFastFigureFsmSnapshot();
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Button, Group, NumberInput, Select, SimpleGrid, Stack, Switch, Text, TextInput, Textarea } =
            MantineCore,
          readDraft = () => {
            let editor = fastFigureUiBridge.readCaptionEditor();
            return {
              enabled: editor.enabled,
              slotMode: editor.slotMode,
              target: editor.target,
              targetSlotId: editor.targetSlotId,
              text: editor.text,
              name: editor.name,
              nameBold: editor.nameBold,
              fontFamily: editor.settings.fontFamily,
              fontSize: editor.settings.fontSize,
              lineHeight: editor.settings.lineHeight,
            };
          },
          [draft, setDraft] = React.useState(readDraft);
        React.useEffect(() => {
          if (opened) setDraft(readDraft());
        }, [opened]);
        let setValue = (key, value) => setDraft((current) => ({ ...current, [key]: value })),
          applyDraft = () => {
            let editor = fastFigureUiBridge.applyCaptionEditor(draft);
            setDraft({
              enabled: editor.enabled,
              slotMode: editor.slotMode,
              target: editor.target,
              targetSlotId: editor.targetSlotId,
              text: editor.text,
              name: editor.name,
              nameBold: editor.nameBold,
              fontFamily: editor.settings.fontFamily,
              fontSize: editor.settings.fontSize,
              lineHeight: editor.settings.lineHeight,
            });
          };
        return React.createElement(
          FastFigureOverlayModalStaging,
          { opened, title: "캡션" },
          React.createElement(
            Stack,
            { gap: "sm" },
            React.createElement(
              Group,
              { grow: true },
              React.createElement(Switch, {
                label: "캡션 표시",
                checked: !!draft.enabled,
                onChange: (event) => setValue("enabled", event.currentTarget.checked),
              }),
              React.createElement(Switch, {
                label: "슬롯별 캡션",
                checked: !!draft.slotMode,
                onChange: (event) => setValue("slotMode", event.currentTarget.checked),
              }),
            ),
            React.createElement(
              Text,
              { size: "sm" },
              draft.target === "slot" && draft.targetSlotId
                ? `편집 대상: 슬롯 ${draft.targetSlotId}`
                : "편집 대상: 전체 Figure",
            ),
            React.createElement(
              SimpleGrid,
              { cols: 2, spacing: "sm" },
              React.createElement(TextInput, {
                label: "이름",
                value: draft.name,
                disabled: draft.target === "slot",
                onChange: (event) => setValue("name", event.currentTarget.value),
              }),
              React.createElement(Switch, {
                label: "이름 굵게",
                checked: !!draft.nameBold,
                disabled: draft.target === "slot",
                onChange: (event) => setValue("nameBold", event.currentTarget.checked),
              }),
              React.createElement(Select, {
                label: "글꼴",
                value: draft.fontFamily,
                data: [
                  { value: "system-ui, sans-serif", label: "기본" },
                  { value: "Arial, sans-serif", label: "Arial" },
                  { value: "Times New Roman, serif", label: "Times New Roman" },
                  { value: "Georgia, serif", label: "Georgia" },
                  { value: "Courier New, monospace", label: "Courier New" },
                ],
                onChange: (value) => value != null && setValue("fontFamily", value),
              }),
              React.createElement(NumberInput, {
                label: "글자 크기(px)",
                min: 6,
                max: 96,
                value: draft.fontSize,
                onChange: (value) => setValue("fontSize", value),
              }),
              React.createElement(NumberInput, {
                label: "줄간격",
                min: 0.8,
                max: 4,
                step: 0.05,
                decimalScale: 2,
                value: draft.lineHeight,
                onChange: (value) => setValue("lineHeight", value),
              }),
            ),
            React.createElement(Textarea, {
              label: "본문",
              autosize: true,
              minRows: 6,
              value: draft.text,
              onChange: (event) => setValue("text", event.currentTarget.value),
            }),
            React.createElement(
              Group,
              { justify: "space-between" },
              React.createElement(
                Button,
                {
                  variant: "light",
                  onClick: () => {
                    fastFigureUiBridge.insertSlotCaptions();
                    setDraft(readDraft());
                  },
                },
                "슬롯별 캡션 추가",
              ),
              React.createElement(Button, { onClick: applyDraft }, "캡션 적용"),
            ),
          ),
        );
      }
      function FastFigurePrintCaptureStaging({ draft, setStatus }) {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Button } = MantineCore,
          capture = async () => {
            let statusTarget = {
              set textContent(value) {
                setStatus(String(value ?? ""));
              },
            };
            await captureDashboardTargetFromValues(draft, statusTarget);
          };
        return React.createElement(
          Button,
          {
            variant: "light",
            onClick: () => capture().catch(() => {}),
          },
          "캡처",
        );
      }
      function FastFigurePrintModalStaging({ opened }) {
        useFastFigureFsmSnapshot();
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Button, Group, NumberInput, Select, SimpleGrid, Stack, Text } = MantineCore,
          readDraft = () => {
            let snapshot = fastFigureUiBridge.read();
            return {
              width: Math.max(100, Math.round(snapshot.layout.slotStyle.referenceWidth)),
              height: "",
              dpi: 300,
              format: "png",
            };
          },
          [draft, setDraft] = React.useState(readDraft),
          [status, setStatus] = React.useState("");
        React.useEffect(() => {
          if (!opened) return;
          setDraft(readDraft());
          setStatus("");
        }, [opened]);
        let setValue = (key, value) => setDraft((current) => ({ ...current, [key]: value })),
          exportDraft = async () => {
            let statusTarget = {
                set textContent(value) {
                  setStatus(String(value ?? ""));
                },
              },
              result = await fastFigureUiBridge.exportTarget(draft, statusTarget);
            if (result?.height != null && Number(draft.height) > 0)
              setValue("height", result.height);
          };
        return React.createElement(
          FastFigureOverlayModalStaging,
          { opened, title: "출력" },
          React.createElement(
            Stack,
            { gap: "sm" },
            React.createElement(
              SimpleGrid,
              { cols: 2, spacing: "sm" },
              React.createElement(NumberInput, {
                label: "가로(px)",
                min: 100,
                max: 20000,
                value: draft.width,
                onChange: (value) => setValue("width", value),
              }),
              React.createElement(NumberInput, {
                label: "세로(px)",
                min: 100,
                max: 20000,
                placeholder: "자동",
                value: draft.height,
                onChange: (value) => setValue("height", value),
              }),
              React.createElement(NumberInput, {
                label: "DPI",
                min: 36,
                max: 1200,
                value: draft.dpi,
                onChange: (value) => setValue("dpi", value),
              }),
              React.createElement(Select, {
                label: "형식",
                value: draft.format,
                data: [
                  { value: "png", label: "PNG" },
                  { value: "jpeg", label: "JPEG" },
                ],
                onChange: (value) => value != null && setValue("format", value),
              }),
            ),
            status ? React.createElement(Text, { size: "sm" }, status) : null,
            React.createElement(
              Group,
              { justify: "flex-end" },
              React.createElement(FastFigurePrintCaptureStaging, { draft, setStatus }),
              React.createElement(
                Button,
                { onClick: () => exportDraft().catch(() => {}) },
                "저장",
              ),
            ),
          ),
        );
      }
      function FastFigureReadmeContentStaging() {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Box, ScrollArea } = MantineCore;
        return React.createElement(
          ScrollArea,
          { h: "70vh", type: "auto" },
          React.createElement(Box, {
            pr: "sm",
            style: { fontSize: 14, lineHeight: 1.5 },
            dangerouslySetInnerHTML: { __html: fastFigureUiBridge.readReadmeHtml() },
          }),
        );
      }
      function FastFigureOverlayHostStaging() {
        useFastFigureFsmSnapshot();
        let runtime = window.FastFigureUiRuntime,
          snapshot = fastFigureUiBridge.read();
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Code, Stack, Text } = MantineCore,
          summary = (value) =>
            React.createElement(
              Stack,
              { gap: "xs" },
              React.createElement(
                Text,
                { size: "sm", c: "dimmed" },
                "Commit B staging: 기존 domain 값을 읽기 전용으로 표시합니다.",
              ),
              React.createElement(Code, { block: true }, JSON.stringify(value, null, 2)),
            );
        return React.createElement(
          React.Fragment,
          null,
          React.createElement(
            FastFigureLayoutModalStaging,
            { opened: snapshot.fsm.overlay === "layout" },
          ),
          React.createElement(
            FastFigureLabelModalStaging,
            { opened: snapshot.fsm.overlay === "label" },
          ),
          React.createElement(
            FastFigureCaptionModalStaging,
            { opened: snapshot.fsm.overlay === "caption" },
          ),
          React.createElement(
            FastFigurePrintModalStaging,
            { opened: snapshot.fsm.overlay === "print" },
          ),
          React.createElement(
            FastFigureOverlayModalStaging,
            { opened: snapshot.fsm.overlay === "readme", title: "README" },
            React.createElement(
              FastFigureReadmeContentStaging,
            ),
          ),
        );
      }
      function FastFigureWorkspaceStaging() {
        let runtime = window.FastFigureUiRuntime;
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Box } = MantineCore;
        return React.createElement(
          Box,
          {
            component: "main",
            p: "sm",
            style: { flex: "1 1 auto", minWidth: 0 },
            "data-fast-figure-ui": "workspace",
          },
          React.createElement(
            "div",
            { id: "graphArea", className: "graph-area" },
            React.createElement("div", {
              id: "dashboard",
              className: "dashboard",
              style: { "--grid-cols": 2, "--grid-rows": 2 },
            }),
            React.createElement(
              "div",
              { id: "dashboardCaption", className: "dashboard-caption hidden" },
              React.createElement("span", {
                id: "captionPrefix",
                className: "caption-prefix hidden",
              }),
              React.createElement("span", {
                id: "captionText",
                className: "caption-body",
                contentEditable: true,
                suppressContentEditableWarning: true,
                role: "textbox",
                "aria-multiline": "true",
                "data-placeholder": "전체 그래프 캡션을 입력하세요.",
              }),
            ),
          ),
        );
      }
      function FastFigureShellStaging() {
        useFastFigureFsmSnapshot();
        let runtime = window.FastFigureUiRuntime,
          snapshot = fastFigureUiBridge.read();
        if (!runtime) throw Error("Fast Figure UI runtime이 준비되지 않았습니다.");
        let { React, MantineCore } = runtime,
          { Box, Group, Stack, Text, Title } = MantineCore;
        return React.createElement(
          Stack,
          { gap: 0, "data-fast-figure-ui": "shell-staging" },
          React.createElement(
            Box,
            { component: "header", p: "sm" },
            React.createElement(Title, { order: 1, size: "h3" }, "Fast figure"),
            React.createElement(FastFigureToolbarStaging),
          ),
          React.createElement(
            Group,
            { align: "stretch", gap: 0, wrap: "nowrap" },
            React.createElement(FastFigureSidebarStaging),
            React.createElement(FastFigureWorkspaceStaging),
          ),
          React.createElement(FastFigureOverlayHostStaging),
        );
      }
      window.FastFigureReactShell = Object.freeze({
        FastFigureToolbarStaging,
        FastFigureSidebarStaging,
        FastFigureOverlayModalStaging,
        FastFigureLayoutModalStaging,
        FastFigureLabelModalStaging,
        FastFigureCaptionModalStaging,
        FastFigurePrintModalStaging,
        FastFigureReadmeContentStaging,
        FastFigureOverlayHostStaging,
        FastFigureShellStaging,
      });
      const REQUIRED_CONTROL_IDS = [
        "addGraphObject",
        "assetActions",
        "assetActionMenu",
        "assetDownload",
        "assetTree",
        "csvSelectionPanel",
        "imageSelectionPanel",
        "deleteSelectedAsset",
        "applyGrid",
        "applyUiPalette",
        "barLineWidth",
        "barOpacity",
        "barOptions",
        "buildBox",
        "captionFontFamily",
        "captionFontSize",
        "captionLineHeight",
        "captionName",
        "captionNameBold",
        "captionPanel",
        "captionPrefix",
        "captionText",
        "captionToggle",
        "captionTargetInfo",
        "capturePrint",
        "chartType",
        "clearDebug",
        "closeReadme",
        "dashboard",
        "dashboardAspect",
        "dashboardCaption",
        "dashboardOuterMargin",
        "dashboardZoom",
        "dashboardZoomLock",
        "dashboardZoomReset",
        "debugLog",
        "exportPlotlyJson",
        "exportProject",
        "exportSlotJson",
        "file",
        "fileName",
        "filePick",
        "fileTypeHint",
        "fontColor",
        "graphArea",
        "graphObjects",
        "headerLines",
        "headerLinesLabel",
        "gridCols",
        "gridRows",
        "imageBox",
        "imageFitMode",
        "imageManualFields",
        "imagePositionX",
        "imagePositionY",
        "imagePreview",
        "imageScale",
        "insertEmptyImage",
        "insertSlotCaptions",
        "importProject",
        "importProjectFile",
        "importSlotJson",
        "importSlotJsonFile",
        "editorEditable",
        "labelFontFamily",
        "labelFontSize",
        "labelFormat",
        "labelOrder",
        "labelParentheses",
        "labelPanel",
        "labelPositionReset",
        "labelPositionX",
        "labelPositionY",
        "labelPreview",
        "labelPreviewLabel",
        "labelToggle",
        "layoutMap",
        "layoutPanel",
        "layoutResize",
        "layoutToggle",
        "legendName",
        "lineDash",
        "lineOptions",
        "lineWidth",
        "loadGraphPalette",
        "loadGraphPaletteFile",
        "markerOptions",
        "markerSize",
        "markerSymbol",
        "mergeSlots",
        "paperColor",
        "preview",
        "printDpi",
        "printFormat",
        "printHeight",
        "printPanel",
        "printStatus",
        "printToggle",
        "printWidth",
        "projectBox",
        "projectName",
        "readmeDialog",
        "readmeToggle",
        "resetDashboardAspect",
        "resetGraphPalette",
        "resetSelectedSlot",
        "resetUiPalette",
        "saveDebug",
        "saveGraphPalette",
        "savePrint",
        "showLegend",
        "showSlotBorders",
        "showTitle",
        "showZeroLine",
        "sidebarResizer",
        "sidebarToggle",
        "slotGap",
        "slotCaptionMode",
        "slotRadius",
        "slotTypeControls",
        "slotTypeGraph",
        "slotTypeImage",
        "splitSlot",
        "status",
        "tableWrap",
        "targetInfo",
        "title",
        "toggleDebug",
        "uiBackgroundColor",
        "uiColor",
        "uiDisabledBgColor",
        "uiDisabledTextColor",
        "uiMutedColor",
        "uiShadowColor",
        "uiSubtleColor",
        "uiSurfaceColor",
        "xAxisSide",
        "xCol",
        "yAxisSide",
        "yCol",
      ];
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
        ["configFromForm", () => typeof configFromForm === "function"],
        ["axisFields", () => typeof axisFields === "function"],
        ["traces", () => typeof traces === "function"],
        ["layout", () => typeof layout === "function"],
        ["renderDashboard", () => typeof renderDashboard === "function"],
        ["makeSlots", () => typeof makeSlots === "function"],
        ["applyGraphSettings", () => typeof applyGraphSettings === "function"],
        ["applyImageSettings", () => typeof applyImageSettings === "function"],
        ["projectClone", () => typeof projectClone === "function"],
        ["ProjectObject", () => activeProject instanceof ProjectObject],
        ["buildProjectObject", () => typeof buildProjectObject === "function"],
        ["validateProjectObject", () => typeof validateProjectObject === "function"],
        ["renderProjectObject", () => typeof renderProjectObject === "function"],
        ["projectObjects", () => projectObjects instanceof ProjectObjectRegistry],
        ["appFSM", () => appFSM instanceof ApplicationStateMachine],
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
      function auditApp(context = "manual", { requireLegacyControls = true } = {}) {
        let issues = [],
          ids = [...document.querySelectorAll("[id]")].map((node) => node.id),
          duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
          missingControls = requireLegacyControls
            ? REQUIRED_CONTROL_IDS.filter((id) => !document.getElementById(id))
            : [],
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
        let overlayPanels = {
          layout: "layoutPanel",
          label: "labelPanel",
          caption: "captionPanel",
          print: "printPanel",
        };
        Object.entries(overlayPanels).forEach(([state, id]) => {
          let visible = !$(id).classList.contains("hidden");
          if (visible !== (appFSM.state.overlay === state))
            issues.push({
              kind: "fsm-overlay-panel-out-of-sync",
              overlay: appFSM.state.overlay,
              panel: state,
              visible,
            });
          let toggle = $(`${state}Toggle`);
          if (
            toggle &&
            (toggle.classList.contains("active") !== (appFSM.state.overlay === state) ||
              toggle.getAttribute("aria-expanded") !==
                String(appFSM.state.overlay === state))
          )
            issues.push({
              kind: "fsm-overlay-highlight-out-of-sync",
              overlay: appFSM.state.overlay,
              toggle: state,
            });
        });
        let popupExpected = ["layout", "label", "caption", "print"].includes(
            appFSM.state.overlay,
          ),
          main = $("dashboard").closest("main");
        if (main.classList.contains("dashboard-popup-open") !== popupExpected)
          issues.push({
            kind: "fsm-popup-highlight-out-of-sync",
            overlay: appFSM.state.overlay,
          });
        if (main.classList.contains("layout-open") !== (appFSM.state.overlay === "layout"))
          issues.push({
            kind: "fsm-layout-highlight-out-of-sync",
            overlay: appFSM.state.overlay,
          });
        if ($("readmeDialog").open !== (appFSM.state.overlay === "readme"))
          issues.push({
            kind: "fsm-readme-out-of-sync",
            overlay: appFSM.state.overlay,
            open: $("readmeDialog").open,
          });
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
        if (typeof activeProject.slotCaptionsEnabled !== "boolean")
          issues.push({
            kind: "invalid-slot-caption-mode",
            value: activeProject.slotCaptionsEnabled,
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
      function installHelpPopups() {
        let popup = document.createElement("div");
        popup.id = "helpPopup";
        popup.className = "help-popup hidden";
        document.body.append(popup);
        document.addEventListener(
          "click",
          (e) => {
            let label = e.target.closest?.("label");
            if (label && label.querySelector(".help") && !e.target.closest?.(".help"))
              e.preventDefault();
          },
          true,
        );
        document.addEventListener("click", (e) => {
          let button = e.target.closest?.(".help");
          if (!button) {
            popup.classList.add("hidden");
            popup.dataset.owner = "";
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          let rect = button.getBoundingClientRect();
          popup.textContent = button.dataset.help || "";
          popup.style.left = `${Math.min(rect.left, window.innerWidth - 276)}px`;
          popup.style.top = `${Math.min(rect.bottom + 6, window.innerHeight - 100)}px`;
          popup.classList.toggle("hidden", popup.dataset.owner === button.dataset.help);
          popup.dataset.owner = popup.classList.contains("hidden") ? "" : button.dataset.help;
        });
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
      function syncAxisTickModeControl(key, mode, minorTicks = false) {
        let button = $(key + "TickMode"),
          tickInput = $(key + "Tick"),
          logScale = $(key + "ScaleType")?.value === "log",
          normalized = !logScale && mode === "increment" ? "increment" : "plotly";
        if (!button) return;
        button.dataset.mode = normalized;
        button.dataset.minorTicks = String(minorTicks === true);
        if (logScale) {
          button.textContent = minorTicks === true ? "minor tick 해제" : "minor tick 표시";
          button.setAttribute("aria-pressed", String(minorTicks === true));
          button.title = "major tick은 유지하고 로그축의 minor tick과 보조 격자만 전환";
        } else {
          button.textContent = normalized === "increment" ? "increment" : "tick 간격";
          button.setAttribute("aria-pressed", String(normalized === "increment"));
          button.title =
            normalized === "increment"
              ? "divide 적용 후 표시되는 축 값의 등간격"
              : "Plotly dtick 좌표 간격";
        }
        if (tickInput) {
          tickInput.hidden = logScale;
          tickInput.disabled = logScale;
        }
      }
      function axisFields() {
        let labels = {
          xBottom: "아래 X축",
          xTop: "위 X축",
          yLeft: "왼쪽 Y축",
          yRight: "오른쪽 Y축",
        };
        Object.entries(labels).forEach(([key, label]) => {
          let visible = key === "xBottom" || key === "yLeft",
            box = $(key + "Fields");
          if (!box) return;
          box.innerHTML = `<label>축 이름</label><input id="${key}Title" placeholder="${label}"><div class="row"><input id="${key}Min" type="number" placeholder="최소"><input id="${key}Max" type="number" placeholder="최대"></div><button id="${key}TickMode" type="button" class="light axis-tick-mode" data-mode="plotly" aria-pressed="false">tick 간격</button><input id="${key}Tick" type="number" step="any" placeholder="자동"><label>표기</label><select id="${key}Notation"><option value="none">숫자</option><option value="power">지수</option><option value="e">과학 표기</option></select><label>축 유형</label><select id="${key}ScaleType"><option value="linear">선형</option><option value="log">로그</option><option value="reciprocal">역수</option></select><label>값 나누기</label><input id="${key}Divide" type="number" value="1" step="any"><div class="row"><div><label>축 이름 크기</label><input id="${key}TitleSize" type="number" value="14"></div><div><label>숫자 크기</label><input id="${key}FontSize" type="number" value="12"></div></div><div class="row"><div><label>축선 굵기</label><input id="${key}LineWidth" type="number" value="1" min="0"></div><button id="${key}Grid" type="button" class="light setting-toggle active" data-active="true" aria-pressed="true">격자 표시</button><button id="${key}Visible" type="button" class="light setting-toggle${visible ? " active" : ""}" data-active="${visible}" aria-pressed="${visible}">축 표시</button><button id="${key}Values" type="button" class="light setting-toggle active" data-active="true" aria-pressed="true">값 표시</button></div>`;
          let tickMode = $(key + "TickMode");
          syncAxisTickModeControl(key, "plotly");
          tickMode.onclick = () => {
            if ($(key + "ScaleType").value === "log") {
              syncAxisTickModeControl(
                key,
                "plotly",
                tickMode.dataset.minorTicks !== "true",
              );
              applyGraphLayoutSettings();
              return;
            }
            let next = tickMode.dataset.mode === "increment" ? "plotly" : "increment";
            syncAxisTickModeControl(key, next);
            applyGraphLayoutSettings();
          };
          $(key + "ScaleType").addEventListener("change", () =>
            syncAxisTickModeControl(
              key,
              tickMode.dataset.mode,
              tickMode.dataset.minorTicks === "true",
            ),
          );
        });
      }
      function graphColorInputs() {}
      function graphPalette() {
        return (
          editing?.editor?.objects?.map((object) => object.color).filter(Boolean) || DEFAULT_COLORS
        );
      }
      function slotStyleFromValues(values = {}) {
        return {
          referenceWidth: readProjectNumber(
            values.referenceWidth,
            DEFAULT_SLOT_STYLE.referenceWidth,
            100,
            20000,
          ),
          gap: readProjectNumber(
            values.gap,
            DEFAULT_SLOT_STYLE.gap,
            0,
            2000,
          ),
          outerMargin: readProjectNumber(
            values.outerMargin,
            DEFAULT_SLOT_STYLE.outerMargin,
            0,
            5000,
          ),
          radius: readProjectNumber(
            values.radius,
            DEFAULT_SLOT_STYLE.radius,
            0,
            2000,
          ),
          aspect: readProjectNumber(
            values.aspect,
            DEFAULT_SLOT_STYLE.aspect,
            0.1,
            10,
          ),
          showBorders:
            values.showBorders == null ? DEFAULT_SLOT_STYLE.showBorders : !!values.showBorders,
        };
      }
      function slotStyleFromControls() {
        return slotStyleFromValues({
          referenceWidth: $("dashboardReferenceWidth")?.value,
          gap: $("slotGap")?.value,
          outerMargin: $("dashboardOuterMargin")?.value,
          radius: $("slotRadius")?.value,
          aspect: $("dashboardAspect")?.value,
          showBorders: $("showSlotBorders").dataset.active === "true",
        });
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
        let referenceWidth = dashboardReferenceWidth(),
          scale = Math.max(0.001, Number(width) / referenceWidth),
          configuredAspect = dashboardAspectValue(),
          naturalHeight = (referenceWidth * scale) / configuredAspect,
          height =
            Number.isFinite(heightOverride) && heightOverride > 0
              ? Number(heightOverride)
              : naturalHeight,
          aspect = (referenceWidth * scale) / height,
          outerMargin = Math.min(
            dashboardOuterMarginPixels() * scale,
            Math.min(referenceWidth * scale, height) * 0.49,
          );
        return {
          referenceWidth,
          width: referenceWidth * scale,
          height,
          scale,
          aspect,
          outerMargin,
          gap: slotGapPixels() * scale,
          radius: slotRadiusPixels() * scale,
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
          width: Math.max(1, colWidth * target.colSpan + gap * (target.colSpan - 1)),
          height: Math.max(1, rowHeight * target.rowSpan + gap * (target.rowSpan - 1)),
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
      function syncLegacySlotStyleControls(style = activeProject.layout.slotStyle) {
        $("dashboardReferenceWidth").value = style.referenceWidth;
        $("slotGap").value = style.gap;
        $("dashboardOuterMargin").value = style.outerMargin;
        $("slotRadius").value = style.radius;
        $("dashboardAspect").value = style.aspect;
        syncSettingToggle("showSlotBorders", style.showBorders);
      }
      function applySlotStyle(fromControls = true, notify = true, syncControls = true) {
        if (fromControls) activeProject.layout.slotStyle = slotStyleFromControls();
        let style = activeProject.layout.slotStyle,
          bordersVisible = style.showBorders,
          border = bordersVisible ? "var(--ui-color)" : "transparent",
          aspect = style.aspect,
          hasAspect = Number.isFinite(aspect) && aspect > 0,
          dashboard = $("dashboard");
        if (syncControls) syncLegacySlotStyleControls(style);
        ["dashboard", "layoutMap", "dashboardCaption"].forEach((id) => {
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
          applyReferenceGeometry($("layoutMap"));
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
          content: {
            chart: null,
            imageId: null,
            contentType: "graph",
            caption: null,
          },
        });
      }
      function rebuildGridSlots(r, c) {
        let old = activeProject.slots
          .filter((s) => !s.hidden)
          .map((s) => ({
            row: s.row,
            col: s.col,
            rowSpan: s.rowSpan || 1,
            colSpan: s.colSpan || 1,
            content: {
              ...projectClone(s.content),
              chart:
                s.chart && activeProject.charts.some((chart) => chart.id === s.chart)
                  ? s.chart
                  : null,
              imageId: getProjectImage(s.imageId) ? s.imageId : null,
              contentType: s.contentType || "graph",
              caption: typeof s.caption === "string" ? s.caption : null,
            },
          }));
        let occupied = old.filter((s) => s.content.chart || s.content.imageId),
          preserveCoordinates = occupied.every(
            (s) =>
              s.row >= 1 &&
              s.col >= 1 &&
              s.row + s.rowSpan - 1 <= r &&
              s.col + s.colSpan - 1 <= c,
          );
        activeProject.gridRows = r;
        activeProject.gridCols = c;
        activeProject.slots = [];
        for (let i = 0; i < r * c; i++)
          activeProject.slots.push(newGridSlot(i, Math.floor(i / c) + 1, (i % c) + 1));
        if (preserveCoordinates) {
          occupied.forEach((source) => {
            let target = activeProject.slots.find(
              (slot) => slot.row === source.row && slot.col === source.col,
            );
            Object.assign(target, source, { id: target.id });
            for (let row = source.row; row < source.row + source.rowSpan; row++)
              for (let col = source.col; col < source.col + source.colSpan; col++) {
                if (row === source.row && col === source.col) continue;
                let covered = activeProject.slots.find((slot) => slot.row === row && slot.col === col);
                if (covered) covered.hidden = true;
              }
          });
        } else
          activeProject.slots.forEach((slot, i) => {
            let source = old[i];
            if (!source) return;
            Object.assign(slot, source, {
              id: slot.id,
              row: slot.row,
              col: slot.col,
              rowSpan: 1,
              colSpan: 1,
            });
          });
        activeProject.slots.filter((s) => !s.hidden).forEach((s) => {
          if (slotImage(s)) normalizeImageSettings(slotImage(s));
          let chart = s.chart && getChart(s.chart);
        });
        if (activeProject.slotCaptionsEnabled) initializeSlotCaptions();
        selectedSlotId = null;
        layoutSelected.clear();
        renderDashboard();
      }
      function makeSlots(r = activeProject.gridRows, c = activeProject.gridCols) {
        appFSM.send("GRID_LAYOUT_CHANGED", { rows: r, cols: c });
      }
      function parseCSV(text) {
        const d = (text.split(/\r?\n/)[0] || "").includes("\t") ? "\t" : ",";
        let a = [],
          r = [],
          c = "",
          q = false;
        for (let i = 0; i < text.length; i++) {
          let z = text[i],
            n = text[i + 1];
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
            if (r.some((v) => v.trim())) a.push(r.splice(0));
            c = "";
          } else c += z;
        }
        if (c || r.length) {
          r.push(c);
          if (r.some((v) => v.trim())) a.push(r);
        }
        return a;
      }
      function dataTable(data) {
        if (!Array.isArray(data) || !data.length) throw Error("행이 하나 이상이어야 합니다.");
        if (Array.isArray(data[0]))
          return data.map((row) => (Array.isArray(row) ? row.map((value) => value ?? "") : []));
        if (typeof data[0] === "object" && data[0] !== null) {
          let headers = [...new Set(data.flatMap((row) => Object.keys(row || {})))];
          return [headers, ...data.map((row) => headers.map((header) => row?.[header] ?? ""))];
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
      function buildProjectImageModel(bytes, name, mime, id, settings = null) {
        let model = {
          id,
          name: projectCsvName(name, "image.bin"),
          directory: PROJECT_ASSET_DIRECTORIES.image,
          mime: typeof mime === "string" && mime ? mime : "application/octet-stream",
          bytesBase64:
            typeof bytes === "string" ? bytes : ffpxBytesToBase64(bytes || new Uint8Array()),
          settings:
            settings && typeof settings === "object"
              ? projectClone(settings)
              : { fit: "contain", scale: 100, x: 50, y: 50 },
        };
        projectVfs.assignUniqueLocation(model, PROJECT_ASSET_DIRECTORIES.image);
        if (!model.bytesBase64) throw Error("이미지 데이터가 비어 있습니다.");
        normalizeImageSettings(model);
        return model;
      }
      function createProjectImage(bytes, name, mime, id = null, settings = null, path = null) {
        let model = buildProjectImageModel(
          bytes,
          name,
          mime,
          Number.isInteger(id) && id > 0 ? id : activeProject.imageId,
          settings,
        );
        if (path) projectVfs.assignLocation(model, path);
        appFSM.send("IMAGE_OBJECT_CREATED", {
          model,
          imageId: model.id,
          direction: "fsm-to-model",
        });
        return model;
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
                  new TextEncoder().encode(ffpxCsv(dataTable(data))),
                ),
          mime: typeof mime === "string" && mime ? mime : "text/csv",
          headerLines: headerLineCount(headerLines, data),
        };
        projectVfs.assignUniqueLocation(model, PROJECT_ASSET_DIRECTORIES.csv);
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
        let model = buildProjectCsvModel(
          data,
          name,
          Number.isInteger(id) && id > 0 ? id : activeProject.csvId,
          bytesBase64,
          mime,
          headerLines,
        );
        if (path) projectVfs.assignLocation(model, path);
        appFSM.send("DATA_OBJECT_CREATED", {
          model,
          csvId: model.id,
          direction: "fsm-to-model",
        });
        return model;
      }
      function requireProjectCsv(chart, label = "차트", collection = activeProject.csvFiles) {
        let csv = getProjectCsv(
          chart?.editor?.objects?.[0]?.csvId ?? chart?.csvId,
          collection,
        );
        if (!csv) throw Error(`${label}가 참조하는 프로젝트 CSV가 없습니다.`);
        return csv;
      }
      function defaultCsvModel(id = null) {
        let rows = [
            ["X", "Y"],
            ["", ""],
          ];
        let model = {
          id,
          name: "빈 CSV.csv",
          directory: PROJECT_ASSET_DIRECTORIES.csv,
          rows,
          bytesBase64: ffpxBytesToBase64(
            new TextEncoder().encode(ffpxCsv(rows)),
          ),
          mime: "text/csv",
          headerLines: 1,
          isDefaultEmpty: true,
        };
        return model;
      }
      function ensureDefaultCsv() {
        let csv = activeProject.csvFiles.find((item) => item.isDefaultEmpty === true);
        if (csv) return csv;
        let model = defaultCsvModel();
        csv = createProjectCsv(
          model.rows,
          model.name,
          model.id,
          model.bytesBase64,
          model.mime,
          model.headerLines,
        );
        csv.isDefaultEmpty = model.isDefaultEmpty;
        return csv;
      }
      function reuseImportedDefaultCsv(
        csvList,
        chartList,
        defaultCsv,
        defaultReferenceId = defaultCsv.id,
      ) {
        let reusedIds = new Set(
          csvList
            .filter(
              (csv) =>
                csv.name === defaultCsv.name &&
                csv.bytesBase64 === defaultCsv.bytesBase64,
            )
            .map((csv) => csv.id),
        );
        if (!reusedIds.size) return csvList;
        for (let chart of chartList) {
          for (let object of chart?.editor?.objects || []) {
            if (reusedIds.has(object.csvId)) object.csvId = defaultReferenceId;
          }
        }
        return csvList.filter((csv) => !reusedIds.has(csv.id));
      }
      function chartCsvIds(chart) {
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
      function planProjectAssetImport(file, directory, reservedPaths = null) {
        let kind = slotFileKind(file),
          assetKind = kind === "data" ? "csv" : kind === "image" ? "image" : null;
        if (!assetKind) throw Error(`${file?.name || "파일"}: 지원하지 않는 파일 형식입니다.`);
        let parent = normalizeProjectPath(directory, { directory: true }),
          name = projectCsvName(file.name, assetKind === "csv" ? "data.csv" : "image.bin"),
          path = normalizeProjectPath(`${parent}/${name}`),
          collision = projectVfs.resolve(path);
        if (!collision && !reservedPaths?.has(path)) return { path, replaceId: null };
        if (collision?.kind === assetKind && collision.asset.isDefaultEmpty !== true) {
          let replace = window.confirm(
            `${path}에 같은 이름의 파일이 이미 있습니다.\n\n` +
              "[확인] 기존 파일을 교체하고 참조를 유지합니다.\n" +
              "[취소] 이름을 바꿔 새 파일로 추가합니다.",
          );
          if (replace) return { path, replaceId: collision.asset.id };
        } else if (collision) {
          window.alert(
            collision.asset?.isDefaultEmpty === true
              ? `${path}는 프로젝트 기본 CSV이므로 교체할 수 없습니다. 이름을 바꿔 추가합니다.`
              : `${path}의 기존 항목은 종류가 달라 참조를 유지한 채 교체할 수 없습니다. 이름을 바꿔 추가합니다.`,
          );
        }
        let unique = projectVfs.uniquePath(parent, name, activeProject._state, reservedPaths);
        return {
          path: unique,
          replaceId: null,
        };
      }
      const ASSET_TREE_INDENT_PX = 16;
      function assetTreeDepth(path) {
        return Math.max(0, String(path || "").split("/").filter(Boolean).length - 1);
      }
      function setAssetTreeRowDepth(row, path, baseIndent = 0) {
        row.style.paddingLeft = `${baseIndent + assetTreeDepth(path) * ASSET_TREE_INDENT_PX}px`;
      }
      function appendAssetTreeItem(list, name, meta = "", depth = 0) {
        let item = document.createElement("div"),
          icon = document.createElement("span"),
          label = document.createElement("span");
        item.className = "asset-tree-row asset-tree-item";
        item.style.paddingLeft = `${32 + Math.max(0, Number(depth) || 0) * ASSET_TREE_INDENT_PX}px`;
        icon.className = "asset-tree-icon file";
        icon.setAttribute("aria-hidden", "true");
        setIconoirIcon(icon, "page");
        label.className = "asset-tree-label";
        label.textContent = name;
        item.append(icon, label);
        if (meta) {
          let detail = document.createElement("span");
          detail.className = "asset-tree-meta";
          detail.textContent = meta;
          item.append(detail);
        }
        list.append(item);
      }
      function appendAssetTreeButton(list, name, meta, options = {}) {
        let button = document.createElement("div"),
          icon = document.createElement("span"),
          label = document.createElement("span");
        button.className = "asset-tree-row asset-tree-button";
        button.setAttribute("role", "treeitem");
        button.tabIndex = 0;
        button.classList.toggle("active", options.active === true);
        button.classList.toggle("inactive", options.inactive === true);
        button.setAttribute("aria-selected", String(options.active === true));
        if (options.path) setAssetTreeRowDepth(button, options.path);
        if (options.inactive === true) button.setAttribute("aria-disabled", "true");
        if (options.path && options.assetKind) {
          button.draggable = true;
          button.dataset.assetPath = options.path;
          button.dataset.assetKind = options.assetKind;
        }
        button.title = name;
        icon.className = `asset-tree-icon ${options.assetKind === "image" ? "image" : "file"}`;
        icon.setAttribute("aria-hidden", "true");
        setIconoirIcon(icon, options.assetKind === "image" ? "media-image" : "page");
        label.className = "asset-tree-label";
        label.textContent = name;
        button.append(icon, label);
        if (meta) {
          let detail = document.createElement("span");
          detail.className = "asset-tree-meta";
          detail.textContent = meta;
          button.append(detail);
        }
        if (typeof options.onclick === "function" && options.inactive !== true)
          button.onclick = options.onclick;
        if (typeof options.onclick === "function" && options.inactive !== true)
          button.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            options.onclick(event);
          });
        list.append(button);
      }
      function createAssetTreeBranch(label, open = true, path = "") {
        let branch = document.createElement("details"),
          summary = document.createElement("summary"),
          twistie = document.createElement("span"),
          icon = document.createElement("span"),
          name = document.createElement("span"),
          list = document.createElement("div");
        branch.open = open;
        summary.className = "asset-tree-row asset-tree-directory";
        if (path) setAssetTreeRowDepth(summary, path);
        twistie.className = "asset-tree-twistie";
        twistie.setAttribute("aria-hidden", "true");
        setIconoirIcon(twistie, "nav-arrow-right");
        icon.className = `asset-tree-icon ${path.startsWith("/slots") ? "slot" : "folder"}`;
        icon.setAttribute("aria-hidden", "true");
        setIconoirIcon(icon, path.startsWith("/slots") ? "view-grid" : "folder");
        name.className = "asset-tree-label";
        name.textContent = label;
        summary.append(twistie, icon, name);
        if (path) {
          branch.dataset.path = path;
          summary.dataset.path = path;
        }
        summary.setAttribute("role", "treeitem");
        summary.setAttribute("aria-expanded", String(open));
        list.className = "asset-tree-list";
        list.setAttribute("role", "group");
        branch.addEventListener("toggle", () =>
          summary.setAttribute("aria-expanded", String(branch.open)),
        );
        branch.append(summary, list);
        return { branch, list };
      }
      const ASSET_TREE_ACTION_SCHEMA = Object.freeze({
        directory: Object.freeze([
          Object.freeze({
            key: "create-directory",
            label: "새 폴더",
            when: (context) =>
              context.path !== PROJECT_TRASH_DIRECTORY && context.inactive !== true,
          }),
          Object.freeze({
            key: "empty-trash",
            label: "비우기",
            when: (context) => context.path === PROJECT_TRASH_DIRECTORY,
            disabled: (context) => context.hasTrashContents !== true,
            disabledTitle: "휴지통이 비어 있습니다.",
          }),
        ]),
        csv: Object.freeze([
          Object.freeze({
            key: "select-csv",
            label: "선택",
            disabled: (context) => context.inactive === true,
          }),
        ]),
        image: Object.freeze([
          Object.freeze({
            key: "select-image",
            label: "선택",
            disabled: (context) => context.inactive === true,
          }),
        ]),
      });
      const ASSET_TREE_ACTION_HANDLERS = Object.freeze({
        "create-directory": (context) => createAssetDirectory(context.path),
        "empty-trash": () => emptyProjectTrash(),
        "select-csv": (context) => selectCsvFromTree(context.path),
        "select-image": (context) => selectImageFromTree(context.path),
      });
      function assetTreeActionItems(nodeType = null, context = null) {
        if (!nodeType || !context) return [];
        return (ASSET_TREE_ACTION_SCHEMA[nodeType] || [])
          .filter((definition) => !definition.when || definition.when(context))
          .map((definition) =>
            Object.freeze({
              key: definition.key,
              label: definition.label,
              disabled: definition.disabled?.(context) === true,
              disabledTitle: definition.disabledTitle || "",
            }),
          );
      }
      function selectedAssetTreeActionModel() {
        let match = appFSM.state.assetPath ? projectVfs.resolve(appFSM.state.assetPath) : null;
        if (!match || match.kind !== appFSM.state.assetSelection)
          return Object.freeze({ nodeType: null, context: null, title: "선택 항목 작업", items: [] });
        let path = match.kind === "directory" ? match.path : projectAssetPath(match.asset),
          context = Object.freeze({
            path,
            inactive: projectVfs.isTrashed(path),
            hasTrashContents:
              path === PROJECT_TRASH_DIRECTORY &&
              (activeProject.fileSystem.directories.some(
                (item) => item !== PROJECT_TRASH_DIRECTORY && projectVfs.isTrashed(item),
              ) ||
                activeProject.csvFiles.some((asset) => projectVfs.isTrashed(projectAssetPath(asset))) ||
                activeProject.images.some((asset) => projectVfs.isTrashed(projectAssetPath(asset)))),
          });
        return Object.freeze({
          nodeType: match.kind,
          context,
          title: `${path} 작업`,
          items: Object.freeze(assetTreeActionItems(match.kind, context)),
        });
      }
      function runAssetTreeAction(key, context) {
        let handler = ASSET_TREE_ACTION_HANDLERS[key];
        if (typeof handler !== "function" || !context) return false;
        handler(context);
        return true;
      }
      function renderAssetTreeActionMenu(nodeType = null, context = null) {
        let trigger = $("assetActions"),
          menu = $("assetActionMenu"),
          items = assetTreeActionItems(nodeType, context);
        if (!trigger || !menu) return;
        trigger.disabled = !nodeType || !context;
        trigger.title = context?.path ? `${context.path} 작업` : "선택 항목 작업";
        trigger.setAttribute("aria-label", trigger.title);
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        menu.replaceChildren();
        if (!items.length) {
          let empty = document.createElement("button");
          empty.type = "button";
          empty.disabled = true;
          empty.textContent = "사용 가능한 작업 없음";
          empty.setAttribute("role", "menuitem");
          menu.append(empty);
        } else {
          items.forEach((definition) => {
            let item = document.createElement("button");
            item.type = "button";
            item.className = "tree-node-action";
            item.textContent = definition.label;
            item.disabled = definition.disabled;
            item.setAttribute("role", "menuitem");
            if (definition.disabled && definition.disabledTitle) item.title = definition.disabledTitle;
            item.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (item.disabled) return;
              closeAssetTreeActionMenus();
              runAssetTreeAction(definition.key, context);
            });
            menu.append(item);
          });
        }
      }
      function syncAssetTreeActionMenu() {
        let model = selectedAssetTreeActionModel();
        renderAssetTreeActionMenu(model.nodeType, model.context);
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
      function emptyProjectTrash() {
        let csvIds = new Set(
            activeProject.csvFiles
              .filter((csv) => projectVfs.isTrashed(projectAssetPath(csv)))
              .map((csv) => csv.id),
          ),
          imageIds = new Set(
            activeProject.images
              .filter((image) => projectVfs.isTrashed(projectAssetPath(image)))
              .map((image) => image.id),
          ),
          referenceCount = projectAssetReferenceCount(csvIds, imageIds),
          warning = referenceCount
            ? `휴지통 자산에 남아 있는 참조 ${referenceCount}개도 함께 제거됩니다.\n\n`
            : "";
        if (!window.confirm(`${warning}휴지통의 폴더와 파일을 영구적으로 비우시겠습니까?`)) return;
        let payload = { direction: "ui-to-fsm" };
        try {
          appFSM.send("PROJECT_TRASH_EMPTIED", payload);
          renderProjectDataTree(projectDataTreeObjects());
          updateFileAvailability();
          status(
            `휴지통을 비웠습니다. 폴더 ${payload.directoryCount}개, CSV ${payload.csvCount}개, 이미지 ${payload.imageCount}개를 삭제했습니다.`,
          );
        } catch (error) {
          status(`휴지통 비우기 오류: ${error.message}`);
        }
      }
      function renderProjectDataTree(objects = {}) {
        let tree = $("assetTree");
        if (!tree) return;
        let previousBranchState = new Map(
            [...tree.querySelectorAll("details")].map((branch) => [
              branch.dataset.path || branch.querySelector(":scope > summary")?.textContent || "",
              branch.open,
            ]),
          ),
          branch = (path, label, initiallyOpen = true) =>
            createAssetTreeBranch(
              label,
              previousBranchState.has(path)
                ? previousBranchState.get(path)
                : initiallyOpen,
              path,
            ),
          snapshot = projectDataTreeSnapshot(objects),
          csvObjects = snapshot.data,
          imageObjects = snapshot.images,
          chartObjects = snapshot.charts,
          slotObjects = snapshot.slots,
          directoryPaths = [...new Set(snapshot.directories)]
            .filter((path) => path === "/assets" || path.startsWith("/assets/"))
            .sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b)),
          directoryBranches = new Map();
        if (!snapshot.directories.includes(selectedExplorerDirectory))
          selectedExplorerDirectory = "/assets";
        for (let path of directoryPaths) {
          let node = branch(
            path,
            path === "/assets" ? "/assets" : projectPathName(path),
            path === "/assets",
          );
          node.branch.dataset.explorerTarget = "folder";
          let summary = node.branch.firstElementChild,
            inactive = projectVfs.isTrashed(path),
            movable = !projectVfs.isFixedDirectory(path);
          summary?.classList.add("asset-tree-directory");
          node.branch.classList.toggle("inactive", inactive);
          if (summary) {
            let active =
              appFSM.state.assetSelection === "directory" &&
              appFSM.state.assetPath === path;
            summary.classList.toggle("active", active);
            summary.setAttribute("aria-selected", String(active));
          }
          if (movable && summary) {
            summary.draggable = true;
            summary.dataset.assetPath = path;
            summary.dataset.assetKind = "directory";
          }
          directoryBranches.set(path, node);
          let parent = projectParentPath(path);
          if (directoryBranches.has(parent)) directoryBranches.get(parent).list.append(node.branch);
        }
        let assetRoot = directoryBranches.get("/assets") || branch("/assets", "/assets"),
          slotRoot = branch("/slots", "/slots");
        csvObjects
          .slice()
          .sort((a, b) => a.path.localeCompare(b.path))
          .forEach((csv) => {
            let references = chartObjects.reduce(
              (count, chart) =>
                count + chart.csvReferences.filter((id) => id === csv.id).length,
              0,
              ),
              parent = directoryBranches.get(projectParentPath(csv.path));
            if (!parent) return;
            appendAssetTreeButton(
              parent.list,
              projectPathName(csv.path),
              csv.readable
                ? `${csv.rowCount}행 · 참조 ${references}`
                : `읽기 실패 · 참조 ${references}`,
              {
                path: csv.path,
                assetKind: "csv",
                inactive: projectVfs.isTrashed(csv.path),
                active:
                  appFSM.state.assetSelection === "csv" &&
                  csv.path === appFSM.state.assetPath,
                onclick: () => selectCsvFromTree(csv.path),
              },
            );
          });
        imageObjects
          .slice()
          .sort((a, b) => a.path.localeCompare(b.path))
          .forEach((image) => {
            let references = slotObjects.filter((slot) => slot.imageId === image.id).length,
              parent = directoryBranches.get(projectParentPath(image.path));
            if (!parent) return;
            appendAssetTreeButton(
              parent.list,
              projectPathName(image.path),
              `참조 ${references}`,
              {
                path: image.path,
                assetKind: "image",
                inactive: projectVfs.isTrashed(image.path),
                active:
                  appFSM.state.assetSelection === "image" &&
                  image.path === appFSM.state.assetPath,
                onclick: () => selectImageFromTree(image.path),
              },
            );
          });
        let visibleSlots = slotObjects
          .filter((slot) => !slot.hidden)
          .sort((a, b) => a.row - b.row || a.col - b.col);
        if (visibleSlots.length) {
          visibleSlots.forEach((slot) => {
            let slotBranch = branch(
              `/slots/[row=${slot.row},col=${slot.col}]`,
              `[row=${slot.row},col=${slot.col}]`,
              false,
            ),
              references = [];
            slotBranch.branch.dataset.explorerTarget = "slot";
            slotBranch.branch.dataset.slotId = String(slot.id);
            if (slot.contentType === "image") {
              let image = slotImage(slot, imageObjects);
              if (image) references.push({ name: image.name, meta: image.path });
            } else {
              let chart = slot.chart && chartObjects.find((item) => item.id === slot.chart);
              if (chart?.editable === false)
                references.push({ name: "Plotly JSON 내부 데이터", meta: "외부 참조 없음" });
              else
                (chart?.csvIds || []).forEach((id) => {
                  let csv = getProjectCsv(id, csvObjects);
                  if (csv) references.push({ name: csv.name, meta: csv.path });
                });
            }
            if (references.length)
              references.forEach((reference) =>
                appendAssetTreeItem(slotBranch.list, reference.name, reference.meta, 2),
              );
            else appendAssetTreeItem(slotBranch.list, "(에셋 없음)", "", 2);
            slotRoot.list.append(slotBranch.branch);
          });
        } else appendAssetTreeItem(slotRoot.list, "(표시 슬롯 없음)", "", 1);
        tree.replaceChildren(assetRoot.branch, slotRoot.branch);
      }
      const ASSET_TREE_DRAG_TYPE = "application/x-fast-figure-path";
      const ASSET_TREE_LOCKED_TYPE = "application/x-fast-figure-locked";
      function assetTreeDropTarget(event) {
        return event.target.closest?.("#assetTree [data-explorer-target]") || null;
      }
      function assetTreeDropPolicy(dataTransfer, target) {
        let targetKind = target?.dataset.explorerTarget,
          types = new Set(Array.from(dataTransfer?.types || []));
        if (!targetKind) return { allowed: false, reason: "드롭 대상이 없습니다." };
        if (types.has(ASSET_TREE_DRAG_TYPE)) {
          let dragged = null;
          try {
            dragged = JSON.parse(dataTransfer.getData(ASSET_TREE_DRAG_TYPE) || "null");
          } catch (_) {}
          let match = dragged?.path ? projectVfs.resolve(dragged.path) : null,
            protectedDefaultCsv =
              types.has(ASSET_TREE_LOCKED_TYPE) ||
              (match?.kind === "csv" && match.asset.isDefaultEmpty === true),
            fixedDirectory = match?.kind === "directory" && projectVfs.isFixedDirectory(match.path),
            trashed = dragged?.path && projectVfs.isTrashed(dragged.path);
          if (targetKind === "slot")
            return {
              allowed: !!match && match.kind !== "directory" && !trashed,
              operation: "link",
              reason: trashed
                ? "휴지통의 파일은 슬롯에 연결할 수 없습니다."
                : match?.kind === "directory"
                  ? "폴더는 슬롯에 연결할 수 없습니다."
                  : "",
            };
          let sameFolder = dragged?.path && projectParentPath(dragged.path) === target.dataset.path,
            recursive = match?.kind === "directory" && projectPathInDirectory(target.dataset.path, match.path);
          return {
            allowed: !!match && !protectedDefaultCsv && !fixedDirectory && !sameFolder && !recursive,
            operation: "move",
            reason: protectedDefaultCsv
              ? "프로젝트 기본 빈 CSV는 이동할 수 없습니다."
              : fixedDirectory
                ? "기본 프로젝트 폴더는 이동할 수 없습니다."
                : recursive
                  ? "폴더를 자기 자신 또는 하위 폴더로 이동할 수 없습니다."
              : sameFolder
                ? "이미 같은 폴더에 있습니다."
                : "",
          };
        }
        if (!dataTransferHasFiles(dataTransfer))
          return { allowed: false, reason: "지원하는 드래그 데이터가 아닙니다." };
        if (targetKind === "folder" && projectVfs.isTrashed(target.dataset.path))
          return { allowed: false, reason: "외부 파일은 휴지통으로 직접 가져올 수 없습니다." };
        let files = Array.from(dataTransfer.files || []);
        if (!files.length)
          return {
            allowed: true,
            operation: targetKind === "slot" ? "import-slot" : "import-folder",
            reason: "",
          };
        let kinds = files.map(slotFileKind);
        if (kinds.some((kind) => !kind))
          return { allowed: false, reason: "지원하지 않는 파일 형식이 포함되어 있습니다." };
        if (targetKind === "slot")
          return {
            allowed: files.length === 1,
            operation: "import-slot",
            reason: files.length === 1 ? "" : "슬롯에는 한 번에 파일 하나만 놓을 수 있습니다.",
          };
        let allowed = kinds.every((kind) => kind === "data" || kind === "image");
        return {
          allowed,
          operation: "import-folder",
          reason: allowed ? "" : "FFSX는 슬롯에만 놓을 수 있습니다.",
        };
      }
      function clearAssetTreeDropState() {
        $("assetTree")
          .querySelectorAll(".drop-allowed, .drop-denied")
          .forEach((node) => node.classList.remove("drop-allowed", "drop-denied"));
      }
      function connectProjectAssetToSlot(path, kind, slot) {
        let match = projectVfs.resolve(path);
        if (!match || match.kind !== kind || match.kind === "directory")
          throw Error("드래그한 프로젝트 파일이 없습니다.");
        if (projectVfs.isTrashed(projectAssetPath(match.asset)))
          throw Error("휴지통의 파일은 슬롯에 연결할 수 없습니다.");
        if (!slot || slot.hidden) throw Error("연결할 슬롯이 없습니다.");
        if (match.kind === "csv")
          appFSM.send("SLOT_DATA_CONNECTED", {
            slotId: slot.id,
            csvId: match.asset.id,
            replaceSlotContent: slot.contentType === "image",
            direction: "fsm-to-model",
          });
        else
          appFSM.send("SLOT_IMAGE_IMPORTED", {
            slotId: slot.id,
            imageId: match.asset.id,
            direction: "fsm-to-model",
          });
        setSelectedSlot(slot.id, "model-to-fsm");
        renderDashboard();
        status("프로젝트 파일을 슬롯에 연결했습니다.");
      }
      async function executeAssetTreeDrop(
        dataTransfer,
        target,
        policy,
        { preserveLegacyOpenState = true } = {},
      ) {
        let internal = dataTransfer.getData(ASSET_TREE_DRAG_TYPE);
        if (internal) {
          let dragged = JSON.parse(internal),
            match = projectVfs.resolve(dragged.path);
          if (!match || match.kind !== dragged.kind) throw Error("드래그한 프로젝트 항목이 없습니다.");
          if (policy.operation === "move") {
            let movedOpen = preserveLegacyOpenState && dragged.kind === "directory"
                ? [...$("assetTree").querySelectorAll("details[data-path]")]
                    .filter((branch) => projectPathInDirectory(branch.dataset.path, dragged.path))
                    .map((branch) => ({
                      suffix: branch.dataset.path.slice(dragged.path.length),
                      open: branch.open,
                    }))
                : [],
              selectedSuffix = dragged.kind === "directory" &&
                  projectPathInDirectory(selectedExplorerDirectory, dragged.path)
                ? selectedExplorerDirectory.slice(dragged.path.length)
                : null,
              payload = {
                path: dragged.path,
                directory: target.dataset.path,
                direction: "ui-to-fsm",
              };
            if (projectVfs.isTrashed(target.dataset.path) && !projectVfs.isTrashed(dragged.path)) {
              let movingAssets = dragged.kind === "directory"
                  ? projectVfs.descendants(dragged.path)
                  : [{ kind: dragged.kind, asset: match.asset }],
                csvIds = new Set(
                  movingAssets.filter(({ kind }) => kind === "csv").map(({ asset }) => asset.id),
                ),
                imageIds = new Set(
                  movingAssets.filter(({ kind }) => kind === "image").map(({ asset }) => asset.id),
                ),
                referenceCount = projectAssetReferenceCount(csvIds, imageIds);
              if (
                referenceCount &&
                !window.confirm(
                  `이 항목을 휴지통으로 이동하면 그래프·슬롯 참조 ${referenceCount}개가 제거됩니다. 계속할까요?`,
                )
              )
                return;
            }
            appFSM.send("PROJECT_NODE_MOVED", payload);
            if (dragged.kind === "directory") {
              if (selectedSuffix !== null)
                selectedExplorerDirectory = `${payload.path}${selectedSuffix}`;
              movedOpen.forEach(({ suffix, open }) => {
                let path = `${payload.path}${suffix}`,
                  branch = [...$("assetTree").querySelectorAll("details[data-path]")]
                    .find((item) => item.dataset.path === path);
                if (branch) branch.open = open;
              });
            }
            status(payload.trashed ? `${payload.path}을 휴지통으로 이동했습니다.` : `${payload.path}로 이동했습니다.`);
            return;
          }
          connectProjectAssetToSlot(
            dragged.path,
            dragged.kind,
            slotAt(Number(target.dataset.slotId)),
          );
          return;
        }
        let files = Array.from(dataTransfer.files || []),
          slot = target.dataset.explorerTarget === "slot"
            ? slotAt(Number(target.dataset.slotId))
            : null;
        if (policy.operation === "import-slot")
          return appFSM.run("importing", "ASSET_TREE_DROP", () => loadFileIntoSlot(files[0], slot));
        let directory = target.dataset.path,
          reserved = new Set([
            ...activeProject.fileSystem.directories,
            ...activeProject.csvFiles.map(projectAssetPath),
            ...activeProject.images.map(projectAssetPath),
          ]),
          staged = files.map((file) => {
            let plan = planProjectAssetImport(file, directory, reserved);
            reserved.add(plan.path);
            return { file, kind: slotFileKind(file), ...plan };
          }),
          csvIds = new Set(activeProject.csvFiles.map((asset) => asset.id)),
          imageIds = new Set(activeProject.images.map((asset) => asset.id)),
          replacedCsv = new Map(
            staged
              .filter((item) => item.kind === "data" && Number.isInteger(item.replaceId))
              .map((item) => [item.replaceId, projectClone(getProjectCsv(item.replaceId))]),
          ),
          replacedImages = new Map(
            staged
              .filter((item) => item.kind === "image" && Number.isInteger(item.replaceId))
              .map((item) => [item.replaceId, projectClone(getProjectImage(item.replaceId))]),
          );
        try {
          await appFSM.run("importing", "ASSET_TREE_DROP", async () => {
            for (let item of staged) {
              if (item.kind === "data")
                await loadDataFile(item.file, null, {
                  assetPath: item.path,
                  replaceAssetId: item.replaceId,
                });
              else
                await loadImageFile(item.file, null, {
                  assetPath: item.path,
                  replaceAssetId: item.replaceId,
                });
            }
          });
        } catch (error) {
          activeProject.csvFiles
            .filter((asset) => !csvIds.has(asset.id))
            .forEach((asset) => appFSM.send("DATA_OBJECT_DELETED", { csvId: asset.id, direction: "fsm-to-model" }));
          activeProject.images
            .filter((asset) => !imageIds.has(asset.id))
            .forEach((asset) => appFSM.send("IMAGE_OBJECT_DELETED", { imageId: asset.id, direction: "fsm-to-model" }));
          replacedCsv.forEach((model) =>
            appFSM.send("DATA_OBJECT_REPLACED", { model, direction: "fsm-to-model" }),
          );
          replacedImages.forEach((model) =>
            appFSM.send("IMAGE_OBJECT_REPLACED", { model, direction: "fsm-to-model" }),
          );
          throw error;
        }
      }
      function closeAssetTreeActionMenus() {
        let menu = $("assetActionMenu"),
          trigger = $("assetActions");
        if (menu) menu.hidden = true;
        trigger?.setAttribute("aria-expanded", "false");
      }
      function installAssetTreeInteractions() {
        let tree = $("assetTree");
        if (tree.dataset.interactionsInstalled === "true") return;
        tree.dataset.interactionsInstalled = "true";
        document.addEventListener(
          "click",
          (event) => {
            if (!event.target.closest?.("#assetActions, #assetActionMenu"))
              closeAssetTreeActionMenus();
          },
          true,
        );
        document.addEventListener(
          "keydown",
          (event) => {
            if (event.key !== "Escape") return;
            if ($("assetActions").getAttribute("aria-expanded") !== "true") return;
            closeAssetTreeActionMenus();
            $("assetActions").focus();
          },
          true,
        );
        tree.addEventListener("dragstart", (event) => {
          if (event.target.closest?.(".tree-node-action")) {
            event.preventDefault();
            return;
          }
          let source = event.target.closest?.(
            ".asset-tree-button[draggable='true'], summary[draggable='true']",
          );
          if (!source) return;
          let match = projectVfs.resolve(source.dataset.assetPath);
          event.dataTransfer.effectAllowed = "all";
          event.dataTransfer.setData(
            ASSET_TREE_DRAG_TYPE,
            JSON.stringify({ kind: source.dataset.assetKind, path: source.dataset.assetPath }),
          );
          if (match?.kind === "csv" && match.asset.isDefaultEmpty === true)
            event.dataTransfer.setData(ASSET_TREE_LOCKED_TYPE, "1");
          event.dataTransfer.setData("text/plain", source.dataset.assetPath);
        });
        tree.addEventListener("dragover", (event) => {
          let target = assetTreeDropTarget(event);
          if (!target) return clearAssetTreeDropState();
          let policy = assetTreeDropPolicy(event.dataTransfer, target);
          clearAssetTreeDropState();
          target.classList.add(policy.allowed ? "drop-allowed" : "drop-denied");
          if (!policy.allowed) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = policy.operation === "link" ? "link" : policy.operation === "move" ? "move" : "copy";
        });
        tree.addEventListener("dragleave", (event) => {
          if (!tree.contains(event.relatedTarget)) clearAssetTreeDropState();
        });
        tree.addEventListener("drop", async (event) => {
          let target = assetTreeDropTarget(event),
            policy = assetTreeDropPolicy(event.dataTransfer, target);
          clearAssetTreeDropState();
          if (!policy.allowed) return status(policy.reason);
          event.preventDefault();
          event.stopPropagation();
          try {
            await executeAssetTreeDrop(event.dataTransfer, target, policy);
            renderProjectDataTree(projectDataTreeObjects());
          } catch (error) {
            status("탐색기 드롭 실패: " + error.message);
            debugLog("assetTree:drop-error", { message: error.message }, "error");
          }
        });
        tree.addEventListener("keydown", (event) => {
          let items = [...tree.querySelectorAll("summary, .asset-tree-button")].filter(
              (item) => item.offsetParent !== null,
            ),
            current = items.indexOf(document.activeElement),
            next = current;
          if (event.key === "ArrowDown") next = Math.min(items.length - 1, current + 1);
          else if (event.key === "ArrowUp") next = Math.max(0, current - 1);
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = items.length - 1;
          else if (event.key === "ArrowRight" && document.activeElement?.tagName === "SUMMARY") {
            let details = document.activeElement.parentElement;
            if (details?.tagName !== "DETAILS" || details.open) return;
            details.open = true;
            event.preventDefault();
            return;
          } else if (event.key === "ArrowLeft" && document.activeElement?.tagName === "SUMMARY") {
            let details = document.activeElement.parentElement;
            if (details?.open) details.open = false;
            else {
              let parent = details?.parentElement?.closest("details")?.querySelector(":scope > summary");
              if (!parent) return;
              parent.focus();
            }
            event.preventDefault();
            return;
          } else if ((event.key === "Enter" || event.key === " ") && current >= 0) {
            event.preventDefault();
            document.activeElement.click();
            return;
          } else return;
          if (items[next]) {
            event.preventDefault();
            items[next].focus();
          }
        });
      }
      function refreshCsvControls(selected = activeCsvId) {
        let slot = getSelectedSlot(),
          graphSlot = !!slot && slot.contentType !== "image";
        if (getProjectCsv(selected)) activeCsvId = selected;
        else if (graphSlot) activeCsvId = null;
      }
      function setActiveImageFromId(selected = activeImageId ?? getSelectedSlot()?.imageId) {
        if (getProjectImage(selected)) activeImageId = Number(selected);
        else activeImageId = null;
        return activeImageId;
      }
      function refreshImageControls(selected = activeImageId ?? getSelectedSlot()?.imageId) {
        setActiveImageFromId(selected);
        $("insertEmptyImage").disabled = getSelectedSlot()?.contentType !== "image";
      }
      function headerLineCount(value, table = rows) {
        let count = Math.max(0, Math.trunc(Number(value) || 0));
        return Math.min(count, Array.isArray(table) ? table.length : 0);
      }
      function selectedCsvHeaderModel() {
        let slot = getSelectedSlot(),
          csv = getProjectCsv(activeCsvId),
          visible = slot ? slot.contentType !== "image" : appFSM.state.assetSelection === "csv";
        if (!visible || !csv) return null;
        return Object.freeze({
          csvId: csv.id,
          headerLines: headerLineCount(csv.headerLines, csv.rows),
          max: Array.isArray(csv.rows) ? csv.rows.length : 0,
        });
      }
      function columnIndex(column) {
        let match = /^C([1-9]\d*)$/.exec(String(column || ""));
        return match ? Number(match[1]) - 1 : -1;
      }
      function columnDefinitions(table = rows, headerLines = $("headerLines")?.value ?? 1) {
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
      function dataRows(table = rows, headerLines = $("headerLines")?.value ?? 1) {
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
      function connectDataToSlotModel(slot, data, sourceName, projectCsv = null) {
        let matrix = dataTable(data),
          chart = slot.chart ? getChart(slot.chart) : null,
          csv = projectCsv || createProjectCsv(matrix, sourceName),
          headerLines = headerLineCount(csv.headerLines, matrix);
        activeCsvId = csv.id;
        if (chart) {
          let selection = graphDataSelection(matrix, headerLines, chart.editor);
          chart.editor.x = selection.x;
          chart.editor.y = selection.y;
          chart.editor.objects = [...ensureGraphObjects(chart), baseGraphObject(chart, csv)];
          selectedObjectIndex = null;
          if (chart.editor.editable !== false) rebuildEditableGraph(chart);
        } else {
          chart = createChartModel({
            id: activeProject.chartId++,
            editor: defaultChartEditor(slot, matrix, headerLines),
          });
          chart.editor.objects = [baseGraphObject(chart, csv)];
          rebuildEditableGraph(chart);
          activeProject.charts.push(chart);
          slot.chart = chart.id;
        }
        editing = chart;
        return chart;
      }
      function connectDataToSlot(
        slot,
        data,
        sourceName,
        projectCsv = null,
        { replaceSlotContent = false } = {},
      ) {
        let csv = projectCsv || createProjectCsv(data, sourceName),
          payload = {
            slotId: slot.id,
            csvId: csv.id,
            replaceSlotContent,
            direction: "fsm-to-model",
          };
        appFSM.send("SLOT_DATA_CONNECTED", payload);
        if (!payload.chart) throw Error("슬롯 그래프 오브젝트를 만들지 못했습니다.");
        editChart(payload.chart.id);
        renderDashboard();
        return payload.chart;
      }
      function loadData(data, name, { showGraphControls = true } = {}) {
        rows = dataTable(data);
        columns = columnDefinitions(rows, $("headerLines")?.value ?? 1);
        let options = columns
          .map((column) => `<option value="${column.id}">${esc(column.label)}</option>`)
          .join("");
        $("xCol").innerHTML = options;
        $("yCol").innerHTML = options;
        let body = dataRows(rows, $("headerLines")?.value ?? 1),
          numeric = columns.filter((column) =>
            body.some(
              (row) => row?.[column.index] !== "" && Number.isFinite(Number(row?.[column.index])),
            ),
          );
        $("xCol").value = numeric[0]?.id || columns[0]?.id || "";
        $("yCol").value =
          numeric.find((column) => column.id !== $("xCol").value)?.id || columns[0]?.id || "";
        $("buildBox").classList.toggle("hidden", !showGraphControls);
        preview();
        status(`${name}: ${body.length.toLocaleString()}행, ${columns.length}열`);
      }
      function refreshColumnControls() {
        if (!rows.length) return;
        let oldX = $("xCol").value,
          oldY = $("yCol").value;
        columns = columnDefinitions(rows, $("headerLines").value);
        let options = columns
          .map((column) => `<option value="${column.id}">${esc(column.label)}</option>`)
          .join("");
        $("xCol").innerHTML = options;
        $("yCol").innerHTML = options;
        $("xCol").value = columns.some((column) => column.id === oldX)
          ? oldX
          : columns[0]?.id || "";
        $("yCol").value = columns.some((column) => column.id === oldY)
          ? oldY
          : columns[1]?.id || columns[0]?.id || "";
        preview();
      }
      function readAxis(key) {
        return {
          title: $(key + "Title").value,
          min: $(key + "Min").value,
          max: $(key + "Max").value,
          tick: $(key + "Tick").value,
          tickMode: $(key + "TickMode").dataset.mode,
          minorTicks: $(key + "TickMode").dataset.minorTicks === "true",
          notation: $(key + "Notation").value,
          scaleType: $(key + "ScaleType").value,
          divide: $(key + "Divide").value,
          titleSize: $(key + "TitleSize").value,
          fontSize: $(key + "FontSize").value,
          lineWidth: $(key + "LineWidth").value,
          showGrid: $(key + "Grid").dataset.active === "true",
          visible: $(key + "Visible").dataset.active === "true",
          showValues: $(key + "Values").dataset.active === "true",
        };
      }
      function chartLayoutControlValues() {
        return {
          title: $("title").value,
          showLegend: $("showLegend").dataset.active === "true",
          showTitle: $("showTitle").dataset.active === "true",
          showZeroLine: $("showZeroLine").dataset.active === "true",
          graphFontFamily: $("graphFontFamily").value,
          titleFontSize: $("titleFontSize").value,
          legendFontSize: $("legendFontSize").value,
          axes: {
            xBottom: readAxis("xBottom"),
            xTop: readAxis("xTop"),
            yLeft: readAxis("yLeft"),
            yRight: readAxis("yRight"),
          },
        };
      }
      function chartLayoutSettingsFromValues(chart, values = {}) {
        if (!chart?.editor) throw Error("선택한 슬롯의 그래프가 없습니다.");
        let previous = readGlobalSettings(chart),
          previousAxes = previous.axes || {},
          axes = values.axes && typeof values.axes === "object" ? values.axes : {},
          axis = (key) => ({ ...(previousAxes[key] || {}), ...(axes[key] || {}) }),
          boolean = (key) => (values[key] == null ? previous[key] : !!values[key]);
        return {
          title: values.title == null ? chart.editor.title || "" : String(values.title),
          globalSettings: {
            ...previous,
            showLegend: boolean("showLegend"),
            showTitle: boolean("showTitle"),
            showZeroLine: boolean("showZeroLine"),
            graphFontFamily:
              values.graphFontFamily == null
                ? previous.graphFontFamily
                : String(values.graphFontFamily).trim(),
            titleFontSize: values.titleFontSize ?? previous.titleFontSize,
            legendFontSize: values.legendFontSize ?? previous.legendFontSize,
            axes: {
              xBottom: axis("xBottom"),
              xTop: axis("xTop"),
              yLeft: axis("yLeft"),
              yRight: axis("yRight"),
            },
          },
        };
      }
      function chartLayoutSettingsFromForm(chart) {
        return chartLayoutSettingsFromValues(chart, chartLayoutControlValues());
      }
      function selectedChartLayoutModel(slot = getSelectedSlot()) {
        let chart = slot?.chart ? getChart(slot.chart) : null;
        if (!slot || slot.contentType === "image" || !chart?.editor) return null;
        let values = chartLayoutSettingsFromValues(chart);
        return Object.freeze({
          slotId: slot.id,
          chartId: chart.id,
          title: values.title,
          globalSettings: projectClone(values.globalSettings),
        });
      }
      function selectedGraphObjectModel(slot = getSelectedSlot()) {
        let chart = slot?.chart ? getChart(slot.chart) : null,
          objects = Array.isArray(chart?.editor?.objects) ? chart.editor.objects : [],
          objectIndex = Number.isInteger(selectedObjectIndex) ? selectedObjectIndex : -1,
          object = objectIndex >= 0 ? objects[objectIndex] : null,
          csv = object?.csvId != null ? getProjectCsv(object.csvId) : null,
          columns = csv
            ? columnDefinitions(csv.rows, csv.headerLines ?? 1).map(({ id, label }) =>
                Object.freeze({ id, label }),
              )
            : [];
        if (!slot || slot.contentType === "image" || !chart?.editor || !object) return null;
        return Object.freeze({
          slotId: slot.id,
          chartId: chart.id,
          objectIndex,
          editable: chart.editor.editable !== false,
          csvId: csv?.id ?? null,
          csvName: csv?.name ?? "",
          columns: Object.freeze(columns),
          object: projectClone(object),
        });
      }
      function selectedGraphObjectsModel(slot = getSelectedSlot()) {
        let chart = slot?.chart ? getChart(slot.chart) : null;
        if (!slot || slot.contentType === "image" || !chart?.editor) return null;
        let objects = Array.isArray(chart.editor.objects) ? chart.editor.objects : [],
          selectedIndex = Number.isInteger(selectedObjectIndex) ? selectedObjectIndex : null,
          items = objects.map((object, index) => {
            let csv = object?.csvId != null ? getProjectCsv(object.csvId) : null,
              fallback = DEFAULT_COLORS[index % DEFAULT_COLORS.length],
              color = typeof object?.color === "string" ? object.color : fallback,
              name = object?.legendName || `${object?.x ?? ""} · ${object?.y ?? ""}`,
              xSide = object?.xAxisSide === "top" ? "위" : "아래",
              ySide = object?.yAxisSide === "right" ? "오른쪽" : "왼쪽";
            return Object.freeze({
              index,
              selected: selectedIndex === index,
              csvId: csv?.id ?? object?.csvId ?? null,
              csvName: csv?.name ?? "",
              x: object?.x ?? "",
              y: object?.y ?? "",
              xAxisSide: object?.xAxisSide ?? "bottom",
              yAxisSide: object?.yAxisSide ?? "left",
              legendName: object?.legendName ?? "",
              type: object?.type ?? "scatter",
              color,
              label: `${index + 1}. ${name} · ${csv?.name || "CSV 없음"} · ${xSide} X / ${ySide} Y`,
            });
          });
        return Object.freeze({
          slotId: slot.id,
          chartId: chart.id,
          editable: chart.editor.editable !== false,
          selectedObjectIndex: selectedIndex,
          objects: Object.freeze(items),
        });
      }
      function selectedGraphObjectAddModel(slot = getSelectedSlot()) {
        let csv = activeCsvId != null ? getProjectCsv(activeCsvId) : null;
        if (!slot || slot.contentType === "image" || !csv) return null;
        let chart = slot.chart ? getChart(slot.chart) : null;
        if (chart && !chart.editor) return null;
        let objects = Array.isArray(chart?.editor?.objects) ? chart.editor.objects : [],
          selectedIndex = Number.isInteger(selectedObjectIndex) ? selectedObjectIndex : null,
          source =
            selectedIndex !== null && objects[selectedIndex]
              ? objects[selectedIndex]
              : chart?.editor || {},
          object = baseGraphObject({ editor: source }, csv),
          columns = columnDefinitions(csv.rows, csv.headerLines ?? 1).map(({ id, label }) =>
            Object.freeze({ id, label }),
          );
        object.color = DEFAULT_COLORS[objects.length % DEFAULT_COLORS.length];
        return Object.freeze({
          slotId: slot.id,
          chartId: chart?.id ?? null,
          hasChart: !!chart,
          editable: chart ? chart.editor.editable !== false : true,
          csvId: csv.id,
          csvName: csv.name,
          columns: Object.freeze(columns),
          object: projectClone(object),
        });
      }
      function addGraphObjectFromModel(expectedSlotId, expectedChartId) {
        let slot = getSelectedSlot();
        if (!slot || slot.id !== expectedSlotId || slot.contentType === "image") return false;
        let chart = slot.chart ? getChart(slot.chart) : null;
        if ((chart?.id ?? null) !== (expectedChartId ?? null)) return false;
        let model = selectedGraphObjectAddModel(slot);
        if (!model || model.editable === false) return false;
        if (!chart) {
          let payload = {
            slotId: slot.id,
            csvId: model.csvId,
            direction: "fsm-to-model",
          };
          appFSM.send("SLOT_DATA_CONNECTED", payload);
          if (!payload.chart) return false;
          selectGraphObjectFromIndex(0, payload.chart.id);
          updateGraphView();
          return true;
        }
        let next = projectClone(chart),
          object = projectClone(model.object),
          objects = Array.isArray(next.editor?.objects) ? next.editor.objects : [];
        next.editor.objects = [...objects, object];
        let axes = next.editor.globalSettings?.axes,
          xKey = axisKey("x", object.xAxisSide),
          yKey = axisKey("y", object.yAxisSide);
        if (axes?.[xKey] && !axes[xKey].title) axes[xKey].title = object.x;
        if (axes?.[yKey] && !axes[yKey].title) axes[yKey].title = object.y;
        let payload = {
          slotId: slot.id,
          chartId: chart.id,
          chart: next,
          direction: "fsm-to-model",
        };
        appFSM.send("CHART_MODEL_REPLACED", payload);
        if (!payload.chart) return false;
        selectGraphObjectFromIndex(next.editor.objects.length - 1, payload.chart.id);
        updateGraphView();
        return true;
      }
      function selectedGraphPaletteModel(slot = getSelectedSlot()) {
        let chart = slot?.chart ? getChart(slot.chart) : null;
        if (!slot || slot.contentType === "image" || !chart?.editor) return null;
        let colors = (Array.isArray(chart.editor.objects) ? chart.editor.objects : [])
          .map((object) => object?.color)
          .filter(Boolean);
        return Object.freeze({
          slotId: slot.id,
          chartId: chart.id,
          editable: chart.editor.editable !== false,
          colors: Object.freeze(colors.length ? [...colors] : [...DEFAULT_COLORS]),
        });
      }
      function selectedGraphFileActionsModel(slot = getSelectedSlot()) {
        if (!slot) return null;
        let chart = slot.chart ? getChart(slot.chart) : null,
          editor = chart?.editor || null;
        return Object.freeze({
          slotId: slot.id,
          chartId: chart?.id ?? null,
          canExport: !!chart,
          canToggleEditable: !!editor,
          editable: editor ? editor.editable !== false : null,
        });
      }
      function graphObjectControlValues() {
        return {
          x: $("xCol").value,
          y: $("yCol").value,
          xAxisSide: $("xAxisSide").value,
          yAxisSide: $("yAxisSide").value,
          legendName: $("legendName").value,
          type: $("chartType").value,
          lineWidth: $("lineWidth").value,
          lineDash: $("lineDash").value,
          markerSymbol: $("markerSymbol").value,
          markerSize: $("markerSize").value,
          barOpacity: $("barOpacity").value,
          barLineWidth: $("barLineWidth").value,
        };
      }
      function graphObjectSettingsFromValues(current, values = {}) {
        let next = { ...(current || {}) },
          has = (key) => Object.prototype.hasOwnProperty.call(values, key);
        ["x", "y", "xAxisSide", "yAxisSide", "legendName", "type"].forEach((key) => {
          if (has(key)) next[key] = String(values[key] ?? "");
        });
        if (has("lineWidth"))
          next.lineWidth = Math.max(0.1, Math.min(20, Number(values.lineWidth) || 2));
        if (has("lineDash")) next.lineDash = values.lineDash || "solid";
        if (has("markerSymbol")) next.markerSymbol = values.markerSymbol || "circle";
        if (has("markerSize"))
          next.markerSize = Math.max(1, Math.min(40, Number(values.markerSize) || 6));
        if (has("barOpacity"))
          next.barOpacity = Math.max(0.05, Math.min(1, Number(values.barOpacity) || 1));
        if (has("barLineWidth"))
          next.barLineWidth = Math.max(0, Math.min(10, Number(values.barLineWidth) || 0));
        return next;
      }
      function graphObjectTypeVisibility(type) {
        return {
          line: ["scatter", "lines+markers", "hidden"].includes(type),
          marker: ["markers", "lines+markers"].includes(type),
          bar: type === "bar",
        };
      }
      function applySelectedGraphObjectFromValues(
        values,
        expectedChartId = null,
        expectedObjectIndex = null,
      ) {
        let target = getSelectedSlot(),
          chart = target?.chart ? getChart(target.chart) : null;
        if (expectedChartId != null && chart?.id !== expectedChartId) return false;
        if (
          expectedObjectIndex != null &&
          (!Number.isInteger(selectedObjectIndex) || selectedObjectIndex !== expectedObjectIndex)
        )
          return false;
        if (!target || target.contentType === "image" || !chart || !selectedGraphObjectGuard()) {
          status("변경할 그래프 오브젝트를 먼저 선택하세요.");
          return false;
        }
        if (chart.editor?.editable === false) {
          status("편집 가능 토글을 켠 뒤 설정을 변경하세요.");
          return false;
        }
        let objects = Array.isArray(chart.editor?.objects) ? chart.editor.objects : [],
          current = objects[selectedObjectIndex];
        if (!current) return false;
        let next = [...objects];
        next[selectedObjectIndex] = graphObjectSettingsFromValues(current, values);
        replaceGraphObjects(next, chart.id);
        return true;
      }
      function configFromForm() {
        let target = getSelectedSlot(),
          previous = editing;
        if (!previous) throw Error("선택한 슬롯의 그래프가 없습니다.");
        let previousAxes = previous.editor.globalSettings?.axes || {},
          objectValues = graphObjectSettingsFromValues(
            previous.editor,
            graphObjectControlValues(),
          ),
          axes = {
            xBottom: { ...(previousAxes.xBottom || {}), ...readAxis("xBottom") },
            xTop: { ...(previousAxes.xTop || {}), ...readAxis("xTop") },
            yLeft: { ...(previousAxes.yLeft || {}), ...readAxis("yLeft") },
            yRight: { ...(previousAxes.yRight || {}), ...readAxis("yRight") },
          },
          editor = {
            ...(previous.editor || {}),
            colors: graphPalette(),
            objects: previous.editor.objects || [],
            globalSettings: {
              ...(previous.editor.globalSettings || {}),
              showLegend: $("showLegend").dataset.active === "true",
              showTitle: $("showTitle").dataset.active === "true",
              showZeroLine: $("showZeroLine").dataset.active === "true",
              graphFontFamily: $("graphFontFamily").value.trim(),
              titleFontSize: $("titleFontSize").value,
              legendFontSize: $("legendFontSize").value,
              axes,
            },
            x: objectValues.x,
            y: objectValues.y,
            xAxisSide: objectValues.xAxisSide,
            yAxisSide: objectValues.yAxisSide,
            legendName: objectValues.legendName,
            type: objectValues.type,
            lineWidth: objectValues.lineWidth,
            lineDash: objectValues.lineDash,
            markerSymbol: objectValues.markerSymbol,
            markerSize: objectValues.markerSize,
            barOpacity: objectValues.barOpacity,
            barLineWidth: objectValues.barLineWidth,
            xDivide: 1,
            yDivide: 1,
            title: $("title").value || $("yCol").value,
          };
        return {
          ...previous,
          id: previous.id || activeProject.chartId++,
          editor,
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
        dataRows(c.rows || rows, c.headerLines ?? 1).forEach((r) => {
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
      function traces(c) {
        let settings = normalizeGlobalSettings(c),
          editor = c.editor,
          axes = settings.axes,
          objectList =
            Array.isArray(editor.objects) ? editor.objects : [],
          result = [];
        objectList.forEach((object, index) => {
          let xSide = object.xAxisSide || editor.xAxisSide || "bottom",
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
              rows: requireProjectCsv(
                { editor: { objects: [object] } },
                `그래프 객체 ${index + 1}`,
              ).rows,
              headerLines: requireProjectCsv(
                { editor: { objects: [object] } },
                `그래프 객체 ${index + 1}`,
              ).headerLines,
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
      function layout(c) {
        let bg = activeProject.appearance.uiPalette.paperColor,
          ink = activeProject.appearance.uiPalette.fontColor,
          editor = c.editor,
          settings = normalizeGlobalSettings(c),
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
        let actual = dashboardZoomLocked
            ? Math.max(
                50,
                Math.min(200, Math.round((dashboardWidth / dashboardReferenceWidth()) * 100)),
              )
            : Math.round(dashboardZoomIntent),
          slider = $("dashboardZoom"),
          output = $("dashboardZoomReset");
        if (!dashboardZoomLocked) slider.value = actual;
        output.textContent = `${actual}%`;
        output.title = "기준 크기 100%로 복귀";
      }
      function installResizeObserver() {
        if (dashboardObserver) return;
        let target = $("dashboard"),
          area = $("graphArea"),
          handleResize = () => {
            applyDashboardZoom(false);
            syncDashboardZoomDisplay();
            syncLayoutMapSize();
            schedulePlotResize();
          };
        if (window.ResizeObserver) {
          dashboardObserver = new ResizeObserver(() => {
            applyReferenceGeometry(target);
            syncDashboardZoomDisplay();
            syncLayoutMapSize();
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
      function setFileName(name = "") {
        let output = $("fileName");
        if (output) output.textContent = name || "선택된 파일 없음";
      }
      function normalizedImageSettingsValues(settings) {
        let source = settings && typeof settings === "object" ? settings : {},
          fit = ["contain", "cover", "manual"].includes(source.fit) ? source.fit : "contain",
          number = (value, fallback, min, max) =>
            Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : fallback));
        return {
          ...source,
          fit,
          scale: number(source.scale, 100, 1, 1000),
          x: number(source.x, 50, -100, 200),
          y: number(source.y, 50, -100, 200),
        };
      }
      function normalizeImageSettings(image) {
        if (!image) return null;
        image.settings = normalizedImageSettingsValues(image.settings);
        return image.settings;
      }
      function selectedImageSettingsModel(slot = getSelectedSlot()) {
        let image = slotImage(slot),
          settings = image ? normalizedImageSettingsValues(image.settings) : null;
        return settings
          ? Object.freeze({
              fit: settings.fit,
              scale: settings.scale,
              x: settings.x,
              y: settings.y,
            })
          : null;
      }
      function syncImageSettingsUi() {
        let slot = getSelectedSlot(),
          image = slotImage(slot),
          settings = normalizeImageSettings(image),
          manual = settings?.fit === "manual";
        $("imageManualFields").classList.toggle("hidden", !manual);
        ["imageScale", "imagePositionX", "imagePositionY"].forEach(
          (id) => ($(id).disabled = !manual),
        );
        if (!settings) return;
        $("imageFitMode").value = settings.fit;
        $("imageScale").value = settings.scale;
        $("imagePositionX").value = settings.x;
        $("imagePositionY").value = settings.y;
      }
      function projectFileInputModel(slot = getSelectedSlot()) {
        let has = !!slot,
          isImage = slot?.contentType === "image";
        return Object.freeze({
          label: isImage ? "이미지 추가" : has ? "CSV 추가" : "파일 추가",
          accept: isImage ? "image/*" : has ? ".csv,.tsv,.json" : ".csv,.tsv,.json,image/*",
          multiple: !isImage,
          hint: isImage
            ? "PNG/JPEG/GIF/WebP/BMP/SVG 이미지를 선택 슬롯에 연결합니다."
            : has
              ? "CSV/TSV 또는 JSON 객체 배열을 선택 슬롯의 그래프 데이터로 사용합니다."
              : "CSV/TSV/JSON 또는 이미지를 프로젝트 데이터에 추가합니다.",
        });
      }
      function syncSlotContentTypeUi() {
        let slot = getSelectedSlot(),
          type = slot?.contentType || "none",
          has = !!slot,
          image = slotImage(slot),
          isImage = type === "image";
        $("slotTypeControls").classList.toggle("hidden", !has);
        syncSettingToggle("slotTypeGraph", type === "graph");
        syncSettingToggle("slotTypeImage", isImage);
        let filePickLabel = isImage ? "이미지 추가" : has ? "CSV 추가" : "파일 추가";
        $("filePick").title = filePickLabel;
        $("filePick").setAttribute("aria-label", filePickLabel);
        $("file").accept = isImage ? "image/*" : has ? ".csv,.tsv,.json" : ".csv,.tsv,.json,image/*";
        $("fileTypeHint").textContent = isImage
          ? "이미지 파일을 선택하세요. 이미지는 선택한 슬롯에서 그래프를 대체해 표시됩니다."
          : has
            ? "CSV/TSV 또는 JSON 객체 배열을 지원합니다. 데이터는 오프라인으로 처리됩니다."
            : "슬롯을 선택하지 않으면 파일을 프로젝트 오브젝트로만 추가합니다.";
        let showCsvPanel = has ? !isImage : activeAssetKind === "csv",
          showImagePanel = has ? isImage : activeAssetKind === "image";
        $("csvSelectionPanel").classList.toggle("hidden", !showCsvPanel);
        $("imageSelectionPanel").classList.toggle("hidden", !showImagePanel);
        $("imageBox").classList.toggle("hidden", !has || !isImage || !image);
        if (isImage) $("buildBox").classList.add("hidden");
        $("imagePreview").classList.toggle("hidden", !image);
        if (image) $("imagePreview").src = projectImageDisplayUrl(image);
        refreshCsvControls();
        refreshImageControls();
        syncImageSettingsUi();
      }
      function workspaceAvailabilityModel() {
        let hasSlot = !!getSelectedSlot(),
          selectedAsset = appFSM.state.assetPath
            ? projectVfs.resolve(appFSM.state.assetPath)
            : null,
          hasAsset = selectedAsset?.kind === appFSM.state.assetSelection,
          canDeleteAsset =
            hasAsset &&
            ["csv", "image"].includes(selectedAsset.kind) &&
            !(selectedAsset.kind === "csv" && selectedAsset.asset.isDefaultEmpty === true);
        return { hasSlot, selectedAsset, hasAsset, canDeleteAsset };
      }
      function applyWorkspaceAvailabilityPolicy(model = workspaceAvailabilityModel()) {
        if (model.hasSlot && appFSM.state.overlay === "readme")
          appFSM.send("CLOSE_OVERLAY", { reason: "slot-selected" });
        return model;
      }
      function updateFileAvailability(model = applyWorkspaceAvailabilityPolicy()) {
        let { hasSlot, selectedAsset, hasAsset, canDeleteAsset } = model;
        $("resetSelectedSlot").classList.toggle("hidden", !hasSlot);
        $("assetDownload").disabled = !hasAsset || !["csv", "image"].includes(selectedAsset.kind);
        $("deleteSelectedAsset").disabled = !canDeleteAsset;
        $("readmeToggle").classList.toggle("hidden", hasSlot);
        $("projectBox").classList.toggle("hidden", hasSlot);
        syncAssetTreeActionMenu();
        syncSlotContentTypeUi();
      }
      function updateGraphView() {
        debugLog("updateGraphView", { selectedSlotId });
        renderDashboard();
      }
      function swapSlotContents(source, target) {
        if (!source || !target || source === target || source.hidden || target.hidden) return false;
        appFSM.send("SLOTS_SWAPPED", {
          sourceSlotId: source.id,
          targetSlotId: target.id,
        });
        return true;
      }
      function clearSlotDragState() {
        slotDragSourceId = null;
        document
          .querySelectorAll("#dashboard .slot.drag-over")
          .forEach((slot) => slot.classList.remove("drag-over"));
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
              debugLog("slotClick:dashboard-background", {
                target: e.target.className?.baseVal || e.target.className || e.target.tagName,
                wasSelected: selectedSlotId !== null,
              });
              if (selectedSlotId !== null) setSelectedSlot(null);
              return;
            }
            let slot = slotAt(+el.dataset.slot),
              tab = !!e.target.closest?.(".slot-tab");
            if (!slot) return;
            if (tab && slotDragSuppressClick) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            debugLog("slotClick", {
              slotId: slot.id,
              hasChart: !!slot.chart,
              tab,
              wasSelected: isSlotSelected(slot),
              target: e.target.className?.baseVal || e.target.className || e.target.tagName,
            });
            if (tab || !slot.chart || !isSlotSelected(slot)) {
              e.preventDefault();
              e.stopPropagation();
              setSelectedSlot(slot.id);
            } else debugLog("slotClick:plotly-pass-through", { slotId: slot.id });
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
            target = el && slotAt(+el.dataset.slot),
            types = new Set(Array.from(e.dataTransfer?.types || []));
          if (types.has(ASSET_TREE_DRAG_TYPE)) {
            if (!target || target.hidden) return;
            let dragged = null;
            try {
              dragged = JSON.parse(e.dataTransfer.getData(ASSET_TREE_DRAG_TYPE) || "null");
            } catch (_) {}
            if (dragged?.kind === "directory" || projectVfs.isTrashed(dragged?.path || "/")) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "link";
            dashboard.querySelectorAll(".slot.drag-over").forEach((slot) => {
              if (slot !== el) slot.classList.remove("drag-over");
            });
            el.classList.add("drag-over");
            return;
          }
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
        dashboard.addEventListener("drop", async (e) => {
          let el = e.target.closest?.(".slot"),
            target = el && slotAt(+el.dataset.slot),
            internal = e.dataTransfer?.getData(ASSET_TREE_DRAG_TYPE),
            file = e.dataTransfer?.files?.[0];
          if (internal) {
            e.preventDefault();
            e.stopPropagation();
            el?.classList.remove("drag-over");
            clearSlotDragState();
            try {
              let dragged = JSON.parse(internal);
              connectProjectAssetToSlot(dragged.path, dragged.kind, target);
            } catch (error) {
              status("프로젝트 파일 연결 실패: " + error.message);
            } finally {
              setTimeout(() => {
                slotDragSuppressClick = false;
              }, 0);
            }
            return;
          }
          if (file) {
            if (!target || target.hidden) {
              clearSlotDragState();
              return;
            }
            e.preventDefault();
            e.stopPropagation();
            el.classList.remove("drag-over");
            clearSlotDragState();
            if (!isSlotSelected(target)) setSelectedSlot(target.id);
            try {
              await appFSM.run("importing", "SLOT_DROP_IMPORT", () =>
                loadFileIntoSlot(file, target),
              );
              debugLog("slot:file-drop", {
                slotId: target.id,
                name: file.name,
                kind: slotFileKind(file),
              });
            } catch (error) {
              status("불러오기 실패: " + error.message);
            } finally {
              setTimeout(() => {
                slotDragSuppressClick = false;
              }, 0);
            }
            return;
          }
          let source = slotDragSourceId === null ? null : slotAt(slotDragSourceId);
          if (!source || !target || target.hidden || source === target) {
            clearSlotDragState();
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          el.classList.remove("drag-over");
          swapSlotContents(source, target);
          clearSlotDragState();
          setTimeout(() => {
            slotDragSuppressClick = false;
          }, 0);
        });
        dashboard.addEventListener("dragend", () => {
          clearSlotDragState();
          setTimeout(() => {
            slotDragSuppressClick = false;
          }, 0);
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
        let settings = project.labelSettings;
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
        return project.slots
          .filter((slot) => !slot.hidden)
          .sort((a, b) =>
            project.labelSettings.order === "column-major"
              ? a.col - b.col || a.row - b.row
              : a.row - b.row || a.col - b.col,
          );
      }
      function slotLabel(slot, project = activeProject) {
        let index = orderedVisibleSlots(project).findIndex((item) => item.id === slot?.id);
        return slotIdentifier(Math.max(0, index), project);
      }
      function initializeSlotCaption(slot) {
        if (slot && slot.caption == null) slot.caption = "슬롯 캡션";
        return slot?.caption ?? "";
      }
      function initializeSlotCaptions(project = activeProject) {
        orderedVisibleSlots(project).forEach(initializeSlotCaption);
      }
      function normalizeLegacySlotCaptionDefaults(project = activeProject) {
        orderedVisibleSlots(project).forEach((slot) => {
          if (slot.caption === `${slotLabel(slot, project)} 슬롯 캡션`)
            slot.caption = "슬롯 캡션";
        });
      }
      function activeSlotCaptionTarget() {
        return activeProject.slotCaptionsEnabled ? getSelectedSlot() : null;
      }
      function slotCaptionSections() {
        let groups = [],
          current = null;
        orderedVisibleSlots().forEach((slot, index) => {
          let text = typeof slot.caption === "string" ? slot.caption : "";
          if (text === "") {
            current = null;
            return;
          }
          if (current && current.end === index - 1 && current.text === text)
            current.end = index;
          else {
            current = { start: index, end: index, text };
            groups.push(current);
          }
        });
        return groups.map((group) => {
          let first = slotIdentifier(group.start),
            last = slotIdentifier(group.end);
          return {
            label: activeProject.labelsEnabled
              ? `(${first}${group.end > group.start ? `-${last}` : ""})`
              : "",
            text: group.text,
          };
        });
      }
      function activeCaptionView(caption = projectObjects.read("captions")) {
        let slot = activeSlotCaptionTarget(),
          label = slot && activeProject.labelsEnabled ? `(${slotLabel(slot)})` : "",
          text = slot ? slot.caption ?? "슬롯 캡션" : caption.text;
        return {
          enabled: caption.enabled,
          text,
          afterText: "",
          sections: [],
          aggregate: false,
          editable: true,
          label,
          name: slot ? "" : caption.name,
          nameBold: slot ? false : caption.nameBold,
          settings: caption.settings,
          slot,
          slotMode: caption.slotMode,
          exportText: [label, text].filter(Boolean).join(" "),
        };
      }
      function readCaptionEditorState() {
        let caption = projectObjects.read("captions"),
          view = activeCaptionView(caption);
        return {
          enabled: !!caption.enabled,
          slotMode: !!caption.slotMode,
          target: view.slot ? "slot" : "global",
          targetSlotId: view.slot?.id ?? null,
          text: view.text,
          name: view.name,
          nameBold: !!view.nameBold,
          settings: projectClone(view.settings),
        };
      }
      function applyCaptionEditorFromValues(values = {}) {
        if (values.enabled != null)
          applyAnnotationVisibilityFromValues("caption", values.enabled);
        if (values.slotMode != null && !!values.slotMode !== activeProject.slotCaptionsEnabled)
          appFSM.send("SLOT_CAPTION_MODE_CHANGED", {
            enabled: !!values.slotMode,
            direction: "fsm-to-model",
          });
        let view = activeCaptionView(),
          currentSettings = activeProject.captionSettings;
        applyCaptionSettingsFromValues({
          name: view.slot ? activeProject.captionName : values.name ?? activeProject.captionName,
          nameBold: view.slot
            ? activeProject.captionNameBold
            : values.nameBold ?? activeProject.captionNameBold,
          fontFamily: values.fontFamily ?? currentSettings.fontFamily,
          fontSize: values.fontSize ?? currentSettings.fontSize,
          lineHeight: values.lineHeight ?? currentSettings.lineHeight,
        });
        if (values.text != null)
          appFSM.send("CAPTION_TEXT_INPUT", {
            text: String(values.text),
            region: "body",
            direction: "fsm-to-model",
          });
        return readCaptionEditorState();
      }
      function insertSlotCaptionsFromCurrentLayout() {
        clearAllSlotSelections();
        let before = activeProject.captionText;
        appFSM.send("SLOT_CAPTIONS_INSERTED", { direction: "fsm-to-model" });
        let changed = activeProject.captionText !== before;
        if (!changed) status("추가할 슬롯별 캡션이 없습니다.");
        else
          debugLog("annotation:slot-captions-inserted", {
            length: activeProject.captionText.length - before.length,
          });
        return {
          changed,
          editor: readCaptionEditorState(),
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
        if ($("labelPreview")) renderLabelPreview();
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
            imageSettings = normalizeImageSettings(image),
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
                  c,
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
                      copyRange = (plotlyAxis, key, kind, side) => {
                        let range = full?.[plotlyAxis]?.range;
                        if (!Array.isArray(range) || range.length !== 2) return;
                        let setting = settings.axes[key];
                        setting.min = axisRangeValueFromPlotly(range[0], setting.scaleType);
                        setting.max = axisRangeValueFromPlotly(range[1], setting.scaleType);
                        if (editing?.id === c.id && $(kind + "AxisSide").value === side) {
                          $(`${key}Min`).value = setting.min;
                          $(`${key}Max`).value = setting.max;
                        }
                      },
                      axisChanged = (plotlyAxis) =>
                        all ||
                        changed.some(
                          (name) =>
                            name === `${plotlyAxis}.autorange` ||
                            name.startsWith(`${plotlyAxis}.range[`),
                        );
                    [
                      ["xaxis", "xBottom", "x", "bottom"],
                      ["xaxis2", "xTop", "x", "top"],
                      ["yaxis", "yLeft", "y", "left"],
                      ["yaxis2", "yRight", "y", "right"],
                    ].forEach(([plotlyAxis, key, kind, side]) => {
                      if (axisChanged(plotlyAxis)) copyRange(plotlyAxis, key, kind, side);
                    });
                    c.editor.globalSettings = settings;
                    if (editing?.id === c.id) editing = c;
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
        renderLayout();
      }
      function syncPopupBounds() {
        let main = document.querySelector("main");
        if (!main) return;
        let rect = main.getBoundingClientRect(),
          inset = 18,
          width = Math.max(0, rect.width - inset * 2);
        document
          .querySelectorAll(".layout-panel,.annotation-panel,.print-panel")
          .forEach((panel) => {
            panel.style.left = `${Math.round(rect.left + inset)}px`;
            panel.style.width = `${Math.round(width)}px`;
            panel.style.right = "auto";
          });
      }
      function syncLayoutMapSize(requestedHeight = null) {
        syncPopupBounds();
        let panel = $("layoutPanel"),
          map = $("layoutMap");
        if (!panel || panel.classList.contains("hidden")) return;
        let header = panel.querySelector(".popup-heading"),
          zoom = $("dashboardZoom")?.closest(".dashboard-zoom-control"),
          resize = $("layoutResize"),
          style = getComputedStyle(panel),
          mapStyle = getComputedStyle(map),
          resizeStyle = getComputedStyle(resize),
          zoomStyle = zoom ? getComputedStyle(zoom) : null,
          paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
          paddingBottom = parseFloat(style.paddingBottom),
          resizeMarginTop = parseFloat(resizeStyle.marginTop) || 0,
          zoomHeight = zoom?.offsetHeight || 0,
          zoomMarginTop = zoomStyle ? parseFloat(zoomStyle.marginTop) || 0 : 0,
          resizeHeight = resize.offsetHeight || 0,
          aspect = activeProject.layout.slotStyle.aspect,
          cssMinWidth = parseFloat(mapStyle.minWidth) || 0,
          visibleWidth = Math.max(1, panel.clientWidth - paddingX),
          contentWidth = Math.max(visibleWidth, cssMinWidth),
          minMapHeight = Math.max(96, activeProject.gridRows * 24),
          minWidth = Math.max(cssMinWidth, minMapHeight * aspect),
          maxWidth = Math.max(minWidth, contentWidth),
          viewportBottom = window.innerHeight - 10,
          mapTop = map.getBoundingClientRect().top,
          mapOverheadAfter =
            zoomMarginTop + zoomHeight + resizeMarginTop + resizeHeight + paddingBottom,
          maxMapHeight = Math.max(minMapHeight, viewportBottom - mapTop - mapOverheadAfter),
          heightLimitedWidth = maxMapHeight * aspect,
          initial = !Number.isFinite(activeProject.layoutMapWidth);
        if (requestedHeight !== null) {
          activeProject.layoutMapWidth = Math.max(minMapHeight, requestedHeight) * aspect;
          initial = false;
        }
        if (initial) {
          let graphHeight = $("dashboard").getBoundingClientRect().height,
            targetPanelHeight = graphHeight / 2 + (header?.offsetHeight || 0),
            mapOverhead =
              map.offsetTop +
              zoomMarginTop +
              zoomHeight +
              resizeMarginTop +
              resizeHeight +
              paddingBottom,
            targetMapHeight = Math.max(minMapHeight, targetPanelHeight - mapOverhead);
          activeProject.layoutMapWidth = targetMapHeight * aspect;
        }
        activeProject.layoutMapWidth = Math.max(
          Math.min(minWidth, heightLimitedWidth),
          Math.min(maxWidth, heightLimitedWidth, activeProject.layoutMapWidth),
        );
        let height = activeProject.layoutMapWidth / aspect;
        map.style.width = `${activeProject.layoutMapWidth}px`;
        map.style.height = `${height}px`;
        map.style.aspectRatio = `${aspect} / 1`;
        applyReferenceGeometry(map);
        panel.style.removeProperty("height");
      }
      function installLayoutResizer() {
        let resize = $("layoutResize"),
          map = $("layoutMap"),
          dragging = false,
          startY = 0,
          startHeight = 0;
        resize.addEventListener("pointerdown", (e) => {
          if ($("layoutPanel").classList.contains("hidden")) return;
          dragging = true;
          startY = e.clientY;
          startHeight = map.getBoundingClientRect().height;
          resize.setPointerCapture(e.pointerId);
          document.body.style.userSelect = "none";
        });
        resize.addEventListener("pointermove", (e) => {
          if (dragging) syncLayoutMapSize(startHeight + e.clientY - startY);
        });
        resize.addEventListener("pointerup", (e) => {
          if (!dragging) return;
          dragging = false;
          resize.releasePointerCapture?.(e.pointerId);
          document.body.style.userSelect = "";
          debugLog("layoutResize:end", {
            mapWidth: Math.round(map.getBoundingClientRect().width),
            mapHeight: Math.round(map.getBoundingClientRect().height),
            panelHeight: Math.round($("layoutPanel").getBoundingClientRect().height),
          });
        });
      }
      function renderLayout(map = $("layoutMap")) {
        if (!map) return;
        map.style.gridTemplateColumns = `repeat(${activeProject.gridCols},minmax(0,1fr))`;
        map.style.gridTemplateRows = `repeat(${activeProject.gridRows},minmax(0,1fr))`;
        map.innerHTML = "";
        activeProject.slots
          .filter((s) => !s.hidden)
          .forEach((s) => {
            let e = document.createElement("div");
            let hasContent =
              (s.contentType === "image" && !!s.imageId && !!getProjectImage(s.imageId)) ||
              (s.contentType !== "image" && !!s.chart && !!getChart(s.chart));
            e.className =
              "layout-slot" +
              (hasContent ? " has-content" : "") +
              (layoutSelected.has(s.id) ? " selected" : "");
            e.style.gridArea = `${s.row} / ${s.col} / span ${s.rowSpan} / span ${s.colSpan}`;
            e.setAttribute("aria-label", `${s.row}행 ${s.col}열${hasContent ? " · 콘텐츠 있음" : ""}`);
            e.onclick = () => {
              layoutSelected.has(s.id) ? layoutSelected.delete(s.id) : layoutSelected.add(s.id);
              renderLayout(map);
            };
            map.append(e);
          });
      }
      function applyLifecycleDomainState({ state, payload } = {}) {
        if (state === "error" && payload?.error)
          debugLog("fsm:lifecycle-error", payload.error, "error");
        return state;
      }
      function applyOverlayOpenPolicy(state) {
        if (state !== "none" && state !== "readme") clearAllSlotSelections();
        return state;
      }
      function syncProjectWorkspaceDomainState() {
        let availability = applyWorkspaceAvailabilityPolicy();
        refreshCsvControls();
        setActiveImageFromId();
        return { availability };
      }
      function syncGraphWorkspaceDomainState() {
        let slot = getSelectedSlot();
        if (!slot) return null;
        let availability = applyWorkspaceAvailabilityPolicy(),
          selection =
            slot.chart && editing?.id !== slot.chart ? selectChartForEditing(slot.chart) : null;
        refreshCsvControls();
        return { slot, availability, selection };
      }
      function syncImageWorkspaceDomainState() {
        let slot = getSelectedSlot();
        if (!slot) return null;
        let availability = applyWorkspaceAvailabilityPolicy();
        setActiveImageFromId(slot.imageId);
        return { slot, availability };
      }
      function exitGraphWorkspaceDomainState() {
        selectedObjectIndex = null;
      }
      function selectChartForEditing(id) {
        let chart = getChart(id);
        if (!chart) {
          debugLog("editChart:missing", { chartId: id });
          return null;
        }
        let csv =
          getProjectCsv(chart.editor?.objects?.[0]?.csvId) ||
          (chart.editor?.editable === false ? ensureDefaultCsv() : null);
        if (!csv) throw Error("차트가 참조하는 프로젝트 CSV가 없습니다.");
        debugLog("editChart", {
          chartId: id,
          sourceName: csv.name,
        });
        editing = chart;
        activeDataName = csv.name || "선택한 그래프 데이터";
        activeCsvId = csv.id;
        refreshCsvControls(csv.id);
        selectedObjectIndex = null;
        return { chart, csv };
      }
      function syncLegacyGraphEditorSelection(selection) {
        let { chart: c, csv } = selection;
        setFileName(csv.name);
        $("headerLines").value = csv.headerLines;
        loadData(csv.rows, activeDataName);
        activeDataReady = true;
        let map = { x: "xCol", y: "yCol", type: "chartType" };
        for (let k of [
          "x",
          "y",
          "xAxisSide",
          "yAxisSide",
          "type",
          "title",
          "legendName",
          "lineWidth",
          "lineDash",
          "markerSymbol",
          "markerSize",
          "barOpacity",
          "barLineWidth",
        ]) {
          let control = $(map[k] || k);
          if (control) control.value = c.editor[k];
          else debugLog("editChart:missing-control", { key: k, id: map[k] || k });
        }
        graphColorInputs(c.editor.colors);
        let settings = normalizeGlobalSettings(c),
          xAxis = settings.axes[axisKey("x", c.editor.xAxisSide)],
          yAxis = settings.axes[axisKey("y", c.editor.yAxisSide)];
        ["showLegend", "showTitle", "showZeroLine"].forEach((id) => {
          let active = settings[id] !== false;
          syncSettingToggle(id, active);
        });
        setGraphFontSelectValue("graphFontFamily", settings.graphFontFamily);
        ["titleFontSize", "legendFontSize"].forEach((id) => {
          $(id).value = settings[id] ?? "";
        });
        Object.entries(settings.axes).forEach(([key, axis]) =>
          Object.entries(axis).forEach(([name, value]) => {
            let suffix =
                { showGrid: "Grid", visible: "Visible", showValues: "Values" }[name] ||
                name[0].toUpperCase() + name.slice(1),
              control = $(key + suffix);
            if (control) {
              if (["showGrid", "visible", "showValues"].includes(name)) {
                let active = name === "showGrid" ? value === true : value !== false;
                syncSettingToggle(control, active);
              } else if (name === "tickMode" || name === "minorTicks")
                syncAxisTickModeControl(
                  key,
                  axis.tickMode,
                  axis.minorTicks === true,
                );
              else control.value = value ?? "";
            }
          }),
        );
        Object.entries(settings.axes).forEach(([key, axis]) =>
          syncAxisTickModeControl(key, axis.tickMode, axis.minorTicks === true),
        );
        renderGraphObjects(ensureGraphObjects(c));
        updateTypeSpecificOptions();
        syncEditableUi(c);
        status(`“${c.editor.title}” 그래프의 설정을 불러왔습니다.`);
      }
      function editChart(id) {
        let selection = selectChartForEditing(id);
        if (!selection) return;
        syncLegacyGraphEditorSelection(selection);
      }
      function applyGraphLayoutSettings(values = chartLayoutControlValues(), expectedChartId = null) {
        let target = getSelectedSlot(),
          chart = target?.chart ? getChart(target.chart) : null;
        if (expectedChartId != null && chart?.id !== expectedChartId) return false;
        if (!target || target.contentType === "image" || !chart) {
          debugLog("graph:layout-apply-blocked", {
            slotId: target?.id ?? null,
            chartId: chart?.id ?? null,
            reason: !target
              ? "slot-not-selected"
              : target.contentType === "image"
                ? "graph-slot-not-selected"
                : "chart-not-found",
          }, "warn");
          return;
        }
        try {
          let form = chartLayoutSettingsFromValues(chart, values),
            payload = {
              slotId: target.id,
              chartId: chart.id,
              title: form.title,
              globalSettings: form.globalSettings,
              direction: "fsm-to-model",
            };
          appFSM.send("CHART_LAYOUT_CHANGED", payload);
          let plot = $(`plot-${target.id}`);
          if (plot) {
            let renderGeneration = dashboardRenderGeneration,
              currentPlot = () =>
                renderGeneration === dashboardRenderGeneration &&
                plot.isConnected &&
                plot === document.getElementById(`plot-${target.id}`) &&
                getSelectedSlot()?.id === target.id &&
                getChart(target.chart) === chart;
            let figure = chartFigure(chart);
            programmaticPlotlyRelayout.set(
              plot,
              (programmaticPlotlyRelayout.get(plot) || 0) + 1,
            );
            Promise.resolve(Plotly.react(
              plot,
              figure.data,
              figure.layout,
              plotlyConfig(chart, { ...figure.config, staticPlot: false }),
            ))
              .catch((error) => {
                if (!currentPlot()) return;
                debugLog("plotly:relayout-error", {
                  slotId: target.id,
                  chartId: chart.id,
                  message: error?.message || String(error),
                });
                status("그래프 레이아웃 변경 오류: " + (error?.message || error));
              })
              .finally(() => {
                let pending = (programmaticPlotlyRelayout.get(plot) || 1) - 1;
                if (pending > 0) programmaticPlotlyRelayout.set(plot, pending);
                else programmaticPlotlyRelayout.delete(plot);
              });
          }
          debugLog("graph:layout-apply", { slotId: target.id, chartId: chart.id });
        } catch (error) {
          debugLog("graph:layout-apply-error", error, "error");
          status(error.message);
        }
      }
      function applyGraphSettings() {
        let target = getSelectedSlot();
        if (!activeDataReady || !target) {
          debugLog("graph:apply-blocked", {
            activeDataReady,
            slotId: target?.id ?? null,
            chartId: editing?.id ?? null,
            reason: !activeDataReady ? "data-not-ready" : "slot-not-selected",
          }, "warn");
          return;
        }
        if (target.chart && !selectedGraphObjectGuard()) {
          debugLog("graph:apply-blocked", {
            activeDataReady,
            slotId: target.id,
            chartId: editing?.id ?? target.chart,
            reason: "graph-object-not-selected",
          }, "warn");
          return status("설정을 변경할 그래프 오브젝트를 먼저 선택하세요.");
        }
        try {
          if (editing && editing.editor.editable === false)
            return status("편집 가능 토글을 켠 뒤 설정을 변경하세요.");
          debugLog("graph:apply-start", {
            slotId: target.id,
            chartId: target.chart,
            selectedObjectIndex,
          });
          let c = configFromForm(),
            objects = ensureGraphObjects(editing),
            objectIndex = selectedGraphObjectGuard() ? selectedObjectIndex : null;
          if (objectIndex !== null && objects[objectIndex]) {
            objects = [...objects];
            let previous = objects[objectIndex];
            objects[objectIndex] = {
              ...previous,
              x: c.editor.x,
              y: c.editor.y,
              xAxisSide: c.editor.xAxisSide,
              yAxisSide: c.editor.yAxisSide,
              type: c.editor.type,
              legendName: c.editor.legendName,
              lineWidth: c.editor.lineWidth,
              lineDash: c.editor.lineDash,
              markerSymbol: c.editor.markerSymbol,
              markerSize: c.editor.markerSize,
              barOpacity: c.editor.barOpacity,
              barLineWidth: c.editor.barLineWidth,
            };
            c.editor.objects = objects;
          }
          if (!target.chart)
            throw Error("설정을 적용할 차트가 없습니다.");
          c.id = target.chart;
          c.editor.editable = true;
          let payload = {
            slotId: target.id,
            chartId: target.chart,
            chart: c,
            direction: "fsm-to-model",
          };
          appFSM.send("CHART_MODEL_REPLACED", payload);
          editing = payload.chart;
          renderGraphObjects(ensureGraphObjects(editing));
          updateGraphView();
          debugLog("graph:apply-complete", {
            slotId: target.id,
            chartId: c.id,
            objects: c.editor.objects?.length || 0,
            selectedObjectIndex,
          });
          auditApp("graph:apply");
        } catch (e) {
          debugLog("graph:apply-error", e, "error");
          status(e.message);
        }
      }
      function mergeSelected() {
        let selected = [...layoutSelected].map(slotAt).filter(Boolean);
        if (selected.length < 2) return status("합칠 슬롯을 둘 이상 선택하세요.");
        let top = Math.min(...selected.map((s) => s.row)),
          left = Math.min(...selected.map((s) => s.col)),
          bottom = Math.max(...selected.map((s) => s.row + s.rowSpan - 1)),
          right = Math.max(...selected.map((s) => s.col + s.colSpan - 1)),
          covered = new Set();
        selected.forEach((s) => {
          for (let row = s.row; row < s.row + s.rowSpan; row++)
            for (let col = s.col; col < s.col + s.colSpan; col++) covered.add(`${row}:${col}`);
        });
        let area = (bottom - top + 1) * (right - left + 1);
        if (covered.size !== area)
          return status("선택한 슬롯의 전체 영역이 빈칸 없는 직사각형이어야 합니다.");
        let cells = activeProject.slots.filter(
          (s) => s.row >= top && s.row <= bottom && s.col >= left && s.col <= right,
        );
        if (cells.length !== area) return status("선택 영역을 확인할 수 없습니다.");
        let occupied = selected.filter((s) => s.chart || s.imageId);
        if (occupied.length > 1)
          return status("콘텐츠가 두 개 이상 있는 슬롯은 합칠 수 없습니다.");
        let anchor = cells.find((s) => s.row === top && s.col === left),
          source = occupied[0] || null,
          sourceContent = null;
        if (source && source !== anchor) {
          sourceContent = {};
          ["chart", "imageId", "contentType"].forEach(
            (key) => (sourceContent[key] = source[key]),
          );
        }
        cells.forEach((s) => {
          s.hidden = false;
          s.rowSpan = 1;
          s.colSpan = 1;
          if (s !== anchor) {
            s.chart = null;
            s.imageId = null;
          }
        });
        anchor.rowSpan = bottom - top + 1;
        anchor.colSpan = right - left + 1;
        if (source) {
          if (sourceContent) Object.assign(anchor, sourceContent);
          else anchor.chart = source.chart;
          if (anchor.chart) {
            let chart = getChart(anchor.chart);
          }
        } else {
          anchor.chart = null;
          anchor.imageId = null;
        }
        cells.filter((s) => s !== anchor).forEach((s) => (s.hidden = true));
        if (selectedSlotId !== null && cells.some((s) => s.id === selectedSlotId))
          selectedSlotId = anchor.id;
        layoutSelected.clear();
        renderDashboard();
        status("직사각형 영역의 슬롯을 합쳤습니다.");
        appFSM.send("SELECT_SLOT", {
          slotId: selectedSlotId,
          reason: "slots-merged",
          direction: "model-to-fsm",
        });
        appFSM.notify("layout", "SLOTS_MERGED");
      }
      function splitSelected() {
        let selected = [...layoutSelected]
          .map(slotAt)
          .filter((s) => s && (s.rowSpan > 1 || s.colSpan > 1));
        if (!selected.length) return status("나눌 합쳐진 슬롯을 선택하세요.");
        let restored = new Set();
        selected.forEach((s) => {
          let endRow = s.row + s.rowSpan,
            endCol = s.col + s.colSpan;
          activeProject.slots.forEach((cell) => {
            if (cell.row >= s.row && cell.row < endRow && cell.col >= s.col && cell.col < endCol) {
              cell.hidden = false;
              cell.rowSpan = 1;
              cell.colSpan = 1;
              if (cell !== s) {
                cell.chart = null;
                cell.imageId = null;
              }
              restored.add(cell.id);
            }
          });
        });
        layoutSelected.clear();
        restored.forEach((id) => layoutSelected.add(id));
        renderDashboard();
        status(`${selected.length}개 슬롯을 나눴습니다.`);
        appFSM.notify("layout", "SLOTS_SPLIT");
      }
      $("readmeToggle").onclick = () => {
        appFSM.send("TOGGLE_OVERLAY", { overlay: "readme", source: "toggle" });
      };
      $("closeReadme").onclick = () =>
        appFSM.send("CLOSE_OVERLAY", { reason: "readme-close" });
      $("readmeDialog").addEventListener("cancel", (event) => {
        event.preventDefault();
        appFSM.send("ESCAPE", { reason: "readme-cancel" });
      });
      $("readmeDialog").addEventListener("click", (event) => {
        let dialog = $("readmeDialog"),
          bounds = dialog.getBoundingClientRect(),
          outside =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;
        if (event.target === dialog && outside)
          appFSM.send("CLOSE_OVERLAY", { reason: "readme-backdrop-click" });
      });
      $("readmeDialog").addEventListener("close", () => {
        if (appFSM.state.overlay === "readme")
          appFSM.send("CLOSE_OVERLAY", { reason: "readme-native-close" });
      });
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
        if (chart.editor.editable !== false && chart.editor.objects.length === 0)
          throw Error(`${label}에는 그래프 오브젝트가 하나 이상 필요합니다.`);
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
        chart.editor.objects.forEach((object, index) => {
          if (
            chart.editor.editable !== false &&
            (!Number.isInteger(object.csvId) || !getProjectCsv(object.csvId, csvCollection))
          )
            throw Error(`${label} 그래프 객체 ${index + 1}의 csvId가 올바르지 않습니다.`);
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
      function rebuildEditableGraph(chart) {
        chart.graph.data = traces(chart);
        chart.graph.layout = layout(chart);
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
      function chartFigure(chart, scale = 1) {
        let copy = chartExportCopy(chart);
        if (copy.editor.editable === false && copy.graph.imported)
          return scalePlotlyFigure(copy.graph.imported, scale);
        rebuildEditableGraph(copy);
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
        if (!rowsOut.length) rowsOut = [{ X: "", Y: "" }];
        let sourceHeaders = [...new Set(rowsOut.flatMap((row) => Object.keys(row || {})))],
          columnMap = Object.fromEntries(
            sourceHeaders.map((header, index) => [header, `C${index + 1}`]),
          );
        objects = objects.map((object) => ({
          ...object,
          x: columnMap[object.x] || object.x,
          y: columnMap[object.y] || object.y,
        }));
        rowsOut = dataTable(rowsOut);
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
      function syncEditableUi(chart) {
        let editable = chart ? chart.editor.editable !== false : true,
          button = $("editorEditable");
        syncSettingToggle(button, editable, ["원본 JSON", "편집 가능"]);
        document
          .querySelectorAll(
            "#buildBox details input,#buildBox details select,#buildBox details button",
          )
          .forEach((control) => {
            if (control.id !== "editorEditable") control.disabled = !editable;
          });
      }
      function setGraphEditorEditableFromValue(editable, expectedChartId = null) {
        let chart = editing;
        if (!chart) {
          status("편집 모드를 바꿀 그래프 슬롯을 먼저 선택하세요.");
          return null;
        }
        if (expectedChartId !== null && chart.id !== expectedChartId) {
          debugLog("editor:editable-stale", {
            expectedChartId,
            actualChartId: chart.id,
          });
          return null;
        }
        let next = !!editable,
          csv = null;
        if (next && chartCsvIds(chart).length === 0) {
          let conversionRows =
              chart.editor.conversionRows ||
              parsePlotlyToEditor(chart.graph.imported, chart.id).editor.conversionRows,
            fallbackRows = [
              ["X", "Y"],
              ["", ""],
            ];
          if (!Array.isArray(conversionRows) || !conversionRows.length)
            conversionRows = fallbackRows;
          csv = createProjectCsv(conversionRows, "Plotly JSON.csv");
          chart.editor.objects.forEach((object) => {
            object.csvId = csv.id;
          });
          if (Array.isArray(chart.editor.conversionRows)) chart.editor.conversionRows.length = 0;
          delete chart.editor.conversionRows;
          fallbackRows.length = 0;
          conversionRows = null;
          activeCsvId = csv.id;
          activeDataName = csv.name;
        }
        chart.editor.editable = next;
        if (next) rebuildEditableGraph(chart);
        renderDashboard();
        status(
          next
            ? "가져온 JSON을 편집기 설정으로 재구성했습니다."
            : "가져온 원본 Plotly JSON 표시로 전환했습니다.",
        );
        debugLog("editor:editable", { chartId: chart.id, editable: next });
        publishFastFigureUiStore(appFSM.state, "graph:editable");
        return { chart, csv, editable: next };
      }
      function projectClone(value) {
        return JSON.parse(JSON.stringify(value));
      }
      function slotLegacyState(slot) {
        let state = Object.fromEntries(
            Object.entries(slot).filter(([key]) => key !== "content"),
          ),
          content = slot.content && typeof slot.content === "object" ? slot.content : {};
        state.chart = content.chart ?? null;
        state.imageId = content.imageId ?? null;
        state.contentType = content.contentType === "image" ? "image" : "graph";
        state.caption = typeof content.caption === "string" ? content.caption : null;
        return state;
      }
      function normalizeSlotContent(slot) {
        if (!slot || typeof slot !== "object" || Array.isArray(slot)) return slot;
        let legacy = {
            chart: slot.chart ?? null,
            imageId: slot.imageId ?? null,
            contentType: slot.contentType === "image" ? "image" : "graph",
            caption: typeof slot.caption === "string" ? slot.caption : null,
          },
          content =
            slot.content && typeof slot.content === "object" && !Array.isArray(slot.content)
              ? slot.content
              : {};
        if (!Object.prototype.hasOwnProperty.call(content, "chart")) content.chart = legacy.chart;
        if (!Object.prototype.hasOwnProperty.call(content, "imageId"))
          content.imageId = legacy.imageId;
        if (!Object.prototype.hasOwnProperty.call(content, "contentType"))
          content.contentType = legacy.contentType;
        if (!Object.prototype.hasOwnProperty.call(content, "caption"))
          content.caption = legacy.caption;
        slot.content = content;
        Object.defineProperties(slot, {
          chart: {
            configurable: true,
            enumerable: false,
            get() {
              return this.content.chart;
            },
            set(value) {
              this.content.chart = value;
            },
          },
          imageId: {
            configurable: true,
            enumerable: false,
            get() {
              return this.content.imageId;
            },
            set(value) {
              this.content.imageId = value;
            },
          },
          contentType: {
            configurable: true,
            enumerable: false,
            get() {
              return this.content.contentType;
            },
            set(value) {
              this.content.contentType = value;
            },
          },
          caption: {
            configurable: true,
            enumerable: false,
            get() {
              return this.content.caption;
            },
            set(value) {
              this.content.caption = value;
            },
          },
          toJSON: {
            configurable: true,
            enumerable: false,
            value() {
              return slotLegacyState(this);
            },
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
        let record = (value) =>
          !!value && typeof value === "object" && !Array.isArray(value);
        if (
          !record(state) ||
          state.kind !== "fast-figure-project-object" ||
          !record(state.meta) ||
          !record(state.layout) ||
          !record(state.layout.slotStyle) ||
          !record(state.annotations?.labels) ||
          !record(state.annotations?.labels?.settings) ||
          !record(state.annotations?.captions) ||
          !record(state.annotations?.captions?.settings) ||
          !record(state.assets) ||
          !record(state.nextId) ||
          !record(state.appearance) ||
          !record(state.appearance.uiPalette)
        )
          throw Error("프로젝트 오브젝트 구조가 올바르지 않습니다.");
        if (
          typeof state.meta.projectName !== "string" ||
          typeof state.meta.appBuild !== "string" ||
          !Number.isInteger(state.layout.gridRows) ||
          !Number.isInteger(state.layout.gridCols) ||
          state.layout.gridRows < 1 ||
          state.layout.gridRows > 8 ||
          state.layout.gridCols < 1 ||
          state.layout.gridCols > 8 ||
          !(
            state.layout.layoutMapWidth === null ||
            Number.isFinite(state.layout.layoutMapWidth)
          ) ||
          typeof state.annotations.labels.enabled !== "boolean" ||
          typeof state.annotations.captions.enabled !== "boolean" ||
          typeof state.annotations.captions.slotMode !== "boolean" ||
          typeof state.annotations.captions.text !== "string" ||
          typeof state.annotations.captions.afterText !== "string" ||
          typeof state.annotations.captions.name !== "string" ||
          typeof state.annotations.captions.nameBold !== "boolean"
        )
          throw Error("프로젝트 메타데이터 또는 레이아웃이 올바르지 않습니다.");
        let style = state.layout.slotStyle;
        for (let [key, min, max] of [
          ["referenceWidth", 100, 20000],
          ["gap", 0, 2000],
          ["outerMargin", 0, 5000],
          ["radius", 0, 2000],
          ["aspect", 0.1, 10],
        ]) {
          if (!Number.isFinite(style[key]) || style[key] < min || style[key] > max)
            throw Error(`프로젝트 슬롯 스타일 ${key}가 올바르지 않습니다.`);
        }
        if (typeof style.showBorders !== "boolean")
          throw Error("프로젝트 슬롯 외곽선 설정이 올바르지 않습니다.");
        let labelSettings = state.annotations.labels.settings;
        if (
          !Number.isFinite(labelSettings.x) ||
          !Number.isFinite(labelSettings.y) ||
          !Number.isFinite(labelSettings.fontSize) ||
          labelSettings.fontSize < 6
        )
          throw Error("프로젝트 레이블 위치 또는 크기가 올바르지 않습니다.");
        for (let [key, fallback] of Object.entries(DEFAULT_UI_PALETTE))
          if (projectColor(state.appearance.uiPalette[key], null) === null)
            throw Error(`프로젝트 UI 색상 ${key}가 올바르지 않습니다.`);
        if (
          !Array.isArray(state.assets.csvFiles) ||
          !Array.isArray(state.assets.images) ||
          !record(state.fileSystem) ||
          !Array.isArray(state.fileSystem.directories) ||
          !Array.isArray(state.charts) ||
          !Array.isArray(state.slots) ||
          (requireSlots && state.slots.length === 0)
        )
          throw Error("프로젝트 자산, 차트 또는 슬롯 목록이 올바르지 않습니다.");
        let filePaths = new Set(),
          directoryPaths = new Set();
        state.fileSystem.directories.forEach((path) => {
          let normalized = normalizeProjectPath(path, { directory: true });
          if (normalized === "/" || normalized !== path || directoryPaths.has(path))
            throw Error("프로젝트 폴더 경로가 올바르지 않습니다.");
          directoryPaths.add(path);
        });
        for (let required of ["/assets", "/assets/csv", "/assets/images", "/assets/trash"])
          if (!directoryPaths.has(required)) throw Error(`프로젝트 기본 폴더 ${required}가 없습니다.`);
        let csvIds = new Set();
        state.assets.csvFiles.forEach((csv) => {
          let path;
          try {
            path = projectAssetPath(csv);
          } catch (_) {
            throw Error("프로젝트 CSV 오브젝트가 올바르지 않습니다.");
          }
          if (
            !record(csv) ||
            !Number.isInteger(csv.id) ||
            csv.id < 1 ||
            csvIds.has(csv.id) ||
            Object.prototype.hasOwnProperty.call(csv, "path") ||
            typeof csv.name !== "string" ||
            typeof csv.directory !== "string" ||
            !Array.isArray(csv.rows) ||
            typeof csv.bytesBase64 !== "string" ||
            !csv.bytesBase64 ||
            normalizeProjectPath(csv.directory, { directory: true }) !== csv.directory ||
            filePaths.has(path) ||
            !directoryPaths.has(csv.directory)
          )
            throw Error("프로젝트 CSV 오브젝트가 올바르지 않습니다.");
          csvIds.add(csv.id);
          filePaths.add(path);
        });
        let imageIds = new Set();
        state.assets.images.forEach((image) => {
          let path;
          try {
            path = projectAssetPath(image);
          } catch (_) {
            throw Error("프로젝트 이미지 오브젝트가 올바르지 않습니다.");
          }
          if (
            !record(image) ||
            !Number.isInteger(image.id) ||
            image.id < 1 ||
            imageIds.has(image.id) ||
            Object.prototype.hasOwnProperty.call(image, "path") ||
            typeof image.name !== "string" ||
            typeof image.directory !== "string" ||
            typeof image.bytesBase64 !== "string" ||
            !image.bytesBase64 ||
            !record(image.settings) ||
            normalizeProjectPath(image.directory, { directory: true }) !== image.directory ||
            filePaths.has(path) ||
            !directoryPaths.has(image.directory)
          )
            throw Error("프로젝트 이미지 오브젝트가 올바르지 않습니다.");
          imageIds.add(image.id);
          filePaths.add(path);
        });
        let chartIds = new Set();
        state.charts.forEach((chart, index) => {
          if (!Number.isInteger(chart?.id) || chart.id < 1 || chartIds.has(chart.id))
            throw Error("프로젝트 차트 ID가 올바르지 않습니다.");
          chartIds.add(chart.id);
          validateChartModel(
            chart,
            `프로젝트 차트 ${index + 1}`,
            state.assets.csvFiles,
          );
        });
        let slotIds = new Set();
        state.slots.forEach((slot) => {
          if (
            !record(slot) ||
            !Number.isInteger(slot.id) ||
            slotIds.has(slot.id) ||
            !Number.isInteger(slot.row) ||
            !Number.isInteger(slot.col) ||
            !Number.isInteger(slot.rowSpan) ||
            !Number.isInteger(slot.colSpan) ||
            slot.row < 1 ||
            slot.col < 1 ||
            slot.rowSpan < 1 ||
            slot.colSpan < 1 ||
            slot.row + slot.rowSpan - 1 > state.layout.gridRows ||
            slot.col + slot.colSpan - 1 > state.layout.gridCols ||
            !["graph", "image"].includes(slot.contentType) ||
            (slot.chart != null && slot.imageId != null) ||
            (slot.chart != null && !chartIds.has(slot.chart)) ||
            (slot.imageId != null && !imageIds.has(slot.imageId))
          )
            throw Error("프로젝트 슬롯 오브젝트가 올바르지 않습니다.");
          slotIds.add(slot.id);
        });
        let maximums = {
          csv: Math.max(0, ...csvIds),
          image: Math.max(0, ...imageIds),
          chart: Math.max(0, ...chartIds),
        };
        for (let key of ["csv", "image", "chart"])
          if (
            !Number.isInteger(state.nextId[key]) ||
            state.nextId[key] <= maximums[key]
          )
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
                      new TextEncoder().encode(ffpxCsv(source.rows)),
                    ),
              mime: typeof source.mime === "string" ? source.mime : "text/csv",
              headerLines: headerLineCount(source.headerLines ?? 1, source.rows),
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
          let image = {
            id: source.id,
            name: projectCsvName(source.name, "image.bin"),
            directory: typeof source.directory === "string" ? source.directory : null,
            mime:
              typeof source.mime === "string" && source.mime
                ? source.mime
                : "application/octet-stream",
            bytesBase64: source.bytesBase64,
            settings:
              source.settings && typeof source.settings === "object"
                ? projectClone(source.settings)
                : {},
          };
          normalizeImageSettings(image);
          nextImages.push(image);
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
      function buildProjectObject(payload, fileName) {
        if (
          payload?.schema !== "fast-figure-project" ||
          payload.version !== PACKAGE_FORMAT_VERSION
        )
          throw Error("지원하지 않는 FFPX 프로젝트 형식입니다.");
        let candidate = new ProjectObject();
        candidate.projectName =
          typeof payload.projectName === "string" ? payload.projectName.trim().slice(0, 120) : "";
        if (!candidate.projectName)
          candidate.projectName = String(fileName || "")
            .replace(/\.[^.]+$/, "")
            .trim()
            .slice(0, 120);
        let importedRows = Number(payload.gridRows),
          importedCols = Number(payload.gridCols);
        if (
          !Number.isInteger(importedRows) ||
          !Number.isInteger(importedCols) ||
          importedRows < 1 ||
          importedRows > 8 ||
          importedCols < 1 ||
          importedCols > 8
        )
          throw Error("프로젝트의 행 또는 열 값이 올바르지 않습니다.");
        if (!Array.isArray(payload.charts) || !Array.isArray(payload.slots))
          throw Error("프로젝트의 charts 또는 slots 배열이 없습니다.");
        let nextCharts = projectClone(payload.charts),
          csvState = importedProjectCsvState(payload),
          imageState = importedProjectImageState(payload),
          chartIds = new Set();
        let defaultCsv = defaultCsvModel(csvState.csvId++);
        csvState.csvFiles = [
          ...reuseImportedDefaultCsv(csvState.csvFiles, nextCharts, defaultCsv),
          defaultCsv,
        ];
        nextCharts.forEach((chart, index) => {
          validateChartModel(chart, `프로젝트 차트 ${index + 1}`, csvState.csvFiles);
          if (!Number.isInteger(chart.id) || chartIds.has(chart.id))
            throw Error("프로젝트 차트 ID가 올바르지 않습니다.");
          chartIds.add(chart.id);
          normalizeGlobalSettings(chart, true);
        });
        let slotIds = new Set(),
          nextSlots = projectClone(payload.slots).map((slot) => {
            if (
              !slot ||
              typeof slot !== "object" ||
              !Number.isInteger(slot.id) ||
              slotIds.has(slot.id)
            )
              throw Error("프로젝트 슬롯 데이터가 올바르지 않습니다.");
            slotIds.add(slot.id);
            let slotState = { ...slot };
            delete slotState.offsetX;
            delete slotState.offsetY;
            let row = Number(slot.row),
              col = Number(slot.col),
              rowSpan = Number(slot.rowSpan ?? 1),
              colSpan = Number(slot.colSpan ?? 1);
            if (
              !Number.isInteger(row) ||
              !Number.isInteger(col) ||
              !Number.isInteger(rowSpan) ||
              !Number.isInteger(colSpan) ||
              row < 1 ||
              col < 1 ||
              rowSpan < 1 ||
              colSpan < 1 ||
              row + rowSpan - 1 > importedRows ||
              col + colSpan - 1 > importedCols
            )
              throw Error("프로젝트 슬롯 위치가 올바르지 않습니다.");
            let linkedImageId = getProjectImage(slot.imageId, imageState.images)?.id ?? null;
            if (slot.imageId != null && linkedImageId === null)
              throw Error("프로젝트 슬롯이 존재하지 않는 이미지를 참조합니다.");
            let chart = chartIds.has(slot.chart) ? slot.chart : null;
            if (slot.chart != null && chart === null)
              throw Error("프로젝트 슬롯이 존재하지 않는 차트를 참조합니다.");
            return {
              ...slotState,
              row,
              col,
              rowSpan,
              colSpan,
              hidden: slot.hidden === true,
              chart,
              imageId: linkedImageId,
              contentType: slot.contentType === "image" ? "image" : "graph",
              caption: typeof slot.caption === "string" ? slot.caption : null,
            };
          });
        if (!nextSlots.length) throw Error("프로젝트 슬롯이 없습니다.");
        candidate.gridRows = importedRows;
        candidate.gridCols = importedCols;
        candidate.csvFiles = csvState.csvFiles;
        candidate.csvId = Math.max(
          Number.isInteger(payload.csvId) ? payload.csvId : 1,
          csvState.csvId,
        );
        candidate.images = imageState.images;
        candidate.fileSystem = {
          directories: Array.isArray(payload.fileSystem?.directories)
            ? projectClone(payload.fileSystem.directories)
            : [],
        };
        projectVfs.ensure(candidate._state);
        candidate.imageId = Math.max(
          Number.isInteger(payload.imageId) ? payload.imageId : 1,
          imageState.imageId,
        );
        candidate.charts = nextCharts;
        candidate.slots = nextSlots;
        candidate.chartId = Math.max(
          Number.isInteger(payload.chartId) ? payload.chartId : 1,
          ...nextCharts.map((chart) => chart.id + 1),
        );
        let annotations =
            payload.annotations && typeof payload.annotations === "object"
              ? payload.annotations
              : {},
          importedLabels =
            annotations.labelSettings && typeof annotations.labelSettings === "object"
              ? annotations.labelSettings
              : {},
          importedCaption =
            annotations.captionSettings && typeof annotations.captionSettings === "object"
              ? annotations.captionSettings
              : {};
        candidate.labelsEnabled = annotations.labelsEnabled === true;
        candidate.labelSettings = {
          ...candidate.labelSettings,
          ...importedLabels,
          parentheses: importedLabels.parentheses === true,
          x: readFiniteProjectNumber(importedLabels.x, candidate.labelSettings.x),
          y: readFiniteProjectNumber(importedLabels.y, candidate.labelSettings.y),
          fontSize: Math.max(
            6,
            readFiniteProjectNumber(importedLabels.fontSize, candidate.labelSettings.fontSize),
          ),
        };
        candidate.captionsEnabled = annotations.captionsEnabled === true;
        candidate.slotCaptionsEnabled = annotations.slotCaptionsEnabled === true;
        if (candidate.slotCaptionsEnabled) {
          normalizeLegacySlotCaptionDefaults(candidate);
          initializeSlotCaptions(candidate);
        }
        candidate.captionText = typeof annotations.captionText === "string" ? annotations.captionText : "";
        candidate.captionAfterText =
          typeof annotations.captionAfterText === "string" ? annotations.captionAfterText : "";
        candidate.captionName = typeof annotations.captionName === "string" ? annotations.captionName : "";
        candidate.captionNameBold = annotations.captionNameBold === true;
        candidate.captionSettings = {
          ...candidate.captionSettings,
          ...importedCaption,
          fontSize: readProjectNumber(importedCaption.fontSize, candidate.captionSettings.fontSize, 6, 96),
          lineHeight: readProjectNumber(
            importedCaption.lineHeight,
            candidate.captionSettings.lineHeight,
            0.8,
            4,
          ),
        };
        let style =
            payload.slotStyle && typeof payload.slotStyle === "object" ? payload.slotStyle : {},
          palette =
            payload.uiPalette && typeof payload.uiPalette === "object" ? payload.uiPalette : {};
        candidate.layout.slotStyle = {
          referenceWidth: readProjectNumber(style.referenceWidth, 1200, 100, 20000),
          gap: readProjectNumber(style.gap, 0, 0, 2000),
          outerMargin: readProjectNumber(style.outerMargin, 120, 0, 5000),
          radius: readProjectNumber(style.radius, 0, 0, 2000),
          aspect: readProjectNumber(style.aspect, 1.618, 0.1, 10),
          showBorders: style.showBorders !== false,
        };
        candidate.layoutMapWidth = Number.isFinite(Number(style.layoutMapWidth))
          ? Number(style.layoutMapWidth)
          : null;
        candidate.appearance.uiPalette = Object.fromEntries(
          Object.entries(DEFAULT_UI_PALETTE).map(([key, fallback]) => [
            key,
            projectColor(palette[key], fallback),
          ]),
        );
        validateProjectObject(candidate, { requireSlots: true });
        return candidate;
      }
      function syncProjectControlsFromObject(project = activeProject) {
        let style = project.layout.slotStyle,
          palette = project.appearance.uiPalette;
        $("projectName").value = project.projectName;
        $("gridRows").value = project.gridRows;
        $("gridCols").value = project.gridCols;
        $("dashboardReferenceWidth").value = style.referenceWidth;
        $("slotGap").value = style.gap;
        $("dashboardOuterMargin").value = style.outerMargin;
        $("slotRadius").value = style.radius;
        $("dashboardAspect").value = style.aspect;
        syncSettingToggle("showSlotBorders", style.showBorders);
        Object.entries(palette).forEach(([key, value]) => {
          let control = $(key);
          if (control) control.value = value;
        });
        syncLabelControlsFromObject(project.annotations.labels);
        syncCaptionControlsFromObject(project.annotations.captions);
      }
      function captureProjectRuntimeState() {
        return {
          rows,
          columns,
          editing,
          selectedSlotId,
          selectedObjectIndex,
          activeDataName,
          activeDataReady,
          activeCsvId,
          activeImageId,
          activeAssetKind,
          layoutSelected: new Set(layoutSelected),
        };
      }
      function restoreProjectRuntimeState(snapshot) {
        rows = snapshot.rows;
        columns = snapshot.columns;
        editing = snapshot.editing;
        selectedSlotId = snapshot.selectedSlotId;
        selectedObjectIndex = snapshot.selectedObjectIndex;
        activeDataName = snapshot.activeDataName;
        activeDataReady = snapshot.activeDataReady;
        activeCsvId = snapshot.activeCsvId;
        activeImageId = snapshot.activeImageId;
        activeAssetKind = snapshot.activeAssetKind;
        layoutSelected = new Set(snapshot.layoutSelected);
      }
      function resetProjectRuntimeState() {
        rows = [];
        columns = [];
        editing = null;
        selectedSlotId = null;
        selectedObjectIndex = null;
        activeDataName = "";
        activeDataReady = false;
        activeCsvId = null;
        activeImageId = null;
        activeAssetKind = null;
        layoutSelected.clear();
        $("file").value = "";
        $("buildBox").classList.add("hidden");
        $("imageBox").classList.add("hidden");
      }
      function renderProjectObject(project = activeProject) {
        syncProjectControlsFromObject(project);
        setFileName();
        clearPreview();
        applySlotStyle(false, false);
        applyUiPalette(false, false);
        renderLabelPreview();
        applyCaptionSettings(false, false);
        syncDashboardCaption();
        renderLayout();
        updateFileAvailability();
        refreshCsvControls();
        refreshImageControls();
      }
      function applyProjectLoadedAction({ machine, payload }) {
        for (let scope of [
          "project",
          "layout",
          "labels",
          "captions",
          "data",
          "images",
          "files",
          "charts",
          "slots",
          "workspace",
          "editor",
          "ui",
        ])
          machine.assertWritable(scope, "PROJECT_LOADED");
        let candidate = validateProjectObject(payload.project, {
            requireSlots: true,
          }),
          previousState = activeProject._state,
          previousImages = activeProject.images,
          candidateImages = candidate.images,
          previousRuntime = captureProjectRuntimeState();
        try {
          activeProject.initialize(candidate);
          projectObjectGeneration += 1;
          resetProjectRuntimeState();
          renderProjectObject(activeProject);
        } catch (error) {
          releaseProjectImageDisplayUrls(candidateImages);
          activeProject.initialize(previousState);
          projectObjectGeneration += 1;
          restoreProjectRuntimeState(previousRuntime);
          try {
            renderProjectObject(activeProject);
          } catch (rollbackError) {
            debugLog(
              "project:rollback-render-error",
              { message: rollbackError.message },
              "error",
            );
          }
          throw error;
        }
        releaseProjectImageDisplayUrls(previousImages);
        machine.state = Object.freeze({
          ...machine.state,
          revision: machine.state.revision + 1,
        });
        payload.project = activeProject;
        payload.generation = projectObjectGeneration;
      }
      function importProject(payload, fileName) {
        let candidate = ProjectObject.fromFFPX(payload, fileName);
        appFSM.send("PROJECT_LOADED", {
          project: candidate,
          fileName,
          direction: "model-to-fsm",
        });
        appFSM.send("CLOSE_OVERLAY", { reason: "project-loaded" });
        status(`${fileName} 프로젝트를 불러왔습니다.`);
        debugLog("project:import", {
          name: fileName,
          charts: activeProject.charts.length,
          slots: activeProject.slots.length,
          gridRows: activeProject.gridRows,
          gridCols: activeProject.gridCols,
          generation: projectObjectGeneration,
        });
        return activeProject;
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
              entry.name.includes("..") ||
              entry.name.startsWith("/")
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
            name.includes("..") ||
            name.startsWith("/") ||
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
      function ffpxCsv(rows) {
        let quote = (value) => '"' + String(value ?? "").replace(/"/g, '""') + '"';
        return (rows || [])
          .map((row) => (Array.isArray(row) ? row : []).map(quote).join(","))
          .join("\r\n");
      }
      function parseProjectCsvAsset(name, bytes) {
        let text = new TextDecoder().decode(bytes);
        if (String(name).toLowerCase().endsWith(".json")) {
          let data = JSON.parse(text);
          if (!Array.isArray(data) && Array.isArray(data?.data)) data = data.data;
          return dataTable(data);
        }
        return parseCSV(text);
      }
      function projectCsvDataRef(csv) {
        return `data/${csv.id}/${projectCsvName(csv.name)}`;
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
          return `<value type="array">${value
            .map((item) => `<item>${ffpxXmlValue(item)}</item>`)
            .join("")}</value>`;
        if (typeof value === "object")
          return `<value type="object">${Object.entries(value)
            .map(
              ([name, item]) =>
                `<property name="${ffpxXmlEscape(name)}">${ffpxXmlValue(item)}</property>`,
            )
            .join("")}</value>`;
        return `<value type="${typeof value}">${ffpxXmlEscape(value)}</value>`;
      }
      function ffpxXmlReadValue(element) {
        if (!element || element.tagName !== "value")
          throw Error("FFPX XML 값 형식이 올바르지 않습니다.");
        let type = element.getAttribute("type");
        if (type === "null") return null;
        if (type === "array")
          return [...element.children]
            .filter((child) => child.tagName === "item")
            .map((item) => ffpxXmlReadValue(item.firstElementChild));
        if (type === "object") {
          let result = {};
          for (let property of element.children) {
            if (property.tagName !== "property") continue;
            result[property.getAttribute("name") || ""] = ffpxXmlReadValue(
              property.firstElementChild,
            );
          }
          return result;
        }
        if (type === "boolean") return element.textContent === "true";
        if (type === "number") {
          let number = Number(element.textContent);
          if (!Number.isFinite(number)) throw Error("FFPX XML 숫자 값이 올바르지 않습니다.");
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
      function ffpxNamedValue(root, name) {
        let node = [...root.children].find((child) => child.tagName === name);
        if (!node?.firstElementChild)
          throw Error(`FFPX ${name} 값이 없습니다.`);
        return ffpxXmlReadValue(node.firstElementChild);
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
      function ffpxBuildProject() {
        validateProjectObject(activeProject, { requireSlots: true });
        let projectObject = projectObjects.read("project"),
          layoutObject = projectObjects.read("layout"),
          labelObject = projectObjects.read("labels"),
          captionObject = projectObjects.read("captions"),
          dataObjects = projectObjects.read("data").filter((csv) => !projectVfs.isTrashed(projectAssetPath(csv))),
          imageObjects = projectObjects.read("images").filter((image) => !projectVfs.isTrashed(projectAssetPath(image))),
          chartObjects = projectObjects.read("charts"),
          slotObjects = projectObjects.read("slots"),
          appearanceObject = projectObjects.read("appearance"),
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
              slotCaptionsEnabled: captionObject.slotMode,
              captionText: captionObject.text,
              captionAfterText: captionObject.afterText,
              captionName: captionObject.name,
              captionNameBold: captionObject.nameBold,
              captionSettings: projectClone(captionObject.settings),
            },
            slotStyle: {
              ...projectClone(layoutObject.slotStyle),
              layoutMapWidth: layoutObject.layoutMapWidth,
            },
            uiPalette: projectClone(appearanceObject.uiPalette),
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
            let csv = getProjectCsv(id);
            if (!csv || projectVfs.isTrashed(projectAssetPath(csv)))
              throw Error(`FFPX 차트가 내보낼 수 없는 CSV ${id}를 참조합니다.`);
          });
          manifest.charts.push(chartExportCopy(chart));
        }
        for (let slot of slotObjects) {
          let copy = projectClone(slot);
          if (copy.imageId != null) {
            let image = getProjectImage(copy.imageId);
            if (!image || projectVfs.isTrashed(projectAssetPath(image)))
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
              directories: projectObjects
                .read("files")
                .directories.filter((path) => !projectVfs.isTrashed(path)),
            },
            appearance: {
              slotStyle: manifest.slotStyle,
              uiPalette: manifest.uiPalette,
            },
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
            slotMode: manifest.annotations.slotCaptionsEnabled,
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
              imageObject: image
                ? {
                    imageRef: image.id,
                    settings: projectClone(image.settings || {}),
                  }
                : null,
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
                      ? `<imageObject imageRef="${document.imageObject.imageRef}">${ffpxXmlValue(
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
        let assets = ffpxZipRead(new Uint8Array(await file.arrayBuffer())),
          xmlBytes = assets.get("project.xml");
        if (!xmlBytes) throw Error("FFPX project.xml이 없습니다.");
        let projectRoot = ffpxReadXmlDocument(
              assets,
              "project.xml",
              "fastFigureProject",
            ),
            project = ffpxNamedValue(projectRoot, "settings"),
            assetRoot = ffpxReadXmlDocument(
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
            csvFiles = [...assetRoot.querySelectorAll("dataAsset")].map((node) =>
              ffpxXmlReadValue(node.firstElementChild),
            ),
            images = [...assetRoot.querySelectorAll("imageAsset")].map((node) =>
              ffpxXmlReadValue(node.firstElementChild),
            ),
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
              slotNode = slotRoot.querySelector(":scope > slot"),
              slotSettings = ffpxXmlReadValue(
                slotNode.querySelector(":scope > settings > value"),
              ),
              slotCaption = ffpxXmlReadValue(
                slotNode.querySelector(":scope > caption > value"),
              ),
              graphNode = slotNode.querySelector(":scope > graph"),
              imageNode = slotNode.querySelector(":scope > imageObject"),
              chart = graphNode
                ? ffpxXmlReadValue(
                    graphNode.querySelector(":scope > settings > value"),
                  )
                : null;
            if (chart) {
              chart.editor.objects = [
                ...graphNode.querySelectorAll(":scope > graphObjects > graphObject"),
              ].map((node) => ffpxXmlReadValue(node.firstElementChild));
              charts.push(chart);
            }
            let imageObject = imageNode
              ? ffpxXmlReadValue(imageNode.firstElementChild)
              : null;
            if (imageObject?.imageRef != null) {
              let image = images.find((item) => item.id === imageObject.imageRef);
              if (image) image.settings = projectClone(imageObject.settings || {});
            }
            slots.push({
              ...slotSettings,
              ...placement,
              id: placement.slotId,
              chart: chart?.id ?? null,
              imageId: imageObject?.imageRef ?? null,
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
              slotCaptionsEnabled: caption.slotMode,
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
      function setProjectNameFromValue(value, commit = false) {
        let name = String(value ?? "").slice(0, 120);
        if (commit) name = name.trim().slice(0, 120);
        activeProject.projectName = name;
        if (commit) debugLog("project:name", { projectName: name });
        return name;
      }
      function downloadProjectFromValue(projectName = activeProject.projectName) {
        if (getSelectedSlot())
          return status("프로젝트 내보내기는 슬롯 선택을 해제한 뒤 사용할 수 있습니다.");
        try {
          activeProject.projectName = setProjectNameFromValue(projectName, true);
          let project = ffpxBuildProject(),
            blob = new Blob([ffpxZipStore(project.assets)], {
              type: "application/vnd.fast-figure-project",
            }),
            link = document.createElement("a"),
            stamp = new Date().toISOString().replace(/[:.]/g, "-");
          link.href = URL.createObjectURL(blob);
          link.download = `${projectFileStem(activeProject.projectName)}-${stamp}.ffpx`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 0);
          status(`${activeProject.projectName || "프로젝트"}를 FFPX 파일로 내보냈습니다.`);
          debugLog("project:export-ffpx", {
            projectName: activeProject.projectName,
            charts: activeProject.charts.length,
            slots: activeProject.slots.length,
            assets: project.assets.length,
          });
        } catch (error) {
          status("FFPX 내보내기 오류: " + error.message);
          debugLog("project:export-error", { message: error.message });
        }
      }
      function downloadProject() {
        let result = downloadProjectFromValue($("projectName").value);
        $("projectName").value = activeProject.projectName;
        return result;
      }
      $("projectName").addEventListener("input", (event) => {
        fastFigureUiBridge.setProjectName(event.target.value);
      });
      $("projectName").addEventListener("change", (event) => {
        event.target.value = fastFigureUiBridge.setProjectName(event.target.value, true);
      });
      $("exportProject").onclick = downloadProject;
      $("importProject").onclick = () => {
        if (getSelectedSlot())
          return status("프로젝트 불러오기는 슬롯 선택을 해제한 뒤 사용할 수 있습니다.");
        $("importProjectFile").click();
      };
      async function loadProjectFile(file) {
        if (!file) return false;
        if (getSelectedSlot()) {
          status("프로젝트 불러오기는 슬롯 선택을 해제한 뒤 사용할 수 있습니다.");
          return false;
        }
        try {
          let header = new Uint8Array(await file.slice(0, 4).arrayBuffer()),
            payload;
          if (header.length === 4 && header[0] === 0x50 && header[1] === 0x4b)
            payload = await ffpxReadProject(file);
          else payload = JSON.parse(await file.text());
          importProject(payload, file.name);
          return true;
        } catch (error) {
          status("프로젝트 불러오기 오류: " + error.message);
          debugLog("project:import-error", { message: error.message });
          return false;
        }
      }
      $("importProjectFile").onchange = async (event) => {
        let file = event.target.files[0];
        if (!file) return;
        await loadProjectFile(file);
        event.target.value = "";
      };
      $("filePick").onclick = () => {
        $("file").click();
      };
      function downloadProjectAsset(path = appFSM.state.assetPath) {
        let selected = path ? projectVfs.resolve(path) : null,
          asset = ["csv", "image"].includes(selected?.kind) ? selected.asset : null;
        if (!asset?.bytesBase64) {
          status("다운로드할 CSV 또는 이미지 에셋을 선택하세요.");
          return false;
        }
        let url = URL.createObjectURL(
            new Blob([ffpxBase64ToBytes(asset.bytesBase64)], {
              type: asset.mime || "application/octet-stream",
            }),
          ),
          link = document.createElement("a");
        link.href = url;
        link.download = asset.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
        status(`${asset.name} 원본 에셋을 다운로드했습니다.`);
        return true;
      }
      $("assetDownload").onclick = () => downloadProjectAsset();
      $("assetActions").onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if ($("assetActions").disabled) return;
        let menu = $("assetActionMenu"),
          open = menu.hidden;
        closeAssetTreeActionMenus();
        if (!open) return;
        syncAssetTreeActionMenu();
        menu.hidden = false;
        $("assetActions").setAttribute("aria-expanded", "true");
        menu.querySelector("button:not(:disabled)")?.focus();
      };
      function selectDirectoryFromTree(path) {
        let match = projectVfs.resolve(path);
        if (match?.kind !== "directory") return status("프로젝트 폴더를 선택할 수 없습니다.");
        selectedExplorerDirectory = match.path;
        appFSM.send("SELECT_ASSET", {
          kind: "directory",
          path: match.path,
          direction: "ui-to-fsm",
        });
        status(`${match.path} 폴더를 선택했습니다.`);
      }
      function selectCsvAsset(path) {
        let slot = getSelectedSlot(),
          match = projectVfs.resolve(path),
          csv = match?.kind === "csv" ? match.asset : null;
        if (!csv) {
          status("프로젝트 CSV를 선택할 수 없습니다.");
          return null;
        }
        appFSM.send("CLEAR_GRAPH_OBJECT", {
          index: null,
          direction: "ui-to-fsm",
        });
        appFSM.send("SELECT_ASSET", {
          kind: "csv",
          path: projectAssetPath(csv),
          direction: "ui-to-fsm",
        });
        activeDataName = csv.name;
        activeCsvId = csv.id;
        rows = dataTable(csv.rows);
        columns = columnDefinitions(rows, csv.headerLines);
        refreshCsvControls(csv.id);
        activeDataReady = true;
        if (!slot) status(`${csv.name}을 선택했습니다.`);
        else if (slot.contentType === "image")
          status(`${csv.name}을 선택했습니다. 그래프 슬롯에서만 새 그래프를 추가할 수 있습니다.`);
        else status(`${csv.name}을 선택했습니다. 기존 그래프 데이터는 변경하지 않았습니다.`);
        publishFastFigureUiStore(appFSM.state, "asset:csv-selected");
        return { slot, csv };
      }
      function syncLegacyCsvAssetSelection(selection) {
        let { slot, csv } = selection;
        $("headerLines").value = csv.headerLines;
        loadData(csv.rows, csv.name, { showGraphControls: !!slot });
        setFileName(csv.name);
        updateFileAvailability();
        renderProjectDataTree(projectDataTreeObjects());
        if (slot && slot.contentType !== "image")
          renderGraphObjects(ensureGraphObjects(editing));
      }
      function selectCsvFromTree(path) {
        let selection = selectCsvAsset(path);
        if (selection) syncLegacyCsvAssetSelection(selection);
        return selection;
      }
      function deleteProjectCsv(csvIdToDelete = activeCsvId) {
        let id = csvIdToDelete,
          csv = getProjectCsv(id),
          references = activeProject.charts.flatMap((chart) =>
            (chart.editor?.objects || [])
              .map((object, index) => ({ chart, object, index }))
              .filter(({ object }) => object.csvId === id),
          );
        if (!csv) return;
        if (csv.isDefaultEmpty === true)
          return status("프로젝트 기본 빈 CSV는 삭제할 수 없습니다.");
        if (
          references.length &&
          !window.confirm(
            `${csv.name}을 ${references.length}개 그래프 오브젝트가 참조 중입니다. 참조 중인 그래프 오브젝트와 CSV를 함께 삭제할까요?`,
          )
        )
          return;
        if (references.length) {
          activeProject.charts.forEach((chart) => {
            if (!Array.isArray(chart.editor?.objects)) return;
            let objects = chart.editor.objects.filter((object) => object.csvId !== id);
            if (objects.length === chart.editor.objects.length) return;
            appFSM.send("GRAPH_OBJECTS_REPLACED", {
              chartId: chart.id,
              objects,
              direction: "fsm-to-model",
            });
          });
          selectedObjectIndex = null;
        }
        appFSM.send("DATA_OBJECT_DELETED", {
          csvId: id,
          direction: "fsm-to-model",
        });
        appFSM.send("CLEAR_ASSET_SELECTION", {
          direction: "fsm-to-model",
        });
        renderDashboard();
        status(
          references.length
            ? `${csv.name}과 이를 참조하던 그래프 오브젝트 ${references.length}개를 삭제했습니다.`
            : `${csv.name}을 프로젝트에서 삭제했습니다.`,
        );
      }
      function selectImageAsset(path) {
        let slot = getSelectedSlot(),
          match = projectVfs.resolve(path),
          image = match?.kind === "image" ? match.asset : null;
        if (!image) {
          status("프로젝트 이미지를 먼저 선택하세요.");
          return null;
        }
        appFSM.send("CLEAR_GRAPH_OBJECT", {
          index: null,
          direction: "ui-to-fsm",
        });
        appFSM.send("SELECT_ASSET", {
          kind: "image",
          path: projectAssetPath(image),
          direction: "ui-to-fsm",
        });
        if (!slot) status(`${image.name}을 선택했습니다.`);
        else if (slot.contentType !== "image")
          status("이미지를 연결하려면 이미지 슬롯을 선택하세요.");
        else {
          appFSM.send("SLOT_IMAGE_LINKED", {
            slotId: slot.id,
            imageId: image.id,
            direction: "fsm-to-model",
          });
          renderDashboard();
          status(`${image.name}을 선택 슬롯에 연결했습니다.`);
        }
        publishFastFigureUiStore(appFSM.state, "asset:image-selected");
        return { slot, image };
      }
      function syncLegacyImageAssetSelection(selection) {
        setFileName(selection.image.name);
        updateFileAvailability();
        renderProjectDataTree(projectDataTreeObjects());
      }
      function selectImageFromTree(path) {
        let selection = selectImageAsset(path);
        if (selection) syncLegacyImageAssetSelection(selection);
        return selection;
      }
      function deleteProjectImage(imageIdToDelete = activeImageId) {
        let id = Number(imageIdToDelete),
          image = getProjectImage(id),
          references = activeProject.slots.filter((slot) => slot.imageId === id);
        if (!image) return;
        if (
          references.length &&
          !window.confirm(
            `${image.name}을 ${references.length}개 이미지 슬롯이 참조 중입니다. 참조 슬롯을 초기화하고 이미지를 삭제할까요?`,
          )
        )
          return;
        if (references.length)
          appFSM.send("SLOTS_RESET", {
            slotIds: references.map((slot) => slot.id),
            direction: "fsm-to-model",
          });
        appFSM.send("IMAGE_OBJECT_DELETED", {
          imageId: id,
          direction: "fsm-to-model",
        });
        appFSM.send("CLEAR_ASSET_SELECTION", {
          direction: "fsm-to-model",
        });
        renderDashboard();
        status(
          references.length
            ? `${image.name}을 삭제하고 참조 슬롯 ${references.length}개를 초기화했습니다.`
            : `${image.name}을 프로젝트에서 삭제했습니다.`,
        );
      }
      function deleteSelectedAsset() {
        let selected = appFSM.state.assetPath
          ? projectVfs.resolve(appFSM.state.assetPath)
          : null;
        if (selected?.kind === "csv") deleteProjectCsv(selected.asset.id);
        else if (selected?.kind === "image") deleteProjectImage(selected.asset.id);
      }
      $("deleteSelectedAsset").onclick = deleteSelectedAsset;
      function createAssetDirectory(parent = selectedExplorerDirectory) {
        parent =
          parent === "/assets" || parent.startsWith("/assets/") ? parent : "/assets";
        let name = window.prompt(`새 폴더 이름\n위치: ${parent}`, "New Folder");
        if (name === null) return;
        let payload = {
          parent,
          name,
          direction: "ui-to-fsm",
        };
        try {
          appFSM.send("PROJECT_DIRECTORY_CREATED", payload);
          selectedExplorerDirectory = payload.path;
          appFSM.send("SELECT_ASSET", {
            kind: "directory",
            path: payload.path,
            direction: "ui-to-fsm",
          });
          status(`${payload.path} 폴더를 만들었습니다.`);
        } catch (error) {
          status(`폴더 생성 오류: ${error.message}`);
        }
      }
      $("newAssetFolder").onclick = () => createAssetDirectory();
      $("assetTree").addEventListener("click", (event) => {
        if (event.target.closest(".asset-tree-button")) return;
        let summary = event.target.closest("summary[data-path]");
        if (summary) {
          let path = summary.dataset.path;
          if (path === "/assets" || path.startsWith("/assets/")) {
            selectedExplorerDirectory = path;
            setTimeout(() => selectDirectoryFromTree(path), 0);
            return;
          }
        }
        setTimeout(() =>
          appFSM.send("CLEAR_ASSET_SELECTION", {
            direction: "ui-to-fsm",
          }),
          0,
        );
      });
      document.addEventListener("click", (event) => {
        if (appFSM.state.assetSelection === "none") return;
        if (
          event.target.closest(
            ".asset-tree-button, .asset-tree-directory, #assetActions, #assetActionMenu, #csvSelectionPanel, #imageSelectionPanel, #deleteSelectedAsset",
          )
        )
          return;
        appFSM.send("CLEAR_ASSET_SELECTION", {
          direction: "ui-to-fsm",
        });
      });
      function insertEmptySlotImage() {
        let slot = getSelectedSlot();
        if (!slot || slot.contentType !== "image")
          return (status("빈 이미지를 삽입할 이미지 슬롯을 먼저 선택하세요."), false);
        let svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"></svg>',
          image = buildProjectImageModel(
            new TextEncoder().encode(svg),
            "빈 이미지.svg",
            "image/svg+xml",
            activeProject.imageId,
          );
        appFSM.send("SLOT_IMAGE_IMPORTED", {
          slotId: slot.id,
          model: image,
          direction: "fsm-to-model",
        });
        setFileName(image.name);
        updateFileAvailability();
        renderDashboard();
        status("선택 슬롯에 빈 이미지를 삽입했습니다.");
        return true;
      }
      $("insertEmptyImage").onclick = insertEmptySlotImage;
      function setSlotContentType(type) {
        let slot = getSelectedSlot();
        if (!slot) {
          appFSM.send("SLOT_TYPE_CHANGED", {
            slotId: null,
            type,
            direction: "fsm-to-model",
          });
          debugLog("slot:content-type-pending", { type, direction: "fsm-to-model" });
          return;
        }
        appFSM.send("SLOT_TYPE_CHANGED", {
          slotId: slot.id,
          type,
          direction: "fsm-to-model",
        });
        renderDashboard();
        debugLog("slot:content-type", {
          slotId: slot.id,
          type,
          direction: "fsm-to-model",
        });
      }
      $("slotTypeGraph").onclick = () => setSlotContentType("graph");
      $("slotTypeImage").onclick = () => setSlotContentType("image");
      function syncSlotImageElement(slot, image) {
        let element = slot && document.querySelector(`.slot[data-slot="${slot.id}"] .slot-image`);
        if (!element || !image) return false;
        let settings = normalizeImageSettings(image);
        element.classList.toggle("manual", settings.fit === "manual");
        element.removeAttribute("style");
        if (settings.fit === "manual") {
          element.style.width = `${settings.scale}%`;
          element.style.left = `${settings.x}%`;
          element.style.top = `${settings.y}%`;
        } else element.style.objectFit = settings.fit;
        return true;
      }
      function applyImageSettingsFromValues(values) {
        let slot = getSelectedSlot(),
          image = slotImage(slot);
        if (!image || !values || typeof values !== "object") return false;
        let settings = normalizeImageSettings(image);
        settings.fit = ["contain", "cover", "manual"].includes(values.fit)
          ? values.fit
          : settings.fit;
        if (settings.fit === "manual") {
          settings.scale = Math.max(1, Math.min(1000, Number(values.scale) || 100));
          settings.x = Math.max(-100, Math.min(200, Number(values.x) || 0));
          settings.y = Math.max(-100, Math.min(200, Number(values.y) || 0));
        }
        syncSlotImageElement(slot, image);
        debugLog("slot:image-settings", { slotId: selectedSlotId, settings });
        appFSM.notify("images", "IMAGE_SETTINGS_CHANGED");
        return true;
      }
      function applyImageSettings() {
        let changed = applyImageSettingsFromValues({
          fit: $("imageFitMode").value,
          scale: $("imageScale").value,
          x: $("imagePositionX").value,
          y: $("imagePositionY").value,
        });
        if (changed) syncImageSettingsUi();
        return changed;
      }
      $("imageFitMode").onchange = applyImageSettings;
      ["imageScale", "imagePositionX", "imagePositionY"].forEach((id) => {
        let control = $(id);
        control.addEventListener("change", applyImageSettings);
        control.addEventListener("keydown", (event) => {
          if (event.key === "Enter") event.target.blur();
        });
      });
      async function loadImageFile(
        file,
        slot,
        { assetPath = null, replaceAssetId = null } = {},
      ) {
        try {
          let bytes = new Uint8Array(await file.arrayBuffer()),
            plan = assetPath
              ? { path: normalizeProjectPath(assetPath), replaceId: replaceAssetId }
              : planProjectAssetImport(file, PROJECT_ASSET_DIRECTORIES.image),
            image;
          if (Number.isInteger(plan.replaceId)) {
            image = buildProjectImageModel(
              bytes,
              file.name,
              file.type,
              plan.replaceId,
            );
            projectVfs.assignLocation(image, plan.path);
            appFSM.send("IMAGE_OBJECT_REPLACED", {
              model: image,
              direction: "fsm-to-model",
            });
            if (slot)
              appFSM.send("SLOT_IMAGE_LINKED", {
                slotId: slot.id,
                imageId: image.id,
                direction: "fsm-to-model",
              });
          } else if (slot) {
            image = buildProjectImageModel(bytes, file.name, file.type, activeProject.imageId);
            projectVfs.assignLocation(image, plan.path);
            appFSM.send("SLOT_IMAGE_IMPORTED", {
              slotId: slot.id,
              model: image,
              direction: "fsm-to-model",
            });
          } else image = createProjectImage(bytes, file.name, file.type, null, null, plan.path);
          setFileName(file.name);
          refreshImageControls(image.id);
          updateFileAvailability();
          renderDashboard();
          status(
            slot
              ? `${file.name} 이미지를 선택 슬롯에 연결했습니다.`
              : Number.isInteger(plan.replaceId)
                ? `${file.name} 이미지를 기존 참조를 유지한 채 교체했습니다.`
                : `${file.name} 이미지를 프로젝트에 추가했습니다.`,
          );
          debugLog("slot:image-load", { slotId: slot?.id ?? null, name: file.name });
        } catch (error) {
          status("이미지 불러오기 실패: " + error.message);
          throw error;
        }
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
      async function loadDataFile(
        file,
        slot,
        { replaceSlotContent = false, assetPath = null, replaceAssetId = null } = {},
      ) {
        debugLog("fileLoad:start", {
          name: file.name,
          size: file.size,
          slotId: slot?.id ?? null,
          source: "shared-loader",
        });
        let csv = null,
          previousRuntime = {
            activeDataName,
            activeDataReady,
            activeCsvId,
          };
        try {
          let bytes = new Uint8Array(await file.arrayBuffer()),
            text = new TextDecoder().decode(bytes),
            data = file.name.toLowerCase().endsWith(".json") ? JSON.parse(text) : parseCSV(text);
          if (!Array.isArray(data) && Array.isArray(data.data)) data = data.data;
          if (!Array.isArray(data)) throw Error("지원하는 데이터 배열 형식이 아닙니다.");
          let plan = assetPath
            ? { path: normalizeProjectPath(assetPath), replaceId: replaceAssetId }
            : planProjectAssetImport(file, PROJECT_ASSET_DIRECTORIES.csv);
          if (Number.isInteger(plan.replaceId)) {
            csv = buildProjectCsvModel(
              data,
              file.name,
              plan.replaceId,
              ffpxBytesToBase64(bytes),
              file.type || "text/csv",
              1,
            );
            projectVfs.assignLocation(csv, plan.path);
            appFSM.send("DATA_OBJECT_REPLACED", {
              model: csv,
              direction: "fsm-to-model",
            });
          } else
            csv = createProjectCsv(
              data,
              file.name,
              null,
              ffpxBytesToBase64(bytes),
              file.type || "text/csv",
              1,
              plan.path,
            );
          refreshCsvControls(csv.id);
          if (slot) {
            activeDataName = file.name;
            activeDataReady = true;
            connectDataToSlot(slot, data, file.name, csv, { replaceSlotContent });
          }
          setFileName(file.name);
          status(
            Number.isInteger(plan.replaceId)
              ? `${file.name}을 기존 참조를 유지한 채 교체했습니다.`
              : `${file.name}을 프로젝트 CSV로 추가했습니다.`,
          );
          debugLog("fileLoad:complete", {
            name: file.name,
            rows: rows.length,
            slotId: slot?.id ?? null,
            chartId: slot?.chart || null,
            csvId: csv.id,
          });
        } catch (error) {
          activeDataName = previousRuntime.activeDataName;
          activeDataReady = previousRuntime.activeDataReady;
          activeCsvId = previousRuntime.activeCsvId;
          if (
            csv &&
            !activeProject.charts.some((chart) => chartCsvIds(chart).includes(csv.id))
          )
            appFSM.send("DATA_OBJECT_DELETED", {
              csvId: csv.id,
              direction: "fsm-to-model",
            });
          debugLog("fileLoad:error", {
            name: file.name,
            slotId: slot?.id ?? null,
            message: error.message,
          });
          throw error;
        }
      }
      async function loadFileIntoSlot(file, slot) {
        let kind = slotFileKind(file);
        if (!kind) throw Error("지원하지 않는 파일 형식입니다.");
        if (kind === "slot") return importSlotFile(file, slot);
        if (kind === "image") return loadImageFile(file, slot);
        return loadDataFile(file, slot, {
          replaceSlotContent: slot?.contentType === "image",
        });
      }
      function clearPreview() {
        $("tableWrap").classList.add("hidden");
        $("preview").innerHTML = "";
      }
      function preview() {
        if (!rows.length || !columns.length) return clearPreview();
        $("tableWrap").classList.remove("hidden");
        let body = rows
          .slice(0, 30)
          .map(
            (row, rowIndex) =>
              "<tr" +
              (rowIndex < headerLineCount($("headerLines").value, rows)
                ? ' class="preview-header"'
                : "") +
              ">" +
              columns.map((column) => `<td>${esc(row?.[column.index] ?? "")}</td>`).join("") +
              "</tr>",
          )
          .join("");
        if (rows.length > 30)
          body += `<tr class="preview-more"><td colspan="${columns.length}">...</td></tr>`;
        $("preview").innerHTML =
          "<thead><tr>" +
          columns.map((column) => `<th>${esc(column.label)}</th>`).join("") +
          "</tr></thead><tbody>" +
          body +
          "</tbody>";
      }
      async function loadProjectFiles(fileList) {
        let files = fileList instanceof File ? [fileList] : [...(fileList || [])],
          target = getSelectedSlot();
        if (!files.length) return false;
        try {
          if (target && (target.contentType || "graph") === "image")
            await loadFileIntoSlot(files[0], target);
          else if (target)
            for (let file of files) await loadDataFile(file, target);
          else
            for (let file of files) {
              let kind = slotFileKind(file);
              if (kind === "image") await loadImageFile(file, null);
              else if (kind === "data") await loadDataFile(file, null);
              else throw Error(`${file.name}: 지원하지 않는 파일 형식입니다.`);
            }
          return true;
        } catch (error) {
          status("불러오기 실패: " + error.message);
          return false;
        }
      }
      $("file").onchange = async (e) => {
        await loadProjectFiles(e.target.files);
        e.target.value = "";
      };
      $("resetSelectedSlot").onclick = () => {
        let slot = getSelectedSlot();
        if (!slot) {
          status("초기화할 슬롯을 먼저 선택하세요.");
          debugLog("slotReset:no-selection");
          return;
        }
        if (!window.confirm("데이터를 잃습니다.")) {
          debugLog("slotReset:cancel", { slotId: slot.id });
          return;
        }
        let payload = {
          slotIds: [slot.id],
          direction: "fsm-to-model",
        };
        appFSM.send("SLOTS_RESET", payload);
        appFSM.send("CLEAR_ASSET_SELECTION", {
          direction: "fsm-to-model",
        });
        renderDashboard();
        status("선택한 슬롯을 초기화했습니다.");
        debugLog("slotReset:complete", {
          slotId: slot.id,
          removedChartIds: payload.removedChartIds,
        });
      };
      function baseGraphObject(chart, csv = getProjectCsv(activeCsvId)) {
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
      function ensureGraphObjects(chart) {
        if (!chart) return [];
        chart.editor = chart.editor || {};
        if (!Array.isArray(chart.editor.objects)) chart.editor.objects = [];
        chart.editor.objects = chart.editor.objects.map((object, index) => {
          let csv = getProjectCsv(object?.csvId) || getProjectCsv(activeCsvId) || activeProject.csvFiles[0];
          if (!csv)
            throw Error(`그래프 객체 ${index + 1}에 연결할 프로젝트 CSV가 없습니다.`);
          let selection = graphDataSelection(csv.rows, csv.headerLines, object || {});
          return {
            ...baseGraphObject(chart, csv),
            ...(object || {}),
            csvId: csv.id,
            x: selection.x,
            y: selection.y,
          };
        });
        return chart.editor.objects;
      }
      function populateObjectForm(object) {
        if (!object) return;
        [
          ["xCol", "x"],
          ["yCol", "y"],
          ["xAxisSide", "xAxisSide"],
          ["yAxisSide", "yAxisSide"],
          ["chartType", "type"],
          ["legendName", "legendName"],
          ["lineWidth", "lineWidth"],
          ["lineDash", "lineDash"],
          ["markerSymbol", "markerSymbol"],
          ["markerSize", "markerSize"],
          ["barOpacity", "barOpacity"],
          ["barLineWidth", "barLineWidth"],
        ].forEach(([id, key]) => {
          $(id).value = object[key] ?? "";
        });
      }
      function selectGraphObjectFromIndex(index, expectedChartId = null) {
        let target = getSelectedSlot(),
          chart = target?.chart ? getChart(target.chart) : null;
        if (expectedChartId != null && chart?.id !== expectedChartId) return false;
        if (!target || target.contentType === "image" || !chart?.editor) return false;
        let objects = Array.isArray(chart.editor.objects) ? chart.editor.objects : [],
          requested =
            Number.isInteger(index) && index >= 0 && index < objects.length ? index : null,
          next = selectedObjectIndex === requested ? null : requested;
        appFSM.send(next === null ? "CLEAR_GRAPH_OBJECT" : "SELECT_GRAPH_OBJECT", {
          index: next,
          direction: "fsm-to-model",
        });
        if (selectedObjectIndex !== null) {
          let object = chart.editor.objects[selectedObjectIndex],
            csv = object?.csvId != null ? getProjectCsv(object.csvId) : null;
          if (csv) {
            activeCsvId = csv.id;
            activeDataName = csv.name;
            refreshCsvControls(csv.id);
          }
        }
        return true;
      }
      function selectGraphObject(index) {
        let objects = ensureGraphObjects(editing);
        if (!selectGraphObjectFromIndex(index, editing?.id ?? null)) return;
        if (selectedObjectIndex !== null) {
          let object = objects[selectedObjectIndex],
            csv = getProjectCsv(object.csvId);
          if (csv) {
            $("headerLines").value = csv.headerLines;
            loadData(csv.rows, csv.name);
          }
          populateObjectForm(object);
        }
        updateTypeSpecificOptions();
        renderGraphObjects(objects);
      }
      document.addEventListener(
        "pointerdown",
        (event) => {
          let active = document.activeElement;
          if (
            active !== event.target &&
            active?.matches("#title,#legendName,.axis-fields input")
          )
            active.blur();
          if (
            appFSM.state.graphObject !== "selected" ||
            event.target.closest(
              ".graph-object,button,input,select,textarea,[contenteditable='true'],.tree-node-action",
            )
          )
            return;
          appFSM.send("CLEAR_GRAPH_OBJECT", {
            index: null,
            direction: "fsm-to-model",
          });
          renderGraphObjects(ensureGraphObjects(editing));
        },
        true,
      );
      function replaceGraphObjects(objects, expectedChartId = null) {
        let target = getSelectedSlot(),
          chart = target?.chart && getChart(target.chart);
        if (expectedChartId != null && chart?.id !== expectedChartId) return null;
        if (!chart) {
          debugLog(
            "graph:objects-save-skipped",
            { slotId: target?.id ?? null, reason: "chart-not-found" },
            "warn",
          );
          return null;
        }
        debugLog("graph:objects-save", {
          slotId: target.id,
          chartId: chart.id,
          count: objects.length,
        });
        let payload = {
          chartId: chart.id,
          objects,
          index: selectedObjectIndex,
          direction: "fsm-to-model",
        };
        appFSM.send("GRAPH_OBJECTS_REPLACED", payload);
        chart = payload.chart;
        editing = chart;
        updateGraphView();
        appFSM.notify(
          "charts",
          payload.recovered
            ? "GRAPH_OBJECTS_DEFAULT_CREATED"
            : "GRAPH_OBJECTS_CHANGED",
        );
        return chart;
      }
      function saveGraphObjects(objects) {
        let chart = replaceGraphObjects(objects);
        if (!chart) return;
        renderGraphObjects(chart.editor.objects);
      }
      function selectedGraphObjectListTarget(expectedChartId = null) {
        let target = getSelectedSlot(),
          chart = target?.chart ? getChart(target.chart) : null;
        if (expectedChartId != null && chart?.id !== expectedChartId) return null;
        if (!target || target.contentType === "image" || !chart?.editor) return null;
        return chart;
      }
      function setGraphObjectColorsFromPalette(colors, expectedChartId = null) {
        let chart = selectedGraphObjectListTarget(expectedChartId),
          objects = Array.isArray(chart?.editor?.objects) ? chart.editor.objects : [],
          palette = Array.isArray(colors)
            ? colors.filter((color) => typeof color === "string" && color)
            : [];
        if (!chart || !palette.length) return false;
        return !!replaceGraphObjects(
          objects.map((object, index) => ({
            ...object,
            color: palette[index % palette.length],
          })),
          chart.id,
        );
      }
      function setGraphObjectColorFromIndex(index, color, expectedChartId = null) {
        let chart = selectedGraphObjectListTarget(expectedChartId),
          objects = Array.isArray(chart?.editor?.objects) ? chart.editor.objects : [];
        if (!chart || !Number.isInteger(index) || index < 0 || index >= objects.length)
          return false;
        let next = [...objects];
        next[index] = { ...next[index], color: String(color ?? "") };
        return !!replaceGraphObjects(next, chart.id);
      }
      function removeGraphObjectFromIndex(index, expectedChartId = null) {
        let chart = selectedGraphObjectListTarget(expectedChartId),
          objects = Array.isArray(chart?.editor?.objects) ? chart.editor.objects : [];
        if (!chart || !Number.isInteger(index) || index < 0 || index >= objects.length)
          return false;
        let applied = replaceGraphObjects(
          objects.filter((_, objectIndex) => objectIndex !== index),
          chart.id,
        );
        if (!applied) return false;
        appFSM.send("CLEAR_GRAPH_OBJECT", {
          index: null,
          direction: "fsm-to-model",
        });
        return true;
      }
      function moveGraphObjectFromIndex(from, to, expectedChartId = null) {
        let chart = selectedGraphObjectListTarget(expectedChartId),
          objects = Array.isArray(chart?.editor?.objects) ? chart.editor.objects : [];
        if (
          !chart ||
          !Number.isInteger(from) ||
          !Number.isInteger(to) ||
          from < 0 ||
          from >= objects.length ||
          to < 0 ||
          to >= objects.length ||
          from === to
        )
          return false;
        let next = [...objects],
          moved = next.splice(from, 1)[0],
          nextSelectedIndex = Number.isInteger(selectedObjectIndex)
            ? selectedObjectIndex
            : null;
        next.splice(to, 0, moved);
        if (nextSelectedIndex === from) nextSelectedIndex = to;
        else if (from < nextSelectedIndex && nextSelectedIndex <= to)
          nextSelectedIndex--;
        else if (to <= nextSelectedIndex && nextSelectedIndex < from)
          nextSelectedIndex++;
        appFSM.send("SELECT_GRAPH_OBJECT", {
          index: nextSelectedIndex,
          direction: "fsm-to-model",
        });
        return !!replaceGraphObjects(next, chart.id);
      }
      function renderGraphObjects(objects = []) {
        let box = $("graphObjects");
        box.replaceChildren();
        if (!objects.length) {
          let empty = document.createElement("div");
          empty.className = "graph-object empty";
          empty.textContent = "추가된 그래프 객체가 없습니다.";
          box.append(empty);
        } else
          objects.forEach((object, index) => {
            let fallback = DEFAULT_COLORS[index % DEFAULT_COLORS.length],
              color = typeof object.color === "string" ? object.color : fallback,
              colorInputValue = /^#[0-9a-f]{6}$/i.test(color) ? color : fallback,
              item = document.createElement("div"),
              order = document.createElement("span"),
              text = document.createElement("span"),
              colorInput = document.createElement("input"),
              deleteButton = document.createElement("button");
            item.className =
              "graph-object" + (selectedObjectIndex === index ? " selected" : "");
            item.draggable = true;
            item.dataset.index = index;
            item.style.setProperty("--object-color", color);
            order.className = "graph-object-order";
            text.className = "graph-object-text";
            text.textContent = `${index + 1}. ${object.legendName || `${object.x} · ${object.y}`} · ${getProjectCsv(object.csvId)?.name || "CSV 없음"} · ${object.xAxisSide === "top" ? "위" : "아래"} X / ${object.yAxisSide === "right" ? "오른쪽" : "왼쪽"} Y`;
            colorInput.className = "graph-object-color";
            colorInput.type = "color";
            colorInput.value = colorInputValue;
            colorInput.setAttribute("aria-label", "그래프 객체 색상");
            deleteButton.className = "graph-object-delete";
            deleteButton.type = "button";
            deleteButton.setAttribute("aria-label", "그래프 객체 삭제");
            deleteButton.textContent = "×";
            item.append(order, text, colorInput, deleteButton);
            box.append(item);
          });
        let dragging = null;
        box.querySelectorAll(".graph-object[draggable]").forEach((item) => {
          item.onclick = (e) => {
            if (e.target.closest("input,button")) return;
            selectGraphObject(+item.dataset.index);
          };
          item.ondragstart = (e) => {
            dragging = +item.dataset.index;
            item.classList.add("dragging");
            e.dataTransfer.effectAllowed = "move";
          };
          item.ondragend = () => item.classList.remove("dragging");
          item.ondragover = (e) => e.preventDefault();
          item.ondrop = (e) => {
            e.preventDefault();
            let to = +item.dataset.index;
            if (dragging === null || dragging === to) return;
            if (moveGraphObjectFromIndex(dragging, to))
              renderGraphObjects(ensureGraphObjects(editing));
          };
          item.querySelector(".graph-object-color").oninput = (e) => {
            if (setGraphObjectColorFromIndex(+item.dataset.index, e.target.value))
              renderGraphObjects(ensureGraphObjects(editing));
          };
          item.querySelector(".graph-object-delete").onclick = (e) => {
            e.stopPropagation();
            if (removeGraphObjectFromIndex(+item.dataset.index))
              renderGraphObjects(ensureGraphObjects(editing));
          };
        });
      }
      $("addGraphObject").onclick = () => {
        let model = selectedGraphObjectAddModel();
        if (!model) return status("그래프 슬롯과 데이터를 먼저 선택하세요.");
        if (!fastFigureUiBridge.addGraphObject(model.slotId, model.chartId))
          return status("그래프 오브젝트를 추가하지 못했습니다.");
        let target = getSelectedSlot(),
          chart = target?.chart ? getChart(target.chart) : null,
          objects = chart ? ensureGraphObjects(chart) : [];
        if (!chart || selectedObjectIndex === null)
          return status("그래프 오브젝트를 추가하지 못했습니다.");
        let object = objects[selectedObjectIndex],
          csv = getProjectCsv(object.csvId);
        if (csv) {
          $("headerLines").value = csv.headerLines;
          loadData(csv.rows, csv.name);
        }
        populateObjectForm(object);
        renderGraphObjects(objects);
      };
      function updateTypeSpecificOptions() {
        let visibility = graphObjectTypeVisibility($("chartType").value);
        $("lineOptions").classList.toggle("hidden", !visibility.line);
        $("markerOptions").classList.toggle("hidden", !visibility.marker);
        $("barOptions").classList.toggle("hidden", !visibility.bar);
      }
      function bindGraphNumberInputs(ids, apply) {
        ids.forEach((id) => {
          let control = $(id);
          control.addEventListener("change", apply);
          control.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            event.target.blur();
          });
        });
      }
      function bindGraphTextInputs(ids, apply) {
        ids.forEach((id) => {
          let control = $(id);
          control.addEventListener("change", apply);
          control.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            event.target.blur();
          });
        });
      }
      ["xCol", "yCol", "xAxisSide", "yAxisSide", "chartType", "lineDash", "markerSymbol"].forEach(
        (id) =>
          $(id).addEventListener("change", () => {
            if (id === "chartType") updateTypeSpecificOptions();
            applyGraphSettings();
          }),
      );
      $("graphFontFamily").addEventListener("change", applyGraphLayoutSettings);
      bindGraphTextInputs(["legendName"], applyGraphSettings);
      bindGraphTextInputs(["title"], applyGraphLayoutSettings);
      bindGraphNumberInputs(
        ["lineWidth", "markerSize", "barOpacity", "barLineWidth"],
        applyGraphSettings,
      );
      bindGraphNumberInputs(["titleFontSize", "legendFontSize"], applyGraphLayoutSettings);
      updateTypeSpecificOptions();
      function clearAllSlotSelections() {
        setSelectedSlot(null);
        layoutSelected.clear();
        renderLayout();
      }
      function applyAnnotationVisibilityFromValues(kind, enabled) {
        if (!["label", "caption"].includes(kind)) return null;
        enabled = !!enabled;
        if (kind === "label") activeProject.labelsEnabled = enabled;
        else activeProject.captionsEnabled = enabled;
        renderDashboard();
        debugLog(`annotation:${kind}`, { enabled });
        appFSM.notify(
          kind === "label" ? "labels" : "captions",
          "ANNOTATION_VISIBILITY_CHANGED",
        );
        return enabled;
      }
      function setAnnotationEnabled(kind, enabled) {
        let applied = applyAnnotationVisibilityFromValues(kind, enabled);
        if (applied == null) return false;
        syncSettingToggle(`${kind}Enabled`, applied, ["표시 안 함", "표시"]);
        return true;
      }
      function finiteLabelPosition(value) {
        return Number.isFinite(value) ? value : 0;
      }
      function labelPreviewGeometry(preview = $("labelPreview")) {
        let referenceGeometry = dashboardGeometry(dashboardReferenceWidth()),
          reference = gridSlotGeometry(
            activeProject.layout,
            referenceGeometry,
            getSelectedSlot(),
          );
        preview.style.aspectRatio = `${reference.width} / ${reference.height}`;
        let rect = preview.getBoundingClientRect(),
          width = Math.max(1, rect.width),
          scale = width / reference.width,
          height = reference.height * scale;
        return {
          left: 0,
          top: 0,
          width,
          height,
          scale,
          reference,
        };
      }
      function constrainLabelPreviewPosition(
        x,
        y,
        geometry = labelPreviewGeometry(),
        label = $("labelPreviewLabel"),
      ) {
        let width = label.getBoundingClientRect().width / geometry.scale,
          height = label.getBoundingClientRect().height / geometry.scale;
        return {
          x: Math.min(Math.max(0, x), Math.max(0, geometry.reference.width - width)),
          y: Math.min(Math.max(0, y), Math.max(0, geometry.reference.height - height)),
        };
      }
      function labelPreviewPositionFromPointer(
        clientX,
        clientY,
        offsetX = 0,
        offsetY = 0,
        preview = $("labelPreview"),
        label = $("labelPreviewLabel"),
      ) {
        if (!preview) return null;
        let rect = preview.getBoundingClientRect(),
          geometry = labelPreviewGeometry(preview);
        return constrainLabelPreviewPosition(
          (clientX - rect.left - geometry.left - offsetX) / geometry.scale,
          (clientY - rect.top - geometry.top - offsetY) / geometry.scale,
          geometry,
          label,
        );
      }
      function renderLabelPreviewFromValues(
        values = {},
        syncControls = false,
        preview = $("labelPreview"),
        label = $("labelPreviewLabel"),
      ) {
        let slot = preview?.querySelector(".label-preview-slot");
        if (!preview || !label || !slot) return null;
        let settings = { ...activeProject.labelSettings, ...values },
          geometry = labelPreviewGeometry(preview),
          x = finiteLabelPosition(Number(settings.x)),
          y = finiteLabelPosition(Number(settings.y)),
          identifier = targetSlotIdentifier(0, settings);
        label.textContent = settings.parentheses ? `(${identifier})` : identifier;
        slot.style.left = `${geometry.left}px`;
        slot.style.top = `${geometry.top}px`;
        slot.style.width = `${geometry.width}px`;
        slot.style.height = `${geometry.height}px`;
        label.style.left = `${geometry.left + x * geometry.scale}px`;
        label.style.top = `${geometry.top + y * geometry.scale}px`;
        label.style.fontFamily = settings.fontFamily;
        label.style.fontSize = `${settings.fontSize * geometry.scale}px`;
        label.style.minWidth = `${20 * geometry.scale}px`;
        label.style.padding = `${2 * geometry.scale}px ${6 * geometry.scale}px`;
        if (syncControls) {
          let xControl = $("labelPositionX"),
            yControl = $("labelPositionY");
          if (xControl) xControl.value = Number(x.toFixed(2));
          if (yControl) yControl.value = Number(y.toFixed(2));
        }
        return { x, y, geometry };
      }
      function renderLabelPreview() {
        return renderLabelPreviewFromValues(activeProject.labelSettings, true);
      }
      function applyLabelSettingsFromValues(values = {}) {
        activeProject.labelSettings.format = values.format ?? activeProject.labelSettings.format;
        activeProject.labelSettings.parentheses =
          values.parentheses == null
            ? activeProject.labelSettings.parentheses
            : !!values.parentheses;
        activeProject.labelSettings.order = values.order ?? activeProject.labelSettings.order;
        activeProject.labelSettings.fontFamily =
          values.fontFamily ?? activeProject.labelSettings.fontFamily;
        let fontSize = Number(values.fontSize);
        activeProject.labelSettings.fontSize = Number.isFinite(fontSize)
          ? Math.max(6, fontSize)
          : 14;
        renderLabelPreview();
        renderDashboard();
        schedulePlotResize();
        debugLog("annotation:label-settings", { ...activeProject.labelSettings });
        appFSM.notify("labels", "LABEL_SETTINGS_CHANGED");
        return { ...activeProject.labelSettings };
      }
      function applyLabelSettings() {
        let settings = applyLabelSettingsFromValues({
          format: $("labelFormat").value,
          parentheses: $("labelParentheses").dataset.active === "true",
          order: $("labelOrder").value,
          fontFamily: $("labelFontFamily").value,
          fontSize: $("labelFontSize").value,
        });
        $("labelFontSize").value = settings.fontSize;
      }
      function commitLabelPosition(values, event, debugEvent) {
        activeProject.labelSettings.x = finiteLabelPosition(Number(values.x));
        activeProject.labelSettings.y = finiteLabelPosition(Number(values.y));
        renderLabelPreview();
        renderDashboard();
        schedulePlotResize();
        debugLog(debugEvent, {
          x: activeProject.labelSettings.x,
          y: activeProject.labelSettings.y,
        });
        appFSM.notify("labels", event);
        return {
          x: activeProject.labelSettings.x,
          y: activeProject.labelSettings.y,
        };
      }
      function applyLabelPositionFromValues(values = {}) {
        return commitLabelPosition(values, "LABEL_POSITION_CHANGED", "annotation:label-position");
      }
      function resetLabelPositionFromValues() {
        return commitLabelPosition({ x: 0, y: 0 }, "LABEL_POSITION_RESET", "annotation:label-position-reset");
      }
      function applyLabelPosition() {
        applyLabelPositionFromValues({
          x: $("labelPositionX").value,
          y: $("labelPositionY").value,
        });
      }
      function installLabelSettings() {
        ["labelFormat", "labelOrder", "labelFontFamily"].forEach((id) =>
          $(id).addEventListener("change", applyLabelSettings),
        );
        $("labelFontSize").addEventListener("change", applyLabelSettings);
        $("labelParentheses").onclick = () => {
          syncSettingToggle(
            "labelParentheses",
            $("labelParentheses").dataset.active !== "true",
          );
          applyLabelSettings();
        };
        $("labelFontSize").addEventListener("keydown", (event) => {
          if (event.key === "Enter") event.target.blur();
        });
        ["labelPositionX", "labelPositionY"].forEach((id) =>
          $(id).addEventListener("change", applyLabelPosition),
        );
        $("labelPositionReset").onclick = () => {
          resetLabelPositionFromValues();
        };
        let preview = $("labelPreview"),
          label = $("labelPreviewLabel"),
          dragging = null;
        label.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          event.stopPropagation();
          let rect = label.getBoundingClientRect();
          dragging = {
            pointerId: event.pointerId,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
          };
          label.classList.add("dragging");
          label.setPointerCapture?.(dragging.pointerId);
        });
        label.addEventListener("pointermove", (event) => {
          if (dragging?.pointerId !== event.pointerId) return;
          let rect = preview.getBoundingClientRect(),
            geometry = labelPreviewGeometry(),
            position = constrainLabelPreviewPosition(
              (event.clientX - rect.left - geometry.left - dragging.offsetX) /
                geometry.scale,
              (event.clientY - rect.top - geometry.top - dragging.offsetY) /
                geometry.scale,
              geometry,
            );
          activeProject.labelSettings.x = position.x;
          activeProject.labelSettings.y = position.y;
          renderLabelPreview();
          renderDashboard();
          schedulePlotResize();
        });
        let stop = (event) => {
          if (dragging?.pointerId !== event.pointerId) return;
          label.releasePointerCapture?.(dragging.pointerId);
          dragging = null;
          label.classList.remove("dragging");
          debugLog("annotation:label-position", { x: activeProject.labelSettings.x, y: activeProject.labelSettings.y });
          appFSM.notify("labels", "LABEL_POSITION_DRAGGED");
        };
        label.addEventListener("pointerup", stop);
        label.addEventListener("pointercancel", stop);
        renderLabelPreview();
      }
      function applyCaptionSettingsFromValues(values = null, notify = true) {
        if (values) {
          activeProject.captionName = String(values.name ?? activeProject.captionName);
          activeProject.captionNameBold =
            values.nameBold == null ? activeProject.captionNameBold : !!values.nameBold;
          activeProject.captionSettings.fontFamily =
            values.fontFamily ?? activeProject.captionSettings.fontFamily;
          activeProject.captionSettings.fontSize = Math.max(
            6,
            Math.min(96, Number(values.fontSize) || 14),
          );
          activeProject.captionSettings.lineHeight = Math.max(
            0.8,
            Math.min(4, Number(values.lineHeight) || 1.45),
          );
        }
        syncDashboardCaption();
        debugLog("annotation:caption-settings", {
          name: activeProject.captionName,
          bold: activeProject.captionNameBold,
          ...activeProject.captionSettings,
        });
        if (notify) appFSM.notify("captions", "CAPTION_SETTINGS_CHANGED");
        return projectClone(projectObjects.read("captions"));
      }
      function applyCaptionSettings(fromControls = true, notify = true) {
        let caption = applyCaptionSettingsFromValues(
          fromControls
            ? {
                name: $("captionName").value,
                nameBold: $("captionNameBold").dataset.active === "true",
                fontFamily: $("captionFontFamily").value,
                fontSize: $("captionFontSize").value,
                lineHeight: $("captionLineHeight").value,
              }
            : null,
          notify,
        );
        $("captionName").value = caption.name;
        syncSettingToggle("captionNameBold", caption.nameBold);
        $("captionFontFamily").value = caption.settings.fontFamily;
        $("captionFontSize").value = caption.settings.fontSize;
        $("captionLineHeight").value = caption.settings.lineHeight;
        return caption;
      }
      function installCaptionSettings() {
        $("captionFontFamily").addEventListener("change", applyCaptionSettings);
        ["captionFontSize", "captionLineHeight"].forEach((id) => {
          let control = $(id);
          control.addEventListener("change", applyCaptionSettings);
          control.addEventListener("keydown", (event) => {
            if (event.key === "Enter") event.target.blur();
          });
        });
        applyCaptionSettings();
      }
      function installAnnotationPopup(kind) {
        let toggle = $(`${kind}Toggle`);
        toggle.onclick = (e) => {
          e.stopPropagation();
          syncPopupBounds();
          appFSM.send("TOGGLE_OVERLAY", { overlay: kind, source: "toggle" });
        };
        $(`${kind}Enabled`).onclick = () =>
          setAnnotationEnabled(kind, kind === "label" ? !activeProject.labelsEnabled : !activeProject.captionsEnabled);
      }
      fillGraphFontSelect("graphFontFamily");
      installLabelSettings();
      installCaptionSettings();
      installAnnotationPopup("label");
      installAnnotationPopup("caption");
      $("slotCaptionMode").onclick = () =>
        appFSM.send("SLOT_CAPTION_MODE_CHANGED", {
          enabled: !activeProject.slotCaptionsEnabled,
          direction: "fsm-to-model",
        });
      $("insertSlotCaptions").onclick = () => {
        clearAllSlotSelections();
        let before = activeProject.captionText;
        appFSM.send("SLOT_CAPTIONS_INSERTED", { direction: "fsm-to-model" });
        if (activeProject.captionText === before) return status("추가할 슬롯별 캡션이 없습니다.");
        syncCaptionControlsFromObject(projectObjects.read("captions"));
        debugLog("annotation:slot-captions-inserted", {
          length: activeProject.captionText.length - before.length,
        });
      };
      function exportImageLoad(src) {
        return new Promise((resolve, reject) => {
          let image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(Error("이미지를 읽을 수 없습니다."));
          image.src = src;
        });
      }
      function exportDrawImage(ctx, image, rect, slot, scaleX, scaleY, imageModel = null) {
        let settings =
            normalizeImageSettings(projectClone(imageModel || slotImage(slot))) || {},
          width = rect.width,
          height = rect.height,
          ratio = image.naturalWidth / image.naturalHeight || 1,
          fit = settings.fit || "contain",
          drawW,
          drawH,
          left,
          top;
        if (fit === "manual") {
          drawW = (width * (Number(settings.scale) || 100)) / 100;
          drawH = drawW / ratio;
          left = rect.left + (width * (Number(settings.x) || 50)) / 100 - drawW / 2;
          top = rect.top + (height * (Number(settings.y) || 50)) / 100 - drawH / 2;
        } else {
          let factor =
            fit === "cover"
              ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
              : Math.min(width / image.naturalWidth, height / image.naturalHeight);
          drawW = image.naturalWidth * factor;
          drawH = image.naturalHeight * factor;
          left = rect.left + (width - drawW) / 2;
          top = rect.top + (height - drawH) / 2;
        }
        ctx.save();
        ctx.beginPath();
        ctx.rect(rect.left * scaleX, rect.top * scaleY, width * scaleX, height * scaleY);
        ctx.clip();
        ctx.drawImage(image, left * scaleX, top * scaleY, drawW * scaleX, drawH * scaleY);
        ctx.restore();
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
      async function exportDashboard(capture = false) {
        let dashboard = $("dashboard"),
          caption = $("dashboardCaption"),
          statusOut = $("printStatus"),
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
                Math.min(20000, Number($("printWidth").value) || Math.round(sourceWidth)),
              ),
          height = capture
            ? Math.round(sourceHeight)
            : Math.max(
                100,
                Math.min(20000, Number($("printHeight").value) || Math.round(sourceHeight)),
              ),
          dpi = Math.max(36, Math.min(1200, Number($("printDpi").value) || 300)),
          format = $("printFormat").value;
        $("printWidth").value = width;
        $("printHeight").value = height;
        $("printDpi").value = dpi;
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
          figure = chartFigure(chart, layoutScale);
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
      function exportCaptionLayout(ctx, view, width, scale) {
        if (!view.enabled)
          return {
            height: 0,
            gap: 0,
            padding: 0,
            fontSize: 0,
            lineHeight: 0,
            lines: [],
          };
        let padding = 8 * scale,
          fontSize = view.settings.fontSize * scale,
          lineHeight = fontSize * view.settings.lineHeight,
          available = Math.max(10, width - padding * 2),
          prefix = view.name || "",
          body = view.slotMode ? view.exportText : view.text || "",
          lines = [],
          firstLine = true,
          prefixWidth = 0;
        if (prefix) {
          ctx.font = `${view.nameBold ? "700" : "400"} ${fontSize}px ${view.settings.fontFamily}`;
          prefixWidth = ctx.measureText(prefix + " ").width;
        }
        ctx.font = `400 ${fontSize}px ${view.settings.fontFamily}`;
        let paragraphs = String(body).split(/\n/);
        paragraphs.forEach((paragraph, paragraphIndex) => {
          let words = paragraph.split(/\s+/).filter(Boolean),
            line = "";
          for (let word of words) {
            let trial = line ? `${line} ${word}` : word,
              lineWidth = available - (firstLine ? prefixWidth : 0);
            if (line && ctx.measureText(trial).width > Math.max(10, lineWidth)) {
              lines.push({ text: line, prefix: firstLine ? prefix : "" });
              line = word;
              firstLine = false;
            } else line = trial;
          }
          if (line || paragraphIndex < paragraphs.length - 1 || (firstLine && prefix)) {
            lines.push({ text: line, prefix: firstLine ? prefix : "" });
            firstLine = false;
          }
        });
        if (!lines.length) lines.push({ text: "", prefix });
        return {
          height: padding * 2 + lines.length * lineHeight + 2 * scale,
          gap: 10 * scale,
          padding,
          fontSize,
          lineHeight,
          lines,
        };
      }
      function targetExportGeometry(layout, width, heightOverride = null) {
        let slotStyle = layout.slotStyle || {},
          referenceWidth = Math.max(
            100,
            Math.min(20000, Number(slotStyle.referenceWidth) || 1200),
          ),
          scale = Math.max(0.001, Number(width) / referenceWidth),
          configuredAspect = Math.max(
            0.1,
            Math.min(10, Number(slotStyle.aspect) || 1.618),
          ),
          naturalHeight = Number(width) / configuredAspect,
          height =
            Number.isFinite(heightOverride) && heightOverride > 0
              ? Number(heightOverride)
              : naturalHeight,
          outerMargin = Math.min(
            Math.max(0, Math.min(5000, Number(slotStyle.outerMargin) || 0)) * scale,
            Math.min(Number(width), height) * 0.49,
          );
        return {
          referenceWidth,
          width: Number(width),
          height,
          scale,
          aspect: Number(width) / height,
          outerMargin,
          gap: Math.max(0, Math.min(2000, Number(slotStyle.gap) || 0)) * scale,
          radius: Math.max(0, Math.min(2000, Number(slotStyle.radius) || 0)) * scale,
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
          captionView: projectClone(activeCaptionView(objects.captions)),
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
      async function exportDashboardTarget() {
        let width = Math.max(100, Math.min(20000, Number($("printWidth").value) || 1000)),
          dpi = Math.max(36, Math.min(1200, Number($("printDpi").value) || 300)),
          requestedHeight = Number($("printHeight").value);
        $("printWidth").value = width;
        $("printDpi").value = dpi;
        let result = await exportDashboardTargetFromValues(
          {
            width,
            height: requestedHeight,
            dpi,
            format: $("printFormat").value,
          },
          $("printStatus"),
        );
        if (result?.height != null && requestedHeight > 0) $("printHeight").value = result.height;
        return result;
      }
      async function captureDashboardTargetFromValues(
        values = {},
        statusOut = { textContent: "" },
      ) {
        let dashboard = $("dashboard"),
          rect = dashboard?.getBoundingClientRect();
        if (!rect?.width) {
          statusOut.textContent = "캡처할 그래프 영역이 없습니다.";
          return { outcome: "rejected", reason: "empty-dashboard" };
        }
        return exportDashboardTargetFromValues(
          {
            ...values,
            width: Math.round(rect.width),
            height: "",
          },
          statusOut,
        );
      }
      async function exportDashboardTargetFromValues(values = {}, statusOut = { textContent: "" }) {
        let snapshot = createTargetExportSnapshot(),
          captionView = snapshot.captionView,
          width = Math.max(100, Math.min(20000, Number(values.width) || 1000)),
          requestedHeight = Number(values.height),
          dpi = Math.max(36, Math.min(1200, Number(values.dpi) || 300)),
          rasterScale = 1,
          format = ["png", "jpeg"].includes(values.format) ? values.format : "png",
          bordersVisible = snapshot.bordersVisible,
          visibleSlots = snapshot.slots.filter((slot) => !slot.hidden),
          captionShown = captionView.enabled;
        let canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d"),
          baseReference = targetExportGeometry(snapshot.layout, width),
          outputScale = width / baseReference.referenceWidth,
          captionLayout = exportCaptionLayout(ctx, captionView, width, outputScale),
          automaticHeight = !Number.isFinite(requestedHeight) || requestedHeight <= 0,
          height = automaticHeight
            ? Math.ceil(baseReference.height + captionLayout.height + captionLayout.gap)
            : Math.max(100, Math.min(20000, requestedHeight)),
          rasterWidth = Math.round(width),
          rasterHeight = Math.round(height),
          maxRasterDimension = 16384,
          maxRasterArea = 64000000;
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
          dashboardHeight = height - captionLayout.height - captionLayout.gap,
          minimumDashboardHeight = Math.ceil(
            reference.outerMargin * 2 +
              reference.gap * Math.max(0, snapshot.layout.gridRows - 1) +
              snapshot.layout.gridRows,
          );
        if (dashboardHeight < minimumDashboardHeight) {
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
          throw Error("출력 크기에 비해 슬롯 간격이 너무 큽니다.");
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
              exportDrawImage(ctx, image, rect, slot, 1, 1, imageModel);
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
            let y = top + captionLayout.padding + captionLayout.fontSize;
            ctx.fillStyle = snapshot.captionStyle.color;
            for (let line of captionLayout.lines) {
              let x = captionLayout.padding;
              if (line.prefix) {
                ctx.font = `${captionView.nameBold ? "700" : "400"} ${captionLayout.fontSize}px ${captionView.settings.fontFamily}`;
                ctx.fillText(line.prefix, x, y);
                x += ctx.measureText(line.prefix + " ").width;
              }
              ctx.font = `400 ${captionLayout.fontSize}px ${captionView.settings.fontFamily}`;
              ctx.fillText(line.text, x, y);
              y += captionLayout.lineHeight;
            }
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
          return { outcome: "saved", width, height, automaticHeight };
        } catch (error) {
          statusOut.textContent = "저장 실패: " + error.message;
          debugLog("dashboard:export-error", { message: error.message });
          throw error;
        }
      }
      $("printToggle").onclick = (e) => {
        e.stopPropagation();
        appFSM.send("TOGGLE_OVERLAY", { overlay: "print", source: "toggle" });
      };
      $("savePrint").onclick = exportDashboardTarget;
      $("capturePrint").onclick = () => exportDashboard(true);
      $("layoutToggle").onclick = (e) => {
        e.stopPropagation();
        appFSM.send("TOGGLE_OVERLAY", { overlay: "layout", source: "toggle" });
      };
      document.addEventListener(
        "keydown",
        (event) => {
          if (event.key !== "Escape" || appFSM.state.overlay === "none") return;
          event.preventDefault();
          event.stopPropagation();
          appFSM.send("ESCAPE", { reason: "keyboard" });
        },
        true,
      );
      document.addEventListener(
        "pointerdown",
        (e) => {
          let path = e.composedPath(),
            aside = document.querySelector("aside"),
            inAside = path.includes(aside);
          if (
            appFSM.state.overlay !== "layout" &&
            !path.includes($("dashboard")) &&
            !path.includes($("dashboardCaption")) &&
            !path.some((node) => node?.classList?.contains("dragcover")) &&
            !path.includes($("labelPanel")) &&
            !path.includes($("captionPanel")) &&
            !path.includes($("printPanel")) &&
            !path.includes($("labelToggle")) &&
            !path.includes($("captionToggle")) &&
            !path.includes($("printToggle")) &&
            !inAside
          )
            clearAllSlotSelections();
          if (inAside) return;
          let active = document.activeElement;
          if (active?.matches('input[type="number"]')) active.blur();
        },
        true,
      );
      document.addEventListener("click", (e) => {
        let path = e.composedPath(),
          overlay = appFSM.state.overlay,
          overlayPanel = {
            layout: $("layoutPanel"),
            label: $("labelPanel"),
            caption: $("captionPanel"),
            print: $("printPanel"),
          }[overlay],
          overlayToggle = {
            layout: $("layoutToggle"),
            label: $("labelToggle"),
            caption: $("captionToggle"),
            print: $("printToggle"),
          }[overlay],
          panel = $("layoutPanel"),
          dashboard = $("dashboard"),
          aside = document.querySelector("aside"),
          inPanel = path.includes(panel),
          inAnnotation =
            path.includes($("labelPanel")) ||
            path.includes($("captionPanel")) ||
            path.includes($("printPanel")) ||
            path.includes($("labelToggle")) ||
            path.includes($("captionToggle")) ||
            path.includes($("printToggle")),
          inDashboard = path.includes(dashboard),
          inCaption = path.includes($("dashboardCaption")),
          inAside = path.includes(aside),
          inLayoutSlot = path.some((node) => node?.classList?.contains("layout-slot")),
          inControl = path.some((node) => ["BUTTON", "INPUT", "LABEL"].includes(node?.tagName));
        if (overlayPanel && !path.includes(overlayPanel) && !path.includes(overlayToggle))
          appFSM.send("OUTSIDE_CLICK", { reason: "popup-outside" });
        if (inDashboard || inCaption || inAnnotation) return;
        if (overlay === "layout") {
          if (inPanel && !inLayoutSlot && !inControl) {
            layoutSelected.clear();
            renderLayout();
          }
        }
      });
      $("captionText").addEventListener("input", (event) => {
        let region = event.target.closest?.("[data-caption-region]")?.dataset.captionRegion;
        if (region === "sections") return;
        appFSM.send("CAPTION_TEXT_INPUT", {
          text: event.target.textContent || "",
          region: region || "body",
          direction: "fsm-to-model",
        });
      });
      $("captionName").addEventListener("input", (event) => {
        activeProject.captionName = event.target.value;
        syncDashboardCaption();
        appFSM.notify("captions", "CAPTION_NAME_CHANGED");
      });
      $("captionName").addEventListener("change", applyCaptionSettings);
      $("captionName").addEventListener("keydown", (event) => {
        if (event.key === "Enter") event.target.blur();
      });
      $("captionNameBold").onclick = () => {
        activeProject.captionNameBold = !activeProject.captionNameBold;
        let button = $("captionNameBold");
        syncSettingToggle(button, activeProject.captionNameBold);
        syncDashboardCaption();
        appFSM.notify("captions", "CAPTION_NAME_WEIGHT_CHANGED");
      };
      function parseGraphPaletteText(text) {
        let parsed = JSON.parse(text),
          colors = Array.isArray(parsed) ? parsed : parsed?.colors;
        if (!Array.isArray(colors) || !colors.length) throw Error("colors 배열이 없습니다.");
        let valid = colors.filter(
          (color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color),
        );
        if (!valid.length) throw Error("유효한 HEX 색상이 없습니다.");
        return valid;
      }
      $("resetGraphPalette").onclick = () => {
        let chart = getSelectedSlot()?.chart && getChart(getSelectedSlot().chart);
        if (!chart) return status("그래프 슬롯을 먼저 선택하세요.");
        if (!setGraphObjectColorsFromPalette(DEFAULT_COLORS, chart.id))
          return status("그래프 색상 구성을 초기화하지 못했습니다.");
        renderGraphObjects(ensureGraphObjects(editing));
        debugLog("graphPalette:reset", { slotId: selectedSlotId });
      };
      $("saveGraphPalette").onclick = () => {
        let slot = getSelectedSlot();
        if (!slot) return status("그래프 슬롯을 먼저 선택하세요.");
        let stamp = new Date().toISOString().replace(/[:.]/g, "-");
        downloadJsonFile({ colors: graphPalette() }, `chart-palette-${stamp}.json`);
        debugLog("graphPalette:save", { slotId: slot.id });
      };
      $("loadGraphPalette").onclick = () => {
        if (!getSelectedSlot()) return status("그래프 슬롯을 먼저 선택하세요.");
        $("loadGraphPaletteFile").click();
      };
      $("loadGraphPaletteFile").onchange = async (e) => {
        let file = e.target.files[0];
        if (!file) return;
        try {
          let valid = parseGraphPaletteText(await file.text()),
            chart = getSelectedSlot()?.chart && getChart(getSelectedSlot().chart);
          if (!chart) throw Error("그래프 슬롯을 먼저 선택하세요.");
          if (!setGraphObjectColorsFromPalette(valid, chart.id))
            throw Error("색상 구성을 적용하지 못했습니다.");
          renderGraphObjects(ensureGraphObjects(editing));
          status(`${file.name} 색상 구성을 덮어썼습니다.`);
          debugLog("graphPalette:load", {
            slotId: selectedSlotId,
            name: file.name,
            colors: valid.length,
          });
        } catch (error) {
          status("팔레트 불러오기 실패: " + error.message);
          debugLog("graphPalette:load-error", { message: error.message });
        } finally {
          e.target.value = "";
        }
      };
      function downloadJsonFile(payload, name) {
        let blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json;charset=utf-8",
          }),
          link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 0);
      }
      function ffsxBuildSlot(slot, chart) {
        let projectObject = projectObjects.read("project"),
          copy = chartExportCopy(chart),
          referenced = chartCsvIds(chart).map((id) => {
            let csv = getProjectCsv(id);
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
        copy.editor.objects.forEach((object) => {
          if (Number.isInteger(object.csvId)) object.csvId = slotIds.get(object.csvId);
        });
        let manifest = {
            schema: "fast-figure-slot",
            version: PACKAGE_FORMAT_VERSION,
            appBuild: projectObject.appBuild,
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
        let assets = ffpxZipRead(new Uint8Array(await file.arrayBuffer())),
          xmlBytes = assets.get("slot.xml");
        if (!xmlBytes) throw Error("FFSX slot.xml이 없습니다.");
        let slotRoot = ffpxReadXmlDocument(assets, "slot.xml", "fastFigureSlot"),
            slotNode = slotRoot.querySelector(":scope > slot"),
            slot = ffpxXmlReadValue(
              slotNode.querySelector(":scope > settings > value"),
            ),
            caption = ffpxXmlReadValue(
              slotNode.querySelector(":scope > caption > value"),
            ),
            graphNode = slotNode.querySelector(":scope > graph"),
            chart = ffpxXmlReadValue(
              graphNode.querySelector(":scope > settings > value"),
            ),
            assetRoot = ffpxReadXmlDocument(
              assets,
              "assets/assets.xml",
              "fastFigureAssets",
            );
          delete chart.id;
          debugLog("slotFfsx:read-version", {
            format: "FFSX",
            appBuild: typeof slot?.appBuild === "string" ? slot.appBuild : null,
          });
          delete slot.appBuild;
          chart.editor.objects = [
            ...graphNode.querySelectorAll(":scope > graphObjects > graphObject"),
          ].map((node) => ffpxXmlReadValue(node.firstElementChild));
          let payload = {
            schema: "fast-figure-slot",
            version: PACKAGE_FORMAT_VERSION,
            slot: {
              ...slot,
              caption: typeof caption?.text === "string" ? caption.text : null,
            },
            chart,
            csvFiles: [...assetRoot.querySelectorAll("dataAsset")].map((node) =>
              ffpxXmlReadValue(node.firstElementChild),
            ),
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
          csv.bytesBase64 = ffpxBytesToBase64(data);
          delete csv.dataRef;
        }
        let defaultCsv = defaultCsvModel(0);
        payload.csvFiles = reuseImportedDefaultCsv(
          payload.csvFiles,
          [chart],
          defaultCsv,
          0,
        );
        let validationCsvFiles = [
          ...payload.csvFiles,
          defaultCsv,
        ];
        validateChartModel(chart, "FFSX 차트", validationCsvFiles);
        return payload;
      }
      function downloadSlotFfsx() {
        let slot = getSelectedSlot(),
          chart = slot?.chart && getChart(slot.chart);
        if (!slot || !chart) return status("FFSX로 내보낼 그래프 슬롯을 먼저 선택하세요.");
        try {
          let bundle = ffsxBuildSlot(slot, chart),
            blob = new Blob([ffpxZipStore(bundle.assets)], {
              type: "application/vnd.fast-figure-slot",
            }),
            link = document.createElement("a"),
            stamp = new Date().toISOString().replace(/[:.]/g, "-");
          link.href = URL.createObjectURL(blob);
          link.download = `fast-figure-slot-${slot.id}-${stamp}.ffsx`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 0);
          status("선택한 슬롯을 FFSX 파일로 내보냈습니다.");
          debugLog("slotFfsx:export", {
            slotId: slot.id,
            chartId: chart.id,
            assets: bundle.assets.length,
          });
        } catch (error) {
          status("FFSX 내보내기 오류: " + error.message);
          debugLog("slotFfsx:export-error", { message: error.message });
        }
      }
      function downloadPlotlyJson() {
        let slot = getSelectedSlot(),
          chart = slot?.chart && getChart(slot.chart);
        if (!slot || !chart) return status("Plotly JSON으로 내보낼 그래프 슬롯을 먼저 선택하세요.");
        let stamp = new Date().toISOString().replace(/[:.]/g, "-"),
          figure = chartFigure(chart);
        downloadJsonFile(figure, `plotly-figure-${slot.id}-${stamp}.json`);
        status("선택한 슬롯의 Plotly JSON을 내보냈습니다.");
      }
      $("exportSlotJson").onclick = downloadSlotFfsx;
      $("exportPlotlyJson").onclick = downloadPlotlyJson;
      $("editorEditable").onclick = () => {
        let chart = editing,
          result = setGraphEditorEditableFromValue(chart?.editor?.editable === false, chart?.id ?? null);
        if (!result) return;
        if (result.csv) {
          $("headerLines").value = result.csv.headerLines;
          loadData(result.csv.rows, result.csv.name);
          setFileName(result.csv.name);
          refreshCsvControls(result.csv.id);
        }
        syncEditableUi(result.chart);
      };
      $("importSlotJson").onclick = () => {
        if (!getSelectedSlot())
          return status("FFSX 또는 Plotly JSON을 불러올 슬롯을 먼저 선택하세요.");
        $("importSlotJsonFile").click();
      };
      async function importSlotFile(file, slot) {
        if (!slot) throw Error("FFSX 또는 Plotly JSON을 불러올 슬롯을 먼저 선택하세요.");
        let header = new Uint8Array(await file.slice(0, 4).arrayBuffer()),
          payload =
            header.length === 4 && header[0] === 0x50 && header[1] === 0x4b
              ? await ffsxReadSlot(file)
              : JSON.parse(await file.text());
        let chart,
          slotCaption,
          packagedCsvFiles = [];
        if (
          payload?.schema === "fast-figure-slot" &&
          payload.version === PACKAGE_FORMAT_VERSION &&
          payload.chart &&
          typeof payload.chart === "object"
        ) {
          packagedCsvFiles = payload.csvFiles;
          if (
            !Array.isArray(packagedCsvFiles) ||
            packagedCsvFiles.some((csv) => !Array.isArray(csv.rows))
          )
            throw Error("FFSX CSV 데이터가 없습니다.");
          chart = projectClone(payload.chart);
          let temporaryDefaultCsv = defaultCsvModel(0);
          packagedCsvFiles = reuseImportedDefaultCsv(
            projectClone(packagedCsvFiles),
            [chart],
            temporaryDefaultCsv,
            0,
          );
          chart = validateChartModel(chart, "FFSX 차트", [
            ...packagedCsvFiles,
            temporaryDefaultCsv,
          ]);
          slotCaption =
            typeof payload.slot?.caption === "string" ? payload.slot.caption : undefined;
        } else if (
          Array.isArray(payload?.data) ||
          payload?.layout ||
          payload?.config ||
          payload?.frames
        ) {
          chart = parsePlotlyToEditor(payload, null);
          chart.editor.editable = false;
          if (Array.isArray(chart.editor.conversionRows)) chart.editor.conversionRows.length = 0;
          delete chart.editor.conversionRows;
        } else throw Error("지원하지 않는 FFSX 슬롯 또는 Plotly JSON 형식입니다.");
        normalizeGlobalSettings(chart);
        let importPayload = {
          slotId: slot.id,
          chart,
          csvFiles: packagedCsvFiles || [],
          slotCaption,
          direction: "fsm-to-model",
        };
        appFSM.send("SLOT_CHART_IMPORTED", importPayload);
        chart = importPayload.chart;
        selectedSlotId = null;
        setSelectedSlot(slot.id, "model-to-fsm");
        status(`${file.name}을 현재 슬롯에 불러왔습니다.`);
        debugLog("slot:import", {
          slotId: slot.id,
          chartId: chart.id,
          editable: chart.editor.editable,
          objects: chart.editor.objects.length,
          rows:
            chart.editor.editable === false
              ? 0
              : getProjectCsv(chart.editor.objects[0]?.csvId)?.rows.length || 0,
          schema: payload?.schema || "plotly",
        });
      }
      $("importSlotJsonFile").onchange = async (e) => {
        let file = e.target.files[0];
        if (!file) return;
        try {
          await importSlotFile(file, getSelectedSlot());
        } catch (error) {
          refreshCsvControls();
          status("슬롯 불러오기 오류: " + error.message);
          debugLog("slot:import-error", { message: error.message });
        } finally {
          e.target.value = "";
        }
      };
      function applyLayoutSettingsFromValues(values = {}) {
        let r = +values.gridRows,
          c = +values.gridCols;
        if (r < 1 || c < 1 || r > 8 || c > 8) return status("행과 열은 1~8 사이여야 합니다.");
        makeSlots(r, c);
        activeProject.layout.slotStyle = slotStyleFromValues(
          values.slotStyle || activeProject.layout.slotStyle,
        );
        applySlotStyle(false, true, false);
        return true;
      }
      $("applyGrid").onclick = () => {
        applyLayoutSettingsFromValues({
          gridRows: $("gridRows").value,
          gridCols: $("gridCols").value,
          slotStyle: slotStyleFromControls(),
        });
      };
      $("showSlotBorders").onclick = () => {
        let button = $("showSlotBorders"),
          active = button.dataset.active !== "true";
        syncSettingToggle(button, active);
        applySlotStyle();
      };
      function applyDashboardZoom(resize = true, requestedValue = null, syncControls = true) {
        if (requestedValue !== null && !dashboardZoomLocked)
          dashboardZoomIntent = Math.max(50, Math.min(200, Number(requestedValue) || 100));
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
        if (syncControls) requestAnimationFrame(syncDashboardZoomDisplay);
      }
      function commitDashboardScale(reason) {
        renderDashboard();
        debugLog("dashboard:scale-commit", {
          reason,
          zoom: dashboardZoomIntent,
          width: $("dashboard").getBoundingClientRect().width,
        });
        appFSM.notify("layout", "DASHBOARD_SCALE_COMMITTED");
      }
      function readDashboardZoomModel() {
        let dashboard = $("dashboard");
        return Object.freeze({
          zoom: dashboardZoomIntent,
          locked: dashboardZoomLocked,
          lockedWidth: dashboardZoomLockedWidth,
          width: dashboard?.getBoundingClientRect().width || 0,
        });
      }
      function setDashboardZoomFromValue(value, commit = false) {
        if (dashboardZoomLocked) return readDashboardZoomModel();
        applyDashboardZoom(false, value, false);
        if (commit) commitDashboardScale("zoom-value");
        return readDashboardZoomModel();
      }
      function setDashboardZoomLockedFromValue(locked) {
        let dashboard = $("dashboard");
        dashboardZoomLocked = !!locked;
        if (dashboardZoomLocked)
          dashboardZoomLockedWidth = dashboard.getBoundingClientRect().width;
        else {
          dashboardZoomLockedWidth = null;
          dashboardZoomIntent = 100;
        }
        applyDashboardZoom(false, null, false);
        if (dashboardZoomLocked) schedulePlotResize();
        else commitDashboardScale("unlock-reset-100");
        debugLog("dashboard:zoom-lock", {
          locked: dashboardZoomLocked,
          width: dashboardZoomLockedWidth,
        });
        return readDashboardZoomModel();
      }
      function resetDashboardZoomFromValue() {
        if (dashboardZoomLocked) return setDashboardZoomLockedFromValue(false);
        dashboardZoomIntent = 100;
        applyDashboardZoom(false, null, false);
        commitDashboardScale("reset-100");
        return readDashboardZoomModel();
      }
      function setDashboardZoomLocked(locked) {
        let slider = $("dashboardZoom"),
          lock = $("dashboardZoomLock"),
          state = setDashboardZoomLockedFromValue(locked);
        slider.disabled = state.locked;
        lock.setAttribute("aria-pressed", String(state.locked));
        lock.title = state.locked ? "대시보드 크기 고정 해제" : "현재 대시보드 크기 고정";
        requestAnimationFrame(syncDashboardZoomDisplay);
        return state;
      }
      function applyCsvHeaderLinesFromValue(value, csvId = activeCsvId) {
        let result = applyCsvHeaderLinesToModel(value, csvId);
        if (!result) return false;
        $("headerLines").value = result.headerLines;
        refreshColumnControls();
        return true;
      }
      function applyCsvHeaderLinesToModel(value, csvId = activeCsvId) {
        let csv = getProjectCsv(csvId);
        if (!csv || csv.id !== activeCsvId) return false;
        let count = headerLineCount(value, csv.rows);
        csv.headerLines = count;
        activeProject.charts.forEach((chart) => {
          if (
            chart.editor?.editable !== false &&
            chartCsvIds(chart).includes(csv.id)
          )
            rebuildEditableGraph(chart);
        });
        renderDashboard();
        debugLog("csv:header-lines", {
          csvId: csv.id,
          headerLines: count,
        });
        publishFastFigureUiStore(appFSM.state, "csv:header-lines");
        return Object.freeze({
          csvId: csv.id,
          headerLines: count,
        });
      }
      $("headerLines").onchange = () => {
        applyCsvHeaderLinesFromValue($("headerLines").value);
      };
      $("dashboardZoom").oninput = (event) => applyDashboardZoom(false, event.target.value);
      $("dashboardZoom").onchange = () => commitDashboardScale("slider-change");
      $("dashboardZoomLock").onclick = () => setDashboardZoomLocked(!dashboardZoomLocked);
      $("dashboardZoomReset").onclick = () => {
        if (dashboardZoomLocked) return setDashboardZoomLocked(false);
        dashboardZoomIntent = 100;
        applyDashboardZoom(false);
        commitDashboardScale("reset-100");
      };
      function commitLayoutNumberInput(id) {
        applySlotStyle();
        if (id === "dashboardReferenceWidth") applyDashboardZoom(true);
        else if (id === "slotGap" || id === "dashboardOuterMargin") {
          applyDashboardZoom(false);
          schedulePlotResize();
        } else if (id === "dashboardAspect") schedulePlotResize();
        if (id !== "slotRadius") syncLayoutMapSize();
      }
      [
        "dashboardReferenceWidth",
        "slotGap",
        "dashboardOuterMargin",
        "slotRadius",
        "dashboardAspect",
      ].forEach((id) => {
        let control = $(id);
        control.addEventListener("change", () => commitLayoutNumberInput(id));
        control.addEventListener("keydown", (event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          event.target.blur();
        });
      });
      $("resetDashboardAspect").onclick = () => {
        $("dashboardAspect").value = "1.618";
        applySlotStyle();
        schedulePlotResize();
      };
      ["showLegend", "showTitle", "showZeroLine"].forEach(
        (id) =>
          ($(id).onclick = () => {
            syncSettingToggle(id, $(id).dataset.active !== "true");
            applyGraphLayoutSettings();
          }),
      );
      let axisCommitRevision = 0;
      function applyAxisSetting(control) {
        if (!control?.closest(".axis-fields")) return;
        axisCommitRevision += 1;
        applyGraphLayoutSettings();
      }
      document.addEventListener("change", (e) => {
        let control = e.target;
        if (
          control.closest(".axis-fields") &&
          (control.matches("input") || control.matches("select"))
        )
          applyAxisSetting(control);
      });
      document.addEventListener("keydown", (e) => {
        if (
          e.key === "Enter" &&
          e.target.closest(".axis-fields") &&
          e.target.matches("input")
        ) {
          e.preventDefault();
          let revision = axisCommitRevision;
          e.target.blur();
          if (revision === axisCommitRevision) applyAxisSetting(e.target);
        }
      });
      document.addEventListener("click", (e) => {
        let b = e.target.closest(".axis-fields .setting-toggle");
        if (b) {
          syncSettingToggle(b, b.dataset.active !== "true");
          applyGraphLayoutSettings();
        }
      });
      $("mergeSlots").onclick = mergeSelected;
      $("splitSlot").onclick = splitSelected;
      function uiPaletteFromControls() {
        return Object.fromEntries(
          Object.entries(DEFAULT_UI_PALETTE).map(([key, fallback]) => [
            key,
            projectColor($(key)?.value, fallback),
          ]),
        );
      }
      function applyUiPalette(fromControls = true, notify = true) {
        if (fromControls) activeProject.appearance.uiPalette = uiPaletteFromControls();
        let palette = activeProject.appearance.uiPalette;
        Object.entries(palette).forEach(([key, value]) => {
          let control = $(key);
          if (control) control.value = value;
        });
        document.documentElement.style.setProperty("--ui-color", palette.uiColor);
        document.documentElement.style.setProperty("--line", palette.uiColor);
        document.documentElement.style.setProperty("--accent", palette.uiColor);
        document.documentElement.style.setProperty(
          "--ui-bg",
          palette.uiBackgroundColor,
        );
        document.documentElement.style.setProperty(
          "--panel",
          palette.uiBackgroundColor,
        );
        document.documentElement.style.setProperty(
          "--paper",
          palette.uiBackgroundColor,
        );
        document.documentElement.style.setProperty("--ui-surface", palette.uiSurfaceColor);
        document.documentElement.style.setProperty("--ui-muted", palette.uiMutedColor);
        document.documentElement.style.setProperty("--ui-subtle", palette.uiSubtleColor);
        document.documentElement.style.setProperty(
          "--ui-disabled-bg",
          palette.uiDisabledBgColor,
        );
        document.documentElement.style.setProperty(
          "--ui-disabled-text",
          palette.uiDisabledTextColor,
        );
        document.documentElement.style.setProperty("--ui-shadow", palette.uiShadowColor);
        document.documentElement.style.setProperty("--ink", palette.fontColor);
        document.documentElement.style.setProperty("--graph-bg", palette.paperColor);
        renderDashboard();
        if (notify) appFSM.notify("ui", "UI_PALETTE_CHANGED");
      }
      $("applyUiPalette").onclick = applyUiPalette;
      $("resetUiPalette").onclick = () => {
        $("uiColor").value = "#B0CFCE";
        $("uiBackgroundColor").value = "#FAFAFA";
        $("uiSurfaceColor").value = "#FFFFFF";
        $("uiMutedColor").value = "#4F525D";
        $("uiSubtleColor").value = "#94A3B8";
        $("uiDisabledBgColor").value = "#E5E7EB";
        $("uiDisabledTextColor").value = "#64748B";
        $("uiShadowColor").value = "#383A42";
        $("paperColor").value = "#FFFFFF";
        $("fontColor").value = "#383A42";
        applyUiPalette();
      };
      function syncHeaderHeight() {
        let header = document.querySelector("header");
        if (header)
          document.documentElement.style.setProperty(
            "--header-height",
            `${header.getBoundingClientRect().height}px`,
          );
      }
      function installSidebarControls() {
        let app = document.querySelector(".app"),
          aside = document.querySelector("aside"),
          resizer = $("sidebarResizer"),
          toggle = $("sidebarToggle"),
          width = 370,
          minWidth = 360,
          dragging = false;
        function refreshSidebarMinimum() {
          if (app.classList.contains("sidebar-collapsed")) return;
          app.classList.add("sidebar-measuring");
          minWidth = Math.max(360, Math.ceil(aside.scrollWidth));
          app.classList.remove("sidebar-measuring");
          app.style.setProperty("--sidebar-min-width", `${minWidth}px`);
          width = Math.max(width, minWidth);
          app.style.setProperty("--sidebar-width", `${width}px`);
        }
        function setCollapsed(collapsed) {
          app.classList.toggle("sidebar-collapsed", collapsed);
          toggle.textContent = collapsed ? "›" : "‹";
          toggle.title = collapsed ? "설정 패널 펼치기" : "설정 패널 접기";
          toggle.setAttribute("aria-label", toggle.title);
          toggle.setAttribute("aria-expanded", String(!collapsed));
          schedulePlotResize();
        }
        toggle.onclick = (e) => {
          e.stopPropagation();
          setCollapsed(!app.classList.contains("sidebar-collapsed"));
        };
        resizer.addEventListener("pointerdown", (e) => {
          if (e.target.closest("button") || app.classList.contains("sidebar-collapsed")) return;
          dragging = true;
          resizer.setPointerCapture(e.pointerId);
          document.body.style.userSelect = "none";
          document.body.style.cursor = "col-resize";
        });
        resizer.addEventListener("pointermove", (e) => {
          if (!dragging) return;
          width = Math.max(minWidth, Math.min(620, e.clientX));
          app.style.setProperty("--sidebar-width", `${width}px`);
          syncLayoutMapSize();
          schedulePlotResize();
        });
        resizer.addEventListener("pointerup", (e) => {
          if (!dragging) return;
          dragging = false;
          resizer.releasePointerCapture?.(e.pointerId);
          document.body.style.userSelect = "";
          document.body.style.cursor = "";
          debugLog("sidebar:resize", { width });
        });
        window.addEventListener("resize", () => {
          syncHeaderHeight();
          refreshSidebarMinimum();
          applyDashboardZoom(false);
          syncLayoutMapSize();
          schedulePlotResize();
        });
        requestAnimationFrame(refreshSidebarMinimum);
      }
      $("saveDebug").onclick = () => {
        auditApp("debug:save");
        debugLog("debugLog:save", {
          build: projectObjects.read("project").appBuild,
          userAgent: navigator.userAgent,
          location: location.href,
        });
        let blob = new Blob([$("debugLog").textContent], { type: "text/plain;charset=utf-8" }),
          a = document.createElement("a"),
          stamp = new Date().toISOString().replace(/[:.]/g, "-");
        a.href = URL.createObjectURL(blob);
        a.download = `chart-builder-debug-${stamp}.log`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 0);
      };
      $("clearDebug").onclick = () => {
        $("debugLog").textContent = "";
        debugSequence = 0;
      };
      $("toggleDebug").onclick = () => {
        let button = $("toggleDebug"),
          enabled = button.dataset.active !== "true";
        debugEnabled = enabled;
        syncSettingToggle(button, enabled);
        button.textContent = enabled ? "디버깅 끄기" : "디버깅 켜기";
        $("debugLog").classList.toggle("hidden", !enabled);
      };
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
      function connectLifecycleTasksToFSM() {
        [
          ["importProjectFile", "onchange", "importing", "PROJECT_IMPORT"],
          ["importSlotJsonFile", "onchange", "importing", "SLOT_IMPORT"],
          ["file", "onchange", "importing", "ASSET_IMPORT"],
          ["loadGraphPaletteFile", "onchange", "importing", "PALETTE_IMPORT"],
          ["exportProject", "onclick", "exporting", "PROJECT_EXPORT"],
          ["exportSlotJson", "onclick", "exporting", "SLOT_EXPORT"],
          ["exportPlotlyJson", "onclick", "exporting", "PLOTLY_EXPORT"],
          ["savePrint", "onclick", "exporting", "PRINT_EXPORT"],
          ["capturePrint", "onclick", "exporting", "CAPTURE_EXPORT"],
        ].forEach(([id, property, lifecycle, eventName]) => {
          let control = $(id),
            handler = control?.[property];
          if (typeof handler !== "function") return;
          control[property] = function (event) {
            return appFSM
              .run(lifecycle, eventName, () => handler.call(this, event))
              .catch((error) => {
                debugLog(
                  "fsm:lifecycle-task-error",
                  { event: eventName, message: error.message },
                  "error",
                );
              });
          };
        });
      }
      debugLog("app:init", {
        build: projectObjects.read("project").appBuild,
        userAgent: navigator.userAgent,
        location: location.href,
      });
      function installLegacyUiInfrastructure() {
        syncHeaderHeight();
        syncPopupBounds();
        applyDashboardZoom();
        ["showLegend", "showTitle", "showZeroLine", "showSlotBorders"].forEach((id) =>
          syncSettingToggle(id, $(id).dataset.active === "true"),
        );
        installHelpPopups();
        installSidebarControls();
        installAssetTreeInteractions();
        connectLifecycleTasksToFSM();
        installLayoutResizer();
        axisFields();
        graphColorInputs();
        renderGraphObjects();
      }
      installLegacyUiInfrastructure();
      ensureDefaultCsv();
      refreshCsvControls();
      installSlotClickController();
      makeSlots();
      applySlotStyle();
      $("projectName").value = activeProject.projectName;
      syncEditableUi(null);
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
    