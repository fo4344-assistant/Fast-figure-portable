# Plan 017 — Source Script r33 API 반환 / runtime / import-export — OPEN

## 1. 범위와 근거

- 사용자 요청: API 반환·runtime·import/export 보완. 기준 main `1ead53f4d4a3eb076f17835c060e2ba52b7dc49e` (Source r32).
- Source Script를 먼저 개선한다. 기존 공개 87-operation inventory와 r30 trace의 F1/F2/F4를 대상으로 한다. 새 API registry, 공통 성공 envelope, legacy bridge를 만들지 않는다.
- 기존 Source의 command/candidate-first/공식 query/Frontend session/lifecycle 의미가 기준이다. `fast-figure.js`의 public wrapper, zoom geometry, import router와 download 반환을 정적으로 읽어 호환 동작을 대조했으나, 하위 코드 자체를 상위 권위로 삼거나 전부 정답으로 복제하지 않았다.
- 이번 수정은 `sourcescript/application/public_api/{__init__,assets,graphs,layout_annotations}.py`, `sourcescript/backend/{assets_files,project_state,project_efsm}.py`, `sourcescript/frontend/{interface_fsm,renderer}.py`, `sourcescript/system.py`에 있다. 실행 코드 변경/실행 검증이 아니다.

## 2. 연결한 경로

| operation | 입력 → owner / 기존 경로 | 공개 결과 / 실패 의미 |
|---|---|---|
| layout.readState | explicit previewWidth → Q layout.readState + Frontend zoom/lock scalar | detached layout/preview + zoom/zoomLocked; preview 기본 600, 저장 없음 |
| layout.setStyle/setGrid/mergeSlots/splitSlots | 새 값/identity → 기존 command → committed gate → fresh layout read | current public layout state; 미commit False, throw 전파 |
| layout.setZoom/resetZoom/setZoomLocked | Application → Frontend local event; first lock만 surface width 측정 | fresh layout state; invalid first-lock width False/unchanged; locked setZoom no-op |
| layout.commitZoom | 기존 Frontend completion notification → current layout read | layout state; Project commit 없음 |
| slots.prepareFileDrop/finishFileDrop | current target query → model-to-fsm selection / Frontend interaction cleanup | 준비 True/False; finish None, 중복 no-op; Project mutation 없음 |
| graphs.setHeaderLines | CSV identity/new header → DATA_OBJECT_REPLACED → result.changed 실제 CSV path → Q assets.readDeletionTarget | normalized headerLines scalar; 미commit result, 오류 전파 |
| graphs.updateLayout/applyPalette/importFile | 기존 command → committed gate → 기존 graphs read | layout projection / detached chart / detached chart; 미commit result, 오류 전파 |
| assets.importToDirectory | file batch + 완료 choices → ASSETS_IMPORTED candidate 한 번 | input-order detached assets; empty [], cancel None, 미commit result, throw 전파 |
| assets.importToSlot | data/image + explicit target → ASSETS_IMPORTED; FFSX는 기존 graph import | detached asset/chart; 취소/거부/throw는 성공 read하지 않음 |
| assets.importFiles | 시작 target scalar capture → fileKind → file별 기존 helper | input-order list; 취소/미commit/throw에서 stop, 이전 성공 commit 유지 |
| project.exportFile | selected-slot precondition → Q export project.exportFile → Frontend handoff | target 선택이면 None/no download, 정상도 None; 오류 전파 |
| assets.download | explicit/current assetPath → Q copied original bytes → Frontend handoff | missing/no bytes False, handoff True, 오류 전파 |
| graphs.exportFfsx/exportPlotlyJson | explicit selected slot → Q 같은 chart/CSV의 package/semantic figure → handoff | target 없음 None/no download, 정상 None; 오류 전파 |
| print.save/capture | 기존 Q snapshot → Frontend raster → handoff/finally | 기존 outcome 유지; saved는 handoff 의미, rejected/throw 구분 |

`ProjectMutationResult.changed`의 실제 changed ids/path를 기존 성공 후 query에 사용한다. header 전용 query를 추가하지 않았다. command tuple은 Application 내부 조정 값이지 공개 성공 반환이 아니다. 사후 read/render/download 실패는 이미 끝난 commit을 rollback하거나 미commit으로 위장하지 않는다.

## 3. Runtime / routing / 자원 의미

- zoom 100, unlocked, anchor none이 초기값이다. finite input은 50..200, invalid는 100; lock 중 intent 변경은 no-op. first lock만 finite positive rendered width를 저장하고 repeated lock은 anchor 유지, unlock/reset은 100/anchor clear다. state 변경 때만 publish한다.
- Frontend는 supplied referenceWidth × zoom/100 또는 lock anchor로 geometry를 표시한다. referenceWidth 변경/host resize 중 lock width는 유지한다. DOM은 lock anchor의 측정 원천이지 Project layout의 역방향 권위가 아니다. previewGeometry도 session/Project 저장값이 아니다.
- drop prepare는 invalid target에서 unchanged, 같은 target에서 toggle 없음, 다른 target의 accepted selection만 성공이다. finish는 현재 drag interaction만 정리하며 bookmark post-drag suppression의 기존 click 소비/dispatch 이후 cleanup 규칙을 손상하지 않는다.
- ordered router와 explicit directory batch는 다르다. directory batch는 one-candidate atomic, router는 file별 commit이며 전체 atomic/rollback을 약속하지 않는다. 취소/오류 뒤 파일은 실행하지 않는다. `.json`은 fileKind의 data 규칙을 유지하고 Plotly를 임의 판별하지 않는다. Plotly는 explicit graphs.importFile이다.
- PUBLIC_LIFECYCLE_RULE이 import/export public binding을 기존 runLifecycleTask에 연결한다. nested helper는 public binding을 재진입하지 않는다. busy는 helper 실행 전 거부, 정상/취소/미commit은 COMPLETE, throw는 FAILED → ready recovery 후 전파다.
- Backend export read는 copied bytes/entries/name/MIME만 계산한다. FFPX/FFSX builder와 plain snapshot read를 구분하여 package operation 재귀 호출을 만들지 않는다. timestamp는 호출 입력이며 Project field가 아니다.
- Frontend는 ZIP STORE encode/download의 작업 자원만 소유한다. 안전한 browser handoff 전 조기 revoke하지 않고 이후 finally에서 정리한다. 다른 surface 자원을 해제하지 않는다. 브라우저 handoff가 disk 저장 확인은 아니며 관찰 불가능한 cancel을 새 반환으로 만들지 않는다.

## 4. 정적 경로 대조 — 실행 테스트 아님

1. layout command 실패 → False, success query 없음; 성공 → 최신 layout read, 기존 tuple 미노출.
2. lock 중 setZoom → anchor/intent 유지; repeated lock → 재측정/anchor 덮어쓰기 없음.
3. first-lock 측정 실패 → False, runtime unchanged; unlock/reset → 최신 referenceWidth에서 100 percent 표시.
4. invalid drop target → selection 유지; 이미 선택된 target → True, toggle/slot-type command 없음.
5. drop finish 두 번 → None/no-op; post-bookmark-drag click guard 조기 해제 없음.
6. CSV header update → current normalized scalar를 실제 updated path에서 조회; 별도 CSV 선택/신규 query route 없음.
7. graph layout/palette/import 실패 → 성공 read 없음; 성공 → 기존 공식 read의 detached 결과.
8. directory 여러 file → choice 대기 후 Backend current-state 재검증, 전체 candidate 검증 뒤 한 commit.
9. ordered router A 성공/B 취소/C 대기 → A 유지, None 반환, C 실행 없음; 미commit/throw도 같은 stop 경계.
10. FFSX explicit slot import → graph helper 한 번, asset collision callback 없음; unsupported/target 소실은 commit 전 거부.
11. empty router/directory input → [], command/choice 없음; 두 번째 file을 조용히 버리는 분기 없음.
12. nested import helper → lifecycle 중복 START/busy 자기거부 없음; 실패는 기존 recovery 뒤 원래 오류 전달.
13. project export 중 slot selected → None/no download; asset missing → False; graph missing → None.
14. export 성공 → query의 같은 chart/CSV copied payload 사용; persistent settings/selection 변경 없음.
15. encoding/raster/handoff 예외 → 작업 소유 host/URL/handle 정리; 다른 surface와 Project 보존.
16. print current capture → one-shot viewport, persistent target size 변경 없음; saved는 disk 보증 아님.

## 5. 선택 이유 / 기각 대안

- 모든 API를 bool/result envelope로 통일하지 않았다. 기존 operation의 chart/scalar/state/list/side-effect 반환 자유도를 유지하면서 공통 adapter와 성공 후 read를 재사용하는 편이 계약 자유도 대비 복잡도가 낮다.
- header 전용 query, 중복 drop target store, public router의 별도 project snapshot authority, Frontend의 Backend 재조회, helper별 중첩 lifecycle을 기각했다. 기존 result/query/event/한 task로 같은 의미를 충족한다.
- 순차 router를 거대한 atomic transaction으로 바꾸거나 commit 후 UI 실패를 숨은 rollback으로 처리하지 않았다. 명시적 batch의 atomic 의미와 구분하고 실제 commit 경계를 드러낸다.
- 하위 코드의 첫 file 조기 반환, stale raw object 반환, browser saved-disk 판정을 상위 의미로 복제하지 않았다. ordered input 보존/단일 권위/실패 구분이라는 project 목적과 충돌하기 때문이다.

## 6. 상태와 미포함

- Source r33 current / closure open / closure_review null. fingerprint `sha256:7e8e88d617cb0c68d48711abe4a3515ac33e813233e83bac14831f43a41b8119`.
- 여전히 남은 API 계약: project name, slot mutation, image insertion, asset delete/move/directory/trash/connect의 공개 반환과 전체 selection cross-check. 전체 import/edit/export roundtrip, purpose/duplicate-integration 근거도 미완료다. inventory 87개를 전부 완결했다고 주장하지 않는다.
- PlusCal r11 / optional model r26 / code r36은 stale 유지. 정책·하위 구현·테스트·build·dist 변경 없음. 로컬 Source import/실행, application/test/checker/build/TLC 실행 없음.
- patch `agent_space/patches/20261016-016.patch`와 같은 basename `.md`에 실제 cumulative endpoint, 전송 제한과 Actions 결과를 기록한다. metadata 검사는 의미 완결/실행 검증이 아니다.
