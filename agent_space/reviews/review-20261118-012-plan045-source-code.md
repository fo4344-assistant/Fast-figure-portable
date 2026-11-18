# Plan045 — 목적별 API의 source code 번역 검토

## 기준

- Source Script 57, pseudocode 34를 기준으로 source code 163을 검토했다.
- API 제공자가 필요한 필드를 먼저 구성하고 그 결과를 분리·읽기 전용으로 반환하도록 수정했다.
- 목록·설정 입력에서 전체 자산·CSV 행·graph/imported figure를 받은 뒤 UI에서 버리는 경로를 제거했다.

## 변경 대응

- 구현 파일: `sourcecode/backend/project_state.js`, `sourcecode/application/adapter.js`.
- API 연결: `sourcecode/application/public_api/index.js`, `sourcecode/application/public_api/graphs.js`, `sourcecode/application/public_api/layout_annotations.js`.
- UI 호출·구독: `sourcecode/frontend/mantine_ui.js`.

| 구간 | 실제 변경과 호출부 |
|---|---|
| Backend 자산 | `sourcecode/backend/project_state.js`의 tree/trash/deletion 반환을 메타데이터와 참조 정보로 제한. 참조 수는 조회별 한 번 수집하고 종류/id별로 집계한다. trash는 해당 경로를 먼저 제한한다. |
| Backend 그래프 | readData는 목록용 객체 필드와 chart/CSV 메타데이터, readControls는 현재 객체 하나와 설정 입력 문맥만 반환한다. plotlyTrace·행·bytes·figure는 포함하지 않는다. |
| 명시적 표 조회 | readColumns는 지정 CSV 또는 raw chart의 conversionRows에서 열 정의만 만든다. readPreview는 start/count를 검증하고 최대 30행만 복사한다. 명시한 null 범위도 거부한다. |
| 나머지 목적별 조회 | slots.readDisplay, images.readSettings, layout.readControls, captions/labels.readSettings를 등록하고 Application의 현재 선택 전달을 연결했다. 기존 실제 이미지·치수·텍스트·렌더·파일 조회는 해당 표시·출력용으로 유지한다. |
| 읽기 전용 결과 | immutableProjectCopy는 결과를 한 번 복사한 뒤 호출 안의 WeakSet으로 이미 방문한 객체를 건너뛴다. Project 원본을 freeze하거나 전역 read cache를 두지 않는다. |
| Application | renderer 너비 계산은 layout.readControls를 사용한다. layout 후속 반환은 공통 readLayoutApiControls를 재사용한다. graph 성공 후 조회와 header 후속 조회를 좁은 조회로 바꿨다. 이동의 same-index 검증에 필요한 목록 조회는 유지한다. |
| UI 자산·표 | 트리와 슬롯 표시는 메타데이터만 사용하고 행마다 deletion 조회를 하지 않는다. CSV 선택지는 readList, 열은 readColumns, 실제 표 미리보기는 readPreview를 사용한다. header 상한은 total rowCount를 사용한다. |
| 공통 입력 | UiCommand의 readCurrent 한 번으로 target/value/companions/ready를 얻고 commit/send/step의 같은 판정에 전달한다. grid의 동반 치수와 label의 x/y를 재조회하지 않는다. |
| 구독·표시 | 구조 구독은 필요한 Frontend 필드의 primitive key, 개별 입력과 표시 구독은 필요한 API 결과의 primitive key를 사용한다. 실제 image preview와 caption text/slot text 등 표시가 필요한 별도 구독은 유지한다. 닫힌 overlay는 해당 표시 조회를 생략한다. |
| theme | palette key가 바뀔 때만 theme/CSS resolver를 다시 구성한다. 기존 component와 스타일, 입력·취소·명령 동작은 유지한다. |

## 논리적 타당성

- id 0, 현재 선택과 명시적 csvId/chartId, missing/hidden 대상, 빈 preview와 범위 검증을 구분했다.
- 입력 문자열·IME·Enter 뒤 blur·동일 값·비동기 완료와 원래 오류의 우선순위를 유지한다. 버튼의 null 값은 숫자 동일 값 생략 조건에 포함하지 않는다.
- CSV 트리 행 수는 header를 제외하며, header 입력의 currentCsv.rowCount는 전체 행 수다.
- Project 명령의 candidate·전체 검증·현재 참조 재확인·단일 commit·참조 보정은 변경하지 않았다.

## 목적과 중복

- 비용이 큰 자료는 필요한 API에서만 생성·반환하며, 소비자가 전체 결과를 먼저 받아 걸러내는 방식으로 대체하지 않았다.
- 새 Project 복제 저장소, 공통 getter registry, UI 범위 정규화 소유자 또는 새 명령 경계를 추가하지 않았다.
- 실제 렌더의 선택 슬롯 제한·명시적 전체 렌더·CSS 변환, 파일 형식과 export/resource 수명은 유지한다.
- 중복 candidate 복사·전체 검증·명령 결과 비교 최적화는 이번 API 번역에 섞지 않았다.

## 확인 범위

- 전체 실제 변경과 후속 조정, 호출·반환 shape, 6개 JS 문법, local import/export, fingerprint·메타데이터·변경 범위·native patch를 정적으로 확인했다.
- 앱·브라우저·성능 프로파일·테스트·빌드·checker main은 실행하지 않았다. 실제 처리 시간 개선이나 전체 계층 closure를 확정하지 않는다.
