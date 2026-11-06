# r133 — dashboard selection/drop to supplied screen (open)

## Scope and authority

Plan024 §3 first path: mounted dashboard drop/selection → public API → final interface state → supplied renderer. This is stage1 work, not general Backend/VFS expansion. Source45 and PlusCal25 remain unchanged. No application/test/build/checker/Actions/TLC execution is performed or claimed.

## Procedure / production caller correspondence

| Authority | Actual production route / change | Limit |
| --- | --- | --- |
| sourcescript/application/adapter.py:dispatchSlotSelection; pseudocode/application/adapter.pcal:dispatchSlotSelection | New adapter.dispatchSlotSelection validates SELECT_SLOT once, returns unchanged state/no projection on rejection, sends validated runtime intent, conditionally issues SLOT_TYPE_CHANGED only after a final non-null selection and current empty/type context, then reads renderer input with final state | Other appFSM.send SELECT_SLOT callers remain generic Frontend event dispatch, not implicit persistent-intent dispatch |
| sourcescript/frontend/renderer.py:setSelectedSlot, installSlotClickController; public contract slots.select | Public setSelectedSlot uses this operation and consumes its returned state/projection through updateGraphView. Rejected reference does not repaint or schedule resize. Renderer controller and actual Mantine layout controls already invoke this public path | Existing positional slotId/direction retained; optional third pendingContentType maps explicitly to Adapter's second parameter. No stored pending type. Default direction is ui-to-fsm per Adapter contract |
| sourcescript/application/public_api/layout_annotations.py:prepareDashboardFileDrop; corresponding PlusCal | Missing context returns false; same selected target returns true without transition/additional renderer read/repaint. Other valid target uses the same Adapter with null pending type and model-to-fsm; consumes final supplied input, not a second read in renderDashboard | Current revalidation can reject a context that became stale; no content-type command, duplicate target authority or toggle |
| sourcescript/frontend/mantine_ui.py:DASHBOARD_DROP_FLOW, DASHBOARD_DROP_LIFETIME_RULE; pseudocode/frontend/mantine_ui.pcal:MaintainDashboardDropReceiver / DashboardExternalFileDrop | Existing mounted component owns one dashboard capture listener; choosePlan is useCallback([]), collision updates do not replace it. Retain this receiver rather than invent another service. Receiver only accepts the direct dashboard slot host. dashboardExternalFileDrop now puts prepare inside try/finally so prepare query/selection/render errors also finish drag once and preserve the original failure even if cleanup throws | Source's unconditional finally/drag-only cleanup controls exceptional preparation as well; PlusCal's normal path spells out prepare then import/finalize, not a new permission to leak preparation drag state. No upper-layer semantic change |
| public assets.importToSlot lifecycle | Unchanged one public importing owner. Import awaits collision choice, then original public result/throw settles before finish. Unmount collision cleanup resolves null through existing resolver | Native browser drop, React effect lifetime and actual collision/import integration remain unexecuted |

The prior setSelectedSlot called appFSM.send then read/rendered even for rejected references and had no explicit pending intent operation. The prior drop preparation duplicated selection/render logic and reread renderer inputs. These are actual procedural omissions; this unit does not invent a new workspace/selection bridge or persistent candidate outside Project EFSM.

## State, reads, mutation and failure

- Backend validateFrontendIntent is current reference authority; Frontend FSM owns selectedSlotId/workspace; Project EFSM alone creates/validates/commits the optional type change. Rejected selection returns without renderer query or publication.
- The Adapter tuple is one operation-local result, immediately consumed by the screen wrapper. Neither state nor projection is retained, synchronized, reused by unrelated features, or fed into mutation. Type command carries only final selectedSlotId and explicit type.
- updateGraphView accepts explicit projection/state for this route; existing independent refresh callers omit them and read their own current inputs. No cache/freshness arbitration is added.
- Public selection preserves accepted runtime state if subsequent rendering throws. Drop finally clears drag bookkeeping only; import or prepare failure remains original, including the existing null/undefined import rejection handling. Cleanup-only throw still propagates.
- Generic assets.connectToSlot/tree dragging, current export capture and remaining owner translation are unchanged.

## Authored evidence and actual inspection

Existing cases37/93/94/171 only are adjusted. 37 uses real public selection/Backend/FSM for rejected, occupied, toggle-clear and empty pending intent outcomes. 93/94 follow final supplied renderer input and keep stale-reference/throw/drag-state coverage rather than demand legacy renderDashboard. 171 includes prepare+cleanup simultaneous failure without adding a new case. These are authored assertions, NOT executed results or native integration proof. The existing 167 historical IDs remain unchanged.

Static file/diff/hash inspection only: canonical LF calculation reproduces r132 fingerprint `sha256:96643e941e147d88e03cfb600af3fa31bd77f52e5644e3b9c048633110a54727` before calculating r133 `sha256:3b7606514153b8193aa84fbe069a4d1531270264326b8d6bb20c111180f09eb9`. This is not execution of the official checker; raw CRLF files were not normalized. Source/PlusCal/verification lineage is preserved; code stays stale and official version acceptance remains pending.

## Remaining objective

This completes the bounded implementation path above, not stage1. Continue plan024 §3's remaining actual screen procedure/branch/caller correspondence, especially graph/image completion/replacement/failure and narrow invalidation/geometry interaction, removing only real uncovered gaps. The previous implementation units must be considered before labeling old OPEN findings as missing again. Mounted/native execution and full stage1 audit remain open. Do not jump to stage2 capture or general stage3 owner expansion.
