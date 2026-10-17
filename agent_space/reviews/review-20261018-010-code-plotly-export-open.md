# Code r47 — same-Project figure reads and Plotly JSON export (OPEN)

Baseline `db7da948255535d1e18928cbb3533e166bc0c639`. Source39 closed/current and pseudocode13 current remain unchanged. Physical module flattening is the only implementation exception; code47 remains stale.

## Prompt-to-artifact audit

| Requirement / actual authority inspected | Implemented artifact and verification surface |
|---|---|
| `pseudocode/backend/graphs.pcal` traces/layout/rebuildEditableGraph/chartFigure receive the same Project | JS counterparts pass an explicit Project through CSV resolution and palette layout calculation. Figure reads use pure readGlobalSettings, not the mutating normalizer. A copied chart is rebuilt; the supplied Project/chart are never modified by chartFigure |
| `pseudocode/backend/project_state.pcal` export graphs.exportPlotlyJson, Source EXPORT_BACKEND_READ_CONTRACT | Official Backend query resolves the explicit visible graph slot and owning chart from one current Project, builds the figure in that context, returns copied frozen name/MIME/UTF-8 byte values; absent target returns null. Query allocates no URL/download resource |
| `pseudocode/application/public_api/graphs.pcal` exportSelectedGraph | Application supplies slot identity, operation and per-call sanitized UTC timestamp, queries once and forwards only the payload. Missing target returns undefined without a download or status substitute |
| Source PUBLIC_LIFECYCLE_RULE | Existing Application runLifecycleTask owns exactly one public graphs.exportPlotlyJson call. It starts exporting before the query/handoff, rejects busy reentry, completes None and recovers/propagates original failures |
| `pseudocode/frontend/renderer.pcal` downloadExportPayload, copied-byte branch | Renderer consumes bytes/name/MIME only, creates one local URL, hands it to the browser once, yields for browser handoff, and releases it in finally. Original handoff/encoding errors propagate. Success means handoff, not disk-save confirmation |
| Obsolete path | Removed unused downloadJsonFile and direct chart/selected-slot/figure download logic from downloadPlotlyJson; no compatibility bridge or second state |
| Concrete cases | Case53 checks detached supplied CSV/palette context versus different live values, no normalizer write, immutable current query bytes/name/MIME, missing target, imported frames, no fallback for missing supplied CSV. Case54 checks public busy/lifecycle timing, single query, actual Blob content, handoff URL lifetime/failure recovery, None and no persistent changes |
| Lineage and same-commit records | Revision47 with current upper fingerprints; actual four-path code fingerprint; this review, plan, tests and patch019 pair accompany the modified source in one atomic commit |

The retained legacy graph/render call sites now explicitly preserve their old presentation scale argument while using the new Project argument position; remaining implicit current-Project defaults are not claimed as completed candidate ownership. Other graph algorithms (style/numeric normalization, optional extension removal), graph/asset command builders, FFSX/package export and raster/current-capture snapshot composition still need direct-translation work. downloadExportPayload implements the copied-byte path used here, not all package-entry producers. No Source ambiguity required a new meaning in this unit: existing Source and pseudocode already define these branches.

## Decisions / rejected alternatives

Rejected reading live CSV/palette again after copying a chart, calling the write-normalizer in a query, encoding/downloading in Backend, a UI-owned figure snapshot passed back as a command, catching errors as status, and reporting disk confirmation. All conflict with the existing owner/return contracts. Byte arrays are a concrete immutable JS representation; text encoding, Blob, anchor and one scheduler turn are platform primitives. The scheduler runs before successful URL release; handoff exceptions still release this operation's URL and propagate. Existing unrelated surface resources are not revoked.

## Verification

Implementation and patch019 committed together as `4d91c62d643e92113b6e62bbb3e6cfcf0724e2ae`. Version39057561692 SUCCESS with actual code47 stale fingerprint `sha256:7b27c5f6d2c7bbeb743e7e382598a5be0d3b24304a170a0151b04c5050119128`. Build39057561708 SUCCESS, verified both distributions and produced dist-only bot `0ab35f6cb4208197fdc1b7cc53d414eee3b11e4c`, fast-forwarded locally.

Initial regression39057561684 passed cases1–53 in both formats but case54 failed `Error: successful handoff leaked URL/result/lifecycle`. Its assertion assumed this operation's revoke was the first global revoke entry, although prior raster tests schedule delayed revocations. Test-only patch020 checks membership of the operation-owned URL rather than unrelated global ordering, retains None/query/click/lifecycle assertions and adds diagnostic values. No production change or fingerprint/revision change. Follow-up Actions pending; the failure remains recorded rather than relabelled as a pass.

Actual logs are retained under `.work/graph-r47-evidence/`. No local application, Source, pseudocode/parser, checker, test, build or TLC execution. File diff/reverse-apply checks are not runtime evidence. Any later result-only documentation is not the executed implementation HEAD.

## Whole-goal audit

Deliverables remain all pseudocode owners directly translated with exact input/output/branches, current-authority candidates and single commits, rejection/failure/lifecycle/resource behavior, sole config authority, supplied-projection rendering and requirement-linked integration evidence. This unit covers only same-Project figure reads and one export API. Remaining graph/assets/canonical constructor normalization, positional selection maps, raster/current capture, renderer Backend direct reads, other lifecycle/API/package routes and whole integration are not proven by cases1–54 or a green lineage check. Goal is not complete; code stays stale.
