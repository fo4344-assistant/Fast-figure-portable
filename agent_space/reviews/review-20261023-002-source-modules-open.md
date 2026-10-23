# Source modules and portable build — r116 / OPEN

Baseline: `d7aa9e2972c83ba745ab4aaebead5c44b4251d87`. User requested implementation modules following Source Script / pseudocode, and corresponding build changes. Source45 and pseudocode25 are unchanged. Source-code116 remains **stale**: physical modularization is not whole-plan semantic conformance.

## Applied structure

- Replace editable `sourcecode/fast-figure.js` and `sourcecode/fast-figure-ui.js` with 15 runtime ES modules: Backend state/EFSM/assets/graphs/layout plus shared configuration reader; Application adapter and four public API modules; Frontend interface FSM/renderer/Mantine UI; `system.js` composition entry.
- Imports/exports replace accidental shared lexical scope. The Project singleton and UI runtime each retain one owner; no global service locator, compatibility global object, mirrored Project state, or second editable bundle is introduced.
- Initializers construct Project/registry/interface FSM/project EFSM and publish the public API in explicit order, after module evaluation. This avoids cyclic-import temporal-dead-zone reads during singleton construction. There are still dependency cycles in legacy paths; explicit initialization does not prove semantic layering.
- Pure image data-URL serialization belongs to Backend assets, DOM label CSS belongs to Frontend renderer. The shared Backend settings JSON remains the sole settings authority, embedded in each output; `backend/settings.js` is its physical configuration reader, not an invented upper-layer module.
- `sourcecode/portable_build/portable_build.mjs` links modules with pinned esbuild. Build output is a classic application script without runtime imports, preserving offline `file://` use. Python builder uses a temporary bundle, then emits the existing inline HTML and split ZIP. Generated JS is not an editable source.
- Workflows install Node22/build dependencies and follow recursive source paths. Patch application stages new modules/deletions/package files. The existing runner appends its unchanged white-box probe as a classic script after the application. It can inspect the bundle's shared top-level lexical bindings, as before; no new window debug facade or testing API is introduced. The linker deliberately preserves these bindings (no tree shaking/minification). This is not a private-IIFE runtime boundary. New four-test static build suite runs before the browser job.
- The prior uncommitted print-consumer changes and tests52/147–149 are preserved, not superseded by older committed monolithic code.

## Verification actually performed

1. `python agent_space/tests/test-module-build.py` using the available Anaconda Python: **4/4 passed**. Checks include expected module ownership paths, import resolution/build-only separation, complete version path coverage, linked runtime and offline inline/split packaging.
2. `python scripts/build-portable.py --dist-dir ../module-test-dist`: built both forms successfully outside the repository's committed `dist/`.
3. Supplemental local ego-browser check on both built file URLs, unchanged149-case probe: **149/149 inline and149/149 extracted ZIP**, no failures. Waited for the actual final result attribute with90-second wall deadlines; no virtual-time override or partial-result success. Structured aggregate evidence: `agent_space/logs/20261023-002-module-browser.json`.
4. Syntax/diff checks are recorded in the patch explanation. Canonical Git-filtered source-code fingerprint prepared as `sha256:d928846ab3f93d87f58a0d3b88f14f5ae7af865fa4545baed96567a557b2a6fc` over20 declared files (including package manifests/build inputs).

The local supplemental execution differs from Plan023's Actions-only verification procedure; it is **not** that authorized gate and does not close it. No new Actions run, official CDP runner execution, version-checker pass, TLC result, commit or push is claimed. Revision acceptance and the full integration gate remain pending. Repository `dist/` is unchanged. Review001 describes the earlier pre-execution draft; the later supplemental results here do not retroactively change that historical record.

## Remaining boundaries, explicitly not completed

- Backend `project_state.js` still exposes the legacy UI projection bridge using Frontend interfaceRuntime.
- Backend `project_efsm.js` still invokes Frontend image-display resource release. Graph/asset convenience helpers still use Application selected-state/dispatch and Frontend telemetry. They are now visible imports rather than invisible monolithic dependencies, but not completed Source responsibility cutovers.
- Frontend renderer/Mantine UI still contain live Backend reads and some legacy orchestration. Full supplied-input screen rendering and remaining Plan023 translation are open. Directory placement and a green regression suite are not evidence that these meanings conform.
- Resource lifetime/original-error preservation/general-principle follow-ups in `agent_space/memo/20261023-001.md` stay open; case148's cleanup-only expectation is not silently promoted to an upper-layer contract.

Next work should convert each remaining ownership unit directly from Source/PlusCal, then rerun the authorized whole integration/lineage gates. Do not change upper-layer meaning merely to justify an existing import. Patch20261023-002 is a cumulative, rollback-traceable working-tree patch against the baseline, including the preceding print draft; it is not intended to be stacked on patch001.
