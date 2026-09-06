(() => {
  const runtime = window.FastFigureUiRuntime;
  if (!runtime) throw new Error("Fast Figure UI runtime failed to load");
  if (!window.fastFigureUiRoot) throw new Error("Fast Figure React root is not initialized");

  const { React, MantineCore } = runtime;
  const { AppShell, Button, Group, MantineProvider, Stack, Text } = MantineCore;
  const { useSyncExternalStore } = React;

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

  function exportProjectFromMantine() {
    return appFSM
      .run("exporting", "PROJECT_EXPORT", () => downloadProject())
      .catch((error) => {
        debugLog(
          "fsm:lifecycle-task-error",
          { event: "PROJECT_EXPORT", message: error.message },
          "error",
        );
      });
  }

  function openProjectImportPicker() {
    if (getSelectedSlot())
      return status("프로젝트 불러오기는 슬롯 선택을 해제한 뒤 사용할 수 있습니다.");
    document.getElementById("importProjectFile").click();
  }

  function openDataPicker() {
    document.getElementById("file").click();
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
        React.createElement(FastFigureProjectActions),
      ),
      React.createElement(AppShell.Main, null),
    );
  }

  window.FastFigureMantineUi = Object.freeze({
    FastFigureShell,
    FastFigureToolbar,
    FastFigureDataActions,
    FastFigureProjectActions,
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
