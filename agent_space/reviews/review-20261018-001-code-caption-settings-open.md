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
| Policy/version/recording | AGENT and relevant direct-translation policy consulted; code revision/fingerprint/lineage recorded, remains stale; actual files and numeric patch pair in same commit | Prepared |
| Tests cover actual artifacts | Browser case42 covers frozen config, independent instance copies, same-command current state, patch-only input, bounds/fallback, exception preservation and all six noncommit gates. Prior41 cases retained. Build verification checks embedded JSON equals the source in both artifacts | Execution pending at preparation |

## Implementation decisions

- Packaging Source's immutable BackendSettings into HTML is a target-platform data-transfer detail. It neither changes the JSON meaning nor creates persistent Project instance data in configuration. No Source/pseudocode revision or new configuration authority is necessary.
- No `fetch` from `file://`, duplicated JS defaults, hidden DOM control, synchronization bridge, or Source Python import is used. The JSON script element is the one packaged read-only configuration input, not a mutable editor/model mirror.
- Configuration default records are cloned for each Project. Empty text/name/asset/slot/sequence instance values remain runtime instance initialization, not config content.
- Caption Backend settings normalize only explicitly supplied known fields; omitted current fields survive. Caption numeric bounds/fallback come from JSON. No generic public result envelope is invented.
- Existing renderer calls after committed caption changes remain; full supplied-projection renderer conversion and unrelated wrappers are not claimed complete.

## Verification limits and remaining work

All application, builder and checker execution is reserved for authorized GitHub Actions. Local activity is text/file/hash/Git work only. No local Source/PlusCal execution, application test/build, parser or TLC run. No delegation.

At preparation: Actions results pending. Static `git diff --check` passes. Static comparison and test additions are not execution proof. Build escaping is explicitly implemented, but adversarial configuration values are not yet covered by a dedicated executable test.

Whole-goal blockers remain: label and layout ownership, graph/assets current-attempt commands, selection maps and lifecycle/API adaptation, renderer direct-read cutover, export geometry and full Source/pseudocode conformance audit. Green bounded tests cannot close those gaps. Do not mark the active implementation goal complete.
