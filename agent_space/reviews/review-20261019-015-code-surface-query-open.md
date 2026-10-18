# Plan023 Unit61 — official Backend surface/print read (open)

## Concrete completion contract and audit posture

Deliverables: Source Script→PlusCal→Source Code direct translation preserving all existing functionality, semantic authority and hierarchy; requirement-to-artifact/evidence coverage including assets/import/schema/serializer/raster/dashboard/timing; exact execution-SHA default-hosted inline/split cumulative regressions, independent relevant repetition, generated build, lineage and fidelity; paired patch/review/plan/lineage; no outstanding uncertainty. Tests alone are not complete coverage. Current result: NOT ACHIEVED. Code stays stale; optional verification-model/TLC remains stale/pending and not falsely passed. No local app/test/build/checker; no self-hosted/paid runner/manual dist/policy weakening.

## Current requirement/artifact mapping

Source45 sourcescript/backend/project_state.py:235-245,349-386 and PlusCal25 pseudocode/backend/project_state.pcal:546-560,616-650,712-742 explicitly require same-source immutable Backend surface input: visible local slot copies, copied owning chart, precomputed chartFigure(chartCopy,source), actual referenced CSV/columns (no conversion fake CSV), copied image bytes/nonrevocable data URL/settings, orderedSlotLabels, layout/appearance/annotations/captionReferenceStyle; print.save/print.capture additionally persistent export settings/rasterLimits. Previous runtime had NO default renderer or print export operation; createTargetExportSnapshot instead used projectObjects snapshot/live DOM/config and exportChartImage recomputed graph using active current state. This unit supplies missing official read only; downstream cutover remains OPEN, not claimed solved by unused query coverage.

- sourcecode/fast-figure.js readBackendProjection default renderer and print.save/capture export branches use buildBackendSurfaceRead(source); print-only appends settings/limits; final immutableProjectCopy detaches/freezes recursively. Build helpers never use DOM, callbacks, object URLs, mutation/normalization, frontend state, read stores or cached mirrors.
- buildBackendSurfaceRead captures one source, skips hidden cells, copies canonical slot, resolves owning chart, calculates figure using explicit source and copied chart, includes actual repeated editor-object CSV/column views, skips conversion CSV resolution, includes image input and label order/default style copy. No whole-project fallback or fake CSV asset/authority.
- buildBackendImageRead provides copied byte array, pure data URL and complete copied canonical image settings; existing images.readEditor/slot-image reads reuse it instead of dropping settings extensions via sanitizer. Runtime field `src` maps PlusCal `displayUrl`, preserving existing UI consumer naming; no independent revocable resource.
- New146 through official appFSM.query for renderer/print.save/print.capture: real public editable CSV graph, imported Plotly conversion with frames, merged hidden cell/image asset; copied chart+same source spy, visible/label ordering, CSV+columns, numeric trace, conversion no fake CSV/frame loss, original image bytes/data URL/extension preservation, recursive freeze and no authority/Frontend mutation/resource allocation. Images.readEditor complete settings checked. Six graph calculations (two slots times three reads), no frontend rendering claimed.

## Prompt-to-artifact coverage inventory (not a completion certificate)

Every authority module observed via find sourcescript -name '*.py'; modules below remain requirement-level audit OPEN unless a specific bounded review/test explicitly supplies evidence. Named scope is not evidence of complete module coverage.

| Authority | Required translation/evidence surface | Status |
|---|---|---|
| sourcescript/system.py | hierarchy/startup/order | whole audit open |
| sourcescript/backend/project_state.py | schema/settings/creation/normalization/read/ownership | units57-61 partial; constructor/global schema inventory open |
| sourcescript/backend/project_efsm.py | command ownership/current-source retry/whole validation/one binding/failure | many bounded units; all event/reentrancy inventory open |
| sourcescript/backend/assets_files.py | VFS/import/package/container/typed XML/bytes/header/dataRef | units46-56 partial; full ZIP/metadata/schema/dataRef audit open |
| sourcescript/backend/graphs.py | actual CSV/conversion/graph transformations/serializer/ownership | units38-54 partial; full command inventory open |
| sourcescript/backend/layout_annotations.py | layout/geometry/local payload/caption/labels | units38/59/60 partial; all commands/retry open |
| sourcescript/application/adapter.py | orchestration/lifecycle/command-query boundary/late errors | full audit open |
| sourcescript/application/public_api/__init__.py | every public API/read/command/export contract | partial; print.save/capture supplied input cutover OPEN |
| sourcescript/application/public_api/assets.py | routing/reservations/copied bytes/current references | units45-55 partial; full public path audit open |
| sourcescript/application/public_api/graphs.py | chart APIs/import/export/selection | partial; all wrappers/read-cutover open |
| sourcescript/application/public_api/layout_annotations.py | layout/annotation/image/print API ownership | partial; supplied renderer and raster handoff OPEN |
| sourcescript/frontend/interface_fsm.py | reference-only session/lifecycle/reconciliation | full state/event audit open |
| sourcescript/frontend/renderer.py | supplied-state-only rendering/generation ownership/resources/current capture/target geometry | official input exists in unit61; consumers and async resources OPEN |
| sourcescript/frontend/mantine_ui.py | callback-only UI facade/no domain calculation | full callbacks audit open |
| sourcescript/portable_build/portable_build.py | only generator/inline+split parity/runtime hierarchy | build/regression evidence partial; exhaustive build-input audit open |

Named artifacts/gates: agent_space/policies/development-policy.md + agent_space/AGENT.md followed without weakening; Plan023 records bounded units; numeric patch028/explanation and review015; development-versions.json source-code114/stale with unchanged Source45/PlusCal25. Workflows .github/workflows/fast-figure-regression.yml,build-distribution.yml,development-layer-version.yml,pseudocode-fidelity.yml: exact Unit61 execution PENDING. Green lineage/fidelity proves declared fingerprints/structural associations only, not semantic equivalence; regression146 covers query contract, not all UI/raster timing paths. No PR completion/merge proxy used (direct main delivery).

## Verified baseline and pending next actions

Baselineb92c0d2533bcf2c7091c3e38854e3b26ce8622d2 only generated dist successor of9a9143a7dce5bb18e6ccef79326f493bdc67a056. Exact145 regression39171492755/repeat39171494088/build39171492760/canonical39171492757/cumulative39171496389/fidelity39171498432 PASS; actual48/145 inspected both distributions/runs. New code114 fingerprint sha256:629d6bb6998aebf0e1374d4a28c97de4f2e216921ddc96e00a638ab89b26ce5f. Exact146 gates pending. Next inspect actual logs/fix smallest cause; then Application captures official print snapshot and Frontend consumes precomputed figures only, addresses current-screen one-shot viewport/limit/outcome/download/resource cleanup without live Project fallback. Global renderer generation/timing/constructor/schema inventory stays open.

Rejected adding new Source meaning, query calling DOM/Frontend/config-owning surface, fake conversion CSV, whole-project raster snapshot proxy, claiming query test proves frontend cutover. Atomic gh coherent code+lineage immediate-parent gate exception checks expected HEAD/current blobs/new paths/nonforce; ordinary docs use Contents API.
