"""
Fast Figure Source Script — CSV data, chart model, graph objects and Plotly rendering

하위 구현 검증 원천:
- ../fast-figure.js
  dataTable/columnDefinitions/graphDataSelection,
  chart model validation/conversion,
  graphEditor* command,
  traces/layout/rebuildEditableGraph,
  Plotly import/export.
- ../vendor/plotly.min.js
  최종 graph rendering library.

참조 Source Script:
- project_state.py
- project_efsm.py
- application_fsm.py
- assets_files.py
"""

from project_state import activeProject, getProjectCsv, getChart
from application_fsm import dispatchProjectCommand

GRAPH_FILE_LOGICAL_RESPONSIBILITIES = {
    "Backend": (
        "CSV column/chart/graph-object normalization, reference validation, Plotly semantic conversion과 candidate calculation"
    ),
    "Application boundary": (
        "graph editor public operation에서 Frontend-selected slot/chart/csv reference를 explicit input으로 받아 "
        "Project EFSM command/query로 전달하는 wrappers"
    ),
}

GRAPH_BOUNDARY_RULE = (
    "Backend graph calculation은 interfaceFSM/selectedSlotId를 직접 읽지 않는다. "
    "selected slot/chart가 필요한 public operation은 Application boundary가 Frontend reference를 가져와 Backend에서 current authority로 검증한 뒤 "
    "slotId/chartId/csvId 같은 explicit reference를 candidate/command input에 포함한다. "
    "dispatchProjectCommand를 호출하는 co-located function은 Backend domain function이 아니라 Application-boundary wrapper다."
)


axisSettings = {
    "min": "optional numeric lower bound; empty이면 auto",
    "max": "optional numeric upper bound; empty이면 auto",
    "tick": "increment mode에서 사용할 optional numeric interval",
    "tickMode": "plotly 또는 increment; log scale에서는 plotly만 사용",
    "minorTicks": "log axis의 dense/minor tick 표시 여부",
    "notation": "none, e, power 중 하나",
    "scaleType": "linear 또는 log",
    "divide": "trace numeric values에 적용할 non-zero numeric divisor",
    "title": "axis title text",
    "titleSize": "axis title font size",
    "lineWidth": "axis line width",
    "showGrid": "grid line 표시 여부",
    "visible": "axis 자체 표시 여부",
    "showValues": "tick label 표시 여부",
    "fontSize": "axis tick font size",
}

globalSettings = {
    "showLegend": "legend 표시 여부",
    "showTitle": "chart title 표시 여부",
    "showZeroLine": "zero line 표시 여부",
    "graphFontFamily": "graph 공통 font family",
    "titleFontSize": "chart title font size 또는 renderer default",
    "legendFontSize": "legend font size 또는 renderer default",
    "axes": {
        "xBottom": "bottom x axisSettings",
        "xTop": "top x axisSettings",
        "yLeft": "left y axisSettings",
        "yRight": "right y axisSettings",
    },
}

GRAPH_EMPTY_RULE = (
    "editable chart의 editor.objects는 0개 이상이다. objects가 0개이면 graph.data도 빈 projection이 될 수 있으며 "
    "chart 자체와 layout/title/axis settings는 계속 유효하다."
)

PLOTLY_IMPORT_RULE = (
    "원본 Plotly figure는 non-editable imported representation으로 손실 없이 보존하고, "
    "Fast Figure가 이해하는 trace/axis subset만 editor conversion view로 계산한다. "
    "editable 전환 전에는 conversion rows가 project CSV authority가 아니다."
)

graphObject = {
    "csvId": "activeProject.csvFiles의 CSV reference id",
    "x": "C1, C2 형식의 x column identifier",
    "y": "C1, C2 형식의 y column identifier",
    "xAxisSide": "bottom 또는 top",
    "yAxisSide": "left 또는 right",
    "type": "scatter, markers, lines+markers, bar, hidden 중 하나",
    "color": "현재 graph object color",
    "legendName": "legend에서 사용할 optional 이름",
    "lineWidth": "현재 허용 범위 0.1..20",
    "lineDash": "solid, dot, dash, dashdot 중 하나",
    "markerSymbol": "현재 지원 marker symbol",
    "markerSize": "현재 허용 범위 1..40",
    "barOpacity": "현재 허용 범위 0.05..1",
    "barLineWidth": "현재 허용 범위 0..10",
    "plotlyTrace": "imported Plotly trace에서 보존할 확장 속성의 optional copy",
}

chartModel = {
    "id": "activeProject.charts 안에서 유일한 양의 정수 chart id",
    "editor": {
        "objects": "graphObject 목록; editable chart의 data reference 원천",
        "editable": "Fast Figure editor로 수정 가능한지 여부",
        "globalSettings": "globalSettings 구조의 title/legend/font/4개 axis 설정",
        "title": "chart title",
        "plotlyExtensions": "imported Plotly layout/config 중 editor가 직접 소유하지 않는 보존 영역",
    },
    "graph": {
        "data": "현재 chart에서 만들어진 Plotly trace projection",
        "layout": "현재 chart에서 만들어진 Plotly layout projection",
        "config": "Plotly config",
        "frames": "imported Plotly frames",
        "imported": "원본 Plotly figure를 보존해야 할 때의 representation",
    },
}

AXIS_REFERENCE_RULE = (
    "graph object의 xAxisSide/yAxisSide를 globalSettings.axes의 실제 axis 설정에 연결한다. "
    "trace에는 Plotly x/x2 및 y/y2 reference를 계산해 사용한다."
)

GRAPH_PROJECTION_RULE = (
    "chart.graph.data/layout은 project CSV와 chart.editor 설정에서 다시 만들 수 있는 renderer projection이다. "
    "editable chart에서 graph.editor.objects와 project CSV reference가 편집 의미의 원천이다."
)


def dataTable(data):
    """
    Return:
    - matrix:
      모든 row가 값 배열인 2차원 table.

    변경:
    - 없음.

    처리:
    row-array 입력은 각 값을 보존해 table로 정규화한다.
    object-array 입력은 전체 key union을 header로 만들고 같은 column 순서로 row를 만든다.
    그 외 또는 빈 입력은 실패한다.
    """
    matrix = "정규화된 2차원 table"
    return matrix


def columnDefinitions(table, headerLines):
    """
    Return:
    - columns:
      각 column의 id(C1...), index, optional header name, 표시 label.

    변경:
    - 없음.

    처리:
    모든 row 중 최대 폭을 column 수로 사용한다.
    headerLines가 1 이상이면 마지막 header row의 값을 column name으로 사용한다.
    """
    columns = "table column 정의 목록"
    return columns


def graphDataSelection(matrix, headerLines, editor):
    """
    Return:
    - selection:
      x와 y column identifier.

    변경:
    - 없음.

    처리:
    기존 editor.x/editor.y가 현재 table에 유효하면 유지한다.
    아니면 numeric data가 실제로 존재하는 첫 column을 x로 우선 선택하고,
    x와 다른 numeric 또는 다른 유효 column을 y로 선택한다.
    """
    selection = {"x": "선택된 x column id", "y": "선택된 y column id"}
    return selection


def connectDataToSlotModel(slot, data, sourceName, projectCsv):
    """
    Return:
    - candidate:
      target slot에 CSV graph object가 연결된 candidate slot/chart change.

    변경:
    - 없음. 이 함수 자체는 authoritative project를 변경하지 않는다.

    처리:
    1. slot과 projectCsv reference를 current state에서 resolve한다.
    2. existing owning chart가 있으면 그 chart copy에 새 graph object를 추가한다.
    3. chart가 없으면 next chart id를 사용하는 새 chart candidate와 slot.chart candidate를 만든다.
    4. graph object는 실제 projectCsv id와 유효한 column selection만 참조한다.
    5. candidate chart projection을 계산하고 project-level mutation action이 검증/commit하도록 반환한다.
    """
    candidate = "CSV가 연결된 slot/chart candidate"
    return candidate


GRAPH_CSV_SELECTION_RULE = (
    "현재 CSV 선택은 Frontend FSM의 assetSelection/assetPath가 session authority이며 Backend persistent state가 아니다. "
    "Application boundary가 graph public operation 호출 시 그 selected CSV path/id reference를 explicit input으로 받아 Backend에서 current authority로 검증한다. "
    "graph object의 csvId는 해당 object가 소유하는 persistent data reference이며 selection 대체 원천이 아니다. "
    "graph object 선택 시 Frontend event로 참조 CSV selection을 갱신할 수 있으나 단순 CSV 선택은 기존 object.csvId를 변경하지 않는다. "
    "기존 object의 x/y 편집에 필요한 열은 해당 object.csvId에서 Backend query로 resolve하며 current selected CSV 열과 혼용하지 않는다."
)

EMPTY_CSV_GRAPH_RULE = (
    "assets.createEmptyCsv로 생성한 빈 CSV도 다른 project CSV와 동일한 csvId reference 대상이다. "
    "생성 command는 CSV를 선택 상태로 만들 뿐 chart/object를 자동 생성하지 않는다. "
    "사용자가 오브젝트 추가를 실행하면 graphEditorAdd는 그 현재 선택 CSV id를 resolve하여 기존 SLOT_DATA_CONNECTED 또는 "
    "GRAPH_OBJECTS_REPLACED 경로로 graph object를 생성한다. 빈 CSV 전용 chart type, protected object, fake default object를 만들지 않는다."
)


def graphEditorAdd(slotId, csvId):
    """
    Return:
    - chart:
      object 추가 후 chart.

    변경:
    - GRAPH_OBJECTS_REPLACED 또는 SLOT_DATA_CONNECTED 공식 event를 통해 chart/slot state를 변경한다.

    처리:
    Application boundary가 받은 explicit slotId와 csvId를 Backend current authority에서 resolve한다.
    target slot에 chart가 없으면 SLOT_DATA_CONNECTED로 첫 chart/object를 만든다.
    chart가 있으면 owning chart id와 current object 목록을 Backend에서 resolve해 새 base graph object를 추가하고 GRAPH_OBJECTS_REPLACED로 commit한다.
    """
    event = "SLOT_DATA_CONNECTED if target slot has no chart else GRAPH_OBJECTS_REPLACED"
    return dispatchProjectCommand(event, {"slotId": slotId, "csvId": csvId, "objects": "candidate objects"})


def graphEditorCommit(chartId, objects, index):
    """
    Return:
    - chart:
      object list commit 후 chart.

    변경:
    - GRAPH_OBJECTS_REPLACED event
    - graph object selection state
    - editable graph renderer projection

    처리:
    object array 자체를 UI/local state의 장기 원천으로 두지 않는다.
    0개 object도 유효한 candidate로 받아 normalize/reference validation 후 GRAPH_OBJECTS_REPLACED로 chart SoT에 commit한다.
    fake default object를 복구하지 않는다.
    interface object selection은 ProjectMutationResult 이후 별도 reconciliation한다.
    """
    return dispatchProjectCommand(
        "GRAPH_OBJECTS_REPLACED",
        {"chartId": chartId, "objects": objects, "selectedIndexHint": index},
    )


def graphEditorObjectValues(chartId, index, values):
    """
    Return:
    - chart:
      지정 object의 허용 field를 정규화해 commit한 chart.

    변경:
    - 최종적으로 graphEditorCommit(chartId, ...)을 통해 explicit chart object state를 변경한다.

    처리:
    1. Application wrapper는 chartId/index와 새 values만 GRAPH_OBJECTS_REPLACED command input으로 전달한다.
       아래 계산은 Backend command의 one-object edit candidate branch가 수행한다. Frontend objects projection 전체를 되돌려 보내지 않는다.
    2. Backend current authority에서 chartId/index와 editable object를 resolve한다. 없으면 state 변경 없이 거부한다.
    3. values.csvId가 current project에서 유효한 CSV로 resolve되면 그 CSV를 사용한다. 없거나 invalid면 기존 object.csvId를 resolve한다.
       둘 다 resolve되지 않으면 거부한다. 요청 CSV로 reference를 바꾸는 기존 기능을 없애지 않는다.
    4. 선택한 CSV의 headerLines/rows로 columns와 base object defaults를 계산한다. 새 x/y가 유효하면 사용하고,
       아니면 기존 x/y가 그 CSV에 유효할 때 유지하며, 둘 다 아니면 해당 CSV의 기본 column을 사용한다.
    5. type/axis/color/style enum과 numeric range는 기존 graph-object 규칙으로 검증/제한한다.
       current object array에서 index object만 바꾸고 다른 object/reference와 Frontend current CSV selection은 유지한다.
    6. whole-project candidate를 검증한 뒤 GRAPH_OBJECTS_REPLACED로 한 번 commit한다.
       post-commit requestedIndex는 index-only Frontend input이며 CSV selection을 강제로 변경하지 않는다.
       graphEditorCommit(chartId, objects, index)는 Backend 내부에서 이미 계산한 candidate objects를 전달하는 wrapper에만 사용하고
       Frontend read projection을 일반 object replacement authority로 취급하지 않는다.
    """
    return dispatchProjectCommand(
        "GRAPH_OBJECTS_REPLACED",
        {"chartId": chartId, "index": index, "values": values, "selectedIndexHint": index},
    )


def graphEditorSetEditable(slotId, chartId, editable):
    """
    Return:
    - editable:
      최종 editable 상태.

    변경:
    - 선택 chart.editor.editable.
    - imported Plotly chart를 editable로 바꿀 때 project CSV와 object reference를 생성할 수 있다.

    처리:
    imported Plotly에 conversion graph object가 하나 이상 있고 아직 project CSV가 없으면
    보존된 conversion rows에서 실제 project CSV candidate를 만든다.
    object csvId를 그 CSV와 연결해 whole-project candidate를 만들고 CHART_MODEL_REPLACED 한 command로 commit한다.
    이 command는 필요한 CSV 생성/next-id/reference remap을 chart editable 변경과 같은 candidate에 포함한다.
    zero-trace/zero-object imported figure는 CSV를 만들지 않고 empty editable chart로 전환할 수 있다.
    """
    candidate = convertImportedChartToEditable("explicit chartId") if editable else "editable flag candidate"
    return dispatchProjectCommand(
        "CHART_MODEL_REPLACED",
        {"slotId": slotId, "chartId": chartId, "candidate": candidate},
    )


def graphEditorSetHeaderLines(csvId, headerLines):
    """
    변경:
    - resolved CSV의 persistent headerLines.

    처리:
    current CSV를 id로 resolve하고 같은 id/path/bytes/rows를 유지한 replacement candidate를 만든 뒤
    DATA_OBJECT_REPLACED로 commit한다.
    """
    return dispatchProjectCommand(
        "DATA_OBJECT_REPLACED",
        {"csvId": csvId, "headerLines": headerLines},
    )


def graphEditorUpdateLayout(slotId, chartId, values):
    """
    변경:
    - selected chart의 persistent title/global/axis settings.

    처리:
    normalized candidate를 CHART_LAYOUT_CHANGED로 commit한다.
    Plotly graph layout은 commit된 chart settings에서 다시 계산하는 projection이다.
    """
    return dispatchProjectCommand(
        "CHART_LAYOUT_CHANGED",
        {"slotId": slotId, "chartId": chartId, "settings": values},
    )


def graphEditorApplyPalette(chartId, colors):
    """
    변경:
    - selected chart.editor.objects의 color fields.

    처리:
    current objects에서 color-only candidate를 계산하고 GRAPH_OBJECTS_REPLACED로 commit한다.
    """
    return dispatchProjectCommand("GRAPH_OBJECTS_REPLACED", {"chartId": chartId, "colors": colors})


def tracesSingle(objectView):
    """
    Return:
    - plotlyTraces:
      하나의 graph object와 CSV rows에서 계산한 Plotly trace 목록.

    변경:
    - 없음.

    확정 계산:
    - x/y divide 값으로 numeric data를 나눈다.
    - reciprocal axis는 0을 제외하고 1/value를 사용한다.
    - log axis는 0 이하 값을 제외한다.
    - bar/scatter/hidden 의미와 line/marker style 범위를 보존한다.
    """
    plotlyTraces = "graph object에서 파생된 Plotly trace 목록"
    return plotlyTraces


def traces(chart):
    """
    Return:
    - plotlyTraces:
      chart.editor.objects 전체에서 계산한 Plotly trace 목록.

    변경:
    - 없음.

    참조:
    각 object.csvId는 getProjectCsv를 통해 authoritative CSV를 다시 resolve한다.
    object에 저장된 row copy를 일반 원천으로 사용하지 않는다.
    """
    plotlyTraces = "chart의 Plotly data projection"
    return plotlyTraces


def rebuildEditableGraph(chart):
    """
    변경:
    - chart.graph.data/layout/config renderer projection.

    처리:
    chart.editor와 referenced project CSV에서 traces/layout을 다시 계산한다.
    objects가 비어 있으면 trace projection은 빈 배열이고 layout/global settings는 계속 계산한다.
    project/domain 의미를 Plotly renderer 형식으로 투영한다.
    """
    return chart


def importSelectedGraphFile(slotId, file):
    """
    변경:
    - 선택 slot의 chart model과 package가 필요로 하는 CSV asset.

    처리:
    FFSX면 ffsxReadSlot 검증 결과로 target slot candidate를 만든다.
    Plotly JSON이면 parsePlotlyToEditor로 non-editable imported chart candidate를 만든다.
    두 경우 모두 target slot이 새 chart를 유일하게 소유하는 whole-project candidate를 검증한 뒤
    SLOT_CHART_IMPORTED 한 command로 commit한다.
    """
    return dispatchProjectCommand("SLOT_CHART_IMPORTED", {"slotId": slotId, "file": file})


def chartFigure(chart):
    """
    Return:
    - figure:
      Plotly JSON export에 사용할 data/layout/config/frames representation.

    변경:
    - 없음.

    처리:
    editable chart는 현재 editor/CSV에서 figure를 계산한다.
    imported non-editable chart는 보존된 Plotly semantics를 유지한다.
    """
    figure = "export 가능한 Plotly figure"
    return figure

def normalizeAxisSettings(axis, key):
    """
    Return:
    - normalized:
      axisSettings schema를 만족하는 axis 설정.

    변경:
    - 없음.

    처리:
    bottom x와 left y는 기본 visible, top x와 right y는 기본 hidden이다.
    enum과 numeric/empty field를 정규화한다.
    divide는 0이 될 수 없다.
    log scale에서는 increment tick mode를 허용하지 않는다.
    """
    normalized = "정규화된 axis settings"
    return normalized


def normalizeGlobalSettings(settings):
    """
    Return:
    - normalized:
      globalSettings schema와 네 axis를 모두 가진 설정.

    변경:
    - 없음.

    처리:
    missing value는 project graph default로 채우고 imported extension과 직접 소유 field를 분리한다.
    """
    normalized = "정규화된 graph global settings"
    return normalized


def validateChartModel(chart, csvCollection):
    """
    Return:
    - chart:
      같은 candidate chart.

    변경:
    - 없음.

    검증:
    - chart id와 editor/graph shape가 유효하다.
    - editor.objects는 배열이며 editable 여부와 관계없이 0개일 수 있다.
    - 각 존재 graph object의 csvId는 csvCollection에서 resolve된다.
    - x/y column identifier와 enum/numeric style field가 유효하다.
    - globalSettings와 네 axis가 정규화 가능한 shape다.
    - graph data/layout/config/frames와 imported extension shape가 유효하다.
    """
    return chart


def parsePlotlyToEditor(figure, chartId):
    """
    Return:
    - chart:
      원본 Plotly figure와 Fast Figure conversion view를 함께 가진 non-editable chart candidate.

    변경:
    - project CSV 또는 activeProject를 변경하지 않는다.

    처리:
    1. figure.data/layout/config/frames를 원본 imported representation으로 deep-copy한다.
    2. 각 trace의 x/y array를 trace 순서대로 conversion table column으로 펼친다.
       column 의미는 traceN_x, traceN_y이며 이후 C1..Cn 식별자로 정규화한다.
    3. data point가 있는 trace마다 Fast Figure graphObject conversion view를 만든다.
       - xaxis x2 -> top, 그 외 bottom
       - yaxis y2 -> right, 그 외 left
       - type=bar -> bar
       - visible=false -> hidden
       - 그 외 mode를 scatter/markers/lines+markers 계열 의미로 정규화
       - line/marker color, legend name, widths, dash, marker symbol/size, opacity를 가능한 범위에서 매핑
       - x/y를 제외한 원 trace field는 plotlyTrace extension으로 보존
    4. layout title/legend/font/xaxis/xaxis2/yaxis/yaxis2를 globalSettings와 axisSettings로 변환한다.
       editor가 직접 소유하지 않는 layout/config는 plotlyExtensions에 보존한다.
    5. trace가 없거나 모든 trace에 data point가 없어도 conversionRows/objects를 empty로 유지한다.
       fake X/Y row나 default CSV를 만들지 않는다.
    6. editor.editable=false로 반환한다.
    """
    chart = "non-editable imported Plotly chart candidate"
    return chart


def convertImportedChartToEditable(chart):
    """
    Return:
    - candidate:
      editable chart와 필요한 경우 새 CSV asset을 포함한 candidate project change.

    변경:
    - 없음.

    처리:
    1. chart의 imported representation은 보존한다.
    2. conversion object가 0개면 CSV 없이 editor.editable=true인 empty chart candidate를 만든다.
    3. conversion object가 있으면 conversionRows를 하나의 project CSV candidate로 만들고
       모든 conversion object가 그 실제 CSV id를 참조하도록 연결한다.
    4. global/axis settings를 유지한 채 editable Plotly projection을 다시 계산한다.
    5. whole-project 검증 후 상위 mutation 경계가 commit한다.
    """
    candidate = "editable conversion candidate"
    return candidate

