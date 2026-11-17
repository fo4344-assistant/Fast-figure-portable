# pseudocode → source code 번역 대조 검토

## 1. 기준과 방법

- 작성일: 2026-11-16. 사용자 요청에 따라 review를 작성한 뒤 수정 계획을 작성한다. 이번 작업은 조사와 문서 작성이다.
- 기준 commit: `9991697cf25c29ceb051c91779dc506331d6a7ba`.
- 의미 기준: Source Script 52, `sha256:2740bd377c0f52c2ee99b32cb72eef0501e2c644656a788fe3c8aa581b095604`.
- 직접 번역 기준: pseudocode 27, `sha256:5e40212959fccdb995ced547c8947a9ec0584c53eca8e11ac61d7ffed38a6558`.
- 검토 대상: source code 157, `sha256:0b20697db1a985c659dd08d14b27ca2cdf66ee23cf6f1a12b19d18f5d363fa22`.
- 문서의 모든 경로는 `Fast-figure-portable/` 기준이다. Source Script → pseudocode → source code의 순서로 의미를 대조했다. 수정 대상은 source code다.
- 15개 논리 모듈의 Source Script·pseudocode는 앞선 전체 검토와 Plan032의 전체 변경 diff를 읽었으며, 이번에는 현재 source code의 해당 15개 모듈을 끝까지 읽었다. 출력이 잘린 Backend state·assets·EFSM·renderer 부분은 구간을 다시 읽었다. 물리적 빌드 구현 `scripts/build-portable.py` 344행과 `sourcecode/portable_build/portable_build.mjs`도 전체 확인했다.
- 실행, 테스트, 빌드, 브라우저, TLC, checker 본체는 수행하지 않았다. 아래 사례는 같은 입력에 대한 정적 분기·반환·소유 관계 대조다. 과거 현장 시험을 이번 실행 결과로 계산하지 않았다.
- 계층 메타데이터가 `stale`이라는 사실만으로 결함을 판정하지 않았다. 파일 이름, helper 추출, 클래스와 record의 표현 차이는 실제 입력·결과 차이가 있을 때 판정했다.

P1은 핵심 조작 실패·작업 대상 오류·영속 자료 보존 위험, P2는 반환 계약·정규화·설정 전파·경계 동작 차이다. C01과 C02는 같은 UI 경로에 연결되지만 읽기 계약과 명령 입력 시점을 각각 확인한다.

## 2. 확인한 불일치

### C01 — P1: Application/UI의 상태 읽기에 선택 슬롯이 전달되지 않는다

- 기준: `pseudocode/application/adapter.pcal:18-30`, `pseudocode/frontend/interface_fsm.pcal:26-33`, `pseudocode/frontend/mantine_ui.pcal:108-121`.
- 구현: `sourcecode/application/adapter.js:187`, `sourcecode/frontend/mantine_ui.js:167-172`. `appFSM.state`가 내부 `interfaceFSM.state`를 반환하고 hook은 그 객체를 구독 결과로 사용한다. `selectedSlotId`는 `interfaceFSM.readState()`가 합성하는 필드다.
- 대조: 슬롯 0이 선택되어도 UI의 `state.selectedSlotId`는 `undefined`다. 기준은 revision 숫자로 변경 여부를 구독하고 이번 render에서 공식 상태를 다시 읽는다.
- 영향/수정: 선택 슬롯을 쓰는 조작에 잘못된 인자가 전달된다. Application의 공식 읽기와 revision 구독, fresh render 읽기를 함께 연결한다.

### C02 — P1: 그래프 조작이 render 당시 참조를 명령 입력으로 사용한다

- 기준: `pseudocode/frontend/mantine_ui.pcal:124-179`의 add/import/editable/layout 처리.
- 구현: `sourcecode/frontend/mantine_ui.js:1454-1458,1555-1557,1846-1860`. 슬롯·chart·CSV를 `state`, `editor`, `activeCsv`의 render 값에서 가져온다.
- 대조: render 이후 공식 선택이나 CSV가 바뀐 경우 기준은 이벤트 시점의 공식 상태와 `graphs.readData()`를 읽는다. 구현은 기존 참조를 전달한다. 파일은 받은 시점의 선택 id를 한 번 정한 뒤 비동기 처리 동안 유지해야 한다.
- 영향/수정: C01을 고쳐도 오래된 대상·CSV 문제는 남는다. 네 입력 처리와 실제 버튼·파일 입력·설정 소비자를 함께 연결하고, 선택 없음·취소·busy·editable 조건과 id 0을 보존한다.

### C03 — P2: reconcile/notify가 direction을 갱신하지 않는다

- 기준: `pseudocode/frontend/interface_fsm.pcal:183-208`은 publish 전에 `direction := "model-to-fsm"`을 설정한다.
- 구현: `sourcecode/frontend/interface_fsm.js:117-125`는 선택과 workspace를 반영하거나 즉시 publish한다.
- 대조: 직전 direction이 `ui-to-fsm`이면 기준 결과는 `model-to-fsm`, 구현 결과는 기존 값이다. 두 경로의 필드 변경과 publish 순서를 맞춘다.

### C04 — P2: graphs.selectCsv가 공통 CSV 선택 절차를 우회한다

- 기준: `pseudocode/application/public_api/contract.pcal:65,220-222`, `pseudocode/application/public_api/assets.pcal:32-55`.
- 구현: `sourcecode/application/public_api/graphs.js:8-10`은 SELECT_ASSET의 FSM 결과를 그대로 반환한다. assets 쪽은 `selectProjectCsv`를 사용한다.
- 대조: 같은 CSV 경로에 대해 기준은 검증된 CSV 또는 null, 구현 alias는 FSM 상태를 반환한다. alias를 기존 공통 helper에 연결하여 검증·반환을 함께 맞춘다.

### C05 — P2: CSV 선택 후 공식 자산 재조회가 없다

- 기준: `pseudocode/application/public_api/assets.pcal:32-55`는 수락된 전이 뒤 삭제 대상 조회를 다시 수행한다.
- 구현: `sourcecode/application/public_api/assets.js:98-104`는 전이 전에 읽은 `resolved.target`을 반환한다.
- 대조: publish listener가 자산을 제거·교체하면 기준은 전이 후의 CSV 또는 null을 반환하지만 구현은 이전 객체를 반환한다. revision 수락 판정 뒤 현재 경로·종류를 다시 읽는다.

### C06 — P2: 없는 슬롯에 대한 graphEditorAdd가 명령을 발행한다

- 기준: `pseudocode/application/public_api/graphs.pcal:10-24`의 조회 실패는 즉시 NoValue 반환이다.
- 구현: `sourcecode/application/public_api/graphs.js:42-48`는 null 슬롯도 `slot?.chart == null`로 분기하여 SLOT_DATA_CONNECTED를 보낸다.
- 대조: 같은 없는 id에 대해 기준은 무명령/null, 구현은 Backend 명령과 그 거부·예외 경로다. 조회 실패를 명령 전에 반환한다.

### C07 — P2: 일반 ProjectObject 초기화의 설정 정규화가 빠졌다

- 기준: `pseudocode/backend/project_state.pcal:440-489`, `sourcescript/backend/project_state.py:672-701`.
- 구현: `sourcecode/backend/project_state.js:47-65`는 슬롯 정규화 뒤 전체 검증을 수행한다. 누락 설정·palette 정규화 단계가 없다.
- 대조: 누락된 export 하위 설정이나 잘못된 palette 값은 기준에서 설정 원천으로 보완한 뒤 검증한다. 구현의 일반 initialize는 그대로 검증하여 거부한다.
- 영향/수정: 일반 생성·교체 경로에 missing-only 설정 보완과 palette 처리를 연결한다. 가져오기 전용 constructor에 있는 보완만으로 일반 진입점을 대체할 수 없다. False·0·빈 문자열·본문, 유효 색의 대소문자와 단일 교체를 보존한다.

### C08 — P1: ProjectObject 생성자가 호출자 입력을 영속 상태로 공유한다

- 기준: `sourcescript/backend/project_state.py:481-566`의 생성 처리는 입력의 분리 복사·정규화·검증 후 소유한다. 일반 반영의 분리 계산은 `pseudocode/backend/project_state.pcal:476-489`에도 명시되어 있다.
- 구현: `sourcecode/backend/project_state.js:47-50`는 입력의 슬롯을 직접 정규화하고 `this._state = state`로 같은 객체를 저장한다.
- 대조: 생성 뒤 호출자가 원래 `state.meta`나 중첩 content를 바꾸면 구현의 소유 상태도 명령 없이 바뀐다. 기준의 소유 상태는 영향을 받지 않는다.
- 수정: 생성자 진입점의 분리 복사와 실패 시 입력 보존을 처리한다. 기존 내부 current read와 명령별 후보의 책임은 유지한다.

### C09 — P1: 추가 content 필드가 슬롯 제거 안전 판정에서 누락된다

- 기준: `pseudocode/backend/project_state.pcal:264-274`는 기본 Slot의 전체 content와 caption을 비교한다.
- 구현: `sourcecode/backend/project_state.js:736-746`는 chart/imageId/contentType/caption/imageSettings만 비교한다.
- 대조: 표준 필드는 기본값이고 `content.extension = 1`인 슬롯은 기준에서 보존 대상, 구현에서 기본 슬롯으로 판정된다. 병합·축소 과정에서 추가 자료를 잃을 수 있다.
- 수정: 전체 content 비교와 두 소비자의 제거·병합 판정을 함께 대조한다. 기존 추가 필드 보존 규칙을 유지한다.

### C10 — P2: 명시적 imageSettings:null을 기본값으로 바꾼다

- 기준: `pseudocode/backend/project_state.pcal:214-251,368-372`는 존재하는 잘못된 값을 유지하여 전체 검증에서 거부한다. 누락 필드만 보완한다.
- 구현: `sourcecode/backend/project_state.js:775`는 null을 기본 imageSettings로 바꾼다.
- 대조: 같은 명시적 null 입력이 기준에서는 오류, 구현에서는 정상화된다. 필드 부재와 존재하는 null을 구분한다.

### C11 — P2: Backend 조회의 등록 집합이 다르다

- 기준: `pseudocode/backend/project_state.pcal:17-24,734-755`는 다섯 kind와 project-api의 네 export operation을 등록한다.
- 구현: `sourcecode/backend/project_state.js:260-267,318`은 삭제된 interface-intent를 허용하고 project-api 목록에는 project.exportFile/assets.download/graphs.exportFfsx/graphs.exportPlotlyJson이 없다.
- 대조: 같은 등록 조회 요청에 대해 수락 집합이 다르다. 기존 export kind 경로는 동작하므로 일반 UI 내보내기 전체 실패를 뜻하지 않는다.
- 수정: 등록·분기·공개 호출자의 실제 참조를 함께 맞춘다.

### C12 — P2: slots.readSelected의 반환에서 Slot 필드가 빠진다

- 기준: `sourcescript/backend/project_state.py:291`, `pseudocode/backend/project_state.pcal:755`는 선택 Slot의 id/row/col/rowSpan/colSpan/hidden/content/caption을 분리 복사한다.
- 구현: `sourcecode/backend/project_state.js:401-407`는 id/row/col 및 평탄화한 세 content 필드만 반환한다.
- 대조: 선택 Slot의 caption·span·중첩 content를 읽을 수 없다. 기준 반환을 복원하면서 현재 flat 필드를 사용하는 Application/public/UI 소비자를 같은 변경에서 옮긴다.

### C13 — P2: gridLimits의 조회·입력·계산 전파가 빠졌다

- 기준: `pseudocode/backend/project_state.pcal:788-789`, `pseudocode/backend/layout_annotations.pcal:268-277`, `pseudocode/frontend/mantine_ui.pcal:65-84`.
- 구현: `sourcecode/backend/project_state.js:326-356`의 layout 읽기에 gridLimits가 없다. `sourcecode/backend/layout_annotations.js:101-103`, `sourcecode/frontend/mantine_ui.js:2761,2806-2817`은 1..8을 직접 사용한다.
- 대조: 현재 설정 1..8에서는 결과가 같지만, 설정 범위가 달라지면 기준은 같은 공식 조회의 범위를 사용하고 구현은 기존 숫자를 유지한다.
- 수정: Backend 설정 → 공식 layout 읽기 → 공개 읽기 → UI clamp/컨트롤 → Backend 크기 변경까지 연결한다. 현재 다른 차원·잘못된 입력 fallback도 유지한다.

### C14 — P2: 슬롯 reset의 실제 참조 제거 개수가 0으로 반환된다

- 기준: `pseudocode/backend/project_efsm.pcal:682-720`은 반영 전후 실제 참조의 중복 개수를 비교한다.
- 구현: `sourcecode/backend/project_efsm.js:106-119`는 payload/changed에 개수가 없으면 0을 사용한다. reset 경로는 실제 참조 개수를 채우지 않는다.
- 대조: CSV object 하나를 소유한 chart의 슬롯 reset은 기준 removedGraphReferenceCount=1, 구현은 0이다. 이미지 reset도 같은 누락이 있다.
- 수정: 성공 결과의 실제 전후 참조에서 계산한다. 같은 CSV를 중복 사용한 object 개수, 단순 순서 이동, 기존 선택 hint와 index map을 함께 보존한다.

### C15 — P1: graph 슬롯에 raw 이미지를 가져오는 변환을 거부한다

- 기준: `pseudocode/backend/assets_files.pcal:280-287`는 소유 chart를 제거하고 같은 슬롯을 image 타입으로 바꾼다.
- 구현: `sourcecode/backend/assets_files.js:85-88`은 이미 image 타입인 대상만 허용한다.
- 대조: 유효 이미지와 visible graph 슬롯에 대해 기준은 이미지 연결 성공, 구현은 후보 거부다. ASSETS_IMPORTED의 의미를 반영하고 geometry·caption을 보존한다. 별도 SLOT_IMAGE_IMPORTED의 image-only 조건과 구분한다.

### C16 — P2: raw CSV 교체가 기존 headerLines를 1로 덮어쓴다

- 기준: `pseudocode/backend/assets_files.pcal:259-264`는 교체 시 생략된 headerLines를 현재 CSV에서 유지하고 새 row 수로 제한한다.
- 구현: `sourcecode/backend/assets_files.js:460-463`은 새 자료와 교체 모두 `headerLineCount(1, model.rows)`를 사용한다.
- 대조: 기존 headerLines=0인 CSV를 두 행 파일로 교체하면 기준 0, 구현 1이다. 원본 bytes/MIME/path/id 보존과 함께 create/replace의 입력 차이를 처리한다.

### C17 — P2: 빈 CSV/TSV를 공통 dataTable 검증으로 거부한다

- 기준: `pseudocode/backend/assets_files.pcal:402-417`는 CSV/TSV의 ParseDelimitedText 결과를 직접 반환한다.
- 구현: `sourcecode/backend/assets_files.js:865-874`은 그 결과를 `dataTable`에 전달한다. `sourcecode/backend/graphs.js`의 dataTable은 빈 배열을 거부한다.
- 대조: 빈 .csv/.tsv bytes는 기준 rows=[], 구현 예외다. JSON 빈 배열은 양쪽 모두 거부하므로 확장자별 경로를 보존한다.

### C18 — P2: FFPX reader 반환 전에 headerLines를 정규화하지 않는다

- 기준: `pseudocode/backend/assets_files.pcal:922-946`은 각 CSV rows를 복원한 뒤 headerLines를 제한한다.
- 구현: `sourcecode/backend/assets_files.js:1408-1422`는 rows/bytes만 복원한다.
- 대조: 두 행과 저장 headerLines=99는 기준 reader 결과 2, 구현 reader 결과 99다. 뒤의 buildProjectObject가 보완하므로 프로젝트 불러오기 전체 실패로 확대하지 않는다. 독립 reader 반환 경계를 맞춘다.

### C19 — P2: 캡션 첫 단어가 길면 이름만 있는 행을 추가한다

- 기준: `pseudocode/frontend/renderer.pcal:339-390`은 초과 폭이면서 본문 line이 비어 있지 않을 때만 줄을 넘긴다.
- 구현: `sourcecode/frontend/renderer.js:1123-1125`는 이름 prefix가 있으면 빈 본문도 줄을 넘긴다.
- 대조: available=100, prefix 폭=20, 단어 폭=90이면 기준은 한 행에 유지하여 잘라 그린다. 구현은 prefix-only 행과 단어 행 두 개를 만든다. lineHeight와 자동 내보내기 높이도 달라진다.
- 수정: 공통 caption layout의 조건을 맞추고 현재 캡처·목표 저장 두 호출자가 같은 결과를 사용하게 한다. font 준비·측정·빈 문단·정리 규칙은 보존한다.

## 3. 대응을 확인한 항목과 보류한 후보

- Backend graph의 실제 object 편집 경로는 이미 `validateChartModel → rebuildEditableGraph → 전체 검증 → 단일 반영`을 수행한다. 앞선 pseudocode 검토 R18을 source code 결함으로 옮기지 않았다.
- manual 이미지 좌표 0, debug 소유 값의 역전, 외부 grid 변경 후 layout 선택 비우기, caption literal 표시, 충돌 취소 정리, 단일 dashboard 파일 수신, 공통 폭과 resize, theme 계산은 현재 구현과 기준을 대조했다.
- `readProjectAssetDisplay`의 내부 `assetNodes` 이름은 모든 소비자에서 일관되게 nodes 의미로 연결된다. 외부 계약 차이가 확인되지 않아 별도 수정 항목으로 세지 않았다.
- 파일 복사 후 ASSETS_IMPORTED 후보 계산은 현재 동기 처리다. no-candidate 반환이 identity 확인보다 앞선다는 문장 순서만으로 관측 가능한 비동기 오류를 확정하지 않았다. 향후 대기·callback을 넣을 때에는 기준의 재확인 순서를 유지해야 한다.
- public 인자 순서와 private helper 순서의 변환, 실제 함수 참조, Slot의 flat accessor, 후보 helper의 물리적 분할은 동작이 유지되면 허용한다. 34개 command를 Source Script와 같은 함수 배치로 다시 나누는 작업은 요구하지 않는다.
- system 초기화/렌더링 mount의 물리적 배치 및 번들링은 기존 책임으로 대조했다. portable build의 외부 script 검사·settings/README 삽입·산출 순서는 현재 범위에서 추가 불일치를 확정하지 않았다. HTML의 vendor CSS 전체는 알고리즘 검토 대상으로 계산하지 않았다.

## 4. 결론과 다음 작업

19개 대조 항목을 기록했다(P1 5개, P2 14개). 대응하는 수정 계획은 `agent_space/plans/plan-033.md`에 작성한다. Source Script 52와 pseudocode 27을 고정하고 source code의 실제 호출자·소비자를 함께 수정하는 범위다. 이번 review로 구현·계층 버전·검증 상태는 바꾸지 않는다. 실행 정확성 및 전체 Source Script 닫힘은 이 정적 검토의 판정 범위에 포함하지 않는다.
