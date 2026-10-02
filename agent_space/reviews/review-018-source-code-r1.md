# Review 018 — source-code r1 against Source Script r12 / verification-model r6

## Scope

This review closes the source-code synchronization from the pre-version-chain
implementation to source-code r1.

Authority chain:

- Source Script: r12, closed/current
- Source Script fingerprint: `sha256:c8bde1257048128f5c17081cb08fb9ef5bee1cc94dd9bb690d3e9419032655db`
- verification-model: r6, current
- verification fingerprint: `sha256:1998bb5eb999e46066d962b51a7e1081149df2f1358710fae55c5dfdb665c82b`
- TLC: passed
- verification validation review:
  `agent_space/reviews/review-017-tlc-slot-core-r6-2x2.md`
- source-code target: r1

Archived pseudocode r2 was used as a non-authoritative implementation reference
where it remained consistent with Source Script r12.

## Source-code fingerprint

Final source-code paths:

- `Fast-figure.html`
- `fast-figure-ui.js`
- `fast-figure.js`
- `scripts/build-portable.py`

Fingerprint:

`sha256:9124227019a43c12823c745d114adebc5a08d8b940ac28870cbb0a926a39d1d9`

The fingerprint uses the repository's configured algorithm:

`sha256(sorted path + NUL + git-blob-sha1 + LF)`.

## Main semantic corrections

The r1 implementation aligns the application source with the current Source
Script in the following areas:

- initial ProjectObject/default slot schema;
- exact-one chart ownership validation;
- slot-local chart/image/contentType/imageSettings/caption ownership;
- reset/swap/merge/split preservation of complete slot-local state;
- safe grid resize candidate validation;
- zero-object editable charts and removal of the protected/fake default CSV;
- slot-local image display settings rather than image-asset settings;
- removal of persistent slot-caption mode and local UI targeting instead;
- persistent export settings in ProjectObject;
- FFPX/FFSX roundtrip for current schema;
- package-local FFSX CSV id remapping;
- distinct FFSX and imported Plotly paths;
- preserved Plotly conversion state and candidate-first imported→editable
  conversion;
- removal of the separate persistent `editing` chart pointer;
- candidate-first project-node move/trash reference detach;
- public API updates consumed by the Mantine UI.

## Regression target

`agent_space/tests/browser-regression.js` records:

- source-script: r12
- verification-model: r6
- source-code target: r1
- app build: 1.1.32-wip

The target is recorded independently of the manifest's temporary pre-promotion
source-code state so the test meaning is explicit during WIP.

## Regression evidence

Final successful branch run:

- workflow: `Source Sync Regression`
- run: `36977694199`
- job: `110744998840`
- tested commit: `a2030d5f200b10111fe2e8bbe5c7a75e5674484b`

Checks:

- `node --check fast-figure.js`: passed
- `node --check fast-figure-ui.js`: passed
- `node --check agent_space/tests/browser-regression.js`: passed
- split `file://` browser regression: 13/13 passed
- portable build `file://` browser regression: 13/13 passed

The portable regression is built by `scripts/build-portable.py` from the same
split source and vendored runtime.

## Failure diagnosis closure

The pre-fix regression failures were recorded in:

`agent_space/docs/source-sync-regression-diagnosis-r1.md`

They resolved as:

- multi-CSV FFSX: stale test object reference;
- Plotly edit/import: FFSX-only remap incorrectly reused for Plotly plus stale
  test reference;
- trash move assertion: stale test object reference;
- project-node move implementation: separate candidate-before-commit mismatch.

No Source Script semantic defect was found.

## Version decision

Source-code may be promoted to r1/current because:

1. Source Script r12 is current and closed.
2. verification-model r6 derives from that Source Script fingerprint.
3. TLC for r6 is passed.
4. r1 source code derives from those exact fingerprints.
5. split and portable browser regressions pass against the recorded r1 target.

This review does not expand the formal verification coverage beyond the
existing verification-model r6 scope. It records source implementation lineage
and regression evidence, not a claim of whole-application exhaustive formal
verification.
