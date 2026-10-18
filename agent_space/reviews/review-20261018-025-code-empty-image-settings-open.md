# FFPX null-image slot settings — bounded review (whole open)

## Source-first authority decision

Existing Source41 sourcescript/backend/assets_files.py:148 PACKAGE_IDENTITY_AND_SLOT_SETTINGS_RULE explicitly retains slot-local imageSettings in typed imageObject/settings even when imageRef is None; None creates no image asset. Independent purpose: settings survive temporary absence of image, owned by slot not image registry. No duplicate authority/new schema property needed; logical branches null/real refs are explicit. Pseudocode17 backend/assets_files.pcal EachSlotSplitsItsStateWithoutChangingOwnership already always encodes typed object, omits imageRef XML attribute only for null; reader restores settings without creating image. No Source or pseudocode update needed, no reverse authority from implementation. Code65 directly translates this existing meaning; preserve original real-asset bytes/identity and current wire version. Other closure/translation areas unchanged.

## Prompt-to-artifact checklist

| Requirement | Artifact | Evidence |
|---|---|---|
| Null image reference still serializes slot-local settings | ffpxBuildProject slotDocuments.imageObject always typed, imageRef null | case76 PASS39105099173 |
| Null XML attribute omitted, typed null retained, no fake asset | same builder slot XML; case76 actual map/typed decode/media count | case76 PASS39105099173 |
| Real ZIP reader restores custom fit/scale/x/y without asset | ffpxReadProject existing typed reader, case76 actual ZIP STORE/read | case76 PASS39105099173 |
| Positive reference/original bytes/settings/identity preserved | existing asset packaging unchanged; case76 supplied real image fixture | case76 PASS39105099173 |
| Detached supplied read, no live authority or source mutation | builder existing clone; case76 complete source/live comparisons | case76 PASS39105099173 |
| Current lineage and retained regression/packaging | code65 metadata stale, Actions canonical digest/version/build/76+76 | versions39105099599, regression39105099173, build39105022883 PASS; exact SHAs below |

## Exclusions and gate boundary

Not full canonical import/validation: reader's broader schema/structural checks, missing-settings/default normalization ownership, remaining graph/asset candidates, raster snapshots and supplied dashboard/API integration remain open. No policy/Source/pseudo edits, optional TLC not run. Initial provisional digest is superseded by the canonical code65 record and cumulative PASS below. All app/test/build/checker execution only Actions default runner; no local execution. Test numbers are coverage only, not whole-goal proof.

## Initial actual Actions and correction

At836b3a179e7c97670675e88fd1237cc0d1ccb51a build39105022883 PASS; regression39105022900 prior75 PASS in both distributions but76 failed `TypeError: Cannot set properties of undefined (setting 'imageId')` in fixture setup: earlier tests leave a mixture of flat/canonical slots. Correct only private fixture normalization before observation, explicitly make chosen slot image-only (remove its owned fixture chart) for the positive-image branch, no live or production repair. Strict reference/asset/settings/no-mutation assertions retained. Dist-only botaa84795234fdb28a61397043c021d46de826ecb3 inspected/fast-forwarded.

Diagnostic39105022854 canonical code65 sha256:c7c226fa184cb585746f4a958d8427bce69c9a5c3090005315376f31f50f2ef4, upper41/17 unchanged. Patch061 records digest; no runtime edits/revision bump. At corrected lineage92dabc5f7c3bb3fb1512c799208b626adaf20edc regression39105099173 PASS76 inline+76 split including real ZIP null/positive-image roundtrip and retained prior75; cumulative versions39105099599 PASS from10e3d3d880a583045295d65c4ac2becdb000eac6, automatic39105099197 PASS. Runtime/build/Source/pseudo diff from836b3a1 is empty, so build39105022883 PASS covers identical implementation inputs. Artifacts6373839-byte inline and1734198-byte split ZIP. Checklist null XML/typed settings/no media asset/positive bytes/identity/no mutation each has direct case76 evidence, not proxy green-only inference. Paired final evidence062 is docs-only. Bounded unit complete; whole code65 remains stale and goal open because listed broader requirements remain unimplemented/unverified.
