"""
Fast Figure Source Script — Application boundary / public-api contract

하위 구현 검증 자료: ../../../fast-figure.js, ../../../fast-figure-ui.js, ../../../Fast-figure.html.
Python 표기의 구현 명세이며 application runtime을 실행하는 모듈이 아니다.
"""

from sourcescript.application import adapter
from sourcescript.application.public_api import assets, graphs, layout_annotations
from sourcescript.backend.project_efsm import PUBLIC_PROJECT_MUTATION_ROUTES

FastFigureApi = {
    "project": "project metadata와 FFPX project command",
    "slots": "selected slot/runtime selection과 slot-local mutation command",
    "images": "selected slot image read/settings/creation command",
    "assets": "VFS/asset read, planning, import, move, trash, download command",
    "graphs": "selected chart/editor/layout/Plotly/FFSX command",
    "print": "persistent export settings와 target/current-screen export command",
    "captions": "project global caption과 explicit slot-local caption command",
    "labels": "persistent label settings/position command",
    "appearance": "persistent UI palette command",
    "layout": "layout style/grid/runtime zoom/merge/split command",
}


PUBLIC_API_METHODS = {
    "project": {
        "readName": "Backend query; args 없음; current project meta name immutable projection",
        "setName": "layout_annotations.setProjectName(value, trim=False); PROJECT_NAME_CHANGED -> fresh project.readName 문자열; 미commit None, 오류 전파",
        "importFile": "lifecycle mutation; file 입력 -> PROJECT_LOADED 내부 FFPX parse/candidate/검증/commit -> 성공 시 immutable project snapshot; 실패/취소는 기존 경로로 전달",
        "exportFile": "assets.downloadProject; selected slot이면 None/no download, 그 외 FFPX handoff 후 None; 오류 전파/Project 보존",
    },
    "slots": {
        "readSelected": (
            "cross-layer read; Frontend selectedSlotId reference와 Backend query result를 결합한 immutable selected-slot projection"
        ),
        "select": (
            "Application operation; slot reference를 Backend에서 validate한 뒤 Frontend SELECT_SLOT을 수행한다. "
            "explicit pendingContentType intent가 있으면 selection과 분리된 SLOT_TYPE_CHANGED command를 Application adapter가 조건부 실행한다."
        ),
        "setContentType": "layout_annotations.setSlotContentType(slotId, contentType); explicit target SLOT_TYPE_CHANGED; 성공/미commit None, 오류 전파; pending state 없음",
        "reset": "layout_annotations.resetSlotApi(slotId); SLOTS_RESET local reset/owned chart 제거; 성공/미commit None, 오류 전파",
        "swap": "layout_annotations.swapSlots(sourceSlotId, targetSlotId); SLOTS_SWAPPED -> committed True, missing/hidden/same-id/미commit False; 오류 전파",
        "prepareFileDrop": (
            "Application runtime operation; Backend에서 explicit visible target을 검증하고 invalid면 unchanged false. "
            "이미 선택된 valid target이면 selection 유지, 다른 target이면 model-to-fsm selection 보장 후 true. "
            "toggle 또는 pending content-type mutation 없음; drag runtime 정리만 수행"
        ),
        "finishFileDrop": "layout_annotations.finishDashboardFileDrop; Frontend controller의 drag interaction cleanup 후 None; selection/Project 보존",
    },
    "images": {
        "readEditor": "read; selected slot -> image asset + slot-local imageSettings projection",
        "setSettings": "mutation; SLOT_IMAGE_SETTINGS_CHANGED project command로 selected slot.content.imageSettings candidate validation/commit",
        "insertEmpty": "layout_annotations.insertEmptyImageIntoSelectedSlot(); SVG asset+selected image-slot reference one commit -> detached image; missing/non-image/미commit None, 오류 전파",
    },
    "assets": {
        "readDeletionTarget": "read/calculation; target asset과 collectAssetReferences 결과",
        "delete": "assets.deleteProjectAsset(target); kind-specific delete/detach one commit; 성공/missing/미commit None, 오류 전파; 내부 tuple 반환 없음",
        "readTree": "read; current VFS/assets에서 tree projection 계산",
        "isTrashed": "read; canonical path의 trash subtree membership 계산",
        "movable": "read/calculation; current VFS에서 fixed directory 여부와 source 존재를 기준으로 tree move 가능 여부 계산; trash membership 자체는 move 금지 조건이 아님",
        "readTrash": "read; current trash subtree projection",
        "moveOptions": "read/calculation; target directory 후보 계산",
        "planMove": "calculation; current VFS에서 destination/collision/reference count plan",
        "move": "assets.moveProjectNode(plan, useUniqueName); actual committed path + fresh assets.isTrashed -> immutable {path, trashed}; no plan/미commit None, 오류 전파",
        "createDirectory": "assets.createProjectDirectory(parent, name); commit -> validated SELECT_ASSET -> actual canonical path 문자열; 미commit None, 후속 오류 전파/숨은 rollback 없음",
        "createEmptyCsv": (
            "assets.createEmptyProjectCsvAndSelect; DATA_OBJECT_CREATED 성공 뒤 assets.selectProjectCsv로 생성 asset을 선택하고 detached CSV 반환; "
            "미commit은 기존 failure, selection 거부는 none, throw는 전파하며 이미 생성된 asset은 rollback하지 않음; chart/object 자동 생성 없음"
        ),
        "emptyTrash": "assets.emptyProjectTrash(); PROJECT_TRASH_EMPTIED; 성공/미commit None, 오류 전파; 내부 counts/tuple 공개 안 함",
        "draggableAsset": "read/calculation; slot connection drag payload로 사용할 수 있는 non-trash CSV/image asset projection; tree move 가능 여부와는 별도 판정",
        "connectToSlot": "assets.connectProjectAssetToSlot(path, kind, slotId); kind-specific commit 후 target selection 보장; 성공/미commit None, 오류 전파; asset selection 별도 변경 안 함",
        "importToDirectory": "assets.importProjectFilesToDirectory; batch ASSETS_IMPORTED one commit -> input-order detached asset list; empty [], 취소 None, 미commit result, 오류 전파",
        "importToSlot": "assets.importProjectFileToSlot; data/image asset + slot/chart ASSETS_IMPORTED one commit -> detached asset; slot package는 기존 graphs import로 detached chart; 취소 None, 미commit result, 오류 전파",
        "fileKind": "assets.readAssetFileKind -> Q assets.fileKind; copied name/type의 slot/data/image/empty kind 문자열; bytes/Project/Frontend 변경 없음",
        "importFiles": "assets.importProjectAssetFiles; captured explicit target과 input-order per-file helper; success detached item list, empty [], 취소 None/미commit result/throw에서 stop; earlier commit 유지, router 전체 atomic 아님",
        "collisionModel": "assets.readAssetCollisionModel -> Q assets.collisionModel; current VFS + reserved paths의 immutable 한 작업용 model",
        "resolveImportPlan": "assets.readAssetImportPlan -> Q assets.resolveImportPlan; current VFS 재검증한 path/replaceId; stale replace/invalid model은 오류, command commit은 별도 재검증",
        "selectDirectory": "runtime mutation; VFS-resolved directory selection",
        "selectCsv": "assets.selectProjectCsv(path) -> Q current CSV 확인 -> F SELECT_ASSET; 성공 detached CSV, missing/wrong-kind/거부 none; Project/slot 보존, graph object index clear",
        "selectImage": "runtime mutation; VFS-resolved image selection only; no slot mutation",
        "download": "assets.downloadProjectAsset; original bytes handoff True, missing/no bytes False, 오류 전파; disk 저장 보증 아님",
    },
    "graphs": {
        "readData": "read; selected chart objects + 단일 현재 CSV/columns + selected object csvId에서 별도로 resolve한 objectColumns; object reference는 현재 선택 대체 원천이 아님",
        "readLayout": "read; selected chart title/global/axis projection",
        "readPalette": "read; selected chart object color projection",
        "selectCsv": "runtime mutation; graph editor의 current CSV selection",
        "setHeaderLines": "graphs.graphEditorSetHeaderLines; DATA_OBJECT_REPLACED -> fresh normalized headerLines scalar, 미commit result/오류 전파",
        "setEditable": "mutation; CHART_MODEL_REPLACED project command로 editable conversion + 필요한 CSV를 한 candidate로 commit",
        "addObject": "mutation; chart 있으면 GRAPH_OBJECTS_REPLACED, 없으면 SLOT_DATA_CONNECTED project command",
        "moveObject": "mutation; chartId/from/to와 operation=graphs.moveObject -> GRAPH_OBJECTS_REPLACED 내부 순서 계산/commit; result hint는 to",
        "selectObject": "runtime mutation; explicit public object selection은 valid index와 그 object의 CSV path를 함께 선택; commit index-only 갱신은 기존 CSV 선택 보존",
        "setObjectValues": "mutation; explicit chart/index와 새 values를 전달; Backend가 요청 csvId 또는 기존 CSV를 resolve한 one-object candidate를 GRAPH_OBJECTS_REPLACED로 commit",
        "deleteObject": "mutation; chartId/index와 operation=graphs.deleteObject -> GRAPH_OBJECTS_REPLACED 내부 제거/commit; result hint는 explicit none; 마지막 object도 empty chart로 허용",
        "updateLayout": "graphs.graphEditorUpdateLayout; CHART_LAYOUT_CHANGED -> fresh title/global/axis read, 미commit result/오류 전파",
        "applyPalette": "graphs.graphEditorApplyPalette; GRAPH_OBJECTS_REPLACED -> fresh detached chart, 미commit result/오류 전파",
        "defaultColors": "read; immutable default color sequence copy",
        "hasSelectedSlot": "read; current selected slot 존재 여부",
        "importFile": "graphs.importSelectedGraphFile; SLOT_CHART_IMPORTED -> fresh detached chart, 미commit result/오류 전파",
        "exportFfsx": "graphs.exportSelectedGraph operation graphs.exportFfsx; selected slot FFSX handoff 후 None; target 없음 None/no download, 오류 전파",
        "exportPlotlyJson": "graphs.exportSelectedGraph operation graphs.exportPlotlyJson; semantic figure JSON handoff 후 None; target 없음 None/no download, 오류 전파",
    },
    "print": {
        "readSettings": "Backend query; current persistent export settings immutable projection",
        "setSettings": "mutation; EXPORT_SETTINGS_CHANGED project command로 width/heightMode/height/dpi/format candidate commit",
        "save": "export; persistent target settings snapshot으로 raster export, project mutation 없음",
        "capture": "export; current-screen one-shot capture, persistent target width/height mutation 없음",
    },
    "captions": {
        "readGlobal": "read; project-level global caption projection",
        "readSlot": "read; explicit slot id의 slot.caption projection",
        "setEnabled": "layout_annotations.setCaptionsApiEnabled; CAPTION_SETTINGS_CHANGED -> ANNOTATION_APPEARANCE_RESULT_RULE의 fresh global caption/False",
        "setGlobalText": "layout_annotations.setGlobalCaptionText; global text만 commit -> fresh global caption/False",
        "setSlotText": "layout_annotations.setSlotCaptionText; explicit slot text만 commit -> 그 slot의 fresh caption/False",
        "insertSlotCaptions": "layout_annotations.insertSlotCaptionsIntoGlobalCaption; Backend에서 layout-order text를 global에 삽입 -> fresh global caption/False",
        "setName": "layout_annotations.setCaptionsApiName; CAPTION_SETTINGS_CHANGED -> fresh global caption/False",
        "setNameBold": "layout_annotations.setCaptionsApiNameBold; CAPTION_SETTINGS_CHANGED -> fresh global caption/False",
        "setSettings": "layout_annotations.setCaptionsApiSettings; CAPTION_SETTINGS_CHANGED -> fresh global caption/False",
    },
    "labels": {
        "readState": "layout_annotations.readLabelsApiState; Frontend selectedSlotId를 explicit Backend query에 전달 -> persistent enabled/settings + reference geometry/sampleText copy",
        "setEnabled": "layout_annotations.setLabelsApiEnabled; LABEL_SETTINGS_CHANGED -> fresh public label state/False",
        "setSettings": "layout_annotations.setLabelsApiSettings; LABEL_SETTINGS_CHANGED -> fresh public label state/False",
        "setPosition": "layout_annotations.setLabelsApiPosition; LABEL_POSITION_CHANGED로 x/y 연속 commit -> fresh public label state/False",
        "finishPositionInteraction": "layout_annotations.finishLabelsApiPositionInteraction; 완료 알림 뒤 fresh public label state, 두 번째 commit 없음; read/알림 오류 전파",
        "resetPosition": "layout_annotations.resetLabelsApiPosition; 같은 position command로 (0, 0) -> fresh public label state/False",
    },
    "appearance": {
        "readPalette": "read; persistent UI palette projection",
        "setPalette": "layout_annotations.setAppearanceApiPalette; APPEARANCE_CHANGED 전체 palette 정규화/commit -> fresh palette/False",
        "resetPalette": "layout_annotations.resetAppearanceApiPalette; 유일한 default를 같은 setPalette 경로로 commit -> fresh palette/False",
    },
    "layout": {
        "readState": "layout_annotations.readLayoutApiState; Backend layout/preview copy + Frontend zoom/zoomLocked 합성; previewWidth 기본 600, transient read",
        "setStyle": "layout_annotations.setLayoutApiStyle; LAYOUT_STYLE_CHANGED -> fresh public layout state/False",
        "setGrid": "layout_annotations.setLayoutApiGrid; GRID_LAYOUT_CHANGED -> fresh public layout state/False; implicit reflow 금지",
        "setZoom": "layout_annotations.setLayoutApiZoom; SET_DASHBOARD_ZOOM -> fresh layout state; finite 50..200/invalid 100, locked no-op",
        "commitZoom": "layout_annotations.commitLayoutApiZoom; 완료 알림 한 번 -> fresh layout state; Project commit 없음",
        "setZoomLocked": "layout_annotations.setLayoutApiZoomLocked; 처음 lock 시 Frontend measured width anchor, invalid False; repeated lock/no-op 또는 unlock 후 fresh read",
        "resetZoom": "layout_annotations.resetLayoutApiZoom; unlock/width clear/100 percent 한 event -> fresh layout state",
        "mergeSlots": "layout_annotations.mergeSlots; SLOTS_MERGED one commit -> fresh layout state/False; one non-default payload만 anchor로 이동",
        "splitSlots": "layout_annotations.splitSlots; SLOTS_SPLIT one commit -> fresh layout state/False; anchor payload 유지/restored local defaults",
    },
}


LOWER_LAYER_API_REPLACEMENTS = {
    "print.readDefaults": "authoritative API에서는 print.readSettings로 교체한다.",
    "captions.readState": "global/slot owner가 다르므로 readGlobal/readSlot로 분리한다.",
    "captions.setSlotMode": "persistent project mutation이 아니므로 authoritative domain API에서 제거한다.",
    "captions.setText": "owner가 모호하므로 setGlobalText/setSlotText로 분리한다.",
    "labels.previewPosition": "setPosition과 같은 authority를 바꾸는 중복 surface라 제거한다.",
    "labels.commitPosition": "position의 두 번째 commit 의미를 제거하고 finishPositionInteraction으로 대체한다.",
}


API_BOUNDARY_RULE = (
    "Mantine component와 renderer를 포함한 Frontend는 activeProject, projectObjects, projectVfs, projectEFSM, "
    "getChart/getProjectCsv/getProjectImage 같은 Backend internal state/helper를 직접 import/read/call하지 않는다. "
    "persistent mutation은 FastFigureApi Backend-command method -> Application adapter -> Project EFSM으로, "
    "project read는 FastFigureApi Backend-query method -> Application adapter -> Backend read provider로 전달한다. "
    "Application 내부 결과 tuple과 public 반환값은 구분하며 sourcescript.application.adapter의 공통 결과 규칙을 따른다. "
    "caption/label/UI-palette wrapper의 공개 반환은 layout_annotations.ANNOTATION_APPEARANCE_RESULT_RULE을 따른다. "
    "이 operation의 미commit False를 graph/asset/lifecycle의 기존 실패 결과에 일괄 적용하지 않는다. "
    "graph add/move/setObjectValues/delete가 선언한 chart 반환은 commit 성공 뒤 graphs.readData의 chart copy를 반환한다. "
    "실패/취소에는 그 operation의 기존 실패 결과를 전달하고 성공 chart query를 하지 않는다. "
    "Frontend runtime event도 Backend identity validity가 필요하면 Application adapter가 검증한 input을 interfaceFSM에 전달한다. "
    "UI-local editor target, modal draft, pointer state는 public Backend API나 FFPX state가 아니다."
)


PUBLIC_LIFECYCLE_RULE = (
    "public project.importFile, assets.importToDirectory/importToSlot/importFiles, graphs.importFile은 "
    "adapter.runLifecycleTask(importing, 해당 operation, helper task) 안에서 한 번 실행한다. "
    "project.exportFile/assets.download/graphs.exportFfsx/exportPlotlyJson/print.save/capture는 exporting으로 동일하다. "
    "nested helper 호출은 public binding을 재진입하지 않으며 같은 task 안에서 command/query/helper를 직접 조정한다. "
    "따라서 router가 child import helper를 호출해도 busy/self-rejection이나 중복 lifecycle start를 만들지 않는다. "
    "ready가 아니면 query/choice/file read/download 전에 기존 busy rejection이며 task를 실행하지 않는다. "
    "취소 None/미commit result/missing-target 반환도 LIFECYCLE_COMPLETE 후 원래 결과를 전달한다. "
    "throw/rejection은 LIFECYCLE_FAILED -> ready recovery 뒤 원래 오류를 caller에 전파한다. "
    "download 성공은 browser handoff일 뿐 사용자 disk 저장 확인을 뜻하지 않는다."
)


READ_RULE = (
    "FastFigureApi Backend read operation은 current Backend authority에서 필요한 projection을 매번 계산해 immutable/transient value로 반환한다. "
    "read-time normalization은 projection copy에서만 수행하고 live ProjectObject를 변경하지 않는다. "
    "React/renderer가 받은 projection을 다른 subsystem의 장기 project authority 또는 무검증 mutation input으로 재사용하지 않는다."
)


PUBLIC_API_ROUTE_RULE = (
    "PUBLIC_API_METHODS의 persistent mutation은 Backend command route, project/model read는 Backend query route, "
    "overlay/selection/zoom 같은 session state는 Frontend event route로 구분한다. "
    "한 public operation이 Frontend selection과 persistent mutation을 모두 포함하면 slots.select처럼 Application boundary가 "
    "두 explicit step을 순서대로 조정하며 Frontend FSM 안에 hidden Backend command를 넣지 않는다."
)
