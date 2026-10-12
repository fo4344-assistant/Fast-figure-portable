# Review 20261012-002 — Source Script r13 closure

기준 branch: `fix/gui-fsm-20261008-review`

Source Script revision: `r13`

Source Script fingerprint:

```text
sha256:2c7955cf29b10d73f4c0741b895c895633683ae00e6d4cc0bd75b78eaaa566c7
```

## 1. 검토 범위

다음 Source Script 전체를 다시 횡단 검토했다.

- `sourcescript/system.py`
- `sourcescript/project_state.py`
- `sourcescript/application_fsm.py`
- `sourcescript/assets_files.py`
- `sourcescript/graphs.py`
- `sourcescript/layout_annotations_export.py`
- `sourcescript/api_ui.py`
- `sourcescript/renderer_runtime.py`
- `sourcescript/portable_build.py`

검토 기준은 `agent_space/policies/source-script-policy.md` v0.2.6 §2, §3, §4.6이며, r12 closure review는 이전 구조의 근거로만 사용했다. 현재 JavaScript는 의미 원천이 아니라 불일치 탐지 자료로만 대조했다.

## 2. 결론

**Source Script r13을 closed로 판정한다.**

이 판정은 PlusCal pseudocode, optional verification model, source code가 r13에 이미 동기화되었다는 뜻이 아니다. 하위 단계는 아직 r13에서 단일 방향으로 다시 내려가야 한다.

## 3. 논리적 완결성

### 3.1 authoritative state와 runtime selection

판정: 통과.

- persistent authority는 `activeProject`의 ProjectObject 하나다.
- `selectedSlotId`, `assetSelection/assetPath`, `graphObjectIndex`는 runtime state다.
- selected chart는 `selectedSlotId -> slot.chart -> chart`로 resolve하며 별도 editing pointer가 없다.
- graph object의 `csvId`는 persistent data reference이고 current selected CSV가 아니다.
- asset selection의 `assetPath`는 canonical VFS path이며 csvId/imageId와 혼용하지 않는다.

### 3.2 CSV/image/object selection

판정: 통과.

`SELECTION_COMMAND_ORDER`가 모든 mutation 전 reference resolve를 요구한다.

- CSV 선택: requested CSV를 resolve한 뒤 성공 시에만 graph-object selection clear -> asset selection commit.
- object 선택: selected slot/chart/index/object.csvId/project CSV/canonical path를 모두 resolve한 뒤 성공 시에만 clear -> referenced CSV select -> object select.
- image 선택: image kind/path resolve 성공 뒤 graph-object selection clear -> image asset selection. slot imageId는 변경하지 않는다.
- resolve 실패는 기존 runtime selection을 보존한다.

따라서 selection entry point 차이로 partial runtime transition이 남지 않는다.

### 3.3 slot bookmark interaction

판정: 통과.

`renderer_runtime.installSlotClickController`의 의미를 다음으로 확정했다.

- graph/image content body는 Plotly/image interaction surface이며 slot selection을 변경하지 않는다.
- content slot 왼쪽 위 bookmark click이 slot selection/toggle을 소유한다.
- same selected bookmark click은 기존 SELECT_SLOT toggle로 deselect한다.
- bookmark drag는 selection이 아니라 source/target GUI position 사이 slot-local payload 이동이다.
- empty slot에는 graph/image interaction이 없으므로 empty surface click selection을 허용한다.
- drag 뒤 synthetic click은 억제한다.

slot-local payload 이동 범위는 chart/image/contentType/imageSettings/caption 전체이며 row/col/span geometry는 위치에 남는다.

### 3.4 file/asset drop 책임

판정: 통과.

- dashboard external file drop target 확인과 runtime selection: `slots.prepareFileDrop`.
- collision UI/lifecycle orchestration: `FastFigureDashboardFileDrop`.
- persistent import candidate validation/commit: `assets.importToSlot`.
- drag cleanup: `slots.finishFileDrop`.
- existing project asset drop: `assets.connectToSlot(path, kind, slotId)`.

prepare/finish 경로는 persistent asset/chart/image mutation을 소유하지 않는다.

### 3.5 persistent reference integrity

판정: 통과.

- `slot.chart -> charts`: chart는 정확히 하나의 owning slot.
- `slot.imageId -> images`.
- `graphObject.csvId -> csvFiles`.
- VFS path는 directory+name에서 resolve한다.
- chart/image/CSV deletion, trash, FFSX/FFPX import는 candidate 안에서 affected references를 검증한다.

### 3.6 mutation responsibility

판정: 통과.

- `application_fsm`: transition gate, writable scope, candidate/commit sequencing.
- domain modules: 해당 의미 영역의 candidate 계산과 validation rules.
- renderer/UI: authority를 직접 소유하지 않고 API/FSM command를 호출하거나 projection한다.

같은 persistent 사실을 별도 domain authority로 복제하는 경로는 Source Script에 없다.

## 4. 프로젝트 목적 부합

판정: 통과.

r13 수정은 scientific figure workspace의 기존 기능 자유도를 줄이지 않고 다음 경계만 명확히 했다.

- graph interaction과 slot selection 분리
- current CSV selection과 object CSV reference 분리
- image selection과 image-slot connection 분리
- external drop runtime/UI/persistent commit 분리

새 server/network requirement, persistent duplicate state, fake default CSV/object, implicit slot payload loss를 추가하지 않았다.

## 5. 중복·통합·Module decomposition

판정: 통과.

`system.py`가 Fast Figure 전체 system 의미를 나타내고 다음 module들은 직접 sibling responsibility다.

- project_state
- application_fsm
- assets_files
- graphs
- layout_annotations_export
- api_ui
- renderer_runtime
- portable_build

형제 간 import/call은 dependency이며 부모-자식 의미 hierarchy로 승격하지 않는다. 현재 구조에서 같은 의미의 추가 selection store, graph editing pointer, slot movement model, file-drop authority를 둘 이유가 없다.

## 6. 미확정 항목

`system.UNRESOLVED_REVIEW_ITEMS`는 비어 있으며, 이번 r13 closure 범위에서 하위 단계가 새 domain rule을 발명해야 하는 미확정 항목은 확인되지 않았다.

## 7. 다음 단계

닫힌 r13을 Source Script 원천으로 고정하고 다음 방향으로만 전파한다.

```text
Source Script r13
  -> PlusCal pseudocode
  -> optional state-based verification when selected
  -> Source Code
```

기존 partial PlusCal 및 JavaScript는 r13 의미와 충돌하면 하위 번역/구현을 수정한다. r13을 하위 결과에 맞춰 소급 변경하지 않는다.
