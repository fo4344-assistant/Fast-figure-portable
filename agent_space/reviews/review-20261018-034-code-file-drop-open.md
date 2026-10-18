# Unit32 file-drop selection boundary

Source42 sourcescript/application/public_api/layout_annotations.py prepareDashboardFileDrop/finishDashboardFileDrop and pseudocode20 application/public_api/layout_annotations.pcal directly specify official visible slot query, missing False, same selected True/no transition, different target via validated non-toggle SELECT_SLOT, rejected False/no state change, no domain command/pending mirror, finish Frontend interaction cleanup/None with selection/lifecycle/Project unchanged. Existing meaning closed, no upstream edits required. Code79 removes direct live slot lookup/unchecked success and early drag cleanup, routes official query and accepted final selection, committed runtime render only success; finish returns null.

## Requirement-to-artifact checklist

- official scalar query then reference validation, no slot-model authority: prepare wrapper,93 spy.
- same selected id no toggle/event/publish/render; accepted different target once, no content type/Project command; domain/drag state unchanged:93.
- missing/hidden target False/no events, rejected current selection False, stale official context still revalidated:94.
- query/adapter errors original, accepted-render failure propagated without rollback:94.
- finish only clears Frontend drag state/CSS then None, preserves lifecycle/selection/Project:93.

At e3a454f05b95d95150b732a830ed595b6b989865 regression39123386784 PASS94 inline+94 split (including new93/94), build39123386626 PASS. Diagnostic39123386688 expected provisional mismatch prints canonical code79 sha256:290e675197264aa347c76073cf0b969ecb874ea54e66848b03f249904032dd14; Source42/pseudocode20 unchanged. At corrected-lineage ec3bb702693aa296b99c01a9e0b6150c628e071b cumulative39123444878 PASS from719584378eae1871064c00b809ec7329de70e734, repeat39123447017 PASS94 inline+94 split/188 actual pass lines. Inline6454018 bytes/split ZIP1735566 bytes; git diff e3a454f..ec3bb70 sourcecode/scripts/sourcescript/pseudocode/tests empty, build39123386626 covers identical inputs. Initial failing diagnostic remains failed.
## Bounded completion audit

Checklist above maps inspected wrapper branches to cases93/94 and actual corrected-SHA results, not just green status. Preparation reads official context, avoids selected-slot toggling or Project/content-type mutation, validates current reference and checks accepted final selection, preserves interaction until finish, propagates exact boundary/render errors. Tests directly observe scalar query/event, state identity, no domain command and late-selection persistence. Finish clears drag state/CSS and returns null without changing Project/selection/runtime. New2 and prior92 pass both distributions. This closes unit32 only; Source42/pseudocode20 unchanged, code79 stale; full asset/import/schema/raster/supplied dashboard/earlier serializer+timing remain open. No local runtime/checker/build, no policy or optional TLC changes.
