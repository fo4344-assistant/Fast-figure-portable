# Plan 018 — Source r34 review R1–R4 수정

## 요청·기준

사용자 요청: 리뷰 결과를 확인하고 수정 계획을 작성한 다음 그 계획에 따라 작업한다.

- 기준 main: `9d3a5b970223805f410d9e92425269cf1872992f`.
- 근거: `agent_space/reviews/review-20261016-014-policy-first-source-r34.md`.
- Plan 017의 Source-first 작업을 잇는 한정 수정 단위다. Source의 전체 closed 또는 하위 번역 재개를 목표로 하지 않는다.
- 수정 전에 본 계획을 작성한다. 실제 실행 결과는 진행 절에 별도로 기록한다. 정책은 변경하지 않는다.

## 수정 순서·결정

### 1. R1: 기본 import directory 단일화

`PROJECT_ASSET_DIRECTORIES`를 실제 immutable canonical path 값으로 명확히 하고 router가 그 정의를 사용하게 한다. data 분류는 기존 csv key, image 분류는 image key를 사용한다. `/assets/image` alias나 새 root, 새 query를 만들지 않는다. 전달된 기본 path도 command에서 current VFS 검증을 거친다.

### 2. R2: programmatic slot 선택과 일반 선택 구별

기존 `SELECT_SLOT`의 검증된 `selectionHint` 의미를 끝까지 따른다.
- ui-to-fsm/toggle-clear: 일반 사용자 선택이며 기존 graph/asset clear 의미 유지.
- model-to-fsm/clear-graph-object: 같은 slot도 toggle하지 않고 graph selection만 clear하며 current asset selection은 유지.
- explicit none: 명시적 deselection의 기존 전체 선택 해제 의미 유지.

Backend validation → Application adapter → Frontend FSM의 같은 경로를 수정한다. raw direction을 Frontend가 다시 해석하거나, wrapper가 선택 snapshot을 저장했다가 복구하지 않는다. 이미 command reconciliation이 제거한 invalid asset을 되살리지 않는다.

### 3. R3: 빈 CSV create와 선택 owner 서술 통일

Backend create command/helper는 일반 CSV 생성만 소유하고 Frontend를 변경하지 않는다. public `createEmptyProjectCsvAndSelect()`가 committed asset의 실제 path로 별도 검증된 SELECT_ASSET을 보낸다. chart/object 자동 생성, 추가 command, 숨은 rollback은 없다.

### 4. R4: cascade reference 제거의 chart별 index remap

CSV 삭제·trash 진입 detach·trash 비우기는 기존 candidate 안의 실제 reference 제거 순서에서 chart별 old index → post index/none 관계를 계산한다. 중복된 object 값도 배열의 원래 위치로 구별하며 persistent object id를 새로 만들지 않는다.

- 제거된 선택 object → none. 살아 있는 선택 object → 동일 object의 새 index.
- affected chart만 command-local `ProjectMutationResult.selectionHints`에 mapping을 기록한다.
- 기존 Backend reconciliation이 현재 owning chart와 old index에 대해 mapping을 소비해 최종 scalar만 Frontend에 전달한다.
- reset/explicit clear가 우선이고, graph 직접 편집의 기존 explicit index hint 의미는 유지한다. cascade mapping이 없는 unrelated chart는 기존 선택을 유지한다.
- 실패에는 mapping/성공 reconciliation이 없고, 제거 count를 mapping 대신 쓰지 않는다. 독립 CSV 선택은 기존 asset reference 검증만 따른다.
- mapping은 한 command의 immutable delta이며 공유 snapshot/selection authority가 아니다. wrapper/Frontend에 old objects 배열을 전달하거나 post-hoc SELECT_GRAPH_OBJECT를 호출하지 않는다.

## 확인 항목

1. 선택 slot 없는 새 project에 image/data import: 선언된 fixed directory로 라우팅.
2. 같은/다른 target connect 성공: target 선택, graph 선택 clear, 유효한 독립 asset 선택 보존. 거부/미commit은 성공 선택 없음.
3. 사용자 slot 선택/toggle 및 explicit none: 기존 clear 의미 유지.
4. 빈 CSV 생성 성공/selection 거부: 한 create, 선택은 Application 소유, 이미 commit된 asset 유지.
5. `[A,B,C]`에서 B 선택 후 A 제거 → `[B,C]`의 index 0; B 제거 → none; C 제거 → B의 index 1.
6. 동일 CSV의 여러 object, 값이 같은 중복 object, 여러 affected chart, unrelated selected chart, 마지막 object 삭제를 대조.
7. delete/trash/empty-trash의 같은 cascade 규칙 및 failed candidate에서 unchanged를 대조.
8. metadata revision/fingerprint와 실제 누적 patch 기록을 갱신하고 GitHub Actions의 cumulative-base version checker를 실행한다. 의미 대조는 정적 검토이며 실행 테스트와 구별한다.

## 산출물·제외

Source r35 current/open, 대응 revision/fingerprint, 후속 검토 문서와 `YYYYMMDD-NNN.patch/.md`를 작성한다. Contents API의 순차 commit 및 같은-commit 기록 한계는 patch 설명에 명시한다. 모든 helper/임시 파일은 현재 작업 경로 아래에 두고 Source/application/checker/test/build/TLC를 로컬 실행하지 않는다.

PlusCal/model/Source Code, 정책, test/build/dist는 수정하지 않는다. 전체 selection/import-edit-export 왕복과 목적/중복통합의 닫힘 검토는 후속이다. checker 성공을 의미적 전체 closure로 표현하지 않는다.

## 진행

- 계획 선행 게시: `3cd65831e800c8836bfeaa20894c5123936dc314`. 이후 R1~R4를 위 순서대로 Source에 반영했다.
- Source r35 current/open, fingerprint `sha256:6b1b16ef3e2a0e5725c9fa7b7191bda06265b96cc1844d7a94a130d4d3c97ef9`. 하위 layer는 stale 유지.
- 결과/20개 정적 시나리오: `agent_space/reviews/review-20261016-015-review-fixes-r35-open.md`. 실행 테스트로 표시하지 않는다.
- 누적 실제 diff/변경 이유/대안/제외 사항: `agent_space/patches/20261016-019.patch/.md`. actual endpoint `04012b5ac024f3574663b6fb8c5912b823ae2f49`; pair는 자기참조 없이 이후 게시했다.
- Actions cumulative checker [38862733364](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/38862733364): PASS. executed HEAD `97e39fd54a03c6610e49f7c246047936834df3c5`, 실제 BASE_SHA `9d3a5b970223805f410d9e92425269cf1872992f`와 r35 fingerprint를 로그에서 확인했다.
- 순차 Source-before-metadata 중간 push 실패와 최종 cumulative PASS는 구분한다. 이 결과 문서는 run 이후 commit이며 동일 executed HEAD로 주장하지 않는다. 의미적 전체 closure/application regression 실행을 의미하지 않는다.
