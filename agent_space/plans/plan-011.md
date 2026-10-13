# 계획 011 — pseudocode 계층 정책 정렬과 README 상태 복구

## 목적

상위 정책 `agent_space/policies/source-script-policy.md` v0.2.6에 맞춰 현재 저장소의 개발 계층 메타데이터와 상태 문서를 정렬한다.

이번 작업은 application 의미를 변경하지 않는다. 현재 Source Script r17, PlusCal pseudocode r17 번역, verification-model r11 TLC 결과, Source Code r13 구현을 그대로 유지하면서 잘못된 계층 분류와 오래된 상태 설명을 수정한다.

## 정책 기준

정식 개발 흐름은 다음과 같다.

```text
Source Script
→ PlusCal pseudocode
→ Source Code
```

상태 기반 검증을 사용하는 범위에서는 다음 선택적 검증 단계가 pseudocode와 Source Code 사이에 들어간다.

```text
Source Script
→ PlusCal pseudocode
→ verification model
→ TLA+/TLC
→ Source Code
```

PlusCal pseudocode는 verification 전용 산출물이 아니라 Source Script 전체를 언어중립 실행 절차로 직접 번역한 정식 중간 계층이다.

verification model은 pseudocode에서 필요한 범위를 파생한 선택적 검증 표현이며 독립 설계 권위가 아니다.

## 변경 대상

1. `agent_space/AGENT.md`
   - 잘못된 `Source Script > verification-model > source code` 우선순위를 정책과 같은 구조로 고친다.
   - pseudocode를 정식 중간 계층으로 명시한다.
   - verification-model은 pseudocode 파생 검증 표현으로 명시한다.

2. `development-versions.json`
   - pseudocode를 `legacy_artifacts`에서 제거한다.
   - `layers.pseudocode` 정식 계층으로 기록한다.
   - 현재 r17 Source Script에서 직접 파생된 current pseudocode로 기록한다.
   - verification-model의 `derived_from`에 pseudocode fingerprint를 기록한다.
   - Source Code의 `derived_from`에도 pseudocode fingerprint를 기록한다.

3. `scripts/check-development-layer-versions.py`
   - Source Script → pseudocode → Source Code 의미 계층을 검사한다.
   - 현재 프로젝트의 verification/TLC gate가 pseudocode에서 파생되는지도 검사한다.
   - pseudocode 의미 fingerprint는 활성 `.pcal` 파일만 사용한다.
   - verification 의미 fingerprint는 `.tla/.cfg` 파일만 사용한다.
   - README 같은 상태 문서 수정이 의미 revision fingerprint를 바꾸지 않게 한다.

4. `pseudocode/README.md`
   - r16 WIP 표기를 현재 r17 전체 번역 상태로 갱신한다.
   - r17에서 변경되지 않은 module의 `.pcal` 내용은 그대로 유효한 전체 번역의 일부임을 명시한다.
   - verification과 독립적인 pseudocode의 역할을 명시한다.

5. `verification/README.md`
   - verification이 Source Script 직접 대체물이 아니라 PlusCal pseudocode의 선택적 파생 검증 표현임을 명시한다.
   - r11 current / TLC passed 상태로 갱신한다.
   - r17 interaction 검증의 실제 성공 상태를 반영한다.

## 변경하지 않는 범위

- `agent_space/policies/source-script-policy.md` 원문
- `sourcescript/**/*.py`
- `pseudocode/**/*.pcal`
- `verification/**/*.tla`, `verification/**/*.cfg`
- `fast-figure.js`, `fast-figure-ui.js`, `Fast-figure.html`
- application 동작 의미

## 검증과 빌드

1. 변경 commit에서 GitHub-hosted `Development layer versions` workflow가 통과해야 한다.
2. 검사 성공 후 GitHub-hosted `Build distribution` workflow를 실행한다.
3. self-hosted runner는 사용하지 않는다.
