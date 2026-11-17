"""
Fast Figure Source Script — Backend / asset-domain

하위 구현 검증 자료: ../../fast-figure.js, ../../fast-figure-ui.js, ../../Fast-figure.html.
Python 문법으로 작성한 구현 명세다.
"""

from sourcescript.backend.project_state import activeProject, projectVfs, projectObjects, getProjectCsv, getProjectImage, validateProjectObjectState, ProjectObject, normalizeSlotContent, resolveVisibleSlot
from sourcescript.backend import graphs


PACKAGE_FORMAT_VERSION = "config reference: backend.project_object.ffpx.formatVersion; FFSX도 같은 compatibility version 사용"


PROJECT_ASSET_DIRECTORIES = "config reference: backend.defaults.vfs의 csv/image"
PROJECT_TRASH_DIRECTORY = "config reference: backend.defaults.vfs.trash"





assetImportPlan = {'path': '새 asset이 사용할 collision-free project path', 'replaceId': '교체 대상 asset의 정수 id 또는 None.'}


FFPX_STRUCTURE = {
    "project.xml": "project metadata, fileSystem, appearance와 다른 문서 ref",
    "assets/assets.xml": "CSV/image metadata와 binary data ref 목록",
    "layout/layout.xml": "grid와 slot placement",
    "caption/caption.xml": "project-level global caption configuration",
    "labels/labels.xml": "label configuration",
    "slots/slot-<id>.xml": "slot content, slot-local caption, chart state/objects 또는 slot-local image settings",
    "assets/data/...": "CSV/TSV/JSON 원본 data bytes",
    "assets/media/...": "image bytes",
}


FFSX_STRUCTURE = {
    "slot.xml": "single graph slot, chart state, graph object와 caption",
    "assets/assets.xml": "slot이 참조하는 CSV metadata",
    "assets/data/...": "slot이 참조하는 CSV bytes",
}
























EMPTY_CSV_TEMPLATE = {
    "name": "빈 CSV.csv",
    "directory": PROJECT_ASSET_DIRECTORIES["csv"],
    "rows": [["X", "Y"], ["", ""]],
    "mime": "text/csv",
    "headerLines": 1,
    "bytes": "CSV 원본 자료의 UTF-8 bytes.",
}










def readStorePackage(file):
    entries = "path와 bytes를 가진 package entry 딕셔너리 배열."
    """
    Args:
    - file:
      이름·MIME·바이트를 가진 이번 파일 입력.

    Return:
    - entries:
      ZIP 문서 순서의 entry 자료. path는 archive 경로이고 bytes는 해당 entry의 자료다.

    변경:
    - 없음.

    처리:
        1. file의 bytes에서 ZIP directory와 entry metadata를 읽는다. 잘못된 ZIP 구조와 분할 ZIP이면 실패한다.
        2. 각 entry의 압축 방식이 STORE인지 확인한다. 다른 방식이면 실패한다.
        3. entry path가 절대 경로이거나 .. segment를 포함하면 실패한다.
        4. 각 entry의 bytes를 읽고 CRC32를 기록된 CRC와 비교한다. 불일치이면 실패한다.
        5. entry의 path와 bytes를 문서 순서대로 entries에 넣어 반환한다.
    """
    return entries


def normalizeCsvHeaderLines(value, rowCount, present=True):
    headerLines = "CSV 머리글 행 개수인 정수."
    """
    Args:
    - value:
      headerLines 필드의 scalar 입력값.

    - rowCount:
      CSV row 배열의 길이인 0 이상의 정수.

    - present:
      저장 metadata에 headerLines 필드가 있는지 나타내는 논리값.

    Return:
    - headerLines:
      0 이상 rowCount 이하의 정수.

    변경:
    - 없음.

    처리:
        1. present=False이면 초기값 1을 사용한다.
           present=True이면 value를 유한한 scalar 수로 변환하고, 무효이면 0으로 둔다.
        2. 수를 0 방향으로 정수화하고 0..rowCount 범위로 제한하여 headerLines에 둔다.
           명시된 0·빈 문자열·None은 present=True 입력으로 처리한다.
        3. headerLines를 반환한다.
    """
    return headerLines


def normalizeProjectPath(value, directory):
    path = "canonical VFS 경로 문자열."
    """
    Args:
    - value:
      정규화할 VFS 경로 문자열.

    - directory:
      대상 VFS 디렉터리 경로 문자열.

    Return:
    - path:
      canonical VFS 경로 문자열.
      slash-normalized project path.

    변경:
    - 없음.

    처리:
        1. path segment에 . 또는 ..를 허용하지 않는다.
           각 segment는 project file-name 정규화 규칙을 통과해야 한다.
           root를 file 경로로 받으면 거부한다.
           path를 반환한다.
    """
    return path


def projectAssetPath(asset):
    path = "canonical VFS 경로 문자열."
    """
    Args:
    - asset:
      CSV 또는 이미지 딕셔너리. 원형: /backend/project_state/csvAsset 또는 imageAsset

    Return:
    - path:
      canonical VFS 경로 문자열.
      asset.directory와 asset.name의 상관관계로 만들어진 canonical VFS path.

    변경:
    - 없음.

    처리:
        1. asset["directory"]를 디렉터리 경로로 정규화한다.
        2. 해당 디렉터리와 asset["name"]을 슬래시 하나로 연결하여 path를 만든다.
        3. path를 normalizeProjectPath로 정규화하여 반환한다. asset에는 directory와 name을 유지한다.
    """
    return path


def slotFileKind(file):
    kind = "csv, image, slot, plotly 또는 지원하지 않는 형식의 kind 문자열."
    """
    Args:
    - file:
      파일 이름·MIME·바이트를 가진 이번 작업의 입력.

    Return:
    - kind:
      csv, image, slot, plotly 또는 지원하지 않는 형식의 kind 문자열.
      filename/MIME의 위 우선순위에 따른 kind 문자열

    변경:
    - 없음.

    처리:
        1. 순수 filename/MIME 분류. name/type 누락은 empty text로, 비교는 case-insensitive로 처리한다.
           우선순위: .ffsx -> "slot"; .csv/.tsv/.json -> "data";
           image/ MIME 또는 .png/.jpg/.jpeg/.gif/.webp/.bmp/.svg -> "image"; 나머지는 "".
           bytes parse/다운로드/ProjectObject/Frontend 변경은 없다. .json은 여기서 data로 분류하며,
           명시적 graphs.importFile의 Plotly parser나 project.importFile의 FFPX 판정을 대신하지 않는다.
           kind를 반환한다.
    """
    return kind


def projectAssetImportCollisionModel(file, directory, reservedPaths, state=None):
    collisionModel = "충돌 종류·후보 경로·교체 대상을 가진 딕셔너리."
    """
    Args:
    - file:
      파일 이름·MIME·바이트를 가진 이번 작업의 입력.

    - directory:
      대상 VFS 디렉터리 경로 문자열.

    - reservedPaths:
      이번 일괄 작업에서 이미 사용한 경로 문자열의 집합.

    - state:
      이번 작업의 프로젝트 상태 딕셔너리 또는 None. 원형: /backend/project_state/ProjectObject._state

    Return:
    - collisionModel:
      충돌 종류·후보 경로·교체 대상을 가진 딕셔너리.
      assetKind, parent, normalized name/path, mode, replaceId와 UI 안내 정보.

    변경:
    - project state를 변경하지 않는다.

    처리:
        state가 None이면 activeProject._state를 사용한다. VFS 조회와 경로 예약 검사는
        이 state와 reservedPaths를 사용한다.
        1. slotFileKind(file)로 판별하고 raw asset import 대상인 data/image만 허용한다.
           slot/unsupported 분류는 이 asset collision 계산에서 오류이며 state를 변경하지 않는다.
        2. target directory와 file name으로 candidate path를 계산한다.
        3. projectVfsResolve(path,state)와 reservedPaths로 collision을 검사한다.
        4. 같은 asset kind의 existing asset이면 replace-or-rename을 허용한다.
        5. 다른 kind 또는 batch reservation과 충돌하면 rename-only로 처리한다.
           collisionModel를 반환한다.
    """
    return collisionModel


def resolveProjectAssetImportPlan(model, choice, reservedPaths, state=None):
    plan = "경로·교체 id를 가진 import 계획 딕셔너리 또는 None."
    """
    Args:
    - model:
      projectAssetImportCollisionModel 반환 딕셔너리.

    - choice:
      rename 또는 replace 선택. 취소는 None.

    - reservedPaths:
      이번 일괄 작업에서 이미 사용한 경로 문자열의 집합.

    - state:
      이번 작업의 프로젝트 상태 딕셔너리 또는 None. 원형: /backend/project_state/ProjectObject._state

    Return:
    - plan:
      경로·교체 id를 가진 import 계획 딕셔너리 또는 None.
      최종 path와 optional replaceId.

    변경:
    - 없음.

    처리:
        state가 None이면 activeProject._state를 사용한다. VFS 조회와 경로 예약 검사는
        이 state와 reservedPaths를 사용한다.
        1. model은 이번 작업의 UI 입력 제안이다. kind/parent/name/path/mode/replaceId 형식을 검증한다.
           current VFS에서 parent/name/assetKind와 reservedPaths로 projectAssetImportCollisionModel과 같은 충돌 규칙을 다시 계산한다.
           먼저 choice=replace이고 제안 replaceId가 있으면 current same-kind 충돌/id가 정확히 일치하는지 검사한다.
           대기 중 대상 삭제/교체/종류 변경이면 available 분기보다 먼저 오류로 거부하며 choice를 다른 asset/새 create로 옮기지 않는다.
           current available이고 위 stale replace가 아니면 canonical path와 replaceId none을 반환한다.
           choice=replace이며 current same-kind 충돌이 replace를 허용하고 제안 id가 일치하면 기존 id를 유지한다.
           그 외에는 current VFS와 reservedPaths에 대해 projectVfsUniquePath(path,state,reservedPaths)로 rename plan을 계산한다.
           malformed model/invalid parent는 query 오류다. 입력 model/reservedPaths와 Project/Frontend는 변경하지 않는다.
           plan은 한 작업용 detached path/replaceId이고 ASSETS_IMPORTED command는 commit 전에 다시 current authority에서 검증한다.
           UI 취소/선택 대기 자체는 Application 책임이며 이 helper가 callback/modal/task를 실행하지 않는다.
           plan를 반환한다.
    """
    return plan


def buildProjectAssetImportCandidate(files, directory, planImport, targetSlotId=None, state=None):
    candidate = "프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state"
    reservedPaths = "이번 작업에서 사용한 canonical 경로 문자열의 집합."
    plan = "최종 경로 path와 교체 대상 replaceId를 가진 딕셔너리."
    target = "프로젝트 VFS의 해당 경로 조회 결과 또는 None."
    file = "name·MIME·bytes를 가진 입력 파일 자료."
    event = "DATA_OBJECT 또는 IMAGE_OBJECT의 생성·교체 명령 이름."
    input = "해당 명령의 새 asset 입력 딕셔너리."
    rows = "CSV 행 배열의 배열."
    csv = "CSV asset 딕셔너리."
    image = "image asset 딕셔너리."
    slot = "Slot 인스턴스."
    """
    Args:
    - files:
      작업 순서의 파일 입력 배열.

    - directory:
      대상 VFS 디렉터리 경로 문자열.

    - planImport:
      files와 같은 순서의 확정된 경로 딕셔너리 배열. 각 원소는 canonical path와 replaceId를 담는다.
      replaceId는 새 파일이면 None, 교체이면 해당 자산의 양의 정수 id다.

    - targetSlotId:
      연결할 visible Slot의 정수 id 또는 None.

    - state:
      이번 명령의 프로젝트 상태 딕셔너리 또는 None. 원형: /backend/project_state/ProjectObject._state

    Return:
    - candidate:
      프로젝트 변경 딕셔너리.
      전체 raw CSV/image import transaction을 반영한 whole-project candidate.

    변경:
    - authoritative project를 변경하지 않는다.

    처리:
        state가 None이면 activeProject._state를 사용한다. 그 상태를 분리 복사한 candidate에서
        다음 파일·충돌·id·참조 계산을 수행한다.
        1. ASSETS_IMPORTED command 내부에서 호출한다. Application은 assets.resolveImportPlan 조회에서
           확정한 path·replaceId를 planImport에 넣고, 취소이면 명령을 호출하기 전에 None을 반환한다.
           files와 planImport가 비어 있거나 개수가 다르면 거부한다.
           directory의 canonical 경로와 현재 후보의 디렉터리 존재 여부를 검사한다.
           targetSlotId가 있으면 같은 후보에서 visible Slot을 확인한다. 없으면 거부한다.
           파일 파싱·경로·참조·전체 후보 검증 실패는 후보 거부로 전달하고 반영을 수행하지 않는다.

        2. reservedPaths를 빈 집합으로 둔다. files를 입력 순서로 처리하며
           planImport의 같은 순번 원소를 plan에 둔다. 각 plan의 path 문자열과
           replaceId의 None 또는 양의 정수 형식을 검사한다.
           path가 canonical 형식이고 부모가 directory와 같으며 reservedPaths에 없어야 한다.
           파일 종류는 slotFileKind(file)로 확인하여 data 또는 image를 허용한다.
           projectVfsResolve(plan["path"],candidate)를 target에 둔다.
           replaceId가 None이면 target이 없어야 한다.
           교체이면 target이 존재하고 종류가 입력 파일의 CSV 또는 image 종류와 같으며
           자산 id가 plan["replaceId"]와 같아야 한다. 불일치이면 거부한다.
           CSV이면 parseProjectDataAsset에 file의 name·bytes를 전달하여 rows에 둔다.
           plan이 교체이면 종류별 REPLACED를, 생성이면 CREATED를 event에 둔다.
           plan의 경로·교체 id와 파일의 name·MIME·bytes, CSV의 rows로 input을 구성하고
           buildAssetCommandCandidate(event,input,candidate)의 후보를 candidate에 둔다.
           targetSlotId를 명시한 경우에 다음 Slot 연결을 수행한다.
           resolveVisibleSlot(targetSlotId,candidate)의 결과를 slot에 둔다.
           slot이 없으면 거부한다. CSV는 projectVfsResolve(plan["path"],candidate)의 target을 csv에 두고
           graphs.connectDataToSlotModel(slot,csv["rows"],csv["name"],csv,candidate)의 반환값을 candidate에 둔다.
           image는 같은 경로 조회의 target을 image에 두고 Slot.content["imageId"]에 image["id"],
           Slot.content["contentType"]에 image 문자열을 적용한다. 기존 소유 chart를 제거하여
           Slot.content["chart"]=None으로 둔다. geometry와 caption을 유지한다.
           각 파일의 생성·교체와 대상 연결을 마친 뒤 최종 경로를 reservedPaths에 넣고 다음 파일을 처리한다.
        3. 빈 CSV 삽입으로 생성한 asset은 일반 CSV asset이다. isDefaultEmpty, protected, undeletable, unmovable 같은 별도 상태를 갖지 않는다. 같은 이름이 이미 존재하면 일반 project asset collision/unique-path 규칙을 사용하며 기존 CSV를 암묵적으로 교체하지 않는다.
        4. candidate를 반환한다.
    """
    return candidate


def planProjectNodeMove(path, directory, state=None):
    movePlan = "이동 경로·충돌·참조 수를 가진 딕셔너리."
    """
    Args:
    - path:
      대상 VFS 경로 문자열.

    - directory:
      대상 VFS 디렉터리 경로 문자열.

    - state:
      이번 명령의 프로젝트 상태 딕셔너리 또는 None. 원형: /backend/project_state/ProjectObject._state

    Return:
    - movePlan:
      이동 경로·충돌·참조 수를 가진 딕셔너리.
      source, kind, target directory, destination, collision, uniqueName,
        trash 진입 여부와 현재 referenceCount.

    변경:
    - 없음.

    처리:
        1. state가 None이면 activeProject._state를 사용한다. projectVfsResolve(path,state)로 source를 resolve하고 fixed directory이면 move 불가로 판정한다.
        2. trash membership 자체는 source move 금지 조건으로 사용하지 않는다.
        3. target directory, destination, collision, trash 진입 여부와 reference 상태를 읽어 UI confirmation에 필요한 값을 계산한다.

        4. 고정 directory의 유일한 값 원천은 backend.defaults.vfs의 root/csv/image/trash다. 삭제 또는 이동 대상으로 취급하지 않는다.
        5. movePlan를 반환한다.
    """
    return movePlan


def projectFileStem(value):
    stem = "파일 이름에 사용할 문자열."
    """
    Args:
    - value:
      파일 이름으로 변환할 프로젝트 이름 값.

    Return:
    - stem:
      파일 이름에 사용할 문자열.
      위 규칙의 safe project filename stem

    변경:
    - 없음.

    처리:
        1. project export filename의 pure sanitize. missing/null은 empty text, text trim 뒤
           backslash/slash/colon/star/question/double-quote/angle-bracket/pipe 및 U+0000..001F를 hyphen으로 바꾼다.
           whitespace run은 space 하나로 합치고 trailing dot/space를 없앤 뒤 backend.defaults.naming.exportStemMaxLength text units로 제한한다.
           결과 empty면 fast-figure-project다. 원래 project metadata/name은 바꾸지 않는다.
           stem를 반환한다.
    """
    return stem


def ffpxBuildProject():
    package = "이름·바이트를 가진 package entry 배열."
    """
    Args:
    - 없음.

    Return:
    - package:
      이름·바이트를 가진 package entry 배열.
      FFPX manifest 의미와 ZIP entry 목록.

    변경:
    - activeProject를 변경하지 않는다.

    처리:
        1. 문서 경로와 역할은 FFPX_STRUCTURE를 사용한다. 각 XML entry 이름과 data/media 경로는 그 정의의 키를 참조한다.
        2. activeProject 전체를 validation한다.
        3. projectObjects 공식 read path에서 export snapshot을 읽는다.
        4. trash asset/directory를 제외한다.
        5. chart CSV reference, chart 1:1 ownership, slot image reference가 export 가능한지 재검사한다.
        6. project.xml에 project metadata, fileSystem, appearance, persistent export settings와 document ref를 기록한다.
        7. layout/caption/labels/slot 문서는 각 책임 데이터만 기록한다.
           snapshot의 Slot 인스턴스는 Slot 원형에 정의된 영속 속성을 같은 이름의 키로 가진
           저장용 딕셔너리로 구성한다. content의 중첩 필드와 caption을 포함한다.
           이 작업용 딕셔너리를 typed XML writer에 전달하고 저장 문서의 기존 필드명을 유지한다.
        8. 각 Slot의 imageSettings는 imageRef가 None이어도 typed imageObject/settings에 기록한다.
           typed XML grammar는 ffpxEncodeValue를 사용한다.
        9. CSV/image bytes는 metadata와 분리해 dataRef로 연결한다.

        10. FFPX export는 PROJECT_TRASH_DIRECTORY 아래의 CSV, image, directory를 package에 포함하지 않는다. export 대상 chart/slot이 trash asset을 참조하면 실패한다.
        11. FFPX/FFSX가 포함하는 data/image asset은 project/package가 소유한 copied bytes로 읽고 쓴다. package 내부 metadata에 원본 local filesystem path를 재개방 필수 reference로 저장하지 않는다. package를 다른 환경으로 이동해도 package entry만으로 asset을 복원할 수 있어야 한다.
        12. raw file import는 원본 bytes를 그대로 보존한다. 원본 bytes가 없는 새 table asset은
            encodeTableAssetBytes에 rows와 target filename을 전달하여 바이트를 얻는다.
            package dataRef 확장자는 .json/.tsv/.csv를 유지하고 그 외는 .csv로 정한다.
            기존 filename·path·MIME과 원본 bytes를 유지한다.
        13. package를 반환한다.
    """
    return package


def ffpxReadProject(file):
    payload = "프로젝트 저장 필드 딕셔너리."
    entries = "path와 bytes를 가진 package entry 딕셔너리 배열."
    """
    Args:
    - file:
      파일 이름·MIME·바이트를 가진 이번 작업의 입력.

    Return:
    - payload:
      프로젝트 저장 필드 딕셔너리.
      buildProjectObject가 검증/정규화할 project import payload.

    변경:
    - activeProject를 변경하지 않는다.

    처리:
        1. 프로젝트 XML·문서 참조와 data/media entry의 경로는 FFPX_STRUCTURE의 키를 참조한다.
        2. readStorePackage(file)로 검사한 entries를 얻는다.
        3. 필수 XML 문서와 slot 문서를 ffpxDecodeValue로 읽고 schema/version을 PACKAGE_FORMAT_VERSION과 비교한다.
           지원하는 현재 version이 아니면 실패한다.
        4. 저장 순서대로 slot 배치와 chart/image 참조를 payload에 구성한다.
           각 CSV/image dataRef가 허용 subtree 안의 실제 entry를 가리키는지 확인한다.
        5. CSV entry의 bytes를 parseProjectDataAsset로 읽고 원본 bytes와 함께 보존한다.
           저장된 headerLines는 normalizeCsvHeaderLines로 정규화한다.
        6. imageRef가 None이어도 typed imageObject/settings의 슬롯별 imageSettings를 복원한다.
           imageRef=None이면 image asset을 생성하지 않는다.
        7. 같은 version에서 export settings가 없으면 project default로 보완한다.
           chart 공유·orphan의 검증은 buildProjectObject에 전달할 구조를 보존하여 수행한다.
        8. payload를 반환한다.
    """
    return payload


def ffsxBuildSlot(slot, chart):
    package = "이름·바이트를 가진 package entry 배열."
    """
    Args:
    - slot:
      Slot 인스턴스. 원형: /backend/project_state/Slot

    - chart:
      chartModel 딕셔너리. 원형: /backend/graphs/chartModel

    Return:
    - package:
      이름·바이트를 가진 package entry 배열.
      선택 graph slot과 그 chart가 참조하는 CSV만 포함한 FFSX entry 목록.

    변경:
    - 없음.

    처리:
        1. 슬롯 XML·asset metadata·CSV entry의 경로와 역할은 FFSX_STRUCTURE의 키를 참조한다.
        2. slot은 /backend/project_state/Slot 인스턴스다. slot.content["chart"]로 소유 chart를
           확인하고 slot.caption을 슬롯 문서에 기록한다. Slot의 영속 속성은 같은 이름의 저장용
           딕셔너리로 옮겨 typed XML writer에 전달한다. package-local id mapping은 이 복사본에 적용한다.
           graphs.validateChartModel이 실제 project CSV object로 판정한 object가 참조하는 CSV만 package-local 연속 id로 remap한다.
           그 object csvId도 같은 mapping으로 변경한다. non-editable imported conversion chart는 원본과 conversion view를 보존하며
           conversion object를 CSV 수집/remap 대상에 넣지 않는다. validateChartModel의 representation 판정을 그대로 사용한다.
           graph object가 0개인 blank editable chart는 CSV entry 없이 유효하게 package한다.
           CSV bytes는 assets/data subtree에 별도 저장한다.

        3. FFSX graph settings에는 Project chart id를 기록하지 않는다. applyFfsxSlot이 현재 candidate에서 새 id를 할당한다. package schema/version은 wire metadata에 기록한다.
        4. package를 반환한다.
    """
    return package


def ffsxReadSlot(file):
    slotPayload = "슬롯·chart·CSV를 가진 패키지 딕셔너리."
    entries = "path와 bytes를 가진 package entry 딕셔너리 배열."
    """
    Args:
    - file:
      파일 이름·MIME·바이트를 가진 이번 작업의 입력.

    Return:
    - slotPayload:
      슬롯·chart·CSV를 가진 패키지 딕셔너리.
      chart, slot caption, package-local CSV를 포함한 검증된 payload.

    변경:
    - activeProject를 변경하지 않는다.

    처리:
        1. 슬롯 XML·asset metadata·CSV entry의 경로와 역할은 FFSX_STRUCTURE의 키를 참조한다.
        2. readStorePackage(file)로 entries를 얻고 slot XML의 schema/version을 PACKAGE_FORMAT_VERSION과 비교한다.
           지원하는 현재 version이 아니면 실패한다.
        3. ffpxDecodeValue로 slot caption과 chart 설정, package-local CSV metadata를 읽는다.
           실제 project graph object의 CSV 참조와 dataRef가 올바른 entry를 가리키는지 확인한다.
        4. CSV bytes를 parseProjectDataAsset로 읽고 원본 bytes와 함께 보존한다.
           headerLines는 normalizeCsvHeaderLines로 정규화한다.
        5. conversion view는 graphs.validateChartModel의 representation 판정으로 검증한다.
           objects가 빈 배열인 editable chart는 CSV entry 없이 허용한다.
        6. FFSX의 chart에는 Project chart id를 부여하지 않는다.
           applyFfsxSlot이 현재 candidate의 nextId.chart로 새 Project id를 할당한다.
        7. graphs.validateChartModel로 검증한 slotPayload를 반환한다.
    """
    return slotPayload


def projectVfsResolve(path, state):
    resolved = "VFS 노드 딕셔너리 또는 None."
    """
    Args:
    - path:
      대상 VFS 경로 문자열.

    - state:
      이번 작업의 프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state

    Return:
    - resolved:
      VFS 노드 딕셔너리 또는 None.
      canonical path에 대응하는 directory/CSV/image object 또는 없음.

    변경:
    - 없음.

    처리:
        1. path를 normalizeProjectPath로 canonical 경로로 만든다.
        2. state의 directory 경로와 각 CSV/image의 projectAssetPath를 비교한다.
           같은 경로의 대상이 둘 이상이면 VFS 검증 실패를 전달한다.
        3. 일치한 directory·CSV·image의 kind와 대상을 resolved에 둔다.
           고정 directory는 backend.defaults.vfs의 경로를 사용하고, 부재이면 None으로 둔다.
        4. resolved를 반환한다.
    """
    return resolved


def projectVfsUniquePath(path, state, reservedPaths):
    uniquePath = "canonical VFS 경로 문자열."
    """
    Args:
    - path:
      대상 VFS 경로 문자열.

    - state:
      이번 작업의 프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state

    - reservedPaths:
      이번 일괄 작업에서 이미 사용한 경로 문자열의 집합.

    Return:
    - uniquePath:
      canonical VFS 경로 문자열.
      같은 parent 안에서 현재 state와 reservedPaths 모두에 없는 canonical path.

    변경:
    - 없음.

    처리:
        1. 원래 basename과 extension 의미를 유지하면서 충돌 suffix를 계산한다.
           unique path 계산은 실제 asset location을 변경하지 않는다.
           uniquePath를 반환한다.
    """
    return uniquePath


def projectVfsDescendants(directory, state):
    descendants = "하위 경로 문자열의 배열."
    """
    Args:
    - directory:
      대상 VFS 디렉터리 경로 문자열.

    - state:
      이번 작업의 프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state

    Return:
    - descendants:
      하위 경로 문자열의 배열.
      directory 아래의 directory/CSV/image reference 목록.

    변경:
    - 없음.

    처리:
        1. canonical path segment boundary로 subtree 포함 여부를 판정한다.
           descendants를 반환한다.
    """
    return descendants


def parseProjectDataAsset(name, bytes):
    rows = "행 배열의 배열."
    """
    Args:
    - name:
      이름 문자열.

    - bytes:
      이번 입력의 바이트 배열.

    Return:
    - rows:
      행 배열의 배열.
      CSV/TSV/JSON 원본 bytes에서 계산한 table projection.

    변경:
    - 없음.

    처리:
        1. bytes를 UTF-8 text로 해석한다. 원본 bytes는 이 함수의 입력으로 유지한다.
        2. name의 확장자가 .json이면 top-level array 또는 object의 data array를 얻어
           graphs.dataTable로 행 배열을 구성한다. table shape가 잘못되면 실패한다.
        3. .tsv이면 tab, .csv이면 comma를 delimiter로 사용한다. 다른 확장자는 실패한다.
        4. delimited text를 순서대로 읽는다. double quote 안의 delimiter와 줄바꿈은 셀 문자로 넣고,
           doubled quote는 하나의 quote 문자로 넣는다.
        5. row 순서와 파일 내부의 명시적 blank row를 유지한다.
           완전히 빈 trailing physical line은 새 row를 만들지 않는다.
        6. 행 배열을 rows에 두고 반환한다.
    """
    return rows


def collectAssetReferences(csvIds, imageIds, state):
    references = "asset별 참조 count·slot·chart 정보를 가진 딕셔너리."
    """
    Args:
    - csvIds:
      검사할 CSV id의 집합.

    - imageIds:
      검사할 이미지 id의 집합.

    - state:
      이번 작업의 프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state

    Return:
    - references:
      asset별 참조 count·slot·chart 정보를 가진 딕셔너리.
      CSV별 graph-object reference와 image별 slot reference를 실제 object 단위로 나열한 read-only 결과.

    변경:
    - 없음.

    처리:
        1. validateChartModel과 같은 representation 판정으로 실제 project object.csvId만 수집한다. 편집을 잠시 끈 일반 chart도 포함한다.
           non-editable conversion rows/object는 project CSV reference가 아니므로 포함하지 않는다.
           같은 chart 안에서 같은 실제 CSV를 여러 graph object가 참조하면 각각 별도 reference로 센다.
           image는 참조하는 slot마다 하나의 reference로 센다.
           confirmation count와 실제 cascade mutation이 같은 reference set을 사용한다.
           CSV delete/trash 진입/empty-trash의 candidate filter는 제거 전 chart별 original object index를 구별한다.
           실제 제거 위치는 projectEFSM의 공통 cascade index-map 계산에 사용하며 값이 같은 object를 equality로 재매칭하지 않는다.
           conversion view는 위 reference 판정에 따라 제외하고, Frontend 선택이나 별도 persistent object id를 읽거나 만들지 않는다.
           references를 반환한다.
    """
    return references


def ffpxEncodeValue(value):
    xmlValue = "XML 원소."
    """
    Args:
    - value:
      None·논리값·숫자·문자열·배열·딕셔너리 중 직렬화할 값.

    Return:
    - xmlValue:
      XML 원소.
      type 속성과 scalar text 또는 item/property child를 갖는 value 원소.

    변경:
    - 없음.

    처리:
        1. None은 type=null, 논리값은 type=boolean과 true/false text, 유한한 수는 type=number와 수 text, 문자열은 type=string과 그 text로 기록한다.
        2. 배열은 type=array로 두고 순서대로 item/value child를 만들며 같은 함수를 재귀 호출한다.
           딕셔너리는 type=object로 두고 property name과 value child를 만들며 같은 함수를 재귀 호출한다.
           array 순서와 object property name을 보존하고 XML text/attribute를 escape한다.
           지원하지 않는 runtime 값은 writer 오류로 처리한다.
           xmlValue를 반환한다.
    """
    return xmlValue


def ffpxDecodeValue(element):
    value = "입력 경로 또는 codec 자료형의 값."
    """
    Args:
    - element:
      형식 codec의 XML 원소.

    Return:
    - value:
      입력 경로 또는 codec 자료형의 값.
      typed XML element에서 복원한 값.

    변경:
    - 없음.

    처리:
        1. element의 value type 속성을 읽고 아래 type의 XML 구조를 확인한다. 지원하지 않는 type이나 잘못된 구조이면 실패한다.
        2. null이면 scalar child가 없는지 확인하고 value=None으로 둔다.
        3. boolean이면 true/false text를 확인하여 대응 논리값을 value에 둔다.
        4. number이면 text를 유한한 수로 읽어 value에 둔다. 무효 또는 비유한 수이면 실패한다.
        5. string이면 XML escape를 해석한 text를 value에 둔다.
        6. array이면 item/value child를 문서 순서대로 같은 함수에 전달하여 반환값 배열을 value에 둔다.
        7. object이면 각 property의 name과 value child를 읽고 같은 함수로 해석한 값을 해당 이름의 딕셔너리 원소에 넣는다.
        8. value를 반환한다.
    """
    return value


def buildProjectObject(payload, fileName):
    candidate = "ProjectObject 인스턴스. 원형: /backend/project_state/ProjectObject"
    state = "ProjectObject._state 원형의 프로젝트 상태 딕셔너리."
    """
    Args:
    - payload:
      ffpxReadProject가 해석한 프로젝트 저장 자료. 슬롯 원소는 저장 필드 딕셔너리다.

    - fileName:
      가져온 프로젝트 파일 이름. 프로젝트 이름 보완에 사용하는 문자열.

    Return:
    - candidate:
      ProjectObject 인스턴스. 원형: /backend/project_state/ProjectObject
      복원한 슬롯을 Slot 인스턴스로 소유하는 ProjectObject.
          원형: /backend/project_state/ProjectObject

    변경:
    - 없음.

    처리:
        1. payload의 schema/version, 프로젝트 이름과 grid 크기를 확인하고
           ProjectObject._state 원형의 state 딕셔너리에 프로젝트 필드를 분리 복사한다.
        2. CSV와 이미지의 id, bytes, canonical VFS 위치를 state["assets"]에 구성한다.
           각 CSV의 headerLines는 normalizeCsvHeaderLines(저장 값, rows 길이, 필드 존재 여부)로 정규화한다.
           state["charts"]에는 chart와 graph object를 복원한다.
           graphs.validateChartModel의 representation 판정에 따라 실제 project object의
           CSV 참조를 검증한다. 가져온 conversion view와 원본 표현을 보존한다.
        3. state["slots"]를 빈 배열로 둔다. payload의 슬롯 딕셔너리를 저장 순서대로
           normalizeSlotContent에 전달하고 반환된 Slot을 배열 끝에 추가한다.
           이 변환은 원본 필드의 존재 여부로 canonical/legacy 우선순위를 결정하므로
           저장된 None, False, 0, 빈 문자열과 필드 누락을 구별한다.
        4. 각 chart가 state["slots"]의 slot.content["chart"]에 정확히 한 번 연결되는지
           검증한다. 공유 또는 소유자가 없는 chart가 있으면 복원을 실패시킨다.
        5. labels/captions/appearance/export 설정을 복원한다.
           같은 버전의 자료에서 export 설정이 없으면 프로젝트 설정 기본값으로 보완한다.
           저장된 슬롯 배치와 content의 추가 필드는 정규화 과정에서 보존한다.
        6. CSV/image/chart 컬렉션의 최대 id보다 큰 다음 id를 state["nextId"]에 계산한다.
        7. validateProjectObjectState(state, True)로 state 전체를 검증한다. 성공하면 ProjectObject(state)를
           생성하여 candidate에 둔다. 실패하면 복원 실패를 호출자에게 전달한다.
        8. candidate를 반환한다. 현재 프로젝트로 채택하는 명령이 최종 검증과 교체를 수행한다.
    """
    return candidate


def applyFfsxSlot(slotPayload, targetSlot, state=None):
    candidate = "프로젝트 변경 딕셔너리."
    """
    Args:
    - slotPayload:
      ffsxReadSlot이 반환한 슬롯 패키지 딕셔너리.

    - targetSlot:
      대상 Slot 인스턴스. 원형: /backend/project_state/Slot

    - state:
      이번 명령의 프로젝트 상태 딕셔너리 또는 None. 원형: /backend/project_state/ProjectObject._state

    Return:
    - candidate:
      프로젝트 변경 딕셔너리.
      새 CSV id mapping과 새 chart id를 포함한 target slot/project candidate.

    변경:
    - 없음.

    처리:
        1. state가 None이면 activeProject._state를 사용한다.
           targetSlot의 id를 작업 대상 식별자로 사용한다.
           resolveVisibleSlot(targetSlot.id, state)로 현재 대상의 존재를 확인한다.
           state를 Slot과 중첩 content까지 분리 복사한 candidate를 만든다.
           같은 id의 candidate Slot에 적용하며 대상이 사라졌으면 명령의 거부 결과를 반환한다.
        2. validateChartModel이 실제 project CSV object로 판정한 object가 참조하는 package-local CSV마다 새 project id/path candidate를 만든다.
        3. 그 object csvId만 새 mapping으로 바꾼다. non-editable conversion chart의 imported/conversion view는 그대로 보존한다.
        4. 새 chart id를 할당하고 candidate의 대상 Slot.content["chart"]에 연결한다.
           기존 대상의 row, col, rowSpan, colSpan, hidden과 id는 유지한다.
           교체되는 chart의 소유 참조 정리는 같은 명령의 candidate 계산에 포함한다.
        5. FFSX가 제공하는 caption을 candidate의 대상 Slot.caption에 적용한다.
        6. whole-project invariant를 검증한다.
        7. caller인 SLOT_CHART_IMPORTED가 최종 검증 후 한 번 commit한다.
           candidate를 반환한다.
    """
    return candidate


def buildAssetCommandCandidate(event, payload, state):
    candidateState = "프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state"
    retainedOriginalIndicesByChart = "chart id를 키로, 유지할 원래 object index 배열을 값으로 가진 딕셔너리."
    references = "asset별 graph object·Slot 참조 딕셔너리."
    descendants = "canonical VFS 경로 문자열의 배열."
    loaded = "ProjectObject 인스턴스. 원형: /backend/project_state/ProjectObject"
    csvIds = "이번 명령의 CSV id 집합."
    imageIds = "이번 명령의 image id 집합."
    """
    Args:
    - event:
      이 함수에 연결된 프로젝트 명령 등록의 키.
        원천: /backend/project_efsm/PROJECT_COMMANDS

    - payload:
      해당 명령의 대상 id·경로, 새 값, 파일과 최종 import 선택을 담은 딕셔너리.

    - state:
      send가 이번 명령에 분리 복사한 프로젝트 상태 딕셔너리.
        원형: /backend/project_state/ProjectObject._state

    Return:
    - candidateState, retainedOriginalIndicesByChart:
      후보 상태와 chart별 원래 index 배열의 쌍. 거부·취소 시 후보 상태는 None이다.

    변경:
    - 이번 명령의 state에 asset·VFS·chart 참조 변경을 적용한다.

    처리:
        1. candidateState에 state를, retainedOriginalIndicesByChart에 빈 딕셔너리를 둔다.
           csvIds·imageIds는 빈 집합, descendants는 빈 배열로 둔다.
           아래 event에 해당하는 계산 하나를 수행한다. 참조 부재·종류 불일치·충돌·취소는
           candidateState=None으로 반환하고 파일 해석 오류는 호출자에게 전달한다.
        2. PROJECT_LOADED이면 ffpxReadProject(payload["file"])의 결과와 파일 이름을
           buildProjectObject에 전달한다. 반환 ProjectObject를 loaded에 두고
           loaded._state를 candidateState로 사용한다.
        3. PROJECT_NAME_CHANGED이면 payload의 value를 문자열로 변환한다.
           trim=True일 때 양끝 공백을 제거하고 backend.defaults.naming.projectNameMaxLength로
           길이를 제한하여 candidateState["meta"]["projectName"]에 넣는다.
        4. PROJECT_DIRECTORY_CREATED이면 부모 경로를 정규화하고 projectVfsResolve로
           부모 directory와 요청 경로의 부재를 확인한다. 검증한 canonical 경로를
           candidateState["fileSystem"]["directories"]에 한 번 추가한다.
        5. PROJECT_NODE_MOVED이면 planProjectNodeMove에 path·directory·candidateState를 전달한다.
           고정 directory, 부모 부재, 자기 하위로의 이동, 충돌을 검사한다.
           최종 경로로 대상의 directory/name과 하위 directory·asset 경로를 바꾼다.
           경로의 segment 경계를 사용하며 하위 항목의 상대 경로를 보존한다.
           trash 바깥에서 안으로 이동하는 subtree의 CSV/image id를 모은다.
        6. PROJECT_TRASH_EMPTIED이면 projectVfsDescendants(PROJECT_TRASH_DIRECTORY,
           candidateState)로 descendants를 얻고 그 안의 CSV/image id를 모은다.
           고정 trash directory를 유지하고 제거할 하위 directory·asset 경로를 descendants에 둔다.
        7. DATA_OBJECT_DELETED 또는 IMAGE_OBJECT_DELETED이면 명시한 id의 현재 asset을
           같은 candidateState에서 확인하고 제거할 CSV 또는 image id 집합을 만든다.
           5번의 trash 진입, 6번, 이 단계에서 모은 집합과 candidateState를
           collectAssetReferences(csvIds,imageIds,candidateState)에 전달한다.
           실제 CSV 참조가 있는 chart마다 objects를 원래 index와 함께 순회한다.
           제거 집합의 csvId를 가진 실제 project object를 제외하고 나머지를 원래 순서로 둔다.
           실제 제거가 생긴 chart의 유지된 원래 index 배열을 retainedOriginalIndicesByChart에 넣는다.
           conversion view는 collectAssetReferences의 representation 판정에 따른다.
           image 참조는 해당 Slot.content["imageId"]를 None으로 바꾼다.
           참조 해제 뒤 삭제 명령과 trash 비우기의 해당 asset을 컬렉션에서 제거한다.
           trash 비우기는 descendants의 하위 directory도 제거한다.
        8. ASSETS_IMPORTED이면 payload의 files·directory·choices·targetSlotId와 candidateState를
           buildProjectAssetImportCandidate에 전달한다. 반환한 전체 후보를 candidateState로 둔다.
           생성 asset과 Slot/chart 연결은 같은 후보에 적용한다.
        9. DATA_OBJECT_CREATED 또는 IMAGE_OBJECT_CREATED이면 명시한 id의 정수형·중복을 검사한다.
           id가 생략되거나 None이면 종류별 nextId를 사용하고, nextId는 할당한 id보다 큰 값으로 유지한다. 현재 VFS·부모·예약 경로를 검사하여 최종 canonical 경로를 정한다.
           name·directory·MIME을 같은 asset에 둔다. bytes 입력은 분리 복사하고,
           bytesBase64 입력은 base64로 디코딩하여 바이트를 확인한다.
           CSV의 data가 있으면 graphs.dataTable(data), rows가 있으면 그 분리 복사본,
           둘 다 없으면 parseProjectDataAsset(name,bytes)의 반환값을 rows에 적용한다.
           원본 bytes가 없는 표는 encodeTableAssetBytes(rows,name)의 바이트를 사용한다.
           바이트의 base64 표현을 asset의 bytesBase64 필드에 넣는다.
           normalizeCsvHeaderLines에 값·rows 길이·필드 존재 여부를 전달하여 headerLines에 둔다.
           asset을 종류별 컬렉션 끝에 추가한다.
        10. DATA_OBJECT_REPLACED이면 현재 CSV의 id·directory·name을 유지한다.
            data 입력은 graphs.dataTable의 결과로, rows 입력은 분리 복사본으로 표를 교체한다.
            명시된 bytes·bytesBase64·MIME만 교체한다. 바이트 입력은 base64 표현으로 저장한다.
            headerLines가 명시되면 현재 후보 rows 길이로 normalizeCsvHeaderLines를 호출한다.
            생략한 필드는 기존 값을 유지한다.
            IMAGE_OBJECT_REPLACED이면 현재 image의 id·경로를 유지하고 명시한 bytes·MIME을 교체한다.
        11. CSV 생성·교체에서는 해당 id를 csvIds에 둔다. 실제 object의 csvId가 csvIds에
            속하거나 7번에서 object가 제거된 chart는 같은 candidateState를 project 인자로
            graphs.rebuildEditableGraph에 전달한다. 반환 chart를 candidateState의 같은 chart id에 넣는다.
            candidateState와 retainedOriginalIndicesByChart를 반환한다.
    """
    return candidateState, retainedOriginalIndicesByChart


def encodeTableAssetBytes(rows, name):
    bytes = "바이트 배열."
    cells = "셀 문자열의 배열."
    lines = "행 문자열의 배열."
    text = "문자열."
    delimiter = "탭 또는 쉼표 문자."
    """
    Args:
    - rows:
      CSV asset의 행 배열의 배열.

    - name:
      asset 파일 이름 문자열.

    Return:
    - bytes:
      표의 UTF-8 바이트 배열.

    변경:
    - 없음.

    처리:
        1. 이름의 확장자가 .json이면 rows를 JSON 배열 문자열로 직렬화하여 text에 둔다.
        2. .json 이외의 이름은 다음 절차로 text를 만든다.
           .tsv이면 delimiter를 탭으로, 그 외 확장자이면 쉼표로 둔다. lines를 빈 배열로 둔다.
           rows의 각 행마다 cells를 빈 배열로 둔다. None 셀은 빈 문자열, scalar 셀은 문자열,
           배열·딕셔너리 셀은 compact JSON 문자열로 변환한다.
           셀에 delimiter·double quote·CR·LF가 있으면 내부 double quote를 두 번 쓰고
           전체 셀 문자열을 double quote로 감싼다. cells를 delimiter로 이어 lines에 넣는다.
           lines를 LF로 이어 text에 두며 끝에 별도의 LF를 붙이지 않는다.
        3. text를 UTF-8로 인코딩하여 bytes에 두고 반환한다.
    """
    return bytes
