# Review 20261013-006 — Source Script r17 closure

Source Script revision: r17

Fingerprint:

```text
sha256:2fec6d0c59f9b29a3d1d824ced75db46787fb566dd81373b07812db03b357664
```

## Change trigger

The current UI/source layers contain several user-visible regressions or ownership mismatches that cannot be corrected by inventing lower-layer exceptions:

- slot body selection depends on whether chart/image content exists before it checks whether the slot is already selected;
- dashboard background click has no explicit slot deselection meaning;
- trash asset selection-disabled state also disables the row action menu even though menu availability and selection are separate interactions;
- the earlier protected default CSV was removed with the zero-object chart redesign, but the user-facing empty-CSV insertion command was not restored;
- Layout, Label, Caption and Print outer Modal widths are independently assigned and no longer share one Mantine sizing owner.

Layout-preview centering and actual rendered-width measurement are also required in Source Code, but the existing Source Script dashboardGeometry rule already defines width/height/gap/margin/radius from one geometry width. Those renderer implementation details do not require a new persistent/domain meaning in r17.

## 1. Slot selection interaction

The dashboard interaction controller now defines the full branch order instead of classifying the slot by content first.

1. Resolve whether the click belongs to a visible slot.
2. A dashboard-background click outside a slot:
   - does nothing when no slot is selected;
   - otherwise uses the existing SELECT_SLOT path with no slot id to clear selectedSlotId and derive workspace=project;
   - does not treat toolbar/sidebar/overlay/Modal/project-tree clicks as dashboard-background input.
3. For a visible slot, determine whether that slot is already selected before using content type or content presence.
4. If the clicked visible slot is not selected:
   - graph, image and empty slots use the same slot-selection rule;
   - a valid slot-surface click selects the slot;
   - existing chart/image content does not block this selection entry.
5. If the clicked visible slot is already selected:
   - bookmark click keeps the existing same-slot SELECT_SLOT toggle and therefore deselects;
   - graph-body interaction is left to Plotly without changing selection;
   - image-body interaction is left to the image renderer without changing selection;
   - an empty slot has no content interaction, so its surface click uses the existing same-slot toggle and deselects.
6. Existing bookmark-drag click suppression remains unchanged.

No content-type-specific selection authority or extra selection state is added.

## 2. Explicit deselection semantics

applySlotSelectionAction now explicitly distinguishes:

- payload slot id = none: explicit deselection;
- valid visible slot id different from current: select it;
- same valid slot id under UI toggle semantics: deselect it;
- hidden/nonexistent id: invalid target and no arbitrary selection mutation.

workspace remains derived from selectedSlotId and selected slot contentType.

## 3. Trash asset row menu

FastFigureProjectDataTree keeps separate interaction decisions for:

- whether a trash asset can be used as the normal selected asset / slot connection source;
- whether the row action Menu target can be opened;
- whether each command inside the Menu is enabled.

A trash CSV/image may therefore expose its row action Menu while ordinary asset-selection remains disabled.

This does not define original-location restore. The existing VFS move command may still be used only according to its own preconditions. No original-path field or restore authority is added.

## 4. Empty CSV insertion

The restored empty-CSV command uses the historical data shape but not the historical protected-default-CSV semantics.

Exact asset template:

```text
name        = "빈 CSV.csv"
directory   = /assets/csv
rows        = [["X", "Y"], ["", ""]]
mime        = "text/csv"
headerLines = 1
bytes       = the same rows serialized by the normal project CSV writer as UTF-8
```

Rules:

1. createEmptyProjectCsv creates a normal project CSV through the existing DATA_OBJECT_CREATED path.
2. Name collision uses the ordinary project unique-path rule; it does not silently replace an existing asset.
3. The new CSV has no isDefaultEmpty/protected/undeletable/unmovable state.
4. assets.createEmptyCsv then uses the existing CSV-selection path so the new CSV becomes the current asset/graph CSV selection.
5. The command itself does not create a chart or graph object.
6. When the user adds a graph object, existing graphs.addObject / graphEditorAdd and SLOT_DATA_CONNECTED or GRAPH_OBJECTS_REPLACED semantics are reused.
7. The UI control belongs in the graph-slot data-loading area in the corresponding functional position to the image-slot empty-image insertion control.
8. No protected default CSV and no separate empty-graph mutation path are reintroduced.

## 5. Mantine Modal size ownership

FastFigureLayoutOverlay, FastFigureLabelOverlay, FastFigureCaptionOverlay and FastFigurePrintOverlay no longer own independent outer Modal size decisions.

Their shared outer width is owned by one Fast Figure common maximum-size definition in the Mantine UI layer.

The common maximum must be wider than the currently used Mantine maximum size token. The concrete CSS length/token implementation remains Source Code detail.

FastFigureReadmeOverlay and other Modal purposes are not automatically members of this four-overlay sizing group.

Existing shared Modal centered, outside-click and Escape behavior remains unchanged.

## 6. Source-of-truth and responsibility check

Pass.

- slot selection remains selectedSlotId + ApplicationStateMachine;
- workspace remains derived;
- CSV creation remains the normal project CSV collection and DATA_OBJECT_CREATED path;
- CSV selection remains the existing application assetSelection/assetPath authority;
- graph object creation remains the existing graph mutation path;
- trash menu availability does not become domain state;
- Modal width is generic UI ownership and does not enter project state;
- layout preview actual DOM width remains a renderer projection input and is not introduced as persistent state.

## 7. Project-purpose alignment

Pass.

The changes restore existing figure-editing entry points and make UI behavior consistent without adding a new file format, persistent schema, graph representation, asset class or selection model.

## 8. Closure verdict

Source Script r17 is closed.

No unresolved Source Script design item is introduced by this revision.

The verification model remains stale until these r17 interaction/mutation meanings are translated as required. Source Code remains stale and must not be updated to current before the verification/TLC gate is satisfied.
