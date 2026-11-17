# Plan036 Source Script 수정 검토

## 1. 대상과 범위

- 계획: `../plans/plan-036.md`.
- 수정 기준 commit: `a310ef4757c4ef5c756aaa4dbdad835dbfc4a5fc`.
- 원문 개발 정책 전체, Source Script 예시, Plan036 전체와 변경 대상 Source Script의 절차·호출 관계를 확인했다.
- 위치 조사 subagent의 결과를 참고하고 부모가 변경과 아래 정적 검토를 수행했다.
- 기존 계획·검토 문서는 보존했다. 이 문서는 이번 변경의 후속 검토다.

## 2. 요구사항별 근거

| 요구사항 | 변경한 절차 | 논리·목적·중복 검토 |
|---|---|---|
| 공통 조작 크기와 행 정렬 | `sourcescript/frontend/mantine_ui.py`의 `FastFigureApp` | 같은 역할의 입력·버튼·행 동작 아이콘은 theme/default props의 같은 높이·글꼴·padding·radius를 사용한다. 행은 공통 폭·간격·라벨 입력 하단 정렬·좁은 폭의 줄바꿈을 담당한다. renderer 도형 치수는 기존 담당 절차에 남긴다. |
| 접기 계층 | 같은 `FastFigureApp` | 전역/오브젝트, X/Y와 네 방향 축, 종류별 설정, UI 색상, 디버그 로그의 계층과 초기 개폐 상태를 지정했다. UI-local 상태로 일반 재렌더에서 유지하며 키보드·포커스·expanded 연결을 정의했다. project·선택·debugEnabled를 변경하지 않는다. |
| 공통 대시보드 틀 | `sourcescript/frontend/renderer.py`의 `renderDashboardFrame`, `renderDashboard`, `applySlotStyle`; UI의 `FastFigureApp` | 실제 화면과 미리보기가 한 함수로 grid·slot 틀을 구성한다. grid radius=0, 각 slot radius=geometry.radius, span·gap·margin·border·box sizing을 함께 적용한다. 미리보기의 좌표·선택 장식은 틀의 치수를 유지한다. |
| 현재 기하 입력 전달 | `sourcescript/application/adapter.py`의 `dispatchProjectQuery`, 선택·명령 경로; `sourcescript/backend/project_state.py`의 `readBackendProjection`; `sourcescript/system.py`의 `initializeFastFigure` | Application이 현재 세션 lock/zoom과 현재 layout에서 실제 너비를 정한다. Backend는 같은 동기 조회에서 기존 `dashboardGeometry`로 기하를 계산한다. 초기화·선택·반영 후 갱신이 같은 조회 경로를 사용한다. renderer의 기하 재계산을 제거했다. |
| 빈 행·열 입력의 편집 종료 | UI의 `changeLayoutGridDimension`, `FastFigureApp` | None/빈 문자열 입력 중에는 명령을 보내지 않는다. 빈 값의 blur는 그 시점의 공식 layout 수를 표시하고 UI 편집값을 정리한다. 일반 blur도 재조회로 표시한다. 유효 숫자의 기존 setGrid 경로와 오류·거부 처리를 유지한다. |
| 오브젝트 이동 뒤 선택 | `sourcescript/backend/project_efsm.py`의 `buildProjectMutationResult`, `ProjectStateMachine.send`; project_state의 `buildFrontendReconciliationInput` | 성공한 move의 검증된 from/to와 실제 전후 chart에서 모든 이전 순번의 새 순번을 반환한다. move의 selectedIndexHint를 제거해 기존 선택에 대응표가 적용되게 했다. 이동 대상·밀려난 항목·동일 값 항목·미선택·다른 chart를 기존 참조 보정 경로에서 처리한다. |
| 그래프 제목을 포함한 목록 | UI의 `FastFigureApp` | 같은 공식 readData의 chart 제목과 object의 기존 legendName 또는 x·y 식별 문자열을 사용한다. 원래 index 선택 값, 범례와 저장 형식은 유지한다. 빈 제목·긴 제목·chart 없음의 표시를 정의했다. |

## 3. 경계와 보존 사항

- 미리보기는 기존 너비 제한·fallback을 유지하고 반환된 effective width를 host에 적용한다. 더 좁은 외부 영역은 스크롤한다. 실제 대시보드의 잠금/배율 너비에는 preview 제한을 적용하지 않는다.
- 공통 틀은 supplied host 아래의 DOM만 다룬다. 실제 Plotly generation·instance와 이미지 decode/URL 자원 정리는 실제 renderer가 계속 소유한다. 교체·제거 자원을 먼저 정리하고 틀을 갱신한다. 미리보기는 이 자원을 할당·해제하지 않는다.
- grid·슬롯의 저장 필드, 설정 JSON, 삭제 대응표, 실패 시 기존 상태 보존, 한 번 commit, Frontend의 기존 한 번 reconciliation을 유지했다.
- 새 변수 정의에는 입력·출력·local 값의 의미를 적고 분기·계산·상태 전이는 담당 절차의 처리에 적었다.

## 4. 확인 수준

- 변경 Source Script의 실제 Git diff와 관련 호출·반환 경로를 검토했다.
- Python Source Script 15개 파일은 AST 파싱으로 문법만 확인했다. Source Script를 실행하지 않았다.
- Source Script revision은 53이다. 전체 계층의 기존 `stale`·`closure: open`을 유지했다. 이번 정적 검토를 전체 계층 닫힘이나 실행 성공으로 표시하지 않는다.
- pseudocode 27, source code 158, verification, 설정, 배포 파일, 정책과 기존 문서는 변경하지 않았다. 하위 계층의 기존 derived_from도 유지해 미번역 상태를 드러낸다.
- 테스트·브라우저·앱·빌드·checker main·추가 commit/push는 수행하지 않았다. 시각적 일치와 실제 조작 재검증은 하위 번역 이후의 확인 사항이다.
