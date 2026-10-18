# Unit35 persistent print settings current authority

Source42 application/public_api/layout_annotations.py setExportSettings and backend/layout_annotations.py readExportSettings, common backend/project_efsm.py current-source candidate/whole validation/reference retry/one commit govern this unit. Pseudocode20 backend/project_efsm.pcal NormalizeExportEditsInAttempt and application/public_api/layout_annotations.pcal setExportSettings directly cover current-field fallback/config numeric bounds/auto None/explicit current-or100; no upper meaning change needed.

Code83 applyExportSettingsChangedAction retains edit normalization but captures current authority each attempt, retries after validation if replaced, commits once and records actual changed id facts. Official print.readSettings recursively detaches/freezes current export rather than shallow compatibility copy. Existing Application setPrintApiSettings already sends only new settings and gates fresh official query on committed; retain that implementation, no unnecessary rewrite.

## Prompt-to-artifact checklist

- new values only/current settings not Application model:99 send spy; wrapper inspection.
- config limits/own fields/invalid current fallback/auto null/explicit fallback:99 numeric/enums/inherited/NaN/null/Infinity cases.
- exact Project export-only mutation/immutable changed facts/fresh immutable query/no selection changes:99 full-state comparison and identity checks.
- original getter/validator error, noncommit no query/reconciliation:100.
- authority replaced during conversion or validation recalculates current fields, one final commit:100 two retries.
- late success-query/reconciliation errors propagate without rollback:100.

At code83 90ab7fbdd00edfe1c647a13009cac482d7b679d1 regression39124845158 PASS100+100/build39124845127 PASS; diagnostic39124845134 actual83 1002957edb7de85256cf1134ad25a79d560f53bf0e2e1569d41227eec886f0fe (still failed provisional mismatch). Audit found JSON-based test equality and command clone both omit canonical slot content extensions via legacy toJSON. Green assertions were insufficient to prove export-only mutation. Code84 restores canonical content from same captured source inside private candidate, and99 directly retains sentinel extension across all edits. Source42 single-owner/extension retention/export-only contract already requires this; no new upper meaning. Code84 actual default-runner100+100/build/canonical/cumulative pending; Source42/pseudocode20 unchanged, code83 stale. Optional model/TLC not run. Larger resource owners/schema/assets/import/raster/supplied dashboard/serializer/timing remain open, no whole-goal claim. No policy or local runtime changes.
