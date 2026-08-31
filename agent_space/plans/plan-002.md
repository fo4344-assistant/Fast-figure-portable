# 계획 002 — Mantine 기반 UI 공통화

## 1. 목적

Fast Figure의 UI를 Mantine 기반으로 교체한다.

이번 작업의 1차 목적은 외형 변경이 아니다. 현재 UI에서 버튼 크기, 입력 높이, 간격, 팝업 열기/닫기, outside-click, Escape 처리, focus, stacking, 활성/비활성 상태 표현, 아이콘 버튼 크기처럼 공통이어야 하는 규칙이 여러 CSS 선택자와 이벤트 처리 코드에 반복되어 있는 문제를 제거하는 것이 핵심이다.

Mantine 도입 후에는 공통 규칙을 가능한 한 다음 계층에서 한 번만 정의한다.

1. `MantineProvider` theme
2. Mantine component default props / component CSS variables
3. Mantine가 직접 제공하는 interaction primitive
4. Fast Figure 고유 의미가 반복되는 경우에만 최소한의 wrapper
5. 개별 화면은 위 규칙을 조합하고, 크기·padding·popup lifecycle을 다시 구현하지 않는다.

성공 기준은 "Mantine처럼 보이는 UI"가 아니라 동일한 UI 규칙을 여러 위치에서 수동 동기화하던 코드가 제거되는 것이다.

특히 다음 기준을 강제한다.

> Mantine 도입으로 기존 자체 UI 공통화 코드의 양이 줄어야 한다. Mantine 위에 동일 기능의 자체 UI 추상화 계층을 다시 만드는 변경은 실패로 간주한다.

---

## 2. 현재 확인된 구조적 문제

현재 `Fast-figure.html`에는 일부 CSS 변수가 있으나 실제 컴포넌트 규칙은 여러 선택자에서 반복 정의된다.

예를 들면 버튼 하나에 대해서도 다음 계층들이 따로 존재한다.

- 전역 `button`
- `button.light`
- `.toolbar button`
- `.layout-actions > button`
- `.annotation-controls button`
- `.caption-actions button`
- `.print-actions button`
- `.asset-tree-toolbar button`
- `.icon-only`
- 개별 ID 예외 규칙

현재 공통 높이 `--toolbar-control-height: 38px`가 존재하지만 각 위치에서 `height`, `width`, `margin`, `padding`, `white-space`를 다시 설정한다. 따라서 새 버튼이나 새 패널을 추가할 때 기존 규칙을 정확히 재사용하기 어렵고 작은 차이가 누적된다.

팝업 계열도 유사하다.

- EFSM의 `overlay` region이 논리 상태를 관리한다.
- 실제 표시는 `hidden` class를 직접 변경한다.
- `syncPopupBounds()`가 위치와 폭을 직접 계산한다.
- 전역 `keydown` handler가 Escape를 처리한다.
- 전역 `click` handler가 outside-click을 판정한다.
- 각 overlay DOM과 toggle button의 일치 여부를 별도 검증한다.

Mantine 도입 후에는 UI primitive가 이미 제공하는 표시·접근성·focus·키보드·stacking·outside-click 처리를 Fast Figure가 다시 구현하지 않는다.

---

## 3. 책임 경계

### 3.1 Domain / project state

다음과 같은 실제 프로젝트 상태를 소유한다.

- slots
- graph
- image
- caption
- layout settings
- labels
- assets
- export settings

### 3.2 EFSM

EFSM은 의미 상태와 허용 전이를 소유한다.

예:

- 어떤 overlay가 열려 있는가
- 현재 workspace가 graph인지 image인지
- 어떤 mutation이 허용되는가
- overlay가 닫힐 때 어떤 상태로 전이하는가

EFSM은 outside-click 좌표 판정, focus trap, stacking 같은 UI primitive 동작을 직접 구현하지 않는다.

### 3.3 React UI binding

React는 EFSM/domain state를 읽고 사용자 동작을 EFSM event로 전달한다.

```text
사용자 입력
   ↓
Mantine component event
   ↓
appFSM.send(...)
   ↓
EFSM action / project mutation
   ↓
appFSM.publish(...)
   ↓
React re-render
```

React가 project/domain state를 별도로 복제하지 않는다.

### 3.4 Mantine

Mantine가 다음을 담당한다.

- Button/Input/ActionIcon 등 기본 rendering
- control size와 spacing
- focus 표현
- disabled 상태 표현
- Modal overlay
- focus trap / focus return
- Escape 감지
- outside click 감지
- portal / stacking
- Menu/Popover의 keyboard interaction
- accessibility primitive

---

## 4. React local state 규칙

React local state는 UI 임시 상태만 사용할 수 있다.

허용 예:

- 아직 commit하지 않은 입력 문자열
- hover/focus 상태
- 메뉴 내부의 일시적인 presentation state

금지 예:

- 선택 슬롯 ID를 React에서 별도로 보관
- overlay open state를 Mantine hook과 EFSM에 이중 저장
- graph/image/caption 모델을 React state로 복제

---

## 5. Mantine 사용 방식

### 5.1 버전 기준

구현 시작 시점에 다시 확인한 안정판을 pin한다.

계획 작성 시점 기준 후보:

- React `19.2.8`
- ReactDOM `19.2.8`
- `@mantine/core` `9.5.2`
- `@mantine/hooks` `9.5.2`

버전은 실제 vendor 삽입 패치 전에 공식 package metadata를 다시 확인한다.

### 5.2 `@mantine/modals`

현재 설계에서는 **사용하지 않는다**.

Fast Figure에는 이미 EFSM이 overlay 상태를 소유하므로 imperative modal manager를 추가하면 상태 소유권이 중복될 수 있다.

모든 현재 overlay는 `@mantine/core`의 controlled `Modal`로 충분히 표현할 수 있다.

향후 새 요구가 생기더라도 별도 검토 없이 `@mantine/modals`를 추가하지 않는다.

### 5.3 `@mantine/notifications`

현재 UI 전환 범위에 포함하지 않는다.

기존 status 체계 자체의 교체 필요성이 별도 계획에서 확인되는 경우에만 검토한다.

### 5.4 portable 단일 HTML 유지

최종 실행물은 계속 `Fast-figure.html` 하나다.

브라우저 실행 시 CDN이나 npm 서버에 접근하지 않는다. React, ReactDOM, Mantine JS와 필요한 Mantine CSS는 HTML 내부에 포함한다.

원칙:

- `Fast-figure.html`은 canonical application file이다.
- React/Mantine runtime은 Plotly와 같은 vendored dependency로 취급한다.
- application UI 코드 전체를 별도 generator가 HTML로 재생성하는 구조는 만들지 않는다.
- vendor bundle 갱신은 dependency version 변경 시에만 수행한다.
- runtime 외부 네트워크 의존성은 0으로 유지한다.

---

## 6. 공통 UI 규칙 설계

### 6.1 Theme가 담당할 것

`MantineProvider`의 theme와 `theme.components`가 다음 규칙의 기본값을 소유한다.

- font family
- radius
- 기본 control height
- Button height / horizontal padding / font size
- ActionIcon width/height
- TextInput / NumberInput / Select 계열 높이
- disabled 표현
- primary/default/subtle variant 기준
- focus ring
- spacing scale

초기 전환에서는 현재 38px control height를 기준으로 사용해 geometry 변화를 최소화한다.

개별 화면 CSS에서 `height: 38px`, `padding: 8px 12px` 같은 값을 반복하지 않는다.

### 6.2 Wrapper 정책

Mantine component 자체로 충분하면 별도 wrapper를 만들지 않는다.

예:

- 일반 버튼 → `Button`
- 아이콘 버튼 → `ActionIcon`
- 툴팁 → `Tooltip`
- 메뉴 → `Menu`
- 입력 → Mantine input component
- 단순 정렬 → `Group`, `Stack`, `Flex`, `Grid`

Wrapper는 다음 조건을 모두 만족할 때만 만든다.

1. Fast Figure 고유의 의미가 있다.
2. 동일한 의미와 event mapping이 반복된다.
3. theme이나 component props만으로는 중복을 제거할 수 없다.

예를 들어 `SettingToggle`은 `aria-pressed`, active variant, label semantics, EFSM event mapping이 반복될 경우 후보가 될 수 있다.

단순히 `Button`에 style alias를 붙이기 위한 `AppButton` 같은 wrapper는 만들지 않는다.

---

## 7. Overlay 재설계

현재 overlay는 사용자 작업 흐름을 기준으로 모두 modal task로 분류한다.

### 7.1 Layout

사용자는 다음 작업을 수행한다.

- 행/열 설정
- 간격/외곽 여백
- 슬롯 merge/split
- layout map 조작
- 크기와 비율 관련 설정
- 레이아웃 적용

이 작업 중 배경 figure를 직접 조작해야 할 필요는 없다.

따라서 controlled Mantine `Modal`을 사용한다.

Layout modal은 내용이 많으므로 작은 dialog가 아니라 넓은 modal 또는 viewport 기반 크기를 사용하고 내부 scroll을 허용한다.

### 7.2 Label

사용자는 다음 작업을 수행한다.

- 표시 여부
- 형식/괄호/순서
- 글꼴/크기
- X/Y 위치
- 전용 label preview에서 drag로 위치 조정

실제 위치 조정이 이미 popup 내부 preview에서 이루어지므로 배경 figure 조작은 필요하지 않다.

따라서 controlled Mantine `Modal`을 사용한다.

### 7.3 Caption

현재 caption 기능은 설정 popup과 외부 `contenteditable` 편집 영역으로 나뉘어 있다.

Mantine 전환 시 다음을 한 작업 단위로 합친다.

- caption 표시 여부
- 전체/슬롯별 모드
- caption label/name
- bold/font/size/line-height
- caption 본문 편집

즉 caption text editor를 modal 내부에 포함한다.

사용자 입력은 EFSM/domain state에 반영되고 figure preview는 즉시 갱신할 수 있지만, modal 뒤쪽 figure 자체를 직접 클릭해서 편집하도록 만들지 않는다.

### 7.4 Print / export

사용자는 다음 작업을 수행한다.

- 출력 형식
- DPI
- 출력 크기
- 저장/캡처

배경 figure 조작이 필요하지 않다.

따라서 controlled Mantine `Modal`을 사용한다.

### 7.5 README

읽고 닫는 일반 dialog이므로 controlled Mantine `Modal`을 사용한다.

### 7.6 Overlay 공통 동작

Mantine `Modal`이 담당한다.

- background blocking
- overlay rendering
- focus trap
- focus return
- Escape 감지
- outside click 감지
- portal
- stacking
- 접근성 속성

Fast Figure는 Mantine의 close callback을 EFSM event에 연결한다.

```text
Mantine onClose
   ↓
appFSM.send("CLOSE_OVERLAY", ...)
   ↓
EFSM transition
```

현재의 전역 outside-click 판정, Escape 처리, popup 위치/stacking 코드가 더 이상 필요하지 않으면 제거한다.

---

## 8. Menu / 작은 popup

Asset tree의 action menu처럼 짧은 선택 목록은 `Modal`이 아니라 Mantine `Menu`를 사용한다.

Menu가 제공하는 다음 기능을 재사용한다.

- open/close
- outside click
- keyboard navigation
- focus management
- position / portal

Fast Figure가 같은 기능을 별도로 구현하지 않는다.

---

## 9. React 연결 구조 결정

이전 계획에서는 portal 기반 점진 이관을 기본 구조로 잡았으나, 이를 확정안으로 사용하지 않는다.

먼저 다음 두 방법을 비교한다.

### A. Shell 단위 React 전환

```text
React shell
├─ toolbar
├─ sidebar
├─ overlay host
└─ menus

legacy 영역
└─ dashboard / Plotly / drag rendering
```

장점:

- React root가 명확하다.
- portal mount point가 늘어나지 않는다.
- imperative UI sync 제거가 빠르다.
- MantineProvider와 theme 적용 범위가 단순하다.

### B. Portal 기반 점진 전환

```text
legacy shell
├─ toolbar mount
├─ sidebar mount
└─ overlay mount

React root
└─ 여러 portal
```

장점:

- 변경 범위를 매우 작게 나눌 수 있다.

단점:

- legacy DOM + React + EFSM의 혼합 기간이 길어질 수 있다.
- mount point와 imperative sync가 중간 구조로 남을 수 있다.

### 결정 기준

실제 코드에서 shell을 React로 옮길 때 dashboard/Plotly imperative rendering을 침범하지 않고 분리할 수 있으면 A를 우선한다.

A가 지나치게 큰 구조 변경을 요구할 때만 B를 migration bridge로 사용한다.

Portal 자체를 최종 구조로 가정하지 않는다.

---

## 10. 기존 DOM ID와 imperative sync 처리

Mantine component를 기존 native element 자리에 단순 치환해서는 안 된다.

현재 코드에는 다음과 같은 직접 DOM 접근이 많다.

```text
$(id).value = ...
button.classList.toggle(...)
button.dataset.active = ...
button.setAttribute(...)
```

Mantine `Select`, `NumberInput` 등은 native element 구조와 동일하지 않으므로 해당 control을 React로 이관하면서 그 control에 대한 imperative sync도 같은 vertical slice에서 제거한다.

전환되지 않은 legacy control만 기존 DOM sync를 유지한다.

---

## 11. 단계별 적용 순서

### 단계 0 — baseline 및 UI 작업흐름 기록

코드 변경 전에 다음을 기록한다.

- 주요 control의 실제 높이/폭
- overlay별 사용자가 수행하는 작업
- overlay open/close 동작
- Escape 동작
- outside-click 동작
- sidebar 폭/overflow
- Plotly 영역 geometry
- caption text editing 경로
- layout/label preview 동작

목적은 Mantine 기본 디자인에 맞추느라 기존 기능을 우연히 잃지 않도록 하는 것이다.

### 단계 1 — React shell 방식 vs portal 방식 검증

실제 DOM과 rendering 책임을 분석해 shell 직접 React 전환이 가능한지 확인한다.

가능하면 shell 방식을 채택한다.

이 단계에서는 아직 UI를 변경하지 않는다.

### 단계 2 — vendored runtime + MantineProvider

React/Mantine runtime과 CSS를 HTML 내부에 넣고 `MantineProvider`를 생성한다.

검증:

- `file://` 직접 실행
- 네트워크 요청 없음
- 기존 Fast Figure 동작 동일
- CSS baseline이 Plotly/dashboard geometry를 변경하지 않음
- bundle 후 JS syntax 정상

### 단계 3 — theme와 기본 control 규격

Fast Figure theme를 정의한다.

최우선 대상:

- Button
- ActionIcon
- TextInput
- NumberInput
- Select
- Modal

공통 38px control size를 theme에서 정의한다.

이 단계의 산출물은 개별 화면 CSS가 아니라 공통 theme이다.

### 단계 4 — toolbar 전환

상단 toolbar를 Mantine로 전환한다.

대상:

- layout / label / caption / print toggle
- 주요 action button
- icon-only control
- tooltip

이 vertical slice에서 관련 `.toolbar button`, `.icon-only` 등 중복 규칙과 imperative sync를 함께 제거한다.

### 단계 5 — README Modal 전환

가장 단순한 overlay인 README부터 controlled Mantine `Modal`로 전환한다.

여기서 다음 연결 구조를 검증한다.

```text
EFSM overlay state
→ Modal opened
→ Mantine onClose
→ EFSM CLOSE_OVERLAY
```

기존 Escape/outside-click 처리와 중복되는 코드가 있으면 제거한다.

### 단계 6 — Label Modal 전환

전용 preview가 이미 popup 내부에 있으므로 비교적 독립적으로 전환할 수 있다.

검증:

- preview geometry
- drag bounds
- font/size 반영
- label 위치 저장
- modal open/close

### 단계 7 — Print Modal 전환

출력 설정 UI를 Mantine control로 교체한다.

검증:

- DPI
- 가로/세로 자동 계산
- output size validation
- 저장 동작

### 단계 8 — Caption Modal 재구성

caption 설정과 caption text editor를 하나의 modal 내부 작업 흐름으로 합친다.

이 단계는 단순 component 치환이 아니라 현재 분리된 caption interaction을 정리하는 변경이므로 별도 패치로 수행한다.

검증:

- 전체 caption
- 슬롯별 caption
- text input
- live preview
- bold/font/size/line-height
- FFPX roundtrip

### 단계 9 — Layout Modal 전환

가장 복잡한 layout UI를 마지막에 전환한다.

검증:

- rows/columns
- slot merge/split
- margins/gaps
- layout preview/map
- zoom/size controls
- apply/cancel semantics

### 단계 10 — Sidebar controls 전환

Select, NumberInput, TextInput, toggles를 Mantine로 전환한다.

각 control vertical slice마다 기존 imperative sync를 제거한다.

### 단계 11 — Asset tree menu 전환

직접 구현된 작은 메뉴와 icon action을 Mantine `Menu`, `ActionIcon`, `Tooltip`로 교체한다.

### 단계 12 — legacy UI infrastructure 제거

모든 대응 UI가 Mantine로 전환된 뒤에만 다음을 제거한다.

- 중복 버튼 CSS
- popup `hidden` class lifecycle
- 직접 구현한 outside-click 처리
- 직접 구현한 overlay Escape 처리
- 불필요해진 `syncPopupBounds()`
- 중복 z-index/stacking 규칙
- React로 이관된 control 대상 imperative DOM sync

제거 전에 실제 호출 여부를 검색하고 테스트한다.

---

## 12. EFSM 검토 원칙

Mantine 전환은 EFSM을 우회하는 이유가 될 수 없다.

Overlay open/close는 계속 EFSM event로 처리한다.

Mantine component는 event source일 뿐 domain mutation을 직접 수행하지 않는다.

기존 EFSM event 중 UI primitive 구현 세부사항만을 위해 존재하는 event가 있다면 바로 삭제하지 않고 다음을 확인한다.

1. domain 의미가 있는가
2. 다른 renderer에서도 필요한가
3. Mantine event로 완전히 대체되는가

그 뒤 별도 패치에서 정리한다.

---

## 13. CSS 제거 원칙

Mantine 전환 중 기존 CSS와 Mantine CSS를 중복 유지하지 않는다.

각 vertical slice에서:

1. Mantine component로 전환
2. geometry 비교
3. 관련 legacy CSS selector의 사용처 확인
4. 불필요한 규칙 제거

순서로 진행한다.

다만 Plotly canvas, dashboard layout, slot geometry처럼 Mantine component와 무관한 domain/layout CSS는 유지한다.

---

## 14. 의존성 및 라이선스

React, ReactDOM, Mantine의 라이선스와 bundled third-party notice 요구사항을 실제 vendor 삽입 전에 확인한다.

새 의존성이 추가되면:

- LICENSE에 고지 추가
- inline README의 bundled third-party software 갱신
- 버전 명시
- source repository 명시

를 함께 수행한다.

---

## 15. 테스트 기준

### 공통 UI

- 일반 버튼 높이 일치
- icon button 크기 일치
- input 높이 일치
- disabled/focus 상태 일관성
- toolbar alignment

### Modal

모든 overlay에서:

- EFSM state와 `opened` 일치
- Escape 닫기
- outside-click 닫기
- focus trap
- close 후 focus return
- background interaction 차단
- stacking 정상

### Caption

- modal 내부 text editing
- live figure preview
- 슬롯별/전체 caption
- FFPX save/load

### Layout

- merge/split
- resize
- preview/map
- apply/cancel

### 기존 기능 회귀

- CSV/TSV/JSON import
- image import
- graph creation
- slot swap
- FFSX import/export
- FFPX import/export
- label
- caption
- image export
- drag/drop
- project reload

### portable

- 외부 네트워크 없이 실행
- `file://` 실행
- 브라우저 console error 없음

---

## 16. 중단 조건

다음 상황에서는 해당 단계의 적용을 중단하고 설계를 다시 검토한다.

- React가 EFSM/domain state를 이중 소유하게 되는 경우
- Mantine 사용을 위해 기존 기능 자유도를 줄여야 하는 경우
- wrapper가 Mantine primitive를 사실상 다시 구현하게 되는 경우
- UI migration 때문에 Plotly/dashboard rendering을 불필요하게 재작성해야 하는 경우
- single-file portable 실행을 유지할 수 없는 경우
- 한 vertical slice에서 기존 UI와 새 UI가 동시에 active state를 소유하게 되는 경우

---

## 17. 선택하지 않는 방향

### 자체 `AppToolPanel`

현재 overlay는 사용자 작업 흐름상 모두 modal task로 정리할 수 있으므로 만들지 않는다.

Mantine가 제공하는 Modal의 focus, Escape, outside-click, portal, stacking을 다시 구현할 이유가 없다.

### `@mantine/modals`

현재 EFSM과 상태 소유권이 중복되므로 사용하지 않는다.

### 모든 UI를 한 번에 React로 재작성

회귀 범위가 지나치게 크고 Plotly/dashboard domain rendering까지 불필요하게 건드릴 수 있으므로 선택하지 않는다.

### Portal 구조를 영구 아키텍처로 확정

migration bridge가 필요할 때만 사용한다.

### 기존 CSS 위에 Mantine style을 덧씌우기

중복 규칙 문제를 그대로 남기므로 선택하지 않는다.

### Mantine default size를 그대로 사용해 UI 크기 변경

이번 목적은 디자인 재설계가 아니라 공통 규칙의 구조화가 우선이므로 초기에는 현재 geometry를 최대한 유지한다.

---

## 18. 첫 구현 패치의 범위

첫 구현 패치에서는 다음만 수행한다.

1. 현재 shell / dashboard / Plotly DOM 책임 분석
2. React shell 직접 전환과 portal migration의 변경 범위 비교
3. 채택할 migration boundary 확정
4. vendor dependency 삽입 방식 확정
5. React/Mantine dependency와 라이선스 검증

이 단계에서는 아직 toolbar나 overlay를 Mantine component로 교체하지 않는다.

그 다음 패치에서 vendored runtime과 `MantineProvider`를 추가하고, 별도 패치에서 toolbar부터 실제 UI 이관을 시작한다.
