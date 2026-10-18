# Code r49 — sourcecode directory relocation (OPEN)

User-requested physical relocation from baseline `25fa8c6a3f92054152b133465dd753f073a6c4cc`.

- Move the HTML template and both application JavaScript files from the repository root into `sourcecode/`.
- JavaScript contents and logical ownership are unchanged. Template vendor URLs become `../vendor/`; build_source_html normalizes them back to `./vendor/` for the existing distribution layout.
- Build inputs, active distribution/regression/version workflow path filters, patch target allowlist, syntax checks and patch smoke staging follow the new paths. The smoke HTML is rendered through build_source_html so common settings and README are embedded rather than opening an unbuilt template.
- README documents the layout. Vendor dependencies, shared settings, specifications, pseudocode, historical patch records and one-shot historical vendor workflows are not relocated or rewritten.
- Source39/pseudocode13 and their fingerprints remain unchanged. Code revision increments to49 and the path-sensitive fingerprint is recalculated; status remains stale. Previous r48 regression evidence is historical, not proof for this tree.

## Verification boundaries

Only file/diff inspection and metadata fingerprint calculation locally. No application, build, parser, checker, tests or TLC executed locally. GitHub Actions build/regression/version verification remains pending; no green result is claimed. Generated dist files are not manually edited.

## Authorized Actions results

At implementation094e322e00e00e6403792d373fa06437d6a03171, ubuntu-latest build39100862300 passed and generated dist-only bot6a042f38ac66b5944dc9aa13546d1e5838420ea1. Regression39100860733 passed. Version39100859164 with base25fa8c6 failed: `development-layer-version: FAIL: source-code fingerprint changed without updating development-versions.json`. Therefore this relocation is NOT fully validated. Patch025 adds actual-versus-recorded fingerprint diagnostics so the correction can use the canonical runner digest without local checker execution. No upper semantic change is inferred from this metadata failure.

The wider Plan023 translation/integration deliverable remains open; relocation does not establish semantic conformance or close earlier exclusions.
