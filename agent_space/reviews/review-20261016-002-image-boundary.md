# Plan 016 — image settings boundary (Source Code r34/r35 WIP)

## Scope and authority

- Start HEAD: `7439656689028b2868843e7c6270508d9cb972b2`.
- Application source complete: `2371e5f393a05fdedd1a44e1b77429fb490f678f`; r35 lineage metadata complete: `bb808b70f2850550c33a280c095ab716362c0d44`.
- Distribution bot HEAD: `43a3a05bdbc82a125d34e603a5fbd858dd48c012` (same application/test source).
- Upper references: `sourcescript/application_fsm.py` Application dispatch/read boundary; `sourcescript/layout_annotations_export.py` image read/settings operations; `sourcescript/project_efsm.py` image command ownership; `pseudocode/layout_annotations_export.pcal` ReadImageEditor/SetImageSettings; `pseudocode/application_fsm.pcal` command/reconciliation flow. These files are unchanged.
- Current Source Script r25 / PlusCal r11 remain the authority. This is a bounded WIP implementation, not a new closed design or a claim that all image/API/renderer operations now satisfy Plan 016. Source Code remains `stale`; optional TLC was not run.

## Implementation

- Backend `readBackendProjection` resolves explicit slot/image references from current Project authority for `project-api/images.readEditor` and `renderer/slot-image`, returning frozen read projections.
- Application reads Frontend selection through its state interface, dispatches the declared project command and requests fresh renderer input only after successful commit/reconciliation.
- Image settings candidate construction uses current Backend slot-local settings, applies only new edit values, normalizes and validates before commit. Other slots sharing the asset are unchanged.
- React image editor sends only the edited patch. Its read projection is display-only and is no longer spread back into mutation input. Untouched fields come from current Backend authority.
- `syncSlotImageElement` accepts only the supplied projection; it neither queries Backend/Frontend authority nor dispatches commands. Existing whole-page renderer and other image operations have not been cut over.

## Actual verification (GitHub Actions only)

| Run | HEAD | Result |
| --- | --- | --- |
| 38845342837 — Fast Figure regression | `2371e5f393a05fdedd1a44e1b77429fb490f678f` | success; syntax plus 39 inline / 39 split cases |
| 38845346181 — Development layer versions | `bb808b70f2850550c33a280c095ab716362c0d44` | success |
| 38845342850 — Build distribution | `2371e5f393a05fdedd1a44e1b77429fb490f678f` | success; generated/verified distribution, bot commit above |
| 38845564973 — Fast Figure regression | `43a3a05bdbc82a125d34e603a5fbd858dd48c012` | success; final distribution HEAD, same source, 39 inline / 39 split cases |
| 38845567464 — Development layer versions | `43a3a05bdbc82a125d34e603a5fbd858dd48c012` | success; final distribution HEAD |

Case 39 covers immutable/stale read projections, shared asset isolation, partial edits preserving untouched Backend fields, manual/contain DOM projection, bounds normalization, failed command preserving Project/Frontend state, missing selection, and a narrow renderer without authority query/command access. These are bounded regression checks, not a proof of full architectural conformance.

### Failures and corrections

- Regression 38844653305 / 38844665843 at `e375b25103df8d8c5db5e437deef9f792a9bb54e`: prior 38 cases passed; case 39 failed with `Backend did not normalize image settings`. The assertion read legacy `slot.imageSettings` rather than authoritative `slot.content.imageSettings`; assertion corrected. Regression 38844822892 at `d14b4e7858c08020df398d73bc2c94ff7dc9324a` then passed.
- Version runs 38844649614, 38844653355 and 38844823015 failed. The final diagnostic was `development-layer-version: FAIL: source-code fingerprint changed without updating development-versions.json`. Initial fingerprint incorrectly mixed Windows working-tree CRLF bytes with GitHub file bytes. Updated source transport to LF and computed the canonical file-byte fingerprint; r35 passes the actual checker on Actions. Local byte/hash calculations are not represented as checker runs.
- During the second sequential Contents update, regression 38845335167 / 38845338515 and version 38845338551 / 38845342962 saw incomplete file sets and failed. Build 38845338542 was cancelled by concurrency; later coherent runs above passed. File commits were not atomic.
- No local application, test, version checker, distribution build, or TLC execution was used. Local transport/file/hash commands are not verification. An attempted Python file/hash helper failed with `ImportError: No module named pathlib`; no project check was executed by that helper.

## Remaining work and record limits

- Full renderer projection cutover, remaining public API/domain consumer cutover, and final complete lineage/conformance review remain open under Plan 016. Do not promote Source Code to `current` based on these browser results.
- Contents API produced sequential commits, including transient inconsistent revisions. Patch 20261016-005 records the cumulative actual diff from the start HEAD through the semantic/documentation endpoint, including bot-generated distribution changes. Patch artifacts themselves are added afterwards and cannot be in the same atomic commit as the multi-file source change.
- User reiterated all helper scripts and temporary files must stay under the active working directory. Transport helper now uses `.work/` below that directory, not the OS temporary directory. Helper files outside the cloned repository are not product source and are not included in the repository patch.
