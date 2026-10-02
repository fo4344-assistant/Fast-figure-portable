# Source-code r1 sync regression diagnosis

## Purpose

This document records the failures found while aligning the application source
with Source Script r12 / archived pseudocode r2 and classifies each failure
before further implementation changes.

The authority order remains:

```text
Source Script r12
    >
verification-model r6 / TLC passed
    >
source-code target r1
```

The Source Script algorithms reviewed for the failures below do not currently
require a semantic change. Where the implementation differs from those
algorithms, the JavaScript implementation must be corrected instead.

## Test target-version rule

Every regression/test script that validates a development-layer implementation
must record the target version it is written against.

For the current browser regression the required target metadata is:

```text
source-script:       r12
verification-model:  r6
source-code target:  r1
application build:   1.1.32-wip
```

The target source-code revision is the revision being validated, not the current
revision recorded in `development-versions.json` while work is still in
progress.

A test may run while source-code metadata is still `r0/stale`, but it must
state that it targets r1 so an older/newer implementation is not accidentally
treated as the intended subject.

Future regression scripts must update their target metadata when their expected
semantics change.

## Current regression result

Work-branch run `36971524876`:

- 13 scenarios executed.
- 9 passed.
- 4 failed.
- JavaScript syntax checks passed.
- failures: multi-CSV FFSX, imported Plotly edit/FFPX, Plotly export/import,
  move-to-trash cascade.

## Failure classification

### 1. multi-CSV FFSX

Observed failure:

```text
multi-CSV references lost
```

Source Script status:

- `ffsxBuildSlot` requires all CSV assets actually referenced by the selected
  chart to be packaged.
- package-local CSV ids and graph-object `csvId` values are remapped together.
- `applyFfsxSlot` allocates new project CSV ids and remaps graph-object ids to
  those new ids before one validated commit.

The read-side check already proves that the exported package contains at least
two CSV assets, so the high-level FFSX packaging algorithm is not the observed
failure point.

Direct cause:

The test stores a pre-commit slot object:

```text
slot = activeProject.slots[0]
```

and continues to inspect `slot.chart` after `applyFfsxSlot` replaces the
authoritative project state with a candidate project.

That slot object is stale after the commit.

Classification:

```text
test script defect
```

Required change:

- preserve stable `slotId`;
- after commit, resolve the current slot with `slotAt(slotId)`;
- inspect the current chart id and chart references.

### 2. imported Plotly edit and FFPX

Observed failure:

```text
FFSX 차트가 포함되지 않은 CSV를 참조합니다.
```

Source Script status:

The Source Script intentionally defines two distinct import paths.

FFSX:

```text
package-local CSV
→ allocate project CSV
→ remap graph-object csvId
→ validate candidate
→ commit
```

Plotly JSON:

```text
parsePlotlyToEditor
→ preserve imported representation + conversionRows/conversion objects
→ commit non-editable imported chart
→ later convertImportedChartToEditable may allocate one project CSV
```

Current JavaScript defect:

`applySlotChartImportedAction` assumes every imported chart is an FFSX chart
and requires every graph-object `csvId` to exist in the FFSX `csvMap`.

That is invalid for a freshly parsed Plotly chart, whose conversion objects are
not yet project-CSV references.

The current `importSlotFile` path also clears/deletes `conversionRows`
immediately after parsing Plotly, even though Source Script requires those rows
to remain available for the later imported→editable conversion.

Classification:

```text
JavaScript implementation defect
```

Secondary test issue:

The regression keeps the old slot object after import and must re-resolve by id
before asserting the new chart state.

Required JavaScript change:

- distinguish FFSX package import from Plotly import at the mutation boundary;
- perform package-local CSV remapping only for FFSX;
- preserve Plotly `conversionRows` and conversion objects;
- keep Plotly imported chart non-editable until the explicit editable
  conversion;
- implement the imported→editable conversion as a candidate project mutation
  that creates project CSV only when conversion objects exist.

Required test change:

- re-resolve the current slot after each candidate project commit.

### 3. Plotly export and import

Observed failure:

Same FFSX-only CSV remap error as failure 2.

Classification:

```text
primary: JavaScript implementation defect
secondary: test assertion defect
```

The current test only checks the old `slot.chart` reference after import.
Because that chart existed before import, that assertion can succeed without
proving that the imported chart replaced the old one.

Required change:

- fix the shared Plotly import implementation described above;
- store `slotId` and old chart id;
- after import, resolve the current slot;
- assert that its chart resolves to the newly imported chart and that the
  imported figure semantics are present.

### 4. move-to-trash cascade

Observed failure:

```text
move did not enter trash
```

Observed test defect:

The test stores a CSV object, then performs a graph candidate commit, then
continues to call `projectAssetPath(item)` on the pre-commit CSV object.

The candidate commit replaces the authoritative project state, so that object is
stale before the move even begins.

Classification of the observed assertion failure:

```text
test script defect
```

Required test change:

- store `csvId`;
- after each candidate commit, resolve the current CSV by id;
- after move, resolve the current CSV again and test its current path.

## Additional JavaScript defect found while inspecting trash move

The observed regression assertion is a test defect, but the implementation also
contains a separate Source Script mismatch.

Source Script requires:

```text
resolve current source/destination
→ build candidate project
→ rewrite path(s) in candidate
→ detach trash-entering references in candidate
→ validate whole candidate
→ commit once
```

Current JavaScript `applyProjectNodeMovedAction` mutates
`activeProject.fileSystem.directories`, asset directory/name, and references
in place before the final project validation.

That violates the Source Script candidate-before-commit rule and can leave
partial authoritative mutations if validation fails.

Classification:

```text
JavaScript implementation defect
```

Required change:

- clone the current project into a candidate;
- resolve/rewrite the move entirely against the candidate;
- detach CSV/image references from the candidate;
- validate the candidate;
- perform one `activeProject.initialize(candidate)` commit;
- only then adjust runtime selection.

## Common implementation rule

Candidate commits replace the authoritative project object graph.

Therefore code and tests must not assume that object identity survives a commit.

Use:

```text
stable id/path
→ mutation
→ resolve current object from activeProject
```

instead of:

```text
object reference
→ mutation that replaces activeProject._state
→ continue using old object reference
```

This applies to slot, chart, CSV, image, and VFS objects.

## Planned correction order

1. Add target-version metadata to the browser regression script.
2. Fix stale-reference assertions in scenarios 5, 6, 7, and 12.
3. Separate FFSX and Plotly import handling in JavaScript.
4. Preserve Plotly conversion data until explicit editable conversion.
5. Make imported→editable conversion a whole-project candidate commit.
6. Rewrite project-node move as candidate → validate → commit.
7. Run syntax + split/portable browser regression again.
8. Only after full regression success:
   - produce source-code fingerprint;
   - raise source-code revision from r0 to r1;
   - set `derived_from.source-script` and
     `derived_from.verification-model`;
   - run development-layer version validation.

## No Source Script change

The reviewed Source Script already specifies the required behavior for all four
failure areas. No Source Script revision is required for the issues recorded
here.

## Resolution

The implementation and regression corrections were completed without changing
Source Script r12 or verification-model r6.

Final work-branch regression:

- workflow: `Source Sync Regression`
- run: `36977694199`
- job: `110744998840`
- commit under test: `a2030d5f200b10111fe2e8bbe5c7a75e5674484b`
- JavaScript syntax checks: passed
- split file:// regression: 13/13 passed
- portable file:// regression: 13/13 passed

The failure classifications in this document were confirmed by the final run.

### Resolved implementation defects

- FFSX import and Plotly import now carry distinct import semantics.
- package-local CSV remapping is applied only to FFSX.
- Plotly `conversionRows` and conversion objects are preserved while the chart
  remains non-editable.
- imported Plotly → editable conversion now creates CSV/reference state in one
  candidate project and commits only after whole-project validation.
- zero-trace Plotly import keeps empty conversion rows; no fake X/Y row is
  created.
- non-editable Plotly conversion objects are not treated as authoritative
  project-CSV references.
- project-node move is now candidate → reference detach → validate → one commit
  instead of mutating authoritative VFS/assets before validation.

### Resolved test defects

- browser regression records target versions explicitly.
- tests keep stable ids across candidate commits and re-resolve current
  slot/CSV/chart objects from the authoritative project.
- multi-CSV FFSX verifies the post-import current chart.
- Plotly import tests verify replacement chart identity and imported/editable
  semantics.
- trash move verifies the current CSV object/path rather than a stale
  pre-commit object.

### Source Script conclusion

No failure required a Source Script change. The existing algorithms already
specified the behavior implemented by these fixes.
