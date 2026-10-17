# Grid coordinates: Source r39 → pseudocode r13 → code r42

## Scope and discovery

Baseline: `53e6df9efbde8fc57c6be9c0844e20386dff3591`.
The active goal requires direct pseudocode implementation, physical module flattening only, and Source-first resolution of ambiguity. This unit follows that order; it does not close the whole implementation goal.

While tracing `BuildGridResizeInAttempt`, the Source slot schema (`backend/project_state.py`, SLOT_STRUCTURE) and pseudocode README require one-based grid coordinates, but Source creation/resize prose and their translated loops still used zero-based coordinates. The earlier r38 closure and r12 translation review missed this contradiction: entry/arity coverage did not check coordinate formulas. Implementing those loops literally would generate invalid slots. This is an upper-layer defect, not permission to infer a different code-only convention.

## Source closure evidence (r39)

1. **Logical completeness:** retain the existing one-based slot schema; initial cells are row=1..rows, col=1..cols, id=(row-1)*cols+(col-1). Resize tests inclusive bottom/right (`row+span-1`), preserves all retained coordinates/IDs/local properties, rejects non-default removed cells and crossing/removed merges, and allocates only newly added coordinates in row-major order starting at the maximum ID of the complete pre-resize state plus one. Mixed-axis resize is covered: removed high IDs cannot be immediately reused. Candidate validation precedes commit; no packing/reflow occurs.
2. **Purpose:** preserves user placements and prevents destructive resize. No format migration or altered stored coordinates is introduced: the schema, current validator, renderer, and package placements already use one-based grid cells. Zero-based object/column indices and slot IDs remain unchanged.
3. **Duplicate/integration inspection:** creation and resize use the same slot schema/defaults; no second coordinate state, ID sequence, config, or translation bridge is added. Only two contradictory Source sentences change. Existing r38 ownership/resource/API decisions remain unchanged. Reject switching the schema to zero-based because that would change unrelated geometry, render, and package contracts rather than resolve the local contradiction.

Source r39 is closed for this correction; it inherits the unchanged r38 review scope, not an assertion that all application code is conformant.

## Direct translation and implementation trace

| Requirement | Concrete artifact / inspection |
|---|---|
| Source-first decision | `sourcescript/backend/project_state.py:createProjectState`, `sourcescript/backend/layout_annotations.py:buildGridResizeCandidate` |
| Creation uses schema coordinates and zero-based IDs | `pseudocode/backend/project_state.pcal:createProjectState` inclusive loops and `(row-1)*cols+(col-1)` |
| Resize uses same coordinates | `pseudocode/backend/layout_annotations.pcal:BuildGridResizeInAttempt`, inclusive boundaries, new coordinates strictly beyond old extents |
| Same-authority candidate, no premature commit | `fast-figure.js:buildGridResizeCandidate`; validation then returned candidate; command action commits once |
| Pre-resize ID maximum, no reflow | maximum computed from complete source before filtering; retained records unchanged; new cells row-major |
| Public wrapper is an adapter | `setLayoutApiGrid` sends identities/new values, committed gate, render and fresh official layout query; no numeric normalization or Backend read in wrapper |
| No legacy bridge | unused `makeSlots` removed; no `rebuildGridSlots` mutation helper retained |
| Failure semantics | exceptions before initialize preserve authority/Frontend; uncommitted result returns false without render/read |
| Regression evidence | browser case 47: initial coordinate/ID formula, pure builder, mixed-axis removed-high-ID resize, retained local state, expansion order, protected shrink, invalid inputs, crossing merge, noncommit render gate, wrapper ownership |
| Physical flattening only | Backend helper, command action, Application wrapper remain in existing JS file, with no logical responsibility transfer |

Pseudocode r13 is current after this bounded retranslation. Unchanged owners retain the prior r12 semantic review, while this review corrects its coordinate oversight. Parser/TLC success is not claimed. Code r42 remains **stale**: many other graph/asset/selection/renderer/export paths are not yet translated and audited against the current full pseudocode.

## Verification status

Initial published implementation `9f3e62912971ee3148b1cb8c012c5d5e451c6f0f`: version39054296125 and build39054296332 passed; build generated dist-only `d9ad1ea8d14ac95ed9018ad2c4ead6a57cc7786c`. Cumulative static fidelity39054313298 passed at that dist HEAD, baseline53e6df9. Regression39054296186 passed prior46 cases in both formats but failed case47's combined retained-record/ID assertion. The test compared serialized legacy-accessor records by property order, which is not the slot contract. Replace that assertion with explicit geometry fields and ordered slot-local values, and split the ID assertion for diagnosis; this is not yet a passing re-run or a claim that implementation is proven correct.

Final bounded verification:

- Implementation+patch008 commit `9f3e62912971ee3148b1cb8c012c5d5e451c6f0f`; actual version39054296125 and build39054296332 SUCCESS. Generated dist-only commit `d9ad1ea8d14ac95ed9018ad2c4ead6a57cc7786c` contains the same implementation.
- Cumulative fidelity39054313298 at d9ad1ea, actual BASE_SHA `53e6df9efbde8fc57c6be9c0844e20386dff3591`, SUCCESS. Logs explicitly report Source39 closed, pseudocode13 current, code42 stale with the recorded fingerprints. Downloaded static trace retained under `.work/grid-r42-evidence/`. This checks entries/arguments/bindings/metadata, not arbitrary calculation semantics or PlusCal parsing/TLC.
- Test assertion+patch009 commit `1d2e8fd58747498929aa5eb58b54a61cf64e25fe`: regression39054455547 SUCCESS, cases1–47 in inline and split; version39054455494 SUCCESS. Case47's geometry/local-state and separately checked ID assertions now both pass. No production change was needed after the initial failure.
- Later result-only documentation is not the executed implementation/test HEAD. All application/Source/pseudocode/parser/checker/test/build/TLC execution remains off the local machine. Git diff whitespace and isolated-index reverse-patch checks are file-integrity checks only.

## Whole-goal audit / next work

The objective is direct implementation of all current pseudocode behavior, physical flattening only, Source-first ambiguity resolution, and policy-compliant records/verification. The table above covers only creation/grid resize. It does not cover the remaining merge/split, graph and asset mutations/queries, positional reconciliation, lifecycle/public API result parity, supplied-projection renderer and export geometry/resource handling, or whole integration/legacy removal. Existing green47 and structural163/87 coverage are not substitutes for those missing owner/branch audits. Therefore the active goal remains incomplete; do not mark it complete or mark code current.
