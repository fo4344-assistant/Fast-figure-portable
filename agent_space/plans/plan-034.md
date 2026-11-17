# Plan 034 — ego-browser 짧은 실사용 워크플로우 검증

## 1. 목적과 범위

- 작성일: 2026-11-17.
- 요구: 사용자가 실제 접근할 수 있는 경로를 다양하게 ego-browser로 확인한다. 테스트 파일은 `.work` 아래에 둔다. 디버깅 로그 누적으로 느려지지 않도록 목표가 분명한 짧은 워크플로우로 구성한다.
- 선행 작업: Plan033의 C01~C19 source code 수정과 후속 정적 review. 이번 계획은 실제 UI 사용과 파일 왕복을 확인하는 후속 단계다.
- 작성 시 HEAD: `9991697cf25c29ceb051c91779dc506331d6a7ba`. 미커밋 source code 수정과 기존 review/patch/Plan033을 포함한 현재 작업 트리를 보존한다.
- 기준: Source Script 52와 pseudocode 27. 실행 대상은 현재 source code 158이며 기록된 fingerprint는 `sha256:db39318f772903519b191f43621a1bb5fe3c859fd932208a926903dc75546cd6`다. 실행 직전 실제 파일로 다시 확인한다.
- 이번 요청에서는 계획을 작성한다. 브라우저 테스트, fixture 생성, 앱 빌드, 구현 수정, 커밋·푸시는 이 문서 작성과 구분한다. 실행 지시를 받으면 아래 범위로 진행한다.
- 버그를 발견하면 입력·재현 단계·기대/관찰 결과·증거를 기록한다. 테스트 중 source code나 상위 계층을 수정하지 않는다. `stale/open` 또는 버전 번호를 테스트 횟수만으로 변경하지 않는다.

## 2. 실행 단위와 로그 누적 방지

1. 표의 각 WF가 독립 실행 단위다. 한 WF에는 하나의 판정 목표를 두고, 기준 상태 복원을 포함해 UI 조작 8회 이내, 통상 30~90초를 목표로 한다. 파일 대기 등으로 2분을 넘으면 현재 증거를 저장하고 실패 또는 차단 원인을 판정한다. 실패를 긴 시나리오 뒤에 묻어두지 않는다.
2. 각 WF 시작은 같은 관리 Page의 reload → 준비된 프로젝트 파일 열기 → 대상 선택 순서다. 작업 파일과 다운로드를 저장한 뒤 reload하여 다음 WF로 이동한다. 프로젝트 파일을 다시 여는 것만으로 세션 로그가 비워졌다고 가정하지 않는다.
3. 일반 WF에서는 디버깅을 끈다. 시작 시 버튼 표시를 확인한다. 디버깅 WF와 실패 재현에서만 잠깐 켜고, 재현 1회 후 로그를 저장하고 UI의 로그 비우기/디버깅 끄기를 수행한다. 이후 reload한다.
4. 디버깅 WF는 최대 5개 입력으로 제한한다. 장시간 켜둔 상태의 순회, 반복적인 전체 DOM/로그 출력, 부하 측정을 위한 무한 클릭은 포함하지 않는다. 로그 저장 파일과 화면 snapshot은 해당 WF 디렉터리에만 둔다.
5. 같은 동작의 재시도는 원인 확인 후 최대 1회다. 첫 실패 화면·상태를 보존한다. 반복으로 우연히 성공한 것을 첫 실행 성공으로 기록하지 않는다.
6. checkpoint 복원 자체가 실패하면 그 상태에서 다른 WF를 계속하지 않는다. 해당 checkpoint 의존 WF는 BLOCKED로 표시하고 독립적인 빈 프로젝트 WF부터 계속한다.
7. 후속 동작을 결정하는 중간 상태만 관찰한다. 완료 후 필요한 snapshot 한 번, 시각 판정이 필요한 경우 screenshot 한 번을 기본으로 한다. 성능 수치는 디버깅 여부·viewport·파일 크기와 함께 기록하며 일반 성능 보장으로 확대하지 않는다.

## 3. ego-browser 사용과 실제 사용자 경로

- 설치된 `ego-browser skill` 가이드를 끝 표시까지 확인한다. 실행 작업 하나에 TaskSpace 하나를 사용하고 p1을 재사용한다. 이전 실패를 복구하려고 새 TaskSpace를 만들지 않는다. inline/split 비교가 필요할 때만 같은 공간에 p2를 사용한다.
- 버튼/입력/탭/모달은 snapshot에서 확인한 ref 또는 의미 있는 selector로 조작한다. 파일은 실제 FileChooser 또는 해당 파일 input에 `setFiles`/`setInputFiles`로 넣는다. ref가 바뀌면 새 snapshot으로 다시 찾는다.
- 캔버스/드래그는 실제 화면이나 DOM 위치를 확인한 뒤 지원되는 mouse/dragAndDrop으로 조작한다. OS 파일 drop을 현재 도구가 재현할 수 없으면 해당 WF를 BLOCKED로 기록한다. 파일 선택기 테스트로 drop 성공을 대신 기록하지 않는다.
- 공개 API는 관찰용 읽기에만 사용한다. 프로젝트·선택·그래프를 API로 만들어 UI WF의 준비나 성공을 대신하지 않는다. 내부 Backend, DOM 값 강제 변경, 임의 이벤트 주입, 앱 함수 monkeypatch를 사용하지 않는다.
- 숫자/선택/참조 수/영속 필드는 공개 읽기로 보조 관찰하고, 화면·버튼 상태·차트·저장 파일도 해당 목표에 맞게 확인한다. 공개 읽기와 실제 클릭 결과를 기록에서 구분한다.
- 다운로드는 클릭 전에 `waitForEvent('download')`를 준비하고 같은 실행 round 안에서 `saveAs`한다. 파일 존재만으로 성공 처리하지 않고 크기·형식·내용·필요한 왕복을 판정한다.
- 매 round 스크립트는 `.work`의 새 파일로 작성하고 이미 실행한 파일을 수정해 재실행하지 않는다. browser 스크립트의 파일 경로는 실행 시 해석한 절대 경로로 전달한다. 계정·인증 값이나 개인 환경의 절대 경로를 프로젝트 코드에 넣지 않는다.
- 사용자 제어·권한 창·도구 오류로 멈추면 해당 상태를 보고한다. 완료 후에는 별도의 마지막 browser round에서 `finish({keep: []})`한다. 중단·오류 처리와 정상 완료를 구분한다.

## 4. 파일 위치와 실행 대상 준비

모든 테스트 자료의 기준은 저장소의 부모인 작업 공간이다. 아래 `.work`는 `Fast-figure-portable/` 내부가 아닌 현재 작업 공간의 `.work/`다.

```text
.work/ego-plan034/<실행일시>/
  manifest.json                  # 실제 HEAD, dirty 파일 목록, 세 계층 fingerprint, build HTML hash, 환경
  build/                         # 현재 source code로 만든 inline HTML / split ZIP
  split-expanded/                # 같은 build ZIP의 압축 해제 결과
  fixtures/input/                # 원본 CSV/TSV/JSON/PNG 및 손상 파일
  fixtures/replacement/           # 같은 basename의 교체용 파일
  checkpoints/                   # UI로 만든 D/G/M/L/C 프로젝트와 slot/Plotly export
  rounds/                        # 실제 실행하는 ego-browser round 스크립트
  results/WF01/                  # WF별 결과 JSON, snapshot, 필요한 screenshot, 작은 로그
  downloads/WF01/                # WF별 실제 내려받은 파일
```

- 실행일시는 작업 시작 시 결정한다. 기존 실행 디렉터리를 덮어쓰지 않는다. 프로젝트 루트나 작업 공간 루트에 `.plan*-git-index` 등 임시 파일을 만들지 않는다. 이번 계획 기록은 새 파일에 대한 native no-index diff로 작성한다.
- 현재 `dist/`는 이전 빌드일 수 있다. 실행 승인 후 `python Fast-figure-portable/scripts/build-portable.py --dist-dir <위 실행 디렉터리>/build`로 테스트 복사본을 만든다. 기존 의존성을 확인하고 새 설치가 필요하면 별도 보고한다. tracked `dist/`를 덮어쓰지 않는다.
- inline과 split은 같은 빌드에서 생성한 파일을 사용한다. 소스 HTML 템플릿을 앱의 배포 실행 파일로 열지 않는다. 실제 build 결과의 `file://` URL과 hash를 manifest에 기록한다.
- 자동 배포 빌드는 이미 수동 요청 방식으로 변경되어 있다. README의 과거 자동 빌드 안내를 실행 지시로 사용하지 않는다. Actions·배포물 갱신·Git 설정 변경은 포함하지 않는다.
- 문서 결과는 이후 독립 review에 기록한다. 원본 테스트 자료와 실행 증거는 위 `.work`에 유지하고 review에서 정확한 경로·hash를 참조한다. 기존 fixtures와 기존 real-field 결과는 이번 실행 결과와 섞지 않는다.

### 4.1 입력 fixture

실행 단계에서 아래 파일을 생성하고 bytes/SHA256을 manifest에 기록한다. 직접 만든 FFPX/FFSX 저장 형식으로 준비 상태를 조작하지 않는다.

| 파일 | 정확한 주요 자료 | 확인 목적 |
|---|---|---|
| series.csv | `Time,Signal,Control` 다음 `0,0,1` / `1,2,1.2` / `2,4,1.4` / `3,3,1.3` / `4,5,1.5` | 5점, 두 Y열, 0 값, 공통 graph 기준 |
| headerless.csv | `0,10` / `1,20` / `2,30`, headerLines를 UI에서 0으로 지정 | header 0과 교체 후 3점 유지 |
| replacement/headerless.csv | `0,100` / `1,200` / `2,300` | 같은 이름 교체와 기존 header 0 보존 |
| series.tsv | series.csv와 같은 필드·행을 탭으로 구분 | TSV 입력 |
| quoted.csv | `Time,Label,Value`와 쉼표 포함 label, 따옴표 escape, 인용된 줄바꿈, 중간 빈 행을 포함 | 행/열/문자 보존과 유효 숫자 쌍 |
| empty-lines.csv | LF 한 byte | rows가 빈 배열인 delimited 자료. 파일 bytes는 존재 |
| zero-byte.csv | 0 byte | 전체 자산 가져오기 경계의 처리. parser 허용과 프로젝트 자산 검증 결과를 구분 |
| arrays.json | `[["Time","Signal"],[0,2],[1,4],[2,6]]` | 배열형 JSON 데이터 |
| records.json | `[{"Time":0,"Signal":2},{"Time":1,"Signal":4,"Extra":"x"},{"Time":2,"Signal":6}]` | 객체 key 합집합과 빠진 값 |
| empty-array.json | `[]` | JSON dataTable 거부·상태 보존 |
| plotly.json | 2개 trace, x `[0,1,2]`, y `[2,4,3]`와 `[1,1.5,2]`, 제목, 추가 annotation, config, frames | 원본 Plotly 입력과 재내보내기/편집 전환 |
| broken.json | 끝이 잘린 JSON 문자열 | 해석 실패와 후속 복구 |
| edge-colors.png | 160×80, 왼쪽 빨강/오른쪽 파랑의 불투명 PNG | contain/cover/manual 및 0 좌표 시각 비교 |
| replacement/edge-colors.png | 같은 크기, 초록/노랑 PNG | 이미지 교체 후 슬롯 설정과 참조 유지 |
| damaged.ffpx / damaged.ffsx | 앱이 내보낸 정상 파일의 복사본을 잘라서 작성 | 컨테이너 손상 거부. 정상 파일은 별도 보존 |
| header99.ffpx | 정상 앱 export 복사본의 CSV header 메타데이터만 99로 바꾸고 ZIP CRC를 다시 계산 | 정상 컨테이너 안의 header 범위 보정; 수정 위치·원본/변형 hash 기록 |

quoted.csv의 실제 문자열·예상 parse 행은 fixture manifest에 명시한다. Plotly fixture의 전체 JSON도 저장한다. `header99.ffpx` 외부 입력은 형식 위치를 현재 reader/writer와 대조한 뒤 만들며 CRC 손상 테스트와 섞지 않는다. 패키지 header만 보정하는 공개 UI는 없으므로 이 입력은 명시적으로 변형 fixture로 기록한다.

### 4.2 UI로 만드는 checkpoint

| 이름 | 준비 상태 | 만드는 경로 |
|---|---|---|
| S0 | 빈 기본 프로젝트, 디버깅 꺼짐 | 테스트 HTML reload. 프로젝트 파일 없음 |
| D | series.csv와 headerless.csv, 후자는 header 0. 슬롯은 비어 있음 | 두 파일 순차 가져오기 → 빈 slot 0·headerless 선택/header 0 → 슬롯 선택 해제 → 프로젝트 내보내기 |
| G | slot 0의 편집 가능 graph, series.csv를 사용하는 object 2개, 다른 슬롯 빈 상태 | D 복원 → slot 0 → series 선택 → 오브젝트 추가 2회 → 선택 해제 → 프로젝트 내보내기 |
| M | G + slot 1 이미지, 구별 가능한 슬롯 캡션 | G 복원 → slot 1 이미지 타입 → edge-colors 입력/선택 이미지 추가 → 캡션 입력 → 선택 해제 → 프로젝트 내보내기 |
| L | 빈 3×3 배치 | S0 → 행 3 → 열 3 → 선택 해제 → 프로젝트 내보내기 |
| C | G + 전체 캡션 이름/본문, 명시된 font·크기·줄 간격 | G 복원 → 캡션 입력/표시 → 선택 해제 → 프로젝트 내보내기 |

- 각 checkpoint 준비도 목적별로 나누어 저장한다. 준비에 필요한 기능이 실패하면 관련 WF를 BLOCKED로 기록한다. API로 checkpoint를 채워 통과시키지 않는다.
- 모든 파일은 이번 build의 UI로 생성한다. 별도 WF 시작마다 reload 후 checkpoint를 파일 선택기로 복원한다. 복원한 값과 차트·이미지가 일치하는지 짧게 확인한다.
- FFSX/Plotly/원본 자산 파일은 해당 export WF에서 만들어 다음 import WF의 입력으로 사용한다. 선행 export 실패는 후행 import의 별도 실패로 중복 계산하지 않는다.
- 추가 checkpoint: WF54의 Plotly import 상태를 프로젝트로 저장해 WF19/55에서 사용한다. WF40의 병합 상태를 저장해 WF43에서 사용한다. WF42의 두 내용 슬롯은 M의 graph/image를 사용한다. WF31은 UI에서 A/B 폴더를 만들고 각 폴더에 같은 basename의 서로 다른 CSV를 배치해 저장한다. 준비가 8회 조작을 넘으면 중간 프로젝트를 저장해 준비 과정도 짧게 나눈다. 각 파일의 생성 WF와 조작 기록을 연결한다.

## 5. 짧은 워크플로우 목록

공통 시작은 §2의 reload/디버깅 꺼짐/시작 상태 복원이다. 아래 과정은 그 뒤 수행할 핵심 UI 조작이며, 연속 WF의 마지막 상태를 다음 WF의 준비 상태로 사용하지 않는다. 시각 판정에는 실제 screenshot을 읽어 판단한다.

### A. 시작과 데이터 입력

| ID | 목표 / 시작 | 짧은 과정 | 판정 |
|---|---|---|---|
| WF01 | inline 시작 / S0 | HTML 열기 → 초기 대시보드·toolbar 확인 | 빈 기본 grid, 정상 입력, 오류 overlay·무한 render 없음 |
| WF02 | 독립 선택 / D | CSV 선택 → slot 0 선택 → 슬롯 선택 해제 | CSV 선택과 슬롯 선택이 각 규칙대로 유지·해제되고 오류 없음 |
| WF03 | CSV 입력 / S0 | 파일 선택기로 series.csv 열기 → preview 열기 | 3열·header 1·5개 sample과 원본 이름, 아직 graph 참조 0 |
| WF04 | TSV 입력 / S0 | series.tsv 열기 → preview 확인 | TSV가 같은 숫자·열 구조로 표시됨 |
| WF05 | 배열 JSON / S0 | arrays.json을 데이터 입력으로 열기 | 2열·3개 sample, JSON 원본 자산으로 보존 |
| WF06 | 객체 JSON / S0 | records.json 열기 → 열 목록 확인 | Time/Signal/Extra가 입력 순서로 구성되고 빠진 Extra는 빈 값 |
| WF07 | 인용 CSV / S0 | quoted.csv 열기 → slot 0·graph 추가 → Time/Value 선택 | 쉼표·따옴표·줄바꿈·중간 빈 행 보존; 빈 숫자 쌍은 trace에서 제외 |
| WF08 | 빈 delimited 자료 / S0 | empty-lines.csv 열기 → slot 0 → graph 추가 | 자산 rows/열 수 0, object의 X/Y 선택 모두 빈 값, graph 실데이터 0점 |

### B. 그래프 작성과 수정

| ID | 목표 / 시작 | 짧은 과정 | 판정 |
|---|---|---|---|
| WF09 | 첫 graph 생성 / D | slot 0 → series 선택 → 오브젝트 추가 클릭 | slot 0에 chart 1개·object 1개·실제 5점 |
| WF10 | 키보드 추가 / G | slot 0·series 선택 → 추가 버튼 focus → Enter | object가 정확히 1개 증가; id 0 대상 유효 |
| WF11 | 선택 없는 보호 / D | 슬롯 선택 해제 → 추가/slot import 사용 가능 상태 확인 | 사용 불가 또는 기준의 안내; 다른 슬롯에 graph 생성 없음 |
| WF12 | 현재 CSV 적용 / G | headerless.csv 선택 → 추가 → 마지막 object 확인 | 새 object가 현재 CSV를 참조하고 3점; 기존 object는 series 유지 |
| WF13 | X/Y 전환 / G | object 선택 → Y를 Control로 변경 | 해당 object의 y가 `[1,1.2,1.4,1.3,1.5]`; 다른 object 유지 |
| WF14 | object CSV 전환 / G | object 선택 → object CSV를 headerless로 변경 | 유효 열 선택/기본 보완, 독립적인 자산 선택과 다른 object 유지 |
| WF15 | 표현 유형 / G | 첫 object 유형을 마커 → 막대로 변경 | 같은 데이터로 표현 변경, object 수·CSV 참조 불변 |
| WF16 | 순서 변경 / G | 두 object의 위치를 UI로 교환 | 실제 순서·범례·선택 index 일치; 참조 수 감소 없음 |
| WF17 | object 삭제 / G | 두 번째 object 삭제 → 남은 object 선택 | 하나만 삭제, 남은 object 정상 편집, CSV 자산 유지 |
| WF18 | 축 값 나누기 / G | slot 0 → Y축 값 나누기 2 → 그래프 확인 | Signal의 y가 `[0,1,2,1.5,2.5]`, object 수·원본 CSV 값 불변 |
| WF19 | 편집 전환 / Plotly import checkpoint | 편집 가능 전환 → object 한 필드 변경 | 명시적 전환 후 실제 CSV/columns 연결, 원본 모드/편집 모드의 규칙 유지 |

WF15의 마커와 막대가 모두 통과하면 선/선+마커/숨김을 각각 새 reload의 변형 실행으로 확인한다. WF18의 linear/log/reciprocal, 축 위·아래/좌·우, graph 제목·범례 글꼴은 각 입력군을 분리한 새 실행으로 확인한다. 한 실행에 모든 설정을 연속 변경하지 않는다.

### C. 이미지

| ID | 목표 / 시작 | 짧은 과정 | 판정 |
|---|---|---|---|
| WF20 | 이미지 연결 / D | 이미지 자산 입력 → slot 1 이미지 타입 → 선택 이미지 추가 | imageId 연결, 160×80 원본, 다른 graph/자산 불변 |
| WF21 | 맞춤 / M | 이미지 slot 선택 → contain → cover | 종횡비·여백/잘림 차이와 다른 슬롯 불변 |
| WF22 | manual 0 / M | manual → X=0 → Y=0 | 이미지 중심이 좌상단; 파란 사분면 잘림 등 fixture 기준 일치 |
| WF23 | 수동 크기 / M | manual 크기 200 → X=-20 | 기준의 범위·이동·잘림, 원본 이미지 bytes 불변 |
| WF24 | 이미지 자산 교체 / M | 같은 basename 이미지 입력 → 교체 선택 | 새 색상으로 갱신, 같은 자산 id·slot 설정·캡션 유지 |
| WF25 | graph 슬롯에 이미지 drop / G | graph slot에 edge-colors.png 실제 파일 drop | 소유 chart 제거·image 타입/참조로 전환, id/배치/캡션 유지 |
| WF26 | 이미지 reset / M | 이미지 slot → 초기화 모달 확인·실행 | slot-local 기본값 복원, 이미지 자산은 자산 목록에 유지 |

### D. 파일·폴더·참조 관리

| ID | 목표 / 시작 | 짧은 과정 | 판정 |
|---|---|---|---|
| WF27 | 충돌 취소 / D | series.csv 다시 입력 → 충돌 창 닫기 | 기존 CSV·id·rows·참조 수 불변, busy와 drop 표시 해제 |
| WF28 | 이름 바꿔 추가 / D | series.csv 다시 입력 → 새 이름 추가 | 새 path/id, 원본 자산과 값 유지 |
| WF29 | header 0 교체 / D | replacement/headerless.csv 입력 → 교체 | header 0 유지, rows 값 100/200/300; 첫 행 소실 없음 |
| WF30 | 새 폴더·이동 / D | 폴더 생성 → series.csv 이동 | canonical 경로 변경, 같은 id·bytes 유지, 트리·선택 반영 |
| WF31 | 이동 충돌 취소 / 충돌 폴더 checkpoint | 같은 이름이 있는 폴더로 이동 → 취소 | 두 자산 모두 원래 경로/내용 유지 |
| WF32 | 참조 CSV 삭제 / G | 참조 CSV 삭제 선택 → 확인창 취소 | object 2개·차트·자산 유지, 참조 안내 수 일치 |
| WF33 | 참조 CSV 삭제 실행 / G | 참조 CSV 삭제 → 확인 | 관련 object만 제거, 다른 자산 유지, 안내/실제 참조 감소 2 |
| WF34 | 휴지통 / D | 자산을 휴지통 이동 → 비우기 취소 | path/트리/선택과 안내 확인, 취소로 영구 삭제 없음 |

WF34의 영구 비우기 확인은 별도 reload에서 실행한다. 폴더째 이동·하위 자산 포함 삭제도 별도 변형으로 실행하며 원래 fixture 파일은 삭제하지 않는다. 원본 자산 다운로드는 WF56에서 확인한다.

### E. 배치와 선택

| ID | 목표 / 시작 | 짧은 과정 | 판정 |
|---|---|---|---|
| WF35 | 행만 변경 / S0 | 레이아웃 열기 → 열 3 → 행 3 | 3×3이며 현재 다른 차원 보존, 기존 좌표/id 유지 |
| WF36 | 열만 변경 / L | 열 4 | 3×4, 현재 행 3과 기존 cell의 내용·id 유지, 새 빈 cell만 추가 |
| WF37 | 빈 입력 fallback / L | 행 입력 비우기 → blur | 기준의 현재 행 값 유지; 열이 이전 render 값으로 덮이지 않음 |
| WF38 | 안전 축소 / L | 빈 마지막 행 삭제 방향으로 크기 축소 | 제거 가능한 빈 cell만 제거, 남은 id·좌표 유지 |
| WF39 | 데이터가 있는 축소 거부 / M | 채워진 slot을 범위 밖으로 내보내는 축소 시도 | 거부/안내, 전체 기존 배치·내용 보존 |
| WF40 | 빈 셀 병합 / L | 인접 2셀 선택 → 병합 | anchor/span·hidden 구조와 화면 일치, 선택 상태 정리 |
| WF41 | 내용 1개 병합 / M | graph와 인접 빈 cell 선택 → 병합 | chart 소유 하나, graph/캡션과 병합 geometry 유지 |
| WF42 | 병합 거부 / 두 내용 slot checkpoint | 서로 내용 있는 2셀 → 병합 | 거부, 두 chart/image/추가 local 내용 손실 없음 |
| WF43 | 분할 / 병합 checkpoint | 병합 slot 선택 → 나누기 | 원래 visible cell 수 복원, anchor의 내용·캡션 유지 |

slot 간 이동/교환이 UI에 노출되면 WF41의 별도 변형으로 drag하여 chart/image/caption이 같은 slot-local 묶음으로 이동하는지 확인한다. 미지원 UI 조작을 공개 mutation API 호출로 대신하지 않는다. grid 변경 후 selection 비우기는 WF35/36에서 버튼의 disabled 상태로 확인한다. 버튼이 DOM에서 사라져야 한다고 판정하지 않는다.

### F. 라벨과 캡션

| ID | 목표 / 시작 | 짧은 과정 | 판정 |
|---|---|---|---|
| WF44 | 라벨 형식 / G | 라벨 켜기 → upper-alpha → 괄호 | sample과 실제 slot 표기·내보내기 표기 일치 |
| WF45 | 라벨 순서 / L | 라벨 켜기 → 행 우선에서 열 우선 | 실제 좌표 순서에 맞는 식별자, 숨은 병합 cell 제외 |
| WF46 | 라벨 위치 / G | 라벨 drag → 위치 초기화 | 이동 px 좌표와 초기화 결과, 그래프 내용 불변 |
| WF47 | 슬롯 캡션 / G | slot 0 캡션에 `A <b>literal</b>\nB` 입력 → 다른 slot 선택 | literal 문자와 줄바꿈 보존, placeholder가 영속 값으로 저장되지 않음 |
| WF48 | 캡션 결합 / M | 전체 캡션 열기 → 슬롯 캡션 삽입 | 라벨·group·빈 슬롯 처리와 결합 순서가 기준에 맞음 |
| WF49 | 캡션 긴 단어 / C | 이름 있는 캡션의 첫 단어를 첫 줄 남은 폭보다 길게 설정 → PNG 저장 | 불필요한 prefix-only 줄 없음, clip과 전체 높이를 같은 font 측정 기준으로 확인 |

WF44의 decimal/lower-alpha/lower-roman/upper-roman은 각각 독립 변형으로 확인한다. WF49는 실제 선택한 글꼴로 prefix/단어 폭을 관찰해 fixture 조건을 기록한다. 구현 함수를 바꾸거나 강제 측정값을 주입하지 않는다. 빈 본문·빈 문단·이름 없음은 별도 짧은 변형으로 확인한다.

### G. 저장·다시 열기·교환

| ID | 목표 / 시작 | 짧은 과정 | 판정 |
|---|---|---|---|
| WF50 | FFPX 저장 / M | 슬롯 선택 해제 → 프로젝트 내보내기 | 실제 .ffpx 다운로드·크기·형식·정상 ZIP, 원본 프로젝트 불변 |
| WF51 | FFPX 왕복 / S0 | WF50 파일 열기 → graph/image slot 확인 | 이름/grid/ids/CSV·이미지/캡션/설정 및 참조 보존 |
| WF52 | FFSX 저장 / G | graph slot 선택 → FFSX 내보내기 | slot·참조 CSV·원본 bytes·caption 포함, 다른 slot/프로젝트 자료 제외 |
| WF53 | FFSX 비어 있는 slot에 입력 / G | 비어 있는 graph slot 선택 → WF52 파일 열기 | 대상 id/geometry 유지, 새 chart/CSV id 매핑·caption 적용, 다른 slot 불변 |
| WF54 | Plotly 원본 입력 / S0 | slot 0 → plotly.json 열기 | 2개 원본 trace·title·추가 annotation/config/frames 표현 보존 |
| WF55 | Plotly JSON 저장 / Plotly import checkpoint | 선택 graph → Plotly JSON 내보내기 | data/layout/config/frames와 추가 원본 필드 의미 보존, 유효 JSON |
| WF56 | 원본 자산 다운로드 / D | series.csv 선택 → 선택 에셋 다운로드 | fixture와 다운로드 bytes/SHA256 동일 |
| WF57 | PNG 목표 크기 / C | 프린트 → width=1200·자동 높이 → 설정 크기로 저장 | 실제 PNG 폭 1200, 양의 높이·caption 포함, clipping/배치 정상 |
| WF58 | JPEG와 DPI / C | JPEG·DPI 300 설정 → 저장 | JPEG signature/치수/설정 DPI metadata, 배경·caption 시각 정상 |
| WF59 | 현재 화면 캡처 / M | 미리보기 폭 조절 → 현재 화면 캡처 | 현재 projection의 그래프·이미지·caption, manual 0 위치와 실제 치수 기록 |
| WF60 | header 메타데이터 보정 / S0 | header99.ffpx 열기 → CSV header/preview 확인 | row 수 상한으로 정규화, 정상 graph/원본 bytes/이름 유지 |

FFPX/FFSX는 내려받은 실제 패키지를 읽어 entry·CRC·원본 자산 hash를 확인하고, 별도 WF로 앱 왕복을 확인한다. CRC 성공만으로 의미 보존을 판정하지 않는다. 독립 reader의 중간 반환, 내부 reference-count receipt 등 UI에 노출되지 않는 경계는 §7의 보조 관찰 범위를 넘겨 억지로 통과시키지 않는다.

### H. 실제 사용 UI와 짧은 디버깅

| ID | 목표 / 시작 | 짧은 과정 | 판정 |
|---|---|---|---|
| WF61 | 사이드바 폭 / M | 경계 drag → graph slot 선택 | 공통 preview 폭과 graph resize, 선택·내용 유지 |
| WF62 | 창 높이 / M | 설정 창 높이 drag → 닫기·재열기 | 세로 resize/스크롤·닫힘, 가로 공통 폭 유지, 중복 overlay 없음 |
| WF63 | session zoom / G | 확대 비율 변경 → 잠금 → 100% 초기화 | 기준의 잠금/초기화 규칙, persistent 프로젝트 grid 불변 |
| WF64 | UI 색상 취소 / G | UI 색상 열기 → 색 변경 → 닫기 | 적용 전 원래 palette 유지, graph 데이터 불변 |
| WF65 | UI 색상 적용 / G | 색상 변경 → 적용 → 다시 열기 | palette·텍스트 대비·현재 값 일치; FFPX 왕복은 별도 WF51 변형 |
| WF66 | graph 색상 왕복 / G | graph 색상 저장 → 한 색 변경 → 저장 파일 불러오기 | 실제 palette·object 순서·hint 규칙 유지; 파일 schema는 앱 export 사용 |
| WF67 | 디버깅 수명 / G | 켜기 → slot 선택 1회 → 로그 저장 → 비우기 → 끄기 | 파일 저장, 목록 비움, 꺼짐 표시; 즉시 reload |
| WF68 | 키보드·focus / G | Tab으로 대상 이동 → 설정 창 Enter/닫기 | 지정 버튼만 동작, 입력 중 글자 조작이 slot 명령으로 새지 않음 |

### I. 취소·실패·복구

| ID | 목표 / 시작 | 짧은 과정 | 판정 |
|---|---|---|---|
| WF69 | 파일 선택 취소 / G | slot import chooser 열기 → 취소 | chart/object/CSV 불변, busy 해제, 다음 picker 사용 가능 |
| WF70 | 잘못된 JSON / G | broken.json을 slot import → 오류 확인 | 기존 chart 보존, 안내, 다음 정상 파일 열기 가능 |
| WF71 | 손상 FFPX / M | 선택 해제 → damaged.ffpx 열기 | 기존 전체 프로젝트 보존, 오류 후 ready 복구 |
| WF72 | 손상 FFSX / G | 빈 slot → damaged.ffsx 열기 | 기존 slot/다른 graph 보존, 다음 정상 FFSX 입력 가능 |
| WF73 | JSON 빈 배열 / D | empty-array.json을 데이터 입력 | dataTable 거부, 기존 자산/선택/graph 불변, 다음 CSV 입력 가능 |
| WF74 | 0-byte 파일 / D | zero-byte.csv 입력 → 결과 확인 | parser와 전체 자산 검증의 경계를 기록; 실패 시 원본 D 보존·ready 복구 |
| WF75 | 선택 중 프로젝트 저장 보호 / M | slot 선택 → 프로젝트 내보내기 | 기준의 안내·보호; 선택 해제 후 별도 WF50 정상 수행 |
| WF76 | 파일 처리 중 선택 / 충분한 크기의 정상 FFSX | slot A에서 파일 입력 → UI가 허용하면 즉시 slot B 선택 | 작업은 A에 적용되거나 현재 대상 검증으로 거부, B로 재지정 없음 |

WF76은 실제 지연 구간이 관찰될 때만 실행 가능 판정을 한다. UI가 busy로 차단하거나 처리가 즉시 끝나면 해당 관찰을 기록하고 concurrent 경계 재현은 NOT COVERED로 둔다. 내부 명령 강제 삽입·sleep 주입·monkeypatch로 실사용 성공을 만들지 않는다. 실패 후 정상 입력 복구가 8개 조작을 넘으면 재현 WF와 복구 WF를 나누어 동일 실패 artifact를 연결한다.

### J. 배포 형태와 화면 조건

| ID | 목표 / 시작 | 짧은 과정 | 판정 |
|---|---|---|---|
| WF77 | split 시작 / S0 | 이번 ZIP 해제 HTML 열기 → 데이터 입력 | file://에서 vendor·UI·차트가 서버 없이 동작 |
| WF78 | split 교환 / 이번 build split | WF50 FFPX 열기 → 빈 slot에 WF52 FFSX 입력 | inline과 같은 데이터/참조/이름·설정 결과 |
| WF79 | 좁은 viewport / M | viewport 1024×768 수준에서 설정·트리 접근 | 주요 입력·닫기·스크롤·저장 접근 가능, graph/슬롯 유지 |
| WF80 | 실행 제외 — WF50·WF51과 중복 | M의 FFPX 저장과 reload 후 복원은 WF50·WF51 결과를 사용 | 독립 테스트로 실행·통과 집계하지 않는다. 디버깅 로그 비우기와 종료는 §2·§3 절차로 수행하고 별도 기록한다. |

viewport 변경은 현재 ego-browser의 지원 API를 확인한 뒤 사용한다. 사용자가 관리하는 창·프로필 설정은 임의 변경하지 않는다. split에서 WF09/25/53/57을 각각 새 상태로 재실행해 핵심 경로를 교차 확인하고, inline 전체 항목을 split에서도 했다고 기록하지 않는다.

## 6. 실행 순서와 확대 기준

1. 실행 대상 build/hash/환경 확인 → WF01/03/09/10/20/50/51/52/53/57의 핵심 경로를 먼저 수행한다. 필요한 checkpoint는 해당 기능이 실제 성공한 뒤 저장한다.
2. 그래프·이미지·데이터·배치·파일 관리·캡션·설정·실패 복구군을 시작 상태별로 수행한다. 실행 편의를 위해 그룹을 묶어도 WF 사이에는 reload와 독립 준비를 유지한다.
3. 추가 변형은 원래 WF의 새 attempt/variant 디렉터리로 분리한다. 양성/음성, 마우스/키보드, slot 0/다른 slot, header 0/1, inline/split 결과가 뒤섞이지 않게 한다.
4. 심각한 데이터 손실·다른 slot 오염·파일 손상·권한 문제는 해당 계열을 즉시 중단한다. 다른 독립 기능은 안전한 checkpoint로 진행할 수 있다. 같은 실패를 파생된 여러 WF의 독립 결함으로 중복 집계하지 않는다.

## 7. 증거와 판정

- 각 WF 결과에 ID/variant, 실제 시작 checkpoint hash, 조작 순서, 기대값, 관찰값, PASS/FAIL/BLOCKED/NOT COVERED, 시작·종료 시각, 디버깅 상태, 파일 경로를 기록한다. 미실행은 NOT RUN이다.
- 실제 화면 조작, 공개 API 읽기, 내려받은 파일의 정적 검사, 변형 fixture 입력을 구분한다. mutation API로만 확인한 경로는 실사용 UI 통과에 포함하지 않는다.
- graph 점/선택/개수, Slot 배치·참조, tree 이름/경로/행·참조 수, 실패 전후 상태 등 목표에 필요한 공개 읽기만 저장한다. 반환형이나 receipt가 공개 UI 경로에 드러나지 않으면 직접 확인 불가를 명시한다.
- C01/C02는 WF09~14/53/76, C07~10은 프로젝트 복원·안전한 실패 경로, C12/C13은 WF20/35~43, C14는 WF26/32/33의 안내·실제 참조 변화, C15~18은 WF25/29/08/60, C19는 WF49/57/59에 연결한다. 일반 UI만으로 추가 content 확장 필드나 constructor alias, 독립 reader 중간 반환, receipt count 전체를 증명할 수는 없다. 그 항목은 관찰 범위와 미확인 경계를 별도로 남긴다.
- 그림 내보내기는 실제 PNG/JPEG를 열어 보고 치수·관련 metadata도 확인한다. 캡션 높이·manual 0·라벨·merged span 등 눈으로 봐야 하는 결과는 snapshot 문자열만으로 통과시키지 않는다.
- 브라우저 automation의 stale ref·chooser timeout·스크립트 구문 오류는 앱 오류와 분리한다. 앱 실패라고 판정하기 전에 현재 snapshot/상태와 실제 파일 수신 여부를 확인한다.
- 결과 review는 실행한 ID와 미실행/차단 ID를 모두 나열한다. WF80은 WF50·WF51의 중복으로 실행 제외하며 통과나 미실행으로 집계하지 않는다. 80개 계획이 있다는 이유로 80개 통과를 기록하지 않는다. 실행 성공은 전체 Source Script/pseudocode 의미 일치나 계층 current 승격의 근거로 자동 사용하지 않는다.

## 8. 완료 조건과 중단 조건

- 실행 완료: 승인된 범위의 각 WF에 실제 결과와 근거가 있고, 실패와 차단·미실행을 구분하며, 원본 입력/다운로드/checkpoint hash와 실행 build를 추적할 수 있다. 시작 전후 source/상위/설정/배포물의 무변경도 확인한다.
- 계획 작성 완료: 목표·초기 상태·짧은 UI 과정·기대값·로그/재시작 기준·파일 경로·관찰 한계가 문서에 있다. 현재 단계에는 테스트 결과가 없다.
- 상위 두 계층의 기대값 충돌, 관찰할 수 없는 race, 지원되지 않는 OS drop/viewport/권한 조작, 손상된 checkpoint는 해당 WF를 중단하고 필요한 입력이나 수동 확인을 보고한다.
- 테스트 때문에 앱을 수정하거나 새 전역 store·테스트 전용 API·로그 제한 기능·기존 삭제 테스트를 추가하지 않는다. 수정이 필요하면 실패 review와 별도 수정 요청으로 이어간다.
