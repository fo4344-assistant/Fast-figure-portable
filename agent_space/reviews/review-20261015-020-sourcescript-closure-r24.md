# Source Script r24 closure review — Backend / Application boundary / Frontend API-Adapter 분리

## 되돌아온 이유

plan-015에서 Project EFSM과 interface FSM의 상태 책임은 분리했지만, plan-016과 `review-20261014-019-plan-016-boundary-audit.md`의 횡단 감사에서 두 FSM 사이의 논리 계층 경계가 충분히 분리되지 않았음을 확인했다.

확인된 문제는 다음과 같다.

- `system.py`가 project/domain/FSM/API/renderer/build Source Script를 모두 system의 직접 sibling responsibility로 두어 Backend와 Frontend의 의미적 hierarchy를 표현하지 않았다.
- `interface_fsm.py`가 `activeProject`를 직접 import하여 slot/asset/graph-object selection validity와 project mutation 뒤 reconciliation을 Frontend FSM 내부에서 Backend state를 읽어 판정했다.
- `renderer_runtime.py`가 `activeProject`와 `selectedSlotId`를 직접 읽어 DOM/Plotly projection을 만들었다.
- `api_ui.py`가 public API와 Mantine frontend 책임을 함께 설명하면서 `activeProject`와 `selectedSlotId`를 직접 import했다.
- `layout_annotations_export.py`의 image/label read와 image-settings mutation wrapper가 Frontend `selectedSlotId`를 직접 읽었다.
- `assets_files.py`, `graphs.py`, `layout_annotations_export.py`는 Backend calculation/candidate와 Application-boundary dispatch wrapper가 한 물리 파일에 공존하지만 어느 함수가 어느 논리 책임인지 명시하지 않았다.
- 기존 slot selection은 `SELECT_SLOT`의 UI transition과 `pendingSlotContentType`에 따른 조건부 `SLOT_TYPE_CHANGED` persistent mutation이 한 흐름에 있었기 때문에, 단순히 SELECT_SLOT을 Frontend-only event로 재분류하면 기존 의미를 잃는다.
- renderer/read 경로에서 누락 field를 정규화할 때 live ProjectObject를 변경할 수 있는 구현 흔적이 있어, read projection 계산과 persistent mutation의 분리를 Source Script에서 더 강하게 닫을 필요가 있었다.
- `portable_build.py`는 Backend나 Frontend의 하위 의미가 아니라 전체 system artifact packaging 책임인데 새 hierarchy에서 그 위치를 별도로 확정해야 했다.

r23 closure가 이를 놓친 원인은 r23의 닫힘 목적이 public persistent mutation command coverage와 candidate-first commit에 집중되어 있었고, Backend↔Frontend의 read dependency와 물리 파일 안의 혼합 책임을 별도 Module decomposition 문제로 검사하지 않았기 때문이다.

## Module decomposition hierarchy

r24의 system-level 논리 hierarchy는 다음 네 direct child로 확정했다.

```text
Fast Figure system
├─ Backend
├─ Application boundary
├─ Frontend
└─ Portable build
```

Backend는 다음 의미를 포함한다.

- `project_state.py`: `activeProject` authoritative ProjectObject, reference/invariant, Backend read/query provider.
- `project_efsm.py`: persistent ProjectObject transition/validation/commit controller.
- `assets_files.py`의 Backend 부분: VFS, asset/package parse/serialize, collision, candidate, validation, FFPX/FFSX semantics.
- `graphs.py`의 Backend 부분: CSV/chart/graph-object normalization, validation, Plotly semantic conversion과 candidate calculation.
- `layout_annotations_export.py`의 Backend 부분: persistent layout/imageSettings/label/caption/export-settings calculation, candidate, validation, snapshot semantics.

Application boundary는 다음 의미를 포함한다.

- `application_fsm.py`: Backend command/query, Backend reference validation, ProjectMutationResult 후 reconciliation query, lifecycle orchestration.
- `api_ui.py`의 FastFigureApi public contract.
- `assets_files.py`, `graphs.py`, `layout_annotations_export.py`에 물리적으로 함께 있는 public command/query wrapper.

Frontend는 다음 의미를 포함한다.

- `interface_fsm.py`: session/runtime state와 transition.
- `api_ui.py`의 Mantine component 및 component-local state.
- `renderer_runtime.py`: DOM/Plotly projection, renderer interaction, telemetry.
- `layout_annotations_export.py`의 screen/raster presentation 부분.

Portable build는 `portable_build.py`가 소유하는 split source → single-file artifact packaging이다. runtime Backend/Frontend 책임의 자식으로 재분류하지 않는다.

이 hierarchy는 물리 파일 배치와 동일하지 않다. 한 물리 파일에 여러 논리 responsibility가 공존할 수 있지만 각 rule/function은 어느 logical owner에서 파생되는지 추적 가능해야 한다. 하위 PlusCal과 Source Code는 물리 파일 co-location을 이유로 Backend↔Frontend direct access를 다시 허용할 수 없다.

## Backend authoritative state와 mutation

`activeProject`는 계속 유일한 persistent ProjectObject authority다. r24는 새 project store, Frontend mirror, command bus 또는 두 번째 persistent state를 추가하지 않는다.

persistent mutation 경로는 다음으로 고정한다.

```text
Frontend mutation intent
→ FastFigureApi/public mutation surface
→ Application adapter
→ Backend Project EFSM
→ current activeProject reference resolve
→ candidate
→ validation
→ one commit
→ ProjectMutationResult
```

Project EFSM은 Frontend FSM, DOM, Mantine/React state를 직접 변경하지 않는다. Frontend component/FSM/renderer는 `projectEFSM.send`를 직접 호출하지 않는다.

`PUBLIC_PROJECT_MUTATION_ROUTES`에는 기존 route에 더해 다음 누락을 명시했다.

- `slots.swap → SLOTS_SWAPPED`
- `slots.select.pendingContentType → SLOT_TYPE_CHANGED`

두 route 모두 기존 Project command를 재사용하며 새 mutation authority를 만들지 않는다.

## Backend read/query 경계

read와 calculation은 Project EFSM mutation path를 통과하지 않는다. 대신 Frontend에서 Backend persistent state를 읽어야 하는 모든 cross-layer read는 Application boundary의 query adapter를 통과한다.

`project_state.py`에 다음 Backend read 의미를 추가했다.

- `readBackendProjection(kind, request)`
- `validateFrontendIntent(event, payload)`
- `buildFrontendReconciliationInput(event, mutationResult, frontendReferences)`

query는 current `activeProject`에서 필요한 id/path/reference를 다시 resolve하고 consumer에 필요한 field만 immutable/transient projection으로 반환한다.

read projection에서 compatibility/default normalization이 필요하면 projection 또는 candidate copy에서 수행한다. read 과정이 live ProjectObject field를 변경하지 않는다.

Frontend 또는 renderer가 받은 projection은 project authority가 아니며 그대로 persistent mutation candidate로 되돌려 보내지 않는다. mutation input에는 identity/reference와 새 사용자 입력을 전달하고 Project EFSM이 current authority를 다시 resolve한다.

## Frontend FSM 경계

`interface_fsm.py`에서 Backend import를 제거했다.

Frontend FSM은 다음만 소유한다.

- `selectedSlotId`
- lifecycle
- workspace
- overlay
- asset selection/path reference
- graph-object selection/index
- direction/revision/error

Backend identity validity가 필요한 `SELECT_SLOT`, `SELECT_ASSET`, `SELECT_GRAPH_OBJECT`는 Application boundary가 Backend에서 검증한 `FrontendValidatedInput`을 전달한다.

overlay, Escape, lifecycle처럼 Backend reference가 필요 없는 event는 Backend query를 만들지 않고 Frontend-only accepted input으로 전달한다.

Project mutation 뒤 Frontend FSM은 `activeProject`를 다시 읽지 않는다. Application boundary가 `ProjectMutationResult`와 current Frontend id/path/index reference를 Backend에 전달해 `FrontendReconciliationInput`을 만들고, Frontend FSM은 그 input만 소비한다.

`InterfaceStateMachine.readState()`는 Application boundary와 renderer가 사용할 Frontend runtime projection만 반환하며 persistent project authority가 아니다.

## SELECT_SLOT과 pending content type

기존 구현의 `SELECT_SLOT`에는 UI selection 외에 `pendingSlotContentType`이 지정된 경우 선택 완료 후 empty slot의 contentType을 바꾸는 조건부 persistent 동작이 있었다.

r24는 이 의미를 삭제하거나 Frontend FSM 내부에 숨기지 않는다.

`dispatchSlotSelection(slotId, pendingContentType)`의 순서는 다음으로 확정했다.

1. Backend에서 slot reference를 검증한다.
2. accepted SELECT_SLOT을 Frontend FSM에 보내 selection toggle/workspace를 먼저 확정한다.
3. toggle 결과 selectedSlotId가 none이면 persistent mutation을 하지 않는다.
4. pendingContentType이 있으면 final selectedSlotId에 대해 Backend `slot-selection-context` query를 수행한다.
5. selected slot이 empty이고 현재 contentType과 pendingContentType이 다를 때만 별도 `SLOT_TYPE_CHANGED` Project command를 실행한다.
6. 이 Project command는 일반 Project EFSM candidate/validation/commit 경로를 사용한다.

따라서 Frontend FSM은 Project EFSM을 호출하지 않으면서 기존 조건부 persistent 의미도 보존한다.

## Lifecycle

r23의 `InterfaceStateMachine.run(lifecycle, event, task)`는 Frontend FSM이 Backend operation callback을 실행할 수 있는 구조였다.

r24에서는 이 task 실행 책임을 Application boundary로 이동했다.

```text
Application boundary
→ Frontend LIFECYCLE_START
→ Backend command/query 또는 pure export task
→ success: Frontend LIFECYCLE_COMPLETE
→ failure: Frontend LIFECYCLE_FAILED
```

Frontend FSM은 Backend task callback을 실행하지 않고 Backend rollback 규칙도 만들지 않는다.

## Renderer

`renderer_runtime.py`는 Frontend responsibility로 확정했고 Backend import를 제거했다.

renderer 입력은 다음 세 종류다.

- Application boundary가 제공한 immutable Backend `projectProjection`
- final Frontend `interfaceState`
- FastFigureApi/Application boundary가 제공하는 `frontendActions`

`renderDashboard`, `applySlotStyle`, `resolveSelectedChart`, `updateGraphView`, startup은 supplied projection을 사용한다.

slot selection은 renderer가 interfaceFSM이나 Backend를 직접 호출하지 않고 `frontendActions.slots.select`를 사용한다.

slot swap은 `frontendActions.slots.swap` public persistent mutation API를 사용한다.

external file drop target 준비도 public `slots.prepareFileDrop` 경계를 사용한다.

renderer는 DOM 또는 Plotly state에서 ProjectObject를 역갱신하지 않고, read-time normalization이 필요해도 supplied projection copy만 변경한다.

## Graph와 layout wrapper의 explicit reference

Frontend selection을 Backend domain function이 암묵적으로 읽지 않도록 public graph wrapper의 입력을 구체화했다.

- `graphEditorAdd(slotId, csvId)`
- `graphEditorCommit(chartId, objects, index)`
- `graphEditorObjectValues(chartId, index, values)`
- `graphEditorSetEditable(slotId, chartId, editable)`
- `graphEditorUpdateLayout(slotId, chartId, values)`
- `graphEditorApplyPalette(chartId, colors)`
- `importSelectedGraphFile(slotId, file)`

layout/image/label wrapper도 같은 원칙을 적용했다.

- `readImageEditorApi(slotId)`
- `applyImageSettingsFromValues(slotId, values)`
- `readLabelsApiState(slotId)`

이 id/reference는 Frontend state의 복사본을 Backend authority로 쓰는 것이 아니다. Application boundary가 현재 Frontend reference를 operation input으로 전달하고 Backend가 current authority에서 다시 resolve한다.

## 물리 파일의 혼합 책임

`assets_files.py`, `graphs.py`, `layout_annotations_export.py`, `api_ui.py`를 이번 Source Script 단계에서 물리적으로 분리하지 않았다.

선택 이유:

- 기존 함수와 domain 의미가 같은 파일 안에 이미 정리되어 있어 물리 파일 분리 자체가 Backend/Frontend 권위 문제를 해결하지 않는다.
- Source Script 정책은 physical file hierarchy와 logical Module decomposition hierarchy를 구분한다.
- 이번 요구는 cross-layer direct access를 제거하고 logical owner를 추적 가능하게 만드는 것이며, 새 파일 구조는 대상 언어 구현 필요성이 확인될 때 결정할 수 있다.
- 지금 물리 파일을 의미 단위로 강제 분할하면 plan-016에 필요하지 않은 파일 재배치와 lineage 변화가 추가된다.

따라서 각 혼합 파일에 logical responsibility와 boundary rule을 명시하고, 하위 단계에서 그 owner를 보존하도록 했다.

## 닫힘 판정 — 논리적 완결성

확인:

- Backend persistent authority와 mutation controller가 명시되어 있다.
- Backend read/query, Frontend reference validation, post-commit reconciliation query의 input/output 방향이 명시되어 있다.
- Frontend FSM은 Backend state를 직접 읽지 않고 validated/reconciliation input만 소비한다.
- SELECT_SLOT의 conditional Project mutation이 별도 Application orchestration으로 보존되어 있다.
- lifecycle start/task/success/failure 순서가 Application boundary에 정의되어 있다.
- commit failure 시 success reconciliation과 renderer commit projection을 수행하지 않는 규칙이 유지된다.
- renderer input과 persistent mutation callback 경계가 정의되어 있다.
- mixed physical file의 logical owner가 정의되어 있다.
- Portable build의 system-level 위치가 정의되어 있다.
- read normalization이 live authority를 변경하지 않는 규칙이 명시되어 있다.

판정: plan-016의 Source Script architecture 범위에서 입력 → query/command → commit/result → Frontend reconciliation → renderer까지 의미가 끊기지 않는다.

## 닫힘 판정 — 프로젝트 목적 부합

확인:

- FFPX schema와 ProjectObject field 의미를 변경하지 않았다.
- local browser processing과 portable single-file 목적을 변경하지 않았다.
- 새로운 network/server dependency를 추가하지 않았다.
- UI-only state를 FFPX persistent state로 승격하지 않았다.
- `appearance.uiPalette`와 기존 persistent project properties는 Backend ProjectObject에 그대로 남는다.
- 기존 candidate-first/one-commit mutation contract와 chart/reference invariant를 유지한다.

판정: Backend/Frontend 경계 강화는 기존 Fast Figure 기능 의미를 축소하지 않고 plan-016의 구조 요구를 충족한다.

## 닫힘 판정 — 중복과 통합·확장

검토한 중복 후보:

- 새 project store 또는 Frontend ProjectObject mirror: 기각. `activeProject` 하나를 계속 authority로 사용한다.
- 새 command bus/event bus: 기각. 기존 FastFigureApi, application_fsm orchestration, ProjectMutationResult를 확장한다.
- 새로운 combined FSM: 기각. Application boundary는 state authority가 아니라 adapter/orchestrator다.
- read를 모두 Project EFSM command로 처리: 기각. 읽기와 mutation을 분리하고 Backend read provider를 사용한다.
- Backend/Frontend마다 별도 asset/graph/layout model 복제: 기각. 기존 domain model에서 query projection만 만든다.
- 물리 파일 즉시 전면 분할: 기각. logical ownership을 먼저 보존하고 불필요한 파일 재배치를 만들지 않는다.

판정: 같은 의미의 새 authority나 중복 처리 계층을 추가하지 않았다.

## 직접 dependency 감사

r24 저장 후 확인한 Source Script 관계:

- `interface_fsm.py`: `project_state` / `project_efsm` import 없음.
- `renderer_runtime.py`: `project_state` / `project_efsm` import 없음.
- `api_ui.py`: `project_state` / `project_efsm` import 없음.
- `layout_annotations_export.py`: `interface_fsm.selectedSlotId` import 없음.
- `application_fsm.py`: Backend read/Project EFSM과 Frontend FSM 양쪽을 연결하는 공식 Application boundary로서 양쪽 명세를 참조한다.
- `graphs.py`와 `layout_annotations_export.py`의 selected-state 언급은 direct Frontend state read가 아니라 boundary rule에서 금지/explicit input 의미를 설명하는 용도다.

## fingerprint

Source Script r24 의미 파일은 `sourcescript/**/*.py` 전체 11개다.

fingerprint:

`sha256:f4717433f5dd4111d9a2644b7cc5d66a9abb25fb477892eafde23d9b964ac5d3`

`portable_build.py` 내용은 이번 revision에서 변경하지 않았지만 전체 Source Script fingerprint에는 포함했다.

## 하위 계층 전파

r24가 닫히면 기존 하위 계층은 새 hierarchy와 API/Adapter contract를 반영하지 못하므로 stale이다.

- pseudocode r10: stale.
- verification-model r24: stale. 기존 TLC pending은 r24 Source Script lineage의 검증 결과가 아니다.
- source-code r29: stale.

다음 단계는 r24 전체 의미를 PlusCal pseudocode로 직접 번역하는 것이다.

특히 pseudocode에서 생략하면 안 되는 항목:

- Backend / Application boundary / Frontend / Portable build hierarchy.
- Backend query와 Project mutation의 분리.
- validated Frontend event.
- SELECT_SLOT → optional SLOT_TYPE_CHANGED ordering.
- Project commit success/failure → reconciliation ordering.
- Application-owned lifecycle task.
- renderer projection input.
- explicit slot/chart/csv reference flow.
- read projection의 one-way 성질.

verification model은 새 pseudocode가 current가 된 뒤 그 pseudocode에서 필요한 contract/invariant 범위를 파생한다. 현재 Fast Figure AGENT.md가 TLC gate를 요구하므로 새 Source Code lineage를 current로 닫기 전에 관련 verification model과 TLC passed가 필요하다.

## 최종 판정

논리적 완결성, 프로젝트 목적 부합, 중복/통합 검토의 세 닫힘 항목에 미해결 설계 항목이 없다.

따라서 Source Script r24를 **closed**로 판정한다.
