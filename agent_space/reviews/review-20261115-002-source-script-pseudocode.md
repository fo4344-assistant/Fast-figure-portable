# Source Script → pseudocode 번역 불일치 검토

## 1. 대상과 판정

- 기준 commit: `959f154dfbec5441945593b5a36740e9347de316`.
- 기준 계층: Source Script 52 → pseudocode 26. source code 157은 비교 대상으로 사용하지 않았다.
- Source Script 15개 Python 문서와 대응 pseudocode 15개 `.pcal` 문서를 처음부터 끝까지 읽었다. 긴 파일은 구간을 나누어 확인했다.
- 결과: **불일치 20건**. P1 5건, P2 15건. 현재 pseudocode를 Source Script 52의 충실한 번역으로 판정할 수 없다.
- P1은 주요 입력 절차 누락, 상태·참조 손실 또는 반영 결과 차이를 우선 수정해야 하는 항목이다. P2는 반환 계약·조회 경계·설정 의존성·표시 계산 등의 차이다.
- 아래 사례는 명세의 분기와 결과를 대조한 정적 반례다. 프로그램·브라우저·테스트·TLC·version checker·빌드는 실행하지 않았다. 실제 제품에서 재현했다고 주장하지 않는다.
- 모든 파일 경로는 `Fast-figure-portable/` 기준이다. 구현·설정·계층 메타데이터·상태를 변경하지 않았다.

## 2. 확인한 불일치

### R01 · P1 · 선택 참조를 명령 입력으로 만드는 UI 절차 누락

- Source Script: `sourcescript/frontend/mantine_ui.py:238-368`의 `addSelectedGraphObject`, `importSelectedSlotFile`, `setSelectedGraphEditable`, `updateSelectedGraphLayout`.
- pseudocode: `pseudocode/frontend/mantine_ui.pcal:1-309`, 특히 `subscribeAppState:93-99`, `FastFigureApp:148` 이후. 대응 public graph 절차는 `pseudocode/application/public_api/graphs.pcal:10-124`.
- Source Script는 이벤트 시점의 공식 상태에서 선택 슬롯·현재 CSV·소유 chart를 읽고 명시적 인자를 구성한다. 슬롯 0을 유효하게 처리하고, 파일 취소·선택 부재를 분기하며, 파일을 받은 시점의 대상 id를 해당 비동기 작업에 고정한다.
- pseudocode에는 이 처리나 동일한 내용을 전개한 호출 경로가 없다. 일반 컴포넌트 조립과 public 함수의 명시적 인자 전달만으로는 인자를 얻는 절차가 채워지지 않는다.
- 대조 사례: 슬롯 0과 CSV 1을 선택한 후 객체 추가, 또는 파일 선택 직후 다른 슬롯 선택. Source Script는 어떤 id를 전달할지 정하지만 pseudocode의 UI 번역에는 그 결정 절차가 빠져 있다. 런타임 실패 확정이 아닌 필수 알고리즘의 번역 누락 판정이다.

### R02 · P2 · revision 구독과 render 시점 공식 읽기의 분리 누락

- Source Script: `sourcescript/frontend/mantine_ui.py:195-236`의 `getAppStateSnapshot`, `useAppState`.
- pseudocode: `pseudocode/frontend/mantine_ui.pcal:93-99,148-190`.
- Source Script는 `React.useSyncExternalStore`의 비교값으로 revision 숫자를 반환하고, 각 render에서 별도로 `appFSM.readState()`를 읽는다.
- pseudocode는 구독 primitive만 명시하며 비교값과 render 읽기 절차를 연결하지 않는다. React API의 이름 차이보다, 비교 대상과 상태 읽기 시점의 의미가 번역되지 않은 것이 문제다.
- 같은 revision에서 여러 번 render하는 경우의 비교값 안정성과 읽기 경로를 명시해 동등성을 확인해야 한다.

### R03 · P2 · 자산 표시 조회의 반환 필드명 차이

- Source Script: `sourcescript/frontend/mantine_ui.py:54-80`, 반환 필드 `nodes`, `slotRows`.
- pseudocode: `pseudocode/frontend/mantine_ui.pcal:35-43`, `result := [assetNodes |-> nodes, slotRows |-> layout.visibleSlots]`.
- 같은 조회의 결과를 `result.nodes`로 소비하는 Source Script 계약과 pseudocode의 `assetNodes`가 다르다. 별도 필드 변환 계약은 정의되어 있지 않다.
- 수정 대상은 반환 record와 소비자의 필드 연결이다.

### R04 · P2 · reconciliation·notify의 direction 갱신 누락

- Source Script: `sourcescript/frontend/interface_fsm.py:230,256-258`.
- pseudocode: `pseudocode/frontend/interface_fsm.pcal:183-206`.
- Source Script는 두 절차에서 `direction = model-to-fsm`을 설정한 뒤 publish한다. pseudocode의 reconciliation은 선택·workspace만 반영하고, notify는 publish만 한다.
- 초기 direction이 `ui-to-fsm`인 동일 상태에서 두 절차를 호출하면 공개 상태의 direction이 달라진다.

### R05 · P2 · `graphs.selectCsv`가 다른 경로와 값을 반환

- Source Script: `sourcescript/application/public_api/__init__.py:118`, `sourcescript/application/public_api/assets.py:90-122`.
- pseudocode: `pseudocode/application/public_api/contract.pcal:65,155-156`.
- Source Script의 graph namespace 별칭은 `assets.selectProjectCsv`를 호출해 CSV 대상 확인·전이 수락 확인·공식 후속 조회를 수행하고 CSV 또는 None을 반환한다.
- pseudocode는 곧바로 `SELECT_ASSET`을 보내고 Frontend 상태를 반환한다. 경로가 무효인 경우의 반환값과 정상 선택 후 반환 자료형부터 다르다.
- `assets.selectCsv`의 별도 wrapper 번역이 존재하더라도 graph 별칭의 우회 경로는 남는다.

### R06 · P2 · CSV 선택 후 공식 재조회 누락

- Source Script: `sourcescript/application/public_api/assets.py:110-121`, 특히 처리 5번.
- pseudocode: `pseudocode/application/public_api/assets.pcal:32-49`.
- Source Script는 전이 수락 후 같은 경로의 `assets.readDeletionTarget`을 다시 읽는다. pseudocode는 전이 전에 읽었던 `target`을 반환한다.
- 수락된 publish의 listener 실행 사이에 해당 자산이 바뀌거나 사라지면 Source Script는 현재 CSV 또는 None을 반환하고 pseudocode는 이전 대상을 반환할 수 있다.
- R05의 별칭을 수정해도 이 helper 내부의 누락은 별도로 남는다.

### R07 · P2 · 부재 슬롯에 graph 객체 추가 명령을 보냄

- Source Script: `sourcescript/application/public_api/graphs.py:12-44`.
- pseudocode: `pseudocode/application/public_api/graphs.pcal:10-21`.
- Source Script는 슬롯 조회가 None이면 명령 없이 None을 반환한다. pseudocode는 `HasOwningChart(slot)`의 결과로 event를 정한 뒤 명령을 보낸다.
- 존재하지 않는 슬롯 id에 대해 Source Script의 조기 반환과 pseudocode의 명령·거부/오류 경로가 달라진다. Backend 검증이 최종 쓰기를 막더라도 public 호출의 처리 계약은 같아지지 않는다.

### R08 · P1 · 파일 대기 후 권위 재검사보다 미반영 반환이 먼저 실행됨

- Source Script: `sourcescript/backend/project_efsm.py:219-234`, `send` 처리 4~5번.
- pseudocode: `pseudocode/backend/project_efsm.pcal:733-749`.
- Source Script는 파일 대기 뒤 권위가 바뀌었으면 재시도하고, 같은 권위일 때 candidate None을 미반영으로 처리한다.
- pseudocode는 `transactionOutcome.cancelled \/ ~transactionOutcome.hasCandidate`에서 먼저 반환하여 뒤의 권위 재검사에 도달하지 않는다.
- 대기 종료 시 권위 변경과 미후보 결과가 함께 성립하는 분기에서 Source Script는 새 권위로 다시 계산하지만 pseudocode는 종료한다. 실제 동시 실행 재현이 아닌 분기 순서의 정적 차이다.

### R09 · P2 · 성공 결과의 실제 참조 제거 수가 일부 명령에서 0으로 남음

- Source Script: `sourcescript/backend/project_efsm.py:124-128`, `buildProjectMutationResult` 처리 2번.
- pseudocode: `pseudocode/backend/project_efsm.pcal:411-419,682-699`.
- Source Script는 모든 성공 명령에 대해 반영 전후 참조를 비교한다. pseudocode는 수를 0으로 초기화하고 `domainFacts`에 있을 때만 덮어쓴다.
- `SLOTS_RESET`은 chart 제거·슬롯 payload 교체를 수행하지만 이 count 사실을 만들지 않는다. CSV 객체 참조 1개를 가진 슬롯을 reset하면 Source Script의 `removedGraphReferenceCount`는 1, 해당 pseudocode 경로는 0이다. 이미지 참조 reset도 같은 구조다.

### R10 · P2 · 일반 ProjectObject 초기화 경로의 설정 정규화 누락

- Source Script: `sourcescript/backend/project_state.py:592-620,672-700`.
- pseudocode: `pseudocode/backend/project_state.pcal:446-461`.
- Source Script는 Slot 정규화 → `normalizeProjectSettings` → 전체 검증 → 단일 교체 순서다. pseudocode의 일반 initializer는 Slot 정규화 다음 곧바로 전체 검증한다.
- export 하위 설정 누락 또는 무효 palette 색을 가진 입력에서 Source Script는 정의된 기본값으로 보완한 뒤 검증하지만 pseudocode의 해당 경로에는 보완 단계가 없다.
- `pseudocode/backend/assets_files.pcal:1106-1157,1309`의 프로젝트 가져오기 전용 설정 보완은 확인했다. 따라서 전체 pseudocode에 정규화가 전혀 없다는 판정이 아니라, 일반 초기화·반영 경로의 누락이다.

### R11 · P1 · 추가 content 필드가 슬롯 제거 안전성 검사에서 빠짐

- Source Script: `sourcescript/backend/project_state.py:703-727`.
- pseudocode: `pseudocode/backend/project_state.pcal:266-280`, 사용처 `pseudocode/backend/layout_annotations.pcal:277-286`.
- Source Script는 기본 Slot과 content 전체·caption을 비교하고 추가 필드도 포함한다. pseudocode는 chart/imageId/contentType/imageSettings/caption만 비교한다.
- 표준 필드가 모두 기본값이며 `content.extension = 1`인 슬롯은 Source Script에서 non-default, pseudocode에서 default다. 이 값은 정규화에서 보존되므로 단순 무효 입력으로 제외할 수 없다.
- grid 축소나 merge의 안전성 판정에서 추가 slot-local 자료를 잃을 수 있는 차이다.

### R12 · P2 · 명시적 무효 imageSettings를 기본값으로 수리

- Source Script: `sourcescript/backend/project_state.py:730-791`, 특히 처리 3번.
- pseudocode: `pseudocode/backend/project_state.pcal:213-251`.
- Source Script는 필드 누락에만 기본값을 사용하며 존재하는 잘못된 자료형은 검증 실패로 전달한다. pseudocode는 `content.imageSettings = NoValue`이면 기본값으로 교체한다.
- content에 imageSettings가 명시적으로 None인 입력은 Source Script에서 실패하고 pseudocode에서 기본값으로 바뀐다. None/NoValue의 표기 차이가 아니라 필드 존재 여부 처리의 차이다.

### R13 · P2 · 등록 조회의 수락 집합 차이

- Source Script: `sourcescript/backend/project_state.py:124-166,272-283,317-320`.
- pseudocode: `pseudocode/backend/project_state.pcal:17-24,709-720`.
- Source Script에서 제거한 `interface-intent` 조회가 pseudocode에는 남아 있다.
- 반대로 Source Script의 `project-api`가 수락하는 `project.exportFile`, `assets.download`, `graphs.exportFfsx`, `graphs.exportPlotlyJson`은 pseudocode의 해당 operation 집합에 없다.
- pseudocode의 별도 export kind가 일부 같은 일을 처리해도 kind/operation 수락 계약은 다르다. 현재 public export wrapper가 모두 실패한다는 주장으로 확대하지 않는다.

### R14 · P2 · grid 설정 범위의 조회·소비 연결 누락과 고정 범위

- Source Script: `sourcescript/backend/project_state.py:303`, `sourcescript/application/public_api/layout_annotations.py:201-222`, `sourcescript/frontend/mantine_ui.py:108-141`, `sourcescript/backend/layout_annotations.py:309-350`.
- pseudocode: `pseudocode/backend/project_state.pcal:738-759`, `pseudocode/frontend/mantine_ui.pcal:62-77`, `pseudocode/backend/layout_annotations.pcal:268-276`.
- Source Script는 Backend 설정의 gridLimits를 공식 layout 조회에 포함하고 UI·Backend가 그 범위를 사용한다. pseudocode는 그 연결을 명시하지 않고 UI clamp와 Backend 검사에 1..8을 고정한다.
- 현재 설정의 값도 1..8이어서 기본 설정의 숫자 결과는 같다. 설정 범위를 변경하는 입력에서의 동작과 명시된 gridLimits 반환 계약이 다르다는 설정 의존적 불일치다.

### R15 · P1 · graph 슬롯에 대한 raw image import가 거부됨

- Source Script: `sourcescript/backend/assets_files.py:325-360`.
- pseudocode: `pseudocode/backend/assets_files.pcal:272-281`.
- Source Script의 `ASSETS_IMPORTED` 계산은 image를 연결하면서 contentType을 image로 바꾸고 기존 소유 chart를 제거한다. geometry·caption은 유지한다.
- pseudocode는 대상이 이미 image 슬롯이어야 한다고 요구하고 imageId만 설정한다.
- visible graph 슬롯에 유효한 image 파일을 가져오면 Source Script는 전환·연결하고 pseudocode는 거부한다. `SLOT_IMAGE_IMPORTED`의 image-only 조건과 raw asset import의 조건을 혼동하면 안 된다.

### R16 · P2 · raw CSV 교체가 기존 headerLines를 1 기준으로 덮어씀

- Source Script: `sourcescript/backend/assets_files.py:347-351,929-934`.
- pseudocode: `pseudocode/backend/assets_files.pcal:254-265`.
- Source Script의 파일 교체 입력은 rows·name·MIME·bytes·path·id이며 headerLines를 주지 않는다. `DATA_OBJECT_REPLACED`는 생략한 headerLines를 유지한다.
- pseudocode는 항상 `NormalizeHeaderCount(1, parsed)`를 만든 뒤 asset 전체를 교체한다.
- 기존 headerLines=0인 CSV를 같은 id/path로 교체하면 Source Script는 0을 유지하고 pseudocode는 새 rows가 있을 때 1로 바꾼다. 그래프에서 실제 데이터로 사용하는 행이 달라진다.

### R17 · P2 · 빈 CSV/TSV에 불필요한 비어 있지 않은 배열 조건 추가

- Source Script: `sourcescript/backend/assets_files.py:649-677`.
- pseudocode: `pseudocode/backend/assets_files.pcal:396-411`, `pseudocode/backend/graphs.pcal:36-44`.
- Source Script는 CSV/TSV를 행 배열로 해석하고 trailing physical blank line으로 새 행을 만들지 않는다. `graphs.dataTable`은 JSON 분기에만 호출한다.
- pseudocode는 CSV/TSV 해석 결과에도 dataTable을 호출하여 빈 배열을 거부한다.
- 빈 bytes의 `empty.csv` 또는 `empty.tsv`에서 Source Script의 행 결과는 빈 배열이고 pseudocode는 비어 있지 않은 배열 조건에서 실패한다. JSON의 빈 배열 수락 여부로 일반화하지 않는다.

### R18 · P1 · graph 객체 변경 후 저장 graph 재계산 누락

- Source Script: `sourcescript/backend/graphs.py:232-267,769-783`.
- pseudocode: `pseudocode/backend/graphs.pcal:249-263`, `pseudocode/backend/project_efsm.pcal:59-113,750-760`.
- Source Script는 objects를 변경한 chart에 `rebuildEditableGraph`를 적용하고 반환 chart를 candidate에 저장한다. pseudocode의 GraphCommitInAttempt는 objects 정규화·검증·교체만 수행한다.
- `GRAPH_OBJECTS_REPLACED` 호출 경로와 공통 반영 경로에도 누락된 graph 재계산이 없다. asset cascade의 별도 rebuild는 이 명령 경로를 보완하지 않는다.
- 기존 객체의 y 열을 C2에서 C3로 바꾼 경우 Source Script의 저장 chart.graph는 새 열을 반영하고 pseudocode는 editor 변경 전 graph를 유지한다. 이후 chartFigure가 조회용 복사본을 재계산하는 것과 저장 후보의 결과는 구별해야 한다.

### R19 · P2 · caption 첫 긴 단어가 prefix-only 줄을 추가

- Source Script: `sourcescript/frontend/renderer.py:659-668`.
- pseudocode: `pseudocode/frontend/renderer.pcal:360-385`.
- Source Script는 폭 초과와 현재 본문 줄 비어 있지 않음이 함께 성립할 때 줄을 바꾼다. 빈 줄의 긴 단어는 유지하고 그리기 영역에서 자른다.
- pseudocode는 첫 줄에 이름 prefix가 있다는 조건도 줄바꿈 사유로 사용한다.
- available=100, prefixWidth=20, 첫 단어 측정 폭=90이고 minimumTextWidth가 80 이하라면 Source Script는 이름과 단어를 한 줄로 유지·clip한다. pseudocode는 이름만 있는 줄과 다음 단어 줄을 만든다. 높이가 lineHeight만큼 증가하며 자동 export 높이도 달라진다.

### R20 · P2 · FFPX reader의 반환 시점에 CSV header 정규화 누락

- Source Script: `sourcescript/backend/assets_files.py:464-491`.
- pseudocode: `pseudocode/backend/assets_files.pcal:916-956,1159-1187`.
- Source Script의 ffpxReadProject는 저장 headerLines를 정규화한 payload를 반환한다. pseudocode reader는 bytes·rows를 복원하지만 headerLines를 그대로 반환한다.
- 2행 CSV의 저장 headerLines=99에서 Source Script 반환값은 2, pseudocode reader 반환값은 99다.
- pseudocode의 후속 buildProjectObject는 NormalizeImportedAssetCollections에서 보완한다. 따라서 전체 프로젝트 가져오기의 최종 결과까지 항상 다르다고 확대하지 않으며, 독립 reader의 반환 경계 차이로 기록한다.

## 3. 검토 범위

아래 각 행의 두 파일을 전체 확인했다. 표의 경로는 프로젝트 루트 기준이다.

| 모듈 | Source Script | pseudocode |
|---|---|---|
| Backend 상태 | `sourcescript/backend/project_state.py` | `pseudocode/backend/project_state.pcal` |
| Backend graph | `sourcescript/backend/graphs.py` | `pseudocode/backend/graphs.pcal` |
| Backend layout·annotation | `sourcescript/backend/layout_annotations.py` | `pseudocode/backend/layout_annotations.pcal` |
| Backend asset·file | `sourcescript/backend/assets_files.py` | `pseudocode/backend/assets_files.pcal` |
| Project EFSM | `sourcescript/backend/project_efsm.py` | `pseudocode/backend/project_efsm.pcal` |
| Application adapter | `sourcescript/application/adapter.py` | `pseudocode/application/adapter.pcal` |
| Public API 계약 | `sourcescript/application/public_api/__init__.py` | `pseudocode/application/public_api/contract.pcal` |
| Public asset | `sourcescript/application/public_api/assets.py` | `pseudocode/application/public_api/assets.pcal` |
| Public graph | `sourcescript/application/public_api/graphs.py` | `pseudocode/application/public_api/graphs.pcal` |
| Public layout·annotation | `sourcescript/application/public_api/layout_annotations.py` | `pseudocode/application/public_api/layout_annotations.pcal` |
| Frontend FSM | `sourcescript/frontend/interface_fsm.py` | `pseudocode/frontend/interface_fsm.pcal` |
| Frontend renderer | `sourcescript/frontend/renderer.py` | `pseudocode/frontend/renderer.pcal` |
| Frontend Mantine UI | `sourcescript/frontend/mantine_ui.py` | `pseudocode/frontend/mantine_ui.pcal` |
| System | `sourcescript/system.py` | `pseudocode/system.pcal` |
| Portable build | `sourcescript/portable_build/portable_build.py` | `pseudocode/portable_build/portable_build.pcal` |

Source Script 설정 자료인 `sourcescript/backend/settings.json`도 함께 확인했다.

## 4. 불일치로 확정하지 않은 항목과 한계

- Slot class와 record, 함수 추출·이름 변경·인자 전달 순서의 물리적 조정은 같은 처리·반환 의미가 보존되면 별도 결함으로 세지 않았다.
- graph의 scalar 변환·paired-row 나눗셈/스케일, categorical 처리, axis·extension 병합, label의 alpha/Roman·순서·괄호, geometry·caption 조합은 상세 절차를 비교했다. 추출 여부만으로 불일치를 추가하지 않았다.
- STORE ZIP·safe path·CRC·typed XML·원본 bytes·FFSX id remapping·chart 단일 소유 규칙도 비교했다. 확인한 차이는 위의 구체적인 경계에 한정한다.
- portable build에서는 Source Script와 다른 수락·출력 의미를 확정하지 않았다. 이 문장이 실행 성공이나 모든 잠재 결함 부재를 뜻하지 않는다.
- System의 prerequisite 확인과 프로젝트 구성 순서, UI root 생성과 mount primitive의 관계는 물리적 구체화 경계를 더 명확히 해야 단독 결함으로 확정할 수 있다.
- image editor의 상세 domain 반환과 등록 query의 축약 설명, appearance palette 전체 교체와 partial merge 설명, renderer snapshot caption 경로에는 Source Script 내부의 설명 범위·표현 연결을 먼저 확인할 부분이 있다. source code에서 의미를 가져와 pseudocode 결함으로 단정하지 않았다.
- R01·R02는 필수 의미를 확인할 수 없는 번역 누락이며 실행 실패 재현 보고가 아니다. R14는 현재 기본 숫자 결과보다 설정 의존성 차이를 지적한다. R20은 후속 constructor 이전의 반환 경계를 지적한다.
- Source Script 52 자체는 `stale/open`이다. 이번 검토는 그 전체 논리 닫힘이나 source code의 실행 품질을 판정하지 않는다. 누락을 수정할 때 Source Script의 의미가 모호하면 해당 책임의 설명을 먼저 확인해야 한다.

## 5. 후속 수정의 확인 기준

1. R08·R11·R15·R18의 명령·참조·저장 후보 차이와 R01의 UI 현재 입력 절차를 우선 전파한다.
2. 각 항목의 같은 입력·같은 현재 권위에 대해 반환값, 명령 호출 여부, 정규화, 반영 전후 결과를 대조한다. 함수 이름의 일치만으로 닫지 않는다.
3. R05/R06, R10의 일반 initializer/가져오기 전용 보완, R14의 Backend→public→UI 범위 연결처럼 여러 모듈에 걸친 경로를 함께 확인한다.
4. 수정 후 별도의 번역 검토 근거를 작성한다. 이번 작업에서는 pseudocode 수정·계층 revision 변경·실행 검증을 수행하지 않았다.
