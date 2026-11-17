"""
Fast Figure Source Script — Frontend / renderer — dashboard, interactions and raster presentation

하위 구현 검증 자료: ../../fast-figure.js, ../../fast-figure-ui.js, ../../Fast-figure.html.
Python 문법으로 작성한 구현 명세다.
"""

# caller가 전달한 projection·callback·export snapshot의 표시와 surface 자원을 담당한다.

RENDERER_INPUT_CONTRACT = {
    "projectProjection": "Application boundary의 Backend query가 제공한 immutable renderer project projection",
    "interfaceState": "Frontend FSM의 final runtime state projection",
    "frontendActions": "FastFigureApi/Application boundary가 제공하는 selection/persistent command callback surface",
}


def syncDashboardCaption(captionState):
    outcome = "None."
    """
    Args:
    - captionState:
      이번 표시의 enabled·text·name·settings 캡션 딕셔너리.

    Return:
    - outcome:
      None.

    변경:
    - 대시보드 caption DOM과 해당 표시 자원.

    처리:
        1. explicit immutable captionState의 text/name/settings/enabled 값으로 caption host를 표시한다.
           Backend/Project/Application query를 재호출하거나 persistent text를 변경하지 않는다.
           DOM 표시 오류는 caller에 전파한다. renderer-local 값은 이번 표시 호출에 사용한다.
           None를 반환한다.
    """
    return outcome


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


debugEnabled = '현재 세션의 debug 기록 활성 여부인 논리값.'





def publishUiTelemetry(patch):
    telemetry = "UI telemetry 딕셔너리."
    """
    Args:
    - patch:
      telemetry의 이번 변경 필드 딕셔너리.

    Return:
    - telemetry:
      UI telemetry 딕셔너리.
      revision이 증가한 새 immutable telemetry projection.

    변경:
    - uiTelemetryState와 표시 revision. 등록된 표시 구독자에게 알린다.

    처리:
        1. patch의 명시된 필드만 uiTelemetryState의 같은 필드에 반영한다. 생략된 필드는 유지한다.
        2. telemetry revision을 한 번 증가시키고 변경 후 읽기 전용 telemetry를 구성한다.
        3. 등록된 표시 구독자에게 알린 뒤 telemetry를 반환한다.
    """
    return telemetry


def readDebugEnabled():
    enabled = "논리값."
    """
    Args:
    - 없음.

    Return:
    - enabled:
      논리값.
      현재 debugEnabled runtime authority의 boolean

    변경:
    - 없음.

    처리:
        1. Frontend renderer가 소유한 debugEnabled의 현재 논리값을 enabled에 둔다.
        2. enabled를 반환한다.
    """
    return enabled


def setDebugEnabled(enabled):
    enabledResult = "논리값."
    """
    Args:
    - enabled:
      설정할 논리값.

    Return:
    - enabledResult:
      논리값.
      최종 debugEnabled

    변경:
    - Frontend runtime debugEnabled와 UI telemetry projection.

    처리:
        1. 입력을 boolean 의미로 정규화해 debugEnabled에 먼저 반영하고 그 실제 값을 projection으로 즉시 publish한다.
           명시 bool 설정 계약을 유지하며 UI projection을 현재 runtime 값 대신 읽지 않는다.
           publish 오류는 전파하고 이미 수행한 runtime 변경을 숨은 rollback으로 되돌리거나 성공으로 위장하지 않는다.
           enabledResult를 반환한다.
    """
    return enabledResult


def status(message):
    text = "표시 문자열."
    """
    Args:
    - message:
      표시할 메시지.

    Return:
    - text:
      표시 문자열.
      표시한 status 문자열.

    변경:
    - uiTelemetryState의 status와 표시 revision.

    처리:
        1. message 문자열을 text에 둔다.
        2. publishUiTelemetry({"status": text})로 최신 상태 표시를 발행한다.
        3. text를 반환한다.
    """
    return text





def applyDashboardProjectionInvalidation(event, mutationResult, interfaceState, projectProjection):
    effect = "FULL_DASHBOARD, TARGETED_PROJECTION, NONE 중 하나."
    """
    Args:
    - event:
      처리할 이벤트 이름 문자열.

    - mutationResult:
      이번 명령의 ProjectMutationResult. 원형: /backend/project_efsm/ProjectMutationResult

    - interfaceState:
      이번 표시 작업의 Frontend 상태 읽기 딕셔너리.

    - projectProjection:
      Application이 제공한 이번 표시 작업의 읽기 전용 Backend projection.

    Return:
    - effect:
      FULL_DASHBOARD, TARGETED_PROJECTION, NONE 중 하나.
      projection effect

    변경:
    - 판정된 범위의 renderer host·projection.

    처리:
        1. post-reconciliation renderer effect.
           FULL_DASHBOARD/TARGETED_PROJECTION/NONE을 project result와 final interface state에서 계산한다.
           ProjectObject 또는 interface state를 변경하지 않는다.

        2. Application boundary는 Project EFSM commit result 뒤 Backend reconciliation query와 Frontend FSM reconciliation을 먼저 완료하고 final interfaceState, mutationResult, 필요한 Backend renderer projection을 renderer에 전달한다. 실제 rendered reference 제거가 있으면 FULL_DASHBOARD, path/tree 변화만 있으면 NONE, 기존 narrow update가 충분하면 TARGETED_PROJECTION이다. renderer는 supplied projection만 소비하고 Backend command/query 또는 Frontend FSM command를 재귀 호출하지 않는다. rendered reference 제거는 result의 실제 제거 delta/현재 host identity와 supplied final slot/chart/image reference로 판정한다. 제거가 없고 actual 변경이 project name/VFS path/tree에만 한정되면 NONE이다. CAPTION_TEXT_INPUT/SLOT_CAPTIONS_INSERTED/CAPTION_SETTINGS_CHANGED/LABEL_SETTINGS_CHANGED/LABEL_POSITION_CHANGED/APPEARANCE_CHANGED/SLOT_IMAGE_SETTINGS_CHANGED는 기존 host identity가 모두 유지되고 supplied projection만으로 갱신 가능할 때 TARGETED_PROJECTION이다. 해당 narrow projection은 각각 caption/label, CSS palette와 graph presentation, 해당 image surface를 갱신한다. host 교체/제거가 있거나 그 외 persistent visual 변경이면 FULL_DASHBOARD로 fallback한다. 추측한 event별 stale Backend snapshot을 사용하지 않는다.
        3. APPEARANCE_CHANGED의 TARGETED_PROJECTION이면 다음 표시를 수행한다.
           projectProjection은 Application의 dispatchProjectCommand가 참조 보정 뒤
           dispatchProjectQuery("renderer", {frontendState: 최종 Frontend 상태})로 조회해 반환한 값이다.
           projectProjection["appearance"]["uiPalette"]를 applyUiPalette의 첫 인자로,
           False를 notify로 전달하여 CSS를 적용한다.
           projectProjection["visibleSlots"]의 각 graph slot에 대해 그 slot의 figure를
           현재 host의 기존 Plotly 갱신 절차에 전달한다. figure의 배경·글자색은 Backend의
           graphs.chartFigure(chart, project)가 같은 프로젝트의 appearance.uiPalette에서 계산한 값이다.
           기존 generation·host·chart 확인과 비동기 실패 처리를 유지한다.
           host가 바뀌어 FULL_DASHBOARD이면 기존 renderDashboard가 같은 조회 결과를 적용한다.
        4. effect를 반환한다.
    """
    return effect


def renderDashboardFrame(host, layout, visibleSlots, geometry):
    frameView = "grid host와 슬롯 id별 frame·content·decoration DOM 참조를 담은 딕셔너리."
    """
    Args:
    - host:
      이번 표시 대상의 grid DOM host.

    - layout:
      같은 Backend 조회에서 제공한 gridRows·gridCols·slotStyle 딕셔너리.
      원형: /backend/project_state/ProjectObject._state.layout

    - visibleSlots:
      같은 조회의 visible Slot별 id·row·col·rowSpan·colSpan 읽기 결과 배열.
      원형: /backend/project_state/Slot의 배치 필드.

    - geometry:
      이번 host 너비의 읽기 전용 기하 딕셔너리.
      원형: /backend/layout_annotations/dashboardGeometryResult

    Return:
    - frameView:
      grid와 슬롯별 DOM 참조. 각 슬롯 항목은 frame·content·decoration을 가진다.

    변경:
    - supplied host의 grid·slot 틀과 배치 CSS.

    처리:
        1. host의 border-box 너비·높이에 geometry의 width·height를 적용한다.
           gridRows·gridCols 개수의 같은 비율 행·열을 구성하고 gap과 padding에는
           geometry의 gap·outerMargin을 적용한다. grid 바깥 모서리 반경은 0이다.
           표시용 외곽선은 내부 기하를 밀지 않는 장식으로 그린다.
        2. visibleSlots의 id마다 현재 host 아래의 같은 id 틀을 재사용하거나 새 틀을 만든다.
           행·열 시작점과 span을 해당 슬롯의 row·col·rowSpan·colSpan으로 배치한다.
           틀의 min-width·min-height는 0이고 모서리 반경은 geometry["radius"]다.
           layout["slotStyle"]["showBorders"]이면 슬롯 외곽선을 표시하고 False이면 숨긴다.
           외곽선 두께·배경·box sizing·내용 영역의 배치 규칙은 실제 dashboard와 미리보기에 함께 적용한다.
        3. 각 틀은 기존 content 영역과 치수에 영향을 주지 않는 decoration 영역을 유지한다.
           기존 content 자식은 같은 틀의 갱신에서 보존한다. 이번 visibleSlots에 없는 틀은 host에서 분리한다.
           frameView["grid"]에 host를, frameView["slots"][id]에 해당
           frame·content·decoration 참조를 담은 딕셔너리를 넣고 frameView를 반환한다.
           이 함수는 Plotly 호출·이미지 decode·선택 전이·resize 요청을 수행하지 않는다.
           호출자는 자신의 content와 listener 수명을 관리한다.
    """
    return frameView


def renderDashboard(projectProjection, interfaceState):
    dashboardView = "대시보드 DOM 표시 결과."
    frameView = "renderDashboardFrame의 이번 DOM 참조 결과."
    """
    Args:
    - projectProjection:
      Application이 제공한 이번 표시 작업의 읽기 전용 Backend projection.

    - interfaceState:
      이번 표시 작업의 Frontend 상태 읽기 딕셔너리.

    Return:
    - dashboardView:
      대시보드 DOM 표시 결과.
      supplied Backend projection에서 생성된 dashboard projection

    변경:
    - dashboard/slot/Plotly/image/label/caption DOM projection.
    - Backend project state와 Frontend FSM state는 변경하지 않는다.

    처리:
        1. 7~8번의 수명 규칙에 따라 교체·제거되는 이전 graph instance와 image surface를 먼저 정리한다.
           Application이 제공한 projectProjection["geometry"]와 같은 조회의 layout·visible slots를
           실제 dashboard host와 함께 renderDashboardFrame에 전달한다.
           반환값을 frameView에 두고 그 frame·content·decoration 참조를 이번 표시 작업에서 사용한다.
           너비·height·margin·gap·radius는 supplied geometry를 적용하고
           zoom/anchor는 Frontend 세션에 유지한다. geometry 변경 뒤 current host만 resize한다.
        2. 공통 틀의 decoration 영역에 label/bookmark와 선택·상호작용 표시를 구성한다.
           슬롯 content 영역은 graph·image 표시에 사용한다.
        3. graph slot은 Backend가 같은 project read에서 계산해 projection에 포함한 figure를 Plotly로 표시한다.
           supplied CSV/columns는 editor 표시용 read 값이며 Frontend에서 traces/chartFigure를 다시 계산하거나
           CSV를 resolve해 Backend figure를 다른 결과로 바꾸지 않는다.
        4. image slot은 projection의 image bytes/view와 normalized slot-local imageSettings copy로 image surface를 동기화한다.
        5. interfaceState["selectedSlotId"]에 따라 selection/interaction class를 적용한다.
        6. caption과 label projection을 동기화한다. label 번호/문자열은 supplied orderedSlotLabels 결과를 사용한다.
           label format/order를 renderer가 독립 재정의하지 않으며 설정 JSON/Backend를 직접 읽지 않는다.
        7. 현재 dashboard render generation을 기준으로 visible slot id/chart id와 instance 소유 관계를 대조한다.
           같은 host/slot/chart가 유지되면 기존 graph instance를 갱신한다. 사라진 slot, 다른 chart로 교체된 host,
           graph에서 image/empty로 바뀐 host의 이전 instance는 purge한 뒤 현재 view만 설치한다.
           새 content/style/geometry를 적용한 뒤 살아 있는 current graph host에만 resize를 요청한다.
           비동기 graph 완료/resize는 시작 당시 generation과 host/slot/chart가 여전히 current일 때만 적용한다.
           더 오래된 작업의 완료는 새 DOM/view를 덮어쓰거나 없어진 instance를 되살리지 않고 자기 임시 자원만 해제한다.
           generation/instance association은 renderer-local lifetime 정보이며 Project/Frontend FSM state를 복제하지 않는다.
        8. image projection은 copied bytes 또는 그 bytes에서 순수 계산한 display URL과 slot-local settings를 사용한다.
           renderer가 decode/display handle이나 revocable URL을 만들면 해당 image surface/render 작업이 소유한다.
           image 교체/slot 제거/cleanup에서 이전 surface를 분리한 뒤 더 이상 쓰이지 않는 handle/URL을 해제한다.
           오래된 decode/load 완료에는 generation과 slot/image 입력이 일치하는지 확인하고 아니면 결과를 버리고 자원을 해제한다.
           여러 surface가 같은 image를 보여도 한 surface의 해제가 다른 살아 있는 surface의 자원을 무효화하지 않아야 한다.
           교체 실패도 현재 Project를 바꾸지 않으며, 실패한 임시 자원을 남기거나 다음 render에 완료를 재적용하지 않는다.
           구체 Plotly 호출/URL 표현/scheduler primitive는 이 수명 의미를 보존하는 하위 구현 선택이다.
        9. 누락/default normalization이 필요해도 projectProjection copy만 다루며 live ProjectObject에 write하지 않는다.
           dashboardView를 반환한다.
    """
    return dashboardView


def setSelectedSlot(slotId, direction, frontendActions):
    selectionResult = "Frontend 상태와 renderer 입력을 가진 Application 결과."
    """
    Args:
    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    - direction:
      ui-to-fsm 또는 model-to-fsm 방향 문자열.

    - frontendActions:
      Application이 제공한 선택·변경·조회 함수 묶음.

    Return:
    - selectionResult:
      Frontend 상태와 renderer 입력을 가진 Application 결과.
      Application boundary를 거친 선택 후 Frontend runtime state

    변경:
    - SELECT_SLOT event를 통한 runtime selection/workspace.
    - graph view renderer projection.

    처리:
        1. 기본 UI 방향에서 이미 선택된 동일 slot id를 다시 보내면 선택 해제된다.
           direction=model-to-fsm이면 같은 slot도 선택을 유지한다. caller가 동일 target의 부수 selection clear까지 피해야 하면
           현재 selected slot을 먼저 읽어 같은 id일 때 transition을 생략한다.

        renderer는 slotId를 Backend에서 직접 검증하거나 interfaceFSM에 직접 주입하지 않는다.
           frontendActions.slots.select에 slotId/direction selection intent를 전달하고 Application boundary의 validated SELECT_SLOT 결과를 사용한다.
           direction을 renderer에서 누락시키거나 새 toggle 판정으로 대체하지 않는다.
           그 뒤 반환된 final interface state와 project projection으로 graph view를 갱신하고 resize를 요청한다.
    """
    return selectionResult


def installSlotClickController(frontendActions):
    controller = "이벤트 listener 해제 기능을 가진 interaction controller."
    """
    Args:
    - frontendActions:
      Application이 제공한 선택·변경·조회 함수 묶음.

    Return:
    - controller:
      이벤트 listener 해제 기능을 가진 interaction controller.
      설치된 dashboard interaction controller

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
           해당 입력의 전용 handler에서 처리한다.
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
        6. bookmark drag는 source/target GUI position 사이의 slot-local payload 이동으로 처리한다.
           drag 시작 시 UI-local click suppression을 활성화한다.
           drop 또는 dragend는 drag source를 정리하지만 click suppression을 즉시 해제하지 않는다.
           suppression이 활성화된 동안 bookmark click이 들어오면 SELECT_SLOT을 보내지 않고 그 click을 소비한 뒤 suppression을 해제한다.
           browser가 post-drag click을 만들지 않는 경우에는 그 click dispatch 기회가 지난 뒤의 cleanup에서 suppression을 해제한다.
           따라서 drag와 같은 interaction cycle에서 생긴 click은 slot selection/toggle로 해석하지 않는다.
        7. 이동은 slot swap command를 사용하고 renderable content/caption/imageSettings 전체 이동 의미는
           Backend slot-operation caption contract를 따른다. swap commit이 성공하면 Application boundary가 반환한 projectProjection과 final interfaceState를 기준으로
           dashboard projection을 즉시 다시 생성하며 이 renderer refresh는 domain state를 다시 변경하지 않는다.
        8. OS file DataTransfer drop은 bookmark drag와 별도 경로이며 여기서 import하지 않고
           Mantine FastFigureDashboardFileDrop에 넘긴다.
           controller를 반환한다.
    """
    return controller


def swapSlotContents(source, target, frontendActions):
    swapResult = "명령 결과와 renderer 입력을 가진 Application 결과."
    """
    Args:
    - source:
      입력 프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state

    - target:
      kind·id·path를 가진 asset 참조 딕셔너리.

    - frontendActions:
      Application이 제공한 선택·변경·조회 함수 묶음.

    Return:
    - swapResult:
      명령 결과와 renderer 입력을 가진 Application 결과.
      public API swap commit 결과와 post-reconciliation renderer projection

    변경:
    - frontendActions.slots.swap public mutation API를 통한 source/target GUI 위치의 slot-local properties.
    - commit 뒤 Application이 selectedSlotId의 참조를 reconciliation한다.

    처리:
        1. renderer는 source/target id만 public mutation API에 전달한다.
        2. Backend Project EFSM이 current authority에서 source/target을 다시 resolve한다.
        3. row/col/span geometry는 각 GUI 위치에 유지하고 chart/image/contentType/imageSettings/caption local payload 전체를 교환한다.
        4. chart ownership은 교환된 target slot에 맞춰 1:1을 유지한다.
        5. commit 뒤 Application boundary가 Backend reconciliation query -> Frontend FSM reconciliation을 수행한다.
        6. renderer는 반환된 projectProjection과 reconciled interfaceState로 dashboard projection만 갱신하고 swap mutation을 반복하지 않는다.
    """
    return swapResult


def finishDashboardFileDropInteraction():
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
        1. dashboard interaction controller의 drag-only bookkeeping/hover를 완료/중단 경로에서 정리한다.
           event listener가 현재 정리 중인 interaction만 끝내며 unrelated pointer/resource는 건드리지 않는다.
           bookmark 내부 drag의 post-drag click suppression은 여기서 즉시 풀지 않는다. 기존 click 소비/dispatch 이후 cleanup 규칙을 유지한다.
           중복 finish는 no-op/None이다. selection/zoom/lifecycle/Backend를 읽거나 바꾸지 않는다.
           이 pointer 상태는 Frontend controller 소유이며 Application/FSM에 두 번째 drop-target copy를 만들지 않는다.
           outcome를 반환한다.
    """
    return outcome


def prepareDashboardFileDrop(slotId, frontendActions):
    accepted = "논리값."
    """
    Args:
    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    - frontendActions:
      Application이 제공한 선택·변경·조회 함수 묶음.

    Return:
    - accepted:
      논리값.
      target slot이 외부 file drop을 받을 수 있는지 여부.

    변경:
    - 유효 target이 현재 선택이 아니면 해당 slot을 선택한다.
    - drag runtime state를 정리한다.

    처리:
        1. 기존 public frontendActions.slots.prepareFileDrop(slotId)를 호출한다. 이 API는 public action surface에 이미 선언된
           선택 보장 operation이며 일반 slots.select의 toggle을 대신 호출하지 않는다.
        2. Application이 explicit slotId를 Backend에서 검증한다. invalid/hidden/none target이면 기존 selection을 보존하고 false를 반환한다.
           valid target이 이미 선택되어 있으면 Frontend transition 없이 현재 selection/workspace를 유지한다.
           다른 valid target이면 model-to-fsm SELECT_SLOT으로 선택을 보장한다. 같은 target을 toggle-clear하지 않는다.
           pendingContentType intent를 전달하지 않으며 이 준비 operation은 persistent content-type command를 만들지 않는다.
        3. renderer 자체는 Backend slot을 resolve하거나 file bytes, asset, chart/image reference를 변경하지 않는다.
        4. 실제 file import/collision UI는 FastFigureDashboardFileDrop -> assets.importToSlot 경로가 소유한다.
        5. finishFileDrop은 drag runtime cleanup만 수행하며 domain commit을 반복하지 않는다.
           accepted를 반환한다.
    """
    return accepted


def applyUiPalette(projectProjection, notify):
    paletteView = "CSS 표시 결과."
    """
    Args:
    - projectProjection:
      Application이 제공한 팔레트 색상 딕셔너리.
      dispatchProjectQuery("renderer", {operation: "ui-palette"})의 반환값 또는
      같은 작업의 전체 renderer 조회 결과에서 읽은 appearance.uiPalette다.
      원본: /backend/project_state/activeProject._state.appearance.uiPalette

    - notify:
      표시 변경 알림 여부인 논리값.

    Return:
    - paletteView:
      CSS 표시 결과.
      palette CSS projection

    변경:
    - supplied palette에 대응하는 CSS 변수.

    처리:
        1. 전달받은 팔레트의 색상 필드를 CSS 변수에 적용한다.
           --ui-color=uiColor, --paper=uiBackgroundColor, --ui-subtle=uiSubtleColor,
           --ink=fontColor, --graph-bg=paperColor다.
           그래프 갱신은 applyDashboardProjectionInvalidation이 같은 작업의 전체 renderer 조회 결과로 수행한다.
           notify가 참이면 UI_PALETTE_CHANGED를 한 번 알린다.
           MantineProvider의 전체 UI 변수 계산은 mantine_ui.FastFigureApp이 소유한다.
           paletteView를 반환한다.
    """
    return paletteView


def applySlotStyle(projectProjection, notify):
    styleView = "CSS 표시 결과."
    """
    Args:
    - projectProjection:
      Application이 제공한 이번 표시 작업의 읽기 전용 Backend projection.

    - notify:
      표시 변경 알림 여부인 논리값.

    Return:
    - styleView:
      CSS 표시 결과.
      적용된 dashboard style projection

    변경:
    - dashboard/caption renderer CSS projection.
    - notify가 참이면 layout model-to-ui notification.

    처리:
        1. supplied projectProjection의 geometry·layout·visible slots와 현재 dashboard host로
           renderDashboardFrame을 호출하여 같은 grid·slot 스타일을 갱신한다.
           그 반환값을 styleView에 둔다. caption의 기존 표시 규칙에도 supplied geometry를 사용한다.
        2. notify가 True이면 기존 layout model-to-ui 알림을 한 번 전달한다.
           호출자에게 styleView를 반환한다. Project와 Frontend 선택은 유지한다.
    """
    return styleView


def resolveSelectedChart(projectProjection, interfaceState):
    chart = "chartModel 딕셔너리 또는 None."
    """
    Args:
    - projectProjection:
      Application이 제공한 이번 표시 작업의 읽기 전용 Backend projection.

    - interfaceState:
      이번 표시 작업의 Frontend 상태 읽기 딕셔너리.

    Return:
    - chart:
      chartModel 딕셔너리 또는 None.
      interfaceState["selectedSlotId"] -> supplied projectProjection slot/chart relation으로 resolve한 chart projection 또는 없음.

    변경:
    - 없음.

    처리:
        1. Backend helper를 호출하지 않고 supplied projectProjection 안의 resolved relation만 사용한다.
           선택 chart를 별도 global editing pointer로 저장하지 않으며 한 작업의 local chart projection을 authority로 보존하지 않는다.
           chart를 반환한다.
    """
    return chart


def updateGraphView(projectProjection, interfaceState):
    workspaceView = "선택 슬롯 workspace 표시 결과."
    """
    Args:
    - projectProjection:
      Application이 제공한 이번 표시 작업의 읽기 전용 Backend projection.

    - interfaceState:
      이번 표시 작업의 Frontend 상태 읽기 딕셔너리.

    Return:
    - workspaceView:
      선택 슬롯 workspace 표시 결과.
      갱신된 workspace projection

    변경:
    - 선택 slot에 대응하는 graph/image workspace renderer projection.

    처리:
        1. interfaceState["selectedSlotId"]와 supplied projectProjection의 resolved chart/image view를 사용한다.
           stale UI buffer나 DOM을 project read 원천으로 사용하지 않는다.
           workspaceView를 반환한다.
    """
    return workspaceView


def startupCoreRuntime(projectProjection, interfaceState, frontendActions):
    runtime = "Frontend controller와 renderer runtime 구성."
    """
    Args:
    - projectProjection:
      Application이 제공한 이번 표시 작업의 읽기 전용 Backend projection.

    - interfaceState:
      이번 표시 작업의 Frontend 상태 읽기 딕셔너리.

    - frontendActions:
      Application이 제공한 선택·변경·조회 함수 묶음.

    Return:
    - runtime:
      Frontend controller와 renderer runtime 구성.
      ready core runtime

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
           runtime를 반환한다.
    """
    return runtime


def readDashboardRenderedWidth():
    width = "양의 유한 수(px) 또는 None."
    """
    Args:
    - 없음.

    Return:
    - width:
      양의 유한 수(px) 또는 None.
      현재 rendered dashboard width 또는 none

    변경:
    - 없음.

    처리:
        1. Frontend surface가 현재 dashboard bounding width를 한 번 측정해 finite positive scalar 또는 none을 반환한다.
           DOM/control 값으로 Project layout을 역추론하지 않으며 session lock anchor 생성에만 사용한다.
           width를 반환한다.
    """
    return width


def downloadExportPayload(payload):
    outcome = "None."
    """
    Args:
    - payload:
      이벤트 또는 파일 형식이 정한 입력 딕셔너리.

    Return:
    - outcome:
      None.
      handoff 완료 시 None; 실패는 throw/rejection

    변경:
    - 브라우저 다운로드 handoff와 이번 작업의 URL·handle.

    처리:
        1. Backend export query의 copied name/MIME/bytes 또는 FFPX/FFSX entry list만 소비한다.
           entry list는 기존 package ZIP STORE 형식으로 직렬화하며 graph/CSV/Project를 재조회하지 않는다.
           copied bytes로 download resource를 만들고 브라우저에 한 번 전달한다. 정상 반환은 None이다.
           이 완료는 브라우저 다운로드 handoff 완료를 뜻한다.
           브라우저가 취소를 관찰할 수 없는 download에 가상의 cancelled/saved-disk 결과를 만들지 않는다.
           resource URL/handle은 이 surface의 성공·실패·취소 종료 경로에서 정리하며, handoff한 바이트의 소비 시점을 보장한다.
           브라우저가 bytes를 소비하기 전 조기 revoke하지 않으며 구체 scheduler/URL primitive는 이 수명을 보존하는 하위 구현 선택이다.
           encoding/handoff 오류는 원래 failure로 전파하며 Project/다른 surface resource를 변경하지 않는다.
           outcome를 반환한다.
    """
    return outcome


def exportCaptionLayout(snapshot, measureText):
    R = "기준 대시보드 너비. 단위: px."
    style = "snapshot의 captionReferenceStyle 딕셔너리."
    padding = "캡션 안쪽 여백. 단위: px."
    available = "한 줄에 사용할 너비. 단위: px."
    lineHeight = "기준 글꼴의 줄 높이. 단위: px."
    prefixWidth = "첫 줄의 이름과 공백 너비. 단위: px."
    lines = "그릴 줄 문자열과 첫 줄 prefix 위치의 배열."
    captionLayout = "lines·prefix 위치·fontFamily·fontSize·lineHeight·height·gap 딕셔너리."
    """
    Args:
    - snapshot:
      이번 내보내기의 설정·도형·이미지·캡션 입력 딕셔너리.

    - measureText:
      문자열·글꼴·굵기에서 너비(px)를 계산하는 Frontend 함수.

    Return:
    - captionLayout:
      줄·prefix 위치·글꼴·높이·간격 딕셔너리.
      이번 내보내기의 기준 폭에서 측정한 캡션 줄 배치와 치수.

    변경:
    - 없음.

    처리:
        1. snapshot["layout"]["slotStyle"]["referenceWidth"]를 R에,
           snapshot["captionReferenceStyle"]을 style에 둔다.
           snapshot["captions"]의 enabled, name, nameBold, text, settings를 읽는다.
           enabled가 False이면 lines는 빈 배열, height와 gap은 0인 captionLayout을 반환한다.
        2. settings의 fontFamily와 fontSize에 필요한 글꼴 준비를 기다린다.
           준비나 측정에 실패하면 원래 오류를 호출자에게 전달한다.
           padding은 style["padding"], available은 max(style["minimumTextWidth"], R-2*padding),
           lineHeight는 settings["fontSize"]*settings["lineHeight"]다.
        3. name이 있으면 이름과 뒤 공백 하나를 첫 줄의 prefix로 사용한다.
           nameBold가 True이면 굵기 700, 그 외 400으로 measureText를 호출하여 prefixWidth를 구한다.
           name이 없으면 prefixWidth는 0이다. 본문 글자 굵기는 400이다.
        4. text를 줄바꿈으로 문단 분리한다. 빈 문단도 유지한다.
           각 문단의 비어 있지 않은 공백 구분 단어를 순서대로 한 칸 공백으로 잇는다.
           다음 단어를 더했을 때 첫 줄은 max(style["minimumTextWidth"], available-prefixWidth),
           나머지 줄은 available을 넘고 현재 줄이 비어 있지 않으면 현재 줄을 lines에 넣고
           다음 줄에서 그 단어부터 계속한다. 한 단어 자체가 폭을 넘으면 단어를 한 줄로 유지하여 그릴 영역에서 자른다.
        5. 명시된 문단 경계를 유지하며 빈 문단은 빈 줄로 넣는다. 이름만 있으면 prefix 한 줄,
           이름과 본문이 모두 비어 있으면 빈 한 줄을 유지한다.
           afterText는 별도 저장 필드로 유지하고 본문에는 text만 사용한다.
        6. 같은 lines로 그리기와 높이를 계산한다.
           height=2*padding+len(lines)*lineHeight+style["borderHeight"], gap=style["dashboardGap"]다.
           lines, prefix 위치, 같은 측정·그리기 글꼴, 줄 높이, height, gap을 captionLayout에 넣어 반환한다.
    """
    return captionLayout


def renderDashboardTarget(snapshot, statusSink):
    R = "기준 대시보드 너비(px)."
    W = "목표 출력 너비(px)."
    s = "목표 폭과 기준 폭의 비율."
    H0 = "기준 폭의 대시보드 높이(px)."
    C0 = "기준 폭의 캡션 높이(px)."
    G0 = "기준 폭의 캡션 간격(px)."
    H = "출력 전체 높이(px)."
    dashboardHeight = "출력 대시보드 영역 높이(px)."
    rasterWidth = "출력 정수 너비(px)."
    rasterHeight = "출력 정수 높이(px)."
    result = "outcome·width·height·automaticHeight 또는 거부 reason 딕셔너리."
    """
    Args:
    - snapshot:
      이번 내보내기의 설정·도형·이미지·캡션 입력 딕셔너리.

    - statusSink:
      진행 메시지를 받는 표시 함수.

    Return:
    - result:
      outcome·width·height·automaticHeight 또는 거부 reason 딕셔너리.
      saved 또는 rejected outcome과 관련 정보.

    변경:
    - project/domain state를 변경하지 않는다.
    - output file download와 status projection만 발생한다.

    처리:
        1. Application이 공식 export query로 제공한 immutable snapshot을 사용한다.
        2. snapshot의 persistent export settings에서 width/height mode/dpi/format을 읽는다.
        3. layout 팝업의 이미지 폭 R=snapshot["layout"]["slotStyle"]["referenceWidth"]를 기준 폭으로 사용한다.
           W=export.width는 목표 pixel width, s=W/R, H0=R/layout.slotStyle.aspect다.
           exportCaptionLayout으로 R 기준 caption height C0와 gap G0를 한 번 측정한다.
           auto total height H=ceil((H0+C0+G0)*s). dashboard/caption/fonts/gap/label/image를 동일 s로 scaling한다.
           캡션 disabled면 C0=G0=0이다. raster width=round(W), height=round(H)이며 DPI를 다시 곱하지 않는다.
           DPI는 기존 metadata 의미이고 DPI만 변경하면 pixel geometry는 같다. target은 supplied snapshot의 layout과 export 설정에서 계산한다.
        4. explicit height면 persistent total height H를 사용하고 dashboardHeight=H-(C0+G0)*s로 배치한다.
           auto dashboardHeight는 H0*s이며 ceil 잔여 pixel은 바닥 여유로 둔다. caption은 dashboard 아래 gap 뒤에 그린다.
        5. supplied snapshot의 raster dimension/area limit을 넘으면 project를 변경하지 않고 rejected를 반환한다.
        6. outerMargin=min(configuredOuterMargin*s,min(W,dashboardHeight)*0.49), gap=configuredGap*s로 계산하고
           gridSlotGeometry의 모든 rowHeight/colWidth가 positive인지 검사한다. explicit height가 caption과 grid를 담지 못하면
           download 전 rejected outcome이다. 설정값을 몰래 줄이거나 auto height로 대체하지 않는다.
        7. 각 visible slot의 Backend-supplied figure 또는 image를 target geometry로 다시 render한다.
           graph의 CSV resolve/numeric transform은 Backend export query에서 끝나며 여기서 재실행하지 않는다.
           target geometry/font/line/marker의 presentation scaling은 figure copy에만 적용하고 supplied snapshot/Project를 변경하지 않는다.
           ordinary FFPX whole-project snapshot을 raster용 precomputed figure input인 것처럼 대신 사용하지 않는다.
        8. label/caption을 같은 logical reference geometry에서 변환해 그린다.
        9. PNG/JPEG blob에 DPI metadata를 적용하고 downloadExportPayload로 한 번 전달한다.
        10. 정상 handoff 뒤 {outcome: saved, width: rasterWidth, height: rasterHeight, automaticHeight: heightMode==auto}를 반환한다.
           saved는 브라우저 다운로드 handoff 완료를 뜻한다. 거부는 {outcome: rejected, reason: raster-limit/caption-height/grid-geometry}다.
           dimension/area는 raster-limit, dashboardHeight<=0은 caption-height, positive cell을 만들 수 없으면 grid-geometry이며 width/height를 몰래 보정하지 않는다.
           raster limit/invalid geometry는 download 전 rejected outcome이며 throw/rejection은 caller에 전파한다.
           statusSink에 진행 상황을 표시하고, 완료 결과와 오류는 export 작업의 결과 경로로 전달한다.
           작업에서 만든 임시 render host/Plotly/image/URL은 성공/거부/예외 모두 finally에서 작업 소유분만 정리한다.
           result를 반환한다.
    """
    return result


def renderDashboardCurrent(snapshot, statusSink):
    result = "outcome·width·height·automaticHeight 또는 거부 reason 딕셔너리."
    """
    Args:
    - snapshot:
      이번 내보내기의 설정·도형·이미지·캡션 입력 딕셔너리.

    - statusSink:
      진행 메시지를 받는 표시 함수.

    Return:
    - result:
      outcome·width·height·automaticHeight 또는 거부 reason 딕셔너리.
      현재 화면 영역을 캡처한 one-shot raster outcome.

    변경:
    - persistent export settings를 변경하지 않는다.

    처리:
        1. capture는 현재 supplied snapshot과 renderedWidth로 출력한다. 저장된 target width/height를 유지한다.
           Application이 제공한 snapshot과 현재 rendered viewport geometry를 one-shot source size로 사용할 수 있으며
           persistent dpi/format은 output encoding default로 읽을 수 있다.
           current viewport는 Frontend surface가 이번 capture에 한 번 측정하며 Project target width/height로 저장하지 않는다.
           target export와 같은 limit/encoding/download completion/error/finally 규칙을 적용한다.
           성공 반환은 {outcome: saved, width: rasterWidth, height: rasterHeight, automaticHeight: False}이고 거부는 같은 rejected shape다.
           이미 캡처한 snapshot/viewport는 이 작업에서만 소비하고 다음 export의 원천으로 보관하지 않는다.
           result를 반환한다.
    """
    return result
