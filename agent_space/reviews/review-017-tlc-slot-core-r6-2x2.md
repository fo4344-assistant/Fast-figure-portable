# review-017 — verification-model r6 TLC 2x2 validation

## 판정

`verification-model` r6의 slot/layout/chart direct translation에 대해
사용자가 승인한 2x2 finite bound로 TLC exhaustive model checking을 수행했고 통과했다.

판정:

```text
verification-model r6 = current
TLC bounded validation = passed
validated grid bound = 2x2
3x3 validation = not claimed
```

## 권위 계층

검증 대상 lineage:

- Source Script: r12, current/closed
- verification-model: r6, current
- verification fingerprint:
  `sha256:1998bb5eb999e46066d962b51a7e1081149df2f1358710fae55c5dfdb665c82b`

이번 검증에서는 `verification/**/*`를 수정하지 않았다.
따라서 r6 fingerprint와 Source Script derivation은 그대로 유지된다.

## 실행 프로필

canonical verification code:

- `verification/FastFigureSlotCore.tla`
- `verification/FastFigureSlotCore.cfg`

CI execution profile:

- `.github/tlc/FastFigureSlotCore2x2.tla`
- `.github/tlc/FastFigureSlotCore2x2.cfg`

execution wrapper는 canonical module을 `EXTENDS`한 뒤 TLC config operator override로:

```text
MaxRows = 2
MaxCols = 2
```

에 해당하는 실행 bound를 적용한다.

다음 representative cardinality와 verification assertions는 canonical model 값을 그대로 사용했다.

- initial grid: 2x2
- chart ids: 2
- image ids: 1
- `TypeOKSpec`
- `SafetyInvariant`
- `ChartOwnershipInvariantSpec`

PlusCal-generated procedure local initialization을 위해
execution cfg에 `defaultInitValue = defaultInitValue` model value assignment를 둔다.

## 실행 증거

성공 실행:

- GitHub Actions workflow: `TLA Slot Core`
- run id: `36895823728`
- job id: `110482441021`
- tested commit: `ca115723673bc339b9d331980f810be58a1fdf9b`
- TLC: 2.19, TLA+ tools v1.7.4
- workers: 4
- search: breadth-first exhaustive model checking

단계 결과:

- PlusCal translation: success
- canonical generated TLA+ SANY parse: success
- 2x2 execution wrapper SANY parse: success
- TLC model check: success
- invariant violation: none
- error/counterexample: none

최종 TLC 통계:

- generated states: 14,129,174
- distinct states: 8,114,209
- states left on queue: 0
- complete graph depth: 28
- maximum outdegree: 31
- elapsed: 8 min 30 s

TLC 최종 메시지:

```text
Model checking completed. No error has been found.
```

## 사전 실행 실패의 구분

첫 임시 실행 `36895617878`은 wrapper와 SANY parse까지 통과했으나
root execution cfg에 PlusCal-generated `defaultInitValue` assignment가 없어
model initialization 전에 종료되었다.

이 실패는 invariant violation이나 verification-model counterexample이 아니며,
execution configuration 누락으로 분류한다.

수정 후 동일한 2x2 model bound에서 exhaustive run이 정상 완주했다.

## 범위

이번 `passed` 판정은 2x2 finite bound에 대한 것이다.

3x3은 직전 실행에서 45분 동안:

- 25,812,902 generated states
- 20,812,969 distinct states
- 12,680,664 states left on queue

상태에서 timeout되었고 완주 판정을 얻지 못했다.

사용자가 3x3 검증은 필요하지 않다고 명시했으므로,
3x3 미완주는 이번 validation gate의 미충족 조건으로 취급하지 않는다.

이 판정은 아직 번역되지 않은 다른 Source Script 영역까지 검증했다는 뜻이 아니다.
`verification/README.md`에 deferred로 기록된 다른 영역은 별도 verification module 대상이다.
