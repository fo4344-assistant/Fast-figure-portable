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

No local app/test/build/checker executed. Initial recorded code62 digest remains provisional until canonical runner diagnostic, then correction+cumulative strict gate required. Implementation/test results pending; do not confuse artifact checklist with actual coverage evidence.
