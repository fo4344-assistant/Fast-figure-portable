# Graph editable conversion — bounded review (open whole alignment)

## Authority and scope

Source41 sourcescript/application/public_api/graphs.py graphEditorSetEditable and sourcescript/backend/graphs.py convertImportedChartToEditable require scalar command, current owning chart, single candidate including generated CSV/next-id/references, supplied-candidate projection, one validated commit, no Application CSV selection. Pseudocode16 application/public_api/graphs.pcal wrapper and backend/graphs.pcal ConvertImportedChartInAttempt, backend/project_efsm.pcal CHART_MODEL_REPLACED already directly express this meaning. Source remains highest; no new domain meaning or upper edit needed. Preserve useful legacy imported payload/global/axes and collision-free encoded synthetic CSV behavior, but move ownership to Backend. This is not full import/shared-validation closure.

## Prompt-to-artifact audit

| Requirement | Concrete artifact / verification | State |
|---|---|---|
| Public existing selected-chart binding/toggle; Application scalar slotId/chartId/editable only | setGraphEditableApi; graphEditorSetEditable; case74 | implemented, runner pending |
| Current visible unique owner, valid bool, chart resolved at each attempt | applyChartModelReplacedAction; case75 invalid IDs/bool | pending |
| Conversion rows+objects allocate one real encoded CSV from current next-id/path, remap all refs | same action/buildProjectCsvModel with candidate; case74 collision/path/MIME/bytes/ids | pending |
| No conversionRows keeps real refs; repeat editable no duplicate CSV; zero objects no fake CSV | same action; case74 reverse/repeat and existing4 blank FFSX | pending |
| Preserve imported/global/axis representation and unrelated assets/CSV selection | same action and copied official postcommit query; case74 | pending |
| Rebuild with candidate, validate whole, source ref retry, initialize once | action; case75 exact validator/projection errors/no mutation and stale authority/next-id retry | pending |
| Actual immutable changed CSV/chart/asset owner facts, no invented hint | action; case74 checks facts; existing send copies/freeze | pending |
| Noncommit no success read/render/reconcile; success returns boolean | wrapper; cases74/75 | pending |
| Noneditable chart cannot keep graph-object selection | existing Source project_state reconciliation step4 translated guard; case74 | pending |
| Retain all prior regressions and actual canonical lineage/packaging | Actions default runner suite/build/version exact SHAs | pending |

## Exclusions and verification boundary

Source41/pseudocode16 current unchanged; code63 stale remains whole-plan open. Full style/global/axes/extension schema validation, other asset/connection/import candidate paths, package canonical import/slot imageSettings fidelity, raster composition and supplied dashboard/API integration remain unclosed. Existing full validator incompleteness is not excused by this local candidate; no whole closure or optional TLC claim.

## Source-first lower-stage correction and actual initial runs

At49c519c65161026ee3f1cbe9ea80070b9fa9ba7b, build39104652534 PASS, regression39104652629 passed prior73 and new75 in both distributions, but74 failed `Error: noneditable transition retained graph selection or changed CSV selection`. Static inspection identifies test setup graphEditorSelectObject explicitly sends selectAsset:true, changing CSV before the tested transition. Replace only setup with SELECT_GRAPH_OBJECT selectAsset:false; production rejection/selection assertions remain. Dist-only bote64cfe4087367d7050a0e52ca8e408cb1b648940 inspected/fast-forwarded.

Additional fidelity audit: Source41 graphs.py GRAPH_EDITOR_FIELDS conversionRows states editable transition removes conversion-only rows; convertImportedChartToEditable step2 explicitly permits zero objects/no CSV. Prior PlusCal16 removed field only when object count>0, leaving conversion-only data on zero-object editable charts. Prior closure missed this branch; no new Source meaning required or reverse-authority explanation. Pseudocode17 moves RemoveField outside nonzero branch but inside HasField. Both paths now remove transient imported-conversion rows, retain zero-asset rule and imported graph/settings, directly translating Source41. Source logical completeness/purpose/no duplicate authority unchanged; previous other translations inherited, no independent lower design authority. Code64 records derivation update (same runtime as63).

Version39104652606 diagnostic reports canonical code63/64 sha256:53a6e764f33db5b9c50bdb10106329a151f4a969611764e3caed0395767aa6ef, recorded now; Source41 unchanged. Pseudocode17 digest/derived metadata still provisional until new canonical runner; strict gate pending, not a pass. Corrected regression pending. No local app/test/build/checker execution; optional TLC not run. Whole goal/code64 remain open/stale.
