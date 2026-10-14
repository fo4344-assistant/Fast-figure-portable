"""
Fast Figure Source Script — FFPX ProjectObject EFSM

EFSM 대상은 저장 파일이 아니라 저장·복원되는 authoritative ProjectObject 자체다.
"""

from project_state import activeProject, projectObjects

PROJECT_COMMANDS = {
    "PROJECT_LOADED": "검증된 ProjectObject 전체 교체",
    "PROJECT_NAME_CHANGED": "project metadata 이름 변경",
    "PROJECT_DIRECTORY_CREATED": "VFS directory 추가",
    "PROJECT_NODE_MOVED": "VFS path 변경과 entering-trash reference detach",
    "PROJECT_TRASH_EMPTIED": "trash subtree와 남은 reference 제거",
    "DATA_OBJECT_CREATED": "CSV asset 추가",
    "DATA_OBJECT_REPLACED": "CSV asset 내용 교체",
    "DATA_OBJECT_DELETED": "CSV asset 제거",
    "IMAGE_OBJECT_CREATED": "image asset 추가",
    "IMAGE_OBJECT_REPLACED": "image asset 내용 교체",
    "IMAGE_OBJECT_DELETED": "image asset 제거",
    "SLOT_TYPE_CHANGED": "slot-local contentType 변경",
    "SLOTS_RESET": "slot-local payload reset과 owned chart 제거",
    "SLOTS_SWAPPED": "두 GUI 위치의 slot-local payload 교환",
    "SLOT_IMAGE_LINKED": "existing image reference를 slot에 연결",
    "SLOT_DATA_CONNECTED": "CSV를 graph slot/chart object에 연결",
    "SLOT_IMAGE_IMPORTED": "imported image와 slot reference commit",
    "SLOT_CHART_IMPORTED": "imported chart와 owning slot commit",
    "GRAPH_OBJECTS_REPLACED": "chart.editor.objects 교체",
    "CHART_LAYOUT_CHANGED": "chart persistent layout 설정 교체",
    "CHART_MODEL_REPLACED": "chart model 교체",
    "GRID_LAYOUT_CHANGED": "grid와 slot arrangement 변경",
    "CAPTION_TEXT_INPUT": "explicit global/slot caption owner text 변경",
    "SLOT_CAPTIONS_INSERTED": "slot captions를 global caption text에 삽입",
    "LABEL_SETTINGS_CHANGED": "persistent label 설정 변경",
    "LABEL_POSITION_CHANGED": "persistent label 위치 변경",
    "APPEARANCE_CHANGED": "persistent UI palette 변경",
    "EXPORT_SETTINGS_CHANGED": "persistent export 설정 변경",
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

ProjectMutationResult = {
    "event": "처리한 project command",
    "committed": "commit 성공 여부",
    "changed": "command별 changed ids/path/owner",
    "removedGraphReferenceCount": "실제 제거한 graph-object CSV reference 수",
    "resetImageSlotCount": "실제 image reference를 비운 slot 수",
    "selectionHints": "후속 interface reconciliation에 필요한 identity/path 결과",
    "projectionEffect": "renderer effect를 결정할 수 있는 실제 commit 결과",
}

PROJECT_RESULT_RULE = (
    "ProjectMutationResult는 장기 authority가 아니라 한 command의 immutable result다. "
    "interface reconciliation과 renderer projection에서만 소비한다."
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
