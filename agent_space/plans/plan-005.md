# 계획 005 — Mantine 전환 우선순위와 구버전 호환성 범위

## 역할

이 문서는 `plan-004.md`의 Mantine UI 중앙화 계획에 대한 우선순위 보충 문서다.

`plan-004`와 충돌할 경우 이 문서의 판단을 우선한다.

## 호환성 범위

구버전 호환성을 반드시 보장하는 범위는 **파일 관련 의미와 roundtrip**으로 제한한다.

보존 대상:

- FFPX/FFSX 등 프로젝트/교환 파일의 기존 의미
- 기존 파일의 import/load 가능성
- 현재 버전에서 저장한 파일의 schema/의미 일관성
- CSV/image/project 등 파일 import/export의 기능적 의미
- palette 등 별도 파일 형식이 이미 존재하는 경우 그 형식과 검증 규칙

구버전 UI와 동일하게 보존할 필요가 없는 대상:

- legacy HTML markup/DOM ID/class 구조
- legacy sidebar/toolbar/form 배치
- legacy popup/menu/focus lifecycle
- legacy DOM `.value` 동기화 방식
- legacy UI의 임시 상태 보관 방식
- legacy UI에서 우연히 가능했던 상호작용 순서나 표시 방식
- Mantine 단일 shell 계획과 충돌하는 legacy renderer-side UI 동기화

## 충돌 판단

구버전 일반 UI 동작과 `plan-004`의 구조적 목표가 충돌하면 다음 순서로 판단한다.

1. 파일 호환성 또는 파일 의미가 깨지는가?
   - 그렇다면 파일 호환성을 우선한다.
2. domain 데이터 의미나 사용자 기능 자유도가 불필요하게 줄어드는가?
   - 그렇다면 기능 의미를 보존하는 대안을 찾는다.
3. 단지 legacy UI 구현 방식/표시 순서/DOM synchronization과 충돌하는가?
   - 그렇다면 `plan-004`의 Mantine 단일 소유, 최소복잡도, 공통 규칙 중앙화를 우선한다.

## EFSM/domain 기준

구버전과의 동작 일치 자체를 EFSM/domain 구조 보존의 이유로 사용하지 않는다.

다만 다음은 계속 지킨다.

- 하나의 지속 의미에는 하나의 source of truth만 둔다.
- 동일 기능은 가능한 하나의 command/action/helper를 사용한다.
- Mantine callback이 임의로 domain state를 직접 수정하지 않는다.
- 실제 결함 수정이나 중복 제거는 Mantine와 독립적으로 가치가 있으면 유지한다.
- 파일 의미와 roundtrip을 바꾸는 변경은 별도 근거 없이 수행하지 않는다.

## cutover 원칙

staging이 기능적으로 준비되면 legacy UI와 Mantine UI를 장기간 병렬 유지하면서 동일 상태를 이중 소유하지 않는다.

cutover 시:

- 일반 UI ownership은 Mantine/React로 이동한다.
- legacy DOM synchronization은 새 shell에 필요하지 않으면 제거한다.
- Plotly, slot/image surface, 좌표계 preview 등 domain renderer는 유지한다.
- 파일 import/export와 파일 schema/validation은 회귀 검사 대상으로 우선 보존한다.

## 현재 graph-object 작업에 대한 적용

`20260902-048`까지 준비된 graph-object/palette staging은 다음 기준으로 평가한다.

- graph object canonical state는 기존 chart/editor domain model을 유지한다.
- add/select/delete/reorder/color/palette/edit command는 공통 경계를 사용한다.
- palette save/load 형식은 기존 JSON/HEX 의미를 유지한다.
- legacy `populateObjectForm`, `renderGraphObjects`, native input `.value` 동기화 등은 cutover 이후 일반 UI 소유권에 필요하지 않으면 제거 가능하다.
- 구버전 sidebar와 동일한 표시/선택 후 form 동기화를 Mantine shell에 복제할 필요는 없다.

## 다음 구현 우선순위

1. graph-object staging의 file roundtrip 관련 회귀 위험을 확인한다.
2. 일반 UI 기능 누락이 없다면 legacy graph-object UI보다 Mantine ownership을 우선해 cutover 경계를 준비한다.
3. cutover 후에만 제거 가능한 legacy handler/markup/CSS를 식별하고 작은 patch로 제거한다.
4. 다음 일반 UI 영역도 같은 기준으로 staging → ownership 전환 → legacy cleanup 순서로 진행한다.
