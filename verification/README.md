# verification code r2 — slot/layout/chart direct translation

## Purpose

This revision replaces the earlier state-model-style r1 with a direct executable
translation of the corresponding Source Script algorithms.

The role is the original pseudocode role plus executable verification:

```text
Source Script
-> verification code
-> TLC
-> source code
```

The verification code is not a second design model.

It preserves the Source Script's:

- data ownership
- function boundaries
- call relationship
- execution order
- branches
- value generation and consumption
- candidate/validation/commit boundary
- failure/rejection behavior

TLA+ operators are used where the Source Script describes pure calculation.
PlusCal procedures are used where the Source Script describes an operation or
mutation path.

## Source Script mapping

### project_state.py

Directly represented:

- `SLOT_LOCAL_DEFAULTS`
- `slotHasNonDefaultLocalState`
- slot-local ownership of chart/imageId/contentType/imageSettings/caption
- chart/image reference validity for this slice
- exact-one-slot chart ownership

`validateProjectObjectState` is not redefined as a smaller project validator.
Instead this slice defines `ValidateSlotLayoutProjection`, which explicitly
means only the projection of whole-project validation that can change in this
translation. Unmodeled ProjectObject fields are assumed unchanged and valid.

### application_fsm.py

Direct PlusCal procedures:

- `applySlotsResetAction`
- `applySlotsSwappedAction`
- `applyGridLayoutAction`

The candidate is calculated before authoritative mutation.
A rejected/invalid candidate leaves `activeProject` unchanged.

### layout_annotations_export.py

Direct translation:

- `buildGridResizeCandidate` as a pure TLA+ operator
- `setLayoutApiGrid` as a PlusCal procedure
- `mergeSlots` as a PlusCal procedure
- `splitSlots` as a PlusCal procedure

The call chain is preserved:

```text
applyGridLayoutAction
-> setLayoutApiGrid
-> buildGridResizeCandidate
-> projection validation
-> commit or reject
```

## Data representation

The verification code keeps the Source Script slot structure rather than
replacing it with a separate `payload/cover` domain model.

Each slot has:

- id
- row / col
- rowSpan / colSpan
- hidden
- content.chart
- content.imageId
- content.contentType
- content.imageSettings
- caption

The TLA+ function that maps slot id to slot record is a mechanical finite-state
representation of the Source Script slot collection.

## TLC bounds

For this slice TLC uses:

- maximum grid: 3 x 3
- initial grid: 2 x 2
- chart ids: 2
- image ids: 1

These are finite verification bounds, not application limits.

Values such as caption text and manual image settings use representative values,
but the field ownership and branches that distinguish default/non-default state
are preserved.

## Verification harness

`VerificationHarness*` procedures are deliberately separated from translated
Fast Figure procedures.

They are not domain commands and must not be copied into source code.

Their only role is to construct valid representative prestates containing:

- an owned chart
- an image reference
- a slot caption
- non-default image settings

so TLC can execute reset/swap/merge/split/grid operations over the states that
the real application can reach through other Source Script modules.

The earlier r1 mixed these state generators with the modeled operation set.
r2 makes the separation explicit.

## Invariants

The verification assertions for this slice check:

- bounded slot/layout type validity
- one slot record per active grid cell
- valid visible/hidden merged coverage
- chart/image reference validity
- chart and image mutual exclusion
- every existing chart has exactly one owning slot
- every committed state remains a valid slot/layout projection

These assertions are additional verification of the translated pseudocode.
They do not replace or reinterpret Source Script behavior.

## Deferred Source Script areas

This file is still one verification-code module, not the complete project
translation.

Not translated here:

- asset/VFS algorithms
- CSV/TSV/JSON parsing
- graph/editor/Plotly algorithms
- FFPX/FFSX serialization/import
- caption/label/export algorithms outside the slot-local parts used here
- complete application FSM/lifecycle
- renderer/API/UI modules

Those high-level algorithms must be translated in additional verification-code
modules before the project-wide TLC gate can pass.

Pure reads may be omitted only under policy v0.2.2 conditions. Their data
contracts and any read that influences mutation, ordering, reference selection,
locking, stale-read behavior, or failure semantics must still be represented.

## Current validation state

This revision is executable verification code but has not yet been translated
and run with TLC in this change.

Therefore:

```text
verification-model status = current
tlc = pending
```

The next step for this module is PlusCal translation and TLC execution.
