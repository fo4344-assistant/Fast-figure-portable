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
