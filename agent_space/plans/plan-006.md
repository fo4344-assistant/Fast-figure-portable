# 계획 006 — Mantine 포팅 재기준화와 main 복구

## 1. 목적

이 문서는 최근 Mantine 이행 과정의 문제를 교정하고, Fast Figure의 애플리케이션 소스를 pre-Mantine 정상 기능 기준으로 되돌린 뒤 Mantine 포팅을 다시 수행하기 위한 실행 계획이다.

기존 `plan-003~005`의 최종 목표는 유지한다.

- 기존 UI FSM, 기능 EFSM, 프로젝트 클래스/모델을 Mantine 전환을 이유로 재설계하지 않는다.
- 일반 UI는 최종적으로 하나의 React + Mantine shell이 소유한다.
- Plotly, slot/image surface, layout map, label preview, drag/drop figure surface, export surface 등 기능 renderer는 유지한다.
- Mantine UI를 기존 기능과 동등 이상으로 먼저 구현한 뒤 한 번에 legacy UI를 대체한다.
- legacy UI와 Mantine 사이에 장기 bridge/compatibility layer를 만들지 않는다.
- FFPX/FFSX 등 파일 의미, 기능 자유도, preview, validation, drag/drop을 보존한다.

이 문서는 복구 기준점, branch 운용, `agent_space` 보존, JS 재분리, 기존 patch 재적용 정책과 이후 실행 순서에 대해 우선한다.

---

## 2. 현재 진행 과정의 문제

### 2.1 이미 분리된 구조를 다시 분리함

Mantine 도입 전 Fast Figure에는 이미 다음 책임 경계가 있었다.

- UI 상태 FSM
- 기능적 EFSM / application transition
- 프로젝트 클래스와 domain model
- 기능 renderer
- legacy DOM/CSS UI renderer

Mantine의 주된 교체 대상은 legacy UI renderer와 generic UI lifecycle이었다. 그러나 최근 이행에서는 `*DomainState`, `*Presentation*`, owner boundary, DOM-free bridge, legacy adapter, staging bridge, 별도 UI snapshot/read model 등의 중간 계층을 반복해서 추가했다.

그 결과 실제 Mantine UI 구현보다 migration helper 준비가 앞섰다.

### 2.2 제거 대상인 legacy UI를 내부 API처럼 사용함

잘못된 구조:

```text
Mantine component
→ migration bridge
→ legacy button click / legacy DOM value / legacy dialog DOM
→ 기존 기능
```

목표 구조:

```text
Mantine component
→ 기존 UI FSM event 또는 기존 기능 command
→ 기존 EFSM / project model
→ 기존 domain renderer
```

기능이 legacy event handler 안에 inline되어 있어 직접 호출할 수 없는 경우에만 실제 기능 command를 추출한다. Mantine 전용 bridge는 만들지 않는다.

### 2.3 준비가 포팅보다 앞섬

최근 작업은 helper/adapter/snapshot을 먼저 늘리고 active shell은 계속 legacy인 상태가 길어졌다. 앞으로는 다음 순서를 고정한다.

```text
기능 inventory
→ Mantine 구현
→ 기능 동등성 확인
→ single-shell cutover
→ legacy 제거
```

### 2.4 기능 보존보다 migration 구조가 우선됨

Mantine 전환은 기능 축소가 아니다. 기존의 모든 편집값/범위, layout map, label preview/drag, caption, graph object, palette, asset tree/drop, collision replace/rename, delete/reset cascade, print/export validation, status/debug를 Mantine 구조에 이식한다.

---

## 3. 복구 기준점

애플리케이션 소스 기준점은 다음 커밋으로 고정한다.

```text
5e9fecc2f2007b6dc63659acbd115220846e5bc2
```

이 커밋은 `Vendor React and Mantine runtime` 커밋

```text
32292f024920533f49cd265a623c5ed6d3b8decf
```

의 직전 parent다.

이 기준점에는 React/Mantine runtime 및 이후 staging/bridge migration이 application source에 들어오지 않았고, 기존 UI FSM/EFSM/project 구조와 pre-Mantine 사용자 기능이 남아 있다.

---

## 4. repository 복구 방식

현재 `main`을 그대로 버리거나 삭제하지 않는다.

### 4.1 backup branch

1. 이 문서 수정까지 포함한 현재 `main` HEAD를 확인한다.
2. 그 HEAD에서 다음 backup branch를 만든다.

```text
backup/mantine-migration-20260906
```

3. backup branch HEAD가 복구 직전 `main` HEAD와 정확히 같은지 확인한다.
4. 이 확인 전에는 `main` ref를 이동하지 않는다.

backup branch는 잘못된 migration code뿐 아니라 그 과정에서 작성한 patch, plan, review, log를 모두 보존하는 완전한 복구 지점이다.

### 4.2 main source 복구

backup 확인 후 `main`의 애플리케이션 소스를 `5e9fecc2...` 기준으로 되돌린다.

단, **`agent_space`는 pre-Mantine 시점으로 되돌리지 않는다.**

복구된 `main`의 목표 tree는 다음 조합이다.

```text
애플리케이션/저장소 소스: 5e9fecc2...
agent_space/: backup/mantine-migration-20260906의 최신 agent_space/
```

즉 다음은 pre-Mantine 기준으로 복구한다.

- `Fast-figure.html`
- 당시 존재하던 top-level source/docs/config
- Mantine migration에서 추가/수정된 application runtime/source

다음은 backup 최신 상태를 그대로 유지한다.

- `agent_space/AGENT.md`
- `agent_space/plans/`
- `agent_space/patches/`
- `agent_space/reviews/`
- `agent_space/tests/`
- `agent_space/logs/`
- `agent_space/history/`
- `agent_space/docs/`
- 기타 `agent_space` 하위 기록

이 조합을 하나의 새 commit으로 만든 뒤 `main`이 그 commit을 가리키도록 한다.

### 4.3 복구 후 검증

- `main`의 application source가 `5e9fecc2...`와 `agent_space`를 제외하고 일치하는지 비교
- `main:agent_space`와 backup branch의 `agent_space` tree가 동일한지 확인
- backup branch가 복구 전 HEAD를 유지하는지 확인
- pre-Mantine `Fast-figure.html`의 기본 실행 확인

---

## 5. JS 분리를 다시 수행

Mantine 도입과 source split을 분리한다.

초기 개발 구조:

```text
Fast-figure.html
fast-figure.js
vendor/plotly.min.js
scripts/build-portable.py
```

이 단계에는 React/Mantine runtime을 넣지 않는다.

### 분리 규칙

1. 기존 application JavaScript를 실행 순서와 scope를 바꾸지 않고 `fast-figure.js`로 이동한다.
2. bundled Plotly bytes를 `vendor/plotly.min.js`로 이동한다.
3. HTML의 기존 위치에는 대응하는 외부 `<script>` 참조만 둔다.
4. DOM ID, event binding 순서, bootstrap 순서, global symbol, UI FSM/EFSM 초기화 순서를 변경하지 않는다.
5. 함수 추출, rename, helper 통합, dead-code cleanup을 동시에 하지 않는다.
6. CSS와 HTML UI markup은 그대로 둔다.
7. source split 자체로 사용자 관찰 가능한 동작이 달라지지 않아야 한다.

### portable build

분리 직후 `scripts/build-portable.py`를 다시 작성한다.

- split HTML + app JS + Plotly vendor를 inline하여 `dist/Fast-figure.html` 생성
- portable output에 외부 runtime/network dependency가 남지 않는지 검사
- split source와 portable source가 동일 application logic을 사용하는지 확인

### split 완료 조건

- JS syntax check
- split `file://` smoke
- portable `file://` smoke
- FFPX load/save
- FFSX import/export
- CSV/image import
- graph 생성/편집
- slot layout/merge/split
- label/caption
- print/export

차이가 있으면 Mantine 도입으로 넘어가지 않는다.

---

## 6. 기존 patch 재적용 정책

기존 patch는 번호 범위로 replay하지 않는다.

### 6.1 확정 재구현

`20260906-001`의 source split은 그대로 적용하지 않고 pre-Mantine source에서 다시 구현한다.

보존할 의도:

- application JS 외부화
- Plotly vendor 외부화
- 개발 source patchability

가져오지 않을 것:

- Mantine runtime/staging
- migration bridge/helper
- 후대 source-of-truth migration

`20260906-002~005`는 중간 patch를 replay하지 않고 최종 portable build 기능만 새 split 구조에 맞춰 재구현한다.

### 6.2 React/Mantine 도입 시 재구현

JS split 검증 후 다음만 새 patch로 다시 도입한다.

- React/ReactDOM 19.2.8
- Mantine 9.5.2 core/hooks
- offline vendored runtime
- MantineProvider
- theme/default props
- 필요한 LICENSE 고지

기존 migration patch를 그대로 cherry-pick하지 않는다.

### 6.3 독립 버그 수정 whitelist

Mantine migration 시기에 작성된 patch라도 다음을 모두 만족할 때만 재적용 후보로 삼는다.

- Mantine 없이도 실제 문제가 존재
- pre-Mantine source에서도 재현
- 기능/데이터/파일 의미의 실제 결함 수정
- UI FSM/EFSM/project 구조를 migration을 위해 우회하는 patch가 아님
- 기능 자유도 축소 없음

별도 review에 다음 표를 작성한다.

```text
patch id | 실제 변경 | Mantine 독립 가치 | pre-Mantine 재현 | 판정 | 이유
```

판정은 `재적용`, `재구현`, `폐기`, `보류`만 사용한다.

`domain/presentation/owner-boundary/bridge/staging` 계열이라는 이유만으로 자동 폐기하거나 자동 재적용하지 않는다. 실제 diff를 검사한다.

---

## 7. React/Mantine runtime 도입

JS split/portable 동등성 확인 뒤 runtime만 추가한다.

이 단계에서 기존 UI는 그대로 active다.

금지:

- legacy UI 기능 제거
- legacy UI DOM을 호출하는 bridge
- UI FSM/EFSM 재설계
- project class 변경
- Mantine component를 legacy click/value/dialog로 연결

---

## 8. UI 기능 inventory

Mantine component를 구현하기 전에 영역별 사용자 기능을 inventory한다.

대상:

- shell/toolbar
- project/slot/sidebar controls
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
- confirmation/input/collision choice

각 영역에 대해 다음을 기록한다.

1. 편집값과 범위
2. action/button
3. 표시 상태
4. preview/geometry
5. drag/drop
6. validation
7. apply/cancel/reset semantics
8. 필요한 keyboard/focus 동작
9. 기존 UI FSM event
10. 기존 EFSM/domain/project command
11. 기존 기능 renderer

---

## 9. Mantine UI 직접 포팅

기본 경로:

```text
Mantine UI
→ 기존 UI FSM event
→ 기존 EFSM / project command
→ 기존 renderer
```

또는 원래 UI FSM을 거치지 않는 기능이면 기존 command를 직접 호출한다.

### helper 추출 허용 조건

legacy handler 안에 실제 기능이 inline되어 있어서 Mantine에서 호출할 수 없는 경우에만 기능 command를 추출한다.

- 기능 의미가 UI element와 독립적
- legacy와 Mantine이 같은 함수를 호출 가능
- 새 source of truth를 만들지 않음
- UI FSM/EFSM transition 의미 보존
- Mantine 전용 adapter 명칭/구조가 아님

### 금지

```text
Mantine → bridge → legacy button.click()
Mantine → bridge → legacy input.value
Mantine → bridge → legacy dialog clone
```

---

## 10. 기능 동등성 검사와 cutover

Mantine shell은 legacy UI를 제거하기 전에 inventory 전체와 대조한다.

필수 조건:

- 편집값/범위 누락 없음
- preview 누락 없음
- drag/drop 유지
- graph/image/slot 자유도 유지
- reset/delete/cascade 의미 유지
- file collision replace/rename 유지
- apply/cancel semantics 유지
- validation/status/debug 유지
- 파일 import/export 의미 유지

완료 후 한 번의 ownership cutover를 수행한다.

```text
cutover 전: legacy UI active, Mantine staging/test
cutover 후: Mantine UI active, legacy generic UI removal target
```

기능이 빠졌다면 legacy bridge를 연결하지 않고 Mantine 구현을 보완한다.

---

## 11. legacy 제거

cutover 뒤 대응 기능이 Mantine에 존재함을 확인한 항목만 제거한다.

제거 대상:

- legacy generic UI markup
- button/input/select CSS
- custom popup lifecycle
- popup position/z-index
- outside-click/Escape/focus-return handler
- legacy toolbar/sidebar event handlers
- UI state → legacy DOM `.value/.hidden/classList/aria` sync
- migration-only helper/adapter

유지 대상:

- Plotly/slot/image renderer
- dashboard/preview geometry
- layout map/label preview
- export/print geometry
- 파일 compatibility code

---

## 12. 필수 회귀 검사

1. pre-Mantine FFPX → 새 main load
2. 새 main save → reload
3. CSV + image + graph + merged slot + label + caption roundtrip
4. empty image/graph slot
5. FFSX blank slot export/import
6. multi-CSV FFSX
7. imported Plotly → edit → FFPX
8. Plotly export/import
9. palette save/load
10. failed import 후 같은 file 재선택
11. collision replace/rename
12. asset delete/reference cascade
13. drag-to-trash/reference cascade
14. no duplicate IDs
15. one active React root / one generic UI owner
16. legacy `.click()`/dialog DOM dependency 없음
17. layout/label preview geometry 유지

---

## 13. 실행 순서

```text
[현재 main + 수정된 plan-006]
        ↓
[backup/mantine-migration-20260906 생성 및 HEAD 검증]
        ↓
[pre-Mantine 5e9fecc2... tree 준비]
        +
[backup 최신 agent_space tree 결합]
        ↓
[복구 commit을 main으로 설정]
        ↓
[source 기준점 + agent_space 보존 검증]
        ↓
[JS + Plotly source split 재구현]
        ↓
[portable build 재구현]
        ↓
[split/portable 동등성 검사]
        ↓
[기존 patch audit + 독립 버그 whitelist]
        ↓
[React/Mantine runtime + theme]
        ↓
[기능 inventory]
        ↓
[Mantine UI 직접 포팅]
        ↓
[기능 동등성 검사]
        ↓
[single-shell cutover]
        ↓
[legacy generic UI 제거]
        ↓
[파일/UI 전체 회귀 검사]
```

핵심 원칙:

> **애플리케이션 소스는 pre-Mantine 기준으로 복구하되 작업 기록인 `agent_space`는 최신 상태로 보존하고, 이미 분리된 기능 구조를 다시 쪼개지 않은 채 Mantine UI를 먼저 완성한 뒤 기존 UI를 대체한다.**
