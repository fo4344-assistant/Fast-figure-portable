"""
Fast Figure Source Script — Frontend / mantine-ui

하위 구현 검증 자료: ../../fast-figure.js, ../../fast-figure-ui.js, ../../Fast-figure.html.
Python 문법으로 작성한 구현 명세다.
"""

from math import isnan
from sourcescript.application.public_api import FastFigureApi
from sourcescript.application.adapter import appFSM, dispatchInterfaceEvent, transformWorkspace, runLifecycleTask as runApplicationLifecycleTask
from sourcescript.frontend.renderer import renderDashboardFrame




UI_LOCAL_STATE = {'asset collision': 'Modal이 열려 있는 동안의 collision model과 Promise resolver',
 'confirmations': 'slot reset, asset delete, move/trash confirmation target',
 'new folder': 'Modal input 중인 folder name draft',
 'palette': '사용자가 apply하기 전 ColorInput draft',
 'layout selection': 'layout Modal 안에서 merge/split 대상으로 선택한 slot id set',
 'print inputs': 'width/height/dpi/format form draft',
 'caption editor target': 'global 또는 선택 slot인 자막 편집 대상.',
 'sidebar geometry': '현재 session의 navbar width/collapsed/drag state',
 'pointer drag': 'label/overlay resize 같은 pointer interaction의 component-local state',
 'settings overlay height': 'opened settings overlay lifetime 동안만 유지되는 component-local height projection',
 'folding': '같은 화면이 mount된 동안 유지하는 접기 그룹별 열림 상태',
 'command controls': '각 UiCommand 인스턴스가 소유하는 편집 문자열·대상 식별 정보·실행 상태'}





























def readProjectAssetDisplay():
    display = "nodes·slotRows 딕셔너리."
    """
    Args:
    - 없음.

    Return:
    - display:
      nodes·slotRows 딕셔너리.
      - {nodes, slotRows}: 이번 표시에서 사용할 canonical asset node sequence와 visible slot sequence.
        directory node는 kind/path/name/children, asset node는 kind/path/id/name/asset을 갖는다.
        slot row는 id/row/col/rowSpan/colSpan/contentType/chart/imageId/assetDisplay를 갖는다.
        assetDisplay는 Backend가 해결한 {kind: empty/assets/embedded, assets: [{kind,id,name,path}]}다.

    변경:
    - 없음.

    처리:
        1. FastFigureApi.assets.readTree()를 호출하여 canonical node sequence를 nodes로 받는다.
           nodes의 path와 children은 Backend가 구성한 directory·CSV·image 관계다.
        2. 이어서 FastFigureApi.layout["readState"]()를 호출하여 layout을 받는다.
           layout["visibleSlots"]는 같은 현재 project에서 계산된 visible slot 순서이며,
           각 slot의 assetDisplay에 slot 소유 chart·image와 연결 CSV를 해결한 표시 정보가 들어 있다.
        3. nodes와 layout["visibleSlots"]를 각각 반환 record의 nodes와 slotRows에 넣는다.
           FastFigureProjectDataTree는 nodes로 자산 행을, slotRows로 슬롯별 연결 자산 행을 표시한다.
           sequence 순서와 assetDisplay.kind가 empty 또는 embedded인 행도 유지한다.
           두 조회 사이에는 다른 이벤트 처리를 삽입하지 않는다. 조회 오류는 호출자에 전파한다.
           반환 record는 이번 표시 작업에서 소비한다.
    """
    return display


def readAssetRowDisplay(node):
    display = {"referenceCount": 0 if target is None else target["referenceCount"]}
    """
    Args:
    - node:
      canonical VFS의 CSV 또는 image 노드 딕셔너리.
      node는 이번 canonical tree의 CSV 또는 image node다.

    Return:
    - display:
      referenceCount·rowCount 표시 딕셔너리.
      referenceCount와 CSV인 경우 rowCount를 갖는 표시 record.

    변경:
    - 없음.

    처리:
        1. node["path"]로 assets.readDeletionTarget을 조회한다. 결과가 None이면 referenceCount는 0, 있으면 그 referenceCount를 사용한다.
        2. node["kind"]가 csv이면 node["asset"]["rows"]의 길이를 읽는다. headerLines를 숫자로 해석하며 누락·숫자 변환 실패·NaN은 0으로 사용한다. rowCount는 max(0, 행 길이 - headerLines)다. image의 rowCount는 None이다.
        3. referenceCount와 rowCount로 display를 구성하여 반환한다.
    """
    return display


class UiCommand:
    def __init__(self, readTarget, readValue, prepare, invoke, stepSize=None):
        self.readTarget = "현재 대상 식별값의 튜플 또는 사용 불가의 None을 반환하는 함수."
        self.readValue = "대상의 현재 공식 필드 값을 읽는 함수 또는 None."
        self.prepare = "편집 문자열의 수용 여부와 API 입력값을 반환하는 함수 또는 None."
        self.invoke = "명시한 대상과 새 입력을 기존 공개 API에 전달하는 함수."
        self.stepSize = "해당 숫자 필드의 기존 증감 단위 또는 None."
        self.text = "이 입력의 편집 중 문자열."
        self.editTarget = "편집을 시작한 대상의 식별 정보 또는 None."
        self.editing = "미확정 문자열의 존재 여부."
        self.composing = "IME 조합 중 여부."
        self.running = "이 객체가 시작한 API 호출의 완료 대기 여부."
        self.active = "이 UI 객체의 연결 수명 유지 여부."
        """
        Args:
        - readTarget, readValue, prepare, invoke:
          FastFigureApp이 해당 조작에 연결하는 함수.
          readTarget은 현재 선택 참조·팝업 대상·사용 가능 여부를 공식 조회로 확인한다.
          대상이 유효하면 해당 식별값 튜플을, 사용할 수 없으면 None을 반환한다.
          readValue는 같은 대상의 현재 공식 값만 반환한다.
          prepare는 문자열과 현재 값에서 (수용 여부, 입력값)을 반환한다.
          invoke는 (대상, 입력값)을 해당 공개 API의 기존 인자로 변환한다.
        - stepSize:
          해당 입력 위젯의 기존 step. 버튼 연결은 None이다.

        Return:
        - 없음.

        변경:
        - 이 인스턴스의 함수 연결과 UI-local 편집·실행 상태.

        처리:
            1. 전달된 네 함수 참조와 stepSize를 같은 이름의 필드에 둔다.
            2. text는 빈 문자열, editTarget은 None, editing·composing·running은 False,
               active는 True로 초기화한다.
            3. 같은 조작의 React 재렌더에서는 이 인스턴스를 유지한다.
               연결 함수는 그 호출 시점의 선택·공식 조회를 사용한다.
        """

    def input(self, text, composing=False):
        target = "현재 조작 대상의 식별 정보."
        """
        Args:
        - text:
          입력 위젯이 전달한 원문 문자열.
        - composing:
          IME 조합 중 여부.

        Return:
        - text:
          입력란에 표시할 편집 문자열.

        변경:
        - self.text, editTarget, editing, composing.

        처리:
            1. active가 False이거나 running이면 self.text를 반환한다.
            2. readTarget()의 결과를 target에 둔다. None이면 cancel()하고 self.text를 반환한다.
               기존 editTarget과 다르면 이전 편집을 취소한다.
            3. 새 편집이면 현재 대상 식별 정보만 editTarget에 두고 editing을 True로 둔다.
            4. 원문을 self.text에, 조합 여부를 self.composing에 둔다.
               선택 범위·커서·선행 0·음수 기호·소수점·빈 문자열을 입력 중 유지한다.
               이번 조작의 반환값은 self.text다. 공식 값 변경과 API 호출은 확정에서 수행한다.
        """
        return self.text

    def commit(self):
        current = "같은 대상의 현재 공식 값."
        accepted = "문자열을 확정할 수 있는지 여부."
        value = "이번 공개 API에 전달할 입력값."
        outcome = "기존 API 결과 또는 전송 생략의 None."
        """
        Args:
        - 없음.

        Return:
        - outcome:
          기존 API의 성공·취소·미반영 결과. 원래 예외는 호출자에 전파한다.

        변경:
        - 이 입력의 UI-local 편집 상태. 수락된 API의 기존 변경 대상.

        처리:
            1. active가 False이거나 editing이 False이거나 running 또는 composing이면
               API를 호출하지 않고 None을 반환한다.
            2. 현재 lifecycle이 ready인지, readTarget의 대상이 유효하고 editTarget과 같은지 확인한다.
               다르거나 사용할 수 없으면 cancel()을 수행하고 None을 반환한다.
            3. readValue(editTarget)를 current에 둔다. prepare(self.text, current)의 두 결과를
               accepted와 value에 둔다. accepted가 False이면 cancel()하고 무효 입력을 안내한 뒤 None을 반환한다.
            4. editing과 composing을 False로 바꾼 뒤 send(value, editTarget)의 결과를 outcome에 둔다.
               Enter 다음 blur는 이미 종료한 편집을 다시 전송하지 않는다.
            5. API가 끝난 뒤 같은 연결·대상이 유지되면 현재 공식 값을 다시 읽어 표시한다.
               범위 보정이 적용되었으면 요청값과 적용값을 안내한다.
               성공·취소·미반영은 API의 기존 반환값으로, 오류는 원래 예외로 전달한다.
        """
        return outcome

    def send(self, value=None, target=None):
        currentTarget = "이벤트 시점의 조작 대상 식별 정보."
        outcome = "기존 공개 API의 반환값."
        """
        Args:
        - value:
          확정한 필드 값 또는 버튼의 기존 작업 인자.
        - target:
          편집을 시작한 대상 식별 정보. 버튼 클릭은 None이다.

        Return:
        - outcome:
          연결한 API의 원래 결과 또는 조건 불충족의 None.

        변경:
        - self.running과 연결된 API가 소유하는 변경 대상.

        처리:
            1. active가 False이거나 running이면 None을 반환한다.
               appFSM.readState()의 lifecycle이 ready가 아니면 None을 반환한다.
            2. readTarget()의 결과를 currentTarget에 둔다. 해당 버튼의 기존 활성 조건과 대상 유효성을 확인한다.
               target이 주어졌으면 currentTarget과 같은지 확인한다. 거부이면 None을 반환한다.
            3. 숫자 필드이면 readValue(currentTarget)와 확정값이 같은 경우 None을 반환한다.
               파일 저장·추가·삭제 등의 작업 버튼은 기존 작업 조건을 사용한다.
            4. running을 True로 둔 뒤 invoke(currentTarget, value)를 정확히 한 번 호출한다.
               현재 대상 조회와 동기 API 진입 사이에 대기나 사용자 callback을 삽입하지 않는다.
               파일 선택 완료가 필요한 동작은 그 이벤트에서 대상을 확정하고 기존 파일 API에 전달한다.
               파일 선택·다운로드의 브라우저 사용자 동작 조건을 유지한다.
            5. 동기 반환 또는 비동기 완료를 outcome에 둔다. 성공·거부·취소·예외의 모든 종료에서
               running을 False로 정리한다. Application의 importing/exporting lifecycle은 기존 API가 소유한다.
            6. 숫자 입력의 연결이 유지되고 같은 대상이면 readValue로 공식 값을 새로 읽어 표시한다.
               버튼의 후속 표시는 기존 API의 표시·알림 경로를 사용한다.
               대상이 바뀌거나 unmount되었으면 이전 작업의 결과로 새 입력을 덮어쓰지 않는다.
               기존 API의 반환값과 원래 오류를 그대로 전달한다.
        """
        return outcome

    def cancel(self):
        current = "현재 대상의 공식 표시 값 또는 대상 부재의 빈 표시."
        """
        Args:
        - 없음.

        Return:
        - current:
          취소 뒤 입력에 표시할 현재 공식 값.

        변경:
        - 이 객체의 text·editTarget·editing·composing.

        처리:
            1. editing과 composing을 False로, editTarget을 None으로, text를 빈 문자열로 둔다.
            2. 연결이 유지되면 현재 대상을 새로 읽고 사용 가능한 대상의 공식 값을 표시한다.
               대상이 없으면 빈 표시를 사용한다. 그 표시 문자열을 text에 둔다.
            3. 이미 시작한 API 작업과 running은 그 작업의 종료까지 유지한다.
               그 작업이 변경한 프로젝트는 기존 결과를 유지한다.
        """
        return current

    def step(self, direction):
        current = "증감의 기준 숫자."
        value = "기존 step을 한 번 적용한 완성 값."
        outcome = "한 번의 확정 결과 또는 None."
        """
        Args:
        - direction:
          증가 또는 감소 방향.

        Return:
        - outcome:
          한 번의 확정 결과 또는 무효 입력의 None.

        변경:
        - 이 입력의 편집 상태와 수락된 기존 API의 변경 대상.

        처리:
            1. active가 False이거나 running 또는 composing이거나 stepSize가 None이면 None을 반환한다.
               대상을 새로 읽고 사용할 수 없으면 cancel() 뒤 None을 반환한다.
               기존 편집 대상과 다르면 먼저 cancel()한다. 현재 공식 값을 읽는다.
            2. 편집 중인 완성 숫자가 있으면 그것을, 그 외에는 현재 공식 유한 숫자를 current에 둔다.
               둘 다 숫자가 없으면 current를 0으로 둔다.
            3. 증가이면 current + self.stepSize, 감소이면 current - self.stepSize를 value에 둔다.
               value의 완성 문자열을 만든다.
               input과 commit을 순서대로 호출하고 commit의 반환값을 outcome에 둔다.
               위젯의 같은 이벤트가 별도 onChange 전송을 만들지 않게 한다.
               키 반복의 각 실제 증감은 각각 한 조작으로 처리한다.
        """
        return outcome

    def dispose(self):
        """
        Args:
        - 없음.

        Return:
        - 없음.

        변경:
        - 이 객체의 연결 수명과 편집·이벤트 연결.

        처리:
            1. cancel()로 미확정 편집을 정리하고 active를 False로 둔다.
            2. 이 UI가 등록한 이벤트·구독 연결을 해제한다.
               진행 중 API의 종료 정리는 send의 해당 작업이 수행한다.
        """


def prepareNumericInput(text, current, allowEmpty=False, emptyValue=None):
    accepted = "완성한 숫자 또는 허용한 빈 값을 수락하는지 여부."
    value = "API에 전달할 수치·빈 값 또는 복원할 현재 값."
    """
    Args:
    - text:
      확정할 원문 문자열.
    - current:
      같은 대상의 현재 공식 값.
    - allowEmpty:
      이 필드가 빈 값 확정에 고유한 의미를 갖는지 여부.
    - emptyValue:
      빈 입력 확정 시 해당 API가 받는 값. 자동 축·기본 글자 크기는 빈 문자열,
      자동 프린트 높이는 None이다.

    Return:
    - accepted, value:
      수락 여부와 API 입력값. 거부 시 value는 current다.

    변경:
    - 없음.

    처리:
        1. 문자열의 앞뒤 공백을 제거한다. 비어 있으면 allowEmpty에 따라
           (True, emptyValue) 또는 (False, current)를 반환한다.
        2. 선택 부호 뒤 가수와 선택 지수부로 된 완성 십진수인지 확인한다.
           가수는 숫자와 최대 한 개의 소수점으로 구성하며 소수점 앞뒤 전체에 숫자가 한 자리 이상 있어야 한다.
           지수부가 있으면 e 또는 E, 선택 부호, 한 자리 이상의 숫자 순서여야 한다.
           부호만 있는 값·소수점만 있는 값·완성되지 않은 지수·문자가 섞인 값은 거부한다.
        3. 완성 문자열을 숫자로 해석한다. 유한한 수이면 (True, 숫자)를 반환하고
           그 외에는 (False, current)를 반환한다.
        4. 필드별 기존 범위·정수화는 연결한 공개 API의 현재 소유자 규칙으로 적용한다.
           적용 결과를 UiCommand의 완료 시점 공식 조회로 표시한다.
    """
    return accepted, value


def changeLayoutGridDimension(dimension, value):
    current = "이번 확정 시점의 공식 layout 조회 결과."
    outcome = "setGrid의 결과 또는 False."
    """
    Args:
    - dimension:
      rows 또는 cols 문자열.
    - value:
      UiCommand가 확정한 유한 숫자.

    Return:
    - outcome:
      기존 setGrid 결과. 거부 False와 원래 예외를 보존한다.

    변경:
    - 성공한 GRID_LAYOUT_CHANGED의 layout·slots. 기존 grid 변경의 선택 정리.

    처리:
        1. dimension이 rows 또는 cols인지 확인한다.
        2. FastFigureApi.layout["readState"]()를 current에 둔다.
           해당 gridLimits로 완성 값을 제한하고 기존 Backend 정수 검증을 사용한다.
        3. rows이면 value와 현재 gridCols, cols이면 현재 gridRows와 value를 구성한다.
        4. 같은 동기 처리에서 layout.setGrid(rows, cols)를 한 번 호출한다.
           동기 read부터 명령 진입까지 대기·외부 callback을 삽입하지 않는다.
        5. 성공 뒤 현재 공식 layout을 표시한다. 거부·예외이면 현재 값과 선택을 유지한다.
           grid shape 변경의 기존 local selection 정리 규칙은 유지한다.
    """
    return outcome


def handleDebugToggle():
    outcome = "논리값."
    """
    Args:
    - 없음.

    Return:
    - outcome:
      논리값.
      runtime owner의 공식 setter 결과

    변경:
    - Frontend renderer의 debugEnabled와 그 표시 projection.

    처리:
        1. 클릭 이벤트 시 renderer runtime owner의 readDebugEnabled()로 현재 boolean을 읽고,
           await/외부 callback 없이 그 반전을 기존 setDebugEnabled(value)에 전달한다.
           telemetry는 버튼의 label/pressed 표시를 담당한다.
           setDebugEnabled가 owner를 변경한 뒤 telemetry를 publish하며 UI는 그 단방향 projection을 표시한다.
           별도 debug mirror, Project mutation, toggle command/API 또는 두 번째 publish를 만들지 않는다.
           명시 bool setter를 직접 사용하는 다른 caller의 계약을 바꾸지 않는다. 원래 오류는 caller에 전파한다.
           outcome를 반환한다.
    """
    return outcome


def subscribeAppState(onStoreChange):
    unsubscribe = "등록 해제 함수."
    """
    Args:
    - onStoreChange:
      상태 발행 뒤 호출하는 알림 함수.

    Return:
    - unsubscribe:
      등록 해제 함수.
      이번 listener 등록을 해제하는 함수.

    변경:
    - Application 경계를 통해 Frontend listener를 등록한다.

    처리:
        1. 상태와 revision이 확정된 뒤 도착하는 변경 알림을 React에 전달한다.
           appFSM.subscribe(onStoreChange)를 반환한다.
    """
    return unsubscribe


def getAppStateSnapshot():
    revision = "Frontend revision 숫자."
    """
    Args:
    - 없음.

    Return:
    - revision:
      Frontend revision 숫자.
      현재 Frontend revision 숫자.

    변경:
    - 없음.

    처리:
        1. appFSM.readState()의 revision 숫자를 revision에 둔다.
        2. revision을 반환한다.
    """
    return revision


def useAppState():
    current = "Frontend 상태 읽기 딕셔너리."
    """
    Args:
    - 없음.

    Return:
    - current:
      Frontend 상태 읽기 딕셔너리.
      이번 render에서 사용할 Frontend 읽기전용 record.

    변경:
    - React가 관리하는 이번 component의 외부-store 구독.

    처리:
        1. React.useSyncExternalStore(subscribeAppState, getAppStateSnapshot)로 현재 revision의 변경을 구독한다.
        2. 이번 render에서 appFSM.readState()를 호출하여 current에 둔다.
        3. current를 반환한다.
    """
    return current


def addSelectedGraphObject():
    outcome = "chartModel 딕셔너리, 미반영 ProjectMutationResult 또는 None."
    """
    Args:
    - 없음.

    Return:
    - outcome:
      chartModel 딕셔너리, 미반영 ProjectMutationResult 또는 None.
      graphs.addObject의 결과 또는 위 조건에 따른 None.

    변경:
    - 기존 SLOT_DATA_CONNECTED 또는 GRAPH_OBJECTS_REPLACED를 통한 대상 chart와 slot 참조.

    처리:
        1. appFSM.readState()에서 이번 입력 시점의 lifecycle과 selectedSlotId를 읽는다.
           lifecycle이 ready이고 selectedSlotId가 있으면 그 값을 slotId로 사용한다.
           그 외에는 None을 반환한다. 식별자 0도 선택된 슬롯이다.
        2. FastFigureApi.graphs.readData()를 호출하고 반환 record의 currentCsv와 chart를 읽는다.
           currentCsv는 Frontend의 assetSelection이 csv일 때 assetPath로 Backend가 해결한 CSV다.
           chart는 같은 선택 슬롯의 content.chart로 Backend가 해결한 소유 chart다.
        3. currentCsv가 없거나 chart["editor"]["editable"]이 False이면 None을 반환한다.
           chart가 없는 슬롯은 첫 graph object 생성 대상으로 사용할 수 있다.
        4. FastFigureApi.graphs.addObject(slotId, currentCsv["id"])를 한 번 호출한다.
           이 이벤트 안에서 두 공식 읽기와 명령 호출을 동기적으로 연속 수행한다.
           Application의 graphEditorAdd와 Backend 명령이 현재 대상·CSV를 재확인하고
           첫 chart 생성 또는 기존 chart의 object 추가를 한 번 반영한다.
        5. 추가 후 chart 또는 미반영 결과를 그대로 반환한다. 조회·명령 오류는 호출자에 전파한다.
    """
    return outcome


def importSelectedSlotFile(file):
    outcome = "chartModel 딕셔너리, 미반영 ProjectMutationResult 또는 None."
    """
    Args:
    - file:
      파일 이름·MIME·바이트를 가진 이번 작업의 입력.
      FastFigureGraphFileActions의 파일 선택 완료가 전달하는 file. 취소는 None이다.

    Return:
    - outcome:
      chartModel 딕셔너리, 미반영 ProjectMutationResult 또는 None.
      기존 graphs.importFile의 결과 또는 취소·선택 해제의 None.

    변경:
    - 명시한 slotId가 소유하는 chart와 그 파일을 적용하는 데 필요한 project asset.

    처리:
        1. file이 None이면 None을 반환한다.
        2. 파일을 전달받은 이 호출에서 appFSM.readState()["selectedSlotId"]를 읽어 slotId로 삼는다.
           선택 해제면 None을 반환한다. 식별자 0도 불러오기 대상이다.
        3. FastFigureApi.graphs.importFile(slotId, file)을 한 번 호출한다.
           Application은 이 slotId와 읽은 파일 바이트를 SLOT_CHART_IMPORTED에 전달한다.
           비동기 파일 읽기 도중 선택이 바뀌어도 이 불러오기에서 사용하는 slotId를 유지한다.
        4. Backend가 현재 project에서 slotId의 visible slot을 찾고 파일을 해석한다.
           FFSX는 applyFfsxSlot, Plotly JSON은 parsePlotlyToEditor로 candidate를 구성한다.
           필요한 자산과 소유 chart를 같은 project candidate로 검증하여 한 번 반영한다.
           대상 소멸 또는 파일 해석·검증 오류는 기존 실패 경로로 반환한다.
        5. Application의 기존 lifecycle 처리가 완료 또는 오류 뒤 ready로 복귀한다.
           이 절차는 그 chart·미반영 결과를 반환하고 원래 오류를 호출자에 전파한다.
    """
    return outcome


def setSelectedGraphEditable(editable):
    outcome = "편집 가능 여부인 논리값, 미반영 ProjectMutationResult 또는 None."
    """
    Args:
    - editable:
      편집 가능 여부인 논리값.
      editable은 FastFigureGraphFileActions에서 사용자가 입력한 편집 가능 여부 boolean이다.

    Return:
    - outcome:
      편집 가능 여부인 논리값, 미반영 ProjectMutationResult 또는 None.
      기존 setEditable의 결과 또는 선택·chart 없음의 None.

    변경:
    - 해당 chart["editor"]["editable"]과 convertImportedChartToEditable가 구성하는 CSV·object 참조.

    처리:
        1. appFSM.readState()["selectedSlotId"]를 이번 slotId로 읽는다. 선택 해제면 None을 반환한다.
        2. FastFigureApi.graphs.readData()["chart"]로 그 슬롯이 소유하는 현재 chart를 얻는다.
           공식 조회는 slot.content["chart"]를 activeProject._state['charts']에서 해결한다. chart가 없으면 None을 반환한다.
        3. 같은 동기 입력 처리에서 FastFigureApi.graphs.setEditable(slotId, chart["id"], editable)을 한 번 호출한다.
           graphEditorSetEditable이 세 인자를 CHART_MODEL_REPLACED에 전달하고 Backend가 현재 소유 관계를 검증한다.
        4. Backend의 convertImportedChartToEditable 규칙에 따라 imported conversionRows와 object가 있으면
           실제 CSV와 csvId 참조를 같은 candidate에 구성한다. conversionRows 또는 object가 없으면
           그 조건에 맞게 기존 참조·빈 object를 유지한다. editable 변경과 필요한 자산을 한 번 반영한다.
        5. 최종 editable boolean 또는 미반영 결과를 반환한다. 조회·명령 오류는 호출자에 전파한다.
    """
    return outcome


def updateSelectedGraphLayout(values):
    outcome = "Plotly layout 딕셔너리, 미반영 ProjectMutationResult 또는 None."
    """
    Args:
    - values:
      이번 변경에 명시한 필드와 새 값의 부분 딕셔너리.
      values는 FastFigureGraphLayoutEditor에서 이번에 입력한 설정값을 담은 부분 record다.
      구조는 sourcescript/backend/graphs.py의 chartModel["editor"] 중 title과 globalSettings를 따른다.
      globalSettings의 항목은 같은 파일의 globalSettings 정의를 따르고,
      globalSettings["axes"]의 축 이름은 그 정의의 axes key,
      각 축 안의 설정 이름은 같은 파일의 axisSettings key를 사용한다.

      values에 들어 있는 key와 중첩 위치로 변경 대상을 결정한다.
      - {"title": "측정 결과"}는 chart["editor"]["title"]에 새 제목을 입력한 요청이다.
      - {"globalSettings": {"showLegend": False}}는 chart["editor"]["globalSettings"]["showLegend"]를 끈 요청이다.
      - {"globalSettings": {"axes": {"xBottom": {"min": 0}}}}는
        chart["editor"]["globalSettings"]["axes"]["xBottom"]["min"]에 최솟값 0을 입력한 요청이다.
      각 요청에는 이번에 입력한 항목과 새 값만 담는다. 생략한 항목은 현재 값을 유지한다.
      값의 자료형과 빈 값의 의미도 globalSettings와 axisSettings의 정의를 따른다.

    Return:
    - outcome:
      Plotly layout 딕셔너리, 미반영 ProjectMutationResult 또는 None.
      graphs.updateLayout의 결과. 선택·chart 없음 또는 busy이면 None.

    변경:
    - 기존 CHART_LAYOUT_CHANGED가 반영하는 해당 slot 소유 chart의 editor 설정과 graph.

    처리:
        1. appFSM.readState()에서 이번 입력 시점의 lifecycle과 selectedSlotId를 읽는다.
           lifecycle이 ready이고 selectedSlotId가 있으면 이를 slotId로 사용한다.
           선택 해제 또는 busy 상태면 None을 반환하고 이 입력 처리를 끝낸다. slotId 0은 유효하다.
        2. FastFigureApi.graphs.readData()에서 chart를 얻는다. 이 공식 읽기는 현재 선택 참조로
           sourcescript/backend/project_state.py의 activeProject._state['slots']에서 visible slot을 찾고,
           slot.content["chart"]의 id로 activeProject._state["charts"]에서 소유 chart를 찾는다.
           chart가 없으면 None을 반환한다.
        3. FastFigureApi.graphs.updateLayout(slotId, chart["id"], values)를 한 번 호출한다.
           선택 참조 읽기, chart 조회, 이 호출을 같은 동기 입력 처리에서 연속 수행한다.
        4. 이 API의 sourcescript/application/public_api/graphs.py::graphEditorUpdateLayout은
           values를 CHART_LAYOUT_CHANGED의 settings 인자로 전달한다.
           Backend는 현재 slotId와 chartId의 소유 관계를 다시 확인한다.
           values.title은 candidate chart["editor"]["title"]에 적용하고, values.globalSettings는
           candidate의 현재 globalSettings와 항목별로 합친다. axes는 축 이름과 설정 이름까지
           내려가 새 값이 있는 항목을 합치므로 다른 축과 생략한 설정은 유지된다.
           normalizeGlobalSettings와 normalizeAxisSettings가 입력값을 해석하고,
           같은 candidate의 graph를 재계산한 뒤 project 검증을 거쳐 한 번 반영한다.
        5. API가 반환하는 반영 후 layout 또는 미반영 결과를 그대로 반환한다.
           조회 및 명령 오류는 호출자에 전파한다.
           outcome를 반환한다.
    """
    return outcome


def useProjectAssetImportCollision():
    collisionUi = "choosePlan 함수와 Modal의 튜플."
    """
    Args:
    - 없음.

    Return:
    - collisionUi:
      choosePlan 함수와 Modal의 튜플.
      - choosePlan:
        file/directory에 대해 user choice를 받아 core import plan을 반환하는 UI-local async function.
      - modal:
        collision이 있을 때만 표시하는 Mantine Modal.

    변경:
    - project state를 직접 변경하지 않는다.
    - local collision/resolver state만 변경한다.

    처리:
        1. core collisionModel을 먼저 계산한다.
        2. available이면 UI 없이 core resolveImportPlan을 호출한다.
        3. user choice가 필요하면 Modal lifetime 동안 resolver를 보유한다.
        4. rename/replace 버튼처럼 명시적 choice를 받은 경우에만 core resolveImportPlan으로 최종 plan을 계산한다.
        5. Escape, outside click, close button 또는 component cleanup처럼 명시적 choice 없이 Modal이 닫히면 cancel로 완료한다.
           cancel은 import plan을 만들지 않고 pending resolver/local collision state만 정리하며 project/domain mutation을 발생시키지 않는다.
           collisionUi를 반환한다.
    """
    return collisionUi


def runLifecycleTask(lifecycle, eventName, task):
    outcome = "task 반환값 또는 UI 오류 처리 결과."
    """
    Args:
    - lifecycle:
      importing 또는 exporting.

    - eventName:
      이번 작업의 이름 문자열.

    - task:
      Application에서 실행할 동기 또는 비동기 작업 함수.

    Return:
    - outcome:
      task 반환값 또는 UI 오류 처리 결과.
      - task result 또는 UI error 처리 결과.

    변경:
    - Application boundary가 전달하는 Frontend lifecycle state.
    - task가 호출하는 공식 Backend command에 따른 domain state.

    처리:
        1. Mantine Frontend는 task callback을 interfaceFSM에 직접 넘기지 않고 runApplicationLifecycleTask에 위임한다.
           Application boundary가 LIFECYCLE_START -> task -> COMPLETE/FAILED 순서를 소유한다.
           UI layer는 error를 debug telemetry에 기록할 수 있지만 별도 domain rollback 규칙을 만들지 않는다.
           runApplicationLifecycleTask(lifecycle, eventName, task)를 반환한다.
    """
    return outcome


def FastFigureApp():
    uiTree = "MantineProvider의 React 트리."
    choosePlan = "충돌 선택 Promise를 반환하는 함수."
    palette = "ProjectObject._state의 appearance.uiPalette 원형의 딕셔너리."
    theme = "Mantine theme 딕셔너리."
    c = "sRGB 한 채널의 0..1 수치."
    r = "선형화한 red 채널의 0..1 수치."
    g = "선형화한 green 채널의 0..1 수치."
    b = "선형화한 blue 채널의 0..1 수치."
    luminance = "상대 휘도 수치."
    previewFrame = "renderDashboardFrame의 미리보기 DOM 참조 결과."
    """
    Args:
    - 없음.

    Return:
    - uiTree:
      MantineProvider의 React 트리.
      MantineProvider 아래 FastFigureShell.

    변경:
    - UI-local component 상태·구독·입력 수신 수명주기.

    처리:
        1. FastFigureApi.appearance.readPalette의 이번 읽기 결과를 palette에 둔다.
           매 render의 theme 값은 이 palette의 현재 필드에서 계산한다.
           theme.colors.ffui의 10개 shade는 모두 uiColor, primaryColor=ffui, color scheme=light다.
           body=uiBackgroundColor, text/default-color/primary-light-color=fontColor, default=uiSurfaceColor,
           default-border/primary-filled=uiColor, dimmed=uiMutedColor, placeholder=uiSubtleColor,
           disabled/disabled-border=uiDisabledBgColor, disabled-color=uiDisabledTextColor를 Mantine CSS 변수로 투영한다.
           default-hover는 sRGB color-mix(uiColor 12%, uiSurfaceColor), filled-hover는 sRGB mix(uiColor 75%, #64748B),
           primary-light/light-hover는 sRGB mix(uiColor 18%/24%, transparent)다.
           uiColor의 각 hex channel을 0..1로 나누고 c<=0.04045이면 c/12.92, 아니면 ((c+0.055)/1.055)**2.4로 선형화한다.
           luminance=0.2126*r+0.7152*g+0.0722*b이며 >0.179이면 primary contrast=#000000, 그 외 #FFFFFF다.
           ffui filled/filled-hover/light/light-hover/light-color/contrast 변수는 위 primary 변수의 alias다.
           theme shadow의 black-alpha 색만 같은 alpha의 uiShadowColor/transparent sRGB mix로 바꾸며 shadow geometry는 유지한다.
           graph paper는 paperColor, graph ink는 fontColor에서 읽는다. UI surface와 background는 각각 uiSurfaceColor와 uiBackgroundColor에서 읽는다.
           이 theme을 아래 MantineProvider 구성에 사용한다.

        2. Button·ActionIcon·Input·Select·NumberInput·ColorInput의 일반 조작 크기를
           theme/default props에서 함께 정한다. 같은 역할의 입력·버튼·행 동작 아이콘은 같은 높이,
           글꼴, padding, radius 규칙을 사용한다. 각 사용처는 이 규칙을 사용한다.
           그래프 데이터·오브젝트·축, 레이아웃·라벨·캡션·프린트·자산 입력 행에 같은 배치 규칙을 적용한다.
           같은 역할의 입력은 공통 폭을 사용하고 행 간격을 일치시킨다. 라벨 있는 필드의 입력 부분과
           단독 버튼의 아래쪽을 맞춘다. 폭이 부족하면 입력과 그 라벨을 한 단위로 다음 줄에 배치한다.
           텍스트 설명 크기와 renderer 도형·resize handle 치수는 해당 표시의 규칙을 유지한다.
           Modal의 centered/Escape/outside-click 기본값을 theme에 둔다.
           Layout·Label·Caption·Print Modal에 공통 최대 너비를 적용한다.
           이 너비는 Mantine의 최대 size token보다 넓게 정하며 구체 CSS 표현은 source code에서 정한다.
           네 Modal의 하단 resize 입력은 각각 열린 Modal의 UI-local 높이를 갱신한다.
           README Modal에는 해당 resize 입력을 붙이지 않는다.
        3. useProjectAssetImportCollision의 결과를 choosePlan에 둔다.
           toolbar의 '렌더링' 버튼은 '프린트' 바로 왼쪽에 배치한다.
           기존 공통 Button과 UiCommand.send를 사용하여 FastFigureApi.workspace.render를 한 번 호출한다.
           다른 일반 버튼과 같은 theme·높이·padding·정렬·busy 표시·접근성 규칙을 사용한다.
           toolbar의 overlay 버튼은 연결된 overlay 이름으로 dispatchInterfaceEvent의 TOGGLE_OVERLAY를 호출한다.
           선택 대상은 slots.readSelected로 표시한다.
           data actions에는 assets.importFiles, slots.reset과 asset 삭제 동작을 연결한다.
           image editor는 images.readEditor 결과를 표시하고 images.setSettings와 images.insertEmpty를 호출한다.
        4. ProjectDataTree는 readProjectAssetDisplay의 nodes와 slotRows를 표시한다.
           row 선택에는 assets.selectCsv/selectImage/selectDirectory, 이동에는 assets.planMove/move,
           menu에는 createDirectory/delete/emptyTrash/download를 연결한다.
           trash의 CSV/image도 선택 가능하게 표시하고, 이동·복구는 같은 planMove/move로 처리한다.
           slot 연결 drag는 assets.draggableAsset가 승인한 trash 밖 CSV/image에만 허용하여
           assets.connectToSlot에 path·kind·대상 slotId를 전달한다.
        5. project actions에는 project.readName/setName/importFile/exportFile을 연결한다.
           GraphDataEditor는 graphs.readData의 currentCsv·columns·objects를 표시하고
           CSV 선택·header 변경·object 선택/편집/이동/삭제를 각각 대응 graph API에 연결한다.
           object 추가는 addSelectedGraphObject를 호출한다.
           빈 CSV 입력은 assets.createEmptyCsv의 생성·선택 결과를 반영하고,
           이후 object 추가 입력은 같은 addSelectedGraphObject로 처리한다.
           오브젝트 목록의 각 선택 항목은 같은 readData 결과의 chart["editor"]["title"]과
           object를 사용한다. object["legendName"]이 비어 있지 않으면 그것을 식별 문자열로 쓰고,
           그 외에는 object["x"], ' · ', object["y"]를 순서대로 연결한다.
           제목이 비어 있으면 '{index+1}. {식별 문자열}', 있으면
           '{index+1}. {제목} — {식별 문자열}'을 표시한다. 선택 값은 원래 index다.
           제목은 줄바꿈 가능하게 표시하고 식별 문자열은 항상 읽을 수 있는 별도 부분으로 배치한다.
           접근성 이름에는 전체 제목·식별 문자열을 제공한다.
           제목 변경·추가·이동·프로젝트 불러오기 후에도 이번 공식 조회로 표시를 다시 구성한다.
           chart가 없으면 빈 목록이다. 이 표시는 object·title·trace 범례·저장 필드를 변경하지 않는다.
        6. GraphLayoutEditor는 graphs.readLayout을 표시하고 updateSelectedGraphLayout을 호출한다.
           GraphPaletteActions는 graphs.readPalette를 표시하고 graphs.applyPalette를 호출한다.
           GraphFileActions는 importSelectedSlotFile·setSelectedGraphEditable와
           graphs.exportFfsx/exportPlotlyJson을 연결한다.
           그래프 편집에는 '전역 설정'과 '오브젝트 설정' 접기 그룹을 두고 처음에는 연다.
           전역 설정 안에 X축과 Y축 그룹을 두며, X축 안에 아래 X축·위 X축,
           Y축 안에 왼쪽 Y축·오른쪽 Y축 그룹을 둔다. 이 여섯 축 그룹은 처음에는 닫는다.
           네 세부 축은 각각 globalSettings.axes의 xBottom·xTop·yLeft·yRight를 편집한다.
           오브젝트 설정 안의 '종류별 세부 설정'은 처음에는 닫고 기존 종류별 입력을 담는다.
           object의 X/Y축 위치 입력은 오브젝트 설정에 유지한다.
           'UI 색상'과 '디버그 로그'도 독립된 접기 그룹으로 두고 처음에는 닫는다.
           개폐는 그룹별 UI-local 열림 상태만 변경한다. 같은 화면의 일반 재렌더에서는 유지한다.
           각 제목을 키보드로 조작할 수 있게 하고 expanded 상태·내용 연결을 제공한다.
           닫을 때 내부에 포커스가 있으면 그룹 제목으로 옮긴다.
           접기 조작은 project 값·선택 object·axis 설정·debugEnabled를 변경하지 않는다.
        7. PaletteActions는 appearance.readPalette 결과를 draft로 표시하고 명시적 apply/reset에
           appearance.setPalette/resetPalette를 호출한다.
           StatusDebug는 telemetry를 표시하고 debug 클릭에 handleDebugToggle을 호출한다.
           ReadmeOverlay는 배포 README 내용을 표시한다.
        8. LabelOverlay는 labels.readState를 표시하고 enabled/settings/position/reset/finish 입력을
           labels의 대응 method에 연결한다. pointer 이동의 유효한 position은 같은 setPosition을 호출한다.
           CaptionOverlay는 captions.readGlobal과 선택 Slot의 captions.readSlot을 표시하고
           text/name/nameBold/settings/enabled 입력을 대응 captions method에 연결한다.
           slot caption을 global에 추가하는 명시적 입력은 captions.insertSlotCaptions를 호출한다.
           편집 대상 global/slot은 열린 편집기의 UI-local 값으로 유지한다.
        9. PrintOverlay는 print.readSettings의 값을 표시하고 setSettings/save/capture를 연결한다.
           LayoutOverlay는 layout.readState의 grid/style/visibleSlots를 표시한다.
           모든 숫자 입력은 아래 UiCommand 연결을 사용한다.
           행·열의 invoke는 changeLayoutGridDimension(dimension, 확정값)을 호출한다.
           style은 layout.setStyle, 확대 비율은 layout.setZoom, 100% 초기화는 layout.resetZoom을 호출한다.
        10. LayoutOverlay에서 slot click은 해당 id의 local selection을 toggle한다.
            배경 click·grid shape 변경·overlay close는 selection을 비운다.
            slot click과 merge/split 입력은 먼저 자신의 동작을 처리하고 parent clear 전파를 소비한다.
            merge/split에는 그 시점의 선택 id 배열을 layout.mergeSlots/splitSlots에 전달한다.
        11. 미리보기 host의 너비를 측정하여 layout.readState에 전달한다.
            readState의 기존 preview 너비 범위·무효 입력 기본값을 유지하고 반환된
            previewGeometry["width"]를 host 너비로 적용한다. 외부 표시 영역이 더 좁으면 가로 스크롤로 본다.
            측정 전·표시 불가의 너비는 None으로 전달하여 기존 fallback을 사용한다.
            반환된 gridRows/gridCols/slotStyle, visibleSlots, previewGeometry를 같은 표시 회차에
            renderDashboardFrame에 미리보기 host와 함께 전달하고 반환값을 previewFrame에 둔다.
            이 공통 절차가 grid와 각 슬롯 틀을 만든다. 좌표·local selection·포커스 강조를
            그 슬롯 틀의 장식 영역에 표시하고 slot click을 10번의 동작에 연결한다.
            showBorders가 False이면 각 슬롯의 장식 영역 안쪽 경계에 점선을 표시한다.
            True이면 점선 장식을 지우고 공통 틀의 프로젝트 외곽선을 표시한다.
            local selection·포커스는 점선과 구분되는 안쪽 강조로 표시한다.
            선택·해제·스타일 갱신마다 해당 host의 이전 장식을 정리하고 현재 span·radius로 다시 구성한다.
            미리보기의 장식 테두리·선택 표시는 슬롯 경계와 content 기하 치수를 유지한다.
            host 정리 시 이 미리보기의 틀과 listener만 해제한다.
            Modal/viewport 폭이 달라지면 다시 조회한다. 세로 resize는 Modal local 높이만 바꾼다.
            preview 갱신은 실제 dashboard generation·Plotly instance·이미지 decode 자원을 변경하지 않는다.
        12. DashboardFileDrop이 수신 가능한 동안 dashboard의 논리적 수신 경로를 하나 유지한다.
            rerender·callback 교체 사이에도 유효한 drop은 정확히 한 import 시도로 전달한다.
            unmount 또는 수신 불가 lifecycle/target 상태가 되면 수신을 해제한다.
        13. 외부 file drop에서 DOM 대상 slotId를 구하고 slots.prepareFileDrop을 호출한다.
            준비가 승인되면 assets.importToSlot(file, slotId, choosePlan)을 한 번 호출한다.
            importing lifecycle은 public API의 작업 경로를 사용한다.
            choosePlan은 useProjectAssetImportCollision의 명시적 선택 또는 취소 결과를 전달한다.
            준비 후의 성공·실패·취소에서 slots.finishFileDrop으로 drag/hover 상태를 정리한다.
        14. 각 숫자 입력과 명령 버튼에 UiCommand 인스턴스를 한 개씩 연결한다.
            버튼의 invoke에는 3~10번의 해당 공개 API·기존 helper와 필요한 명시 인자만 둔다.
            오브젝트 추가·이동·삭제, 파일 가져오기·저장, asset 이동·삭제·복구, palette 적용·초기화,
            labels/captions/print/layout 작업 버튼과 전체 렌더링 버튼은 클릭에서 그 인스턴스의 send를 호출한다.
            readTarget은 현재 공식 선택과 해당 작업의 기존 활성 조건을 읽는다.
            숫자 입력은 슬롯 id·chart id·object index·CSV id·축 키·열린 Modal의 global/slot 대상 중
            해당 필드를 식별하는 값을 사용한다. 선택이 필요 없는 설정은 설정 영역으로 식별한다.
            lifecycle이 ready를 벗어나거나 대상이 바뀌면 미확정 편집을 취소한다.
            파일 선택 완료 뒤에는 기존 helper가 같은 이벤트 시점 대상을 정하고 파일 API를 호출한다.
            collision 선택·접기·Modal 열고 닫기처럼 UI-local 조작은 자신의 UI 상태만 변경한다.
        15. 숫자 필드의 readValue·invoke를 다음과 같이 연결한다. 값은 공식 조회 때마다 읽는다.
            prepare는 prepareNumericInput을 사용하며 아래 자동/빈 값 필드에만 allowEmpty=True를 준다.
            - 이미지 scale·x·y 3개: images.readEditor의 현재 slot settings,
              images.setSettings({field: value}). 대상은 선택 slot id와 image id다.
              /backend/project_efsm/ProjectStateMachine.send의 SLOT_IMAGE_SETTINGS_CHANGED와
              backend.defaults.limits.imageSettings가 범위 원천이다.
            - CSV headerLines 1개: graphs.readData의 currentCsv.id·headerLines,
              graphs.setHeaderLines(csvId, value). normalizeCsvHeaderLines의 정수화·0..행 수를 유지한다.
            - 오브젝트 lineWidth·markerSize·barOpacity·barLineWidth 4개:
              graphs.readData의 chart id·선택 index·object 값, graphs.setObject(index, {field: value}).
              /backend/graphs/tracesSingle의 GRAPH_STYLE_LIMITS와 기본값을 유지한다.
            - xBottom·xTop·yLeft·yRight 각각 min·max·tick·divide·titleSize·fontSize·lineWidth 7개:
              graphs.readLayout의 chart id·axes[key][field], updateSelectedGraphLayout의 부분 patch.
              min·max·tick의 빈 값은 빈 문자열을 보내 자동으로 설정한다.
              normalizeAxisSettings의 divide=0→1, 양수 글자 크기·0 이상 선 굵기 규칙을 유지한다.
            - 전역 titleFontSize·legendFontSize 2개:
              graphs.readLayout의 globalSettings, updateSelectedGraphLayout의 부분 patch.
              빈 값은 빈 문자열을 보내 normalizeGlobalSettings의 기본 표시 크기를 사용한다.
            - 레이블 fontSize·x·y 3개: labels.readState의 settings,
              fontSize는 labels.setSettings({fontSize: value}),
              x 또는 y는 그때 조회한 나머지 좌표와 labels.setPosition(x, y)를 호출한다.
              backend.defaults.limits.labels와 LABEL_POSITION_CHANGED의 위치 규칙을 유지한다.
              pointer drag의 직접 setPosition은 기존 interaction 경로를 유지한다.
            - 캡션 fontSize·lineHeight 2개: captions.readGlobal의 settings와 captions.setSettings.
              backend.defaults.limits.captions를 사용한다. 슬롯 캡션 text 편집은 기존 경로를 유지한다.
            - 프린트 dpi·width·height 3개: print.readSettings와 print.setSettings의 해당 부분 patch.
              height의 빈 값은 {heightMode: auto, height: None}, 숫자는 {heightMode: explicit, height: value}다.
              backend.defaults.limits.export와 EXPORT_SETTINGS_CHANGED의 정수화·범위 규칙을 유지한다.
            - 레이아웃 rows·cols·referenceWidth·gap·outerMargin·radius·aspect·zoom 8개:
              layout.readState에서 현재 grid·slotStyle·zoom을 읽는다.
              행·열은 changeLayoutGridDimension, 스타일 5개는 layout.setStyle({field: value}),
              배율은 layout.setZoom(value)이다. backend.defaults.limits.layout과
              interface_fsm.InterfaceStateMachine.send의 배율 50..200 규칙을 유지한다.
            위 연결은 해당 component 생성 위치에 두고 공통 함수로 생성하는 필드도 같은 인스턴스 수명을 적용한다.
            범위·명령 이름을 따로 전역 등록하지 않는다. step은 해당 필드의 기존 위젯 단위를 연결한다.
        16. 위젯 onChange는 원문을 input에, Enter와 blur는 commit에, Escape는 cancel에 연결한다.
            조합 중 Enter는 IME에 맡긴다. 조합 종료 뒤 확정 이벤트를 처리한다.
            위젯이 blur에서 원문을 clamp하거나 선행 0을 바꿔 별도 onChange를 만들지 않도록
            기존 위젯 설정·이벤트 연결을 구성한다. 증감 버튼·화살표는 step에 한 번 연결한다.
            원문·선택 범위·포커스를 일반 재렌더에서 유지하고 외부 공식 갱신으로 편집 문자열을 덮어쓰지 않는다.
            대상 변경·Escape·overlay 닫힘은 cancel, unmount는 dispose를 호출한다.
            같은 대상의 재렌더는 같은 객체를 유지하며 함수 연결은 현재 API·대상을 조회한다.
        17. 위 component와 event handler를 FastFigureShell 아래 구성하고
            theme을 적용한 MantineProvider 트리를 uiTree에 둔다.
        18. uiTree를 반환한다.
    """
    return uiTree


def FastFigureShell():
    shell = "Mantine AppShell 트리."
    """
    Args:
    - 없음.

    Return:
    - shell:
      Mantine AppShell 트리.
      header/navbar/main과 overlay component를 포함한 AppShell.

    변경:
    - navbar width/collapsed 같은 session-local UI state.
    - renderer host layout CSS variable.

    처리:
        1. Sidebar·창·graphArea 크기 변경과 스크롤 이동은 기존 workspace 내용의 CSS 위치·배율로 처리한다.
           transformWorkspace()로 Application의 workspace-structure 조회와 CSS 변환을 실행한다.
           Plotly.react/newPlot/resize·figure/CSV 계산·이미지 재해석을 요청하지 않는다.
        2. 기존 content와 포커스·선택 장식·bookmark를 유지한다.
           아직 내용이 없는 슬롯을 resize만으로 그리지 않는다. shell을 반환한다.
    """
    return shell
