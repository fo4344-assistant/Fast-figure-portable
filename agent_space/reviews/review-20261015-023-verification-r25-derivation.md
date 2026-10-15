# Verification derivation review — Source Script r25 / pseudocode r11 / verification r25

## 범위

plan-016의 verification 단계에서 current Source Script r25와 pseudocode r11의
Backend / Application boundary / Frontend 계약을 bounded verification model로 파생했다.

직접 원천:

- `pseudocode/project_state.pcal`
- `pseudocode/project_efsm.pcal`
- `pseudocode/interface_fsm.pcal`
- `pseudocode/application_fsm.pcal`
- `pseudocode/renderer_runtime.pcal`

기존 `FastFigureSlotCore`와 `FastFigureInteractionCore`는 project slot/layout/reference 및
asset/selection interaction의 domain 상태를 계속 담당한다. 이번 변경은 그 내부 상태를 복제하지 않고
cross-layer ordering과 authority flow만 별도 interface-contract slice로 추가한다.

## 새 Boundary Core의 상태와 추적 관계

`verification/FastFigureBoundaryCore.tla`의 상태는 다음 pseudocode 의미에서 직접 파생했다.

- `projectRevision`: Backend `activeProject` authority의 bounded revision token.
- `projectBefore`: 한 mutation attempt 시작 시점의 authority revision.
- `frontendReference`: Frontend가 보유한 project identity reference의 valid/stale/none abstraction.
- `referenceAccepted`: `BackendValidateFrontendIntent` 결과.
- `resultCommitted`: Project EFSM의 `ProjectMutationResult.committed`.
- `reconciliationDone`: commit 뒤 `BackendBuildFrontendReconciliationInput -> InterfaceFsmReconcileProjectResult` 완료 여부.
- `projectionRevision`: Backend read/renderer projection이 파생된 authority revision.
- `rendererApplied`: post-reconciliation renderer projection 완료 여부.
- `phase`: application boundary의 validated -> committed/rejected -> reconciled -> projected 또는 read flow ordering.

실제 ProjectObject field를 별도의 model state로 복제하지 않는다. 이 model의 property는
도메인 값 자체가 아니라 authority 변경과 ordering에 의존하므로 bounded revision token으로 축약했다.

## 검증 property

CFG에는 다음 invariant를 등록했다.

- `FailureAtomicityInvariant`
  - stale/invalid reference 또는 candidate rejection 뒤 project revision은 mutation 시작 전과 같다.
  - rejected mutation은 success reconciliation/renderer effect를 만들지 않는다.
- `CommitResultInvariant`
  - committed/reconciled/projected phase는 accepted reference에서 시작한 실제 commit이어야 한다.
  - committed authority는 pre-command revision의 다음 revision이다.
- `ReconciliationOrderingInvariant`
  - reconciliation은 commit 이후에만 존재하며 stale Frontend reference를 success state로 남기지 않는다.
- `RendererOrderingInvariant`
  - renderer success projection은 commit과 reconciliation 뒤에만 발생한다.
  - projection revision은 최종 Backend authority revision과 일치한다.
- `ReadProjectionOneWayInvariant`
  - Backend public read projection은 authority를 변경하지 않는다.
  - read projection 자체가 success mutation/reconciliation/renderer mutation result로 취급되지 않는다.
- `TypeOK`
  - bounded verification state domain을 유지한다.

## 모델에서 구조적으로 보존되는 경계

다음 항목은 별도의 boolean invariant를 만들기보다 action dependency 자체에서 보존한다.

- Frontend reconciliation action은 `projectRevision`을 변경하지 않는다.
- renderer action은 `projectRevision`을 변경하지 않는다.
- read projection action은 `projectRevision`을 변경하지 않는다.
- commit action은 `projectionRevision`을 mutation input으로 읽지 않는다.
- Backend mutation은 `CommitMutation` action 하나로만 authority revision을 변경한다.
- rejected reference는 `validated` phase에 진입하지 않으므로 commit action에 도달할 수 없다.

이는 새로운 mutation source나 duplicated project authority를 verification model에 추가하지 않는 방향이다.

## 추상화 및 생략

### 기존 Slot/Interaction state

grid/slot/chart/image/CSV/VFS 구체 값은 기존 canonical Slot Core/Interaction Core가 이미 검증하는
domain state이므로 Boundary Core에 다시 복제하지 않는다.

Boundary Core의 `projectRevision`은 기존 model을 대체하지 않고, cross-layer contract에서
authority가 변경되었는지 여부와 ordering만 나타낸다.

### renderer DOM/Plotly 세부

DOM/Plotly representation은 project authority가 아니며 현재 property는 renderer가 Backend를 다시
mutate하지 않는 ordering에 집중한다. 따라서 concrete DOM state는 생략한다.

### lifecycle task

pseudocode r11에서 lifecycle task owner가 Application boundary로 이동한 구조는 translation review에서
직접 확인했다. 이번 bounded model에는 별도 lifecycle task state를 추가하지 않았다.
현재 plan-016 verification property의 핵심인 project commit/reconciliation/renderer/read authority ordering과
독립적인 task UI 표시 상태를 추가하면 상태공간만 증가한다.

추후 lifecycle task의 failure/interleaving이 project transaction property에 직접 영향을 주는 요구가 생기면
Application-boundary projection으로 이 model에 추가해야 한다.

### graph object value 세부

r25의 graph-object value edit는 pseudocode r11에서 explicit chart/object/CSV reference resolve 후 기존
`GRAPH_OBJECTS_REPLACED` command로 수렴한다. 이번 Boundary Core는 command payload의 graph 값 자체가 아니라
accepted reference -> commit/reject ordering을 검증한다. 구체 graph model validation은 이 model의 범위가 아니다.

## TLC 실행 상태

현재 실행 환경에서 Java 21은 확인했다.

그러나 저장소 workflow가 사용하는 TLA+ tools v1.7.4 `tla2tools.jar`는 설치되어 있지 않으며,
실행 환경의 외부 DNS가 차단되어 다음 공식 URL에서 jar를 내려받을 수 없었다.

`https://github.com/tlaplus/tlaplus/releases/download/v1.7.4/tla2tools.jar`

따라서 이번 review는 **derivation/abstraction review**이며 TLC validation review가 아니다.

- PlusCal/TLA parse: 미실행
- TLC: 미실행
- TLC status: `pending`
- validation_review: `null`

GitHub Actions는 사용하지 않았다.

TLC를 실제 실행하고 모든 configured invariant가 통과한 뒤에만 별도 validation review를 기록하고
`tlc: passed`로 변경할 수 있다.

## lineage

verification r25 fingerprint:

`sha256:2c1051c19c2b2ac4502d0fefe2162fbf3e5dc9d02635d8333190aab1f441cb91`

derived Source Script r25:

`sha256:7da7df78942382dc19d66dbf0e0759cf4f621350308b2e99d79b3ef1e6b6b73f`

derived pseudocode r11:

`sha256:ead7ec7f3cc45baf2d6c88d9ccfe56ec4ebcd562444aa6741c43dee5f963cae5`

verification r25는 새 model을 포함하는 current derivation으로 기록하되 TLC는 pending이다.
Source Code r29는 stale 상태를 유지한다.

## 다음 단계

1. TLA+ tools v1.7.4가 사용 가능한 로컬 실행 환경에서 Boundary Core를 parse/TLC 실행한다.
2. 기존 Slot Core와 Interaction Core도 현재 동일 blob 기준으로 함께 실행하여 전체 canonical verification model을 재검증한다.
3. 세 model이 통과하면 validation review를 작성하고 `tlc: passed`를 기록한다.
4. 그 뒤에만 plan-016 Source Code 구현 단계로 진행한다.
