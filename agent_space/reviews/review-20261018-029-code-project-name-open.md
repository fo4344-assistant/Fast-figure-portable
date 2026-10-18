# Plan023 unit27 — project name command (bounded / whole open)

Baseline fb6906b4eba899ae10bf600f3778123d204c01af. Source41 is highest, pseudocode18 current; code71 stale. No policy, Source or pseudocode edits: existing naming/current-candidate/success-query contracts already close this unit. Optional model26/TLC remains stale/pending, not a gate.

## Authority and prompt-to-artifact checklist

- Source `sourcescript/application/public_api/layout_annotations.py:setProjectName(value, trim=False)` and PROJECT_SLOT_RESULT_RULE: new value/trim only, noncommit None, committed-only official project.readName string, original errors and no hidden postcommit rollback.
- Source `sourcescript/backend/project_efsm.py:ProjectStateMachine.send`, PROJECT_NAME_CHANGED: current authority candidate, scalar string conversion, trim=True only, configured projectNameMaxLength, whole validation/reference recheck/retry/single commit; no Application domain calculation.
- Source `sourcescript/backend/project_state.py:PUBLIC_BACKEND_READ_CONTRACTS`: meta.projectName string copy.
- Direct pseudocode `pseudocode/application/public_api/layout_annotations.pcal:setProjectName`, `pseudocode/backend/project_efsm.pcal:CalculateSourceCommandCandidate` and `pseudocode/backend/project_state.pcal` project.readName. These specify the behavior independently of lower code.
- Implementation `sourcecode/fast-figure.js:applyProjectNameChangedAction`: captures source before conversion; candidate naming/validation and identity retry before one initialize; actual pre/post identity sets (no invented asset facts). `setProjectName` new inputs and committed-only official query; public readName uses same official query. No debug/status/direct persistent reads in wrapper.
- Case83: default whitespace, trim exact boolean, configured length, numeric/null/undefined/empty text, one commit/reconcile/query, whole state name-only difference, frozen empty identity facts, fresh scalar reads and selection unchanged.
- Case84: exact conversion/validator error with authority/runtime unchanged, noncommit no success read/reconcile, authority replaced during conversion and validation uses newest metadata, postcommit query/reconciliation errors propagate without rollback.

## Execution evidence

Actions default ubuntu-latest runner only; no local runtime/build/test/checker execution. At implementation18fd9af4582301d4a902f426ac3a90d65f5f06ce regression39121717231 PASS84 inline+84 split including cases83/84 and prior82; build39121717235 PASS. Artifacts6410436-byte inline/1735115-byte split ZIP. Dist-only botdb3c606ed17898386b1efc1c79d393b41ec0330a inspected and fast-forwarded.

Version39121717222 diagnostic FAIL (not a passed gate): `source-code fingerprint changed without updating development-versions.json: recorded='sha256:181e72ba2a4639391196271d4f93cda813d58fcde2d69d5f18d5ca852da609f5', actual='sha256:fee34f7c54684d7ab8db73673bd22b35109baca0dde3e336d560bf5b60110e37'`. Source41/pseudocode18 canonical digests unchanged. Patch076 records actual code71 digest. At corrected lineage68ec74a71bbcfd1a54436aaaa453acd2416237fd cumulative39121792370 PASS with BASE_SHA fb6906b4eba899ae10bf600f3778123d204c01af, repeat39121794498 PASS84 inline+84 split/168 pass records (same artifact sizes). Inspected implementation..corrected-lineage diff for sourcecode/scripts/sourcescript/pseudocode/tests is empty; build39121717235 covers identical inputs.

## Bounded completion audit

The objective here is naming-only current-authority command and official public result, not whole Plan023. Checklist maps exact upper procedure, code and cases83/84; inspected real pass records for both new cases and prior82 in both distributions, canonical strict cumulative gate and actual build. Current source capture precedes conversion and is checked after candidate validation; tests replace source at both sites and retain newer unrelated metadata with one commit. Failure/noncommit asserts no success read or reconcile; postcommit errors retain committed name. Full-state comparison verifies name-only domain changes, result facts contain no fabricated entity ids, and no Application normalization/model/state ownership remains. Source41/pseudocode18 meaning unchanged because no missing upper meaning was needed. Uncertainty remains outside this boundary: whole shared validator, other graph/asset/import/move/cascade/raster/supplied-renderer integration and UI timing stability. Code71 remains stale; optional model/TLC not executed and no whole-goal completion.

## Boundaries and alternatives

Chosen direct Source translation, not Application stringification or live name return. Rejected swallowing failures, truthy trim, hardcoded naming limit and stale candidate commits because they contradict existing authority. No new intermediate state, cache or UI bridge. Moving VFS nodes requires coherent cascade/path ownership and remains separate; this does not claim move/delete/asset import/full validation/raster/supplied dashboard cutover or whole Plan023 closure. Code remains stale until complete alignment.
