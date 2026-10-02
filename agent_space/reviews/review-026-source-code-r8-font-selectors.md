# Source code r8 validation — font selectors

## 검토 대상

- Source Script r12
- verification-model r6
- source code r8
- source-code fingerprint:
  `sha256:f1a5fa8a4e80369457cbbe86193b8da5fcce00e05d63bb174e57669e2780316b`
- 기준 진단: `agent_space/reviews/review-022-mantine-ui-regression-qa.md` 2.5
- UI specification: `agent_space/docs/ui-design-specification.md` §8

## Source Script 판정

font family의 authoritative 값은 기존 settings 문자열이다.
UI widget 종류와 predefined 목록은 Source Script domain 의미가 아니다.

이번 변경은 TextInput으로 단순화되면서 사라진 선택 UX와 기존 custom font 보존 동작을
Mantine UI에서 복원한다.

Source Script와 verification-model은 변경하지 않는다.

## r8 수정

graph, label, caption의 font family control을 Mantine Select로 통일했다.

### graph predefined 목록

- 자동
- Arial
- Helvetica
- Open Sans
- Verdana
- Times New Roman
- Georgia
- Courier New

### label/caption predefined 목록

- 기본(system-ui)
- Arial
- Times New Roman
- Georgia
- Courier New

Select의 내부 value와 persistent font family 문자열을 분리하기 위해
UI-local prefix encoding을 사용한다.

이는 빈 문자열인 graph 자동 값을 Select option으로 표현하기 위한 adapter이며,
project state에는 prefix가 저장되지 않는다.

현재 값이 predefined 목록에 없으면 `기존: <font family>` option을 runtime에서 추가한다.
따라서 imported Plotly나 이전 개발 버전에서 저장된 custom font family가 UI를 여는 것만으로
손실되지 않는다.

## source of truth

- authoritative value: 기존 graph/label/caption settings의 fontFamily 문자열
- predefined option 목록: UI specification을 구현하는 static UI data
- Select token: component adapter-local value
- custom option: 현재 authoritative 값에서 매 render 파생

별도 persistent font state나 양방향 동기화 state는 추가하지 않았다.

## 회귀 검사

browser regression target을 source code r8로 올렸다.

annotation 검사:

1. label font를 Arial로 설정하면 Select가 Arial을 표시한다.
2. custom label font를 설정하면 `기존: ...` 값으로 보존된다.
3. caption custom font도 같은 Select/custom 보존 모델을 사용한다.
4. 검사 후 원래 settings를 복원한다.

graph 검사:

1. 기존 blank graph regression 이후 editable chart에서 graph font를 자동 값으로 설정한다.
2. Select가 `자동`을 표시한다.
3. custom graph font가 authoritative settings에 저장되는지 확인한다.
4. graph workspace를 다시 선택해 editor를 재구성한 뒤 `기존: ...`로 보존되는지 확인한다.
5. 원래 graph font를 복원한다.

## 의미 및 경계

- project schema 변경 없음
- fontFamily stored value 형식 변경 없음
- graph layout command 의미 변경 없음
- label/caption settings command 의미 변경 없음
- Source Script r12 / verification-model r6 유지
- UI widget와 adapter projection만 변경

## 결론

source code r8은 기존 font family source of truth를 유지하면서
pre-Mantine의 선택형 font UI와 custom historical value 보존 자유도를 복원한다.
