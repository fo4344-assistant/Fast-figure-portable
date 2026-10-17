# Source-code r39 — label ownership and reference geometry (OPEN)

## Authority and prompt-to-artifact audit

Baseline `767c4086dbb3057a1f41ca1ed002d201d8a665c6`. Source r38 closed/current and pseudocode r12 current remain unchanged. Code r39 is still stale; this is a bounded Plan023 implementation, not whole-goal completion.

| Requirement | Actual artifact/evidence | Assessment |
| --- | --- | --- |
| Code directly translates pseudocode | `pseudocode/application/public_api/layout_annotations.pcal` six label procedures map to read/setEnabled/setSettings/setPosition/resetPosition/finishPositionInteraction in `fast-figure.js` | Implemented bounded surface |
| Preserve meaning, flatten physical modules only | Existing flat JS files retained; Backend candidate/query, Application dispatch/read and Frontend display remain logically distinct | No hierarchy redesign/new authority |
| Resolve uncertainty against Source/policy | Source `backend/layout_annotations.py`, `backend/project_efsm.py`, config and policy section7 consulted | No new domain decision; no upper edit |
| Current-authority mutation | Backend merges only supplied fields into its current candidate; Application never copies current settings into a command | Implemented |
| Position/reset/failure | Finite numeric positions including zero/negative retained; invalid values reject before commit. Reset reads sole Backend config, not literal zero. Noncommit returns false; exceptions propagate | Covered by case43 |
| Immutable query | Registered `labels.readState` copies settings, formats sample and computes selected-span or missing-slot 1x1 geometry from one current Project | Covered by case43 |
| Direct geometry translation | `dashboardGeometryInProject` implements `DashboardGeometryInProject`; cells follow `gridSlotGeometry` without a lower invented Math.max(1) clamp | Shared pure calculation; broad regression needed |
| Completion | Existing completion notification followed by official read, no persistent position command | Covered by case43 |
| Same-commit record/version | Actual modified files and numeric patch003 pair commit together; revision/fingerprint/lineage updated, remains stale | File checks pending/recorded below |
| Actual execution | Browser case43 exercises actual API/current-command/read/failure boundaries in inline and split artifacts; prior42 cases retained | Actions pending |

## Decisions and exclusions

Backend settings retains omitted current fields. Enum edits follow existing valid-option rules; font size uses the config minimum with no invented upper bound. Known x/y edits must be finite. Display/render calls after committed mutations remain existing behavior; the whole renderer supplied-projection cutover is not complete. Application trace/debug delivery does not read Backend state for completion. No new result envelope, selection event, runtime module tree, defaults mirror or hidden control bridge.

The geometry change removes lower clamps absent from the direct pseudocode: valid callers own input bounds; export's nonpositive grid rejection is a later still-open ownership unit. This unit does not claim the remaining export pipeline now implements that rejection.

## Verification and remaining work

Local work is file/text/hash/Git only; all application, builder and checker execution is GitHub Actions. No Source/PlusCal execution/parser/TLC or delegation. Static diff and isolated-index reverse-application checks are file checks, not runtime evidence. Actions are pending at preparation and must be inspected before claiming a pass.

## Actual Actions evidence

Implementation and patch003 commit `bb4ddc4037ea45e1b9a185d3bca11a4c4c859d8b` passed regression [39052637981](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/39052637981): actual logs show cases1–43 passing in both inline and split browser artifacts (86 case executions), including the added command/query/geometry test. Versions [39052637844](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/39052637844) passed and logged code r39 stale with fingerprint `sha256:c3844209087a01efaf5d7fdf00330f2d07bb2696e5bbc01ad53e64e4a94f731f`. Build/verification [39052637903](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/39052637903) succeeded and generated dist-only bot commit `b9017660a7add509234d4e706529447d9830e364`. Local branch fast-forwarded that generated output. No local runtime execution. This later result record is not the executed implementation HEAD. Static endpoint diff and isolated-index reverse applicability passed before the atomic implementation commit.

Whole-goal gaps still include layout/zoom and export geometry ownership, graph/assets candidate and query adaptation, selection maps, lifecycle adaptation and renderer direct reads. Tests/manifests cannot establish full conformance by themselves; active goal remains incomplete.
