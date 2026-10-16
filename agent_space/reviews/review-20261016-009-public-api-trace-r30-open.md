# Public API trace — Source Script r30 / OPEN

## 범위·판정 기준

- 사용자 지시 순서대로 layout/palette 명세 구체화 후 전체 공개 API를 정적으로 대조했다. 기준 main `eef0d9252c30a5f85dcb268cb2c32d2fc7e97cce`의 r29에서 출발한다.
- 목록의 권위는 `sourcescript/application/public_api/__init__.py:PUBLIC_API_METHODS`다. 아래 표는 검토 기록이며 별도 API registry/계약이 아니다. 독립 함수가 없다는 사실만으로 누락이라고 판정하지 않는다. 공통 query/command 절차와 operation 계약으로 의미를 결정할 수 있으면 그 경로를 추적한다.
- Q = `application.adapter.dispatchProjectQuery` → `backend.project_state.readBackendProjection`; C = `dispatchProjectCommand` → `backend.project_efsm.PUBLIC_PROJECT_MUTATION_ROUTES/ProjectStateMachine.send` → 성공 시 reconciliation → renderer input. F = `dispatchInterfaceEvent` → Backend identity 검증이 필요하면 `validateFrontendIntent` → Frontend FSM. X = 한 작업용 query/snapshot → package/download 또는 Frontend raster renderer. L = Application lifecycle ready/busy/start/complete/failed 공통 절차.
- Q는 immutable copy이며 state 변경 없음, C 실패는 미commit·success reconciliation 없음, F invalid는 state/revision 그대로다. L 취소는 성공 commit으로 바꾸지 않는다. X의 I/O 실패를 project rollback으로 해석하지 않는다. 아래 반환란의 `미정`은 이 공통 안전 규칙과 별개로 **공개 성공값/실패값의 구체 형태가 아직 완결되지 않음**을 뜻한다.
- `연결`은 Source 계약의 producer/consumer 연결을 확인했다는 뜻이지 실행 통과/전체 닫힘이 아니다. `보완`은 이번에 기존 의미를 연결한 항목, `열림`은 아래 F1–F5에 해당하는 정적 발견이다.

## 전체 inventory 대조

| API | 입력 → owner/경로 | 반환·실패/취소 대조 | 판정 |
|---|---|---|---|
| project.readName | 없음 → Q project.readName/meta | name copy; query 오류 전파 | 연결 |
| project.setName | 새 name → C PROJECT_NAME_CHANGED | public 성공/거부값 미정 F1 | 열림 |
| project.importFile | raw FFPX → L/C PROJECT_LOADED | committed 후 X project snapshot; 실패 result, throw 전파 | 연결 |
| project.exportFile | current project → X ffpxBuildProject | package/download 결과·취소 반환 세부 미정 F4 | 열림 |
| slots.readSelected | Frontend selectedSlotId → Q slots.readSelected | visible slot copy 또는 none | 연결 |
| slots.select | slotId/direction/pending type → adapter.dispatchSlotSelection | Frontend/conditional C는 연결; public 반환 미정 F1 | 열림 |
| slots.setContentType | slotId/type → C SLOT_TYPE_CHANGED | public 반환 미정 F1 | 열림 |
| slots.reset | slot ids → C SLOTS_RESET | 소유 chart 제거/local reset; public 반환 미정 F1 | 열림 |
| slots.swap | source/target ids → C SLOTS_SWAPPED | payload 교환/reconcile; public 반환 미정 F1; JS surface 누락 F5 | 열림 |
| slots.prepareFileDrop | explicit visible target → Q/F model-to-fsm | invalid false unchanged, valid true; 같은 target toggle 없음 | 연결 |
| slots.finishFileDrop | drag completion → runtime cleanup | persistent commit 없음; completion 반환 미정 F2 | 열림 |
| images.readEditor | explicit selected slot → Q images.readEditor | image bytes/settings copy 또는 none; resource allocation 없음 | 연결 |
| images.setSettings | slotId/new settings → layout wrapper/C SLOT_IMAGE_SETTINGS_CHANGED | editor 없음/미commit false, 성공 fresh editor, throw 전파 | 연결 |
| images.insertEmpty | selected slot/new empty image → C SLOT_IMAGE_IMPORTED | empty image 입력/공개 반환 세부 미정 F1 | 열림 |
| assets.readDeletionTarget | path → Q + collectAssetReferences | detached target/reference count 또는 none | 연결 |
| assets.delete | kind/id/path → C CSV/image delete branch | detach+removal one candidate; public 반환 미정 F1 | 열림 |
| assets.readTree | 없음 → Q current VFS | detached tree | 연결 |
| assets.isTrashed | canonical path → Q membership | boolean | 연결 |
| assets.movable | source path → Q fixed-root/source check | boolean; trash만으로 거부 안 함 | 연결 |
| assets.readTrash | 없음 → Q subtree | detached trash tree | 연결 |
| assets.moveOptions | source path → Q directories/eligibility | destination copy | 연결 |
| assets.planMove | source/destination → Q planProjectNodeMove | transient collision/reference plan; mutation 입력은 identity만 | 연결 |
| assets.move | source/target/useUniqueName → C PROJECT_NODE_MOVED | current authority 재검증; public 반환 미정 F1 | 열림 |
| assets.createDirectory | parent/name → C PROJECT_DIRECTORY_CREATED | public 결과·selection 연계 미정 F1/F2 | 열림 |
| assets.createEmptyCsv | template → DATA_OBJECT_CREATED → selection | create helper는 immutable CSV 반환; public select step 없음 F2 | 열림 |
| assets.emptyTrash | 없음 → C PROJECT_TRASH_EMPTIED | detach+delete one commit; public 반환 미정 F1 | 열림 |
| assets.draggableAsset | path → Q current non-trash asset | kind/id/path/name 또는 none | 연결 |
| assets.connectToSlot | path/kind/slotId → C CSV/image branch | reference candidate; public 반환 미정 F1 | 열림 |
| assets.importToDirectory | files/directory/completed choices → L/C ASSETS_IMPORTED | choice cancel는 무command; 내부 tuple의 public 반환 미정 F1 | 열림 |
| assets.importToSlot | file/slotId/completed choices → L/C ASSETS_IMPORTED | asset+slot one candidate; public 반환 미정 F1 | 열림 |
| assets.fileKind | filename/MIME → calculation | named query/공식 pure route 등록 없음 F3 | 열림 |
| assets.importFiles | files/target → Application router | directory/slot branch 선택·batch 반환/취소 집계 미정 F4 | 열림 |
| assets.collisionModel | file/directory/reserved paths → Q domain helper | transient model; mutation 없음 | 연결 |
| assets.resolveImportPlan | model/explicit choice/reserved paths → domain helper | helper 존재, 공식 query route 없음 F3; commit은 재검증 | 열림 |
| assets.selectDirectory | path/kind directory → F SELECT_ASSET | accepted selection/state; public 반환 미정 F2 | 열림 |
| assets.selectCsv | path/kind csv → F SELECT_ASSET | invalid unchanged; public 반환 미정 F2 | 열림 |
| assets.selectImage | path/kind image → F SELECT_ASSET | slot mutation 없음; public 반환 미정 F2 | 열림 |
| assets.download | asset path → X copied original bytes | public I/O 결과/없는 target 처리 세부 미정 F4 | 열림 |
| graphs.readData | selected slot/current CSV/index → Q graphs.readData | chart/objects/currentCsv/columns/objectColumns; missing none/empty | 연결 |
| graphs.readLayout | selected slot → Q owning chart/editor | detached title/global/axis 또는 none | 연결 |
| graphs.readPalette | selected slot → Q owning object colors | detached sequence 또는 empty | 연결 |
| graphs.selectCsv | selected CSV path/id → F SELECT_ASSET | object reference 변경 없음; public 반환 미정 F2 | 열림 |
| graphs.setHeaderLines | csvId/new count → C DATA_OBJECT_REPLACED | current CSV replacement; public 반환 미정 F1 | 열림 |
| graphs.setEditable | slotId/chartId/flag → C CHART_MODEL_REPLACED | 성공 Q editable scalar, 실패 result; CSV conversion도 one candidate | 연결 |
| graphs.addObject | slotId/csvId → Q route → C connect/replace | 성공 Q chart, 실패 result; route stale시 reject | 연결 |
| graphs.moveObject | chartId/from/to → C GRAPH_OBJECTS_REPLACED | 추가한 wrapper: valid same-index no-op read; 성공 Q chart/실패 result | 보완 |
| graphs.selectObject | selected slot/index/selectAsset → F SELECT_GRAPH_OBJECT | validated index+CSV path; public 반환 미정 F2 | 열림 |
| graphs.setObjectValues | chartId/index/new values → C GRAPH_OBJECTS_REPLACED | 성공 Q chart; 실패 result; hint와 독립 CSV 분리 | 연결 |
| graphs.deleteObject | chartId/index → C GRAPH_OBJECTS_REPLACED | 추가한 wrapper: 성공 Q chart/실패 result; 마지막 삭제 empty chart | 보완 |
| graphs.updateLayout | slotId/chartId/new patch → C CHART_LAYOUT_CHANGED | layout 계산 명시; public 반환 미정 F1 | 열림 |
| graphs.applyPalette | chartId/non-empty colors → C GRAPH_OBJECTS_REPLACED | color-only cycling 명시; public 반환 미정 F1 | 열림 |
| graphs.defaultColors | 없음 → Q immutable domain constant | 8-color detached sequence | 연결 |
| graphs.hasSelectedSlot | selected slot reference → Q visible graph slot | boolean; chart 존재와 구별 | 연결 |
| graphs.importFile | slotId/raw FFSX/Plotly → L/C SLOT_CHART_IMPORTED | conversion/package candidate; public 반환 미정 F1 | 열림 |
| graphs.exportFfsx | selected graph slot → X ffsxBuildSlot | referenced CSV copy; I/O/없는 target 결과 미정 F4 | 열림 |
| graphs.exportPlotlyJson | selected graph slot → Q chartFigure → X | imported 원본/일반 재계산 경로 연결; I/O 결과 미정 F4 | 열림 |
| print.readSettings | 없음 → Q export settings | width/heightMode/height/dpi/format copy | 연결 |
| print.setSettings | new values → C EXPORT_SETTINGS_CHANGED | 성공 Q settings, rejected false, throw 전파 | 연결 |
| print.save | target settings → L/X export/rendererTarget | output/status, I/O 전파; 구체 public 반환 미정 F4 | 열림 |
| print.capture | current screen → L/X export/rendererCurrent | persistent target 변경 없음; public 반환 미정 F4 | 열림 |
| captions.readGlobal | 없음 → Q project captions | global copy | 연결 |
| captions.readSlot | explicit slotId → Q slot.caption | local copy 또는 none; placeholder 저장 안 함 | 연결 |
| captions.setEnabled | flag → C CAPTION_SETTINGS_CHANGED | public 반환 미정 F1 | 열림 |
| captions.setGlobalText | text/global owner → C CAPTION_TEXT_INPUT | slot caption 보존; public 반환 미정 F1 | 열림 |
| captions.setSlotText | slotId/text → C CAPTION_TEXT_INPUT | global caption 보존; public 반환 미정 F1 | 열림 |
| captions.insertSlotCaptions | slot ids → C SLOT_CAPTIONS_INSERTED | source local 보존/global 삽입; public 반환 미정 F1 | 열림 |
| captions.setName | name → C CAPTION_SETTINGS_CHANGED | public 반환 미정 F1 | 열림 |
| captions.setNameBold | flag → C CAPTION_SETTINGS_CHANGED | public 반환 미정 F1 | 열림 |
| captions.setSettings | new presentation → C CAPTION_SETTINGS_CHANGED | public 반환 미정 F1 | 열림 |
| labels.readState | explicit slot reference → Q label/geometry | detached projection | 연결 |
| labels.setEnabled | flag → C LABEL_SETTINGS_CHANGED | public 반환 미정 F1 | 열림 |
| labels.setSettings | new fields → C LABEL_SETTINGS_CHANGED | position 생략 시 보존; public 반환 미정 F1 | 열림 |
| labels.setPosition | new x/y → C LABEL_POSITION_CHANGED | 단일 persistent position; public 반환 미정 F1 | 열림 |
| labels.finishPositionInteraction | completion → runtime notify | 두 번째 commit 없음; 반환 미정 F2 | 열림 |
| labels.resetPosition | default origin → C LABEL_POSITION_CHANGED | public 반환 미정 F1 | 열림 |
| appearance.readPalette | 없음 → Q appearance | 10-field detached palette | 연결 |
| appearance.setPalette | new palette → C APPEARANCE_CHANGED | 전체 palette/default 정규화; public 반환 미정 F1 | 열림 |
| appearance.resetPalette | default palette → C APPEARANCE_CHANGED | 같은 owner/command; public 반환 미정 F1 | 열림 |
| layout.readState | explicit geometry input → Q layout | style/visible slots/logical preview copy | 연결 |
| layout.setStyle | new style → C LAYOUT_STYLE_CHANGED | public 반환 미정 F1 | 열림 |
| layout.setGrid | rows/cols → C GRID_LAYOUT_CHANGED | safe resize만; public 반환 미정 F1 | 열림 |
| layout.setZoom | runtime percent → Frontend-only | 50..200 intent; event/owner/return 절차 미정 F2 | 열림 |
| layout.commitZoom | interaction completion → runtime | persistent second copy 없음; event/return 미정 F2 | 열림 |
| layout.setZoomLocked | flag → runtime lock | event/owner/return 미정 F2 | 열림 |
| layout.resetZoom | runtime default → runtime | default/reset/lock sequencing·return 미정 F2 | 열림 |
| layout.mergeSlots | slot ids → C SLOTS_MERGED | rectangular/≤1 local payload; public 반환 미정 F1 | 열림 |
| layout.splitSlots | anchors → C SLOTS_SPLIT | anchor payload 보존/covered defaults; public 반환 미정 F1 | 열림 |

## 발견·후속 작업

1. **F1 — public result shape**: 여러 wrapper의 `return dispatchProjectCommand(...)`는 내부 `(result, interfaceState, rendererInput)`이다. `API_BOUNDARY_RULE`은 이를 public settings/chart/bool로 자동 간주하지 말라고 하지만, 여러 operation은 성공/거부 반환을 아직 선언하지 않았다. 내부 tuple을 임의로 공개하거나 모든 command를 bool로 획일화하지 않는다. 다음 단위에서 기존 public 소비자를 대조해 각 값을 상위에서 결정해야 한다. 이번에는 이미 chart 반환을 선언한 move/delete만 동일 post-commit read 경로로 연결했다.
2. **F2 — runtime composition**: `createEmptyProjectCsv`는 domain create helper이고 public create-and-select wrapper가 없다. selected identity F 경로 자체는 존재하지만 public 반환/selection sequencing 대조가 남는다. zoom은 `RUNTIME_STATE_RULE`과 API inventory에는 있지만 Frontend owner/event/lock/reset 절차가 구체화되지 않았다. Backend command나 project field를 새로 만들어 메우면 안 된다.
3. **F3 — pure calculation route**: `assets.fileKind`, `assets.resolveImportPlan`은 API inventory에 있으나 `PUBLIC_BACKEND_READ_CONTRACTS`에 named route가 없다. `readBackendProjection`은 미등록 operation을 오류로 처리한다. pure helper 존재만으로 public adapter 연결을 주장하지 않는다. current-authority 재검증/choice cancellation 규칙은 이미 유지한다.
4. **F4 — router/export completion**: package builders와 raster 소비자는 있지만 공개 router의 target 분기·batch 취소/결과와 download 완료/미선택/실패 반환의 전 operation 명세가 부족하다. renderer resource lifetime 및 L 공통 오류 전파만으로 이 구멍을 닫지 않는다.
5. **F5 — lower drift와 구버전 API**: 현재 `fast-figure.js`의 `window.FastFigureApi`는 Source의 `slots.swap`을 공개하지 않는다. 이는 Source에서 제거하라는 뜻이 아니라 향후 번역에서 보완할 하위 누락이다. Source의 `LOWER_LAYER_API_REPLACEMENTS` 6개는 별도 대체/제거 의도가 이미 명시돼 있다. 현재 JS object에는 그 6개 이름이 공개되어 있지 않다. 내부 legacy helper나 다른 direct Backend 접근의 제거 완료까지 주장하지 않는다.

## 근거·한계

- Source 확인: `sourcescript/application/public_api/{__init__,assets,graphs,layout_annotations}.py`, `sourcescript/application/adapter.py`, `sourcescript/backend/{project_state,project_efsm,assets_files,graphs,layout_annotations}.py`, `sourcescript/frontend/{interface_fsm,mantine_ui,renderer}.py`.
- 하위 비교 자료: `fast-figure.js`의 `window.FastFigureApi`, graph move/delete 및 이미 선언된 post-commit query 반환. 하위 동작을 자동 상위 권위로 삼지 않는다.
- 전체 inventory의 87개 operation을 대조했다. **전체 대조표 작성 완료 ≠ 모든 API 계약 완결/검증 완료**다. F1–F4 및 왕복·목적·중복통합 최종 검토가 남으므로 source closure는 open이다.
- 정적 검토이며 API/Source Script/app/browser/TLC를 실행하지 않았다. Actions metadata 검사도 이 표의 의미적 완결성 증명이 아니다.
