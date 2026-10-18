# CSV creation — bounded Source41 → pseudocode18 → code66 review

Baseline: bbb602bd52b240ca875af2b871963edf83a4434b. Whole Plan023 remains open; code remains stale.

## Authority and translation

Source41 application/public_api/assets.py createProjectCsv/createEmptyProjectCsv/createEmptyProjectCsvAndSelect and backend/project_efsm.py common candidate/send/result rules already require new inputs only, current next-id/location, candidate validation/retry, one commit, actual changed path and copied official success read. backend/assets_files.py SYNTHETIC_DATA_BYTES_RULE independently defines preservation of supplied original bytes versus filename-aware UTF-8 synthesis. No new upstream meaning is needed. Earlier pseudocode CalculateNewAsset unconditionally serialized CSV rows, losing supplied bytes. Pseudocode18 first corrects that branch; code66 then translates the contract. No policy or Source edits.

## Prompt → artifact checklist

| Requirement | Artifact / verification surface |
|---|---|
| Application does not own model/path/id candidate | createProjectCsv passes new fields only through dispatchProjectCommand; case77 payload assertions |
| Backend current authority owns id/VFS/collision | applyDataObjectCreatedAction local source/candidate; case77 collision and78 retry/newer id/name |
| Existing bytes retained, synthesis only without originals | corrected CalculateNewAsset; serializeNewDataTable filename-aware JSON/TSV/CSV; case77 exact bytes |
| Whole validation before commit, source identity recheck | command loop; case78 exact validator error and authority replacement |
| Actual changed immutable facts, fresh copied query | created asset role/id/path in result; official assets.readDeletionTarget; case77 frozen detached result |
| No success query/selection on noncommit/failure | committed gate; case78 invalid inputs/validator/noncommit |
| Create-and-select occurs after commit, no rollback on late error | selectProjectCsv ordinary frontend event; case78 rejection and query throw |
| Empty CSV remains ordinary template asset; no chart/object | existing template, general command, official selection; cases77/78 and previous regression |
| Runner-only execution and strict lineage | pending canonical diagnostics, regression78+78, build and cumulative version run |

## Decisions, exclusions

Preserve supplied bytes instead of normalizing them; synthesizing all files would violate Source's original-byte authority. Reject invalid explicit ids rather than silently substituting next-id. Do not call projectVfs.prepare to invent missing parent directories. Do not return a live caller-created model or manually clear/select graph state. Postcommit read/selection errors propagate without deleting the already committed asset. Keep legacy buildProjectCsvModel for separate import/conversion owners explicitly not closed by this unit. Full tabular parser, image create, batch import, cascade, complete graph validation, canonical project import, raster and supplied dashboard cutover remain open. No TLC execution claimed.

## Execution evidence

Pending. Prior digests deliberately provisional until canonical Actions checkout diagnostic; not a passed version gate.
