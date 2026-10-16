# Plan 017 — Source Script r26 검토 후 공통 계약 정리

- 작성일: 2026-10-16
- 상태: in_progress / Source Script r28 import·계층 파일 배치 정리, D/E 잔여 / closure open
- 기준 main: `bf85187f2f76552891844d0396d62a073ac3bed5`
- 선행 계획: `agent_space/plans/plan-016.md` §35
- 선행 검토: `agent_space/reviews/review-20261016-004-sourcescript-r26-open.md` 및 후속 사용자 검토 대화
- 현재 계층: Source Script r28 `current/open`, PlusCal r11 `stale`, verification-model r26 `stale`/TLC pending, Source Code r36 `stale`.
- 실행 작업 기준 main: `7ec2c1112459020af9b321568cce3a2fcd91e5bf`; 실행 검토: `agent_space/reviews/review-20261016-005-plan017-r27-open.md`.

## 1. 요구와 목적

사용자는 non-editable 상태의 conversion graph object를 project CSV 참조 검증 대상에 추가하지 않도록 수정하고, 새로운 계약을 추가하기보다 기존 공통 계약으로 묶는 방향을 우선하도록 지시했다. 이 계획은 Plan 016의 분리 목적을 유지하면서 Source Script의 충돌·누락을 먼저 해소하는 후속 계획이다. 기존 구현에 맞춰 상위 의미를 소급 확정하거나 과거 변경을 일괄 rollback하지 않는다.

최초 문서 작성은 계획 수립만 수행했다. 이후 사용자 실행 지시에 따른 Source Script 수정 경과는 §9에 구분해 기록한다. 전체 닫힘, PlusCal 번역과 코드 구현은 완료하지 않았다.

## 2. 재확인한 정책과 적용

`agent_space/AGENT.md`, `agent_space/policies/policies.md`, `agent_space/policies/development-policy.md` v0.2.6 전체를 다시 읽었다.

- §1, §4.6: Source Script를 먼저 닫고, 직접 번역한 PlusCal의 충실도·구체성을 확인한 뒤 Source Code로 진행한다. 논리 완결성·프로젝트 목적·중복/통합 각각의 근거가 필요하다.
- §2.1–2.3: query/calculation은 mutation과 분리한다. 현재 authority에서 변경을 검증하고 실패 시 기존 상태를 유지한다. read projection을 mutation 원천으로 재사용하지 않는다.
- §2.5, §2.8: 같은 자유도를 유지하면서 기존 구조에 통합하는 방향을 우선한다. 별도 결과 형식·후처리 경로·권위 저장소·범용 framework를 추가하지 않는다.
- §2.6: 실제 참조 원천에서 대상을 resolve한다. non-editable conversion view를 아직 생성되지 않은 project CSV의 실제 참조로 취급하지 않는다.
- §3.2: Backend Project EFSM / Application adapter / Frontend FSM 및 기존 논리 hierarchy를 보존한다. 호출 관계나 물리 파일 편의로 의미를 재분류하지 않는다.
- §4.3.1: 의미·호환성·자원 수명에 영향을 주는 규칙은 상위에서 확정하되, 교체 가능한 API 호출 문법이나 구현 primitive는 하위에 남긴다.

정책 원문은 변경하지 않는다. 이 문서는 프로젝트 작업 계획이며 새 정책이나 독립적인 의미 권위가 아니다.

## 3. 확인된 문제와 영향 범위

1. `sourcescript/graphs.py`: non-editable Plotly import는 project CSV를 생성하지 않는데 chart 검증은 모든 graph object의 CSV resolve를 요구한다.
2. `sourcescript/project_state.py`, `sourcescript/application_fsm.py`, `sourcescript/interface_fsm.py`, `sourcescript/project_efsm.py`: selectedIndexHint를 별도 입력이라고 명시했지만 공통 command 성공 경로에서 검증·적용하는 연결이 완결되지 않았다.
3. `sourcescript/application_fsm.py`, `sourcescript/assets_files.py`, `sourcescript/graphs.py`: command 내부 candidate 계산이라는 공통 규칙과 command 이전 candidate 생성 절차가 공존한다.
4. `sourcescript/graphs.py` 및 관련 API wrapper: chart/editable 등 선언된 반환값과 공통 command 결과를 그대로 반환하는 절차가 맞지 않는다.
5. `sourcescript/graphs.py`, `sourcescript/project_state.py`, `sourcescript/renderer_runtime.py` 및 관련 domain: renderer field 계산과 Plotly/image 자원 처리의 의미가 충분히 구체적이지 않다.

위 경로는 예정 범위다. 수정 전에 실제 producer/consumer를 대조하고 필요한 기존 원천만 함께 수정한다. 이 목록 자체를 별도 operation registry로 구현하지 않는다.

## 4. 적용 순서와 결정 방향

### A. non-editable 검증 대상 정리

- 기존 chart 검증 절차 안에서 representation에 맞는 검증 대상을 결정한다. 별도 면제 목록이나 두 번째 validator를 만들지 않는다.
- non-editable의 conversion view는 project CSV/column 참조 검증 대상에 포함하지 않는다. 가짜 CSV나 임시 project ID를 생성해 검증을 통과시키지 않는다.
- non-editable chart 자체의 구조, 보존된 Plotly representation 및 실제 persistent 참조에 대한 기존 검증은 유지한다. chart 전체를 무검증 통과시키는 변경이 아니다.
- editable chart의 object는 실제 project CSV와 column을 resolve하여 검증한다.
- editable 전환 시 필요한 CSV 생성, next-id 계산, object 참조 연결, chart 변경, whole-project 검증을 같은 Backend command candidate 안에서 끝내고 한 번 commit한다.
- zero-trace/zero-object 전환은 기존 빈 chart 허용 의미를 보존한다.

### B. candidate 계산을 기존 command 경계 안으로 통일

- Application wrapper는 identity와 새 입력·사용자 선택을 전달한다. 현재 project의 read projection/whole-project 복제본을 mutation 입력으로 돌려보내지 않는다.
- Backend command가 current authority resolve → domain candidate 계산/정규화 → validation → 단일 commit을 수행한다.
- asset batch import, slot import, editable 전환 등 기존 경로를 이 순서에 맞춘다. 파일 parsing 같은 순수 계산과 current project/id/path/reference에 의존하는 candidate 계산을 구분한다.
- 기존 Backend domain helper는 command 내부 계산으로 재사용한다. 함수마다 별도 mutation 규칙을 만들거나 읽기까지 command 경로로 강제하지 않는다.
- 실패·취소·거부 시 Project를 보존하고 성공 reconciliation/render를 수행하지 않는다. 긴 작업 뒤 commit 시점에도 current authority를 확인한다.

### C. 선택 인덱스를 공통 reconciliation에 통합

- 기존 ProjectMutationResult의 selectionHints와 buildFrontendReconciliationInput → Frontend reconciliation 경로를 사용한다.
- selectedIndexHint의 전달 위치, post-commit 대상 chart/index 검증, 명시적 clear와 hint 없음의 차이를 기존 경로에서 구체화한다.
- object 추가/이동/삭제 뒤 작업이 지시한 선택 대상을 반영한다. 기존 숫자 인덱스가 범위 안이라는 이유만으로 다른 object 선택을 유지하지 않는다.
- 인덱스 보정은 독립적인 현재 CSV 선택을 변경하지 않는다. 명시적인 object 선택의 CSV 연동과 구별한다.
- 별도 사후 선택 전이, 중복 hint 상태, 새 identity 체계를 추가하지 않는다. 실패한 command는 Frontend 상태도 유지한다.

### D. 공통 내부 결과와 공개 반환값 정합화

- 내부 command는 기존 ProjectMutationResult와 Application의 공통 반환 경로를 유지한다.
- 각 공개 wrapper의 기존 반환 의미를 대조한다. 변경된 chart/settings 등 read 값이 필요하면 성공 뒤 현재 authority에서 공식 query로 취득한다.
- bool/scalar/결과 envelope 등 기존 반환 의미를 무조건 하나로 바꾸지 않는다. 실패·취소 시 반환/전파 의미도 각 기존 API와 일치시킨다.
- 별도 성공 결과 타입이나 query snapshot의 mutation 재유입 경로를 만들지 않는다.

### E. renderer 의미 구체화와 전체 trace

- 기존 Backend projection/query와 supplied immutable input을 사용하는 renderer 경계 안에서 보완한다. 또 다른 Project read store를 만들지 않는다.
- graph object/CSV → trace, global/axis → layout, 기본값·범위·비유한 값·변환 제외 조건과 imported representation 보존을 기존 원천에 구체화한다.
- chart instance 재사용/교체/purge, resize 순서, image display resource 생성·교체·해제, 오래된 작업 결과의 적용 방지처럼 정확성에 영향을 주는 의미를 정한다.
- 특정 API 호출 문법이나 교체 가능한 scheduler primitive를 미리 고정하지 않는다. 독립적인 의미 hierarchy가 정말 필요하면 기존 hierarchy에서 해결 가능한지 먼저 검토하고 근거를 기록한다.
- 공통 contract를 반복해서 새로 쓰지 않고 기존 원천을 참조한다. 전체 공개 operation의 입력 → command/query → 결과 → reconciliation → renderer 흐름을 대조한다.

## 5. 검토 시나리오와 합격 기준

다음은 향후 의미 대조/검증 항목이며 실행 결과가 아니다.

| 시나리오 | 확인할 결과 |
| --- | --- |
| 데이터가 있는 Plotly를 non-editable로 import | project CSV 생성 없이 representation 검증을 통과할 수 있고 원본을 보존한다. conversion view에 project CSV resolve를 요구하지 않는다. |
| 잘못된 Plotly 구조 | non-editable이라는 이유로 검증을 우회하지 않는다. |
| non-editable → editable | 필요한 CSV/참조/chart를 한 candidate에서 검증·commit한다. 실패 시 이전 project/selection을 유지한다. |
| zero-trace/zero-object 전환 | 가짜 CSV/object 없이 기존 빈 editable chart 의미를 유지한다. |
| object 추가/이동/삭제 | 의도한 post-edit 인덱스 또는 clear를 공통 reconciliation이 적용하고 독립 current CSV는 보존한다. |
| import 중 target/path/reference 변경 또는 충돌 | commit 시 current authority로 다시 판정하고 실패 시 부분 commit이 없다. |
| wrapper 성공/실패/취소 | 선언된 반환값과 실제 값 흐름이 일치하고 실패를 성공 read 값으로 위장하지 않는다. |
| 연속 render/slot 교체/image 교체 | 오래된 완료가 새 view를 덮어쓰지 않고 사용이 끝난 display resource를 정리한다. |
| merge/move/trash/reset와 선택 | 실제 post-commit 참조를 resolve하고 unrelated valid selection은 유지한다. |

닫힘 판정에는 위 국소 항목뿐 아니라 전체 Source Script의 논리 완결성, scientific figure 편집/import/export 목적 보존, 중복 후보와 통합/분리 판단의 근거를 기록한다. 추가 문제나 미정 의미가 남으면 open을 유지한다.

## 6. 산출물·계층 전파와 검증

1. 최초 계획 작성 단위: plan과 실제 문서 변경의 dated patch/.md 쌍만 작성했고 Source Script/lineage metadata는 변경하지 않았다. 이후 실행 단위는 §9에 기록한다.
2. 후속 Source Script 수정: 변경 이유·기각 대안·미포함 범위·실제 누적 diff를 patch 쌍으로 기록하고 revision/fingerprint를 갱신한다. 닫힘은 별도 근거 review로 판단한다.
3. Source Script 수정 중 PlusCal/model/code는 stale을 유지한다. 파일 내용이나 derived_from을 최신인 것처럼 맞추지 않는다.
4. Source Script 닫힘 후 PlusCal 직접 번역과 충실도/구체성 검토를 수행한다. Source Code는 확인된 PlusCal 이후에 진행한다. TLC는 선택이며 미실행을 통과로 기록하지 않는다.
5. version checker·application/test/build 실행은 GitHub Actions에서만 한다. 최초 계획 작성에서는 새 Actions run을 요청하지 않았다. 실행 단위에서는 실제 범위와 기존 실행 허가에 따라 run ID·기준 commit·로그·한계를 기록한다. 누적 baseline 검사를 위해 기존 version workflow의 선택적 `base_sha` dispatch 입력을 사용한다.
6. 로컬 작업은 파일 읽기/작성과 Git diff/hash/transport 등으로 제한한다. helper/temp는 현재 작업 디렉터리 아래에 둔다.

## 7. 중단 조건과 제외 범위

- 적용 직전 main HEAD나 대상 blob/순번이 바뀌면 최신 plan/review/metadata를 다시 읽고 중복·충돌을 확인한다.
- 기존 계약의 통합으로 설명되지 않는 새 의미, schema 변경 또는 기능 축소가 필요하면 임의 구현하지 않고 설계 문제를 기록한다. 사용자 의도가 필요한 사항은 확인한다.
- Source Script에 미정 의미가 남거나 hierarchy/참조/실패 흐름이 맞지 않으면 closed로 올리지 않고 하위 구현을 재개하지 않는다.
- 최초 계획 작성에는 Source Script 수정도 포함하지 않았다. 후속 실행 단위에서도 정책 개정, PlusCal/model/JS/test/build/distribution 변경, 새 framework나 bridge 도입은 포함하지 않는다.
- 과거 성공한 Actions 결과는 이 계획이나 향후 수정의 검증 근거로 재사용하지 않는다.

## 8. 선택하지 않은 방향

- non-editable chart 전체 검증 생략: representation/실제 참조 오류까지 숨기므로 제외한다.
- import 때 가짜 CSV 생성: deferred editable 전환 의미를 바꾸고 불필요한 authority를 추가하므로 제외한다.
- hint 전용 후처리·candidate 전달 예외·새 결과 envelope 추가: 기존 공통 경로와 중복되고 추적 비용을 늘리므로 제외한다.
- renderer/JS부터 수정하고 상위 계약을 나중에 맞추기: 하위가 새 의미를 결정하게 되므로 제외한다.
- 모든 read 계산을 command로 통합: query와 mutation 책임을 혼합하고 불필요한 결합을 만들므로 제외한다.

## 9. 실행 경과 — Source Script r27 / OPEN

- 기준 `7ec2c1112459020af9b321568cce3a2fcd91e5bf`에서 A의 검증 scope를 기존 `validateChartModel`에 통합하고 project/package/reference 수집이 같은 representation 판정을 사용하도록 수정했다. non-editable conversion에 가짜 CSV를 생성하지 않고 실제 CSV를 가진 일반 chart의 검증은 보존한다.
- B의 wrapper identity/new-input 전달과 Backend 내부 candidate 계산을 asset/import/graph/layout 경로에 맞췄다. Backend는 완료된 collision choice를 current authority에서 확인하며 UI callback을 실행하지 않는다.
- C의 index hint를 기존 result → Backend reconciliation query → Frontend scalar 적용에 연결했다. 이동 `from/to`, 삭제 clear, 독립 current CSV 보존을 유지하며 별도 사후 선택 전이를 추가하지 않았다.
- D의 수정 대상 chart/asset/import wrapper는 성공 뒤 공식 query를 사용하고 command triple을 공개 chart/asset로 잘못 반환하지 않도록 고쳤다. **전체 API trace는 미완료다.**
- E의 chart/image lifetime·stale completion 의미를 기존 renderer 절차에 구체화했다. field별 trace/layout 계산·기본값/변환 제외 조건·palette/default color source와 전체 왕복 trace는 남아 있다.
- 상세 근거/미정 항목: `agent_space/reviews/review-20261016-005-plan017-r27-open.md`. source revision/fingerprint를 갱신하되 closure는 open, closure_review는 null이다. PlusCal/model/code는 stale이고 하위 구현을 재개하지 않았다.
- patch/실제 Actions run/누적 endpoint: `agent_space/patches/20261016-010.patch` 및 같은 basename `.md`. metadata checker 결과를 semantic closure로 해석하지 않는다.

## 10. 후속 사용자 지시 — Source Script r28 import·hierarchy 정리

- 기준 main `b3cd9648ff6705f07510c8b3c4947d4276ffdb61`. 정책 §3.2의 의미 포함관계와 §4.3.2의 import 기준을 확인했다. `참조 Source Script` 목록 대신 실제 module import 표기를 사용한다.
- 기존 Backend / Application boundary / Frontend / Portable build hierarchy를 `sourcescript/backend/`, `sourcescript/application/`, `sourcescript/frontend/`, `sourcescript/portable_build/`로 반영했다. Backend domain / Application public wrapper / Frontend UI·renderer를 각 owner의 경로에 분리했다.
- `sourcescript/application/public_api/`의 네 파일은 기존 public-api 모듈의 물리적 구성이다. 새 의미 계층을 추가하지 않는다. 제거한 평면 파일의 compatibility bridge는 남기지 않는다.
- §3의 평면 경로는 r26 검토 당시의 역사적 위치다. 현재 owner와 import 경로는 `sourcescript/system.py` 및 `agent_space/reviews/review-20261016-006-sourcescript-r28-hierarchy-open.md`에 기록한다.
- source revision/fingerprint만 갱신하고 closure open / closure_review null 및 하위 stale을 유지한다. 정책, PlusCal/model/JS/test/build/distribution은 변경하지 않는다. D/E의 미정 의미와 전체 trace는 여전히 남아 있다.
- 실제 누적 diff/전송 한계/Actions 근거: `agent_space/patches/20261016-011.patch`와 같은 basename `.md`. 이번 구조 정리를 전체 Plan 017 완료나 번역 충실도 검증으로 주장하지 않는다.

## 11. 후속 실행 — Source Script r29 trace 계산 / OPEN

- 기준 `2da42296aa71cb662605fbbe991591654900297a`. E의 기존 graph domain 절차에 header/body, scalar 변환, divide 다음 scale, paired row 제외, category/비유한 값/빈 결과 의미를 구체화했다. reciprocal을 schema와 normalize 규칙에 연결하고 Plotly 표시 축은 linear, 범위는 변환 후 좌표로 명시했다.
- trace/chartFigure/rebuildEditableGraph가 같은 Backend read 또는 command candidate의 chart/CSV를 사용하도록 project 문맥을 명시했다. 미commit CSV 조회를 위한 부분 commit이나 live fallback은 없다. non-editable imported figure와 일반 실제 CSV chart의 representation을 구분한다.
- renderer/export의 Backend-supplied figure 소비를 연결했다. Frontend는 CSV/trace를 재계산하지 않고 geometry/presentation만 적용한다. 일반 FFPX snapshot 반환과 persistent schema는 유지한다.
- 부분 정적 시나리오·선택 이유·한계: `agent_space/reviews/review-20261016-007-sourcescript-r29-trace-open.md`. 실제 누적 diff와 Actions 근거: `agent_space/patches/20261016-012.patch` 및 같은 basename `.md`.
- D 전체 API trace, E layout/style/extension/axis 보조 표시와 palette/default 원천 및 전체 왕복 검토는 남아 있다. source r29 current/open, closure_review null이고 하위 stale을 유지한다. 정책·PlusCal/model/JS/test/build/distribution을 변경하거나 전체 closure/실행 성공을 선언하지 않는다.
