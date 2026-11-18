"""
Fast Figure Source Script — Application boundary / public-api — graph wrappers

하위 구현 검증 자료: ../../../fast-figure.js, ../../../fast-figure-ui.js, ../../../Fast-figure.html.
Python 문법으로 작성한 구현 명세다.
"""

from sourcescript.backend.project_state import BACKEND_QUERY_KINDS
from sourcescript.application.adapter import dispatchProjectCommand, dispatchProjectQuery
from sourcescript.frontend.renderer import downloadExportPayload

def graphEditorAdd(slotId, csvId):
    outcome = "chart 식별·제목·편집 가능 여부 딕셔너리, 미반영 ProjectMutationResult 또는 None."
    slot = "Slot 인스턴스 또는 None."
    event = "Project EFSM 명령 이름 문자열."
    """
    Args:
    - slotId:
      대상 visible Slot의 정수 id. 0도 유효하다.

    - csvId:
      현재 프로젝트 CSV의 정수 id.

    Return:
    - outcome:
      chart 식별·제목·편집 가능 여부 딕셔너리, 미반영 ProjectMutationResult 또는 None.

    변경:
    - 대상 Slot의 chart 참조와 chart의 editor["objects"] 및 graph.

    처리:
        1. dispatchProjectQuery("project-api", {"operation": BACKEND_QUERY_KINDS['project-api']['slots.readSelected'],
           "selectedSlotId": slotId})로 slot을 얻는다. 없으면 outcome=None을 반환한다.
        2. slot.content["chart"]가 None이면 event를 SLOT_DATA_CONNECTED로, 그 외에는
           GRAPH_OBJECTS_REPLACED로 둔다.
        3. dispatchProjectCommand(event, {slotId, csvId, operation: graphs.addObject})를 호출한다.
           Backend는 현재 Slot과 CSV를 조회하고 editable chart의 object 추가 또는 새 chart 생성을
           계산하여 전체 프로젝트 검증 후 한 번 반영한다.
        4. 명령 결과의 committed가 False이면 그 결과를 outcome에 두고 반환한다.
           True이면 dispatchProjectQuery("project-api", {"operation": BACKEND_QUERY_KINDS['project-api']['graphs.readControls'],
           "selectedSlotId": slotId})를 조회하고 결과의 chart를 outcome에 둔다.
           실패는 호출자에게 전파한다.
    """
    return outcome


def graphEditorObjectValues(chartId, index, values):
    outcome = "chart 식별·제목·편집 가능 여부 딕셔너리 또는 미반영 ProjectMutationResult."
    """
    Args:
    - chartId:
      대상 chart의 정수 id.

    - index:
      변경할 object의 0-based 정수 index.

    - values:
      graphObject 원형의 변경 항목을 담은 딕셔너리.

    Return:
    - outcome:
      chart 식별·제목·편집 가능 여부 딕셔너리 또는 미반영 ProjectMutationResult.

    변경:
    - 대상 object와 같은 chart의 graph.

    처리:
        1. GRAPH_OBJECTS_REPLACED에 chartId, index, values와 operation=graphs.setObjectValues를 전달한다.
        2. Backend는 현재 editable chart의 index와 실제 참조 CSV를 확인하고
           graphs.graphEditorCommit으로 지정 object의 필드를 정규화한다.
           다른 object와 확장 필드를 보존하고 전체 검증 뒤 반영한다.
        3. 명령 결과의 committed가 False이면 그 결과를 outcome에 두고 반환한다.
           True이면 dispatchProjectQuery("project-api", {"operation": BACKEND_QUERY_KINDS['project-api']['graphs.readControls'],
           "chartId": chartId})를 조회하고 결과의 chart를 outcome에 둔다.
           실패는 호출자에게 전파한다.
    """
    return outcome


def graphEditorMove(chartId, fromIndex, toIndex):
    outcome = "chart 식별·제목·편집 가능 여부 딕셔너리 또는 미반영 ProjectMutationResult."
    """
    Args:
    - chartId:
      대상 chart id.

    - fromIndex:
      이동할 object의 0-based index.

    - toIndex:
      이동 후 놓을 0-based index.

    Return:
    - outcome:
      chart 식별·제목·편집 가능 여부 딕셔너리 또는 미반영 ProjectMutationResult.

    변경:
    - chart["editor"]["objects"]의 순서와 graph 및 선택 index.

    처리:
        1. dispatchProjectQuery("project-api", {"operation": BACKEND_QUERY_KINDS['project-api']['graphs.readData'], "chartId": chartId})를
           조회한다. fromIndex=toIndex이고 editable chart의 유효한
           정수 index이면 현재 chart를 outcome에 두어 반환한다.
        2. 그 외에는 GRAPH_OBJECTS_REPLACED에 chartId, operation=graphs.moveObject,
           from=fromIndex, to=toIndex를 전달한다. Backend가 현재 index들을 검증하고 이동과
           object index mapping을 같은 candidate에 계산한다.
        3. 명령 결과의 committed가 False이면 그 결과를 outcome에 두고 반환한다.
           True이면 dispatchProjectQuery("project-api", {"operation": BACKEND_QUERY_KINDS['project-api']['graphs.readControls'],
           "chartId": chartId})를 조회하고 결과의 chart를 outcome에 둔다.
           실패는 호출자에게 전파한다.
    """
    return outcome


def graphEditorDelete(chartId, index):
    outcome = "chart 식별·제목·편집 가능 여부 딕셔너리 또는 미반영 ProjectMutationResult."
    """
    Args:
    - chartId:
      대상 chart id.

    - index:
      삭제할 object의 0-based index.

    Return:
    - outcome:
      chart 식별·제목·편집 가능 여부 딕셔너리 또는 미반영 ProjectMutationResult.

    변경:
    - chart["editor"]["objects"]와 graph 및 선택 index.

    처리:
        1. GRAPH_OBJECTS_REPLACED에 chartId, index, operation=graphs.deleteObject를 전달한다.
        2. Backend가 현재 index를 확인하여 해당 object를 제거하고 선택 해제 hint를 만든다.
           마지막 object 삭제는 빈 editable chart로 반영한다.
        3. 명령 결과의 committed가 False이면 그 결과를 outcome에 두고 반환한다.
           True이면 dispatchProjectQuery("project-api", {"operation": BACKEND_QUERY_KINDS['project-api']['graphs.readControls'],
           "chartId": chartId})를 조회하고 결과의 chart를 outcome에 둔다.
           실패는 호출자에게 전파한다.
    """
    return outcome


def graphEditorSetEditable(slotId, chartId, editable):
    outcome = "논리값 또는 미반영 ProjectMutationResult."
    """
    Args:
    - slotId:
      chart를 소유하는 Slot의 id.

    - chartId:
      대상 chart id.

    - editable:
      새 편집 가능 여부인 논리값.

    Return:
    - outcome:
      논리값 또는 미반영 ProjectMutationResult.

    변경:
    - chart의 편집 가능 여부와 전환에 필요한 CSV·object 참조.

    처리:
        1. CHART_MODEL_REPLACED에 slotId, chartId, editable을 전달한다.
        2. Backend가 현재 Slot의 소유 관계를 확인한다. conversion object와 rows가 있는 imported
           chart를 editable로 전환할 때 실제 CSV를 생성하여 object의 csvId를 연결하고
           next-id 변경을 같은 candidate에 포함한다. object가 없으면 빈 editable chart로 전환한다.
        3. 미반영이면 명령 결과를 outcome에 둔다. 반영되면 chartId의 graphs.readControls를 조회하여
           chart["editor"]["editable"]을 outcome에 둔다. 오류는 호출자에게 전파한다.
    """
    return outcome


def graphEditorSetHeaderLines(csvId, headerLines):
    outcome = "헤더 행 수 또는 미반영 ProjectMutationResult."
    """
    Args:
    - csvId:
      대상 CSV id.

    - headerLines:
      새 헤더 행 수.

    Return:
    - outcome:
      헤더 행 수 또는 미반영 ProjectMutationResult.

    변경:
    - CSV의 headerLines와 이를 참조하는 chart의 graph.

    처리:
        1. DATA_OBJECT_REPLACED에 csvId와 headerLines를 전달한다. Backend가 현재 CSV의
           id·path·bytes·rows를 보존하면서 새 headerLines를 정규화하고 참조 graph를 계산한다.
        2. 미반영이면 명령 결과를 반환한다. 반영되면 result["changed"]에서 실제 변경 CSV path를
           확인한 뒤 graphs.readControls에 explicit csvId를 전달하고 currentCsv["headerLines"]를 outcome에 둔다.
           조회와 명령 오류는 호출자에게 전파한다.
    """
    return outcome


def graphEditorUpdateLayout(slotId, chartId, values):
    outcome = "graphs.readLayout 결과 또는 미반영 ProjectMutationResult."
    """
    Args:
    - slotId:
      대상 Slot id.

    - chartId:
      그 Slot이 소유하는 chart id.

    - values:
      chartModel.editor의 title/globalSettings 부분 딕셔너리. 축은 globalSettings.axes와 axisSettings 원형을 따른다.

    Return:
    - outcome:
      graphs.readLayout 결과 또는 미반영 ProjectMutationResult.

    변경:
    - chart의 editor["title"]·globalSettings와 graph.

    처리:
        1. CHART_LAYOUT_CHANGED에 slotId, chartId, settings=values를 전달한다.
        2. Backend가 현재 소유 관계를 확인하고 title과 globalSettings를 항목별로 합친다.
           axes는 축 이름과 하위 항목별로 합친 뒤 normalizeGlobalSettings와
           normalizeAxisSettings를 적용하고 graph를 계산하여 전체 검증 후 반영한다.
        3. 미반영이면 명령 결과를 반환한다. 성공이면 dispatchProjectQuery("project-api",
           {"operation": BACKEND_QUERY_KINDS['project-api']['graphs.readLayout'], "selectedSlotId": slotId})의 결과를
           outcome에 두고 반환한다. 오류는 호출자에게 전파한다.
    """
    return outcome


def graphEditorApplyPalette(chartId, colors):
    outcome = "chart 식별·제목·편집 가능 여부 딕셔너리 또는 미반영 ProjectMutationResult."
    """
    Args:
    - chartId:
      대상 chart id.

    - colors:
      색상 문자열의 비어 있지 않은 배열.

    Return:
    - outcome:
      chart 식별·제목·편집 가능 여부 딕셔너리 또는 미반영 ProjectMutationResult.

    변경:
    - chart["editor"]["objects"]의 색상과 graph.

    처리:
        1. GRAPH_OBJECTS_REPLACED에 chartId, operation=graphs.applyPalette, colors를 전달한다.
        2. Backend는 현재 object 순서에서 index를 colors 길이로 나눈 나머지의 색상을 적용한다.
           색상 외 object 필드는 유지하고 graph와 전체 candidate를 검증하여 반영한다.
        3. 명령 결과의 committed가 False이면 그 결과를 outcome에 두고 반환한다.
           True이면 dispatchProjectQuery("project-api", {"operation": BACKEND_QUERY_KINDS['project-api']['graphs.readControls'],
           "chartId": chartId})를 조회하고 결과의 chart를 outcome에 둔다.
           실패는 호출자에게 전파한다.
    """
    return outcome


def importSelectedGraphFile(slotId, file):
    outcome = "chart 식별·제목·편집 가능 여부 딕셔너리 또는 미반영 ProjectMutationResult."
    """
    Args:
    - slotId:
      파일 입력 시 호출자가 정한 대상 id. 작업 동안 유지한다.

    - file:
      이 작업의 파일 이름·형식·바이트 입력.

    Return:
    - outcome:
      chart 식별·제목·편집 가능 여부 딕셔너리 또는 미반영 ProjectMutationResult.

    변경:
    - 대상 Slot의 chart와 FFSX가 사용하는 CSV asset.

    처리:
        1. SLOT_CHART_IMPORTED에 slotId와 file을 전달한다. Backend가 현재 visible 대상의 존재를 확인한다.
        2. FFSX는 ffsxReadSlot로 해석하고 applyFfsxSlot로 CSV id와 chart 참조를 구성한다.
           Plotly JSON은 parsePlotlyToEditor로 원본과 conversion view를 가진 chart를 구성한다.
        3. Backend는 대상 Slot의 단일 chart 소유 관계를 포함한 전체 candidate를 검증하고 반영한다.
        4. 명령 결과의 committed가 False이면 그 결과를 outcome에 두고 반환한다.
           True이면 dispatchProjectQuery("project-api", {"operation": BACKEND_QUERY_KINDS['project-api']['graphs.readControls'],
           "selectedSlotId": slotId})를 조회하고 결과의 chart를 outcome에 둔다.
           실패는 호출자에게 전파한다.
    """
    return outcome


def exportSelectedGraph(slotId, operation):
    outcome = "None."
    """
    Args:
    - slotId:
      내보낼 visible graph Slot의 id.

    - operation:
      graphs.exportFfsx 또는 graphs.exportPlotlyJson.

    Return:
    - outcome:
      None.

    변경:
    - 브라우저 다운로드 전달.

    처리:
        1. 이번 호출의 UTC ISO timestamp를 만들고 slotId·operation·stamp로 export 조회를 호출한다.
        2. 현재 graph Slot 또는 chart가 없으면 조회의 경고 결과에 따라 None을 반환한다.
        3. 다운로드 payload가 있으면 downloadExportPayload에 전달한다. handoff 뒤 outcome=None을
           반환하고 조회·encoding·handoff 오류는 lifecycle 호출자에게 전파한다.
    """
    return outcome
