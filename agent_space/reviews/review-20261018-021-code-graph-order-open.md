# Code59 — Current-authority graph order/removal (whole alignment open)

Baseline a37bb486bcee99b6bc793e36bf390780f7bce22a. Source41 closed/current and pseudocode16 current remain unchanged. No lower behavior promoted to authority. Highest Source already independently specifies desired behavior in sourcescript/backend/project_efsm.py GRAPH_OBJECT_EDIT_INPUT_CONTRACT/ProjectStateMachine.send and sourcescript/backend/graphs.py graphEditorCommit; sourcescript/application/public_api/graphs.py graphEditorMove/Delete defines public no-op and success gates. Pseudocode/backend/project_efsm.pcal calculateGraphObjectEdit plus GraphCommitInAttempt, pseudocode/application/public_api/graphs.pcal matching procedures directly translate these. Existing legacy JS had calculated arrays against live objects in Application and rebuilt figures after committing; code59 removes that ownership for move/delete, reuses the already-bounded one-object candidate path.

## Prompt-to-artifact audit for this bounded unit

| Requirement | Artifact/evidence | State |
| --- | --- | --- |
| Source highest / upper translation before code | Existing Source41 contracts and pseudocode16 above; no new semantics needed | Static reviewed |
| New values/IDs only, same current owner/array | applyGraphObjectEditAction resolves current chart/unique visible graph owner; ignores projected object arrays; move/delete only indices | Implemented; cases68/69 pending runner |
| Arbitrary from/to, exact retained relative order/extensions | Backend remove from then insert at final to; no sorting, fake objects, CSV replacement or Frontend writes | Cases68/69 pending |
| Equal valid index is copied no-op, invalid indices reject | Application official read shortcut only editable valid integer; Backend repeated preconditions and equal returns false | Case68/69 pending |
| Last delete valid empty chart; explicit none not neighboring selection | Backend splice, normalize zero-or-more, hint chartId/selectedIndexHint=null | Case68 pending |
| Candidate-only projection/whole validation/retry then one commit | Shared candidate path supplies project to rebuildEditableGraph, checks authority reference before initialize; recomputes each attempt | Case69 hooks projection/validator errors and newer authority pending |
| Actual result and fresh detached success read | changed computed pre/post; immutable primitive hint, common reconciliation; committed alone permits post-query/render; public index API binds selected chart via official query | Cases68/69 pending |
| Preserve selected CSV/assets and original errors | No SELECT_ASSET/manual graph event or asset changes in wrapper/Backend; failures/noncommit no success effects | Cases68/69 pending |
| Preserve prior contracts | Existing1–67 plus new68/69 inline and split | Actions pending; no local execution |
| Lineage/build exact commit | metadata code59 stale derived Source41/pseudocode16; prior digest provisional until canonical runner diagnostic | Actions pending |

Selection uses existing shared chart-scoped reconciliation, not an independent mirror. Valid same-index no-op does not dispatch/reconcile/render; direct Backend equal move returns uncommitted no hint. No rollback after postcommit failure is invented. Boundary retains public moveObject(from,to)/deleteObject(index) signatures while explicit private Application functions receive chartId.

## Choices / exclusions

Reuse one current candidate/normalization/commit path rather than duplicate another order controller. Existing add/palette/graphEditorCommit remain legacy and are NOT claimed aligned. Full shared enum/style/global/axis/imported-shape validator and canonical import are still uncovered, despite the validation call; tests target only this bounded contract. Asset cascade/current-authority commands, raster composition, supplied dashboard/public read integration and whole Plan023 remain open. Optional model26 stale/TLC pending, not required to progress. No policy edits or local test/build/checker.
