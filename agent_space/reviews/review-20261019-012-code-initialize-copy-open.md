# Plan023 Unit58 — initializer input ownership (open)

Baseline5525b4966965fa113e60d97b189db930fe9ce21a records Unit57 exact88790255894de31d0b70615154b64bc76ef62643:141 inline+141 split twice39170284041/39170285994, build39170284128/canonical39170284125/cumulative39170288761/fidelity39170291679 PASS. Code110 remained stale.

## Authority and direct translation

Source45 sourcescript/backend/project_state.py:486-501 ProjectObject.initialize requires source outside-authority candidate, normalize then whole validation then one binding and previous-state return. PlusCal25 pseudocode/backend/project_state.pcal:446-460 explicitly `variables candidate = DeepCopy(source)` and `call validateProjectObjectState(candidate,TRUE);` before binding. Runtime instead normalized/validated original passed state and bound it directly, violating input ownership and permitting caller mutations to become authoritative.

sourcecode/fast-figure.js initialize now uses the corrected shared Project-copy boundary to detach source (or a ProjectObject's state), normalizes only that copy, validates requireSlots:true then binds once/returns previous. Existing before-binding failure propagates; no authority rollback, second state owner or Application candidate introduced. New142 deeply freezes normalized input with canonical extension/empty caption and checks successful detachment/previous return, mutation independence, failed geometry/empty-slot input preserving exact authority, and wrapped ProjectObject source copy with no Frontend effects. Existing141 cumulative cases retained.

## Lineage and verification

Source45/PlusCal25 unchanged; direct existing semantics, no new meaning. Code111 stale fingerprint sha256:8c2f50537c228f71c2e3a2976552cda797599fe4d71c2cb7135f28307e1ab6f5. Pair023/Plan023 record rationale. Exact142 inline/split/repeat/build/canonical+cumulative/fidelity PENDING. No local application/test/build/checker/TLC. Default GitHub-hosted only; dist generator-only.

## Explicit exclusions/decisions

Rejected direct source binding (caller retains mutable authority), validation-only shallow copy (nested aliases remain), retaining empty-slot initialize contrary to PlusCal TRUE, and broad initializer reentrancy/normalizer redesign. This unit closes input detachment, NOT global revalidation/reentrancy or constructor ownership. Canonical missing-only normalization currently still coerces values/settings and needs separate audit. Full ZIP/schema/dataRef/metadata/resources/supplied-render/raster/dashboard/timing and comprehensive requirement mapping remain open; no current/full completion claim. Atomic gh Git Data bounded code+lineage immediate-parent gate exception, expected parent/old blobs/new paths/nonforce ref checked; ordinary independent docs use Contents API, no policy change.
