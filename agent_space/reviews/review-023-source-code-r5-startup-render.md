# Source code r5 validation — startup dashboard projection

## 검토 대상

- Source Script r12
- verification-model r6
- source code r5
- source-code fingerprint:
  `sha256:9a4a22efc294565859c0a7109b50626e6bd48d2ef0133faf55b088f9aae5775d`
- 기준 진단: `agent_space/reviews/review-022-mantine-ui-regression-qa.md` 2.2

## Source Script 판정

이번 수정은 새 의미를 추가하지 않는다.

`sourcescript/system.py::initializeFastFigure`는 초기 project에 이미 존재하는 empty slot을
renderer에 투영한 뒤 ready 상태로 진입하도록 요구한다. 따라서 초기 slot이 DOM에 보이지
않던 현상은 Source Script 누락이 아니라 source code startup sequence의 하위 구현 불일치다.

Source Script와 verification-model은 변경하지 않는다.

## r5 수정

`fast-figure.js` startup sequence에서:

```text
applyDashboardZoom
→ installSlotClickController
→ applySlotStyle
→ renderDashboard
→ appFSM.ready
```

순서로 초기 dashboard projection을 명시적으로 수행한다.

초기 project state나 slot 생성 규칙은 변경하지 않는다. palette 적용도 renderer
초기화 경로로 사용하지 않는다.

## 회귀 검사

browser regression target을 source code r5로 올렸다.

사용자 상호작용을 시작하기 전에 다음을 검사한다.

- default project가 slot 4개를 소유한다.
- `#dashboard .slot:not(.hidden)`가 4개 존재한다.

기존 14개 회귀 항목은 그대로 유지하고 startup 검사를 15번으로 추가했다.
번호를 재배열하지 않아 기존 test reference를 보존했다.

## 의미 및 경계

- project schema 변경 없음
- slot 생성/ownership 변경 없음
- UI FSM/EFSM 의미 변경 없음
- palette 의미 변경 없음
- renderer initialization call만 복원
- Source Script r12 / verification-model r6 유지

## 결론

source code r5는 Source Script r12가 이미 요구하던 startup renderer projection을
복원한다. 상위 계층 의미 변경 없이 source-code revision만 증가시키는 것이 맞다.
