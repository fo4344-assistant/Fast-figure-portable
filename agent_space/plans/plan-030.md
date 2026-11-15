# Plan 030 — ProjectStateMachine.send의 명령 계산과 반영 책임 분리

## 1. 요구와 범위

2026-11-15 사용자 지시에 따라 계획을 작성하고 Source Script를 수정한다.
수정 전 Source Script 50의 `ProjectStateMachine.send`에는 34개 명령의 계산, 현재 참조 확인, 재시도, 프로젝트 반영, 결과 계산이 함께 있다.
또한 `graphEditorCommit(chartId, objects, index)`에 operation과 values/from/to/colors를 전달한다고 적혀 있어 실제 인자와 설명이 어긋난다.

대상은 `sourcescript/backend/project_efsm.py`, `graphs.py`, `assets_files.py`, `layout_annotations.py`와 관련 Source Script 호출 설명이다.
Source Script → pseudocode → source code 순서를 유지한다. 이번 변경은 Source Script에 한정한다.

## 2. 정책 적용

- 영속 상태는 `activeProject._state`가 소유한다. `send`가 현재 ProjectObject와 `_state`를 함께 읽고 최종 반영을 수행한다.
- 명령 계산에 사용하는 상태 복사본과 원래 object 순번은 그 명령 호출에서만 사용한다.
- 파일 해석, VFS, graph, grid·caption 계산은 기존 Backend 책임 모듈과 함수를 사용한다.
- 함수 분리는 실제 입력·출력과 계산 책임을 기준으로 한다. 별도 명령 등록기, 공용 작업 상태, 새로운 영속 식별자는 추가하지 않는다.
- 예시의 지역변수 선언, `Args`, `Return`, `변경`, `처리`, 명시적 반환을 따른다. 변수 설명에는 자료형·원형·값의 의미를 적는다.
- 거부 조건, 계산 순서, 반복, 수식, 필드 대입은 `처리`에 명시한다. 참조하는 계산 함수의 입력과 출력을 연결한다.

## 3. 수정 순서

1. `send`의 34개 event와 기존 분기 내용을 대조하여 명령 소속을 정한다.
2. asset 모듈에 프로젝트 불러오기·이름·VFS·asset 생성/교체/삭제 계산을 둔다.
   삭제·trash 참조 해제는 chart별 유지된 원래 object 순번을 함께 반환한다.
3. graph 모듈에 graph 명령 계산을 둔다. add/move/edit/delete/palette는 먼저 object 배열과 선택 index를 계산한다.
   `graphEditorCommit`은 그 배열·index와 같은 명령의 상태를 받아 정규화·검증·graph 계산을 수행한다.
   단일 object 필드 갱신은 실제 CSV 선택, x/y 보완, enum·색·수치 범위를 명시한다.
4. layout 모듈에 grid/style/merge/split/caption/labels/appearance/export 계산을 둔다.
   기존 grid 확장·안전한 축소, 기본 Slot, caption 원문, 설정 부분 병합 의미를 보존한다.
5. Slot의 종류·초기화·교환·asset 연결·파일 연결은 EFSM의 별도 계산 함수에 둔다.
   asset와 graph 모듈의 함수를 호출하고 대상 id·배치·단일 chart 소유 관계를 보존한다.
6. `send`는 현재 상태 읽기, 명령 계산 호출, 전체 정규화·검증, 현재 객체/상태 동일성 확인, 재시도, 단일 반영, 결과 반환 순서로 정리한다.
7. 반영 전후 상태와 유지된 원래 순번으로 `ProjectMutationResult`를 만드는 함수를 분리한다.
   성공 hint, 실제 참조 제거 수, 중복 object를 구별하는 index 대응표를 계산한다.

## 4. 재사용 함수의 인자와 상태

`graphEditorCommit`, `buildGridResizeCandidate`, `buildProjectAssetImportCandidate`, `applyFfsxSlot` 등 명령 내부에서 상태를 읽는 함수에는 해당 명령의 상태를 명시적으로 연결한다.
기존 읽기 호출과의 호환이 필요한 함수는 기본 인자로 현재 상태 조회를 유지하고, 명령 경로는 상태 인자를 전달한다.
명령 helper가 만든 후보와 현재 상태의 참조를 섞지 않도록 호출·반환 설명을 함께 수정한다.

## 5. 확인과 기록

- 34개 event의 소속, 입력·출력, 현재 참조 검증, 거부·취소·오류 경로를 정적으로 대조한다.
- helper의 상태 변경 범위, `send`의 재시도와 단일 반영, 반영 후 결과 계산 순서를 확인한다.
- graph helper의 실제 signature와 모든 Source Script 호출을 대조한다.
- 모든 수정 함수와 계획·실제 Git diff를 구간별로 끝까지 읽는다.
- Source Script revision/fingerprint와 stale/open 상태를 기록하고 실제 native Git 패치·동명 설명을 남긴다.
- 테스트, 애플리케이션 실행, checker 본체, 빌드, 커밋, 푸시는 수행하지 않는다.
- 전체 Source Script 닫힘과 하위 계층 반영은 후속 단계로 유지한다.

## 6. 반영 결과

- Source Script 51에서 `send`를 56줄의 현재 상태 확인·계산 호출·검증·재시도·단일 반영 흐름으로 정리했다.
- `buildAssetCommandCandidate` 12개, `buildSlotCommandCandidate` 8개, `buildGraphCommandCandidate` 3개, `buildLayoutCommandCandidate` 11개로 기존 34개 event 계산을 연결했다.
- `buildProjectMutationResult`는 반영 전후 상태와 유지된 원래 object 순번으로 실제 변경·선택 hint·index 대응표를 계산한다.
- `graphEditorCommit(chartId, objects, index, state)`에 계산된 배열과 선택 index를 전달한다. 명령 경로의 기존 graph·asset·grid 함수에도 같은 후보 상태를 연결했다.
- `encodeTableAssetBytes(rows, name)`에 기존 JSON/TSV/CSV 직렬화 절차를 모아 표 생성과 프로젝트 저장에서 공유했다. 원본 bytes가 있는 파일은 그 바이트를 유지한다.
- 변수 정의는 자료형·원형·값의 의미를 적고, 계산과 조건은 예시의 `처리`에 적었다. 수정 전후 실제 Source Script diff를 끝까지 읽고 후보 전체 필드 보존·반환값 연결·현재 참조 재확인을 대조했다.
- 정적 AST·설명 구획 확인: Python 문서 15개, 함수·메서드 198개, 구획 오류 0개. 등록 event는 34개다. 실행 검증 결과로 해석하지 않는다.
- Source Script 51은 `stale/open`이다. pseudocode 26, source code 157과 기존 파생 기록은 유지한다.
- 실제 변경과 근거는 `agent_space/patches/20261115-012.patch`와 동명 `.md`에 기록한다. 테스트·애플리케이션·빌드·checker 본체·커밋·푸시는 실행하지 않았다.
