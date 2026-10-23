# Variable freshness, copied values and authority — open review

## Scope and status

User-requested review of the local supplied-input screen renderer work and its relevant Application/UI/capture callers. This is static inspection, not runtime verification or stage1 closure. Source45 > PlusCal25 > code remains the authority order. Read development-policy.md §2.3 (copies and write paths), §2.5 (minimum necessary complexity), §2.6 (resolvable reference integrity), AGENT.md, and the current renderer/adapter/interface_fsm/layout UI and Backend query/command paths. Capture findings belong to the still-open stage2 boundary; the Layout UI finding is an existing related caller risk, not established as newly introduced by the most recent changes.

The previous assumption that making scalar aliases necessarily improves ownership was insufficient. JavaScript assignment of numeric/string IDs copies primitive values, not pointers to the source property. Assignment of an object copies its reference value, not its contents; const prevents rebinding, not mutation of the referenced object. Neither form guarantees freshness. A fresh local value is also not a new authority merely because it is copied: its consumers, lifetime and use in mutation paths determine the responsibility.

## User clarification: lifetime first, not mandatory alias removal

The user clarified that slotId/chartId do NOT have to be changed or removed merely because they are copied. Determine their required lifetime and when, if ever, they must be refreshed. If a consumer requires a real-time/current value, read the original authoritative value through its owning boundary instead of retaining a stale copy. If the value identifies the operation that created a callback, retaining that fixed identity may be correct: reject an obsolete callback rather than silently retargeting it to a newer chart. Preserve single source of truth in either case. Earlier statements requiring alias removal were the assistant's overinterpretation and are superseded by this clarification.

## Refined clarification: a copied value is data duplication, not merely an alias

The user's subsequent clarification governs the interpretation above. Even a copied primitive ID is a data duplicate, not merely another name for the original property. A const binding or short lifetime does not exempt that copy from development-policy.md §2.3. Object-reference assignment is not a deep copy, but likewise does not freeze the referenced data.

There are two distinct functional contracts:

1. **Intentional fixed-time input:** asynchronous work or a defined calculation interval may REQUIRE values from a particular instant without updates during that interval. Such snapshots are permitted only with explicit acquisition instant, consistency scope, lifetime, consumers and invalidation/release rules, while respecting single source of truth and the copy/cache rules. A fixed ID sent through a callback into a mutation command participates in the write path even indirectly. It must not become another consumer's general read source. Fixing values for an operation does not confer authority on that copy or authorize arbitrary reuse; current authority validation belongs to the existing command boundary.
2. **Current-value functionality:** unless there is a deliberately designed special structure such as a performance cache, consult the authoritative original directly at the point of need through its owning boundary. Do not default to retaining a copy and later synchronizing it. A cache exception requires its own freshness/refresh/invalidation contract and the §2.3 restrictions: a one-way read cache/projection must not create authority or feed changes back. A write-participating copy must not also act as the general read source for other consumers.

For slotId/chartId specifically, decide which contract each consumer requires and trace their actual callback-to-command flow. Operation-target identity may justify a fixed copy, but its justification must cover the copy rules as well as lifetime checks. No unconditional removal, unconditional refresh, or exemption as a harmless alias is justified. The earlier lifetime-only explanation was incomplete.

## Required decision rule

- When a consumer needs the current value, read the authoritative source or its official query at each point of need. Do not treat a previous render's projection or a retained local alias as current state.
- For current-value functionality, if intermediate work can change the source, consult the authoritative original again before the dependent use, unless an explicitly justified cache contract applies. This is NOT an instruction to refresh a fixed-time calculation/async snapshot. Keep copies subject to §2.3; do not publish them as a second common state or synchronize competing authorities.
- A deliberately fixed operation input has a different contract: state when it is acquired, why it must remain fixed, its last permitted consumer, and the invalidation/cancellation rule. Do not silently replace it with newer values halfway through an operation.
- For asynchronous work, distinguish copied scalars, live object references and immutable supplied projections. Each callback must either use its valid fixed input or reacquire current authority through the owning boundary. Identity/generation checks must actually cover the association being used.
- Do not add aliases, caches, tokens or new refresh layers merely to make code look structured. Prefer direct access to an already-valid immutable input when no separate lifetime meaning is needed.
- Renderer code must not implement freshness by querying or writing Backend domain state. Application obtains official fresh input; renderer owns presentation lifetimes only. Do not use a read projection as an independent general mutation source.

## Findings from actual code

| Value / location | Acquisition and refresh / invalidation | Assessment |
| --- | --- | --- |
| slotId/chartId aliases, sourcecode/frontend/renderer.js:375–401 | Copied once per presentSuppliedGraph call; never refreshed within that call's callbacks. New calls create different bindings; generation/operation/map association gates old callbacks. Application re-resolves slot ownership. | Not a pointer or automatic property refresh. Decide from the consumer's lifetime: fixed callback target IDs may remain captured until that presentation is replaced/invalidated; current ownership/settings must be read at event time through Application. Direct access to the same old immutable slot is equivalent, not a fresh Backend read. No mandatory alias removal or demonstrated freshness defect follows from copying alone. Verify association/invalidation coverage; do not claim a memory-release or ownership improvement. |
| generation/operation and record.pending, sourcecode/frontend/renderer.js:375–409,533–653 | Full render increments dashboard generation; every graph presentation, including narrow appearance/workspace, replaces record.operation and appends serialized work. Before/after await, handlers and scheduled resize use current operation/generation/map identity. Removed/replaced record is detached/purged. | Fixed attempt identity is intentional; refreshing an obsolete callback to the latest attempt would be wrong. Controlled case164 is authored, not executed. |
| resize request identities, sourcecode/frontend/renderer.js:173–203 | Captured on every explicit schedulePlotResize; repeated requests replace the pending batch. Frame consumes/clears it; resizePlots checks generation/operation/record/IDs/host/plot and connectivity. | Intentional snapshot to reject old work, not a current domain read. Case160 authored, runtime pending. |
| drag suppression/source, sourcecode/frontend/renderer.js:234–306 | New drag owns new token; cleanup captures token and clears only if still matching and no active source. Drop copies source before deliberately clearing drag state. | Copy/token serves a concrete interaction lifetime. Case162 authored, runtime pending. |
| Application projection/state/graph settings, sourcecode/application/adapter.js:16–89 | Render/startup/workspace/geometry wrappers obtain official projection/final FSM state per synchronous call. graphRangesChanged queries graphs.readLayout per event, validates current chartId/editable, converts ranges with current axis settings, then dispatches. | Correct freshness structure on inspected paths. Case166 newly authors current linear→log settings, obsolete/missing/noneditable chart rejection, axis mapping, noncommit and original errors. It does not execute the suite or prove every API caller. |
| imageInput and image settings, sourcecode/frontend/renderer.js:425–426,453–460,599–625 | imageInput is the surface's original immutable decode input. Full render detaches old surfaces and starts new ones. Narrow settings read fresh slot.imageView.settings and update DOM; they do NOT refresh surface.imageInput.settings. Current checks use original input identity and src, not its settings as current authority. | Original input is a lifetime association, NOT a current settings store. Inspected consumers do not read its old settings. Future consumers must not reinterpret this retained input as latest domain state; do not mechanically refresh the identity token and break a pending decode. |
| Layout UI layout.gridRows/gridCols, sourcecode/frontend/mantine_ui.js:2712–2725 | Read when React renders. changeGrid fills the unspecified dimension from that captured layout. setLayoutApiGrid sends BOTH rows/cols (sourcecode/application/public_api/layout_annotations.js:296–303); Backend applyGridLayoutChangedAction uses both (sourcecode/backend/project_efsm.js:811–818). | Missing event-time freshness boundary. If current grid changes before this handler runs, the unchanged dimension can be overwritten with the old render value. React rerender is not an explicit current-value validation at command time. Fix at the existing official boundary after checking the Source API contract; do not invent a second grid store. This is a statically identified risk, not a reproduced runtime failure. |
| programmaticPlotlyRelayout, sourcecode/frontend/renderer.js:391,1395 | WeakMap initialized and read. Repository application-source search found no set/delete path populating it. The pattern already exists in the earlier module patch. | No basis to claim this suppresses programmatic events. Decide from actual Source/native callback requirements whether the guard is unnecessary dead state or needs a real scoped owner. Do not invent counter updates merely to make the map nonempty; no newly introduced runtime regression is established by this finding alone. |
| capture plot/rect/style inputs, sourcecode/frontend/renderer.js:838–846,882–900 | Geometry/style scalar fields captured before async raster work; plot is a live DOM/Plotly object reference, used after earlier slot awaits. No graph generation/operation association check protects that later native read. | Mixed lifetime is unresolved: a value snapshot plus a live object reference does not establish one capture instant. Stage2 must define operation-owned presentation/resource lifetime from its Source contract; do not silently refresh half the capture or query Backend from renderer. No capture fix is included here. |

## Concrete locations and code to revisit

Line numbers below refer to the working tree inspected for this review; they are not line numbers in a patch. Full repository-prefixed paths are given so each finding can be located directly.

### 1. Primitive ID copies — decide lifetime and refresh requirements

**Fast-figure-portable/sourcecode/frontend/renderer.js:377**:

```js
const operation = {}, slotId = slot.id, chartId = slot.content.chart;
```

Consumers: **Fast-figure-portable/sourcecode/frontend/renderer.js:379–380** uses copied slotId in the current-instance lookup; **Fast-figure-portable/sourcecode/frontend/renderer.js:399** forwards the copies:

```js
frontendActions.graphRangesChanged?.(slotId, chartId, ranges);
```

These are copied once at presentSuppliedGraph invocation, not pointers to the properties and not refreshed on later source updates. Their inspected role is to identify the presentation that owns the callback. For that role, retain the IDs for that presentation's lifetime; a new presentation acquires new IDs and generation/operation/map checks reject the old callback. Do not refresh an old callback to target a newly associated chart. Application must separately query current ownership/settings when handling the event. Confirm that the guards cover every permitted association change before accepting this lifetime contract as complete. The supplied slot is immutable; replacing aliases with slot.id/slot.content.chart on that same captured slot would NOT read newer authority. Alias retention/removal is not itself the corrective requirement.

### 2. Old React render value can become a later mutation input

**Fast-figure-portable/sourcecode/frontend/mantine_ui.js:2712** acquires the render-time read:

```js
const layout = layoutApi.readState(renderedPreviewWidth);
```

**Fast-figure-portable/sourcecode/frontend/mantine_ui.js:2722–2725** later uses it in the event handler:

```js
const changeGrid = (patch) => {
const rows = patch.rows ?? layout.gridRows;
const cols = patch.cols ?? layout.gridCols;
layoutApi.setGrid(rows, cols);
```

The row/column controls call this handler at **Fast-figure-portable/sourcecode/frontend/mantine_ui.js:2769–2784**. The stale companion dimension reaches **Fast-figure-portable/sourcecode/application/public_api/layout_annotations.js:296–297**:

```js
export function setLayoutApiGrid(rows, cols) {
  const result = dispatchProjectCommand("GRID_LAYOUT_CHANGED", { rows, cols });
```

And **Fast-figure-portable/sourcecode/backend/project_efsm.js:811–815** consumes both values:

```js
const candidate = buildGridResizeCandidate(payload.rows, payload.cols);
commitProjectCandidate(candidate, event, payload);
```

Missing boundary: when the handler needs the unchanged dimension, it has no event-time official read/current-source validation. For example, a row edit using a handler created before an independent column change can resend the old column count. This is a static data-flow risk; native React scheduling reproduction is pending. Do not replace it with a synchronized UI grid copy.

### 3. Suppression map has readers but no application-source writer

**Fast-figure-portable/sourcecode/frontend/renderer.js:1395**:

```js
programmaticPlotlyRelayout: new WeakMap(),
```

**Fast-figure-portable/sourcecode/frontend/renderer.js:391**:

```js
if (!current() || rendererRuntime.programmaticPlotlyRelayout.get(record.plot) > 0) return;
```

A repository search of application source found no population/reset path for this map. There is therefore no implemented update instant supporting the second condition. This pattern predates the latest change; whether it should be removed or given a scoped owner requires the actual callback contract, not an assumption that every declared map needs a new counter implementation.

### 4. Fixed capture geometry is paired with a live Plotly reference across await

**Fast-figure-portable/sourcecode/frontend/renderer.js:838–846** records slot geometry/styles plus the live plot object:

```js
return [{ slot, rect: element.getBoundingClientRect(), background: style.backgroundColor,
  border: style.borderColor, plot: element.querySelector(".plot-item") }];
```

**Fast-figure-portable/sourcecode/frontend/renderer.js:882–889** later reads that reference asynchronously:

```js
let plot = element.plot, imageView = element.slot.imageView;
if (plot) {
  let uri = await Plotly.toImage(plot, {
    format: "png",
    width: Math.max(2, Math.round(rect.width * scaleX)),
    height: Math.max(2, Math.round(rect.height * scaleY)),
  });
  let image = await exportImageLoad(uri);
```

The next slot can be reached only after those awaits for preceding slots. No generation/operation/host association is checked before that later Plotly read. A copied reference is NOT a frozen Plotly representation. Stage2 must establish the intended fixed capture instant and operation-owned resources; refreshing only this plot while retaining old geometry would not resolve the inconsistency.

### 5. Original decode input is not latest image settings

**Fast-figure-portable/sourcecode/frontend/renderer.js:608–612** retains the decode association:

```js
const surface = { host, element, slotId: slot.id, imageInput: image, generation, pending: null };
// current() includes:
rendererRuntime.imageSurfaces.get(slot.id) === surface && surface.imageInput === image
```

**Fast-figure-portable/sourcecode/frontend/renderer.js:453–460** applies new narrow settings from a fresh supplied input:

```js
const element = rendererRuntime.imageSurfaces.get(slot.id).element, settings = slot.imageView.settings;
```

It does not update surface.imageInput.settings. This is not currently established as a defect: original imageInput is used for decode identity/src checks, not as latest settings. The explicit maintenance constraint is that future consumers must read current settings through the proper fresh projection rather than treating this lifetime record as domain authority.

## Earlier unclosed change and evidence limits

Historical pre-unit74 status follows; the later unit74 decision below supersedes its provisional-state and165-case count statements, not its execution limits.

Before this documentation request, the working tree already contained a native Plotly array-key recognition change (`axis + ".range"` in addition to indexed keys/autorange), the scalar ID aliases discussed above, case164's array-event expectation and new case166. Metadata was provisionally moved to runtime126/stale with fingerprint sha256:0551dfecdf2365500beb5795e5a5a6f3af1df02467b249b913d442aaa146f138 and this review path. Source45/PlusCal25/derived_from remain unchanged. That fingerprint describes the CURRENT code including the aliases; it must be recomputed if runtime code changes; retaining the aliases after a justified lifetime decision does not itself require a new runtime fingerprint. Do not label the provisional unit finalized.

Node syntax-only checks and authored IDs1–166 uniqueness/completeness were checked before this review. They are not executed regression results. Earlier149/149 evidence does not verify these changes. The fresh graph-range case uses real Application callback construction with query/dispatcher spies; it specifies the handoff but does not prove native Plotly/backend integration. Tests overview still describes the last documented165-case draft and needs reconciliation when the current unit is closed.

No application/test/build/checker/Actions/TLC/commit/push/delegation/policy/upper-layer/distribution/cleanup operation is authorized or claimed here. Stage1 is NOT complete. No goal completion or new stage registration. This documentation records the deficiencies rather than silently fixing them during the user's audit request.

## Required follow-up after the current change unit

Finish the current graph-event unit first, including the slotId/chartId lifetime decision and association/invalidation review (not mandatory alias removal), actual diff review, tests/docs, revision/fingerprint/lineage as required by actual changes, and dated patch record. Then perform one coherent freshness/authority consolidation of the screen renderer and related callers, not another unbounded preparatory audit:

1. Classify each retained/captured value as live authority read, call-local immutable input, fixed operation identity/input, or an unnecessary copy.
2. Record acquisition trigger, next refresh/replacement trigger, allowed lifetime, stale-work rejection and release owner for every asynchronous or cross-event value.
3. Fix current-needed reads at the point of use through existing official owners; address the Layout event-time companion-dimension risk without a synchronized duplicate state.
4. Resolve the unused programmatic guard from the actual contract; preserve operation-specific graph/resize/drag invalidation semantics rather than refreshing every snapshot indiscriminately.
5. Keep decode input identity separate from current image settings; carry the capture live-reference finding into the explicit stage2 ownership implementation.
6. Add focused tests for source replacement between acquisition and use, repeated callbacks and obsolete completion. Keep execution pending until explicitly authorized Actions; update plan/review/patch and do not claim whole-goal completion from static checks.

Overall verdict: acquisition/refresh/invalidation has NOT been consistently planned for every inspected value. Some snapshots are deliberately correct; others require a necessity/lifetime decision or lack a current-read/lifetime boundary. Copying slotId/chartId alone is not evidence of a defect. The user instruction is to preserve one authoritative source and acquire current values when they are needed, not to create extra copies and later synchronize them.

## Unit74 graph-event implementation decision (execution pending)

Retain the existing scalar target copies in presentSuppliedGraph. This is not an exemption for aliases: they are duplicated data participating indirectly in a mutation path. Their precise contract is:

- Acquisition/consistency scope: once per presentSuppliedGraph invocation, from that invocation's immutable supplied slot, together with the new operation and generation. They identify the displayed target whose native event is being interpreted, not whichever slot/chart is selected later.
- Consumers: only this attempt's graph-instance lookup/current-work guard and its supplied graphRangesChanged intent. They are not exposed as a common read model, editable object or source for other features. The figure remains supplied operation input; native axis values are read at event handling, with a new independent range array for the synchronous handoff.
- Lifetime/replacement: every new presentation acquires a new operation and its own IDs; a full render advances generation. Removal/chart replacement discards the map association and detaches/purges the old host. Queued work, post-await work, event callbacks and delayed double-click use the same current() guard. Same-host narrow/workspace supersession is covered by operation identity even when generation stays unchanged. An obsolete closure is inert; it is not refreshed to target a new chart. No new shared cache or synchronization is introduced.
- Write authority: graphRangesChanged performs a fresh official graphs.readLayout query per callback and rejects missing, changed-chart or noneditable ownership before scalar conversion. It does not edit/submit the old renderer projection or use these copies as current settings. Current scaleType/min/max are used only within this synchronous call, then dispatchProjectCommand passes scalar intent to the existing Backend current-authority candidate/validation/commit owner. These short-lived intent copies are not a second Project authority or a general read cache.
- Release: listener replacement, detached/purged hosts and settled pending work release native/queue ownership through the existing renderer paths. The validity guard, not an assertion about garbage-collection timing, prevents late work. Tests intentionally retaining old closures must still observe no command intent after invalidation.

New167 authors the real renderer callback lifetime across chart replacement at the same slot, delayed old double-click, detached current host and current double-click final native ranges. It checks that old callbacks never retarget, native event payload arrays are not mistaken for final layout values, outgoing ranges do not alias the live native array, and immutable/domain/session state is preserved.166 checks the actual Application callback construction with query/dispatch spies;164 checks serialized generation/operation lifetime. These are authored specifications, not executed proof of the Backend/native integration.

Static evidence: Node syntax-only parsing of renderer/adapter/probe;167 unique authored IDs with none missing; source-code LF canonical fingerprint0551dfecdf2365500beb5795e5a5a6f3af1df02467b249b913d442aaa146f138 matches r126. An initial raw-byte calculation differed (d7af1de88d6613a15a7cf7a902850f62fb909d93827a249da8d61cec12d6e10d) because tracked build-script/HTML working-tree files use CRLF; independent LF calculation matched. No files were normalized, no checker was run, and no canonical-checkout execution success is claimed. Runtime was not modified in this continuation, so r126/fingerprint/lineage remain unchanged. Source45/PlusCal25 unchanged.

Unit74 implementation/coverage documentation is now recorded in patch017; its regression/native integration remains unverified. Stage1 is NOT complete. Proceed to the already requested coherent screen/current-read consolidation (grid companion value, unused programmatic guard and retained-value contracts), keeping the mixed capture-reference issue assigned to stage2. Do not repeat a preparatory audit as a substitute for those fixes. Existing execution/remote-write/cleanup restrictions remain in force.
