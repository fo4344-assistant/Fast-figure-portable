"""
Fast Figure Source Script — Application boundary orchestration

이 파일은 기존 Application command-query-adapter 논리 모듈을 나타낸다.
논리 책임은 세 번째 authoritative FSM이 아니라 Backend와 Frontend 사이의 command/query/result/lifecycle Adapter다.
"""

from sourcescript.backend.project_state import (
    readBackendProjection,
    validateFrontendIntent,
    buildFrontendReconciliationInput,
)
from sourcescript.backend.project_efsm import projectEFSM, PROJECT_COMMANDS
from sourcescript.frontend.interface_fsm import interfaceFSM

BACKEND_REFERENCE_EVENTS = {
    "SELECT_SLOT",
    "SELECT_ASSET",
    "SELECT_GRAPH_OBJECT",
}

APPLICATION_ORDER = (
    "Frontend intent -> Application API/Adapter -> Backend query 또는 explicit project command -> "
    "projectEFSM validate/commit -> ProjectMutationResult -> Backend reconciliation query -> "
    "Frontend FSM reconcile -> renderer projection input"
)

APPLICATION_BOUNDARY_RULES = [
    "Backend와 Frontend 사이의 모든 persistent mutation, project query/read, mutation result 전달은 이 API/Adapter 경계를 통과한다.",
    "Frontend component/FSM/renderer는 activeProject/projectObjects/projectVfs/projectEFSM을 직접 사용하지 않는다.",
    "Backend는 interfaceFSM/DOM/Mantine/React local state를 직접 사용하지 않는다.",
    "Backend identity가 필요한 Frontend event만 Backend validation query를 수행하고 overlay/Escape/lifecycle 같은 Frontend-only event는 불필요한 Backend 조회를 만들지 않는다.",
    "persistent mutation은 interfaceFSM action으로 실행하지 않고 explicit Project EFSM command로 전달한다.",
    "projectEFSM commit 성공 뒤에만 Backend reconciliation query와 interfaceFSM.reconcileProjectResult를 실행한다.",
    "project commit 실패 시 success reconciliation과 commit renderer projection을 실행하지 않는다.",
    "renderer는 Backend read projection과 final Frontend state를 입력으로 받고 두 FSM command를 재귀 호출하지 않는다.",
    "ProjectMutationResult/read projection/reconciliation input은 orchestration call 범위의 transient value이며 authority로 저장하지 않는다.",
]

def dispatchProjectQuery(query, payload=None):
    """
    Backend public read/query adapter.
    current activeProject는 Backend read provider만 읽고 immutable projection을 반환한다.
    Frontend caller에 Backend mutable object/helper를 노출하지 않는다.
    """
    return readBackendProjection(query, payload)


def dispatchInterfaceEvent(event, payload=None):
    """
    Frontend runtime event adapter.

    1. event가 BACKEND_REFERENCE_EVENTS면 validateFrontendIntent로 current Backend authority에서 reference를 검증한다.
    2. 그 외 Frontend-only event는 Backend query 없이 event/payload를 local accepted input으로 감싼다.
    3. rejected input이면 Frontend state를 publish/변경하지 않고 현재 state를 반환한다.
    4. interfaceFSM은 validated/local input만 소비하며 Backend를 직접 조회하지 않는다.
       graph object의 explicit public selection은 selectAsset=True intent로 참조 CSV도 선택한다.
       commit 뒤 index-only 갱신은 selectAsset=False로 기존 asset selection을 유지한다.
    """
    validatedInput = (
        "validateFrontendIntent(event, payload)"
        if event in BACKEND_REFERENCE_EVENTS
        else "Frontend-only accepted input"
    )
    return interfaceFSM.send(event, validatedInput)


def dispatchSlotSelection(slotId, pendingContentType=None, direction="ui-to-fsm"):
    """
    기존 slot selection과 선택 시 optional content-type intent를 명시적으로 분리한 Application operation.

    1. slotId 또는 explicit none과 direction을 validateFrontendIntent로 Backend current authority에서 검증한다.
       ui-to-fsm은 같은 slot 재선택 시 toggle-clear, model-to-fsm은 같은 slot도 선택을 유지한다.
    2. rejected input이면 Frontend selection과 ProjectObject를 변경하지 않고 rejection을 반환한다.
    3. accepted SELECT_SLOT을 Frontend FSM에 보내 selection toggle/workspace를 먼저 확정한다.
    4. toggle 결과 selectedSlotId가 none이면 persistent mutation을 수행하지 않는다.
    5. pendingContentType이 명시되어 있으면 final selectedSlotId를 readBackendProjection("slot-selection-context")로 조회한다.
    6. Backend projection에서 selected slot이 empty이고 current contentType과 pendingContentType이 다를 때만
       dispatchProjectCommand("SLOT_TYPE_CHANGED", {"slotId": finalSelectedSlotId, "contentType": pendingContentType})를 실행한다.
    7. 이 조건부 persistent command는 Frontend FSM action이 아니며 Project EFSM의 일반 candidate/validation/commit 규칙을 그대로 사용한다.
    """
    validatedInput = validateFrontendIntent("SELECT_SLOT", {"slotId": slotId, "direction": direction})
    interfaceState = "rejected면 unchanged, accepted면 interfaceFSM.send 결과"
    selectionContext = "pendingContentType이 필요한 경우의 Backend read projection"
    projectResult = "조건을 만족할 때의 SLOT_TYPE_CHANGED ProjectMutationResult 또는 없음"
    rendererProjection = "accepted selection 뒤 final Frontend state로 요청한 renderer projection; rejected면 없음"
    return interfaceState, projectResult, rendererProjection


def dispatchProjectCommand(event, payload):
    """
    1. event가 PROJECT_COMMANDS인지 확인한다.
    2. projectEFSM.send로 current-authority resolve -> candidate 구성/정규화 -> validation -> one commit을 끝낸다.
       public wrapper는 identity와 새 edit 값만 전달한다. Backend domain candidate calculation은 Project EFSM command 처리 안에서 실행한다.
       read projection 전체를 mutation candidate로 보내거나 Application에서 current project의 복제본을 별도 검증하지 않는다.
    3. commit 실패면 Frontend success reconciliation 없이 result, interfaceFSM.readState(), rendererInput none을 반환한다.
    4. commit 성공이면 interfaceFSM.readState()의 id/path/index reference와 result를 buildFrontendReconciliationInput에 전달한다.
       object 편집의 selectionHints.chartId/selectedIndexHint도 이 경로에서만 post-commit 대상에 대해 검증한다.
    5. interfaceFSM.reconcileProjectResult에 그 validated reconciliation input을 전달한다.
       SELECT_GRAPH_OBJECT를 사후 재호출하지 않는다. index 보정 때문에 독립 current CSV 선택을 덮어쓰지 않는다.
    6. final Frontend state를 request에 포함해 readBackendProjection("renderer")로 renderer용 immutable project projection을 만든다.
    7. ProjectMutationResult, final Frontend state, renderer project projection을 caller/Frontend renderer 경계로 반환한다.
       이 tuple은 내부 orchestration 결과이며 chart/settings/bool 같은 public API 반환값으로 자동 간주하지 않는다.
       기존 public wrapper가 read 값을 선언했다면 committed를 확인한 뒤 official dispatchProjectQuery의 detached 값을 반환한다.
       미commit/취소 결과에는 성공 read를 수행하지 않고 그 wrapper의 기존 실패값/결과를 반환한다. throw/rejection은 caller에 전파한다.
       post-commit query/render 실패는 이미 성공한 command를 실패 전 상태로 rollback하지 않으며 성공 payload로 위장하지 않는다.
    """
    result = projectEFSM.send(event, payload)
    frontendBefore = interfaceFSM.readState()
    reconciliationInput = "commit 성공 시 Backend에서 계산한 FrontendReconciliationInput"
    interfaceState = "commit 실패 시 frontendBefore, 성공 시 reconciled Frontend state"
    rendererProjection = "commit 성공 시 Backend renderer projection, 실패 시 없음"
    return result, interfaceState, rendererProjection


def runLifecycleTask(lifecycle, event, task):
    """
    cross-layer import/export busy/error sequencing을 Application boundary가 소유한다.

    1. interfaceFSM.readState().lifecycle이 ready가 아니면 task를 실행하지 않고 busy rejection을 반환한다.
       이 rejection은 lifecycle/error/project state를 변경하지 않는다.
    2. requested lifecycle은 importing 또는 exporting이어야 한다. invalid request도 task 실행 전에 거부한다.
    3. Frontend-only accepted LIFECYCLE_START에 lifecycle/event를 담아 전달한 뒤 Application이 task를 정확히 한 번 실행한다.
       task는 public Backend command/query 또는 pure export operation을 호출할 수 있다.
    4. 동기 return과 비동기 completion은 같은 성공 경로를 사용한다. rejected/cancelled task result도 완료된 task로 취급하여
       LIFECYCLE_COMPLETE에 event/outcome을 보내 ready로 복귀하고 task result를 그대로 반환한다. 이를 project commit 성공으로 바꾸지 않는다.
    5. 동기 throw와 비동기 rejection은 같은 실패 경로를 사용한다. LIFECYCLE_FAILED에 event/message error projection을 전달한다.
       Frontend가 error -> ready recovery를 publish한 뒤 원래 failure를 caller에 전파한다. 이때 success reconciliation/render를 만들지 않는다.
    6. interfaceFSM은 task callback을 직접 실행하지 않으며 이미 성공한 별도 command를 숨은 rollback으로 되돌리지 않는다.
    """
    return "task result 또는 failure"
