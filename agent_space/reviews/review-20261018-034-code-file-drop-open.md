# Unit32 file-drop selection boundary

Source42 sourcescript/application/public_api/layout_annotations.py prepareDashboardFileDrop/finishDashboardFileDrop and pseudocode20 application/public_api/layout_annotations.pcal directly specify official visible slot query, missing False, same selected True/no transition, different target via validated non-toggle SELECT_SLOT, rejected False/no state change, no domain command/pending mirror, finish Frontend interaction cleanup/None with selection/lifecycle/Project unchanged. Existing meaning closed, no upstream edits required. Code79 removes direct live slot lookup/unchecked success and early drag cleanup, routes official query and accepted final selection, committed runtime render only success; finish returns null.

## Requirement-to-artifact checklist

- official scalar query then reference validation, no slot-model authority: prepare wrapper,93 spy.
- same selected id no toggle/event/publish/render; accepted different target once, no content type/Project command; domain/drag state unchanged:93.
- missing/hidden target False/no events, rejected current selection False, stale official context still revalidated:94.
- query/adapter errors original, accepted-render failure propagated without rollback:94.
- finish only clears Frontend drag state/CSS then None, preserves lifecycle/selection/Project:93.

At e3a454f05b95d95150b732a830ed595b6b989865 regression39123386784 PASS94 inline+94 split (including new93/94), build39123386626 PASS. Diagnostic39123386688 expected provisional mismatch prints canonical code79 sha256:290e675197264aa347c76073cf0b969ecb874ea54e66848b03f249904032dd14; Source42/pseudocode20 unchanged. Record actual runner digest only, corrected-lineage cumulative gate/repeat pending. Initial failing diagnostic remains failed. Source42/pseudocode20 unchanged, code79 stale; full asset/import/schema/raster/supplied dashboard/earlier serializer+timing remain open. No local runtime/checker/build, no policy or optional TLC changes.
