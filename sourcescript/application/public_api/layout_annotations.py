"""
Fast Figure Source Script — Application boundary / public-api — layout, annotation and export wrappers

하위 구현 검증 자료: ../../../fast-figure.js, ../../../fast-figure-ui.js, ../../../Fast-figure.html.
Python 문법으로 작성한 구현 명세다.
"""

from sourcescript.backend.project_state import BACKEND_QUERY_KINDS
from sourcescript.application.adapter import dispatchProjectCommand, dispatchProjectQuery, dispatchInterfaceEvent, dispatchSlotSelection, transformWorkspace
from sourcescript.backend.project_state import DEFAULT_UI_PALETTE
from sourcescript.frontend.interface_fsm import interfaceFSM
from sourcescript.frontend.renderer import renderDashboardTarget, renderDashboardCurrent, finishDashboardFileDropInteraction







def setProjectName(value, trim=False):
    outcome = "프로젝트 이름 문자열 또는 None."
    """
    Args:
    - value:
      새 프로젝트 이름으로 문자열 변환할 값.

    - trim:
      프로젝트 이름의 양끝 공백 제거 여부인 논리값.

    Return:
    - outcome:
      프로젝트 이름 문자열 또는 None.

    변경:
    - activeProject._state["meta"]["projectName"].

    처리:
        1. 문자열 변환과 선택적 trim, Backend naming 설정의 길이 제한. name 정규화/commit은 Backend가 소유한다.
           dispatchProjectCommand('PROJECT_NAME_CHANGED', {'value': value, 'trim': trim})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           None를 반환한다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['project.readName']})를 반환한다.
    """
    return outcome


def setSlotContentType(slotId, contentType):
    outcome = "None."
    """
    Args:
    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    - contentType:
      graph 또는 image 문자열.

    Return:
    - outcome:
      None.

    변경:
    - 대상 Slot.content["contentType"].

    처리:
        1. slots.setContentType의 explicit slotId/type 입력. pending intent를 별도 session authority로 저장하지 않는다.
           dispatchProjectCommand('SLOT_TYPE_CHANGED', {'slotId': slotId, 'contentType': contentType})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           None를 반환한다.
    """
    return outcome


def resetSlotApi(slotId):
    outcome = "None."
    """
    Args:
    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    Return:
    - outcome:
      None.

    변경:
    - 대상 Slot의 content·caption과 소유 chart.

    처리:
        1. explicit slot 하나의 local payload/owned chart reset. selection 변경은 성공 시 공통 reconciliation만 사용한다.
           dispatchProjectCommand('SLOTS_RESET', {'slotIds': [slotId]})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           None를 반환한다.
    """
    return outcome


def swapSlots(sourceSlotId, targetSlotId):
    committed = "논리값."
    """
    Args:
    - sourceSlotId:
      교환할 첫 슬롯의 id.

    - targetSlotId:
      교환할 두 번째 슬롯의 id.

    Return:
    - committed:
      논리값.

    변경:
    - 두 대상 Slot의 content·caption과 chart 소유 관계.

    처리:
        1. 서로 다른 visible slot의 payload 교환. missing/hidden/same-id는 unchanged False, 성공 True. 오류는 전파.
           dispatchProjectCommand('SLOTS_SWAPPED', {'sourceSlotId': sourceSlotId, 'targetSlotId': targetSlotId})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           result["committed"]를 반환한다.
    """
    return committed


def insertEmptyImageIntoSelectedSlot():
    outcome = "이미지 자산 딕셔너리 또는 None."
    slotId = "슬롯 id 정수 또는 None."
    context = "슬롯 선택 문맥 딕셔너리 또는 None."
    result = "ProjectMutationResult 딕셔너리."
    path = "이미지의 canonical 경로 문자열."
    """
    Args:
    - 없음.

    Return:
    - outcome:
      생성된 이미지의 kind/id/path/name 메타데이터. 대상 부재·종류 불일치·미반영이면 None.

    변경:
    - 새 이미지 자산·다음 id·VFS 위치와 대상 슬롯의 이미지 참조 및 소유 chart.

    처리:
        1. interfaceFSM.readState()["selectedSlotId"]를 slotId에 둔다. 식별자 0도 유효하다.
           slot-selection-context 공식 조회에 slotId를 전달한 결과를 context에 둔다.
           visible image 슬롯이 없으면 None을 반환한다.
        2. UTF-8 SVG <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"
           viewBox="0 0 1600 900"></svg>의 바이트와 이름 "빈 이미지.svg", MIME "image/svg+xml"을
           새 imageInput으로 만들고 slotId, operation=images.insertEmpty와 함께 SLOT_IMAGE_IMPORTED에 전달한다.
        3. Backend는 현재 next id와 경로를 해결하고 대상의 image 종류를 다시 검증한다.
           새 자산과 이미지 참조를 같은 candidate에 구성하고 대상 소유 chart를 제거하며 chart 참조를 None으로 둔다.
           기존 CSV·이미지 자산과 슬롯 위치·span·caption·imageSettings는 유지한다.
        4. candidate 전체 검증과 한 번의 반영 뒤 명령 결과를 result에 둔다.
           result["committed"]가 False이면 None을 반환한다.
        5. result["changed"]의 실제 생성 이미지 경로를 path에 둔다. assets.readDeletionTarget 공식 조회에
           path를 전달한 결과의 target을 outcome에 두고 반환한다. 원래 조회·명령 오류를 전파한다.
    """
    return outcome


def prepareDashboardFileDrop(slotId):
    accepted = "논리값."
    """
    Args:
    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    Return:
    - accepted:
      논리값.
      missing이면 False; already selected면 True; 다른 valid target이면 위 selection accepted 여부

    변경:
    - 없음.

    처리:
        1. slots.prepareFileDrop: slot-selection-context query의 visible target이 없으면 False이며 selection/Project는 그대로다.
           valid target이면 dispatchSlotSelection(slotId, pendingContentType=None, direction="model-to-fsm")으로 선택을 보장한다.
           기존 선택이면 toggle하지 않는다. rejected selection은 False이며 selection을 변경하지 않는다.
           이미 selected target이면 transition 없이 True다. 다른 target의 accepted final selection만 True다.
           content type command나 중복 drop-target state를 만들지 않는다. 오류는 전파한다.
           accepted를 반환한다.
    """
    return accepted


def finishDashboardFileDrop():
    outcome = "None."
    """
    Args:
    - 없음.

    Return:
    - outcome:
      None.

    변경:
    - Frontend dashboard interaction controller의 drag 임시 상태와 hover.

    처리:
        1. slots.finishFileDrop: Frontend-owned drag interaction cleanup 뒤 None; selection/lifecycle/Project 유지.
           finishDashboardFileDropInteraction()를 호출한다.
           None를 반환한다.
    """
    return outcome


def readLayoutApiState(previewWidth=None):
    layoutState = "gridRows·gridCols·gridLimits·slotStyle·visibleSlots·previewGeometry·zoom 딕셔너리."
    """
    Args:
    - previewWidth:
      preview 너비(px) 또는 None.

    Return:
    - layoutState:
      gridRows·gridCols·gridLimits·slotStyle·visibleSlots·previewGeometry·zoom 딕셔너리.
      layout 조회 결과에 현재 interfaceState["dashboardZoomIntent"]를 zoom으로 합성한 읽기 전용 결과.

    변경:
    - 없음.

    처리:
        1. current layout["readState"] Backend query에 previewWidth만 전달한다.
           previewWidth의 omitted/invalid 기본값과 bounds는 Backend의 backend.defaults.preview에서만 read copy에 적용한다. Application은 값을 복제하지 않는다.
           Backend의 gridRows/gridCols/gridLimits/slotStyle/visibleSlots/previewGeometry를 보존하고 현재 Frontend 확대 비율을 합성한다.
           visibleSlots의 contentType/chart/imageId와 assetDisplay는 Backend가 같은 project read에서 resolve한 detached 값이다.
           Application이 별도 chart/asset copy를 재조합하거나 canonical assets.readTree에 slot/chart를 끼워 넣지 않는다.
           Application이 interfaceFSM의 확대 비율을 합성하며 previewGeometry를 session/Project에 저장하지 않는다.
           layoutState를 반환한다.
    """
    return layoutState


def readLayoutApiControls():
    controls = "gridRows/gridCols/gridLimits/slotStyle/zoom 딕셔너리."
    """
    Args:
    - 없음.

    Return:
    - controls:
      레이아웃 입력에 필요한 현재 값과 기존 한계.

    변경:
    - 없음.

    처리:
        1. operation=layout.readControls로 dispatchProjectQuery('project-api', 요청)를 호출하고 반환된 gridRows, gridCols, gridLimits, slotStyle을 controls에 둔다.
        2. 같은 동기 처리에서 interfaceFSM.readState()의 dashboardZoomIntent를 controls의 zoom에 둔다.
        3. controls를 반환한다. 조회 오류는 전파한다.
    """
    return controls


def setLayoutApiZoom(value):
    layoutState = "layout.readControls 딕셔너리 또는 False."
    """
    Args:
    - value:
      새 dashboard zoom 비율의 숫자 또는 숫자 문자열.

    Return:
    - layoutState:
      layout["readControls"] 딕셔너리 또는 False.

    변경:
    - Frontend dashboardZoomIntent.

    처리:
        1. 대시보드 확대·축소 입력으로 받은 value를 dispatchInterfaceEvent('SET_DASHBOARD_ZOOM', {'value': value})에 전달한다.
        2. transformWorkspace()를 호출한다. 대시보드를 새로 렌더링하지 않고,
           이미 렌더링된 화면에 확정된 배율의 CSS 확대·축소만 적용한다.
        3. readLayoutApiControls()의 결과를 layoutState에 둔다.
    """
    return layoutState


def commitLayoutApiZoom():
    layoutState = "layout.readControls 딕셔너리 또는 False."
    """
    Args:
    - 없음.

    Return:
    - layoutState:
      layout["readControls"] 딕셔너리 또는 False.

    변경:
    - 없음.

    처리:
        1. 기존 layout zoom completion 알림 한 번 후 fresh read; 두 번째 저장/commit/Project field 없음.
           interfaceFSM.notify('layout', 'DASHBOARD_ZOOM_CHANGED', {})를 호출한다.
           readLayoutApiControls()를 반환한다.
    """
    return layoutState



def resetLayoutApiZoom():
    layoutState = "layout.readControls 딕셔너리 또는 False."
    """
    Args:
    - 없음.

    Return:
    - layoutState:
      layout["readControls"] 딕셔너리 또는 False.

    변경:
    - Frontend dashboardZoomIntent.

    처리:
        1. 대시보드 배율 초기화 버튼에서 이 API를 호출하면 dispatchInterfaceEvent('RESET_DASHBOARD_ZOOM', {})로 배율을 100%로 되돌린다.
        2. transformWorkspace()를 호출해 이미 렌더링된 화면의 CSS 배율을 100%로 되돌린다.
           대시보드를 새로 렌더링하지 않는다.
        3. readLayoutApiControls()의 결과를 layoutState에 둔다.
    """
    return layoutState


def setLayoutApiStyle(values):
    layoutState = "layout.readControls 딕셔너리 또는 False."
    """
    Args:
    - values:
      이번 변경에 명시한 필드와 새 값의 부분 딕셔너리.

    Return:
    - layoutState:
      layout["readControls"] 딕셔너리 또는 False.

    변경:
    - activeProject._state["layout"].slotStyle.

    처리:
        1. current slotStyle에서 candidate를 만든다.
        2. referenceWidth/gap/outerMargin/radius/aspect를 layoutRules 범위로 정규화한다.
        3. candidate whole-project invariant를 확인한다.
        4. LAYOUT_STYLE_CHANGED command가 한 번 commit한다. Application wrapper는 values만 전달한다.
        5. renderer는 commit result 이후 authoritative layout을 다시 읽는다.
           dispatchProjectCommand('LAYOUT_STYLE_CHANGED', values)의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           False를 반환한다.
           readLayoutApiControls()를 반환한다.
    """
    return layoutState


def setLayoutApiGrid(rows, cols):
    layoutState = "layout.readControls 딕셔너리 또는 False."
    """
    Args:
    - rows:
      새 grid 행 수.

    - cols:
      새 grid 열 수.

    Return:
    - layoutState:
      layout["readControls"] 딕셔너리 또는 False.

    변경:
    - buildGridResizeCandidate가 성공한 경우에만 activeProject grid/slot structure를 한 번 commit한다.

    처리:
        1. rows와 cols를 GRID_LAYOUT_CHANGED의 입력으로 dispatchProjectCommand에 전달한다.
           Backend가 후보를 만들고 프로젝트 전체를 검증한 뒤 한 번 반영한다. Application이 성공 결과를 받아 선택을 보정한다.
        2. 명령 결과의 committed가 False이면 False를 반환한다. 명령 오류는 전파한다.
        3. readLayoutApiControls()의 결과를 layoutState에 두고 반환한다.
    """
    return layoutState


def mergeSlots(slotIds):
    layoutState = "layout.readControls 딕셔너리 또는 False."
    """
    Args:
    - slotIds:
      대상 슬롯 id 배열 또는 None.

    Return:
    - layoutState:
      layout["readControls"] 딕셔너리 또는 False.

    변경:
    - 검증된 candidate에서 선택 직사각형의 top-left anchor span과 covered slot visibility/content를 변경한다.

    처리:
        1. current visible slot을 id로 resolve하고 선택 union이 빈칸 없는 하나의 직사각형인지 확인한다.
        2. slotHasNonDefaultLocalState로 선택 영역의 non-default slot-local state를 가진 visible slot이 1개 이하인지 확인한다.
           contentType, imageSettings처럼 reference 없이도 의미가 남는 local property도 같은 판정에 포함한다.
        3. source slot이 있으면 chart/image/contentType/imageSettings/caption을 하나의 slot-local payload로 top-left anchor candidate에 이동한다.
           chart id 자체는 유지하되 owning slot reference는 anchor로 이동한다.
        4. Backend 명령은 covered non-anchor Slot의 content와 caption을 Slot 생성자의 기본값으로 되돌리고 hidden=True로 한다.
        5. anchor rowSpan/colSpan을 rectangle 크기로 설정한다.
        6. 두 개 이상의 selected slot object가 non-default local state를 가지면 implicit merge/concatenation 없이 거부한다.
        7. 위 병합 처리는 dispatchProjectCommand에 slotIds를 전달받은 SLOTS_MERGED가 수행한다. Backend가 프로젝트 후보 전체를 검증하고 한 번 반영한다.
        8. 명령 결과의 committed가 False이면 False를 반환한다. 명령 오류는 전파한다.
        9. readLayoutApiControls()의 결과를 layoutState에 두고 반환한다.
    """
    return layoutState


def splitSlots(slotIds):
    layoutState = "layout.readControls 딕셔너리 또는 False."
    """
    Args:
    - slotIds:
      대상 슬롯 id 배열 또는 None.

    Return:
    - layoutState:
      layout["readControls"] 딕셔너리 또는 False.

    변경:
    - merged anchor를 1x1로 되돌리고 covered cell을 visible empty slot로 복원한다.

    처리:
        1. current merged visible anchor를 resolve한다.
        2. anchor slot object의 chart/image/contentType/imageSettings/caption 등 모든 slot-local properties를 anchor에 유지한다.
        3. covered cell은 visible 1x1 slot로 복원하고 모든 slot-local properties를 defaults로 시작한다.
        4. 위 분할 처리는 dispatchProjectCommand에 slotIds를 전달받은 SLOTS_SPLIT가 수행한다. Backend가 프로젝트 후보 전체를 검증하고 한 번 반영한다.
        5. 명령 결과의 committed가 False이면 False를 반환한다. 명령 오류는 전파한다.
        6. readLayoutApiControls()의 결과를 layoutState에 두고 반환한다.
    """
    return layoutState


def applyImageSettingsFromValues(slotId, values):
    imageEditor = "이미지 편집 딕셔너리 또는 False."
    """
    Args:
    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    - values:
      이번 변경에 명시한 필드와 새 값의 부분 딕셔너리.

    Return:
    - imageEditor:
      이미지 편집 딕셔너리 또는 False.

    변경:
    - 선택 slot의 slot.content["imageSettings"].
    - 현재 slot image renderer projection.

    처리:
        1. 이 procedure는 Application operation이다. image editor query가 none이면 command 없이 False를 반환한다.
           Application boundary는 explicit slotId와 새 values patch만 SLOT_IMAGE_SETTINGS_CHANGED로 전달한다.
           Backend command는 current visible slot/image와 slot.content["imageSettings"]를 resolve하고 current settings에 제공된 field만 덮어쓴 candidate를 만든다.
           fit은 /backend/layout_annotations/imageSettings의 fit 허용값에서 선택하며 invalid/missing이면 current fit을 유지한다.
           manual일 때 유효한 유한 숫자 scale·x·y는 Backend가 backend.defaults.limits.imageSettings의 각 필드 범위로 제한한다.
           x/y의 0은 유효한 좌표이며 false-like 값이라는 이유로 50으로 바꾸지 않는다.
           생략되거나 숫자로 변환되지 않는 field는 current 값을 유지한다. JS truthiness를 정규화 규칙으로 가져오지 않는다.
           projectEFSM은 그 whole-project candidate를 검증 후 한 번 commit한다. read projection을 candidate 원천으로 사용하지 않는다.
           같은 image asset을 참조하는 다른 slot의 imageSettings는 변경하지 않는다.
           renderer/interface notification은 commit result 이후 수행한다.
           imageEditor를 반환한다.
    """
    return imageEditor


def readLabelsApiState():
    labelState = "label 설정과 기준 슬롯 치수 딕셔너리."
    """
    Args:
    - 없음.

    Return:
    - labelState:
      label 설정과 기준 슬롯 치수 딕셔너리.

    변경:
    - 없음.

    처리:
        1. labels.readState의 Application read composition.
           이번 호출의 interfaceFSM.readState()["selectedSlotId"]만 scalar로 공식 labels.readState query에 전달한다.
           Backend는 그때의 layout/slot span으로 reference geometry를 계산한다. none/missing slot은 기본 1x1 reference다.
           선택 identity를 별도 저장하거나 이전 renderer geometry를 재사용하지 않는다.
           read/query 오류는 전파하고 Project/Frontend state는 변경하지 않는다.
           interfaceFSM.readState()["selectedSlotId"]의 값을 slotId에 대입한다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['labels.readState'], 'slotId': slotId})를 반환한다.
    """
    return labelState


def setLabelsApiEnabled(enabled):
    labelState = "labels.readState 딕셔너리 또는 False."
    """
    Args:
    - enabled:
      설정할 논리값.

    Return:
    - labelState:
      labels.readState 딕셔너리 또는 False.

    변경:
    - activeProject._state["annotations"].labels.enabled.

    처리:
        1. LABEL_SETTINGS_CHANGED에 enabled candidate를 전달한다.
           다른 label settings 값은 current authority에서 유지한다.
           dispatchProjectCommand('LABEL_SETTINGS_CHANGED', {'enabled': enabled})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           False를 반환한다.
           readLabelsApiState()를 반환한다.
    """
    return labelState


def setLabelsApiSettings(values):
    labelState = "labels.readState 딕셔너리 또는 False."
    """
    Args:
    - values:
      이번 변경에 명시한 필드와 새 값의 부분 딕셔너리.

    Return:
    - labelState:
      labels.readState 딕셔너리 또는 False.

    변경:
    - activeProject._state["annotations"].labels.settings의 format/order/parentheses/fontFamily/fontSize.

    처리:
        1. current labelSettings에서 candidate를 만들고 허용 enum/수치 규칙을 적용한 뒤
           LABEL_SETTINGS_CHANGED로 한 번 commit한다. x/y position은 values에 명시되지 않으면 유지한다.
           dispatchProjectCommand('LABEL_SETTINGS_CHANGED', {'settings': values})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           False를 반환한다.
           readLabelsApiState()를 반환한다.
    """
    return labelState


def setLabelsApiPosition(x, y):
    labelState = "labels.readState 딕셔너리 또는 False."
    """
    Args:
    - x:
      가로 위치 입력.

    - y:
      세로 위치 입력.

    Return:
    - labelState:
      labels.readState 딕셔너리 또는 False.

    변경:
    - activeProject의 유일한 authoritative label x/y position.

    처리:
        1. x/y를 finite position으로 정규화한다.
           pointer drag 중 호출되더라도 LABEL_POSITION_CHANGED라는 같은 mutation path를 사용한다.
           renderer는 mutation 뒤 authoritative position을 다시 읽는다.
           별도 preview position copy를 만들지 않는다.
           dispatchProjectCommand('LABEL_POSITION_CHANGED', {'x': x, 'y': y})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           False를 반환한다.
           readLabelsApiState()를 반환한다.
    """
    return labelState


def resetLabelsApiPosition():
    labelState = "labels.readState 딕셔너리 또는 False."
    """
    Args:
    - 없음.

    Return:
    - labelState:
      labels.readState 딕셔너리 또는 False.

    변경:
    - activeProject._state["annotations"]["labels"]["settings"]의 x·y.

    처리:
        1. labels.resetPosition: Backend가 settings.json backend.project_object.annotations.labels.settings["x"]/y를 같은 position command에서 적용한다.
           dispatchProjectCommand('LABEL_POSITION_CHANGED', {'reset': True})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           False를 반환한다.
           readLabelsApiState()를 반환한다.
    """
    return labelState


def finishLabelsApiPositionInteraction():
    labelState = "labels.readState 딕셔너리 또는 False."
    """
    Args:
    - 없음.

    Return:
    - labelState:
      labels.readState 딕셔너리 또는 False.

    변경:
    - persistent label position은 변경하지 않는다.
    - 필요한 interaction completion telemetry/focus/history notification만 처리한다.

    처리:
        1. position 저장의 두 번째 commit 단계로 사용하지 않는다.
           Application은 기존 label-position interaction completion notification을 한 번 전달한다.
           성공 반환은 현재 labels.readState의 detached projection이다. read/notification 오류는 caller에 전파한다.
           Project command, rollback, position 변경 또는 별도 position mirror를 만들지 않는다.
           readLabelsApiState()를 반환한다.
    """
    return labelState


def setGlobalCaptionText(text):
    captionState = "해당 caption의 읽기 딕셔너리 또는 False."
    """
    Args:
    - text:
      저장할 텍스트 입력.

    Return:
    - captionState:
      해당 caption의 읽기 딕셔너리 또는 False.

    변경:
    - activeProject._state["annotations"].captions.text.

    처리:
        1. Backend project_efsm.ProjectStateMachine.send의 CAPTION_TEXT_INPUT 처리의 nullish/text 변환과 empty 저장 규칙으로 global caption project property 하나만 변경한다.
           slot caption 값은 유지한다. dispatchProjectCommand의 선택 슬롯 표시 정책을 적용한다.
           global caption의 workspace 표시는 전체 렌더링 버튼에서 갱신한다.
           편집기의 official copied state는 반환한다. 원래 오류를 전파하며 committed text를 유지한다.
           CAPTION_TEXT_INPUT에 explicit global owner를 전달해 projectEFSM으로 commit한다.
           captionState를 반환한다.
    """
    return captionState


def setSlotCaptionText(slotId, text):
    captionState = "해당 caption의 읽기 딕셔너리 또는 False."
    """
    Args:
    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    - text:
      저장할 텍스트 입력.

    Return:
    - captionState:
      해당 caption의 읽기 딕셔너리 또는 False.

    변경:
    - 지정 slot object의 slot.caption.

    처리:
        1. strict integer slotId의 current visible owner를 Backend에서 resolve하고 project_efsm.ProjectStateMachine.send의 CAPTION_TEXT_INPUT 처리로 text를 정규화한다.
           Application은 CAPTION_TEXT_INPUT에 explicit slot owner와 새 text만 전달한다.
           UI의 selected-slot caption editor는 이 command를 호출할 뿐 별도 persistent slotMode를 만들지 않는다.
           dispatchProjectCommand('CAPTION_TEXT_INPUT', {'target': {'kind': 'slot', 'id': slotId}, 'text': text})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           False를 반환한다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['captions.readSlot'], 'slotId': slotId})를 반환한다.
    """
    return captionState


def insertSlotCaptionsIntoGlobalCaption(slotIds=None):
    captionState = "해당 caption의 읽기 딕셔너리 또는 False."
    """
    Args:
    - slotIds:
      대상 슬롯 id 배열 또는 None.

    Return:
    - captionState:
      해당 caption의 읽기 딕셔너리 또는 False.

    변경:
    - project-level global caption text.

    처리:
        1. wrapper는 slotIds만 전달한다. None은 전체, []는 no target이다.
        2. Backend layout_annotations.insertSlotCaptions가 current visible anchor의 전체 label 순서와 정확한 caption 문자열로 계산한다.
        3. 연속 동일/뒤따르는 empty를 label range로 묶고, 시작 empty는 label만 두며 기존 global text의 맨 뒤에 공백 구분으로 append한다.
        4. source slot.caption/ownership/afterText/name/settings는 변경하지 않는다. no target은 unchanged False다.
        5. SLOT_CAPTIONS_INSERTED 내부의 candidate 계산/전체 검증/current-source 재확인·재시도/one commit 이후에만
           공식 global caption copy를 읽어 반환한다. workspace의 global caption은 전체 렌더링 버튼에서 표시한다.
           no target/noncommit은 read/render 없이 False; query/renderer 원래 오류는 전파하며 완료 commit은 rollback하지 않는다.
           captionState를 반환한다.
    """
    return captionState


def setCaptionsApiEnabled(enabled):
    captionState = "해당 caption의 읽기 딕셔너리 또는 False."
    """
    Args:
    - enabled:
      설정할 논리값.

    Return:
    - captionState:
      해당 caption의 읽기 딕셔너리 또는 False.

    변경:
    - activeProject._state["annotations"].captions.enabled.

    처리:
        1. CAPTION_SETTINGS_CHANGED에 enabled candidate만 전달하고 다른 caption properties는 유지한다.
           dispatchProjectCommand('CAPTION_SETTINGS_CHANGED', {'enabled': enabled})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           False를 반환한다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['captions.readGlobal']})를 반환한다.
    """
    return captionState


def setCaptionsApiName(name):
    captionState = "해당 caption의 읽기 딕셔너리 또는 False."
    """
    Args:
    - name:
      이름 문자열.

    Return:
    - captionState:
      해당 caption의 읽기 딕셔너리 또는 False.

    변경:
    - activeProject._state["annotations"].captions.name.

    처리:
        1. CAPTION_SETTINGS_CHANGED의 explicit name field로 commit한다.
           dispatchProjectCommand('CAPTION_SETTINGS_CHANGED', {'name': name})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           False를 반환한다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['captions.readGlobal']})를 반환한다.
    """
    return captionState


def setCaptionsApiNameBold(nameBold):
    captionState = "해당 caption의 읽기 딕셔너리 또는 False."
    """
    Args:
    - nameBold:
      캡션 이름의 굵기 여부인 논리값.

    Return:
    - captionState:
      해당 caption의 읽기 딕셔너리 또는 False.

    변경:
    - activeProject._state["annotations"].captions.nameBold.

    처리:
        1. CAPTION_SETTINGS_CHANGED의 explicit nameBold field로 commit한다.
           dispatchProjectCommand('CAPTION_SETTINGS_CHANGED', {'nameBold': nameBold})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           False를 반환한다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['captions.readGlobal']})를 반환한다.
    """
    return captionState


def setCaptionsApiSettings(values):
    captionState = "해당 caption의 읽기 딕셔너리 또는 False."
    """
    Args:
    - values:
      이번 변경에 명시한 필드와 새 값의 부분 딕셔너리.

    Return:
    - captionState:
      해당 caption의 읽기 딕셔너리 또는 False.

    변경:
    - activeProject._state["annotations"].captions.settings.

    처리:
        1. fontFamily/fontSize/lineHeight candidate를 captionSettings 규칙으로 정규화하고
           CAPTION_SETTINGS_CHANGED로 한 번 commit한다.
           dispatchProjectCommand('CAPTION_SETTINGS_CHANGED', {'settings': values})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           False를 반환한다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['captions.readGlobal']})를 반환한다.
    """
    return captionState


def setAppearanceApiPalette(values):
    palette = "appearance.readPalette 딕셔너리 또는 False."
    result = "ProjectMutationResult 딕셔너리."
    interfaceState = "명령 뒤 참조 보정을 마친 Frontend 상태."
    rendererInput = "같은 표시 작업의 선택 슬롯 또는 구조 조회 결과 또는 None."
    """
    Args:
    - values:
      이번 변경에 명시한 필드와 새 값의 부분 딕셔너리.

    Return:
    - palette:
      appearance.readPalette 딕셔너리 또는 False.

    변경:
    - activeProject._state["appearance"]["uiPalette"].

    처리:
        1. appearance.setPalette: 새 edit만 APPEARANCE_CHANGED에 전달한다.
           Backend project_state.ProjectObject.initialize의 palette 정규화 처리의 전체 palette 정규화/commit 뒤 fresh palette copy를 반환한다.
           missing field를 current palette와 merge하지 않는다. 미commit False, throw/rejection 전파; 성공 read로 위장하지 않는다.
           dispatchProjectCommand('APPEARANCE_CHANGED', {'palette': values})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           result["committed"]가 False이면 False를 반환한다.
           선택 슬롯의 내용 표시는 dispatchProjectCommand가 한 번 수행한다.
           rendererInput은 그 선택 슬롯 또는 구조 조회 결과다. wrapper에서 표시 작업을 중복 실행하지 않는다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['appearance.readPalette']})의 결과를 palette에 둔다.
           palette를 applyUiPalette에 전달해 UI 색상을 적용한다. 다른 슬롯의 그래프 색상은 전체 렌더링 버튼에서 표시한다.
           UI 팔레트 표시 알림은 dispatchProjectCommand가 발행한 APPEARANCE_CHANGED를 사용한다.
    """
    return palette


def resetAppearanceApiPalette():
    palette = "appearance.readPalette 딕셔너리 또는 False."
    """
    Args:
    - 없음.

    Return:
    - palette:
      appearance.readPalette 딕셔너리 또는 False.

    변경:
    - 없음.

    처리:
        1. appearance.resetPalette: 유일한 DEFAULT_UI_PALETTE를 같은 command path로 적용; fresh palette/False 반환.
           setAppearanceApiPalette(dict(DEFAULT_UI_PALETTE))를 반환한다.
    """
    return palette


def setExportSettings(values):
    settings = "print.readSettings 딕셔너리 또는 False."
    """
    Args:
    - values:
      이번 변경에 명시한 필드와 새 값의 부분 딕셔너리.

    Return:
    - settings:
      print.readSettings 딕셔너리 또는 False.
      commit된 normalized persistent export settings.

    변경:
    - activeProject.export만 변경한다.

    처리:
        1. 이 procedure는 Application operation이며 새 edit 값만 EXPORT_SETTINGS_CHANGED command로 전달한다.
        2. Backend command가 current export settings를 resolve해 candidate를 만든다. 생략되거나 숫자로 변환되지 않는 입력은 current 값을 사용하고
           유효한 숫자는 Backend의 backend.defaults.limits.export에서 width/height/DPI 범위를 읽어 제한한다. heightMode/format의 invalid/missing enum도 current 값을 유지한다.
        3. heightMode가 auto면 candidate.height는 none이다. explicit이면 current height 또는 100을 fallback으로 사용한다.
        4. Backend가 whole-project candidate를 검증한 뒤 한 번 commit한다. Application은 별도 project clone/candidate validation을 만들지 않는다.
        5. 성공 후에만 새 Backend read projection을 반환한다. rejected result는 False, command failure는 caller에 전파하며 기존 settings는 유지한다.
    """
    return settings


def exportDashboardTarget(statusSink):
    outcome = "목표 크기 renderer의 반환 결과."
    """
    Args:
    - statusSink:
      진행 메시지를 받는 표시 함수.

    Return:
    - outcome:
      목표 크기 renderer의 반환 결과.

    변경:
    - 목표 크기 raster 다운로드와 진행 표시.

    처리:
        1. 공식 export query의 한 작업용 snapshot을 Frontend raster renderer에 전달한다.
           dispatchProjectQuery('export', {'operation': BACKEND_QUERY_KINDS['export']['print.save']})의 값을 snapshot에 대입한다.
           renderDashboardTarget(snapshot, statusSink)를 반환한다.
    """
    return outcome


def captureDashboardCurrent(statusSink):
    outcome = "현재 화면 renderer의 반환 결과."
    """
    Args:
    - statusSink:
      진행 메시지를 받는 표시 함수.

    Return:
    - outcome:
      현재 화면 renderer의 반환 결과.

    변경:
    - 현재 화면 raster 다운로드와 진행 표시.

    처리:
        1. 현재 화면 one-shot capture; persistent target settings를 변경하지 않는다.
           dispatchProjectQuery('export', {'operation': BACKEND_QUERY_KINDS['export']['print.capture']})의 값을 snapshot에 대입한다.
           renderDashboardCurrent(snapshot, statusSink)를 반환한다.
    """
    return outcome
