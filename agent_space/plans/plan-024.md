# Plan 024 — 남은 명세 번역과 단계별 마무리

> 2026-11-12 갱신: 앞으로의 작업 순서·모듈별 범위·종료 관리는 `agent_space/plans/plan-025.md`를 따른다. 아래 원래 단계와 r133–141 기록은 이력으로 보존한다. 현재 활성 번역은 3단계이며, 아래 최초 기준의 r132/1단계 표기는 현재 상태가 아니다.

작성: 2026-11-06. 이 계획은 plan023의 **앞으로 수행할 작업과 순서**를 대체한다. plan023의 구현 이력·근거·실행 제한과 기존 patch/review는 보존한다. Source나 정책을 바꾸는 계획이 아니다.

## 1. 목적과 현재 기준

Source Script → PlusCal → 코드의 남은 번역을 완료한다. 현재 동작이나 테스트 통과보다 명세의 절차·책임·상태·참조·수명 관계를 실제 호출 경로까지 옮기는 것이 목적이다. 폴리싱이나 테스트 확대를 주 작업으로 삼지 않는다.

- 의미 권위: Source r45(closed), PlusCal r25(current). 선택적 verification-model r26(stale, TLC pending)은 구현의 필수 gate가 아니다.
- 코드: r132/stale. `development-versions.json`이 revision/fingerprint/derived_from의 유일한 원천이다. r132 공식 version-checker 검증은 미수행이다.
- 로컬 HEAD: `28e6dc762c75c8a2ffbbe53ed08b323f0b2b82bd`. 이후 변경은 미커밋 WIP이며 HEAD만으로 현재 구현을 식별할 수 없다. 기존 WIP, 실패 로그, review, patch001–004를 보존한다.
- 활성 범위는 여전히 **1단계 supplied-input 화면 renderer와 실제 호출자 경계**다. 1→2→3→4 순서를 유지한다.
- 과거 성공·정적 점검·작성된 테스트는 현재 코드의 실행 검증이 아니다. r129에서 발생한 로컬 실행 위반은 plan023/review001의 이력으로 남기며 새 계획으로 정당화하지 않는다.

## 2. 선행 구현과 미완료를 구분

다음은 다시 만들 작업이 아니라 남은 연결·누락 여부를 판단할 기존 구현이다. 어느 항목도 이것만으로 전체 완료를 뜻하지 않는다.

| 이미 구현된 범위 | 남은 판정/연결 |
| --- | --- |
| supplied dashboard rendering, graph generation/operation/host guards, image decode lifetime, Backend commit-effect 전달 | Source의 나머지 분기와 production caller에 빠진 연결이 있는지 확인·구현 |
| startup, selected-chart/workspace, geometry/zoom/style, resize, click/drag suppression, narrow caption/palette 반영 | 개별 과거 review의 OPEN 문구를 그대로 반복하지 말고 후속 구현과 대조해 실제 잔여만 처리 |
| file-drop prepare → public import → finally drag finish, public import/export lifecycle ownership | 실제 mounted 수신부·선택·collision·renderer 연결과 실패/cleanup 경로의 미확인 부분 처리 |
| r130 lifecycle 입력 검증, r131 graph editor/public reads, r132 VFS 이동·드래그·선택 query | 유지하되 단계 분류를 바로잡는다. 일반 API/Backend 확장은 3단계 선행 구현으로 취급하며 1단계 완료 근거로 세지 않는다. |

관련 근거: plan023의 unit65–80, `agent_space/reviews/review-20261023-008-screen-fixtures-open.md`부터 `agent_space/reviews/review-20261023-016-file-drop-boundary-open.md`까지의 해당 리뷰, `agent_space/reviews/review-20261023-018-regression-scope.md`, 20261106 review001–004. 과거 fixture156/157/159/169는 삭제되었으므로 이를 현재 검증 증거로 재사용하지 않는다. 현재 회귀는 역사적 ID를 유지한 167개이며 실행 대기다.

## 3. 1단계 — supplied-input 화면과 호출 경로 마무리 [현재]

### 범위

권위는 `sourcescript/frontend/renderer.py`, `sourcescript/frontend/interface_fsm.py`, `sourcescript/frontend/mantine_ui.py`, `sourcescript/application/adapter.py`, 관련 public API와 system Source 및 대응 PlusCal이다. 구현은 `sourcecode/frontend/renderer.js`, `sourcecode/frontend/interface_fsm.js`, `sourcecode/frontend/mantine_ui.js`, `sourcecode/application/adapter.js`, 화면에 직접 연결되는 public API, `sourcecode/system.js`를 따른다.

### 다음 작업과 순서

1. 기존 procedure/caller map을 후속 구현과 합쳐 현재 상태로 갱신한다. 첫 작업은 **실제 mounted dashboard의 drop/selection → public API → final interface state → supplied renderer 연결**이다. prepare/잘못된 대상/취소/throw/finally cleanup이 실제 수신 경로에 연결되는지 확인하고, 누락이 있으면 그 호출 경로 전체를 같은 단위에서 구현한다. 이미 구현된 dashboardExternalFileDrop을 다시 만들거나 mock 순서 검사를 복원하지 않는다.
2. 나머지 화면 절차를 묶음별로 마무리한다: startup/workspace/selection, graph/image 완료·교체·실패, commit invalidation와 narrow caption/palette, geometry/zoom/resize, click/bookmark drag/suppression. 각 Source 절차·분기를 대응 PlusCal과 실제 entry/caller에 연결한다. 확인된 누락은 조사 전용 패치로 떼지 말고 해당 ownership 단위에서 즉시 번역한다.
3. 기존 회귀 중 변경된 계약과 충돌하는 fixture/호출자를 필요한 범위만 수정한다. 실제 사용자 경로가 아니라 구현 모양을 강제하는 choreography를 추가하지 않는다. 과거 실패109/157이나 삭제된 case를 현재 결함/미구현으로 단정하지 않는다.
4. 위 범위의 완료 판정을 남긴다: 절차별 구현 위치, 실제 호출자, 소유 상태/자원, 미확인 실행 항목을 구분한다. 아직 실제 구현 누락이 있으면 가장 큰 관련 경로부터 이어서 처리한다.

### 범위 경계와 종료 기준

- 화면 경로를 완성하는 데 직접 필요한 Backend query/public adaptation만 함께 수정한다. 인접한 일반 VFS/graph API 누락을 발견했다는 이유만으로 확장하지 않는다.
- 모든 해당 화면 절차·분기가 실제 entry/caller에 대응하고, 알려진 구현 누락이 없으며, 공급 입력과 Frontend 상태/상호작용 소유 경계가 명확하면 **구현 범위 종료**를 기록한다.
- 브라우저 native 동작, Plotly, mounted React/listener, inline/split 실행은 별도 미검증으로 명시한다. 미실행을 pass나 전체 기능 완료로 부르지 않는다. 실행 허가가 없다는 이유만으로 안전한 명세 번역 전체를 대기시키지 않되, 실행으로만 판단 가능한 미확정 의미/결함이 다음 구현을 막으면 그 경계를 명시하고 중단한다.
- 일반 freshness 정리와 current capture/export 자원 수명은 이 단계 완료를 가리는 우회 작업으로 삼지 않는다.

## 4. 2단계 — current capture와 export 자원 수명

1단계 구현 범위 종료와 잔여 실행 의존성 기록 후 착수한다. 권위는 Source renderer의 current/target export, 이미지·그래프 raster/cleanup/handoff 절차와 대응 PlusCal이다.

- current viewport/geometry/style과 live Plotly handle이 await를 사이에 두고 어떻게 사용되는지, 화면 변경·교체·obsolete 작업의 유효성과 작업 소유 자원을 명세와 대조해 번역한다. 임의의 freeze/최신값 동기화 프로토콜을 만들지 않는다.
- 실제 graph/image/label/caption 경로, image clipping과 caption paragraph 표현을 처리한다. target export의 작업별 host/image/URL 생성·해제를 포함해 기존 구현과 누락을 구분한다.
- 렌더링/encoding/handoff 원래 실패와 cleanup 실패가 겹친 경우 원래 실패를 보존하고, cleanup-only 결과는 Source의 계약대로 처리한다. progress/status/telemetry는 결과 권위가 아니다. r117/r118 및 r129 구현을 다시 작성하지 말고 남은 경로를 완성한다.
- 기존 회귀147–150 등에서 실제 변경에 필요한 항목만 보완한다. `agent_space/memo/20261023-001.md`는 후속 확인 목록이며 새로운 설계 권위가 아니다.

종료: current/target의 명세상 읽기·비동기 유효성·자원 획득/해제·실패 전파 경로에 구현 누락이 없고 실제 호출 경로가 연결되어야 한다. 남은 실행 확인을 기록하고 3단계로 이동한다.

## 5. 3단계 — 나머지 Backend/Application/UI 번역

2단계 범위 종료 후 수행한다. 선행 구현된 r130–132를 기준으로 남은 것을 처리하며 전체 API를 다시 만들지 않는다.

- 자산 tree/readTrash의 **정확한 Source/PlusCal projection**과 실제 tree/휴지통 확인 UI를 한 단위로 연결한다. 현재 Application의 readTrash 요약을 공식 subtree와 같다고 간주하지 않는다. readTree의 현재 shape도 명세와 대조하며 기존 UI 편의를 위해 상위 명세를 바꾸지 않는다.
- graph editor 및 기타 public read/selection/mutation wrapper의 미번역 절차를 각 owner의 Source/PlusCal에 맞춰 Backend query/candidate, Application adaptation, UI 소비까지 연결한다. 이미 처리한 graph readData/palette/default/hasSelectedSlot와 VFS 이동·드래그 query는 재작업 목록이 아니다.
- config/debug/utility 등 남은 소유 경계를 처리한다. 모든 private helper를 이름만 맞추려고 분리하는 것이 아니라 명세상 기능·책임·분기를 보존한다.
- 보류된 current-authority/freshness 항목을 소유 단위에 배치해 처리한다: Layout changeGrid의 event-time companion dimension, application-source에서 채워지지 않는 programmaticPlotlyRelayout map의 계약 기반 판단, imageInput의 원래 decode identity와 최신 settings의 구분. 일반 강제 refresh/cache 동기화 설계를 만들지 않는다. 이미 종결된 항목은 중복 수정하지 않는다.

종료: 해당 owner별 명세·실제 경로·구현 차이에 알려진 누락이 없고, 상위 의미 변경 없이 번역 가능한 부분이 완료되어야 한다. 새 의미가 실제 필요하면 Source부터 돌아가 닫힘·PlusCal 전파를 기록한다.

## 6. 4단계 — 허가된 통합 검증·빌드·lineage 판정

실행 권한은 이 계획 작성으로 생기지 않는다. 사용자의 해당 작업에 대한 명시적 Actions 허가 및 필요한 저장소 쓰기 권한이 있어야 실행한다.

- 기존 regression scope 정리 WIP를 포함한 정확한 검증 대상 변경 집합/commit을 특정한다. Contents API 등 정책의 쓰기 절차와 workflow 정의·트리거를 확인한다. 무관한 수정이나 빈 변경으로 실행을 유도하지 않는다.
- 공식 version checker와 적절한 baseline progression, pseudocode fidelity(정적 범위 검사), module/portable build 및 inline/split 브라우저 회귀를 실제 workflow 범위에 맞게 수행한다. TLC는 선택적이다.
- production drop/listener/collision/selection, Plotly graph/image lifetimes, export raster/handoff 및 기존 실패 경로의 결과를 확인한다. 실패는 명세→구현→fixture 중 원인을 구분해 해당 책임 단위에서 수정한다. 테스트를 통과시키려고 명세나 실패 기준을 낮추지 않는다.
- run ID, 대상 commit, job, 로그, 실제 결과와 미실행을 기록한다. 예전 r116/r129 결과나 로컬 canonical hash는 최신 코드의 Actions/checker 통과가 아니다.
- 전체 상위 계층 대응과 요구된 실제 검증이 확인되기 전에는 code를 current로 올리지 않는다. dist는 빌드 산출물로만 생성한다.

권한 미부여 시: 구현 완료 범위와 실행 대기 항목, 필요한 최소 허가를 보고하고 실행 단계에서 멈춘다. 이를 해결하려고 로컬 실행으로 우회하지 않는다.

## 7. 작업 방식·검증·중단 조건

- 작업 선택 전 현재 단계와 직접 관계를 설명할 수 있어야 한다. 이후 단계에서 발견한 불일치는 해당 단계 잔여로 기록하며, 임의로 현재 단계라고 재분류하지 않는다.
- 같은 화면/owner의 관련 명세 절차와 실제 호출 경로를 coherent 단위로 묶는다. 한두 줄 수정으로 매번 끝내거나, 반대로 무관한 owner를 한 패치로 묶지 않는다. 준비·폴리싱·문서 작성만 반복하며 구현을 미루지 않는다.
- 테스트는 변경 계약의 실제 회귀 확인에 필요한 기존 case를 우선 보완한다. 새로운 case가 꼭 필요할 때만 이유와 검증 대상을 명시한다. 테스트 수는 진척 기준이 아니다.
- 모든 수정에 실제 incremental diff와 `agent_space/patches/YYYYMMDD-NNN.patch`/동명 `.md`를 기록한다. 코드 변경 시 revision/fingerprint/현재 Source+PlusCal lineage를 갱신하되 공식 checker 미통과를 완료로 기록하지 않는다. 문서만 바꾸는 이번 계획에서는 semantic layer revision을 올리지 않는다.
- 허용되는 로컬 작업은 읽기·편집 및 정적 파일/diff/hash 작업이다. application/test/build/checker는 로컬에서 실행하지 않는다. Actions·commit/push·delegation·새 goal 등록은 이 계획의 암묵적 허가가 아니다.
- 임시 projection/snapshot은 작업 입력일 뿐 독립 권위·재사용 current cache·mutation candidate로 승격하지 않는다. 기존 정책, WIP, dist와 사용자 파일을 보존한다.
- 상위 계약의 충돌, 새 의미 필요, 해결 불가능한 동시 수정, 필요한 접근/실행 권한 부재 또는 실행 없이는 결정할 수 없는 장애가 있으면 해당 경계에서 중단한다. 근거 경로, 시도한 방법, 남은 불확실성과 필요한 사용자 입력을 보고한다. 인접 기능 수정으로 우회하거나 plan 순서를 바꾸지 않는다.

## 8. 진행 기록 — r133 (2026-11-06, 1단계 유지)

첫 경로의 실제 누락을 구현했다. Adapter의 dispatchSlotSelection을 Source/PlusCal대로 추가하고 public 선택과 drop 준비가 그 최종 state/projection을 소비하도록 연결했다. 거부 시 query/repaint/resize 없이 반환하며, explicit pending type은 final non-null empty target에만 Project command로 적용한다. mounted drop은 기존 단일 stable receiver를 유지하고 direct dashboard host만 target으로 인정한다. 선택 준비 오류도 finally drag cleanup을 거치며 원래 오류를 보존한다.

기존37/93/94/171만 변경했으며 새 테스트를 추가하지 않았다. review `agent_space/reviews/review-20261106-005-selection-screen-open.md`, incremental patch `agent_space/patches/20261106-006.patch`/동명 설명이 범위와 한계를 기록한다. code133/stale, 공식 checker/브라우저/build/Actions 미실행이다. Source45/PlusCal25와 정책·dist·기존 WIP는 보존한다. 전체 단계 완료나 새 stage/goal 전환은 아니다. 다음은 §3의 나머지 화면 절차·실제 caller 중 graph/image completion·교체·실패 및 narrow invalidation/geometry 관계를 후속 구현까지 포함해 대조하고 실제 누락을 구현하는 것이다.


## 9. 진행 기록 — r134 (2026-11-06, 1단계 유지)

다음 단위는 §3의 graph/image 완료·교체·실패와 resize의 surface ownership으로 정했다. document에 연결되어 있다는 사실만으로 같은 slot host의 자식이라고 판단하던 누락을 번역했다. graph child가 사라진 경우 narrow/workspace fallback과 full-render 교체가 같은 소유 판정을 사용하고, 연결된 다른 host로 이동한 plot에는 old callback/resize를 적용하지 않는다. image도 host containment를 확인하며 새 render 없이 stale decode가 성공/실패해도 자신이 소유한 element/src만 해제한다. 동일 association인지 확인한 뒤 map entry를 제거하므로 새 surface나 공유 image의 다른 surface를 무효화하지 않는다.

기존153/154/158/164만 필요한 범위에서 수정했고 167개 ID를 유지했다. review `agent_space/reviews/review-20261106-006-surface-ownership-open.md`, incremental patch `agent_space/patches/20261106-008.patch`/동명 설명. code134/stale, canonical LF hash 정적 계산만 수행했다. 앞선 d8ac43924660080e575c5fd68bee9088b4f96c2b 대상 version/fidelity/regression/build Actions 성공은 r133에 한정되며 이번 변경의 실행 근거가 아니다. 이번 단위는 local app/test/build/checker 또는 Actions/remote write를 실행하지 않았다.

1단계 전체 종료 판정은 아직 아니다. 후속은 supplied geometry/zoom/style이 graph/image/label/caption의 실제 caller까지 전달되는 관계와 나머지 click/bookmark/controller 분기를 상위 절차에 대조하고, 구체 누락이 확인되면 같은 owner 단위로 구현한다. capture/export·일반 API 확장으로 우회하지 않는다. 상위 Source/PlusCal/정책, dist, 기존 WIP·실행 로그·patch를 보존한다.


## 10. Geometry/style/zoom actual screen callers — r135 (2026-11-06)

Continues stage1, not capture/export or general API expansion. Source public layout procedures and supplied renderer steps1/6/7 are connected through the actual Mantine style/grid/zoom/lock/reset/completion entries.

- Committed style/grid now use the existing committed-projection invalidation boundary and its full supplied renderer. Rejection has no success render. Separate CSS-only updates/redundant resize requests were removed; existing layout notification and fresh public reads are retained.
- Changed session zoom/lock/reset now present current supplied geometry **and content scale** together. First-lock measurement, invalid-width refusal, no-op state and Project nonmutation semantics are preserved. No-op calls do not repaint. Zoom completion only notifies once and reads, rather than delaying the actual content update until completion.
- Existing cases45/46 were adapted, with no new IDs/suites. Caption scaling/generation checks observe the real renderer, not an added helper choreography. All execution verification remains pending.
- Code r135/stale, canonical-LF static fingerprint `sha256:29c5e333e63d5d7a64b0b145c543053b04eb26bf5b8387241ecd4428bbf94091`. Source45/PlusCal25/verification26 and lineage unchanged. Static calculation is not official checker validation. No application/test/build/checker/Actions execution, commit or push in this unit.
- Evidence: `agent_space/reviews/review-20261106-007-layout-screen-open.md`, actual incremental patch/explanation `agent_space/patches/20261106-009.patch` / `.md`. Existing WIP and records preserved.

Stage1 remains open: finish remaining controller/caller and narrow effect correspondence, distinguishing implementation coverage from pending execution. No new authority, general refresh/cache mechanism, or local execution permission is introduced.

## 11. Selection caller resize lifetime — r136 (2026-11-12)

Continues stage1 after full policy/current-plan and relevant Source/PlusCal reads. Public setSelectedSlot handed the final supplied state to updateGraphView but delayed a global window resize event. That callback could acquire a later workspace and invoke the broad observer refresh path rather than retaining its requesting graph lifetime. It now immediately calls the existing schedulePlotResize owner after workspace handoff. The existing frame callback checks captured instance/generation/operation/slot/chart/host identity; rejection still returns without render/resize. No new scheduler/state/selection semantics.

Existing case160 is extended through the actual public entry: exact final state/projection handoff, obsolete operation ignored, current selection resized and rejected selection silent; it rejects any synthetic global event. No new case IDs. Static diff/whitespace and canonical-LF hash checks only; no app/test/build/checker/Actions execution. Prior r135 hash was independently reproduced from pre-edit bytes. Code136/stale hash `sha256:88a9efa34356b8e38b355e8f8b18f1ae7a844f09a80aaac86202cc6f15ec5acc`; Source45/PlusCal25/verification26 unchanged. Review `agent_space/reviews/review-20261112-001-selection-resize-open.md`; incremental patch/explanation `agent_space/patches/20261112-001.patch` / `.md`.

Stage1 remains open: finish the remaining procedure/caller map and narrow effect/controller correspondence using current implementations, not historical OPEN lists. Native browser/Plotly/mounted listener and inline/split execution remain pending separately. No capture/export/general API work, policy/dist changes, commit/push or delegation; prior WIP preserved.

## 12. Screen scope closure and current/target raster translation — r137 (2026-11-12)

User clarification: this is pseudocode → sourcecode translation, not new feature implementation. The complete policy was reread, with Source consulted for ambiguous intent. The remaining screen controller/narrow/workspace/geometry/startup procedures and actual callers are mapped in `agent_space/reviews/review-20261112-002-screen-export-translation.md`. Already translated procedures were not rewritten for volume. One missing startup primitive was translated: supplied project/reference/runtime audit now follows style, without Backend reads, repairs or publication. Final authoritative invariant audit remains with system/owners.

**Stage1 static translation scope is closed** after that correction and procedure/caller map; native Plotly/browser/mounted timing/inline-split execution is still pending. This does not promote whole code lineage to current or claim fidelity validation.

Then the planned stage2 current/target raster unit was translated coherently. Current capture no longer retains live plot handles across awaits: supplied figures render in task-owned hosts at one-shot measured viewport dimensions. Graph/image slot clipping, supplied caption border visibility, paragraph/prefix/blank-line caption painting and measured viewport font/padding are connected. Target caption painting uses an explicit alphabetic baseline. Both paths use finally-owned decoded image sources and canvas backing stores, retaining existing task-local Plotly/URL cleanup, original Error/null/undefined failure, limits/encoding/one-handoff outcomes and non-authoritative progress. No capture preset, cross-task snapshot store, freeze/latest-sync protocol or new domain rules.

The named stage2 procedures/resource boundaries are now translated in the statically inspected scope; remaining native font/Plotly/canvas/download and integration verification is explicitly deferred, not substituted with helper-count claims. The next translation scope is stage3: general dispatchProjectCommand tuple and actual public consumers, then remaining Backend/Application/UI correspondence and deferred read/freshness owners. Execution permission is not required to continue that translation.

Existing cases15/147/148/149 were extended; no new case IDs. Only static file/diff/whitespace and independent canonical-LF hash inspection; no application/test/build/checker/TLC/Actions/remote/commit/push/delegation. Code137/stale canonical fingerprint `sha256:789a25f36c02776a713b180ea0c9a0550c73ba9a77a34295795a968d704d94de`; Source45/PlusCal25/verification26 and lineage unchanged. Official checker validation remains pending. Incremental pre-edit-WIP patch/explanation: `agent_space/patches/20261112-002.patch` / `.md`; prior WIP, policy, upper layers, dist and existing evidence preserved.

## 13. General command tuple and public-consumer boundary — r138 (2026-11-12)

Continues stage3 as pseudocode → sourcecode translation, not feature design. `dispatchProjectCommand` now preserves the full Source/PlusCal procedure: registered-command requirement, one Backend transaction, postcommand Frontend reference read, noncommit `[result,state,null]`, or one validated reconciliation followed by the renderer query with final state and mutation result, returning `[result,state,projection]`. Errors propagate; later query/render failure does not undo a commit. Reconciliation's returned read includes runtime selected slot/zoom, without another publication.

Every production direct consumer was searched and adapted: adapter-local range/palette/selection/facade/invalidation paths, all four public API files, and physically Backend-located Application CSV/image creators. Public chart/settings/scalar/path/item/null/false/noncommit return contracts remain distinct; the internal tuple does not escape through public bindings. Supplied final state/projection reaches existing narrow/full presentation owners without rereading or forcing full rendering. Project import and post-connect selection no longer duplicate presentation. Fresh official owner reads, independent valid CSV selection, ordered per-file import/target capture, explicit batch atomicity and one outer lifecycle are preserved.

Full procedure/branch/production-caller correspondence and limitations are in `agent_space/reviews/review-20261112-003-command-boundary-translation.md`. Existing regression cases were extended/adapted for tuple/order/identity/noncommit silence, actual graph wrapper handoff and postcommit query failure; fixtures were **not executed**. No fixture proliferation or execution/count-based completion claim.

**Stage3 remains open.** Actual UI tracing found pre-existing public-result ambiguities at `sourcecode/frontend/mantine_ui.js:1781` (palette success reporting after a possible noncommit return) and `sourcecode/frontend/mantine_ui.js:664` (move null-result dereference), including related palette reset protocol. Supervisor direction is to preserve Mantine bytes in this tuple/public-wrapper unit, not invent a UI result protocol absent detailed Source UI authority. These paths are not accepted as translated/correct; follow-up must resolve the UI correspondence upstream. Public wrapper success effects themselves remain commit-gated. Deferred tree/readTrash projection and unrelated general read/freshness owners also remain open. Screen/export static scope closure is unchanged; native/integration verification is separately pending.

Exact pre-edit working-byte snapshots were used, not HEAD; previous WIP and intentional artifacts are preserved. Code138/**stale**, independent canonical-LF fingerprint `sha256:65ac8481f55dbb75be947d677f6d199e3f9ccef95a23e54b6a6dbc880157590a`; Source45/PlusCal25/verification26 and `derived_from` unchanged. Static read/search/diff/whitespace/hash only; official checker, app/tests/build/TLC/browser/Actions were not executed. No policy/upstream/dist/generated/workflow/remote/commit/push changes or nested delegation. Incremental patch/explanation: `agent_space/patches/20261112-003.patch` / `.md`. Independent final review remains required.

## 14. Tree/readTrash public-consumer contract blocker — no revision (2026-11-12)

Continues authorized stage3 translation with a full Backend/public/actual-Mantine read trace. Source specifies the canonical current VFS tree and trash subtree; PlusCal builds directory nodes in existing order, appends CSV then image nodes in collection order, attaches canonical parents, and returns the exact trash path subtree for readTrash. Production instead exposes a flat directories/data/images/charts/slots summary and a separate Application `{hasContents,referenceCount}` trash summary. Their current shape is not authority to change upstream intent.

Every production consumer was mapped, including tree selection/move versus non-trash-only slot connection, CSV readability/row counts and repeated real references, all visible slot/chart/reference rows and target IDs, empty-trash confirmation and graph-editor CSV options. Existing official reads were examined: selected slot/graph reads and layout geometry do not supply the all-slot/chart summary; explicit per-asset deletion-target owners/counts do not themselves specify an aggregate trash-root confirmation contract, and the current public wrapper further restricts this to selected identity/count. Renderer/export inputs are not new public Mantine authority.

**Concrete upstream meaning remains missing:** how to preserve these retained UI facts/confirmation through official current reads while exposing the specified canonical tree/subtree. Supervisor approved documentation only, not an unused Backend branch, isolated breaking shape change, omitted UI behavior, new summary/envelope/API or Frontend access to Backend. Source must resolve any new meaning first, then PlusCal, before coherent runtime translation. Detailed procedure/branch/actual-caller map, evidence, alternatives and omissions: `agent_space/reviews/review-20261112-004-tree-trash-contract-open.md`. Tree scope and stage3 remain open; deferred palette/null-move UI meaning remains unchanged.

No runtime, fixture, metadata or upstream bytes changed. Code138/**stale** and canonical-LF fingerprint `sha256:65ac8481f55dbb75be947d677f6d199e3f9ccef95a23e54b6a6dbc880157590a` independently reproduced; Source45/PlusCal25/verification26 and lineage byte-preserved. Static read/search/diff/hash and incremental patch consistency only; no app/test/build/checker/TLC/browser/Actions/remote/commit/push/generated/dist/workflow/policy execution/change. No test-count or unexecuted validation claim. Exact pre-edit WIP baseline and prior artifacts preserved; incremental docs patch/explanation `agent_space/patches/20261112-004.patch` / `.md`. Independent reviewer gate remains required, not final acceptance.

One independent already-specified next proposal, **not edited/auto-authorized**: Layout `changeGrid` invocation-time companion dimension (§5), replacing render-closure completion through the existing current `layout.readState`/setGrid owners, without stale whole-layout merge, cache or API. Authority/caller locations and the bounded proposal are recorded in the review. Continue only under the supervisor's next bounded assignment; do not reopen the blocked tree shape by invention.

## 15. System startup translation and independent blocker correction — r139 (2026-11-12)

Continued under the user's translation-only instruction and authorized separated subagent exploration/review. A direct full Source/system and PlusCal/system correspondence found a concrete complete-caller gap: the actual system published API before initial presentation/ready and audited before Mantine mount, with no explicit core/renderer prerequisite assertion. Earlier stage1 static supplied-renderer coverage did not close that system-caller order; this is a correction to its recorded boundary, not a new product design.

Translated `initializeFastFigure` as one sequence: initial candidate must validate with required slots before replacing Backend authority; construct existing concrete registries/FSMs; require actual core bindings and renderer hosts; existing Application supplies initial read/state/actions to startup renderer; ready; expose immutable public API; mount UI; final owner audit; return the specified completion. Existing invalid legacy callable checks now bind the actual import/initial-candidate owners. No new FSM, state store, fallback/retry/rollback or synchronization rule. Existing regression15 covers ordering, prerequisite/candidate failure and restored mocks; fixtures are not executed. Full correspondence: `agent_space/reviews/review-20261112-005-system-startup-translation.md`.

Independent review of §14/review004 **blocked its overbroad blocker claims**. Canonical trash traversal plus existing specified explicit-path deletion-target reads supplies nonempty detection, disjoint real-reference counts and detached CSV rows/headerLines. The selected-only JS wrapper is an untranslated implementation restriction, not missing upstream permission. These facts do not need a new aggregate API/envelope. The genuine remaining preservation gap is all-chart/slot display correspondence, particularly editability for conversion/zero-reference charts. Review004/explanation004 now carry an explicit correction; original patch004 remains historical evidence and patch005 records the correction. The whole tree consumer migration still remains open; no runtime shape change was made here.

The Layout companion-dimension proposal at the end of §14 is **not approved translation**: independent policy review found that current-read rules do not define event-time input completion or invalid-input fallback. Resolve that meaningful input contract in Source then PlusCal first. Palette success/reset, null-move result and debug-toggle caller questions remain open; no inferred uniform result/toggle protocol is adopted. Separate read-only scout coverage found existing corresponding config/debug setter/graph public and layout read/session owners, not a further missing unit in that inspected scope. Remaining Backend graph/layout calculation correspondence has not been exhaustively closed.

Code139/**stale**, independent canonical-LF fingerprint `sha256:419427a0e71efed193e0ae5f5cd1767e5b4e3ca78920d2d241efe7897ae917ea`; baseline r138 fingerprint independently reproduced. Source45/PlusCal25/verification26 and derived_from remain unchanged. Static read/edit/diff/hash/patch consistency only; no app/test/build/checker/TLC/browser/Actions/remote/commit/push, upper-policy/spec/dist/workflow changes or new goal. Independent reviewer `dc9f97c5-44cd-45c1-b66d-134037e5730f` returned no issues / OK with notes for scoped runtime and Case15 only; not whole-stage, metadata/docs or execution acceptance. Incremental exact-WIP patch/explanation `agent_space/patches/20261112-005.patch` / `.md`. **Stage3 remains open; no native/integration/official validation pass is claimed.**

## 16. Written graph projection procedures — r140 (2026-11-12)

Per the user's direction to translate written procedures rather than polish, directly translated the graph calculation group after reading complete Source/PlusCal/runtime graph modules. NormalizeDivisor/ScaleCoordinate/tracesSingle now preserve scalar eligibility, ordered row pairing, divide-before-scale, finite-result rejection and config-owned computed styles. traces resolves the same-project unique owning chart/CSV and performs detached extension-first merges with explicit bar-mode omission. PlotlyAxis/layout reuse local normalized settings and configured defaults, preserve unknown extensions/font family, detach nested output and remove omitted optional fields. Existing Cartesian axis placeholders remain; no new feature/authority/public shape was designed. Existing regression66 was extended, no IDs added and no fixture execution. Correspondence/boundaries: `agent_space/reviews/review-20261112-006-graph-projection-translation.md`.

Code140/**stale**, independent canonical-LF fingerprint `sha256:0c703981ba2cc0bc20f3d5f3005937a6008d9c8d22caf4566534baa162dc3e92`; prior r139 fingerprint independently reproduced. Source45/PlusCal25/verification26 and derived_from unchanged. Incremental exact-WIP patch/explanation `agent_space/patches/20261112-006.patch` / `.md`. Static file/diff/hash/patch inspection only, not app/tests/build/checker execution; no Actions/remote/commit/push or upstream changes. **Stage3 remains open**: remaining Backend graph normalization/import/validation/candidate procedures and Backend layout correspondence are next written units; the previously recorded tree/UI input questions are separate and not permission to invent meaning.

## 17. Written Plotly import conversion — r141 (2026-11-12)

Translated ImportAxis/parsePlotlyToEditor directly: structural trace-order paired columns with null preservation and rectangular padding, config-owned bounded object styles and normalized modes, detached original/extension figures, no fake CSV/identity/rows, normalized title/font precedence and all four axes (finite inverse-log bounds, L ticks, minor-log rules). Import uses the existing pure normalizer rather than Application locks or first-object editor mirrors. Existing original and working config/frames copies remain independent for later conversion. Existing regression124 extended without new ids; fixtures NOT executed. Correspondence and actual candidate caller: `agent_space/reviews/review-20261112-007-plotly-import-translation.md`.

Code141/**stale**, independently reproduced r140 baseline and matched canonical-LF fingerprint `sha256:a785b8dc5287466d4fac2893a925adda97378de307965dd688216226a554700f`. Source45/PlusCal25/verification26 and derived_from unchanged. Exact prior-WIP incremental pair `agent_space/patches/20261112-007.patch` / `.md`; static file/diff/hash/patch checks only, no app/tests/build/checker/Actions/remote/commit/push/upstream changes. **Stage3 remains open**; continue written graph validation/normalization/candidate procedures and Backend layout, not polishing or inventing unresolved UI semantics.
