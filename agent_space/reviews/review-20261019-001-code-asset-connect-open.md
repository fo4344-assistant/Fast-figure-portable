# Unit47 — existing asset connection (pending Actions)

## Authority and policy

Continue fully read development-policy.md v0.2.6 and AGENT.md: Source highest authority, direct PlusCal translation, no caller-owned persistent candidate, whole validation/source retry/one commit, paired numeric patch and actual runner evidence. Source45 application/public_api/assets.py connectProjectAssetToSlot passes path/kind/slotId only, commands re-resolve current non-trash matching asset and visible target, then committed-only model-to-fsm selection preserves valid independent asset selection. Pseudocode24 backend/project_efsm.pcal SLOT_DATA_CONNECTED and SLOT_IMAGE_LINKED require graph/image targets respectively; image linking assigns the reference only, not local type/settings/chart reset. ConnectDataInsideCandidate calculates graph objects/traces entirely before commit. No new Source meaning or policy change.

## Direct mapping / bounded checklist

- Public connect forwards only path/kind/slotId to kind-specific command (image LINKED, not IMPORTED); invalid kind errors, noncommit None with no target selection/render/status, committed target selection once and None return. No live slot/asset resolution/candidate in Application.
- Backend shared applyProjectAssetConnectedAction captures current state each attempt, resolves matching non-trash asset/visible same-type slot, copies canonical contents, changes only image reference or candidate graph/chart, rebuilds before whole validation, compares authority and retries before one commit. Actual changed slot/chart facts; graph add retains separate existing first-object route and no import/new asset is fabricated.
- Image link preserves canonical extensions, local settings and retained chart identity (type conversion is a separate explicit operation). Case39 previously connected to an arbitrary other slot through legacy implicit conversion; fixture now explicitly sets the required image type instead of weakening the already-current typed command contract.
- Case127: scalar payload, existing image/no new asset, image reference-only preservation with retained chart/settings/extension, independent asset selection, CSV candidate graph and one commit per command, final target/cleared graph selection.
- Case128: mismatched kind/path/target/type, unsupported kind, original validation failure, noncommit no selection, authority replacement during validation recalculates current next chart id, late selection failure keeps committed graph.

## Lineage, execution and limits

Source45/pseudocode24 unchanged. Code98 stale; canonical staged Git blob fingerprint calculated without executing local checker, runner confirmation pending. Exact-SHA128 inline+128 split/repeat/build/cumulative version/fidelity pending. No local application/test/build/checker or optional TLC. Existing aggregate rendering not claimed fully supplied-state cutover. This bounded unit does not close global initializer revalidation/reentrancy, strict XML/schema/serializer, raster resources/current snapshot, dashboard or timing integration. Whole Plan023 remains open.
