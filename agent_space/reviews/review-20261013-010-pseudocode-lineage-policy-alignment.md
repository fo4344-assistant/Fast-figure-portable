# Review 20261013-010 — Pseudocode lineage policy alignment

## 판정

상위 정책 `agent_space/policies/source-script-policy.md` v0.2.6에 따라 현재 개발 계층의 역할과 lineage를 재검토했다.

정책상 기본 의미 계층은 다음과 같다.

```text
Source Script
→ PlusCal pseudocode
→ Source Code
```

현재 프로젝트처럼 상태 기반 검증을 수행하는 범위에서는 다음 단계가 중간에 추가된다.

```text
Source Script
→ PlusCal pseudocode
→ verification model
→ TLA+/TLC
→ Source Code
```

PlusCal pseudocode는 Source Script 전체 번역 계층이며 verification 전용 또는 legacy artifact가 아니다. verification model은 pseudocode에서 필요한 bounded state-space slice를 파생한 선택적 검증 표현이다.

## 현재 의미 파일 상태

이 정렬 작업에서 다음 의미 파일은 변경하지 않았다.

- `sourcescript/**/*.py`
- `pseudocode/**/*.pcal`
- `verification/**/*.tla`
- `verification/**/*.cfg`
- `Fast-figure.html`
- `fast-figure.js`
- `fast-figure-ui.js`
- `scripts/build-portable.py`

따라서 Source Script r17, pseudocode r3의 번역 내용, verification-model r11의 TLC 결과, Source Code r13 application 의미는 그대로 유지된다.

## pseudocode 판정

활성 `.pcal` 9개는 Source Script responsibility module 전체에 대응한다.

r17에서 의미가 바뀐 module은 해당 `.pcal`도 r17로 갱신되어 있다.

- application_fsm
- renderer_runtime
- api_ui
- assets_files
- graphs

r17에서 해당 Source Script module 의미가 바뀌지 않은 나머지 `.pcal`은 r16 번역 내용이 그대로 r17 전체 번역의 일부로 유효하다.

현재 활성 pseudocode fingerprint:

```text
sha256:459b4ea5f5eefe9cda1e27b9241e4deb379df5c5ec9e2e82b0649751b8caf898
```

번역 검토 근거:

- `agent_space/reviews/review-20261013-007-pluscal-r17.md`

## verification 판정

verification 의미 fingerprint는 README 같은 상태 문서를 제외하고 `.tla/.cfg`만 대상으로 다시 정의했다.

```text
sha256:b4156896514d84f2b38b2d9346aaf93111249e927297ff3173485c702bd70a2b
```

verification 의미 파일 자체는 변경하지 않았으므로 revision은 r11을 유지한다.

r11의 TLC 성공 증거는 그대로 유효하다.

- validation review: `agent_space/reviews/review-20261013-008-tlc-interaction-r11.md`
- Actions run: `38357202939`
- result: passed

현재 metadata는 verification-model이 Source Script를 직접 대체하는 것이 아니라 current pseudocode fingerprint에서 파생되었음을 명시한다.

## Source Code 판정

r13 application source 파일은 변경하지 않았다.

기존 행동 검증:

- `agent_space/reviews/review-20261013-009-source-code-r13-plan009.md`
- final browser regression run `38382915972`: success

이번 review는 그 행동 검증을 대체하여 다시 실행한 것이 아니라, 같은 r13 Source Code가 현재 정책에 맞는 lineage로 추적됨을 기록한다.

현재 Source Code는 다음 세 관계를 모두 기록한다.

- current Source Script r17
- current complete PlusCal pseudocode r3
- current/passed verification-model r11

## 결론

잘못된 `archived/non-authoritative pseudocode` 분류는 폐기한다.

현재 계층은 다음과 같이 판정한다.

```text
Source Script r17       current / closed
PlusCal pseudocode r3   current / complete translation layer
verification-model r11  current / TLC passed
Source Code r13         current
```

application 의미 변경 없이 계층 메타데이터와 checker/README를 상위 정책에 맞게 정렬할 수 있다.
