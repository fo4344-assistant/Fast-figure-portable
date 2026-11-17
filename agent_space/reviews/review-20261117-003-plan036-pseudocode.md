# Plan036 Source Script → pseudocode 번역 검토

## 1. 기준

- 계획: `../plans/plan-036.md`. Source Script 변경 근거: `review-20261117-002-plan036-source-script.md`.
- Source Script 53의 변경 절차와 호출 관계를 기준으로 pseudocode를 번역했다. 관련 pseudocode 6개 파일 전체와 Source Script의 실제 변경 patch 전체를 확인했다.
- 기존 계획·검토 문서는 보존했다. 이번 변경은 pseudocode 5개 파일과 버전 메타데이터다.

## 2. 대응과 논리·목적·중복 검토

| Source Script 절차 | pseudocode 대응 | 검토 |
|---|---|---|
| `application/adapter.py:dispatchProjectQuery`, 선택·명령 경로 | `application/adapter.pcal`의 같은 절차들 | 현재 Frontend state와 현재 layout에서 잠금/배율 너비를 정해 요청 사본에 담는다. 전면 renderer만 이 경로를 사용하고 부분 조회는 유지한다. 조회 사이에 명령·callback·비동기 대기를 넣지 않는다. |
| `backend/project_state.py:readBackendProjection` | `backend/project_state.pcal:RendererRead` | 유한 양수 너비를 검증하고 캡처한 같은 source로 기존 `DashboardGeometryInProject`를 호출한다. 전면 투영에 geometry를 포함한다. preview의 clamp/fallback은 기존 절차에 유지한다. |
| `frontend/renderer.py:renderDashboardFrame`, `renderDashboard`, `applySlotStyle` | `frontend/renderer.pcal`의 같은 절차들 | host별 grid와 슬롯 틀을 한 절차로 구성한다. grid radius 0, 슬롯 radius, span·gap·margin·외곽선·내용/장식 영역을 함께 적용한다. 실제 자원 정리는 틀 갱신 전에 수행하고 기존 비동기 완료 검증·export 절차를 유지한다. |
| `frontend/mantine_ui.py:FastFigureApp`의 미리보기 | `frontend/mantine_ui.pcal:RenderLayoutPreview` | 공식 `readLayoutApiState(width)`에서 반환된 effective geometry를 공통 틀에 전달한다. 외부 폭이 좁으면 스크롤하고 좌표·선택·포커스는 치수에 영향을 주지 않는 장식으로 둔다. 미리보기 host/listener만 정리한다. |
| 같은 `FastFigureApp`의 공통 크기·정렬·접기 | `FastFigureApp`, `ToggleUiFold` | theme/default props의 같은 역할 규칙, 입력 폭·간격·하단 정렬·줄바꿈을 연결했다. 전역/오브젝트 초기 열림과 축·종류·UI 색상·debug 초기 닫힘, 계층, 개별 개폐·키보드·포커스 이동을 표현했다. 일반 재렌더에서 UI-local 상태를 유지한다. |
| `changeLayoutGridDimension`, UI 입력 연결 | 같은 절차와 `LayoutDimensionChanged/Blur` | 빈 값 편집 중에는 명령 없이 반환하고 빈 blur는 현재 공식 행·열을 표시한다. 일반 blur도 표시만 갱신한다. 유효 숫자만 기존 setGrid 경로로 이어지며 거부·예외를 보존한다. |
| `backend/project_efsm.py:buildProjectMutationResult`, `send` | `FormActualMutationResult`, `ProjectStateMachine_send` | 동일한 검증 payload와 실제 반영 전후 chart로 모든 이전 순번의 새 순번을 구성한다. move의 명시 index hint를 제거했다. 기존 삭제 대응표와 현재 owning chart에 한 번 적용하는 참조 보정을 사용한다. 실패·동일 위치의 비반영 경로는 성공 대응표를 만들지 않는다. |
| `FastFigureApp`의 오브젝트 목록 | `ReadGraphObjectOptions` 및 render binding | 같은 공식 readData의 chart 제목과 기존 legendName/x·y 식별 문자열을 사용한다. 원래 0 기반 선택 값, 빈 제목, 긴 제목 줄바꿈·식별 부분·접근성 이름을 보존한다. 저장 필드와 trace 범례는 유지한다. |
| `system.py:initializeFastFigure` | 기존 `system.pcal:PrepareBoundaryInputs` | 초기 `dispatchProjectQuery("renderer", …)`가 startup 전에 이미 연결돼 있어 추가 변경 없이 새 너비/기하 경로를 사용한다. |

## 3. 확인 수준과 다음 계층

- 실제 전체 Git diff와 새 절차의 호출·반환·선택 대응 경로를 정적으로 확인했다. UI의 private 절차는 Source Script `FastFigureApp` 처리 단계의 물리적 분해다.
- 기존 fingerprint 함수만 사용해 Source Script 53과 pseudocode 28의 실제 hash를 확인했다. checker main과 PlusCal 변환·TLC·앱·브라우저·빌드·테스트는 실행하지 않았다.
- Source Script 53은 그대로이며 pseudocode의 derived_from만 현재 Source Script hash로 갱신했다. 기존 stale와 Source Script open 상태를 유지한다. 이 검토는 실행·시각 검증 결과가 아니다.
- source code 158, verification, dist, 설정, 정책과 기존 문서는 변경하지 않았다. source code의 이전 derived_from은 미번역 상태를 표시하도록 유지했다.
