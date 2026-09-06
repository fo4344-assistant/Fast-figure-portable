# Review 010 — Mantine UI functional inventory

기준: `1.1.30-alpha` / `20260906-038` 적용 직후.

이 문서는 `plan-006` 8절의 기능 inventory다. 목적은 legacy markup을 보존하는 것이 아니라, Mantine 구현에서 사용자 기능과 기존 FSM/EFSM/project 의미를 빠뜨리지 않도록 기준을 고정하는 것이다.

## 공통 구조

- 상태/전이 authority: 기존 `ApplicationStateMachine` (`appFSM`).
- React 동기화: 기존 `appFSM.subscribe()`와 `appFSM.state.revision`을 직접 사용한다. 별도 migration store/bridge를 만들지 않는다.
- project/model authority: 기존 `activeProject`, project object/class, selected slot/chart/asset 상태.
- 기능 renderer 유지: Plotly dashboard, slot/image surface, layout map, label preview, caption/export geometry.
- Mantine component callback은 기존 `appFSM.send(...)`, 기존 command, 또는 UI와 독립적인 값 기반 command를 직접 호출한다.
- legacy DOM `.click()`, `.value`, dialog clone을 Mantine 경로에서 사용하지 않는다.

## Shell / toolbar

기존 UI:
- `layoutToggle`: overlay `layout` 토글.
- `labelToggle`: overlay `label` 토글.
- `captionToggle`: overlay `caption` 토글.
- `printToggle`: overlay `print` 토글.
- `targetInfo`: project workspace에서는 `빈 슬롯 또는 그래프를 선택하세요.`, graph/image workspace에서는 선택 슬롯의 행/열 표시.
- sidebar resize/collapse: `sidebarResizer`, `sidebarToggle`.

FSM:
- 네 toolbar overlay 모두 `appFSM.send("TOGGLE_OVERLAY", { overlay, source: "toggle" })`.
- overlay 상태는 `appFSM.state.overlay`.
- workspace 상태는 `appFSM.state.workspace`.

Mantine 대응:
- `AppShell`, `Group`, `Button`, `ActionIcon`, `Text`.
- overlay open state는 appFSM에서 직접 읽는다.
- 버튼 자체가 별도 open state를 소유하지 않는다.

## 데이터 / asset tree

기존 기능:
- CSV/TSV/JSON/image 파일 추가, multiple import.
- drag/drop import 및 project data tree 이동.
- asset tree directory 생성.
- 선택 asset 다운로드.
- 선택 asset 작업 menu.
- CSV/image asset selection.
- CSV header line 수 설정.
- 빈 이미지 삽입.
- 선택 슬롯 초기화.
- 선택 asset 삭제.
- status 표시와 CSV preview table.
- `/assets`, `/assets/csv`, `/assets/images`, `/assets/trash` VFS 구조 및 trash 의미.
- 충돌 시 replace/rename 선택 의미 보존.

유지해야 할 상호작용:
- tree keyboard focus/selection.
- drag source/target 정책.
- referenced CSV/image 삭제 cascade 확인.
- default/보호 asset 삭제 제한.
- multi-file import 순서와 이름 충돌 처리.

Mantine 대응:
- `Tree`/목록 primitive + `Menu`, `FileButton`, `ActionIcon`, `NumberInput`, confirmation/input/choice `Modal`.
- VFS/asset command는 기존 구현을 직접 호출한다.

## Project

- `projectName`: 최대 120자, trim 후 project model에 저장.
- FFPX export.
- FFPX import.
- slot 선택 중 project import 금지 상태/메시지 유지.
- import/export lifecycle (`importing`, `exporting`) 및 busy/disable 의미 유지.

## Image editor

값:
- fit mode: `contain`, `cover`, `manual`.
- manual scale: 1–1000%.
- X/Y: -100–200%.
- selected image preview.

동작:
- 값 변경 즉시 project image settings와 slot image renderer에 반영.
- `appFSM.notify("images", "IMAGE_SETTINGS_CHANGED")` 의미 유지.

Mantine 대응:
- `Select`, `NumberInput`, image preview host.

## Graph editor

파일/편집:
- FFSX export.
- Plotly JSON export.
- FFSX/Plotly JSON import.
- editable toggle.

전역 설정:
- legend/title/zero-line toggle.
- title text.
- graph font family.
- title/legend font size.
- X bottom/top, Y left/right axis settings. 현재 동적 `axisFields()` renderer가 생성하는 모든 값과 범위를 보존한다.

Graph object:
- X/Y column and axis side.
- type: scatter line, markers, lines+markers, bar, hidden.
- line width 0.1–20, dash styles.
- marker symbols, size 1–40.
- bar opacity 0.05–1, border width 0–10.
- legend name.
- add object.
- object selection/delete/reorder drag.
- object color 편집.
- graph palette reset/save/load.

Renderer:
- Plotly renderer와 imported Plotly state 유지.
- Plotly relayout에 따른 axis range model 반영 유지.

## UI palette

지속 값:
- uiColor
- uiBackgroundColor
- uiSurfaceColor
- uiMutedColor
- uiSubtleColor
- uiDisabledBgColor
- uiDisabledTextColor
- uiShadowColor
- paperColor
- fontColor

동작:
- apply 시 `activeProject.appearance.uiPalette` 갱신.
- CSS/theme projection과 dashboard rerender.
- reset은 `DEFAULT_UI_PALETTE` 의미 유지.
- `appFSM.notify("ui", "UI_PALETTE_CHANGED")` 유지.

Mantine 대응:
- `ColorInput` + apply/reset controls.
- 최종 cutover에서는 Mantine theme/CSS variables projection으로 통합하되 project palette가 authority다.

## Debug / status

- debugging on/off.
- log save.
- clear.
- visible debug log.
- status/status messages.
- debug sequence/logging semantics 유지.

## README

- README content 전체 표시.
- close.
- link navigation.
- overlay는 appFSM `readme` 상태가 authority.
- final UI는 Mantine `Modal`/scroll area가 소유하고 legacy `<dialog>` lifecycle은 제거한다.

## Layout

값:
- rows/cols 1–8.
- reference width 100–20000 px.
- slot gap 0–2000 px.
- outer margin 0–5000 px.
- radius 0–2000 px.
- aspect 0.1–10, 기본 1.618 reset.
- slot border toggle.
- dashboard zoom 50–200%, reset 100%, lock.

동작:
- apply grid.
- multi-slot merge.
- merged slot split.
- layout map selection.
- layout map geometry와 actual dashboard geometry 대응.
- panel resize drag.
- overlay 중 dashboard interaction 제한.

FSM/commands:
- overlay: `TOGGLE_OVERLAY(layout)`.
- grid 변경은 기존 `GRID_LAYOUT_CHANGED` action/command 경로 유지.
- merge/split은 기존 `mergeSelected` / `splitSelected`와 corresponding notify 의미 유지.

## Label

값/동작:
- enabled.
- format: lower/upper alpha, decimal, lower/upper roman.
- parentheses.
- row-major/column-major.
- font family.
- font size: 최소 6, 상한 없음.
- X/Y position: px 기준.
- position reset.
- preview label pointer drag.
- preview slot aspect/geometry와 실제 slot geometry 비율 일치.
- drag clamp를 포함한 기존 이동 범위 의미 유지.

Renderer:
- 기존 label preview geometry renderer와 dashboard label renderer 유지.

## Caption

- enabled.
- whole/slot caption mode.
- slot captions insertion.
- target info.
- caption name.
- name bold.
- font family.
- font size 6–96 (현재 source 기준).
- line height 0.8–4.
- dashboard caption contenteditable editing.
- caption width/outer-margin/layout sync.

## Print / export

- PNG/JPEG.
- DPI 36–1200.
- width 100–20000.
- height 100–20000 또는 빈 값이면 비율 자동 계산.
- save.
- capture.
- print status.
- export validation, pixel size 계산, dashboard/caption/label geometry 유지.

## Confirmation / input / choice

최종 Mantine generic UI lifecycle로 통합할 항목:
- slot reset confirm.
- referenced asset delete confirm.
- trash/move 관련 confirm.
- new folder text input.
- import collision replace/rename choice.

공통 규칙:
- 동일한 Mantine Modal close/Escape/outside-click/focus-return 규칙 사용.
- domain command는 confirmation UI와 분리하되 별도 migration bridge는 만들지 않는다.
- 비동기 file collision choice에서 File/DataTransfer object 수명 문제를 피하기 위해 필요한 data snapshot만 유지한다.

## Cutover acceptance

- inventory 항목 전부 Mantine UI에서 접근 가능.
- appFSM/project/domain state만 authority.
- React local state는 입력 draft/temporary modal state만 허용.
- Plotly/slot/image/layout/label/export renderer 기능 축소 없음.
- FFPX/FFSX/Plotly roundtrip 보존.
- legacy DOM ID를 Mantine callback이 호출하지 않음.
- single React root.
- cutover 전 legacy active, cutover 후 Mantine active 한 벌만 존재.
