# Plan 016 — print/export settings boundary (Source Code r36, WIP)

## Authority and bounded scope

- Start HEAD: `b47aaf3e6063f1a425c34e354ed9ef7a68d74fb1`.
- Policy checked: `agent_space/AGENT.md` and remembered `agent_space/policies/development-policy.md` v0.2.6; original sections 2.1–2.4 and 7.1–7.2 re-read before implementation. No policy changes.
- Existing upper meaning: `sourcescript/layout_annotations_export.py` readExportSettings/setExportSettings and `pseudocode/layout_annotations_export.pcal` export-settings procedures; Application query/dispatch contract in `sourcescript/application_fsm.py` and `pseudocode/application_fsm.pcal`; declared `EXPORT_SETTINGS_CHANGED` in Project EFSM.
- This unit moves existing calculations and read ownership; it adds no export format, setting, schema or high-level algorithm. Source Script r25 and PlusCal r11 remain unchanged. Source Code r36 remains `stale`: full Plan 016 cutover is not complete.

## Implementation and mapping

- Backend `readBackendProjection("project-api", { operation: "print.readSettings" })` provides a fresh frozen scalar projection of authoritative export settings.
- `readPrintApiSettings` consumes that query through Application. `setPrintApiSettings` forwards only the new values through `dispatchProjectCommand` and returns a fresh query after successful commit. Neither wrapper directly accesses Backend objects or constructs a persistent candidate.
- Backend `applyExportSettingsChangedAction` now constructs its candidate from current Project authority plus the new edit patch, preserving omitted settings. It performs the same prior width/height/dpi bounds and enum fallback calculation, validates the candidate, then commits once. Failure does not reconcile Frontend success.
- React print editor already sends only edit patches, so no React change is needed. Existing save/capture wrappers consume read-only export settings for the operation; no new state or synchronization bridge is introduced.
- Keeping candidate construction in the public API, or passing a full read projection back as mutation input, was rejected because both put persistent-state decisions outside Backend current-authority ownership.

## GitHub Actions evidence

| Workflow/run | Checked HEAD | Result |
| --- | --- | --- |
| Fast Figure regression 38847409115 | `c2da11cd577c9342af7cf73c1e5294a3991b0491` | success: syntax and inline 40 / split 40 |
| Development layer versions 38847412408 | `8c8208100c1ff8675b37c62d22db60b3aadb635a` | success with r36 fingerprint/lineage |
| Build distribution 38847405535 | event `9ef0455e1a06523ac67b297c17fb33d03eaf168c`, actual checkout `8c8208100c1ff8675b37c62d22db60b3aadb635a` | success: build and verify; bot commit `a7444e2e3c84da67e99d648ce2915c78dd0dd788` |

- Case 40 covers immutable detached read/no authority changes; stale snapshot isolation; partial direct command preserving current width/height/dpi; bounds and format fallback; auto height; failed numeric conversion preserving Project and Frontend state; and narrow wrappers without direct Backend/candidate access.
- Regression 38847405516 at the first source commit also passed the prior 39 cases, but is not the 40-case verification above.
- Intermediate version run 38847405584 at `9ef0455e1a06523ac67b297c17fb33d03eaf168c` failed with `development-layer-version: FAIL: source-code fingerprint changed without updating development-versions.json`. This was the source-before-metadata Contents commit, not final r36 validation. Metadata publication completed before the successful run above.
- No application, regression, checker, build or TLC was executed locally. Local Git/file/transport operations and canonical blob-hash fingerprint preparation are not represented as project verification. All helpers/payload files used here stayed below the current working directory.

## Limits and remaining work

- These regressions are bounded evidence, not proof that all API/renderer consumers have been converted. Full dashboard/export renderer and remaining layout/label/caption/graph/asset consumers still require the existing Plan 016 boundary work. TLC was not run and is not claimed.
- Publication uses sequential Contents commits with current HEAD and target blob checks, not an atomic multi-file commit. Patch 20261016-007 records the actual cumulative start-to-semantic-end diff, including generated distribution and associated documentation; the patch pair itself follows in separate commits.
