# Unit37 caption text Source closure and translation

## Source43 decision before lower translation

Source42 defined separate global/slot ownership but not input coercion or the difference between persisted empty global text and absent slot caption. Pseudocode20 directly assigned payload.text while code85 already converted nullish to empty and other input to text; useful scalar editing must not be discarded or silently become lower-layer authority. Domain decision: Backend command captures current source, resolves explicit global owner or strict integer visible slot id, converts nullish to empty text and otherwise language text conversion once per attempt; whitespace/Unicode/newlines preserved, no trim/placeholder substitution. Conversion errors propagate without commit. Global empty persists empty string; slot empty persists none; reads may present absent slot caption as empty string without repair. Only target text changes, all other caption settings/name/body owners/assets/selection preserved. Whole candidate validation then source-reference recheck/retry and one commit/actual changed facts apply. Application sends identities/new text only and returns fresh official projection after committed result; noncommit False/no success work.

Completeness: target/input/empty/error/retry/read semantics now explicit, existing candidate invariants inherited. Independent purpose: distinguish global document body from optional slot annotation, preserve user text, prevent editing stale/covered target. No duplicate meaning/state: one domain rule, EFSM consumes it; no editor mirror/cache. Reject raw arbitrary payload persistence (schema risk), string-only ban (unnecessarily loses useful scalar edits), trim/placeholder data (changes user content), hidden-id coercion (wrong owner), or Source merely describing current JS. Previous closure missed this boundary; closure remains bounded and existing upstream closure elsewhere inherited.

## Prompt-to-artifact checklist (execution pending)

- Source43 domain rule + Application contract → pseudocode21 TextOrEmpty/empty-to-none + existing common retry → code86 current candidate loop.
- explicit visible strict id, preserved owners/settings/selection, actual changed IDs, one commit:103/104.
- nullish/number/whitespace/Unicode/empty mapping, immutable copied global/slot read/no repair:103.
- original conversion/validator errors, noncommit/no read/effect, latest authority retry, postcommit query/reconcile errors no rollback:104.

Source43/pseudocode21 fingerprints provisional until actual Actions default-runner diagnostics; code86 stale. Tests104+104/build/cumulative gate pending. Whole Plan023 open: other asset/cascade/import/schema/raster/dashboard/legacy serializer and timing gaps not covered. No policy edit/delegation/local runtime execution; optional TLC not run.
