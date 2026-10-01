# system

## System invariants

AUTHORITATIVE_STATE_RULE

1. Treat `activeProject` ProjectObject state as the only persistent project authority.
2. Persistent mutation enters through a declared FastFigureApi command or appFSM mutation path.
3. Renderer snapshots and UI-local values are projections or drafts, never alternate project authorities.

RUNTIME_STATE_RULE

1. Keep session selection, zoom/drag state, and telemetry outside persistent project state.
2. Resolve the selected chart each time through:
   `selectedSlotId -> slot.chart -> chart collection`.
3. Do not maintain a separate global `editing` authority.

PROJECT_PURPOSE_INVARIANTS

1. Support a slot-based scientific figure draft workspace.
2. Keep ordinary loaded-data/image processing local to the browser.
3. Keep core open/edit/export independent of server, account, or mandatory network connection.
4. Produce a single-file portable runtime with core runtime dependencies included.
5. Make ProjectObject/FFPX represent complete persistent figure state.
6. Keep session-only UI/runtime state out of persistence.
7. Store copied asset bytes so reopening does not depend on original filesystem paths.
8. Keep interchange responsibilities separate:
   Plotly JSON = one graph figure,
   FFSX = one graph slot + referenced CSV + slot-local caption,
   FFPX = complete project.

## initializeFastFigure

PROCEDURE initializeFastFigure

1. Build a project candidate with `createProjectState`.
2. Validate the candidate project.
3. Verify required renderer hosts and core runtime dependencies.
4. Prepare dashboard zoom projection and slot interaction controller.
5. Render the slots already owned by the project; do not recreate domain slots in startup.
6. Apply slot style and dashboard geometry.
7. Transition appFSM to ready and synchronize workspace/overlay runtime state.
8. Expose FastFigureApi as the frontend mutation boundary.
9. Mount the Mantine frontend into the existing React root.
10. Do not create default CSV or fake graph objects.
11. Audit project references and runtime selection invariants.
12. Return the initialized runtime.
