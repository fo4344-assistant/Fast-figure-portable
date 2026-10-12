# Review 20261012-006 — r15 PlusCal issue-resolution check

## Authority

Design authority is closed Source Script r15:

- fingerprint: `sha256:6c7d5b23a4a1a9b13db6f4210781926e64fbba81df93e5cf774d8356b7c6fb3f`
- closure review: `agent_space/reviews/review-20261012-005-sourcescript-closure-r15.md`

This review checks the PlusCal translation against Source Script. It does not infer design meaning from Source Code.

## 1. Post-drag bookmark synthetic click

### Layer classification

The original defect was a **Source Script design incompleteness** because the release timing determines whether a generated click becomes SELECT_SLOT.

It was fixed in Source Script r15 first, then retranslated to `pseudocode/renderer_runtime.pcal`.

### PlusCal check

The translated order is now:

1. `BookmarkDragStart` sets `slotDragSourceId` and `suppressBookmarkClick = TRUE`.
2. `BookmarkDrop` or `BookmarkDragEnd` clears only `slotDragSourceId`; it does not clear suppression.
3. `BookmarkClick` while suppression is active:
   - during an active drag, does nothing and keeps suppression;
   - after drag source is cleared, consumes the post-drag click by clearing suppression and does **not** call `SetSelectedSlot`.
4. `ReleaseSyntheticClickGuard` can clear suppression only when:
   - suppression is active,
   - drag source is already clear,
   - `PostDragClickOpportunityPassed()` is true.

Therefore a click in the same drag interaction cycle is not translated into SELECT_SLOT.

**Verdict: resolved at Source Script + PlusCal layers.**

Translator/TLC execution is not claimed; `PostDragClickOpportunityPassed()` remains an abstract pseudocode condition whose executable definition belongs to a later verification/implementation translation.

## 2. Current CSV columns versus selected graph-object columns

### Layer classification

This was **not a Source Script defect**. `sourcescript/api_ui.py` already states that `graphs.readData` returns:

- current CSV/columns from the single current CSV selection;
- `objectColumns` separately from the selected object's persistent `csvId`;
- object reference is not a fallback authority for current selection.

The defect was a **PlusCal translation omission**.

### PlusCal check

`pseudocode/api_ui.pcal::ReadGraphData` now has two independent resolution paths:

```text
ResolveCsvFromCurrentAssetSelection()
  -> currentCsv
  -> currentColumns
```

and

```text
selected graph object
  -> object.csvId
  -> ResolveProjectCsv(...)
  -> objectCsv
  -> objectColumns
```

There is no fallback from `objectCsv` to `currentCsv`, and no current-selection update from `object.csvId` in this read operation.

This matches the Source Script ownership distinction.

**Verdict: resolved at PlusCal layer; no Source Script change was required.**

## 3. Related previously raised issues

The same r15 PlusCal set still preserves the previously resolved contracts:

- CSV selection: resolve -> clear graph-object selection -> commit current CSV selection.
- graph-object selection: resolve object/reference -> clear -> select referenced CSV -> select object.
- image selection does not connect the image to a slot.
- existing-asset connection uses `path, kind, slotId`.
- graph object addition requires an editable existing chart.
- graph/image content-body click does not select the content slot; bookmark click owns selection/toggle.
- bookmark drag emits slot swap rather than selection.
- collision Modal no-choice dismissal produces no import plan.

## 4. Remaining layer status

- Source Script r15: closed/current.
- PlusCal: the two identified issues are semantically resolved against r15.
- Official PlusCal translator/SANY execution: not yet completed.
- optional TLC verification: not claimed.
- Source Code: still stale and must be updated only from the completed PlusCal meaning.

No Source Code fix is accepted as evidence for this review.
