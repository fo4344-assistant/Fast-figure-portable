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
from sourcescript.frontend import renderer
from sourcescript.frontend.interface_fsm import interfaceFSM, INTERFACE_EVENTS

BACKEND_REFERENCE_EVENTS = {
    INTERFACE_EVENTS["SELECT_SLOT"]: validateSlotSelection,
    INTERFACE_EVENTS["SELECT_ASSET"]: validateAssetSelection,
    INTERFACE_EVENTS["SELECT_GRAPH_OBJECT"]: validateGraphObjectSelection,
}





class ApplicationInterface:
    """Frontend 상태 읽기의 Application 진입점."""

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


appFSM = ApplicationInterface()
uiDisplay = "현재 mount의 요소별 표시 함수 또는 None. 원형: /frontend/mantine_ui/bindUiDisplay의 반환값."


def setUiDisplay(display):
    """
    Args:
    - display:
      /frontend/mantine_ui/bindUiDisplay의 결과 또는 None.

    Return:
    - 없음.

    변경:
    - 이 Application의 uiDisplay.

    처리:
        1. display를 uiDisplay에 둔다. UI를 해제할 때는 None을 전달한다.
    """


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
    before = "객체 선택 직전의 Frontend 상태."
    request = "참조 판정에 전달할 이번 이벤트의 입력 딕셔너리."
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
        1. payload의 필드를 request에 복사한다. None이면 빈 딕셔너리로 둔다.
           SELECT_GRAPH_OBJECT이면 interfaceFSM.readState()의 결과를 before에 두고 before["selectedSlotId"]를 request에 넣는다.
           명시적 객체 선택의 selectAsset=True와 참조 보정의 selectAsset=False 구분을 유지한다.
        2. BACKEND_REFERENCE_EVENTS에서 event에 대응하는 함수를 validator에 둔다.
           등록된 함수가 있으면 validator(event, request)의 결과를 validatedInput에 둔다.
           그 외에는 accepted=True와 request를 담은 validatedInput을 구성한다.
        3. interfaceFSM.send(event, validatedInput)의 결과를 projection에 둔다.
           입력이 거부되었거나 uiDisplay가 None이면 projection을 반환한다.
        4. SELECT_ASSET·CLEAR_ASSET_SELECTION이면 uiDisplay의 assetSelection(projection)과 graphObject(projection)를 호출한다.
           SELECT_GRAPH_OBJECT·CLEAR_GRAPH_OBJECT이면 graphObject(projection)를 호출한다.
           SELECT_GRAPH_OBJECT에서 자산 종류 또는 경로가 before와 달라졌으면 assetSelection(projection)도 호출한다.
        5. TOGGLE_OVERLAY·CLOSE_OVERLAY·OUTSIDE_CLICK·ESCAPE이면 overlay(projection["overlay"])를 호출한다.
           슬롯 선택 표시는 dispatchSlotSelection, 배율 표시는 배율 API, 작업 상태 표시는 runLifecycleTask에서 처리한다.
        6. projection을 반환한다. 조회·표시 오류는 호출자에게 전파한다.
    """
    return projection


def dispatchSlotSelection(slotId, pendingContentType=None, direction="ui-to-fsm"):
    validatedInput = "Backend가 검증한 선택 입력."
    interfaceState = "최종 Frontend 상태."
    selectionContext = "현재 visible 슬롯의 선택 문맥."
    projectResult = "조건부 종류 변경 결과 또는 None."
    commandState = "조건부 명령이 반환한 최종 Frontend 상태."
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
        1. validateSlotSelection("SELECT_SLOT", {slotId, direction})의 결과를 validatedInput에 둔다.
           거부이면 현재 상태와 None, None을 반환한다.
        2. interfaceFSM.send("SELECT_SLOT", validatedInput)의 결과를 interfaceState에 둔다.
        3. interfaceState["selectedSlotId"]가 None이 아니고 pendingContentType이 있으면 그 id로 slot-selection-context를 조회해 selectionContext에 둔다.
           현재 빈 슬롯의 종류가 요청과 다르면 dispatchProjectCommand에 SLOT_TYPE_CHANGED와 대상 id·종류를 전달한다.
           showSelectedEditor=False를 전달하여 이 절차의 4번에서 최종 슬롯 편집기를 표시한다.
           명령이 반환한 튜플을 projectResult, commandState, rendererProjection에 두고 commandState를 interfaceState에 둔다.
           명령을 호출하지 않았으면 projectResult에 None을 둔다.
        4. uiDisplay가 연결되어 있으면 selection(interfaceState)를 한 번 호출한다.
           renderer의 선택 장식·상호작용 권한을 이 상태로 먼저 갱신한다.
           선택이 None이면 workspace-structure를 조회하여 rendererProjection에 두고 튜플을 반환한다.
        5. 3번 명령이 이미 같은 최종 선택의 표시를 수행했으면 그 rendererProjection을 포함한 튜플을 반환한다.
           남은 유효 선택은 selected-slot을 한 번 조회하여 rendererProjection에 둔다.
           renderer.updateGraphView에 그 결과와 최종 상태를 전달하여 선택 슬롯 하나만 표시한다.
           실패하거나 틀이 호환되지 않아도 자동 전체 렌더링을 실행하지 않는다.
        6. 튜플을 반환한다. 선택·명령·표시 오류는 원래 예외로 전파한다.
    """
    return interfaceState, projectResult, rendererProjection


def dispatchProjectCommand(event, payload, showSelectedEditor=True):
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
    - showSelectedEditor:
      이 호출에서 현재 슬롯 편집기를 갱신할지 정하는 논리값.

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
           interfaceFSM.reconcileProjectResult(reconciliationInput)의 결과를 interfaceState에 둔다.
        4. PROJECT_LOADED이면 renderer.clearWorkspacePresentation()으로 이전 workspace 자원을 정리한다.
           workspace-structure 조회를 renderer.applyWorkspaceTransform에 전달해 새 빈 틀과 선택 장식만 준비한다.
           이 구조 조회를 rendererProjection에 둔다.
           refreshCommittedUi(event, payload, result, frontendBefore, interfaceState, True)를 호출한다.
           전체 내용은 렌더링 버튼에서 표시한다.
           (result, interfaceState, rendererProjection)을 반환한다.
        5. GRID_LAYOUT_CHANGED·SLOTS_MERGED·SLOTS_SPLIT·SLOTS_SWAPPED·LAYOUT_STYLE_CHANGED이면
           workspace-structure를 조회한다. 사라진 소유 연결만 정리하고 유지되는 내용은 CSS로 이동·확대·축소한다.
           틀이 안전하게 호환되지 않으면 전체 렌더링 필요를 안내한다.
           rendererProjection에 이 구조 조회를 둔다.
           refreshCommittedUi(event, payload, result, frontendBefore, interfaceState, showSelectedEditor)를 호출하고
           (result, interfaceState, rendererProjection)을 반환한다.
        6. reconciliationInput["projectionEffect"]의 pathOnly가 참이고 referencesRemoved가 거짓이면 구조·참조 정리만 수행한다.
           EXPORT_SETTINGS_CHANGED는 파일 출력 설정만 변경하므로 workspace 내용 갱신을 생략한다.
           이 두 경우에는 workspace-structure 조회를 rendererProjection에 두고
           refreshCommittedUi(event, payload, result, frontendBefore, interfaceState, showSelectedEditor)를 호출하고
           (result, interfaceState, rendererProjection)을 반환한다.
           그 외에는 selected-slot을 조회한다. 선택 None이면 구조 조회로 바꾸고 내용 계산을 생략한다.
           renderer.applyDashboardProjectionInvalidation에 event, result, interfaceState, 조회 결과를 한 번 전달한다.
           전체 palette/CSV/labels/captions 변경의 다른 슬롯 표시는 전체 렌더링 버튼에서 반영한다.
           전역 dashboard caption도 전체 버튼에서 갱신한다. Sidebar의 공식 값 읽기는 계속 허용한다.
        7. rendererProjection에 이번 조회 결과를 둔다.
           refreshCommittedUi(event, payload, result, frontendBefore, interfaceState, showSelectedEditor)를 호출하고 튜플을 반환한다.
           wrapper는 이 명령의 표시 작업을 중복 실행하지 않는다.
           조회·표시 오류는 원래 실패로 전달하며 이미 완료한 commit은 유지한다.
    """
    return result, interfaceState, rendererProjection


def refreshCommittedUi(event, payload, result, before, current, showSelectedEditor):
    changed = "이번 명령의 반영 사실. 원형: /backend/project_efsm/ProjectMutationResult의 changed."
    operation = "이번 명령의 operation 또는 None."
    tree = "이번 명령에서 자산 트리를 읽을지 여부."
    connections = "이번 명령에서 슬롯 연결 행을 읽을지 여부."
    options = "이번 명령에서 CSV 옵션을 읽을지 여부."
    csvOptions = "이번 호출의 assets.readList('csv') 결과 또는 조회하지 않았음을 뜻하는 None."
    initialized = "이번 호출에서 편집기를 새로 표시했는지 여부."
    palette = "새 프로젝트의 UI 팔레트. 원형: /backend/project_state/activeProject._state.appearance.uiPalette."
    """
    Args:
    - event:
      반영된 PROJECT_COMMANDS의 이름.
    - payload:
      반영한 명령의 인자 딕셔너리. operation과 targetSlotId는 이 명령에서 정의한 경우에만 사용한다.
    - result:
      이번 명령 결과. 원형: /backend/project_efsm/ProjectMutationResult.
    - before, current:
      참조 보정 전후 /frontend/interface_fsm/InterfaceStateMachine.readState의 결과.
    - showSelectedEditor:
      dispatchProjectCommand에서 받은 현재 슬롯 편집기 표시 여부.

    Return:
    - 없음.

    변경:
    - 현재 UI에서 이 명령의 영향을 받는 요소의 표시값.

    처리:
        1. PROJECT_LOADED이면 dispatchProjectQuery("project-api", {operation: "appearance.readPalette"})의 결과를 palette에 둔다.
           renderer.applyUiPalette(palette)로 CSS 색상을 적용한다. uiDisplay가 연결되어 있으면
           uiDisplay.palette(palette), projectName(), assetTree(), slotConnections() 순으로 호출하고
           csvOptions()의 반환 배열을 selection(current, csvOptions, force=True)에 전달한다. 이 분기를 종료한다.
        2. uiDisplay가 None이면 종료한다. result["changed"]를 changed에, payload.get("operation")을 operation에 둔다.
           tree, connections, options를 모두 False로 둔다.
        3. changed["assets"]의 각 항목에서 role이 created/deleted/moved이거나
           role=imported이고 replaced=False이면 tree=True로 둔다. 같은 조건이고 kind가 csv이면
           options=True로 둔다. role=updated 또는 role=imported이며 replaced=True인 CSV는
           tree=True만 둔다. changed["linkedAssetMovesOrRemovals"]에 항목이 있으면 connections=True로 둔다.
        4. event가 GRID_LAYOUT_CHANGED, SLOTS_MERGED, SLOTS_SPLIT, SLOTS_SWAPPED, SLOT_TYPE_CHANGED,
           SLOTS_RESET, SLOT_IMAGE_LINKED, SLOT_DATA_CONNECTED, SLOT_IMAGE_IMPORTED, SLOT_CHART_IMPORTED,
           CHART_MODEL_REPLACED 중 하나이면 connections=True로 둔다.
           ASSETS_IMPORTED이고 payload.get("targetSlotId")가 None이 아니어도 connections=True로 둔다.
           changed["targetSlotReferencesChanged"]가 True이거나 SLOT_DATA_CONNECTED이면 tree=True로 둔다.
        5. GRAPH_OBJECTS_REPLACED이면 operation이 graphs.addObject/graphs.deleteObject일 때 tree와
           connections를 True로 둔다. graphs.moveObject는 connections만 True로 둔다.
           graphs.setObjectValues는 changed["graphObjectCsvChanged"]가 True일 때만 tree와 connections를 True로 둔다.
           graphs.applyPalette와 CHART_LAYOUT_CHANGED는 이 세 플래그를 설정하지 않는다.
        6. PROJECT_NAME_CHANGED이면 projectName()을 호출한다. tree, connections, options 각각이 True일 때
           assetTree(), slotConnections(), csvOptions()를 이 순서대로 한 번 호출한다.
           csvOptions의 반환 배열은 이 호출의 csvOptions에 둔다. options=False이면 이 변수는 None이다.
        7. showSelectedEditor가 False이면 9번으로 간다. initialized를 False로 둔다.
           before/current의 selectedSlotId 또는 workspace가 다르면 selection(current,csvOptions)의 반환값을
           initialized에 둔다. 같고 current["selectedSlotId"]가 changed["slotIds"]에 있으면
           slot(current,csvOptions,event)의 반환값을 initialized에 둔다.
        8. 7번에서 selection을 호출했거나 initialized가 참이면 아래 선택 표시를 반복하지 않는다. 그 외에는
           before/current의 assetSelection 또는 assetPath가 다르면 assetSelection(current), graphObjectIndex가
           다르면 graphObject(current), overlay가 다르면 overlay(current["overlay"])를 호출한다.
           initialized가 거짓일 때만 다음 편집기 갱신을 수행한다.
           비어 있지 않은 chartIds와 event·operation·removedObjectChartIds·appendedObjectChartIds를 graph에,
           비어 있지 않은 imageIds를 image에, 비어 있지 않은 csvIds를 csv에 전달한다.
           각 함수는 현재 표시 대상 id의 포함 여부를 검사한다.
        9. GRID_LAYOUT_CHANGED·LAYOUT_STYLE_CHANGED·SLOTS_MERGED·SLOTS_SPLIT·SLOTS_SWAPPED이면 layout()을 호출한다.
           LABEL_SETTINGS_CHANGED·LABEL_POSITION_CHANGED이면 labels(event), CAPTION_TEXT_INPUT·SLOT_CAPTIONS_INSERTED·
           CAPTION_SETTINGS_CHANGED이면 captions(event, changed["slotIds"])를 호출한다.
           EXPORT_SETTINGS_CHANGED이면 printSettings()를 호출한다. APPEARANCE_CHANGED의 UI 팔레트 적용은
           setAppearanceApiPalette에서 처리한다. 이 단계를 마치고 반환한다.
           표시 오류가 발생해도 이미 완료한 프로젝트 반영은 유지한다.
    """


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
    state = "작업 상태 전이 직후의 Frontend 읽기 결과."
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
        3. dispatchInterfaceEvent("LIFECYCLE_START", {lifecycle, event})의 결과를 state에 둔다.
           uiDisplay가 연결되어 있으면 lifecycle(state["lifecycle"])을 호출한다.
        4. task를 정확히 한 번 호출한다. 동기 반환 또는 비동기 완료 값을 outcome에 둔다.
        5. 정상 완료이면 dispatchInterfaceEvent("LIFECYCLE_COMPLETE", {event, outcome})의 결과를 state에 둔다.
           uiDisplay가 연결되어 있으면 lifecycle(state["lifecycle"])을 호출하고 outcome을 반환한다.
        6. task의 동기 예외 또는 비동기 거부이면 원래 오류를 failure에 둔다.
           dispatchInterfaceEvent("LIFECYCLE_FAILED", {event, message: failure의 메시지})의 결과를 state에 둔다.
           uiDisplay가 연결되어 있으면 taskError(state["error"])를 호출한다.
           오류 표시의 성공 여부와 관계없이 interfaceFSM.recoverLifecycle()의 결과를 state에 둔다.
           uiDisplay가 연결되어 있으면 lifecycle(state["lifecycle"])을 호출한다. 오류 표시와 조작 가능 여부 갱신에서 발생한 오류로
           작업의 원래 failure를 바꾸지 않는다. failure를 호출자에게 전파한다.
    """
    return outcome
