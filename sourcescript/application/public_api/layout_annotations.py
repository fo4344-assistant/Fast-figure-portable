"""
Fast Figure Source Script — Application boundary / public-api — layout, annotation and export wrappers

하위 구현 검증 자료: ../../../fast-figure.js, ../../../fast-figure-ui.js, ../../../Fast-figure.html.
Python 표기의 구현 명세이며 application runtime을 실행하는 모듈이 아니다.
"""

from sourcescript.application.adapter import dispatchProjectCommand, dispatchProjectQuery
from sourcescript.frontend.renderer import renderDashboardTarget, renderDashboardCurrent

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
    result = dispatchProjectCommand("LAYOUT_STYLE_CHANGED", values)
    return result


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
    result = dispatchProjectCommand("GRID_LAYOUT_CHANGED", {"rows": rows, "cols": cols})
    return result


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
    result = dispatchProjectCommand("SLOTS_MERGED", {"slotIds": slotIds})
    return result


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
    result = dispatchProjectCommand("SLOTS_SPLIT", {"slotIds": slotIds})
    return result


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


def setLabelsApiEnabled(enabled):
    """
    변경:
    - activeProject.annotations.labels.enabled.

    처리:
    LABEL_SETTINGS_CHANGED에 enabled candidate를 전달한다.
    다른 label settings 값은 current authority에서 유지한다.
    """
    result = dispatchProjectCommand("LABEL_SETTINGS_CHANGED", {"enabled": enabled})
    return result


def setLabelsApiSettings(values):
    """
    변경:
    - activeProject.annotations.labels.settings의 format/order/parentheses/fontFamily/fontSize.

    처리:
    current labelSettings에서 candidate를 만들고 허용 enum/수치 규칙을 적용한 뒤
    LABEL_SETTINGS_CHANGED로 한 번 commit한다. x/y position은 values에 명시되지 않으면 유지한다.
    """
    result = dispatchProjectCommand("LABEL_SETTINGS_CHANGED", {"settings": values})
    return result


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
    result = dispatchProjectCommand("LABEL_POSITION_CHANGED", {"x": x, "y": y})
    return result


def finishLabelsApiPositionInteraction():
    """
    변경:
    - persistent label position은 변경하지 않는다.
    - 필요한 interaction completion telemetry/focus/history notification만 처리한다.

    처리:
    position 저장의 두 번째 commit 단계로 사용하지 않는다.
    """
    return "interaction completion 결과"


def setGlobalCaptionText(text):
    """
    변경:
    - activeProject.annotations.captions.text.

    처리:
    global caption project property 하나만 변경한다.
    slot caption 값은 변경하지 않는다.
    CAPTION_TEXT_INPUT에 explicit global owner를 전달해 projectEFSM으로 commit한다.
    """
    result = dispatchProjectCommand(
        "CAPTION_TEXT_INPUT",
        {"target": {"kind": "global"}, "text": text},
    )
    return result


def setSlotCaptionText(slotId, text):
    """
    변경:
    - 지정 slot object의 slot.caption.

    처리:
    slotId를 current project에서 resolve하고 CAPTION_TEXT_INPUT에 explicit slot owner를 전달한다.
    UI의 selected-slot caption editor는 이 command를 호출할 뿐 별도 persistent slotMode를 만들지 않는다.
    """
    result = dispatchProjectCommand(
        "CAPTION_TEXT_INPUT",
        {"target": {"kind": "slot", "id": slotId}, "text": text},
    )
    return result


def insertSlotCaptionsIntoGlobalCaption(slotIds):
    """
    변경:
    - project-level global caption text.

    처리:
    1. 지정 또는 현재 visible slot object를 layout order로 resolve한다.
    2. non-empty slot.caption을 label/text projection으로 계산한다.
    3. 계산한 text를 사용자 명령에 따라 global caption text에 삽입한다.
    4. source slot.caption 값과 slot ownership은 변경하지 않는다.
    5. wrapper는 slotIds만 전달하고 SLOT_CAPTIONS_INSERTED command가 위 resolve/insertion 계산과 commit을 수행한다.
    """
    result = dispatchProjectCommand("SLOT_CAPTIONS_INSERTED", {"slotIds": slotIds})
    return result


def setCaptionsApiEnabled(enabled):
    """
    변경:
    - activeProject.annotations.captions.enabled.

    처리:
    CAPTION_SETTINGS_CHANGED에 enabled candidate만 전달하고 다른 caption properties는 유지한다.
    """
    return dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", {"enabled": enabled})


def setCaptionsApiName(name):
    """
    변경:
    - activeProject.annotations.captions.name.

    처리:
    CAPTION_SETTINGS_CHANGED의 explicit name field로 commit한다.
    """
    return dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", {"name": name})


def setCaptionsApiNameBold(nameBold):
    """
    변경:
    - activeProject.annotations.captions.nameBold.

    처리:
    CAPTION_SETTINGS_CHANGED의 explicit nameBold field로 commit한다.
    """
    return dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", {"nameBold": nameBold})


def setCaptionsApiSettings(values):
    """
    변경:
    - activeProject.annotations.captions.settings.

    처리:
    fontFamily/fontSize/lineHeight candidate를 captionSettings 규칙으로 정규화하고
    CAPTION_SETTINGS_CHANGED로 한 번 commit한다.
    """
    return dispatchProjectCommand("CAPTION_SETTINGS_CHANGED", {"settings": values})


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
       유효한 숫자는 width/explicit height 100..20000, dpi 36..1200으로 제한한다. heightMode/format의 invalid/missing enum도 current 값을 유지한다.
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
