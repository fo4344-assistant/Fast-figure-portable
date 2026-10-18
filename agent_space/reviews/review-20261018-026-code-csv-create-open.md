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
| Runner-only execution and strict lineage | build39120647325 PASS; regression39120723974 PASS78+78; cumulative versions39120721691 PASS at8efc931 frombbb602bd |

## Decisions, exclusions

Preserve supplied bytes instead of normalizing them; synthesizing all files would violate Source's original-byte authority. Reject invalid explicit ids rather than silently substituting next-id. Do not call projectVfs.prepare to invent missing parent directories. Do not return a live caller-created model or manually clear/select graph state. Postcommit read/selection errors propagate without deleting the already committed asset. Keep legacy buildProjectCsvModel for separate import/conversion owners explicitly not closed by this unit. Full tabular parser, image create, batch import, cascade, complete graph validation, canonical project import, raster and supplied dashboard cutover remain open. No TLC execution claimed.

## Execution evidence

Implementation 003f484b1eaa07b44c31541857c0221bc981b4bc: default ubuntu-latest regression39120647317 PASS78 inline+78 split, including cases77/78 and prior76. Build39120647325 PASS; artifacts inline6383148 bytes/split ZIP1734868 bytes. Dist-only bot a192e11 inspected before fast-forward. Diagnostic39120647336 FAIL as expected on provisional prior pseudocode digest: recorded c576b3f037c76816f890f2f6adedd94a11fe6ea3bb6bc53712defbda47335619; actual pseudocode18 sha256:9fb9e8f2240b339fa3f44c82682d9a8a81144cfcd5197b88b172f6c4f508859a and code66 sha256:ff5070966a9ba3998a3268c836837e0d2528e2e399d6299f889795fcd90fe832. Source41 unchanged. Patch064 records canonical values without source/test changes. At corrected lineage8efc93112788818f19fed75b9b92a05aeb6ae62d, cumulative versions39120721691 PASS with BASE_SHA bbb602bd52b240ca875af2b871963edf83a4434b; repeat regression39120723974 PASS78 inline+78 split (156 individual pass records, no failures, same artifact sizes). git diff003f484..8efc931 sourcecode/scripts/sourcescript/pseudocode/tests is empty, so build39120647325 covers identical runtime/build inputs. Initial diagnostic failure remains evidence, not a passed gate.

## Bounded completion audit

Every checklist item above maps to inspected runtime/pseudocode branches and cases77/78 with actual runner logs. Added cases cover scalar commands, current-source retry, id/path collision, exact original/synthetic bytes, immutable success read, noncommit/validation gates and postcommit failure semantics. Prior76 cases also pass. This is not proof of whole Plan023: tabular parser/default ownership, other asset candidates/import/cascade, shared full graph validation, raster and supplied dashboard remain uncovered and open. Source41 remains highest authority; pseudocode18 derives directly from its existing rules, not from code. Code66 stays stale; optional model/TLC unchanged and not executed.
