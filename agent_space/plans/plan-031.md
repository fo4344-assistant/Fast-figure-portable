# Plan 031 — Source Script 식별자·허용값·구조 참조 정리

## 1. 요구와 현재 범위

- 작성일: 2026-11-15.
- 사용자 요구: Slot 명령 helper의 Args에 이벤트 이름을 복사한 사례와 유사한 위반을 조사하고 수정 계획을 작성한다.
- 최초 작성은 조사와 계획 작성이다. 사용자 승인 후 Source Script 적용을 진행했으며 결과는 §8에 기록한다.
- 조사 기준: HEAD `3081b4120257cfea77b72fb2941ed688f7617d5a` 위의 현재 작업 파일. Plan030까지의 미커밋 변경을 포함한다.
- 조사 당시 계층 기록: Source Script 51, pseudocode 26, source code 157. 적용 결과 Source Script는 52/stale/open이며 하위 계층 기록은 유지한다.
- Plan030의 명령 계산 분리, 현재 소유 상태 조회, 후보 계산, 참조 재확인, 단일 반영, 실제 결과 계산을 유지한다. 이번 계획은 그 연결과 공통 정의를 정리한다.

## 2. 조사 방법과 판정 기준

Source Script의 Python 문서 15개, 함수·메서드·중첩 함수 198개의 정의 위치와 Args를 AST로 정적으로 조사했다. 모듈 정의, 명령·이벤트·공개 메서드·조회 경로 목록의 선언과 사용처도 전체 경로에서 검색했다. 해당 후보의 함수 본문, 공통 원형과 settings.json을 대조했다. AST에 나타난 문자열 개수와 실제 중복 의미를 구분하여 판정했다. 기존 단계에서 전체를 읽은 문서와 이번에 다시 읽은 관련 문서를 함께 사용했다. 이번 조사는 참조·중복 관계에 한정하며 전체 기능의 의미적 닫힘을 판정하지 않는다.

- 개발 정책 §2.6: 다른 구조의 구성원을 가리키는 관계는 원천과 대상의 연결을 추적·해결할 수 있어야 한다.
- §2.5, §2.8: 기존 구조를 활용하고, 같은 사실을 여러 곳에서 독립적으로 유지하는 구조를 줄인다.
- §4.3.2, §4.5: 기존 정의의 원형·참조를 연결하고 Args에는 필요한 자료형과 역할을 적는다.
- §4.6: 항목별 근거와 수정 후 관계를 확인한 뒤 완료를 판정한다.
- 고정 파일 형식의 문자열, 서로 다른 입력을 출력으로 변환하는 대응 관계, 실제 명령별 계산 분기는 각각의 의미를 보존한다. 반복 출현만으로 삭제 대상을 정하지 않는다.

아래 줄 번호는 조사 시점의 위치다. 후속 수정에서는 함수·정의 이름으로 위치를 다시 찾는다.

## 3. 확인한 수정 대상

### 3.1 네 명령 helper의 Args에 복사된 명령 집합

근거:
- `sourcescript/backend/project_efsm.py:114-125` — `buildSlotCommandCandidate`의 8개 명령 열거.
- `sourcescript/backend/assets_files.py:851-866` — `buildAssetCommandCandidate`의 명령 열거.
- `sourcescript/backend/graphs.py:705-717` — `buildGraphCommandCandidate`의 3개 명령 열거.
- `sourcescript/backend/layout_annotations.py:481-491` — `buildLayoutCommandCandidate`의 11개 명령 열거.

같은 담당 집합을 send의 분기와 Args에서 각각 유지한다. helper 추가·이동 시 여러 설명을 함께 고쳐야 한다. Args에는 명령 식별자의 자료형과 해당 helper를 선택한 등록 관계를 적고, 집합의 원소는 공통 등록에서 확인하도록 연결한다. 명령별 실제 계산은 각 helper의 처리에 유지한다.

### 3.2 명령 등록과 send의 담당 함수 선택이 분리됨

근거:
- `sourcescript/backend/project_efsm.py:12-45` — `PROJECT_COMMANDS` 34개 등록.
- `sourcescript/backend/project_efsm.py:241-297` — `ProjectStateMachine.send`의 등록 검사와 네 담당 함수 선택.

등록과 담당 함수 선택 사이에 구조적인 연결이 없다. `PROJECT_COMMANDS`의 기존 등록 책임에 명령별 담당 함수 참조를 함께 둔다. send는 그 등록에서 담당 함수를 선택한다. 외부에 필요한 명령 집합도 같은 등록에서 얻는다. 네 별도 명령 배열을 추가하지 않는다. helper 내부의 명령 비교도 공통 원천의 식별자를 지칭하도록 정리한다. 실제 호출 가능한 함수 참조를 사용하고 함수 이름을 다시 문자열로 적어 연결하는 경로는 제거한다.

### 3.3 공개 변경 경로의 별도 수동 대조표

근거:
- `sourcescript/backend/project_efsm.py:47-95` — `PUBLIC_PROJECT_MUTATION_ROUTES`.
- `sourcescript/application/public_api/__init__.py:65-148` — `PUBLIC_API_METHODS`.
- `sourcescript/application/public_api/graphs.py:15-315` 및 `sourcescript/application/public_api/layout_annotations.py` — 각 공개 함수의 실제 명령 전달.

`PUBLIC_PROJECT_MUTATION_ROUTES`는 선언 외 사용처가 없고 공개 함수의 명령 선택을 별도로 옮겨 적은 표다. 실제 공개 함수와 이름·명령이 자동으로 연결되지 않는다. 현재 공개 함수가 소유하는 분기와 명령 전달을 유지하고 이 별도 표를 제거하는 방향을 우선한다. 이 표만 담고 있던 관계가 있는지 먼저 대조하여 실제 담당 함수에 반영한다. `PUBLIC_API_METHODS`는 공개 메서드를 실제 함수에 연결하는 별도 책임을 유지한다.

### 3.4 함수 참조를 이름 문자열로 수동 연결

근거:
- `sourcescript/application/public_api/__init__.py:65-148` — `'assets.importProjectFile'`, `'graphs.graphEditorAdd'` 등의 문자열.
- `sourcescript/application/public_api/__init__.py:168-214` — `createPublicApi`가 import나 정의에서 문자열과 같은 이름의 함수를 찾는 처리.
- 같은 표의 query operation 문자열과 `sourcescript/backend/project_state.py:217-300`의 operation 분기.

내부 함수는 이미 import되어 있으므로 표의 값에 그 함수 참조를 사용한다. 공개 namespace와 메서드 이름은 공개 계약으로 유지한다. query operation도 Backend의 해당 조회 정의를 가리키는 관계를 연결한다. 존재 검사만 덧붙여 이름 문자열의 수동 일치를 계속 유지하는 방식은 채택하지 않는다. 조회의 입력 필드 대응은 별도의 의미가 있으므로 해당 연결에 남긴다.

### 3.5 Frontend 이벤트와 Backend 참조 검증 대상의 수동 일치

근거:
- `sourcescript/frontend/interface_fsm.py:28-42` — `INTERFACE_EVENTS`.
- `sourcescript/application/adapter.py:16-20,113-144` — `BACKEND_REFERENCE_EVENTS`와 검증 선택.
- `sourcescript/backend/project_state.py:304-351` — `validateFrontendIntent`의 세 선택 처리.

Frontend 이벤트, Application의 검증 선택, Backend의 실제 참조 판정은 각각 책임이 있다. 현재 이름을 각자 적어 관계를 유지하는 부분을 연결한다. 이벤트 식별자의 원천은 Frontend의 기존 정의에 두고, Application이 이벤트와 Backend 참조 검증 입력의 대응을 소유하도록 정리한다. Backend는 현재 Slot·asset·graph object 참조 판정을 담당한다. Backend가 Frontend FSM을 import하도록 연결하지 않는다. 검증 대상의 의미와 독립 선택 유지 규칙을 보존하며 각 경계의 인자와 결과를 명세한다.

### 3.6 설정 범위를 숫자로 다시 기재

근거:
- `sourcescript/backend/settings.json:56-57` — layout 행·열 범위와 imageSettings 범위.
- `sourcescript/frontend/mantine_ui.py:133` — grid 입력 `1..8`.
- `sourcescript/backend/layout_annotations.py:293` 및 `sourcescript/backend/project_state.py:723` — grid 검증 `1..8`.
- `sourcescript/application/public_api/layout_annotations.py:453` — scale `1..1000`, x/y `-100..200`.

설정이 바뀌어도 위 숫자가 그대로 남을 수 있다. Backend 정규화·검증은 기존 설정 경로의 해당 필드를 참조한다. UI 입력 제한도 공식 조회 경계를 통해 같은 범위를 받도록 연결하고, 필요한 반환 필드를 Source Script에 먼저 명세한다. Frontend의 Backend 설정 파일 직접 읽기나 별도 한계값 저장소는 추가하지 않는다. 수치 제한, 무효 입력 시 현재 값 유지, 누락 시 기본값 적용은 서로 다른 처리 조건이므로 각각 보존한다.

### 3.7 허용값과 중첩 원형의 반복 정의

근거:
- `sourcescript/backend/graphs.py:22-76` — `axisSettings`, `globalSettings`, `graphObject`.
- `sourcescript/backend/graphs.py:509-543,705-787` — 축 이름과 object enum의 재열거.
- `sourcescript/backend/project_state.py:55-67` — Slot.content.imageSettings의 중첩 원형.
- `sourcescript/backend/layout_annotations.py:19-38` — `imageSettings`, `labelSettings`.
- `sourcescript/application/public_api/layout_annotations.py:452` — fit 허용값의 재열거.

각 허용값 집합과 공통 원형을 해당 도메인에 한 번 정의하고 입력·검증·편집 처리에서 그 정의를 참조한다. Slot.content는 imageSettings의 공통 원형을 연결한다. 설정의 기본값 하나에서 허용값 전체를 추측하지 않는다. 축에서 Plotly 축으로의 대응은 변환 의미가 있으므로 보존하고, 그 대응의 원천 축을 기존 축 정의에 연결한다. markerSymbol처럼 사용처에만 허용값이 있으면 그 기존 집합을 도메인 정의에 명시한다.

### 3.8 label 예시 문자열에서 번호 변환을 별도로 계산

근거:
- `sourcescript/backend/layout_annotations.py:65-94` — `orderedSlotLabels`의 ordinal → alpha/decimal/roman 변환.
- `sourcescript/backend/layout_annotations.py:338-380` — `readLabelsApiState`가 ordinal 0의 표시를 format별 상수로 다시 계산.

기존 번호 변환과 괄호 처리를 한 계산 함수로 추출하여 실제 라벨과 예시 문자열에서 호출한다. 함수의 입력은 ordinal과 해당 설정, 결과는 identifier와 표시 문자열로 명시한다. 1 기반 alpha 자릿수, roman 표기, 대소문자, 괄호, 빈 슬롯 포함 순서와 병합 anchor 처리는 현재 알고리즘을 보존한다. 예시는 ordinal 0을 전달한다.

## 4. 별도 판정이 필요한 후보와 보존 대상

1. `sourcescript/backend/assets_files.py:25-41`의 FFPX_STRUCTURE/FFSX_STRUCTURE와 같은 파일의 writer/reader. 표는 저장 경로를 정의하지만 사용처가 표를 명시적으로 참조하지 않는다. 후속 적용의 첫 단계에서 필수 문서·선택 문서·공유 entry 역할과 실제 사용을 대조한다. 같은 entry 역할은 원천에 연결한다. FFPX와 FFSX의 서로 다른 문서·수집 범위는 유지한다. 외부 파일 형식에 정해진 `slot.xml`, typed XML tag, MIME, 확장자는 계약으로 보존한다.
2. `sourcescript/system.py:22-44`의 구현 파일·논리 모듈 목록과 `sourcescript/portable_build/portable_build.py:19-40`의 SCRIPTS. 참고자료 목록, 논리 계층, 실제 인라인 순서는 역할이 다르다. 실행에서 소비하는 설정과 참고용 중복을 구분하여 불필요한 목록만 제거하거나 실제 모듈·파일 원천에 연결한다. 하나의 목록으로 무조건 합치지 않는다.
3. `PROJECT_OBJECT_PATHS`는 이름에서 상태 경로로의 조회 대응이다. `PUBLIC_API_METHODS`는 공개 이름에서 함수로의 연결이다. 서로 다른 관계를 담은 표의 존재 자체는 삭제 근거가 되지 않는다.
4. `RENDERER_INPUT_CONTRACT`, 형상 계산식, Plotly의 출력 필드, ZIP의 고정 방식, 명령별 조건 분기는 의미를 보존한다. 숫자·문자열이 보인다는 이유로 모두 새 상수나 레지스트리로 옮기지 않는다.

## 5. 후속 수정 순서

1. 위 항목마다 원천 정의, 그 구성원을 참조하는 사용처, 필요한 변환, 제거할 독립 복사본을 연결한다. 확인된 대상과 추가 후보의 판정을 분리해 기록한다.
2. Backend 명령 등록과 담당 함수 선택을 통합하고 네 helper의 Args를 고친다. 34개 명령의 담당 함수가 각각 하나인지 정적으로 대조한다. 기존 함수 반환형 차이는 호출 절차에 명시한다.
3. 공개 함수 연결과 Frontend 이벤트 검증 대응을 정리한다. 실제 함수 참조를 사용하고 import 방향·초기화 순환을 확인한다. import 순환이 생기면 정의 위치와 기존 구조의 통합을 먼저 검토한다.
4. 설정 범위, 도메인 허용값, 중첩 원형과 라벨 계산을 연결한다. 각 처리의 현재 값 유지·누락 보완·거부 조건을 명시한다.
5. 패키지와 빌드 후보를 판정하고, 유지할 별도 구조는 그 의미 차이를 기록한다.
6. 바뀐 Source Script와 모든 참조 사용처를 끝까지 읽고 예시 양식·자료형·인자·반환·변경·처리를 대조한다. 변수 정의에는 자료형·원형·값의 의미를 적는다. 계산은 함수의 처리에 작성한다.
7. 실제 Source Script 변경 시 revision/fingerprint와 실제 Git diff·동명 설명 문서를 함께 갱신한다. Source Script 닫힘은 근거를 별도로 평가한다. 이후 pseudocode → source code 전파 범위를 기록한다.

## 6. 유지 조건과 완료 기준

- 기존 공개 API 이름·인자 순서·파일 형식·기본값·허용값·수치 범위를 유지한다.
- 현재 소유 상태에서 참조를 확인하고 후보를 계산한다. send의 재확인·재시도·단일 initialize·반영 후 결과 계산을 유지한다.
- 명령 34개의 등록·담당 함수 관계, 공개 메서드의 기존 전체 집합, 참조 검증 세 경로를 정적으로 대조한다. 목록 길이 또는 집합 일치 검사만으로 참조 연결이 성립했다고 판정하지 않는다.
- 소비자가 원천 정의를 실제로 가리키는 경로를 확인한다. 존재하지 않는 함수·원형·필드 참조를 남기지 않는다.
- 허용값 변경의 영향이 문서 복사본에 묻히지 않는지, 문서 Args가 원소를 다시 적고 있지 않은지 대조한다.
- 정책 원문·AGENT·예시 양식과 기존 미커밋 작업을 보존한다.
- 최초 조사·계획 단계에서는 구현·계층 메타데이터를 보존했다. 후속 승인에 따른 적용은 Source Script와 그 계층 기록에 한정한다. 테스트·빌드·브라우저·checker 실행·커밋·푸시는 수행하지 않는다.

## 7. 중단 조건

서로 다른 기능 의미를 하나의 정의로 합쳐야 하거나 기존 허용값·공개 계약을 바꿔야만 진행할 수 있으면 해당 항목을 멈춘다. 충돌하는 정의·사용처·영향과 필요한 결정을 기록한다. 검사 통과만으로 설계 문제를 닫거나, 참조 추적을 위해 불필요한 새 프레임워크를 추가하지 않는다.

## 8. 적용 결과

- §3.1~3.2: PROJECT_COMMANDS의 34개 키를 실제 담당 함수에 연결했다. send는 이 등록에서 함수를 한 번 선택한다. 네 helper의 Args는 등록 원천을 참조하며 명령별 계산 분기는 각 처리에 유지한다. asset 담당 함수의 상태·순번 대응 반환과 나머지 함수의 상태 반환을 구별했다. 기존 12/8/3/11 담당 관계, 현재 참조 재확인·재시도·단일 initialize·반영 후 결과 계산을 유지했다.
- §3.3: 사용하지 않는 PUBLIC_PROJECT_MUTATION_ROUTES를 제거했다. 공개 함수의 실제 명령 전달과 공개 namespace·메서드 집합을 유지했다.
- §3.4: PUBLIC_API_METHODS의 내부 함수는 실제 함수 참조로 연결했다. 조회 operation은 Backend의 BACKEND_QUERY_KINDS 구성원을 공개 binding·요청·Backend 분기가 함께 참조한다. 실제 공개 operation 값과 위치 인자의 필드 대응을 유지했다.
- §3.5: Application의 BACKEND_REFERENCE_EVENTS가 Frontend 이벤트 등록값과 세 Backend 판정 함수를 직접 연결한다. Slot·asset·graph object 판정은 각각 validateSlotSelection·validateAssetSelection·validateGraphObjectSelection에 두었다. Backend에서 Frontend를 import하지 않는다. 실제 호출이 없는 interface-intent 등록과 그 설명은 제거하고 Application의 실제 판정 경로를 유지했다. lifecycle 전송도 INTERFACE_EVENTS의 등록값을 사용한다.
- §3.6: grid 검증은 Backend 설정 범위를 참조한다. layout.readState의 gridLimits를 통해 UI가 같은 범위를 읽으며 현재 companion·무효 입력 fallback을 유지한다. 이미지 범위도 기존 설정의 해당 필드를 참조한다. 설정 파일의 값은 변경하지 않았다.
- §3.7: graphObject·axisSettings의 허용값과 imageSettings 원형을 사용처에서 참조한다. Slot.content.imageSettings는 공통 원형을 가리킨다. 실제 허용값과 축 변환 의미를 유지했다.
- §3.8: formatSlotLabel의 번호·대소문자·괄호 계산을 실제 라벨과 ordinal 0 예시가 함께 사용한다. 슬롯 정렬과 병합 anchor 처리는 orderedSlotLabels에 유지했다.
- §4 후보 판정: FFPX_STRUCTURE·FFSX_STRUCTURE는 서로 다른 문서 역할·외부 경로 정의로 유지하고 네 writer/reader가 해당 정의를 참조한다. 사용하지 않는 system의 IMPLEMENTATION_SOURCES·SOURCE_SCRIPT_LOGICAL_HIERARCHY는 제거했다. 실제 인라인 입력 순서를 소비하는 portable build의 SCRIPTS는 유지했다. 외부 파일 형식과 필수·선택 문서 조건은 변경하지 않았다.
- 현재 Source Script 15개 Python 문서의 함수·메서드·중첩 함수는 201개다. AST로 양식 순서·내부 import·실제 함수 binding·34개 담당 관계·15개 Frontend 이벤트·공개 메서드 집합·조회 식별자 값을 정적으로 대조했다. 변경된 Source Script 13개 파일의 실제 증분 diff를 끝까지 읽고 연결과 반환 의미를 대조했다. 이 확인은 Source Script 실행이나 전체 기능의 논리적 닫힘 판정으로 사용하지 않는다.
- Source Script 52/stale/open, fingerprint `sha256:2740bd377c0f52c2ee99b32cb72eef0501e2c644656a788fe3c8aa581b095604`. pseudocode 26·source code 157과 기존 derived_from은 유지했다. 후속 계층 전파는 Source Script 닫힘 평가 이후 별도 작업이다.
- 실제 증분 기록은 `agent_space/patches/20261115-014.patch`와 동명 설명이다. 기준 tree는 `7e27e054d4e879365c90d259ce2956404899146c`이며 이전 미커밋 작업·Plan031·013 기록을 포함한다. 테스트·앱·빌드·브라우저·checker 본체·커밋·푸시는 실행하지 않았다.
