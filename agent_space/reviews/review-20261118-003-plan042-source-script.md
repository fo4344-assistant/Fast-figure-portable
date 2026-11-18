# Plan042 Source Script 수정 검토

## 대상

- 기준 commit: `b55d748ed1a0adee8924c480719f4b8e7b287a9d`.
- 계획: `../plans/plan-042.md`. 수정은 Source Script에 한정했다.
- Source Script 55: `sha256:3f2615ec38ee772db09faa669568bf393df8f85bd9c3e0609375145352306913`.

## 변경과 대응

| 항목 | 반영 내용 | Source Script 위치 |
| --- | --- | --- |
| 공통 UI 객체 | UiCommand의 input/commit/send/cancel/step/dispose, 현재 대상·ready 확인, 같은 값 생략, 실행 중 중복 방지, 동기·비동기 종료 정리 | `sourcescript/frontend/mantine_ui.py`의 UiCommand |
| 숫자 편집 | 원문·커서 유지, Enter/blur 한 번 확정, Escape·대상 변경 취소, 조합 중 확정 보류, 완성 십진수·유한성 확인 | 같은 파일의 prepareNumericInput, FastFigureApp |
| 전체 필드 연결 | 이미지 3·CSV 1·오브젝트 4·축 28·전역 2·레이블 3·캡션 2·프린트 3·레이아웃 8개를 공식 read와 기존 API에 연결 | FastFigureApp 처리 15 |
| 빈 값·범위 | 필수 빈 값은 현재 값 복원. 자동 축·전역 글자 크기·프린트 높이는 해당 API의 빈 값 의미 유지. 범위·정수화는 기존 소유자의 명시한 규칙을 재사용 | prepareNumericInput 및 각 연결의 Backend 참조 |
| 버튼 | 명령 버튼은 같은 객체의 send를 사용하고 API 인자·반환·취소·오류를 보존. 접기·collision 응답·Modal 조작은 UI-local 처리 유지 | FastFigureApp 처리 14 |
| 크기 잠금 제거 | 상태·이벤트·API·너비 분기·UI 연결 제거. 배율 50..200과 100% 초기화 유지 | interface_fsm, application/adapter, public_api 및 layout_annotations, backend/project_state, system |
| 미리보기 점선 | showBorders=False에서 해당 preview host 장식 영역에 점선, True에서 제거 | FastFigureApp 처리 11 |
| 작업공간 선택 | 빈 슬롯 안쪽 4px 경계, graph/image bookmark의 선택·포커스와 포인터 이탈 후 강조 유지, host 재사용 시 정리 | `sourcescript/frontend/renderer.py`의 renderDashboard |
| 출력 | 선택 경계·bookmark 강조·점선을 raster 출력에서 제외. 현재 너비 측정은 캡처 작업에 유지 | 같은 파일의 readDashboardRenderedWidth, renderDashboardTarget/Current |

## 논리·목적·중복 검토

1. 입력 중에는 편집 문자열만 바꾼다. 확정 시 현재 대상과 공식 값을 읽고 기존 API를 한 번 호출한다. Backend는 현재 프로젝트에서 재검증·정규화하고 반영한다.
2. Enter 후 blur는 종료한 editing 상태로 중복을 막는다. 대상 변경·unmount 뒤 이전 작업 결과로 새 입력을 덮어쓰지 않으며, 작업의 예외·취소도 running 정리를 거친다.
3. 도중 값이 최소·최대로 교체되는 입력과 숫자 위젯의 blur 재전송을 처리 단계에서 분리했다. 필드의 저장 의미·자동 값·범위를 연결별로 보존한다.
4. 단일 명령 경로는 기존 Application과 Project EFSM이다. 별도 API 등록부·프로젝트 복사본·범위 저장소를 추가하지 않았다.
5. 선택·점선은 공통 틀의 decoration에만 둔다. content 치수와 Plotly·이미지 자원 수명·비동기 검증은 유지한다.
6. 크기 잠금 참조를 Source Script 전체에서 제거하고 배율·현재 캡처 너비의 역할을 분리했다. 기존 문서 원본은 보존했다.

## 확인 범위와 남은 단계

- 전체 실제 변경을 읽고 Source Script 15개를 AST로 구문 확인했다. Source Script 실행이나 동작 테스트는 하지 않았다.
- 실제 fingerprint, native Git patch, 변경 범위와 하위 계층 유지 여부를 정적으로 확인했다.
- pseudocode 31·source code 160·verification·dist·settings·기존 문서는 변경하지 않았다. 하위 계층의 derived_from도 종전 Source Script 54를 유지한다.
- Source Script 상태는 stale/open이다. pseudocode·source code 번역과 실제 UI 확인은 후속 단계다.
- 숫자 입력·빠른 중복·대상 변경·미리보기·선택·출력에 대한 브라우저 테스트와 빌드는 실행하지 않았다.
