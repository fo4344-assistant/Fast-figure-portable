# r120 — supplied narrow screen projection (stage1 open)

## Requirement → implementation → inspection

- Source frontend/renderer.py applyDashboardProjectionInvalidation and PlusCal ActualRemovedRenderedReferenceFirst: new renderer entry consumes event, immutable mutation result, final interface state and official projection explicitly. Supplied referencesRemoved takes precedence; pathOnly alone is NONE. Identity mismatch/unsupported event falls back to full rendering with the same supplied inputs/actions.
- Caption/label/image-setting narrow branches: caption updates supplied text/settings; labels use supplied ordered displayLabel; image fit/manual geometry updates the existing surface element. No Project query, domain figure/label recomputation, Backend command or FSM transition inside these branches.
- Host guard: match every visible host, live graph slot/chart and live image URL identity before narrow effects. Invalid/removed host forces FULL_DASHBOARD. Narrow updates preserve render generation, graph instances, image elements and their pending lifetimes.
- Application boundary: adapter.applyCommittedDashboardProjection gates committed, reads official fresh renderer projection/final state, supplies callbacks shared with full rendering. Caption visibility, label visibility/settings/position/reset and image settings public owners now call it after reconciliation. Other caption wrappers already use fresh supplied caption reads; whole wrapper audit remains required.
- Authored case154 stubs domain query to throw inside pure renderer, checks exact supplied label/manual-image geometry, unchanged graph/image identities/generation/Plotly calls, path-only NONE and missing-host full fallback. Case153 additionally covers two simultaneous same-input image surfaces and one failure without sibling revocation (authored in previous bounded unit).

## Concrete checks / not executed

Syntax-only node checks for all runtime modules and browser probe; git whitespace check; static ID scan1–154. These do not execute app/tests/build/checker. No Actions/commit/push/delegation/TLC/policy/upper-layer/dist changes. Source45 > PlusCal25 unchanged, code120 stale; canonical filtered fingerprint recorded, checker acceptance pending.

## Completion audit: stage1 NOT complete

- APPEARANCE_CHANGED still falls back FULL rather than the required identity-preserving narrow palette/graph presentation path.
- Backend actual commit projectionEffect facts (referencesRemoved/pathOnly) are specified upstream but absent from current mutation results/reconciliation. The new renderer correctly consumes explicit supplied facts, but synthetic case154 is NOT proof of real end-to-end facts. Translate the actual winning-source commit delta, including retry/current-authority behavior, before claiming contract completion. Do not compute guessed facts from an Application event cache.
- Audit remaining annotation wrappers, startup/resize/selection/relayout/file-drop and old regression fixtures for the changed owner surface.
- All new153/154 runtime behavior and prior151/152 remain unexecuted; authorized Actions are pending, not a reason to discard implementation or start a new goal early.
- Source/PlusCal procedure-to-code/test full checklist, stage2 capture/lifetime, stage3 remaining owners and stage4 integration/lineage remain open.

Existing uncommitted print/module/r117–119 and evidence preserved. Numeric006 is cumulative from original HEAD, not incremental over001–005.
