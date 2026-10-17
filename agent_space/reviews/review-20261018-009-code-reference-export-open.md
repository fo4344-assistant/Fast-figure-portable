# Code r46 — reference caption layout and target scaling (OPEN)

Baseline `71e462e1e15597ea99f1a161a1bf14d4439145e0`. Source39 closed/current and pseudocode13 current are unchanged. Code46 remains stale. The permitted exception is physical module flattening only.

## Prompt-to-artifact checklist and inspected evidence

| Requirement | Implementation / evidence |
|---|---|
| Translate existing algorithm, not redesign | `pseudocode/frontend/renderer.pcal:exportCaptionLayout` and `renderDashboardTarget`; corresponding Source frontend procedures and Backend `createTargetExportSnapshot` inspected. No upper semantics changed |
| Supplied reference width/style | `exportCaptionLayout(snapshot, measureText)` uses `snapshot.layout.slotStyle.referenceWidth`, `annotations.captions` and copied `captionReferenceStyle`, never reads config/Project/DOM dimensions |
| Font readiness / failures | Await browser font loading for body and required bold prefix before measurement; original font/measure exceptions propagate. Font loading is a concrete rendering primitive, not a new domain rule |
| Exact line algorithm | Name plus one space appears only on first line; overflow emits prefix-only line if necessary and retries the same word; overlong single words remain unsplit; empty/newline paragraphs, including trailing empty paragraph, are retained; enabled empty body reserves one line; disabled returns zero without measurement; afterText is not appended |
| One measured list, same paint | Lines retain reference prefix width; reference font metrics determine height. Target painting scales those metrics and prefix advance, never rewraps or remeasures a prefix at output width; overlong text is clipped to the caption block |
| Uniform target geometry | Target geometry uses supplied width/referenceWidth, aspect, margin/gap/radius directly rather than lower-layer fallback/clamps. Automatic dashboard height is natural reference height times scale; final ceil remainder is bottom slack. DPI does not multiply pixels |
| Rejection and raster output | Snapshot-copied configured raster limits are consumed; nonpositive dashboard returns caption-height, nonpositive cells return grid-geometry before encoding/download; saved width/height are actual rounded raster dimensions |
| Concrete tests | Cases51/52 cover deterministic font/measure callbacks, prefix-only retry, unsplit word, blank paragraphs, no afterText, disabled/empty, original font failure, config-free geometry, DPI/width scaling, supplied limits, explicit height rejection, grid rejection and no Project writes. Case52 deliberately supplies an export snapshot and stubs encoding/download; it does not prove snapshot query ownership or graph rendering |
| Version / records | Revision46, actual four-path fingerprint, unchanged current upper lineage, this review, plan and patch017 pair committed with modified files |

## Choices and rejected alternatives

Rejected wrapping again at target width, using DPI as pixel scale, silently shrinking geometry, dropping trailing blank paragraphs and consuming an overflowing word before retry. They contradict the existing pseudocode rather than provide alternative implementation freedom. Browser font loading and canvas measurement are low-level concretizations. The old renderer used configured literals directly; one-job style/limit copies now come from the existing Backend snapshot construction, not a second config file or a Frontend config lookup.

The existing target exporter is not yet the complete Source renderer: its Application/Backend snapshot construction still mixes DOM style reads, options are still translated by the legacy entry, graph/image projection ownership and comprehensive finally/download handoff remain pending. This unit does not disguise that remainder as completed export conformance and does not introduce a compatibility bridge. Existing persisted data/schema, failure propagation and upper authority remain unchanged.

## Verification

Implementation and patch017 committed together as `97dc58efa60b6e8e73c17f33664c8dc1dc18eb2c`.

- Actions regression39056916573 SUCCESS at that HEAD: actual logs show cases1–52 passing in inline and split-zip; cases51/52 explicitly exercise reference measurement and target rejection/scaling.
- Version39056916480 SUCCESS at that HEAD: Source39 closed/current, pseudocode13 current and code46 stale with fingerprint `sha256:97f73a1966367ee435633d7c0309c207fe32f9b7cc0931a5e7a229b3a4e11f96`.
- Build39056916610 SUCCESS from that source: both distributions verified and dist-only bot `0946be422fd08d0380469b1f309c20fcc6dd1dbc` fast-forwarded locally.
- Actual logs retained under `.work/reference-r46-evidence/`. No observed failed run in this unit. Later result-only documentation is not the executed implementation HEAD.

No local application, Source, PlusCal, parser, checker, test, build or TLC execution. Byte fingerprinting, semantic whitespace checks and isolated-index reverse apply passed as file operations only. Whole diff whitespace inspection additionally reports existing whitespace in patch context; the actual diff is not rewritten to hide it.

## Whole-goal completion audit

Required deliverables are every current pseudocode owner directly implemented with original inputs/results/branches, candidate/validation/commit/failure/lifecycle/resource boundaries, sole configuration authority, immutable supplied-projection rendering/export, and requirement-linked verification despite physically flattened files.

This checklist covers the reference caption/target math unit only. Full export query and resource ownership, current capture, graph/assets candidate construction and import normalization, cascade positional maps, renderer direct Backend reads, complete public API/lifecycle integration and legacy removal remain uncovered. Cases1–52 and a green lineage check alone cannot prove these requirements. Goal remains open and code46 stale.
