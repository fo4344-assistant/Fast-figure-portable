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

일반 UI는 구버전의 **구현 방식**을 그대로 보존할 필요는 없지만, 사용자가 실제로 사용하던 기능과 시각적 도구는 Mantine/React 구조로 이식한다.

반드시 유지하거나 동등 이상으로 이식할 대상:

- popup/dialog가 제공하던 기능 요소와 작업 흐름
- popup의 정보 구성과 사용자가 동시에 확인해야 하는 항목들의 관계
- 미리보기, 좌표계 표시, 슬롯/레이블 비율 표시 등 기능 수행에 필요한 시각적 보조 요소
- 편집 가능한 값, 조정 범위, 조작 자유도와 세부 기능
- 사용자가 비교·확인·조정하기 위해 필요한 공간적 배치 의도
- 적용/취소/초기화/불러오기/저장 등 명시적인 기능 동작
- 기능 수행 중 필요한 상태 표시, validation 결과, preview feedback

Mantine 전환 과정에서 그대로 보존할 필요가 없는 대상:

- legacy HTML markup 자체
- legacy DOM ID/class 구조 자체
- custom popup wrapper와 직접 구현한 focus/Escape/outside-click lifecycle
- legacy CSS selector에 고정된 크기·padding·positioning 구현
- legacy DOM `.value` 동기화 방식
- legacy UI의 임시 상태 보관 방식
- 동일 기능을 위해 분산되어 있던 renderer-side DOM synchronization

따라서 "legacy popup 배치를 보존하지 않는다"는 의미는 popup의 기능적 화면 구성이나 preview를 버린다는 뜻이 아니다. 기존 custom CSS/absolute positioning을 그대로 복제할 의무가 없다는 뜻이며, 필요한 정보 관계와 조작 흐름은 Mantine `Modal`, `Grid`, `Group`, `Stack`, `Paper` 등의 공통 primitive로 재구성한다.

## 충돌 판단

구버전 일반 UI 동작과 `plan-004`의 구조적 목표가 충돌하면 다음 순서로 판단한다.

1. 파일 호환성 또는 파일 의미가 깨지는가?
   - 그렇다면 파일 호환성을 우선한다.
2. 사용자 기능, 편집 자유도, 필요한 preview/시각 정보가 줄어드는가?
   - 그렇다면 해당 기능/시각 요소를 Mantine 구조로 이식하는 대안을 선택한다.
3. domain 데이터 의미가 불필요하게 바뀌는가?
   - 그렇다면 domain 의미를 보존하는 대안을 찾는다.
4. 단지 legacy DOM/CSS/manual popup lifecycle/renderer-side synchronization과 충돌하는가?
   - 그렇다면 `plan-004`의 Mantine 단일 소유, 최소복잡도, 공통 규칙 중앙화를 우선한다.

## EFSM/domain 기준

구버전과의 동작 일치 자체를 EFSM/domain 구조 보존의 이유로 사용하지 않는다.

다만 다음은 계속 지킨다.

- 하나의 지속 의미에는 하나의 source of truth만 둔다.
- 동일 기능은 가능한 하나의 command/action/helper를 사용한다.
- Mantine callback이 임의로 domain state를 직접 수정하지 않는다.
- 실제 결함 수정이나 중복 제거는 Mantine와 독립적으로 가치가 있으면 유지한다.
- 파일 의미와 roundtrip을 바꾸는 변경은 별도 근거 없이 수행하지 않는다.
- UI migration 때문에 preview 계산이나 domain renderer 계산을 단순화하거나 제거하지 않는다.

## popup / preview 이식 기준

각 기존 popup/dialog를 전환할 때는 제거 전에 다음을 inventory한다.

1. 어떤 값을 편집하는가
2. 어떤 preview 또는 시각적 feedback을 제공하는가
3. preview가 실제 domain geometry/scale과 어떤 관계를 갖는가
4. 어떤 값들을 동시에 보여주는 이유가 있는가
5. 적용/취소/닫기/초기화 동작은 무엇인가
6. resize, drag, keyboard, focus 등 사용자 조작에서 기능적으로 필요한 부분은 무엇인가
7. 단순 custom 구현 세부사항과 실제 기능 요구를 구분할 수 있는가

이 inventory에서 기능 요구로 판정된 것은 Mantine component tree에 포함시킨다.

예:

- label popup의 실제 슬롯 대비 label 크기/위치 preview → 유지 및 이식
- layout popup의 layout map/slot preview → 유지 및 이식
- popup 오른쪽에 preview가 배치되어 설정과 결과를 동시에 비교하게 하는 구조 → 동일한 기능적 관계를 유지하는 2-column/Grid 구조로 이식 가능
- 수동 `left/top`, custom z-index, 직접 구현한 Escape listener → Mantine lifecycle로 교체 가능

## cutover 원칙

staging이 기능적으로 준비되면 legacy UI와 Mantine UI를 장기간 병렬 유지하면서 동일 상태를 이중 소유하지 않는다.

cutover 시:

- 일반 UI ownership은 Mantine/React로 이동한다.
- legacy DOM synchronization은 새 shell에 필요하지 않으면 제거한다.
- Plotly, slot/image surface, layout map, label preview, 좌표계 기반 preview 등 기능성 renderer는 유지하거나 React/Mantine shell 안의 host로 이식한다.
- 파일 import/export와 파일 schema/validation은 회귀 검사 대상으로 우선 보존한다.
- 기존 popup에 있던 기능/preview가 staging component에 빠져 있다면 cutover 완료로 간주하지 않는다.

## 현재 graph-object 작업에 대한 적용

`20260902-048`까지 준비된 graph-object/palette staging은 다음 기준으로 평가한다.

- graph object canonical state는 기존 chart/editor domain model을 유지한다.
- add/select/delete/reorder/color/palette/edit command는 공통 경계를 사용한다.
- palette save/load 형식은 기존 JSON/HEX 의미를 유지한다.
- legacy `populateObjectForm`, `renderGraphObjects`, native input `.value` 동기화 자체는 cutover 이후 제거 가능하다.
- 그러나 legacy graph-object UI가 제공하던 실제 편집 항목, 선택 정보, 색상 조정, 순서 변경, 추가/삭제 등 기능은 Mantine UI에 모두 존재해야 한다.
- 단지 legacy sidebar와 픽셀 단위로 같은 배치를 재현할 필요는 없지만, 설정 간 관계와 작업 흐름은 유지한다.

## 다음 구현 우선순위

1. 각 overlay와 sidebar 영역별로 legacy UI의 **기능 요소 + preview/시각적 보조 요소 inventory**를 작성한다.
2. 현재 staging component와 inventory를 대조해 빠진 기능/preview가 있으면 cutover 전에 이식한다.
3. 파일 roundtrip 관련 회귀 위험을 별도로 확인한다.
4. 기능 누락이 없어진 영역부터 Mantine ownership으로 전환한다.
5. cutover 후에만 불필요해진 legacy handler/markup/CSS를 작은 patch로 제거한다.
