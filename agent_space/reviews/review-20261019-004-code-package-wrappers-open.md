# Plan023 Unit50 — package XML wrappers (open)

Baseline5d7475c44f3c8de1a066972d0e7add5d580760f4. Preflight clean; latest documentation lineage39166362214 PASS. Unit49 implementation795b3031075c2acced5db7c24d835b74c339c108 regression39166197880/repeat39166197778 PASS130 inline+130 split each; build39166197853/canonical39166197859/cumulative39166200944/fidelity39166203159 PASS. Do not repeat completed caption or codec work.

## Authority / direct mapping

Source45 sourcescript/backend/assets_files.py ffpxReadProject/ffsxReadSlot require same-version package documents and one typed XML grammar. PlusCal24 pseudocode/backend/assets_files.pcal:760-767 DecodeNamedXml explicitly calls RequiredSingleDirectChild and RequiredSingleValueChild. ReadFfpxDocumentPayload at813 onward and ReadFfsxDocumentPayload at1016 onward explicitly require single direct slot, settings/caption/graphObjects/dataAssets/imageAssets, optional single graph/imageObject for FFPX, required graph for FFSX, direct ordered metadata children each with one value. Source/PlusCal unchanged: these are existing semantics, not a new format or blanket unknown-element rejection.

Runtime sourcecode/fast-figure.js now translates those operations through ffpxDirectChild(root,name,optional), ffpxWrappedValue(node), ffpxNamedValue(root,name). Actual FFPX/FFSX consumers use these for document/slot/chart settings, caption, graph/image optional singleton, graphObjects and asset collections. No deep descendant CSV/image collection; preserve direct-child input order. One shared typed codec; no state write introduced. Typed object duplicate property names still use last assignment; wrapper singleton requirements do not redefine that separate rule. Rejected first-match malformed compatibility, helper-only fix, a second package parser, and Source changes to excuse runtime behavior.

## Verification / coverage limits

Case131 builds a real CSV/chart FFPX ZIP, tests valid read, then corrupts document wrappers, direct slot/chart/collection wrappers by duplication/removal/nesting, and excess values in settings/graphObject/dataAsset. Case132 does the corresponding FFSX ZIP path including required graph. Fixtures acquire current slot after the graph commit; no stale slot object is treated as authority. Both assert Project/Frontend identity remains unchanged during parsing. FFPX optional graph absence is deliberately not rejected here; whole Backend reference/type validation owns it. Existing cumulative image/package tests exercise valid optional image nodes; additional malicious image metadata cases may still be needed. No claim these cases cover all schema/ZIP/dataRef/serializer/raster/initializer/dashboard/timing contracts.

Code101 sha256:39c6904b4bf679c043a95cb68853731452f1a930ea122337c89c8b6e73949577 remains stale, derives unchanged Source45/PlusCal24. Exact-SHA132 inline+132 split/repeat/build/canonical+cumulative versions/fidelity pending. No local application/test/build/checker or optional TLC. Dist generator-only; default ubuntu-latest workflow unchanged.

## Completion checklist status

- Source hierarchy / policy / one authority: bounded mapping above; global audit OPEN.
- Package wrapper direct translation: implementation and131/132 written; runner results PENDING.
- Whole assets/import/schema/serializer coverage: OPEN, including global initializer and remaining package constraints.
- Raster/resources/current snapshot/dashboard/timing: OPEN.
- Exhaustive prompt-to-artifact requirements inventory and semantic coverage audit: OPEN; green regression/fidelity alone insufficient.
- Exact-SHA cumulative/repeat/build/lineage/fidelity: PENDING.
- Patch007/Plan023/this review/lineage101 recorded. Atomic gh Git Data publication is limited to this coherent code+lineage bundle because immediate-parent code/revision gates demonstrably reject sequential Contents writes; check actual parent/blob/new-path/ref, no force. This is the existing documented exception, not ordinary default file delivery.
- No auth/service/quota blocker observed; full objective NOT complete. Never update_goal complete while any required item remains uncertain.
