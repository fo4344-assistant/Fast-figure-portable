# Supplied screen integration fixtures — stage1 open

## Scope and actual changes

Source45 / PlusCal25 semantics remain authoritative and unchanged. Runtime stays code121/stale; this unit changes tests/documentation only, so its declared runtime path fingerprint and lineage must not be advanced artificially.

- `sourcescript/frontend/renderer.py` / `pseudocode/frontend/renderer.pcal` supplied invalidation and Application query boundary map to `sourcecode/application/adapter.js:applyCommittedDashboardProjection` and `sourcecode/frontend/renderer.js:applyDashboardProjectionInvalidation`.
- Browser fixtures97/98 now intercept the actual invalidation entry instead of obsolete `syncSlotImageElement`.97 asserts the actual committed result, immutable supplied image bytes, explicit target and final independent selection.98 retains retry, noncommit, precommit error, late return-query error and late renderer-error/no-rollback checks.
- Fixtures101/102 observe committed caption visibility invalidation, not the obsolete full-render wrapper.101 names its counter invalidations (not paints), while preserving exactly three supplied caption synchronizations, four commits/reads/notices and all unowned-state assertions. Name/bold/settings caption procedures still use their specific copied-caption sync contract; text/insertion fixtures103–106 are deliberately unchanged.
- Fixtures107–109 and112/113 intercept `renderDashboardProjection`, the actual full supplied fallback entry, rather than `renderDashboard`. Existing actual-commit, reference removal, empty/path-only no-repaint, retry, noncommit and late-error assertions remain. These are full-entry observations, not proof that Plotly/image/DOM work succeeds.
- New156 directly observes Application committed-only projection plumbing: noncommit performs no query/invalidation; every committed attempt obtains exactly one fresh official immutable renderer read; the exact read and mutation result plus final interface/action bridge reach invalidation; late query/invalidation exceptions retain original identity without rolling back committed authority.
-154 remains the separate concrete renderer-level identity/no-domain-read/narrow/full-fallback check.155 covers winning-source commit facts.156 and the migrated mocks do not replace154 or the rest of the suite.

## Verification actually performed

- `node --check agent_space/tests/browser-regression.js`: syntax accepted, no application/test execution.
- `git diff --check`: accepted (existing LF/CRLF normalization warnings are not runtime evidence).
- Static text inspection: authored case IDs1–156 are unique/complete; nine migrated fixtures contain no old full-wrapper/image-sync spy. An initial too-strong ascending-order assertion failed because established setup cases15–18 precede1; corrected to unique/complete without reordering tests. An output-only cp949 Unicode encoding failure was corrected by UTF-8 environment, not by changing assertions.
- The new156 action assertion was checked against the actual adapter bridge (`refreshDashboard`, `graphRangesChanged`), not an invented selection callback.
- Browser, application, build, checker, Actions and TLC execution remain **pending/not run**. No commit/push/delegation/policy/Source/PlusCal/dist changes.

## Prompt-to-artifact completion checklist

| Explicit requirement | Evidence / status |
|---|---|
| Supplied screen procedures in named Source/PlusCal/JS renderer | Existing119–121 implementation and reviews005–007; full procedure-by-procedure completion audit still OPEN. |
| Application official immutable task-local read, final interface/actions | adapter actual code; migrated97/101 and authored156 cover exact handoff; execution pending. |
| Renderer no persistent-domain reread/write/recalculation | authored151/154 and supplied entry inspection; all helper/caller reachability audit still OPEN. |
| adapter/interface_fsm/mantine_ui/system coherent callers | Existing changes/review007 inspection; exhaustive current cross-file call checklist still OPEN. |
| Ownership/lifetime and original failures | Existing151–155, migrated98/102/108/113 and156; browser execution pending, capture belongs to stage2. |
| Preserve existing WIP, HEAD, patches001–007, evidence/user files | Only selected test fixture/document additions; no reset/checkout/commit/push/cleanup;008 is a new cumulative patch pair. |
| Plan/review/tests, dated patch and lineage | plan023 bounded unit68, tests/tests.md, this review and patch008; runtime121/stale fingerprint unchanged because runtime paths are unchanged. |
| Actions-only execution / explicit authorization | Only local text edits and allowed static syntax/whitespace/text/hash inspection; no application/test/build/checker/Actions launch. |
| Stage1 completion and automatic transition to stage2 | NOT achieved; no update_goal or next-goal registration. Full procedure/caller/ownership audit remains before any completion claim. Execution absence is recorded separately, not used to prohibit further implementation. |

## Next concrete work

Build the missing current Source/PlusCal screen-procedure → JS entry/helper → production caller → regression coverage map (including style/zoom/caption/palette/selection/controller/resize paths). Fix the first actual missing or domain-reading screen procedure identified, without broadening caption contracts or taking stage2 capture cleanup as proof of stage1 completion. Audit legacy fixtures beyond these nine against that map. Do not mistake authored156 or static checks for suite readiness or runtime success.
