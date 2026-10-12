# Review 20261013-004 — PlusCal r16 dashboard drop lifetime

## Source authority

- Source Script revision: r16
- fingerprint: `sha256:05c78c39c6c7ae715c8204ec0c4381ecd66ebf1dd9dbfb01a26fd99400270484`
- closure review: `agent_space/reviews/review-20261013-003-sourcescript-closure-r16.md`

## Translation

`pseudocode/api_ui.pcal` now models the Source Script lifetime contract without prescribing React implementation mechanics.

Added UI-local pseudocode state:

- `dashboardDropReceiver`: mounted/unmounted logical availability;
- `dashboardDropReceiverCount`: exactly one effective receiver while mounted;
- `activeDropEventId`: one event currently entering the import path;
- `lastHandledDropEventId`: prevents the same one-shot event from entering twice.

`RerenderDashboardDropReceiver` preserves the mounted state and asserts exactly one logical receiver. `DispatchExternalDrop` accepts a one-shot event only when the receiver is mounted, the UI is accepting drops, the event has not already been handled, and no same-process drop is active.

The underlying prepare -> lifecycle -> import -> finish flow is unchanged.

## Boundary

The PlusCal model does not name `useCallback`, React effect dependency arrays, DOM listener APIs, or another target-language mechanism.

## Verdict

**The r16 Source Script receiver-lifetime rule is translated at the PlusCal layer.**

Source Code r12 can now be judged as a downstream realization of this rule. Official PlusCal translator/SANY or optional TLC execution is not claimed by this review.
