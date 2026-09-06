# 계획 003 — Mantine 전면 UI 전환 및 EFSM 경계 보존

## 1. 문서의 역할

이 문서는 `plan-002.md`의 후속 교정 계획이다. `plan-002`는 Mantine 도입 목적 자체는 올바르게 잡았지만, 실제 이행 방법이 점진적 혼합 구조로 기울면서 사용자의 의도와 어긋날 위험이 생겼다.

이후 Mantine 전환에 관한 구현 판단은 이 문서를 우선한다. `plan-002`는 이전 판단과 수정 이유를 추적하기 위해 보존한다.

---

## 2. 최종 목표

Fast Figure의 **일반 사용자 인터페이스 전체**를 하나의 React + Mantine UI shell이 소유하도록 전환한다.

Mantine 전환 대상:
- application shell
- toolbar
- sidebar
- 일반 button / ActionIcon
- TextInput / NumberInput / Select / toggle
- form layout과 control grouping
- Modal / Menu / Tooltip
- asset tree의 조작 UI
- layout / label / caption / print / README UI
- status와 일반 사용자 상태 표시

Mantine로 억지로 재작성하지 않는 대상:
- Plotly graph surface
- slot/image rendering surface
- layout map, label preview처럼 Fast Figure 고유 좌표계가 핵심인 preview surface
- drag/drop figure surface
- export용 render surface

이들은 UI framework의 대체 대상이 아니라 **domain renderer**다. 최종적으로도 React/Mantine shell 안에 배치되지만, 그래프·이미지 렌더링 자체는 기존 전문 renderer를 재사용할 수 있다.

핵심 기준은 다음과 같다.

> 일반 UI primitive는 Mantine가 소유하고, Fast Figure는 기능 의미·상태 전이·도메인 렌더링만 소유한다.

---

## 3. Mantine 도입의 가장 중요한 이유

외형 변경이 1차 목적이 아니다. 현재 Fast Figure에서 다음 공통 규칙이 CSS selector, DOM 조작, 전역 handler와 개별 함수에 분산되어 있다.

- 버튼/아이콘 버튼 크기
- 입력 높이
- padding / radius / spacing
- active / disabled / focus 표현
- popup open/close
- Escape / outside click
- focus trap / focus return
- stacking / z-index
- menu positioning

이 구조는 새 UI를 추가할 때 같은 규칙을 복사하게 만들고, 한 군데 누락으로 회귀가 생기며, 기능 코드가 DOM 구조를 알아야 하는 문제를 만든다.

Mantine 도입 성공 여부는 다음으로 판단한다.
1. 공통 규칙의 정의 위치가 줄었는가.
2. 직접 구현한 UI lifecycle 코드가 제거됐는가.
3. 기능 코드가 DOM ID/class를 덜 알고 있는가.
4. 새 control을 추가할 때 기존 size/focus/popup 규칙을 다시 구현하지 않아도 되는가.
5. 같은 기능 자유도를 유지하면서 UI 구현 복잡도가 줄었는가.

---

## 4. 기존 계획에서 발견한 문제

### 4.1 기능별 점진적 활성 전환

`plan-002`는 toolbar → README → Label → Print → Caption → Layout → Sidebar 순으로 활성 UI를 교체하려 했다.

이 방법은 중간에 다음 구조를 만든다.

```text
Mantine toolbar + legacy sidebar
Mantine Modal + legacy popup sync
Mantine theme + legacy generic UI CSS
React render + imperative DOM render
```

Mantine 도입 목적이 UI 규칙 통합인데 이행 중에는 오히려 두 UI 체계를 동시에 유지하게 된다.

**수정:** 코드는 여러 커밋으로 준비하되, 사용자에게 보이는 활성 UI의 소유권은 한 번의 shell cutover에서 통째로 넘긴다.

cutover 전에는 legacy UI 한 벌만 활성이고, cutover 후에는 Mantine UI 한 벌만 활성이다.

### 4.2 migration Portal을 아키텍처처럼 사용하려 한 문제

toolbar만 먼저 옮기기 위해 legacy DOM 위치에 React Portal을 꽂는 방향을 검토했다. Portal 자체는 정상 기능이지만, migration 수단으로 여러 곳에 쓰면 legacy shell과 React shell의 소유권이 섞인다.

**수정:** 하나의 React root가 application shell을 직접 소유한다. Portal은 Mantine Modal/Menu/Tooltip이 원래 필요로 하는 rendering 용도로만 사용하고 legacy toolbar/sidebar에 부분 삽입하는 방법으로 사용하지 않는다.

### 4.3 popup 사용자 행동을 분석하기 전에 비모달을 유지하려 한 문제

기존 popup 모양을 기능 요구로 착각해 layout/label/caption/print를 비모달 도구 패널로 유지하려 했다.

실제 작업은:
- Layout: 설정 + layout map + 적용
- Label: 설정 + popup 내부 preview/drag
- Caption: 설정 + 본문 편집
- Print: 출력 조건 + 저장
- README: 읽기

이며 배경 figure를 직접 조작해야 할 필수 동작이 없다.

**수정:** 현재 주요 overlay는 controlled Mantine `Modal`로 전환한다. Caption은 기존 외부 editor를 modal 내부 작업 흐름으로 합친다.

### 4.4 Mantine 위에 자체 UI primitive를 다시 만들려 한 문제

`AppToolPanel`처럼 위치·Escape·outside-click·stacking을 다시 처리하는 wrapper는 Mantine 사용 목적과 충돌한다.

**수정:** Button, ActionIcon, Input, Modal, Menu, Tooltip, Group/Stack/Grid 등 Mantine primitive를 직접 사용한다. Wrapper는 Fast Figure 고유 의미와 event mapping이 실제로 반복될 때만 허용하고 단순 style/popup wrapper는 만들지 않는다.

### 4.5 `@mantine/modals` 표현의 모호성

“초기에는 사용하지 않는다”는 표현은 나중 사용을 암시했지만 실제 사용 계획이 없었다.

**수정:** 현재 설계에서는 사용하지 않는다. overlay state owner는 기존 UI 상태 FSM이며 `@mantine/core` controlled Modal로 충분하다. 미래의 막연한 의존성은 계획에 넣지 않는다.

### 4.6 이미 분리된 EFSM을 다시 분리해야 하는 것처럼 표현한 문제

현재 `ApplicationStateMachine`은 직교 region으로 lifecycle/workspace와 overlay/assetSelection/graphObject를 분리한다. 기능/domain EFSM과 UI 상태가 논리적으로 이미 나뉘어 있다.

실제 문제는 일부 region callback과 주변 함수가 다음처럼 **legacy DOM renderer**를 직접 만지는 것이다.

```text
FSM/UI state
→ hidden/class/value/aria 직접 수정
→ popup 위치 계산
→ DOM 상태를 다시 검사
```

**수정:** EFSM을 재설계하지 않는다. 기능 event/action, writable guard, validation, overlay/selection 의미는 유지한다. React가 상태를 구독하고 Mantine가 렌더링하도록 바꾸며, UI state → legacy DOM side effect만 제거한다.

### 4.7 Sidebar를 후순위로 둔 문제

Sidebar는 input/select/toggle/asset UI의 대부분을 포함한다. toolbar만 Mantine이고 sidebar가 legacy면 전체 UI 전환도 아니고 theme 중앙화 효과도 검증할 수 없다.

**수정:** Sidebar는 shell cutover의 필수 구성 요소다.

### 4.8 완료 조건이 느슨했던 문제

“각 vertical slice 전환 완료”만으로는 legacy control/CSS/handler가 남아도 완료처럼 보일 수 있다.

**수정:** cutover 후 정적 검색으로 legacy 일반 UI markup, imperative sync, popup lifecycle, generic UI CSS의 잔존 여부를 검사한다. 남는 항목은 domain renderer라는 이유가 명확해야 한다.

---

## 5. 현재 구현 상태

이미 반영됨:
- React/ReactDOM 19.2.8 vendoring
- Mantine 9.5.2 vendoring
- offline single-file runtime
- MantineProvider
- `fastFigureTheme`
- Button/ActionIcon/Input 38px 공통 규격
- 14px control font, 6px radius
- React/Mantine license notice

아직 전환되지 않음:
- 실제 application shell
- toolbar
- sidebar
- overlay UI
- asset action/menu UI
- legacy UI CSS
- direct DOM UI sync
- popup lifecycle code

따라서 다음 작업은 dependency 추가가 아니라 실제 UI ownership 전환이다.

---

## 6. 목표 구조

```text
Project / domain model
        ▲
        │ read / mutation
ApplicationStateMachine
├─ lifecycle
├─ workspace
├─ overlay
├─ assetSelection
└─ graphObject
        │ subscribe / event
        ▼
React binding
        ▼
MantineProvider
└─ FastFigureShell
   ├─ Toolbar
   ├─ Sidebar
   ├─ MainWorkspace
   │  └─ DomainRenderSurface
   ├─ OverlayHost
   │  ├─ LayoutModal
   │  ├─ LabelModal
   │  ├─ CaptionModal
   │  ├─ PrintModal
   │  └─ ReadmeModal
   └─ Asset/Menu UI
```

`DomainRenderSurface`는 별도 UI framework가 아니다. Plotly, image, slot, preview처럼 애플리케이션 고유 시각화만 담당한다.

---

## 7. EFSM 보존 원칙

### 유지
- event 이름과 의미
- lifecycle/workspace 전이
- overlay/assetSelection/graphObject 의미
- project mutation action
- writable guard
- validation
- audit/debug 경로

### 제거 또는 renderer 계층으로 이동 가능
- `element.hidden`
- UI active용 `classList`
- 수동 `aria-expanded`
- native input `.value` sync
- popup 위치/z-index
- overlay outside-click/Escape 전역 handler
- focus 수동 복귀
- DOM 상태를 진실로 사용하는 UI 검증

### 상태의 권위
- overlay open: FSM
- selected asset/graph object: 기존 FSM/domain state
- persisted form 값: project/domain state
- commit 전 임시 문자열: 필요한 경우에만 React local state
- hover/focus/menu highlight: Mantine presentation state

같은 의미를 React state와 FSM에 복제하지 않는다.

---

## 8. React binding

React는 FSM을 대체하지 않는다.

읽기:
- `ApplicationStateMachine.subscribe()`를 external store 경계로 사용
- 가능하면 `useSyncExternalStore` 사용
- UI가 필요한 값은 DOM을 반환하지 않는 selector로 계산

쓰기:
- Mantine callback → 기존 `appFSM.send(...)` 또는 기존 domain action
- Modal `onClose` → `CLOSE_OVERLAY`
- DOM을 먼저 수정하고 FSM에 알리는 경로 금지

새 global state library는 추가하지 않는다.

---

## 9. UI shell과 domain renderer 연결

하나의 활성 React root가 `FastFigureShell`을 렌더링한다. toolbar/sidebar/modal마다 별도 root를 만들지 않는다.

기존 imperative dashboard/Plotly renderer는 안정적이면 React shell 내부의 host/ref를 target으로 사용할 수 있다.

허용:
```text
MainWorkspace
└─ dashboardHostRef
   └─ 기존 Plotly/slot renderer
```

금지:
- domain renderer가 일반 button/form/modal/menu를 생성
- Mantine 전환을 이유로 Plotly를 불필요하게 React로 재작성

---

## 10. 주요 UI의 구체적 전환

### Toolbar
`Button`, `ActionIcon`, `Tooltip`, `Group` 사용. active state는 `appFSM.state.overlay` 등 실제 상태에서 render한다. class/dataset/aria 직접 sync를 제거한다.

### Sidebar
TextInput, NumberInput, Select, Switch/Checkbox/Button, Stack/Group/Grid 등으로 전체 전환한다. 기존 DOM을 1:1 복사하지 않고 기능 의미를 Mantine primitive로 표현한다.

### Layout Modal
rows/columns, gap/margin, merge/split, layout map, size/aspect, apply/cancel을 modal 안에 둔다. layout map은 domain preview surface로 유지한다.

### Label Modal
visibility, format/order, font/size, position, preview/drag를 modal 안에 둔다.

### Caption Modal
visibility, global/per-slot, label/name, bold/font/size/line-height, 본문 편집을 하나의 작업 단위로 합친다.

### Print Modal
format, DPI, width/height, 자동 비율, validation, save/capture를 포함한다.

### README Modal
읽기 전용 controlled Modal.

### Asset tree/Menu
트리 데이터와 project operation은 유지한다. row 내부 ActionIcon/Menu/Tooltip/input은 Mantine를 사용한다. tree row 자체는 Fast Figure 고유 구조이므로 custom renderer를 허용한다.

---

## 11. CSS 정책

유지:
- dashboard/slot geometry
- Plotly host
- image fit/position
- figure/export surface
- domain preview
- drag/drop surface
- print-only geometry

제거:
- generic button/input/select 스타일
- toolbar/icon-only button 규칙
- popup surface/z-index
- focus/disabled 중복
- action row control geometry
- Mantine theme와 중복되는 spacing/size 규칙

Mantine component에 legacy generic class를 계속 붙여 외형을 맞추지 않는다. 공통 값은 theme, 화면 고유 배치는 Mantine layout props 또는 최소 CSS로 둔다.

---

## 12. 커밋 및 패치 전략

모든 논리 커밋은 같은 순번의 `.patch`와 `.md` 설명 파일을 가진다.

### Commit A — coupling inventory와 binding 경계
- toolbar/sidebar/control ID와 event binding 조사
- overlay callback과 DOM side effect 조사
- global click/keydown, popup bounds, active/aria sync 조사
- dashboard/Plotly/layout/label preview target 조사
- 각 참조를 다음으로 분류
  - A: domain renderer 핵심 — 유지
  - B: UI state → legacy DOM adapter — React binding으로 교체
  - C: 순수 legacy UI infrastructure — 제거
- 필요한 순수 selector/binding helper만 추가
- 활성 UI는 legacy 그대로 유지

### Commit B — Mantine shell 준비
비활성 상태로 다음 component tree를 구현한다.
- FastFigureShell
- Toolbar
- Sidebar
- OverlayHost 및 모든 Modal
- Asset/Menu UI

조건:
- 새 state owner 금지
- migration Portal 삽입 금지
- legacy UI와 동시에 interactive하게 만들지 않음
- 기존 UI 동작에는 영향 없음

### Commit C — 단일 cutover
한 커밋에서 활성 UI ownership을 넘긴다.
- React root에 `FastFigureShell` mount
- legacy toolbar/sidebar/overlay/menu markup 제거
- legacy UI event binding 제거
- dashboard/Plotly host를 새 shell에 연결
- UI state → DOM sync 제거
- legacy control 존재를 강제하는 검사 재구성

이 커밋 이후 일반 사용자 UI는 Mantine만 사용한다.

### Commit D — legacy UI infrastructure cleanup
cutover 뒤 호출 여부를 검색해 남은 legacy popup/button/input CSS와 handler를 제거한다. C에서 안전하게 없앨 수 있는 것은 C에서 제거하고, 호출 관계 확인이 필요한 것만 D에 남긴다.

### Commit E — 회귀 수정
테스트에서 발견된 기능 회귀만 수정한다. 새 UI 체계를 추가하는 단계가 아니다.

---

## 13. 왜 이 순서를 선택하는가

전체 파일 재작성은 EFSM/import/export/renderer까지 불필요하게 건드리므로 사용하지 않는다. diff patch 원칙을 유지한다.

반대로 toolbar부터 활성 전환하는 방식도 사용하지 않는다. 활성 UI 두 벌을 유지하면 CSS/event/render/test 조합이 늘어나 Mantine 도입 목적과 충돌한다.

따라서:
- 준비와 검증은 커밋으로 나눔
- 실제 활성 UI 전환은 shell 단위로 한 번에 수행
하는 방식을 선택한다.

---

## 14. 테스트와 완료 기준

### 정적 검사
cutover 후 다음을 검색한다.
- legacy toolbar/sidebar/overlay markup
- 일반 UI native button/select/input
- `.hidden` popup lifecycle
- UI active용 `.classList`
- 수동 `aria-expanded`
- popup bounds
- UI control ID 기반 value sync
- Mantine와 중복되는 generic UI CSS

남는 항목은 domain renderer에 필요한 이유가 있어야 한다.

### EFSM
- lifecycle/workspace/overlay/assetSelection/graphObject 의미 유지
- writable guard/validation 유지
- UI callback이 mutation 경로를 우회하지 않음
- React local state에 FSM/domain state 복제 없음

### UI 기능
- toolbar 모든 action/toggle
- sidebar 모든 control의 초기화/수정/slot 전환/project load
- Modal Escape/outside-click/focus/background blocking
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

## 15. 중단 조건

다음이면 해당 패치를 적용하지 않는다.
- UI 편의를 위해 기능 EFSM 의미를 바꿔야 함
- React가 FSM/domain state를 복제함
- legacy와 Mantine가 같은 UI state를 동시에 소유함
- Mantine 위에 popup/focus/outside-click framework를 다시 만듦
- toolbar/sidebar 일부를 최종 legacy로 남김
- Plotly를 Mantine 전환 이유만으로 재작성함
- single-file/offline 또는 FFPX/FFSX 호환을 깨뜨림
- 관련 없는 domain 로직을 광범위하게 변경함

---

## 16. 완료 조건

다음을 모두 만족해야 Mantine 전환 완료로 본다.
1. 일반 application UI가 하나의 React/Mantine shell에 있다.
2. toolbar/sidebar/일반 form/menu가 Mantine다.
3. 주요 overlay가 controlled Mantine Modal이다.
4. 공통 control 규칙이 theme에서 재사용된다.
5. Fast Figure가 focus/outside-click/Escape/stacking을 중복 구현하지 않는다.
6. 기능/domain EFSM과 UI state region 의미가 유지된다.
7. UI state → legacy DOM 표시 sync가 제거된다.
8. custom rendering은 domain renderer로 제한된다.
9. legacy 일반 UI CSS/DOM/event binding이 제거된다.
10. 전체 회귀 테스트와 portable 실행을 통과한다.

---

## 17. 선택하지 않는 방향

- 일부 UI만 Mantine로 남기는 최종 구조
- toolbar부터 활성 전환하고 sidebar는 나중에 바꾸는 구조
- legacy DOM에 여러 React Portal을 삽입하는 migration architecture
- 자체 `AppToolPanel`
- 현재의 `@mantine/modals`
- EFSM 재설계
- Plotly/figure renderer의 불필요한 React 재작성
- legacy generic CSS 위에 Mantine style을 덧씌우는 방식

---

## 18. 다음 실제 작업

첫 구현은 Commit A다. 현재 `Fast-figure.html`의 UI coupling inventory를 작성한다.

반드시 조사할 항목:
- toolbar element/event
- sidebar control/sync
- overlay DOM/EFSM callback
- `REQUIRED_CONTROL_IDS`
- global click/keydown
- popup bounds
- active/aria sync
- asset menu
- caption editor
- dashboard/Plotly target
- layout/label preview
- project load 및 selected slot 변경 후 UI sync

각 항목을 A(domain renderer 유지), B(React binding으로 교체), C(legacy UI infrastructure 제거)로 분류한 뒤 실제 패치를 작성한다.

이후 Commit A → B → C → D → E 순으로 진행한다.
