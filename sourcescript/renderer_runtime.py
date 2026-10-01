"""
Fast Figure Source Script — dashboard renderer, DOM interaction, telemetry and startup

현재 구현 원천:
- ../Fast-figure.html
  graphArea, dashboard, dashboardCaption, readmeContent renderer host와 renderer CSS.
- ../fast-figure.js
  renderDashboard, slot interaction, resize, status/debug telemetry, startup.
- ../fast-figure-ui.js
  dashboard external-file drop owner.

참조 Source Script:
- project_state.py
- application_fsm.py
- graphs.py
- layout_annotations_export.py
"""

from project_state import activeProject, selectedSlotId, editing
from application_fsm import appFSM

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


def renderDashboard():
    """
    변경:
    - dashboard/slot/Plotly/image/label/caption DOM projection.
    - project state 자체를 renderer 목적으로 변경하지 않는다.

    처리:
    1. activeProject grid와 style을 dashboard CSS geometry에 반영한다.
    2. visible slot마다 slot container와 label/tab surface를 구성한다.
    3. graph slot은 referenced chart를 resolve해 Plotly projection을 render한다.
    4. image slot은 referenced image와 settings를 resolve해 image surface를 동기화한다.
    5. selectedSlotId에 따라 selection/interaction class를 적용한다.
    6. caption과 label projection을 동기화한다.
    7. stale Plotly instance를 purge하고 resize generation을 관리한다.
    """
    return "현재 project에서 다시 생성된 dashboard projection"


def setSelectedSlot(slotId, direction="fsm-to-model"):
    """
    변경:
    - SELECT_SLOT event를 통한 runtime selection/workspace.
    - graph view renderer projection.

    중요 semantics:
    기본 UI 방향에서 이미 선택된 동일 slot id를 다시 보내면 선택 해제된다.
    caller가 '선택을 보장'해야 하면 현재 selected slot을 먼저 읽어야 한다.

    처리:
    appFSM event가 selection semantics를 결정한 뒤 graph view를 갱신하고 resize를 요청한다.
    """
    return "선택 후 runtime state"


def installSlotClickController():
    """
    변경:
    - dashboard DOM에 slot click/slot-to-slot drag event listener를 설치한다.
    - project state 변경은 event handler 안에서 공식 command를 통해 수행한다.

    처리:
    slot background/tab click은 setSelectedSlot로 전달한다.
    selected slot tab drag는 source/target slot content swap command를 사용한다.
    file DataTransfer drop은 여기서 처리하지 않고 Mantine FastFigureDashboardFileDrop에 넘긴다.
    """
    return "설치된 dashboard interaction controller"


def swapSlotContents(source, target):
    """
    변경:
    - SLOTS_SWAPPED event를 통해 두 slot의 content reference와 필요 시 selectedSlotId.

    처리:
    row/col geometry는 바꾸지 않고 slot.content 전체를 교환한다.
    mutation action 안에서 validation하고 실패하면 이전 content/selection으로 rollback한다.
    """
    return "swap 완료"


def prepareDashboardFileDrop(slotId):
    """
    Return:
    - accepted:
      target slot이 외부 file drop을 받을 수 있는지 여부.

    변경:
    - 유효 target이 현재 선택이 아니면 해당 slot을 선택한다.
    - drag runtime state를 정리한다.

    처리:
    실제 file import와 collision UI는 frontend가 소유한다.
    """
    accepted = "drop target 유효 여부"
    return accepted


def applySlotStyle(notify=True):
    """
    변경:
    - dashboard/caption renderer CSS projection.
    - notify가 참이면 layout model-to-ui notification.

    처리:
    activeProject.layout.slotStyle에서 border/aspect/outer-margin/gap/radius를 계산한다.
    DOM computed state를 project authority로 되돌려 쓰지 않는다.
    """
    return "적용된 dashboard style projection"


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
    applyDashboardZoom
    -> ensureDefaultCsv
    -> installSlotClickController
    -> makeSlots
    -> applySlotStyle
    -> appFSM.ready
    -> auditApp 순서를 보존한다.
    """
    return "ready core runtime"
