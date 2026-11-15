"""
Fast Figure Source Script — Backend / layout-annotation-domain

하위 구현 검증 자료: ../../fast-figure.js, ../../fast-figure-ui.js, ../../Fast-figure.html.
Python 문법으로 작성한 구현 명세다.
"""

from sourcescript.backend.project_state import activeProject, projectObjects, slotHasNonDefaultLocalState, Slot, resolveVisibleSlot






layoutRules = "config reference: backend.defaults.limits.layout"
# zoom의 현재 값은 Frontend 세션이 소유한다.


imageSettings = {
    "owner": "Slot.content의 imageSettings 슬롯별 표시 설정.",
    "fit": ("contain", "cover", "manual"),
    "scale": "manual fit percent; backend.defaults.limits.imageSettings.scale",
    "x": "manual image center x; backend.defaults.limits.imageSettings.x",
    "y": "manual image center y; backend.defaults.limits.imageSettings.y",
}


labelSettings = {
    "format": ("lower-alpha", "upper-alpha", "decimal", "lower-roman", "upper-roman"),
    "parentheses": "identifier에 괄호를 표시하는지 여부",
    "x": "slot reference 좌표계의 label x position",
    "y": "slot reference 좌표계의 label y position",
    "order": "row-major 또는 column-major",
    "fontFamily": "label font family",
    "fontSize": "backend.defaults.limits.labels.fontSizeMin 이상의 글꼴 크기",
}


captionSettings = {
    "fontFamily": "caption font family",
    "fontSize": "backend.defaults.limits.captions.fontSize",
    "lineHeight": "backend.defaults.limits.captions.lineHeight",
}


EXPORT_LIMITS = "config reference: backend.defaults.limits.export"
# format png/jpeg와 auto/explicit의 의미·높이 계산은 기존 export 알고리즘이며 숫자 한계만 config에서 읽는다.

















def formatSlotLabel(ordinal, settings):
    n = "양의 정수."
    letterIndex = "영문자 순번 정수."
    identifier = "번호 문자열."
    label = {
        "identifier": "괄호 없는 번호 문자열.",
        "displayLabel": "표시 번호 문자열.",
    }
    """
    Args:
    - ordinal:
      0 기반 번호인 음이 아닌 정수.

    - settings:
      라벨 설정 딕셔너리.
        원형: /backend/layout_annotations/labelSettings

    Return:
    - label:
      identifier와 displayLabel을 가진 딕셔너리.

    변경:
    - 없음.

    처리:
        1. n에 ordinal+1을, identifier에 빈 문자열을 둔다.
        2. settings["format"]이 decimal이면 n의 십진 문자열을 identifier에 둔다.
        3. settings["format"]이 lower-alpha 또는 upper-alpha이면 n이 양수인 동안
           letterIndex=(n-1)을 26으로 나눈 나머지로 두고
           그 순번의 소문자 영문자를 identifier의 앞에 붙인다.
           n에는 (n-1)을 26으로 나눈 정수 몫을 둔다.
           upper-alpha이면 identifier를 대문자로 바꾼다.
        4. settings["format"]이 lower-roman 또는 upper-roman이면 1000→M, 900→CM, 500→D, 400→CD, 100→C, 90→XC,
           50→L, 40→XL, 10→X, 9→IX, 5→V, 4→IV, 1→I 순서로 처리한다.
           각 값이 n 이하인 동안 해당 기호를 identifier 끝에 붙이고 n에서 그 값을 뺀다.
           lower-roman이면 identifier를 소문자로 바꾼다. 천 단위는 M을 반복한다.
        5. label의 identifier와 displayLabel을 identifier로 둔다.
           settings["parentheses"]가 True이면 displayLabel의 양끝에 괄호를 붙인다.
        6. label을 반환한다.
    """
    return label


def orderedSlotLabels(project):
    labels = "slot id·순번·label 문자열의 배열."
    label = "번호 문자열 딕셔너리. 원형: /backend/layout_annotations/formatSlotLabel의 반환값"
    """
    Args:
    - project:
      이번 작업의 ProjectObject 또는 프로젝트 상태 딕셔너리.
      원형: /backend/project_state/ProjectObject 또는 ProjectObject._state

    Return:
    - labels:
      slot id·순번·label 문자열의 배열.
      ordered labels derived from this project

    변경:
    - 없음.

    처리:
        project가 ProjectObject이면 project._state를, 딕셔너리이면 project를 이 호출의 상태로 사용한다.
        1. project의 상태에서 hidden=False인 anchor Slot을 선택한다. 빈 슬롯도 포함한다.
        2. annotations["labels"]["settings"]["order"]가 row-major이면 (row,col), column-major이면 (col,row)로 정렬한다.
        3. 정렬 순서의 0 기반 ordinal과 같은 상태의 annotations["labels"]["settings"]를
           formatSlotLabel에 전달하여 label에 둔다.
        4. 각 Slot id·ordinal과 label의 identifier·displayLabel을 labels에 넣는다.
        5. labels를 읽기 전용 배열로 반환한다. enabled는 그리기 여부에 사용한다.
    """
    return labels


def insertSlotCaptions(project, slotIds=None):
    candidateText = "global caption 본문 문자열 또는 변경 없음의 결과."
    """
    Args:
    - project:
      이번 작업의 ProjectObject 또는 프로젝트 상태 딕셔너리.
      원형: /backend/project_state/ProjectObject 또는 ProjectObject._state

    - slotIds:
      대상 슬롯 id 배열 또는 None.

    Return:
    - candidateText:
      global caption 본문 문자열 또는 변경 없음의 결과.
      candidate appended global caption text or unchanged

    변경:
    - 없음.

    처리:
        project가 ProjectObject이면 project._state를, 딕셔너리이면 project를 이 호출의 상태로 사용한다.
        1. 같은 project의 현재 global caption text와 orderedSlotLabels(project)를 읽는다.
           slotIds=None이면 전체 anchor, 빈 배열이면 대상 없음이다. 명시 id는 중복을 제거하고 모든 id가 visible anchor인지 검사한다.
           잘못된 id는 거부한다. 대상만 필터링하며 원래 ordinal은 유지한다.
        2. label 순서대로 Slot.caption을 읽는다. None은 빈 문자열로 해석한다. 나머지 문자열의 공백·줄바꿈·대소문자를 보존한다.
        3. 첫 대상의 ordinal·identifier·caption으로 그룹을 시작한다. 다음 ordinal이 바로 연속하고 caption이 비어 있거나
           그룹의 caption과 정확히 같으면 그룹에 포함한다. 빈 caption으로 그룹의 본문을 덮어쓰지 않는다.
           ordinal이 끊기거나 다른 비어 있지 않은 본문이면 현재 그룹을 끝내고 새 그룹을 시작한다.
        4. 단일 그룹 label은 (identifier), 복수 그룹 label은 (firstIdentifier-lastIdentifier)다.
           그룹 본문이 있으면 label 뒤에 U+0020 하나와 원문 본문을 붙인다. 본문이 비어 있으면 label만 사용한다.
           그룹 사이도 U+0020 하나로 연결한다.
        5. 대상 그룹이 없으면 현재 본문과 변경 없음 결과를 반환한다. 그룹이 있으면 현재 global text 맨 뒤에 붙인다.
           현재 본문이 비면 그룹 문자열만 쓰고, 끝이 U+0020이면 그 공백을 재사용하며, 그 외에는 공백 하나를 삽입한다.
        6. candidateText에 그 문자열을 두고 반환한다. SLOT_CAPTIONS_INSERTED가 같은 candidate에 적용·전체 검증·한 번 commit한다.
           afterText·name·settings·원본 Slot.caption은 유지한다.
    """
    return candidateText


dashboardGeometryResult = {
    "referenceWidth": "기준 너비. 단위: px.",
    "width": "대시보드 전체 너비. 단위: px.",
    "height": "대시보드 전체 높이. 단위: px.",
    "scale": "기준 너비에 대한 배율.",
    "aspect": "대시보드의 너비 대 높이 비율.",
    "outerMargin": "상하좌우 각각의 바깥 여백. 단위: px.",
    "gap": "인접한 셀 사이의 간격. 단위: px.",
    "radius": "모서리 반경. 단위: px.",
}


def dashboardGeometry(width, heightOverride):
    layout = "레이아웃 읽기 딕셔너리."
    style = "layout의 slotStyle 딕셔너리."
    naturalHeight = "대시보드 종횡비에 대응하는 높이. 단위: px."
    geometry = "대시보드 치수 딕셔너리. 원형: /backend/layout_annotations/dashboardGeometryResult"
    """
    Args:
    - width:
      계산에 사용할 대시보드 전체 너비. 단위: px.

    - heightOverride:
      명시한 양의 유한 높이(px) 또는 None.

    Return:
    - geometry:
      대시보드 치수 딕셔너리. 원형: /backend/layout_annotations/dashboardGeometryResult
      현재 layout의 스타일을 지정 너비와 높이에 적용한 치수 딕셔너리.

    변경:
    - 없음.

    처리:
        1. activeProject._state["layout"]을 layout에, layout["slotStyle"]을 style에 둔다.
           이 동기 계산과 반환 사이에는 프로젝트 변경 명령을 호출하지 않는다.
        2. geometry["referenceWidth"]에 style["referenceWidth"],
           geometry["width"]에 width, geometry["aspect"]에 style["aspect"]를 대입한다.
        3. geometry["scale"]에 width ÷ style["referenceWidth"]를 대입한다.
           naturalHeight에 width ÷ style["aspect"]를 대입한다.
        4. heightOverride가 양의 유한 수이면 geometry["height"]에 그 값을,
           그 외에는 naturalHeight를 대입한다.
        5. style["outerMargin"] × geometry["scale"]과
           min(width, geometry["height"]) × 0.49 중 작은 값을
           geometry["outerMargin"]에 대입한다.
        6. geometry["gap"]에 style["gap"] × geometry["scale"],
           geometry["radius"]에 style["radius"] × geometry["scale"]을 대입한다.
        7. geometry를 반환한다. 기준 폭과 스타일 값의 유효성은 현재 프로젝트 검증이 보장한다.
    """
    return geometry


def gridSlotGeometry(layout, geometry, slot):
    colWidth = "기본 셀 한 열의 너비. 단위: px."
    rowHeight = "기본 셀 한 행의 높이. 단위: px."
    colSpan = "대상 슬롯이 차지하는 열 수. 양의 정수."
    rowSpan = "대상 슬롯이 차지하는 행 수. 양의 정수."
    slotWidth = "대상 슬롯의 너비. 내부 열 간격을 포함한다. 단위: px."
    slotHeight = "대상 슬롯의 높이. 내부 행 간격을 포함한다. 단위: px."
    slotGeometry = {
        "colWidth": "기본 셀 너비. 단위: px.",
        "rowHeight": "기본 셀 높이. 단위: px.",
        "width": "대상 슬롯 너비. 단위: px.",
        "height": "대상 슬롯 높이. 단위: px.",
    }
    """
    Args:
    - layout:
      딕셔너리.
        원형: /backend/project_state/ProjectObject._state.layout
        Source of Truth: /backend/project_state/activeProject._state.layout

    - geometry:
      딕셔너리.
        원형: /backend/layout_annotations/dashboardGeometryResult

    - slot:
      슬롯 오브젝트 또는 None.
      슬롯 오브젝트:
        원형: /backend/project_state/Slot
        Source of Truth: /backend/project_state/activeProject._state["slots"]의 원소.

    Return:
    - slotGeometry:
      기본 셀과 대상 슬롯의 너비·높이(px)를 담은 딕셔너리.

    변경:
    - 없음.

    처리:
        1. 전체 너비에서 좌우 여백과 열 사이 간격을 빼고,
           전체 열 수로 나누어 colWidth에 대입한다.

           colWidth =
               (geometry["width"]
                - 2 × geometry["outerMargin"]
                - geometry["gap"] × (layout["gridCols"] - 1))
               ÷ layout["gridCols"]

        2. 전체 높이에서 상하 여백과 행 사이 간격을 빼고,
           전체 행 수로 나누어 rowHeight에 대입한다.

           rowHeight =
               (geometry["height"]
                - 2 × geometry["outerMargin"]
                - geometry["gap"] × (layout["gridRows"] - 1))
               ÷ layout["gridRows"]

        3. slot이 None이면 colSpan과 rowSpan에 각각 1을 대입한다.
           그 외에는 colSpan에 slot.colSpan을,
           rowSpan에 slot.rowSpan을 대입한다.

        4. 기본 셀들의 너비와 슬롯 내부의 열 간격을 합하여
           slotWidth에 대입한다.

           slotWidth =
               colWidth × colSpan + geometry["gap"] × (colSpan - 1)

        5. 기본 셀들의 높이와 슬롯 내부의 행 간격을 합하여
           slotHeight에 대입한다.

           slotHeight =
               rowHeight × rowSpan + geometry["gap"] × (rowSpan - 1)

        6. slotGeometry["colWidth"]에 colWidth를,
           slotGeometry["rowHeight"]에 rowHeight를,
           slotGeometry["width"]에 slotWidth를,
           slotGeometry["height"]에 slotHeight를 대입한다.

        7. slotGeometry를 반환한다.
    """
    return slotGeometry

def buildGridResizeCandidate(rows, cols, state=None):
    candidate = "프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state"
    """
    Args:
    - rows:
      새 grid 행 수.

    - cols:
      새 grid 열 수.

    - state:
      이번 명령의 프로젝트 상태 딕셔너리 또는 None. 원형: /backend/project_state/ProjectObject._state

    Return:
    - candidate:
      프로젝트 변경 딕셔너리.
      requested grid size를 반영한 candidate layout/slot state.
      - rejected:
        안전한 resize가 아니면 거부 이유.

    변경:
    - authoritative project를 변경하지 않는다.

    처리:
        1. state가 None이면 activeProject._state를 사용한다.
           rows/cols가 backend.defaults.limits.layout의 gridRows/gridCols 범위에 속하는 정수인지 검증한다. state 전체를 Slot과 중첩 content까지
           분리 복사하여 candidate에 둔다. layout·slots의 변경을 이 후보에 적용하고 다른 필드를 보존한다.
        2. 확대면 기존 모든 grid cell/slot id/geometry와 모든 slot-local properties를 같은 좌표에 보존하고
           기존 좌표 집합에 없는 새 좌표마다 Slot(id, row, col)을 생성하여 candidate["slots"]에
           넣는다. row/col은 1-based이며 각 슬롯의 content는 별도로 생성한다.
           새 id는 resize 시작 시 기존 모든 slot id의 최대값+1부터 새 좌표 row-major 순서로 할당한다.
           임시 local counter이며 새 persistent sequence/재배치/기존 id 변경을 만들지 않는다.
        3. 축소면 삭제될 row/column과 교차하는 slot을 검사한다.
           - slotHasNonDefaultLocalState(slot)이 참이면 거부한다.
           - rowSpan/colSpan이 새 boundary를 넘거나 제거되는 merged cell이 있으면 거부한다.
        4. 위 조건을 통과한 경우 local state가 default인 empty 1x1 slot만 candidate에서 제거한다.
        5. candidate["layout"]["gridRows"]와 ["gridCols"]에 rows와 cols를 반영한다.
           남은 Slot의 geometry와 chart ownership을 whole-project candidate에서 다시 검증한다.
        6. content를 다른 좌표로 packing/reflow하지 않는다.

        7. candidate를 반환한다.
    """
    return candidate


def readImageEditorApi(slotId):
    imageEditor = "이미지 바이트·설정·대상 id 딕셔너리 또는 None."
    """
    Args:
    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    Return:
    - imageEditor:
      이미지 바이트·설정·대상 id 딕셔너리 또는 None.
      explicit slotId가 current Backend authority에서 참조하는 image name/display URL과 그 slot의 imageSettings read projection.

    변경:
    - authoritative slot-local imageSettings를 변경하지 않는다.

    처리:
        1. activeProject._state에서 slotId로 resolveVisibleSlot을 호출한다.
        2. Slot이 없거나 content["contentType"]이 image가 아니면 None을 반환한다.
        3. slot.content["imageId"]를 같은 상태의 assets["images"]에서 찾는다. 없으면 None을 반환한다.
        4. 슬롯 id, 이미지 id·이름·MIME·바이트와 slot.content["imageSettings"]의 분리 복사본으로 imageEditor를 구성한다.
        5. imageEditor를 읽기 전용 결과로 반환한다.
    """
    return imageEditor


def readLabelsApiState(slotId):
    state = "프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state"
    slot = "Slot 인스턴스 또는 None."
    geometry = "대시보드 치수 딕셔너리. 원형: /backend/layout_annotations/dashboardGeometryResult"
    reference = "기본 셀 또는 대상 슬롯 치수 딕셔너리."
    labelState = {
        "enabled": "라벨 표시 여부인 논리값.",
        "settings": "labelSettings 원형의 딕셔너리.",
        "reference": {
            "width": "라벨 위치 편집에 사용하는 슬롯 너비. 단위: px.",
            "height": "라벨 위치 편집에 사용하는 슬롯 높이. 단위: px.",
        },
        "sampleText": "번호 0을 현재 format과 parentheses 설정으로 표시한 문자열.",
    }
    """
    Args:
    - slotId:
      라벨 위치 편집의 기준이 될 슬롯 id 또는 None. 0은 유효한 id다.

    Return:
    - labelState:
      label 설정과 기준 슬롯 치수 딕셔너리.
      라벨 설정과 위치 편집의 기준 치수 및 예시 문자열을 담은 읽기 결과.

    변경:
    - 없음.

    처리:
        1. activeProject._state를 state에 둔다. state["annotations"]["labels"]에서
           enabled와 settings를 분리 복사하여 labelState의 같은 이름 필드에 넣는다.
        2. resolveVisibleSlot(slotId, state) 결과를 slot에 둔다.
        3. dashboardGeometry(state["layout"]["slotStyle"]["referenceWidth"], None)를
           호출하여 geometry에 둔다. 현재 프로젝트의 설정을 같은 동기 호출 안에서 읽는다.
        4. gridSlotGeometry(state["layout"], geometry, slot)을 호출하여 reference에 둔다.
           labelState["reference"]에 그 결과의 width와 height를 복사한다.
           slot이 None이면 기본 1×1 셀, 병합 슬롯이면 그 span을 포함한 치수를 사용한다.
        5. formatSlotLabel(0, labelState["settings"])의 displayLabel을 labelState["sampleText"]에 둔다.
        6. labelState를 읽기 전용 결과로 반환한다.
    """
    return labelState


def readGlobalCaptionState():
    captionState = "캡션 표시 설정·본문 딕셔너리."
    """
    Args:
    - 없음.

    Return:
    - captionState:
      캡션 표시 설정·본문 딕셔너리.
      project-level global caption text/name/settings read projection.

    변경:
    - 없음.

    처리:
        1. activeProject._state["annotations"].captions만 읽는다.
           selected slot이나 UI editor target mode를 global caption의 persistent state와 혼합하지 않는다.
           captionState를 반환한다.
    """
    return captionState


def readSlotCaptionState(slotId):
    captionState = "캡션 표시 설정·본문 딕셔너리."
    """
    Args:
    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    Return:
    - captionState:
      캡션 표시 설정·본문 딕셔너리.
      지정 slot object의 id/position/caption text read projection.

    변경:
    - 없음.

    처리:
        1. slotId를 current project에서 resolve하고 그 slot.caption을 읽는다.
           caption이 empty여도 UI는 placeholder를 별도 projection으로 표시할 수 있다.
           captionState를 반환한다.
    """
    return captionState


def readExportSettings():
    settings = "설정 딕셔너리."
    """
    Args:
    - 없음.

    Return:
    - settings:
      설정 딕셔너리.
      activeProject의 persistent width/heightMode/height/dpi/format read projection.

    변경:
    - 없음.

    처리:
        1. activeProject._state["export"]의 현재 설정을 읽는다.
        2. 중첩 필드까지 분리 복사하여 settings에 둔다.
        3. settings를 읽기 전용 결과로 반환한다.
    """
    return settings


def createTargetExportSnapshot():
    snapshot = "이번 작업의 읽기 전용 딕셔너리."
    """
    Args:
    - 없음.

    Return:
    - snapshot:
      이번 작업의 읽기 전용 딕셔너리.
      하나의 export 작업 동안 사용할 layout/label/caption/image/chart/slot/export-settings copy와
        renderer에 필요한 read-only color/style projection과 EXPORT_LIMITS의 rasterDimension/rasterArea 제한.

    변경:
    - authoritative project state를 변경하지 않는다.

    처리:
        1. projectObjects.snapshot으로 영속 입력을 한 시점에 복사한다.
           export target geometry는 snapshot["export"]에서 계산한다.
           renderer style projection은 export 작업 범위를 벗어나 일반 authority로 재사용하지 않는다.
           captionReferenceStyle은 settings.json의 backend.defaults.captionReferenceStyle에서 이 작업 input으로 복사한다. Frontend가 파일을 직접 읽지 않는다.
           reference width R=layout["slotStyle"]["referenceWidth"], dashboard 기준 높이 H0=R/layout.slotStyle.aspect다.
           목표 width W의 배율 s=W/R이다. renderer는 R에서 측정한 caption block/gap과 dashboard H0를 같은 s로 변환한다.
           export width는 이미 pixel 단위이므로 DPI를 다시 곱하지 않는다. DPI는 기존 출력 metadata 의미다.
           DOM 현재 크기는 target figure geometry의 Source of Truth로 사용하지 않는다.

        2. target width, height mode/height, DPI, raster format은 persistent project export settings다. target geometry·status callback·DOM bounds·generated blob은 작업별 출력 값이다.
        3. snapshot를 반환한다.
    """
    return snapshot


def buildLayoutCommandCandidate(event, payload, state):
    candidateState = "프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state"
    slots = "Slot 인스턴스의 배열."
    anchor = "Slot 인스턴스."
    text = "캡션 본문 문자열."
    """
    Args:
    - event:
      이 함수에 연결된 프로젝트 명령 등록의 키.
        원천: /backend/project_efsm/PROJECT_COMMANDS

    - payload:
      행·열, Slot id 배열, 캡션 소유 대상·새 본문 또는 해당 설정의 변경 필드 딕셔너리.

    - state:
      send가 이번 명령에 분리 복사한 프로젝트 상태 딕셔너리.
        원형: /backend/project_state/ProjectObject._state

    Return:
    - candidateState:
      후보 상태 딕셔너리 또는 거부·변경 없음의 None.

    변경:
    - 이번 명령의 state에 layout·Slot 배치·annotations·appearance·export 변경을 적용한다.

    처리:
        1. candidateState에 state를 두고 event에 해당하는 계산 하나를 수행한다.
           대상 부재·형식·범위·안전한 배치 조건 위반은 None을 반환한다.
        2. GRID_LAYOUT_CHANGED이면 rows·cols·candidateState를 buildGridResizeCandidate에
           전달하고 반환한 전체 후보를 candidateState로 둔다. 기존 id·좌표·payload와
           새 좌표의 Slot 생성, 기본 1×1만 제거하는 축소 조건을 그 함수에서 계산한다.
        3. LAYOUT_STYLE_CHANGED이면 candidateState["layout"]["slotStyle"]에 명시된 필드만 적용한다.
           backend.defaults.limits.layout의 해당 수치 범위와 양수 치수 조건을 검사한다.
        4. SLOTS_MERGED이면 중복 id를 제거하고 모든 id를 같은 상태의 visible Slot으로 찾는다.
           선택 영역의 최소·최대 row/col로 직사각형을 정하고, 그 내부 셀 전체가 선택 Slot에
           속하며 외부 Slot의 span과 경계가 교차하지 않는지 확인한다.
           slotHasNonDefaultLocalState가 참인 Slot은 최대 하나여야 한다.
           top-left Slot을 anchor로 두고 그 하나의 content·caption 또는 기본 Slot의 local 값을 옮긴다.
           anchor의 rowSpan·colSpan을 직사각형 크기로 정하고 hidden=False로 둔다.
           나머지 covered Slot은 Slot 생성자의 기본 content·caption과 1×1 span, hidden=True로 둔다.
           각 Slot의 id·row·col과 단일 chart 소유 관계를 유지한다.
        5. SLOTS_SPLIT이면 선택한 visible anchor를 slots에 둔다. 각 anchor의 content·caption을
           유지하고 span을 1×1로 만든다. 이전 span의 covered Slot은 각자의 id·row·col을
           유지한 기본 content·caption, 1×1 span, hidden=False로 복원한다.
        6. CAPTION_TEXT_INPUT이면 payload의 global 대상 또는 strict integer visible slotId를 확인한다.
           nullish text는 빈 문자열, 그 외에는 문자열 변환으로 text를 정한다.
           공백·Unicode·줄바꿈을 유지한다. global은 빈 문자열도 그대로 저장하고,
           Slot은 빈 문자열일 때 caption=None, 그 외에는 text를 저장한다.
        7. SLOT_CAPTIONS_INSERTED이면 insertSlotCaptions(candidateState, payload["slotIds"])의 본문을
           candidateState["annotations"]["captions"]["text"]에 적용한다.
           name·afterText·settings와 원본 Slot.caption을 유지한다.
        8. CAPTION_SETTINGS_CHANGED이면 candidateState["annotations"]["captions"]의 enabled·name·nameBold와
           settings 중 명시한 필드만 합친다. LABEL_SETTINGS_CHANGED이면
           candidateState["annotations"]["labels"]의 enabled와 settings 중 명시한 필드만 합친다.
        9. LABEL_POSITION_CHANGED이면 candidateState["annotations"]["labels"]["settings"]의 x/y를 적용한다.
           reset=True이면 settings.json의 backend.project_object.annotations.labels.settings에서
           x/y를 읽어 적용한다. 다른 label 설정을 보존한다.
        10. APPEARANCE_CHANGED이면 명시한 palette 필드를 candidateState["appearance"]에 합친다.
            normalizeProjectSettings(candidateState)로 10개 palette 필드의 색과 기본값을 정규화한다.
        11. EXPORT_SETTINGS_CHANGED이면 candidateState["export"]의 명시한 필드를 적용한다.
            width는 backend.defaults.limits.export.logicalWidth, height는 logicalHeight,
            dpi는 dpi 범위로 검증한다. heightMode와 format은 export 원형의 enum을 확인한다.
        12. candidateState를 반환한다. 설정과 소유 관계의 전체 검증은 send가 수행한다.
    """
    return candidateState
