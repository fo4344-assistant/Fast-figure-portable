# Pseudocode14 / code54 — CSV rejection fidelity correction

## Supersession / corrected audit

Review018 supersedes this review's assertion that Source39 explicitly guaranteed accepted same-value revision advancement. It explicitly guaranteed rejected preservation, but the positive receipt rule was underspecified. Do not use lower pseudocode publication as authority: Source40 first closes that rule independently, then pseudocode15/code55 propagate it. Diagnostic39102118697 atab90771b6b15634c4ca5c51bf7afd78f0bb3a78b failed as expected and reported pseudocode14 sha256:945792e6825ca41944d55dbb5f8a477187db149f0913bdbd43d0541acadcc037; no completed fidelity gate claimed for this intermediate unit.

## Historical Source authority decision (qualified above)

Source39 `sourcescript/application/public_api/assets.py:selectProjectCsv` explicitly requires rejection to return none, including when an old selection already matches. `sourcescript/frontend/interface_fsm.py` specifies that rejected input preserves state/revision with no publish, while accepted external-store publication advances revision. Those upper contracts are already complete for this issue; changing Source to excuse a weaker lower branch would invert authority and is rejected.

Lower-stage audit found pseudocode13 `pseudocode/application/public_api/assets.pcal:selectProjectCsv` checked only final path/kind. A rejected repeat selection can retain both, so that branch was not a faithful translation. Earlier translation review missed the accepted-versus-already-selected distinction; green browser tests do not establish pseudocode fidelity. The previously claimed current translation needs this bounded correction, not reverse explanation from implementation.

## Direct correction and verification surface

Pseudocode14 captures the pre-event Frontend revision through the existing readState procedure, then additionally requires final.revision > priorRevision. This uses the existing Source publication/rejection contract; no domain state, new authority or persistent duplicate is introduced. The operation's remaining control flow and every other pseudocode file are unchanged. Earlier review005 remains evidence for unchanged translation areas, not proof of this correction.

Code54 re-derives the already implemented scalar query/event wrapper from the corrected intermediate branch. No production JS changes in this correction: it detects actual accepted state replacement instead of mistaking an unchanged rejected state for success. This is a language-specific discriminator for the same Source acceptance rule, not a new public meaning. Case63 exercises repeat acceptance and repeat rejection, plus copied read/current validation/errors. Broader Frontend revision/publication alignment is not claimed complete and is one reason code remains stale.

Code fingerprint sha256:c6b15fbe1ee149ea99c33d320b56a93daeb399a25cead083a99924e134d9cf49 came from diagnostic versions39102004797 at implementation683867d85b10f0de78aed6dd238b1882b3f6ff13. Regression39102004808 passed63 inline +63 split and build39102004806 passed at that SHA; dist-only c5d2f36f249dbb8768c97f2abb714ca91e158aa4 was inspected/fast-forwarded. These are code53 implementation evidence, not a completed pseudocode14 gate.

## Pending evidence / closure boundary

Canonical pseudocode14 digest and cumulative version gate against a6d6d2c35e1dde59e13f3ec159a1ede594b3927e await Actions. Checker diagnostics now include recorded/actual pseudocode digests without weakening any gate. Old pseudocode fingerprint is transparently retained until runner output, then both pseudocode fingerprint and code derivation must be corrected. Final regression at corrected lineage SHA required. All runtime/checker/build execution remains on Actions default runner. Optional TLC not run; model26 stale. Source39 stays closed/current, code54 stale and whole Plan023 open. No whole-goal completion claimed.
