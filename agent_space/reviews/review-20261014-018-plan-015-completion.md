# Plan 015 completion review — FFPX EFSM / interface FSM separation

## 범위

`plan-015.md`의 F~K 단계를 현재 main과 기존 단계 review/patch 결과로 재검토했다.

## 단계별 완료 근거

- F — 책임 감사: `review-20261014-009-fsm-responsibility-audit.md`에서 persistent ProjectObject, interface runtime state, renderer projection, serialization boundary를 분류했다.
- G — Source Script: r23에서 public persistent mutation route와 project command ownership을 닫았고 closure review를 남겼다.
- H — pseudocode: r10에서 Source Script r23의 public mutation route를 실제 application project-command dispatch로 모두 번역했다.
- I — verification: r24가 current lineage이지만 TLC는 `pending`이다. 정책상 선택 검증이므로 Source Code 완료 조건으로 사용하지 않았다.
- J1 — projectEFSM: Source Code r29의 `ProjectStateMachine/projectEFSM`이 persistent ProjectObject command와 candidate-first commit을 소유한다.
- J2 — interfaceFSM: `InterfaceStateMachine/interfaceFSM`이 lifecycle/workspace/overlay/slot/asset/graph-object selection 등 runtime interaction state를 소유한다.
- J3 — orchestration/renderer: `appFSM`은 호환 facade이며 project result를 interface reconciliation에 전달한 뒤 renderer effect를 수행한다. 별도 persistent authority는 없다.
- K — 통합: r29 browser regression, distribution build, development-layer version check가 성공했고 Source Code r29는 current다.

## 정책 대조

`source-script-policy.md`는 TLA+/TLC가 Source Code 구현의 필수 단계가 아니라고 명시한다. 따라서 verification r24의 `tlc: pending`을 유지하면서도 r29 Source Code closure는 정책과 모순되지 않는다.

기존 version checker가 TLC passed를 강제하던 부분은 r25에서 정책에 맞게 수정되었다. verification fingerprint를 lineage에 기록한 경우 일치 여부는 계속 검사하지만 TLC 실행 결과 자체를 Source Code gate로 사용하지 않는다.

## 일반 코딩 원칙

- persistent single source of truth: `activeProject` 하나.
- project mutation과 UI/runtime state의 ownership 분리.
- candidate 계산과 authoritative commit 분리.
- renderer는 read/projection 책임이며 project mutation owner가 아님.
- mixed raw-file import만 원자성 때문에 `ASSETS_IMPORTED` command를 추가하고, 기존 command로 표현 가능한 경로는 중복 command를 만들지 않았다.
- r25에서 실수로 제거된 read-only data-tree projection은 r27에서 원래 의미 그대로 복구했으며 새로운 authority를 만들지 않았다.

## 검증 기록

`review-20261014-017-source-code-r29.md` 기준:

- Source Script r23 public persistent route target 대조: missing project action 0, missing Source Code send/dispatch route 0.
- r27/r28/r29 browser regression: success.
- r29 distribution build: success.
- r29 development-layer version check: success.
- latest closure commit `a15d430ac44598cdd3f237f62595ca029c373866`의 Development layer versions run `38544829224`: success.

## 판정

plan-015의 목적이었던 FFPX ProjectObject EFSM과 interface FSM의 책임 분리는 완료되었다. 계획 문서에 남아 있던 TLC 필수/GitHub Actions 금지 전제는 실행 중 정책 재확인과 사용자 지시로 변경되었으며, 원문을 삭제하지 않고 completion note에 실제 적용 기준을 기록한다.
