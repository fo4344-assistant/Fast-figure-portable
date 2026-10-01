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
        "layoutMapWidth": "layout preview가 저장하는 optional width 값",
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
}

csvAsset = {
    "id": "project 안에서 유일한 양의 정수 CSV id",
    "name": "VFS file name",
    "directory": "projectVfs의 존재하는 directory path",
    "rows": "파싱된 2차원 data table",
    "bytesBase64": "원본 asset bytes의 base64 표현",
    "mime": "원본 또는 정규화된 MIME",
    "headerLines": "table 선두에서 header로 취급할 행 수",
    "isDefaultEmpty": "보호된 기본 빈 CSV인지 여부; 해당 asset에만 사용",
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
        "caption": "slot별 caption text 또는 없음",
    },
}

SLOT_COMPATIBILITY_RULE = (
    "현재 구현은 slot.content를 내부 구조로 사용하면서 slot.chart, slot.imageId, "
    "slot.contentType, slot.caption property를 같은 content의 alias로 제공한다. "
    "이 alias는 별도 저장값이 아니라 동일한 원천을 읽고 쓴다. "
    "toJSON은 기존 flat slot representation을 출력해 파일 호환성을 유지한다."
)

REFERENCE_RELATIONS = {
    "slot.chart": "activeProject.charts에서 같은 chart id를 resolve해야 한다.",
    "slot.imageId": "activeProject.images에서 같은 image id를 resolve해야 한다.",
    "chart.editor.objects[].csvId": "activeProject.csvFiles에서 같은 CSV id를 resolve해야 한다.",
    "asset path": "asset.directory와 asset.name을 projectVfs에서 결합해 resolve한다.",
    "nextId": "각 collection에 존재하는 최대 id보다 커야 한다.",
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
        - 현재 ProjectObject의 전체 authoritative state를 검증된 source state로 교체한다.

        처리:
        1. source slot을 normalizeSlotContent 규칙에 맞춘다.
        2. validateProjectObjectState로 전체 구조와 참조를 검증한다.
        3. 검증 성공 후에만 내부 state reference를 교체한다.
        4. 이전 state를 rollback용 반환값으로 제공한다.
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
      content 구조와 compatibility alias가 연결된 동일 slot object.

    변경:
    - 전달된 slot의 내부 representation을 정규화한다.
    - chart/image/contentType/caption의 별도 독립 값을 만들지 않는다.

    처리:
    legacy flat field가 있고 content field가 없으면 content에 값을 이전한다.
    alias getter/setter는 항상 slot.content의 같은 값을 resolve한다.
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
    - persistent UI palette의 필수 색상은 유효한 6-digit hex다.
    - VFS directory path는 정규화되어 있고 중복이 없으며 고정 directory가 존재한다.
    - CSV/image id와 전체 asset path는 중복되지 않는다.
    - asset directory는 VFS에 존재한다.
    - chart id는 유일하고 chart 내부 CSV 참조가 유효하다.
    - slot id와 geometry가 유효하고 grid 범위를 넘지 않는다.
    - slot은 chart와 image를 동시에 참조하지 않는다.
    - slot chart/image 참조 대상이 존재한다.
    - nextId는 해당 collection의 현재 최대 id보다 크다.
    - requireSlots가 참이면 적어도 하나의 slot이 존재한다.
    """
    return state


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
