# tests

## Current file-drop/public import boundary (r128, execution pending)

171 cases are authored; syntax-only parsing and unique/complete IDs1–171 were checked, not browser behavior.170 exercises all three actual public import bindings with controlled helper outcomes: one lifecycle before helper work, exact inputs/results, success/cancel/noncommit, Error/null/undefined failure recovery and busy refusal before helper entry.171 exercises the same dashboard drop function called by the mounted listener, using the actual public import binding with a controlled pending helper: no premature drag finish, exact result identity, original failure despite cleanup failure, cleanup-only error and rejected-target finalization. It does not mount React or dispatch a native drop event. Existing116/123/135 keep exact Project identity and every non-lifecycle session field/selection assertion while allowing only public lifecycle revision/error/ready effects; pure package-read identity assertions remain unchanged.120 still tests the ordered router's single lifecycle. Native continuous listener delivery, collision Modal integration, actual Backend/DOM behavior, inline/split build and all assertions remain pending authorized Actions execution. Code128/stale canonical LF fingerprint4bf8697d36c4b2d6f38a4697cf082762199304f85003830a0ee8a280b7bed212; Source45/PlusCal25/derived lineage unchanged. Review016, plan023 unit76 and patch20261023-019 record contracts, failures and scope. This is main stage1 translation, not the deferred generic freshness follow-up or stage completion.

## Previous workspace/selection boundary (r127, execution pending)

169 cases are authored, with unique/complete IDs1–169 checked statically. New168 exercises the real existing immutable selected-slot provider through public APIs, current/none/missing selection, unchanged authority/session, detached field shape and original Error/null/undefined.169 exercises actual Application ready/workspace resolution and ordering, one official query per operation, only a supplied scalar entering Frontend, independent current audit read, no ready on read failure and exact downstream errors. Its receiving ready method is a spy; existing15 remains real startup integration and157 supplied startup orchestration coverage. Runtime127 removes Frontend FSM's Backend/live-slot helpers, routes startup/audit through Application and moves their selected-slot public consumers together. Canonical LF fingerprint d18c34f202ae7c11ce9771c580b5187e9d6eff243b5e3002ab8ef229b705d649; stale status/Source45/PlusCal25/derived lineage retained. No runtime/test/build/checker execution; all new assertions pending. No whole-stage completion or reuse of historical149/149 as current evidence. Review015, plan023 unit75 and patch20261023-018 record the actual boundary and omissions. Deferred generic freshness work is not this unit.

## Previous graph-event draft (r126, execution pending)

167 cases are authored, with unique/complete IDs1–167 checked statically. Runtime126/stale recognizes native array-form `.range` events as well as indexed range/autorange events; callback range values come from the live native presentation, not the event payload. Case166 specifies current Application ownership/settings queries, changed scalar-axis dispatch, noncommit and original errors. New167 specifies fixed callback target acquisition, replaced-chart/host rejection, delayed double-click invalidation, current final native ranges and independent range arrays. Case164 already specifies generation/same-generation operation supersession and serialized retries. None of these is executed browser/Backend/native integration evidence. The canonical LF source-code fingerprint remains0551dfecdf2365500beb5795e5a5a6f3af1df02467b249b913d442aaa146f138; raw CRLF working-tree bytes differ and were not normalized or claimed to pass the version checker. Source45/PlusCal25 unchanged. Graph-event implementation/documentation unit74 is recorded; full stage1, freshness consolidation and all execution gates remain open. See review014 and patch20261023-017.

## Earlier screen draft history

Historical local draft r125 authors165 cases (151 supplied-input screen;152 stale graph→image completion;153 independent native image decode surfaces;154 supplied narrow caption/label/image/appearance effects and live identity/NONE/fallback guards;155 actual winning-source commit effects, duplicate references and path/row distinctions;156 committed adapter fresh immutable official input, noncommit and original late-error/no-rollback boundaries). Fixtures97/98/101/102 now observe actual invalidation;107–109/112/113 observe the full supplied renderer entry, preserving transaction assertions. Case157 checks the actual supplied startup orchestration and Application one-read bridge: Source order, exact task-local inputs, no renderer Backend query, original error and no later success work. Startup15 remains the real integration coverage. Runtime122 now includes the startup cutover and updated stale fingerprint/lineage. Syntax/whitespace and unique/complete authored IDs only checked; browser/build/checker/Actions remain unrun. Cases158/159 add supplied selected-chart/workspace resolution, graph/image/none interactivity, preserved image decode/graph host lifetime, structural fallback, original graph failure/sibling ownership, and actual Application one-read/final-state handoff. Runtime123 adds that workspace boundary; all execution remains pending. Cases160/161 add exact requesting graph/operation/generation/chart resize ownership, coalesced latest explicit work, detached-host guards, native/fallback idempotent resize installation, partial-observer cleanup/original error and retry. Runtime124 implements that lifetime boundary; execution remains pending. Runtime125 removes DOM-inferred geometry scale and scopes delayed suppression cleanup to its own drag. Case157 now checks supplied final style state;162 covers overlapping drag cleanup, exact click consumption and file separation;163 covers explicit zoom/lock geometry independent of DOM measurement and finite-positive-or-none lock anchors. 164 adds controlled same-host cross-generation and same-generation graph serialization, skipped obsolete queued work/callbacks/resize, obsolete rejection silence, exact current Error/null/undefined identity despite failing status, and retry without replacing the live instance.165 covers literal supplied caption text/prefix/font/visibility on full and three narrow paths while graph record/pending/generation remain unchanged. Actual queue inspection found serialization already implemented, so this is coverage-only: runtime125/hash/lineage unchanged. Static fixture review corrected style assertions to the caption container (the real style owner), not its child text node. All new behavior is authored, execution pending. Stage1 goal is active; see review-20261023-013-screen-completion-open.md. Older149/149 supplemental results do not verify this draft.
패치 적용 전후의 테스트 절차, 회귀 검사, 재현 조건, 기대 결과와 실제 결과를 보관하는 경로입니다.

테스트 실행의 원시 출력은 필요하면 `logs`에 두고, 여기에는 검증 목적과 판정에 필요한 구조화된 결과를 기록합니다.

## Browser regression

현재 계층 revision/fingerprint/파생 관계의 단일 원천은 `development-versions.json`이다. 브라우저 probe의 복제된 구버전 표를 최신 계보 증거로 사용하지 않는다. 실제 실행 SHA의 development-layer 검사와 각 ownership unit의 `agent_space/reviews/` 요구사항별 검토를 함께 확인한다. 선택적 verification-model/TLC와 브라우저 회귀는 별개이며 실행하지 않은 TLC를 통과로 취급하지 않는다.

실행:

```bash
python agent_space/tests/run-browser-regression.py
```

이 목표에서는 위 명령을 로컬에서 실행하지 않는다. 허용된 GitHub Actions 기본 GitHub-hosted POSIX runner에서 Node22 및 `npm ci`로 모듈 빌드 의존성을 설치한 뒤, Chrome/Chromium과 Python 표준 라이브러리 기반 runner로 다음 두 배포 형태를 모두 빌드·검사한다. CDP pipe로 실제 최종 결과 attribute를 기다리며 각 배포 형태의90초 wall deadline, 모든 기존 assertion/실패 판정을 유지한다. virtual-time DOM dump, 자동 재시도 또는 부분 결과의 성공 간주는 사용하지 않는다. 미완료 시 마지막 case/phase/completed 수/virtual elapsed와 stderr를 진단한다.

- inline `dist/inline/Fast-figure.html`
- split `dist/split/Fast-figure.zip`을 해제한 `Fast-figure.html`

기존 FFPX/FFSX, 자산 참조, 레이아웃, 폰트, export 회귀는 유지한다.

### Export progress outcome checks (r118, pending execution)

147/149는 시작/완료 status callback과 성공 debug telemetry가 던져도 saved와 정확히 한 번의 handoff를 보존하는지 검사한다. target raster-limit과 current zero-size viewport의 status callback 실패는 각각 원래 rejected 사유를 유지해야 하며 encoding/handoff를 시작하지 않아야 한다. Error/null/undefined 동기 throw를 서로 다른 보고 경로에서 사용한다. snapshot/authority 불변 검사도 유지한다. 전체 case 수는150이며 새 실행 결과는 아직 없다. r117 이하 결과는 r118 실행 검증을 대신하지 않는다.

### Export failure regression additions (r117, pending execution)

147/149는 실제 target/current 실패와 status/debug secondary failure의 동시 발생에도 원래 예외가 유지되는지 검사한다. 148은 Plotly setup/render + purge 동시 실패와 `throw null`/`throw undefined`를 추가로 검사한다. 새150은 download handoff + revoke 동시 실패, cleanup-only 기존 동작, URL 생성 실패 시 unowned release 금지를 검사한다. 총150-case suite의 실행은 아직 하지 않았으며, r116의149/149 결과를 재사용하지 않는다. Plan023에 따라 새 application/test/build/checker 실행은 허가된 Actions에서 진행해야 한다.

### Module build checks (r116)

`python agent_space/tests/test-module-build.py`는 모듈 경로/상대 import/build-only 경계, version metadata의 입력 경로 포함 여부, 실제 linker 및 inline/split 오프라인 패키징을 검사한다. `fast-figure-regression.yml`에서 브라우저 회귀 전에 실행한다. `npm ci`가 선행되어야 한다. 이 구조 검사는 Source/PlusCal 의미 정합성을 판정하지 않는다.

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

DragEvent/DataTransfer가 없는 브라우저에서는 drag 기반 테스트만 `blocked`로 기록하며 전체 suite의 다른 검사는 계속한다. 필수 요구사항이 blocked/미검증이면 전체 목표 완료 증거로 사용할 수 없다.
