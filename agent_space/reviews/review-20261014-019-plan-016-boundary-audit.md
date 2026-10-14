# Plan 016 — Backend/Frontend API-Adapter 경계 감사

## 0. 기준 및 범위

- 기준 branch: `main`, 시작 HEAD `52fe6001cf05d90a963ded7f9571bc6668325283`.
- 계획: `agent_space/plans/plan-016.md`, 특히 §20의 Source Script 변경 전 직접 dependency 감사.
- 정책 원문: `agent_space/AGENT.md`, `agent_space/policies/policies.md`, `agent_space/policies/source-script-policy.md` v0.2.6.
- 선행 이력: `plan-015.md`, `review-20261014-009-fsm-responsibility-audit.md`, `review-20261014-014-sourcescript-closure-r23.md`, `review-20261014-016-pluscal-r23.md`, `review-20261014-017-source-code-r29.md`, `review-20261014-018-plan-015-completion.md`, `20261014-034/035/036/037.md`.
- 확인한 현재 의미 파일: `sourcescript/`의 11개 파일, `fast-figure.js`, `fast-figure-ui.js`, `development-versions.json`.
- 이 감사는 계획 §20의 사실관계와 다음 Source Script 변경 범위를 확정하기 위한 기록이다. Source Script 수정·닫힘, PlusCal 번역, TLC 실행 또는 Source Code 구현을 완료했다는 뜻이 아니다.

## 1. 개발 계층 기준

현재 `development-versions.json`:

| 계층 | revision | status | 현재 상위 lineage |
| --- | --- | --- | --- |
| Source Script | r23 | current/closed | 최상위 |
| PlusCal pseudocode | r10 | current | Source Script r23 |
| verification model | r24 | current, TLC pending | Source Script r23 / pseudocode r10 |
| Source Code | r29 | current | Source Script r23 / pseudocode r10 / verification r24 |

`plan-016`에 따른 Backend/Frontend 계층 변경은 아직 어느 의미 파일에도 적용되지 않았다. 따라서 r23/r10/r24/r29의 current는 기존 plan-015 의미에 대한 표시이지 plan-016의 완료 근거가 아니다.

`AGENT.md`는 Fast Figure에서 TLC passed gate를 요구하지만 `source-script-policy.md`는 TLC를 일반적으로 선택적 검증으로 둔다. 현재 metadata의 TLC pending과 Source Code current 조합은 plan-016 §1.6이 이미 기록한 상태다. 이 감사에서는 어느 정책 원문도 변경하지 않고, plan-016의 새 Source Code closure에는 현 `AGENT.md`의 gate를 적용한다.

## 2. 현재 Source Script의 책임과 직접 dependency

| Source Script | 현재 직접 참조·역할 | plan-016 경계에서 필요한 처리 |
| --- | --- | --- |
| `system.py` | 모든 module을 direct sibling으로 선언하고 runtime load 순서 정의 | Backend / Application boundary / Frontend 의미 hierarchy와 기존 build 책임의 위치 확정 |
| `project_state.py` | `activeProject`, `projectObjects`, `projectVfs`, chart/asset/slot resolve | Backend authority 및 Backend read provider로 유지; Frontend direct read 경로는 공개 query로 전환 |
| `project_efsm.py` | `activeProject`/`projectObjects`를 import하고 persistent command와 `ProjectMutationResult` 소유 | Backend command controller로 유지; API/Adapter가 입력과 결과를 매개 |
| `interface_fsm.py` | `from project_state import activeProject` | Backend 직접 import 제거; validated selection/reconciliation input만 수용 |
| `application_fsm.py` | `projectEFSM`과 `interfaceFSM` 직접 import, `dispatchProjectCommand`/lifecycle | 두 계층 사이 공식 adapter/orchestration으로 정의; command/query/result/failure 순서 명시 |
| `api_ui.py` | `activeProject`, `interfaceFSM`, `selectedSlotId`와 application dispatch 직접 import; FastFigureApi + Mantine 명세 공존 | public API contract와 Frontend component meaning을 구분; component의 Backend direct access 제거 |
| `renderer_runtime.py` | `activeProject`, `interfaceFSM`, `selectedSlotId` 직접 import | Backend read projection과 final Frontend state만 소비; renderer의 direct project read 제거 |
| `assets_files.py` | Backend `activeProject/projectVfs`와 Application `dispatchProjectCommand`를 함께 import | candidate/persistence 계산의 Backend 소유와 public command orchestration을 의미적으로 구분 |
| `graphs.py` | Backend chart/CSV helper와 Application `dispatchProjectCommand`를 함께 import | graph candidate 계산과 public command wrapper의 책임 구분 |
| `layout_annotations_export.py` | Backend `activeProject/projectObjects`, Frontend `selectedSlotId`, Application `dispatchProjectCommand`를 동시에 import | selection resolution은 API/Adapter input, persistent geometry/annotation은 Backend, DOM export는 Frontend/renderer로 구분 |
| `portable_build.py` | split source → portable HTML packaging | runtime Backend/Frontend와 다른 system-level build 의미를 hierarchy에서 잃지 않도록 명시 |

`system.py`의 `SOURCE_SCRIPT_DECOMPOSITION_RULE`은 현재 모든 module을 직접 sibling으로 정의한다. 이 문구를 유지한 채 하위 PlusCal/Source Code에서 Backend/Frontend hierarchy만 추가하는 것은 정책 §3.2의 구조 보존을 위반한다.

`portable_build.py`는 plan-016 §3의 세 runtime 계층 그림에 직접 나타나지 않는다. 해당 책임을 임의로 Backend나 Frontend에 포함시키지 말고, Source Script 변경에서 system-level packaging/deployment 의미로 명시하여 기존 build 계약을 보존해야 한다.

## 3. Interface FSM의 Backend 직접 조회

Source Script:

- `interface_fsm.py:7`에서 `activeProject`를 import한다.
- `INTERFACE_SELECTION_INVARIANTS`는 slot/VFS/chart의 유효성을 current Backend state에 직접 연결한다.
- `InterfaceStateMachine.send` 설명은 target validity를 `activeProject`에서 직접 read-only resolve한다고 한다.
- `reconcileProjectResult` 설명은 commit 이후 `activeProject`를 직접 재조회한다고 한다.
- `run(lifecycle,event,task)`는 Backend persistent task를 호출할 수 있는 형태로 남아 있다.

Source Code:

- `fast-figure.js:405-441`의 `InterfaceStateMachine`은 `projectObjects` registry를 주입받아 `context().objects`에서 `this.objects.read(name)`을 실행한다.
- `fast-figure.js:527-594`의 `reconcileProjectResult`는 `slotAt`, `projectVfs.resolve/isTrashed`, `getChart`, `ensureGraphObjects`, `workspaceStateFromModel`을 직접 호출한다.
- `fast-figure.js:1902`에서 `new InterfaceStateMachine(projectObjects, ...)`로 Backend read registry가 직접 전달된다.

필요한 계약은 Backend가 selection reference의 유효성 및 이동/삭제 결과를 read/query 또는 mutation result로 산출하고, Application adapter가 그 결과를 Frontend FSM의 validated input으로 전달하는 것이다. Frontend FSM이 Backend registry를 보유하는 현재 구조를 그대로 새로운 공식 interface라고 이름만 바꾸지 않는다.

## 4. Frontend event와 암묵적 persistent mutation

- `fast-figure.js:1905-1909`의 `dispatchProjectCommand`는 Backend command 후 Frontend reconciliation을 수행한다.
- `fast-figure.js:1915-1935`의 `appFSM.send("SELECT_SLOT", ...)`는 Frontend selection 처리 후, 비어 있는 slot의 `contentType`이 `pendingSlotContentType`과 다르면 `SLOT_TYPE_CHANGED` persistent command를 추가 실행한다.

따라서 현재 SELECT_SLOT은 UI-only transition이라고 일괄 분류할 수 없다. selection 자체와 조건부 persistent content-type mutation이 실제 구현에서 결합되어 있다.

Source Script 변경에서 이 기존 의미를 보존할지, 사용자 의도와 plan-016의 Frontend-only transition 계약에 따라 별도 명시적 mutation intent로 분리할지를 먼저 닫아야 한다. Source Code에서 조건부 command를 조용히 삭제하거나, Frontend FSM 내부에 그대로 남기는 두 방향 모두 상위 의미 결정 없이 선택하지 않는다.

## 5. Renderer의 Backend 직접 조회와 쓰기 위험

Source Script:

- `renderer_runtime.py:20-22`에서 `activeProject`, Frontend FSM state 및 application dispatch를 import한다.
- `RENDERER_RULE`, `DASHBOARD_PROJECTION_INVALIDATION_RULE`, `renderDashboard`, `applySlotStyle`, `resolveSelectedChart`, `updateGraphView`, `startupCoreRuntime`이 직접 Backend authority 조회를 전제로 한다.
- `swapSlotContents`는 renderer module 안에서 Backend command와 renderer refresh를 함께 서술한다.

Source Code:

- `fast-figure.js:3816-3844`의 `renderDashboard`는 `activeProject`의 grid, slot, chart/image를 직접 읽는다.
- `fast-figure.js:3466-3470`의 `normalizeImageSettings(slot)`은 `normalizeSlotContent(slot)` 호출 후 `slot.content.imageSettings`에 값을 대입한다.
- `renderDashboard`가 `activeProject.slots`에서 가져온 live slot `s`를 위 함수에 전달하는 경로가 있으므로, 단순 read-only projection이라고 가정할 수 없다.
- `fast-figure.js:5679-5685`의 `readImageEditorApi`도 `normalizeImageSettings(slot)`을 호출한다. 공식 read API에서도 live slot normalization side effect를 확인해야 한다.

이 부분은 plan-016의 API/Adapter direct-read 금지와 별개로, renderer/read 계산이 authoritative ProjectObject를 변경해서는 안 된다는 정책 §2.1/§2.2 및 plan-015의 candidate-first 의미에 관련된다.

후속 Source Script에는 imageSettings의 read-time normalization이 복사본/계산 결과에서만 수행되어야 한다는 계약을 포함하고, 실제 Source Code 구현 단계에서 in-place write를 제거해야 한다. 이 감사만으로 저장 파일이 손상되었다고 주장하지 않는다.

## 6. FastFigureApi와 Mantine component의 실제 경계

- `fast-figure.js:7780` 이후 `window.FastFigureApi`가 public surface를 노출한다. 이 API 내부에서 `activeProject`, VFS, chart helpers를 읽는 것은 Backend read adapter 구현이 해당 책임을 명시적으로 소유하는 경우에만 허용할 수 있다.
- `fast-figure-ui.js`에서 검색한 `activeProject`, `projectEFSM`, `projectObjects`, `projectVfs`, `getChart`, `getProjectCsv`, `getProjectImage`는 직접 호출로 나타나지 않았다. 확인한 project read/write 진입점은 `window.FastFigureApi`였다.
- `fast-figure-ui.js:142-169`에서는 `appFSM.subscribe/state/send`를 Frontend runtime event/state에 사용한다.
- `fast-figure-ui.js:252-261`에서는 export lifecycle을 `runLifecycleTask`로 감싸고 public export API를 호출한다.

따라서 UI component 전체가 Backend를 직접 읽는다고 일반화하지 않는다. 우선 제거 대상은 core JS의 Interface FSM/renderer 내부 Backend access와 Source Script의 의미상 혼합이며, public API read method가 반환하는 값의 복사/불변성은 별도로 검사한다.

## 7. Backend domain helper와 Application adapter의 역방향 호출

`assets_files.py`, `graphs.py`, `layout_annotations_export.py`는 Backend authoritative state를 읽으면서 `dispatchProjectCommand`도 호출한다.

이는 public API-facing orchestration 함수와 Backend domain candidate builder가 같은 물리 Source Script에 기술된 결과일 수 있다. 파일을 무조건 Backend child로 분류하면 Backend가 Application boundary를 역호출하는 구조로 오해되거나 실제 구현에서 역방향 dependency를 강제할 수 있다.

다음 Source Script 변경에서는 물리 파일을 기준으로 책임을 재분류하지 않는다.

- Backend는 read/validate/candidate/commit domain 의미를 소유한다.
- Application boundary는 public command/query 및 Frontend selection context에서 Backend input을 구성한다.
- UI selection이 필요한 operation은 selected reference를 명시적인 API/Adapter input으로 받아 Backend가 current authority에서 재검증한다.
- 기존 public API method와 project command route를 보존한다.
- 새 command bus, 중복 persistent store, 장기 ProjectObject mirror를 추가하지 않는다.

## 8. 값·참조·복사본 감사

| 값 또는 경로 | 권위/임시 의미 | 감사 판정 |
| --- | --- | --- |
| `activeProject` | persistent ProjectObject SoT | Backend에 유지 |
| `projectObjects` | current Backend read registry | 별도 SoT 아님; Frontend FSM에 직접 주입하지 않음 |
| `projectVfs` | current Backend state 기반 path resolver | 별도 tree SoT 아님; Frontend direct read 금지 |
| `ProjectMutationResult` | command 범위의 immutable transient result | Application adapter가 Frontend reconciliation과 renderer effect로 전달 |
| `selectedSlotId` | Frontend session selection reference | Backend에 소유권 이전 금지; Backend mutation 전 current authority에서 resolve |
| `assetPath`, `graphObjectIndex` | Frontend selection reference | Backend validation/query result로 유효성 확인 |
| `FastFigureApi` read result | Backend current state에서 파생된 projection | 편집 draft와 구분; Backend 변경 입력으로 무검증 재유입 금지 |
| Mantine Modal/form draft | component lifetime input copy | Apply 때 공식 command 입력으로 전달, 다른 consumer의 일반 read authority가 되지 않음 |
| DOM/Plotly | Frontend projection | Backend mutation source로 역사용 금지 |
| `uiTelemetryState` | Frontend read projection | debug authority와 역동기화 금지 |

이번 검토는 위 값들의 의미적 소유권과 대표 경로를 확인한 것이다. 모든 public API method의 반환값을 runtime deep-frozen 상태라고 주장하지 않는다. `readSelectedSlotApi`는 새 object를 반환하지만 `readImageEditorApi`는 read-time normalization을 호출하므로 실제 불변성 및 side effect는 구현 단계에서 각각 확인해야 한다.

## 9. Source Script 변경 시 닫아야 하는 계약

1. `system.py`의 Backend / Application boundary / Frontend hierarchy와 portable build의 system-level 책임.
2. Backend command, Backend query, Frontend runtime event를 구분하는 `FastFigureApi` contract.
3. `InterfaceStateMachine`의 Backend registry 제거와 validated selection/reconciliation input.
4. `dispatchProjectCommand`의 success/failure, commit → reconciliation → projection 순서.
5. `runLifecycleTask`의 persistent task 실행 소유권을 Application adapter로 이동.
6. `renderer_runtime`의 read projection input과 read-only normalization.
7. `layout_annotations_export`의 `selectedSlotId` 직접 참조 제거 및 public API input 경계.
8. `assets_files`/`graphs`의 Backend candidate builder와 public orchestration wrapper의 논리적 소유권.
9. SELECT_SLOT 후 조건부 `SLOT_TYPE_CHANGED`의 명시적 의미/입력 경계.
10. FFPX/FFSX persistent data contract와 기존 public mutation route 유지.

각 계약을 Source Script에서 확정하고 세 닫힘 기준(논리적 완결성, 목적 부합, 중복/통합)을 증거와 함께 검토하기 전에는 pseudocode revision을 올리지 않는다.

## 10. 수행 결과와 미완료 범위

- 실제 `main` HEAD와 `development-versions.json`을 확인했다.
- plan-015의 완료 review 및 plan-016 생성 패치 기록을 확인했다.
- Source Script 11개 module의 직접 import/함수/책임을 감사했다.
- 현재 Source Code에서 Interface FSM registry read, reconciliation, SELECT_SLOT의 조건부 persistent mutation, renderer live slot normalization, FastFigureApi/Mantine 경계를 확인했다.
- plan-016의 Source Script architecture 변경은 **아직 시작 전**이며 Source Script r23의 의미 파일과 fingerprint를 변경하지 않았다.
- PlusCal, verification/TLC, Source Code는 수정하거나 실행하지 않았다.
- GitHub Actions는 실행하지 않았다.

다음 작업은 이 감사에서 확인된 혼합 책임을 포함하여 plan-016 §21의 Source Script architecture 변경을 하나의 일관된 ownership 단위로 수행하고, 같은 commit의 실제 diff/설명 쌍, revision/fingerprint, 닫힘 review를 남기는 것이다. 임시 command bus나 bridge를 선행 구현하지 않는다.
