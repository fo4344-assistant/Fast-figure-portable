# Code r45 — persistent print settings / conversion boundaries

Baseline `ec548da11a60f8794b7ec5238703805fee978351`. Source39 closed/current and pseudocode13 current remain unchanged. Code45 remains stale; physical hierarchy alone is flattened.

## Prompt-to-artifact audit

| Requirement | Evidence inspected |
|---|---|
| Direct translation | `pseudocode/backend/project_efsm.pcal:NormalizeExportEditsInAttempt`, `pseudocode/application/public_api/layout_annotations.pcal:setExportSettings`, corresponding Source procedure, and primitive failure contract in `pseudocode/README.md` |
| Current candidate | EXPORT_SETTINGS_CHANGED clones current authority, copies current export fields, applies only supplied declared fields, whole-validates and commits once; no Application candidate/snapshot |
| Limits / numeric values | Reads logicalWidth/logicalHeight/dpi bounds from sole Backend config; finite values including zero clamp; omitted/invalid/non-finite values preserve current fields. NoValue/null is not numeric zero |
| Enums and height | Only valid supplied heightMode/format replace current enums; auto forces height null; explicit preserves current height or uses config logicalHeight lower bound if none |
| Input evaluation | Only own declared edits are consumed, each edit field read once. Unknown/inherited fields cannot become persistent settings |
| Public boundary | setPrintApiSettings passes new values only, returns false without successful query on noncommit, otherwise official frozen print.readSettings; errors propagate |
| Correction of earlier lower-layer mistake | r44's new image conversion catch swallowed Symbol/custom conversion exceptions. The existing README primitive contract says conversion exceptions propagate. Remove that catch, retain invalid/non-finite value preservation, and make NoValue distinct from zero. No new upper semantics or Source change is required |
| Tests | Case40 retained (including Symbol print failure). Case49 corrects its former mistaken Symbol-success expectation and adds conversion-exception atomicity assertions. Case50 covers own/inherited/unknown edits, explicit null fallback, getter-once, zero/config bounds, current-authority injection, auto/explicit transition, getter/conversion failure and uncommitted no-query gate |
| Records | Code45 fingerprint/current upper lineage and review path, plan, source/tests and patch015 pair in the same implementation commit |

## Rationale / rejected alternatives

Do not duplicate numeric limits or normalize a full settings snapshot in Application. Do not retain the r44 try/catch merely because case49 passed: that test asserted the wrong failure branch and green tests do not override the existing upper primitive contract. Ordinary invalid numeric text/non-finite output is distinct from a conversion that throws. A property getter or conversion exception rejects the entire command before authority replacement/reconciliation.

Review007 records what actually ran at r44; its statement that all conversion failures become invalid values is superseded by this correction. No historical Actions result is rewritten as a failure, and no whole-conformance claim is inferred from either suite.

## Verification

Implementation and patch015 committed together as `b3c345e50990ea2fa69420feb66c1e11866927c3`.

- Actions regression39056301075 SUCCESS at that HEAD: actual logs show cases1–50 passing in inline and split-zip; cases49/50 explicitly cover the corrected image and print conversion exception boundaries.
- Version39056301048 SUCCESS at that HEAD: Source39 closed/current, pseudocode13 current, code45 stale with fingerprint `sha256:f7f94079e4caeb00f3dd5a53c9a7148d668bb25251cca5b8e99bdb914f71ae23`.
- Build39056301152 SUCCESS at that HEAD: both distributions verified and dist-only bot `af4dbaf1e8ea0898597472d6574eb1a4f6caa455` fast-forwarded locally.
- Actual logs retained under `.work/print-r45-evidence/`. Later result-only documentation is not the executed source HEAD.

No local application, Source, PlusCal, parser, checker, test, build or TLC execution. Byte hashing, diff whitespace and isolated-index reverse apply passed as file checks only, not runtime or whole-goal conformance proof.

## Whole-goal completion audit

Required end state remains direct implementation of every current pseudocode owner, inputs/results/branches/commit/failure/lifecycle/resource rules, sole config authority and immutable supplied-projection rendering/export, preserving logical ownership despite flattened files, with actual requirement-linked evidence.

This bounded print-settings and conversion correction does not complete target raster geometry/caption rendering, graph/asset candidates, canonical import normalization, positional cascade maps, complete API/lifecycle conformance, renderer cutover or legacy removal. In particular save/capture still use legacy rendering and the broader adapter/dashboard reads Backend state. These uncovered requirements keep code45 stale and the active goal open.
