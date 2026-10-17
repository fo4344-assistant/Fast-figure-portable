# Source-code r38 — Backend configuration packaging and caption settings (OPEN)

## Authority and scope

Baseline `f830d3f2ff69ce1a670ccc338e3676624214de77`. Source r38 remains closed/current and pseudocode r12 current, unchanged. This is a bounded continuation of Plan023, not whole application conformance. Source-code r38 remains **stale**.

The user's physical-module flattening exception is applied only to implementation placement: existing flat `fast-figure.js` / `fast-figure-ui.js` stay in place. Backend candidate/query, Application postcommit adaptation and Frontend rendering ownership are not flattened into a shared authority. No new runtime module tree or parallel defaults file is introduced.

## Prompt-to-artifact audit

| Requirement | Actual artifact/evidence | Status |
| --- | --- | --- |
| Direct pseudocode translation, not redesign | `pseudocode/application/public_api/layout_annotations.pcal` caption wrappers dispatch only new edits, check committed, then query; implemented six setting/text wrappers and existing insertion wrapper retains its gate | Bounded implementation; remaining application not complete |
| Resolve ambiguous lower meaning against Source | `sourcescript/backend/project_efsm.py` caption settings ownership, `sourcescript/backend/layout_annotations.py` owner reads, and sole `sourcescript/backend/settings.json` checked | No new domain decision needed; no upper edit |
| Shared config is the source, not duplicated constants | Builder embeds that JSON once in both artifact HTMLs, escapes HTML-significant characters; JS freezes the packaged Backend subtree. Initial annotation/layout/palette/image/export defaults copy/reference the corresponding config fields | Implemented; other old import/graph/default literals still require full cutover |
| Current-authority mutation, not Application snapshot input | `setCaptionsApiSettings` passes only patch; `applyCaptionSettingsChangedAction` merges supplied fields into Backend candidate using config bounds/fallbacks before whole validation/commit | Implemented |
| Failure must not expose successful read | Text/settings/enabled/name/nameBold wrappers return false for noncommit; throws propagate; slot read is an official immutable Backend query | Implemented |
| Physical flattening only | No new application JS module/package; common JSON belongs to existing Source config path and is packaged as data | Preserved |
| Policy/version/recording | AGENT and relevant direct-translation policy consulted; code revision/fingerprint/lineage recorded, remains stale; actual files and numeric patch pair in the same commit `b8944bc83332ac149f89409a31e1ec930982366b` | Verified |
| Tests cover actual artifacts | Browser case42 covers frozen config, independent instance copies, same-command current state, patch-only input, bounds/fallback, exception preservation and all six noncommit gates. Prior41 cases retained. Build verification checks embedded JSON equals the source in both artifacts | Actions passed for this bounded unit; not whole-goal proof |

## Implementation decisions

- Packaging Source's immutable BackendSettings into HTML is a target-platform data-transfer detail. It neither changes the JSON meaning nor creates persistent Project instance data in configuration. No Source/pseudocode revision or new configuration authority is necessary.
- No `fetch` from `file://`, duplicated JS defaults, hidden DOM control, synchronization bridge, or Source Python import is used. The JSON script element is the one packaged read-only configuration input, not a mutable editor/model mirror.
- Configuration default records are cloned for each Project. Empty text/name/asset/slot/sequence instance values remain runtime instance initialization, not config content.
- Caption Backend settings normalize only explicitly supplied known fields; omitted current fields survive. Caption numeric bounds/fallback come from JSON. No generic public result envelope is invented.
- Existing renderer calls after committed caption changes remain; full supplied-projection renderer conversion and unrelated wrappers are not claimed complete.

## Verification limits and remaining work

All application, builder and checker execution is reserved for authorized GitHub Actions. Local activity is text/file/hash/Git work only. No local Source/PlusCal execution, application test/build, parser or TLC run. No delegation.

At preparation Actions were pending; actual execution results are recorded below. Static `git diff --check` and isolated-index reverse applicability of the actual patch passed. These are file checks, not application tests. Build escaping is explicitly implemented, but adversarial configuration values are not yet covered by a dedicated executable test.

## Actual Actions results

All three runs used implementation commit `b8944bc83332ac149f89409a31e1ec930982366b`:

- [Regression39051983860](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/39051983860): success, actual logs show cases1–42 passed in both inline and split-zip file:// browsers (84 case executions). Case42 exercises the newly packaged data and actual public APIs, not a manifest proxy.
- [Versions39051983808](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/39051983808): success; logs show source-code r38 **stale**, fingerprint `sha256:785a369300df83e4e499ec0f3c79eb3b7906d2f9c856020462f8b355d4048678`, pseudocode r12 current. This checks lineage/fingerprints, not whole semantic conformance.
- [Build39051983865](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/39051983865): build and verify success, including inline/split embedded JSON equality with the common source; generated artifacts committed as `e14c499e87f24ad29f6ff3174ef2ca033609dd77`. That bot commit changes only generated dist files and was fast-forwarded locally. The user's patch/source same-commit rule applies to the authored change and is satisfied by patch001 in the implementation commit; bot generation is a separately identified automatic output step.

This post-execution record is a later documentation-only change, not itself the executed implementation HEAD. No failures were observed in these runs. The initial local commit attempt failed because author identity was unset; it wrote no commit. Retrying used the authenticated GitHub account's existing verified noreply identity via per-command Git options (no global identity change).

Whole-goal blockers remain: label and layout ownership, graph/assets current-attempt commands, selection maps and lifecycle/API adaptation, renderer direct-read cutover, export geometry and full Source/pseudocode conformance audit. Green bounded tests cannot close those gaps. Do not mark the active implementation goal complete.
