"""
Fast Figure Source Script — system boundary and reverse-review index

작성 단계:
- 기존 구현을 검증 자료로 사용해 Source Script의 의미를 정규화하는 단계다.
- 이 파일은 실행 가능한 Python 구현이 아니라 Python 문법을 작성 표기법으로 사용하는 구현 명세다.

권위와 검증 원천:
- ../agent_space/policies/source-script-policy.md:
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

SOURCE_SCRIPT_MODULES = {
    "project_state.py": "authoritative project state, runtime references, invariants",
    "application_fsm.py": "application state regions, events, controlled transitions",
    "assets_files.py": "VFS, asset lifecycle, FFPX/FFSX import/export",
    "graphs.py": "CSV-to-chart semantics, graph objects, Plotly conversion",
    "layout_annotations_export.py": "layout geometry, image/label/caption, raster export",
    "api_ui.py": "FastFigureApi boundary and Mantine frontend responsibilities",
    "renderer_runtime.py": "dashboard renderer, DOM interaction, telemetry and startup",
    "portable_build.py": "split-to-portable build specification",
}

RUNTIME_LOAD_ORDER = [
    "Fast-figure.html이 renderer host DOM과 스타일을 제공한다.",
    "vendor/plotly.min.js가 Plotly renderer를 제공한다.",
    "vendor/fast-figure-ui-runtime.js가 React와 Mantine runtime을 제공한다.",
    "fast-figure.js가 project/domain/FSM/API와 functional renderer를 초기화한다.",
    "fast-figure-ui.js가 기존 API와 UI FSM 위에 Mantine frontend를 mount한다.",
]

AUTHORITATIVE_STATE_RULE = (
    "영속 프로젝트 상태의 권위 원천은 activeProject의 ProjectObject state다. "
    "UI는 FastFigureApi 또는 appFSM event를 통해 변경한다. "
    "renderer snapshot과 React local state는 독립적인 project authority가 아니다."
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
]

UNRESOLVED_REVIEW_ITEMS = [
    (
        "Source Script의 의미와 public mutation/API contract는 현재 작성되었다. "
        "전체 모듈 간 모순, unresolved marker, 중복 authority, project 목적 부합 여부를 closure review에서 재검증해야 한다."
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
    - appFSM lifecycle을 ready로 전환한다.
    - React root에 Mantine frontend를 mount한다.

    처리:
    1. createProjectState가 만든 project candidate가 invariant를 만족하는지 확인한다.
    2. core runtime과 필요한 renderer host가 존재하는지 확인한다.
    3. dashboard zoom projection과 slot interaction controller를 준비한다.
    4. project에 이미 존재하는 초기 empty slot을 renderer에 투영한다.
    5. slot style과 dashboard geometry를 적용한다.
    6. appFSM을 ready로 전환하고 workspace/overlay 초기 상태를 동기화한다.
    7. FastFigureApi를 frontend 변경 경계로 공개한다.
    8. MantineProvider와 FastFigureShell을 기존 React root에 mount한다.
    9. startup 과정은 default CSV나 fake graph object를 생성하지 않는다.
    10. 마지막에 project/reference/runtime invariant를 검사한다.
    """
    initialized_runtime = "현재 Fast Figure 실행 세션"
    return initialized_runtime
