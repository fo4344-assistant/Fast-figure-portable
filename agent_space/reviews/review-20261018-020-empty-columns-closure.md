# Source41 zero-column reference closure → pseudocode16 → code58 (whole alignment open)

Baseline f4690dfd53bf4cf8999db4e4d26d964913042354. No policy edits; optional model26 remains stale/not run. All test/build/checker execution only Actions default runner.

## Source-first decision and closure

Trigger: review019's lower validation audit found a conflict between Source40 graphDataSelection's explicit no-columns x=y="", EMPTY_CSV_GRAPH_RULE's ordinary empty CSV object creation, and the lower pseudocode's unconditional membership preconditions. Prior closure failed to carry this boundary across selection/construction/validation; merely calling helpers with broad names hid the contradiction. Code's previously weak shared validator is not the authority for deciding the outcome.

Decision BEFORE lower edits: Source41 preserves promised real empty CSV references and makes the acceptance boundary explicit in connectDataToSlotModel/EMPTY_CSV_GRAPH_RULE/validateChartModel. Resolve real csvId even without columns. Zero maximum row width (including [] and [[],[]]) requires exactly both x/y empty text; any positive width requires both actual column IDs (single column may repeat). Apply the same coordinate boundary to conversion-table views without manufacturing a Project CSV. Missing real CSV always fails. tracesSingle already yields no trace for unresolvable coordinates, so no new renderer mode/state is needed. One-object edits use the existing requested-valid/current-valid/default selection and may transition between empty and nonempty CSVs.

Closure criteria:
1. Logical completeness: empty/nonempty width, both coordinates, one-column equality, both representations, dangling real references, construction/edit/validation/projection boundaries explicit; no new persistent field, authority or Frontend transition.
2. Purpose: keep ordinary empty CSV usable for object creation and prevent invalid column IDs from being silently accepted by shared validation. Reject banning empty objects (contradicts promised creation), fake C1/C2 or fake CSV (breaks reference truth), silently repairing invalid input in query/validation (violates purity), and relaxing missing real reference validation (dangling corruption).
3. No unjustified duplication: same coordinate predicate used by construction and shared validation; data defaults remain graphDataSelection and projection remains tracesSingle. Source adds only the missing cross-boundary condition, not JavaScript implementation details. Rest of Source40 closure inherited from review018. Source41 closed for this clarification; broader implementation still incomplete.

## Ordered translation / prompt-to-artifact audit

| Requirement | Direct artifact/evidence | Status |
| --- | --- | --- |
| Source highest, close before lower translation | Source41 paragraphs above; actual sourcescript/backend/graphs.py diff in patch044 | Closed statically; canonical digest pending runner |
| Zero/nonzero coordinate predicate | pseudocode/backend/graphs.pcal ValidColumnPair, CreateBaseGraphObject and validateChartModel use same resolved definitions | Translated after Source closure; same resolved columns and explicit empty-pair predicate statically compared |
| Backend pure shared real/conversion reference validation | sourcecode/fast-figure.js validateChartModel resolves supplied CSV collection or conversionRows and validates coordinate pair without repairing object | Implemented pure supplied-collection coordinate branch; runtime pending |
| Ordinary empty CSV survives real one-object edit and projects no trace; nonempty fallback preserved | browser cases66/67; real CSV ID/path/bytes untouched, both-empty, invalid pair, absent CSV, conversion distinction, pure validation failure | Cases66/67 implemented; Actions pending |
| Canonical lineage and actual distributions | Source41/pseudocode16/code58 metadata, default-runner canonical digests, cumulative version gate, inline+split regression and build at exact SHA | Prior canonical fingerprints transparently provisional until runner diagnostic; no local execution |
| Paired rollbackable unit/commit/push | patch044 includes Source/pseudocode/code/tests/metadata/plan/review; user-authorized atomic Git | Prepared for atomic commit/push |

## Limits

Only coordinate/reference validation is tightened. Shared full enum/style/global/four-axis/graph imported shape validation and all legacy add/move/delete/palette command ownership are not claimed aligned. The existing one-object branch's current-authority retry/commit remains tested separately, not proof of all commands. Canonical import, asset candidates/cascade, raster composition and supplied dashboard/API cutover remain open. Code58 remains stale; no whole-goal completion from these tests or metadata.
