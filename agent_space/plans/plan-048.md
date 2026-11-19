# Plan048 — Source Script의 화면 갱신 호출과 판단 절차 명시

Plan047에서 적용한 직접 호출 방식을 완결한다. 이 계획의 구현 범위는 Source Script와 그 검증 기록이다. Pseudocode와 JS는 이번 수정에 포함하지 않는다.

## 1. 확인한 내용

- `sourcescript/frontend/renderer.py:85-103`, `sourcescript/frontend/mantine_ui.py:411-414,779`: 상태 문자열과 디버그 표시는 발행·구독 방식을 유지한다. 타이머로 상태를 재조회하는 구현은 Source Script에서 확인되지 않았다. 여기서 확인된 것은 생산자가 발행하면 구독자에게 통지하는 구조다.
- `sourcescript/application/adapter.py:291-308`, `sourcescript/backend/project_efsm.py:134-139`: 참조 수 비교는 프로젝트 명령이 반영될 때 수행하며 백그라운드 감시는 아니다. 그러나 그 결과를 자산 트리 갱신 조건으로 사용한다. 슬롯 연결 행의 “배치가 달라지거나”, CSV 목록의 “id·이름·경로가 바뀌었으면”에는 판단에 쓸 자료와 절차가 없다. 특히 슬롯 교환은 `Slot.id/row/col/rowSpan/colSpan`을 보존하고 `content/caption`을 바꾼다. 참조 수와 슬롯 좌표가 모두 그대로여도 연결 행의 내용은 바뀐다.
- `sourcescript/frontend/mantine_ui.py:429-456,802-815,898-905`, `sourcescript/frontend/renderer.py:299`: 팔레트 영향, 새 편집기 구성 여부, 너비 갱신의 입력 이벤트, 렌더러 자원 재사용 조건이 번역 가능한 절차로 정해지지 않았다. DOM 크기·입력 이벤트와 이미 호출된 렌더러 안의 자원 일치 검사는 프로젝트 상태를 감시하는 것과 구분한다.
- `agent_space/policies/examples/source-script_example1.py`의 `gridSlotGeometry(layout, geometry, slot)`을 확인했다. 인수의 원형과 권한 소유 위치, `slot is None`일 때의 기본값, 계산식, 결과 키별 대입과 반환을 따로 쓴다. 아래 수정에서도 함수별로 그 수준까지 명시한다. “영향이 있으면”, “같으면 한 번”이라는 문장만으로 분기를 대신하지 않는다.

## 2. 프로젝트 명령에서 직접 호출할 요소

`sourcescript/application/adapter.py`의 `dispatchProjectCommand`에서 백엔드 명령을 한 번 실행한다. `result["committed"]`가 거짓이면 UI 함수를 호출하지 않는다. 반영된 경우 선택 참조를 먼저 보정하고 기존 workspace 표시 절차를 수행한다. 이후 `refreshCommittedUi`에 **명령 이름과 그 명령의 `payload["operation"]`**을 전달한다. 프로젝트를 새로 불러오는 경우는 나머지 분기에 진입하지 않는다. 공통 상태 구독, 표시 목록 전후 비교, 주기적 조회를 추가하지 않는다.

| 표시 함수 | 호출할 조건과 사용할 자료 |
|---|---|
| `slotConnections()` → `slots.readDisplay` | `PROJECT_LOADED`, `GRID_LAYOUT_CHANGED`, `SLOTS_MERGED`, `SLOTS_SPLIT`, `SLOTS_SWAPPED`, `SLOT_TYPE_CHANGED`, `SLOTS_RESET`, `SLOT_IMAGE_LINKED`, `SLOT_DATA_CONNECTED`, `SLOT_IMAGE_IMPORTED`, `SLOT_CHART_IMPORTED`, `CHART_MODEL_REPLACED`는 반영 후 직접 호출한다. `GRAPH_OBJECTS_REPLACED`에서 `addObject`, `deleteObject`, `moveObject`에도 호출한다. `setObjectValues`는 백엔드가 실제로 채택한 이전/최종 object의 `csvId`가 다를 때만 호출한다. 이름·경로 변경 및 연결 제거는 아래 자산 작업 규칙을 사용한다. `applyPalette`, `CHART_LAYOUT_CHANGED`, 이미지 설정 변경은 호출하지 않는다. |
| `csvOptions()` → `assets.readList('csv')` | 프로젝트 불러오기, CSV 생성·삭제, 그리고 가져오기·이동·휴지통 비우기가 기록한 실제 생성·제거·canonical 경로 변경 항목 중 `kind=csv`가 하나 이상일 때 호출한다. 디렉터리 이름·경로 변경은 기존 하위 경로 재작성 단계에서 기록한 CSV 항목으로 판정한다. CSV 내용·헤더만 교체하면 `id/name/path`를 유지하므로 호출하지 않는다. |
| `assetTree()` → `assets.readTree` 및 열린 휴지통의 `assets.readTrash` | 프로젝트 불러오기, 파일·디렉터리 생성/이동/제거, 새 자산을 추가한 가져오기, CSV 내용·헤더 교체에서 호출한다. 기존 연결을 추가·제거·교체하는 작업은 아래 작업별 규칙으로 호출한다. `SLOTS_SWAPPED`와 `graphs.moveObject`는 연결 표시 순서·위치는 바꾸지만 트리 참조 수는 바꾸지 않으므로 트리를 읽지 않는다. |

- **연결의 추가·제거·교체:** 객체 추가·삭제나 슬롯 CSV 연결에는 트리 갱신을 연결한다. `graphs.setObjectValues`는 위에 정의한 유효 `csvId` 교체에서만 트리와 연결 행을 호출한다. 이미지 링크 작업은 대상 슬롯에서 읽은 이전 `imageId`와 채택한 최종 `imageId`가 다를 때 트리를 호출한다. 슬롯 종류 전환·초기화·병합·분할·그리드 변경·그래프 모델 교체·슬롯 차트 가져오기는 해당 후보 작성 단계에서 수정·제거하는 슬롯/차트의 표시 참조를 사용한다. 이전 및 최종 image 연결과 실제 project object의 `csvId`를 해당 대상에서만 모은다. 트리용으로는 **중복을 유지한 `(kind,id)` 목록을 정렬**해 두 목록이 다를 때 호출한다. 슬롯 연결 행 호출은 이 트리용 판정과 독립이다. 표시를 위해 프로젝트 전체의 참조 수를 비교하지 않는다.
- **자산 작업:** `PROJECT_NODE_MOVED`에서 실제 이동한 CSV/image의 id와 canonical 경로를 기존 경로 재작성 루프에서 넘긴다(디렉터리는 그 하위 항목 포함). 이동 시 현재 연결된 자산의 경로를 다시 표시하거나, 휴지통 진입·삭제·비우기에서 실제로 제거한 객체/이미지 연결이 있으면 `slotConnections()`를 호출한다. 연결 대상은 `collectAssetReferences`에 **이번 작업의 id 집합만** 넣어 얻는다. 삭제·휴지통 진입에서는 연결을 제거하기 전에 얻은 결과를 사용한다. `ASSETS_IMPORTED`에서 대상 슬롯에 연결을 처리했으면 `slotConnections()`를 호출한다. 새 자산 추가나 대상 연결의 추가·교체는 트리 호출로 연결한다. `DATA_OBJECT_REPLACED`·`IMAGE_OBJECT_REPLACED`에서 경로·연결을 유지하면 연결 행을 읽지 않는다.
- **결과 계약:** 기존 `changed.assets`와 실제 후보 작성에서 계산한 id·경로·참조 해제 결과를 먼저 사용한다. 가져오기와 하위 이동의 경우 기존 결과가 실제 처리 항목을 담지 못하면 작업 루프가 이미 처리한 `kind/id`와 처리 종류(`created`, `removed`, `moved`, `replaced`)만 해당 명령 결과에 보완한다. 범용 표시용 변경 스냅샷을 만들지 않는다. 트리의 유일한 UI 소비를 위 규칙으로 교체한 뒤 `changed.assetReferenceChanges`와 그 집계만 제거한다. 삭제 확인·결과의 `removedGraphReferenceCount`, `resetImageSlotCount`, `assets.readTree` 표시값, 참조 정리와 선택 보정은 유지한다.
- **편집기:** `before/current`는 같은 명령의 참조 보정 전/후 결과다. `selectedSlotId`와 `workspace`를 각각 비교해 하나라도 다르면 `selection(current)`을 호출한다. 둘 다 같으면 자산 종류/경로, 객체 순번, overlay 이름을 각각 비교하고 달라진 표시 함수만 호출한다. `selection`이 새 편집기를 구성하는 분기와 유지하는 분기를 명시해 호출자에게 구분을 돌려준다. 새 편집기 초기화에서 이미 적용한 값은 같은 호출의 `slot/graph/image/csv`로 다시 읽지 않는다. 유지하는 편집기는 `changed.slotIds/chartIds/imageIds/csvIds`에 현재 표시 대상의 id가 있는지 검사한다. `graph` 안의 팔레트 조회는 현재 표시 chart의 `addObject/deleteObject/moveObject/setObjectValues/applyPalette` 또는 `CHART_MODEL_REPLACED`로 명시한다. `graphs.readPalette`가 읽는 것은 editor object 색의 순서이며 축·제목만 바꾸는 `CHART_LAYOUT_CHANGED`는 제외한다. 자산 제거·가져오기 경로에서 객체를 제거·추가한 chart도 이 규칙에 포함한다.
- **한 작업의 호출 순서:** 프로젝트 교체는 기존 팔레트 적용 → 프로젝트 이름 → 자산 트리 → 슬롯 연결 행 → CSV 선택 목록 → 선택 표시 순서로 쓴다. 그 외 명령은 위 규칙으로 트리/연결 행/CSV 선택 목록의 실행 여부를 각각 한 번 정한 후 각 함수를 최대 한 번 호출한다. 새 그래프 편집기와 `csvOptions()`가 함께 실행되어 **같은 목록이 실제로 필요한 경로**에서는 먼저 읽은 옵션 배열을 그 호출의 편집기 초기화에 전달한다. 다른 호출로 넘겨 보관하지 않는다. 현재 두 번 읽는다는 사실이나 성능 문제를 전제하지 않는다.

## 3. 상태 표시 및 브라우저 입력

1. `sourcescript/frontend/renderer.py`, `sourcescript/frontend/mantine_ui.py`, `sourcescript/system.py`: `StatusDebug`가 제공하는 상태 문자열·디버그 토글·로그 표시 setter를 기존 mount 수명에 직접 연결한다. 연결할 때 현재 소유값을 한 번 전달하고 unmount 전에 연결을 비운다. `status(message)`는 저장한 문자열을 해당 setter에 전달하고 그 문자열을 반환한다. `setDebugEnabled(enabled)`는 기존 runtime 값을 먼저 바꾼 뒤 그 boolean을 토글 setter에 전달한다. 로그는 실제 추가/삭제를 처리한 함수에서 최종 표시 배열을 직접 전달한다. 구현 첫 단계에서 로그 추가·초기화 생산자를 찾아 명시하고, Source Script에 생산자가 빠져 있으면 기존 동작을 확인해 계약을 보완한다. 표시 오류는 기존 방식으로 전파하고 runtime 상태를 되돌리지 않는다. 이 표시의 구독자 목록·revision·발행은 제거한다.
2. `sourcescript/frontend/mantine_ui.py`: 레이아웃 미리보기는 창을 열 때, 실제 레이아웃 명령에서 `layout()`이 호출될 때, 열린 미리보기의 외부 표시 영역에서 가로 크기 통지를 받았을 때 실행한다. 외부 영역의 너비를 `layout.readState(width)`에 넘긴다. resize 입력에는 직전 전달 너비와 같은 값이면 반환하도록 쓰고 영역을 닫을 때 이벤트 연결을 해제한다. 렌더러가 쓰는 내부 틀의 너비는 다시 입력으로 관찰하지 않는다. 세로만 바뀌면 조회하지 않는다. Sidebar 조작은 해당 조작 처리기, 브라우저 크기 변경은 해당 크기 이벤트에서 `transformWorkspace()`에 연결한다. 스크롤은 브라우저의 scroll 배치로 처리하고, 별도의 CSS 위치 계산이 필요한 기존 연결은 scroll 이벤트에서만 실행한다. 프로젝트 상태 구독이나 Plotly 재렌더는 추가하지 않는다.
3. `sourcescript/frontend/renderer.py`: 내용 표시를 이미 요청받은 함수에서만 해당 슬롯의 이전 자원 소유 기록을 읽는다. 이번 host DOM identity·content type·소유 chart/image id를 이전 기록의 같은 세 값과 대조한다. 모두 같으면 기존 surface를 쓰고, 다르면 이전 자원을 해제한 뒤 새 연결을 기록한다. workspace 종료 시에는 기존 수명 무효화 규칙을 유지한다. 이 비교를 별도 감시 함수나 표시 요청의 발생 조건으로 옮기지 않는다.

## 4. 적용 순서와 완료 기준

1. `PROJECT_COMMANDS`의 모든 등록 항목과 그래프 `operation`을 실제 public API → 후보 작성 → 결과 → UI 함수 순으로 대조한다. 표에 없는 항목은 프로젝트 설정·레이블·캡션·프린트·팔레트 등 기존 담당 함수와 인수를 적고, 연결 행·CSV 목록·트리를 조회하지 않는지 확인한다. 인수·반환·변경·처리 문서에는 원형과 Source of Truth, 분기 순서, 조회/대입/호출/반환을 적는다.
2. 호출 순서를 검증한다. 최소 사례: 서로 다른 자산이 연결된 두 슬롯 교환은 연결 행 1회/트리 0회, `[A,B]` 객체의 순서 교환은 연결 행 1회/트리 0회, 선 굵기 변경은 연결 행/CSV 목록/트리 모두 0회, 실제 `csvId` 교체는 연결 행·트리 각 1회, CSV 내용 교체는 옵션 0회, CSV가 든 디렉터리 이동은 옵션·트리 각 1회 및 연결된 CSV의 경로 갱신, 휴지통 이동·비우기는 실제 연결 제거와 목록 갱신, 병합·분할·그리드 변경은 빈 행을 포함해 슬롯 행 갱신, 미반영 명령은 해당 표시 호출 0회, 프로젝트 교체는 새 연결과 옵션만 표시. 확인에는 자산이 공유된 사례와 id가 `0`인 사례를 포함한다.
3. 상태·디버그 변경은 담당 setter만 호출하며 프로젝트 조회가 0회인지 확인한다. mount/unmount, 닫힌 미리보기, 가로/세로 resize, 동일 슬롯 자원 재사용과 소유 교체를 각각 검증한다. Source Script에서는 호출·계약·경계의 명세를 검증한다. 실행 레이어까지 갱신하지 않았으면 브라우저에서 동작을 검증했다고 기록하지 않는다.
4. 실제 작업 경로 또는 값의 소유자가 확인되지 않으면 일반 문구나 추측으로 메우지 않는다. 확인한 함수·입력·누락 값과 결정을 남기고 해당 항목을 미완료로 둔다. 검증 결과와 수정 diff를 별도로 기록하고 Source Script 검토를 닫은 뒤에만 다음 레이어로 옮긴다.
