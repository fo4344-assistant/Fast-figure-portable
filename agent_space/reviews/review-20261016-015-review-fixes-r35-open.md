# Plan 018 — R1–R4 수정 후 Source r35 정적 대조 / OPEN

## 기준·범위

- 사용자 요청: review 결과 확인 → 수정 계획 작성 → 계획에 따라 작업.
- 기준 main: `9d3a5b970223805f410d9e92425269cf1872992f`.
- 근거 검토: `agent_space/reviews/review-20261016-014-policy-first-source-r34.md`.
- 먼저 `agent_space/plans/plan-018.md`를 작성·게시했다(`3cd65831e800c8836bfeaa20894c5123936dc314`). 그 다음 Source 의미를 수정했다.
- 직전 검토에서 개발 정책 전체를 재독했으며 이번 변경 전에 AGENT와 관련 Source 원문을 다시 확인했다. 정책 변경은 없다.
- Source Python 표기의 알고리즘/계약 대조다. Source/application/test/checker/build/TLC를 로컬 실행하지 않았다.

## 수정 결과

| 항목 | 실제 변경 | 정적 판정 |
|---|---|---|
| R1 기본 경로 | assets_files.PROJECT_ASSET_DIRECTORIES를 실제 canonical path scalar로 명확히 하고 Application router가 data→csv key / image→image key를 사용 | 기존 `/assets/images` root와 일치, 단수 alias/새 query 없음 |
| R2 connect 선택 | Backend 검증의 기존 clear-graph-object hint를 Frontend SELECT_SLOT까지 적용 | non-null model-to-fsm은 graph만 clear/asset 유지, user toggle 및 explicit none은 기존 전체 clear |
| R3 빈 CSV owner | Backend graph 규칙을 create-only로 수정하고 Application의 committed create-and-select 경로를 명시 | command의 Frontend 직접 선택 서술 제거 |
| R4 cascade index | 기존 ProjectMutationResult.selectionHints에 chart별 graphObjectIndexMaps를 구체화하고 reconciliation이 소비 | 제거된 object는 clear, retained object는 같은 object의 새 index, unrelated chart 유지 |

R1~R3은 기존 문장의 불일치를 해소했다. R4는 이전에 빠져 있던 delta 생성/소비 알고리즘을 상위 Source에 추가한 것이며, 단지 하위 코드의 현재 동작으로 추정해 통과시킨 것이 아니다. 실제 application 구현/실행 확인은 아직 하지 않았다.

## 책임·참조 관계

- 기본 directory 정의는 asset-domain의 immutable schema 값이다. 현재 VFS 상태의 우회 read/query가 아니며 command는 여전히 current directory를 검증한다. 새 root/호환 alias/자동 root 생성은 없다.
- model-to-fsm의 asset 보존은 이미 reconciliation을 통과한 현재 Frontend 선택에 적용한다. 제거된 target을 예전 snapshot에서 복구하지 않는다. Frontend는 raw direction 또는 Backend registry를 다시 읽지 않고 validated hint만 소비한다.
- empty CSV create helper/command는 persistent CSV만 생성한다. 선택은 Application public composition의 기존 SELECT_ASSET 검증 경로다. selection 거부가 이미 완료된 create를 숨은 rollback하지 않는다.
- cascade filter는 command가 실제로 제거한 original positions를 사용한다. 결과 mapping은 `[{chartId, indices}]`이며 chart별 old index entry에 post index 또는 none을 담는다. 같은 값의 object도 위치로 구별한다.
- Backend reconciliation은 reset/clear → matching explicit index hint → matching cascade map → 기존 index 순으로 후보를 결정하고 current chart/post array에 대해 최종 검증한다. direct graph delete의 명시적 none은 바꾸지 않는다.
- 이 delta는 한 command의 immutable 결과다. persistent object id/새 selection authority/별도 Frontend 전이/old objects projection을 추가하지 않았다. Application은 mapping을 저장하지 않고 최종 scalar를 Frontend에 전달한다.

## 정적 시나리오 — 실행 테스트 아님

| # | 입력/경로 | 선언된 결과 |
|---|---|---|
| 1 | slot 미선택 image file | 기본 image key → `/assets/images`, current directory 검증 |
| 2 | slot 미선택 csv/tsv/json data | 기본 csv key → `/assets/csv`, 기존 분류/단일 helper 유지 |
| 3 | explicit target 있음 | 기존 importToSlot, 기본 directory router로 우회하지 않음 |
| 4 | 같은 target connect 성공 | target 선택 유지/no toggle, graph clear, 유효한 독립 asset 유지 |
| 5 | 다른 target connect 성공 | target/workspace 변경, graph clear, 유효한 독립 asset 유지 |
| 6 | connect 미commit/invalid target | 성공 SELECT_SLOT 없음; rejected input이면 기존 runtime 유지 |
| 7 | 일반 user slot 선택/동일 id toggle | 기존 asset+graph clear 및 toggle 유지 |
| 8 | explicit none, model-to-fsm 포함 | direction과 무관한 전체 deselection |
| 9 | 빈 CSV create 성공/선택 거부 | create 한 번; 선택만 거부, CSV commit 유지, 자동 chart 없음 |
| 10 | `[A,B,C]`, B 선택, A 제거 | map `[none,0,1]`, old index 1→0으로 B 유지 |
| 11 | 같은 배열, B 선택, B 제거 | map `[0,none,1]`, old index 1→none; C를 선택하지 않음 |
| 12 | 같은 배열, B 선택, C 제거 | map `[0,1,none]`, B index 1 유지 |
| 13 | 동일 값/동일 CSV의 복수 reference | actual removed original indices로 계산; equality 매칭/제거 count 추정 없음 |
| 14 | 여러 chart에서 CSV 제거 | affected chart별 별도 map, 현재 owning chart의 항목만 적용 |
| 15 | unrelated selected chart/image-only detach/단순 path move | cascade map 없음, 기존 유효 graph 선택 유지 |
| 16 | 모두 제거/마지막 object/direct graph delete | cascade는 all-none map, 직접 delete는 기존 explicit-none; 이웃 자동 선택 없음 |
| 17 | delete/trash 진입/empty-trash | 같은 actual reference filter와 공통 mapping 알고리즘 사용 |
| 18 | candidate 실패/authority 재계산 | 실패는 성공 map/reconciliation 없음; 재계산은 새 authority 기준 mapping |
| 19 | CSV asset 선택과 graph object 선택이 독립 | remap은 index-only; asset path의 제거/trash 판정은 기존 별도 reconciliation |
| 20 | imported conversion object | 기존 representation/reference 판정으로 cascade 수집 대상에서 제외 |

## 대안·복잡도 판단

- R2에서 모든 slot 선택의 asset clear를 없애면 사용자 선택의 기존 의미까지 바뀐다. 검증된 기존 hint의 구분만 적용했다.
- affected chart를 무조건 clear하면 retained object 선택을 불필요하게 잃는다. 새 persistent object id보다 기존 배열 filter의 old→new delta가 작고 목적에 맞는다.
- equality 검색은 같은 값의 중복 object를 구별하지 못한다. 제거 count는 어느 index가 제거되었는지 나타내지 못한다.
- Application의 선택 snapshot 복구/사후 SELECT_GRAPH_OBJECT는 현재 독립 CSV 선택과 단일 reconciliation을 훼손하므로 사용하지 않았다.
- 새로운 API/query registry, schema migration, bridge, 실행 가능한 Source framework는 추가하지 않았다.

## 닫힘·전파·검증 상태

- Source r35 current/open, closure_review null. fingerprint `sha256:6b1b16ef3e2a0e5725c9fa7b7191bda06265b96cc1844d7a94a130d4d3c97ef9`.
- 이 단위의 R1~R4에는 생성/소비 owner와 반례의 처리 의미를 명시했다. 전체 selection/import-edit-export 왕복, 목적 적합성/중복통합의 최종 닫힘 검토가 완료되었다고 주장하지 않는다.
- PlusCal r11/model r26/source-code r36은 stale 그대로다. 추후 Source closure 후 같은 경로/선택 hint/cascade delta를 PlusCal부터 번역하고 code로 전파해야 한다. 하위 layer의 lineage를 새 Source에 맞춘 것처럼 기록하지 않는다.
- 정책/하위 코드/test/build/dist 변경 없음. GitHub Actions cumulative version checker [38862733364](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/38862733364) PASS. executed HEAD `97e39fd54a03c6610e49f7c246047936834df3c5`, BASE_SHA `9d3a5b970223805f410d9e92425269cf1872992f`와 r35 fingerprint를 로그에서 확인했다. 의미적 검토/실행 테스트의 대체 증거는 아니다. 본 결과 기록은 run 이후 commit이다.
- 기록은 Contents API 순차 commit이다. 최종 actual cumulative diff와 같은-commit 산출물 제한은 `agent_space/patches/20261016-019.patch/.md`에 남긴다.
