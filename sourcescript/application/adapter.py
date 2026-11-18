"""
Fast Figure Source Script — Application boundary orchestration

이 파일은 기존 Application command-query-adapter 논리 모듈을 나타낸다.
Backend와 Frontend 사이의 command/query/result/lifecycle Adapter를 명세한다.
"""

from sourcescript.backend.project_state import (
    readBackendProjection,
    validateSlotSelection,
    validateAssetSelection,
    validateGraphObjectSelection,
    buildFrontendReconciliationInput,
)
from sourcescript.backend.project_efsm import projectEFSM, PROJECT_COMMANDS
from sourcescript.frontend.interface_fsm import interfaceFSM, INTERFACE_EVENTS

BACKEND_REFERENCE_EVENTS = {
    INTERFACE_EVENTS["SELECT_SLOT"]: validateSlotSelection,
    INTERFACE_EVENTS["SELECT_ASSET"]: validateAssetSelection,
    INTERFACE_EVENTS["SELECT_GRAPH_OBJECT"]: validateGraphObjectSelection,
}





class ApplicationInterface:
    """Frontend 상태 읽기와 알림 구독의 Application 진입점."""

    def readState(self):
        projection = "Frontend 상태 읽기 딕셔너리."
        """
        Args:
        - 없음.

        Return:
        - projection:
          interfaceFSM.readState의 이번 호출 결과.

        변경:
        - 없음.

        처리:
            1. interfaceFSM.readState()를 호출하여 projection에 둔다.
            2. projection을 호출자에게 반환한다.
        """
        return projection

    @property
    def state(self):
        projection = "Frontend 상태 읽기 딕셔너리."
        """
        Args:
        - 없음.

        Return:
        - projection:
          현재 Frontend 상태와 선택 참조.

        변경:
        - 없음.

        처리:
            1. self.readState()의 결과를 projection에 둔다.
            2. projection을 반환한다.
        """
        return projection

    def subscribe(self, onStoreChange):
        unsubscribe = "구독을 해제하는 함수."
        """
        Args:
        - onStoreChange:
          /frontend/interface_fsm/InterfaceStateMachine.publish의 notice를 받는 함수.

        Return:
        - unsubscribe:
          같은 등록을 해제하는 함수.

        변경:
        - interfaceFSM의 listener 집합.

        처리:
            1. interfaceFSM.subscribe(onStoreChange)를 호출한다.
            2. 반환된 해제 함수를 unsubscribe에 두고 반환한다.
        """
        return unsubscribe


appFSM = ApplicationInterface()


def dispatchProjectQuery(query, payload=None):
    projection = "이번 공식 조회의 읽기 전용 결과."
    request = "이번 호출용 요청 딕셔너리."
    frontendState = "현재 Frontend 상태 읽기."
    layout = "현재 layout.readControls의 입력 설정 결과."
    width = "대시보드 표시 너비. 단위: px."
    """
    Args:
    - query:
      등록된 Backend 조회 종류.
    - payload:
      명시적 operation·id·새 조회 인자의 딕셔너리 또는 None.

    Return:
    - projection:
      해당 범위의 읽기 전용 결과.

    변경:
    - 없음.

    처리:
        1. payload를 request로 복사한다. None이면 빈 딕셔너리다.
        2. renderer의 workspace-structure·selected-slot·whole-workspace 요청과 operation 생략이면
           interfaceFSM.readState()를 frontendState에 둔다. 생략 operation은 selected-slot으로 정한다.
           selected-slot이면 현재 frontendState["selectedSlotId"]를 request["slotId"]에 넣는다.
           layout.readControls의 공식 Backend 조회로 현재 referenceWidth만 포함한 입력 설정을 읽는다. previewGeometry·visibleSlots·assetDisplay를 구성하지 않는다.
           width=referenceWidth*frontendState["dashboardZoomIntent"]/100을 계산한다.
           request에 width와 frontendState를 넣는다. 두 읽기 사이에 비동기 대기·callback·명령을 넣지 않는다.
        3. 같은 request로 readBackendProjection(query, request)를 호출하여 projection에 둔다.
           slot-image·ui-palette와 export·project-api의 기존 입력·반환 계약은 유지한다.
        4. projection을 반환하고 원래 조회 오류를 전파한다.
    """
    return projection


def dispatchInterfaceEvent(event, payload=None):
    validatedInput = "FrontendValidatedInput 원형의 딕셔너리."
    projection = "Frontend 상태 읽기 딕셔너리."
    validator = "참조 판정 함수."
    """
    Args:
    - event:
      Frontend 이벤트 이름.

    - payload:
      이벤트별 새 입력과 id·path 참조 딕셔너리 또는 None.

    Return:
    - projection:
      이벤트 처리 뒤의 Frontend 상태.

    변경:
    - interfaceFSM이 소유하는 runtime 상태.

    처리:
        1. BACKEND_REFERENCE_EVENTS에서 event에 대응하는 함수를 validator에 둔다.
           등록된 함수가 있으면 validator(event,payload)를 한 번 호출하여 validatedInput에 둔다.
        2. 그 외에는 accepted=True와 event의 입력을 담은 validatedInput을 구성한다.
        3. interfaceFSM.send(event, validatedInput)의 결과를 projection에 두고 반환한다.
           accepted=False 입력은 Frontend 소유자가 현재 상태를 반환한다.
        4. 명시적 graph object 선택은 selectAsset=True를 전달하며 commit 뒤 index 보정은
           selectAsset=False로 구분한다. Backend 조회 실패는 호출자에게 전파한다.
    """
    return projection


def dispatchSlotSelection(slotId, pendingContentType=None, direction="ui-to-fsm"):
    validatedInput = "Backend가 검증한 선택 입력."
    interfaceState = "최종 Frontend 상태."
    selectionContext = "현재 visible 슬롯의 선택 문맥."
    projectResult = "조건부 종류 변경 결과 또는 None."
    rendererProjection = "구조 또는 선택 슬롯 조회 결과."
    """
    Args:
    - slotId:
      슬롯 정수 id 또는 None. 0은 유효하다.
    - pendingContentType:
      빈 슬롯의 graph/image 종류 입력 또는 None.
    - direction:
      ui-to-fsm 또는 model-to-fsm.

    Return:
    - interfaceState, projectResult, rendererProjection:
      최종 선택·조건부 명령·이번 표시 입력의 튜플.

    변경:
    - Frontend 선택과 선택 장식. 조건이 맞으면 빈 슬롯 종류.

    처리:
        1. 기존 Backend SELECT_SLOT 검증을 실행한다. 거부이면 현재 상태와 None, None을 반환한다.
        2. interfaceFSM.send로 선택을 반영한다. 같은 슬롯의 UI 입력은 toggle-clear,
           model-to-fsm은 선택 유지 규칙을 사용한다.
        3. 선택 id가 None이 아니고 pendingContentType이 있으면 slot-selection-context를 읽는다.
           현재 빈 슬롯의 종류가 요청과 다르면 dispatchProjectCommand의 SLOT_TYPE_CHANGED를 한 번 호출한다.
           그 결과를 projectResult에 둔다. 그 외에는 None이다.
        4. 최종 interfaceFSM.readState를 interfaceState에 둔다.
           renderer의 선택 장식·상호작용 권한을 이 상태로 먼저 갱신한다.
           선택이 None이면 workspace-structure를 조회하여 rendererProjection에 두고 튜플을 반환한다.
        5. 3번 명령이 이미 같은 최종 선택의 표시를 수행했으면 그 rendererProjection을 포함한 튜플을 반환한다.
           남은 유효 선택은 selected-slot을 한 번 조회하여 rendererProjection에 둔다.
           renderer.updateGraphView에 그 결과와 최종 상태를 전달하여 선택 슬롯 하나만 표시한다.
           실패하거나 틀이 호환되지 않아도 자동 전체 렌더링을 실행하지 않는다.
        6. 튜플을 반환한다. 선택·명령·표시 오류는 원래 예외로 전파한다.
    """
    return interfaceState, projectResult, rendererProjection


def dispatchProjectCommand(event, payload):
    result = "ProjectMutationResult 딕셔너리."
    frontendBefore = "참조 보정 전 Frontend 상태."
    reconciliationInput = "Backend 참조 보정 결과."
    interfaceState = "참조 보정을 마친 Frontend 상태."
    rendererProjection = "구조 또는 선택 슬롯의 이번 표시 입력."
    """
    Args:
    - event:
      PROJECT_COMMANDS의 명령 이름.
    - payload:
      기존 명령의 식별자·새 값·파일 바이트.

    Return:
    - result, interfaceState, rendererProjection:
      명령 결과·최종 선택·그 범위의 표시 입력 튜플.

    변경:
    - 기존 Backend 명령의 상태와 Frontend 참조. 허용된 표시 범위.

    처리:
        1. 등록된 명령인지 확인하고 projectEFSM.send(event, payload)를 한 번 호출하여 결과를 result에 둔다.
        2. interfaceFSM.readState()를 frontendBefore에 둔다.
           result["committed"]가 False이면 (result, frontendBefore, None)을 반환한다.
        3. buildFrontendReconciliationInput(event, result, frontendBefore)를 reconciliationInput에 둔다.
           interfaceFSM.reconcileProjectResult(event, reconciliationInput, result)의 결과를 interfaceState에 둔다.
           참조 보정을 마친 뒤 이 명령의 변경과 값이 달라진 Frontend 필드를 한 번 알린다.
        4. PROJECT_LOADED이면 renderer.clearWorkspacePresentation()으로 이전 workspace 자원을 정리한다.
           workspace-structure 조회를 renderer.applyWorkspaceTransform에 전달해 새 빈 틀과 선택 장식만 준비한다.
           이 구조 조회를 rendererProjection에 둔다. 내용은 전체 버튼에서 표시한다.
           (result, interfaceState, rendererProjection)을 반환한다.
        5. GRID_LAYOUT_CHANGED·SLOTS_MERGED·SLOTS_SPLIT·SLOTS_SWAPPED·LAYOUT_STYLE_CHANGED이면
           workspace-structure를 조회한다. 사라진 소유 연결만 정리하고 유지되는 내용은 CSS로 이동·확대·축소한다.
           틀이 안전하게 호환되지 않으면 전체 렌더링 필요를 안내한다.
           rendererProjection에 이 구조 조회를 두고 (result, interfaceState, rendererProjection)을 반환한다.
           내용 표시 분기로 진행하지 않는다.
        6. reconciliationInput["projectionEffect"]의 pathOnly가 참이고 referencesRemoved가 거짓이면 구조·참조 정리만 수행한다.
           EXPORT_SETTINGS_CHANGED는 파일 출력 설정만 변경하므로 workspace 내용 갱신을 생략한다.
           이 두 경우에는 workspace-structure 조회를 rendererProjection에 두고
           (result, interfaceState, rendererProjection)을 반환한다. 선택 내용 표시 분기로 진행하지 않는다.
           그 외에는 selected-slot을 조회한다. 선택 None이면 구조 조회로 바꾸고 내용 계산을 생략한다.
           renderer.applyDashboardProjectionInvalidation에 event, result, interfaceState, 조회 결과를 한 번 전달한다.
           전체 palette/CSV/labels/captions 변경의 다른 슬롯 표시는 전체 렌더링 버튼에서 반영한다.
           전역 dashboard caption도 전체 버튼에서 갱신한다. Sidebar의 공식 값 읽기는 계속 허용한다.
        7. rendererProjection에 이번 조회 결과를 두고 튜플을 반환한다.
           wrapper는 이 명령의 표시 작업을 중복 실행하지 않는다.
           조회·표시 오류는 원래 실패로 전달하며 이미 완료한 commit은 유지한다.
    """
    return result, interfaceState, rendererProjection


def transformWorkspace():
    projection = "현재 workspace 구조·기하 읽기."
    interfaceState = "현재 Frontend 상태."
    outcome = "기존 화면 CSS 변환 결과."
    """
    Args:
    - 없음.

    Return:
    - outcome:
      기존 화면의 이동·확대·축소 결과.

    변경:
    - workspace의 CSS 배치·배율과 장식.

    처리:
        1. dispatchProjectQuery("renderer", {"operation": "workspace-structure"})를 projection에 둔다.
           현재 Frontend 상태를 interfaceState에 둔다.
        2. renderer.applyWorkspaceTransform(projection, interfaceState)를 한 번 호출하여 outcome에 둔다.
           내용 figure 조회·Plotly 갱신·resize·이미지 decode를 실행하지 않는다.
        3. outcome과 원래 오류를 전달한다.
    """
    return outcome


def renderWholeWorkspace():
    projection = "이번 명시적 전체 표시의 Backend 조회 결과."
    interfaceState = "버튼 실행 시점의 Frontend 상태."
    outcome = "전체 표시 완료 결과 또는 busy 거부의 None."
    """
    Args:
    - 없음.

    Return:
    - outcome:
      renderer의 전체 표시 완료 결과.

    변경:
    - 전체 workspace의 표시 surface와 그 자원.

    처리:
        1. 현재 lifecycle이 ready인지 확인한다. busy이면 None을 반환한다.
        2. dispatchProjectQuery("renderer", {"operation": "whole-workspace"})를 한 번 호출한다.
           같은 처리에서 현재 Frontend 상태를 읽어 interfaceState에 둔다.
        3. renderer.renderWholeWorkspace(projection, interfaceState)를 호출하여 완료를 outcome에 둔다.
           이 진입점은 상단 렌더링 버튼의 workspace.render에 연결한다.
           Project 명령이나 선택 변경을 실행하지 않는다.
        4. outcome과 원래 오류를 호출자에게 전달한다.
    """
    return outcome


def runLifecycleTask(lifecycle, event, task):
    outcome = "task의 반환값."
    failure = "task가 발생시킨 오류."
    """
    Args:
    - lifecycle:
      importing 또는 exporting.

    - event:
      작업 이름.

    - task:
      Application 경계에서 한 번 호출하는 동기 또는 비동기 작업 함수.

    Return:
    - outcome:
      task가 반환한 값. 취소·미반영 결과도 그대로 포함한다.

    변경:
    - Frontend lifecycle과 error. task가 요청한 명령의 상태.

    처리:
        1. interfaceFSM.readState()["lifecycle"]이 ready인지 확인한다.
           busy이면 task 실행 전에 busy 거부 결과를 반환한다.
        2. lifecycle이 importing/exporting인지 확인하고 잘못된 값이면 실행 전에 거부한다.
        3. INTERFACE_EVENTS["LIFECYCLE_START"]로 lifecycle과 event를 interfaceFSM.send에 전달한다.
        4. task를 정확히 한 번 호출한다. 동기 반환 또는 비동기 완료 값을 outcome에 둔다.
        5. 정상 완료이면 INTERFACE_EVENTS["LIFECYCLE_COMPLETE"]로 event와 outcome을 interfaceFSM.send에 전달한 뒤 outcome을 반환한다.
        6. 동기 예외 또는 비동기 거부이면 원래 오류를 failure에 둔다.
           INTERFACE_EVENTS["LIFECYCLE_FAILED"]로 event와 메시지를 interfaceFSM.send에 전달하여 error 발행과 ready 복귀를 마친 뒤
           failure를 호출자에게 전파한다.
    """
    return outcome
