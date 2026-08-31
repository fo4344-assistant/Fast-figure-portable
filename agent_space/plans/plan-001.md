# 계획 001 — 슬롯 콘텐츠 교환 문제와 구조 개선

## 1. 목적

현재 Fast Figure의 슬롯 간 콘텐츠 교환 동작에서 발생하는 상태 누락 문제를 해결하고, 이후 슬롯 콘텐츠에 새로운 속성이 추가되더라도 개별 필드 목록을 계속 수정하지 않아도 되는 구조로 개선한다.

이번 변경은 단순히 현재 발견된 `caption` 누락만 수정하는 것이 아니라 다음 조건을 만족하는 것을 목표로 한다.

- 슬롯의 물리적 위치와 슬롯에 담긴 콘텐츠를 명확히 분리한다.
- 같은 슬롯 콘텐츠에 속하는 상태는 항상 함께 이동한다.
- 새로운 콘텐츠 속성이 추가되어도 swap 및 grid 재구성 코드를 수정할 필요가 없도록 한다.
- 기존 FFPX v3 파일과의 호환성을 유지한다.
- 슬롯 상태 변경이 EFSM을 우회하지 않도록 한다.
- 현재 기능 자유도와 향후 구현·확장 자유도를 유지하면서 중복된 상태 처리 로직을 줄인다.

## 2. 현재 확인된 문제

### 2.1 `swapSlotContents()`의 필드 누락

현재 `swapSlotContents()`는 다음 필드만 직접 교환한다.

```js
let keys = ["chart", "imageId", "contentType"];
```

그러나 슬롯에는 이외에도 `caption`이 존재한다.

따라서 슬롯 A와 슬롯 B를 교환하면 graph 또는 image와 `contentType`은 이동하지만 caption은 원래 물리 슬롯에 남는다. 결과적으로 하나의 콘텐츠 단위로 취급되어야 하는 graph/image와 caption이 분리된다.

## 3. 단순 수정이 적절하지 않은 이유

현재 문제만 해결하려면 `caption`을 교환 목록에 추가할 수 있다.

```js
["chart", "imageId", "contentType", "caption"]
```

그러나 이 방식은 채택하지 않는다.

슬롯 콘텐츠에 향후 `crop`, `transform`, `annotation`, `localStyle`, image-specific settings, graph-specific settings 같은 상태가 추가될 수 있기 때문이다. 필드가 추가될 때마다 swap 목록도 함께 수정해야 하며, 누락되면 현재 caption 문제와 같은 종류의 오류가 반복된다.

따라서 movable state를 열거하는 방식이 아니라 movable state 자체를 하나의 객체로 구조화해야 한다.

## 4. 현재 슬롯 구조의 문제

현재 슬롯은 위치 정보와 콘텐츠 정보가 같은 객체 수준에 평평하게 존재한다.

```js
slot = {
  id,
  row,
  col,
  rowSpan,
  colSpan,
  hidden,

  chart,
  imageId,
  contentType,
  caption
}
```

여기에는 서로 다른 두 종류의 상태가 섞여 있다.

### 물리 슬롯 상태

- `id`
- `row`
- `col`
- `rowSpan`
- `colSpan`
- `hidden`

이 값들은 콘텐츠를 다른 슬롯으로 옮겨도 원래 슬롯에 남아야 한다.

### 슬롯 콘텐츠 상태

- `chart`
- `imageId`
- `contentType`
- `caption`

이 값들은 슬롯 콘텐츠를 이동하면 함께 이동해야 한다.

현재 구조에서는 이 두 종류가 객체 수준에서 구분되지 않기 때문에, 콘텐츠를 이동할 때 어떤 필드를 이동해야 하는지 호출자가 직접 알아야 한다.

## 5. 목표 런타임 구조

런타임 슬롯 구조를 다음처럼 분리한다.

```js
slot = {
  id,
  row,
  col,
  rowSpan,
  colSpan,
  hidden,

  content: {
    chart,
    imageId,
    contentType,
    caption
  }
}
```

이 구조에서 `slot`은 물리적 슬롯을 나타내고, `slot.content`는 그 슬롯에 들어 있는 이동 가능한 내용 전체를 나타낸다.

따라서 slot contents swap은 개별 필드 복사가 아니라 객체 전체 교환으로 정의한다.

```js
const sourceContent = source.content;
source.content = target.content;
target.content = sourceContent;
```

새로운 콘텐츠 필드가 `content` 내부에 추가되더라도 swap 로직을 수정할 필요가 없다.

## 6. `normalizeSlotContent()`의 역할

기존 FFPX v3와 기존 런타임 구조는 flat slot 형식을 사용한다. 따라서 새 runtime 구조를 도입할 때 기존 슬롯을 새 구조로 변환하는 normalization 경계가 필요하다.

```text
기존 flat slot
      ↓
normalizeSlotContent()
      ↓
새 runtime slot.content
```

`normalizeSlotContent()`는 이미 존재하는 `slot.content`를 현재 알려진 필드만 이용해 새 객체로 다시 만들어서는 안 된다. 향후 추가된 content 필드가 normalization 과정에서 사라질 수 있기 때문이다.

따라서 기존 `content` 객체가 있으면 그대로 보존하고, 현재 필수 필드가 없는 경우에만 legacy flat field로부터 보충한다.

개념적으로는 다음과 같다.

```js
let content =
  slot.content && typeof slot.content === "object"
    ? slot.content
    : {};

if (!("chart" in content))
  content.chart = slot.chart ?? null;

if (!("imageId" in content))
  content.imageId = slot.imageId ?? null;

if (!("contentType" in content))
  content.contentType = slot.contentType || "graph";

if (!("caption" in content))
  content.caption =
    typeof slot.caption === "string" ? slot.caption : null;
```

여기서 현재 네 필드를 명시하는 것은 movable state 목록이 아니라 legacy schema에서 새 runtime schema로 변환하기 위한 compatibility boundary이다.

## 7. 기존 접근 방식 호환성

현재 코드 전체를 한 번에 `slot.chart`에서 `slot.content.chart` 형태로 변경하면 변경 범위가 지나치게 커진다.

따라서 초기 단계에서는 legacy accessor를 유지한다.

- `slot.chart` ↔ `slot.content.chart`
- `slot.imageId` ↔ `slot.content.imageId`
- `slot.contentType` ↔ `slot.content.contentType`
- `slot.caption` ↔ `slot.content.caption`

이 accessor는 compatibility layer이며 runtime source of truth는 `slot.content`로 제한한다.

이를 통해 기존 코드 변경 범위를 줄이고, 점진적으로 직접 `slot.content` 접근으로 이동할 수 있으며, 동일 상태가 두 군데 저장되는 문제를 만들지 않는다.

## 8. FFPX v3 호환성

현재 FFPX v3는 flat slot 구조를 저장한다. 따라서 이번 변경에서는 외부 파일 포맷을 변경하지 않는다.

```text
FFPX v3 flat representation
          ↓ import
normalizeSlotContent()
          ↓
runtime slot.content
          ↓ export compatibility serialization
FFPX v3 flat representation
```

이 방식이면 `PACKAGE_FORMAT_VERSION`을 변경할 필요가 없다.

향후 새로운 콘텐츠 상태를 실제로 FFPX에 영속화해야 하는 시점에는 별도의 format version 변경을 검토한다.

## 9. `rebuildGridSlots()` 문제

현재 `rebuildGridSlots()` 역시 콘텐츠를 `chart`, `imageId`, `contentType`, `caption` 같은 개별 필드로 복사한다.

따라서 swap만 `slot.content` 구조로 바꾸어도 grid resize 또는 slot rebuild 과정에서 다시 content의 일부 필드가 누락될 수 있다.

`rebuildGridSlots()`도 콘텐츠를 하나의 단위로 취급해야 한다.

개념적으로:

```js
{
  row,
  col,
  rowSpan,
  colSpan,
  content: structuredClone(s.content)
}
```

처럼 처리한다.

이렇게 해야 이후 `content` 내부에 추가되는 필드도 grid rebuild 과정에서 자동으로 보존된다.

## 10. EFSM 관련 현재 문제

현재 `swapSlotContents()`는 슬롯 객체를 직접 수정한 뒤 별도로 `appFSM.send("SELECT_SLOT", ...)`와 `appFSM.notify("slots", "SLOTS_SWAPPED", ...)`를 호출한다.

여기서 `SLOTS_SWAPPED`는 실제 상태 변경을 수행하는 EFSM event가 아니라, 이미 발생한 변경을 알리는 notification 성격이다.

즉 현재 swap은 다음 순서다.

```text
직접 slot mutation
    ↓
후속 EFSM/UI 알림
```

이 구조는 다른 domain mutation 경로와 일관되지 않는다.

다른 주요 슬롯 변경은 EFSM action에서 `assertWritable → 상태 검증 → mutation → project validation → transition` 순서를 따른다. 따라서 swap 역시 같은 경로로 옮겨야 한다.

## 11. 목표 EFSM 경로

`SLOTS_SWAPPED`를 실제 EFSM event로 사용한다.

```text
사용자 drag/drop
    ↓
appFSM.send("SLOTS_SWAPPED", {
  sourceSlotId,
  targetSlotId
})
    ↓
applySlotsSwappedAction(...)
    ↓
assertWritable(...)
    ↓
slot lookup / validation
    ↓
source.content ↔ target.content
    ↓
selection 정리
    ↓
project validation
    ↓
workspace transition
```

이를 통해 swap도 다른 domain mutation과 동일하게 EFSM의 관리 하에 둔다.

## 12. swap 시 함께 처리해야 하는 UI 상태

슬롯 콘텐츠만 교환하면 충분하지 않다.

### 선택 슬롯

현재 사용자 의도와 기존 동작을 유지하도록 `selectedSlotId`를 적절히 이동 또는 유지한다.

### graph object selection

슬롯 콘텐츠가 바뀌면 이전 graph object selection은 유효하지 않을 수 있으므로 `graphObject → none`으로 초기화해야 한다.

### asset selection

이전 슬롯에 연결된 CSV/image 선택 상태도 더 이상 유효하지 않을 수 있으므로 `assetSelection → none`으로 정리한다.

### workspace

swap 이후 선택된 슬롯의 실제 `contentType`을 기준으로 `slot.graph` 또는 `slot.image`로 이동해야 한다.

### overlay

layout, caption 등 열린 overlay가 있다면 현재 transition 구조와 충돌하지 않는지 확인한다. 필요한 경우 동일 overlay 상태에서 내용만 갱신하도록 한다.

## 13. EFSM 등록 대상

`SLOTS_SWAPPED`는 최소한 다음 이벤트 그룹과의 관계를 확인해야 한다.

- `SHARED_WORKSPACE_EVENTS`
- `GRAPH_OBJECT_EVENTS`
- `ASSET_SELECTION_EVENTS`
- `SHARED_OVERLAY_EVENTS`

목표는 별도의 우회 로직을 만드는 것이 아니라 기존 EFSM의 상태 정리 규칙을 재사용하는 것이다.

## 14. 적용 계획

### 단계 1 — runtime slot normalization 추가

- `normalizeSlotContent(slot)` 구현
- 기존 `content` 객체가 있으면 전체 보존
- legacy flat field에서 누락된 현재 필드만 보충
- compatibility accessor 구성

### 단계 2 — 슬롯 생성 경로 변경

`newGridSlot()`이 처음부터 nested `content` 구조의 runtime slot을 만들도록 한다.

### 단계 3 — ProjectObject 경계에서 normalization

`ProjectObject.slots` setter 또는 이에 대응하는 실제 슬롯 입력 경계를 이용해 신규 slot, FFPX import slot, 기존 flat slot이 모두 runtime normalized 상태가 되도록 한다.

### 단계 4 — grid rebuild 수정

`rebuildGridSlots()`가 콘텐츠 개별 필드를 나열하지 않고 `content` 객체 전체를 보존하도록 한다.

### 단계 5 — EFSM swap event 추가

`SLOTS_SWAPPED`를 실제 상태 변경 event로 승격한다.

관련 action에서 writable 검증, source/target 검증, content 전체 교환, selection 정리, project validation을 수행한다.

### 단계 6 — 기존 직접 mutation 제거

기존 `swapSlotContents()`가 직접 슬롯 상태를 수정하지 않도록 한다. 필요하면 함수 자체는 UI event dispatcher 역할만 유지한다.

### 단계 7 — FFPX v3 compatibility serialization 유지

runtime nested representation을 기존 flat FFPX v3 representation으로 변환한다. 현재 package format version은 유지한다.

## 15. 채택하지 않는 방향

### `SLOT_CONTENT_FIELDS` 상수 도입

개별 movable field의 hardcoded enumeration을 다른 위치로 옮길 뿐이므로 채택하지 않는다.

### caption만 swap 목록에 추가

현재 현상은 해결하지만 동일 구조의 누락 문제를 반복해서 만들 수 있으므로 근본 해결책으로 사용하지 않는다.

### 모든 슬롯 필드를 통째로 swap

`id`, `row`, `col`, span 등 물리 슬롯의 identity와 layout까지 이동하므로 요구 동작과 다르다.

### FFPX 포맷을 즉시 nested content 구조로 변경

현재 문제 해결에는 외부 포맷 변경이 필요하지 않으며 불필요한 format version 증가와 compatibility 부담이 생기므로 이번 변경에서는 수행하지 않는다.

### 전체 코드에서 legacy field 접근을 즉시 제거

변경 범위가 지나치게 커지고 회귀 위험이 증가한다. compatibility accessor를 두고 점진적으로 이전한다.

## 16. 테스트 계획

### 기본 swap

1. graph A + caption A
2. 빈 slot B

교환 후 B에는 graph A + caption A가 있고 A는 비어 있어야 한다.

### 양쪽 graph slot

A의 graph A + caption A와 B의 graph B + caption B가 정확히 서로 교환되어야 한다.

### image slot

image와 caption도 하나의 `content` 단위로 이동해야 한다.

### graph ↔ image

교환 후 `contentType`, graph/image payload, caption이 모두 함께 이동해야 한다. workspace도 새로운 selected slot type과 일치해야 한다.

### 물리 슬롯 identity

swap 전후 `id`, `row`, `col`, `rowSpan`, `colSpan`, `hidden`은 변경되지 않아야 한다.

### grid rebuild

swap 이후 grid resize, merge, split 또는 rebuild가 발생해도 content 전체가 유지되어야 한다.

### FFPX v3 roundtrip

slot swap → FFPX export → 새 project import 이후에도 graph/image와 caption 연결이 유지되어야 한다.

### EFSM

`READY → slot selection → SLOTS_SWAPPED → correct workspace` 경로를 확인하고 graph selection 초기화, asset selection 초기화, overlay 상태 일관성, writable guard, project validation이 정상 동작하는지 확인한다.

### 회귀 검사

- CSV 연결
- image 연결
- FFSX import/export
- FFPX import/export
- label
- caption editor
- grid merge/split
- graph object selection
- project reload

에 영향이 없는지 확인한다.

## 17. 최종 패치 원칙

이번 변경의 핵심은 코드 줄 수를 최소화하는 것이 아니다.

현재와 같은 기능 자유도를 유지하면서 개별 movable field를 반복 열거하는 구조를 하나의 `content` abstraction으로 바꾸어 구현 복잡도 증가보다 더 큰 기능·구현·확장 자유도를 얻는 것이 목적이다.

`slot.content` 구조는 swap뿐 아니라 grid rebuild와 향후 콘텐츠 확장에서도 동일한 규칙을 재사용할 수 있으므로, 현재 확인된 문제 범위에서는 개별 필드 패치보다 적절한 최소 구현 구조로 판단한다.
