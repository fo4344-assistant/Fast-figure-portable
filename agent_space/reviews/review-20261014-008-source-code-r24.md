# Source Code validation review — r24 / plan-014 completion

## 대상

- Source Script r20
- pseudocode r6
- verification-model r17
- Source Code r24
- Source Code fingerprint: `sha256:2b8d4f5eda1eb414ddc123cf524d6a006d67cf44251bc7c86b1425e44e3f403f`

## 구현 결과

### Layout selection

`FastFigureLayoutOverlay`의 selection은 React component-local Set으로 유지된다.

- slot click은 propagation을 차단하고 해당 slot을 toggle한다.
- merge/split/explicit clear control은 selection을 먼저 소비하고 parent background clear에 의해 상쇄되지 않는다.
- settings content의 non-slot click은 selection을 clear한다.
- 이 경로는 FFPX ProjectObject를 변경하지 않는다.

### dashboard projection invalidation

`PROJECT_NODE_MOVED`와 `PROJECT_TRASH_EMPTIED` mutation owner가 실제 `removedGraphReferenceCount`와 `resetImageSlotCount`를 payload에 기록한다.

`dispatchDashboardAffectingEvent`는 `appFSM.send()`가 모든 region을 동기 처리하고 반환한 뒤 projection effect를 한 번 판정한다.

- 실제 rendered reference detach: FULL_DASHBOARD.
- path-only move / reference 없는 trash empty: NONE.
- SLOTS_SWAPPED: FULL_DASHBOARD.
- renderer effect는 project mutation이나 재귀 appFSM event를 발생시키지 않는다.

## push-trigger 검증 결과

WIP implementation commit `94a0891cab60b704417c8236faac8cec9f0e9c6e` 기준:

- Fast Figure regression run `38519371995`: **success**.
- Build distribution run `38519372023`: **success**.
- build workflow가 distribution artifact commit `03477a0b895dc646b5c530cf06722552c90c1ba1`을 main에 반영했다.

초기 development-layer run `38519372013`은 구현 오류가 아니라 Source Code fingerprint 계산에서 JS locale sort를 사용한 메타데이터 오류 때문에 실패했다. checker의 Python path ordering으로 fingerprint를 바로잡은 commit `ce526e7872fb23d1d80d13ce7c11e6fcd1f480d3`의 push-trigger Development layer versions run `38519480783`은 **success**했다.

verification 근거는 `review-20261014-007-verification-r17.md`에 기록했다.

## 완료 판정

plan-014의 A~E는 다음을 만족한다.

- Source Script r20 closed.
- pseudocode r6 current.
- verification r17 passed.
- Source Code r24가 current lineage를 가리킨다.
- Layout background deselection regression 통과.
- trash reference detach 후 stale dashboard regression 통과.
- distribution build 성공.
- development-layer version checker 성공.

따라서 plan-014 구현 범위는 완료로 판정한다. 후속 plan-015는 이 상태를 기준으로 FFPX EFSM과 인터페이스 FSM 책임 분리를 진행한다.
