# 모듈 번역 최종 정리

기존 절차별 대응 기록과 공개 API·실제 UI 호출자의 대조를 합친 정적 범위다. 실행 검증 판정은 아니다.

| pseudocode 논리 모듈 | 정리 상태 |
| --- | --- |
| backend/graphs | 명시 절차 대응 |
| backend/layout_annotations | 명시 절차 대응 |
| backend/assets_files | 명시 절차 대응 |
| backend/project_state | 명시 절차 대응, canonical tree 소비 연결은 상위 결정 ① 대기 |
| backend/project_efsm | 명시 command·후보·receipt 절차 대응 |
| frontend/interface_fsm | 명시 event·publish·reconcile 절차 대응 |
| frontend/renderer | supplied 화면·상호작용·current/target export 절차 대응 |
| application/adapter | query·intent·command·selection·lifecycle 절차 대응 |
| application/public_api/contract | route·명시 인자·lifecycle binding 대응 |
| application/public_api/graphs | 명시 대상·command 후 read·반환 대응 |
| application/public_api/layout_annotations | 명시 설정·query·export·반환 대응 |
| application/public_api/assets | 명시 경로·import/move/delete·trash 반환 대응, tree 소비 연결은 ① 대기 |
| frontend/mantine_ui | 명시 절차·실제 public 반환 소비 대응, ①②③ 대기 |
| system | 초기화·노출·mount·최종 audit 순서 대응 |
| portable_build/portable_build | bundle·외부 script 차단·출력 순서 대응 |

마지막 호출자 변경은 반환 계약 소비다. graph palette는 반환 chart의 대상 id를 확인한 뒤 적용 status/log를 남긴다. UI palette reset의 false를 draft로 펼치지 않는다. move의 null을 역참조하지 않고, directory 생성의 null을 경로로 저장하지 않는다. 공통 결과 형식이나 새 rollback 동작은 추가하지 않는다.

남은 상위 결정은 `agent_space/memo/20261113-001.md`의 세 항목이다: ① canonical VFS tree와 별도 slot/chart 표시 facts의 공식 공급 경계, ② grid 단일 dimension 편집의 companion/fallback 입력 조합, ③ debug toggle의 반전 대상 값. 이 결정이 필요한 소비 연결을 제외하고 별도의 하위 번역 TODO는 남기지 않는다. 새 Plan 작성 시 이 세 항목을 회수한다.
