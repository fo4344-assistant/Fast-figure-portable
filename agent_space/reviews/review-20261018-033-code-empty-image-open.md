# Unit31 empty image insertion

Existing Source41 sourcescript/application/public_api/layout_annotations.py insertEmptyImageIntoSelectedSlot defines exact SVG data, one captured selected-slot scalar and visible image context gate, new bytes/name/MIME-only command, committed-only actual created-path read. Source backend/project_efsm.py and pseudocode19 SLOT_IMAGE_IMPORTED calculate current VFS/id and asset+reference in one candidate; display settings remain slot-local. Upper meaning unchanged, no reverse-authority rewrite. Code77 adds bounded images.insertEmpty candidate path; other legacy image imports remain explicitly unaligned.

## Source42 closure decision before lower propagation

Initial code77 regression39123076936 failed91/92 `Error: 프로젝트 슬롯 오브젝트가 올바르지 않습니다.` at candidate whole validation; prior90 pass. Source41 slot type permits a hidden-by-contentType chart reference to persist, while Source project_state.validateProjectObjectState forbids simultaneous chart+image references; empty image import only specified setting imageId. Prior closure missed interaction of these independent valid contracts, not an argument to weaken validation. At Source level choose intentional image insertion as replacement of renderable reference: remove only this slot's owned chart and clear chart reference in the same candidate before assigning new image, preserve CSV/image assets and settings/caption/geometry. Replacing existing image changes only reference, old asset retained. Rejected disallowing ordinary image-slot insertion when chart retained, two commits/rollback, keeping invalid dual references, or resetting unrelated slot settings. This is domain intent/coherent state transition, not a description of old implementation.

Closure: (1) complete paths for no context/current changed slot/current chart or image reference/new asset/failed whole validation/retry/late failure; (2) independent purpose preserves slot renderable-reference exclusivity under intentional insertion; (3) no duplicate owner/state, reuse existing owned-chart deletion/current candidate, settings stay slot-local and assets remain ordinary originals. Source42 changes backend command and Application contract first; pseudocode20 and code78 follow. Other Source41 contracts inherited unchanged, whole implementation remains stale.

## Requirement-to-artifact checklist

- No selected visible image context -> None/no command; capture once, no Application model/id/path calculation: wrapper,91/92.
- Exact UTF8 SVG/name/MIME/new input; immutable detached success target at actual created path:91 spies/byte checks.
- Current image next-id/unique VFS path, whole candidate validates/rechecks authority/retries/single commit:92 collision/newer-id/name authority hook.
- Asset creation+slot imageId only; caption/current image settings/chart/CSV/selection unchanged:91 comparisons, Backend changes only image reference and new asset/id.
- Frozen actual created image id/path/slot owner with chartId none:91.
- Validator/noncommit no partial writes or success reads/render; current slot changed to graph rejects after query; original postcommit query failure no rollback:92.

Pending actual default-runner Actions92+92/build/canonical/cumulative gate. No local runtime/checker/build. Source41/pseudocode19 unchanged, code77 stale and whole Plan023 open; full import/other assets/shared schema/raster/dashboard and serializer/timing gaps remain. Optional model/TLC not run, policy unchanged.
