# Review 011 — SoT / API-router boundary for the Mantine cutover

## Scope

This review corrects the ownership assumptions used after `20260916-006` and fixes the priority for the remaining Mantine cutover.

The portable single-HTML build is a packaging choice only. Frontend UI, UI FSM, API/router boundary, logic EFSM, project/domain state, and renderers remain separate logical layers even when their code is bundled into one HTML file.

## Required ownership model

```text
Frontend / Mantine / UI FSM
        |
        |  API or router only
        v
Backend/core boundary
        |
        +-- logic EFSM
        +-- project/domain SoT
        +-- functional commands
        +-- functional renderers
```

The Mantine migration must not reinterpret the logic EFSM or project model as a child implementation detail of the UI.

## Source-of-truth rule

A SoT implementation may expose read and mutation API/router operations for the value it owns.

A buffer, cache, snapshot, projection, draft, selector result, or other temporary representation is different:

- it must not expose an independent read/write API or router for the represented fact;
- it must not be referenced by unrelated functionality or backend logic;
- it must stay inside the operation/component scope that created it;
- a UI input draft is allowed to be locally mutable, but applying it must call the SoT mutation API/router;
- if a temporary value has to be shared by multiple functional areas, it is no longer an acceptable temporary projection: consumers must read the SoT again through the official boundary, or the value must be deliberately promoted to one explicit SoT.

A value is therefore not acceptable merely because it is non-persistent. A global runtime variable can still become a second functional SoT if other code reads it or makes decisions from it.

## CSV selection finding after `20260916-006`

`SELECT_ASSET` / `applyAssetSelectionAction` already owns asset-selection transition semantics and stores the selected path in `appFSM.state.assetPath`.

`20260916-006` correctly removed active Mantine asset-tree dependence on deleted native graph DOM, but replaced those presentation side effects with writes to shared runtime projections:

```js
activeDataName = csv.name;
activeDataReady = true;
rows = csv.rows;
columns = columnDefinitions(csv.rows, csv.headerLines);
```

Those writes are not accepted as the final architecture merely because the patch documentation called them temporary projections.

The following must be audited as one ownership unit:

- `activeCsvId`
- `activeDataName`
- `activeDataReady`
- `rows`
- `columns`
- direct consumers of those values
- `graphEditorSelectCsv`
- `activateChartModel`
- `graphEditorHeaderLines`
- legacy graph form/data-preview consumers

The question for each value is not whether it is persistent. The questions are:

1. What fact does it represent?
2. Which object/state machine is the SoT for that fact?
3. Is the value only a local implementation detail of that SoT, or is it a second shared representation?
4. Does any unrelated functionality read it?
5. Can frontend or another subsystem mutate it without going through the SoT API/router?

## Current authoritative candidates

The current source already provides two relevant authority mechanisms:

- project/domain values are owned by `activeProject` / `ProjectObject` and exposed through existing project accessors/registry operations;
- asset-selection transition semantics are owned by the application logic EFSM through `SELECT_ASSET`, with `appFSM.state.assetPath` representing the selected project path.

These are backend/core responsibilities. The Mantine frontend must call the existing command/router boundary rather than directly keeping a second selected-data context in frontend-visible globals.

This review does not declare every existing global runtime variable invalid in advance. Some may be internal state of the SoT implementation itself. The deciding condition is whether they are independently written/read outside that owner boundary.

## Revised patch order

### 1. `20260916-008` — CSV selection SoT/API repair

Repair the ownership unit affected by `20260916-006` before any further legacy graph UI deletion.

Required result:

- active project-tree CSV selection uses the official selection router/event;
- no newly added shared `rows` / `columns` / `activeDataName` / `activeDataReady` projection is required by the Mantine selection path;
- consumers that need selected CSV data read it from the selected project asset through the backend/core read boundary;
- temporary column derivation remains operation-local;
- no new bridge/store/cache is introduced.

If a legacy native graph editor still requires its own UI buffer, that buffer must remain inside the legacy UI ownership area and must not become the backend/frontend shared interface.

### 2. Graph mutation boundary

Audit each active Mantine `graphEditor*` mutation path.

- frontend drafts stay local;
- mutations enter the backend through an existing command/router or a minimal extracted functional command;
- frontend must not directly mutate `activeProject`, chart objects, or logic-EFSM internals.

### 3. Graph read boundary

Audit active Mantine reads.

- use existing project/selection read API where available;
- add only minimal SoT-owned read operations when a boundary is missing;
- do not create a shared presentation snapshot/read model as a replacement SoT.

### 4. Legacy native graph UI removal

Only after the read/write boundary is correct:

- remove dead native graph DOM projections, form readers, native installers, and native UI FSM bindings;
- then remove corresponding markup/CSS.

Do not delete logic-EFSM events, domain commands, project state, or functional renderers merely because a native UI caller disappeared.

### 5. Cross-area SoT audit

Recheck annotation, image, layout, and print/export cleanup using the same ownership test.

## `20260916-007`

`20260916-007` failed at `git apply --check` and changed no application source. Its intended deletion set was also chosen before this ownership clarification. Keep it as failed audit history and do not replay it wholesale.

## Patch discipline

For each ownership patch:

1. re-read current `main`;
2. identify SoT, API/router, frontend draft/buffer, and renderer separately;
3. document the ownership decision before or together with the patch;
4. generate the diff from exact current source;
5. run repository patch/syntax/build/smoke validation;
6. only then continue to the next ownership unit.
