# Plan 032 — Source Script → pseudocode 번역 불일치 수정

## 1. 요구와 기준

- 작성일: 2026-11-15.
- 사용자 요구: 번역 불일치 검토 결과에 대한 수정 계획을 작성한다.
- 근거: `agent_space/reviews/review-20261115-002-source-script-pseudocode.md`의 R01~R20. 각 항목의 Source Script·pseudocode 경로와 행, 대조 입력은 해당 review에 기록되어 있다.
- 기준 commit: `959f154dfbec5441945593b5a36740e9347de316`.
- 계획 작성 시점 계층: Source Script 52/stale/open, pseudocode 26/stale, source code 157/stale.
- 고정된 번역 기준: Source Script 52, fingerprint `sha256:2740bd377c0f52c2ee99b32cb72eef0501e2c644656a788fe3c8aa581b095604`. 이 작업에서 Source Script는 수정하지 않는다.
- Plan031까지 작성된 Source Script를 그대로 읽고, R01~R20의 차이를 pseudocode에서 수정한다. 기존 review와 패치 기록은 보존한다.
- 계획 작성 후 사용자가 pseudocode 수정과 선행 커밋을 승인했다. 실제 수정 결과는 §8에 기록한다.

이 문서의 경로는 `Fast-figure-portable/` 기준이다. PlusCal은 pseudocode의 구현 언어다. 계층 이름은 Source Script → pseudocode → source code로 사용한다.

## 2. 범위와 유지 조건

1. R01~R20의 입력, 반환, 참조 해석, 분기 순서, 후보 계산, 반영 결과를 맞춘다. 같은 경로에서 드러나는 누락은 호출자와 소비자까지 함께 수정한다.
2. Source Script의 실제 정의·공통 원형·설정·등록 관계를 참조한다. 명령·이벤트·허용값을 별도 목록으로 복사하여 수동 대응 관계를 추가하지 않는다.
3. 현재 프로젝트의 유일한 소유 상태, 명령별 후보, 현재 참조 재확인, 단일 반영과 반영 후 결과 계산을 유지한다. UI의 표시용 읽기 결과를 이후 명령 입력의 공유 원천으로 보관하지 않는다.
4. 변수 정의에는 자료형·원형·값의 의미를 적는다. 계산과 분기는 절차 본문에 작성한다. 새 primitive를 사용하면 입력·반환·상태 변경·실제 처리와 호출 위치를 명시한다.
5. 공개 API 이름·인자 순서·파일 형식·원본 bytes·id·소유 관계를 보존한다. 파일 취소, 명령 거부, 원래 예외, 정리와 ready 복귀를 현재 Source Script에 맞춘다.
6. 이번 수정 범위는 pseudocode와 필요한 계층 기록이다. source code·설정 값·배포물·정책·AGENT·예시 파일은 보존한다. source code 전파는 수정된 pseudocode의 번역 검토 이후 별도 작업으로 둔다.
7. 테스트·앱·브라우저·빌드·TLC·checker 본체·Actions·커밋·푸시를 이 계획의 자동 실행 단계에 포함하지 않는다. 삭제된 테스트도 복구하지 않는다. 정적 대조와 실제 실행 결과는 구분한다.

## 3. 번역 착수 전 확인

1. 현재 HEAD, Source Script 52의 fingerprint, 작업 파일, 기존 review와 `development-versions.json`을 확인한다. 기준 이후 다른 작업의 변경이 있으면 대상 본문을 다시 대조한다. 기존 미커밋 review·패치 쌍을 보존한다.
2. Source Script의 해당 입력·처리·반환·실패를 읽고 대응 pseudocode의 차이를 수정한다. 별도 Source Script 수정이나 닫힘 작업을 선행 단계로 추가하지 않는다. 이번 작업의 완료 근거는 고정된 Source Script에 대한 번역 충실도다.
3. review §4의 미확정 항목은 확정된 R01~R20과 구분한다. 고정된 Source Script에서 의미를 유일하게 읽을 수 없는 항목은 그 위치와 해석 차이를 기록하고 사용자에게 확인한다. Source Script를 임의로 수정하거나 source code에서 의미를 가져오지 않는다.
4. 실제 pseudocode 수정 직전 작업 상태를 native Git 기준으로 보관한다. 각 수정 그룹의 실제 증분 patch와 review 항목의 대응을 추적한다.

## 4. 수정 순서와 항목별 처리

P1의 자료 보존·명령 반영 문제를 우선하되, 공통 정규화와 반환 구조를 먼저 맞추어 다음 단계가 그 의미를 사용할 수 있게 한다. 각 그룹에서 수정하는 Source Script 대응 절차와 pseudocode 전체 문맥을 확인한다. 아래 순서의 대상 파일은 모두 `pseudocode/` 아래다.

### 4.1 Backend 상태·정규화·조회 계약 — R10, R11, R12, R13, R14

대상: `backend/project_state.pcal`, `backend/layout_annotations.pcal`, `application/public_api/layout_annotations.pcal`, `frontend/mantine_ui.pcal`.

- **R10:** 일반 ProjectObject 생성·initialize 경로에 Source Script의 설정 정규화를 연결한다. Slot 정규화 → 누락 설정 보완·palette 정규화 → 전체 검증 → 단일 교체 순서를 명시한다. 현재 가져오기 전용 설정 보완과 같은 책임은 공통 계산으로 연결하고, 현재 값 보존과 기본값 적용 조건을 유지한다.
- **R11/P1:** `slotHasNonDefaultLocalState`에 대응하는 판정이 기본 Slot의 content 전체와 caption을 비교하게 한다. 추가 content 필드도 포함한다. grid 축소와 merge의 모든 호출자가 같은 판정을 사용하도록 확인한다.
- **R12:** 필드 존재 여부와 값의 유효성을 구분한다. 누락한 imageSettings에 기본값을 적용하고, 명시적으로 존재하는 무효 값은 전체 검증의 실패 경로로 전달한다.
- **R13:** 등록 조회 kind와 operation을 Source Script의 실제 등록에 연결한다. 제거된 interface-intent 경로를 정리하고 project-api의 네 export operation을 반영한다. 기존 export kind의 동작과 각 요청·반환 계약을 함께 확인한다.
- **R14:** Backend layout 조회의 gridLimits를 public 조회와 UI 입력까지 전달한다. UI clamp와 Backend grid 검사에서 해당 설정 범위를 사용한다. 수정하지 않은 dimension의 현재 값과 무효 입력 fallback은 공식 현재 조회에서 얻는다.

대조 기준: `content.extension=1`인 기본 모양의 슬롯을 제거 안전성 검사에서 보호한다. imageSettings의 필드 누락과 명시적 None을 다르게 처리한다. 일반 initialize의 누락 export 설정·무효 palette 보완을 확인한다. 현재 기본 1..8과 변경된 설정 범위 모두에서 조회·입력·검증이 같은 원천을 사용해야 한다. 설정 파일 자체는 바꾸지 않고 매개변수에 따른 처리를 대조한다.

### 4.2 Project EFSM 재시도와 반영 결과 — R08, R09

대상: `backend/project_efsm.pcal` 및 해당 참조 계산 절차.

- **R08/P1:** 파일 대기 뒤 현재 프로젝트와 소유 상태의 동일성을 먼저 확인한다. 권위가 바뀌면 같은 새 입력·수집된 선택으로 다시 계산하고, 동일한 권위일 때 취소·후보 부재를 판정한다. 최종 반영 직전의 재확인과 단일 initialize도 유지한다.
- **R09:** 성공 결과의 참조 제거 수를 실제 반영 전후 자료에서 계산한다. 명령 helper가 특정 count 사실을 제공했는지에 따라 기본 0을 유지하는 경로를 없앤다. 나머지 실제 changed·선택 hint·원래 index 대응도 보존한다.

대조 기준: 파일 대기 뒤 권위 변경과 후보 부재가 함께 발생한 분기를 추적한다. CSV 참조 1개 또는 이미지 참조 1개를 가진 슬롯 reset의 결과 count를 비교한다. 거부·실패는 현재 상태를 보존하고 성공 결과를 발행하지 않아야 한다.

### 4.3 graph 후보의 저장 표현 재계산 — R18

대상: `backend/graphs.pcal`, `backend/project_efsm.pcal`의 GRAPH_OBJECTS_REPLACED 경로.

- **R18/P1:** objects 변경·정규화·참조 검증 이후 같은 후보의 실제 CSV를 사용하여 editable graph를 재계산하고 반환 chart를 후보에 저장한다.
- 객체 추가·이동·필드 변경·삭제·palette 적용의 실제 호출 경로에서 재계산 결과가 반영되는지 확인한다. 조회용 복사본의 chartFigure 계산과 저장 후보의 계산을 각각 추적한다.
- imported original·conversion view, 객체 확장 필드, 유효 index와 선택 hint를 유지한다. Source Script에 정의된 책임 경로를 따라 공통 처리를 연결한다.

대조 기준: y 열 C2→C3 변경 시 editor와 저장 chart.graph가 같은 변경을 나타낸다. 후보만 계산하는 단계와 최종 반영 위치를 구분하고, 중간 계산에서 현재 프로젝트를 쓰지 않는다.

### 4.4 raw asset import·CSV·FFPX 반환 — R15, R16, R17, R20

대상: `backend/assets_files.pcal`, 관련 `backend/graphs.pcal`의 dataTable 및 명령 계산 호출부.

- **R15/P1:** ASSETS_IMPORTED의 image 연결에서 contentType 전환·imageId 설정·소유 chart 제거를 함께 계산한다. 대상 id·geometry·caption을 보존한다. SLOT_IMAGE_IMPORTED의 별도 입력 조건은 해당 Source Script를 따른다.
- **R16:** raw CSV 교체 입력의 필드 존재 여부를 보존한다. headerLines가 생략되면 기존 값을 유지하고 rows 변경에 필요한 정규화만 정의된 순서로 수행한다. 새 CSV 생성의 기본값과 교체의 생략 조건을 분리한다.
- **R17:** CSV/TSV의 해석 결과를 행 배열로 반환한다. JSON에 적용하는 dataTable 조건의 호출 범위를 맞춘다. quoted delimiter·개행·중간 빈 행·trailing physical blank line의 기존 처리도 유지한다.
- **R20:** ffpxReadProject가 CSV headerLines를 정규화한 payload를 반환하게 한다. 공통 header 정규화 처리를 reader와 후속 constructor가 참조하며, 독립 reader의 반환 시점부터 계약을 맞춘다.

대조 기준: graph 슬롯에 image 파일을 가져온 결과, headerLines=0인 CSV의 raw 교체, 빈 CSV/TSV, 2행·저장 headerLines=99의 reader 반환값 2를 확인한다. JSON 빈 배열의 기존 거부 조건과 패키지 STORE·safe path·CRC·원본 bytes·id remapping은 유지한다.

### 4.5 Frontend 상태와 public 선택 경계 — R04, R05, R06, R07

대상: `frontend/interface_fsm.pcal`, `application/public_api/contract.pcal`, `application/public_api/assets.pcal`, `application/public_api/graphs.pcal`.

- **R04:** reconciliation·notify에서 direction을 model-to-fsm으로 설정한 다음 publish한다. 기존 revision·선택 조정·workspace·통지 순서를 보존한다.
- **R05:** graphs.selectCsv를 실제 selectProjectCsv 처리에 연결하고 CSV 또는 None 반환을 유지한다. assets namespace의 별칭도 같은 helper를 사용하게 한다.
- **R06:** 전이가 수락된 뒤 동일 경로를 공식 조회로 다시 읽어 현재 CSV 또는 None을 반환한다. 이전 조회 대상을 전이 후 반환에 재사용하지 않는다.
- **R07:** graphEditorAdd의 슬롯 조회 결과가 부재이면 명령 없이 None을 반환한다. 유효 슬롯의 chart 유무에 따른 명령 선택은 유지한다.

대조 기준: ui-to-fsm 상태의 reconciliation·notify, 무효 CSV 경로, 수락된 publish 중 자산 삭제·교체, 존재하지 않는 슬롯에 대한 add를 비교한다. 반환 자료형과 명령 호출 여부를 함께 대조한다.

### 4.6 UI 현재 입력과 revision 읽기 — R01, R02, R03

대상: `frontend/mantine_ui.pcal`, 필요한 `application/adapter.pcal`와 public 호출 연결.

- **R01/P1:** addSelectedGraphObject, importSelectedSlotFile, setSelectedGraphEditable, updateSelectedGraphLayout의 Source Script 절차를 번역하고 실제 UI 이벤트에서 호출되도록 연결한다. 이벤트 시점의 공식 선택 슬롯·현재 CSV·소유 chart를 읽고 기존 public 명령에 명시적 인자를 전달한다.
- 파일 취소·선택 부재·ready 조건·슬롯 0을 처리한다. 파일을 받은 시점의 대상 id는 해당 비동기 작업 범위에 보관하고, 실제 반영 때 Backend가 현재 존재와 소유 관계를 재검사한다.
- **R02:** revision 숫자를 구독 비교값으로 읽는 절차와 각 render의 공식 상태 읽기를 명시한다. 표시 읽기와 명령 이벤트의 현재 입력 읽기를 연결된 별도 절차로 작성한다.
- **R03:** readProjectAssetDisplay의 반환 필드를 nodes·slotRows로 맞추고 모든 소비자의 필드 접근을 함께 확인한다. 같은 자료를 가리키는 별도 필드명을 추가하지 않는다.

대조 기준: 슬롯 0에서 최초 객체 추가와 기존 chart 객체 추가, CSV 부재, 파일 취소, 파일 수신 뒤 선택 변경·대상 삭제, 같은 revision의 반복 render, nodes·slotRows 소비 경로를 정적으로 추적한다. 파일 선택 후 다른 슬롯을 선택해도 작업 대상이 새 선택으로 이동하지 않아야 한다.

### 4.7 caption 줄바꿈과 export 높이 — R19

대상: `frontend/renderer.pcal`의 exportCaptionLayout과 caption 높이 소비 경로.

- **R19:** 폭 초과 시 현재 본문 줄이 비어 있는지 검사하는 조건을 Source Script와 맞춘다. 빈 본문 줄의 긴 단어를 유지하고 그리기 영역에서 clip한다.
- 이름 prefix 폭·폰트 준비·측정값·blank paragraph·lineHeight·padding·border·dashboard gap과 자동 export 높이 계산을 함께 보존한다.

대조 기준: available=100, prefixWidth=20, 첫 단어 폭=90, minimumTextWidth≤80에서 prefix-only 줄을 추가하지 않는다. 본문이 이미 있는 줄, 이름만 있는 caption, 빈 문단의 기존 처리를 함께 대조한다.

## 5. 그룹별 검토와 전체 완료 기준

1. 각 그룹은 Source Script의 입력·자료형·원형·현재 권위·처리·반환·실패와 pseudocode의 대응 위치를 기록한다. 의미를 숨기는 추상 호출이 있으면 그 정의와 실제 호출 경로까지 확인한다.
2. 각 R 항목을 review의 동일 입력으로 다시 추적한다. 반환 필드·값, 명령 호출 여부, 현재 참조 해석, 정규화, 후보 내용, 재시도, 단일 반영과 결과를 대조한다. 이 작업은 정적 대조이며 테스트 실행 결과로 기록하지 않는다.
3. P1 5건 R01/R08/R11/R15/R18과 P2 15건 모두에 수정 파일·절차·근거·재검토 결과를 남긴다. 20건 중 미해결 항목이 있으면 번호·이유·영향을 명시한다.
4. R05/R06, R10의 일반 초기화/가져오기 보완, R14의 Backend→public→UI, R18의 계산→저장→조회 경로를 끝까지 확인한다. 한 함수 수정으로 관련 소비자까지 완료했다고 가정하지 않는다.
5. 영향을 받은 Source Script와 pseudocode 파일은 구간을 나누어 전체 확인한다. 마지막에는 15개 모듈 쌍의 기존 대응표를 다시 대조하여 다른 경로의 반환·참조·파일 형식이 바뀌지 않았는지 확인한다.
6. 후속 번역 review에 R01~R20의 판정을 기록한다. 기존 review는 발견 시점의 기록으로 보존한다. 미확정 상위 의미는 별도 표시하고 완료 수에 포함하지 않는다.

## 6. 계층 기록과 변경 산출물

- 실제 pseudocode 수정 시 그 revision과 실제 fingerprint를 갱신하고, 고정된 Source Script 52의 fingerprint를 derived_from에 기록한다. Source Script의 파일·revision·fingerprint·closure 기록은 유지한다. 실제 pseudocode 변경과 해당 metadata 변경을 같은 native patch에 포함한다.
- Source Script 52와 수정된 pseudocode의 입력·처리·반환·실패를 대조한 근거를 기록한다. 정적 수정·검토와 checker 실행·통과를 구분한다. 실행하지 않은 checker나 TLC를 통과로 기록하거나 current로 자동 승격하지 않는다. 정책상 버전 완료 조건이 남으면 그 상태와 필요한 후속 승인을 기록한다.
- source code 157과 선택적 verification-model의 기존 derived_from·상태는 이 수정으로 최신이라고 간주하지 않는다. 후속 전파는 별도 승인 범위로 둔다.
- 각 coherent 수정에는 실제 native Git diff와 동명 설명을 남긴다. 기존 plan·review·patch 기록과 다른 작업의 미커밋 파일을 보존한다.
- 현재 계획 작성 산출물: `agent_space/plans/plan-032.md`, `agent_space/patches/20261115-017.patch`, `agent_space/patches/20261115-017.md`. 계획 작성 단계에서는 구현·계층 metadata를 보존했으며, 승인 후 변경은 §8에 기록한다.

## 7. 중단 조건

- 고정된 Source Script에서 같은 입력의 처리·반환·실패가 유일하게 정해지지 않으면 해당 항목을 멈추고 경로·서로 다른 해석·필요한 확인 사항을 기록한다. Source Script 수정은 이번 작업 범위에 포함하지 않는다. 임의의 보완 알고리즘을 pseudocode에 추가하지 않는다.
- 전체 content 보존, chart 단일 소유, 현재 참조 재검사, 단일 반영을 지키면서 번역할 수 없으면 책임 경계부터 재검토한다.
- 기준 파일이나 HEAD가 다른 작업으로 변경되면 관련 항목을 다시 읽고 이미 반영된 수정을 확인한다.
- 필요한 실행 검증에 별도 승인이 없으면 정적 결과와 미실행 항목을 기록한다. 이 계획에서 실행·원격 작업을 자동 시작하지 않는다.

## 8. 승인 후 실제 수정 결과 — 2026-11-15

- 사용자 지시에 따라 기존 문서를 commit `32bde7f00809d63e4592366a5a13df1823a72ef7`에 먼저 보존했다. 이후 이 commit을 실제 증분 기준으로 사용했다. 추가 커밋·푸시는 수행하지 않았다.
- 고정된 Source Script 52와 source code는 보존하고 pseudocode 12개 파일을 수정했다.
- §4.1 R10~R14: 일반 초기화와 가져오기가 공통 설정 보완을 사용하며, 전체 content의 추가 필드와 명시적 무효 imageSettings를 보존한다. 등록 조회와 gridLimits 전달·설정 범위 검사를 반영했다.
- §4.2 R08/R09: 파일 대기 뒤 권위 재확인을 취소·후보 부재보다 먼저 수행하고, 성공 결과 count를 실제 전후 참조의 중복 개수 차이로 계산한다.
- §4.3 R18: objects를 정규화·검증한 뒤 같은 후보의 CSV로 graph를 재계산하여 저장한다.
- §4.4 R15/R16/R17/R20: raw image의 슬롯 전환, raw CSV 교체의 기존 header 유지, 빈 CSV/TSV 행 반환, FFPX reader의 header 정규화를 반영했다.
- §4.5 R04~R07: Frontend 방향 발행, CSV 선택 helper 별칭·전이 후 공식 재조회, 부재 슬롯 add의 명령 전 반환을 반영했다.
- §4.6 R01~R03: 네 현재 입력 절차와 컴포넌트 이벤트 연결, revision 구독 비교·각 render의 공식 읽기, nodes·slotRows 필드를 반영했다.
- §4.7 R19: 빈 본문 줄의 긴 단어를 유지하는 조건으로 맞추고 기존 clip·caption/export 높이 계산을 보존했다.
- 후속 정적 대조: `agent_space/reviews/review-20261115-003-pseudocode-corrections.md`. R01~R20 각각의 수정 위치·같은 입력·결과·한계를 기록했다. 기존 review의 발견 기록과 미확정 상위 의미는 보존했다.
- pseudocode 27 fingerprint: `sha256:5e40212959fccdb995ced547c8947a9ec0584c53eca8e11ac61d7ffed38a6558`. derived_from은 고정 Source Script 52 fingerprint를 가리킨다. 상태는 stale을 유지하며 Source Script의 stale/open과 source code·verification-model의 lineage는 변경하지 않았다.
- 실제 native diff와 설명: `agent_space/patches/20261115-019.patch`, `agent_space/patches/20261115-019.md`.
- 테스트·앱·브라우저·빌드·TLC·checker 본체·Actions는 실행하지 않았다. 정적 수정·대조 결과이며 실행 통과나 전체 계층 닫힘을 선언하지 않는다.
