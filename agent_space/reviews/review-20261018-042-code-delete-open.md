# Unit40 — current-authority asset deletion (pending Actions)

## Policy and upper-layer requirement audit

Continue the fully read development-policy.md v0.2.6 and AGENT.md requirements: Source highest authority, direct PlusCal translation, one owner for persistence, no shared authoritative draft/cache, whole candidate validation before commit, exact execution evidence and paired numeric patch. Policy/hierarchy unchanged; no local application/test/build/checker. Existing Source45 application/public_api/assets.py deleteProjectAsset specifies explicit kind/id/path only, shared collectAssetReferences, CSV object detach without removing empty charts, image reference only (not slot reset), complete validation and kind-specific one commit. Pseudocode23 backend/project_efsm.pcal deletion branch requires ResolveExactCurrentAssetTarget/IdentityKindIdPathAllMatch and DetachAssetReferences, and the common attempt loop retries after authority replacement. These meanings are already closed; no new upper meaning is needed.

## Direct mapping and regression scope

Code90 removes the Application-owned whole candidate and the Backend caller-candidate shortcut. Common Backend delete handler re-resolves identity/path, detaches via the same helper as verified unit39, keeps canonical slot contents, validates and compares authority before one commit; missing target is noncommit, mismatch throws. Actual changed facts/index maps own reconciliation; resource release follows commit. Public wrapper copies only kind/id/path, skips success work on noncommit, returns None and propagates errors; existing dashboard render remains aggregate and is not claimed renderer cutover. Selected deletion read now calls the official immutable Backend query instead of independently counting a different reference scope. Existing legacy-import cleanup caller passes the explicit reference shape; import rollback/lifecycle semantics are still pending and NOT claimed aligned by that adaptation.

- Case11 now supplies canonical path as the already-current Source requires, not a guessed id-only delete.
- Case110: exact minimal command payload; one commit per deletion; CSV original-position index map and retained object/selection; image reference-only detach preserves settings/canonical extension/unrelated graph; release once after commit.
- Case111: missing unchanged/noncommit, mismatched identity rejection, validation failure preserves authority/Frontend, noncommit skips useful effects, replacement during validation triggers complete retry, late reconciliation error leaves committed deletion and skips later success work.
- Prior109 tests retain shared conversion/frozen/duplicate reference scope. Unit40 does not newly claim all import/schema/export/render/timing requirements.

## Lineage and verification status

Source45 and pseudocode23 fingerprints/lineage unchanged. Code90 remains stale. Fingerprint was calculated from the canonical staged Git blob identities (not executing a version checker); the authorized default GitHub-hosted canonical development-layer checker must independently confirm it. Exact new-SHA regression111 inline/split, repeat, build, cumulative versions and fidelity PENDING. No TLC execution claimed. This review is not a full-goal closure, and green static coverage alone is not semantic proof.
