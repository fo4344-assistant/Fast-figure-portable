# Directory create — bounded Source41/pseudocode18 translation

Baseline ec6ce39065a53a9fb7bfb7580b15f92be375abb7; Source highest. Existing sourcescript/application/public_api/assets.py createProjectDirectory/ASSET_MUTATION_RESULT_RULE and sourcescript/backend/project_efsm.py common candidate contract already require current parent/name validation, actual committed path, committed-only validated selection, None on noncommit, late failure propagation without rollback. Pseudocode backend/project_efsm.pcal PROJECT_DIRECTORY_CREATED/BuildActualChanged and application/public_api/assets.pcal createProjectDirectory directly translate these. No new meaning or upper edit needed; source closure inherited, policy immutable.

## Prompt-to-artifact checklist

| Requirement | Artifact/evidence |
|---|---|
| Application new parent/name only, no VFS calculation/status ownership | createProjectDirectory; case81 scalar spy/function check |
| Backend current parent/node collision/name and isolated candidate | applyProjectDirectoryCreatedAction;81 root/nested,82 invalid/missing/collision |
| Whole validate then source-reference retry/one initialize |82 exact validator failure/newer authority/removed-parent retry |
| Actual immutable canonical changed.createdDirectoryPath; no assets/slots/next-id effects |81 frozen result and exact project comparison |
| Committed-only SELECT_ASSET actual path; noncommit None |81 event spy,82 noncommit/no-effects |
| Selection rejection preserves actual committed path; error propagates without rollback |82 both explicit branches |
| Runner-only strict lineage/build/regression82+82 | implementation regression39121419238 PASS82+82; build39121419225 PASS; cumulative39121486041 PASS and repeat39121488364 PASS82+82 atd1940e3 |

## Actual execution

At b4eff46135899d3be2b2cfd6ed72766de00f2e3c default ubuntu-latest regression39121419238 PASS82 inline+82 split (164 case passes, prior80 and new81/82), build39121419225 PASS. Diagnostic39121419226 FAIL on provisional old c79ec768... digest, printed canonical code70 sha256:181e72ba2a4639391196271d4f93cda813d58fcde2d69d5f18d5ca852da609f5; upper Source41/pseudocode18 unchanged. Dist-only bot d962889d363f8064d731c55cdce97adfbde4ee55 inspected and fast-forwarded. Patch073 records canonical fingerprint with no runtime/test/upper changes. At corrected lineage d1940e3909e954810eb5be40084ef85a01f93c0b cumulative39121486041 PASS with BASE_SHA ec6ce39065a53a9fb7bfb7580b15f92be375abb7, repeat regression39121488364 PASS82 inline+82 split (164 passes/no failures, inline6401700 bytes/split ZIP1735025 bytes). git diff b4eff46..d1940e3 sourcecode/scripts/sourcescript/pseudocode/tests is empty; build39121419225 covers identical build inputs. Failed diagnostic not claimed passed.

## Bounded completion audit

Checklist items map to inspected current command/wrapper and cases81/82, not merely a manifest/green proxy. Source-state capture precedes normalization, parent and node collision are resolved against that capture, whole candidate validates before reference recheck/retry, and only final one-commit actual directory path feeds selection. Tests exercise newer authority, disappearing parent, input/validator errors, noncommit with no success work, and postcommit rejection/error without rollback. Exact whole-project comparison shows only directories changed. Both new cases and prior80 pass at corrected lineage. This closes unit26 only: other command candidates, full graph/schema validation, imports/raster/supplied dashboard and prior UI timing stability remain uncovered/open. Source41/pseudocode18 unchanged; no higher document rewritten as a code description and no whole-goal completion.

Code70 stays stale. Existing legacy UI timeout from prior image unit remains open, not fixed/hidden here. This unit does not cover move/delete/trash/import/cascade or complete VFS query/UI cutover, shared full validation, raster/supplied dashboard. No resource handles allocated; no optional model/TLC execution. Application does not publish status on its own; normal command adapter owns commit reconciliation.
