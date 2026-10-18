# Slot reset current-authority translation (unit29)

## Authority and scope

Source41 backend/project_efsm.py SLOTS_RESET and application/public_api/layout.py resetSlot, followed by pseudocode18 backend/project_efsm.pcal SLOTS_RESET, already require explicit visible IDs, config SLOT_LOCAL_DEFAULTS payload reset plus owned chart removal in one candidate. Source remains highest; no new meaning or upstream edits. Code73 directly translates source capture, candidate-only changes/whole validation, authority-reference recheck/retry, single initialize and actual changed facts. Application sends slotIds only, renders only committed success, returns None and preserves original errors. Unconditional CLEAR_ASSET_SELECTION/status removed: normal reconciliation alone owns runtime selection.

## Requirement-to-artifact checklist

- Explicit target, no selected-slot substitution; missing/noninteger/hidden rejects: applySlotsResetAction, cases87/88.
- Configured contentType/imageSettings, chart/image ref null, caption null, placements/other slots preserved: command, case87 exact Project comparison.
- Owned chart removed; CSV/image assets/settings elsewhere preserved: command, case87 actual changed facts and separate image slot reset.
- Candidate validates before commit, stale authority retries current source; original errors/noncommit have no success work: case88 validator/current-source instrumentation.
- Application new fields only, None, committed-only render, normal reconciliation/no selection clearing: resetSlotApi, cases87/88.
- Postcommit render error propagates without rollback: case88.
- Source41/pseudocode18 unchanged; code73 stale. Whole integration/full graph schema/other commands/import/raster/dashboard remain open.

## Execution evidence

Pending actual GitHub Actions default-runner regression88+88/build/canonical digest and cumulative lineage gate. No local test/build/checker executed. Prior code72 digest provisional until runner diagnostics; no claim of passed version gate.
