"""
Fast Figure Source Script — Application boundary / public-api — layout, annotation and export wrappers

하위 구현 검증 자료: ../../../fast-figure.js, ../../../fast-figure-ui.js, ../../../Fast-figure.html.
Python 표기의 구현 명세이며 application runtime을 실행하는 모듈이 아니다.
"""

from sourcescript.application.adapter import dispatchProjectCommand, dispatchProjectQuery, dispatchInterfaceEvent, dispatchSlotSelection
from sourcescript.backend.project_state import DEFAULT_UI_PALETTE
from sourcescript.frontend.interface_fsm import interfaceFSM
from sourcescript.frontend.renderer import renderDashboardTarget, renderDashboardCurrent, readDashboardRenderedWidth, finishDashboardFileDropInteraction


ANNOTATION_APPEARANCE_RESULT_RULE = (
    "이 파일의 captions set/insert, labels set/reset과 appearance set/reset은 committed 확인 뒤 "
    "그 owner의 공식 public read와 같은 detached 값을 반환한다. caption global 변경은 captions.readGlobal, "
    "slot text 변경은 explicit slotId의 captions.readSlot, label 변경은 현재 선택 geometry를 합성한 labels.readState, "
    "palette 변경은 appearance.readPalette다. command 내부 tuple 또는 read projection을 mutation candidate로 사용하지 않는다. "
    "미commit/명시적 취소는 False이며 success read/selection/completion notification을 실행하지 않는다. "
    "Backend validation이 throw하면 False로 삼키지 않고 caller에 전파한다. "
    "이 설정 변경은 UI 선택 대기를 요구하지 않으므로 새 cancel dialog/protocol을 추가하지 않는다. "
    "command 성공 뒤 query/render/notification 오류는 caller에 전파하며 이미 commit한 state를 숨은 rollback하거나 "
    "오래된 read/성공 tuple로 위장하지 않는다. labels.finishPositionInteraction은 command가 아니라 현재 label read를 반환하는 완료 알림이다."
)

PROJECT_SLOT_RESULT_RULE = (
    "project.setName은 성공 뒤 project.readName의 문자열, slots.swap은 committed boolean을 반환한다. "
    "slots.setContentType/reset은 완료 값이 없는 operation이므로 성공/미commit 모두 None이다. "
    "images.insertEmpty는 성공 뒤 실제 생성 asset의 detached copy, 미commit은 None이다. "
    "미commit에는 success query/selection/completion을 실행하지 않는다. Backend/후속 query/render 오류는 caller에 전파한다. "
    "후속 실패는 이미 commit한 Project를 rollback하지 않는다. 내부 adapter tuple을 공개하지 않는다. "
    "명시 slotId를 받는 operation은 current Backend command가 검증하며 selected slot을 대신 사용하지 않는다."
)


def setProjectName(value, trim=False):
    """문자열 변환과 선택적 trim, Backend naming 설정의 길이 제한. name 정규화/commit은 Backend가 소유한다."""
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "PROJECT_NAME_CHANGED", {"value": value, "trim": trim},
    )
    if not result.committed:
        return None
    return dispatchProjectQuery("project-api", {"operation": "project.readName"})


def setSlotContentType(slotId, contentType):
    """slots.setContentType의 explicit slotId/type 입력. pending intent를 별도 session authority로 저장하지 않는다."""
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "SLOT_TYPE_CHANGED", {"slotId": slotId, "contentType": contentType},
    )
    return None


def resetSlotApi(slotId):
    """explicit slot 하나의 local payload/owned chart reset. selection 변경은 성공 시 공통 reconciliation만 사용한다."""
    result, interfaceState, rendererInput = dispatchProjectCommand("SLOTS_RESET", {"slotIds": [slotId]})
    return None


def swapSlots(sourceSlotId, targetSlotId):
    """서로 다른 visible slot의 payload 교환. missing/hidden/same-id는 unchanged False, 성공 True. 오류는 전파."""
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "SLOTS_SWAPPED", {"sourceSlotId": sourceSlotId, "targetSlotId": targetSlotId},
    )
    return result.committed


def insertEmptyImageIntoSelectedSlot():
    """
    selectedSlotId scalar를 한 번 capture한다. slot-selection-context에서 visible image slot이 아니면 None/no command.
    유효하면 아래 새 image 입력과 captured slotId만 SLOT_IMAGE_IMPORTED에 보낸다.
    UTF-8 SVG: <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"></svg>
    name="빈 이미지.svg", MIME="image/svg+xml". Backend가 current next-id/path와 image model을 계산하고
    여전히 visible image slot인지 재검증하여 asset 생성+reference를 한 candidate로 commit한다.
    삽입은 renderable reference 교체다. Backend는 current slot의 owned chart를 같은 candidate에서 제거하고 chart reference를 none으로 한다.
    이전 image asset/CSV asset과 geometry/caption/current slot-local imageSettings는 보존한다.
    asset/model/project snapshot을 command 입력으로 만들지 않는다.
    """
    slotId = interfaceFSM.readState().selectedSlotId
    context = dispatchProjectQuery("slot-selection-context", {"slotId": slotId})
    if "context missing 또는 contentType != image":
        return None
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "SLOT_IMAGE_IMPORTED", {"slotId": slotId, "operation": "images.insertEmpty", "imageInput": "위 SVG bytes/name/MIME"},
    )
    if not result.committed:
        return None
    return dispatchProjectQuery("project-api", {
        "operation": "assets.readDeletionTarget", "path": "result.changed의 실제 생성 image path",
    })["target"]


def prepareDashboardFileDrop(slotId):
    """
    slots.prepareFileDrop: slot-selection-context query의 visible target이 없으면 False이며 selection/Project는 그대로다.
    valid target이면 dispatchSlotSelection(slotId, pendingContentType=None, direction="model-to-fsm")으로 선택을 보장한다.
    기존 선택이면 toggle하지 않는다. rejected selection은 False이며 selection을 변경하지 않는다.
    이미 selected target이면 transition 없이 True다. 다른 target의 accepted final selection만 True다.
    content type command나 중복 drop-target state를 만들지 않는다. 오류는 전파한다.
    """
    context = dispatchProjectQuery("slot-selection-context", {"slotId": slotId})
    return "missing이면 False; already selected면 True; 다른 valid target이면 위 selection accepted 여부"


def finishDashboardFileDrop():
    """slots.finishFileDrop: Frontend-owned drag interaction cleanup 뒤 None; selection/lifecycle/Project 유지."""
    finishDashboardFileDropInteraction()
    return None


def readLayoutApiState(previewWidth=None):
    """
    current layout.readState Backend query에 previewWidth만 전달한다.
    previewWidth의 omitted/invalid 기본값과 bounds는 Backend의 backend.defaults.preview에서만 read copy에 적용한다. Application은 값을 복제하지 않는다.
    반환은 gridRows/gridCols/slotStyle/visibleSlots/previewGeometry와 현재 Frontend zoom/zoomLocked다.
    Application이 interfaceFSM의 zoom/lock scalar를 합성하며 previewGeometry를 session/Project에 저장하지 않는다.
    """
    layout = dispatchProjectQuery("project-api", {"operation": "layout.readState", "renderedWidth": previewWidth})
    session = interfaceFSM.readState()
    return "layout detached fields에 session.dashboardZoomIntent/Locked를 zoom/zoomLocked로 합성한 immutable public state"


def setLayoutApiZoom(value):
    """session event 뒤 fresh layout state; lock 중 no-op도 현재 read 반환, Project command 없음."""
    dispatchInterfaceEvent("SET_DASHBOARD_ZOOM", {"value": value})
    return readLayoutApiState()


def commitLayoutApiZoom():
    """기존 layout zoom completion 알림 한 번 후 fresh read; 두 번째 저장/commit/Project field 없음."""
    interfaceFSM.notify("layout", "DASHBOARD_ZOOM_CHANGED", {})
    return readLayoutApiState()


def setLayoutApiZoomLocked(locked):
    """
    public 인자는 locked 하나다. 처음 lock일 때만 기존 Frontend surface의 readDashboardRenderedWidth로 현재 width를 측정한다.
    DOM access는 Frontend 책임이며 측정 실패/invalid width는 unchanged False다.
    unlock/repeated lock은 재측정하지 않는다. accepted/no-op은 fresh layout state를 반환한다.
    """
    renderedWidth = "처음 lock이면 readDashboardRenderedWidth(), 그 외 none"
    finalState = dispatchInterfaceEvent("SET_DASHBOARD_ZOOM_LOCK", {"locked": locked is True, "renderedWidth": renderedWidth})
    return "invalid first-lock width이면 False, 그 외 readLayoutApiState()"


def resetLayoutApiZoom():
    """단일 RESET event로 unlock/100 percent 복귀 후 fresh read. persistent command 없음."""
    dispatchInterfaceEvent("RESET_DASHBOARD_ZOOM", {})
    return readLayoutApiState()


def setLayoutApiStyle(values):
    """
    변경:
    - activeProject.layout.slotStyle.

    처리:
    1. current slotStyle에서 candidate를 만든다.
    2. referenceWidth/gap/outerMargin/radius/aspect를 layoutRules 범위로 정규화한다.
    3. candidate whole-project invariant를 확인한다.
    4. LAYOUT_STYLE_CHANGED command가 한 번 commit한다. Application wrapper는 values만 전달한다.
    5. renderer는 commit result 이후 authoritative layout을 다시 읽는다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("LAYOUT_STYLE_CHANGED", values)
    if not result.committed:
        return False
    return readLayoutApiState()


def setLayoutApiGrid(rows, cols):
    """
    변경:
    - buildGridResizeCandidate가 성공한 경우에만 activeProject grid/slot structure를 한 번 commit한다.

    처리:
    Application은 rows/cols만 GRID_LAYOUT_CHANGED에 전달한다. Backend command가 buildGridResizeCandidate와 전체 project 검증을 수행한다.
    거부되면 원본 project를 유지하며 interface selection도 reconciliation 대상이 되지 않는다.
    성공 candidate는 그 command가 한 번 commit한다.
    commit 성공 후 selection 유지/해제는 ProjectMutationResult를 받은 Application boundary의 Backend reconciliation query와 Frontend FSM transition이 결정한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("GRID_LAYOUT_CHANGED", {"rows": rows, "cols": cols})
    if not result.committed:
        return False
    return readLayoutApiState()


def mergeSlots(slotIds):
    """
    변경:
    - 검증된 candidate에서 선택 직사각형의 top-left anchor span과 covered slot visibility/content를 변경한다.

    처리:
    1. current visible slot을 id로 resolve하고 선택 union이 빈칸 없는 하나의 직사각형인지 확인한다.
    2. slotHasNonDefaultLocalState로 선택 영역의 non-default slot-local state를 가진 visible slot이 1개 이하인지 확인한다.
       contentType, imageSettings처럼 reference 없이도 의미가 남는 local property도 같은 판정에 포함한다.
    3. source slot이 있으면 chart/image/contentType/imageSettings/caption을 하나의 slot-local payload로 top-left anchor candidate에 이동한다.
       chart id 자체는 유지하되 owning slot reference는 anchor로 이동한다.
    4. covered non-anchor slot은 모든 local properties를 SLOT_LOCAL_DEFAULTS로 되돌리고 hidden=true로 한다.
    5. anchor rowSpan/colSpan을 rectangle 크기로 설정한다.
    6. 두 개 이상의 selected slot object가 non-default local state를 가지면 implicit merge/concatenation 없이 거부한다.
    7. SLOTS_MERGED 내부에서 whole-project candidate를 검증하고 한 번 commit한다. wrapper는 slotIds만 보낸다.
    8. Frontend selection reconciliation과 renderer update는 ProjectMutationResult 이후 Application boundary가 수행한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("SLOTS_MERGED", {"slotIds": slotIds})
    if not result.committed:
        return False
    return readLayoutApiState()


def splitSlots(slotIds):
    """
    변경:
    - merged anchor를 1x1로 되돌리고 covered cell을 visible empty slot로 복원한다.

    처리:
    1. current merged visible anchor를 resolve한다.
    2. anchor slot object의 chart/image/contentType/imageSettings/caption 등 모든 slot-local properties를 anchor에 유지한다.
    3. covered cell은 visible 1x1 slot로 복원하고 모든 slot-local properties를 defaults로 시작한다.
    4. SLOTS_SPLIT 내부에서 candidate 전체를 검증하고 한 번 commit한다. wrapper는 slotIds만 보낸다.
    5. interface selection reconciliation과 renderer update는 project commit 이후 수행한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("SLOTS_SPLIT", {"slotIds": slotIds})
    if not result.committed:
        return False
    return readLayoutApiState()


def applyImageSettingsFromValues(slotId, values):
    """
    변경:
    - 선택 slot의 slot.content.imageSettings.
    - 현재 slot image renderer projection.

    처리:
    이 procedure는 Application operation이다. image editor query가 none이면 command 없이 False를 반환한다.
    Application boundary는 explicit slotId와 새 values patch만 SLOT_IMAGE_SETTINGS_CHANGED로 전달한다.
    Backend command는 current visible slot/image와 slot.content.imageSettings를 resolve하고 current settings에 제공된 field만 덮어쓴 candidate를 만든다.
    fit은 contain/cover/manual 중 유효한 입력만 적용하고 invalid/missing이면 current fit을 유지한다.
    manual일 때 유효한 유한 숫자 scale은 1..1000, x/y는 -100..200으로 제한한다.
    x/y의 0은 유효한 좌표이며 false-like 값이라는 이유로 50으로 바꾸지 않는다.
    생략되거나 숫자로 변환되지 않는 field는 current 값을 유지한다. JS truthiness를 정규화 규칙으로 가져오지 않는다.
    projectEFSM은 그 whole-project candidate를 검증 후 한 번 commit한다. read projection을 candidate 원천으로 사용하지 않는다.
    같은 image asset을 참조하는 다른 slot의 imageSettings는 변경하지 않는다.
    renderer/interface notification은 commit result 이후 수행한다.
    """
    editor = dispatchProjectQuery("project-api", {"operation": "images.readEditor", "slotId": slotId})
    if editor is None:
        return False
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "SLOT_IMAGE_SETTINGS_CHANGED",
        {"slotId": slotId, "settings": values},
    )
    if not result.committed:
        return False
    return dispatchProjectQuery("project-api", {"operation": "images.readEditor", "slotId": slotId})


def readLabelsApiState():
    """
    labels.readState의 Application read composition.
    이번 호출의 interfaceFSM.readState().selectedSlotId만 scalar로 공식 labels.readState query에 전달한다.
    Backend는 그때의 layout/slot span으로 reference geometry를 계산한다. none/missing slot은 기본 1x1 reference다.
    선택 identity를 별도 저장하거나 이전 renderer geometry를 재사용하지 않는다.
    read/query 오류는 전파하고 Project/Frontend state는 변경하지 않는다.
    """
    slotId = interfaceFSM.readState().selectedSlotId
    return dispatchProjectQuery("project-api", {"operation": "labels.readState", "slotId": slotId})


def setLabelsApiEnabled(enabled):
    """
    변경:
    - activeProject.annotations.labels.enabled.

    처리:
    LABEL_SETTINGS_CHANGED에 enabled candidate를 전달한다.
    다른 label settings 값은 current authority에서 유지한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("LABEL_SETTINGS_CHANGED", {"enabled": enabled})
    if not result.committed:
        return False
    return readLabelsApiState()


def setLabelsApiSettings(values):
    """
    변경:
    - activeProject.annotations.labels.settings의 format/order/parentheses/fontFamily/fontSize.

    처리:
    current labelSettings에서 candidate를 만들고 허용 enum/수치 규칙을 적용한 뒤
    LABEL_SETTINGS_CHANGED로 한 번 commit한다. x/y position은 values에 명시되지 않으면 유지한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("LABEL_SETTINGS_CHANGED", {"settings": values})
    if not result.committed:
        return False
    return readLabelsApiState()


def setLabelsApiPosition(x, y):
    """
    변경:
    - activeProject의 유일한 authoritative label x/y position.

    처리:
    x/y를 finite position으로 정규화한다.
    pointer drag 중 호출되더라도 LABEL_POSITION_CHANGED라는 같은 mutation path를 사용한다.
    renderer는 mutation 뒤 authoritative position을 다시 읽는다.
    별도 preview position copy를 만들지 않는다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("LABEL_POSITION_CHANGED", {"x": x, "y": y})
    if not result.committed:
        return False
    return readLabelsApiState()


def resetLabelsApiPosition():
    """labels.resetPosition: Backend가 settings.json backend.project_object.annotations.labels.settings.x/y를 같은 position command에서 적용한다."""
    result, interfaceState, rendererInput = dispatchProjectCommand("LABEL_POSITION_CHANGED", {"reset": True})
    if not result.committed:
        return False
    return readLabelsApiState()


def finishLabelsApiPositionInteraction():
    """
    변경:
    - persistent label position은 변경하지 않는다.
    - 필요한 interaction completion telemetry/focus/history notification만 처리한다.

    처리:
    position 저장의 두 번째 commit 단계로 사용하지 않는다.
    Application은 기존 label-position interaction completion notification을 한 번 전달한다.
    성공 반환은 현재 labels.readState의 detached projection이다. read/notification 오류는 caller에 전파한다.
    Project command, rollback, position 변경 또는 별도 position mirror를 만들지 않는다.
    """
    return readLabelsApiState()


def setGlobalCaptionText(text):
    """
    변경:
    - activeProject.annotations.captions.text.

    처리:
    Backend CAPTION_TEXT_RULE의 nullish/text 변환과 empty 저장 규칙으로 global caption project property 하나만 변경한다.
    slot caption 값은 변경하지 않는다.
    CAPTION_TEXT_INPUT에 explicit global owner를 전달해 projectEFSM으로 commit한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "CAPTION_TEXT_INPUT",
        {"target": {"kind": "global"}, "text": text},
    )
    if not result.committed:
        return False
    return dispatchProjectQuery("project-api", {"operation": "captions.readGlobal"})


def setSlotCaptionText(slotId, text):
    """
    변경:
    - 지정 slot object의 slot.caption.

    처리:
    strict integer slotId의 current visible owner를 Backend에서 resolve하고 CAPTION_TEXT_RULE로 text를 정규화한다.
    Application은 CAPTION_TEXT_INPUT에 explicit slot owner와 새 text만 전달한다.
    UI의 selected-slot caption editor는 이 command를 호출할 뿐 별도 persistent slotMode를 만들지 않는다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "CAPTION_TEXT_INPUT",
        {"target": {"kind": "slot", "id": slotId}, "text": text},
    )
    if not result.committed:
        return False
    return dispatchProjectQuery("project-api", {"operation": "captions.readSlot", "slotId": slotId})


def insertSlotCaptionsIntoGlobalCaption(slotIds=None):
    """
    변경:
    - project-level global caption text.

    처리:
    1. wrapper는 slotIds만 전달한다. None은 전체, []는 no target이다.
    2. Backend layout_annotations.insertSlotCaptions가 current visible anchor의 전체 label 순서와 정확한 caption 문자열로 계산한다.
    3. 연속 동일/뒤따르는 empty를 label range로 묶고, 시작 empty는 label만 두며 기존 global text의 맨 뒤에 공백 구분으로 append한다.
    4. source slot.caption/ownership/afterText/name/settings는 변경하지 않는다. no target은 unchanged False다.
    5. SLOT_CAPTIONS_INSERTED 내부의 candidate 계산/전체 검증/one commit 이후에만 공식 read를 반환한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("SLOT_CAPTIONS_INSERTED", {"slotIds": slotIds})
    if not result.committed:
        return False
    return dispatchProjectQuery("project-api", {"operation": "captions.readGlobal"})


def setCaptionsApiEnabled(enabled):
    """
    변경:
    - activeProject.annotations.captions.enabled.

    처리:
    CAPTION_SETTINGS_CHANGED에 enabled candidate만 전달하고 다른 caption properties는 유지한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", {"enabled": enabled})
    if not result.committed:
        return False
    return dispatchProjectQuery("project-api", {"operation": "captions.readGlobal"})


def setCaptionsApiName(name):
    """
    변경:
    - activeProject.annotations.captions.name.

    처리:
    CAPTION_SETTINGS_CHANGED의 explicit name field로 commit한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", {"name": name})
    if not result.committed:
        return False
    return dispatchProjectQuery("project-api", {"operation": "captions.readGlobal"})


def setCaptionsApiNameBold(nameBold):
    """
    변경:
    - activeProject.annotations.captions.nameBold.

    처리:
    CAPTION_SETTINGS_CHANGED의 explicit nameBold field로 commit한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", {"nameBold": nameBold})
    if not result.committed:
        return False
    return dispatchProjectQuery("project-api", {"operation": "captions.readGlobal"})


def setCaptionsApiSettings(values):
    """
    변경:
    - activeProject.annotations.captions.settings.

    처리:
    fontFamily/fontSize/lineHeight candidate를 captionSettings 규칙으로 정규화하고
    CAPTION_SETTINGS_CHANGED로 한 번 commit한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", {"settings": values})
    if not result.committed:
        return False
    return dispatchProjectQuery("project-api", {"operation": "captions.readGlobal"})


def setAppearanceApiPalette(values):
    """
    appearance.setPalette: 새 edit만 APPEARANCE_CHANGED에 전달한다.
    Backend APPEARANCE_PALETTE_RULE의 전체 palette 정규화/commit 뒤 fresh palette copy를 반환한다.
    missing field를 current palette와 merge하지 않는다. 미commit False, throw/rejection 전파; 성공 read로 위장하지 않는다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("APPEARANCE_CHANGED", {"palette": values})
    if not result.committed:
        return False
    return dispatchProjectQuery("project-api", {"operation": "appearance.readPalette"})


def resetAppearanceApiPalette():
    """appearance.resetPalette: 유일한 DEFAULT_UI_PALETTE를 같은 command path로 적용; fresh palette/False 반환."""
    return setAppearanceApiPalette(dict(DEFAULT_UI_PALETTE))


def setExportSettings(values):
    """
    Return:
    - settings:
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
    result, interfaceState, rendererInput = dispatchProjectCommand("EXPORT_SETTINGS_CHANGED", {"settings": values})
    if not result.committed:
        return False
    return dispatchProjectQuery("project-api", {"operation": "print.readSettings"})


def exportDashboardTarget(statusSink):
    """공식 export query의 한 작업용 snapshot을 Frontend raster renderer에 전달한다."""
    snapshot = dispatchProjectQuery("export", {"operation": "print.save"})
    return renderDashboardTarget(snapshot, statusSink)


def captureDashboardCurrent(statusSink):
    """현재 화면 one-shot capture; persistent target settings를 변경하지 않는다."""
    snapshot = dispatchProjectQuery("export", {"operation": "print.capture"})
    return renderDashboardCurrent(snapshot, statusSink)
