# Plan039 — 파일 가져오기·팔레트 입력 계약 수정

## 범위

- 수정 전 커밋: `b729c3d96834bff9baedcaaa8bb603c3558a2c24`.
- 기준 계획: `../plans/plan-039.md`. 기존 계획·검토 기록은 보존했다.
- Source Script 54, pseudocode 31. source code 160은 실제 파일을 유지하고 수정 계약과의 대응을 재확인했다.

## R01 — 파일 가져오기

- `sourcescript/backend/assets_files.py`의 `buildProjectAssetImportCandidate` 입력은 파일 순서의 `path`·`replaceId`다. Application의 `assets.resolveImportPlan` 결과가 그대로 명령에 전달된다. 취소는 명령 호출 전에 끝난다.
- 파일 수·입력 수·형식, canonical 경로·부모 디렉터리·작업 내 중복, 현재 경로의 자산 종류와 id를 검사한다. 생성 경로는 비어 있어야 하며 교체 대상은 선택 당시 id와 같아야 한다. 실패 시 후보를 거부한다.
- 후보 안의 파일 처리·참조 연결, 전체 검증·현재 권위 재확인·한 번 반영을 유지했다.
- `pseudocode/backend/assets_files.pcal`의 `BuildAssetImportInAttempt`에 개수 검사를 명시하고 경로·대상 검사 뒤 파싱하도록 순서를 맞췄다. 기존 확정 경로 소비를 유지했다.
- `sourcecode/backend/assets_files.js`의 `buildProjectAssetImportCandidate`는 이미 같은 검사를 수행한다. 실행 단계에 `mode`나 추가 선택을 요구하는 코드를 넣지 않았다.

## R02 — 팔레트 입력 연결

- 전체 표시 입력: `dispatchProjectCommand` → 참조 보정 → `dispatchProjectQuery("renderer", request)` → `readBackendProjection("renderer", request)` → 튜플의 `rendererProjection`.
- `rendererProjection.appearance.uiPalette`는 같은 프로젝트의 팔레트 복사이고, `rendererProjection.visibleSlots[].figure`는 같은 조회에서 `graphs.chartFigure(chart, project)`가 계산한 표시 입력이다.
- `setAppearanceApiPalette`는 반영 뒤 튜플의 결과·최종 Frontend 상태·전체 renderer 입력을 `applyDashboardProjectionInvalidation`에 전달한다. 새 조회를 중복 수행하지 않는다.
- 해당 renderer는 CSS 팔레트와 현재 그래프의 Plotly 표시를 갱신한다. host 변경이면 기존 전체 표시 경로를 사용한다. generation·host·chart 확인과 실패 처리를 유지한다.
- `applyUiPalette`는 기존 CSS 함수로 유지했다. 인자는 부분 `ui-palette` 조회 결과 또는 전체 조회 결과의 `appearance.uiPalette`다. 그래프 적용 책임은 기존 `applyDashboardProjectionInvalidation`에 명시했다. Plan039 R02의 목적을 기존 두 함수의 역할 분담으로 구현하여 인자 변경·중복 그래프 갱신을 피했다.
- Source Script의 Application/Backend/renderer 설명과 pseudocode의 공개 wrapper/renderer 분기를 함께 맞췄다. 실제 source code의 `applyUiPaletteValues` → `applyCommittedDashboardProjection` → `applyDashboardProjectionInvalidation`는 이미 이 경로를 수행하므로 유지했다.

## 논리·목적·비중복 확인

- 생산자가 확정한 경로·id와 소비자의 검증 입력이 일치한다. 같은 후보의 현재 대상 검사 뒤 한 번 반영한다.
- 두 보류 사유인 실행 단계의 선택 재요구와 팔레트 표시 입력의 출처 누락을 수정했다.
- 새 query/API/저장 필드/상태 소유자를 추가하지 않았다. CSS 함수와 기존 Plotly 갱신 절차를 재사용했다.

## 정적 확인과 한계

- 실제 전체 Git diff, Source Script의 AST 문법, 세 계층 fingerprint, 변경 범위와 native patch의 reverse 적용 가능성을 확인했다.
- source code·dist·settings·verification·scripts·기존 계획/검토 문서는 유지했다. source code 160의 fingerprint는 그대로다. 메타데이터의 Source Script/pseudocode 참조와 검토 링크만 새 계약에 맞췄다.
- 테스트·앱·브라우저·빌드·TLC·checker main은 실행하지 않았다. 런타임 성공이나 전체 계층의 closure를 주장하지 않는다. 상태 `stale`과 Source Script `open`을 유지했다.
