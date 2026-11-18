"""
Fast Figure Source Script — Application boundary / public-api contract

하위 구현 검증 자료: ../../../fast-figure.js, ../../../fast-figure-ui.js, ../../../Fast-figure.html.
Python 문법으로 작성한 구현 명세다.
"""

from sourcescript.backend.project_state import BACKEND_QUERY_KINDS
from sourcescript.application import adapter
from sourcescript.frontend.interface_fsm import INTERFACE_EVENTS
from sourcescript.application.public_api import assets, graphs, layout_annotations




def readSelectedSlot():
    slotId = "선택 슬롯의 정수 id 또는 None."
    slot = "읽기 전용 Slot 또는 None."
    """
    Args:
    - 없음.

    Return:
    - slot:
      읽기 전용 Slot 또는 None.
      선택 slot의 읽기전용 copy. 선택 해제 또는 visible 대상 소멸이면 None.

    변경:
    - 없음.

    처리:
        1. adapter.appFSM.readState()의 현재 selectedSlotId를 slotId에 둔다. None은 선택 해제이고 0은 유효하다.
        2. operation=BACKEND_QUERY_KINDS['project-api']['slots.readSelected']와 frontendState의 selectedSlotId=slotId를 담아 adapter.dispatchProjectQuery("project-api", 요청)를 호출한다.
        3. Backend는 같은 현재 프로젝트에서 resolveVisibleSlot로 대상을 찾고 읽기 전용 Slot 또는 None을 반환한다.
        4. 조회 결과를 slot에 두고 반환한다. 조회 오류는 호출자에게 전달한다.
    """
    return slot


def readGraphData():
    current = "Frontend 상태 읽기 딕셔너리."
    graphData = "chart·objects·선택 index·currentCsv·열 정의 딕셔너리."
    """
    Args:
    - 없음.

    Return:
    - graphData:
      chart·objects·선택 index·currentCsv·열 정의 딕셔너리.
      기존 graphs.readData record. chart는 selectedSlotId가 가리키는 slot의 소유 chart,
      currentCsv는 assetSelection=csv이고 assetPath가 가리키는 현재 CSV다.
      record의 나머지 필드는 sourcescript/backend/project_state.py의 graphs.readData 계약을 따른다.

    변경:
    - 없음.

    처리:
        1. adapter.appFSM.readState()를 current에 두고 selectedSlotId·assetSelection·assetPath·graphObject·graphObjectIndex를 읽는다.
        2. 그 필드만 frontendState에 넣고 operation=BACKEND_QUERY_KINDS['project-api']['graphs.readData']로 adapter.dispatchProjectQuery("project-api", 요청)를 호출한다.
        3. Backend는 같은 현재 프로젝트의 visible Slot.content["chart"]로 chart를 찾는다. CSV 선택이면 assetPath로 currentCsv와 columns를 찾는다.
           선택 object의 csvId로 objectColumns를 별도로 구하며 각 누락 결과는 backend.project_state.readBackendProjection의 처리["graphs.readData"]를 따른다.
        4. 반환값을 graphData에 두고 반환한다. 조회 오류는 호출자에게 전달한다.
    """
    return graphData


PUBLIC_API_METHODS = {
    'workspace': {
        'render': adapter.renderWholeWorkspace,
    },
    'project': {
        'readName': ('query', BACKEND_QUERY_KINDS['project-api']['project.readName'], ()),
        'setName': layout_annotations.setProjectName,
        'importFile': assets.importProjectFile,
        'exportFile': assets.downloadProject,
    },
    'slots': {
        'readSelected': readSelectedSlot,
        'select': adapter.dispatchSlotSelection,
        'setContentType': layout_annotations.setSlotContentType,
        'reset': layout_annotations.resetSlotApi,
        'swap': layout_annotations.swapSlots,
        'prepareFileDrop': layout_annotations.prepareDashboardFileDrop,
        'finishFileDrop': layout_annotations.finishDashboardFileDrop,
    },
    'images': {
        'readEditor': ('query', BACKEND_QUERY_KINDS['project-api']['images.readEditor'], ()),
        'setSettings': layout_annotations.applyImageSettingsFromValues,
        'insertEmpty': layout_annotations.insertEmptyImageIntoSelectedSlot,
    },
    'assets': {
        'readDeletionTarget': ('query', BACKEND_QUERY_KINDS['project-api']['assets.readDeletionTarget'], ('path',)),
        'delete': assets.deleteProjectAsset,
        'readTree': ('query', BACKEND_QUERY_KINDS['project-api']['assets.readTree'], ()),
        'isTrashed': ('query', BACKEND_QUERY_KINDS['project-api']['assets.isTrashed'], ('path',)),
        'movable': ('query', BACKEND_QUERY_KINDS['project-api']['assets.movable'], ('path',)),
        'readTrash': ('query', BACKEND_QUERY_KINDS['project-api']['assets.readTrash'], ()),
        'moveOptions': ('query', BACKEND_QUERY_KINDS['project-api']['assets.moveOptions'], ('path',)),
        'planMove': ('query', BACKEND_QUERY_KINDS['project-api']['assets.planMove'], ('path', 'directory')),
        'move': assets.moveProjectNode,
        'createDirectory': assets.createProjectDirectory,
        'createEmptyCsv': assets.createEmptyProjectCsvAndSelect,
        'emptyTrash': assets.emptyProjectTrash,
        'draggableAsset': ('query', BACKEND_QUERY_KINDS['project-api']['assets.draggableAsset'], ('path',)),
        'connectToSlot': assets.connectProjectAssetToSlot,
        'importToDirectory': assets.importProjectFilesToDirectory,
        'importToSlot': assets.importProjectFileToSlot,
        'fileKind': assets.readAssetFileKind,
        'importFiles': assets.importProjectAssetFiles,
        'collisionModel': assets.readAssetCollisionModel,
        'resolveImportPlan': assets.readAssetImportPlan,
        'selectDirectory': ('event', INTERFACE_EVENTS['SELECT_ASSET'], 'directory'),
        'selectCsv': assets.selectProjectCsv,
        'selectImage': ('event', INTERFACE_EVENTS['SELECT_ASSET'], 'image'),
        'download': assets.downloadProjectAsset,
    },
    'graphs': {
        'readData': readGraphData,
        'readLayout': ('query', BACKEND_QUERY_KINDS['project-api']['graphs.readLayout'], ()),
        'readPalette': ('query', BACKEND_QUERY_KINDS['project-api']['graphs.readPalette'], ()),
        'selectCsv': assets.selectProjectCsv,
        'setHeaderLines': graphs.graphEditorSetHeaderLines,
        'setEditable': graphs.graphEditorSetEditable,
        'addObject': graphs.graphEditorAdd,
        'moveObject': graphs.graphEditorMove,
        'selectObject': ('event', INTERFACE_EVENTS['SELECT_GRAPH_OBJECT']),
        'setObjectValues': graphs.graphEditorObjectValues,
        'deleteObject': graphs.graphEditorDelete,
        'updateLayout': graphs.graphEditorUpdateLayout,
        'applyPalette': graphs.graphEditorApplyPalette,
        'defaultColors': ('query', BACKEND_QUERY_KINDS['project-api']['graphs.defaultColors'], ()),
        'hasSelectedSlot': ('query', BACKEND_QUERY_KINDS['project-api']['graphs.hasSelectedSlot'], ()),
        'importFile': graphs.importSelectedGraphFile,
        'exportFfsx': ('call', graphs.exportSelectedGraph, BACKEND_QUERY_KINDS['project-api']['graphs.exportFfsx']),
        'exportPlotlyJson': ('call', graphs.exportSelectedGraph, BACKEND_QUERY_KINDS['project-api']['graphs.exportPlotlyJson']),
    },
    'print': {
        'readSettings': ('query', BACKEND_QUERY_KINDS['project-api']['print.readSettings'], ()),
        'setSettings': layout_annotations.setExportSettings,
        'save': layout_annotations.exportDashboardTarget,
        'capture': layout_annotations.captureDashboardCurrent,
    },
    'captions': {
        'readGlobal': ('query', BACKEND_QUERY_KINDS['project-api']['captions.readGlobal'], ()),
        'readSlot': ('query', BACKEND_QUERY_KINDS['project-api']['captions.readSlot'], ('slotId',)),
        'setEnabled': layout_annotations.setCaptionsApiEnabled,
        'setGlobalText': layout_annotations.setGlobalCaptionText,
        'setSlotText': layout_annotations.setSlotCaptionText,
        'insertSlotCaptions': layout_annotations.insertSlotCaptionsIntoGlobalCaption,
        'setName': layout_annotations.setCaptionsApiName,
        'setNameBold': layout_annotations.setCaptionsApiNameBold,
        'setSettings': layout_annotations.setCaptionsApiSettings,
    },
    'labels': {
        'readState': layout_annotations.readLabelsApiState,
        'setEnabled': layout_annotations.setLabelsApiEnabled,
        'setSettings': layout_annotations.setLabelsApiSettings,
        'setPosition': layout_annotations.setLabelsApiPosition,
        'finishPositionInteraction': layout_annotations.finishLabelsApiPositionInteraction,
        'resetPosition': layout_annotations.resetLabelsApiPosition,
    },
    'appearance': {
        'readPalette': ('query', BACKEND_QUERY_KINDS['project-api']['appearance.readPalette'], ()),
        'setPalette': layout_annotations.setAppearanceApiPalette,
        'resetPalette': layout_annotations.resetAppearanceApiPalette,
    },
    'layout': {
        'readState': layout_annotations.readLayoutApiState,
        'setStyle': layout_annotations.setLayoutApiStyle,
        'setGrid': layout_annotations.setLayoutApiGrid,
        'setZoom': layout_annotations.setLayoutApiZoom,
        'commitZoom': layout_annotations.commitLayoutApiZoom,
        'resetZoom': layout_annotations.resetLayoutApiZoom,
        'mergeSlots': layout_annotations.mergeSlots,
        'splitSlots': layout_annotations.splitSlots,
    },
}
















def createPublicApi():
    api = "공개 API namespace 오브젝트."
    binding = "PUBLIC_API_METHODS의 메서드 연결값."
    request = "Backend 조회 인자 딕셔너리."
    current = "Frontend 상태 읽기 딕셔너리."
    task = "공개 operation의 작업 함수."
    """
    Args:
    - 없음.

    Return:
    - api:
      workspace·project·slots·images·assets·graphs·print·captions·labels·appearance·layout namespace 오브젝트.

    변경:
    - 없음.

    처리:
        1. api에 PUBLIC_API_METHODS의 namespace별 오브젝트를 만들고 각 메서드의 binding을 읽는다.
           각 callable의 본문을 다음 연결 절차로 구성한다. 인자 조회와 작업 실행은 그 callable이 호출될 때 수행한다.
        2. binding이 함수 참조이면 callable은 그 함수에 입력을 기존 인자 순서대로 전달한다.
           반환값 또는 오류를 호출자에게 전달한다.
        3. query binding의 두 번째 원소는 operation, 세 번째 원소는 위치 인자의 필드 이름 tuple이다.
           callable은 그 이름과 입력을 짝지어 request를 만들고 operation을 넣는다.
           images.readEditor이면 adapter.appFSM.readState()의 selectedSlotId를 request의 slotId에 넣는다.
           graphs.readLayout/readPalette/hasSelectedSlot이면 현재 selectedSlotId를 request에 넣는다.
           adapter.dispatchProjectQuery("project-api", request)를 한 번 호출하고 결과 또는 오류를 전달한다.
        4. event binding이면 callable이 adapter.dispatchInterfaceEvent를 한 번 호출하도록 연결한다.
           이벤트 값이 INTERFACE_EVENTS["SELECT_ASSET"]이면 binding의 세 번째 원소인 kind와 입력 path를 전달한다.
           INTERFACE_EVENTS["SELECT_GRAPH_OBJECT"]이면 입력 index와 selectAsset=True를 전달한다.
           adapter가 현재 프로젝트 참조를 검증하여 만든 결과를 callable의 결과로 전달한다.
        5. project.importFile의 callable은 assets.importProjectFile에 입력 file을 전달하는 task를 만든다.
           이 helper가 PROJECT_LOADED의 미반영 결과 또는 성공 후 export 조회 결과를 반환한다.
           file 읽기·명령·성공 후 조회의 오류와 취소 결과는 해당 task의 결과로 전달한다.
        6. call binding은 두 번째 원소의 함수 참조와 세 번째 원소의 operation 식별자를 가진다.
           callable은 그 함수에 입력 slotId와 operation을 기존 인자 순서대로 전달한다.
        7. project.importFile, assets.importToDirectory/importToSlot/importFiles, graphs.importFile의 callable은
           해당 작업을 importing task로 adapter.runLifecycleTask에 한 번 전달한다.
           project.exportFile, assets.download, graphs.exportFfsx/exportPlotlyJson, print.save/capture는
           exporting task로 한 번 전달한다. task 안에서 helper를 직접 호출한다.
           runLifecycleTask의 성공·미반영·취소 반환값과 원래 오류를 callable의 결과로 전달한다.
        8. api를 반환한다.
    """
    return api


FastFigureApi = createPublicApi()
