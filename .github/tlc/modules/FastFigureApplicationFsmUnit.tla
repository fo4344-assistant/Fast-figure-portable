---------------------- MODULE FastFigureApplicationFsmUnit ----------------------
EXTENDS Integers, FiniteSets, Sequences, TLC

(*
Experimental file-structure unit check for the Source Script slice owned by
sourcescript/application_fsm.py.

Boundary rule:
- project_state.py supplies the slot-local/reference contract used here.
- layout_annotations_export.py is not inlined. applyGridLayoutAction sees only
  the success/rejection result of the imported layout command.
- slot geometry, merge state, image settings values, and caption text values are
  deliberately outside this unit state.

This file is an execution experiment and is not the canonical verification
model under verification/.
*)

SlotIds == 1..4

DefaultPayload == "default"
ChartIds == {"chart-1", "chart-2"}
NonChartPayloads == {"image", "caption", "settings"}
PayloadValues == {DefaultPayload} \cup ChartIds \cup NonChartPayloads

InitialProject ==
  [ slots  |-> [slotId \in SlotIds |-> DefaultPayload],
    charts |-> {} ]

ChartsReferenced(project) ==
  {chartId \in ChartIds :
    \E slotId \in SlotIds : project.slots[slotId] = chartId}

ValidApplicationProjection(project) ==
  /\ DOMAIN project.slots = SlotIds
  /\ \A slotId \in SlotIds : project.slots[slotId] \in PayloadValues
  /\ project.charts = ChartsReferenced(project)
  /\ \A chartId \in project.charts :
       Cardinality({slotId \in SlotIds : project.slots[slotId] = chartId}) = 1

ResetSlotsCandidate(project, slotIds) ==
  LET removedCharts ==
        {chartId \in project.charts :
          \E slotId \in slotIds : project.slots[slotId] = chartId}
      candidateSlots ==
        [slotId \in SlotIds |->
          IF slotId \in slotIds
            THEN DefaultPayload
            ELSE project.slots[slotId]]
  IN
    [project EXCEPT
      !.slots = candidateSlots,
      !.charts = project.charts \ removedCharts]

SwapSlotsCandidate(project, sourceId, targetId) ==
  LET sourcePayload == project.slots[sourceId]
      targetPayload == project.slots[targetId]
  IN
    [project EXCEPT
      !.slots =
        [slotId \in SlotIds |->
          IF slotId = sourceId
            THEN targetPayload
          ELSE IF slotId = targetId
            THEN sourcePayload
          ELSE project.slots[slotId]]]

SeedPayloadCandidate(project, slotId, payload) ==
  [project EXCEPT
    !.slots =
      [sid \in SlotIds |->
        IF sid = slotId THEN payload ELSE project.slots[sid]],
    !.charts =
      IF payload \in ChartIds
        THEN project.charts \cup {payload}
        ELSE project.charts]

TypeOK(project, result) ==
  /\ ValidApplicationProjection(project)
  /\ result \in {
       "initialized",
       "reset-committed", "reset-rejected",
       "swap-committed", "swap-rejected",
       "grid-committed", "grid-rejected",
       "harness-seeded"
     }

(*
--algorithm FastFigureApplicationFsmUnit
variables
  activeProject = InitialProject,
  lastResult = "initialized";

procedure applySlotsResetAction(slotIds)
variables candidate = activeProject;
begin
ResetResolve:
  if slotIds \subseteq SlotIds then
    candidate := ResetSlotsCandidate(activeProject, slotIds);
    if ValidApplicationProjection(candidate) then
      activeProject := candidate ||
      lastResult := "reset-committed";
    else
      lastResult := "reset-rejected";
    end if;
  else
    lastResult := "reset-rejected";
  end if;
ResetReturn:
  return;
end procedure;

procedure applySlotsSwappedAction(sourceId, targetId, sourceVisible, targetVisible)
variables candidate = activeProject;
begin
SwapResolve:
  if /\ sourceId \in SlotIds
     /\ targetId \in SlotIds
     /\ sourceId # targetId
     /\ sourceVisible
     /\ targetVisible then
    candidate := SwapSlotsCandidate(activeProject, sourceId, targetId);
    if ValidApplicationProjection(candidate) then
      activeProject := candidate ||
      lastResult := "swap-committed";
    else
      lastResult := "swap-rejected";
    end if;
  else
    lastResult := "swap-rejected";
  end if;
SwapReturn:
  return;
end procedure;

procedure setLayoutApiGridAdapter(layoutAccepted)
begin
GridAdapter:
  if layoutAccepted then
    lastResult := "grid-committed";
  else
    lastResult := "grid-rejected";
  end if;
GridAdapterReturn:
  return;
end procedure;

procedure applyGridLayoutAction(layoutAccepted)
begin
ApplyGrid:
  call setLayoutApiGridAdapter(layoutAccepted);
ApplyGridReturn:
  return;
end procedure;

procedure VerificationHarnessSeedPayload(slotId, payload)
variables candidate = activeProject;
begin
HarnessSeed:
  if /\ slotId \in SlotIds
     /\ payload \in PayloadValues \ {DefaultPayload}
     /\ activeProject.slots[slotId] = DefaultPayload
     /\ (payload \notin ChartIds \/ payload \notin activeProject.charts) then
    candidate := SeedPayloadCandidate(activeProject, slotId, payload);
    if ValidApplicationProjection(candidate) then
      activeProject := candidate ||
      lastResult := "harness-seeded";
    end if;
  end if;
HarnessSeedReturn:
  return;
end procedure;

begin
VerificationHarness:
  while TRUE do
    either
      with chosenResetSlotIds \in SUBSET SlotIds do
        call applySlotsResetAction(chosenResetSlotIds);
      end with;
    or
      with chosenSourceId \in SlotIds do
        with chosenTargetId \in SlotIds do
          with chosenSourceVisible \in {TRUE, FALSE} do
            with chosenTargetVisible \in {TRUE, FALSE} do
              call applySlotsSwappedAction(
                chosenSourceId,
                chosenTargetId,
                chosenSourceVisible,
                chosenTargetVisible);
            end with;
          end with;
        end with;
      end with;
    or
      with chosenLayoutAccepted \in {TRUE, FALSE} do
        call applyGridLayoutAction(chosenLayoutAccepted);
      end with;
    or
      with chosenSlotId \in SlotIds do
        with chosenPayload \in PayloadValues \ {DefaultPayload} do
          call VerificationHarnessSeedPayload(chosenSlotId, chosenPayload);
        end with;
      end with;
    end either;
  end while;
end algorithm;
*)

TypeOKSpec ==
  TypeOK(activeProject, lastResult)

SafetyInvariant ==
  ValidApplicationProjection(activeProject)

=============================================================================
