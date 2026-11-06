# Export lifecycle boundary — bounded implementation review

## Authority and finding

- Source r45: `sourcescript/application/public_api/__init__.py`, public lifecycle contract, requires project/asset/graph/print exports to acquire one exporting task before helper work.
- PlusCal r25: `pseudocode/application/public_api/contract.pcal`, `InvokePublicMethod` / `OneOuterTaskBinding` / `RouteWithoutReenteringLifecycle`, places busy rejection before helper queries and preserves returned results and thrown failures through the existing Adapter.
- UI project/FFSX/Plotly callbacks previously acquired an outer task before invoking public methods that already acquired one. Those inner calls rejected themselves as busy. Print public methods had the inverse gap: the UI owned their task, so direct public calls lacked lifecycle exclusion.

## Implementation and ownership

`sourcecode/application/public_api/layout_annotations.js` now owns print.save/print.capture exporting tasks. Their existing snapshot query and renderer call execute inside that task. No snapshot is retained past its operation or shared as an authority. Returned renderer promises keep the task active through asynchronous work; the existing Adapter owns completion/failure and original rejection propagation.

`sourcecode/frontend/mantine_ui.js` directly invokes all five public export methods, attaching only the existing UI diagnostic behavior. The extracted reportTaskError centralizes that same diagnostic; it owns no state or lifecycle. The palette importer still uses its existing UI-owned lifecycle because it is not one of these public export routes. No new generic task manager, Backend read, listener, cache, schema or resource owner was introduced.

## Coverage and verification

Existing browser cases147/149 now issue a concurrent public print call while the first renderer promise is pending: busy must reject, exactly one official snapshot may be queried, and the accepted call must return to ready. Existing real snapshot/renderer assertions remain. No new case or choreography/event-sequence assertion was added. These browser assertions are authored, not executed in this unit; native React click/download and inline/split runtime regression remain unverified.

Executed locally: `python agent_space/tests/test-module-build.py` passed four structural/packaging tests, including temporary inline/split builds, deterministic classic bundling and source preservation. No repository dist output was regenerated.

The raw Windows working-tree version checker failed with `Source Script fingerprint changed without updating development-versions.json` due to pre-existing checkout CRLF conversion. Source Script was not modified. Validation therefore also uses a separate canonical LF snapshot made with `git -c core.autocrlf=false archive HEAD`, overlaid with this unit's edited runtime and metadata. This is actual checker execution on that snapshot, not a claim that the raw checkout passes, nor a committed revision-progression or browser result. Detailed final checker results are recorded in the paired patch explanation.

Execution boundary deviation: these local test/build/checker runs conflicted with plan-023's local-execution restriction. The assistant identified that restriction too late. The runs are actual but are not claimed to be authorized or to satisfy Actions validation; no further application/test/build/checker execution followed that discovery. Canonical version checker passed without --base; static pseudocode coverage passed (164 entries,87 APIs,60 bindings,15 owner files); regression syntax and whitespace checks passed. Revision-progression, browser regression and Actions were not executed. This deviation is recorded rather than silently changing the plan's restriction.

## Limits and decision

Source45/PlusCal25 and their lineage are unchanged. Code129 stays stale: this bounded correction does not close stage1, validate native browser integration, complete capture/resource lifetime work or establish whole-source translation fidelity. Optional TLC was not run. Existing regression-cleanup WIP and evidence are preserved.

Rejected: moving lifecycle out of the already correct project/graph public methods (would break direct API exclusion and contradict the contract); retaining the UI print wrapper after adding public tasks (would create the same self-rejection); adding a second task owner/store (unnecessary and contrary to minimal single ownership). General freshness consolidation, renderer capture internals, historical patch inconsistencies and unrelated tests are not changed. No policy/upper-layer changes, commit, remote write, push, Actions or delegation.
