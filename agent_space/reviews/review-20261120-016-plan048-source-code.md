# Plan048 — Source Code 대조 및 실행 점검

기준: 닫힌 Source Script r60 (`e7fc708`), pseudocode r35 (`912dff9`). 구현: Source Code r164. 정책 §7.1–7.2에 따라 기존 JavaScript/React 런타임에 지정된 호출과 결과를 연결했다. 새 프로젝트 명령, 폴링, UI 변경 감지 카운터를 추가하지 않았다.

| 대조 범위 | JavaScript 구현 |
| --- | --- |
| `pseudocode/backend/project_efsm.pcal`, `backend/assets_files.pcal` | `sourcecode/backend/project_efsm.js`가 반영 전후의 변경 id·선택 순번과 실제 생성/교체/삭제/이동 결과를 만들고 UI 분기에 필요한 참조 사실을 반환한다. 이동 경로는 실제 경로 변경 루프에서 기록하고 `sourcecode/backend/assets_files.js`는 입력 순서의 가져오기 결과와 교체 여부를 전달한다. 대상 슬롯 링크의 반복 참조는 유지하고 변환 표시 전용 차트는 제외한다. |
| `pseudocode/application/adapter.pcal`, `application/public_api/` | `sourcecode/application/adapter.js`가 반영된 명령, graph operation, 실제 변경 항목으로 트리·옵션·연결 행을 구분해 호출한다. 공개 자산 API는 명령 결과의 실제 경로를 읽고, 레이아웃/팔레트 API는 표시 대상을 직접 갱신한다. |
| `pseudocode/frontend/interface_fsm.pcal`, `frontend/mantine_ui.pcal` | `sourcecode/frontend/interface_fsm.js`가 선택·수명 상태의 권위를 유지한다. `sourcecode/frontend/mantine_ui.js`는 전역 구독 대신 대상 표시값을 받는다. 슬롯 편집기 초기화는 identity 변경과 강제 초기화로 제한하며, 그래프의 데이터/레이아웃·CSV/이미지 입력은 영향받은 표시 대상에서 읽는다. 휴지통 상태도 트리 갱신 또는 선택에서 읽는다. |
| `pseudocode/system.pcal`, `frontend/renderer.pcal` | `sourcecode/system.js`가 마운트된 UI 표시 수신자를 연결하고 해제한다. `sourcecode/frontend/renderer.js`가 상태/디버그 표시를 직접 전달하고 같은 격자 표면에서 transform을 적용한다. 셸이 너비 변경 처리를 소유한다. |

## 검증

- 변경한 JavaScript 9개 `node --check`, `git diff --check`, 휴대용 inline HTML 및 split ZIP 빌드.
- Source Script ↔ pseudocode 정적 검사: 219 entries, 96 APIs, 65 explicit bindings, 15 modules. 이 검사는 JavaScript 실행의 증거가 아니다.
- ego-browser에서 로컬 inline HTML 실행: 레이아웃 overlay 및 행 2→3 변경, Escape 닫기(초기 빌드). 최종 빌드에서 CSV 가져오기, 슬롯 0 연결, 같은 CSV를 쓰는 그래프 객체 3개의 순서 이동, 슬롯 swap, 연결된 CSV 경로 이동, 같은 id로 CSV 교체 및 미리보기 갱신, 삭제 cascade를 확인했다. 이동 경로와 삭제 후 빈 연결 행, 슬롯 0 가져오기 결과는 브라우저 DOM에서도 확인했다.
- 전체 UI 조합·내보내기·검증 모델/TLC는 재실행하지 않았다. 이 기록은 그 범위의 통과를 주장하지 않는다.
