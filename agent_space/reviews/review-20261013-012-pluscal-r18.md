# PlusCal translation review — Source Script r18

## 대상

- Source Script: r18 / closed
- Source Script fingerprint: `sha256:887df7f68b94aead928737029b63babf54ea50bad339e1874b8d635f8c7e33a7`
- PlusCal pseudocode: r4
- pseudocode fingerprint: `sha256:695c5947f4e140054b0066d57453a6d15c5012e6f8707011c536b82f3c102583`
- 변경 파일:
  - `pseudocode/api_ui.pcal`
  - `pseudocode/assets_files.pcal`
  - `pseudocode/renderer_runtime.pcal`

## 1. module 대응

Source Script의 기존 module decomposition을 유지했다.

- `api_ui.py` → `api_ui.pcal`
- `assets_files.py` → `assets_files.pcal`
- `renderer_runtime.py` → `renderer_runtime.pcal`

새 logical module이나 중간 authority를 추가하지 않았다.

## 2. project tree / trash 번역

Source Script r18의 다음 의미를 직접 번역했다.

```text
current VFS resolve
→ fixed directory 여부로 tree move source 판정
→ trash membership은 tree move 금지 조건이 아님
→ planMove
→ move
```

`api_ui.pcal::MoveProjectTreeNode`는 UI tree interaction을 기존 asset move command로 전달한다. `assets_files.pcal::PlanNodeMove`는 current VFS에서 source를 다시 resolve하고 fixed directory만 차단한다.

`assets_files.pcal::MoveNode`는:

- entering trash일 때 reference detach
- leaving trash일 때 detached reference를 복원하지 않음
- directory descendant move
- validation 후 commit

순서를 보존한다.

## 3. tree move와 slot connection 분리

`api_ui.pcal::ConnectExistingAsset`은 explicit slot connection에서:

- path/kind/slot resolve
- non-trash
- CSV/image kind

조건을 요구한다.

따라서 trash asset은 tree move source가 될 수 있지만 slot connection source가 아니다. 두 허용 조건을 하나의 draggable 상태로 합치지 않았다.

## 4. selection 의미

`SelectProjectTreeNode`는 current VFS에서 node를 resolve한 뒤 기존 selection command로 전달한다.

tree projection 자체가 selection authority를 소유하지 않는다.

## 5. settings overlay resize 번역

`StartSettingsOverlayResize → MoveSettingsOverlayResize → EndSettingsOverlayResize` 절차를 추가했다.

상태는 다음 UI-local interaction 값에 한정된다.

- 시작 pointer 위치
- 시작 height
- 현재 overlay height
- interaction active 여부

`MoveSettingsOverlayResize`는 project authority가 변경되지 않는다는 조건을 명시한다.

구체 CSS size, pointer capture API, Mantine Modal prop은 pseudocode에 넣지 않았다.

## 6. Layout preview 번역

`ReadLayoutPreview(renderedWidth)`는 actual rendered width를 `LayoutApiReadState` 입력으로 사용하고, returned preview geometry가 같은 rendered width와 configured aspect를 사용한다는 predicate를 확인한다.

Source Script의 `dashboardGeometry` 계산 의미를 보존하면서 pseudocode 단계에서 별도 수치 타입/브라우저 측정 API를 발명하지 않았다.

preview 전용 resize state는 추가하지 않았다.

## 7. bookmark swap 번역

`renderer_runtime.pcal::SwapSlotContents`는:

```text
SLOTS_SWAPPED command
→ commit dispatch
→ reconciled selectedSlotId read
→ RenderDashboard
```

순서를 명시한다.

renderer refresh는 swap mutation을 반복하지 않는다. `BookmarkDrop`의 drag-source cleanup과 post-drag click suppression 흐름은 기존 의미를 유지한다.

## 8. failure / mutation 경계

- tree move는 plan이 없으면 mutation하지 않는다.
- invalid/fixed source는 move plan을 만들지 않는다.
- slot connection precondition이 실패하면 persistent command를 만들지 않는다.
- swap은 valid visible distinct slots에서만 실행된다.
- overlay resize는 project mutation 경로를 호출하지 않는다.

기존 candidate/validation/commit 책임은 `assets_files.pcal`에 유지했다.

## 9. Source Script에 없는 의미 추가 여부

다음 구현 세부는 추가하지 않았다.

- Mantine Tree prop/API 이름
- DataTransfer MIME
- DOM hierarchy
- concrete modal min/max pixel
- ResizeObserver
- pointer capture
- local tree data mutation

새 domain state, persistent field, restore history도 추가하지 않았다.

## 10. 결론

r4 pseudocode는 Source Script r18의 변경 의미를 기존 module hierarchy와 authority 경계를 유지한 채 언어중립 실행 절차로 직접 번역한다.

Source Code 구현자가 다음 고수준 규칙을 새로 결정할 필요가 없다.

- trash/tree move 허용 범위
- slot connection 허용 범위
- entering/leaving trash reference 의미
- swap 후 projection refresh 순서
- settings overlay resize의 local-state 경계
- Layout preview geometry의 단일 width 기준

번역 충실도와 구체화 수준: **충족**.

다음 단계는 이 pseudocode에서 상태 기반 검증이 필요한 범위를 verification model에 반영하고 TLC를 실행하는 것이다.
