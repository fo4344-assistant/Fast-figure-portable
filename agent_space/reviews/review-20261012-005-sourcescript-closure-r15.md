# Review 20261012-005 — Source Script r15 closure

Source Script revision: r15

Fingerprint:

```text
sha256:6c7d5b23a4a1a9b13db6f4210781926e64fbba81df93e5cf774d8356b7c6fb3f
```

## Change trigger

The r14 PlusCal review showed that the Source Script required post-drag synthetic bookmark clicks to be suppressed but did not define when the UI-local suppression could be released. Because the release point changes whether a post-drag click can become SELECT_SLOT, it is design meaning and must be fixed in Source Script rather than invented in PlusCal.

## 1. Logical completeness

**Pass.**

The bookmark interaction lifetime is now ordered explicitly:

1. bookmark drag start activates UI-local click suppression;
2. drop/dragend clears the drag source but does not release suppression;
3. if a bookmark click is dispatched while suppression is active, that click is consumed without SELECT_SLOT and suppression is then released;
4. if no post-drag click is dispatched, cleanup may release suppression only after that click-dispatch opportunity has passed.

Therefore the same drag interaction cycle cannot accidentally toggle/select the slot through its generated click.

The existing click semantics remain unchanged outside that guarded cycle: content bookmark click selects/toggles, graph/image body does not select, empty slot surface may select.

## 2. Project-purpose alignment

**Pass.**

The change only clarifies UI interaction sequencing needed to preserve Plotly/image interaction and bookmark-based slot movement. It does not change slot payload movement, persistent project state, layout geometry, or user-visible selection capability.

## 3. Duplicate structure / integration

**Pass.**

Click suppression remains UI/runtime state owned by renderer interaction. It is not added to ProjectObject, application domain state, or a second slot-selection authority.

The existing SELECT_SLOT and SLOTS_SWAPPED commands remain the only corresponding mutation/event boundaries.

## 4. Cross-module consistency

**Pass.**

- application_fsm remains the authority for SELECT_SLOT toggle semantics.
- renderer_runtime owns DOM bookmark click/drag event sequencing.
- slot swap meaning remains the slot-local payload swap already defined by application_fsm/layout rules.
- api_ui external file drop remains separate from bookmark drag.

No new unresolved Source Script rule is introduced.

## 5. Closure verdict

**Source Script r15 is closed.**

`UNRESOLVED_REVIEW_ITEMS` remains empty. Downstream PlusCal must represent this ordered guard lifetime exactly. Source Code remains stale until the PlusCal translation is complete.
