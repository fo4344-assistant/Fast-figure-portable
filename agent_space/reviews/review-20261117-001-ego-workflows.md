# ego-browser 워크플로우 실행 결과

- 계획: `agent_space/plans/plan-034.md`
- 실행 시작: 2026-11-17 10:58 +09:00. HEAD `9991697cf25c29ceb051c91779dc506331d6a7ba`; 기존 미커밋 source code 158을 포함한 작업 트리.
- 실행 파일: 별도 출력으로 빌드한 inline `Fast-figure.html`, SHA-256 `9297ebfcdac4b027e3a5928238a15800f88ac9d10e381e12f1e6cb5780d1cb96`.
- 각 결과는 실제 실행 직후 갱신한다. 아직 기록하지 않은 워크플로우는 NOT RUN이다.

## WF01 — inline 시작

- 결과: **PASS** (초기 화면 관찰 범위).
- 입력/과정: 현재 작업 트리로 만든 inline HTML을 ego-browser에서 열고 전체 화면 구조를 확인했다.
- 관찰: 준비됨, 디버깅 켜기 버튼, 빈 슬롯 4개와 2×2 좌표가 표시됐다. 오류 overlay는 관찰되지 않았다.
- 한계: 최초 화면 관찰이며 장시간 렌더링이나 다른 기능의 성공을 의미하지 않는다.

## WF03 — CSV 입력

- 결과: **PASS**.
- 입력/과정: reload 후 파일 선택기로 `series.csv`를 추가하고 CSV 트리와 slot 0에서 데이터 선택 화면을 확인했다.
- 관찰: `series.csv`, 5행, 참조 0과 `C1 — Time`, `C2 — Signal`, `C3 — Control`이 표시됐다. 초기 선택 상태의 공개 읽기는 chart와 currentCsv가 모두 null이었다.
- 입력 SHA-256: `52c9f7085e6c0c8daeede87358e8d1d8e25407fad64cfff19661f2e368b10e8f`.

## WF04 — TSV 입력

- 결과: **PASS**. 파일 선택기로 `series.tsv`를 추가하고 slot 0에서 미리보기를 열었다.
- 관찰: 자산 `series.tsv`는 5행·참조 0, 열은 Time/Signal/Control이며 다섯 숫자 행이 입력값과 일치했다.
- 입력 SHA-256: `1c08e4178a94529104073c3a7f7f33a0f277c7a81b63949f568f9732f485f184`.
- 도구 기록: 첫 재시도는 이전 TaskSpace 4가 없어 실패했다. 새 TaskSpace 5에서 실제 파일 선택을 수행했다. 이는 앱 오류가 아니다.

## WF05 — 배열 JSON 입력

- 결과: **PASS**. 파일 선택기로 `arrays.json`을 추가하고 slot 0에서 미리보기를 열었다.
- 관찰: 자산 이름, 3행·참조 0, Time/Signal 두 열과 세 숫자 행이 표시됐다. 선택 자산 다운로드의 SHA-256이 입력과 일치했다.
- 입력 SHA-256: `0ac12b8133196407e7b03600db9c5fc35f3cad4bb643e368a5ae104133a4cefc`.

## WF06 — 객체 JSON 입력

- 결과: **PASS**. 파일 선택기로 `records.json`을 추가하고 slot 0에서 미리보기를 열었다.
- 관찰: 3행·참조 0, Time/Signal/Extra 순서와 두 행의 빠진 Extra 빈 칸, 중간 행의 `x`가 표시됐다.
- 입력 SHA-256: `3014dbe5f8c72d0be5f9ccf42672ffe42daf88c7af1201ef96d3f9d6365f9e20`.

## WF07 — 인용 CSV

- 결과: **PASS**. 빈 프로젝트에서 `quoted.csv`를 파일 선택기로 추가하고 slot 0에서 그래프를 추가했다.
- 관찰: UI 미리보기에 쉼표, 따옴표, 중간 빈 행이 표시됐고, 공개 읽기에서 인용된 줄바꿈 `line\nbreak`이 보존됐다. 생성된 object는 X=C1, Y=C3이며 실제 graph 데이터는 X `[0,1,2,3]`, Y `[2,4,6,8]`로 빈 행을 제외했다.
- 입력 SHA-256: `8b0e88621726fbea6449a752ea8ea2b67e4c4fcd7f88d6e91127422a437de229`.
- 공개 API는 관찰에만 사용했다.

## WF08 — 빈 delimited 자료

- 결과: **PASS**. LF 1 byte인 `empty-lines.csv`를 UI로 추가하고 slot 0에서 graph object를 추가했다.
- 관찰: 자산은 0행으로 표시됐고 공개 읽기에서 rows `[]`, object의 X/Y 모두 빈 문자열, 실제 데이터 점 0개였다. 축 placeholder는 빈 배열로 유지됐다.
- 입력 SHA-256: `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b`.
- 공개 API는 관찰에만 사용했다.

## WF09 — 첫 graph 생성

- 결과: **PASS**. UI로 생성한 D 프로젝트를 reload 후 열고 slot 0과 `series.csv`를 선택한 뒤 오브젝트 추가를 클릭했다.
- 관찰: 공개 읽기에서 chart id 1과 object 1개, 실제 trace X `[0,1,2,3,4]`, Y `[0,2,4,3,5]`를 확인했다. 공개 API는 관찰에만 사용했다.
- 시작 checkpoint: `D.ffpx`, SHA-256 `a1062575b7fa18229def98630a19185b27129dc72a88ee3e8950156a423b1f71`.

## WF10 — 키보드로 graph object 추가

- 결과: **PASS**. UI로 만든 G 프로젝트를 reload 후 열고 slot 0과 `series.csv`를 선택한 뒤 추가 버튼에 Enter를 보냈다.
- 관찰: 시작 시 CSV 참조 2개였고, 공개 읽기에서 chart id 1의 object가 2개에서 3개로 증가했다. 공개 API는 관찰에만 사용했다.
- 시작 checkpoint: `G.ffpx`, SHA-256 `798dee792fac9f8dfabc2a6d46b747c1a94e4caf1813313c44c84f85b314e742`.

## WF11 — 슬롯 선택 없는 보호

- 결과: **PASS** (노출된 UI 범위). D 프로젝트를 reload 후 열어 슬롯을 선택하지 않은 화면을 확인했다.
- 관찰: graph object 추가 및 slot 파일 불러오기 버튼은 표시되지 않았다. 공개 읽기에서 선택 슬롯은 null이고 네 슬롯의 chart 참조는 모두 null이었다.
- 시작 checkpoint: `D.ffpx`, SHA-256 `a1062575b7fa18229def98630a19185b27129dc72a88ee3e8950156a423b1f71`.
- 공개 API는 관찰에만 사용했다.

## WF12 — 현재 CSV로 graph object 추가

- 결과: **PASS**. G를 reload 후 복원하고 slot 0에서 `headerless.csv`를 선택해 object를 추가했다.
- 관찰: 기존 두 object의 CSV id 1은 유지되고 세 번째 object는 CSV id 2를 참조했다. 세 번째 trace X `[0,1,2]`, Y `[10,20,30]`을 공개 읽기로 확인했다.
- 시작 checkpoint: `G.ffpx`, SHA-256 `798dee792fac9f8dfabc2a6d46b747c1a94e4caf1813313c44c84f85b314e742`.
- 공개 API는 관찰에만 사용했다.

## WF13 — graph object의 Y 열 변경

- 결과: **PASS**. G를 복원해 slot 0의 첫 object에서 Y 열을 Control로 변경했다.
- 관찰: 첫 trace의 Y가 `[1,1.2,1.4,1.3,1.5]`이고 두 번째 trace의 Y `[0,2,4,3,5]`는 유지됐다. 공개 API는 관찰에만 사용했다.
- 시작 checkpoint: `G.ffpx`, SHA-256 `798dee792fac9f8dfabc2a6d46b747c1a94e4caf1813313c44c84f85b314e742`.
- 도구 기록: 첫 클릭은 화면 밖 요소로 인해 실패했다. snapshot과 screenshot으로 상태를 확인하고 사이드바를 스크롤한 뒤 한 번 재시도했다. 앱 오류로 집계하지 않았다.

## WF14 — object CSV 전환

- 결과: **PASS**. G를 복원해 첫 object의 CSV를 `headerless.csv`로 변경했다.
- 관찰: 첫 object의 CSV id 2와 C1/C2, X `[0,1,2]`·Y `[10,20,30]`이 표시됐고, 두 번째 object의 CSV id 1과 기존 5점은 유지됐다. 독립 currentCsv는 id 1로 유지됐다.
- 시작 checkpoint: `G.ffpx`, SHA-256 `798dee792fac9f8dfabc2a6d46b747c1a94e4caf1813313c44c84f85b314e742`.
- 공개 API는 관찰에만 사용했다.

## WF15 — object 표현 유형

- 결과: **부분 확인**. G의 첫 object를 선→마커→막대로 변경했다. 마커·막대 기본 경로는 통과했으며 계획의 독립 선/선+마커/숨김 변형은 미실행이다.
- 관찰: 표시 trace가 각각 `scatter/markers`, `bar`로 바뀌고 두 object 모두 CSV id 1과 `[0,1,2,3,4]`/`[0,2,4,3,5]` 데이터를 유지했다. 두 번째 trace는 선으로 남았다.
- 시작 checkpoint: `G.ffpx`, SHA-256 `798dee792fac9f8dfabc2a6d46b747c1a94e4caf1813313c44c84f85b314e742`.
- 공개 API는 관찰에만 사용했다.

## WF16 — object 순서 변경

- 결과: **부분 확인**. G의 첫 object 범례를 `First`로 지정한 뒤 둘째 행을 첫째 행으로 UI drag했다.
- 관찰: object 순서가 `First, 기본`→`기본, First`, trace 범례도 `C2, First`로 바뀌었다. 두 object의 CSV id 1은 유지되고 selectedIndex 0에서 편집기의 범례 이름도 빈 값으로 바뀌었다. 공식 참조 수는 직접 조회하지 않았다.
- 시작 checkpoint: `G.ffpx`, SHA-256 `798dee792fac9f8dfabc2a6d46b747c1a94e4caf1813313c44c84f85b314e742`.
- 공개 API는 관찰에만 사용했다.

## WF17 — object 삭제

- 결과: **PASS**. G에서 두 번째 object를 삭제하고 남은 object를 선택해 범례를 `Remaining`으로 수정했다.
- 관찰: object 한 개와 해당 trace만 남았고 범례 변경이 반영됐다. 공개 자산 트리에서 series.csv id 1과 headerless.csv id 2는 모두 유지됐다.
- 시작 checkpoint: `G.ffpx`, SHA-256 `798dee792fac9f8dfabc2a6d46b747c1a94e4caf1813313c44c84f85b314e742`.
- 공개 API는 관찰에만 사용했다.

## WF35 — 행과 열 확장

- 결과: **PASS**. 빈 프로젝트를 reload한 후 레이아웃에서 열 2→3, 행 2→3으로 변경했다.
- 관찰: 공개 읽기에서 중간 상태는 2×3, 최종은 3×3이며 기존 id 0~3의 좌표가 유지됐다. 최종 선택 관련 합치기·나누기·선택 해제 버튼은 disabled였다.
- 공개 API와 DOM 읽기는 관찰에만 사용했다.

## WF36 — 열 확장

- 결과: **PASS**. UI로 저장한 빈 3×3 L 프로젝트를 reload 후 복원하고 열을 3→4로 변경했다.
- 관찰: 3×4, 표시 슬롯 12개, 기존 id 0~8의 좌표가 유지됐으며 열 4에 id 9~11이 추가됐다. 선택 관련 세 버튼은 disabled였다.
- 시작 checkpoint: `L.ffpx`, SHA-256 `e2b9af87f6c9d674b1a4e84d64fbfac23d894896e42eecdf1ec934c4f695304a`.
- 공개 API와 DOM 읽기는 관찰에만 사용했다.

## WF37 — 빈 행 입력 fallback

- 결과: **PASS** (프로젝트 배치 상태). L을 복원해 행 입력을 지우고 Tab으로 포커스를 옮겼다.
- 관찰: 공개 배치는 3×3과 9개 슬롯을 유지했고 열 입력도 3이었다. 입력 칸 자체는 blur 후 빈 상태로 남았다.
- 시작 checkpoint: `L.ffpx`, SHA-256 `e2b9af87f6c9d674b1a4e84d64fbfac23d894896e42eecdf1ec934c4f695304a`.
- 공개 API는 관찰에만 사용했다.

## WF38 — 빈 마지막 행 축소

- 결과: **PASS**. L을 복원해 행을 3→2로 변경했다.
- 관찰: 2×3으로 변경됐으며 마지막 행의 빈 slot id 6~8만 제거되고 id 0~5의 좌표가 유지됐다.
- 시작 checkpoint: `L.ffpx`, SHA-256 `e2b9af87f6c9d674b1a4e84d64fbfac23d894896e42eecdf1ec934c4f695304a`.
- 공개 API는 관찰에만 사용했다.

## WF40 — 빈 셀 병합

- 결과: **부분 확인**. L을 복원해 레이아웃에서 1,1과 1,2를 선택하고 병합했다.
- 관찰: 공개 읽기에서 표시 슬롯 8개, anchor id 0의 colSpan 2였고 id 1은 표시 목록에서 빠졌다. screenshot에서 첫 행 두 칸이 하나로 표시됐다. 병합 버튼은 disabled였고 나누기·선택 해제 버튼은 활성 상태로 anchor 선택이 남았다. 비표시 slot 내부의 hidden 필드는 이 읽기에서 직접 확인하지 못했다.
- 시작 checkpoint: `L.ffpx`, SHA-256 `e2b9af87f6c9d674b1a4e84d64fbfac23d894896e42eecdf1ec934c4f695304a`.
- 병합 checkpoint: `merged.ffpx`, SHA-256 `5fbffe85b616940a2fa1729b7f886f8697b8bd53413faedb24827aeb0be2c778`. 저장 파일의 placement는 anchor의 colSpan 2를 확인했으나 hidden 필드를 직접 나타내지는 않았다.
- 공개 API와 DOM 읽기는 관찰에만 사용했다.

## WF43 — 병합 슬롯 분할

- 결과: **부분 확인**. `merged.ffpx`를 복원해 anchor를 선택하고 분할했다.
- 관찰: 표시 슬롯 9개와 모든 slot의 1×1 span이 복원됐고 screenshot에서도 분할된 3×3 격자를 확인했다. 시작 anchor가 비어 있어 내용·캡션 보존은 이 실행에서 확인하지 못했다.
- 시작 checkpoint: `merged.ffpx`, SHA-256 `5fbffe85b616940a2fa1729b7f886f8697b8bd53413faedb24827aeb0be2c778`.
- 공개 API는 관찰에만 사용했다.
