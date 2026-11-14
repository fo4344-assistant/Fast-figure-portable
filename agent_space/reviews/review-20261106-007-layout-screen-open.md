# Layout screen caller translation — r135 / OPEN

## Authority and bounded scope

Plan024 stage1: translate geometry/style/zoom callers into the supplied screen renderer. Source r45 and PlusCal r25 are unchanged. This is not a layout Backend redesign, preview algorithm change, capture/export change, or stage3 freshness expansion.

- `sourcescript/application/public_api/layout_annotations.py`: layout style/grid commands commit in Backend, reject without success rendering, then read current layout; zoom/lock/reset belong solely to Frontend session; completion is one notification, not a second commit.
- `pseudocode/application/public_api/layout_annotations.pcal`: corresponding style/grid, session-only zoom, first-lock measurement, single reset and completion procedures.
- `sourcescript/frontend/renderer.py`: `renderDashboard(projectProjection, interfaceState)` steps1/6/7 require supplied width/reference geometry, graph/image/label/caption representation, and current-host resizing after content/style/geometry. Locked width survives reference changes. Renderer never reconstructs Project values from DOM.

## Confirmed gap and implementation

The actual Mantine layout callers already invoke public setStyle/setGrid/setZoom/commitZoom/setZoomLocked/resetZoom. Previously style, live zoom, lock/unlock and reset stopped at CSS geometry/resize utilities. They did not pass the new scale to graph figures, labels and captions. Only zoom completion performed a full render; lock/reset have no separate completion render. Under a fixed width, changing referenceWidth therefore also left content at its previous scale. This is a missing ownership connection, not a request for visual polishing.

| Procedure / actual entry | Implemented caller boundary |
| --- | --- |
| Mantine commitStyle -> public setLayoutApiStyle | On committed LAYOUT_STYLE_CHANGED, existing committed-projection boundary reads current authority/final session and invokes supplied invalidation, whose non-narrow branch performs full presentation. Retains one existing layout notification. Rejection returns False before presentation. |
| Mantine changeGrid -> public setLayoutApiGrid | Uses the same committed-projection boundary, replacing full-render plus redundant separate style/resize calls; retains existing notification and fresh public return. No preview/candidate is fed back into Backend. |
| Mantine changeZoom -> public setLayoutApiZoom | Session event first; actual revision change invokes existing fresh supplied dashboard entry immediately, updating all content scale, not only CSS width. Same value/locked no-op still returns fresh layout without repaint. |
| Mantine zoom lock/reset buttons -> public methods | First lock still measures once; invalid width returns unchanged False. Accepted changed state renders current supplied content; repeated lock/reset/no-op does not repaint. No additional Project command or width authority. |
| Mantine completion -> commitLayoutApiZoom | Only existing DASHBOARD_ZOOM_CHANGED notification plus fresh read. Removes delayed full render now owned by the actual change; no second saved value or presentation commit. |

The before/after revision comparison is a call-local Frontend transition receipt, not a cached view or new authority. Rendering uses the existing Application entry's fresh Backend projection and current final Frontend state. No geometry snapshots, width caches, shared refresh registry, or secondary figure computation were added. Existing renderer generation/instance guards and its resize ownership remain in force.

## Evidence and limits

Existing browser cases45/46 only were adapted: style success reaches full renderer; rejection preserves generation/state; live zoom changes real caption scale; same zoom does not repaint; unlock/reset restore content scale; completion notifies once without a second render. Test45's rejected-command check now observes actual generation instead of replacing three obsolete CSS helper calls. No new test IDs or suites (167 authored cases remain).

No application, test, build, checker, Actions or TLC execution occurred. `git diff --check` and patch reverse-applicability are static file checks only. Prior r133 Actions results do not validate r134/r135.

Code metadata r135 remains stale. Static canonical-LF git-blob calculation first reproduced r134 `sha256:6e197059a9c6a006fef7a252b386f49708694a05dc29be9f5e77389dddf4b256`, then calculated r135 `sha256:29c5e333e63d5d7a64b0b145c543053b04eb26bf5b8387241ecd4428bbf94091`. This is not an official version-checker pass; version completion remains pending authorized Actions. Source45/PlusCal25/verification26 and existing lineage are unchanged; working-tree line endings were not normalized.

Stage1 as a whole is not closed. Remaining procedure/caller correspondence, including controller interactions and narrow effects, must be finished before stage2 capture/resource lifetime. No whole-stage audit or integration success is claimed.
