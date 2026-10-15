-------------------------- MODULE FastFigureBoundaryCore --------------------------
EXTENDS Integers, TLC

(*
Bounded verification model derived from the Source Script r25 / pseudocode r11
Application-boundary slice.

Direct pseudocode sources:
- pseudocode/project_state.pcal
- pseudocode/project_efsm.pcal
- pseudocode/interface_fsm.pcal
- pseudocode/application_fsm.pcal
- pseudocode/renderer_runtime.pcal

This model verifies the cross-layer properties introduced by plan-016:
- Backend project authority changes only on a committed project command.
- rejected/stale-reference mutations leave Backend authority unchanged.
- successful reconciliation occurs only after commit.
- renderer projection occurs only after reconciliation.
- Frontend reconciliation and renderer projection do not mutate Backend authority.
- Backend read projections are one-way reads and do not become mutation authority.

The concrete ProjectObject, DOM, graph, asset, and layout values remain in the
existing Slot Core / Interaction Core slices. Here they are represented by a
bounded authoritative revision token because the properties above depend on
ordering and authority flow, not on those domain values.
*)

NoProjection == -1
MaxProjectRevision == 2

Phases == {
  "idle",
  "validated",
  "committed",
  "reconciled",
  "projected",
  "rejected",
  "read-ready",
  "read-consumed"
}

StablePhases == {"idle", "projected", "rejected", "read-consumed"}
FrontendReferenceStates == {"none", "valid", "stale"}

VARIABLES
  projectRevision,
  projectBefore,
  frontendReference,
  phase,
  referenceAccepted,
  resultCommitted,
  reconciliationDone,
  rendererApplied,
  projectionRevision

vars ==
  <<projectRevision,
    projectBefore,
    frontendReference,
    phase,
    referenceAccepted,
    resultCommitted,
    reconciliationDone,
    rendererApplied,
    projectionRevision>>

Init ==
  /\ projectRevision = 0
  /\ projectBefore = 0
  /\ frontendReference = "valid"
  /\ phase = "idle"
  /\ referenceAccepted = FALSE
  /\ resultCommitted = FALSE
  /\ reconciliationDone = FALSE
  /\ rendererApplied = FALSE
  /\ projectionRevision = NoProjection

BeginMutation(accepted) ==
  /\ phase \in StablePhases
  /\ projectBefore' = projectRevision
  /\ referenceAccepted' = accepted
  /\ resultCommitted' = FALSE
  /\ reconciliationDone' = FALSE
  /\ rendererApplied' = FALSE
  /\ projectionRevision' = NoProjection
  /\ IF accepted
        THEN phase' = "validated"
        ELSE phase' = "rejected"
  /\ IF accepted
        THEN frontendReference' = "valid"
        ELSE frontendReference' = "stale"
  /\ UNCHANGED projectRevision

CommitMutation ==
  /\ phase = "validated"
  /\ projectRevision < MaxProjectRevision
  /\ projectRevision' = projectRevision + 1
  /\ phase' = "committed"
  /\ resultCommitted' = TRUE
  /\ UNCHANGED <<projectBefore,
                  frontendReference,
                  referenceAccepted,
                  reconciliationDone,
                  rendererApplied,
                  projectionRevision>>

RejectCandidate ==
  /\ phase = "validated"
  /\ projectRevision' = projectBefore
  /\ phase' = "rejected"
  /\ resultCommitted' = FALSE
  /\ reconciliationDone' = FALSE
  /\ rendererApplied' = FALSE
  /\ projectionRevision' = NoProjection
  /\ UNCHANGED <<projectBefore, frontendReference, referenceAccepted>>

ReconcileFrontend ==
  /\ phase = "committed"
  /\ frontendReference' \in {"none", "valid"}
  /\ phase' = "reconciled"
  /\ reconciliationDone' = TRUE
  /\ UNCHANGED <<projectRevision,
                  projectBefore,
                  referenceAccepted,
                  resultCommitted,
                  rendererApplied,
                  projectionRevision>>

RenderProjection ==
  /\ phase = "reconciled"
  /\ projectionRevision' = projectRevision
  /\ rendererApplied' = TRUE
  /\ phase' = "projected"
  /\ UNCHANGED <<projectRevision,
                  projectBefore,
                  frontendReference,
                  referenceAccepted,
                  resultCommitted,
                  reconciliationDone>>

ReadBackendProjection ==
  /\ phase \in StablePhases
  /\ projectBefore' = projectRevision
  /\ projectionRevision' = projectRevision
  /\ phase' = "read-ready"
  /\ referenceAccepted' = FALSE
  /\ resultCommitted' = FALSE
  /\ reconciliationDone' = FALSE
  /\ rendererApplied' = FALSE
  /\ UNCHANGED <<projectRevision, frontendReference>>

ConsumeReadProjection ==
  /\ phase = "read-ready"
  /\ phase' = "read-consumed"
  /\ UNCHANGED vars

Next ==
  \/ \E accepted \in BOOLEAN : BeginMutation(accepted)
  \/ CommitMutation
  \/ RejectCandidate
  \/ ReconcileFrontend
  \/ RenderProjection
  \/ ReadBackendProjection
  \/ ConsumeReadProjection

Spec ==
  Init /\ [][Next]_vars

TypeOK ==
  /\ projectRevision \in 0..MaxProjectRevision
  /\ projectBefore \in 0..MaxProjectRevision
  /\ frontendReference \in FrontendReferenceStates
  /\ phase \in Phases
  /\ referenceAccepted \in BOOLEAN
  /\ resultCommitted \in BOOLEAN
  /\ reconciliationDone \in BOOLEAN
  /\ rendererApplied \in BOOLEAN
  /\ projectionRevision \in ({NoProjection} \cup (0..MaxProjectRevision))

FailureAtomicityInvariant ==
  phase = "rejected" =>
    /\ ~resultCommitted
    /\ projectRevision = projectBefore
    /\ ~reconciliationDone
    /\ ~rendererApplied

CommitResultInvariant ==
  phase \in {"committed", "reconciled", "projected"} =>
    /\ resultCommitted
    /\ referenceAccepted
    /\ projectRevision = projectBefore + 1

ReconciliationOrderingInvariant ==
  reconciliationDone =>
    /\ resultCommitted
    /\ phase \in {"reconciled", "projected"}
    /\ frontendReference # "stale"

RendererOrderingInvariant ==
  rendererApplied =>
    /\ resultCommitted
    /\ reconciliationDone
    /\ phase = "projected"
    /\ projectionRevision = projectRevision

ReadProjectionOneWayInvariant ==
  phase \in {"read-ready", "read-consumed"} =>
    /\ projectRevision = projectBefore
    /\ projectionRevision = projectRevision
    /\ ~resultCommitted
    /\ ~reconciliationDone
    /\ ~rendererApplied

=============================================================================
