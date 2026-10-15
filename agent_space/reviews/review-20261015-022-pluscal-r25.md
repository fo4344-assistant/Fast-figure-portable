# PlusCal translation review — Source Script r25 / pseudocode r11

## 범위

기준 Source Script는 `development-versions.json`의 r25/current/closed와
`agent_space/reviews/review-20261015-021-sourcescript-closure-r25.md`다.

이번 번역은 plan-016의 Backend / Application boundary / Frontend / Portable build hierarchy와
r25 cross-reference 보정을 현재 활성 `pseudocode/**/*.pcal` 전체에 직접 전파한다.

## 번역된 핵심 계약

- `system.pcal`: Backend authority를 Frontend renderer에 직접 넘기지 않고 Application query가 만든 project projection과 final Frontend state를 renderer 입력으로 사용한다.
- `project_state.pcal`: Backend read projection, Frontend intent validation, post-commit reconciliation query를 current project authority의 read-only operation으로 표현한다.
- `project_efsm.pcal`: resolve/candidate/validation 실패를 assert로 없애지 않고 rejected ProjectMutationResult branch로 표현하며 실패 시 pre-project authority를 유지한다.
- `interface_fsm.pcal`: Backend state/helper 직접 조회를 제거하고 validated input과 reconciliation input만 소비한다. Frontend FSM은 lifecycle task callback을 실행하지 않는다.
- `application_fsm.pcal`: Backend query, Backend-reference validation, SELECT_SLOT의 optional SLOT_TYPE_CHANGED, commit success/failure, reconciliation, renderer query, Application-owned lifecycle task ordering을 표현한다.
- `api_ui.pcal`: FastFigureApi를 cross-layer boundary로 두고 project reads를 Application query로 수렴시킨다. `slots.select`와 `slots.swap` public operations를 직접 표현한다.
- `renderer_runtime.pcal`: supplied Backend projection + final Frontend state + public action surface만 소비한다. direct Backend read 또는 direct FSM/Project command dispatch를 제거한다.
- `graphs.pcal`: selected global state 대신 explicit slotId/chartId/csvId를 wrapper 입력으로 사용한다. r25의 graph object value edit는 current chart/object/csv reference를 resolve한 candidate를 `CommitGraphObjects(chartId, ...) -> GRAPH_OBJECTS_REPLACED`로 수렴시킨다.
- `layout_annotations_export.pcal`: image/label처럼 Frontend selected target이 필요한 operation을 explicit slotId 입력으로 표현하고 Backend calculation/Application wrapper/Frontend raster projection의 논리 소유권을 구분한다.
- `assets_files.pcal`: 기존 candidate-first asset/package 의미를 유지하면서 Backend 계산과 co-located Application wrapper의 논리 소유권을 명시한다.
- `portable_build.pcal`: Portable build를 Backend/Frontend 하위가 아닌 system-level packaging responsibility로 유지한다.

## 직접 경계 감사

현재 pseudocode에서 다음 구식 경로가 남지 않는지 확인했다.

- `interface_fsm.pcal`: `ReadActiveProject`, `ResolveVisibleSlotFromCurrentProject`, Backend task `ExecuteTask(task)` 없음.
- `renderer_runtime.pcal`: `ReadActiveProject`, `ReadActiveProjectSlotStyle`, `ReadSelectedSlotIdFromInterfaceFsm`, direct `ApplicationDispatchProjectCommand`/direct interface-event dispatch 없음.
- `application_fsm.pcal`: Backend query/validation/reconciliation query가 존재하며 commit failure는 renderer success projection을 만들지 않는다.
- `project_efsm.pcal`: rejected result와 authority rollback/unchanged branch가 명시되어 있다.
- `api_ui.pcal`: `ApplicationDispatchSlotSelection`, `SLOTS_SWAPPED`, public project query 경계가 존재한다.

`assets_files.pcal`, `layout_annotations_export.pcal`, `project_efsm.pcal`에서의 Backend `ReadActiveProject` 계열 표현은 Backend 소유 계산/authority 접근이다. 이를 Frontend direct access로 해석하지 않는다. 같은 물리 pseudocode module에 Application wrapper가 함께 있는 경우 Source Script r25의 logical owner 구분을 유지한다.

## Source Script r25 보정 전파

r25에서 r24 이후 추가된 두 보정도 포함했다.

1. file-drop target 준비는 새 `prepareFileDrop` Backend route를 만들지 않고 기존 public slot selection action을 사용한다.
2. graph object value edit는 explicit chartId를 기준으로 current object/csv/column relation을 확인한 뒤 기존 `GRAPH_OBJECTS_REPLACED` command로 commit한다.

## 계층과 fingerprint

번역 후 활성 PlusCal fingerprint:

`sha256:ead7ec7f3cc45baf2d6c88d9ccfe56ec4ebcd562444aa6741c43dee5f963cae5`

derived Source Script fingerprint:

`sha256:7da7df78942382dc19d66dbf0e0759cf4f621350308b2e99d79b3ef1e6b6b73f`

이 리뷰와 lineage 반영 후 pseudocode는 r11/current로 판정한다.
verification-model r24와 Source Code r29는 이전 pseudocode lineage이므로 stale로 유지한다.

## 검증 범위와 다음 단계

이번 단계에서는 GitHub Actions를 실행하지 않았다.
TLC도 실행하지 않았으며 verification-model을 변경하지 않았다.

연결된 GitHub tree/blob를 기준으로 번역 파일과 cross-layer 금지 경로를 정적 대조했다.
로컬 PlusCal translator 또는 `scripts/check-development-layer-versions.py` 프로세스를 실제 실행했다고 주장하지 않는다.

다음 단계는 current pseudocode r11에서 plan-016에 필요한 verification model을 파생하고 validation review/TLC를 수행하는 것이다. TLC 결과가 확보되기 전에는 Source Code 단계로 진행하지 않는다.
