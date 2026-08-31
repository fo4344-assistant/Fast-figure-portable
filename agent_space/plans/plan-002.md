# 계획 002 — Mantine 기반 UI 공통화

## 1. 목적

Fast Figure의 UI를 Mantine 기반으로 교체한다.

이번 작업의 1차 목적은 외형 변경이 아니다. 현재 UI에서 버튼 크기, 입력 높이, 간격, 팝업 열기/닫기, outside-click, Escape 처리, 활성/비활성 상태 표현, 아이콘 버튼 크기처럼 공통이어야 하는 규칙이 여러 CSS 선택자와 이벤트 처리 코드에 반복되어 있는 문제를 제거하는 것이 핵심이다.

Mantine 도입 후에는 공통 규칙을 가능한 한 다음 계층에서 한 번만 정의한다.

1. `MantineProvider` theme
2. Mantine component default props / component CSS variables
3. 공통 동작이 실제로 필요한 소수의 Fast Figure UI wrapper
4. 개별 화면은 위 규칙을 조합하고, 크기·padding·popup lifecycle을 다시 구현하지 않는다.

성공 기준은 "Mantine처럼 보이는 UI"가 아니라 동일한 UI 규칙을 여러 위치에서 수동 동기화하던 코드가 제거되는 것이다.

---

## 2. 현재 확인된 구조적 문제

현재 `Fast-figure.html`에는 이미 일부 CSS 변수가 있으나, 실제 컴포넌트 규칙은 여러 선택자에서 다시 정의된다.

예를 들면 공통 버튼 하나에 대해서도 다음 계층들이 별도로 존재한다.

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

현재 EFSM 구조 자체는 유지할 가치가 있지만, UI primitive가 담당할 수 있는 표시·접근성·focus·키보드 동작까지 직접 구현하고 있다.

---

## 3. 유지할 경계

### 3.1 EFSM은 상태의 권위자로 유지

Mantine 또는 React local state가 `workspace`, `overlay`, project object 같은 domain state를 새로 소유하지 않는다.

현재 `ApplicationStateMachine`에는 이미 `subscribe(listener)`와 immutable `state` publish 구조가 있으므로 React에서 이를 그대로 외부 store로 사용한다.

React UI는 다음 원칙을 따른다.

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

### 3.2 React local state는 UI 임시 상태만 사용

허용 예:

- 아직 commit하지 않은 input 편집 문자열
- 임시 hover/focus 상태
- 메뉴 내부의 일시적 presentation state

금지 예:

- 선택 슬롯의 실제 ID를 React에서 별도 보관
- overlay 상태를 Mantine hook과 EFSM에 이중 저장
- graph/image/caption 모델을 React state로 복제

---

## 4. Mantine 사용 방식

### 4.1 버전 기준

계획 작성 시점 기준 안정판을 pin한다.

- React `19.2.8`
- ReactDOM `19.2.8`
- `@mantine/core` `9.5.2`
- `@mantine/hooks` `9.5.2`

초기 전환에서는 `@mantine/modals`를 사용하지 않는다.

이유는 Mantine modal manager가 overlay open/close state를 별도로 관리할 경우 현재 EFSM과 상태 소유권이 중복될 수 있기 때문이다. 실제 dialog는 `@mantine/core`의 controlled `Modal`을 사용하고 `opened` 값은 EFSM에서 직접 읽는다.

`@mantine/notifications`도 UI 기반 전환과 분리한다. 기존 status 체계 교체 필요성이 별도로 확인된 뒤 도입한다.

### 4.2 portable 단일 HTML 유지

최종 실행물은 계속 `Fast-figure.html` 하나다.

브라우저 실행 시 CDN이나 npm 서버에 접근하지 않는다. React, ReactDOM, Mantine JS와 필요한 Mantine CSS는 HTML 내부에 포함한다.

다만 Mantine는 React 패키지이므로 vendor dependency를 browser-loadable bundle로 만드는 준비 단계는 필요하다. 이 bundling은 Fast Figure application source 전체를 생성하는 체계로 확대하지 않는다.

원칙:

- `Fast-figure.html`은 계속 canonical application file이다.
- Plotly와 마찬가지로 React/Mantine 런타임은 vendored dependency block으로 취급한다.
- application UI 코드 자체를 별도 generator가 HTML로 재생성하는 구조는 만들지 않는다.
- vendor bundle 갱신은 버전 변경 시에만 수행한다.
- runtime 외부 네트워크 의존성은 0으로 유지한다.

---

## 5. 공통 UI 규칙 설계

## 5.1 Theme가 담당할 것

`MantineProvider`의 theme와 `theme.components`가 다음 규칙의 기본값을 소유한다.

- 기본 font family
- 기본 radius
- 기본 control height
- Button height / horizontal padding / font size
- ActionIcon width/height
- TextInput / NumberInput / Select 계열 높이
- disabled 표현
- primary/default/subtle variant 기준
- focus ring
- 기본 spacing scale

현재 38px control height를 초기 기준으로 유지해 레이아웃 변화를 최소화한다. Mantine의 component CSS variable resolver를 사용해 Fast Figure용 공통 size 하나를 정의하고 Button/Input/ActionIcon 계열에 동일 기준을 적용한다.

개별 화면 CSS에서 `height: 38px`, `padding: 8px 12px` 같은 값을 반복하지 않는다.

## 5.2 wrapper를 최소화

Mantine component 자체가 충분한 경우 별도 wrapper를 만들지 않는다.

예:

- 일반 버튼 → `Button`
- 아이콘 버튼 → `ActionIcon`
- 툴팁 → `Tooltip`
- 메뉴 → `Menu`
- 입력 → Mantine input component
- 단순 정렬 → `Group`, `Stack`, `Flex`, `Grid`

Fast Figure wrapper는 공통 **동작 의미**가 추가되는 경우에만 만든다.

초기 후보:

- `AppToolPanel`: EFSM-controlled 비모달 도구 패널
- `SettingToggle`: `aria-pressed`, active label, variant 규칙이 동일한 설정 toggle

단순 style alias를 위해 wrapper를 계속 추가하지 않는다.

---

## 6. 팝업 분류

현재 모든 overlay를 같은 종류의 popup으로 취급하지 않는다.

### 6.1 실제 modal dialog

대상:

- README
- 향후 확인/경고 dialog가 필요한 경우

Mantine `Modal` 사용.

Mantine가 담당:

- focus management
- Escape
- outside click
- focus return
- overlay / stacking
- accessibility attributes

EFSM이 담당:

- `overlay === "readme"` 여부
- open/close transition

### 6.2 비모달 tool panel

대상:

- layout
- label
- caption
- print

현재 이 패널들은 열린 상태에서도 dashboard와 상호작용할 수 있으므로 `Modal`로 교체하면 의미가 달라진다.

따라서 Mantine primitive를 이용한 공통 `AppToolPanel`을 만든다.

`AppToolPanel` 책임:

- 공통 Paper/surface
- border/radius/shadow
- panel header
- close/outside-click 규칙
- Escape forwarding
- stacking
- anchor 또는 main-area 기준 위치 계산
- responsive max-height/scroll

EFSM 책임:

- 어떤 panel이 열려 있는지
- `OUTSIDE_CLICK`, `ESCAPE`, `TOGGLE_OVERLAY` transition

현재 `syncPopupBounds()` 같은 계산이 완전히 필요 없어지는지 1차 prototype에서 검증한다. main 영역 전체 폭 정렬 때문에 위치 계산이 일부 필요하다면 그 계산은 `AppToolPanel` 한 곳에만 남긴다.

### 6.3 작은 action menu

asset tree 등의 action menu는 Mantine `Menu`로 교체한다.

현재 직접 관리하는 menu open/close, outside click, keyboard navigation 코드를 가능한 한 제거한다.

---

## 7. React 연결 구조

한 개의 `MantineProvider`만 둔다.

초기 전환에서는 전체 dashboard/Plotly DOM을 React가 즉시 소유하지 않는다. 기존 imperative dashboard rendering을 건드리지 않고 UI control만 단계적으로 이관하기 위해 한 React root에서 기존 DOM의 지정 mount point로 portal을 렌더링하는 방식을 사용한다.

```text
React root
└─ MantineProvider
   └─ FastFigureUiHost
      ├─ portal → toolbar mount
      ├─ portal → sidebar control mounts
      ├─ portal → overlay host
      └─ portal → menus / dialogs

legacy imperative DOM
└─ dashboard / Plotly / drag logic
```

React context는 portal에서도 유지되므로 theme를 한 곳에서 공유할 수 있다.

이 방식의 목적은 영구적인 혼합 구조를 늘리는 것이 아니라, dashboard 렌더러와 EFSM을 한꺼번에 다시 작성하지 않고 UI만 교체하기 위한 migration boundary를 만드는 것이다.

UI 전환 완료 후 portal 구조가 불필요하게 복잡하면 shell을 하나의 React tree로 합치는 것을 별도 검토한다.

---

## 8. 기존 DOM ID와 imperative sync 처리

Mantine component를 기존 native element 자리에 단순 치환해서는 안 된다.

현재 코드에는 다음과 같은 직접 DOM 접근이 많다.

```text
$(id).value = ...
button.classList.toggle(...)
button.dataset.active = ...
button.setAttribute(...)
```

Mantine `Select`, `NumberInput` 등은 기존 native `<select>`/`<input>` 구조와 동일하지 않으므로 이 코드를 그대로 유지하면 UI state가 이중 관리된다.

따라서 컴포넌트를 이관할 때 해당 컴포넌트를 대상으로 하는 imperative sync 코드도 같은 vertical slice에서 제거한다.

예:

```text
기존
syncSettingToggle("captionEnabled", ...)
    ↓
React
active = model state
variant = active ? ... : ...
onClick = () => appFSM.send(...)
```

전환되지 않은 legacy control만 기존 DOM sync를 계속 사용한다.

---

## 9. 단계별 적용 순서

### 단계 0 — baseline 기록

코드 변경 전에 다음을 기록한다.

- 주요 control의 실제 높이/폭
- overlay open/close 동작
- Escape 동작
- outside-click 동작
- dashboard와 tool panel 동시 상호작용 여부
- sidebar 폭/overflow
- Plotly 영역 geometry

목적은 Mantine 기본 디자인에 맞추느라 기존 동작을 우연히 바꾸지 않기 위함이다.

### 단계 1 — vendored runtime + MantineProvider

React/Mantine runtime과 CSS를 HTML 내부에 넣고 `MantineProvider`를 생성한다.

이 단계에서는 기존 UI를 교체하지 않는다.

검증:

- file:// 직접 실행
- 네트워크 요청 없음
- 기존 Fast Figure 동작 동일
- CSS baseline이 Plotly/dashboard geometry를 변경하지 않음
- bundle 후 JS syntax 정상

### 단계 2 — theme와 기본 control 규격

Fast Figure theme를 정의한다.

최우선 대상:

- Button
- ActionIcon
- TextInput 계열
- Select 계열
- NumberInput 계열

공통 38px control size를 theme에서 정의한다.

이 단계의 산출물은 개별 화면 CSS가 아니라 공통 theme이다.

### 단계 3 — toolbar 전환

상단 toolbar부터 Mantine로 전환한다.

대상:

- layout / label / caption / print toggle
- 주요 action button
- icon-only control
- tooltip

이 단계에서 `.toolbar button`, `.icon-only`, 개별 toolbar 버튼 크기 예외 규칙을 제거한다.

목적은 사용자 요구의 핵심인 버튼 크기와 공통 규칙 재사용이 실제로 작동하는지 가장 작은 범위에서 검증하는 것이다.

### 단계 4 — README dialog 전환

기존 native `<dialog>` README를 controlled Mantine `Modal`로 교체한다.

EFSM `overlay=readme`를 그대로 사용한다.

여기서 modal open/close, Escape, outside-click, focus return 통합 방식을 확정한다.

### 단계 5 — 공통 `AppToolPanel` 도입

label 또는 print 중 구조가 단순한 하나를 첫 vertical slice로 선택해 `AppToolPanel`을 검증한다.

검증 후:

- label
- caption
- print

순으로 이관한다.

layout은 resize/map preview가 있으므로 마지막에 이관한다.

이 단계가 완료되면 전역 popup outside-click/Escape handler에서 해당 panel별 예외 목록을 제거한다.

### 단계 6 — sidebar form controls

sidebar의 반복 입력 UI를 Mantine로 교체한다.

- TextInput
- NumberInput
- Select 또는 NativeSelect
- Checkbox/Switch가 의미상 적절한 toggle
- ColorInput 또는 현재 color control에 적절한 Mantine primitive
- Group/Stack/Grid 기반 정렬

control마다 직접 높이/width/margin을 정하는 CSS를 제거한다.

### 단계 7 — layout panel

layout panel을 `AppToolPanel` 기반으로 이관한다.

유지해야 할 특수 기능:

- layout map
- panel/map resize
- dashboard aspect/zoom
- merge/split selection

Mantine가 form/panel scaffold를 담당하고 실제 layout preview 계산은 기존 domain/UI geometry 코드가 담당한다.

### 단계 8 — asset tree action UI

- toolbar icon controls → `ActionIcon`
- contextual actions → `Menu`
- tooltip/title → `Tooltip`

asset tree 자체의 파일 시스템 구조 및 selection logic은 변경하지 않는다.

### 단계 9 — legacy UI 코드 정리

모든 Mantine 전환이 끝난 뒤에만 공통 legacy CSS와 DOM helper를 제거한다.

제거 후보:

- 전역 `button` presentation 규칙
- `button.light`
- `.setting-toggle` presentation 규칙
- toolbar/action별 반복 height/padding 규칙
- popup heading 반복 scaffold
- 전환 완료된 control 대상 `sync...Controls` DOM mutation
- 전환 완료된 popup 대상 전역 outside-click 예외 목록

기능별 custom geometry CSS는 유지할 수 있다.

---

## 10. 명시적으로 하지 않을 것

### Mantine 모양만 복제

Mantine CSS를 참고해 기존 button에 비슷한 스타일만 입히는 방식은 사용하지 않는다. 공통 component behavior 재사용이라는 목적을 달성하지 못한다.

### 모든 UI를 한 번에 React로 재작성

Plotly rendering, drag/drop, project model, EFSM까지 동시에 React화하지 않는다. UI 라이브러리 전환과 domain architecture 전환을 합치면 회귀 범위가 지나치게 커진다.

### React state가 EFSM을 대체

Mantine 도입을 이유로 EFSM을 우회하지 않는다.

### 모든 control에 Fast Figure wrapper 작성

Mantine 자체의 공통 규칙을 다시 wrapper hierarchy로 복제하지 않는다.

### `@mantine/modals`를 초기 overlay manager로 사용

현재 EFSM과 상태 소유권이 중복되므로 사용하지 않는다.

### 외부 CDN 의존

portable HTML 실행 중 React/Mantine을 네트워크에서 불러오지 않는다.

---

## 11. 테스트 기준

### 공통 control 규칙

- 같은 size의 Button은 위치와 상관없이 같은 높이를 가져야 한다.
- ActionIcon은 toolbar/print/sidebar 어디서 사용해도 같은 bounding box를 가져야 한다.
- input/select/number control의 기본 높이가 theme 기준과 일치해야 한다.
- 개별 panel CSS에 동일한 control height literal이 반복되지 않아야 한다.

### overlay / popup

각 overlay에 대해:

1. toggle click → 정확히 한 번 open
2. 같은 toggle → close
3. Escape → EFSM을 통해 close
4. outside-click → 정의된 경우 EFSM을 통해 close
5. UI 표시와 `appFSM.state.overlay` 항상 일치
6. close 후 focus 처리 정상
7. tool panel은 dashboard 상호작용을 불필요하게 차단하지 않음
8. 중복 event handler로 한 click에 두 transition이 발생하지 않음

### 기능 회귀

- CSV/image import
- slot selection
- graph editing
- graph/image swap
- layout merge/split
- label edit/drag
- caption edit
- print/export
- FFSX/FFPX import/export
- project reload

### portable 검증

- `Fast-figure.html` 단독 실행
- 외부 JS/CSS request 없음
- 브라우저 console dependency error 없음
- React development build가 아니라 production build 사용
- third-party notices 유지

---

## 12. 라이선스와 문서

React, ReactDOM, Mantine 코드를 HTML에 포함하는 패치부터 다음을 함께 갱신한다.

- root `LICENSE` third-party notices
- inline README bundled third-party software
- repository README의 bundled third-party 설명

MIT 고지를 누락하지 않는다.

---

## 13. 첫 구현 패치의 범위

첫 코드 패치는 UI 전체 교체가 아니라 다음만 수행한다.

1. pinned React/Mantine vendor runtime을 portable HTML에 포함
2. Mantine CSS 포함
3. 단일 `MantineProvider` / UI host 생성
4. Fast Figure theme 정의
5. 기존 UI는 그대로 유지
6. offline 및 geometry 회귀 검사

이 기반 패치가 안정적인 것을 확인한 다음 toolbar vertical slice를 두 번째 코드 패치로 진행한다.

이 순서를 택하는 이유는 dependency/bootstrap 문제와 실제 UI migration 문제를 분리하여, 문제가 생겼을 때 원인을 Mantine runtime 도입과 component migration 중 하나로 즉시 좁힐 수 있기 때문이다.

---

## 14. 외부 기준

계획 작성 시 확인한 공식 자료:

- Mantine 9.5.2: https://www.npmjs.com/package/@mantine/core
- MantineProvider: https://mantine.dev/theming/mantine-provider/
- component default props: https://mantine.dev/theming/default-props/
- Styles API / component CSS variables: https://mantine.dev/styles/styles-api/
- Mantine Modal: https://mantine.dev/core/modal/
- Mantine styles: https://mantine.dev/styles/mantine-styles/
- React 19.2.8: https://www.npmjs.com/package/react
- ReactDOM 19.2.8: https://www.npmjs.com/package/react-dom
