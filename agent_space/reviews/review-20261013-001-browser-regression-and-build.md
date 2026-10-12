# Review 20261013-001 — r15/r12 browser regression and distribution build

## Tested revision

- branch: `fix/gui-fsm-20261008-review`
- Source Script: r15 closed
- PlusCal: r15 active translation
- Source Code: r12
- regression test target: Source Code r12

## Regression

GitHub Actions run: `38270550250`

Workflow: `Fast Figure regression`

Result: **success**

Both generated forms passed all 26 browser regression cases:

- inline `file://`: 26/26 pass
- split-zip `file://`: 26/26 pass

The r15 interaction cases 20–26 all passed in both forms:

20. content graph/image body is pass-through and bookmark owns content-slot selection/toggle;
21. empty slot surface remains selectable;
22. bookmark drag swaps slot-local payload and consumes the immediate post-drag click;
23. image asset selection does not link until explicit add;
24. current CSV columns and selected-object objectColumns remain separate;
25. non-editable imported graph rejects object mutation;
26. collision Modal dismissal cancels import without persistent mutation.

The regression job also rebuilt the distribution for testing and reported:

- inline artifact size: 6,148,355 bytes
- split zip size: 1,722,751 bytes

## Distribution build

GitHub Actions run: `38270773742`

Workflow: `Build distribution`

Result: **success**

Successful steps:

- checkout review branch
- build distribution
- verify distribution
- commit distribution artifacts

The workflow committed:

- `dist/inline/Fast-figure.html`
- `dist/split/Fast-figure.zip`

Build artifact commit:

`9ded687881beab23748bd44a166cae9319d3ede4`

## Trigger handling

The workflows normally trigger only on `main`. For this review only, the exact review branch was temporarily added to the push filters, and the distribution workflow was made branch-relative for checkout/push. After regression and build completed, those workflow-only trigger changes were reverted to the normal `main` configuration.

No application, Source Script, PlusCal, test semantics, or built distribution files are reverted by the cleanup.

## Status boundary

This review records successful browser regression and distribution build only. It does not change the repository policy requirement that the Source Code layer remains `stale` while the optional verification model recorded in `development-versions.json` is stale/pending.
