"""
Fast Figure Source Script — authoritative project state and references

하위 구현 검증 원천:
- ../../fast-figure.js
  createProjectState, ProjectObject, ProjectObjectRegistry,
  normalizeSlotContent, validateProjectObjectState, projectVfs,
  getProjectCsv/getProjectImage/getChart/slotAt.
"""


SLOT_STYLE_DEFAULTS = "config reference: backend.project_object.layout.slotStyle"
DEFAULT_UI_PALETTE = "config reference: backend.project_object.appearance.uiPalette"



PROJECT_OBJECT_PATHS = {'project': ('meta',),
 'layout': ('layout',),
 'labels': ('annotations', 'labels'),
 'captions': ('annotations', 'captions'),
 'data': ('assets', 'csvFiles'),
 'images': ('assets', 'images'),
 'files': ('fileSystem', 'directories'),
 'charts': ('charts',),
 'slots': ('slots',),
 'sequences': ('nextId',),
 'appearance': ('appearance',),
 'export': ('export',)}


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

class Slot:
    def __init__(self, id, row, col):
        self.id = "프로젝트의 slots 컬렉션 안에서 유일한 정수 식별자."
        self.row = "슬롯의 시작 행. 1부터 세는 정수."
        self.col = "슬롯의 시작 열. 1부터 세는 정수."
        self.rowSpan = "슬롯이 차지하는 행 수. 양의 정수."
        self.colSpan = "슬롯이 차지하는 열 수. 양의 정수."
        self.hidden = "다른 슬롯의 병합 영역에 포함된 여부인 논리값."
        self.content = {
                "chart": "같은 프로젝트의 _state[\"charts\"] 원소를 가리키는 chart id 또는 None.",
                "imageId": "같은 프로젝트의 _state[\"assets\"][\"images\"] 원소를 가리키는 image id 또는 None.",
                "contentType": "graph 또는 image 문자열.",
                "imageSettings": "슬롯별 이미지 표시 설정 딕셔너리. 원형: /backend/layout_annotations/imageSettings",
            }
        self.caption = "이 인스턴스가 소유하는 슬롯 자막 문자열 또는 None."
        """
        Args:
        - id:
          생성할 슬롯의 정수 식별자. 0도 유효하다.

        - row:
          생성할 슬롯의 시작 행 번호.

        - col:
          생성할 슬롯의 시작 열 번호.

        Return:
        - outcome:
          None.

        변경:
        - 새 인스턴스 self의 위 속성을 초기화한다.

        처리:
            1. self.id, self.row, self.col에 각각 id, row, col을 대입한다.
               식별자 할당과 다른 슬롯과의 중복 확인은 생성 호출자와 프로젝트 검증이 수행한다.
            2. self.rowSpan과 self.colSpan에 각각 1, self.hidden에 False를 대입한다.
            3. sourcescript/backend/settings.json의 backend.defaults.slotSettings.content를
               중첩 딕셔너리까지 복사하여 이 인스턴스의 self.content로 둔다.
               self.content["chart"]와 self.content["imageId"]에 각각 None을 대입한다.
               contentType과 imageSettings의 설정값은 위 설정 원천에서 가져온다.
            4. self.caption에 None을 대입한다. 호출마다 content와 imageSettings를 따로
               생성하므로 한 슬롯의 설정 수정은 다른 슬롯의 설정에 영향을 주지 않는다.
            5. 호출자는 생성된 Slot 인스턴스를 자신의 candidate["slots"]에 넣는다.
               저장 자료 복원은 normalizeSlotContent가 저장 필드의 존재 여부를 판별하여 수행한다.
            6. config backend.defaults.slotSettings.content의 설정을 복사하고, chart/imageId/caption은 기존 empty-instance 생성 규칙에 따라 none으로 구성한 local state. 이 none reference/data를 config에 저장하지 않는다.

        """
        return None




















activeProject = '현재 프로젝트 상태를 소유하는 ProjectObject 인스턴스.'

projectObjects = '프로젝트 조회 레지스트리인 ProjectObjectRegistry 인스턴스.'

projectVfs = '현재 ProjectObject의 VFS 경로 조회 인터페이스.'

BACKEND_QUERY_KINDS = {
    'project-api': {
        'project.readName': 'project.readName',
        'slots.readSelected': 'slots.readSelected',
        'images.readEditor': 'images.readEditor',
        'print.readSettings': 'print.readSettings',
        'appearance.readPalette': 'appearance.readPalette',
        'graphs.readData': 'graphs.readData',
        'graphs.readLayout': 'graphs.readLayout',
        'graphs.readPalette': 'graphs.readPalette',
        'graphs.hasSelectedSlot': 'graphs.hasSelectedSlot',
        'graphs.defaultColors': 'graphs.defaultColors',
        'captions.readGlobal': 'captions.readGlobal',
        'captions.readSlot': 'captions.readSlot',
        'labels.readState': 'labels.readState',
        'layout.readState': 'layout.readState',
        'assets.readTree': 'assets.readTree',
        'assets.readTrash': 'assets.readTrash',
        'assets.isTrashed': 'assets.isTrashed',
        'assets.movable': 'assets.movable',
        'assets.draggableAsset': 'assets.draggableAsset',
        'assets.readDeletionTarget': 'assets.readDeletionTarget',
        'assets.moveOptions': 'assets.moveOptions',
        'assets.planMove': 'assets.planMove',
        'assets.resolveTreeSelection': 'assets.resolveTreeSelection',
        'assets.fileKind': 'assets.fileKind',
        'assets.collisionModel': 'assets.collisionModel',
        'assets.resolveImportPlan': 'assets.resolveImportPlan',
        'project.exportFile': 'project.exportFile',
        'assets.download': 'assets.download',
        'graphs.exportFfsx': 'graphs.exportFfsx',
        'graphs.exportPlotlyJson': 'graphs.exportPlotlyJson',
    },
    'slot-selection-context': {
    },
    'interface-reconciliation': {
    },
    'renderer': {
    },
    'export': {
        'print.save': 'print.save',
        'print.capture': 'print.capture',
    },
}



FrontendValidatedInput = {'event': 'Frontend FSM event',
 'accepted': 'Backend reference validation 성공 여부',
 'reference': 'validated slot/path/chart/object identity 또는 explicit none',
 'workspaceHint': 'Frontend가 project/slot.graph/slot.image workspace를 결정하는 데 필요한 immutable hint',
 'selectionHint': '선택 유형·참조 해제 범위·CSV 경로를 담은 이벤트별 hint.'}



FrontendReconciliationInput = {'event': 'commit된 project command',
 'selectedSlot': '현재 selected slot reference의 valid/invalid/moved 결과',
 'assetSelection': '현재 asset reference를 resolve한 canonical path 또는 none',
 'assetKind': 'csv, image, directory 또는 none 문자열.',
 'graphObject': '현재 graph-object reference/index의 valid/invalid 결과',
 'workspaceHint': 'reconciled selection에서 파생할 workspace hint',
 'projectionEffect': 'referencesRemoved와 pathOnly 논리값을 담은 딕셔너리.'}


# operation 식별자는 공개 API의 등록 조회와 대응한다.








def buildSlotAssetDisplay(slot, project):
    display = {
        "kind": "empty, assets, embedded 중 하나.",
        "assets": "표시할 에셋 메타데이터 딕셔너리의 배열.",
    }
    chart = "chartModel 딕셔너리 또는 None."
    asset = "현재 프로젝트에서 찾은 CSV 또는 이미지 에셋 딕셔너리."
    seenCsvIds = "이번 슬롯 표시에서 이미 담은 CSV id의 집합."
    """
    Args:
    - slot:
      project가 소유하는 표시 가능한 슬롯 인스턴스.

          원형: /backend/project_state/Slot
          Source of Truth: 인자로 받은 project._state["slots"]의 원소.

    - project:
      이번 layout["readState"] 조회가 캡처한 ProjectObject 인스턴스.

          원형: /backend/project_state/ProjectObject
          Source of Truth: /backend/project_state/activeProject

    Return:
    - display:
      표시 필드 딕셔너리.
      슬롯에 연결된 에셋의 표시 결과. 각 assets 원소는 kind, id, name, path를 가진다.
        empty는 연결된 표시 에셋이 없음, embedded는 외부 CSV를 사용하지 않는 가져온 그래프다.

    변경:
    - 없음.

    처리:
        1. display["kind"]에 empty, display["assets"]에 빈 배열을 둔다.
        2. slot.content["contentType"]이 image이면 slot.content["imageId"]와 같은 id의
           원소를 project._state["assets"]["images"]에서 찾는다. 찾으면 그 원소의 kind=image,
           id, name과 assets_files.projectAssetPath가 계산한 path만 별도 딕셔너리로 담고
           display["kind"]에 assets를 둔다. display를 반환한다.
        3. graph이면 slot.content["chart"]와 같은 id의 chart를 project._state["charts"]에서
           찾는다. 없으면 초기 display를 반환한다. chart["editor"]["editable"]이 False이면
           display["kind"]에 embedded를 두고 반환한다.
        4. seenCsvIds를 빈 집합으로 둔다. chart["editor"]["objects"]를 순서대로 확인하여
           object의 csvId를 project._state["assets"]["csvFiles"]에서 찾는다.
           실제 CSV가 있고 아직 담지 않은 id이면 kind=csv, id, name, projectAssetPath의 path를
           별도 딕셔너리로 display["assets"] 끝에 넣고 그 id를 seenCsvIds에 추가한다.
        5. display["assets"]가 비어 있지 않으면 display["kind"]에 assets를 둔다.
           빈 배열인 슬롯도 호출자가 구성하는 visibleSlots의 한 행으로 유지한다.
        6. display의 중첩 배열과 딕셔너리를 읽기 전용 결과로 반환한다.
           이 결과의 수명은 이번 표시 작업이며 다음 작업은 현재 project에서 다시 읽는다.
           display를 반환한다.
    """
    return display


def readBackendProjection(kind, request):
    projection = "등록된 조회의 읽기 전용 결과."
    project = "ProjectObject 인스턴스."
    state = "ProjectObject._state 원형의 딕셔너리."
    geometry = "dashboardGeometryResult 원형의 읽기 전용 딕셔너리."
    """
    Args:
    - kind:
      BACKEND_QUERY_KINDS에 등록된 조회 종류 문자열.

    - request:
      등록된 Backend 조회별 식별자·입력 필드를 가진 딕셔너리.

    Return:
    - projection:
      등록된 조회의 읽기 전용 결과.
      BACKEND_QUERY_KINDS 중 요청 kind에 필요한 current-authority read-only projection.

    변경:
    - activeProject와 Frontend state를 변경하지 않는다.

    처리:
        1. activeProject를 project에, project._state를 state에 두고 이번 조회 전체에서 사용한다.
           kind가 BACKEND_QUERY_KINDS에 속하는지 확인하고 project-api/export는 request의 operation을 아래 분기와 비교한다.
           미등록 kind/operation은 query 오류이며 ProjectObject/Frontend state를 변경하지 않는다.
        2. request의 explicit identity와 frontendState의 selectedSlotId/assetPath/graphObjectIndex를 아래 계약에 따라
           current activeProject/VFS에서 resolve한다. Frontend object copy를 read authority로 받지 않는다.
        3. public read는 project_state.readBackendProjection의 operation별 조회 처리의 domain 계산을 호출한 detached 값이다. 없는 선택 대상은 해당 계약의 none/empty 결과다.
           slot-selection-context는 visible slot이면 id/empty/contentType, invalid면 none이다. empty는 chart/image reference가 모두 없는 경우다.
        4. renderer는 project_state.readBackendProjection의 renderer 분기의 whole/targeted 입력을, export는 현재 whole-project snapshot을 구성한다.
           chart/CSV/figure 계산은 같은 Backend read 작업의 project를 graphs.chartFigure(chart, project)에 명시적으로 전달한다.
           export의 print.save/print.capture 입력에는 같은 작업의 chart/CSV에서 계산한 figure를 제공한다.
           이는 한 작업용 projection이며 저장 ProjectObject/FFPX schema에 figure 필드나 별도 authority를 추가하지 않는다.
           operation 없는 일반 project export/import 반환용 whole-project snapshot은 기존 계약을 유지한다.
           project.exportFile/assets.download/graphs.exportFfsx/graphs.exportPlotlyJson은 project_state.readBackendProjection의 export 분기를 따른다.
           그 외 알 수 없는 export operation은 query error다. package builder가 사용하는 operation 없는 export read는
           plain snapshot일 뿐 같은 package operation을 재귀 호출하지 않는다. 같은 read 작업의 chart/CSV를 끝까지 사용한다.
           supplied renderer input을 받은 Frontend가 Backend helper를 재호출하거나 프로젝트 mirror를 별도로 구성하지 않는다.
           interface-reconciliation kind는 buildFrontendReconciliationInput의 입력과 반환 원형을 사용한다.

        5. Backend query는 current activeProject에서 필요한 값만 resolve하여 read-only projection을 반환한다. query/read 계산은 activeProject를 변경하지 않으며 누락 field normalization이 필요하면 분리된 projection/candidate에서 수행한다. 반환 projection은 다른 subsystem의 project authority 또는 무검증 mutation candidate로 재사용하지 않는다. Frontend가 mutation을 요청하면 id/path/reference와 새 사용자 입력만 전달하고 Project EFSM이 current activeProject에서 다시 resolve한다.
        6. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["project.readName"]이면: meta.projectName 문자열 copy
        7. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["slots.readSelected"]이면: selectedSlotId로 visible Slot을 찾아 id/row/col/rowSpan/colSpan/hidden/content/caption을 분리 복사한 Slot 또는 None
        8. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["images.readEditor"]이면: explicit slotId -> visible slot -> image asset; slotId/name/copied bytes와 그 bytes에서 순수 계산한 display URL, normalized slot-local settings copy, 없으면 none. Backend query는 revocable display resource를 할당하거나 runtime handle을 Project에 저장하지 않는다. surface resource lifetime은 supplied input을 소비하는 Frontend renderer가 소유한다.
        9. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["print.readSettings"]이면: export의 width/heightMode/height/dpi/format scalar copy
        10. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["appearance.readPalette"]이면: current appearance.uiPalette의 field copy; persistent palette hex validation과 defaults는 이 파일의 ProjectObject 규칙 사용
        11. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["graphs.readData"]이면: frontendState.selectedSlotId로 graph chart를 resolve; Application의 post-commit read에 explicit chartId가 있으면 유일한 owning slot까지 resolve한다. chart의 detached copy(없으면 none), objects copy와 graphObjectIndex의 valid selectedIndex, assetSelection=csv인 assetPath에서 currentCsv/columns, selected object.csvId에서 별도 objectColumns를 계산. object.csvId를 currentCsv 대체 원천으로 쓰지 않는다. non-editable conversion view는 표시용 copy일 뿐 editable selectedIndex/objectColumns를 만들지 않는다. chart 없으면 objects=[], selectedIndex=none; CSV 없으면 해당 columns=[]
        12. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["graphs.readLayout"]이면: explicit selectedSlotId로 owning chart를 resolve한 title/globalSettings/axis copy; 없으면 none
        13. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["graphs.readPalette"]이면: 같은 owning chart의 editor object color sequence copy; 없으면 empty sequence
        14. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["graphs.hasSelectedSlot"]이면: explicit selectedSlotId가 visible graph slot인지 boolean; chart가 없어도 graph slot이면 true
        15. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["graphs.defaultColors"]이면: sourcescript.backend.graphs의 immutable default color sequence copy; ProjectObject read 불필요
        16. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["captions.readGlobal"]이면: project annotations.captions의 enabled/text/afterText/name/nameBold/settings copy
        17. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["captions.readSlot"]이면: explicit slotId의 slot.caption copy; 없는 slot이면 none; placeholder는 반환 presentation일 뿐 저장하지 않음
        18. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["labels.readState"]이면: sourcescript.backend.layout_annotations readLabelsApiState(slotId)의 label settings와 explicit slot reference geometry copy
        19. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["layout.readState"]이면: 같은 current project에서 gridRows/gridCols/slotStyle, visibleSlots, renderedWidth의 previewGeometry를 copy한다. gridLimits에는 backend.defaults.limits.layout의 gridRows/gridCols 범위를 같은 조회에서 분리 복사한다. visibleSlots는 기존 id/row/col/rowSpan/colSpan과 contentType/chart/imageId 및 buildSlotAssetDisplay(slot, project)의 assetDisplay를 포함한다. width는 backend.defaults.preview.widthRange/fallbackWidth를 사용한다. Backend는 session zoom/lock을 읽지 않으며 Application만 public read에 합성한다. DOM 역추론/preview 저장이나 독립 slot/chart authority는 없다.
        20. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.readTree"]이면: current directories 순서의 directory node와 CSV/image collection 순서의 asset node로 만든 canonical VFS node sequence copy. directory는 kind/path/name/children, asset은 kind/path/id/name/asset detached copy를 갖고 canonical parent의 children으로 연결한다. slot/chart collection을 이 반환에 혼합하거나 legacy directories/data/images/charts/slots 묶음으로 대체하지 않는다.
        21. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.readTrash"]이면: 같은 tree 계산의 trash subtree copy
        22. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.isTrashed"]이면: 요청 path를 canonical 경로로 만들고
           trash root와 같거나 root + slash로 시작하는지 검사한 논리값을 projection에 둔다.
        23. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.movable"]이면: current VFS source 존재와 fixed-root 규칙으로 계산한 boolean; trash 소속만으로 거부하지 않음
        24. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.draggableAsset"]이면: 존재하는 non-trash csv/image의 kind/id/path/name copy 또는 none; slot 연결용이며 tree move와 구별
        25. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.readDeletionTarget"]이면: explicit path -> target asset의 detached copy와 collectAssetReferences의 사용 count/owner copy; 없으면 none; 생성 wrapper도 성공 뒤 target만 반환할 수 있음
        26. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.moveOptions"]이면: current directories와 기존 move eligibility 규칙에서 계산한 destination 후보 copy
        27. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.planMove"]이면: explicit source/destination을 current VFS에서 resolve한 collision/reference-count plan copy; commit 때 반드시 재검증
        28. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.resolveTreeSelection"]이면: path를 resolve한 accepted/kind/canonical path scalar input; invalid면 accepted=False
        29. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.fileKind"]이면: request.file의 copied name/type -> assets_files.slotFileKind의 kind 문자열; ProjectObject/Frontend read 불필요; bytes는 읽지 않음
        30. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.collisionModel"]이면: request.file/directory/reservedPaths -> assets_files.projectAssetImportCollisionModel; current VFS의 detached collision model; 다른 작업의 권위로 보존하지 않음
        31. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.resolveImportPlan"]이면: request.model/choice/reservedPaths -> assets_files.resolveProjectAssetImportPlan; model은 identity/choice 제안일 뿐이다. 같은 current VFS의 충돌/replace target을 재검증한 detached path/replaceId; invalid/stale replace는 오류, input/Project/Frontend 변경 없음. ASSETS_IMPORTED가 이 결과를 사용할 때 current authority를 다시 검증한다
        32. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["project.exportFile"]이면: current whole-project validation 후 assets_files.ffpxBuildProject의 FFPX entries copy; MIME application/vnd.fast-figure-project. Frontend selected slot 금지는 Application precondition이며 Backend는 Frontend를 조회하지 않음
        33. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["assets.download"]이면: explicit canonical path로 CSV/image original bytes/name/MIME copy; absent/wrong kind/no original bytes는 none; fallback MIME application/octet-stream
        34. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["graphs.exportFfsx"]이면: explicit visible graph slotId -> unique owning chart -> assets_files.ffsxBuildSlot의 entries copy; MIME application/vnd.fast-figure-slot; missing slot/chart는 none
        35. request의 operation이 BACKEND_QUERY_KINDS["project-api"]["graphs.exportPlotlyJson"]이면: 같은 target의 graphs.chartFigure(chart, current project) -> UTF-8 JSON bytes copy; MIME application/json; noneditable imported figure/frame 보존; missing은 none
        36. 위 export operation의 파일 이름은 다음과 같이 계산한다: request.stamp는 Application이 이번 호출에 만든 UTC ISO timestamp의 colon/dot을 hyphen으로 바꾼 값이며 이번 다운로드 작업의 값이다. project는 assets_files.projectFileStem의 project-name sanitize + stamp + .ffpx; slot은 fast-figure-slot-{slotId}-{stamp}.ffsx; Plotly는 plotly-figure-{slotId}-{stamp}.json; original asset은 asset.name을 그대로 사용한다.
        37. export 결과에는 한 download 작업의 copied entries/bytes/name/MIME만 반환; resource URL 할당이나 다운로드는 하지 않으며 원본을 mutation input으로 쓰지 않음
        38. kind=renderer의 전면 투영 요청이면: default renderer request는 final frontendState와 optional mutationResult를 받는다. current layout/grid/style, appearance, annotations, visible slots와 slot-local content/caption/settings를 detached copy로 구성한다. label 번호/표시는 layout_annotations.orderedSlotLabels(current project)로 계산하며 captionReferenceStyle은 backend/settings.json의 backend.defaults.captionReferenceStyle에서 복사한다. 각 visible graph slot의 owning chart, 실제 project object의 참조 CSV/columns와 graphs.chartFigure(chart, project) 계산 결과를 포함한다. project는 이번 query가 읽는 같은 current authority이며 chart copy와 CSV가 같은 read 작업에 속한다. non-editable imported conversion chartFigure는 imported representation을 보존하며 conversion view로 project CSV를 resolve하지 않는다. image slot은 images.readEditor와 같은 copied bytes/name/display URL 의미를 사용한다. slot/chart/CSV resolve와 graph projection 계산은 Backend에서 끝내며 renderer가 Backend를 다시 조회하지 않는다. Backend authority에 없는 default/compatibility 값은 copy에만 적용한다. final Frontend state는 ProjectObject에 합치지 않는다.
           전면 renderer 요청의 request["width"]는 Application이 전달한 유한 양수 px다.
           무효 너비는 조회 오류로 전파한다. 같은 동기 조회에서
           layout_annotations.dashboardGeometry(request["width"], None)를 geometry에 둔다.
           이번 query가 처음 읽은 project와 같은 activeProject를 사용하는 동안 호출하며
           project 교체·명령·callback·비동기 대기를 끼우지 않는다.
           projection["geometry"]에 geometry를 넣는다. 실제 renderer 너비에는 preview의 너비 제한을 적용하지 않는다.
           projection["appearance"]["uiPalette"]는 이번 프로젝트의 팔레트 복사다.
           projection["visibleSlots"]의 각 graph slot의 figure는 위 graphs.chartFigure 계산 결과다.
           Application은 전체 조회 결과를 renderer.applyDashboardProjectionInvalidation의
           projectProjection 인자로 전달하여 팔레트 CSS와 Plotly 표시에 사용한다.
           같은 geometry의 scale·margin·gap·radius 계산은 dashboardGeometry에서 수행한다.
        39. kind=renderer의 slot-image 요청이면: explicit slotId에 대한 images.readEditor와 동일한 Backend 계산; UI selection을 query 내부에서 읽지 않음
        40. kind=renderer의 ui-palette 요청이면: appearance.readPalette와 동일한 palette copy; CSS variable 적용은 Frontend가 수행
        41. renderer의 투영 결과는 한 render 작업에만 소비; 다음 작업은 current authority에서 재조회; mutation 입력이나 장기 project mirror로 재사용 금지
        42. kind=project-api: FastFigureApi read operation에 필요한 project/asset/chart/layout/caption/label/export projection
        43. kind=slot-selection-context: validated slot selection 뒤 optional contentType intent 판단에 필요한 empty/contentType projection
        44. kind=interface-reconciliation: ProjectMutationResult 뒤 current Backend authority에서 계산한 Frontend reconciliation input
        45. kind=renderer: DOM/Plotly renderer가 한 projection 작업에 사용할 immutable project view
        46. kind=export: 한 작업용 immutable snapshot. 일반 project export/import 반환은 기존 whole-project snapshot이다. print.save/print.capture 요청은 같은 작업의 project settings/geometry와 renderer contract의 slot별 precomputed figure/image 입력을 함께 제공한다. transient export input이며 Frontend가 whole-project copy에서 graph domain 계산을 재실행하는 경로를 만들지 않는다.
        47. compatibility/default normalization은 detached copy에서만 수행한다. 중첩 array/object까지 read-only로 반환하고
           Backend 내부 mutable reference, event handler, DOM node, query/command callback은 projection에 포함하지 않는다.
        48. projection를 반환한다.
    """
    return projection


def validateSlotSelection(event, payload):
    validatedInput = "FrontendValidatedInput 딕셔너리."
    """
    Args:
    - event:
      Application이 전달한 Frontend 이벤트 식별자.

    - payload:
      Slot 선택 입력 딕셔너리.

    Return:
    - validatedInput:
      참조 판정 결과. 원형: /backend/project_state/FrontendValidatedInput

    변경:
    - 없음.

    처리:
        1. event와 accepted, reference, workspaceHint, selectionHint를 가진 결과를 구성한다.
           event에는 입력 식별자를 보존한다. 참조가 무효이면 accepted=False를 반환한다.
           명시적인 선택 해제는 accepted=True와 None 참조로 표현한다.
        2. 현재 activeProject._state의 다음 참조를 판정한다.
           slotId를 visible slot에서 resolve한다. workspaceHint는 contentType image이면 slot.image, 아니면 slot.graph다.
           non-null slot에 direction=model-to-fsm이면 clear-graph-object, 그 외 일반 selection은 toggle-clear hint를 반환한다.
           explicit none은 direction과 무관하게 toggle-clear의 명시적 deselection이며 graph/asset 선택을 함께 해제한다.
           hint가 Frontend의 clear 범위를 결정한다. raw direction이나 보존할 asset snapshot을 Frontend input에 추가하지 않는다.
        3. validatedInput를 읽기 전용 결과로 반환한다.
    """
    return validatedInput


def validateAssetSelection(event, payload):
    validatedInput = "FrontendValidatedInput 딕셔너리."
    """
    Args:
    - event:
      Application이 전달한 Frontend 이벤트 식별자.

    - payload:
      asset 선택 입력 딕셔너리.

    Return:
    - validatedInput:
      참조 판정 결과. 원형: /backend/project_state/FrontendValidatedInput

    변경:
    - 없음.

    처리:
        1. event와 accepted, reference, workspaceHint, selectionHint를 가진 결과를 구성한다.
           event에는 입력 식별자를 보존한다. 참조가 무효이면 accepted=False를 반환한다.
           명시적인 선택 해제는 accepted=True와 None 참조로 표현한다.
        2. 현재 activeProject._state의 다음 참조를 판정한다.
           path를 current VFS에서 resolve하고 요청 kind와 일치하는 csv/image/directory만 승인한다.
           reference는 canonical path, selectionHint는 resolved kind다. none이면 hint도 none이다.
        3. validatedInput를 읽기 전용 결과로 반환한다.
    """
    return validatedInput


def validateGraphObjectSelection(event, payload):
    validatedInput = "FrontendValidatedInput 딕셔너리."
    """
    Args:
    - event:
      Application이 전달한 Frontend 이벤트 식별자.

    - payload:
      graph object 선택 입력 딕셔너리.

    Return:
    - validatedInput:
      참조 판정 결과. 원형: /backend/project_state/FrontendValidatedInput

    변경:
    - 없음.

    처리:
        1. event와 accepted, reference, workspaceHint, selectionHint를 가진 결과를 구성한다.
           event에는 입력 식별자를 보존한다. 참조가 무효이면 accepted=False를 반환한다.
           명시적인 선택 해제는 accepted=True와 None 참조로 표현한다.
        2. 현재 activeProject._state의 다음 참조를 판정한다.
           payload["selectedSlotId"] -> visible graph slot -> owning chart -> integer index의 existing editor object를 resolve한다.
           read 과정에서 ensure/normalize로 live chart를 변경하지 않는다. editable chart의 object.csvId가 current CSV에서 resolve되어야 승인한다.
           non-editable conversion object의 editable-object 선택 요청은 accepted=False로 반환한다.
           reference는 index다. selectAsset=True일 때만 CSV canonical path를 selectionHint로 반환하고, False/생략이면 hint none이다.
           explicit index none은 graph selection clear이며 asset selection에 대한 hint를 생성하지 않는다.
        3. validatedInput를 읽기 전용 결과로 반환한다.
    """
    return validatedInput


def buildFrontendReconciliationInput(event, mutationResult, frontendReferences):
    reconciliationInput = "FrontendReconciliationInput 딕셔너리."
    """
    Args:
    - event:
      처리할 이벤트 이름 문자열.

    - mutationResult:
      이번 명령의 ProjectMutationResult. 원형: /backend/project_efsm/ProjectMutationResult

    - frontendReferences:
      현재 Frontend의 selectedSlotId·assetPath·graphObjectIndex를 가진 딕셔너리.

    Return:
    - reconciliationInput:
      FrontendReconciliationInput 딕셔너리.
      FrontendReconciliationInput.

    변경:
    - activeProject와 Frontend state를 변경하지 않는다.

    처리:
        1. committed result와 Frontend의 selectedSlotId/assetPath/graphObjectIndex를 입력으로 받는다. failed result로 이 query를 실행하지 않는다.
        2. result["selectionHints"]["resetInterfaceSelection"]이면 세 reference를 none으로 만든다. 아니면 swapSlotIds에 따라 선택 slot id를 교환하고,
           mergeSlotIds에 포함된 선택 id는 anchorId로 바꾼다. movedPathFrom subtree의 선택 path는 movedPathTo와 기존 상대 suffix로 옮긴다.
        3. 변환된 slot id를 current visible slot에서 resolve하고 invalid면 none으로 만든다.
           asset path를 current VFS에서 resolve한다. clearAssetSelection, removed target 또는 enteringTrash인 trashed target이면 clear한다.
           여전히 존재하는 unrelated selection은 유지한다.
        4. resetInterfaceSelection 또는 clearGraphSelection이면 graph selection을 clear한다. 그 외 reconciled slot의 editable graph chart를 resolve한다.
           result["selectionHints"]에 selectedIndexHint가 있고 함께 제공된 chartId가 그 owning chart와 같으면 그 hint를 index 후보로 사용한다.
           명시적 none은 clear다. matching explicit index hint가 없고 result["selectionHints"]["graphObjectIndexMaps"]에
           current owning chartId의 항목이 있으면 기존 index를 그 indices의 old-index 위치에서 찾아 post-index/none으로 바꾼다.
           original index가 none/non-integer/out-of-range이거나 mapping 값이 none이면 clear한다. 인접 object를 새로 선택하지 않는다.
           mapping은 original index별 한 entry이며 0도 유효한 post-index다. 남은 숫자 index의 단순 범위 검사로 mapping을 대체하지 않는다.
           matching hint/map이 없을 때만 기존 integer index를 유지한다. 다른 chart의 hint/map은 현재 선택에 적용하지 않는다.
           resetInterfaceSelection/clearGraphSelection이 최우선, 그 다음 matching explicit index hint, 그 다음 삭제·이동의 graphObjectIndexMaps 순서다.
           image workspace/non-editable/no chart/none/out-of-range/non-integer 후보면 clear하고, 유효한 후보면 그 index를 반환한다.
           hint는 command의 계산 결과로서 post-commit object 배열에 대해 검증한다. graph object를 ensure/normalize하지 않는다.
           이 index-only 갱신은 asset selection/path를 변경하지 않는다. 별도 SELECT_GRAPH_OBJECT 전이나 사후 hint 적용은 없다.

        5. projectionEffect는 기존 result 안의 referencesRemoved/pathOnly 두 사실만 담는다. visible slot/chart/image reference와 visible ordinary chart object가 참조하는 CSV별 개수의 pre/post 차이에서 제거를 계산한다. index move는 참조 수를 유지한다. pathOnly는 metadata/VFS/asset command이며 실제 dashboard 입력이 같을 때만 true다. dashboard 입력은 layout/annotations/appearance, visible slot geometry/content, 그 slot의 chart editor/graph, 실제 참조 CSV의 rows/headerLines 및 image bytes/mime다. dashboard 비교에는 표시 입력 필드를 사용한다. 참조 중인 bytes/rows가 바뀌면 pathOnly=False다. 이 call-local 비교 결과는 immutable commit delta이며 일반 read store나 mutation input으로 승격하지 않는다.
        6. selectedSlot/assetSelection/assetKind/graphObject에 resolved scalar를 반환한다. workspaceHint는 none이면 project,
           visible image slot이면 slot.image, 그 외 slot.graph다. projectionEffect는 committed result의 실제 reference 제거/targeted 변경 정보로
           Application이 Frontend renderer effect를 결정할 수 있는 값이며 Backend는 Frontend state write를 수행하지 않는다.
        7. ProjectObject/Backend helper를 결과에 넣지 않고 Frontend selection 또는 Backend authority를 이 query에서 변경하지 않는다.
        8. reconciliationInput를 반환한다.
    """
    return reconciliationInput

class ProjectObject:
    def __init__(self, source):
        self._state = {
                "kind": "fast-figure-project-object라는 고정 schema 식별자",
                "meta": {
                    "projectName": "사용자가 지정한 프로젝트 이름",
                    "appBuild": "이 project state를 생성/저장한 application build 표식",
                },
                "layout": {
                    "gridRows": "backend.defaults.limits.layout.gridRows 범위의 grid 행 수",
                    "gridCols": "backend.defaults.limits.layout.gridCols 범위의 grid 열 수",
                    "slotStyle": {
                        "referenceWidth": "dashboard 기준 폭. 단위: px. 초기값은 backend.project_object.layout.slotStyle.referenceWidth.",
                        "gap": "셀 사이 간격. 단위: px. 초기값은 backend.project_object.layout.slotStyle.gap.",
                        "outerMargin": "바깥 여백. 단위: px. 초기값은 backend.project_object.layout.slotStyle.outerMargin.",
                        "radius": "모서리 반경. 단위: px. 초기값은 backend.project_object.layout.slotStyle.radius.",
                        "aspect": "너비 대 높이 비율. 초기값은 backend.project_object.layout.slotStyle.aspect.",
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
                    "directories": "canonical VFS directory 경로 문자열의 배열.",
                },
                "charts": "프로젝트 chart model의 authoritative collection",
                "slots": "이 프로젝트가 소유하는 Slot 인스턴스의 배열",
                "nextId": {
                    "csv": "새 CSV에 사용할 다음 정수 id",
                    "image": "새 image에 사용할 다음 정수 id",
                    "chart": "새 chart에 사용할 다음 정수 id",
                },
                "appearance": {
                    "uiPalette": "프로젝트에 영속되는 Fast Figure UI 색상 palette",
                },
                "export": {
                    "width": "target raster width; backend.defaults.limits.export.logicalWidth",
                    "heightMode": "auto 또는 explicit",
                    "height": "explicit target raster height; backend.defaults.limits.export.logicalHeight",
                    "dpi": "raster metadata DPI; backend.defaults.limits.export.dpi",
                    "format": "png 또는 jpeg",
                },
            }
        candidate = "ProjectObject._state 원형의 딕셔너리."
        """
        Args:
        - source:
          생성 또는 복원을 마친 프로젝트 candidate 딕셔너리.

              원형: /backend/project_state/ProjectObject._state

        Return:
        - outcome:
          None.

        변경:
        - 새 ProjectObject 인스턴스의 self._state를 초기화한다.

        처리:
            1. source를 중첩 딕셔너리·배열과 Slot 인스턴스까지 복사하여 candidate에 둔다.
               각 슬롯은 원래 id, 좌표, span, hidden, content, caption을 보존한 별도 Slot이다.
            2. candidate["slots"]의 각 원소를 normalizeSlotContent에 전달하고 반환된 Slot으로
               같은 배열 위치를 대체한다.
            3. normalizeProjectSettings(candidate)로 누락된 설정과 palette를 정규화한다.
            4. validateProjectObjectState(candidate, True)로 복사한 전체 프로젝트를 검증한다.
               실패하면 이 생성 호출은 실패하며 기존 activeProject를 변경하지 않는다.
            5. 검증한 candidate를 self._state에 대입한다.
               self._state["layout"]은 레이아웃 딕셔너리이며,
               self._state["slots"]는 이 프로젝트가 소유하는 Slot 인스턴스의 배열이다.
               생성된 ProjectObject를 activeProject로 채택하는 작업은 세션 초기화 또는
               검증을 마친 프로젝트 교체의 책임이다.
        """
        return None

    def read(self, path):
        value = "입력 경로 또는 codec 자료형의 값."
        """
        Args:
        - path:
          대상 VFS 경로 문자열.

        Return:
        - value:
          입력 경로 또는 codec 자료형의 값.
          PROJECT_OBJECT_PATHS 또는 등록된 project path가 가리키는 현재 authoritative 값.

        변경:
        - project state를 변경하지 않는다.

        처리:
            1. path가 PROJECT_OBJECT_PATHS의 등록 이름이면 등록된 경로를 사용한다. 직접 지정한 project 경로도 같은 경로 규칙으로 해석한다.
            2. self._state에서 경로의 각 딕셔너리 키를 순서대로 읽는다. 등록되지 않은 이름이나 존재하지 않는 경로는 조회 오류로 전달한다.
            3. 마지막 값의 내부 참조를 value에 두고 반환한다. Backend 내부의 같은 현재 상태 계산에 사용한다.
        """
        return value

    def initialize(self, source):
        candidate = "ProjectObject._state 원형의 딕셔너리."
        previous = "ProjectObject._state 원형의 딕셔너리."
        """
        Args:
        - source:
          입력 프로젝트 상태 딕셔너리.
            원형: /backend/project_state/ProjectObject._state

        Return:
        - previous:
          교체 전 프로젝트 상태 딕셔너리.

        변경:
        - self._state를 candidate로 한 번 교체한다.

        처리:
            1. self._state를 previous에 둔다.
            2. source를 중첩 배열·딕셔너리와 Slot 인스턴스까지 복사하여 candidate에 둔다.
               원래 id·좌표·span·hidden·content·caption과 슬롯 순서를 보존한다.
            3. candidate["slots"]의 각 원소를 normalizeSlotContent에 전달하고
               같은 위치의 원소를 반환된 Slot으로 대체한다.
            4. normalizeProjectSettings(candidate)를 호출한다.
            5. validateProjectObjectState(candidate, True)로 전체 구조와 참조를 검증한다.
               실패하면 오류를 전달하고 self._state와 이전 Slot은 유지한다.
            6. 검증 성공 후 self._state를 candidate로 한 번 교체한다.
            7. 교체 후 자원 정리의 호출 입력으로 previous를 반환한다.
        """
        return previous


class ProjectObjectRegistry:
    def read(self, name):
        project = "ProjectObject 인스턴스. 원형: /backend/project_state/ProjectObject"
        object_value = "등록된 프로젝트 경로의 값."
        """
        Args:
        - name:
          이름 문자열.

        Return:
        - object_value:
          등록된 프로젝트 경로의 값.
          등록된 이름이 현재 activeProject에서 가리키는 값.

        변경:
        - 없음.

        처리:
            1. PROJECT_OBJECT_PATHS에서 name의 경로를 확인한다. 등록되지 않은 이름은 조회 오류다.
            2. 이번 호출에서 activeProject를 한 번 읽어 project에 둔다.
            3. project.read(경로)의 값을 object_value에 두고 반환한다.
        """
        return object_value

    def snapshot(self, names):
        project = "ProjectObject 인스턴스. 원형: /backend/project_state/ProjectObject"
        snapshot = "이번 작업의 읽기 전용 딕셔너리."
        """
        Args:
        - names:
          PROJECT_OBJECT_PATHS에 등록된 이름 문자열의 배열.

        Return:
        - snapshot:
          이번 작업의 읽기 전용 딕셔너리.
          지정된 project object들의 작업 시점 deep copy.

        변경:
        - authoritative state를 변경하지 않는다.

        처리:
            1. 이번 호출의 activeProject를 project에 한 번 읽는다.
            2. names를 순서대로 검사하고 각 이름을 PROJECT_OBJECT_PATHS의 등록 경로로 해석한다. 미등록 이름은 오류로 전달한다.
            3. 같은 project.read(경로)의 값을 Slot과 중첩 딕셔너리·배열까지 분리 복사하여 snapshot의 해당 이름에 넣는다.
            4. 모든 값을 포함한 snapshot을 읽기 전용 결과로 반환한다.
        """
        return snapshot


def normalizeProjectSettings(state):
    """
    Args:
    - state:
      호출자 소유의 프로젝트 작업 딕셔너리.
        원형: /backend/project_state/ProjectObject._state

    Return:
    - state:
      설정 필드를 정규화한 입력 딕셔너리.

    변경:
    - 입력 state의 설정 필드를 변경한다.

    처리:
        1. backend 설정 자료와 backend.project_object 및 backend.defaults의 필수 경로를 확인한다.
           자료 누락·잘못된 형식·필수 경로 누락은 구성 오류로 전달한다.
        2. backend.project_object의 layout·annotations·export 설정 구조를 순회한다.
           각 설정 키가 state에 없으면 해당 기본값을 중첩 자료까지 복사한다.
           이미 있는 딕셔너리는 그 하위 키를 같은 방법으로 검사한다.
           명시된 False·0·빈 문자열과 caption 본문·이름은 보존한다.
           설정의 자료형·범위 위반은 validateProjectObjectState의 검증에 전달한다.
        3. DEFAULT_UI_PALETTE의 각 키에 대해 state의 appearance.uiPalette 값을 확인한다.
           값이 #와 여섯 hex digit의 문자열이면 대소문자를 보존한다.
           누락·무효 값은 해당 키의 기본색을 복사하고, 정의되지 않은 palette 키는 버린다.
        4. state의 layout에 layoutMapWidth가 있으면 제거한다.
        5. state를 반환한다.
    """
    return state


def slotHasNonDefaultLocalState(slot):
    defaultSlot = "Slot 인스턴스. 원형: /backend/project_state/Slot"
    nonDefault = "논리값."
    """
    Args:
    - slot:
      Slot 인스턴스.
        원형: /backend/project_state/Slot

    Return:
    - nonDefault:
      content 또는 caption이 기본 슬롯의 값과 다르면 True인 논리값.

    변경:
    - 없음.

    처리:
        1. Slot(slot.id, slot.row, slot.col)을 생성하여 defaultSlot에 둔다.
        2. slot.content와 defaultSlot.content를 중첩 키와 값까지 비교하고,
           slot.caption과 defaultSlot.caption을 비교한다.
        3. 차이가 하나라도 있으면 nonDefault=True, 모두 같으면 False로 둔다.
           content의 추가 필드도 비교 대상에 포함한다.
        4. nonDefault를 반환한다.
    """
    return nonDefault


def normalizeSlotContent(slot):
    sourceContent = {
        "present": "정규화 전 입력에 content 필드가 존재하는지 나타내는 논리값.",
        "value": "content 딕셔너리 또는 None.",
    }
    sourceCaption = {
        "present": "정규화 전 입력에 caption 필드가 존재하는지 나타내는 논리값.",
        "value": "caption 문자열 또는 None.",
    }
    normalizedSlot = "Slot 인스턴스. 원형: /backend/project_state/Slot"
    """
    Args:
    - slot:
      작업 candidate의 Slot 인스턴스 또는 저장 자료에서 복원한 슬롯 딕셔너리.

        Slot 인스턴스:
          원형: /backend/project_state/Slot

    Return:
    - slot:
      canonical 속성을 갖춘 Slot 인스턴스. Slot 입력은 같은 인스턴스다.
        딕셔너리 입력은 같은 식별자와 배치를 가진 새 인스턴스로 변환한다.

    변경:
    - 입력이 Slot이면 그 candidate 인스턴스의 content와 caption을 정규화한다.
    - 입력이 딕셔너리이면 새 Slot만 구성하고 원본 딕셔너리는 보존한다.

    처리:
        1. 기본값을 채우기 전에 입력의 content와 caption 필드 존재 여부를 각각
           sourceContent["present"], sourceCaption["present"]에 기록한다.
           Slot이면 slot.content와 slot.caption, 딕셔너리이면 해당 키의 값을 읽어
           각각의 value에 분리 복사한다. 부재는 present=False와 value=None으로 기록한다.
           content가 존재하면서 딕셔너리가 아니면 정규화를 실패시킨다.
           필드 부재와 존재하는 None, False, 0, 빈 문자열을 구별한다.
        2. Slot 입력이면 normalizedSlot에 그 인스턴스를 대입한다.
           딕셔너리 입력이면 입력의 id, row, col을 인자로 Slot을 생성하고 normalizedSlot에 둔다.
           입력의 rowSpan, colSpan, hidden도 보존한다. 저장 입력의 필수 배치 정보가
           누락되거나 잘못되었으면 변환을 거부한다. 이 조건은 Slot 원형과 전체 프로젝트의
           배치 검증 조건을 따른다. 입력 content의 추가 키와 별도 저장 속성도 분리 복사하여 보존한다.
        3. sourceContent["present"]가 True이면 그 value 딕셔너리의 추가 키를 보존한다.
           이어서 Slot.content 원형의 각 canonical 필드를 채운다. 원래 content 딕셔너리에 해당 키가 있으면 그 값을 복사한다.
           없을 때만 같은 입력의 flat legacy 필드를 사용한다.
           두 위치 모두 없으면 Slot 생성자가 사용하는 해당 content 기본값을 별도로 복사한다.
           imageSettings가 딕셔너리이면 저장된 하위 필드를 보존하고 누락된 설정만 기본값으로 채운다.
           존재하는 필드의 형식 오류는 기본값으로 바꾸지 않고 프로젝트 검증의 실패로 전달한다.
        4. sourceCaption["present"]가 True이면 sourceCaption["value"]를 보존한다.
           False이고 sourceContent["present"]가 True이며 그 value에 caption 키가 있으면
           그 값을 이동한다. 두 위치 모두 없으면
           normalizedSlot.caption에 None을 대입한다. 화면 안내 문구를 생성하지 않는다.
        5. canonical 값으로 옮긴 flat legacy 속성과 content 안의 caption을 제거한다.
           chart/imageId는 같은 프로젝트 컬렉션을 가리키는 id로 유지한다.
           참조 대상의 존재와 소유 관계는 validateProjectObjectState가 검증한다.
        6. slot에 normalizedSlot을 대입하고 반환한다.
    """
    return slot


def validateProjectObjectState(state, requireSlots):
    """
    Args:
    - state:
      이번 작업의 프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state

    - requireSlots:
      하나 이상의 슬롯을 요구하는지 나타내는 논리값.

    Return:
    - state:
      프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state
      모든 구조 및 참조 검증을 통과한 동일 state.

    변경:
    - 없음.

    처리:
        1. - project top-level structure와 필수 nested object가 존재한다.
           - gridRows/gridCols는 backend.defaults.limits.layout의 gridRows/gridCols 범위에 속하는 정수다.
           - slotStyle 수치와 boolean이 허용 범위에 있다.
           - label position은 finite이고 fontSize는 backend.defaults.limits.labels.fontSizeMin 이상이다.
           - export width/height mode/height/dpi/format이 정의된 범위와 관계를 만족한다.
           - figure 의미가 없는 legacy layoutMapWidth를 authoritative state로 요구하지 않는다.
           - persistent UI palette의 필수 색상은 유효한 6-digit hex다.
           - VFS directory path는 정규화되어 있고 중복이 없으며 고정 directory가 존재한다.
           - CSV/image id와 전체 asset path는 중복되지 않는다.
           - asset directory는 VFS에 존재한다.
           - chart id는 유일하다.
           - 모든 chart에 sourcescript.backend.graphs의 validateChartModel을 적용한다. editable chart는 graph object가 0개여도 유효하다.
           해당 validator가 실제 project CSV object로 판정한 object만 CSV/column 참조 검증 집합에 넣는다. non-editable conversion view는 넣지 않으며
           chart/Plotly/imported representation의 구조 검증은 그대로 수행한다. 이곳에 별도 완화/강화 validator를 만들지 않는다.
           - state["slots"]의 모든 원소가 Slot 인스턴스이며 id와 geometry가 유효하고 grid 범위를 넘지 않는다.
           - slot은 chart와 image를 동시에 참조하지 않는다.
           - slot chart/image 참조 대상이 존재한다.
           - slot.content["imageSettings"]는 fit/scale/x/y schema와 허용 범위를 만족한다.
           - image asset에는 slot-local display settings를 요구하지 않는다.
           - 각 chart는 정확히 하나의 slot에서 참조되며 shared chart와 orphan chart가 없다.
           - unset slot caption은 null/empty이고 UI placeholder를 project 값으로 요구하지 않는다.
           - nextId는 해당 collection의 현재 최대 id보다 크다.
           - requireSlots가 참이면 적어도 하나의 slot이 존재한다.

        2. editable chart는 editor.objects가 빈 배열인 상태를 직접 표현할 수 있다. 빈 graph를 표현하기 위한 보호 CSV 또는 가짜 graph object를 만들지 않는다.
        3. 존재하는 chart는 정확히 하나의 slot이 소유한다. slot은 chart를 0개 또는 1개 참조할 수 있고 각 chart는 정확히 한 Slot이 소유한다. 공유되거나 소유자가 없는 chart는 거부한다.
        4. slot.content["chart"] 필드를 검증한다: state["charts"]에서 같은 chart id를 resolve해야 하며 각 chart id는 정확히 하나의 slot에서만 나타나야 한다.
        5. slot.content["imageId"] 필드를 검증한다: state["assets"]["images"]에서 같은 image id를 resolve해야 한다.
        6. chart.editor.objects[].csvId 필드를 검증한다: validateChartModel이 실제 project CSV object로 판정한 object만 state['assets']['csvFiles']에서 같은 CSV id를 resolve한다. non-editable imported chart의 conversion view는 project CSV 참조 집합에 넣지 않는다. 검증·reference 수집·package remap은 sourcescript.backend.graphs의 validateChartModel과 같은 editable 판정을 사용한다.
        7. asset path인 경우: asset.directory와 asset.name을 projectVfs에서 결합해 resolve한다.
        8. nextId 필드를 검증한다: 각 collection에 존재하는 최대 id보다 커야 한다.
        9. slot.caption 필드를 검증한다: slot object 자체에 귀속된 local text다. 별도 project caption reference를 만들지 않으며 slot object가 layout position 사이에서 이동하면 같은 slot-local state로 함께 이동한다.
        10. state를 반환한다.
    """
    return state






def createProjectState():
    row = "생성할 슬롯의 행 번호. 1부터 세는 정수."
    col = "생성할 슬롯의 열 번호. 1부터 세는 정수."
    id = "현재 행과 열에서 슬롯 식별자."
    state = "프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state"
    """
    Args:
    - 없음.

    Return:
    - state:
      프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state
      모든 project invariant를 만족하는 새 candidate project state.

    변경:
    - activeProject를 직접 변경하지 않는다.

    처리:
        1. kind=fast-figure-project-object, meta.projectName=empty text, meta.appBuild=current application build marker를 instance data로 만들고
           layout은 backend.project_object.layout 설정에서 만든다. build marker의 실제 공급 API는 platform primitive다.
        2. label/caption authoritative state를 기본값으로 만든다.
           slot caption placeholder는 저장하지 않는다.
        3. CSV/image/chart collection은 empty로 시작한다.
           빈 graph용 default CSV나 fake graph object를 만들지 않는다.
        4. 고정 VFS directory와 next-id sequence를 만든다.
        5. persistent appearance와 export settings를 만든다.
        6. state["layout"]의 gridRows와 gridCols로 행 우선 순회한다. row와 col은 1부터 세며
           id=(row-1)*state["layout"]["gridCols"]+(col-1)로 계산한다. 각 좌표마다 Slot(id, row, col)을 호출하고
           새 인스턴스를 state["slots"] 배열 끝에 넣는다. 각 인스턴스의 span·hidden·빈 참조·
           caption과 content 설정 초기화는 Slot.__init__이 수행한다.

        7. backend.project_object.layout.gridRows/gridCols에서 초기 grid 설정을 읽는다.
        8. 새 project의 layout.slotStyle은 SLOT_STYLE_DEFAULTS를 사용한다. 저장된 project에 명시된 유효 slotStyle은 그대로 유지한다.
        9. 초기 grid의 각 cell은 1 x 1 empty slot이며 chart/image reference, caption은 empty, imageSettings는 slot-local default를 가진다.
        10. 초기 CSV/image collection은 비어 있으며 보호된 default CSV를 만들지 않는다.
        11. 초기 chart collection은 비어 있다.
        12. settings.json의 backend.project_object.annotations.labels 설정만 deep-copy한다. create/load missing 처리는 project_state.ProjectObject.initialize의 label/caption 구성 처리을 따른다.
        13. settings.json의 backend.project_object.annotations.captions 설정만 복사하며 load missing은 project_state.ProjectObject.initialize의 label/caption 구성 처리을 따른다. text/afterText/name은 새 instance 생성 시 empty text로 만들고 저장 데이터는 그대로 복원한다. 각 초기 slot.caption도 empty이며 slot caption editor mode는 project state에 저장하지 않는다.
        14. target width는 초기 layout referenceWidth에서 계산하고 나머지 설정은 backend.project_object.export에서 읽는다. auto의 미지정 height는 기존 생성 알고리즘으로 만들며 config에 geometry 결과를 저장하지 않는다.
        15. backend.defaults.vfs의 root/csv/image/trash 설정으로 고정 directory instance를 만든다.
        16. csv/image/chart 모두 collection의 첫 새 id를 가리키는 값에서 시작한다.
        17. DEFAULT_UI_PALETTE를 복사해 project persistent palette로 시작한다. reset/set/load도 project_state.ProjectObject.initialize의 palette 정규화 처리을 공유한다.
        18. validateProjectObjectState(state, True)로 검증한 state를 반환한다.
        19. state를 반환한다.
    """
    return state


def resolveVisibleSlot(slotId, state):
    slot = "Slot 인스턴스 또는 None."
    """
    Args:
    - slotId:
      조회할 슬롯의 정수 식별자 또는 None. 0은 유효한 식별자다.

    - state:
      이번 조회가 사용하는 프로젝트 상태 딕셔너리.

          원형: /backend/project_state/ProjectObject._state
          Source of Truth: /backend/project_state/activeProject._state
        명령의 candidate를 검사하는 호출에서는 그 명령이 소유한 candidate를 전달한다.

    Return:
    - slot:
      Slot 인스턴스 또는 None.
      같은 id를 가지며 hidden이 False인 Slot 인스턴스 또는 None.
          원형: /backend/project_state/Slot
          Source of Truth: 인자로 전달한 state["slots"]의 원소.

    변경:
    - 없음.

    처리:
        1. slotId가 None이거나 정수 식별자가 아니면 slot에 None을 대입한다.
        2. 그 외에는 state["slots"]를 저장 순서대로 확인한다.
           원소의 id가 slotId와 같고 hidden이 False인 원소를 slot에 대입한다.
           슬롯 id의 유일성은 validateProjectObjectState의 프로젝트 불변식이다.
        3. 일치하는 표시 슬롯이 없으면 slot에 None을 대입한다.
        4. slot을 반환한다. 외부 읽기 경계는 필요한 필드를 분리 복사한다.
           이 내부 조회 결과를 수정하는 것은 해당 candidate를 소유한 명령의 책임이다.
           slot를 반환한다.
    """
    return slot


def resolveOwningSlot(chartId, state):
    owner = "Slot 인스턴스 또는 None."
    """
    Args:
    - chartId:
      대상 chart의 정수 id.

    - state:
      이번 작업의 프로젝트 상태 딕셔너리. 원형: /backend/project_state/ProjectObject._state

    Return:
    - owner:
      Slot 인스턴스 또는 None.
      chartId를 참조하는 유일한 slot.
      - 없음:
        chartId가 존재하지 않거나 valid ownership을 만들지 못하는 경우.

    변경:
    - 없음.

    처리:
        1. state["slots"]의 Slot 인스턴스에서 slot.content["chart"]가 chartId인 원소를 모두 수집한다.
           정확히 하나일 때만 그 slot을 owner로 resolve한다.
           shared/orphan 상태를 임의로 clone/drop하여 고치지 않는다.
           owner를 반환한다.
    """
    return owner

def getProjectCsv(csvId):
    csv = "csvAsset 딕셔너리 또는 None."
    """
    Args:
    - csvId:
      프로젝트 CSV의 정수 id.

    Return:
    - csv:
      csvAsset 딕셔너리 또는 None.
      activeProject._state["assets"]["csvFiles"]에서 csvId로 resolve한 asset 또는 없음.

    변경:
    - 없음.

    처리:
        1. activeProject._state["assets"]["csvFiles"]를 저장 순서대로 검사한다.
        2. id가 csvId와 같은 첫 원소를 csv에 둔다. 일치하는 원소가 없으면 csv는 None이다.
        3. csv를 반환한다. 호출한 Backend 계산이 같은 현재 프로젝트에서 소비하는 참조다.
    """
    return csv


def getProjectImage(imageId):
    image = "imageAsset 딕셔너리 또는 None."
    """
    Args:
    - imageId:
      프로젝트 이미지의 정수 id.

    Return:
    - image:
      imageAsset 딕셔너리 또는 None.
      activeProject._state["assets"]["images"]에서 imageId로 resolve한 asset 또는 없음.

    변경:
    - 없음.

    처리:
        1. activeProject._state["assets"]["images"]에서 id가 imageId와 같은 원소를 image에 둔다.
        2. 원소가 없으면 image를 None으로 둔다.
        3. image를 반환한다.
    """
    return image


def getChart(chartId):
    chart = "chartModel 딕셔너리 또는 None."
    """
    Args:
    - chartId:
      대상 chart의 정수 id.

    Return:
    - chart:
      chartModel 딕셔너리 또는 None.
      activeProject._state["charts"]에서 chartId로 resolve한 chart 또는 없음.

    변경:
    - 없음.

    처리:
        1. activeProject._state["charts"]에서 id가 chartId와 같은 원소를 chart에 둔다.
        2. 원소가 없으면 chart를 None으로 둔다.
        3. chart를 반환한다.
    """
    return chart

# Backend provider dependencies; module imports do not create a second state authority.
from sourcescript.backend import assets_files, graphs, layout_annotations
