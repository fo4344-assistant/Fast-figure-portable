-------------------------- MODULE FastFigureLayoutUnit --------------------------
EXTENDS Integers, FiniteSets, Sequences, TLC

(*
Experimental file-structure unit check for the Source Script slice owned by
sourcescript/layout_annotations_export.py.

Boundary rule:
- project_state.py supplies the input ranges and slot ownership contract.
- concrete chart/image/caption/imageSettings values are outside this unit.
- layout sees only whether a slot-local payload is default, plus a small payload
  identity token so merge/split can verify preservation rather than only
  defaultness.
- application_fsm.py notification/runtime state is outside this unit.

This file is an execution experiment and is not the canonical verification
model under verification/.
*)

MaxRows == 2
MaxCols == 2
InitialRows == 2
InitialCols == 2

DefaultPayload == "default"
PayloadValues == {DefaultPayload, "payload-a", "payload-b"}

Cell(row, col) == [row |-> row, col |-> col]
CellSlotId(row, col) == (row - 1) * MaxCols + col
SlotIds == 1..(MaxRows * MaxCols)

SlotRow(slotId) ==
  CHOOSE row \in 1..MaxRows :
    \E col \in 1..MaxCols : CellSlotId(row, col) = slotId

SlotCol(slotId) ==
  CHOOSE col \in 1..MaxCols :
    \E row \in 1..MaxRows : CellSlotId(row, col) = slotId

ExpectedSlotIds(rows, cols) ==
  {CellSlotId(row, col) : row \in 1..rows, col \in 1..cols}

DefaultSlot(slotId) ==
  [ id      |-> slotId,
    row     |-> SlotRow(slotId),
    col     |-> SlotCol(slotId),
    rowSpan |-> 1,
    colSpan |-> 1,
    hidden  |-> FALSE,
    payload |-> DefaultPayload ]

InitialSlots ==
  [slotId \in ExpectedSlotIds(InitialRows, InitialCols) |-> DefaultSlot(slotId)]

InitialProject ==
  [ layout |-> [gridRows |-> InitialRows, gridCols |-> InitialCols],
    slots  |-> InitialSlots ]

slotHasNonDefaultLocalState(slot) ==
  slot.payload # DefaultPayload

VisibleSlotIds(project) ==
  {slotId \in DOMAIN project.slots : ~project.slots[slotId].hidden}

ActiveCells(project) ==
  {Cell(row, col) :
    row \in 1..project.layout.gridRows,
    col \in 1..project.layout.gridCols}

SlotCells(slot) ==
  {Cell(row, col) :
    row \in slot.row..(slot.row + slot.rowSpan - 1),
    col \in slot.col..(slot.col + slot.colSpan - 1)}

CoveringVisibleSlots(project, cell) ==
  {slotId \in VisibleSlotIds(project) :
    cell \in SlotCells(project.slots[slotId])}

SlotBaseCell(slot) ==
  Cell(slot.row, slot.col)

LayoutCoverageValid(project) ==
  /\ \A cell \in ActiveCells(project) :
       Cardinality(CoveringVisibleSlots(project, cell)) = 1
  /\ \A slotId \in DOMAIN project.slots :
       LET covering ==
             CoveringVisibleSlots(project, SlotBaseCell(project.slots[slotId]))
       IN
         IF project.slots[slotId].hidden
           THEN /\ Cardinality(covering) = 1
                /\ slotId \notin covering
           ELSE covering = {slotId}

SlotGeometryValid(project) ==
  /\ DOMAIN project.slots =
       ExpectedSlotIds(project.layout.gridRows, project.layout.gridCols)
  /\ \A slotId \in DOMAIN project.slots :
       LET slot == project.slots[slotId]
       IN
         /\ slot.id = slotId
         /\ slot.row = SlotRow(slotId)
         /\ slot.col = SlotCol(slotId)
         /\ slot.rowSpan >= 1
         /\ slot.colSpan >= 1
         /\ slot.row + slot.rowSpan - 1 <= project.layout.gridRows
         /\ slot.col + slot.colSpan - 1 <= project.layout.gridCols
         /\ slot.payload \in PayloadValues

ValidateLayoutProjection(project) ==
  /\ project.layout.gridRows \in 1..MaxRows
  /\ project.layout.gridCols \in 1..MaxCols
  /\ SlotGeometryValid(project)
  /\ LayoutCoverageValid(project)

RemovedSlotIds(project, rows, cols) ==
  DOMAIN project.slots \ ExpectedSlotIds(rows, cols)

GridShrinkSafe(project, rows, cols) ==
  /\ \A slotId \in RemovedSlotIds(project, rows, cols) :
       /\ ~slotHasNonDefaultLocalState(project.slots[slotId])
       /\ ~project.slots[slotId].hidden
       /\ project.slots[slotId].rowSpan = 1
       /\ project.slots[slotId].colSpan = 1
  /\ \A slotId \in
       ((DOMAIN project.slots \ RemovedSlotIds(project, rows, cols))
         \cap VisibleSlotIds(project)) :
       /\ project.slots[slotId].row + project.slots[slotId].rowSpan - 1 <= rows
       /\ project.slots[slotId].col + project.slots[slotId].colSpan - 1 <= cols

ResizeSlots(project, rows, cols) ==
  [slotId \in ExpectedSlotIds(rows, cols) |->
    IF slotId \in DOMAIN project.slots
      THEN project.slots[slotId]
      ELSE DefaultSlot(slotId)]

buildGridResizeCandidate(project, rows, cols) ==
  IF ~(rows \in 1..MaxRows /\ cols \in 1..MaxCols)
    THEN [accepted |-> FALSE, project |-> project]
  ELSE IF (rows < project.layout.gridRows \/ cols < project.layout.gridCols)
          /\ ~GridShrinkSafe(project, rows, cols)
    THEN [accepted |-> FALSE, project |-> project]
  ELSE
    LET candidate ==
          [project EXCEPT
            !.layout.gridRows = rows,
            !.layout.gridCols = cols,
            !.slots = ResizeSlots(project, rows, cols)]
    IN
      IF ValidateLayoutProjection(candidate)
        THEN [accepted |-> TRUE, project |-> candidate]
        ELSE [accepted |-> FALSE, project |-> project]

RowsOfCells(cells) == {cell.row : cell \in cells}
ColsOfCells(cells) == {cell.col : cell \in cells}

MinRow(cells) ==
  CHOOSE row \in RowsOfCells(cells) :
    \A other \in RowsOfCells(cells) : row <= other

MaxRow(cells) ==
  CHOOSE row \in RowsOfCells(cells) :
    \A other \in RowsOfCells(cells) : row >= other

MinCol(cells) ==
  CHOOSE col \in ColsOfCells(cells) :
    \A other \in ColsOfCells(cells) : col <= other

MaxCol(cells) ==
  CHOOSE col \in ColsOfCells(cells) :
    \A other \in ColsOfCells(cells) : col >= other

RectangleCells(cells) ==
  {Cell(row, col) :
    row \in MinRow(cells)..MaxRow(cells),
    col \in MinCol(cells)..MaxCol(cells)}

SelectedCells(project, slotIds) ==
  UNION {SlotCells(project.slots[slotId]) : slotId \in slotIds}

NonDefaultSelectedSlotIds(project, slotIds) ==
  {slotId \in slotIds :
    slotHasNonDefaultLocalState(project.slots[slotId])}

MergePrecondition(project, slotIds) ==
  /\ slotIds \subseteq VisibleSlotIds(project)
  /\ slotIds # {}
  /\ Cardinality(slotIds) >= 2
  /\ SelectedCells(project, slotIds) =
       RectangleCells(SelectedCells(project, slotIds))
  /\ Cardinality(NonDefaultSelectedSlotIds(project, slotIds)) <= 1

MergeAnchorId(project, slotIds) ==
  CHOOSE slotId \in slotIds :
    /\ project.slots[slotId].row = MinRow(SelectedCells(project, slotIds))
    /\ project.slots[slotId].col = MinCol(SelectedCells(project, slotIds))

MergeSourceId(project, slotIds) ==
  IF NonDefaultSelectedSlotIds(project, slotIds) = {}
    THEN MergeAnchorId(project, slotIds)
    ELSE CHOOSE slotId \in NonDefaultSelectedSlotIds(project, slotIds) : TRUE

MergeSlotsCandidate(project, slotIds) ==
  LET cells == SelectedCells(project, slotIds)
      anchorId == MergeAnchorId(project, slotIds)
      sourceId == MergeSourceId(project, slotIds)
      sourcePayload == project.slots[sourceId].payload
      candidateSlots ==
        [slotId \in DOMAIN project.slots |->
          IF slotId = anchorId
            THEN [project.slots[slotId] EXCEPT
                    !.rowSpan = MaxRow(cells) - MinRow(cells) + 1,
                    !.colSpan = MaxCol(cells) - MinCol(cells) + 1,
                    !.hidden = FALSE,
                    !.payload = sourcePayload]
          ELSE IF SlotBaseCell(project.slots[slotId]) \in cells
            THEN [project.slots[slotId] EXCEPT
                    !.hidden = TRUE,
                    !.payload = DefaultPayload]
          ELSE project.slots[slotId]]
      candidate == [project EXCEPT !.slots = candidateSlots]
  IN
    IF ValidateLayoutProjection(candidate)
      THEN [accepted |-> TRUE, project |-> candidate]
      ELSE [accepted |-> FALSE, project |-> project]

SplitAnchorPrecondition(project, slotIds) ==
  /\ Cardinality(slotIds) = 1
  /\ slotIds \subseteq VisibleSlotIds(project)
  /\ LET anchorId == CHOOSE slotId \in slotIds : TRUE
     IN
       \/ project.slots[anchorId].rowSpan > 1
       \/ project.slots[anchorId].colSpan > 1

SplitSlotsCandidate(project, slotIds) ==
  LET anchorId == CHOOSE slotId \in slotIds : TRUE
      anchor == project.slots[anchorId]
      cells == SlotCells(anchor)
      candidateSlots ==
        [slotId \in DOMAIN project.slots |->
          IF slotId = anchorId
            THEN [project.slots[slotId] EXCEPT
                    !.rowSpan = 1,
                    !.colSpan = 1,
                    !.hidden = FALSE]
          ELSE IF SlotBaseCell(project.slots[slotId]) \in cells
            THEN [project.slots[slotId] EXCEPT
                    !.rowSpan = 1,
                    !.colSpan = 1,
                    !.hidden = FALSE,
                    !.payload = DefaultPayload]
          ELSE project.slots[slotId]]
      candidate == [project EXCEPT !.slots = candidateSlots]
  IN
    IF ValidateLayoutProjection(candidate)
      THEN [accepted |-> TRUE, project |-> candidate]
      ELSE [accepted |-> FALSE, project |-> project]

SeedPayloadCandidate(project, slotId, payload) ==
  [project EXCEPT
    !.slots =
      [sid \in DOMAIN project.slots |->
        IF sid = slotId
          THEN [project.slots[sid] EXCEPT !.payload = payload]
          ELSE project.slots[sid]]]

TypeOK(project, result) ==
  /\ ValidateLayoutProjection(project)
  /\ result \in {
       "initialized",
       "grid-committed", "grid-rejected",
       "merge-committed", "merge-rejected",
       "split-committed", "split-rejected",
       "harness-seeded"
     }

(*
--algorithm FastFigureLayoutUnit
variables
  activeProject = InitialProject,
  lastResult = "initialized";

procedure setLayoutApiGrid(rows, cols)
variables resizeResult = [accepted |-> FALSE, project |-> activeProject];
begin
GridBuildCandidate:
  resizeResult := buildGridResizeCandidate(activeProject, rows, cols);
GridCommit:
  if resizeResult.accepted then
    activeProject := resizeResult.project ||
    lastResult := "grid-committed";
  else
    lastResult := "grid-rejected";
  end if;
GridReturn:
  return;
end procedure;

procedure mergeSlots(slotIds)
variables mergeResult = [accepted |-> FALSE, project |-> activeProject];
begin
MergeResolve:
  if MergePrecondition(activeProject, slotIds) then
    mergeResult := MergeSlotsCandidate(activeProject, slotIds);
    if mergeResult.accepted then
      activeProject := mergeResult.project ||
      lastResult := "merge-committed";
    else
      lastResult := "merge-rejected";
    end if;
  else
    lastResult := "merge-rejected";
  end if;
MergeReturn:
  return;
end procedure;

procedure splitSlots(slotIds)
variables splitResult = [accepted |-> FALSE, project |-> activeProject];
begin
SplitResolve:
  if SplitAnchorPrecondition(activeProject, slotIds) then
    splitResult := SplitSlotsCandidate(activeProject, slotIds);
    if splitResult.accepted then
      activeProject := splitResult.project ||
      lastResult := "split-committed";
    else
      lastResult := "split-rejected";
    end if;
  else
    lastResult := "split-rejected";
  end if;
SplitReturn:
  return;
end procedure;

procedure VerificationHarnessSeedPayload(slotId, payload)
variables candidate = activeProject;
begin
HarnessSeed:
  if /\ slotId \in VisibleSlotIds(activeProject)
     /\ payload \in PayloadValues \ {DefaultPayload}
     /\ activeProject.slots[slotId].payload = DefaultPayload then
    candidate := SeedPayloadCandidate(activeProject, slotId, payload);
    if ValidateLayoutProjection(candidate) then
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
      with chosenRows \in 1..MaxRows do
        with chosenCols \in 1..MaxCols do
          call setLayoutApiGrid(chosenRows, chosenCols);
        end with;
      end with;
    or
      with chosenMergeSlotIds \in SUBSET VisibleSlotIds(activeProject) do
        call mergeSlots(chosenMergeSlotIds);
      end with;
    or
      with chosenSplitSlotIds \in SUBSET VisibleSlotIds(activeProject) do
        call splitSlots(chosenSplitSlotIds);
      end with;
    or
      with chosenSlotId \in VisibleSlotIds(activeProject) do
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
  ValidateLayoutProjection(activeProject)

=============================================================================
