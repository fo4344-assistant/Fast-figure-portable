# 계획 007 — Source Script 닫힘 복구와 하위 계층 재생성

## 1. 목적

이 계획은 `review-013-sourcescript-closure.md`에서 확인된 Source Script 미완결 사항과 현재 source code의 규칙 충돌을 Source Script 단계에서 먼저 해결한 뒤, 닫힘 판정을 다시 수행하고 pseudocode와 source code를 순서대로 재생성하기 위한 실행 계획이다.

적용 우선순위는 다음과 같다.

```text
agent_space/policies/source-script-policy.md
        ↓
sourcescript/
        ↓
pseudocode/
        ↓
application source code
```

현재 version chain은 다음 상태다.

```text
Source Script r1: current
pseudocode r0: missing
source code r0: stale / pre-version-chain
```

따라서 이 계획을 수행하는 동안 application source를 먼저 수정하지 않는다.

---

## 2. Source Script 변경 기록 규칙

Source Script 수정은 application source 수정과 동일하게 diff와 수정 이유를 남긴다.

각 Source Script 변경 단위마다:

1. `sourcescript/`를 수정한다.
2. `development-versions.json`의 source-script revision과 fingerprint를 갱신한다.
3. 실제 변경 diff를 새 `agent_space/patches/YYYYMMDD-NNN.patch`에 기록한다.
4. 같은 basename의 `.md`에 다음을 기록한다.
   - 변경 원인
   - 의미상 변경
   - 선택 이유
   - 기각한 대안
   - 상태/참조/파일 호환 영향
   - 닫힘 판정 영향
   - pseudocode/source code에 전파할 범위
5. version-chain 검사를 통과시킨다.

여러 문제를 같은 책임 단위에서 함께 해결해야 의미가 일관되는 경우에는 하나의 coherent patch로 묶는다. 반대로 서로 독립적인 책임을 한 patch에 억지로 합치지 않는다.

---

## 3. 우선 해결할 의미 충돌

이 절의 문제는 현재 source code를 그대로 묘사해서는 해결되지 않는다. Source Script에서 규칙을 먼저 확정한다.

### 3.1 grid 축소와 콘텐츠 보존

현재 문제:

- Source Script는 재배치를 기술하지만 실제 `rebuildGridSlots`는 새 slot 수만큼 기존 visible slot 앞부분만 복사한다.
- 축소된 영역 밖의 chart/image가 orphan될 수 있다.
- validator가 orphan chart를 거부하지 않아 손실이 검출되지 않을 수 있다.

권고 해결 규칙:

1. grid resize는 사용자 content를 암묵적으로 삭제하지 않는다.
2. 기존 content-bearing visible slot이 모두 새 좌표 범위 안에 들어가면 좌표와 span을 보존한다.
3. 좌표를 보존할 수 없지만 새 grid의 visible capacity가 content-bearing slot 수 이상이면 content-bearing slot만 row-major 순서로 새 1×1 slot에 packing한다.
4. 새 grid capacity가 content-bearing slot 수보다 작으면 resize를 거부하고 원본 state를 유지한다.
5. 재배치 이후 참조되지 않는 chart/image를 새로 만들지 않는다.
6. grid resize 성공 후 모든 chart/slot reference를 전체 validation한다.

여기서 content-bearing은 graph/image뿐 아니라 아래 3.3에서 확정할 slot content ownership 규칙을 따른다.

### 3.2 chart reference cardinality

현재 문제:

- validator는 여러 slot의 동일 chart 참조를 허용할 수 있다.
- `detachSlotChart`는 shared chart를 고려한다.
- `SLOTS_RESET`은 shared reference를 무시하고 chart를 제거한다.
- 일반 UI에는 chart를 의도적으로 공유시키는 기능이 없다.

권고 해결 규칙:

- 정상 project state에서 chart는 정확히 하나의 visible/semantic slot content가 소유하는 독점 object로 정의한다.
- valid project state에서:
  - slot이 참조하는 chart는 반드시 존재한다.
  - 각 chart는 정확히 하나의 slot에서 참조되어야 한다.
  - orphan chart와 shared chart를 허용하지 않는다.
- legacy/import 입력에서 shared chart가 발견되면 사용자에게 보이는 figure를 보존하기 위해 두 번째 이후 slot에는 chart를 clone하여 독립 chart id를 부여하는 normalization을 우선 검토한다.
- import format이 shared identity 자체를 명시적 기능으로 보장해야 한다는 근거가 발견되면 이 규칙을 적용하지 않고 Source Script 설계 문제로 다시 올린다.

이 규칙을 채택하면 reset/import/detach에서 shared-chart 예외 처리를 제거할 수 있다.

### 3.3 caption ownership

현재 문제:

- `slot.content`에는 chart/image/contentType/caption이 함께 있다.
- swap은 content 전체를 이동한다.
- merge는 chart/image/contentType만 이동하고 caption은 남긴다.

권고 해결 규칙:

- slot caption은 해당 slot에 표시되는 graph/image와 함께 이동하는 **slot content의 일부**로 정의한다.
- swap은 현재처럼 `slot.content` 전체를 교환한다.
- merge는 선택 영역 안의 non-empty content가 최대 하나일 때만 허용한다.
- caption만 존재하는 slot도 non-empty content로 취급한다.
- non-anchor slot의 content를 anchor로 옮길 때 caption도 함께 옮긴다.
- covered slot은 완전한 empty content로 초기화한다.
- split은 anchor content를 anchor에 남기고 새로 드러나는 slot은 empty content로 시작한다.

이렇게 하면 merge/split/swap/reset에서 content 이동 단위를 하나로 통합할 수 있다.

### 3.4 label preview와 commit

현재 문제:

- `previewLabelsApiPosition`이 authoritative label x/y를 즉시 변경한다.
- `commitLabelsApiPosition`은 실제 값 commit이 아니라 notify만 한다.

권고 해결 규칙:

```text
authoritative label position
        ↓ read
UI-local drag draft
        ↓ preview render
commit
        ↓
single mutation command
        ↓
authoritative label position
```

- pointer move는 component-local draft 또는 renderer-only preview projection만 변경한다.
- preview 값은 다른 consumer의 일반 read source가 되지 않는다.
- pointer up/commit에서 한 번만 authoritative state를 변경한다.
- cancel/overlay close가 있으면 authoritative position은 원래 값 그대로 유지한다.
- commit mutation 뒤 renderer와 FSM notification을 수행한다.

이는 계산/preview와 상태 변경을 분리하고 Source of Truth로 되돌아가는 경로를 하나로 만든다.

### 3.5 export settings persistence

현재 문제:

- README는 complete persistent state에 export settings를 포함하는 것으로 읽힐 수 있다.
- 실제 width/height/DPI/format은 React local state이며 FFPX에 저장되지 않는다.

권고 해결 규칙:

- width/height/DPI/format은 figure 자체의 의미가 아니라 **개별 export operation input**으로 정의한다.
- ProjectObject persistent state에 추가하지 않는다.
- Source Script에 operation-local input임을 명시한다.
- source code 단계에서 README의 persistent-state 설명을 실제 의미에 맞게 수정한다.
- 향후 반복 export preset 기능이 명시적으로 요구될 때만 별도 persistent requirement로 다시 검토한다.

불필요한 영속 상태를 추가하지 않는 방향을 기본안으로 한다.

---

## 4. 핵심 알고리즘 보완

3절의 의미 충돌을 해결한 뒤 다음 누락을 Source Script에 채운다.

### 4.1 project initialization

`project_state.py`에 project 생성 알고리즘을 명시한다.

필수 항목:

- 초기 grid
- slot style 기본값
- label/caption 기본 상태
- appearance palette
- fixed VFS directories
- id sequence 초기 규칙
- 기본 empty slot 생성
- protected default CSV의 정확한 생성 시점과 invariant

기본 빈 CSV는 단순 UI 예제가 아니라 editable graph object가 0개가 되었을 때 복구 reference이므로 graph invariant와 연결한다.

### 4.2 project import normalization

FFPX/legacy import payload에서 authoritative ProjectObject를 만드는 전체 과정을 명시한다.

순서:

1. 구조 검증
2. 파일/asset id와 path 정규화
3. protected default CSV reuse/remap
4. chart normalization
5. chart reference cardinality normalization
6. slot geometry/content/reference 검증
7. annotation/style/palette normalization
8. next-id 계산
9. whole-project validation
10. 성공 후에만 authoritative project 교체

부분 변경을 authoritative state에 노출하지 않는다.

### 4.3 VFS 규칙

`projectVfs`의 public 의미를 Source Script에 명시한다.

- canonical path normalization
- resolve
- exists
- unique path 생성
- fixed directory
- descendant 판정
- asset path와 directory/name 관계
- prepare/assign location의 책임
- trash subtree 판정

동일 path 규칙을 import/move/export에서 별도로 재구현하지 않는다.

### 4.4 CSV/TSV/JSON parsing과 load transaction

현재 지원 의미를 Source Script에 명시한다.

- delimiter 판정
- quote와 escaped quote
- quoted newline
- 빈 row 처리
- JSON array / data array
- 원본 bytes 보존
- rows projection 생성
- collision plan
- create/replace
- slot 연결
- 중간 실패 rollback

parser는 file import transaction과 분리된 순수 계산으로 둔다.

### 4.5 graph global/axis schema

`graphObject`와 같은 수준으로 global settings와 axis settings를 정의한다.

포함 대상:

- title/legend/font
- x bottom / x top / y left / y right
- title
- range
- tick mode/increment
- divide
- scale type
- reciprocal/log 제한
- notation
- line/grid/visible/value 표시
- title/tick font size
- imported Plotly extension 보존 규칙

### 4.6 Plotly import와 editable conversion

다음을 명시한다.

1. trace별 x/y data를 conversion table column으로 생성
2. axis side mapping
3. trace type/visibility mapping
4. line/marker/color/legend mapping
5. 편집하지 않는 trace property 보존
6. layout → global/axis settings 변환
7. data/layout/config/frames 원본 representation 보존
8. 최초 non-editable 상태
9. editable 전환 시 conversion rows를 실제 project CSV asset으로 생성
10. 이후 graph object는 project CSV id를 참조

원본 Plotly 의미를 보존하는 영역과 Fast Figure가 직접 편집하는 영역을 분리한다.

### 4.7 FFPX typed value grammar

FFPX v3 writer/reader가 공통으로 사용하는 typed XML value grammar를 명시한다.

지원 값:

- null
- boolean
- number
- string
- array
- object

재귀 encoding/decoding과 invalid type/invalid number 실패 조건을 함께 명시한다.

### 4.8 FFSX apply transaction

package read와 project 적용을 분리한다.

project 적용 단계에서:

- package-local CSV id → project CSV id mapping
- protected default CSV reuse
- chart id 새 할당
- 기존 slot chart의 교체/분리
- slot content/caption 적용
- 전체 validation
- 실패 시 CSV/chart/slot/id sequence rollback

을 하나의 transaction 의미로 정의한다.

### 4.9 export geometry

현재 raster export에 필요한 계산을 Source Script에서 다음 책임으로 분리한다.

- logical dashboard geometry
- target pixel scale
- chart Plotly target rendering
- image fit/manual transform
- label reference coordinate transform
- caption text measurement/layout
- raster dimension/area validation
- PNG/JPEG blob과 DPI metadata

DOM layout을 authoritative figure geometry로 역사용하지 않는다.

### 4.10 FSM mutation contract

모든 event를 복사해 나열하기보다 공통 mutation pattern을 먼저 정의한다.

```text
resolve current authoritative target
→ assert writable scope
→ validate input/reference
→ capture rollback state when multi-object mutation
→ mutate
→ whole/local invariant validation
→ update runtime selection if needed
→ notify/render projection
→ failure: restore authoritative/runtime state
```

그 뒤 각 event는 이 pattern에서 달라지는 입력, scope, 변경 대상, rollback 범위만 명시한다.

### 4.11 FastFigureApi method contract

category 설명에서 method 단위 contract로 확장한다.

각 method에 대해:

- read / calculation / mutation 구분
- input
- return
- authoritative mutation target
- lifecycle 필요 여부
- UI-local confirmation이 필요한지 여부
- 실패 시 state 유지 규칙

을 기록한다.

UI component 이름 자체가 API 의미를 결정하지 않게 한다.

---

## 5. 중복 구조 통합

### 5.1 `editing` 제거 가능성

우선 다음 관계로 대체 가능한지 확인한다.

```text
selectedSlotId
→ selected slot
→ slot.chart
→ activeProject.charts resolve
```

Plotly callback이 안정적인 chart object reference를 요구하는 구체 이유가 없으면 `editing`을 별도 runtime authority로 유지하지 않는다.

필요한 이유가 확인되면 cache로 유지하되:

- 생성 원천
- invalidate 조건
- authoritative mutation 입력으로 재유입되지 않는 조건

을 Source Script에 명시한다.

### 5.2 chart detach/reset 통합

3.2에서 독점 chart ownership을 확정하면 slot content 제거의 chart cleanup은 하나의 primitive로 통합한다.

reset, image 연결, graph replacement, slot import가 각자 chart removal 규칙을 다시 구현하지 않는다.

### 5.3 asset reference cascade 통합

현재 직접 delete와 trash 경로의 reference 제거가 다르므로 하나의 계산 + mutation 구조로 정리한다.

```text
collect affected references
→ report exact reference count
→ user confirmation if required
→ one cascade mutation
→ validation
```

reference count의 의미도 하나로 고정한다.

권고 기준:

- CSV: 제거되는 graph object 수
- image: 초기화되는 slot 수

같은 chart에서 동일 CSV를 여러 object가 참조하면 여러 reference로 센다.

### 5.4 `layoutMapWidth`

현재 producer/consumer가 없는 persistent field인지 확인한다.

- 실제 project 의미가 없으면 Source Script와 차후 source code에서 제거한다.
- 필요한 persistent layout 의미가 확인되면 writer/reader뿐 아니라 실제 producer와 consumer를 정의한다.

단순 호환 흔적이라는 이유만으로 persistent schema에 유지하지 않는다.

### 5.5 ProjectObject 접근 계층

다음 세 책임만 유지하는 것을 기본안으로 한다.

- ProjectObject: authoritative project state와 compatibility property
- ProjectObjectRegistry: FSM/export가 이름으로 subtree를 resolve하는 adapter
- FastFigureApi: frontend public boundary

같은 값을 제공하기만 하는 추가 alias가 있으면 제거 후보로 분류한다.

---

## 6. Source Script 수정 순서

### Phase A — 의미 규칙

대상:

- grid resize
- chart ownership/cardinality
- slot content/caption ownership
- label preview/commit
- export operation settings

완료 조건:

- 서로 모순되는 규칙이 없음
- 이 규칙들만으로 merge/split/swap/reset/grid resize 결과가 유일하게 결정됨

### Phase B — project와 file semantics

대상:

- initialization
- ProjectObject validation
- import normalization
- VFS
- CSV/image import transaction
- FFPX/FFSX

완료 조건:

- 새 project와 import project가 같은 invariant를 만족함
- 모든 id/path/reference 생성과 remap을 추적 가능
- 실패 시 authoritative state가 부분 변경되지 않음

### Phase C — graph와 export

대상:

- graph object/global/axis schema
- Plotly import/editable conversion
- rendering projection
- raster export geometry

완료 조건:

- tabular data → chart → Plotly → export 경로가 끊기지 않음
- imported Plotly에서 보존되는 정보와 Fast Figure가 편집하는 정보가 구분됨
- 화면 geometry와 export geometry의 관계가 명시됨

### Phase D — FSM/API와 중복 제거

대상:

- mutation pattern
- FastFigureApi method contracts
- `editing`
- detach/reset
- reference cascade
- `layoutMapWidth`
- access alias

완료 조건:

- authoritative state 변경 경로가 단일하게 추적됨
- 같은 책임의 mutation 구현이 병렬로 남지 않음
- projection/cache가 mutation의 비공식 원천으로 재유입되지 않음

---

## 7. 버전 운용

현재 Source Script r1은 review 결과상 current authority이지만 **닫힌 revision은 아니다**.

다음 Source Script 수정부터:

- revision을 r2 이상으로 증가
- 실제 fingerprint 갱신
- pseudocode는 계속 missing
- source code는 계속 stale

로 유지한다.

Source Script가 최종 닫힘 판정을 통과하기 전에는 pseudocode r1을 만들지 않는다.

닫힘 이후:

```text
Source Script rN / closed/current
        ↓
pseudocode r1 / current
        ↓
source code r1 / current
```

순으로만 진행한다.

중간 Source Script revision마다 patch pair를 남기므로 어느 규칙이 언제 왜 바뀌었는지 추적할 수 있어야 한다.

---

## 8. 닫힘 재검증

Source Script만 읽고 다음 질문에 답할 수 있어야 한다.

1. 새 project는 어떤 invariant로 생성되는가.
2. CSV/image/FFPX/FFSX/Plotly 입력이 어떤 authoritative object로 변환되는가.
3. 모든 id/path/reference는 어디서 생성·resolve·검증되는가.
4. grid resize, merge, split, swap, reset 때 각 content와 caption은 정확히 어디로 이동하는가.
5. 삭제와 trash가 graph/image reference를 어떤 동일 규칙으로 제거하는가.
6. chart가 어느 slot에 소유되는지 유일하게 판정 가능한가.
7. preview/draft/cache 중 무엇이 authoritative mutation 입력으로 돌아갈 수 있는가.
8. Plotly import/export에서 어떤 정보가 보존되고 어떤 정보가 Fast Figure editor 의미로 변환되는가.
9. FFPX/FFSX roundtrip에서 schema, id remap, rollback이 모두 결정되어 있는가.
10. raster export geometry가 project geometry에서 어떻게 계산되는가.
11. UI가 호출할 public API method와 mutation 권한이 method 단위로 결정되어 있는가.
12. 동일 책임을 가진 별도 state/helper/transition이 남아 있지 않은가.

각 항목에 확인 근거와 결론을 새 review 문서로 남긴다.

하나라도 해결되지 않으면 Source Script를 닫지 않는다.

---

## 9. 하위 단계 전파

Source Script가 닫힌 뒤에만 pseudocode를 생성한다.

pseudocode에서는:

- Source Script 식별자를 그대로 사용
- 실행 순서
- 분기
- 값 생성/소비
- rollback
- 실패 경로

만 정규화한다.

pseudocode에서 새로운 의미 문제가 발견되면 pseudocode를 수정해 해결하지 않고 Source Script로 되돌린다.

source code는 current pseudocode 검증 뒤에만 수정한다.

현재 source code의 기존 동작과 새 Source Script가 다르면 **새 Source Script → pseudocode가 우선**하며, source code를 새 의미에 맞게 변경한다.

---

## 10. 중단 조건

다음 경우 해당 phase 구현을 중단하고 Source Script 설계 문제로 되돌린다.

- 기존 FFPX/FFSX 호환 요구와 새 invariant가 동시에 만족될 수 없음
- chart 공유가 실제 사용자 기능 또는 file-format 계약으로 확인됨
- caption ownership을 하나로 만들 경우 기존 명시 요구를 훼손함
- Plotly roundtrip에서 보존할 정보와 편집 모델 사이에 손실 없는 경계를 정의할 수 없음
- 통합하려는 runtime state가 실제로 독립적인 기능 자유도를 제공하는 것으로 확인됨
- 해결 방향이 정책의 Source of Truth, 참조 무결성, 최소 구현 원칙과 충돌함

이 경우 구현 편의로 예외를 추가하지 않고 계획과 Source Script의 해당 미확정 항목을 다시 수정한다.
