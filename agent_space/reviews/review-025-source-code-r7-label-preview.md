# Source code r7 validation — label preview typography

## 검토 대상

- Source Script r12
- verification-model r6
- source code r7
- source-code fingerprint:
  `sha256:afbd3878736c6f01ea0fce5096605f8811861b850953d62b8dd4d7f084ffc3b8`
- 기준 진단: `agent_space/reviews/review-022-mantine-ui-regression-qa.md` 2.4
- UI specification: `agent_space/docs/ui-design-specification.md` §7

## Source Script 판정

label position, font family, font size와 reference geometry의 authoritative 의미는 이미 상위 계층에 있다.

이번 문제는 label preview가 실제 dashboard label과 다른 line-height를 상속한
renderer typography projection 불일치다.

따라서 Source Script와 verification-model은 변경하지 않는다.

## r7 수정

label position preview의 draggable label에 `lineHeight: 1.2`를 추가했다.

실제 dashboard `.slot-label`이 사용하는 line-height와 동일한 비율을 사용하므로
preview에서 글자가 아래로 밀려 보이던 line box 차이와 drag bounding-box 차이를 제거한다.

font size, padding, x/y authority와 drag mutation path는 변경하지 않는다.

## 회귀 검사

browser regression target을 source code r7로 올렸다.

startup project에서 일시적으로 label 표시를 활성화한 뒤:

1. 실제 dashboard label의 computed `line-height / font-size` 비율을 읽는다.
2. label overlay를 열어 preview label의 같은 비율을 읽는다.
3. 두 비율의 차이가 0.01 미만인지 확인한다.
4. overlay를 닫고 원래 label visibility를 복원한다.

따라서 단순 style literal 존재가 아니라 실제 renderer와 preview의 computed typography가 대응하는지 검사한다.

## 의미 및 경계

- project schema 변경 없음
- label settings schema 변경 없음
- label x/y mutation 변경 없음
- drag interaction state 변경 없음
- dashboard label renderer 변경 없음
- Source Script r12 / verification-model r6 유지
- preview typography projection만 수정

## 결론

source code r7은 기존 authoritative label settings를 바꾸지 않고
preview와 실제 renderer의 line box geometry를 다시 일치시킨다.
