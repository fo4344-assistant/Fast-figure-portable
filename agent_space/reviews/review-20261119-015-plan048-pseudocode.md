# Plan048 Source Script r60 → pseudocode r35 번역 검토

원천: 닫힌 Source Script r60, 커밋 `e7fc708`, `sha256:50ad732dcd16a4780da1c65b488c0d12745b5b4e71079365dd630e04c1d571a0`. 정책 §5.1에 따라 책임, 입력, 상태 변경 순서, 분기와 반환을 대조했다. 구현 언어·새 도메인 규칙·저장 상태는 추가하지 않았다.

| Source Script ↔ pseudocode 모듈 | 확인한 책임과 교정 내용 |
|---|---|
| `sourcescript/system.py` ↔ `pseudocode/system.pcal` | 기존 root에 UI를 한 번 mount한 뒤 adapter와 renderer를 연결한다. 해제 시 renderer → adapter 순으로 연결을 끊고 요소를 정리한다. 초기 전체 렌더링은 하지 않는다. |
| `sourcescript/application/adapter.py` ↔ `pseudocode/application/adapter.pcal` | Backend 반영 결과가 미반영이면 표시하지 않는다. 성공 시 reconciliation 뒤 구조/선택 내용 조회를 분리한다. 명령과 실제 변경 사실로 tree/options/slotConnections를 각각 호출한다. lifecycle의 실제 task 오류는 표시 오류로 대체하지 않는다. |
| `sourcescript/application/public_api/__init__.py`, `sourcescript/application/public_api/assets.py`, `sourcescript/application/public_api/layout_annotations.py` ↔ `pseudocode/application/public_api/contract.pcal`, `pseudocode/application/public_api/assets.pcal`, `pseudocode/application/public_api/layout_annotations.pcal` | 현재 선택 슬롯/그래프/CSV 제어값의 공식 읽기와 반환을 연결했다. 디렉터리 생성과 경로 이동은 실제 `changed.assets`에서 canonical path를 구한다. 슬롯 raw import는 choices와 target을 하나의 명령에 전달하며 성공 시 첫 자산의 경로로 target을 읽는다. palette와 zoom 표시를 공개 wrapper에 남긴다. |
| `sourcescript/backend/project_efsm.py` ↔ `pseudocode/backend/project_efsm.pcal` | 슬롯 후보, 명령 배분, 반영 결과의 책임을 유지한다. 파일 대기 이후와 반영 직전에 Project 및 `_state` identity를 모두 비교한다. 새 시도는 새로운 자산 사실/순번 자료를 사용한다. 정규화·전체 검증·한 번의 반영 뒤 결과를 구성한다. 미반영 결과에는 성공 hint가 없다. |
| `sourcescript/backend/assets_files.py` ↔ `pseudocode/backend/assets_files.pcal` | VFS descendant 경로, 경로 충돌/고유 이름, 실제 root/descendant 이동, 원래 참조 순번, import 과정의 입력 순서와 `replaced` 사실을 자산 후보에서 계산한다. Trash 참조 해제와 실제 삭제를 구별한다. |
| `sourcescript/backend/graphs.py` ↔ `pseudocode/backend/graphs.pcal` | 다섯 graph operation을 그래프 후보에 둔다. add는 연결을 먼저 구성한다. object 변경은 동일 후보의 `graphEditorCommit`을 거치고 호출자에서 그래프를 다시 만들지 않는다. conversion view 판정은 `chartUsesConversionView`로 통일한다. |
| `sourcescript/backend/layout_annotations.py`, `sourcescript/backend/project_state.py` ↔ `pseudocode/backend/layout_annotations.pcal`, `pseudocode/backend/project_state.pcal` | 배치·병합·분할·annotation 후보는 layout owner가 계산한다. 상태 모듈은 visible slot과 개별 선택 검증, 목적 조회, 현재 소유자와 순번에 따른 reconciliation 입력을 맡는다. `projectionEffect`를 다시 계산하지 않는다. |
| `sourcescript/frontend/interface_fsm.py`, `sourcescript/frontend/mantine_ui.py`, `sourcescript/frontend/renderer.py` ↔ `pseudocode/frontend/interface_fsm.pcal`, `pseudocode/frontend/mantine_ui.pcal`, `pseudocode/frontend/renderer.pcal` | FSM은 상태 전이와 복구 결과를 반환하며 구독을 관리하지 않는다. 현재 mount의 표시 setter가 목적 조회와 표시를 담당한다. renderer가 status/debug 값을 직접 보내고 surface 변경을 비교한다. layout preview에는 현재 렌더 너비를 사용하고 CSS 적용 후 외부 영역 크기 변환 경로를 유지한다. |

## 대표 분기 대조

- 슬롯 교환: 배치와 전체 참조 수가 같아도 `SLOTS_SWAPPED`가 slotConnections를 직접 갱신한다. move는 순번 대응표와 slotConnections를 갱신하되 graph object 순서 이동을 자산 트리 변경으로 해석하지 않는다.
- 같은 CSV를 두 object가 참조할 때: 실제 CSV 연결 변경은 반영 전후 동일 index의 csvId로 판정한다. 자산 경로 이동/삭제의 연결 목록은 대상 id의 직전 참조 유무로 판단한다. 참조 중복 수 비교는 renderer/cascade 결과에만 사용한다.
- 새 CSV 가져오기와 기존 CSV 교체: 전자는 tree/options, 후자는 tree 대상이다. targetSlotId `0`은 유효하다. 같은 chart에 object가 실제 추가될 때만 append로 표시하고 CSV 교체 자체는 append로 보지 않는다.
- object 삭제/연쇄 제거: 원래 index 대응으로 선택을 정리한다. 동일 값의 object도 원래 index로 구별한다. chart가 사라지면 owner 부재로 정리한다. palette나 단순 경로 변경에서 성공 index를 추정하지 않는다.
- editor: mount identity가 달라지거나 project load가 강제 초기화할 때만 초기화한다. 전달된 빈 CSV 옵션도 재사용한다. 이미 읽은 슬롯은 다시 읽지 않고 layout 변경에서 graph layout만, 이미지 설정 변경에서 설정만 읽는다. CSV preview의 행은 실제 표가 열린 때만 읽고 같은 열 정의를 한 번 사용한다.
- 취소/실패: 취소 또는 미반영에는 성공 표시 경로가 없다. 반영 후 표시 실패는 이미 끝난 commit을 취소하지 않는다. lifecycle task 예외에서는 복구 후 원래 오류를 전파한다.

## 확인과 한계

- `python scripts/check-pseudocode-fidelity.py --report …`: 219개 Source 진입점, 96개 공개 API, 명시적 wrapper 바인딩 65개, 활성 모듈 15개 통과. 이 검사는 엔트리/입력 바인딩 검사이지 의미 등가 실행 검사가 아니다.
- Source AST의 34개 명령을 pseudocode 등록 집합과 각 모듈의 후보 procedure 분기에 대조했다. 그래프 후보의 다섯 operation 분기를 확인했다.
- `git -c core.safecrlf=false diff --check`, `python scripts/check-development-layer-versions.py --base HEAD`로 공백과 lineage를 확인한다.
- 정적 명세 대조이며 PlusCal 변환, TLC, JS 실행, 브라우저를 검증하지 않았다. Source Script 및 하위 source code/verification model은 변경하지 않았다.
