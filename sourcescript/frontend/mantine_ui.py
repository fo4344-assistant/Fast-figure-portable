"""
Fast Figure Source Script — Frontend / mantine-ui

하위 구현 검증 자료: ../../fast-figure.js, ../../fast-figure-ui.js, ../../Fast-figure.html.
Python 표기의 구현 명세이며 application runtime을 실행하는 모듈이 아니다.
"""

from math import isnan
from sourcescript.application.public_api import FastFigureApi
from sourcescript.application.adapter import appFSM, runLifecycleTask as runApplicationLifecycleTask

SLOT_CAPTION_UI_RULE = (
    "slot caption 추가/편집 UI는 selected slot의 slot.caption을 읽고 쓸 수 있게 노출하는 기능이다. "
    "slot caption을 global caption에 '추가'하는 command는 현재 slot captions를 text로 계산해 project-level global caption text에 명시적으로 삽입한다. "
    "이 UI 동작 때문에 slot caption을 project-level collection이나 persistent slotMode로 복제하지 않는다."
)


UI_LOCAL_STATE = {
    "asset collision": "Modal이 열려 있는 동안의 collision model과 Promise resolver",
    "confirmations": "slot reset, asset delete, move/trash confirmation target",
    "new folder": "Modal input 중인 folder name draft",
    "palette": "사용자가 apply하기 전 ColorInput draft",
    "layout selection": "layout Modal 안에서 merge/split 대상으로 선택한 slot id set",
    "print inputs": "width/height/dpi/format form draft",
    "caption editor target": (
        "global caption 또는 selected slot caption 중 현재 UI가 노출하는 target. "
        "project state에 slotMode로 저장하지 않는다."
    ),
    "sidebar geometry": "현재 session의 navbar width/collapsed/drag state",
    "pointer drag": "label/overlay resize 같은 pointer interaction의 component-local state",
    "settings overlay height": "opened settings overlay lifetime 동안만 유지되는 component-local height projection",
}


UI_LOCAL_STATE_RULE = (
    "UI local state는 입력 draft, Modal lifetime, pointer interaction처럼 component 범위에서만 사용한다. "
    "apply/commit이 필요한 값은 공식 mutation API로 보내고 project read 원천으로 승격하지 않는다."
)


MANTINE_COMPONENT_OWNERSHIP = {
    "FastFigureToolbar": "overlay toggle과 selected target 표시",
    "FastFigureDataActions": "asset import와 slot reset/delete action",
    "FastFigureImageEditor": "selected image preview/settings",
    "FastFigureProjectDataTree": "VFS tree display/selection/move/drop/menu",
    "FastFigureProjectActions": "project name과 FFPX import/export",
    "FastFigureGraphDataEditor": "CSV/header/graph object editing",
    "FastFigureGraphLayoutEditor": "chart title/global/axis settings",
    "FastFigureGraphPaletteActions": "graph object colors",
    "FastFigureGraphFileActions": "FFSX/Plotly import/export/editable toggle",
    "FastFigurePaletteActions": "persistent UI palette edit/apply/reset",
    "FastFigureStatusDebug": "status/debug telemetry display와 log action",
    "FastFigureReadmeOverlay": "README Modal",
    "FastFigureLabelOverlay": "label settings와 position interaction",
    "FastFigureCaptionOverlay": "caption settings/text interaction",
    "FastFigurePrintOverlay": "raster export form와 command",
    "FastFigureLayoutOverlay": "grid/style/zoom/merge/split interaction",
    "FastFigureDashboardFileDrop": "dashboard external file drop와 collision Modal 연결",
    "FastFigureShell": "Mantine AppShell, navbar resize/collapse, component composition",
}


DASHBOARD_DROP_FLOW = (
    "external file drop은 FastFigureDashboardFileDrop이 DOM target slotId를 얻고 slots.prepareFileDrop으로 "
    "target validity/runtime selection만 확정한 뒤 lifecycle 안에서 assets.importToSlot(file, slotId, choosePlan)을 호출한다. "
    "importToSlot의 Backend ASSETS_IMPORTED command만 asset/chart/image의 persistent candidate를 만들고 검증·commit한다. "
    "collision Modal의 resolver는 Application에서 완료하고 Backend에는 명시적 choice 값만 전달한다. "
    "finally에서 slots.finishFileDrop은 drag runtime state만 정리한다. "
    "project tree의 기존 asset drop은 assets.connectToSlot(path, kind, slotId)의 별도 explicit connection 경로를 사용한다."
)


DASHBOARD_DROP_LIFETIME_RULE = (
    "FastFigureDashboardFileDrop가 mounted이고 external file drop을 받을 수 있는 UI 상태인 동안 dashboard의 "
    "drop 수신 경로는 논리적으로 연속 1개여야 한다. ordinary frontend rerender, local state update, callback 교체는 "
    "유효한 한 번의 drop event를 listener 교체 공백 때문에 잃게 하거나 둘 이상의 import attempt로 중복 전달해서는 안 된다. "
    "component mount/unmount 또는 명시적으로 drop을 허용하지 않는 lifecycle/target 조건만 수신 가능성의 경계를 만든다. "
    "stable callback, delegated listener, framework event handler 등 이를 만족하는 구체 수명 관리 방식은 Source Code가 선택한다."
)


MANTINE_THEME_RULE = (
    "generic Button, ActionIcon, Input 크기와 Modal centered/Escape/outside-click 기본값은 "
    "fastFigureTheme에서 공통 정의한다. renderer surface CSS와 generic UI lifecycle을 분리한다. "
    "FastFigureLayoutOverlay, FastFigureLabelOverlay, FastFigureCaptionOverlay, FastFigurePrintOverlay의 outer Modal width는 "
    "각 component가 독립적으로 lg/xl/px 값을 소유하지 않고 하나의 Fast Figure 공통 maximum-size definition을 사용한다. "
    "그 공통 maximum은 현재 Mantine maximum size token보다 더 넓게 정의한다. concrete CSS length 또는 Mantine 구현 표현은 Source Code가 선택한다. "
    "네 settings overlay는 공통된 하단 세로 resize interaction을 제공하며 resize는 해당 overlay의 UI-local height만 변경하고 project/domain state를 변경하지 않는다. "
    "FastFigureReadmeOverlay처럼 목적이 다른 Modal은 이 네 설정 overlay의 공통 maximum 또는 resize interaction을 자동 상속하는 대상으로 간주하지 않는다."
)


LAYOUT_SELECTION_INTERACTION_RULE = (
    "Layout overlay의 slot 선택 집합은 해당 Modal lifetime 동안만 존재하는 UI-local state다. "
    "slot surface click은 해당 slot id를 toggle한다. preview grid의 slot 이외 배경과 preview 바깥 "
    "Layout Modal의 비-slot content 배경 click은 selection을 clear한다. "
    "slot click과 selection을 소비하는 merge/split control은 같은 interaction에서 parent background clear에 의해 "
    "선행 또는 상쇄되지 않아야 한다. grid shape 변경과 overlay close는 selection을 clear한다. "
    "이 선택/해제는 FFPX project object, layout persistent state, slot persistent state를 변경하지 않는다."
)


LAYOUT_PREVIEW_RULE = (
    "FastFigureLayoutOverlay의 preview는 layout slotStyle.aspect를 보존한다. 실제 rendered preview width 하나를 geometry 계산 기준으로 사용하고 "
    "preview height와 width-dependent gap/outerMargin/radius를 같은 기준에서 계산한다. overlay height resize는 preview width를 직접 변경하는 command가 아니며 "
    "preview 아래에 별도 preview-size drag 의미를 두지 않는다. viewport 또는 Modal content width 때문에 rendered width가 달라지면 height와 나머지 geometry도 "
    "같은 rendered width에서 다시 계산한다."
)


PROJECT_TREE_INTERACTION_RULE = (
    "FastFigureProjectDataTree는 current VFS/assets를 읽어 만든 tree projection이며 별도 project authority를 소유하지 않는다. "
    "trash subtree의 CSV/image도 일반 tree row로 선택할 수 있고, trash membership 자체를 이유로 row를 disabled 처리하지 않는다. "
    "fixed directory가 아닌 project node는 current VFS precondition을 만족하면 tree move source가 될 수 있으며 trash descendant도 일반 directory로 이동해 복구할 수 있다. "
    "tree move와 slot connection은 서로 다른 허용 조건을 사용한다. normal CSV/image는 explicit asset-to-slot connection source가 될 수 있지만 "
    "trash CSV/image와 directory는 slot connection source가 아니다. tree move와 menu move는 같은 planMove/move authority로 수렴하고, "
    "selection이나 drag 시작 자체가 slot connection 또는 original-location restore를 암묵적으로 수행하지 않는다."
)


EMPTY_CSV_UI_RULE = (
    "graph slot의 데이터 불러오기 영역에는 image slot의 빈 이미지 삽입 control과 같은 기능 위치에 빈 CSV 삽입 control을 제공한다. "
    "command는 assets.createEmptyCsv를 호출하여 일반 project CSV asset을 하나 생성하고 그 CSV를 현재 asset/graph CSV selection으로 선택한다. "
    "이 command 자체는 chart 또는 graph object를 만들지 않는다. 사용자가 그 CSV로 graph object를 추가할 때는 기존 graphs.addObject와 "
    "SLOT_DATA_CONNECTED/GRAPH_OBJECTS_REPLACED 경로를 그대로 사용한다. protected/default CSV 또는 별도 빈-그래프 mutation path를 만들지 않는다."
)


def readProjectAssetDisplay():
    """
    Return:
    - {nodes, slotRows}: 이번 표시에서 사용할 canonical asset node sequence와 visible slot sequence.
      directory node는 kind/path/name/children, asset node는 kind/path/id/name/asset을 갖는다.
      slot row는 id/row/col/rowSpan/colSpan/contentType/chart/imageId/assetDisplay를 갖는다.
      assetDisplay는 Backend가 해결한 {kind: empty/assets/embedded, assets: [{kind,id,name,path}]}다.

    변경: 이번 호출의 반환 record 구성.
    처리:
    1. FastFigureApi.assets.readTree()를 호출하여 canonical node sequence를 nodes로 받는다.
       nodes의 path와 children은 Backend가 구성한 directory·CSV·image 관계다.
    2. 이어서 FastFigureApi.layout.readState()를 호출하여 layout을 받는다.
       layout["visibleSlots"]는 같은 현재 project에서 계산된 visible slot 순서이며,
       각 slot의 assetDisplay에 slot 소유 chart·image와 연결 CSV를 해결한 표시 정보가 들어 있다.
    3. nodes와 layout["visibleSlots"]를 각각 반환 record의 nodes와 slotRows에 넣는다.
       FastFigureProjectDataTree는 nodes로 자산 행을, slotRows로 슬롯별 연결 자산 행을 표시한다.
       sequence 순서와 assetDisplay.kind가 empty 또는 embedded인 행도 유지한다.
    두 조회 사이에는 다른 이벤트 처리를 삽입하지 않는다. 조회 오류는 호출자에 전파한다.
    반환 record는 이번 표시 작업에서 소비한다.
    """
    nodes = FastFigureApi.assets.readTree()
    layout = FastFigureApi.layout.readState()
    return {"nodes": nodes, "slotRows": layout["visibleSlots"]}


def readAssetRowDisplay(node):
    """
    Args: node는 이번 canonical tree의 CSV 또는 image node다.
    Return: referenceCount와 CSV인 경우 rowCount를 갖는 표시 record.
    변경: 이번 행의 표시 record 구성.
    처리: canonical path의 공식 참조 수를 조회한다. CSV는 저장된 rows에서 header 수를 뺀다.
    header 수의 숫자 변환 실패와 NaN은 기존 표시값 0으로 처리한다. 조회 오류는 전파한다.
    """
    target = FastFigureApi.assets.readDeletionTarget(node["path"])
    display = {"referenceCount": 0 if target is None else target["referenceCount"]}
    if node["kind"] == "csv":
        try:
            headerLines = float(node["asset"].get("headerLines", 0))
        except (TypeError, ValueError):
            headerLines = 0
        if isnan(headerLines):
            headerLines = 0
        display["rowCount"] = max(0, len(node["asset"]["rows"]) - headerLines)
    return display


def changeLayoutGridDimension(dimension, value):
    """
    layout 행/열 입력 이벤트의 처리 절차. dimension은 rows 또는 cols이며 그 외는 입력 오류다.
    1. 이벤트 시점에 FastFigureApi.layout.readState()를 호출해 current gridRows/gridCols를 읽는다.
       이전 render의 layout, input DOM, 별도 mirror는 companion/fallback의 원천이 아니다.
    2. 비어 있거나 숫자로 변환할 수 없거나 non-finite인 편집 입력은 같은 read의 해당 dimension을 유지한다.
       유효 숫자는 기존 grid 입력 범위 1..8로 제한한다. 정수 여부 등 최종 유효성은 기존 Backend 검증이 담당한다.
    3. rows 편집이면 새 rows와 current gridCols, cols 편집이면 current gridRows와 새 cols를 구성한다.
    4. 이 read→입력 구성→FastFigureApi.layout.setGrid(rows, cols)는 await/외부 callback/다른 project command 없이
       같은 동기 입력 처리에서 연속 실행한다. 별도 snapshot/session에 보관했다가 나중에 command로 보내지 않는다.
       Application dispatch와 Backend candidate 계산/검증도 이 경로에서는 동기이며 대기 중 project 변경이 개입하지 않는다.
       setGrid의 명시 전체 크기 계약과 Backend의 current-source 재확인·재계산·한 번 commit은 그대로 유지한다.
    5. setter의 거부 False와 원래 예외를 그대로 처리하며 성공처럼 표시하거나 별도 resize/commit을 하지 않는다.
       grid shape 변경과 overlay close의 local selection clear는 기존 interaction 규칙대로 수행한다.
    """
    return "공식 setGrid의 결과 또는 원래 실패"


def handleDebugToggle():
    """
    클릭 이벤트 시 renderer runtime owner의 readDebugEnabled()로 현재 boolean을 읽고,
    await/외부 callback 없이 그 반전을 기존 setDebugEnabled(value)에 전달한다.
    telemetry는 버튼의 label/pressed 표시만 담당하고 반전 입력의 권위가 아니다.
    setDebugEnabled가 owner를 변경한 뒤 telemetry를 publish하며 UI는 그 단방향 projection을 표시한다.
    별도 debug mirror, Project mutation, toggle command/API 또는 두 번째 publish를 만들지 않는다.
    명시 bool setter를 직접 사용하는 다른 caller의 계약을 바꾸지 않는다. 원래 오류는 caller에 전파한다.
    """
    return "runtime owner의 공식 setter 결과"


def subscribeAppState(onStoreChange):
    """
    Return: 이번 listener 등록을 해제하는 함수.
    변경: Application 경계를 통해 Frontend listener를 등록한다.
    처리: 상태와 revision이 확정된 뒤 도착하는 변경 알림을 React에 전달한다.
    """
    return appFSM.subscribe(onStoreChange)


def getAppStateSnapshot():
    """
    Return: 현재 Frontend revision 숫자.
    변경: 호출 범위의 읽기 결과 구성.
    처리: 공식 현재 읽기에서 revision을 취득한다. 같은 revision은 같은 구독 현재값이다.
    """
    return appFSM.readState()["revision"]


def useAppState():
    """
    Return: 이번 render에서 사용할 Frontend 읽기전용 record.
    변경: React가 관리하는 이번 component의 외부-store 구독.
    처리: React.useSyncExternalStore(subscribeAppState, getAppStateSnapshot)의 구독·재확인 계약을 사용한다.
    getAppStateSnapshot의 revision 숫자가 달라지면 React가 render를 요청한다.
    구독 연결 뒤 appFSM.readState()로 이번 render의 현재 상태를 읽는다.
    반환 record는 화면 표시·버튼 사용 가능 여부·로그에 소비한다.
    """
    React.useSyncExternalStore(subscribeAppState, getAppStateSnapshot)
    return appFSM.readState()


def addSelectedGraphObject():
    """
    입력: FastFigureGraphDataEditor의 객체 추가 버튼 클릭 또는 Enter 활성화.
    처리:
    1. appFSM.readState()에서 이번 입력 시점의 lifecycle과 selectedSlotId를 읽는다.
       lifecycle이 ready이고 selectedSlotId가 있으면 그 값을 slotId로 사용한다.
       그 외에는 None을 반환한다. 식별자 0도 선택된 슬롯이다.
    2. FastFigureApi.graphs.readData()를 호출하고 반환 record의 currentCsv와 chart를 읽는다.
       currentCsv는 Frontend의 assetSelection이 csv일 때 assetPath로 Backend가 해결한 CSV다.
       chart는 같은 선택 슬롯의 content.chart로 Backend가 해결한 소유 chart다.
    3. currentCsv가 없거나 chart.editor.editable이 False이면 None을 반환한다.
       chart가 없는 슬롯은 첫 graph object 생성 대상으로 사용할 수 있다.
    4. FastFigureApi.graphs.addObject(slotId, currentCsv["id"])를 한 번 호출한다.
       이 이벤트 안에서 두 공식 읽기와 명령 호출을 동기적으로 연속 수행한다.
       Application의 graphEditorAdd와 Backend 명령이 현재 대상·CSV를 재확인하고
       첫 chart 생성 또는 기존 chart의 object 추가를 한 번 반영한다.
    5. 추가 후 chart 또는 미반영 결과를 그대로 반환한다. 조회·명령 오류는 호출자에 전파한다.
    변경: 기존 SLOT_DATA_CONNECTED 또는 GRAPH_OBJECTS_REPLACED를 통한 대상 chart와 slot 참조.
    반환: graphs.addObject의 결과 또는 위 조건에 따른 None.
    """
    current = appFSM.readState()
    slotId = current["selectedSlotId"]
    if current["lifecycle"] != "ready" or slotId is None:
        return None
    data = FastFigureApi.graphs.readData()
    currentCsv = data["currentCsv"]
    if currentCsv is None:
        return None
    chart = data["chart"]
    if chart is not None and chart["editor"]["editable"] is False:
        return None
    return FastFigureApi.graphs.addObject(slotId, currentCsv["id"])


def importSelectedSlotFile(file):
    """
    입력: FastFigureGraphFileActions의 파일 선택 완료가 전달하는 file. 취소는 None이다.
    처리:
    1. file이 None이면 None을 반환한다.
    2. 파일을 전달받은 이 호출에서 appFSM.readState().selectedSlotId를 읽어 slotId로 삼는다.
       선택 해제면 None을 반환한다. 식별자 0도 불러오기 대상이다.
    3. FastFigureApi.graphs.importFile(slotId, file)을 한 번 호출한다.
       Application은 이 slotId와 읽은 파일 바이트를 SLOT_CHART_IMPORTED에 전달한다.
       비동기 파일 읽기 도중 선택이 바뀌어도 이 불러오기에서 사용하는 slotId를 유지한다.
    4. Backend가 현재 project에서 slotId의 visible slot을 찾고 파일을 해석한다.
       FFSX는 applyFfsxSlot, Plotly JSON은 parsePlotlyToEditor로 candidate를 구성한다.
       필요한 자산과 소유 chart를 같은 project candidate로 검증하여 한 번 반영한다.
       대상 소멸 또는 파일 해석·검증 오류는 기존 실패 경로로 반환한다.
    5. Application의 기존 lifecycle 처리가 완료 또는 오류 뒤 ready로 복귀한다.
       이 절차는 그 chart·미반영 결과를 반환하고 원래 오류를 호출자에 전파한다.
    변경: 명시한 slotId가 소유하는 chart와 그 파일을 적용하는 데 필요한 project asset.
    반환: 기존 graphs.importFile의 결과 또는 취소·선택 해제의 None.
    """
    if file is None:
        return None
    slotId = appFSM.readState()["selectedSlotId"]
    if slotId is None:
        return None
    return FastFigureApi.graphs.importFile(slotId, file)


def setSelectedGraphEditable(editable):
    """
    입력: editable은 FastFigureGraphFileActions에서 사용자가 입력한 편집 가능 여부 boolean이다.
    처리:
    1. appFSM.readState().selectedSlotId를 이번 slotId로 읽는다. 선택 해제면 None을 반환한다.
    2. FastFigureApi.graphs.readData()["chart"]로 그 슬롯이 소유하는 현재 chart를 얻는다.
       공식 조회는 slot.content.chart를 activeProject.charts에서 해결한다. chart가 없으면 None을 반환한다.
    3. 같은 동기 입력 처리에서 FastFigureApi.graphs.setEditable(slotId, chart["id"], editable)을 한 번 호출한다.
       graphEditorSetEditable이 세 인자를 CHART_MODEL_REPLACED에 전달하고 Backend가 현재 소유 관계를 검증한다.
    4. Backend의 convertImportedChartToEditable 규칙에 따라 imported conversionRows와 object가 있으면
       실제 CSV와 csvId 참조를 같은 candidate에 구성한다. conversionRows 또는 object가 없으면
       그 조건에 맞게 기존 참조·빈 object를 유지한다. editable 변경과 필요한 자산을 한 번 반영한다.
    5. 최종 editable boolean 또는 미반영 결과를 반환한다. 조회·명령 오류는 호출자에 전파한다.
    변경: 해당 chart.editor.editable과 기존 변환 규칙에 따라 필요한 project CSV·object 참조.
    반환: 기존 setEditable의 결과 또는 선택·chart 없음의 None.
    """
    slotId = appFSM.readState()["selectedSlotId"]
    if slotId is None:
        return None
    chart = FastFigureApi.graphs.readData()["chart"]
    if chart is None:
        return None
    return FastFigureApi.graphs.setEditable(slotId, chart["id"], editable)


def updateSelectedGraphLayout(values):
    """
    입력:
    values는 FastFigureGraphLayoutEditor에서 이번에 입력한 설정값을 담은 부분 record다.
    구조는 sourcescript/backend/graphs.py의 chartModel["editor"] 중 title과 globalSettings를 따른다.
    globalSettings의 항목은 같은 파일의 globalSettings 정의를 따르고,
    globalSettings["axes"]의 축 이름은 그 정의의 axes key,
    각 축 안의 설정 이름은 같은 파일의 axisSettings key를 사용한다.

    values에 들어 있는 key와 중첩 위치로 변경 대상을 결정한다.
    - {"title": "측정 결과"}는 chart.editor.title에 새 제목을 입력한 요청이다.
    - {"globalSettings": {"showLegend": False}}는 chart.editor.globalSettings.showLegend를 끈 요청이다.
    - {"globalSettings": {"axes": {"xBottom": {"min": 0}}}}는
      chart.editor.globalSettings.axes.xBottom.min에 최솟값 0을 입력한 요청이다.
    각 요청에는 이번에 입력한 항목과 새 값만 담는다. 생략한 항목은 현재 값을 유지한다.
    값의 자료형과 빈 값의 의미도 globalSettings와 axisSettings의 정의를 따른다.

    처리:
    1. appFSM.readState()에서 이번 입력 시점의 lifecycle과 selectedSlotId를 읽는다.
       lifecycle이 ready이고 selectedSlotId가 있으면 이를 slotId로 사용한다.
       선택 해제 또는 busy 상태면 None을 반환하고 이 입력 처리를 끝낸다. slotId 0은 유효하다.
    2. FastFigureApi.graphs.readData()에서 chart를 얻는다. 이 공식 읽기는 현재 선택 참조로
       sourcescript/backend/project_state.py의 activeProject.slots에서 visible slot을 찾고,
       slot["content"]["chart"]의 id로 activeProject.charts에서 소유 chart를 찾는다.
       chart가 없으면 None을 반환한다.
    3. FastFigureApi.graphs.updateLayout(slotId, chart["id"], values)를 한 번 호출한다.
       선택 참조 읽기, chart 조회, 이 호출을 같은 동기 입력 처리에서 연속 수행한다.
    4. 이 API의 sourcescript/application/public_api/graphs.py::graphEditorUpdateLayout은
       values를 CHART_LAYOUT_CHANGED의 settings 인자로 전달한다.
       Backend는 현재 slotId와 chartId의 소유 관계를 다시 확인한다.
       values.title은 candidate chart.editor.title에 적용하고, values.globalSettings는
       candidate의 현재 globalSettings와 항목별로 합친다. axes는 축 이름과 설정 이름까지
       내려가 새 값이 있는 항목을 합치므로 다른 축과 생략한 설정은 유지된다.
       normalizeGlobalSettings와 normalizeAxisSettings가 입력값을 해석하고,
       같은 candidate의 graph를 재계산한 뒤 project 검증을 거쳐 한 번 반영한다.
    5. API가 반환하는 반영 후 layout 또는 미반영 결과를 그대로 반환한다.
       조회 및 명령 오류는 호출자에 전파한다.

    반환: graphs.updateLayout의 결과. 선택·chart 없음 또는 busy이면 None.
    변경: 기존 CHART_LAYOUT_CHANGED가 반영하는 해당 slot 소유 chart의 editor 설정과 graph.
    """
    current = appFSM.readState()
    slotId = current["selectedSlotId"]
    if current["lifecycle"] != "ready" or slotId is None:
        return None
    chart = FastFigureApi.graphs.readData()["chart"]
    if chart is None:
        return None
    return FastFigureApi.graphs.updateLayout(slotId, chart["id"], values)


def useProjectAssetImportCollision():
    """
    Return:
    - choosePlan:
      file/directory에 대해 user choice를 받아 core import plan을 반환하는 UI-local async function.
    - modal:
      collision이 있을 때만 표시하는 Mantine Modal.

    변경:
    - project state를 직접 변경하지 않는다.
    - local collision/resolver state만 변경한다.

    처리:
    1. core collisionModel을 먼저 계산한다.
    2. available이면 UI 없이 core resolveImportPlan을 호출한다.
    3. user choice가 필요하면 Modal lifetime 동안 resolver를 보유한다.
    4. rename/replace 버튼처럼 명시적 choice를 받은 경우에만 core resolveImportPlan으로 최종 plan을 계산한다.
    5. Escape, outside click, close button 또는 component cleanup처럼 명시적 choice 없이 Modal이 닫히면 cancel로 완료한다.
       cancel은 import plan을 만들지 않고 pending resolver/local collision state만 정리하며 project/domain mutation을 발생시키지 않는다.
    """
    return "component-local collision chooser와 Modal"


def runLifecycleTask(lifecycle, eventName, task):
    """
    Return:
    - task result 또는 UI error 처리 결과.

    변경:
    - Application boundary가 전달하는 Frontend lifecycle state.
    - task가 호출하는 공식 Backend command에 따른 domain state.

    처리:
    Mantine Frontend는 task callback을 interfaceFSM에 직접 넘기지 않고 runApplicationLifecycleTask에 위임한다.
    Application boundary가 LIFECYCLE_START -> task -> COMPLETE/FAILED 순서를 소유한다.
    UI layer는 error를 debug telemetry에 기록할 수 있지만 별도 domain rollback 규칙을 만들지 않는다.
    """
    return runApplicationLifecycleTask(lifecycle, eventName, task)


def FastFigureApp():
    """
    Return:
    - uiTree:
      MantineProvider 아래 FastFigureShell.

    변경:
    - project state를 render 자체에서 변경하지 않는다.

    처리:
    persistent appearance palette의 이번 read copy를 FastFigureApi.appearance.readPalette에서 읽는다.
    Backend default를 재정의하거나 UI draft와 병합하지 않는다. 매 render는 current read를 사용하고 장기 palette mirror를 만들지 않는다.
    theme.colors.ffui의 10개 shade는 모두 uiColor, primaryColor=ffui, color scheme=light다.
    body=uiBackgroundColor, text/default-color/primary-light-color=fontColor, default=uiSurfaceColor,
    default-border/primary-filled=uiColor, dimmed=uiMutedColor, placeholder=uiSubtleColor,
    disabled/disabled-border=uiDisabledBgColor, disabled-color=uiDisabledTextColor를 Mantine CSS 변수로 투영한다.
    default-hover는 sRGB color-mix(uiColor 12%, uiSurfaceColor), filled-hover는 sRGB mix(uiColor 75%, #64748B),
    primary-light/light-hover는 sRGB mix(uiColor 18%/24%, transparent)다.
    uiColor의 각 hex channel을 0..1로 나누고 c<=0.04045이면 c/12.92, 아니면 ((c+0.055)/1.055)**2.4로 선형화한다.
    luminance=0.2126*r+0.7152*g+0.0722*b이며 >0.179이면 primary contrast=#000000, 그 외 #FFFFFF다.
    ffui filled/filled-hover/light/light-hover/light-color/contrast 변수는 위 primary 변수의 alias일 뿐 별도 값 authority가 아니다.
    theme shadow의 black-alpha 색만 같은 alpha의 uiShadowColor/transparent sRGB mix로 바꾸며 shadow geometry는 유지한다.
    paperColor는 graph paper, fontColor는 graph ink에도 쓰지만 UI surface/background와 graph paper를 같은 field로 합치지 않는다.
    FastFigureShell을 하나의 기존 React root에 render한다.
    """
    uiTree = "Fast Figure Mantine application tree"
    return uiTree


def FastFigureShell():
    """
    Return:
    - shell:
      header/navbar/main과 overlay component를 포함한 AppShell.

    변경:
    - navbar width/collapsed 같은 session-local UI state.
    - renderer host layout CSS variable.

    처리:
    sidebar resize는 renderer geometry에 반영하고 plot resize를 요청한다.
    domain/project 값을 별도 local store로 복제하지 않는다.
    """
    shell = "Mantine AppShell tree"
    return shell
