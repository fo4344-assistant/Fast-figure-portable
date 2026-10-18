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

## Initial Actions execution and followup

At1edbc2cd14131baeef3bf80f082f358fec07c932 build39103628193 PASS, dist-only bot42a051ab40de4151b12413afe8249e8bbe219645 inspected and fast-forwarded. Regression39103628198 passes new68/69 both distributions plus all prior cases except25: `Error: 변경할 현재 편집 가능 차트 또는 유일한 visible graph owner가 없습니다.` Legacy25 still called deleteObject without catching the now-explicit command rejection; its prior one-object portion already asserted rejection. Source public graphEditorDelete and Backend editable precondition require original rejection propagation, not silent success/no-op. Patch048 adds explicit rejection assertions for delete and equal move, retaining exact object-state equality and disabled controls. No runtime change or weakened precondition.

Version39103628229 diagnostic FAIL prints exact code59 canonical `sha256:0dcc648b0c985935d8f272c121b1a16c38db7a6385f11317d319e503f17cb7a0`; metadata correction retains revision59/stale and unchanged Source41/pseudocode16 derivations. At5dc81c618461f4513c8a7aa06dae03da26ca524f corrected regression39103731272 PASS69 inline+69 split; cumulative version39103731890 PASS against a37bb486bcee99b6bc793e36bf390780f7bce22a (push39103731195 also PASS). Exact canonical upper/code digests confirmed. Runtime inputs identical to successful build39103628193. This supersedes bounded pending table entries, not whole-goal exclusions; no local execution.
