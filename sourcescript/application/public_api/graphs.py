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

    입력: slotId는 이번 추가 대상의 visible slot id, csvId는 추가할 실제 project CSV id다.
    처리:
    1. slotId를 slots.readSelected query에 전달하여 현재 visible slot을 얻는다.
       slot이 없으면 None을 반환한다. slotId 0도 그대로 조회한다.
    2. slot["content"]["chart"]가 None이면 SLOT_DATA_CONNECTED를 선택한다.
       chart id가 있으면 GRAPH_OBJECTS_REPLACED를 선택한다.
       두 command 모두 slotId, csvId와 operation=graphs.addObject를 입력받는다.
    3. Backend는 현재 slot과 CSV를 다시 해결한다. SLOT_DATA_CONNECTED는 빈 chart 참조를 확인하고
       첫 chart와 object를 만든다. GRAPH_OBJECTS_REPLACED는 현재 소유 editable chart에 object를 추가한다.
       graphs.GRAPH_OBJECT_NORMALIZATION_RULE에 따라 같은 현재 CSV에서 새 object를 계산하고
       whole-project candidate를 검증하여 한 번 반영한다.
    4. 미반영 result는 그대로 반환한다. 반영 성공이면 명시한 slotId로 graphs.readData를 조회하여 chart를 반환한다.
       조회·명령 오류는 호출자에 전파한다. slotId와 csvId는 이 호출의 대상 참조로 유지한다.
    """
    slot = dispatchProjectQuery("project-api", {"operation": "slots.readSelected", "frontendState": {"selectedSlotId": slotId}})
    if slot is None:
        return None
    event = "SLOT_DATA_CONNECTED" if slot["content"]["chart"] is None else "GRAPH_OBJECTS_REPLACED"
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
    입력:
    slotId는 대상 slot의 id, chartId는 그 slot이 소유해야 하는 chart의 id다.
    values는 sourcescript/backend/graphs.py의 chartModel.editor에서 title과 globalSettings에 해당하는 부분 record다.
    values.globalSettings는 같은 파일의 globalSettings, 그 axes의 각 축은 axisSettings 구조를 따른다.
    생략한 항목은 현재 값을 유지하고, 포함한 항목에는 이번 입력값을 적용한다.

    처리:
    1. slotId, chartId, values를 CHART_LAYOUT_CHANGED의 slotId, chartId, settings로 전달한다.
    2. Backend는 현재 visible slot과 소유 chart를 해결하고 두 id의 소유 관계를 확인한다.
       candidate의 현재 title/globalSettings에 새 항목을 적용하며 axes는 축 이름과 설정 항목별로 합친다.
       normalizeGlobalSettings와 normalizeAxisSettings로 정규화하고 같은 candidate의 graph를 재계산한다.
       whole-project 검증 뒤 한 번 반영한다.
    3. 미반영 result는 그대로 반환한다. 성공이면 slotId의 graphs.readLayout을 새로 조회하여 반환한다.
       조회·명령 오류는 호출자에 전파한다.
    변경: 해당 chart의 editor.title/editor.globalSettings와 그 설정에서 계산한 graph.
    반환: 성공 후 title/global/axis 읽기 결과 또는 미반영 result.
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
    입력: slotId는 파일 입력을 받은 시점에 호출자가 정한 대상 id, file은 이 작업의 파일 입력이다.
    처리:
    1. 받은 slotId와 file을 SLOT_CHART_IMPORTED에 전달한다. 이 작업에서 사용하는 slotId를 유지한다.
    2. Backend는 현재 project에서 slotId의 visible slot을 해결한다. 대상이 없으면 그 오류를 반환한다.
    3. FFSX이면 ffsxReadSlot로 package를 검증하고 applyFfsxSlot로 필요한 CSV와 chart candidate를 만든다.
       Plotly JSON이면 parsePlotlyToEditor로 원본 figure와 conversion view를 보존한 non-editable chart candidate를 만든다.
    4. 대상 slot이 새 chart를 유일하게 소유하는 whole-project candidate를 검증하고 한 번 반영한다.
    5. 미반영 result는 그대로 반환한다. 성공이면 받은 slotId로 graphs.readData를 조회하여 chart를 반환한다.
       파일 읽기·해석·현재 대상 검증·command·후속 조회 오류는 기존 Application lifecycle에 전파한다.
    변경: 명시한 slot의 chart model과 package 적용에 필요한 project CSV asset.
    반환: 반영된 chart 또는 미반영 result.
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
