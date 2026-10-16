# Fast Figure PlusCal pseudocode — r37 번역 착수

## 현재 상태

정확한 revision/fingerprint/lineage의 원천은 루트 `development-versions.json`이다.

- Source r37: closed. 근거: `agent_space/reviews/review-20261016-020-source-r37-closure.md` 및 직전 논리 구조 검토.
- 활성 pseudocode: r11 **stale**, 과거 Source r25 fingerprint에서 파생했다. 현재 평면 `.pcal` 파일은 Source r37의 완성 번역이 아니다.
- 새 번역: `agent_space/plans/plan-022.md`에 따라 시작했다. Backend/Application/Frontend/Portable build hierarchy를 보존한다.
- 전체 번역·충실도 대조 후에만 새 revision/fingerprint/derived_from/translation_review와 함께 current로 전환한다. 일부 작업본만으로 current를 선언하지 않는다.

활성 의미 파일은 `pseudocode/**/*.pcal`이다. 이 README와 기존 `.md` 비교 문서는 의미 fingerprint에 포함되지 않는다. 과거 문서의 r17/current 표현은 당시 기록이며 현재 lineage가 아니다.

## 작업 방식

진행 중 PlusCal 작업본은 현재 작업 경로의 `.work/plan022/pseudocode/`에 일시 보관한다. 아직 branch의 활성 명세/구현 입력이 아니다. 기존 활성 파일과 섞어 최신 전체 번역인 것처럼 사용하지 않는다. 전체 cutover 시 계획의 목표 경로로 옮기고 기존 평면 활성 파일 및 임시 작업본을 정리한다.

Source의 입력/출력, branch, 계산, 참조, current-authority resolve, candidate→validation→one commit, 실패·취소·부분 완료, runtime/persistent 분리와 자원 수명을 언어중립 절차로 번역한다. Source에 없는 domain state/모듈/branch를 추가하거나 platform 구현을 확정하지 않는다.

```text
Source Script (closed)
→ PlusCal pseudocode 전체 번역 및 충실도 확인
→ [선택적 verification-model/TLC]
→ Source Code
```

TLC는 선택적 파생 검증이며 pseudocode의 대체물 또는 번역 착수의 필수 gate가 아니다. 실행하지 않은 검증을 성공으로 기록하지 않는다.
