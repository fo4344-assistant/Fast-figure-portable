# Code r43 — merge/split command and public result translation

Baseline `75cc91eca6825c85f2dc2929ef0dbdaa21023984`. Source r39 remains closed/current and pseudocode r13 current. Only physical JS module hierarchy is flattened. This bounded unit does not complete the active direct-implementation goal.

## Prompt-to-artifact / semantic inspection

| Requirement | Concrete evidence |
|---|---|
| Direct pseudocode translation | `pseudocode/backend/project_efsm.pcal:CalculateMergeOrSplit` and `pseudocode/application/public_api/layout_annotations.pcal:mergeSlots/splitSlots` compared to the two Backend actions and public wrappers in `fast-figure.js` |
| Resolve identities inside command | `resolveLayoutCommandSlots` resolves distinct integer IDs against the command's cloned current Project, rejects missing/hidden/invalid IDs instead of coercing/filtering them; no Application candidate or read snapshot is submitted |
| Rectangle / one local owner | Merge computes the exact selected footprint union and bounding rectangle, rejects holes, and counts non-default **visible selected** payloads. At most one complete local payload moves to the top-left anchor; chart identity/one-owner relationship remain intact |
| Restore without data invention | Merge resets covered non-anchor payloads and hides them; split validates every selected merged anchor, retains its local payload, restores covered cells to visible 1x1 defaults; whole validation precedes one initialize |
| Exact caption values | Pseudocode `normalizeSlotContent:SingleCaptionOwner` gives an existing top-level caption precedence, including null/empty. The code no longer erases empty text or the literal saved text `슬롯 캡션`, and `setSlotLocalState` preserves empty text when moving payloads. No new Source meaning/default is introduced |
| Postcommit reconciliation | Existing `dispatchProjectCommand` consumes actual merge hints through Backend reconciliation; a selected source anchor maps to the top-left owner. Split uses ordinary current-reference resolution, not a second selection event |
| Public result / rejection | Both wrappers return false only for an uncommitted result, otherwise coordinate the existing dashboard render and return a fresh official immutable layout query. Exceptions propagate; no legacy status catch or ID-array public result remains |
| UI result consumer | `FastFigureLayoutOverlay.runLayoutCommand` consumes returned `visibleSlots` to retain valid existing Modal-local IDs, not a second persistent selection/model or a legacy public ID array |
| Verification | Browser case48 covers payload/chart transfer, current-authority injection, hidden/missing/non-rectangular/invalid IDs, multiple payloads, nested merges and split restoration, exact caption strings, selection reconciliation and uncommitted no-query/no-render gate. Cases1–47 remain required in inline and split builds |
| Record / lineage | Source-code r43 fingerprint and unchanged current Source/pseudocode lineage in `development-versions.json`; patch20261018-011 plus actual modified files commit together |

### Decisions and rejected alternatives

Reject retaining the old public arrays or swallowing errors: both conflict with the current wrapper procedures. Reject normalizing string IDs or silently dropping invalid split targets: that can turn a rejected requested operation into a different successful mutation. Reject duplicating charts/concatenating captions when two local owners exist: the contract explicitly rejects this. Reject introducing a new layout-selection authority or result envelope; the existing immutable query and Modal-local ID set suffice. An already merged single visible anchor is not rejected just because the old code required two IDs; Source/pseudocode specify footprint and owner validation, not that extra restriction.

`normalizeSlotContent` caption precedence is a narrow direct translation needed to preserve full local payloads. Other canonical-content/legacy normalization fields have not thereby received a full conformance review.

## Verification status

Implementation and patch011 committed together as `d79ecd8dfd0319eb0e26aadc1d951c01e4e73b0b`.

- Actions regression39055292839 SUCCESS: actual logs show cases1–48 passing in both inline and split-zip, including the new full-payload/current-authority/atomic-rejection assertions in case48.
- Version39055292736 SUCCESS at the same implementation HEAD: Source39 closed/current, pseudocode13 current, code43 stale, code fingerprint `sha256:5eca1380e7ac8c55945c0f4c4b796f02020a2305cc2c52fbf6c981fb6c7a9ca5`.
- Build39055292767 SUCCESS at the same implementation HEAD, verified both distributions and generated dist-only bot commit `404622235d319caaf99c3bbcbcae5ae49607b71d`, fast-forwarded locally.
- Logs retained under `.work/merge-r43-evidence/`. Later result-only documentation is not the executed implementation HEAD.

No local application, Source, PlusCal, parser, checker, test, build or TLC execution. Diff whitespace and isolated-index reverse patch checks passed; these are file-integrity checks, not runtime or whole-conformance evidence.

## Whole-goal completion audit

Concrete deliverables remain: implement all current pseudocode owners, inputs/results/branches/failure/current-authority transactions; preserve Source-first decisions, logical ownership and config authority despite physical flattening; complete supplied-projection rendering/export/resource handling and integration with actual policy-compliant evidence.

This review maps only merge/split and the caption-owner preservation dependency. It does **not** prove remaining graph/asset candidates and queries, positional cascade maps, full API/lifecycle parity, full canonical import normalization, supplied-projection renderer/export geometry/resource lifetime or legacy removal. In particular the existing dashboard render still reads Backend state, and the command adapter is not yet the complete pseudocode renderer pipeline. Green case48 or the earlier structural163/87 inventory cannot close those gaps. Code r43 remains stale; the active goal is incomplete.
