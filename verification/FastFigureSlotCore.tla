--------------------------- MODULE FastFigureSlotCore ---------------------------
EXTENDS Integers, FiniteSets, Sequences, TLC

(*
Direct executable verification translation of the slot/layout/chart slice.

Source Script authority:
- sourcescript/project_state.py
- sourcescript/application_fsm.py
- sourcescript/layout_annotations_export.py

The Source Script remains the design authority.
This file preserves the Source Script function boundaries, data ownership,
candidate -> validate -> commit order, branch meaning, and failure behavior.
TLC-only state generators are explicitly named VerificationHarness* and are not
Fast Figure domain commands.
*)

MaxRows == 3
MaxCols == 3
InitialRows == 2
InitialCols == 2

NoChart == "no-chart"
NoImage == "no-image"
NoCaption == "no-caption"

ChartIds == {"chart-1", "chart-2"}
ImageIds == {"image-1"}

Cell(row, col) == [row |-> row, col |-> col]
Cells == {Cell(row, col) : row \in 1..MaxRows, col \in 1..MaxCols}

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

DefaultImageSettings ==
  [fit |-> "contain", scale |-> 100, x |-> 50, y |-> 50]

SLOT_LOCAL_DEFAULTS ==
  [ chart         |-> NoChart,
    imageId       |-> NoImage,
    contentType   |-> "graph",
    imageSettings |-> DefaultImageSettings,
    caption       |-> NoCaption ]

DefaultContent ==
  [ chart         |-> SLOT_LOCAL_DEFAULTS.chart,
    imageId       |-> SLOT_LOCAL_DEFAULTS.imageId,
    contentType   |-> SLOT_LOCAL_DEFAULTS.contentType,
    imageSettings |-> SLOT_LOCAL_DEFAULTS.imageSettings ]

DefaultSlot(slotId) ==
  [ id       |-> slotId,
    row      |-> SlotRow(slotId),
    col      |-> SlotCol(slotId),
    rowSpan  |-> 1,
    colSpan  |-> 1,
    hidden   |-> FALSE,
    content  |-> DefaultContent,
    caption  |-> SLOT_LOCAL_DEFAULTS.caption ]

InitialSlots ==
  [slotId \in ExpectedSlotIds(InitialRows, InitialCols) |->
    DefaultSlot(slotId)]

InitialProject ==
  [ layout |-> [gridRows |-> InitialRows, gridCols |-> InitialCols],
    slots  |-> InitialSlots,
    charts |-> {},
    images |-> {} ]

SlotLocalState(slot) ==
  [ chart         |-> slot.content.chart,
    imageId       |-> slot.content.imageId,
    contentType   |-> slot.content.contentType,
    imageSettings |-> slot.content.imageSettings,
    caption       |-> slot.caption ]

WithSlotLocalState(slot, localState) ==
  [slot EXCEPT
    !.content.chart = localState.chart,
    !.content.imageId = localState.imageId,
    !.content.contentType = localState.contentType,
    !.content.imageSettings = localState.imageSettings,
    !.caption = localState.caption]

ResetSlotLocalState(slot) ==
  WithSlotLocalState(slot, SLOT_LOCAL_DEFAULTS)

slotHasNonDefaultLocalState(slot) ==
  SlotLocalState(slot) # SLOT_LOCAL_DEFAULTS

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

SlotBaseCell(slot) == Cell(slot.row, slot.col)

LayoutCoverageValid(project) ==
  /\ \A cell \in ActiveCells(project) :
       Cardinality(CoveringVisibleSlots(project, cell)) = 1
  /\ \A slotId \in DOMAIN project.slots :
       LET covering == CoveringVisibleSlots(
                         project,
                         SlotBaseCell(project.slots[slotId]))
       IN
         IF project.slots[slotId].hidden
           THEN /\ Cardinality(covering) = 1
                /\ slotId \notin covering
           ELSE covering = {slotId}

SlotReferenceIntegrity(project) ==
  \A slotId \in DOMAIN project.slots :
    LET local == SlotLocalState(project.slots[slotId])
    IN
      /\ (local.chart = NoChart \/ local.chart \in project.charts)
      /\ (local.imageId = NoImage \/ local.imageId \in project.images)
      /\ ~(local.chart # NoChart /\ local.imageId # NoImage)
      /\ (local.chart # NoChart => local.contentType = "graph")
      /\ (local.imageId # NoImage => local.contentType = "image")

ChartOwnershipInvariant(project) ==
  \A chartId \in project.charts :
    Cardinality(
      {slotId \in DOMAIN project.slots :
        project.slots[slotId].content.chart = chartId}
    ) = 1

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

ValidateSlotLayoutProjection(project) ==
  /\ project.layout.gridRows \in 1..MaxRows
  /\ project.layout.gridCols \in 1..MaxCols
  /\ project.charts \subseteq ChartIds
  /\ project.images \subseteq ImageIds
  /\ SlotGeometryValid(project)
  /\ LayoutCoverageValid(project)
  /\ SlotReferenceIntegrity(project)
  /\ ChartOwnershipInvariant(project)

(*
This slice models only the fields touched by the translated Source Script
functions below. Other ProjectObject fields are assumed unchanged and already
valid. Therefore a whole-project validation call in the Source Script is
represented here by ValidateSlotLayoutProjection for this projection only.
*)

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
    THEN [accepted |-> FALSE, project |-> project, reason |-> "invalid-grid-size"]
  ELSE IF (rows < project.layout.gridRows \/ cols < project.layout.gridCols)
          /\ ~GridShrinkSafe(project, rows, cols)
    THEN [accepted |-> FALSE, project |-> project, reason |-> "unsafe-shrink"]
  ELSE
    LET candidate ==
      [project EXCEPT
        !.layout.gridRows = rows,
        !.layout.gridCols = cols,
        !.slots = ResizeSlots(project, rows, cols)]
    IN
      IF ValidateSlotLayoutProjection(candidate)
        THEN [accepted |-> TRUE, project |-> candidate, reason |-> "accepted"]
        ELSE [accepted |-> FALSE, project |-> project, reason |-> "invalid-candidate"]

ChartsOwnedBySlotIds(project, slotIds) ==
  {project.slots[slotId].content.chart :
    slotId \in
      {candidateSlotId \in slotIds :
        project.slots[candidateSlotId].content.chart # NoChart}}

ResetSlotsCandidate(project, slotIds) ==
  LET candidateSlots ==
    [slotId \in DOMAIN project.slots |->
      IF slotId \in slotIds
        THEN ResetSlotLocalState(project.slots[slotId])
        ELSE project.slots[slotId]]
      removedCharts == ChartsOwnedBySlotIds(project, slotIds)
  IN
    [project EXCEPT
      !.slots = candidateSlots,
      !.charts = project.charts \ removedCharts]

SwapSlotsCandidate(project, sourceId, targetId) ==
  LET sourceLocal == SlotLocalState(project.slots[sourceId])
      targetLocal == SlotLocalState(project.slots[targetId])
      candidateSlots ==
        [slotId \in DOMAIN project.slots |->
          IF slotId = sourceId
            THEN WithSlotLocalState(project.slots[slotId], targetLocal)
          ELSE IF slotId = targetId
            THEN WithSlotLocalState(project.slots[slotId], sourceLocal)
          ELSE project.slots[slotId]]
  IN [project EXCEPT !.slots = candidateSlots]

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
      sourceLocal == SlotLocalState(project.slots[sourceId])
      candidateSlots ==
        [slotId \in DOMAIN project.slots |->
          IF slotId = anchorId
            THEN [WithSlotLocalState(project.slots[slotId], sourceLocal) EXCEPT
                    !.rowSpan = MaxRow(cells) - MinRow(cells) + 1,
                    !.colSpan = MaxCol(cells) - MinCol(cells) + 1,
                    !.hidden = FALSE]
          ELSE IF SlotBaseCell(project.slots[slotId]) \in cells
            THEN [ResetSlotLocalState(project.slots[slotId]) EXCEPT !.hidden = TRUE]
          ELSE project.slots[slotId]]
      candidate == [project EXCEPT !.slots = candidateSlots]
  IN
    IF ValidateSlotLayoutProjection(candidate)
      THEN [accepted |-> TRUE, project |-> candidate, reason |-> "accepted"]
      ELSE [accepted |-> FALSE, project |-> project, reason |-> "invalid-candidate"]

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
            THEN [ResetSlotLocalState(project.slots[slotId]) EXCEPT
                    !.rowSpan = 1,
                    !.colSpan = 1,
                    !.hidden = FALSE]
          ELSE project.slots[slotId]]
      candidate == [project EXCEPT !.slots = candidateSlots]
  IN
    IF ValidateSlotLayoutProjection(candidate)
      THEN [accepted |-> TRUE, project |-> candidate, reason |-> "accepted"]
      ELSE [accepted |-> FALSE, project |-> project, reason |-> "invalid-candidate"]

TypeOK(project, result) ==
  /\ ValidateSlotLayoutProjection(project)
  /\ result \in {
       "initialized",
       "reset-committed", "reset-rejected",
       "swap-committed", "swap-rejected",
       "grid-committed", "grid-rejected",
       "merge-committed", "merge-rejected",
       "split-committed", "split-rejected",
       "harness-seeded"
     }

(*
--algorithm FastFigureSlotCore
variables
  activeProject = InitialProject,
  lastResult = "initialized";

procedure applySlotsResetAction(slotIds)
variables candidate = activeProject;
begin
ResetResolve:
  if slotIds \subseteq DOMAIN activeProject.slots then
    candidate := ResetSlotsCandidate(activeProject, slotIds);
    if ValidateSlotLayoutProjection(candidate) then
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

procedure applySlotsSwappedAction(sourceId, targetId)
variables candidate = activeProject;
begin
SwapResolve:
  if /\ sourceId \in VisibleSlotIds(activeProject)
     /\ targetId \in VisibleSlotIds(activeProject)
     /\ sourceId # targetId then
    candidate := SwapSlotsCandidate(activeProject, sourceId, targetId);
    if ValidateSlotLayoutProjection(candidate) then
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

procedure setLayoutApiGrid(rows, cols)
variables resizeResult = [accepted |-> FALSE,
                          project |-> activeProject,
                          reason |-> "not-run"];
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
  return;
end procedure;

procedure applyGridLayoutAction(rows, cols)
begin
ApplyGrid:
  call setLayoutApiGrid(rows, cols);
  return;
end procedure;

procedure mergeSlots(slotIds)
variables mergeResult = [accepted |-> FALSE,
                         project |-> activeProject,
                         reason |-> "not-run"];
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
variables splitResult = [accepted |-> FALSE,
                         project |-> activeProject,
                         reason |-> "not-run"];
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

\* Verification harness only.
\* These procedures generate valid representative prestates so TLC can exercise
\* the translated Source Script procedures with non-default slot-local state.
\* They are not Fast Figure domain commands and do not participate in the
\* Source Script -> verification code -> source code mapping.

procedure VerificationHarnessSeedChart(slotId, chartId)
variables slot = DefaultSlot(1);
begin
HarnessChart:
  if /\ slotId \in VisibleSlotIds(activeProject)
     /\ ~slotHasNonDefaultLocalState(activeProject.slots[slotId])
     /\ chartId \in ChartIds \ activeProject.charts then
    slot := WithSlotLocalState(
              activeProject.slots[slotId],
              [SLOT_LOCAL_DEFAULTS EXCEPT !.chart = chartId]);
    activeProject :=
      [activeProject EXCEPT
        !.slots =
          [sid \in DOMAIN activeProject.slots |->
            IF sid = slotId THEN slot ELSE activeProject.slots[sid]],
        !.charts = activeProject.charts \cup {chartId}] ||
    lastResult := "harness-seeded";
  end if;
HarnessChartReturn:
  return;
end procedure;

procedure VerificationHarnessSeedImage(slotId, imageId)
variables local = SLOT_LOCAL_DEFAULTS;
begin
HarnessImage:
  if /\ slotId \in VisibleSlotIds(activeProject)
     /\ ~slotHasNonDefaultLocalState(activeProject.slots[slotId])
     /\ imageId \in ImageIds then
    local := [SLOT_LOCAL_DEFAULTS EXCEPT
               !.imageId = imageId,
               !.contentType = "image",
               !.imageSettings =
                 [fit |-> "manual", scale |-> 125, x |-> 40, y |-> 60]];
    activeProject :=
      [activeProject EXCEPT
        !.slots =
          [sid \in DOMAIN activeProject.slots |->
            IF sid = slotId
              THEN WithSlotLocalState(activeProject.slots[sid], local)
              ELSE activeProject.slots[sid]],
        !.images = activeProject.images \cup {imageId}] ||
    lastResult := "harness-seeded";
  end if;
HarnessImageReturn:
  return;
end procedure;

procedure VerificationHarnessSeedCaption(slotId)
variables local = SLOT_LOCAL_DEFAULTS;
begin
HarnessCaption:
  if /\ slotId \in VisibleSlotIds(activeProject)
     /\ ~slotHasNonDefaultLocalState(activeProject.slots[slotId]) then
    local := [SLOT_LOCAL_DEFAULTS EXCEPT !.caption = "caption"];
    activeProject :=
      [activeProject EXCEPT
        !.slots =
          [sid \in DOMAIN activeProject.slots |->
            IF sid = slotId
              THEN WithSlotLocalState(activeProject.slots[sid], local)
              ELSE activeProject.slots[sid]]] ||
    lastResult := "harness-seeded";
  end if;
HarnessCaptionReturn:
  return;
end procedure;

procedure VerificationHarnessSeedImageSettings(slotId)
variables local = SLOT_LOCAL_DEFAULTS;
begin
HarnessSettings:
  if /\ slotId \in VisibleSlotIds(activeProject)
     /\ ~slotHasNonDefaultLocalState(activeProject.slots[slotId]) then
    local := [SLOT_LOCAL_DEFAULTS EXCEPT
               !.imageSettings =
                 [fit |-> "manual", scale |-> 125, x |-> 40, y |-> 60]];
    activeProject :=
      [activeProject EXCEPT
        !.slots =
          [sid \in DOMAIN activeProject.slots |->
            IF sid = slotId
              THEN WithSlotLocalState(activeProject.slots[sid], local)
              ELSE activeProject.slots[sid]]] ||
    lastResult := "harness-seeded";
  end if;
HarnessSettingsReturn:
  return;
end procedure;

begin
VerificationHarness:
  while TRUE do
    either
      with chosenResetSlotIds \in SUBSET (DOMAIN activeProject.slots) do
        call applySlotsResetAction(chosenResetSlotIds);
      end with;
    or
      with chosenSourceId \in VisibleSlotIds(activeProject) do
        with chosenTargetId \in VisibleSlotIds(activeProject) \ {chosenSourceId} do
          call applySlotsSwappedAction(chosenSourceId, chosenTargetId);
        end with;
      end with;
    or
      with chosenRows \in 1..MaxRows do
        with chosenCols \in 1..MaxCols do
          call applyGridLayoutAction(chosenRows, chosenCols);
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
      with chosenChartSlotId \in VisibleSlotIds(activeProject) do
        with chosenChartId \in ChartIds do
          call VerificationHarnessSeedChart(chosenChartSlotId, chosenChartId);
        end with;
      end with;
    or
      with chosenImageSlotId \in VisibleSlotIds(activeProject) do
        with chosenImageId \in ImageIds do
          call VerificationHarnessSeedImage(chosenImageSlotId, chosenImageId);
        end with;
      end with;
    or
      with chosenCaptionSlotId \in VisibleSlotIds(activeProject) do
        call VerificationHarnessSeedCaption(chosenCaptionSlotId);
      end with;
    or
      with chosenSettingsSlotId \in VisibleSlotIds(activeProject) do
        call VerificationHarnessSeedImageSettings(chosenSettingsSlotId);
      end with;
    end either;
  end while;
end algorithm;
*)

TypeOKSpec ==
  TypeOK(activeProject, lastResult)

ChartOwnershipInvariantSpec ==
  ChartOwnershipInvariant(activeProject)

SafetyInvariant ==
  ValidateSlotLayoutProjection(activeProject)

=============================================================================
