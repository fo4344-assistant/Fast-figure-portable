"""
Fast Figure Source Script — FFPX ProjectObject EFSM

EFSM 대상은 저장 파일이 아니라 저장·복원되는 authoritative ProjectObject 자체다.
"""

from project_state import activeProject, projectObjects

PROJECT_EFSM_BOUNDARY_RULE = (
    "Project EFSM은 Backend 내부 persistent mutation controller다. "
    "Frontend component/FSM/renderer는 projectEFSM.send를 직접 호출하지 않는다. "
    "persistent mutation intent는 public mutation API와 Application adapter를 통해 command로 전달된다. "
    "Project EFSM은 Frontend state, DOM, Mantine/React state를 import하거나 변경하지 않는다."
)

PROJECT_COMMANDS = {
    "PROJECT_LOADED": "검증된 ProjectObject 전체 교체",
    "PROJECT_NAME_CHANGED": "project metadata 이름 변경",
    "PROJECT_DIRECTORY_CREATED": "VFS directory 추가",
    "PROJECT_NODE_MOVED": "VFS path 변경과 entering-trash reference detach",
    "PROJECT_TRASH_EMPTIED": "trash subtree와 남은 reference 제거",
    "ASSETS_IMPORTED": "raw CSV/image file batch와 선택적 target slot 연결을 하나의 whole-project candidate로 import",
    "DATA_OBJECT_CREATED": "CSV asset 추가",
    "DATA_OBJECT_REPLACED": "CSV asset 내용 교체",
    "DATA_OBJECT_DELETED": "CSV asset과 그 asset을 참조하는 graph-object reference를 같은 candidate에서 원자적으로 제거",
    "IMAGE_OBJECT_CREATED": "image asset 추가",
    "IMAGE_OBJECT_REPLACED": "image asset 내용 교체",
    "IMAGE_OBJECT_DELETED": "image asset과 그 asset을 참조하는 slot image reference를 같은 candidate에서 원자적으로 제거",
    "SLOT_TYPE_CHANGED": "slot-local contentType 변경",
    "SLOTS_RESET": "slot-local payload reset과 owned chart 제거",
    "SLOTS_SWAPPED": "두 GUI 위치의 slot-local payload 교환",
    "SLOT_IMAGE_LINKED": "existing image reference를 slot에 연결",
    "SLOT_IMAGE_SETTINGS_CHANGED": "slot-local imageSettings candidate commit",
    "SLOT_DATA_CONNECTED": "CSV를 graph slot/chart object에 연결",
    "SLOT_IMAGE_IMPORTED": "imported image와 slot reference commit",
    "SLOT_CHART_IMPORTED": "FFSX/Plotly chart, 필요한 package CSV와 owning slot을 같은 candidate로 commit",
    "GRAPH_OBJECTS_REPLACED": "chart.editor.objects 교체",
    "CHART_LAYOUT_CHANGED": "chart persistent layout 설정 교체",
    "CHART_MODEL_REPLACED": "chart model 교체; imported chart editable 전환이면 필요한 project CSV 생성과 reference remap도 같은 candidate에 포함",
    "GRID_LAYOUT_CHANGED": "grid 크기와 slot arrangement 변경",
    "LAYOUT_STYLE_CHANGED": "persistent slotStyle candidate commit",
    "SLOTS_MERGED": "선택 직사각형의 slot-local payload를 top-left anchor로 원자적 병합",
    "SLOTS_SPLIT": "merged anchor를 visible 1x1 slots로 복원",
    "CAPTION_TEXT_INPUT": "explicit global/slot caption owner text 변경",
    "SLOT_CAPTIONS_INSERTED": "slot captions를 global caption text에 삽입",
    "CAPTION_SETTINGS_CHANGED": "global caption enabled/name/nameBold/presentation settings commit",
    "LABEL_SETTINGS_CHANGED": "persistent label 설정 변경",
    "LABEL_POSITION_CHANGED": "persistent label 위치 변경",
    "APPEARANCE_CHANGED": "persistent UI palette 변경",
    "EXPORT_SETTINGS_CHANGED": "persistent export 설정 변경",
}

PUBLIC_PROJECT_MUTATION_ROUTES = {
    "project.setName": "PROJECT_NAME_CHANGED",
    "project.importFile": "PROJECT_LOADED",
    "slots.setContentType": "SLOT_TYPE_CHANGED",
    "slots.select.pendingContentType": "SLOT_TYPE_CHANGED",
    "slots.reset": "SLOTS_RESET",
    "slots.swap": "SLOTS_SWAPPED",
    "images.setSettings": "SLOT_IMAGE_SETTINGS_CHANGED",
    "images.insertEmpty": "SLOT_IMAGE_IMPORTED",
    "assets.delete.csv": "DATA_OBJECT_DELETED",
    "assets.delete.image": "IMAGE_OBJECT_DELETED",
    "assets.move": "PROJECT_NODE_MOVED",
    "assets.createDirectory": "PROJECT_DIRECTORY_CREATED",
    "assets.createEmptyCsv": "DATA_OBJECT_CREATED",
    "assets.emptyTrash": "PROJECT_TRASH_EMPTIED",
    "assets.connectToSlot.csv": "SLOT_DATA_CONNECTED",
    "assets.connectToSlot.image": "SLOT_IMAGE_LINKED",
    "assets.importToDirectory": "ASSETS_IMPORTED",
    "assets.importToSlot": "ASSETS_IMPORTED",
    "graphs.setHeaderLines": "DATA_OBJECT_REPLACED",
    "graphs.setEditable": "CHART_MODEL_REPLACED",
    "graphs.addObject.emptySlot": "SLOT_DATA_CONNECTED",
    "graphs.addObject.existingChart": "GRAPH_OBJECTS_REPLACED",
    "graphs.moveObject": "GRAPH_OBJECTS_REPLACED",
    "graphs.setObjectValues": "GRAPH_OBJECTS_REPLACED",
    "graphs.deleteObject": "GRAPH_OBJECTS_REPLACED",
    "graphs.updateLayout": "CHART_LAYOUT_CHANGED",
    "graphs.applyPalette": "GRAPH_OBJECTS_REPLACED",
    "graphs.importFile": "SLOT_CHART_IMPORTED",
    "print.setSettings": "EXPORT_SETTINGS_CHANGED",
    "captions.setEnabled": "CAPTION_SETTINGS_CHANGED",
    "captions.setGlobalText": "CAPTION_TEXT_INPUT",
    "captions.setSlotText": "CAPTION_TEXT_INPUT",
    "captions.insertSlotCaptions": "SLOT_CAPTIONS_INSERTED",
    "captions.setName": "CAPTION_SETTINGS_CHANGED",
    "captions.setNameBold": "CAPTION_SETTINGS_CHANGED",
    "captions.setSettings": "CAPTION_SETTINGS_CHANGED",
    "labels.setEnabled": "LABEL_SETTINGS_CHANGED",
    "labels.setSettings": "LABEL_SETTINGS_CHANGED",
    "labels.setPosition": "LABEL_POSITION_CHANGED",
    "labels.resetPosition": "LABEL_POSITION_CHANGED",
    "appearance.setPalette": "APPEARANCE_CHANGED",
    "appearance.resetPalette": "APPEARANCE_CHANGED",
    "layout.setStyle": "LAYOUT_STYLE_CHANGED",
    "layout.setGrid": "GRID_LAYOUT_CHANGED",
    "layout.mergeSlots": "SLOTS_MERGED",
    "layout.splitSlots": "SLOTS_SPLIT",
}

PROJECT_MUTATION_GROUPS = {
    "project": "whole ProjectObject replacement와 metadata",
    "assets": "CSV/image/VFS와 reference",
    "slot-local": "slot content/chart/image/imageSettings/caption",
    "graphs": "chart model과 graph object/CSV reference",
    "layout": "grid와 slot geometry/payload ownership",
    "annotations": "persistent label/global caption/slot caption",
    "appearance-export": "persistent palette/export settings",
}

PROJECT_MUTATION_CONTRACT = [
    "Application boundary에서 전달된 declared command만 persistent mutation entry로 받으며 Frontend/renderer direct call을 공식 route로 두지 않는다.",
    "command input의 id/path/reference를 current activeProject에서 다시 resolve한다.",
    "command writable scope와 precondition을 확인한다.",
    "activeProject를 직접 부분 변경하기 전에 candidate ProjectObject 또는 candidate patch를 만든다.",
    "local rule, VFS/reference integrity, chart ownership, whole-project invariant를 검증한다.",
    "검증 성공 뒤 activeProject authority를 정확히 한 번 commit한다.",
    "실패하면 activeProject는 command 시작 전 authoritative state를 유지한다.",
    "commit pre/post에서 실제 mutation 사실을 ProjectMutationResult로 산출한다.",
    "selectedSlotId, asset/graph selection, workspace, overlay 등 interface state는 직접 변경하지 않는다.",
    "DOM/Plotly/Mantine projection을 수행하지 않는다.",
]

GRAPH_OBJECT_EDIT_INPUT_CONTRACT = {
    "one-object": (
        "GRAPH_OBJECTS_REPLACED accepts explicit chartId/index/values/selectedIndexHint for graphEditorSetObjectValues. "
        "Backend resolves current chart/objects/CSV and computes the candidate using graphs.py; new values are not a complete object-array authority."
    ),
    "objects": (
        "Existing add/move/delete/palette operations keep their declared intent and Backend candidate calculation. "
        "A Backend-internal graphEditorCommit may pass computed candidate objects; a Frontend read projection is not an alternative mutation source."
    ),
    "selection": "selectedIndexHint is an index-only runtime hint, not an instruction to replace current selected CSV from object.csvId.",
}

ProjectMutationResult = {
    "event": "처리한 project command",
    "committed": "commit 성공 여부",
    "changed": "command별 changed ids/path/owner",
    "removedGraphReferenceCount": "실제 제거한 graph-object CSV reference 수",
    "resetImageSlotCount": "실제 image reference를 비운 slot 수",
    "selectionHints": "후속 interface reconciliation에 필요한 identity/path 결과",
    "projectionEffect": "renderer effect를 결정할 수 있는 실제 commit 결과",
}

PROJECT_COMMAND_COVERAGE_RULE = (
    "PUBLIC_API_METHODS에서 persistent ProjectObject mutation으로 분류한 operation은 PUBLIC_PROJECT_MUTATION_ROUTES에 존재하고 "
    "그 route가 PROJECT_COMMANDS의 declared command로 수렴해야 한다. "
    "kind 또는 precondition에 따라 command가 달라지는 operation은 matrix에 explicit branch route를 둔다. "
    "domain helper가 candidate를 계산할 수는 있지만 activeProject commit을 독립 mutation path로 수행하지 않는다. "
    "같은 owner를 변경하는 UI/API 진입점은 동일 project command semantics를 공유한다."
)

PROJECT_RESULT_RULE = (
    "ProjectMutationResult는 장기 authority가 아니라 한 command의 immutable result다. "
    "Backend는 result를 Application boundary에 반환하고, Application adapter가 Backend reconciliation query를 거쳐 "
    "Frontend reconciliation input과 renderer effect로 변환한다. Project EFSM이 Frontend FSM 또는 renderer를 직접 호출하지 않는다."
)

class ProjectStateMachine:
    def send(self, event, payload):
        """
        1. PROJECT_COMMANDS membership과 precondition을 검증한다.
        2. current activeProject에서 모든 input/reference를 다시 resolve한다.
        3. 해당 domain module의 candidate builder를 실행한다.
        4. candidate whole-project invariant를 검증한다.
        5. 성공 candidate만 activeProject에 한 번 commit한다.
        6. 실제 pre/post 차이에서 ProjectMutationResult를 계산한다.
        7. interface state와 renderer를 변경하지 않고 result를 반환한다.
        """
        result = "ProjectMutationResult"
        return result

projectEFSM = (
    "activeProject를 유일한 persistent authority로 사용하는 ProjectStateMachine instance. "
    "별도 persistent project-state copy를 소유하지 않는다."
)
