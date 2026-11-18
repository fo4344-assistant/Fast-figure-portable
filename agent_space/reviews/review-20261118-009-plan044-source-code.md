# Plan044 source code 번역 검토

## 기준

- Source Script 56과 pseudocode 33, 실제 변경 범위는 `20261118-005.patch`에서 확인했다.
- 시작 상태: `396a33271ae7bbcc7a06a1b524ecab0d0de6c58b`. source code 161에서 162로 갱신했다.
- 앞선 문서와 Source Script·pseudocode·Backend 설정·dist는 유지했다.

## 대응과 수정

| pseudocode의 계약 | source code 반영 |
| --- | --- |
| Backend 범위 결정 뒤 내용 계산 | `backend/project_state.js`의 renderer 조회를 `workspace-structure`, `selected-slot`, `whole-workspace`로 분리. 구조 조회는 배치·소유 ID만, 선택 조회는 해당 슬롯 한 개의 figure/CSV/이미지만 계산한다. 0과 선택 없음은 구별한다. |
| Application의 현재 선택·한 번의 처리 | `application/adapter.js`가 현재 선택을 읽고 명령→참조 보정→구조 또는 선택 조회→표시를 담당한다. 조건부 종류 변경의 결과를 재사용하고 선택 해제는 내용 표시를 생략한다. |
| 기존 wrapper 반환·알림 유지 | `application/public_api/assets.js`, `graphs.js`, `layout_annotations.js`에서 중앙 처리 뒤의 중복 렌더링·resize·전역 캡션 표시를 제거했다. 기존 명령·결과·공식 읽기·알림은 유지한다. |
| 명시적 전체 표시 | `application/public_api/index.js`의 `workspace.render`만 전체 조회를 요청한다. `frontend/mantine_ui.js`에 기존 공통 Button으로 프린트 바로 왼쪽의 렌더 버튼을 연결했다. 전체 완료 Promise를 UiCommand에 반환한다. |
| 선택 내용만 자동 갱신 | `frontend/renderer.js`는 `targetSlot`만 표시하고 해당 슬롯의 라벨·캡션·선택 장식을 갱신한다. 다른 슬롯 내용과 전역 캡션은 전체 버튼에서 갱신한다. |
| 이동·크기 변경은 기존 내용 재사용 | 같은 틀에서 소유한 최초 표시 치수와 현재 content 치수로 CSS translate/scale을 적용한다. Shell·ResizeObserver·zoom은 구조 조회와 CSS 경로만 호출한다. Plotly resize 호출은 제거했다. |
| 비호환 배치 | 기존 내용이 있는 틀의 grid/span/배치가 호환되지 않으면 유효 내용을 유지하고 전체 렌더링 필요를 알린다. 자동 전체 전환은 없다. |
| 자원·비동기 수명 | 슬롯별 작업 순번·pending, 작업영역 수명, 현재 host/chart/image 연결을 검사한다. 같은 슬롯의 Plotly/이미지 작업은 순서를 지키고 다른 슬롯은 취소하지 않는다. 프로젝트 교체는 기존 자원을 정리한다. |
| 초기화·내보내기 | 기존 system의 Application startup을 통해 빈 틀과 controller만 준비한다. 출력용 전체 조회와 독립 raster/Plotly 출력 host는 유지했다. system 파일을 추가로 수정할 필요는 없다. |

## 논리·목적·비중복

- 선택 범위를 Backend의 비싼 계산 전에 결정하며, 다른 슬롯의 figure를 만든 뒤 버리는 경로를 사용하지 않는다.
- 단순 크기 변경 경로에는 Plotly react/newPlot/resize와 이미지 decode가 없다. 본문 갱신은 선택 경로 또는 명시적 전체 경로에 한정한다.
- Renderer의 치수·pending·DOM 참조는 자신의 표시 자원 수명에 사용한다. Project 상태·선택·변경 대상을 저장하는 새 조회 주체는 추가하지 않았다.
- 공통 UI CSS는 기존 palette 부분 조회로 유지한다. Plotly가 제공하는 변환 역행렬 입력 처리를 재사용하며 이벤트 좌표를 덮어쓰지 않는다.
- 기존 공통 틀, 단일 Frontend 선택, EFSM 명령·참조 보정, 출력 계산을 재사용했다.

## 확인과 한계

- 8개 변경 JS의 `node --check`, 호출·범위 검색, 전체 실제 변경문과 마지막 추가 변경문을 정적으로 확인했다.
- native patch 역적용 확인·공백·실제 세 계층 fingerprint·메타데이터 변경 범위·보호 경로·index·HEAD를 확인했다.
- 테스트·브라우저·앱·빌드·checker main·TLC는 실행하지 않았다. CSS 변환 후 pointer/drag 및 실제 표시·비동기 경합·성능은 런타임 검증이 남아 있다.
- 상태는 `stale`로 유지한다. 계층 전체 완료나 런타임 정상 판정을 뜻하지 않는다.
