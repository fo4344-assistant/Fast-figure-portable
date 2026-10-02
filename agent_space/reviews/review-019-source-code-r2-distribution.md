# Review 019 — source-code r2 distribution build

## Scope

This review covers the source-code r2 packaging change derived from the current
Source Script r12 and verification-model r6.

No application semantics were changed. The source-code revision increases
because `scripts/build-portable.py` is part of the source-code fingerprint.

Authority chain:

- Source Script: r12 / current / closed
- verification-model: r6 / current / TLC passed
- source-code target: r2
- application build: `1.1.32-wip`

## Distribution layout

Running:

```bash
python scripts/build-portable.py
```

creates two derived distribution artifacts:

```text
dist/
├─ inline/
│  └─ Fast-figure.html
└─ split/
   └─ Fast-figure.zip
```

The generated `dist/` directory is ignored by Git and is not an authoritative
source tree.

### Inline distribution

`dist/inline/Fast-figure.html` contains:

- the HTML application shell;
- Plotly.js;
- the React/Mantine runtime bundle;
- `fast-figure.js`;
- `fast-figure-ui.js`.

All runtime JavaScript dependencies are inlined into one HTML file.

### Split ZIP distribution

`dist/split/Fast-figure.zip` contains:

```text
Fast-figure/
├─ Fast-figure.html
├─ fast-figure.js
├─ fast-figure-ui.js
├─ vendor/
│  ├─ plotly.min.js
│  └─ fast-figure-ui-runtime.js
├─ README.md
└─ LICENSE
```

The relative script paths are unchanged, so the extracted package runs directly
from `file://` without a server.

The ZIP uses a fixed timestamp and deterministic member order so that packaging
does not depend on checkout file mtimes.

## Builder interface

`scripts/build-portable.py` now builds both artifacts by default.

Options:

- `--dist-dir`: override the distribution root;
- `--inline-output`: override the inline HTML path;
- `--output`: retained as an alias for `--inline-output`;
- `--zip-output`: override the ZIP path.

## Regression method

The browser regression runner no longer constructs a hand-copied split tree.

Instead it:

1. runs the actual distribution builder;
2. checks that both artifacts were created;
3. checks the exact ZIP member set;
4. extracts the split ZIP;
5. runs the same browser regression against the inline HTML;
6. runs it again against the extracted split ZIP HTML.

The regression target metadata was advanced from source-code r1 to r2.

## Validation evidence

Work-branch validation:

- workflow: `Distribution Build Regression`
- run: `36979562757`
- job: `110750760353`
- JavaScript/Python syntax checks: passed
- inline `file://` regression: 13/13 passed
- extracted split-ZIP `file://` regression: 13/13 passed

Generated artifact sizes in that run:

- inline HTML: 6,130,743 bytes
- split ZIP: 1,722,327 bytes

The size difference is expected because the ZIP deflates Plotly/runtime/source
files instead of concatenating their raw bytes into one HTML document.

## Source-code fingerprint

r2 source-code paths:

- `Fast-figure.html`
- `fast-figure-ui.js`
- `fast-figure.js`
- `scripts/build-portable.py`

Fingerprint:

`sha256:4ed1b0ebe81476560b10aac0b85238e3ed183d0e4faa14fadd9d3e73c60a7210`

Derived from:

- Source Script:
  `sha256:c8bde1257048128f5c17081cb08fb9ef5bee1cc94dd9bb690d3e9419032655db`
- verification-model:
  `sha256:1998bb5eb999e46066d962b51a7e1081149df2f1358710fae55c5dfdb665c82b`

## Version decision

source-code r2 may be current because:

1. the application semantics are unchanged from r1;
2. the current Source Script and verification-model lineage is unchanged;
3. the builder change has a new source-code fingerprint;
4. the regression target explicitly records r2;
5. both actual distribution artifacts pass the browser regression.

This review does not change Source Script or formal verification coverage.
