# Review 022 — Mantine UI regression QA

기준:
- current implementation: source code r4 / main `28ea127a79422de2cd9b9fc7950e1ca8c04c2306`
- pre/current-port comparison fixture:
  `agent_space/history/Fast-figure-1.1.35-alpha-reference.html`
- uploaded fixture에서 Plotly.js 2.35.2 인라인 library script만 제거했으며,
  나머지 HTML/CSS/JavaScript와 `Plotly.setPlotConfig`는 보존했다.

이 문서는 사용자가 보고한 UI/기능 회귀의 **원인 위치를 조사하고 수정 경계를 판정**한다.
이 review 자체에서는 애플리케이션 동작을 수정하지 않는다.

## 1. 전체 판정

이번 9개 항목은 하나의 core/domain 결함으로 설명되지 않는다.

주된 공통 원인은 Mantine 전환 과정에서 기존 generic UI markup만 교체해야 했는데,
구 버전 CSS와 기능 renderer가 함께 보유하던 다음 정보가 충분히 이식되지 않은 것이다.

- field/row 정렬
- preview surface의 독립 geometry
- control 종류 자체가 가지던 입력 의미
- preview와 실제 renderer 사이의 line-height/padding 대응
- overlay 안에서 target을 선택하는 interaction flow
- primary/light button 사용 규칙

`review-010-mantine-ui-inventory.md`는 layout map, label preview, caption mode,
기능 renderer 보존을 명시했다. 그러나 `review-012-mantine-cutover-completion.md`의
완료 감사에서는 실제 pre-Mantine UI fixture가 없었고, 브라우저 회귀도 주로
project/file/domain roundtrip 및 logical geometry를 검사했다. 시각 정렬과 세부 UI
interaction은 별도 후속 항목으로 남겨졌다.

따라서 이번 보고는 기존 설계가 의도적으로 단순화된 결과라기보다
**Mantine cutover parity 검증 범위가 너무 좁아서 통과한 회귀 묶음**으로 보는 것이 맞다.

## 2. 항목별 원인

### 2.1 UI 색상 > 적용 버튼만 색이 다름

**현상**

UI 색상 Modal에서 기본값/취소와 달리 적용만 filled primary 색을 사용한다.

**현재 원인 위치**

`fast-figure-ui.js::FastFigurePaletteActions`

- 기본값: `variant: "light"`
- 취소: `variant: "light"`
- 적용: `variant` 미지정 → Mantine Button 기본 `filled`

직전 r4에서는 filled primary 색 자체가 `appearance.uiPalette.uiColor`을 따르도록
수정했지만, 이 항목은 색 원천 문제가 아니라 **버튼 variant 불일치**다.

**구 버전**

구 버전의 UI 색상 적용/기본값 버튼은 동일한 light 계열 class를 사용했다.

**Source Script 판정**

Source Script 의미 변경 불필요. generic Button의 공통 theme와 palette authority는
이미 정의되어 있으며, Modal 내부 action hierarchy/variant는 source-code UI 표현 문제다.

**수정 경계**

`FastFigurePaletteActions`의 action button variant 정책만 조정하면 된다.

---

### 2.2 HTML 최초 로드 시 오른쪽 작업 뷰어의 슬롯이 보이지 않음

**현상**

최초 로드 직후 project에는 2×2 empty slot이 존재하지만 dashboard DOM에 보이지 않는다.
UI 색상 > 적용을 누르면 나타난다.

**현재 원인 위치**

`fast-figure.js` startup sequence.

현재 startup 끝부분은 다음만 수행한다.

- `applyDashboardZoom()`
- `installSlotClickController()`
- `applySlotStyle()`
- `appFSM.ready()`

여기에 초기 `renderDashboard()`가 없다.

반면 `applyUiPalette()`는 palette CSS variable을 설정한 뒤 **`renderDashboard()`를
호출한다**. 따라서 UI 색상 적용이 우연히 누락된 초기 renderer projection을 대신 실행한다.

`createProjectState()` 자체는 초기 2×2 slot 4개를 이미 생성하므로
project model 생성 문제는 아니다.

**구 버전**

구 버전 startup은 `makeSlots()`를 호출해 초기 dashboard를 실제로 그린 뒤 ready로
전환했다.

**Source Script 판정**

**명확한 Source Script 불일치.**

`sourcescript/system.py::initializeFastFigure`는 startup 처리 4번에서
“project에 이미 존재하는 초기 empty slot을 renderer에 투영한다”고 명시한다.

Source Script는 이미 충분하므로 변경하지 않고 source code startup을 고쳐야 한다.

**QA 누락 원인**

현재 browser regression은 lifecycle ready 여부를 먼저 확인하지만
사용자 interaction 전에 `.slot` 4개가 실제 DOM에 존재하는지는 검사하지 않는다.

---

### 2.3 레이아웃 미리보기의 슬롯이 버튼으로 바뀌며 크기가 고정되고 정렬이 사라짐

**현상**

기존 layout map은 실제 grid geometry를 축소 시뮬레이션했지만,
현재 slot cell이 Mantine Button으로 대체되면서 cell 자체 높이가 고정되고
레이아웃 폼의 기존 정렬도 사라졌다.

**현재 원인 위치 — preview cell**

`fast-figure-ui.js::FastFigureLayoutOverlay`

현재 preview grid의 각 slot을 `Button`으로 생성한다.

slot Button style에는 다음만 있다.

- `gridColumn`
- `gridRow`
- `minWidth: 0`
- `minHeight: 0`
- border style

그러나 `fastFigureTheme`의 Button 기본 size `ff`는
`--button-height: 38px`를 준다. Button component 자체 height가 38px이므로
grid track의 논리적 slot height를 그대로 채우는 중립 renderer cell이 아니다.

**구 버전**

구 버전 `renderLayout()`은 `div.layout-slot`을 직접 만들어 grid area만 부여했다.
따라서 slot cell은 grid track을 그대로 채웠고 Button control size 규칙의 영향을 받지 않았다.

**현재 원인 위치 — controls alignment**

현재 layout form은 대부분
`Stack` + `Group { gap: "xs", grow: true }` 조합으로 재구성되었다.
구 버전의 다음 layout-specific CSS 규칙은 대응되는 Mantine layout prop/style로
이식되지 않았다.

- primary controls: centered, bottom aligned
- action controls: centered
- labels: fixed width + centered text
- numeric inputs: centered text
- map/resize handle 중심 정렬

즉 Mantine으로 generic control appearance만 바꾼 것이 아니라
기존 layout-specific alignment layer까지 제거된 상태다.

**Source Script 판정**

- logical preview geometry와 layout map 기능 자체는 Source Script/API inventory에 이미 존재한다.
- 정확한 픽셀 정렬은 Source Script semantic layer 대상이 아니다.

따라서 source code에서 **renderer-neutral preview surface를 복원**하고
Mantine layout props/styles로 기존 정렬을 재현하는 것이 맞다.

---

### 2.4 레이블 위치 미리보기에서 글자가 아래로 밀려 보임

**현상**

레이블 위치 preview에서 글자 위쪽 여백이 아래쪽보다 커 보여
레이블 자체가 아래로 한 줄 밀린 것처럼 보인다.

**현재 원인 위치**

`fast-figure-ui.js::FastFigureLabelOverlay`의 draggable preview label.

현재 preview label style에는 다음이 있다.

- `fontFamily`
- `fontSize`
- `fontWeight: 800`
- scaled padding

하지만 `lineHeight`가 없다.

따라서 Mantine/body 기본 line-height를 상속한다.
현재 Mantine 기본 line-height는 1.55 계열이다.

반면 실제 dashboard renderer의 `.slot-label`은
`Fast-figure.html`에서 `line-height: 1.2`를 사용한다.
구 버전 `.label-preview-label` 역시 `line-height: 1.2`였다.

즉 preview의 text line box 높이가 실제 slot label보다 커졌는데
position/padding 계산은 별도로 유지되어, 위·아래 optical whitespace와 drag bounding box가
실제 renderer와 달라졌다.

**Source Script 판정**

label x/y authority 및 reference geometry는 Source Script에 이미 정의되어 있다.
이번 문제는 **preview renderer CSS projection 불일치**이므로 source code만 수정한다.

---

### 2.5 글꼴 선택 control이 직접 입력으로 대체됨

**현상**

기존의 font option 선택 기능이 없어지고 font family 문자열 직접 입력만 남았다.

사용자 보고의 “레이아웃” 표현은 현재 UI 이름과 정확히 한 곳으로 매핑되지 않는다.
실제 코드/구 버전 대조 결과 다음 세 영역에서 같은 종류의 회귀가 확인된다.

1. graph layout editor의 “그래프 글꼴”
2. label popup의 “글꼴”
3. caption popup의 “글꼴”

**현재 원인 위치**

`fast-figure-ui.js`

- `FastFigureGraphLayoutEditor`: `TextInput`
- `FastFigureLabelOverlay`: `TextInput`
- `FastFigureCaptionOverlay`: `TextInput`

**구 버전**

세 영역 모두 `select` 기반 font selector가 있었다.

구 버전 graph font selector는 predefined option 외의 기존 custom font 값도
임시 option으로 추가해 값을 잃지 않는 보존 로직을 갖고 있었다.

**Source Script 판정**

`fontFamily`의 authoritative 의미는 Source Script에 정의되어 있지만
UI widget이 Select인지 TextInput인지는 semantic 규칙으로 고정되어 있지 않다.

다만 `review-010` 기능 inventory의 “font family” 사용자 기능 보존 관점에서는
pre-Mantine selector UX를 잃은 source-code parity 회귀다.

**수정 경계**

Mantine `Select` 또는 searchable/select+custom-value 가능한 control을 사용하되
custom historical font family를 버리지 않는 기존 자유도를 유지해야 한다.
Source Script 변경은 필요하지 않다.

---

### 2.6 레이블 > 크기 값을 지울 때 6으로 바뀜

**현상**

예를 들어 두 자리 font size를 지우는 도중 intermediate input이 즉시 6으로 강제되어
자연스럽게 새 값을 입력할 수 없다.

**현재 원인 위치**

`fast-figure-ui.js::FastFigureLabelOverlay`

현재 `NumberInput onChange`에서 매 입력마다:

```text
Number(value)
→ Math.max(6, number)
→ 즉시 setSettings commit
```

을 수행한다.

빈 문자열은 `Number("") === 0`이므로 6으로 바뀐다.
한 자리 중간값도 6보다 작으면 즉시 6으로 clamp된다.

**구 버전**

native number input의 편집 중 값은 그대로 두고
`change` 시점에 `applyLabelSettings()`가 최소값 6을 commit했다.
따라서 입력 도중의 transient invalid/partial 문자열과 authoritative committed value를
구분할 수 있었다.

**Source Script 판정**

Source Script는 authoritative `fontSize >= 6`만 요구한다.
입력 draft는 `UI_LOCAL_STATE_RULE`에서 허용되는 component-local state다.

따라서 **현재 구현이 validation 시점을 너무 앞당긴 UI bug**이며
Source Script 변경 없이 local draft + blur/Enter/valid commit 경계로 수정하면 된다.

---

### 2.7 슬롯별 캡션을 활성화할 수 없음

**현상**

caption popup에서 “슬롯별 캡션” mode를 실사용 흐름으로 진입하기 어렵거나 불가능하다.

**현재 원인 위치**

`fast-figure-ui.js::FastFigureCaptionOverlay`

- local `targetMode`는 popup을 열 때 항상 `"global"`에서 시작한다.
- “슬롯별 캡션” 버튼은 `!selectedSlot`이면 disabled다.
- popup이 열린 뒤 dashboard에서 slot을 선택하는 interaction은 제공되지 않는다.
- core overlay FSM의 `SELECT_SLOT`은 non-null slot selection 시 overlay를 닫는 의미를 가진다.

따라서 **popup을 연 뒤 slot-caption mode를 켜고 대상 slot을 고르는 기존 interaction 흐름이
끊겼다.**

이미 slot을 먼저 선택한 뒤 popup을 열면 current code상 mode 전환 자체는 가능하므로,
domain의 `slot.caption` read/write command가 사라진 문제는 아니다.

**구 버전**

slot-caption mode는 runtime/UI mode로 존재했고,
사용자가 mode를 켠 상태에서 slot target을 바꾸며 편집할 수 있는 interaction이 있었다.

**Source Script 판정**

Source Script에는 이미:

- slot caption은 slot-local property
- editor mode는 runtime/UI state
- selected slot의 caption을 읽고/쓸 수 있어야 함

이 정의되어 있다.

따라서 domain Source Script를 바꿀 이유는 없다.
다만 현재 overlay FSM의 slot-select-close 정책과 caption target UI를 함께 조정해
**selected slot을 실제로 선택/변경 가능한 UI flow**를 복원해야 한다.

---

### 2.8 이름 입력란 때문에 이름 굵게 버튼의 수직 정렬이 맞지 않음

**현상**

caption popup에서 이름 TextInput의 label “이름”이 한 줄을 차지하면서
옆의 “이름 굵게” Button이 같은 row에서 위/아래 기준을 맞추지 못한다.

**현재 원인 위치**

`fast-figure-ui.js::FastFigureCaptionOverlay`

동일 `Group { gap: "xs", grow: true }` 안에:

- `TextInput label="이름"`
- label이 없는 `Button`

을 직접 나란히 둔다.

Mantine Group에 field-label 높이를 보정하는 bottom alignment나 wrapper가 없다.

**구 버전**

caption field와 toggle field를 별도 grid item 구조로 두고,
toggle button은 field 하단에 맞도록 전용 CSS 정렬 규칙을 사용했다.

**Source Script 판정**

순수 UI layout 문제. Source Script 변경 불필요.

---

### 2.9 프린트 > 설정 크기로 저장 버튼만 색이 다름

**현상**

프린트 Modal에서 “설정 크기로 저장”은 filled,
“현재 화면 캡처”는 light라 색이 다르다.

**현재 원인 위치**

`fast-figure-ui.js::FastFigurePrintOverlay`

- 설정 크기로 저장: variant 미지정 → filled
- 현재 화면 캡처: `variant: "light"`

**구 버전과의 차이**

이 항목은 1번과 달리 구 버전에서도 save button과 capture button의 class가 달랐다.
따라서 **Mantine 전환 때 새로 발생한 parity 손실이라고 단정할 수는 없다.**

다만 현재 사용자가 두 동작을 같은 visual level로 통일하길 요구하고 있으므로,
향후 UI consistency 수정 대상으로 기록한다.

**Source Script 판정**

export command 의미와 무관한 Button visual hierarchy 문제.
Source Script 변경 불필요.

## 3. 시스템 수준 원인

### 3.1 기능 inventory는 있었지만 실제 UI fixture 비교가 없었음

`review-010-mantine-ui-inventory.md`는 다음을 명시적으로 보존 대상으로 두었다.

- layout map
- actual dashboard와 대응되는 preview geometry
- label preview geometry/drag
- caption whole/slot mode
- font family
- 기능 renderer 축소 금지

그러나 final cutover audit 시 실제 pre-Mantine HTML fixture를 회귀 입력으로
고정하지 않았다.

이번에 저장한
`agent_space/history/Fast-figure-1.1.35-alpha-reference.html`
을 이후 parity 기준으로 사용할 수 있다.

### 3.2 regression이 logical geometry와 domain roundtrip에 치우침

기존 browser regression의 layout/label 항목은
logical width/height가 finite인지와 rendered slot width가 0이 아닌지를 확인한다.

다음은 검사하지 않았다.

- 최초 startup 직후 slot count
- layout-map cell이 grid track을 실제로 채우는지
- preview/renderer line-height parity
- font selector control type/options
- transient NumberInput editing
- caption target selection flow
- field/button baseline alignment
- action button variant consistency

그래서 API와 geometry 계산은 살아 있으면서 UI composition만 깨진 회귀가 통과할 수 있었다.

### 3.3 renderer surface를 generic Button으로 치환함

layout preview의 slot cell은 사용자 선택 interaction도 있지만,
본질적으로 **layout geometry를 시뮬레이션하는 renderer surface**다.

이를 Mantine Button으로 그대로 치환하면서 Button의 고정 height/typography/padding
규칙이 geometry에 유입되었다.

Mantine은 interaction shell/control에 사용하되,
geometry preview의 cell 자체는 renderer-neutral element로 두는 편이
기존 설계와 `plan-006`의 기능 renderer 보존 원칙에 맞다.

### 3.4 구 버전 CSS가 가지고 있던 interaction 계약을 inventory가 충분히 세분화하지 못함

다음은 단순 장식이 아니라 사용성/geometry에 영향을 주는데도
migration inventory에 세부 acceptance criterion으로 남지 않았다.

- field label과 button의 baseline
- layout form의 center/end alignment
- label preview line-height
- font selector의 predefined option + custom-value preservation
- NumberInput commit timing

따라서 “generic UI CSS 제거” 과정에서 함께 사라졌다.

## 4. Source Script 변경 필요성 판정

| 항목 | Source Script 변경 | 실제 수정 계층 |
| --- | --- | --- |
| 1. UI 색상 적용 버튼 | 불필요 | Mantine UI source |
| 2. 초기 slot 미렌더 | 불필요 — 기존 Source Script 위반 | startup renderer source |
| 3. layout preview/정렬 | 불필요 | Mantine layout + renderer surface |
| 4. label preview 수직 위치 | 불필요 | preview style projection |
| 5. font selector 소실 | 불필요 | Mantine control parity |
| 6. font size 6 강제 | 불필요 | input draft/commit boundary |
| 7. slot caption mode | domain 의미 변경 불필요 | overlay/FSM interaction composition |
| 8. name/button 정렬 | 불필요 | Mantine layout |
| 9. print save 색 | 불필요 | Mantine button variant |

현재 조사만으로는 Source Script r12를 수정해야 할 새로운 domain rule은 발견하지 않았다.

특히 2번은 Source Script가 이미 초기 slot renderer projection을 요구하고 있으므로
상위 계층을 바꾸지 말고 source code를 맞춰야 한다.

7번도 slot caption ownership/API는 이미 충분히 정의되어 있다.
수정 시 overlay를 닫는 `SELECT_SLOT` 정책을 전역 변경하지 말고,
caption editor 안에서 target을 선택하는 방법을 명시적으로 구성하는 방향을 우선 검토해야 한다.

## 5. 후속 QA acceptance criteria

실제 수정 패치에는 최소한 다음 회귀 검사를 추가해야 한다.

1. **startup**
   - 사용자 action 전 default 2×2의 visible `.slot` 4개 존재.
   - palette apply 없이 dashboard가 보임.

2. **palette actions**
   - UI 색상 Modal의 action hierarchy가 결정한 variant와 일치.
   - apply가 renderer initialization side effect의 유일한 경로가 아님.

3. **layout preview**
   - 각 preview cell의 bounding rect가 대응 grid track을 채움.
   - merged row/col span이 실제 비율로 보임.
   - preview resize에 따라 cell geometry도 함께 변함.
   - layout control alignment는 reference fixture와 대조.

4. **label preview**
   - preview와 dashboard `.slot-label`의 font family/size/weight/line-height/padding projection 대응.
   - 같은 x/y에서 reference origin과 bounding box offset이 일치.

5. **font controls**
   - graph/label/caption font selector의 predefined option 복원.
   - 기존 custom font family도 손실 없이 표시/유지.

6. **label size input**
   - multi-digit 값에서 Backspace로 transient empty/partial 입력 가능.
   - commit 시에만 최소 6 validation.
   - invalid commit 후 authoritative state는 valid.

7. **slot caption**
   - slot 미선택 상태에서 caption UI 진입 후 target 선택 가능한 경로.
   - 이미 선택된 slot에서 즉시 slot mode 진입 가능.
   - slot 변경 시 overlay 의도와 target state가 일관됨.
   - slot.caption만 변경되고 global caption은 영향 없음.

8. **caption field alignment**
   - 이름 TextInput과 이름 굵게 control의 control baseline/bottom edge 정렬.

9. **print actions**
   - save/capture visual hierarchy를 명시적으로 결정하고 두 버튼이 그 규칙을 따름.

## 6. 우선순위

### P0/P1 — 기능 장애

- 2. 최초 slot 미렌더
- 7. slot-caption interaction 접근 불가

### P1 — 기능/상호작용 parity

- 3. layout preview geometry + layout alignment
- 6. label font-size editing

### P2 — renderer/UI parity

- 4. label preview vertical geometry
- 5. font selector 복원
- 8. caption name row alignment

### P3 — visual consistency

- 1. UI palette apply button variant
- 9. print save button variant

우선순위는 수정 순서를 강제하는 별도 설계 결정이 아니라
QA 영향도 분류다. 같은 ownership 단위에서 함께 고치는 편이 더 단순하면
layout/label/caption 단위로 묶어 수정할 수 있다.

## 7. 결론

이번 문제 묶음은 Mantine 자체의 한계가 아니라
**porting 중 기존 UI renderer/CSS interaction contract의 일부를
generic Mantine component로 치환하면서 parity 검사가 충분히 세밀하지 않았던 것**이
공통 원인이다.

Source Script의 domain/state 의미는 대체로 이미 올바르며,
현재 수정의 주 대상은 `fast-figure-ui.js`, startup renderer call,
그리고 이를 실제 DOM interaction 수준에서 검증할 browser QA다.

이 review를 기준으로 다음 수정에서는
“기능 존재 여부”만 확인하지 말고 pre-Mantine reference와
실제 geometry/control interaction을 동시에 대조해야 한다.
