# Plan025 6b — application/adapter 정적 번역 종료 (r148)

Source `sourcescript/application/adapter.py` 134줄, PlusCal `pseudocode/application/adapter.pcal` 168줄, runtime `sourcecode/application/adapter.js` 전체를 확인했다. 기존 r138 command tuple/r133 selection/r147 Frontend owner 연결을 재사용하고 남은 직접 대응을 끝냈다. Source45/PlusCal25는 바꾸지 않았다. 이 모듈의 번역 가능한 절차를 메모로 이월하지 않는다.

## 다섯 절차와 실제 호출 경로

| Source / PlusCal | 코드 및 전체 분기 대응 |
| --- | --- |
| dispatchProjectQuery | 같은 이름의 thin Backend query 함수를 정의하고 실제 appFSM.query가 통과하게 했다. kind/request와 immutable projection을 그대로 전달하며 별도 read store/복제 candidate/Frontend mutable model 노출을 만들지 않는다. 기존 public API의 query 경로도 이 facade를 통과한다. |
| dispatchInterfaceEvent | reference events만 current Backend validate; graph selection에는 기존처럼 current Frontend selectedSlotId를 참조 입력으로 추가한다. rejected면 readState를 반환하고 publish하지 않는다. local event는 accepted envelope로 보내 Backend query를 하지 않는다. 실제 appFSM.send의 Frontend 경로를 이 절차로 연결했다. explicit graph selectAsset intent는 그대로 유지한다. persistent command facade routing은 기존 dispatchProjectCommand를 사용한다. |
| dispatchSlotSelection | validation→rejected unchanged tuple 또는 send의 반환 final state→선택이 남고 pending type이 명시된 경우만 official context read→empty/type 차이가 있을 때만 일반 command→final renderer query→[state,result,projection]. send 뒤 불필요한 두 번째 read 대신 반환 state를 사용한다. toggle clear/explicit null/direction, noncommit 조건부 command, failure propagation은 기존 owner 경로를 유지한다. 일반 command와 tuple 순서가 다름을 보존한다. |
| dispatchProjectCommand | 등록 확인→Backend send→Frontend read→noncommit tuple, 또는 validated reconciliation→한 번 reconcile→그 반환 final state/mutation을 renderer query에 전달→[result,state,projection]. 독립 graph-selection 재호출/추가 성공 read/rollback/별도 authority를 만들지 않는다. public wrapper의 scalar/settings/chart 반환은 해당 wrapper 책임이다. r138/r147 실제 구현을 재사용했다. |
| runLifecycleTask | ready 검사→requested importing/exporting 검사→local accepted START→task 정확히 한 번 invoke/await→성공 시 원래 task result를 outcome에 그대로 보내 COMPLETE, 원래 값을 반환한다. cancelled/rejected 결과도 완료이지 commit 주장이 아니다. sync throw/async rejection은 FAILED event/message→Frontend error/ready publish 뒤 원래 failure를 전파한다. Promise.resolve로 target-language InvokeAndAwaitOnce를 실현해 임의 thenable의 여러 resolve/reject에서도 completion이 한 번이며, completion 처리 오류를 task throw로 재분류하지 않는다. 실제 appFSM.run/public lifecycle callers가 이 절차를 통과한다. |

Frontend event label의 기존 cancelled/rejected 표시를 유지하도록 `sourcecode/frontend/interface_fsm.js`는 원래 outcome 값/기존 outcome 문자열을 표시용으로 해석한다. 원래 task result 자체를 다른 성공 payload로 바꾸거나 저장하지 않는다. Frontend에 task callback은 전달하지 않는다.

## 관련 production helper / 소유 연결

supplied renderer 준비/selection/geometry/style/palette/range callback helpers는 r133–139의 실제 화면 caller 대응을 재사용한다. Application 경계에서 공식 read와 final Frontend state를 일시 전달할 뿐 세 번째 FSM이나 저장된 read authority가 없다. lower-level Plotly range 변환도 Backend helper를 사용하고 command에는 identity/new patch만 준다.

정적 호출 검색에서 selectedProjectAsset/selectedProjectCsv/activateChartModel 및 dispatchDashboardAffectingEvent는 runtime 내부 production caller가 없는 legacy definitions다. 이를 새 논리 절차나 Frontend mutable read API로 사용하지 않았으며 이름 정리/삭제를 위한 폴리싱도 하지 않았다. projectImageDisplayUrl/release helper 역시 production caller가 없고 현재 공식 image read는 copied bytes/pure data URL이므로 새 resource cache/cleanup protocol이 필요하지 않다. Backend ui 역의존은 r147에서 실제 system/Frontend 소비까지 이미 해소되어 이번에 미완료로 돌리지 않는다.

## 증거 한계 / 메모 정정

기존 regression36은 accepted local lifecycle 경로, 적대적 thenable의 once-only 완료/원래 outcome identity, missing reference rejection 무publish, null/undefined 원래 failure의 recovery 후 전파를 추가했다. 기존 regression40은 직접 query/facade forwarding identity를 추가했다. 기존 command tuple/selection/lifecycle fixture도 유지했다. 새 ID 없이 fixtures를 작성했으며 실행하지 않았다.

사용자 정정에 맞춰 `agent_space/memo/20261113-001.md`에서 일반 모듈 backlog/미실행 검증 일정/이미 해결된 owner 연결을 제거했다. 남긴 것은 all-chart/slot read 의미 및 미정 UI input/result 분기처럼 Source 결정을 먼저 받아야 하는 항목뿐이다. 해당 Source에서 이미 정의된 tree/CSV/deletion-target 절차는 미룰 차단으로 세지 않는다. 이 adapter 모듈에는 알려진 번역 누락이나 Source 복귀 차단이 없다. project_state 전체 종료를 주장하지 않는다.

계획은 사용자 지시대로 지금 재작성하지 않는다. 다음 순서는 기존 Plan025 7a `application/public_api/contract`다. 공식 checker/fidelity/build/browser/inline-split 검증은 미실행이며 code148은 stale이다. 로컬 app/test/build/checker/TLC/browser, Actions, remote write, commit/push, new goal을 실행하지 않았다. byte hash/patch/whitespace 확인만 수행한다.
