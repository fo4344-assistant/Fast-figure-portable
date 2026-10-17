# Source r38 — translation-driven decisions and closure review

## Request, scope and evidence

The active request is to finish the Source → PlusCal translation and actually return to Source when a domain decision is required. User additionally requires modified files and their numeric patch/explanation in the SAME commit. This review assesses Source semantics, not application parity or TLC execution. Baseline: `57b4731f1ede5a75b22846652e12f556ed826bec` (Source r37 closed).

Policies were reread before this unit: `agent_space/AGENT.md`, the development-policy Source/PlusCal and closure requirements. No policy text is changed. Source author notation is not an executable application; no local Source/application/PlusCal/parser/checker/test/build/TLC was run.

## Decisions made in the owning Source, then translated

| Former ambiguity exposed by translation | Source decision / reason | Translation consumer |
|---|---|---|
| Canonical Project `kind` | `backend/settings.json` owns `defaults.project.kind`; create/load use that identifier, not an invented translation constant. It is schema meaning, not sample Project data. | Backend state creation / missing-only restoration |
| Grid coordinates versus IDs | Rows/columns are one-based; initial slot IDs are zero-based in row-major order. Resize keeps existing identities and allocates monotonically new IDs from the existing maximum, never from cell position. This preserves valid identity 0 and avoids ID reuse when changing shape. | Backend grid initialization / resize / split / validation |
| Base graph object construction | `backend/graphs.py` ties fields to the existing graph-object schema/defaults and the actual candidate CSV. A new object is not a new CSV or a live-Project reread. | `BaseGraphObjectInCandidate`, graph add/connect/convert |
| Single-column and empty-column selection | Existing valid editor x/y win. Otherwise x takes the first numeric body column or first valid column; y tries another numeric, another valid, then the first column. Single-column x=y is legal; no columns gives empty strings. Numeric detection excludes missing/literal-empty cells, not valid zero. | Explicit graph data-selection loops |
| Synthetic versus original bytes | Raw imports retain original bytes. Only newly generated tables select JSON/TSV/CSV encoding from the target name, with explicit delimited escaping/cell text rules; package data references use supported encoding extensions. Editable Plotly conversion creates the explicit current-ID CSV model at a unique Backend CSV path, not an opaque constructor or another read of live state. | Explicit encoding / conversion CSV construction / package references |
| CSV header bounds | `backend/assets_files.py` specifies finite scalar conversion, truncation toward zero, clamp 0..row-count, invalid 0; new/missing stored metadata starts at 1. Supplied 0/empty/null is not missing. | Shared pure header normalization / import / header command |
| Package chart identity | FFSX deliberately omits the registered Project chart ID. Shared structural validation must not fill it with a fake ID; only installation assigns current candidate.nextId.chart. Package-local CSV remapping remains separate. Whole Project positive/unique/owner identity validation is not weakened. | FFSX writer/reader / same-candidate installation |
| Image settings without a connected image | FFPX typed slot image settings preserve a null image reference. This retains real slot-local settings without inventing an asset; reader/writer share that representation. | FFPX slot document assembly / restoration |
| Legacy input constructor shape | Supported flat/nested fields are projected into the single current Project shape, then missing settings alone are filled from Backend config and the whole candidate is validated. Invalid present data is not silently defaulted away. | Imported asset/chart/slot normalization / `buildProjectObject` |
| Single-file collision preparation | Official collision query → Application chooser once → completed immutable plan → Backend same-attempt revalidation. A plan is neither a candidate nor a reference authority. | Public slot-import preparation / batch helper |
| Projection effect | Actual pre/post visible slot/chart/data/image inputs determine reference removal and path/tree-only effect. Source-defined renderer classification consumes the committed result; no arbitrary command-name-only invalidation or second Frontend Project store. | `VisualCommitFacts` / `CalculateProjectionEffect` / renderer classification |
| Raster public outcomes | Target-save completion returns `{outcome:saved,width,height,automaticHeight}`; rejection returns `{outcome:rejected,reason}` with explicit limit/caption/grid reasons. Current capture uses the same saved/rejected shapes with automaticHeight=False. Application forwards that declared Source result unchanged; error propagation/finally cleanup are not unknown “existing outcomes.” | Target/current export finally paths / public return binding |

Relevant Source files: `sourcescript/backend/{project_state,assets_files,graphs,layout_annotations}.py`, `sourcescript/application/public_api/assets.py`, `sourcescript/frontend/renderer.py`, `sourcescript/system.py`, and the common Backend settings JSON. No additional logical module or persistent transaction/session authority is introduced.

## Closure axes

### 1. Logical completeness

Reviewed the new decisions against their producers and consumers, not just declarations. In particular: slot ID zero and object index zero are valid; missing differs from explicit null; object-reference maps use original positions; fresh import paths/IDs derive from the attempt candidate; current CSV selection is independent of graph commit hints; both package directions retain copied original bytes and reference relations; empty FFSX assets documents still exist; preserved image settings survive a null image reference; export renders exactly the caption lines used for height calculation. Failure before commit changes neither Project nor Frontend; a postcommit projection/handoff failure does not manufacture rollback.

These changes settle the domain questions encountered by the translation. Remaining low-level codecs/DOM/file-I/O operations have explicit inputs, format/shape/lifetime constraints and failure propagation; they do not decide new Project meaning.

### 2. Project purpose

The same editable chart, CSV/image import, slot geometry, per-slot settings, labels/captions, exact caption insertion/ranges, independent asset selection, and scaled dashboard export freedoms are retained. Single-column plotting is not spuriously rejected. Package restore does not discard valid explicit zero values or mutate a different live Project. Backend config contains defaults/ranges/schema constants, not sample instance data or a Frontend mirror.

### 3. Duplication and integration

The existing Source hierarchy remains unchanged. Settings have one Backend JSON authority. Data/graph/reference validation is reused for direct commands and package restoration. Imported conversion rows are not confused with real Project CSV references. Application alone owns chooser/lifecycle/public adaptation; Frontend consumes supplied projections and owns renderer-local handles. Private translation helpers bind captured read/attempt context rather than creating a second domain API. The preceding r37 closure evidence remains applicable to unchanged contracts; this table supplies the incremental integration evidence for r38.

## Conclusion / limits

Source r38 is CLOSED for direct translation on these three axes. This is not a claim that application code matches r38, that the optional verification model is current, that TLC ran, or that structural coverage proves semantics. Lower layers retain their real lineage/status until separately updated. The translation review must assess the actual newly activated files and record its own Actions results. Any newly discovered domain contradiction reopens the owning Source rather than being patched only below it.
