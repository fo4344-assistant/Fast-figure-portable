# Plan 016 — selection/reconciliation boundary (Source Code r32 → r33, WIP)

## 대상과 추적

- 기준 main: `2ce0c59d4aaf90e753478899d4ea18998e1e19fd`.
- Source Script r25 / PlusCal r11의 `project_state` Backend query providers, `interface_fsm` validated selection / reconciliation, `application_fsm` dispatch 순서를 구현한다.
- Frontend FSM은 ProjectObject registry를 받지 않으며 context에 live Backend object를 전달하지 않는다. workspace의 chart activation/normalization hook과 persistent command action table 연결을 제거한다.
- Application adapter가 current Backend authority에서 선택 reference를 검증한 뒤 accepted input만 전달한다. invalid slot/path/index는 기존 Frontend state를 유지하고 explicit null은 deselection이다.
- Backend query provider가 commit result와 current Frontend reference를 resolve한 immutable scalar reconciliation input을 만든다. Frontend FSM은 이를 적용할 뿐 domain lookup/normalization을 수행하지 않는다.
- graph public selection도 live graph normalization 없이 검증 후 graph index와 CSV path를 함께 선택한다.
- commit 실패는 success reconciliation을 발생시키지 않는다. unrelated command는 유효 reference를 유지하고 asset move/trash는 실제 결과와 current authority로 path를 갱신/clear한다.

## 검증

- browser regression 37: graph selection read-only/identity 보존, invalid slot/path/kind/index 무변경, public invalid graph selection, immutable validated input, asset 선택 시 graph clear, explicit slot deselection.
- browser regression 38: unrelated commit의 reference 보존, 실패 command의 authority/Frontend 무변경, move/trash reconciliation, immutable reconciliation input.
- 검증 실행은 사용자 요청에 따라 GitHub Actions만 사용한다. 로컬 application/test/build/version checker 실행은 하지 않는다.
- 초기 r32 `db12b16e9a1919ced318b97e6a6b1a317421f726`: version 검사 [38842191341](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/38842191341) 성공. build [38842194014](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/38842194014) 성공 (동일 source의 dist bot 후속 commit `c4f4dcb84babee914205486d56020ff4b000184a`).
- 초기 regression [38842189150](https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/38842189150)은 inline/split 모두 24/37/38 실패. 24는 object 수정 후 현재 CSV 선택을 object CSV로 바꾸는 회귀, 37은 이미지 자산이 남은 슬롯 fixture, 38은 존재하지 않는 `/assets/data` fixture 경로였다.
- r33 보정: explicit public graph selection에만 검증된 CSV selection hint를 적용한다. object commit의 index 갱신은 별도 current CSV 선택을 덮어쓰지 않는다. 37은 slot reset으로 독립 fixture를 만들고 38은 기본 `/assets/csv`를 사용한다.
- r33 Actions 재검증: pending.

## 한계와 다음 ownership 단위

- Plan 016 전체 완료가 아니다. renderer와 남은 API/domain consumer의 direct Backend access cutover, public read projection 완성 및 전체 회귀 감사가 남는다.
- source-code status는 `stale`로 유지한다. r32/r33은 r25/r11의 이 ownership 단위 구현이며 전체 Source Code가 최신 경계를 구현했다는 뜻이 아니다.
- Source Script/PlusCal/verification 의미는 변경하지 않는다. TLC는 실행하지 않으며 기존 pending 기록을 유지한다.
