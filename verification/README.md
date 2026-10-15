# Fast Figure verification model r26

이 디렉터리는 current PlusCal pseudocode에서 상태 기반 검증이 필요한 범위를 파생한 verification model이다.
verification model은 Source Script/PlusCal을 재설계하는 별도 권위가 아니다.

```text
Source Script r25
→ PlusCal pseudocode r11
→ verification model r26
→ TLA+/TLC
→ Source Code
```

## 현재 lineage

- Source Script: r25 / current / closed
- Source Script fingerprint: `sha256:7da7df78942382dc19d66dbf0e0759cf4f621350308b2e99d79b3ef1e6b6b73f`
- PlusCal pseudocode: r11 / current
- pseudocode fingerprint: `sha256:ead7ec7f3cc45baf2d6c88d9ccfe56ec4ebcd562444aa6741c43dee5f963cae5`
- verification-model: r26 / current
- verification fingerprint: `sha256:3d016684d15b73a3fd8889944088bd6dc21f7e1bdd041182c9dac3ac37d96e0a`
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

r26 correction review:

`agent_space/reviews/review-20261015-024-verification-r26-correction.md`

## TLC 상태

r25 최초 GitHub Actions 실행 `38703339145`에서 Boundary Core의 SANY parse는 성공했지만
`ConsumeReadProjection`의 `phase'` 변경과 `UNCHANGED vars`가 충돌하여 `read-ready` deadlock이 발견되었다.

이 오류는 Source Script/PlusCal 의미가 아니라 verification model 표현 오류로 판정했고,
r26에서 `phase`를 제외한 나머지 state만 `UNCHANGED`로 수정했다.

수정 커밋 `444927f2083652f4ce967942ae575b0c77180c7d`의 GitHub Actions run
`38703609264`에서 현재 확인된 상태는 다음과 같다.

- Interaction Core: success
- Boundary Core: success
- Slot Core: model check 실행 중

따라서 현재 상태는 다음과 같다.

```text
verification-model r26 = current derivation
TLC = pending
validation_review = null
```

세 canonical model이 모두 성공한 뒤에만 `passed`와 validation review를 기록한다.
Source Code는 TLC passed와 validation review가 확보되기 전에는 plan-016의 current implementation으로 닫지 않는다.

## bounded verification의 의미

모든 bound는 application 제한이 아니라 TLC 상태공간을 위한 verification-only 제한이다.
TLC가 통과하더라도 bounded state-space 전체를 넘는 일반 증명으로 과장하지 않는다.

모델에서 크게 추상화하거나 생략한 범위와 재포함 조건은 r25 derivation review에 기록한다.
