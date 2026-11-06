# 회귀 검사 범위 축소

사용자 지시: 구현 세부사항을 하드코딩하거나 중복/불필요한 검사를 추가하지 말고 핵심 동작만 검사한다. 기준 HEAD `21758bc69ac5c4fa05cd9ec78be0b08d5ee24fc3`은 기존 push 뒤의 자동 배포 갱신을 fast-forward한 상태다.

## 제거·유지 판단

- **삭제156/157/159/169**: 실제 수신 함수까지 spy로 바꾼 뒤 정확한 helper identity/query 횟수/호출 순서를 재검사하던 adapter 배선 검사. startup15, supplied renderer151/158, commit effects155, detached public reads168과 겹친다. 157의 실패는 실제 초기화 실패가 아니라 함수 identity 고정에서 발생했다. 같은 류의 검사159/169까지 함께 삭제했으며 새 대체 검사는 만들지 않았다.
- **22의 DOM 교체 조건 삭제**: payload swap과 클릭 억제/복구가 계약이다. 정상적인 host 재사용을 실패로 판정하던 node identity 조건은 계약이 아니다. 실제 drag 이벤트·payload·selection 검사는 유지한다.
- **109의 fixture 보정**: CSV를 없애도 보존돼야 하는 conversion chart를 만들면서 실제 imported figure를 넣지 않았었다. 실제 chartFigure는 noneditable imported figure를 사용하므로 fixture에도 삭제 전 figure를 넣는다. public emptyTrash와 삭제 수·객체 보존·선택 remap·conversion 불변 검사는 유지하며 렌더 오류를 catch하거나 무시하지 않는다.

전체 authored case171 →167, 순수 코드 변경은162줄 삭제/2줄 추가다. 기존 번호는 과거 실행 결과와 대응하도록 유지하며 재번호/연속 번호 강제 검사는 추가하지 않는다. 데이터 손상·transaction 실패·비동기 resource 소유권 검사는 삭제 대상과 구별해 유지한다. 테스트 수를 줄였다는 사실만으로 모든 검사가 적절하다고 주장하지 않는다.

## 실제 실행 근거와 한계

기존 자동 Actions regression39928861682는 commit7292425에서 inline/split 모두22/109/157이 실패했다. startup15 및151–155/158/160–171(실행 순서는 번호순과 다름)은 그 run에서 통과했다. 실패 원시 로그는 `agent_space/logs/20261023-regression-39928861682-failed.log`에 보존한다. 자동 versions39928861679와 build39928861677 성공은 regression 성공이나 단계1 완료를 뜻하지 않는다.

이번 변경은 테스트/기록만 수정한다. Source45/PlusCal25/code128 및 stale lineage는 그대로다. 로컬 application/test/build/checker를 실행하지 않는다. 실제 diff/whitespace 정적 확인과 실행 결과를 구분하며, 수정 후 회귀 결과는 자동 실행에서 확인하기 전까지 pending이다. 새 테스트를 늘리거나 이 검사 정리를 주 번역의 선행 gate로 삼지 않는다. 단계1 전체 완료 audit는 아직 수행되지 않았다.
