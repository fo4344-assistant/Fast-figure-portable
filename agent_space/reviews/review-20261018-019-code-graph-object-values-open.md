# Code57 — current-authority one-object edit (whole alignment open)

Baseline e66e1decf0c1a44ee592ad3e3cbe7a57a1643bcf. Source40 and pseudocode15 remain current: existing meanings suffice; no Source, pseudocode, policy or optional model edits. Code57 stays stale. No execution outside GitHub Actions default runner.

## Prompt-to-artifact audit / scope

| Existing authority requirement | Implementation / intended direct evidence | Preparation status |
| --- | --- | --- |
| Source `backend/graphs.py:graphEditorCommit`, pseudocode `backend/graphs.pcal:CalculateOneObjectValues`, `NormalizeOneObjectEdit`, `GraphCommitInAttempt`: current chart/index/CSV; requested-valid/current-valid/default columns; missing style only; enum/numeric/text rules; retain other objects/extensions | `applyGraphObjectValuesAction` builds a current-source detached candidate, uses configured style/limits and own edits; case65 invalid/omitted/inherited edits, real alternate CSV/column fallback, extension and other-object retention | Implemented; Actions pending |
| Source `backend/project_efsm.py`, pseudocode `backend/project_efsm.pcal:CalculateSourceCommandCandidate/ProjectStateMachine_send`: projection/validation before commit, recheck authority and retry, actual changed facts and index hint | supplied-candidate `rebuildEditableGraph`, existing whole validator, reference-identity retry, one initialize, actual pre/post IDs and chartId/selectedIndexHint; case65 getter/validator/projection failures and injected authority replacement | Implemented bounded branch; Actions pending |
| Source `application/public_api/graphs.py:graphEditorObjectValues`: identities/new values only, noncommit gate, fresh explicit chart read after success, no selected-CSV write | `graphEditorObjectValues(chartId,index,values)`, public binding `setGraphObjectValuesApi(index,values)` captures chart ID through official read, no candidate array; case65 captures command and success-work counts | Implemented; Actions pending |
| Source `backend/project_state.py:graphs.readData`, pseudocode `backend/project_state.pcal:BuildGraphEditorRead` | immutable fresh chart/objects, independent current CSV/columns, objectColumns only for valid editable selection; explicit unique-owner chart read or visible selected slot; case64 read purity/copies/frozen selection/missing chart | Implemented; Actions pending |
| Existing Backend reconciliation hint contract | `buildFrontendReconciliationInput` consumes matching selectedIndexHint then existing current reference validation; case65 preserves current asset path while selecting edited index | Implemented; Actions pending |
| Preserve advanced existing behavior unless Source chooses otherwise | existing real CSV data, graph extensions, public index-only binding and existing renderer coordination retained; invalid enums preserve current values; Source nonempty text color intentionally replaces legacy hex-only acceptance | Static comparison; runtime pending |
| Ordered authority, paired records, commit/push and lineage | Source40 → pseudocode15 unchanged → code57; patch041 pair, Plan023 unit17, this review, metadata in same atomic user-authorized Git unit | Fingerprint provisional until canonical runner output, cumulative versions required |

## Explicit uncovered requirements / no whole completion

This unit converts only `graphs.setObjectValues`; legacy add/move/delete/palette/editor-conversion commands and UI data-read cutover remain open. Shared `validateChartModel` still lacks the complete Source schema/coordinate validation; this command adds enum/finite-style checks for its normalized objects and invokes the existing whole validator, but does not claim that invoking it proves full Source validation. Complete schema/reference/coordinate normalization must be aligned in the following ownership work. The official query's implementation is not proof that all existing public graph read bindings consume it. Candidate code does not yet unify every other EFSM action's retry/commit path. No claim of full supplied dashboard renderer, canonical import/image-settings retention or raster capture/resource composition. Optional model26 remains stale/TLC not run. Green subset results cannot close the active goal.

## Execution plan / pending evidence

Push triggers actual regression (prior63 plus64/65, inline and split), version diagnostics and build on ubuntu-latest. The prior code56 fingerprint is deliberately retained provisionally, not represented as code57's canonical fingerprint. Record exact SHA/run IDs and failures; correct from runner output with paired record, then run cumulative versions against this baseline. No local test/parser/checker/build executed.

## Code57 implementation evidence / canonical correction

Implementation SHA 3dba3721ccaaf65e078743055be3ee91f139f9c9:

- Regression39102929007 PASS65 inline +65 split, including cases64 copied read and65 command normalization/failure/noncommit/retry. Prior1–63 retained; exact thrown exception objects are checked before success work. Artifacts inline6317496 bytes / split ZIP1733428 bytes.
- Build39102929019 PASS; dist-only bot277d3b60711699cf65be375c92de7285d978bdea inspected and fast-forwarded. Embedded Source settings/README/LICENSE distribution checks passed. Both workflows ran default ubuntu-latest, no local runtime execution.
- Version39102929010 FAIL as transparently expected on provisional code56 fingerprint: recorded `sha256:feaea6a274e26dc96ee8450197be52afeb1dfdb9df6682fb0cd85bfe04e448e0`, actual `sha256:95c99ef36aba09751f3e0bbc67a702bbfaf7743d8e82782f9779923fcf2b403b`. Source40 and pseudocode15 canonical digests unchanged. Patch042 copies the actual runner digest into metadata without revision/status/runtime edits. Corrected cumulative version gate against e66e1decf0c1a44ee592ad3e3cbe7a57a1643bcf is still required; this initial failed gate is not a pass.

The table's pending runtime assertions above are now covered by the named regression/build at the implementation SHA; whole shared validator/other-path limitations remain unchanged and uncovered. Do not promote whole code to current. Follow-up evidence recording itself is not the executed runtime SHA.

## Corrected lineage audit / remaining next action

Corrected metadata SHA47530593099ff2656aa51092b449d0d1db6e428a:

- Cumulative versions39103002796 PASS with base e66e1decf0c1a44ee592ad3e3cbe7a57a1643bcf; automatic39103001972 also PASS. Canonical output matches Source40/pseudocode15/code57 values recorded above. This verifies fingerprints/revision/derivations/record structure, not graph semantics by itself.
- Repeated regression39103004875 PASS65 inline+65 split, same artifact sizes as implementation run, directly retaining cases64/65 and earlier63. Independent build39102929019 PASS at identical implementation inputs. Git diff from implementation to corrected SHA confirms no sourcecode/scripts/sourcescript/pseudocode edits. All actual execution default Actions runner.
- Authority/order: unchanged closed Source40 and direct pseudocode15 define the implemented one-object/read/hint branch; no lower semantics promoted to Source. Runtime code57 remains stale because the explicitly uncovered shared-validator and other-path requirements remain. Patch041 implementation+test+metadata/plan/review, patch042 canonical evidence and patch043 final evidence are paired and committed/pushed.

Next concrete Source-led audit discovered while reading the shared validator (not implemented here): `sourcescript/backend/graphs.py:185` permits graphDataSelection x/y both empty when there are no columns; `sourcescript/backend/graphs.py:235` explicitly permits an empty CSV as an ordinary object reference. However `pseudocode/backend/graphs.pcal:187` CreateBaseGraphObject requires CurrentCsvContainsColumns and `pseudocode/backend/graphs.pcal:632` validateChartModel at lines651/656 requires membership in actual column definitions even when empty. Before replacing the weak lower shared validator, settle the zero-column real-CSV branch explicitly at Source level, without inventing fake columns/CSV or silently banning the already-promised empty CSV operation; then translate pseudocode and code in order. Conversion representation must still be distinguished from real project references. Normalizable global/four-axis and imported/graph extension shape also need direct Source-to-primitive fidelity review rather than assuming vague helper names prove validation. Whole asset/import/raster/supplied dashboard/API integration remains open. No goal-completion claim.
