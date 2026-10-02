# Slot-core file-boundary verification experiment

## Scope

This mapping is an execution experiment for the already-canonical slot-core
verification slice. It does not replace \`verification/FastFigureSlotCore.tla\`
and does not change the verification-model revision or fingerprint.

The boundary source is the Source Script file/import structure first, then the
function ownership inside each file.

## Source Script mapping

| Source Script file | Role in this experiment | TLC unit |
| --- | --- | --- |
| \`sourcescript/project_state.py\` | shared state/reference contract provider | projected into each dependent unit; no independent state walk because this slice maps its relevant functions to pure predicates/operators |
| \`sourcescript/application_fsm.py\` | slot reset/swap orchestration and grid command delegation | \`FastFigureApplicationFsmUnit\` |
| \`sourcescript/layout_annotations_export.py\` | grid resize, merge, split geometry and slot-local payload movement | \`FastFigureLayoutUnit\` |

The current canonical slot-core model does not cover the other Source Script
files, so they are not added to this comparison.

## Import-boundary projection

### application_fsm.py

The unit keeps:

- reset of complete slot-local payload;
- owned-chart removal on reset;
- complete slot-local payload swap;
- candidate validation before commit;
- grid command call/return result.

Inputs owned by the layout module are projected to only what this module
observes:

- source/target visibility for swap;
- accepted/rejected result for the delegated grid command.

The unit deliberately does not carry grid geometry, merge spans, concrete image
settings, or caption text.

The slot-local value domain keeps distinct representative payload classes
(default, chart ids, image, caption, settings) because reset/swap operate on the
whole payload and chart ownership is a local invariant of this mutation group.

### layout_annotations_export.py

The unit keeps:

- grid rows/columns and slot geometry;
- visible/hidden merged coverage;
- grid shrink safety;
- merge/split preconditions;
- payload movement/reset semantics of merge/split.

Concrete slot-local content owned/defined elsewhere is projected to:

- \`default\`;
- \`payload-a\`;
- \`payload-b\`.

Two non-default identities are retained so the check can distinguish payload
preservation from a simple default/non-default boolean.

Application FSM notification state is outside this unit because the mapped
layout procedures do not use it to choose domain next state.

## Comparison baseline

The baseline is the successful monolithic 2x2 run of
\`verification/FastFigureSlotCore.tla\` through
\`.github/tlc/FastFigureSlotCore2x2.*\`:

- workflow run: 36895823728
- generated states: 14,129,174
- distinct states: 8,114,209
- queue at completion: 0
- search depth: 28
- elapsed: 8 min 30 s

The modular workflow records the same TLC generated/distinct/depth/elapsed
metrics per unit. The primary comparison is:

- sum of generated states across units;
- sum of distinct states across units;
- sequential sum of unit elapsed times;
- parallel wall-clock bound as the slower unit job.

No claim is made that this experiment extends Source Script coverage beyond the
existing slot-core slice.
