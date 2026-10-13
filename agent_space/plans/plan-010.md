# 계획 010 — plan-009 실행기 조건 갱신

## 1. 이전 계획과의 관계

이 문서는 `plan-009.md`의 기능 범위와 구현 순서를 유지하면서 검증 실행기 조건만 갱신한다.

사용자가 self-hosted 서버를 꺼 둔 상태이므로 이전의 "GitHub Actions는 사용하지 않는다" 조건은 self-hosted runner 사용을 피하기 위한 운영 조건이었다. 사용자의 새 지시에 따라 GitHub Actions 자체에 문제가 없다면 GitHub-hosted runner를 사용할 수 있다.

따라서 plan-009의 기능·계층·검증 요구는 그대로 유지하고 실행기 조건만 다음과 같이 변경한다.

## 2. 실행기 조건

1. self-hosted runner와 self-hosted label은 사용하지 않는다.
2. 현재 저장소 workflow가 사용하는 `ubuntu-latest` GitHub-hosted runner는 사용할 수 있다.
3. Source Code 변경 후 다음 hosted workflow 결과를 검증 증거로 사용할 수 있다.
   - Fast Figure regression
   - Development layer versions
   - Build distribution
4. hosted workflow를 사용한다는 이유로 Source Script → verification-model → TLC → Source Code 권위 순서나 patch 기록 요건을 완화하지 않는다.
5. workflow가 실패하면 실패 원인을 확인한 뒤 해당 계층으로 돌아가 수정한다.

## 3. 현재 시작점

현재 계층 상태:

```text
Source Script r17       current / closed
verification-model r11  current / TLC passed
Source Code r12         stale
```

따라서 다음 작업은 plan-009의 Source Code 구현이다.

구현 대상과 의미는 plan-009 및 Source Script r17을 그대로 따른다.

- slot selection-state-first click dispatch
- dashboard background deselection
- 일반 빈 CSV 생성 및 선택 public command
- trash asset row action Menu 접근과 selection disabled 분리
- Layout / Label / Caption / Print 공통 Modal maximum
- Layout preview의 actual rendered width 기반 geometry와 preview/handle 공통 width ownership
- 회귀 테스트 갱신
- source-code revision/fingerprint/derived_from 갱신

## 4. 검증

구현 commit은 현재 r17/r11 lineage에서 source-code revision을 증가시키고 `current`로 끝나야 한다.

commit 후 GitHub-hosted runner에서 회귀 검사와 development-layer version 검사를 확인한다. distribution build도 hosted runner로 수행할 수 있다.
