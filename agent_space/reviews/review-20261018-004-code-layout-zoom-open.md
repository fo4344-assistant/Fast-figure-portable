# Source-code r41 — layout read/style and session zoom (OPEN)

Baseline `47fcc75b370e9bdcfbed6fdc3232f173b80fdb2a`. Source r38 closed/current and pseudocode r12 current remain unchanged; code stays stale. This bounded unit does not complete the direct-translation goal.

## Prompt-to-artifact checklist

| Explicit requirement | Actual artifact/evidence | Coverage |
| --- | --- | --- |
| Direct pseudocode implementation | `pseudocode/backend/project_state.pcal` layout.readState/NormalizePreviewReadWidth; `backend/project_efsm.pcal` LAYOUT_STYLE_CHANGED; `application/public_api/layout_annotations.pcal` read/style and five zoom procedures; `frontend/interface_fsm.pcal` ZoomIntent/Lock/Reset | Corresponding flat JS Backend, Application and Frontend ownership translated |
| Preserve logical boundaries despite physical flattening | Existing `fast-figure.js`; no new module/package/authority or legacy bridge | Backend owns style normalization/query; Application passes edits/composes session read; FSM owns zoom mutations |
| Consult Source rather than invent meaning | Source layout query width config, setStyle procedure, SET_DASHBOARD_ZOOM/LOCK/RESET rules and renderer readDashboardRenderedWidth | No new high-level meaning, Source/pseudocode edit or fabricated lineage |
| Current-authority mutation and failure | Command merges only supplied scalar fields against its current candidate; config limits; whole validation before replacement; noncommit skips read/render | Browser case45; throwing later field cannot partially commit earlier field |
| Immutable query and geometry | Backend captures one current source, copies/freezes style/visible-anchor list/preview geometry; config preview bounds/fallback; Backend does not read zoom | Browser case45 |
| Session-only zoom | Existing session scalars have one mutation owner (FSM); lock ignores intent changes; first valid lock captures width; repeated lock does not measure; unlock/reset clear anchor and reset100; no-op does not publish | Browser case46; direct API tests and exact runtime identity/Project snapshots |
| Completion notification | commitZoom sends existing completion once without Project mutation; other zoom setters use events rather than second persistent commands | Browser case46 |
| Actual version/patch record | code r41 fingerprint/current Source+pcal lineage; actual semantic diff plus numeric patch006 pair in same commit | File checks and Actions required |

## Translation and verification limits

Preview null/absent means the pseudocode NoValue and uses the sole configured fallback width; supplied finite values clamp to the configured width range. Style invalid finite conversion falls back to the current value, absent keys preserve current values, numeric zero survives, and explicit showBorders is true only for true. No Application-made whole-style candidate is sent. Runtime zoom invalid input falls back100, including non-convertible scalar input; finite0 clamps50 rather than becoming100 through truthiness. Existing runtime globals are not mirrored: their post-initialization writes now occur only inside the Frontend FSM, and readState projects them immutably.

Cases45/46 supplement the actual prior44 cases in both inline and split artifacts. They cover query isolation, config ranges, current-authority partial commands, exception/noncommit preservation, lock measurement/no-op/reset and public/runtime return boundaries. Actions pending at preparation; no local Source/application/PlusCal/parser/test/checker/build/TLC execution, and no delegation. Static Git diff/reverse-apply checks are file-only, not runtime proof.

Application retains existing post-success DOM render orchestration while translating these commands/reads. The existing applySlotStyle/applyDashboardZoom/dashboard render code still directly reads Backend geometry/style and awaits the full supplied-projection renderer cutover. This unit removes renderer-owned zoom mutation, not all renderer reads. Grid resize/merge/split, raster/caption export geometry, graph/asset command candidates and selection maps, whole renderer/public API and lifecycle alignment remain uncovered. Green bounded tests do not prove those requirements; the whole goal is not achieved. Source/pseudocode policies and optional TLC state are unchanged.

## Actions results

Pending execution on the actual implementation commit. Do not treat previous runs, manifest counts or preparation checks as r41 verification.
