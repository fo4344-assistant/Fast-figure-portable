# Supplied-input screen translation — bounded review (r119)

Status: stage1 active/incomplete; Source45 and PlusCal25 unchanged. No full translation/current claim.

## Prompt → artifact → actual evidence

- Supplied immutable screen input: application/adapter.js renderDashboard reads the official Backend projection and interface state once for presentation; frontend/renderer.js renderDashboardProjection consumes visibleSlots/figure/imageView/orderedSlotLabels/annotations, not activeProject, chartFigure, getChart or slotAt.
- Screen responsibility: style/zoom/palette/caption wrappers and domain command handling moved to Application. Import routes updated in system and all four public API modules; renderer no longer imports Application/interface FSM/Project state.
- Slot interactions: Application supplies selection/swap callbacks; controller uses DOM presentation facts only and passes intent to public APIs. The authoritative selection result is returned by setSelectedSlot.
- Async presentation: graphInstances holds only host/slot/chart/generation/queued completion identity. Work on one Plotly host is serialized; stale queued work skips rendering, stale completion cannot install listeners/resize, retyped/removed host detaches before purge. Original current render rejection is available through completion; telemetry cannot replace it.
- Supplied images use copied pure data URLs and per-surface native decode records. Replacement detaches element before releasing src. Stale completion cannot revive or delete the new surface; current failure removes only its failed surface and propagates the original failure. This code path is not yet runtime-verified.
- Cases151–153 added to browser-regression.js: forbid domain reads/recalculation/allocation during supplied screen presentation; assert source/authority unchanged and exact supplied labels/figure; defer a graph, replace it with an image, settle old work, assert no resurrection/current-image removal; mock native decode to check old rejection suppression and original current-error/failed-surface cleanup.
- Actual checks: node syntax-only checks for all runtime modules and browser probe; git diff --check; static authored-case ID scan1–153 without gaps/duplicates; Git-filtered canonical source-code fingerprint calculated, not version-checker acceptance. Initial ID scan used Windows cp949 and raised UnicodeDecodeError; rerun explicitly used UTF-8. No runtime/test/build/checker/Actions/TLC run and no new pass count. Test authoring is not execution.
- Existing print/module/r117/r118 work and numeric patches001–004 preserved; no commit/push/dist or upper-layer edits.

## Coverage still missing / next action

1. Implement applyDashboardProjectionInvalidation targeted caption/label/palette/image-setting branches while preserving existing live host identities. Audit actual dispatch consumers against Source/PlusCal ordering; the current Application compatibility wrappers are not proof of the full supplied-action surface.
2. Image decode success/failure/stale completion code and authored case153 now exist; case153 also checks two simultaneous surfaces of the same input and one-surface failure without sibling revocation; permitted execution verification remains pending.
3. Audit every screen startup/helper/caller and old test fixture against new owner routes, including graph relayout and selection result semantics. Run no local app/test/build/checker under Plan023; authorized Actions evidence remains pending.
4. Only after stage1 completion audit register stage2. Current capture lifetime, debug/utility ownership and remaining Backend/Application/UI procedures still belong to later goals.

Scope is a coherent screen-core cutover, not a full goal close. Broader missing procedure coverage and unexecuted evidence are explicitly uncertain.
