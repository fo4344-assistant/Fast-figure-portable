# review-003 — slot swap 인접 EFSM 전이 감사

## 범위

`plan-004.md`의 후속 순서에 따라 `20260831-007`이 추가한 `SLOTS_SWAPPED`가 기존 인접 전이인 `SLOTS_RESET`, `SELECT_SLOT`의 의미를 바꾸거나 `workspace`, `overlay`, `graphObject`, `assetSelection` region 사이에 상태 불일치를 만드는지 검토했다.

검토 대상:

- `agent_space/patches/20260831-007.patch`
- `agent_space/patches/20260831-006.md`
- 패치 적용 전 `1.1.28-alpha` EFSM 구조
- 패치 적용 후 `SLOTS_SWAPPED` action/transition 구조

## 결론

현재 정적 검토에서 `20260831-007`의 EFSM 인접 전이를 롤백하거나 수정해야 할 근거는 발견하지 못했다.

특히 diff상 새로 추가된 것처럼 보일 수 있었던 다음 두 action은 기존 전이의 action을 변경한 것이 아니다.

- `SLOTS_RESET -> applyGraphObjectSelectionAction`
- `SELECT_SLOT -> applyAssetSelectionAction`

`20260831-007.patch`는 기존 두 전이의 action/target을 그대로 둔 채 그 다음에 `SLOTS_SWAPPED` 전이를 삽입했다. context 1줄의 unified diff 때문에 기존 action 줄이 새 `SLOTS_SWAPPED` 항목의 본문처럼 이어져 보여 오해 가능성이 있었다.

따라서 이 두 인접 전이에는 semantic drift가 없다.

## region별 확인

### workspace

기존:

- `SELECT_SLOT`: `applySlotSelectionAction` + `requestedWorkspaceState`
- `SLOTS_RESET`: `applySlotsResetAction` + `requestedWorkspaceState`

추가:

- `SLOTS_SWAPPED`: `applySlotsSwappedAction` + `requestedWorkspaceState`

판정:

적절하다. 실제 slot content mutation은 workspace의 권위 있는 event/action 경로에서 일어나고, action이 `payload.slotId = selectedSlotId`를 설정한 뒤 `requestedWorkspaceState`가 현재 선택된 slot의 content type에 맞는 workspace 상태를 다시 계산한다.

기존 `swapSlotContents()`가 직접 mutation하고 뒤에서 별도 `SELECT_SLOT`과 `notify()`를 보내던 경로보다 단일 event의 의미가 명확하다.

### overlay

기존 overlay 의미는 slot swap 때문에 닫히지 않는다.

추가된 `SLOTS_SWAPPED`는 현재 overlay state를 유지하는 self-target이다.

판정:

`20260831-006.md`의 의도와 일치한다. swap은 slot content와 selection/transient editor state를 바꾸지만 layout/caption 등 overlay 자체의 open/closed 의미를 별도 UI 판단으로 변경하지 않는다.

향후 Mantine cutover에서도 overlay의 presentation 방식이 Modal로 바뀐다는 이유만으로 이 상태 의미를 변경하면 안 된다.

### graphObject

기존:

- `SELECT_SLOT`: `applyGraphObjectSelectionAction` + `none`
- `SLOT_TYPE_CHANGED`: 동일 action + `none`
- `SLOTS_RESET`: 동일 action + `none`
- `GRID_LAYOUT_CHANGED`: 동일 action + `none`
- `PROJECT_LOADED`: 동일 action + `none`

추가:

- `SLOTS_SWAPPED`: `applyGraphObjectSelectionAction` + `none`

판정:

일관된다. slot content가 다른 물리 slot으로 이동하면 이전 graph object index가 새 selected slot/chart에서 같은 객체를 뜻한다고 보장할 수 없으므로 selection을 해제하는 것이 기존 `SELECT_SLOT`/`SLOTS_RESET` 의미와 맞는다.

`applySlotsSwappedAction()`도 mutation 단계에서 `selectedObjectIndex = null`로 초기화하므로 domain transient 값과 EFSM region의 `none` 상태가 같은 방향으로 정리된다.

### assetSelection

기존:

- `SELECT_SLOT`: `applyAssetSelectionAction` + `none`
- `GRID_LAYOUT_CHANGED`: 동일 action + `none`
- `PROJECT_LOADED`: 동일 action + `none`

추가:

- `SLOTS_SWAPPED`: `applyAssetSelectionAction` + `none`

판정:

일관된다. `applySlotsSwappedAction()`도 `activeCsvId`, `activeImageId`, `activeAssetKind`를 `null`로 초기화한다. EFSM assetSelection region 역시 같은 event에서 `none`으로 전이하므로 두 표현이 서로 어긋나지 않는다.

## `SLOTS_RESET` / `SELECT_SLOT` 인접 변경 여부

### `SLOTS_RESET`

패치 전에도 graphObject region에서 다음 의미였다.

```text
SLOTS_RESET
-> applyGraphObjectSelectionAction
-> graphObject = none
```

`007`은 이를 바꾸지 않았다.

workspace의 기존 `SLOTS_RESET -> applySlotsResetAction -> requestedWorkspaceState` 역시 변경하지 않았다.

### `SELECT_SLOT`

패치 전에도 assetSelection region에서 다음 의미였다.

```text
SELECT_SLOT
-> applyAssetSelectionAction
-> assetSelection = none
```

`007`은 이를 바꾸지 않았다.

workspace 및 graphObject의 기존 `SELECT_SLOT` 의미도 그대로다.

## source of truth 검토

`SLOTS_SWAPPED` 이후 상태의 권위는 다음처럼 유지된다.

- slot content: `slot.content`
- selected slot: 기존 `selectedSlotId` + workspace EFSM 의미
- graph object selection: graphObject region / `selectedObjectIndex`
- asset selection: assetSelection region / 기존 active asset transient 값
- overlay open state: overlay region

swap dispatcher가 별도의 임시 상태를 보관하거나 UI snapshot을 권위 값으로 사용하지 않는다.

## Mantine 범위 판단

이 변경은 Mantine 전환 때문에 EFSM을 재설계한 것이 아니다.

원래의 실제 결함은 movable slot content 일부만 교환해 caption이 남는 문제였고, `SLOTS_SWAPPED`를 EFSM action으로 만든 것은 직접 mutation + 후속 `SELECT_SLOT`/`notify()`로 흩어진 상태 변경을 하나의 권위 있는 mutation 경로로 통합한 독립적인 코어 개선이다.

따라서 `plan-004.md` §4.3의 “Mantine과 독립적으로 허용되는 코어 개선”에 해당하며 유지한다.

## 남은 동적 회귀 검사

정적 구조에서는 수정 필요가 없지만, `20260831-006.md`에 기록된 브라우저 회귀 항목은 실제 cutover 전 전체 회귀에서 계속 확인해야 한다.

- graph + caption ↔ 빈 슬롯
- graph + caption ↔ graph + caption
- image + caption ↔ graph + caption
- 선택 슬롯이 콘텐츠와 함께 상대 슬롯으로 이동
- graph object selection 해제
- asset selection 해제
- overlay open 상태에서 swap 후 상태 일관성
- grid resize/rebuild 후 swapped content/caption 유지
- FFPX v3 roundtrip
- FFSX import/export

이 항목은 현재 정적 감사에서 새로운 결함을 발견했다는 뜻이 아니라, 실제 브라우저 renderer/UI 결합을 포함하는 최종 회귀 범위다.

## 후속

`plan-004.md` 순서에 따라 다음 단계는 `20260901-002`부터 `026`까지 추가된 Mantine staging selector/read model과 command adapter를 횡단 검토하여 다음을 찾는 것이다.

1. read 경로의 domain/EFSM mutation
2. selector의 DOM 의존
3. snapshot/draft를 source of truth로 재사용하는 경로
4. UI callback이 기존 EFSM/domain command를 우회하는 경로
5. 같은 기능 규칙을 legacy/Mantine 경로에 중복 구현한 부분
