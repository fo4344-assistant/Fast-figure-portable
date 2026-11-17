# Plan037 M01 — system 번역 검토

## 1. 범위와 Source Script 판단

- 계획: `../plans/plan-037.md`. 기준 commit: `f9dcca6ecabd2a5284a7bd7d882ea03bc29cd461`.
- `sourcescript/system.py`와 `pseudocode/system.pcal` 전체 및 ProjectObject 생성/initialize, renderer startup의 직접 호출 계약을 대조했다.
- 이 구간은 `initializeFastFigure` 한 절차와 초기 생성 호출의 번역이다. Source Script의 입력·순서·반환·현재 원천·변경 소유가 명시되어 있다. 준비 확인→검증된 프로젝트 채택→공개 API→초기 투영과 renderer→ready→UI mount→runtime 반환의 목적·책임이 연결된다.
- 프로젝트는 Backend의 한 activeProject, ready는 Application 경유 Frontend FSM, graph/image 자원은 실제 renderer, UI mount는 기존 React root가 소유한다. 새로운 상태 원천을 추가하지 않는다.
- 위 판단은 M01의 번역 대상 절차에 대한 판단이다. Source Script 전체의 `closure: open`과 나머지 14개 구간은 유지한다.

## 2. 실제 차이와 수정

| 항목 | Source Script 근거 | 기존 pseudocode 차이와 수정 |
|---|---|---|
| 준비 확인 | `sourcescript/system.py:71-72` | 프로젝트 채택 뒤 검사하던 순서를 맨 앞으로 옮겼다. host·스타일, Plotly, React/Mantine 준비를 각각 확인한다. 준비 실패 전에 project를 교체하지 않는다. |
| 생성과 채택 | `sourcescript/system.py:73-74`, `sourcescript/backend/project_state.py:489-576` | 기존 `ProjectObject_initialize` 호출은 현재 객체 교체 경로였다. `ProjectObject_create(source)`를 생성자에 대응시켜 중첩 복사→슬롯 정규화→project 설정 정규화→전체 검증→새 값 반환을 번역하고, 성공한 값만 초기 activeProject로 채택한다. |
| API 노출 | `sourcescript/system.py:75-76` | ready 뒤 노출하던 API를 초기 투영·renderer 시작 전에 공개한다. renderer에는 기존 public actions와 supplied 조회 결과를 전달한다. |
| 초기 투영·core | `sourcescript/system.py:77-82` | 기존 `dispatchProjectQuery`→현재 Frontend read→`startupCoreRuntime` 연결과 zoom/controller/기존 슬롯/style 순서를 유지한다. core 반환을 호출 local에 보관한다. |
| ready·mount | `sourcescript/system.py:83-85` | Application lifecycle event 뒤 기존 React root 한 곳에 mount하는 순서를 유지하고 mount 반환을 호출 local로 받는다. |
| 반환 | `sourcescript/system.py:86-87` | 고정 문자열을 반환하던 부분을 Application actions·core/controller·UI mount의 runtime 구성 값으로 연결한다. 플랫폼 handle의 구체 표현은 기호값이며 project 저장 필드는 추가하지 않는다. |

## 3. 보존과 확인 수준

- `ProjectObject_create`는 채택 전 복사본만 정규화·검증한다. 생성 실패는 기존 activeProject를 보존한다. 기존 `ProjectObject_initialize`와 다른 변경 경로는 유지했다.
- 초기화 중 후속 호출 실패를 원래 오류로 전달하며 이후 단계로 진행하지 않는다. 이미 성공한 초기화 단계의 새로운 rollback 규칙을 추가하지 않았다.
- 실제 두 pseudocode 파일 diff, 호출·반환 순서와 fingerprint를 정적으로 확인했다. Backend 모듈 전체 비교는 M02에 남는다.
- pseudocode 29는 Source Script 53에서 파생한다. Source Script·source code·verification·dist·설정·기존 문서는 유지했다. source code의 이전 derived_from은 아직 번역되지 않은 차이를 드러낸다.
- PlusCal 변환·TLC·앱·브라우저·테스트·빌드·checker main·commit/push는 수행하지 않았다. 정적 번역 결과를 실행 성공이나 전체 번역 완료로 표시하지 않는다.
