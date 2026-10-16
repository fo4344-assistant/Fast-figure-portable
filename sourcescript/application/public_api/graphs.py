"""
Fast Figure Source Script — Application boundary / public-api — graph wrappers

하위 구현 검증 자료: ../../../fast-figure.js, ../../../fast-figure-ui.js, ../../../Fast-figure.html.
Python 표기의 구현 명세이며 application runtime을 실행하는 모듈이 아니다.
"""

from sourcescript.application.adapter import dispatchProjectCommand, dispatchProjectQuery
from sourcescript.frontend.renderer import downloadExportPayload

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
    slot = dispatchProjectQuery("project-api", {"operation": "slots.readSelected", "frontendState": {"selectedSlotId": slotId}})
    event = "SLOT_DATA_CONNECTED if slot has no chart else GRAPH_OBJECTS_REPLACED"
    result, interfaceState, rendererProjection = dispatchProjectCommand(
        event, {"slotId": slotId, "csvId": csvId, "operation": "graphs.addObject"}
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "graphs.readData", "frontendState": {"selectedSlotId": slotId}})["chart"]


def graphEditorObjectValues(chartId, index, values):
    """
    Return:
    - chart:
      지정 object의 허용 field를 정규화해 commit한 chart.

    변경:
    - Backend command 내부의 graphEditorCommit 계산 결과를 projectEFSM이 한 번 commit한다.

    처리:
    chartId/index와 새 values만 GRAPH_OBJECTS_REPLACED command input으로 전달한다.
    Backend command가 graph domain의 graphEditorCommit one-object 계산 규칙을 적용한다.
    성공 뒤에만 공식 query로 chart copy를 반환한다. 실패를 성공 read로 바꾸지 않는다.
    Frontend objects projection 전체를 candidate로 보내거나 current CSV selection을 다시 설정하지 않는다.
    """
    result, interfaceState, rendererProjection = dispatchProjectCommand(
        "GRAPH_OBJECTS_REPLACED",
        {"chartId": chartId, "operation": "graphs.setObjectValues", "index": index, "values": values},
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "graphs.readData", "chartId": chartId})["chart"]


def graphEditorMove(chartId, fromIndex, toIndex):
    """current chart의 from/to를 command에서 재검증하고 성공 뒤 detached chart를 반환한다.
    from=to는 기존 no-op이며 authority/selection을 변경하지 않는다.
    invalid identity/index는 command rejection이고 success read/reconciliation을 실행하지 않는다.
    """
    context = dispatchProjectQuery("project-api", {"operation": "graphs.readData", "chartId": chartId})
    if fromIndex == toIndex and "context의 editable chart에 fromIndex가 유효한 정수 index":
        return context["chart"]
    result, interfaceState, rendererProjection = dispatchProjectCommand(
        "GRAPH_OBJECTS_REPLACED",
        {"chartId": chartId, "operation": "graphs.moveObject", "from": fromIndex, "to": toIndex},
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "graphs.readData", "chartId": chartId})["chart"]


def graphEditorDelete(chartId, index):
    """current index 제거와 explicit-none selection hint는 Backend가 계산한다.
    마지막 object 삭제도 empty chart 성공이다. 실패는 result, 성공만 post-commit chart copy다.
    """
    result, interfaceState, rendererProjection = dispatchProjectCommand(
        "GRAPH_OBJECTS_REPLACED",
        {"chartId": chartId, "operation": "graphs.deleteObject", "index": index},
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "graphs.readData", "chartId": chartId})["chart"]


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
    result, interfaceState, rendererProjection = dispatchProjectCommand(
        "CHART_MODEL_REPLACED",
        {"slotId": slotId, "chartId": chartId, "editable": editable},
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "graphs.readData", "chartId": chartId})["chart"]["editor"]["editable"]


def graphEditorSetHeaderLines(csvId, headerLines):
    """
    변경:
    - resolved CSV의 persistent headerLines.

    처리:
    current CSV를 id로 resolve하고 같은 id/path/bytes/rows를 유지한 replacement candidate를 만든 뒤
    DATA_OBJECT_REPLACED로 commit한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "DATA_OBJECT_REPLACED", {"csvId": csvId, "headerLines": headerLines},
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "assets.readDeletionTarget", "path": "result.changed의 실제 updated CSV path"})["target"]["headerLines"]


def graphEditorUpdateLayout(slotId, chartId, values):
    """
    변경:
    - selected chart의 persistent title/global/axis settings.

    처리:
    Backend command가 current owning chart에 새 values를 적용/정규화한 candidate를 CHART_LAYOUT_CHANGED로 commit한다.
    Plotly graph layout은 commit된 chart settings에서 다시 계산하는 projection이다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "CHART_LAYOUT_CHANGED", {"slotId": slotId, "chartId": chartId, "settings": values},
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "graphs.readLayout", "selectedSlotId": slotId})


def graphEditorApplyPalette(chartId, colors):
    """
    변경:
    - selected chart.editor.objects의 color fields.

    처리:
    current objects에서 color-only candidate를 계산하고 GRAPH_OBJECTS_REPLACED로 commit한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "GRAPH_OBJECTS_REPLACED", {"chartId": chartId, "operation": "graphs.applyPalette", "colors": colors}
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "graphs.readData", "chartId": chartId})["chart"]


def importSelectedGraphFile(slotId, file):
    """
    변경:
    - 선택 slot의 chart model과 package가 필요로 하는 CSV asset.

    처리:
    Application은 explicit slotId와 file만 전달한다. Backend SLOT_CHART_IMPORTED가 다음 계산을 수행한다.
    FFSX면 ffsxReadSlot 검증 결과로 applyFfsxSlot candidate를 만든다.
    Plotly JSON이면 parsePlotlyToEditor로 non-editable imported chart candidate를 만든다.
    두 경우 모두 target slot이 새 chart를 유일하게 소유하는 whole-project candidate를 검증한 뒤 그 command가 한 번 commit한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("SLOT_CHART_IMPORTED", {"slotId": slotId, "file": file})
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "graphs.readData", "frontendState": {"selectedSlotId": slotId}})["chart"]


def exportSelectedGraph(slotId, operation):
    """
    graphs.exportFfsx/exportPlotlyJson의 public binding이 현재 selectedSlotId와 두 기존 operation 중 하나를 전달한다.
    export query는 visible graph slot/chart를 같은 current authority에서 resolve하고 package 또는 semantic figure를 복사한다.
    target 없음은 경고 후 None이며 download하지 않는다. 정상 download handoff 반환도 기존 side-effect API의 None이다.
    None을 disk 저장 성공 신호로 해석하지 않는다. query/encoding/handoff 오류는 lifecycle을 거쳐 전파한다.
    """
    payload = dispatchProjectQuery("export", {"operation": operation, "slotId": slotId, "stamp": "이번 호출의 UTC ISO timestamp"})
    if payload is None:
        return None
    return downloadExportPayload(payload)
