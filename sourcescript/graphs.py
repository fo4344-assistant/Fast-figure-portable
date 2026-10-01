"""
Fast Figure Source Script — CSV data, chart model, graph objects and Plotly rendering

현재 구현 원천:
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
- application_fsm.py
- assets_files.py
"""

from project_state import activeProject, getProjectCsv, getChart
from application_fsm import appFSM

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
        "globalSettings": "title/legend/zero-line/font/4개 axis 설정",
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


def connectDataToSlotModel(slot, data, sourceName, projectCsv=None):
    """
    Return:
    - chart:
      CSV가 연결된 기존 또는 새 chart model.

    변경:
    - activeProject chart collection과 slot.chart
    - chart.editor.objects
    - core-internal editing pointer

    주의:
    이 함수는 현재 FSM mutation action 내부에서 사용하는 model-level mutation helper다.
    frontend의 직접 변경 경계가 아니다.

    처리:
    기존 chart가 있으면 새 CSV graph object를 추가한다.
    chart가 없으면 next chart id로 chart를 만들고 slot.chart reference를 연결한다.
    editable chart면 renderer projection을 rebuild한다.
    """
    chart = "CSV가 연결된 chart model"
    return chart


def graphEditorAdd(csvId):
    """
    Return:
    - chart:
      object 추가 후 chart.

    변경:
    - GRAPH_OBJECTS_REPLACED 또는 SLOT_DATA_CONNECTED 공식 event를 통해 chart/slot state를 변경한다.

    처리:
    선택 slot과 CSV를 실제 id로 resolve한다.
    선택 slot에 chart가 없으면 SLOT_DATA_CONNECTED로 첫 chart/object를 만든다.
    chart가 있으면 현재 object 목록에 새 base graph object를 추가해 commit한다.
    """
    chart = "변경된 chart"
    return chart


def graphEditorCommit(objects, index=None):
    """
    Return:
    - chart:
      object list commit 후 chart.

    변경:
    - GRAPH_OBJECTS_REPLACED event
    - graph object selection state
    - editable graph renderer projection

    처리:
    object array 자체를 UI/local state의 장기 원천으로 두지 않고 chart SoT에 commit한다.
    """
    chart = "commit된 chart"
    return chart


def graphEditorObjectValues(index, values):
    """
    Return:
    - chart:
      지정 object의 허용 field를 정규화해 commit한 chart.

    변경:
    - 최종적으로 graphEditorCommit을 통해 chart object state를 변경한다.

    처리:
    CSV와 column reference를 현재 project에서 다시 resolve한다.
    enum 값과 numeric range를 검증/제한한다.
    허용 field만 새 object에 반영한다.
    """
    chart = "object 변경 후 chart"
    return chart


def graphEditorSetEditable(editable):
    """
    Return:
    - editable:
      최종 editable 상태.

    변경:
    - 선택 chart.editor.editable.
    - imported Plotly chart를 editable로 바꿀 때 project CSV와 object reference를 생성할 수 있다.

    처리:
    imported Plotly에 CSV reference가 없으면 보존된 conversion rows에서 project CSV를 만든다.
    object csvId를 그 CSV와 연결한 뒤 editable projection을 rebuild한다.
    """
    editable = "선택 chart의 최종 editable boolean"
    return editable


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
    project/domain 의미를 Plotly renderer 형식으로 투영한다.
    """
    return chart


def importSelectedGraphFile(file):
    """
    변경:
    - 선택 slot의 chart model과 package가 필요로 하는 CSV asset.

    처리:
    FFSX면 ffsxReadSlot 검증 결과를 import한다.
    Plotly JSON이면 parsePlotlyToEditor를 통해 editable/non-editable chart 의미를 구성한다.
    실제 project 변경은 SLOT_CHART_IMPORTED 등 기존 mutation 경로를 사용한다.
    """
    return "import 완료 chart"


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
