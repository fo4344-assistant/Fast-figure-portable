# Slot-core file-boundary verification mapping

## Scope

This mapping applies Source Script file/import boundaries as the first
decomposition boundary for the already-canonical slot-core verification slice.

It does not replace \`verification/FastFigureSlotCore.tla\`, does not change the
verification-model revision/fingerprint, and does not claim additional Source
Script coverage. The purpose is to compare one global TLC state walk with
separate file-owned state-transition walks using interface projections.

## Source Script mapping

| Source Script file | Role | TLC treatment |
| --- | --- | --- |
| \`sourcescript/project_state.py\` | shared state/reference contract provider | relevant ranges/predicates are projected into dependent units; no separate state walk because the mapped functions in this slice are pure contract/operators |
| \`sourcescript/application_fsm.py\` | reset/swap orchestration and grid command delegation | \`FastFigureApplicationFsmUnit\` |
| \`sourcescript/layout_annotations_export.py\` | grid resize, merge, split geometry and slot-local payload movement | \`FastFigureLayoutUnit\` |

The current canonical slot-core model covers only these Source Script areas, so
other Source Script files are not included in this comparison.

## Boundary rule

A dependent unit does not carry the producer module's complete state merely
because it reads a value originating there.

Instead, the dependent unit receives only the input projection used by its own
algorithm, over the allowed input range. This experiment therefore treats
shared authoritative state as an interface value when the consumer does not
need the producer's internal transition history.

### application_fsm.py

The unit keeps:

- reset of the complete slot-local payload;
- owned-chart removal on reset;
- complete slot-local payload swap;
- candidate validation before commit;
- reset id-resolution success/failure;
- source/target visibility success/failure for swap;
- grid command call/result.

Inputs owned by layout are reduced to the values observed by this module:

- \`idsResolved\` for reset;
- source/target visibility booleans for swap;
- accepted/rejected result for delegated grid handling.

The unit deliberately does not carry grid geometry, merge spans, concrete image
settings, or concrete caption text.

The local payload domain keeps representative distinct values for:

- default;
- chart-1 / chart-2;
- image;
- caption;
- settings.

Those distinctions are retained because reset/swap operate on the complete
slot-local payload and chart ownership is part of the mapped mutation contract.

### layout_annotations_export.py

The unit keeps:

- grid rows/columns and slot geometry;
- visible/hidden merged coverage;
- grid shrink safety;
- merge/split preconditions;
- payload movement/reset semantics of merge/split.

Concrete slot-local values owned or defined outside the layout responsibility
are projected to:

- \`default\`;
- \`payload-a\`;
- \`payload-b\`.

Two non-default identities are retained so TLC verifies payload preservation,
not just a default/non-default boolean.

Application FSM notification/runtime state is excluded because it is not an
input to the mapped layout next-state decisions.

## Canonical operation coverage

The monolithic slot-core procedures are assigned as follows:

| Canonical procedure/operator | File-owned unit |
| --- | --- |
| \`applySlotsResetAction\` | application FSM |
| \`applySlotsSwappedAction\` | application FSM |
| \`applyGridLayoutAction\` | application FSM call boundary |
| \`buildGridResizeCandidate\` | layout |
| \`setLayoutApiGrid\` | layout |
| \`mergeSlots\` | layout |
| \`splitSlots\` | layout |
| slot-local default/reference/ownership predicates used by the above | projected \`project_state.py\` contract |

The grid command is intentionally represented twice at different levels:
application FSM verifies delegation/result behavior, while the layout unit
verifies the actual grid transition. The producer's internal state is not
duplicated in the consumer unit.

## Baseline: one global state walk

Successful canonical 2x2 execution profile:

- workflow: \`TLA Slot Core\`
- run: \`36895823728\`
- job: \`110482441021\`
- TLC: 2.19 / TLA+ tools v1.7.4
- workers: 4
- search: breadth-first exhaustive
- generated states: 14,129,174
- distinct states: 8,114,209
- states left on queue: 0
- complete graph depth: 28
- TLC elapsed: 8 min 30 s (510 s)

## File-boundary unit results

Successful final modular run:

- workflow: \`TLA Slot Core Modular Experiment\`
- run: \`36967192135\`
- tested commit: \`f025673fedb341e816ccad288f74839d28cb3099\`
- TLC: 2.19 / TLA+ tools v1.7.4
- workers: 4
- search: breadth-first exhaustive
- invariant violation/counterexample: none

### application_fsm.py unit

- job: \`110713389607\`
- generated states: 1,794,598
- distinct states: 1,008,357
- states left on queue: 0
- complete graph depth: 23
- TLC elapsed: 8 s

### layout_annotations_export.py unit

- job: \`110713389767\`
- generated states: 100,797
- distinct states: 60,285
- states left on queue: 0
- complete graph depth: 27
- TLC elapsed: 4 s

### Sum of independent walks

- generated states: 1,895,395
- distinct states: 1,068,642
- sequential TLC elapsed: 12 s

Compared with the global 2x2 walk:

- generated states reduced by 86.59% (7.45x smaller);
- distinct states reduced by 86.83% (7.59x smaller);
- sequential TLC elapsed reduced by 97.65% (42.5x faster).

The workflow uses a matrix and can execute units in parallel, but GitHub runner
queue delay is external to TLC and is not used as a benchmark. The 12 s figure
is the conservative sum of the two TLC-reported model-check times.

## Interpretation

The state counts are not two executions of an identical global state graph.
The modular version intentionally removes cross-module state products and keeps
only each file-owned state plus the interface projections needed by that file.

Therefore the comparison measures the cost difference between:

\`global state-product exploration\`

and:

\`sum of interface-complete local explorations\`.

This is the intended decomposition effect, not a TLC runtime flag optimization.

The experiment remains supplemental execution evidence. Promoting this scheme
to the canonical verification model requires a separate verification-model
revision decision; this patch does not make that promotion.
