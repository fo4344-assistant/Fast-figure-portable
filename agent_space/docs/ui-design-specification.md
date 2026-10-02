# Fast Figure UI design specification

## 1. 목적과 범위

이 문서는 Fast Figure의 시각적 구성과 사용자 입력 상호작용에 대한 구현 독립적인 UI specification이다.

다음은 이 문서의 책임이다.

- 공통 UI component의 시각적 계층
- form field와 action control의 정렬
- modal과 overlay의 공통 사용 규칙
- layout/label 등 preview surface와 실제 renderer 사이의 표시 일관성
- 입력 중 draft와 확정 값의 사용자 경험
- 같은 의미 수준의 action 사이의 시각적 일관성

다음은 이 문서의 책임이 아니다.

- project/domain state의 의미
- persistent schema
- asset/chart/slot ownership
- file format
- EFSM의 domain transition 규칙
- export 계산 알고리즘

이 영역은 Source Script와 verification model이 권위를 가진다.

## 2. 공통 component 체계

일반적인 button, input, select, modal, menu, table, scroll container와 같은 UI control은
Mantine의 공통 theme와 component 규칙을 사용한다.

동일한 종류의 generic control은 개별 화면에서 별도 높이, padding, radius, font size를
재정의하지 않는다. 기능상 별도의 geometry가 필요한 경우에만 공통 control size 규칙에서
분리한다.

### 2.1 interaction control과 renderer surface

사용자가 누를 수 있다는 이유만으로 모든 interactive surface를 generic Button으로 표현하지 않는다.

다음과 같은 대상은 renderer surface로 취급한다.

- layout map의 slot cell
- 실제 결과를 축소해서 보여주는 preview element
- 위치 또는 크기 자체가 데이터/geometry 의미를 가지는 draggable surface

renderer surface는 자신이 표현하는 geometry를 우선한다.
generic Button의 고정 높이, 내부 padding 또는 typography가 renderer geometry를 바꾸면 안 된다.

선택 가능한 renderer surface는 Mantine의 unstyled/headless interaction primitive를 사용할 수 있으며,
keyboard/button semantics는 유지하되 크기는 parent geometry가 결정한다.

## 3. Modal과 overlay

동일 종류의 modal은 공통 Modal 규칙을 사용한다.

- close control의 위치와 크기를 화면별로 별도 구현하지 않는다.
- Escape와 outside-click 처리 여부는 공통 overlay 정책을 따른다.
- modal 내부 content 폭은 기능상 필요한 최소 폭을 제외하고 component별 arbitrary width로 분산하지 않는다.
- action row는 동일한 spacing과 control height 체계를 사용한다.

overlay 내부의 preview 또는 canvas가 별도 geometry를 가져야 하는 경우에도
modal chrome 자체의 규칙과 preview geometry를 섞지 않는다.

## 4. Action hierarchy

button variant는 단순히 구현 시 기본값을 생략한 결과가 아니라 의미 수준을 표현해야 한다.

- 같은 action row에서 동등한 수준의 동작은 같은 visual level을 사용한다.
- filled action은 명시적인 primary action일 때 사용한다.
- light/subtle action은 secondary 또는 low-emphasis action에 사용한다.
- 같은 기능 묶음에서 한 button만 이유 없이 filled 기본값을 상속하지 않는다.
- palette 색상은 공통 appearance source에서 투영하며 화면별 독립 색을 만들지 않는다.

이 규칙은 UI 색상 적용/초기화, print/export action 등 동일 dialog 안의 action 비교에도 적용한다.

## 5. Form layout

### 5.1 field alignment

같은 row의 입력 field는 control plane을 기준으로 정렬한다.

label이 있는 TextInput/NumberInput 옆에 label이 없는 toggle/button이 배치되는 경우,
button은 label line이 아니라 실제 input control의 bottom/control baseline에 맞춘다.

label 높이 차이 때문에 button이 위아래로 밀리지 않도록 field wrapper 또는 bottom alignment를 사용한다.

### 5.2 scalar controls

행/열, 간격, 여백, 반경, 배율과 같은 compact scalar input은
같은 화면 안에서 폭과 정렬 규칙을 일관되게 유지한다.

숫자 자체의 정렬은 같은 control group 안에서 일관되어야 하며,
layout editor처럼 값 비교가 중요한 compact numeric group에서는 centered numeric presentation을 기본으로 한다.

## 6. Layout preview

layout preview는 실제 dashboard grid의 축소 표현이다.

### 6.1 geometry

- preview 전체 종횡비는 dashboard layout의 종횡비를 따른다.
- grid row/column 수는 project layout과 동일하다.
- slot cell은 자신이 속한 grid track을 완전히 채운다.
- merged slot의 rowSpan/colSpan은 실제 span 비율을 그대로 표현한다.
- gap, outer margin, border visibility와 radius는 같은 reference geometry에서 투영한다.
- preview resize는 전체 preview geometry를 바꾸며 개별 cell에 고정 control height를 부여하지 않는다.

### 6.2 selection

slot selection은 geometry와 분리된 visual state이다.

- 선택 여부 때문에 cell 크기나 grid placement가 변하면 안 된다.
- selection은 appearance palette의 accent를 사용해 fill/border emphasis로 표현한다.
- unselected cell은 preview surface로 읽혀야 하며 일반 command button처럼 보이지 않아야 한다.

### 6.3 control alignment

layout preview 위의 scalar controls와 아래 action controls는 각각 같은 alignment plane을 사용한다.
preview와 resize handle은 modal content axis를 기준으로 정렬한다.

## 7. Label preview

label position preview는 실제 dashboard label renderer와 같은 typography projection을 사용한다.

최소한 다음 항목이 대응해야 한다.

- font family
- font size
- font weight
- line height
- horizontal/vertical padding
- position reference origin

preview 전용 기본 line-height가 실제 renderer의 line box를 덮어쓰면 안 된다.
현재 slot label 계열의 line-height 기준은 1.2이다.

drag 중 위치를 표시하기 위해 typography geometry가 바뀌면 안 된다.

## 8. Font family control

font family를 편집하는 UI는 predefined option을 선택할 수 있어야 한다.

기존 project에 predefined 목록 밖의 font family가 저장되어 있더라도
UI를 여는 것만으로 그 값이 손실되거나 기본값으로 교체되면 안 된다.

따라서 font control은 다음 두 조건을 함께 만족해야 한다.

- 일반 사용자는 목록에서 font를 선택할 수 있다.
- 기존 custom font family는 현재 값으로 표시되고 그대로 보존될 수 있다.

graph, label, caption의 font control은 같은 interaction model을 사용한다.

## 9. Numeric editing draft

minimum/maximum validation이 있는 numeric field에서도 사용자가 여러 자리 값을 편집하는 동안
일시적인 empty/partial 입력을 허용한다.

예를 들어 최소값이 6인 field에서 기존 값을 지우는 중간 상태를 즉시 6으로 확정하지 않는다.

- 편집 중 draft는 component-local UI state로 둘 수 있다.
- authoritative value에는 valid commit만 반영한다.
- blur, Enter 또는 명시적 apply 같은 commit boundary에서 range validation을 수행한다.
- invalid commit 뒤에는 마지막 valid value 또는 명시된 fallback을 표시한다.

이 draft는 persistent state나 별도 domain source of truth가 아니다.

## 10. Caption editor layout

caption editor의 text field, name field, style toggle과 target control은
각 control의 의미가 시각적으로 구분되되 동일한 form alignment 규칙을 따른다.

특히 name input과 name-weight toggle처럼 같은 row에 놓이는 control은
실제 control bottom edge를 맞춘다.

global/slot caption 대상 선택은 action button의 색 차이만으로 숨겨진 상태가 되지 않도록
명시적인 target state로 표시한다.

## 11. Preview와 실제 renderer의 대응 원칙

preview는 별도 디자인을 만드는 공간이 아니라 실제 결과의 축소/편집 projection이다.

preview와 실제 renderer가 공유해야 하는 값은 가능한 한 같은 authoritative setting을 읽는다.
다음 항목을 preview 전용 상수로 다시 소유하지 않는다.

- geometry scale의 원천
- font family/size/weight
- label padding/line-height
- slot gap/margin/radius
- appearance palette

preview에서만 필요한 local size와 drag state는 persistent project state로 승격하지 않는다.

## 12. 회귀 acceptance criteria

UI 변경은 최소한 다음을 검증한다.

1. generic Button의 크기 규칙이 renderer preview geometry에 침범하지 않는다.
2. layout cell의 bounding box가 대응 grid track을 채운다.
3. merged span과 resize 이후의 preview 비율이 유지된다.
4. label preview와 실제 label의 typography metrics가 대응한다.
5. font selector가 predefined/custom 값을 모두 보존한다.
6. numeric field에서 transient empty/partial edit가 가능하다.
7. field label 유무가 같은 row의 control baseline을 깨뜨리지 않는다.
8. 같은 의미 수준의 action은 명시된 variant hierarchy를 따른다.
9. palette 변경은 공통 appearance projection을 통해 모든 UI control에 반영된다.

이 검증은 domain roundtrip 검사와 별도로 실제 rendered DOM geometry 및 interaction 수준에서 수행한다.
