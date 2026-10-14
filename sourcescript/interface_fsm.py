"""
Fast Figure Source Script — interface/runtime FSM

FFPX ProjectObject가 아닌 application runtime과 사용자 상호작용 상태만 소유한다.
"""

from project_state import activeProject

selectedSlotId = (
    "영속 project state가 아닌 현재 UI/runtime slot 선택 id. interfaceFSM이 소유한다."
)

interfaceState = {
    "lifecycle": "booting/ready/importing/exporting/error",
    "workspace": "project/slot.graph/slot.image",
    "overlay": "none/layout/label/caption/print/readme",
    "assetSelection": "none/csv/image/directory",
    "assetPath": "current projectVfs에서 resolve 가능한 selected path 또는 없음",
    "graphObject": "none/selected",
    "graphObjectIndex": "current selected chart의 object index 또는 없음",
    "direction": "ui-to-fsm/model-to-fsm/model-to-ui",
    "revision": "frontend external-store subscriber용 revision",
    "error": "마지막 lifecycle task error 또는 없음",
}

INTERFACE_REGION_ORDER = ["lifecycle", "workspace", "overlay", "assetSelection", "graphObject"]

INTERFACE_EVENTS = {
    "SELECT_SLOT": "selectedSlotId와 workspace selection/toggle",
    "SELECT_ASSET": "asset runtime selection",
    "CLEAR_ASSET_SELECTION": "asset selection 해제",
    "SELECT_GRAPH_OBJECT": "graph object runtime selection",
    "CLEAR_GRAPH_OBJECT": "graph object selection 해제",
    "TOGGLE_OVERLAY": "overlay toggle",
    "CLOSE_OVERLAY": "overlay close",
    "OUTSIDE_CLICK": "generic overlay close",
    "ESCAPE": "generic overlay close",
    "LIFECYCLE_START": "import/export runtime 시작",
    "LIFECYCLE_COMPLETE": "ready 복귀",
    "LIFECYCLE_FAILED": "error projection과 recovery",
}

INTERFACE_SELECTION_INVARIANTS = {
    "slot": "selectedSlotId는 current activeProject visible slot 또는 none이고 workspace는 여기서 파생한다.",
    "asset": "asset selection/path는 current projectVfs에서 resolve되어야 한다.",
    "graphObject": "selected index는 current selected slot/chart object 범위 안이어야 한다.",
}

INTERFACE_LOCALITY_RULE = (
    "Layout selection Set, form draft, collision resolver, pointer drag, overlay resize height 등 component lifetime 값은 "
    "cross-component authority가 필요하지 않는 한 interfaceFSM으로 승격하지 않는다."
)

class InterfaceStateMachine:
    def send(self, event, payload):
        """
        interface region transition만 실행한다.
        persistent ProjectObject mutation action은 실행하지 않는다.
        target validity 확인은 current activeProject를 read-only resolve한다.
        """
        return "final interface state"

    def reconcileProjectResult(self, event, result):
        """
        projectEFSM commit 이후 호출한다.
        changed/moved/removed identity를 current activeProject에서 다시 resolve하고 invalid selection을 clear한다.
        still-valid selection은 유지하고 workspace를 reconciled selectedSlotId에서 다시 파생한다.
        project mutation을 다시 호출하지 않고 final interface state를 publish한다.
        """
        return "reconciled interface state"

    def notify(self, objectName, event, payload):
        """model-to-ui projection revision만 변경하고 ProjectObject를 변경하지 않는다."""
        return "interface state"

    def run(self, lifecycle, event, task):
        """ready/busy/error runtime sequencing. persistent task는 application orchestration을 사용한다."""
        return "task result"

interfaceFSM = "공유 application/UI runtime state의 유일한 InterfaceStateMachine instance"
