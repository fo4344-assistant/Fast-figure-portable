// Source: sourcescript/frontend/mantine_ui.py (same logical owner); pseudocode/frontend/mantine_ui.pcal.
import { transformWorkspace, appFSM } from '../application/adapter.js';
import { PROJECT_TRASH_DIRECTORY, projectParentPath, projectPathInDirectory, projectPathName } from '../backend/assets_files.js';
import { bindDashboardFileDropReceiver, clearDebugOutput, dataTransferHasFiles, debugLog, getUiTelemetrySnapshot, renderDashboardFrame, readDebugEnabled, readmeContentHtml, saveDebugOutput, setDebugEnabled, status, subscribeUiTelemetry } from './renderer.js';

// Source DashboardExternalFileDrop: the public import binding owns lifecycle;
// the mounted UI owns only its collision resolver and drag finalization.
export async function dashboardExternalFileDrop(file, slotId, choosePlan, frontendActions) {
  if (!frontendActions.slots.prepareFileDrop(slotId)) return false;
  let failed = false;
  try {
    return await frontendActions.assets.importToSlot(file, slotId, choosePlan);
  } catch (error) {
    failed = true;
    throw error;
  } finally {
    try { frontendActions.slots.finishFileDrop(); }
    catch (error) { if (!failed) throw error; }
  }
}

// pseudocode/frontend/mantine_ui.pcal: UiCommand_* / prepareNumericInput.
const sameUiTarget = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function prepareNumericInput(text, current, allowEmpty = false, emptyValue = null) {
  const value = String(text).trim();
  if (!value) return [allowEmpty, allowEmpty ? emptyValue : current];
  if (!/^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/.test(value)) return [false, current];
  const number = Number(value);
  return Number.isFinite(number) ? [true, number] : [false, current];
}
export class UiCommand {
  constructor(readTarget, readValue, prepare, invoke, stepSize = null) {
    Object.assign(this, { readTarget, readValue, prepare, invoke, stepSize, text: "", editTarget: null,
      editing: false, composing: false, running: false, active: true, changed: () => {} });
  }
  input(text, composing = false) {
    if (!this.active || this.running) return this.text;
    const target = this.readTarget();
    if (target === null) { this.cancel(); return this.text; }
    if (this.editing && !sameUiTarget(this.editTarget, target)) this.cancel();
    if (!this.editing) { this.editTarget = target; this.editing = true; }
    this.text = text; this.composing = composing; this.changed(); return text;
  }
  refresh(target) {
    if (!this.active || !this.readValue || !sameUiTarget(this.readTarget(), target)) return;
    const value = this.readValue(target);
    this.text = value == null ? "" : String(value); this.changed(); return value;
  }
  cancel() {
    this.editing = false; this.composing = false; this.editTarget = null; this.text = "";
    const target = this.active ? this.readTarget() : null;
    const value = target !== null && this.readValue ? this.readValue(target) : "";
    this.text = value == null ? "" : String(value); this.changed(); return value;
  }
  send(value, target = null) {
    if (!this.active || this.running || appFSM.readState().lifecycle !== "ready") return null;
    const current = this.readTarget();
    if (current === null || (target !== null && !sameUiTarget(current, target))) return null;
    if (this.readValue && this.readValue(current) === value) { this.refresh(current); return null; }
    this.running = true; this.changed();
    const settle = (failed, outcome) => {
      this.running = false; if (this.active) this.changed();
      let refreshError, refreshFailed = false;
      try { this.refresh(current); } catch (error) { refreshFailed = true; refreshError = error; }
      if (failed) throw outcome;
      if (refreshFailed) throw refreshError;
      return outcome;
    };
    let outcome;
    try { outcome = this.invoke(current, value); }
    catch (error) { return settle(true, error); }
    if (outcome && typeof outcome.then === "function")
      return Promise.resolve(outcome).then(value => settle(false, value), error => settle(true, error));
    return settle(false, outcome);
  }
  commit() {
    if (!this.active || !this.editing || this.running || this.composing) return null;
    const target = this.editTarget;
    if (appFSM.readState().lifecycle !== "ready" || target === null || !sameUiTarget(this.readTarget(), target)) {
      this.cancel(); return null;
    }
    const [valid, value] = this.prepare(this.text, this.readValue(target));
    if (!valid) { this.cancel(); status("완성된 숫자를 입력하세요."); return null; }
    this.editing = false; this.composing = false;
    const report = outcome => {
      if (this.active && sameUiTarget(this.readTarget(), target)) {
        const applied = this.readValue(target);
        if (applied !== value) status(`입력값 ${value} → 적용값 ${applied}`);
      }
      return outcome;
    };
    const outcome = this.send(value, target);
    return outcome && typeof outcome.then === "function" ? outcome.then(report) : report(outcome);
  }
  step(direction) {
    if (!this.active || this.running || this.composing || this.stepSize === null) return null;
    const target = this.readTarget();
    if (target === null) { this.cancel(); return null; }
    if (this.editing && !sameUiTarget(this.editTarget, target)) this.cancel();
    let value = this.readValue(target);
    if (this.editing) { const parsed = prepareNumericInput(this.text, value); if (parsed[0]) value = parsed[1]; }
    if (typeof value !== "number" || !Number.isFinite(value)) value = 0;
    this.input(String(value + (direction === "increase" ? this.stepSize : -this.stepSize)));
    return this.commit();
  }
  dispose() { this.changed = () => {}; this.cancel(); this.active = false; }
}

export function mountMantineUi() {
  const runtime = window.FastFigureUiRuntime;
  if (!runtime) throw new Error("Fast Figure UI runtime failed to load");
  if (!window.fastFigureUiRoot) throw new Error("Fast Figure React root is not initialized");

  const { React, MantineCore } = runtime;
  const {
    ActionIcon: NativeActionIcon,
    AppShell,
    Box,
    Button: NativeButton,
    Code,
    ColorInput,
    FileButton,
    Group,
    Image,
    Input,
    MantineProvider,
    Menu,
    Modal,
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
    Tree,
    UnstyledButton: NativeUnstyledButton,
    createTheme,
    useTree,
  } = MantineCore;
  const { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } = React;
  const Button = React.forwardRef((props, ref) => React.createElement(CommandButton, { ...props, control: NativeButton, controlRef: ref }));
  const ActionIcon = React.forwardRef((props, ref) => React.createElement(CommandButton, { ...props, control: NativeActionIcon, controlRef: ref }));
  const UnstyledButton = React.forwardRef((props, ref) => React.createElement(CommandButton, { ...props, control: NativeUnstyledButton, controlRef: ref }));
  const FAST_FIGURE_SETTINGS_MODAL_SIZE = "min(96vw, 1320px)";

  const fastFigureTheme = createTheme({
    fontFamily: 'system-ui, "Segoe UI", sans-serif',
    fontSizes: { ff: "14px" },
    radius: { ff: "6px" },
    defaultRadius: "ff",
    other: {
settingsModalSize: FAST_FIGURE_SETTINGS_MODAL_SIZE,
shell: {
  headerHeight: 57,
  navbarWidth: 370,
  navbarMinWidth: 360,
  navbarMaxWidth: 620,
  resizeHandleWidth: 8,
},
    },
    components: {
Group: Group.extend({ defaultProps: { align: "flex-end", gap: "xs", wrap: "wrap" } }),
Button: NativeButton.extend({
  defaultProps: { size: "ff", radius: "ff" },
  vars: () => ({ root: { "--button-height": "38px", "--button-padding-x": "12px", "--button-fz": "14px" } }),
}),
ActionIcon: NativeActionIcon.extend({
  defaultProps: { size: "ff", radius: "ff" },
  vars: () => ({ root: { "--ai-size": "38px" } }),
}),
Input: Input.extend({
  defaultProps: { size: "ff", radius: "ff" },
  vars: () => ({ wrapper: { "--input-height": "38px", "--input-fz": "14px", "--input-radius": "6px" } }),
}),
TextInput: TextInput.extend({ defaultProps: { size: "ff" }, styles: { root: { flex: "1 1 0", minWidth: "min(100%, 12ch)" } } }),
Select: Select.extend({ defaultProps: { size: "ff" }, styles: { root: { flex: "1 1 0", minWidth: "min(100%, 12ch)" } } }),
ColorInput: ColorInput.extend({ defaultProps: { size: "ff" }, styles: { root: { flex: "1 1 0", minWidth: "min(100%, 12ch)" } } }),
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
  // Binding metadata contains only group/field/axis identifiers; every read is fresh.
  function numericBinding(group, field, axis = null) {
    const read = () => {
      const api = window.FastFigureApi, state = appFSM.readState();
      if (state.lifecycle !== "ready") return null;
      let view, target, value;
      if (group === "image") {
        view = api.images.readEditor(); target = view?.imageId == null ? null : [group, state.selectedSlotId, view.imageId];
        value = view?.settings?.[field];
      } else if (group === "csv" || group === "object") {
        view = api.graphs.readData();
        target = group === "csv" ? (view.currentCsv ? [group, view.currentCsv.id] : null)
          : (view.chart?.editor?.editable !== false && view.selectedIndex != null
            ? [group, state.selectedSlotId, view.chart.id, view.selectedIndex] : null);
        value = group === "csv" ? view.currentCsv?.headerLines : view.objects?.[view.selectedIndex]?.[field];
      } else if (group === "axis" || group === "global") {
        view = api.graphs.readLayout();
        target = view && view.editable ? [group, state.selectedSlotId, view.chartId, axis] : null;
        value = group === "axis" ? view?.settings?.axes?.[axis]?.[field] : view?.settings?.[field];
      } else if (group === "label") {
        view = api.labels.readState(); target = state.overlay === "label" ? [group] : null; value = view.settings[field];
      } else if (group === "caption") {
        view = api.captions.readGlobal(); target = state.overlay === "caption" ? [group] : null; value = view.settings[field];
      } else if (group === "print") {
        view = api.print.readSettings(); target = state.overlay === "print" ? [group] : null;
        value = field === "height" && view.heightMode !== "explicit" ? null : view[field];
      } else {
        view = api.layout.readState(); target = state.overlay === "layout" ? [group] : null;
        value = group === "grid" ? view[field === "rows" ? "gridRows" : "gridCols"]
          : group === "zoom" ? view.zoom : view.slotStyle[field];
      }
      if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) value = Number(value);
      return { target: target === null ? null : [...target, field], value, view };
    };
    const allowEmpty = (group === "axis" && ["min", "max", "tick"].includes(field))
      || group === "global" || (group === "print" && field === "height");
    return {
      readTarget: () => read()?.target ?? null,
      readValue: () => read()?.value,
      prepare: (text, current) => prepareNumericInput(text, current, allowEmpty,
        group === "print" && field === "height" ? null : ""),
      invoke: (target, value) => {
        const api = window.FastFigureApi, current = read();
        if (!current || !sameUiTarget(current.target, target)) return null;
        if (group === "image") return api.images.setSettings(target[1], { [field]: value });
        if (group === "csv") return api.graphs.setHeaderLines(target[1], value);
        if (group === "object") return api.graphs.setObjectValues(target[2], target[3], { [field]: value });
        if (group === "axis") return updateSelectedGraphLayout({ axisKey: axis, axisValues: { [field]: String(value) } });
        if (group === "global") return updateSelectedGraphLayout({ globalSettings: { [field]: String(value) } });
        if (group === "label") return ["x", "y"].includes(field)
          ? api.labels.setPosition(field === "x" ? value : current.view.settings.x, field === "y" ? value : current.view.settings.y)
          : api.labels.setSettings({ [field]: value });
        if (group === "caption") return api.captions.setSettings({ [field]: value });
        if (group === "print") return api.print.setSettings(field === "height"
          ? { heightMode: value === null ? "auto" : "explicit", height: value } : { [field]: value });
        if (group === "grid") {
          const layout = current.view, bounds = layout.gridLimits[field === "rows" ? "gridRows" : "gridCols"];
          value = Math.max(bounds[0], Math.min(bounds[1], value));
          return api.layout.setGrid(field === "rows" ? value : layout.gridRows, field === "cols" ? value : layout.gridCols);
        }
        if (group === "zoom") return api.layout.setZoom(value);
        return api.layout.setStyle({ [field]: value });
      }
    };
  }
  function useUiCommand(binding, stepSize = null) {
    const [, render] = useState(0), ref = useRef(null);
    if (!ref.current) ref.current = new UiCommand(binding.readTarget, binding.readValue, binding.prepare, binding.invoke, stepSize);
    const command = ref.current;
    Object.assign(command, binding, { stepSize });
    command.changed = () => render(value => value + 1);
    const state = useAppState(), target = JSON.stringify(command.readTarget());
    useEffect(() => { command.cancel(); }, [target, state.lifecycle]);
    useEffect(() => {
      command.active = true; command.changed = () => render(value => value + 1);
      const unsubscribe = appFSM.subscribe(() => {
        if (appFSM.readState().lifecycle !== "ready" || (command.editing &&
            !sameUiTarget(command.editTarget, command.readTarget()))) command.cancel();
      });
      return () => { unsubscribe(); command.dispose(); };
    }, []);
    return command;
  }
  function CommandNumberInput({ command: descriptor, onApplied, ...props }) {
    const [group, field, axis] = descriptor, binding = numericBinding(group, field, axis);
    const invoke = binding.invoke;
    binding.invoke = (target, value) => {
      const outcome = invoke(target, value);
      const applied = result => { if (result !== false && result != null) onApplied?.(result); return result; };
      return outcome && typeof outcome.then === "function" ? outcome.then(applied) : applied(outcome);
    };
    const command = useUiCommand(binding, props.step ?? 1);
    const { value, onChange, onBlur, min, max, step, allowDecimal, clampBehavior, ...inputProps } = props;
    const run = callback => { try { const result = callback(); if (result?.catch) result.catch(error => reportTaskError("UI_COMMAND", error)); }
      catch (error) { reportTaskError("UI_COMMAND", error); } };
    const editing = command.editing && sameUiTarget(command.editTarget, command.readTarget());
    const control = React.createElement(TextInput, { ...inputProps, type: "text", inputMode: "decimal",
      value: editing ? command.text : (binding.readValue() ?? ""), disabled: props.disabled || command.running,
      onChange: event => command.input(event.currentTarget.value, event.nativeEvent.isComposing),
      onCompositionStart: () => { command.composing = true; },
      onCompositionEnd: event => command.input(event.currentTarget.value, false),
      onBlur: () => run(() => command.commit()),
      onKeyDown: event => {
        if (event.nativeEvent.isComposing || command.composing) return;
        if (event.key === "Enter") { event.preventDefault(); run(() => command.commit()); }
        else if (event.key === "Escape") { event.stopPropagation(); command.cancel(); }
        else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault(); run(() => command.step(event.key === "ArrowUp" ? "increase" : "decrease"));
        }
      },
      rightSection: React.createElement("span", { style: { display: "grid" } }, ...["increase", "decrease"].map(direction =>
        React.createElement("button", { key: direction, type: "button", disabled: props.disabled || command.running,
          "aria-label": `${props.label} ${direction === "increase" ? "늘리기" : "줄이기"}`,
          onMouseDown: event => event.preventDefault(), onClick: () => run(() => command.step(direction)) }, direction === "increase" ? "▴" : "▾"))) });
    return React.createElement("div", { style: { display: "contents" }, onClick: event => event.stopPropagation() }, control);
  }
  function CommandButton({ control = NativeButton, controlRef, localAction = false, onClick, ...props }) {
    const rendered = appFSM.readState();
    const displayedTarget = [rendered.selectedSlotId, rendered.assetPath, rendered.graphObjectIndex, rendered.overlay];
    const readTarget = () => {
      const state = appFSM.readState(), current = [state.selectedSlotId, state.assetPath, state.graphObjectIndex, state.overlay];
      return state.lifecycle === "ready" && !props.disabled && sameUiTarget(current, displayedTarget) ? current : null;
    };
    const command = useUiCommand({ readTarget, readValue: null, prepare: null, invoke: (_target, event) => onClick?.(event) });
    return React.createElement(control, { ...props, ref: controlRef, disabled: props.disabled || command.running,
      onClick: onClick ? event => localAction ? onClick(event) : command.send(event) : undefined });
  }

  function FoldSection({ title, initiallyOpen = false, children }) {
    const [open, setOpen] = useState(initiallyOpen);
    const id = React.useId(), button = useRef(null), content = useRef(null);
    const toggle = () => {
      if (open && content.current?.contains(document.activeElement)) button.current?.focus();
      setOpen(value => !value);
    };
    return React.createElement(Stack, { gap: "xs" },
      React.createElement(Button, { ref: button, variant: "subtle", localAction: true, onClick: toggle,
        "aria-expanded": open, "aria-controls": id }, title),
      React.createElement("div", { id, ref: content, hidden: !open }, children));
  }

  function LayoutPreview({ layout, selection, busy, onToggle }) {
    const hostRef = useRef(null);
    useEffect(() => {
      const view = renderDashboardFrame(hostRef.current, layout, layout.visibleSlots, layout.previewGeometry);
      const listeners = [];
      for (const slot of layout.visibleSlots) {
        const decoration = view.slots.get(slot.id).decoration;
        const button = document.createElement("button");
        button.type = "button"; button.disabled = busy;
        button.textContent = `${slot.row},${slot.col}`;
        button.setAttribute("aria-pressed", String(selection.has(slot.id)));
        Object.assign(button.style, { position: "absolute", inset: "0", width: "100%", height: "100%",
          boxSizing: "border-box", border: layout.slotStyle.showBorders ? "0" : "1px dashed var(--ui-color)",
          borderRadius: "inherit", padding: "0", pointerEvents: "auto", color: "inherit",
          background: selection.has(slot.id) ? "var(--mantine-primary-color-light)" : "transparent",
          boxShadow: selection.has(slot.id) ? "inset 0 0 0 2px var(--mantine-primary-color-filled)" : "none" });
        const click = event => { event.stopPropagation(); onToggle(slot.id); };
        button.addEventListener("click", click); listeners.push([button, click]);
        decoration.replaceChildren(button);
      }
      return () => listeners.forEach(([button, click]) => button.removeEventListener("click", click));
    }, [layout, selection, busy, onToggle]);
    useEffect(() => { const host = hostRef.current; return () => host.replaceChildren(); }, []);
    return React.createElement("div", { ref: hostRef, role: "grid", "aria-label": "레이아웃 슬롯 선택",
      style: { marginTop: 0 } });
  }

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
    return appFSM.readState().revision;
  }

  function useAppState() {
    useSyncExternalStore(subscribeAppState, getAppStateSnapshot, getAppStateSnapshot);
    return appFSM.readState();
  }

  function addSelectedGraphObject() {
    const current = appFSM.readState();
    if (current.lifecycle !== "ready" || current.selectedSlotId == null) return null;
    const context = window.FastFigureApi.graphs.readData();
    if (!context.currentCsv || context.chart?.editor.editable === false) return null;
    return window.FastFigureApi.graphs.addObject(current.selectedSlotId, context.currentCsv.id);
  }

  function setSelectedGraphEditable(editable) {
    const current = appFSM.readState();
    if (current.lifecycle !== "ready" || current.selectedSlotId == null) return null;
    const context = window.FastFigureApi.graphs.readData();
    if (!context.chart) return null;
    return window.FastFigureApi.graphs.setEditable(current.selectedSlotId, context.chart.id, editable);
  }

  function updateSelectedGraphLayout(values) {
    const current = appFSM.readState();
    if (current.lifecycle !== "ready" || current.selectedSlotId == null) return null;
    const context = window.FastFigureApi.graphs.readData();
    if (!context.chart || context.chart.editor.editable === false) return null;
    return window.FastFigureApi.graphs.updateLayout(current.selectedSlotId, context.chart.id, values);
  }

  function importSelectedSlotFile(file) {
    if (!file) return null;
    const current = appFSM.readState();
    if (current.selectedSlotId == null) return null;
    return window.FastFigureApi.graphs.importFile(current.selectedSlotId, file);
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

  function reportTaskError(eventName, error) {
    debugLog(
      "fsm:lifecycle-task-error",
      { event: eventName, message: error.message },
      "error",
    );
  }

  function runLifecycleTask(lifecycle, eventName, task) {
    return appFSM.run(lifecycle, eventName, task)
      .catch((error) => reportTaskError(eventName, error));
  }

  function useProjectAssetImportCollision() {
    const resolverRef = useRef(null);
    const [collision, setCollision] = useState(null);
    const resolveCollision = (choice = null) => {
const resolve = resolverRef.current;
resolverRef.current = null;
setCollision(null);
resolve?.(choice);
    };
    useEffect(() => () => {
const resolve = resolverRef.current;
resolverRef.current = null;
resolve?.(null);
    }, []);
    const choosePlan = useCallback(async (file, directory, reservedPaths = null) => {
const model = window.FastFigureApi.assets.collisionModel(file, directory, reservedPaths);
if (model.mode === "available")
  return window.FastFigureApi.assets.resolveImportPlan(model, "available", reservedPaths);
const choice = await new Promise((resolve) => {
  resolverRef.current = resolve;
  setCollision(model);
});
if (choice !== "rename" && choice !== "replace") return null;
return window.FastFigureApi.assets.resolveImportPlan(model, choice, reservedPaths);
    }, []);
    const modal = React.createElement(
Modal,
{
  opened: !!collision,
  onClose: () => resolveCollision(null),
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
          { variant: "light", localAction: true, onClick: () => resolveCollision("rename") },
          "새 이름으로 추가",
        ),
        collision.mode === "replace-or-rename"
          ? React.createElement(
              Button,
              { localAction: true, onClick: () => resolveCollision("replace") },
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
    return window.FastFigureApi.project.exportFile()
      .catch((error) => reportTaskError("PROJECT_EXPORT", error));
  }

  function exportSlotFfsxFromMantine() {
    return window.FastFigureApi.graphs.exportFfsx(appFSM.readState().selectedSlotId)
      .catch((error) => reportTaskError("SLOT_EXPORT", error));
  }

  function exportPlotlyJsonFromMantine() {
    return window.FastFigureApi.graphs.exportPlotlyJson(appFSM.readState().selectedSlotId)
      .catch((error) => reportTaskError("PLOTLY_EXPORT", error));
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
React.createElement(Button, { disabled: state.lifecycle !== "ready", "aria-label": "작업영역 전체 렌더링", onClick: () => window.FastFigureApi.workspace.render() }, "렌더"),
React.createElement(Button, { ...buttonProps("print"), "aria-label": "프린트" }, "프린트"),
    );
  }

  function FastFigureDataActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const slotApi = window.FastFigureApi.slots;
    const slot = state.workspace === "project" ? null : slotApi.readSelected();
    const slotType = slot?.content.contentType || "graph";
    const [resetSlotId, setResetSlotId] = useState(null);
    const assetApi = window.FastFigureApi.assets;
    const selectedAssetDeletable = !!assetApi.readDeletionTarget(state.assetPath);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const fileResetRef = useRef(null);
    const { choosePlan: chooseProjectAssetImportPlan, modal: importCollisionModal } =
useProjectAssetImportCollision();
    const importFilesFromMantine = async (files) => {
const selectedFiles = Array.isArray(files) ? files : files ? [files] : [];
if (!selectedFiles.length) return;
try {
  await assetApi.importFiles(selectedFiles, chooseProjectAssetImportPlan);
} catch (error) {
  status("불러오기 실패: " + error.message);
} finally {
  fileResetRef.current?.();
}
    };

    const performAssetDelete = (target) => {
try {
  assetApi.delete({ kind: target.kind, id: target.target.id, path: target.path });
  setDeleteTarget(null);
} catch (error) {
  status(`에셋 삭제 오류: ${error.message}`);
}
    };
    const requestAssetDelete = () => {
const target = assetApi.readDeletionTarget(appFSM.readState().assetPath);
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
          onClick: () => slotApi.setContentType(slot.id, "graph"),
        },
        "그래프",
      ),
      React.createElement(
        Button,
        {
          variant: slotType === "image" ? "filled" : "light",
          disabled: busy,
          onClick: () => slotApi.setContentType(slot.id, "image"),
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
            ? `${deleteTarget.target.name}을 ${deleteTarget.referenceCount}개 그래프 오브젝트가 참조 중입니다. 참조 중인 그래프 오브젝트와 CSV를 함께 삭제할까요?`
            : `${deleteTarget.target.name}을 ${deleteTarget.referenceCount}개 이미지 슬롯이 참조 중입니다. 참조 슬롯을 초기화하고 이미지를 삭제할까요?`,
        ),
        React.createElement(
          Group,
          { justify: "flex-end", gap: "xs" },
          React.createElement(
            Button,
            { variant: "light", localAction: true, onClick: () => setDeleteTarget(null) },
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
      React.createElement(Button, { variant: "light", localAction: true, onClick: closeResetDialog }, "취소"),
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
imageApi.setSettings(image.slotId, patch);
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
    if (slot?.content.contentType === "image")
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
      React.createElement(CommandNumberInput, {

        label: "크기 (%)",
        value: settings.scale,
        min: 1,
        max: 1000,
        disabled: busy,
command: ["image","scale"],
}),
      React.createElement(
        Group,
        { gap: "xs", grow: true },
        React.createElement(CommandNumberInput, {

          label: "X (%)",
          value: settings.x,
          min: -100,
          max: 200,
          disabled: busy,
command: ["image","x"],
}),
        React.createElement(CommandNumberInput, {

          label: "Y (%)",
          value: settings.y,
          min: -100,
          max: 200,
          disabled: busy,
command: ["image","y"],
}),
      ),
    )
  : null,
    );
  }

  function readProjectAssetDisplay() {
    const assetNodes = window.FastFigureApi.assets.readTree();
    const slotRows = window.FastFigureApi.layout.readState().visibleSlots;
    return { assetNodes, slotRows };
  }

  function FastFigureProjectDataTree() {
    const state = useAppState();
    const assetApi = window.FastFigureApi.assets;
    const { assetNodes, slotRows } = readProjectAssetDisplay();
    const snapshot = {
      directories: assetNodes.filter(node => node.kind === "directory").map(node => node.path),
      data: assetNodes.filter(node => node.kind === "csv").map(node => ({
        id: node.id, name: node.name, path: node.path, readable: Array.isArray(node.asset.rows),
        rowCount: Math.max(0, node.asset.rows.length - (Number(node.asset.headerLines) || 0)),
      })),
      images: assetNodes.filter(node => node.kind === "image").map(node => ({
        id: node.id, name: node.name, path: node.path,
      })),
    };
    const selectedSlotId = window.FastFigureApi.slots.readSelected()?.id;
    const assetTreeController = useTree({
initialExpandedState: { "/assets": true },
    });
    const [slotsExpanded, setSlotsExpanded] = useState(true);
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
  const path = assetApi.createDirectory(folderDialog.parent, folderDialog.name);
  if (path !== null) setLastDirectory(path);
  closeFolderDialog();
} catch (error) {
  status(`폴더 생성 오류: ${error.message}`);
}
    };
    const trashSelected =
state.assetSelection === "directory" && state.assetPath === PROJECT_TRASH_DIRECTORY;
    const trash = assetApi.readTrash();
    const trashHasContents = !!trash?.children.length;
    const countTrashReferences = node => node.kind === "directory"
? node.children.reduce((count, child) => count + countTrashReferences(child), 0)
: assetApi.readDeletionTarget(node.path)?.referenceCount ?? 0;
    const trashReferenceCount = trash ? countTrashReferences(trash) : 0;
    const openTrashDialog = () => {
if (!trashSelected || !trashHasContents) return;
setTrashDialog({ referenceCount: trashReferenceCount });
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
    const rewriteLastDirectoryAfterMove = (source, destination) => {
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
  if (result === null) return;
  if (plan.kind === "directory" && !result.trashed)
    rewriteLastDirectoryAfterMove(plan.path, result.path);
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
    const assetReferenceCount = (path) =>
assetApi.readDeletionTarget(path)?.referenceCount ?? 0;
    const dataByPath = new Map(
snapshot.data.map((asset) => [asset.path, { kind: "csv", asset }]),
    );
    snapshot.images.forEach((asset) =>
dataByPath.set(asset.path, { kind: "image", asset }),
    );
    const directorySet = new Set(directories);
    const treeNodeForDirectory = (path) => ({
value: path,
label: path === "/assets" ? "/assets" : projectPathName(path),
kind: "directory",
children: [
  ...directories
    .filter((candidate) => candidate !== path && projectParentPath(candidate) === path)
    .map(treeNodeForDirectory),
  ...snapshot.data
    .filter((asset) => projectParentPath(asset.path) === path)
    .map((asset) => ({
      value: asset.path,
      label: projectPathName(asset.path),
      kind: "csv",
    })),
  ...snapshot.images
    .filter((asset) => projectParentPath(asset.path) === path)
    .map((asset) => ({
      value: asset.path,
      label: projectPathName(asset.path),
      kind: "image",
    })),
],
    });
    const assetTreeRevision = [
...directories,
...snapshot.data.map((asset) => `csv:${asset.path}`),
...snapshot.images.map((asset) => `image:${asset.path}`),
    ].join("\u0000");
    const assetTreeData = useMemo(
() => [treeNodeForDirectory("/assets")],
[assetTreeRevision],
    );
    const treeNodeKind = (path) =>
directorySet.has(path) ? "directory" : dataByPath.get(path)?.kind || null;
    const treeNodeMeta = (path, kind) => {
const asset = dataByPath.get(path)?.asset;
if (!asset) return "";
return kind === "csv"
  ? `${asset.readable ? `${asset.rowCount}행` : "읽기 실패"} · 참조 ${assetReferenceCount(path)}`
  : `참조 ${assetReferenceCount(path)}`;
    };
    const allowProjectTreeDrop = ({ draggedNode, targetNode, position }) =>
!busy &&
position === "inside" &&
directorySet.has(targetNode) &&
assetApi.movable(draggedNode);
    const moveProjectTreeNode = (payload) => {
if (!allowProjectTreeDrop(payload)) return;
requestProjectNodeMove(payload.draggedNode, payload.targetNode);
    };
    const renderProjectTreeNode = ({
node,
expanded: nodeExpanded,
hasChildren,
tree,
elementProps,
    }) => {
const path = node.value;
const kind = treeNodeKind(path);
const directory = kind === "directory";
const movable = assetApi.movable(path);
const trashed = assetApi.isTrashed(path);
const selected = state.assetPath === path && state.assetSelection === kind;
const originalClick = elementProps.onClick;
const originalDragStart = elementProps.onDragStart;
const originalDragOver = elementProps.onDragOver;
const originalDragLeave = elementProps.onDragLeave;
const originalDrop = elementProps.onDrop;
const originalDragEnd = elementProps.onDragEnd;
const selectNode = (event) => {
  originalClick?.(event);
  if (busy || !kind) return;
  if (directory) {
    setLastDirectory(path);
    assetApi.selectDirectory(path);
    if (hasChildren) tree.toggleExpanded(path);
  } else if (kind === "csv") assetApi.selectCsv(path);
  else if (kind === "image") assetApi.selectImage(path);
};
const startTreeDrag = (event) => {
  if (busy || !movable) return event.preventDefault();
  dragNodeRef.current = { path };
  originalDragStart?.(event);
  if (!event.defaultPrevented) event.dataTransfer.effectAllowed = "all";
};
const finishTreeDrag = (event) => {
  originalDragEnd?.(event);
  dragNodeRef.current = null;
};
const treeDragOver = (event) => {
  if (dataTransferHasFiles(event.dataTransfer)) {
    if (!directory || trashed) return false;
    return allowExternalFileDrop(event);
  }
  return originalDragOver?.(event);
};
const treeDrop = (event) => {
  if (dataTransferHasFiles(event.dataTransfer)) {
    if (!directory || trashed) return false;
    return importExternalFilesToDirectory(event, path);
  }
  return originalDrop?.(event);
};
const row = React.createElement(
  UnstyledButton,
  {
    ...elementProps,
    type: "button",
    disabled: busy,
    onClick: selectNode,
    onDragStart: startTreeDrag,
    onDragOver: treeDragOver,
    onDragLeave: originalDragLeave,
    onDrop: treeDrop,
    onDragEnd: finishTreeDrag,
    "aria-expanded": directory && hasChildren ? nodeExpanded : undefined,
    "data-fastfigure-tree-path": path,
    style: {
      ...(elementProps.style || {}),
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      width: "100%",
      minWidth: 0,
      padding: "6px 8px",
      borderRadius: "var(--mantine-radius-sm)",
      background: selected ? "var(--mantine-primary-color-light)" : "transparent",
      color: "inherit",
      cursor: busy ? "default" : movable ? "grab" : "pointer",
    },
  },
  React.createElement(
    Text,
    {
      component: "span",
      size: "xs",
      style: {
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    directory
      ? `${hasChildren ? (nodeExpanded ? "▾" : "▸") : "•"} ${node.label}`
      : node.label,
  ),
  !directory
    ? React.createElement(
        Text,
        { component: "span", size: "xs", c: "dimmed", style: { flexShrink: 0 } },
        treeNodeMeta(path, kind),
      )
    : null,
);

let menu = null;
if (directory && movable) {
  menu = React.createElement(
    Menu,
    { position: "bottom-end", withinPortal: true },
    React.createElement(
      Menu.Target,
      null,
      React.createElement(
        ActionIcon,
        {
          variant: "subtle",
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
      !trashed
        ? React.createElement(
            Menu.Item,
            {
              onClick: () =>
                requestProjectNodeMove(path, PROJECT_TRASH_DIRECTORY),
            },
            "휴지통으로 이동",
          )
        : null,
    ),
  );
} else if (!directory && kind) {
  menu = React.createElement(
    Menu,
    { position: "bottom-end", withinPortal: true },
    React.createElement(
      Menu.Target,
      null,
      React.createElement(
        ActionIcon,
        {
          variant: "subtle",
          "aria-label": `${projectPathName(path)} 작업`,
        },
        "···",
      ),
    ),
    React.createElement(
      Menu.Dropdown,
      null,
      React.createElement(
        Menu.Item,
        { onClick: () => assetApi.download(path) },
        "다운로드",
      ),
      movable
        ? React.createElement(
            Menu.Item,
            {
              onClick: () =>
                setMovePicker({
                  path,
                  directory: projectParentPath(path),
                }),
            },
            "이동…",
          )
        : null,
      movable && !trashed
        ? React.createElement(
            Menu.Item,
            {
              onClick: () =>
                requestProjectNodeMove(path, PROJECT_TRASH_DIRECTORY),
            },
            "휴지통으로 이동",
          )
        : null,
    ),
  );
}

return React.createElement(
  Group,
  { gap: 2, wrap: "nowrap", style: { width: "100%" } },
  React.createElement(Box, { style: { flex: 1, minWidth: 0 } }, row),
  menu,
);
    };
    const visibleSlots = [...slotRows]
.sort((a, b) => a.row - b.row || a.col - b.col);
    const slotReference = (slot) => {
if (slot.assetDisplay.kind === "embedded")
  return "Plotly JSON 내부 데이터 · 외부 참조 없음";
const references = slot.assetDisplay.assets.map(asset => `${asset.name} · ${asset.path}`);
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
try {
  await assetApi.importToSlot(files[0], slot.id, chooseTreeImportPlan);
} catch (error) {
  status(`슬롯 가져오기 실패: ${error.message}`);
}
    };
    return React.createElement(
Stack,
{ gap: "xs", px: "md", pb: "md" },
React.createElement(Text, { fw: 600, size: "sm" }, "PROJECT DATA"),
React.createElement(
  Button,
  {
    variant: "light",
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
      React.createElement(Button, { variant: "light", localAction: true, onClick: closeFolderDialog }, "취소"),
      React.createElement(Button, { onClick: createFolderFromMantine }, "만들기"),
    ),
  ),
),
trashSelected
  ? React.createElement(
      Button,
      {
        variant: "light",
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
          React.createElement(Button, { variant: "light", localAction: true, onClick: closeTrashDialog }, "취소"),
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
            { variant: "light", localAction: true, onClick: () => setMovePicker(null) },
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
            { variant: "light", localAction: true, onClick: () => setMoveConfirm(null) },
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
React.createElement(Tree, {
  data: assetTreeData,
  tree: assetTreeController,
  levelOffset: "md",
  expandOnClick: false,
  selectOnClick: false,
  allowRangeSelection: false,
  onDragDrop: moveProjectTreeNode,
  allowDrop: allowProjectTreeDrop,
  renderNode: renderProjectTreeNode,
  "data-fastfigure-project-tree": "assets",
}),
React.createElement(
  Button,
  {
    variant: "subtle",
    fullWidth: true,
    justify: "flex-start",
    "aria-expanded": slotsExpanded,
    localAction: true, onClick: () => setSlotsExpanded((value) => !value),
  },
  `${slotsExpanded ? "▾" : "▸"} /slots`,
),
slotsExpanded
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
  try {
    await projectApi.importFile(file);
  } catch (error) {
    status("프로젝트 불러오기 오류: " + error.message);
    debugLog("project:import-error", { message: error.message });
  }
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
    const assetApi = window.FastFigureApi.assets;
    const editor = graphApi.readData();
    const chartId = editor.chart?.id ?? null, editable = editor.chart?.editor?.editable !== false;
    const csvAssets = assetApi.readTree().filter(node => node.kind === "csv").map(node => node.asset);
    const csvOptions = csvAssets.map(csv => ({ value: String(csv.id), label: csv.name }));
    const objects = editor.objects;
    const selectedIndex = editor.selectedIndex;
    const selected = selectedIndex === null ? null : objects[selectedIndex];
    const activeCsv = editor.currentCsv;
    const columns = editor.columns;
    const objectColumns = editor.objectColumns || [];
    const columnOptions = objectColumns.map((column) => ({ value: column.id, label: column.label }));
    const update = (values) => selectedIndex !== null && graphApi.setObjectValues(chartId, selectedIndex, values);
    const selectField = (label, key, data) => React.createElement(Select, {
label, data, value: selected?.[key] ?? null, disabled: busy,
onChange: (value) => value !== null && update({ [key]: value }),
    });
    const numberField = (label, key, min, max, step = 1) => React.createElement(CommandNumberInput, {

label, value: selected?.[key], min, max, step, disabled: busy,
command: ["object",key],
});
    return React.createElement(
Stack,
{ gap: "xs", p: "md" },
React.createElement(Text, { fw: 600 }, "그래프 / 데이터"),
React.createElement(
  Button,
  {
    variant: "light",
    disabled: busy,
    onClick: assetApi.createEmptyCsv,
  },
  "빈 CSV 삽입",
),
React.createElement(Select, {
  label: "사용할 CSV", data: csvOptions, value: activeCsv ? String(activeCsv.id) : null,
  disabled: busy || !csvOptions.length,
  onChange: (value) => {
    const csv = csvAssets.find(item => String(item.id) === value);
    if (csv) graphApi.selectCsv(csv.path);
  },
}),
activeCsv ? React.createElement(CommandNumberInput, {

  label: "헤더 행 수", value: activeCsv.headerLines, min: 0, max: activeCsv.rows.length,
  allowDecimal: false, disabled: busy,
command: ["csv","headerLines"],
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
          ...activeCsv.rows.slice(0, 30).map((row, rowIndex) =>
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
    variant: editable ? "filled" : "light", disabled: busy || chartId === null,
    onClick: () => {
      const context = graphApi.readData();
      if (context.chart) return setSelectedGraphEditable(!context.chart.editor.editable);
    },
  }, editable ? "편집 가능" : "원본 JSON"),
  React.createElement(Button, {
    variant: "light", disabled: busy || !activeCsv || !editable,
    onClick: addSelectedGraphObject,
  }, "오브젝트 추가"),
),
React.createElement(Text, { size: "sm", fw: 600 }, "그래프 오브젝트"),
objects.length ? React.createElement(Stack, { gap: "xs" },
  ...objects.map((object, index) => React.createElement(Group, {
    key: `${chartId}-${index}`, gap: "xs",
    draggable: editable && !busy,
    onDragStart: (event) => {
      if (!editable || busy) return event.preventDefault();
      dragRef.current = index;
    },
    onDragEnd: () => { dragRef.current = null; },
    onDragOver: (event) => {
      if (editable && !busy) event.preventDefault();
    },
    onDrop: (event) => {
      if (!editable || busy) return;
      event.preventDefault();
      if (Number.isInteger(dragRef.current)) graphApi.moveObject(chartId, dragRef.current, index);
      dragRef.current = null;
    },
  },
    React.createElement(Button, {
      variant: selectedIndex === index ? "filled" : "light",
      style: { flex: "1 1 auto", minWidth: 0, height: "auto", minHeight: "var(--button-height)" },
      styles: { label: { whiteSpace: "normal", overflowWrap: "anywhere", display: "block" } },
      "aria-label": `${index + 1}. ${editor.chart?.editor.title ? editor.chart.editor.title + " — " : ""}${object.legendName || `${object.x} · ${object.y}`}`,
      onClick: () => graphApi.selectObject(index),
    }, React.createElement("span", null,
      editor.chart?.editor.title ? React.createElement("span", null, `${index + 1}. ${editor.chart.editor.title} — `) : `${index + 1}. `,
      React.createElement("span", { style: { display: "block" } }, object.legendName || `${object.x} · ${object.y}`))),
    React.createElement(ColorInput, {
      value: object.color,
      disabled: busy || !editable,
      onChange: (color) => graphApi.setObjectValues(chartId, index, { color }),
    }),
    React.createElement(ActionIcon, {
      variant: "subtle", disabled: busy || !editable,
      "aria-label": `${index + 1}번 그래프 오브젝트 삭제`,
      onClick: () => graphApi.deleteObject(chartId, index),
    }, "×"),
  )),
) : React.createElement(Text, { size: "xs", c: "dimmed" }, "추가된 그래프 오브젝트가 없습니다."),
selected && activeCsv && editable ? React.createElement(Stack, { gap: "xs" },
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
  React.createElement(FoldSection, { title: "종류별 세부 설정" },
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
  ),
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
    const updateGlobal = (values) => updateSelectedGraphLayout({ globalSettings: values });
    const updateTitle = (title) => updateSelectedGraphLayout({ title });
    const updateAxis = (key, values) => updateSelectedGraphLayout({ axisKey: key, axisValues: values });
    const toggleGlobal = (key, label) =>
React.createElement(
  Button,
  {
    variant: settings[key] ? "filled" : "light",
    disabled: busy || !editable,
    "aria-pressed": settings[key],
    onClick: () => updateGlobal({ [key]: !settings[key] }),
  },
  label,
);
    const axisNumber = (key, axis, field, label, options = {}) =>
React.createElement(CommandNumberInput, {

  label,
  value: axis[field],
  disabled: busy || !editable,
  ...options,
command: ["axis",field,key],
});
    const axisToggle = (key, axis, field, label) =>
React.createElement(
  Button,
  {
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
  FoldSection,
  { key, title: axisLabels[key] },
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
  React.createElement(CommandNumberInput, {

    label: "제목 크기",
    value: settings.titleFontSize,
    disabled: busy || !editable,
command: ["global","titleFontSize"],
}),
  React.createElement(CommandNumberInput, {

    label: "범례 크기",
    value: settings.legendFontSize,
    disabled: busy || !editable,
command: ["global","legendFontSize"],
}),
),
React.createElement(FoldSection, { title: "X축" }, axisEditor("xBottom"), axisEditor("xTop")),
React.createElement(FoldSection, { title: "Y축" }, axisEditor("yLeft"), axisEditor("yRight")),
    );
  }
  function FastFigureGraphPaletteActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const importResetRef = useRef(null);
    if (state.workspace !== "slot.graph") return null;
    const graphApi = window.FastFigureApi.graphs;
    const editor = graphApi.readData(), colors = graphApi.readPalette();
    const canEdit = !!editor.chart && editor.chart.editor.editable !== false;
    const commitColors = (colors) => graphApi.applyPalette(editor.chart?.id ?? null, colors);
    const resetPalette = () => {
if (!editor.chart) return status("그래프 슬롯을 먼저 선택하세요.");
const result = commitColors(graphApi.defaultColors());
if (result?.id == null || result.id !== editor.chart?.id) return result;
debugLog("graphPalette:reset", { slotId: state.selectedSlotId });
    };
    const savePalette = () => {
if (!editor.chart) return status("그래프 슬롯을 먼저 선택하세요.");
const savedColors = colors.filter(Boolean);
const blob = new Blob([JSON.stringify({ colors: savedColors }, null, 2)], {
  type: "application/json;charset=utf-8",
});
const link = document.createElement("a");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
link.href = URL.createObjectURL(blob);
link.download = `chart-palette-${stamp}.json`;
link.click();
setTimeout(() => URL.revokeObjectURL(link.href), 0);
debugLog("graphPalette:save", {
  slotId: state.selectedSlotId,
  colors: savedColors.length,
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
      const result = commitColors(valid);
      if (result?.id == null || result.id !== editor.chart?.id) return result;
      status(`${file.name} 색상 구성을 덮어썼습니다.`);
      debugLog("graphPalette:load", {
        slotId: appFSM.readState().selectedSlotId,
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
    { variant: "light", disabled: busy || !editor.chart, onClick: savePalette },
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
  await importSelectedSlotFile(file);
} catch (error) {
  status("슬롯 불러오기 오류: " + String(error?.message ?? error));
  debugLog("slot:import-error", { message: String(error?.message ?? error) });
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
const result = appearanceApi.resetPalette();
if (result === false) return;
setDraft({ ...result });
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
          { variant: "light", localAction: true, onClick: () => setOpened(false) },
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
React.createElement(FoldSection, { title: "디버그 로그" },
React.createElement(
  Group,
  { gap: "xs", grow: true },
  React.createElement(
    Button,
    {
      variant: telemetry.debugEnabled ? "filled" : "light",
      disabled: busy,
      "aria-pressed": telemetry.debugEnabled,
      localAction: true, onClick: () => setDebugEnabled(!readDebugEnabled()),
    },
    telemetry.debugEnabled ? "디버깅 끄기" : "디버깅 켜기",
  ),
  React.createElement(
    Button,
    {
      variant: "light",
      disabled: busy || !telemetry.debugLines.length,
      localAction: true, onClick: saveDebugOutput,
    },
    "로그 저장",
  ),
  React.createElement(
    Button,
    {
      variant: "light",
      disabled: busy || !telemetry.debugLines.length,
      localAction: true, onClick: clearDebugOutput,
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
),
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

  function FastFigureSettingsModal({ title, overlay, onClose, onContentClick, children }) {
    const modalRootRef = useRef(null);
    const resizeRef = useRef(null);
    const resizeListenersRef = useRef(null);

    const clearResizeListeners = () => {
const listeners = resizeListenersRef.current;
if (listeners) {
  window.removeEventListener("mousemove", listeners.move);
  window.removeEventListener("mouseup", listeners.end);
}
resizeListenersRef.current = null;
resizeRef.current = null;
document.body.style.userSelect = "";
document.body.style.cursor = "";
    };

    useEffect(() => () => clearResizeListeners(), []);

    const resolveModalContent = () =>
modalRootRef.current?.querySelector?.("[data-modal-content]") || null;

    const startResize = (event) => {
if (event.button !== 0) return;
const content = resolveModalContent();
if (!content) return;

clearResizeListeners();

const rect = content.getBoundingClientRect();
const inner = content.parentElement;
if (inner) {
  inner.style.alignItems = "flex-start";
  inner.style.paddingTop = `${rect.top}px`;
  inner.style.paddingBottom = "0px";
}

resizeRef.current = {
  startY: event.clientY,
  startHeight: rect.height,
  top: rect.top,
};

const move = (moveEvent) => {
  const drag = resizeRef.current;
  if (!drag) return;
  const minHeight = 240;
  const maxHeight = Math.max(minHeight, window.innerHeight - drag.top - 12);
  const nextHeight = Math.max(
    minHeight,
    Math.min(maxHeight, drag.startHeight + moveEvent.clientY - drag.startY),
  );
  const currentContent = resolveModalContent();
  currentContent?.style.setProperty("--modal-content-height", `${nextHeight}px`);
};

const end = () => clearResizeListeners();
resizeListenersRef.current = { move, end };
window.addEventListener("mousemove", move);
window.addEventListener("mouseup", end);
document.body.style.userSelect = "none";
document.body.style.cursor = "ns-resize";
event.preventDefault();
    };

    return React.createElement(
Modal,
{
  ref: modalRootRef,
  opened: true,
  onClose,
  title,
  centered: true,
  size: fastFigureTheme.other.settingsModalSize,
  "data-fastfigure-overlay": overlay,
  styles: {
    content: {
      "--modal-content-height": "min(72dvh, 720px)",
      "--modal-content-max-height": "calc(100dvh - 24px)",
    },
    body: {
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
    },
  },
},
React.createElement(
  Box,
  {
    onClick: onContentClick,
    "data-fastfigure-settings-content": overlay,
    style: {
      minHeight: 0,
      flex: "1 1 auto",
    },
  },
  children,
),
React.createElement(
  Box,
  {
    role: "separator",
    "aria-orientation": "horizontal",
    "aria-label": `${title} 창 높이 조절`,
    onMouseDown: startResize,
    "data-fastfigure-modal-resize": overlay,
    style: {
      position: "sticky",
      bottom: 0,
      flexShrink: 0,
      width: "100%",
      height: 24,
      marginTop: 12,
      cursor: "ns-resize",
      userSelect: "none",
      display: "grid",
      placeItems: "center",
      borderTop: "1px solid var(--mantine-color-default-border)",
      background: "var(--mantine-color-body)",
      zIndex: 1,
    },
  },
  React.createElement(Box, {
    w: 42,
    h: 4,
    style: {
      borderRadius: 99,
      background: "var(--mantine-primary-color-filled)",
    },
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
FastFigureSettingsModal,
{
  onClose: close,
  title: "레이블",
  overlay: "label",
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
    React.createElement(CommandNumberInput, {

      label: "크기",
      value: settings.fontSize,
      min: 6,
      disabled: busy,
command: ["label","fontSize"],
}),
  ),
  React.createElement(
    Group,
    { gap: "xs", grow: true },
    React.createElement(CommandNumberInput, {

      label: "X (px)",
      value: settings.x,
      disabled: busy,
command: ["label","x"],
}),
    React.createElement(CommandNumberInput, {

      label: "Y (px)",
      value: settings.y,
      disabled: busy,
command: ["label","y"],
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
FastFigureSettingsModal,
{
  onClose: close,
  title: "캡션",
  overlay: "caption",
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
        localAction: true, onClick: () => setTargetMode(slotMode ? "global" : "slot"),
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
    React.createElement(CommandNumberInput, {

      label: "크기",
      value: settings.fontSize,
      min: 6,
      max: 96,
      disabled: busy,
command: ["caption","fontSize"],
}),
    React.createElement(CommandNumberInput, {

      label: "줄 간격",
      value: settings.lineHeight,
      min: 0.8,
      max: 4,
      step: 0.05,
      disabled: busy,
command: ["caption","lineHeight"],
}),
  ),
),
    );
  }

  function FastFigurePrintOverlay() {
    const state = useAppState();
    const printApi = window.FastFigureApi.print;
    const initial = printApi.readSettings();
    const width = initial.width, height = initial.heightMode === "explicit" ? initial.height : "", dpi = initial.dpi;
    const [format, setFormat] = useState(initial.format);
    const [message, setMessage] = useState("");
    useEffect(() => {
if (state.overlay !== "print") return;
const saved = printApi.readSettings();
setFormat(saved.format);
    }, [state.overlay]);
    if (state.overlay !== "print") return null;
    const busy = state.lifecycle !== "ready";

    const close = () =>
appFSM.send("CLOSE_OVERLAY", { reason: "mantine-print" });
    const commit = (patch) => {
const next = printApi.setSettings(patch);
setFormat(next.format);
return next;
    };
    const save = () =>
printApi.save(setMessage)
  .catch((error) => reportTaskError("PRINT_EXPORT", error));
    const capture = () =>
printApi.capture(setMessage)
  .catch((error) => reportTaskError("CAPTURE_EXPORT", error));

    return React.createElement(
FastFigureSettingsModal,
{
  onClose: close,
  title: "프린트 / 내보내기",
  overlay: "print",
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
    React.createElement(CommandNumberInput, {

      label: "DPI",
      value: dpi,
      min: 36,
      max: 1200,
      disabled: busy,
command: ["print","dpi"],
}),
  ),
  React.createElement(
    Group,
    { gap: "xs", grow: true },
    React.createElement(CommandNumberInput, {

      label: "가로 (px)",
      value: width,
      min: 100,
      max: 20000,
      disabled: busy,
command: ["print","width"],
}),
    React.createElement(CommandNumberInput, {

      label: "세로 (px, 비우면 자동)",
      value: height,
      min: 100,
      max: 20000,
      disabled: busy,
command: ["print","height"],
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
    const [renderedPreviewWidth, setRenderedPreviewWidth] = useState(null);
    const previewFrameRef = useRef(null);
    const layoutApi = window.FastFigureApi.layout;
    const layout = state.overlay === "layout" ? layoutApi.readState(renderedPreviewWidth) : null;
    useEffect(() => {
setLayoutSelection(new Set());
    }, [state.overlay, layout?.gridRows, layout?.gridCols]);
    useEffect(() => {
if (state.overlay !== "layout") return;
const element = previewFrameRef.current;
if (!element) return;
const updateRenderedWidth = () => {
  const width = element.getBoundingClientRect().width;
  if (width > 0) setRenderedPreviewWidth(width);
};
updateRenderedWidth();
const observer = new ResizeObserver(updateRenderedWidth);
observer.observe(element);
return () => observer.disconnect();
    }, [state.overlay]);
    if (state.overlay !== "layout") return null;
    const busy = state.lifecycle !== "ready";
    const style = layout.slotStyle;

    const commitStyle = (patch) => layoutApi.setStyle(patch);
    const toggleSlot = (slotId) => {
setLayoutSelection((current) => {
  const next = new Set(current);
  if (next.has(slotId)) next.delete(slotId);
  else next.add(slotId);
  return next;
});
    };
    const runLayoutCommand = (command) => {
const layoutState = command([...layoutSelection]);
if (layoutState !== false) {
  const visibleIds = new Set(layoutState.visibleSlots.map((slot) => slot.id));
  setLayoutSelection((current) => new Set([...current].filter((id) => visibleIds.has(id))));
}
    };
    const close = () => appFSM.send("CLOSE_OVERLAY", { reason: "mantine-layout" });

    return React.createElement(
FastFigureSettingsModal,
{
  onClose: close,
  title: "레이아웃",
  overlay: "layout",
  onContentClick: () => setLayoutSelection(new Set()),
},
React.createElement(
  Stack,
  { gap: "md" },
  React.createElement(
    Group,
    { gap: "xs", grow: true },
    React.createElement(CommandNumberInput, {

      label: "행",
      value: layout.gridRows,
      clampBehavior: "none",
      min: layout.gridLimits.gridRows[0],
      max: layout.gridLimits.gridRows[1],
      allowDecimal: false,
      disabled: busy,
command: ["grid","rows"],
onApplied: () => setLayoutSelection(new Set()),
}),
    React.createElement(CommandNumberInput, {

      label: "열",
      value: layout.gridCols,
      clampBehavior: "none",
      min: layout.gridLimits.gridCols[0],
      max: layout.gridLimits.gridCols[1],
      allowDecimal: false,
      disabled: busy,
command: ["grid","cols"],
onApplied: () => setLayoutSelection(new Set()),
}),
  ),
  React.createElement(
    Group,
    { gap: "xs", grow: true },
    React.createElement(CommandNumberInput, {

      label: "기준 폭",
      value: style.referenceWidth,
      min: 100,
      max: 20000,
      disabled: busy,
command: ["style","referenceWidth"],
}),
    React.createElement(CommandNumberInput, {

      label: "간격",
      value: style.gap,
      min: 0,
      max: 2000,
      disabled: busy,
command: ["style","gap"],
}),
    React.createElement(CommandNumberInput, {

      label: "바깥 여백",
      value: style.outerMargin,
      min: 0,
      max: 5000,
      disabled: busy,
command: ["style","outerMargin"],
}),
  ),
  React.createElement(
    Group,
    { gap: "xs", grow: true },
    React.createElement(CommandNumberInput, {

      label: "모서리 반경",
      value: style.radius,
      min: 0,
      max: 2000,
      disabled: busy,
command: ["style","radius"],
}),
    React.createElement(CommandNumberInput, {

      label: "종횡비",
      value: style.aspect,
      min: 0.1,
      max: 10,
      step: 0.01,
      disabled: busy,
command: ["style","aspect"],
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
    React.createElement(CommandNumberInput, {

      label: "확대 비율 (%)",
      value: layout.zoom,
      min: 50,
      max: 200,
      disabled: busy,
command: ["zoom","zoom"],
}),
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
    Box,
    {
      ref: previewFrameRef,
      style: {
        width: 600,
        maxWidth: "100%",
        marginInline: "auto",
        overflowX: "auto",
      },
    },
    React.createElement(LayoutPreview, {
      layout, selection: layoutSelection, busy, onToggle: toggleSlot,
    }),
  ),
  React.createElement(
    Group,
    { gap: "xs", grow: true },
    React.createElement(
      Button,
      {
        disabled: busy || layoutSelection.size < 2,
        onClick: (event) => {
          event.stopPropagation();
          runLayoutCommand(layoutApi.mergeSlots);
        },
      },
      "선택 슬롯 합치기",
    ),
    React.createElement(
      Button,
      {
        variant: "light",
        disabled: busy || layoutSelection.size < 1,
        onClick: (event) => {
          event.stopPropagation();
          runLayoutCommand(layoutApi.splitSlots);
        },
      },
      "선택 슬롯 나누기",
    ),
    React.createElement(
      Button,
      {
        variant: "subtle",
        disabled: busy || layoutSelection.size < 1,
        onClick: (event) => {
          event.stopPropagation();
          setLayoutSelection(new Set());
        },
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
  const slotId = element?.parentElement === dashboard ? Number(element.dataset.slot) : NaN;
  event.preventDefault();
  event.stopPropagation();
  try {
    const result = await dashboardExternalFileDrop(file, slotId, choosePlan, window.FastFigureApi);
    if (result === false) return;
    debugLog("slot:file-drop", {
      slotId, name: file.name,
      kind: window.FastFigureApi.assets.fileKind(file),
    });
  } catch (error) {
    status("불러오기 실패: " + String(error?.message ?? error));
  }
};
return bindDashboardFileDropReceiver(handleDrop);
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
requestAnimationFrame(() => transformWorkspace());
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
        localAction: true, onClick: toggleNavbar,
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
    React.createElement(FoldSection, { title: "오브젝트 설정", initiallyOpen: true }, React.createElement(FastFigureGraphDataEditor)),
    React.createElement(FoldSection, { title: "전역 설정", initiallyOpen: true }, React.createElement(FastFigureGraphLayoutEditor)),
    React.createElement(FastFigureGraphPaletteActions),
    React.createElement(FastFigureGraphFileActions),
    React.createElement(FoldSection, { title: "UI 색상" }, React.createElement(FastFigurePaletteActions)),
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
  return window.fastFigureUiRoot;
}
