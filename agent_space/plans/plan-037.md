# Plan037 — Source Script → pseudocode 모듈별 번역

## 1. 목적과 기준

Source Script 53과 pseudocode 28을 모듈별로 대조하고, 누락·왜곡된 절차를 Source Script의 의미대로 번역한다. 기존 Plan036에서 번역한 절차도 대응 근거를 보존한다.

범위 조사는 `openai-codex/gpt-6.1-terra` subagent의 결과를 사용했다. 15개 파일 쌍의 목록과 초기화 순서 차이가 확인됐으며, 전체 모듈의 상세 비교는 완료되지 않았다. 아래 표는 비교·번역 구간이며 모든 모듈의 변경 필요성을 뜻하지 않는다.

Source Script를 의미의 기준으로 삼는다. Source Script와 source code를 변경하거나 source code에서 누락 의미를 추정하지 않는다. 기존 문서는 보존하고 구간별 결과를 후속 review에 기록한다.

## 2. Source Script 판단과 번역 경계

Source Script 53의 전체 계층 상태는 `stale`, `closure: open`이다. 버전 번호나 Plan036의 부분 검토를 전체 닫힘으로 간주하지 않는다.

각 구간의 번역 전에 해당 Source Script의 전체 절차와 직접 호출 계약을 확인하여 다음을 판단한다.

1. 입력·반환·현재 원천·변경 소유자·분기·실패 의미가 결정되어 있는가.
2. 사용자 목적과 처리 순서가 연결되어 있는가.
3. 상태·계산·자원 소유가 중복되지 않는가.

판단 근거를 구간 review에 적는다. 의미가 미결정인 절차는 위치와 필요한 결정을 기록하고 번역을 보류한다. 다른 절차의 의미를 하위 계층에서 보충하지 않는다. 모듈별 판단과 전체 계층 닫힘을 구분한다.

## 3. 모듈별 작업 구간

경로는 저장소 루트 기준이다. 한 구간에서는 해당 모듈의 모든 절차와 직접 연결된 호출·반환을 함께 처리한다.

| 구간 | Source Script | pseudocode | 비교·번역 대상 |
|---|---|---|---|
| M01 | `sourcescript/system.py` | `pseudocode/system.pcal` | 준비 확인, 프로젝트 생성·채택, 공개 API 노출, 초기 투영·runtime 시작, ready·반환·실패 순서 |
| M02 | `sourcescript/backend/project_state.py` | `pseudocode/backend/project_state.pcal` | Slot·ProjectObject 생성/복원/검증, 현재 원천, 전체 등록 조회, 선택 검증과 참조 보정 |
| M03 | `sourcescript/backend/project_efsm.py` | `pseudocode/backend/project_efsm.pcal` | 명령별 candidate helper 연결, 현재 참조, 파일 대기 뒤 재검증, 한 번 commit, 실제 결과와 index 대응 |
| M04 | `sourcescript/backend/assets_files.py` | `pseudocode/backend/assets_files.pcal` | VFS, 파일 판별·파싱·패키지, 충돌·가져오기·내보내기·삭제 참조 처리 |
| M05 | `sourcescript/backend/graphs.py` | `pseudocode/backend/graphs.pcal` | 그래프 오브젝트·열·설정·색상, figure 계산, 가져온 그래프 전환과 소유 참조 |
| M06 | `sourcescript/backend/layout_annotations.py` | `pseudocode/backend/layout_annotations.pcal` | grid·병합/분할·기하, label·caption, candidate 변경과 반환 |
| M07 | `sourcescript/frontend/interface_fsm.py` | `pseudocode/frontend/interface_fsm.pcal` | 생성, session 전이, 읽기, subscribe/unsubscribe/publish, 한 번 참조 보정 |
| M08 | `sourcescript/application/adapter.py` | `pseudocode/application/adapter.pcal` | 조회·명령·이벤트 연결, lifecycle, 실패·미반영 반환, 현재 너비 전달과 투영 |
| M09 | `sourcescript/application/public_api/__init__.py` | `pseudocode/application/public_api/contract.pcal` | 공개 method 전체 등록·인자 연결·조회/명령/lifecycle 경계 |
| M10 | `sourcescript/application/public_api/assets.py` | `pseudocode/application/public_api/assets.pcal` | 프로젝트·에셋 wrapper, 명시 대상, 취소·실패·실제 반영 결과 |
| M11 | `sourcescript/application/public_api/graphs.py` | `pseudocode/application/public_api/graphs.pcal` | 그래프 wrapper, slot/chart/선택 연결, 미반영·성공 조회·호출자 반환 |
| M12 | `sourcescript/application/public_api/layout_annotations.py` | `pseudocode/application/public_api/layout_annotations.pcal` | layout·label·caption·print wrapper, session과 영속 값 구분, 반환 |
| M13 | `sourcescript/frontend/renderer.py` | `pseudocode/frontend/renderer.pcal` | supplied projection, 공통 틀, graph/image 자원·비동기 완료, 입력 controller·출력 |
| M14 | `sourcescript/frontend/mantine_ui.py` | `pseudocode/frontend/mantine_ui.pcal` | 모든 UI 절차와 public action 연결, local 상태·입력 종료·접기·목록·미리보기 |
| M15 | `sourcescript/portable_build/portable_build.py` | `pseudocode/portable_build/portable_build.pcal` | 입력·bundle·태그 교체·잔여 외부 script 검사·파일 출력·실패 순서 |

M01은 작은 초기화 구간으로 먼저 처리한다. 이후 현재 프로젝트 원천과 transaction을 정리하고 domain·Frontend 상태·Application·표현 호출 순으로 진행한다. 구간의 직접 호출 계약을 확인할 때 후속 모듈 전체를 미리 재작성하지 않는다.

## 4. 구간별 처리

1. Source Script와 대응 pseudocode를 끝까지 나누어 읽고 모든 함수·메서드·분기 및 물리적 helper 대응을 열거한다.
2. 다음 경로를 대조한다.
   - 조회: 현재 소유 원천 → 필요한 계산 → 분리된 반환 → 해당 호출의 소비.
   - 변경: 현재 참조 → candidate → 검증·현재성 확인 → 한 번 반영 → 실제 결과.
   - 참조 보정: 실제 변경 결과 → Backend 계산 → Frontend의 현재 선택·한 번 publish.
   - wrapper: 인자·lifecycle·취소·예외·미반영·성공 반환.
   - 표현: supplied input → host별 갱신 → 자원 교체·비동기 완료 확인·정리.
3. 같은 의미로 이미 번역된 절차는 대응 근거를 기록하고 유지한다. 실제 차이에는 양쪽 파일·행과 달라지는 입력·결과·실패 효과를 적는다.
4. 차이가 확인된 pseudocode의 값·조건·순서·호출·반환을 명시적으로 번역한다. Source Script의 계층과 기존 소유자를 유지한다. 핵심 알고리즘을 새 불투명 helper 이름으로 대신하지 않는다.
5. 변경 모듈과 직접 호출부를 다시 대조하고 논리·목적·비중복 판단을 review에 기록한다. 변경하지 않은 모듈도 비교 결과와 근거를 남긴다.

## 5. 첫 구간의 확인 항목

M01에서는 subagent가 지적한 두 차이를 전체 초기화 절차와 대조한다.

- 준비 확인과 프로젝트 생성·채택의 선후 관계.
- 공개 API 노출과 초기 runtime·ready 전이의 선후 관계.

초기 ProjectObject의 생성·검증·현재 원천 채택과 단순 기존 객체 초기화의 차이를 확인한다. 초기화 실패의 효과와 최종 runtime 반환도 함께 번역한다. 호출되는 Backend·Application·Frontend 절차의 의미는 해당 원천 계약을 사용한다.

M07의 constructor·구독 절차는 별도 이름의 부재만으로 누락을 확정하지 않는다. 초기 상태 구성·listener 등록/해제·publish의 listener snapshot이 실제 호출 경로에 표현되어 있는지 확인한다.

## 6. 기록과 완료 기준

- 실제 pseudocode 변경에는 native Git diff와 같은 이름의 설명 문서를 작성한다. 문서만 작성한 구간에는 code patch를 만들지 않는다.
- 변경 후 실제 fingerprint와 Source Script derived_from을 갱신한다. 실행·전체 계층 닫힘과 정적 번역 결과를 구분한다.
- 구간 review에는 Source Script 판단, 전체 절차 대응, 수정·유지·보류 항목, 직접 호출 영향, 논리·목적·비중복 근거를 남긴다.
- 모든 15개 구간의 근거가 있어야 전체 비교 완료를 판단한다. 남은 구간이나 미결정 의미를 부분 결과로 숨기지 않는다.
- Source Script·source code·verification·dist·설정과 기존 정책·계획·검토 문서는 보존한다. PlusCal 변환·TLC·실제 UI 검증은 정적 번역 판단과 별개 증거다.
