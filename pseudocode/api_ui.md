# api_ui

## Source identifiers

- `FastFigureApi`: frontend public API namespace.
- `PUBLIC_API_METHODS`: authoritative method-level contract.
- `LOWER_LAYER_API_REPLACEMENTS`: stale lower-layer method replacements.
- `API_BOUNDARY_RULE`: frontend mutation boundary.
- `READ_RULE`: reads reproject from current authority.
- `UI_LOCAL_STATE`: modal/input/pointer/editor-target state.
- `UI_LOCAL_STATE_RULE`: UI-local values are not project authority.
- `MANTINE_COMPONENT_OWNERSHIP`: UI component responsibility map.
- `MANTINE_THEME_RULE`: shared generic Mantine UI defaults.

## API boundary

1. Mantine frontend does not directly mutate activeProject, projectVfs, chart collection or CSV collection.
2. Persistent/domain changes use declared public API commands or declared appFSM mutation events.
3. Read methods recalculate projections from current authority.
4. UI-local modal/input/pointer/editor-target state is not persistent project state.
5. A UI-local draft becomes persistent only through its official mutation command.

## Public API contracts

### project

- readName: read current project name.
- setName: validate candidate name, commit or keep existing name.
- importFile: FFPX -> validated ProjectObject candidate -> PROJECT_LOADED lifecycle mutation.
- exportFile: snapshot current validated project -> FFPX; no project mutation.

### slots

- readSelected: resolve selectedSlotId to current slot projection.
- select: runtime selection toggle.
- setContentType: candidate-change slot-local contentType.
- reset: reset complete slot-local payload and remove owned chart.
- prepareFileDrop: runtime/calculation for drop target and acceptability.
- finishFileDrop: end drag/drop runtime state; import command owns domain mutation.

### images

- readEditor: selected slot -> image asset + slot-local imageSettings.
- setSettings: validate/commit selected slot imageSettings.
- insertEmpty: create image asset + selected slot reference in one candidate mutation.

### assets

- readDeletionTarget: target + collectAssetReferences.
- delete: reference detach + asset removal candidate.
- readTree: VFS/assets -> tree projection.
- isTrashed: calculate trash-subtree membership.
- movable: calculate move eligibility.
- readTrash: trash projection.
- moveOptions: calculate target directory options.
- planMove: calculate destination/collision/reference count.
- move: revalidate against current VFS, then commit candidate.
- createDirectory: canonical collision-free directory candidate.
- emptyTrash: reference/assets/directories candidate removal.
- draggableAsset: read drag payload projection.
- connectToSlot: only explicit add/drop command resolves an existing asset and target slot object, validates and connects; selecting an asset alone never connects.
- importToDirectory: batch candidate import.
- importToSlot: asset + target slot/chart candidate import.
- fileKind: classify supported slot-import kind.
- importFiles: route supported files to import contract.
- collisionModel: calculate import collision.
- resolveImportPlan: user choice -> path/replace-id plan.
- selectDirectory/selectCsv/selectImage: runtime VFS-resolved selection only. selectImage never changes slot contents.
- download: output copied asset bytes without project mutation.

### graphs

- readData: current chart object projection, selected CSV/columns from the one FSM asset selection; graph-object csvId never substitutes for selected CSV.
- readLayout/readPalette: current selected-chart projections.
- selectCsv/selectObject: runtime editor selection.
- setHeaderLines: candidate-change referenced CSV headerLines.
- setEditable: imported-chart conversion candidate.
- addObject/moveObject/setObjectValues/deleteObject: candidate-change editor.objects; empty list allowed.
- updateLayout: chart title/global/axis candidate.
- applyPalette: graph-object color candidate.
- defaultColors: immutable default color sequence copy.
- hasSelectedSlot: read current selection existence.
- importFile: FFSX or Plotly -> new target-slot-owned chart candidate.
- exportFfsx: selected graph slot snapshot -> FFSX.
- exportPlotlyJson: selected chart -> Plotly figure.

### print

- readSettings: persistent project export settings.
- setSettings: validate/commit export settings.
- save: target raster export from persistent settings; no project mutation.
- capture: one-shot current-screen export; no target-size mutation.

### captions

- readGlobal: project-global caption.
- readSlot(slotId): explicit slot-local caption.
- setEnabled: project global caption enabled flag.
- setGlobalText: project global caption text.
- setSlotText(slotId): explicit slot.caption.
- insertSlotCaptions: calculate slot-caption text and insert into global caption.
- setName/setNameBold/setSettings: project global/shared caption presentation settings.
- No persistent setSlotMode method.

### labels

- readState: persistent settings + selected-slot reference geometry.
- setEnabled/setSettings: persistent candidate mutation.
- setPosition: single authoritative x/y mutation path.
- finishPositionInteraction: runtime completion only.
- resetPosition: set persistent x/y to default origin.
- No separate preview authority or second commit.

### appearance

- readPalette: persistent palette projection.
- setPalette: normalized candidate commit.
- resetPalette: default palette commit.

### layout

- readState: persistent layout/style + visible-slot/logical geometry projection.
- setStyle: slotStyle candidate.
- setGrid: safe grid-resize candidate only.
- setZoom/commitZoom/setZoomLocked/resetZoom: runtime zoom behavior, not second persistent layout state.
- mergeSlots: one non-default slot-local payload -> anchor.
- splitSlots: anchor keeps payload; restored slots get defaults.

## Lower-layer API replacement rule

If current stale source exposes older names:

- print.readDefaults -> translate to readSettings
- captions.readState -> split readGlobal/readSlot
- captions.setSlotMode -> UI-local editor target, not domain method
- captions.setText -> split setGlobalText/setSlotText
- labels.previewPosition -> remove duplicate mutation surface
- labels.commitPosition -> finishPositionInteraction

Do not preserve old API names as new semantic authorities solely for compatibility.

## subscribeAppState

INPUT onStoreChange

1. Subscribe React external-store listener directly to appFSM revisions/transitions.
2. Do not create a second React project store.
3. Return unsubscribe.

## useProjectAssetImportCollision

1. Ask core for collision model.
2. If no user choice required, resolve plan immediately.
3. Otherwise store model + resolver only for modal lifetime.
4. On choice, call core resolveImportPlan.
5. Clear local modal state.
6. Return chooser and modal projection.
7. Never mutate project directly.

## runLifecycleTask

INPUT lifecycle, eventName, task

1. Delegate lifecycle sequencing to appFSM.run.
2. Task performs domain mutation through official commands.
3. UI may record error in telemetry.
4. UI does not invent domain rollback.
5. Return result/error projection.

## FastFigureApp

1. Read persistent appearance palette.
2. Project it to Mantine theme/CSS variables.
3. Compute display-only contrast values.
4. Render FastFigureShell under one existing React root.
5. Do not mutate project during render.

## FastFigureShell

1. Own AppShell composition and session-local navbar state.
2. Project sidebar geometry to renderer host CSS variables.
3. Request plot resize after UI geometry changes.
4. Do not duplicate project/domain state.
