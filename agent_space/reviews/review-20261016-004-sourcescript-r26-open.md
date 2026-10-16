# Source Script r26 — Plan 016 개선 patch / open review

## Baseline and purpose

- Baseline: `1b854ba7ace34614b17c4cda21747882629c22af` (remote main, after discarding uncommitted palette JS/test changes at the user's request).
- This is an additive/corrective Source Script patch, not a rollback to pre-Plan-016 source or a transcription of the current JS as authority.
- Preserve the project's editing/import/export freedom and the Backend Project EFSM / Application Adapter / Frontend FSM separation. Resolve semantics at Source Script before translating PlusCal or changing JS.
- No policy, PlusCal, verification model, application JS, browser tests, build scripts or generated distribution is modified in this unit.

## Findings addressed and authoritative changes

1. **Query meanings were underspecified.** `sourcescript/project_state.py` now binds public read operations to explicit identity inputs, current-authority resolution and detached results. It distinguishes graph current CSV from selected object's CSV, internal tree-selection calculation from public reads, and whole/slot-image/ui-palette renderer projection. It forbids returning mutable Backend objects, callback access or a second project read store. Pure filename/user-choice calculations remain their existing pure domain functions rather than gaining a needless ProjectObject dependency.
2. **Validation/reconciliation placeholders hid decisions.** The same file defines rejection versus explicit none, direction-dependent slot toggle, asset kind/path resolution, graph-object CSV hint only for explicit selection, and reset/swap/merge/move/trash/invalid-reference reconciliation. Added `assetKind` to the declared reconciliation record. Unrelated valid selections remain; queries do not ensure/normalize live charts.
3. **Frontend transition side effects were not fully named.** `sourcescript/interface_fsm.py` declares slot selection clearing graph/asset references, asset selection clearing graph selection, graph selection's optional CSV effect, no-publish rejected input, and lifecycle error then ready recovery. These remain Frontend transitions, not Backend writes.
4. **Direction and file-drop selection had conflicting descriptions.** `sourcescript/application_fsm.py` carries direction through validated slot intent; `sourcescript/renderer_runtime.py` preserves it and uses the already-declared `slots.prepareFileDrop`, not a contradictory generic toggle substitute. Invalid drop targets preserve state; an already-selected valid target avoids another transition; another target uses non-toggle selection without a pending content-type command. `sourcescript/api_ui.py` states the same operation contract.
5. **Lifecycle sequencing was too abbreviated.** Application rejects non-ready/invalid lifecycle requests before task execution, invokes a task once, treats sync/async completion alike, returns cancellation/rejection outcomes without pretending a project commit occurred, and propagates failures after error/recovery publication. Frontend never executes the task or performs hidden rollback.
6. **Candidate ownership and graph CSV editing needed correction.** `sourcescript/graphs.py` and `sourcescript/project_efsm.py` explicitly place one-object edit candidate calculation inside the command; the wrapper supplies chart/index/new values. A resolvable requested CSV remains a supported reference change, with current-object CSV fallback when the request is absent/invalid. Selected-index refresh does not silently change current CSV. Existing add/move/delete/palette freedom remains; a Frontend read projection is not an alternative whole-array authority.
7. **Image/print wrappers and Backend calculations were conflated.** `sourcescript/layout_annotations_export.py` now separates new-edit input and post-commit query from Backend current-authority merge/normalization/whole-project validation. It states range/current-value fallback behavior (including x/y=0 as a valid coordinate, not a JS-truthiness default) and returns a new settings projection only after commit, rather than declaring a settings return but returning a mutation envelope. `sourcescript/application_fsm.py` states that common ownership rule as well.

## Closure decision — OPEN, not an assertion of completion

The r25 closed claim is not inherited by modified r26. Metadata records r26 `current/open`, with no closure review. PlusCal r11 and model r26 become `stale`; existing Source Code r36 stays `stale`. Their files, revisions, fingerprints and historical derived-from values are not forged to match the new authority.

Remaining before a new closed decision:

- Finish the field-by-field whole-renderer contract, especially Plotly conversion/default/range calculation, chart instance reconciliation and image display-resource lifetime. A generic immutable-copy rule and a list of included data are not a complete executable projection algorithm.
- Complete the operation-by-operation call/return/failure trace for all API adapters and retained domain procedures. This patch resolves the listed discrepancies; it is not evidence that every pre-existing Source Script procedure is fully concrete or logically closed.
- Recheck the resulting hierarchy against purpose, all producer/consumer references, no duplicate authority, and cross-operation scenarios (selection + conditional command failure, merge/move/trash reconciliation, graph CSV/object selection, lifecycle rejection/recovery). Record a distinct closure review only when those checks actually succeed.
- Only after that closure may PlusCal be directly translated and reviewed for fidelity/concreteness. Do not resume lower implementation using this open revision as permission to invent the missing pieces.

## Verification and limitations

- Local actions in this unit are file reads/edits, Git diff/hash/transport operations only. No local application, Source Script execution, tests, version checker, build or TLC run.
- The Source Script fingerprint is calculated from sorted canonical LF Git blob records, matching the declared fingerprint algorithm. This byte calculation is not a semantic test or a checker run.
- Actual Actions version-check result and the cumulative remote patch endpoint are recorded in the paired patch explanation. No browser/build/TLC success is inferred from a metadata check.
- Sequential Contents API commits are not atomic and intermediate runs may see incomplete source/metadata/record sets. The final cumulative patch records the actual remote diff; patch-record files themselves necessarily follow that semantic endpoint.
