# 선택 상태에 따라 달라지는 UI

## 1. 검토 기준

- 기준 commit: `da28814cdfb5dab33d94b234f1c4a7f9f5405bba`.
- `sourcecode/frontend/mantine_ui.js` 전체 1–3282행과 연결된 renderer·CSS를 정적으로 확인했다. 아래 표는 현재 구현의 표시 조건과 결과를 정리한다. 각 동작의 UX 적절성이나 브라우저 실행 성공을 판정한 표가 아니다.
- 단순 강조색·배경색 전환은 제외했다. 글자 변경, 영역 표시·숨김, 입력 대상 변경, 사용 가능 여부 변경을 포함했다.
- CSV 선택이 초기화되는 시점·원인은 조사하지 않았다. 슬롯 선택 시 사이드바를 다시 구성한다는 가설도 이 문서에서는 판정하지 않는다.

## 2. 슬롯 선택에 따라 달라지는 사이드바

| 번호 | 선택 상태 | 화면에서 달라지는 부분 | 구현 근거 |
|---|---|---|---|
| S01 | 슬롯 미선택 → 슬롯 선택 | 데이터 영역에 `그래프`·`이미지` 전환 버튼과 `선택 슬롯 초기화` 버튼이 나타난다. 미선택이면 이 버튼들을 숨긴다. | `sourcecode/frontend/mantine_ui.js:374-385,451-479,523-537` |
| S02 | 이미지 슬롯 선택 | 이미지 편집 영역을 표시한다. 이미지가 있으면 썸네일, 없으면 `이미지를 추가하거나 프로젝트 이미지 에셋을 연결하세요.` 안내를 표시한다. 그래프 슬롯·미선택에서는 이미지 편집 영역을 숨긴다. | `sourcecode/frontend/mantine_ui.js:554-612` |
| S03 | 그래프 슬롯 선택 | `그래프 / 데이터` 영역을 표시한다. CSV 선택, 헤더 행 수, 표, 오브젝트 목록과 편집을 이 영역에 구성한다. 이미지 슬롯·미선택이면 이 영역의 내용을 숨긴다. | `sourcecode/frontend/mantine_ui.js:1408-1599` |
| S04 | 그래프 슬롯 선택 및 chart 존재 | 그래프 제목·전역 옵션·축 편집 내용을 표시한다. 그래프 workspace가 아니거나 editor가 없으면 내용을 숨긴다. | `sourcecode/frontend/mantine_ui.js:1600-1803` |
| S05 | 그래프 슬롯 선택 | 그래프 팔레트와 FFSX/Plotly JSON 파일 영역을 표시한다. 다른 workspace에서는 숨긴다. chart 존재·편집 가능 상태에 따라 팔레트 동작을 활성화한다. | `sourcecode/frontend/mantine_ui.js:1804-1965` |
| S06 | 선택 슬롯 변경 | `/slots` 목록은 각 슬롯의 행·열과 연결 에셋 정보를 표시한다. 선택에 따른 색 변경 외에 슬롯 선택만으로 행 문구를 다른 문구로 바꾸는 분기는 없다. 연결 에셋이 바뀌면 설명이 갱신된다. | `sourcecode/frontend/mantine_ui.js:1036-1043,1302-1333` |

사이드바 구성 함수는 데이터·이미지·트리·프로젝트·그래프 편집 등을 같은 순서로 배치한다. 개별 편집 함수의 workspace 조건이 내용 표시를 결정한다. `오브젝트 설정`·`전역 설정`의 접기 제목은 Shell에 남고, 안쪽 편집 내용이 위 조건에 따라 사라질 수 있다. 이 구조 확인으로 CSV 선택 초기화 원인이나 실제 component 재마운트를 판정하지 않는다. 근거: `sourcecode/frontend/mantine_ui.js:3150-3170`.

## 3. 토글에 따라 버튼 글자가 바뀌는 동작

| 번호 | 버튼·조건 | 실제 문구 변화 | 함께 바뀌는 UI | 구현 근거 |
|---|---|---|---|---|
| T01 | 그래프 편집 가능 상태 | editable=true: `편집 가능`; false: `원본 JSON` | 오브젝트 추가·변경 가능 여부와 세부 편집 영역이 달라진다. | `sourcecode/frontend/mantine_ui.js:1501-1510,1556-1597` |
| T02 | 선형·역수 축의 tick 방식 | `Plotly tick` ↔ `increment` | tick 방식 설정을 전환한다. | `sourcecode/frontend/mantine_ui.js:1651-1702` |
| T03 | 로그 축의 minor tick | false: `minor tick 숨김`; true: `minor tick 표시` | 같은 위치의 버튼 역할이 minor tick 토글로 바뀌고, tick 간격 입력은 숨긴다. | `sourcecode/frontend/mantine_ui.js:1651-1702` |
| T04 | 레이블 enabled | true: `레이블 표시`; false: `레이블 숨김` | 실제 레이블 표시 여부가 바뀐다. 설정 입력과 위치 미리보기는 계속 구성된다. | `sourcecode/frontend/mantine_ui.js:2304-2516` |
| T05 | 캡션 enabled | true: `캡션 표시`; false: `캡션 숨김` | 실제 캡션 표시 여부가 바뀐다. 캡션 편집 입력은 유지된다. | `sourcecode/frontend/mantine_ui.js:2518-2561` |
| T06 | 크기 고정 | locked=true: `크기 고정`; false: `크기 고정 해제` | 고정 상태이면 확대 비율 입력을 비활성화한다. | `sourcecode/frontend/mantine_ui.js:2951-2974` |
| T07 | 디버그 enabled | true: `디버깅 끄기`; false: `디버깅 켜기` | 로그 출력 영역을 표시·숨김 처리한다. | `sourcecode/frontend/mantine_ui.js:2075-2143` |
| T08 | 사이드바 접힘 | 접힘: `사이드바 표시`; 펼침: `사이드바 숨기기` | 사이드바와 작업 영역의 사용 폭이 달라진다. | `sourcecode/frontend/mantine_ui.js:3071-3136` |
| T09 | 트리 폴더·`/slots` 펼침 | 펼침 `▾`, 접힘 `▸` | 해당 하위 목록을 표시·숨김 처리한다. 폴더 이름 자체는 유지된다. | `sourcecode/frontend/mantine_ui.js:837-955,1288-1333` |

T01·T03·T04·T05·T06은 현재 상태를 적고, T07·T08은 누르면 수행할 동작을 적는다. 문구 방식이 섞여 있다는 사실을 기록하며, 이 문서에서 변경 방향을 결정하지 않는다.

## 4. 그 밖의 선택·설정 상태에 따른 글자·UI 변경

| 번호 | 조건·조작 | 바뀌는 내용 | 구현 근거 |
|---|---|---|---|
| O01 | 슬롯 선택·해제 | 툴바 안내가 `빈 슬롯 또는 그래프를 선택하세요.` ↔ `선택한 슬롯: N행 M열`로 바뀐다. | `sourcecode/frontend/mantine_ui.js:240-244,346-371` |
| O02 | 레이아웃·레이블·캡션·프린트·README 버튼 | 해당 창을 열거나 닫는다. 툴바 버튼의 글자는 유지된다. | `sourcecode/frontend/mantine_ui.js:247-249,346-371,2058-2073,2146-2167` |
| O03 | 접기 그룹 제목 | 글자는 유지하면서 내용을 표시·숨김 처리한다. `aria-expanded`·연결된 내용 상태가 바뀌며, 내부 포커스가 있으면 닫을 때 제목으로 옮긴다. | `sourcecode/frontend/mantine_ui.js:124-135,1777-1778,3158-3165` |
| O04 | 이미지 맞춤=`수동` | 크기·X·Y 입력을 추가로 표시한다. `맞춰 넣기`·`채우기`에서는 숨긴다. | `sourcecode/frontend/mantine_ui.js:601-649` |
| O05 | CSV 선택·변경 | `사용할 CSV` 값, 헤더 행 수, 열 제목·표 내용이 달라진다. CSV가 없으면 헤더·표를 숨기고 오브젝트 추가를 비활성화한다. | `sourcecode/frontend/mantine_ui.js:1419-1510` |
| O06 | 그래프 오브젝트 선택·해제 | 선택 오브젝트의 CSV·X/Y 열·축 위치·종류별 편집 내용을 표시하거나 숨긴다. 표시 조건은 `selected && activeCsv && editable`이다. | `sourcecode/frontend/mantine_ui.js:1556-1597` |
| O07 | 오브젝트 유형 선택 | 선 계열은 선 굵기·스타일, 마커 계열은 마커·크기, 막대는 불투명도·테두리 입력을 표시한다. | `sourcecode/frontend/mantine_ui.js:1568-1597` |
| O08 | 다른 chart·오브젝트 내용 표시 | 목록에 순번·그래프 제목·범례 이름을 표시한다. 범례 이름이 비면 X·Y 열 식별자를 사용한다. 제목이 비면 제목 부분을 생략한다. | `sourcecode/frontend/mantine_ui.js:1531-1541` |
| O09 | 휴지통 디렉터리 선택 | `휴지통 비우기` 버튼을 표시한다. 항목이 없으면 비활성화한다. 참조 유무에 따라 확인 문구가 달라진다. | `sourcecode/frontend/mantine_ui.js:714-727,1145-1187` |
| O10 | 트리 항목 종류·이동 가능·휴지통 여부 | 파일 메뉴에는 다운로드, 이동 가능한 항목에는 이동, 휴지통 밖 이동 가능 항목에는 휴지통 이동을 제공한다. 삭제 확인 문구도 CSV와 이미지의 참조 대상에 맞게 달라진다. | `sourcecode/frontend/mantine_ui.js:961-1034,501-519` |
| O11 | 파일 충돌·이동 충돌 확인 | 충돌 종류에 따라 창 제목·안내·교체 버튼 유무가 달라진다. 이동 확인은 충돌이면 `새 이름으로 이동`, 그 외에는 `이동`이다. | `sourcecode/frontend/mantine_ui.js:263-332,1237-1283` |
| O12 | 캡션 편집 대상 global/slot | `대상: 전체 캡션` ↔ 선택 슬롯 행·열/선택 안내, 내용·placeholder·수정 대상이 바뀐다. 슬롯 모드에서는 전체 캡션 이름·굵게 입력을 비활성화한다. | `sourcecode/frontend/mantine_ui.js:2518-2626` |
| O13 | 레이아웃 미리보기 슬롯 선택 | 좌표 문구는 유지한다. 선택 개수에 따라 합치기(2개 이상)·나누기/해제(1개 이상) 버튼을 활성화한다. 선택 표시에는 색과 inset 테두리를 사용한다. | `sourcecode/frontend/mantine_ui.js:137-160,2833-2850,3007-3038` |
| O14 | 글꼴 선택값이 기본 선택지에 없음 | `기존: {값}` 선택지를 추가해 현재 값을 표시한다. | `sourcecode/frontend/mantine_ui.js:163-188` |
| O15 | 선택 에셋 종류·삭제 가능 대상·chart 존재 | 삭제·다운로드·팔레트 등의 사용 가능 여부가 달라진다. 실제 `disabled` 조건도 바뀐다. 별도의 busy 조건은 lifecycle에 따른 사용 제한이다. | `sourcecode/frontend/mantine_ui.js:374-385,487-504,1804-1901` |
| O16 | 프린트 세로 값 비움·값 입력 | 자동 높이와 지정 높이를 전환하고 저장된 모드에 맞는 세로 값을 표시한다. | `sourcecode/frontend/mantine_ui.js:2660-2777` |

범례·제목·격자·축·값·괄호·이름 굵게·슬롯 외곽선처럼 버튼 글자는 고정이고 버튼 자체는 색만 바뀌는 경우를 §3의 문구 전환 항목으로 세지 않았다. 그 조작으로 바뀌는 실제 표시나 입력은 위의 관련 항목과 구분한다.

## 5. 작업 영역의 선택 표시와 미리보기 보조선

### 5.1 레이아웃 미리보기 외곽선 OFF의 점선

- 이전 구현은 `style.showBorders ? "solid" : "dashed"`로 미리보기 슬롯 경계를 그렸다.
- commit `f9dcca6ecabd2a5284a7bd7d882ea03bc29cd461`(2026-11-17, Plan036)의 UI diff에서 이 분기가 제거되고 공통 `renderDashboardFrame` 호출로 교체됐다.
- 현재 공통 틀은 OFF일 때 `--slot-border-color=transparent`와 `1px solid`를 적용한다. 미리보기 호출부에는 OFF용 점선을 더하는 절차가 없다. 정적으로 소실 경로가 확인된다.
- 근거: `sourcecode/frontend/renderer.js:124-157`, `sourcecode/frontend/mantine_ui.js:137-160`; 해당 commit의 두 파일 native diff.

### 5.2 작업 영역의 슬롯 선택 표시

- 현재도 선택 시 `.selected` class를 적용한다. class 자체가 삭제된 상태는 아니다. 근거: `sourcecode/frontend/renderer.js:556-578,644-650`.
- 빈 슬롯의 기존 CSS는 `.slot.empty.selected { border: 4px solid var(--ui-color); }`다. 공통 틀이 모든 슬롯에 쓰는 inline `border: 1px solid ...`가 이 규칙보다 우선한다. 이 충돌은 같은 `f9dcca6...`에서 추가됐다. 근거: `sourcecode/Fast-figure.html:9512-9519`, `sourcecode/frontend/renderer.js:149-151` 및 blame.
- 그래프·이미지 슬롯에는 선택 이동용 bookmark 버튼과 `.slot.selected .slot-tab-shape` 규칙이 남아 있다. 빈 슬롯의 테두리 문제를 근거로 이 표시까지 모두 없어졌다고 판정하지 않는다. 새 decoration 구조에서의 위치·겹침·잘림은 실행 조사 대상으로 남긴다. 근거: `sourcecode/frontend/renderer.js:693-699`, `sourcecode/Fast-figure.html:9580-9618`.

후속 조사·수정과 확인 항목은 `../plans/plan-040.md`에 정리한다. 이 검토에서는 브라우저 실행과 코드 수정을 하지 않았다.
