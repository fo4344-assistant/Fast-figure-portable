"""
Fast Figure Source Script — FastFigureApi boundary and Mantine frontend

하위 구현 검증 원천:
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
    "project": "project metadata와 FFPX project command",
    "slots": "selected slot/runtime selection과 slot-local mutation command",
    "images": "selected slot image read/settings/creation command",
    "assets": "VFS/asset read, planning, import, move, trash, download command",
    "graphs": "selected chart/editor/layout/Plotly/FFSX command",
    "print": "persistent export settings와 target/current-screen export command",
    "captions": "project global caption과 explicit slot-local caption command",
    "labels": "persistent label settings/position command",
    "appearance": "persistent UI palette command",
    "layout": "layout style/grid/runtime zoom/merge/split command",
}

PUBLIC_API_METHODS = {
    "project": {
        "readName": "read; args 없음; activeProject.meta.projectName projection",
        "setName": "mutation; project name candidate를 검증 후 commit; 실패 시 기존 name 유지",
        "importFile": "lifecycle mutation; FFPX -> fully validated ProjectObject candidate -> PROJECT_LOADED",
        "exportFile": "read/export; current validated project snapshot -> FFPX; project mutation 없음",
    },
    "slots": {
        "readSelected": "read; selectedSlotId를 current slot projection으로 resolve",
        "select": "runtime mutation; explicit slot id의 selection toggle/workspace 갱신",
        "setContentType": "mutation; selected/payload slot의 slot-local contentType candidate commit",
        "reset": "mutation; slot-local properties를 defaults로 reset하고 owned chart를 제거",
        "prepareFileDrop": "runtime calculation/mutation; drop target selection과 acceptability만 결정",
        "finishFileDrop": "runtime completion; drag/drop interaction state 정리, domain payload 자체는 import command가 소유",
    },
    "images": {
        "readEditor": "read; selected slot -> image asset + slot-local imageSettings projection",
        "setSettings": "mutation; selected slot.content.imageSettings candidate validation/commit",
        "insertEmpty": "mutation; 새 image asset + selected slot reference candidate를 함께 commit",
    },
    "assets": {
        "readDeletionTarget": "read/calculation; target asset과 collectAssetReferences 결과",
        "delete": "mutation; reference detach + asset removal candidate를 한 번 commit",
        "readTree": "read; current VFS/assets에서 tree projection 계산",
        "isTrashed": "read; canonical path의 trash subtree membership 계산",
        "movable": "read/calculation; fixed/root/selection rule에 따른 move 가능 여부",
        "readTrash": "read; current trash subtree projection",
        "moveOptions": "read/calculation; target directory 후보 계산",
        "planMove": "calculation; current VFS에서 destination/collision/reference count plan",
        "move": "mutation; current state에서 plan을 재검증하고 candidate move commit",
        "createDirectory": "mutation; canonical non-conflicting directory candidate commit",
        "emptyTrash": "mutation; trash references/assets/directories candidate removal commit",
        "draggableAsset": "read/calculation; drag payload로 노출 가능한 asset projection",
        "connectToSlot": "mutation; existing asset -> explicit/selected slot candidate connection",
        "importToDirectory": "lifecycle mutation; batch file candidates -> collision plan -> one commit",
        "importToSlot": "lifecycle mutation; file asset + target slot/chart candidate -> one commit",
        "fileKind": "calculation; filename/MIME에서 지원 slot import kind 판정",
        "importFiles": "lifecycle router; supported files를 directory/slot import contract로 전달",
        "collisionModel": "calculation; current VFS + reserved paths에서 collision model",
        "resolveImportPlan": "calculation; user choice를 concrete path/replace id plan으로 변환",
        "selectDirectory": "runtime mutation; VFS-resolved directory selection",
        "selectCsv": "runtime mutation; VFS-resolved CSV selection",
        "selectImage": "runtime mutation; VFS-resolved image selection",
        "download": "read/export; asset original bytes download, project mutation 없음",
    },
    "graphs": {
        "readData": "read; selected chart objects/CSV/columns projection",
        "readLayout": "read; selected chart title/global/axis projection",
        "readPalette": "read; selected chart object color projection",
        "selectCsv": "runtime mutation; graph editor의 current CSV selection",
        "setHeaderLines": "mutation; referenced CSV headerLines candidate commit",
        "setEditable": "mutation; imported chart editable conversion candidate + 필요 CSV를 한 번 commit",
        "addObject": "mutation; selected chart object candidate append; chart 없으면 owned chart candidate도 생성",
        "moveObject": "mutation; objects 순서 candidate commit",
        "selectObject": "runtime mutation; valid object index selection",
        "setObjectValues": "mutation; one graph object normalized candidate commit",
        "deleteObject": "mutation; object 제거; 마지막 object 제거도 empty chart로 허용",
        "updateLayout": "mutation; chart title/global/axis candidate validation/commit",
        "applyPalette": "mutation; graph object color candidate commit",
        "defaultColors": "read; immutable default color sequence copy",
        "hasSelectedSlot": "read; current selected slot 존재 여부",
        "importFile": "lifecycle mutation; FFSX 또는 Plotly candidate -> target slot owning chart commit",
        "exportFfsx": "read/export; selected graph slot + referenced CSV snapshot -> FFSX",
        "exportPlotlyJson": "read/export; selected chart semantic figure -> Plotly JSON",
    },
    "print": {
        "readSettings": "read; activeProject.export persistent settings projection",
        "setSettings": "mutation; width/heightMode/height/dpi/format candidate validation/commit",
        "save": "export; persistent target settings snapshot으로 raster export, project mutation 없음",
        "capture": "export; current-screen one-shot capture, persistent target width/height mutation 없음",
    },
    "captions": {
        "readGlobal": "read; project-level global caption projection",
        "readSlot": "read; explicit slot id의 slot.caption projection",
        "setEnabled": "mutation; global caption enabled project property commit",
        "setGlobalText": "mutation; global caption text만 commit",
        "setSlotText": "mutation; explicit slot id의 slot.caption만 commit",
        "insertSlotCaptions": "mutation; slot.caption text projection을 global caption text에 명시적으로 삽입",
        "setName": "mutation; global caption name commit",
        "setNameBold": "mutation; global caption nameBold commit",
        "setSettings": "mutation; global/shared caption presentation settings candidate commit",
    },
    "labels": {
        "readState": "read; persistent label settings + current slot reference geometry projection",
        "setEnabled": "mutation; label enabled project property commit",
        "setSettings": "mutation; label format/order/font candidate validation/commit",
        "setPosition": "mutation; authoritative x/y를 continuous edit path로 commit",
        "finishPositionInteraction": "runtime notification; x/y의 두 번째 commit을 만들지 않음",
        "resetPosition": "mutation; authoritative label x/y를 default origin으로 commit",
    },
    "appearance": {
        "readPalette": "read; persistent UI palette projection",
        "setPalette": "mutation; normalized palette candidate commit",
        "resetPalette": "mutation; default palette candidate commit",
    },
    "layout": {
        "readState": "read; layout/style/visible slots/logical preview geometry projection",
        "setStyle": "mutation; slotStyle candidate validation/commit",
        "setGrid": "mutation; safe resize candidate만 commit; implicit reflow 금지",
        "setZoom": "runtime mutation; dashboard zoom intent only",
        "commitZoom": "runtime notification; persistent layout state의 두 번째 copy를 만들지 않음",
        "setZoomLocked": "runtime mutation; session zoom lock",
        "resetZoom": "runtime mutation; session zoom default",
        "mergeSlots": "mutation; one non-default slot-local payload만 anchor로 원자적 이동",
        "splitSlots": "mutation; anchor local payload 유지 + restored slots local defaults",
    },
}

LOWER_LAYER_API_REPLACEMENTS = {
    "print.readDefaults": "authoritative API에서는 print.readSettings로 교체한다.",
    "captions.readState": "global/slot owner가 다르므로 readGlobal/readSlot로 분리한다.",
    "captions.setSlotMode": "persistent project mutation이 아니므로 authoritative domain API에서 제거한다.",
    "captions.setText": "owner가 모호하므로 setGlobalText/setSlotText로 분리한다.",
    "labels.previewPosition": "setPosition과 같은 authority를 바꾸는 중복 surface라 제거한다.",
    "labels.commitPosition": "position의 두 번째 commit 의미를 제거하고 finishPositionInteraction으로 대체한다.",
}


API_BOUNDARY_RULE = (
    "Mantine frontend는 activeProject, projectVfs, getChart, getProjectCsv 같은 domain 구현을 "
    "직접 일반 변경 경계로 사용하지 않는다. persistent/domain mutation은 PUBLIC_API_METHODS의 command 또는 "
    "명시된 appFSM runtime event를 사용한다. UI-local editor target, modal draft, pointer state는 public domain API가 아니다."
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
    "caption editor target": (
        "global caption 또는 selected slot caption 중 현재 UI가 노출하는 target. "
        "project state에 slotMode로 저장하지 않는다."
    ),
    "sidebar geometry": "현재 session의 navbar width/collapsed/drag state",
    "pointer drag": "label/layout pointer interaction의 component-local state",
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
