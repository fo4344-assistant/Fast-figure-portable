# Plan033 source code 수정 정적 대조

- 작성일: 2026-11-16.
- 기준 commit: `9991697cf25c29ceb051c91779dc506331d6a7ba`.
- 요구: Plan033에 따라 source code를 수정한다.
- 고정 기준: Source Script 52와 pseudocode 27. 두 계층의 파일과 fingerprint는 보존했다.
- 선행 검토: `review-20261116-001-pseudocode-source-code.md`의 C01~C19.
- 아래 경로는 `Fast-figure-portable/` 기준이다. 결과는 실제 변경 diff와 호출 경로의 정적 대조다.

| 항목 | 변경 위치 | 대조한 처리와 결과 |
|---|---|---|
| C01 | `sourcecode/application/adapter.js`, `sourcecode/frontend/mantine_ui.js` | appFSM.state는 공식 readState에 위임한다. 구독 비교는 revision 숫자이고 render는 공식 상태를 새로 읽는다. selectedSlotId는 공식 읽기에 포함된다. |
| C02 | `sourcecode/frontend/mantine_ui.js` | 추가/editable/layout/파일 입력은 현재 선택과 graphs.readData를 읽는 helper에 연결했다. 추가는 현재 CSV를 사용한다. 선택 없음과 파일 취소는 명령을 발행하지 않으며 id 0은 유지한다. 파일 입력의 id는 public import 호출 때 고정된다. |
| C03 | `sourcecode/frontend/interface_fsm.js` | reconcile/notify가 publish 전에 direction=model-to-fsm을 기록한다. |
| C04 | `sourcecode/application/public_api/graphs.js` | graphs.selectCsv는 selectProjectCsv에 위임하여 CSV/null을 반환한다. |
| C05 | `sourcecode/application/public_api/assets.js` | 수락된 선택 뒤 assets.readDeletionTarget을 다시 읽어 현재 CSV/null을 반환한다. |
| C06 | `sourcecode/application/public_api/graphs.js` | 슬롯 조회 실패는 명령 전 null로 반환한다. |
| C07 | `sourcecode/backend/project_state.js` | 생성/initialize 모두 슬롯과 프로젝트 설정을 정규화한 후 전체 검증한다. 기존 fillMissingSettingRecord를 재사용하며 누락 설정만 보완한다. palette는 공통 key와 유효 hex 대소문자를 유지한다. |
| C08 | `sourcecode/backend/project_state.js` | 생성자는 structuredClone으로 입력을 분리한 뒤 정규화/검증/소유한다. 호출자 객체에 슬롯 접근자를 설치하거나 그 객체를 _state로 보관하지 않는다. |
| C09 | `sourcecode/backend/project_state.js` | 전체 local content와 caption을 기본값과 비교한다. content.extension=1도 차이로 판정되어 기존 merge/shrink 거부 조건에 전달된다. |
| C10 | `sourcecode/backend/project_state.js` | 정규화는 명시된 imageSettings:null을 보존하고 전체 프로젝트 검증이 형식 오류로 거부한다. 부재 필드의 기본값 보완은 유지한다. |
| C11 | `sourcecode/backend/project_state.js` | interface-intent query 등록을 제거하고 project-api의 네 export operation을 기존 export 처리에 연결했다. Application이 사용하는 직접 선택 검증은 유지한다. |
| C12 | `sourcecode/backend/project_state.js` 및 public graphs/UI | 전체 Slot 영속 필드(id/좌표/span/hidden/content/caption)를 분리 복사한다. 그래프 추가와 두 이미지/선택 UI 소비자는 content 경로를 사용한다. slot-selection-context의 별도 반환은 보존한다. |
| C13 | `sourcecode/backend/project_state.js`, `sourcecode/backend/layout_annotations.js`, `sourcecode/frontend/mantine_ui.js` | 공식 layout 읽기에 설정 gridLimits를 포함한다. Backend resize, 현재값 clamp, 행/열 NumberInput이 해당 범위를 사용한다. 현재 다른 차원과 잘못된 입력 fallback을 유지한다. |
| C14 | `sourcecode/backend/project_efsm.js` | collectAssetReferences의 실제 commit 전후 결과를 kind/owner/asset별 다중집합으로 비교한다. CSV object 한 개/두 개 reset, image reset, 같은 chart의 순서 이동은 각각 1/2/1/0으로 추적된다. 실패는 0이며 actualChanged/hint/map 경로를 유지한다. |
| C15 | `sourcecode/backend/assets_files.js` | raw 이미지 가져오기는 대상의 소유 chart만 제거하고 chart=null/type=image/imageId를 적용한다. Slot id/배치/span/caption은 유지한다. |
| C16 | `sourcecode/backend/assets_files.js` | CSV 교체는 현재 자산 존재를 확인한 뒤 기존 headerLines를 새 row 수로 제한한다. 기존 0은 유지하고 신규 기본값은 1이다. |
| C17 | `sourcecode/backend/assets_files.js` | CSV/TSV는 parseCSV 결과 []를 그대로 반환한다. JSON은 기존 dataTable 검증을 유지한다. |
| C18 | `sourcecode/backend/assets_files.js` | FFPX reader가 rows 복원 직후 headerLineCount를 적용한다. 두 행/header 99는 payload 반환 시점에 2가 된다. |
| C19 | `sourcecode/frontend/renderer.js` | 초과 폭이며 본문 line이 비어 있지 않을 때만 줄을 넘긴다. available=100/prefix=20/word=90은 한 clipped line으로 계산한다. 현재/목표 출력은 같은 helper를 사용한다. |

## 범위와 확인 한계

- 수정된 source code의 실제 native diff 전체를 읽고 반환 구조의 소비자를 검색·대조했다.
- 변경 JavaScript 10개 파일에 `node --check`를 수행했다. 이는 구문 분석이며 모듈 실행·앱 실행·테스트 결과가 아니다.
- git diff whitespace 확인과 Source Script/pseudocode/config/verification/scripts/dist/정책/AGENT 불변 대조를 수행했다.
- 기존 hash 함수만 호출하여 source code fingerprint와 고정 상위 두 fingerprint를 계산했다. version checker 본체는 실행하지 않았다.
- source code 158은 stale을 유지한다. Source Script의 open 상태와 선택적 verification model의 기존 lineage를 보존한다.
- 런타임·브라우저·테스트·빌드·TLC·Actions를 실행하지 않았다. 이 문서는 이전 real-field 결과의 재실행 또는 전체 프로젝트 검증 완료를 주장하지 않는다.
- 기존 graph rebuild/manual 이미지 0/debug owner 읽기/grid 변경 선택 초기화/drop 정리의 구현은 유지했다. 내부 assetNodes 변환은 변경하지 않았다.
