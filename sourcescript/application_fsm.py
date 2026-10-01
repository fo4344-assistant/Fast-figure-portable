"""
Fast Figure Source Script — ApplicationStateMachine and controlled state transitions

현재 구현 원천:
- ../fast-figure.js
  ApplicationStateMachine, APP_STATE_DEFINITIONS,
  SHARED_WORKSPACE_EVENTS, SHARED_OVERLAY_EVENTS,
  ASSET_SELECTION_EVENTS, GRAPH_OBJECT_EVENTS,
  apply*Action functions.

참조 Source Script:
- project_state.py
"""

from project_state import activeProject, projectObjects, selectedSlotId, editing

appState = {
    "lifecycle": "booting/ready/importing/exporting/error 중 현재 application lifecycle",
    "workspace": "project/slot.graph/slot.image 중 현재 workspace",
    "overlay": "none/layout/label/caption/print/readme 중 현재 generic overlay",
    "assetSelection": "none/csv/image/directory 중 현재 asset selection kind",
    "assetPath": "projectVfs에서 resolve 가능한 선택 경로 또는 없음",
    "graphObject": "none 또는 selected",
    "graphObjectIndex": "선택 graph object index 또는 없음",
    "direction": "fsm-to-model/model-to-fsm/model-to-ui 중 현재 전이 방향 표식",
    "revision": "frontend external-store 갱신에 사용하는 증가 revision",
    "error": "마지막 lifecycle task error 정보 또는 없음",
}

REGION_ORDER = [
    "lifecycle",
    "workspace",
    "overlay",
    "assetSelection",
    "graphObject",
]

REGION_STATES = {
    "lifecycle": "booting, ready, importing, exporting, error",
    "workspace": "project, slot.graph, slot.image",
    "overlay": "none, layout, label, caption, print, readme",
    "assetSelection": "none, csv, image, directory",
    "graphObject": "none, selected",
}

WORKSPACE_MUTATION_EVENTS = {
    "SELECT_SLOT": "runtime slot selection과 workspace를 갱신한다.",
    "SLOT_TYPE_CHANGED": "선택 slot 또는 pending slot type을 갱신한다.",
    "SLOT_CAPTION_MODE_CHANGED": "persistent caption slotMode를 갱신한다.",
    "CAPTION_TEXT_INPUT": "현재 caption target의 persistent text를 갱신한다.",
    "SLOT_CAPTIONS_INSERTED": "slot caption text를 전체 caption text에 반영한다.",
    "PROJECT_DIRECTORY_CREATED": "VFS directory를 추가한다.",
    "PROJECT_NODE_MOVED": "VFS path와 필요 시 asset reference를 갱신한다.",
    "PROJECT_TRASH_EMPTIED": "trash asset/directory와 그 참조를 제거한다.",
    "DATA_OBJECT_CREATED": "CSV asset을 추가한다.",
    "DATA_OBJECT_REPLACED": "같은 CSV id/path의 asset 내용을 교체한다.",
    "DATA_OBJECT_DELETED": "참조가 정리된 CSV asset을 제거한다.",
    "IMAGE_OBJECT_CREATED": "image asset을 추가한다.",
    "IMAGE_OBJECT_REPLACED": "같은 image id/path의 asset 내용을 교체한다.",
    "IMAGE_OBJECT_DELETED": "참조가 정리된 image asset을 제거한다.",
    "SLOTS_RESET": "지정 slot의 chart/image content를 초기화한다.",
    "SLOTS_SWAPPED": "두 slot의 content reference를 교환한다.",
    "SLOT_IMAGE_LINKED": "기존 image asset을 image slot에 연결한다.",
    "SLOT_DATA_CONNECTED": "CSV를 graph slot/chart object에 연결한다.",
    "GRAPH_OBJECTS_REPLACED": "chart.editor.objects authoritative array를 교체한다.",
    "CHART_LAYOUT_CHANGED": "chart editor title/global axis settings를 교체한다.",
    "CHART_MODEL_REPLACED": "선택 slot의 editable chart model을 교체한다.",
    "SLOT_IMAGE_IMPORTED": "새/기존 image model을 slot에 연결한다.",
    "SLOT_CHART_IMPORTED": "FFSX/Plotly에서 만든 chart model을 slot에 연결한다.",
    "GRID_LAYOUT_CHANGED": "grid와 slot arrangement를 변경한다.",
    "PROJECT_LOADED": "검증된 ProjectObject 전체를 activeProject로 교체한다.",
}

OVERLAY_EVENTS = {
    "TOGGLE_OVERLAY": "같은 overlay면 none, 다른 overlay면 요청 overlay로 전환한다.",
    "CLOSE_OVERLAY": "overlay를 none으로 전환한다.",
    "OUTSIDE_CLICK": "generic overlay close 의미",
    "ESCAPE": "generic overlay close 의미",
    "SELECT_SLOT": "slot 선택이 생기면 열린 overlay를 닫는다.",
}

SELECTION_INVARIANTS = {
    "asset": (
        "assetSelection이 none이면 assetPath는 resolve되지 않아야 한다. "
        "선택 상태면 projectVfs.resolve(assetPath).kind와 assetSelection이 같아야 한다."
    ),
    "graphObject": (
        "graphObject가 selected이면 graphObjectIndex가 선택 chart의 유효 object index여야 한다."
    ),
    "workspace": (
        "workspace는 selectedSlotId가 없으면 project, 선택 slot contentType이 image면 slot.image, "
        "그 외에는 slot.graph이어야 한다."
    ),
}


class ApplicationStateMachine:
    def send(self, event, payload):
        """
        Return:
        - state:
          event를 처리한 뒤의 appFSM state.

        변경:
        - 등록된 event action이 project/runtime state를 변경할 수 있다.
        - 대상 region state를 변경할 수 있다.

        처리:
        1. REGION_ORDER 순서로 현재 region definition에서 event handler를 찾는다.
        2. handler가 action을 가지면 해당 action을 먼저 실행한다.
        3. handler가 target을 가지면 region transition을 수행한다.
        4. 같은 event를 여러 region이 소유하면 각 region이 같은 payload를 순서대로 처리한다.
        5. 처리 region이 없으면 debug warning만 남기고 state를 임의 변경하지 않는다.
        """
        state = "event 처리 후 appFSM.state"
        return state

    def transition(self, region, target, event, payload):
        """
        변경:
        - region state와 direction을 변경한다.
        - state entry/exit/update hook를 실행한다.

        처리:
        target이 현재 state와 같으면 reenter 요청이 없는 한 update hook만 수행한다.
        model-to-fsm 방향의 workspace entry/update에서는 workspace/editor write lock을 걸어
        UI hydration이 다시 같은 model을 쓰지 못하게 한다.
        모든 전이 후 frontend subscriber에 state를 publish한다.
        """
        state = "transition 후 appFSM.state"
        return state

    def notify(self, objectName, event, payload):
        """
        Return:
        - state:
          model 변경을 UI/renderer에 알린 뒤의 appFSM state.

        변경:
        - project/domain state를 이 함수 자체에서 변경하지 않는다.
        - revision과 direction=model-to-ui를 갱신한다.

        처리:
        현재 workspace/overlay가 objectName을 구독하면 해당 update hook를 실행한다.
        booting 또는 다른 transition 도중이면 notify를 무시한다.
        """
        state = "notification publish 후 appFSM.state"
        return state

    def run(self, lifecycle, event, task):
        """
        Return:
        - task_result:
          task의 반환값.

        변경:
        - lifecycle을 ready -> 요청 lifecycle -> ready로 전환한다.
        - 실패하면 error 정보와 error lifecycle을 거친 뒤 ready로 복구한다.
        - task 자체는 별도의 공식 mutation command를 호출할 수 있다.

        처리:
        ready가 아니면 새 lifecycle task를 시작하지 않는다.
        sync/async task를 동일한 lifecycle 규칙으로 감싼다.
        """
        task_result = "완료한 lifecycle task 결과"
        return task_result


appFSM = (
    "projectObjects와 APP_STATE_DEFINITIONS를 사용하는 유일한 ApplicationStateMachine instance. "
    "frontend는 상태 구독과 UI event에 사용할 수 있고 domain mutation은 등록된 action 또는 FastFigureApi command를 통한다."
)


def applySlotSelectionAction(payload):
    """
    변경:
    - selectedSlotId
    - graphObject selection runtime state
    - 비어 있는 slot을 처음 선택할 때 pendingSlotContentType에 따라 slot.contentType

    처리:
    model-to-fsm hydration이 아닌 UI selection에서 현재 선택과 같은 slot id를 다시 보내면
    selectedSlotId를 none으로 만든다.
    """
    return "선택 결과"


def applyProjectLoadedAction(project):
    """
    Args:
    - project:
      전체 validation을 통과해야 하는 ProjectObject candidate.

    변경:
    - activeProject 전체 authoritative state
    - selectedSlotId/editing/graph object runtime state
    - projectObjectGeneration과 renderer projection

    처리:
    1. PROJECT_LOADED가 쓸 모든 model scope의 write 권한을 확인한다.
    2. candidate 전체를 validation한다.
    3. 이전 project/runtime state를 rollback용으로 보존한다.
    4. candidate를 activeProject에 initialize하고 runtime selection을 초기화한다.
    5. project renderer projection을 다시 적용한다.
    6. 어느 단계든 실패하면 이전 project/runtime state를 복원하고 candidate image URL을 정리한다.
    7. 성공 후 이전 project image display URL을 정리하고 revision을 증가시킨다.
    """
    return activeProject


def applyProjectNodeMovedAction(payload):
    """
    변경:
    - VFS directory 또는 asset directory/name
    - trash 진입 시 chart CSV reference와 image slot reference
    - 필요 시 asset/graph selection state

    처리:
    이동 대상과 destination을 실제 projectVfs에서 resolve한다.
    고정 directory와 보호된 default CSV는 이동하지 않는다.
    destination collision과 recursive directory move를 거부한다.
    trash로 새로 진입하면 해당 asset을 참조하는 graph object를 제거하고 image slot을 reset한다.
    이동 완료 후 전체 ProjectObject reference integrity를 validation한다.
    """
    return "최종 이동 path"


def applyGraphObjectsReplacedAction(payload):
    """
    변경:
    - payload.chartId가 가리키는 editable chart의 editor.objects.

    처리:
    빈 objects가 들어오면 보호된 기본 빈 CSV를 사용하는 기본 graph object 하나를 복구한다.
    교체 후 object를 normalize하고 editable graph renderer를 rebuild한다.
    """
    return "변경된 chart"
