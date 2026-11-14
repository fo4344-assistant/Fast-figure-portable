# Plan025 5차 / backend/project_efsm — 정적 번역 종료

2026-11-13, code146/stale. Source45의 `sourcescript/backend/project_efsm.py` 244줄, PlusCal25의 `pseudocode/backend/project_efsm.pcal` 773줄, 실제 runtime 전체를 읽고 등록 34 commands/14 PlusCal procedures를 실제 caller/공유 helper에 대조했다. 정책에 따라 이미 번역된 candidate/helper를 재사용하며 새로운 API/상태/재시도 의미를 설계하지 않았다. 아래는 정적 대응 종료이며 실행 통과가 아니다. Plan025는 사용자 요청대로 지금 재작성하지 않고 미완료 연결은 memo/20261113-001.md에 모았다.

## 전체 절차와 command 대응

E=`sourcecode/backend/project_efsm.js`, A=`sourcecode/backend/assets_files.js`, G=`sourcecode/backend/graphs.js`, L=`sourcecode/backend/layout_annotations.js`.

| 명세 절차/등록 command | 실제 번역 경로와 분기 |
| --- | --- |
| ProjectStateMachine_send / CalculateSourceCommandCandidate | E.ProjectStateMachine.send/PROJECT_COMMAND_ACTIONS의 34개 등록 route. object/candidate/model/project 금지, identity/새 값/copied bytes만 받는다. scope lock→현재 authority→owned candidate→whole validate→source identity 재확인→단일 commit. 현재 파일 입력은 Application이 이미 읽은 copied bytes라 handler는 동기식이며 별도 async 저장소/engine은 만들지 않는다. 예외는 원형 전달, noncommit에는 성공 facts 없음. |
| BuildActualChanged / FormActualMutationResult | E.commitProjectCandidate/actualChanged/commitValueKey/send. 성공 직전/직후 source를 command-local input에만 보관하고 동일 id의 structural 실제 변경/제거 ids를 계산한다. asset facts는 계산 순서를 유지하고 실제 canonical path/id/현재 chart-slot owners를 확인한다. caller changed/hints/effects/count는 배제하며 caller payload를 수정/반환하지 않는다. result 전체를 detached recursive immutable copy로 반환한다. |
| VisualCommitFacts / CalculateProjectionEffect | E.calculateProjectionEffect: 실제 winning pre/post의 전체 dashboard input, 참조 multiset 제거와 path-only 여부. abandoned retry source/caller effect를 사용하지 않고 persistent mirror를 만들지 않는다. |
| cascadeFilterWithOriginalIndexMap / DetachAssetReferences | A.collectAssetReferences/removeProjectAssetReferences와 E deletion/trash/move callers. 같은 representation-aware CSV/image 집합으로 참조를 모으고 original index→remaining index/null을 계산한다. 같은 csvId의 복수 object 참조도 별개로 세며 순서를 보존한다. empty editor 허용, 슬롯 imageId만 해제하고 settings/caption 보존. |
| calculateGraphObjectEdit / GRAPH_OBJECTS_REPLACED | E.applyGraphObjectEditAction: 등록 operation만 command 내부에서 계산하며 append/delete/reorder/field/CSV/palette 분기를 current chart/CSV에 적용한다. G missing-only defaults/validation/rebuild, explicit current output index 또는 index map. projected objects 배열은 받지 않는다. 기존 r142 대응을 재사용했다. |
| CalculateNewAsset / DATA_OBJECT_CREATED, IMAGE_OBJECT_CREATED | E.applyDataObjectCreatedAction/applyImageObjectCreatedAction. copied bytes 또는 새 table→config directory/canonical path/id→metadata→whole validate/recheck/commit→actual created asset. assets 자체에 슬롯 설정을 넣지 않는다. |
| DATA_OBJECT_REPLACED, IMAGE_OBJECT_REPLACED | E.applyDataObjectReplacedAction/applyAssetObjectReplacedAction. current id/optional path를 확인하고 새 table/bytes/MIME만 반영, identity/path는 보존. CSV header-only 명시 분기와 graph rebuild를 유지하고 header action의 event를 context에서 받도록 수정했다. 모델 교체와 Frontend image-release callback은 제거했다. |
| DATA_OBJECT_DELETED, IMAGE_OBJECT_DELETED / PROJECT_TRASH_EMPTIED | E.applyAssetObjectDeletedAction/applyProjectTrashEmptiedAction. current canonical target/actual contained assets, 단일 cascade 집합, reference counts/index maps, 실제 changed/removed ids 및 noncommit/throw. Backend에서 렌더러 URL을 회수하지 않는다. |
| ASSETS_IMPORTED | E.applyAssetsImportedAction→A.buildProjectAssetImportCandidate. 실제 source 기준 최종 계획·path/id/target 재확인, ordered imported facts, validate/recheck/commit. validation throw를 false로 삼키던 처리를 제거했다. |
| PROJECT_LOADED | E.applyProjectLoadedAction→A.ffpxReadProjectBytes/buildProjectObject. copied package bytes만 받고 candidate 검증/recheck/단일 authority 교체, resetInterfaceSelection hint, 실제 pre/post 전체 changed. 외부 candidate/partial fallback 없음. |
| PROJECT_NAME_CHANGED, PROJECT_DIRECTORY_CREATED, PROJECT_NODE_MOVED | E.applyProjectNameChangedAction/applyProjectDirectoryCreatedAction/applyProjectNodeMovedAction. current source candidate, name coercion/canonical directory·move planner, trash cascade와 counts/paths, recheck. directory-inclusive descendants는 asset rewrite에서 directory 항목을 제외한다(r144). |
| SLOT_TYPE_CHANGED, SLOTS_RESET, SLOTS_SWAPPED | E.applySlotTypeChangedAction/applySlotsResetAction/applySlotsSwappedAction. current explicit visible id resolve; type만 변경/owned chart 제거와 local default reset/whole local payload swap. 명시된 reset/remap hints와 actual changes. |
| SLOT_DATA_CONNECTED, SLOT_IMAGE_LINKED | E.applySlotDataConnectedAction/applyProjectAssetConnectedAction. current slot/asset resolve, candidate CSV/chart 생성 또는 현재 model 연결; 이미지 연결은 graph를 제거하고 local settings/caption 보존. 단순 data connect에 명세 밖 selectedIndexHint:null을 강제하지 않는다. |
| SLOT_IMAGE_IMPORTED | E.applySlotImageImportedAction→applyEmptyImageInsertedAction. empty-image helper 입력과 일반 copied bytes/name/MIME를 같은 new-asset 계산으로 처리한다. raw model/imageId-import 우회 경로를 제거하고 current visible image target/new path/id/owned chart 제거/settings·caption 유지. |
| SLOT_CHART_IMPORTED, CHART_MODEL_REPLACED | E.applySlotChartImportedAction/applyChartModelReplacedAction. raw JSON/FFSX current target과 기존 chart의 단일 owner 확인, candidate imported rows/CSV/reference/id 정상화 또는 editable conversion. 일반 import의 비명세 강제 selectedIndexHint:null을 제거했다. |
| ApplyChartLayoutEdits / CHART_LAYOUT_CHANGED | E.applyChartLayoutChangedAction. current visible owning chart와 explicit known title/global/axis patch, nested record 검증, pure normalize, editable일 때만 rebuild. Source/PlusCal에 없는 editable-only target 거부를 제거하여 noneditable imported original graph는 그대로 보존한다. 기존 UI axisKey/axisValues도 같은 명시 축 patch의 물리적 표기로 수용한다. |
| GRID_LAYOUT_CHANGED, LAYOUT_STYLE_CHANGED | E.applyGridLayoutChangedAction→L.buildGridResizeInProject 및 applyLayoutStyleChangedAction. config/int/geometry/local-state validation, retry/single commit. grid의 비명세 clear/reResolve selection flags를 제거했다. r143 계산은 재작성하지 않았다. |
| CalculateMergeOrSplit / SLOTS_MERGED, SLOTS_SPLIT | E.applySlotsMergedAction/applySlotsSplitAction. resolve distinct visible rectangular/unmerged cells, 최대 하나 nondefault local owner, anchor/local 이동·나머지 default reset와 span/hidden 처리, recheck. nondefault owner가 없으면 anchor의 잔여 extension을 복사하는 대신 명시된 empty local default를 사용한다. |
| CAPTION_TEXT_INPUT, SLOT_CAPTIONS_INSERTED, CAPTION_SETTINGS_CHANGED | E.applyCaptionTextInputAction/applySlotCaptionsInsertedAction/applyCaptionSettingsChangedAction와 L.insertSlotCaptions. current visible targets, exact text/group generation, explicit settings patch/config ranges, validate/recheck/single commit. 기존 owner 경로 유지. |
| LABEL_SETTINGS_CHANGED, LABEL_POSITION_CHANGED, APPEARANCE_CHANGED | E label/position/appearance actions. current config/explicit patch/whole validate/recheck. appearance의 빠졌던 source retry를 추가했다. r143 label 계산은 재사용했다. |
| NormalizeImageEditsInAttempt / SLOT_IMAGE_SETTINGS_CHANGED | E.applySlotImageSettingsChangedAction. current visible image type와 실제 imageRef, config fit/manual/limits/center, unknown local settings 보존, array/record를 numeric scalar로 바꾸지 않으며 primitive conversion exception은 그대로 전달한다. |
| NormalizeExportEditsInAttempt / EXPORT_SETTINGS_CHANGED | E.applyExportSettingsChangedAction. current settings partial patch, enum/auto-null/explicit-height/config ranges; scalar edit만 반영, conversion error 원형 전파와 source retry. |

34개 command/14개 PlusCal procedure를 위 표에서 모두 다뤘다. 이 모듈의 등록 command 계산에서 알려진 미번역 분기는 남기지 않았다. Backend registry tree/UI 역의존, 실제 public/UI 입력 의미, Frontend runtime/legacy resource ownership과 통합 검증은 이 모듈의 종료로 함께 완료되는 것이 아니며 메모에 남겼다.

## Fixtures / 증거 / 실행 경계

기존 regression40/96/155만 확장했다: scalar print 입력·exception, current noneditable layout/원본 보존·unknown patch 제외, actual receipt와 immutable nested facts·forged caller/noncommit/authority model 거부, raw image create/replace/import와 local settings 보존, appearance source 교체 retry. 현재 명세와 다른 noneditable layout 거부 기대 및 r145 이전 effect alias 동일성 기대도 바로잡았다. 새 ID 없음, 미실행.

code146/stale `sha256:3ab32590a35bf1358af69f180651c946bdb1c65890bda5b9bde051d32b41b909`. 이전145 `sha256:ba6ad182dc54a6045c4eb034ee6f59e871bed05bc5d9ad157a247a2c96d9716e` 독립 canonical-LF byte hash 재현. Source45/PlusCal25/verification26 및 derived_from 불변. app/test/build/checker/TLC/browser/Actions/remote/commit/push/goal 없음. 독립 hash/diff/patch 확인은 공식 checker/실행 검증을 대체하지 않는다.

다음 모듈: Plan025 6a frontend/interface_fsm. 사용자 지시대로 미완료 항목은 메모에서 이어받고 전체 모듈 작업 후 계획을 갱신한다.
