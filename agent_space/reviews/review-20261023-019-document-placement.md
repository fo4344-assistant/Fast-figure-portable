# 경로 안내 문서와 작업 기록 분리

## 범위와 원래 역할 확인

사용자 지시에 따라 경로명과 동명인 Markdown 10개와 README 3개만 확인했다. 일반 문서 전체나 구현 정리는 이 변경 범위가 아니다. 기준 HEAD는 `21758bc69ac5c4fa05cd9ec78be0b08d5ee24fc3`이다. 사용자 중지/재개 전에 있던 browser-regression.js의 검사 축소 및 review018은 별도의 선행 작업이며 이번 문서 분리로 되돌리지 않는다.

- `agent_space/tests/tests.md`: 최초 commit303292f의 5줄은 경로 역할 설명뿐이다. 6a59c38/41247ef/444f7b7과 현재 미커밋 변경으로 추가된 절차·상태·이력을 아래와 회귀 안내 파일로 이동하고 원래 5줄로 복원한다.
- `agent_space/docs/docs.md`, `agent_space/history/history.md`, `agent_space/logs/logs.md`, `agent_space/memo/memo.md`, `agent_space/research/research.md`, `agent_space/reviews/reviews.md`: 최초 생성 commit과 현재 내용이 같다. 메모 혼입이 없어 변경하지 않는다.
- `agent_space/patches/patches.md`, `agent_space/plans/plans.md`: 최초 이후 추가분은 patch/plan 명명·사용 규칙으로서 경로 안내에 해당한다. 유지한다.
- `agent_space/policies/policies.md`: 정책 문서 개명/버전/원천 안내의 갱신이다. 작업 메모가 아니며 정책 원문과 함께 변경하지 않는다.
- 루트 `README.md`: 최초 f411902 및 최근 d7aa9e2→444f7b7 diff를 확인했다. 제품 소개·설치/사용·소스 배치·파일 형식·라이선스는 안내이므로 유지한다. Plan023/r116 진행 메모 3줄만 아래로 이동한다.
- `pseudocode/README.md`: 최초3b09362와 계층 재배치 cf7b725를 확인했다. 번역 표기·조합·검사 범위 안내는 유지하고, 특정 revision/이전 flat 파일 제거 완료 서술은 아래로 이동한다. 과거 flat 구조로 되돌리지 않는다.
- `verification/README.md`: 최초ee93c75는 당시 r1 모델 설명이었으며 2eeeeac/a9f6b4a/609089c로 lineage/TLC 상태가 추가·변경됐다. 디렉터리 역할·모델 범위·추상화·bounded 해석·review 경로는 유지하고, 특정 revision/current 표/과거 run의 진행 상황은 아래로 이동한다. 현재 version registry를 README에 새로 복제하지 않는다.

## 이동 원칙과 검증 한계

아래는 **이동 당시의 원문 기록**이다. 과거 또는 미커밋 초안의 현재형 문구, case 수, current/pending 상태와 예정 patch 번호를 현재 사실로 재인증하지 않는다. 실제 최신 판정은 해당 실행 SHA/run·development-versions.json·후속 review를 확인해야 한다. 새 실행, 검증 성공, 번역 완료를 주장하지 않는다. 회귀 실행 절차와 module-build 사용 안내는 `agent_space/tests/browser-regression.md`로 분리한다. 이동 원문은 비교 가능한 그대로 보존하며 경로 안내 문서에 복사본을 남기지 않는다.

## 이동 원문 — tests.md의 case/revision/작업 기록

## Current regression scope — behavior, not adapter choreography

Removed redundant mocked adapter cases156/157/159/169. Keep existing case IDs for historical evidence; gaps are intentional, not missing tests. The suite now has167 cases, with no new cases added. Startup15, supplied renderer151/158, commit effects155 and public detached reads168 retain the relevant behavior coverage. Exact helper identity, query counts and mocked call-order traces are not acceptance criteria for ordinary wiring.

Case22 retains payload swap and guarded/normal click behavior, but no longer demands replacement of DOM nodes. Case109 retains real public trash/cascade/index-map assertions; its noneditable conversion fixture now includes the imported figure that a real conversion chart carries, rather than leaving a removed CSV as its only render source. See review-20261023-018-regression-scope.md and patch20261023-021. Runtime128, lineage and policy unchanged. The previous automatic run39928861682 failed22/109/157 in both distributions; the revised suite has not yet been executed.

The sections below describe historical authored suites, not the current count or current execution status.

## Previous file-drop/public import boundary (r128, preparation record)

171 cases are authored; syntax-only parsing and unique/complete IDs1–171 were checked, not browser behavior.170 exercises all three actual public import bindings with controlled helper outcomes: one lifecycle before helper work, exact inputs/results, success/cancel/noncommit, Error/null/undefined failure recovery and busy refusal before helper entry.171 exercises the same dashboard drop function called by the mounted listener, using the actual public import binding with a controlled pending helper: no premature drag finish, exact result identity, original failure despite cleanup failure, cleanup-only error and rejected-target finalization. It does not mount React or dispatch a native drop event. Existing116/123/135 keep exact Project identity and every non-lifecycle session field/selection assertion while allowing only public lifecycle revision/error/ready effects; pure package-read identity assertions remain unchanged.120 still tests the ordered router's single lifecycle. Native continuous listener delivery, collision Modal integration, actual Backend/DOM behavior, inline/split build and all assertions remain pending authorized Actions execution. Code128/stale canonical LF fingerprint4bf8697d36c4b2d6f38a4697cf082762199304f85003830a0ee8a280b7bed212; Source45/PlusCal25/derived lineage unchanged. Review016, plan023 unit76 and patch20261023-019 record contracts, failures and scope. This is main stage1 translation, not the deferred generic freshness follow-up or stage completion.

## Previous workspace/selection boundary (r127, execution pending)

169 cases are authored, with unique/complete IDs1–169 checked statically. New168 exercises the real existing immutable selected-slot provider through public APIs, current/none/missing selection, unchanged authority/session, detached field shape and original Error/null/undefined.169 exercises actual Application ready/workspace resolution and ordering, one official query per operation, only a supplied scalar entering Frontend, independent current audit read, no ready on read failure and exact downstream errors. Its receiving ready method is a spy; existing15 remains real startup integration and157 supplied startup orchestration coverage. Runtime127 removes Frontend FSM's Backend/live-slot helpers, routes startup/audit through Application and moves their selected-slot public consumers together. Canonical LF fingerprint d18c34f202ae7c11ce9771c580b5187e9d6eff243b5e3002ab8ef229b705d649; stale status/Source45/PlusCal25/derived lineage retained. No runtime/test/build/checker execution; all new assertions pending. No whole-stage completion or reuse of historical149/149 as current evidence. Review015, plan023 unit75 and patch20261023-018 record the actual boundary and omissions. Deferred generic freshness work is not this unit.

## Previous graph-event draft (r126, execution pending)

167 cases are authored, with unique/complete IDs1–167 checked statically. Runtime126/stale recognizes native array-form `.range` events as well as indexed range/autorange events; callback range values come from the live native presentation, not the event payload. Case166 specifies current Application ownership/settings queries, changed scalar-axis dispatch, noncommit and original errors. New167 specifies fixed callback target acquisition, replaced-chart/host rejection, delayed double-click invalidation, current final native ranges and independent range arrays. Case164 already specifies generation/same-generation operation supersession and serialized retries. None of these is executed browser/Backend/native integration evidence. The canonical LF source-code fingerprint remains0551dfecdf2365500beb5795e5a5a6f3af1df02467b249b913d442aaa146f138; raw CRLF working-tree bytes differ and were not normalized or claimed to pass the version checker. Source45/PlusCal25 unchanged. Graph-event implementation/documentation unit74 is recorded; full stage1, freshness consolidation and all execution gates remain open. See review014 and patch20261023-017.

## Earlier screen draft history

Historical local draft r125 authors165 cases (151 supplied-input screen;152 stale graph→image completion;153 independent native image decode surfaces;154 supplied narrow caption/label/image/appearance effects and live identity/NONE/fallback guards;155 actual winning-source commit effects, duplicate references and path/row distinctions;156 committed adapter fresh immutable official input, noncommit and original late-error/no-rollback boundaries). Fixtures97/98/101/102 now observe actual invalidation;107–109/112/113 observe the full supplied renderer entry, preserving transaction assertions. Case157 checks the actual supplied startup orchestration and Application one-read bridge: Source order, exact task-local inputs, no renderer Backend query, original error and no later success work. Startup15 remains the real integration coverage. Runtime122 now includes the startup cutover and updated stale fingerprint/lineage. Syntax/whitespace and unique/complete authored IDs only checked; browser/build/checker/Actions remain unrun. Cases158/159 add supplied selected-chart/workspace resolution, graph/image/none interactivity, preserved image decode/graph host lifetime, structural fallback, original graph failure/sibling ownership, and actual Application one-read/final-state handoff. Runtime123 adds that workspace boundary; all execution remains pending. Cases160/161 add exact requesting graph/operation/generation/chart resize ownership, coalesced latest explicit work, detached-host guards, native/fallback idempotent resize installation, partial-observer cleanup/original error and retry. Runtime124 implements that lifetime boundary; execution remains pending. Runtime125 removes DOM-inferred geometry scale and scopes delayed suppression cleanup to its own drag. Case157 now checks supplied final style state;162 covers overlapping drag cleanup, exact click consumption and file separation;163 covers explicit zoom/lock geometry independent of DOM measurement and finite-positive-or-none lock anchors. 164 adds controlled same-host cross-generation and same-generation graph serialization, skipped obsolete queued work/callbacks/resize, obsolete rejection silence, exact current Error/null/undefined identity despite failing status, and retry without replacing the live instance.165 covers literal supplied caption text/prefix/font/visibility on full and three narrow paths while graph record/pending/generation remain unchanged. Actual queue inspection found serialization already implemented, so this is coverage-only: runtime125/hash/lineage unchanged. Static fixture review corrected style assertions to the caption container (the real style owner), not its child text node. All new behavior is authored, execution pending. Stage1 goal is active; see review-20261023-013-screen-completion-open.md. Older149/149 supplemental results do not verify this draft.

### Export progress outcome checks (r118, pending execution)

147/149는 시작/완료 status callback과 성공 debug telemetry가 던져도 saved와 정확히 한 번의 handoff를 보존하는지 검사한다. target raster-limit과 current zero-size viewport의 status callback 실패는 각각 원래 rejected 사유를 유지해야 하며 encoding/handoff를 시작하지 않아야 한다. Error/null/undefined 동기 throw를 서로 다른 보고 경로에서 사용한다. snapshot/authority 불변 검사도 유지한다. 전체 case 수는150이며 새 실행 결과는 아직 없다. r117 이하 결과는 r118 실행 검증을 대신하지 않는다.

### Export failure regression additions (r117, pending execution)

147/149는 실제 target/current 실패와 status/debug secondary failure의 동시 발생에도 원래 예외가 유지되는지 검사한다. 148은 Plotly setup/render + purge 동시 실패와 `throw null`/`throw undefined`를 추가로 검사한다. 새150은 download handoff + revoke 동시 실패, cleanup-only 기존 동작, URL 생성 실패 시 unowned release 금지를 검사한다. 총150-case suite의 실행은 아직 하지 않았으며, r116의149/149 결과를 재사용하지 않는다. Plan023에 따라 새 application/test/build/checker 실행은 허가된 Actions에서 진행해야 한다.


### module-build 당시 작업 기록

브라우저 runner는 기존 방식대로 생성된 classic bundle 뒤에 probe script를 추가한다. probe는 bundle의 최상위 lexical binding을 읽고 일부 white-box 대역으로 교체한다. linker는 이를 위해 tree shaking/minification을 하지 않는다. 새 window debug 객체나 별도 구현으로 우회하지 않으며149개 assertion과 실제 최종 결과 attribute 판정은 유지한다. r116의 로컬 보조 실행 결과는 `agent_space/reviews/review-20261023-002-source-modules-open.md` 및 `agent_space/logs/20261023-002-module-browser.json`에 기록했다. 이는 위 Actions-only 공식 게이트 실행 결과가 아니다.

### 초기 r15 interaction regression (현재 전체 범위가 아닌 역사적 subset)

다음은 초기 테스트20–26의 검증 목적이다. 이후 ownership별 케이스와 실제 실행 결과/실패 이력은 각 review에서 추적한다. 예: review-20261018-047-code-package-import-open.md는 package import122–124 및 이전 케이스를 포함한124개 inline/split 회귀·반복의 실제 SHA/run을 기록한다. 이 목록이나 green suite만으로 전체 Plan023 정합화를 판정하지 않는다.

20. **content slot selection ownership**
   - graph/image 본문 click은 slot selection을 변경하지 않는다.
   - bookmark click만 content slot을 선택/해제한다.
   - dashboard 빈 배경 click은 선택을 해제하지 않는다.

21. **empty slot selection**
   - interactive content가 없는 empty slot surface click은 해당 slot을 선택한다.

22. **bookmark drag / post-drag click**
   - bookmark drag는 slot-local payload를 source/target 위치 사이에서 교환한다.
   - drag 자체는 slot selection을 발생시키지 않는다.
   - drop 직후의 bookmark click은 소비되어 `SELECT_SLOT`으로 해석되지 않는다.
   - 소비 후 다음 정상 bookmark click은 다시 선택 동작을 수행한다.

23. **image selection versus explicit linking**
   - project image asset 선택은 `assetSelection/assetPath`만 변경한다.
   - 선택만으로 현재 image slot의 `imageId`가 바뀌지 않는다.
   - 명시적 `assets.connectToSlot(path, "image", slotId)`에서만 연결된다.

24. **current CSV versus object CSV projection**
   - `graphs.readData().csv/columns`는 현재 단일 CSV 선택에서 나온다.
   - 선택 graph object의 `objectColumns`는 그 object의 persistent `csvId`에서 별도로 resolve한다.
   - object csvId 변경이 current CSV selection을 암묵적으로 덮지 않는다.

25. **non-editable imported graph**
   - imported Plotly chart가 `editable=false`인 동안 object add/edit/delete API가 chart를 변경하지 않는다.
   - 대응 Mantine add/delete control도 disabled 상태다.

26. **collision Modal cancel**
   - 동일 이름 asset import 중 Modal close/dismiss는 cancel이다.
   - 기존 asset replace, rename copy 생성, slot/chart mutation이 발생하지 않는다.
   - lifecycle은 다시 `ready`로 돌아온다.


## 이동 원문 — 루트 README의 포팅 진행 기록

Module ownership follows Source Script/pseudocode; the implementation is still WIP.
Remaining legacy cross-layer reads/callbacks are tracked in Plan023 and the r116 review;
physical module separation does not mark source-code alignment as complete.


## 이동 원문 — pseudocode README의 특정 revision/전환 기록

The active hierarchical `**/*.pcal` files translate Source Script r38. The previous flat r11 files are removed, not retained as fallback modules. `development-versions.json` records the authoritative revision, fingerprint, exact Source lineage and translation review; this README is not a second version registry.

Hierarchy follows Source: `system`, `backend`, `application/adapter`, the single logical `application/public_api` boundary (four physical files), `frontend`, and `portable_build`. Backend settings are read from `sourcescript/backend/settings.json`, never copied into a Frontend configuration authority. No application-code, optional verification-model, or TLC completion is implied by this cutover.


Domain algorithms are expanded in their owning files: VFS collision/replace planning, package document splitting/reassembly and ID remapping, missing-only normalization, current-candidate asset/chart construction, graph numeric transforms/selection/layout, original-position cascade maps, grid/merge/split, caption ranges/wrapping/geometry, projection-effect calculation, all public routes/results and lifecycle/resource cleanup. The spelling of current package documents and the zero-based identity rules are explicitly bound in Source r38; compatibility code is not an alternate authority.


## 이동 원문 — verification README의 과거 계보와 TLC 상황

기존 제목: `# Fast Figure verification model r26`

```text
Source Script r25
→ PlusCal pseudocode r11
→ Source Code

선택적 검증: PlusCal pseudocode r11 → verification model r26 → TLA+/TLC
```

## 현재 lineage

- Source Script: r25 / current / closed
- Source Script fingerprint: `sha256:7da7df78942382dc19d66dbf0e0759cf4f621350308b2e99d79b3ef1e6b6b73f`
- PlusCal pseudocode: r11 / current
- pseudocode fingerprint: `sha256:ead7ec7f3cc45baf2d6c88d9ccfe56ec4ebcd562444aa6741c43dee5f963cae5`
- verification-model: r26 / current
- verification fingerprint: `sha256:3d016684d15b73a3fd8889944088bd6dc21f7e1bdd041182c9dac3ac37d96e0a`
- TLC: pending

verification fingerprint는 `verification/**/*.tla`와 `verification/**/*.cfg`만 포함한다.
README 자체는 의미 fingerprint에 포함하지 않는다.


## TLC 상태

r25 최초 GitHub Actions 실행 `38703339145`에서 Boundary Core의 SANY parse는 성공했지만
`ConsumeReadProjection`의 `phase'` 변경과 `UNCHANGED vars`가 충돌하여 `read-ready` deadlock이 발견되었다.

이 오류는 Source Script/PlusCal 의미가 아니라 verification model 표현 오류로 판정했고,
r26에서 `phase`를 제외한 나머지 state만 `UNCHANGED`로 수정했다.

수정 커밋 `444927f2083652f4ce967942ae575b0c77180c7d`의 GitHub Actions run
`38703609264`에서 현재 확인된 상태는 다음과 같다.

- Interaction Core: success
- Boundary Core: success
- Slot Core: model check 실행 중

따라서 현재 상태는 다음과 같다.

```text
verification-model r26 = current derivation
TLC = pending
validation_review = null
```

실제 검증 결과가 확인된 경우에만 그에 맞는 상태와 validation review를 기록한다.
TLC 실행·통과는 plan-016 Source Code 구현 또는 `current` 판정의 필수 조건이 아니다.
