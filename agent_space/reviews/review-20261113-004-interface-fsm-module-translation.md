# Plan025 6a / frontend/interface_fsm — 정적 번역 종료

2026-11-13, code147/stale. Source150줄/PlusCal212줄/runtime507줄을 확인하고 4개 Source methods, 5개 PlusCal procedures, 15개 events 및 실제 Application/system caller를 대응했다. 정책/기존 대응 기록은 재사용했다. 목적은 명시된 전이·revision·소유 경계를 번역하는 것이며 UI 폴리싱이나 새 FSM 설계가 아니다. Plan은 그대로 두고 미완료 메모를 갱신했다.

## 전체 대응

| 명세 | sourcecode/frontend/interface_fsm.js 실제 경로 |
| --- | --- |
| InterfaceStateMachine_readState | readState: Frontend state와 단일 interfaceRuntime의 selectedSlotId/zoom/lock scalars만 immutable projection으로 반환. Backend read/import 없음. |
| publishRuntime | publish: revision을 정확히 한 번 올리고 readState의 final immutable projection을 subscriber에 전달. DOM dataset/busy/aria/debug는 그 결과의 target runtime 표시뿐이다. |
| InterfaceStateMachine_send / reject | 기존 Application validatedInput transport를 소비한다. rejected는 state/revision/selection을 유지하며 publish하지 않는다. 수락된 event는 Source 15 events에 한정한다. Backend command/query/task callback을 실행하지 않는다. 기존 region별 중간 publish loop 대신 Source의 최종 state를 한 번 publish한다. |
| SELECT_SLOT | validated reference/toggle-clear/workspaceHint만 소비, graphObject/index clear, 최종 none 또는 toggle-clear 시 asset clear, non-null model 선택은 독립 asset 보존, non-null 최종 선택만 overlay close. explicit deselection은 overlay 보존. raw slotId/direction으로 다시 판단하지 않는다. |
| SELECT_ASSET | supplied kind/path, graph selection clear, slot/workspace 보존. accepted repeat도 revision+1/publication 1회, rejected repeat는 그대로 유지. |
| SELECT_GRAPH_OBJECT / CLEAR_GRAPH_OBJECT | supplied validated index만 사용. CSV path hint가 제공된 경우에만 asset 변경, index-only 선택/clear는 독립 asset 보존. |
| CLEAR_ASSET_SELECTION | asset kind/path만 clear. |
| TOGGLE_OVERLAY / CLOSE_OVERLAY / OUTSIDE_CLICK / ESCAPE | supplied local overlay toggle 또는 close. 최종 state/publication 1회. |
| SET_DASHBOARD_ZOOM | locked면 no-op. finite numeric scalar/numeric text 입력은 50..200, invalid는100, actual change만 publish. Project layout/referenceWidth 수정 없음. |
| SET_DASHBOARD_ZOOM_LOCK / RESET_DASHBOARD_ZOOM | 첫 lock에 supplied finite positive width만 저장. invalid/repeated lock unchanged. unlock/reset은 lock=false,width=null,zoom100을 함께 적용하고 actual change만 publish. |
| LIFECYCLE_START / COMPLETE | Application이 전달한 lifecycle/완료를 반영하고 error clear, 한 번 publish. event/outcome label은 기존 subscriber plumbing이고 project result를 대체하지 않는다. |
| LIFECYCLE_FAILED | Application이 만든 event/message projection을 freeze, error publication→같은 처리의 ready recovery publication. error는 다음 START/COMPLETE까지 유지. 두 번의 revision/publication을 보존한다. Error 객체 해석은 실제 Application runLifecycleTask로 옮겼다. |
| InterfaceStateMachine_reconcileProjectResult | supplied selectedSlot/assetKind/path/graph index/workspaceHint만 한 번 반영·publish. Backend null kind는 Frontend none으로 표현. 별도 hint 저장/SELECT_GRAPH_OBJECT 재전송/Backend 조회 없음. |
| InterfaceStateMachine_notify | booting/region과 무관하게 projection revision만 publish. 정의의 update 또는 payload callback을 실행하지 않는다. |

기존 definitions/객체명 metadata와 물리적 helper는 재설계하지 않았다. 실제 send/notify는 region callback dispatch를 더 이상 사용하지 않는다. 초기 ready helper는 기존 Application-supplied workspace로 준비된 runtime을 완료하며 추가 Backend read를 하지 않는다.

## 같은 소유 단위의 실제 caller 연결

- application/adapter.js의 lifecycle failure는 error 원본을 다시 실행/소비시키지 않고 event/message만 Frontend에 전달한다. 원래 task error의 전파는 Application에 그대로 남는다.
- backend/project_state.js에서 Frontend interfaceRuntime import 및 ui registry mirror를 제거했다. Frontend notify도 Backend 객체 metadata/update reader를 호출하지 않는다.
- system.js audit는 metadata의 ui 이름을 Frontend interfaceFSM.readState로 확인하고 나머지 영속 이름만 projectObjects.read로 확인한다. metadata를 삭제하거나 Backend에 runtime 사본을 두지 않고 실제 audit 소비자까지 함께 번역했다. 이로써 memo의 ui 역의존은 해소했지만 tree/trash 때문에 project_state 전체는 여전히 미완료다.
- subscriber는 이제 중간 region state가 아니라 final immutable read projection을 받는다. 기존 regression63의 state pointer 동일성 기대를 revision/final selectedSlot 값으로 맞췄다.

## 정적 증거 / 다음 범위

기존 regression37을 확장해 boot notify, final slot 한 번 publish/독립 asset 보존, index-only/clear, explicit deselection overlay, rejected local event, immutable error→ready 두 번 publish, notify callback 미실행을 기록했다. probe 종료 시 runtime/DOM 표시를 복원한다. 기존 lifecycle36과 zoom46의 계약도 정적으로 대조했다. 새 ID 없음, 모든 fixtures 미실행.

code147/stale `sha256:8ed2e241069dddedb626a927d3bc80fa71b0b4c7df7e00f88f8183a89c788590`. 독립 canonical-LF hash로 이전146 `sha256:3ab32590a35bf1358af69f180651c946bdb1c65890bda5b9bde051d32b41b909`를 재현했다. Source45/PlusCal25/verification26/derived_from 불변. app/test/build/checker/TLC/browser/Actions/remote/commit/push/goal 없음. 정적 번역 종료는 공식 checker/native 통합 검증 통과가 아니다.

다음은 Plan025 6b application/adapter 전체 절차다. 미완료 tree/public/UI 의미·Frontend legacy 자원·실행 검증은 memo/20261113-001.md에서 이어받는다. system/adapter 전체 모듈을 이번 연결 수정만으로 종료한 것은 아니다.
