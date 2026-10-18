"""
Fast Figure Source Script — Application boundary / public-api — asset wrappers

하위 구현 검증 자료: ../../../fast-figure.js, ../../../fast-figure-ui.js, ../../../Fast-figure.html.
Python 표기의 구현 명세이며 application runtime을 실행하는 모듈이 아니다.
"""

from sourcescript.application.adapter import dispatchProjectCommand, dispatchProjectQuery, dispatchInterfaceEvent, dispatchSlotSelection
from sourcescript.backend.assets_files import EMPTY_CSV_TEMPLATE, PROJECT_ASSET_DIRECTORIES
from sourcescript.frontend.interface_fsm import interfaceFSM
from sourcescript.frontend.renderer import downloadExportPayload
from sourcescript.application.public_api.graphs import importSelectedGraphFile

def readAssetFileKind(file):
    """assets.fileKind: copied name/type만 공식 pure query에 전달하고 kind 문자열을 그대로 반환한다."""
    return dispatchProjectQuery("project-api", {"operation": "assets.fileKind", "file": "file의 name/type copy"})


def readAssetCollisionModel(file, directory, reservedPaths):
    """assets.collisionModel: immutable 한 작업용 model; UI choice는 이 query 밖에서 수집한다."""
    return dispatchProjectQuery("project-api", {
        "operation": "assets.collisionModel", "file": file, "directory": directory, "reservedPaths": reservedPaths,
    })


def readAssetImportPlan(model, choice, reservedPaths):
    """assets.resolveImportPlan: UI 제안과 explicit choice만 전달; 오류는 전파하고 commit/예약으로 취급하지 않는다."""
    return dispatchProjectQuery("project-api", {
        "operation": "assets.resolveImportPlan", "model": model, "choice": choice, "reservedPaths": reservedPaths,
    })


def selectProjectCsv(path):
    """
    assets.selectCsv의 Application operation. current assets.readDeletionTarget으로 CSV identity를 확인한다.
    missing/wrong-kind면 none 반환, event/notify/Project/Frontend 변경 없음.
    valid면 scalar canonical path/kind만 dispatchInterfaceEvent SELECT_ASSET에 전달한다.
    Backend 재검증을 통과한 SELECT_ASSET이 asset selection을 바꾸고 graphObject/index를 함께 clear한다.
    slot/workspace와 ProjectObject는 유지한다. 별도 CLEAR_GRAPH_OBJECT 선행 전이는 만들지 않는다.
    거부되면 none이고 selection을 성공으로 반환하지 않는다. 성공하면 공식 query의 detached CSV를 반환한다.
    event 직전 Frontend revision과 final revision을 비교한다. accepted SELECT_ASSET은 같은 값도 revision을 1 증가시키며,
    revision이 증가하지 않았다면 예전 assetPath가 같아도 거부이므로 none이다.
    query/adapter throw는 전파한다. projection 전체를 command candidate로 전달하거나 장기 저장하지 않는다.
    """
    resolved = dispatchProjectQuery("project-api", {"operation": "assets.readDeletionTarget", "path": path})
    target = "resolved의 detached CSV target; missing/wrong-kind면 event 전에 즉시 none 반환"
    priorRevision = interfaceFSM.readState()["revision"]
    finalState = dispatchInterfaceEvent("SELECT_ASSET", {"kind": "csv", "path": "target의 canonical path"})
    if finalState["revision"] <= priorRevision:
        return None
    return "finalState가 요청 CSV selection이면 공식 query의 detached CSV, 아니면 none"


def createEmptyProjectCsvAndSelect():
    """
    assets.createEmptyCsv의 public create-and-select operation.
    1. createEmptyProjectCsv의 일반 create command를 정확히 한 번 실행한다.
    2. 미commit 결과면 그대로 반환하며 SELECT_ASSET/성공 read를 하지 않는다. throw는 전파한다.
    3. committed CSV의 scalar canonical path로 selectProjectCsv를 호출한다. graph object/chart 생성 없음.
    4. 성공 시 선택된 detached CSV를 반환한다. selection 거부는 none, query/adapter throw는 전파한다.
       create는 이미 commit되었으므로 사후 selection/read 실패를 미commit으로 위장하거나 asset을 rollback하지 않는다.
    """
    csv = createEmptyProjectCsv()
    return "미commit이면 원래 failure; committed CSV이면 selectProjectCsv(csv canonical path) 결과"


def importProjectFilesToDirectory(files, directory, planImport):
    """
    변경:
    - 전체 candidate가 검증된 뒤 CSV/image collection과 관련 reference를 한 번 commit한다.

    처리:
    1. Application은 pure file-byte read/parse와 readAssetFileKind/readAssetCollisionModel/readAssetImportPlan의 공식 query 및 UI choice 수집을 수행할 수 있다.
       planImport의 UI-local resolver를 완료하여 이번 batch의 명시적 choices를 얻는다. 취소면 command 없이 None을 반환한다.
       path/id를 포함한 candidate project를 만들거나 Backend에 resolver callback을 넘기지 않는다.
    2. ASSETS_IMPORTED에 copied file inputs, explicit directory와 choices만 전달한다.
    3. Backend command가 buildProjectAssetImportCandidate로 current directory/collision/id/reference와 whole-project candidate를 계산한다.
       choice 대기 뒤의 current state 재검증과 one commit은 sourcescript.backend.project_efsm의 공통 send 규칙을 사용한다.
    4. parse/collision/reference/validation 실패는 미commit result로 끝난다. 성공만 result.changed에 기록된 input 순서의 실제 asset path를 공식 query로 다시 읽어 detached asset 목록을 반환한다. empty input은 []이며 command가 없다.

    의미:
    batch import는 mutate 후 rollback이 아니라 command 안의 candidate-first commit을 기본으로 한다.
    """
    choices = "기존 collision query와 planImport UI resolver로 완료한 이번 batch의 choice 값; 취소면 즉시 반환"
    result, interfaceState, rendererInput = dispatchProjectCommand("ASSETS_IMPORTED", {"files": files, "directory": directory, "choices": choices})
    if not result.committed:
        return result
    return "result.changed의 input-order asset paths 각각을 assets.readDeletionTarget query한 target 목록"


def createProjectCsv(data, name, id, bytesBase64, mime, headerLines, path):
    """
    Return:
    - csv:
      성공 뒤 공식 query로 읽은 등록 CSV의 immutable projection; 미commit이면 해당 command failure를 반환한다.

    변경:
    - DATA_OBJECT_CREATED event를 통해 activeProject.csvFiles와 next csv id를 변경한다.

    처리:
    Application은 새 data/name/bytes/MIME/headerLines/path/id 입력만 전달한다.
    Backend command가 data table/bytes/VFS location/current next-id를 정규화/검증해 등록한다.
    """
    result, interfaceState, rendererProjection = dispatchProjectCommand(
        "DATA_OBJECT_CREATED", {"data": data, "name": name, "id": id, "bytesBase64": bytesBase64,
                                "mime": mime, "headerLines": headerLines, "path": path}
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "assets.readDeletionTarget", "path": "result.changed의 생성 CSV path"})["target"]


def createEmptyProjectCsv():
    """
    Return:
    - csv:
      EMPTY_CSV_TEMPLATE에서 생성되어 activeProject에 등록된 일반 CSV asset.

    변경:
    - DATA_OBJECT_CREATED event를 통해 activeProject.csvFiles와 next csv id를 변경한다.
    - asset selection 자체는 이 함수가 소유하지 않는다.

    처리:
    1. EMPTY_CSV_TEMPLATE의 rows를 그대로 사용한다: [["X", "Y"], ["", ""]].
    2. name은 "빈 CSV.csv", MIME은 "text/csv", headerLines는 1을 사용한다.
    3. bytes는 rows를 project CSV writer와 같은 CSV serializer로 직렬화한 UTF-8 bytes를 사용한다.
    4. 기본 directory는 Backend PROJECT_ASSET_DIRECTORIES.csv의 config 참조다.
    5. Backend create command가 같은 canonical path를 current VFS에서 검사하고 projectVfs.uniquePath의 일반 collision-free naming을 적용한다.
       wrapper가 사전 unique path를 authoritative 결과로 확정하지 않으며 existing asset을 replace하지 않는다.
    6. createProjectCsv의 일반 DATA_OBJECT_CREATED 경로로 등록한다.
    7. 생성된 CSV에 protected/default 전용 field를 추가하지 않는다.
    8. chart, graph object, interface selection은 이 함수에서 변경하지 않는다.
    """
    return createProjectCsv(
        EMPTY_CSV_TEMPLATE["rows"], EMPTY_CSV_TEMPLATE["name"], None,
        "template rows를 동일 CSV serializer로 만든 UTF-8 bytes의 base64",
        EMPTY_CSV_TEMPLATE["mime"], EMPTY_CSV_TEMPLATE["headerLines"],
        "Backend PROJECT_ASSET_DIRECTORIES.csv와 template name으로 요청한 path",
    )


def createProjectImage(bytes, name, mime, id, path):
    """
    Return:
    - image:
      성공 뒤 공식 query로 읽은 등록 image의 immutable projection; 미commit이면 해당 command failure를 반환한다.

    변경:
    - IMAGE_OBJECT_CREATED event를 통해 activeProject.images와 next image id를 변경한다.

    처리:
    image asset은 copied bytes/name/MIME/location만 소유한다.
    fit/scale/x/y 같은 display settings는 연결 slot의 slot.content.imageSettings에 둔다.
    """
    result, interfaceState, rendererProjection = dispatchProjectCommand(
        "IMAGE_OBJECT_CREATED", {"bytes": bytes, "name": name, "mime": mime, "id": id, "path": path}
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "assets.readDeletionTarget", "path": "result.changed의 생성 image path"})["target"]


ASSET_MUTATION_RESULT_RULE = (
    "delete/emptyTrash/connectToSlot은 완료 값 없는 operation으로 성공/미commit 모두 None이다. "
    "move는 성공 시 immutable {path, trashed}, 미commit None; createDirectory는 성공 시 canonical path 문자열, 미commit None이다. "
    "path는 실제 committed result.changed의 값이며 stale plan/input에서 성공값을 만들지 않는다. "
    "미commit에는 성공 read/selection/notification을 수행하지 않는다. validation/query/render/selection 오류는 전파한다. "
    "후속 오류/selection 거부는 이미 commit한 mutation을 rollback하지 않는다. 내부 adapter tuple/result는 공개 반환하지 않는다. "
    "delete/emptyTrash의 반환 None은 성공 boolean이 아니다. 실패 이유는 기존 command rejection 또는 전파된 오류 경로를 따른다."
)


def deleteProjectAsset(target):
    """
    변경:
    - target CSV/image와 target을 참조하던 graph object 또는 image slot.

    처리:
    Application wrapper는 target의 kind/id/path reference만 전달한다. 아래는 Backend delete command 내부 계산이다.
    1. collectAssetReferences로 현재 reference를 순수 계산한다.
    2. current project에서 target asset과 해당 references를 제거한 candidate를 만든다.
    3. CSV reference 제거 결과 graph object가 0개가 되어도 empty editable chart를 그대로 허용한다.
    4. image reference는 해당 slot의 image reference만 비운 candidate를 만든다.
    5. candidate 전체를 검증한다.
    6. resolved target kind가 CSV면 DATA_OBJECT_DELETED, image면 IMAGE_OBJECT_DELETED가 이 candidate를 한 번 commit한다.
       두 command 모두 asset과 해당 reference detach를 같은 whole-project commit으로 소유한다. routing read와 현재 kind가 다르면 거부한다.

    보호된 default CSV 같은 예외 asset은 존재하지 않는다.
    """
    if target is None:
        return None
    # kind가 csv/image가 아니면 unchanged None이며 다른 delete command로 추정하지 않는다.
    event = "validated requested kind의 DATA_OBJECT_DELETED 또는 IMAGE_OBJECT_DELETED"
    result, interfaceState, rendererInput = dispatchProjectCommand(event, {"target": "explicit kind/id/path reference만; asset object copy는 아님"})
    return None


def moveProjectNode(plan, useUniqueName):
    """
    변경:
    - project VFS의 directory/asset location과 trash 진입 시 필요한 reference detach.

    처리:
    1. stale UI plan을 그대로 신뢰하지 않고 current source/path/target을 다시 resolve한다.
    2. 최종 destination을 계산한다.
    3. non-trash에서 trash로 들어가는 asset/subtree이면 collectAssetReferences 결과를 candidate에서 detach한다.
    4. trash에서 일반 directory로 나오는 asset/subtree은 이전 reference를 자동 복원하지 않고 path만 일반 project 위치로 이동한다.
    5. directory 이동이면 descendant asset/directory path를 같은 candidate 안에서 함께 이동한다.
    6. collision, fixed-directory, subtree cycle, reference invariant를 검증한다.
    7. 성공한 candidate만 한 번 commit한다.
    8. entering-trash detach로 실제 제거된 graph-object reference 수와 image slot reset 수를
       ProjectMutationResult에 기록한다. path-only 이동과 trash 밖 복구에서는 두 값이 0이다.
       renderer는 이 commit 결과를 사용하고 VFS/DOM에서 변화 여부를 역추론하지 않는다.
    """
    if plan is None:
        return None
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "PROJECT_NODE_MOVED",
        {"path": "plan의 source path", "directory": "plan의 target directory", "useUniqueName": useUniqueName},
    )
    if not result.committed:
        return None
    path = "result.changed의 실제 final canonical destination path"
    trashed = dispatchProjectQuery("project-api", {"operation": "assets.isTrashed", "path": path})
    return {"path": path, "trashed": trashed}  # immutable public copy


def emptyProjectTrash():
    """
    변경:
    - trash 아래 directory/CSV/image와 아직 남아 있는 해당 reference.

    처리:
    1. 현재 trash subtree를 다시 resolve한다.
    2. collectAssetReferences로 영향을 계산한다.
    3. references와 trash assets/directories를 제거한 candidate project를 만든다.
    4. candidate 전체 invariant를 검증한다.
    5. 성공한 경우에만 한 번 commit한다.
    6. 이 commit으로 실제 제거된 graph-object reference 수와 image slot reset 수를 ProjectMutationResult에 기록한다.
       실제 제거된 reference가 없으면 dashboard content projection effect는 없다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand("PROJECT_TRASH_EMPTIED", {})
    return None


def createProjectDirectory(parent, name):
    """
    변경:
    - project VFS directory collection.

    처리:
    current parent와 normalized name을 검증하고 PROJECT_DIRECTORY_CREATED로 commit한다.
    """
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "PROJECT_DIRECTORY_CREATED",
        {"parent": parent, "name": name},
    )
    if not result.committed:
        return None
    path = "result.changed의 실제 생성 canonical directory path"
    dispatchInterfaceEvent("SELECT_ASSET", {"kind": "directory", "path": path})
    # selection은 current Backend 검증을 통과해야 하며 rejection은 기존 selection을 유지한다.
    # 이미 생성된 directory의 성공 path는 selection 거부 때문에 취소/다른 경로로 바꾸지 않는다.
    return path


def connectProjectAssetToSlot(path, kind, slotId):
    """
    변경:
    - CSV이면 target graph slot/chart reference.
    - image이면 target slot image reference.

    처리:
    path와 slotId를 current project에서 다시 resolve한다.
    CSV는 SLOT_DATA_CONNECTED, image는 SLOT_IMAGE_LINKED라는 기존 kind-specific command로 수렴한다.
    command reconciliation 후에도 유효한 독립 asset selection은 model-to-fsm 선택에서 유지한다.
    target graph selection은 clear하지만 asset을 다시 선택하거나 제거된 선택을 snapshot에서 복구하지 않는다.
    """
    event = "SLOT_DATA_CONNECTED if kind == csv else SLOT_IMAGE_LINKED"
    # kind는 csv/image만 허용; 그 외 오류. command는 current path의 kind 일치/non-trash/visible slot을 재검증한다.
    result, interfaceState, rendererInput = dispatchProjectCommand(event, {"path": path, "kind": kind, "slotId": slotId})
    if not result.committed:
        return None
    dispatchSlotSelection(slotId, pendingContentType=None, direction="model-to-fsm")
    return None


SINGLE_FILE_IMPORT_CHOICE_RULE = (
    "target slot은 공식 query로 먼저 검증한다. data/image 파일의 chooser directory는 Backend PROJECT_ASSET_DIRECTORIES의 kind별 root다. "
    "planImport(file,directory,reservedPaths=empty)를 한 번 기다리며 완료된 path/replaceId만 command로 보낸다. "
    "slot package는 별도 FFSX 경로이므로 collision chooser를 호출하지 않는다. cancel은 command 전에 None을 반환한다. "
    "chooser는 Application/UI에서 공식 collision/resolve query를 사용한다. 이후 command는 final plan을 current candidate에서 재검증하며 "
    "slot의 directory나 current asset selection/파일의 local filesystem path를 새 authority로 만들지 않는다."
)


def importProjectFileToSlot(file, slotId, planImport):
    """
    변경:
    - raw CSV/image asset과 target slot/chart candidate.

    처리:
    explicit visible slotId를 current query로 검증한 뒤 공식 fileKind를 읽는다. slot이면 collision choice 없이
    importSelectedGraphFile(slotId, file)의 FFSX 경로로 반환하고, unknown이면 command 없이 오류를 전파한다.
    data/image만 importProjectFilesToDirectory와 같은 pure file input/명시적 collision choice 수집을 수행한다.
    취소면 command 없이 None을 반환한다. Backend ASSETS_IMPORTED가 buildProjectAssetImportCandidate의 targetSlotId 경로로
    current asset와 target slot/chart를 한 candidate로 만든다. asset 생성과 slot 연결을 별도 commit으로 쪼개지 않는다.
    """
    choices = "기존 collision query와 planImport UI resolver로 완료한 choice 값; 취소면 즉시 반환"
    result, interfaceState, rendererInput = dispatchProjectCommand(
        "ASSETS_IMPORTED", {"files": [file], "directory": "choice의 explicit target directory", "choices": choices, "targetSlotId": slotId}
    )
    if not result.committed:
        return result
    return dispatchProjectQuery("project-api", {"operation": "assets.readDeletionTarget", "path": "result.changed의 실제 imported asset path"})["target"]


def importProjectFile(file):
    """
    Return:
    - project:
      import 성공 뒤 공식 export query로 읽은 immutable project snapshot. Backend mutable authority를 반환하지 않는다.
      실패/취소는 기존 command/lifecycle 실패/취소로 전달하며 성공 snapshot을 반환하지 않는다.

    변경:
    - 최종 단계에서 PROJECT_LOADED event를 통해 activeProject 전체를 교체한다.

    처리:
    current FFPX package만 project import 입력으로 인정한다.
    Application은 file 입력만 PROJECT_LOADED에 전달한다. Backend command가 ffpxReadProject 결과를
    buildProjectObject로 정규화/완전 검증한 뒤 authoritative project를 한 번 교체한다.
    현재 package가 아닌 legacy conversion은 application 내부에서 추측하지 않고 외부 converter 책임으로 둔다.
    """
    result, interfaceState, rendererProjection = dispatchProjectCommand("PROJECT_LOADED", {"file": file})
    if not result.committed:
        return result
    return dispatchProjectQuery("export", {})


def importProjectAssetFiles(files, planImport):
    """
    assets.importFiles의 ordered router. 한 public 호출의 importing lifecycle 안에서 실행한다.
    1. input을 순서 있는 file 목록으로 만든다. empty input은 []이며 query/command/choice가 없다.
    2. 시작 시 interfaceFSM.selectedSlotId scalar만 target으로 잡는다. 이후 modal/await 동안 다른 선택으로 갈아타지 않는다.
    3. 각 file을 공식 fileKind query로 분류한다. data/image/slot만 지원하며 unknown은 throw, 뒤 input은 처리하지 않는다.
       slot package는 target이 있어야 importSelectedGraphFile로 보낸다. .json은 fileKind에 따라 data이며 Plotly 추측 분기를 만들지 않는다.
       Plotly JSON은 explicit graphs.importFile 경로를 사용한다. package 자체는 SLOT_CHART_IMPORTED 한 commit이다.
       data/image와 target이 있으면 importProjectFileToSlot, 없으면 immutable PROJECT_ASSET_DIRECTORIES에서
       data는 csv key, image는 image key의 canonical path를 골라 importProjectFilesToDirectory([file], directory, planImport)를 사용한다.
       이 상수는 기본 schema 값이지 current VFS projection이 아니다. directory의 실제 존재/권한은 command가 다시 검증한다.
       단수 image alias/누락 root 자동 생성을 하지 않는다. FFPX는 project.importFile 전용이며 여기서 추측하지 않는다.
    4. 파일마다 command가 current visible target/VFS/choice를 다시 검증한다. 성공 결과의 detached asset/chart를 input 순서로 모은다.
       directory helper의 single-item 목록은 router 결과에 한 item으로 펼친다. 전체 성공은 그 목록을 반환한다.
    5. choice 취소는 None, 미commit은 그 result를 반환하고 즉시 멈춘다. throw/rejection은 전파한다.
       이미 끝난 이전 file의 commit은 유지한다. router 전체를 atomic batch로 주장하거나 숨은 rollback하지 않는다.
       명시적 importToDirectory의 여러 file batch만 그 helper의 one-candidate atomic 계약을 유지한다.
    6. file 누락/중복 처리나 무시되는 두 번째 file을 만들지 않는다. 각 file별 한 helper 호출이며 성공 item도 한 번만 추가한다.
    """
    return "순서대로 완료한 detached item 목록, 취소 None, 미commit result 또는 원래 failure"


def downloadProjectAsset(path):
    """assets.download: 원본 bytes handoff 성공 True, absent/wrong-kind/no bytes False; 오류 전파.
    path 생략은 public binding이 현재 Frontend assetPath scalar를 전달한다. 새 Project query는 이 작업에만 소비한다.
    browser disk 저장 확인이 아니라 handoff 완료다. selection/Project/asset bytes를 변경하지 않는다.
    """
    payload = dispatchProjectQuery("export", {"operation": "assets.download", "path": path})
    if payload is None:
        return False
    downloadExportPayload(payload)
    return True


def downloadProject():
    """project.exportFile: selected slot이 있으면 경고 후 None, query/download 없음.
    선택 없음은 current validated FFPX payload를 한 번 handoff하고 None 반환한다.
    error는 원래 failure로 전파한다. 이 side-effect API의 None은 disk 저장 보증이나 Project commit 성공 값이 아니다.
    """
    if interfaceFSM.readState()["selectedSlotId"] is not None:
        return None
    payload = dispatchProjectQuery("export", {"operation": "project.exportFile", "stamp": "이번 호출의 UTC ISO timestamp"})
    return downloadExportPayload(payload)
