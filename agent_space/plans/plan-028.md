# Plan 028 — 개발 정책에 맞춘 선택 슬롯 읽기와 그래프 입력 처리 수정

작성일: 2026-11-15
상태: Source Script 보완 중. 정의된 입력·필드·메서드와 자연어 처리 절차를 대조하고 있다. pseudocode·source code 반영과 재시험은 아직 수행하지 않았다.
기준 commit: `9e58bdf0381b62bb59068a44ca78d75be6edcaed` — Source Script 46, pseudocode 26, source code 157.

## 1. 목적과 확인된 문제

CSV와 그래프 슬롯을 선택해도 ‘객체 추가’ 버튼의 클릭과 Enter 입력으로 객체가 추가되지 않았다. 저장한 프로젝트를 다시 연 뒤에도 객체 수는 2 → 2 → 2였다. 프로그램이 내보낸 FFSX 파일을 선택한 빈 슬롯 6에 불러오면 ‘슬롯 불러오기 오류: 불러올 visible 슬롯이 없습니다.’가 표시됐다.

실제 조작과 파일은 `agent_space/reviews/review-20261115-001-real-field-test.md`와 `agent_space/logs/20261114-001-field-test/`에 보존되어 있다. 명시적인 슬롯 번호를 넣은 개발자 API 호출은 성공했지만, 이를 실제 버튼의 성공으로 간주하지 않는다.

직접 원인은 화면 상태의 잘못된 읽기다. 선택 슬롯은 Frontend 상태 관리자 `interfaceFSM`이 소유한다. 내부 객체 `interfaceFSM.state`에는 선택 슬롯 식별자가 없고, 공식 함수 `interfaceFSM.readState()`가 현재 식별자를 포함한다. 그러나 화면 구독은 Application의 `appFSM.state`를 통해 내부 객체를 받는다. 두 입력 처리가 여기서 `state.selectedSlotId`를 꺼내므로 `undefined`를 전달한다.

기준 commit의 관련 위치:

- `sourcecode/frontend/mantine_ui.js:167-172`: 구독과 화면 상태 읽기.
- `sourcecode/application/adapter.js:187`: 내부 상태를 그대로 반환하는 속성.
- `sourcecode/frontend/interface_fsm.js:112-116`: 공식 읽기 결과 구성.
- `sourcecode/frontend/mantine_ui.js:1458`: 객체 추가 입력.
- `sourcecode/frontend/mantine_ui.js:1860`: 슬롯 파일 입력.

FFSX의 관찰된 실패는 외부 파일 읽기 권한 부족이 아니다. `sourcecode/application/public_api/assets.js:25-29`에서 `file.arrayBuffer()`가 끝난 뒤 명령을 전달하며, `sourcecode/backend/project_efsm.js:764`에서 대상 슬롯을 확인하다가 거부된다. 이 지점은 package 해석 전이다. 따라서 대상 전달을 고친 뒤의 FFSX 해석·CSV 복원·반영 성공은 아직 확인하지 못했으며 별도로 재시험해야 한다.

## 2. 이전 계획에서 바로잡을 점

이전 계획은 React의 반복 읽기 조건을 맞추려고 모든 `readState()` 호출에 같은 보관 객체를 반환하도록 제안했다. 이 객체를 화면에도 배포하고 변경 명령에도 사용하게 되어, 표시용 복사본과 명령용 현재 읽기의 경계가 불분명했다. 공식 읽기라는 이름과 불변 객체라는 성질만으로 개발 정책 §2.3을 충족하지는 않는다.

이번 계획에서는 다음과 같이 구분한다.

| 용도 | 읽는 값과 수명 | 사용하면 안 되는 곳 |
| --- | --- | --- |
| 화면 갱신 감지 | 기존 `revision` 숫자를 공식 경로에서 읽는다. | 슬롯 번호나 변경 명령의 입력으로 해석하지 않는다. |
| 화면 표시 | 해당 render에서 공식 `readState()`를 새로 읽어 표시한다. | 이 결과나 여기서 꺼낸 식별자를 나중의 변경 처리에 재사용하지 않는다. |
| 사용자의 변경 요청 | 이벤트 처리 시 공식 경로로 현재 대상과 필요한 참조를 읽는다. | 다른 component의 표시 원천, 공용 cache, 다음 명령의 기본값으로 보관하지 않는다. |
| 이미 시작한 비동기 불러오기 | 시작 시 정한 명시적 대상 식별자를 그 불러오기 한 건에서만 사용한다. | 화면의 현재 선택을 대신하거나 다음 불러오기의 대상으로 재사용하지 않는다. |

선택 슬롯의 권위는 계속 `interfaceFSM` 하나다. 화면 표시 결과를 수정해 선택을 바꾸거나, Application에 별도 선택 저장소를 만들지 않는다. 프로젝트 변경은 기존 Backend 명령이 현재 프로젝트를 확인하고 수행한다.

## 3. 개발 정책을 어떻게 적용할 것인가

기준은 `agent_space/policies/development-policy.md` v0.2.6 전체다. 이 문서는 repo-template 최신 정책과 Git blob `a4b7c120a9d8a63391e02f265100a1fd56e75cf5`가 동일함을 확인했다. 정책 자체는 수정하지 않는다.

| 정책 | 이번 계획의 구체적인 적용 |
| --- | --- |
| §2.1–2.2 계산과 변경 분리 | 읽기와 구독은 상태를 바꾸지 않는다. 선택은 기존 Frontend 전이, 프로젝트는 기존 Backend 명령으로만 변경한다. |
| §2.3 복사본의 데이터 흐름 | 화면 표시 결과 → 명령 인자 경로를 없앤다. 명령은 이벤트 시 공식 현재 읽기에서 필요한 참조만 받아 한 작업 안에서 소비한다. |
| §2.4 권위의 연속성 | 선택 소유자와 기존 검증·반영 경로를 유지한다. 새로운 선택 원천이나 두 상태 사이의 동기화를 만들지 않는다. |
| §2.5·§2.8 복잡도와 중복 | 기존 `revision`, 읽기 함수, 구독, public API를 재사용한다. 공용 상태 복제본·새 store·일괄 snapshot 갱신 체계를 추가하지 않는다. |
| §2.6 참조 무결성 | 이벤트 시 취득한 슬롯·CSV·그래프 식별자는 기존 Backend에서 현재 존재와 소유 관계를 다시 확인한다. 번호가 같다는 사실만으로 유효하다고 보지 않는다. |
| §2.7 확정 규칙 보존 | 기존 그래프 생성·편집·FFSX 복원·실패 규칙을 다시 설계하지 않는다. 불명확한 부분은 Source Script 단계에서 해결하기 전 다음 단계로 넘기지 않는다. |
| §3.2 논리 구조 보존 | Frontend 상태, Application 중계, 화면 입력, Backend 계산의 기존 책임을 유지한다. React 구독 조건을 전체 FSM의 고수준 데이터 보관 규칙으로 확대하지 않는다. |
| §4.6 닫힘 근거 | 입력→읽기→호출→검증→결과의 연결, 목적 부합, 중복 제거를 각각 실제 근거로 기록한다. ‘검토했다’는 선언으로 끝내지 않는다. |

정책은 모든 복사를 금지하지 않는다. 그러나 값이 잠깐 존재하거나 `const` 또는 불변 객체라는 이유만으로 안전하다고 판단해서도 안 된다. 각 읽기 결과가 실제로 어디에 전달되고, 어느 시점에 폐기되며, 다른 소비자를 거쳐 변경 입력으로 돌아오는지 확인한다.

## 4. 선택한 설계와 대안

### 4.1 선택: 기존 변경 번호로 구독하고, 표시와 명령은 각각 읽는다

React가 사용하는 `useSyncExternalStore`의 현재값 함수에는 기존 `revision` 숫자만 반환한다. 변경이 없으면 같은 숫자이고, 기존 수락·발행 규칙에 따라 상태가 바뀌면 새 숫자다. 객체를 보관하지 않아도 반복 조회 결과의 동일성을 유지할 수 있다.

화면은 구독을 연결한 뒤 그 render의 공식 상태를 새로 읽는다. 변경 이벤트에서는 화면에 전달된 객체를 사용하지 않고 다시 현재 값을 읽는다. 이는 기존 revision과 읽기 책임을 이용하면서 표시 기능과 명령 기능을 모두 보존한다.

### 4.2 선택하지 않은 방향

- **모든 공식 읽기를 같은 보관 객체로 통합:** 화면용 요구를 전체 읽기와 명령에 확대한다. 별도 갱신 순서·보관 수명·재사용 통제가 필요하므로 채택하지 않는다.
- **UI 내부에서 마지막 revision과 전체 상태를 함께 cache:** 소유자가 이미 관리하는 revision·상태에 별도 복제와 일치 규칙을 추가하므로 채택하지 않는다.
- **화면에 슬롯 번호만 보충하고 기존 이벤트 closure를 유지:** 값 누락은 가릴 수 있어도 이전 render의 대상이 변경 명령으로 흘러가는 문제가 남으므로 채택하지 않는다.
- **선택 슬롯을 새 전역 변수나 Application store로 이동:** 기능상 필요 없이 소유 책임을 바꾸므로 채택하지 않는다.
- **모든 API에 새 ‘현재 선택’ 명령을 추가:** 기존 명시적 슬롯 인자와 공식 읽기로 처리할 수 있다. public API와 변경 경로를 늘리지 않는다.

## 5. Source Script의 구체적인 수정안

아래는 승인된 Source Script 수정 범위다. 현재 진행 사항은 9절에 기록한다. Python 표기는 Source Script의 작성 표기법이다.

### 5.1 `sourcescript/frontend/interface_fsm.py` — 현재 상태와 알림의 의미

`InterfaceStateMachine.readState(self)`에 다음을 명시한다.

1. 호출 시 현재 Frontend 상태를 읽어 불변 결과로 반환한다. 결과에는 `interfaceState`의 기존 필드, 현재 `selectedSlotId`, 기존 확대·고정 값이 포함된다.
2. 선택 없음은 `None`이다. 슬롯 0은 정상적인 선택이다. JavaScript에서는 `None`을 `null`로 대응시킨다.
3. 읽기 자체는 상태·revision·구독자를 변경하지 않는다. 이전 조회 결과를 별도 현재 상태로 보관하거나 재사용하지 않는다.
4. 반환 객체의 참조 동일성을 고수준 계약으로 요구하지 않는다. 화면 framework의 동일성 조건 때문에 이 함수 전체를 공용 cache로 바꾸지 않는다.
5. 반환 결과는 해당 호출의 사용 범위에서만 소비한다. render에 배포한 결과와 명령 처리에서 새로 읽은 결과를 같은 공용 객체로 취급하지 않는다.

기존 `FRONTEND_TRANSITION_RULES`의 알림 의미도 연결한다. 수락된 전이는 해당 규칙에 따라 상태와 revision을 확정한 뒤 알린다. 거부나 기존 no-op에는 발행을 추가하지 않는다. 오류→준비 복귀가 두 번 발행되는 기존 동작을 유지한다. revision을 화면 갱신용 별도 카운터로 복제하지 않는다.

선택 식별자를 `interfaceState`에 다시 저장하거나 `selectedSlotId`와 수동으로 맞추지 않는다. 현재 소유자의 값을 공식 읽기에서 포함하면 된다.

### 5.2 `sourcescript/application/adapter.py` — 공식 현재 읽기의 중계

`APPLICATION_BOUNDARY_RULES`와 기존 상태 읽기 설명을 보완한다.

- `appFSM.readState()`는 `interfaceFSM.readState()`의 현재 읽기를 중계한다. Application에 결과를 저장하지 않는다.
- 기존 `appFSM.state` 속성을 유지한다면 내부 객체가 아니라 같은 공식 현재 읽기를 제공한다. 두 경로의 필드 의미는 같되, 객체 동일성이나 cache 공유를 약속하지 않는다.
- 구독은 기존 Frontend 변경 알림을 연결한다. 알림 인자로 받은 과거 상태를 다음 명령의 입력 원천으로 보관하지 않는다.
- 기존 command/query/reconciliation/lifecycle의 순서와 결과는 바꾸지 않는다. Backend 실패에 성공 읽기를 실행하거나 숨은 rollback을 추가하지 않는다.

이 파일에 그래프 계산, package 해석 또는 React 전용 cache를 넣지 않는다.

### 5.3 `sourcescript/frontend/mantine_ui.py` — 화면 구독과 입력 처리의 분리

#### 가. `subscribeAppState(onStoreChange)`, `getAppStateSnapshot()`, `useAppState()`

기존 Mantine UI 책임 안에 다음 절차와 React 의존 조건을 명시한다. 새로운 논리 모듈을 추가하지 않는다.

1. `subscribeAppState`는 Application을 통해 기존 Frontend 변경 알림을 구독하고 해제 함수를 반환한다. 별도 상태 변경이나 알림을 만들지 않는다.
2. `getAppStateSnapshot()`은 공식 현재 읽기의 **revision 숫자만** 반환한다. 이 함수의 결과를 화면 전체 상태 객체라고 취급하지 않는다.
3. `useAppState()`는 위 구독 함수와 revision 함수를 `useSyncExternalStore`에 연결한다. 그 뒤 이번 render에 필요한 상태는 `appFSM.readState()`에서 새로 읽어 반환한다.
4. 상태가 안 바뀌면 revision 숫자가 같으므로 현재값 함수의 반복 호출이 가짜 변경을 만들지 않는다. 별도의 lastRevision이나 전체 상태 cache는 두지 않는다.
5. 구독 확인과 표시 읽기 사이에 await나 사용자 callback을 넣지 않는다. framework의 구독·재확인 절차를 보존하고, 읽기 자체에서는 전이를 실행하지 않는다.
6. `useAppState()`가 반환한 값은 표시, 사용 가능 여부, 설명과 로그에만 사용한다. 버튼·파일 입력의 변경 요청 함수에 이 객체나 여기서 꺼낸 대상 식별자를 넘기지 않는다.

React의 구독 조건은 기존 Mantine UI의 외부 의존 계약으로 한정한다. Frontend FSM, Application, Backend에 React 객체 보관 규칙을 전파하지 않는다. source code의 호출 문법은 하위 구현에서 정하되 위 값의 흐름을 바꾸지 않는다.

#### 나. `addSelectedGraphObject()` — 이벤트 시 슬롯과 CSV를 다시 읽는다

이 절차는 화면에 보인 CSV 객체를 인자로 받지 않는다. 이전 계획의 `addSelectedGraphObject(csvId)` 제안도 이 방식으로 교체한다. 이는 새 public API가 아니라 기존 객체 추가 입력의 Source Script 절차다.

1. 클릭 또는 Enter로 객체 추가 입력을 받는다.
2. `appFSM.readState()`에서 현재 선택 슬롯을 읽는다. 선택이 없으면 명령 없이 `None`을 반환한다. 0은 선택 없음으로 판단하지 않는다.
3. `FastFigureApi.graphs.readData()`에서 기존 현재 CSV인 `currentCsv`를 이번 이벤트에 새로 읽는다. 현재 CSV가 없으면 명령 없이 `None`을 반환한다. 표시용 `activeCsv`나 이전 그래프 객체의 CSV를 대체 원천으로 사용하지 않는다.
4. 이번 처리에서 취득한 슬롯 식별자와 CSV 식별자만 기존 `FastFigureApi.graphs.addObject(slotId, csvId)`에 한 번 전달한다. 두 읽기와 호출 사이에 await, 다른 명령, 사용자 callback을 넣지 않는다.
5. 이 값은 이번 호출의 명시적 입력으로만 소비한다. 다른 component의 읽기 원천이나 다음 이벤트의 기본값으로 저장하지 않는다.
6. Backend는 현재 슬롯·CSV·그래프 소유 관계를 다시 확인하고 기존 생성·추가 계산을 수행한다. Frontend가 CSV나 그래프 전체를 복제해 변경 후보로 보내지 않는다.
7. 기존 성공값·미반영 결과·원래 오류를 그대로 처리한다. 미반영이나 오류에 성공 표시를 만들지 않는다.

버튼의 사용 가능 여부는 표시용 현재 선택·CSV·기존 편집 가능 조건으로 계산한다. 이는 편의 표시일 뿐이므로 이벤트에서도 현재 입력과 기존 허용 조건을 다시 확인한다. 새 편집 규칙이나 무조건 활성화 규칙을 만들지 않는다.

#### 다. `importSelectedSlotFile(file)` — 불러오기 한 건의 대상 고정

1. 파일 선택기를 취소해 파일이 없으면 명령 없이 `None`을 반환한다.
2. 실제 파일을 전달받았을 때 `appFSM.readState()`로 현재 선택 슬롯을 새로 읽는다. 선택이 없으면 명령 없이 `None`을 반환한다. 슬롯 0은 계속 처리한다.
3. 슬롯 식별자와 파일을 기존 `FastFigureApi.graphs.importFile(slotId, file)`에 한 번 전달한다. 그 전에 await나 다른 변경을 끼우지 않는다.
4. 이후 고정한 식별자는 이 불러오기 한 건의 입력이다. 파일을 읽는 동안 화면 선택이 달라져도 다른 슬롯으로 교체하지 않는다. 이 식별자를 화면 선택의 새 원천으로 배포하지 않는다.
5. 실제 반영 시점에는 기존 Backend가 대상을 재확인한다. 대상이 사라지거나 허용 조건을 잃으면 기존 실패를 전달한다. 최근 슬롯·첫 슬롯·다른 빈 슬롯으로 보충하지 않는다.
6. 파일 복사, 해석, CSV 복원, 변경 후보 검증과 한 번의 반영은 기존 Application·Backend 책임에 둔다. UI에서 중복 작성하지 않는다.
7. public API의 기존 불러오기 시작·완료·실패 후 준비 복귀를 한 번만 사용한다. 화면에서 다시 lifecycle로 감싸지 않는다.
8. 취소·미반영·오류는 기존 결과대로 처리하고 성공 읽기를 실행하지 않는다. 원래 오류를 표시하며 이미 성공한 별도 명령을 되돌리지 않는다.

선택이 없거나 기존 busy 조건이면 버튼을 사용 불가로 표시한다. 파일 선택기를 열기 전의 render 값이나 화면 갱신용 revision을 대상 식별자로 사용하지 않는다.

#### 라. 같은 읽기 경로를 쓰는 실제 소비자도 함께 정리한다

`state.selectedSlotId` 사용처와 그 파생값을 모두 분류한다. 이미 찾은 곳은 편집 가능 전환, 제목·축·전체 설정 변경, 색상 처리의 표시·로그, 두 고장 난 입력이다.

- 표시와 로그는 해당 render의 읽기 결과를 사용한다. 여기서 얻은 값을 명령으로 돌려보내지 않는다.
- ‘현재 선택한 그래프를 바꾸는’ 이벤트는 현재 슬롯과 그래프를 공식 경로로 함께 다시 확인하고, 새 입력값만 기존 명령에 전달한다.
- 이전 화면의 편집 대상에 적용해야 하는 기존 명시적 입력은 그 한 작업의 대상임을 식별하고 기존 Backend 소유 관계 검증을 유지한다. 새 슬롯과 옛 그래프 번호를 임의로 짝짓거나 다른 그래프로 돌려보내지 않는다.
- 참조의 관계나 대상 시점이 기존 Source Script에서 결정되지 않았다면 해당 절차를 먼저 보완한다. 구현에서 임의로 ‘최신 대상’ 또는 ‘옛 대상’을 선택하지 않는다.
- 전체 표시 객체를 공용 입력으로 전달하지 않는다. 기존의 직접 입력 draft와 명시적 참조를 작업 범위 안에서 소비한다.

이 사용처들이 모두 실제로 고장 났다고 단정하지 않는다. 새 저장소를 만들지 않고 기존 기능을 일관되게 유지하기 위한 영향 범위다.

### 5.4 `sourcescript/application/public_api/__init__.py` — 읽기와 명시적 명령의 연결

`slots.readSelected`는 그 호출에서 Frontend의 현재 선택 참조를 얻고 Backend가 현재 슬롯을 해결하는 기존 공식 읽기임을 연결한다. 화면 표시를 위해 반환한 슬롯 객체를 별도 선택 저장소로 재사용하지 않는다.

`graphs.readData`의 기존 현재 CSV 읽기, `graphs.addObject`의 명시적 슬롯·CSV 인자, `graphs.importFile`의 한 작업 대상과 파일을 명확히 연결한다. `READ_RULE`과 `PUBLIC_LIFECYCLE_RULE`의 임시 읽기·현재 검증·단일 실행 원칙을 그대로 유지한다. 숨은 선택 기본값이나 새로운 public API를 추가하지 않는다.

### 5.5 `sourcescript/application/public_api/graphs.py` — 기존 명령 책임 보존

`graphEditorAdd(slotId, csvId)`와 `importSelectedGraphFile(slotId, file)`의 명시적 인자 순서·Backend 계산·반영 후 읽기를 유지한다. 호출 중 화면 선택을 다시 읽어 대상을 바꾸지 않는다는 점만 부족한 곳에 연결한다.

실제 브라우저 바이트 복사가 끝난 뒤의 잘못된 대상 거부와, 그 이후 package 해석 실패를 구분한다. 이 계획만으로 FFSX 복원 전체가 맞다고 선언하거나 실패를 권한 문제로 돌리지 않는다. 이미 충분한 절차는 수정량을 만들기 위해 다시 쓰지 않는다.

## 6. 작업 순서와 단계별 완료 근거

### 1단계 — Source Script를 보완하고 닫힘을 판정한다

5절의 기존 다섯 파일 안에서 처리 절차를 보완한다. 다음 근거를 변경 설명에 남긴 뒤에만 다음 단계로 넘어간다.

1. **논리적 완결성:** 표시와 명령 각각의 입력→공식 읽기→소비→반환/실패 경로를 적는다. 선택 없음·0·CSV 없음·busy·대상 소멸·두 번의 오류/준비 알림을 대조한다. 미정 처리나 상충 규칙이 남으면 닫지 않는다.
2. **목적 부합:** 두 고장 난 UI 경로를 고치면서 기존 기능을 보존하는지 확인한다. 별도 상태 모델·새 정책·숨은 대상 보충이 요구에서 도출되지 않음을 확인한다.
3. **중복과 통합:** 기존 revision 구독과 모든 읽기의 객체 보관안을 비교한다. 선택한 방식이 같은 표시·입력 기능을 유지하면서 공용 cache와 동기화 규칙을 제거하는 근거를 기록한다.
4. **복사본의 실제 흐름:** 표시 결과에서 변경 명령까지 이어지는 경로가 남았는지 확인하고 각 관련 소비자를 분류한다. 이벤트 읽기는 해당 작업에서만, 비동기 대상은 해당 불러오기에서만 소비되는지 적는다.

위 근거는 이 범위의 판단이다. 프로젝트 전체 Source Script가 닫혔다거나 현재 계획 작성으로 모든 계층이 검증됐다고 확대하지 않는다.

### 2단계 — pseudocode로 직접 번역한다

| Source Script | 대응 pseudocode |
| --- | --- |
| `sourcescript/frontend/interface_fsm.py` | `pseudocode/frontend/interface_fsm.pcal` |
| `sourcescript/application/adapter.py` | `pseudocode/application/adapter.pcal` |
| `sourcescript/frontend/mantine_ui.py` | `pseudocode/frontend/mantine_ui.pcal` |
| `sourcescript/application/public_api/__init__.py` | `pseudocode/application/public_api/contract.pcal` |
| `sourcescript/application/public_api/graphs.py` | `pseudocode/application/public_api/graphs.pcal` |

계층 이름은 pseudocode이며 PlusCal은 그 구현 언어다. 표시 전용 revision 반환, 이번 render의 읽기, 이벤트 시 현재 읽기, 명령 호출 횟수, 값의 소비 범위, 비동기 대상 고정, 거부·실패 분기를 표현한다. 전체 상태 cache나 새 권위 원천을 추가하지 않는다. Source Script와 번역 충실도·구체화 수준을 확인한 뒤 다음 단계로 간다. 선택적 verification model이나 TLC를 이번 작업의 필수 조건으로 추가하지 않는다.

### 3단계 — source code에 반영한다

- `sourcecode/frontend/interface_fsm.js`: 공식 읽기 필드와 기존 알림 규칙을 대응한다. 이미 맞는 현재 읽기 계산에 보관 객체를 추가하지 않는다.
- `sourcecode/application/adapter.js`: 내부 객체 노출 대신 공식 현재 읽기를 중계한다. `appFSM.state`의 기존 소비자도 필드·동작 호환성을 확인한다.
- `sourcecode/frontend/mantine_ui.js`: revision 구독과 표시 읽기를 분리하고, 두 입력 및 관련 실제 소비자의 명령 인자 흐름을 함께 수정한다.
- `sourcecode/application/public_api/index.js`, `sourcecode/application/public_api/graphs.js`: 기존 명시적 인자 전달과 lifecycle 한 번 실행을 확인한다. 올바른 private 인자 순서 변환을 잘못 뒤집지 않는다.

system의 기존 진단 등 `appFSM.state` 소비자에는 새 고수준 책임을 만들지 않는다. 해당 getter의 변화로 수정이 정말 필요하면 영향과 상위 대응부터 확인한다. 전체 모듈 재설계나 무관한 정리는 하지 않는다.

### 4단계 — 기록과 계층 정보를 갱신한다

실제 의미 파일을 바꾼 단계에서만 revision·fingerprint·상위 파생 관계를 `development-versions.json`에 갱신한다. 실제 native Git diff와 동명 설명에 요구, 책임 경계, 선택 이유·기각 대안, 닫힘 근거, 전파 범위와 미실행 사항을 남긴다. 검사하지 않은 상태를 통과나 `current`로 올리지 않는다.

## 7. 구현 후 재시험할 내용

아래는 구현 및 실행 지시 이후의 시험 계획이다. 이번 계획 재작성에서는 브라우저, 빌드, 자동 시험, checker, TLC 또는 Actions를 실행하지 않는다.

1. **객체 추가:** 실제 파일 선택기로 CSV를 넣고 슬롯 0에서 첫 객체를 만든다. 같은 슬롯에 클릭과 Enter 각각 한 번으로 객체가 하나씩 증가하는지 확인한다. 다른 슬롯·CSV 선택 후에는 그 이벤트의 현재 대상만 변경되는지, 선택 해제·CSV 없음에는 명령이 없는지 확인한다.
2. **FFSX 실제 왕복:** 그래프를 FFSX로 내려받아 다른 빈 슬롯과 슬롯 0에 실제 파일 선택기로 불러온다. 그래프·필요한 CSV·소유 관계가 복원되고 원본 데이터가 유지되는지 확인한다. 단순 ZIP CRC 확인을 의미적 복원 성공으로 대신하지 않는다.
3. **실패 단계 구분:** 파일 취소, 바이트 읽기 실패, 잘못된 package, 현재 대상 소멸을 구분한다. 실제 발생 단계·오류·프로젝트 보존·준비 복귀를 기록한다. 관찰하지 않은 파일 권한 실패를 가정하지 않는다.
4. **비동기 대상:** 입력 후 선택을 바꿔도 원래 한 작업의 대상만 사용하고, 대상이 없어지면 다른 슬롯을 변경하지 않는지 확인한다. 지연 통제가 필요한 보조 실험은 순수 UI 결과와 구분한다.
5. **구독:** 입력 없이 반복 화면 갱신이나 React 오류가 없어야 한다. 선택과 기존 알림 변화가 실제 표시에 반영되는지, 거부 입력이 불필요한 발행을 만들지 않는지 확인한다.
6. **관련 소비자:** 수정한 편집 가능·제목·축 입력과 Plan027 기능 중 실제 영향 부분을 확인한다. 확인하지 않은 기능은 정상으로 쓰지 않는다.

개발자 API 직접 호출은 원인 분리용 보조 결과일 뿐 실제 버튼·파일 입력의 성공을 대신하지 않는다. 구현 대응 완료와 실제 UI 해결 확인을 별도로 보고한다.

## 8. 계획 재작성 당시의 범위와 종료 조건

이번에는 `agent_space/plans/plan-028.md`와 새 실제 diff·설명 쌍만 작성한다. 기존 실필드 증거·검토와 `20261115-001`~`003` 패치 기록은 보존한다.

Source Script, pseudocode, source code, 정책·AGENT·색인, 버전 정보, 배포 파일, 업로드 도구를 수정하지 않는다. 삭제한 테스트와 workflow를 복원하지 않고 commit·push도 하지 않는다.

이 계획은 정책을 구현 편의에 맞춰 고치는 대신, 표시용 복사본과 변경 입력의 흐름 및 불필요한 보관 구조를 바로잡은 작업안이다. 계획 작성만으로 Source Script 닫힘, 구현 완료 또는 FFSX 왕복 성공을 선언하지 않는다.

## 9. Source Script 보완 진행

- 현재 상태 읽기와 구독, 객체 추가·파일 불러오기·편집 가능 전환·설정 변경의 입력과 반환을 기존 다섯 Source Script 파일에서 보완했다.
- `updateSelectedGraphLayout(values)`는 기존 `chartModel.editor`의 title/globalSettings 부분 record를 받는다. 요청 record의 key와 중첩 위치가 변경 위치를 정한다. `globalSettings`, 그 `axes` key와 `axisSettings`를 원래 정의에서 참조한다.
- 선택 참조 읽기 → 공식 chart 조회 → 명시한 slotId/chartId와 새 values 전달 → 기존 Backend의 현재 소유 관계 확인·candidate 계산·검증·한 번 반영을 자연어로 연결했다.
- Source Script 전체 Python 15개 문서, 함수·메서드·내부 함수 184개의 구문을 조사했다. 설명 문자열로 결과·중간값·조건을 대신한 105개 함수와 관련 연결을 `plan-029.md`에 기록했다. 의미적 완결성 검토는 계속 필요하다.
- Source Script의 닫힘은 open이다. 기존 FSM 발행·reconciliation과 Application lifecycle의 설명 문자열 처리, 공개 읽기 결과의 구성·소비 연결을 추가 대조한 뒤 1단계 완료를 판단한다.
- 이번 기록은 Source Script 보완과 정적 조사다. pseudocode·source code·정책·AGENT·배포 파일을 변경하지 않았으며 실행 시험·commit·push를 하지 않았다.
