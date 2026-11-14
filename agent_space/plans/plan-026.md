# Plan 026 — 번역 누락·왜곡 정리 후 상위 결정사항 검토

작성: 2026-11-14. 사용자 요청: 메모와 이번 번역 검토 결과를 확인하고, 누락·왜곡을 먼저 정리한 다음 결정사항을 검토한다.

## 1. 기준과 범위

- 이 계획은 `agent_space/plans/plan-025.md`의 앞으로 수행할 작업 순서와 종료 관리를 대체한다. 기존 계획·메모·patch·review 및 누적 WIP는 이력으로 보존한다.
- 최초 계획 작성 기준은 `development-versions.json`의 Source45/current → PlusCal25/current → code155/stale다. HEAD `28e6dc762c75c8a2ffbbe53ed08b323f0b2b82bd`가 아니라 현재 미커밋 작업 트리를 대상으로 한다.
- `agent_space/reviews/review-20261114-003-final-module-translation.md`의 하위 번역 잔여 없음 판정은 이번에 발견한 세 항목에 대해서 다시 연다. 다른 모듈을 전면 재작성하거나 과거 완료 주장을 독립 검토 근거로 삼지 않는다.
- 최초 계획 작성 범위는 계획과 해당 patch/설명뿐이었으며 코드·Source·PlusCal·메모·버전 메타데이터는 수정하지 않았다. 이후 사용자 반영 지시에 따른 실제 진척은 아래 표와 §7에 기록한다. 계획 작성 자체를 수정 완료로 세지 않는다.
- 의미 권위는 Source Script > PlusCal pseudocode > source code다. 이미 적힌 절차의 복원과 새 의미의 결정을 분리한다.

## 2. 진행 순서와 단계 경계

1. **A: 확인된 번역 문제 세 건을 먼저 수정·정리한다.** 해당 절차와 실제 호출자만 연결하고 정적으로 대응을 확인한다.
2. **A 종료 확인:** 각 문제의 원래 입력·분기·반환·실패 의미가 보존됐는지 확인하고 실제 잔여를 갱신한다. 새 문제도 기존 명세로 답이 나면 A에서 처리한다. 새 의미가 필요한 부분만 B로 분리한다.
3. **B: 메모의 상위 결정 세 건을 검토한다.** 문제, 선택지, 영향, 권고와 필요한 사용자 결정을 제시한다. 미정 의미를 코드에서 먼저 선택하지 않는다.
4. **C: 결정 확정 및 반영 지시 후에만** Source → PlusCal → 관련 코드/실제 소비자 순서로 전파한다. B의 검토·권고를 결정 완료나 구현 허가로 간주하지 않는다.

차수는 대화 턴이나 날짜 약속이 아니다. 작은 함수별로 재개 요청을 반복하지 않고, 허가된 단계에서 coherent한 책임 단위로 처리한다. A와 B를 섞어 이미 번역 가능한 수정을 미루지 않는다.

## 3. A — 번역 누락·왜곡 정리

| 항목 / 상태 | 근거와 영향 범위 | 처리 방향 | 정적 종료 기준 |
| --- | --- | --- | --- |
| A1. 수동 이미지 좌표 0 왜곡 / 정적 대응(r156) | `sourcecode/frontend/renderer.js:751-758`의 `Number(settings.x) || 50`, y 동일 처리. `sourcescript/backend/settings.json:57`은 x/y의 0을 허용하며 `pseudocode/frontend/renderer.pcal:417-423`은 supplied snapshot 이미지의 target 렌더를 요구한다. 실제 공통 소비자는 `sourcecode/frontend/renderer.js:960,1288`의 current capture/target save다. | 유효한 0을 기본값 50으로 바꾸지 않고 명시된 좌표를 그대로 계산한다. 설정 유효성·기본값의 기존 owner는 유지하며 새로운 보정 정책을 만들지 않는다. | manual x=0, y=0의 산식이 보존되고, 같은 helper를 사용하는 capture/save 양쪽이 supplied 설정과 일치한다. contain/cover·scale·오류/자원 수명은 불필요하게 바꾸지 않는다. |
| A2. 공개 grid 변경 시 레이아웃 선택 초기화 누락 / 정적 대응(r156) | `pseudocode/frontend/mantine_ui.pcal:174-175`, `sourcescript/frontend/mantine_ui.py:99`는 grid shape 변경 시 선택을 비우도록 한다. `sourcecode/frontend/mantine_ui.js:2722-2726,2754-2759`는 overlay close와 자체 changeGrid만 처리한다. `sourcecode/application/public_api/layout_annotations.js:294-300`의 공개 setGrid 경로는 overlay를 유지한다. | modal 내부 NumberInput뿐 아니라 공식 grid 변경이 반영되는 경로에서도 local selection clear가 대응하도록 한다. grid의 새로운 권위 상태나 Backend→UI 직접 callback을 만들지 않는다. | layout 창에서 선택 후 공개 `FastFigureApi.layout.setGrid(rows, cols)`로 실제 shape가 바뀌어도 이전 선택이 남지 않는 정적 호출·상태 경로가 확인된다. slot/control event 소비와 close clear는 유지한다. **B2의 companion/fallback 결정과 별개로 종료한다.** |
| A3. 명세에 없는 ZIP entry 상한 / 정적 대응(r156) | `sourcecode/backend/assets_files.js:803-807`은 읽기에만 `count > 10000` 거부를 추가한다. `pseudocode/backend/assets_files.pcal:491-505`와 `sourcescript/backend/assets_files.py:55-61`의 STORE/분할/경로/CRC/version 조건에는 이 상한이 없다. `sourcecode/backend/assets_files.js:727-787`의 writer에는 대응 상한이 없어 자체 생성한 10,001-entry package도 reader가 거부한다. | 명세 없는 10,000 제한을 제거하고 기존 container/경로/CRC/version 검증을 보존한다. 다른 숫자로 교체하거나 새 자산 수·보안·ZIP 형식 정책을 도입하지 않는다. | 같은 지원 형식의 writer→reader 경로에서 이 임의 상한 때문에 정상 package를 거부하지 않는다. FFPX/FFSX 공통 reader의 영향과 원래 malformed 입력 거부 분기를 정적으로 확인한다. ZIP64/압축 등 지원 범위를 확대하는 작업은 하지 않는다. |

A의 변경 기록은 실제 수정 단위의 native Git diff와 동명 설명으로 남긴다. 코드 변경 시에만 revision/fingerprint 및 실제 lineage를 관리하며, checker 미실행을 통과로 표시하거나 `current`를 임의 선언하지 않는다. 세 항목의 처리 결과·잔여는 이 계획에 간결하게 갱신하고 별도 장문 완료 보고서를 반복 생성하지 않는다.

## 4. B — 메모의 상위 결정사항 검토

기준 메모는 `agent_space/memo/20261113-001.md` 전체다. 다음 세 항목만 현재 확인된 상위 결정 대기로 둔다.

| 항목 / 초기 상태 | 검토할 선택과 결정 질문 | 영향 범위·검토 산출물 |
| --- | --- | --- |
| B1. canonical VFS tree와 slot/chart facts의 공식 공급 경계 / 결정 대기 | canonical directories/assets tree를 유지하면서 visible slot의 contentType/chart/imageId와 연결 chart의 editability를 어떤 공식 read 계약으로 제공할 것인가? 기존 공식 read 확장과 별도 read 분리를 비교한다. asset reference만으로 참조 없는 chart 정보를 대체하거나 canonical tree에 slot/chart를 임의 혼합하지 않는다. | Source/Pcal의 Backend read → public API → 실제 Mantine slot/chart 목록을 한 경로로 대응한 입력/반환 명세, 각 선택의 계약·소비자 변경 범위와 권고를 제시한다. 명시 경로 deletion-target·참조 수·trash subtree는 이미 번역 가능한 별도 범위이며 다시 차단으로 넣지 않는다. |
| B2. grid 단일 차원 편집의 입력 조합 / 결정 대기 | 다른 dimension은 render에 표시된 값인가, 이벤트 시점 공식 read 값인가? invalid-input fallback은 어느 값과 조합되는가? 화면 2×2 이후 현재가 2×3일 때 row=3 편집을 3×2와 3×3 중 무엇으로 해석하는지 명시한다. | Source UI 입력 절차와 `setGrid(rows, cols)` 계약의 관계, 동시 변경·invalid 입력별 결과와 권고를 제시한다. freshness만으로 event-time 병합을 선택하지 않으며 A2 선택 clear를 이 결정에 종속시키지 않는다. |
| B3. debug toggle의 반전 기준 / 결정 대기 | render 때 표시한 telemetry 값의 반전인가, 클릭 시점 runtime 값의 반전인가? 표시 후 값이 변경된 경우 `setDebugEnabled(value)`에 전달할 명시 bool을 정한다. | 기존 runtime authority와 public setter는 유지한다. Source UI의 값 읽기/반전/전달 순서와 중간 변경 사례, 선택지별 결과·권고를 제시한다. 별도 mirror 상태나 toggle command를 임의로 추가하지 않는다. |

B는 선택지 나열만으로 끝내지 않는다. 각 항목에서 기존 Source 전체 관련 계약으로 이미 답이 정해져 있는지 먼저 확인하고, 답이 있으면 새 결정을 요청하지 않고 A의 번역 잔여로 재분류한다. 정말 미정인 경우에만 필요한 결정과 이유를 사용자에게 요청한다. 검토 과정에서 상위 의미를 확정했다고 가장하지 않는다.

## 5. 오래된 메모의 회수 범위

`agent_space/memo/20261023-001.md`도 전체 확인했다. 이를 새로운 공통 필수 검증 단계나 과거 테스트·Actions 일정의 재개 지시로 해석하지 않는다.

- 계산/상태 변경 분리, SSoT, 참조 무결성, 최소 복잡도는 A/B의 관련 변경에서 지킬 경계다. 전 모듈 폴리싱이나 별도 전수 감사로 확대하지 않는다.
- 원래 실패 보존, task-local resource, statusSink 비권위, current capture의 geometry/수명은 이번 검토의 기존 대응 근거를 재사용한다. 구체적인 새 누락 증거가 생긴 경로만 다시 연다. 과거 회귀 번호나 미실행 기록은 실행 성공의 근거가 아니다.
- **정리만 실패한 경우의 결과 의미**는 과거의 확인 후보이지 새로 확인된 네 번째 상위 결정으로 간주하지 않는다. 관련 작업에서 Source/PlusCal의 전체 completion·cleanup 계약으로 답이 정해지는지 확인한다. 여전히 미정인 경우에만 정확한 분기와 선택지를 B에 추가하며, 성공/실패/무시를 임의 선택하지 않는다.
- 테스트·Actions 실행 대기 항목은 현재 수행 범위에서 제외한다. 삭제된 테스트·workflow를 복구하거나 과거 성공 결과를 현재 검증으로 재사용하지 않는다.

## 6. 완료·중단 기준과 권한

- **A 완료:** 세 건과 그 과정에서 확인한 명시적 번역 잔여의 실제 코드/호출자 대응 및 정적 근거가 기록되어 있다. 상위 결정 대기와 실행 미확인은 분리하며 실행 성공을 주장하지 않는다.
- **B 검토 완료:** 각 결정 질문, 기존 명세로 해결 가능한지, 선택지·영향·권고·사용자에게 필요한 결정이 분리되어 있다. 검토 완료는 결정 확정이나 연결 구현 완료가 아니다.
- **C 완료:** 확정된 의미와 별도 반영 지시에 따라 Source → PlusCal → 코드/실제 소비자까지 전파하고 lineage/실제 diff를 기록한다. 선택적 verification/TLC를 새 필수 gate로 삼지 않는다.
- 허용 범위는 요청된 문서 작성, 이후 허가된 번역 수정·정적 대조다. 테스트·app·build·checker·TLC·브라우저·Actions를 실행하지 않는다. remote write·commit·push·새 goal도 이 계획으로 허가되지 않는다.
- 기존 WIP·사용자가 삭제한 테스트를 보존한다. 자체 snapshot/diff 도구, 중복 권위·새 fallback·공통 결과 프로토콜·무관한 정리 작업을 추가하지 않는다.
- 명세 충돌·새 의미·동시 수정·권한 부족으로 막히면 근거, 시도, 정확한 blocker와 필요한 다음 입력을 남기고 해당 경계에서 멈춘다. 결정이 필요하지 않은 A 작업까지 묶어서 중단하지 않는다.

## 7. 실제 진척 — A / r156 (2026-11-14)

- 사용자 반영 지시에 따라 A1 → A2 → A3 순서로 수정했다. 앞선 검토에서 중요 Source/PlusCal/구현 전체를 읽은 기록을 재사용하고 해당 계약·호출 경로를 다시 대조했다.
- A1: owner가 정규화한 `settings.x/y`를 export 산식에 그대로 사용한다. 0을 50으로 바꾸는 truthiness fallback만 제거했고 current capture/target save의 공통 helper 연결은 유지했다.
- A2: 열린 layout의 기존 공식 read를 hook 앞에서 한 번 읽고, overlay와 그 read의 gridRows/gridCols 변화에 local selection clear를 연결했다. 닫힌 overlay에서는 새 Backend read를 만들지 않고 hook 호출 순서는 일정하게 유지했다. 실제 grid가 바뀌는 공개 API 경로도 같은 effect에 도달하며 별도 grid mirror나 Backend callback은 없다. 자체 changeGrid의 기존 동작은 유지하고 B2 입력 조합은 변경하지 않았다.
- A3: 공통 ZIP reader의 `count > 10000` 거부만 제거했다. 중앙 directory 범위·STORE·분할·경로·CRC·version과 기존 writer 지원 형식은 그대로다.
- 정적 호출·산식·실제 incremental diff 대조 범위에서 세 알려진 번역 문제를 대응했다. 테스트·app·build·checker·브라우저·Actions는 실행하지 않았다. Source45/PlusCal25와 derived_from은 불변, code156/stale다. fingerprint 갱신은 기존 도구의 hash 함수만 이용했고 checker main은 실행하지 않았다. 이전 최종 모듈 review를 r156 검증 근거로 재사용하지 않도록 source-code.validation_review는 null로 두었다.
- 실제 변경 기록: `agent_space/patches/20261114-011.patch`와 동명 설명. 다음 작업은 B1 → B2 → B3의 결정사항 검토이며, 결정 확정이나 C 반영은 아직 수행하지 않았다.
