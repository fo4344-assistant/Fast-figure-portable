# Plan044 Source Script → pseudocode 번역 검토

## 기준과 범위

- Source Script 56을 기준으로 pseudocode 33을 작성했다.
- 시작 commit: `e37e1fe5c6ca9aee4d2484872c16896c5da9a731`. Source Script·source code·dist와 이전 문서는 유지했다.
- Source Script 변경에 대응하는 pseudocode 7개와 직접 호출 경로를 확인했다. 기존 전체 조회는 독립 export 경로에서 유지한다.

## 대응

| 경로 | 번역 내용 |
|---|---|
| `pseudocode/backend/project_state.pcal` | 범위·선택 id를 먼저 결정한다. `workspace-structure`는 배치·연결 식별값만 반환한다. `selected-slot`은 유효한 현재 슬롯 하나의 figure/CSV/image만 계산하고, `whole-workspace`는 명시적 요청의 전체 내용을 계산한다. slot-image/ui-palette 및 export 계약은 유지한다. |
| `pseudocode/application/adapter.pcal` | 현재 Frontend 선택과 현재 layout으로 조회 입력을 만든다. 선택 해제는 내용 조회를 생략하고 조건부 명령의 결과를 재사용한다. 한 번의 명령·참조 보정 뒤 구조/CSS 또는 선택 슬롯 갱신을 수행한다. 전체 내용 갱신은 `renderWholeWorkspace`의 명시적 진입으로 제한한다. |
| `pseudocode/frontend/renderer.pcal` | 선택 target 하나와 명시적 contentSlots 순회를 분리한다. 슬롯별 작업 순서와 workspace 수명으로 완료를 검증한다. 다른 슬롯 갱신이나 CSS 변환으로 기존 작업을 무효화하지 않는다. |
| `pseudocode/frontend/renderer.pcal` | 현재 surface의 기준 치수에 대한 scaleX/scaleY, 좌상단 translate/scale과 포인터 역변환을 기술한다. 단순 크기·위치 변경은 현재 픽셀을 재사용한다. 비호환 grid/span은 유지 가능한 내용을 보존하고 전체 렌더링 필요를 안내한다. |
| `pseudocode/application/public_api/contract.pcal` | `workspace.render`를 기존 public 함수 binding에 연결한다. 새 API registry나 Project 상태는 추가하지 않는다. |
| `pseudocode/application/public_api/layout_annotations.pcal` | zoom/reset은 구조 조회와 CSS 변환을 호출한다. 전역 caption 표시와 중복 palette 내용 갱신은 명시적 전체/기존 Application 처리로 정리한다. 공식 조회·반환·실패 의미는 유지한다. |
| `pseudocode/frontend/mantine_ui.pcal` | 렌더링 버튼을 Print 바로 왼쪽에 같은 Button 기준으로 배치하고 기존 UiCommand로 연결한다. Sidebar/창 크기 변화는 transform 경로에 연결한다. |
| `pseudocode/system.pcal` | 초기 입력을 구조 전용으로 바꾼다. controller와 빈 틀 준비 후 ready·mount 순서를 유지한다. |

## 논리·목적·중복 검토

- 선택 없음, 슬롯 0, 유효하지 않은 선택, 조건부 명령 재사용, non-commit과 원래 실패 전달을 분기에서 확인했다.
- 전체 내용 계산 후 선택 슬롯만 추리는 경로와 자동 전체 fallback을 제거했다. 구조 변경·프로젝트 교체는 유효하지 않은 소유 연결만 정리한다.
- graph/image 완료는 해당 host·슬롯·소유 객체·작업 순서·workspace 수명을 확인한다. 독립 export host·bytes/URL 해제 의미는 유지한다.
- 공통 frame과 기존 figure 계산을 재사용했다. `BuildSlotContentRead`는 기존 동일 source 계산을 분리한 private 확장이다. Application과 Renderer의 같은 이름은 `Renderer_renderWholeWorkspace`로 구분했다.
- 단순 크기 변경에서 figure 계산·Plotly render/resize·이미지 재해석을 호출하지 않는다. 실제 그래프 내용과 표시 변환의 소유를 분리했다.

## 확인과 한계

- 전체 실제 구현 diff, 절차 경계, 호출 범위, 실제 fingerprint, 메타데이터 변경 범위와 native patch를 정적으로 확인했다.
- Source Script는 유지했고 source code는 아직 이 변경을 번역하지 않았다.
- PlusCal 변환·TLC·테스트·앱·브라우저·빌드·checker main은 실행하지 않았다. 실행 결과나 전체 계층 closure를 주장하지 않는다.
