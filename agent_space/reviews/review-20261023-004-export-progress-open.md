# Code r118 — export progress/result separation (open)

## Authority and bounded continuation

User requested continuing translation. Source45/PlusCal25 are unchanged. `sourcescript/frontend/renderer.py:398` (`renderDashboardTarget`) step10 explicitly makes statusSink progress, not result/cancel authority, and forbids rollback of handed-off files. `sourcescript/frontend/renderer.py:440` (`renderDashboardCurrent`) adopts the same completion/error rules. `pseudocode/frontend/renderer.pcal:384` and `pseudocode/frontend/renderer.pcal:441` derive the outcome from geometry and actual capture/encode/handoff, not callback return values. This unit fills the progress-only/post-handoff reporting gap left in r117; it does not define cleanup-only or async callback semantics.

## Implementation

In `sourcecode/frontend/renderer.js`, both operation-local progress setters catch synchronous callback throws. Start progress cannot cancel a render; rejection reporting cannot replace a rejected outcome; completion reporting cannot turn a completed handoff into failure. Each success debug telemetry call is also isolated. r117's preservation of an existing operation failure remains unchanged. No retries, rollback, persistence, secondary state/service or new exported API. Callback return values remain ignored; no async sink protocol is invented.

Actual geometry/limit, Plotly, image, encoding, download and cleanup-only errors retain their prior behavior. This is not a broad suppression of operation errors. The existing operation-local setters are reused instead of adding a generic task manager or requiring every caller to provide infallible callbacks.

## Authored regression checks (not executed)

147 target and149 current retain their prior snapshot/error/ownership checks, and additionally:

- A throwing start status sink must not prevent render/encoding/handoff.
- Throwing completion status and success debug telemetry must leave saved dimensions/outcome intact, with exactly one handoff for that operation and no failure-status projection.
- Throwing target raster-limit status must preserve rejected/raster-limit and not start raster/handoff.
- Throwing current empty-viewport status must preserve rejected/grid-geometry and not hand off output.
- Input snapshot and Project/Frontend authority remain unchanged.

Error/null/undefined throws are represented across status/debug paths. Test stubs are restored in finally. Total suite count stays150.

## Actual checks and limitations

Changed renderer/probe `node --check` and `git diff --check` passed. Static probe-ID coverage check found150 unique IDs covering1–150; this is not suite execution. Code fingerprint was recalculated using Git-filtered blobs, not by executing/accepting the version checker. Source code revision118 remains stale, derived from Source45/PlusCal25. No local application/test/build/checker, Actions or TLC was run this unit, per Plan023. No commit/push/committed-dist change. Old149/149 supplemental results do not verify r118.

The full supplied-input screen renderer cutover, current live Plotly handle lifetime/image/label/caption paths, cleanup-only meaning beyond unchanged behavior, and authorized integration/version verification remain open. This bounded review does not replace them or create a new full-audit prerequisite.
