# Unit33 graph layout current-authority edits

## Authority and scope

Source42 sourcescript/backend/graphs.py normalizeAxisSettings/normalizeGlobalSettings and sourcescript/backend/project_efsm.py CHART_LAYOUT_CHANGED already require new field edits on current owning chart, Backend normalization, candidate whole validation/current-source retry/one commit. Source42 application/public_api/graphs.py graphEditorUpdateLayout requires committed-only official graphs.readLayout. Pseudocode20 backend/project_efsm.pcal CHART_LAYOUT_CHANGED and backend/graphs.pcal normalizeGlobalSettings/normalizeAxisSettings directly translate this. No upstream meaning changes needed. Code80 routes public session binding through official layout query, sends settings/new edits only, re-resolves current unique visible editable owner, merges edits into candidate, normalizes fields from config, rebuilds supplied-candidate projection, validates before source identity recheck and commits once. No live postcommit projection mutation. Official query returns fresh immutable normalized copy, never repairs editor.

## Prompt-to-artifact checklist

- current owner/slotId/chartId and explicit new values only: action, public binding/graphEditorUpdateLayout,95 scalar command spy and96 wrong id/hidden/noneditable.
- exact normalization: pure normalizeGraphLayoutSettings and95 min/max/tick optional numbers, positive fonts, lineWidth0, reciprocal/divide, log tick mode, bool/enum fallback, unknown fields omitted, untouched axis retained; Source configuration authority preserved.
- immutable official reads/no live repair and independent copies:95 before/after state equality and frozen nested copies.
- candidate-only projection/whole validation/retry/oneinitialize and actual chart change facts:95 counters/facts,96 supplied projection/validator original errors, newer source during validation retains newer font/name.
- noncommit no success query/render/reconcile; success official read, no CSV/selection/slot mutation; postcommit query failure no rollback:95/96.
- imported unknown layout extension survives while owned uirevision follows chart id and lineWidth0 survives projection:95 customLayoutFlag/uirevision/linewidth.

At edd7687d3b6f43e42786a225b069dbecff705154 build39123841119 PASS, regression39123841127 prior94+new96 pass both forms but95 fails `Error: layout edit discarded imported extension`. Fixture used uirevision, explicitly owned chart-id text in Source42 layout step3, not an unknown extension. Correct95 to unknown customLayoutFlag and assert owned uirevision/zero linewidth; no runtime or upper weakening. Version39123841118 diagnostic FAIL reports actual code80 sha256:c892537bac4f71eceabf7a9525f785deffd1cb655953aa5291c26c420a931227, upper unchanged. Record actual canonical digest; corrected regression/cumulative gate pending. Source42/pseudocode20 unchanged; code80 stale. Existing legacy normalization owners outside command/query, whole shared graph validator, other assets/move/imports/raster/dashboard/serializer/timing remain open. Optional model/TLC not run, no policy edits or local app/test/build/checker.
