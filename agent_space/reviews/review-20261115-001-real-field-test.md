# source code 157 실필드 테스트 결과

## 1. 대상·방법·판정

- 실행 기간: 2026-11-14 23:48 ~ 2026-11-15 00:24 KST.
- 기준 commit: `9e58bdf0381b62bb59068a44ca78d75be6edcaed`.
- 계층: Source Script 46 → pseudocode 26 → source code 157. 기존 `stale` 상태와 Source Script `open` 판정은 변경하지 않았다.
- 환경: Windows, ego-browser / Chrome 156.0.0.0, viewport 1637×916, TaskSpace 3.
- 기존 dist를 대신 검증한 것이 아니다. 현재 작업 파일에서 `scripts/build-portable.py`를 별도 출력 디렉터리로 실행하고, 생성한 inline HTML을 실제 `file://` 페이지로 열었다. split 배포본은 별도 페이지에서 시작만 확인했다.
- inline HTML SHA256: `3cd9bf09bceaf0473882f3083f358f433efcc986ef79597c2cba997d2316af6d`.
- 실제 포인터·키보드·파일 선택·다운로드 작업과 보조 public API 실험을 구분했다. 상태 관찰은 공개 read 경계를 사용했으며 Backend 내부 상태 주입이나 함수 교체를 하지 않았다.
- **판정: 전체 통과 아님. 핵심 UI 두 경로에서 실패를 재현했다. 선택 슬롯 참조 전달 누락이라는 공통 source code 경계 문제가 확인된다.**
- 사용자 지시대로 결함은 수정하지 않았다. Source Script, pseudocode, source code, 버전 메타데이터 및 tracked dist는 그대로다.

## 2. 재현된 문제

### F-01 — P1: 선택 슬롯 참조 누락으로 객체 추가와 슬롯 파일 불러오기가 막힘

#### A. ‘객체 추가’ 버튼 무반응

1. 시작 화면에서 `measurements.csv`를 실제 파일 선택기로 불러온다.
2. graph 슬롯과 CSV를 선택하고 graph 편집 영역을 연다.
3. 활성화된 ‘객체 추가’ 버튼을 클릭한다.
4. 최초 시도에서는 graph가 생성되지 않았다. 프로젝트 저장·재시작·복원 후에도 재현했다. 기존 객체 2개 상태에서 포인터 클릭과 Enter 입력 모두 객체 수가 `2 → 2 → 2`로 유지됐다.

기대: 선택된 슬롯에 선택 CSV의 graph 객체가 추가되어야 한다. 실제: 활성 버튼이 동작하지 않고 객체 수가 변하지 않는다. 사용자 graph 구성 작업을 차단한다.

증거: `../logs/20261114-001-field-test/02-add-object-ui.txt`, `02-add-object.png`, `11-add-object-retest.json`.

보조 진단에서 명시적 슬롯 ID를 준 `window.FastFigureApi.graphs.addObject(0, 1)`은 성공해 5개 점의 선 graph를 생성했다. **이는 UI 버튼 성공이 아니다.** 이후 정상 경로 시험을 계속하기 위한 보조 조작이며, 그 뒤 생성한 프로젝트에는 이 조작의 결과가 포함된다.

#### B. 실제 내보낸 FFSX를 선택 슬롯에 불러오기 실패

1. 기존 graph 슬롯에서 UI로 `11-graph.ffsx`를 다운로드한다.
2. 빈 visible 슬롯 `(row=1, col=3, id=6)`을 선택한다.
3. UI 슬롯 불러오기 파일 선택기에서 방금 다운로드한 파일을 선택한다.
4. UI에 `슬롯 불러오기 오류: 불러올 visible 슬롯이 없습니다.`가 표시된다.
5. 공식 선택 슬롯 read에는 id 6이 존재하지만 대상 슬롯은 `chart: null`, 객체 수 0으로 남았다.

기대: 선택 visible 슬롯에 슬롯 파일을 적용해야 한다. 실제: 존재하는 선택 슬롯을 전달하지 못해 불러오기가 거절된다. FFSX 재사용 경로를 차단한다.

증거: `../logs/20261114-001-field-test/11-graph.ffsx`, `12-ffsx-reopen.json`, `12-ffsx-failure-ui.txt`, `12-ffsx-failure.png`.

FFSX ZIP에는 `slot.xml`, `assets/assets.xml`, 두 CSV 원본이 들어 있고 표준 `zipfile.testzip()` 결과는 `None`이었다. 이는 CRC 검사 결과이지 파일의 모든 의미 조건 통과 증명은 아니다.

#### 공통 경계 원인 — 관찰과 source code 대조

- `sourcecode/frontend/mantine_ui.js:167-172`: `getAppStateSnapshot()`은 `appFSM.state`를 반환한다.
- `sourcecode/application/adapter.js:187`: 해당 getter는 `interfaceFSM.state`를 반환한다.
- `sourcecode/frontend/interface_fsm.js:113`: `selectedSlotId`는 raw state가 아니라 `readState()`에서 `interfaceRuntime.selectedSlotId`로 조합된다.
- `sourcecode/frontend/mantine_ui.js:1458`: 객체 추가는 `graphApi.addObject(state.selectedSlotId, activeCsv.id)`를 호출한다.
- `sourcecode/frontend/mantine_ui.js:1860`: 슬롯 파일 불러오기는 `graphApi.importFile(state.selectedSlotId, file)`를 호출한다.

따라서 두 콜백의 `state.selectedSlotId`에는 공식 선택 슬롯 read가 보여 주는 ID가 포함되지 않는다. 헤더가 선택 슬롯을 표시하는 것과 명령에 대상 ID가 전달되는 것은 별개다. public graph 바인딩의 `(slotId, csvId)` 순서 문제로 판정하지 않는다. 두 증상은 공통 누락의 발현으로 묶었으며, 이것만으로 모든 UI 명령이 고장 났다고 확대하지 않는다. 수정 방식의 설계·적용은 이번 범위 밖이다.

## 3. 실제 UI에서 확인된 동작

아래 ‘확인’은 해당 실행 사례의 결과이며 전체 입력·전체 회귀 범위 통과를 뜻하지 않는다.

| 사례 | 실제 결과 | 주요 증거 |
|---|---|---|
| inline 시작 | 기본 2×2 빈 프로젝트 표시 | `01-startup.txt` |
| CSV 불러오기 | Time/Signal/Control 3열, 데이터 5행, 최초 참조 수 0 표시 | `02-add-object-ui.txt` |
| layout 행·열 변경 | 2×2 → 3×2 → 3×3 | `03-grid-merge-ui.txt` |
| 빈 슬롯 병합·분할 | 세로 두 슬롯 병합 후 visible 8개, 분할 후 9개 | `03-grid-merge.json` |
| CSV 이름 충돌 취소 | 대화상자 닫기로 취소, 기존 자산 유지 | `04-collision-ui.txt` |
| CSV 이름 변경 복사 | `measurements (2).csv` 생성, 선택 슬롯 import가 graph 객체를 추가, 두 CSV 참조 수 각각 1 | `08-before-roundtrip-ui.txt` |
| 자산·슬롯 연결 표시 | 두 CSV 경로와 image 연결, 빈 슬롯 행 유지 | `08-before-roundtrip-ui.txt`, `10-restored-ui.txt` |
| 이미지 연결 | 이미지 선택만으로 슬롯은 바뀌지 않고, 명시적 추가 후 imageId 연결 | `05-image-manual-zero-ui.txt` |
| manual 이미지 좌표 0 | x=0, y=0 입력 수용. live와 두 PNG에서 슬롯 좌상단에 잘린 blue 영역을 확인 | `05-image-manual-zero.png`, `06-target.png`, `07-current.png` |
| target/current PNG | 각각 실제 다운로드, 두 파일 모두 1200×742. 두 PNG와 live screenshot을 열어 확인 | `06-target.png`, `07-current.png` |
| caption 텍스트 | `Field caption <b>literal</b>` 및 다음 행 표시, 태그를 literal로 렌더 | `08-before-roundtrip-ui.txt`, `10-restored-ui.txt` |
| FFPX 저장·복원 | 선택 해제 후 다운로드, 페이지 reload 후 파일 선택으로 이름·3×3·두 graph 객체·2 CSV·이미지·manual 0·caption 복원 | `09-project.ffpx`, `10-restored-ui.txt` |
| FFSX 저장 | 실제 슬롯 파일 다운로드 성공. 불러오기는 F-01B 실패 | `11-graph.ffsx` |
| Plotly JSON 저장 | 기존 graph 슬롯 재선택 후 다운로드. data/layout/config/frames 및 trace 3개(실제 2 + 축 placeholder) 확인 | `13-graph.json` |
| debug 버튼 | 켜기·끄기 UI label 변경 확인. 외부 변경과의 경쟁 조건 증명은 아님 | `09-session-ui.txt`, `10-restored-ui.txt` |
| split 배포본 | 압축 해제한 HTML의 기본 2×2·visible 4개 시작만 확인 | `15-split-startup.json`, `15-split-ui.txt` |

FFPX도 `zipfile.testzip()` 결과가 `None`이었다. CRC 확인은 실제 UI roundtrip 관찰과 구분한다.

## 4. public API 보조 실험 — 순수 UI 시험과 구분

- **graph 생성**: 위 F-01A의 명시적 `addObject(0,1)` 호출. 버튼 동작 통과로 계산하지 않는다.
- **외부 grid 변경**: UI로 두 빈 슬롯을 선택한 뒤 public API `layout.setGrid(3,4)` 호출. 병합·분할·선택 해제 버튼이 모두 disabled가 되어 기존 선택이 clear된 것을 확인했다.
- 이어 UI 행 증가 입력으로 4×4가 되어 현재 열 4가 유지됐다. `14-supplementary-grid.json`에 구분 기록했다. 임의 비동기 interleaving·모든 invalid 입력·모든 외부 변경 race를 검증한 것은 아니다.

## 5. 결함으로 세지 않은 관찰과 한계

- 슬롯 선택 중 프로젝트 내보내기는 `프로젝트 내보내기는 슬롯 선택을 해제한 뒤 사용할 수 있습니다.`로 거절됐다. 선택 해제 후 성공했으므로 최초 다운로드 timeout은 잘못된 시험 전제이지 export 결함이 아니다.
- FFSX 불러오기가 실패한 빈 슬롯에서의 Plotly export timeout은 같은 실패에 의해 선행 조건이 충족되지 않은 결과다. 기존 graph 슬롯에서는 다운로드가 성공했다.
- 선택 action 버튼은 선택이 없으면 DOM에서 사라지는 대신 disabled가 된다. 최초 absence 대기 timeout은 시험 조건 오류이며 앱 실패가 아니다.
- `page.fill` 후 disconnected element 확인 오류에도 다음 snapshot에는 프로젝트 이름 전체가 반영됐다. stale snapshot ref, 잘못된 subtree root 및 SDK 인수 오류는 새 snapshot/올바른 호출로 복구했으며 앱 결함으로 계산하지 않았다.
- console 이벤트 수집이 빈 배열이었다는 사실만으로 console/runtime 오류가 전혀 없다고 보증하지 않는다.
- split은 startup만 확인했다. 다른 브라우저·OS·오프라인 네트워크 차단·대용량·모든 import 포맷·삭제/복구·모든 palette/print 설정·포괄적 경합·모든 실패 cleanup은 미검증이다.
- 이미지 manual 0 결과는 이번 fixture의 육안 관찰이며 전체 pixel 회귀 검사 통과 주장이 아니다.
- 삭제된 자동 테스트를 복원하거나 새 회귀 suite를 만들지 않았다. version checker, TLC, GitHub Actions는 실행하지 않았다. 계층 전체 번역 충실도나 닫힘을 이번 실필드 결과로 대체하지 않는다.

## 6. 재현 자료·보존·변경 범위

- 증거 경로: `agent_space/logs/20261114-001-field-test/`. 실행 시작일 기준 경로를 유지했고 결과 문서와 패치는 작성일인 20261115를 사용했다.
- `fixtures/measurements.csv`: header `Time,Signal,Control`; 5행은 `(0,0,1)`, `(1,2,1.2)`, `(2,4,1.4)`, `(3,3,1.3)`, `(4,5,1.5)`.
- `fixtures/edge-colors.png`: 160×80 RGBA red/blue 이미지.
- `16-final-state.json`: 마지막 inline 상태 4×4와 공개 read 관찰. `17-manifest.json`: 각 증거의 크기·SHA256 및 실행 대상 식별. manifest 자신의 hash는 자기참조를 피하려고 제외했다.
- 브라우저 TaskSpace 3은 최종 관찰 저장 후 `finish({keep:[]})`로 종료했다.
- `git diff --exit-code HEAD -- sourcecode sourcescript pseudocode scripts vendor package.json package-lock.json development-versions.json dist`로 구현 관련 tracked 변경이 없음을 확인했다. 이 명령은 동작 테스트가 아니라 변경 범위 검사다.
- 신규 결과 문서와 증거만 추가한다. 실제 native Git diff와 선택 이유는 `agent_space/patches/20261115-001.patch` / `.md`로 기록한다. commit/push는 하지 않았다.
