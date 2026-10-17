# Code r44 — current-authority image settings translation

Baseline `399822d02baad1ca8aa04616041ba02dd4f2c47c`. Source39 remains closed/current, pseudocode13 current. Physical JavaScript hierarchy is flattened only; logical ownership is unchanged. This is a bounded implementation unit, not whole-goal completion.

## Prompt-to-artifact / semantic audit

| Requirement | Inspected evidence |
|---|---|
| Direct pseudocode translation | `pseudocode/backend/project_efsm.pcal:NormalizeImageEditsInAttempt` and the SLOT_IMAGE_SETTINGS_CHANGED branch; `pseudocode/application/public_api/layout_annotations.pcal:applyImageSettingsFromValues`; corresponding Source procedure inspected before edits |
| Current authority owns candidate | Backend clones current Project, resolves the explicit visible slot and its image in that candidate, merges only declared edits into current slot-local image settings, then whole-validates and initializes once |
| Exact numeric branches | Fit accepts contain/cover/manual only. Only manual mode consumes supplied scale/x/y. Finite conversion results are clamped using Backend JSON limits, valid zero is not replaced by a truthiness default, missing/invalid/non-finite numbers preserve current fields |
| Failure and unknown fields | Missing/hidden/string-coerced identities reject without commit. Unknown keys are not copied. Reading an edit getter can throw before commit; scalar conversion failure is the invalid-value branch, not a replacement default |
| Application boundary | Internal procedure takes explicit slotId and values, performs eligibility query only, submits new values rather than a full settings snapshot, gates rendering/notification/fresh query on committed, and reads back the same explicit slot rather than a possibly different Frontend selection |
| Public selected-slot binding | Existing images.setSettings(values) captures the selected scalar once and calls the explicit Application procedure; no new overload or public API is introduced |
| Renderer boundary | Existing syncSlotImageElement still consumes only a supplied immutable projection; no Backend read or reverse mutation is introduced there |
| Tests | Existing case39 retained. Case49 covers zero, invalid/omitted fields, non-manual ignored edits, unknown keys, command-time current changes, explicit target independent of selection, immutable old reads, throwing getter, identity rejection and uncommitted no-success-read/no-render |
| Records / lineage | Code44 stale with current Source39/pseudocode13 fingerprints; implementation, metadata, this review, plan and patch013 pair commit together |

Invalid edit conversion is explicitly a try-conversion with validity output in pseudocode. It must not reuse `Number(value) || fallback`, which both destroys valid zero and replaces invalid values instead of preserving current state. An edit property's own getter is read before conversion; its exception propagates, preserving the command failure boundary. No Source change is needed because these decisions already exist in the active upper layers.

## Decisions / rejected alternatives

Rejected carrying forward the old full-object spread: it accepts undeclared settings and changes manual numbers even in contain/cover mode. Rejected converting slot IDs with Number: requested identities must resolve as declared, not silently become another identity. Rejected deriving the successful read target from current selection: the explicit operation may legitimately target a different slot. Rejected adding a new config or selection authority; the existing Backend limits and Frontend selected scalar suffice.

## Verification

PENDING at initial implementation record. No local application, Source, PlusCal, parser, checker, test, build or TLC execution. Actions must verify inline/split cases1–49, layer fingerprint and distribution packaging. Diff checks and isolated-index reverse patch checks are file integrity evidence only.

## Whole-goal audit / remaining work

Concrete goal: implement current pseudocode algorithms, inputs/results/failures/current-authority commits, preserve logical owners and sole config authority despite flattened files, and complete immutable supplied-projection rendering/export/resource lifetime and integration with real evidence.

This unit covers image settings command/application only. It does not complete image import/export geometry, canonical Project loading/normalization, graph/asset candidates, positional cascade reconciliation, full lifecycle/public API parity, renderer/export projection cutover or legacy cleanup. The broader renderer and adapter still contain Backend-reading legacy paths. Passing case49 or structural coverage inventories cannot establish those requirements. Code44 remains stale and the active goal remains incomplete.
