# Review 20261013-003 — Source Script r16 closure

Source Script revision: r16

Fingerprint:

```text
sha256:05c78c39c6c7ae715c8204ec0c4381ecd66ebf1dd9dbfb01a26fd99400270484
```

## Change trigger

Browser regression exposed a nondeterministic external-file-drop failure. The immediate Source Code cause was a React effect whose listener dependency changed on each render, creating a detach/re-attach gap.

That implementation was initially classified as Source Code-only. Re-review against policy v0.2.6 found the classification incomplete: whether a valid mounted/ready dashboard drop can be silently lost or duplicated is observable interaction meaning, while the particular callback/listener mechanism remains an implementation detail.

Therefore the lifetime property must exist in Source Script first.

## 1. Meaning added

When `FastFigureDashboardFileDrop` is mounted and the UI is in a state that accepts external file drops:

1. the dashboard has logically one continuous effective external-drop receiver;
2. ordinary frontend rerender, local state update, or callback replacement must not create a gap in which a valid one-shot drop is silently lost;
3. the same one-shot drop must not be delivered as multiple import attempts because listeners overlap;
4. mount/unmount or an explicitly non-accepting lifecycle/target condition may define the legitimate availability boundary;
5. stable callbacks, delegated listeners, framework event props, or another concrete lifetime mechanism are Source Code choices.

No persistent project state is added.

## 2. Existing drop semantics remain unchanged

The established flow remains:

```text
external drop
-> DOM target slotId
-> slots.prepareFileDrop
-> lifecycle
-> assets.importToSlot(file, slotId, choosePlan)
-> candidate validation / persistent commit
-> slots.finishFileDrop
```

Collision cancellation, slot targeting, project-asset connection, and persistent authority are unchanged.

## 3. Project-purpose alignment

**Pass.**

The added rule prevents normal UI rerendering from reducing an already-defined user interaction capability. It adds no new domain feature, project state, import path, or UI state authority.

## 4. Responsibility / decomposition

**Pass.**

The semantic availability contract belongs to `api_ui.py` because `FastFigureDashboardFileDrop` owns external DataTransfer capture and collision-UI orchestration.

The renderer still owns slot bookmark/drag interaction and only delegates OS file drops to the Mantine path.

The implementation technique for continuous one-receiver behavior remains below Source Script.

## 5. Prior classification correction

The earlier statement that the listener-lifetime issue was purely a Source Code defect is withdrawn.

Correct classification:

- **Source Script:** previously missing interaction-lifetime invariant;
- **PlusCal:** must preserve the mounted/accepting receiver availability and no-loss/no-duplicate meaning;
- **Source Code:** the unstable callback/effect dependency was one concrete violation and is already corrected with a stable callback implementation.

## 6. Closure verdict

**Source Script r16 is closed.**

`UNRESOLVED_REVIEW_ITEMS` remains empty for this change. PlusCal r15 and Source Code r12 are downstream/stale relative to r16 until their derivation is updated and checked.
