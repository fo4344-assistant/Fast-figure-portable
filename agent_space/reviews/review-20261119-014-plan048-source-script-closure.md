# Plan048 — Source Script r60 닫힘 검토

기준: `01441bb`, `agent_space/plans/plan-048.md`, 개발 정책 §4.6. 범위: Plan047에서 남긴 화면 조회·호출 경로와 이번 변경이 닿는 계약. 판정: **Source Script 닫힘**. 아래는 Source Script의 정적 명세·분기 대조 결과이며 UI 실행 결과가 아니다. Pseudocode·JS·TLC 모델은 수정하지 않았다.

## 1. 논리적 완결성

`sourcescript/backend/project_efsm.py`의 `PROJECT_COMMANDS`에는 **34개**의 고유 등록 항목이 있다. `sourcescript/application/public_api/`의 호출자, 세 도메인 후보와 슬롯 후보, `buildProjectMutationResult`, `sourcescript/application/adapter.py`의 `dispatchProjectCommand` 및 `refreshCommittedUi` 순으로 확인했다. 미반영은 참조 보정·표시 전에 반환한다. 아래 T/R/C는 각각 `assetTree()`/`slotConnections()`/`csvOptions()`이며, ✓는 명령 반영 시 한 번, 조건 표기는 그 사실을 가진 경우만 한 번을 뜻한다. 편집기 초기화에서만 필요한 별도 옵션 읽기는 아래에 따로 적었다.

| 명령 | Public API 쪽 진입 → 후보·결과 | 목록 및 담당 표시 |
| --- | --- | --- |
| `PROJECT_LOADED` | `importProjectFile` → FFPX를 검증해 전체 교체 | 팔레트 → 이름 → T/R/C → 새 선택 편집기, 분기 종료 |
| `PROJECT_NAME_CHANGED` | `setProjectName` → 이름 문자열·길이 정규화 | `projectName()`, T/R/C 없음 |
| `PROJECT_DIRECTORY_CREATED` | `createProjectDirectory` → 부모/경로 검사, `created` directory | T; 생성 경로로 후속 자산 선택 |
| `PROJECT_NODE_MOVED` | `moveProjectNode` → 충돌 선택·루트/하위 경로 기록, 휴지통 진입 시 참조 해제 | T, 이동 대상에 CSV가 있으면 C, 직전 연결이 있었으면 R |
| `PROJECT_TRASH_EMPTIED` | `emptyProjectTrash` → 하위 자산/디렉터리 제거 및 실제 참조 해제 | 제거 항목 있으면 T, CSV 제거면 C, 직전 연결이 있었으면 R |
| `ASSETS_IMPORTED` | `importProjectFilesToDirectory`, `importProjectFileToSlot` → 한 후보에서 선택을 적용하고 입력 순서로 `imported/replaced` 사실 기록 | 새 항목·CSV 교체·대상 연결 변경이면 T, 새 CSV일 때 C, `targetSlotId is not None`이면 R |
| `DATA_OBJECT_CREATED` | `createProjectCsv`, `createEmptyProjectCsv` → canonical 경로/id로 CSV 생성 | T/C |
| `DATA_OBJECT_REPLACED` | `graphEditorSetHeaderLines` → 같은 id/name/path의 CSV 내용 또는 헤더 교체 | T, 편집 중 해당 CSV 값 갱신; R/C 없음 |
| `DATA_OBJECT_DELETED` | `deleteProjectAsset` → CSV 제거 및 실제 object 제거·순번 대응 | T/C, 직전 실제 연결이 있었으면 R; 남은 편집 chart의 팔레트 갱신 |
| `IMAGE_OBJECT_CREATED` | `createProjectImage` → canonical 경로/id로 이미지 생성 | T |
| `IMAGE_OBJECT_REPLACED` | 독립 Public API caller 없음; `ASSETS_IMPORTED` 후보가 이 분기를 사용 → 같은 id/path의 바이트·MIME | 독립 분기 T/R/C 없음; 배치 결과는 `imported/replaced`, 해당 이미지 표시만 갱신 |
| `IMAGE_OBJECT_DELETED` | `deleteProjectAsset` → 이미지 제거, 해당 슬롯의 id를 None으로 | T, 직전 실제 연결이 있었으면 R |
| `SLOT_TYPE_CHANGED`, `SLOTS_RESET` | `setSlotContentType`, `resetSlotApi` → 종류 전환 또는 슬롯 초기화 | R, 대상 자산 연결이 바뀌면 T |
| `SLOTS_SWAPPED` | `swapSlots` → 좌표/id 유지, content/caption 교환 | R, `layout()`, T/C 없음 |
| `SLOT_IMAGE_LINKED` | `connectProjectAssetToSlot` → 기존 이미지 id 연결 | R, 이전/최종 대상 자산 연결이 다르면 T |
| `SLOT_IMAGE_SETTINGS_CHANGED` | `applyImageSettingsFromValues` → 슬롯 로컬 이미지 설정만 변경 | 현재 슬롯 설정, 같은 이미지의 바이트 재조회 없음; T/R/C 없음 |
| `SLOT_DATA_CONNECTED` | `connectProjectAssetToSlot`, chart 없는 `graphEditorAdd` → CSV로 graph object 연결 | T/R |
| `SLOT_IMAGE_IMPORTED` | `insertEmptyImageIntoSelectedSlot` → 이미지 생성 및 슬롯 연결 | T/R |
| `SLOT_CHART_IMPORTED` | `importProjectAssetFiles`, `importSelectedGraphFile` → FFSX/Plotly 모델 적용 | R; 생성 자산 또는 연결 변경이면 T, 새 CSV면 C |
| `GRAPH_OBJECTS_REPLACED` | `graphEditorAdd`, `graphEditorDelete`, `graphEditorMove`, `graphEditorObjectValues`, `graphEditorApplyPalette` → `buildGraphCommandCandidate`의 아래 5개 분기 | 아래 표 |
| `CHART_LAYOUT_CHANGED` | `graphEditorUpdateLayout` → 제목·전역·축 설정 합치기 | 편집 중 chart의 `graphs.readLayout`과 목록의 제목 접두부; T/R/C 및 팔레트 읽기 없음 |
| `CHART_MODEL_REPLACED` | `graphEditorSetEditable` → 표현 전환, 임베디드 자료 보존 | R, 새 자산/연결 차이면 T, 새 CSV면 C; 해당 graph의 데이터·레이아웃·팔레트 |
| `GRID_LAYOUT_CHANGED`, `SLOTS_MERGED`, `SLOTS_SPLIT` | `setLayoutApiGrid`, `mergeSlots`, `splitSlots` → visible 슬롯 구조·ownership 및 선택 보정 | R, `layout()`; 대상 연결이 바뀌면 T, C 없음 |
| `LAYOUT_STYLE_CHANGED` | `setLayoutApiStyle` → layout 스타일 적용 | `layout()`만; T/R/C 없음 |
| `CAPTION_TEXT_INPUT`, `SLOT_CAPTIONS_INSERTED`, `CAPTION_SETTINGS_CHANGED` | `setGlobalCaptionText`/`setSlotCaptionText`, `insertSlotCaptionsIntoGlobalCaption`, `setCaptionsApiEnabled`/`setCaptionsApiName`/`setCaptionsApiNameBold`/`setCaptionsApiSettings` → 본문·합성·설정 | `captions(event, changed.slotIds)`; T/R/C 없음 |
| `LABEL_SETTINGS_CHANGED`, `LABEL_POSITION_CHANGED` | `setLabelsApiEnabled`/`setLabelsApiSettings`, `setLabelsApiPosition`/`resetLabelsApiPosition` → 레이블 설정/위치 | `labels(event)`; T/R/C 없음 |
| `APPEARANCE_CHANGED`, `EXPORT_SETTINGS_CHANGED` | `setAppearanceApiPalette`, `setExportSettings` → 팔레트/출력 설정 | 전자는 wrapper가 최종 팔레트 적용, 후자는 `printSettings()`; T/R/C 없음 |

| `GRAPH_OBJECTS_REPLACED` operation | 후보에서 확인한 사실 → 표시 |
| --- | --- |
| `graphs.addObject` | 기존 chart에 새 object 추가 → T/R, 해당 chart 데이터·팔레트 |
| `graphs.deleteObject` | 지정 순번 제거, 빈 배열 허용 → T/R, 해당 chart 데이터·팔레트 |
| `graphs.moveObject` | `[A,B]`의 0→1이면 `[B,A]`, 순번 대응 `[1,0]` → R 1회, T/C 0회. 같은 위치로 이동은 미반영 |
| `graphs.setObjectValues` | 같은 index의 직전/최종 object에서 채택된 `csvId` 비교. 선 굵기만 변경하면 T/R/C 0회, A→B면 T/R 1회씩 및 C 0회. 잘못된 요청 `csvId`에 기존 A를 유지하면 CSV 교체 분기에 들어가지 않는다 |
| `graphs.applyPalette` | 색만 바꾸고 순번 힌트 생략 → 해당 chart 데이터·팔레트, T/R/C 0회 |

추가 경로 대조:

- **슬롯 0 및 공유 자료:** 슬롯 0/1을 교환하되 서로 다른 두 자산이 연결된 상태에서, 좌표와 총 참조와 무관하게 R만 1회다. `targetSlotId=0`의 raw import는 None과 구분한다. 선택 슬롯의 링크가 A→B로 바뀌면 다른 chart가 A를 계속 참조하더라도 표시를 갱신한다. 병합·분할·그리드 변경은 자산이 없는 행을 포함해 R을 호출한다. 대상 링크 배열은 중복을 유지해 같은 CSV를 두 번 쓰는 경우 하나의 연결 제거도 구분한다.
- **공유 CSV 교체/이동:** A를 쓰는 여러 chart에 대해 내용만 교체하면 같은 A의 경로와 연결이 남아 T 1회, R/C 0회다. A가 있는 디렉터리를 이동하면 루트 및 자손 기록에서 A의 canonical 경로와 직전 연결을 찾으므로 T/R/C 각 1회다. 휴지통 진입은 같은 후보 안에서 연결을 제거하고 기존 선택을 보정한다. 이후 비우기에서 제거할 CSV가 있어도 직전 연결이 이미 없다면 T/C만 실행한다. 비우기 직전 아직 연결이 있으면 R도 실행한다.
- **프로젝트 교체 및 최초 표시:** 새 workspace로 편집기를 강제 초기화한다. 방금 읽은 CSV 옵션 배열을 그대로 넘기며 빈 배열도 조회 완료로 취급한다. 같은 슬롯을 편집기 갱신으로 넘길 때 이미 읽은 Slot을 재사용한다. `FastFigureApp`에서 graph component가 mount/render만으로 옵션·레이아웃·팔레트를 다시 읽지 않도록 책임을 한 경로에 명시했다.
- **수명:** `sourcescript/system.py`는 mount 완료 후 현재 상태·디버그 값과 로그를 한 번 전달하고 unmount 전에 연결을 지운다. `sourcescript/frontend/renderer.py`의 상태 변경은 자기 setter만 호출한다. 로그 추가/지우기는 로그 setter만 호출하며 프로젝트 조회는 없다. 닫힌 미리보기에는 resize 입력이 없고, 열린 외부 영역이 같은 가로 너비로 세로만 변하면 `layout.readState`를 호출하지 않는다. 가로 변경은 새 너비를 넘긴다. Sidebar 및 브라우저 크기 이벤트는 내용 조회나 Plotly 재렌더 대신 CSS 변환으로 이어지며 스크롤은 브라우저 배치를 사용한다. renderer는 이미 표시 요청을 받은 슬롯에서 host DOM identity·종류·소유 id 세 값이 같을 때만 surface를 재사용한다. 소유 교체는 그 슬롯의 이전 자원만 해제하며 workspace 종료의 이전 작업 무효화는 유지한다.

## 2. 프로젝트 목적 부합

자산 트리·슬롯 연결·CSV 옵션은 의미가 다른 조회이므로 분리했다. UI를 새로 읽을지 결정하는 경로는 성공한 명령과 이번 결과로 고정했다. 타이머, 새 프로젝트 감시 표, UI를 위한 전역 참조 수 비교, 새 공개 명령을 넣지 않았다. 삭제 확인/반환 수치, 실제 트리에 표시하는 참조 수, renderer 무효화 판정은 기존 역할이 있어 보존했다. 디버그 저장 계약(감사, 로그 키, 500줄, 다운로드 이름 및 URL 해제)을 기존 `sourcecode/frontend/renderer.js`와 대조했다.

## 3. 중복 및 통합 판단

명령의 동일 사실을 여러 component에서 다시 해석하는 대신 adapter에서 표시 종류별 실행 여부를 한 번 결정한다. UI는 전달받은 결과와 이 mount의 표시 identity로 초기화/유지를 구분한다. 옵션 배열은 한 작업 안에서만 재사용하며 독립 cache로 보관하지 않는다. 같은 슬롯의 표시 위임에서 toolbar와 grid layout 미리보기의 중복 호출을 제거했다. Backend의 실제 참조 해석은 `collectAssetReferences`와 `graphs.chartUsesConversionView`의 공용 규칙을 사용한다. 반면 target의 링크 변화(트리), renderer projection 효과(기존 표시), 삭제 참조 수(기존 반환)는 다른 질문이므로 하나의 범용 변경 스냅샷으로 통합하지 않았다. status/debug의 mount 계약과 영속 명령의 UI 계약도 별개로 유지했다.

검증 방식: Source Script Python 명세 15개 AST 파싱, 명령 등록 34개/그래프 operation 5개와 호출 표 대조, `git diff --check`, 레이어 버전 검사. 이 명세 검토는 브라우저에서의 호출 횟수·resize·Plotly 자원 수명 검증을 대신하지 않는다. 다음 레이어에서는 판단·호출 순서를 그대로 번역한 뒤 따로 검증한다.
