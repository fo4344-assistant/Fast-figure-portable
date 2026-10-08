# Review 20261008-001 — Source Script r13 logical structure

## Scope and authority
Read the nine Source Script modules on fix/gui-fsm-20261008-review and compare the r13 selection additions against the v0.2.6 policy, the project's slot-local ownership rules and the public API contracts. The legacy r12 closure report is background evidence only; this is not a new r13 closure declaration.

## 1. Logical completeness — NOT CLOSED
- The selection reference split is sound: appFSM assetSelection/assetPath expresses the current CSV/image selection, while graphObject.csvId is the durable CSV reference of an existing chart object. The graph-object x/y edit columns resolve through its own csvId.
- Selection order is specified in application_fsm.SELECTION_COMMAND_ORDER, but its application is still described across sourcescript/graphs.py, api_ui.py and frontend adapters rather than in one complete failure-aware algorithm. In particular, validate object-index and referenced CSV before changing the selected asset, and define what happens if either lookup fails.
- connectToSlot's public input contract is path/kind/slotId and slot resolution precedes mutation. The asset connection must stay a controlled slot-local candidate commit.
- Source Script has no closed r13 review documenting these cross-module decisions.

## 2. Purpose compliance — PARTIAL
- ProjectObject remains the single persistent authority, slot-local chart/image/imageSettings/caption stay with each slot, and graph/image renderers read that authority.
- renderer_runtime.installSlotClickController still states that slot background/tab clicks trigger selection. The user has clarified that the small top-left bookmark is the intended selection/unselection and slot movement control, separated from interaction with the graph surface. The exact existing click/drag event ownership requires reconciliation in the Source Script, without inventing a new UI state.
- system.UNRESOLVED_REVIEW_ITEMS is an empty list despite the above open decisions.

## 3. Duplicate responsibility / decomposition — PARTIAL
- project_state: authoritative state, identifiers and references; application_fsm: transitions and mutation coordination; assets_files: VFS, assets and package format; graphs: data/chart transformation; layout_annotations_export: layout/annotation/export; api_ui: public command/UI boundary; renderer_runtime: presentation and pointer interaction; portable_build: packaging. No new authoritative project store is justified.
- Application FSM and domain modules both describe mutation actions. This is acceptable if the FSM owns the transition gate and the domain module owns candidate computations; the ownership split and data flow must be stated per operation rather than duplicating validation/commit responsibility.
- api_ui and renderer_runtime both describe file drop handling. The Source Script states the former owns external file DataTransfer and collision UI while the latter owns dashboard target/selection interaction. Confirm this division through an explicit call sequence.
- system.SOURCE_SCRIPT_MODULES is a flat responsibility index, not a demonstrated semantic parent-child Module decomposition hierarchy. A flat sibling structure may be valid; do not invent hierarchical parents without a meaning-inclusion rationale.

## 4. Reference and ownership path
- Persistent references: slot.chart -> one owned chart; slot.imageId -> project image; graphObject.csvId -> project CSV. selectedSlotId and assetPath are runtime only.
- assetPath must remain a resolvable VFS path, not a numeric csvId. Multiple render projections do not form second authoritative state.
- Slot swapping exchanges local payload, not layout geometry. The top-left bookmark must be kept out of Plotly graph surface interactions.

## 5. Closure verdict
NOT CLOSED for Source Script r13. The module breakdown is broadly coherent, but the selection/slot interaction contracts and failure-aware command sequence require clarification and a full three-part closure review before an authoritative pseudocode translation may be marked complete.

## 6. Explicitly untested
This is a structural Source Script review, not TLC, browser parity, full semantic execution proof, or current artifact regression. No production file was modified.
