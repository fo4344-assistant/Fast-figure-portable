# 계획 015 — FFPX EFSM과 인터페이스 FSM 책임 분리

## 0. 선행 작업과 정의

- 선행 계획: `agent_space/plans/plan-014.md`. 그 계획의 A~E 단계와 필수 검증이 완료된 뒤 이 계획의 구현을 시작한다.
- FFPX는 파일 확장자를 뜻하는 것이 아니라 저장·복원 대상인 영속 **프로젝트 오브젝트 자체**를 뜻한다.
- EFSM은 FFPX 프로젝트 오브젝트의 상태, 전이, 전이 조건 및 불변조건을 관리한다.
- 인터페이스 FSM은 UI 상호작용의 단계와 상태를 관리한다.
- 화면/DOM, Mantine/React, Plotly renderer는 확정된 프로젝트 상태와 UI 상호작용 상태의 projection만 소유한다.
- 이 계획은 `agent_space/AGENT.md` 및 `agent_space/policies/source-script-policy.md`의 권위 계층, 단일 source of truth, diff patch pair, 리뷰 및 검증 규칙을 따른다.

## 1. 변경 이유와 관찰된 경계

현재 `sourcescript/application_fsm.py`는 lifecycle, workspace, overlay, assetSelection, graphObject 등 프로젝트 상태와 UI 상태를 하나의 ApplicationStateMachine 하위 영역에 정의한다. 프론트엔드의 일부 UI-local 상태는 `sourcescript/api_ui.py`에도 정의된다. 따라서 명칭만 변경하지 말고 각 상태의 소유권과 전이 책임을 실제로 나누어야 한다.

FFPX 프로젝트 오브젝트의 권위는 `activeProject`와 해당 project command/validation 경로에 있다. UI 내부에서 동일 영속 상태를 새로 복사해 독립 authority로 삼지 않는다. 직접 mutation 역시 위치 자체만으로 판단하지 말고 프로젝트 EFSM의 전이 조건, commit, 참조 정합성 절차를 거치는지 검증한다.

## 2. 단계별 실행 순서

### F. 책임 감사 및 기준 기록
- 기존 Source Script, pseudocode, verification, source code에서 `appFSM`, `activeProject`, `selectedSlotId`, Mantine-local state, DOM controller, renderer invalidation의 읽기/쓰기 경로를 추적한다.
- 상태별로 FFPX EFSM, 인터페이스 FSM, renderer projection, 임시 계산값, 직렬화 책임 중 하나로 분류한다.
- event별 선행조건, 실제 project mutation, selection reconciliation, publication, renderer side effect와 직접 변경 우회 경로를 표로 기록한다.
- 새 기능 없이 기존 observable semantics와 위반 경계를 분명히 적은 review를 만든다.

### G. Source Script 책임 구조 확정
- 프로젝트 EFSM에는 FFPX project object의 상태 전이, validation, 참조 무결성, commit/rollback 경계를 정의한다.
- 인터페이스 FSM에는 overlay lifecycle, focus/selection interaction, pointer/drag/drop interaction 및 UI-only transition을 정의한다.
- 명령 경계는 `UI event → interface transition → explicit project command → EFSM validate/commit → result → UI reconciliation → renderer projection`으로 명세한다.
- 영속 프로젝트 오브젝트와 UI 선택값의 관계를 명시하되 동기화되는 두 독립 원천을 만들지 않는다.
- Source Script 논리 module decomposition을 먼저 확정하고 closure review를 통과한다.

### H. PlusCal 직접 번역
- 갱신된 전체 관련 Source Script 의미를 PlusCal에 반영한다.
- 두 FSM의 전이, 오류·취소, 비정상 종료 시 UI cleanup, 프로젝트 commit/notification 순서를 표현한다.
- translation review와 development-versions fingerprint/lineage를 갱신한다.

### I. 검증 모델 및 TLC
- 프로젝트 불변조건과 참조 무결성, invalid transition 거부, 단일 commit, 오류 시 프로젝트 상태 불변을 검증한다.
- UI-only transition이 FFPX project object를 변경하지 않는다는 경계 및 UI→EFSM 명령 일관성을 검토한다.
- 필요한 bounded verification model을 pseudocode에서 파생하고 TLC를 실제 실행한 뒤 결과를 review에 기록한다. 실행하지 못했다면 passed로 표시하지 않는다.

### J1. FFPX EFSM 구현
- 영속 project mutation과 validation을 프로젝트 EFSM 소유로 수렴시킨다.
- 다른 UI 진입점에서 동일 프로젝트 전이를 호출해도 규칙이 중복되지 않도록 한다.
- 소유권 단위 coherent patch, 관련 회귀검사, 정확한 .patch/.md 쌍 및 필요 version metadata를 남긴다.

### J2. 인터페이스 FSM 구현
- workspace, overlay, UI selection, drag, pointer, focus 등 상호작용 상태와 event handling을 인터페이스 FSM으로 옮긴다.
- Mantine/React 컴포넌트 로컬 상태와 공용 인터페이스 상태의 생명주기를 구분한다.
- DOM hidden control, synthetic .click(), 임시 양방향 bridge로 기존 상태머신을 우회하지 않는다.
- 이행 중 불완전 기능은 명시적으로 WIP 처리하고 영속 데이터 안정성을 보장한다.

### J3. Orchestration 및 renderer
- EFSM 결과와 UI-FSM notification을 구분하고 최종 commit/reconciliation 이후 renderer invalidation을 한 번 수행한다.
- 프로젝트 변경이 없는 UI-only transition에서 불필요한 full dashboard render를 하지 않는다.
- renderer가 새 project mutation/FSM event를 발생시키는 재진입 순환을 금지한다.
- 필요한 targeted projection과 기존 dashboard delegated event ownership을 유지한다.

### K. 통합 회귀 및 cutover
- 기존 project 저장·복원, VFS trash/ref detach, slot swap, asset-to-slot drag, graph/image/caption editor, overlay resize, layout selection, Plotly projection을 검증한다.
- Source Script → PlusCal → verification/TLC → Source Code lineage 검사, browser regression, distribution build를 완료한다.
- 최종 review에 통과/미실행/실패를 구분하고 legacy ownership 정리의 실제 완료 여부를 기록한다.

## 3. 단계 진행 규칙

1. 각 자동화 실행은 저장소 최신 main, 선행 계획 완료 증거, patch pair, review, development-versions.json을 먼저 확인한다.
2. 첫 번째 미완료 단계에서 진행하며, 동일 실행에서 다음 단계까지 가능한 경우 검증 순서를 유지한 채 진행할 수 있다.
3. 단계 완료는 시간 경과나 문서의 체크 표시가 아니라 변경 코드, 정확한 패치, 검증 및 review의 증거로 판정한다.
4. 실제 source/pseudocode/code 변경은 해당 계층의 revision·fingerprint·derived_from을 갱신한다.
5. 정책 원문은 사용자 요청 없이 수정하지 않는다.
6. GitHub Actions 및 self-hosted runner를 사용하지 않는다. 실행하지 못한 테스트는 검증 완료로 주장하지 않는다.
7. 작업은 장시간 세션 상태를 가정하지 않고 매 실행마다 저장소의 유일한 기록으로 복원한다.

## 4. 완료 판정

FFPX 영속 프로젝트 객체의 권위 상태와 전이가 프로젝트 EFSM에 있고, UI 상호작용 상태와 전이가 인터페이스 FSM에 있으며, renderer는 두 상태로부터 단방향 projection을 만든다. 모든 관련 기능이 기존 의미와 저장 파일 호환성을 보존하고, 문서·패치·계층 lineage·필수 검증이 모두 일치한 경우에만 완료다.
