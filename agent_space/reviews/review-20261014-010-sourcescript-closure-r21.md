# Source Script r21 closure review — plan-015 G

## 범위

plan-015 F 책임 감사 결과를 Source Script module decomposition으로 반영했다.

- `project_efsm.py`: authoritative FFPX ProjectObject persistent EFSM.
- `interface_fsm.py`: lifecycle/workspace/overlay/selection runtime FSM.
- `application_fsm.py`: 두 FSM의 causal ordering과 renderer post-effect를 연결하는 orchestration.
- `project_state.py`: activeProject만 persistent authority로 유지하고 selectedSlotId ownership을 제거.

## 정의와 권위

FFPX는 파일이 아니라 저장·복원 대상 ProjectObject 자체다. projectEFSM은 별도 project copy를 소유하지 않고 activeProject의 candidate validation/commit transition만 소유한다.

interfaceFSM은 selectedSlotId, workspace, overlay, asset/graph-object selection, lifecycle을 소유한다. 이 값은 FFPX serialization 대상이 아니다.

ProjectMutationResult는 한 command 동안만 존재하는 immutable result이고 새 authority가 아니다.

## 전이 순서

```text
interface intent
→ explicit project command
→ projectEFSM resolve / candidate / validate / commit
→ ProjectMutationResult
→ interfaceFSM reconciliation
→ renderer projection invalidation
```

projectEFSM은 interface state와 DOM을 변경하지 않는다.
interfaceFSM은 activeProject를 persistent mutation하지 않는다.
renderer는 두 FSM command를 재귀 호출하지 않는다.

## module decomposition

project_efsm과 interface_fsm은 구현 편의의 파일 분리가 아니라 persistent ProjectObject transition과 UI/runtime transition이라는 서로 다른 의미 영역을 가진 형제 module이다.

application_fsm은 상위 상태를 다시 소유하지 않고 두 transition 사이 causal ordering만 담당한다. 하위 PlusCal과 Source Code도 이 logical decomposition을 보존해야 한다.

## 기존 의미 보존

assets, graphs, layout/annotation의 candidate/validation semantics는 유지한다. mutation 알고리즘을 새로 만들기보다 owner를 분리했다.

plan-014의 renderer invalidation은 projectEFSM commit → interfaceFSM reconciliation 뒤 effect로 확장했다.

component-local Layout selection/form draft/pointer/resize state는 shared interface authority가 필요하지 않으므로 interfaceFSM으로 승격하지 않았다.

## 닫힘 판정

- activeProject는 유일한 FFPX persistent authority다.
- persistent mutation command와 interface region transition의 owner가 분리됐다.
- selectedSlotId는 interface_fsm에만 정의된다.
- serialization/renderer는 두 FSM의 authority가 아니다.
- legacy appFSM 의미를 Source Script에 병행하지 않는다.

Source Script r21은 plan-015 G 범위에서 closed다. pseudocode/verification/source-code는 r21에 대해 stale이며 다음 단계는 H PlusCal 직접 번역이다.
