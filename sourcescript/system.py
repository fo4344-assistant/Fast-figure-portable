"""
Fast Figure Source Script — system boundary and reverse-review index

작성 단계:
- 기존 구현을 검증 자료로 사용해 Source Script의 의미를 정규화하는 단계다.
- 이 파일은 실행 가능한 Python 구현이 아니라 Python 문법을 작성 표기법으로 사용하는 구현 명세다.

권위와 검증 원천:
- ../agent_space/policies/development-policy.md:
  Source Script 작성·닫힘·Source of Truth·참조·최소 구현 원칙의 상위 정책 원천.
- ../README.md:
  Fast Figure의 공개 목적과 project/FFPX/FFSX/Plotly 계약을 확인하는 프로젝트 문서.
- ../fast-figure.js, ../fast-figure-ui.js, ../Fast-figure.html:
  현재 하위 구현의 동작, 누락, 중복, 호환 상태를 조사하는 검증 자료.
  Source Script와 충돌할 때 구현 현황을 이유로 Source Script 의미를 자동 결정하지 않는다.
- ../vendor/plotly.min.js, ../vendor/fast-figure-ui-runtime.js:
  renderer/runtime 외부 dependency의 실제 제공 원천.
- ../scripts/build-portable.py:
  split source를 단일 portable HTML로 결합하는 현재 build 검증 자료.
"""

IMPLEMENTATION_SOURCES = {
    "Fast-figure.html": "renderer host와 script/CSS loading의 하위 구현 검증 자료",
    "fast-figure.js": "project/domain/FSM/API/renderer/file semantics의 하위 구현 검증 자료",
    "fast-figure-ui.js": "Mantine frontend와 UI-local interaction의 하위 구현 검증 자료",
    "vendor/plotly.min.js": "Plotly graph rendering 원천",
    "vendor/fast-figure-ui-runtime.js": "React와 Mantine runtime 원천",
    "scripts/build-portable.py": "portable single-file packaging 원천",
}

from sourcescript.backend import project_state, project_efsm, assets_files, graphs, layout_annotations
from sourcescript.application import adapter, public_api
from sourcescript.frontend import interface_fsm, mantine_ui, renderer
from sourcescript.portable_build import portable_build

SOURCE_SCRIPT_LOGICAL_HIERARCHY = {
    "Backend": {
        "project-state": "sourcescript.backend.project_state — project authority, reference/invariant와 query provider",
        "project-efsm": "sourcescript.backend.project_efsm — persistent command validation/commit",
        "asset-domain": "sourcescript.backend.assets_files — VFS, asset/package parse와 candidate calculation",
        "graph-domain": "sourcescript.backend.graphs — chart/CSV/object normalization, validation과 projection calculation",
        "layout-annotation-domain": "sourcescript.backend.layout_annotations — persistent layout/image/annotation/export calculation과 read",
    },
    "Application boundary": {
        "command-query-adapter": "sourcescript.application.adapter — command/query/result/lifecycle orchestration",
        "public-api": "sourcescript.application.public_api — FastFigureApi contract와 public wrappers",
    },
    "Frontend": {
        "frontend-fsm": "sourcescript.frontend.interface_fsm — session/runtime transitions",
        "mantine-ui": "sourcescript.frontend.mantine_ui — component-local interaction과 UI composition",
        "renderer": "sourcescript.frontend.renderer — DOM/Plotly/image/raster presentation과 display resource lifetime",
    },
    "Portable build": {
        "portable-build": "sourcescript.portable_build.portable_build — split source -> single-file artifact packaging",
    },
}

SOURCE_SCRIPT_FILE_PLACEMENT_RULE = (
    "system.py 아래 backend/, application/, frontend/, portable_build/는 위 의미 영역을 물리 경로에 반영한다. "
    "각 자식의 의미는 부모의 의미 영역에 포함되며 호출 관계/파일 편의 때문에 부모를 정하지 않는다. "
    "application/public_api/__init__.py, assets.py, graphs.py, layout_annotations.py는 하나의 기존 public-api 논리 모듈을 "
    "구성하는 물리 파일이다. 새 독립 논리 자식이나 별도 API authority가 아니다. "
    "domain 계산, public wrapper, UI/renderer 책임을 각 owner 경로에 두고 평면 compatibility 재수출 파일은 남기지 않는다. "
    "import는 다른 명세의 책임과 식별자를 재사용하며 Backend↔Frontend direct state 접근 권한을 만들지 않는다. "
    "하위 단계는 이 논리 hierarchy를 보존한다. 이 파일 이동만으로 하위 계층의 번역 완료를 주장하지 않는다."
)

SOURCE_SCRIPT_DECOMPOSITION_RULE = (
    "system.py가 Fast Figure 전체 시스템 경계다. 그 직접 논리 하위는 Backend, Application boundary, Frontend, Portable build다. "
    "Backend와 Frontend는 서로의 내부 state/helper/FSM을 직접 호출하거나 읽지 않고 모든 cross-layer command/query/result를 "
    "Application boundary의 API/Adapter contract로 교환한다. Portable build는 runtime 계층의 자식이 아니라 system-level packaging 책임이다. "
    "하위 PlusCal/verification/Source Code는 이 논리 hierarchy를 평탄화·병합·우회하거나 새로운 중간 authority를 추가하지 않는다."
)


PROJECT_PURPOSE_INVARIANTS = {
    "figure-workspace": (
        "Fast Figure는 tabular data와 image에서 scientific figure draft를 빠르게 구성하는 slot-based workspace다. "
        "graph, image placement, layout, label, caption, project packaging, raster/Plotly export가 같은 project 의미 위에서 동작한다."
    ),
    "local-processing": (
        "ordinary use의 loaded data와 image 처리는 browser local runtime에서 수행한다. "
        "core workflow에 server, account, mandatory network connection을 요구하지 않는다."
    ),
    "portable-runtime": (
        "배포 artifact는 단일 Fast-figure.html로 실행 가능해야 하며 core runtime dependency는 portable artifact 안에 포함한다."
    ),
    "complete-project-state": (
        "ProjectObject와 FFPX는 한 figure의 complete persistent state를 표현한다. "
        "session-only selection, pointer/modal draft, telemetry는 persistent project에 포함하지 않는다."
    ),
    "copied-assets": (
        "FFPX는 CSV/image의 project copy bytes를 package 내부에 보존한다. "
        "저장·이동·재개방에 원본 filesystem path나 원본 file object가 필요하지 않아야 한다."
    ),
    "interchange-boundaries": (
        "Plotly JSON은 one graph figure interchange, FFSX는 one graph slot + referenced CSV + slot-local caption, "
        "FFPX는 complete project container 책임을 가진다. 서로의 책임을 암묵적으로 확대하지 않는다."
    ),
}

RUNTIME_LOAD_ORDER = [
    "Fast-figure.html이 renderer host DOM과 스타일을 제공한다.",
    "vendor/plotly.min.js가 Plotly renderer를 제공한다.",
    "vendor/fast-figure-ui-runtime.js가 React와 Mantine runtime을 제공한다.",
    "fast-figure.js가 project/domain/FSM/API와 functional renderer를 초기화한다.",
    "fast-figure-ui.js가 기존 API와 UI FSM 위에 Mantine frontend를 mount한다.",
]

AUTHORITATIVE_STATE_RULE = (
    "영속 프로젝트 상태의 권위 원천은 Backend activeProject의 ProjectObject state다. "
    "Frontend component/FSM/renderer는 activeProject, projectObjects, projectVfs, projectEFSM을 직접 읽거나 호출하지 않는다. "
    "persistent mutation은 public mutation API -> Application adapter -> Backend projectEFSM으로 전달하고, "
    "project read는 public query/read API -> Application adapter -> Backend read provider에서 immutable projection으로 반환한다. "
    "Frontend runtime state, renderer projection, React local state와 adapter-local result는 persistent project authority가 아니다."
)

RUNTIME_STATE_RULE = (
    "selectedSlotId, dashboard zoom/drag state, telemetry와 같은 값은 영속 project state가 아닌 runtime state다. "
    "선택 chart는 selectedSlotId -> slot.chart -> chart로 resolve하며 별도 global editing pointer를 Source Script 상태로 두지 않는다. "
    "각 runtime 값은 책임 범위를 벗어나 project state의 대체 읽기 원천으로 사용하지 않는다."
)

RESOLVED_REVIEW_ITEMS = [
    (
        "label position은 별도 preview draft 없이 하나의 authoritative persistent x/y를 연속 갱신하는 것으로 확정했다. "
        "interaction finish는 position의 두 번째 commit이 아니다."
    ),
    (
        "editing global pointer는 독립 기능 의미가 없고 selectedSlotId -> slot.chart -> chart로 resolve 가능하므로 "
        "Source Script runtime state에서 제거했다."
    ),
    (
        "layoutMapWidth는 실제 producer/consumer가 없으므로 authoritative persistent state에서 제거했다. "
        "기존 v3 input의 field는 legacy no-op으로 무시할 수 있다."
    ),
    (
        "debugEnabled는 session runtime authority이고 uiTelemetryState.debugEnabled는 one-way UI projection이다. "
        "Source Script에는 projection에서 debug authority로 되돌아가는 mutation 경로를 두지 않는다."
    ),
    (
        "slot caption은 slot object의 local property로 확정했다. "
        "slot object를 GUI layout position 사이에서 이동·교환하면 caption도 chart/image/contentType과 함께 이동한다. "
        "global caption은 project-level property이며 slot caption editor target은 UI/runtime state다."
    ),
    (
        "image fit/scale/x/y는 image asset 자체가 아니라 slot-local display state로 확정했다. "
        "image asset은 copied bytes/name/MIME/location을 소유하고, 같은 image를 여러 slot이 참조해도 각 slot의 imageSettings는 독립적이다."
    ),
    (
        "content slot 선택/해제는 왼쪽 위 bookmark control이 소유하고 graph/image 본문 interaction과 분리한다. "
        "bookmark drag는 선택 동작이 아니라 slot-local payload의 GUI position 이동이다. drag 시작 시 UI-local click suppression을 켜고 "
        "drop/dragend에서 즉시 풀지 않는다. post-drag bookmark click이 발생하면 그 click을 소비하면서 suppression을 해제하고, "
        "click이 없으면 click dispatch 기회가 지난 cleanup에서만 해제한다. "
        "empty slot은 interactive content가 없으므로 empty surface click으로 선택할 수 있다."
    ),
    (
        "CSV/image/object runtime selection은 필요한 참조를 mutation 전에 모두 resolve한다. "
        "resolve 실패는 기존 runtime selection을 보존하고, 성공 후에만 clear/select 순서를 실행한다."
    ),
    (
        "dashboard external file drop은 target/runtime selection, collision UI, persistent import commit을 분리한다. "
        "prepare/finish는 runtime 책임이고 assets.importToSlot만 persistent import candidate를 commit한다."
    ),
    (
        "Source Script module hierarchy는 system.py 아래 Backend / Application boundary / Frontend / Portable build로 둔다. "
        "물리 파일은 각 logical owner의 경로에 두며 import/call 관계가 의미 포함관계를 바꾸지 않는다. Backend↔Frontend cross-layer access는 "
        "Application boundary의 API/Adapter contract만 사용한다."
    ),
    (
        "asset import collision Modal은 rename/replace의 명시적 선택만 import plan으로 변환한다. "
        "Escape/outside-click/close/cleanup처럼 choice 없는 dismiss는 cancel이며 UI-local resolver를 정리할 뿐 "
        "rename 같은 persistent import 결정을 암묵적으로 승인하지 않는다."
    ),
    (
        "FastFigureDashboardFileDrop가 mounted이고 drop을 받을 수 있는 UI 상태라면 dashboard external-file drop receiver는 "
        "ordinary rerender나 local UI state update 사이에서도 논리적으로 연속 1개여야 한다. 내부 listener/callback 교체 때문에 "
        "유효 drop이 무처리되거나 한 event가 중복 import attempt로 전달되어서는 안 되며, 구체 listener 수명 관리 방식은 구현 세부다."
    ),
]

UNRESOLVED_REVIEW_ITEMS = [
    (
        "Plan 017 E: graph domain에 trace style/axis 보조 표시와 layout field 변환·extension 우선순위를, "
        "project-state/graph domain에 UI palette/graph color 기본값의 서로 다른 원천을 구체화했다. "
        "renderer/Mantine은 one-way projection만 소비한다. field 정의만으로 전체 import/edit/export 왕복이나 "
        "purpose/duplicate-integration 검토가 끝났다고 간주하지 않는다."
    ),
    (
        "Plan 017 D: 전체 public operation의 정적 trace에서 공개 반환 shape, runtime composition, "
        "asset fileKind/resolveImportPlan의 공식 query와 createEmptyCsv의 create-and-select는 연결했다. "
        "다른 runtime operation과 router/export 완료 규칙에는 미정 의미가 남았다. "
        "기존 operation의 계약과 공통 adapter를 보완해야 하며 내부 command triple을 public 값으로 자동 간주하지 않는다. "
        "정적 대조표 작성이나 개별 wrapper 수정만으로 전체 closure 근거를 삼지 않는다."
    ),
]


def initializeFastFigure():
    """
    Return:
    - initialized_runtime:
      기본 프로젝트와 슬롯, FSM, renderer, Mantine UI가 사용 가능한 상태.

    변경:
    - activeProject를 createProjectState가 만든 검증된 기본 project로 시작한다.
    - renderer DOM/CSS 상태를 현재 project 값에 맞춘다.
    - interfaceFSM lifecycle을 ready로 전환한다.
    - React root에 Mantine frontend를 mount한다.

    처리:
    1. createProjectState가 만든 project candidate가 invariant를 만족하는지 확인한다.
    2. core runtime과 필요한 renderer host가 존재하는지 확인한다.
    3. dashboard zoom projection과 slot interaction controller를 준비한다.
    4. project에 이미 존재하는 초기 empty slot을 renderer에 투영한다.
    5. slot style과 dashboard geometry를 적용한다.
    6. Application boundary가 Backend initial read projection을 만들고 Frontend lifecycle ready event를 interfaceFSM에 전달한다.
    7. FastFigureApi를 Backend↔Frontend public command/query/event 경계로 공개하고 renderer에는 public action surface와 read projection만 제공한다.
    8. MantineProvider와 FastFigureShell을 기존 React root에 mount한다.
    9. startup 과정은 default CSV나 fake graph object를 생성하지 않는다.
    10. 마지막에 project/reference/runtime invariant를 검사한다.
    """
    initialized_runtime = "현재 Fast Figure 실행 세션"
    return initialized_runtime
