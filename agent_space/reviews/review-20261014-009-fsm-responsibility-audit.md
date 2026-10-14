# FSM responsibility audit — plan-015 F

## 0. 감사 기준

사용자 정의를 책임 분리의 최상위 기준으로 사용한다.

- **FFPX**: 저장 파일 자체가 아니라 저장·복원 대상인 영속 Fast Figure ProjectObject.
- **FFPX EFSM**: 그 ProjectObject의 상태, 허용 전이, validation, reference integrity, candidate/commit 결과를 소유하는 상태기계.
- **인터페이스 FSM**: 사용자/런타임 상호작용의 상태와 전이만 소유한다.
- **renderer**: commit된 FFPX authority와 인터페이스 상태를 읽어 화면을 단방향 projection한다.

따라서 "appFSM 안에서 처리된다"는 사실은 EFSM 여부의 기준이 아니다. ProjectObject를 변경하는 의미인지, UI/runtime interaction을 변경하는 의미인지가 기준이다.

## 1. 현재 권위 상태 분류

| 현재 상태/구조 | 실제 의미 | 목표 소유자 | 판정 |
| --- | --- | --- | --- |
| `activeProject` / `projectState` | 영속 FFPX ProjectObject | FFPX EFSM | 이미 올바른 project authority |
| `projectObjects` | activeProject read adapter/registry | FFPX read boundary | 별도 authority 아님 |
| `projectVfs` | activeProject에서 경로를 resolve하는 helper | FFPX EFSM/helper | 별도 tree authority 아님 |
| `selectedSlotId` | 현재 session의 slot selection | interface FSM | FFPX state가 아님 |
| `appFSM.state.workspace` | project/graph/image editor UI workspace | interface FSM | UI state |
| `appFSM.state.overlay` | layout/label/caption/print/readme Modal 상태 | interface FSM | UI state |
| `assetSelection/assetPath` | tree/editor의 현재 선택 | interface FSM | persistent project state 아님 |
| `graphObject/index` | editor의 current object selection | interface FSM | persistent chart object가 아님 |
| `lifecycle` | import/export busy/error runtime 상태 | interface/application runtime FSM | FFPX state 아님 |
| Layout selection / form draft / pointer drag | component lifetime interaction | component local 또는 interface FSM | cross-component 필요 없으면 local 유지 |
| dashboard DOM / Plotly / image element | 화면 projection | renderer | authority 아님 |
| FFPX read/build package | ProjectObject serialization adapter | persistence boundary | FSM interaction state를 저장하지 않음 |

## 2. 현재 혼합 지점

### 2.1 `ApplicationStateMachine`의 region은 사실상 인터페이스 상태다

현재 `application_fsm.py`의 region은:

`lifecycle → workspace → overlay → assetSelection → graphObject`

이며 모두 FFPX ProjectObject의 persistent state가 아니라 application/UI runtime state다.

따라서 현재 `ApplicationStateMachine` 객체의 state vector 자체를 FFPX EFSM으로 재해석해서는 안 된다. 이 state vector는 분리 후 인터페이스 FSM 쪽으로 가는 것이 일관된다.

### 2.2 영속 mutation action이 `workspace` region에 결합되어 있다

현재 `WORKSPACE_MUTATION_EVENTS`에는 다음 persistent mutation이 함께 들어 있다.

- project/VFS: PROJECT_DIRECTORY_CREATED, PROJECT_NODE_MOVED, PROJECT_TRASH_EMPTIED, PROJECT_LOADED
- asset: DATA_OBJECT_*, IMAGE_OBJECT_*
- slot: SLOT_TYPE_CHANGED, SLOTS_RESET, SLOTS_SWAPPED, SLOT_IMAGE_LINKED, SLOT_DATA_CONNECTED, imports
- graph/chart: GRAPH_OBJECTS_REPLACED, CHART_LAYOUT_CHANGED, CHART_MODEL_REPLACED
- layout: GRID_LAYOUT_CHANGED
- caption persistent mutation 일부

이 구조에서는 한 event가 `workspace` UI region의 transition/update와 FFPX ProjectObject mutation을 동시에 소유한다.

**이 지점이 plan-015의 핵심 분리 대상이다.**

### 2.3 selection reconciliation과 project mutation의 실행 순서가 한 send loop에 의존한다

현재 `appFSM.send()`는 region order대로 같은 payload를 처리한다.

`workspace mutation → overlay → assetSelection reconciliation → graphObject reconciliation`

plan-014에서 dashboard projection을 send 반환 뒤로 이동했기 때문에 renderer는 final selection을 읽을 수 있게 됐지만, project commit과 UI reconciliation은 여전히 같은 state-machine dispatch에 묶여 있다.

분리 후 이 순서는 암묵적 region order가 아니라 orchestration contract로 표현해야 한다.

`projectEFSM command/commit → interfaceFSM reconcile(result) → renderer invalidation`

### 2.4 UI-local state를 interface FSM으로 과도하게 승격하면 안 된다

다음은 cross-component source of truth가 필요하지 않은 한 그대로 component-local이어야 한다.

- Layout merge/split selection Set
- settings overlay current height와 resize pointer state
- collision Modal draft/resolver
- palette/print form draft
- label pointer drag transient state

"FSM을 둘로 나눈다"는 이유로 모든 UI state를 interface FSM에 넣는 것은 새로운 중앙집중 state와 동기화 비용을 만든다.

## 3. mutation 책임 분류

### FFPX EFSM으로 이동할 의미

1. candidate build와 precondition validation.
2. whole-project/reference invariant 검증.
3. activeProject의 단일 commit 또는 전체 ProjectObject 교체.
4. VFS path/reference 정합성.
5. chart ownership과 slot-local persistent payload.
6. persistent caption/label/appearance/export/layout state.
7. mutation result:
   - changed ids/path
   - removed reference counts
   - invalidation 의미에 필요한 실제 commit 결과.
8. 실패 시 authoritative project unchanged 보장.

### interface FSM에 남길 의미

1. lifecycle busy/error/ready.
2. workspace 선택.
3. overlay open/close.
4. selected slot.
5. asset tree/editor selection.
6. graph object selection.
7. project commit 이후 selection의 re-resolve/clear.
8. model-to-ui / ui-to-model direction 등 interface projection에 필요한 runtime marker.

### orchestration/renderer 경계

다음 순서를 별도 책임으로 둔다.

```text
UI interaction
→ interface command 해석
→ explicit FFPX command
→ projectEFSM validate/candidate/commit
→ mutation result
→ interfaceFSM selection/workspace reconciliation
→ renderer projection invalidation
```

renderer는 mutation result와 최종 interface selection을 읽을 수 있지만 project를 다시 변경하지 않는다.

## 4. event 소유권 감사

| event 종류 | 현재 | 목표 |
| --- | --- | --- |
| TOGGLE_OVERLAY / CLOSE_OVERLAY / ESCAPE / OUTSIDE_CLICK | appFSM overlay | interface FSM 단독 |
| SELECT_SLOT | appFSM + selectedSlotId runtime mutation | interface FSM 단독 |
| SELECT_ASSET / graph-object selection | appFSM | interface FSM 단독 |
| PROJECT_NODE_MOVED / TRASH_EMPTIED / DIRECTORY_CREATED | workspace action + selection region | project EFSM command + interface reconcile |
| DATA/IMAGE object mutation | workspace action | project EFSM |
| SLOTS_RESET / SLOTS_SWAPPED / SLOT_* link/import | workspace action + selection reconcile | project EFSM + result-driven interface reconcile |
| GRAPH_OBJECTS_REPLACED / chart mutation | workspace action + graph selection | project EFSM + interface reconcile |
| GRID_LAYOUT_CHANGED | workspace mutation + selection clear | project EFSM + interface reconcile |
| PROJECT_LOADED | lifecycle/orchestration + workspace mutation + selections | project EFSM whole-state replace + interface reset/reconcile |
| renderer invalidation | public command별 분산, plan-014 helper 도입 | orchestration의 post-commit effect |

## 5. serialization 경계

FFPX serialization은 EFSM 자체가 아니다.

- export: current validated ProjectObject snapshot을 읽는다.
- import: bytes/package를 candidate ProjectObject로 decode/normalize/validate한 뒤 **ProjectObject replacement command**를 project EFSM에 전달한다.
- overlay/workspace/selection/pointer state는 FFPX에 포함하지 않는다.

따라서 파일 format code를 interface FSM 또는 EFSM transition table과 결합하지 않는다.

## 6. plan-014가 만든 선행 기반

plan-014에서 다음 순서를 이미 확보했다.

`appFSM.send 완료 → mutation result → renderer invalidation`

이것을 plan-015에서는 다음으로 확장한다.

`projectEFSM commit → interfaceFSM reconcile → renderer invalidation`

즉 plan-014 helper를 폐기하고 새로운 우회 bridge를 만드는 것이 아니라, logical-event completion 경계를 두 FSM 사이의 orchestration으로 확장한다.

## 7. Source Script G 단계 권장 decomposition

Source Script에서 먼저 다음 세 책임을 독립적으로 정의하는 것이 적절하다.

1. **project_efsm**
   - activeProject/ProjectObject mutation state machine.
   - persistent command, candidate validation, commit, mutation result.
2. **interface_fsm**
   - lifecycle/workspace/overlay/slot/asset/graph-object runtime state machine.
   - project mutation을 직접 수행하지 않고 command/result를 orchestration과 교환.
3. **application orchestration**
   - interface intent를 project command로 dispatch.
   - project result를 interface reconciliation에 전달.
   - 최종 상태에서 renderer invalidation 수행.

기존 `application_fsm.py`의 혼합 의미를 그대로 보존하는 별도 legacy FSM은 만들지 않는다.

## 8. 완료 판정

F 단계 감사 결과, 현재 구조는 영속 FFPX authority 자체가 UI state에 복제된 것은 아니지만, **영속 mutation action의 실행 책임이 interface region인 workspace에 결합되어 있어 EFSM/UI-FSM 분리가 완료된 구조는 아니다.**

다음 G 단계에서는 이 ownership을 Source Script 수준에서 먼저 분리해야 한다. Source Code의 class 이름 변경이나 파일 이동부터 시작해서는 안 된다.
