# Review 014 — plan-007 타당성 재검토

기준 commit: `4cd34f7abfe7b3cc879529229c80d2bb21626497`

## 1. 검토 목적

`plan-007.md`의 실행안이 다음 기준에서 실제로 최선인지 다시 검토한다.

- Source Script 정책과 충돌하지 않는가
- Fast Figure의 기존 명시 요구를 구현 현황보다 우선하는가
- 사용자 데이터와 figure layout을 암묵적으로 바꾸지 않는가
- 같은 기능 자유도를 더 낮은 구조적 복잡도로 얻을 수 있는가
- 불필요한 특수 상태, rollback, compatibility 예외를 유지하지 않는가
- 현재 file-format과 runtime reference semantics가 서로 일치하는가

검토 원천:

1. `agent_space/policies/source-script-policy.md`
2. `README.md`의 프로젝트 목적과 FFPX/FFSX 계약
3. 현재 `sourcescript/`
4. 하위 검증 자료로서 현재 `fast-figure.js`, `fast-figure-ui.js`
5. `review-013-sourcescript-closure.md`

현재 source code는 version chain상 stale이므로 설계 권위로 사용하지 않고, 기존 동작과 모순·특수 사례를 발견하는 검증 자료로만 사용한다.

---

## 2. 전체 판정

`plan-007`의 다음 큰 방향은 타당하다.

- Source Script를 먼저 닫는다.
- pseudocode와 source code를 먼저 수정하지 않는다.
- project/file/graph/export/FSM/API 의미를 Source Script에 보완한다.
- 중복 상태와 병렬 mutation 경로를 통합한다.
- 최종 closure review를 별도로 수행한다.
- 모든 Source Script 변경에 diff + 변경 이유 + version lineage를 남긴다.

그러나 일부 세부 해결안은 더 나은 대안이 확인되었다.

따라서 **plan-007 전체를 실행안으로 채택하지 않고 plan-008로 대체한다.**

---

## 3. plan-007에서 채택하지 않는 안

### 3.1 grid 축소 시 row-major 자동 packing

plan-007 안:

- 기존 좌표를 보존할 수 없지만 capacity가 충분하면 content-bearing slot을 row-major로 새 1×1 slot에 packing한다.

재검토 결과: **채택하지 않음.**

이유:

1. grid 크기 변경은 layout 명령인데 자동 packing은 별도의 content reflow 의미를 암묵적으로 추가한다.
2. 사용자가 의도한 panel 위치 관계와 merged geometry를 요청 없이 바꾼다.
3. capacity만 같으면 안전하다는 보장이 없다. scientific figure에서는 위치 자체가 의미다.
4. shrink와 reflow를 분리하면 구조가 더 단순하고 사용자의 데이터/배치를 보존한다.

대체안:

- grid 확대는 빈 cell을 추가한다.
- grid 축소는 제거되는 영역과 교차하는 **명시적 slot payload 또는 merged span**이 없을 때만 허용한다.
- content 또는 merged span이 잘리면 원본 state를 유지하고 축소를 거부한다.
- 향후 자동 reflow가 필요하면 별도의 명시적 command로 설계한다.

### 3.2 shared chart를 clone하여 exclusive chart로 normalization

plan-007 안:

- chart를 slot 독점 object로 만들고, import에서 shared chart가 발견되면 두 번째 이후 slot용 chart를 clone한다.

재검토 결과: **exclusive ownership 방향은 유지하되 clone normalization은 채택하지 않음.**

확인 결과:

- runtime의 `detachSlotChart`와 일부 import code는 shared reference를 방어적으로 처리한다.
- 하지만 현재 FFPX writer는 각 slot 문서에 chart state를 다시 기록하고 reader는 각 slot에서 chart를 다시 charts 목록에 추가한다.
- 같은 chart id를 여러 slot이 공유하면 roundtrip에서 duplicate chart id가 생기며 `buildProjectObject`가 이를 거부한다.
- 일반 UI에는 shared chart를 생성하는 기능이 없다.

따라서 현재 file-format 계약과 실제 기능 자유도는 shared chart를 안정적으로 지원하지 않는다.

대체안:

- valid project에서 chart ↔ slot은 1:1 ownership으로 정의한다.
- orphan chart와 shared chart를 모두 invalid로 판정한다.
- current-format import에서 shared chart를 조용히 clone하지 않고 malformed/unsupported reference topology로 거부한다.
- clone normalization은 의미가 다른 malformed input을 자동 보정하고 chart identity를 바꾸므로 사용하지 않는다.
- 향후 shared chart가 실제 요구가 되면 먼저 FFPX central chart reference 구조와 UI semantics를 Source Script에서 확장한다.

### 3.3 caption을 현재 `slot.content` 그대로 atomic content로 취급

plan-007 안:

- caption만 존재하는 slot도 content-bearing으로 보고 graph/image와 함께 이동한다.

재검토 결과: **현재 형태 그대로는 채택하지 않음.**

확인 결과:

- slot-caption mode를 켜면 `initializeSlotCaptions`가 visible slot마다 실제 persistent string `"슬롯 캡션"`을 기록한다.
- 따라서 caption만 있어도 occupied로 보면 slot-caption mode에서 거의 모든 slot이 occupied가 된다.
- README는 graph/image contents와 labels/captions를 별도 figure 요소로 기술한다.
- FFSX는 “slot package”이므로 graph와 slot caption을 함께 전송하지만, 이것만으로 caption이 graph/image content 자체라고 단정할 수 없다.
- 현재 swap은 caption을 함께 이동하고 merge는 이동하지 않아 기존 코드도 의미가 일치하지 않는다.

대체안:

1. **저장된 placeholder와 명시적 caption을 먼저 분리한다.**
   - unset caption은 null/empty authoritative state로 둔다.
   - `"슬롯 캡션"`은 UI placeholder projection으로만 표시하고 저장하지 않는 방향을 우선한다.
2. slot의 renderable content(graph/image)와 slot annotation(caption)을 Source Script에서 의미적으로 구분한다.
3. swap/merge/split 때 caption이 이동하는지 여부는 별도 operation matrix로 결정한다.
4. 현재 요구만으로 content-bound / position-bound 중 하나가 유일하게 결정되지 않으면 Source Script의 미확정 설계 항목으로 남기고 임의 확정하지 않는다.

즉 plan-007처럼 data structure의 현재 grouping을 곧바로 semantic ownership으로 승격하지 않는다.

### 3.4 label drag를 UI-local draft → commit 구조로 변경

plan-007 안:

- pointer move는 draft만 바꾸고 pointer up에서 authoritative state를 한 번 변경한다.

재검토 결과: **채택하지 않음.**

이유:

1. 현재 UX에는 drag cancel 또는 Apply/Cancel transaction 요구가 없다.
2. pointer drag 자체가 사용자의 연속적인 position edit이므로 authoritative update가 논리적으로 허용된다.
3. UI-local draft를 추가하면 label position의 두 표현을 동시에 유지해야 한다.
4. Source of Truth 정책은 continuous mutation을 금지하지 않는다. 계산과 state change를 구분하라는 것이지 사용자의 연속 입력을 반드시 draft로 만들라는 뜻은 아니다.

대체안:

- label position은 drag 중에도 하나의 authoritative state만 사용한다.
- `previewPosition`이라는 이름 때문에 의미가 흐려진 부분을 제거한다.
- Source Script에서는 `setLabelPosition`을 연속 mutation으로 정의한다.
- pointer interaction 종료가 별도 의미가 필요한 경우 `finishLabelPositionInteraction`은 telemetry/interaction completion만 담당하고 position의 두 번째 저장소를 만들지 않는다.

### 3.5 export settings를 operation-local input으로 재정의하고 README 수정

plan-007 안:

- width/height/DPI/format을 project state에 저장하지 않고 README의 persistent-state 설명을 수정한다.

재검토 결과: **채택하지 않음.**

이유:

README는 현재 project가 다음을 포함한다고 명시한다.

- complete persistent state of one figure
- export settings
- FFPX project.xml에도 export settings가 포함된다는 계약

현재 code가 이를 구현하지 않는 것은 요구를 없앨 근거가 아니라 구현 누락으로 보는 편이 정책상 맞다.

대체안:

- export settings를 persistent project state로 복원한다.
- 정확한 schema는 Source Script에서 정의한다.
- 최소 범위는 현재 export form의 사용자 의미인 target width, optional/auto height, DPI, format을 포함한다.
- transient `onStatus`, current DOM bounds, one-shot capture geometry는 persistent state에 넣지 않는다.
- FFPX에서 export settings를 저장/복원한다.
- format version 처리 방식은 기존 v3 파일 호환 요구를 검토한 뒤 결정하며, 구현 편의를 위해 README 요구를 제거하지 않는다.

### 3.6 protected default CSV를 graph invariant로 유지

plan-007 안:

- project initialization에서 protected default CSV의 생성 시점과 invariant를 더 명확히 한다.

재검토 결과: **채택하지 않음.**

확인 결과:

기본 빈 CSV 때문에 현재 다음 특수 처리가 퍼져 있다.

- startup에서 강제 생성
- editable chart의 object 0개를 금지
- graph object 삭제 시 fake object 복구
- delete/move/trash 금지
- collision에서 replacement 금지
- FFPX import default CSV reuse/remap
- FFSX id 0 temporary default/remap
- non-editable chart activation fallback

이 구조는 “빈 graph”를 직접 표현하지 못해 생긴 보조 상태다.

대체안:

- editable chart의 `editor.objects=[]`를 유효한 빈 graph 상태로 허용한다.
- CSV는 실제로 사용자가 가져왔거나 실제 graph object가 참조하는 data asset만 존재한다.
- graph object를 모두 삭제하면 빈 array를 유지한다.
- blank FFSX는 CSV 없이 빈 editable chart를 표현한다.
- protected default CSV와 `isDefaultEmpty`, reuse/remap/protection 예외를 제거 대상으로 둔다.
- source code 단계에서 빈 object list를 안전하게 처리하지 못하는 editor/renderer를 보완한다.

이는 기능을 줄이지 않고 특수 asset과 예외 경로를 제거하므로 최소 구현 원칙에 더 부합한다.

### 3.7 mutation의 일반 패턴을 mutate → validate → rollback으로 고정

plan-007 안:

```text
resolve
→ assert
→ capture rollback
→ mutate
→ validate
→ failure: restore
```

재검토 결과: **일반 기본 패턴으로는 채택하지 않음.**

이유:

- 대부분의 in-memory project mutation은 변경 후보를 authority 밖에서 먼저 계산할 수 있다.
- mutate 후 rollback은 이전 object identity와 여러 collection/runtime pointer를 함께 복원해야 하므로 복잡도가 커진다.
- rollback 누락 자체가 새로운 오류 원천이다.

대체 기본 패턴:

```text
resolve authoritative input
→ assert permission
→ compute candidate changes outside authority
→ validate candidate and references
→ commit authoritative state once
→ update runtime selection/projection
```

외부 side effect나 대용량 객체 때문에 candidate staging이 비현실적인 경우에만 좁은 rollback transaction을 사용한다.

---

## 4. plan-007에서 유지하는 안

다음 항목은 재검토 후에도 타당하다.

- Source Script가 닫히기 전 pseudocode/source code 수정 금지
- project initialization 명세 보완
- ProjectObject import normalization
- VFS canonical path/resolve/unique/trash semantics
- CSV/TSV/JSON parser와 load transaction 명세
- graph global/axis schema
- Plotly import/editable conversion
- FFPX typed-value grammar
- FFSX apply transaction
- logical/export geometry 분리
- FSM mutation contract 명세
- FastFigureApi method-level contract
- `editing` 필요성 재검토
- asset-reference cascade 통합
- `layoutMapWidth` producer/consumer 검토
- ProjectObject/Registry/API 접근 계층 책임 검토
- 최종 closure review

다만 위 항목을 작성할 때도 current source의 구현 구조를 그대로 Source Script 규칙으로 승격하지 않는다.

---

## 5. 추가로 발견한 계획상의 누락

### 5.1 closure 상태가 version metadata에서 강제되지 않음

현재 `development-versions.json`은 Source Script가 `current`인지는 기록하지만 구조적으로 `closed`인지 기록하지 않는다.

checker도 current Source Script fingerprint만 확인하므로, 잘못 구성하면 닫히지 않은 Source Script에서 pseudocode를 current로 만들 수 있다.

개선안:

- source-script layer에 `closure: "open" | "closed"`를 추가한다.
- 현재 r1은 `open`.
- pseudocode를 `current`로 전환하려면 source-script closure가 `closed`여야 한다.
- closure를 closed로 바꾸는 commit에는 대응 closure review 문서를 요구한다.

### 5.2 pseudocode 검증 상태도 source-code gate로 분리할 필요

현재 source code는 pseudocode status가 current이면 내려갈 수 있다.

그러나 policy에서 pseudocode는 실행 순서/분기/실패 경로를 검증하는 정식 단계다.

개선안:

- pseudocode layer에 `validation: "pending" | "passed"`를 둔다.
- source code를 current로 만들기 전에 pseudocode validation이 passed여야 한다.
- 단순 revision freshness와 단계 검증 완료를 같은 상태값으로 섞지 않는다.

이 두 metadata는 의미 Source of Truth가 아니라 단계 progression을 검증하는 lineage metadata이므로 기존 `development-versions.json` 책임과 일치한다.

---

## 6. 최종 판정

`plan-007`은 문제 목록과 전체 단계 구조는 유효했지만 일부 해결책에서 다음 문제가 있었다.

- current implementation을 요구사항보다 우선
- 안전한 거부보다 암묵적 변환을 선택
- existing special case를 invariant로 승격
- 단일 authoritative state보다 새 draft를 추가
- project format의 실제 roundtrip 제약을 충분히 반영하지 않음

따라서 plan-007을 그대로 실행하지 않는다.

`plan-008`에서 유지할 부분과 교체할 부분을 분리하고, 더 단순하면서 project contract를 보존하는 방향으로 실행 순서를 재구성한다.
