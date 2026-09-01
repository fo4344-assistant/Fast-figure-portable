# review-004 — Mantine staging read/command 경계 감사

## 범위

`plan-004.md`의 순서에 따라 `20260901-002`부터 `20260901-026`까지 준비된 React/Mantine staging 경계를 횡단 검토했다.

검토 기준:

1. read/selector/model 함수가 project/domain/EFSM을 변경하는가
2. read 경로가 legacy DOM을 source of truth로 사용하는가
3. React snapshot/draft/adapter 값이 지속 상태의 권위가 되는가
4. Mantine callback이 기존 EFSM/domain command를 우회하는가
5. legacy와 Mantine가 같은 기능 규칙을 별도로 구현해 두 source of truth를 만드는가
6. Mantine와 독립적인 core 변경이 있다면 별도 근거가 있는가

## 결론

현재까지 확인된 **domain state를 변경하는 read selector 문제는 `20260901-025` 한 건**이었고 `20260902-002`에서 교정했다.

그 외 staging 경계에서는 EFSM/domain mutation을 우회하거나 React snapshot을 지속 상태로 사용하는 문제를 발견하지 못했다.

별도로 `20260901-017`의 README staging은 정적 README 본문을 legacy DOM에서 복제하는 임시 adapter다. 지속 domain state의 source of truth 중복은 아니지만, 최종 React shell이 legacy DOM에 의존하면 안 되므로 shell cutover 시 제거해야 할 migration dependency로 분류한다.

현재 감사 결과만으로 기존 staging patch 전체를 롤백해야 할 항목은 없다.

---

## 1. external store / snapshot

### `20260901-002`, `003`

역할:

- 기존 `ApplicationStateMachine.subscribe()`를 React external store 경계로 노출
- UI가 필요한 상태를 snapshot으로 구성
- same-target domain update도 React가 놓치지 않도록 별도 immutable/versioned UI snapshot을 발행

판정: **유지**

이 version 값은 render invalidation을 위한 식별자일 뿐 domain revision이나 source of truth가 아니다. `003`이 `appFSM.state.revision` 자체를 UI invalidation 목적으로 변경하지 않은 것도 적절하다.

주의:

- 이후 selector 값을 snapshot 객체 안에 추가할 때 §7 read 순수성 계약을 계속 적용한다.
- UI version을 기능 판단에 사용하지 않는다.

---

## 2. Layout 경계

### `20260901-006`, `007`

역할:

- DOM 입력값과 layout 적용 로직을 분리한 values boundary
- `slotStyleFromValues`, `applyLayoutSettingsFromValues`
- 기존 `makeSlots()`, `applySlotStyle(false)` 등 기존 domain 경로 재사용
- Mantine form은 commit 전 local draft만 보유

판정: **유지**

Layout staging이 별도의 persisted layout state를 만들지 않는다. local state는 modal에서 편집 중인 draft이며 commit 후 domain 값이 권위가 된다.

---

## 3. Label / annotation 경계

### `20260901-008`, `009`, `010`

역할:

- label 설정/위치의 DOM-free values boundary
- annotation visibility 공통 command
- label position commit/reset의 공통 경로
- 기존 preview/dashboard/Plotly resize/debug/notify 경로 재사용

판정: **유지**

특히 visibility와 position reset의 중복 경로를 하나로 합친 것은 Mantine 때문에 domain 의미를 변경한 것이 아니라 기존 분산 기능의 통합이다.

read snapshot이 domain mutation을 수행한다는 증거는 확인되지 않았다.

---

## 4. Caption 경계

### `20260901-011`, `012`, `013`

`readCaptionEditorState()`는:

- `projectObjects.read("captions")`
- `activeCaptionView(caption)`
- `projectClone(view.settings)`

을 통해 editor에 필요한 snapshot을 만들며 DOM을 읽거나 domain 값을 수정하지 않는다.

`applyCaptionEditorFromValues()`는 기존:

- annotation visibility command
- `SLOT_CAPTION_MODE_CHANGED`
- caption settings command
- `CAPTION_TEXT_INPUT`

을 재사용한다.

판정: **유지**

React editor가 별도 persistent caption model을 소유하지 않고 기존 caption/domain/EFSM 경로를 사용하는 구조다.

---

## 5. Print/export 경계

### `20260901-014`, `015`

역할:

- legacy DOM에서 읽던 출력 조건을 `exportDashboardTargetFromValues(values, statusOut)`로 분리
- 실제 export/canvas/Plotly/save engine은 재사용
- Mantine staging은 동일 values command를 호출

판정: **유지**

출력 형식, DPI/size 제한과 renderer 의미를 Mantine 때문에 다시 구현하지 않았다.

---

## 6. Overlay host

### `20260901-016`

역할:

- 이미 준비된 staging modal들을 하나의 inactive overlay host에 연결
- overlay open 의미는 기존 FSM을 구독

판정: **유지**

staging 자체가 overlay state owner가 되지 않는다.

최종 cutover에서도 Modal의 presentation 규칙 때문에 overlay EFSM 의미를 바꾸지 않는다.

---

## 7. README staging

### `20260901-017`

현재:

```text
readReadmeHtml()
-> #readmeDialog .readme-content 조회
-> clone
-> legacy close button 제거
-> innerHTML 반환
```

판정: **조건부 유지 / cutover cleanup 필수**

이 경로는 project/domain/EFSM state를 읽는 selector가 아니라 정적 README 문서를 한 벌만 유지하기 위한 migration adapter다. 따라서 `20260901-025`처럼 read 호출이 domain state를 변경하는 문제와는 다르다.

그러나 최종 React shell이 legacy dialog markup의 존재를 요구하면 `plan-004`의 UI ownership 경계에 어긋난다.

따라서:

- staging 기간에는 임시 adapter로 유지 가능
- README 본문을 두 벌 복사해 두 source를 만드는 수정은 하지 않음
- shell cutover 시 legacy `#readmeDialog` 제거와 함께 React 쪽 canonical static content 경계로 이전
- cutover 이후 `readReadmeHtml()`이 legacy DOM을 조회하는 구조는 남기지 않음

현재 단계에서 별도 domain patch는 필요하지 않다.

---

## 8. Asset action / Menu 경계

### `20260901-018`, `019`

역할:

- 기존 `ASSET_TREE_ACTION_SCHEMA`를 legacy menu와 Mantine Menu가 공통 사용
- action availability와 실제 handler를 하나의 모델로 노출
- Mantine는 open/close/focus/keyboard presentation을 담당

판정: **유지**

기능 규칙을 React에서 재작성하지 않고 기존 action schema를 source of truth로 재사용한 구조라 Mantine 도입 목적과 직접 일치한다.

---

## 9. Project name / external invalidation

### `20260901-020`, `021`

역할:

- domain-only mutation에 대해 별도 UI invalidation 발행
- project name 변경을 `setProjectNameFromValue` 공통 경계로 통합
- Mantine TextInput은 project state를 source로 사용

판정: **유지**

UI invalidation version은 domain 값이 아니다. project name의 source of truth는 계속 project state다.

FFPX export normalization과 legacy handler가 같은 setter를 사용하는 것도 중복 감소에 해당한다.

---

## 10. Slot content type

### `20260901-023`

역할:

- selected slot이 있으면 기존 slot `contentType`을 읽음
- selected slot이 없으면 기존 `pendingSlotContentType`을 읽음
- 쓰기는 기존 `setSlotContentType(type)` 경로 사용
- selected slot mutation은 기존 `SLOT_TYPE_CHANGED` event 사용

판정: **유지**

React에 별도 persistent content type을 만들지 않는다.

---

## 11. Project file selection

### `20260901-024`

역할:

- file input에서 파일 목록을 얻는 presentation 부분과 실제 파일 분기/로드를 `loadProjectFiles(fileList)`로 분리
- native input과 Mantine `FileButton`이 동일 loader 사용
- `loadDataFile`, `loadImageFile`, `loadFileIntoSlot` 재사용

판정: **유지**

파일 import semantics를 React에서 다시 구현하지 않았다.

---

## 12. Image settings

### `20260901-025`

기존 문제:

```text
selectedImageSettingsModel()
-> normalizeImageSettings(image)
-> image.settings 대입
```

따라서 read selector가 domain state를 변경했다.

### `20260902-002` 교정

- 정규화 계산을 순수 `normalizedImageSettingsValues(settings)`로 분리
- 기존 `normalizeImageSettings(image)`의 mutation 의미는 그대로 유지
- selector는 순수 helper만 사용

판정: **교정 완료 / 유지**

앱 버전은 `1.1.56-alpha`이며 적용 commit은 `7c89ed5829869328d1c4d252364fddbbf320f927`이다.

---

## 13. CSV header

### `20260901-026`

역할:

- `selectedCsvHeaderModel()`은 현재 CSV의 header snapshot을 반환
- 쓰기는 `applyCsvHeaderLinesFromValue(value, csvId)` 공통 command
- stale callback 방지를 위해 전달된 `csvId`와 현재 active CSV를 검증
- 기존 chart rebuild/render/debug/invalidation 경로 유지

판정: **유지**

기존 전역 `rows` 대신 대상 CSV의 `csv.rows`를 기준으로 header line count를 계산하는 부분은 Mantine 전환과 독립적으로 정당한 correctness 개선이다.

---

## 전체 판정표

| 범위 | 판정 | 후속 |
|---|---|---|
| external store | 유지 | snapshot은 계속 비권위 값으로 유지 |
| Layout | 유지 | cutover 전 draft lifecycle 확인 |
| Label | 유지 | preview/domain renderer 분리 유지 |
| Caption | 유지 | read 순수성 확인 완료 |
| Print | 유지 | export engine 재사용 유지 |
| Overlay host | 유지 | 기존 interaction semantics 회귀 검사 |
| README | 조건부 유지 | cutover 때 legacy DOM 의존 제거 |
| Asset action/Menu | 유지 | schema 단일 source 유지 |
| Project name | 유지 | UI version을 기능 상태로 사용 금지 |
| Slot type | 유지 | 기존 EFSM 경로 유지 |
| File selection | 유지 | import loader 단일화 유지 |
| Image settings | 교정 완료 | `20260902-002` 유지 |
| CSV header | 유지 | stale callback guard 유지 |

## 다음 작업

현재 발견된 즉시 수정 필요 read-side mutation은 처리됐다.

따라서 `plan-004`에 따라 다음 단계는 아직 staging되지 않은 일반 UI를 확인하고, shell cutover에 필요한 기능 경계를 완성하는 것이다.

진행 원칙:

1. 새 staging component를 만들기 전에 같은 기능의 기존 command/action/helper가 있는지 확인한다.
2. DOM 읽기가 남아 있으면 legacy adapter와 domain command를 분리하되 domain semantics는 바꾸지 않는다.
3. selector는 순수 read 계약을 지킨다.
4. React local state는 commit 전 draft에만 사용한다.
5. staging은 cutover 전까지 legacy UI와 동시에 interactive하게 활성화하지 않는다.
6. README legacy DOM dependency는 cutover cleanup 목록에 유지한다.
