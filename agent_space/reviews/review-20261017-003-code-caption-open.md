# Caption insertion implementation r37 — partial implementation, OPEN

Baseline `324e749494c5eaad97fbd71aa22401eb3a88e529`. Source r38 closed and pseudocode r12 current remain unchanged. This unit implements their caption aggregation path, not full Plan016/023 or all Source contracts.

## Mapping / actual ownership

- `sourcescript/backend/layout_annotations.py` and `pseudocode/backend/layout_annotations.pcal` → `fast-figure.js` `orderedSlotLabels(project)` / `insertSlotCaptions(project, slotIds = null)`. Pure candidate-scoped reads, numbering every visible anchor before selection, exact strings, empty runs, no renumbering of filtered targets, U+0020 append boundary. Existing identifier formatters and sort logic support the canonical Project argument without reading Frontend state.
- `SLOT_CAPTIONS_INSERTED` → `applySlotCaptionsInsertedAction`: clone current Backend state, calculate inside command, validate whole candidate, initialize once. No selected-slot authority or snapshot input. No targets returns false before replacement. `ProjectStateMachine.send` now respects an action's explicit false outcome; other existing actions' undefined success still commits as before. Application reconciles only committed results.
- Public `captions.insertSlotCaptions` → `insertCaptionsApiSlotCaptions`: identity input only, committed gate, fresh official `captions.readGlobal` query, supplied-input renderer sync, returned immutable global/settings copies. No direct Backend registry/read or UI grouping in this wrapper.
- `captions.readGlobal` → Backend query; read does not mutate or share writable settings. Other caption setters and renderer/default-argument paths still need their own coherent cutover; do not claim full annotation separation.

## Verification surface

Regression41 covers identical/empty trailing runs, initial all-empty labels, subset gaps/order/dedup, no input mutation, exact leading whitespace, newline versus single-space boundary, alternate numbering/order, labels-disabled insertion, actual public success/query snapshot, empty target no commit/no reconciliation, invalid target failure preservation, and narrow Application direct-access absence. Existing40 tests plus41 must pass in both inline/split Actions. No local application, Source, pseudocode, checker, test, build or TLC execution. Hash computation and Git diff checks are byte/file operations only.

## Decisions / exclusions

Implement the already specified group algorithm; do not invent deduplication history, a caption preview store, or an Application candidate. Use explicit false action result rather than caller-supplied commit flags. Preserve old text verbatim rather than trim/replace. Keep code stale with current upper lineage because config, other commands, public APIs and renderer/export integration are not complete. Optional model r26 is not updated or represented as checked against r38.

The user-authorized temporary draft cleanup succeeded before this unit; downloaded verification evidence remains. Subsequent temporary-file cleanup will happen once at work end, not between steps. No unrelated cleanup.

## Execution record

Implementation and actual patch009 committed together at `037bde373bc4daf71c8c099b5e9f73619ab228a2`.

- Regression [39050782351](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/39050782351): SUCCESS at that source/test commit; cases1–41 passed for both inline and split. Case41 appears as pass in both result tables. This verifies the bounded surface above, not whole Source conformance.
- Version [39050782459](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/39050782459): SUCCESS at the same commit; actual code r37 stale fingerprint `sha256:401bb47775c314b4dcc399c14b69df3da1e32053143677cab32ac832997d2c8c`, Source r38 closed / pseudocode r12 current.
- Build [39050782403](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/39050782403): SUCCESS, generated distribution bot commit `45b180379e116fe4e7493c6445698edf528a94fc` (only dist inline HTML/split ZIP). Bot-generated outputs are a separate actual commit, not falsely included in patch009's source commit.
- Git diff/patch reverse-check passed as file operations, not local runtime execution. The subsequent result-record commit changes documents only and is not the commit executed by these runs.

Caption insertion ownership unit is verified; full Plan016/023 implementation remains OPEN and source-code remains stale. Next: remaining annotation/default-config and export geometry ownership, then graph/assets/current-candidate, selection, renderer/API cutover and integration. No new Source meaning was invented in this unit.
