# Plan045 Source Script 57 → pseudocode 검토

## 범위와 판단

Source Script 57의 API별 필요 필드 구성과 호출자 변경을 pseudocode 34에 번역했다. API 경계 안에서 먼저 대상과 필드를 정하며, 큰 결과를 만든 뒤 UI에서 잘라 쓰는 경로를 제거했다. 이 기록은 정적 대응 검토이며 실행 성능의 측정 결과는 아니다.

| 작업 단위 | 실제 대응 |
|---|---|
| Backend 그래프 읽기 | `BuildGraphEditorRead`는 목록용 편집 필드와 단일 control을 분리한다. chart는 id/title/editable, CSV는 id/path/name/headerLines/전체 rowCount만 구성한다. figure·rows·bytes·열 정의는 포함하지 않는다. 명시적 chart 소유 슬롯의 visibility와 CSV id의 None/0 처리를 유지한다. |
| 명시적 데이터 소비 | `ReadExplicitColumns`만 선택 CSV 또는 기존 raw conversionRows에서 열 정의를 계산한다. `ReadBoundedPreview`는 범위를 검증한 뒤 최대 30행만 복사한다. |
| 자산 표시 | `AssetMetadata`/`BuildVfsRead`는 표시 필드와 참조 수만 구성한다. 휴지통은 범위를 먼저 고르고, 목록은 id/path/name만 반환한다. 삭제 확인은 대상 메타데이터와 필요한 참조 식별자만 반환한다. |
| 나머지 목적 조회 | slots.readDisplay, images.readSettings, layout.readControls, captions.readSettings, labels.readSettings를 등록·구현·공개 바인딩에 연결했다. 이미지 bytes/label geometry/preview는 실제 표시 요청에만 남겼다. |
| Application/성공 반환 | renderer 너비는 layout.readControls로 조회한다. 그래프·레이아웃 변경 후 성공 반환도 좁은 조회를 사용하며 헤더는 명시 csvId로 확인한다. 취소·미반영·원래 오류는 유지한다. |
| 공통 UI 객체 | readCurrent가 target/value/companions/ready를 한 판정에 제공한다. commit/send/step은 그 판정의 값만 내부 sendCurrent에 전달한다. same-value 처리에 추가 조회·명령이 없으며 Enter 후 blur, IME, async 정리·원래 오류 우선순위를 유지한다. |
| UI 소비자 | 54개 숫자 필드와 버튼, 트리·CSV 선택 목록·열 선택·열린 preview·이미지/label/caption/layout 설정을 목적 조회에 연결했다. metadata 노드에서 제거한 fixed/trashed 가정은 기존 boolean API로 확인한다. |
| 구독과 테마 | 필요한 값의 primitive snapshot과 안정된 구독 함수를 사용한다. 구조 key에는 화면·선택 식별자·lifecycle만 넣고, theme/CSS의 재사용은 component-local 표시 구성에 한정한다. |

## 확인한 파일

- `sourcescript/backend/project_state.py`와 `pseudocode/backend/project_state.pcal`: query 등록과 operation별 반환·구성 순서.
- `sourcescript/application/public_api/__init__.py`와 `pseudocode/application/public_api/contract.pcal`: 공개 바인딩과 현재 식별자 전달.
- `sourcescript/application/adapter.py`와 `pseudocode/application/adapter.pcal`: 표시 너비의 좁은 읽기.
- `sourcescript/application/public_api/graphs.py`, `sourcescript/application/public_api/layout_annotations.py`와 대응 pseudocode: 성공 반환·헤더 확인.
- `sourcescript/frontend/mantine_ui.py`와 `pseudocode/frontend/mantine_ui.pcal`: 공통 객체·목적 구독·소비자 연결. 자산 wrapper는 좁아진 target 메타데이터를 그대로 반환하는 기존 pseudocode를 유지했다.

## 논리·목적·중복 확인

- 같은 현재 Backend 소유자에서 필요한 필드를 구성한 다음 반환을 분리한다. 반환에는 Project/asset/chart 본문이나 장기 공유 읽기 저장소를 추가하지 않는다.
- CSV 표시 rowCount는 header를 제외한 데이터 행 수이며, 헤더 입력의 currentCsv.rowCount는 전체 행 수다. 기존 저장 형식과 정규화 경계는 유지한다.
- 참조 수는 조회당 한 수집과 로컬 집계로 구성한다. 읽기 전용 반환의 identity 방문 집합은 해당 호출에서만 사용한다.
- 기존 명령의 candidate·현재 원본 재검증·전체 검증·한 번 반영·참조 보정은 변경하지 않았다. 명령 내부 중복 복사/검증 최적화는 이번 번역에 섞지 않았다.
- selected-slot 자동 표시, 명시적 전체 렌더링, CSS 크기/위치 변환, 내보내기와 자원 수명 경계는 유지했다.

## 확인과 한계

전체 실제 구현 diff와 후속 수정 차이를 읽었다. 15개 pseudocode 파일의 procedure 경계, API 등록/호출 대응, hash·메타데이터 변경 범위·보호 경로·native patch 역적용을 정적으로 확인했다. PlusCal 변환·TLC·테스트·앱·브라우저·빌드·checker main·commit/push는 실행하지 않았다. Source Script와 source code의 의미·실행 일치 및 속도 개선을 실행으로 입증한 기록은 아니다.
