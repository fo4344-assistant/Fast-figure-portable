"""
Fast Figure Source Script — FastFigureApi boundary and Mantine frontend

현재 구현 원천:
- ../fast-figure.js
  window.FastFigureApi.
- ../fast-figure-ui.js
  FastFigureApp, FastFigureShell, editor/action components,
  Mantine theme and UI-local state.

참조 Source Script:
- project_state.py
- application_fsm.py
- assets_files.py
- graphs.py
- layout_annotations_export.py
"""

from project_state import activeProject
from application_fsm import appFSM

FastFigureApi = {
    "project": "project name read/set과 FFPX import/export command",
    "slots": "selected slot read, selection toggle, type/reset, dashboard file-drop preparation",
    "images": "selected image read/settings mutation/empty image insertion",
    "assets": "VFS tree read, collision planning, import, move, trash, delete, select, download",
    "graphs": "graph data/layout/palette read와 object/layout/file mutation command",
    "print": "print/export defaults, save, capture",
    "captions": "caption state read와 visibility/mode/text/name/settings mutation",
    "labels": "label state read와 visibility/settings/position mutation",
    "appearance": "persistent UI palette read/set/reset",
    "layout": "layout read, style/grid/zoom, merge/split command",
}

API_BOUNDARY_RULE = (
    "Mantine frontend는 activeProject, projectVfs, getChart, getProjectCsv 같은 domain 구현을 "
    "직접 일반 변경 경계로 사용하지 않는다. 영속/기능 변경은 FastFigureApi command 또는 "
    "overlay/lifecycle 같은 appFSM UI event를 사용한다."
)

READ_RULE = (
    "FastFigureApi read operation은 현재 Source of Truth에서 필요한 projection을 매번 계산한다. "
    "React component가 받은 projection을 다른 subsystem의 장기 read authority로 배포하지 않는다."
)

UI_LOCAL_STATE = {
    "asset collision": "Modal이 열려 있는 동안의 collision model과 Promise resolver",
    "confirmations": "slot reset, asset delete, move/trash confirmation target",
    "new folder": "Modal input 중인 folder name draft",
    "palette": "사용자가 apply하기 전 ColorInput draft",
    "layout selection": "layout Modal 안에서 merge/split 대상으로 선택한 slot id set",
    "print inputs": "width/height/dpi/format form draft",
    "sidebar geometry": "현재 session의 navbar width/collapsed/drag state",
    "pointer drag": "label/layout preview pointer interaction의 component-local state",
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

MANTINE_THEME_RULE = (
    "generic Button, ActionIcon, Input 크기와 Modal centered/Escape/outside-click 기본값은 "
    "fastFigureTheme에서 공통 정의한다. renderer surface CSS와 generic UI lifecycle을 분리한다."
)


def subscribeAppState(onStoreChange):
    """
    Return:
    - unsubscribe:
      appFSM subscriber 제거 함수.

    변경:
    - appFSM state를 변경하지 않는다.

    처리:
    React useSyncExternalStore가 appFSM.state revision/transition을 직접 구독한다.
    별도 React project store를 만들지 않는다.
    """
    unsubscribe = "appFSM listener 해제 함수"
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
    core collisionModel을 먼저 계산한다.
    available이면 UI 없이 core resolveImportPlan을 호출한다.
    user choice가 필요하면 Modal lifetime 동안 resolver를 보유하고
    choice를 받은 뒤 core resolveImportPlan으로 최종 plan을 계산한다.
    """
    return "component-local collision chooser와 Modal"


def runLifecycleTask(lifecycle, eventName, task):
    """
    Return:
    - task result 또는 UI error 처리 결과.

    변경:
    - appFSM lifecycle.
    - task가 호출하는 공식 command에 따른 domain state.

    처리:
    lifecycle sequencing은 appFSM.run에 위임한다.
    UI layer는 error를 debug telemetry에 기록하되 별도 domain rollback 규칙을 만들지 않는다.
    """
    return "lifecycle task 결과"


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
