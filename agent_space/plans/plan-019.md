# Plan 019 — annotation settings / caption insertion / reference-width export

## 1. 요구와 선행 기준

사용자 지시: label·caption 기본 설정은 별도 config/settings 파일로 정리한다. layout 팝업의 이미지 폭(referenceWidth)을 기준으로 목표 폭/해상도에 맞춰 높이를 계산하고 render한다. slot caption 앞에 label을 붙이고 공백 하나로 구분해 기존 global caption 뒤에 추가한다. 연속한 동일 문자열 또는 뒤따르는 빈 caption은 label range로 묶고 시작부터 빈 caption은 label만 둔다. 먼저 파일 위치를 결정하고 계획 문서를 만든 다음 수정한다.

기준 main `50fe9192a3e885a7e9d69f5e51431e2ed69e2846`, Source r35 current/open. review-20261016-016-source-r35-closure.md의 C1–C3을 기존 annotation 책임 안에서 수정한다. Source→PlusCal→code 순서를 유지한다.

## 2. 파일 위치 — 수정 전에 확정

- **새 기본값 파일: `sourcescript/backend/settings/annotations.py`**. Backend layout-annotation-domain의 물리적 구성 파일이다. 별도 논리 계층/서비스/공용 mutable registry가 아니다. label·caption 초기값과 caption presentation 기본 상수를 한 곳에 정의한다. Python notation Source 의미 파일이므로 기존 recursive fingerprint 대상이다. runtime package용 __init__ bridge는 만들지 않는다.
- **계산: `sourcescript/backend/layout_annotations.py`**. label ordinal/order, caption 문자열 grouping/append, reference-width geometry의 의미를 소유한다. Backend가 persistent candidate를 계산하며 Frontend FSM/DOM을 읽지 않는다.
- **기본 project 참조: `sourcescript/backend/project_state.py`**. settings를 import하고 create/load의 missing 필드 기본값을 참조한다. 별도 복사 상수 목록을 만들지 않는다.
- **command: `sourcescript/backend/project_efsm.py`**, **wrapper: `sourcescript/application/public_api/layout_annotations.py`**. 새 입력만 전달하고 현재 authority에서 계산→검증→한 commit, 성공 read 경계를 보존한다.
- **render 측정: `sourcescript/frontend/renderer.py`**. supplied snapshot과 font 측정 primitive로 caption layout을 계산하고 reference geometry를 비례 scaling한다. Backend authority를 query하거나 DOM에서 target geometry를 역추론하지 않는다.
- `sourcescript/system.py`는 물리 placement와 남은 closure 상태만 갱신한다. 논리 hierarchy를 변경하지 않는다.
- 결과는 `agent_space/reviews/review-20261016-017-annotation-r36-open.md`, 실제 cumulative diff는 `agent_space/patches/20261016-021.patch/.md`에 둔다. 이 plan을 source보다 먼저 게시한다.

## 3. coherent 수정 순서

1. 기존 annotation 초기값을 하위 구현에서 호환 자료로 확인하고 settings의 단일 정의로 채택한다. 실제 Project의 저장 설정은 여전히 Backend authority다. valid saved 값 유지, missing은 settings default, invalid는 기존 validation/범위 규칙. 정의 파일을 사용자 project 설정과 양방향 동기화하지 않는다.
2. visible anchor slot의 label 번호는 현재 row/column order에서 전체 visible slot 기준으로 부여한다. slotIds는 대상 filter이며 번호를 다시 매기지 않는다. caption용 label은 괄호를 붙이고 연속 range는 양끝 identifier를 hyphen으로 연결한다. 정확한 문자열 비교, 시작 빈 group과 뒤따르는 빈 caption 처리를 명시한다. 기존 text는 수정/trim하지 않고 뒤에 한 separator로 append한다. 선택 대상 없음은 unchanged.
3. Backend command에서 위 문자열을 current candidate에 적용하고 전체 검증→one commit한다. wrappers는 slotIds만 보내고 postcommit 공식 read를 반환한다.
4. referenceWidth에서 dashboard natural height와 caption block을 계산한다. 목표 width/referenceWidth의 한 비율로 두 영역/typography/gap을 scaling한다. auto 높이는 합산 결과의 ceil; explicit total height는 유지하고 caption 영역을 뺀 dashboard가 유효한지 검사한다. target pixel width에 DPI를 다시 곱하지 않는다. DPI는 기존 metadata 의미를 유지한다. 실제 물리 크기→pixel 변환 입력이 추가되는 경우 별도 상위 계약이 필요하며 이번에는 추가하지 않는다.
5. 정적 시나리오와 Source 의미/fingerprint/revision36을 기록한다. closure는 자동으로 닫지 않는다. 하위 stale 유지. 모든 실행 검증은 기존 허가 범위의 GitHub Actions cumulative version checker로 수행하며 로컬 Source/application/test/checker/build/TLC 실행은 하지 않는다.

## 4. 확인 시나리오

- fresh/create/load missing vs valid saved settings, 읽기에서 초기 state mutation 없음.
- a=A,b=B → `(a) A (b) B`; a=A,b=A 및 a=A,b=empty → `(a-b) A`.
- a=empty,b=B → `(a) (b) B`; a=empty,b=empty → `(a-b)`; a=A,b=B,c=A는 합치지 않는다.
- 대소문자/공백이 다른 text는 서로 다른 내용. hidden/merged covered 제외, column-major/filtered 대상의 실제 번호 보존, non-consecutive label을 range로 묶지 않는다.
- empty global text/기존 trailing space 보존/반복 호출 append/no target unchanged; disabled labels여도 caption label 생성.
- width=referenceWidth와 2배에서 동일한 비율, DPI만 변경 시 pixel geometry 불변, caption disabled/empty/multiline, explicit height 부족, raster limit, 실패 시 Project 불변.

## 5. 기각·제외·기록

root config나 Frontend settings authority는 annotation 소유 영역을 흐리고 runtime state와 중복되므로 기각한다. callback/mirror/legacy bridge, wrapper별 독립 문자열 조합도 만들지 않는다. lower JS의 기본값은 사용자 지시와 기존 기능 보존을 위한 근거로만 채택하며 하위 코드를 자동 설계 권위로 삼지 않는다.

하위 JS/PlusCal/model/tests/dist 변경, 전체 closure 선언, 실제 시각/roundtrip 실행은 제외한다. Contents API는 HEAD/blob/new path를 순차 확인하며 multi-file atomic commit이 아니다. 최종 patch는 이 기준부터 semantic endpoint까지 실제 누적 diff이며 pair는 endpoint 후 별도 게시한다. intermediate source-before-metadata push 실패와 최종 cumulative Actions 결과를 구별해 기록한다.
