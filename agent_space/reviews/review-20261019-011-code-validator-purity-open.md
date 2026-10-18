# Plan023 Unit57 — read-only whole Project validation (open)

## Baseline and authority

Baseline0cccc54e550f2e2bf9a12f74128e3ac7afd21cd4 Unit56 verified139 inline+139 split twice:39169801771/39169803421; build39169805349/cumulative39169807394/fidelity39169809354 PASS. Source45 sourcescript/backend/project_state.py:578-613 validateProjectObjectState returns identical state and explicitly changes nothing; canonical slot references and image settings schema/ranges are checked, not repaired. PlusCal25 pseudocode/backend/project_state.pcal:354-389 SlotsGeometryReferencesAndLocalDisplay likewise only Require/read then result:=state. No upper semantics change needed.

## Direct translation and evidence checklist

- sourcecode/fast-figure.js validateProjectObjectState previously called normalizeSlotContents(state.slots), installed compatibility aliases, replaced content and coerced/clamped image settings; it then replaced imageSettings again. Consequently validator accepted malformed slots and mutated even valid supplied authority.
- Remove both writes; inspect canonical slot.content directly, require record/content kind/null-or-resolved IDs and typed finite image scale1..1000/x,y-100..200/fit contain|cover|manual. No duplicate settings sanitizer or second state introduced. Existing normalization still occurs at separate construction/candidate boundaries.
- New browser-regression140 validates deeply frozen canonical Project with no aliases and requires identical returned state/content/settings; malformed kind/reference/missing content/image ID/settings and nonfinite/string/out-of-range display fields must throw without mutation. Live Project/Frontend identity unchanged. Existing139 tests remain cumulative.
- Code109 fingerprint sha256:cba2f5bddc75b11409a7c1d6d9389e641af66727e8d00d7a7602990957b58dd0; stale until whole audit; Source45/PlusCal25 unchanged, optional model/TLC stale/pending.
- Exact execution SHA140 inline/split/repeat/build/canonical+cumulative/fidelity PENDING. No local application/test/build/checker execution. Standard GitHub-hosted only.

## Decisions and remaining gaps

Rejected cloning inside validator: it conceals mutation rather than enforcing pure validation, costs extra ownership and still sanitizes invalid data. Rejected retaining aliases as validation authority: canonical content owns state and pure frozen input requires no compatibility descriptors. Rejected broad normalization/initializer rewrite in this unit: initializer currently normalizes passed input and has separate revalidation/reentrancy questions, which remain OPEN. Pure validator alone is not initializer closure. Remaining normalizer missing-only/canonical precedence semantics, full ZIP/schema/dataRef/metadata, supplied-state render/raster/resource/dashboard/timing and exhaustive requirement-to-artifact audit remain OPEN. All passing subset gates do not mark Source Code current or goal complete.

## Delivery

Pair20261019-020 records runtime/test/lineage/plan/preceding evidence. Atomic gh Git Data exception remains bounded to coherent code+lineage immediate-parent checker requirements, expected HEAD/old blobs/new paths/nonforce ref checked; ordinary independent docs use Contents API. No policy weakening, dist editing or local runtime/checker/TLC execution.
