"""
Fast Figure Source Script — project VFS, assets, FFPX/FFSX and import transactions

하위 구현 검증 원천:
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

VFS_RULES = {
    "canonical": (
        "모든 directory와 asset lookup은 하나의 slash-normalized absolute project path를 사용한다. "
        "asset은 별도 path 값을 소유하지 않고 directory + name에서 canonical path를 계산한다."
    ),
    "resolve": "directory, CSV, image 중 정확히 하나의 current project object로 resolve되어야 한다.",
    "exists": "resolve 가능한 canonical path 또는 고정 directory인지 판정한다.",
    "unique": "collision이 있으면 같은 parent 안에서 이름만 바꾼 collision-free path를 계산한다.",
    "descendant": "directory subtree membership은 canonical segment boundary 기준으로 판정한다.",
    "fixed": "고정 directory는 이동/삭제하지 않는다.",
    "trash": "trash root 또는 그 descendant를 trash subtree로 판정한다.",
}

TABULAR_PARSE_RULES = {
    "encoding": (
        "CSV/TSV/JSON text는 UTF-8로 해석하며 direct import와 package restore가 같은 decoding 규칙을 사용한다."
    ),
    "delimiter": "파일 확장자가 .tsv면 tab, .csv면 comma를 사용한다.",
    "quote": "double quote 안의 delimiter와 newline은 field data이며 doubled quote는 하나의 quote로 해석한다.",
    "rows": (
        "파싱된 row 순서를 보존한다. 완전히 빈 trailing physical line은 새 data row를 만들지 않지만 "
        "파일 내부의 명시적 blank row는 table row로 보존한다."
    ),
    "json": "top-level array 또는 object의 data array를 허용한다.",
    "bytes": "parsed rows와 별도로 원본 bytes를 project asset에 그대로 보존한다.",
}

TYPED_XML_RULES = {
    "null": "value type=null, child scalar 없음",
    "boolean": "value type=boolean, true 또는 false text",
    "number": "value type=number, finite number text만 허용",
    "string": "value type=string, XML escaped text",
    "array": "value type=array, 순서가 있는 item/value child",
    "object": "value type=object, property name + value child",
    "unknown": "지원하지 않는 type 또는 잘못된 value shape는 package read 실패",
}

FORMAT_EVOLUTION_RULE = (
    "현재 package format version 3의 구조를 유지하되 persistent export settings는 additive project setting으로 기록한다. "
    "같은 version의 기존 파일에 export settings가 없으면 project default로 정규화한다. "
    "향후 기존 field 의미를 바꾸거나 기존 reader가 구조를 해석할 수 없는 변경을 하면 package version을 올린다."
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
    4. 같은 asset kind의 existing asset이면 replace-or-rename을 허용한다.
    5. 다른 kind 또는 batch reservation과 충돌하면 rename-only로 처리한다.
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
    - 전체 candidate가 검증된 뒤 CSV/image collection과 관련 reference를 한 번 commit한다.

    처리:
    1. target directory가 존재하고 trash가 아닌지 확인한다.
    2. 모든 file bytes를 읽고 data/image candidate model을 authority 밖에서 만든다.
    3. 전체 batch의 collision choice를 받아 path/replace id를 확정하고 reserved path 충돌을 검사한다.
    4. 현재 project snapshot에서 candidate asset collection, VFS location, next-id를 계산한다.
    5. import-to-slot이면 target slot/chart candidate도 같은 candidate project에 적용한다.
    6. candidate 전체의 VFS/reference/project invariant를 검증한다.
    7. 모두 성공한 경우에만 importing lifecycle 안에서 authoritative project 부분을 commit한다.
    8. parse, collision, validation 중 하나라도 실패하면 activeProject는 변경하지 않는다.

    의미:
    batch import는 mutate 후 rollback이 아니라 candidate-first commit을 기본으로 한다.
    """
    return "전체 candidate import가 commit된 경우의 결과"


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
    - target CSV/image와 target을 참조하던 graph object 또는 image slot.

    처리:
    1. collectAssetReferences로 현재 reference를 순수 계산한다.
    2. current project에서 target asset과 해당 references를 제거한 candidate를 만든다.
    3. CSV reference 제거 결과 graph object가 0개가 되어도 empty editable chart를 그대로 허용한다.
    4. image reference는 해당 slot의 image reference만 비운 candidate를 만든다.
    5. candidate 전체를 검증한다.
    6. 검증 성공 후 asset/reference mutation을 한 번 commit한다.

    보호된 default CSV 같은 예외 asset은 존재하지 않는다.
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
    - project VFS의 directory/asset location과 trash 진입 시 필요한 reference detach.

    처리:
    1. stale UI plan을 그대로 신뢰하지 않고 current source/path/target을 다시 resolve한다.
    2. 최종 destination을 계산한다.
    3. trash로 들어가는 asset이면 collectAssetReferences 결과를 candidate에서 detach한다.
    4. directory 이동이면 descendant asset/directory path를 같은 candidate 안에서 함께 이동한다.
    5. collision, fixed-directory, subtree cycle, reference invariant를 검증한다.
    6. 성공한 candidate만 한 번 commit한다.
    """
    return "commit된 최종 이동 path"


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
    4. chart CSV reference, chart 1:1 ownership, slot image reference가 export 가능한지 재검사한다.
    5. project.xml에 project metadata, fileSystem, appearance, persistent export settings와 document ref를 기록한다.
    6. layout/caption/labels/slot 문서는 각 책임 데이터만 기록한다.
    7. typed XML grammar는 ffpxEncodeValue 하나를 writer 원천으로 사용한다.
    8. CSV/image bytes는 metadata와 분리해 dataRef로 연결한다.
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
    2. 필수 XML 문서와 slot 문서를 typed XML grammar로 읽는다.
    3. slot placement와 chart/image reference를 재구성한다.
    4. CSV/image dataRef가 허용 subtree를 가리키고 실제 entry가 존재하는지 확인한다.
    5. raw bytes를 parseProjectDataAsset와 bytes representation으로 복원한다.
    6. export settings가 없는 같은-version 기존 package는 project default로 보완한다.
    7. payload 자체에서는 malformed shared/orphan chart를 clone/drop하지 않는다.
    8. package schema/version을 확인한 뒤 buildProjectObject가 검증할 payload를 반환한다.
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
    current FFPX package만 project import 입력으로 인정한다.
    ffpxReadProject 결과를 buildProjectObject로 candidate ProjectObject로 정규화하고 완전 검증한 뒤
    PROJECT_LOADED 경계를 통해 authoritative project를 한 번 교체한다.
    현재 package가 아닌 legacy conversion은 application 내부에서 추측하지 않고 외부 converter 책임으로 둔다.
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
    chart object가 참조하는 실제 CSV만 package-local 연속 id로 remap한다.
    chart object csvId도 같은 mapping으로 변경한다.
    graph object가 0개인 blank editable chart는 CSV entry 없이 유효하게 package한다.
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
    package schema/version, chart object -> package-local CSV reference, CSV dataRef와 bytes를 검증한다.
    graph object가 0개이면 CSV asset이 없어도 blank chart로 허용한다.
    package-local id 0 또는 protected default CSV 같은 특수 reference를 만들지 않는다.
    validateChartModel을 통과한 payload만 반환한다.
    """
    slotPayload = "검증된 FFSX slot payload"
    return slotPayload

def projectVfsResolve(path, state):
    """
    Return:
    - resolved:
      canonical path에 대응하는 directory/CSV/image object 또는 없음.

    변경:
    - 없음.

    처리:
    normalizeProjectPath 결과를 기준으로 fixed/project directory와 asset path를 같은 원천에서 resolve한다.
    같은 canonical path가 둘 이상의 object에 대응하면 valid VFS가 아니므로 실패한다.
    """
    resolved = "project VFS object 또는 없음"
    return resolved


def projectVfsUniquePath(path, state, reservedPaths):
    """
    Return:
    - uniquePath:
      같은 parent 안에서 현재 state와 reservedPaths 모두에 없는 canonical path.

    변경:
    - 없음.

    처리:
    원래 basename과 extension 의미를 유지하면서 충돌 suffix를 계산한다.
    unique path 계산은 실제 asset location을 변경하지 않는다.
    """
    uniquePath = "collision-free canonical project path"
    return uniquePath


def projectVfsDescendants(directory, state):
    """
    Return:
    - descendants:
      directory 아래의 directory/CSV/image reference 목록.

    변경:
    - 없음.

    처리:
    단순 문자열 prefix가 아니라 canonical path segment boundary로 subtree membership을 판정한다.
    """
    descendants = "canonical descendant object 목록"
    return descendants


def parseProjectDataAsset(name, bytes):
    """
    Return:
    - rows:
      CSV/TSV/JSON 원본 bytes에서 계산한 table projection.

    변경:
    - 없음.

    처리:
    1. bytes를 UTF-8 text로 해석한다.
    2. .json은 top-level array 또는 data array를 dataTable 규칙으로 정규화한다.
    3. .tsv는 tab, .csv는 comma delimiter로 parse한다.
    4. quoted delimiter/newline과 doubled quote를 처리한다.
    5. row 순서와 내부 blank row를 보존한다.
    6. 지원 확장자가 아니거나 table shape가 유효하지 않으면 실패한다.
    """
    rows = "원본 bytes에서 파생된 table rows"
    return rows


def collectAssetReferences(csvIds, imageIds, state):
    """
    Return:
    - references:
      CSV별 graph-object reference와 image별 slot reference를 실제 object 단위로 나열한 read-only 결과.

    변경:
    - 없음.

    처리:
    같은 chart 안에서 같은 CSV를 여러 graph object가 참조하면 각각 별도 reference로 센다.
    image는 참조하는 slot마다 하나의 reference로 센다.
    confirmation count와 실제 cascade mutation이 같은 reference set을 사용한다.
    """
    references = "asset reference object 목록"
    return references


def ffpxEncodeValue(value):
    """
    Return:
    - xmlValue:
      TYPED_XML_RULES에 따른 하나의 typed value element.

    변경:
    - 없음.

    처리:
    null/boolean/finite number/string/array/object를 재귀적으로 encode한다.
    array 순서와 object property name을 보존하고 XML text/attribute를 escape한다.
    지원하지 않는 runtime 값은 writer 오류로 처리한다.
    """
    xmlValue = "typed XML value"
    return xmlValue


def ffpxDecodeValue(element):
    """
    Return:
    - value:
      typed XML element에서 복원한 값.

    변경:
    - 없음.

    처리:
    TYPED_XML_RULES의 shape/type을 검증하면서 재귀 decode한다.
    number는 finite인지 확인하고 unknown type은 실패한다.
    """
    value = "decoded typed value"
    return value


def buildProjectObject(payload, fileName):
    """
    Return:
    - candidate:
      current project invariant를 모두 만족하는 import candidate ProjectObject.

    변경:
    - activeProject를 변경하지 않는다.

    처리:
    1. current schema/version과 project name/grid shape를 검증한다.
    2. CSV/image id, bytes, canonical VFS location을 candidate collection으로 정규화한다.
    3. chart와 graph object를 정규화하고 CSV reference를 resolve한다.
       zero-object editable chart는 그대로 허용한다.
    4. slot geometry와 chart/image reference를 정규화한다.
    5. chart마다 owning slot이 정확히 하나인지 확인한다.
       shared/orphan topology는 clone/drop하지 않고 실패한다.
    6. labels/captions/appearance/export settings를 정규화한다.
       없는 additive export settings는 project default를 사용한다.
    7. collection 최대 id에서 next-id를 계산한다.
    8. validateProjectObjectState를 통과한 candidate만 반환한다.
    """
    candidate = "완전 검증된 import ProjectObject"
    return candidate


def applyFfsxSlot(slotPayload, targetSlot):
    """
    Return:
    - result:
      새 CSV id mapping과 새 chart id를 포함한 commit 결과.

    변경:
    - candidate 검증 성공 후 target slot, chart collection, 필요한 CSV collection과 next-id를 한 번 commit한다.

    처리:
    1. targetSlot을 current project에서 다시 resolve한다.
    2. package-local CSV마다 새 project id/path candidate를 만든다.
    3. chart object csvId를 새 mapping으로 바꾼 독립 chart candidate를 만든다.
    4. 새 chart id를 할당하고 target slot이 그 chart를 유일하게 소유하도록 candidate를 만든다.
    5. FFSX가 제공하는 slot caption을 target slot annotation candidate에 적용한다.
    6. whole-project invariant를 검증한다.
    7. 성공한 candidate만 commit한다.
    """
    result = "FFSX candidate commit 결과"
    return result

