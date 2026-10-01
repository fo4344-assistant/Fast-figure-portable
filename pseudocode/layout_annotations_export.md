# layout_annotations_export

## Source identifiers

- `layoutRules`: layout field ranges.
- `imageSettings`: slot-local image display settings.
- `labelSettings`: persistent label configuration.
- `captionSettings`: project/shared caption presentation settings.
- `EXPORT_LIMITS`: logical/raster size, DPI and format limits.
- `SLOT_OPERATION_CAPTION_RULES`: caption behavior for swap/merge/split/reset/FFSX.
- `CAPTION_OPERATION_RULE`: slot caption follows slot-local ownership.
- `SLOT_CAPTION_UI_RULE`: slot caption editor/insertion is UI/command behavior, not a second owner.
- `GRID_RESIZE_RULE`: no implicit reflow; preserve/reject semantics.
- `LABEL_POSITION_RULE`: one authoritative x/y path.
- `EXPORT_SETTINGS_RULE`: persistent export inputs vs transient geometry.

## Rules

SLOT_OPERATION_CAPTION_RULES

- swap: caption and imageSettings move with the complete slot-local payload.
- merge: at most one selected slot may have non-default local state; move that whole payload to anchor.
- split: anchor keeps its local payload; restored cells start with defaults.
- reset: reset complete slot-local payload.
- FFSX: slot-local caption belongs to the slot package.

GRID_RESIZE_RULE

- resize is not reflow.
- expansion preserves existing geometry/local state and adds default cells.
- shrink rejects any removed/intersected slot with non-default local state or merged span.

LABEL_POSITION_RULE

- one persistent x/y authority.
- drag updates use the same mutation path.
- no preview copy + second commit.

EXPORT_SETTINGS_RULE

- persistent: width, heightMode/height, dpi, format.
- transient: computed geometry, callbacks, DOM bounds, generated blob.

## dashboardGeometry

INPUT width, heightOverride

1. scale = width / referenceWidth.
2. naturalHeight = width / aspect.
3. height = valid override else naturalHeight.
4. outerMargin = minimum(configuredMargin * scale, 49% of smaller dimension).
5. gap = configuredGap * scale.
6. radius = configuredRadius * scale.
7. Return geometry.

## gridSlotGeometry

INPUT layout, dashboard geometry, slot

1. colWidth = usable width after margins/gaps divided by gridCols.
2. rowHeight = usable height after margins/gaps divided by gridRows.
3. For spans, include internal gaps in slot width/height.
4. Return slot geometry.

## buildGridResizeCandidate

INPUT rows, cols

1. Require integer range 1..8.
2. Copy current layout/slots into candidate.
3. If expanding:
   preserve every existing slot placement and local payload;
   add only new 1x1 slots using SLOT_LOCAL_DEFAULTS.
4. If shrinking:
   for every slot touching removed row/column:
   a. reject if slotHasNonDefaultLocalState.
   b. reject if merged span crosses/remains in removed area.
5. Remove only default empty 1x1 cells.
6. Do not pack/reflow content.
7. Validate remaining geometry/chart ownership.
8. Return candidate or rejected reason.

## setLayoutApiGrid

INPUT rows, cols

1. Build resize candidate.
2. If rejected, preserve project and selectedSlotId.
3. Validate whole project.
4. Commit candidate once.
5. Keep selectedSlotId if referenced slot still exists, otherwise clear it.
6. Return result.

## mergeSlots

INPUT slotIds

1. Resolve selected visible slots.
2. Require their union to be one gap-free rectangle.
3. Count slots with non-default local state.
4. If more than one, reject without mutation.
5. Choose top-left anchor.
6. If one payload source exists, move its chart/image/contentType/imageSettings/caption as one payload to anchor.
7. Preserve chart id and update unique owning slot to anchor.
8. Set covered non-anchor local state to SLOT_LOCAL_DEFAULTS and hidden=true.
9. Set anchor rowSpan/colSpan to rectangle size.
10. Validate whole project.
11. Commit once.

## splitSlots

INPUT slotIds

1. Resolve merged visible anchor.
2. Keep complete anchor local payload at anchor.
3. Set anchor span back to 1x1.
4. Restore covered cells as visible 1x1 slots with SLOT_LOCAL_DEFAULTS.
5. Validate whole project.
6. Commit once.

## readImageEditorApi

1. Resolve selected slot.
2. Resolve slot.imageId to image asset.
3. Return asset identity/display URL plus selected slot.imageSettings.
4. Do not mutate.

## applyImageSettingsFromValues

INPUT values

1. Resolve selected slot.
2. Normalize fit/scale/x/y ranges.
3. Build slot-local imageSettings candidate only.
4. Validate.
5. Commit selected slot.
6. Reproject image and notify.
7. Do not change other slots referencing the same image asset.

## readLabelsApiState

1. Read persistent label settings.
2. Compute current selected-slot reference geometry.
3. Return settings + reference projection.

## setLabelsApiPosition

INPUT x, y

1. Normalize finite values.
2. Candidate-change the single persistent label x/y.
3. Commit through the same path for click/drag updates.
4. Reproject renderer from authority.
5. Return label state.

## finishLabelsApiPositionInteraction

1. Do not change persistent x/y.
2. Emit only interaction completion telemetry/focus/history behavior if needed.
3. Return completion result.

## readGlobalCaptionState

1. Read project-level global caption properties.
2. Do not inspect selected slot or UI editor target.
3. Return projection.

## readSlotCaptionState

INPUT slotId

1. Resolve slot.
2. Return id/position/caption projection.
3. UI may show placeholder when caption empty, but placeholder is not stored.

## setGlobalCaptionText

INPUT text

1. Candidate-change project global caption text.
2. Leave all slot captions unchanged.
3. Commit and return global caption state.

## setSlotCaptionText

INPUT slotId, text

1. Resolve slot.
2. Candidate-change only slot.caption.
3. Validate and commit.
4. Return slot caption state.

## insertSlotCaptionsIntoGlobalCaption

INPUT slotIds or current visible slots

1. Resolve slots in layout order.
2. Read non-empty slot captions.
3. Build label/text insertion projection.
4. Candidate-append/insert text into project-global caption.
5. Leave source slot captions unchanged.
6. Commit and return global caption state.

## readExportSettings

Return current persistent export settings without mutation.

## setExportSettings

INPUT values

1. Copy current export settings.
2. Normalize width 100..20000.
3. Normalize dpi 36..1200.
4. Require format png or jpeg.
5. If heightMode=auto, explicit height is not used for target geometry.
6. If heightMode=explicit, require height 100..20000.
7. Validate candidate.
8. Commit once and return settings.

## createTargetExportSnapshot

1. Snapshot persistent layout, labels, captions, image/chart/slot state, appearance needed by renderer, and export settings.
2. Compute no persistent mutations.
3. Treat snapshot as immutable for this export only.
4. Do not use current DOM dimensions as saved target figure authority.
5. Return snapshot.

## exportDashboardTarget

INPUT statusSink

1. Create export snapshot.
2. Read persistent width/heightMode/dpi/format.
3. If auto height, calculate from logical dashboard/caption layout.
4. If explicit, use stored height.
5. Reject raster dimensions > configured side/area limits.
6. Validate grid geometry.
7. Render each visible chart/image to target geometry.
8. Transform labels and captions using same logical reference geometry.
9. Encode PNG/JPEG and apply DPI metadata.
10. Trigger output download/status projection.
11. Do not mutate project.
12. Return outcome.

## captureDashboardCurrent

INPUT statusSink

1. Read current rendered viewport geometry as one-shot capture size.
2. May use persistent dpi/format as encoding defaults.
3. Do not modify persistent target width/height.
4. Encode/download result.
5. Return outcome.
