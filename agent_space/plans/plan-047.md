# Plan047 — 작업이 끝나는 곳에서 해당 UI 요소를 직접 갱신

[Plan046](plan-046.md)의 화면 갱신 방식을 교체한다. 반환값 보완과 CSV 미리보기 조회 제한은 유지한다. 수정 대상은 Source Script다.

## 1. 변경할 절차

| Source Script 위치 | 수정 내용 |
|---|---|
| `frontend/interface_fsm.py` — `InterfaceStateMachine.__init__`, `subscribe`, `publish`, `send`, `reconcileProjectResult`, `notify` | 상태 전이와 참조 보정은 FSM에서 수행하고 결과를 호출자에게 반환한다. `listeners`와 `subscribe`·`publish`·`notify`의 호출을 정리한다. `notify`가 겸하던 방향 설정은 실제 방향을 정하는 전이에서 처리한다. 가져오기·내보내기 실패 시 오류 표시와 조작 가능 상태 복귀를 각각 기존 작업 경로에서 연결한다. |
| `application/adapter.py` — `ApplicationInterface.subscribe`, `dispatchInterfaceEvent`, `dispatchSlotSelection`, `dispatchProjectCommand`, `runLifecycleTask` | `ApplicationInterface.subscribe`를 제거한다. 입력 검증과 전이를 마친 뒤 해당 UI 요소의 갱신 함수를 호출한다. 프로젝트 명령은 반영과 참조 보정 뒤, 이번 결과의 대상 식별자로 갱신할 요소를 정한다. 선택하면서 빈 슬롯의 종류도 바뀌는 경로는 최종 결과로 한 번 갱신한다. 거부·취소된 작업은 기존 실패·취소 처리로 끝낸다. |
| `frontend/mantine_ui.py` — `subscribeAppState`, `useAppState`, `useControlSnapshot`, `FastFigureApp` | 공통 상태를 관찰하던 세 함수를 없앤다. 각 요소의 갱신 함수는 그 요소가 표시할 값만 기존 공개 API에서 읽어 표시한다. 최초 표시 때도 같은 함수를 쓴다. 편집 확정 시 `UiCommand`는 계속 기존 API에서 현재 대상과 입력값을 읽는다. |
| `system.py` — `initializeFastFigure` | 기존 UI mount에서 구성한 요소별 갱신 함수를 Application에 연결한다. Application이 호출하는 함수의 인자와 연결 시점, UI 해제 시 정리 절차를 명시한다. 기존 공개 API는 그대로 사용한다. |
| `application/public_api/assets.py` — `selectProjectCsv` | 경로와 종류를 확인하고 CSV 선택과 그래프 객체 선택 해제를 적용한다. 이미 읽은 공식 CSV 메타데이터를 반환할 수 있도록 조회와 전이의 순서를 명시한다. 선택 수락을 확인하는 두 번째 검사나 같은 메타데이터 재조회는 넣지 않는다. |
| `application/public_api/layout_annotations.py` — `setLayoutApiZoom`, `resetLayoutApiZoom`, `commitLayoutApiZoom`; `frontend/renderer.py` — `applyUiPalette`, `applySlotStyle` | 대시보드의 확대·축소·100% 초기화 버튼에서 호출한 API는 이미 렌더링된 화면의 CSS 배율만 바꾼다. 새 렌더링을 실행하지 않는다. 배율 입력 표시를 같은 처리에서 갱신한다. 배율 확정의 `notify`와 팔레트·슬롯 스타일의 `notify` 인자 및 호출은 실제 호출자와 함께 정리한다. |
| `backend/project_efsm.py` — `buildProjectMutationResult` | 갱신 대상을 정할 때 기존 `changed`와 참조 보정 결과를 먼저 사용한다. 임시로 추가한 `assetReferenceChanges`는 기존 결과로 트리의 참조 수 변경을 판별할 수 있는지 대조하고, 가능하면 제거한다. 부족하면 실제로 판별할 수 없는 명령과 값만 확인해 결과 계약을 최소한으로 보완한다. |

## 2. 작업별로 연결할 요소

| 작업이 끝나는 곳 | 직접 갱신할 요소와 조회 |
|---|---|
| 슬롯·자산·그래프 객체 선택, 창 열기·닫기 | 최종 선택을 적용하고 도구 모음과 해당 편집기를 갱신한다. 새로 표시하는 편집기나 창은 자신이 쓰는 조회만 수행한다. 닫을 때는 그 창의 편집 상태를 정리한다. CSV 재선택으로 객체 선택이 해제되는 기존 동작을 유지한다. |
| CSV 헤더나 데이터 변경 반영 | 해당 CSV의 메타데이터, 그 CSV를 쓰는 객체의 열 선택, 해당 CSV의 열린 미리보기를 갱신한다. 미리보기에는 `assets.readPreview(csvId, 0, 30)`을 사용한다. 같은 표시에서 미리보기와 객체 편집의 열 조회 입력이 같으면 `graphs.readColumns` 결과를 한 번 읽어 나눠 쓴다. |
| 그래프 변경, 자산 변경 또는 슬롯 연결 변경 반영 | 변경된 그래프의 객체 목록·설정 중 영향을 받은 요소를 갱신한다. 자산의 생성·이동·삭제, 슬롯 연결, 참조 수 변경은 각각 영향을 받은 자산 목록·트리·슬롯 연결 표시를 갱신한다. 선 굵기와 같이 목록이나 참조를 바꾸지 않는 편집은 트리를 다시 읽지 않는다. |
| 레이아웃·레이블·캡션·프린트·색상 변경 반영 | 해당 입력이나 편집기만 갱신한다. 레이아웃 미리보기와 레이블 위치 기하는 그 표시가 필요한 때 읽는다. 색상 적용은 기존 CSS 적용과 Mantine 색상 설정 갱신을 같은 작업에 연결한다. 선택 슬롯 표시와 명시적 전체 렌더링의 기존 범위를 유지한다. |
| 프로젝트 교체, 가져오기·내보내기 시작·종료·실패 | 프로젝트 교체 후에는 이전 선택과 참조를 정리하고 현재 표시할 요소를 새 프로젝트에서 읽는다. 작업 시작·종료는 조작 가능 여부를, 실패는 오류 표시를 갱신한다. 상태 표시 때문에 CSV 행·자산 트리·그래프 설정을 다시 읽지 않는다. |

## 3. 선택 이유와 확인 기준

기존 작업 경로에서 갱신할 요소가 정해지므로 그 함수를 직접 호출한다. 공통 변경 레코드를 배포한 뒤 요소별로 판정하는 방식은 같은 판단을 여러 곳으로 나누고 조회를 실행할 조건을 추적하기 어렵게 만든다. 전체 React 화면을 한 번에 갱신하는 방식은 관련 없는 조회를 다시 실행하므로 채택하지 않는다.

Source Script 예시 양식에 따라 각 함수의 인수·반환값과 값의 출처를 밝히고, 조회·판정·대입·호출 순서를 `처리`에 쓴다. 기존 Plan045 검토에서 지적한 반환값 연결과 조회 계약도 유지·대조한다. 위 표의 각 작업을 실제 시작점에서 최종 UI 함수까지 따라가며 적용 순서, 중복 호출, 취소·실패, 공유 CSV와 프로젝트 교체를 확인한다. 실제 Git 패치와 채택·기각 이유를 기록하고 논리적 완결성·목적·중복을 검토해 Source Script 닫힘 여부를 판정한다.
