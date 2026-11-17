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
          Frontend 상태 발행 후 호출할 알림 함수.

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
    projection = "Backend 조회 결과."
    request = "이번 호출용 요청 딕셔너리."
    frontendState = "interfaceFSM.readState의 이번 읽기 결과."
    layout = "layout.readState의 이번 읽기 결과."
    width = "실제 대시보드 표시 너비. 단위: px."
    """
    Args:
    - query:
      readBackendProjection의 등록된 조회 이름.

    - payload:
      명시적 id·path 및 Frontend 선택 참조를 가진 요청 딕셔너리 또는 None.

    Return:
    - projection:
      등록된 조회가 정한 읽기 전용 결과.

    변경:
    - 없음.

    처리:
        1. payload의 필드를 이번 호출의 request에 복사한다. None이면 빈 딕셔너리다.
        2. query가 renderer의 전면 투영 요청이면 interfaceFSM.readState()를 frontendState에 둔다.
           readBackendProjection("project-api", {operation: BACKEND_QUERY_KINDS["project-api"]["layout.readState"]})를
           layout에 둔다. 잠금 상태이면 frontendState["dashboardZoomLockedWidth"]를 width에 둔다.
           그 외에는 layout["slotStyle"]["referenceWidth"] * frontendState["dashboardZoomIntent"] / 100을 width에 둔다.
           request["frontendState"]와 request["width"]에 이 두 읽기·계산 결과를 넣는다.
           두 조회와 반환 사이에 비동기 대기·사용자 callback·다른 명령을 실행하지 않는다.
           잠금 기준 너비는 referenceWidth·host resize에도 유지되고 unlock/reset 이후에는
           최신 referenceWidth와 현재 배율을 사용한다. 이 계산값은 이번 요청에서만 사용한다.
        3. query와 request를 readBackendProjection에 전달하여 projection에 둔다.
           slot-image·ui-palette 등의 부분 renderer 요청은 기존 요청 필드만 전달한다.
        4. projection을 이번 호출의 결과로 전달한다. 조회 실패는 호출자에게 전파한다.
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
           accepted=False 입력은 Frontend 소유자가 상태와 revision을 유지한다.
        4. 명시적 graph object 선택은 selectAsset=True를 전달하며 commit 뒤 index 보정은
           selectAsset=False로 구분한다. Backend 조회 실패는 호출자에게 전파한다.
    """
    return projection


def dispatchSlotSelection(slotId, pendingContentType=None, direction="ui-to-fsm"):
    validatedInput = "FrontendValidatedInput 딕셔너리."
    interfaceState = "Frontend 상태 읽기 딕셔너리."
    selectionContext = "slot-selection-context 조회 결과."
    projectResult = "ProjectMutationResult 또는 None."
    rendererProjection = "renderer 조회 결과 또는 None."
    """
    Args:
    - slotId:
      선택할 슬롯 정수 id 또는 None. 0은 유효한 id다.

    - pendingContentType:
      빈 슬롯에 지정할 graph/image 문자열 또는 None.

    - direction:
      ui-to-fsm 또는 model-to-fsm.

    Return:
    - interfaceState, projectResult, rendererProjection:
      선택 처리 뒤 상태, 조건부 영속 명령 결과와 표시 입력의 튜플.

    변경:
    - Frontend 선택 상태. 빈 슬롯의 종류 변경 조건을 만족하면 해당 슬롯 contentType.

    처리:
        1. INTERFACE_EVENTS["SELECT_SLOT"]에 대응하는 BACKEND_REFERENCE_EVENTS의 함수에
           해당 이벤트 값과 slotId·direction을 가진 payload를 전달하여 반환값을 validatedInput에 둔다.
        2. 거부이면 현재 Frontend 읽기, None, None을 반환한다.
        3. interfaceFSM.send(INTERFACE_EVENTS["SELECT_SLOT"], validatedInput)으로 선택을 확정한다.
           ui-to-fsm의 같은 슬롯 입력은 toggle-clear, model-to-fsm 입력은 선택 유지다.
        4. 확정된 선택 id가 있고 pendingContentType이 있으면
           readBackendProjection("slot-selection-context", 현재 선택 참조)를 호출한다.
        5. 현재 대상이 비어 있고 contentType이 요청과 다르면
           dispatchProjectCommand("SLOT_TYPE_CHANGED", {slotId, contentType})를 한 번 호출한다.
           그 결과를 projectResult에 둔다. 그 외 projectResult에는 None을 둔다.
        6. 최종 interfaceFSM.readState()를 interfaceState에 두고 이를 요청에 담아
           dispatchProjectQuery("renderer", 요청)를 호출하여 rendererProjection에 둔다.
        7. 세 결과를 반환한다. 처리 중 예외는 호출자에게 전파한다.
    """
    return interfaceState, projectResult, rendererProjection


def dispatchProjectCommand(event, payload):
    result = "ProjectMutationResult 딕셔너리."
    frontendBefore = "Frontend 상태 읽기 딕셔너리."
    reconciliationInput = "FrontendReconciliationInput 딕셔너리."
    interfaceState = "Frontend 상태 읽기 딕셔너리."
    rendererProjection = "renderer 조회 결과 또는 None."
    """
    Args:
    - event:
      PROJECT_COMMANDS에 등록된 명령 이름.

    - payload:
      명령에 필요한 식별자·새 값·입력 파일 바이트 딕셔너리.

    Return:
    - result, interfaceState, rendererProjection:
      명령 결과, 최종 Frontend 상태, 표시 입력의 튜플.

    변경:
    - 명령이 지정하는 Backend 상태와 commit 뒤 Frontend 참조·revision.

    처리:
        1. event가 PROJECT_COMMANDS에 등록되었는지 확인한다. 미등록이면 실패를 전달한다.
        2. projectEFSM.send(event, payload)를 호출하여 result에 둔다.
        3. interfaceFSM.readState()를 frontendBefore에 둔다.
           result["committed"]가 False이면 frontendBefore, rendererProjection=None으로 반환한다.
        4. buildFrontendReconciliationInput(event, result, frontendBefore)를 호출한다.
           결과를 interfaceFSM.reconcileProjectResult에 전달하여 interfaceState에 둔다.
           object index mapping과 selection hint는 이 조회에서 현재 대상과 대조한다.
        5. interfaceState를 포함한 renderer 요청으로 dispatchProjectQuery("renderer", 요청)를 호출하여
           rendererProjection에 둔다. 이동 뒤 index 대응과 최종 선택은 4번에서 확정한 값을 사용한다.
           APPEARANCE_CHANGED의 호출자는 튜플의 rendererProjection 전체를
           renderer.applyDashboardProjectionInvalidation의 네 번째 인자로 전달한다.
           renderer는 그 결과의 appearance.uiPalette와 visibleSlots별 figure를 사용한다.
           같은 명령의 표시 입력을 다시 조회하지 않는다.
        6. 튜플을 반환한다. 명령 실패와 반영 후 조회 실패는 원래 예외로 전달한다.
           이미 반영한 명령의 상태는 반영 후 표시 실패 시에도 유지한다.
    """
    return result, interfaceState, rendererProjection


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
