"""
Fast Figure Source Script — Backend / graph-domain

하위 구현 검증 자료: ../../fast-figure.js, ../../fast-figure-ui.js, ../../Fast-figure.html.
Python 표기의 구현 명세이며 application runtime을 실행하는 모듈이 아니다.
"""

from sourcescript.backend.project_state import activeProject, getProjectCsv, getChart

GRAPH_BOUNDARY_RULE = (
    "Backend graph 계산은 interfaceFSM/DOM 또는 Application adapter를 읽거나 호출하지 않는다. "
    "Application graph wrapper는 explicit slotId/chartId/csvId/index와 새 edit 값만 command/query에 전달한다. "
    "current-state resolve/normalize/candidate 계산은 Project EFSM command 내부에서 이 domain의 규칙을 사용한다. "
    "graphEditorCommit/convertImportedChartToEditable는 candidate만 반환한다."
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
    "editable 전환 전에는 conversion rows가 project CSV authority가 아니다. "
    "validateChartModel이 representation에 따라 CSV/column 참조 검증 대상을 정한다. "
    "project 검증·reference 수집·FFPX/FFSX 입출력은 이 판정을 공유하며 conversion object를 project CSV 참조로 수집하지 않는다."
)


graphObject = {
    "csvId": "실제 project object의 activeProject.csvFiles reference id; non-editable conversion object의 값은 project CSV 참조로 해석하지 않음",
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
        "conversionRows": "non-editable imported conversion view에만 있는 optional table; empty 가능, editable 전환 후 제거, project CSV authority 아님",
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
    "editable chart에서 chart.editor.objects와 project CSV reference가 편집 의미의 원천이다."
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


def graphEditorCommit(chartId, objects, index):
    """
    Return:
    - candidate:
      command 내부에서 계산한 objects를 적용한 candidate chart와 post-edit index hint.

    변경:
    - candidate만 계산한다. 이름은 기존 식별자를 유지하지만 자체 commit/Frontend 전이/Application 역호출은 없다.

    처리:
    Project EFSM의 graph-object branch가 current chart를 resolve한 뒤 이 Backend helper를 사용한다.
    objects는 그 command 안의 add/move/edit/delete/palette 계산 결과이며 public wrapper/read projection에서 받지 않는다.
    0개 object도 유효하다. normalize/reference validation 후 whole-project candidate에 포함하며 fake object를 복구하지 않는다.
    index는 post-edit 배열에 대한 hint로서 command result의 selectionHints.chartId/selectedIndexHint에 넣는다.
    최종 commit은 projectEFSM.send, 선택 갱신은 공통 reconciliation만 소유한다.

    one-object edit 계산은 이 Backend command 안에서 다음 규칙을 사용한다.
    1. current authority에서 chartId/index와 editable object를 resolve한다. 없으면 state 변경 없이 거부한다.
    2. 새 values.csvId가 유효한 CSV로 resolve되면 사용하고, 없거나 invalid면 기존 object.csvId를 resolve한다.
       둘 다 resolve되지 않으면 거부한다. 유효한 요청 CSV로 reference를 바꿀 수 있다.
    3. 선택 CSV의 headerLines/rows에서 columns/base defaults를 계산한다. 새 x/y가 유효하면 사용하고,
       아니면 기존 x/y가 그 CSV에 유효할 때 유지하며, 둘 다 아니면 그 CSV의 기본 column을 사용한다.
    4. type/axis/color/style enum과 numeric range는 기존 graph-object 규칙으로 검증/제한한다.
       command-local objects에서 해당 index만 바꾸고 다른 object/reference를 유지한다.
    5. normalized objects와 같은 post-edit index를 candidate와 hint로 돌려준다. Frontend current CSV는 writable scope가 아니다.
    """
    candidate = "current chart copy에 command-calculated objects를 적용한 candidate와 index hint"
    return candidate


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
    - editor.editable은 boolean이고 editor.objects는 배열이며 두 representation 모두 0개일 수 있다.
    - imported conversion representation(editor.editable=False이고 editor.conversionRows가 존재함)의 object/rows는
      project CSV/column 참조 검증 대상에 넣지 않는다. conversionRows가 table shape인지,
      conversion object의 x/y가 그 table column인지와 style shape는 검증한다.
    - 그 밖의 실제 project CSV object는 editable flag와 무관하게 각 csvId를 csvCollection에서 resolve하고
      해당 CSV의 x/y column identifier를 검증한다. 편집 가능했던 일반 chart를 잠시 non-editable로 바꿔도 이 reference는 보존한다.
    - fake CSV/id를 생성하지 않으며 dangling project reference를 conversion view로 간주해 검증을 우회하지 않는다.
    - 두 경우 모두 enum/numeric style field와 아래 chart/imported 구조를 검증한다.
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
    이 함수는 CHART_MODEL_REPLACED의 Backend candidate builder로만 호출하며 Application wrapper를 호출하지 않는다.
    chart는 command가 current authority에서 다시 resolve한 chart다. 이미 editable이면 새 CSV를 중복 생성하지 않는다.
    1. chart의 imported representation은 보존한다.
    2. conversionRows가 없으면 기존 project CSV reference를 유지한 채 editable=true로 전환하며 CSV를 재생성하지 않는다.
       conversionRows가 있고 conversion object가 0개면 CSV 없이 editor.editable=true인 empty chart candidate를 만든다.
    3. conversionRows가 있고 conversion object가 있으면 그 rows를 하나의 project CSV candidate로 만들고
       모든 conversion object가 그 실제 CSV id를 참조하도록 연결한다. 연결 후 conversionRows를 제거한다.
    4. global/axis settings를 유지한 채 editable Plotly projection을 다시 계산한다.
    5. caller인 Project EFSM이 current next-id/path/ownership까지 포함한 whole-project candidate를 검증하고 한 번 commit한다.
    """
    candidate = "editable conversion candidate"
    return candidate
