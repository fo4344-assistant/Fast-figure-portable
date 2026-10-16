# Plan 017 — Source Script r34 잔여 public 반환 / OPEN

## 범위와 원천

- 사용자 요청: 앞서 열거한 일부 API의 반환 명세를 먼저 마저 작성한다.
- 기준 main: `9377a15c0539c7d0c67183a457b7aadab3e9dc6e` (Source r33).
- 기존 Source의 explicit identity/new edit → command → current authority/candidate/검증/한 commit → reconciliation 의미를 유지한다. 공개 inventory는 87개 그대로다.
- `fast-figure.js`의 해당 wrapper 반환을 정적으로 대조했다. 하위 코드의 live object 반환, candidate 입력, 독립 selection clear는 상위 의미로 복사하지 않는다. 이번 변경은 Source 명세이며 하위 구현 변경/실행이 아니다.

## 남아 있던 10개 operation의 반환

| API / Application wrapper | 성공 | 미commit / 대상 없음 | 오류 |
|---|---|---|---|
| project.setName / setProjectName(value, trim=False) | 공식 project.readName의 최신 문자열 | None | 전파 |
| slots.setContentType / setSlotContentType(slotId, contentType) | None | None | 전파 |
| slots.reset / resetSlotApi(slotId) | None | None | 전파 |
| slots.swap / swapSlots(sourceSlotId, targetSlotId) | True | False (missing/hidden/same-id 포함) | 전파 |
| images.insertEmpty / insertEmptyImageIntoSelectedSlot() | 공식 assets.readDeletionTarget의 detached image | None (selected image slot 아님 포함) | 전파 |
| assets.delete / deleteProjectAsset(target) | None | None | 전파 |
| assets.move / moveProjectNode(plan, useUniqueName) | immutable {path, trashed} | None (no plan 포함) | 전파 |
| assets.createDirectory / createProjectDirectory(parent, name) | 실제 canonical path 문자열 | None | 전파 |
| assets.emptyTrash / emptyProjectTrash() | None | None | 전파 |
| assets.connectToSlot / connectProjectAssetToSlot(path, kind, slotId) | None | None | 전파 |

None은 완료 값 부재이며 성공 boolean이 아니다. void operation에 새 bool/result envelope를 추가하지 않는다. Backend validation throw와 명시적 non-commit을 구별하고, 내부 adapter tuple을 공개하지 않는다. 실패 경로에서는 성공 후 query/selection/completion을 수행하지 않는다. 이미 commit한 뒤 query/render/selection이 실패해도 숨은 rollback이나 이전 read로 성공을 위장하지 않는다.

## owner / 경계

- name 문자열 변환/optional trim/최대 120문자는 Backend command의 candidate 계산이다. wrapper는 새 value/trim만 전달한다.
- slots.setContentType은 기존 Source inventory의 explicit slotId/type 경로다. 하위 selected-slot-only wrapper의 pending global을 authority로 되살리지 않는다. 선택 시 explicit pendingContentType을 전달하는 기존 adapter 경로는 유지한다. 하위 API는 추후 번역 시 explicit target에 맞춰 연결해야 한다.
- reset은 slot-local defaults/owned chart의 동일 candidate를 사용하고, swap은 전체 payload 교환/위치 identity 유지 및 실제 hint에 따른 공통 reconciliation을 사용한다. 사후 blanket selection clear를 만들지 않는다.
- insertEmpty는 고정 1600×900 transparent SVG bytes/name/MIME와 captured slotId만 입력한다. Backend에서 current next-id/VFS/model 생성 및 target image-slot 재검증 후 asset+reference를 한 번 commit한다. 성공 후 실제 생성 path로 detached asset을 읽는다.
- move/directory 결과 path는 command의 실제 changed 값이다. stale plan의 예정 path/uniqueName을 성공값으로 반환하지 않는다. move의 trashed는 기존 assets.isTrashed query를 사용한다.
- directory 생성 뒤 SELECT_ASSET은 Application에서 current target을 검증한다. 선택 거부는 기존 선택을 보존하며 이미 생성된 directory/path를 취소하지 않는다.
- connect는 current kind/non-trash/visible target을 검증한 기존 kind-specific command 성공 후 model-to-fsm dispatchSlotSelection으로 target 선택을 보장한다. 같은 target의 toggle 해제가 없고 asset selection 자체는 변경하지 않는다.

## 정적 대조 시나리오 — 실행 테스트 아님

1. name commit 성공 → fresh string; throw/미commit → 성공 read 없음.
2. explicit slot type/reset → None; missing/hidden → 미commit/None, 무관한 selected slot로 대체하지 않음.
3. swap A/B 성공 → True와 실제 payload reconciliation; A/A 또는 missing → False/unchanged.
4. image slot 없음/graph slot → None/no command; 대기 사이 target 변경 → Backend 재검증으로 거부.
5. empty image 생성 성공 → 실제 id/path의 detached image; read 오류 → 전파, commit은 유지.
6. delete missing/None → None; 삭제 성공도 None, 참조 제거와 asset 제거는 동일 candidate.
7. move collision unique-name → actual final path, 현재 trash membership; 예정 path를 반환하지 않음.
8. directory commit 거부 → None/no SELECT_ASSET; 성공 → path, selection throw → 전파/생성 유지.
9. trash 이미 비어 있음 → 완료 값 None, 별도 directory/asset/count envelope 없음.
10. connect 성공 → target selection 보장/None; command 실패 → selection 없음; selection 사후 거부 → 기존 runtime 선택 유지/commit 유지.
11. void operation의 None으로 caller가 success=True를 추정하지 않도록 공개 inventory와 owner rule 일치 확인.
12. 모든 성공값은 immutable scalar/read/새 결과 copy이며 mutable Backend object나 internal tuple이 아니다.

## 상태와 미포함

- Source r34 current/open, closure_review null. fingerprint `sha256:024c9de52803c2743ab65742753e94b09dd15fdaa1f3f1d40f34567c648478ac`.
- 앞서 열거한 10개 반환 명세는 작성했다. 전체 selection 교차 검토, import/edit/export 왕복, 목적 적합성/중복통합 근거는 남아 있다. 전체 Source closure를 선언하지 않는다.
- PlusCal r11 / optional model r26 / source-code r36 stale 유지. 정책·하위 코드·테스트·빌드·dist 변경 없음. 로컬 Source import/application/test/checker/build/TLC 실행 없음.
- 실제 누적 diff/Contents 전송 한계/Actions 검사는 `agent_space/patches/20261016-017.patch`와 같은 basename `.md`에 기록한다.
