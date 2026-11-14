# General command tuple and public-consumer translation — 2026-11-12

## Scope and authority

This records a **static pseudocode → JavaScript translation**, not executed verification and not completion of all Plan024 stage3 work. Full required policy/plan reads and relevant Source/PlusCal reads preceded edits. Source45 > PlusCal25 > target code remains the authority order; no policy, Source, PlusCal or verification-model changes were made.

The coherent unit is `dispatchProjectCommand` plus every production interpretation of its return, including adapter-local calls, public wrappers, physically Backend-located Application creators and presentation handoffs. Stage1 screen and stage2 raster scope closure from review002 remains static and was not reopened. Tree/readTrash exact projection, unrelated general freshness and the UI result ambiguities below remain open.

Baseline: HEAD `28e6dc762c75c8a2ffbbe53ed08b323f0b2b82bd`; intentional working changes and untracked artifacts were retained. Exact pre-edit working bytes, **not HEAD**, were snapshotted for this unit before editing. The incremental patch uses those bytes. No staged files, remote operation, commit/push, nested delegation or application/test/build/checker/TLC/browser/Actions execution occurred.

## General adapter procedure and branches

Authority: `sourcescript/application/adapter.py:92-116`, `pseudocode/application/adapter.pcal:88-124`. Target: `sourcecode/application/adapter.js:173-181`.

| Authoritative operation/branch | Target correspondence |
| --- | --- |
| Require registered command before command work | `PROJECT_COMMANDS.has(event)` checked before `projectEFSM.send`; unknown command throws without mutation/Frontend/query work. |
| Complete one Backend transaction | One `projectEFSM.send(event,payload)`; Backend still owns current resolution, candidate, normalization/validation, retry and one commit. |
| Read Frontend references after command | `frontendBefore = interfaceFSM.readState()` follows send. No precommand selection restoration. |
| Noncommit | Returns `[result, frontendBefore, null]`; no reconciliation, renderer query or command-success presentation. Original result identity retained. |
| Commit | One `buildFrontendReconciliationInput(event,result,frontendBefore)`; one reconciliation using its validated references/hints/maps. |
| Final Frontend state | `interfaceFSM.reconcileProjectResult` publishes once, then returns `this.readState()` (`sourcecode/frontend/interface_fsm.js:187-201`), including runtime selected slot and zoom. Returning `publish()` alone omitted those runtime fields. |
| Final renderer projection | One `readBackendProjection("renderer", {frontendState: state, mutationResult: result})`, after reconciliation. |
| Internal return | `[result,state,projection]`; no array properties, dual shape or public tuple exposure. All values remain call-local. |
| Failure | Send, reconciliation-input, reconciliation and renderer-query errors propagate. A later error neither rolls back a commit nor fabricates noncommit/success. |

`sourcecode/backend/project_state.js:528-574` retains reference resolution and hint/map validation. Application does not duplicate validation, retry, selection correction or commit. Independent valid CSV selection is retained; no corrective `SELECT_GRAPH_OBJECT` replay was added.

## Adjacent adapter consumers and presentation

Authority: `sourcescript/application/adapter.py:68-89`, `pseudocode/application/adapter.pcal:47-85`, plus public procedures mapped below.

- `sourcecode/application/adapter.js:40-58`: range-edit callback extracts result and preserves its boolean output; current editable/chart checks and no-edit no-op remain.
- `sourcecode/application/adapter.js:92-106`: slot selection extracts command result/state in the optional type-change path, but returns its distinct `[state,projectResult,projection]` order. Rejected selection remains silent; accepted selection retains its own final query, including selection with no persistent command. It does not conflate accepted selection with committed command.
- `sourcecode/application/adapter.js:124-129`: palette command extracts all tuple members, gates presentation/notification on commit, then returns the fresh official appearance read or false.
- `sourcecode/application/adapter.js:189-193`: compatibility `appFSM.send` command facade returns final Frontend state, not mutation result/tuple.
- `sourcecode/application/adapter.js:226-230`: dashboard-affecting helper extracts tuple, retains `{state,payload,projectionEffect}` outward result and existing invalidation routing.
- `sourcecode/application/adapter.js:23-37`: command presentations receive exact final state/projection; no redundant renderer/Frontend reread at this handoff. Standalone refresh still reads current authority. Existing narrow/workspace/full effect owner is unchanged; projection availability does not force full rendering.
- `sourcecode/application/adapter.js:62-66`: caption synchronization receives the exact fresh caption owner view plus supplied command geometry/runtime. Standalone callers retain current-read defaults.
- `sourcecode/application/adapter.js:131-135`: project rendering forwards supplied values. Import now presents once through this boundary, not twice.

No presentation owner, cache, retry/rollback protocol, scheduler or cross-call snapshot was introduced.

## Public procedure correspondence

In the following tables, Source and PlusCal paths are fixed by each heading; each numbered anchor identifies the procedure in that file. All affected direct dispatch callers were statically searched again after edits. Public bindings remain in `sourcecode/application/public_api/index.js:42-157`; current-selection wrappers still resolve at invocation and explicit-target procedures retain their IDs.

### Graphs

Source: `sourcescript/application/public_api/graphs.py`; PlusCal: `pseudocode/application/public_api/graphs.pcal`; target: `sourcecode/application/public_api/graphs.js`.

| Procedure | Source / PlusCal / JS start | Preserved branches/output |
| --- | --- | --- |
| graphEditorAdd | 11 / 10 / 42 | Unpack; noncommit original result; success fresh detached chart, one supplied render. |
| graphEditorObjectValues | 35 / 23 / 25 | Current index validation; command input edits, not candidate chart; fresh chart/noncommit result. |
| graphEditorMove | 59 / 33 / 60 | Valid editable equal-index branch remains command-free fresh read; mutation branch fresh chart/noncommit result. |
| graphEditorDelete | 76 / 47 / 73 | Current order/index command; supplied render and fresh chart only after commit. |
| graphEditorSetEditable | 89 / 58 / 106 | Fresh editable scalar/noncommit result; current-selected wrapper at JS114 retained. |
| graphEditorSetHeaderLines | 115 / 68 / 97 (`graphEditorHeaderLines`) | Fresh header scalar and supplied render only after commit. |
| graphEditorUpdateLayout | 132 / 79 / 152 | Fresh official layout projection; supplied render; original noncommit result. |
| graphEditorApplyPalette | 149 / 89 / 166 | Fresh chart and wrapper success effects only on commit. |
| importSelectedGraphFile | 165 / 99 / 140 | Copied file; command then fresh chart/availability/status on commit; original noncommit result. JS `(file,slotId)` signature and bindings retained. |

`setGraphObjectValuesApi`, `addGraphObjectApi`, `moveGraphObjectApi`, `deleteGraphObjectApi`, `setGraphEditableApi`, `updateGraphLayoutApi`, `applyGraphPaletteApi` continue their current-selected ID adaptation without exposing the tuple. `exportSelectedGraph` is outside this mutation unit and unchanged.

### Assets and project

Source: `sourcescript/application/public_api/assets.py`; PlusCal: `pseudocode/application/public_api/assets.pcal`. Target paths are explicit because creator wrappers remain physically under Backend.

| Procedure | Source / PlusCal | Target and preserved branches/output |
| --- | --- | --- |
| createProjectCsv / createEmptyProjectCsv | 91,113 / 113,124 | `sourcecode/backend/assets_files.js:219-242`: extracts result, returns original noncommit result or detached asset from actual committed changed path. Empty creation delegates without another lifecycle. |
| createProjectImage | 142 / 136 | `sourcecode/backend/assets_files.js:172-180`: same result extraction/actual path read contract. No relocation or owner redesign. |
| createEmptyProjectCsvAndSelect | 54 / 51 | `sourcecode/application/public_api/graphs.js:12-16`: noncommit forwarded; current CSV selection only after creation; selection rejection does not undo commit. |
| importProjectFilesToDirectory | 67 / 97 | `sourcecode/application/public_api/assets.js:51-62`: empty `[]`, cancellation null, noncommit original result, success detached input-order assets; one explicit batch candidate retained. |
| deleteProjectAsset | 173 / 146 | `sourcecode/application/public_api/assets.js:119-129`: success and noncommit null; dependent count/render/status only after commit. |
| moveProjectNode | 198 / 160 | `sourcecode/application/public_api/assets.js:149-162`: no plan/noncommit null; success actual committed path plus fresh `trashed`, existing effect routing. |
| emptyProjectTrash | 228 / 174 | `sourcecode/application/public_api/assets.js:172-179`: null return; success effect/notification gated on commit. |
| createProjectDirectory | 246 / 182 | `sourcecode/application/public_api/assets.js:164-170`: actual canonical committed path; rejected postcommit selection cannot undo creation. |
| connectProjectAssetToSlot | 267 / 195 | `sourcecode/application/public_api/assets.js:74-81`: null contract retained; selection only after commit; accepted selection presents its own final tuple once. Removed redundant second render, not selection's authoritative query. |
| importProjectFileToSlot | 297 / 209 | `sourcecode/application/public_api/assets.js:189-203`: captured explicit target; cancel null/noncommit result; fresh detached actual asset/chart after commit. |
| importProjectFile | 318 / 229 | `sourcecode/application/public_api/index.js:10-21`: copied file, original noncommit result; one supplied project render and detached fresh snapshot on commit. |
| importProjectAssetFiles | 340 / 240 | `sourcecode/application/public_api/assets.js:205-229`: single target capture; ordered per-file commits; stop on cancel/noncommit/throw; earlier commits retained, no router atomicity. |

Input-order reads, copied-file preparation and choice collection remain existing call-local helpers. `connectProjectAssetPathToSlot` delegates without tuple exposure. `selectProjectCsv` preserves independent selection. Tree/readTrash exact public projection is deferred, not silently redefined.

### Project settings, layout, images and annotations

Source: `sourcescript/application/public_api/layout_annotations.py`; PlusCal: `pseudocode/application/public_api/layout_annotations.pcal`; JS: `sourcecode/application/public_api/layout_annotations.js`, except project name in index and appearance helper in adapter.

| Procedure(s) | Source / PlusCal / JS start | Preserved branches/output |
| --- | --- | --- |
| setProjectName | 36 / 10 / `sourcecode/application/public_api/index.js:36` | Fresh string/null. |
| setSlotContentType / resetSlotApi / swapSlots | 46,54,60 / 20,28,36 / 52,73,8 | Null/null/committed boolean; supplied success presentation only. |
| insertEmptyImageIntoSelectedSlot | 68 / 44 / 38 | Actual-created detached image/null; no inferred path/asset from request. |
| mergeSlots / splitSlots | 187,210 / 152,162 / 24,31 | Fresh layout owner read/false; supplied final render only after commit. |
| applyImageSettingsFromValues | 228 / 172 / 58 | Fresh image-editor settings/false; existing narrow effect boundary. |
| setLayoutApiStyle / setLayoutApiGrid | 152,170 / 132,142 / 287,295 | Fresh layout read/false; supplied full invalidation, existing notification. |
| setLabelsApiEnabled / setLabelsApiSettings | 270,285 / 193,203 / 222,231 | Fresh label owner read/false; commit-gated supplied invalidation/notification. |
| setLabelsApiPosition / resetLabelsApiPosition | 300,317 / 213,223 / 251,261 (shared JS240) | Fresh labels/false; no second command on interaction completion. |
| setGlobalCaptionText / setSlotCaptionText | 340,362 / 241,252 / 141,151 | Fresh caption owner read/false; global exact read is supplied to caption rendering. |
| insertSlotCaptionsIntoGlobalCaption | 381 / 262 / 158 (`insertCaptionsApiSlotCaptions`) | Fresh global caption/false, exact owner read passed to sync once. |
| setCaptionsApiEnabled / setCaptionsApiName / setCaptionsApiNameBold / setCaptionsApiSettings | 403,417,431,445 / 274,284,294,304 / 131,166,175,184 | Fresh captions/false; existing full/narrow effects preserved using supplied tuple. |
| setAppearanceApiPalette / resetAppearanceApiPalette | 460,472 / 314,324 / 273,277 | Delegates to tuple-aware adapter helper; fresh appearance/false. |
| setExportSettings | 477 / 331 / 197 (`setPrintApiSettings`) | Fresh print settings/false; no unrelated screen rendering. |

`finishLabelsApiPositionInteraction` stays notification/read only. Drop selection still uses the distinct slot-selection tuple. Session zoom, export/capture and unused legacy helpers were not rewritten for volume.

## Actual public bindings, UI and lifecycle trace

- `sourcecode/application/public_api/index.js:42-157` still publishes detached public charts/settings/scalars/items, not internal tuple members. `sourcecode/system.js:277` remains the publication entry. `InvokePublicMethod` / `InvokePublicHelper` / `InvokePublicWrapper` (`pseudocode/application/public_api/contract.pcal:118-190`) keep one outer lifecycle and internal helper invocation.
- `sourcecode/frontend/mantine_ui.js:320-541`: file/delete/reset/type and image-editor paths call these public bindings. `sourcecode/frontend/mantine_ui.js:595-1033`: tree/create/move/connect/import paths retain current IDs/plans and established UI error reporting.
- `sourcecode/frontend/mantine_ui.js:1257-1315,1354-1549`: project/name/selection and graph data/layout paths consume public results rather than command tuples. CSV creation still traverses the physically Backend-located creator wrapper.
- `sourcecode/frontend/mantine_ui.js:1743-1850,1902-1928`: graph palette/import and appearance paths retain public inputs/current-target binding. UI result ambiguity below is not declared translated.
- `sourcecode/frontend/mantine_ui.js:2242-2398,2457-2549,2593-2627,2733-2988`: label/caption/print/layout controls remain public-boundary consumers; label completion notifies/reads rather than commits; caption overlay supplies explicit selected-slot ID when required.
- `sourcecode/frontend/mantine_ui.js:3009-3035`: mounted file drop retains prepare/import/finally-finish ordering and one public lifecycle. No frontend direct `dispatchProjectCommand` calls exist.
- Rejection/cancellation returned by a helper completes the outer task without manufacturing a Project commit. Thrown/rejected send/query/render failures flow through existing lifecycle failure/recovery and propagate to the UI boundary. Internal ordered imports do not reenter public lifecycle; no rollback of preceding commits.

### Still-open UI correspondence (supervisor scope decision)

`sourcecode/frontend/mantine_ui.js:1781` invokes `commitColors(valid)` and then unconditionally reports palette success; the wrapper may instead return the original noncommitted result. `sourcecode/frontend/mantine_ui.js:664` dereferences `moveProjectNode`'s result although its specified no-plan/noncommit result is null. Related palette reset UI does not define a uniform committed-result protocol either. These are pre-existing UI/Source-detail questions, not tuple regressions and **not accepted as correct/completed translation**.

Supervisor direction: do not invent a UI result protocol from the public wrapper contract (some committed APIs return undefined or mapped values), and do not change Mantine loadPalette/reset or executeProjectNodeMove in this unit. `sourcescript/frontend/mantine_ui.py` describes ownership/lifecycle but not the detailed palette-load branch. Mantine bytes are preserved. Follow-up must resolve this exact UI correspondence from upstream authority or seek an upstream choice. The implemented public wrappers themselves remain commit-gated.

## Authored fixtures and static evidence

Existing `agent_space/tests/browser-regression.js` cases were extended/adapted, **not executed**:

- Case40: unknown command pre-send rejection; noncommit tuple order/identity/silence; committed send → Frontend read → reconciliation input → reconciliation/read → renderer ordering; exact result/state/projection identities; supplied presentation without reread; postcommit renderer failure propagates while committed state persists and public success read is absent.
- Case68: actual graph move/delete wrapper passes the exact command final Frontend state/projection into `renderDashboard`; fresh graph owner reads and command-free equal-index move remain distinct from mandatory renderer query.
- Case96: distinguish the mandatory command renderer query from the existing official graph-layout success read, while retaining zero queries on noncommit/early failure.
- Existing direct-dispatch expectations and graph-range stub were adapted for the tuple (including print, equal-index, extension swap and removed-candidate-shortcut fixtures). No new suite/fixture IDs or helper-only replacement of production translation.

Static evidence: exhaustive dispatch and presentation-call searches; per-file incremental diff inspection against working-byte snapshots; whitespace/diff checks; independent canonical-LF fingerprint calculation after reading the checker implementation, without executing it. Snapshot baseline hash reproduced `sha256:789a25f36c02776a713b180ea0c9a0550c73ba9a77a34295795a968d704d94de`.

Code138 remains **stale**, fingerprint `sha256:65ac8481f55dbb75be947d677f6d199e3f9ccef95a23e54b6a6dbc880157590a`. Source45, PlusCal25, verification26/stale/TLC-pending and all `derived_from` values are unchanged. Metadata points here to record this static revision, not an executed validation. No historical run or hash is presented as execution evidence.

Incremental artifacts: `agent_space/patches/20261112-003.patch` and `agent_space/patches/20261112-003.md`. The patch includes this review/plan/metadata/fixture changes, excludes recursive patch/explanation self, and preserves earlier WIP. Remaining scope: explicit UI ambiguities above, deferred tree/readTrash and broader stage3 freshness/correspondence, followed separately by authorized native/browser/integration and official validation. Independent reviewer acceptance is still required.
