# 계획 014 — Layout selection 경계와 dashboard projection invalidation 정리

## 0. 목적과 현재 상태

이 계획은 다음 사용자 관찰 문제와 횡단 점검에서 확인한 같은 유형의 결함을 수정하기 위한 실행 계획이다.

1. Layout preview에서 slot을 선택한 뒤 preview 영역 바깥을 클릭해도 local selection이 해제되지 않는다.
2. 새 layout의 기본 바깥 여백은 0이어야 한다.
3. project asset을 trash로 이동하면서 graph/image reference가 제거되어도 dashboard projection은 다른 render trigger가 생기기 전까지 이전 reference를 표시한다.
4. trash 비우기에서 남아 있던 reference를 제거하는 경우에도 같은 stale dashboard 가능성이 있다.
5. bookmark swap에서도 과거에 같은 유형의 state-commit 후 renderer 갱신 누락이 이미 발생했다.

기본 outer margin 변경은 선행 패치 `20261014-012` / commit `53a29ff4c6bd226838767d8b994dacf2fc4cc4e3`에서 이미 적용했다. 이 계획에서는 그 변경을 다시 구현하지 않고 regression/lineage 조건으로 포함한다.

현재 개발 계층은 선행 기본값 변경 기준으로 Source Script r19 / pseudocode r5 / verification lineage r16 / Source Code r23이다.

---

## 1. 확인된 직접 원인

### 1.1 Layout preview selection 해제 경계 누락

`FastFigureLayoutOverlay`의 `layoutSelection`은 overlay lifetime에만 존재하는 UI-local `Set<slotId>`이다.

현재 해제 경로:

- 선택된 slot을 다시 클릭.
- grid 행/열 변경.
- merge/split 결과로 selection 교체.
- 명시적인 “선택 해제” 버튼.
- Layout overlay 종료.

현재 존재하지 않는 경로:

- preview grid 내부의 slot이 아닌 빈 영역 클릭.
- preview frame 바깥의 Layout Modal content 클릭.

따라서 현재 증상은 event propagation 오류가 아니라 **local selection의 background-deselect 의미가 정의되지 않은 것**이 직접 원인이다.

### 1.2 기본 outer margin 중복

선행 수정 전에는:

- 새 project 생성: `DEFAULT_SLOT_STYLE.outerMargin = 120`
- import 누락 필드 fallback: 별도 literal `120`

이 두 기본값이 독립적으로 존재했다.

선행 패치에서:

- 새 project 기본값을 0으로 변경.
- import fallback이 `DEFAULT_SLOT_STYLE.outerMargin`을 재사용.
- 기존 project에 저장된 명시적 값은 유지.

하도록 수정했다.

### 1.3 trash 이동 후 stale dashboard

`PROJECT_NODE_MOVED`의 domain mutation 자체는 정상이다.

```text
move to trash
→ candidate에서 CSV graph-object/image slot reference 제거
→ project invariant 검증
→ activeProject commit
→ selection reconciliation
```

하지만 public command `moveProjectNode()`는 성공한 `appFSM.send("PROJECT_NODE_MOVED")` 뒤 status만 갱신하고 dashboard projection을 무효화하지 않는다.

따라서 authoritative state는 이미 올바르지만 DOM/Plotly projection이 stale하게 남는다.

### 1.4 trash 비우기의 동일 가능성

`PROJECT_TRASH_EMPTIED`는 trash asset/directory를 제거하면서 남아 있는 graph/image reference도 제거할 수 있다.

그러나 `emptyProjectTrash()`의 후처리는 현재 `updateFileAvailability()`뿐이다.

정상적인 최신 흐름에서는 trash 진입 때 reference가 이미 제거되므로 흔하지 않지만, legacy/imported state처럼 trash asset에 reference가 남은 경우에는 실제 reference commit 후 dashboard가 stale할 수 있다.

---

## 2. 횡단 점검 결과

### 2.1 같은 projection invalidation 누락이 확인된 곳

확정:

- `PROJECT_NODE_MOVED` 중 entering-trash reference detach.
- `PROJECT_TRASH_EMPTIED` 중 stale/legacy reference detach.

과거 동일 유형:

- `SLOTS_SWAPPED` 후 dashboard refresh 누락. r22 이전 수정에서 이미 개별 `renderDashboard()`를 추가해 해결했다.

### 2.2 이미 projection 갱신이 있는 mutation

다음 경로는 현재 full render 또는 더 좁은 projection update가 존재한다.

- asset 삭제: `renderDashboard()`
- slot reset: `renderDashboard()`
- asset → slot connection: `renderDashboard()`
- graph objects 변경: `renderDashboard()`
- chart layout 변경: `renderDashboard()`
- grid merge/split: `renderDashboard()`
- CSV header line 변경: `renderDashboard()`
- label settings/position: `renderDashboard()` + plot resize
- UI palette: `renderDashboard()`
- image display settings: selected image element만 `syncSlotImageElement()`
- global caption text/name/settings: `syncDashboardCaption()`
- layout style: `applySlotStyle()` + zoom/plot resize

즉 모든 mutation에 full `renderDashboard()`가 필요한 것은 아니다.

### 2.3 local UI state 중 같은 selection-lifetime 문제

명확한 동일 문제는 현재 `layoutSelection`에서만 확인했다.

- Caption `targetMode`: overlay 종료 시 global로 reset.
- Print form draft: overlay 진입 때 persistent settings에서 재초기화.
- asset collision/confirmation dialogs: close/cancel에서 local state 정리.
- project tree selection: FSM/runtime selection authority를 사용하므로 별도 local selection이 아님.

Label pointer drag는 interaction cleanup 강화 가능성은 별도 검토할 수 있으나, 현재 Layout selection 잔류 문제와 같은 종류로 판정하지 않는다.

---

## 3. renderer 책임 검토

### 3.1 개별 command마다 renderDashboard를 추가하는 방식의 문제

다음 방식은 사용하지 않는 것을 우선 검토한다.

```text
moveProjectNode()       → renderDashboard()
emptyProjectTrash()     → renderDashboard()
swapSlotContents()      → renderDashboard()
resetSlotApi()          → renderDashboard()
graphEditorCommit()     → renderDashboard()
...
```

문제:

1. 새 mutation command가 추가될 때 renderer refresh를 빠뜨리기 쉽다.
2. 같은 domain event를 여러 진입점에서 호출하면 refresh 규칙이 중복된다.
3. full render가 필요하지 않은 caption/image/style mutation까지 같은 방식으로 확장되기 쉽다.
4. 이미 bookmark swap과 trash move에서 같은 누락이 반복되었다.

### 3.2 appFSM publish subscriber에 직접 full render를 연결하는 방식도 기각

현재 `ApplicationStateMachine.send()`는 하나의 logical event를 lifecycle/workspace/overlay/assetSelection/graphObject region에 순서대로 전달한다.

각 region transition/update는 `publish()`를 호출할 수 있다.

따라서 일반 `appFSM.subscribe()` listener에서 event 이름만 보고 `renderDashboard()`를 호출하면 하나의 logical mutation에 여러 render가 발생할 수 있다.

```text
one appFSM.send(EVENT)
  → workspace publish
  → overlay publish
  → assetSelection publish
  → graphObject publish
```

이 경계는 renderer invalidation의 단일 트리거로 사용하지 않는다.

### 3.3 frontend React/Mantine appFSM 구조 재검토

현재 frontend는 다음 두 projection 계층이 분리되어 있다.

```text
appFSM.state
  → appFSM.subscribe()
  → React useSyncExternalStore
  → Mantine toolbar/sidebar/editor/overlay projection

activeProject + selectedSlotId
  → renderDashboard()
  → #dashboard / Plotly / image / label / caption projection
```

구조적으로 확인된 사실:

- `#ff-react-bootstrap-root`와 `#dashboard`는 서로 다른 DOM subtree다.
- Mantine `AppShell.Main`은 현재 dashboard DOM을 React child로 소유하지 않는다.
- React가 `#dashboard`의 slot DOM을 VDOM diff하지 않는다.
- `FastFigureDashboardFileDrop`와 slot click controller는 `#dashboard` host에 delegated listener를 설치한다.
- `renderDashboard()`는 dashboard host 자체를 교체하지 않고 child slot DOM만 다시 만든다.
- `dashboardRenderGeneration`이 이전 async Plotly render를 무효화한다.

따라서 dashboard full render 자체가 React와 같은 DOM을 동시에 소유하는 충돌을 만들지는 않는다.

다만 실행 순서는 중요하다.

`PROJECT_NODE_MOVED` 같은 event는 workspace region action에서 project/reference를 먼저 commit한 뒤 같은 `send()` 뒤쪽 graphObject/assetSelection region에서 selection reconciliation을 수행한다.

따라서 workspace action 직후 full render는 너무 이르다.

```text
workspace action commit
→ renderDashboard()   ← 금지
→ graphObject selection reconciliation
→ asset selection reconciliation
```

필요한 순서는 다음이다.

```text
all handled region actions/transitions
→ selection reconciliation
→ 기존 region publish
→ appFSM.send() 반환
→ dashboard projection invalidation
```

### 3.4 appFSM 내부 completion 채널 추가는 이번 패치에서 기각

추가 검토 결과 이번 문제를 해결하기 위해 `ApplicationStateMachine` 자체에 별도 completion listener registry를 추가할 필요는 없다.

`appFSM.send()`는 동기 함수이며 반환 시점에는 handled region의 action/transition/reconciliation/publish가 완료되어 있다.

따라서 renderer invalidation은 appFSM 내부가 아니라 **send 호출을 소유한 UI/API orchestration 경계에서 send 반환 직후** 실행한다.

권장 구조:

```text
dispatchDashboardAffectingEvent(event, payload)
  → appFSM.send(event, payload)
  → applyDashboardProjectionInvalidation(event, payload)
  → final state/payload 반환
```

이 helper는 appFSM state machine의 일부가 아니다.

이 방향의 장점:

- 기존 `appFSM.subscribe() → useSyncExternalStore` contract를 변경하지 않는다.
- region publish 횟수나 event 문자열을 변경하지 않는다.
- React snapshot revision/identity 의미에 새 규칙을 추가하지 않는다.
- lifecycle transition과 renderer invalidation이 섞이지 않는다.
- `ApplicationStateMachine`이 DOM/renderer 의미를 알지 않는다.
- `send()` 반환 뒤이므로 final selection reconciliation 상태를 읽는다.

### 3.5 useSyncExternalStore snapshot identity 검토

React `useAppState()`는 `appFSM.state` 객체 자체를 snapshot으로 반환한다.

따라서 listener callback 호출만으로 React rerender가 보장되는 것이 아니라 snapshot identity가 실제로 바뀌어야 한다.

현재 관련 event 호출부를 확인한 결과:

- `PROJECT_NODE_MOVED`, `PROJECT_TRASH_EMPTIED`는 `direction: "ui-to-fsm"` payload를 사용해 handled transition에서 새 state object를 만든다.
- `SLOTS_SWAPPED`는 direction이 없지만 graphObject/assetSelection reconciliation action이 `machine.state`를 새 immutable object로 갱신한다.
- `GRID_LAYOUT_CHANGED`도 graphObject/assetSelection reconciliation에서 state object가 갱신된다.
- direct mutation 뒤 `appFSM.notify()`를 사용하는 경로는 notify가 revision을 증가시킨 새 state object를 만든다.

따라서 현재 trash stale-dashboard 문제는 React snapshot identity 문제 때문이 아니라 별도 dashboard DOM projection invalidation 누락이다.

다만 이것을 모든 미래 event의 암묵적 보장으로 취급하지 않는다.

새 domain event가 project state를 변경하고 React component도 그 값을 다시 읽어야 하는데 FSM state identity가 바뀌지 않는다면 renderer helper로 숨기지 않고 app-state notification/revision 의미를 Source Script에서 별도로 정의해야 한다.

### 3.6 renderer helper의 재진입 제한

`applyDashboardProjectionInvalidation()`은 `appFSM.send()`, `notify()` 또는 persistent mutation을 다시 호출하지 않는다.

현재 `renderDashboard()`는 project를 읽어 DOM/Plotly projection을 만들며 직접 `appFSM.send/notify`를 호출하지 않는다. 이 특성을 유지한다.

따라서 다음 순환을 구조적으로 금지한다.

```text
send
→ projection invalidation
→ renderer
→ appFSM event
→ projection invalidation
→ ...
```

renderer effect는 **read current authority → projection update** 단방향이어야 한다.

### 3.7 lifecycle과 composite command 경계

`appFSM.run()`의 importing/exporting/error/ready lifecycle transition 자체는 dashboard mutation 의미가 아니므로 renderer invalidation trigger로 사용하지 않는다.

또 하나의 public command가 여러 `appFSM.send()`를 순차 호출하는 기존 경로가 있다.

예:

```text
asset delete
→ GRAPH_OBJECTS_REPLACED 여러 번
→ DATA_OBJECT_DELETED
→ CLEAR_ASSET_SELECTION
→ 마지막에 renderDashboard()
```

이번 패치에서 이런 정상 composite command 전체를 새 helper로 기계적으로 전환하지 않는다. event마다 full render하면 중간 상태 render와 중복 Plotly 재생성이 늘어날 수 있기 때문이다.

우선 공통 helper 적용 범위는 다음으로 제한한다.

- 실제 누락이 확인된 `PROJECT_NODE_MOVED`.
- 실제 누락 가능성이 확인된 `PROJECT_TRASH_EMPTIED`.
- 이미 개별 refresh를 가진 `SLOTS_SWAPPED`은 helper 경로로 안전하게 대체되는지 regression 확인 후에만 기존 direct refresh를 제거.

나머지 정상 경로는 이번 작업에서 유지한다.

향후 renderer invalidation을 더 넓게 통합하려면 public command transaction/batching 경계를 별도로 설계한 뒤 수행한다.

### 3.8 DOM ownership과 delegated listener 안전성

`#ff-react-bootstrap-root`와 `#dashboard`는 서로 다른 DOM subtree다.

Mantine `AppShell.Main`은 dashboard를 React child로 소유하지 않고, `renderDashboard()`는 `#dashboard` children만 재생성한다.

slot click controller와 `FastFigureDashboardFileDrop`은 `#dashboard` host에 delegated listener를 설치한다.

따라서 full dashboard render가:

- React VDOM과 같은 child DOM을 동시에 소유하거나,
- slot child 교체 때문에 host-level listener를 매번 재설치하는

구조는 아니다.

이 separation을 유지한다.

---

## 4. 권장 renderer invalidation 규칙

### 4.1 logical event completion 경계

우선안은 **각 region publish가 아니라 dashboard-affecting domain event를 보내는 UI/API orchestration helper가 `appFSM.send()` 반환 뒤 한 번만 projection effect를 판정하는 경계**를 두는 것이다.

개념:

```text
dispatchDashboardAffectingEvent(EVENT, payload)
  → appFSM.send(EVENT, payload)
      → 모든 region action/transition/reconciliation/publish 완료
  → renderer projection effect 판정 1회
```

FSM 자체가 DOM renderer를 직접 호출하지 않는다.

Source Script 책임은 다음처럼 분리한다.

```text
ApplicationStateMachine
  = domain/runtime event 처리와 기존 state publish

UI/API orchestration
  = dashboard-affecting event dispatch 뒤 projection invalidation 요청

renderer_runtime
  = event + mutation result로 필요한 projection 판정/갱신
```

### 4.2 projection effect 종류

최소 세 종류로 구분한다.

#### FULL_DASHBOARD

slot DOM, Plotly/image content, label/bookmark 또는 slot ownership/reference가 바뀌어 전체 dashboard를 다시 읽어야 하는 경우.

후보 event:

- SLOTS_RESET
- SLOTS_SWAPPED
- SLOT_IMAGE_LINKED
- SLOT_DATA_CONNECTED
- SLOT_IMAGE_IMPORTED
- SLOT_CHART_IMPORTED
- GRAPH_OBJECTS_REPLACED
- CHART_LAYOUT_CHANGED
- GRID_LAYOUT_CHANGED
- PROJECT_LOADED
- PROJECT_NODE_MOVED — **실제로 rendered reference를 제거한 경우에만**
- PROJECT_TRASH_EMPTIED — **실제로 rendered reference를 제거한 경우에만**

#### TARGETED_PROJECTION

전체 slot tree를 다시 만들 필요가 없는 경우.

예:

- imageSettings → 해당 slot image element 동기화.
- global caption → caption projection 동기화.
- layout style → CSS geometry/style + plot resize.
- zoom → zoom projection + plot resize.

#### NONE

project/VFS에는 변화가 있지만 현재 dashboard projection에 의미 변화가 없는 경우.

예:

- reference 없는 asset을 directory 사이에서 이동.
- 새 directory 생성.
- asset selection만 변경.
- print/export setting 변경.

### 4.3 conditional invalidation을 payload의 UI 추측으로 만들지 않기

`PROJECT_NODE_MOVED`와 `PROJECT_TRASH_EMPTIED`는 같은 event라도 reference 변화 유무가 다르다.

renderer가 VFS를 다시 분석해 “아마 dashboard가 바뀌었을 것”이라고 추측하지 않는다.

mutation action이 이미 계산한 결과를 event result/payload에 명시한다.

예시 의미:

```text
removedGraphReferenceCount
resetImageSlotCount
```

또는 보다 일반적으로:

```text
projectionEffects = { dashboardContentChanged: true }
```

구체 필드 이름은 Source Script에서 기존 payload/result 구조와 대조한 뒤 최소한으로 확정한다.

중요한 규칙은 **mutation owner가 실제 변경 사실을 산출하고 renderer는 그 결과만 소비**하는 것이다.

### 4.4 render coalescing

logical event completion이 한 번만 발생하면 일반적으로 event당 full render도 한 번이면 충분하다.

추가로 같은 JS task에서 여러 domain event가 연속 호출되는 command가 있으므로, Source Code 단계에서는 필요하면 `requestDashboardRender()` 같은 idempotent scheduler로 같은 task/frame의 full render 요청을 합칠 수 있다.

단, 다음 조건을 지킨다.

- renderer scheduler는 project state를 소유하지 않는다.
- pending flag는 UI/runtime-local.
- semantic command 완료를 지연시키거나 rollback 의미를 바꾸지 않는다.
- immediate projection이 interaction correctness에 필요한 경우 flush 경계를 명시한다.

bookmark drag처럼 drop 직후 DOM identity가 바로 바뀌어야 하는 interaction은 실제 browser regression으로 지연 허용 범위를 확인한다.

---

## 5. Source Script 변경 계획

### 5.1 `sourcescript/api_ui.py`

`LAYOUT_PREVIEW_RULE` 또는 별도 layout selection interaction rule에 다음을 추가한다.

- layout slot selection은 Modal-local state다.
- slot click은 toggle.
- preview/background click은 current selection을 clear.
- selection을 만드는 slot click이 parent background clear까지 같이 발생하지 않도록 event boundary를 분리한다.
- merge/split/grid-change/overlay-close 후 selection reconciliation/clear 규칙을 유지한다.
- background deselection은 project/layout authoritative state를 변경하지 않는다.

### 5.2 `sourcescript/application_fsm.py`

mutation contract의 마지막 단계인:

> renderer/UI notification은 commit된 authority를 다시 읽어 projection한다.

를 다음처럼 더 구체화한다.

- `send()` 반환 시점에는 handled region의 action/transition/reconciliation/publish가 완료되어 있어야 한다.
- mutation action은 renderer가 필요한 경우 실제 reference/content 변화 결과를 payload/result에 기록.
- region별 `publish()`는 React/FSM state subscriber용이며 dashboard renderer trigger가 아니다.
- 이번 작업에서 별도 completion listener registry를 ApplicationStateMachine에 추가하지 않는다.
- project mutation이 React projection도 바꾸는데 FSM snapshot identity가 바뀌지 않는 새 event가 발견되면 renderer helper로 보정하지 않고 app-state notification/revision 의미를 별도로 정의한다.

### 5.3 `sourcescript/renderer_runtime.py`

새 공통 규칙을 정의한다.

예시 명명:

- `DASHBOARD_PROJECTION_INVALIDATION_RULE`
- `onApplicationEventCompleted(event, payload)`
- `requestDashboardProjectionRefresh(kind)`

확정할 의미:

1. logical event completion을 한 번 받는다.
2. event + mutation result에서 projection effect를 결정한다.
3. FULL_DASHBOARD면 current `activeProject/selectedSlotId`를 다시 읽어 full dashboard projection을 갱신한다.
4. TARGETED_PROJECTION이면 해당 narrow renderer를 사용한다.
5. NONE이면 DOM을 다시 만들지 않는다.
6. projection refresh는 authoritative state를 변경하지 않는다.

기존 `swapSlotContents` 문서의 개별 “commit 뒤 renderDashboard” 의미는 공통 invalidation rule을 통해 같은 결과를 얻는 방향으로 재정리한다.

### 5.4 assets/trash 의미

`PROJECT_NODE_MOVED`:

- entering trash 시 실제 제거된 graph/image reference 수를 mutation result로 남김.
- reference가 제거된 경우에만 FULL_DASHBOARD invalidation.
- path만 바뀌고 dashboard reference 의미가 그대로면 NONE.

`PROJECT_TRASH_EMPTIED`:

- 실제 removed reference count가 0이면 dashboard full render 불필요.
- 1개 이상이면 FULL_DASHBOARD invalidation.

---

## 6. PlusCal pseudocode 계획

Source Script 전체 번역 계층으로 다음을 반영한다.

### 6.1 Layout local selection

`api_ui.pcal`:

```text
LayoutSlotClick(slotId)
  → toggle local selected set

LayoutBackgroundClick()
  → selected set := {}

GridChange / OverlayClose
  → selected set := {}
```

slot click과 background click이 한 interaction에서 모두 적용되지 않는 경계를 명시한다.

### 6.2 send 반환 경계

`application_fsm.pcal`:

```text
ApplyEventActionsAndTransitions
→ Commit/Reconcile
→ PublishExistingStateTransitions
→ ReturnFinalStateAndPayload
```

별도 renderer completion state를 FSM에 추가하지 않는다.

`api_ui.pcal` 또는 해당 orchestration 절차에서:

```text
SendDashboardAffectingEvent
→ appFSM send 완료
→ DetermineProjectionEffect
→ RefreshProjection
```

순서를 직접 번역한다.

### 6.3 renderer invalidation

`renderer_runtime.pcal`:

```text
OnLogicalEventCompleted(event, result)
→ DetermineProjectionEffect
→ FULL / TARGETED / NONE
→ RefreshFromCurrentAuthority
```

projection update는 project mutation을 포함하지 않는다.

---

## 7. verification-model 범위

이번 핵심 수정은 UI-local selection과 renderer projection invalidation이다.

따라서 다음은 authoritative state invariant를 새로 만들지 않는다.

- Layout background deselection.
- render scheduling/coalescing.
- full/targeted DOM projection 선택.

다만 `PROJECT_NODE_MOVED` / `PROJECT_TRASH_EMPTIED` payload에 reference removal result를 명시하는 변경이 기존 verification model의 reference transition과 연결된다면:

- 실제 removed reference 결과가 post-state와 일치하는지 bounded assertion을 추가할지 검토.
- state transition 자체가 바뀌지 않으면 기존 reference invariant는 유지하고 lineage review에 생략 근거를 기록.

verification model을 단순히 revision 숫자만 올리기 위해 불필요하게 수정하지 않는다.

---

## 8. Source Code 구현 계획

### 8.1 Layout background deselection

`FastFigureLayoutOverlay`에 preview/background selection boundary를 구현한다.

권장 event 구조:

- slot button click은 selection toggle 후 propagation을 preview-background deselection에 전달하지 않음.
- preview grid 자체 또는 명시된 Layout selection background click은 `setLayoutSelection(new Set())`.
- NumberInput/Button/Modal action 클릭이 무조건 selection을 지워야 하는지는 Source Script에서 범위를 먼저 확정.

사용자의 표현은 “미리보기 영역 바깥을 클릭해도”이므로 구현 전 다음 의미를 plan 기준으로 사용한다.

- preview 밖 **Layout Modal의 비-slot content** 클릭은 selection clear.
- slot operation button 자체를 누른 interaction은 command가 먼저 selection을 소비해야 하므로 background clear가 선행되지 않게 한다.

구체 capture/bubble 방식은 Source Code 단계에서 결정한다.

### 8.2 dashboard-affecting event orchestration helper

`ApplicationStateMachine` 구현 자체는 변경하지 않는 것을 우선한다.

개별 command에 `renderDashboard()`를 직접 반복 추가하는 대신 UI/API orchestration layer에 하나의 공통 helper를 둔다.

개념:

```text
dispatchDashboardAffectingEvent(event, payload)
  → appFSM.send(event, payload)
  → applyDashboardProjectionInvalidation(event, payload)
```

구체 조건:

1. helper는 `appFSM.send()`가 반환한 뒤에만 renderer를 호출한다.
2. 기존 `appFSM.subscribe()`와 `useSyncExternalStore` contract는 변경하지 않는다.
3. helper는 lifecycle transition을 감시하지 않는다.
4. projection effect table은 renderer_runtime 쪽 책임으로 둔다.
5. renderer effect는 `send/notify` 또는 persistent mutation을 다시 호출하지 않는다.
6. 첫 적용 대상은 `PROJECT_NODE_MOVED`, `PROJECT_TRASH_EMPTIED`로 제한한다.
7. `SLOTS_SWAPPED`의 기존 `updateGraphView()`는 같은 helper로 안전하게 대체되는지 regression 확인 후 정리한다.
8. composite command의 기존 최종 render는 이번 작업에서 기계적으로 제거하지 않는다.

이 구조는 React/Mantine GUI state publish를 손대지 않으면서 누락된 dashboard projection만 공통 규칙으로 보완한다.

### 8.3 기존 개별 render 정리

공통 invalidation이 확정되면 다음을 분류한다.

- 공통 full invalidation으로 대체 가능한 개별 `renderDashboard()`는 제거.
- continuous drag처럼 좁고 즉각적인 projection이 필요한 경로는 targeted direct update 유지.
- startup의 최초 `renderDashboard()`는 mutation invalidation이 아니므로 유지.
- export snapshot/render는 별도 renderer이며 이 규칙 대상이 아님.

한 번에 모든 render 호출을 기계적으로 제거하지 않는다.

---

## 9. browser regression 계획

### 9.1 Layout selection

추가:

1. slot 클릭 → selected visual/state 확인.
2. 다른 slot 클릭 → multi-selection 유지.
3. preview/background 클릭 → selection 0.
4. Modal의 비-slot 빈 영역 클릭 → selection 0.
5. slot click 한 번이 toggle 직후 background clear로 상쇄되지 않음.
6. merge/split button click은 현재 selection을 command에 전달한 뒤 결과 selection 규칙을 따름.

### 9.2 trash move projection

기존 trash test를 강화한다.

```text
referenced CSV/image
→ move to trash
→ authoritative reference 제거
→ 별도 slot selection/click 없이
→ dashboard DOM/Plotly/image projection도 즉시 제거
```

### 9.3 trash empty projection

legacy/stale reference를 직접 valid test fixture로 구성할 수 있는 범위에서:

- trash empty가 reference를 실제 제거하면 dashboard도 같은 interaction 후 갱신.
- reference가 없는 trash empty는 불필요한 semantic side effect가 없음.

### 9.4 duplicate render와 GUI appFSM 순서 검증

test instrumentation으로 다음을 확인한다.

1. 하나의 dashboard-affecting event dispatch는 `appFSM.send()` 내부 region publish 수와 무관하게 projection invalidation을 최대 한 번 수행.
2. React `useSyncExternalStore` subscriber는 기존 publish 횟수/상태 전이를 그대로 받으며 helper 때문에 별도 FSM revision/publish가 추가되지 않음.
3. `PROJECT_NODE_MOVED`처럼 selection reconciliation이 필요한 event는 `send()` 반환 뒤의 최종 asset/graph selection을 dashboard와 editor가 동일하게 읽음.
4. projection renderer가 새 `appFSM.send/notify`를 발생시키지 않아 재귀 event cycle이 생기지 않음.
5. `appFSM.run()` lifecycle start/complete transition만으로 dashboard full render가 추가되지 않음.
6. dashboard child DOM 재생성 뒤에도 host-level delegated slot/drop listener가 한 번만 유지됨.
7. target event 처리 뒤 `appFSM.state` snapshot identity가 실제로 갱신되어 React editor/tree가 stale하지 않은지 확인.
8. helper를 거치지 않는 기존 composite command의 render 횟수/순서는 이번 변경 전과 동일함.

정확한 performance threshold를 정책으로 만들지는 않고, 최소한 region publish 수만큼 full render가 중복되는 구조는 허용하지 않는다.

### 9.5 기본 여백

선행 test 유지:

- `createProjectState().layout.slotStyle.outerMargin === 0`.
- 저장 project의 명시적 outerMargin import는 보존.
- outerMargin 누락 import는 default 0.

---

## 10. 패치 순서

### A. Source Script

- layout selection background clear semantics.
- logical event completion / projection invalidation 책임.
- trash move/empty mutation result의 renderer-relevant 결과 의미.
- revision/fingerprint/closure review.

### B. PlusCal pseudocode

- Source Script 전체 관련 의미 직접 번역.
- translation review.

### C. verification lineage/model

- reference result assertion 필요 여부 판단.
- 필요하면 model/TLC 실행.
- 불필요하면 model unchanged 근거와 lineage review.

### D. Source Code

- Layout background deselection.
- logical event completion hook + renderer projection-effect table.
- move/trash/swap 등 중복/누락 render 경로 정리.
- APP build/source-code revision.

### E. validation

- browser regression.
- development layer checker.
- hosted regression.
- distribution build.
- final Source Code validation review.

---

## 11. 변경하지 않을 범위

- Layout selection을 persistent project state로 승격하지 않음.
- 모든 appFSM publish마다 full render하지 않음.
- 모든 mutation을 무조건 full `renderDashboard()`로 통일하지 않음.
- caption/image/style의 기존 좁은 renderer를 이유 없이 full render로 대체하지 않음.
- renderer가 project mutation 결과를 VFS/DOM에서 역추론하지 않음.
- 기존 저장 project의 explicit outerMargin을 0으로 migration하지 않음.
- export/capture renderer를 dashboard invalidation 체계에 강제로 합치지 않음.

---

## 12. 완료 조건

1. Layout preview selection이 정의된 background click에서 해제된다.
2. slot click 자체가 background deselection에 의해 즉시 취소되지 않는다.
3. 새 project outerMargin 기본값은 0이다.
4. missing outerMargin import fallback도 0이다.
5. 기존 explicit outerMargin은 보존된다.
6. trash 이동으로 reference가 제거되면 별도 사용자 interaction 없이 dashboard가 갱신된다.
7. trash empty가 reference를 제거하는 경우에도 dashboard가 갱신된다.
8. 단순 VFS path move처럼 dashboard 의미가 안 바뀌는 mutation은 불필요한 full render를 요구하지 않는다.
9. 하나의 dashboard-affecting event가 여러 region publish를 만들더라도 full dashboard render는 orchestration helper에서 한 번만 요청된다.
10. 기존 `appFSM.subscribe() → useSyncExternalStore` GUI state publish semantics는 변경되지 않는다.
11. dashboard invalidation helper는 `appFSM.send()` 반환 뒤 실행되어 모든 region selection reconciliation과 기존 publish 이후의 state를 읽는다.
12. renderer invalidation은 appFSM event/persistent mutation을 다시 발생시키지 않는다.
13. lifecycle transition 자체가 dashboard invalidation으로 오인되지 않는다.
14. 현재 target mutation 뒤 React snapshot identity와 editor/tree projection도 stale하지 않다.
15. targeted projection이 충분한 image/caption/style interaction은 full render로 강제되지 않는다.
16. 기존 composite command를 무리하게 event별 full render로 분해하지 않는다.
17. Source Script → pseudocode → 필요 verification → Source Code lineage가 current다.
18. browser regression, development version check, hosted build가 모두 통과한다.
