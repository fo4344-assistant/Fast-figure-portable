# Plan023 Unit56 — STORE entry path contract (open)

Baseline6cae6e250c815c5eb6a67b78e2b76364de04a31a. Prior Unit55 regression39169083122/repeat39169100231 PASS138 inline+138 split each; build39169085372/current+cumulative39169088049/fidelity39169090217 PASS exact SHA. Review009 preserves initial lineage failure and correction, not erased.

## Requirement-to-artifact bounded audit

- Source sourcescript/backend/assets_files.py PACKAGE_CONTAINER_RULES: STORE only, unsplit ZIP, no absolute path or `..` segment, CRC validation, current package version. PlusCal backend/assets_files.pcal ReadStorePackage:491-509 directly states `Require(~IsAbsoluteEntryPath(entry.path) /\ ~HasDotDotSegment(entry.path));`. Source45/PlusCal25 already agree; no new meaning.
- Runtime sourcecode/fast-figure.js ffpxZipRead used substring `name.includes("..")`, incorrectly rejecting harmless names such as report..csv but accepting rooted backslash/drive absolute paths. Direct segment test now checks slash/backslash-delimited exact `..`, and absolute path test recognizes slash/backslash roots and drive-root prefixes. Stored entry names and bytes stay unchanged; no filesystem reopen or normalization writes.
- Existing STORE/split/CRC/version handling unchanged, not claimed globally exhaustive. Full local/central ZIP structural consistency remains OPEN for separate audit; do not infer closure from this path unit.
- Test139 actual STORE containers consumed by BOTH FFPX and FFSX readers: four harmless dotted names retain exact bytes/read-only identity, eight parent/absolute names reject. Invalid bytes additionally enter actual public project/slot import and must preserve exact Project/Frontend identities. Existing valid format documents, graph/CSV references and bytes used, not a helper-only model.

## Lineage/delivery/evidence

Code107 fingerprintsha256:ff59c53b1cd9b62ba787659953b843ae3ae1ff436fc9abcbd48298bc56c015d5 derives Source45 and canonical PlusCal25 sha256:44857334494530ac219597bb9c52279778ea25d5477f03ebf199a98dd9b0bee6; stays stale. Pair017/Plan023 includes actual runtime/test/lineage/review diff, excludes own pair. Exact-SHA139 inline+split/repeat/build/current+cumulative/fidelity pending. No local application/test/build/checker or optional TLC; dist generator-only. Coherent code+lineage uses bounded atomic gh Git Data exception because sequential Contents code/revision creates immediate-parent gate mismatch; expected HEAD/current old blobs/new paths/nonforce required.

Rejected blanket double-dot substring prohibition, stripping/rewriting archive paths or bytes, treating directory strings as filesystem reopen references, unrelated parser/format redesign, test assertion weakening or Source edits to justify old behavior. Global schema/dataRef/settings/initializer/resources/current capture/raster/dashboard/timing and exhaustive cross-module requirement-to-artifact audit remain OPEN. No full completion/code-current claim.
