# Source Script → pseudocode 번역 수정 재검토

## 1. 기준과 범위

- 작성일: 2026-11-15.
- 기준 commit: `32bde7f00809d63e4592366a5a13df1823a72ef7`. 사용자 지시에 따라 기존 review·계획·패치 문서를 먼저 커밋한 다음 수정했다.
- 고정된 Source Script 52 fingerprint: `sha256:2740bd377c0f52c2ee99b32cb72eef0501e2c644656a788fe3c8aa581b095604`.
- 대상: `review-20261115-002-source-script-pseudocode.md`의 R01~R20, Plan032.
- 이 문서의 파일 경로는 `Fast-figure-portable/` 기준이다. 아래 행은 수정 후 pseudocode 기준이며, Source Script의 근거와 발견 당시 행은 기존 review의 같은 R 번호에 있다.
- 앞선 검토에서 15개 모듈 쌍의 전체 원문을 구간별로 읽었다. 이번에는 해당 Source Script 처리와 수정 절차·호출자·소비자, 실제 native Git 증분 전체를 대조했다. Source Script와 source code는 보존했다.

## 2. 항목별 정적 대조

| 항목 | 수정 위치 | 같은 입력에 대한 수정 후 처리와 판정 |
|---|---|---|
| R01/P1 | `pseudocode/frontend/mantine_ui.pcal:124-180`, `pseudocode/frontend/mantine_ui.pcal:261-270` | 네 UI 절차와 실제 컴포넌트 이벤트 연결을 추가했다. 명령 이벤트마다 공식 현재 선택·CSV·소유 chart를 읽는다. 슬롯 0은 유효하며 선택 부재·파일 취소는 명령 없이 반환한다. 파일 수신 때의 대상 id가 public import 입력으로 고정된다. 정적 대응 확인. |
| R02/P2 | `pseudocode/application/adapter.pcal:18-31`, `pseudocode/frontend/mantine_ui.pcal:100-122` | 구독은 기존 Frontend owner로 전달하고 getAppStateSnapshot은 revision 숫자를 반환한다. React 구독 비교 후 각 render가 공식 상태를 다시 읽는다. 구독 해제와 재렌더 조건을 플랫폼 primitive 계약에 명시했다. 정적 대응 확인. |
| R03/P2 | `pseudocode/frontend/mantine_ui.pcal:42-55` | 반환 필드를 nodes·slotRows로 맞췄다. 같은 동기 호출의 공식 tree/layout 결과를 소비하며 기존 assetNodes 별칭은 제거했다. 정적 대응 확인. |
| R04/P2 | `pseudocode/frontend/interface_fsm.pcal:183-209` | reconciliation과 notify 모두 direction=model-to-fsm을 설정한 뒤 기존 publish를 호출한다. revision과 선택 조정 순서는 유지했다. 정적 대응 확인. |
| R05/P2 | `pseudocode/application/public_api/contract.pcal:65`, `pseudocode/application/public_api/contract.pcal:220-221` | graphs.selectCsv와 assets.selectCsv가 같은 selectProjectCsv를 호출한다. 반환은 현재 CSV 또는 NoValue이며 FSM 상태 직접 반환 경로는 사용하지 않는다. 정적 대응 확인. |
| R06/P2 | `pseudocode/application/public_api/assets.pcal:32-56` | 전이 수락·revision 증가를 확인한 뒤 assets.readDeletionTarget을 다시 조회한다. publish 중 자산이 사라졌거나 CSV가 아니면 NoValue를 반환한다. 정적 대응 확인. |
| R07/P2 | `pseudocode/application/public_api/graphs.pcal:10-24` | 슬롯 조회 부재는 명령 전에 NoValue를 반환한다. 유효 슬롯의 chart 유무에 따른 기존 이벤트 분기는 보존했다. 정적 대응 확인. |
| R08/P1 | `pseudocode/backend/project_efsm.pcal:744-795` | 원래 예외 전달 후, 대기 뒤 권위 변경 여부를 취소·후보 부재보다 먼저 판정한다. 권위가 바뀌면 같은 작업 입력으로 재계산한다. 마지막 재확인·단일 반영은 유지했다. 정적 대응 확인. |
| R09/P2 | `pseudocode/backend/project_efsm.pcal:682-742` | 실제 전후 collectAssetReferences의 중복을 포함한 key 수 차이로 count를 계산한다. CSV 참조 1개 또는 이미지 참조 1개 reset은 1, 같은 chart·CSV 안의 순서 이동은 0이다. 같은 CSV를 쓰는 두 객체도 각각 센다. 정적 대응 확인. |
| R10/P2 | `pseudocode/backend/project_state.pcal:440-492`, `pseudocode/backend/assets_files.pcal:1115-1135` | 일반 초기화는 Slot 정규화→공통 설정 정규화→전체 검증→단일 교체를 수행한다. 가져오기 보완도 같은 계산을 호출하고 text/name/afterText·export 크기 같은 instance 필드만 별도로 보완한다. 누락만 기본값을 채우며 유효 hex 대소문자를 보존한다. 정적 대응 확인. |
| R11/P1 | `pseudocode/backend/project_state.pcal:264-273` | 기본 content 전체와 caption을 비교한다. 표준 필드가 기본값이어도 content.extension=1이면 비기본 상태이므로 merge·축소 안전성 검사에서 보호된다. 정적 대응 확인. |
| R12/P2 | `pseudocode/backend/project_state.pcal:214-262`, `pseudocode/backend/project_state.pcal:368` | 실제 필드 누락은 기본값을 채운다. 명시적 imageSettings=NoValue는 보존하여 IsRecord 검증에서 거부한다. 유효 record의 누락한 하위 필드만 보완한다. 정적 대응 확인. |
| R13/P2 | `pseudocode/backend/project_state.pcal:18-25`, `pseudocode/backend/project_state.pcal:734-758` | 등록에서 interface-intent를 제거하고 project-api의 네 export operation을 기존 ExportRead로 연결했다. 기존 export kind와 실제 payload 처리도 유지한다. 정적 대응 확인. |
| R14/P2 | `pseudocode/backend/project_state.pcal:788-790`, `pseudocode/backend/layout_annotations.pcal:268-280`, `pseudocode/frontend/mantine_ui.pcal:69-89` | Backend gridLimits→전체 layout을 복사하는 public read→UI clamp로 전달한다. Backend 검사도 같은 설정 범위를 사용한다. 다른 dimension·무효 입력 fallback은 현재 조회 값이다. 설정을 바꾸지 않고 범위 매개변수에 따른 대응을 확인했다. |
| R15/P1 | `pseudocode/backend/assets_files.pcal:220-302` | raw image를 graph 슬롯에 가져오면 소유 chart 제거·chart 비움·contentType=image·imageId 설정을 같은 후보에서 수행한다. id·geometry·caption은 유지한다. SLOT_IMAGE_IMPORTED의 별도 조건은 유지했다. 정적 대응 확인. |
| R16/P2 | `pseudocode/backend/assets_files.pcal:248-279` | 교체 id·종류·경로를 확인한 뒤 생략된 headerLines는 기존 값을 사용하여 새 행 수로 정규화한다. 기존 0은 0으로 유지하고 새 CSV는 기본 1을 사용한다. 정적 대응 확인. |
| R17/P2 | `pseudocode/backend/assets_files.pcal:402-420` | CSV/TSV 행 배열을 직접 반환하여 빈 bytes는 빈 행 배열을 유지한다. JSON만 dataTable의 기존 비어 있지 않은 배열 조건을 사용한다. 정적 대응 확인. |
| R18/P1 | `pseudocode/backend/graphs.pcal:249-268` | objects 정규화·검증 후 같은 후보의 CSV로 rebuildEditableGraph를 호출하고 반환 chart를 저장한다. y=C2→C3 변경은 editor와 저장 graph에 함께 반영된다. 기존 다섯 object 연산의 공통 호출 경로를 확인했다. |
| R19/P2 | `pseudocode/frontend/renderer.pcal:339-400` | 폭 초과와 현재 본문 줄이 비어 있지 않은 조건을 함께 사용한다. available=100/prefix=20/첫 단어 폭=90이면 prefix-only 줄을 추가하지 않고 한 줄을 유지한다. 기존 clip·lineHeight·자동 export 높이 소비를 보존했다. 정적 대응 확인. |
| R20/P2 | `pseudocode/backend/assets_files.pcal:922-963` | reader가 rows 복원 직후 headerLines를 정규화한다. 2행·저장 값 99는 독립 reader 반환부터 2다. 후속 constructor의 기존 정규화도 유지했다. 정적 대응 확인. |

## 3. 연결·계층·한계

- UI 이벤트와 render 연결 primitive는 정의된 절차 참조, 이벤트 인자·반환/실패 전달, revision 비교·재렌더·구독 해제 역할을 명시한다. 구체 React 실행을 이번 검토에서 수행하지 않았다.
- 참조 count는 집합으로 중복을 없애지 않고 반복 key의 전후 개수를 비교한다. graph hint·원래 index 대응·실제 changed는 기존 경로를 보존했다.
- 공개 API·파일 형식·원본 bytes·id·현재 권위·후보 계산·단일 반영 경계는 이 수정의 유지 조건이다.
- pseudocode 27은 stale을 유지한다. Source Script 52의 stale/open과 source code 157·verification-model 26의 기존 상태·derived_from은 보존한다.
- R01~R20은 정적 번역 대조에서 수정 대응을 확인했다. 테스트·앱·브라우저·빌드·TLC·checker 본체 실행, 전체 프로젝트의 동작 성공이나 Source Script 논리적 닫힘을 주장하지 않는다.
- 기존 review §4의 상위 의미 미확정 항목은 이번 20건의 완료 판정에 추가하지 않았다. Source Script 수정과 source code 전파는 수행하지 않았다.
