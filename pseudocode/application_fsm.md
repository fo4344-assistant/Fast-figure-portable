# application_fsm

## Runtime state

appState stores:

- lifecycle
- workspace
- overlay
- assetSelection + assetPath
- graphObject + graphObjectIndex
- direction
- revision
- error

It does not store persistent project duplicates.

## Candidate mutation contract

For every persistent mutation:

1. Resolve current authoritative input and id/path references.
2. Check writable scope and command preconditions.
3. Build candidate state or candidate patch before changing authority.
4. Validate local rules, cross-references, and whole-project invariants as required.
5. On validation failure, leave authoritative state unchanged.
6. On success, commit authoritative state once.
7. Reconcile derived runtime selection against committed project.
8. Notify/render by rereading committed authority.

## ApplicationStateMachine.send

INPUT event, payload

1. Iterate regions in REGION_ORDER.
2. In each region, find handler for event.
3. If handler has action, execute action.
4. If handler has target state, execute transition.
5. If multiple regions own the event, process each in order with the same payload.
6. If no region handles it, do not mutate domain state; debug warning is allowed.
7. Return current FSM state.

## transition

INPUT region, target, event, payload

1. If target equals current state and no reentry is requested, run update behavior only.
2. Otherwise run exit, set target state, then entry behavior.
3. During model-to-FSM hydration, prevent the hydrated UI path from writing the same model back.
4. Publish resulting FSM state to frontend subscribers.
5. Return state.

## notify

INPUT objectName, event, payload

1. Do not mutate project state.
2. Set direction to model-to-ui and advance revision.
3. If current workspace/overlay subscribes to objectName, invoke its projection update.
4. Ignore notification during booting or incompatible transition.
5. Return state.

## run

INPUT lifecycle, event, task

1. Require current lifecycle ready.
2. Transition into requested lifecycle.
3. Run sync or async task.
4. On success, return to ready and return task result.
5. On failure, record error, pass through error lifecycle, then return to ready.
6. Domain rollback is not invented here; task mutations follow their own candidate contract.

## applySlotSelectionAction

INPUT payload

1. Resolve payload slot in current project.
2. Apply UI toggle semantics: selecting the currently selected slot may clear selection.
3. Revalidate or clear graph-object runtime selection.
4. Derive workspace from selection and slot contentType.
5. Resolve selected chart on demand; do not store global editing pointer.
6. Return selection result.

## applyProjectLoadedAction

INPUT fully validated ProjectObject candidate

1. Check required write scopes.
2. Validate candidate outside authority.
3. If invalid, keep current project.
4. If valid, replace activeProject once through ProjectObject.initialize.
5. Clear/re-resolve runtime selections against new project.
6. Release old project display resources after commit.
7. Reproject renderer/UI from new authority.
8. Do not use renderer projection failure as a generic domain rollback.
9. Return activeProject.

## applyProjectNodeMovedAction

INPUT move payload

1. Resolve source and destination in current VFS.
2. Reject fixed-directory move, collision, and recursive directory move before commit.
3. Build candidate directory/asset movement.
4. If entering trash, collect and detach affected references in same candidate.
5. Validate VFS/reference invariants.
6. Commit once.
7. Clear runtime selection only when its object no longer exists.
8. Return final path.

## applyGraphObjectsReplacedAction

INPUT chartId + object list

1. Resolve chart.
2. Normalize candidate object list and validate CSV/column references.
3. Permit empty object list.
4. Rebuild editable graph projection on chart candidate.
5. Validate chart ownership and project candidate.
6. Commit chart once.
7. Clear graphObjectIndex if it is out of range.
8. Do not create fake object/default CSV.
9. Return chart.

## applySlotsResetAction

INPUT slotIds

1. Resolve all slots.
2. For each slot, replace all slot-local properties with SLOT_LOCAL_DEFAULTS.
3. Remove charts uniquely owned by reset slots.
4. Preserve layout geometry/span/hidden unless the command separately changes layout.
5. Validate whole project.
6. Commit once.
7. Reconcile graph-object selection.
8. Return result.

## applySlotsSwappedAction

INPUT sourceId, targetId

1. Resolve both visible slots.
2. Keep each GUI placement geometry fixed.
3. Exchange complete slot-local payload:
   chart, imageId, contentType, imageSettings, caption.
4. Validate chart ownership after exchange.
5. Commit once.
6. Return result.

## applyCaptionTextAction

INPUT explicit target, text

1. If target is global, candidate-change project global caption text.
2. If target is a slot id, resolve the slot and candidate-change slot.caption.
3. Do not inspect persistent slotMode.
4. Validate owner exists.
5. Commit exactly one caption owner.
6. Return result.

## applySlotCaptionsInsertedAction

INPUT slotIds or default visible slot set

1. Resolve slots.
2. Read non-empty slot.caption values in layout/label order.
3. Build insertion text projection.
4. Candidate-change only project global caption text.
5. Leave source slot captions unchanged.
6. Commit and return result.

## applyGridLayoutAction

INPUT rows, cols

1. Call buildGridResizeCandidate.
2. If resize is unsafe or needs implicit reflow, reject without mutation.
3. Validate successful whole-project candidate.
4. Commit once.
5. Return layout result.
