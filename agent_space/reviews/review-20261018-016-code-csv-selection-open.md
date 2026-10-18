# Code53 — public CSV asset selection (whole goal open)

## Authority

Source39 `sourcescript/application/public_api/assets.py:selectProjectCsv`, its public binding in `sourcescript/application/public_api/__init__.py`, and pseudocode13 `pseudocode/application/public_api/assets.pcal` already prescribe this operation. No upper meaning changes; Source Script stays highest authority. Code53 stays stale and TLC is optional/not run.

## Prompt → artifact checklist

- Current CSV identity/read-only copied output: `sourcecode/fast-figure.js:selectProjectCsv` queries official assets.readDeletionTarget and returns its detached target. Existing Backend immutable query from code52 is reused, not cached or made authority. Case63 checks reference/row detachment and freezing.
- Missing/wrong kind: null before Frontend event, no status/notify/clear. Case63 tests missing and directory paths with state identity unchanged.
- Valid CSV scalar intent: exactly one SELECT_ASSET with canonical path/kind, no projection/candidate; existing Backend reference validation re-resolves current authority before Frontend transition. Case63 checks one event and a rename between query and validation.
- Accepted event clears graph-object selection while preserving Project/slot/workspace. Existing Frontend SELECT_ASSET owns that transition; no standalone CLEAR_GRAPH_OBJECT remains. Case63 verifies preserved state and graph clear.
- Rejection returns null, including already-selected CSV: compare returned Frontend state with the pre-event state because a rejected adapter event returns the old state. Accepted repeat selection still produces new state. Case63 covers both.
- Original query/adapter errors propagate without successful selection. Case63 checks exact exception identity and Frontend unchanged.
- Public assets.selectCsv binds directly to the Source-named operation. No intermediate legacy bridge or domain mutation added.
- Code53 metadata keeps Source39/pseudocode13 derivations and stale status. Canonical runner digest initially awaits Actions output (preceding digest intentionally retained until diagnostic correction).

## Verification

At683867d85b10f0de78aed6dd238b1882b3f6ff13, regression39102004808 passed63 inline +63 split and build39102004806 passed (dist-only c5d2f36f249dbb8768c97f2abb714ca91e158aa4). Diagnostic version39102004797 reported actual code digest sha256:c6b15fbe1ee149ea99c33d320b56a93daeb399a25cead083a99924e134d9cf49. Subsequent static audit found pseudocode13's final-state-only check could incorrectly accept rejected repeat selection despite Source39's explicit rejection rule. Review017/patch035 correct the translation first, then re-derive code54 without JS meaning changes. Therefore these runtime passes alone do not close lineage/fidelity: final cumulative canonical gate/regression remain pending there. All execution on Actions default runner, none locally.

## Not covered

Graph-editor id-based CSV selection and image/directory selection remain separate legacy paths, not declared current. Broader asset mutations, graph normalization, import, raster/supplied-renderer integration and whole Plan023 remain open. Code52's bounded evidence is in review015; it does not prove this new unit.
