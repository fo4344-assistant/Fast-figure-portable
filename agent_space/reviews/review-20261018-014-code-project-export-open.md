# Code r51 — whole-Project FFPX export (OPEN)

Baseline `4b5b663adeb37c232c082fd700dd494a3639933d`. Source39 and pseudocode13 remain semantic authority. This is a direct translation of their existing project export contract, not a new package format or whole-goal closure.

## Contract-to-artifact checklist

| Requirement | Authority → translation → code | Evidence / limit |
| --- | --- | --- |
| Validate current whole Project; build one supplied read; filter trash; recheck export references; preserve original bytes/documents | sourcescript/backend/assets_files.py ffpxBuildProject and project_state.py EXPORT_BACKEND_READ_CONTRACT → pseudocode/backend/assets_files.pcal BuildFfpxInRead/BuildFfpxDocumentEntries and project_state.pcal ExportRead → ffpxBuildProject(source), readBackendProjection | Case59 supplied/live isolation, real ZIP readback, bad grid and referenced-trash rejection; pending Actions. Shared legacy validator installs accessors only on detached read |
| Backend copies immutable entries/name/MIME, no resource/Frontend access | Same export query contract | Case59 fresh frozen nested arrays; no global registry/asset lookups in builder; pending Actions |
| Selected slot warns, returns None without query/download; otherwise one current query/handoff, None, original failure propagation | sourcescript/application/public_api/assets.py downloadProject and public_api/__init__.py lifecycle → pseudocode/application/public_api/assets.pcal downloadProject and contract.pcal → downloadProject | Case60 selected/busy/query/success/error paths, pending Actions |
| One exporting lifecycle, copied renderer payload and owned URL cleanup | sourcescript/frontend/renderer.py downloadExportPayload → pseudocode/frontend/renderer.pcal → existing downloadExportPayload | Case60 actual ZIP Blob/readback, failure cleanup and ready state. Earlier54/56/58 cover shared renderer failure boundaries |
| Preserve authority, hierarchy, advanced functionality | Existing Source/pseudocode contracts cover XML package and original-byte surface | No upper-stage semantic addition necessary. Application no longer serializes/reads persistent objects or swallows errors. No policy edits |
| Evidence/lineage and whole limits | development-versions.json code51 stale with same upper lineage | Runner digest pending; initial previous digest intentionally retained until actual canonical runner report. Tests/build/checker only on ubuntu-latest |

## Verification status

Only file/diff/Git operations locally. Push will run default runner syntax/regression, distribution and lineage workflows. Record actual SHA/run IDs and runner fingerprint before claiming bounded verification. Cases1–58 remain required, not whole Source coverage. Optional TLC not executed; no browser disk-save acknowledgement promised.

## Open whole-goal work

Graph/asset current-authority candidates, complete graph calculations and canonical import, raster snapshot/current-capture composition, supplied-projection dashboard/API integration and full requirement audit remain. Passing this bounded suite cannot close Plan023 or make code current.
