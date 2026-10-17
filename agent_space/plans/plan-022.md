# Plan 022 — Source r37 → PlusCal pseudocode

## 1. 요구·선행 판정

사용자 요청: 현재 Source의 논리 검토 후 pseudocode 번역을 시작한다. 기준 HEAD `0e65d63d45d4974978b8467938b7e9b52a210c38`, Source r37 fingerprint `sha256:c94c310a8611c1f8994e5fe38ab5d0f8cd74ed0ecf4d902cada885d92278de5b`.

`review-20261016-019-source-r37-logical-structure.md`의 세 축 검토와 새 closure 기록을 근거로 Source r37을 closed로 기록한다. 의미 파일은 변경하지 않는다. PlusCal은 전체 번역·충실도 검토가 끝날 때까지 stale이다. optional TLC는 번역 시작/Source Code의 필수 gate가 아니다.

## 2. 파일 배치와 번역 순서

| Source 책임 | 목표 활성 경로 |
|---|---|
| system.py | pseudocode/system.pcal |
| backend/project_state.py + settings.json 참조 | pseudocode/backend/project_state.pcal |
| backend/project_efsm.py | pseudocode/backend/project_efsm.pcal |
| backend/assets_files.py | pseudocode/backend/assets_files.pcal |
| backend/graphs.py | pseudocode/backend/graphs.pcal |
| backend/layout_annotations.py | pseudocode/backend/layout_annotations.pcal |
| application/adapter.py | pseudocode/application/adapter.pcal |
| application/public_api 4파일, 단일 논리 모듈 | pseudocode/application/public_api/{contract,assets,graphs,layout_annotations}.pcal |
| frontend/interface_fsm.py | pseudocode/frontend/interface_fsm.pcal |
| frontend/mantine_ui.py | pseudocode/frontend/mantine_ui.pcal |
| frontend/renderer.py | pseudocode/frontend/renderer.pcal |
| portable_build/portable_build.py | pseudocode/portable_build/portable_build.pcal |

기존 평면 .pcal 파일은 현재 r25 계열 stale 번역이다. 전체 cutover 때 위 hierarchy로 교체하고 평면 compatibility bridge를 남기지 않는다. .md 역사 자료는 활성 번역으로 취급하지 않는다.

1. 닫힘 기록/metadata 정리, 현재 lineage README 바로잡기.
2. system 경계와 Backend annotation 계산부터 실제 절차 작업본 작성: ordered labels, caption group/append, reference geometry.
3. Backend authority/query/config/whole validation, EFSM와 asset/graph candidate·package 절차를 번역한다.
4. Application command/query/reconciliation/lifecycle 및 87개 public operation의 입력·성공·실패·취소·출력을 연결한다.
5. Frontend runtime FSM/UI-local/resource ownership과 renderer/export, portable build를 번역한다.
6. Source 함수/branch/소유권과 새 .pcal 전체를 대조하고 이전 활성 파일을 제거한다. 전체 fingerprint/revision/derived_from/translation_review를 한 coherent 단위로 갱신한다.

## 3. 작업본과 활성본 구분

현재 checker는 변경된 활성 pseudocode가 전체 번역을 끝내 current가 되도록 요구한다. 일부 파일만 바꾼 채 current라고 기록하지 않는다. 진행 중 작업본은 저장소 밖이지만 현재 작업 경로 안인 `.work/plan022/pseudocode/`에 일시 보관한다. 작업본은 public/구현/다른 계층의 읽기 authority가 아니며 아직 활성 fingerprint나 branch 번역에 포함되지 않는다. 전체 활성화 시 제거한다. 완료되지 않은 작업본을 별도 영구 명세/중복 registry로 유지하지 않는다.

이는 의미를 하위 구현으로 미루는 것이 아니라, 전체 활성 계층의 완성 조건을 지키면서 번역을 시작하는 작업 방식이다. 새 semantic branch/state/module을 도입하지 않는다. Source의 부재가 확인되면 임의 구현 대신 Source로 돌아간다.

## 4. 충실도 확인·완료 조건

- Source hierarchy/authority/각 입력·반환·소비자 및 처리 순서가 대응한다.
- candidate→whole validation→one commit, current 재검증, failure unchanged, post-commit failure 구분을 보존한다.
- selection hint/map, conversion representation, package remap, caption exact grouping, reference-width height 계산을 축약해 없애지 않는다.
- lifecycle/ordered-router 부분 완료/resource generation·finally와 session/persistent 분리를 보존한다.
- 실제 platform API/타입은 정하지 않는다. 설명만 반복하는 호출명으로 핵심 branch를 숨기지 않는다.
- 전체 번역 대조와 Actions cumulative version checker를 완료한 뒤에만 pseudocode current. TLC 미실행을 통과로 표현하지 않는다.

## 5. 현재 진행 상태

착수 단위: Source closure 기록과 metadata, stale README 정리. 임시 번역 작업본은 `.work/plan022/pseudocode/system.pcal`(initializeFastFigure), `backend/layout_annotations.pcal`(Source 11개 함수 및 formatter/group 계산 전개), `application/adapter.pcal`(5개 함수), `portable_build/portable_build.pcal`(build)까지 작성했다. 이 경로는 현재 작업 디렉터리 기준이며 Git branch 활성 번역이 아니다.

정책 §4.4/§5.1을 다시 확인하여 Source 함수 식별자와 public 입력/반환을 유지했다. formatter/group rendering은 Source 안의 계산을 call-local 절차로 펼친 것이며 새 public operation/authority가 아니다. registry/FSM imported method의 밑줄 표기는 qualified 식별자의 기계적 표기다. task invocation/copy/byte I/O 같은 primitive만 환경중립적으로 남긴다.

정적 대조: caption `[A,A,empty]` 연속 합치기, 초기 empty/다른 본문 분리, 선택 ordinal gap, 기존 본문 끝 U+0020 재사용, invalid explicit ids의 무변경, grid 축소 non-default/merge 거부, 미commit의 reconciliation/render 생략, lifecycle cancel-return과 throw 분리, build의 tag 개수·missing source·잔여 external tag 거부를 Source 절차와 대조했다. 이 대조는 실행 검증/전체 번역 완료를 뜻하지 않는다.

활성 pseudocode·하위 구현은 아직 갱신하지 않는다. 후속은 나머지 Backend/Frontend/public API 전체, imported operation 연결과 전체 번역 충실도 검토다. 모든 application/Source/PlusCal/checker/test/build 실행은 로컬에서 하지 않는다. 파일 기록·정적 diff 확인과 실제 실행 검증을 구별한다.

## 6. 후속 진행 — command/FSM/reference 경계

기준 HEAD `a485dc8f9cad56ccf25d370bff583dac78fe6374`에서 같은 Source r37을 직접 번역했다. §3과 동일하게 아래 경로는 현재 작업 디렉터리 안의 일시 작업본이며 branch의 활성 .pcal이 아니다.

- `.work/plan022/pseudocode/backend/project_state.pcal`: `validateFrontendIntent`, `buildFrontendReconciliationInput` 전개. invalid identity와 explicit none 구별, model-to-fsm graph-only clear, canonical asset kind/path, editable object/current CSV 검증을 절차로 옮겼다. reconciliation은 reset→swap/merge/path 변환→current resolve→명시적 matching index hint→chart별 original-index map→기존 index 유지 순서다. Source 0-based index와 PlusCal sequence의 1-based subscript 변환을 명시했다.
- `.work/plan022/pseudocode/backend/project_efsm.pcal`: `ProjectStateMachine.send` 공통 transaction, graph add/move/edit/delete/palette branch와 CSV cascade의 original-index filter/map 계산을 작업본으로 전개했다. current authority reference 재검사→whole validation→단일 commit→실제 changed/hints 계산을 분리하고, commit 직전 guard/교체 사이 interleaving을 도입하지 않아야 함을 명시했다. 이 reference는 기존 ProjectObject 내부 state reference이며 새 version/token/persistent state가 아니다. **각 command의 전체 domain builder 및 실제 결과 계산 호출 전개는 아직 남았다.** `InvokeSourceCommandCalculationAndAwait` 같은 미완성 호출은 그 남은 범위 표기이지 새 공통 command engine/API의 설계가 아니다.
- `.work/plan022/pseudocode/frontend/interface_fsm.pcal`: Source의 4개 method(`readState`, `send`, `reconcileProjectResult`, `notify`)와 declared selection/overlay/zoom/lifecycle event 전이를 전개했다. Frontend는 immutable validated scalar만 소비하고 Backend를 import/query하지 않는다. model-to-fsm 선택의 독립 asset 보존, repeated zoom lock width 보존, unlock/reset 100, 실패 error projection 후 ready 순서를 반영했다.

정적 경계 사례 대조: invalid selection 무변경/명시적 deselection, index 0 유지, unrelated chart hint 무시, explicit none 우선, `[A,B,C]`의 A/B cascade 제거와 duplicate object 위치 구분, model-to-fsm 같은 slot 선택의 asset 보존, direct delete의 explicit-none 대 cascade-map 차이, file wait 뒤 stale candidate 재계산, 미commit 시 성공 hint 부재, first/repeated/invalid zoom lock, lifecycle 실패 error→ready를 Source와 대조했다. 이는 실제 PlusCal translation/parser/TLC 실행 또는 전체 파일 연결 검증이 아니다.

Source/metadata/활성 pseudocode/Source Code는 이번 진행에서 변경하지 않았다. 나머지 Backend registry/config/query/whole validation, asset/package, graph 계산과 각 domain branch, public API 전체, renderer/UI 및 imported operation 연결을 이어가야 한다. 모든 작업본의 전체 충실도 검토가 끝날 때만 활성 경로로 cutover한다.

## 7. 후속 진행 — 전체 목표 경로로 번역 작업 확대

사용자의 가능한 한 충실한 최대 진행 요청에 따라 기준 HEAD `e9c1a795aa7cf9fafc919bf484ca5c47be138408`의 Source r37을 직접 읽고 아래 작업본을 확장했다. **전체 목표 15개 경로에 작업본이 존재한다는 뜻이지, 전체 번역이 끝났다는 뜻은 아니다.** 현재 일시 작업본은 총 4,582행이며 branch 밖 `.work/plan022/pseudocode/`에만 있다. 이번 branch patch는 이 진행 기록만 포함하고 작업본을 포함하지 않는다.

| 작업본 경로(§3 임시 루트 기준) | 이번 전개 내용 |
|---|---|
| backend/assets_files.pcal | 21개 Source 함수의 VFS canonical path/이동 계획/충돌 choice 재검증, 파일 분류, asset candidate, FFPX/FFSX byte inventory·typed XML/CSV·package remap, reference 수집 절차와 private 계산 전개 |
| backend/graphs.pcal | 15개 Source 함수의 table/header/column, object candidate, paired numeric/divide/log/reciprocal, trace/axis placeholder, layout/extension 병합, 정규화/검증, Plotly import와 editable 전환 전개 |
| backend/project_state.pcal | intent/reconciliation 외 registry/current read/snapshot, config 기반 create, slot 정규화, whole validation과 query kind/operation dispatch 추가. call-local query 조립 helper의 세부 연결은 남음 |
| backend/project_efsm.pcal | graph object 편집을 graph-domain 계산과 연결하고 load/import/graph/slot/grid/annotation/palette/export의 명시 branch 추가. 일반 미완성 호출 하나로 전체 command를 완료했다고 취급하지 않음 |
| application/public_api/contract.pcal | Source의 87개 공개 operation과 namespace/route/lifecycle 계약 연결. Source Python author notation의 조건부 의미를 절차로 옮기며 공통 성공 envelope를 새로 만들지 않음 |
| application/public_api/assets.pcal | 20개 Source 함수. current CSV 선택/create-and-select, collision 선택 수집, 명시 directory batch와 input-order router의 서로 다른 atomic/부분 완료, 생성·삭제·이동·연결·download의 기존 반환 의미 |
| application/public_api/graphs.pcal | 10개 Source wrapper. add routing, arbitrary move/delete·no-op, header/layout/palette/import의 committed-gated fresh read와 graph export |
| application/public_api/layout_annotations.pcal | 35개 Source 함수. runtime slot/drop/zoom와 persistent slot/grid/style/image/label/caption/palette/print를 구별하고 성공·미commit·사후 실패 출력을 전개 |
| frontend/renderer.pcal | 20개 Source 함수와 private event/resource 계산. supplied projection 전용, generation/identity 기반 plot·image lifetime, drop/click 구분, reference-width export·caption measurement·raster 제한·download finally |
| frontend/mantine_ui.pcal | 8개 Source component의 UI-local draft, overlay/selection/drag cleanup, keyboard/focus, supplied palette/Mantine role·contrast 계산과 public action 연결 |

앞서 작성한 system, Backend annotation, Application adapter, Frontend FSM, portable build 작업본도 유지한다. identifier/subscript 대조 중 graph wrapper 수(10), graph Source 함수 수(15), `SLOTS_SWAPPED`의 `sourceSlotId/targetSlotId`, caption `target.kind/id`, `globalSettings.axes` 위치 및 `normalizeAxisSettings(axis,key)` 호출을 Source에 맞추어 바로잡았다. 이는 정적 파일 대조이며 PlusCal parser/TLC 실행이 아니다.

### 남은 충실도 대조와 cutover 조건

1. EFSM의 asset create/replace/delete·trash/move/directory, image link/import, merge/split/style candidate 및 actual result/cascade 연결을 빠짐없이 전개한다. 현재 `PendingSourceDomainCandidate`는 **미번역 표시**이며 최종 pseudo의 새 모듈/engine으로 유지하지 않는다.
2. query 조립, candidate/context 전달, Source import별 동명 함수, helper 인자·반환·exception/await 연결을 전체 15개 파일 사이에서 대조한다. `ProjectObject` class method의 기계적 명명 변환은 독립 authority를 만들지 않는다. 설정은 기존 Backend config 참조로만 연결한다.
3. private helper가 Source의 고수준 branch/계산을 호출명으로 가리지 않았는지 확인하고 필요한 부분을 계속 전개한다. 모든 primitive가 아직 확정/검증되었다고 주장하지 않는다.
4. public 87개 operation을 Source 함수→실제 Backend command/query 또는 Frontend event→반환 소비자까지 다시 대조하고, exception/미commit/취소/부분 완료/commit 후 failure를 구별한다.
5. 그 뒤에만 활성 hierarchy 전체 교체와 flat 파일 삭제, 새 pseudocode revision/fingerprint/lineage/review 및 Actions cumulative checker를 수행한다. 지금은 Source r37 closed, 활성 pseudocode r11 stale과 하위 stale을 그대로 유지한다.

로컬 Source/application/PlusCal/parser/checker/test/build/TLC를 실행하지 않았고 delegation도 하지 않았다. 이번 branch 변경은 문서뿐이므로 새 Actions를 dispatch하지 않는다. 임시 작업본은 다른 계층의 authority가 아니며 후속 전체 활성화 시 이동·정리한다.

## 8. 후속 진행 — 나머지 command 계산과 query 조립·모듈 연결

사용자의 남은 부분 번역 요청에 따라 기준 HEAD `ac5439e04e33f2c61e6dd5d28eff19cf049f4341`에서 Source r37과 작업본을 대조했다. 2026-10-17 현재 임시 목표 15개 파일은 총 **4,933행**이다. §7의 4,582행에서 계속 확장·수정했으며, 여전히 `.work/plan022/pseudocode/`의 작업본이지 branch 활성 번역은 아니다.

- **EFSM**: `PendingSourceDomainCandidate`를 없애고 asset create/replace/delete, trash empty, node move/directory create, image link/import, merge/split/style의 명시 branch를 전개했다. cascade는 공통 `collectAssetReferences`의 `originalObjectIndex`를 사용해 chart별 filter/map 및 image reference clear를 계산한다. merge의 최대 한 non-default payload/top-left anchor, split의 anchor payload 보존/해제 cell 초기화, 새 입력과 current next-id/VFS의 분리를 기록했다. actual result 형성은 이번 attempt의 실제 facts/count/map과 post-commit owner를 사용하도록 나누었다. **branch 존재만으로 내부 helper 계산·실제 changed field 연결까지 완료되었다고 판단하지 않는다.**
- **Backend query**: graph read의 explicit chart/selected slot, 독립 current CSV와 selected-object columns, image bytes/pure URL/settings copy, VFS tree/trash/movable/draggable/deletion/move-option/tree-selection을 private 계산으로 전개했다. renderer/print export는 같은 read source의 visible slots에서 figure/image/CSV-column/ordered-label/style 입력을 구성하며, Frontend가 CSV domain 계산을 다시 하지 않는다.
- **imported procedure 연결**: `interfaceFSM_*`/`projectEFSM_send`를 실제 class-qualified 절차에 연결했다. Application·Mantine lifecycle wrapper, Backend·Application label read, renderer·Application file-drop wrapper의 동명 식별자는 owner-qualified 이름으로 구별했다. JSON table 호출을 `dataTable`에, annotation export snapshot을 registry의 실제 이름 목록/Project-shaped 조립에 연결했다. annotation 반환 채널을 다른 작업본의 call-local `result` 표기와 맞췄다. 이 명명 변환/임시 반환 표기는 새 domain authority나 compatibility bridge가 아니다.
- **producer/consumer 대조**: renderer graph identity는 supplied `slot.content.chart`, image settings는 `slot.content.imageSettings`를 소비하도록 맞췄다. 초기 Project binding도 기존 `ProjectObject_initialize` 절차에 연결했다. imported procedure 이름의 파일 텍스트 대조에서 남은 실제 `call` 미선언 이름은 없었으나, 이는 parser·인자/타입·동작·전체 충실도 검증이 아니다.

아직 필요한 것은 Source import별 current read/command-attempt/candidate context의 정확한 binding, asset import의 candidate 내부 replacement/connection 및 actual changed facts helper 세부 연결, 87 public operation의 전체 인자·출력·실패/취소/부분 완료 재대조다. scalar/copy/encoding 같은 notation primitive와 아직 전개가 필요한 domain 계산을 구별하는 전체 충실도 검토 후에만 활성 hierarchy 교체와 revision/fingerprint/lineage/Actions cumulative checker를 수행한다.

Source r37 closed, 활성 pseudocode r11 stale 및 하위 stale은 변경하지 않았다. 이번 branch diff는 이 진행 기록뿐이며 임시 번역 파일/임시 연결 메모를 포함하거나 rollback한다고 주장하지 않는다. 로컬 Source/application/PlusCal/parser/checker/test/build/TLC 실행 및 delegation은 하지 않았다. 문서 변경이므로 새 Actions를 dispatch하지 않는다.

## 9. 후속 진행 — import candidate·완료 plan·실제 changed 소비 연결

이어서 진행하라는 요청에 따라 기준 HEAD `563ec0536225f2a34c0c14c431812c47dea28b4a`에서 Source의 asset import/graph 연결/ProjectMutationResult와 UI chooser producer를 다시 읽고 아래 작업을 했다. 임시 목표 15파일은 총 **5,112행**이다.

1. collision model과 plan query의 계산을 explicit project 인자를 받는 private 절차로 전개했다. public read는 `activeProject`를 작업당 한 번 읽고, command 내부의 모든 import 계산은 EFSM이 넘긴 같은 attempt source/candidate를 사용한다. `CurrentBackendReadProject`/`CurrentBackendCommandProject`라는 미정의 문맥 이름은 전체 작업본에서 제거했다. 이는 새 current-state registry/context authority가 아니다.
2. `BuildAssetImportInAttempt`에서 directory/visible target, 원본 bytes/parsed rows, batch reservation, 새 id/next-id 또는 기존 id를 보존하는 replacement, target CSV/image 연결을 같은 candidate 안에서 계산한다. CSV 연결의 private 절차는 새로 만든 candidate CSV를 current live collection에서 다시 찾지 않는다. UI callback·부분 commit은 없으며 retry 때 이 attempt의 candidate/facts를 버리고 다시 계산한다.
3. Source UI chooser의 출력은 최종 `path/replaceId` plan이다. 초안에서 생각한 proposal/decision field 요구는 이 producer와 맞지 않아 제거했다. command는 최종 plan의 canonical parent/path, 현재 동일 kind/id, reserved path를 재검증하고 stale replace나 이미 점유된 create path를 다른 asset/create/rename으로 돌리지 않는다. Application batch chooser 전개는 file마다 chooser를 한 번 기다려 final plan/reservation만 모으고 취소 시 command 전에 끝난다. chooser가 이미 공식 collision/resolve query를 소유하므로 새 UI 반환 계약이나 Backend→UI 호출을 만들지 않는다.
4. `BuildActualChanged`는 이번 attempt에서 기록한 input-order asset facts를 committed Project의 실제 asset/path와 대조하고 실제 CSV chart-owner/image-slot을 연결한다. 생성 directory/move destination도 post-state에서 확인한다. 기존 wrapper들의 created/updated/imported/directory/moved path 소비 표기를 같은 changed delta에 연결했다. 이는 Source의 existing changed 값을 표현한 call-local 표기이며 새 public result framework가 아니다. Source helper 자체의 candidate-only 반환도 보존했다.

아직 전체 번역 완료는 아니다. private metadata/header normalization·constructor 표현, 모든 import/FFSX/graph 경로의 await/retry/throw 문맥, 87개 API의 전체 producer/consumer·인자·반환·실패 연결과 Source 전체 충실도를 대조해야 한다. 해당 대조가 끝나기 전에는 작업본을 활성 .pcal로 섞거나 current라고 기록하지 않는다.

이번 branch 변경은 이 진행 기록뿐이다. 작업 경로 안 `.work/plan022/`의 번역·연결 메모는 임시 작업본이며 이 diff에 포함하거나 복구 가능하다고 주장하지 않는다. Source r37 closed/활성 pseudocode r11 stale/하위 stale 및 fingerprint는 그대로다. 로컬 Source/application/PlusCal/parser/checker/test/build/TLC 실행·delegation·새 Actions dispatch는 하지 않았다.

## 10. 후속 진행 — command 문맥과 공개 wrapper의 명시적 인자 연결

계속 요청에 따라 기준 HEAD `10fa782ef7aeb1f0330d0813c883436da266fc84`의 Source r37과 기존 작업본을 대조했다. 임시 번역 15파일은 총 **5,377행**이다. 파일 수/행 수는 완료 증거가 아니다.

1. graph commit/conversion, FFSX slot 적용, grid resize의 private 전개는 EFSM이 넘긴 동일 command-attempt source를 받도록 연결했다. Source의 원래 함수 이름·인자는 wrapper에 보존하고 그 내부 문맥 전달만 명시했다. 계산 도중 `activeProject`를 임의 재조회해 다른 attempt와 섞지 않으며, 결과는 여전히 candidate일 뿐이다. conversion 반환은 이미 plain candidate이므로 불필요한 `CalculatedCandidate` 가상 변환도 제거했다. 새 retry token/state/공개 mutation 경로는 없다.
2. label reference와 layout preview geometry도 기존 read가 포착한 source에서 계산한다. Source read entry는 유지하고 private 수학 계산의 인자로 그 참조를 전달한다. config/default를 별도 authority로 복사하거나 Frontend가 Backend를 읽는 경로를 추가하지 않았다.
3. 공개 API의 wrapper route **60개**를 각 Source 함수의 명시적 `call`과 순서대로 대응하는 named input에 연결했다. `InvokeTranslatedSourceProcedure`/`SourceArgumentsForWrapper`라는 미전개 일괄 호출을 제거했다. Source에서 명시한 trim=False, previewWidth=None, caption slotIds=None만 해당 binding에서 보완하며 나머지 입력·반환·exception/취소/commit gate는 기존 wrapper가 소유한다. query/selection/adapter/export route와 외곽 lifecycle-once 경로는 분리 유지했다. 텍스트 목록 비교상 60 wrapper route와 60 명시 branch에 누락·추가·중복이 없다. 이는 87 API 전체의 동작 검증이나 parser 통과가 아니다.
4. asset metadata 생성은 Source csvAsset/imageAsset의 실제 `directory/name/mime/bytesBase64` field로 전개했다. 최종 canonical unique/replace path의 parent/leaf가 저장 위치이며 원본 colliding filename을 다시 저장하지 않는다. id와 CSV rows/header는 같은 candidate를 만드는 caller가 채우고 imageSettings/별도 path alias/원본명 authority는 추가하지 않는다.

잔여는 codec/normalization/constructor 등의 primitive와 domain 계산 구분, 모든 Source 함수·분기와 query/command producer-consumer·반환/실패·await 문맥의 전체 충실도 대조다. 특히 명시적 call이 존재한다는 것만으로 각 callee의 세부 번역이 닫혔다고 판정하지 않는다. 이후 전체 hierarchy cutover/과거 활성 파일 제거와 lineage 갱신을 수행한다.

이번 branch patch는 이 진행 기록만 포함하며 `.work/plan022/` 번역·연결 메모를 포함/rollback하지 않는다. Source37 closed/활성 pseudocode11 stale/하위 stale 및 fingerprint는 유지한다. 로컬 Source/application/PlusCal/parser/checker/test/build/TLC 실행·delegation·새 Actions dispatch는 하지 않았다.

## 11. 후속 진행 — 전체 항목 대조와 settings/package 계산 전개

기준 HEAD `1bf5425d8bd9afe981cadfbb0ebd1fc2bbfbdf30`에서 이어서 번역하고 이번 턴 완료 가능성을 대조했다. 임시 목표 15파일은 총 **5,539행**이다. 아직 전체 번역 완료는 아니며, 완료로 바꾸기 위해 잔여 domain 계산을 미정의 helper로 취급하지 않는다.

1. 텍스트 대조상 Source 함수/메서드 163개에 대응하는 절차가 있고, 공개 API inventory는 Source87/작업본87이며 누락·추가·중복 key가 없다. 이는 entry 누락 확인일 뿐, 함수별 branch/반환/실패·동시성 의미의 전체 충실도 판정이 아니다.
2. package 경로에서 별도의 가상 whole/chart predicate 대신 실제 번역한 공통 validator를 연결했다. FFPX export는 같은 read-source의 plain Project copy에서 trash를 제외하고 retained chart/image 참조를 검증하며, mandatory trash root가 없는 export snapshot에 일반 Project whole validation을 다시 강제하지 않는다. copied-byte loop의 index가 앞 metadata loop 뒤에 남아 bytes를 건너뛸 수 있던 작업본 오류도 `i=1` 재설정으로 바로잡았다.
3. image/export 설정의 command 내부 계산을 별도 private 절차로 전개했다. current owner 설정에서 시작해 명시된 새 값만 처리하고 image manual fit·finite/clamp, export enum/current fallback·폭/높이/DPI limits·auto null height·explicit height fallback을 보존한다. read projection/config를 사용자 현재값으로 덮어쓰는 mutation input으로 쓰지 않는다.
4. import의 missing-only settings 계산을 key별 재귀 절차로 전개했다. layout/annotation/export의 이미 존재하는 false/0/문자열을 기본값으로 덮지 않으며 config에는 없는 caption body 등의 instance 초기 데이터는 별도로 처리한다. UI palette는 전체 palette 정규화 규칙을 따로 적용한다. 없는 additive export settings의 폭은 loaded layout referenceWidth, 높이는 heightMode에서 산출한다. 이 계산은 candidate만 반환하며 commit·Frontend 접근·config 동기화는 없다.

잔여를 다음으로 좁혔다: constructor/asset·chart·slot normalization 및 package document 조립 등 남은 operator의 domain 계산/실제 low-level primitive 구분과 전개, query/command/Frontend 전체 producer-consumer의 retry·취소·사후 throw/resource 수명 대조, 그 뒤 활성 hierarchy cutover/과거 파일 제거/전체 충실도 review와 lineage 갱신 및 Actions cumulative checker. 명시적 entry와 API key가 모두 있다는 것만으로 이 잔여를 완료로 판정하지 않는다. 따라서 이번 턴에 전체 완료했다고 선언하지 않는다.

이번 저장소 변경은 이 진행 기록만 포함한다. `.work/plan022/` 작업본·체크리스트는 현재 경로 안의 transient 작업물이며 patch/remote/rollback에 포함하지 않는다. Source37 closed/활성 pseudocode11 stale/하위 stale와 fingerprint를 유지했다. 로컬 Source/application/PlusCal/parser/checker/test/build/TLC 실행·delegation·새 Actions dispatch는 하지 않았다.

## 12. 후속 진행 — import constructor와 FFSX 참조·소유권 계산

기준 HEAD `4d427acfc79ea1a22e3ebb1497bffed283679598`에서 Source r37의 import 순서/asset schema/FFSX package 규칙을 대조하며 임시 번역을 이어갔다. 이번 작업도 활성 번역의 완료·cutover가 아니다.

1. Project import의 CSV/image 정규화를 collection 순서와 kind별 id 집합, 공통 canonical path 집합, 실제 parent directory, owned bytesBase64, CSV rows/header로 전개했다. image asset에 slot-local imageSettings를 두지 않으며 conflict를 자동 dedup/rename하거나 current Project를 조회하지 않는다. config에는 instance data를 넣지 않는다.
2. chart import는 같은 global-settings normalizer, object-style 설정의 missing-only 보완과 finite/range 계산, 공통 representation-aware validator로 연결했다. zero-object chart에 base object/CSV를 만들지 않고 기존 CSV/x/y/type/axis를 임의 추론하지 않는다. slot import는 현재 candidate의 reference, slot-local image settings/caption과 chart별 owner count를 확인하며 orphan/shared chart를 clone/drop해 숨기지 않는다. next-id는 각 collection의 maximum+1을 명시했다. 원래 normalizeSlotContent 등 세부 호출까지 전부 닫혔다고 주장하지 않는다.
3. FFSX import에서 실제 project CSV object의 unique source-id를 object 순서로 모으고, package-local id마다 새 project id와 configured CSV root의 현재 unique canonical path를 계산한다. copied bytesBase64를 보존하고 package dataRef를 Project asset의 live reference로 남기지 않는다. conversion view의 CSV id/imported/rows는 project CSV mapping으로 바꾸지 않는다.
4. target slot은 같은 command attempt에서 다시 resolve한다. 교체되는 old chart만 제거하고 새 chart가 해당 slot 하나의 소유가 되도록 chart/image/type과 slot caption을 연결한다. 다른 chart/asset 및 target identity/geometry/local display 설정은 유지한다. whole validation 후 candidate만 반환하고 caller가 마지막에 한 번 commit한다.
5. FFPX/FFSX export의 private 계산은 query가 이미 포착한 동일 source를 인자로 받는다. 원래 Source-signature entry는 보존하며 별도 authority/context registry를 만들지 않는다. FFSX builder는 object가 0개여도 빈 assets/assets.xml을 만들고, CSV metadata와 copied binary entries를 따로 모은다. reader는 원본 bytes를 bytesBase64로 복원하고 같은 bytes로 rows를 파싱한다. local-id 수집/remap은 공통 representation 판정 절차를 사용한다.
6. 현재 version의 물리 XML 표기는 Source가 유지하도록 정한 compatibility format의 하위 코드 자료와 대조했다. 그 자료를 새로운 domain 의미/CSV 선택/Frontend 상태의 원천으로 쓰지 않는다. XML/byte encoding 표기와 metadata/Project model 조립을 구분하며, 미전개 package document 조립을 단순 primitive라는 이유로 완료 처리하지 않는다.

아직 필요한 작업: FFPX document producer/reader의 구체 조립과 normalizeSlotContent 등 남은 domain 계산/codec 경계의 전개·연결, 전체 query/command/UI producer-consumer의 retry/취소/사후 throw/resource 의미 대조, 전체 충실도 review 후 활성 hierarchy 교체·lineage 갱신과 Actions cumulative checker다. 이번 constructor/FFSX 전개만으로 전체 완료를 선언하지 않는다.

저장소 patch에는 이 진행 기록만 들어간다. `.work/plan022/` 임시 번역·메모는 포함/rollback하지 않는다. Source37 closed/활성 pseudocode11 stale/하위 stale와 fingerprint는 변경하지 않았다. 로컬 Source/application/PlusCal/parser/checker/test/build/TLC 실행·delegation·새 Actions dispatch는 하지 않았다.
