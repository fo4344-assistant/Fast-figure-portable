# Source Script r25 closure review — r24 cross-reference gap correction

## 되돌아온 이유

Source Script r24를 Backend / Application boundary / Frontend 구조로 닫은 뒤, patch 기록과 development-layer checker 조건을 다시 대조하는 최종 cross-reference 감사에서 r24 closure가 놓친 두 항목을 확인했다.

첫째, `renderer_runtime.py`의 `prepareDashboardFileDrop` 설명이 `frontendActions.slots.prepareFileDrop(slotId)`를 호출하도록 적혀 있었다. 그러나 r24의 `FastFigureApi.slots` public surface에는 `prepareFileDrop`이 정의되어 있지 않다. 이것은 실제 기존 기능에서 필요했던 새 의미가 아니라 file-drop target validity를 확인하려는 목적으로 설명 중 만들어진 이름이다.

둘째, `graphs.py`의 `graphEditorObjectValues(chartId, index, values)`는 docstring에서 `graphEditorCommit(chartId, ...)`을 통해 persistent graph object state를 변경한다고 명시했지만 함수 본문은 `chart = "object 변경 후 chart"`를 반환할 뿐 공식 `GRAPH_OBJECTS_REPLACED` command까지의 연결을 표현하지 않았다. 따라서 Source Script 자체만 읽으면 object value edit의 input → candidate → command 경로가 끊겨 있었다.

r24 closure가 이를 놓친 원인은 Backend/Frontend direct import, Module decomposition, query/mutation ordering을 중심으로 감사한 뒤 renderer가 참조하는 public action 이름과 각 graph wrapper의 docstring-본문 일치를 별도의 symbol-level cross-reference로 끝까지 확인하지 않았기 때문이다.

## 수정 1 — file-drop target 준비

새 `prepareFileDrop` API는 추가하지 않았다.

기존 public `slots.select(slotId)`는 이미 다음 의미를 가진다.

1. Application boundary에서 slot reference를 Backend current authority 기준으로 검증한다.
2. accepted slot을 Frontend FSM에 전달해 selection/workspace를 갱신한다.
3. rejected target은 selection mutation 없이 거부한다.

따라서 renderer의 file-drop target 준비는 이 기존 public operation을 그대로 재사용한다.

새 의미:

```text
dashboard file drop target
→ frontendActions.slots.select(slotId)
→ Application boundary Backend validation
→ accepted: target selection/workspace ready
→ rejected/deselected: file-drop preparation false
```

renderer는 slot을 직접 Backend에서 resolve하지 않는다.

별도 `slots.prepareFileDrop` API, 별도 validation path, 별도 Frontend state를 추가하지 않는다.

## 수정 2 — graph object value edit

`graphEditorObjectValues(chartId, index, values)`의 persistent mutation 경로를 본문까지 완결했다.

처리 순서:

1. `chartId`와 `index`를 Backend current authority에서 resolve한다.
2. 대상 object가 참조하는 `csvId`와 x/y column reference를 함께 확인한다.
3. enum과 numeric range를 validation/normalization한다.
4. current object array에서 대상 index만 수정한 `candidateObjects`를 만든다.
5. `graphEditorCommit(chartId, candidateObjects, index)`을 호출한다.
6. `graphEditorCommit`은 기존 `GRAPH_OBJECTS_REPLACED` Project command로 commit한다.

새 graph mutation command를 만들지 않았고 기존 command ownership을 그대로 재사용했다.

## 정책 검토

### 계산과 mutation 분리

object value validation과 candidate object array 작성은 authoritative mutation과 분리된다.

실제 persistent mutation은 `graphEditorCommit → dispatchProjectCommand("GRAPH_OBJECTS_REPLACED") → Project EFSM` 경로로만 수행한다.

### Single Source of Truth

file-drop target 준비에 별도 target store 또는 validation cache를 만들지 않는다.

graph object edit도 candidate array가 command 범위를 넘어 일반 read authority로 유통되지 않는다.

### 최소 복잡도

기존 `slots.select`가 target validity와 selection을 이미 공식 boundary로 처리하므로 같은 의미의 `prepareFileDrop` API를 추가하지 않았다.

graph object edit도 기존 `graphEditorCommit`과 `GRAPH_OBJECTS_REPLACED`를 재사용했다.

### 참조 무결성

graph object 값 변경 전에 `chartId → object index → object.csvId → columns` 관계를 current Backend authority에서 다시 resolve하도록 했다.

Frontend의 stale object copy를 그대로 persistent authority로 사용하지 않는다.

## Module decomposition 영향

r24의 hierarchy는 변경하지 않는다.

```text
Fast Figure system
├─ Backend
├─ Application boundary
├─ Frontend
└─ Portable build
```

- renderer file-drop target 준비는 Frontend → Application boundary public action 흐름이다.
- graphEditorObjectValues는 Application-boundary wrapper가 Backend candidate calculation을 사용한 뒤 Project EFSM command로 수렴하는 기존 graph 책임 안에 있다.

새 logical module이나 hierarchy는 추가하지 않았다.

## 닫힘 재검토 — 논리적 완결성

r24에서 닫은 다음 흐름을 다시 확인했다.

- Frontend persistent mutation → public API → Application adapter → Project EFSM.
- Frontend read → Application query → Backend read projection.
- Project commit → ProjectMutationResult → Backend reconciliation query → Frontend FSM.
- final Frontend state + Backend read projection → renderer.
- Frontend FSM과 renderer의 Backend direct import 없음.
- SELECT_SLOT optional contentType command ordering 유지.
- lifecycle task owner는 Application boundary.
- mixed physical file의 logical responsibility 구분.
- read-time normalization은 live ProjectObject를 변경하지 않음.

추가 cross-reference 확인:

- renderer가 사용하는 persistent action 이름 `slots.select`, `slots.swap`은 r24 public API surface에 정의되어 있다.
- 더 이상 정의되지 않은 `slots.prepareFileDrop`을 참조하지 않는다.
- `graphEditorObjectValues`의 설명과 본문 모두 `graphEditorCommit → GRAPH_OBJECTS_REPLACED`로 이어진다.

논리적 경로에 남은 끊김을 확인하지 못했다.

## 닫힘 재검토 — 프로젝트 목적 부합

FFPX schema, ProjectObject field, chart model 의미, renderer output 의미를 바꾸지 않았다.

file drop의 기존 target selection 동작과 graph object value edit의 기존 mutation 의미를 보존하면서 API/Adapter 경계를 명시했다.

## 닫힘 재검토 — 중복과 통합

- 새 `prepareFileDrop` API: 기각하고 `slots.select` 재사용.
- 새 graph object value command: 기각하고 `GRAPH_OBJECTS_REPLACED` 재사용.
- 별도 candidate store: 추가하지 않음.
- hierarchy 변경: 없음.

r25는 r24의 구조를 확장하지 않고 누락된 cross-reference만 기존 구조에 수렴시킨다.

## fingerprint

Source Script r25 fingerprint:

`sha256:7da7df78942382dc19d66dbf0e0759cf4f621350308b2e99d79b3ef1e6b6b73f`

변경된 Source Script 파일:

- `sourcescript/renderer_runtime.py`
- `sourcescript/graphs.py`

나머지 Source Script 의미 파일도 fingerprint 계산에는 모두 포함한다.

## 하위 계층 전파

pseudocode r10, verification-model r24, Source Code r29는 이미 r24에서 stale이 되었으며 r25에 대해서도 계속 stale이다.

PlusCal 번역은 r24가 아니라 최신 closed Source Script r25를 직접 원천으로 사용해야 한다.

특히 r25의 두 보정도 번역에 포함한다.

- file-drop target 준비는 기존 public `slots.select`를 사용한다.
- graph object value edit는 `graphEditorCommit → GRAPH_OBJECTS_REPLACED`로 명시적으로 수렴한다.

## 최종 판정

r24 closure 뒤 발견된 두 cross-reference gap을 기존 API/command에 수렴시켜 제거했다.

논리적 완결성, 프로젝트 목적 부합, 중복/통합 기준에서 추가 미해결 항목을 확인하지 못했다.

따라서 Source Script r25를 **closed**로 판정한다.
