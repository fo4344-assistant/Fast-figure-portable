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
        "setName": "mutation; PROJECT_NAME_CHANGED project command로 project name candidate commit",
        "importFile": "lifecycle mutation; file 입력 -> PROJECT_LOADED 내부 FFPX parse/candidate/검증/commit -> 성공 시 immutable project snapshot; 실패/취소는 기존 경로로 전달",
        "exportFile": "read/export; current validated project snapshot -> FFPX; project mutation 없음",
    },
    "slots": {
        "readSelected": (
            "cross-layer read; Frontend selectedSlotId reference와 Backend query result를 결합한 immutable selected-slot projection"
        ),
        "select": (
            "Application operation; slot reference를 Backend에서 validate한 뒤 Frontend SELECT_SLOT을 수행한다. "
            "explicit pendingContentType intent가 있으면 selection과 분리된 SLOT_TYPE_CHANGED command를 Application adapter가 조건부 실행한다."
        ),
        "setContentType": "Backend command; SLOT_TYPE_CHANGED로 explicit slot/contentType candidate commit",
        "reset": "Backend command; SLOTS_RESET로 slot-local properties reset + owned chart 제거",
        "swap": "Backend command; SLOTS_SWAPPED로 두 GUI 위치의 slot-local payload를 교환",
        "prepareFileDrop": (
            "Application runtime operation; Backend에서 explicit visible target을 검증하고 invalid면 unchanged false. "
            "이미 선택된 valid target이면 selection 유지, 다른 target이면 model-to-fsm selection 보장 후 true. "
            "toggle 또는 pending content-type mutation 없음; drag runtime 정리만 수행"
        ),
        "finishFileDrop": "runtime completion; drag/drop interaction state 정리, domain payload 자체는 import command가 소유",
    },
    "images": {
        "readEditor": "read; selected slot -> image asset + slot-local imageSettings projection",
        "setSettings": "mutation; SLOT_IMAGE_SETTINGS_CHANGED project command로 selected slot.content.imageSettings candidate validation/commit",
        "insertEmpty": "mutation; SLOT_IMAGE_IMPORTED project command로 새 image asset + selected slot reference candidate를 함께 commit",
    },
    "assets": {
        "readDeletionTarget": "read/calculation; target asset과 collectAssetReferences 결과",
        "delete": "mutation; resolved kind에 따라 DATA_OBJECT_DELETED/IMAGE_OBJECT_DELETED가 reference detach + asset removal candidate를 한 번 commit",
        "readTree": "read; current VFS/assets에서 tree projection 계산",
        "isTrashed": "read; canonical path의 trash subtree membership 계산",
        "movable": "read/calculation; current VFS에서 fixed directory 여부와 source 존재를 기준으로 tree move 가능 여부 계산; trash membership 자체는 move 금지 조건이 아님",
        "readTrash": "read; current trash subtree projection",
        "moveOptions": "read/calculation; target directory 후보 계산",
        "planMove": "calculation; current VFS에서 destination/collision/reference count plan",
        "move": "mutation; PROJECT_NODE_MOVED project command가 current state에서 plan을 재검증하고 candidate move commit",
        "createDirectory": "mutation; PROJECT_DIRECTORY_CREATED project command로 canonical non-conflicting directory commit",
        "createEmptyCsv": (
            "assets.createEmptyProjectCsvAndSelect; DATA_OBJECT_CREATED 성공 뒤 assets.selectProjectCsv로 생성 asset을 선택하고 detached CSV 반환; "
            "미commit은 기존 failure, selection 거부는 none, throw는 전파하며 이미 생성된 asset은 rollback하지 않음; chart/object 자동 생성 없음"
        ),
        "emptyTrash": "mutation; PROJECT_TRASH_EMPTIED project command로 trash references/assets/directories candidate removal commit",
        "draggableAsset": "read/calculation; slot connection drag payload로 사용할 수 있는 non-trash CSV/image asset projection; tree move 가능 여부와는 별도 판정",
        "connectToSlot": "mutation; CSV는 SLOT_DATA_CONNECTED, image는 SLOT_IMAGE_LINKED project command로 명시적 연결 commit",
        "importToDirectory": "lifecycle mutation; ASSETS_IMPORTED project command로 batch file candidates -> collision plan -> one atomic commit",
        "importToSlot": "lifecycle mutation; ASSETS_IMPORTED project command로 raw file asset + target slot/chart candidate -> one atomic commit",
        "fileKind": "assets.readAssetFileKind -> Q assets.fileKind; copied name/type의 slot/data/image/empty kind 문자열; bytes/Project/Frontend 변경 없음",
        "importFiles": "lifecycle router; supported files를 directory/slot import contract로 전달",
        "collisionModel": "assets.readAssetCollisionModel -> Q assets.collisionModel; current VFS + reserved paths의 immutable 한 작업용 model",
        "resolveImportPlan": "assets.readAssetImportPlan -> Q assets.resolveImportPlan; current VFS 재검증한 path/replaceId; stale replace/invalid model은 오류, command commit은 별도 재검증",
        "selectDirectory": "runtime mutation; VFS-resolved directory selection",
        "selectCsv": "assets.selectProjectCsv(path) -> Q current CSV 확인 -> F SELECT_ASSET; 성공 detached CSV, missing/wrong-kind/거부 none; Project/slot 보존, graph object index clear",
        "selectImage": "runtime mutation; VFS-resolved image selection only; no slot mutation",
        "download": "read/export; asset original bytes download, project mutation 없음",
    },
    "graphs": {
        "readData": "read; selected chart objects + 단일 현재 CSV/columns + selected object csvId에서 별도로 resolve한 objectColumns; object reference는 현재 선택 대체 원천이 아님",
        "readLayout": "read; selected chart title/global/axis projection",
        "readPalette": "read; selected chart object color projection",
        "selectCsv": "runtime mutation; graph editor의 current CSV selection",
        "setHeaderLines": "mutation; DATA_OBJECT_REPLACED project command로 referenced CSV headerLines candidate commit",
        "setEditable": "mutation; CHART_MODEL_REPLACED project command로 editable conversion + 필요한 CSV를 한 candidate로 commit",
        "addObject": "mutation; chart 있으면 GRAPH_OBJECTS_REPLACED, 없으면 SLOT_DATA_CONNECTED project command",
        "moveObject": "mutation; chartId/from/to와 operation=graphs.moveObject -> GRAPH_OBJECTS_REPLACED 내부 순서 계산/commit; result hint는 to",
        "selectObject": "runtime mutation; explicit public object selection은 valid index와 그 object의 CSV path를 함께 선택; commit index-only 갱신은 기존 CSV 선택 보존",
        "setObjectValues": "mutation; explicit chart/index와 새 values를 전달; Backend가 요청 csvId 또는 기존 CSV를 resolve한 one-object candidate를 GRAPH_OBJECTS_REPLACED로 commit",
        "deleteObject": "mutation; chartId/index와 operation=graphs.deleteObject -> GRAPH_OBJECTS_REPLACED 내부 제거/commit; result hint는 explicit none; 마지막 object도 empty chart로 허용",
        "updateLayout": "mutation; CHART_LAYOUT_CHANGED project command로 chart title/global/axis candidate commit",
        "applyPalette": "mutation; GRAPH_OBJECTS_REPLACED project command로 graph object color candidate commit",
        "defaultColors": "read; immutable default color sequence copy",
        "hasSelectedSlot": "read; current selected slot 존재 여부",
        "importFile": "lifecycle mutation; SLOT_CHART_IMPORTED project command로 FFSX/Plotly candidate + target slot commit",
        "exportFfsx": "read/export; selected graph slot + referenced CSV snapshot -> FFSX",
        "exportPlotlyJson": "read/export; selected chart semantic figure -> Plotly JSON",
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
        "setEnabled": "mutation; CAPTION_SETTINGS_CHANGED project command로 global caption enabled commit",
        "setGlobalText": "mutation; global caption text만 commit",
        "setSlotText": "mutation; explicit slot id의 slot.caption만 commit",
        "insertSlotCaptions": "mutation; slot.caption text projection을 global caption text에 명시적으로 삽입",
        "setName": "mutation; CAPTION_SETTINGS_CHANGED project command로 global caption name commit",
        "setNameBold": "mutation; CAPTION_SETTINGS_CHANGED project command로 global caption nameBold commit",
        "setSettings": "mutation; CAPTION_SETTINGS_CHANGED project command로 global/shared caption presentation settings candidate commit",
    },
    "labels": {
        "readState": "read; persistent label settings + current slot reference geometry projection",
        "setEnabled": "mutation; LABEL_SETTINGS_CHANGED project command로 label enabled commit",
        "setSettings": "mutation; LABEL_SETTINGS_CHANGED project command로 label format/order/font candidate commit",
        "setPosition": "mutation; LABEL_POSITION_CHANGED project command로 authoritative x/y continuous commit",
        "finishPositionInteraction": "runtime notification; x/y의 두 번째 commit을 만들지 않음",
        "resetPosition": "mutation; LABEL_POSITION_CHANGED project command로 label x/y default origin commit",
    },
    "appearance": {
        "readPalette": "read; persistent UI palette projection",
        "setPalette": "mutation; APPEARANCE_CHANGED project command로 normalized palette candidate commit",
        "resetPalette": "mutation; APPEARANCE_CHANGED project command로 default palette candidate commit",
    },
    "layout": {
        "readState": "read; layout/style/visible slots/logical preview geometry projection",
        "setStyle": "mutation; LAYOUT_STYLE_CHANGED project command로 slotStyle candidate validation/commit",
        "setGrid": "mutation; GRID_LAYOUT_CHANGED project command로 safe resize candidate만 commit; implicit reflow 금지",
        "setZoom": "runtime mutation; dashboard zoom intent only",
        "commitZoom": "runtime notification; persistent layout state의 두 번째 copy를 만들지 않음",
        "setZoomLocked": "runtime mutation; session zoom lock",
        "resetZoom": "runtime mutation; session zoom default",
        "mergeSlots": "mutation; SLOTS_MERGED project command로 one non-default slot-local payload만 anchor로 원자적 이동",
        "splitSlots": "mutation; SLOTS_SPLIT project command로 anchor local payload 유지 + restored slots local defaults",
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
    "graph add/move/setObjectValues/delete가 선언한 chart 반환은 commit 성공 뒤 graphs.readData의 chart copy를 반환한다. "
    "실패/취소에는 그 operation의 기존 실패 결과를 전달하고 성공 chart query를 하지 않는다. "
    "Frontend runtime event도 Backend identity validity가 필요하면 Application adapter가 검증한 input을 interfaceFSM에 전달한다. "
    "UI-local editor target, modal draft, pointer state는 public Backend API나 FFPX state가 아니다."
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
