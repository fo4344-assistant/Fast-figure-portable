# Review 20261013-007 — PlusCal r17 translation

## Source authority

- Source Script revision: r17
- fingerprint: `sha256:2fec6d0c59f9b29a3d1d824ced75db46787fb566dd81373b07812db03b357664`
- closure review: `agent_space/reviews/review-20261013-006-sourcescript-closure-r17.md`

## Translation changes

### application_fsm.pcal

Slot selection now resolves only visible slot ids when the payload is not NoSelection. NoSelection remains the explicit deselection input. The existing same-slot UI toggle branch remains intact.

### renderer_runtime.pcal

The old split between ContentBodyClick and EmptySlotClick is removed.

The new SlotSurfaceClick procedure preserves the Source Script branch order:

1. resolve visible slot;
2. if the slot is not currently selected, select it regardless of graph/image/empty content;
3. if already selected and the slot has graph/image content, pass interaction to the content renderer without changing selection;
4. if already selected and empty, send the existing same-slot selection command and therefore toggle off.

DashboardBackgroundClick sends NoSelection only when a slot is currently selected.

Bookmark drag/click suppression procedures are unchanged.

### assets_files.pcal

CreateEmptyProjectCsv directly translates the r17 ordinary-asset template:

- `빈 CSV.csv`
- rows `[["X","Y"],["",""]]`
- `text/csv`
- headerLines 1
- ordinary collision-free project path
- existing DATA_OBJECT_CREATED path through CreateCsv
- assertion that no protected/default marker is introduced.

### api_ui.pcal

CreateEmptyCsv calls the asset creation procedure and then the existing CSV-selection command. It does not emit chart/object creation.

OpenTrashAssetRowMenu models Menu availability separately from normal asset selection.

ResolveSettingsOverlayMaximum models one shared setting-overlay maximum and asserts that it is wider than the built-in Mantine maximum; concrete CSS units remain Source Code detail.

### graphs.pcal

AddGraphObject explicitly requires the passed csvId to be the current selected CSV id. No empty-CSV-specific graph mutation is added.

## Non-persistent UI boundary

Trash Menu opened state and concrete Modal dimensions are not promoted to project authority. The pseudocode records their interaction constraints but does not create persistent domain state for them.

## Validation state

This review records semantic translation only. Official PlusCal translation/SANY and TLC execution are not claimed here because the current execution environment does not contain `tla2tools.jar` and external tool download is unavailable.

The canonical verification-model therefore remains stale/pending until an executable r17 verification model is produced and checked.

## Verdict

The r17 Source Script changes are translated into the corresponding PlusCal pseudocode without adding a protected default CSV, a second slot-selection authority, original-location restore state, or a separate empty-graph command.
