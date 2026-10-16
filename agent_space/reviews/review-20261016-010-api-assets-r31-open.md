# API asset planning / create-and-select — Source Script r31 / OPEN

## 범위와 권위

- 사용자 API 보완 요청에 따라 r30 전체 trace의 F3와 F2 중 asset create-and-select를 먼저 연결했다. 기준 main: `4871dc952bdfb291d79de28948918c1f587d4410`.
- 의미의 권위는 Source Script다. 이 문서는 추가 API registry가 아닌 정적 검토 기록이다. 기존 Backend domain / Application public wrapper / Frontend FSM 경계를 유지한다.
- 하위 `fast-figure.js`의 `slotFileKind`, `resolveProjectAssetImportPlan`, `createEmptyProjectCsvAndSelect`, `graphEditorSelectCsv`를 호환성 자료로 읽었다. 하위 동작을 무조건 채택하지 않는다. stale replace 제안을 current authority에서 재검증하고 selection은 이미 선언된 SELECT_ASSET의 단일 전이로 수행한다.

## producer → consumer / 반환

| 기존 public API | 구체 경로 | 성공 / 실패 |
|---|---|---|
| assets.fileKind | readAssetFileKind → dispatchProjectQuery(project-api) → assets.fileKind → assets_files.slotFileKind | filename/MIME의 slot/data/image/empty 문자열; query 오류 전파; bytes/Project/Frontend 변경 없음 |
| assets.collisionModel | readAssetCollisionModel → 같은 query adapter → current VFS의 projectAssetImportCollisionModel | 한 작업용 detached collision model; unsupported raw asset/invalid directory는 오류 |
| assets.resolveImportPlan | readAssetImportPlan → 같은 query adapter → resolveProjectAssetImportPlan | current path/replaceId; invalid model/parent/stale replace는 오류; 예약/commit 아님 |
| assets.selectCsv | selectProjectCsv → assets.readDeletionTarget → validated SELECT_ASSET | 선택된 detached CSV; missing/wrong-kind/거부 none; throw 전파 |
| assets.createEmptyCsv | createEmptyProjectCsvAndSelect → 기존 DATA_OBJECT_CREATED → 성공 시 selectProjectCsv | 성공 detached CSV; 미commit은 기존 failure, 사후 selection 거부 none; throw 전파 |

- fileKind의 우선순위는 FFSX → CSV/TSV/JSON → image MIME/확장자 → unsupported다. 이 분류가 explicit Plotly graph import나 FFPX project import parser를 대신하지 않는다.
- collision/plan은 input/reservedPaths를 변경하지 않는다. 제안 model을 권위로 저장하지 않고 current VFS에서 동일 충돌 규칙을 다시 계산한다. ASSETS_IMPORTED는 query 성공과 별개로 commit 직전 current id/path/kind를 재검증한다.
- selectCsv의 SELECT_ASSET은 graphObject/index를 함께 clear하고 slot/workspace를 유지한다. 따라서 별도 CLEAR_GRAPH_OBJECT 선행 전이를 추가하지 않는다. invalid CSV를 선택하려는 경우 graph selection까지 먼저 지우는 부분 변경이 없다.
- createEmptyProjectCsv는 여전히 일반 domain 생성 helper이며 selection을 소유하지 않는다. public create-and-select는 Application에서 이를 조정한다. chart/graph object를 만들거나 보호된 기본 CSV 예외를 추가하지 않는다.
- create commit 뒤 selection/query가 실패하더라도 생성 asset은 이미 존재한다. 실패를 미commit 성공/실패로 위장하거나 숨은 rollback을 만들지 않는다.

## 정적 시나리오 대조 — 실행 시험 아님

1. `.FFSX`는 slot, `.json`은 data, 확장자 없는 `image/*`는 image, 미지원은 empty다. 어떤 경우도 file bytes를 읽지 않는다.
2. current available이면 canonical path, same-kind replace가 허용되고 같은 id면 그 id, rename이면 current VFS/reservedPaths에 없는 unique path를 계산한다.
3. replace choice 대기 중 대상이 삭제되면 available로 새 asset을 생성하는 대신 stale replace를 먼저 거부한다. 대상 id/kind가 바뀌어도 다른 asset을 덮어쓰지 않는다.
4. plan 조회 뒤 다른 작업이 경로를 차지하면 조회 결과는 예약이 아니므로 command의 current-authority 재검증이 적용된다.
5. 빈 CSV 생성 실패면 selection event가 없다. 생성 성공이면 실제 canonical collision-free path를 선택하고 그래프/선택 slot은 유지한다.
6. missing/image/directory path의 selectCsv는 none이며 graphObject/index와 기존 CSV 선택을 보존한다. valid CSV는 SELECT_ASSET 한 전이로 asset 선택과 graph index clear를 함께 수행한다.
7. 읽기 결과는 scalar identity 전달에만 쓰며 Project candidate나 다른 작업의 장기 read store가 되지 않는다.

## 닫힘·후속

- F3의 두 미등록 operation을 공식 query에 등록했다. F2의 빈 CSV public composition과 CSV selection 반환/거부 경로를 명시했다. r30의 trace 표는 당시 발견 기록으로 보존한다.
- F1의 다른 public mutation 반환, F2의 다른 selection/zoom/runtime 완료, F4의 import router/export completion, 전체 왕복·목적·중복통합 검토는 남아 있다. 전체 API 보완 완료나 Source closure를 선언하지 않는다.
- Source r31 current/open, closure_review null. PlusCal/model/code는 stale이고 이번에 변경하지 않았다. 하위 구현으로 전파하지 않았다.
- 로컬 Source Script/app/checker/test/build/TLC를 실행하지 않았다. 정적 diff/byte fingerprint 계산은 실행 검증과 구별한다. 누적 Actions 검사와 실제 patch endpoint는 `agent_space/patches/20261016-014.md`에 기록한다.
