# 계획 006 — Mantine 포팅 재기준화와 pre-Mantine 복구

## 1. 문서의 역할

이 문서는 `plan-003.md`, `plan-004.md`, `plan-005.md`의 최종 목표를 폐기하지 않는다.

오히려 최근 이행 과정이 그 계획의 핵심 전제를 벗어난 문제를 교정하고, Mantine 포팅을 **pre-Mantine 정상 기능 기준에서 다시 시작하기 위한 실행 계획**을 정의한다.

우선순위는 다음과 같다.

1. 기존 UI FSM / 기능 EFSM / 프로젝트 모델 구조를 다시 임의로 분해하지 않는다.
2. Mantine UI를 기존 기능과 동등 이상으로 먼저 구현한다.
3. legacy UI와 Mantine 사이에 장기 bridge/compatibility layer를 만들지 않는다.
4. 구현된 Mantine UI가 준비되면 기존 UI를 한 번의 ownership cutover로 대체한다.
5. 파일 호환성, 기능 자유도, preview/시각적 보조 요소는 유지한다.

`plan-003~005`와 충돌하는 경우 이 문서는 **복구 기준점, 재적용 범위, 재진행 순서**에 대해서만 우선한다.

---

## 2. 현재 진행 과정의 문제

### 2.1 이미 분리된 구조를 다시 분리한 문제

Fast Figure는 Mantine 도입 전부터 이미 다음 책임을 구분하고 있었다.

- UI 상태 FSM
- 기능적 EFSM / application state transition
- 프로젝트 클래스와 domain model
- Plotly / slot / image / layout-map / label-preview 등 기능 renderer
- legacy DOM/CSS 기반 UI renderer

따라서 Mantine 포팅의 본래 대상은 **legacy UI renderer와 generic UI lifecycle**이었다.

그러나 최근 이행에서는 다음과 같은 이름의 추가 경계가 계속 만들어졌다.

- `*DomainState`
- `*Presentation*`
- owner boundary
- DOM-free bridge
- legacy adapter
- Mantine staging bridge
- 별도 UI snapshot/read model

이 중 일부는 개별 함수 정리로서 가치가 있을 수 있지만, 전체 방향으로는 이미 존재하던 UI FSM / EFSM / project model 경계 위에 **추가적인 migration 계층을 반복해서 쌓는 구조**가 되었다.

결과적으로 Mantine UI 자체의 완성보다 bridge/helper/adapter 준비가 우선되는 문제가 생겼다.

### 2.2 제거 대상인 legacy UI를 내부 API처럼 사용한 문제

다음과 같은 방식이 실제로 도입되거나 검토되었다.

```text
Mantine component
→ bridge
→ legacy button click / legacy DOM value / legacy dialog content
→ 기존 기능 경로
```

예:

- Mantine action이 legacy button `.click()`을 호출
- Mantine README가 legacy dialog DOM을 clone
- legacy/Mantine 양쪽이 같은 command를 호출하기 위해 중간 bridge를 확장

최종 목표가 legacy UI의 완전 제거라면 제거 대상 DOM은 내부 API가 되어서는 안 된다.

정상 목표 구조는 다음과 같다.

```text
Mantine component
→ 기존 UI FSM event 또는 기존 기능 command
→ 기존 EFSM / project model
→ 기존 domain renderer
```

필요한 함수 추출은 **실제 기능이 UI event handler 안에 우연히 묻혀 있어 직접 호출할 방법이 없는 경우**에만 수행한다. 이때도 Mantine 전용 bridge를 만드는 것이 아니라 원래 기능 command를 정상적인 호출 경계로 만든다.

### 2.3 staging과 준비 작업이 실제 포팅보다 앞선 문제

`plan-003~005`는 Mantine UI를 기능적으로 완성한 뒤 한 번에 shell ownership을 전환하도록 요구한다.

그러나 실제 진행은 다음과 같이 변질되었다.

```text
기존 기능 inventory
→ helper 분리
→ bridge 추가
→ snapshot 추가
→ legacy adapter 추가
→ 일부 Mantine staging
→ 또 다른 helper 분리
→ 아직 active shell은 legacy
```

즉 포팅을 위해 필요한 최소 경계를 만드는 것이 아니라 **cutover를 하기 전에 가능한 legacy dependency를 모두 미리 제거하려는 방식**으로 진행되었다.

이 방식은 최종 Mantine component tree가 실제로 어떤 호출 경계를 필요로 하는지 확인하기 전에 코어 주변을 먼저 수정하게 만든다.

### 2.4 기능 보존보다 migration 구조가 판단 기준이 된 문제

Mantine 전환의 목적은 기능 축소가 아니다.

기존 UI의 다음 요소는 반드시 Mantine 구현에 이식되어야 한다.

- 모든 편집 가능한 값과 조정 범위
- layout map
- label preview / drag
- 실제 slot 대비 label scale/position 관계
- caption 편집
- graph object 편집
- palette
- asset tree와 drag/drop
- 파일 충돌 시 replace / rename 선택
- delete/reset 시 참조 경고와 cascade 의미
- print/export 설정과 validation
- status/debug/feedback

최근에는 일부 항목에서 이 기능 자체를 직접 구현하기보다 legacy 경로를 재사용하는 bridge를 먼저 만들었다.

앞으로는 **기능 inventory → Mantine 구현 → 기능 동등성 확인 → 교체** 순서를 지킨다.

---

## 3. 복구 기준점

새 Mantine 포팅 브랜치는 다음 커밋에서 시작한다.

```text
5e9fecc2f2007b6dc63659acbd115220846e5bc2
```

이 커밋은 `Vendor React and Mantine runtime` 커밋

```text
32292f024920533f49cd265a623c5ed6d3b8decf
```

의 직전 parent다.

즉 다음을 만족한다.

- React/Mantine runtime이 아직 application source에 들어오지 않음
- Mantine staging/bridge/compatibility migration이 아직 시작되지 않음
- 기존 legacy UI와 기존 UI FSM/EFSM/project structure가 그대로 존재
- Mantine 도입 전에 존재하던 사용자 기능을 기준선으로 삼을 수 있음

### 브랜치 원칙

- 현재 `main`은 기록과 비교를 위해 그대로 둔다.
- 새 포팅은 별도 branch에서 수행한다.
- branch 시작점은 위 pre-Mantine commit으로 고정한다.
- 현재 `main`의 Mantine migration commit을 일반적인 merge/cherry-pick으로 가져오지 않는다.
- 필요한 변경만 원래 patch 설명과 실제 diff를 검토한 뒤 새 branch에 다시 작성한다.

이렇게 해야 잘못된 migration helper가 의존성으로 따라오는 것을 막을 수 있다.

---

## 4. 1단계 — JS 분리를 다시 수행

### 목적

Mantine 도입과 JS source split을 분리한다.

이 단계에서는 **UI, FSM, EFSM, project model, renderer 동작을 바꾸지 않는다.**

기존 단일 `Fast-figure.html`을 개발용 source로만 분리하고 portable single-file output을 계속 제공한다.

### 목표 개발 구조

초기 분리는 다음 정도로 제한한다.

```text
Fast-figure.html
fast-figure.js
vendor/plotly.min.js
scripts/build-portable.py
```

React/Mantine runtime은 이 단계에서 넣지 않는다.

### 분리 규칙

1. 기존 application JavaScript를 실행 순서와 scope를 바꾸지 않고 `fast-figure.js`로 이동한다.
2. bundled Plotly byte를 `vendor/plotly.min.js`로 이동한다.
3. HTML에는 기존 script 위치에 대응되는 외부 `<script>` 참조만 둔다.
4. DOM ID, event binding 순서, bootstrap 순서, global symbol, FSM initialization 순서를 변경하지 않는다.
5. 함수 추출, rename, helper 통합, dead-code cleanup을 동시에 하지 않는다.
6. CSS와 HTML UI markup은 기능상 필요한 경우가 아니면 그대로 둔다.
7. source split 자체로 APP behavior가 달라지지 않아야 한다.

### portable build

분리 직후 `scripts/build-portable.py`를 추가한다.

기능:

- split HTML + app JS + Plotly vendor를 읽음
- 기존 script 위치에 동일 byte를 다시 inline
- single-file `dist/Fast-figure.html` 생성
- 외부 runtime/network dependency가 portable output에 남지 않는지 검사

### 검증

- split source `file://` 실행
- portable build `file://` 실행
- JS syntax check
- 기존 UI 기본 smoke
- FFPX load/save
- FFSX import/export
- CSV/image import
- graph 생성/편집
- slot layout/merge/split
- label/caption
- print/export

분리 전후 기능 차이가 발견되면 Mantine 도입으로 넘어가지 않는다.

---

## 5. 기존 patch 재적용 정책

기존 patch는 번호만 보고 재적용하지 않는다.

각 patch는 다음 세 종류로 분류한다.

### A. 확정 재구현

#### `20260906-001` — source split

그대로 적용하지 않는다.

현재 `20260906-001`은 이미 React/Mantine이 들어간 후대 source를 분리한 patch이므로 pre-Mantine 기준에는 직접 적용할 수 없다.

대신 **분리 방식만 참고하여 pre-Mantine source에서 새 patch로 다시 구현**한다.

보존할 의도:

- application JS 외부화
- Plotly vendor 외부화
- 개발 source patchability 개선

가져오지 않을 것:

- 이미 들어가 있던 Mantine staging/runtime
- 후대 bridge/helper
- 후대 source-of-truth migration

#### `20260906-002~005` — portable build 복구 과정

중간 실패 patch를 순차 재적용하지 않는다.

최종적으로 검증된 portable build 기능만 새 source split에 맞춰 다시 작성한다.

보존할 기능:

- split source → single-file portable build
- local/offline execution
- source script 누락 검사
- generated output 검증

### B. Mantine 도입 시 다시 구현할 항목

React/Mantine vendoring과 theme baseline은 **JS split 검증 완료 후** 새 patch로 다시 작성한다.

참고 대상:

- React/ReactDOM 19.2.8 vendoring
- Mantine 9.5.2 vendoring
- offline runtime
- `MantineProvider`
- 공통 button/input size, spacing, radius 등 theme
- LICENSE 고지

기존 `20260831-015` 이후 migration patch를 그대로 replay하지 않는다.

특히 다음 종류는 직접 재적용하지 않는다.

- legacy button `.click()` bridge
- legacy dialog DOM clone bridge
- compatibility host
- owner-boundary 전용 wrapper
- legacy/Mantine 병행을 위한 duplicate UI snapshot
- cutover 전에 legacy UI를 API처럼 유지하기 위한 adapter

### C. 독립 버그 수정 / 최소복잡도 개선

Mantine migration 중 만들어진 patch라도 다음 조건을 만족하면 재적용 후보가 된다.

- Mantine 없이도 실제 문제가 존재함
- 기존 기능 버그 또는 데이터/파일 의미 불일치를 수정함
- 기존 UI FSM/EFSM/project structure를 우회하기 위한 patch가 아님
- 기능 자유도를 줄이지 않음
- 새 branch의 pre-Mantine source에서도 같은 문제가 재현됨

이 범주는 **실제 diff와 설명 문서를 다시 감사한 뒤 whitelist 방식으로만 재적용**한다.

현재 단계에서 번호 범위를 통째로 재적용하지 않는다.

특히 `20260906-008` 이후의 `domain/presentation/owner boundary/bridge/staging` 계열 patch는 기본적으로 재적용 금지 상태로 두고, 독립 버그 수정이 섞였는지 개별 검사한다.

### patch audit 기록

새 branch 작업 전에 별도 review 문서에 다음 표를 작성한다.

```text
patch id | 실제 변경 | Mantine 독립 가치 | 새 branch 재현 여부 | 재적용 여부 | 이유
```

판정은 `재적용`, `재구현`, `폐기`, `보류` 네 종류만 사용한다.

---

## 6. 2단계 — React/Mantine runtime만 도입

JS split과 portable build가 기능 동등성을 통과한 뒤에만 React/Mantine runtime을 추가한다.

이 단계에서도 기존 UI는 그대로 활성 상태로 둔다.

추가 대상:

- React / ReactDOM
- Mantine core/hooks
- Mantine CSS/runtime
- `MantineProvider`
- `fastFigureTheme`
- 하나의 비활성/개발용 React root

금지:

- legacy UI 기능 제거
- legacy UI와 Mantine 사이의 기능 bridge 구축
- FSM/EFSM 재설계
- project class 변경
- Mantine UI를 legacy DOM event로 연결

목적은 dependency/runtime 검증뿐이다.

---

## 7. 3단계 — UI 기능 inventory

Mantine component를 작성하기 전에 기존 화면을 영역별로 inventory한다.

inventory는 DOM element 목록이 아니라 **사용자 기능 목록**이다.

대상:

- application shell
- toolbar
- project controls
- slot controls
- graph editor
- image editor
- layout
- label
- caption
- print/export
- README
- asset tree/menu
- palette
- debug/status
- confirmation / prompt / collision choice

각 항목에 대해 기록:

1. 입력/편집 가능한 값
2. 버튼/action
3. 표시 상태
4. preview/geometry
5. drag/drop
6. validation
7. apply/cancel/reset semantics
8. keyboard/focus 중 기능적으로 필요한 동작
9. 호출하는 기존 UI FSM event
10. 호출하는 기존 EFSM/domain/project command
11. 사용하는 domain renderer

이 inventory가 Mantine 구현의 acceptance checklist가 된다.

---

## 8. 4단계 — Mantine UI를 직접 포팅

### 기본 원칙

Mantine component는 기존 기능 구조에 직접 연결한다.

```text
Mantine UI
→ 기존 UI FSM event
→ 기존 EFSM / project command
→ domain renderer
```

또는 기능이 UI FSM을 거치지 않는 기존 command라면:

```text
Mantine UI
→ 기존 command
→ project/domain mutation
→ renderer
```

### bridge 금지 원칙

다음 형태를 만들지 않는다.

```text
Mantine
→ migration bridge
→ legacy DOM
→ 기존 handler
```

legacy UI가 제거되면 함께 사라질 대상을 Mantine의 dependency로 삼지 않는다.

### 필요한 command 추출

기존 legacy event handler 안에 실제 기능이 inline되어 있어서 Mantine에서 호출할 수 없는 경우에만 기능 함수를 추출한다.

추출 기준:

- 기능 의미가 UI element와 독립적임
- 기존 legacy handler도 같은 함수로 바꿀 수 있음
- 새로운 source of truth를 만들지 않음
- 기존 UI FSM/EFSM transition 의미를 보존함
- Mantine 전용 명칭/adapter가 아님

예:

```text
기존:
button.onclick = () => {
  validation
  project mutation
  render
}

허용:
function resetSelectedSlot(...) {
  validation
  project mutation
  render
}

legacy button → resetSelectedSlot(...)
Mantine button → resetSelectedSlot(...)
```

하지만 다음은 금지한다.

```text
Mantine button
→ fastFigureUiBridge.resetSelectedSlot()
→ legacy button.click()
```

### 구현 단위

기능별 component는 여러 patch로 구현할 수 있다.

그러나 cutover 전 active UI는 legacy 한 벌만 유지한다.

Mantine staging은 실제 기능 동등성 검사용으로만 존재하며 legacy state를 별도 복제하지 않는다.

---

## 9. Mantine이 소유할 것과 유지할 것

### Mantine으로 완전 대체

- application shell
- toolbar
- sidebar
- Button / ActionIcon
- TextInput / NumberInput / Select
- Switch / Checkbox
- generic form layout
- Modal
- Menu
- Tooltip
- confirmation/input/choice dialog UI
- generic status/display UI
- asset tree의 일반 control UI

### 기존 Fast Figure renderer 유지

- Plotly graph surface
- slot/image rendering
- dashboard geometry
- layout map
- label preview geometry
- drag/drop figure surface
- export render surface

이 renderer는 필요하면 React component의 `ref`/host DOM을 target으로 받도록 최소한으로 수정할 수 있다.

이 수정은 Mantine bridge가 아니라 renderer target interface다.

---

## 10. 5단계 — 기능 동등성 검사

Mantine shell의 각 영역은 legacy UI 제거 전에 inventory와 대조한다.

완료 조건:

- 편집 가능한 값 누락 없음
- 값 범위/정밀도 축소 없음
- preview 누락 없음
- drag/drop 기능 유지
- graph/image/slot 조작 자유도 유지
- reset/delete/cascade 의미 유지
- file collision 선택 유지
- apply/cancel semantics 유지
- validation 유지
- status/debug feedback 유지
- file import/export 의미 유지

기능을 더 일반적인 Mantine 상위 primitive로 통합하는 것은 허용한다.

예:

- 여러 custom popup lifecycle → Mantine Modal 공통 lifecycle
- 여러 개별 confirmation popup → 공통 confirmation component
- 분산 button size CSS → theme/default props

단, **상위 기능으로 통합한다는 이유로 하위 기능 선택지나 편집 자유도를 삭제하지 않는다.**

---

## 11. 6단계 — 단일 shell cutover

Mantine component tree가 기능 동등성 검사를 통과하면 한 번에 active ownership을 바꾼다.

cutover 전:

```text
legacy UI = active
Mantine UI = staging/test only
```

cutover 후:

```text
Mantine UI = active
legacy generic UI = inactive and removal target
```

한 영역씩 legacy와 Mantine을 동시에 active owner로 두지 않는다.

cutover patch에서 수행:

- 하나의 React root에 최종 `FastFigureShell` mount
- MainWorkspace에 기존 dashboard/domain renderer host 연결
- UI FSM state를 Mantine component가 직접 render
- Mantine event callback이 기존 FSM/command를 직접 호출
- legacy toolbar/sidebar/dialog/menu active path 차단

이 단계에서 기능이 빠졌다면 legacy를 다시 bridge로 연결하지 않는다.

Mantine 구현을 보완한다.

---

## 12. 7단계 — legacy UI 제거

cutover 후 실제 호출 관계를 기준으로 제거한다.

제거 대상:

- legacy generic UI markup
- legacy button/input/select CSS
- custom popup wrapper
- popup positioning/z-index code
- outside-click/Escape/focus-return 수동 lifecycle
- legacy toolbar/sidebar handlers
- UI state → legacy DOM `.value/.hidden/classList/aria` sync
- migration-only staging/adapter/helper

유지 여부를 별도로 판단할 대상:

- domain renderer host DOM
- Plotly/slot/image geometry CSS
- label/layout preview CSS
- export/print geometry
- 파일 compatibility code

legacy 제거는 기능 제거 단계가 아니다.

**Mantine 쪽에 대응 기능이 존재하는 것이 확인된 항목만 제거한다.**

---

## 13. 파일 호환성과 회귀 검사

Mantine 포팅 완료 여부와 별도로 파일 의미는 높은 우선순위로 보존한다.

필수 검사:

1. pre-Mantine FFPX → 새 branch load
2. 새 branch save → 새 branch reload
3. CSV + image + graph + merged slot + label + caption roundtrip
4. empty image/graph slot
5. FFSX export/import blank slot
6. multi-CSV FFSX roundtrip
7. imported Plotly → edit → FFPX
8. Plotly export/import
9. palette save/load
10. failed import 후 같은 file 재선택
11. file collision replace
12. file collision rename
13. asset delete/reference cascade
14. drag-to-trash/reference cascade

UI 회귀 검사:

- no duplicate IDs
- one active React root
- one active generic UI owner
- legacy button `.click()` dependency 없음
- Mantine가 legacy dialog DOM을 읽지 않음
- popup close/Escape/outside-click/focus가 Mantine lifecycle을 사용
- layout/label preview geometry 유지
- asset tree drag/drop 유지

---

## 14. patch 작성과 rollback

새 branch에서도 `agent_space/AGENT.md` 규칙을 그대로 적용한다.

- 모든 source 변경은 diff patch로 기록
- `.patch` / `.md` 쌍 유지
- 목적/이유/기각안/rollback/test 기록
- 실제 source identifier 확인 후 수정
- 관련 없는 변경 금지

추가로 Mantine 재포팅 patch 설명에는 반드시 다음을 기록한다.

- legacy에서 제공하던 기능 inventory 항목
- Mantine에서 대응하는 component/action
- 기존 UI FSM event / EFSM / project command 중 무엇을 재사용했는지
- 새 helper를 만들었다면 왜 기존 구조로는 호출할 수 없었는지
- 기능 자유도 변화 여부
- legacy dependency가 새로 생기지 않았는지

---

## 15. 중단 조건

다음 중 하나가 발생하면 다음 migration 단계로 넘어가지 않는다.

- JS split 전후 동작 차이
- portable build 기능 차이
- 기존 UI FSM/EFSM 의미를 바꾸어야만 Mantine component가 작동하는 상황
- Mantine component가 legacy DOM을 기능 API로 사용해야 하는 상황
- inventory에 있는 기능/preview가 빠진 상태
- FFPX/FFSX 의미 변화
- 새로운 duplicate source of truth 발생

이 경우 migration helper를 추가해 우회하지 않고 원인을 다시 확인한다.

---

## 16. 실행 순서 요약

```text
[현재 main 보존]
        ↓
[새 branch: 5e9fecc2...]
        ↓
[pre-Mantine 기능 baseline 확인]
        ↓
[JS + Plotly source split만 재구현]
        ↓
[portable build 재구현]
        ↓
[split/portable 기능 동등성 검사]
        ↓
[기존 patch audit 및 독립 버그 수정 whitelist]
        ↓
[React/Mantine runtime + theme 도입]
        ↓
[legacy 기능 inventory]
        ↓
[Mantine UI 직접 포팅]
        ↓
[기능 동등성 검사]
        ↓
[한 번의 shell cutover]
        ↓
[legacy generic UI 제거]
        ↓
[파일/UI 전체 회귀 검사]
```

핵심 원칙은 다음 한 문장으로 정리한다.

> **이미 분리된 기능 구조를 migration을 위해 다시 분해하지 말고, pre-Mantine의 완전한 기능을 기준으로 Mantine UI를 먼저 직접 구현한 뒤 기존 UI를 그 구현으로 대체한다.**
