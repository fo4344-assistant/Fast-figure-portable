# review-007 — Graph/sidebar Mantine 기능 누락 감사

## 목적

`plan-005.md`와 `review-006.md` 이후 단계로 graph/sidebar의 legacy 기능을 현재 Mantine staging과 대조한다.

판정 기준은 legacy DOM 보존 여부가 아니라 사용자 기능, 파일 의미, 상태/피드백, 편집 자유도가 Mantine staging에 존재하는지다.

## Legacy graph/sidebar 기능 inventory

구형 기준본의 graph 설정 영역은 다음 기능으로 구성된다.

### 슬롯 파일/편집 모드

- FFSX 내보내기
- Plotly JSON 내보내기
- FFSX/Plotly JSON 불러오기
- imported Plotly의 `원본 JSON` / `편집 가능` 전환
  - 편집 가능 전환 시 필요하면 conversion rows를 project CSV로 생성
  - graph objects의 `csvId`를 해당 CSV로 연결
  - editable graph를 재구성
  - 원본 JSON 모드에서는 graph controls가 비활성화됨

### 그래프 전역 설정

- 범례 표시
- 타이틀 표시
- 0선 표시
- 그래프 제목
- 그래프 폰트
- 타이틀 글자 크기
- 범례 글자 크기

### 4축 설정

`xBottom`, `xTop`, `yLeft`, `yRight` 각각:

- 축 이름
- 최소/최대
- tick mode / tick 간격
- 로그축 minor tick
- notation
- linear/log/reciprocal
- 값 나누기
- 축 이름 크기
- 숫자 크기
- 축선 굵기
- 격자 표시
- 축 표시
- 값 표시

### graph object 설정

- 참조 CSV
- X/Y column
- X/Y axis side
- graph type
- legend name
- line width / dash
- marker symbol / size
- bar opacity / border width
- object 추가
- 선택
- 삭제
- drag reorder
- 개별 색상

### palette

- 기본 색상 reset
- JSON 저장
- JSON 불러오기
- load validation/status

## 현재 Mantine staging 대조

### 이미 이식 완료

- graph global layout: `20260902-004` 이후 values/read boundary와 staging
- 4축 공통 UI: `20260902-009`, sidebar wiring `011`
- selected graph object 상세 설정: `017`, wiring `018`
- object list/select/delete/reorder/color: `032` 이후
- object 추가: `034`~`038`
- palette 전체 mutation/reset/save/load: `039`~`048`

위 범위는 persisted graph/chart state를 React local source로 복제하지 않고 기존 chart/editor/EFSM command를 사용한다.

### 확인된 기능 누락 — cutover blocker

현재 Mantine staging에는 legacy graph 설정 상단의 다음 기능이 아직 이식됐다는 기록이 없다.

1. FFSX 내보내기
2. Plotly JSON 내보내기
3. FFSX/Plotly JSON 불러오기
4. `원본 JSON` / `편집 가능` 전환

이 항목들은 단순 legacy 편의 UI가 아니다.

- FFSX import/export는 `plan-005`에서 가장 강하게 보존해야 하는 파일 의미/roundtrip 범위다.
- Plotly JSON import/export는 graph interoperability 기능이다.
- editable 전환은 imported Plotly를 project CSV-backed editable model로 재구성하거나 원본 Plotly 표시로 전환하는 기능이다.

따라서 Mantine shell cutover 전에 이 네 기능을 이식해야 한다.

## 데이터 선택/피드백

selected graph object staging은 object의 `csvId`가 가리키는 project CSV로부터 X/Y column snapshot을 계산하므로 legacy 전역 `rows/columns` 또는 `#xCol/#yCol`을 source로 사용하지 않는다.

따라서 object 편집의 column selection 기능 자체는 이식 완료로 판정한다.

다만 CSV를 일반 project file selection으로 불러왔을 때의 행/열 수 status, header line 편집, active CSV selection feedback은 graph object와 별개의 sidebar 기능이다. `review-004`의 project file selection / CSV header staging을 유지하며 shell cutover 직전 통합 표시 상태를 확인한다.

## 도움말/설명

legacy X/Y column, graph type, palette에는 `?` help button과 설명이 존재한다.

이들은 domain 기능은 아니지만 사용자가 설정 의미를 이해하는 기능성 설명이다. 최종 Mantine UI에서는 별도 custom help button을 복제할 필요는 없으며 Mantine Tooltip/description 등의 공통 primitive로 이식할 수 있다.

현재 단계에서는 파일/편집 모드 기능보다 우선순위가 낮지만 cutover UI 품질 감사 대상에 남긴다.

## 다음 구현 순서

1. graph editable 전환 로직을 DOM-free command로 분리
2. legacy editable button이 공통 command를 사용하도록 변경
3. selected graph slot file/action read model 준비
4. Mantine graph file actions component 추가
5. FFSX/Plotly import용 file input adapter 연결
6. sidebar wiring
7. 파일 roundtrip 회귀 감사
8. active shell cutover 판정

## 범위 제한

다음은 이번 감사에서 변경 대상으로 보지 않는다.

- Plotly surface/trace renderer
- FFSX schema 자체
- Plotly conversion 알고리즘
- chart/editor data meaning
- graphObject EFSM

이들은 파일/UI 이식 과정에서 재사용한다.
