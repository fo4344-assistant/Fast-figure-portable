# Source Script r23 closure review — complete persistent mutation routing

## 되돌아온 이유

r22에서 layout/annotation/export 계열의 command coverage를 보완했지만, 추가 횡단 감사에서 assets/graphs의 원자적 persistent mutation이 아직 projectEFSM 경계로 완전히 수렴하지 않은 것을 확인했다.

구체적으로 `importProjectFilesToDirectory`, `deleteProjectAsset`, `moveProjectNode`, `emptyProjectTrash`, `applyFfsxSlot`, `graphEditorSetEditable` 등은 candidate-first/one-commit 의미를 설명하면서도 어떤 project command가 그 commit을 소유하는지가 명시되지 않았다. pseudocode에도 해당 직접 commit 흔적이 남아 있었다.

r22 closure가 놓친 원인은 첫 보정의 감사 범위를 `layout_annotations_export`와 새로 발견된 몇 개 public mutation에 집중하고, `PUBLIC_API_METHODS` 전체를 assets/graphs domain 함수까지 역추적하는 coverage matrix로 검증하지 않았기 때문이다.

## command 설계

새 command는 `ASSETS_IMPORTED` 하나만 추가했다.

raw CSV/image import는 여러 파일, replace plan, next-id, VFS 위치와 선택적 target slot/chart 연결을 하나의 whole-project candidate로 원자적으로 commit해야 한다. 기존 `DATA_OBJECT_CREATED` / `IMAGE_OBJECT_CREATED`를 파일마다 반복하면 batch atomicity가 깨지므로 기존 singular command로 표현할 수 없다.

반대로 다음은 새 command를 만들지 않고 기존 의미를 확장했다.

- `DATA_OBJECT_DELETED`: CSV 제거와 모든 graph-object reference detach를 같은 candidate에서 소유.
- `IMAGE_OBJECT_DELETED`: image 제거와 모든 slot image-reference detach를 같은 candidate에서 소유.
- `CHART_MODEL_REPLACED`: imported chart editable 전환 시 필요한 CSV 생성, next-id, reference remap까지 같은 candidate로 소유.
- `SLOT_CHART_IMPORTED`: FFSX/Plotly chart, 필요한 package CSV와 owning slot을 같은 candidate로 소유.

같은 mutation 목적을 불필요하게 새 command로 분할하지 않고 기존 command의 writable scope를 실제 원자성에 맞게 명확히 한 것이다.

## 전체 coverage matrix

`PUBLIC_PROJECT_MUTATION_ROUTES`를 projectEFSM Source Script에 추가해 public persistent mutation surface를 command와 직접 대응시켰다.

검사 결과:
- explicit branch route: 44개.
- 모든 route target은 declared `PROJECT_COMMANDS` 안에 존재한다.
- kind/precondition에 따라 command가 달라지는 operation은 branch route로 기록했다.
  - asset delete: CSV / image
  - asset-to-slot connect: CSV / image
  - graph object add: empty slot / existing chart
- read/export와 runtime-only operation은 matrix에서 제외한다.

## assets_files 책임

- batch import는 pure `buildProjectAssetImportCandidate`와 `ASSETS_IMPORTED` commit을 분리했다.
- CSV/image single create는 각각 기존 create command로 수렴한다.
- delete는 resolved kind에 따라 기존 delete command로 수렴하며 reference detach를 같은 candidate에 포함한다.
- move/trash empty는 기존 project command를 명시적으로 호출한다.
- create directory, asset-to-slot connect, raw file-to-slot import의 mutation route를 명시했다.
- FFPX import는 `PROJECT_LOADED`, FFSX slot apply는 `SLOT_CHART_IMPORTED`로 수렴한다.

## graphs 책임

- object add/replace/value/order/delete/palette는 기존 `SLOT_DATA_CONNECTED` 또는 `GRAPH_OBJECTS_REPLACED`로 수렴한다.
- headerLines는 `DATA_OBJECT_REPLACED`.
- imported chart editable 전환은 `CHART_MODEL_REPLACED`.
- chart layout은 `CHART_LAYOUT_CHANGED`.
- FFSX/Plotly import는 `SLOT_CHART_IMPORTED`.

## 일반 코딩 원칙 검토

- 계산과 mutation 분리: import candidate 계산과 authoritative commit을 별도 단계로 유지한다.
- 단일 권위: activeProject만 persistent authority이며 domain helper는 독립 commit owner가 아니다.
- 명시적 변경 경로: 모든 public persistent mutation은 coverage matrix와 declared command로 추적 가능하다.
- 중복 억제: 기존 command로 자연스럽게 표현 가능한 delete/chart/import semantics는 새 command를 만들지 않았다.
- 최소 복잡도: batch atomicity 때문에 singular commands로 표현할 수 없는 경우에만 `ASSETS_IMPORTED`를 추가했다.
- UI/runtime state는 project command matrix에 넣지 않는다.

## 닫힘 판정

public API persistent mutation → domain operation → project command를 전체 횡단 대조했고, matrix target의 declared-command membership도 검사했다. read/export 경로의 설명에 포함된 “mutation 없음”은 persistent mutation으로 분류하지 않았다.

따라서 Source Script r23을 closed로 판정한다.

## 하위 계층 전파

pseudocode r8, verification r21, Source Code r24는 r23에 대해 stale다. 기존 진행 중이거나 완료되는 TLC 결과는 r23 lineage의 검증으로 재사용하지 않는다. 다음 단계는 r23 전체 mutation routing을 pseudocode로 직접 번역하는 것이다.
