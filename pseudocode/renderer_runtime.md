# renderer_runtime

## Source identifiers

- `RENDERER_HOSTS`: required dashboard/graph/image/status host surfaces.
- `uiTelemetryState`: one-way UI telemetry projection.
- `debugEnabled`: session debug authority.
- `RENDERER_RULE`: renderer/DOM/Plotly state is projection, not project authority.

## Renderer rule

Renderer hosts, DOM state, Plotly instances and telemetry are projections/runtime state.
They do not become persistent project authority.

## publishUiTelemetry

INPUT patch

1. Merge allowed telemetry fields into UI telemetry projection.
2. Publish to subscribers/debug UI.
3. Do not use telemetry as mutation input for project state.

## setDebugEnabled

INPUT enabled

1. Change session debug authority.
2. Publish one-way telemetry projection.
3. Do not persist in project.

## status

INPUT message

1. Update status projection/telemetry.
2. Do not mutate project.

## renderDashboard

1. Read current project layout/slots.
2. Compute dashboard geometry.
3. For each visible slot:
   a. render chart from current chart projection; or
   b. render image using asset bytes + that slot's imageSettings.
4. Render labels/global caption/slot UI projections from current authority.
5. Apply slot geometry/style.
6. Keep Plotly/DOM objects as disposable renderer state.
7. Do not write renderer-derived values back as project authority.

## setSelectedSlot

INPUT slotId, direction

1. Resolve slot id in current project.
2. Apply selection through appFSM selection action.
3. Update workspace projection.
4. Resolve selected chart on demand.
5. Return selection.

## installSlotClickController

1. Attach one interaction controller to renderer host.
2. Convert click/drag intent into public selection/swap/drop commands.
3. Do not directly edit project model from DOM state.

## swapSlotContents

INPUT source, target

1. Resolve source/target current slots.
2. Request SLOTS_SWAPPED mutation.
3. Keep layout position geometry fixed.
4. Exchange complete slot-local payload:
   chart, imageId, contentType, imageSettings, caption.
5. Re-render from committed project.

## prepareDashboardFileDrop

INPUT slotId

1. Resolve target slot.
2. Set only runtime drop target/selection intent.
3. Determine acceptable file kind through public calculation.
4. Return drop plan/projection.
5. Domain import occurs later through import command.

## applySlotStyle

INPUT notify flag

1. Read project slotStyle.
2. Project border/gap/margin/radius/reference geometry to renderer hosts.
3. Request resize/re-render as needed.
4. If requested, notify UI from committed state.
5. Do not store renderer measurements as persistent layout meaning.

## resolveSelectedChart

1. Read selectedSlotId.
2. Resolve current slot.
3. Read slot.chart.
4. Resolve chart in activeProject.
5. Return chart or none.
6. Do not cache as global editing pointer.

## updateGraphView

1. Re-resolve selected slot and current project model.
2. Choose graph/image workspace projection from contentType and references.
3. Discard stale UI buffer as read authority.
4. Return/update projection.

## startupCoreRuntime

1. Require valid ProjectObject already containing slots.
2. Apply dashboard zoom runtime projection.
3. Install slot click/drop controller.
4. Render existing project slots.
5. Apply slot style.
6. Transition appFSM to ready.
7. Audit project/reference/runtime invariants.
8. Do not create default CSV or recreate project grid slots.
9. Return ready runtime.
