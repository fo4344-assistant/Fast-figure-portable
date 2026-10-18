# Plan023 Unit54 — explicit imported CSV header metadata (open)

Baselineb3b4ff3acb11dbf7a833b1c6de7d37e71a74f542 (Unit53 generated dist only). Preceding implementationde03dea2b2fbefc55c832ef20e727748c4860674 push39168028818/repeat39168030239 PASS136 inline+136 split each; build39168028790/canonical39168028808/cumulative39168032210/fidelity39168034262 PASS. Review007 retains inspected exact-SHA logs. No completed work repeated.

## Requirement-to-artifact mapping

- sourcescript/backend/assets_files.py CSV_HEADER_RULE: finite numeric conversion, truncate/clamp0..row count; invalid0, only missing stored field defaults1, explicitly null/empty/0 is not missing.
- pseudocode/backend/assets_files.pcal NormalizeImportedAssetCollections:1184 `asset.headerLines := NormalizeHeaderCount(IF HasField(raw,"headerLines") THEN raw.headerLines ELSE 1,rows);` already directly translates this branch.
- Runtime sourcecode/fast-figure.js importedProjectCsvState incorrectly used `source.headerLines ?? 1`, changing explicit null to1. Replace only default predicate with Object.hasOwn; preserve shared headerLineCount numerical conversion and all existing mutation retry/error semantics (including numeric conversion exceptions). No Source/pseudocode change.
- New137 changes actual FFPX assets XML typed metadata, reparses CRC-valid ZIP, builds candidate and checks no current authority change, then uses public api.project.importFile. Eight cases absent/null/empty/0/2.9/-3/99/invalid require1/0/0/0/2/0/3/0. Every case verifies original byte and row preservation, helper/candidate and public imported state. Existing tests preserve broader header edit/retry/errors. No local execution.

## Delivery and evidence

Source45/pseudocode24 unchanged. Code105 fingerprintsha256:bf974ecbe6ddd06de208c856d1e33e867711875b28a00ef33ac3630dc103e42b stays stale. Plan023/review007 evidence/this review/pair013 accompany coherent change. Single gh atomic tree/commit justified only for immediate-parent code+lineage gate (sequential Contents previously failed); verify current HEAD/old blobs/new paths and non-force ref. Default GitHub-hosted exact-SHA137 inline+split/repeat/build/canonical+cumulative/fidelity PENDING. No local application/test/build/checker, no manual dist, optional TLC not executed/not gate.

## First exact-SHA result and fixture correction

Implementationa60f18df8acf91aec9fdc8156a2f614ab16a5d7f: regression39168342014/repeat39168342543 failed137 in both inline/split after1–136 PASS. Actual error `Error: header metadata read/candidate mismatch: false/undefined`. Fixture created numeric cells then compared parsed CSV rows to those numbers, although existing CSV byte parser correctly returns strings. Pair014 uses string cells at creation, keeping exact byte/row/header assertions unchanged; no runtime/Source/PlusCal/assertion weakening. Build39168342068 PASS generated45ee4e6 (only dist files inspected and synced). Canonical39168342029/cumulative39168346313/fidelity39168348571 PASS at implementation SHA, not proof regression passed. Corrected137 exact-SHA gates pending; code105 still stale.

## Corrected exact-SHA evidence

Fixture correctionfeb37518a1b91504e4be7043280fe0b1bba84cb3: push39168589596/repeat39168589638 PASS137 inline+137 split each (274 actual pass log lines per run,137 inspected in each mode). Cumulative versions39168591753(basea60f18df8acf91aec9fdc8156a2f614ab16a5d7f), fidelity39168593720 PASS. Exact-SHA build39168617704 PASS reports distribution artifacts already current; no generated change needed. Default ubuntu-24.04 log checked. Code105 remains stale/full goal open. Unit55 separately closes the discovered existing Source CSV_HEADER_RULE omission in the FFSX pseudocode reader before direct code translation; not an invented Source rule.

## Rejected alternatives, exclusions and open audit

Do not change null numeric conversion or weaken Source to call null missing; do not rebuild original data bytes or alter unrelated header-edit behavior. Reuse official shared header calculator, no new model/state authority or redesign. This unit is only Project candidate normalization. FFSX header normalization path is independently unclosed (reader copies metadata and import copies model); must compare Source/PlusCal/apply contracts before extending this fix. ZIP safety/dataRef/metadata/settings/global initializer topology/ownership, resource/raster/current snapshot/dashboard/timing and exhaustive requirement-to-artifact inventory remain OPEN. Structural green or137 coverage cannot prove full conformance. No completion claim or actual quota/auth/service blocker.
