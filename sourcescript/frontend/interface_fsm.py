"""
Fast Figure Source Script — Frontend interface/runtime FSM

Frontend session/runtime과 사용자 상호작용 상태를 소유한다.
Application이 전달한 참조 판정 결과로 선택 상태를 전이하고 현재 값을 반환한다.
"""

selectedSlotId = (
    "현재 Frontend slot 선택 reference id. 소유자는 interfaceFSM이다."
)

interfaceState = {'lifecycle': 'booting/ready/importing/exporting/error',
 'workspace': 'project/slot.graph/slot.image',
 'overlay': 'none/layout/label/caption/print/readme',
 'assetSelection': 'none/csv/image/directory',
 'assetPath': '선택 asset의 canonical 경로 문자열 또는 None.',
 'graphObject': 'none/selected',
 'graphObjectIndex': '선택 graph object의 0 기반 정수 index 또는 None.',
 'direction': 'ui-to-fsm/model-to-fsm/model-to-ui',
 'error': '마지막 lifecycle task error projection 또는 없음',
 'dashboardZoomIntent': '세션 대시보드 표시 배율. 단위: %.'}

INTERFACE_REGION_ORDER = ["lifecycle", "workspace", "overlay", "assetSelection", "graphObject"]

INTERFACE_EVENTS = {
    'SELECT_SLOT': 'SELECT_SLOT',
    'SELECT_ASSET': 'SELECT_ASSET',
    'CLEAR_ASSET_SELECTION': 'CLEAR_ASSET_SELECTION',
    'SELECT_GRAPH_OBJECT': 'SELECT_GRAPH_OBJECT',
    'CLEAR_GRAPH_OBJECT': 'CLEAR_GRAPH_OBJECT',
    'TOGGLE_OVERLAY': 'TOGGLE_OVERLAY',
    'CLOSE_OVERLAY': 'CLOSE_OVERLAY',
    'OUTSIDE_CLICK': 'OUTSIDE_CLICK',
    'ESCAPE': 'ESCAPE',
    'SET_DASHBOARD_ZOOM': 'SET_DASHBOARD_ZOOM',
    'RESET_DASHBOARD_ZOOM': 'RESET_DASHBOARD_ZOOM',
    'LIFECYCLE_START': 'LIFECYCLE_START',
    'LIFECYCLE_COMPLETE': 'LIFECYCLE_COMPLETE',
    'LIFECYCLE_FAILED': 'LIFECYCLE_FAILED',
}









class InterfaceStateMachine:
    def __init__(self):
        """
        Args:
        - 없음.

        Return:
        - 없음.

        변경:
        - interfaceState와 selectedSlotId.

        처리:
            1. selectedSlotId에 None을 둔다. interfaceState의 lifecycle은 booting,
               workspace는 project, overlay와 assetSelection과 graphObject는 none으로 둔다.
               assetPath, graphObjectIndex, error에는 None, direction에는 model-to-ui를 둔다.
            2. dashboardZoomIntent에 100을 둔다.
        """

    def readState(self):
        projection = "Frontend 상태 읽기 딕셔너리."
        """
        Args:
        - 없음.

        Return:
        - projection:
          interfaceState의 필드와 selectedSlotId를 담은 읽기 전용 딕셔너리.
          Source of Truth: /frontend/interface_fsm/interfaceState와 selectedSlotId

        변경:
        - 없음.

        처리:
            1. 현재 interfaceState의 필드를 projection에 분리 복사한다.
            2. projection["selectedSlotId"]에 현재 selectedSlotId를 넣는다.
               None은 선택 해제이며 0을 포함한 정수 id는 원래 값을 보존한다.
            3. projection을 읽기 전용 결과로 반환한다. 호출자는 이번 작업에 사용한다.
        """
        return projection

    def send(self, event, validatedInput):
        projection = "Frontend 상태 읽기 딕셔너리."
        """
        Args:
        - event:
          INTERFACE_EVENTS의 등록값.

        - validatedInput:
          accepted, reference, workspaceHint, selectionHint와 이벤트 인자를 담은 딕셔너리.
          원형: /backend/project_state/FrontendValidatedInput

        Return:
        - projection:
          이번 전이의 Frontend 읽기 결과.

        변경:
        - interfaceState와 selectedSlotId.

        처리:
            1. validatedInput의 accepted가 False이면 self.readState()의 결과를 반환한다.
            2. INTERFACE_EVENTS["SELECT_SLOT"]이면 reference와 selectionHint를 확인한다.
               reference가 None이거나 같은 id에 toggle-clear hint가 있으면 selectedSlotId를 None으로 둔다.
               그 외에는 검증된 id를 selectedSlotId에 둔다. None의 workspace는 project, 나머지는 workspaceHint다.
               graphObject와 graphObjectIndex를 none으로 둔다. 최종 reference가 None이거나 toggle-clear hint이면
               assetSelection과 assetPath도 none으로 두고, clear-graph-object hint이면 현재 asset 선택을 유지한다.
               검증된 non-null slot 선택은 overlay를 닫으며 명시적 deselection은 overlay를 유지한다.
            3. INTERFACE_EVENTS["SELECT_ASSET"]이면 검증된 kind/path 또는 none을 assetSelection/assetPath에 반영한다.
               graphObject/index를 none으로 두고 slot과 workspace를 유지한다.
            4. INTERFACE_EVENTS["SELECT_GRAPH_OBJECT"]이면 reference가 None일 때 graphObject/index를 none으로 둔다.
               검증된 index이면 graphObject=selected와 해당 index를 저장한다.
               selectionHint에 CSV path가 있으면 assetSelection=csv와 해당 path를 저장하고 나머지 경우 현재 asset 선택을 유지한다.
            5. INTERFACE_EVENTS["CLEAR_ASSET_SELECTION"]이면 assetSelection/path를, INTERFACE_EVENTS["CLEAR_GRAPH_OBJECT"]이면 graphObject/index를 none으로 둔다.
               각 경우 다른 독립 선택 필드는 유지한다.
            6. INTERFACE_EVENTS["TOGGLE_OVERLAY"]이면 현재와 같은 이름은 none, 다른 이름은 전달된 overlay로 바꾼다.
               INTERFACE_EVENTS["CLOSE_OVERLAY"], INTERFACE_EVENTS["OUTSIDE_CLICK"], INTERFACE_EVENTS["ESCAPE"]이면 overlay를 none으로 둔다.
            7. INTERFACE_EVENTS["SET_DASHBOARD_ZOOM"]이면 유한 수 입력을 50..200으로 제한하고
               무효 입력은 100으로 정하여 dashboardZoomIntent에 둔다.
            8. INTERFACE_EVENTS["RESET_DASHBOARD_ZOOM"]이면 dashboardZoomIntent를 100으로 둔다.
            9. INTERFACE_EVENTS["LIFECYCLE_START"]이면 전달된 importing/exporting과 error=None을 저장한다.
               INTERFACE_EVENTS["LIFECYCLE_COMPLETE"]이면 ready와 error=None을 저장한다.
            10. INTERFACE_EVENTS["LIFECYCLE_FAILED"]이면 error projection과 error lifecycle을 저장한다.
                error projection은 다음 START 또는 COMPLETE까지 유지한다.
            11. self.readState()의 결과를 projection에 두고 반환한다.
        """
        return projection

    def reconcileProjectResult(self, reconciliationInput):
        projection = "Frontend 상태 읽기 딕셔너리."
        """
        Args:
        - reconciliationInput:
          buildFrontendReconciliationInput의 검증된 selectedSlotId, workspaceHint,
          assetKind/path, graphObjectIndex와 방향을 담은 딕셔너리.

        Return:
        - projection:
          프로젝트 반영 결과와 참조를 맞춘 Frontend 읽기 결과.

        변경:
        - selectedSlotId와 interfaceState의 선택 필드, workspace, direction.

        처리:
            1. reconciliationInput의 selectedSlotId를 현재 선택 참조에 반영한다.
            2. 선택이 None이면 workspace에 project, 그 외에는 workspaceHint를 넣는다.
            3. assetKind/path와 graphObjectIndex를 전달된 값으로 반영한다.
               index가 None이면 graphObject를 none, 그 외에는 selected로 둔다.
            4. direction을 model-to-fsm으로 둔다. self.readState()의 결과를 projection에 두고 반환한다.
        """
        return projection

    def recoverLifecycle(self):
        projection = "오류를 유지한 ready 상태 읽기 딕셔너리."
        """
        Args:
        - 없음.

        Return:
        - projection:
          복귀 후 self.readState()의 결과.

        변경:
        - interfaceState["lifecycle"].

        처리:
            1. 현재 lifecycle이 error이면 ready로 바꾼다.
            2. self.readState()의 결과를 projection에 두고 반환한다.
        """
        return projection


interfaceFSM = InterfaceStateMachine()
