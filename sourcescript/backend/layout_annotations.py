"""
Fast Figure Source Script — Backend / layout-annotation-domain

하위 구현 검증 자료: ../../fast-figure.js, ../../fast-figure-ui.js, ../../Fast-figure.html.
Python 표기의 구현 명세이며 application runtime을 실행하는 모듈이 아니다.
"""

from sourcescript.backend.project_state import activeProject, projectObjects, SLOT_LOCAL_DEFAULTS, slotHasNonDefaultLocalState

ANNOTATION_SETTINGS_RULE = (
    "기본값의 단일 데이터 원천은 sourcescript/backend/settings.json의 backend.project_object.annotations 및 backend.defaults.captionReferenceStyle이다. "
    "이 JSON은 code/loader/별도 mutable authority가 아니라 기존 Backend annotation 책임의 설정 데이터다. "
    "create는 annotations.labels/captions의 설정 field만 deep-copy한다. text/afterText/name은 별도 새 instance data로 empty text를 생성한다. load는 missing 설정만 재귀 보완하며 valid saved 값과 false/0/empty 및 본문 data를 보존한다. "
    "supplied invalid 값은 기존 normalization/whole-project validation으로 처리하며 invalid state를 commit하지 않는다. "
    "partial edit는 현재 Project의 omitted field를 유지한다. read는 기본값을 채우기 위해 Project를 mutate하지 않는다. "
    "position reset도 JSON backend.project_object.annotations.labels.settings.x/y를 사용한다. FFPX에는 실제 Project 값을 저장한다. "
    "Frontend는 Backend/Application이 supplied projection/export input에 포함한 값을 소비하며 JSON/Backend를 직접 읽지 않는다. "
    "settings.json이 missing/malformed면 구성 오류이며 별도의 코드 상수로 조용히 대체하지 않는다. "
    "설정 파일별 registry/synchronization/cache authority를 만들지 않는다."
)

LAYOUT_BOUNDARY_RULE = (
    "Backend layout/annotation 계산은 explicit slotId/reference와 current project authority만 사용한다. "
    "selectedSlotId 같은 Frontend runtime reference를 직접 읽거나 Application adapter를 호출하지 않는다. "
    "Application wrapper는 identity와 새 edit 값만 보내며 candidate는 Project EFSM command 내부에서 계산한다. "
    "Frontend renderer는 Application이 제공한 immutable snapshot/projection만 소비한다."
)
CAPTION_TEXT_RULE = (
    "CAPTION_TEXT_INPUT은 current Project source를 capture하고 explicit global owner 또는 strict integer visible slotId를 resolve한다. "
    "text가 nullish이면 empty text, 그 외 언어의 text 변환을 시도한다. whitespace/Unicode/newline을 보존하며 trim/placeholder를 저장하지 않는다. "
    "변환 오류는 commit 없이 전파한다. global empty는 empty text로, slot empty는 none으로 저장한다. "
    "대상 text 외 caption name/settings/다른 slot caption/asset/Frontend selection은 변경하지 않는다. "
    "whole candidate validation 후 source identity가 바뀌면 최신 authority에서 변환부터 재계산하며 성공 attempt만 한 번 commit한다. "
    "readSlotCaptionState의 empty presentation은 read-only이며 slot.caption을 보완하지 않는다."
)

layoutRules = "config reference: backend.defaults.limits.layout; bounds 적용 알고리즘은 기존 layout owner가 수행한다."
# zoom은 Frontend session/UI 의미이며 Backend config에 옮기지 않는다.


imageSettings = {
    "owner": "slot.content.imageSettings; image asset의 속성이 아니다.",
    "fit": "contain, cover, manual 중 하나",
    "scale": "manual fit percent; backend.defaults.limits.imageSettings.scale",
    "x": "manual image center x; backend.defaults.limits.imageSettings.x",
    "y": "manual image center y; backend.defaults.limits.imageSettings.y",
}


labelSettings = {
    "format": "lower/upper alpha, decimal, lower/upper roman",
    "parentheses": "identifier에 괄호를 표시하는지 여부",
    "x": "slot reference 좌표계의 label x position",
    "y": "slot reference 좌표계의 label y position",
    "order": "row-major 또는 column-major",
    "fontFamily": "label font family",
    "fontSize": "backend.defaults.limits.labels.fontSizeMin 이상; 별도 최대 없음",
}


captionSettings = {
    "fontFamily": "caption font family",
    "fontSize": "backend.defaults.limits.captions.fontSize",
    "lineHeight": "backend.defaults.limits.captions.lineHeight",
}


EXPORT_LIMITS = "config reference: backend.defaults.limits.export"
# format png/jpeg와 auto/explicit의 의미·높이 계산은 기존 export 알고리즘이며 숫자 한계만 config에서 읽는다.


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


def orderedSlotLabels(project):
    """
    Pure call-scoped calculation from the supplied current authority or Backend command candidate.
    visible anchor slots only: exclude hidden/merged covered cells. Sort row-major by (row,col),
    column-major by (col,row), using current project.annotations.labels.settings.order.
    Assign ordinal 0..N-1 across ALL visible anchors, including empty image/graph slots.
    format lower/upper-alpha uses bijective base26: a..z, aa..; decimal is ordinal+1;
    lower/upper-roman uses conventional subtractive Roman notation (I,IV,IX,XL,XC,CD,CM),
    repeated M above 3999, then requested case. No slotId-based renumbering.
    Return immutable {slotId, ordinal, identifier, displayLabel}: displayLabel wraps identifier
    in parentheses only when label settings.parentheses is true. enabled controls drawing only,
    not numbering. labels.readState sampleText uses the same formatter for ordinal 0.
    Caption insertion always wraps its group identifier/range in parentheses independently of enabled/parentheses.
    Do not persist this list or share it as another operation's authority.
    """
    return "ordered labels derived from this project"


def insertSlotCaptions(project, slotIds=None):
    """
    Backend command-internal pure calculation, returning candidate global caption text; no commit/Frontend access.
    1. Read current global text, slot.caption strings and orderedSlotLabels(project) in this one calculation.
       None means all visible anchors; [] means no targets. Explicit ids are deduplicated, must resolve to
       visible anchors, otherwise reject unchanged. Filter ordered labels without renumbering.
    2. Scan selected entries in layout/label order. Start a group with its ordinal/identifier and EXACT caption
       string (no trim, case-fold or whitespace/newline normalization). Empty means length zero only.
    3. Extend the current group only if the next ordinal is immediately consecutive AND its caption is empty
       or exactly equals the group's stored text. Extending with empty never replaces stored nonempty text.
       A group starting empty therefore stays empty until a nonempty, different caption starts a new group.
       Gaps between selected ordinals terminate a group; nonadjacent equal texts never merge.
    4. Render singleton as (identifier), multi-entry as (firstIdentifier-lastIdentifier), e.g. (a-c).
       Append one U+0020 then the stored text only when that text is nonempty. Empty groups render label only.
       Join rendered groups with one U+0020. Preserve original caption contents, including their own whitespace.
    5. No rendered entries means unchanged text/no commit. Otherwise append this string to the END of current
       global text; if current text is empty use the string alone, if it ends in U+0020 reuse that boundary space,
       otherwise insert one U+0020. Never trim/replace existing text. afterText/name/settings remain unchanged.
       Repeated calls append again; there is no hidden history/deduplication of existing global text.
    6. SLOT_CAPTIONS_INSERTED applies this result to its current candidate, validates, and commits once.
       Calculation/validation failure changes neither Project nor Frontend; success uses normal reconciliation.
    Examples: [A,A,empty] -> (a-c) A; [empty,B] -> (a) (b) B;
       [empty,empty] -> (a-b); [A,B,A] -> (a) A (b) B (c) A.
    """
    return "candidate appended global caption text or unchanged"


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
    label editor의 target slot이 none/missing이면 width=colWidth, height=rowHeight인 기본 1x1 reference를 사용한다.
    이 fallback은 표시 geometry일 뿐 기본 slot을 생성하거나 Frontend selection을 변경하지 않는다.
    """
    slotGeometry = "layout grid에서 계산한 slot geometry"
    return slotGeometry


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
       새 좌표에만 SLOT_LOCAL_DEFAULTS를 가진 empty 1x1 slot을 추가한다. SLOT_STRUCTURE와 같이 row/col은 1-based다.
       새 id는 resize 시작 시 기존 모든 slot id의 최대값+1부터 새 좌표 row-major 순서로 할당한다.
       임시 local counter이며 새 persistent sequence/재배치/기존 id 변경을 만들지 않는다.
    3. 축소면 삭제될 row/column과 교차하는 slot을 검사한다.
       - slotHasNonDefaultLocalState(slot)이 참이면 거부한다.
       - rowSpan/colSpan이 새 boundary를 넘거나 제거되는 merged cell이 있으면 거부한다.
    4. 위 조건을 통과한 경우 local state가 default인 empty 1x1 slot만 candidate에서 제거한다.
    5. 남은 slot geometry와 chart ownership을 whole-project candidate에서 다시 검증한다.
    6. content를 다른 좌표로 packing/reflow하지 않는다.
    """
    candidate = "안전한 grid resize candidate 또는 rejected result"
    return candidate


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


def readLabelsApiState(slotId):
    """
    Return:
    - labelState:
      persistent label enabled/settings copy와 현재 선택 slot 기준 reference width/height.
    reference는 현재 layout의 referenceWidth dashboardGeometry와 gridSlotGeometry로 계산한다.
    explicit slotId가 none/missing이면 같은 grid의 1x1 cell 크기이며 merged slot이면 해당 span 크기다.
    sampleText는 orderedSlotLabels의 formatter를 현재 label format/parentheses와 ordinal 0에 적용한 예시다. 선택 slot의 caption을 sample 원천으로 쓰지 않는다.
    이 read는 label position/settings/Frontend selection을 변경하지 않는다.

    변경:
    - 없음.

    처리:
    reference geometry는 current Backend layout과 explicit slotId로 resolve한 slot span에서 계산한다.
    """
    labelState = "label editor read projection"
    return labelState


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


def createTargetExportSnapshot():
    """
    Return:
    - snapshot:
      하나의 export 작업 동안 사용할 layout/label/caption/image/chart/slot/export-settings copy와
      renderer에 필요한 read-only color/style projection과 EXPORT_LIMITS의 rasterDimension/rasterArea 제한.

    변경:
    - authoritative project state를 변경하지 않는다.

    처리:
    projectObjects.snapshot으로 영속 입력을 한 시점에 복사한다.
    export target geometry는 snapshot.export에서 계산한다.
    renderer style projection은 export 작업 범위를 벗어나 일반 authority로 재사용하지 않는다.
    captionReferenceStyle은 settings.json의 backend.defaults.captionReferenceStyle에서 이 작업 input으로 복사한다. Frontend가 파일을 직접 읽지 않는다.
    reference width R=layout.slotStyle.referenceWidth, dashboard 기준 높이 H0=R/layout.slotStyle.aspect다.
    목표 width W의 배율 s=W/R이다. renderer는 R에서 측정한 caption block/gap과 dashboard H0를 같은 s로 변환한다.
    export width는 이미 pixel 단위이므로 DPI를 다시 곱하지 않는다. DPI는 기존 출력 metadata 의미다.
    DOM 현재 크기는 target figure geometry의 Source of Truth로 사용하지 않는다.
    """
    snapshot = "단일 export 작업용 immutable input snapshot"
    return snapshot
