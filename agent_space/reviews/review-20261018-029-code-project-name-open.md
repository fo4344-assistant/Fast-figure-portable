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

Actions default ubuntu-latest runner only; no local runtime/build/test/checker execution. Implementation run/digest/cumulative gates pending. Prior digest in metadata is provisional until canonical runner diagnostics; do not treat diagnostic failure as success.

## Boundaries and alternatives

Chosen direct Source translation, not Application stringification or live name return. Rejected swallowing failures, truthy trim, hardcoded naming limit and stale candidate commits because they contradict existing authority. No new intermediate state, cache or UI bridge. Moving VFS nodes requires coherent cascade/path ownership and remains separate; this does not claim move/delete/asset import/full validation/raster/supplied dashboard cutover or whole Plan023 closure. Code remains stale until complete alignment.
