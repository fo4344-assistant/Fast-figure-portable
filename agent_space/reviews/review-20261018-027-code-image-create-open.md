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

Implementation f7c9be92e9b9763abf1c8dda861f0f36db1448dd: ubuntu-latest regression39120950810 PASS80 inline+80 split (160 passing case records, includes prior78); build39120950816 PASS. Artifacts inline6392195 bytes/split ZIP1734954 bytes; dist-only bot d96d5d8d625d154c9450bf92122bd949da9491ab inspected before fast-forward. Diagnostic39120950819 FAIL on provisional old code66 fingerprint ff5070966a9ba3998a3268c836837e0d2528e2e399d6299f889795fcd90fe832; actual code67 sha256:f09432917cb50732eea95b9a6b7794e98f370175a64622694b7941e53143fea3. Source41/pseudocode18 canonical unchanged. Patch067 records actual digest without runtime/test/upper edits. At9a61401d3f19365deecbceb5c6e35448f768f101 cumulative versions39121012097 PASS fromc52bffa5828dcbd55e21dc2402855ea225034241 and repeat regression39121013641 PASS80+80. However bounded completion audit found a translation omission despite green tests: pseudocode/application/public_api/assets.pcal createProjectImage explicitly CopyBytes before dispatch, while code67 copied only inside Backend. Patch068/code68 copies binary bytes at Application boundary (base64 string already immutable); case79 mutates caller bytes in send spy before Backend execution and asserts command bytes remain detached/original. Source41 already requires copied byte ownership and pseudocode18 is direct: no upper meaning change. Thus prior green runs cover code67 only, not corrected68; Further static audit: Uint8Array(ArrayBuffer) is a view, not a copy. Patch069/code69 adds slice() after construction so all accepted binary representations detach; case79 passes caller ArrayBuffer and mutates its original view inside send spy, retaining typed-array and base64 coverage in subsequent creations. This is the same existing CopyBytes contract, not new Source meaning. Actual final build/regression/canonical/cumulative evidence pending. Strict checker unchanged; no local application/test/checker/build executed.
