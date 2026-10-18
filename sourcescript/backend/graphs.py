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
# Graph object의 fallback 순환만 소유한다. Project UI palette와 동기화하지 않는다.
DEFAULT_COLORS = "config reference: backend.defaults.graphColors (read-only sequence)"

GRAPH_PALETTE_RULE = (
    "새 base object는 DEFAULT_COLORS[0], imported object에 line/marker color가 없으면 원 trace index modulo sequence length의 색, "
    "trace projection에서 object.color가 없으면 object index modulo sequence length의 색을 사용한다. 명시된 object color가 우선한다. "
    "graphs.defaultColors는 이 immutable sequence의 detached copy이고 graphs.readPalette는 owning chart의 실제 object color 순서다. "
    "graphs.applyPalette는 non-empty color text array를 받고 current editable chart objects의 i번째 color만 colors[i modulo length]로 바꾼다. "
    "각 color element는 trim 뒤 non-empty text여야 하며 그 text를 저장한다. empty/비배열/이 조건을 만족하지 않는 element는 "
    "command 실패이며 project/selection을 보존한다. Plotly color parser를 별도 project authority로 만들지 않는다. "
    "object id/order/data/style/axes, UI palette, 다른 chart의 색은 바꾸지 않고 새 object/CSV를 만들지 않는다. "
    "zero-object editable chart에도 non-empty palette 입력은 유효하나 object는 생기지 않는다. index hint를 생략해 기존 선택을 보존한다. "
    "graph color는 Plotly color text로서 named/rgb/hex 표현을 보존하며 UI palette의 6-digit hex 제한을 강제하지 않는다."
)

AXIS_DEFAULTS = "config reference: backend.defaults.chartSettings.editor.axis"
GRAPH_GLOBAL_DEFAULTS = "config reference: backend.defaults.chartSettings.editor.globalSettings"
GRAPH_STYLE_DEFAULTS = "config reference: backend.defaults.chartSettings.editor.objectStyle"
GRAPH_RENDER_DEFAULTS = "config reference: backend.defaults.graphRendering"
GRAPH_STYLE_LIMITS = "config reference: backend.defaults.limits.graphObject"

axisSettings = {
    "min": "optional numeric lower bound; empty이면 auto",
    "max": "optional numeric upper bound; empty이면 auto",
    "tick": "non-log 축에 명시할 optional positive numeric interval; empty이면 Plotly auto",
    "tickMode": "plotly 또는 increment인 editor 입력 모드; log에서는 plotly만, 저장된 positive tick의 projection 여부와는 별개",
    "minorTicks": "log axis의 dense/minor tick 표시 여부",
    "notation": "none, e, power 중 하나",
    "scaleType": "linear, log 또는 reciprocal; reciprocal은 data를 역수 변환하고 Plotly axis는 linear로 표시",
    "divide": "trace numeric values에 적용할 유한 non-zero numeric divisor; 생략/invalid/0이면 항등 divisor 1",
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
    "lineWidth": "GRAPH_STYLE_LIMITS.lineWidth",
    "lineDash": "solid, dot, dash, dashdot 중 하나",
    "markerSymbol": "현재 지원 marker symbol",
    "markerSize": "GRAPH_STYLE_LIMITS.markerSize",
    "barOpacity": "GRAPH_STYLE_LIMITS.barOpacity",
    "barLineWidth": "GRAPH_STYLE_LIMITS.barLineWidth",
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


GRAPH_OBJECT_NORMALIZATION_RULE = (
    "base object는 current CSV의 graphDataSelection x/y, csvId, config objectStyle의 type/axis/style, DEFAULT_COLORS 첫 색, 빈 legendName으로 만든다. "
    "새 chart는 command candidate.nextId.chart와 sourceName title, config globalSettings/네 axis와 빈 objects/graph projection으로 만든다. "
    "one-object edit는 새 값을 current object와 field별 합치며 누락/invalid enum은 current 값, current도 없으면 config default를 사용한다. "
    "type enum은 scatter/markers/lines+markers/bar/hidden, x side는 bottom/top, y side는 left/right, dash는 solid/dot/dash/dashdot이다. "
    "marker symbol은 circle/square/diamond/cross/x/triangle-up/triangle-down이다. 새 color는 non-empty text만 사용하며 그렇지 않으면 current color를 보존한다. "
    "legendName은 명시된 text면 empty도 적용하고 아니면 current를 보존한다. numeric style은 finite 새 값이면 config limit으로 clamp하고 "
    "아니면 current/default를 보존한다. csvId/x/y 선택은 graphEditorCommit의 별도 reference 규칙을 먼저 적용한다. "
    "import/commit의 전체 objects 정규화는 missing style만 config에서 보완하고 기존 reference/order/extension을 바꾸지 않으며 "
    "shared validator로 enum/finite range를 확인한다. 새 base object를 복구하거나 invalid CSV를 다른 CSV로 바꾸지 않는다."
)

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
    아니면 header 이후 body에 literal empty string/missing이 아닌 finite scalar numeric 값이 하나라도 있는 첫 column을 x로 우선 선택한다.
    numeric column이 없으면 첫 유효 column을 x로 쓴다. y는 x와 다른 numeric, 다른 유효 column, 첫 유효 column 순서로 고른다.
    단일 column이면 x=y가 허용되며 column 자체가 없으면 x/y 모두 empty string이다. 유효한 기존 editor.x/y를 이 fallback으로 덮어쓰지 않는다.
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
    2. existing owning chart가 있으면 editable인지 검증한 뒤 그 chart copy에 새 graph object를 추가한다.
       non-editable chart에는 실제 CSV object를 conversion view로 섞지 않으며 실패 시 project/selection을 보존한다.
       편집 가능 전환은 기존 graphs.setEditable의 명시적 별도 command를 사용한다.
    3. chart가 없으면 next chart id를 사용하는 새 chart candidate와 slot.chart candidate를 만든다.
    4. graph object는 실제 projectCsv id를 참조한다. column이 있으면 유효한 column selection만 사용하고,
       최대 row 폭이 0인 CSV는 x=y=empty string으로 연결한다. 가짜 column을 생성하지 않는다.
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
    "Backend 생성 command/helper는 일반 CSV 생성만 소유하고 Frontend 선택이나 chart/object를 변경하지 않는다. "
    "public Application createEmptyProjectCsvAndSelect가 commit 성공 뒤 실제 CSV path로 검증된 SELECT_ASSET을 보낸다. "
    "사후 선택 거부/오류는 이미 생성된 CSV를 rollback하거나 Backend 선택으로 대체하지 않는다. "
    "사용자가 오브젝트 추가를 실행하면 graphEditorAdd는 그 현재 선택 CSV id를 resolve하여 기존 SLOT_DATA_CONNECTED 또는 "
    "GRAPH_OBJECTS_REPLACED 경로로 graph object를 생성한다. 빈 CSV 전용 chart type, protected object, fake default object를 만들지 않는다. "
    "rows가 [] 또는 모든 row 폭이 0이면 columnDefinitions는 empty이고 일반 object의 x/y는 모두 empty string이어야 한다. "
    "한쪽만 empty거나 존재하지 않는 column id는 거부한다. column이 하나라도 있으면 x/y 모두 실제 column id여야 한다. "
    "해당 CSV의 참조/id는 유지하며 zero-column object의 trace는 []이다. CSV가 바뀌는 one-object edit는 같은 선택 fallback을 쓴다."
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

    입력 범위:
    objectView는 traces가 같은 작업의 project CSV에서 resolve한 rows/headerLines/column identifier,
    해당 object의 style과 연결된 x/y axis의 divide/scaleType만 담는 호출 범위 값이다.
    live authority, current CSV selection 또는 DOM을 다시 조회하지 않는다.

    확정 계산:
    1. x/y의 C1..Cn을 0-based column index로 resolve한다. identifier가 없거나 column 범위 밖이면 trace는 없다.
       columnDefinitions와 동일한 최대 row 폭을 사용하며 짧은 row의 누락 cell은 별도로 판정한다.
       CSV의 정규화된 headerLines만큼 앞 row를 제외하고 body를 원래 순서대로 순회한다.
    2. scalar 숫자 변환은 유한 number 또는 숫자로 변환 가능한 text를 사용한다.
       CSV 호환상 y의 empty/whitespace text와 null은 0, boolean은 false=0/true=1이다.
       누락 cell, 변환 불가능한 y, NaN/무한 수치 y는 해당 row 전체를 제외한다.
       x는 literal empty text "" 또는 누락 cell이면 row 전체를 제외한다. 유한 수치로 변환 가능한 scalar는 numeric x로,
       그 외 text는 원래 categorical x로 유지한다. whitespace-only x text는 scalar 변환 결과인 0이다. null/boolean은 같은 scalar 숫자 변환을 사용한다.
       실제 numeric x가 NaN/무한 값이면 제외하며, 비수치 text를 임의로 숫자 0으로 바꾸지 않는다.
    3. 유한 non-zero divisor로 numeric x와 numeric y를 각각 나눈다. categorical x는 divide로 바꾸지 않는다.
       divisor 생략/invalid/0은 1이다. 나눗셈 결과가 비유한 수치이면 해당 row 전체를 제외한다.
    4. divide 뒤의 각 축 값에 scaleType을 적용한다.
       linear는 유한 numeric 또는 x의 category를 유지한다.
       log는 유한 numeric 값이면서 0보다 큰 경우에만 유지한다. text category는 log 축에서 제외한다.
       reciprocal은 유한 numeric이면서 0이 아닐 때 1/value를 사용한다. 음수는 허용하고 category는 제외한다.
       역수 결과가 비유한 수치이면 제외한다. y는 항상 numeric이며 axis마다 다른 변환을 적용할 수 있다.
    5. 어느 한 축이라도 제외 조건이면 같은 row의 x/y를 함께 버린다. 각각 별도 filter로 정렬하거나
       누락 좌표를 이웃 row의 값으로 채우지 않는다. 통과한 paired x/y를 같은 순서로 사용한다.
       통과 row가 없으면 []이다. 한 object를 category 값마다 별도 group/trace로 나누지 않는다.
    6. 통과 row가 있으면 한 trace를 만든다. bar는 type=bar/mode 생략, 그 외는 type=scatter다.
       editor type=scatter는 mode=lines, markers/lines+markers는 같은 mode, hidden은 mode=lines/visible=false다.
       다른 type은 visible=true다. x/y는 위 paired sequence, name은 y column identifier다.
       color는 호출자가 GRAPH_PALETTE_RULE로 정한 값이며 line.color/marker.color 모두 같은 색이다.
       line.width 범위는 non-bar GRAPH_STYLE_LIMITS.lineWidth, bar GRAPH_STYLE_LIMITS.barLineWidth다.
       missing/invalid 기본값은 각각 GRAPH_STYLE_DEFAULTS.lineWidth/barLineWidth다. non-bar line.dash의 기본값도 GRAPH_STYLE_DEFAULTS.lineDash다.
       marker.symbol/size는 GRAPH_STYLE_DEFAULTS의 markerSymbol/markerSize를 사용하고 size 범위는 GRAPH_STYLE_LIMITS.markerSize다.
       bar만 opacity를 GRAPH_STYLE_LIMITS.barOpacity로 제한하고 기본값은 GRAPH_STYLE_DEFAULTS.barOpacity, marker.line은 {color,width=bar line width}다.
       numeric style은 유한 수치로 변환 후 범위 제한하고 missing/invalid는 default다. 유효한 0은 bar width에서 유지한다.
       non-bar에는 opacity/bar marker.line, bar에는 line.dash를 계산 field로 추가하지 않는다.
       hidden도 data 변환을 우회하거나 editor object를 삭제하지 않는다.
    """
    plotlyTraces = "graph object에서 파생된 Plotly trace 목록"
    return plotlyTraces


def traces(chart, project):
    """
    Return:
    - plotlyTraces:
      chart.editor.objects 전체에서 계산한 Plotly trace 목록.

    변경:
    - 없음.

    처리:
    project는 이 Backend 작업이 읽는 current authority 또는 command 내부의 같은 whole-project candidate다.
    public read projection을 project 대신 받거나 Application/Frontend가 candidate를 넘기는 경로는 없다.
    1. chart의 owning slot/id와 editor.objects를 같은 project에서 resolve한다.
    2. object 순서대로 csvId를 그 project의 CSV collection에서 resolve하고 rows/headerLines를 읽는다.
       getProjectCsv의 current-authority 기본 조회로 candidate에 새로 생성된 CSV를 찾으려 하지 않는다.
       없는 실제 CSV reference는 validation 실패이며 current selected CSV나 conversionRows로 대체하지 않는다.
    3. xAxisSide/yAxisSide를 그 chart의 네 axis에 연결해 objectView를 만들고 tracesSingle을 호출한다.
       bottom/top은 Plotly x/x2, left/right는 y/y2로 연결한다. 각 object의 data 순서를 보존한다.
    4. object.plotlyTrace의 record copy 위에 계산된 trace를 덮어쓴다. line/marker record는 각 level에서
       extension 먼저, 계산 field 나중으로 merge하며 다른 unknown field는 보존한다. bar marker.line은 계산 record가 우선한다.
       name은 non-empty object.legendName 또는 y column identifier, xaxis/yaxis는 위 owning axis reference를 마지막에 덮어쓴다.
       extension의 x/y/type/mode/visible/name/axis 값으로 editor 계산을 역전하지 않는다.
    5. axis만 표시하고 실제 object가 없을 때도 Plotly axis를 유지하려고 보조 trace를 마지막에 추가한다.
       visible인 xBottom/xTop 순서의 x/x2 목록, yLeft/yRight 순서의 y/y2 목록을 사용하고
       어느 축 방향 목록이 비면 각각 x 또는 y 한 개로 fallback한다. x 목록 바깥/y 목록 안쪽의 Cartesian 순서다.
       각 보조 trace는 x=[], y=[], type=scatter, mode=markers, xaxis/yaxis=해당 조합,
       showlegend=false, hoverinfo=skip, visible=true, marker={size:0, opacity:0}, line={width:0}, name="",
       meta={fastFigureAxisPlaceholder:true}다. 이는 renderer figure에만 존재하며 persistent object/CSV나 readPalette에 포함하지 않는다.
    6. rows/objectView/trace 결과는 이 작업 범위 값이다. object에 row copy를 저장하지 않으며
       Backend projection을 소비하는 Frontend renderer가 CSV resolve/trace 계산을 다시 수행하지 않는다.
    non-editable imported conversion representation은 이 절차로 CSV를 찾지 않고 chartFigure의 보존 경로를 사용한다.
    """
    plotlyTraces = "chart의 Plotly data projection"
    return plotlyTraces


def rebuildEditableGraph(chart, project):
    """
    변경:
    - command 내부 candidate 또는 query-local chart copy의 graph.data/layout/config renderer projection만 변경한다.
    - query에서 받은 live chart를 in-place 정규화하거나 독립적으로 activeProject를 commit하지 않는다.

    처리:
    project는 traces와 동일한 작업의 current authority 또는 Backend command candidate다.
    chart.editor와 그 project의 referenced CSV에서 traces(chart, project)와 layout(chart, project)을 다시 계산한다.
    candidate에 새로 생성/교체/삭제한 CSV를 candidate chart와 함께 사용하며 pre-commit live CSV와 혼합하지 않는다.
    objects가 비어 있으면 object trace는 빈 배열이고 layout/global settings 계산은 계속한다.
    renderer 표시용 axis 보조 trace가 필요하더라도 persistent graph object/default CSV를 생성하지 않는다.
    project/domain 의미를 Plotly 형식으로 투영하며 실제 project commit은 Project EFSM만 수행한다.
    """
    return chart


def chartFigure(chart, project):
    """
    Return:
    - figure:
      Plotly JSON export에 사용할 data/layout/config/frames representation.

    변경:
    - 없음.

    처리:
    project는 같은 Backend read/export 작업의 current authority 또는 command-local candidate다.
    chart를 작업용으로 복사한 뒤 아래 한 경로만 사용한다. 원본 chart/CSV/Frontend selection을 변경하지 않는다.
    - non-editable이고 graph.imported가 있으면 그 원본 data/layout/config/frames의 detached copy를 반환한다.
      conversionRows/object view에서 project CSV를 resolve하거나 원본 trace를 재생성/손실 정규화하지 않는다.
    - 그 외에는 chart copy의 editor와 같은 project CSV에서 rebuildEditableGraph(copy, project)로 figure를 계산한다.
      일반 CSV chart의 editable flag를 껐다는 이유만으로 실제 project reference를 conversion view로 바꾸지 않는다.
    export와 dashboard projection은 같은 절차를 사용하고 renderer가 이 결과를 mutation 입력으로 돌려보내지 않는다.
    """
    figure = "export 가능한 Plotly figure"
    return figure


def layout(chart, project):
    """
    Return: 같은 Backend 작업의 chart/editor와 project.appearance에서 계산한 detached Plotly layout.
    변경: 없음. query-local copy 또는 command candidate에서만 계산하며 DOM/Frontend/다른 read snapshot을 조회하지 않는다.

    1. normalizeGlobalSettings(chart.editor.globalSettings)와 네 normalizeAxisSettings를 사용한다.
       아래 omitted는 field 자체를 출력하지 않음을 뜻하며 null/0이나 이전 renderer 값을 뜻하지 않는다.
    2. 모든 axis의 Plotly type은 log일 때 log, linear/reciprocal일 때 linear다.
       title={text: visible이면 title 아니면 empty, font:{size:titleSize 또는 AXIS_DEFAULTS.titleSize}}, visible=true다.
       visible=true 유지 이유는 데이터/overlay 축 영역을 보존하기 위함이며 표시 토글은 다음 field에 적용한다.
       showgrid=visible and showGrid, showticklabels=visible and showValues, ticks=visible이면 outside 아니면 empty,
       showline=visible, linewidth=lineWidth, tickfont={size:fontSize 또는 AXIS_DEFAULTS.fontSize}, automargin=true다.
       gridcolor=GRAPH_RENDER_DEFAULTS.gridColor, zeroline=visible and showZeroLine, zerolinecolor=GRAPH_RENDER_DEFAULTS.zeroLineColor다.
       min/max가 모두 유한 수치면 linear/reciprocal range=[min,max]; 하나라도 empty/invalid면 range omitted다.
       log는 두 경계가 모두 >0일 때만 range=[log10(min),log10(max)], 아니면 omitted다.
       경계 순서는 보존하므로 reversed axis도 허용한다. reciprocal에 역수를 다시 적용하지 않는다.
       log dtick=1; non-log는 tick이 유한 양수이면 dtick=tick 아니면 omitted다.
       tickMode는 입력 UI 모드이며 저장된 명시적 tick을 삭제하지 않는다.
       log minorTicks=true면 minor={dtick:D1, ticks:outside, showgrid:visible and showGrid, gridcolor:GRAPH_RENDER_DEFAULTS.gridColor},
       false면 minor={ticks:empty, showgrid:false}; log에만 minorloglabels=none이다. non-log는 이 두 field omitted다.
       notation=power/e/none을 exponentformat으로 사용한다. showexponent는 none이면 none 아니면 all,
       tickformat은 e이면 .3e, 그 외 omitted다.
    3. xBottom->xaxis, xTop->xaxis2(+overlaying:x, side:top),
       yLeft->yaxis, yRight->yaxis2(+overlaying:y, side:right)로 연결한다.
       uirevision=chart.id의 text, showlegend=showLegend,
       title={text:showTitle이면 editor.title 아니면 empty, automargin:true,
              font:{size:positive titleFontSize 또는 GRAPH_RENDER_DEFAULTS.titleFontSize, optional family:non-empty graphFontFamily}},
       legend={font:{size:positive legendFontSize 또는 GRAPH_RENDER_DEFAULTS.legendFontSize, optional family:동일 family}}다.
       paper_bgcolor/plot_bgcolor=project.appearance.uiPalette.paperColor,
       font={color:동 palette.fontColor, optional family:동일 family}, margin=GRAPH_RENDER_DEFAULTS.margin의 copy다.
       UI background/surface 색을 graph paper로 대신 사용하지 않는다.
    4. editor.plotlyExtensions.layout이 record면 detached copy, 아니면 empty record 위에 계산 layout을 merge한다.
       title/legend/font/margin과 네 axis는 record level에서 extension 먼저/계산 나중이다.
       title.font와 legend.font는 한 level 더 같은 순서로 merge한다. 다른 unknown field는 보존한다.
       위에서 omitted로 정한 optional field(range/dtick/minor/minorloglabels/tickformat 등)는 소유 field이므로
       extension의 같은 key도 제거한다. optional font family를 생략한 경우 extension family는 유지한다.
       이것이 stale imported range/tick이 editor auto 설정을 되돌리지 못하게 하는 규칙이다.
       config/frames는 기존 detached copy로 보존하며 이 layout 함수가 새 의미/default로 덮어쓰지 않는다.
    non-editable imported figure는 chartFigure의 원본 보존 경로이므로 이 재계산으로 원본 layout을 손실시키지 않는다.
    """
    return "detached Plotly layout"


def normalizeAxisSettings(axis, key):
    """
    Return:
    - normalized:
      axisSettings schema를 만족하는 axis 설정.

    변경:
    - 없음.

    처리:
    AXIS_DEFAULTS를 복사하고 backend.defaults.chartSettings.editor.axisVisibility[key]로 visible을 설정한다.
    입력의 알려진 field를 정규화해 덮어쓰며 unknown field는 의미 원천으로 사용하지 않는다.
    min/max/tick은 missing/null/literal empty text면 empty이고 그 외 유한 numeric text/number면 수치, invalid면 empty다.
    title은 text 아니면 AXIS_DEFAULTS.title, titleSize/fontSize는 유한 양수 아니면 각 AXIS_DEFAULTS field,
    lineWidth는 유한 0 이상 아니면 AXIS_DEFAULTS.lineWidth다. 명시적 lineWidth=0은 유지한다.
    showGrid/showValues는 명시적 false만 false, visible은 boolean 아니면 axis별 default,
    minorTicks는 명시적 true만 true다. notation enum invalid는 none, tickMode invalid는 plotly다.
    axis별 기본 visible은 위 config의 axisVisibility만 사용한다.
    scaleType은 linear/log/reciprocal이며 생략/invalid는 항등 변환인 linear다.
    reciprocal을 linear의 별칭으로 지우지 않는다. data 변환은 tracesSingle의 divide 다음 역수 순서다.
    enum과 numeric/empty field를 정규화하며 divide는 유한 non-zero 수치, 생략/invalid/0은 항등 divisor 1이다.
    log scale에서는 increment tick mode를 허용하지 않는다. reciprocal은 log가 아니므로 기존 increment 선택을 보존한다.
    reciprocal의 Plotly axis type은 linear이고 min/max는 역수 변환 후 표시 좌표의 경계다.
    이 단계에서 범위에 다시 역수를 취하거나 원본 CSV를 재작성하지 않는다.
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
    GRAPH_GLOBAL_DEFAULTS를 복사하고 showLegend/showTitle은 명시적 false만 false,
    showZeroLine은 명시적 true만 true, graphFontFamily는 text 아니면 empty다.
    titleFontSize/legendFontSize는 empty 또는 유한 양수이고 invalid/non-positive는 empty로 정규화한다.
    네 axis는 AXIS_DEFAULTS와 normalizeAxisSettings(axis,key)를 사용한다.
    query는 normalized copy만 반환하며 live editor를 고치지 않는다. command는 candidate에만 반영한다.
    imported extension은 layout의 merge 규칙으로 보존하며 직접 소유 field의 다른 authority로 쓰지 않는다.
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
    - editor/graph shape가 유효하다. id가 있으면 양의 정수다. Project collection에 등록하는 chart는 id가 필수이고
      Project whole validation이 positive/unique id와 정확히 한 owner를 검사한다.
      FFSX의 Project identity 없는 serialized chart는 id를 만들지 않고 같은 구조/reference 검증을 받는다.
    - editor.editable은 boolean이고 editor.objects는 배열이며 두 representation 모두 0개일 수 있다.
    - imported conversion representation(editor.editable=False이고 editor.conversionRows가 존재함)의 object/rows는
      project CSV/column 참조 검증 대상에 넣지 않는다. conversionRows가 table shape인지,
      conversion object의 x/y가 그 table column인지와 style shape는 검증한다.
    - 그 밖의 실제 project CSV object는 editable flag와 무관하게 각 csvId를 csvCollection에서 resolve하고
      해당 CSV의 x/y column identifier를 검증한다. 편집 가능했던 일반 chart를 잠시 non-editable로 바꿔도 이 reference는 보존한다.
    - 위 두 representation 모두 columnDefinitions 결과가 empty면 x/y 모두 정확히 empty string인 경우만 허용한다.
      table은 [] 또는 0폭 row들일 수 있다. column이 있으면 x/y 모두 그 실제 column id여야 하며 한 column일 때 x=y가 허용된다.
      이는 참조 검사 예외가 아니다. 일반 object의 csvId는 zero-column이어도 실제 CSV로 resolve되어야 한다.
      zero-column object는 tracesSingle의 기존 invalid-coordinate/no-trace 규칙으로 []를 투영한다.
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
    4. layout title text는 title이 text면 그 값, record면 title.text 또는 empty다. showTitle은 text의 non-empty 여부,
       showLegend는 layout.showlegend가 명시적 false인 경우만 false다.
       graphFontFamily는 title.font.family -> layout.font.family -> legend.font.family 중 첫 non-empty text 또는 empty,
       titleFontSize/legendFontSize는 각 font.size 또는 empty를 normalizeGlobalSettings로 정규화한다.
       xaxis/xaxis2/yaxis/yaxis2를 xBottom/xTop/yLeft/yRight로 연결한다. axis.type=log만 log, 그 외 linear다.
       유한 axis.range의 각 경계는 log일 때 10**value로 역변환 후 유한 수치, 그 외 그대로; 누락/overflow는 empty다.
       reciprocal을 Plotly linear에서 추측하지 않는다. divide는 default 1이다.
       dtick이 L 뒤 수치인 text면 tick=그 수치/tickMode=increment, non-log numeric dtick이면 tick=그 값/tickMode=plotly,
       그 외 empty/plotly다. log tick은 empty이며 dtick=D1 또는 minor의 dtick=D1/ticks=inside|outside/showgrid=true면 minorTicks=true다.
       axis.title(text 또는 title.text), title.font.size, tickfont.size, linewidth를 대응 field로 정규화한다.
       showGrid/showValues/visible은 각각 showgrid/showticklabels/visible의 명시적 false만 false,
       notation은 exponentformat=e/power 외에는 none이다. showZeroLine은 editor default false를 유지한다.
       editor가 직접 소유하지 않는 layout/config는 plotlyExtensions에 detached copy로 보존한다.
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
       새 CSV는 current nextId.csv, Backend csv root의 collision-free 'Plotly JSON.csv', MIME text/csv, headerLines=1을 사용한다.
       bytes가 없는 이 새 table에는 Backend asset의 synthetic-data encoding 규칙을 적용하며 원본 imported graph bytes를 대체하지 않는다.
    4. global/axis settings를 유지한 채 같은 whole-project candidate의 chart/CSV로 editable Plotly projection을 다시 계산한다.
       traces/chartFigure/rebuildEditableGraph의 project 인자에 그 candidate를 사용한다. 아직 commit되지 않은 CSV를
       live activeProject에서 조회하거나 새 CSV reference를 맞추기 위해 부분 commit하지 않는다.
    5. caller인 Project EFSM이 current next-id/path/ownership까지 포함한 whole-project candidate를 검증하고 한 번 commit한다.
    """
    candidate = "editable conversion candidate"
    return candidate
