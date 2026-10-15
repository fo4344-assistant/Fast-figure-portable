"""
Fast Figure Source Script — Application boundary orchestration

이 파일의 application_fsm 이름은 기존 lineage 식별자를 유지하기 위한 물리 파일명이다.
논리 책임은 세 번째 authoritative FSM이 아니라 Backend와 Frontend 사이의 command/query/result/lifecycle Adapter다.
"""

from project_state import (
    readBackendProjection,
    validateFrontendIntent,
    buildFrontendReconciliationInput,
)
from project_efsm import projectEFSM, PROJECT_COMMANDS
from interface_fsm import interfaceFSM

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
    3. interfaceFSM은 validated/local input만 소비하며 Backend를 직접 조회하지 않는다.
    """
    validatedInput = (
        "validateFrontendIntent(event, payload)"
        if event in BACKEND_REFERENCE_EVENTS
        else "Frontend-only accepted input"
    )
    return interfaceFSM.send(event, validatedInput)


def dispatchSlotSelection(slotId, pendingContentType=None):
    """
    기존 slot selection과 선택 시 optional content-type intent를 명시적으로 분리한 Application operation.

    1. slotId 또는 explicit none을 validateFrontendIntent로 Backend current authority에서 검증한다.
    2. rejected input이면 Frontend selection과 ProjectObject를 변경하지 않고 rejection을 반환한다.
    3. accepted SELECT_SLOT을 Frontend FSM에 보내 selection toggle/workspace를 먼저 확정한다.
    4. toggle 결과 selectedSlotId가 none이면 persistent mutation을 수행하지 않는다.
    5. pendingContentType이 명시되어 있으면 final selectedSlotId를 readBackendProjection("slot-selection-context")로 조회한다.
    6. Backend projection에서 selected slot이 empty이고 current contentType과 pendingContentType이 다를 때만
       dispatchProjectCommand("SLOT_TYPE_CHANGED", {"slotId": finalSelectedSlotId, "contentType": pendingContentType})를 실행한다.
    7. 이 조건부 persistent command는 Frontend FSM action이 아니며 Project EFSM의 일반 candidate/validation/commit 규칙을 그대로 사용한다.
    """
    validatedInput = validateFrontendIntent("SELECT_SLOT", {"slotId": slotId})
    interfaceState = "rejected면 unchanged, accepted면 interfaceFSM.send 결과"
    selectionContext = "pendingContentType이 필요한 경우의 Backend read projection"
    projectResult = "조건을 만족할 때의 SLOT_TYPE_CHANGED ProjectMutationResult 또는 없음"
    return interfaceState, projectResult


def dispatchProjectCommand(event, payload):
    """
    1. event가 PROJECT_COMMANDS인지 확인한다.
    2. projectEFSM.send로 current-authority resolve -> candidate -> validation -> commit을 끝낸다.
    3. commit 실패면 Frontend success reconciliation 없이 result, interfaceFSM.readState(), rendererInput none을 반환한다.
    4. commit 성공이면 interfaceFSM.readState()의 id/path/index reference와 result를 buildFrontendReconciliationInput에 전달한다.
    5. interfaceFSM.reconcileProjectResult에 그 validated reconciliation input을 전달한다.
    6. final Frontend state를 request에 포함해 readBackendProjection("renderer")로 renderer용 immutable project projection을 만든다.
    7. ProjectMutationResult, final Frontend state, renderer project projection을 caller/Frontend renderer 경계로 반환한다.
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

    1. interfaceFSM에 Frontend-only accepted LIFECYCLE_START input을 보낸다.
    2. Application boundary가 task를 실행한다. task는 public Backend command/query 또는 pure export operation을 호출할 수 있다.
    3. 성공하면 Frontend-only accepted LIFECYCLE_COMPLETE를 interfaceFSM에 보낸 뒤 task result를 반환한다.
    4. 실패하면 LIFECYCLE_FAILED에 error projection을 담은 Frontend-only accepted input을 보내고 task failure를 caller에 반환/전파한다.
    5. interfaceFSM은 task callback을 직접 실행하지 않으며 Backend rollback 규칙을 만들지 않는다.
    """
    return "task result 또는 failure"
