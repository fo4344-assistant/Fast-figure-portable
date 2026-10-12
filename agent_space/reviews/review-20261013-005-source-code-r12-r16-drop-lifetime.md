# Review 20261013-005 — Source Code r12 against Source Script / PlusCal r16 drop lifetime

## Upstream

- Source Script r16 closed
- PlusCal r16 dashboard-drop lifetime translated
- Source Code r12 unchanged since the listener-lifetime implementation fix

## Reclassification

The earlier classification "Source Code implementation defect only" was incomplete.

Correct layer split:

- Source Script r16 owns the observable rule that a mounted/accepting dashboard has one continuous effective external-drop receiver across ordinary rerenders and cannot silently lose or duplicate a one-shot drop because of internal handler replacement.
- PlusCal r16 models mounted receiver availability, one logical receiver, rerender continuity and one-shot event dispatch.
- Source Code chooses the concrete React/DOM lifetime mechanism.

## Source Code check

`useProjectAssetImportCollision` creates `choosePlan` with `useCallback(..., [])`.

`FastFigureDashboardFileDrop` installs its dashboard `drop` listener in an effect whose only dependency is that stable `choosePlan` identity.

Consequences:

1. ordinary `FastFigureShell` rerenders do not cause the effect to detach/re-attach the listener;
2. one mounted component owns one `handleDrop` listener;
3. effect cleanup removes the exact listener instance installed by that effect;
4. `FastFigureDashboardFileDrop` is rendered at a stable child position of `FastFigureShell`, without a changing key that would force normal rerender remounts;
5. component unmount remains the legitimate receiver-lifetime boundary.

This satisfies the r16 Source Script/PlusCal lifetime contract.

## Existing dynamic evidence

The r12 implementation passed the final browser regression in both distribution forms before r16 made the lifetime rule explicit:

- inline: 26/26 pass
- split: 26/26 pass
- run: `38270550250`

Test 26 exercises a collision-producing external drop after application state changes and verifies cancel/no persistent mutation. The earlier unstable-listener implementation made this path nondeterministic; the stable callback implementation removed that failure.

## Verdict

**No additional application Source Code change is required for the r16 lifetime rule.**

Source Code remains marked `stale` only because repository verification/version-chain tooling still records an older stale verification model; that is a separate metadata/tooling issue and not evidence of r16 application-code nonconformance.
