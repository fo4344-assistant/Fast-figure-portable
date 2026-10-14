# PlusCal translation review — Source Script r23 / pseudocode r10

## 추가 번역 범위

r9 이후 전체 public mutation route와 explicit ApplicationDispatchProjectCommand 호출을 대조한 결과,
다음 Source Script r23 route가 pseudocode command declaration에는 있었지만 실제 transition procedure에는 누락되어 있었다.

- project.setName → PROJECT_NAME_CHANGED
- slots.setContentType → SLOT_TYPE_CHANGED
- slots.reset → SLOTS_RESET
- images.insertEmpty → SLOT_IMAGE_IMPORTED
- appearance.setPalette/resetPalette → APPEARANCE_CHANGED

r10은 이 다섯 계열을 `api_ui.pcal`의 public API orchestration procedure로 직접 번역한다.

## 의미 보존

- project name은 normalized name payload만 project command에 전달한다.
- slot content type은 explicit slot id와 normalized type을 전달한다.
- slot reset은 explicit slot id 집합을 SLOTS_RESET으로 전달한다.
- empty image insert는 asset+slot candidate 계산과 SLOT_IMAGE_IMPORTED commit을 분리한다.
- appearance palette는 normalize/default 계산 후 APPEARANCE_CHANGED로 commit한다.
- UI-local state나 renderer side effect를 project mutation procedure에 추가하지 않는다.

## 전체 command 대조

Source Script와 pseudocode의 PROJECT_COMMANDS 집합은 34개로 동일하다.
r10 이후 Source Script의 public persistent route target은 모두 pseudocode에서 actual application project-command dispatch 또는 해당 domain procedure로 표현된다.

## 일반 코딩 원칙

기존 `ApplicationDispatchProjectCommand`를 재사용하고 command-specific payload만 명시했다.
별도 generic mutation wrapper나 duplicated project state를 추가하지 않았다.
candidate 계산이 필요한 empty-image insertion만 계산 단계와 commit 단계를 분리했다.

## 하위 단계

verification r23은 pseudocode r10 lineage가 아니므로 stale다.
다음 단계에서 slot image import가 기존 chart ownership invariant에 미치는 영향을 최소 verification action으로 반영하고,
project-name/appearance/slot-type처럼 현재 selected verification property와 독립적인 항목은 생략 근거를 기록한다.
