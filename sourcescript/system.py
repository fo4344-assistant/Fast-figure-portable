"""
Fast Figure Source Script — system boundary and reverse-review index

작성 단계:
- 현재 JavaScript/HTML/Python 구현에서 Source Script로 역작성하는 첫 검토 단계다.
- 이 파일은 실행 가능한 Python 구현이 아니라 Python 문법을 작성 표기법으로 사용하는 구현 명세다.

권위 원천:
- ../fast-figure.js:
  ProjectObject, ApplicationStateMachine, FastFigureApi, domain command,
  functional renderer, FFPX/FFSX와 export 동작의 현재 구현 원천.
- ../fast-figure-ui.js:
  React + Mantine frontend, UI draft, Modal, shell, UI FSM 호출의 현재 구현 원천.
- ../Fast-figure.html:
  renderer host DOM, Mantine CSS, Fast Figure renderer CSS, script load order의 현재 구현 원천.
- ../vendor/plotly.min.js:
  graph renderer 외부 라이브러리 원천.
- ../vendor/fast-figure-ui-runtime.js:
  React/ReactDOM/Mantine runtime 원천.
- ../scripts/build-portable.py:
  split source를 단일 portable HTML로 결합하는 build 원천.
- user-provided development_policy.md:
  Source Script 작성 순서와 상태/참조/최소 구현 원칙의 authoritative policy.
  저장소 구현 원천은 아니며 이 폴더에서 내용을 재정의하지 않는다.
"""

IMPLEMENTATION_SOURCES = {
    "Fast-figure.html": "renderer host와 script/CSS loading 원천",
    "fast-figure.js": "project/domain/FSM/API/renderer/file semantics 원천",
    "fast-figure-ui.js": "Mantine frontend와 UI-local interaction 원천",
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
    "selectedSlotId, editing, dashboard zoom/drag state, telemetry와 같은 값은 "
    "영속 project state가 아닌 runtime state다. 각 값의 책임 범위를 벗어나 "
    "project state의 대체 읽기 원천으로 사용하지 않는다."
)

UNRESOLVED_REVIEW_ITEMS = [
    (
        "previewLabelsApiPosition은 이름상 preview이지만 현재 구현에서는 "
        "activeProject.labelSettings.x/y를 즉시 변경하고 commitLabelsApiPosition은 "
        "후속 notify만 수행한다. drag 중 값 변경을 authoritative edit로 볼지, "
        "임시 preview로 볼지는 다음 Source Script 검토에서 명시적으로 결정해야 한다."
    ),
    (
        "debugEnabled와 uiTelemetryState.debugEnabled는 현재 구현에서 함께 존재한다. "
        "Source Script에서는 debugEnabled를 runtime authority, uiTelemetryState를 read projection으로 "
        "해석하지만, projection 값이 mutation 입력의 일반 원천으로 확장되지 않는지 다음 단계에서 확인한다."
    ),
    (
        "selectedSlotId와 appFSM.state.workspace는 같은 값의 복사본이 아니라 "
        "선택 대상과 그로부터 결정되는 workspace region이라는 관계로 해석한다. "
        "현재 auditApp이 둘의 일치 관계를 검사한다. 다음 단계에서도 이 참조 관계를 보존한다."
    ),
    (
        "editing은 선택 chart의 runtime pointer/cache 역할을 하지만 project에 저장되지 않는다. "
        "현재 UI에 노출되지 않으며 core 내부에서만 사용된다. pseudocode 단계에서 "
        "필수 runtime state인지 단순 파생값인지 다시 검사한다."
    ),
]


def initializeFastFigure():
    """
    Return:
    - initialized_runtime:
      기본 프로젝트와 슬롯, FSM, renderer, Mantine UI가 사용 가능한 상태.

    변경:
    - activeProject에 기본 빈 CSV와 초기 grid slot을 만든다.
    - renderer DOM/CSS 상태를 현재 project 값에 맞춘다.
    - appFSM lifecycle을 ready로 전환한다.
    - React root에 Mantine frontend를 mount한다.

    처리:
    1. core runtime과 필요한 renderer host가 존재하는지 확인한다.
    2. dashboard zoom projection을 적용한다.
    3. 프로젝트에 보호된 기본 빈 CSV가 없으면 만든다.
    4. slot click/drag controller를 설치한다.
    5. 현재 gridRows/gridCols에 맞는 slot 구조를 준비한다.
    6. slot style과 dashboard geometry를 적용한다.
    7. appFSM을 ready로 전환하고 workspace/overlay 초기 상태를 동기화한다.
    8. FastFigureApi를 frontend 변경 경계로 공개한다.
    9. MantineProvider와 FastFigureShell을 기존 React root에 mount한다.
    10. 현재 구현에서는 auditApp으로 초기 참조/상태 무결성을 검사한다.
    """
    initialized_runtime = "현재 Fast Figure 실행 세션"
    return initialized_runtime
