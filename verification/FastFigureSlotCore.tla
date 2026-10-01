--------------------------- MODULE FastFigureSlotCore ---------------------------
EXTENDS Integers, FiniteSets, TLC

(*
Source Script lineage:
- sourcescript/project_state.py
- sourcescript/layout_annotations_export.py
- sourcescript/application_fsm.py

This bounded model checks the slot/layout/chart-ownership slice.
The finite domain is an abstraction for TLC exploration, not a project limit.
*)

MaxRows == 3
MaxCols == 3
InitialRows == 2
InitialCols == 2

Cells == [row : 1..MaxRows, col : 1..MaxCols]

NoCell == "no-cell"
NoChart == "no-chart"
NoImage == "no-image"
NoCaption == "no-caption"

ChartIds == {"chart-1", "chart-2"}
ImageIds == {"image-1"}

DefaultPayload ==
  [ chart         |-> NoChart,
    image         |-> NoImage,
    contentType   |-> "graph",
    imageSettings |-> "default",
    caption       |-> NoCaption ]

CaptionPayload ==
  [DefaultPayload EXCEPT !.caption = "caption"]

CustomSettingsPayload ==
  [DefaultPayload EXCEPT !.imageSettings = "custom"]

ChartPayload(chartId) ==
  [DefaultPayload EXCEPT !.chart = chartId]

ImagePayload(imageId) ==
  [ chart         |-> NoChart,
    image         |-> imageId,
    contentType   |-> "image",
    imageSettings |-> "custom",
    caption       |-> NoCaption ]

PayloadType ==
  {DefaultPayload, CaptionPayload, CustomSettingsPayload}
  \cup {ChartPayload(chartId) : chartId \in ChartIds}
  \cup {ImagePayload(imageId) : imageId \in ImageIds}

OperationNames ==
  {"init", "seed-chart", "seed-image", "seed-caption", "seed-settings",
   "swap", "reset", "merge", "split", "resize"}

(*
--algorithm FastFigureSlotCore {
variables
  gridRows = InitialRows,
  gridCols = InitialCols,
  payload = [cell \in Cells |-> DefaultPayload],
  cover = [cell \in Cells |-> NoCell],
  charts = {},
  lastOp = "init";

define {
  Active(cell) ==
    /\ cell.row <= gridRows
    /\ cell.col <= gridCols

  ActiveCells ==
    {cell \in Cells : Active(cell)}

  VisibleCells ==
    {cell \in ActiveCells : cover[cell] = NoCell}

  Region(anchor) ==
    {anchor} \cup {cell \in ActiveCells : cover[cell] = anchor}

  Owner(cell) ==
    IF cover[cell] = NoCell THEN cell ELSE cover[cell]

  RowsOf(cellSet) ==
    {cell.row : cell \in cellSet}

  ColsOf(cellSet) ==
    {cell.col : cell \in cellSet}

  IsRectangle(cellSet) ==
    /\ cellSet # {}
    /\ cellSet =
         {cell \in Cells :
            /\ cell.row \in RowsOf(cellSet)
            /\ cell.col \in ColsOf(cellSet)}

  SelectedRegion(selection) ==
    UNION {Region(anchor) : anchor \in selection}

  NonDefaultSelected(selection) ==
    {anchor \in selection : payload[anchor] # DefaultPayload}

  MergeAnchor(selection) ==
    CHOOSE cell \in SelectedRegion(selection) :
      \A other \in SelectedRegion(selection) :
        /\ cell.row <= other.row
        /\ cell.col <= other.col

  MergeSource(selection) ==
    IF NonDefaultSelected(selection) = {}
      THEN MergeAnchor(selection)
      ELSE CHOOSE anchor \in NonDefaultSelected(selection) : TRUE

  MergeEnabled(selection) ==
    /\ selection \subseteq VisibleCells
    /\ Cardinality(selection) >= 2
    /\ IsRectangle(SelectedRegion(selection))
    /\ MergeAnchor(selection) \in selection
    /\ Cardinality(NonDefaultSelected(selection)) <= 1

  WillBeActive(cell, rows, cols) ==
    /\ cell.row <= rows
    /\ cell.col <= cols

  RemovedCells(rows, cols) ==
    {cell \in ActiveCells : ~WillBeActive(cell, rows, cols)}

  ResizeSafe(rows, cols) ==
    /\ rows \in 1..MaxRows
    /\ cols \in 1..MaxCols
    /\ (rows # gridRows \/ cols # gridCols)
    /\ \A cell \in RemovedCells(rows, cols) :
         /\ payload[Owner(cell)] = DefaultPayload
         /\ Cardinality(Region(Owner(cell))) = 1

  TypeOK ==
    /\ gridRows \in 1..MaxRows
    /\ gridCols \in 1..MaxCols
    /\ payload \in [Cells -> PayloadType]
    /\ cover \in [Cells -> (Cells \cup {NoCell})]
    /\ charts \subseteq ChartIds
    /\ lastOp \in OperationNames

  InactiveCellsAreDefault ==
    \A cell \in Cells \ ActiveCells :
      /\ payload[cell] = DefaultPayload
      /\ cover[cell] = NoCell

  CoverIntegrity ==
    \A cell \in ActiveCells :
      IF cover[cell] = NoCell
        THEN TRUE
        ELSE
          /\ cover[cell] \in ActiveCells
          /\ cover[cover[cell]] = NoCell
          /\ cover[cell] # cell

  HiddenCellsAreDefault ==
    \A cell \in ActiveCells :
      cover[cell] # NoCell => payload[cell] = DefaultPayload

  MergedRegionsAreRectangles ==
    \A anchor \in VisibleCells :
      IsRectangle(Region(anchor))

  SlotReferenceIntegrity ==
    \A cell \in ActiveCells :
      /\ (payload[cell].chart = NoChart \/ payload[cell].chart \in charts)
      /\ (payload[cell].image = NoImage \/ payload[cell].image \in ImageIds)
      /\ ~(payload[cell].chart # NoChart /\ payload[cell].image # NoImage)
      /\ (payload[cell].chart # NoChart => payload[cell].contentType = "graph")
      /\ (payload[cell].image # NoImage => payload[cell].contentType = "image")

  ChartOwnershipInvariant ==
    \A chartId \in charts :
      Cardinality(
        {cell \in ActiveCells : payload[cell].chart = chartId}
      ) = 1

  SafetyInvariant ==
    /\ TypeOK
    /\ InactiveCellsAreDefault
    /\ CoverIntegrity
    /\ HiddenCellsAreDefault
    /\ MergedRegionsAreRectangles
    /\ SlotReferenceIntegrity
    /\ ChartOwnershipInvariant
}

begin
Main:
  while (TRUE) {
    either {
      with (cell \in {slot \in VisibleCells : payload[slot] = DefaultPayload}) {
        with (chartId \in ChartIds \ charts) {
          payload[cell] := ChartPayload(chartId)
          ||
          charts := charts \cup {chartId}
          ||
          lastOp := "seed-chart";
        };
      };
    }
    or {
      with (cell \in {slot \in VisibleCells : payload[slot] = DefaultPayload}) {
        with (imageId \in ImageIds) {
          payload[cell] := ImagePayload(imageId)
          ||
          lastOp := "seed-image";
        };
      };
    }
    or {
      with (cell \in {slot \in VisibleCells : payload[slot] = DefaultPayload}) {
        payload[cell] := CaptionPayload
        ||
        lastOp := "seed-caption";
      };
    }
    or {
      with (cell \in {slot \in VisibleCells : payload[slot] = DefaultPayload}) {
        payload[cell] := CustomSettingsPayload
        ||
        lastOp := "seed-settings";
      };
    }
    or {
      with (source \in VisibleCells) {
        with (target \in VisibleCells \ {source}) {
          payload[source] := payload[target]
          ||
          payload[target] := payload[source]
          ||
          lastOp := "swap";
        };
      };
    }
    or {
      with (cell \in VisibleCells) {
        payload[cell] := DefaultPayload
        ||
        charts := charts \ {payload[cell].chart}
        ||
        lastOp := "reset";
      };
    }
    or {
      with (selection \in {s \in SUBSET(VisibleCells) : MergeEnabled(s)}) {
        payload :=
          [cell \in Cells |->
            IF cell = MergeAnchor(selection)
              THEN payload[MergeSource(selection)]
              ELSE IF cell \in SelectedRegion(selection)
                THEN DefaultPayload
                ELSE payload[cell]]
        ||
        cover :=
          [cell \in Cells |->
            IF cell = MergeAnchor(selection)
              THEN NoCell
              ELSE IF cell \in SelectedRegion(selection)
                THEN MergeAnchor(selection)
                ELSE cover[cell]]
        ||
        lastOp := "merge";
      };
    }
    or {
      with (anchor \in
        {cell \in VisibleCells : Cardinality(Region(cell)) > 1}) {
        payload :=
          [cell \in Cells |->
            IF cell \in (Region(anchor) \ {anchor})
              THEN DefaultPayload
              ELSE payload[cell]]
        ||
        cover :=
          [cell \in Cells |->
            IF cell \in Region(anchor)
              THEN NoCell
              ELSE cover[cell]]
        ||
        lastOp := "split";
      };
    }
    or {
      with (rows \in 1..MaxRows) {
        with (cols \in 1..MaxCols) {
          await ResizeSafe(rows, cols);
          payload :=
            [cell \in Cells |->
              IF Active(cell) /\ WillBeActive(cell, rows, cols)
                THEN payload[cell]
                ELSE DefaultPayload]
          ||
          cover :=
            [cell \in Cells |->
              IF Active(cell) /\ WillBeActive(cell, rows, cols)
                THEN cover[cell]
                ELSE NoCell]
          ||
          gridRows := rows
          ||
          gridCols := cols
          ||
          lastOp := "resize";
        };
      };
    };
  };
end algorithm;
*)

=============================================================================
