# Review 020 — source-code r3 README build source

## Scope

This review covers the source-code r3 change that removes the independently
maintained README body from `Fast-figure.html` and makes repository
`README.md` the authoring source for the README shown inside both distribution
artifacts.

No Source Script, verification-model, EFSM, project-model, or file-format
semantics are changed.

Authority chain:

- Source Script: r12 / current / closed
- verification-model: r6 / current / TLC passed
- source-code target: r3
- application build: `1.1.32-wip`

## Ownership and build boundary

The checked-in HTML now contains only:

```html
<!-- FAST_FIGURE_README -->
```

inside `template#readmeContent`.

`scripts/build-portable.py` reads the root `README.md`, renders the Markdown
constructs currently used by that document, and replaces the marker before
writing either distribution artifact.

Both `build_inline()` and `build_split_zip()` use the same
`build_source_html()` result. The split ZIP additionally retains the raw
`README.md` bytes as `Fast-figure/README.md`.

The builder uses only the Python standard library and HTML-escapes source text.
It supports the README's current headings, paragraphs, fenced code blocks,
ordered/unordered lists, inline code, bold text, and links.

## Regression coverage

The distribution regression now checks that:

1. split ZIP `README.md` is byte-identical to the repository source;
2. no built HTML retains the README build marker;
3. both inline and split HTML contain `data-source="README.md"` and
   `<h1>Fast Figure</h1>`;
4. the existing browser regression still runs against both built artifacts.

The main regression workflow now watches `README.md`.

## Source-code fingerprint

r3 fingerprint:

`sha256:6977517c2d0232c4346f201d91b5f5db243710f3fc65c62d15a1e26751d3022a`

Derived from:

- Source Script r12:
  `sha256:c8bde1257048128f5c17081cb08fb9ef5bee1cc94dd9bb690d3e9419032655db`
- verification-model r6:
  `sha256:1998bb5eb999e46066d962b51a7e1081149df2f1358710fae55c5dfdb665c82b`

## Validation before integration

- exact r3 builder Python compilation: passed
- Markdown renderer smoke test: passed
- full inline/split browser regression: delegated to the existing main push workflow

The app build string remains `1.1.32-wip` because this is documentation
sourcing and packaging, not application-state behavior.
