# Plan034 재개 — 공식 배포물 UI 검증

## 실행 기준

- HEAD: `da28814cdfb5dab33d94b234f1c4a7f9f5405bba`.
- 일반 빌드 명령: `cd Fast-figure-portable && python scripts/build-portable.py`.
- 실행 파일: `dist/inline/Fast-figure.html`, SHA-256 `24fb33683fc6e1b74a0b468055d13195a392fba426c1790d88c87dc1193407bb`.
- 배포 ZIP SHA-256: `d6785ff44da25b96bd98a8c3417222082d013f8ed541238a4ab0871141c4919f`.
- 실행 자료: `.work/ego-plan034/run-20261118/`. 이전 실행 기록은 보존한다. `.work` 별도 빌드를 사용한 이전 결과와 구분한다.
- 실제 UI로만 변경한다. 공개 API와 Plotly DOM 읽기는 관찰에만 사용한다. 디버깅은 꺼둔다. 구현 수정은 하지 않는다.

## 결과

| WF | 판정 | 실제 관찰과 근거 |
|---|---|---|
| WF18 | PASS — 값 나누기 기본 경로 | 이전 UI export `G.ffpx`를 공식 배포물에서 복원. slot 0 선택 → Y축/왼쪽 Y축 → 값 나누기 2 입력/Tab. 실제 두 trace 모두 y=`[0,1,2,1.5,2.5]`, object 2개 유지. CSV 선택 후 공식 읽기에서 원본 Signal=`[0,2,4,3,5]`, header 1과 원본 bytes 유지. 화면의 Y축 상한 2.5 및 선을 PNG로 확인. `results/WF18/result.log`, `observations.json`, `result.png`; 실제 round 02–09. |
| WF19 | PASS — 편집 전환 및 한 필드 수정 | 새 UI checkpoint `checkpoints/Plotly.ffpx` 복원 → slot 0 → ‘원본 JSON’ 버튼으로 편집 전환 → 첫 object 선택 → Y 열 C4 선택. 편집 가능 true, 실제 `Plotly JSON.csv` 및 C1–C4 연결 생성, 첫 trace y=`[1,1.5,2]`. `results/WF19/converted.log`, `editor.log`, `final.log`; round 19–23. |
| WF54 | PASS — 원본 Plotly 입력 | 빈 프로젝트 slot 0에서 ‘FFSX/Plotly JSON 불러오기’로 fixture 입력. A/B 두 trace와 title·annotation이 실제 화면에 나타남. 공개 읽기에서 원본 data/layout/config/frames 보존, 실제 Plotly config displaylogo=false. `results/WF54/correct-route.log`, `plot-and-export.log`, `result.png`. round 16–18. |
| WF55 | PASS — Plotly JSON 저장 | 독립 reload 후 원본 모드 checkpoint 복원 → slot 0 → 실제 JSON 다운로드. `data`, `layout`, `config`, `frames`가 fixture와 각각 완전히 같음. `downloads/WF55/plotly.json`, `results/WF55/comparison.json`. round 24. |
| WF56 | PASS — 원본 자산 다운로드 | 독립 reload 후 D 복원 → series.csv 선택 → 선택 에셋 다운로드. 실제 58 bytes가 원본 fixture와 byte 단위 일치. 양쪽 SHA-256 `52c9f7085e6c0c8daeede87358e8d1d8e25407fad64cfff19661f2e368b10e8f`. `results/WF56/comparison.json`, `downloads/WF56/series.csv`. round 10–11. |
| WF02 | PARTIAL — 선택 전환 관찰 | D 복원 → CSV 선택(currentCsv id=1) → 빈 slot 0 클릭(1행 1열 표시) → 같은 빈 slot 클릭(슬롯 선택 없음 표시). 마지막 readData.currentCsv=null 관찰. 이 값의 기대 의미는 이번 UI 관찰만으로 판정하지 않아 독립 CSV 선택 보존까지 통과로 처리하지 않음. `results/WF02/selected.log`, `result.log`. round 12–14. |

- WF18의 linear/log/reciprocal·다른 축·글꼴 변형은 이번 기본 경로 통과에 포함하지 않는다.
- 전역 설정 버튼 자동 스크롤 클릭 1회가 viewport 오류로 중단되었다. 현재 snapshot을 확인한 뒤 사이드바 wheel로 복구했다. 앱 명령 실패로 집계하지 않는다. 도구 복구/관찰로 짧은 워크플로우 목표 시간을 초과했으며 성능 판정에는 사용하지 않는다.
- WF54의 최초 round 15는 ‘데이터 추가’라는 다른 경로로 JSON을 CSV로 입력했다. 이를 원본 Plotly 입력 성공/실패로 집계하지 않고 별도 reload 후 정확한 전용 picker로 실행했다. 최초 로그 `results/WF54/result.log`는 경로 착오 증거로 보존한다.
- Plotly checkpoint 최초 저장은 graph 내부 클릭으로 선택이 해제되지 않은 상태여서 저장 보호 안내가 적용되고 다운로드 대기가 만료했다. 실제 ‘슬롯 이동 및 선택’ 탭으로 선택 해제 후 정상 저장했다. export 실패 결함으로 집계하지 않는다.
- WF19의 첫 C4 text selector는 표와 옵션에 동시에 일치했다. role=option으로 한 번 복구했다. 해당 도구 오류와 실제 field 변경 결과를 구분한다.
- 신규 실행 6개 중 PASS 5개, PARTIAL 1개. 확정된 앱 결함은 이번 실행에서 기록하지 않았다. 잔여 WF와 변형은 미완료다. 이전 review의 PASS/PARTIAL을 이번 빌드에서 재검증한 것으로 간주하지 않는다.
- 다음 연속 미실행 항목은 WF20 이미지 연결이다. 생성한 Plotly checkpoint로 WF19/WF55를 재실행할 수 있다. WF80은 기존 결정대로 중복 제외한다.
- 구현·Source Script·pseudocode·버전 메타데이터는 변경하지 않았다. 이번 변경은 공식 dist 재빌드와 신규 결과 문서다. 문서 전용 코드 patch·commit·push는 만들지 않는다.
