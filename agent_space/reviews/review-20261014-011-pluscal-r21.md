# PlusCal translation review — Source Script r21 / pseudocode r7

## module hierarchy

Source Script r21의 decomposition을 PlusCal에서 그대로 보존했다.

- project_efsm.py → project_efsm.pcal
- interface_fsm.py → interface_fsm.pcal
- application_fsm.py orchestration → application_fsm.pcal

기존 domain pseudocode는 candidate 계산 모듈로 유지하고 project EFSM이 persistent commit owner가 된다.

## project EFSM

project_efsm.pcal은 다음 순서를 직접 번역한다.

1. declared project command 확인.
2. current ProjectObject에서 input/reference resolve.
3. domain candidate 생성.
4. whole-project validation.
5. authoritative project 한 번 commit.
6. pre/post에서 immutable ProjectMutationResult 생성.
7. interface/renderer authority 불변 확인.

selectedSlotId 또는 UI region을 project EFSM state로 두지 않는다.

## interface FSM

interface_fsm.pcal은 lifecycle/workspace/overlay/asset selection/graph-object selection/selectedSlotId만 소유한다.

ProjectMutationResult를 받은 ReconcileProjectResult에서 current project를 다시 resolve해 invalid selection을 clear하고 workspace를 재계산한다. 이 절차는 project authority를 변경하지 않는 assertion을 가진다.

component-local Layout selection은 기존 api_ui.pcal에 남아 shared interface FSM state로 승격하지 않는다.

## application orchestration

application_fsm.pcal은 persistent state나 interface region을 자체 변수로 복제하지 않는다.

```text
ProjectEfsmSend
→ committed result guard
→ InterfaceFsmReconcileProjectResult
→ ApplyDashboardProjectionInvalidation
```

순서만 보존한다.

## renderer / layout 보정

renderer_runtime.pcal의 이전 AppFsm send 기반 invalidation을 제거하고 final interface state + project mutation result를 받는 projection procedure로 바꿨다.

layout_annotations_export.pcal의 grid commit이 selected slot을 직접 reconcile하던 의미를 제거하고 project mutation result만 반환한다. selection reconciliation은 interface FSM에서 수행한다.

## 번역 판정

Source Script r21에 없는 persistent copy, compatibility FSM, UI/project 양방향 sync를 추가하지 않았다. 새 logical modules와 ownership은 상위 hierarchy와 1:1로 대응한다.

pseudocode r7은 Source Script r21의 plan-015 G 의미를 직접 번역한 current 계층으로 판정한다. 다음 단계는 verification model/TLC I 단계다.
