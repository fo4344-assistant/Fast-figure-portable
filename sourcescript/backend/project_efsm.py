"""
Fast Figure Source Script — FFPX ProjectObject EFSM

EFSM은 authoritative ProjectObject의 상태 전이를 담당한다.
"""

from sourcescript.backend.project_state import activeProject, projectObjects, Slot, resolveVisibleSlot, normalizeSlotContent, normalizeProjectSettings, validateProjectObjectState
from sourcescript.backend import assets_files, graphs, layout_annotations



ProjectMutationResult = {'event': '프로젝트 명령 이름 문자열.',
 'committed': '프로젝트 반영 성공 여부인 논리값.',
 'changed': {
     'slotIds': '반영 전후 값이 달라진 슬롯 id 배열.',
     'chartIds': '반영 전후 값이 달라진 그래프 id 배열.',
     'csvIds': '반영 전후 값이 달라진 CSV id 배열.',
     'imageIds': '반영 전후 값이 달라진 이미지 id 배열.',
     'assets': '반영한 자산의 종류·id·canonical 경로·소유 관계와 처리 종류를 담은 배열.',
     'assetReferenceChanges': '참조 수가 달라진 자산의 kind와 id를 담은 배열. 같은 자산은 한 번 기록한다.',
 },
 'removedGraphReferenceCount': '실제 제거한 graph-object CSV reference 수',
 'resetImageSlotCount': '실제 image reference를 비운 slot 수',
 'selectionHints': '참조 식별자·경로·chartId·선택 index와 이전/이후 index 대응표를 담은 딕셔너리.',
 'projectionEffect': '참조 제거와 표시 입력 변경 여부를 담은 딕셔너리.'}





def buildSlotCommandCandidate(event, payload, state):
    candidateState = "프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state"
    slot = "Slot 인스턴스."
    other = "Slot 인스턴스."
    defaults = "Slot 인스턴스."
    imported = "chart 또는 Slot 패키지 딕셔너리."
    """
    Args:
    - event:
      이 함수에 연결된 프로젝트 명령 등록의 키.
        원천: /backend/project_efsm/PROJECT_COMMANDS

    - payload:
      대상 Slot·CSV·image id와 새 종류·설정·파일을 가진 명령 입력 딕셔너리.

    - state:
      이번 명령의 분리된 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state

    Return:
    - candidateState:
      후보 상태 딕셔너리 또는 거부의 None.

    변경:
    - 이번 명령의 state에 Slot·소유 chart·새 asset 변경을 적용한다.

    처리:
        1. candidateState에 state를 둔다. 명시한 slotId는
           resolveVisibleSlot(payload["slotId"],candidateState)의 결과를 slot에 둔다.
           대상 id 배열은 각 id를 같은 상태에서 조회하며 그때의 원소를 slot에 둔다.
           strict integer id와 visible 조건을 확인한다. 0은 유효하다.
           대상 부재·종류·소유 관계 불일치는 None을 반환한다.
        2. SLOT_TYPE_CHANGED이면 contentType 입력이 image일 때 image, 그 외에는 graph로 둔다.
           다른 content 필드와 caption을 유지한다.
        3. SLOTS_RESET이면 대상마다 Slot(id,row,col)을 defaults로 생성한다.
           소유 chart를 제거하고 content·caption을 defaults에서 분리 복사한다.
           id·row·col·rowSpan·colSpan·hidden은 기존 값으로 유지한다.
        4. SLOTS_SWAPPED이면 두 id를 같은 candidateState에서 resolveVisibleSlot로 조회하여
           서로 다른 두 visible Slot을 slot·other에 둔다.
           content·caption을 교환하고 각각의 id·배치·span·hidden을 유지한다.
        5. SLOT_IMAGE_LINKED이면 같은 상태의 image id를 확인하고 Slot.content["imageId"]에 연결한다.
           SLOT_IMAGE_SETTINGS_CHANGED이면 현재 image Slot의 imageSettings에 새 필드를 합치고
           backend.defaults.limits.imageSettings와 fit 원형으로 검증한다.
        6. SLOT_DATA_CONNECTED이면 같은 상태의 CSV와 graph Slot을 확인한다.
           graphs.addObject가 빈 Slot을 대상으로 보낸 명령은 현재 chart가 있으면 거부한다.
           그 외 기존 chart는 editable 조건을 확인한다. Slot·CSV rows·name·CSV와 candidateState를
           graphs.connectDataToSlotModel에 전달하고 반환 후보를 candidateState로 둔다.
        7. SLOT_IMAGE_IMPORTED이면 현재 visible image Slot을 확인하고 payload의 name·MIME·bytes로
           assets_files.buildAssetCommandCandidate의 IMAGE_OBJECT_CREATED 계산을 수행한다.
           후보의 새 image id를 Slot.content["imageId"]에 연결하고 소유 chart를 제거한다.
           Slot.content["chart"]를 None으로 둔다. 기존 image·CSV asset, 배치·caption·imageSettings를 보존한다.
           images.insertEmpty의 1600×900 SVG는 public 호출이 전달한 bytes를 사용한다.
        8. SLOT_CHART_IMPORTED이면 같은 파일 입력을 해석한다. FFSX는 assets_files.ffsxReadSlot 결과를 imported에 두고
           assets_files.applyFfsxSlot(imported, slot, candidateState)의 반환값을 candidateState에 둔다.
           Plotly JSON은 파일 bytes를 JSON figure로 읽고 candidateState["nextId"]["chart"]와 함께
           graphs.parsePlotlyToEditor에 전달하여 imported에 둔다. nextId.chart를 증가시키고
           기존 소유 chart를 제거한다. imported를 candidateState["charts"]에 넣고
           slot.content["chart"]에 imported["id"]를 연결한다.
           Slot의 id·row·col·span·hidden을 유지한다. FFSX는 패키지의 slot-local caption도 적용한다.
        9. 파일 해석 오류는 호출자에게 전달한다. candidateState를 반환한다.
    """
    return candidateState


def buildProjectMutationResult(event, payload, beforeState, afterState, retainedOriginalIndicesByChart):
    result = "ProjectMutationResult 딕셔너리."
    graphObjectIndexMaps = "chartId와 indices를 가진 딕셔너리의 배열."
    selectionHints = "id·경로·chartId·선택 index·순번 대응표의 딕셔너리."
    indices = "이전 object 순번에 대응하는 새 순번 또는 None의 배열."
    n = "이전 chart의 object 개수인 0 이상의 정수."
    j = "새 object 배열의 0 기반 정수 순번."
    k = "이전 object 배열의 0 기반 정수 순번."
    fromIndex = "반영된 이동의 이전 순번."
    toIndex = "반영된 이동의 최종 순번."
    """
    Args:
    - event:
      반영한 PROJECT_COMMANDS 명령 이름.

    - payload:
      이번 명령의 대상 id·경로와 새 입력 딕셔너리.

    - beforeState:
      반영 직전 프로젝트 상태. 원형: /backend/project_state/ProjectObject._state

    - afterState:
      반영 직후 프로젝트 상태. 원형: /backend/project_state/ProjectObject._state

    - retainedOriginalIndicesByChart:
      참조 해제 계산이 남긴 chart id별 원래 object 순번 배열 딕셔너리.

    Return:
    - result:
      이번 반영의 읽기 전용 ProjectMutationResult.

    변경:
    - 없음.

    처리:
        1. result의 event에 event, committed에 True를 둔다.
           기존 반영 전후 비교 결과에서 값이 달라진 슬롯·그래프·CSV·이미지의 식별자를 changed의
           slotIds·chartIds·csvIds·imageIds에 각각 둔다. 생성·제거된 식별자도 포함한다.
           두 상태의 asset id·canonical 경로와 소유 관계에서 실제 생성·교체·이동·제거 항목을 changed의 assets에 둔다.
           생성·가져오기 asset은 입력 순서를 유지한다. DATA_OBJECT_REPLACED는 실제 CSV 경로,
           directory 생성·이동은 최종 canonical 경로를 기록한다.
        2. 두 상태의 collectAssetReferences 결과를 비교하여 실제 제거 graph-object CSV 참조 수와
           image 참조를 비운 Slot 수를 각각 removedGraphReferenceCount와 resetImageSlotCount에 둔다.
           같은 CSV의 여러 object 참조는 각각 센다. 같은 반영 전후 참조 결과에서 kind와 id별 참조 수를 비교하여
           수가 달라진 자산을 changed의 assetReferenceChanges에 두고, 자산별 식별자는 한 번씩 넣는다.
           제거된 참조와 변경된 표시 입력으로 projectionEffect를 구성한다.
        3. afterState의 실제 id·경로·chart 소유 관계에서 selectionHints를 구성하고
           result["selectionHints"]에 둔다.
           직접 graph add는 마지막 순번, setObjectValues는 같은 index를
           selectedIndexHint로 둔다. delete는 명시적 None을 둔다. 해당 owning chartId를 함께 기록한다.
           graphs.moveObject는 selectedIndexHint를 생략한다.
           palette는 index hint를 생략한다. CSV 선택은 이 hint와 별도로 유지한다.
        4. graphObjectIndexMaps를 빈 배열로 둔다. retainedOriginalIndicesByChart의 chart마다
           beforeState의 object 개수를 n에 두고 indices를 n개의 None으로 만든다.
           유지한 원래 순번 배열의 j번째 원소 k에 indices[k]=j를 대입한다.
           실제 제거가 있고 afterState에도 남아 있는 chart만 chartId·indices 쌍으로 한 번 넣는다.
           [A,B,C]에서 첫 원소 제거는 [None,0,1], 가운데 제거는 [0,None,1]이다.
           같은 값의 object도 원래 순번으로 구별한다.
        5. event가 GRAPH_OBJECTS_REPLACED이고 payload["operation"]이 graphs.moveObject이면
           반영된 payload["chartId"]로 beforeState와 afterState의 같은 소유 chart를 찾는다.
           beforeState의 object 개수를 n, 검증된 payload["from"]과 payload["to"]를 fromIndex와 toIndex에 둔다.
           indices를 n개 원소의 배열로 구성한다. 이전 순번 k 각각에 다음 새 순번을 넣는다.
           - k=fromIndex이면 toIndex.
           - fromIndex<toIndex이고 fromIndex<k<=toIndex이면 k-1.
           - toIndex<fromIndex이고 toIndex<=k<fromIndex이면 k+1.
           - 그 외에는 k.
           그 chartId와 indices를 graphObjectIndexMaps에 한 번 넣는다.
           이동한 object와 밀려난 object의 대응을 같은 배열로 제공한다.
           object의 값이 같아도 이전 순번으로 각각 구별한다.
        6. 대응표가 있으면 selectionHints["graphObjectIndexMaps"]에 넣는다.
           chart 삭제는 afterState의 owner 조회 부재로 선택 해제한다.
           단순 경로 이동과 image-only 참조 해제는 graph 대응표를 생략한다.
        7. result를 중첩 필드까지 읽기 전용으로 만들어 반환한다.
    """
    return result


PROJECT_COMMANDS = {
    'PROJECT_LOADED': assets_files.buildAssetCommandCandidate,
    'PROJECT_NAME_CHANGED': assets_files.buildAssetCommandCandidate,
    'PROJECT_DIRECTORY_CREATED': assets_files.buildAssetCommandCandidate,
    'PROJECT_NODE_MOVED': assets_files.buildAssetCommandCandidate,
    'PROJECT_TRASH_EMPTIED': assets_files.buildAssetCommandCandidate,
    'ASSETS_IMPORTED': assets_files.buildAssetCommandCandidate,
    'DATA_OBJECT_CREATED': assets_files.buildAssetCommandCandidate,
    'DATA_OBJECT_REPLACED': assets_files.buildAssetCommandCandidate,
    'DATA_OBJECT_DELETED': assets_files.buildAssetCommandCandidate,
    'IMAGE_OBJECT_CREATED': assets_files.buildAssetCommandCandidate,
    'IMAGE_OBJECT_REPLACED': assets_files.buildAssetCommandCandidate,
    'IMAGE_OBJECT_DELETED': assets_files.buildAssetCommandCandidate,
    'SLOT_TYPE_CHANGED': buildSlotCommandCandidate,
    'SLOTS_RESET': buildSlotCommandCandidate,
    'SLOTS_SWAPPED': buildSlotCommandCandidate,
    'SLOT_IMAGE_LINKED': buildSlotCommandCandidate,
    'SLOT_IMAGE_SETTINGS_CHANGED': buildSlotCommandCandidate,
    'SLOT_DATA_CONNECTED': buildSlotCommandCandidate,
    'SLOT_IMAGE_IMPORTED': buildSlotCommandCandidate,
    'SLOT_CHART_IMPORTED': buildSlotCommandCandidate,
    'GRAPH_OBJECTS_REPLACED': graphs.buildGraphCommandCandidate,
    'CHART_LAYOUT_CHANGED': graphs.buildGraphCommandCandidate,
    'CHART_MODEL_REPLACED': graphs.buildGraphCommandCandidate,
    'GRID_LAYOUT_CHANGED': layout_annotations.buildLayoutCommandCandidate,
    'LAYOUT_STYLE_CHANGED': layout_annotations.buildLayoutCommandCandidate,
    'SLOTS_MERGED': layout_annotations.buildLayoutCommandCandidate,
    'SLOTS_SPLIT': layout_annotations.buildLayoutCommandCandidate,
    'CAPTION_TEXT_INPUT': layout_annotations.buildLayoutCommandCandidate,
    'SLOT_CAPTIONS_INSERTED': layout_annotations.buildLayoutCommandCandidate,
    'CAPTION_SETTINGS_CHANGED': layout_annotations.buildLayoutCommandCandidate,
    'LABEL_SETTINGS_CHANGED': layout_annotations.buildLayoutCommandCandidate,
    'LABEL_POSITION_CHANGED': layout_annotations.buildLayoutCommandCandidate,
    'APPEARANCE_CHANGED': layout_annotations.buildLayoutCommandCandidate,
    'EXPORT_SETTINGS_CHANGED': layout_annotations.buildLayoutCommandCandidate,
}


class ProjectStateMachine:
    def send(self, event, payload):
        source = "ProjectObject 인스턴스."
        sourceState = "프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state"
        candidateState = "프로젝트 상태 딕셔너리 또는 None."
        retainedOriginalIndicesByChart = "chart id별 원래 object 순번 배열 딕셔너리."
        result = "ProjectMutationResult 딕셔너리."
        handler = "후보 상태를 계산하는 함수 참조."
        """
        Args:
        - event:
          PROJECT_COMMANDS에 등록된 명령 이름 문자열.

        - payload:
          명령 대상 id·경로와 새 사용자 입력·파일·최종 import 선택을 가진 딕셔너리.

        Return:
        - result:
          ProjectMutationResult 원형의 읽기 전용 딕셔너리.

        변경:
        - 성공한 명령의 후보 상태를 activeProject.initialize로 한 번 반영한다.

        처리:
            1. event 등록 여부를 확인한다. 현재 activeProject를 source에, source._state를
               sourceState에 둔다. payload의 id·경로를 그 상태에서 조회하여 현재 대상을 확인한다.
               명령 거부·취소·변경 없음은 event·committed=False와 빈 변경 사실의 result를 반환한다.
               성공 selection hint는 생략한다. 입력과 파일 해석 오류는 호출자에게 전달한다.
            2. sourceState의 딕셔너리·배열·Slot·중첩 content를 분리 복사하여 candidateState에 둔다.
               retainedOriginalIndicesByChart를 빈 딕셔너리로 둔다.
            3. PROJECT_COMMANDS에서 event 키에 연결된 함수를 handler에 둔다.
               handler(event,payload,candidateState)를 한 번 호출한다.
               handler가 assets_files.buildAssetCommandCandidate이면 반환 쌍의 상태와
               순번 대응 자료를 candidateState와 retainedOriginalIndicesByChart에 각각 둔다.
               그 외 담당 함수의 반환 상태를 candidateState에 둔다.
            4. 파일 대기 뒤 현재 activeProject와 그 _state가 source·sourceState와 달라졌으면
               1번으로 돌아간다. 같을 때 후보가 None이면 1번의 미반영 결과를 반환한다.
               directory·target·참조·충돌·next-id와 최종 choice의 replace id/path를 sourceState에서 재검사한다.
               normalizeSlotContent와 normalizeProjectSettings로 후보를 정규화하고
               validateProjectObjectState(candidateState, True)로 전체 불변조건을 검증한다.
            5. 현재 activeProject와 그 _state를 source·sourceState와 각각 비교한다.
               달라졌으면 1번으로 돌아가 같은 새 입력·choice로 계산한다.
               최종 choice가 다른 대상에 대응하면 미반영 결과를 반환한다.
               같으면 activeProject.initialize(candidateState)를 한 번 호출한다.
            6. sourceState·반영 직후 activeProject._state·retainedOriginalIndicesByChart를
               event·payload와 함께 buildProjectMutationResult에 전달하여 result에 둔다.
               move의 payload는 graphs.buildGraphCommandCandidate가 현재 sourceState의 소유 chart에서
               검증한 같은 chartId·from·to다. 이동 계산부터 결과 구성까지 동기적으로 처리하며
               중간에 사용자 callback이나 다른 명령을 실행하지 않는다.
               후보 거부·동일 위치 이동·검증 실패에서는 성공 대응표를 만들지 않는다.
               계산 도중 거부·취소된 후보는 버리고, 재시도에서는 순번 배열도 새로 계산한다.
            7. result를 반환한다. Application은 반환 결과와 현재 Frontend 참조로
               buildFrontendReconciliationInput을 호출한다.
        """
        return result


projectEFSM = 'ProjectStateMachine 인스턴스.'
