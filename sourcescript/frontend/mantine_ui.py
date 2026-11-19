"""
Fast Figure Source Script — Frontend / mantine-ui

하위 구현 검증 자료: ../../fast-figure.js, ../../fast-figure-ui.js, ../../Fast-figure.html.
Python 문법으로 작성한 구현 명세다.
"""

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
        directory node는 kind/path/name/children, asset node는 kind/path/id/name/referenceCount를 갖는다.
        CSV node의 rowCount는 헤더를 제외한 행 수다.
        slot row는 id/row/col/rowSpan/colSpan/contentType/chart/imageId/assetDisplay를 갖는다.
        assetDisplay는 Backend가 해결한 {kind: empty/assets/embedded, assets: [{kind,id,name,path}]}다.

    변경:
    - 없음.

    처리:
        1. FastFigureApi.assets.readTree()를 호출하여 canonical node sequence를 nodes로 받는다.
           nodes의 path와 children은 Backend가 구성한 directory·CSV·image 관계다.
        2. 이어서 FastFigureApi.slots.readDisplay()로 visible slot 표시 행만 받는다.
           각 행의 assetDisplay에 소유 chart·image와 연결 CSV의 이름·식별 정보가 들어 있다.
        3. nodes와 슬롯 표시 행을 각각 반환 record의 nodes와 slotRows에 넣는다.
           FastFigureProjectDataTree는 nodes로 자산 행을, slotRows로 슬롯별 연결 자산 행을 표시한다.
           sequence 순서와 assetDisplay.kind가 empty 또는 embedded인 행도 유지한다.
           두 조회 사이에는 다른 이벤트 처리를 삽입하지 않는다. 조회 오류는 호출자에 전파한다.
           반환 record는 이번 표시 작업에서 소비한다.
    """
    return display


def readAssetRowDisplay(node):
    display = {"referenceCount": "이 노드의 현재 참조 수.", "rowCount": "CSV 데이터 행 수 또는 None."}
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
        1. 이번 assets.readTree 또는 readTrash가 구성한 node의 referenceCount를 읽는다.
        2. CSV이면 같은 node의 rowCount를 사용하고, 이미지이면 rowCount를 None으로 둔다.
        3. 이 두 표시 값을 반환한다. 행별 query·표 행 스캔·자산 복사를 실행하지 않는다.
    """
    return display


class UiCommand:
    def __init__(self, readCurrent, prepare, invoke, stepSize=None):
        self.readCurrent = "현재 식별자·값·동반 값·ready를 반환하는 함수."
        self.prepare = "원문과 현재 값을 받아 수락 여부·확정 값을 반환하는 순수 함수 또는 None."
        self.invoke = "확정 값·대상 식별자·동반 값을 기존 공개 변경 API의 인자로 연결하는 함수."
        self.stepSize = "기존 위젯의 증감 단위 또는 None."
        self.text = "미확정 편집 문자열."
        self.editTarget = "편집 대상 식별자 tuple 또는 None."
        self.editing = "문자열 편집 중인지 여부."
        self.composing = "IME 조합 중인지 여부."
        self.running = "이번 객체가 시작한 API 작업의 진행 여부."
        self.active = "이 객체의 연결 수명이 유효한지 여부."
        """
        Args:
        - readCurrent:
          해당 기능군의 좁은 공식 조회를 한 번 호출하는 함수.
          결과는 target, value, companions, ready 딕셔너리다.
          target은 정수 id·object index·편집 범위의 tuple 또는 None이며 0은 유효하다.
          companions는 FastFigureApp 처리 15번의 동반 값을 담는 딕셔너리다.
          레이블 위치의 원천은 labels.readSettings의 settings.x/y이며, 행·열 변경의 원천은 layout.readControls의 gridRows/gridCols/gridLimits다.
          동반 값을 쓰지 않는 입력에는 빈 딕셔너리를 둔다.
        - prepare:
          숫자 입력의 원문 판정 함수. 버튼은 None이다.
        - invoke:
          기존 API 호출 함수. 현재 target과 새 입력·필요한 동반 값만 전달한다.
        - stepSize:
          해당 필드의 기존 증감 단위 또는 None.

        Return:
        - 없음.

        변경:
        - 이 객체의 UI-local 편집·연결·실행 상태.

        처리:
            1. 입력 함수와 stepSize를 연결한다. text는 빈 문자열, editTarget은 None으로 둔다.
            2. editing/composing/running은 False, active는 True로 둔다.
            3. 같은 component의 재렌더는 이 객체를 유지하고 함수 연결만 현재 것으로 바꾼다.
        """

    def input(self, text, composing=False):
        current = "이번 입력 판정의 식별자·값·동반 값·ready."
        """
        Args:
        - text:
          위젯이 전달한 편집 문자열.
        - composing:
          IME 조합 중인지 여부.

        Return:
        - text:
          입력란에 표시할 현재 편집 문자열.

        변경:
        - 이 객체의 편집 문자열과 대상.

        처리:
            1. active=False 또는 running=True이면 self.text를 반환한다. readCurrent를 한 번 호출한다.
            2. target=None이면 cancel하고 self.text를 반환한다. 편집 대상이 달라졌으면 이전 편집을 버린다.
            3. current의 target과 원문 text, composing을 저장하고 editing=True로 둔다.
               이 입력 판정의 current는 저장하지 않는다. Backend 명령과 범위 clamp를 실행하지 않는다.
               self.text를 반환한다.
        """
        return self.text

    def commit(self):
        current = "이번 확정 판정의 식별자·값·동반 값·ready."
        accepted = "원문 수락 여부."
        value = "확정한 API 입력값."
        outcome = "기존 API 결과 또는 None."
        """
        Args:
        - 없음.

        Return:
        - outcome:
          기존 결과·취소·no-op. 원래 오류를 전파한다.

        변경:
        - 편집 상태와 기존 API가 반영하는 변경.

        처리:
            1. 비활성·실행 중·조합 중·편집 없음이면 None을 반환한다.
            2. self.readCurrent()의 결과를 current에 둔다. current["target"]이 None이거나 self.editTarget과 다르면 cancel하고 None을 반환한다.
            3. self.prepare에 self.text와 current["value"]를 전달한다. 반환된 수락 여부와 확정 값을 각각 accepted와 value에 둔다.
               accepted가 False이면 cancel하고 None을 반환한다.
            4. self.editing과 self.composing을 False로 바꾼다. _sendCurrent(value, self.editTarget, current)의 결과를 outcome에 둔다.
            5. outcome을 반환한다.
        """
        return outcome

    def send(self, value=None, target=None):
        current = "이번 전송 판정의 식별자·값·동반 값·ready."
        outcome = "기존 API 결과 또는 None."
        """
        Args:
        - value:
          새 사용자 입력 또는 버튼 입력.
        - target:
          호출자가 확인할 식별자 tuple 또는 None.

        Return:
        - outcome:
          기존 API 결과·미반영·취소·원래 오류.

        변경:
        - 실행 중 상태와 기존 API가 반영하는 변경.

        처리:
            1. 비활성 또는 실행 중이면 None을 반환한다. self.readCurrent()의 결과를 current에 둔다.
            2. target이 None이면 current["target"]을 target에 둔다.
            3. _sendCurrent(value, target, current)의 결과를 outcome에 두고 반환한다.
        """
        return outcome

    def _sendCurrent(self, value, target, current):
        outcome = "이 호출의 API 결과 또는 None."
        """
        Args:
        - value:
          이번 확정 입력.
        - target:
          이번 대상 식별자 tuple.
        - current:
          같은 동기 판정에서 self.readCurrent가 반환한 target/value/companions/ready 딕셔너리.
          원형: /frontend/mantine_ui/UiCommand.__init__의 readCurrent 인수 설명.

        Return:
        - outcome:
          기존 반환값 또는 원래 오류.

        변경:
        - 실행 중 상태와 기존 API가 반영하는 변경.

        처리:
            1. 비활성·실행 중·ready=False·대상 부재·현재 식별자 불일치이면 None을 반환한다.
            2. 숫자 입력이고 value가 현재 value와 같으면 이 current의 value로 공식 표시를 복원하고 API·추가 조회 없이 None을 반환한다.
            3. running=True로 바꾸고 invoke(value,target,current의 companions)를 정확히 한 번 호출한다.
               이 판정의 조회부터 invoke까지 대기나 다른 사용자 작업을 끼우지 않는다.
               Backend 명령은 현재 소유 대상을 다시 검증한다. current를 명령 원본으로 전달하지 않는다.
            4. 동기 또는 비동기 반환을 outcome에 둔다. 성공·거부·예외 모두 running을 해제한다.
               활성 객체의 같은 현재 대상이면 새 readCurrent로 공식 표시를 복원한다. 새 편집은 덮어쓰지 않는다.
            5. invoke의 원래 오류를 우선 전파하며 표시 복원에서만 오류가 났으면 그 오류를 전파한다.
               current는 이 작업의 입력 판정에서 끝내고 outcome을 반환한다.
        """
        return outcome

    def cancel(self):
        reading = "표시 복원 시점의 좁은 공식 읽기."
        current = "복원 뒤 입력에 표시할 문자열."
        """
        Args:
        - 없음.

        Return:
        - current:
          복원 뒤 입력에 표시할 문자열.

        변경:
        - 이 객체의 미확정 편집.

        처리:
            1. text를 비우고 editTarget=None, editing/composing=False로 둔다.
            2. active이면 새 readCurrent를 reading에 두고 value의 현재 공식 표시 문자열을 current와 self.text에 둔다.
               대상이 없거나 비활성이면 빈 문자열을 사용한다. API 명령을 실행하지 않는다.
               진행 중 API의 종료 정리는 해당 _sendCurrent가 수행한다. current를 반환한다.
        """
        return current

    def step(self, direction):
        current = "이번 증감 판정의 좁은 공식 읽기."
        value = "증감 후 입력 숫자."
        outcome = "기존 API 결과 또는 None."
        """
        Args:
        - direction:
          증가 또는 감소.

        Return:
        - outcome:
          기존 API 결과 또는 None.

        변경:
        - 이 객체의 편집 상태와 확정 입력의 변경.

        처리:
            1. 비활성·실행 중·조합 중이거나 self.stepSize가 None이면 None을 반환한다.
            2. self.readCurrent()의 결과를 current에 둔다. current["target"]이 None이면 cancel하고 None을 반환한다.
               편집 대상이 current["target"]과 다르면 이전 편집을 버린다.
            3. 같은 대상의 완성 편집 숫자, current["value"]의 유한 숫자, 0 순서로 증감 기준을 선택한다.
            4. direction에 따라 self.stepSize를 더하거나 뺀 값을 value에 둔다. self.editing과 self.composing을 False로 바꾼다.
            5. _sendCurrent(value, current["target"], current)의 결과를 outcome에 두고 반환한다.
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
            1. cancel로 미확정 편집을 정리하고 active=False로 둔다.
            2. 이 UI가 등록한 입력 이벤트를 해제한다. 진행 중 작업의 종료 정리는 해당 작업이 수행한다.
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


def changeLayoutGridDimension(dimension, value, companion=None):
    current = "이번 확정 시점의 공식 layout 조회 결과."
    outcome = "setGrid의 결과 또는 False."
    """
    Args:
    - dimension:
      rows 또는 cols 문자열.
    - value:
      UiCommand가 확정한 유한 숫자.
    - companion:
      같은 UiCommand 판정의 gridRows/gridCols/gridLimits 또는 None.

    Return:
    - outcome:
      기존 setGrid 결과. 거부 False와 원래 예외를 보존한다.

    변경:
    - 성공한 GRID_LAYOUT_CHANGED의 layout·slots. 기존 grid 변경의 선택 정리.

    처리:
        1. dimension이 rows 또는 cols인지 확인한다.
        2. companion이 있으면 이 호출의 current로 사용하고, 생략이면 FastFigureApi.layout["readControls"]()를 한 번 읽는다.
           같은 입력 판정에서 필요한 동반 좌표·한계만 사용하고 보관하지 않는다.
           해당 gridLimits로 완성 값을 제한하고 기존 Backend 정수 검증을 사용한다.
        3. rows이면 value와 현재 gridCols, cols이면 현재 gridRows와 value를 구성한다.
        4. 같은 동기 처리에서 layout.setGrid(rows, cols)의 결과를 outcome에 둔다.
           동기 read부터 명령 진입까지 대기·외부 callback을 삽입하지 않는다.
        5. 성공하면 grid shape 변경의 기존 local selection 정리 규칙만 적용한다. layout 표시는
           반영 후 Application이 호출한 layout()이 담당하므로 이 입력 처리기는 다시 읽지 않는다.
           거부이면 False를 반환하고 예외는 전파한다. 이때 기존 layout과 local selection을 유지한다.
        6. outcome을 반환한다.
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
           setDebugEnabled가 runtime 값을 변경한 뒤 현재 mount의 debugEnabled 표시 함수에 그 값을 전달한다.
           표시값을 다시 읽어 다음 토글을 계산하지 않으며 Project mutation이나 별도 toggle API를 만들지 않는다.
           명시 bool setter를 직접 사용하는 다른 caller의 계약을 바꾸지 않는다. 원래 오류는 caller에 전파한다.
           outcome를 반환한다.
    """
    return outcome


def bindUiDisplay(elements):
    display = "현재 mount의 요소별 표시 함수 딕셔너리."
    """
    Args:
    - elements:
      FastFigureApp에서 구성한 현재 화면 요소와 각 요소의 표시값 설정 함수.

    Return:
    - display:
      아래 처리에 적은 이름과 인수를 가진 표시 함수 딕셔너리. 각 함수는 해당 요소의 표시값을 설정한다.

    변경:
    - 없음.

    처리:
        1. 아래 함수를 구성하여 이름별로 display에 둔다. 조회가 필요한 함수는 현재 표시 중인 요소만 읽는다.
           조회 결과는 해당 요소의 React 표시값에 둔다. 최초 표시에도 같은 조회 절차를 사용한다.
        2. selection(current, csvOptions=None, force=False, selectedSlot 생략 가능):
           current의 원형은 /frontend/interface_fsm/InterfaceStateMachine.readState의 반환값이다.
           selectedSlot 인수가 생략됐으면 selectedSlotId가 None일 때 None을, 그 외에는 slots.readSelected
           결과를 selectedSlot에 둔다. 이미 읽은 Slot 또는 None이 전달되면 다시 읽지 않는다.
           도구 모음·자산/객체 선택 장식·창을 current에 맞춘다. 장식 갱신은 편집기 데이터 조회를 하지 않는다.
           열린 레이블 창의 기준 슬롯이나 캡션 창의 슬롯 본문 대상이 바뀌면 그 창에서 새 대상의 값을 읽는다.
           selectedSlot에서 편집기 표시 identity를 구성한다. Slot이 없으면 None, 있으면
           (id, current.workspace, contentType, ownerId)다. ownerId는 image면 imageId, graph면 chart다.
           이를 현재 mount의 편집기 identity와 비교한다. 최초 표시, force=True 또는 identity가 다르면
           이전 편집기의 입력을 dispose하고 새 종류에 해당하는 입력을 초기화한다.
           graph면 그래프 데이터·레이아웃·팔레트를 각 공식 조회로 표시한다. 전달된 csvOptions가 None이
           아니면 빈 배열도 그대로 사용하고, None일 때만 assets.readList('csv')를 읽는다.
           image면 images.readSettings와 표시 component의 images.readEditor를 읽는다. None이면 편집기를 비운다.
           초기화를 마친 identity를 편집기 수명에만 보관하고 True를 반환한다.
           identity가 같고 force=False면 편집기를 유지하고 False를 반환한다. selection 장식 호출에서는
           기존 선택 context가 바뀐 경우에만 해당 CSV/객체 표시를 갱신하며 새 편집기 조회와 중복하지 않는다.
           assetSelection(current)은 트리의 선택 표시와 현재 CSV 표시를 갱신한다. graphObject(current)는 해당 객체 입력을 갱신한다.
           overlay(name)는 지정된 창을 표시하고 닫힌 창의 미확정 입력을 정리한다.
           lifecycle(value)는 버튼과 입력의 조작 가능 여부를 갱신하고 taskError(error)는 오류를 표시한다.
        3. projectName()은 project.readName을 읽는다. assetTree()는 assets.readTree를 읽고 휴지통이 열려 있으면 assets.readTrash를 읽는다.
           slotConnections()는 slots.readDisplay로 슬롯별 연결 자산 행을 갱신한다.
           csvOptions()는 assets.readList('csv')를 읽어 현재 옵션 표시를 갱신하고 배열을 반환한다.
           반환 배열은 이번 호출의 초기화 인수로만 재사용하며, 다음 조회의 cache나 자산의 원천으로 보관하지 않는다.
           csv(ids)는 그래프 편집기가 열려 있을 때 현재 CSV와 편집 객체가 각각 사용하는 CSV id 중 ids에 있는
           대상만 갱신한다. 현재 CSV의 헤더·행 수, 해당 객체의 열 입력 및 열린 표에 필요한 값을 읽는다.
           열린 표에만 행을 읽고 같은 CSV의 같은 열 정의는 이번 표시에서 한 번만 읽는다.
        4. slot(current,csvOptions,event)는 호출자가 선택 id가 changed.slotIds에 있음을 확인한 뒤 호출한다.
           slots.readSelected를 한 번 읽는다. 2번과 같은 identity가 아니면
           selection(current,csvOptions,selectedSlot=이번 Slot)에 도구 모음 표시까지 맡기고 그 반환값을 반환한다.
           identity가 같으면 이번 Slot을 도구 모음에 표시하고 SLOT_IMAGE_SETTINGS_CHANGED에서만 images.readSettings로 표시 중인
           image의 입력을 갱신하고 False를 반환한다. 이 설정 경로는 이미지 바이트를 다시 읽지 않는다.
           graph(ids,event,operation,removedObjectChartIds,appendedObjectChartIds)는 현재 graph 편집기의
           ownerId가 ids에 없으면 조회 없이 반환한다. CHART_LAYOUT_CHANGED에서는 graphs.readLayout만 읽어
           축·설정·제목을 갱신하고, 이미 표시된 object 목록의 제목 접두부를 그 title로 바꾼 뒤 반환한다.
           그 외에는 graphs.readData로 객체 목록·제목을 갱신한다. CHART_MODEL_REPLACED이면
           graphs.readLayout도 읽는다. event=GRAPH_OBJECTS_REPLACED이고 operation이 graphs.addObject,
           graphs.deleteObject, graphs.moveObject, graphs.setObjectValues, graphs.applyPalette 중 하나이거나,
           event=CHART_MODEL_REPLACED이거나, 현재 ownerId가 removedObjectChartIds 또는
           appendedObjectChartIds에 있으면 graphs.readPalette를 한 번 읽는다.
           image(ids)는 현재 image 편집기의 ownerId가 ids에 있으면 실제 이미지 표시 component에서
           images.readEditor로 갱신한다. image asset의 bytes/MIME 교체는 slot-local 설정을 바꾸지 않는다.
        5. layout()은 layout.readControls를 읽고 열린 미리보기에서만 layout.readState를 읽는다.
           labels(event)는 레이블 설정 및 열린 위치 편집기의 해당 표시를 읽는다.
           captions(event, slotIds)는 캡션 설정 또는 본문을 읽는다. 슬롯 본문은 표시 슬롯 id가 slotIds에 있을 때 읽는다.
           printSettings()는 열린 프린트 창에 print.readSettings를 표시한다.
           palette(value)는 /backend/project_state/activeProject._state.appearance.uiPalette 원형의 공식 읽기 결과를 받아 색상 입력과 theme을 갱신한다.
           zoom(value)는 전달받은 배율을 현재 배율 입력에 표시한다.
        6. display["statusDisplay"]에 StatusDebug의 다음 세 함수를 담은 딕셔너리를 대입한다.
           statusText(text)는 상태 문자열을 표시한다. debugEnabled(enabled)는 토글의 label과 pressed를
           enabled에 맞춰 설정한다. debugLines(lines)는 배열을 줄바꿈으로 연결해 로그를 표시하고,
           로그가 비었거나 lifecycle이 busy이면 저장·지우기 버튼을 비활성화한다.
           lifecycle(value)에서도 현재 표시하는 배열과 새 lifecycle로 같은 버튼 사용 가능 여부를 설정한다.
           세 함수는 renderer가 넘긴 값만 사용하며 프로젝트를 조회하지 않는다.
        7. display를 반환한다.
    """
    return display


def addSelectedGraphObject():
    outcome = "chart 식별·제목·편집 가능 여부 딕셔너리, 미반영 ProjectMutationResult 또는 None."
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
        2. FastFigureApi.graphs.readControls()를 호출하고 반환 record의 currentCsv와 chart를 읽는다.
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
        2. FastFigureApi.graphs.readControls()["chart"]로 그 슬롯이 소유하는 현재 chart를 얻는다.
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
        2. FastFigureApi.graphs.readControls()에서 chart를 얻는다. 이 공식 읽기는 현재 선택 참조로
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
           UI layer는 error를 renderer.debugLog에 전달할 수 있지만 별도 domain rollback 규칙을 만들지 않는다.
           runApplicationLifecycleTask(lifecycle, eventName, task)를 반환한다.
    """
    return outcome


def FastFigureApp():
    uiTree = "MantineProvider의 React 트리."
    display = "bindUiDisplay의 요소별 표시 함수 딕셔너리."
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
    - uiTree, display:
      FastFigureShell을 포함한 MantineProvider 트리와 그 화면의 요소별 표시 함수.

    변경:
    - UI-local component의 표시값과 입력 수신 수명주기.

    처리:
        1. 첫 표시 때 FastFigureApi.appearance.readPalette의 결과를 palette에 둔다.
           이후 palette(value)로 전달받은 색상 값을 같은 표시에 적용한다.
           palette의 표시 값이 달라질 때 아래 규칙으로 theme을 구성한다.
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
           image editor의 입력은 images.readSettings 결과를 표시하고 images.setSettings와 images.insertEmpty를 호출한다.
           실제 이미지 표시가 필요한 component만 images.readEditor로 바이트를 요청한다.
        4. ProjectDataTree의 최초 표시에는 readProjectAssetDisplay의 nodes와 slotRows를 사용한다.
           이후 자산 행은 assetTree(), 슬롯 연결 행은 slotConnections()에서 각각 읽어 표시한다.
           row 선택에는 assets.selectCsv/selectImage/selectDirectory, 이동에는 assets.planMove/move,
           menu에는 createDirectory/delete/emptyTrash/download를 연결한다.
           trash의 CSV/image도 선택 가능하게 표시하고, 이동·복구는 같은 planMove/move로 처리한다.
           slot 연결 drag는 assets.draggableAsset가 승인한 trash 밖 CSV/image에만 허용하여
           assets.connectToSlot에 path·kind·대상 slotId를 전달한다.
        5. project actions에는 project.readName/setName/importFile/exportFile을 연결한다.
           GraphDataEditor는 bindUiDisplay의 selection/graph/csv가 갱신한 currentCsv 메타데이터와 편집 objects를 표시한다.
           CSV 선택 옵션은 selection 또는 csvOptions에서 읽고, component mount/render가 따로 읽지 않는다.
           객체의 열 선택 입력에는 그 객체의 CSV id로
           graphs.readColumns를 호출한다. 변환 데이터의 열은 CSV id에 None을 주고 chart id를 전달한다.
           표 미리보기에 열기·닫기 버튼을 두고, 펼친 상태에서 현재 CSV가 있을 때 그 CSV의 열과
           assets.readPreview(csvId, 0, 30)의 행을 읽는다. 같은 표시에서 두 열 조회의 입력이 같으면 반환 배열을 함께 사용한다.
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
        6. GraphLayoutEditor는 bindUiDisplay의 selection/graph에서 받은 graphs.readLayout 결과를 표시하고
           updateSelectedGraphLayout을 호출한다. GraphPaletteActions는 같은 표시 경로에서 받은
           graphs.readPalette 결과를 표시하고 graphs.applyPalette를 호출한다.
           버튼의 chart id·editable 판정은 graphs.readControls 한 번으로 읽는다.
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
           StatusDebug는 bindUiDisplay의 statusDisplay가 전달한 문자열·토글 상태·로그를 표시한다.
           debug 토글·로그 저장·지우기 클릭은 각각 handleDebugToggle, renderer.saveDebugOutput,
           renderer.clearDebugOutput을 호출한다.
           ReadmeOverlay는 배포 README 내용을 표시한다.
        8. LabelOverlay의 입력은 labels.readSettings를 표시하고 enabled/settings/position/reset/finish 입력을
           labels의 대응 method에 연결한다. pointer 이동의 유효한 position은 같은 setPosition을 호출한다.
           라벨 위치의 기하 표시가 필요한 부분만 labels.readState를 요청한다.
           CaptionOverlay의 본문 편집은 captions.readGlobal과 선택 Slot의 captions.readSlot을 표시하고
           설정 입력은 captions.readSettings를 별도로 사용한다. 기존의
           text/name/nameBold/settings/enabled 입력을 대응 captions method에 연결한다.
           slot caption을 global에 추가하는 명시적 입력은 captions.insertSlotCaptions를 호출한다.
           편집 대상 global/slot은 열린 편집기의 UI-local 값으로 유지한다.
        9. PrintOverlay는 print.readSettings의 값을 표시하고 setSettings/save/capture를 연결한다.
           LayoutOverlay의 입력은 layout.readControls의 grid/style/zoom을 표시한다.
           별도의 미리보기 component만 layout.readState의 visibleSlots와 previewGeometry를 요청한다.
           모든 숫자 입력은 아래 UiCommand 연결을 사용한다.
           행·열의 invoke는 changeLayoutGridDimension(dimension, 확정값, 이번 판정의 grid 동반 값)을 호출한다.
           style은 layout.setStyle, 확대 비율은 layout.setZoom, 100% 초기화는 layout.resetZoom을 호출한다.
        10. LayoutOverlay에서 slot click은 해당 id의 local selection을 toggle한다.
            배경 click·grid shape 변경·overlay close는 selection을 비운다.
            slot click과 merge/split 입력은 먼저 자신의 동작을 처리하고 parent clear 전파를 소비한다.
            merge/split에는 그 시점의 선택 id 배열을 layout.mergeSlots/splitSlots에 전달한다.
        11. 미리보기 창을 열 때, 열린 상태에서 layout()을 호출할 때, 또는 아래의 가로 크기 입력을
            받았을 때 미리보기를 갱신한다. 내부 틀을 담는 외부 표시 영역의 content-box 너비를
            width에 둔다. 아직 측정되지 않았거나 너비가 0 이하이면 width에 None을 둔다.
            이번 width를 창 인스턴스의 previousPreviewWidth에 저장하고 layout.readState(width)를 호출한다.
            readState의 기존 preview 너비 범위·무효 입력 기본값을 유지하고 반환된
            previewGeometry["width"]를 host 너비로 적용한다. 외부 표시 영역이 더 좁으면 가로 스크롤로 본다.
            반환된 gridRows/gridCols/slotStyle, visibleSlots, previewGeometry를 같은 표시 회차에
            renderDashboardFrame에 미리보기 host와 함께 전달하고 반환값을 previewFrame에 둔다.
            이 공통 절차가 grid와 각 슬롯 틀을 만든다. 좌표·local selection·포커스 강조를
            그 슬롯 틀의 장식 영역에 표시하고 slot click을 10번의 동작에 연결한다.
            showBorders가 False이면 각 슬롯의 장식 영역 안쪽 경계에 점선을 표시한다.
            True이면 점선 장식을 지우고 공통 틀의 프로젝트 외곽선을 표시한다.
            local selection·포커스는 점선과 구분되는 안쪽 강조로 표시한다.
            선택·해제·스타일 갱신마다 해당 host의 이전 장식을 정리하고 현재 span·radius로 다시 구성한다.
            미리보기의 장식 테두리·선택 표시는 슬롯 경계와 content 기하 치수를 유지한다.
            창을 열 때 외부 표시 영역 하나에 브라우저 content-box 크기 통지기를 연결한다.
            통지에서 width를 위와 같이 정규화하고 previousPreviewWidth와 같으면 조회 없이 반환한다.
            다르면 이번 width로 갱신한다. renderer가 너비를 적용하는 내부 틀에는 통지기를 연결하지 않는다.
            세로 resize는 Modal local 높이만 바꾼다. 창을 닫거나 unmount할 때 통지기를 해제하고
            previousPreviewWidth와 이 미리보기의 틀·listener를 정리한다.
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
            readCurrent는 해당 기능군의 좁은 공식 query를 한 번 호출하고 target/value/companions/ready를 만든다.
            숫자 확정·증감·버튼 전송의 한 판정은 이 읽기 하나를 내부 호출에 전달한다.
            완료 뒤 표시 복원은 새 판정으로 현재 값을 조회한다. 식별자만 필요한 버튼은 rows·figure를 요청하지 않는다.
            숫자 입력은 슬롯 id·chart id·object index·CSV id·축 키·열린 Modal의 global/slot 대상 중
            해당 필드를 식별하는 값을 사용한다. 선택이 필요 없는 설정은 설정 영역으로 식별한다.
            lifecycle이 ready를 벗어나거나 대상이 바뀌면 미확정 편집을 취소한다.
            파일 선택 완료 뒤에는 기존 helper가 같은 이벤트 시점 대상을 정하고 파일 API를 호출한다.
            collision 선택·접기·Modal 열고 닫기처럼 UI-local 조작은 자신의 UI 상태만 변경한다.
        15. 숫자 필드의 readCurrent·invoke를 다음과 같이 연결한다. current는 해당 판정에서만 소비한다.
            prepare는 prepareNumericInput을 사용하며 아래 자동/빈 값 필드에만 allowEmpty=True를 준다.
            - 이미지 scale·x·y 3개: images.readSettings의 현재 slot settings,
              images.setSettings({field: value}). 대상은 선택 slot id와 image id다.
              /backend/project_efsm/ProjectStateMachine.send의 SLOT_IMAGE_SETTINGS_CHANGED와
              backend.defaults.limits.imageSettings가 범위 원천이다.
            - CSV headerLines 1개: graphs.readControls의 currentCsv.id·headerLines,
              graphs.setHeaderLines(csvId, value). normalizeCsvHeaderLines의 정수화·0..행 수를 유지한다.
            - 오브젝트 lineWidth·markerSize·barOpacity·barLineWidth 4개:
              graphs.readControls의 chart id·선택 index·선택 object 값, graphs.setObject(index, {field: value}).
              /backend/graphs/tracesSingle의 GRAPH_STYLE_LIMITS와 기본값을 유지한다.
            - xBottom·xTop·yLeft·yRight 각각 min·max·tick·divide·titleSize·fontSize·lineWidth 7개:
              graphs.readLayout의 chart id·axes[key][field], updateSelectedGraphLayout의 부분 patch.
              min·max·tick의 빈 값은 빈 문자열을 보내 자동으로 설정한다.
              normalizeAxisSettings의 divide=0→1, 양수 글자 크기·0 이상 선 굵기 규칙을 유지한다.
            - 전역 titleFontSize·legendFontSize 2개:
              graphs.readLayout의 globalSettings, updateSelectedGraphLayout의 부분 patch.
              빈 값은 빈 문자열을 보내 normalizeGlobalSettings의 기본 표시 크기를 사용한다.
            - 레이블 fontSize·x·y 3개: labels.readSettings의 settings,
              fontSize는 labels.setSettings({fontSize: value}),
              x 또는 y는 그때 조회한 나머지 좌표와 labels.setPosition(x, y)를 호출한다.
              backend.defaults.limits.labels와 LABEL_POSITION_CHANGED의 위치 규칙을 유지한다.
              pointer drag의 직접 setPosition은 기존 interaction 경로를 유지한다.
            - 캡션 fontSize·lineHeight 2개: captions.readSettings의 settings와 captions.setSettings.
              backend.defaults.limits.captions를 사용한다. 슬롯 캡션 text 편집은 기존 경로를 유지한다.
            - 프린트 dpi·width·height 3개: print.readSettings와 print.setSettings의 해당 부분 patch.
              height의 빈 값은 {heightMode: auto, height: None}, 숫자는 {heightMode: explicit, height: value}다.
              backend.defaults.limits.export와 EXPORT_SETTINGS_CHANGED의 정수화·범위 규칙을 유지한다.
            - 레이아웃 rows·cols·referenceWidth·gap·outerMargin·radius·aspect·zoom 8개:
              layout.readControls에서 현재 grid·slotStyle·zoom을 읽는다.
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
            lifecycle·선택·창 갱신 함수는 현재 입력의 사용 가능 여부와 대상을 설정한다.
            raw 입력은 해당 UiCommand의 로컬 표시를 갱신한다. 명령 실행 시점의 공식 입력은 UiCommand.readCurrent로 읽는다.
        17. 위 component와 event handler를 FastFigureShell 아래 구성하고
            theme을 적용한 MantineProvider 트리를 uiTree에 둔다. 같은 화면 요소를 bindUiDisplay에 전달하고 결과를 display에 둔다.
        18. uiTree와 display를 반환한다.
    """
    return uiTree, display


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
        1. Sidebar 너비·접힘 처리기는 CSS 적용 뒤 바깥 graphArea의 너비·높이(px)를 읽는다.
           mount에서 관찰한 같은 바깥 영역의 resize 통지도 같은 크기 처리기로 보낸다.
           영역 관찰을 지원하지 않으면 browser window resize 이벤트에서 해당 영역을 측정한다.
           마지막으로 변환한 너비·높이와 같거나 크기가 양수가 아니면 반환한다. 그 외에만
           transformWorkspace()로 workspace-structure 조회와 CSS 변환을 실행하고 그 크기를 기록한다.
           mount 종료 시 관찰 또는 window listener를 해제하고 크기 기록을 비운다.
        2. 스크롤은 브라우저의 native 배치로 처리하며 별도 조회를 실행하지 않는다. 두 경로 모두
           Plotly.react/newPlot/resize·figure/CSV 계산·이미지 재해석을 요청하지 않고
           기존 content와 포커스·선택 장식·bookmark를 유지한다.
           아직 내용이 없는 슬롯을 resize만으로 그리지 않는다. shell을 반환한다.
    """
    return shell
