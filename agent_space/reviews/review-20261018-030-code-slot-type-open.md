# Explicit slot content type — bounded translation review

Baseline 34ab3ca6b830be9c9ebb04753c376a40e8ca0919. Source41 remains highest; pseudocode18 unchanged; code72 stays stale pending whole Plan023 alignment.

## Authority and scope

Source `sourcescript/backend/project_efsm.py` ProjectStateMachine.send resolves explicit visible slotId; image iff contentType=image, otherwise graph; missing/hidden rejected, no pending mirror. Source `sourcescript/application/public_api/layout_annotations.py` setSlotContentType(slotId, contentType) and PROJECT_SLOT_RESULT_RULE require None both committed/noncommitted, original command/render errors, no rollback. Direct pseudocode backend SLOT_TYPE_CHANGED branch and public setSlotContentType express the same contract. No new meaning or Source edit needed. Explicit optional pendingContentType on slot selection remains a separate unaligned adapter scope: this patch removes implicit global remembered type, not that authorized explicit-intent design.

## Prompt → artifact checklist

- Explicit current target, not selection: applySlotTypeAction resolves source visible slot by integer payload.slotId; candidate clone, only content.contentType updated, validate then authority-reference retry and one initialize. Cases85/86 check explicit other slot, geometry/chart/image/assets/settings preservation, normalization, invalid id, disappearing hidden target.
- Current-authority and failure boundaries: case86 validator failure no writes/effects, newer source retries and retains newer name, now-hidden target rejected. Actual changed slotIds computed before/after; no unrelated chart/csv/image/asset facts.
- Application new fields only: setSlotContentType sends {slotId,contentType}, committed-only render, null public return including noncommit. Exact errors propagate and postcommit render error leaves committed state. Cases85/86 instrument scalar command, commits/reconciles/renders.
- No duplicate pending authority: removed pendingSlotContentType global/UI read and SELECT_SLOT mutation side path. Case85 selects graph slot after explicit other image edit and asserts no Project commit/type mutation.
- Public/UI call sites: Mantine buttons pass slot.id; all existing regression call sites now bind explicit selected id at caller. Deliberate WIP API correction, no legacy one-argument fallback that would substitute selection authority.
- Prior84 cases plus85/86 must pass inline and split; version/build actual Actions pending. Local file/Git inspection only, no local runtime execution.

## Exclusions and alternatives

Rejected retaining global pending type/one-arg overload because explicit-target Source forbids selection substitution and pending mirror. Rejected Source edits to justify old code or dropping persistent chart/image on type switch. Existing Source-authorized payload retention preserved. Shared validator remains incomplete, other commands/imports/raster/supplied dashboard/explicit selection pending intent are open; this bounded unit cannot close whole goal. Optional TLC not run.

## Execution evidence

Pending GitHub Actions default runner diagnostics, regression86+86, build and corrected canonical lineage gate. Provisional prior code fingerprint intentionally retained until runner reports canonical checkout digest; failed diagnostic is not a pass.
