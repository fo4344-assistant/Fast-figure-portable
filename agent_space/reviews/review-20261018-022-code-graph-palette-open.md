# Code60 — Graph palette candidate (whole alignment open)

Baseline5dc81c618461f4513c8a7aa06dae03da26ca524f. Source41 closed/current → pseudocode16 current → code60 stale. No upper meaning change: sourcescript/backend/graphs.py GRAPH_PALETTE_RULE independently requires current editable objects, trimmed nonempty text sequence, cycling color only, no parser authority/UI palette synchronization/new object or CSV, zero-object chart valid and index hint omitted. sourcescript/application/public_api/graphs.py graphEditorApplyPalette requires command-only inputs then committed-only detached official read. Pseudocode/backend/project_efsm.pcal calculateGraphObjectEdit and GraphCommitInAttempt/pseudocode/application/public_api/graphs.pcal matching wrapper directly translate this. Existing JS live object mapping and manual selected-index bridge were lower ownership violations, not reasons to change Source.

## Bounded prompt-to-artifact checklist

| Requirement | Code/test artifact | Evidence |
| --- | --- | --- |
| Source authority and translation order | Existing Source41 contracts above and pseudocode16; no new design added | Static inspected |
| IDs/new values not authoritative object arrays | graphEditorApplyPalette dispatches chartId/colors only; public applyGraphPaletteApi binds chart through official read | Case70 spy pending |
| Resolve current unique visible owner/editable chart | applyGraphObjectEditAction shared preconditions and same-source clone | Cases70/71 pending |
| Every palette entry text, trim/nonempty, reject empty/non-array/sparse | Backend for-of validates string and trimmed value; no hex or Plotly parser | Cases70/71 pending |
| Color only, sequence cycling; no reference/order/extension/style/asset/UI palette/other-chart changes | In candidate replaces object.color only then existing missing-style normalization/validation; rebuild derived figure from same candidate | Case70 exact snapshots pending |
| Preserve graph selection via OMITTED hint key | result chartId only, not explicit null/index; shared reconciliation validates retained original index | Cases70/71 pending |
| Zero objects valid, no fake object/CSV | Full input validation still runs; empty loop and same whole candidate path | Case70 pending |
| Build/validate candidate before commit, retry changed authority | Shared rebuildEditableGraph(chart,candidate), validateProjectObjectState and identity check | Case71 validator/projection failure and injected-new-source retry pending |
| Failures/noncommit have no success query/reconcile/render or writes, original errors propagate | Private Application committed gate; no catch/rollback added | Case71 pending |
| Success fresh immutable read; no Application backend calculation | Official graphs.readData copied chart and render gate | Case70 pending |
| Preserve prior1–69 both deployment forms | Existing browser cases plus70/71 | Actions pending; no local execution |
| Fingerprint/build/version exact SHA | development-versions.json code60/stale unchanged upper derivations; prior code59 fingerprint provisional until canonical runner diagnostic | Actions pending |

Retaining missing-style normalization follows existing graphEditorCommit contract; does not license overwriting present style or extension values. Ordinary named/rgb/hex/other nonempty text is stored without inventing a second color parser. Palette does not turn its absent hint into a request to clear selection. Valid zero-object palette is not rejected merely because no index exists.

## Scope and exclusions

This review is not a completion audit for whole Plan023. Legacy add, connect/import/editability/layout/header/full shared graph validation, asset rename/move/delete/cascade current-authority candidates, canonical package import and imageSettings identity, raster snapshots/composition and supplied dashboard/API integration remain uncovered unless earlier bounded reviews explicitly verify them. A shared validator call is NOT evidence it implements every Source rule. Code remains stale; model26 stale/TLC optional pending. No policy edits, delegation or local test/build/checker execution.
