# Plan023 Unit49 — strict typed XML direct translation (open)

## Authority and bounded mapping

Source45 `sourcescript/backend/assets_files.py` TYPED_XML_RULES, ffpxEncodeValue and ffpxDecodeValue define recursive typed values, finite numbers, boolean true/false, array item/value and object property-name/value shape; unsupported runtime values and malformed shape fail. PlusCal24 `pseudocode/backend/assets_files.pcal:444-497` already specifies finite writer checks, StrictTypeAndShape, ScalarOnly, ArrayItemValueChildShape and ObjectPropertyValueChildShape. No new format/version/domain meaning or hierarchy is introduced. Source and PlusCal are unchanged.

Runtime `sourcecode/fast-figure.js` ffpxXmlValue previously wrote undefined/function/bigint/symbol/NaN/Infinity as unsupported wire types, and skipped sparse array holes. ffpxXmlReadValue previously discarded non-item/property children, ignored excess value children, coerced arbitrary booleans to false and accepted empty number text as zero. Code100 translates the established typed shape and writer failure branches. Container indentation/comment nodes remain harmless; scalar strings preserve exact text. Object property insertion uses defineProperty to preserve every explicit name (including __proto__ and empty names) without changing the object's prototype; repeated properties still use last assignment in input order as the PlusCal loop specifies. We do not invent duplicate-name rejection or unknown-attribute policy.

Case129 checks 20 malformed scalar/container/nested inputs, exact false/zero/empty/null, property-name preservation and unchanged Project/Frontend identity. Case130 checks ten unsupported scalar/nested/hole inputs, recursively escaped supported roundtrip and unchanged authority. These direct helper tests exercise the actual common codec, but do NOT by themselves prove whole-package schema, every package entry, resource lifetime or all export consumers. Existing package import/roundtrip cases remain cumulative coverage; additional adversarial whole-package coverage remains an audit task.

Rejected: filtering malformed children, coercing booleans, retaining invalid writer types for compatibility, adding a second codec, changing Source to excuse current behavior. No local application/test/build/checker or optional TLC execution; static diff inspection only. Dist remains generator-only. Source-code100 stays stale; exact new execution-SHA gates pending.

## Confirmed preceding Unit47/48 evidence

At `8b3222667ee8fc24e90fb2ebb1fce6ff59888ef1`, actual regression39165754672 and manual repeat39165754718 succeed with128 inline +128 split each, including127 actual candidate graph trace and asset preservation and128 validation/retry/noncommit/late-error. Logs show standard ubuntu-24.04 runner image. Build39165759776, cumulative development versions39165756443 (base0ba01c3fb12bb7545c2e45c7e1fbef3f006560cf) and fidelity39165758144 succeed. Fixture-only correction20261019-004 uses chart.graph.data, not chart.data. Earlier127 fixture/selection failures remain recorded in reviews001/002, not erased by these passes.

## Prompt-to-artifact completion audit (still open)

Success means every Plan023 contract directly translated without invented semantics, preserving existing features and Source hierarchy, with requirement-level coverage plus exact-SHA cumulative/repeat inline+split/build/lineage/fidelity. Current evidence is bounded, not completion.

| Requirement / artifact | Inspected evidence | Remaining obligation |
| --- | --- | --- |
| Source semantic supremacy / hierarchy / development-policy.md | Source45 and PlusCal24 typed codec, policy v0.2.6 §§1/2/3/7; changes inside existing Backend assets codec | Full cross-module hierarchy audit remains open |
| assets/import command ownership | Units43–48 reviews, preceding128+128 runs above | Global initializer validation/reentrancy and remaining owners still require audit |
| schema/serializer | Unit49 actual shared typed reader/writer branches and proposed129/130 | Exact-SHA execution plus whole-package malformed entry/schema coverage and serializers beyond typed values remain open |
| raster resources/current snapshot | Prior bounded changes are not blanket proof | Full lifetime/failure/supplied-state audit open |
| dashboard/timing | No claim from codec tests | Full consumer boundary/order/cancellation audit open |
| every Plan023 numbered item/file/command/gate | This is a partial audit, not an exhaustive manifest | Produce complete requirement inventory and individually inspect remaining implementation/evidence |
| default GitHub-hosted only / gh delivery | Preceding logs and workflow ubuntu-latest; no local runtime | New exact-SHA run logs pending; no self-hosted/paid runner |
| inline/split cumulative and repetition | Preceding128 each twice | New130 each twice pending |
| build / dist generator-only | Preceding39165759776 | New implementation build pending; never hand-edit dist |
| development-layer/fidelity | Preceding39165756443/39165758144 | New canonical+cumulative/fidelity pending; green coverage checker does not prove semantic completeness |
| numeric patch/plan/review/lineage | Pair20261019-005, Plan023 Unit49, this review, code100 fingerprint | Delivery and exact-SHA evidence pending |
| stop conditions / final completion | No explicit auth/service/quota blocker observed | Do not mark complete while any item remains uncertain; preserve run IDs/resumption point at a real blocker |

Delivery uses one atomic gh Git Data tree/commit/ref update rather than sequential Contents writes because the observed immediate-parent code/revision gates fail when matching code and lineage land in different commits. No force ref update, no policy/checker weakening. All local changes must be reviewed before publication; remote parent checked before ref update. No optional TLC requirement is introduced.
