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

RENDERER_INPUT_CONTRACT = {
    "projectProjection": "Application boundary의 Backend query가 제공한 immutable renderer project projection",
    "interfaceState": "Frontend FSM의 final runtime state projection",
    "frontendActions": "FastFigureApi/Application boundary가 제공하는 selection/persistent command callback surface",
}

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
    "renderer는 Frontend 책임이며 Backend internal state/helper를 직접 읽지 않는다. "
    "renderDashboard와 Plotly/image/caption renderer는 Application boundary가 제공한 immutable projectProjection과 "
    "Frontend final interfaceState에서 DOM/Plotly representation을 만든다. "
    "DOM/Plotly/projectProjection은 persistent project authority가 아니며 renderer read/normalization은 Backend authority를 변경하지 않는다."
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
    "Application boundary는 Project EFSM commit result 뒤 Backend reconciliation query와 Frontend FSM reconciliation을 먼저 완료하고 "
    "final interfaceState, mutationResult, 필요한 Backend renderer projection을 renderer에 전달한다. "
    "실제 rendered reference 제거가 있으면 FULL_DASHBOARD, path/tree 변화만 있으면 NONE, "
    "기존 narrow update가 충분하면 TARGETED_PROJECTION이다. "
    "renderer는 supplied projection만 소비하고 Backend command/query 또는 Frontend FSM command를 재귀 호출하지 않는다."
)

def applyDashboardProjectionInvalidation(event, mutationResult, interfaceState, projectProjection):
    """
    post-reconciliation renderer effect.
    FULL_DASHBOARD/TARGETED_PROJECTION/NONE을 project result와 final interface state에서 계산한다.
    ProjectObject 또는 interface state를 변경하지 않는다.
    """
    return "projection effect"

def renderDashboard(projectProjection, interfaceState):
    """
    변경:
    - dashboard/slot/Plotly/image/label/caption DOM projection.
    - Backend project state와 Frontend FSM state는 변경하지 않는다.

    처리:
    1. supplied projectProjection의 grid와 style을 dashboard CSS geometry에 반영한다.
    2. visible slot projection마다 slot container와 label/bookmark control surface를 구성한다.
    3. graph slot은 projection에 포함된 resolved chart/CSV view로 Plotly projection을 render한다.
    4. image slot은 projection의 image bytes/view와 normalized slot-local imageSettings copy로 image surface를 동기화한다.
    5. interfaceState.selectedSlotId에 따라 selection/interaction class를 적용한다.
    6. caption과 label projection을 동기화한다.
    7. stale Plotly instance를 purge하고 resize generation을 관리한다.
    8. 누락/default normalization이 필요해도 projectProjection copy만 다루며 live ProjectObject에 write하지 않는다.
    """
    return "supplied Backend projection에서 생성된 dashboard projection"


def setSelectedSlot(slotId, direction, frontendActions):
    """
    변경:
    - SELECT_SLOT event를 통한 runtime selection/workspace.
    - graph view renderer projection.

    중요 semantics:
    기본 UI 방향에서 이미 선택된 동일 slot id를 다시 보내면 선택 해제된다.
    caller가 '선택을 보장'해야 하면 현재 selected slot을 먼저 읽어야 한다.

    처리:
    renderer는 slotId를 Backend에서 직접 검증하거나 interfaceFSM에 직접 주입하지 않는다.
    frontendActions.slots.select에 selection intent를 전달하고 Application boundary의 validated SELECT_SLOT 결과를 사용한다.
    그 뒤 반환된 final interface state와 project projection으로 graph view를 갱신하고 resize를 요청한다.
    """
    return "Application boundary를 거친 선택 후 Frontend runtime state"


def installSlotClickController(frontendActions):
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
       layout_annotations_export의 operation matrix를 따른다. swap commit이 성공하면 Application boundary가 반환한 projectProjection과 final interfaceState를 기준으로
       dashboard projection을 즉시 다시 생성하며 이 renderer refresh는 domain state를 다시 변경하지 않는다.
    8. OS file DataTransfer drop은 bookmark drag와 별도 경로이며 여기서 import하지 않고
       Mantine FastFigureDashboardFileDrop에 넘긴다.
    """
    return "설치된 dashboard interaction controller"


def swapSlotContents(source, target, frontendActions):
    """
    변경:
    - frontendActions.slots.swap public mutation API를 통한 source/target GUI 위치의 slot-local properties.
    - Frontend selectedSlotId는 persistent mutation의 writable state가 아니며 commit 뒤 Application boundary가 reconciliation한다.

    처리:
    1. renderer는 source/target id만 public mutation API에 전달한다.
    2. Backend Project EFSM이 current authority에서 source/target을 다시 resolve한다.
    3. row/col/span geometry는 각 GUI 위치에 유지하고 chart/image/contentType/imageSettings/caption local payload 전체를 교환한다.
    4. chart ownership은 교환된 target slot에 맞춰 1:1을 유지한다.
    5. commit 뒤 Application boundary가 Backend reconciliation query -> Frontend FSM reconciliation을 수행한다.
    6. renderer는 반환된 projectProjection과 reconciled interfaceState로 dashboard projection만 갱신하고 swap mutation을 반복하지 않는다.
    """
    return "public API swap commit 결과와 post-reconciliation renderer projection"


def prepareDashboardFileDrop(slotId, frontendActions):
    """
    Return:
    - accepted:
      target slot이 외부 file drop을 받을 수 있는지 여부.

    변경:
    - 유효 target이 현재 선택이 아니면 해당 slot을 선택한다.
    - drag runtime state를 정리한다.

    처리:
    1. frontendActions.slots.prepareFileDrop(slotId)가 Application boundary를 통해 target validity를 Backend에서 검증한다.
    2. accepted target이 current selected slot이 아니면 같은 public Frontend selection 경계로 target workspace를 선택한다.
    3. renderer 자체는 Backend slot을 resolve하거나 file bytes, asset, chart/image reference를 변경하지 않는다.
    4. 실제 file import/collision UI는 FastFigureDashboardFileDrop -> assets.importToSlot 경로가 소유한다.
    5. finishFileDrop은 drag runtime cleanup만 수행하며 domain commit을 반복하지 않는다.
    """
    accepted = "drop target 유효 여부"
    return accepted


def applySlotStyle(projectProjection, notify):
    """
    변경:
    - dashboard/caption renderer CSS projection.
    - notify가 참이면 layout model-to-ui notification.

    처리:
    supplied projectProjection.layout.slotStyle에서 border/aspect/outer-margin/gap/radius를 계산한다.
    DOM computed state나 renderer projection을 Backend authority로 되돌려 쓰지 않는다.
    """
    return "적용된 dashboard style projection"


def resolveSelectedChart(projectProjection, interfaceState):
    """
    Return:
    - chart:
      interfaceState.selectedSlotId -> supplied projectProjection slot/chart relation으로 resolve한 chart projection 또는 없음.

    변경:
    - 없음.

    처리:
    Backend helper를 호출하지 않고 supplied projectProjection 안의 resolved relation만 사용한다.
    선택 chart를 별도 global editing pointer로 저장하지 않으며 한 작업의 local chart projection을 authority로 보존하지 않는다.
    """
    chart = "현재 selected slot의 chart 또는 없음"
    return chart


def updateGraphView(projectProjection, interfaceState):
    """
    변경:
    - 선택 slot에 대응하는 graph/image workspace renderer projection.

    처리:
    interfaceState.selectedSlotId와 supplied projectProjection의 resolved chart/image view를 사용한다.
    stale UI buffer나 DOM을 project read 원천으로 사용하지 않는다.
    """
    return "갱신된 workspace projection"


def startupCoreRuntime(projectProjection, interfaceState, frontendActions):
    """
    변경:
    - 기본 project runtime, renderer controller, FSM lifecycle.

    처리:
    1. Backend가 제공한 initial projectProjection은 valid ProjectObject에서 파생된 renderer input이다.
    2. dashboard zoom projection을 적용한다.
    3. public frontendActions를 사용하는 slot click/drop controller를 설치한다.
    4. projectProjection의 existing visible slots를 renderDashboard로 투영한다.
    5. supplied slot style projection을 적용한다.
    6. Frontend lifecycle ready 전환은 Application boundary가 interfaceFSM event로 수행하고 renderer가 직접 실행하지 않는다.
    7. supplied project/reference/runtime projection contract를 audit한다.

    startup은 default CSV를 생성하거나 grid slot을 domain state에 다시 만드는 초기화 side effect를 수행하지 않는다.
    """
    return "ready core runtime"
