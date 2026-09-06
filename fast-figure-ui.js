(() => {
  const runtime = window.FastFigureUiRuntime;
  if (!runtime) throw new Error("Fast Figure UI runtime failed to load");
  if (!window.fastFigureUiRoot) throw new Error("Fast Figure React root is not initialized");

  const { React, MantineCore } = runtime;
  const { AppShell, Button, Group, MantineProvider, Modal, Stack, Text, TextInput } = MantineCore;
  const { useState, useSyncExternalStore } = React;

  function subscribeAppState(onStoreChange) {
    return appFSM.subscribe(onStoreChange);
  }

  function getAppStateSnapshot() {
    return appFSM.state;
  }

  function useAppState() {
    return useSyncExternalStore(subscribeAppState, getAppStateSnapshot, getAppStateSnapshot);
  }

  function selectedTargetText(state) {
    if (state.workspace === "project") return "빈 슬롯 또는 그래프를 선택하세요.";
    const slot = typeof getSelectedSlot === "function" ? getSelectedSlot() : null;
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

  function exportProjectFromMantine() {
    return runLifecycleTask("exporting", "PROJECT_EXPORT", () => downloadProject());
  }

  function openProjectImportPicker() {
    if (getSelectedSlot())
      return status("프로젝트 불러오기는 슬롯 선택을 해제한 뒤 사용할 수 있습니다.");
    document.getElementById("importProjectFile").click();
  }

  function openDataPicker() {
    document.getElementById("file").click();
  }

  function exportSlotFfsxFromMantine() {
    return runLifecycleTask("exporting", "SLOT_EXPORT", () => downloadSlotFfsx());
  }

  function exportPlotlyJsonFromMantine() {
    return runLifecycleTask("exporting", "PLOTLY_EXPORT", () => downloadPlotlyJson());
  }

  function openSlotImportPicker() {
    if (!getSelectedSlot())
      return status("FFSX 또는 Plotly JSON을 불러올 슬롯을 먼저 선택하세요.");
    document.getElementById("importSlotJsonFile").click();
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
    const slot = state.workspace === "project" ? null : getSelectedSlot();
    const slotType = slot?.contentType || "graph";

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
                onClick: () => setSlotContentType("graph"),
              },
              "그래프",
            ),
            React.createElement(
              Button,
              {
                variant: slotType === "image" ? "filled" : "light",
                disabled: busy,
                onClick: () => setSlotContentType("image"),
              },
              "이미지",
            ),
          )
        : null,
      React.createElement(
        Button,
        { variant: "light", disabled: busy, onClick: openDataPicker },
        "데이터 추가",
      ),
      React.createElement(
        Button,
        {
          variant: "light",
          disabled: busy || !["csv", "image"].includes(state.assetSelection),
          onClick: () => downloadProjectAsset(),
        },
        "선택 에셋 다운로드",
      ),
    );
  }

  function FastFigureProjectDataTree() {
    const state = useAppState();
    const snapshot = projectDataTreeSnapshot(projectDataTreeObjects());
    const [expanded, setExpanded] = useState(() => new Set(["/assets", "/slots"]));
    const [lastDirectory, setLastDirectory] = useState("/assets");
    const [folderDialog, setFolderDialog] = useState({
      opened: false,
      parent: "/assets",
      name: "New Folder",
    });
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
        !projectVfs.isTrashed(selectedDirectory)
          ? selectedDirectory
          : "/assets";
      setFolderDialog({ opened: true, parent, name: "New Folder" });
    };
    const closeFolderDialog = () =>
      setFolderDialog((current) => ({ ...current, opened: false }));
    const createFolderFromMantine = () => {
      const payload = {
        parent: folderDialog.parent,
        name: folderDialog.name,
        direction: "ui-to-fsm",
      };
      try {
        appFSM.send("PROJECT_DIRECTORY_CREATED", payload);
        setLastDirectory(payload.path);
        appFSM.send("SELECT_ASSET", {
          kind: "directory",
          path: payload.path,
          direction: "ui-to-fsm",
        });
        status(`${payload.path} 폴더를 만들었습니다.`);
        closeFolderDialog();
      } catch (error) {
        status(`폴더 생성 오류: ${error.message}`);
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
      const inactive = projectVfs.isTrashed(asset.path);
      const selected = state.assetSelection === kind && state.assetPath === asset.path;
      const meta =
        kind === "csv"
          ? `${asset.readable ? `${asset.rowCount}행` : "읽기 실패"} · 참조 ${csvReferenceCount(asset.id)}`
          : `참조 ${imageReferenceCount(asset.id)}`;
      return React.createElement(
        Button,
        {
          key: `${kind}:${asset.path}`,
          variant: selected ? "filled" : "subtle",
          size: "xs",
          fullWidth: true,
          disabled: inactive,
          justify: "space-between",
          onClick: () =>
            kind === "csv" ? selectCsvFromTree(asset.path) : selectImageFromTree(asset.path),
        },
        React.createElement("span", null, projectPathName(asset.path)),
        React.createElement("span", { style: { opacity: 0.7 } }, meta),
      );
    };
    const directoryNode = (path) => {
      const selected = state.assetSelection === "directory" && state.assetPath === path;
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
        { key: path, gap: 2 },
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
              selectDirectoryFromTree(path);
              toggleExpanded(path);
            },
          },
          `${open ? "▾" : "▸"} ${path === "/assets" ? "/assets" : projectPathName(path)}`,
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
          centered: true,
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
                    Text,
                    { key: slot.id, size: "xs" },
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
    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "프로젝트"),
      React.createElement(
        Group,
        { gap: "xs" },
        React.createElement(
          Button,
          { variant: "light", disabled: busy, onClick: exportProjectFromMantine },
          "FFPX 내보내기",
        ),
        React.createElement(
          Button,
          { variant: "light", disabled: busy, onClick: openProjectImportPicker },
          "FFPX 불러오기",
        ),
      ),
    );
  }

  function FastFigureGraphFileActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    if (state.workspace !== "slot.graph") return null;

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
        Button,
        { variant: "light", disabled: busy, onClick: openSlotImportPicker },
        "FFSX/Plotly JSON 불러오기",
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

  function FastFigureShell() {
    return React.createElement(
      AppShell,
      { header: { height: 57 }, navbar: { width: 370, breakpoint: "sm" }, padding: 0 },
      React.createElement(
        AppShell.Header,
        null,
        React.createElement(
          Group,
          { h: "100%", px: "md", gap: "md", wrap: "nowrap" },
          React.createElement(Text, { fw: 700, size: "xl", style: { flex: "0 0 auto" } }, "Fast figure"),
          React.createElement("div", { style: { flex: "1 1 auto", minWidth: 0 } }, React.createElement(FastFigureToolbar)),
        ),
      ),
      React.createElement(
        AppShell.Navbar,
        { p: 0 },
        React.createElement(FastFigureDataActions),
        React.createElement(FastFigureProjectDataTree),
        React.createElement(FastFigureProjectActions),
        React.createElement(FastFigureGraphFileActions),
        React.createElement(FastFigureUtilityActions),
      ),
      React.createElement(AppShell.Main, null),
    );
  }

  window.FastFigureMantineUi = Object.freeze({
    FastFigureShell,
    FastFigureToolbar,
    FastFigureDataActions,
    FastFigureProjectDataTree,
    FastFigureProjectActions,
    FastFigureGraphFileActions,
    FastFigureUtilityActions,
    getAppStateSnapshot,
    selectedTargetText,
  });

  window.fastFigureUiRoot.render(
    React.createElement(
      MantineProvider,
      { defaultColorScheme: "light" },
      React.createElement(FastFigureShell),
    ),
  );
})();
