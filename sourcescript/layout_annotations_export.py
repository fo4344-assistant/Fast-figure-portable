"""
Fast Figure Source Script — layout geometry, image settings, annotations and raster export

하위 구현 검증 원천:
- ../fast-figure.js
  dashboardGeometry/gridSlotGeometry,
  grid/merge/split/zoom commands,
  image settings,
  label/caption API,
  createTargetExportSnapshot/exportDashboardTarget/exportDashboard.

참조 Source Script:
- project_state.py
- project_efsm.py
- interface_fsm.py
- application_fsm.py
- graphs.py
"""

from project_state import activeProject, projectObjects
from application_fsm import dispatchProjectCommand, dispatchProjectQuery

LAYOUT_FILE_LOGICAL_RESPONSIBILITIES = {
    "Backend": (
        "persistent layout/imageSettings/label/caption/export-settings calculation, candidate, validation, project snapshot semantics"
    ),
    "Application boundary": (
        "public layout/image/annotation/export-setting mutation/query wrappers와 explicit Frontend reference input 조정"
    ),
    "Frontend": "DOM/canvas/raster presentation과 one-shot current-screen capture projection",
}

LAYOUT_BOUNDARY_RULE = (
    "selectedSlotId 같은 Frontend runtime reference를 이 파일의 Backend calculation에서 직접 import하지 않는다. "
    "selected target이 필요한 public operation은 Application boundary에서 explicit slotId/reference를 받아 Backend current authority에서 재검증한다. "
    "dispatchProjectCommand를 호출하는 wrapper와 Frontend raster renderer가 Backend candidate/read helper와 같은 물리 파일에 있어도 logical owner를 혼합하지 않는다. "
    "아래 mutation procedure의 current-state resolve/merge/normalization/candidate/validation 단계는 해당 Project EFSM command 내부 Backend 계산이다. "
    "Application wrapper는 아래 dispatch에 명시된 identity/new edit 값만 보내며 candidate를 먼저 계산한 뒤 전달하지 않는다."
)

layoutRules = {
    "gridRows": "1..8 integer",
    "gridCols": "1..8 integer",
    "referenceWidth": "100..20000",
    "gap": "0..2000",
    "outerMargin": "0..5000",
    "radius": "0..2000",
    "aspect": "0.1..10",
    "zoom": "runtime dashboard zoom intent; 현재 UI/API 범위 50..200 percent",
}

imageSettings = {
    "owner": "slot.content.imageSettings; image asset의 속성이 아니다.",
    "fit": "contain, cover, manual 중 하나",
    "scale": "manual fit에서 현재 허용 범위 1..1000 percent",
    "x": "manual image center x; 현재 허용 범위 -100..200 percent",
    "y": "manual image center y; 현재 허용 범위 -100..200 percent",
}

labelSettings = {
    "format": "lower/upper alpha, decimal, lower/upper roman",
    "parentheses": "identifier에 괄호를 표시하는지 여부",
    "x": "slot reference 좌표계의 label x position",
    "y": "slot reference 좌표계의 label y position",
    "order": "row-major 또는 column-major",
    "fontFamily": "label font family",
    "fontSize": "현재 최소 6; 구현상 별도 최대는 두지 않음",
}

captionSettings = {
    "fontFamily": "caption font family",
    "fontSize": "현재 6..96",
    "lineHeight": "현재 0.8..4",
}

EXPORT_LIMITS = {
    "logicalWidth": "현재 100..20000 px",
    "logicalHeight": "빈 값이면 aspect/caption에서 자동 계산, 지정 시 현재 100..20000 px",
    "dpi": "현재 36..1200",
    "format": "png 또는 jpeg",
    "rasterDimension": "현재 한 변 최대 16384 px",
    "rasterArea": "현재 최대 64,000,000 pixels",
}


SLOT_OPERATION_CAPTION_RULES = {
    "swap": (
        "source/target slot object의 local properties를 함께 교환한다. "
        "따라서 caption과 imageSettings는 chart/image/contentType과 함께 상대 GUI position으로 이동한다."
    ),
    "merge": (
        "선택 영역에서 non-default slot-local state를 가진 slot object는 최대 하나여야 한다. "
        "그 slot의 renderable content와 caption을 함께 top-left anchor에 귀속시키고 covered slot은 local defaults로 비운다."
    ),
    "split": (
        "merged anchor slot object의 local properties를 anchor에 그대로 유지한다. "
        "다시 드러나는 covered cells는 empty renderable content와 empty caption을 가진 default slot state로 복원한다."
    ),
    "reset": (
        "slot reset은 해당 slot object의 local properties를 defaults로 되돌린다. "
        "따라서 chart/image reference와 explicit slot caption을 함께 제거한다."
    ),
    "ffsx": (
        "FFSX slot package는 slot-local caption을 chart와 함께 포함하고 import target slot object의 local caption으로 적용한다."
    ),
}

CAPTION_OPERATION_RULE = (
    "slot caption은 global project caption과 분리된 slot-local property다. "
    "slot object를 layout position 사이에서 이동·교환할 때 caption도 같은 object의 다른 local properties와 함께 이동한다. "
    "slot caption을 UI에 노출하는 editor mode는 runtime/UI state일 뿐 project property가 아니다."
)

SLOT_CAPTION_UI_RULE = (
    "slot caption 추가/편집 UI는 selected slot의 slot.caption을 읽고 쓸 수 있게 노출하는 기능이다. "
    "slot caption을 global caption에 '추가'하는 command는 현재 slot captions를 text로 계산해 project-level global caption text에 명시적으로 삽입한다. "
    "이 UI 동작 때문에 slot caption을 project-level collection이나 persistent slotMode로 복제하지 않는다."
)

GRID_RESIZE_RULE = (
    "grid resize는 content reflow command가 아니다. 확대는 기존 좌표/span과 모든 slot-local properties를 보존하며 "
    "새 cell에는 SLOT_LOCAL_DEFAULTS를 적용한다. 축소는 제거 영역과 교차하는 slot이 "
    "slotHasNonDefaultLocalState=true이거나 merged span을 가지면 거부한다. "
    "허용되는 축소는 local state가 default인 empty 1x1 cell만 버린다."
)

LABEL_POSITION_RULE = (
    "label x/y는 하나의 persistent authoritative state다. pointer drag 중 유효한 position edit도 같은 mutation path로 연속 갱신한다. "
    "별도 preview draft/commit copy를 만들지 않는다."
)

EXPORT_SETTINGS_RULE = (
    "target width, height mode/height, DPI, raster format은 persistent project export settings다. "
    "계산된 target geometry, status callback, DOM bounds, generated blob은 persistent state가 아니다."
)


def dashboardGeometry(width, heightOverride):
    """
    Return:
    - geometry:
      referenceWidth, width, height, scale, aspect, outerMargin, gap, radius.

    변경:
    - 없음.

    확정 계산:
    scale = width / referenceWidth
    naturalHeight = width / configuredAspect
    height = 유효한 heightOverride가 있으면 override, 아니면 naturalHeight
    outerMargin = min(configuredOuterMargin * scale, min(width, height) * 0.49)
    gap = configuredGap * scale
    radius = configuredRadius * scale
    """
    geometry = "dashboard reference geometry"
    return geometry


def gridSlotGeometry(layout, geometry, slot):
    """
    Return:
    - slotGeometry:
      colWidth, rowHeight와 target slot의 width/height.

    변경:
    - 없음.

    확정 계산:
    colWidth = (width - 2*outerMargin - gap*(gridCols-1)) / gridCols
    rowHeight = (height - 2*outerMargin - gap*(gridRows-1)) / gridRows
    merged slot width/height는 span 내부 gap까지 포함한다.
    """
    slotGeometry = "layout grid에서 계산한 slot geometry"
    return slotGeometry


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


def buildGridResizeCandidate(rows, cols):
    """
    Return:
    - candidate:
      requested grid size를 반영한 candidate layout/slot state.
    - rejected:
      안전한 resize가 아니면 거부 이유.

    변경:
    - authoritative project를 변경하지 않는다.

    처리:
    1. rows/cols가 1..8 정수인지 검증한다.
    2. 확대면 기존 모든 grid cell/slot id/geometry와 모든 slot-local properties를 같은 좌표에 보존하고
       새 좌표에만 SLOT_LOCAL_DEFAULTS를 가진 empty 1x1 slot을 추가한다.
    3. 축소면 삭제될 row/column과 교차하는 slot을 검사한다.
       - slotHasNonDefaultLocalState(slot)이 참이면 거부한다.
       - rowSpan/colSpan이 새 boundary를 넘거나 제거되는 merged cell이 있으면 거부한다.
    4. 위 조건을 통과한 경우 local state가 default인 empty 1x1 slot만 candidate에서 제거한다.
    5. 남은 slot geometry와 chart ownership을 whole-project candidate에서 다시 검증한다.
    6. content를 다른 좌표로 packing/reflow하지 않는다.
    """
    candidate = "안전한 grid resize candidate 또는 rejected result"
    return candidate


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


def readImageEditorApi(slotId):
    """
    Return:
    - imageEditor:
      explicit slotId가 current Backend authority에서 참조하는 image name/display URL과 그 slot의 imageSettings read projection.

    변경:
    - authoritative slot-local imageSettings를 변경하지 않는다.
    """
    imageEditor = "선택 image의 read-only editor projection 또는 없음"
    return imageEditor


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


def readLabelsApiState(slotId):
    """
    Return:
    - labelState:
      persistent label settings와 현재 선택 slot 기준 reference width/height.

    변경:
    - 없음.

    처리:
    reference geometry는 current Backend layout과 explicit slotId로 resolve한 slot span에서 계산한다.
    """
    labelState = "label editor read projection"
    return labelState


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


def readGlobalCaptionState():
    """
    Return:
    - captionState:
      project-level global caption text/name/settings read projection.

    변경:
    - 없음.

    처리:
    activeProject.annotations.captions만 읽는다.
    selected slot이나 UI editor target mode를 global caption의 persistent state와 혼합하지 않는다.
    """
    captionState = "global caption read projection"
    return captionState


def readSlotCaptionState(slotId):
    """
    Return:
    - captionState:
      지정 slot object의 id/position/caption text read projection.

    변경:
    - 없음.

    처리:
    slotId를 current project에서 resolve하고 그 slot.caption을 읽는다.
    caption이 empty여도 UI는 placeholder를 별도 projection으로 표시할 수 있다.
    """
    captionState = "slot-local caption read projection"
    return captionState


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


def readExportSettings():
    """
    Return:
    - settings:
      activeProject의 persistent width/heightMode/height/dpi/format read projection.

    변경:
    - 없음.
    """
    settings = "현재 project export settings"
    return settings


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


def createTargetExportSnapshot():
    """
    Return:
    - snapshot:
      하나의 export 작업 동안 사용할 layout/label/caption/image/chart/slot/export-settings copy와
      renderer에 필요한 read-only color/style projection.

    변경:
    - authoritative project state를 변경하지 않는다.

    처리:
    projectObjects.snapshot으로 영속 입력을 한 시점에 복사한다.
    export target geometry는 snapshot.export에서 계산한다.
    renderer style projection은 export 작업 범위를 벗어나 일반 authority로 재사용하지 않는다.
    DOM 현재 크기는 target figure geometry의 Source of Truth로 사용하지 않는다.
    """
    snapshot = "단일 export 작업용 immutable input snapshot"
    return snapshot


def exportDashboardTarget(statusSink):
    """
    Return:
    - result:
      saved 또는 rejected outcome과 관련 정보.

    변경:
    - project/domain state를 변경하지 않는다.
    - output file download와 status projection만 발생한다.

    처리:
    1. export snapshot을 만든다.
    2. snapshot의 persistent export settings에서 width/height mode/dpi/format을 읽는다.
    3. auto height면 logical dashboard geometry와 caption layout에서 height를 계산한다.
    4. explicit height면 persistent height를 사용한다.
    5. raster dimension/area limit을 넘으면 project를 변경하지 않고 rejected를 반환한다.
    6. grid geometry가 유효한지 확인한다.
    7. 각 visible slot의 chart 또는 image를 target geometry로 다시 render한다.
    8. label/caption을 같은 logical reference geometry에서 변환해 그린다.
    9. PNG/JPEG blob에 DPI metadata를 적용하고 다운로드한다.
    """
    result = "persistent settings를 사용한 raster export outcome"
    return result


def captureDashboardCurrent(statusSink):
    """
    Return:
    - result:
      현재 화면 영역을 캡처한 one-shot raster outcome.

    변경:
    - persistent export settings를 변경하지 않는다.

    처리:
    capture는 project의 target width/height를 바꾸는 export preset이 아니다.
    현재 rendered viewport geometry를 one-shot source size로 사용할 수 있으며
    persistent dpi/format은 output encoding default로 읽을 수 있다.
    """
    result = "current-screen capture outcome"
    return result
