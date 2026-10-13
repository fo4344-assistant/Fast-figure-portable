# 계획 012 — Mantine Tree 전환, drag 복구, overlay resize 복원

## 1. 작업 범위

이번 수정은 다음 네 문제를 함께 해결한다.

1. bookmark drag로 slot payload를 교환한 직후 dashboard가 즉시 재렌더되지 않는 문제.
2. trash subtree 자산을 data tree에서 disabled 처리하여 복구할 수 없는 문제.
3. Mantine 전환 중 resource row가 Button이 되고 draggable surface가 parent Group으로 이동하면서 tree resource → slot drag가 사실상 깨진 문제.
4. Layout overlay의 기존 resize 의미를 잘못 바꾸어 preview 아래 손잡이가 preview 폭만 바꾸고 높이를 고정하여 실제 종횡비와 다른 화면을 만드는 문제. 설정 overlay 하단의 세로 resize 손잡이도 복원한다.

## 2. Mantine Tree 전환

현재 vendored Mantine 9.5.2에는 Tree가 있으며 onDragDrop, allowDrop, withDragHandle, renderNode를 지원한다.

- /assets 계층은 현재 재귀 Stack/Group/Button 구현 대신 Mantine Tree로 전환한다.
- VFS와 project mutation authority는 기존 Fast Figure API에 유지한다.
- Mantine Tree는 hierarchy, expand/collapse, keyboard navigation, drag source/drop-position UI를 담당한다.
- Tree의 자체 moveTreeNode 결과를 project authority로 쓰지 않는다. onDragDrop payload를 기존 planMove → move command로 변환한다.
- /slots projection은 VFS tree와 의미가 다르므로 Tree 밖의 별도 drop-target section으로 유지한다.
- resource node value는 canonical project path를 사용하여 Tree drag의 text/plain payload를 오른쪽 slot drop receiver에서도 재사용할 수 있게 한다.

## 3. tree drag 의미

- 일반 CSV/image: tree 선택 가능, tree 내부 move 가능, 오른쪽 slot에 drop하여 connectToSlot 가능.
- trash CSV/image: tree 선택 가능, trash 밖 directory로 move/drag하여 복구 가능, 오른쪽 slot direct connection은 거부.
- trash 아래 user directory: fixed root가 아니면 trash 밖으로 move 가능.
- /assets/trash root: fixed directory이므로 move 불가.
- trash 진입 시 기존 graph/slot reference detach는 유지한다.
- trash 밖으로 복구해도 과거 reference를 자동 복원하지 않는다.

Tree 내부 이동 가능 여부와 slot connection 가능 여부를 별도 조건으로 유지한다.

## 4. bookmark slot swap 즉시 반영

현재 SLOTS_SWAPPED는 activeProject와 selectedSlotId를 갱신하지만 dashboard renderer refresh가 빠져 있다.

- successful SLOTS_SWAPPED 직후 기존 updateGraphView/renderDashboard 경로를 한 번 호출한다.
- selectedSlotId source/target reconciliation과 post-drag click suppression은 유지한다.
- 새 persistent state나 DOM bridge를 추가하지 않는다.

## 5. Overlay resize 의미 복원

지난 수정의 preview resize 해석을 폐기한다.

현재 잘못된 구조:

vertical pointer drag → previewWidth 변경 → preview grid height는 별도 geometry 값 → 실제 rendered aspect 불일치 가능

목표 구조:

vertical pointer drag → overlay/modal content height 변경
preview geometry → 현재 실제 rendered preview width와 layout aspect에서 계산

즉 overlay resize와 layout preview geometry를 서로 다른 책임으로 분리한다.

### 5.1 공통 설정 overlay 하단 resize handle

Layout, Label, Caption, Print 네 설정 Modal의 아래쪽에 공통 세로 resize handle을 둔다.

- handle은 Modal content의 하단에 위치한다.
- 위/아래 drag는 해당 overlay의 높이만 조절한다.
- 폭은 공통 settingsModalSize ownership을 그대로 사용한다.
- resize 높이는 UI-local state이며 project state나 layout model에 저장하지 않는다.
- viewport를 벗어나지 않도록 최소/최대 높이를 제한한다.
- overlay가 닫히면 pointer capture를 정리한다.
- 네 overlay가 동일한 pointer/height logic을 각자 복제하지 않고 공통 component/helper를 사용한다.

README와 collision Modal은 이번 공통 설정 overlay resize 대상에 자동 포함하지 않는다.

### 5.2 Layout preview

Layout preview 아래에 preview 전용 resize handle을 두지 않는다.

- preview는 Modal content의 가용 폭 안에서 가운데 정렬한다.
- preview의 실제 width를 측정하거나 명확한 container width를 사용한다.
- preview height는 항상 renderedWidth / aspect 관계에서 계산한다.
- gap, outerMargin, radius 등 dashboardGeometry 계열 값도 같은 rendered width를 기준으로 계산한다.
- Modal 높이를 늘려도 preview를 임의로 가로 확대하지 않는다.
- Modal 폭이 바뀌어 preview width가 바뀌면 그에 따라 height도 즉시 같이 바뀌어 종횡비를 유지한다.

이로써 현재처럼 preview 아래를 세로로 당겼는데 폭만 증가하고 높이는 고정되는 동작을 제거한다.

### 5.3 이전 layoutResize 의미와의 관계

이전 정적 구현의 layoutResize는 세로 drag를 requested map height로 받아 width = height × aspect를 계산하여 map 종횡비를 유지했다.

Mantine 전환 후에는 그 역할을 그대로 preview-width slider로 옮기지 않는다. 사용자 요구에 따라 overlay 자체 높이 조절은 공통 handle로 분리하고, preview 크기는 실제 container geometry에서 파생한다.

## 6. Source Script 변경

- sourcescript/api_ui.py: Mantine Tree ownership, tree move vs slot connection 분리, trash row selection/move 허용, 공통 settings overlay resize ownership을 명시한다.
- sourcescript/assets_files.py: trash source도 fixed root가 아니면 일반 directory로 move할 수 있고 leaving-trash가 reference restore를 수행하지 않음을 명시한다.
- sourcescript/renderer_runtime.py: SLOTS_SWAPPED commit 뒤 즉시 dashboard projection refresh를 명시한다.
- layout preview의 aspect/geometry는 현재 rendered width와 하나의 계산 기준을 사용하도록 유지한다.

## 7. PlusCal/verification

Source Script 수정 후 pseudocode 전체 번역을 갱신한다.

검증 대상:
- non-trash → trash reference detach
- trash → normal directory move 허용
- leaving-trash reference 자동 복원 금지
- fixed trash root move 금지
- tree move eligibility와 slot connection eligibility 분리

DOM pointer capture, Mantine Tree elementProps, Modal height pixels, ResizeObserver 같은 구현 세부는 verification model에 넣지 않는다.

## 8. Source Code 방향

- FastFigureProjectDataTree의 /assets 부분을 Mantine Tree로 치환한다.
- renderNode에서 파일명, metadata, menu action을 렌더한다.
- Tree onDragDrop을 기존 assetApi.planMove/move로 연결한다.
- 오른쪽 /slots의 기존 allowProjectAssetSlotDrop/dropProjectAssetOnSlot 경로를 유지하고 Tree drag payload와 연결한다.
- trash row의 disabled를 제거한다.
- movableProjectNode에서 trash membership 자체를 source move 금지 이유로 사용하지 않는다.
- draggableProjectAsset은 slot connection eligibility로 의미를 한정하고 trash direct connection 거부는 유지한다.
- swapSlotContents 성공 후 dashboard refresh를 호출한다.
- FastFigureLayoutOverlay의 previewWidth drag state/startPreviewResize/movePreviewResize/preview handle을 제거한다.
- 네 settings overlay에 공통 vertical resize handle과 UI-local modal height를 적용한다.
- Layout preview는 실제 rendered width를 기준으로 height/geometry를 함께 계산하여 aspect를 보존한다.

## 9. 회귀 테스트

추가/수정할 브라우저 회귀:

1. bookmark drop 직후 별도 click 없이 DOM payload 위치가 바뀐다.
2. Mantine Tree resource node에서 dragstart가 실제 발생한다.
3. normal CSV/image tree node → 오른쪽 slot drop이 connectToSlot을 수행한다.
4. trash asset row가 disabled가 아니고 선택 가능하다.
5. trash asset/directory를 tree drag로 trash 밖에 복구할 수 있다.
6. trash asset → slot direct drop은 거부된다.
7. trash 밖 복구 후 과거 reference는 자동 복원되지 않는다.
8. Layout preview는 어떤 Modal 높이에서도 rendered width/height가 설정 aspect를 유지한다.
9. Layout preview 아래에는 preview-width 조절 handle이 존재하지 않는다.
10. Layout/Label/Caption/Print 각각 하단 handle로 Modal 높이를 늘이고 줄일 수 있다.
11. Modal height resize가 project/layout semantic state를 변경하지 않는다.

## 10. 작업 순서

Source Script → closure review → PlusCal pseudocode → 필요한 verification/TLC → Source Code → browser regression → development-layer check → distribution build → final review

## 11. 하지 않을 것

- trash reference detach 제거
- trash asset의 slot direct connection 허용
- original-location restore history 추가
- Mantine Tree의 local moved data를 VFS authority로 사용
- layout preview width를 세로 drag로 직접 변경
- overlay height를 project 파일에 저장
- 새로운 DnD 라이브러리 도입
