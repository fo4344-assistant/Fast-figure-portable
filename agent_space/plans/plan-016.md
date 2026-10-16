# 계획 016 — Backend Project EFSM과 Frontend FSM의 API/Adapter 경계 분리

## 0. 계획의 지위와 이전 계획과의 관계

이 계획은 사용자가 새로 확정한 다음 설계 요구를 반영한다.

- 코어 부분에 해당하는 Project EFSM은 Backend 설계로 취급한다.
- Frontend FSM은 이름 그대로 Frontend 설계로 취급한다.
- Backend와 Frontend는 서로의 내부 상태기계, authoritative state, domain helper를 직접 호출하거나 직접 참조하지 않는다.
- 두 계층 사이의 읽기, 명령, 결과 전달은 API 또는 Adapter 경계를 통해서만 수행한다.
- Frontend에서 ProjectObject의 persistent mutation이 필요한 경우 Frontend FSM 관여 여부와 무관하게 Backend의 공개 command/API 또는 cross-layer adapter를 통한다.
- Backend에서 Frontend runtime state를 갱신해야 하는 경우 Backend가 Frontend FSM을 직접 호출하지 않고 mutation result 또는 read projection을 API/Adapter 경계로 반환하고, Frontend 측에서 자신의 상태를 전이한다.

이 요구는 완료 기록이 붙어 있는 plan-015의 기존 책임 분리보다 더 강한 계층 경계를 정의한다. plan-015는 당시 구조의 실행 이력으로 남기고 덮어쓰지 않는다. plan-016은 plan-015에서 허용했던 다음 관계를 다시 연다.

- interface_fsm.py가 activeProject를 직접 읽어 selection/reference validity를 판정하는 구조.
- renderer_runtime.py가 activeProject를 직접 읽어 renderer projection을 만드는 구조.
- api_ui.py가 activeProject, interfaceFSM, selectedSlotId를 직접 참조하는 구조.
- Frontend event handler가 Project EFSM의 command interface를 직접 호출할 수 있다는 해석.
- InterfaceStateMachine.run이 persistent task callback을 받아 실행할 수 있다는 구조.
- Project EFSM, Interface FSM, renderer, API가 system.py 아래의 direct sibling responsibility로만 정의되어 Backend/Frontend 계층 자체가 Source Script의 의미 구조로 나타나지 않는 구조.

이 계획은 기존 기능을 요약하거나 축소하는 계획이 아니다. 현재 Source Script와 정책에서 확인한 책임, ProjectObject mutation contract, Frontend runtime state, renderer projection, FFPX persistence, lifecycle, selection reconciliation, verification lineage를 모두 보존하면서 Backend와 Frontend 사이의 공식 경계만 명시적으로 재구성한다.

---

## 1. 적용 정책과 정책 판정

이 계획은 실제 Fast Figure 저장소의 다음 정책 원천을 기준으로 한다.

- agent_space/AGENT.md
- agent_space/policies/policies.md
- agent_space/policies/source-script-policy.md

source-script-policy.md는 현재 v0.2.6이며 Source Script → PlusCal pseudocode → 선택적 verification model → Source Code의 권위 관계, authoritative state 변경 경로, Single Source of Truth, 참조 무결성, Module decomposition hierarchy, Source Script 닫힘, pseudocode 직접 번역, verification decomposition, 대상 언어 구현 원칙을 정의한다.

이 계획에 직접 적용되는 정책 판정은 다음과 같다.

### 1.1 Source Script가 계층 경계의 상위 원천이다

Backend, Frontend, API/Adapter boundary가 프로젝트의 의미적 책임 경계라면 Source Code에서 먼저 파일이나 class를 나누어 구현할 수 없다. Source Script에서 Module decomposition hierarchy와 각 책임의 의미를 먼저 정의한 뒤 PlusCal pseudocode와 Source Code에 그대로 전파해야 한다.

따라서 이번 작업은 fast-figure.js 또는 fast-figure-ui.js의 import/call 관계부터 수정하지 않는다.

### 1.2 authoritative state mutation은 소유 책임과 변경 규칙을 우회할 수 없다

ProjectObject persistent state의 authority는 activeProject이며, mutation은 Project EFSM의 validation/commit contract로 수렴해야 한다.

Frontend component, Frontend FSM, renderer가 activeProject 내부 field를 직접 수정하거나 Project EFSM을 우회하는 별도 mutation path를 만들 수 없다.

### 1.3 읽기와 mutation은 같은 경로일 필요가 없지만 계층 경계는 보존한다

source-script-policy.md는 읽기와 계산까지 mutation 경로와 동일하게 강제할 필요는 없다고 명시한다.

따라서 Frontend read request가 Project EFSM.send를 통과할 필요는 없다.

그러나 사용자가 Backend와 Frontend 통신을 API/Adapter로만 수행하도록 새 구조를 확정했으므로 Frontend가 activeProject 또는 Backend domain helper를 직접 읽는 것도 허용하지 않는다.

Backend read API 또는 read adapter가 current authoritative state에서 projection을 계산해 Frontend에 반환한다.

### 1.4 Backend와 Frontend의 공식 interface 경계를 Source Code에서 우회할 수 없다

정책 자체는 일반적으로 frontend와 backend라는 고정 architecture를 강제하지 않는다. 그러나 이 계획에서 Backend/Frontend/API-Adapter 구조가 Source Script에 확정되면 하위 PlusCal과 Source Code는 이 interface 경계를 제거하거나 우회할 수 없다.

따라서 다음 경로는 금지한다.

    Frontend component → projectEFSM.send
    Frontend FSM → projectEFSM.send
    Frontend component → activeProject
    Frontend FSM → activeProject
    renderer → activeProject
    Project EFSM → Frontend FSM
    Project EFSM → DOM/Mantine renderer

### 1.5 새 중복 API 계층을 만들지 않는다

현재 FastFigureApi, application_fsm.py의 dispatchProjectCommand / dispatchInterfaceEvent, ProjectMutationResult가 이미 존재한다.

새 설계는 이 기존 구조를 조사해 확장 또는 재배치하는 것을 우선한다. 같은 의미의 새 command bus, 별도 project store, 별도 frontend project model, 별도 event broker를 구현 편의를 위해 추가하지 않는다.

### 1.6 상태 기반 검증은 선택적이다

Source Script와 PlusCal pseudocode는 필수 개발 계층이며, verification-model/TLC는 필요한 범위에서 선택적으로 수행한다. 검증의 실행 여부 또는 TLC 통과 여부는 Plan 016의 Source Code 구현과 `current` 판정을 막지 않는다.

실제로 수행한 검증의 결과와 검토 기록은 사실대로 유지한다. 검증을 수행하지 않았거나 완료되지 않은 경우 이를 성공으로 표시하지 않는다. 이 변경은 plan-015의 과거 실행 기록을 수정하지 않는다.

---

## 2. 현재 Source Script에서 확인된 상태와 경계

현재 system.py는 다음 Source Script module을 system의 direct sibling responsibility로 정의한다.

- project_state.py
- project_efsm.py
- interface_fsm.py
- application_fsm.py
- assets_files.py
- graphs.py
- layout_annotations_export.py
- api_ui.py
- renderer_runtime.py
- portable_build.py

현재 SOURCE_SCRIPT_DECOMPOSITION_RULE은 이 sibling 사이의 import/call 관계를 의미적 부모-자식 관계로 해석하지 않도록 한다.

현재 AUTHORITATIVE_STATE_RULE은 다음 의미를 가진다.

- activeProject의 ProjectObject state가 persistent project authority다.
- UI는 FastFigureApi 또는 interfaceFSM event를 사용한다.
- persistent mutation은 application orchestration을 통해 projectEFSM으로 전달한다.
- renderer snapshot과 React local state는 project authority가 아니다.

현재 project_efsm.py는 persistent mutation을 다음 contract로 정의한다.

- command input id/path/reference를 current activeProject에서 다시 resolve한다.
- writable scope와 precondition을 확인한다.
- candidate ProjectObject 또는 candidate patch를 만든다.
- local rule, VFS/reference integrity, chart ownership, whole-project invariant를 검증한다.
- 성공 candidate만 activeProject authority에 한 번 commit한다.
- 실패하면 기존 activeProject authority를 유지한다.
- 실제 mutation 사실을 ProjectMutationResult로 반환한다.
- interface state와 renderer를 직접 변경하지 않는다.

현재 interface_fsm.py는 다음 runtime state를 소유한다.

- selectedSlotId
- lifecycle
- workspace
- overlay
- assetSelection
- assetPath
- graphObject
- graphObjectIndex
- direction
- revision
- error

그러나 interface_fsm.py는 activeProject를 직접 import하며 target validity와 reconciliation에서 current activeProject를 직접 read-only resolve한다.

현재 application_fsm.py는 다음 causal order를 정의한다.

    interface intent
    → explicit project command
    → projectEFSM validate/commit
    → ProjectMutationResult
    → interfaceFSM reconcile
    → renderer projection

현재 api_ui.py는 FastFigureApi를 frontend 변경 경계로 정의하지만 동시에 activeProject, interfaceFSM, selectedSlotId를 직접 import한다.

현재 renderer_runtime.py도 activeProject, interfaceFSM, selectedSlotId를 직접 import하고 project와 interface state를 읽어 DOM/Plotly projection을 만든다.

이 직접 dependency들은 기존 책임 분리에서는 read-only access로 허용되었지만, 새 Backend–Frontend 계층 기준에서는 cross-layer boundary를 우회한다.

---

## 3. 목표 Module decomposition hierarchy

새 요구를 Source Script에 다음 의미 구조로 정의한다.

    Fast Figure system
    ├─ Backend
    │  ├─ authoritative project state
    │  ├─ Project EFSM
    │  ├─ persistent domain operations
    │  ├─ project reference/invariant validation
    │  └─ FFPX/FFSX/assets persistence
    │
    ├─ Application boundary
    │  ├─ public command API
    │  ├─ public query/read API
    │  ├─ Backend–Frontend adapter
    │  └─ cross-layer orchestration
    │
    └─ Frontend
       ├─ Frontend FSM
       ├─ Mantine/React UI
       ├─ renderer
       ├─ Frontend telemetry/runtime projection
       └─ component-local interaction state

이 구조에서 Backend, Application boundary, Frontend는 서로 다른 direct child responsibility다.

Backend 내부 child는 persistent domain meaning에 포함된다.

Frontend 내부 child는 사용자 상호작용과 화면 projection meaning에 포함된다.

Application boundary는 Backend와 Frontend 중 어느 한쪽의 내부 구현 세부가 아니라 두 계층 사이에서 허용되는 command/query/result contract와 causal ordering을 소유한다.

이 hierarchy를 물리 파일 구조와 동일시하지 않는다. 기존 파일을 유지하거나 한 논리 module을 여러 물리 파일로 구현할 수 있지만, Source Script와 PlusCal과 Source Code 사이의 의미적 hierarchy는 동일하게 추적 가능해야 한다.

---

## 4. Backend 책임

Backend는 FFPX에 저장되고 복원되는 ProjectObject의 영속 상태와 그 상태를 계산·검증·변경하는 domain 책임을 소유한다.

Backend authoritative state는 activeProject다.

Backend는 다음 의미를 소유한다.

- ProjectObject schema와 normalization.
- project metadata.
- grid와 slot persistent layout.
- slot-local chart/image/contentType/imageSettings/caption.
- CSV asset.
- image asset.
- chart model과 graph objects.
- project VFS.
- global labels와 captions.
- persistent appearance.uiPalette.
- persistent export settings.
- next-id sequence.
- reference relations.
- chart ownership invariant.
- VFS/path invariant.
- FFPX import/export.
- FFSX import/export에서 persistent project candidate와 관계되는 domain 처리.
- CSV/image import candidate.
- project command validation.
- candidate 생성.
- commit.
- mutation result 산출.
- Frontend에 제공할 read projection 계산.

Project EFSM은 별도의 persistent project state copy를 소유하지 않는다.

Project EFSM은 activeProject의 공식 mutation controller이며 ProjectObject의 authority 자체와 중복되는 별도 state source가 아니다.

Backend는 Frontend FSM state를 쓰지 않는다.

Backend는 overlay, current UI selection, Modal draft, pointer state, DOM, React state를 읽거나 수정하지 않는다.

---

## 5. Frontend 책임

Frontend는 실행 세션에서 사용자 인터페이스와 상호작용을 제어하는 상태를 소유한다.

Frontend FSM이 소유할 수 있는 state는 다음과 같다.

- current selected slot reference.
- current asset selection kind/path reference.
- current graph-object selection reference/index.
- current workspace.
- overlay state.
- frontend lifecycle presentation state.
- frontend error state.
- frontend subscriber revision.
- cross-component UI runtime state로 승격할 필요가 있는 interaction state.

다음 state는 component lifetime에만 필요한 경우 Frontend FSM으로 승격하지 않는다.

- asset collision Modal model과 resolver.
- confirmation target.
- new-folder name draft.
- palette Apply 전 draft.
- layout Modal 내부 slot-selection Set.
- print form inputs.
- caption editor target.
- sidebar width/collapsed/drag state.
- label/overlay resize pointer state.
- settings overlay local height.

Frontend FSM은 ProjectObject의 persistent field를 소유하지 않는다.

Frontend FSM은 ProjectObject의 mutable object copy를 장기 상태로 저장하지 않는다.

Frontend selection은 Backend object의 reference 또는 identity를 나타낼 수 있지만, 그 reference가 가리키는 실제 Backend state의 유효성은 Backend query/validation boundary를 통해 확인한다.

---

## 6. Application boundary의 책임

Application boundary는 Backend와 Frontend 사이의 공식 통신 경계다.

이 경계는 별도의 authoritative project state 또는 별도의 authoritative Frontend state를 소유하지 않는다.

Application boundary의 책임은 다음과 같다.

- Frontend의 persistent mutation intent를 Backend command input으로 변환.
- Backend query 요청을 Backend read operation으로 전달.
- Backend command result를 Frontend reconciliation input으로 변환.
- Backend read projection을 Frontend renderer/component input으로 전달.
- persistent operation의 lifecycle sequencing.
- project commit 이후 Frontend reconciliation과 renderer invalidation의 causal ordering.
- error/cancel result의 cross-layer 전달.
- command/query contract의 validation 가능한 shape 유지.
- ProjectMutationResult와 read projection을 장기 authority로 저장하지 않음.

현재 application_fsm.py의 orchestration responsibility와 api_ui.py의 FastFigureApi boundary를 이 책임에 맞게 재검토한다.

새로운 중복 facade를 추가하는 대신 FastFigureApi와 기존 dispatch 계열을 최소 변경으로 Application boundary의 공식 contract로 정리하는 방향을 우선한다.

---

## 7. Frontend → Backend persistent mutation

Frontend component 또는 Frontend FSM은 projectEFSM.send를 직접 호출하지 않는다.

Frontend event가 UI state transition을 필요로 하지 않더라도 이 규칙은 동일하다.

허용 경로는 다음과 같다.

    Frontend user event
    → Frontend component 또는 Frontend FSM이 mutation intent 구성
    → public mutation API / application adapter
    → Backend Project EFSM command
    → current activeProject에서 reference 재해결
    → candidate
    → validation
    → commit
    → ProjectMutationResult

기존 계획에서 작성했던 다음 해석은 폐기한다.

    "Frontend FSM이 관여해야 하는 UI 상태 전이가 없다면 이벤트 처리기가 Project EFSM의 명령 인터페이스를 직접 호출할 수 있다."

Frontend FSM을 거치지 않는 것과 Backend API/Adapter를 거치지 않는 것은 같은 의미가 아니다.

UI-only FSM transition이 불필요한 command는 다음과 같이 처리한다.

    Button event
    → FastFigureApi mutation method
    → Application adapter
    → Project EFSM

다음은 허용하지 않는다.

    Button event
    → projectEFSM.send

    component event
    → direct activeProject mutation

---

## 8. Frontend → Backend query/read

Frontend가 project data를 읽어야 하는 경우도 Backend 내부 state를 직접 import하지 않는다.

허용 경로는 다음과 같다.

    Frontend
    → public read API / read adapter
    → current Backend authoritative state
    → immutable read projection 또는 resolved result
    → Frontend

read operation은 Project EFSM mutation state machine을 통과할 필요가 없다.

read API는 activeProject 또는 공식 Backend read helper에서 현재 값을 매번 계산한다.

Frontend가 받은 projection은 화면 표시와 해당 interaction의 입력 보조로 사용할 수 있다.

그러나 projection 자체를 장기 project authority로 사용하지 않는다.

projection에서 얻은 mutable object를 그대로 Backend candidate로 되돌려 보내지 않는다.

persistent mutation command는 필요한 identity/reference와 사용자 입력을 전달하고 Backend가 current authoritative state에서 다시 resolve하여 candidate를 만든다.

---

## 9. Backend → Frontend mutation result

Project EFSM은 Frontend FSM을 직접 호출하지 않는다.

Project EFSM의 출력은 ProjectMutationResult다.

개념적 흐름은 다음과 같다.

    Project EFSM
    → ProjectMutationResult
    → Application adapter
    → Frontend reconciliation event/input
    → Frontend FSM transition
    → renderer invalidation/projection

ProjectMutationResult는 한 command의 immutable transient result다.

ProjectMutationResult에는 필요한 경우 다음 종류의 정보를 포함한다.

- event/command identity.
- commit 성공 여부.
- changed ids/path/owner.
- removed graph reference count.
- reset image-slot count.
- identity/path 이동 결과.
- selection reconciliation에 필요한 result.
- renderer projection effect 판단에 필요한 실제 mutation result.

구체 field 이름은 기존 project_efsm.py의 ProjectMutationResult 구조를 우선 재사용한다.

Frontend가 Backend result를 보고 별도의 domain mutation 규칙을 재구현하지 않는다.

---

## 10. Frontend reconciliation

Backend commit 뒤 모든 Frontend state를 초기화하지 않는다.

Application adapter는 mutation result와 필요한 Backend validation/query 결과를 사용해 영향을 받은 Frontend reference만 reconciliation 대상으로 만든다.

예:

- 선택 중인 graph object가 삭제되었으면 graph-object selection을 clear한다.
- 선택 중인 asset path가 이동했으면 mutation result의 identity/path 결과에 따라 reference를 갱신하거나 clear한다.
- 선택 중인 slot이 여전히 존재하고 유효하면 selection을 유지한다.
- unrelated project field 변경은 selection을 불필요하게 초기화하지 않는다.

Frontend reconciliation은 Backend mutation을 다시 호출하지 않는다.

다음 feedback loop를 만들지 않는다.

    Backend mutation
    → Frontend reconciliation
    → hidden Backend mutation
    → Frontend reconciliation

reconciliation은 Frontend state만 변경한다.

---

## 11. Interface FSM의 Backend 직접 참조 제거

현재 interface_fsm.py는 activeProject를 직접 import한다.

현재 INTERFACE_SELECTION_INVARIANTS는 selectedSlotId, assetPath, graphObjectIndex가 current activeProject 또는 projectVfs에서 resolve되어야 한다고 정의한다.

새 구조에서는 invariant의 의미는 유지하되 Frontend FSM이 Backend internal state를 직접 읽어 검증하지 않는다.

Frontend intent가 Backend reference validity를 필요로 하는 경우 Application boundary가 Backend validation/query를 먼저 수행하거나 Backend가 validated projection/result를 반환한다.

예:

    Frontend intent: SELECT_SLOT(slotId)
    → Application boundary
    → Backend query: slotId가 current visible slot인지 확인
    → validated selection input
    → Frontend FSM SELECT_SLOT transition

또는 Backend mutation 뒤 reconciliation이면:

    ProjectMutationResult
    → Application boundary
    → 필요한 Backend reference query
    → Frontend reconciliation input
    → Frontend FSM

Frontend FSM은 제공된 validated input과 자신의 current runtime state만으로 transition을 수행한다.

interface_fsm.py에서 activeProject import를 유지하지 않는다.

---

## 12. Frontend lifecycle과 persistent task 실행 분리

현재 InterfaceStateMachine.run(lifecycle, event, task)는 ready/busy/error sequencing을 소유하며 persistent task가 application orchestration을 사용한다고 설명한다.

Frontend FSM이 Backend task callback을 직접 받아 실행하면 Frontend가 Backend operation 실행 수명을 소유하는 구조가 된다.

새 계층에서는 persistent operation의 lifecycle sequencing을 Application boundary가 조정한다.

개념:

    Application adapter
    → Frontend FSM: lifecycle start
    → Backend API: persistent operation
    → success:
         Frontend FSM: lifecycle complete
         result reconciliation
    → failure:
         Frontend FSM: lifecycle failed

Frontend FSM은 Backend function/task callback을 직접 실행하지 않는다.

Backend는 Frontend lifecycle field를 직접 변경하지 않는다.

UI-only asynchronous operation이 별도로 존재하면 그 operation이 Backend boundary를 넘는지 여부에 따라 Frontend-local lifecycle과 cross-layer lifecycle을 구분한다.

---

## 13. Renderer의 Backend 직접 참조 제거

현재 renderer_runtime.py는 activeProject, interfaceFSM, selectedSlotId를 직접 import한다.

새 구조에서 renderer는 Frontend 책임에 포함한다.

따라서 renderer가 Backend data를 필요로 할 때 Backend read API 또는 Application adapter가 제공한 read projection을 사용한다.

허용:

    Backend authoritative state
    → read API / adapter
    → renderer projection input
    → DOM/Plotly

Frontend FSM state는 같은 Frontend 계층이므로 renderer가 공식 Frontend read path로 읽을 수 있다.

금지:

    renderer
    → activeProject

    renderer
    → projectVfs Backend helper

    renderer
    → Project EFSM

renderer input projection은 read-only이며 ProjectObject mutation source로 역사용하지 않는다.

renderer가 DOM 또는 Plotly state에서 Backend mutation을 추론하여 commit하지 않는다.

---

## 14. Renderer invalidation과 기존 causal ordering 보존

현재 application_fsm.py는 project commit 뒤 interface reconciliation을 수행하고 그 다음 renderer projection을 수행한다.

이 ordering은 유지한다.

    Backend command
    → Project EFSM validation/commit
    → ProjectMutationResult
    → Frontend reconciliation
    → final Frontend state
    → renderer invalidation/projection

project command가 실패하면 commit success를 전제로 한 Frontend reconciliation과 commit projection을 실행하지 않는다.

renderer는 command를 재귀 호출하지 않는다.

ProjectMutationResult에서 FULL_DASHBOARD, TARGETED_PROJECTION, NONE 같은 projection effect를 결정할 수 있는 정보가 이미 있다면 기존 result-driven invalidation 의미를 유지한다.

단, renderer가 projection을 만들기 위해 activeProject를 직접 읽는 부분은 API/Adapter read projection으로 변경한다.

---

## 15. FastFigureApi 재정의 방향

현재 api_ui.py는 FastFigureApi boundary와 Mantine frontend responsibilities를 한 Source Script module에서 함께 정의한다.

현재 FastFigureApi는 project, slots, images, assets, graphs, print, captions, labels, appearance, layout namespace를 갖는다.

이 공개 surface는 버리지 않는다.

다음 원칙으로 재검토한다.

### 15.1 public mutation API

persistent ProjectObject mutation method는 Application boundary를 통해 Project EFSM command로 수렴한다.

현재 PUBLIC_PROJECT_MUTATION_ROUTES의 command mapping을 보존한다.

같은 owner를 변경하는 여러 UI entry point가 별도 Backend mutation semantics를 만들지 않는다.

### 15.2 public read API

readName, readSelected, readEditor, readTree, readData, readLayout, readPalette, readSettings, readGlobal, readSlot, readState 등 read method가 Backend 내부 state를 current authority에서 읽어 immutable projection으로 반환하도록 경계를 명시한다.

Frontend component가 project_state.py helper를 직접 import하는 대안으로 사용한다.

### 15.3 runtime Frontend API/event

slots.select, assets.selectDirectory/selectCsv/selectImage, graphs.selectCsv/selectObject, overlay event 등 Frontend runtime mutation은 Frontend FSM 또는 Frontend-local state로 전달한다.

Backend persistent command와 같은 path로 억지로 통합하지 않는다.

### 15.4 api_ui.py 물리 파일 분리 여부

API boundary와 Mantine frontend가 의미적으로 다른 responsibility이므로 Source Script hierarchy에서 먼저 두 의미를 구분한다.

그 뒤 물리 파일을 나눌지, 현재 api_ui.py 안에서 두 논리 section을 유지할지는 Source Code/파일 배치 요구를 확인해 결정한다.

Source Script hierarchy에 없는 새 logical module을 Source Code 파일 분할만으로 만들지 않는다.

---

## 16. Project selection/reference contract

Frontend selection은 Backend persistent state와 별개의 runtime state다.

그러나 selection이 Backend object를 가리키는 경우 reference relation은 추적 가능해야 한다.

다음 원칙을 적용한다.

- selectedSlotId는 Backend slot identity reference다.
- selected asset은 kind/path 또는 Backend가 안정적으로 resolve할 수 있는 identity reference다.
- selected graph object가 index로 표현되면 해당 index가 어느 selected chart context의 index인지 contract에 포함한다.
- Backend mutation 전에 reference를 current activeProject에서 다시 resolve한다.
- stale read projection의 object reference를 mutation authority처럼 사용하지 않는다.
- reference resolve 실패 시 Backend mutation을 수행하지 않는다.
- resolve 실패가 Frontend selection 자체를 자동으로 지울지 여부는 해당 Frontend event/reconciliation 의미에서 별도로 정의한다.
- Backend mutation 성공 뒤 reference identity가 이동/삭제되면 ProjectMutationResult와 Backend query를 통해 Frontend state를 reconciliation한다.

새 persistent ID를 필요성 확인 없이 추가하지 않는다.

graph object index가 실제 문제를 일으키는지 먼저 현재 mutation/reorder semantics와 함께 검토한다.

---

## 17. FFPX persistence 경계

FFPX serialization/deserialization은 Backend 책임이다.

FFPX는 complete persistent project state를 표현한다.

Frontend FSM의 다음 상태는 FFPX에 직렬화하지 않는다.

- selectedSlotId.
- asset selection.
- graph-object selection.
- overlay.
- Frontend workspace.
- Frontend lifecycle presentation.
- Frontend error projection.
- Modal draft.
- layout selection Set.
- pointer/drag state.
- navbar geometry state.
- collision resolver.
- overlay local height.

반대로 appearance.uiPalette처럼 UI 표시와 관련되어 있어도 ProjectObject에 영속되는 값은 Backend persistent state다.

Frontend는 read API를 통해 persistent palette projection을 받아 Mantine에 적용한다.

기존 FFPX schema와 저장 데이터의 의미는 이번 계층 분리를 이유로 임의 변경하지 않는다.

schema 변경이 실제로 필요하다는 사실이 발견되면 Source Script에서 별도 설계 문제로 먼저 다룬다.

---

## 18. Popup, overlay, selection의 Frontend 전용 관리

overlay open/close, selection toggle, component interaction은 Frontend FSM 또는 component-local state에서 처리한다.

팝업을 열거나 닫는 것만으로 Backend mutation이 발생하지 않는다.

팝업 진입 시 project 값을 표시해야 하면 public read API를 호출하여 projection을 받는다.

팝업 Apply가 persistent mutation이면:

    Frontend draft
    → public mutation API
    → Application adapter
    → Backend Project EFSM

팝업 Cancel/close는 apply되지 않은 Frontend draft를 버리며 Backend mutation을 발생시키지 않는다.

overlay close와 selection clear가 함께 일어나는 경우 그 관계는 Frontend FSM transition으로 명시한다.

DOM hidden input, native dialog open state, component local state를 overlay authority의 두 번째 source로 사용하지 않는다.

---

## 19. DOM, Mantine, React local state

DOM, Mantine component state, React local state는 Frontend 내부 projection 또는 component-local interaction state다.

다음 규칙을 유지한다.

- DOM은 ProjectObject authority가 아니다.
- DOM value를 project read source로 역사용하지 않는다.
- hidden input, synthetic .click(), legacy dialog, .value를 Backend bridge로 만들지 않는다.
- React local state에 ProjectObject persistent state를 장기 복제하지 않는다.
- Apply 전 form draft는 local state로 둘 수 있다.
- local draft가 persistent mutation input이 될 때 public mutation API로 전달한다.
- API가 mutation candidate를 만들 때 current Backend authority에서 reference와 existing value를 다시 resolve한다.
- local read projection을 다른 subsystem의 project authority로 배포하지 않는다.

이는 AGENT.md의 WIP 포팅 및 통합 규칙과 기존 UI_LOCAL_STATE_RULE을 유지한다.

---

## 20. 현재 직접 dependency 감사 범위

Source Script 수정 전에 다음 dependency를 정확히 추적한다.

### 20.1 Frontend → Backend 직접 접근

조사 대상:

- interface_fsm.py의 activeProject import.
- api_ui.py의 activeProject import.
- renderer_runtime.py의 activeProject import.
- fast-figure-ui.js에서 activeProject/projectObjects/projectVfs/getChart/getProjectCsv/getProjectImage/projectEFSM에 접근하는 코드.
- DOM event handler에서 projectEFSM.send 또는 Backend domain helper를 직접 호출하는 코드.
- React component에서 FastFigureApi를 우회하는 project mutation.
- renderer event handler에서 Project EFSM 또는 domain mutation을 직접 호출하는 코드.

### 20.2 Backend → Frontend 직접 접근

조사 대상:

- Project EFSM action이 interfaceFSM state를 변경하는 코드.
- Backend domain helper가 DOM/Mantine/React state를 변경하는 코드.
- project mutation action이 selectedSlotId, overlay, graphObject selection을 직접 변경하는 코드.
- Backend import/export code가 Frontend lifecycle을 직접 변경하는 코드.

### 20.3 Adapter-local copy와 projection

조사 대상:

- ProjectMutationResult가 command 범위를 넘어 저장되는지.
- renderer snapshot이 mutation input으로 재유입되는지.
- React projection이 API command input의 사실상 authority로 쓰이는지.
- read API projection이 별도 store에 장기 보존되는지.
- selected project object 전체 copy가 Frontend FSM state에 들어가는지.

감사 결과는 상태/값별 owner, producer, consumer, mutation 재유입 여부, 제거/유지 결론을 기록한다.

---

## 21. Source Script 변경 계획

Source Script 변경은 하나의 coherent ownership 변경으로 수행한다.

### 21.1 system.py

다음을 수정한다.

- Backend / Application boundary / Frontend 의미 hierarchy 정의.
- 기존 direct sibling decomposition rule을 새 hierarchy에 맞게 재작성.
- authoritative project state는 Backend에 속함을 명시.
- Frontend state는 Frontend에 속함을 명시.
- cross-layer read/write는 API/Adapter를 통과함을 명시.
- renderer는 Frontend에 속하고 Backend state를 직접 읽지 않음을 명시.
- RUNTIME_LOAD_ORDER의 물리 실행 순서와 의미 hierarchy를 혼동하지 않도록 분리.
- RESOLVED_REVIEW_ITEMS에서 기존 direct read를 전제로 한 판단이 있으면 새 boundary에 맞게 갱신.

### 21.2 project_state.py

persistent authority 의미는 유지한다.

필요한 read adapter/query contract가 어느 project read helper를 사용할지 명시한다.

activeProject 설명에서 "core command/API/FSM 경계"처럼 모호한 범위를 Backend mutation API와 Backend read API로 구분한다.

Frontend가 activeProject를 일반 read 원천으로 직접 사용하지 않는다는 경계를 추가한다.

### 21.3 project_efsm.py

현재 ProjectMutationResult와 mutation contract를 유지한다.

Project EFSM이 Backend 내부 controller임을 명시한다.

public project mutation route가 Application boundary에서 전달된 command로 들어옴을 명시한다.

Frontend direct call을 공식 route로 인정하지 않는다.

ProjectMutationResult가 Application adapter로 반환되고 Project EFSM이 interfaceFSM/renderer를 직접 호출하지 않는 규칙을 유지한다.

### 21.4 interface_fsm.py

activeProject import를 제거하는 의미 변경을 수행한다.

selection validity와 reconciliation에 필요한 Backend 정보는 input contract로 받도록 수정한다.

Frontend FSM은 Backend query를 직접 수행하지 않는다.

InterfaceStateMachine.run에서 Backend persistent task callback 실행 의미를 제거하거나 Frontend-only lifecycle helper로 한정한다.

persistent lifecycle orchestration은 Application boundary로 이동한다.

### 21.5 application_fsm.py

이 module의 의미를 두 FSM을 소유하는 상위 FSM이 아니라 cross-layer adapter/orchestrator로 명확히 한다.

dispatchProjectCommand는 public mutation adapter로 유지하거나 FastFigureApi의 내부 adapter로 정리한다.

dispatchInterfaceEvent는 Frontend-only event path로 유지한다.

Backend query/read adapter가 필요하면 같은 Application boundary responsibility 안에서 정의한다.

persistent lifecycle task sequencing을 여기서 수행한다.

Project EFSM success → Frontend reconciliation → renderer invalidation ordering을 유지한다.

### 21.6 api_ui.py

FastFigureApi public surface와 Mantine frontend ownership을 의미적으로 분리한다.

PUBLIC_API_METHODS의 read/mutation/runtime mutation 분류를 Backend command, Backend query, Frontend event로 명확히 표시한다.

API_BOUNDARY_RULE을 "Frontend는 Backend internal state/helper를 직접 사용하지 않고 모든 cross-layer communication을 API/Adapter로 수행한다"로 강화한다.

subscribeAppState는 Frontend FSM subscription으로 유지한다.

runLifecycleTask는 Backend task를 Frontend FSM에 위임하지 않고 Application boundary orchestration을 사용하도록 정의한다.

### 21.7 renderer_runtime.py

activeProject 직접 import를 제거하는 의미 변경을 수행한다.

renderer input은 Backend read projection과 Frontend final state로 구성한다.

renderDashboard, updateGraphView, resolveSelectedChart 같은 operation이 Backend internal helper를 직접 호출하지 않도록 read adapter contract를 정의한다.

slot click controller는 Frontend event와 public command API만 사용한다.

swapSlotContents 같은 persistent operation은 renderer module이 Project EFSM을 직접 호출하지 않고 public mutation API를 사용한다.

renderer invalidation은 ProjectMutationResult와 final Frontend state를 입력으로 사용한다.

---

## 22. PlusCal pseudocode 변경 계획

Source Script closure가 완료된 뒤 관련 PlusCal 전체를 직접 번역한다.

### 22.1 system.pcal

Backend / Application boundary / Frontend hierarchy와 cross-layer contract를 반영한다.

### 22.2 project_state.pcal

Backend persistent authority와 read projection source 의미를 반영한다.

### 22.3 project_efsm.pcal

Application boundary에서 전달된 command → candidate → validation → commit → result의 순서를 유지한다.

Frontend state mutation을 포함하지 않는다.

### 22.4 interface_fsm.pcal

Backend internal state read를 제거한다.

validated input 또는 reconciliation input을 받아 Frontend runtime state만 변경하도록 한다.

### 22.5 application_fsm.pcal

다음 sequencing을 직접 표현한다.

    Frontend mutation intent
    → Backend command
    → commit result
    → Frontend reconciliation
    → renderer projection

실패 branch를 명시한다.

    Backend rejection/failure
    → no persistent commit
    → no success reconciliation
    → Frontend lifecycle/error result

query/read flow도 mutation과 구분한다.

    Frontend query
    → Backend read
    → immutable projection
    → Frontend consumer

### 22.6 api_ui.pcal

FastFigureApi method를 Backend mutation, Backend query, Frontend runtime event로 분류하고 cross-layer direct access가 없도록 한다.

### 22.7 renderer_runtime.pcal

Backend read projection + final Frontend state → DOM/Plotly projection 흐름을 표현한다.

renderer에서 Backend mutation으로 되돌아가는 path를 두지 않는다.

---

## 23. Verification model 변경 계획

verification model은 필요한 범위에서 선택적으로 구성하고, TLC도 필요한 경우에만 실행한다. 장시간 검증이 미완료라는 이유로 Source Code 구현을 보류하지 않는다.

검증할 invariant와 transition property는 다음과 같다.

### 23.1 Project authority

- activeProject만 persistent project authority다.
- Frontend state가 project authority로 사용되지 않는다.
- ProjectMutationResult가 persistent authority로 저장되지 않는다.

### 23.2 Cross-layer mutation boundary

- Frontend persistent mutation intent는 Application boundary를 거쳐 Backend Project EFSM command로만 전달된다.
- Frontend FSM transition 자체가 ProjectObject를 변경하지 않는다.
- renderer action이 ProjectObject를 변경하지 않는다.

### 23.3 Backend failure

- Project EFSM validation 실패 시 activeProject가 유지된다.
- 실패한 command가 Frontend success reconciliation을 발생시키지 않는다.
- 실패한 command가 success renderer projection effect로 처리되지 않는다.

### 23.4 Reconciliation ordering

- Project commit success 전에 Frontend reconciliation이 success state를 확정하지 않는다.
- commit result 뒤 Frontend reconciliation이 먼저 수행되고 renderer는 final Frontend state를 사용한다.
- reconciliation이 Backend mutation을 재귀 호출하지 않는다.

### 23.5 Reference validity

- Frontend에서 전달한 project reference는 Backend mutation 전에 current authority에서 다시 resolve된다.
- stale reference가 유효한 mutation input으로 자동 승인되지 않는다.
- Backend mutation result로 invalidated된 Frontend reference는 defined reconciliation rule을 따른다.

### 23.6 Read projection

- read projection은 Backend authority에서 단방향으로 파생된다.
- read projection 자체가 별도 project authority가 되지 않는다.
- renderer/read consumer가 projection을 통해 Backend를 역갱신하는 transition이 없다.

### 23.7 Model decomposition

verification model은 Source Script/PlusCal hierarchy를 임의로 재설계하지 않는다.

필요한 경우 Backend와 Frontend interface contract를 검증하기 위한 결합 model을 둘 수 있지만, 그 model의 input/state/action이 어느 PlusCal responsibility에서 파생되었는지 추적 가능해야 한다.

---

## 24. 선택적 검증과 development lineage

필수 개발 순서는 다음과 같다.

1. Source Script 수정 및 closure review.
2. development-versions.json의 Source Script revision/fingerprint 갱신.
3. PlusCal pseudocode 직접 번역 및 translation review.
4. pseudocode revision/fingerprint와 derived_from 갱신.
5. Source Code 구현.
6. Source Code regression/build/version check 및 validation review.
7. source-code revision/fingerprint/derived_from 갱신.

필요한 경우 pseudocode에서 verification model을 파생하고 TLC를 별도로 실행·기록한다. 이 선택적 검증은 Source Code의 구현 순서를 막는 gate가 아니다. 미실행·미완료·실패를 통과로 기록하지 않으며, 검증 결과를 구현 완료 여부와 구분한다.

GitHub Actions를 이 작업의 필수 실행 수단으로 사용하지 않는다. 로컬 또는 현재 허용된 실행 환경에서 필요한 검사 명령을 사용한다. 사용자가 별도로 GitHub Actions 실행을 지시하지 않는 한 workflow를 임의 실행하지 않는다.

---

## 25. Source Code 구현 계획

Source Code 단계에서는 Source Script와 PlusCal에서 확정한 경계를 그대로 구현한다.

### 25.1 fast-figure.js Backend

Backend project state, Project EFSM, domain helpers를 Frontend가 직접 접근하는 global/public surface로 노출하지 않도록 정리한다.

기존 호환상 global symbol이 존재해야 한다면 Frontend official path로 사용하지 않으며 제거/cutover 계획을 기록한다.

FastFigureApi가 Backend mutation/read를 호출하는 공식 surface가 되도록 한다.

### 25.2 fast-figure-ui.js Frontend

React/Mantine component에서 activeProject, projectObjects, projectVfs, getChart, getProjectCsv, getProjectImage, projectEFSM 같은 Backend internal symbol을 직접 호출하는 부분을 제거한다.

persistent edit는 FastFigureApi mutation method를 사용한다.

project display는 FastFigureApi read method를 사용한다.

Frontend selection/overlay는 Frontend FSM event를 사용한다.

component-local draft는 local state로 유지한다.

### 25.3 renderer code

renderDashboard와 narrow renderer가 Backend internal state를 직접 읽지 않고 read adapter가 제공한 projection을 사용하도록 한다.

renderer event handler에서 persistent mutation이 필요하면 public API를 호출한다.

renderer refresh가 Backend mutation을 재호출하지 않는다.

### 25.4 lifecycle

Frontend FSM에 Backend task callback을 넘기는 구조를 제거한다.

Application adapter가 lifecycle start/end/failure를 Frontend FSM event로 전달하면서 Backend operation을 호출한다.

### 25.5 selection

Frontend selection이 Backend object copy를 보관하지 않도록 한다.

current selected target이 필요하면 read API에서 reference를 resolve한 projection을 받는다.

persistent mutation은 identity/reference와 user input만 전달하고 Backend가 current authority에서 다시 resolve한다.

---

## 26. 회귀 검사

### 26.1 Backend persistent mutation

- project name 변경.
- FFPX project load.
- CSV/image import.
- asset delete/replace/move/trash/empty-trash.
- directory 생성.
- slot content type/reset/swap.
- image link/settings/import.
- CSV-to-slot connection.
- chart import.
- graph object add/move/edit/delete.
- chart layout update.
- palette 적용.
- grid/style/merge/split.
- labels/captions.
- appearance palette.
- export settings.

각 operation이 public API → Application boundary → Project EFSM route를 사용하는지 확인한다.

### 26.2 Backend read/query

- project name.
- selected slot에 대응하는 project projection.
- image editor projection.
- asset tree/trash.
- graph data/layout/palette.
- print settings.
- captions.
- labels.
- appearance.
- layout state.

Frontend가 Backend helper를 직접 읽지 않고 read API result만 사용하는지 확인한다.

### 26.3 Frontend-only state

- overlay open/close.
- outside click.
- Escape.
- selected slot toggle.
- asset selection.
- graph-object selection.
- workspace.
- layout local selection.
- palette draft.
- print form draft.
- caption editor target.
- pointer drag/resize.
- navbar local state.

이 operation이 ProjectObject를 변경하지 않는지 확인한다.

### 26.4 Cross-layer reconciliation

- selected graph object 삭제.
- selected asset 이동/삭제.
- selected slot payload swap.
- grid 변경으로 selection target 변화.
- project load 뒤 기존 selection 처리.
- imported asset collision cancel.
- Backend command failure.
- lifecycle failure.

### 26.5 Renderer

- full dashboard projection.
- targeted image projection.
- caption projection.
- label projection.
- layout style/zoom projection.
- Plotly graph projection.
- renderer invalidation after project commit.
- renderer가 Backend mutation을 재호출하지 않음.
- renderer가 activeProject를 직접 읽지 않음.

### 26.6 Persistence compatibility

- 기존 FFPX import.
- 새 FFPX export/reopen.
- FFSX import/export.
- existing explicit persistent values 보존.
- UI-only state가 FFPX에 추가되지 않음.
- appearance.uiPalette가 persistent project property로 유지됨.

---

## 27. 작업 패치 단위

이번 작업은 최종 ownership 단위의 일관성을 우선하되 rollback 가능하도록 패치를 나눈다.

### A. Source Script architecture patch

- Backend / Application boundary / Frontend hierarchy.
- API/Adapter communication rule.
- interface_fsm Backend direct read 제거.
- renderer Backend direct read 제거.
- lifecycle ownership 변경.
- Source Script closure review와 lineage.

### B. PlusCal translation patch

- 관련 Source Script의 전체 의미 직접 번역.
- mutation/query/reconciliation/failure ordering.
- translation review와 lineage.

### C. Verification patch

- cross-layer invariant.
- reference validation.
- commit/reconciliation ordering.
- read projection one-way property.
- TLC를 선택적으로 실행했다면 실제 결과와 validation review.
- verification lineage.

### D. Source Code Backend/API patch

- official Backend command/query surface.
- direct Backend exposure 정리.
- mutation/read adapter 구현.

### E. Source Code Frontend/renderer patch

- Frontend direct Backend imports/calls 제거.
- Frontend FSM input contract.
- renderer projection input.
- lifecycle adapter.
- selection/reconciliation.

### F. Cutover/regression patch

- legacy bridge/direct path 제거.
- browser regression.
- FFPX/FFSX regression.
- distribution build.
- development-layer version check.
- final validation review.

한 패치에서 같은 ownership 단위를 고치면서 필요한 command 추출과 state ownership 정리를 함께 수행한다. 최종 구조와 맞지 않는 임시 bridge를 유지하기 위해 별도 중간 abstraction을 추가하지 않는다.

---

## 28. 변경하지 않을 사항

이번 계획 자체만으로 다음을 변경하지 않는다.

- FFPX schema.
- FFSX responsibility.
- ProjectObject field의 의미.
- chart ownership rule.
- slot-local property ownership.
- CSV/image asset의 persistent ownership.
- label/caption persistent semantics.
- appearance.uiPalette persistence.
- export settings persistence.
- 기존 domain algorithm의 계산 결과.
- Plotly interchange 의미.
- local-processing / portable-runtime 목적.
- 사용자가 요구하지 않은 network/server dependency.
- 정책 원문.

Backend/Frontend 분리를 이유로 새로운 persistent store를 추가하지 않는다.

Frontend용 별도 ProjectObject mirror를 만들지 않는다.

Project EFSM과 Frontend FSM을 다시 하나의 통합 FSM으로 감싸지 않는다.

Application boundary를 세 번째 authoritative FSM으로 만들지 않는다.

---

## 29. 구현 중 중단 조건

다음 상황에서는 해당 하위 구현을 진행하지 않고 상위 단계로 돌아간다.

- Frontend에서 Backend internal state를 직접 읽지 않으면 현재 기능 의미를 표현할 수 없는 경우.
- Backend read API에 어떤 projection을 제공해야 하는지 Source Script에서 결정되지 않은 경우.
- Frontend selection reference의 identity가 현재 ProjectObject 구조에서 안정적으로 정의되지 않은 경우.
- lifecycle failure/cancel ordering이 Source Script에서 닫히지 않은 경우.
- renderer invalidation에 필요한 result가 ProjectMutationResult에 없는 경우.
- 새로운 logical module/decomposition이 필요한 경우.
- FFPX schema 변경이 필요해지는 경우.
- verification model에서 PlusCal과 다른 decomposition을 도입해야만 검증이 가능한 것처럼 보이는 경우.
- TLC 반례가 Source Script/PlusCal의 실제 논리 문제를 드러내는 경우.

이 경우 Source Code에서 임시 규칙을 추가하지 않는다.

---

## 30. 완료 조건

다음 조건을 모두 만족할 때 plan-016 implementation을 완료로 판정한다.

1. Source Script에서 Backend, Application boundary, Frontend의 의미적 Module decomposition hierarchy가 정의되어 있다.
2. Project EFSM은 Backend 내부 responsibility로 정의되어 있다.
3. Frontend FSM은 Frontend 내부 responsibility로 정의되어 있다.
4. Backend와 Frontend 사이의 mutation, query, result 전달이 API 또는 Adapter contract로만 이루어진다.
5. Frontend component가 projectEFSM을 직접 호출하지 않는다.
6. Frontend FSM이 projectEFSM을 직접 호출하지 않는다.
7. Frontend component가 activeProject를 직접 읽지 않는다.
8. Frontend FSM이 activeProject를 직접 읽지 않는다.
9. renderer가 activeProject를 직접 읽지 않는다.
10. Backend가 Frontend FSM state를 직접 변경하지 않는다.
11. Project EFSM이 DOM/Mantine/renderer를 직접 변경하지 않는다.
12. persistent ProjectObject mutation은 Project EFSM의 current-authority resolve → candidate → validation → one commit contract로 수렴한다.
13. Backend query/read는 mutation path와 분리될 수 있지만 Backend public read boundary를 통과한다.
14. Frontend read projection이 별도 project authority가 되지 않는다.
15. stale Frontend projection이 ProjectObject mutation source로 사용되지 않는다.
16. Frontend selection reference는 Backend mutation 전에 current authority에서 다시 resolve된다.
17. ProjectMutationResult는 transient immutable result로만 사용된다.
18. Project commit success 뒤 Frontend reconciliation이 실행된다.
19. Project commit failure가 Frontend success reconciliation을 발생시키지 않는다.
20. Frontend reconciliation은 Backend mutation을 재귀 호출하지 않는다.
21. renderer는 final Frontend state와 Backend read projection/result를 사용한다.
22. renderer invalidation은 Backend mutation을 반복하지 않는다.
23. UI-only state는 FFPX에 직렬화되지 않는다.
24. persistent appearance.uiPalette와 다른 ProjectObject state는 Backend에 남는다.
25. 기존 FFPX/FFSX 의미와 호환성이 유지된다.
26. Source Script closure review가 완료된다.
27. PlusCal pseudocode가 새 Source Script hierarchy와 ordering을 직접 번역한다.
28. verification model을 사용하는 경우 현재 pseudocode에서 파생된다.
29. TLC 실행·통과 여부를 Source Code 구현 또는 `current` 판정의 필수 조건으로 두지 않는다.
30. Source Code가 현재 Source Script와 PlusCal lineage에서 파생된다. 선택적 검증 결과는 별도로 사실대로 기록한다.
31. browser regression이 Backend mutation, Backend query, Frontend-only transition, cross-layer reconciliation, renderer projection을 모두 포함한다.
32. distribution build와 development layer version check가 통과한다.
33. 모든 완료된 변경은 정확한 YYYYMMDD-NNN.patch / .md 쌍으로 기록된다.
34. GitHub Actions를 사용자의 명시적 요청 없이 임의 실행하지 않는다.
35. legacy direct access 또는 bridge가 남는 경우 완료로 판정하지 않고 남은 범위와 제거 조건을 기록한다.

---

## 31. 최종 허용/금지 경로

허용하는 Frontend → Backend persistent mutation 경로:

    Frontend component / Frontend FSM intent
    → public mutation API
    → Application adapter
    → Project EFSM
    → activeProject commit

허용하는 Frontend → Backend read 경로:

    Frontend
    → public read API / read adapter
    → Backend authoritative state
    → immutable projection
    → Frontend

허용하는 Backend → Frontend result 경로:

    Project EFSM
    → ProjectMutationResult
    → Application adapter
    → Frontend reconciliation input
    → Frontend FSM
    → renderer

허용하는 Frontend 내부 경로:

    Frontend component
    ↔ Frontend FSM
    → renderer

단, component-local state는 cross-component authority가 필요하지 않으면 Frontend FSM으로 승격하지 않는다.

금지하는 경로:

    Frontend component → Project EFSM
    Frontend FSM → Project EFSM
    Frontend component → activeProject
    Frontend FSM → activeProject
    renderer → activeProject
    renderer → Project EFSM
    Project EFSM → Frontend FSM
    Project EFSM → DOM
    Project EFSM → Mantine/React state
    Backend helper → Frontend local draft

이 경계가 이번 계획의 핵심 구현 계약이며, 하위 PlusCal, verification model, Source Code는 이 계약을 축약하거나 약화하지 않는다.

---

## 32. 2026-10-16 구현 진행 — selection/reconciliation ownership

- Source Code r32/r33 (WIP): Backend validated selection / post-commit reconciliation query provider와 Application adapter를 구현한다. Frontend FSM의 live ProjectObject context, workspace chart normalization, persistent command action 연결을 제거한다.
- invalid reference는 Frontend state를 보존하고 explicit null만 deselection한다. explicit public graph selection은 live graph mutation 없이 CSV reference를 함께 선택한다. object commit index 갱신은 기존 current CSV 선택을 보존한다.
- 회귀 항목 37/38과 기존 전체 split/portable browser regression, version checker, distribution build는 사용자 요청에 따라 GitHub Actions에서 실행한다. 결과는 `agent_space/reviews/review-20261016-001-selection-boundary.md`에 기록한다.
- 검증 완료: 최종 code/test HEAD `5614061ccde797e16a2ee4afff6805254f22922e`에서 Actions regression 38842589879 (inline 38 + split 38), version 38842592395 통과. 같은 r33 application source의 distribution build/verify 38842438473 통과. 초기 실패와 보정/기록 감사는 review에 보존한다.
- 전체 완료 아님: renderer와 남은 API/domain consumer의 direct access cutover, read projection 완성, 최종 통합 검증이 남는다. Source Code `stale` 유지. TLC 미실행.

## 33. 2026-10-16 구현 진행 — image settings ownership

- Source Code r34/r35 (WIP): image editor read와 targeted image renderer에 Backend immutable projection / Application query 경계를 연결한다. React editor는 read projection 전체를 mutation으로 재전송하지 않고 새 edit patch만 전달한다.
- 현재 Backend slot-local settings를 기준으로 candidate를 구성·정규화·검증·commit한다. 같은 image asset을 참조하는 다른 slot은 변경하지 않는다. 실패 시 success reconciliation/render를 수행하지 않는다.
- 최종 distribution HEAD `43a3a05bdbc82a125d34e603a5fbd858dd48c012`: Actions regression 38845564973 (inline 39 + split 39), version 38845567464 통과. 해당 application source build/verify 38845342850 통과. 실패·보정·파일별 commit 제한은 `agent_space/reviews/review-20261016-002-image-boundary.md`에 기록한다.
- 이 단위는 전체 image/API/renderer cutover 완료가 아니다. full renderer, 나머지 API/domain consumer와 전체 lineage 대조가 남으며 Source Code `stale` 유지, TLC 미실행.
