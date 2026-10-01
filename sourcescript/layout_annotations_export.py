"""
Fast Figure Source Script — layout geometry, image settings, annotations and raster export

현재 구현 원천:
- ../fast-figure.js
  dashboardGeometry/gridSlotGeometry,
  grid/merge/split/zoom commands,
  image settings,
  label/caption API,
  createTargetExportSnapshot/exportDashboardTarget/exportDashboard.

참조 Source Script:
- project_state.py
- application_fsm.py
- graphs.py
"""

from project_state import activeProject, projectObjects, selectedSlotId
from application_fsm import appFSM

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


def dashboardGeometry(width, heightOverride=None):
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


def gridSlotGeometry(layout, geometry, slot=None):
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


def setLayoutApiGrid(rows, cols):
    """
    변경:
    - GRID_LAYOUT_CHANGED event를 통해 activeProject grid/slot structure.

    처리:
    rows/cols가 1..8 정수인지 확인한다.
    기존 content가 새 grid 좌표 안에 모두 들어가면 좌표/span을 보존한다.
    그렇지 않으면 visible slot 순서 기준으로 content를 새 grid에 재배치하고 span을 1로 만든다.
    grid 변경 후 selectedSlotId는 해제된다.
    """
    return "grid 변경 후 layout read state"


def mergeSlots(slotIds):
    """
    변경:
    - 선택한 연속 직사각형 영역의 대표 slot span과 covered slot.hidden.

    처리:
    현재 visible slot과 grid coordinate에서 merge 가능한 완전한 사각형인지 검증한다.
    content를 잃지 않는 기존 merge 규칙을 적용하고 renderer를 갱신한다.
    """
    return "merge 후 선택 가능한 slot id 목록"


def splitSlots(slotIds):
    """
    변경:
    - merged slot을 1x1 slot 구조로 되돌리고 covered slot을 다시 visible하게 한다.

    처리:
    현재 project slot 구조를 기준으로 split 대상과 content 보존 규칙을 적용한다.
    """
    return "split 후 선택 가능한 slot id 목록"


def readImageEditorApi():
    """
    Return:
    - imageEditor:
      선택 slot이 참조하는 image name/display URL과 settings의 read projection.

    변경:
    - authoritative image settings를 변경하지 않는다.
    """
    imageEditor = "선택 image의 read-only editor projection 또는 없음"
    return imageEditor


def applyImageSettingsFromValues(values):
    """
    변경:
    - 선택 slot의 referenced image.settings.
    - 현재 slot image renderer projection.

    처리:
    fit enum과 manual scale/x/y 범위를 정규화한다.
    project image settings를 한 경로에서 변경한 뒤 IMAGE_SETTINGS_CHANGED를 notify한다.
    """
    return "설정 적용 성공 여부"


def readLabelsApiState():
    """
    Return:
    - labelState:
      persistent label settings와 현재 선택 slot 기준 reference width/height.

    변경:
    - 없음.

    처리:
    reference geometry는 activeProject layout과 선택 slot span에서 계산한다.
    """
    labelState = "label editor read projection"
    return labelState


def previewLabelsApiPosition(x, y):
    """
    현재 구현 의미:
    - activeProject.labelSettings.x/y를 즉시 변경한다.
    - dashboard를 즉시 rerender한다.
    - commit 전에는 appFSM notify만 생략한다.

    미확정:
    이 동작을 authoritative continuous edit로 정의할지,
    preview용 edit copy를 두고 commit 시에만 authoritative state를 변경할지는
    Source Script 다음 검토에서 결정해야 한다.

    변경:
    - 현재 구현 기준으로 authoritative label position.
    """
    return "현재 구현의 label position read state"


def commitLabelsApiPosition():
    """
    현재 구현 의미:
    label position 값 자체는 preview 단계에서 이미 activeProject에 들어가 있다.
    이 함수는 최종 위치를 debug 기록하고 LABEL_POSITION_DRAGGED notify를 발생시킨다.
    """
    return "commit notification 후 label state"


def readCaptionsApiState():
    """
    Return:
    - captionState:
      global/slot mode, 현재 target, text/name/settings read projection.

    변경:
    - 없음.

    처리:
    slotMode가 참이면 selected slot의 slot.caption을 text source로 사용한다.
    아니면 global caption state를 사용한다.
    """
    captionState = "caption editor read projection"
    return captionState


def setCaptionsApiText(text):
    """
    변경:
    - CAPTION_TEXT_INPUT event를 통해 현재 caption target text.

    처리:
    slotMode와 selectedSlotId를 current state에서 resolve해
    global caption 또는 selected slot caption 중 하나만 변경한다.
    """
    return "변경 후 caption state"


def createTargetExportSnapshot():
    """
    Return:
    - snapshot:
      하나의 export 작업 동안 사용할 layout/label/caption/image/chart/slot copy와
      renderer에서 읽은 현재 color/style projection.

    변경:
    - authoritative project state를 변경하지 않는다.

    처리:
    projectObjects.snapshot으로 영속 입력을 한 시점에 복사한다.
    DOM computed style은 export renderer에 필요한 색상 projection만 읽는다.
    snapshot은 export 작업 범위를 벗어나 일반 read authority로 재사용하지 않는다.
    """
    snapshot = "단일 export 작업용 immutable input snapshot"
    return snapshot


def exportDashboardTarget(options):
    """
    Return:
    - result:
      saved 또는 rejected outcome과 관련 정보.

    변경:
    - project/domain state를 변경하지 않는다.
    - output file download와 status projection만 발생한다.

    처리:
    1. export snapshot을 만든다.
    2. requested logical width/height, dpi, format을 검증한다.
    3. 자동 height면 dashboard aspect와 caption layout에서 계산한다.
    4. raster dimension/area limit을 넘으면 project를 변경하지 않고 rejected를 반환한다.
    5. grid geometry가 유효한지 확인한다.
    6. 각 visible slot의 chart 또는 image를 target geometry로 다시 그린다.
    7. label/caption을 같은 reference geometry로 그린다.
    8. PNG/JPEG blob에 DPI metadata를 적용하고 다운로드한다.
    """
    result = "raster export outcome"
    return result
