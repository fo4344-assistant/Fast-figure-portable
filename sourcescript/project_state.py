"""
Fast Figure Source Script — authoritative project state and references

하위 구현 검증 원천:
- ../fast-figure.js
  createProjectState, ProjectObject, ProjectObjectRegistry,
  normalizeSlotContent, validateProjectObjectState, projectVfs,
  getProjectCsv/getProjectImage/getChart/slotAt.
"""

SLOT_STYLE_DEFAULTS = {
    "referenceWidth": 1200,
    "gap": 0,
    "outerMargin": 0,
    "radius": 0,
    "aspect": 1.618,
    "showBorders": True,
}

PROJECT_OBJECT_PATHS = {
    "project": "meta project information의 공식 read path",
    "layout": "grid와 slotStyle의 공식 read path",
    "labels": "label annotation state의 공식 read path",
    "captions": "project-level global caption state의 공식 read path",
    "data": "CSV asset collection의 공식 read path",
    "images": "image asset collection의 공식 read path",
    "files": "virtual directory collection의 공식 read path",
    "charts": "chart collection의 공식 read path",
    "slots": "slot collection의 공식 read path",
    "sequences": "CSV/image/chart next-id sequence의 공식 read path",
    "appearance": "persistent UI palette의 공식 read path",
    "export": "persistent raster export settings의 공식 read path",
}

projectState = {
    "kind": "Fast Figure project object schema 식별자",
    "meta": {
        "projectName": "사용자가 지정한 프로젝트 이름",
        "appBuild": "이 project state를 생성/저장한 application build 표식",
    },
    "layout": {
        "gridRows": "1..8 범위의 grid 행 수",
        "gridCols": "1..8 범위의 grid 열 수",
        "slotStyle": {
            "referenceWidth": "dashboard 기준 폭; 현재 허용 범위 100..20000",
            "gap": "slot 사이 기준 간격; 현재 허용 범위 0..2000",
            "outerMargin": "dashboard 기준 바깥 여백; 현재 허용 범위 0..5000, 새 project 기본값 0",
            "radius": "slot 기준 모서리 반경; 현재 허용 범위 0..2000",
            "aspect": "dashboard 종횡비; 현재 허용 범위 0.1..10",
            "showBorders": "slot 외곽선 표시 여부",
        },
    },
    "annotations": {
        "labels": {
            "enabled": "slot label 표시 여부",
            "settings": "label format/order/font/position 설정",
        },
        "captions": {
            "enabled": "global caption 표시 여부",
            "text": "global caption의 앞쪽 본문",
            "afterText": "global caption의 뒤쪽 본문",
            "name": "global caption 이름",
            "nameBold": "global caption 이름 굵게 표시 여부",
            "settings": "global caption의 공통 font/size/line-height 설정",
        },
    },
    "assets": {
        "csvFiles": "프로젝트 CSV asset의 authoritative collection",
        "images": "프로젝트 image asset의 authoritative collection",
    },
    "fileSystem": {
        "directories": (
            "project VFS directory 목록. 현재 고정 root는 "
            "/assets, /assets/csv, /assets/images, /assets/trash"
        ),
    },
    "charts": "프로젝트 chart model의 authoritative collection",
    "slots": "dashboard slot의 authoritative collection",
    "nextId": {
        "csv": "새 CSV에 사용할 다음 정수 id",
        "image": "새 image에 사용할 다음 정수 id",
        "chart": "새 chart에 사용할 다음 정수 id",
    },
    "appearance": {
        "uiPalette": "프로젝트에 영속되는 Fast Figure UI 색상 palette",
    },
    "export": {
        "width": "target raster width; 허용 범위 100..20000",
        "heightMode": "auto 또는 explicit",
        "height": "heightMode가 explicit일 때 target raster height; 허용 범위 100..20000",
        "dpi": "raster metadata DPI; 허용 범위 36..1200",
        "format": "png 또는 jpeg",
    },
}

csvAsset = {
    "id": "project 안에서 유일한 양의 정수 CSV id",
    "name": "VFS file name",
    "directory": "projectVfs의 존재하는 directory path",
    "rows": "파싱된 2차원 data table",
    "bytesBase64": "원본 asset bytes의 base64 표현",
    "mime": "원본 또는 정규화된 MIME",
    "headerLines": "table 선두에서 header로 취급할 행 수",
}

imageAsset = {
    "id": "project 안에서 유일한 양의 정수 image id",
    "name": "VFS file name",
    "directory": "projectVfs의 존재하는 directory path",
    "mime": "image bytes MIME",
    "bytesBase64": "image bytes의 base64 표현",
}

slot = {
    "id": "project slot collection 안에서 유일한 정수 id",
    "row": "1-based grid row",
    "col": "1-based grid column",
    "rowSpan": "slot이 차지하는 행 수",
    "colSpan": "slot이 차지하는 열 수",
    "hidden": "다른 merged slot에 포함되어 직접 표시되지 않는지 여부",
    "content": {
        "chart": "activeProject.charts의 chart id 또는 없음",
        "imageId": "activeProject.images의 image id 또는 없음",
        "contentType": "graph 또는 image",
        "imageSettings": {
            "fit": "contain, cover, manual 중 하나",
            "scale": "manual image scale percent",
            "x": "manual image center x percent",
            "y": "manual image center y percent",
        },
    },
    "caption": (
        "이 slot object에 귀속된 slot-local caption text 또는 없음. "
        "UI에서 slot caption을 노출하거나 global caption text에 삽입할 때 읽는 authoritative 값이다. "
        "UI placeholder 문자열은 authoritative caption 값으로 저장하지 않는다."
    ),
}

SLOT_LOCAL_PROPERTY_RULE = (
    "특정 slot에만 적용되는 영속 값은 그 slot object의 하위 속성으로 둔다. "
    "chart/image/contentType, image display settings, slot caption은 의미가 서로 달라도 같은 slot object에 귀속된 local state다. "
    "GUI layout에서 slot object를 다른 위치로 이동·교환하면 이 local state는 slot object 단위로 함께 이동한다. "
    "global caption처럼 figure 전체에 적용되는 값만 project-level property로 둔다."
)

SLOT_LOCAL_DEFAULTS = {
    "chart": None,
    "imageId": None,
    "contentType": "graph",
    "imageSettings": {
        "fit": "contain",
        "scale": 100,
        "x": 50,
        "y": 50,
    },
    "caption": None,
}

SLOT_LOCAL_DEFAULT_RULE = (
    "slot의 local state가 비어 있는지/보존해야 하는지를 판단할 때 개별 field를 다시 나열하지 않고 "
    "SLOT_LOCAL_DEFAULTS 전체와 비교한다. 새로운 slot-local property가 추가되면 이 default 구조와 "
    "slotHasNonDefaultLocalState 판정에 함께 포함되어야 한다."
)

SLOT_REPRESENTATION_RULE = (
    "하위 구현이 compatibility를 위해 slot-local 값을 flat 또는 nested representation으로 표현할 수는 있지만 "
    "각 값의 authoritative owner는 slot object 하나다. 같은 slot-local 의미를 별도 project property나 UI mode state에 복제하지 않는다."
)

EMPTY_GRAPH_RULE = (
    "editable chart는 editor.objects가 빈 배열인 상태를 직접 표현할 수 있다. "
    "빈 graph를 표현하기 위한 보호 CSV 또는 가짜 graph object를 만들지 않는다."
)

CHART_OWNERSHIP_RULE = (
    "존재하는 chart는 정확히 하나의 slot이 소유한다. slot은 chart를 0개 또는 1개 참조할 수 있고 "
    "두 slot이 같은 chart를 공유하거나 아무 slot도 chart를 참조하지 않는 상태는 valid project가 아니다."
)

SLOT_CAPTION_PLACEHOLDER_RULE = (
    "caption이 설정되지 않은 slot의 authoritative 값은 null 또는 empty다. "
    "예시/안내 문자열은 UI projection에서만 생성하며 project state에 자동 기록하지 않는다."
)

LEGACY_PROJECT_FIELDS = {
    "layout.layoutMapWidth": (
        "현재 v3 하위 구현이 기록할 수 있으나 figure 의미의 producer/consumer가 없는 legacy field. "
        "import에서는 존재해도 무시할 수 있고 새 authoritative project state에는 보존하지 않는다."
    ),
}

REFERENCE_RELATIONS = {
    "slot.chart": (
        "activeProject.charts에서 같은 chart id를 resolve해야 하며 "
        "각 chart id는 정확히 하나의 slot에서만 나타나야 한다."
    ),
    "slot.imageId": "activeProject.images에서 같은 image id를 resolve해야 한다.",
    "chart.editor.objects[].csvId": "activeProject.csvFiles에서 같은 CSV id를 resolve해야 한다.",
    "asset path": "asset.directory와 asset.name을 projectVfs에서 결합해 resolve한다.",
    "nextId": "각 collection에 존재하는 최대 id보다 커야 한다.",
    "slot.caption": (
        "slot object 자체에 귀속된 local text다. 별도 project caption reference를 만들지 않으며 "
        "slot object가 layout position 사이에서 이동하면 같은 slot-local state로 함께 이동한다."
    ),
}

activeProject = (
    "현재 세션의 유일한 authoritative ProjectObject이며 Backend 내부 persistent state다. "
    "영속 project mutation은 Project EFSM contract를 통해서만 수행한다. "
    "Frontend는 activeProject를 직접 import/read하지 않고 Application boundary의 public query projection만 사용한다."
)

projectObjects = (
    "Backend ProjectObjectRegistry. 이름을 PROJECT_OBJECT_PATHS 또는 Backend read provider와 연결하고 "
    "매 read 시 activeProject에서 값을 다시 읽는다. snapshot은 export/query 같은 단일 작업용 복사본이며 Frontend authority가 아니다."
)

projectVfs = (
    "Backend에서 activeProject.fileSystem.directories와 asset directory/name을 함께 해석하는 VFS helper. "
    "별도 파일 트리 SoT를 갖지 않고 activeProject state에서 resolve한다. Frontend는 직접 호출하지 않는다."
)

BACKEND_QUERY_KINDS = {
    "project-api": "FastFigureApi read operation에 필요한 project/asset/chart/layout/caption/label/export projection",
    "slot-selection-context": "validated slot selection 뒤 optional contentType intent 판단에 필요한 empty/contentType projection",
    "interface-intent": "Frontend selection/reference event를 current Backend authority에서 검증한 input",
    "interface-reconciliation": "ProjectMutationResult 뒤 current Backend authority에서 계산한 Frontend reconciliation input",
    "renderer": "DOM/Plotly renderer가 한 projection 작업에 사용할 immutable project view",
    "export": "한 export 작업 동안 사용할 immutable persistent project snapshot",
}

BACKEND_READ_BOUNDARY_RULE = (
    "Backend query는 current activeProject에서 필요한 값만 resolve하여 read-only projection을 반환한다. "
    "query/read 계산은 activeProject를 변경하지 않으며 누락 field normalization이 필요하면 authority가 아닌 projection/candidate copy에서 수행한다. "
    "반환 projection은 다른 subsystem의 project authority 또는 무검증 mutation candidate로 재사용하지 않는다. "
    "Frontend가 mutation을 요청하면 id/path/reference와 새 사용자 입력만 전달하고 Project EFSM이 current activeProject에서 다시 resolve한다."
)

FrontendValidatedInput = {
    "event": "Frontend FSM event",
    "accepted": "Backend reference validation 성공 여부",
    "reference": "validated slot/path/chart/object identity 또는 explicit none",
    "workspaceHint": "Frontend가 project/slot.graph/slot.image workspace를 결정하는 데 필요한 immutable hint",
    "selectionHint": (
        "event별 tagged meaning: SELECT_SLOT은 toggle-clear 또는 clear-graph-object; "
        "SELECT_ASSET은 csv/image/directory 또는 none; SELECT_GRAPH_OBJECT는 selectAsset=True일 때만 CSV canonical path, 그 외 none"
    ),
}

FrontendReconciliationInput = {
    "event": "commit된 project command",
    "selectedSlot": "현재 selected slot reference의 valid/invalid/moved 결과",
    "assetSelection": "현재 asset reference를 resolve한 canonical path 또는 none",
    "assetKind": "assetSelection이 resolve된 csv/image/directory kind; none이면 none",
    "graphObject": "현재 graph-object reference/index의 valid/invalid 결과",
    "workspaceHint": "reconciled selection에서 파생할 workspace hint",
    "projectionEffect": "renderer가 사용할 commit effect",
}


# operation 名은 public API와 대응한다. Backend domain 함수의 기존 계산을 재사용하며
# transport/DOM 표현, UI state copy 또는 별도 read store를 추가하지 않는다.
PUBLIC_BACKEND_READ_CONTRACTS = {
    "project.readName": "meta.projectName 문자열 copy",
    "slots.readSelected": "frontendState.selectedSlotId -> visible slot; id/row/col/contentType/chart/imageId copy, 없으면 none",
    "images.readEditor": "explicit slotId -> visible slot -> image asset; slotId/name/display URL와 normalized slot-local settings copy, 없으면 none",
    "print.readSettings": "export의 width/heightMode/height/dpi/format scalar copy",
    "appearance.readPalette": "current appearance.uiPalette의 field copy; persistent palette hex validation과 defaults는 이 파일의 ProjectObject 규칙 사용",
    "graphs.readData": (
        "frontendState.selectedSlotId로 graph chart를 resolve; objects copy와 graphObjectIndex의 valid selectedIndex, "
        "assetSelection=csv인 assetPath에서 currentCsv/columns, selected object.csvId에서 별도 objectColumns를 계산. "
        "object.csvId를 currentCsv 대체 원천으로 쓰지 않는다. chart 없으면 objects=[], selectedIndex=none; CSV 없으면 해당 columns=[]"
    ),
    "graphs.readLayout": "explicit selectedSlotId로 owning chart를 resolve한 title/globalSettings/axis copy; 없으면 none",
    "graphs.readPalette": "같은 owning chart의 editor object color sequence copy; 없으면 empty sequence",
    "graphs.hasSelectedSlot": "explicit selectedSlotId가 visible graph slot인지 boolean; chart가 없어도 graph slot이면 true",
    "graphs.defaultColors": "graphs.py의 immutable default color sequence copy; ProjectObject read 불필요",
    "captions.readGlobal": "project annotations.captions의 enabled/text/afterText/name/nameBold/settings copy",
    "captions.readSlot": "explicit slotId의 slot.caption copy; 없는 slot이면 none; placeholder는 반환 presentation일 뿐 저장하지 않음",
    "labels.readState": "layout_annotations_export.py readLabelsApiState(slotId)의 label settings와 explicit slot reference geometry copy",
    "layout.readState": "current layout/style/visible slot geometry copy와 renderedWidth를 사용한 기존 layout preview 계산; DOM에서 project 값을 역추론하지 않음",
    "assets.readTree": "assets_files.py의 current directories/assets로 계산한 canonical VFS tree copy",
    "assets.readTrash": "같은 tree 계산의 trash subtree copy",
    "assets.isTrashed": "canonical requested path의 trash subtree membership boolean",
    "assets.movable": "current VFS source 존재와 fixed-root 규칙으로 계산한 boolean; trash 소속만으로 거부하지 않음",
    "assets.draggableAsset": "존재하는 non-trash csv/image의 kind/id/path/name copy 또는 none; slot 연결용이며 tree move와 구별",
    "assets.readDeletionTarget": "explicit path asset과 collectAssetReferences의 사용 count/owner copy; 없으면 none",
    "assets.moveOptions": "current directories와 기존 move eligibility 규칙에서 계산한 destination 후보 copy",
    "assets.planMove": "explicit source/destination을 current VFS에서 resolve한 collision/reference-count plan copy; commit 때 반드시 재검증",
    "assets.resolveTreeSelection": "path를 resolve한 accepted/kind/canonical path scalar input; invalid면 accepted=False",
    "assets.collisionModel": "current VFS와 이번 import의 reserved paths로 계산한 collision model; 다른 작업의 권위로 보존하지 않음",
}

RENDERER_BACKEND_READ_CONTRACT = {
    "whole": (
        "default renderer request는 final frontendState와 optional mutationResult를 받는다. "
        "current layout/grid/style, appearance, annotations, visible slots와 slot-local content/caption/settings를 detached copy로 구성한다. "
        "각 visible graph slot의 owning chart, 참조 CSV/columns와 chartFigure 계산 결과를 포함하고 image slot은 asset name/display URL를 포함한다. "
        "slot/chart/CSV resolve와 graph projection 계산은 Backend에서 끝내며 renderer가 Backend를 다시 조회하지 않는다. "
        "Backend authority에 없는 default/compatibility 값은 copy에만 적용한다. final Frontend state는 ProjectObject에 합치지 않는다."
    ),
    "slot-image": "explicit slotId에 대한 images.readEditor와 동일한 Backend 계산; UI selection을 query 내부에서 읽지 않음",
    "ui-palette": "appearance.readPalette와 동일한 palette copy; CSS variable 적용은 Frontend가 수행",
    "lifetime": "한 render 작업에만 소비; 다음 작업은 current authority에서 재조회; mutation 입력이나 장기 project mirror로 재사용 금지",
}


def readBackendProjection(kind, request):
    """
    Return:
    - projection:
      BACKEND_QUERY_KINDS 중 요청 kind에 필요한 current-authority read-only projection.

    변경:
    - activeProject와 Frontend state를 변경하지 않는다.

    처리:
    1. kind가 BACKEND_QUERY_KINDS에 속하는지 확인한다. project-api는 PUBLIC_BACKEND_READ_CONTRACTS의 operation을 확인한다.
       미등록 kind/operation은 query 오류이며 ProjectObject/Frontend state를 변경하지 않는다.
    2. request의 explicit identity와 frontendState의 selectedSlotId/assetPath/graphObjectIndex를 아래 계약에 따라
       current activeProject/VFS에서 resolve한다. Frontend object copy를 read authority로 받지 않는다.
    3. public read는 PUBLIC_BACKEND_READ_CONTRACTS의 domain 계산을 호출한 detached 값이다. 없는 선택 대상은 해당 계약의 none/empty 결과다.
       slot-selection-context는 visible slot이면 id/empty/contentType, invalid면 none이다. empty는 chart/image reference가 모두 없는 경우다.
    4. renderer는 RENDERER_BACKEND_READ_CONTRACT의 whole/targeted 입력을, export는 현재 whole-project snapshot을 구성한다.
       interface-intent/reconciliation kind는 아래 validation/reconciliation 계산과 같은 contract를 사용하며 별도 판정 규칙을 만들지 않는다.
    5. compatibility/default normalization은 detached copy에서만 수행한다. 중첩 array/object까지 read-only로 반환하고
       Backend 내부 mutable reference, event handler, DOM node, query/command callback은 projection에 포함하지 않는다.
    """
    projection = "current Backend authority에서 계산한 immutable read projection"
    return projection


def validateFrontendIntent(event, payload):
    """
    Return:
    - validatedInput:
      FrontendValidatedInput.

    변경:
    - activeProject와 Frontend state를 변경하지 않는다.

    처리:
    공통: event/accepted/reference/workspaceHint/selectionHint를 새 immutable input으로 구성한다.
    미등록 event 또는 invalid reference는 accepted=False이며 Frontend state를 변경하지 않는다.
    explicit none은 accepted deselection이다. invalid identity를 none으로 바꾸어 승인하지 않는다.
    SELECT_SLOT:
      slotId를 visible slot에서 resolve한다. workspaceHint는 contentType image이면 slot.image, 아니면 slot.graph다.
      direction=model-to-fsm이면 clear-graph-object, 그 외 일반 selection은 toggle-clear hint를 반환한다.
    SELECT_ASSET:
      path를 current VFS에서 resolve하고 요청 kind와 일치하는 csv/image/directory만 승인한다.
      reference는 canonical path, selectionHint는 resolved kind다. none이면 hint도 none이다.
    SELECT_GRAPH_OBJECT:
      payload.selectedSlotId -> visible graph slot -> owning chart -> integer index의 existing editor object를 resolve한다.
      read 과정에서 ensure/normalize로 live chart를 변경하지 않는다. object.csvId가 current CSV에서 resolve되어야 승인한다.
      reference는 index다. selectAsset=True일 때만 CSV canonical path를 selectionHint로 반환하고, False/생략이면 hint none이다.
      explicit index none은 graph selection clear이며 asset selection에 대한 hint를 생성하지 않는다.
    """
    validatedInput = FrontendValidatedInput
    return validatedInput


def buildFrontendReconciliationInput(event, mutationResult, frontendReferences):
    """
    Return:
    - reconciliationInput:
      FrontendReconciliationInput.

    변경:
    - activeProject와 Frontend state를 변경하지 않는다.

    처리:
    1. committed result와 Frontend의 selectedSlotId/assetPath/graphObjectIndex를 입력으로 받는다. failed result로 이 query를 실행하지 않는다.
    2. result.selectionHints.resetInterfaceSelection이면 세 reference를 none으로 만든다. 아니면 swapSlotIds에 따라 선택 slot id를 교환하고,
       mergeSlotIds에 포함된 선택 id는 anchorId로 바꾼다. movedPathFrom subtree의 선택 path는 movedPathTo와 기존 상대 suffix로 옮긴다.
    3. 변환된 slot id를 current visible slot에서 resolve하고 invalid면 none으로 만든다.
       asset path를 current VFS에서 resolve한다. clearAssetSelection, removed target 또는 enteringTrash인 trashed target이면 clear한다.
       여전히 존재하는 unrelated selection은 유지한다.
    4. reconciled slot의 graph chart와 현재 integer index를 resolve한다. clearGraphSelection hint 또는 command의 explicit clearGraphSelection이면 clear한다.
       image workspace/no chart/out-of-range index면 clear한다. 그 외 index를 유지한다. graph object를 ensure/normalize하지 않는다.
       object-array edit의 selectedIndexHint는 별도의 index-only Frontend transition 입력이며, 임의 CSV 선택 변경으로 해석하지 않는다.
    5. selectedSlot/assetSelection/assetKind/graphObject에 resolved scalar를 반환한다. workspaceHint는 none이면 project,
       visible image slot이면 slot.image, 그 외 slot.graph다. projectionEffect는 committed result의 실제 reference 제거/targeted 변경 정보로
       renderer_runtime.py의 DASHBOARD_PROJECTION_INVALIDATION_RULE에 맞춰 결정할 수 있는 값이며 Frontend state write를 수행하지 않는다.
    6. ProjectObject/Backend helper를 결과에 넣지 않고 Frontend selection 또는 Backend authority를 이 query에서 변경하지 않는다.
    """
    reconciliationInput = FrontendReconciliationInput
    return reconciliationInput

class ProjectObject:
    def read(self, path):
        """
        Return:
        - value:
          PROJECT_OBJECT_PATHS 또는 등록된 project path가 가리키는 현재 authoritative 값.

        변경:
        - project state를 변경하지 않는다.

        처리:
        path를 active ProjectObject state에서 resolve한다.
        경로가 없으면 실패한다.
        """
        value = "현재 ProjectObject의 path가 가리키는 값"
        return value

    def initialize(self, source):
        """
        변경:
        - 현재 ProjectObject의 전체 authoritative state를 검증된 candidate state로 한 번 교체한다.

        처리:
        1. source를 active authority 밖의 candidate로 다룬다.
        2. slot representation을 정규화한다.
        3. validateProjectObjectState로 전체 구조와 참조를 검증한다.
        4. 검증 성공 후에만 내부 authoritative state reference를 한 번 교체한다.
        5. 이전 state는 기존 runtime resource release처럼 교체 후 처리가 필요한 경우에만 반환한다.
           mutation 실패를 전제로 authority를 먼저 바꾼 뒤 복구하는 일반 패턴으로 사용하지 않는다.
        """
        previous = "교체 전 authoritative project state"
        return previous


class ProjectObjectRegistry:
    def read(self, name):
        """
        Return:
        - object_value:
          등록된 이름이 현재 activeProject에서 가리키는 값.

        변경:
        - 없음.

        처리:
        저장된 snapshot을 읽지 않고 project provider에서 현재 ProjectObject를 받아 resolve한다.
        """
        object_value = "현재 activeProject에서 resolve된 등록 object"
        return object_value

    def snapshot(self, names):
        """
        Return:
        - snapshot:
          지정된 project object들의 작업 시점 deep copy.

        변경:
        - authoritative state를 변경하지 않는다.

        처리:
        export/render 같은 단일 작업에서 일관된 입력을 사용하기 위한 복사본을 만든다.
        복사본은 project 변경 경로의 일반 읽기 원천으로 승격하지 않는다.
        """
        snapshot = "지정 object들의 작업 범위 read-only copy"
        return snapshot


def slotHasNonDefaultLocalState(slot):
    """
    Return:
    - nonDefault:
      slot-local property 중 하나라도 SLOT_LOCAL_DEFAULTS와 다른지 여부.

    변경:
    - 없음.

    처리:
    chart, imageId, contentType, imageSettings 전체, caption을 같은 normalized local state로 비교한다.
    layout geometry(row/col/span/hidden)는 slot-local payload가 아니라 GUI layout placement이므로 이 판정에 포함하지 않는다.
    """
    nonDefault = "normalized slot-local state가 SLOT_LOCAL_DEFAULTS와 다른지"
    return nonDefault


def normalizeSlotContent(slot):
    """
    Return:
    - slot:
      renderable content와 caption annotation이 의미적으로 분리된 동일 slot object.

    변경:
    - 전달된 candidate slot representation만 정규화한다.

    처리:
    1. chart/image/contentType/imageSettings는 하나의 slot-local renderable-content 원천으로 정규화한다.
    2. 누락된 slot-local field는 SLOT_LOCAL_DEFAULTS에서 채운다.
       imageSettings가 없으면 slot default imageSettings를 만든다.
       image asset 자체에서 display settings를 읽어 authority로 사용하지 않는다.
    3. caption은 slot-local caption 원천으로 정규화한다.
    4. legacy representation에서 caption이 nested content 안에 있으면 같은 caption property로 이동한다.
    5. UI placeholder 문자열을 새 authoritative caption 값으로 생성하지 않는다.
    6. compatibility alias가 필요하더라도 같은 의미에 두 저장값을 두지 않는다.
    """
    return slot


def validateProjectObjectState(state, requireSlots):
    """
    Return:
    - state:
      모든 구조 및 참조 검증을 통과한 동일 state.

    변경:
    - 없음.

    검증:
    - project top-level structure와 필수 nested object가 존재한다.
    - gridRows/gridCols는 1..8 정수다.
    - slotStyle 수치와 boolean이 허용 범위에 있다.
    - label position은 finite이고 fontSize는 현재 최소 6이다.
    - export width/height mode/height/dpi/format이 정의된 범위와 관계를 만족한다.
    - figure 의미가 없는 legacy layoutMapWidth를 authoritative state로 요구하지 않는다.
    - persistent UI palette의 필수 색상은 유효한 6-digit hex다.
    - VFS directory path는 정규화되어 있고 중복이 없으며 고정 directory가 존재한다.
    - CSV/image id와 전체 asset path는 중복되지 않는다.
    - asset directory는 VFS에 존재한다.
    - chart id는 유일하다.
    - editable chart는 graph object가 0개여도 유효하며, 존재하는 graph object의 CSV 참조는 모두 resolve된다.
    - slot id와 geometry가 유효하고 grid 범위를 넘지 않는다.
    - slot은 chart와 image를 동시에 참조하지 않는다.
    - slot chart/image 참조 대상이 존재한다.
    - slot.content.imageSettings는 fit/scale/x/y schema와 허용 범위를 만족한다.
    - image asset에는 slot-local display settings를 요구하지 않는다.
    - 각 chart는 정확히 하나의 slot에서 참조되며 shared chart와 orphan chart가 없다.
    - unset slot caption은 null/empty이고 UI placeholder를 project 값으로 요구하지 않는다.
    - nextId는 해당 collection의 현재 최대 id보다 크다.
    - requireSlots가 참이면 적어도 하나의 slot이 존재한다.
    """
    return state



DEFAULT_PROJECT_RULES = {
    "grid": "새 project는 2 x 2 grid에서 시작한다.",
    "slotStyle": (
        "새 project의 layout.slotStyle은 SLOT_STYLE_DEFAULTS를 사용한다. "
        "outerMargin 기본값은 0이며 저장된 project에 명시된 outerMargin은 그대로 유지한다."
    ),
    "slots": (
        "초기 grid의 각 cell은 1 x 1 empty slot이며 chart/image reference, caption은 empty, "
        "imageSettings는 slot-local default를 가진다."
    ),
    "assets": "초기 CSV/image collection은 비어 있으며 보호된 default CSV를 만들지 않는다.",
    "charts": "초기 chart collection은 비어 있다.",
    "labels": "초기에는 disabled, position은 reference origin, 기본 formatting/font settings를 사용한다.",
    "captions": (
        "project-level global caption은 초기 disabled/empty 상태다. "
        "각 초기 slot.caption도 empty이며 slot caption editor mode는 project state에 저장하지 않는다."
    ),
    "export": (
        "target width는 초기 layout reference width를 기본으로 하고 height는 auto, "
        "DPI는 300, raster format은 png로 시작한다."
    ),
    "vfs": "고정 directory /assets, /assets/csv, /assets/images, /assets/trash를 만든다.",
    "nextId": "csv/image/chart 모두 collection의 첫 새 id를 가리키는 값에서 시작한다.",
    "appearance": "기본 UI palette를 복사해 project persistent palette로 시작한다.",
}


def createProjectState():
    """
    Return:
    - state:
      모든 project invariant를 만족하는 새 candidate project state.

    변경:
    - activeProject를 직접 변경하지 않는다.

    처리:
    1. project meta와 2 x 2 layout을 만들고 slotStyle은 SLOT_STYLE_DEFAULTS에서 복사한다.
    2. label/caption authoritative state를 기본값으로 만든다.
       slot caption placeholder는 저장하지 않는다.
    3. CSV/image/chart collection은 empty로 시작한다.
       빈 graph용 default CSV나 fake graph object를 만들지 않는다.
    4. 고정 VFS directory와 next-id sequence를 만든다.
    5. persistent appearance와 export settings를 만든다.
    6. 2 x 2의 empty 1 x 1 slot 네 개를 만든다.
    7. validateProjectObjectState를 통과한 candidate를 반환한다.
    """
    state = "새 project invariant를 만족하는 candidate ProjectObject state"
    return state


def resolveOwningSlot(chartId, state):
    """
    Return:
    - owner:
      chartId를 참조하는 유일한 slot.
    - 없음:
      chartId가 존재하지 않거나 valid ownership을 만들지 못하는 경우.

    변경:
    - 없음.

    처리:
    state.slots에서 chartId reference를 모두 수집한다.
    정확히 하나일 때만 그 slot을 owner로 resolve한다.
    shared/orphan 상태를 임의로 clone/drop하여 고치지 않는다.
    """
    owner = "chartId의 유일한 owning slot 또는 없음"
    return owner

def getProjectCsv(csvId):
    """
    Return:
    - csv:
      activeProject.csvFiles에서 csvId로 resolve한 asset 또는 없음.

    변경:
    - 없음.
    """
    csv = "csvId와 상관관계가 확인된 CSV asset 또는 없음"
    return csv


def getProjectImage(imageId):
    """
    Return:
    - image:
      activeProject.images에서 imageId로 resolve한 asset 또는 없음.

    변경:
    - 없음.
    """
    image = "imageId와 상관관계가 확인된 image asset 또는 없음"
    return image


def getChart(chartId):
    """
    Return:
    - chart:
      activeProject.charts에서 chartId로 resolve한 chart 또는 없음.

    변경:
    - 없음.
    """
    chart = "chartId와 상관관계가 확인된 chart model 또는 없음"
    return chart
