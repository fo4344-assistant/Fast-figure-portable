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

Pending GitHub Actions at preparation. No local application, Source, pseudocode/parser, checker, test, build or TLC execution. File diff/reverse-apply checks are not runtime evidence. Cases1–54 are requested in both packaged formats; version checker must verify actual fingerprint and stale status; build must verify both distributions. Actual runs/HEAD and any failures will be recorded after execution.

## Whole-goal audit

Deliverables remain all pseudocode owners directly translated with exact input/output/branches, current-authority candidates and single commits, rejection/failure/lifecycle/resource behavior, sole config authority, supplied-projection rendering and requirement-linked integration evidence. This unit covers only same-Project figure reads and one export API. Remaining graph/assets/canonical constructor normalization, positional selection maps, raster/current capture, renderer Backend direct reads, other lifecycle/API/package routes and whole integration are not proven by cases1–54 or a green lineage check. Goal is not complete; code stays stale.
