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

At851b6bf16868c8f54618b57399dba48ac4b38d13 build39122365729 PASS; regression39122365722 prior86+new88 PASS both distributions,87 fails `Error: image reset deleted asset/defaults/selection`. The failing assertion read nonexistent legacy flat slot.imageSettings while authority is slot.content.imageSettings; first exact-Project/default check already passed. Correct test path only, keep all assertions/runtime/upper contracts unchanged. Version39122365808 expected provisional failure printed canonical code73 sha256:858aa0479d23d336d52d73e76f644ba483ff572b06a22b0b411544d270185ee0; record runner digest, not local hash. Source41/pseudocode18 unchanged. Dist-only bot5caaa77 inspected/fast-forwarded. At corrected lineage d5c13e2846e9ec1a0dac8e94413d72ed2d5bd991 regression39122432590 PASS88 inline+88 split (176 explicit pass records/no failures, inline6426457 bytes/split ZIP1735033 bytes). Cumulative39122433005 PASS with BASE_SHA b5a08902523a1c069022f23421815ad2345ea056 and canonical Source41/pseudocode18/code73 digests. git diff851b6bf..d5c13e2 sourcecode/scripts/sourcescript/pseudocode empty: build39122365729 covers identical runtime/build inputs. Failing initial diagnostic remains failed, not retrospectively passed. No local test/build/checker executed.

## Bounded completion audit

Actual Source/pseudocode branch, command/wrapper and new test assertions inspected: explicit visible target IDs; Backend configuration copied into only local payload; caption and both references cleared; owned chart removed while CSV/image assets, target geometry and other slots persist; one successful commit after current-reference retry; immutable changed IDs; invalid/hidden/validator/noncommit no success work; late rendering failure preserves completed commit. Application no direct persistent calculation, selected-slot substitution, asset-selection clear or swallowed error. Both new cases and prior86 pass on corrected commit. This is bounded unit29 only, not full Plan023 closure: full shared schema, other asset/slot commands, canonical imports/raster/supplied dashboard and earlier unproven UI timing stability remain open. Code73 stale and optional TLC not claimed.
