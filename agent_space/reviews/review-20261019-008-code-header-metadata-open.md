# Plan023 Unit54 — explicit imported CSV header metadata (open)

Baselineb3b4ff3acb11dbf7a833b1c6de7d37e71a74f542 (Unit53 generated dist only). Preceding implementationde03dea2b2fbefc55c832ef20e727748c4860674 push39168028818/repeat39168030239 PASS136 inline+136 split each; build39168028790/canonical39168028808/cumulative39168032210/fidelity39168034262 PASS. Review007 retains inspected exact-SHA logs. No completed work repeated.

## Requirement-to-artifact mapping

- sourcescript/backend/assets_files.py CSV_HEADER_RULE: finite numeric conversion, truncate/clamp0..row count; invalid0, only missing stored field defaults1, explicitly null/empty/0 is not missing.
- pseudocode/backend/assets_files.pcal NormalizeImportedAssetCollections:1184 `asset.headerLines := NormalizeHeaderCount(IF HasField(raw,"headerLines") THEN raw.headerLines ELSE 1,rows);` already directly translates this branch.
- Runtime sourcecode/fast-figure.js importedProjectCsvState incorrectly used `source.headerLines ?? 1`, changing explicit null to1. Replace only default predicate with Object.hasOwn; preserve shared headerLineCount numerical conversion and all existing mutation retry/error semantics (including numeric conversion exceptions). No Source/pseudocode change.
- New137 changes actual FFPX assets XML typed metadata, reparses CRC-valid ZIP, builds candidate and checks no current authority change, then uses public api.project.importFile. Eight cases absent/null/empty/0/2.9/-3/99/invalid require1/0/0/0/2/0/3/0. Every case verifies original byte and row preservation, helper/candidate and public imported state. Existing tests preserve broader header edit/retry/errors. No local execution.

## Delivery and evidence

Source45/pseudocode24 unchanged. Code105 fingerprintsha256:bf974ecbe6ddd06de208c856d1e33e867711875b28a00ef33ac3630dc103e42b stays stale. Plan023/review007 evidence/this review/pair013 accompany coherent change. Single gh atomic tree/commit justified only for immediate-parent code+lineage gate (sequential Contents previously failed); verify current HEAD/old blobs/new paths and non-force ref. Default GitHub-hosted exact-SHA137 inline+split/repeat/build/canonical+cumulative/fidelity PENDING. No local application/test/build/checker, no manual dist, optional TLC not executed/not gate.

## Rejected alternatives, exclusions and open audit

Do not change null numeric conversion or weaken Source to call null missing; do not rebuild original data bytes or alter unrelated header-edit behavior. Reuse official shared header calculator, no new model/state authority or redesign. This unit is only Project candidate normalization. FFSX header normalization path is independently unclosed (reader copies metadata and import copies model); must compare Source/PlusCal/apply contracts before extending this fix. ZIP safety/dataRef/metadata/settings/global initializer topology/ownership, resource/raster/current snapshot/dashboard/timing and exhaustive requirement-to-artifact inventory remain OPEN. Structural green or137 coverage cannot prove full conformance. No completion claim or actual quota/auth/service blocker.
