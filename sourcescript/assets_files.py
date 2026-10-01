"""
Fast Figure Source Script — project VFS, assets, FFPX/FFSX and import transactions

현재 구현 원천:
- ../fast-figure.js
  projectVfs, projectAssetPath, create/load asset functions,
  projectAssetImportCollisionModel, resolveProjectAssetImportPlan,
  importProjectFilesToDirectory, importProjectAssetFiles,
  ffpxBuildProject/ffpxReadProject, ffsxBuildSlot/ffsxReadSlot.

참조 Source Script:
- project_state.py
- application_fsm.py
"""

from project_state import activeProject, projectVfs, getProjectCsv, getProjectImage
from application_fsm import appFSM

PACKAGE_FORMAT_VERSION = "현재 FFPX/FFSX package format version 3"

PROJECT_ASSET_DIRECTORIES = {
    "csv": "CSV 기본 directory; 현재 구현 path /assets/csv",
    "image": "image 기본 directory; 현재 구현 path /assets/images",
}

PROJECT_TRASH_DIRECTORY = "project trash root; 현재 구현 path /assets/trash"

FIXED_DIRECTORY_RULE = (
    "현재 구현의 고정 directory는 /assets, /assets/csv, /assets/images, /assets/trash다. "
    "삭제 또는 이동 대상으로 취급하지 않는다."
)

assetImportPlan = {
    "path": "새 asset이 사용할 collision-free project path",
    "replaceId": "같은 종류의 기존 asset을 참조 유지 교체할 때 그 id, 아니면 없음",
}

FFPX_STRUCTURE = {
    "project.xml": "project metadata, fileSystem, appearance와 다른 문서 ref",
    "assets/assets.xml": "CSV/image metadata와 binary data ref 목록",
    "layout/layout.xml": "grid와 slot placement",
    "caption/caption.xml": "global/slot caption configuration",
    "labels/labels.xml": "label configuration",
    "slots/slot-<id>.xml": "slot content, caption, chart state/objects 또는 image settings",
    "assets/data/...": "CSV/TSV/JSON 원본 data bytes",
    "assets/media/...": "image bytes",
}

FFSX_STRUCTURE = {
    "slot.xml": "single graph slot, chart state, graph object와 caption",
    "assets/assets.xml": "slot이 참조하는 CSV metadata",
    "assets/data/...": "slot이 참조하는 CSV bytes",
}

PACKAGE_CONTAINER_RULES = [
    "FFPX와 FFSX는 현재 STORE 방식의 비압축 ZIP container만 지원한다.",
    "분할 ZIP은 지원하지 않는다.",
    "각 entry path는 absolute path 또는 .. segment를 포함할 수 없다.",
    "entry CRC32를 읽을 때 검증한다.",
    "현재 package version과 다른 project/slot package는 지원하지 않는다.",
]

EXPORT_TRASH_RULE = (
    "FFPX export는 /assets/trash 아래의 CSV, image, directory를 package에 포함하지 않는다. "
    "export 대상 chart/slot이 trash asset을 참조하면 실패한다."
)


def normalizeProjectPath(value, directory):
    """
    Return:
    - path:
      slash-normalized project path.

    변경:
    - 없음.

    처리:
    path segment에 . 또는 ..를 허용하지 않는다.
    각 segment는 project file-name 정규화 규칙을 통과해야 한다.
    file path에서 root 자체는 유효한 file이 아니다.
    """
    path = "정규화된 project path"
    return path


def projectAssetPath(asset):
    """
    Return:
    - path:
      asset.directory와 asset.name의 상관관계로 만들어진 canonical VFS path.

    변경:
    - 없음.

    처리:
    asset에 별도 path field를 저장하지 않는다.
    directory와 name이 유효할 때마다 path를 다시 계산한다.
    """
    path = "projectVfs에서 resolve 가능한 asset path"
    return path


def projectAssetImportCollisionModel(file, directory, reservedPaths):
    """
    Return:
    - collisionModel:
      assetKind, parent, normalized name/path, mode, replaceId와 UI 안내 정보.

    변경:
    - project state를 변경하지 않는다.

    처리:
    1. file 종류를 data/image로 판별한다.
    2. target directory와 file name으로 candidate path를 계산한다.
    3. projectVfs 및 현재 batch reservedPaths와 collision을 검사한다.
    4. 같은 asset kind이고 보호된 기본 CSV가 아니면 replace-or-rename을 허용한다.
    5. 다른 kind, 보호 asset, batch reservation이면 rename-only로 처리한다.
    """
    collisionModel = "현재 project state에서 계산한 import collision decision input"
    return collisionModel


def resolveProjectAssetImportPlan(model, choice, reservedPaths):
    """
    Return:
    - plan:
      최종 path와 optional replaceId.

    변경:
    - 없음.

    처리:
    available이면 candidate path를 그대로 사용한다.
    replace 선택이 허용된 같은-kind asset이면 기존 id를 유지한다.
    그 외에는 projectVfs.uniquePath로 새 이름을 계산한다.
    """
    plan = assetImportPlan
    return plan


def importProjectFilesToDirectory(files, directory, planImport):
    """
    변경:
    - 여러 CSV/image asset을 하나의 importing lifecycle 안에서 추가 또는 교체한다.

    처리:
    1. target directory가 존재하고 trash가 아닌지 확인한다.
    2. 전체 batch에 대해 collision plan을 먼저 계산하고 candidate path를 reserved한다.
    3. 시작 전 CSV/image id set과 replace 대상 원본을 rollback용으로 저장한다.
    4. appFSM.run(importing) 안에서 staged file을 순서대로 load한다.
    5. 실패하면 새로 생긴 asset을 공식 delete event로 제거하고 교체 asset을 공식 replace event로 복구한다.
    6. 실패를 호출자에 다시 전달한다.

    의미:
    batch import는 중간 성공을 권위 상태로 남기지 않도록 rollback 경로를 가진다.
    """
    return "전체 import가 성공한 경우의 완료 결과"


def createProjectCsv(data, name, id, bytesBase64, mime, headerLines, path):
    """
    Return:
    - csv:
      activeProject에 등록된 CSV asset.

    변경:
    - DATA_OBJECT_CREATED event를 통해 activeProject.csvFiles와 next csv id를 변경한다.

    처리:
    data table과 bytes representation을 정규화하고 VFS location을 정한 뒤
    appFSM의 공식 create event로 등록한다.
    """
    csv = "등록된 CSV asset"
    return csv


def createProjectImage(bytes, name, mime, id, settings, path):
    """
    Return:
    - image:
      activeProject에 등록된 image asset.

    변경:
    - IMAGE_OBJECT_CREATED event를 통해 activeProject.images와 next image id를 변경한다.
    """
    image = "등록된 image asset"
    return image


def deleteProjectAsset(target):
    """
    변경:
    - target CSV/image와 target을 참조하던 graph object 또는 slot.

    처리:
    CSV는 보호된 기본 빈 CSV인지 검사한다.
    CSV reference가 있으면 GRAPH_OBJECTS_REPLACED로 참조 object를 먼저 제거한다.
    image reference가 있으면 SLOTS_RESET으로 참조 slot을 먼저 초기화한다.
    참조 정리가 끝난 뒤 DATA_OBJECT_DELETED 또는 IMAGE_OBJECT_DELETED를 보낸다.
    """
    return "삭제 완료"


def planProjectNodeMove(path, directory):
    """
    Return:
    - movePlan:
      source, kind, target directory, destination, collision, uniqueName,
      trash 진입 여부와 현재 referenceCount.

    변경:
    - 없음.

    처리:
    실제 move 전에 VFS와 reference 상태를 읽어 UI confirmation에 필요한 값을 계산한다.
    """
    movePlan = "현재 project state에 대한 move 계획"
    return movePlan


def moveProjectNode(plan, useUniqueName):
    """
    변경:
    - PROJECT_NODE_MOVED event를 통해 project VFS와 필요 시 reference를 변경한다.

    처리:
    plan의 최종 directory/name을 event payload로 전달한다.
    실제 collision/reference 검증은 mutation action에서 다시 현재 state 기준으로 수행한다.
    """
    return "mutation action이 확정한 이동 결과"


def emptyProjectTrash():
    """
    변경:
    - trash 아래 directory/CSV/image와 해당 reference.

    처리:
    PROJECT_TRASH_EMPTIED event가 현재 trash 내용을 다시 resolve하고
    reference를 정리한 뒤 asset과 directory를 제거한다.
    """
    return "삭제한 항목 수와 reference 정리 결과"


def ffpxBuildProject():
    """
    Return:
    - package:
      FFPX manifest 의미와 ZIP entry 목록.

    변경:
    - activeProject를 변경하지 않는다.

    처리:
    1. activeProject 전체를 validation한다.
    2. projectObjects 공식 read path에서 export snapshot을 읽는다.
    3. trash asset/directory를 제외한다.
    4. chart CSV reference와 slot image reference가 export 가능한지 재검사한다.
    5. project/assets/layout/caption/labels/slot XML 문서와 binary asset entry를 구성한다.
    6. CSV/image bytes는 metadata와 분리해 dataRef로 연결한다.
    """
    package = "검증된 FFPX entry 목록"
    return package


def ffpxReadProject(file):
    """
    Return:
    - payload:
      buildProjectObject가 검증/정규화할 project import payload.

    변경:
    - activeProject를 변경하지 않는다.

    처리:
    1. ZIP STORE 구조, entry path, CRC를 검증해 모든 entry를 읽는다.
    2. 필수 XML 문서와 slot 문서를 읽는다.
    3. slot placement와 chart/image reference를 재구성한다.
    4. CSV/image dataRef가 허용 subtree를 가리키고 실제 entry가 존재하는지 확인한다.
    5. raw bytes를 asset rows/base64 representation으로 복원한다.
    6. package schema/version을 확인한 뒤 payload를 반환한다.
    """
    payload = "검증 가능한 project import payload"
    return payload


def importProjectFile(file):
    """
    Return:
    - activeProject:
      import 성공 후의 authoritative project.

    변경:
    - 최종 단계에서 PROJECT_LOADED event를 통해 activeProject 전체를 교체한다.

    처리:
    ZIP signature면 FFPX reader를 사용하고 아니면 현재 legacy JSON import 경로를 사용한다.
    reader 결과를 ProjectObject.fromFFPX/buildProjectObject로 완전 검증한 뒤에만 project를 교체한다.
    """
    return activeProject


def ffsxBuildSlot(slot, chart):
    """
    Return:
    - package:
      선택 graph slot과 그 chart가 참조하는 CSV만 포함한 FFSX entry 목록.

    변경:
    - 없음.

    처리:
    project-global CSV id를 package-local 연속 id로 remap한다.
    chart object csvId도 같은 mapping으로 변경한다.
    CSV bytes는 assets/data subtree에 별도 저장한다.
    """
    package = "single-slot FFSX package"
    return package


def ffsxReadSlot(file):
    """
    Return:
    - slotPayload:
      chart, slot caption, package-local CSV를 포함한 검증된 payload.

    변경:
    - activeProject를 변경하지 않는다.

    처리:
    package schema/version, chart object -> CSV reference, CSV dataRef와 bytes를 검증한다.
    imported default CSV가 현재 protected default CSV와 동일하면 공통 default reference로 재사용한다.
    validateChartModel을 통과한 payload만 반환한다.
    """
    slotPayload = "검증된 FFSX slot payload"
    return slotPayload
