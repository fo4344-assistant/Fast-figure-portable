# 계획 004 — Mantine UI 중앙화와 기존 동작 보존

## 1. 문서의 역할

이 문서는 `plan-003.md`를 현재 구현 상태와 최근 감사 기준에 맞게 교정한 후속 계획이다.

`plan-003`의 핵심 방향인 **단일 React + Mantine UI shell**, **UI 공통 규칙 중앙화**, **domain renderer 보존**, **활성 legacy/Mantine UI의 이중 소유 금지**는 유지한다.

다만 다음 항목을 수정한다.

- Mantine 전환을 이유로 EFSM/코어를 바꾸는 것과, Mantine과 독립적으로 정당한 결함 수정·중복 통합·최소복잡도 개선을 구분한다.
- event/action/helper의 내부 형태 자체를 절대 보존 대상으로 두지 않고, 기능 의미와 source of truth를 보존 대상으로 둔다.
- selector/read 경계에 DOM 비의존뿐 아니라 **순수 읽기와 side effect 금지**를 명시한다.
- Modal 사용은 기본 방향으로 유지하되, 기존 사용자 상호작용을 바꾸는 근거로 사용하지 않는다.
- 현재 구현이 `20260901-026`까지 진행된 상태를 기준으로 남은 작업을 다시 정의한다.

이후 Mantine 전환과 관련된 구현 판단은 이 문서를 우선한다. `plan-002`, `plan-003`은 판단 변화와 수정 이유를 추적하기 위해 보존한다.

---

## 2. 최종 목표

Fast Figure의 **일반 사용자 인터페이스 전체**를 하나의 React + Mantine UI shell이 소유하도록 전환한다.

Mantine 전환 대상:
- application shell
- toolbar
- sidebar
- 일반 Button / ActionIcon
- TextInput / NumberInput / Select / Switch / Checkbox 등 form control
- form layout과 control grouping
- Modal / Menu / Tooltip
- asset tree의 조작 UI
- layout / label / caption / print / README UI
- status와 일반 사용자 상태 표시

Mantine 전환 자체의 대상으로 보지 않는 영역:
- Plotly graph surface
- slot/image rendering surface
- layout map, label preview처럼 Fast Figure 고유 좌표계가 핵심인 preview surface
- drag/drop figure surface
- export용 render surface

이들은 UI framework의 대체 대상이 아니라 **domain renderer**다. React/Mantine shell 안에 배치하더라도 그래프·이미지·좌표계 렌더링 자체는 기존 전문 renderer를 재사용한다.

핵심 기준:

> 일반 UI primitive와 공통 UI lifecycle은 Mantine가 소유하고, Fast Figure는 기능 의미·상태 전이·도메인 데이터·도메인 렌더링을 소유한다.

---

## 3. Mantine 도입의 목적

외형 변경이 1차 목적이 아니다.

현재 legacy UI에서 다음 공통 규칙이 CSS selector, DOM 조작, 전역 handler와 개별 함수에 분산되어 있었다.

- 버튼/아이콘 버튼 크기
- 입력 높이
- padding / radius / spacing
- active / disabled / focus 표현
- popup open/close
- Escape / outside click
- focus trap / focus return
- stacking / z-index
- menu positioning
- popup surface 크기와 배치 규칙

Mantine 도입의 성공 여부는 다음으로 판단한다.

1. 같은 UI 규칙의 정의 위치가 줄었는가.
2. 직접 구현한 popup/focus/menu lifecycle 코드가 제거됐는가.
3. 기능 코드가 DOM ID/class와 표시 상태를 덜 알고 있는가.
4. 새 control을 추가할 때 기존 size/focus/popup 규칙을 다시 구현하지 않아도 되는가.
5. 같은 기능 자유도와 세부 동작을 유지하면서 전체 구현 복잡도가 줄었는가.
6. 임시 UI snapshot이나 adapter 값이 새로운 source of truth가 되지 않는가.

---

## 4. 변경 범위 판단 기준

### 4.1 Mantine 때문에 건드려도 되는 영역

Mantine 전환을 위해 다음은 변경하거나 제거할 수 있다.

- 일반 UI markup
- toolbar/sidebar/form 구성
- popup/menu/tooltip lifecycle
- focus/outside-click/Escape 처리
- generic UI CSS
- UI 상태를 DOM에 수동 동기화하는 코드
- UI 입력값을 domain command로 전달하기 위한 adapter
- React external-store binding
- DOM 의존적인 UI selector를 DOM-free selector로 교체하는 작업
- 여러 legacy UI가 같은 기능을 각각 구현하던 경우의 공통 command/helper 통합

### 4.2 Mantine만을 이유로 건드리면 안 되는 영역

다음은 Mantine 전환 자체가 변경 사유가 될 수 없다.

- domain 데이터 의미
- FFPX/FFSX 파일 의미와 호환 규칙
- 그래프 생성 알고리즘
- CSV/image/project import/export 의미
- layout/slot/image domain 동작
- validation의 기능적 의미
- domain EFSM의 사용자 관찰 가능한 전이 의미
- Plotly/image/export renderer의 계산 규칙

### 4.3 Mantine과 독립적으로 허용되는 코어 개선

Mantine 작업 중 코어/EFSM/알고리즘/API 문제를 발견했다고 해서 무조건 보류하거나 롤백하지 않는다.

다음 조건을 모두 만족하면 별도 근거가 있는 개선으로 유지할 수 있다.

- 실제 결함, 상태 불일치, 중복 구현, 잘못된 source of truth, 또는 최소복잡도 위반이 확인됨
- Mantine가 없어도 수정 가치가 있음
- 기존 기능 자유도와 세부 동작을 보존하거나 명백한 버그를 수정함
- 기존 공통 함수/action/validation 경로를 가능한 재사용함
- 관련 없는 영역으로 변경이 확산되지 않음
- patch 설명에 목적, 원인, 변경 범위, 기각안, 회귀 위험, rollback 방법을 구체적으로 기록함
- 해당 변경만 독립적으로 되돌릴 수 있음

`swapSlotContents()` 및 slot content 단위 정리와 같이 이미 확인된 실제 결함 수정은 이 범주에 속한다.

따라서 판단 질문은 다음 순서로 한다.

1. 이 변경은 Mantine 전환 때문에 필요한가?
2. Mantine 때문이 아니라면 독립적으로 정당한 결함 수정 또는 통합인가?
3. 둘 다 아니라면 범위 초과이므로 제거 또는 롤백한다.

---

## 5. source of truth 원칙

각 지속적 의미에는 하나의 source of truth만 둔다.

예:
- overlay open/close 의미: 기존 UI 상태 FSM
- selected asset/graph object: 기존 FSM/domain state
- project name: project/domain state
- persisted form 값: project/domain state
- slot content type: selected slot 또는 기존 pending state
- import된 asset/chart/csv/image 데이터: project/domain model

다음은 source of truth가 아니다.

- React render snapshot
- selector 반환 객체
- form을 열 때 복사한 값
- legacy DOM `.value`
- Mantine component 내부 표시값
- adapter에서 계산한 임시값
- cache/invalidation용 version 값

### 임시 state 허용 조건

commit 전 사용자가 편집 중인 문자열·숫자 입력처럼 아직 domain 의미가 확정되지 않은 값은 React local state로 둘 수 있다.

단:
- domain 값을 장기간 복제하지 않는다.
- 다른 기능이 해당 draft를 읽지 않는다.
- 다른 selector/action의 입력 source로 재사용하지 않는다.
- commit/cancel/open/selection change 시 수명주기가 명확해야 한다.

---

## 6. EFSM 보존 기준

기존 `ApplicationStateMachine`의 lifecycle/workspace/overlay/assetSelection/graphObject 분리는 Mantine 전환을 위해 재설계하지 않는다.

보존해야 하는 것은 **구현 형태 자체가 아니라 상태 의미와 전이 계약**이다.

### Mantine 전환 중 보존
- lifecycle/workspace의 사용자 관찰 가능한 의미
- overlay/assetSelection/graphObject의 상태 의미
- writable guard 의미
- validation 의미
- audit/debug 경로
- project/domain mutation의 권위 있는 경로
- 기존 사용자 행동과 파일 roundtrip 의미

### 내부 정리는 허용
다음은 기능 의미를 보존하면서 더 단순하고 일관적인 구조가 된다면 변경할 수 있다.

- 동일 기능의 중복 action/helper 통합
- 잘못된 event/action 배치 교정
- 실제 결함을 만드는 transition 수정
- DOM adapter와 domain command 분리
- 복수 UI 경로가 같은 command를 재사용하도록 변경

단, 이러한 변경은 Mantine 때문이라는 이유만으로 수행하지 않고 §4.3 조건을 적용한다.

### 제거 또는 renderer 계층으로 이동 가능한 legacy UI side effect
- `element.hidden`
- UI active 표시용 `classList`
- 수동 `aria-expanded`
- native input `.value` 동기화
- popup 위치/z-index 계산
- overlay outside-click/Escape 전역 handler
- focus 수동 복귀
- DOM 표시 상태를 진실로 사용하는 UI 검증

---

## 7. selector/read 계약

React UI가 읽는 selector/model/read helper는 다음 조건을 만족해야 한다.

1. DOM을 source of truth로 읽지 않는다.
2. project/domain/EFSM state를 변경하지 않는다.
3. normalization, validation, cache 갱신, render, notify 등 side effect를 일으키지 않는다.
4. 반환값은 snapshot이며 source of truth가 아니다.
5. 반환 snapshot을 다른 domain 동작의 장기 저장소나 권위 값으로 사용하지 않는다.
6. 필요한 normalization은 순수 계산으로 수행하거나, mutation이 의도된 import/commit/domain command 경계에서 별도로 수행한다.

읽기 함수가 `normalize*()` 계열 함수를 호출할 때는 해당 함수가 실제 state를 수정하는지 먼저 확인한다.

### 현재 확인된 교정 대상

`20260901-025`의 image settings selector 경로는 `normalizeImageSettings(image)`가 `image.settings`를 수정할 수 있으므로 read selector 순수성 기준에 맞지 않는다.

전체 `025`를 롤백하지 않는다.

유지:
- image settings Mantine staging UI
- `applyImageSettingsFromValues(...)`
- 기존 notify/render 경로
- `insertEmptySlotImage()` 공통 command

교정:
- selected image settings read/model helper가 domain state를 수정하지 않도록 최소 패치

---

## 8. React binding

React는 FSM이나 domain model을 대체하지 않는다.

### 읽기
- `ApplicationStateMachine.subscribe()`와 이미 추가된 외부 UI invalidation 경계를 이용한다.
- `useSyncExternalStore`용 snapshot은 immutable하고 versioned하게 유지한다.
- domain-only mutation도 이미 마련된 UI store invalidation 경계를 통해 React를 갱신한다.
- selector는 §7의 순수성 계약을 따른다.

### 쓰기
- Mantine callback → 기존 `appFSM.send(...)` 또는 기존 domain command
- 기존 command가 DOM 입력을 직접 읽는다면 DOM-free values boundary를 먼저 만든 뒤 legacy UI와 Mantine UI가 동일 command를 사용하게 한다.
- DOM을 먼저 수정하고 FSM/domain에 알리는 경로를 새로 만들지 않는다.

새 global state library는 추가하지 않는다.

---

## 9. UI shell과 domain renderer 연결

하나의 활성 React root가 `FastFigureShell`을 렌더링한다.

toolbar/sidebar/modal마다 독립된 active React root를 만들지 않는다.

기존 imperative dashboard/Plotly renderer는 React shell 내부 host/ref를 target으로 사용할 수 있다.

허용:

```text
MainWorkspace
└─ dashboardHostRef
   └─ 기존 Plotly/slot/image renderer
```

금지:
- domain renderer가 일반 Button/form/Modal/Menu를 직접 생성
- Mantine 전환을 이유로 Plotly를 React 구현으로 재작성
- legacy DOM과 Mantine가 같은 UI state를 동시에 소유

---

## 10. Modal과 기존 사용자 동작 보존

Layout, Label, Caption, Print, README는 controlled Mantine `Modal`을 기본 primitive로 사용한다.

이 선택의 목적은 다음 공통 규칙을 Mantine에 맡기기 위함이다.

- open/close
- Escape
- outside click
- focus trap / focus return
- stacking/z-index
- modal surface 크기와 배치

그러나 **Modal이라는 primitive를 선택했다는 이유로 기존 기능 의미나 사용자 상호작용을 바꾸지 않는다.**

각 overlay 전환 전에 다음을 확인한다.

- overlay가 열린 동안 background figure 조작이 실제 기능 요구였는가
- 기존 popup이 비모달이어서 가능했던 작업이 있는가
- drag/preview가 modal 내부에서 동일하게 동작하는가
- close/apply/cancel semantics가 기존과 같은가

기존 기능상 background interaction이 필요하면 Mantine가 제공하는 설정 또는 더 적절한 Mantine primitive를 사용해 동일 semantics를 보존한다.

README처럼 명백히 읽기 전용인 경우에는 일반 Modal 동작을 그대로 사용한다.

---

## 11. 주요 UI 전환 기준

### Toolbar
- Mantine `Button`, `ActionIcon`, `Tooltip`, `Group`
- active/disabled 상태는 실제 FSM/domain state에서 render
- class/dataset/ARIA 수동 sync 제거

### Sidebar
- TextInput, NumberInput, Select, Switch/Checkbox/Button, Stack/Group/Grid 등 Mantine primitive 사용
- 기존 DOM을 1:1 복사하기보다 기능 의미를 공통 component 규칙으로 표현
- project/slot/asset 값은 기존 source of truth에서 읽음

### Layout
- rows/columns, gap/margin, merge/split, layout map, size/aspect, apply/cancel
- layout map은 domain preview surface로 유지
- 기존 `makeSlots()`, slot style 적용 등 domain command 재사용

### Label
- visibility, format/order, font/size, position, preview/drag
- label preview는 domain preview surface 유지
- 위치/visibility/format commit 경로는 기존 공통 command 재사용

### Caption
- visibility, global/per-slot, label/name, bold/font/size/line-height, 본문 편집
- 외부 editor와 popup에 분산된 동일 기능은 하나의 command 계약으로 통합

### Print
- format, DPI, width/height, 자동 비율, validation, save/capture
- 실제 canvas/Plotly/export engine은 유지

### README
- 기존 정적 README 내용을 source로 사용
- popup lifecycle은 Mantine가 소유

### Asset tree/Menu
- tree 데이터와 project operation 의미는 유지
- row ActionIcon/Menu/Tooltip/input은 Mantine 사용
- tree row 자체는 Fast Figure 고유 구조이므로 custom renderer 허용
- legacy/Mantine menu 모두 별도 action semantics를 만들지 않고 동일 action model을 재사용

---

## 12. CSS 정책

### 유지
- dashboard/slot geometry
- Plotly host
- image fit/position
- figure/export surface
- domain preview
- drag/drop surface
- print-only geometry

### Mantine로 중앙화 후 제거
- generic button/input/select 스타일
- toolbar/icon-only button 규칙
- popup surface/z-index
- focus/disabled 중복 규칙
- action row control geometry 중 Mantine layout으로 대체 가능한 부분
- Mantine theme와 중복되는 spacing/size 규칙

Mantine component에 legacy generic class를 계속 붙여 공통 외형을 맞추지 않는다.

공통 값은 `fastFigureTheme`와 Mantine component size/default props에 둔다. 화면 고유 배치는 Mantine layout props 또는 필요한 최소 CSS로 둔다.

---

## 13. 현재 구현 상태 — 20260901-026 이후

### 완료 또는 이미 구축된 기반
- React/ReactDOM 19.2.8 vendoring
- Mantine 9.5.2 vendoring
- offline single-file runtime
- MantineProvider
- `fastFigureTheme`
- Button/ActionIcon/Input 공통 규격
- React/Mantine license notice
- UI coupling inventory 및 review-002
- external-store bridge
- same-target/domain-only mutation용 versioned UI invalidation
- staging `FastFigureShell`
- staging toolbar/sidebar/overlay host
- Layout DOM-free values boundary + Mantine staging
- Label DOM-free values boundary + Mantine staging
- annotation visibility/label reset command 통합
- Caption settings/editor command boundary + Mantine staging
- Print/export values boundary + Mantine staging
- README content staging
- asset action model 통합 + Mantine Menu staging
- project name command + Mantine TextInput staging
- slot content type staging
- file selection 공통 loader + Mantine FileButton staging
- image settings staging
- CSV header model/command staging 및 stale callback 방어

### 확인된 보정 필요
- `20260901-025`: image settings read selector의 잠재적 domain mutation 제거
- slot swap 주변 EFSM 전이(`SLOTS_RESET`, `SELECT_SLOT`, `SLOTS_SWAPPED`) 회귀 검사

### 아직 남은 큰 단계
- 남은 sidebar/control의 Mantine staging 완료
- staging component 전체의 source-of-truth/read-purity 감사
- overlay별 기존 사용자 interaction semantics 확인
- shell cutover 준비 검증
- 단일 active shell cutover
- legacy 일반 UI markup/event/CSS 제거
- 전체 회귀 및 portable 검사

---

## 14. 남은 작업 순서

### 단계 1 — 현재 staging 교정

먼저 이미 추가된 staging/binding이 기준을 위반하지 않는지 정리한다.

1. image settings selector 순수성 교정
2. slot swap 인접 EFSM transition 회귀 검사
3. 기존 selector/model/read helper 전체에 대해 다음 정적 감사
   - domain mutation 여부
   - DOM read 여부
   - snapshot 재사용 여부
   - normalize 함수의 side effect 여부
4. 문제 발견 시 전체 패치 롤백보다 최소 교정 우선

### 단계 2 — Sidebar와 남은 일반 UI staging 완료

아직 legacy에 남아 있는 일반 control을 inventory와 실제 참조를 확인하면서 Mantine staging에 추가한다.

원칙:
- DOM-free values boundary가 이미 있으면 재사용
- 같은 기능의 legacy/Mantine command를 따로 만들지 않음
- 기존 함수가 적합하면 그대로 재사용
- 동일 기능이 분산되어 있으면 하나의 command/action model로 통합 가능
- domain renderer는 건드리지 않음

### 단계 3 — cutover 전 횡단 감사

모든 staging이 준비되면 shell 전체를 대상으로 다음을 검사한다.

- persistent 의미별 source of truth가 하나인지
- React local state가 domain state를 복제하는지
- selector가 순수한지
- 기존 사용자 interaction이 빠지거나 바뀌는지
- legacy와 Mantine가 동일 command semantics를 공유하는지
- DOM required ID가 staging 코드에 새로 생기지 않았는지
- renderer와 UI lifecycle 경계가 유지되는지

### 단계 4 — 단일 shell cutover

한 번의 active ownership 전환에서:

- React root에 `FastFigureShell` mount
- legacy toolbar/sidebar/overlay/menu active markup 제거 또는 비활성화 후 제거
- dashboard/Plotly/domain host를 새 shell에 연결
- UI state → legacy DOM sync 제거
- legacy UI event binding 제거
- 일반 UI required-control 검사 재구성

cutover 전에는 legacy shell만 active이고, cutover 후에는 Mantine shell만 active여야 한다.

### 단계 5 — legacy infrastructure cleanup

cutover 후 호출 관계와 정적 검색을 통해 제거한다.

- popup open/close helper
- global outside-click/Escape UI handler
- manual focus return
- generic button/input/select CSS
- legacy toolbar/sidebar/overlay markup
- UI 상태용 class/hidden/ARIA sync
- 더 이상 필요 없는 DOM IDs와 required control 목록

도메인 renderer에 필요한 CSS/DOM은 이유를 기록하고 유지한다.

### 단계 6 — 회귀 수정

테스트에서 발견된 회귀만 수정한다.

이 단계에서 새로운 UI 구조를 추가하지 않는다.

---

## 15. 패치 작성 원칙

모든 구현 변경은 기존 repository의 diff patch 절차를 따른다.

각 patch 설명에는 최소한 다음을 기록한다.

- 목적
- 실제 문제 또는 변경 근거
- Mantine 전환 때문에 필요한 변경인지, 독립적인 코어 개선인지 분류
- source of truth 변화 여부
- EFSM/domain 의미 변화 여부
- 기존 함수/action 재사용 여부
- 선택한 구현
- 기각한 대안과 이유
- 회귀 위험
- 확인 항목
- rollback 방법

### 최소 패치와 최소 구현의 구분

- 최소 패치: 관련 없는 범위를 건드리지 않는다.
- 최소 구현: 같은 자유도와 세부 동작을 유지하면서 중복·분기·하드코딩·별도 source of truth를 줄인다.

단순히 줄 수가 적다는 이유로 중복 구조를 남기지 않는다.

---

## 16. 테스트와 완료 기준

### 정적 검사
cutover 후 다음을 검색한다.

- legacy toolbar/sidebar/overlay markup
- 일반 UI native button/select/input
- `.hidden` popup lifecycle
- UI active용 `.classList`
- 수동 `aria-expanded`
- popup bounds/position helper
- UI control ID 기반 value sync
- Mantine와 중복되는 generic UI CSS
- read selector 내부의 state mutation
- UI snapshot을 source of truth처럼 재사용하는 경로

남는 항목은 domain renderer 또는 명시적인 compatibility adapter라는 이유가 있어야 한다.

### EFSM/domain
- lifecycle/workspace/overlay/assetSelection/graphObject의 의미 유지
- writable guard/validation 유지
- UI callback이 권위 있는 mutation 경로를 우회하지 않음
- Mantine만을 이유로 기능 전이를 변경하지 않음
- 독립적인 코어 수정은 별도 근거와 회귀 검사가 있음

### UI 기능
- toolbar 모든 action/toggle
- sidebar 모든 control의 초기화/수정/slot 전환/project load
- overlay close/apply/cancel semantics
- Escape/outside-click/focus 동작
- background interaction이 필요한 overlay의 기존 기능 보존
- Layout merge/split/map/apply
- Label preview/drag/font/position
- Caption global/per-slot/body/style/roundtrip
- Print DPI/size/ratio/save
- Asset select/rename/move/create/delete/menu keyboard

### 핵심 회귀
- CSV/TSV/JSON import
- graph creation
- image import
- drag/drop
- slot swap/grid rebuild
- `SLOTS_RESET` / `SELECT_SLOT` / `SLOTS_SWAPPED`
- FFSX/FFPX import/export
- project reload
- debug log
- start → function call → end

### portable
- `file://` 실행
- runtime 외부 네트워크 의존성 0
- console error 없음
- single `Fast-figure.html`

---

## 17. 중단 또는 재검토 조건

다음이면 해당 변경을 그대로 진행하지 않는다.

- Mantine 편의를 위해 domain/EFSM 의미를 바꿔야 함
- React가 지속적 domain/FSM state를 별도 source of truth로 복제함
- read selector가 domain state를 수정함
- legacy와 Mantine가 같은 UI state를 동시에 소유함
- Mantine 위에 popup/focus/outside-click framework를 다시 구현함
- toolbar/sidebar 일부를 최종 legacy로 남김
- Plotly/figure renderer를 Mantine 전환만을 이유로 재작성함
- single-file/offline 또는 FFPX/FFSX 호환을 깨뜨림
- 관련 없는 domain 로직을 변경함
- 기존 사용자 상호작용이 Modal 선택 때문에 사라짐

단, 실제 결함 수정이나 구조 통합이 §4.3 조건을 충족한다면 “코어를 건드렸다”는 이유만으로 중단하지 않는다.

---

## 18. 완료 조건

다음을 모두 만족해야 Mantine 전환 완료로 본다.

1. 일반 application UI가 하나의 React/Mantine shell에 있다.
2. toolbar/sidebar/일반 form/menu가 Mantine를 사용한다.
3. 주요 overlay의 공통 lifecycle을 Mantine가 소유한다.
4. 기존 사용자 interaction semantics가 보존된다.
5. 공통 control 규칙이 theme/default props에서 재사용된다.
6. Fast Figure가 focus/outside-click/Escape/stacking을 중복 구현하지 않는다.
7. 기능/domain EFSM과 UI state region의 의미가 유지된다.
8. UI state → legacy DOM 표시 sync가 제거된다.
9. read selector가 DOM/state mutation 없이 순수하다.
10. 지속적 의미마다 source of truth가 하나다.
11. custom rendering은 domain renderer로 제한된다.
12. legacy 일반 UI CSS/DOM/event binding이 제거된다.
13. Mantine과 독립적으로 수행한 코어 개선은 각각 독립 근거와 rollback 기록이 있다.
14. 전체 회귀 테스트와 portable 실행을 통과한다.

---

## 19. 선택하지 않는 방향

- 일부 일반 UI만 Mantine로 남기는 최종 구조
- toolbar부터 active 전환하고 sidebar는 나중에 바꾸는 구조
- legacy DOM에 여러 active React Portal을 삽입하는 migration architecture
- Mantine primitive 위에 별도 popup/focus/outside-click framework를 다시 만드는 구조
- Mantine 도입을 이유로 EFSM/domain 의미를 재설계하는 것
- Plotly/figure renderer의 불필요한 React 재작성
- legacy generic CSS 위에 Mantine style을 덧씌우는 방식
- DOM `.value`를 React/domain의 권위 값으로 계속 사용하는 방식
- read selector 안에서 normalization mutation을 수행하는 방식
- “코어 변경 금지”를 이유로 확인된 결함이나 중복 구조를 그대로 보존하는 방식

---

## 20. 다음 실제 작업

다음 구현 순서는 새 UI 추가보다 **현재 staging의 기준 위반 교정**이 먼저다.

1. `20260901-025` image settings read selector의 side effect 제거
2. `SLOTS_RESET` / `SELECT_SLOT` / `SLOTS_SWAPPED` 회귀 검사
3. `20260901-002`~`026`에서 추가된 selector/model/read helper의 순수성 및 source-of-truth 횡단 감사
4. 문제가 없거나 교정이 끝나면 남은 sidebar/general UI staging 계속 진행
5. staging 완료 후 cutover 전 횡단 감사
6. 단일 shell cutover
7. legacy UI infrastructure cleanup
8. 전체 회귀 및 portable 검사

이 순서 동안 Mantine 전환과 독립적으로 발견되는 실제 코어 결함은 별도 patch 근거와 rollback 설명을 갖추어 함께 수정할 수 있다.