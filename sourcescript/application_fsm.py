"""
Fast Figure Source Script — application orchestration

project mutation과 interface region을 한 FSM에 결합하지 않고 두 상태기계의 causal ordering만 소유한다.
"""

from project_efsm import projectEFSM, PROJECT_COMMANDS
from interface_fsm import interfaceFSM

APPLICATION_ORDER = (
    "interface intent -> explicit project command -> projectEFSM validate/commit -> "
    "ProjectMutationResult -> interfaceFSM reconcile -> renderer projection"
)

ORCHESTRATION_RULES = [
    "interface-only event는 projectEFSM을 호출하지 않는다.",
    "persistent mutation event는 interfaceFSM workspace action으로 실행하지 않는다.",
    "projectEFSM commit 성공 뒤에만 interfaceFSM.reconcileProjectResult를 호출한다.",
    "project commit 실패 시 interface reconciliation과 commit projection을 실행하지 않는다.",
    "interface reconciliation이 끝난 final runtime selection을 renderer가 읽는다.",
    "renderer는 projectEFSM/interfaceFSM command를 재귀 호출하지 않는다.",
    "ProjectMutationResult는 orchestration call 동안만 사용하고 별도 authority로 저장하지 않는다.",
]

def dispatchInterfaceEvent(event, payload):
    """overlay/workspace/selection 등 interface-only event."""
    return interfaceFSM.send(event, payload)

def dispatchProjectCommand(event, payload):
    """
    1. event가 PROJECT_COMMANDS인지 확인한다.
    2. projectEFSM.send로 candidate validation/commit을 끝낸다.
    3. result를 interfaceFSM.reconcileProjectResult에 전달한다.
    4. renderer_runtime.applyDashboardProjectionInvalidation을 final interface state 뒤 호출한다.
    5. ProjectMutationResult를 caller에 반환한다.
    """
    result = projectEFSM.send(event, payload)
    interfaceState = interfaceFSM.reconcileProjectResult(event, result)
    return result, interfaceState

def runLifecycleTask(lifecycle, event, task):
    """import/export busy/error sequencing은 interfaceFSM.run이 소유한다."""
    return interfaceFSM.run(lifecycle, event, task)
