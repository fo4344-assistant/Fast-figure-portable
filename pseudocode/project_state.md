# project_state

## Source identifiers

- `PROJECT_OBJECT_PATHS`: official project read paths.
- `projectState`: complete persistent project schema.
- `csvAsset`: copied tabular asset schema.
- `imageAsset`: copied image asset schema.
- `slot`: GUI slot object schema.
- `SLOT_LOCAL_PROPERTY_RULE`: ownership rule for slot-specific persistent state.
- `SLOT_LOCAL_DEFAULTS`: one default local-state definition.
- `SLOT_LOCAL_DEFAULT_RULE`: all empty/non-default checks reuse SLOT_LOCAL_DEFAULTS.
- `SLOT_REPRESENTATION_RULE`: representation may vary but each slot-local meaning has one owner.
- `EMPTY_GRAPH_RULE`: zero-object editable chart is valid.
- `CHART_OWNERSHIP_RULE`: each chart has exactly one owning slot.
- `SLOT_CAPTION_PLACEHOLDER_RULE`: placeholder text is UI-only.
- `LEGACY_PROJECT_FIELDS`: accepted legacy no-op fields such as layoutMapWidth.
- `REFERENCE_RELATIONS`: project reference-resolution rules.
- `activeProject`: persistent project authority.
- `projectObjects`: current-project read adapter/snapshot provider.
- `projectVfs`: VFS resolver over activeProject.
- `selectedSlotId`: session/runtime selected slot id.
- `DEFAULT_PROJECT_RULES`: new-project defaults.

## Authoritative structures

PROJECT_OBJECT_PATHS resolve these persistent subtrees from the current ProjectObject:

- project metadata
- layout
- labels
- project-global captions
- CSV data assets
- image assets
- VFS directories
- charts
- slots
- next-id sequences
- appearance
- export settings

PROJECT STATE contains:

- meta: projectName, appBuild
- layout: gridRows, gridCols, slotStyle
- annotations.labels
- annotations.captions for project-global caption only
- assets.csvFiles
- assets.images
- fileSystem.directories
- charts
- slots
- nextId.csv/image/chart
- appearance.uiPalette
- export.width/heightMode/height/dpi/format

CSV ASSET contains copied bytes, parsed rows, MIME, headerLines and VFS location.

IMAGE ASSET contains copied bytes, MIME and VFS location.
It does not own fit/scale/x/y display state.

SLOT contains layout placement plus these slot-local properties:

- content.chart
- content.imageId
- content.contentType
- content.imageSettings = fit/scale/x/y
- caption

SLOT_LOCAL_DEFAULTS:

- chart = none
- imageId = none
- contentType = graph
- imageSettings = contain / 100 / 50 / 50
- caption = none

Global caption is project-level.
Slot caption and image display settings are slot-local and move with the slot-local payload.

## Reference invariants

1. `slot.chart` resolves in chart collection.
2. Every chart has exactly one owning slot.
3. Shared chart and orphan chart are invalid.
4. `slot.imageId` resolves in image assets.
5. Every graph object `csvId` resolves in CSV assets.
6. Asset path is derived from asset.directory + asset.name and resolves through projectVfs.
7. nextId for each collection is greater than every current id.
8. `layoutMapWidth` is legacy input only and is not authoritative state.

## ProjectObject.read

INPUT path

1. Resolve path through current ProjectObject and declared project read paths.
2. If path is invalid, fail.
3. Return current authoritative value without mutation.

## ProjectObject.initialize

INPUT source candidate

1. Treat source as non-authoritative candidate.
2. Normalize every slot with `normalizeSlotContent`.
3. Validate full candidate with `validateProjectObjectState`.
4. If validation fails, keep current authoritative project unchanged.
5. If validation succeeds, replace authoritative project once.
6. Return previous project only for post-commit resource cleanup when needed.

## ProjectObjectRegistry.read

INPUT registered name

1. Resolve the name against the current ProjectObject provider.
2. Return the current value.
3. Never return a stored long-lived project snapshot as authority.

## ProjectObjectRegistry.snapshot

INPUT names

1. Read each requested value from current ProjectObject.
2. Deep-copy them for one operation.
3. Return a read-only operation snapshot.
4. Do not use the snapshot as a later mutation authority.

## slotHasNonDefaultLocalState

INPUT slot

1. Normalize slot-local state.
2. Compare chart, imageId, contentType, complete imageSettings and caption against SLOT_LOCAL_DEFAULTS.
3. Ignore row/col/span/hidden because they are layout placement.
4. Return whether any slot-local property differs.

## normalizeSlotContent

INPUT slot candidate

1. Normalize chart/image/contentType/imageSettings into one slot-local content source.
2. Fill missing local fields from SLOT_LOCAL_DEFAULTS.
3. Never take display settings from image asset authority.
4. Normalize caption as slot-local caption.
5. If legacy representation stores caption under nested content, move it to the same slot caption meaning.
6. Do not create UI placeholder strings as stored caption.
7. If compatibility aliases exist, make them resolve the same owner instead of duplicating state.
8. Return normalized slot.

## validateProjectObjectState

INPUT state, requireSlots

Reject unless all conditions hold:

1. Required top-level/nested structures exist.
2. gridRows/gridCols are integers in 1..8.
3. slotStyle values and booleans are valid.
4. label position and font rules are valid.
5. export settings obey width/heightMode/height/dpi/format rules.
6. VFS paths are canonical, unique, and fixed directories exist.
7. CSV/image ids and asset paths are unique.
8. Every asset directory exists.
9. Chart ids are unique.
10. Editable chart may contain zero graph objects.
11. Every existing graph-object CSV reference resolves.
12. Slot ids and geometry are valid and stay inside grid.
13. A slot does not reference both chart and image.
14. Slot chart/image references resolve.
15. slot.imageSettings obey schema/ranges.
16. Image assets do not need display settings.
17. Every chart has exactly one owning slot.
18. Unset caption is null/empty; placeholder is not required.
19. nextId values exceed existing ids.
20. If requireSlots, at least one slot exists.

Return the same validated state.

## createProjectState

1. Create project metadata and default 2x2 layout/style.
2. Create default global labels, global caption, appearance and export settings.
3. Create empty CSV/image/chart collections.
4. Create fixed VFS directories.
5. Initialize id sequences.
6. Create four visible 1x1 slots using SLOT_LOCAL_DEFAULTS.
7. Do not create default CSV or fake graph object.
8. Validate full candidate.
9. Return candidate.

## resolveOwningSlot

INPUT chartId, state

1. Collect slots referencing chartId.
2. If exactly one exists, return it.
3. Otherwise return no owner; do not clone/drop references.

## getProjectCsv / getProjectImage / getChart

INPUT id

1. Resolve id in the corresponding authoritative collection.
2. Return matching object or none.
