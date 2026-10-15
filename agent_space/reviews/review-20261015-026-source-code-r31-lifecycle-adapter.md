# Plan 016 Source Code r31 WIP — Application lifecycle adapter ownership

## 기준 및 영향 범위

- Source Script r25/current/closed: `sourcescript/application_fsm.py`의 `runLifecycleTask`, `sourcescript/interface_fsm.py`의 Frontend lifecycle-only events.
- PlusCal pseudocode r11/current: `pseudocode/application_fsm.pcal`의 `RunLifecycleTask`, `pseudocode/interface_fsm.pcal`의 `TransitionLifecycle`.
- 변경 시작 HEAD: `63db07916f61073c1616c8bfd7823acf7dd7447f`.
- 대상: `fast-figure.js`, `agent_space/tests/browser-regression.js`, `development-versions.json`, build bot의 `dist/` 산출물.

## Source Code 구현

기존 `InterfaceStateMachine.run(lifecycle,event,task)`는 Frontend FSM이 콜백 실행, Promise 완료/실패 처리 및 error state 변경까지 직접 소유했다. 이는 Plan 016 §12, §25.4와 Source Script r25의 Application boundary가 persistent lifecycle task를 실행한다는 계약에 어긋난다.

- 기존 `InterfaceStateMachine.run`을 제거했다.
- 같은 `fast-figure.js` 물리 파일 내 Application boundary의 `runLifecycleTask`가 task callback을 직접 실행하며 ready guard, 동기/비동기 완료, rejected outcome, 예외 전달을 처리한다.
- `InterfaceStateMachine.send`에서 `LIFECYCLE_START`, `LIFECYCLE_COMPLETE`, `LIFECYCLE_FAILED` 입력을 `transitionLifecycle`에 위임한다. Frontend FSM은 자신의 lifecycle/error state만 변경하고 task를 실행하지 않는다.
- Application boundary는 `interfaceFSM.send`로만 상태를 전이하고 `interfaceFSM.state`에 직접 대입하지 않는다.
- 기존 `appFSM.run` public function을 같은 Application boundary 함수로 연결하여 UI handler 호출 계약을 보존했다.
- 실패 시 error projection, error 상태 publish, ready 복귀, 원래 오류 전파 순서를 유지한다. 새 task queue, 새 authoritative state, bridge 또는 별도 FSM을 추가하지 않았다.

## 테스트 및 도구 실행 증거

- regression browser test 36번 추가: 동기 rejected 결과, 비동기 busy guard와 완료, task 예외 전달, Frontend lifecycle failure 및 recovery event와 상태를 검사한다.
- GitHub Actions `Fast Figure regression` run `38748566493`, HEAD `b9660e772da7171100e9cf5d7b323ef864095390`: success (새 test 포함).
- GitHub Actions `Build distribution` run `38748446873`, HEAD `3d1dd0fc5eff373c60cd4127fa718f4810d9511d`: success. 빌드 산출물 `dist/inline/Fast-figure.html` 및 `dist/split/Fast-figure.zip`은 별도 bot commit `eb4ddc2b2fa437bcfc0ffc4be4273beec6b6d9e8`에서 갱신됐다.
- GitHub Actions `Development layer versions` run `38748774724`, HEAD `a93fa3161b34b98a93e3ccaa328d3255e47a9905`: success.
- 코드만 먼저 수정했을 때 발생한 version run `38748446574`의 failure는 r30의 fingerprint/metadata가 아직 source 변경을 반영하지 않았기 때문이다. Source Code r31과 fingerprint를 갱신한 이후 검사가 통과했다.
- 로컬 검사는 network 제약으로 실행하지 못했으며 GitHub Actions 결과와 구분한다. TLC는 실행하거나 기다리지 않았다.

## 개발 계층 판정

Source Code r31의 실제 fingerprint: `sha256:82854953e4608d8bd350a1968e1642fa1bd2af41b90a82786ee13ee27130593a`.

Source Code 상태는 `stale`이며 `validation_review: null`을 유지한다. Plan 016의 Interface FSM Backend registry 참조, reconciliation direct Backend queries, renderer direct reads, public API full cutover 등 미완료 범위가 있기 때문에 Source Script r25/PlusCal r11 전체 구현의 `current` 판정을 하지 않는다.

이는 lifecycle ownership 구현에 관한 WIP review이며 Plan 016 전체 완료 review가 아니다.

## 대안 및 위험 검토

- 기존 Interface FSM에 task callback을 남기는 방향: 책임 분리 위반으로 기각.
- 단순히 `InterfaceStateMachine.run` 본문을 Application 경계로 복사하고 `interfaceFSM.state`를 직접 대입하는 방향: Frontend FSM 소유 상태의 외부 변경 경로를 유지하므로 기각했다.
- 기존 UI 호출부 전체를 새로운 facade로 교체: 동일 호출 의미를 기존 `appFSM.run` public path로 제공할 수 있어 기각.
- TLC 완료 후 구현: 선택적 검증을 사실상 gate로 복원하므로 기각.

## 후속 작업

다음 작업은 Interface FSM의 Backend registry 직접 참조/selection validation을 Application boundary의 Backend query로 전환하고, commit 후 reconciliation의 직접 Backend 조회를 제거하는 것이다. renderer의 projection-driven cutover도 남아 있다. FFPX schema와 persistent project 의미는 변경하지 않았다.
