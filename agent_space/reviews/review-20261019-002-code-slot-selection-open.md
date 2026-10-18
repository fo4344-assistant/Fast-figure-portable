# Unit48 — validated model-to-fsm slot selection retains independent assets

Baseline d33b53ae9b47c6a6a88a48031c3dbf8abdb5678b. Actual regression39165382849 and repetition39165426470 both failed only case127 in inline/split: `image connect cleared independent asset selection or missed target selection`. Case39 now passes after schema-valid fixture reset; all other127 pass. Build39165424314, cumulative version39165401508 and fidelity39165403530 succeeded at baseline. None proves whole semantic conformance.

## Authority and exact translation

Source frontend/interface_fsm.py SELECT_SLOT requires retaining assetSelection/path for non-null validated reference plus clear-graph-object hint; null or toggle-clear clears assets. PlusCal frontend/interface_fsm.pcal SlotSelection explicitly implements this conditional. Source application/public_api/assets.py connectProjectAssetToSlot requires independent valid asset selection preservation after reconciliation. No new meaning, hierarchy or Backend lookup is needed.

Runtime ASSET_SELECTION_EVENTS.SELECT_SLOT incorrectly cleared path and targeted none unconditionally. Correct both the action and region target using only validatedInput.reference/selectionHint; non-null clear-graph-object leaves current path and region unchanged. Null and toggle-clear still clear. Graph-object clearing, selected slot/workspace and overlay processing remain existing owners. Do not use raw direction as authority or restore a pre-command snapshot. Case127 remains unchanged and tests image/CSV link selection plus cleared graph object; case128 covers stale/failed/noncommit/late command boundaries, and existing20/37 cover ordinary slot selection/rejection.

## Checklist / limits

- [x] Identify actual runner failure and inspect code versus Source/PlusCal conditional.
- [x] Directly translate Frontend region/action only, preserving current Backend reconciliation and existing null/toggle behavior.
- [x] Source45/pseudocode24 unchanged; code99 stale, Git-blob fingerprint recomputed statically (not a local checker run).
- [ ] Exact implementation SHA:128 inline and128 split cumulative and repeat.
- [ ] Exact implementation SHA: generated distribution/build, development-layer and cumulative fidelity.
- [ ] Full Plan023 requirement audit: initializer/schema/serializer/raster resources/current snapshot/dashboard/timing and logical hierarchy coverage. Structural green statuses alone are insufficient.

No local application/test/build/checker or optional TLC execution. No policy changes. Patch20261019-003 pairs actual diff and rationale. Whole objective remains open; code99 is not current.
