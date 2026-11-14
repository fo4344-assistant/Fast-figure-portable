# Selection caller resize ownership — r136 / stage1 OPEN

Date: 2026-11-12. Source45/PlusCal25 unchanged. Existing uncommitted WIP retained.

## Requirement and actual path

- `sourcescript/frontend/renderer.py:165-180` requires public selection followed by final-state workspace presentation and resize; `sourcescript/frontend/renderer.py:149-150` restricts delayed resize to its requesting live generation/host/slot/chart.
- `pseudocode/frontend/renderer.pcal:150-158` preserves that order, ending in `RequestResizeOfCurrentWorkspaceHosts()`.
- Mounted click/bookmark controller supplies the public slots.select action. `sourcecode/application/public_api/layout_annotations.js:14` uses `sourcecode/application/adapter.js:93` dispatchSlotSelection and `sourcecode/application/adapter.js:110` updateGraphView, which hands explicit final projection/state to `sourcecode/frontend/renderer.js:507` updateGraphViewProjection.
- The public wrapper previously queued `window.dispatchEvent(new Event("resize"))`. Its later callback did not retain a requesting lifetime and could feed the broad resize observer refresh action with a different current workspace. This bypassed the already implemented renderer resize ownership guard.
- The wrapper now calls `sourcecode/frontend/renderer.js:209` schedulePlotResize immediately after workspace handoff. That captures record/generation/operation/slot/chart/host/plot; `sourcecode/frontend/renderer.js:197` resizePlots rejects obsolete or reparented work. No changes to the real OS/native observer path.
- Rejected selection (null projection) still returns final state without workspace/resize. Current workspace failure still propagates before scheduling. No new authority, cache, state, module or scheduler.

## Coverage and evidence limits

Existing `agent_space/tests/browser-regression.js:7008` case160 now exercises actual setSelectedSlot with controlled final-state handoff, forbids a global event, advances operation before frame delivery, observes no stale resize, permits current resize, and checks rejected selection has no work. Existing scheduler cases for chart/generation/replacement/detach/coalescing remain. All mocks and runtime fields restore in finally. No new IDs or suites; authored coverage is not execution evidence.

Static canonical-LF byte hashing independently reproduced pre-edit r135 `sha256:29c5e333e63d5d7a64b0b145c543053b04eb26bf5b8387241ecd4428bbf94091`; r136 is `sha256:88a9efa34356b8e38b355e8f8b18f1ae7a844f09a80aaac86202cc6f15ec5acc`. Diff/whitespace inspection only. Official checker, tests, browser, build, fidelity and Actions NOT executed. Code status remains stale. No commit/push/delegation/policy/dist edits.

## Remaining work

Stage1 is not closed by this fix. Finish current procedure/caller correspondence for controller and narrow effects, separating known implementation gaps from native Plotly/browser/mounted receiver and inline/split execution pending. Follow plan024 stage order; export lifetime/general API work remains out of this unit.
