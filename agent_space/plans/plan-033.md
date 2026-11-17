# Plan 033 — pseudocode → source code 번역 불일치 수정

## 1. 요구와 고정 기준

- 작성일: 2026-11-16.
- 사용자 요구: pseudocode → source code 불일치를 review 문서로 작성한 다음 수정 계획을 작성한다. Source Script와 pseudocode가 기준이며 수정 대상은 source code다.
- 선행 검토: `agent_space/reviews/review-20261116-001-pseudocode-source-code.md`의 C01~C19. 각 항목의 기준/구현 경로·행·입력·결과 차이는 해당 review를 참조한다.
- 기준 commit: `9991697cf25c29ceb051c91779dc506331d6a7ba`.
- 고정 Source Script: revision 52, `sha256:2740bd377c0f52c2ee99b32cb72eef0501e2c644656a788fe3c8aa581b095604`.
- 고정 pseudocode: revision 27, `sha256:5e40212959fccdb995ced547c8947a9ec0584c53eca8e11ac61d7ffed38a6558`.
- 수정 전 source code: revision 157/stale, `sha256:0b20697db1a985c659dd08d14b27ca2cdf66ee23cf6f1a12b19d18f5d363fa22`.
- 최초 작성 요청은 계획까지였다. 후속 사용자 지시에 따라 source code 수정을 진행했으며 결과는 §6에 기록한다.

경로는 `Fast-figure-portable/` 기준이다. 계층 이름은 Source Script → pseudocode → source code로 사용한다. PlusCal은 pseudocode의 구현 언어다.

## 2. 개발 원칙과 범위

1. Source Script 52와 pseudocode 27의 의미·설정·입력·반환·예외·취소 조건을 고정한다. 상위 두 계층과 settings.json은 수정하지 않는다. 상위 의미가 서로 충돌하거나 부족하면 해당 입력과 두 정의를 보고하고 그 부분을 중단한다.
2. 변경 경로는 source code와 실제 필요한 버전·계획 결과·review·native 패치 기록이다. 정책·AGENT·예시·배포물·빌드 workflow·Git 도구·선택적 verification model은 보존한다.
3. 영속 프로젝트는 기존 Backend 소유 상태에서 읽고 명령을 통해 반영한다. 명령 후보는 해당 호출의 계산에 사용한다. 반영 전에 전체 검증과 현재 소유 상태 재확인을 하고 반영은 한 번 수행한다.
4. UI 표시의 revision 구독과 명령 시점의 공식 읽기를 구분한다. 별도 선택 store, render 상태를 명령 입력으로 공유하는 캐시, 전체 상태의 동기화 계층을 추가하지 않는다.
5. 기존 query·command·helper·공통 설정을 재사용한다. 같은 허용값과 route를 별도 문자열 목록으로 복사하여 맞추는 구조는 추가하지 않는다. 현재 코드를 Source Script와 같은 물리적 함수 수·배치로 만드는 작업은 포함하지 않는다.
6. 공개 API 이름·인자 순서·파일 형식·원본 bytes·id·소유 관계를 유지한다. 반환 구조를 맞추는 변경에는 해당 소비자를 함께 옮긴다. Source Script와 pseudocode의 참조가 실제 source code의 어떤 함수·필드로 연결되는지 기록한다.
7. 테스트·앱·빌드·브라우저·TLC·checker 본체·Actions·커밋·푸시를 자동 실행 단계에 넣지 않는다. 삭제된 테스트도 복구하지 않는다. 향후 실행 확인은 사용자가 허용한 범위에서 수행하고 정적 대조와 결과를 구분한다.

## 3. 착수 전 확인

1. HEAD와 작업 트리를 확인하고 이 계획·review·기존 패치 기록을 보존한다. 기준 이후 수정이 있으면 해당 본문과 호출자를 다시 읽어 중복을 확인한다.
2. 실제 Source Script/pseudocode fingerprint를 기존 hash 함수로 대조한다. 해당 계산과 checker 본체 실행을 구분한다.
3. review C01~C19를 수정 단위에 연결한다. 구현 전후의 실제 native Git diff 기준을 기록한다.
4. 의미를 정할 때 Source Script와 pseudocode의 전체 해당 절차를 읽는다. source code의 기존 동작을 상위 의미의 대체 정의로 사용하지 않는다.

## 4. 수정 순서와 완료 조건

### 4.1 Backend 생성·정규화·조회 — C07~C13

대상: `sourcecode/backend/project_state.js`, `sourcecode/backend/layout_annotations.js`와 해당 읽기의 Application/public/UI 소비자.

- 생성자에서 호출자 입력을 분리 복사한다. 슬롯과 프로젝트 설정을 그 복사본에서 정규화하고 전체 검증 후 소유한다. 일반 initialize도 같은 정규화를 거쳐 한 번 교체한다.
- `normalizeProjectSettings`의 기존 의미를 구현한다. layout/annotations/export의 누락 필드만 설정으로 보완하고 유효 False·0·빈 문자열을 유지한다. palette는 설정된 key, 유효 6자리 hex와 대소문자 보존, 잘못된 값의 기본값, 미등록 key 제거를 적용한다.
- 기본 Slot과 전체 content/caption을 비교한다. null imageSettings와 부재를 구분하고 명시적 잘못된 값은 검증에서 거부한다.
- Backend query 등록과 분기를 기준 집합으로 맞춘다. slots.readSelected는 전체 영속 Slot 필드를 분리 복사하여 반환한다. 이 반환을 쓰는 선택·그래프 추가·이미지/레이아웃 경로를 같은 변경에서 옮긴다.
- gridLimits를 Backend 설정에서 공식 layout 읽기로 전달한다. 공개 layout 읽기는 이를 유지한다. Backend 크기 변경과 UI 입력의 제한이 이 범위를 사용하도록 연결한다.
- 대조 입력: 생성 뒤 원본 state 변경, 누락 export 하위 필드, 잘못된 palette, content.extension=1, imageSettings:null, caption/span이 있는 선택 Slot, 설정 범위 변경.
- 완료 조건: 소유 상태와 호출자 입력의 분리, 실패 시 기존 상태 보존, 추가 content의 병합/축소 보호, 정확한 query 수락 집합·반환 필드·설정 전파를 정적으로 추적한다.

### 4.2 반영 결과의 실제 참조 수 — C14

대상: `sourcecode/backend/project_efsm.js`, 기존 `collectAssetReferences`의 호출부.

- 성공한 명령의 실제 반영 전후 상태로 CSV/chart 및 image/slot 참조를 계산한다. 같은 CSV를 사용하는 서로 다른 graph object의 중복 개수를 유지한다.
- 감소한 개수만 결과에 넣는다. 명령 입력이나 일부 helper가 우연히 채운 count를 실제 결과의 원천으로 사용하지 않는다.
- 기존 actualChanged, 선택 hint, retained-original-index map과 단일 반영을 보존한다. 일반 실패·취소에서는 성공 count/hint를 만들지 않는다.
- 대조 입력: CSV object 하나의 reset, 같은 CSV object 두 개의 reset, image reset, 같은 chart 내부 object 순서 이동.
- 완료 조건: 각각 1/2/1/0의 제거 개수를 기준과 대조하고 기존 소비자의 결과 사용도 확인한다.

### 4.3 raw 자산 가져오기와 독립 reader — C15~C18

대상: `sourcecode/backend/assets_files.js`와 기존 EFSM 가져오기 연결부.

- ASSETS_IMPORTED의 이미지 대상은 visible Slot을 확인한 뒤 소유 chart를 제거하고 image 타입과 imageId를 적용한다. id/배치/span/caption을 유지한다.
- raw CSV 교체에서 생략된 headerLines는 현재 CSV에서 유지한 뒤 새 row 수로 제한한다. 새 CSV의 기본 header 의미와 구분한다. 교체 id·종류·경로는 읽기 전에 현재 상태에서 확인한다.
- CSV/TSV parser 결과 rows[]를 직접 허용한다. JSON은 기존 dataTable 입력 검증을 유지한다.
- ffpxReadProjectBytes는 각 CSV rows 복원 후 headerLines를 정규화한 payload를 반환한다. FFSX의 이미 있는 정규화를 재사용할 수 있는 범위를 확인한다.
- 대조 입력: graph 슬롯의 이미지 drop, headerLines=0 CSV 교체, 빈 .csv/.tsv, 빈 JSON 배열, 두 행/headerLines=99 FFPX reader 반환.
- 완료 조건: 반환과 실패 시점, 원본 bytes·MIME·VFS·id·한 chart 소유 관계를 기준과 대조한다. reader 반환과 최종 프로젝트 생성 결과를 별도로 확인한다.

### 4.4 Frontend FSM과 공개 선택 경계 — C03~C06

대상: `sourcecode/frontend/interface_fsm.js`, `sourcecode/application/public_api/assets.js`, `sourcecode/application/public_api/graphs.js`.

- reconcile/notify의 direction을 publish 전에 model-to-fsm으로 설정한다.
- graphs.selectCsv를 기존 selectProjectCsv에 연결한다. 수락된 CSV 선택 뒤 공식 경로 조회를 다시 수행하여 현재 CSV 또는 null을 반환한다.
- graphEditorAdd의 슬롯 조회 실패는 명령 전에 null로 반환한다. 기존 공개/내부 인자 순서는 유지한다.
- 대조 입력: ui-to-fsm 이후 reconcile/notify, alias 선택 반환, publish listener에서 자산 제거·교체, 없는 슬롯 id의 add 호출.
- 완료 조건: 실제 명령·조회 횟수와 반환·예외 경계를 기준에 맞추고 기존 자산 선택과 그래프 선택의 독립성을 유지한다.

### 4.5 Application/UI 읽기와 명령 입력 — C01/C02 및 C13의 UI 소비자

대상: `sourcecode/application/adapter.js`, `sourcecode/frontend/mantine_ui.js`.

- appFSM의 공식 readState/state 경로를 Frontend 소유자의 공식 읽기에 연결한다. 구독의 비교 값은 revision 숫자로 하고 매 render에서 공식 상태를 다시 읽는다.
- 그래프 추가·파일 입력·editable 변경·layout 변경은 각 이벤트에서 현재 공식 선택과 필요한 graphs.readData를 읽는다. 선택 없음·파일 취소는 명령을 발행하지 않고 id 0은 유효하게 처리한다.
- 파일을 받은 시점의 선택 id를 해당 비동기 작업의 입력으로 고정한다. 처리 중 다른 선택으로 명령을 돌리지 않는다. Backend의 현재 참조 검증을 유지한다.
- C12의 전체 Slot 반환을 사용하는 소비자를 확인한다. C13의 공식 gridLimits를 row/col clamp와 NumberInput 범위에 연결하고 현재 다른 차원·잘못된 입력 fallback을 유지한다.
- 대조 입력: 슬롯 0/선택 없음, render 이후 선택·CSV 변경, busy/편집 불가, 파일 취소·대상 소멸·처리 중 다른 슬롯 선택, 설정 범위 변경.
- 완료 조건: 실제 모든 버튼·파일 입력·설정 핸들러가 정의된 현재 읽기를 사용하고 render 결과가 명령의 공유 입력 원천으로 남지 않는다.

### 4.6 공통 캡션 배치 — C19

대상: `sourcecode/frontend/renderer.js`의 exportCaptionLayout과 현재 캡처·목표 저장 호출자.

- 초과 폭이고 현재 본문 line이 비어 있지 않을 때 줄을 넘긴다. 빈 line의 긴 단어는 유지하고 그리기 영역에서 잘라낸다.
- 같은 font/측정·prefix weight·빈 문단·단어 재시도·높이 계산과 자원 정리를 보존한다.
- 대조 입력: available=100/prefix=20/word=90, 이름 없음, 빈 본문·빈 문단, 긴 단어와 정상 여러 단어.
- 완료 조건: 기준의 line 배열과 높이가 두 내보내기 경로에 동일하게 전달된다.

## 5. 최종 대조와 계층 기록

1. C01~C19 각각의 기준 행·변경 함수·실제 소비자·대조 입력·반환/오류/반영 결과를 후속 review에 연결한다. 이전 review는 역사 기록으로 보존한다.
2. 이미 대응하는 graph rebuild, manual 이미지 0, debug toggle, 외부 grid 변경 선택 비우기, 단일 drop/충돌 취소·정리, 출력 자원 수명을 유지했는지 확인한다. 내부 assetNodes 이름의 일관된 변환은 이번 수정 대상으로 추가하지 않는다.
3. 변경된 실제 source code 전체 diff와 필요한 전체 모듈을 읽는다. 함수 이름만 존재하는 검사나 버전 숫자 갱신으로 의미 일치를 대신하지 않는다.
4. 구현 파일이 바뀌면 source code revision/fingerprint와 derived_from의 Source Script 52/pseudocode 27을 갱신한다. 현재 157 다음 값은 구현 시점의 실제 메타데이터를 확인하여 정한다. 상위 두 계층·선택적 verification model의 값과 닫힘 상태는 유지한다. 실행하지 않은 검증을 current/pass로 기록하지 않는다.
5. 실제 native Git diff 패치와 같은 basename 설명 문서를 만들고 적용 대상·역방향 점검·작업 트리·상위 계층 불변 여부를 확인한다. 구현 승인 이후의 작업 기록에는 완료 범위와 남은 범위를 구분한다.

## 6. 실제 수정 결과

- C01~C19의 source code 수정과 실제 소비자 연결을 반영했다. 항목별 변경·입력·반환 대조는 `agent_space/reviews/review-20261116-002-source-code-corrections.md`에 기록했다.
- Source Script 52와 pseudocode 27은 수정하지 않았다. source code는 158/stale로 기록하고 두 고정 상위 fingerprint를 derived_from에 연결했다. 상위 닫힘과 선택적 verification model 상태는 유지했다.
- 실제 변경 diff 전체와 호출자를 대조했다. 변경 JavaScript 10개 파일의 구문 분석, native whitespace 확인, 상위/설정/정책/배포물 불변 대조, 기존 hash 함수 계산만 수행했다.
- 앱·테스트·빌드·브라우저·TLC·checker 본체·Actions·커밋·푸시는 수행하지 않았다. 동작 확인 결과는 미확인 상태다.
- 실제 native 패치와 설명은 `agent_space/patches/20261116-002.patch`와 동명 `.md`에 기록한다.

## 7. 중단 조건

- Source Script와 pseudocode에서 같은 입력의 의미가 충돌하거나 필요한 규칙이 없으면 해당 경로와 입력을 보고한다. 이번 source code 수정의 편의를 위해 상위를 바꾸지 않는다.
- 같은 파일의 다른 작업 변경이나 기준 fingerprint 변경을 발견하면 최신 본문과 이전 기록을 대조한 뒤 범위를 조정한다.
- 실행 확인이나 커밋·푸시가 필요하면 요청된 권한을 확인한다. 실행 확인과 커밋·푸시는 별도 승인을 따른다.
