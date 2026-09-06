# review-005 — 20260902 Mantine staging / core rollback 감사

## 범위

`review-004` 이후의 `20260902-001`부터 `20260902-011`까지를 검토했다.

검토 목적은 “Mantine 전환에 반드시 필요한가”가 아니라 다음 기준으로 기존 변경의 유지/롤백 필요성을 판정하는 것이다.

1. UI 규격, UI FSM, presentation lifecycle을 Mantine 또는 공통 UI 경계로 중앙화하는 변경인가
2. 기존에 분산되어 있던 동일 기능/규칙을 하나의 공통 command/helper/component로 합친 변경인가
3. Mantine와 독립적인 변경이라도 명백한 correctness 문제를 고치며 기능 자유도와 의미를 보존하는가
4. 위 범주와 무관하게 EFSM, domain model, renderer/algorithm, import/export 의미를 바꾼 변경이 있는가
5. snapshot/draft/cache/adapter-local value가 새로운 source of truth로 승격되었는가
6. 롤백 단위와 설명이 충분히 분리되어 있는가

## 결론

현재 적용된 `20260902` 패치 중 즉시 롤백해야 할 항목은 발견하지 못했다.

- `20260902-001`: read selector가 image domain state를 변경하던 문제를 교정한 correctness patch — **유지**
- `20260902-002`: 위 교정의 실제 적용 기록 — **유지**
- `20260902-003`, `004`: apply 실패 기록으로 HTML에는 적용되지 않음 — **기록 유지, 롤백 대상 아님**
- `20260902-005`: graph layout DOM read와 기능 적용을 values 경계로 분리 — **유지**
- `20260902-006`: patch 형식 오류로 미적용 — **기록 유지**
- `20260902-007`: graph global layout Mantine staging + stale-write guard — **유지**
- `20260902-008`: apply 실패 기록 — **기록 유지**
- `20260902-009`: 네 graph axis UI의 공통 component staging — **유지**
- `20260902-010`: sidebar wiring 시도 실패 기록 — **기록 유지**
- `20260902-011`: axis component를 sidebar Accordion에 연결 — **유지**

현재 main은 `1.1.60-alpha`이며 graph global/axis staging까지 적용된 상태다.

---

## 1. 이미지 설정 read 경계 — `001`, `002`

### 판정

**유지**

`selectedImageSettingsModel()`이 기존 `normalizeImageSettings(image)`를 호출하면서 read만으로 `image.settings`를 대입하던 구조를 분리했다.

`normalizedImageSettingsValues(settings)`는 기존 정규화 계산을 순수 함수로 이동하고, 기존 mutation 의미가 필요한 호출자는 `normalizeImageSettings(image)`를 계속 사용한다.

이 변경은 Mantine 때문에 image domain semantics를 새로 정의한 것이 아니라 read/write 책임을 분리한 correctness 교정이다.

### rollback 판단

롤백하면 read selector의 부작용이 다시 생기므로 현재 기준에서는 되돌릴 이유가 없다.

---

## 2. Graph layout values 경계 — `003`~`005`

`003`, `004`는 적용되지 않았고 실패 원인과 대안이 기록되어 있다.

실제 적용 방향인 `005`는 기존 `applyGraphLayoutSettings()` 식별자와 `CHART_LAYOUT_CHANGED`/Plotly 경로를 유지하면서:

- `chartLayoutControlValues()` — legacy DOM adapter
- `chartLayoutSettingsFromValues(chart, values)` — DOM-free 계산
- `selectedChartLayoutModel()` — render snapshot
- `applyGraphLayoutSettings(values = chartLayoutControlValues())` — 기존 command의 명시적 values 입력

으로 책임만 분리했다.

### 판정

**유지**

Mantine callback이 legacy DOM을 기능 API로 사용하지 않게 만드는 데 필요한 경계이며, legacy와 Mantine의 기능 규칙을 별도로 구현하지 않는다.

---

## 3. Graph global staging — `006`, `007`

`006`은 patch parse 오류로 미적용이고 `007`이 같은 의미를 정상 diff로 재생성해 적용했다.

`007`의 추가 변경 중 core에 가장 가까운 부분은 `expectedChartId` stale guard다.

```text
readChartLayout() snapshot chartId
→ applyChartLayout(values, chartId)
→ applyGraphLayoutSettings(values, expectedChartId)
→ 현재 selected chart와 다르면 write 거부
```

### 판정

**유지**

이 guard는 snapshot chartId를 권위 상태로 사용하는 것이 아니라 오래된 UI callback이 현재 다른 chart의 domain state를 덮어쓰지 못하게 하는 write-boundary 검증이다.

같은 chart에 대한 정상 write 의미는 바뀌지 않으며 legacy 무인자 호출에도 영향을 주지 않는다.

따라서 Mantine/UI lifecycle에서 발생할 수 있는 stale callback을 차단하는 UI adapter 안전장치로 분류한다.

---

## 4. Graph axis staging — `008`~`011`

`008`은 공통 axis component와 sidebar wiring을 한 번에 넣으려다 실패했고, 이후 작업을 분할했다.

`009`:

- `FastFigureGraphAxisStaging({ chartLayout, axisKey, label })` 하나로 네 축을 공통 처리
- xBottom/xTop/yLeft/yRight의 동일 UI 의미와 commit mapping을 한 곳에 정의
- 기존 `applyChartLayout` → `CHART_LAYOUT_CHANGED` 경로 재사용

`010`:

- sidebar 연결 시도 실패, 미적용

`011`:

- `Accordion`을 sidebar에 연결
- 네 axis key를 `.map()`으로 같은 component에 전달

### 판정

**유지**

네 축의 반복 UI/event mapping을 하나로 합치는 것은 이번 Mantine 도입 목적과 최소복잡도 원칙에 직접 부합한다.

다음 항목은 변경하지 않았다.

- axis persisted model
- `CHART_LAYOUT_CHANGED`
- axis 계산/Plotly renderer
- graph object EFSM
- import/export

로그축 tick-mode/minorTicks 처리는 새 domain 규칙이 아니라 기존 UI interaction을 같은 component에 옮긴 것으로 문서화되어 있다.

---

## 5. source of truth 감사

현재 `20260902` 범위에서 새 persisted source of truth는 발견하지 못했다.

- graph layout/axis: selected chart `editor.globalSettings` / `editor.globalSettings.axes`
- image settings: image model의 `image.settings`
- React snapshot: render용 read-only snapshot
- uncontrolled TextInput/NumberInput 값: focus/commit 사이의 UI draft
- chartId: stale callback 검증용 식별자
- Accordion open state: presentation state

UI snapshot/version/id를 domain 기능 판단의 지속 상태로 사용하는 경로는 현재 검토 범위에서 확인되지 않았다.

---

## 6. 유지하되 후속 cleanup이 필요한 항목

`review-004`의 README staging 판정은 그대로 유효하다.

`readReadmeHtml()`의 legacy DOM 의존은 staging 기간에는 단일 정적 본문을 유지하기 위한 adapter로 허용할 수 있지만, shell cutover 후에도 남으면 UI ownership 경계가 완전히 Mantine/React로 이동하지 못한다.

따라서 이 항목은 **롤백 대상이 아니라 cutover cleanup 대상**이다.

---

## 7. 다음 조사 범위 — graph trace/object form

이제 남은 큰 결합은 `configFromForm()` / `applyGraphSettings()` 계열이다.

과거 기준 코드에서 `configFromForm()`은 다음을 한 함수에서 함께 읽는다.

- global layout / axes
- graph palette
- x/y column
- xAxisSide/yAxisSide
- legendName
- chart type
- lineWidth / lineDash
- markerSymbol / markerSize
- barOpacity / barLineWidth

그리고 `applyGraphSettings()`가 selected graph object를 갱신한 뒤 `CHART_MODEL_REPLACED`를 통과한다.

따라서 다음 단계에서는 이 영역을 바로 Mantine component로 옮기지 않고 먼저 현재 main 기준으로 다음을 확인한다.

1. object settings의 canonical persisted 구조와 `CURRENT_OBJECT_KEYS`
2. selected object read helper가 이미 존재하는지
3. `applyGraphSettings()`보다 작은 existing command/action이 존재하는지
4. `configFromForm()`이 layout과 object settings를 아직 중복 수집하는지
5. `CHART_MODEL_REPLACED` 전체 chart replacement가 object 편집의 유일한 정식 EFSM 경로인지
6. DOM-free values boundary를 만들 때 chart 전체 clone/replacement를 계속 해야 하는지, 기존 object-level command가 있는지

### 작업 원칙

- 현재 `configFromForm()`을 그대로 React callback에 복사하지 않는다.
- object editor 의미를 React local state의 장기 source로 만들지 않는다.
- existing command/action이 있으면 반드시 재사용한다.
- object-level 기능 분리 자체가 더 단순하고 일관된 기존 구조를 만드는 경우 유지할 수 있으나, EFSM event 의미를 Mantine 전환을 이유로 재설계하지 않는다.
- graph renderer/trace algorithm은 별도 결함이 확인되지 않는 한 변경하지 않는다.

## 최종 판정

현재까지의 Mantine 전환 패치에는 “UI를 옮기는 과정에서 이유 없이 core EFSM/domain 기능을 재설계한 변경”이 확인되지 않았다.

따라서 현 시점의 권장 상태는:

- 기존 적용 patch 유지
- 실패 patch 기록 유지
- README legacy DOM dependency는 cutover cleanup 목록 유지
- 다음 patch 전에 `configFromForm()` / graph object command 경계를 먼저 조사

이다.
