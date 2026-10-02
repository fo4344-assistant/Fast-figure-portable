# Source code r6 validation — layout preview surface

## 검토 대상

- Source Script r12
- verification-model r6
- source code r6
- source-code fingerprint:
  `sha256:82c1bdc1853d7bf43ef843dbcdee09e2608dc26ac7ebbf4181bce6f7a6d98de7`
- 기준 진단: `agent_space/reviews/review-022-mantine-ui-regression-qa.md` 2.3
- UI specification: `agent_space/docs/ui-design-specification.md`

## Source Script 판정

layout preview의 logical geometry와 slot selection 기능은 이미 상위 계층에 존재한다.

이번 문제는 preview slot을 generic Button으로 표현하면서 global Button control height가
grid geometry에 유입된 renderer composition 문제다.

따라서 Source Script와 verification-model은 변경하지 않는다.

## r6 수정

layout preview slot cell을 sized Mantine Button에서 Mantine UnstyledButton으로 바꿨다.

UnstyledButton은 button interaction semantics를 유지하지만 generic Button의
38px height/padding 규칙을 적용하지 않는다.

각 cell의 width/height는 100%로 두어 CSS grid track이 실제 크기를 결정한다.
selection은 기존 `layoutSelection`만 읽어 palette 기반 border/fill emphasis로 표시한다.

새 persistent state, preview geometry cache 또는 별도 selection source는 추가하지 않았다.

## UI specification

디자인 관련 규칙은 Source Script에 넣지 않고
`agent_space/docs/ui-design-specification.md`에 일반 specification으로 분리했다.

문서는 특정 renderer 함수가 아니라 다음 UI 계약을 정의한다.

- generic control과 renderer surface 구분
- modal/action hierarchy
- form alignment
- layout preview geometry
- label preview typography parity
- font selector interaction
- numeric edit draft/commit
- caption field alignment
- preview/renderer projection 원칙

## 회귀 검사

browser regression target을 source code r6로 올렸다.

startup 상태에서 layout overlay를 열고:

- preview direct cell이 sized Mantine Button이 아님
- 첫 slot cell의 실제 height가 CSS grid가 계산한 1-row track height와 일치함

을 검사한 뒤 overlay를 닫는다.

기존 startup 및 domain/file regression은 그대로 유지한다.

## 의미 및 경계

- project schema 변경 없음
- layout geometry 계산 변경 없음
- merge/split command 변경 없음
- layoutSelection ownership 변경 없음
- EFSM transition 변경 없음
- Source Script r12 / verification-model r6 유지
- preview renderer component만 교체

## 결론

source code r6는 layout preview에서 generic control sizing을 제거하고
기존 logical grid geometry가 실제 표시 크기를 다시 소유하도록 한다.
