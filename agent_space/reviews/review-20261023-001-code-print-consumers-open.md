# Print consumer translation — WIP / OPEN

Baseline: d7aa9e2972c83ba745ab4aaebead5c44b4251d87. Source Script45 / PlusCal25 unchanged. Source-code115 remains stale; this record is not validation success or whole-plan completion.

## Implementation correspondence

- sourcescript/application/public_api/layout_annotations.py print save/capture and sourcescript/frontend/renderer.py renderDashboardTarget/renderDashboardCurrent; corresponding pseudocode/application/public_api/layout_annotations.pcal and pseudocode/frontend/renderer.pcal remain the authorities.
- Existing uncommitted save work is included in this change: savePrintApi obtains one immutable print.save Backend export query and passes snapshot/statusSink to target rendering. Numeric graph figures, image data, ordered labels, palette and export settings come from this input rather than live Backend/DOM configuration. Figure scaling operates on a copy. Raster handoff uses downloadExportPayload.
- capturePrintApi now obtains one print.capture export snapshot. exportDashboard consumes that snapshot's settings/content and current Frontend viewport presentation. It measures dashboard/label/slot rectangles before asynchronous work; current dimensions are rounded without writing target export presets. Label strings and image content/settings use supplied projections, not DOM content or slotAt/current Project reads.
- Current raster limits are checked before encoding/download. Current capture returns saved rounded width/height/automaticHeight:false, uses supplied dpi/format, and hands the Blob to downloadExportPayload. Existing displayed Plotly handles remain Frontend capture inputs; current capture is not target re-rendering.

## Added/updated tests (authored, NOT executed)

- 52: exercise target renderer through supplied snapshot, preserve pixel/DPI/geometry rejection assertions.
- 147: one official save snapshot, authority replaced after capture, precomputed figure/no live numeric recalculation, immutable input and one handoff.
- 148: supplied-figure presentation scaling, success/render-failure/cleanup-only host removal. Does NOT cover simultaneous render and cleanup failure; cleanup-only expected rejection remains subject to the recorded contract check.
- 149: one official capture snapshot/status forwarding, one-shot fractional viewport rounded to321x123, output uses supplied144 DPI/JPEG rather than live settings or987x654 target, no Project/Frontend/input mutation, supplied raster rejection before download, original encoding rejection.

## Verification and limits

Only repository inspection, diff whitespace checking and metadata fingerprint preparation were performed. No application, browser regression, build or version checker was executed locally. No Actions dispatch, commit or push was performed. Thus all new runtime assertions and source-code115 version-check acceptance are PENDING; generated dist is unchanged.

The source-code fingerprint is prepared from Git-filtered blob hashes for the four declared paths; this is NOT execution of scripts/check-development-layer-versions.py. Attempts to use available python/python3 only for metadata preparation failed (python was Python2 without pathlib; python3 exited49), so shell Git hashes/sha256sum were used instead.

Known unresolved issues are explicitly tracked in agent_space/memo/20261023-001.md: original failure masking by purge, cleanup-only result semantics, status failure masking, asynchronous current-surface handle lifetime and remaining capture parity. The user requested that general-principle checks be memoed rather than used to pause implementation. These are not silently approved or closed. Full supplied-input screen renderer and wider Plan023 translation remain open; do not infer full conformance from this bounded code change.
