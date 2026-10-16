"""
Fast Figure Source Script — Application boundary / public-api — asset wrappers

하위 구현 검증 자료: ../../../fast-figure.js, ../../../fast-figure-ui.js, ../../../Fast-figure.html.
Python 표기의 구현 명세이며 application runtime을 실행하는 모듈이 아니다.
"""

from sourcescript.application.adapter import dispatchProjectCommand, dispatchProjectQuery
from sourcescript.backend.assets_files import EMPTY_CSV_TEMPLATE

def importProjectFilesToDirectory(files, directory, planImport):
    """
    변경:
    - 전체 candidate가 검증된 뒤 CSV/image collection과 관련 reference를 한 번 commit한다.

    처리:
    1. Application은 pure file-byte read/parse와 기존 collision query/UI choice 수집을 수행할 수 있다.
       planImport의 UI-local resolver를 완료하여 이번 batch의 명시적 choices를 얻는다. 취소면 command 없이 취소 결과를 반환한다.
       path/id를 포함한 candidate project를 만들거나 Backend에 resolver callback을 넘기지 않는다.
    2. ASSETS_IMPORTED에 copied file inputs, explicit directory와 choices만 전달한다.
    3. Backend command가 buildProjectAssetImportCandidate로 current directory/collision/id/reference와 whole-project candidate를 계산한다.
       choice 대기 뒤의 current state 재검증과 one commit은 sourcescript.backend.project_efsm의 공통 send 규칙을 사용한다.
    4. parse/collision/reference/validation 실패는 미commit 결과로 끝난다. Application은 공통 결과를 반환하며 성공 read로 위장하지 않는다.

    의미:
    batch import는 mutate 후 rollback이 아니라 command 안의 candidate-first commit을 기본으로 한다.
    """
    choices = "기존 collision query와 planImport UI resolver로 완료한 이번 batch의 choice 값; 취소면 즉시 반환"
    return dispatchProjectCommand("ASSETS_IMPORTED", {"files": files, "directory": directory, "choices": choices})


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
    4. 기본 directory는 /assets/csv다.
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
        "기본 directory /assets/csv와 template name으로 요청한 path",
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
    event = "DATA_OBJECT_DELETED if requested target kind == csv else IMAGE_OBJECT_DELETED"
    return dispatchProjectCommand(event, {"target": "explicit kind/id/path reference만; asset object copy는 아님"})


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
    return dispatchProjectCommand(
        "PROJECT_NODE_MOVED",
        {"path": "plan의 source path", "directory": "plan의 target directory", "useUniqueName": useUniqueName},
    )


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
    return dispatchProjectCommand("PROJECT_TRASH_EMPTIED", {})


def createProjectDirectory(parent, name):
    """
    변경:
    - project VFS directory collection.

    처리:
    current parent와 normalized name을 검증하고 PROJECT_DIRECTORY_CREATED로 commit한다.
    """
    return dispatchProjectCommand(
        "PROJECT_DIRECTORY_CREATED",
        {"parent": parent, "name": name},
    )


def connectProjectAssetToSlot(path, kind, slotId):
    """
    변경:
    - CSV이면 target graph slot/chart reference.
    - image이면 target slot image reference.

    처리:
    path와 slotId를 current project에서 다시 resolve한다.
    CSV는 SLOT_DATA_CONNECTED, image는 SLOT_IMAGE_LINKED라는 기존 kind-specific command로 수렴한다.
    단순 asset selection은 이 함수에서 변경하지 않는다.
    """
    event = "SLOT_DATA_CONNECTED if kind == csv else SLOT_IMAGE_LINKED"
    return dispatchProjectCommand(event, {"path": path, "slotId": slotId})


def importProjectFileToSlot(file, slotId, planImport):
    """
    변경:
    - raw CSV/image asset과 target slot/chart candidate.

    처리:
    Application은 importProjectFilesToDirectory와 같은 pure file input/명시적 collision choice 수집을 수행한다.
    취소면 command를 보내지 않는다. Backend ASSETS_IMPORTED가 buildProjectAssetImportCandidate의 targetSlotId 경로로
    current asset와 target slot/chart를 한 candidate로 만든다. asset 생성과 slot 연결을 별도 commit으로 쪼개지 않는다.
    """
    choices = "기존 collision query와 planImport UI resolver로 완료한 choice 값; 취소면 즉시 반환"
    return dispatchProjectCommand(
        "ASSETS_IMPORTED", {"files": [file], "directory": "choice의 explicit target directory", "choices": choices, "targetSlotId": slotId}
    )


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
