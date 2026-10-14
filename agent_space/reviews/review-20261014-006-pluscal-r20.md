# PlusCal translation review — Source Script r20 / pseudocode r6

## 대응 범위
Source Script r20의 plan-014 변경을 `api_ui.pcal`, `application_fsm.pcal`, `assets_files.pcal`, `renderer_runtime.pcal`에 직접 번역했다.

## 번역 대조
- Layout selection: UI-local set, slot toggle, 두 종류 background clear, command consumer, grid/overlay close clear를 번역했다.
- Application FSM: 모든 region 처리 후 logical-event result를 확정하고 completion을 반환하는 순서를 번역했다.
- Trash mutation: move/empty 결과에 실제 removed graph reference count와 reset image slot count를 포함했다.
- Renderer: mutation result 기반 FULL_DASHBOARD / TARGETED_PROJECTION / NONE 판정과 send 완료 뒤 단일 projection 적용을 번역했다.
- renderer가 project mutation/FSM event를 재발행하지 않는 경계를 assertion으로 남겼다.

## 상위 의미 보존
새 PlusCal은 Source Script에 없는 persistent state나 새로운 domain transition을 추가하지 않는다. Layout selection과 projection effect는 UI/runtime 상태이며 project authority가 아니다.

## 다음 단계
verification-model r16은 pseudocode r6에 대해 stale다. 새 pseudocode가 project transition 자체보다 result/projection contract를 확장했으므로 verification abstraction의 변경 필요 범위를 검토하고 TLC gate를 다시 current로 만든 뒤 Source Code로 진행한다.
