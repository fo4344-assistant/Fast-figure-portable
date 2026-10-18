# Unit30 slot swap translation

## Source authority and fidelity

Source41 sourcescript/backend/project_efsm.py SLOTS_SWAPPED explicitly requires missing/hidden/same-ID uncommitted; full slot-local payload swap, geometry/identity unchanged, common selection reconciliation. sourcescript/application/public_api/layout_annotations.py swapSlots returns result.committed. Source already closes meaning, remains unchanged. Pseudocode18 required-slot lookup could throw for missing/hidden despite Source no-op. Pseudocode19 first makes optional lookup + explicit missing/hidden/equal uncommitted gate; rest of direct candidate algorithm preserved. Code74 then follows this and current-authority retry. No lower-level independent authority/new domain semantics.

## Requirement-to-artifact checklist

- Invalid/missing/hidden/equal returns False, no Project/runtime/render/commit: applySlotsSwappedAction/swapSlots and90.
- Current authority capture; complete content/caption swap without geometry/identity/model/asset changes: candidate clone, local payload exchange,89 exact Project comparison including extension and config image settings.
- Candidate whole validates before identity check/retry and one commit:90 injected validator error/newer caption+projectName authority.
- Actual changed slot IDs only and immutable swapSlotIds hint, no forced asset/graph clear: command,89 facts and selected slot/chart-object follows payload while selected CSV unchanged.
- Application scalar IDs, committed Boolean/render only committed, original errors, late renderer error no rollback: swapSlots public binding and89/90. Legacy drag adapter now passes IDs to same wrapper rather than independent mutation path.
- Prior89 cases plus actual Actions canonical chain/build gate pending. Source41 unchanged, pseudocode19 current pending measured fingerprint; code74 stale/whole Plan023 open.

## Evidence and exclusions

Pending actual Actions default runner regression90+90/build/canonical digest/cumulative gate. No local runtime/checker/build. Full shared validators/imports/asset cascade/raster/supplied dashboard and earlier timing stability remain uncovered. Optional model26 stale/TLC not run; policy unchanged.
