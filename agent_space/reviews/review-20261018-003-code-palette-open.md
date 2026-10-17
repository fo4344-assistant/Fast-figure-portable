# Source-code r40 — palette command/query and supplied CSS (OPEN)

Baseline `b9017660a7add509234d4e706529447d9830e364`. Source r38 closed/current and pseudocode r12 current are unchanged. Code r40 stays stale. This is the next bounded ownership unit, not whole application conformance.

## Prompt-to-artifact audit

| Requirement | Evidence | Scope/status |
| --- | --- | --- |
| Direct pseudocode translation | `pseudocode/backend/project_efsm.pcal` APPEARANCE_CHANGED, `application/public_api/layout_annotations.pcal` set/resetAppearanceApiPalette, `frontend/renderer.pcal` applyUiPalette | Implemented in existing flat JS |
| Consult Source before inventing meaning | Source APPEARANCE_PALETTE_RULE and sole Backend JSON: ten known keys, whole replacement, missing/invalid config defaults, preserve valid six-digit color case | No new domain decision/upper edit |
| Backend owns mutation/query | Backend builds whole palette candidate, validates and commits; project-api and renderer queries copy/freeze current palette | No mutable read or Application candidate |
| Application success/failure | Sends only new palette; noncommit false with no query/render success; throws propagate; success returns fresh official palette read | Browser case44 |
| Frontend supplied-only | applyUiPalette receives scalar palette and maps five CSS properties; no Backend query or dashboard render. Application query/orchestration is separate | Browser case44 query trap + mutation preservation |
| Flatten physical structure only | No new runtime modules, state mirrors, default literals or bridge | Preserved |
| Version/policy/patch | AGENT and target-code policy consulted; r40 lineage/fingerprint records actual app change, remains stale; actual modified files and patch004 pair commit together | Static file checks and Actions required |

## Decisions, verification and exclusions

Color normalization reads each supplied field once. Non-string or non-six-digit-hex values fall back to the corresponding sole config default; unknown keys are ignored. This is not patch merging with the previous palette. Reset copies the common immutable defaults into the same command path. Existing project-load entry now queries then supplies CSS rather than passing legacy Boolean pseudo-arguments. Application retains existing dashboard render after success; CSS renderer does not orchestrate it.

Browser case44 exercises actual APIs, commands, fresh queries, CSS, error and noncommit paths; previous43 cases remain. Actions pending at preparation. Local work is text/file/hash/Git only, no application/Source/PlusCal/test/checker/build/TLC execution and no delegation. Static diff/reverse-application checks are file checks, not runtime proof.

The prior label result record is updated using real Actions logs in this commit; that documentation is not itself an executed label HEAD. Whole layout/zoom/export ownership, graph/assets commands, selection maps, lifecycle and renderer/API cutover still require implementation/audit. Do not mark the active whole goal complete based on this bounded green subset.
