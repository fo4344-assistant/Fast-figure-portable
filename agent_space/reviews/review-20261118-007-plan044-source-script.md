# Plan044 — Source Script 변경 검토

## 범위

- 기준: `8edca8e56cc1698623c5ee81220e47b22cd71845`, Plan044.
- Source Script 7개와 해당 계층의 revision/fingerprint를 변경했다.
- Source Script 56: `sha256:8156cee2ea890dcd2c9c59df78718c0d85318bc2d5aff21ae621d8b68ddc59b4`.
- 기존 Plan043·Plan044·검토006은 보존한다. pseudocode·source code·dist는 변경하지 않았다.

## 요구사항과 연결

| 요구사항 | 명세와 호출 경로 |
| --- | --- |
| 선택 슬롯만 자동 내용 갱신 | Application의 dispatchSlotSelection/dispatchProjectCommand → selected-slot 조회 → renderDashboard → presentSlotContent |
| 선택 없음·0 구분 | None/missing/hidden은 내용 계산 생략, 0은 유효한 explicit slotId |
| 계산 범위부터 제한 | Backend는 operation·id를 먼저 판정; 구조에는 figure/CSV/image bytes가 없고 targetSlot만 한 슬롯 내용 |
| 명시적 전체 갱신 | workspace.render → Application.renderWholeWorkspace → whole-workspace 조회 → Renderer.renderWholeWorkspace |
| 버튼 위치·공통 규격 | FastFigureApp의 프린트 바로 왼쪽, 기존 Button·UiCommand.send·theme·busy·접근성 |
| 이동·크기 변경 | Shell/zoom → transformWorkspace → workspace-structure → applyWorkspaceTransform; 기존 화면의 CSS translate/scale |
| 형상 비호환 | 유지 가능한 화면 보존·전체 갱신 필요 안내; 자동 전체 전환 없음 |
| 시작·프로젝트 교체 | 빈 구조만 표시; 교체된 이전 자원 정리는 즉시 수행 |
| 비동기 경합 | 슬롯별 pending/작업 순번, workspace 수명·host·소유 연결 검증; 다른 슬롯 작업 유지 |
| 출력·선택 장식 | 독립 export 경로 보존; 현재 선택 경계/bookmark는 현재 틀에 표시 |

## 논리·목적·중복성

1. 명령은 기존 EFSM의 검증·한 번 commit·참조 보정을 유지한다. 선택 보정 후의 id로 조회한다.
2. 배치·기하 조회와 내용 조회를 분리해 선택 외 figure 계산부터 생략한다. 렌더러에서 전체 결과를 필터링하는 경로를 만들지 않았다.
3. 단순 변환은 기존 content·기준 치수·DOM 자원만 사용한다. 이 정보는 Project 읽기나 명령의 원천이 되지 않는다.
4. 같은 슬롯 내용 표시는 presentSlotContent에 모으고 전체/선택 진입점이 이를 호출한다.
5. UI·wrapper의 중복 표시를 제거하고 Application에서 표시 범위를 결정한다. palette와 전역 caption의 다른 슬롯 표시는 전체 버튼까지 유지한다.
6. 창/Sidebar/배율 변경은 CSS 변환만 수행한다. Plotly render/resize나 이미지 재해석을 예약하지 않는다.
7. export는 독립 작업의 명시적 입력과 host를 유지하며 workspace의 수명 교체로 취소하지 않는다.

## 확인과 한계

- 관련 Source Script 원문과 전체 실제 구현 diff를 확인했다. 정적 AST 구문·fingerprint·native diff 역적용/공백·변경 범위를 확인했다.
- 실행 테스트·앱·브라우저·빌드·TLC·checker main은 실행하지 않았다.
- 실제 선택 슬롯 호출 수·화면 배율·포인터 역변환·실패/경합은 후속 구현과 실행 확인 대상이다.
- pseudocode와 source code는 이전 Source Script 55의 계보를 유지한다. 실행 동작이 변경되었다고 주장하지 않는다.
