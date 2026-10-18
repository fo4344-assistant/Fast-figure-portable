# Unit30 slot swap translation

## Source authority and fidelity

Source41 sourcescript/backend/project_efsm.py SLOTS_SWAPPED explicitly requires missing/hidden/same-ID uncommitted; full slot-local payload swap, geometry/identity unchanged, common selection reconciliation. sourcescript/application/public_api/layout_annotations.py swapSlots returns result.committed. Source already closes meaning, remains unchanged. Pseudocode18 required-slot lookup could throw for missing/hidden despite Source no-op. Pseudocode19 first makes optional lookup + explicit missing/hidden/equal uncommitted gate; rest of direct candidate algorithm preserved. Code74 then follows this and current-authority retry. No lower-level independent authority/new domain semantics.

## Requirement-to-artifact checklist

- Invalid/missing/hidden/equal returns False, no Project/runtime/render/commit: applySlotsSwappedAction/swapSlots and90.
- Current authority capture; complete content/caption swap without geometry/identity/model/asset changes: candidate clone, local payload exchange,89 exact Project comparison including extension and config image settings.
- Candidate whole validates before identity check/retry and one commit:90 injected validator error/newer caption+projectName authority.
- Actual changed slot IDs only and immutable swapSlotIds hint, no forced asset/graph clear: command,89 facts and selected slot/chart-object follows payload while selected CSV unchanged.
- Application scalar IDs, committed Boolean/render only committed, original errors, late renderer error no rollback: swapSlots public binding and89/90. Legacy drag adapter now passes IDs to same wrapper rather than independent mutation path.
- Prior88 cases plus actual Actions canonical chain/build gate pending. Source41 unchanged, pseudocode19 current pending measured fingerprint; code74 stale/whole Plan023 open.

## Additional direct-coverage audit

Before declaring bounded success, inspection found JSON-backed projectClone invokes legacy slot.toJSON, which flattens known fields and loses content extension fields; exact JSON comparison loses the same extension and is insufficient evidence. Code75 preserves each canonical slot.content explicitly inside the private candidate before swapping; case89 now directly asserts final content.extension at moved payload rather than relying on flattening JSON. This is existing Source complete-local-payload fidelity, not new higher meaning. Code76 additionally compares canonical [content,caption] for actual changed IDs;89 now directly covers extension-only swapping with equal ordinary fields and requires both IDs. Wider legacy serializer/query extension handling remains separate/open.

## Final runtime evidence pending corrected-lineage repeat

Code74 at38e3897 cumulative39122736914 PASS/regr39122736347 PASS90+90, but subsequent direct coverage audit found extension gap; those greens are not code76 completion evidence. Code75 regression39122784042 PASS/build39122784004 PASS are historical only. Final code76 at2d24f6a6407627ad320dfd1683279c0f7f062f30 regression39122819377 PASS90 inline+90 split including strengthened89/90, build39122819380 PASS. Diagnostic39122819349 prints actual code76 sha256:80e62260dd83d5223adfd16a650fb0fb7e27a2ad05917af31f8ab3d9f78aa259; correct metadata from runner only. Source41/pseudocode19 canonical unchanged. Dist-only bot737a731 inspected/fast-forwarded; push had earlier rejected safely on another dist-only botcb59fb4, unpublished commit replayed over it without force. Corrected-lineage cumulative gate/repeat pending; whole code stale.

## Evidence and exclusions

At f3ea2df83fff8ce11b41cd1230bb811bfa335f51 build39122647836 PASS. Regression39122647755 prior88+90 PASS both distributions;89 `Error: swap cleared selections instead of following payload`. Its direct interfaceFSM.send bypassed Backend validation and was correctly ignored, so index0 was never established. Correct setup through existing appFSM.send validated boundary and explicitly assert fixture index0 before operation; no runtime/upper/test expectation weakening. Version39122647746 diagnostic FAIL printed canonical pseudocode19 sha256:833d5e1bb3a10b68d16d0a31048f67f34549a211c90c2600d7577787f178f777 and code74 sha256:7b9a5b6cbd0a25fe42af228dce57bbe2b0005a206742c101bdead2d1cb18a19a; Source41 unchanged. Record these actual runner digests, corrected cumulative gate/repeat pending; initial failures not claimed passed. No local runtime/checker/build. Full shared validators/imports/asset cascade/raster/supplied dashboard and earlier timing stability remain uncovered. Optional model26 stale/TLC not run; policy unchanged.
