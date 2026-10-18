# Plan023 Unit51 — package semantic discriminants (open)

Baseline34756553c3e02b081e96f26bb26433f1056d9967 is generated dist-only successor to8a06cc2852910374f407427a38850146339192ab. Unit50 actual evidence in review004:132 inline+132 split each twice, build/canonical/cumulative/fidelity PASS. No repeat of completed caption/typed codec/wrapper fixes.

## Exact bounded mapping

Source45 sourcescript/backend/assets_files.py ffpxReadProject step8 and ffsxReadSlot require package schema/version and single graph slot semantics. PlusCal24 pseudocode/backend/assets_files.pcal ReadFfpxDocumentPayload explicitly Require(project.schema = "fast-figure-project" /\ project.version = PACKAGE_FORMAT_VERSION) before constructing payload; ReadFfsxDocumentPayload explicitly Require(settings.contentType = "graph"). Source/PlusCal unchanged. Runtime sourcecode/fast-figure.js now checks decoded project settings before replacing schema/version in transport payload, and requires decoded FFSX slot.contentType graph. Previously tautological post-construction schema check could not reject a foreign typed project schema/version. Root XML version already checked by ffpxReadXmlDocument and remains independent of typed settings. No format upgrade or new schema rule introduced.

Case133 builds actual CSV/chart FFPX/FFSX ZIPs, verifies valid reads, corrupts typed schema/version/contentType (foreign/null/missing) and independently corrupts every XML entry root/version (wrong root/wrong version/missing version). The same parser used in commands is invoked; Project/Frontend identity unchanged throughout reads. Earlier131/132 remain cumulative. Rejected trusting rewritten transport fields or root-only version checks, Source weakening, redundant parser, unrelated ZIP redesign. Scope excludes deeper ZIP structural agreement, asset dataRef/metadata validation, missing-setting normalization/initializer, raster/current-snapshot lifetime and dashboard/timing.

## Evidence and completion audit

Code102 sha256:d960dbc3ebaf51f04bb6fbc8ae5795747fe90c6b1aeb50684113a26bccf775f2 stays stale; unchanged Source45/PlusCal24 lineage. Exact new execution SHA and133 inline+133 split/repeat/build/canonical+cumulative versions/fidelity PENDING. No local application/test/build/checker or optional TLC. Existing workflows use default ubuntu-latest; no workflow/policy/dist edit.

| Requirement / artifact | Actual evidence / remaining obligation |
| --- | --- |
| Source supremacy, logical hierarchy, preserve features | Bounded existing backend reader translation above; full cross-module audit OPEN |
| assets/import/schema/serializer | Units47–50 recorded exact runs, new discriminants implementation+133 pending; all remaining package/initializer contracts OPEN |
| raster/resources/current snapshot/dashboard/timing | No coverage inferred from these tests; full audit OPEN |
| every prompt/Plan023 requirement/file/command/gate | Partial mapping only, exhaustive inventory and semantic completeness OPEN |
| exact-SHA inline/split cumulative and repeat | Prior132 twice PASS, new133 twice PENDING |
| build/dist | Prior39166674026 generator-only PASS, new execution PENDING |
| lineage/fidelity | Prior39166674025/39166677256/39166678975 PASS; new canonical+cumulative/fidelity PENDING; checker structural coverage not semantic completion |
| patch/plan/review/lineage | Pair008, Plan023, review004 actual evidence and this review, code102 |
| authorized gh/default hosted only | gh delivery/dispatch/logs; no local app/checker; no self-hosted/paid runner |
| completion/stop | No blocker observed; full objective remains OPEN, no update_goal complete |

## Actual Unit51 evidence and resumption point

Execution2fc8f65712032130ffa4fe12f2a52002c71e24da: push regression39166947212/manual repeat39166948498 PASS133 inline+133 split each (266 actual pass log lines each;133 inspected in both forms); standard ubuntu-24.04 image. Build39166947522 PASS generated dist-only successor ed4f7784e17ecc1564e2951d05a4e090141925f3, inspected diff only dist/inline/Fast-figure.html and dist/split/Fast-figure.zip. Canonical versions39166947284/cumulative39166950715(base795b3031075c2acced5db7c24d835b74c339c108)/fidelity39166952892 PASS. Each run headSha was separately inspected and equals implementation SHA, not successor. This supersedes only this unit's pending execution entries; code102 stays stale and global checklist OPEN.

Next concrete audited discrepancy: sourcescript/backend/assets_files.py:440-457 parseProjectDataAsset requires extension-specific CSV comma/TSV tab, supported-extension/table-shape failure, internal blank row preservation and JSON top-level/data arrays. pseudocode/backend/assets_files.pcal:396-412 explicitly chooses delimiter and calls dataTable. Current sourcecode/fast-figure.js:5421-5428 parseProjectCsvAsset still calls auto-detect parseCSV and does not normalize CSV output via dataTable; parseCSV at3026 drops blank rows and guesses tab from first line. Raw import at3435 independently uses JSON.parse/parseCSV. Next coherent ownership unit should route both byte import and package readers through the Source-defined one parser, preserving copied original bytes and transaction boundaries; add explicit delimiter, internal blank rows, unsupported extensions/empty input, JSON data-array, quoted delimiter/newline and raw/package parity regressions. Do not weaken established row semantics to preserve the old helper. Other package/dataRef/ZIP/initializer/raster/dashboard/timing and exhaustive full inventory remain unverified; do not infer completion from133 or fidelity coverage.

Atomic gh Git Data delivery exception remains limited to coherent code+lineage immediate-parent gate requirements; parent and file SHA/new-path checks, non-force ref update. Ordinary evidence-only followups prefer sequential Contents API. Pending does not mean passed, and generated/documentation successor SHA must not be substituted for execution SHA.
