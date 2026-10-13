------------------------ MODULE FastFigureInteractionCore ------------------------
EXTENDS Integers, FiniteSets, Sequences, TLC

(*
Executable verification translation for the r17 interaction slice.

Source Script authority:
- sourcescript/application_fsm.py
- sourcescript/renderer_runtime.py
- sourcescript/assets_files.py
- sourcescript/graphs.py
- sourcescript/api_ui.py

This module does not model Mantine DOM implementation details. It verifies the
state-changing meaning introduced or clarified in r17:
- explicit slot deselection;
- selection-state-first slot-surface interaction;
- same-slot bookmark toggle;
- ordinary empty CSV creation;
- new empty CSV becomes the current CSV selection;
- empty CSV creation does not itself create a graph object;
- later graph-object creation references the current selected CSV.

Trash row Menu availability and common Modal maximum are UI-local constraints
with no project mutation and are reviewed outside this state model.
*)

NoSlot == "no-slot"
NoCsv == "no-csv"

SlotIds == 1..3
CsvIds == 1..2

SlotContentType == <<"graph", "image", "graph">>

SlotHasContent == <<TRUE, TRUE, FALSE>>

WorkspaceFor(slotId) ==
  IF slotId = NoSlot
    THEN "project"
    ELSE IF SlotContentType[slotId] = "image"
      THEN "slot.image"
      ELSE "slot.graph"

InitialProject ==
  [ csvIds |-> {},
    nextCsvId |-> 1,
    graphObjectCsvRefs |-> <<>> ]

ValidProject(project) ==
  /\ project.csvIds \subseteq CsvIds
  /\ project.nextCsvId \in 1..(Cardinality(CsvIds) + 1)
  /\ \A index \in 1..Len(project.graphObjectCsvRefs) :
       project.graphObjectCsvRefs[index] \in project.csvIds

TypeOKState(selectedSlotId, workspace, assetSelection, selectedCsvId, project, lastResult) ==
  /\ selectedSlotId \in SlotIds \cup {NoSlot}
  /\ workspace \in {"project", "slot.graph", "slot.image"}
  /\ workspace = WorkspaceFor(selectedSlotId)
  /\ assetSelection \in {"none", "csv"}
  /\ selectedCsvId \in CsvIds \cup {NoCsv}
  /\ (assetSelection = "none" <=> selectedCsvId = NoCsv)
  /\ (selectedCsvId # NoCsv => selectedCsvId \in project.csvIds)
  /\ ValidProject(project)
  /\ lastResult \in {
       "initialized",
       "slot-selected",
       "slot-deselected",
       "content-pass-through",
       "invalid-slot",
       "empty-csv-created",
       "empty-csv-unavailable",
       "graph-object-added",
       "graph-object-rejected"
     }

SelectionInvariant(selectedSlotId, workspace) ==
  workspace = WorkspaceFor(selectedSlotId)

CsvReferenceInvariant(project, selectedCsvId) ==
  /\ selectedCsvId = NoCsv \/ selectedCsvId \in project.csvIds
  /\ \A index \in 1..Len(project.graphObjectCsvRefs) :
       project.graphObjectCsvRefs[index] \in project.csvIds

(*
--algorithm FastFigureInteractionCore
variables
  selectedSlotId = NoSlot,
  workspace = "project",
  assetSelection = "none",
  selectedCsvId = NoCsv,
  project = InitialProject,
  lastResult = "initialized";

procedure ApplySlotSelection(slotId)
begin
SelectResolve:
  if slotId = NoSlot then
    selectedSlotId := NoSlot ||
    workspace := "project" ||
    lastResult := "slot-deselected";
  elsif slotId \in SlotIds then
    if selectedSlotId = slotId then
      selectedSlotId := NoSlot ||
      workspace := "project" ||
      lastResult := "slot-deselected";
    else
      selectedSlotId := slotId ||
      workspace := WorkspaceFor(slotId) ||
      lastResult := "slot-selected";
    end if;
  else
    lastResult := "invalid-slot";
  end if;
SelectReturn:
  return;
end procedure;

procedure SlotSurfaceClick(slotId)
begin
SurfaceResolve:
  if slotId \in SlotIds then
    if selectedSlotId # slotId then
      call ApplySlotSelection(slotId);
    else
      if SlotHasContent[slotId] then
        lastResult := "content-pass-through";
      else
        call ApplySlotSelection(slotId);
      end if;
    end if;
  else
    lastResult := "invalid-slot";
  end if;
SurfaceReturn:
  return;
end procedure;

procedure BookmarkClick(slotId)
begin
BookmarkResolve:
  if slotId \in SlotIds then
    call ApplySlotSelection(slotId);
  else
    lastResult := "invalid-slot";
  end if;
BookmarkReturn:
  return;
end procedure;

procedure DashboardBackgroundClick()
begin
BackgroundDeselect:
  if selectedSlotId # NoSlot then
    call ApplySlotSelection(NoSlot);
  end if;
BackgroundReturn:
  return;
end procedure;

procedure CreateEmptyCsv()
variables
  newCsvId = NoCsv,
  previousGraphObjectCount = 0;
begin
EmptyCsvRememberGraphObjects:
  previousGraphObjectCount := Len(project.graphObjectCsvRefs);
EmptyCsvCapacity:
  if project.nextCsvId \in CsvIds then
    newCsvId := project.nextCsvId;
    project := [
      project EXCEPT
        !.csvIds = @ \cup {newCsvId},
        !.nextCsvId = @ + 1
    ] ||
    assetSelection := "csv" ||
    selectedCsvId := newCsvId ||
    lastResult := "empty-csv-created";
  else
    lastResult := "empty-csv-unavailable";
  end if;
EmptyCsvNoGraphObjectSideEffect:
  assert lastResult # "empty-csv-created"
         \/ Len(project.graphObjectCsvRefs) = previousGraphObjectCount;
EmptyCsvReturn:
  return;
end procedure;

procedure AddGraphObject()
begin
AddGraphGuard:
  if /\ selectedSlotId \in SlotIds
     /\ SlotContentType[selectedSlotId] = "graph"
     /\ selectedCsvId # NoCsv
     /\ selectedCsvId \in project.csvIds then
    project := [
      project EXCEPT
        !.graphObjectCsvRefs = Append(@, selectedCsvId)
    ] ||
    lastResult := "graph-object-added";
  else
    lastResult := "graph-object-rejected";
  end if;
AddGraphReturn:
  return;
end procedure;

begin
Main:
  while TRUE do
    either
      with surfaceSlotId \in SlotIds do
        call SlotSurfaceClick(surfaceSlotId);
      end with;
    or
      with bookmarkSlotId \in SlotIds do
        call BookmarkClick(bookmarkSlotId);
      end with;
    or
      call DashboardBackgroundClick();
    or
      call CreateEmptyCsv();
    or
      call AddGraphObject();
    end either;
  end while;
end algorithm;
*)

TypeOKSpec ==
  TypeOKState(
    selectedSlotId,
    workspace,
    assetSelection,
    selectedCsvId,
    project,
    lastResult)

SelectionInvariantSpec ==
  SelectionInvariant(selectedSlotId, workspace)

CsvReferenceInvariantSpec ==
  CsvReferenceInvariant(project, selectedCsvId)

=============================================================================
