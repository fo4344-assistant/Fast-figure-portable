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
| Runner-only strict lineage/build/regression82+82 | pending actual Actions; prior fingerprint provisional until runner diagnostic |

Code70 stays stale. Existing legacy UI timeout from prior image unit remains open, not fixed/hidden here. This unit does not cover move/delete/trash/import/cascade or complete VFS query/UI cutover, shared full validation, raster/supplied dashboard. No resource handles allocated; no optional model/TLC execution. Application does not publish status on its own; normal command adapter owns commit reconciliation.
