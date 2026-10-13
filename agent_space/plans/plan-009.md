# 계획 009 — Mantine UI 일관성 및 슬롯/자산/빈 CSV 회귀 수정

## 1. 적용 기준

이 계획은 현재 `main`의 Source Script r16, verification-model r6, Source Code r12를 기준으로 한다.

개발 계층의 권위 순서는 다음을 유지한다.

```text
Source Script
→ verification-model
→ TLC validation
→ Source Code
```

현재 `development-versions.json` 상태에서 verification-model과 Source Code는 stale이므로, 사용자 관찰 가능한 동작 의미를 바꾸는 변경은 Source Script에서 먼저 확정한다.

이번 작업은 새 브랜치를 만들지 않고 `main`에서 진행한다. GitHub Actions는 사용하지 않는다. 구현 변경은 모두 `agent_space/patches/YYYYMMDD-NNN.patch`와 같은 basename의 설명 Markdown으로 기록한다.

이 계획은 작업 범위를 줄이기 위한 요약문이 아니다. 아래 조건, 분기, 예외와 처리 순서는 실제 구현과 검증에서 그대로 보존한다.

---

## 2. Layout / Label / Caption / Print 팝업 폭

### 2.1 현재 확인된 구현

`fast-figure-ui.js`에서 현재 크기 지정은 다음과 같이 분산되어 있다.

- `FastFigureLayoutOverlay`: `size: "xl"`
- `FastFigureLabelOverlay`: `size: "lg"`
- `FastFigureCaptionOverlay`: `size: "lg"`
- `FastFigurePrintOverlay`: `size: "lg"`

`fastFigureTheme.components.Modal`에는 현재 다음 공통 lifecycle만 정의되어 있다.

- `centered: true`
- `closeOnClickOutside: true`
- `closeOnEscape: true`

폭은 공통 ownership으로 관리되지 않는다.

### 2.2 확정 변경

사용자가 별도의 축소 또는 서로 다른 폭을 요구한 적이 없으므로 위 개별 폭 지정은 유지하지 않는다.

다음 규칙으로 수정한다.

1. Layout, Label, Caption, Print 네 overlay는 모두 같은 최대 크기를 사용한다.
2. 현재 사용 중인 Mantine 최대 크기보다 더 넓은 Fast Figure 전용 최대 폭을 정의한다.
3. 네 overlay 각각에 동일 숫자나 동일 문자열을 반복해서 하드코딩하지 않는다.
4. Fast Figure 설정 overlay의 공통 폭 source of truth는 Mantine theme 또는 하나의 공통 Mantine overlay size definition에 둔다.
5. 네 overlay는 그 공통 size definition만 참조한다.
6. CSS, inline style, legacy popup sizing 함수가 같은 outer Modal width를 다시 독립적으로 결정하게 하지 않는다.
7. README Modal 등 이번 네 설정 overlay와 다른 목적의 Modal은 자동으로 같은 폭으로 바꾸지 않는다.
8. 기존의 centered / outside click / Escape 공통 lifecycle은 유지한다.

### 2.3 Source Script 범위

`sourcescript/api_ui.py`의 Mantine ownership 규칙을 검토한다.

현재 `MANTINE_THEME_RULE`에는 generic Button/ActionIcon/Input 크기와 Modal centered/Escape/outside-click만 명시되어 있다.

네 설정 overlay의 공통 outer sizing ownership을 Fast Figure UI 구조의 규칙으로 명시할 필요가 있다면 다음 의미를 추가한다.

- Layout / Label / Caption / Print의 outer Modal size는 개별 component가 독립적으로 소유하지 않는다.
- 공통 Mantine UI sizing ownership이 하나의 규칙으로 결정한다.
- 구체적인 px 값과 Mantine size token 표현은 Source Code의 저수준 구현 세부다.

---

## 3. Layout 미리보기 가운데 정렬

### 3.1 현재 확인된 구현

`FastFigureLayoutOverlay`의 preview는 현재 대략 다음 값을 직접 가진다.

- `width: previewGeometry.width`
- `maxWidth: "100%"`
- `height: previewGeometry.height`

resize handle은 별도로 `Math.min(previewGeometry.width, 900)`에 해당하는 폭을 가진다.

preview와 handle을 함께 소유하는 공통 width/alignment wrapper가 없다.

### 3.2 변경

1. preview와 resize handle을 하나의 크기/정렬 ownership 아래 둔다.
2. preview surface는 Modal content 영역에서 수평 가운데 정렬한다.
3. resize handle도 preview와 같은 실제 rendered width와 같은 수평 위치를 따른다.
4. preview와 handle이 각각 독립적으로 width를 계산하지 않는다.
5. 가운데 정렬을 위해 별도의 persistent/project state를 추가하지 않는다.
6. 이 정렬 정보는 renderer-local layout일 뿐 domain Source of Truth가 아니다.

이 부분은 persistent project 의미나 mutation 의미를 바꾸지 않는 renderer 세부이므로, 별도의 Source Script domain 의미를 추가하지 않는다.

---

## 4. Layout 미리보기 확대 시 폭 제한 이후 찌그러지는 문제

### 4.1 현재 확인된 원인

`previewWidth`를 `layoutApi.readState(previewWidth)`에 전달하면 `dashboardGeometry(width)`가 다음 값을 같은 width 기준으로 계산한다.

- width
- height
- scale
- aspect
- outerMargin
- gap
- radius

Source Script의 `dashboardGeometry(width, heightOverride)`에는 다음 계산이 명시되어 있다.

```text
scale = width / referenceWidth
naturalHeight = width / configuredAspect
height = valid heightOverride가 있으면 override, 아니면 naturalHeight
outerMargin = configuredOuterMargin * scale 기준
gap = configuredGap * scale
radius = configuredRadius * scale
```

그러나 현재 React DOM에서는 계산된 `previewGeometry.width`를 지정한 뒤 `maxWidth: "100%"`로 실제 폭만 별도로 줄일 수 있다. 그 경우 `previewGeometry.height`, gap, outerMargin, radius는 줄어들기 전 width를 기준으로 남는다.

따라서 Modal 가용 폭이 requested preview width보다 작아지는 순간 실제 rendered width와 geometry 계산 기준 width가 분리되고, 일정 크기 이후 종횡비와 내부 geometry가 어긋날 수 있다.

### 4.2 변경

1. 사용자 drag로 얻는 requested preview size와 실제 rendered preview width를 구분한다.
2. requested size는 UI-local interaction state로 유지할 수 있다.
3. 실제 geometry 계산은 실제 rendered width 하나를 기준으로 수행한다.
4. actual rendered width가 Modal content 폭에 의해 제한되면:
   - height
   - scale
   - gap
   - outerMargin
   - radius
   를 모두 같은 actual width에서 다시 계산한다.
5. width만 CSS로 clamp하고 height를 이전 계산값으로 유지하는 구조를 제거한다.
6. `dashboardGeometry`의 기존 aspect 계산 의미는 바꾸지 않는다.
7. 실제 폭 측정을 위해 `ResizeObserver`를 사용할지 다른 Mantine/DOM 측정 방식을 사용할지는 Source Code 단계에서 최소 복잡도와 lifetime 안정성을 비교해 결정한다.
8. 실제 DOM 측정값은 renderer projection 입력이며 persistent project state가 아니다.
9. requested width와 actual width 사이를 양방향 동기화하여 어느 쪽이 권위인지 판정해야 하는 구조를 만들지 않는다.
10. resize handle은 preview와 같은 rendered width를 사용한다.

---

## 5. 슬롯 선택 규칙

### 5.1 현재 Source Script에서 수정해야 하는 부분

`sourcescript/renderer_runtime.py::installSlotClickController()`에는 현재 다음 의미가 있다.

1. graph/image content가 있는 slot의 본문 클릭은 Plotly/image interaction에 맡기며 slot selection을 바꾸지 않는다.
2. content slot은 bookmark control click만 `setSelectedSlot`로 전달한다.
3. empty slot은 surface click으로 선택할 수 있다.

이 규칙은 선택 상태를 먼저 구분하지 않고 content 존재 여부를 먼저 사용한다.

현재 Source Code도 같은 구조로:

```text
hasInteractiveContent = chart 또는 image 존재

bookmark 또는 interactive content가 없음
→ setSelectedSlot

그 외
→ content-pass-through
```

로 처리한다.

그 결과 graph 또는 image가 있는 slot이 미선택 상태여도 본문 클릭이 selection 경로로 들어가지 않는다.

### 5.2 새 Source Script 규칙

선택 여부를 content type보다 먼저 판정한다.

#### 미선택 visible slot

- graph slot, image slot, empty slot이라는 이유로 selection 가능 여부를 다르게 하지 않는다.
- 미선택 visible slot의 slot surface에 대한 유효한 click은 해당 slot을 선택할 수 있어야 한다.
- 선택 command는 기존 `setSelectedSlot` → `SELECT_SLOT` 경로를 사용한다.

#### 이미 선택된 visible slot

- content가 있는 경우 slot 본문은 해당 content interaction에 사용한다.
- graph slot에서는 Plotly interaction을 유지한다.
- image slot에서는 image interaction을 유지한다.
- bookmark control은 선택 상태와 관계없이 기존 `SELECT_SLOT` toggle semantics를 사용한다.
- 이미 선택된 같은 slot의 bookmark를 다시 클릭하면 기존 규칙대로 선택 해제된다.

#### empty slot

- empty slot도 selection state 판정은 같은 공통 규칙을 사용한다.
- content interaction이 존재하지 않으므로 selected 상태의 empty surface click을 어떻게 처리하는지는 기존 toggle semantics와 충돌하지 않게 Source Script에 명시한다.
- graph/image 여부 때문에 별도의 selection authority를 만들지 않는다.

#### drag

기존 bookmark drag click-suppression 의미는 유지한다.

- drag interaction에서 생긴 후속 click을 selection/toggle로 해석하지 않는다.
- source/target slot swap 의미는 바꾸지 않는다.

### 5.3 Source Code

Source Script와 verification이 갱신된 뒤 `fast-figure.js::installSlotClickController()`를 동일한 분기 순서로 수정한다.

content type별로 독립 selection handler를 만들지 않는다.

---

## 6. 슬롯 바깥 영역 클릭 시 선택 해제

### 6.1 현재 상태

현재 dashboard click controller에서 `.slot`을 찾지 못하면 바로 return한다.

Source Script에도 dashboard/background click으로 현재 slot selection을 해제하는 규칙이 없다.

### 6.2 Source Script 변경

다음 조건을 명시한다.

1. 현재 selected slot이 존재한다.
2. click이 slot에 속하지 않는 선택 해제 대상 background 영역에서 발생한다.
3. 그 click이 overlay, toolbar, sidebar, Modal control 등 unrelated UI interaction은 아니다.

위 조건을 만족하면 기존 slot selection authority를 통해 selection을 없음으로 변경한다.

새 runtime selection state나 별도의 deselection flag를 만들지 않는다.

### 6.3 Source Code

`installSlotClickController()`의 non-slot click 경로를 Source Script의 정확한 interaction boundary에 맞춰 수정한다.

전역 document click을 무조건 deselect로 사용하지 않는다.

---

## 7. trash 경로 아래 파일의 [...] 메뉴

### 7.1 현재 확인된 직접 원인

`fast-figure-ui.js`의 asset row에서 trash 상태를 나타내는 `inactive`가 파일 선택 control뿐 아니라 `Menu.Target`의 ActionIcon에도 적용된다.

따라서 trash asset에서는 menu 자체가 열리지 않는다.

### 7.2 변경

1. asset row의 selection 가능 여부와 action menu 접근 가능 여부를 분리한다.
2. trash subtree의 CSV/image가 일반 asset-selection 대상으로 비활성화되어 있더라도 `[...]` menu target 자체는 활성화할 수 있어야 한다.
3. menu 안의 각 action 가능 여부는 해당 command의 실제 precondition에 따라 별도로 결정한다.
4. menu를 열 수 있게 하는 것과 asset을 다시 slot에 연결할 수 있게 하는 것을 같은 의미로 취급하지 않는다.
5. 기존 `FastFigureProjectDataTree` ownership 안에서 처리한다.
6. 별도의 legacy menu 또는 duplicate action model을 만들지 않는다.

### 7.3 복원 의미를 임의로 추가하지 않음

현재 Source Script에는:

- `planProjectNodeMove`
- `moveProjectNode`
- trash 진입 시 reference detach
- trash subtree 판정
- trash 비우기

가 있다.

그러나 "원래 위치 복원"을 위해 원래 path를 영속적으로 저장하는 의미는 없다.

따라서 이번 menu 접근 복구만을 이유로 original-location restore state를 새로 만들지 않는다.

trash 밖의 임의 target directory로 기존 move command를 사용할 수 있는지와, 사용자가 별도의 원래 위치 복원을 요구하는지는 구분한다.

---

## 8. 빈 CSV 삽입 복구

### 8.1 현재 확인된 구조

Source Script에는:

- `assets_files.py::createProjectCsv`
- `DATA_OBJECT_CREATED`
- `graphs.py::graphEditorAdd(csvId)`
- `SLOT_DATA_CONNECTED`

가 존재한다.

그러나 `api_ui.py::PUBLIC_API_METHODS`에는 `images.insertEmpty`에 대응하는 explicit empty-CSV creation command가 없다.

현재 Source Code/UI에도 사용자가 호출할 수 있는 완결된 empty CSV insertion 경로가 없다.

### 8.2 과거 동작 확인

구현 전에 저장소 history와 기존 patch에서 과거 "빈 CSV 삽입"이 사용하던 다음 값을 확인한다.

- 초기 table shape
- 초기 column/header 내용
- filename/name
- `headerLines`
- serialized bytes
- 생성 후 asset selection 여부
- selected slot에 즉시 graph object로 연결했는지 여부

이 값을 추측해서 새로 정의하지 않는다.

### 8.3 Source Script 변경

과거 요구와 프로젝트 의미를 확인한 뒤 explicit empty CSV creation command를 정의한다.

이 command는 별도 CSV authority를 만들지 않는다.

기존 mutation 경로를 조합한다.

```text
empty CSV candidate 생성
→ createProjectCsv / DATA_OBJECT_CREATED
→ 필요한 경우 기존 graphEditorAdd 또는 SLOT_DATA_CONNECTED
→ commit된 Source of Truth를 다시 읽어 UI projection 갱신
```

기존 protected/default CSV와 같은 특수 asset을 다시 만들지 않는다. 현재 Source Script r16의 "보호된 default CSV 같은 예외 asset은 존재하지 않는다" 규칙을 유지한다.

---

## 9. Source Script revision 작업

위 항목 중 사용자 관찰 가능한 interaction 또는 public command 의미가 바뀌는 부분을 먼저 Source Script에 반영한다.

예상 수정 대상:

- `sourcescript/renderer_runtime.py`
  - selection-state-first slot click 규칙
  - background deselection boundary
- `sourcescript/api_ui.py`
  - trash menu interaction ownership이 필요한 범위
  - empty CSV public command
  - 네 설정 overlay 공통 Modal sizing ownership
- `sourcescript/graphs.py`
  - empty CSV command가 graph/editor 책임을 가지는 부분이 있다면 구체 처리
- `sourcescript/assets_files.py`
  - empty CSV asset 생성이 기존 `createProjectCsv` 계약으로 충분한지 확인
  - trash menu가 호출하는 기존 move/read precondition 확인
- `sourcescript/layout_annotations_export.py`
  - preview resize는 기존 `dashboardGeometry` 의미로 충분하면 변경하지 않는다.

Source Script를 수정할 때 조건, 분기, 처리 순서를 축약하지 않는다.

Source Script revision과 fingerprint를 갱신하고 closure review를 새로 작성한다.

---

## 10. verification-model

현재 verification-model r6는 stale이며 현재 README에 다음 미번역 영역이 명시되어 있다.

- asset/VFS algorithms
- graph/editor/Plotly algorithms
- complete application FSM/lifecycle
- renderer/API/UI modules

따라서 fingerprint만 새 Source Script에 맞춰 바꾸지 않는다.

이번 변경에 필요한 의미를 PlusCal/TLA+에 직접 번역한다.

최소 검증 범위:

1. slot selection
   - 미선택 visible slot 선택
   - 같은 slot toggle
   - selection 없음으로 전환
   - workspace와 selectedSlotId 관계
2. empty CSV command가 persistent mutation을 일으키는 경우
   - CSV create
   - chart/object connection
   - reference validity
3. asset move/trash command와 이번 UI가 사용하는 mutation precondition
4. 새로운 persistent state를 만들지 않는 UI-only rule은 verification state로 억지로 모델링하지 않는다.

TLC validation review를 작성하고 verification-model이 current + passed가 된 뒤 Source Code 구현으로 진행한다.

---

## 11. Source Code 구현

verification gate를 통과한 뒤 다음 파일을 수정한다.

### fast-figure.js

- slot selection-state-first click dispatch
- dashboard/background deselection
- empty CSV command
- 기존 VFS/graph mutation path의 필요한 adapter

### fast-figure-ui.js

- Layout/Label/Caption/Print 공통 최대 Modal size
- 현재 최대 size보다 더 넓은 Fast Figure 전용 maximum
- 개별 `lg`/`xl` 제거
- layout preview/resize 공통 wrapper
- actual rendered width 기반 geometry
- trash asset ActionIcon/menu 접근과 asset selection disabled 분리
- empty CSV UI command 연결

### 제거/정리 대상

- 네 설정 overlay의 중복 outer-width ownership
- preview width와 handle width의 독립 계산
- actual width와 다른 width를 기준으로 고정 height를 유지하는 경로
- trash 여부 하나로 selection과 action-menu 전체를 동시에 disable하는 결합

---

## 12. 검증

### 12.1 슬롯

그래프, 이미지, 빈 슬롯 각각에서 다음 상태를 따로 검증한다.

- 미선택 상태에서 slot surface click
- 선택된 상태에서 slot content interaction
- bookmark click
- 동일 selected slot bookmark 재클릭
- 다른 slot 선택
- background deselection
- drag 후 발생 가능한 click suppression

그래프와 이미지는 selection 가능/불가능 규칙이 content type 때문에 달라지지 않아야 한다.

### 12.2 trash

- trash CSV/image row의 `[...]` menu가 열린다.
- trash asset의 일반 selection disabled 규칙은 별도로 유지된다.
- menu action disabled 여부는 각 command precondition을 따른다.
- menu 접근 복구가 slot reference를 자동 복원하지 않는다.

### 12.3 empty CSV

- empty CSV command가 실제 asset을 만든다.
- canonical VFS 위치를 가진다.
- 프로젝트 tree에 표시된다.
- 과거 정의된 동작이 selected graph slot 연결까지 포함했다면 동일하게 연결된다.
- 생성된 CSV가 일반 CSV와 다른 보호/특수 상태를 갖지 않는다.
- save/reopen에서 일반 project CSV와 동일하게 roundtrip한다.

### 12.4 Modal

Layout / Label / Caption / Print에서:

- 같은 공통 최대 width rule을 사용한다.
- 현재 기존 최대 크기보다 더 넓다.
- 네 component에 독립 size 값이 남지 않는다.
- centered / outside-click / Escape 의미는 유지된다.
- README 등 다른 Modal은 이번 규칙에 의도하지 않게 포함되지 않는다.

### 12.5 Layout preview

- Modal 내부에서 수평 가운데 정렬된다.
- resize handle과 preview가 동일 width/alignment를 사용한다.
- 아래 방향으로 확대할 수 있다.
- requested width가 Modal 가용 폭을 넘겨도 실제 rendered width/height aspect가 유지된다.
- actual rendered width가 줄어들면 gap/outerMargin/radius도 같은 scale로 줄어든다.
- Modal 크기를 다시 넓혔을 때 geometry가 stale DOM width를 사용하지 않는다.

---

## 13. 변경 기록과 rollback

각 구현 단계는 기존 patch 기록 정책을 따른다.

각 설명 Markdown에는 반드시 다음을 기록한다.

- 실제 변경 목적
- 변경 전 오류 경로
- 수정한 조건과 처리 순서
- Source of Truth 변화 여부
- Source Script / verification / Source Code 중 어느 계층 변경인지
- 선택한 구현 방향
- 검토했지만 선택하지 않은 대안
- 회귀 위험
- 아직 포함되지 않은 후속 작업
- rollback 시 되돌려야 하는 파일과 의미

Source Script 변경 patch에는 Source Script diff와 같은 revision의 `development-versions.json` 변경을 포함한다.

Source Code는 current verification-model + TLC passed 이후에만 current로 전환한다.

---

## 14. 실행 순서

1. 이 계획을 기록한다.
2. 과거 empty CSV 동작만 history에서 확인한다.
3. Source Script에서 slot/background/menu/empty-CSV/common-Modal-ownership 의미를 수정한다.
4. Source Script closure review와 revision/fingerprint를 갱신한다.
5. verification-model에 필요한 의미를 직접 번역한다.
6. TLC를 실행하고 validation review를 기록한다.
7. Source Code를 수정한다.
8. 브라우저 회귀를 로컬에서 실행한다.
9. `scripts/check-development-layer-versions.py`를 실행한다.
10. `scripts/build-portable.py`로 distribution을 로컬 재생성한다.
11. 생성물과 source의 최종 diff를 검토한다.

GitHub Actions는 사용하지 않는다.
