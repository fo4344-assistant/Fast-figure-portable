# Lifecycle task entry — bounded implementation review

## Purpose and authoritative correspondence

Continue stage1 Source45 → PlusCal25 → implementation, not general cleanup or a test-growth pass.

- `sourcescript/application/adapter.py:119–136` and `pseudocode/application/adapter.pcal:126–165` require one official Frontend state read, busy rejection first, then importing/exporting validation before START/task execution. `sourcecode/application/adapter.js` previously read internal state and omitted request validation. It now follows those checks without changing the existing completion/failure path.
- `sourcescript/application/public_api/__init__.py` public lifecycle contract and `pseudocode/application/public_api/contract.pcal:111–136` include assets.importFiles in OneOuterTaskBinding: busy rejects before helper execution. `sourcecode/application/public_api/assets.js` previously converted input, returned for empty input and read selection before entering ASSET_IMPORT. All router helper work now runs inside the one importing task named assets.importFiles.
- The empty-input no-query/command/choice rule in `sourcescript/application/public_api/assets.py` / `pseudocode/application/public_api/assets.pcal` describes helper work; it does not exempt the public invocation from its outer lifecycle. Accepted empty input returns [] through COMPLETE; busy empty input rejects without iteration. Target selection is still captured only once for nonempty input, before asynchronous choices, never retargeted afterward.

No new state, wrapper layer, query, candidate, retry, rollback or cache. Ordered helper routing, prior commits, cancellation/noncommit results and original failures remain owned by their existing procedures.

## Necessary coverage only

No new cases. Existing case36 adds invalid-request refusal with unchanged error/Frontend/Project state and busy-before-validity ordering; no replacement of Adapter/FSM methods. Existing case120 replaces its contradictory empty-public-input expectation and adds busy empty/nonempty/iterable inputs, detecting iteration before rejection. Existing order, fixed target, cancellation, noncommit and failure checks remain. The existing helper stubs in120 are retained, not expanded into a new mocked transition suite. All167 historical cases remain; these assertions are authored, not executed.

## Verification and boundaries

Static incremental diff inspection and git whitespace checking only. Canonical LF fingerprint was calculated from git blobs plus modified runtime files, reproducing pre-unit r129 bd95a53983ba3252dbb77061197893616ef14bfa8a1d2cd11d5cbde88b803e9f and yielding r130 29613ca0ba37bdb581e35d20541dbb94b661306ce80317e6a0c68c7f4ef554bc. This is file/hash inspection, NOT a version-checker pass. The raw CRLF checkout was not normalized.

No application/test/build/checker/Actions/TLC execution in this unit. The code metadata revision/fingerprint has been updated, but official checker and runtime validation remain pending authorized Actions; version work is not declared verified/complete. Prior r129 local execution deviation is recorded separately and is not repeated or used as r130 evidence.

Code130 stays stale. Source45/PlusCal25/verification26 and derived_from are unchanged. No claim of whole-Adapter fidelity, native import integration or whole-stage completion. Stage1 remaining caller/screen correspondence, stage2 current capture/resource lifetime, stage3 remaining owners and stage4 integration remain open. Existing r129 changes, regression-cleanup WIP, reviews and failure log are preserved. No policy/upper-layer/dist/remote changes, commit, push or delegation.

Rejected: guarding only current UI callers (leaves direct calls inconsistent); returning empty public input before lifecycle (contradicts OneOuterTaskBinding); moving child helpers behind additional public lifecycle bindings (self-rejection); introducing a task manager or duplicating router state (unnecessary). Patch20261106-002 records only this incremental unit over the existing working tree.
