# Plan023 Unit53 — close remaining synthetic serializer bypasses (open)

Baseline223a64d230b8e8c73e7725266a2da07f0d8e512c. Unit52 regression39167674112/repeat39167675221 PASS135 inline+135 split; build39167723028/canonical39167674113/cumulative39167677703/fidelity39167680247 PASS. Actual logs inspected. No prior completed parser/caption/package work repeated.

## Requirement-to-artifact mapping

- sourcescript/backend/assets_files.py SYNTHETIC_DATA_BYTES_RULE: bytes absent only, filename extension JSON/tab/comma, null empty/scalar text/structured compact JSON, delimiter/quote/CR/LF quoting, LF joins with no forced trailing LF, original bytes/name/MIME unchanged. pseudocode/backend/assets_files.pcal SerializeNewDataTable at112-136 explicitly translates every branch.
- sourcescript/backend/graphs.py:588 explicitly applies that asset rule to conversion-created table bytes without replacing imported graph bytes. Existing create command already used serializeNewDataTable and case77 literal expectations; package fallback used it too.
- Remaining actual bypasses found by source inspection: buildProjectCsvModel (used by CHART_MODEL_REPLACED conversion and byte-backed raw import) and importedProjectCsvState (whole-project candidate normalization) still used legacy ffpxCsv: unconditional comma, every field quoted, structured cells String(object), CRLF. Existing passing133/135 did NOT prove absent-byte conversion/restoration correctness.
- Runtime now uses existing serializeNewDataTable at both absent-byte sites, with actual normalized filename and original bytes branch untouched. Remove unused ffpxCsv so the synthetic-byte rule has one implementation. No new shared state, snapshot authority, hierarchy, feature or encoding meaning.
- Case74 adds real public editable conversion CSV exact-byte comparison to the same serializer whose literal branch outputs case77 verifies. New136 independently checks literal JSON/TSV/CSV/fallback outputs including null/object/quote/tab/newline/false/zero across both candidate helpers, metadata/name/rows preservation, original supplied bytes passthrough and read-only authority identity. No local execution.

## Delivery and verification surface

Source45/pseudocode24 unchanged; code104 fingerprintsha256:d768496d639130cf864aadb7fb8e90751f107fa0167f165308e37206a57eef74 stays stale. Plan023/review006 corrected evidence/this review/patch012 accompany change. Atomic gh tree publication only for coherent code+lineage immediate-parent gate; verify expected HEAD/old blobs/new paths and non-force ref. No local app/test/build/checker; default GitHub-hosted ubuntu-latest gates only; dist generator-only; optional TLC not run/not gate.

Corrected execution SHA136 inline+136 split, related full repeat, build, canonical+cumulative versions and fidelity are PENDING. Green version/fidelity is structural and cannot certify all Source branches.

## Rejected alternatives and exclusions

Do not retain a conversion-only legacy serializer, alter Source to match CRLF/auto-comma, normalize supplied bytes, or add a new representation. Reuse existing helper, preserving original MIME/header/name. No policy/Source/pseudocode modification or unrelated redesign. Remaining package ZIP/dataRef/metadata/settings/global initializer topology/ownership, raster/resource/current snapshot/dashboard/timing and full cross-module requirement inventory remain OPEN; this unit is not entire conformance. Full completion requires actual requirement coverage and exact-SHA hosted gates for every remaining contract. No actual auth/quota/service blocker observed; no completion claim.
