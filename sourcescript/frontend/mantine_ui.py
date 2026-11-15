"""
Fast Figure Source Script — Frontend / mantine-ui

하위 구현 검증 자료: ../../fast-figure.js, ../../fast-figure-ui.js, ../../Fast-figure.html.
Python 문법으로 작성한 구현 명세다.
"""

from math import isnan
from sourcescript.application.public_api import FastFigureApi
from sourcescript.application.adapter import appFSM, dispatchInterfaceEvent, runLifecycleTask as runApplicationLifecycleTask




UI_LOCAL_STATE = {'asset collision': 'Modal이 열려 있는 동안의 collision model과 Promise resolver',
 'confirmations': 'slot reset, asset delete, move/trash confirmation target',
 'new folder': 'Modal input 중인 folder name draft',
 'palette': '사용자가 apply하기 전 ColorInput draft',
 'layout selection': 'layout Modal 안에서 merge/split 대상으로 선택한 slot id set',
 'print inputs': 'width/height/dpi/format form draft',
 'caption editor target': 'global 또는 선택 slot인 자막 편집 대상.',
 'sidebar geometry': '현재 session의 navbar width/collapsed/drag state',
 'pointer drag': 'label/overlay resize 같은 pointer interaction의 component-local state',
 'settings overlay height': 'opened settings overlay lifetime 동안만 유지되는 component-local height projection'}





























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


def changeLayoutGridDimension(dimension, value):
    outcome = "layout.readState 딕셔너리 또는 False."
    current = "공식 layout 조회 결과 딕셔너리."
    """
    Args:
    - dimension:
      rows 또는 cols 문자열.

    - value:
      편집 중인 행 또는 열 입력. 숫자·문자열 또는 빈 입력이다.

    Return:
    - outcome:
      layout["readState"] 딕셔너리 또는 False.
      공식 setGrid의 결과 또는 원래 실패

    변경:
    - 성공한 GRID_LAYOUT_CHANGED의 프로젝트 layout·slots와 UI의 layout selection.

    처리:
        layout 행/열 입력 이벤트의 처리 절차. dimension은 rows 또는 cols이며 그 외는 입력 오류다.
        1. 이벤트 시점에 FastFigureApi.layout["readState"]()의 반환값을 current에 둔다.
           gridRows/gridCols와 gridLimits를 이 결과에서 읽는다. companion과 fallback도 이 결과를 사용한다.
        2. 비어 있거나 숫자로 변환할 수 없거나 non-finite인 편집 입력은 같은 read의 해당 dimension을 유지한다.
           유효 숫자는 같은 layout 조회의 gridLimits에서 해당 gridRows 또는 gridCols 범위로 제한한다. 정수 여부 등 최종 유효성은 기존 Backend 검증이 담당한다.
        3. rows 편집이면 새 rows와 current gridCols, cols 편집이면 current gridRows와 새 cols를 구성한다.
        4. 이 read→입력 구성→FastFigureApi.layout["setGrid"](rows, cols)는 await/외부 callback/다른 project command 없이
           같은 동기 입력 처리에서 연속 실행한다. 별도 snapshot/session에 보관했다가 나중에 command로 보내지 않는다.
           Application dispatch와 Backend candidate 계산/검증도 이 경로에서는 동기이며 대기 중 project 변경이 개입하지 않는다.
           setGrid의 명시 전체 크기 계약과 Backend의 current-source 재확인·재계산·한 번 commit은 그대로 유지한다.
        5. setter의 거부 False와 원래 예외를 그대로 처리하며 성공처럼 표시하거나 별도 resize/commit을 하지 않는다.
           grid shape 변경과 overlay close의 local selection clear는 기존 interaction 규칙대로 수행한다.
           outcome를 반환한다.
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

        2. Button·ActionIcon·Input 크기와 Modal의 centered/Escape/outside-click 기본값을
           theme에 둔다. Layout·Label·Caption·Print Modal에 공통 최대 너비를 적용한다.
           이 너비는 Mantine의 최대 size token보다 넓게 정하며 구체 CSS 표현은 source code에서 정한다.
           네 Modal의 하단 resize 입력은 각각 열린 Modal의 UI-local 높이를 갱신한다.
           README Modal에는 해당 resize 입력을 붙이지 않는다.
        3. useProjectAssetImportCollision의 결과를 choosePlan에 둔다.
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
        6. GraphLayoutEditor는 graphs.readLayout을 표시하고 updateSelectedGraphLayout을 호출한다.
           GraphPaletteActions는 graphs.readPalette를 표시하고 graphs.applyPalette를 호출한다.
           GraphFileActions는 importSelectedSlotFile·setSelectedGraphEditable와
           graphs.exportFfsx/exportPlotlyJson을 연결한다.
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
           행·열 입력은 changeLayoutGridDimension, style은 layout.setStyle,
           zoom/lock/reset은 layout의 해당 session API를 호출한다.
        10. LayoutOverlay에서 slot click은 해당 id의 local selection을 toggle한다.
            배경 click·grid shape 변경·overlay close는 selection을 비운다.
            slot click과 merge/split 입력은 먼저 자신의 동작을 처리하고 parent clear 전파를 소비한다.
            merge/split에는 그 시점의 선택 id 배열을 layout.mergeSlots/splitSlots에 전달한다.
        11. preview의 실제 rendered width를 한 번 읽어 layout.readState에 전달한다.
            같은 width에서 aspect·height·gap·margin·radius를 계산한 preview를 표시한다.
            Modal/viewport 폭이 달라지면 다시 계산하고, 세로 resize는 Modal local 높이만 바꾼다.
        12. DashboardFileDrop이 수신 가능한 동안 dashboard의 논리적 수신 경로를 하나 유지한다.
            rerender·callback 교체 사이에도 유효한 drop은 정확히 한 import 시도로 전달한다.
            unmount 또는 수신 불가 lifecycle/target 상태가 되면 수신을 해제한다.
        13. 외부 file drop에서 DOM 대상 slotId를 구하고 slots.prepareFileDrop을 호출한다.
            준비가 승인되면 assets.importToSlot(file, slotId, choosePlan)을 한 번 호출한다.
            importing lifecycle은 public API의 작업 경로를 사용한다.
            choosePlan은 useProjectAssetImportCollision의 명시적 선택 또는 취소 결과를 전달한다.
            준비 후의 성공·실패·취소에서 slots.finishFileDrop으로 drag/hover 상태를 정리한다.
        14. 위 component와 event handler를 FastFigureShell 아래 구성하고
            theme을 적용한 MantineProvider 트리를 uiTree에 둔다.
        15. uiTree를 반환한다.
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
        1. sidebar resize는 renderer geometry에 반영하고 plot resize를 요청한다.
           domain/project 값을 별도 local store로 복제하지 않는다.
           shell를 반환한다.
    """
    return shell
