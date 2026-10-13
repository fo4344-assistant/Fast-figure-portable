# 계획 013 — Mantine Tree 전환과 상호작용/Overlay 회귀 수정

## 0. 문서의 위치와 선행 계획

이 문서는 `agent_space/policies/source-script-policy.md` v0.2.6과 현재 `agent_space/AGENT.md`를 다시 확인한 뒤 작성한 작업 계획이다.

`plan-012.md`에서 다룬 문제 범위를 이어받지만, 다음 정책 해석을 명시적으로 반영하여 이 문서를 후속 실행 계획으로 사용한다.

- 기능 의미와 책임은 Source Script에서 먼저 확정한다.
- PlusCal pseudocode는 Source Script 전체 의미의 직접 번역 계층이다.
- Mantine `Tree`, DOM event, ResizeObserver, pointer capture 같은 구체 library/browser 선택은 Source Code 단계의 저수준 구현이다.
- 다만 library contract가 고수준 의미나 책임을 바꾸는 경우에는 Source Script에 외부 의존성 의미를 먼저 명시해야 한다.
- 영속 project state, VFS, slot/chart reference의 권위는 기존 authority를 유지하고 UI-local state나 Mantine 내부 상태를 새 authority로 만들지 않는다.
- 현재 프로젝트는 verification-model/TLC gate를 사용하므로 상태 기반 의미를 변경하는 범위는 현재 pseudocode에서 파생한 verification model을 갱신하고 TLC를 통과한 뒤 Source Code를 current로 올린다.

이 계획은 `plan-012.md`의 작업 범위를 대체·구체화한다. 기존 계획 문서는 이력으로 유지하고 수정하지 않는다.

---

## 1. 사용자 요구와 확인된 회귀

이번 작업은 다음 사용자 관찰 가능 문제를 하나의 coherent UI-porting 작업으로 처리한다.

### 1.1 Project data tree의 Mantine 전환 회귀

현재 `FastFigureProjectDataTree`는 Mantine의 `Stack / Group / Button`을 조합해 tree 구조를 수동 구현한다.

그 결과 기존 resource row 자체에 있던 drag surface가 Mantine 전환 후 다음처럼 바뀌었다.

```text
Group
  draggable / onDragStart
  ├─ Button        ← 실제 사용자가 잡는 대부분의 표면
  └─ Menu target
```

이 구조에서는 resource row의 실제 interactive surface와 native draggable element가 분리되어 기존 asset → slot drag UX가 약화되거나 동작하지 않을 수 있다.

현재 vendored runtime은 Mantine 9.5.2이고, 이 버전의 `Tree`는 다음 API를 이미 제공한다.

- hierarchy/expand/collapse
- keyboard tree navigation
- `renderNode`
- `onDragDrop`
- `allowDrop`
- `withDragHandle`
- drag element props / drop-position UI

따라서 `/assets` 계층은 커스텀 재귀 tree를 계속 확장하기보다 Mantine `Tree`로 전환한다.

### 1.2 trash resource 비활성화

현재 trash subtree의 CSV/image는 data tree에서 disabled 처리된다.

또 `movableProjectNode()`가 trash path 전체를 이동 불가로 판정해, trash로 보낸 resource를 tree UI에서 일반 directory로 복구할 수 없다.

그러나 trash 진입 시 기존 graph/slot reference를 detach하는 의미는 의도된 기능이다.

따라서 다음 두 의미를 분리한다.

```text
trash 진입
→ 현재 graph/slot reference detach

trash membership
≠
tree resource 자체의 selection/move 금지
```

### 1.3 tree resource → slot drag

기존 구조에는 project asset을 오른쪽 slot 영역으로 drop해 `connectToSlot`하는 기능이 있었다.

현재 Source Code에도 오른쪽 slot의 drop receiver는 남아 있다.

```text
tree resource drag
→ right-side /slots drop target
→ assets.connectToSlot(path, kind, slotId)
```

이번 작업에서는 이 기능을 신규 기능으로 재설계하지 않고 Mantine 전환에서 깨진 기존 interaction을 복구한다.

### 1.4 bookmark slot drag 직후 projection 미갱신

현재 bookmark drag/drop은 `SLOTS_SWAPPED`를 통해 project state와 `selectedSlotId`를 정상 변경하지만, 성공 직후 dashboard renderer refresh가 없다.

따라서 실제 state는 교환된 뒤에도 다른 selection/render trigger 전까지 화면이 이전 배치를 표시할 수 있다.

### 1.5 설정 Overlay resize와 Layout preview 왜곡

지난 수정에서 Layout preview 아래의 세로 handle을 `previewWidth` 변경기로 해석했다.

현재 구조는 대략 다음과 같다.

```text
vertical pointer delta
→ previewWidth 변경
→ rendered width는 maxWidth로 다시 제한될 수 있음
→ preview height/geometry와 실제 DOM width가 다른 기준을 가질 수 있음
```

이 결과 사용자는 아래쪽 handle을 세로로 끌었는데 preview 폭이 바뀌고 높이는 기대한 방식으로 따라오지 않아 실제 layout aspect와 다른 preview를 볼 수 있다.

사용자가 요구한 의미는 다음과 같다.

- 설정 popup/Modal 아래쪽의 handle은 popup 높이를 늘이고 줄인다.
- Layout preview는 resize handle의 직접 조작 대상이 아니다.
- Layout preview의 width와 height는 같은 rendered geometry 기준에서 계산되어 설정 aspect를 항상 보존한다.

---

## 2. 정책상 책임 분리

### 2.1 Source Script가 결정할 의미

다음은 사용자 관찰 가능 기능 의미이므로 Source Script에서 먼저 확정한다.

1. tree resource의 선택 가능 여부.
2. tree node의 move 가능 조건.
3. trash 진입/이탈의 reference 의미.
4. tree resource를 slot에 연결할 수 있는 조건.
5. bookmark slot swap 뒤 renderer projection을 현재 state에 맞춰 갱신해야 한다는 의미.
6. 설정 overlay의 높이를 UI-local interaction으로 조절할 수 있다는 의미.
7. Layout preview가 layout aspect를 보존해야 한다는 의미.
8. overlay resize state가 project state가 아니라 component/UI-local state라는 책임 경계.

### 2.2 PlusCal pseudocode가 구체화할 내용

Source Script의 위 의미를 다음 실행 절차로 직접 번역한다.

- resource selection branch
- tree move candidate/validation/commit
- entering-trash reference detach
- leaving-trash path mutation과 reference 비복원
- slot connection precondition
- bookmark drop → swap command → projection refresh
- overlay resize interaction의 UI-local state 경계
- preview geometry projection의 입력/출력 관계

특정 Mantine prop 이름이나 browser API는 pseudocode에 넣지 않는다.

### 2.3 Source Code에서 결정할 저수준 구현

다음은 Source Code 단계에서만 결정한다.

- Mantine 9.5.2 `Tree` 사용
- `TreeNodeData` projection 형태
- `renderNode`, `onDragDrop`, `allowDrop`, `withDragHandle`의 구체 조합
- native `DataTransfer` payload
- pointer capture
- `ResizeObserver` 사용 여부
- Mantine `Modal`의 style/height 적용 방식
- concrete CSS size/min/max 값

이 구현 선택이 상위 의미를 바꾸면 Source Code에서 우회하지 않고 Source Script 단계로 되돌아간다.

---

## 3. 권위와 데이터 흐름

### 3.1 Project/VFS authority

계속 유지:

```text
activeProject / project VFS
    ↓ read projection
FastFigureApi.assets.readTree()
    ↓
Mantine Tree data
```

Mantine Tree의 data는 projection이다.

다음 구조는 금지한다.

```text
Mantine Tree local moved data
→ 별도 UI authority
→ 나중에 VFS와 동기화
```

Tree internal drag 결과는 command input으로만 사용한다.

```text
Mantine Tree onDragDrop payload
→ current VFS에서 source/target 재해석
→ assets.planMove()
→ assets.move()
→ authoritative VFS commit
→ readTree()로 새 projection
```

### 3.2 Selection authority

asset selection은 기존 app FSM/runtime selection authority를 유지한다.

Mantine Tree의 선택 표현은 그 상태의 projection이어야 한다.

독립적인 Mantine selected-state를 장기 authority로 두고 양방향 sync하지 않는다.

### 3.3 Overlay resize state

설정 overlay 높이는 project에 저장하지 않는다.

각 opened overlay lifetime 동안만 유지되는 UI-local state로 둔다.

공통 resize component/helper는 interaction algorithm을 공유할 수 있지만, 각 overlay instance의 현재 높이를 독립적인 global state로 승격하지 않는다.

### 3.4 Layout preview geometry

preview geometry의 기준은 하나만 둔다.

```text
actual rendered preview width
→ dashboard/layout geometry calculation
→ preview height/gap/margin/radius
→ DOM projection
```

requested width와 rendered width를 서로 다른 authority처럼 관리하지 않는다.

preview width를 별도의 draggable semantic state로 두지 않는다.

---

## 4. Source Script 변경 계획

### 4.1 `sourcescript/api_ui.py`

Project data tree 의미를 다음과 같이 수정한다.

#### Tree interaction

- `FastFigureProjectDataTree`는 project VFS/assets의 projection이다.
- asset row는 trash membership만으로 disabled 처리하지 않는다.
- CSV/image/directory selection은 existing public selection command를 사용한다.
- tree move gesture는 기존 `planMove → move` command로 수렴한다.
- tree drag source 여부와 slot connection 가능 여부는 서로 다른 판정이다.

#### Slot connection

- normal CSV/image는 slot connection source가 될 수 있다.
- trash CSV/image는 tree move source가 될 수 있지만 slot connection source로는 거부한다.
- directory는 slot connection source가 아니다.
- hidden/invalid slot에는 연결하지 않는다.
- selection 자체는 slot connection을 발생시키지 않는다.

#### Mantine dependency boundary

Source Script에는 Mantine `Tree` prop 이름을 도메인 규칙으로 넣지 않는다.

단, UI tree가 다음 capability를 제공해야 한다는 contract만 표현한다.

- hierarchy projection
- expand/collapse
- node selection input
- node drag source
- directory drop intent
- resource-to-slot drag payload 전달

### 4.2 `sourcescript/assets_files.py`

move 의미를 다음처럼 닫는다.

- fixed directory는 move 불가.
- `/assets/trash` root는 fixed directory로 유지.
- trash descendant의 user directory/CSV/image는 source로 이동 가능.
- target directory는 기존 VFS validation을 사용.
- directory self/descendant move는 거부.
- collision/unique-name 처리는 기존 path를 유지.
- non-trash → trash 진입일 때만 현재 references를 detach.
- trash → normal directory 이동은 reference를 자동 복원하지 않는다.
- leaving-trash 결과는 단지 새 canonical path를 가진 일반 project asset/node다.

### 4.3 `sourcescript/renderer_runtime.py`

bookmark drag 의미를 보강한다.

```text
valid bookmark drop
→ SLOTS_SWAPPED authoritative commit
→ selected payload identity reconciliation
→ current state 기준 dashboard projection refresh
→ drag runtime cleanup
```

renderer refresh 자체는 project mutation이 아니며 authoritative state를 다시 수정하지 않는다.

### 4.4 Overlay/UI sizing 의미

현재 `api_ui.py`의 settings overlay 공통 sizing 규칙을 확장한다.

Layout / Label / Caption / Print:

- 공통 outer width ownership 유지.
- 각 overlay는 하단 세로 resize interaction을 제공한다.
- resize는 overlay height만 바꾼다.
- height는 UI-local.
- resize가 domain/project/layout state를 변경하지 않는다.
- close/unmount 시 active pointer interaction을 정리한다.
- viewport/minimum-content 제한을 만족한다.

README/collision 등 다른 목적 Modal은 자동 포함하지 않는다.

### 4.5 Layout preview

Layout preview 의미를 다음처럼 명시한다.

- preview는 layout slotStyle.aspect를 표시 의미로 보존한다.
- preview의 실제 rendered width가 geometry 계산의 기준이다.
- preview height는 같은 width와 aspect에서 유도한다.
- gap/outerMargin/radius 등 scale-dependent geometry도 같은 width에서 유도한다.
- overlay height resize는 preview width를 직접 변경하는 command가 아니다.
- preview 아래 별도 preview-size drag semantic은 두지 않는다.

---

## 5. Source Script 닫힘 판정

Source Script revision을 올린 뒤 별도 closure review에서 정책 §4.6의 세 항목을 실제 근거와 함께 확인한다.

### 5.1 논리적 완결성

확인 항목:

- normal/trash resource 각각의 select/move/connect 경로가 입력부터 결과까지 끊기지 않는가.
- entering-trash와 leaving-trash의 reference 의미가 모순되지 않는가.
- bookmark swap state commit과 renderer projection 순서가 명확한가.
- overlay resize와 preview geometry가 서로 다른 책임으로 분리되어 있는가.
- preview aspect 계산 기준이 하나인가.

### 5.2 프로젝트 목적 부합

확인 항목:

- Mantine 포팅 목적이 UI primitive 통합이지 새 VFS/state system 추가가 아닌가.
- 사용자 요구에 없는 restore history, undo, trash direct-slot-link 같은 기능이 추가되지 않았는가.
- 기존 asset→slot 기능은 복구하되 새로운 연결 의미로 확장하지 않았는가.

### 5.3 중복과 통합·확장

확인 항목:

- custom tree state와 Mantine Tree state가 이중 authority가 되지 않는가.
- move rule과 slot-connect rule을 하나의 `draggable` boolean으로 다시 합치지 않았는가.
- 네 settings overlay가 resize algorithm을 중복 구현하지 않는가.
- preview requested/rendered size를 양방향 sync하는 구조를 만들지 않았는가.

해결되지 않은 항목이 있으면 Source Script를 closed로 표시하지 않는다.

---

## 6. PlusCal pseudocode 변경 계획

현재 Source Script module hierarchy를 그대로 유지하며 관련 `.pcal`을 수정한다.

### 6.1 `pseudocode/api_ui.pcal`

직접 번역할 절차:

- ProjectTreeSelectNode
- ProjectTreeBeginDrag
- ProjectTreeDropToDirectory
- ProjectAssetDropToSlot
- SettingsOverlayResizeStart/Move/End
- LayoutPreviewProjection

의미:

```text
treeMoveEligible(path)
!=
slotConnectionEligible(path, kind)
```

trash asset:

```text
tree move = allowed
slot connection = rejected
```

overlay height는 runtime/UI-local state이며 project authority에 쓰지 않는다.

### 6.2 `pseudocode/assets_files.pcal`

- movable source 판정
- fixed trash root 거부
- entering trash detach
- leaving trash without reference restore
- candidate → validate → commit

을 Source Script와 같은 순서로 표현한다.

### 6.3 `pseudocode/renderer_runtime.pcal`

BookmarkDrop에:

```text
SwapSlotContents
→ RefreshDashboardProjection
→ ClearDragRuntime
```

순서를 명시한다.

refresh는 domain mutation이 아니다.

### 6.4 번역 review

pseudocode revision을 올리고 현재 Source Script fingerprint를 `derived_from.source-script`에 기록한다.

translation review에서 다음을 대조한다.

- module 대응
- branch
- mutation precondition
- reference detach/non-restore
- swap 후 projection sequencing
- overlay resize local-state 경계
- preview aspect projection

---

## 7. verification-model/TLC 계획

현재 프로젝트는 TLC gate를 사용하므로 상태 의미가 바뀌는 부분은 현재 pseudocode에서 필요한 verification model을 파생해 검증한다.

### 7.1 모델에 포함할 상태 의미

- node location: normal/trash
- node kind: directory/csv/image
- fixed root 여부
- current resource reference 존재 여부
- tree move eligibility
- slot connection eligibility
- entering-trash transition
- leaving-trash transition
- swap selected payload identity

### 7.2 검사할 invariant/property

1. fixed trash root는 move되지 않는다.
2. normal → trash 이동 후 해당 asset의 기존 reference는 남지 않는다.
3. trash → normal 이동은 가능하다.
4. trash → normal 이동이 과거 reference를 자동 생성하지 않는다.
5. trash asset은 slot connection 대상이 아니다.
6. normal compatible asset은 slot connection 대상이 될 수 있다.
7. tree move eligibility와 slot connection eligibility가 서로 독립적이다.
8. slot swap 후 selected payload identity가 source/target 교환 의미와 일치한다.

### 7.3 verification model에서 생략할 구현 세부

다음은 표시/UI-local 구현이므로 verification state로 만들지 않는다.

- Mantine `Tree` prop 이름
- HTML `draggable`
- DataTransfer concrete MIME
- pointer capture
- ResizeObserver
- concrete Modal pixel height
- CSS cursor
- preview border/visual styling

Overlay height와 preview geometry는 authoritative/shared state를 변경하지 않는 단방향 UI projection이므로, 별도 상태공간 검증을 생략할 경우 validation review에 생략 이유와 한계를 기록한다.

---

## 8. Source Code 구현 계획

Source Script/pseudocode/TLC가 current가 된 뒤에만 구현한다.

### 8.1 Mantine Tree 전환

`fast-figure-ui.js::FastFigureProjectDataTree`의 `/assets` 계층을 Mantine `Tree`로 교체한다.

구체 구현:

- vendored Mantine 9.5.2의 `Tree` 사용.
- `TreeNodeData.value`에는 canonical project path 사용.
- `renderNode`에서 directory/resource label, metadata, menu action 렌더.
- selection은 기존 `assetApi.selectDirectory/selectCsv/selectImage` command 호출.
- `onDragDrop`은 payload를 직접 local tree mutation에 쓰지 않고 current VFS 기준으로 destination을 계산한 뒤 `planMove/move` 호출.
- `allowDrop`은 UI feedback용 precondition projection으로 사용하되 authoritative validation은 `planMove/move`에서 다시 수행.
- 필요하면 `withDragHandle`을 사용하되 resource→slot drag UX를 방해하지 않는지 browser regression으로 결정한다.

Mantine `moveTreeNode()`는 authoritative project mutation에 사용하지 않는다.

### 8.2 /slots drop target 유지

`/slots`는 VFS tree가 아니므로 Mantine Tree 내부로 억지로 합치지 않는다.

현재 별도 slot projection/drop target을 유지한다.

Mantine Tree drag가 생성하는 canonical path payload를 기존:

- `allowProjectAssetSlotDrop`
- `dropProjectAssetOnSlot`
- `assetApi.draggableAsset`
- `assetApi.connectToSlot`

경로로 전달한다.

### 8.3 trash interaction

- asset row의 trash 기반 `disabled` 제거.
- `movableProjectNode()`에서 trash membership 자체를 source move 금지 이유로 제거.
- fixed directory 판정은 유지.
- `draggableProjectAsset()`은 slot connection eligibility 의미로 한정하고 trash asset 거부 유지.
- menu 이동과 tree drag가 같은 `planMove/move` authority를 사용하게 한다.

### 8.4 bookmark swap

`swapSlotContents()`의 successful `appFSM.send("SLOTS_SWAPPED", ...)` 뒤 current state를 다시 읽는 기존 dashboard refresh 경로를 호출한다.

중복 domain mutation은 하지 않는다.

`dashboardRenderGeneration` 기반 stale Plotly render 방지는 유지한다.

### 8.5 공통 settings overlay resize

Layout / Label / Caption / Print에 공통 resize wrapper/component/helper를 적용한다.

공통 요소:

- current UI-local height
- pointerdown start height
- pointermove vertical delta
- min/max clamp
- pointerup/cancel cleanup
- bottom handle rendering

각 overlay가 별도 algorithm을 복사하지 않는다.

width는 기존 `fastFigureTheme.other.settingsModalSize`를 계속 사용한다.

### 8.6 Layout preview 수정

현재 제거 대상:

- `previewWidth`를 세로 drag로 변경하는 의미
- `previewResizeRef`
- `startPreviewResize`
- `movePreviewResize`
- `stopPreviewResize`
- preview 아래의 preview-size separator

유지/재구성:

- preview frame 실제 width 측정 또는 동일한 단방향 container measurement
- `layoutApi.readState(actualRenderedWidth)`
- `previewGeometry.height` 포함 모든 scale-dependent geometry를 같은 width 기준으로 계산
- centered rendering
- aspect 유지

Modal height 변화가 preview width를 바꾸지 않는다면 preview geometry는 그대로 유지한다.
Modal/viewport width 때문에 actual preview width가 바뀌면 height도 같은 frame에서 함께 갱신한다.

---

## 9. Browser regression 계획

기존 `agent_space/tests/browser-regression.js`를 확장한다.

### 9.1 Mantine Tree

- `/assets`가 Mantine tree semantics로 렌더됨.
- resource node의 actual dragstart가 발생함.
- tree directory drop이 existing move command로 수렴함.
- invalid descendant/fixed-root move가 거부됨.

### 9.2 asset → slot drag

normal CSV와 image 각각 최소 한 경로를 검사한다.

```text
tree node drag
→ /slots target drop
→ connectToSlot
→ correct slot reference
```

drag source asset 자체의 path/identity가 move되지 않았는지도 확인한다.

### 9.3 trash

- trash CSV/image row가 disabled가 아님.
- trash asset selection 가능.
- trash asset을 normal directory로 drag/move 가능.
- entering trash에서 reference detach 확인.
- leaving trash 후 reference 자동 복원 없음.
- recovered asset은 다시 일반 slot connection 가능.
- trash 상태에서는 slot direct drop 거부.
- fixed trash root move 거부.

### 9.4 bookmark swap

기존 model swap 검사 외에 drop 직후 DOM을 검사한다.

- 별도 click/selection 변화 없이 source/target rendered payload가 즉시 바뀜.
- selected payload가 이동했다면 selected class/editor target이 reconciled selection과 일치.
- post-drag click suppression 유지.

### 9.5 settings overlay resize

Layout / Label / Caption / Print 각각:

- bottom resize handle 존재.
- vertical drag로 Modal height 증가/감소.
- width는 변경되지 않음.
- project semantic state fingerprint/관련 layout state가 resize 자체로 바뀌지 않음.
- close/cancel 뒤 stale pointer interaction 없음.

### 9.6 Layout preview aspect

여러 Modal height와 viewport width 조건에서:

```text
renderedPreviewWidth / renderedPreviewHeight
≈ configured aspect
```

를 허용 오차 내에서 검사한다.

추가 확인:

- preview 아래 preview-width drag handle 없음.
- overlay height drag가 preview width command를 발생시키지 않음.
- container width clamp가 발생해도 preview height/gap/margin/radius가 같은 actual width 기준으로 갱신됨.

---

## 10. version/patch/review 기록 계획

모든 실제 변경은 `agent_space/AGENT.md`에 따라 정확한 diff patch와 같은 basename의 설명 Markdown을 남긴다.

### 단계 A — Source Script

- Source Script 의미 파일 수정.
- source-script revision/fingerprint 증가.
- 같은 commit의 patch pair에 실제 Source Script diff와 `development-versions.json` diff 포함.
- closure review 작성.

### 단계 B — PlusCal pseudocode

- 현재 Source Script를 전체 의미 기준으로 직접 번역.
- pseudocode revision/fingerprint 증가.
- `derived_from.source-script` 갱신.
- translation review 작성.

### 단계 C — verification/TLC

- 필요한 verification model만 현재 pseudocode에서 파생.
- verification revision/fingerprint 증가.
- `derived_from.pseudocode`와 source trace 갱신.
- hosted TLC 실행.
- bound/abstraction/생략 항목/결과를 validation review에 기록.

### 단계 D — Source Code

- Mantine Tree 전환과 UI 회귀 수정 구현.
- source-code revision/fingerprint 증가.
- current Source Script/pseudocode/verification lineage 기록.
- exact diff patch + 설명 Markdown 작성.

### 단계 E — validation/build

- browser regression.
- `scripts/check-development-layer-versions.py`.
- GitHub-hosted development-layer workflow.
- distribution build.
- 생성 산출물이 변경되면 build artifact commit 확인.
- 최종 review에 테스트/빌드 commit과 run 결과 기록.

self-hosted runner는 사용하지 않는다.

---

## 11. 패치 분리 원칙

이 작업은 기능적으로 연결되어 있지만 rollback 가능성을 위해 다음 ownership 경계로 패치를 나눈다.

1. Source Script 의미 수정 + version metadata.
2. pseudocode 번역 + metadata.
3. verification model/TLC 관련 변경.
4. Source Code UI/renderer 수정.
5. browser regression/validation 보완이 구현 diff와 분리되어야 할 명확한 이유가 있을 때만 별도 패치.

같은 ownership 변경을 단순히 파일별로 쪼개지 않는다.

특히 Mantine Tree UI와 이를 위해 필요한 public command 의미를 서로 다른 임시 구현 패치로 분리해 legacy bridge를 만들지 않는다.

---

## 12. 변경하지 않을 범위

이번 작업에서 하지 않는다.

- trash 진입 시 reference detach 제거
- trash asset의 direct slot connection 허용
- 원래 위치를 기억하는 restore history 추가
- undo/redo 시스템 추가
- Mantine Tree local data를 VFS authority로 승격
- legacy DOM tree를 숨겨 놓고 Mantine Tree가 호출하는 bridge 구성
- preview size를 project state에 저장
- overlay height를 project/FFPX에 저장
- preview 아래 세로 drag로 width 직접 변경
- README/collision Modal을 settings overlay resize 대상으로 자동 확대
- 새로운 DnD library 추가
- 정책 문서 수정

---

## 13. 완료 조건

다음이 모두 충족되어야 작업 완료로 판정한다.

1. Source Script가 §4.6 기준으로 closed이며 근거 review가 있다.
2. PlusCal pseudocode가 새 Source Script의 전체 의미를 충실하게 번역하고 current다.
3. 변경된 상태 의미에 필요한 verification model이 current이고 TLC가 passed다.
4. `/assets` data tree가 Mantine 9.5.2 `Tree` 기반이다.
5. tree projection이 VFS의 별도 authority가 아니다.
6. normal resource의 tree→slot drag가 동작한다.
7. tree 내부 resource move가 기존 VFS command를 사용한다.
8. trash asset이 data tree에서 disabled가 아니다.
9. trash descendant를 trash 밖으로 복구할 수 있다.
10. trash 진입 reference detach는 유지된다.
11. trash 밖 복구가 과거 reference를 자동 복원하지 않는다.
12. trash asset direct slot drop은 거부된다.
13. bookmark slot swap 결과가 drop 직후 화면에 반영된다.
14. Layout/Label/Caption/Print에 공통 bottom height resize handle이 있다.
15. handle drag는 Modal height만 바꾸고 project state를 바꾸지 않는다.
16. Layout preview 아래의 잘못된 preview-width resize handle이 제거된다.
17. Layout preview는 actual rendered width와 configured aspect에 맞는 height를 항상 사용한다.
18. browser regression이 통과한다.
19. development layer version check가 통과한다.
20. GitHub-hosted distribution build가 성공한다.
21. 모든 수정에 정확한 patch pair와 필요한 review 기록이 있다.
