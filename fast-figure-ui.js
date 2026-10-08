(() => {
  const runtime = window.FastFigureUiRuntime;
  if (!runtime) throw new Error("Fast Figure UI runtime failed to load");
  if (!window.fastFigureUiRoot) throw new Error("Fast Figure React root is not initialized");

  const { React, MantineCore } = runtime;
  const {
    ActionIcon,
    AppShell,
    Box,
    Button,
    Code,
    ColorInput,
    FileButton,
    Group,
    Image,
    Input,
    MantineProvider,
    Menu,
    Modal,
    NumberInput,
    ScrollArea,
    Select,
    Stack,
    Table,
    TableTbody,
    TableTd,
    TableTh,
    TableThead,
    TableTr,
    Text,
    TextInput,
    Textarea,
    UnstyledButton,
    createTheme,
  } = MantineCore;
  const { useEffect, useRef, useState, useSyncExternalStore } = React;

  const fastFigureTheme = createTheme({
    fontFamily: 'system-ui, "Segoe UI", sans-serif',
    fontSizes: { ff: "14px" },
    radius: { ff: "6px" },
    defaultRadius: "ff",
    other: {
      shell: {
        headerHeight: 57,
        navbarWidth: 370,
        navbarMinWidth: 360,
        navbarMaxWidth: 620,
        resizeHandleWidth: 8,
      },
    },
    components: {
      Button: Button.extend({
        defaultProps: { size: "ff" },
        vars: (_theme, props) =>
          props.size === "ff"
            ? {
                root: {
                  "--button-height": "38px",
                  "--button-padding-x": "12px",
                  "--button-fz": "14px",
                },
              }
            : { root: {} },
      }),
      ActionIcon: ActionIcon.extend({
        defaultProps: { size: "ff" },
        vars: (_theme, props) =>
          props.size === "ff" ? { root: { "--ai-size": "38px" } } : { root: {} },
      }),
      Input: Input.extend({
        defaultProps: { size: "ff" },
        vars: (_theme, props) =>
          props.size === "ff"
            ? {
                wrapper: {
                  "--input-height": "38px",
                  "--input-fz": "14px",
                  "--input-radius": "6px",
                },
              }
            : { wrapper: {} },
      }),
      Modal: Modal.extend({
        defaultProps: {
          centered: true,
          closeOnClickOutside: true,
          closeOnEscape: true,
        },
      }),
    },
  });

  const FONT_SELECT_PREFIX = "ff-font:";
  const GRAPH_FONT_OPTIONS = Object.freeze([
    { value: "", label: "자동" },
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "Helvetica, Arial, sans-serif", label: "Helvetica" },
    { value: "Open Sans, Arial, sans-serif", label: "Open Sans" },
    { value: "Verdana, sans-serif", label: "Verdana" },
    { value: "Times New Roman, serif", label: "Times New Roman" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "Courier New, monospace", label: "Courier New" },
  ]);
  const ANNOTATION_FONT_OPTIONS = Object.freeze([
    { value: "system-ui, sans-serif", label: "기본" },
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "Times New Roman, serif", label: "Times New Roman" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "Courier New, monospace", label: "Courier New" },
  ]);
  function fontSelectData(options, currentValue) {
    const current = typeof currentValue === "string" ? currentValue : "";
    const values = options.some((option) => option.value === current)
      ? options
      : [
          ...options,
          {
            value: current,
            label: current ? `기존: ${current}` : "기존: 빈 값",
          },
        ];
    return values.map((option) => ({
      value: FONT_SELECT_PREFIX + option.value,
      label: option.label,
    }));
  }
  function fontSelectValue(value) {
    return FONT_SELECT_PREFIX + (typeof value === "string" ? value : "");
  }
  function fontValueFromSelect(value) {
    return typeof value === "string" && value.startsWith(FONT_SELECT_PREFIX)
      ? value.slice(FONT_SELECT_PREFIX.length)
      : null;
  }

  function subscribeAppState(onStoreChange) {
    return appFSM.subscribe(onStoreChange);
  }

  function getAppStateSnapshot() {
    return appFSM.state;
  }

  function useAppState() {
    return useSyncExternalStore(subscribeAppState, getAppStateSnapshot, getAppStateSnapshot);
  }

  function useUiTelemetry() {
    return useSyncExternalStore(
      subscribeUiTelemetry,
      getUiTelemetrySnapshot,
      getUiTelemetrySnapshot,
    );
  }

  function selectedTargetText(state) {
    if (state.workspace === "project") return "빈 슬롯 또는 그래프를 선택하세요.";
    const slot = window.FastFigureApi.slots.readSelected();
    return slot ? `선택한 슬롯: ${slot.row}행 ${slot.col}열` : "빈 슬롯 또는 그래프를 선택하세요.";
  }

  function toggleOverlay(overlay) {
    appFSM.send("TOGGLE_OVERLAY", { overlay, source: "mantine" });
  }

  function runLifecycleTask(lifecycle, eventName, task) {
    return appFSM
      .run(lifecycle, eventName, task)
      .catch((error) => {
        debugLog(
          "fsm:lifecycle-task-error",
          { event: eventName, message: error.message },
          "error",
        );
      });
  }

  function useProjectAssetImportCollision() {
    const resolverRef = useRef(null);
    const [collision, setCollision] = useState(null);
    const resolveCollision = (choice = "rename") => {
      const resolve = resolverRef.current;
      resolverRef.current = null;
      setCollision(null);
      resolve?.(choice);
    };
    const choosePlan = async (file, directory, reservedPaths = null) => {
      const model = window.FastFigureApi.assets.collisionModel(file, directory, reservedPaths);
      if (model.mode === "available")
        return window.FastFigureApi.assets.resolveImportPlan(model, "rename", reservedPaths);
      const choice = await new Promise((resolve) => {
        resolverRef.current = resolve;
        setCollision(model);
      });
      return window.FastFigureApi.assets.resolveImportPlan(model, choice || "rename", reservedPaths);
    };
    const modal = React.createElement(
      Modal,
      {
        opened: !!collision,
        onClose: () => resolveCollision("rename"),
        title:
          collision?.mode === "replace-or-rename"
            ? "같은 이름의 파일"
            : "파일 이름 충돌",
      },
      collision
        ? React.createElement(
            Stack,
            { gap: "sm" },
            React.createElement(
              Text,
              { style: { whiteSpace: "pre-wrap" } },
              collision.mode === "replace-or-rename"
                ? collision.message
                : collision.notice || `${collision.path}에 같은 이름의 항목이 있습니다.`,
            ),
            React.createElement(
              Group,
              { justify: "flex-end", gap: "xs" },
              React.createElement(
                Button,
                { variant: "light", onClick: () => resolveCollision("rename") },
                "새 이름으로 추가",
              ),
              collision.mode === "replace-or-rename"
                ? React.createElement(
                    Button,
                    { onClick: () => resolveCollision("replace") },
                    "기존 파일 교체",
                  )
                : null,
            ),
          )
        : null,
    );
    return { choosePlan, modal };
  }

  function exportProjectFromMantine() {
    return runLifecycleTask("exporting", "PROJECT_EXPORT", () => window.FastFigureApi.project.exportFile());
  }

  function exportSlotFfsxFromMantine() {
    return runLifecycleTask("exporting", "SLOT_EXPORT", () => window.FastFigureApi.graphs.exportFfsx());
  }

  function exportPlotlyJsonFromMantine() {
    return runLifecycleTask("exporting", "PLOTLY_EXPORT", () => window.FastFigureApi.graphs.exportPlotlyJson());
  }

  function FastFigureToolbar() {
    const state = useAppState();
    const activeOverlay = state.overlay;
    const buttonProps = (overlay) => ({
      variant: activeOverlay === overlay ? "filled" : "light",
      "aria-expanded": activeOverlay === overlay,
      onClick: () => toggleOverlay(overlay),
    });

    return React.createElement(
      Group,
      { gap: "xs", wrap: "nowrap", role: "toolbar", "aria-label": "Fast figure 도구" },
      React.createElement(Button, { ...buttonProps("layout") }, "레이아웃"),
      React.createElement(Button, { ...buttonProps("label") }, "레이블"),
      React.createElement(Button, { ...buttonProps("caption") }, "캡션"),
      React.createElement(
        Text,
        {
          size: "sm",
          c: "dimmed",
          style: { flex: "1 1 auto", minWidth: 0 },
        },
        selectedTargetText(state),
      ),
      React.createElement(Button, { ...buttonProps("print"), "aria-label": "프린트" }, "프린트"),
    );
  }

  function FastFigureDataActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const slotApi = window.FastFigureApi.slots;
    const slot = state.workspace === "project" ? null : slotApi.readSelected();
    const slotType = slot?.contentType || "graph";
    const [resetSlotId, setResetSlotId] = useState(null);
    const assetApi = window.FastFigureApi.assets;
    const selectedAssetDeletable = !!assetApi.readDeletionTarget();
    const [deleteTarget, setDeleteTarget] = useState(null);
    const fileResetRef = useRef(null);
    const { choosePlan: chooseProjectAssetImportPlan, modal: importCollisionModal } =
      useProjectAssetImportCollision();
    const importFilesFromMantine = async (files) => {
      const selectedFiles = Array.isArray(files) ? files : files ? [files] : [];
      if (!selectedFiles.length) return;
      try {
        await runLifecycleTask("importing", "ASSET_IMPORT", async () => {
          try {
            await assetApi.importFiles(selectedFiles, chooseProjectAssetImportPlan);
          } catch (error) {
            status("불러오기 실패: " + error.message);
          }
        });
      } finally {
        fileResetRef.current?.();
      }
    };

    const performAssetDelete = (target) => {
      try {
        assetApi.delete(target);
        setDeleteTarget(null);
      } catch (error) {
        status(`에셋 삭제 오류: ${error.message}`);
      }
    };
    const requestAssetDelete = () => {
      const target = assetApi.readDeletionTarget();
      if (!target) return;
      if (target.referenceCount > 0) setDeleteTarget(target);
      else performAssetDelete(target);
    };
    const closeResetDialog = () => setResetSlotId(null);
    const confirmSlotReset = () => {
      if (!Number.isInteger(resetSlotId)) return;
      try {
        slotApi.reset(resetSlotId);
        closeResetDialog();
      } catch (error) {
        status(`슬롯 초기화 오류: ${error.message}`);
      }
    };
    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "데이터"),
      slot
        ? React.createElement(
            Group,
            { gap: "xs", grow: true },
            React.createElement(
              Button,
              {
                variant: slotType === "graph" ? "filled" : "light",
                disabled: busy,
                onClick: () => slotApi.setContentType("graph"),
              },
              "그래프",
            ),
            React.createElement(
              Button,
              {
                variant: slotType === "image" ? "filled" : "light",
                disabled: busy,
                onClick: () => slotApi.setContentType("image"),
              },
              "이미지",
            ),
          )
        : null,
      React.createElement(
        FileButton,
        {
          onChange: importFilesFromMantine,
          accept: ".csv,.tsv,.json",
          multiple: true,
          resetRef: fileResetRef,
          disabled: busy,
        },
        (props) =>
          React.createElement(
            Button,
            { ...props, variant: "light", disabled: busy },
            "데이터 추가",
          ),
      ),
      importCollisionModal,
      React.createElement(
        Button,
        {
          variant: "light",
          disabled: busy || !["csv", "image"].includes(state.assetSelection),
          onClick: () => assetApi.download(),
        },
        "선택 에셋 다운로드",
      ),
      React.createElement(
        Button,
        {
          variant: "light",
          disabled: busy || !selectedAssetDeletable,
          onClick: requestAssetDelete,
        },
        "선택 에셋 삭제",
      ),
      React.createElement(
        Modal,
        {
          opened: !!deleteTarget,
          onClose: () => setDeleteTarget(null),
          title: "선택 에셋 삭제",
          },
        deleteTarget
          ? React.createElement(
              Stack,
              { gap: "sm" },
              React.createElement(
                Text,
                null,
                deleteTarget.kind === "csv"
                  ? `${deleteTarget.name}을 ${deleteTarget.referenceCount}개 그래프 오브젝트가 참조 중입니다. 참조 중인 그래프 오브젝트와 CSV를 함께 삭제할까요?`
                  : `${deleteTarget.name}을 ${deleteTarget.referenceCount}개 이미지 슬롯이 참조 중입니다. 참조 슬롯을 초기화하고 이미지를 삭제할까요?`,
              ),
              React.createElement(
                Group,
                { justify: "flex-end", gap: "xs" },
                React.createElement(
                  Button,
                  { variant: "light", onClick: () => setDeleteTarget(null) },
                  "취소",
                ),
                React.createElement(
                  Button,
                  { onClick: () => performAssetDelete(deleteTarget) },
                  "삭제",
                ),
              ),
            )
          : null,
      ),
      slot
        ? React.createElement(
            Button,
            {
              variant: "light",
              disabled: busy,
              onClick: () => setResetSlotId(slot.id),
            },
            "선택 슬롯 초기화",
          )
        : null,
      React.createElement(
        Modal,
        {
          opened: Number.isInteger(resetSlotId),
          onClose: closeResetDialog,
          title: "선택 슬롯 초기화",
          },
        React.createElement(
          Stack,
          { gap: "sm" },
          React.createElement(Text, null, "데이터를 잃습니다."),
          React.createElement(
            Group,
            { justify: "flex-end", gap: "xs" },
            React.createElement(Button, { variant: "light", onClick: closeResetDialog }, "취소"),
            React.createElement(Button, { onClick: confirmSlotReset }, "초기화"),
          ),
        ),
      ),
    );
  }

  function FastFigureImageEditor() {
    const state = useAppState();
    if (state.workspace !== "slot.image") return null;
    const busy = state.lifecycle !== "ready";
    const imageApi = window.FastFigureApi.images;
    const image = imageApi.readEditor();
    const settings = image?.settings;
    const updateSettings = (patch) => {
      if (!settings) return;
      imageApi.setSettings({ ...settings, ...patch });
    };

    return React.createElement(
      Stack,
      { gap: "xs", px: "md", pb: "md" },
      React.createElement(Text, { fw: 600, size: "sm" }, "이미지"),
      image
        ? React.createElement(Image, {
            src: image.src,
            alt: image.name || "선택 이미지",
            h: 160,
            fit: "contain",
            radius: "sm",
          })
        : React.createElement(
            Text,
            { size: "sm", c: "dimmed" },
            "이미지를 추가하거나 프로젝트 이미지 에셋을 연결하세요.",
          ),
      React.createElement(
        Button,
        {
          variant: "light",
          disabled: busy,
          onClick: imageApi.insertEmpty,
        },
        "빈 이미지 삽입",
      ),
      React.createElement(Button, {
        variant: "light",
        disabled: busy || state.assetSelection !== "image" || !state.assetPath,
        onClick: () => {
          const slot = window.FastFigureApi.slots.readSelected();
          if (slot?.contentType === "image")
            window.FastFigureApi.assets.connectToSlot(state.assetPath, "image", slot.id);
        },
      }, "선택 이미지 추가"),
      React.createElement(Select, {
        label: "맞춤",
        value: settings?.fit || "contain",
        data: [
          { value: "contain", label: "맞춰 넣기" },
          { value: "cover", label: "채우기" },
          { value: "manual", label: "수동" },
        ],
        disabled: busy || !image,
        allowDeselect: false,
        onChange: (value) => updateSettings({ fit: value || settings?.fit || "contain" }),
      }),
      settings?.fit === "manual"
        ? React.createElement(
            Stack,
            { gap: "xs" },
            React.createElement(NumberInput, {
              label: "크기 (%)",
              value: settings.scale,
              min: 1,
              max: 1000,
              disabled: busy,
              onChange: (value) => updateSettings({ scale: value }),
            }),
            React.createElement(
              Group,
              { gap: "xs", grow: true },
              React.createElement(NumberInput, {
                label: "X (%)",
                value: settings.x,
                min: -100,
                max: 200,
                disabled: busy,
                onChange: (value) => updateSettings({ x: value }),
              }),
              React.createElement(NumberInput, {
                label: "Y (%)",
                value: settings.y,
                min: -100,
                max: 200,
                disabled: busy,
                onChange: (value) => updateSettings({ y: value }),
              }),
            ),
          )
        : null,
    );
  }

  function FastFigureProjectDataTree() {
    const state = useAppState();
    const assetApi = window.FastFigureApi.assets;
    const snapshot = assetApi.readTree();
    const selectedSlotId = window.FastFigureApi.slots.readSelected()?.id;
    const [expanded, setExpanded] = useState(() => new Set(["/assets", "/slots"]));
    const [lastDirectory, setLastDirectory] = useState("/assets");
    const [folderDialog, setFolderDialog] = useState({
      opened: false,
      parent: "/assets",
      name: "New Folder",
    });
    const [trashDialog, setTrashDialog] = useState(null);
    const [movePicker, setMovePicker] = useState(null);
    const [moveConfirm, setMoveConfirm] = useState(null);
    const dragNodeRef = useRef(null);
    const { choosePlan: chooseTreeImportPlan, modal: treeImportCollisionModal } =
      useProjectAssetImportCollision();
    const busy = state.lifecycle !== "ready";
    const directories = [...new Set(snapshot.directories)]
      .filter((path) => path === "/assets" || path.startsWith("/assets/"))
      .sort((a, b) => a.localeCompare(b));

    const openFolderDialog = () => {
      const selectedDirectory =
        state.assetSelection === "directory" ? state.assetPath : lastDirectory;
      const parent =
        typeof selectedDirectory === "string" &&
        (selectedDirectory === "/assets" || selectedDirectory.startsWith("/assets/")) &&
        !assetApi.isTrashed(selectedDirectory)
          ? selectedDirectory
          : "/assets";
      setFolderDialog({ opened: true, parent, name: "New Folder" });
    };
    const closeFolderDialog = () =>
      setFolderDialog((current) => ({ ...current, opened: false }));
    const createFolderFromMantine = () => {
      try {
        setLastDirectory(assetApi.createDirectory(folderDialog.parent, folderDialog.name));
        closeFolderDialog();
      } catch (error) {
        status(`폴더 생성 오류: ${error.message}`);
      }
    };
    const trashSelected =
      state.assetSelection === "directory" && state.assetPath === PROJECT_TRASH_DIRECTORY;
    const trash = assetApi.readTrash();
    const trashHasContents = trash.hasContents;
    const openTrashDialog = () => {
      if (!trashSelected || !trashHasContents) return;
      setTrashDialog({ referenceCount: trash.referenceCount });
    };
    const closeTrashDialog = () => setTrashDialog(null);
    const emptyTrashFromMantine = () => {
      try {
        assetApi.emptyTrash();
        closeTrashDialog();
      } catch (error) {
        status(`휴지통 비우기 오류: ${error.message}`);
      }
    };
    const rewriteExpandedAfterMove = (source, destination) => {
      setExpanded((current) => {
        const next = new Set();
        current.forEach((path) => {
          next.add(
            projectPathInDirectory(path, source)
              ? `${destination}${path.slice(source.length)}`
              : path,
          );
        });
        return next;
      });
      setLastDirectory((current) =>
        projectPathInDirectory(current, source)
          ? `${destination}${current.slice(source.length)}`
          : current,
      );
    };
    const executeProjectNodeMove = (plan, useUniqueName = false) => {
      if (!plan) return;
      try {
        const result = assetApi.move(plan, useUniqueName);
        if (plan.kind === "directory" && !result.trashed)
          rewriteExpandedAfterMove(plan.path, result.path);
        setMovePicker(null);
        setMoveConfirm(null);
      } catch (error) {
        status(`프로젝트 항목 이동 오류: ${error.message}`);
      }
    };
    const requestProjectNodeMove = (path, directory) => {
      try {
        const plan = assetApi.planMove(path, directory);
        if (!plan) {
          setMovePicker(null);
          return;
        }
        if (plan.collision || (plan.enteringTrash && plan.referenceCount > 0))
          setMoveConfirm(plan);
        else executeProjectNodeMove(plan);
      } catch (error) {
        status(`프로젝트 항목 이동 오류: ${error.message}`);
      }
    };
    const toggleExpanded = (path) => {
      setExpanded((current) => {
        const next = new Set(current);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      });
    };
    const csvReferenceCount = (id) =>
      snapshot.charts.reduce(
        (count, chart) => count + chart.csvReferences.filter((csvId) => csvId === id).length,
        0,
      );
    const imageReferenceCount = (id) =>
      snapshot.slots.filter((slot) => slot.imageId === id).length;
    const assetRow = (asset, kind) => {
      const inactive = assetApi.isTrashed(asset.path);
      const selected = state.assetSelection === kind && state.assetPath === asset.path;
      const movable = assetApi.movable(asset.path);
      const meta =
        kind === "csv"
          ? `${asset.readable ? `${asset.rowCount}행` : "읽기 실패"} · 참조 ${csvReferenceCount(asset.id)}`
          : `참조 ${imageReferenceCount(asset.id)}`;
      return React.createElement(
        Group,
        {
          key: `${kind}:${asset.path}`,
          gap: 2,
          wrap: "nowrap",
          draggable: movable,
          onDragStart: (event) => {
            if (!movable) return event.preventDefault();
            dragNodeRef.current = { path: asset.path };
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", asset.path);
          },
          onDragEnd: () => {
            dragNodeRef.current = null;
          },
        },
        React.createElement(
          Button,
          {
            variant: selected ? "filled" : "subtle",
            size: "xs",
            fullWidth: true,
            disabled: inactive,
            justify: "space-between",
            onClick: () =>
              kind === "csv" ? assetApi.selectCsv(asset.path) : assetApi.selectImage(asset.path),
          },
          React.createElement(Text, { component: "span" }, projectPathName(asset.path)),
          React.createElement(Text, { component: "span", c: "dimmed" }, meta),
        ),
        React.createElement(
          Menu,
          { position: "bottom-end", withinPortal: true },
          React.createElement(
            Menu.Target,
            null,
            React.createElement(
              ActionIcon,
              {
                variant: "subtle",
                size: "sm",
                disabled: inactive,
                "aria-label": `${projectPathName(asset.path)} 작업`,
              },
              "···",
            ),
          ),
          React.createElement(
            Menu.Dropdown,
            null,
            React.createElement(
              Menu.Item,
              { onClick: () => assetApi.download(asset.path) },
              "다운로드",
            ),
            movable
              ? React.createElement(
                  Menu.Item,
                  {
                    onClick: () =>
                      setMovePicker({
                        path: asset.path,
                        directory: projectParentPath(asset.path),
                      }),
                  },
                  "이동…",
                )
              : null,
            movable
              ? React.createElement(
                  Menu.Item,
                  {
                    onClick: () =>
                      requestProjectNodeMove(asset.path, PROJECT_TRASH_DIRECTORY),
                  },
                  "휴지통으로 이동",
                )
              : null,
          ),
        ),
      );
    };
    const directoryNode = (path) => {
      const selected = state.assetSelection === "directory" && state.assetPath === path;
      const movable = assetApi.movable(path);
      const childDirectories = directories.filter(
        (candidate) => candidate !== path && projectParentPath(candidate) === path,
      );
      const childAssets = [
        ...snapshot.data
          .filter((asset) => projectParentPath(asset.path) === path)
          .map((asset) => assetRow(asset, "csv")),
        ...snapshot.images
          .filter((asset) => projectParentPath(asset.path) === path)
          .map((asset) => assetRow(asset, "image")),
      ];
      const open = expanded.has(path);
      return React.createElement(
        Stack,
        {
          key: path,
          gap: 2,
          draggable: movable,
          onDragStart: (event) => {
            if (!movable) return event.preventDefault();
            dragNodeRef.current = { path };
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", path);
          },
          onDragEnd: () => {
            dragNodeRef.current = null;
          },
          onDragOver: (event) => allowTreeFolderDrop(event, path),
          onDrop: (event) => dropOnTreeFolder(event, path),
        },
        React.createElement(
          Group,
          { gap: 2, wrap: "nowrap" },
          React.createElement(
            Button,
            {
              variant: selected ? "filled" : "subtle",
              size: "xs",
              fullWidth: true,
              justify: "flex-start",
              "aria-expanded": open,
              onClick: () => {
                setLastDirectory(path);
                assetApi.selectDirectory(path);
                toggleExpanded(path);
              },
            },
            `${open ? "▾" : "▸"} ${path === "/assets" ? "/assets" : projectPathName(path)}`,
          ),
          movable
            ? React.createElement(
                Menu,
                { position: "bottom-end", withinPortal: true },
                React.createElement(
                  Menu.Target,
                  null,
                  React.createElement(
                    ActionIcon,
                    {
                      variant: "subtle",
                      size: "sm",
                      "aria-label": `${projectPathName(path)} 폴더 작업`,
                    },
                    "···",
                  ),
                ),
                React.createElement(
                  Menu.Dropdown,
                  null,
                  React.createElement(
                    Menu.Item,
                    {
                      onClick: () =>
                        setMovePicker({
                          path,
                          directory: projectParentPath(path),
                        }),
                    },
                    "이동…",
                  ),
                  React.createElement(
                    Menu.Item,
                    {
                      onClick: () =>
                        requestProjectNodeMove(path, PROJECT_TRASH_DIRECTORY),
                    },
                    "휴지통으로 이동",
                  ),
                ),
              )
            : null,
        ),
        open
          ? React.createElement(
              Stack,
              { gap: 2, pl: "md" },
              ...childDirectories.map(directoryNode),
              ...childAssets,
            )
          : null,
      );
    };
    const visibleSlots = snapshot.slots
      .filter((slot) => !slot.hidden)
      .sort((a, b) => a.row - b.row || a.col - b.col);
    const slotReference = (slot) => {
      if (slot.contentType === "image") {
        const image = snapshot.images.find((item) => item.id === slot.imageId);
        return image ? `${image.name} · ${image.path}` : "(에셋 없음)";
      }
      const chart = snapshot.charts.find((item) => item.id === slot.chart);
      if (!chart) return "(에셋 없음)";
      if (chart.editable === false) return "Plotly JSON 내부 데이터 · 외부 참조 없음";
      const references = chart.csvIds
        .map((id) => snapshot.data.find((item) => item.id === id))
        .filter(Boolean)
        .map((csv) => `${csv.name} · ${csv.path}`);
      return references.length ? references.join(", ") : "(에셋 없음)";
    };
    const draggedProjectAsset = (event) => {
      const path =
        dragNodeRef.current?.path || event.dataTransfer?.getData("text/plain") || "";
      return assetApi.draggableAsset(path);
    };
    const allowProjectAssetSlotDrop = (event) => {
      const dragged = draggedProjectAsset(event);
      if (!dragged) return false;
      event.preventDefault();
      event.dataTransfer.dropEffect = "link";
      return true;
    };
    const dropProjectAssetOnSlot = (event, slot) => {
      const dragged = draggedProjectAsset(event);
      dragNodeRef.current = null;
      if (!dragged) return;
      event.preventDefault();
      try {
        assetApi.connectToSlot(dragged.path, dragged.kind, slot.id);
      } catch (error) {
        status(`슬롯 연결 오류: ${error.message}`);
      }
    };
    const externalFiles = (event) => Array.from(event.dataTransfer?.files || []);
    const allowExternalFileDrop = (event) => {
      if (!dataTransferHasFiles(event.dataTransfer)) return false;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "copy";
      return true;
    };
    const importExternalFilesToDirectory = async (event, directory) => {
      const files = externalFiles(event);
      if (!files.length) return;
      event.preventDefault();
      event.stopPropagation();
      try {
        await assetApi.importToDirectory(files, directory, chooseTreeImportPlan);
        status(`${directory}에 외부 파일 ${files.length}개를 가져왔습니다.`);
      } catch (error) {
        status(`폴더 가져오기 실패: ${error.message}`);
        debugLog("mantine:folder-drop-error", { directory, message: error.message }, "error");
      }
    };
    const importExternalFileToSlot = async (event, slot) => {
      const files = externalFiles(event);
      event.preventDefault();
      event.stopPropagation();
      if (files.length !== 1)
        return status("슬롯에는 한 번에 외부 파일 하나만 놓을 수 있습니다.");
      await runLifecycleTask("importing", "ASSET_TREE_DROP", () =>
        assetApi.importToSlot(files[0], slot.id, chooseTreeImportPlan));
    };
    const allowTreeFolderDrop = (event, path) => {
      if (dataTransferHasFiles(event.dataTransfer)) {
        if (assetApi.isTrashed(path)) return false;
        return allowExternalFileDrop(event);
      }
      const source = dragNodeRef.current?.path;
      if (!source || source === path) return false;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      return true;
    };
    const dropOnTreeFolder = (event, path) => {
      if (dataTransferHasFiles(event.dataTransfer))
        return importExternalFilesToDirectory(event, path);
      const source =
        dragNodeRef.current?.path || event.dataTransfer.getData("text/plain");
      dragNodeRef.current = null;
      if (!source || source === path) return;
      event.preventDefault();
      event.stopPropagation();
      requestProjectNodeMove(source, path);
    };

    return React.createElement(
      Stack,
      { gap: "xs", px: "md", pb: "md" },
      React.createElement(Text, { fw: 600, size: "sm" }, "PROJECT DATA"),
      React.createElement(
        Button,
        {
          variant: "light",
          size: "xs",
          disabled: busy,
          onClick: openFolderDialog,
        },
        "새 폴더",
      ),
      React.createElement(
        Modal,
        {
          opened: folderDialog.opened,
          onClose: closeFolderDialog,
          title: "새 폴더",
          },
        React.createElement(
          Stack,
          { gap: "sm" },
          React.createElement(Text, { size: "sm", c: "dimmed" }, `위치: ${folderDialog.parent}`),
          React.createElement(TextInput, {
            label: "폴더 이름",
            value: folderDialog.name,
            autoFocus: true,
            onChange: (event) =>
              setFolderDialog((current) => ({ ...current, name: event.target.value })),
            onKeyDown: (event) => {
              if (event.key !== "Enter" || event.nativeEvent?.isComposing) return;
              event.preventDefault();
              createFolderFromMantine();
            },
          }),
          React.createElement(
            Group,
            { justify: "flex-end", gap: "xs" },
            React.createElement(Button, { variant: "light", onClick: closeFolderDialog }, "취소"),
            React.createElement(Button, { onClick: createFolderFromMantine }, "만들기"),
          ),
        ),
      ),
      trashSelected
        ? React.createElement(
            Button,
            {
              variant: "light",
              size: "xs",
              disabled: busy || !trashHasContents,
              onClick: openTrashDialog,
            },
            "휴지통 비우기",
          )
        : null,
      React.createElement(
        Modal,
        {
          opened: !!trashDialog,
          onClose: closeTrashDialog,
          title: "휴지통 비우기",
          },
        trashDialog
          ? React.createElement(
              Stack,
              { gap: "sm" },
              React.createElement(
                Text,
                null,
                trashDialog.referenceCount
                  ? `휴지통 자산에 남아 있는 참조 ${trashDialog.referenceCount}개도 함께 제거됩니다. 휴지통의 폴더와 파일을 영구적으로 비우시겠습니까?`
                  : "휴지통의 폴더와 파일을 영구적으로 비우시겠습니까?",
              ),
              React.createElement(
                Group,
                { justify: "flex-end", gap: "xs" },
                React.createElement(Button, { variant: "light", onClick: closeTrashDialog }, "취소"),
                React.createElement(Button, { onClick: emptyTrashFromMantine }, "비우기"),
              ),
            )
          : null,
      ),
      React.createElement(
        Modal,
        {
          opened: !!movePicker,
          onClose: () => setMovePicker(null),
          title: "프로젝트 항목 이동",
          },
        movePicker
          ? React.createElement(
              Stack,
              { gap: "sm" },
              React.createElement(
                Text,
                { size: "sm", c: "dimmed" },
                `이동: ${movePicker.path}`,
              ),
              React.createElement(Select, {
                label: "대상 폴더",
                value: movePicker.directory,
                data: assetApi.moveOptions(movePicker.path)
                  .map((directory) => ({ value: directory, label: directory })),
                allowDeselect: false,
                searchable: true,
                onChange: (value) =>
                  value &&
                  setMovePicker((current) => ({
                    ...current,
                    directory: value,
                  })),
              }),
              React.createElement(
                Group,
                { justify: "flex-end", gap: "xs" },
                React.createElement(
                  Button,
                  { variant: "light", onClick: () => setMovePicker(null) },
                  "취소",
                ),
                React.createElement(
                  Button,
                  {
                    onClick: () =>
                      requestProjectNodeMove(movePicker.path, movePicker.directory),
                  },
                  "이동",
                ),
              ),
            )
          : null,
      ),
      React.createElement(
        Modal,
        {
          opened: !!moveConfirm,
          onClose: () => setMoveConfirm(null),
          title: moveConfirm?.collision ? "이름 충돌" : "휴지통으로 이동",
          },
        moveConfirm
          ? React.createElement(
              Stack,
              { gap: "sm" },
              React.createElement(
                Text,
                { style: { whiteSpace: "pre-wrap" } },
                [
                  moveConfirm.collision
                    ? `${moveConfirm.destination}가 이미 존재합니다.\n${moveConfirm.uniqueName} 이름으로 이동할 수 있습니다.`
                    : null,
                  moveConfirm.enteringTrash && moveConfirm.referenceCount > 0
                    ? `이 항목을 휴지통으로 이동하면 그래프·슬롯 참조 ${moveConfirm.referenceCount}개가 제거됩니다.`
                    : null,
                ]
                  .filter(Boolean)
                  .join("\n\n"),
              ),
              React.createElement(
                Group,
                { justify: "flex-end", gap: "xs" },
                React.createElement(
                  Button,
                  { variant: "light", onClick: () => setMoveConfirm(null) },
                  "취소",
                ),
                React.createElement(
                  Button,
                  {
                    onClick: () =>
                      executeProjectNodeMove(moveConfirm, moveConfirm.collision),
                  },
                  moveConfirm.collision ? "새 이름으로 이동" : "이동",
                ),
              ),
            )
          : null,
      ),
      treeImportCollisionModal,
      directoryNode("/assets"),
      React.createElement(
        Button,
        {
          variant: "subtle",
          size: "xs",
          fullWidth: true,
          justify: "flex-start",
          "aria-expanded": expanded.has("/slots"),
          onClick: () => toggleExpanded("/slots"),
        },
        `${expanded.has("/slots") ? "▾" : "▸"} /slots`,
      ),
      expanded.has("/slots")
        ? React.createElement(
            Stack,
            { gap: 2, pl: "md" },
            ...(visibleSlots.length
              ? visibleSlots.map((slot) =>
                  React.createElement(
                    Button,
                    {
                      key: slot.id,
                      variant: state.workspace !== "project" && selectedSlotId === slot.id ? "filled" : "subtle",
                      size: "xs",
                      fullWidth: true,
                      justify: "flex-start",
                      disabled: busy,
                      onClick: () => window.FastFigureApi.slots.select(slot.id),
                      onDragOver: (event) => {
                        if (dataTransferHasFiles(event.dataTransfer))
                          return allowExternalFileDrop(event);
                        return allowProjectAssetSlotDrop(event);
                      },
                      onDrop: (event) => {
                        if (dataTransferHasFiles(event.dataTransfer))
                          return importExternalFileToSlot(event, slot);
                        return dropProjectAssetOnSlot(event, slot);
                      },
                    },
                    `[row=${slot.row},col=${slot.col}] — ${slotReference(slot)}`,
                  ),
                )
              : [React.createElement(Text, { key: "empty", size: "xs", c: "dimmed" }, "(표시 슬롯 없음)")]),
          )
        : null,
    );
  }
  function FastFigureProjectActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const importResetRef = useRef(null);
    const projectApi = window.FastFigureApi.project;

    const openProjectImportPicker = (open) => {
      if (window.FastFigureApi.slots.readSelected())
        return status("프로젝트 불러오기는 슬롯 선택을 해제한 뒤 사용할 수 있습니다.");
      open();
    };
    const importProjectFileFromMantine = async (file) => {
      if (!file) return;
      try {
        await runLifecycleTask("importing", "PROJECT_IMPORT", async () => {
          try {
            await projectApi.importFile(file);
            status(`${file.name} 프로젝트를 불러왔습니다.`);
          } catch (error) {
            status("프로젝트 불러오기 오류: " + error.message);
            debugLog("project:import-error", { message: error.message });
          }
        });
      } finally {
        importResetRef.current?.();
      }
    };

    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "프로젝트"),
      React.createElement(TextInput, {
        key: `project-name-${projectApi.readName()}`,
        label: "프로젝트 이름",
        defaultValue: projectApi.readName(),
        disabled: busy,
        onChange: (event) => {
          projectApi.setName(event.target.value);
        },
        onBlur: (event) => {
          event.target.value = projectApi.setName(event.target.value, true);
        },
      }),
      React.createElement(
        Group,
        { gap: "xs" },
        React.createElement(
          Button,
          { variant: "light", disabled: busy, onClick: exportProjectFromMantine },
          "FFPX 내보내기",
        ),
        React.createElement(
          FileButton,
          {
            onChange: importProjectFileFromMantine,
            resetRef: importResetRef,
            disabled: busy,
          },
          (props) =>
            React.createElement(
              Button,
              {
                ...props,
                variant: "light",
                disabled: busy,
                onClick: () => openProjectImportPicker(props.onClick),
              },
              "FFPX 불러오기",
            ),
        ),
      ),
    );
  }

  function FastFigureGraphDataEditor() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const dragRef = useRef(null);
    if (state.workspace !== "slot.graph") return null;
    const graphApi = window.FastFigureApi.graphs;
    const editor = graphApi.readData();
    const objects = editor.objects;
    const selectedIndex = editor.selectedIndex;
    const selected = selectedIndex === null ? null : objects[selectedIndex];
    const activeCsv = editor.csv;
    const csvOptions = editor.csvOptions;
    const columns = activeCsv?.columns || [];
    const columnOptions = columns.map((column) => ({ value: column.id, label: column.label }));
    const update = (values) => selectedIndex !== null && graphApi.setObjectValues(selectedIndex, values);
    const selectField = (label, key, data) => React.createElement(Select, {
      label, data, value: selected?.[key] ?? null, disabled: busy,
      onChange: (value) => value !== null && update({ [key]: value }),
    });
    const numberField = (label, key, min, max, step = 1) => React.createElement(NumberInput, {
      label, value: selected?.[key], min, max, step, disabled: busy,
      onChange: (value) => update({ [key]: value }),
    });
    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "그래프 / 데이터"),
      React.createElement(Select, {
        label: "사용할 CSV", data: csvOptions, value: activeCsv ? String(activeCsv.id) : null,
        disabled: busy || !csvOptions.length,
        onChange: (value) => value !== null && graphApi.selectCsv(Number(value)),
      }),
      activeCsv ? React.createElement(NumberInput, {
        label: "헤더 행 수", value: activeCsv.headerLines, min: 0, max: activeCsv.rowCount,
        allowDecimal: false, disabled: busy,
        onChange: (value) => graphApi.setHeaderLines(activeCsv.id, value),
      }) : null,
      activeCsv && columns.length
        ? React.createElement(
            ScrollArea,
            { h: 220, type: "auto" },
            React.createElement(
              Table,
              { fz: "xs" },
              React.createElement(
                TableThead,
                null,
                React.createElement(
                  TableTr,
                  null,
                  ...columns.map((column) =>
                    React.createElement(TableTh, { key: column.id }, column.label),
                  ),
                ),
              ),
              React.createElement(
                TableTbody,
                null,
                ...activeCsv.rows.map((row, rowIndex) =>
                  React.createElement(
                    TableTr,
                    { key: rowIndex },
                    ...columns.map((column) =>
                      React.createElement(
                        TableTd,
                        {
                          key: column.id,
                          fw: rowIndex < activeCsv.headerLines ? 600 : 400,
                        },
                        String(row?.[column.index] ?? ""),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          )
        : null,
      React.createElement(Group, { gap: "xs", grow: true },
        React.createElement(Button, {
          variant: editor.editable ? "filled" : "light", disabled: busy || !editor.chartId,
          onClick: () => graphApi.setEditable(!editor.editable),
        }, editor.editable ? "편집 가능" : "원본 JSON"),
        React.createElement(Button, {
          variant: "light", disabled: busy || !activeCsv || !editor.editable,
          onClick: () => activeCsv && graphApi.addObject(activeCsv.id),
        }, "오브젝트 추가"),
      ),
      React.createElement(Text, { size: "sm", fw: 600 }, "그래프 오브젝트"),
      objects.length ? React.createElement(Stack, { gap: 4 },
        ...objects.map((object, index) => React.createElement(Group, {
          key: `${editor.chartId}-${index}`, gap: 4, wrap: "nowrap", draggable: true,
          onDragStart: () => { dragRef.current = index; },
          onDragEnd: () => { dragRef.current = null; },
          onDragOver: (event) => event.preventDefault(),
          onDrop: (event) => {
            event.preventDefault();
            if (Number.isInteger(dragRef.current)) graphApi.moveObject(dragRef.current, index);
            dragRef.current = null;
          },
        },
          React.createElement(Button, {
            size: "xs", variant: selectedIndex === index ? "filled" : "light",
            style: { flex: "1 1 auto", minWidth: 0 },
            onClick: () => graphApi.selectObject(index),
          }, `${index + 1}. ${object.legendName || `${object.x} · ${object.y}`}`),
          React.createElement(ColorInput, {
            size: "xs", value: object.color, style: { width: 72 }, disabled: busy,
            onChange: (color) => graphApi.setObjectValues(index, { color }),
          }),
          React.createElement(ActionIcon, {
            size: "sm", variant: "subtle", disabled: busy,
            "aria-label": `${index + 1}번 그래프 오브젝트 삭제`,
            onClick: () => graphApi.deleteObject(index),
          }, "×"),
        )),
      ) : React.createElement(Text, { size: "xs", c: "dimmed" }, "추가된 그래프 오브젝트가 없습니다."),
      selected && activeCsv && editor.editable ? React.createElement(Stack, { gap: "xs" },
        React.createElement(Select, {
          label: "오브젝트 CSV", data: csvOptions, value: String(selected.csvId), disabled: busy,
          onChange: (value) => value !== null && update({ csvId: Number(value) }),
        }),
        React.createElement(Group, { gap: "xs", grow: true },
          selectField("X 열", "x", columnOptions), selectField("Y 열", "y", columnOptions),
        ),
        React.createElement(Group, { gap: "xs", grow: true },
          selectField("X 축", "xAxisSide", [{ value: "bottom", label: "아래" }, { value: "top", label: "위" }]),
          selectField("Y 축", "yAxisSide", [{ value: "left", label: "왼쪽" }, { value: "right", label: "오른쪽" }]),
        ),
        selectField("유형", "type", [
          { value: "scatter", label: "선" }, { value: "markers", label: "마커" },
          { value: "lines+markers", label: "선 + 마커" }, { value: "bar", label: "막대" },
          { value: "hidden", label: "숨김" },
        ]),
        React.createElement(TextInput, {
          label: "범례 이름", value: selected.legendName, disabled: busy,
          onChange: (event) => update({ legendName: event.target.value }),
        }),
        ["scatter", "lines+markers", "hidden"].includes(selected.type) ? React.createElement(Group, { gap: "xs", grow: true },
          numberField("선 굵기", "lineWidth", 0.1, 20, 0.1),
          React.createElement(TextInput, {
            label: "선 스타일", value: selected.lineDash, disabled: busy,
            onChange: (event) => update({ lineDash: event.target.value }),
          }),
        ) : null,
        ["markers", "lines+markers"].includes(selected.type) ? React.createElement(Group, { gap: "xs", grow: true },
          React.createElement(TextInput, {
            label: "마커", value: selected.markerSymbol, disabled: busy,
            onChange: (event) => update({ markerSymbol: event.target.value }),
          }),
          numberField("마커 크기", "markerSize", 1, 40),
        ) : null,
        selected.type === "bar" ? React.createElement(Group, { gap: "xs", grow: true },
          numberField("막대 불투명도", "barOpacity", 0.05, 1, 0.05),
          numberField("막대 테두리", "barLineWidth", 0, 10, 0.1),
        ) : null,
      ) : null,
    );
  }
  function FastFigureGraphLayoutEditor() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    if (state.workspace !== "slot.graph") return null;
    const graphApi = window.FastFigureApi.graphs;
    const editor = graphApi.readLayout();
    if (!editor) return null;
    const settings = editor.settings;
    const editable = editor.editable;
    const axisLabels = {
      xBottom: "아래 X축",
      xTop: "위 X축",
      yLeft: "왼쪽 Y축",
      yRight: "오른쪽 Y축",
    };
    const updateGlobal = (values) => graphApi.updateLayout({ globalSettings: values });
    const updateTitle = (title) => graphApi.updateLayout({ title });
    const updateAxis = (key, values) => graphApi.updateLayout({ axisKey: key, axisValues: values });
    const toggleGlobal = (key, label) =>
      React.createElement(
        Button,
        {
          size: "xs",
          variant: settings[key] ? "filled" : "light",
          disabled: busy || !editable,
          "aria-pressed": settings[key],
          onClick: () => updateGlobal({ [key]: !settings[key] }),
        },
        label,
      );
    const axisNumber = (key, axis, field, label, options = {}) =>
      React.createElement(NumberInput, {
        label,
        value: axis[field],
        disabled: busy || !editable,
        ...options,
        onChange: (value) =>
          updateAxis(key, {
            [field]: value === "" ? "" : String(value),
          }),
      });
    const axisToggle = (key, axis, field, label) =>
      React.createElement(
        Button,
        {
          size: "xs",
          variant: axis[field] ? "filled" : "light",
          disabled: busy || !editable,
          "aria-pressed": axis[field],
          onClick: () => updateAxis(key, { [field]: !axis[field] }),
        },
        label,
      );
    const axisEditor = (key) => {
      const axis = settings.axes[key];
      const logScale = axis.scaleType === "log";
      return React.createElement(
        Stack,
        { key, gap: "xs" },
        React.createElement(Text, { size: "sm", fw: 600 }, axisLabels[key]),
        React.createElement(TextInput, {
          label: "축 이름",
          value: axis.title,
          disabled: busy || !editable,
          onChange: (event) => updateAxis(key, { title: event.target.value }),
        }),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          axisNumber(key, axis, "min", "최소"),
          axisNumber(key, axis, "max", "최대"),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(
            Button,
            {
              variant:
                logScale
                  ? axis.minorTicks
                    ? "filled"
                    : "light"
                  : axis.tickMode === "increment"
                    ? "filled"
                    : "light",
              disabled: busy || !editable,
              "aria-pressed": logScale ? axis.minorTicks : axis.tickMode === "increment",
              onClick: () =>
                logScale
                  ? updateAxis(key, { minorTicks: !axis.minorTicks, tickMode: "plotly" })
                  : updateAxis(key, {
                      tickMode: axis.tickMode === "increment" ? "plotly" : "increment",
                    }),
            },
            logScale
              ? axis.minorTicks
                ? "minor tick 표시"
                : "minor tick 숨김"
              : axis.tickMode === "increment"
                ? "increment"
                : "Plotly tick",
          ),
          logScale
            ? null
            : axisNumber(key, axis, "tick", "tick 간격"),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(Select, {
            label: "표기",
            data: [
              { value: "none", label: "숫자" },
              { value: "power", label: "지수" },
              { value: "e", label: "과학 표기" },
            ],
            value: axis.notation,
            disabled: busy || !editable,
            onChange: (value) => value !== null && updateAxis(key, { notation: value }),
          }),
          React.createElement(Select, {
            label: "축 유형",
            data: [
              { value: "linear", label: "선형" },
              { value: "log", label: "로그" },
              { value: "reciprocal", label: "역수" },
            ],
            value: axis.scaleType,
            disabled: busy || !editable,
            onChange: (value) =>
              value !== null &&
              updateAxis(key, {
                scaleType: value,
                tickMode: value === "log" ? "plotly" : axis.tickMode,
              }),
          }),
        ),
        axisNumber(key, axis, "divide", "값 나누기"),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          axisNumber(key, axis, "titleSize", "축 이름 크기"),
          axisNumber(key, axis, "fontSize", "숫자 크기"),
        ),
        axisNumber(key, axis, "lineWidth", "축선 굵기", { min: 0 }),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          axisToggle(key, axis, "showGrid", "격자"),
          axisToggle(key, axis, "visible", "축"),
          axisToggle(key, axis, "showValues", "값"),
        ),
      );
    };

    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "그래프 전역 / 축"),
      React.createElement(TextInput, {
        label: "그래프 제목",
        value: editor.title,
        disabled: busy || !editable,
        onChange: (event) => updateTitle(event.target.value),
      }),
      React.createElement(
        Group,
        { gap: "xs", grow: true },
        toggleGlobal("showLegend", "범례"),
        toggleGlobal("showTitle", "제목"),
        toggleGlobal("showZeroLine", "0선"),
      ),
      React.createElement(Select, {
        label: "그래프 글꼴",
        data: fontSelectData(GRAPH_FONT_OPTIONS, settings.graphFontFamily),
        value: fontSelectValue(settings.graphFontFamily),
        disabled: busy || !editable,
        allowDeselect: false,
        "data-fastfigure-font-select": "graph",
        onChange: (value) => {
          const fontFamily = fontValueFromSelect(value);
          if (fontFamily !== null) updateGlobal({ graphFontFamily: fontFamily });
        },
      }),
      React.createElement(
        Group,
        { gap: "xs", grow: true },
        React.createElement(NumberInput, {
          label: "제목 크기",
          value: settings.titleFontSize,
          disabled: busy || !editable,
          onChange: (value) =>
            updateGlobal({ titleFontSize: value === "" ? "" : String(value) }),
        }),
        React.createElement(NumberInput, {
          label: "범례 크기",
          value: settings.legendFontSize,
          disabled: busy || !editable,
          onChange: (value) =>
            updateGlobal({ legendFontSize: value === "" ? "" : String(value) }),
        }),
      ),
      ...Object.keys(axisLabels).map(axisEditor),
    );
  }
  function FastFigureGraphPaletteActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const importResetRef = useRef(null);
    if (state.workspace !== "slot.graph") return null;
    const graphApi = window.FastFigureApi.graphs;
    const editor = graphApi.readPalette();
    const canEdit = !!editor.chartId && editor.editable;
    const commitColors = (colors) => graphApi.applyPalette(colors);
    const resetPalette = () => {
      if (!editor.chartId) return status("그래프 슬롯을 먼저 선택하세요.");
      commitColors(graphApi.defaultColors());
      debugLog("graphPalette:reset", { slotId: editor.slotId });
    };
    const savePalette = () => {
      if (!editor.chartId) return status("그래프 슬롯을 먼저 선택하세요.");
      const colors = editor.colors.filter(Boolean);
      const blob = new Blob([JSON.stringify({ colors }, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const link = document.createElement("a");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = URL.createObjectURL(blob);
      link.download = `chart-palette-${stamp}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 0);
      debugLog("graphPalette:save", {
        slotId: editor.slotId,
        colors: colors.length,
      });
    };
    const loadPalette = async (file) => {
      if (!file) return;
      try {
        await runLifecycleTask("importing", "PALETTE_IMPORT", async () => {
          try {
            const parsed = JSON.parse(await file.text());
            const colors = Array.isArray(parsed) ? parsed : parsed.colors;
            if (!Array.isArray(colors) || !colors.length)
              throw Error("colors 배열이 없습니다.");
            const valid = colors.filter(
              (color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color),
            );
            if (!valid.length) throw Error("유효한 HEX 색상이 없습니다.");
            commitColors(valid);
            status(`${file.name} 색상 구성을 덮어썼습니다.`);
            debugLog("graphPalette:load", {
              slotId: editor.slotId,
              name: file.name,
              colors: valid.length,
            });
          } catch (error) {
            status("팔레트 불러오기 실패: " + error.message);
            debugLog("graphPalette:load-error", { message: error.message });
            throw error;
          }
        });
      } finally {
        importResetRef.current?.();
      }
    };

    return React.createElement(
      Stack,
      { gap: "xs", px: "md", pb: "md" },
      React.createElement(Text, { fw: 600 }, "그래프 색상 구성"),
      React.createElement(
        Group,
        { gap: "xs", grow: true },
        React.createElement(
          Button,
          { variant: "light", disabled: busy || !canEdit, onClick: resetPalette },
          "기본색",
        ),
        React.createElement(
          Button,
          { variant: "light", disabled: busy || !editor.chartId, onClick: savePalette },
          "저장",
        ),
        React.createElement(
          FileButton,
          {
            onChange: loadPalette,
            accept: ".json,application/json",
            resetRef: importResetRef,
            disabled: busy || !canEdit,
          },
          (props) =>
            React.createElement(
              Button,
              { ...props, variant: "light", disabled: busy || !canEdit },
              "불러오기",
            ),
        ),
      ),
    );
  }
  function FastFigureGraphFileActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const importResetRef = useRef(null);
    if (state.workspace !== "slot.graph") return null;
    const graphApi = window.FastFigureApi.graphs;

    const openSlotImportPicker = (open) => {
      if (!graphApi.hasSelectedSlot())
        return status("FFSX 또는 Plotly JSON을 불러올 슬롯을 먼저 선택하세요.");
      open();
    };
    const importSlotFileFromMantine = async (file) => {
      if (!file) return;
      try {
        await runLifecycleTask("importing", "SLOT_IMPORT", async () => {
          try {
            await graphApi.importFile(file);
          } catch (error) {
            status("슬롯 불러오기 오류: " + error.message);
            debugLog("slot:import-error", { message: error.message });
          }
        });
      } finally {
        importResetRef.current?.();
      }
    };

    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "그래프 파일"),
      React.createElement(
        Group,
        { gap: "xs", grow: true },
        React.createElement(
          Button,
          { variant: "light", disabled: busy, onClick: exportSlotFfsxFromMantine },
          "FFSX 내보내기",
        ),
        React.createElement(
          Button,
          { variant: "light", disabled: busy, onClick: exportPlotlyJsonFromMantine },
          "Plotly JSON 내보내기",
        ),
      ),
      React.createElement(
        FileButton,
        {
          onChange: importSlotFileFromMantine,
          resetRef: importResetRef,
          disabled: busy,
        },
        (props) =>
          React.createElement(
            Button,
            {
              ...props,
              variant: "light",
              disabled: busy,
              onClick: () => openSlotImportPicker(props.onClick),
            },
            "FFSX/Plotly JSON 불러오기",
          ),
      ),
    );
  }

  function FastFigurePaletteActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const appearanceApi = window.FastFigureApi.appearance;
    const [opened, setOpened] = useState(false);
    const [draft, setDraft] = useState(() => ({
      ...appearanceApi.readPalette(),
    }));
    const fields = [
      ["uiColor", "강조색"],
      ["uiBackgroundColor", "UI 배경"],
      ["uiSurfaceColor", "UI 표면"],
      ["uiMutedColor", "보조 텍스트"],
      ["uiSubtleColor", "약한 텍스트"],
      ["uiDisabledBgColor", "비활성 배경"],
      ["uiDisabledTextColor", "비활성 텍스트"],
      ["uiShadowColor", "그림자"],
      ["paperColor", "그래프 배경"],
      ["fontColor", "그래프 글자"],
    ];
    const openPalette = () => {
      setDraft({ ...appearanceApi.readPalette() });
      setOpened(true);
    };
    const applyPalette = () => {
      appearanceApi.setPalette(draft);
      setOpened(false);
    };
    const resetPalette = () => {
      setDraft({ ...appearanceApi.resetPalette() });
    };

    return React.createElement(
      Stack,
      { gap: "xs", px: "md", pb: "md" },
      React.createElement(
        Button,
        { variant: "light", disabled: busy, onClick: openPalette },
        "UI 색상",
      ),
      React.createElement(
        Modal,
        {
          opened,
          onClose: () => setOpened(false),
          title: "UI 색상",
            size: "lg",
        },
        React.createElement(
          Stack,
          { gap: "sm" },
          ...fields.map(([key, label]) =>
            React.createElement(ColorInput, {
              key,
              label,
              value: draft[key],
              disabled: busy,
              onChange: (value) =>
                setDraft((current) => ({ ...current, [key]: value })),
            }),
          ),
          React.createElement(
            Group,
            { justify: "space-between", gap: "xs" },
            React.createElement(
              Button,
              { variant: "light", disabled: busy, onClick: resetPalette },
              "기본값",
            ),
            React.createElement(
              Group,
              { gap: "xs" },
              React.createElement(
                Button,
                { variant: "light", onClick: () => setOpened(false) },
                "취소",
              ),
              React.createElement(
                Button,
                { disabled: busy, onClick: applyPalette },
                "적용",
              ),
            ),
          ),
        ),
      ),
    );
  }

  function FastFigureUtilityActions() {
    const state = useAppState();
    return React.createElement(
      Stack,
      { gap: "xs", p: "md", mt: "auto" },
      React.createElement(
        Button,
        {
          variant: state.overlay === "readme" ? "filled" : "light",
          "aria-expanded": state.overlay === "readme",
          onClick: () => toggleOverlay("readme"),
        },
        "README",
      ),
    );
  }

  function FastFigureStatusDebug() {
    const telemetry = useUiTelemetry();
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    return React.createElement(
      Stack,
      { gap: "xs", px: "md", pb: "md" },
      React.createElement(
        Text,
        {
          size: "sm",
          c: "dimmed",
          "aria-live": "polite",
          style: { whiteSpace: "pre-wrap" },
        },
        telemetry.status || "준비됨",
      ),
      React.createElement(
        Group,
        { gap: "xs", grow: true },
        React.createElement(
          Button,
          {
            size: "xs",
            variant: telemetry.debugEnabled ? "filled" : "light",
            disabled: busy,
            "aria-pressed": telemetry.debugEnabled,
            onClick: () => setDebugEnabled(!telemetry.debugEnabled),
          },
          telemetry.debugEnabled ? "디버깅 끄기" : "디버깅 켜기",
        ),
        React.createElement(
          Button,
          {
            size: "xs",
            variant: "light",
            disabled: busy || !telemetry.debugLines.length,
            onClick: saveDebugOutput,
          },
          "로그 저장",
        ),
        React.createElement(
          Button,
          {
            size: "xs",
            variant: "light",
            disabled: busy || !telemetry.debugLines.length,
            onClick: clearDebugOutput,
          },
          "로그 지우기",
        ),
      ),
      telemetry.debugEnabled
        ? React.createElement(
            ScrollArea,
            { h: 220, type: "auto" },
            React.createElement(
              Code,
              {
                block: true,
                style: {
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                },
              },
              telemetry.debugLines.join("\n"),
            ),
          )
        : null,
    );
  }

  function FastFigureReadmeOverlay() {
    const state = useAppState();
    if (state.overlay !== "readme") return null;
    return React.createElement(
      Modal,
      {
        opened: true,
        onClose: () =>
          appFSM.send("CLOSE_OVERLAY", { reason: "mantine-readme" }),
        title: "Fast figure README",
        size: "xl",
        "data-fastfigure-overlay": "readme",
      },
      React.createElement(
        ScrollArea.Autosize,
        { mah: "75vh", type: "auto" },
        React.createElement(Box, {
          dangerouslySetInnerHTML: { __html: readmeContentHtml() },
        }),
      ),
    );
  }

  function FastFigureLabelOverlay() {
    const state = useAppState();
    const previewRef = useRef(null);
    const dragRef = useRef(null);
    const [, setPreviewRevision] = useState(0);
    if (state.overlay !== "label") return null;
    const busy = state.lifecycle !== "ready";
    const labelApi = window.FastFigureApi.labels;
    const label = labelApi.readState();
    const settings = label.settings;
    const reference = label.reference;
    const previewWidth = 420;
    const previewScale = previewWidth / Math.max(1, reference.width);
    const previewHeight = Math.max(120, reference.height * previewScale);
    const commit = (patch) => labelApi.setSettings(patch);
    const startPreviewDrag = (event) => {
      if (busy) return;
      const rect = event.currentTarget.getBoundingClientRect();
      dragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    };
    const movePreviewDrag = (event) => {
      const drag = dragRef.current;
      const preview = previewRef.current;
      if (!drag || drag.pointerId !== event.pointerId || !preview) return;
      const previewRect = preview.getBoundingClientRect();
      const labelRect = event.currentTarget.getBoundingClientRect();
      const labelWidth = labelRect.width / previewScale;
      const labelHeight = labelRect.height / previewScale;
      const nextX =
        (event.clientX - previewRect.left - drag.offsetX) / previewScale;
      const nextY =
        (event.clientY - previewRect.top - drag.offsetY) / previewScale;
      labelApi.setPosition(
        Math.max(0, Math.min(Math.max(0, reference.width - labelWidth), nextX)),
        Math.max(0, Math.min(Math.max(0, reference.height - labelHeight), nextY)),
      );
      setPreviewRevision((revision) => revision + 1);
    };
    const stopPreviewDrag = (event) => {
      if (dragRef.current?.pointerId !== event.pointerId) return;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      dragRef.current = null;
      labelApi.finishPositionInteraction();
    };
    const close = () => appFSM.send("CLOSE_OVERLAY", { reason: "mantine-label" });

    return React.createElement(
      Modal,
      {
        opened: true,
        onClose: close,
        title: "레이블",
        size: "lg",
        "data-fastfigure-overlay": "label",
      },
      React.createElement(
        Stack,
        { gap: "md" },
        React.createElement(
          Button,
          {
            variant: label.enabled ? "filled" : "light",
            disabled: busy,
            "aria-pressed": label.enabled,
            onClick: () => labelApi.setEnabled(!label.enabled),
          },
          label.enabled ? "레이블 표시" : "레이블 숨김",
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(Select, {
            label: "형식",
            value: settings.format,
            data: [
              { value: "lower-alpha", label: "a, b, c" },
              { value: "upper-alpha", label: "A, B, C" },
              { value: "decimal", label: "1, 2, 3" },
              { value: "lower-roman", label: "i, ii, iii" },
              { value: "upper-roman", label: "I, II, III" },
            ],
            disabled: busy,
            onChange: (value) => value !== null && commit({ format: value }),
          }),
          React.createElement(Select, {
            label: "순서",
            value: settings.order,
            data: [
              { value: "row-major", label: "행 우선" },
              { value: "column-major", label: "열 우선" },
            ],
            disabled: busy,
            onChange: (value) => value !== null && commit({ order: value }),
          }),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(
            Button,
            {
              variant: settings.parentheses ? "filled" : "light",
              disabled: busy,
              "aria-pressed": settings.parentheses,
              onClick: () => commit({ parentheses: !settings.parentheses }),
            },
            "괄호",
          ),
          React.createElement(Select, {
            label: "글꼴",
            data: fontSelectData(ANNOTATION_FONT_OPTIONS, settings.fontFamily),
            value: fontSelectValue(settings.fontFamily),
            disabled: busy,
            allowDeselect: false,
            "data-fastfigure-font-select": "label",
            onChange: (value) => {
              const fontFamily = fontValueFromSelect(value);
              if (fontFamily !== null) commit({ fontFamily });
            },
          }),
          React.createElement(NumberInput, {
            label: "크기",
            value: settings.fontSize,
            min: 6,
            disabled: busy,
            onChange: (value) => {
              const number = Number(value);
              commit({ fontSize: Number.isFinite(number) ? Math.max(6, number) : 14 });
            },
          }),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(NumberInput, {
            label: "X (px)",
            value: settings.x,
            disabled: busy,
            onChange: (value) =>
              labelApi.setPosition(
                Number.isFinite(Number(value)) ? Number(value) : 0,
                settings.y,
              ),
          }),
          React.createElement(NumberInput, {
            label: "Y (px)",
            value: settings.y,
            disabled: busy,
            onChange: (value) =>
              labelApi.setPosition(
                settings.x,
                Number.isFinite(Number(value)) ? Number(value) : 0,
              ),
          }),
          React.createElement(
            Button,
            {
              variant: "light",
              disabled: busy,
              onClick: () => labelApi.resetPosition(),
            },
            "위치 초기화",
          ),
        ),
        React.createElement(
          "div",
          {
            ref: previewRef,
            style: {
              position: "relative",
              width: previewWidth,
              maxWidth: "100%",
              height: previewHeight,
              border: "1px solid var(--mantine-color-default-border)",
              borderRadius: "var(--mantine-radius-sm)",
              overflow: "hidden",
              touchAction: "none",
            },
          },
          React.createElement(
            "div",
            {
              role: "button",
              tabIndex: 0,
              "aria-label": "레이블 위치 드래그",
              onPointerDown: startPreviewDrag,
              onPointerMove: movePreviewDrag,
              onPointerUp: stopPreviewDrag,
              onPointerCancel: stopPreviewDrag,
              style: {
                position: "absolute",
                left: settings.x * previewScale,
                top: settings.y * previewScale,
                fontFamily: settings.fontFamily,
                fontSize: settings.fontSize * previewScale,
                fontWeight: 800,
                lineHeight: 1.2,
                padding: `${2 * previewScale}px ${6 * previewScale}px`,
                cursor: busy ? "default" : "grab",
                userSelect: "none",
                touchAction: "none",
              },
            },
            label.sampleText,
          ),
        ),
      ),
    );
  }

  function FastFigureCaptionOverlay() {
    const state = useAppState();
    const [targetMode, setTargetMode] = useState("global");
    useEffect(() => {
      if (state.overlay !== "caption") setTargetMode("global");
    }, [state.overlay]);
    if (state.overlay !== "caption") return null;
    const busy = state.lifecycle !== "ready";
    const captionApi = window.FastFigureApi.captions;
    const slotApi = window.FastFigureApi.slots;
    const globalCaption = captionApi.readGlobal();
    const selectedSlot = slotApi.readSelected();
    const slotCaption =
      targetMode === "slot" && selectedSlot
        ? captionApi.readSlot(selectedSlot.id)
        : null;
    const settings = globalCaption.settings;
    const close = () => appFSM.send("CLOSE_OVERLAY", { reason: "mantine-caption" });
    const commitSettings = (patch) => captionApi.setSettings(patch);
    const slotMode = targetMode === "slot";

    return React.createElement(
      Modal,
      {
        opened: true,
        onClose: close,
        title: "캡션",
        size: "lg",
        "data-fastfigure-overlay": "caption",
      },
      React.createElement(
        Stack,
        { gap: "md" },
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(
            Button,
            {
              variant: globalCaption.enabled ? "filled" : "light",
              disabled: busy,
              "aria-pressed": globalCaption.enabled,
              onClick: () => captionApi.setEnabled(!globalCaption.enabled),
            },
            globalCaption.enabled ? "캡션 표시" : "캡션 숨김",
          ),
          React.createElement(
            Button,
            {
              variant: slotMode ? "filled" : "light",
              disabled: busy || !selectedSlot,
              "aria-pressed": slotMode,
              onClick: () => setTargetMode(slotMode ? "global" : "slot"),
            },
            "슬롯별 캡션",
          ),
          React.createElement(
            Button,
            {
              variant: "light",
              disabled: busy,
              onClick: () => captionApi.insertSlotCaptions(),
            },
            "슬롯 캡션 삽입",
          ),
        ),
        React.createElement(
          Text,
          { size: "sm", c: "dimmed" },
          slotMode
            ? slotCaption
              ? `대상: ${slotCaption.row}행 ${slotCaption.col}열`
              : "대상 슬롯을 선택하세요."
            : "대상: 전체 캡션",
        ),
        React.createElement(Textarea, {
          label: "내용",
          value: slotMode ? slotCaption?.text ?? "" : globalCaption.text,
          placeholder: slotMode ? "슬롯 캡션" : undefined,
          minRows: 5,
          autosize: true,
          disabled: busy || (slotMode && !slotCaption),
          onChange: (event) =>
            slotMode
              ? slotCaption && captionApi.setSlotText(slotCaption.id, event.target.value)
              : captionApi.setGlobalText(event.target.value),
        }),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(TextInput, {
            label: "이름",
            value: globalCaption.name,
            disabled: busy || slotMode,
            onChange: (event) => captionApi.setName(event.target.value),
          }),
          React.createElement(
            Button,
            {
              variant: globalCaption.nameBold ? "filled" : "light",
              disabled: busy || slotMode,
              "aria-pressed": globalCaption.nameBold,
              onClick: () => captionApi.setNameBold(!globalCaption.nameBold),
            },
            "이름 굵게",
          ),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(Select, {
            label: "글꼴",
            data: fontSelectData(ANNOTATION_FONT_OPTIONS, settings.fontFamily),
            value: fontSelectValue(settings.fontFamily),
            disabled: busy,
            allowDeselect: false,
            "data-fastfigure-font-select": "caption",
            onChange: (value) => {
              const fontFamily = fontValueFromSelect(value);
              if (fontFamily !== null) commitSettings({ fontFamily });
            },
          }),
          React.createElement(NumberInput, {
            label: "크기",
            value: settings.fontSize,
            min: 6,
            max: 96,
            disabled: busy,
            onChange: (value) => commitSettings({ fontSize: value }),
          }),
          React.createElement(NumberInput, {
            label: "줄 간격",
            value: settings.lineHeight,
            min: 0.8,
            max: 4,
            step: 0.05,
            disabled: busy,
            onChange: (value) => commitSettings({ lineHeight: value }),
          }),
        ),
      ),
    );
  }

  function FastFigurePrintOverlay() {
    const state = useAppState();
    const printApi = window.FastFigureApi.print;
    const initial = printApi.readSettings();
    const [width, setWidth] = useState(initial.width);
    const [height, setHeight] = useState(
      initial.heightMode === "explicit" ? initial.height : "",
    );
    const [dpi, setDpi] = useState(initial.dpi);
    const [format, setFormat] = useState(initial.format);
    const [message, setMessage] = useState("");
    useEffect(() => {
      if (state.overlay !== "print") return;
      const saved = printApi.readSettings();
      setWidth(saved.width);
      setHeight(saved.heightMode === "explicit" ? saved.height : "");
      setDpi(saved.dpi);
      setFormat(saved.format);
    }, [state.overlay]);
    if (state.overlay !== "print") return null;
    const busy = state.lifecycle !== "ready";

    const close = () =>
      appFSM.send("CLOSE_OVERLAY", { reason: "mantine-print" });
    const commit = (patch) => {
      const next = printApi.setSettings(patch);
      setWidth(next.width);
      setHeight(next.heightMode === "explicit" ? next.height : "");
      setDpi(next.dpi);
      setFormat(next.format);
      return next;
    };
    const save = () =>
      runLifecycleTask("exporting", "PRINT_EXPORT", () =>
        printApi.save({ onStatus: setMessage }),
      );
    const capture = () =>
      runLifecycleTask("exporting", "CAPTURE_EXPORT", () =>
        printApi.capture({ onStatus: setMessage }),
      );

    return React.createElement(
      Modal,
      {
        opened: true,
        onClose: close,
        title: "프린트 / 내보내기",
        size: "lg",
        "data-fastfigure-overlay": "print",
      },
      React.createElement(
        Stack,
        { gap: "md" },
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(Select, {
            label: "형식",
            value: format,
            data: [
              { value: "png", label: "PNG" },
              { value: "jpeg", label: "JPEG" },
            ],
            disabled: busy,
            onChange: (value) => value !== null && commit({ format: value }),
          }),
          React.createElement(NumberInput, {
            label: "DPI",
            value: dpi,
            min: 36,
            max: 1200,
            disabled: busy,
            onChange: (value) => commit({ dpi: value }),
          }),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(NumberInput, {
            label: "가로 (px)",
            value: width,
            min: 100,
            max: 20000,
            disabled: busy,
            onChange: (value) => commit({ width: value }),
          }),
          React.createElement(NumberInput, {
            label: "세로 (px, 비우면 자동)",
            value: height,
            min: 100,
            max: 20000,
            disabled: busy,
            onChange: (value) => {
              if (value === "" || value === null)
                commit({ heightMode: "auto" });
              else commit({ heightMode: "explicit", height: value });
            },
          }),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(
            Button,
            { disabled: busy, onClick: save },
            "설정 크기로 저장",
          ),
          React.createElement(
            Button,
            { variant: "light", disabled: busy, onClick: capture },
            "현재 화면 캡처",
          ),
        ),
        React.createElement(
          Text,
          { size: "sm", c: "dimmed", "aria-live": "polite" },
          message ||
            "PNG/JPEG, 36–1200 DPI. 세로를 비우면 레이아웃과 캡션에 맞춰 자동 계산합니다.",
        ),
      ),
    );
  }

  function FastFigureLayoutOverlay() {
    const state = useAppState();
    const [layoutSelection, setLayoutSelection] = useState(() => new Set());
    const [previewWidth, setPreviewWidth] = useState(600);
    const previewResizeRef = useRef(null);
    useEffect(() => {
      if (state.overlay !== "layout") setLayoutSelection(new Set());
    }, [state.overlay]);
    if (state.overlay !== "layout") return null;
    const busy = state.lifecycle !== "ready";
    const layoutApi = window.FastFigureApi.layout;
    const layout = layoutApi.readState(previewWidth);
    const style = layout.slotStyle;
    const visibleSlots = layout.visibleSlots;
    const previewGeometry = layout.previewGeometry;

    const clamp = (value, fallback, min, max) => {
      const number = Number(value);
      return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
    };
    const commitStyle = (patch) => layoutApi.setStyle(patch);
    const changeGrid = (patch) => {
      const rows = patch.rows ?? layout.gridRows;
      const cols = patch.cols ?? layout.gridCols;
      layoutApi.setGrid(rows, cols);
      setLayoutSelection(new Set());
    };
    const toggleSlot = (slotId) => {
      setLayoutSelection((current) => {
        const next = new Set(current);
        if (next.has(slotId)) next.delete(slotId);
        else next.add(slotId);
        return next;
      });
    };
    const runLayoutCommand = (command) => {
      const nextSelection = command([...layoutSelection]);
      if (Array.isArray(nextSelection))
        setLayoutSelection(new Set(nextSelection));
    };
    const changeZoom = (value) =>
      layoutApi.setZoom(clamp(value, 100, 50, 200));
    const commitZoom = () => layoutApi.commitZoom();
    const startPreviewResize = (event) => {
      if (busy) return;
      previewResizeRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startWidth: previewWidth,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    };
    const movePreviewResize = (event) => {
      const drag = previewResizeRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const deltaY = event.clientY - drag.startY;
      setPreviewWidth(clamp(drag.startWidth + deltaY * style.aspect, 600, 360, 900));
    };
    const stopPreviewResize = (event) => {
      if (previewResizeRef.current?.pointerId !== event.pointerId) return;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      previewResizeRef.current = null;
    };
    const close = () => appFSM.send("CLOSE_OVERLAY", { reason: "mantine-layout" });

    return React.createElement(
      Modal,
      {
        opened: true,
        onClose: close,
        title: "레이아웃",
        size: "xl",
        "data-fastfigure-overlay": "layout",
      },
      React.createElement(
        Stack,
        { gap: "md" },
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(NumberInput, {
            label: "행",
            value: layout.gridRows,
            min: 1,
            max: 8,
            allowDecimal: false,
            disabled: busy,
            onChange: (value) =>
              changeGrid({ rows: clamp(value, layout.gridRows, 1, 8) }),
          }),
          React.createElement(NumberInput, {
            label: "열",
            value: layout.gridCols,
            min: 1,
            max: 8,
            allowDecimal: false,
            disabled: busy,
            onChange: (value) =>
              changeGrid({ cols: clamp(value, layout.gridCols, 1, 8) }),
          }),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(NumberInput, {
            label: "기준 폭",
            value: style.referenceWidth,
            min: 100,
            max: 20000,
            disabled: busy,
            onChange: (value) =>
              commitStyle({ referenceWidth: clamp(value, style.referenceWidth, 100, 20000) }),
          }),
          React.createElement(NumberInput, {
            label: "간격",
            value: style.gap,
            min: 0,
            max: 2000,
            disabled: busy,
            onChange: (value) => commitStyle({ gap: clamp(value, style.gap, 0, 2000) }),
          }),
          React.createElement(NumberInput, {
            label: "바깥 여백",
            value: style.outerMargin,
            min: 0,
            max: 5000,
            disabled: busy,
            onChange: (value) => commitStyle({ outerMargin: clamp(value, style.outerMargin, 0, 5000) }),
          }),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(NumberInput, {
            label: "모서리 반경",
            value: style.radius,
            min: 0,
            max: 2000,
            disabled: busy,
            onChange: (value) => commitStyle({ radius: clamp(value, style.radius, 0, 2000) }),
          }),
          React.createElement(NumberInput, {
            label: "종횡비",
            value: style.aspect,
            min: 0.1,
            max: 10,
            step: 0.01,
            disabled: busy,
            onChange: (value) => commitStyle({ aspect: clamp(value, style.aspect, 0.1, 10) }),
          }),
          React.createElement(
            Button,
            {
              variant: style.showBorders ? "filled" : "light",
              disabled: busy,
              "aria-pressed": style.showBorders,
              onClick: () => commitStyle({ showBorders: !style.showBorders }),
            },
            "슬롯 외곽선",
          ),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(NumberInput, {
            label: "확대 비율 (%)",
            value: layout.zoom,
            min: 50,
            max: 200,
            disabled: busy || layout.zoomLocked,
            onChange: changeZoom,
            onBlur: commitZoom,
          }),
          React.createElement(
            Button,
            {
              variant: layout.zoomLocked ? "filled" : "light",
              disabled: busy,
              "aria-pressed": layout.zoomLocked,
              onClick: () => layoutApi.setZoomLocked(!layout.zoomLocked),
            },
            layout.zoomLocked ? "크기 고정" : "크기 고정 해제",
          ),
          React.createElement(
            Button,
            {
              variant: "light",
              disabled: busy,
              onClick: () => layoutApi.resetZoom(),
            },
            "100% 초기화",
          ),
        ),
        React.createElement(
          "div",
          {
            role: "grid",
            "aria-label": "레이아웃 슬롯 선택",
            style: {
              display: "grid",
              boxSizing: "border-box",
              width: previewGeometry.width,
              maxWidth: "100%",
              height: previewGeometry.height,
              gridTemplateColumns: `repeat(${layout.gridCols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${layout.gridRows}, minmax(0, 1fr))`,
              gap: previewGeometry.gap,
              padding: previewGeometry.outerMargin,
              border: "1px solid var(--mantine-color-default-border)",
              borderRadius: previewGeometry.radius,
              overflow: "hidden",
            },
          },
          ...visibleSlots.map((slot) => {
            const selected = layoutSelection.has(slot.id);
            return React.createElement(
              UnstyledButton,
              {
                key: slot.id,
                disabled: busy,
                "aria-pressed": selected,
                onClick: () => toggleSlot(slot.id),
                style: {
                  gridColumn: `${slot.col} / span ${slot.colSpan}`,
                  gridRow: `${slot.row} / span ${slot.rowSpan}`,
                  width: "100%",
                  height: "100%",
                  minWidth: 0,
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  borderWidth: 1,
                  borderStyle: style.showBorders ? "solid" : "dashed",
                  borderColor: selected
                    ? "var(--mantine-primary-color-filled)"
                    : "var(--mantine-color-default-border)",
                  background: selected
                    ? "var(--mantine-primary-color-light)"
                    : "transparent",
                  color: "inherit",
                  cursor: busy ? "default" : "pointer",
                },
              },
              `${slot.row},${slot.col}`,
            );
          }),
        ),
        React.createElement(Box, {
          role: "separator",
          "aria-orientation": "horizontal",
          "aria-label": "레이아웃 미리보기 크기 조절",
          onPointerDown: startPreviewResize,
          onPointerMove: movePreviewResize,
          onPointerUp: stopPreviewResize,
          onPointerCancel: stopPreviewResize,
          w: Math.min(previewGeometry.width, 900),
          maw: "100%",
          h: 10,
          style: {
            cursor: "ns-resize",
            touchAction: "none",
            borderTop: "1px solid var(--mantine-color-default-border)",
          },
        }),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(
            Button,
            {
              disabled: busy || layoutSelection.size < 2,
              onClick: () => runLayoutCommand(layoutApi.mergeSlots),
            },
            "선택 슬롯 합치기",
          ),
          React.createElement(
            Button,
            {
              variant: "light",
              disabled: busy || layoutSelection.size < 1,
              onClick: () => runLayoutCommand(layoutApi.splitSlots),
            },
            "선택 슬롯 나누기",
          ),
          React.createElement(
            Button,
            {
              variant: "subtle",
              disabled: busy || layoutSelection.size < 1,
              onClick: () => setLayoutSelection(new Set()),
            },
            "선택 해제",
          ),
        ),
      ),
    );
  }

  function FastFigureDashboardFileDrop() {
    const { choosePlan, modal } = useProjectAssetImportCollision();
    useEffect(() => {
      const dashboard = document.getElementById("dashboard");
      if (!dashboard) return;
      const handleDrop = async (event) => {
        const file = event.dataTransfer?.files?.[0];
        if (!file) return;
        const element = event.target.closest?.(".slot");
        const slotId = element ? Number(element.dataset.slot) : NaN;
        event.preventDefault();
        event.stopPropagation();
        const slotApi = window.FastFigureApi.slots;
        if (!slotApi.prepareFileDrop(slotId)) {
          slotApi.finishFileDrop();
          return;
        }
        try {
          await appFSM.run("importing", "SLOT_DROP_IMPORT", () =>
            window.FastFigureApi.assets.importToSlot(file, slotId, choosePlan));
          debugLog("slot:file-drop", {
            slotId, name: file.name,
            kind: window.FastFigureApi.assets.fileKind(file),
          });
        } catch (error) {
          status("불러오기 실패: " + error.message);
        } finally {
          slotApi.finishFileDrop();
        }
      };
      dashboard.addEventListener("drop", handleDrop, true);
      return () => dashboard.removeEventListener("drop", handleDrop, true);
    }, [choosePlan]);
    return modal;
  }

  function FastFigureShell() {
    const shellGeometry = fastFigureTheme.other.shell;
    const [navbarWidth, setNavbarWidth] = useState(shellGeometry.navbarWidth);
    const [navbarCollapsed, setNavbarCollapsed] = useState(false);
    const navbarDragRef = useRef(null);
    const clampNavbarWidth = (value) =>
      Math.max(shellGeometry.navbarMinWidth, Math.min(shellGeometry.navbarMaxWidth, value));
    useEffect(() => {
      const app = document.querySelector(".app");
      if (!app) return;
      app.style.setProperty(
        "--ff-renderer-navbar-width",
        navbarCollapsed ? "0px" : `${navbarWidth}px`,
      );
      requestAnimationFrame(() => schedulePlotResize());
    }, [navbarWidth, navbarCollapsed]);
    const toggleNavbar = () => {
      setNavbarCollapsed((collapsed) => !collapsed);
    };
    const startNavbarResize = (event) => {
      if (navbarCollapsed) return;
      navbarDragRef.current = event.pointerId;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    };
    const resizeNavbar = (event) => {
      if (navbarDragRef.current !== event.pointerId) return;
      const width = clampNavbarWidth(event.clientX);
      setNavbarWidth(width);
    };
    const stopNavbarResize = (event) => {
      if (navbarDragRef.current !== event.pointerId) return;
      navbarDragRef.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      debugLog("mantine:sidebar-resize", { width: navbarWidth });
    };

    return React.createElement(
      AppShell,
      {
        header: { height: shellGeometry.headerHeight },
        navbar: {
          width: navbarWidth,
          breakpoint: "sm",
          collapsed: { desktop: navbarCollapsed, mobile: navbarCollapsed },
        },
        padding: 0,
      },
      React.createElement(
        AppShell.Header,
        { style: { pointerEvents: "auto" } },
        React.createElement(
          Group,
          { h: "100%", px: "md", gap: "md", wrap: "nowrap" },
          React.createElement(
            Button,
            {
              variant: "light",
              "aria-expanded": !navbarCollapsed,
              onClick: toggleNavbar,
            },
            navbarCollapsed ? "사이드바 표시" : "사이드바 숨기기",
          ),
          React.createElement(Text, { fw: 700, size: "xl", style: { flex: "0 0 auto" } }, "Fast figure"),
          React.createElement(
            Box,
            { style: { flex: "1 1 auto", minWidth: 0 } },
            React.createElement(FastFigureToolbar),
          ),
        ),
      ),
      React.createElement(
        AppShell.Navbar,
        { p: 0, style: { position: "relative", pointerEvents: "auto" } },
        React.createElement(
          ScrollArea,
          { h: "100%", type: "auto" },
          React.createElement(FastFigureDataActions),
          React.createElement(FastFigureImageEditor),
          React.createElement(FastFigureProjectDataTree),
          React.createElement(FastFigureProjectActions),
          React.createElement(FastFigureGraphDataEditor),
          React.createElement(FastFigureGraphLayoutEditor),
          React.createElement(FastFigureGraphPaletteActions),
          React.createElement(FastFigureGraphFileActions),
          React.createElement(FastFigurePaletteActions),
          React.createElement(FastFigureStatusDebug),
          React.createElement(FastFigureUtilityActions),
        ),
        React.createElement(Box, {
          role: "separator",
          "aria-orientation": "vertical",
          "aria-label": "사이드바 너비 조절",
          onPointerDown: startNavbarResize,
          onPointerMove: resizeNavbar,
          onPointerUp: stopNavbarResize,
          onPointerCancel: stopNavbarResize,
          pos: "absolute",
          top: 0,
          right: -shellGeometry.resizeHandleWidth / 2,
          bottom: 0,
          w: shellGeometry.resizeHandleWidth,
          style: {
            cursor: "col-resize",
            touchAction: "none",
          },
        }),
      ),
      React.createElement(AppShell.Main, null),
      React.createElement(FastFigureLabelOverlay),
      React.createElement(FastFigureCaptionOverlay),
      React.createElement(FastFigureLayoutOverlay),
      React.createElement(FastFigurePrintOverlay),
      React.createElement(FastFigureReadmeOverlay),
      React.createElement(FastFigureDashboardFileDrop),
    );
  }

  window.FastFigureMantineUi = Object.freeze({
    FastFigureShell,
    FastFigureToolbar,
    FastFigureDataActions,
    FastFigureImageEditor,
    FastFigureProjectDataTree,
    FastFigureProjectActions,
    FastFigureGraphDataEditor,
    FastFigureGraphLayoutEditor,
    FastFigureGraphPaletteActions,
    FastFigureGraphFileActions,
    FastFigureLabelOverlay,
    FastFigureCaptionOverlay,
    FastFigureLayoutOverlay,
    FastFigurePrintOverlay,
    FastFigureReadmeOverlay,
    FastFigureStatusDebug,
    FastFigureUtilityActions,
    getAppStateSnapshot,
    selectedTargetText,
  });

  function FastFigureApp() {
    useAppState();
    const palette = window.FastFigureApi.appearance.readPalette();
    const theme = createTheme({
      ...fastFigureTheme,
      colors: { ffui: Array(10).fill(palette.uiColor) },
      primaryColor: "ffui",
    });
    const channels = [1, 3, 5].map((index) => {
      const value = parseInt(palette.uiColor.slice(index, index + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    const contrast =
      0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2] > 0.179
        ? "#000000"
        : "#FFFFFF";
    return React.createElement(
      MantineProvider,
      {
        defaultColorScheme: "light",
        theme,
        cssVariablesResolver: (theme) => ({
          variables: {
            "--ff-header-height": `${theme.other.shell.headerHeight}px`,
            "--ff-navbar-width": `${theme.other.shell.navbarWidth}px`,
            ...Object.fromEntries(
              Object.entries(theme.shadows).map(([size, shadow]) => [
                `--mantine-shadow-${size}`,
                shadow.replace(/rgba\(0, 0, 0, (0?\.\d+)\)/g, (_match, opacity) =>
                  `color-mix(in srgb, ${palette.uiShadowColor} ${Number(opacity) * 100}%, transparent)`,
                ),
              ]),
            ),
          },
          light: {
            "--mantine-color-body": palette.uiBackgroundColor,
            "--mantine-color-text": palette.fontColor,
            "--mantine-color-default": palette.uiSurfaceColor,
            "--mantine-color-default-hover": `color-mix(in srgb, ${palette.uiColor} 12%, ${palette.uiSurfaceColor})`,
            "--mantine-color-default-color": palette.fontColor,
            "--mantine-color-default-border": palette.uiColor,
            "--mantine-color-dimmed": palette.uiMutedColor,
            "--mantine-color-placeholder": palette.uiSubtleColor,
            "--mantine-color-disabled": palette.uiDisabledBgColor,
            "--mantine-color-disabled-color": palette.uiDisabledTextColor,
            "--mantine-color-disabled-border": palette.uiDisabledBgColor,
            "--mantine-primary-color-filled": palette.uiColor,
            "--mantine-primary-color-filled-hover": `color-mix(in srgb, ${palette.uiColor} 75%, #64748b)`,
            "--mantine-primary-color-light": `color-mix(in srgb, ${palette.uiColor} 18%, transparent)`,
            "--mantine-primary-color-light-hover": `color-mix(in srgb, ${palette.uiColor} 24%, transparent)`,
            "--mantine-primary-color-light-color": palette.fontColor,
            "--mantine-primary-color-contrast": contrast,
            "--mantine-color-ffui-filled": "var(--mantine-primary-color-filled)",
            "--mantine-color-ffui-filled-hover": "var(--mantine-primary-color-filled-hover)",
            "--mantine-color-ffui-light": "var(--mantine-primary-color-light)",
            "--mantine-color-ffui-light-hover": "var(--mantine-primary-color-light-hover)",
            "--mantine-color-ffui-light-color": "var(--mantine-primary-color-light-color)",
            "--mantine-color-ffui-contrast": "var(--mantine-primary-color-contrast)",
          },
          dark: {},
        }),
      },
      React.createElement(FastFigureShell),
    );
  }

  window.fastFigureUiRoot.render(React.createElement(FastFigureApp));
})();
