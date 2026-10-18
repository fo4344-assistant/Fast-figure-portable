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
| Ordinary empty CSV survives real one-object edit with no object data trace and preserved axis-only figure traces; nonempty fallback preserved | browser cases66/67; real CSV ID/path/bytes untouched, both-empty, invalid pair, absent CSV, conversion distinction, pure validation failure | Cases66/67 implemented; Actions pending |
| Canonical lineage and actual distributions | Source41/pseudocode16/code58 metadata, default-runner canonical digests, cumulative version gate, inline+split regression and build at exact SHA | Prior canonical fingerprints transparently provisional until runner diagnostic; no local execution |
| Paired rollbackable unit/commit/push | patch044 includes Source/pseudocode/code/tests/metadata/plan/review; user-authorized atomic Git | Prepared for atomic commit/push |

## Limits

Only coordinate/reference validation is tightened. Shared full enum/style/global/four-axis/graph imported shape validation and all legacy add/move/delete/palette command ownership are not claimed aligned. The existing one-object branch's current-authority retry/commit remains tested separately, not proof of all commands. Canonical import, asset candidates/cascade, raster composition and supplied dashboard/API cutover remain open. Code58 remains stale; no whole-goal completion from these tests or metadata.

## Initial execution / diagnostic followup

At implementation5b4cf5b1a26aff7dc2e62d06380076ec2b7b957a: build39103232225 PASS, dist-only bot9f06319794129c68519aa51c5b567c46ce1b722a inspected/fast-forwarded. Regression39103232254 passed1–65 both distributions but66 failed `zero-column real object rejected, changed or projected synthetic trace` and67 failed `empty CSV switch lost reference, mutated assets/selection or created fake data`. These broad assertions do not yet distinguish cause; patch045 splits/adds actual diagnostics without dropping any assertion or changing runtime/Source. No assumption of test-only defect or production success.

Version39103232238 expected diagnostic FAIL on provisional Source40 fingerprint, prints canonical Source41 `sha256:62af3282d0c33fd555e02188501f6cf340f8f2a8936fb646f07d379887c80dc5`, pseudocode16 `sha256:e25d2057a10e358127598141d3d94de2f5700108da14809a0ef5e92e11be71e9`, code58 `sha256:c4392333de189f86ff307adf8a5ff1e0d2227cddd79b9c2bc0a96e8926e1b97e`. Patch045 records exact runner values and derivations; no revision bump or weakened checks. Actual regression repair and cumulative version gate from f4690dfd53bf4cf8999db4e4d26d964913042354 still required. All actual execution default runner.

## Source-guided failure resolution (patch046)

At62dc5254028fabaf34d4566eb4607c45dcd4d792 cumulative versions39103335935 PASS against f4690dfd53bf4cf8999db4e4d26d964913042354; regression39103335310 still fails66/67. Diagnostic values show coordinates empty, copied/frozen result true, CSV assets and selection unchanged; only figure.data contains the required `{meta:{fastFigureAxisPlaceholder:true},x:[],y:[],...}`. Source41 backend/graphs.py `traces` step5 and PlusCal `AxisOnlyFigureTraces` already explicitly require these figure-only axis helpers; `tracesSingle` is the object-data boundary that returns empty. No Source or runtime defect follows from a nonempty figure array. Tests had incorrectly conflated object data trace with whole figure. Preserve the independently specified useful axis feature, do not change Source to retroactively justify removal.

Correct tests66/67 to require no object data traces while explicitly checking axis helpers remain zero-data/nonlegend; populated transition now requires an actual non-placeholder trace with data (old length>0 was insufficient). This is a contract-corrected assertion, not removal of empty-data/no-fake-object requirement. No runtime/upper/revision change. At a37bb486bcee99b6bc793e36bf390780f7bce22a corrected regression39103449623 PASS67 inline+67 split and push versions39103449639 PASS; cumulative gate39103335935 at62dc5254028fabaf34d4566eb4607c45dcd4d792 PASS from f4690dfd53bf4cf8999db4e4d26d964913042354, same exact Source/pseudocode/runtime blobs. Build39103232225 PASS at5b4cf5b1a26aff7dc2e62d06380076ec2b7b957a also same runtime. Earlier table pending entries are superseded only for this bounded unit; whole code remains stale and uncovered scope remains open.
