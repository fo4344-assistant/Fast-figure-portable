# Plan045 — 조회 목적에 맞는 API 계약과 UI 호출 수정

## 1. 목표

목록·선택·숫자 표시가 필요한 정보만 조회하도록 Backend API의 입력·반환·계산 범위와 UI 호출을 함께 수정한다. 자산 트리, 편집기 전체 조회, 공통 입력의 연결을 정리하여 작은 조작에서 전체 CSV·이미지 본문 처리와 반복 조회가 발생하는 경로를 제거한다.

- 기준 커밋: `b385fb392443d090e47f39ebf3cff0c0acc2d4d5`
- 사건: [기본 편집의 심각한 지연](../history/20261118-001.md)
- 조사: [처리 경로와 최적화 연구](../research/20261118-001.md)
- 보존할 작업공간 규칙: [Plan044](plan-044.md)

이 계획의 우선 수정 대상은 조회 API와 소비자다. 명령 내부의 전체 프로젝트 복사·검증·변경 결과 비교 비용은 별도 항목으로 구분하여 남긴다. 조회 개선만으로 전체 지연이 해결되었다고 판정하지 않는다.

## 2. 현재 계약에서 수정할 부분

| 위치 | 현재 연결 | 수정할 책임 |
|---|---|---|
| `sourcecode/backend/project_state.js:315-345,429-434` | 트리 구성 시 자산 본문을 복사하고 휴지통 조회도 전체 트리 구성 | 표시 메타데이터만 구성. 휴지통은 대상 경로의 항목만 처리 |
| `sourcecode/backend/project_state.js:418` | 삭제 대상 조회가 전체 자산을 반환 | 삭제 확인에 필요한 식별자·이름·참조 정보만 반환 |
| `sourcecode/backend/project_state.js:453-468` | graph 편집 조회가 chart 전체·CSV 전체·열 계산을 함께 수행 | 편집 값, 열 선택, 표 미리보기의 입력·계산·결과를 구분 |
| `sourcecode/frontend/mantine_ui.js:937-1041` | 휴지통·트리의 각 badge에서 삭제 대상 재조회 | 목록 작업에 필요한 참조 수를 Backend가 한 번 구성하여 제공 |
| `sourcecode/frontend/mantine_ui.js:1636-1638,2031-2033` | CSV 선택 목록·색상 버튼에도 큰 트리·graph 조회 사용 | 목록·현재 chart 식별 정보 전용 계약으로 전환 |
| `sourcecode/frontend/mantine_ui.js:213-293` | readTarget/readValue와 갱신 구독에서 큰 조회 반복 | 하나의 입력 판정에 현재 식별자·값·필요한 동반 값만 조회 |
| `sourcecode/backend/project_state.js:697-704` | 결과 전체 복사와 공유 자식 재귀 방문 | 필요한 결과부터 분리 생성하고 호출 내부에서 중복 방문 방지 |

현재 Source Script에도 tree의 asset 전체 copy와 graph 전체 편집 조회가 명시되어 있다. Source Script에서 계약을 수정하고 pseudocode와 source code를 순서대로 갱신한다.

## 3. 조회 계약

### 3.1 모든 조회에 적용할 규칙

1. 입력에는 명시적인 식별자와 해당 조회에 필요한 인수만 받는다. Application이 소유한 현재 선택은 Application에서 읽어 전달한다.
2. Backend는 호출 시작 시 현재 activeProject를 정하고 그 조회를 같은 프로젝트에서 끝낸다. 반환값에 Backend의 가변 객체를 노출하지 않는다.
3. 반환 필드와 처리량을 함께 명시한다. 각 계약에 CSV 행 순회, 원본 bytes 복사, figure 계산의 허용 여부를 적는다.
4. 값이 없는 경우의 None·빈 목록, 잘못된 식별자·범위의 오류, slotId 0, chart의 유일한 소유 슬롯, 독립 CSV 선택을 구분한다.
5. UI가 표시 결과를 수정 명령의 원본으로 되돌려 보내는 경로를 만들지 않는다. 변경 시 식별자와 새 입력만 보내며 Backend 명령이 현재 대상을 재검증한다.
6. 공개 이름·인수·반환 형상이 바뀌는 조회는 전체 호출자를 같은 수정 단위에서 전환한다. 사용처가 사라진 전체 조회·helper·binding은 정리한다.

### 3.2 자산 트리·목록·휴지통

기존 `assets.readTree`와 `assets.readTrash`의 표시 계약을 수정한다.

- 트리 노드는 kind/id/path/name/계층과 기존 표시 순서를 제공한다. CSV rows·원본 bytes·이미지 bytes를 포함하지 않는다.
- CSV의 행 수·읽기 가능 상태처럼 실제 표시하는 값은 필요한 필드만 반환한다. 행 수는 현재 배열 길이 등 기존 소유 값에서 구한다. 이 표시를 위해 전체 셀을 복사하지 않는다.
- badge가 필요한 참조 수는 해당 목록 조회에서 함께 제공한다. Backend가 현재 slot/chart의 참조를 한 번 수집한 뒤 항목에 배분한다. asset별로 전체 참조 수집을 다시 실행하지 않는다.
- 휴지통은 subtree의 표시 항목·비어 있는지·비우기 확인용 참조 수를 제공한다. 휴지통 밖의 자산 본문을 먼저 구성하지 않는다.
- CSV 선택 목록은 id/path/name만 필요하다. 목록 API의 kind 필터 또는 같은 메타데이터 계약의 필요한 범위로 제공한다. 그래프·슬롯 표시가 필요한 소비자는 기존 해당 소유 조회를 사용한다.
- `assets.readDeletionTarget(path)`는 삭제 확인에 필요한 kind/id/path/name·참조 수·실제 사용하는 소유 참조만 제공한다. 생성 성공 반환 등 이 조회를 사용하는 wrapper도 함께 대조한다.
- 다운로드·내보내기의 원본 bytes는 기존 명시적 파일 작업에서만 가져온다. 목록 결과와 연결하기 위한 전체 asset 사본은 보관하지 않는다.

트리의 참조 수 집계와 결과 구성은 한 호출 내부의 계산이다. 다음 호출이나 다른 UI의 공용 원천으로 유지하지 않는다.

### 3.3 그래프 편집·열 선택·표 미리보기

아래 세 목적을 분리한다. 새 공개 이름이 필요한 경우 Source Script의 실제 소비자와 함께 확정하며 기존 계약을 동시에 전환한다.

| 목적 | 필요한 결과 | 허용할 데이터 처리 |
|---|---|---|
| 편집 대상·값 표시 | slot/chart id, editable, title, 선택 object index, 실제 편집하는 object 설정, 선택 CSV의 id/path/name/headerLines/rowCount | 편집 필드와 목록 크기에 비례. chart.graph·imported figure·CSV rows/bytes 복사와 열 계산 생략 |
| 열 선택 옵션 | 명시된 CSV id의 column id/index/label | 기존 열 정의 알고리즘에 필요한 행 검사만 수행. 원본 행·bytes·chart 전체를 반환하지 않음 |
| 표 미리보기 | CSV id, 요청 시작 행·개수, 총 행 수·헤더 정보·표시 셀 | 실제 표시 범위만 복사. 현재 UI의 첫 30행을 유지하고 요청 범위를 검증 |

- 현재 CSV는 기존 독립 asset 선택에서 resolve한다. object의 CSV는 그 object의 열 선택에서 별도로 resolve한다. 두 의미를 보존한다.
- `graphs.readLayout`은 title/global/axis 설정에 필요한 필드만 유지한다. 숫자 입력 한 값 때문에 graph 데이터 조회로 돌아가지 않는다.
- 편집 가능 상태·현재 chart 유무만 필요한 버튼은 편집 대상·값 조회를 사용한다. 색상 값은 기존 palette 조회로 읽는다.
- 열 옵션은 실제 열 선택 UI에서 요청하고, 표 데이터는 실제 미리보기에서 요청한다. 숫자 입력·준비 상태·대상 식별 조회에서는 두 계산을 호출하지 않는다.
- 기존 column id, 중복·빈 헤더 처리, ragged row, headerLines 범위, 변환 보기·원본 JSON 의미를 유지한다. 열 계산의 재사용은 같은 조회 내부에서만 수행한다.
- 파일 출력·선택 슬롯 figure 계산은 Plan044의 독립 조회를 유지한다. 편집기 표시 때문에 그 경로를 호출하지 않는다.

### 3.4 공통 입력에 제공할 값

입력마다 임의의 범용 프로젝트 경로를 해석하는 API를 만들지 않는다. 기존 기능군의 읽기 계약에서 필요한 설정만 제공한다.

| 기능군 | 현재 대상과 읽을 값 | 함께 분리할 큰 데이터 |
|---|---|---|
| CSV 헤더·graph object | CSV id/headerLines/rowCount, slot/chart/object index와 해당 설정 | 전체 CSV·chart·열·표 미리보기 |
| graph 축·전역 설정 | 소유 chart id와 현재 axis/global 필드 | figure·데이터·CSV |
| image 설정 | slot/image id와 slot-local 설정 | image bytes·display URL 생성 |
| labels·caption | 현재 편집 범위와 해당 설정, 위치 변경에 필요한 x/y | caption 전체 본문·불필요한 renderer 입력 |
| print | width/heightMode/height/dpi/format | 파일 snapshot·figure |
| grid·style·zoom | rows/cols/기존 한계·style, Frontend 소유 확대 값 | visibleSlots 표시 목록·assetDisplay·미리보기 geometry |

기존 API가 큰 표시 자료도 제공한다면 설정용 읽기를 분리한다. 기능군 단위의 명시적 계약을 사용하며, 54개 입력에 중복 getter 목록이나 별도 원천 등록 체계를 추가하지 않는다.

## 4. UI 호출과 구독

### 현재 입력 판정

- UiCommand의 대상 확인·현재 값 확인을 한 판정 작업의 읽기로 묶는다. 그 읽기는 식별자·값·필요한 동반 값만 반환한다.
- render 중 표시, Enter/blur 확정, 비동기 완료 후 표시 복원은 각각 현재 값을 읽는 별도 작업이다. 이전 render 결과를 다음 명령의 원본으로 재사용하지 않는다.
- 실제 invoke 직전에 대상·lifecycle·동반 값과 기존 범위를 확인하고 기존 공개 변경 API로 전달한다. Enter 이후 blur 중복 실행, 동일 값 no-op, IME·Escape·선택 변경·unmount·원래 오류 전파를 유지한다.
- labels x/y와 grid rows/cols의 동반 값도 해당 판정의 좁은 공식 읽기에서 가져온다. image 설정 입력에서 bytes를 읽지 않는다.

### 관련 값의 갱신

- 공통 입력의 구독은 ready·현재 식별자·해당 값의 변화로 제한한다. 전체 revision 통지는 유지할 수 있지만 매 통지에서 큰 편집 조회를 실행하지 않는다.
- React snapshot에는 해당 입력의 고정된 primitive 필드 조합 등 동일 값일 때 안정된 결과를 사용한다. 매 getSnapshot마다 새 객체를 만드는 구현을 피한다.
- 비교를 위해 가진 값은 해당 구독의 변경 판단에만 사용한다. 명령·다른 UI·다음 Backend 조회의 원천으로 배포하지 않는다. 별도 프로젝트 복제본·갱신 registry를 추가하지 않는다.
- tree/graph editor/overlay도 필요한 읽기를 각자의 표시 작업에서 실행한다. 한 기능의 임시 결과를 다른 기능의 공용 데이터로 돌리는 연결을 만들지 않는다.
- 접힌 영역의 mount·focus·편집 상태는 이번 API 수정에서 임의로 바꾸지 않는다. Mantine 재사용과 기존 control 외형을 보존하며 새로운 자체 control을 추가하지 않는다.

## 5. Backend 결과 생성과 변경 경로

- 메타데이터·설정 조회는 authoritative 값에서 필요한 필드만 새 읽기 결과로 구성한다. 큰 객체 전체를 먼저 복사한 뒤 필드를 버리는 구현을 제거한다.
- 반환 격리를 유지한다. 동일한 반환 객체 그래프를 처리하는 방문 집합은 한 호출에서만 사용하고 공유 자식의 중복 freeze를 방지한다. 원본을 freeze하거나 원본 buffer를 transfer하지 않는다.
- 기존 deep copy 제거 여부는 필드별로 판단한다. 새 결과에 넣은 가변 하위 객체가 원본과 공유되지 않는지 확인한다.
- 실제 명령의 후보 정규화·전체 검증·현재 원본 재검사·한 번의 commit·실제 변경 결과·Frontend 참조 보정은 유지한다.
- 명령 성공 뒤 wrapper가 반환하는 값도 실제 소비 목적과 대조한다. 작은 성공 확인을 위해 전체 편집·export snapshot을 새로 만드는 경로는 반환 계약부터 수정한다. 필요한 전체 파일 작업은 별도 유지한다.
- 후보의 중복 전체 복사·검증과 PRE/POST 비교는 연구의 P4–P5로 분리하여 추적한다. 이번 조회 계약 변경에 검증 생략을 섞지 않는다.

## 6. 수정 순서와 파일 단위

| 순서 | 작업 단위 | 주요 대상 | 완료 산출물 |
|---|---|---|---|
| R01 | 소비자별 조회 계약 확정 | `sourcescript/backend/project_state.py`, `sourcescript/application/public_api/` | 입력·필드·없는 대상·허용 계산·기존 호출자 전환 표 |
| R02 | Backend 계산 절차와 Application 연결 | 같은 Source Script, `sourcescript/application/adapter.py` | 필요한 값부터 resolve, 한 current project 읽기, 명시적 공개 binding |
| R03 | 전체 UI 호출 전환 | `sourcescript/frontend/mantine_ui.py` | tree/badge/trash/CSV 목록/editor/미리보기/숫자/버튼/구독의 직접 연결 |
| R04 | pseudocode 번역 | 위 모듈의 `pseudocode/` 대응 파일 | 반환 구성 전에 범위 선택, 호출·실패·현재성·반환 격리 명시 |
| R05 | source code 구현 | `sourcecode/backend/project_state.js`, `sourcecode/application/public_api/`, `sourcecode/application/adapter.js`, `sourcecode/frontend/mantine_ui.js` | 기존 큰 조회와 호출자·중복 helper를 함께 교체 |
| R06 | 정합성·처리량 대조 | 해당 단계의 새 review·실제 native patch·계층 metadata | 각 소비자의 반환량·조회 횟수·행 순회·복사와 보존 규칙의 근거 |

R01–R03은 자산 표시, graph 편집, 공통 입력의 책임 단위별로 계약·생산자·소비자를 함께 닫는다. 사용처 없는 신규 API를 미리 대량 추가하지 않는다. Source Script는 저장된 예시의 Args/Return/변경/처리 양식을 따르고 계산은 절차에 명시한다.

기존 공개 API의 큰 반환에 의존하는 경로는 검색한 모든 호출자를 표로 기록하여 전환한다. 외부 사용 계약이 확인되지 않으면 변경되는 필드와 대체 경로를 명시하고 해결되지 않은 의미를 기록한다. 전체 조회로 되돌아가는 숨은 fallback은 두지 않는다.

## 7. 확인 기준

### 정적 계약·호출 확인

1. 목록·참조 badge·삭제 확인의 반환에 rows/bytes/chart 본문이 없고, 실행 경로도 그것을 복사하지 않는다.
2. 휴지통이 비어 있을 때 전체 VFS와 CSV 본문을 구성하지 않는다. badge 처리가 항목별 전체 참조 순회를 반복하지 않는다.
3. 공통 입력의 대상·현재 값·ready 확인에서 graph 데이터·열·표·image bytes·layout preview를 계산하지 않는다.
4. 편집용 열 옵션과 표 미리보기의 호출자는 명시적이다. 미리보기는 요청 행 범위만 복사한다.
5. 기존 API의 모든 호출자를 새 계약과 대조한다. 작은 명령 결과를 얻는 후속 읽기에도 큰 조회가 남지 않는다.
6. 같은 값의 React snapshot이 안정적이고 lexical 입력·target 변경·비동기 실패 정리가 기존 의미를 유지한다.
7. 조회는 Project를 변경하지 않는다. 반환된 가변 객체 수정이 원본에 영향을 주지 않는다. command는 현재 소유자에서 대상을 다시 검증한다.
8. 자동 내용 갱신은 선택 슬롯 하나, 전체 갱신은 명시 버튼, 이동·크기 변경은 CSS 변환이라는 Plan044 경로를 유지한다.

### 후속 실행 확인

같은 프로젝트의 작은/큰 CSV를 사용해 디렉터리 선택, 슬롯 선택·해제, object 선택, 숫자 한 값 표시·확정, 축 설정 변경, 휴지통 열기, 표 미리보기, 전체 렌더링, 파일 출력을 짧은 독립 작업으로 비교한다.

- query별 호출 수, 반환 필드·행·bytes 크기, 행 검사·clone/freeze 방문 수를 기록한다. CSV 크기를 늘려도 목록·숫자 확인이 본문을 복사하지 않는지 확인한다.
- 입력→명령→listener→React→선택 Plotly 완료와 import lifecycle을 구분해 시간을 기록한다. 조작 사이의 로그 간격을 CPU 시간으로 사용하지 않는다.
- debug ON으로 작업별 로그를 저장하고 비운다. 입력·프로파일은 `.work`에, 배포물은 정상 프로젝트 `dist`에 둔다.
- slotId 0, 없는 선택, 취소·no-op·오류, 공유 CSV, object 이동·삭제, 독립 CSV 선택, 원본 JSON, image, 패키지 roundtrip을 확인한다.
- 측정 전후의 처리량과 사용자 응답시간을 함께 제시한다. 정적 계약 확인과 실제 실행 결과를 구분한다.

## 8. 완료 조건

소비자별 API 계약과 모든 호출자 전환이 Source Script → pseudocode → source code에 일치하고, 목록·설정 표시에서 불필요한 본문 처리 경로가 제거되어야 한다. 기존 소유권·검증·선택·입력·파일·렌더링 규칙을 보존한 근거와 실제 측정의 범위를 후속 review에 기록한다. 남은 명령 내부 비용과 미측정 항목을 분리하여 보고한다.
