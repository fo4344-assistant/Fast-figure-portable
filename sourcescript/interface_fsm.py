"""
Fast Figure Source Script — Frontend interface/runtime FSM

FFPX ProjectObject가 아닌 Frontend session/runtime과 사용자 상호작용 상태만 소유한다.
Backend ProjectObject, projectObjects, projectVfs, projectEFSM을 직접 import/read/call하지 않는다.
"""

selectedSlotId = (
    "영속 project state가 아닌 현재 Frontend slot 선택 reference id. interfaceFSM이 소유한다."
)

interfaceState = {
    "lifecycle": "booting/ready/importing/exporting/error",
    "workspace": "project/slot.graph/slot.image",
    "overlay": "none/layout/label/caption/print/readme",
    "assetSelection": "none/csv/image/directory",
    "assetPath": "Application boundary가 Backend에서 검증한 selected path reference 또는 없음",
    "graphObject": "none/selected",
    "graphObjectIndex": "validated selected chart context의 object index 또는 없음",
    "direction": "ui-to-fsm/model-to-fsm/model-to-ui",
    "revision": "frontend external-store subscriber용 revision",
    "error": "마지막 lifecycle task error projection 또는 없음",
}

INTERFACE_REGION_ORDER = ["lifecycle", "workspace", "overlay", "assetSelection", "graphObject"]

INTERFACE_EVENTS = {
    "SELECT_SLOT": "validated slot reference의 selectedSlotId/workspace selection/toggle",
    "SELECT_ASSET": "validated asset reference의 runtime selection",
    "CLEAR_ASSET_SELECTION": "asset selection 해제",
    "SELECT_GRAPH_OBJECT": "validated graph object reference/index의 runtime selection",
    "CLEAR_GRAPH_OBJECT": "graph object selection 해제",
    "TOGGLE_OVERLAY": "overlay toggle",
    "CLOSE_OVERLAY": "overlay close",
    "OUTSIDE_CLICK": "generic overlay close",
    "ESCAPE": "generic overlay close",
    "LIFECYCLE_START": "Application boundary가 시작한 import/export runtime 표시",
    "LIFECYCLE_COMPLETE": "Application boundary가 전달한 ready 복귀",
    "LIFECYCLE_FAILED": "Application boundary가 전달한 error projection과 recovery",
}

INTERFACE_SELECTION_INVARIANTS = {
    "slot": (
        "selectedSlotId는 Application boundary가 Backend validateFrontendIntent 또는 reconciliation query로 검증한 "
        "visible slot reference 또는 none이다. Frontend FSM이 activeProject를 직접 조회해 유효성을 판정하지 않는다."
    ),
    "asset": "asset selection/path는 Backend query에서 accepted된 reference 또는 none이다.",
    "graphObject": "selected index는 Backend query가 current selected chart context에 대해 accepted한 index 또는 none이다.",
}

FRONTEND_FSM_BOUNDARY_RULE = (
    "interfaceFSM은 Frontend 내부 runtime authority다. Backend function/task callback을 실행하지 않고 "
    "Backend command/query를 직접 호출하지 않는다. Backend identity를 가리키는 event는 Application boundary가 "
    "검증한 input만 받고, project commit 뒤에는 Application boundary가 만든 reconciliation input만 소비한다."
)

FRONTEND_TRANSITION_RULES = {
    "rejected": "accepted=False이면 state/revision/selection을 그대로 유지하고 publish하지 않는다.",
    "SELECT_SLOT": (
        "reference none이면 deselect; toggle-clear hint이며 같은 id이면 deselect; 그 외 validated id를 선택한다. "
        "workspace는 none이면 project, 아니면 workspaceHint다. 모든 accepted slot selection은 graphObject/index와 assetSelection/path를 clear한다. "
        "같은 id의 model-to-fsm 선택은 toggle하지 않는다. overlay는 explicit deselection이면 유지하고 non-null slot 선택이면 닫는다."
    ),
    "SELECT_ASSET": (
        "validated kind/path 또는 none을 assetSelection/path에 반영하고 graphObject/index를 clear한다. slot/workspace는 유지한다."
    ),
    "SELECT_GRAPH_OBJECT": (
        "reference none이면 graphObject/index만 clear한다. accepted index면 graphObject=selected/index를 반영한다. "
        "selectionHint에 CSV path가 제공된 경우에만 assetSelection=csv/path를 함께 바꾼다. hint none이면 기존 asset selection을 유지한다."
    ),
    "CLEAR_ASSET_SELECTION": "assetSelection/path만 none으로 만든다.",
    "CLEAR_GRAPH_OBJECT": "graphObject/index만 none으로 만든다. current CSV 선택을 변경하지 않는다.",
    "LIFECYCLE_START": "Application이 전달한 importing/exporting으로 전환하고 이전 error를 clear한 뒤 publish한다.",
    "LIFECYCLE_COMPLETE": "ready로 전환하고 error를 clear한 뒤 publish한다. outcome은 project commit result를 대체하지 않는다.",
    "LIFECYCLE_FAILED": (
        "event/message error projection을 저장하고 error 상태를 publish한 다음, 같은 failure 처리에서 ready recovery를 publish한다. "
        "error projection은 다음 START/COMPLETE까지 유지한다. task 실행 또는 Backend mutation은 없다."
    ),
}

INTERFACE_LOCALITY_RULE = (
    "Layout selection Set, form draft, collision resolver, pointer drag, overlay resize height 등 component lifetime 값은 "
    "cross-component authority가 필요하지 않는 한 interfaceFSM으로 승격하지 않는다."
)

class InterfaceStateMachine:
    def readState(self):
        """
        Return:
        - state:
          current Frontend runtime state의 immutable projection.

        변경:
        - 없음.

        처리:
        Application boundary와 Frontend renderer가 필요한 selectedSlotId/assetPath/graphObjectIndex/workspace/overlay/lifecycle만 읽는다.
        반환값을 persistent ProjectObject authority로 사용하지 않는다.
        """
        return "current Frontend runtime state projection"

    def send(self, event, validatedInput):
        """
        Frontend region transition만 실행한다.
        persistent ProjectObject mutation action과 Backend read/resolve를 실행하지 않는다.
        Backend identity가 필요한 event는 accepted FrontendValidatedInput을 받아 처리한다.
        rejected input은 state/revision을 그대로 보존하며 publish하지 않는다.
        accepted input의 값 변경과 publish 순서는 FRONTEND_TRANSITION_RULES를 따른다.
        Backend reference가 필요 없는 overlay/lifecycle event는 Application boundary가 만든 local accepted input을 받는다.
        """
        return "final Frontend interface state"

    def reconcileProjectResult(self, event, reconciliationInput):
        """
        Project EFSM commit 성공 뒤 Application boundary가 계산한 FrontendReconciliationInput을 받는다.
        valid reference는 유지하고 moved reference는 supplied identity/path result로 갱신하며 invalid reference만 clear한다.
        workspace는 reconciled selectedSlotId와 supplied workspaceHint에서 다시 파생한다.
        Backend를 재조회하거나 project mutation을 다시 호출하지 않고 final Frontend state를 publish한다.
        """
        return "reconciled Frontend interface state"

    def notify(self, objectName, event, payload):
        """model-to-ui projection revision만 변경하고 ProjectObject를 변경하지 않는다."""
        return "Frontend interface state"

interfaceFSM = "Frontend session/runtime state의 유일한 InterfaceStateMachine instance"
