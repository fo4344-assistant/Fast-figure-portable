# Code r48 — same-Project FFSX export and copied-entry handoff (OPEN)

Baseline `d2d06a8e2aa30e25232f7e7ae8512500fca24e01`. Source39 closed/current and pseudocode13 current are unchanged; physical module flattening is the sole implementation exception. Code48 remains stale.

## Prompt-to-artifact audit

| Existing authority / explicit requirement | Actual implementation and evidence surface |
|---|---|
| backend/assets_files.pcal BuildFfsxInRead(source,slot,chart), ReferencedProjectCsvIds, RemapRealProjectCsvIds | ffsxBuildSlot takes the supplied Project; all CSV/metadata/bytes resolve there, without registry/live fallback. Ordered unique real CSV references get package-local IDs; Project chart identity is omitted. Required slot/assets documents exist even with zero objects |
| Source validateChartModel representation rule | Shared chartUsesConversionView requires non-editable AND conversionRows presence. chartCsvIds excludes only that representation. Frozen formerly-editable charts retain real references and missing references reject. Existing shape validator's CSV-resolution branch uses the same scope; remaining complete column/style validation is not claimed here |
| CurrentVersionCsvDataRef / DataTableEncodingExtension | Existing shared projectCsvDataRef now emits data/csv-ID plus lower-case .json/.tsv/.csv from canonical path, with .csv fallback. Both FFPX and FFSX writer call sites use the same helper, without a second naming authority; readers still accept valid stored references. Existing package regressions cover compatibility, not all codec details |
| project_state.pcal official export query graphs.exportFfsx | One captured Project resolves explicit visible graph slot/chart, builds package entries and returns detached frozen entry names/byte arrays plus name/MIME; missing target null. Backend does not allocate a Blob, URL or download resource |
| Application exportSelectedGraph / PUBLIC_LIFECYCLE_RULE | downloadSlotFfsx runs exactly one exporting task and the existing identity-only official-query wrapper. Removed direct selected-slot/chart reads, local package assembly and catch-as-status behavior. Successful/None completion returns undefined; original errors propagate and lifecycle recovers |
| renderer.pcal downloadExportPayload package-entry branch | Renderer encodes copied entries using STORE ZIP, then the existing operation-owned Blob/URL/anchor handoff/finally release. No Backend query or Project access. Success is browser handoff, not disk confirmation |
| Case55 | Supplied-vs-live original CSV bytes, duplicate-reference remap/order, omitted chart ID, exact dataRef, no supplied-Project mutation, frozen-real-reference rejection, conversion view with fake CSV IDs and imported frames, empty assets document, immutable official query and missing target |
| Case56 | Actual public FFSX Blob round-trip, exactly one export query, exporting lifecycle timing, failure propagation/recovery, own URL release, None no handoff, unchanged authority and wrapper ownership |
| Records / lineage | Source, tests, revision48 fingerprint, review, plan and actual patch022 pair are in one atomic commit. No Source/pseudocode meaning changed or policy edited |

## Decisions and exclusions

Rejected resolving a copied chart against live CSV, filtering every non-editable chart as conversion, manufacturing a CSV/Project chart ID for serialization, remapping conversion-view CSV-looking integers, UI-owned package snapshots sent back into Backend, status substitutes and swallowing handoff errors. These contradict existing Source/pseudocode. Frozen JS scalar arrays are the concrete immutable copied-byte representation; ZIP/Blob/browser scheduling are platform primitives, not another owner.

Shared package reference naming and representation scope affect retained FFPX/reference call sites too; this is explicitly included, not an isolated download-only claim. No full FFPX command/query cutover, package-reader rewrite, full chart style/column validation, canonical constructor completion or graph candidate migration is claimed. No invalidation mirror, new public API or persistent state was introduced.

## Verification

Pending GitHub Actions at this record's initial implementation commit. Cases1–56 must run in inline and split packages, version checker must confirm actual code48 fingerprint, and distribution build must verify both artifacts. No local application, Source, pseudocode/parser, checker, test, build or TLC execution. File diff/reverse-apply checks are integrity checks only. Executed commit/run IDs and any failures will be recorded after actual results, without treating later documentation as the tested source HEAD.

## Whole-goal completion audit

The deliverable is direct translation of all pseudocode owners, inputs/returns/branches, current-authority candidates and one commit, failure/lifecycle/resource rules, config authority and supplied-projection rendering with requirement-linked integration evidence. This unit covers FFSX export and shared reference naming/scope, not that whole deliverable. Graph and asset command candidates, positional reconciliation, complete graph normalization, canonical package import/FFPX export, raster capture composition, dashboard Backend reads and whole API integration remain unverified/incomplete. Counts or green lineage/regression runs alone do not establish them. Keep the goal open and code stale.
