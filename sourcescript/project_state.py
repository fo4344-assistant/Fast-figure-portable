"""
Fast Figure Source Script — authoritative project state and references

현재 구현 원천:
- ../fast-figure.js
  createProjectState, ProjectObject, ProjectObjectRegistry,
  normalizeSlotContent, validateProjectObjectState, projectVfs,
  getProjectCsv/getProjectImage/getChart/slotAt.
"""

PROJECT_OBJECT_PATHS = {
    "project": "meta project information의 공식 read path",
    "layout": "grid와 slotStyle의 공식 read path",
    "labels": "label annotation state의 공식 read path",
    "captions": "caption annotation state의 공식 read path",
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
        "layoutMapWidth": (
            "현재 하위 구현에 남아 있는 optional layout preview width. "
            "Source Script에서는 실제 producer/consumer가 확인될 때까지 제거 검토 대상이며 "
            "figure 의미를 결정하는 값으로 사용하지 않는다."
        ),
        "slotStyle": {
            "referenceWidth": "dashboard 기준 폭; 현재 허용 범위 100..20000",
            "gap": "slot 사이 기준 간격; 현재 허용 범위 0..2000",
            "outerMargin": "dashboard 기준 바깥 여백; 현재 허용 범위 0..5000",
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
            "enabled": "caption 표시 여부",
            "slotMode": "전체 caption 대신 선택 slot caption을 편집하는지 여부",
            "text": "전체 caption의 앞쪽 본문",
            "afterText": "전체 caption의 뒤쪽 본문",
            "name": "전체 caption 이름",
            "nameBold": "전체 caption 이름 굵게 표시 여부",
            "settings": "caption font/size/line-height 설정",
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
    "settings": "fit/scale/x/y image renderer 설정",
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
    },
    "caption": (
        "slot annotation text 또는 없음. graph/image renderable content와 의미적으로 분리한다. "
        "UI placeholder 문자열은 authoritative caption 값으로 저장하지 않는다."
    ),
}

SLOT_REPRESENTATION_RULE = (
    "renderable content(chart/image/contentType)와 slot caption annotation은 서로 다른 의미다. "
    "하위 구현이 compatibility를 위해 flat property 또는 nested content alias를 사용할 수는 있지만 "
    "그 representation이 caption ownership이나 이동 semantics를 결정하지 않는다."
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

REFERENCE_RELATIONS = {
    "slot.chart": (
        "activeProject.charts에서 같은 chart id를 resolve해야 하며 "
        "각 chart id는 정확히 하나의 slot에서만 나타나야 한다."
    ),
    "slot.imageId": "activeProject.images에서 같은 image id를 resolve해야 한다.",
    "chart.editor.objects[].csvId": "activeProject.csvFiles에서 같은 CSV id를 resolve해야 한다.",
    "asset path": "asset.directory와 asset.name을 projectVfs에서 결합해 resolve한다.",
    "nextId": "각 collection에 존재하는 최대 id보다 커야 한다.",
    "slot.caption": "slot 자체의 annotation이며 graph/image object id와 별도 reference를 만들지 않는다.",
}

activeProject = (
    "현재 세션의 유일한 authoritative ProjectObject. "
    "영속 project 값의 일반 읽기 원천이며 변경은 core command/API/FSM 경계를 통해 수행한다."
)

projectObjects = (
    "ProjectObjectRegistry. 이름을 PROJECT_OBJECT_PATHS 또는 명시적 read adapter와 연결하고 "
    "매 read 시 activeProject에서 값을 다시 읽는다. snapshot은 export 같은 단일 작업용 복사본이다."
)

projectVfs = (
    "activeProject.fileSystem.directories와 asset directory/name을 함께 해석하는 VFS helper. "
    "별도 파일 트리 SoT를 갖지 않고 activeProject state에서 resolve한다."
)

selectedSlotId = (
    "영속 project state가 아닌 현재 UI/runtime slot 선택 id. "
    "같은 slot을 UI 방향으로 다시 선택하면 현재 구현에서는 선택이 해제된다."
)

editing = (
    "현재 활성 graph chart를 가리키는 core-internal runtime pointer. "
    "project에 직렬화되지 않고 frontend read authority로 노출하지 않는다."
)


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


def normalizeSlotContent(slot):
    """
    Return:
    - slot:
      renderable content와 caption annotation이 의미적으로 분리된 동일 slot object.

    변경:
    - 전달된 candidate slot representation만 정규화한다.

    처리:
    1. chart/image/contentType은 하나의 renderable-content 원천으로 정규화한다.
    2. caption은 slot annotation 원천으로 정규화한다.
    3. legacy representation에서 caption이 nested content 안에 있으면 같은 caption annotation으로 이동한다.
    4. UI placeholder 문자열을 새 authoritative caption 값으로 생성하지 않는다.
    5. compatibility alias가 필요하더라도 같은 의미에 두 저장값을 두지 않는다.
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
    - persistent UI palette의 필수 색상은 유효한 6-digit hex다.
    - VFS directory path는 정규화되어 있고 중복이 없으며 고정 directory가 존재한다.
    - CSV/image id와 전체 asset path는 중복되지 않는다.
    - asset directory는 VFS에 존재한다.
    - chart id는 유일하다.
    - editable chart는 graph object가 0개여도 유효하며, 존재하는 graph object의 CSV 참조는 모두 resolve된다.
    - slot id와 geometry가 유효하고 grid 범위를 넘지 않는다.
    - slot은 chart와 image를 동시에 참조하지 않는다.
    - slot chart/image 참조 대상이 존재한다.
    - 각 chart는 정확히 하나의 slot에서 참조되며 shared chart와 orphan chart가 없다.
    - unset slot caption은 null/empty이고 UI placeholder를 project 값으로 요구하지 않는다.
    - nextId는 해당 collection의 현재 최대 id보다 크다.
    - requireSlots가 참이면 적어도 하나의 slot이 존재한다.
    """
    return state



DEFAULT_PROJECT_RULES = {
    "grid": "새 project는 2 x 2 grid에서 시작한다.",
    "slots": "초기 grid의 각 cell은 1 x 1 empty slot이다.",
    "assets": "초기 CSV/image collection은 비어 있으며 보호된 default CSV를 만들지 않는다.",
    "charts": "초기 chart collection은 비어 있다.",
    "labels": "초기에는 disabled, position은 reference origin, 기본 formatting/font settings를 사용한다.",
    "captions": "초기에는 disabled, slot mode도 disabled, global/slot caption text는 비어 있다.",
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
    1. project meta와 2 x 2 layout/default slot style을 만든다.
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
