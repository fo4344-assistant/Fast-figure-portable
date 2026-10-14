"""
Fast Figure Source Script — dashboard renderer, DOM interaction, telemetry and startup

하위 구현 검증 원천:
- ../Fast-figure.html
  graphArea, dashboard, dashboardCaption, readmeContent renderer host와 renderer CSS.
- ../fast-figure.js
  renderDashboard, slot interaction, resize, status/debug telemetry, startup.
- ../fast-figure-ui.js
  dashboard external-file drop owner.

참조 Source Script:
- project_state.py
- interface_fsm.py
- application_fsm.py
- graphs.py
- layout_annotations_export.py
"""

from project_state import activeProject
from interface_fsm import interfaceFSM, selectedSlotId
from application_fsm import dispatchInterfaceEvent

RENDERER_HOSTS = {
    "graphArea": "dashboard와 caption을 포함하는 scroll/render host",
    "dashboard": "slot grid renderer host",
    "dashboardCaption": "caption renderer host",
    "captionPrefix": "global/slot caption prefix host",
    "captionText": "contenteditable caption body host",
    "readmeContent": "README HTML template source",
    "ff-react-bootstrap-root": "React/Mantine shell root",
}

uiTelemetryState = {
    "revision": "telemetry projection revision",
    "status": "사용자에게 표시하는 최신 status text",
    "debugEnabled": "debug runtime authority를 UI에 투영한 boolean",
    "debugLines": "현재 session debug log line projection",
}

debugEnabled = (
    "현재 session debug 기록 on/off의 runtime authority. "
    "persistent project state가 아니며 uiTelemetryState에 표시용으로 projection한다."
)

RENDERER_RULE = (
    "renderDashboard와 Plotly/image/caption renderer는 activeProject 또는 단일 작업 snapshot에서 읽어 "
    "DOM/Plotly representation을 만든다. DOM은 project/domain Source of Truth가 아니다."
)


def publishUiTelemetry(patch):
    """
    Return:
    - telemetry:
      revision이 증가한 새 immutable telemetry projection.

    변경:
    - uiTelemetryState만 변경한다.
    - project/domain state는 변경하지 않는다.

    처리:
    기존 projection에 patch를 합치고 revision을 증가시킨 뒤 subscriber에 알린다.
    """
    telemetry = "현재 UI telemetry projection"
    return telemetry


def setDebugEnabled(enabled):
    """
    변경:
    - debugEnabled runtime authority.
    - uiTelemetryState.debugEnabled projection.

    처리:
    입력을 boolean 의미로 정규화하고 projection을 즉시 publish한다.
    """
    return "최종 debugEnabled"


def status(message):
    """
    변경:
    - uiTelemetryState.status만 갱신한다.

    Return:
    - text:
      표시한 status 문자열.
    """
    text = "정규화된 status text"
    return text


DASHBOARD_PROJECTION_INVALIDATION_RULE = (
    "application orchestration은 projectEFSM commit result 뒤 interfaceFSM reconciliation을 먼저 완료하고 "
    "final runtime selection과 mutation result를 renderer에 전달한다. "
    "실제 rendered reference 제거가 있으면 FULL_DASHBOARD, path/tree 변화만 있으면 NONE, "
    "기존 narrow update가 충분하면 TARGETED_PROJECTION이다. "
    "renderer는 activeProject와 final interface state를 읽기만 하고 두 FSM command를 재호출하지 않는다."
)

def applyDashboardProjectionInvalidation(event, mutationResult, interfaceState):
    """
    post-reconciliation renderer effect.
    FULL_DASHBOARD/TARGETED_PROJECTION/NONE을 project result와 final interface state에서 계산한다.
    ProjectObject 또는 interface state를 변경하지 않는다.
    """
    return "projection effect"

def renderDashboard():
    """
    변경:
    - dashboard/slot/Plotly/image/label/caption DOM projection.
    - project state 자체를 renderer 목적으로 변경하지 않는다.

    처리:
    1. activeProject grid와 style을 dashboard CSS geometry에 반영한다.
    2. visible slot마다 slot container와 label/bookmark control surface를 구성한다.
    3. graph slot은 referenced chart를 resolve해 Plotly projection을 render한다.
    4. image slot은 referenced image asset bytes와 같은 slot object의 imageSettings를 resolve해 image surface를 동기화한다.
    5. selectedSlotId에 따라 selection/interaction class를 적용한다.
    6. caption과 label projection을 동기화한다.
    7. stale Plotly instance를 purge하고 resize generation을 관리한다.
    """
    return "현재 project에서 다시 생성된 dashboard projection"


def setSelectedSlot(slotId, direction):
    """
    변경:
    - SELECT_SLOT event를 통한 runtime selection/workspace.
    - graph view renderer projection.

    중요 semantics:
    기본 UI 방향에서 이미 선택된 동일 slot id를 다시 보내면 선택 해제된다.
    caller가 '선택을 보장'해야 하면 현재 selected slot을 먼저 읽어야 한다.

    처리:
    interfaceFSM event가 selection semantics를 결정한 뒤 graph view를 갱신하고 resize를 요청한다.
    """
    return "선택 후 runtime state"


def installSlotClickController():
    """
    변경:
    - dashboard DOM에 slot bookmark click/slot-to-slot bookmark drag event listener를 설치한다.
    - project state 변경은 event handler 안에서 공식 command를 통해 수행한다.

    처리:
    1. click target이 visible slot에 속하는지 먼저 resolve한다.
    2. visible slot에 속하지 않는 dashboard background click이면:
       - 현재 selectedSlotId가 없으면 selection을 변경하지 않는다.
       - 현재 selectedSlotId가 있으면 setSelectedSlot(None, "fsm-to-model")에 해당하는 기존 SELECT_SLOT 경로로
         selectedSlotId를 none으로 만들고 workspace를 project로 갱신한다.
       - toolbar, sidebar, overlay/Modal, project tree 등 dashboard interaction controller 밖의 UI click은
         이 background deselection 규칙의 입력이 아니다.
    3. visible slot click이면 contentType, chart 존재 여부, image 존재 여부보다 현재 selection 상태를 먼저 판정한다.
    4. click한 slot이 현재 selected slot이 아니면:
       - graph slot, image slot, empty slot 모두 같은 규칙으로 slot surface click을 setSelectedSlot(slot.id)로 전달한다.
       - content가 존재한다는 이유만으로 미선택 slot의 selection 진입을 막지 않는다.
       - 이 첫 click은 slot을 선택하는 interaction이며, 선택되지 않은 slot의 Plotly/image content interaction을
         selection보다 우선하는 별도 규칙으로 만들지 않는다.
    5. click한 slot이 이미 selected slot이면:
       - bookmark control click은 setSelectedSlot(slot.id)로 전달하여 기존 SELECT_SLOT toggle semantics에 따라 선택 해제한다.
       - graph content가 있는 본문 click은 Plotly interaction에 맡기고 selection을 다시 변경하지 않는다.
       - image content가 있는 본문 click은 image interaction에 맡기고 selection을 다시 변경하지 않는다.
       - graph/image content가 없는 empty slot surface click은 setSelectedSlot(slot.id)로 전달하여
         기존 SELECT_SLOT toggle semantics에 따라 선택 해제한다.
    6. bookmark drag는 selection toggle이 아니라 source/target GUI position 사이의 slot-local payload 이동으로 처리한다.
       drag 시작 시 UI-local click suppression을 활성화한다.
       drop 또는 dragend는 drag source를 정리하지만 click suppression을 즉시 해제하지 않는다.
       suppression이 활성화된 동안 bookmark click이 들어오면 SELECT_SLOT을 보내지 않고 그 click을 소비한 뒤 suppression을 해제한다.
       browser가 post-drag click을 만들지 않는 경우에는 그 click dispatch 기회가 지난 뒤의 cleanup에서 suppression을 해제한다.
       따라서 drag와 같은 interaction cycle에서 생긴 click은 slot selection/toggle로 해석하지 않는다.
    7. 이동은 slot swap command를 사용하고 renderable content/caption/imageSettings 전체 이동 의미는
       layout_annotations_export의 operation matrix를 따른다. swap commit이 성공하면 current project와 selectedSlotId를 기준으로
       dashboard projection을 즉시 다시 생성하며 이 renderer refresh는 domain state를 다시 변경하지 않는다.
    8. OS file DataTransfer drop은 bookmark drag와 별도 경로이며 여기서 import하지 않고
       Mantine FastFigureDashboardFileDrop에 넘긴다.
    """
    return "설치된 dashboard interaction controller"


def swapSlotContents(source, target):
    """
    변경:
    - projectEFSM command를 통한 source/target GUI 위치의 slot-local properties.
    - selectedSlotId는 persistent mutation의 writable state가 아니며 commit 뒤 interfaceFSM이 reconcile한다.

    처리:
    1. source/target을 current project에서 다시 resolve한다.
    2. row/col/span geometry는 각 GUI 위치에 유지한다.
    3. chart/image/contentType/imageSettings/caption 등 slot-local properties 전체를 한 단위로 교환한다.
    4. chart ownership은 교환된 target slot에 맞춰 1:1을 유지한다.
    5. projectEFSM이 candidate를 검증한 뒤 한 번 commit한다.
    6. interfaceFSM reconciliation이 끝난 뒤 current project와 reconciled selectedSlotId를 읽어 dashboard projection을 갱신한다.
       이 갱신은 renderer projection만 변경하고 swap mutation을 반복하지 않는다.
    """
    return "swap candidate commit과 즉시 갱신된 dashboard projection"


def prepareDashboardFileDrop(slotId):
    """
    Return:
    - accepted:
      target slot이 외부 file drop을 받을 수 있는지 여부.

    변경:
    - 유효 target이 현재 선택이 아니면 해당 slot을 선택한다.
    - drag runtime state를 정리한다.

    처리:
    1. slotId를 current visible slot에서 resolve하고 hidden/invalid target이면 false로 끝낸다.
    2. 유효 target이 현재 selected slot이 아니면 import target workspace를 위해 그 slot을 선택한다.
    3. 이 함수는 file bytes, asset, chart/image reference를 변경하지 않는다.
    4. 실제 file import/collision UI는 FastFigureDashboardFileDrop -> assets.importToSlot 경로가 소유한다.
    5. finishFileDrop은 drag runtime cleanup만 수행하며 domain commit을 반복하지 않는다.
    """
    accepted = "drop target 유효 여부"
    return accepted


def applySlotStyle(notify):
    """
    변경:
    - dashboard/caption renderer CSS projection.
    - notify가 참이면 layout model-to-ui notification.

    처리:
    activeProject.layout.slotStyle에서 border/aspect/outer-margin/gap/radius를 계산한다.
    DOM computed state를 project authority로 되돌려 쓰지 않는다.
    """
    return "적용된 dashboard style projection"


def resolveSelectedChart():
    """
    Return:
    - chart:
      selectedSlotId -> current slot.chart -> activeProject chart collection으로 resolve한 chart 또는 없음.

    변경:
    - 없음.

    처리:
    선택 chart를 별도 global editing pointer로 저장하지 않는다.
    한 작업 안에서 얻은 local chart reference는 그 작업 범위를 넘겨 authoritative runtime state로 보존하지 않는다.
    """
    chart = "현재 selected slot의 chart 또는 없음"
    return chart


def updateGraphView():
    """
    변경:
    - 선택 slot에 대응하는 graph/image workspace renderer projection.

    처리:
    selectedSlotId와 referenced project model을 현재 state에서 다시 resolve한다.
    stale UI buffer를 project read 원천으로 사용하지 않는다.
    """
    return "갱신된 workspace projection"


def startupCoreRuntime():
    """
    변경:
    - 기본 project runtime, renderer controller, FSM lifecycle.

    처리:
    1. createProjectState/loaded ProjectObject가 이미 valid slot structure를 소유한다.
    2. dashboard zoom projection을 적용한다.
    3. slot click/drop controller를 설치한다.
    4. activeProject의 existing slots를 renderDashboard로 투영한다.
    5. slot style을 적용한다.
    6. interfaceFSM을 ready로 전환한다.
    7. project/reference/runtime invariant를 audit한다.

    startup은 default CSV를 생성하거나 grid slot을 domain state에 다시 만드는 초기화 side effect를 수행하지 않는다.
    """
    return "ready core runtime"
