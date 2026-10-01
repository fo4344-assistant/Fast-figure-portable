# portable_build

## Source identifiers

- `ROOT`: split-source project root used by the build specification.
- `DEFAULT_OUTPUT`: default portable artifact path.
- `SCRIPTS`: ordered external-tag -> local-source replacement list.
- `BUILD_SEMANTICS`: exact source-byte inlining rule.
- `PORTABLE_RUNTIME_RULE`: core single-file local/offline runtime rule.

## Build semantics

1. Portable build does not rewrite application logic.
2. It reads split Fast-figure.html and replaces each declared external script tag exactly once with the bytes of its matching local source.
3. Script replacement follows declared SCRIPTS order.
4. Final portable artifact must not require separate core script/runtime download for ordinary Fast Figure use.
5. Optional future integrations may exist, but core project open/edit/export remains local/offline.

## build

INPUT output path

1. Read Fast-figure.html bytes.
2. For each declared script:
   a. verify source file exists;
   b. verify expected external tag occurs exactly once;
   c. read exact source bytes;
   d. replace that tag once with an inline script containing those bytes.
3. After all replacements, verify no declared external script tag remains.
4. If any source is missing, tag count is not one, or an external tag remains, fail without producing a falsely complete artifact.
5. Ensure output parent exists.
6. Write final bytes to output.
7. Do not modify split source files.
8. Return output path/artifact.
