"""
Fast Figure Source Script — Frontend / mantine-ui

하위 구현 검증 자료: ../../fast-figure.js, ../../fast-figure-ui.js, ../../Fast-figure.html.
Python 표기의 구현 명세이며 application runtime을 실행하는 모듈이 아니다.
"""

from sourcescript.frontend.interface_fsm import interfaceFSM
from sourcescript.application.public_api import FastFigureApi
from sourcescript.application.adapter import runLifecycleTask as runApplicationLifecycleTask

SLOT_CAPTION_UI_RULE = (
    "slot caption 추가/편집 UI는 selected slot의 slot.caption을 읽고 쓸 수 있게 노출하는 기능이다. "
    "slot caption을 global caption에 '추가'하는 command는 현재 slot captions를 text로 계산해 project-level global caption text에 명시적으로 삽입한다. "
    "이 UI 동작 때문에 slot caption을 project-level collection이나 persistent slotMode로 복제하지 않는다."
)


UI_LOCAL_STATE = {
    "asset collision": "Modal이 열려 있는 동안의 collision model과 Promise resolver",
    "confirmations": "slot reset, asset delete, move/trash confirmation target",
    "new folder": "Modal input 중인 folder name draft",
    "palette": "사용자가 apply하기 전 ColorInput draft",
    "layout selection": "layout Modal 안에서 merge/split 대상으로 선택한 slot id set",
    "print inputs": "width/height/dpi/format form draft",
    "caption editor target": (
        "global caption 또는 selected slot caption 중 현재 UI가 노출하는 target. "
        "project state에 slotMode로 저장하지 않는다."
    ),
    "sidebar geometry": "현재 session의 navbar width/collapsed/drag state",
    "pointer drag": "label/overlay resize 같은 pointer interaction의 component-local state",
    "settings overlay height": "opened settings overlay lifetime 동안만 유지되는 component-local height projection",
}


UI_LOCAL_STATE_RULE = (
    "UI local state는 입력 draft, Modal lifetime, pointer interaction처럼 component 범위에서만 사용한다. "
    "apply/commit이 필요한 값은 공식 mutation API로 보내고 project read 원천으로 승격하지 않는다."
)


MANTINE_COMPONENT_OWNERSHIP = {
    "FastFigureToolbar": "overlay toggle과 selected target 표시",
    "FastFigureDataActions": "asset import와 slot reset/delete action",
    "FastFigureImageEditor": "selected image preview/settings",
    "FastFigureProjectDataTree": "VFS tree display/selection/move/drop/menu",
    "FastFigureProjectActions": "project name과 FFPX import/export",
    "FastFigureGraphDataEditor": "CSV/header/graph object editing",
    "FastFigureGraphLayoutEditor": "chart title/global/axis settings",
    "FastFigureGraphPaletteActions": "graph object colors",
    "FastFigureGraphFileActions": "FFSX/Plotly import/export/editable toggle",
    "FastFigurePaletteActions": "persistent UI palette edit/apply/reset",
    "FastFigureStatusDebug": "status/debug telemetry display와 log action",
    "FastFigureReadmeOverlay": "README Modal",
    "FastFigureLabelOverlay": "label settings와 position interaction",
    "FastFigureCaptionOverlay": "caption settings/text interaction",
    "FastFigurePrintOverlay": "raster export form와 command",
    "FastFigureLayoutOverlay": "grid/style/zoom/merge/split interaction",
    "FastFigureDashboardFileDrop": "dashboard external file drop와 collision Modal 연결",
    "FastFigureShell": "Mantine AppShell, navbar resize/collapse, component composition",
}


DASHBOARD_DROP_FLOW = (
    "external file drop은 FastFigureDashboardFileDrop이 DOM target slotId를 얻고 slots.prepareFileDrop으로 "
    "target validity/runtime selection만 확정한 뒤 lifecycle 안에서 assets.importToSlot(file, slotId, choosePlan)을 호출한다. "
    "importToSlot의 Backend ASSETS_IMPORTED command만 asset/chart/image의 persistent candidate를 만들고 검증·commit한다. "
    "collision Modal의 resolver는 Application에서 완료하고 Backend에는 명시적 choice 값만 전달한다. "
    "finally에서 slots.finishFileDrop은 drag runtime state만 정리한다. "
    "project tree의 기존 asset drop은 assets.connectToSlot(path, kind, slotId)의 별도 explicit connection 경로를 사용한다."
)


DASHBOARD_DROP_LIFETIME_RULE = (
    "FastFigureDashboardFileDrop가 mounted이고 external file drop을 받을 수 있는 UI 상태인 동안 dashboard의 "
    "drop 수신 경로는 논리적으로 연속 1개여야 한다. ordinary frontend rerender, local state update, callback 교체는 "
    "유효한 한 번의 drop event를 listener 교체 공백 때문에 잃게 하거나 둘 이상의 import attempt로 중복 전달해서는 안 된다. "
    "component mount/unmount 또는 명시적으로 drop을 허용하지 않는 lifecycle/target 조건만 수신 가능성의 경계를 만든다. "
    "stable callback, delegated listener, framework event handler 등 이를 만족하는 구체 수명 관리 방식은 Source Code가 선택한다."
)


MANTINE_THEME_RULE = (
    "generic Button, ActionIcon, Input 크기와 Modal centered/Escape/outside-click 기본값은 "
    "fastFigureTheme에서 공통 정의한다. renderer surface CSS와 generic UI lifecycle을 분리한다. "
    "FastFigureLayoutOverlay, FastFigureLabelOverlay, FastFigureCaptionOverlay, FastFigurePrintOverlay의 outer Modal width는 "
    "각 component가 독립적으로 lg/xl/px 값을 소유하지 않고 하나의 Fast Figure 공통 maximum-size definition을 사용한다. "
    "그 공통 maximum은 현재 Mantine maximum size token보다 더 넓게 정의한다. concrete CSS length 또는 Mantine 구현 표현은 Source Code가 선택한다. "
    "네 settings overlay는 공통된 하단 세로 resize interaction을 제공하며 resize는 해당 overlay의 UI-local height만 변경하고 project/domain state를 변경하지 않는다. "
    "FastFigureReadmeOverlay처럼 목적이 다른 Modal은 이 네 설정 overlay의 공통 maximum 또는 resize interaction을 자동 상속하는 대상으로 간주하지 않는다."
)


LAYOUT_SELECTION_INTERACTION_RULE = (
    "Layout overlay의 slot 선택 집합은 해당 Modal lifetime 동안만 존재하는 UI-local state다. "
    "slot surface click은 해당 slot id를 toggle한다. preview grid의 slot 이외 배경과 preview 바깥 "
    "Layout Modal의 비-slot content 배경 click은 selection을 clear한다. "
    "slot click과 selection을 소비하는 merge/split control은 같은 interaction에서 parent background clear에 의해 "
    "선행 또는 상쇄되지 않아야 한다. grid shape 변경과 overlay close는 selection을 clear한다. "
    "이 선택/해제는 FFPX project object, layout persistent state, slot persistent state를 변경하지 않는다."
)


LAYOUT_PREVIEW_RULE = (
    "FastFigureLayoutOverlay의 preview는 layout slotStyle.aspect를 보존한다. 실제 rendered preview width 하나를 geometry 계산 기준으로 사용하고 "
    "preview height와 width-dependent gap/outerMargin/radius를 같은 기준에서 계산한다. overlay height resize는 preview width를 직접 변경하는 command가 아니며 "
    "preview 아래에 별도 preview-size drag 의미를 두지 않는다. viewport 또는 Modal content width 때문에 rendered width가 달라지면 height와 나머지 geometry도 "
    "같은 rendered width에서 다시 계산한다."
)


PROJECT_TREE_INTERACTION_RULE = (
    "FastFigureProjectDataTree는 current VFS/assets를 읽어 만든 tree projection이며 별도 project authority를 소유하지 않는다. "
    "trash subtree의 CSV/image도 일반 tree row로 선택할 수 있고, trash membership 자체를 이유로 row를 disabled 처리하지 않는다. "
    "fixed directory가 아닌 project node는 current VFS precondition을 만족하면 tree move source가 될 수 있으며 trash descendant도 일반 directory로 이동해 복구할 수 있다. "
    "tree move와 slot connection은 서로 다른 허용 조건을 사용한다. normal CSV/image는 explicit asset-to-slot connection source가 될 수 있지만 "
    "trash CSV/image와 directory는 slot connection source가 아니다. tree move와 menu move는 같은 planMove/move authority로 수렴하고, "
    "selection이나 drag 시작 자체가 slot connection 또는 original-location restore를 암묵적으로 수행하지 않는다."
)


EMPTY_CSV_UI_RULE = (
    "graph slot의 데이터 불러오기 영역에는 image slot의 빈 이미지 삽입 control과 같은 기능 위치에 빈 CSV 삽입 control을 제공한다. "
    "command는 assets.createEmptyCsv를 호출하여 일반 project CSV asset을 하나 생성하고 그 CSV를 현재 asset/graph CSV selection으로 선택한다. "
    "이 command 자체는 chart 또는 graph object를 만들지 않는다. 사용자가 그 CSV로 graph object를 추가할 때는 기존 graphs.addObject와 "
    "SLOT_DATA_CONNECTED/GRAPH_OBJECTS_REPLACED 경로를 그대로 사용한다. protected/default CSV 또는 별도 빈-그래프 mutation path를 만들지 않는다."
)


def subscribeAppState(onStoreChange):
    """
    Return:
    - unsubscribe:
      interfaceFSM subscriber 제거 함수.

    변경:
    - interfaceFSM state를 변경하지 않는다.

    처리:
    React useSyncExternalStore가 interfaceFSM.state revision/transition을 직접 구독한다.
    별도 React project store를 만들지 않는다.
    """
    unsubscribe = "interfaceFSM listener 해제 함수"
    return unsubscribe


def useProjectAssetImportCollision():
    """
    Return:
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
    """
    return "component-local collision chooser와 Modal"


def runLifecycleTask(lifecycle, eventName, task):
    """
    Return:
    - task result 또는 UI error 처리 결과.

    변경:
    - Application boundary가 전달하는 Frontend lifecycle state.
    - task가 호출하는 공식 Backend command에 따른 domain state.

    처리:
    Mantine Frontend는 task callback을 interfaceFSM에 직접 넘기지 않고 runApplicationLifecycleTask에 위임한다.
    Application boundary가 LIFECYCLE_START -> task -> COMPLETE/FAILED 순서를 소유한다.
    UI layer는 error를 debug telemetry에 기록할 수 있지만 별도 domain rollback 규칙을 만들지 않는다.
    """
    return runApplicationLifecycleTask(lifecycle, eventName, task)


def FastFigureApp():
    """
    Return:
    - uiTree:
      MantineProvider 아래 FastFigureShell.

    변경:
    - project state를 render 자체에서 변경하지 않는다.

    처리:
    persistent appearance palette를 FastFigureApi에서 읽어 Mantine CSS variable로 투영한다.
    UI color luminance에서 primary contrast text를 계산한다.
    FastFigureShell을 하나의 기존 React root에 render한다.
    """
    uiTree = "Fast Figure Mantine application tree"
    return uiTree


def FastFigureShell():
    """
    Return:
    - shell:
      header/navbar/main과 overlay component를 포함한 AppShell.

    변경:
    - navbar width/collapsed 같은 session-local UI state.
    - renderer host layout CSS variable.

    처리:
    sidebar resize는 renderer geometry에 반영하고 plot resize를 요청한다.
    domain/project 값을 별도 local store로 복제하지 않는다.
    """
    shell = "Mantine AppShell tree"
    return shell
