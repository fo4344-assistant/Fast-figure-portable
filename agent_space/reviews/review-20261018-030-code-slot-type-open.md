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

At implementation fce2d07401d6441bf8baa3e5b8392c1ad35bb4e8, build39122086946 PASS. Regression39122086987 prior84 and86 PASS both forms;85 failed `TypeError: Cannot set properties of undefined (setting 'contentType')` in expected-state fixture: observed slots use legacy flat representation after initialize, while expectation directly assumed content. Followup accepts existing flat/canonical representation only for the test expectation, retaining exact full-Project comparison; no production change or weakened contract. Dist-only bot161bdbf inspected/fast-forwarded. Diagnostic39122086893 expected old code fingerprint FAIL, canonical actual code72 sha256:b52f1f21a4d0344f0ed3c677701ad444c9e5c5fd2b3b46c21ab9abd10a67dd28; Source41/pseudocode18 unchanged. Corrected metadata records runner digest, not local hashing. At corrected lineage ccf5a20e28f94fab35685965989993f4775ca594, regression39122153730 PASS86 inline+86 split (172 actual pass records, including85/86), inline6417798 bytes/split ZIP1735022 bytes; cumulative version39122154111 PASS with BASE_SHA34ab3ca6b830be9c9ebb04753c376a40e8ca0919 and exact Source41/pseudocode18/code72 canonical fingerprints above. Runtime/build inputs diff fce2d07..ccf5a20 sourcecode/scripts/sourcescript/pseudocode empty; build39122086946 covers identical inputs. Failed diagnostics not claimed passed.

## Bounded completion audit

Every requirement above is mapped to current implementation/UI and direct cases85/86, not green metadata alone. Inspected command validates explicit identity/current visibility before candidate mutation, preserves full payload, validates/retries from newer authority, commits once and returns actual changed facts. Wrapper sends only new scalar fields, gates render, hides internal result; failures/noncommit/postcommit errors exercised. Caller inspection finds no remaining old one-argument setContentType call or implicit pending state. Prior84 and new2 cases pass both distributions on corrected lineage. Source/pseudocode meaning unchanged; no Source rewrite to excuse legacy code. This closes only unit28. Whole code72 remains stale, larger candidate/schema/import/raster/dashboard/explicit optional pending selection adapter coverage incomplete; objective not achieved.
