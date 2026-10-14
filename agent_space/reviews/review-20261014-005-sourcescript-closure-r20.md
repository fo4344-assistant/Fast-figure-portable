# Source Script r20 closure review — plan-014 A

## 범위

- 기준 계획: `agent_space/plans/plan-014.md`의 A 단계.
- 이전 Source Script: r19.
- 현재 Source Script: r20, `sha256:3840b94d335d5d7b93e7eb1508cf6027603a2b4c838646a70dba03e14deaf66e`.
- 후속 `plan-015`의 FFPX EFSM/UI-FSM 구조 분리는 이번 revision에 포함하지 않는다.

## 논리적 완결성

- Layout overlay selection은 Modal-local state이며 slot toggle, background clear, command control, grid 변경, overlay close의 경계를 명시했다.
- background deselection은 FFPX project object와 layout/slot persistent state를 변경하지 않는다.
- `ApplicationStateMachine.send()`의 logical-event 완료 시점은 모든 handled region action/transition, selection reconciliation, 기존 publish가 끝난 뒤다.
- mutation owner가 실제 reference/content 변화 결과를 산출하며 renderer는 VFS/DOM에서 결과를 역추론하지 않는다.
- trash move/empty는 실제 graph reference 제거 또는 image slot reset이 있는 경우에만 dashboard content invalidation을 요구한다.
- renderer invalidation은 FULL_DASHBOARD / TARGETED_PROJECTION / NONE으로 구분하며 region별 publish나 lifecycle transition을 full-render trigger로 사용하지 않는다.
- renderer effect는 current authority를 다시 읽는 projection이며 project mutation 또는 재귀적인 `appFSM.send/notify`를 발생시키지 않는다.

## 프로젝트 목적 부합

- plan-014의 Layout selection 해제 문제와 stale dashboard 문제를 같은 책임 경계 안에서 해결한다.
- 새 persistent state, 별도 tree authority, completion listener registry, render queue를 추가하지 않는다.
- outerMargin 기본값 0은 r19에 이미 반영되어 있으므로 중복 변경하지 않았다.

## 중복과 통합 검토

- 개별 public command마다 무조건 `renderDashboard()`를 추가하지 않고 logical event 완료 뒤 한 번만 invalidation을 판정한다.
- existing narrow renderer가 충분한 image/caption/style 경로는 TARGETED_PROJECTION으로 유지한다.
- composite command의 마지막 render 의미를 event별 중간 render로 분해하지 않는다.

## 하위 계층 상태

- pseudocode r5, verification r16, Source Code r23은 r20에 대해 stale로 전환한다.
- 다음 단계는 PlusCal 직접 번역과 translation review다.
- 이번 단계에서는 TLC, browser regression, distribution build를 실행하지 않았으며 통과했다고 기록하지 않는다.
