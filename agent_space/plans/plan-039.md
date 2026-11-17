# Plan039 — 파일 가져오기 확정값과 팔레트 표시 입력 연결 수정

## 1. 목표

1. 파일 충돌 선택을 마친 뒤 전달하는 `path`·`replaceId`와 Backend의 반영 전 재검증 절차를 일치시킨다.
2. 팔레트 적용에 필요한 색상값과 Plotly 표시 설정을 어느 API에서 받아 어느 함수에 전달하는지 명시한다.
3. Source Script를 먼저 수정하고 pseudocode와 source code의 해당 호출·입력·반환을 순서대로 대조한다.

## 2. 확인된 원인

### 2.1 파일 가져오기

- 2026-10-17의 `cf7b725fc3d5cdec51a47051db2964a858eb4499`는 충돌 선택을 기다린 뒤 완료된 `path`·`replaceId`만 명령에 전달하도록 정했다.
- 2026-11-15의 `3443798`은 `sourcescript/backend/assets_files.py`의 `buildProjectAssetImportCandidate`에 최종 입력의 `mode`를 다시 선택값으로 사용하는 설명을 추가했다. 생산 절차의 반환값은 `path`·`replaceId`로 유지됐다.
- `sourcescript/backend/assets_files.py:315-316,343-346`의 소비 절차와 `sourcescript/backend/project_state.py:317`, `sourcescript/application/public_api/assets.py:468-500`의 생산·전달 절차가 어긋난다.
- 충돌 조회의 `mode`는 `available`·`replace-or-rename`·`rename-only` 상태다. 사용자의 `rename`·`replace` 선택은 `choice`다. 각 값이 필요한 단계와 최종 확정값을 구분한다.

### 2.2 팔레트 표시

- `sourcescript/backend/project_state.py:333`은 renderer의 `ui-palette` 조회에 팔레트 색상값만 반환하도록 정한다.
- `sourcescript/frontend/renderer.py:474-501`의 `applyUiPalette(projectProjection, notify)`는 CSS 적용과 함께 Application이 제공한 Plotly 표시 설정으로 그래프를 갱신한다고 설명한다.
- 그 표시 설정을 조회하는 API와 호출·인자 연결이 해당 절차에 명시되어 있지 않다.
- 현재 source code의 일반 팔레트 변경은 `dispatchProjectCommand`가 전체 renderer 조회 결과를 반환하고 `applyDashboardProjectionInvalidation`이 CSS와 그래프에 적용한다. 이 실행 경로를 근거로 그래프 색 갱신 실패를 판정하지 않는다.
- CSS 변수 적용과 Plotly 표시 적용은 서로 다른 플랫폼 API를 사용한다. 각각의 호출에서 필요한 입력과 전달 경로를 명시한다.

## 3. 책임과 입력

| 단계 | 소유·조회 대상 | 전달값과 책임 |
|---|---|---|
| 파일 충돌 조회 | Backend의 현재 프로젝트 VFS | 종류·경로·충돌 상태·교체 가능 ID 반환 |
| 사용자 선택 | Application/UI | `rename`·`replace`·취소를 수집하고 기존 `assets.resolveImportPlan` 조회에 전달 |
| 선택 확정 | Backend `resolveProjectAssetImportPlan` | 현재 충돌·예약 경로를 대조한 최종 `path`·`replaceId` 반환 |
| 가져오기 명령 | Project EFSM의 이번 명령 후보 | 확정 경로·교체 대상 재검증, 파일 생성·교체와 Slot 연결, 전체 검증 후 한 번 반영 |
| 팔레트 원본 | `activeProject._state.appearance.uiPalette` | 프로젝트의 영속 색상값 |
| 색상값 조회 | `dispatchProjectQuery("renderer", {operation: "ui-palette"})` | 기존 팔레트 색상값 반환 |
| 색상과 그래프 표시 조회 | `dispatchProjectQuery("renderer", 요청)`의 전체 renderer 조회 | 현재 프로젝트의 `appearance.uiPalette`와 visible graph slot별 `figure` 반환 |
| 명령 뒤 전달 | `dispatchProjectCommand("APPEARANCE_CHANGED", payload)` | 참조 보정 후 전체 renderer 조회 결과를 튜플의 `rendererProjection`으로 반환 |
| 표시 적용 | Frontend renderer | 전달받은 팔레트로 CSS 적용, 전달받은 `figure`로 Plotly 갱신 |

## 4. 수정 단위와 순서

### R01 — 파일 가져오기 Source Script

대상: `sourcescript/backend/assets_files.py`의 `buildProjectAssetImportCandidate`와 직접 연결된 생산·전달 절차.

1. `planImport` 원소를 확정된 `path`·`replaceId`로 설명한다. `model`·`choice` 지역 정의 중 이 절차에서 사용하지 않게 된 항목을 정리한다.
2. 입력 파일 수와 확정값 수·형식을 검사한다. 각 경로의 canonical 형식, 대상 디렉터리, 이번 작업의 예약 경로 중복을 확인한다.
3. `replaceId`가 None이면 해당 경로가 현재 후보에서 비어 있어야 한다. 교체 ID가 있으면 해당 경로의 현재 종류와 ID가 입력 파일 종류·확정 ID와 일치해야 한다.
4. 대상이 삭제되거나 변경되었으면 후보를 거부한다. 반영 단계에서 새 이름이나 다른 교체 대상을 자동 선택하지 않는다.
5. 파일 순서에 따라 같은 후보에 생성·교체를 적용하고 최종 경로를 예약한다. 명시된 Slot 연결, CSV를 참조하는 chart 재계산, 전체 후보 검증과 단일 반영을 유지한다.
6. 취소는 기존 Application 절차에서 명령 전에 처리한다. 파싱·참조·검증 실패는 기존 실패 경로를 유지한다.

### R02 — 팔레트 Source Script 호출·입력 연결

대상: `sourcescript/application/adapter.py`, `sourcescript/backend/project_state.py`, `sourcescript/frontend/renderer.py`와 `sourcescript/application/public_api/layout_annotations.py`의 팔레트 호출부.

1. 색상 필드는 `activeProject._state.appearance.uiPalette`에서 읽고, 그래프 배경·글자색을 반영한 `figure`는 같은 프로젝트를 읽는 Backend의 기존 그래프 표시 계산으로 만든다는 경로를 명시한다.
2. `applyUiPalette(projectProjection, notify)`가 CSS와 그래프를 함께 적용할 때는 전체 renderer 조회 결과를 받도록 Args·처리·호출부를 연결한다. 팔레트와 각 graph slot의 `figure` 접근 경로를 기존 반환 구조에 맞춰 적는다.
3. 명령 뒤에는 `dispatchProjectCommand("APPEARANCE_CHANGED", payload)`가 이미 반환한 `rendererProjection`을 사용한다. 표시용 자료를 다시 조회하는 중복 호출을 추가하지 않는다.
4. 명령 없이 현재 표시를 적용하는 호출이 전체 표시 입력을 필요로 하면 `dispatchProjectQuery("renderer", 요청)`을 사용한다. Application이 기존 조회 절차로 현재 Frontend 참조와 표시 너비를 전달한다.
5. 색상값만 필요한 호출은 기존 `ui-palette` 조회와 CSS 적용 경로를 사용한다. 부분 조회의 반환 필드는 유지하고 호출자가 사용하는 필드와 맞춘다.
6. CSS와 Plotly 적용 단계, 알림 발생 위치·횟수, 반환값과 실패 전파를 명시한다. Backend 조회는 Application이 수행하고 renderer는 전달받은 값을 적용한다.
7. graph object·CSV·프로젝트 팔레트에 표시용 중복 필드를 저장하지 않는다. 기존 host·Plotly·image 자원 수명과 비동기 완료 판정은 유지한다.

### R03 — pseudocode와 source code 대조

1. R01·R02의 Source Script 입력·반환·실패와 호출 연결을 확정한다.
2. `pseudocode/backend/assets_files.pcal`, `pseudocode/backend/project_efsm.pcal`, `pseudocode/backend/project_state.pcal`, `pseudocode/application/adapter.pcal`, `pseudocode/application/public_api/layout_annotations.pcal`, `pseudocode/frontend/renderer.pcal`의 해당 절차를 대조한다. 직접 연결된 public asset 전달도 확인한다.
3. 같은 책임의 source code를 대조한다. 현재 최종 경로·교체 ID 재검증과 팔레트 전체 표시 경로가 수정된 Source Script에 대응하면 유지한다. 실제 누락이나 다른 입력·반환에 한정해 수정한다.
4. Source Script는 저장된 예시의 지역 정의·Args·Return·변경·처리 형식을 따른다. 계산과 분기는 처리 절차에 적고, 각 필드의 원본 객체와 조회·전달 API를 명시한다.

## 5. 확인과 완료 조건

- 파일 생성: 확정 경로가 비어 있을 때 생성하고, 같은 경로가 사용 중이면 거부한다.
- 파일 교체: 경로·종류·ID가 같은 현재 자산을 교체하고 기존 참조를 유지한다. 삭제·종류 변경·대상 변경은 거부한다.
- 일괄 가져오기: 같은 작업의 중복 경로, 중간 파일 파싱 실패, Slot 대상 변경을 기존 후보 검증·반영 규칙으로 처리한다.
- 팔레트: CSS 적용 호출은 색상 필드를 받고, 그래프 적용 호출은 같은 프로젝트에서 계산한 `figure`를 받는다. 호출자부터 소비 함수까지 API·인자·반환 필드를 추적할 수 있어야 한다.
- 변경 명령 뒤 참조 보정과 표시 실패의 구분, 알림 횟수, 기존 graph object·CSV·Slot·패키지 저장 형식이 유지되어야 한다.
- 후속 검토 문서에 두 문제의 Source Script→pseudocode→source code 대응과 논리적 완결성·목적 적합성·비중복 근거를 기록한다. 정적 확인과 실행 확인의 결과를 구분한다.
- 실제 수정한 개발 계층의 fingerprint·파생 관계를 갱신한다. 소스 변경은 native Git patch와 설명으로 기록하고 기존 계획·검토 문서는 보존한다.
