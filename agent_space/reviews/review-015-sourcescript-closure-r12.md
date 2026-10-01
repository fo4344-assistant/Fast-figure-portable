# Review 015 — Source Script r12 closure

기준 commit: `d169e4c2f549909bed432c17d91b0ad681b12b99`

Source Script revision: `r12`

Source Script fingerprint:

```text
sha256:c8bde1257048128f5c17081cb08fb9ef5bee1cc94dd9bb690d3e9419032655db
```

## 1. 검토 범위

다음 Source Script 전체를 횡단 검토했다.

- `sourcescript/system.py`
- `sourcescript/project_state.py`
- `sourcescript/application_fsm.py`
- `sourcescript/assets_files.py`
- `sourcescript/graphs.py`
- `sourcescript/layout_annotations_export.py`
- `sourcescript/api_ui.py`
- `sourcescript/renderer_runtime.py`
- `sourcescript/portable_build.py`

검토 기준:

- `agent_space/policies/source-script-policy.md`
- `agent_space/plans/plan-008.md`
- README의 현재 project 목적/file-format 계약
- 사용자가 확정한 slot-local ownership 규칙
- r2~r12 patch 기록

current source code는 version chain상 stale lower layer이므로
Source Script 의미의 권위로 사용하지 않고 구현 흔적/회귀 위험을 확인하는 검증 자료로만 사용했다.

## 2. 결론

**Source Script r12를 structurally closed로 판정한다.**

이 판정은 current source code가 r12와 이미 동기화되었다는 뜻이 아니다.

현재 개발 계층은:

```text
Source Script r12: current / closed
pseudocode r0: missing / pending
source code r0: stale / pre-version-chain
```

이며 다음 단계는 r12의 의미를 추가하지 않고 pseudocode로 번역하는 것이다.

---

## 3. 논리적 완결성

### 3.1 새 project 생성

판정: **통과**

`project_state.py`의 `DEFAULT_PROJECT_RULES`, `SLOT_LOCAL_DEFAULTS`,
`createProjectState`, `validateProjectObjectState`가 다음을 결정한다.

- 초기 grid와 empty slots
- global labels/captions/export/appearance
- empty CSV/image/chart collections
- VFS fixed directories
- next-id
- slot-local default contentType/imageSettings/caption
- default CSV/fake graph object를 만들지 않는 규칙

따라서 초기 authoritative project를 만들기 위해 하위 단계가 새 의미를 발명할 필요가 없다.

### 3.2 외부 입력 → authoritative object

판정: **통과**

입력별 변환 경로가 분리되어 있다.

- CSV/TSV/JSON:
  `parseProjectDataAsset` → candidate asset → collision/import transaction
- image:
  copied bytes asset → slot image reference + slot-local imageSettings
- FFPX:
  `ffpxReadProject` → `buildProjectObject` → `PROJECT_LOADED`
- FFSX:
  `ffsxReadSlot` → package-local CSV remap → independent chart/target slot candidate
- Plotly JSON:
  original imported figure 보존 → conversion view → optional editable conversion

모든 persistent mutation은 candidate validation 뒤 commit한다.

### 3.3 ID/path/reference 생성과 resolve

판정: **통과**

다음 source가 하나씩 정의되어 있다.

- collection ID: project `nextId`
- VFS path:
  canonical normalize/resolve/unique/descendant rules
- chart ownership:
  one chart ↔ exactly one owning slot
- graph object CSV:
  actual project CSV id reference
- image:
  copied image asset id reference
- slot-local values:
  slot object itself

shared/orphan chart는 자동 clone/drop하지 않고 invalid topology로 거부한다.

### 3.4 grid/merge/split/swap/reset

판정: **통과**

slot object의 GUI placement와 slot-local payload가 구분되어 있다.

공통 local defaults:

- chart
- imageId
- contentType
- imageSettings
- caption

`slotHasNonDefaultLocalState`를 data-loss guard의 단일 판정으로 사용한다.

operation 의미:

- grid expand:
  기존 slot geometry/local state 보존 + default slot 추가
- grid shrink:
  제거 영역에 non-default local state 또는 merged span이 있으면 거부
- swap:
  GUI geometry는 유지하고 slot-local payload 전체 교환
- merge:
  non-default local payload가 최대 하나일 때만 anchor로 전체 이동
- split:
  anchor payload 유지, restored slots는 defaults
- reset:
  해당 slot-local payload를 defaults로 변경하고 owned chart 제거

implicit reflow 또는 silent payload merge는 없다.

### 3.5 asset delete/trash cascade

판정: **통과**

`collectAssetReferences`가 confirmation과 mutation에 사용하는 실제 reference set을 하나로 계산한다.

- CSV reference 단위: graph object
- image reference 단위: slot

delete/move-to-trash/empty-trash는 reference detach와 asset/VFS candidate를 같이 검증한다.

CSV object 제거 후 zero-object chart는 valid하다.
image asset detach와 slot reset은 별도 의미이므로 asset 제거 자체가 unrelated slot-local state를 임의 삭제하지 않는다.

### 3.6 chart ownership

판정: **통과**

`CHART_OWNERSHIP_RULE`과 whole-project validation이:

- slot: chart 0..1
- chart: owning slot exactly 1
- shared chart 금지
- orphan chart 금지

를 결정한다.

FFPX/FFSX/import/FSM/layout operation도 같은 topology를 사용한다.

### 3.7 preview/draft/cache의 authority 재유입

판정: **통과**

- label position:
  single persistent x/y, 별도 preview copy 없음
- `editing`:
  제거; selectedSlotId → slot.chart → chart resolve
- UI draft:
  modal/input/pointer lifetime에 한정
- renderer snapshot:
  one-way projection/read-only operation input
- debug telemetry:
  session runtime projection
- `layoutMapWidth`:
  legacy no-op field, 새 authority에서 제거

임시값을 다시 persistent mutation의 독립 source로 사용하는 경로를 Source Script에 두지 않는다.

### 3.8 Plotly 보존/편집 경계

판정: **통과**

non-editable import는 original Plotly:

- data
- layout
- config
- frames

를 imported representation으로 보존한다.

Fast Figure가 직접 이해하는 trace/axis subset만 conversion view로 계산한다.

editable conversion에서만 실제 project CSV를 생성한다.
zero-trace figure는 CSV 없이 zero-object editable chart가 될 수 있다.

따라서 원본 보존 영역과 editor SoT가 구분되어 있다.

### 3.9 FFPX/FFSX roundtrip

판정: **통과**

FFPX:

- complete persistent project state
- copied CSV/image bytes
- global caption은 `caption/caption.xml`
- slot-local caption/imageSettings는 slot document
- project-level export settings
- typed XML recursive value grammar
- trash exclusion
- original filesystem path independence

FFSX:

- one graph slot
- referenced CSV
- slot-local caption
- zero-object blank chart 지원
- package-local CSV id → new project id mapping

동일 persistent 값의 serialized authority를 두 문서에 중복하지 않는다.

### 3.10 raster export geometry

판정: **통과**

다음이 분리되어 있다.

- project logical layout geometry
- persistent export settings
- target raster geometry
- chart render projection
- slot-local image transform
- label transform
- caption layout
- raster dimension/area limit
- DPI metadata
- current-screen one-shot capture

DOM 현재 크기를 saved target figure geometry의 SoT로 사용하지 않는다.

### 3.11 public API와 mutation 권한

판정: **통과**

`api_ui.py`의 `PUBLIC_API_METHODS`가 domain별 method를:

- read
- calculation
- runtime mutation
- persistent mutation
- lifecycle mutation
- export

으로 구분한다.

owner가 모호했던 lower-layer API는 replacement가 명시되어 있다.

특히:

- print.readDefaults → readSettings
- captions.readState → readGlobal/readSlot
- captions.setSlotMode → persistent API에서 제거
- captions.setText → setGlobalText/setSlotText
- labels.previewPosition → 제거
- labels.commitPosition → finishPositionInteraction

FSM은 `CANDIDATE_MUTATION_CONTRACT`의
resolve → precondition → candidate → validate → commit → runtime/projection 순서를 사용한다.

### 3.12 동일 책임의 중복 state/helper/transition

판정: **통과**

closure review 대상이었던 주요 중복은 정리되었다.

- protected default CSV: 제거
- fake default graph object: 제거
- global `editing`: 제거
- persistent caption `slotMode`: 제거
- image asset-owned display settings: 제거
- label preview/commit duplicate authority: 제거
- `layoutMapWidth`: authoritative state에서 제거
- slot-local empty/non-default 판정:
  `SLOT_LOCAL_DEFAULTS` + `slotHasNonDefaultLocalState`로 통합
- caption serialization:
  global document / slot document 책임 분리

ProjectObject/ProjectObjectRegistry/FastFigureApi는 각각
authority / read adapter / frontend public boundary라는 서로 다른 책임으로 남는다.

---

## 4. 프로젝트 목적 부합

### 4.1 scientific figure workspace

판정: **통과**

tabular/image input에서 graph/image slot을 구성하고
layout/label/caption/export/package 기능으로 이어지는 의미가 같은 ProjectObject 위에 연결되어 있다.

### 4.2 local/offline

판정: **통과**

core open/edit/export에 server/account/mandatory network dependency가 없다.

portable build는 core runtime dependency를 single-file artifact에 포함한다.

### 4.3 complete persistent project

판정: **통과**

ProjectObject/FFPX에 다음 persistent 의미가 포함된다.

- layout/slots
- CSV/image copied assets
- charts
- labels
- project-global caption
- slot-local captions
- slot-local image settings
- appearance
- export settings
- VFS metadata

session selection, modal/pointer draft, telemetry는 제외된다.

### 4.4 copied asset independence

판정: **통과**

FFPX/FFSX package의 CSV/image data는 copied bytes로 보존되고
재개방에 original filesystem path/file object를 요구하지 않는다.

### 4.5 interchange boundary

판정: **통과**

- Plotly JSON: one graph figure interchange
- FFSX: one graph slot + referenced CSV + slot-local caption
- FFPX: complete project

책임이 서로 암묵적으로 확대되지 않는다.

---

## 5. 횡단 stale-meaning 검사

다음 문자열/개념을 전체 Source Script에서 다시 검색했다.

- unresolved / 미확정
- protected/default CSV
- `isDefaultEmpty`
- global `editing`
- persistent `slotMode` / `slotCaptionsEnabled`
- label `previewPosition` / `commitPosition`
- authoritative `layoutMapWidth`
- image asset-owned display settings
- mutate-first rollback

검색 결과 남아 있는 표현은:

- 해당 구조를 **사용하지 않는다**는 resolved rule
- lower-layer replacement를 설명하는 역사/호환 문구

뿐이며, 새 authoritative 경로로 사용하는 모순은 발견하지 못했다.

---

## 6. 남은 lower-layer 작업

Source Script closure와 별개로 current application source는 r12에서 파생되지 않은 stale lower layer다.

pseudocode/source code에서 최소한 다음이 전파되어야 한다.

- default CSV 특수 구조 제거
- zero-object graph
- chart 1:1 slot ownership
- slot-local caption/imageSettings
- slot-local default guard
- persistent export settings
- candidate-first mutation
- 새 public API surface
- label single-position authority
- editing/layoutMapWidth 제거
- FFPX/FFSX serialization responsibility 변경

이 차이는 Source Script의 미확정 항목이 아니라 하위 계층 동기화 작업이다.

---

## 7. 최종 판정

Source Script r12는 다음 조건을 만족한다.

- `UNRESOLVED_REVIEW_ITEMS = []`
- project/data/reference/layout/file/API 의미가 하위 단계에서 새 domain rule을 발명하지 않아도 될 정도로 결정됨
- 같은 persistent 의미의 중복 authority가 없음
- project 목적과 package contract가 Source Script 자체에서 추적 가능
- pseudocode가 실행 순서/분기/실패 경로를 번역할 수 있는 입력이 존재함

따라서:

```text
source-script.status = current
source-script.closure = closed
```

로 전환하는 것이 타당하다.

다음 단계는 pseudocode r1 생성 및 검증이다.
