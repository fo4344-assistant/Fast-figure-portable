# Plan 023 — Implement the closed Source r38 / pseudocode r12 boundaries

## Scope and order

Resume Plan016 implementation after completed Plan022 translation. Source/pseudocode remain the semantic authority; optional model/TLC is not an implementation gate. Preserve the existing functional surface while converging Backend candidate/query, Application public adaptation and supplied-input Frontend rendering. This is not a new architecture or another Source design pass.

Implement coherent ownership units: caption insertion and official reads first; then remaining annotation/config and export geometry, graph/asset command/current-candidate contracts, selection/result reconciliation, renderer/API direct-read cutover, and full integration. Reopen Source first only if an actual new meaning is necessary. Keep source-code stale until the whole alignment is complete. Do not substitute a green regression subset for whole conformance.

## First implementation unit

Baseline `324e749494c5eaad97fbd71aa22401eb3a88e529`.

- Backend `orderedSlotLabels` / `insertSlotCaptions` implement the actual procedures in `pseudocode/backend/layout_annotations.pcal`: all visible anchors numbered before filtering, exact equality/empty consecutive runs, initial empty labels, ordinal gaps, single U+0020 separator, append existing global text without trimming.
- `SLOT_CAPTIONS_INSERTED` constructs/validates/commits its candidate internally. Empty target is genuinely uncommitted and does not reconcile Frontend success. Invalid/hidden target rejects without mutation.
- Application passes identities only, gates postcommit work, and returns a fresh immutable `captions.readGlobal` official query; the narrow renderer consumes that result. No UI-owned aggregation or snapshot-to-command input.
- Browser regression case41 covers the algorithm and actual public command/query/no-op/failure boundaries, in both inline/split distributions via Actions. Existing40 cases remain required.

## Verification and records

Actual changed files, numeric patch009 and explanation commit together. Update source-code revision/fingerprint/current Source+PlusCal lineage but remain stale. Record results in `agent_space/reviews/review-20261017-003-code-caption-open.md`. Application/test/build/checker execution stays in authorized GitHub Actions, never local. Other annotation wrappers, whole config plumbing, export, graph/assets and renderer cutover remain explicitly outside this bounded unit.

## Temporary-file rule

The user explicitly authorized this cleanup: removed only `.work/plan022/pseudocode/`, `.work/plan022/fidelity-checklist.md` and `.work/plan022/inter-module-notes.md`; the downloaded verification artifact and regular repository files remain. The earlier denied deletion did not run; this later authorized deletion did. For subsequent work collect temporary files and clean once after the work finishes, not between steps. Do not remove verification evidence or unrelated files.
