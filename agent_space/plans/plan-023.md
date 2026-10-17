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

## First-unit results

Source/test+patch009 commit `037bde373bc4daf71c8c099b5e9f73619ab228a2`: Actions regression39050782351 passed41 inline +41 split; version39050782459 passed; build39050782403 passed and produced dist-only bot commit `45b180379e116fe4e7493c6445698edf528a94fc`. Actual logs/fingerprint/limits are in the linked review. Full implementation remains open; code r37 stays stale. This post-execution documentation is not the executed source commit.

## Second implementation unit — configuration and caption settings

Continue from `f830d3f2ff69ce1a670ccc338e3676624214de77` under the user's direct-pseudocode implementation goal, with physical module flattening only. The existing common Backend JSON is embedded once into each packaged HTML, read/frozen without file-network access, and initial Project defaults clone that source. Caption settings candidates merge only new edits inside Backend; six public text/settings wrappers gate fresh official reads on commit. Slot caption reads move behind the registered query boundary.

Browser case42 adds config/instance isolation, command-time authority, numeric limits/fallbacks, exception preservation and noncommit result checks; both distributions retain prior41 cases. Build verification compares embedded JSON to the actual source JSON in both artifacts. Workflow path filters now include the real config dependency. Review `agent_space/reviews/review-20261018-001-code-caption-settings-open.md` records the bounded prompt audit and uncovered whole-goal work. Code r38 remains stale; no Source/pseudocode revision or closure change. Patch20261018-001 and actual changed files commit together. Actions were pending at preparation; actual implementation commit `b8944bc83332ac149f89409a31e1ec930982366b` passed regression39051983860 (42 inline +42 split), versions39051983808 and build39051983865 (generated dist-only bot commit `e14c499e87f24ad29f6ff3174ef2ca033609dd77`). Results and limits are recorded in the review; this later documentation is not the executed HEAD. No local application/test/build/checker execution. Whole-goal annotation/layout/graph/assets/renderer/export cutover remains open.

## Third implementation unit — labels and reference geometry

Baseline `767c4086dbb3057a1f41ca1ed002d201d8a665c6`. Translate the six label API procedures and Backend settings/position/query ownership directly from pseudocode r12, keeping the JS files physically flat. Application sends only new edits, gates postcommit work and reads `labels.readState`; Backend merges current settings, uses config defaults for reset and supplies immutable sample/selected-slot reference geometry. Shared geometry follows the explicit-project pseudocode calculation, without an invented minimum cell dimension. Browser case43 covers current-authority edits, config limits/reset, detached reads, merged/missing-slot geometry, invalid/noncommit preservation and completion without Project writes. Source-code r39 remains stale; upper layers unchanged. Review `agent_space/reviews/review-20261018-002-code-labels-open.md` tracks actual verification and whole-goal gaps. Actual source changes and patch20261018-003 pair committed together as `bb4ddc4037ea45e1b9a185d3bca11a4c4c859d8b`. Actions regression39052637981 passed43 inline +43 split; version39052637844 and build39052637903 passed; bot dist commit `b9017660a7add509234d4e706529447d9830e364`. The later result record is not the executed implementation HEAD.

## Fourth implementation unit — palette command/query and supplied CSS

Baseline `b9017660a7add509234d4e706529447d9830e364`. Code r40 translates whole-palette normalization/default fallback, official immutable `appearance.readPalette`/renderer `ui-palette` reads, commit-gated public set/reset, and pure supplied-palette `applyUiPalette` CSS mapping. Application coordinates the query and existing dashboard render; renderer does neither. Browser case44 covers whole-set versus partial-merge semantics, case/known-key/default rules, no Backend query/write from CSS rendering, exception preservation and noncommit no-render/no-success gates. Upper layers unchanged; whole implementation remains stale/open. Review003 and patch20261018-004 record the actual unit. Actions pending at preparation.

## Temporary-file rule

The user explicitly authorized this cleanup: removed only `.work/plan022/pseudocode/`, `.work/plan022/fidelity-checklist.md` and `.work/plan022/inter-module-notes.md`; the downloaded verification artifact and regular repository files remain. The earlier denied deletion did not run; this later authorized deletion did. For subsequent work collect temporary files and clean once after the work finishes, not between steps. Do not remove verification evidence or unrelated files.
