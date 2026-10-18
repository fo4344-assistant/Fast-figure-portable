# Code r50 — original asset download (OPEN)

Baseline `4052ee361c4a4825e906e67cfdbd88a2a265f581`. Source39 and pseudocode13 remain unchanged and authoritative. This bounded unit directly translates their existing original-asset export contract; it does not close whole Plan023 alignment.

## Prompt-to-artifact / contract checklist

| Requirement | Authority → translation → implementation | Evidence / limit |
| --- | --- | --- |
| Current Project query, explicit path, detached original bytes/name/MIME; missing/wrong-kind/no bytes returns none | sourcescript/backend/project_state.py EXPORT_BACKEND_READ_CONTRACT and dispatchProjectQuery → pseudocode/backend/project_state.pcal export branch → readBackendProjection assets.download | Case57 compares CSV/image originals, fallback MIME, fresh frozen arrays, wrong/missing paths and decoding failure; pending Actions |
| Application consumes query only; omitted path binds current Frontend scalar; true handoff/false absent; errors propagate | sourcescript/application/public_api/assets.py downloadProjectAsset and public_api/__init__.py lifecycle → pseudocode/application/public_api/assets.pcal downloadProjectAsset and contract.pcal → downloadProjectAsset | Case58 public API/current selection/query/lifecycle/busy/error checks; pending Actions |
| Renderer consumes copied payload; operation-local URL released on success/failure | sourcescript/frontend/renderer.py downloadExportPayload → pseudocode/frontend/renderer.pcal → downloadExportPayload | Case58 checks actual Blob bytes and release after click/anchor-creation failure. Anchor creation moved inside existing try/finally |
| No Project/selection writes, backend resource allocation or Application status side effect | Same contracts | Cases57/58 snapshots and resource trap; pending Actions. No browser disk-save guarantee |
| Source Script highest; do not discard advanced behavior | Existing original bytes/MIME/name retained; no higher-level semantic addition needed | No authority files modified; no speculative source/pseudocode rewrite |
| Runner-only verification and lineage | development-versions.json code50 stale, same upper lineage | Patch028 records canonical runner code50 fingerprint sha256:400a291052b5fbd65e1a010a2f78a674b12b828b60d70ed8f860e90d02fddd57; cumulative version gate pending, unit NOT complete |

## Actions evidence

Implementation `6fdd71d28b31c9a52ff7e553d4a396ce87dd52a5`: ubuntu-latest build39101164483 passed; bot6e4565d updated only generated distributions and was fast-forwarded locally. Initial version39101164447 failed with `source-code fingerprint changed without updating development-versions.json`, reporting actual code50 sha256:400a291052b5fbd65e1a010a2f78a674b12b828b60d70ed8f860e90d02fddd57. Patch028 uses that output without local checker execution or semantic revision increase. Regression39101164429 failed: cases1–56 passed, case57 reported `image export fixture missing`; case58 compared all Frontend runtime fields although lifecycle transitions legitimately increment revision. Patch029 supplies an explicit image fixture and compares the five selection fields separately from lifecycle checks, retaining Project immutability and resource/error assertions. No production changes or weakened selection contract. Version39101206486 and cumulative dispatch39101207023 passed at feba7d20cbc70d629dfb58ba1b3faaa7819808e4 (base4052ee361c4a4825e906e67cfdbd88a2a265f581). Corrected regression39101292726 passed58 inline +58 split at4b5b663adeb37c232c082fd700dd494a3639933d; versions39101292588 passed at the same HEAD. This verifies the bounded original-asset contract and retained earlier regressions, not whole Plan023. No Source/pseudocode or production change was needed for the fixture correction.

## Scope boundaries and next checks

Only static file/diff inspection locally; no application/build/parser/test/checker/TLC execution. Push triggers default ubuntu-latest version/build/regression workflows. Record exact HEAD/run/results; correct code50 fingerprint using canonical Actions output, then require cumulative version validation from baseline. Cases1–56 remain regression obligations, not evidence of full Source Script coverage. Other candidate/import/graph-calculation/raster/dashboard/API integration gaps remain open. This review is not a current-status declaration.
