# Fast Figure pseudocode r1

Derived exactly from:

- Source Script revision: r12
- Source Script fingerprint: `sha256:c8bde1257048128f5c17081cb08fb9ef5bee1cc94dd9bb690d3e9419032655db`
- Source Script closure review: `agent_space/reviews/review-015-sourcescript-closure-r12.md`

## Translation rule

This directory is the language-neutral execution translation of the closed Source Script.

It preserves:

- Source Script identifiers and responsibility boundaries
- authoritative state and reference sources
- inputs and outputs
- meaningful execution order
- candidate construction and commit boundaries
- failure/rejection semantics
- fixed calculations

It does not decide:

- JavaScript/React/Python-specific data structures
- concrete exception classes
- browser/library call syntax
- implementation-only caching or memory layout
- new domain rules

If a required meaning is missing or contradictory, translation stops and the issue returns to Source Script.

## Module mapping

| Source Script | Pseudocode |
| --- | --- |
| `sourcescript/system.py` | `system.md` |
| `sourcescript/project_state.py` | `project_state.md` |
| `sourcescript/application_fsm.py` | `application_fsm.md` |
| `sourcescript/assets_files.py` | `assets_files.md` |
| `sourcescript/graphs.py` | `graphs.md` |
| `sourcescript/layout_annotations_export.py` | `layout_annotations_export.md` |
| `sourcescript/api_ui.py` | `api_ui.md` |
| `sourcescript/renderer_runtime.py` | `renderer_runtime.md` |
| `sourcescript/portable_build.py` | `portable_build.md` |
