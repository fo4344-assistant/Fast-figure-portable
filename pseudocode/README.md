# Fast Figure PlusCal pseudocode r16 — work in progress

Derived from the closed Source Script:

- Source Script revision: r16
- Source Script fingerprint: `sha256:05c78c39c6c7ae715c8204ec0c4381ecd66ebf1dd9dbfb01a26fd99400270484`
- Source Script closure review: `agent_space/reviews/review-20261013-003-sourcescript-closure-r16.md`

## Translation rule

The active r16 pseudocode is written as `.pcal` modules. It translates the closed Source Script downward without adding domain rules, authorities, or responsibility decomposition.

The older `.md` files in this directory are historical language-neutral translations from the earlier workflow. They may be useful for comparison but are not the authoritative r16 PlusCal translation.

The active translation preserves:

- Source Script module/responsibility boundaries
- authoritative state and reference sources
- resolve-before-mutation ordering
- candidate/validation/commit boundaries
- failure/rejection semantics
- runtime versus persistent mutation ownership
- meaningful UI/FSM command sequencing

If a required meaning is absent or contradictory, translation stops and returns to Source Script rather than filling the gap in PlusCal.

## Active r16 module mapping

| Source Script | Active PlusCal | Status |
| --- | --- | --- |
| `sourcescript/application_fsm.py` | `application_fsm.pcal` | event/transition/lifecycle + selection/project/slot/chart/layout actions translated |
| `sourcescript/renderer_runtime.py` | `renderer_runtime.pcal` | telemetry/render/bookmark/drop/workspace/startup flow translated |
| `sourcescript/api_ui.py` | `api_ui.pcal` | subscription/collision/lifecycle/drop/app-shell boundary translated |
| `sourcescript/project_state.py` | `project_state.pcal` | authority/validation/reference lifecycle translated |
| `sourcescript/graphs.py` | `graphs.pcal` | chart/object/editable/import-export mutation flow translated |
| `sourcescript/assets_files.py` | `assets_files.pcal` | VFS/import/delete/move/package transaction flow translated |
| `sourcescript/layout_annotations_export.py` | `layout_annotations_export.pcal` | grid/slot-local annotation/export flow translated |
| `sourcescript/system.py` | `system.pcal` | initialization/root orchestration translated |
| `sourcescript/portable_build.py` | `portable_build.pcal` | portable build flow translated |

The Source Script hierarchy remains `system.py` as the system root with responsibility modules as siblings. PlusCal files do not introduce new semantic parent/child modules.

## Current validation status

- Source Script r16 is closed.
- All nine Source Script responsibility modules have active `.pcal` counterparts.
- Function/procedure coverage and static syntax-pattern checks have been completed.
- The PlusCal translator has not yet been executed on these pseudocode files, so translator/SANY success is not claimed.
- TLC verification is optional under policy v0.2.6 and has not been run for this r16 pseudocode.
