"""
Fast Figure Source Script — Application boundary / public-api — asset wrappers

하위 구현 검증 자료: ../../../fast-figure.js, ../../../fast-figure-ui.js, ../../../Fast-figure.html.
Python 문법으로 작성한 구현 명세다.
"""

from sourcescript.backend.project_state import BACKEND_QUERY_KINDS
from sourcescript.application.adapter import dispatchProjectCommand, dispatchProjectQuery, dispatchInterfaceEvent, dispatchSlotSelection
from sourcescript.backend.assets_files import EMPTY_CSV_TEMPLATE, PROJECT_ASSET_DIRECTORIES
from sourcescript.frontend.interface_fsm import interfaceFSM
from sourcescript.frontend.renderer import downloadExportPayload
from sourcescript.application.public_api.graphs import importSelectedGraphFile

def readAssetFileKind(file):
    kind = "data, image, slot, plotly 또는 unknown 문자열."
    """
    Args:
    - file:
      파일 이름·MIME·바이트를 가진 이번 작업의 입력.

    Return:
    - kind:
      data, image, slot, plotly 또는 unknown 문자열.

    변경:
    - 없음.

    처리:
        1. assets.fileKind: copied name/type만 공식 pure query에 전달하고 kind 문자열을 그대로 반환한다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['assets.fileKind'], 'file': 'file의 name/type copy'})를 반환한다.
    """
    return kind


def readAssetCollisionModel(file, directory, reservedPaths):
    model = "충돌 정보 딕셔너리."
    """
    Args:
    - file:
      파일 이름·MIME·바이트를 가진 이번 작업의 입력.

    - directory:
      대상 VFS 디렉터리 경로 문자열.

    - reservedPaths:
      이번 일괄 작업에서 이미 사용한 경로 문자열의 집합.

    Return:
    - model:
      충돌 정보 딕셔너리.

    변경:
    - 없음.

    처리:
        1. assets.collisionModel: immutable 한 작업용 model; UI choice는 이 query 밖에서 수집한다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['assets.collisionModel'], 'file': file, 'directory': directory, 'reservedPaths': reservedPaths})를 반환한다.
    """
    return model


def readAssetImportPlan(model, choice, reservedPaths):
    plan = "명시적 import 계획 딕셔너리 또는 None."
    """
    Args:
    - model:
      projectAssetImportCollisionModel 반환 딕셔너리.

    - choice:
      rename 또는 replace 선택. 취소는 None.

    - reservedPaths:
      이번 일괄 작업에서 이미 사용한 경로 문자열의 집합.

    Return:
    - plan:
      명시적 import 계획 딕셔너리 또는 None.

    변경:
    - 없음.

    처리:
        1. assets.resolveImportPlan: UI 제안과 explicit choice만 전달; 오류는 전파하고 commit/예약으로 취급하지 않는다.
           dispatchProjectQuery('project-api', {'operation': BACKEND_QUERY_KINDS['project-api']['assets.resolveImportPlan'], 'model': model, 'choice': choice, 'reservedPaths': reservedPaths})를 반환한다.
    """
    return plan


def selectProjectCsv(path):
    outcome = "CSV 자산 딕셔너리 또는 None."
    resolved = "삭제 대상 조회 딕셔너리 또는 None."
    target = "CSV 자산 딕셔너리."
    """
    Args:
    - path:
      선택할 CSV의 canonical 경로 문자열.

    Return:
    - outcome:
      지정한 CSV의 공식 읽기 결과. 대상이 없거나 CSV가 아니면 None.
      원형: /backend/project_state/readBackendProjection의 assets.readDeletionTarget 결과 중 target.

    변경:
    - Frontend CSV 선택과 그래프 객체 선택.

    처리:
        1. assets.readDeletionTarget 공식 조회에 path를 전달하고 결과를 resolved에 둔다.
           대상이 없거나 kind가 csv가 아니면 None을 반환한다. resolved["target"]을 target에 둔다.
        2. target["path"]와 kind=csv를 SELECT_ASSET의 입력으로 dispatchInterfaceEvent에 전달한다.
           Frontend 전이는 CSV를 선택하고 그래프 객체 선택을 해제한다. 슬롯 선택은 유지한다.
        3. target을 outcome에 둔다. 조회·전이 오류는 전파한다.
    """
    return outcome


def createEmptyProjectCsvAndSelect():
    csv = "CSV 딕셔너리, 미반영 명령 결과 또는 None."
    """
    Args:
    - 없음.

    Return:
    - csv:
      CSV 딕셔너리, 미반영 명령 결과 또는 None.
      미commit이면 원래 failure; committed CSV이면 selectProjectCsv(csv canonical path) 결과

    변경:
    - Backend CSV 컬렉션·다음 id와 Frontend CSV 선택.

    처리:
        assets.createEmptyCsv의 public create-and-select operation.
        1. createEmptyProjectCsv의 일반 create command를 정확히 한 번 실행한다.
        2. 미commit 결과면 그대로 반환하며 SELECT_ASSET/성공 read를 하지 않는다. throw는 전파한다.
        3. committed CSV의 scalar canonical path로 selectProjectCsv를 호출한다. graph object/chart 생성 없음.
        4. 성공 시 선택된 detached CSV를 반환한다. selection 거부는 none, query/adapter throw는 전파한다.
           create는 이미 commit되었으므로 사후 selection/read 실패를 미commit으로 위장하거나 asset을 rollback하지 않는다.
           csv를 반환한다.
    """
    return csv


def importProjectFilesToDirectory(files, directory, planImport):
    choices = "이번 파일별 충돌 선택값 배열."
    assets = "등록한 asset 딕셔너리 배열, 미반영 명령 결과 또는 None."
    """
    Args:
    - files:
      작업 순서의 파일 입력 배열.

    - directory:
      대상 VFS 디렉터리 경로 문자열.

    - planImport:
      충돌 정보를 받아 사용자의 rename/replace/취소 선택을 반환하는 함수.

    Return:
    - assets:
      등록한 asset 딕셔너리 배열, 미반영 명령 결과 또는 None.

    변경:
    - 전체 candidate가 검증된 뒤 CSV/image collection과 관련 reference를 한 번 commit한다.

    처리:
        1. Application은 pure file-byte read/parse와 readAssetFileKind/readAssetCollisionModel/readAssetImportPlan의 공식 query 및 UI choice 수집을 수행할 수 있다.
           planImport의 UI-local resolver를 완료하여 이번 batch의 명시적 choices를 얻는다. 취소면 command 없이 None을 반환한다.
           path/id를 포함한 candidate project를 만들거나 Backend에 resolver callback을 넘기지 않는다.
        2. ASSETS_IMPORTED에 copied file inputs, explicit directory와 choices만 전달한다.
        3. Backend command가 buildProjectAssetImportCandidate로 current directory/collision/id/reference와 whole-project candidate를 계산한다.
           choice 대기 뒤의 current state 재검증과 one commit은 sourcescript.backend.project_efsm의 공통 send 규칙을 사용한다.
        4. parse/collision/reference/validation 실패는 미commit result로 끝난다. 성공만 result["changed"]에 기록된 input 순서의 실제 asset path를 공식 query로 다시 읽어 detached asset 목록을 반환한다. empty input은 []이며 command가 없다.

        의미:
           batch import는 command 안에서 전체 candidate를 검증한 후 한 번 commit한다.
           assets를 반환한다.
    """
    return assets


def createProjectCsv(data, name, id, bytesBase64, mime, headerLines, path):
    result = "ProjectMutationResult 딕셔너리."
    assetPath = "CSV의 canonical VFS 경로 문자열."
    csv = "CSV 딕셔너리 또는 미반영 명령 결과."
    """
    Args:
    - data:
      행 배열 또는 키별 값을 가진 행 딕셔너리의 배열.

    - name:
      이름 문자열.

    - id:
      생성 또는 교체할 정수 id 또는 None.

    - bytesBase64:
      바이트 배열의 base64 문자열.

    - mime:
      MIME 문자열.

    - headerLines:
      표 앞에서 헤더로 사용하는 행 수.

    - path:
      대상 VFS 경로 문자열.

    Return:
    - csv:
      CSV 딕셔너리 또는 미반영 명령 결과.
      성공 뒤 공식 query가 제공하는 등록 CSV의 kind/id/path/name 메타데이터. 미commit이면 해당 command failure를 반환한다.

    변경:
    - DATA_OBJECT_CREATED event를 통해 activeProject._state['assets']['csvFiles']와 next csv id를 변경한다.

    처리:
        1. data·name·id·bytesBase64·mime·headerLines·path를 새 입력 딕셔너리에 넣어 dispatchProjectCommand("DATA_OBJECT_CREATED", 입력)를 호출한다.
        2. Backend는 현재 nextId·VFS·동일 id의 대상을 해결하고 표·원본 바이트·헤더·경로를 검증하여 한 번 반영한다.
        3. 명령 결과를 result에 둔다. committed가 False이면 result를 반환한다.
        4. ProjectMutationResult.changed에 기록한 이번 생성 CSV의 canonical path를 assetPath에 둔다.
        5. operation=BACKEND_QUERY_KINDS['project-api']['assets.readDeletionTarget'], path=assetPath로 dispatchProjectQuery("project-api", 요청)를 호출한다.
           결과의 target을 csv에 두고 반환한다. 명령과 후속 조회 오류는 호출자에게 전달한다.
    """
    return csv


def createEmptyProjectCsv():
    csv = "CSV 딕셔너리 또는 미반영 명령 결과."
    """
    Args:
    - 없음.

    Return:
    - csv:
      CSV 딕셔너리 또는 미반영 명령 결과.
      EMPTY_CSV_TEMPLATE에서 생성되어 activeProject에 등록된 CSV의 kind/id/path/name 메타데이터.

    변경:
    - DATA_OBJECT_CREATED event를 통해 activeProject._state['assets']['csvFiles']와 next csv id를 변경한다.
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
           csv를 반환한다.
    """
    return csv


def createProjectImage(bytes, name, mime, id, path):
    result = "ProjectMutationResult 딕셔너리."
    assetPath = "이미지의 canonical VFS 경로 문자열."
    image = "이미지 딕셔너리 또는 미반영 명령 결과."
    """
    Args:
    - bytes:
      이번 입력의 바이트 배열.

    - name:
      이름 문자열.

    - mime:
      MIME 문자열.

    - id:
      생성 또는 교체할 정수 id 또는 None.

    - path:
      대상 VFS 경로 문자열.

    Return:
    - image:
      이미지 딕셔너리 또는 미반영 명령 결과.
      성공 뒤 공식 query가 제공하는 등록 이미지의 kind/id/path/name 메타데이터. 미commit이면 해당 command failure를 반환한다.

    변경:
    - IMAGE_OBJECT_CREATED event를 통해 activeProject._state['assets']['images']와 next image id를 변경한다.

    처리:
        1. bytes·name·mime·id·path를 새 입력 딕셔너리에 넣어 dispatchProjectCommand("IMAGE_OBJECT_CREATED", 입력)를 호출한다.
        2. Backend는 현재 nextId·VFS·동일 id의 대상을 해결하고 원본 바이트·MIME·이름·경로를 검증하여 한 번 반영한다.
        3. 명령 결과를 result에 둔다. committed가 False이면 result를 반환한다.
        4. ProjectMutationResult.changed에 기록한 이번 생성 image의 canonical path를 assetPath에 둔다.
        5. operation=BACKEND_QUERY_KINDS['project-api']['assets.readDeletionTarget'], path=assetPath로 dispatchProjectQuery("project-api", 요청)를 호출한다.
           결과의 target을 image에 두고 반환한다. 이미지 표시 설정은 Slot.content["imageSettings"]에 유지한다.
        6. 명령과 후속 조회 오류는 호출자에게 전달한다.
    """
    return image





def deleteProjectAsset(target):
    event = "Backend 명령 이름 문자열."
    outcome = "None."
    """
    Args:
    - target:
      kind·id·path를 가진 asset 참조 딕셔너리.

    Return:
    - outcome:
      None.

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
           outcome를 반환한다.
    """
    return outcome


def moveProjectNode(plan, useUniqueName):
    outcome = {"path": "canonical 경로 문자열.", "trashed": "휴지통 내부 여부인 논리값."}
    result = "ProjectMutationResult 딕셔너리."
    path = "canonical 경로 문자열."
    trashed = "논리값."
    """
    Args:
    - plan:
      planProjectNodeMove의 source 경로와 target 디렉터리를 담은 딕셔너리 또는 None.
    - useUniqueName:
      이름 충돌 시 사용 가능한 새 이름을 허용하는 논리값.

    Return:
    - outcome:
      반영한 경로와 해당 경로의 휴지통 내부 여부를 담은 분리된 딕셔너리.
      계획 부재 또는 미반영이면 None.

    변경:
    - 프로젝트 VFS의 경로. 휴지통 진입 시 해당 자산의 실제 슬롯·graph object 참조.

    처리:
        1. plan이 None이면 None을 반환한다. plan의 source 경로와 target 디렉터리, useUniqueName을
           PROJECT_NODE_MOVED의 path, directory, useUniqueName으로 dispatchProjectCommand에 전달한다.
        2. Backend는 현재 경로·디렉터리·충돌을 다시 해결한다. 고정 디렉터리 이동과 자기 하위 경로 이동을 거부한다.
           디렉터리는 자손 경로까지 같은 candidate에서 이동한다. 휴지통으로 들어가는 실제 참조는
           collectAssetReferences로 구해 같은 candidate에서 해제한다. 휴지통 밖 이동은 경로를 옮긴다.
        3. Backend가 candidate 전체를 검증하고 한 번 반영한 명령 결과를 result에 둔다.
           실제 해제된 참조 수와 graph index 대응은 같은 명령의 ProjectMutationResult에 포함한다.
        4. result["committed"]가 False이면 None을 반환한다. result["changed"]["assets"]의 role=moved, oldPath=plan의 canonical source 경로인
           한 항목에서 path를 읽는다. 첫 자손 항목을 이동 루트로 취급하지 않는다.
        5. assets.isTrashed 공식 조회에 path를 전달한 논리값을 trashed에 둔다.
        6. path와 trashed로 outcome을 구성하고 분리된 읽기 결과로 반환한다. 조회·명령 오류를 전파한다.
    """
    return outcome


def emptyProjectTrash():
    outcome = "None."
    """
    Args:
    - 없음.

    Return:
    - outcome:
      None.

    변경:
    - trash 아래 directory/CSV/image와 아직 남아 있는 해당 reference.

    처리:
        1. dispatchProjectCommand에 PROJECT_TRASH_EMPTIED와 빈 입력을 전달한다.
           Backend가 현재 trash subtree를 다시 해결하고 collectAssetReferences로 영향을 계산한다.
        2. references와 trash assets/directories를 제거한 candidate project를 만든다.
        3. candidate 전체 invariant를 검증한다.
        4. 성공한 경우에만 한 번 commit한다.
        5. 이 commit으로 실제 제거된 graph-object reference 수와 image slot reset 수를 ProjectMutationResult에 기록한다.
           실제 제거된 reference가 없으면 dashboard content projection effect는 없다.
           outcome를 반환한다.
    """
    return outcome


def createProjectDirectory(parent, name):
    outcome = "canonical 디렉터리 경로 문자열 또는 None."
    result = "ProjectMutationResult 딕셔너리."
    path = "canonical 디렉터리 경로 문자열."
    """
    Args:
    - parent:
      생성 위치인 canonical 디렉터리 경로 문자열.
    - name:
      새 디렉터리 이름 문자열.

    Return:
    - outcome:
      생성된 디렉터리의 실제 경로. 미반영이면 None.

    변경:
    - 프로젝트 디렉터리 컬렉션. 선택 검증 성공 시 Frontend의 asset 선택 참조.

    처리:
        1. parent와 name을 PROJECT_DIRECTORY_CREATED에 전달한다. Backend가 현재 부모와 이름·충돌을
           검사하고 디렉터리 candidate를 검증하여 한 번 반영한 명령 결과를 result에 둔다.
        2. result["committed"]가 False이면 None을 반환한다. result["changed"]["assets"]의 role=created, kind=directory인 한 항목의 path를 사용한다.
        3. dispatchInterfaceEvent에 SELECT_ASSET과 kind=directory, path를 전달한다.
           Backend 참조 검증을 통과하면 그 경로를 선택하고, 거부되면 이전 선택을 유지한다.
        4. path를 outcome에 두고 반환한다. 생성 성공 경로는 뒤의 선택 거부에도 유지한다.
           조회·명령 오류는 호출자에 전파한다.
    """
    return outcome


def connectProjectAssetToSlot(path, kind, slotId):
    event = "Backend 명령 이름 문자열."
    outcome = "None."
    """
    Args:
    - path:
      대상 VFS 경로 문자열.

    - kind:
      BACKEND_QUERY_KINDS에 등록된 조회 종류 문자열.

    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    Return:
    - outcome:
      None.

    변경:
    - CSV이면 target graph slot/chart reference.
    - image이면 target slot image reference.

    처리:
        1. path와 slotId를 current project에서 다시 resolve한다.
           CSV는 SLOT_DATA_CONNECTED, image는 SLOT_IMAGE_LINKED라는 기존 kind-specific command로 수렴한다.
           command reconciliation 후에도 유효한 독립 asset selection은 model-to-fsm 선택에서 유지한다.
           target graph selection은 clear하지만 asset을 다시 선택하거나 제거된 선택을 snapshot에서 복구하지 않는다.
           dispatchProjectCommand(event, {'path': path, 'kind': kind, 'slotId': slotId})의 값을 (result, interfaceState, rendererInput)에 대입한다.
           not result["committed"]인 경우:
           None를 반환한다.
           dispatchSlotSelection(slotId, pendingContentType=None, direction='model-to-fsm')를 호출한다.
           None를 반환한다.
    """
    return outcome





def importProjectFileToSlot(file, slotId, planImport):
    choices = "이번 파일별 충돌 선택값 배열."
    asset = "asset 또는 chart 딕셔너리, 미반영 명령 결과 또는 None."
    """
    Args:
    - file:
      파일 이름·MIME·바이트를 가진 이번 작업의 입력.

    - slotId:
      대상 슬롯의 정수 id 또는 None. 0은 유효한 id다.

    - planImport:
      충돌 정보를 받아 사용자의 rename/replace/취소 선택을 반환하는 함수.

    Return:
    - asset:
      asset 또는 chart 딕셔너리, 미반영 명령 결과 또는 None.

    변경:
    - raw CSV/image asset과 target slot/chart candidate.

    처리:
        1. 공식 조회로 explicit visible slotId를 검증한다. 0은 유효하다. 공식 fileKind가 slot이면
           collision choice 없이 importSelectedGraphFile(slotId, file)의 FFSX 결과를 반환한다.
           unknown이면 명령을 실행하지 않고 오류를 전파한다.
        2. data/image의 directory는 Backend PROJECT_ASSET_DIRECTORIES의 종류별 root다.
           importProjectFilesToDirectory와 같은 방식으로 파일 입력을 분리 복사하고,
           planImport(file,directory,reservedPaths=empty)를 한 번 기다린다. 취소면 None을 반환한다.
        3. dispatchProjectCommand("ASSETS_IMPORTED", {files: [복사한 파일], directory,
           choices: [{path, replaceId}], targetSlotId: slotId})를 한 번 호출한다.
           Backend가 현재 경로·충돌·대상 슬롯을 재검증하고 자산과 슬롯 연결을 한 후보로 반영한다.
           미반영이면 result를 그대로 반환한다. 반영이면 result["changed"]["assets"][0]["path"]로
           assets.readDeletionTarget을 조회하여 그 target을 반환한다.
    """
    return asset


def importProjectFile(file):
    project = "읽기 전용 프로젝트 딕셔너리 또는 미반영 명령 결과."
    """
    Args:
    - file:
      파일 이름·MIME·바이트를 가진 이번 작업의 입력.

    Return:
    - project:
      읽기 전용 프로젝트 딕셔너리 또는 미반영 명령 결과.
      import 성공 뒤 공식 export query로 읽은 immutable project snapshot. Backend mutable authority를 반환하지 않는다.
        실패/취소는 기존 command/lifecycle 실패/취소로 전달하며 성공 snapshot을 반환하지 않는다.

    변경:
    - 최종 단계에서 PROJECT_LOADED event를 통해 activeProject 전체를 교체한다.

    처리:
        1. current FFPX package만 project import 입력으로 인정한다.
           Application은 file 입력만 PROJECT_LOADED에 전달한다. Backend command가 ffpxReadProject 결과를
           buildProjectObject로 정규화/완전 검증한 뒤 authoritative project를 한 번 교체한다.
           legacy conversion은 외부 converter가 처리한다.
           dispatchProjectCommand('PROJECT_LOADED', {'file': file})의 값을 (result, interfaceState, rendererProjection)에 대입한다.
           result["committed"]가 False이면 result를 반환한다.
           dispatchProjectQuery('export', {})를 반환한다.
    """
    return project


def importProjectAssetFiles(files, planImport):
    items = "asset·chart 딕셔너리 배열, 미반영 명령 결과 또는 None."
    """
    Args:
    - files:
      작업 순서의 파일 입력 배열.

    - planImport:
      충돌 정보를 받아 사용자의 rename/replace/취소 선택을 반환하는 함수.

    Return:
    - items:
      asset·chart 딕셔너리 배열, 미반영 명령 결과 또는 None.
      순서대로 완료한 detached item 목록, 취소 None, 미commit result 또는 원래 failure

    변경:
    - 파일별 명령이 채택한 프로젝트 asset·slot·chart와 그 명령의 Frontend reconciliation.

    처리:
        assets.importFiles의 ordered router. 한 public 호출의 importing lifecycle 안에서 실행한다.
        1. input을 순서 있는 file 목록으로 만든다. empty input은 []이며 query/command/choice가 없다.
        2. 시작 시 interfaceFSM.selectedSlotId scalar만 target으로 잡는다. 이후 modal/await 동안 다른 선택으로 갈아타지 않는다.
        3. 각 file을 공식 fileKind query로 분류한다. data/image/slot만 지원하며 unknown은 throw, 뒤 input은 처리하지 않는다.
           slot package는 target이 있어야 importSelectedGraphFile로 보낸다. .json은 fileKind에 따라 data이며 Plotly 추측 분기를 만들지 않는다.
           Plotly JSON은 explicit graphs.importFile 경로를 사용한다. package 자체는 SLOT_CHART_IMPORTED 한 commit이다.
           data/image와 target이 있으면 importProjectFileToSlot, 없으면 immutable PROJECT_ASSET_DIRECTORIES에서
           data는 csv key, image는 image key의 canonical path를 골라 importProjectFilesToDirectory([file], directory, planImport)를 사용한다.
           이 상수는 기본 schema 값이다. directory의 실제 존재/권한은 command가 다시 검증한다.
           단수 image alias/누락 root 자동 생성을 하지 않는다. FFPX는 project.importFile 전용이며 여기서 추측하지 않는다.
        4. 파일마다 command가 current visible target/VFS/choice를 다시 검증한다. 성공 결과의 detached asset/chart를 input 순서로 모은다.
           directory helper의 single-item 목록은 router 결과에 한 item으로 펼친다. 전체 성공은 그 목록을 반환한다.
        5. choice 취소는 None, 미commit은 그 result를 반환하고 즉시 멈춘다. throw/rejection은 전파한다.
           이미 끝난 이전 file의 commit은 유지한다. router 전체를 atomic batch로 주장하거나 숨은 rollback하지 않는다.
           명시적 importToDirectory의 여러 file batch만 그 helper의 one-candidate atomic 계약을 유지한다.
        6. file 누락/중복 처리나 무시되는 두 번째 file을 만들지 않는다. 각 file별 한 helper 호출이며 성공 item도 한 번만 추가한다.
           items를 반환한다.
    """
    return items


def downloadProjectAsset(path):
    accepted = "논리값."
    """
    Args:
    - path:
      대상 VFS 경로 문자열.

    Return:
    - accepted:
      논리값.

    변경:
    - 브라우저에 파일 다운로드를 전달한다.

    처리:
        1. assets.download: 원본 bytes handoff 성공 True, absent/wrong-kind/no bytes False; 오류 전파.
           path 생략은 public binding이 현재 Frontend assetPath scalar를 전달한다. 새 Project query는 이 작업에만 소비한다.
           브라우저 다운로드 handoff 완료를 뜻한다. selection/Project/asset bytes를 변경하지 않는다.
           dispatchProjectQuery('export', {'operation': BACKEND_QUERY_KINDS['project-api']['assets.download'], 'path': path})의 값을 payload에 대입한다.
           payload is None인 경우:
           False를 반환한다.
           downloadExportPayload(payload)를 호출한다.
           True를 반환한다.
    """
    return accepted


def downloadProject():
    outcome = "None."
    """
    Args:
    - 없음.

    Return:
    - outcome:
      None.

    변경:
    - 브라우저에 FFPX 다운로드를 전달한다.

    처리:
        1. project.exportFile: selected slot이 있으면 경고 후 None, query/download 없음.
           선택 없음은 current validated FFPX payload를 한 번 handoff하고 None 반환한다.
           error는 원래 failure로 전파한다. 이 API는 handoff 후 None을 반환한다.
           interfaceFSM.readState()['selectedSlotId'] is not None인 경우:
           None를 반환한다.
           dispatchProjectQuery('export', {'operation': BACKEND_QUERY_KINDS['project-api']['project.exportFile'], 'stamp': '이번 호출의 UTC ISO timestamp'})의 값을 payload에 대입한다.
           downloadExportPayload(payload)를 반환한다.
    """
    return outcome
