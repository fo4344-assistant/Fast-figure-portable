"""
Fast Figure Source Script — ApplicationStateMachine and controlled state transitions

하위 구현 검증 원천:
- ../fast-figure.js
  ApplicationStateMachine, APP_STATE_DEFINITIONS,
  SHARED_WORKSPACE_EVENTS, SHARED_OVERLAY_EVENTS,
  ASSET_SELECTION_EVENTS, GRAPH_OBJECT_EVENTS,
  apply*Action functions.

참조 Source Script:
- project_state.py
"""

from project_state import activeProject, projectObjects, selectedSlotId

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
    "CAPTION_TEXT_INPUT": (
        "payload가 명시한 global caption 또는 slot id의 slot-local caption text를 갱신한다. "
        "persistent slotMode를 참조하지 않는다."
    ),
    "SLOT_CAPTIONS_INSERTED": "slot-local caption text projection을 project-level global caption text에 삽입한다.",
    "PROJECT_DIRECTORY_CREATED": "VFS directory를 추가한다.",
    "PROJECT_NODE_MOVED": "VFS path와 필요 시 asset reference를 갱신한다.",
    "PROJECT_TRASH_EMPTIED": "trash asset/directory와 그 참조를 제거한다.",
    "DATA_OBJECT_CREATED": "CSV asset을 추가한다.",
    "DATA_OBJECT_REPLACED": "같은 CSV id/path의 asset 내용을 교체한다.",
    "DATA_OBJECT_DELETED": "참조가 정리된 CSV asset을 제거한다.",
    "IMAGE_OBJECT_CREATED": "image asset을 추가한다.",
    "IMAGE_OBJECT_REPLACED": "같은 image id/path의 asset 내용을 교체한다.",
    "IMAGE_OBJECT_DELETED": "참조가 정리된 image asset을 제거한다.",
    "SLOTS_RESET": "지정 slot object의 local properties를 defaults로 초기화한다.",
    "SLOTS_SWAPPED": "두 GUI 위치의 slot-local properties 전체를 교환한다.",
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

CANDIDATE_MUTATION_CONTRACT = [
    "authoritative input과 current id/path reference를 다시 resolve한다.",
    "해당 command/event의 writable scope와 precondition을 확인한다.",
    "active authority를 직접 바꾸기 전에 candidate state 또는 candidate patch를 계산한다.",
    "candidate의 local rule, cross-reference, whole-project invariant를 필요한 범위까지 검증한다.",
    "모든 검증이 성공한 뒤 authoritative state를 한 번 commit한다.",
    "commit 뒤 selectedSlotId/asset selection/graph-object selection처럼 파생 runtime state를 현재 project에 맞춘다.",
    "renderer/UI notification은 commit된 authority를 다시 읽어 projection한다.",
    "validation 이전 실패는 authoritative state를 변경하지 않는다.",
]

MUTATION_GROUPS = {
    "project": (
        "PROJECT_LOADED와 project metadata 변경. 전체 candidate ProjectObject를 먼저 검증하고 한 번 교체한다."
    ),
    "slot-local": (
        "type/reset/swap/image-link/data-connect/chart-import. slot object의 local properties와 chart ownership을 "
        "candidate에서 함께 계산해 partial slot state를 남기지 않는다."
    ),
    "assets": (
        "CSV/image create/replace/delete, directory/move/trash. VFS와 affected references를 같은 candidate에서 검증한다."
    ),
    "graphs": (
        "graph object list/layout/chart model. zero-object chart를 허용하고 referenced CSV를 candidate에서 검증한다."
    ),
    "layout": (
        "grid/merge/split. geometry와 slot-local payload 이동을 함께 계산하고 implicit data loss가 있으면 commit 전 거부한다."
    ),
    "captions": (
        "global caption은 project property, slot caption은 explicit slot id의 local property다. "
        "UI editor target mode는 mutation input에 명시적으로 전달할 뿐 persistent project state가 아니다."
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
    - 필요한 경우 empty slot의 contentType

    처리:
    1. payload slot id를 current project에서 resolve한다.
    2. UI toggle semantics이면 현재 선택과 같은 id를 다시 선택할 때 selectedSlotId를 none으로 만든다.
    3. selection이 바뀌면 graph-object selection을 현재 selected chart 기준으로 다시 검증하거나 해제한다.
    4. workspace는 selection과 slot.contentType에서 파생한다.
    5. 선택 chart는 별도 editing pointer에 저장하지 않고 필요할 때 resolve한다.
    """
    return "선택 결과"


def applyProjectLoadedAction(project):
    """
    Args:
    - project:
      전체 validation을 통과해야 하는 ProjectObject candidate.

    변경:
    - activeProject 전체 authoritative state
    - selectedSlotId/asset/graph-object runtime selection
    - project generation과 renderer projection

    처리:
    1. PROJECT_LOADED가 필요한 model scope의 write 권한을 확인한다.
    2. project candidate 전체를 authority 밖에서 validation한다.
    3. 검증 성공 후 ProjectObject.initialize로 authoritative project를 한 번 교체한다.
    4. project에 종속된 runtime selection을 clear 또는 새 project에서 다시 resolve한다.
    5. 이전 project의 display resource는 commit 뒤 release한다.
    6. renderer/UI는 새 activeProject를 다시 읽어 projection한다.
       projection 실패를 이유로 검증된 project를 이전 domain state로 일반 rollback하지 않는다.
    """
    return activeProject


def applyProjectNodeMovedAction(payload):
    """
    변경:
    - VFS directory 또는 asset directory/name
    - trash 진입 시 해당 CSV graph-object/image slot references
    - 필요 시 runtime asset/graph selection

    처리:
    1. source와 destination을 current projectVfs에서 다시 resolve한다.
    2. fixed directory, collision, recursive directory move를 commit 전에 거부한다.
    3. directory descendant와 asset-reference cascade를 포함한 candidate project를 만든다.
    4. collectAssetReferences 결과와 실제 detach 대상이 같은지 검증한다.
    5. candidate 전체 reference/VFS invariant를 검증한 뒤 한 번 commit한다.
    6. runtime selection이 제거된 object를 가리키면 commit 후 해제한다.

    보호된 default CSV 예외는 존재하지 않는다.
    """
    return "최종 이동 path"


def applyGraphObjectsReplacedAction(payload):
    """
    변경:
    - payload.chartId가 가리키는 editable chart의 editor.objects.

    처리:
    1. chart를 current project에서 resolve한다.
    2. payload objects를 authority 밖에서 normalize하고 각 CSV/column reference를 검증한다.
    3. objects=[]도 valid empty chart로 허용한다.
    4. chart copy의 editable graph projection을 다시 계산한다.
    5. owning slot 1:1 relation을 포함한 candidate project를 검증한 뒤 chart를 한 번 commit한다.
    6. graphObjectIndex가 새 object 범위를 벗어나면 runtime selection을 해제한다.

    fake default graph object 또는 protected default CSV를 만들지 않는다.
    """
    return "변경된 chart"


def applySlotsResetAction(slotIds):
    """
    변경:
    - 지정 slot object들의 local properties
    - 해당 slot들이 소유하던 chart collection
    - 관련 graph-object runtime selection

    처리:
    1. slot id들을 current project에서 resolve한다.
    2. 각 slot의 chart/image/contentType/caption을 default slot-local state로 바꾸는 candidate를 만든다.
    3. reset slot이 유일하게 소유하던 chart는 candidate chart collection에서 제거한다.
    4. slot geometry/span/hidden state는 reset content command가 별도로 요구하지 않는 한 유지한다.
    5. whole-project candidate를 검증한 뒤 한 번 commit한다.
    """
    return "reset 결과"


def applySlotsSwappedAction(sourceId, targetId):
    """
    변경:
    - source/target GUI 위치에 연결된 slot-local properties
    - selectedSlotId가 payload object identity를 따라야 하는 경우의 runtime selection

    처리:
    1. 두 visible slot을 current project에서 resolve한다.
    2. row/col/span 같은 layout position geometry는 유지한다.
    3. chart/image/contentType/caption 등 slot-local properties 전체를 한 단위로 교환한다.
    4. chart id는 그대로 두고 새 owning slot reference가 1:1인지 candidate에서 검증한다.
    5. 검증 성공 후 한 번 commit한다.
    """
    return "swap 결과"


def applyCaptionTextAction(target, text):
    """
    변경:
    - target이 global이면 project global caption text
    - target이 slot id면 해당 slot.caption

    처리:
    persistent slotMode를 읽지 않는다.
    target kind/id를 payload에서 명시적으로 받아 current authority에서 resolve한 뒤
    정확히 한 caption owner만 변경한다.
    """
    return "caption 변경 결과"


def applySlotCaptionsInsertedAction(slotIds):
    """
    변경:
    - project-level global caption text.

    처리:
    1. slotIds 또는 현재 visible slots를 current project에서 resolve한다.
    2. non-empty slot.caption을 layout/label order에 따라 text projection으로 계산한다.
    3. 계산된 text를 global caption text에 삽입할 candidate를 만든다.
    4. source slot.caption은 변경하지 않는다.
    5. candidate global caption을 commit한다.
    """
    return "global caption 변경 결과"


def applyGridLayoutAction(rows, cols):
    """
    변경:
    - activeProject.layout grid size와 slots.

    처리:
    layout_annotations_export.buildGridResizeCandidate 규칙으로 candidate를 만든다.
    unsafe shrink 또는 implicit reflow가 필요한 요청은 authority 변경 없이 거부한다.
    성공 candidate만 whole-project validation 후 한 번 commit한다.
    """
    return "grid layout 결과"

