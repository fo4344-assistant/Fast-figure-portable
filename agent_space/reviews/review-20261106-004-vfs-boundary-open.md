# VFS movement, drag and selection boundary — bounded translation, open integration

## Authority and scope

Source r45 / PlusCal r25 remain unchanged. This unit translates the VFS read contracts in `sourcescript/backend/project_state.py` (`assets.movable`, `assets.moveOptions`, `assets.draggableAsset`, `assets.resolveTreeSelection`, `assets.planMove`, `assets.isTrashed`) and `pseudocode/backend/project_state.pcal` (`BuildVfsRead`, project-api dispatch), together with the direct select-asset routes in `pseudocode/application/public_api/contract.pcal` and `sourcescript/application/public_api/__init__.py`.

The scope was chosen as one connected asset-tree ownership unit, not an execution-failure fix: public movement/drag reads still bypassed official Backend queries, move candidates were filtered by Application-owned rules, and image selection published an extra graph-clear transition before the validated asset event.

## Changes

- Public isTrashed/movable/planMove now invoke explicit project-api queries. Move planning reuses the existing pure Backend calculation with the current authoritative source passed explicitly; the move command still revalidates scalar path/directory/useUniqueName at commit.
- Backend movable/moveOptions resolve the canonical requested path against the current source. Missing/fixed sources have no move destinations; directory destinations exclude the source and descendants. Existing directory order is preserved. No Application-only exclusion of trash destinations remains.
- Backend draggableAsset returns an immutable canonical kind/id/path/name identity for current CSV/images outside trash; directory/missing/trash inputs return null. resolveTreeSelection returns immutable accepted/kind/path scalars, not a live node.
- Public directory/image selection sends exactly one SELECT_ASSET through Adapter validation. Wrong-kind/missing references cannot publish preliminary graph clearing, availability updates or success diagnostics. The accepted event already owns clearing graph-object selection. UI callers use these APIs for their effects and require no return-shape bridge.
- Existing regression case112 now contains the related official-read, destination, canonical drag, valid/invalid selection and trash/restore assertions. No case or test suite was added. These assertions were not executed.

## Verification state

Only source/pseudocode/code/caller inspection, incremental diff inspection and static file/hash operations were performed. No application, test, build, checker, browser or TLC execution; no Actions, commit or remote writes. Patch applicability/whitespace checks are static diff operations, not runtime verification.

The LF-canonical git-blob fingerprint calculation reproduced r131 `sha256:b76090c94f3190e7737220658fa97f7815a684ffc4c299035bb20f0ba1cb4882` from the pre-unit baseline and calculated r132 `sha256:96643e941e147d88e03cfb600af3fa31bd77f52e5644e3b9c048633110a54727`. This is not an official version-checker pass. Checkout CRLF bytes and upper-layer lineage were not normalized or modified. Version-checker validation remains pending authorized Actions; code remains stale.

## Explicit limits

This does not close the whole asset owner, stage1, or plan023. The preexisting Application readTrash summary and its UI confirmation consumers, exact tree-projection translation, other public wrappers/reads, capture/resource lifetime and full integration remain open. No new compatibility facade, state mirror or Source semantics was introduced. Prior WIP and evidence remain intact.
