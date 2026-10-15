# Fast Figure verification model r25

이 디렉터리는 current PlusCal pseudocode에서 상태 기반 검증이 필요한 범위를 파생한 verification model이다.
verification model은 Source Script/PlusCal을 재설계하는 별도 권위가 아니다.

```text
Source Script r25
→ PlusCal pseudocode r11
→ verification model r25
→ TLA+/TLC
→ Source Code
```

## 현재 lineage

- Source Script: r25 / current / closed
- Source Script fingerprint: `sha256:7da7df78942382dc19d66dbf0e0759cf4f621350308b2e99d79b3ef1e6b6b73f`
- PlusCal pseudocode: r11 / current
- pseudocode fingerprint: `sha256:ead7ec7f3cc45baf2d6c88d9ccfe56ec4ebcd562444aa6741c43dee5f963cae5`
- verification-model: r25 / current
- verification fingerprint: `sha256:2c1051c19c2b2ac4502d0fefe2162fbf3e5dc9d02635d8333190aab1f441cb91`
- TLC: pending

verification fingerprint는 `verification/**/*.tla`와 `verification/**/*.cfg`만 포함한다.
README 자체는 의미 fingerprint에 포함하지 않는다.

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

## TLC 상태

현재 r25에서는 새 Boundary Core가 추가되었지만 실제 TLA+ parse/TLC를 아직 실행하지 못했다.

이번 작업 환경에는 Java 21은 있으나 저장소 workflow가 사용하는 TLA+ tools v1.7.4 jar가 설치되어 있지 않고,
외부 DNS 제한으로 공식 release jar를 내려받지 못했다.

따라서 현재 상태는 다음과 같다.

```text
verification-model r25 = current derivation
TLC = pending
validation_review = null
```

GitHub Actions는 사용하지 않았다.

Source Code는 TLC passed와 validation review가 확보되기 전에는 plan-016의 current implementation으로 닫지 않는다.

## bounded verification의 의미

모든 bound는 application 제한이 아니라 TLC 상태공간을 위한 verification-only 제한이다.
TLC가 통과하더라도 bounded state-space 전체를 넘는 일반 증명으로 과장하지 않는다.

모델에서 크게 추상화하거나 생략한 범위와 재포함 조건은 r25 derivation review에 기록한다.
