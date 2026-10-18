# Code52 — current CSV header candidate (whole goal open)

## Authority and closure

Source39 and pseudocode13 remain unchanged/current. This unit directly translates existing meaning, not a new design inferred from code. Source Script remains highest authority. Code52 remains stale because Plan023 whole alignment is incomplete. Optional TLC is not run or claimed.

## Requirement → artifact → evidence checklist

- `sourcescript/application/public_api/graphs.py:graphEditorSetHeaderLines` and `pseudocode/application/public_api/graphs.pcal` prescribe a scalar DATA_OBJECT_REPLACED command, noncommit gate, then actual changed asset path read. `sourcecode/fast-figure.js:graphEditorHeaderLines` implements that flow; case62 checks no Application calculation/direct write/model payload and no success read/render on rejection.
- `sourcescript/backend/project_efsm.py` / `pseudocode/backend/project_efsm.pcal` prescribe current-authority candidate calculation, complete validation and actual changed facts. `applyDataObjectReplacedAction` resolves current CSV, changes only its header field while preserving original bytes/rows/id/path, rebuilds affected editable figures, validates before commit, and retries if conversion replaced authority. Immutable changed fields include asset role/id/path/owners. Case62 covers finite/truncation/clamp boundaries, conversion/validation errors, missing CSV, one commit and stale-authority recalculation.
- `sourcescript/backend/project_state.py` assets.readDeletionTarget and `sourcescript/backend/assets_files.py:collectAssetReferences` / corresponding PlusCal helpers prescribe detached query results, original object positions, frozen real graph references and conversion-view exclusion. Backend query copies and recursively freezes its result; `collectAssetReferences` counts duplicate real references at original positions and image slot links. Case61 covers these scopes, repeated copy identity, missing/directory paths and no authority mutation.
- Shared `headerLineCount` finite fallback is now zero for nonfinite numbers, matching the upper normalization rule; existing callers retain truncation and row-bound clamping. Existing60 cases remain regression coverage, not proof of whole-goal closure.
- `development-versions.json`: code52 stale with unchanged upper derivations. Canonical runner fingerprint pending; previous digest deliberately retained until GitHub checkout reports the exact new digest. No local app/checker/build execution.

## Runner evidence

Pending for this unit. Required: regression62 inline +62 split, canonical version gate from baseline `cc4335c808b79c682b380243ecc4bc12d9285bfc`, and distribution build at an identified implementation SHA. Preparation/checklists alone are not a pass.

## Exclusions

Other asset replacement/create/delete/cascade paths still have legacy command payloads and are not claimed current by this unit. Full graph normalization, canonical import, supplied-renderer/raster capture and whole integration remain open. Existing richer editable-figure recalculation is retained within the candidate, not discarded or elevated to independent authority. Public rendering remains the existing postcommit UI refresh; no new Frontend persistent state is introduced.
