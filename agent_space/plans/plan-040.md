# Plan040 — 레이아웃 미리보기 보조선과 작업 영역 선택 표시 복원

## 1. 목표

1. 슬롯 외곽선 설정을 껐을 때 레이아웃 미리보기에서 각 슬롯을 구별할 수 있도록 점선 경계를 복원한다.
2. 작업 영역에서 선택한 슬롯을 분명히 알아볼 수 있도록 기존 선택 표시를 복원한다.
3. 공통 슬롯 기하·내용 표시와 각 화면의 편집 보조 표시를 함께 유지한다. 표시 변경으로 슬롯의 위치·크기·그래프·이미지가 움직이지 않아야 한다.

관련 검토: `../reviews/review-20261118-002-selection-ui.md`. Plan036의 공통 틀 도입 뒤 발생한 두 표시 누락을 다룬다.

## 2. 확인된 변경과 남은 조사

### 2.1 미리보기 점선

- 이전 `FastFigureLayoutOverlay`는 `showBorders`가 False이면 슬롯 버튼에 `borderStyle: "dashed"`를 적용했다.
- `f9dcca6ecabd2a5284a7bd7d882ea03bc29cd461`의 공통 틀 전환에서 이 분기가 제거됐다.
- 현재 `sourcecode/frontend/renderer.js:136,149-151`은 외곽선 OFF에 투명한 실선 border를 적용한다. `sourcecode/frontend/mantine_ui.js:137-160`의 미리보기 장식에는 점선이 없다.
- 조사: 외곽선 ON/OFF 각각에서 미리보기의 빈 슬롯·병합 슬롯·선택 슬롯 경계를 확인하고, 점선과 선택 테두리의 겹침 및 모서리 반경을 기록한다.

### 2.2 작업 영역 선택 표시

- `sourcecode/frontend/renderer.js:556-578,644-650`에는 선택 class 적용이 남아 있다.
- `sourcecode/Fast-figure.html:9518-9519`의 빈 슬롯 선택 border 4px가 공통 틀의 inline border 1px와 충돌한다. inline border는 같은 `f9dcca6...`에서 도입됐다.
- 그래프·이미지 슬롯의 bookmark DOM과 선택 CSS는 남아 있다. 해당 표시의 누락 여부·범위를 빈 슬롯과 나누어 조사한다.
- 조사: 빈 슬롯·그래프·이미지를 각각 선택하고 다른 슬롯으로 옮긴 뒤 해제한다. 선택 class, 실제 표시 요소, computed style, bounding box와 화면을 함께 확인한다. bookmark가 decoration으로 이동한 뒤의 stacking·overflow·클릭 영역도 대조한다.
- 마우스 hover와 선택을 구분한다. 선택 표시가 포인터를 다른 곳으로 옮긴 뒤에도 남는지 확인한다.

## 3. 책임과 유지 조건

| 대상 | 값의 소유·표시 책임 | 유지할 조건 |
|---|---|---|
| 슬롯 행·열·span·gap·margin·radius | Backend 기하 조회 → 공통 `renderDashboardFrame` | 실제 작업 영역과 미리보기는 같은 계산·배치 규칙 사용 |
| 프로젝트 슬롯 외곽선 | 기존 `layout.slotStyle.showBorders` | OFF이면 작업 영역·저장 이미지에 프로젝트 외곽선을 그리지 않음 |
| 미리보기 점선 | 레이아웃 UI의 슬롯별 장식 | 외곽선 OFF에서도 경계 식별 가능, 실제 dashboard·내보내기에 전달하지 않음 |
| 미리보기 복수 선택 | 기존 LayoutOverlay의 local selection | 작업 영역의 선택과 분리, 병합·분할·선택 해제 동작 유지 |
| 작업 영역 선택 | 기존 Frontend FSM의 `selectedSlotId` → renderer | 현재 선택에서만 표시, 중복 선택 상태·DOM 기반 선택 판정 저장 추가 없음 |
| 내용·자원 | 기존 graph/image renderer | Plotly·이미지 수명·호스트·비동기 완료 판정 유지 |

## 4. 수정 단위와 순서

### R01 — Source Script의 보조 표시 절차 보완

대상: `sourcescript/frontend/renderer.py`의 `renderDashboardFrame`·`renderDashboard`와 `sourcescript/frontend/mantine_ui.py`의 `FastFigureApp` 미리보기 처리.

1. 공통 틀에는 Backend가 제공한 기하와 프로젝트 외곽선 설정을 적용한다.
2. 미리보기 호출자는 외곽선 OFF일 때 각 슬롯 장식 영역에 점선을 그린다. ON에서는 프로젝트 외곽선을 유지한다. 미리보기의 선택·포커스 표시가 점선과 함께 구별되도록 적용 순서를 적는다.
3. 작업 영역 호출자는 현재 `selectedSlotId`로 선택 표시를 적용하고 선택 해제·대상 변경 때 이전 표시를 제거한다. 빈 슬롯의 선택 테두리와 graph/image의 기존 bookmark를 각각 설명한다.
4. 장식의 두께가 content 치수를 바꾸지 않도록 한다. 스타일 갱신·공통 틀 재사용 후에도 현재 선택 표시가 유지되도록 호출 순서를 명시한다.
5. 저장된 Source Script 예시의 Args·Return·변경·처리 형식을 따른다. 상태 정의에는 의미를, 계산·분기·갱신 순서에는 처리 절차를 사용한다.

### R02 — pseudocode 전파

대상: `pseudocode/frontend/renderer.pcal`의 공통 틀·실제 표시·선택 갱신, `pseudocode/frontend/mantine_ui.pcal`의 `RenderLayoutPreview`.

1. R01의 점선 조건, 현재 선택 입력, 이전 표시 정리와 새 표시 적용 순서를 명시한다.
2. 실제 화면과 미리보기의 각 host 장식만 변경한다. 공통 기하 계산을 복제하지 않는다.
3. 외곽선 OFF, 선택 없음, 선택 변경, 병합 슬롯 및 재렌더의 분기를 대응시킨다.

### R03 — source code 수정

대상: `sourcecode/frontend/renderer.js`, `sourcecode/frontend/mantine_ui.js`, `sourcecode/Fast-figure.html`의 해당 CSS.

1. `LayoutPreview`의 기존 장식 영역을 사용해 OFF용 점선을 복원한다. 별도 grid 구현으로 되돌리지 않는다.
2. 빈 슬롯의 선택 표시를 덮는 inline border와 CSS의 책임을 정리한다. 기본 외곽선과 선택 장식이 서로 지우지 않도록 기존 decoration 또는 치수에 영향을 주지 않는 CSS 표시를 사용한다.
3. graph/image bookmark의 실행 조사에서 확인된 누락에 한정해 위치·겹침·잘림을 수정한다. 정상인 표시와 클릭·드래그 동작은 유지한다.
4. 전체 렌더와 선택만 갱신하는 경로 모두에서 같은 선택 표시 규칙을 적용한다. 선택 class 갱신 뒤 스타일 갱신으로 표시가 사라지는 경로도 확인한다.
5. 내보내기는 프로젝트 외곽선 설정을 유지하고 편집용 점선·선택 표시를 포함하지 않는다.

## 5. 확인 시나리오와 완료 조건

각 시나리오는 기대·관찰·판정을 따로 적고, 디버그를 켜서 짧게 수행한다. 시나리오별 로그·화면을 저장한 뒤 로그를 비운다. 입력·로그는 `.work`에, 실행 대상 빌드는 프로젝트의 정상 `dist`에 둔다.

| 시나리오 | 조작 | 기대 결과 |
|---|---|---|
| V01 | 레이아웃 열기 → 외곽선 OFF | 미리보기의 모든 가시 슬롯 경계에 점선. 작업 영역의 프로젝트 외곽선은 숨김 |
| V02 | OFF에서 미리보기 슬롯 복수 선택 → 해제 | 점선 경계를 계속 식별할 수 있고 선택 표시만 추가·제거. 슬롯 치수 불변 |
| V03 | 외곽선 ON ↔ OFF | ON은 기존 실선, OFF는 미리보기 점선. 행·열·gap·margin·radius·content 크기 불변 |
| V04 | 빈 슬롯 선택 → 포인터 이동 → 다른 슬롯 선택 → 해제 | 선택 대상만 명확히 표시되고 이전 표시 제거. hover와 선택을 구별할 수 있음 |
| V05 | graph/image 슬롯 각각 선택·해제 | 기존 bookmark와 선택 표시가 보이고 클릭·이동·그래프 조작 유지. 내용 크기 불변 |
| V06 | 선택 유지 중 zoom·스타일 갱신 | 현재 선택 표시 유지. 예전 host의 장식이나 중복 표시가 남지 않음 |
| V07 | 미리보기 병합 슬롯 선택·분할 | 점선·선택 표시가 현재 span/슬롯 경계를 따름. 작업 영역 선택에는 영향 없음 |
| V08 | OFF 상태 이미지 내보내기 | 프로젝트 외곽선·미리보기 점선·편집 선택 표시가 출력되지 않음. ON 출력은 기존 외곽선 유지 |

Source Script→pseudocode→source code의 조건·입력·정리 순서 대응, 공통 기하 유지, 표시 상태 비중복을 후속 review에 기록한다. 정적 대조와 실제 실행 결과를 구분하고, 변경한 개발 계층의 fingerprint·파생 관계 및 실제 소스 patch를 기록한다.
