# Plan 025 — 모듈별 잔여 번역 일정과 종료 관리

작성: 2026-11-12. 사용자 지시: Plan에 기록된 작업을 다시 정리하고 모듈 단위로 일정을 세운다.

## 1. 이전 계획과 관계 / 현재 기준

이 계획은 Plan024의 **앞으로 수행할 작업 선택·순서·종료 관리**를 대체한다. Plan023/024, 기존 patch/review와 WIP는 이력으로 보존한다. Source/PlusCal/정책을 바꾸거나 새 논리 모듈을 설계하는 계획이 아니다. Plan024의 화면 → raster → 나머지 번역 → 허가된 통합 검증 순서는 유지한다. 앞 두 범위의 정적 대응 기록을 재사용하고, 현재 세 번째 범위를 모듈별로 마무리한다.

기준은 `development-versions.json`의 Source45/current, PlusCal25/current, code145/stale, 선택적 verification26/stale이다(4차의 번역 가능한 절차 반영, 4차 전체 종료 아님). HEAD는 `28e6dc762c75c8a2ffbbe53ed08b323f0b2b82bd`이며 현재 코드는 그 이후 미커밋 WIP를 포함한다. 본 계획의 최초 작성은 문서 변경뿐이었으며, 이후 코드 번역 차수에서만 revision/fingerprint를 갱신한다. derived_from은 같은 상위 명세를 유지한다.

지금까지 한 일: r133–136 화면 선택·host 수명·geometry/zoom·resize 연결, r137 renderer 화면/raster 절차군, r138 command tuple와 실제 public 소비자, r139 system 시작 순서, r140 graph 계산, r141 Plotly import 변환을 번역했다. 이것은 유효한 부분 진척이지 15개 모듈 전체 완료가 아니다. 마지막 모듈 현황 답변의 ‘전체 미판정’은 **미작성/전면 재작성 필요**라는 뜻이 아니다. 기존 대응 기록과 코드를 이용해 남은 부분만 닫는다.

## 2. 일정 운영과 공통 종료 기준

아래 차수는 **실행 순서와 산출물 일정**이다. 차수는 대화 턴이나 고정 일수와 같지 않다. 전수 잔여가 확정되지 않은 상태에서 날짜/시간을 완료 약속으로 만들지 않는다. 첫 차수는 다음 번역 작업부터 즉시 시작하며, 작은 함수 하나를 수정한 뒤 매번 사용자에게 재개를 요구하는 방식으로 운영하지 않는다.

모듈마다 다음 한 묶음을 끝낸다.

1. 해당 `.pcal`의 절차·분기를 기존 runtime/실제 caller에 대응시킨다. 기존 읽기·review를 재사용하고 아직 읽지 않은 중요 문서는 잘리면 구간별로 끝까지 읽는다. 전체 정책/이미 닫힌 화면 경로를 매 차수 다시 조사하지 않는다.
2. 이미 대응된 부분은 유지하고, 명시된 미번역 부분을 바로 번역한다. 이름 맞추기/폴리싱/새 API·알고리즘·권위 설계는 하지 않는다. 의도가 모호하면 해당 Source를 직접 확인한다.
3. 필요한 production caller/하위 helper 변경은 같은 ownership 단위로 연결한다. 파일 한 개만 맞추고 실제 소비자를 깨뜨린 상태를 종료로 표시하지 않는다. 반대로 무관한 모듈의 전수 재작업을 끼워 넣지 않는다.
4. 해당 모듈의 모든 절차/분기를 `대응됨 / 이번에 번역 / 상위 의미 결정 필요`로 구분해 한 번 기록한다. 이미 대응된 모듈은 코드 변경 없이 종료할 수 있다.
5. **정적 번역 종료**: 전체 절차/분기와 실제 호출 경로에 알려진 번역 누락이 없고, 상태·참조·순서·실패·자원 수명이 대응한다. 미실행 항목은 실행 대기로 분리한다. **상위 의미 결정 필요가 남은 모듈은 전체 종료로 세지 않는다.**

상태는 `정적 종료 / 진행 / 예정 / 상위 결정 대기 / 실행 대기`로 쓴다. 파일 수·diff 줄 수·테스트 수·부분 패치 수를 완료율로 쓰지 않는다. 매 차수 끝에는 모듈 상태, 실제 잔여, 다음 모듈만 갱신한다. 새 결함/상위 변경이 없는 종료 모듈은 반복해서 열지 않는다.

## 3. 모듈별 실행 일정

아래 이름은 `pseudocode/` 아래의 논리 모듈이다. 대응 코드는 같은 `sourcecode/` 경로의 `.js`이며 contract는 `application/public_api/index.js`, portable_build는 `.mjs`다. 물리적으로 다른 파일에 있는 같은 owner 절차도 범위에 포함한다.

| 차수 | 모듈 | 기준 상태 / 이번 일정에서 끝낼 범위 | 종료 산출물·의존성 |
| --- | --- | --- | --- |
| 유지 | `frontend/renderer` | 화면·current/target raster의 정적 대응 기록 있음(r137). 재번역하지 않는다. | review002를 재사용하고 native Plotly/이미지/font/canvas/download 검증만 최종 실행 목록에 둔다. system 호출 순서 보완은 r139 근거를 연결한다. |
| 1 — 정적 종료(r142) | `backend/graphs` | r140 계산·r141 import를 재사용하고 15개 Source 절차/PlusCal 확장과 실제 candidate/import caller의 대응을 마쳤다. pure normalize, raw header/scalar selection, 전체 validation, command 내부 object 경로와 chart 반환을 번역했다. | `agent_space/reviews/review-20261112-008-graphs-module-translation.md`. 알려진 번역 누락/상위 차단 없음. 실행 검증 대기. |
| 2 — 정적 종료(r143) | `backend/layout_annotations` | 11개 Source 절차/PlusCal 확장과 실제 read/candidate caller를 대응했다. grid source/검사/생성 순서, config image 기본값·limits·copy, visible image/caption read와 global caption copy, 관련 current-source 재계산을 번역했다. | `agent_space/reviews/review-20261112-009-layout-annotations-module-translation.md`. 알려진 번역 누락/상위 차단 없음. 실행 검증 대기. Mantine grid 입력 조합은 별도 8차. |
| 3 — 정적 종료(r144) | `backend/assets_files` | 21개 Source 절차/PlusCal private expansion과 실제 import/move/FFSX caller를 대응했다. parser/VFS/current metadata, typed package/canonical decoded payload, missing-only constructor·owner·bytes·id 순서를 번역했다. | `agent_space/reviews/review-20261113-001-assets-files-module-translation.md`. 알려진 번역 누락/상위 차단 없음. 실행 검증 대기. wire v3 불변; public/UI tree는 별도 차수. |
| 4 — 진행/연결 대기(r145) | `backend/project_state` | 15개 Source 절차·메서드/PlusCal 확장을 대조하고 current snapshot·pure immutable read, explicit identity/committed hints, config create/validation·local equality를 번역했다. tree/trash의 실제 소비와 ui registry 역참조는 미완료다. | `agent_space/reviews/review-20261113-002-project-state-translation-open.md`. canonical all-chart 표시 read는 상위 결정 대기(7d/8); ui metadata/audit 소유권 연결은 6a/9에서 처리 후 재종료 판정. 전체 종료로 세지 않는다. |
| 5 — 다음 독립 작업 | `backend/project_efsm` | 부분 대응. 모든 등록 command의 current resolve → candidate → normalize/validate → 재확인/commit → receipt/effect 분기를 닫는다. | 1–4차 helper와 실제 command가 일치해야 한다. 부분 commit/live fallback/중복 후처리/상태 복구를 임의로 더하지 않는다. 누락이 있으면 해당 command의 caller까지 같은 단위에서 수정한다. |
| 6a | `frontend/interface_fsm` | 부분 대응. lifecycle/선택/drag/zoom/lock와 reconciliation 전체를 닫는다. r138 final state 반환은 유지한다. | Frontend 소유 session과 Backend 참조 입력, 거부/무변경/실패·publish 순서 대응. renderer를 다시 설계하지 않는다. |
| 6b | `application/adapter` | 부분 대응. dispatchProjectCommand/dispatchSlotSelection은 재사용하고 read/preparation/action routing/compatibility facade/실패 전달의 남은 절차를 닫는다. | 5차 receipt → 6a final state → supplied renderer 경계 및 다른 tuple 순서 보존. 일반 강제 refresh/cache/별도 상태 authority를 만들지 않는다. |
| 7a | `application/public_api/contract` | 부분 대응. 공개 binding·입력 검증·target capture·단일 lifecycle·helper/wrapper·동기/비동기 결과/오류 계약을 전체 확인한다. | index.js/adapter/system의 실제 노출 경로까지 대응. 이미 처리한 lifecycle/tuple을 재작성하지 않는다. |
| 7b | `application/public_api/graphs` | 주요 mutation/read/export 경로 대응 기록 있음. 남은 graph public 절차를 전부 닫는다. | 1·5·6·7a차에 맞춰 실제 scalar/chart/settings/null/noncommit 계약·공식 성공 read·한 번의 presentation을 확인. |
| 7c | `application/public_api/layout_annotations` | 주요 설정·selection/zoom·caption/image/export 경로 대응 기록 있음. 나머지 public 절차를 전부 닫는다. | 2·5·6·7a차 결과와 대조. UI가 보낸 명시적 입력을 다른 의미로 보정하지 않는다. |
| 7d | `application/public_api/assets` | 미완료. 실제 경로/선택/삭제 대상, canonical tree/trash와 public read·import/move/delete 결과를 닫는다. | 3·4·5·7a차 후 실제 Mantine 소비까지 coherent하게 연결. 지정 path의 deletion-target 제한은 상위 부재가 아니라 번역 누락으로 취급한다. all-chart 표시 의미의 별도 차단은 §4로 분리. |
| 8 | `frontend/mantine_ui` | 미완료. tree/trash, graph/image/layout/annotation/print editor, modal/drop/drag와 실제 public 결과 소비를 닫는다. | 앞 차수에서 확정된 public 계약만 사용. r137 mounted drop·화면 연결을 재작성하지 않는다. palette/move/grid/debug의 상위 미정 의미는 §4 절차로 처리한다. |
| 9 | `system` | 시작 순서 r139 대응 있음. owner 구성/요구 조건/publication/mount와 나머지 audit·진입/실패 절차를 모듈 전체로 닫는다. | 앞 모듈들의 실제 연결·최종 audit 책임을 확인. 초기화 다시 설계나 범용 fallback을 추가하지 않는다. |
| 10 | `portable_build/portable_build` | 최신 모듈 전체 판정 예정. portable 생성·inline/split·resource/module 조립·입출력/실패 계약을 명세에 대조한다. | 정적 번역만 수행하고 build 실행은 11차로 둔다. sourcecode/Fast-figure.html 및 config는 해당 실제 shell/build 연결에 포함한다. |
| 11 — 별도 허가 후 | 전체 통합 검증 | 모든 번역 누락/상위 의미 차단 해소 후, 정확한 변경 집합을 대상으로 검증한다. | 공식 version checker, fidelity, module/portable build, inline/split 브라우저/Plotly/drop/export 회귀. 실제 대상 commit/run/job/log와 결과를 남긴 뒤에만 current 판정. |

공유 `sourcescript/backend/settings.json` ↔ `sourcecode/backend/settings.js`는 15개 절차 모듈과 별도의 immutable 설정 데이터다. 각 소비 모듈에서 config 키/default/limit 대응을 확인하고, 9·10차에 실제 조립 경로를 확인한다. 설정 서비스나 새 논리 모듈로 확대하지 않는다.

## 4. 기존 차단 항목과 처리 일정

차단을 ‘모듈 전체 번역 불가’로 확대하지 않는다. Source에 이미 적힌 절차는 먼저 끝내고, 실제 새 의미가 필요한 분기만 격리한다. Source 확인으로 해결되면 그대로 번역한다. 여전히 의미가 없으면 임의 설계나 사용자 의도 추측 없이 정확한 선택지를 보고하고, 해당 분기의 Source 결정 → PlusCal 전파를 받은 뒤 마무리한다. 독립 모듈 작업은 이어갈 수 있지만 차단 모듈을 완료로 표시하지 않는다.

| 항목 | 담당 차수 | 이미 확인된 경계 / 필요한 결정 |
| --- | --- | --- |
| canonical tree/trash와 all-chart/slot 표시 | 4·7d·8 | tree/subtree, CSV 정보·실제 reference count는 기존 Source/explicit deletion-target로 가능한 범위다. 이전 docs004의 과도한 차단은 §15의 정정을 적용한다. conversion/zero-reference chart의 editability 등 남은 all-chart 표시를 어떤 공식 read로 공급할지가 미정인 부분만 상위 결정 대상으로 둔다. |
| Backend ui registry 역참조 | 4·6a·9 | 기존 custom reader가 interfaceRuntime.selectedSlotId를 읽고 실제 Frontend metadata/System audit가 ui를 Backend registry 항목처럼 사용한다. callback만 지우거나 가짜 Backend ui를 만들지 않는다. 이미 명시된 소유권의 연결 번역 잔여이며 새 상위 의미 공백은 아니다. 해당 caller와 묶어 제거하기 전 4차를 종료로 세지 않는다. |
| grid 단일 차원 변경 | 8 | setGrid(rows,cols)는 명시되어 있으나 render 이후 companion 변경 시 입력 조합/invalid fallback 의미는 미정. freshness 규칙만으로 event-time companion 정책을 만들지 않는다. |
| palette load/reset, move null 결과, debug toggle | 8 | public별 서로 다른 결과 계약을 일괄 success 프로토콜로 바꾸지 않는다. Source에 없는 UI 입력/결과 분기는 별도 결정 대상으로 구체화한다. |
| programmaticPlotlyRelayout / image decode | 유지·필요한 caller만 | writer 없는 map에 새 sync/cleanup 프로토콜을 만들지 않는다. 이미 번역한 decode identity/최신 settings 구분은 새 증거 없이 재작업하지 않는다. |

## 5. 기록·권한·중단 조건

- 모듈별 대응 결과는 **이 계획의 표/후속 완료 기록**을 갱신한다. 모든 모듈을 다시 ‘부분 확인’이라고 보고하며 같은 조사를 반복하지 않는다. 기존 review에 충분한 근거가 있으면 링크하고 새 장문 보고서를 중복 작성하지 않는다.
- 모든 변경은 실제 incremental `YYYYMMDD-NNN.patch`/동명 설명으로 기록한다. 코드 변경 때만 revision/fingerprint와 Source/PlusCal lineage를 관리한다. 문서만 고치면 코드 revision을 올리지 않는다. 기존 WIP를 HEAD diff로 덮어쓰거나 제거하지 않는다.
- 허용되는 로컬 작업은 읽기·편집·정적 파일/diff/hash뿐이다. app/test/build/checker/TLC/browser를 실행하지 않는다. 이 일정은 Actions/remote write/commit/push/new goal 허가가 아니다. 이전 subagent 사용 허가는 범위 내에서만 적용하며 writer는 하나로 유지한다. 독립 탐색/검토가 실제 필요할 때만 분리하고 중복 문서 읽기를 위한 fanout을 기본 단계로 만들지 않는다.
- 새로운 상위 의미, 해결 불가능한 동시 수정, 필요한 접근/실행 권한 부재로 막힌 범위는 근거·시도·정확한 결정/허가 요청을 남기고 그 경계에서 중단한다. 이를 핑계로 번역 가능한 다른 절차를 미루거나, 인접 기능/폴리싱으로 우회하지 않는다.
- 최초 계획 작성은 문서 변경뿐이었다. 이후 1차 backend/graphs(r142), 2차 backend/layout_annotations(r143), 3차 backend/assets_files(r144)의 정적 번역을 종료했다. 4차의 번역 가능한 절차를 r145에 반영했지만 tree/trash·ui 연결은 위 표처럼 남겼다. 다음 독립 실행 항목은 **5차 backend/project_efsm의 전체 command·receipt/effect 대응**이다. 4차 잔여를 감추거나 완료로 세지 않는다.

## 6. 차수별 완료 기록

- 1차 / r142: graph 15개 Source 절차 및 PlusCal private expansion의 전체 대응표는 review008에 기록했다. 순수 설정 normalize와 실제 import caller 반환값 대입, enum/style/figure/global/reference validation, header 원값·scalar column 선택, graph-only 반환과 미명세 live postcommit replacement 경로를 바로잡았다. 기존 regression65/66만 확장했다(미실행). Source45/PlusCal25/verification26 및 derived_from 불변, code142/stale. 증분 patch009. 당시 다음 모듈은 2차이며 EFSM/assets 전체까지 종료한 것은 아니다.
- 2차 / r143: 11개 Source 절차 및 PlusCal 확장/실제 read·command 대응표는 review009. source-scoped grid 후보, config image 설정, read 복사/visible owner 및 global caption 전체 copy, 관련 label/layout/merge/split의 최신 source 재계산을 번역했다. 기존 regression47/97/106만 확장(미실행). Source45/PlusCal25/verification26/derived_from 불변, code143/stale. 증분 patch010. 당시 다음은 3차 backend/assets_files였으며 EFSM/project_state 전체 종료나 실행 검증을 뜻하지 않는다.
- 3차 / r144(2026-11-13): 21개 Source 절차/PlusCal private expansion과 실제 command/import caller 대응표는 `agent_space/reviews/review-20261113-001-assets-files-module-translation.md`. strict delimited parser, unique-owner/directory-inclusive VFS, current final metadata·bytes, typed package/canonical decoded payload와 missing-only constructor·chart owner 검증을 번역했다. 관련 기존 fixtures만 확장·조정(미실행). Source45/PlusCal25/verification26/derived_from 불변, code144/stale. 증분 `agent_space/patches/20261113-001.patch`. 당시 다음은 4차 backend/project_state였으며 public/UI tree나 EFSM 전체 종료를 뜻하지 않는다.
- 4차 / r145(2026-11-13): 15개 Source 절차·메서드/PlusCal private expansion의 대응·번역/잔여표는 `agent_space/reviews/review-20261113-002-project-state-translation-open.md`. same-source snapshot, normalize 없는 recursive immutable read, explicit null 참조 승인, committed hint-only reconciliation와 Frontend none 변환, config-owned create/validation·구조적 local equality를 번역했다. 기존 fixtures만 확장·조정(미실행). tree/trash consumer 계약과 Backend ui 역참조가 남아 전체 종료 아님. Source45/PlusCal25/verification26/derived_from 불변, code145/stale. 증분 `agent_space/patches/20261113-002.patch`. 다음 독립 모듈은 5차이며 4차 잔여는 6a/7d/8/9에서 실제 caller와 묶어 해소한다.
