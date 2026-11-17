# Plan036 source code 번역 검토

## 기준

- 계획: `../plans/plan-036.md`.
- Source Script 53: `sha256:0bab921cdb83cfeb9fdc411a966a9600bcf5cf23bd6d6f03bc4ba5fde2b87252`.
- pseudocode 28: `sha256:9a21f200b224af97d67278b47e172d921ca3a2a15d90c30a074277f4290109b8`.
- source code 159: `sha256:b2b283e1d77be57131b9384a9cc9122359f2bfb3c293892707460d1d0bfed6ef`.
- 직전 tracked 작업 상태: `a552d77fe6d357047762e8e4c70c003ccad0bdc4`. 기존 Source Script·pseudocode 변경과 앞선 기록은 보존했다.

## 대응

| 요구 | 실제 구현 및 정적 확인 |
| --- | --- |
| 현재 너비 전달 | `sourcecode/application/adapter.js`의 `dispatchProjectQuery`가 현재 Frontend 상태와 공식 layout을 읽고 실제 renderer 요청 너비를 구성한다. startup·선택·명령·개별 표시 갱신의 whole-renderer 조회를 이 경로에 연결했다. Backend `readBackendProjection`은 유한 양수 너비와 기존 `dashboardGeometryInProject`를 사용한다. preview의 기존 너비 제한과 export 조회는 유지한다. |
| 공통 조작 규격 | `sourcecode/frontend/mantine_ui.js`의 theme에 Button·ActionIcon·Input·Select·NumberInput·ColorInput과 행 정렬/줄바꿈을 모았다. 개별 xs/sm 조작 크기와 object 색상 입력의 고정 폭을 제거했다. 설명 Text 크기와 resize handle은 유지했다. |
| 접기 | UI-local `FoldSection`에 키보드 버튼·expanded/content 연결·닫기 시 내부 포커스 복원을 구현했다. 전역·오브젝트는 열림, X/Y·네 방향 축·종류별 설정·UI 색상·디버그는 닫힘으로 시작한다. 내용은 유지하여 일반 재렌더의 입력/개폐 상태를 보존한다. |
| 공통 프레임 | `sourcecode/frontend/renderer.js`의 `renderDashboardFrame(host, layout, visibleSlots, geometry)`를 actual render·style·zoom과 UI `LayoutPreview`가 함께 호출한다. grid 반경 0, 슬롯 반경·span·간격·여백·border-box가 한 구현에 있다. preview 선택/포커스 표시는 장식 영역에 있고 좁은 외부 영역은 가로 스크롤한다. |
| 빈 행·열 입력 | UI-local 편집값으로 빈 문자열을 유지한다. 빈 입력은 command를 보내지 않고 blur에서 공식 layout을 다시 읽어 편집값을 정리한다. NumberInput의 blur 자동 clamp를 끄고 기존 유효 숫자 command 경로에서 범위를 처리한다. blur 자체는 selection을 지우지 않는다. |
| 이동 선택 | `sourcecode/backend/project_efsm.js`는 move의 selectedIndexHint를 제거하고 실제 commit 전후 chart와 검증된 from/to에서 전체 순번 대응을 만든다. 기존 `buildFrontendReconciliationInput`이 해당 chart의 이전 선택에 한 번 적용한다. 다른 command의 hint와 삭제 대응은 유지한다. |
| 제목 표시 | 같은 `graphs.readData` 결과의 소유 chart 제목과 기존 legendName 또는 x · y 식별을 함께 표시한다. 빈 제목은 기존 식별을 사용한다. 제목 줄바꿈과 별도 식별 부분, 전체 접근성 이름을 제공하고 index·object·trace·저장 필드는 유지한다. |

## 논리·목적·중복 점검

- 실제 render는 기존 graph/image 자원을 먼저 정리한 다음 공통 틀을 갱신한다. graph record의 frame/plot 관계와 generation·현재 연결 검사, 비동기 완료 정리는 유지했다. 내용 wrapper와 장식 wrapper의 선택자도 함께 갱신했다.
- 공통 프레임은 전달된 기하와 host 내부 DOM만 사용한다. preview listener/틀 정리는 해당 preview에 한정되고 Plotly·decode·actual generation을 호출하지 않는다.
- domain 기하 계산은 Backend, 실제 너비 구성은 Application, 이동 순번 대응은 commit 결과, 접기·편집·preview 선택은 UI-local 책임으로 연결했다. 초기 system 경로는 기존 startup의 중앙 조회로 연결되어 별도 변경이 필요하지 않았다.
- target/current export의 래스터·캡션·자원 처리 절차와 프로젝트 저장 형식은 변경하지 않았다.

## 확인 범위

- 변경된 다섯 JS 파일의 `node --check`, 실제 전체 diff/호출 관계/선택자 검토, native patch reverse check·공백·hash·메타데이터·보호 경로 확인을 수행했다.
- 테스트·앱·브라우저·빌드·PlusCal 변환·TLC·checker main은 실행하지 않았다. 실제 UI 배치·포커스·입력 및 자원 동작의 실행 확인은 남아 있다.
- 기존 문서와 Source Script·pseudocode·verification·dist·정책을 보존했다. 각 계층의 stale 상태와 Source Script의 open 상태를 유지했다.
