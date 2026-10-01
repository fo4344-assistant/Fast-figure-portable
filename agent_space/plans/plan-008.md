# 계획 008 — Source Script 의미 정규화와 단계별 재생성

## 0. 상태와 이전 계획

이 문서는 `plan-007.md`를 대체하는 실행 계획이다.

`plan-007`은 **실행안으로 채택하지 않는다.**

비채택 이유는 `review-014-plan-007-validity.md`에 기록하며, 핵심은 다음과 같다.

- grid resize에 별도 reflow 의미를 암묵적으로 넣음
- malformed shared-chart input을 clone으로 자동 보정함
- caption storage representation을 semantic ownership으로 바로 해석함
- label position에 필요하지 않은 draft state를 추가함
- README의 persistent export-settings 요구를 구현 현황에 맞춰 제거하려 함
- protected default CSV라는 특수 상태를 invariant로 유지함
- mutate 후 rollback을 일반 mutation pattern으로 삼음

plan-007의 문제 목록과 큰 단계 순서는 유지하되 위 해결안은 사용하지 않는다.

---

## 1. 권위와 적용 순서

권위 순서:

```text
사용자 명시 요구
        ↓
agent_space/policies/source-script-policy.md
        ↓
프로젝트의 명시 계약/목적 문서
        ↓
Source Script
        ↓
pseudocode
        ↓
source code
```

현재 `README.md`는 Fast Figure의 프로젝트 목적과 공개 file-format 계약을 확인하는 프로젝트 문서로 사용한다.

현재 source code는 stale lower layer이므로:

- 기존 동작을 조사하는 근거
- 누락/모순/특수 사례를 발견하는 검증 자료

로는 사용하지만, Source Script의 의미를 자동으로 결정하는 권위 원천으로 사용하지 않는다.

---

## 2. 작업 원칙

### 2.1 먼저 invariant를 결정하고 함수를 채운다

Source Script 보완은 current function 목록을 Python notation으로 옮기는 방식으로 하지 않는다.

먼저 다음을 결정한다.

- 어떤 object가 authoritative인가
- 어떤 reference topology가 valid한가
- empty state가 무엇인가
- mutation 전후에 반드시 유지되는 invariant가 무엇인가
- file roundtrip에서 무엇을 보존해야 하는가

그 뒤 필요한 함수와 처리 순서를 정의한다.

### 2.2 의미 변경과 구현 정리를 구분한다

각 발견은 다음 세 종류 중 하나로 기록한다.

1. **확정 가능한 규칙**
   - 기존 프로젝트 계약과 정책으로 결과가 한 방향으로 정해짐
2. **미확정 의미**
   - 현재 근거로 둘 이상의 의미가 가능함
   - Source Script에서 미정으로 남기고 임의로 구현하지 않음
3. **하위 구현 정리**
   - 의미는 동일하지만 source code가 중복/특수 경로를 가짐
   - Source Script 의미 확정 뒤 pseudocode/source code에서 통합

### 2.3 mutation은 candidate-first를 기본으로 한다

기본 구조:

```text
authoritative input resolve
→ permission / precondition 확인
→ candidate next state 계산
→ reference + invariant validation
→ authoritative commit
→ runtime/projection update
```

rollback은 staging이 현실적으로 불가능한 경우에만 제한적으로 사용한다.

---

## 3. Phase 0 — version gate 보완

Source Script 자체를 수정하기 전에 개발 단계 gate가 정책의 “닫힘 후 다음 단계”를 강제하도록 정리한다.

### 3.1 Source Script closure metadata

`development-versions.json`의 source-script layer에 다음 의미를 추가한다.

```text
closure = open | closed
```

현재 r1:

```text
status = current
closure = open
```

규칙:

- Source Script content freshness와 closure 판정을 구분한다.
- pseudocode가 current가 되려면 Source Script가 current + closed여야 한다.
- closed 전환에는 closure review가 있어야 한다.

### 3.2 pseudocode validation gate

pseudocode layer에 다음 의미를 둔다.

```text
validation = pending | passed
```

source code가 current가 되려면:

- Source Script current + closed
- pseudocode current + passed
- 정확한 derived_from fingerprint

를 모두 만족해야 한다.

이 변경은 development lineage metadata의 강화이며 Source Script 의미 revision 자체를 올리지 않는다.

---

## 4. Phase 1 — project invariant 정규화

### 4.1 빈 graph를 직접 표현

새 기본 규칙:

- editable chart의 `editor.objects=[]`는 valid하다.
- 빈 graph를 표현하기 위해 fake CSV나 fake graph object를 만들지 않는다.
- CSV asset은 실제 data asset일 때만 존재한다.
- graph object는 실제 CSV를 참조할 때만 존재한다.

이에 따라 Source Script에서 제거 대상으로 지정:

- protected default CSV
- `isDefaultEmpty`
- default CSV delete/move/replace 예외
- object 0개 시 fake object 복구
- FFPX default CSV reuse/remap
- FFSX temporary id-0 default CSV

blank graph / blank FFSX는 zero-object chart로 표현한다.

선택 이유:

같은 기능 자유도를 유지하면서 특수 asset, 보호 규칙, remap, collision exception을 동시에 제거한다.

### 4.2 chart ownership

valid topology:

```text
slot ──0..1──> chart
chart ──exactly 1──> owning slot
```

규칙:

- slot은 chart와 image를 동시에 참조하지 않는다.
- 존재하는 chart는 정확히 하나의 slot이 참조한다.
- orphan chart 금지.
- shared chart 금지.
- current-format import에서 shared/orphan chart는 자동 clone/drop하지 않고 invalid input으로 거부한다.
- FFSX import는 target slot에 독립 새 chart를 만든다.

이 규칙은 현재 FFPX의 slot-local chart document 구조와 일치한다.

향후 shared chart 요구가 생기면 file format과 UI를 함께 확장한다.

### 4.3 slot payload와 caption

현재 stored placeholder 때문에 caption 의미가 왜곡되지 않도록 먼저 상태 표현을 정리한다.

기본 규칙:

- graph/image reference와 contentType은 renderable slot content다.
- slot caption은 slot annotation이다.
- unset caption은 null/empty로 표현한다.
- `"슬롯 캡션"` 같은 안내 문자열은 UI placeholder이며 authoritative project state에 자동 기록하지 않는다.

operation별 caption 이동은 다음 단계에서 별도 matrix로 결정한다.

검토 대상:

| operation | renderable content | caption |
| --- | --- | --- |
| swap | 이동 | 미확정 |
| merge source→anchor | 이동 | 미확정 |
| split | anchor 유지 | 미확정 |
| reset | 제거 | 미확정 |
| FFSX export/import | 이동 | 현재 계약상 포함 |

결정 기준:

- README/기존 명시 요구
- slot-caption UX
- FFSX slot package 의미
- scientific panel editing의 예측 가능성

근거가 하나로 수렴하지 않으면 caption 이동 규칙은 closure blocker로 명시하고 임의 확정하지 않는다.

### 4.4 grid resize

grid resize 자체에는 content reflow 기능을 넣지 않는다.

확정 규칙:

- 확대: 기존 slot geometry/content를 유지하고 빈 cell만 추가한다.
- 축소: 제거되는 grid 영역과 교차하는 다음 항목이 있으면 거부한다.
  - non-empty renderable content
  - 명시적 non-empty caption
  - 축소 경계를 넘는 merged span
- 허용 가능한 축소는 잘려나가는 empty 1×1 cell만 제거한다.
- 실패 시 project state는 변경하지 않는다.

자동 packing/reflow는 채택하지 않는다.

필요 시 별도 explicit reflow command로 나중에 확장한다.

### 4.5 export settings

README 계약에 따라 project persistent state에 export settings를 포함한다.

Source Script에서 최소 의미를 정의한다.

- target width
- height mode(auto / explicit)와 explicit height
- DPI
- raster format

다음은 persistent setting이 아니다.

- progress/status callback
- current DOM bounds
- one-shot rendering temporary geometry
- generated blob

print/export overlay의 form draft가 apply 없이도 persistent 값을 바꿀지, export 실행 시 마지막 사용값을 commit할지는 UI interaction 의미로 별도 결정한다.

FFPX는 persistent export settings를 roundtrip해야 한다.

format version 호환 방식은 Source Script의 file-format 절에서 별도 검토한다.

### 4.6 label position

label drag는 별도 draft SoT를 만들지 않는다.

규칙:

- authoritative label position은 하나다.
- pointer move가 유효한 사용자의 edit이면 같은 mutation path로 연속 갱신한다.
- renderer는 변경된 authoritative position을 다시 읽는다.
- interaction 종료 event가 필요하면 position 저장이 아니라 telemetry/focus/history 같은 별도 책임만 가진다.

`previewPosition + commitPosition`이라는 현재 이름/구조는 Source Script에서 일반 규칙으로 승격하지 않는다.

---

## 5. Phase 2 — project/file semantics 완결

### 5.1 project initialization

정의:

- project meta
- grid/layout default
- slot creation
- label/caption default
- export-settings default
- palette
- VFS fixed directories
- next-id
- initial empty chart/image policy

default CSV는 만들지 않는다.

### 5.2 whole-project validation

validation은 최소한 다음을 확인한다.

- schema shape
- grid/slot geometry
- slot overlap/hidden/merge consistency
- chart ownership 1:1
- no orphan chart
- CSV/image/chart id uniqueness
- graph object → CSV reference
- slot → image/chart reference
- VFS path uniqueness
- next-id monotonicity
- export-settings range/type
- annotation state
- appearance palette

validation만으로 관계를 “생성”하지 않고 각 reference의 실제 source를 resolve할 수 있어야 한다.

### 5.3 import normalization

FFPX/legacy payload → candidate ProjectObject:

1. parse
2. primitive/type validation
3. asset/path normalization
4. chart/object normalization
5. slot geometry/reference resolve
6. export/annotation/appearance normalization
7. next-id derivation
8. whole-project validation
9. authoritative replace

malformed topology를 임의 clone/drop하여 정상화하지 않는다.

호환 변환이 실제 요구되면 별도 converter 책임으로 분리한다.

### 5.4 VFS

하나의 canonical path semantics를 다음에서 공유한다.

- import collision
- move
- trash
- export filtering
- asset lookup
- directory creation

정의 대상:

- normalize
- resolve
- exists
- parent/descendant
- unique path
- fixed root
- trash subtree
- asset directory/name → canonical path

### 5.5 CSV/TSV/JSON parser

parser는 순수 계산으로 정의한다.

현재 동작을 요구 근거와 대조한 뒤 다음을 명세한다.

- delimiter
- quote
- escaped quote
- multiline field
- blank row
- JSON accepted shape
- text encoding
- row projection

file bytes와 parsed rows는 서로 역할을 구분한다.

### 5.6 asset import transaction

```text
read file
→ parse/build candidate asset
→ collision plan
→ candidate collection/reference update
→ validate
→ commit
```

replace/import-to-slot/import-to-project가 같은 transaction primitive를 재사용하게 한다.

---

## 6. Phase 3 — graph/Plotly/file-format

### 6.1 graph schema

정의:

- graph object
- global settings
- four-axis settings
- editor editable state
- renderer projection
- imported Plotly extension

zero-object editable chart를 모든 read/editor/render path가 처리할 수 있어야 한다.

### 6.2 Plotly conversion

명시:

- trace x/y → project data conversion
- axis mapping
- trace type/style mapping
- imported extension 보존
- layout → Fast Figure settings
- non-editable imported representation
- editable conversion 시 project CSV 생성
- zero-trace Plotly 처리

### 6.3 FFPX

명세:

- ZIP constraints
- path constraints
- typed XML grammar
- document responsibilities
- project export settings
- slot/chart ownership 1:1
- asset byte preservation
- trash exclusion

writer와 reader가 같은 semantic document model을 사용해야 한다.

### 6.4 FFSX

blank FFSX는 CSV 없는 zero-object chart를 허용한다.

apply transaction:

1. read/validate package
2. package-local CSV → candidate project CSV mapping
3. new chart id allocation
4. target slot candidate payload
5. candidate validation
6. single commit

default CSV id-0 remap은 제거한다.

---

## 7. Phase 4 — layout/annotation/export semantics

### 7.1 merge/split/swap/reset

먼저 공통 slot mutation primitive를 정의한다.

- layout geometry
- renderable content
- caption annotation
- selected runtime state

를 별도 field로 다루고 각 operation이 무엇을 이동/삭제하는지 matrix로 명시한다.

implicit data loss는 허용하지 않는다.

caption rule이 미확정이면 이 phase를 닫지 않는다.

### 7.2 export geometry

DOM 현재 크기를 authoritative figure geometry로 사용하지 않는다.

분리:

- project logical geometry
- target export geometry
- chart render scale
- image transform
- label transform
- caption layout
- raster limits
- file metadata

persistent export settings는 target geometry의 input이고, 계산된 geometry 자체는 persistent state가 아니다.

---

## 8. Phase 5 — mutation/FSM/API 단순화

### 8.1 공통 mutation 구조

candidate-first pattern을 사용한다.

각 mutation은 다음을 명시한다.

- authoritative inputs
- permission/scope
- preconditions
- candidate outputs
- validation
- commit target
- runtime/projection side effects
- external side effect 실패 의미

### 8.2 asset reference cascade

하나의 pure reference collector:

```text
asset ids
→ affected graph objects
→ affected image slots
```

그리고 하나의 mutation path:

```text
reference set
→ candidate detach/reset
→ asset removal/move-to-trash
→ validate
→ commit
```

referenceCount는 실제 제거되는 reference 개수로 통일한다.

- CSV: graph object 수
- image: slot 수

### 8.3 `editing`

독립 runtime state가 실제로 필요한 근거를 찾는다.

필요하지 않으면:

```text
selectedSlotId
→ slot.chart
→ chart resolve
```

로 대체한다.

필요하면 cache로 정의하고 authoritative mutation input이 되지 않도록 제한한다.

### 8.4 `layoutMapWidth`

producer/consumer가 없으면 persistent schema에서 제거한다.

필요성이 확인되면 실제 의미와 producer/consumer를 Source Script에 먼저 추가한다.

### 8.5 public API

FastFigureApi는 UI component 구조가 아니라 domain/public command 기준으로 정의한다.

각 method:

- read / calculation / mutation
- args/return
- mutation target
- lifecycle
- failure atomicity
- UI confirmation 책임 여부

를 명시한다.

---

## 9. Phase 6 — Source Script closure

새 review에서 다음 세 기준을 각각 증거와 함께 판정한다.

### 9.1 논리적 완결성

- input → output/commit 경로
- 실패/거부 경로
- reference topology
- empty states
- file roundtrip
- layout operation matrix

### 9.2 프로젝트 목적 부합

README와 사용자 요구를 대조한다.

- local/offline
- copied asset independence
- scientific figure composition
- complete persistent project state
- graph/image/layout/label/caption
- FFPX/FFSX/Plotly interoperability

### 9.3 중복과 통합

최소한 다음 후보를 다시 확인한다.

- default CSV 제거 완료
- duplicate mutation cascade
- `editing`
- `layoutMapWidth`
- ProjectObject/Registry/API alias
- preview/draft state
- renderer projection 재유입

모든 blocker가 해결되었을 때만 source-script closure를 `closed`로 전환한다.

---

## 10. Phase 7 — pseudocode와 source code

### pseudocode

Source Script가 current + closed일 때만 시작한다.

pseudocode는 의미를 추가하지 않고:

- 실행 순서
- branch
- candidate 생성
- reference resolve
- failure
- commit

을 언어 중립적으로 정규화한다.

검증 통과 후 `validation=passed`.

### source code

pseudocode가 current + passed일 때만 시작한다.

source code 단계에서:

- 실제 JavaScript/React/Plotly 구현 선택
- 필요한 API naming
- data structure concrete representation
- browser side effect

을 결정하되 상위 의미는 바꾸지 않는다.

---

## 11. plan-007 비채택 기록

다음 plan-007 해결안은 명시적으로 사용하지 않는다.

| plan-007 안 | 판정 | 이유 |
| --- | --- | --- |
| grid shrink row-major packing | 비채택 | layout 변경에 암묵적 reflow 의미를 추가함 |
| shared chart import clone | 비채택 | malformed topology를 조용히 다른 identity로 변경함 |
| persisted default caption을 content occupancy로 사용 | 비채택 | slot-caption mode에서 placeholder가 실제 state로 퍼져 의미를 왜곡함 |
| label UI-local preview draft | 비채택 | 별도 state 없이 continuous edit로 같은 자유도를 얻을 수 있음 |
| export settings 비영속 + README 수정 | 비채택 | 명시된 project/FFPX 계약을 구현 현황에 맞춰 제거함 |
| protected default CSV 유지 | 비채택 | 빈 graph를 직접 표현하면 다수 특수 예외가 사라짐 |
| mutate → validate → rollback 일반화 | 비채택 | candidate-first commit이 rollback 복잡도를 줄임 |

유지한 항목은 `review-014`의 4절과 이 계획의 Phase 2~6에 재구성했다.
