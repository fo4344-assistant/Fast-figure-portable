# Fast Figure verification models

이 디렉터리는 PlusCal pseudocode에서 상태 기반 검증이 필요한 범위를 파생하여 표현하는 선택적 verification model을 보관한다.
verification model은 Source Script/PlusCal을 재설계하는 별도 권위가 아니다.

계층 revision/fingerprint/파생 관계는 저장소 루트의 `development-versions.json`에서 확인한다. 실제 TLC 실행 결과와 검증 판단은 관련 review와 원시 로그에 기록하며, 이 README는 버전·실행 상태를 복제하지 않는다.

verification fingerprint는 `verification/**/*.tla`와 `verification/**/*.cfg`만 포함한다. README 자체는 의미 fingerprint에 포함하지 않는다.

## canonical verification modules

- `FastFigureSlotCore.tla` / `FastFigureSlotCore.cfg`
  - slot/layout/chart candidate
  - chart ownership
  - slot reference integrity
  - grid/merge/split/reset/image-import bounded transition
- `FastFigureInteractionCore.tla` / `FastFigureInteractionCore.cfg`
  - Frontend slot selection
  - CSV/reference/tree interaction
  - batch import atomicity
  - trash/reference and slot-connection constraints
- `FastFigureBoundaryCore.tla` / `FastFigureBoundaryCore.cfg`
  - Backend project authority mutation boundary
  - stale/invalid reference rejection and failure atomicity
  - commit → reconciliation → renderer ordering
  - Frontend/renderer no-write boundary
  - one-way Backend read projection

## Boundary Core abstraction

Boundary Core는 ProjectObject 전체를 다시 복제하지 않는다.
Backend persistent authority를 bounded `projectRevision` token으로 나타내고,
Frontend reference validation과 Application-boundary ordering에 필요한 최소 상태만 둔다.

실제 slot/chart/image/CSV/VFS 상태는 기존 Slot Core와 Interaction Core가 소유하는 검증 범위를 유지한다.

derivation/abstraction review:

`agent_space/reviews/review-20261015-023-verification-r25-derivation.md`

r26 correction review:

`agent_space/reviews/review-20261015-024-verification-r26-correction.md`

## TLC 사용과 결과 해석

실제 검증 결과가 확인된 경우에만 그에 맞는 상태와 validation review를 기록한다. TLC 실행·통과는 Source Code 구현 또는 `current` 판정의 필수 조건이 아니다.

## bounded verification의 의미

모든 bound는 application 제한이 아니라 TLC 상태공간을 위한 verification-only 제한이다.
TLC가 통과하더라도 bounded state-space 전체를 넘는 일반 증명으로 과장하지 않는다.

모델에서 크게 추상화하거나 생략한 범위와 재포함 조건은 r25 derivation review에 기록한다.
