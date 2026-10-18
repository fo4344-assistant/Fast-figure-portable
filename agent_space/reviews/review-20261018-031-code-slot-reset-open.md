# Slot reset current-authority translation (unit29)

## Authority and scope

Source41 backend/project_efsm.py SLOTS_RESET and application/public_api/layout_annotations.py resetSlotApi, followed by pseudocode18 backend/project_efsm.pcal SLOTS_RESET, already require explicit visible IDs, config SLOT_LOCAL_DEFAULTS payload reset plus owned chart removal in one candidate. Source remains highest; no new meaning or upstream edits. Code73 directly translates source capture, candidate-only changes/whole validation, authority-reference recheck/retry, single initialize and actual changed facts. Application sends slotIds only, renders only committed success, returns None and preserves original errors. Unconditional CLEAR_ASSET_SELECTION/status removed: normal reconciliation alone owns runtime selection.

## Requirement-to-artifact checklist

- Explicit target, no selected-slot substitution; missing/noninteger/hidden rejects: applySlotsResetAction, cases87/88.
- Configured contentType/imageSettings, chart/image ref null, caption null, placements/other slots preserved: command, case87 exact Project comparison.
- Owned chart removed; CSV/image assets/settings elsewhere preserved: command, case87 actual changed facts and separate image slot reset.
- Candidate validates before commit, stale authority retries current source; original errors/noncommit have no success work: case88 validator/current-source instrumentation.
- Application new fields only, None, committed-only render, normal reconciliation/no selection clearing: resetSlotApi, cases87/88.
- Postcommit render error propagates without rollback: case88.
- Source41/pseudocode18 unchanged; code73 stale. Whole integration/full graph schema/other commands/import/raster/dashboard remain open.

## Execution evidence

At851b6bf16868c8f54618b57399dba48ac4b38d13 build39122365729 PASS; regression39122365722 prior86+new88 PASS both distributions,87 fails `Error: image reset deleted asset/defaults/selection`. The failing assertion read nonexistent legacy flat slot.imageSettings while authority is slot.content.imageSettings; first exact-Project/default check already passed. Correct test path only, keep all assertions/runtime/upper contracts unchanged. Version39122365808 expected provisional failure printed canonical code73 sha256:858aa0479d23d336d52d73e76f644ba483ff572b06a22b0b411544d270185ee0; record runner digest, not local hash. Source41/pseudocode18 unchanged. Dist-only bot5caaa77 inspected/fast-forwarded. Corrected regression/cumulative gate pending, no claim of passed failing diagnostic. No local test/build/checker executed.
