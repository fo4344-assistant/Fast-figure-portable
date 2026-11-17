# Plan038 — pseudocode 30 → source code 모듈 대조·수정

## 1. 목적

pseudocode 30의 절차·인자·현재 원천·반환·실패 의미를 source code에 연결한다. Source Script 53과 pseudocode는 보존하고, 실제 차이를 확인한 source code만 수정한다. 물리적 helper나 파일 분리 차이는 실제 호출 경로로 판단한다.

## 2. 확인된 차이

1. `pseudocode/system.pcal`은 준비 조건 확인 후 project 생성·채택, API 공개, runtime 시작, ready, UI mount, runtime 반환 순서다. `sourcecode/system.js`는 준비 검사 전에 채택하고 API를 runtime/ready 뒤에 공개하며 문자열을 반환한다.
2. `pseudocode/backend/project_state.pcal`의 Slot 생성·저장 dictionary 복원·인스턴스 검증에 대응하는 class가 없다. `sourcecode/backend/project_state.js`는 평면 accessor/toJSON을 설치하고 `normalizeSlotContents`가 변환 결과를 배열에 저장하지 않는다. `ProjectObject.read`는 등록 이름을 경로로 해석하지 않는다.
3. `pseudocode/backend/project_efsm.pcal`의 후보 설정 정규화, CSV 생성 입력 분기, 데이터와 header 동시 교체를 대조해야 한다. 현재 header가 있으면 별도 분기로 들어가 데이터 교체를 건너뛴다.
4. `pseudocode/backend/graphs.pcal`의 열 이름 기본값과 이번 호출의 chart 입력 보존이 다르다. source code의 `traces`는 전달받은 chart를 project의 기존 chart로 교체한다.
5. `pseudocode/frontend/interface_fsm.pcal`은 listener snapshot에 인자 없이 통지한다. source code는 live Set을 순회하며 state/event를 인자로 보낸다.
6. Slot의 평면 접근은 Backend 명령·asset tree·패키지 쓰기에도 남아 있다. 내부 참조를 content로 통일하고 기존 XML 저장 형식 변환은 직렬화 경계에서 명시해야 한다.
7. image editor 반환의 imageId/MIME, label reference의 width/height와 공개 인자·component 연결을 모듈별로 확인한다.

## 3. 모듈 작업 구간

각 행에서 대응 pseudocode 전체 절차와 source code의 직접 호출·private 확장을 대조한다. 수정 후 같은 구간의 입력/결과/실패와 인접 호출자를 다시 확인한다.

| 구간 | pseudocode → source code | 대조·수정 대상 |
|---|---|---|
| M01 | `system.pcal` → `system.js` | 준비 검사·초기 채택·공개·runtime/mount·반환 순서 |
| M02 | `backend/project_state.pcal` → `backend/project_state.js` | Slot/ProjectObject·복사·정규화·전체 검증·등록 읽기·query·참조 보정 |
| M03 | `backend/project_efsm.pcal` → `backend/project_efsm.js` | 모든 명령의 후보·정규화·검증·현재 참조 재검사·한 번 반영·실제 결과 |
| M04 | `backend/assets_files.pcal` → `backend/assets_files.js` | VFS·CSV/header/bytes·충돌/가져오기·참조 재계산·STORE/XML·복원·직렬화 경계 |
| M05 | `backend/graphs.pcal` → `backend/graphs.js` | 열/오브젝트·candidate·소유 검증·축/trace/figure·편집 전환·확장 필드 |
| M06 | `backend/layout_annotations.pcal` → `backend/layout_annotations.js` | Slot 생성·grid/병합/분할·기하·label·caption·이미지 설정 |
| M07 | `frontend/interface_fsm.pcal` → `frontend/interface_fsm.js` | 초기 session·모든 전이·publish snapshot·구독/해제·참조 보정 |
| M08 | `application/adapter.pcal` → `application/adapter.js` | state/subscribe·명령/선택·현재 query·투영·lifecycle·실패 |
| M09 | `application/public_api/contract.pcal` → `application/public_api/index.js` | 전 method 등록·명시 인자·현재 선택·download fallback·graph export |
| M10 | `application/public_api/assets.pcal` → `application/public_api/assets.js` | 全 wrapper·원자 batch/순차 router·취소/미반영·성공 후 공식 읽기 |
| M11 | `application/public_api/graphs.pcal` → `application/public_api/graphs.js` | 全 wrapper·오브젝트 명령·header·layout/palette·import/export |
| M12 | `application/public_api/layout_annotations.pcal` → `application/public_api/layout_annotations.js` | 全 wrapper·zoom lock·이미지·label/caption·print snapshot |
| M13 | `frontend/renderer.pcal` → `frontend/renderer.js` | 공통 frame·graph/image 비동기 guards/정리·controller·export·runtime 반환 |
| M14 | `frontend/mantine_ui.pcal` → `frontend/mantine_ui.js` | 모든 handler·현재 입력·component binding·공통 control/fold·preview·blur |
| M15 | `portable_build/portable_build.pcal` → `portable_build/portable_build.mjs` 및 `scripts/build-portable.py` | bundle·정확한 tag/개수·치환·외부 script 검사·쓰기/실패 |

## 4. 수정 방법

1. M02/M06에서 Slot을 한 원형으로 만들고 candidate 복사 후 실제 Slot으로 복원한다. 현재 project를 읽기 위해 정규화하지 않는다. 평면 필드 alias를 공유 상태에 남기지 않는다.
2. M03/M04에서 동일 후보의 CSV 입력·header·참조 chart 갱신을 연결한다. 반영 전 정규화/전체 검증과 현재 참조 재검사, 한 번 initialize, 실제 전후 결과를 보존한다.
3. 기존 FFPX/FFSX XML과 필드 이름은 유지한다. 평면 저장 형식 변환은 package 입출력에 한정한다. 인스턴스 원형을 저장 tag로 기록하지 않는다.
4. M05/M07의 전달 chart·listener snapshot 의미를 수정한다. UI에 index 보정 계산이나 새 영속 식별자를 추가하지 않는다.
5. Application/공개 API/UI/renderer는 기존 owner·명시 절차를 연결한다. 실제 자원 수명·오래된 비동기 완료의 폐기·export 계산과 공통 frame을 보존한다.
6. M01은 준비 조건 확인부터 runtime 반환까지 직접 호출 순서를 맞춘다. 이전 실패에 대한 새 rollback 정책을 만들지 않는다.
7. 각 모듈에서 이미 대응하는 절차는 유지하고 검토 문서에 유지 근거를 남긴다. 반복 검사는 실제 변경과 영향을 받은 호출 경로에 한정한다.

## 5. 보류 계약과 완료 증거

- `review-20261117-006-plan037-modules.md`의 import plan mode와 palette 이후 figure 전달은 상위 계약 충돌이다. 이번 수정에서 필드·조회·알고리즘을 보충하지 않는다.
- 후속 review에 15개 모듈의 수정/유지·직접 근거·논리/목적/비중복 판단과 남은 상위 계약을 기록한다.
- 실제 native Git diff와 같은 이름의 patch 설명에 선택 이유·대안을 기록한다. 새 계획 문서만의 code patch를 만들지 않는다.
- source code revision/fingerprint/derived_from/translation_review를 실제 수정에 맞춘다. Source Script·pseudocode·설정·기존 문서와 별도 계층의 상태는 보존한다.
- 정적 구문·diff·보호 범위·hash 확인과 실행 검증을 구분한다. 정적 일치로 앱·UI·비동기 자원 또는 전체 계층 닫힘을 선언하지 않는다.
