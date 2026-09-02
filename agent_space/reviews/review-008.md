# review-008 — 파일 roundtrip / 구버전 호환성 정적 감사

## 목적

`plan-005.md`가 구버전 호환성을 반드시 보장하도록 지정한 파일 관련 범위를 Mantine cutover 전에 정적으로 감사한다.

이번 문서는 실행 브라우저 테스트가 아니라 코드/패치 경로 감사다. 실제 파일을 저장한 뒤 다시 불러오는 런타임 회귀 테스트는 별도 단계로 남긴다.

## 기준본과 package format

업로드된 기준본 `Fast-figure_v1-1-27-alpha(1).html`의 `PACKAGE_FORMAT_VERSION`은 이미 `3`이다.

현재 `1.1.103-alpha`도 `PACKAGE_FORMAT_VERSION = 3`을 유지한다.

따라서 현재 프로젝트가 실제 이전 기준으로 삼아 온 v1.1.27-alpha 계열과 현재 FFPX/FFSX package format version은 동일하다.

현재 XML reader는 각 document root의 `version`이 `PACKAGE_FORMAT_VERSION`과 정확히 같아야 통과시키므로, format version 자체를 바꾸는 patch는 구버전 호환성 변경으로 취급해야 한다.

최근 Mantine patch `067`~`071`은 package version/schema/XML reader를 변경하지 않았다.

## FFPX

### 저장 경로

기준본의 `ffpxBuildProject()`는 다음을 하나의 project package로 저장한다.

- project metadata / project name
- layout grid / placements / slot style
- labels
- caption
- CSV assets
- image assets
- charts
- slots
- UI palette

CSV와 image binary는 manifest 안에 직접 중복 저장하지 않고 asset path를 통해 package에 포함한다.

chart가 trash 상태 CSV를 참조하거나 slot이 유효하지 않은 image를 참조하면 export 전에 오류 처리한다.

### 불러오기 경로

`ffpxReadProject()`는 다음을 확인한다.

- `project.xml`
- `assets/assets.xml`
- `layout/layout.xml`
- `caption/caption.xml`
- `labels/labels.xml`
- 각 slot XML
- XML root / package version
- CSV/image asset 존재

읽은 뒤 `ProjectObject.fromFFPX(...)` → `PROJECT_LOADED` 경로로 들어간다.

### Mantine 영향 판정

project file selection은 이미 `loadProjectFiles(fileList)` 공통 loader 경계로 분리되어 있고, project name도 공통 setter를 사용한다.

최근 graph/sidebar Mantine patch는 FFPX build/read/import 본문을 수정하지 않았다.

판정: **정적 구조상 호환성 변경 없음**.

## FFSX

### 저장 경로

`ffsxBuildSlot(slot, chart)`는 선택 chart가 참조하는 CSV만 추출하고 package 내부 CSV ID를 1부터 재매핑한다.

- chart 자체의 외부 project chart ID는 제거
- graph object `csvId`는 package-local CSV ID로 변환
- slot caption 포함
- CSV binary asset 포함
- schema: `fast-figure-slot`
- version: `PACKAGE_FORMAT_VERSION`

이는 project 전체 ID 공간을 FFSX 파일에 그대로 의존시키지 않는 구조다.

### 불러오기 경로

`ffsxReadSlot()` / `importSlotFile()`은:

- ZIP이면 FFSX reader 사용
- JSON이면 Plotly 후보로 처리
- FFSX schema/version/chart/CSV rows 검증
- chart model validation
- `SLOT_CHART_IMPORTED` event로 현재 slot에 설치

FFSX import 시 package CSV/project chart ID가 현재 project에 맞게 다시 연결되는 기존 import 경로를 그대로 사용한다.

### Mantine 영향 판정

`070/071`의 Mantine component는 새 parser/exporter를 만들지 않고 기존 `downloadSlotFfsx()`와 `importSlotFile()`을 직접 재사용한다.

판정: **파일 의미 단일 source 유지 / 정적 호환성 변경 없음**.

## Plotly JSON

내보내기는 기존 `chartFigure(chart)` 결과를 `downloadJsonFile()`로 저장한다.

불러오기는 FFSX schema가 아니면서 Plotly의 `data/layout/config/frames` 형태를 가진 JSON을 `parsePlotlyToEditor()`로 변환한다.

imported Plotly는 최초 `editable = false` 상태를 유지하고, 사용자가 편집 가능 모드로 전환하면 `067`의 공통 command가 기존 conversion 경로를 재사용해 project CSV-backed editor로 전환한다.

`067`은 conversion algorithm 자체를 변경하지 않았다.

판정: **interoperability 의미 유지**.

## graph palette JSON

기존 의미는 다음 두 형태를 허용한다.

- top-level color array
- `{ colors: [...] }`

색상은 `#RRGGBB` 형식만 유효하게 취급한다.

`044/045`에서 parser를 `parseGraphPaletteText()`로 공통화했고, `046~048`과 현재 Mantine palette UI는 같은 parser와 graph color mutation command를 재사용한다.

판정: **기존 저장/불러오기 의미 유지**.

## 최근 graph file actions 이식 감사

### 067

imported Plotly editable 전환의 domain 작업과 legacy DOM sync를 분리했다.

- file schema 변경 없음
- chart conversion algorithm 변경 없음
- FFSX/Plotly export 변경 없음

### 069

`selectedGraphFileActionsModel()`은 slot/chart ID와 action availability만 반환한다.

file contents나 chart clone을 새로운 source로 저장하지 않는다.

### 070/071

Mantine visible controls가 기존 file command를 호출한다.

file picker만 hidden native input adapter를 사용한다.

따라서 Mantine UI가 별도 FFPX/FFSX/Plotly parser 또는 writer가 되지 않는다.

## 현재 정적 판정

현재까지 확인한 범위에서 Mantine migration 때문에 파일 format/schema/validation이 이중 구현되거나 변경된 문제는 발견하지 못했다.

v1.1.27-alpha 기준본과 현재는 package format version `3`을 공유하므로 해당 계열 파일에 대한 format-version 수준의 호환성은 유지되고 있다.

다만 이것은 **실제 roundtrip 성공을 증명하는 실행 테스트가 아니다**.

## cutover 전 실행 회귀 체크리스트

최소한 다음 시나리오는 실제 브라우저에서 확인해야 한다.

1. v1.1.27-alpha에서 만든 FFPX를 현재 버전에서 load
2. 현재 버전에서 동일 project를 FFPX save → reload
3. CSV + image + graph + merged slot + label + caption을 모두 포함한 FFPX roundtrip
4. 빈 image/빈 graph slot이 포함된 project roundtrip
5. graph 한 slot FFSX export → 다른 빈 slot에 import
6. 복수 CSV를 참조하는 graph object FFSX roundtrip
7. imported Plotly JSON → 원본 표시 → 편집 가능 전환 → FFPX save/reload
8. Plotly JSON export → 다시 import
9. palette save → palette load
10. file import 실패 후 같은 파일 재선택 가능 여부

## 다음 단계

- 가능하면 위 실행 테스트를 자동/반자동으로 수행할 수 있는 최소 test harness를 준비한다.
- 그 전까지 package format/schema 변경은 금지한다.
- 실행 회귀에서 파일 의미 문제가 나오지 않으면 다음 구조적 blocker인 React shell 초기화 순서와 active ownership cutover를 감사한다.
