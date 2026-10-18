# Graph add — bounded code62 review (whole alignment open)

## Authority and closure

Baseline f050d9209aaab2ea2787d32834c8cfa8e6fd883e. Source41 is authoritative: `sourcescript/backend/project_efsm.py` GRAPH_OBJECT_EDIT_INPUT_CONTRACT, `sourcescript/backend/graphs.py` GRAPH_OBJECT_NORMALIZATION_RULE/EMPTY_CSV_GRAPH_RULE/connectDataToSlotModel, `sourcescript/application/public_api/graphs.py` graphEditorAdd. Pseudocode16 `pseudocode/application/public_api/graphs.pcal` graphEditorAdd and `pseudocode/backend/graphs.pcal` CreateBaseGraphObject/ConnectDataInsideCandidate/calculateGraphObjectEdit directly specify the chosen behavior. Existing closure suffices; no new upper meaning, policy change or optional TLC claim.

## Prompt-to-artifact audit

| Requirement | Artifact/evidence | Status |
| --- | --- | --- |
| Scalar inputs, read only for event routing | sourcecode/fast-figure.js graphEditorAdd; official slots.readSelected; addGraphObjectApi binds session slot/current CSV | implemented; runner pending |
| Current authority re-resolution, no public objects | applyGraphFirstObjectAction and applyGraphObjectEditAction add branch | implemented; cases72/73 pending |
| No stale route repair | first route rejects occupied slot; append route rejects missing/noneditable chart/owner | case73 and existing25 pending |
| Configured base object, real CSV incl empty | createCandidateBaseGraphObject; first chart candidate nextId/title/global settings | cases72/73 pending |
| Candidate figure/validation before commit, retry source replacement | both branches rebuild supplied candidate, validate, compare source and initialize once | case73 pending |
| Actual changed facts and appended index through common reconciliation | chart/slot changed IDs, selectionHints; no manual Frontend/CSV change | case72 pending |
| Success-only detached fresh return/render | graphEditorAdd postcommit graphs.readData; noncommit unchanged | cases72/73 pending |
| Preserve advanced order/extensions and existing selection | append normalizes missing styles only, selected CSV untouched | case72 pending |
| Execution on Actions default runner | regression/build/version workflows use ubuntu-latest | pending actual SHA/run evidence |
| Lineage and paired atomic record | development-versions.json code62 stale, Source41/pseudocode16 unchanged; patch053 pair/Plan023 unit21 | canonical digest pending |

Legacy regression24 previously depended on add's incidental CSV-selection mutation; it now explicitly selects its fixture before add, preserving its separate current-CSV/object-columns assertion. Case25 now explicitly requires command rejection on noneditable add, not a swallowed status-only failure.

## Boundaries, alternatives and remaining work

Rejected wrapper-calculated arrays/live ensureGraphObjects, double commit for first object, hidden CSV-selection side effects and changing Source to authorize them. A dedicated first-object expansion keeps the unrelated legacy CSV-connect/import branch unchanged rather than altering its broader replacement semantics without translating that ownership unit. Existing shared validator remains incomplete for full style/global/axis/imported shapes; invoking it is not whole-contract proof. Legacy import/connect/setEditable/layout reads and candidates, asset commands, canonical packages/settings, raster snapshots and supplied dashboard/API integration remain open. Whole code stale; suite does not prove completion.

## Initial runner evidence

At implementation074cfdc9d9690872b708a9d906175b9088da5657, default ubuntu-latest regression39104304561 PASS73 inline+73 split, including legacy24/25 and new72/73; build39104304535 PASS. Distribution-only bot88510ce7184a996951b06b12011f6aa5dda6bba2 inspected and fast-forwarded. Artifacts inline6361348 bytes/split ZIP1734444 bytes. Version39104304592 intentionally failed the provisional recorded code61 digest; canonical Source41 and pseudocode16 unchanged, actual code62 `sha256:1ca96148d1f4cb2a61807728b6bedd783428a96282947be7de84c3527fe6f62f`. Patch054 records only this digest and evidence, no runtime/revision/status changes. Cumulative version gate from f050d9209aaab2ea2787d32834c8cfa8e6fd883e and repeat exact-SHA regression pending. Table above is preparation status, superseded for runtime tests by these actual results; lineage still pending. No local app/test/build/checker execution.
