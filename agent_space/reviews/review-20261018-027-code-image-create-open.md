# Image create — bounded Source41 / pseudocode18 translation

Baseline c52bffa5828dcbd55e21dc2402855ea225034241. Source highest; no policy or upper semantic change. Whole code67 stale, optional model26/TLC unchanged/not run.

## Authority and direct translation

Source sourcescript/application/public_api/assets.py createProjectImage passes only new bytes/name/MIME/id/path, gates success read on committed and returns an immutable official asset read. sourcescript/backend/project_efsm.py ProjectStateMachine.send resolves current authority, rejects Application models, validates whole candidate, retries source replacement and commits once, then emits actual created id/path. Slot-local image settings remain solely on slots. pseudocode/application/public_api/assets.pcal createProjectImage and pseudocode/backend/project_efsm.pcal CalculateNewAsset/ProjectStateMachine_send directly specify copied bytes, current parent/collision/next-id and validation. These current upper contracts already close this ownership unit; no upper edits needed.

## Prompt-to-artifact audit

| Contract | Artifact and direct coverage |
|---|---|
| Application sends new values only; scalar id/path are requested inputs, not authority | sourcecode/fast-figure.js createProjectImage; case79 payload spy |
| Backend current directory/id/collision and bytes copy; nonempty bytes and invalid base64 rejected | applyImageObjectCreatedAction; cases79/80 |
| Preserve original binary/base64 input, MIME fallback; image owns no slot settings | case79 exact [0,255,17,128], input mutation detachment, no settings/slot/CSV/selection mutation |
| Explicit valid id advances current next-id; duplicate/invalid id/parent rejected | cases79/80 |
| Candidate validate then source-reference retry/one initialize; retain newer asset/name | case80 validation injection and retry |
| Actual immutable changed id/path/owners; fresh frozen official read | case79 result facts and read spy |
| Noncommit and validation exceptions perform no success read/reconcile; error identity retained | case80 |
| Postcommit query failure propagates without rollback | case80 |
| Caller path uses correct public parameter position | legacy importSelectedImageFile create branch now passes plan.path as fifth argument, previously silently ignored sixth; broader import ownership remains open |
| Actions default runner build/regression80+80/canonical and cumulative version | pending actual runs |

## Exclusions

This is image asset create only, not slot image insertion/import/replacement or cascade/resource cleanup. Existing buildProjectImageModel remains for other unconverted import/candidate paths, not the public create authority. Shared full graph/schema validation and complete canonical imports/parser/raster/supplied dashboard remain open. No URL/DOM work added. Lower-layer useful binary and base64 input support retained as concrete byte representation, not new domain meaning. Invalid old explicit ids now reject rather than silently substitute next-id, as current upper contract requires.

## Execution

Pending. Prior code66 fingerprint intentionally provisional until runner prints canonical code67 digest; strict checker is not weakened. No local application/test/checker/build executed.
