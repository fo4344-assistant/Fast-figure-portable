# Source Script → PlusCal

## Active translation

The active hierarchical `**/*.pcal` files are the language-neutral translation of Source Script. `development-versions.json` records authoritative revisions, fingerprints, Source lineage and translation reviews; this README explains the directory, not version or work status.

Hierarchy follows Source: `system`, `backend`, `application/adapter`, the single logical `application/public_api` boundary, `frontend`, and `portable_build`. Backend settings are read from `sourcescript/backend/settings.json`, never copied into a Frontend configuration authority.

## Notation and composition

These files are language-neutral PlusCal algorithm notation, not independently runnable TLA+ verification models. `procedure`, explicit branch/loop/assignment/call, and record/sequence operations preserve Source inputs, outputs, ordering and ownership. The root `system.pcal` enters `initializeFastFigure`; other owners declare procedures for that composition rather than independently initializing Project/session state.

- Source `None` is `NoValue`; a missing record field is distinct and tested with `HasField`. `Missing` identifies a missing table cell. Source zero-based object/column indices use `sequence[index + 1]` explicitly; grid row/column are one-based while slot IDs start at zero.
- `result` is the **call-local return channel**, not a persistent shared store. Returned internal adapter tuples do not become public API results. Locals, private expansion parameters and `args` at API bindings are notation for Source function arguments/call frames, not additional public schemas or authorities.
- Class method names use `Class_method`. Identically named Source functions receive an owner qualifier (`ApplicationAdapter_`, `MantineUi_`, `BackendAnnotations_`, `ApplicationApi_`, `Renderer_`). Private `...InAttempt`/`...InRead` procedures expand the same Source operation with its already captured authority/candidate; they do not add a public parameter or reload live state.
- `activeProject` is the existing Backend binding. A captured authority reference is not a new persistent transaction token. The freshness check, validation and replacement in the final commit section have no yield between them. An awaited import recalculates against current authority; completed UI plans are revalidated, never authoritative candidates.
- `Require` rejects/throws before commit; uncommitted commands preserve Project and skip success reads/reconciliation. Original exceptions propagate. A later read/render/handoff failure does not secretly undo an already committed Project. Callback/await/try-finally notation preserves Source's exactly-once task and cleanup ordering.

## Deferred primitives, not deferred domain decisions

Target-platform primitives remain abstract: scalar conversion with invalid/finite results (conversion exceptions propagate), integer/finite arithmetic, sequence/record lookup/copy/field operations, text/UTF-8/base64, XML tree construction/parsing/escaping, ZIP STORE directory/CRC and copied-byte access, time, DOM measurement/events/painting, Plotly host lifecycle, browser download handoff, and file output. Pure schema predicates and field selectors mean the **explicit fields/ranges/relations in the corresponding Source contract**, not permission to invent a candidate builder or fallback behavior.

Domain algorithms are expanded in their owning files: VFS collision/replace planning, package document splitting/reassembly and ID remapping, missing-only normalization, current-candidate asset/chart construction, graph numeric transforms/selection/layout, original-position cascade maps, grid/merge/split, caption ranges/wrapping/geometry, projection-effect calculation, all public routes/results and lifecycle/resource cleanup. The spelling of current package documents and the zero-based identity rules are explicitly bound in the corresponding Source Script; compatibility code is not an alternate authority.

## Verification scope

`Pseudocode fidelity coverage` runs only in GitHub Actions. It checks the cumulative development-layer metadata/patch gate and produces a Source-entry/input trace, owner/file correspondence, all public API keys, explicit wrapper branches, event vocabulary and bound explicit procedure calls. These are static structural checks, **not** behavioral tests, a PlusCal parser, or semantic/TLC proof.

The separate translation review records the semantic assessment of state/branch/input-result/commit/failure/resource preservation and the Source corrections. A green structural check alone cannot establish translation completion. See `agent_space/reviews/review-20261017-002-pseudocode-r12-translation.md` and its linked Source closure review for that evidence and actual execution status.
