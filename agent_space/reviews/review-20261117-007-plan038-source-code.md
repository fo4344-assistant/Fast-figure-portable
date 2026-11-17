# Plan038 — pseudocode 30 → source code 모듈 대조

## 1. 대상과 판정

`plan-038.md`의 15개 논리 모듈을 절차·인자·현재 원천·반환·실패 의미로 대조했다. 앞서 전체를 읽은 변경 없는 절차를 재사용하고 이번 수정과 직접 호출자/private 확장을 다시 확인했다. 확인된 번역 차이를 13개 JavaScript 파일에서 수정했다. Source Script 53, pseudocode, 설정, 기존 문서와 dist는 보존했다.

| 구간 | 수정 또는 유지 근거 |
|---|---|
| M01 system | `sourcecode/system.js:45`에서 함수·host·Plotly·React/Mantine·root.render를 채택 전에 확인한다. `sourcecode/system.js:290`은 생성/채택→API 공개→runtime→ready→mount→실제 handle을 담은 반환 순서다. 새 rollback은 추가하지 않았다. |
| M02 state | `sourcecode/backend/project_state.js:7`의 Slot과 `sourcecode/backend/project_state.js:790`의 기존 인스턴스 유지/저장 record 복원, `sourcecode/backend/project_state.js:823`의 배열 위치 갱신으로 한 원형을 사용한다. 평면 accessor/toJSON을 제거하고 Slot 인스턴스를 검증한다. `sourcecode/backend/project_state.js:72`는 등록 이름/직접 path를 해석한다. image read는 imageId/MIME, labels reference는 width/height를 반환한다. |
| M03 EFSM | `sourcecode/backend/project_efsm.js:108`에서 후보 Slot/설정을 정규화한 뒤 전체 검증한다. 현재 참조 재검사·한 번 initialize·실제 전후 결과는 보존한다. `sourcecode/backend/project_efsm.js:231`과 `sourcecode/backend/project_efsm.js:265`는 data/rows/bytes/base64와 독립 header 갱신, 같은 후보의 참조 chart 재계산을 연결한다. header가 있으면 data/bytes를 무시하던 분기를 제거했다. |
| M04 assets | `sourcecode/backend/assets_files.js:196`은 누락 시 1, 명시 scalar 변환/절삭/행수 clamp를 맡고 model/import/FFPX/FFSX에서 재사용한다. VFS·충돌·참조·STORE/CRC/XML·원자 가져오기는 유지한다. `sourcecode/backend/assets_files.js:1053`의 package 쓰기 경계에서 평면 저장 형식으로 명시 변환한다. |
| M05 graphs | `sourcecode/backend/graphs.js:184`의 누락 열 이름은 빈 문자열이다. `sourcecode/backend/graphs.js:327`은 같은 project의 등록 chart/유일 owner를 확인하고 이번 호출이 전달한 chart의 표현과 내용을 사용한다. 축·trace 확장·figure 계산은 유지한다. |
| M06 layout | `sourcecode/backend/layout_annotations.js:83`이 Slot을 생성하며 내부 image 참조는 content를 사용한다. grid/merge/split·span/gap/margin/radius·label/caption 계산을 유지한다. |
| M07 FSM | `sourcecode/frontend/interface_fsm.js:28`은 revision 갱신 후 listener snapshot에 인자 없이 통지한다. 초기 session 선택/zoom/lock을 초기화하고 `sourcecode/frontend/interface_fsm.js:135`의 해제는 멱등이다. 기존 전이·실패·이동 map 참조 보정을 유지한다. |
| M08 adapter | `sourcecode/application/adapter.js:27`은 실제 renderer runtime을 반환하고 불필요한 초기 layout 변경 통지를 제거했다. 현재 state/query·명시 width·명령/선택의 단일 경로·부분 통지·lifecycle의 원래 실패를 유지한다. |
| M09 contract | `sourcecode/application/public_api/index.js:42`가 API를 구성해 반환하고 `sourcecode/application/public_api/index.js:160`이 같은 값을 공개한다. 생략한 download path는 공개 binding에서 현재 선택으로 확정한다. 전체 method/명시 graph export 인자를 대조했다. |
| M10 public assets | `sourcecode/application/public_api/assets.js:83`은 binding에서 확정한 path를 사용한다. 고정 target·충돌/취소·원자 directory batch/순차 router·성공 후 공식 읽기·미반영/원래 실패를 유지한다. |
| M11 public graphs | `sourcecode/application/public_api/graphs.js:180`과 `sourcecode/application/public_api/graphs.js:193`이 명시 slotId를 export에 전달한다. UI도 이벤트 시점 slotId를 전달한다. 기존 add/move/delete·편집 전환·header·layout/palette·import 절차는 유지한다. |
| M12 public layout | `sourcecode/application/public_api/layout_annotations.js`의 전체 wrapper를 대조했다. zoom lock의 한 번 측정·session 의도·image/labels/caption·복사한 print snapshot·원래 실패가 대응해 수정하지 않았다. |
| M13 renderer | `sourcecode/frontend/renderer.js:359`가 초기 렌더 전에 한 개의 연속 file-drop receiver를 설치한다. `sourcecode/frontend/renderer.js:377`로 UI 처리를 연결하고 `sourcecode/frontend/renderer.js:590`이 실제 click/drop/presentation handle을 반환한다. 공통 frame·graph/image generation/host 검사·오래된 완료 정리·export는 유지한다. |
| M14 UI | `sourcecode/frontend/mantine_ui.js`에서 명시 slot export·기존 drop 처리와 receiver 연결·실제 mount handle 반환을 맞췄다. 다른 component binding·현재 입력·빈칸 blur·fold/control/preview·실패 후 resolver/finalizer는 유지한다. |
| M15 portable | `sourcecode/portable_build/portable_build.mjs`와 `scripts/build-portable.py`의 기존 bundle·tag 개수/존재 확인·치환·외부 script 검사·쓰기/중단 경로가 대응해 수정하지 않았다. 빌드는 실행하지 않았다. |

## 2. 논리·목적·비중복

- Slot 생성/저장 복원→같은 후보 정규화/전체 검증→현재 owner 재검사→한 번 반영→실제 결과의 연결을 확인했다. 일반 읽기에 후보를 공유하지 않는다.
- API 공개/시작 결과, CSV 입력/bytes/header, listener 통지, chart 인자의 실제 차이를 수정하고 Slot 표현 변경의 직접 사용처도 추적했다.
- ProjectObject가 현재 project를, Frontend가 session을 소유한다. class 원형을 저장 tag로 기록하지 않고 평면 package 형식은 입출력 경계에서 변환한다. drop controller는 DOM listener/연결 handle을 보유한다.
- UI에 index 보정·Backend 계산·별도 수신 listener를 중복하지 않는다. 공통 frame·Application 경로·실제 commit 결과를 재사용한다.

## 3. 보류와 확인 범위

`review-20261117-006-plan037-modules.md`의 상위 계약 두 건(import mode와 완료 path/replaceId, ui-palette 이후 figure 입력)은 보류를 유지했다. 추가 field/query/의미를 만들지 않았다.

변경 JavaScript의 `node --check`, 전체 실제 native diff, hash/metadata 범위, 역적용·공백·보호 path·index를 정적으로 확인했다. 테스트·앱·브라우저·빌드·TLC·checker main은 실행하지 않았다. UI 동작·package 왕복·비동기 자원의 실행상 정확성이나 전체 계층 닫힘은 선언하지 않는다.
