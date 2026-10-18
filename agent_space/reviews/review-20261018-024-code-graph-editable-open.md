# Graph editable conversion — bounded review (open whole alignment)

## Authority and scope

Source41 sourcescript/application/public_api/graphs.py graphEditorSetEditable and sourcescript/backend/graphs.py convertImportedChartToEditable require scalar command, current owning chart, single candidate including generated CSV/next-id/references, supplied-candidate projection, one validated commit, no Application CSV selection. Pseudocode16 application/public_api/graphs.pcal wrapper and backend/graphs.pcal ConvertImportedChartInAttempt, backend/project_efsm.pcal CHART_MODEL_REPLACED already directly express this meaning. Source remains highest; no new domain meaning or upper edit needed. Preserve useful legacy imported payload/global/axes and collision-free encoded synthetic CSV behavior, but move ownership to Backend. This is not full import/shared-validation closure.

## Prompt-to-artifact audit

| Requirement | Concrete artifact / verification | State |
|---|---|---|
| Public existing selected-chart binding/toggle; Application scalar slotId/chartId/editable only | setGraphEditableApi; graphEditorSetEditable; case74 | verified74 |
| Current visible unique owner, valid bool, chart resolved at each attempt | applyChartModelReplacedAction; case75 invalid IDs/bool | verified75 |
| Conversion rows+objects allocate one real encoded CSV from current next-id/path, remap all refs | same action/buildProjectCsvModel with candidate; case74 collision/path/MIME/bytes/ids | verified74 |
| No conversionRows keeps real refs; repeat editable no duplicate CSV; zero objects no fake CSV | same action; case74 reverse/repeat and existing4 blank | verified74;4 direct asset/next-id strengthening pending |
| Preserve imported/global/axis representation and unrelated assets/CSV selection | same action and copied official postcommit query; case74 | verified74 |
| Rebuild with candidate, validate whole, source ref retry, initialize once | action; case75 exact validator/projection errors/no mutation and stale authority/next-id retry | verified75; shared validator completeness excluded |
| Actual immutable changed CSV/chart/asset owner facts, no invented hint | action; case74 checks facts; existing send copies/freeze | verified74 |
| Noncommit no success read/render/reconcile; success returns boolean | wrapper; cases74/75 | verified74/75 |
| Noneditable chart cannot keep graph-object selection | existing Source project_state reconciliation step4 translated guard; case74 | verified74 |
| Retain all prior regressions and actual canonical lineage/packaging | Actions default runner suite/build/version exact SHAs listed below | verified through6fee0c6; strengthened test repeat pending |

## Exclusions and verification boundary

Initial implementation used Source41/pseudocode16; the Source-led lower-stage correction below advances pseudocode17/code64. Source41 remains unchanged/current; code64 stale remains whole-plan open. Full style/global/axes/extension schema validation, other asset/connection/import candidate paths, package canonical import/slot imageSettings fidelity, raster composition and supplied dashboard/API integration remain unclosed. Existing full validator incompleteness is not excused by this local candidate; no whole closure or optional TLC claim.

## Source-first lower-stage correction and actual initial runs

At49c519c65161026ee3f1cbe9ea80070b9fa9ba7b, build39104652534 PASS, regression39104652629 passed prior73 and new75 in both distributions, but74 failed `Error: noneditable transition retained graph selection or changed CSV selection`. Static inspection identifies test setup graphEditorSelectObject explicitly sends selectAsset:true, changing CSV before the tested transition. Replace only setup with SELECT_GRAPH_OBJECT selectAsset:false; production rejection/selection assertions remain. Dist-only bote64cfe4087367d7050a0e52ca8e408cb1b648940 inspected/fast-forwarded.

Additional fidelity audit: Source41 graphs.py chartModel.editor.conversionRows states editable transition removes conversion-only rows; convertImportedChartToEditable step2 explicitly permits zero objects/no CSV. Prior PlusCal16 removed field only when object count>0, leaving conversion-only data on zero-object editable charts. Prior closure missed this branch; no new Source meaning required or reverse-authority explanation. Pseudocode17 moves RemoveField outside nonzero branch but inside HasField. Both paths now remove transient imported-conversion rows, retain zero-asset rule and imported graph/settings, directly translating Source41. Source logical completeness/purpose/no duplicate authority unchanged; previous other translations inherited, no independent lower design authority. Code64 records derivation update (same runtime as63).

Version39104652606 diagnostic reports canonical code63/64 sha256:53a6e764f33db5b9c50bdb10106329a151f4a969611764e3caed0395767aa6ef, recorded now; Source41 unchanged. At initial implementation the pseudocode17 digest/derived metadata was provisional until a canonical runner. At d3161e87f3e4bfce7d05c33896805ab77ea6c3a7 corrected regression39104752488 PASS75 inline+75 split including strengthened4 (no retained conversionRows) and74/75. Version39104752485 intentionally failed provisional pseudo digest, actual canonical17 sha256:c576b3f037c76816f890f2f6adedd94a11fe6ea3bb6bc53712defbda47335619; patch058 corrects both fingerprint and code derivation, unchanged41 and runtime64. At corrected lineage6fee0c6248724c9e13a39bd5818d12fedaf0fae4 cumulative strict gate39104811673 PASS from86df1cfddbd34b7f6f6fe0ff44267c4f574ad232, automatic39104810958 PASS; repeat regression39104813416 PASS75+75. Runtime/build inputs unchanged from49c519c successful build39104652534 (diff inspected). A bounded-completion audit found blank FFSX zero-CSV result alone could miss an unreferenced synthetic asset. Patch059 strengthens existing4 to compare actual CSV assets and nextId before/after zero-object conversion; its fresh runner result pending, not inferred from these older75-case results. No local app/test/build/checker execution; optional TLC not run. Whole goal/code64 remain open/stale.
