# Slot-core 파일 경계 기반 모듈 PlusCal/TLC 검증 방법과 비교

## 1. 목적

현재 slot-core 검증 모델은 다음 Source Script 파일에서 가져온 상태와 알고리즘을 하나의 PlusCal/TLC 상태공간에 함께 넣어 탐색한다.

- `sourcescript/project_state.py`
- `sourcescript/application_fsm.py`
- `sourcescript/layout_annotations_export.py`

기존 단일 모델은 의미를 한 곳에서 확인하기에는 단순하지만, 서로 다른 책임 영역의 국소 상태가 하나의 전역 상태에 함께 들어가면서 실제 검증 비용이 커진다.

예를 들어 application FSM이 slot reset/swap을 검사하는 동안 layout의 merge span, grid geometry, image settings의 구체 값까지 같은 전역 상태 안에 존재하면, application FSM이 그 값을 사용하지 않더라도 TLC는 그 조합을 서로 다른 전역 상태로 구분할 수 있다.

이번 실험의 목적은 다음 질문을 실제 TLC 실행으로 확인하는 것이다.

> Source Script의 기존 파일 구조와 import 관계를 1차 경계로 사용하고, 각 파일이 실제로 읽는 외부 값만 입력 projection으로 남기면, 같은 slot-core 의미 범위를 여러 국소 상태전이계로 검사했을 때 상태공간과 실행 시간이 얼마나 줄어드는가?

이번 작업은 canonical verification model을 교체하는 작업이 아니다. 기존 `verification/FastFigureSlotCore.tla`를 기준선으로 유지하고, `.github/tlc/modules/` 아래에 별도 실행 모델을 만들어 비교했다.

---

## 2. 왜 파일 구조를 1차 경계로 사용했는가

Source Script는 단순히 여러 파일로 나뉘어 있는 것이 아니라 파일마다 책임과 참조 관계를 명시한다.

현재 slot-core slice에서 중요한 관계는 다음과 같다.

```text
project_state.py
    ↑
    ├──────── application_fsm.py
    │              │
    │              └─ grid command delegation
    │
    └──────── layout_annotations_export.py
```

`project_state.py`는 authoritative project state와 slot-local ownership/reference invariant를 정의한다.

`application_fsm.py`는 reset/swap 같은 application-level mutation과 다른 domain command의 호출 경계를 소유한다.

`layout_annotations_export.py`는 grid resize, merge, split 같은 layout geometry와 그 과정에서의 slot-local payload 이동을 소유한다.

따라서 파일 구조 자체가 이미 다음 정보를 제공한다.

1. 어떤 상태와 규칙을 어느 책임 영역이 소유하는가.
2. 다른 모듈에서 가져오는 값이 무엇인가.
3. 어떤 호출이 다른 모듈의 구현 내부로 넘어가는가.
4. 같은 authoritative state를 공유하더라도 각 모듈이 실제로 관찰하는 부분이 무엇인가.

이 구조를 버리고 전체 PlusCal AST를 다시 임의 partition하는 것보다, 먼저 Source Script가 이미 정의한 파일/import 경계를 검증 경계로 사용하는 것이 더 직접적이다.

---

## 3. 분해 원칙

### 3.1 파일을 나누는 것만으로는 충분하지 않다

다음과 같이 파일만 둘로 나누고 각 모델에 동일한 `activeProject` 전체를 넣으면 상태공간 곱은 거의 그대로 남는다.

```text
Application model:
    activeProject 전체

Layout model:
    activeProject 전체
```

이번 실험에서는 그렇게 하지 않았다.

각 모듈에 다음 두 종류의 값만 둔다.

```text
1. 그 모듈이 직접 소유하고 변경하는 국소 상태
2. 다른 모듈에서 오지만 현재 모듈의 next-state 결정에 실제로 필요한 입력 projection
```

즉 공유 authoritative state가 존재한다는 사실 자체는 분해 금지 조건으로 사용하지 않았다.

### 3.2 공유 전역 상태는 소비자 관점의 입력 범위로 바꾼다

예를 들어 application FSM의 swap은 실제 project에서 source/target slot의 visibility를 확인한다.

그러나 application FSM이 swap을 처리할 때 layout 전체의 row/col/span/merge 구조를 직접 계산하지는 않는다.

따라서 application unit에는 전체 layout state를 넣는 대신 다음 입력만 둔다.

```text
sourceVisible ∈ {TRUE, FALSE}
targetVisible ∈ {TRUE, FALSE}
```

reset도 마찬가지다.

원래 Source Script에는 "slot id들을 current project에서 resolve한다"는 단계가 있다. 고정 2x2 모델에서 항상 유효한 SlotIds만 주면 이 실패 분기가 사라지므로, 전체 project 구조를 되돌려 넣는 대신 다음 입력 projection을 추가했다.

```text
idsResolved ∈ {TRUE, FALSE}
```

이렇게 하면 producer 쪽 내부 상태 조합 없이도 consumer가 실제로 구분하는 성공/실패 입력 범위를 모두 탐색할 수 있다.

### 3.3 외부 상태의 구체 값은 필요한 구분만 보존한다

layout의 merge/split은 slot-local payload의 모든 내부 필드를 이해할 필요가 없다.

layout이 필요한 정보는 주로 다음 두 가지다.

```text
1. 이 slot-local state가 default인가?
2. non-default payload를 source에서 anchor로 이동했을 때 같은 payload identity가 보존되는가?
```

따라서 layout unit에서는 실제:

```text
chart
imageId
contentType
imageSettings
caption
```

조합을 모두 들고 가지 않고 다음 세 값으로 축약했다.

```text
default
payload-a
payload-b
```

non-default를 하나의 boolean으로만 줄이지 않고 `payload-a`, `payload-b` 두 identity를 남긴 이유는 merge/split이 단순히 "non-default 여부"만 유지하는 것이 아니라 실제 source payload를 보존하는지도 검사하기 위해서다.

### 3.4 호출 경계와 구현 경계는 서로 다른 수준에서 검사한다

`applyGridLayoutAction`은 `application_fsm.py`에 있고, 실제 grid candidate 계산은 `layout_annotations_export.py`에 있다.

이를 하나의 전역 모델로 합치지 않고 다음처럼 나눴다.

```text
Application unit:
    grid command 호출
    → accepted / rejected 결과를 받음
    → application-level result 처리

Layout unit:
    rows / cols 입력
    → buildGridResizeCandidate
    → geometry / shrink safety 검사
    → commit / reject
```

따라서 같은 grid command가 두 unit에 나타나지만 같은 내부 상태를 중복해서 갖는 것은 아니다.

Application 쪽은 호출 계약을 검사하고, Layout 쪽은 실제 layout 전이를 검사한다.

---

## 4. 실제 검증 매핑

| Source Script 파일 | 역할 | 이번 TLC 처리 |
| --- | --- | --- |
| `project_state.py` | shared state/reference/default/invariant 계약 | 필요한 범위와 predicate를 각 dependent unit에 projection. 이 slice에서는 별도 state walk 없음 |
| `application_fsm.py` | reset/swap orchestration, grid command delegation | `FastFigureApplicationFsmUnit` |
| `layout_annotations_export.py` | grid resize, merge, split, geometry와 slot-local payload 이동 | `FastFigureLayoutUnit` |

현재 canonical slot-core model이 이 세 파일에서 가져온 부분만 다루므로, 다른 Source Script 파일은 이번 비교에 포함하지 않았다.

---

## 5. Application FSM 단위

파일:

- `.github/tlc/modules/FastFigureApplicationFsmUnit.tla`
- `.github/tlc/modules/FastFigureApplicationFsmUnit.cfg`

### 5.1 유지한 국소 상태

Application unit에서는 slot-local payload와 chart ownership 관계를 유지한다.

대표 payload domain은 다음과 같다.

```text
default
chart-1
chart-2
image
caption
settings
```

reset/swap은 slot-local property 전체를 하나의 단위로 다루므로 image, caption, settings 같은 서로 다른 non-chart payload class를 구분했다.

chart는 ownership invariant 때문에 `chart-1`, `chart-2`를 별도로 유지했다.

### 5.2 유지한 알고리즘

다음 의미를 직접 PlusCal procedure로 검사한다.

```text
applySlotsResetAction
applySlotsSwappedAction
applyGridLayoutAction
```

reset에서는:

```text
input resolve
→ ResetSlotsCandidate
→ chart ownership 반영
→ candidate validation
→ commit / reject
```

순서를 유지한다.

swap에서는:

```text
source/target visibility 입력
→ complete payload exchange
→ ownership validation
→ commit / reject
```

를 유지한다.

grid는 layout 내부 구현을 복제하지 않고:

```text
layoutAccepted ∈ {TRUE, FALSE}
```

를 adapter 결과로 사용한다.

### 5.3 외부 입력 projection

Application unit에서 layout/project 전체 대신 사용하는 입력은 다음과 같다.

```text
idsResolved
sourceVisible
targetVisible
layoutAccepted
```

이 값들은 각각 원래 Source Script의 branch를 결정하지만, 그 값을 만들어낸 외부 모듈 내부 상태는 application FSM의 다음 상태를 계산하는 데 필요하지 않다.

---

## 6. Layout 단위

파일:

- `.github/tlc/modules/FastFigureLayoutUnit.tla`
- `.github/tlc/modules/FastFigureLayoutUnit.cfg`

### 6.1 유지한 국소 상태

Layout unit에서는 다음을 실제 상태로 유지한다.

```text
gridRows
gridCols

slot.id
slot.row
slot.col
slot.rowSpan
slot.colSpan
slot.hidden
slot.payload
```

따라서 다음 layout 의미를 직접 검사할 수 있다.

- active grid 범위
- visible/hidden coverage
- merged span
- shrink boundary
- merge rectangle
- split restoration
- payload source/anchor 이동

### 6.2 slot-local payload projection

실제 chart/image/caption/settings 조합은 제거하고:

```text
PayloadValues = {
    default,
    payload-a,
    payload-b
}
```

만 사용한다.

이 projection으로도 다음을 구분할 수 있다.

```text
default 여부
non-default source 개수
source payload identity
covered slot reset
split 후 anchor payload 보존
```

layout 알고리즘이 실제로 필요로 하지 않는 chart ID, image ID, caption text, image setting 세부 값은 상태공간에서 제거된다.

### 6.3 유지한 알고리즘

다음 canonical 동작을 layout unit에서 직접 검사한다.

```text
buildGridResizeCandidate
setLayoutApiGrid
mergeSlots
splitSlots
```

검증 predicate도 geometry에 필요한 범위로 제한한다.

```text
SlotGeometryValid
LayoutCoverageValid
ValidateLayoutProjection
```

chart ownership의 구체 내부 상태는 Application/project-state 계약 쪽에서 검사하므로 layout unit에 다시 넣지 않는다.

---

## 7. Canonical slot-core operation coverage

현재 monolithic slot-core의 주요 operation을 다음과 같이 배치했다.

| Canonical operation | 모듈 검증 위치 |
| --- | --- |
| `applySlotsResetAction` | Application FSM unit |
| `applySlotsSwappedAction` | Application FSM unit |
| `applyGridLayoutAction` | Application FSM의 호출/result 경계 |
| `buildGridResizeCandidate` | Layout unit |
| `setLayoutApiGrid` | Layout unit |
| `mergeSlots` | Layout unit |
| `splitSlots` | Layout unit |
| slot default/reference/ownership 관련 순수 규칙 | `project_state.py` 계약을 필요한 unit에 projection |

이번 비교에서 중요한 점은 "파일마다 무조건 하나의 TLC model을 만든다"가 아니다.

`project_state.py`처럼 현재 slice에서 pure contract/operator만 제공하는 파일에 인위적인 상태전이계를 만들지 않았다.

---

## 8. 실행 조건

단일 모델과 모듈 모델 모두 다음 TLC 조건을 사용했다.

```text
TLC 2.19
TLA+ tools v1.7.4
breadth-first exhaustive model checking
4 workers
2x2 grid bound
```

기준선은 기존 canonical verification model을 2x2 execution profile로 실행한 결과다.

기준선:

- workflow: `TLA Slot Core`
- run: `36895823728`
- job: `110482441021`
- generated states: 14,129,174
- distinct states: 8,114,209
- queue at completion: 0
- complete graph depth: 28
- TLC elapsed: 510 s

모듈 최종 main 실행:

- workflow: `TLA Slot Core Modular Experiment`
- run: `36967409524`
- commit: `be28c411a120268da68bc57d973440bff5a994bf`
- 두 job 모두 `Model checking completed. No error has been found.`

---

## 9. 실행 과정에서 확인한 경계 문제

### 9.1 GitHub Actions expression 문제

첫 test commit에서는 workflow YAML을 생성하는 과정에서 GitHub expression 앞에 역슬래시가 들어가 파일 경로가 잘못되었다.

이 문제는 PlusCal 모델 의미와 무관한 workflow 생성 오류였다.

수정 후 실제 PlusCal translation 단계까지 진행했다.

### 9.2 PlusCal parameter와 harness variable 이름 충돌

Application unit의 procedure parameter:

```text
sourceVisible
targetVisible
layoutAccepted
```

와 harness의 `with` variable이 translation 후 동일 symbol로 충돌했다.

harness 변수만:

```text
chosenSourceVisible
chosenTargetVisible
chosenLayoutAccepted
```

로 변경했다.

이 역시 verification counterexample이 아니라 generated TLA+의 symbol scope 충돌이었다.

### 9.3 reset resolve 실패 분기 복원

첫 성공 모델에서는 `chosenResetSlotIds`를 항상 `SUBSET SlotIds`에서 골랐기 때문에, Source Script의:

```text
slot id들을 current project에서 resolve
→ 실패 가능
```

분기가 실질적으로 사라져 있었다.

이를 발견한 뒤 전체 project/layout 상태를 Application unit에 다시 넣지 않고:

```text
idsResolved ∈ {TRUE, FALSE}
```

입력을 추가했다.

이 수정은 이번 분해 방법의 핵심을 잘 보여준다.

외부 상태가 branch에 영향을 준다고 해서 그 상태 전체를 가져올 필요는 없다. 소비자가 실제로 관찰하는 결과 범위를 입력으로 주면 원래 branch를 보존할 수 있다.

최종 benchmark는 이 분기를 복원한 모델을 사용한다.

---

## 10. 최종 결과

### 10.1 main 최종 실행

| 검증 방식 | Generated states | Distinct states | Queue | TLC time |
| --- | ---: | ---: | ---: | ---: |
| 기존 단일 2x2 모델 | 14,129,174 | 8,114,209 | 0 | 510 s |
| Application FSM unit | 1,794,598 | 1,008,357 | 0 | 8 s |
| Layout unit | 100,797 | 60,285 | 0 | 5 s |
| **모듈 합계** | **1,895,395** | **1,068,642** | **0** | **13 s** |

모듈 합계와 단일 모델을 비교하면:

```text
Generated:
14,129,174 → 1,895,395
86.59% 감소
약 7.45배 작은 탐색

Distinct:
8,114,209 → 1,068,642
86.83% 감소
약 7.59배 작은 탐색

TLC reported time:
510 s → 13 s
97.45% 감소
약 39.23배 단축
```

### 10.2 테스트 브랜치 실행

최종 경계와 동일한 모델의 test branch run `36967192135`에서는:

```text
Application FSM: 8 s
Layout:          4 s
합계:           12 s
```

였다.

상태 수는 main과 완전히 동일했다.

```text
Generated = 1,895,395
Distinct  = 1,068,642
```

따라서 12 s와 13 s 차이는 모델 차이가 아니라 실행 시간 편차로 본다.

보수적인 문서 비교값은 main의 13 s를 사용한다.

---

## 11. 왜 상태 수가 줄었는가

기존 모델에서는 개념적으로 여러 국소 상태가 하나의 전역 상태에 함께 들어간다.

단순화하면:

```text
GlobalState
≈ ApplicationState
× LayoutState
× SlotPayloadState
× ReferenceState
× PlusCalControlState
```

각 요소가 완전히 독립적이지 않더라도, 서로 직접 필요하지 않은 조합이 전역 상태 fingerprint의 일부가 되면 가능한 조합 수가 빠르게 커진다.

모듈 모델에서는:

```text
Application walk
≈ ApplicationLocalState
  + required interface inputs

Layout walk
≈ LayoutLocalState
  + required payload projection
```

으로 검사한다.

비교 대상은 따라서:

```text
전역 상태 product 하나의 exhaustive walk
```

대:

```text
interface-complete local state graph들의 exhaustive walk 합
```

이다.

이번 감소는 TLC 옵션이나 검색 알고리즘 변경으로 얻은 것이 아니다.

**서로 다른 파일 책임의 내부 상태를 같은 state tuple에서 제거한 것**이 핵심 차이다.

---

## 12. 결과 해석

이번 결과는 현재 Source Script 파일 구조가 단순한 코드 정리 이상의 역할을 할 수 있음을 보여준다.

특히 다음 개발 원칙이 검증 분해에도 직접 도움이 된다.

```text
- 책임별 Source Script 파일 분리
- import 관계 명시
- authoritative state owner 명시
- candidate → validate → commit 경계
- renderer/UI projection을 authority와 분리
- 다른 subsystem 내부 상태 대신 공식 read/API 경계 사용
```

이 원칙을 지키면 다른 모듈의 내부 상태를 현재 모듈의 state variable로 복제하지 않고, 필요한 입력/출력 계약만 남길 수 있다.

따라서 앞으로 전체 PlusCal pseudocode를 작성할 때도 Source Script의 파일/import 구조를 1차 경계로 유지하면, 검증 단계에서 별도의 임의 partition 없이 검사 단위를 구성하기 쉬워진다.

---

## 13. 현재 방식의 한계

이번 실험으로 확인한 것은 **분해했을 때 실제 TLC 비용이 크게 감소한다는 것**과 **현재 slot-core slice에서 이 경계로 각 unit이 exhaustive success를 얻는다는 것**이다.

아직 자동으로 증명하지 않은 항목도 있다.

첫째, Source Script 파일 하나의 모든 외부 read가 자동으로 interface input으로 포착됐음을 검사하는 범용 analyzer는 없다. 이번 매핑은 Source Script와 canonical verification model을 직접 비교해 수동으로 구성했다.

둘째, 두 unit의 성공만으로 arbitrary future module decomposition이 항상 sound하다는 일반 정리를 증명한 것은 아니다. 새로운 cross-module invariant가 생기면 그 invariant를 어느 unit 또는 별도 interface contract에서 검사할지 지정해야 한다.

셋째, 현재 modular files는 `.github/tlc/modules/`의 실행 실험이며 canonical `verification/` model을 교체하지 않는다.

따라서 이번 결과의 정확한 의미는 다음과 같다.

> 현재 slot-core slice에서는 Source Script 파일/import 경계를 사용해 필요한 interface projection만 남긴 두 개의 독립 TLC state walk로 분해할 수 있었고, 두 unit 모두 exhaustive model checking을 통과했으며, 단일 2x2 model과 비교해 distinct state 수가 약 7.59배 줄고 TLC reported time 합계가 약 39배 줄었다.

---

## 14. 저장소 위치

실행 모델:

```text
.github/tlc/modules/FastFigureApplicationFsmUnit.tla
.github/tlc/modules/FastFigureApplicationFsmUnit.cfg
.github/tlc/modules/FastFigureLayoutUnit.tla
.github/tlc/modules/FastFigureLayoutUnit.cfg
```

workflow:

```text
.github/workflows/tla-slot-core-modular.yml
```

기준 canonical model:

```text
verification/FastFigureSlotCore.tla
verification/FastFigureSlotCore.cfg
.github/tlc/FastFigureSlotCore2x2.tla
.github/tlc/FastFigureSlotCore2x2.cfg
```

관련 실행 기록:

```text
baseline:
  run 36895823728
  job 110482441021

modular test:
  run 36967192135

modular main:
  run 36967409524
```

이번 문서와 실행 실험은 Source Script나 canonical verification model의 revision/fingerprint를 변경하지 않는다.
