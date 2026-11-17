# Plan037 M02–M15 — Source Script → pseudocode 검토

## 1. 범위와 판단

- 계획: `../plans/plan-037.md`. M01 결과는 `review-20261117-005-plan037-system.md`에 보존했다.
- Source Script 53을 고정하고 M02–M15의 Source Script와 pseudocode를 파일 끝까지 구간별로 읽었다. 함수 이름의 일치만으로 판단하지 않고 직접 호출·물리적 helper 확장·현재 원천·후보 검증·반영·반환·실패를 대조했다.
- 아래 확정된 절차는 입력과 소유자가 결정되어 있어 번역했다. §3의 두 계약 충돌은 Source Script 판단을 보류한다. 모든 15개 모듈의 비교 완료와 모든 의미의 번역 완료를 구분한다.
- Backend의 현재 project, Frontend의 session, Application의 연결, renderer의 실제 graph/image 자원, UI-local 표시 상태를 유지한다. 슬롯의 클래스 원형과 인스턴스 생성은 Source Script에 이미 정의되어 있다.

## 2. 전체 모듈 대응과 수정·유지

경로는 저장소 루트 기준이다. 표의 Source Script와 pseudocode는 모두 전체 파일을 대조한 범위다.

| 구간 | Source Script → pseudocode | 전체 절차 대응과 결과 |
|---|---|---|
| M02 | `sourcescript/backend/project_state.py` → `pseudocode/backend/project_state.pcal` | Slot·ProjectObject 생성/초기화/정규화/검증/읽기, 등록 조회·VFS·참조 보정을 대조했다. `Slot_create`를 추가하고 초기 grid/확장 grid에서 사용한다. Slot 입력은 같은 인스턴스를 정규화하고 저장 dictionary는 필수 배치를 확인한 뒤 Slot을 구성한다. 현재 content와 caption 우선순위·추가 필드를 유지한다. 전체 검증의 Slot 타입과 등록 이름/직접 경로 읽기를 반영했다. M01의 ProjectObject 생성자는 유지한다. |
| M03 | `sourcescript/backend/project_efsm.py` → `pseudocode/backend/project_efsm.pcal` | 모든 명령과 candidate helper의 물리적 확장, 파일 대기 후 현재 참조 재검증, 한 번 반영, 실제 전후 결과·삭제/이동 index 대응을 대조했다. 전체 후보 검증 전에 Slot·project 설정 정규화를 추가했다. 에셋 생성의 data/rows/bytes/base64 입력, 원본 bytes 우선, header 존재 여부, 교체 시 데이터와 header의 함께 갱신, 같은 후보의 CSV 참조 chart 재계산을 반영했다. 다른 명령·반영 실패·재시도·index 계산은 유지한다. |
| M04 | `sourcescript/backend/assets_files.py` → `pseudocode/backend/assets_files.pcal` | VFS·파일 분류·파싱·충돌 계획·가져오기·삭제·패키지 읽기/쓰기·복원을 대조했다. `normalizeCsvHeaderLines`의 누락/명시 값 구분과 정수화·범위 제한, `encodeTableAssetBytes`, 일반 STORE container 검증과 패키지별 manifest 검증을 연결했다. CSV 갱신 후 같은 후보 chart 재계산과 복원 뒤 ProjectObject 생성을 반영했다. 기존 직렬화 계산을 재사용한다. 최종 import plan의 mode 계약은 §3.1에 보류했다. |
| M05 | `sourcescript/backend/graphs.py` → `pseudocode/backend/graphs.pcal` | 열·오브젝트 정규화/편집/순서·색상·축·trace/figure·가져온 표현/전환·검증을 대조했다. 누락된 열 이름은 빈 문자열, graph commit은 visible 단독 소유와 전달 index 검증으로 수정했다. `traces(chart,project)`는 등록·소유를 검증하되 이번 계산의 수정된 chart를 오래된 project chart로 바꾸지 않는다. 나머지 계산과 candidate 경로는 유지한다. |
| M06 | `sourcescript/backend/layout_annotations.py` → `pseudocode/backend/layout_annotations.pcal` | grid 크기·병합/분할·slot 정렬·기하·label·caption·이미지 editor·candidate 처리를 대조했다. `formatSlotLabel`의 identifier/displayLabel 반환을 추가했다. 새 grid cell은 Slot 생성자를 사용하고 image editor에 imageId/MIME을 반환한다. label reference는 width/height로 한정한다. 기존 기하 공식과 현재 원천·순서는 유지한다. |
| M07 | `sourcescript/frontend/interface_fsm.py` → `pseudocode/frontend/interface_fsm.pcal` | 생성·모든 session 전이·읽기·구독/해제·publish·참조 보정을 대조했다. 명시된 초기 필드와 listener 집합 생성, 같은 callback 해제, revision 증가 후 읽기·listener snapshot·인자 없는 통지·같은 projection 반환을 추가했다. 기존 전이와 한 번 보정·오류 전달은 유지한다. |
| M08 | `sourcescript/application/adapter.py` → `pseudocode/application/adapter.pcal` | ApplicationInterface 읽기/state/subscribe, lifecycle·명령·선택·현재 너비 조회·투영·실패를 대조했다. state property와 실제 FSM subscribe를 연결하고 선택 처리 종료 시 현재 Frontend 상태를 다시 읽는다. 기존 전체 renderer 중앙 조회와 부분 갱신·원래 오류를 유지한다. |
| M09 | `sourcescript/application/public_api/__init__.py` → `pseudocode/application/public_api/contract.pcal` | 전체 공개 method 등록·인자·lifecycle 경계·query/wrapper/선택/graph-export 경로를 대조했다. 선언된 method의 namespace와 지연 호출 binding을 추가했다. graph export는 명시 slotId를 전달하고 asset download의 path 생략은 호출 시 현재 assetPath로 연결한다. 기존 공개 등록표와 실제 wrapper 알고리즘을 사용한다. |
| M10 | `sourcescript/application/public_api/assets.py` → `pseudocode/application/public_api/assets.pcal` | 이름·CSV/이미지 선택·생성/연결·삭제·이동·directory/trash·프로젝트/파일 import/export/download의 모든 wrapper를 대조했다. 원자적 directory batch와 순서대로 실행하는 router, 명시 대상, 취소/미반영, 성공 후 공식 조회·앞선 반영 보존이 이미 대응하여 파일을 유지했다. download 생략 인자 처리는 M09에 반영했다. import plan 생산 계약은 §3.1 근거에 포함한다. |
| M11 | `sourcescript/application/public_api/graphs.py` → `pseudocode/application/public_api/graphs.pcal` | 전체 11개 wrapper의 add/move/delete·editable/header/layout/palette·가져오기/내보내기를 대조했다. tuple 입력, 실제 반영 gate, 현재 공식 조회, 원래 실패 반환이 대응하여 유지했다. 이름이 다른 private query 입력은 Backend의 실제 소비와 대조했다. |
| M12 | `sourcescript/application/public_api/layout_annotations.py` → `pseudocode/application/public_api/layout_annotations.pcal` | 전체 34개 wrapper의 이미지·layout/zoom·appearance·label·caption·print를 대조했다. 최초 zoom lock의 한 번 측정, session/영속 변경 구분, label reference·caption 표시와 복사 export snapshot, 미반영/예외 의미가 대응하여 유지했다. |
| M13 | `sourcescript/frontend/renderer.py` → `pseudocode/frontend/renderer.pcal` | 모든 supplied 표시·공통 frame·graph/image 비동기 완료·host/current/generation 확인·정리·click/drop controller·target/current export·startup을 대조했다. caption의 None 표기를 공통 NoValue로 정리하고 startup이 실제 controller handle을 보유한 runtime을 반환하도록 수정했다. 자원·export 계산은 유지했다. palette 후 figure 갱신은 §3.2에 보류했다. |
| M14 | `sourcescript/frontend/mantine_ui.py` → `pseudocode/frontend/mantine_ui.pcal` | 모든 UI handler·read·입력/blur·파일 drop·접기·목록·미리보기와 FastFigureApp의 component action 연결을 대조했다. tree 표시 읽기와 debug event, toolbar/data/image/tree/project/graph/palette/label/caption/print/layout의 공개 method 연결을 명시했다. 기존 현재 입력 handler·공통 기하·UI-local 상태·파일 목표 고정과 listener 정리를 유지한다. |
| M15 | `sourcescript/portable_build/portable_build.py` → `pseudocode/portable_build/portable_build.pcal` | 입력 확인→한 번 bundle→정확한 script 태그/개수·source 존재 검사→치환→잔여 외부 script 검사→출력·실패 전체 순서가 대응하여 유지했다. |

### 직접 연결과 표현

- `Slot_create`는 Source Script의 Slot 인스턴스 할당을 나타낸다. `NewSlotInstance`/`IsSlotInstance`는 그 타입의 표기이며 저장 project에 식별 tag나 필드를 추가하지 않는다. 저장 필드 복사 뒤 기존 canonical/legacy 정규화를 수행한다.
- 새 CSV 재계산 helper는 같은 candidate의 오브젝트를 순회하여 기존 `rebuildEditableGraph`를 호출한다. 별도 project 조회나 두 번째 계산 원천을 만들지 않는다.
- 생성·구독·공개 method/component binding의 플랫폼 표기는 객체/함수 연결이다. 명령·조회·반환·실패의 알고리즘은 기존 명시 절차에 남는다.
- UI/renderer 변경은 Backend 읽기나 변경 진입점을 추가하지 않는다. 이미 번역된 공통 frame, 실제 자원 소유와 오래된 비동기 완료의 정리를 보존한다.

## 3. Source Script 미결정 계약

### 3.1 import plan의 mode

- `sourcescript/backend/assets_files.py:315-316`은 최종 plan 원소에 mode/path/replaceId를 요구하고, `sourcescript/backend/assets_files.py:343-346`은 mode를 다시 choice로 사용한다.
- `sourcescript/backend/project_state.py:317`의 resolveImportPlan 반환과 `sourcescript/application/public_api/assets.py`의 `importProjectFileToSlot`은 최종 path/replaceId를 생산한다. mode의 전달 계약이 연결되지 않는다.
- 기존 pseudocode의 최종 path/replaceId 재검증을 유지했다. Source Script에서 mode를 최종 계획에 포함할지, 확정 path/replaceId를 사용할지 결정해야 한다. lower layer에서 필드나 choice를 추정하여 추가하지 않았다.

### 3.2 palette 변경 뒤 graph figure 입력

- `sourcescript/backend/project_state.py:333`은 renderer의 ui-palette 요청에 palette copy만 반환한다.
- `sourcescript/frontend/renderer.py:493-496`은 scalar CSS 적용 뒤 Application이 같은 현재 project의 figure projection도 전달하여 graph paper/ink를 갱신한다고 설명한다. 해당 부분 요청의 figure 전달 계약은 정의되어 있지 않다.
- 기존 부분 palette 조회/CSS 적용을 유지했다. Source Script에서 부분 반환에 figure를 포함할지 별도 명시 투영을 전달할지 결정해야 한다. Backend 조회나 임시 figure 필드를 임의로 추가하지 않았다.

## 4. 논리·목적·비중복 판단과 확인 수준

- 확정된 변경은 원래 목적의 입력→검증/계산→해당 소유자의 결과에 연결된다. constructor·실제 subscriber·명시 인자·현재 참조·데이터와 header의 동시 교체 누락을 보완한다.
- 중첩 복사와 candidate 정규화는 반영 전 작업에 한정한다. 성공 결과는 같은 작업의 실제 반영 전후에서 만들고 Frontend는 그 결과로 참조를 한 번 보정한다. 공유 읽기의 원천은 현재 소유자다.
- 함수 이름/물리적 분리 차이만으로 새 알고리즘이나 전체 파일 재작성을 만들지 않았다. 기존 상세 helper와 query/wrapper·기하·자원 정리를 재사용한다.
- M01을 포함한 15개 모듈의 전체 비교는 마쳤다. 위 두 Source Script 계약의 해소와 관련 번역은 보류되어 있으므로 전체 의미 닫힘을 선언하지 않는다. Source Script 53의 `stale`, `closure: open`을 유지한다.
- pseudocode 30의 실제 diff·fingerprint·호출/반환·보호 경로·메타데이터 변경 범위를 정적으로 확인한다. source code 159의 이전 derived_from은 유지하여 후속 번역이 필요함을 드러낸다.
- PlusCal 변환·TLC·앱·브라우저·테스트·빌드·checker main·commit/push는 수행하지 않았다. 실행 성공이나 UI 회귀 통과를 주장하지 않는다.
