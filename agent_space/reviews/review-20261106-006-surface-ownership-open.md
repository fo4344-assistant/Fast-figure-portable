# r134 — supplied screen surface ownership (OPEN)

2026-11-06. plan024 §3, stage1. Source45 → PlusCal25 → code134/stale. This is implementation of existing screen lifetime branches, not capture/export or general API work.

## Authority and actual paths

- `sourcescript/frontend/renderer.py:126–162`, renderDashboard steps7–8: same live host/slot/chart association, generation-checked graph completion/resize; image decode input and surface ownership, discard stale completion and release only owned resources.
- `pseudocode/frontend/renderer.pcal`, renderDashboard / CompleteGraphRender / CompleteImageRender: purge replaced associations; SameLiveGraphHostSlotChart / SameCurrentImageSurfaceInput; obsolete completion cannot revive a view.
- Production callers: Application `renderDashboard` / `updateGraphView` / `applyCommittedDashboardProjection` → supplied renderer functions; public selection/drop and mutation wrappers reach these boundaries. No Backend query, FSM command, new mirrored state or current projection cache added in renderer.

## Gap and translation

The existing implementation checked document connectivity but not child ownership. A graph plot could disappear while its slot host remained connected: workspace/narrow code fell back to full render, but full render retained the broken graph record. A child moved under another live host could also pass connectivity checks, allowing stale graph callbacks/resize or image settings to reach the wrong surface. A detached image frame whose decode settled without another render retained its source and association.

| Source branch | Implementation and ownership |
| --- | --- |
| Same graph host/slot/chart | `hasLiveGraphSurface`, latest operation/generation and captured slot/chart guards in presentation completion/callbacks; same predicate in resize, workspace, narrow invalidation and full-render replacement |
| Replacement/full fallback | Invalid child-host association discards prior graph record, removes owned host and plot, purges old instance; queued old operation cannot revive it |
| Same image host/input | `hasLiveImageSurface` checks containment as well as connection; workspace/narrow fallback rebuilds invalid associations |
| Obsolete image success/failure | `releaseImageSurface` removes only that surface's element/src and deletes its map entry only if still identical; used at replacement, stale predecode/settlement and current failure |
| Current decode failure | Original error still rejects; obsolete failure is discarded and cannot remove a newer surface or sibling image |
| Geometry-triggered resize | Existing generation/operation/slot/chart/host/plot identity guards retained; additionally reject a connected plot outside its owning host |

No speculative freeze, general freshness layer or new resource service. Pure copied image URLs remain unchanged. Existing graph serialization, current failure propagation, image settings and graph figure calculations are not redesigned.

## Evidence and limits

Existing cases153/154/158/164 are adapted, no new IDs (167 remain). Cover orphaned image decode success/failure, missing graph child fallback, connected child reparenting, stale callback and resize rejection, replacement cleanup. These assertions are authored, NOT executed for r134.

Static file/diff/hash operations only. Canonical LF fingerprint calculation reproduced r133 `sha256:3b7606514153b8193aa84fbe069a4d1531270264326b8d6bb20c111180f09eb9`, then produced code134 `sha256:6e197059a9c6a006fef7a252b386f49708694a05dc29be9f5e77389dddf4b256`. This is not the official version checker; no working-tree line-ending normalization. Prior Actions on d8ac43924660080e575c5fd68bee9088b4f96c2b passed r133, not r134.

No local application/test/build/checker, Actions, remote writes, commit/push or TLC this unit. Source/PlusCal/verification lineage and stale status preserved. Official checker and native Plotly/decode/mounted inline/split execution remain pending. This bounded unit does not close all stage1 screen procedures, later capture lifetime, remaining owners or integration. Geometry content scaling and remaining screen/controller caller correspondence still need their own Source-based determination; no defect claim from unexecuted speculation.
