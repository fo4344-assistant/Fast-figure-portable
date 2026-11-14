# Plan 027 — SSoT에 따른 상위 알고리즘 보완과 번역 정합성 수정

작성: 2026-11-14. 사용자 요청: debug 처리 절차 보완을 메모에 기록하고, 정정한 메모 전체를 바탕으로 작업 계획을 작성한다.

## 1. 기준·이전 계획과의 관계

- 기준 메모는 `agent_space/memo/20261113-001.md` 전체다. 세 항목은 새 사용자 선호 결정을 기다릴 문제가 아니라 기존 객체 관계·SSoT·공식 경계에 따라 상위 알고리즘과 세부 절차를 보완하고 번역 대응을 수정할 작업이다.
- Plan026의 A 세 번역 수정은 r156에서 정적으로 대응한 이력으로 유지한다. 본 계획은 Plan026의 앞으로 수행할 B/C 순서와 ‘세 가지 상위 결정 대기’ 분류를 대체한다. 완료된 A를 반복하거나 과거 계획·검토·patch를 삭제하지 않는다.
- 작성 기준은 HEAD `ae45be706abd50673b4ef9c52fd29b93bf47b22d`, Source Script 45/current → pseudocode 25/current → source code 156/stale다. 메모에는 이번 대화의 지시로 작성 중인 수정이 있다. 이전 Source Script closure/current 표시는 이번에 확인한 세부 절차 누락이 해결됐다는 증거로 재사용하지 않는다.
- 최초 작성 요청은 메모·계획·실제 diff/설명 기록만 허용했다. 이후 사용자 지시(2026-11-14 23:02)에 따라 아래 Source Script → pseudocode → source code 반영을 수행했다. 구현 허가와 commit/push 허가는 구분하며 후자는 받지 않았다.

## 2. 공통 기준

- Source Script → pseudocode → source code 순서를 지킨다. 상위가 미비하면 기존 정책과 확정된 의미로 먼저 보완하고 하위 코드에서 의미를 역으로 발명하지 않는다.
- 세부 알고리즘이 부족해도 SSoT를 반드시 유지한다. owner의 현재 authority와 공식 조회·명령 경로를 사용하고 UI 표시값·이전 render projection·장기 mirror를 다른 권위 원천으로 사용하지 않는다.
- Frontend가 Backend 내부 object/Registry/FSM을 직접 읽거나 변경하게 하지 않는다. Backend 내부 객체 조회의 조합은 기존 owner가 수행하고 Application 경계는 필요한 detached 결과만 전달한다.
- 기존 객체·공식 조회·setter를 우선 재사용한다. 전용 신규 API, 별도 상태 저장소, 공통 결과 프로토콜, 동기화 계층을 필수 해법으로 가정하지 않는다.
- 알고리즘 검토의 첫 원천은 Source Script다. 실제 source code는 상위 절차가 정리된 뒤 번역 불일치와 실제 소비자를 확인하는 데 사용한다. 중요한 관련 문서는 잘린 부분을 이어 읽어 전체를 확인하고, 이미 완독한 근거는 필요한 범위에서 재사용한다.

## 3. 반영 대상과 보존 조건

| 항목 / 상태 | 상위에서 보완할 절차 | 보존 조건·정적 종료 기준 |
| --- | --- | --- |
| 1. 슬롯별 사용 에셋 표시 / r157 정적 대응 | 레이아웃이 정한 표시 슬롯을 순회해 각 슬롯의 imageId 또는 chart → graph objects → csvId를 기존 객체 조회로 해결하고 표시 정보를 종합한다. Source Script의 조회·합성·표시 책임과 입력/반환을 연결한다. | 에셋 목록과 `/slots`의 연결 에셋 표시를 모두 유지한다. 빈 슬롯, 참조 없는 graph, 외부 참조 없는 원본 Plotly chart도 기존 의미대로 표시한다. 독립적인 chart 관리 목록을 새로 만들지 않는다. canonical 자산 트리에 slot/chart를 임의로 혼합하지 않는다. |
| 2. grid 단일 차원 편집 / r157 정적 대응 | 행 편집은 새 행과 현재 authoritative 열, 열 편집은 현재 authoritative 행과 새 열을 조합하도록 공식 조회·입력 구성·명령 검증 순서를 명시한다. 현재 값 유지가 필요한 invalid 입력 처리도 같은 SSoT에서 해결한다. | authority는 `activeProject.layout.gridRows/gridCols`다. 표시용 값으로 변경하지 않은 차원을 덮어쓰지 않는다. `setGrid(rows, cols)`의 전체 크기 입력 계약과 기존 슬롯 ID/좌표/내용 보존, 새 좌표 추가, 안전한 축소 거부, whole-project 검증·한 번 commit을 유지한다. 완료된 grid shape 변경 시 local selection clear를 다시 미결정으로 열지 않는다. |
| 3. debug toggle / r157 정적 대응 | Source Script의 runtime owner에 클릭 → 현재 debugEnabled 읽기 → 반전 → 공식 변경 → 표시 projection 갱신 절차를 연결한다. owner의 읽기·변경 순서와 기존 bool setter 연결을 명시한다. | `debugEnabled`가 runtime authority이며 `uiTelemetryState.debugEnabled`는 단방향 표시용이다. telemetry를 반전해 authority로 되쓰지 않고 새 debug mirror/영속 project field를 만들지 않는다. 기존 `setDebugEnabled(value)`의 명시 bool 설정 계약을 불필요하게 바꾸거나 toggle API를 강제하지 않는다. |

### 항목 1의 번역 불일치

현재 Source Script/pseudocode의 `assets.readTree`는 directories/assets의 canonical VFS tree다. 현재 구현은 `{ directories, data, images, charts, slots }` 평면 묶음을 반환하며 UI가 이를 소비한다. 슬롯별 연결 표시의 상위 절차를 보완한 뒤 반환과 실제 소비자를 함께 맞춘다. Backend read와 public binding뿐 아니라 관련 `.directories/.data/.images/.charts/.slots` 소비자를 확인해 에셋 선택·목록 등의 기존 기능을 남김없이 연결한다. 반환만 바꾸고 슬롯별 표시나 다른 실제 소비자를 끊는 것을 완료로 보지 않는다. 별도 독립 slot/chart authority는 만들지 않는다.

### 항목 2의 입력·변경 경계

UI의 새 편집값과 owner가 유지하는 현재 값을 구분한다. 조회 이후 다른 변경이 개입할 수 있는 실제 경로에서는 기존 command의 current-authority 검증·재계산 규칙과 연결해 변경하지 않은 차원을 과거 값으로 되돌리지 않도록 상위 절차를 닫는다. 구체 동기화 primitive나 snapshot 공유를 먼저 도입하지 않는다. 입력 정규화·거부·기존 값 유지 규칙은 관련 Source Script 계약을 확인해 명시하며 새로운 숫자 fallback이나 암묵적 성공을 만들지 않는다.

## 4. 적용 순서와 산출물

1. **Source Script 보완:** 항목 1 → 2 → 3 순서로 관련 Source Script의 전체 계약을 확인하고 위 처리 절차, 입력/반환, 책임, 실패·거부·no-op 분기를 명시한다. 주된 관련 경로는 `sourcescript/backend/project_state.py`, `sourcescript/backend/layout_annotations.py`, `sourcescript/application/public_api/`, `sourcescript/frontend/mantine_ui.py`, `sourcescript/frontend/interface_fsm.py`, `sourcescript/system.py`다. 실제 책임이 있는 파일만 수정한다. Source Script의 기존 잘못된 닫힘 판단에서 놓친 범위도 변경 설명에 기록한다.
2. **pseudocode 직접 번역:** 보완한 Source Script의 입력·값 흐름·조회 시점·권위 owner·상태 변화·실패 분기를 대응하는 `pseudocode/**/*.pcal`에 직접 옮긴다. 새 논리 계층이나 별도 상태 authority를 만들지 않는다.
3. **실제 코드/소비자 연결:** 닫힌 상위 절차에 따라 Backend read → Application public API/Adapter → UI/runtime 소비자를 coherent한 책임 단위로 수정한다. 항목 1의 readTree 반환과 모든 관련 호출자, 항목 2의 입력란부터 resize command까지, 항목 3의 버튼부터 runtime owner와 표시 갱신까지 연결한다. 상위와 이미 맞는 코드는 그대로 둔다.
4. **정적 정리·기록:** 실제 입력·분기·반환·변경 경계와 소비 경로를 대조하고 작업별 결과·실제 잔여만 간결하게 갱신한다. 각 계층 의미 파일이 실제 변경될 때만 revision/fingerprint/derived_from과 하위 stale 상태를 사실대로 관리한다. 실행하지 않은 checker·TLC·테스트를 통과로 표시하거나 임의로 current를 선언하지 않는다.

각 반영 단위의 실제 native Git diff와 동명 patch 설명에는 목적·근거·선택 이유·기각한 대안·실제 미확인/후속 범위를 남긴다. 과거 완료 보고서나 중복 장문 review는 새로 복제하지 않는다. 계획 작성 자체와 이후 별도 구현 허가를 구분하며 commit/push는 여전히 별도 지시가 필요하다.

## 5. 확인 범위·제외 사항

- 허용된 반영 단계에서는 관련 Source Script/pseudocode/실제 호출자의 정적 대응과 실제 diff를 확인한다. 실행 성공과 정적 대응을 구분한다.
- 테스트·app·build·version checker·TLC·브라우저·Actions는 실행하지 않는다. 삭제된 테스트/workflow를 복원하거나 과거 실행 결과를 현재 결과로 재사용하지 않는다.
- 기존 asset deletion-target·참조 수·trash read, r155의 palette/move 반환 소비, r156의 manual 이미지 0·ZIP 상한·grid selection clear는 구체적인 새 누락 근거 없이 다시 열지 않는다.
- 정책·AGENT·Git 업로드 방식, 배포 산출물, 무관한 모듈을 정리하거나 새 snapshot/diff 도구를 만들지 않는다. commit/push는 별도 사용자 지시에 따른다.

## 6. 종료·중단 기준

- **완료:** 세 항목 모두 Source Script의 처리 절차가 구체적이고 SSoT와 책임 경계에 맞으며, 해당 pseudocode과 실제 조회·명령·표시 소비자에 동일한 의미로 연결돼 있다. 항목 1의 반환 불일치와 현재 표시 기능 보존을 함께 확인한다. 미실행 항목과 계층 lineage는 사실대로 기록한다.
- 이미 확정된 SSoT 원칙을 사용자 선호 질문으로 되돌리지 않는다. 기존 계약만으로 정해지는 것은 그에 맞춰 처리한다.
- 관련 Source Script 전체를 확인해도 새로운 기능 의미·상충 계약·결과 분기를 정할 수 없을 때만 정확한 근거와 필요한 최소 입력을 남기고 그 부분에서 멈춘다. 무관한 작업을 추가하거나 허가된 다른 항목까지 중단하지 않는다. 동시 수정·권한 제한이 있으면 실제 상태와 blocker를 구분해 보고한다.

## 7. 실제 반영 결과 — 2026-11-14

- 세 항목 모두 Source Script의 절차·입력/반환·실패와 SSoT를 먼저 보완한 뒤 pseudocode, source code 순서로 연결했다. 이전 Source Script 45의 closure/current 기록은 이번 세부 절차 누락을 닫은 증거가 아니므로 새 revision에서 closure를 open으로 되돌렸다.
- 에셋: `assets.readTree`는 canonical directory/CSV/image node sequence로 맞췄다. 기존 `layout.readState.visibleSlots`에 같은 current project의 `assetDisplay`를 공급해 `/slots`의 이미지·실제 CSV 연결/빈 슬롯/embedded graph 표시를 유지했다. 트리 UI와 CSV 선택 후보의 두 실제 readTree 소비자, 행별 공식 참조 수 조회를 함께 연결했다. 별도 chart 관리 API/store는 만들지 않았다.
- grid: 입력 이벤트 시 공식 current layout을 읽고 companion/fallback을 구성해 동기 setGrid로 전달한다. 중간 await/외부 callback은 없고 기존 명시 전체 크기 계약·Backend 후보 검증/한 번 commit·local selection clear는 유지한다.
- debug: runtime owner의 pure `readDebugEnabled()`에서 현재 boolean을 읽어 반전하고 기존 bool setter를 호출한다. telemetry는 표시만 담당한다.
- Source Script 46 → pseudocode 26 → source code 157의 실제 fingerprint/derived_from을 기록했다. 세 계층 status는 stale이며 optional verification model/TLC 이력은 변경하지 않았다. 실제 native Git diff·설명은 `agent_space/patches/20261114-014.patch`와 동명 `.md`다.
- 확인은 전체 관련 문서의 누락 구간 보충, 변경 전체 diff 및 실제 호출/반환/분기 정적 대조와 Git whitespace 확인이다. 테스트·app·build·version checker·TLC·브라우저·Actions를 실행하지 않았고 실행 성공/current를 선언하지 않는다. 이 세 항목에서 추가 사용자 선호 결정이나 알려진 잔여 구현은 확인되지 않았다. commit/push 미수행.
