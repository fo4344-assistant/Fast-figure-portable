# Source-code r117 — export original-failure preservation (open)

## Translation scope

User requested continuation of Source Script → pseudocode → source-code translation after the module cutover. This unit uses unchanged Source r45 / PlusCal r25 and changes only the Frontend export failure paths plus regression/lineage records. It does not introduce a new export policy or claim whole conformance.

- `sourcescript/frontend/renderer.py:359-370`: download consumes only supplied bytes/entries; encode/handoff failures propagate and only task resources are released after a safe consumption opportunity.
- `sourcescript/frontend/renderer.py:398-459`: target/current render has task-owned cleanup, propagates failures, and status is progress rather than result authority.
- `pseudocode/frontend/renderer.pcal:311-328`: `CaptureOriginalFailureOfOneBrowserHandoff`, `DownloadCleanup`, `PropagateOriginalFailure(completion.failure)`.
- `pseudocode/frontend/renderer.pcal:384-460`: target/current completion survives render/encoding/handoff cleanup; no Project mutation.

## Implementation and bounded checks

`sourcecode/frontend/renderer.js`:

- `exportChartImage(suppliedFigure, width, height, layoutScale, rasterScale)` now tracks whether the operation threw independently of the thrown value, so even `throw null`/`throw undefined` survives a secondary purge/remove failure. Purge and owned host removal are both attempted. Cleanup-only rejection is unchanged, not promoted into a newly declared upper-layer rule.
- `downloadExportPayload(payload)` preserves a handoff failure if URL release also throws. It still revokes only the URL it acquired, once; allocation failure never enters release. Successful handoff still waits for the existing scheduler opportunity before release. No fake disk acknowledgement/cancellation or retry.
- Current and target export error reporting cannot replace an already-existing failure. Only secondary status/debug exceptions on this failure path are suppressed. Successful-handoff status failure and progress-only failure semantics are intentionally not redesigned.

Regression changes in `agent_space/tests/browser-regression.js`:

- 147: target render failure plus failing status and debug sinks preserves exact failure, performs no additional handoff, and leaves authority unchanged.
- 148: render/plot setup failure plus purge failure, including falsey thrown values, preserves exact failure and removes owned host; existing cleanup-only check remains.
- 149: current encoding failure plus failing status sink preserves exact failure and no handoff.
- 150: handoff/revoke dual failures, null/undefined throws, cleanup-only rejection and acquisition failure; asserts only owned URL releases and no repeated handoff.

## Actual verification / limits

`node --check` passed for changed renderer and browser probe; `git diff --check` passed with normal LF→CRLF notices. An additional static numbering assertion initially failed because it assumed historical tests ran in numeric order (the existing probe starts15–18 before1–4). Inspection found150 unique IDs and no missing1–150; the corrected check verifies coverage/uniqueness without reordering historical tests. This was a static-check assumption error, not execution of the browser suite. Environment check directly used `python`: conda `graph_agent`, Python3.12.13. No application, test suite, build, version checker, Actions or TLC was executed in this unit. Plan023's Actions-only execution rule remains in effect; previous r116 local supplemental149/149 results are not evidence for r117. The new150-case suite is pending authorized execution.

Code revision/fingerprint/lineage metadata are prepared, not accepted by a run of the version checker. Code remains stale. No commit/push or generated-dist change. No Source/pseudocode/policy changes. No delegation.

## Still open

Whole supplied-input renderer cutover and legacy cross-layer dependencies; current real graph/image/label capture coverage; cleanup-only semantics beyond the unchanged behavior; progress-only and post-handoff status failure interpretation; full authorized integration/version checks. This is a bounded implementation unit, not a new whole-goal audit gate or a claim that Source→code translation is complete.
