# verification-model r1 — slot/layout/chart core

## Scope

This revision models one coherent Source Script slice:

- `SLOT_LOCAL_DEFAULTS` and the one-owner slot-local payload rule
- chart reference validity and exact-one-slot chart ownership
- `applySlotsSwappedAction`
- `applySlotsResetAction`
- `mergeSlots`
- `splitSlots`
- `buildGridResizeCandidate` / grid commit semantics

Source Script inputs:

- `sourcescript/project_state.py`
- `sourcescript/layout_annotations_export.py`
- `sourcescript/application_fsm.py`

The model is intentionally incomplete as a project-wide verification model.
Its manifest state remains `tlc=pending`.

## State representation

The persistent project slice is reduced to:

- current grid rows/columns
- one slot-local payload per bounded grid cell
- merge coverage relation
- current chart-id set

A slot-local payload keeps the Source Script ownership unit together:

- chart
- image
- contentType
- imageSettings
- caption

The exact image-setting numbers and caption text are not relevant to this slice.
They are represented by equivalence classes such as `default/custom` and
`no-caption/caption`.

## Environment actions

The model contains four `seed-*` actions.

They abstract already-validated upstream commands that can create a non-default
slot-local state:

- chart connection/creation
- image connection
- explicit slot caption
- custom slot-local image settings

They are environment actions rather than new Fast Figure domain commands.
Their purpose is to make layout operations reachable with representative
non-default payloads.

## Candidate-first abstraction

For grid resize and merge, invalid candidates are represented as disabled actions.
With TLA+ stuttering, an invalid request therefore has no persistent-state change.

This preserves the Source Script rule:

```text
resolve/precondition
-> candidate
-> validation
-> commit once
```

without introducing a second persistent candidate state into the model.

If later work needs to verify an asynchronous validator, lock, callback, or
multi-step transaction, candidate state must be made explicit instead of using
this atomic abstraction.

## TLC bounds and abstractions

This r1 model uses deliberately small finite domains:

- maximum grid: 3 x 3
- initial grid: 2 x 2
- chart ids: 2
- image ids: 1
- caption: absent/present
- imageSettings: default/custom

These are model-checking bounds, not application limits.

The reduction keeps distinctions that affect the checked properties:

- default vs non-default slot-local state
- chart identity
- image-reference presence
- chart vs image mutual exclusion
- merged vs visible cell
- layout position
- chart owner movement

## Invariants

The model defines:

- `TypeOK`
- `InactiveCellsAreDefault`
- `CoverIntegrity`
- `HiddenCellsAreDefault`
- `MergedRegionsAreRectangles`
- `SlotReferenceIntegrity`
- `ChartOwnershipInvariant`
- `SafetyInvariant`

The most important domain property in this slice is:

```text
every existing chart has exactly one active owning slot
```

across arbitrary sequences of seed/swap/reset/merge/split/resize operations.

## Omitted or deferred Source Script behavior

### Runtime selection

`selectedSlotId`, graph-object selection, and workspace selection are not in r1.

Reason:
this revision is limited to persistent slot/layout/chart integrity.

Not checked:
safe grid shrink clearing a runtime selection that points to a removed slot.

Re-add condition:
the FSM/runtime verification slice must model selection and lifecycle state.

### Pure reads and projections

Examples:

- `ProjectObject.read`
- `resolveOwningSlot` as a read API
- `getProjectCsv`
- `getProjectImage`
- `getChart`
- dashboard pixel geometry
- renderer projections

Reason:
they do not mutate this model's authority and their result does not decide the
modeled layout transactions.

If a read later participates in stale-read, lock, TOCTOU, or mutation-decision
logic, it must be brought into the model.

### Asset/file/graph internals

CSV objects, graph objects, VFS, FFPX/FFSX, Plotly conversion, export, file locks,
and external I/O are deferred to later verification slices.

They are not considered globally verified by this r1 model.

### Application concurrency

The modeled layout mutations are synchronous atomic commits.
No lock or concurrent writer is assumed in this slice.

If implementation introduces asynchronous validation, multiple writers,
resource locks, or callback-dependent commit ordering, this atomic model is no
longer sufficient and must be refined.

## Next validation step

Before `tlc=passed`:

1. translate the embedded PlusCal algorithm,
2. run TLC with `FastFigureSlotCore.cfg`,
3. fix translation/model errors without changing Source Script semantics,
4. inspect any TLC counterexample,
5. record exact tool version, explored bounds, assumptions, state count,
   invariant results, and remaining omissions in a validation review.

A TLC pass for this slice does not by itself permit source-code work.
The verification-model layer must eventually cover the other core Source Script
algorithms required by policy v0.2.0.
