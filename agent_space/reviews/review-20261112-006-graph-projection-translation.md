# r140 — Graph projection procedure translation

Scope: direct `pseudocode/backend/graphs.pcal` → `sourcecode/backend/graphs.js`, clarified against the complete `sourcescript/backend/graphs.py`. Both upper documents and the full runtime graph file were read in chunks without relying on truncated output. This is parent static correspondence inspection, not independent review or an executed validation.

## Procedure correspondence

| Written procedure | Runtime translation |
| --- | --- |
| NormalizeDivisor / ScaleCoordinate | Private graphScalarNumber, graphDivisor and graphScaleCoordinate: allowed scalar coercion, finite non-zero divisor or identity, linear/log/reciprocal selection, reject category on nonlinear scales and reciprocal overflow. No new domain operation. |
| tracesSingle | Max-row-width column bounds; ordered header-excluded paired rows; reject missing coordinates and unsupported scalar types; retain null/boolean/whitespace numeric conversion and linear categories; divide before independent axis transform; paired finite checks; exactly one trace or none. Config-owned limits/defaults, scatter→lines, explicit hidden visibility, bar-only fields and omitted mode/dash. |
| traces | Resolve chart and unique owner from the supplied project; reject conversion representation on this path. Resolve every object CSV from that same project; use normalized local axes and explicit per-object fallback color. Detached extension-first/known-last line/marker merge and remove extension mode when the computed bar trace omits mode. Existing figure-only axis Cartesian placeholders retained. |
| PlotlyAxis / layout | Reuse local normalizeGraphLayoutSettings, config graphRendering/axis defaults and same supplied project palette. Preserve reversal, log range and tick semantics. Deep-copy extension, record-only merges at prescribed levels, retain unknown fields/font family; actually remove omitted range/dtick/minor/minorloglabels/tickformat fields rather than emitting own undefined keys. |

The previous implementation grouped a single unnamed trace, used unbounded JS Number coercion, accepted nonfinite x on a linear axis and infinite divisors, emitted scatter mode as `scatter`, treated valid numeric zero as default, added undefined/bar-unrelated fields and retained extension layout object aliases. These are missing translations of explicit steps, not newly designed behavior. Existing physical flattened `xDivide/yDivide/xScaleType/yScaleType` objectView fields are preserved; only color now directly carries the caller-resolved object color. No public API shape changes.

## Actual callers and fixture

`chartFigure` → query-local rebuild → traces/layout remains the dashboard/export calculation route. Existing graph/csv/import/replacement command builders pass their whole-project candidate; traces now enforces the already-written chart/owner condition. Existing direct regression66 was supplied a complete synthetic project instead of only its CSV collection, and extended for scalar pairing, nonfinite arithmetic, scale order, computed styles, extension precedence/detachment, axes and layout omissions. No case IDs added. Fixtures were authored, NOT executed.

## Boundaries / remaining work

No Source/PlusCal/policy/verification changes or invented UI input semantics. No application/test/build/checker/TLC/browser/Actions/remote/commit/push execution. Independent canonical-LF hashing and patch checks only. Code140 remains stale. Source45, PlusCal25, verification26 and derived_from are unchanged.

This closes only the named graph projection translation unit, not all Backend graph procedures or Plan024 stage3. Remaining graph normalization/import/validation/candidate procedures are not certified by this record; legacy graph-object replacement post-commit projection and Backend→Application helper dependencies are also not silently accepted as closed. Backend layout procedures and the already recorded upstream UI/tree questions remain separate. Continue with those written procedures, not polishing this unit or inventing the unresolved caller semantics.
