"""
Fast Figure Source Script — system initialization

작성 단계:
- 기존 구현을 검증 자료로 사용해 Source Script의 의미를 정규화하는 단계다.
- 이 파일은 Python 문법으로 작성한 구현 명세다.

권위와 검증 원천:
- ../agent_space/policies/development-policy.md:
  Source Script 작성·닫힘·Source of Truth·참조·최소 구현 원칙의 상위 정책 원천.
- ../README.md:
  Fast Figure의 공개 목적과 project/FFPX/FFSX/Plotly 계약을 확인하는 프로젝트 문서.
- ../fast-figure.js, ../fast-figure-ui.js, ../Fast-figure.html:
  현재 하위 구현의 동작, 누락, 중복, 호환 상태를 조사하는 검증 자료.
  Source Script의 의미를 기준으로 각 계층의 대응을 검토한다.
- ../vendor/plotly.min.js, ../vendor/fast-figure-ui-runtime.js:
  renderer/runtime 외부 dependency의 실제 제공 원천.
- ../scripts/build-portable.py:
  split source를 단일 portable HTML로 결합하는 현재 build 검증 자료.
"""



from sourcescript.backend import project_state, project_efsm, assets_files, graphs, layout_annotations
from sourcescript.application import adapter, public_api
from sourcescript.frontend import interface_fsm, mantine_ui, renderer
from sourcescript.portable_build import portable_build

























def initializeFastFigure():
    initialized_runtime = "Application·Frontend controller·UI mount의 runtime 구성."
    """
    Args:
    - 없음.

    Return:
    - initialized_runtime:
      Application·Frontend controller·UI mount의 runtime 구성.
      기본 프로젝트와 슬롯, FSM, renderer, Mantine UI가 사용 가능한 상태.

    변경:
    - activeProject를 createProjectState가 만든 검증된 기본 project로 시작한다.
    - renderer DOM/CSS 상태를 현재 project 값에 맞춘다.
    - interfaceFSM lifecycle을 ready로 전환한다.
    - React root에 Mantine frontend를 mount한다.

    처리:
        1. HTML의 renderer host·스타일과 Plotly, React/Mantine runtime의 준비를 확인한다.
           HTML host 뒤에 vendor runtime, core 초기화, Mantine mount가 이어지는 순서로 시작한다.
        2. project_state.createProjectState()의 결과로 ProjectObject를 생성하고
           검증 성공 후 project_state.activeProject에 채택한다.
        3. public_api.FastFigureApi를 public command/query/event interface로 공개한다.
           renderer에는 이 action surface와 Application이 조회한 읽기 결과를 제공한다.
        4. adapter.dispatchProjectQuery("renderer", {})로 초기 project projection을 구성한다.
           Application이 현재 Frontend 확대 비율과 현재 layout으로 정한 너비를 전달하고
           Backend가 같은 project 조회에서 geometry를 제공한다.
           renderer.startupCoreRuntime에 이 projection·Frontend state·public actions를 전달하여
           dashboard projection과 slot interaction controller를 준비한다.
           이미 생성한 빈 슬롯과 slot style·dashboard geometry를 초기 renderer 입력으로 적용한다.
        5. Application boundary가 Frontend FSM에 lifecycle ready 전이를 전달한다.
        6. mantine_ui.FastFigureApp의 MantineProvider·FastFigureShell 트리를
           기존 React root 하나에 mount한다.
        7. project 참조·runtime 초기값과 최종 mount 구성을 확인하여 initialized_runtime에 둔다.
        8. initialized_runtime를 반환한다.
    """
    return initialized_runtime
