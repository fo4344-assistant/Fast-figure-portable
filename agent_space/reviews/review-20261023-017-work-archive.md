# .work 중요 자료 이동 및 Plan 016 diff 출처 조사

## 요청과 범위

사용자는 저장소 상위 `.work`의 중요 데이터를 프로젝트 내부로 옮기고 `plan016-*.diff`가 정식 patch와 다른 이유를 확인하도록 요청했다. 기준 local HEAD는 `444f7b726fee2c5cb038281f5fa1057114d3b978`이며 시작 시 작업 트리는 깨끗했다. 구현/상위 명세를 수정하거나 폐기된 코드를 복원하는 작업이 아니다.

## 이동 결과

저장소 상위 `.work`에서 `agent_space/logs/20261023-work-archive/`로 원본 38개, 총 755203 bytes를 이동했다.

- `ffsx-r48-evidence/`, `graph-r47-evidence/`, `image-r44-evidence/`, `merge-r43-evidence/`, `print-r45-evidence/`, `reference-r46-evidence/`: 과거 Actions build/regression/version 및 watch 원시 로그 33개. 실패와 보정 후 로그를 모두 보존한다.
- `grid-r42-evidence/source-pseudocode-trace.md`: 당시 static coverage/binding trace 1개. 원문의 `Coverage/binding only; not semantic execution, PlusCal parser or TLC evidence.`를 그대로 유지한다. 현재 Source/PlusCal 대응 검증으로 승격하지 않는다.
- `plan016-snapshots/plan016-{code,local,pluscal,sources}.diff`: 출처 조사 대상 원본 4개. 정식 적용 patch가 아니라 과거 비교 범위/폐기 초안의 원시 기록이다.
- 저장소 상위 `.work/plan022/verified-trace/source-pseudocode-trace.md`는 위 grid trace와 byte-identical이었다. 이동된 원본의 SHA-256을 다시 확인한 뒤 중복 1개만 제거했다.

`agent_space/logs/20261023-work-archive/inventory.json`은 각 이전/이후 경로, byte 수, SHA-256 및 중복 제거 근거를 기록한다. 원본 bytes는 줄바꿈까지 보존했으며 이동 전후 hash를 대조했다. 인덱스, 일회성 publish/record/hash 스크립트, context dump와 기존 Git에 남은 hierarchy 원본은 이번 중요 자료 이동에 포함하지 않았다. 상위 `.work` 전체를 삭제하거나 프로젝트 내부 `.work`와 합치지 않았다.

## Plan 016 diff: 확인 방법

파일명이나 내용 유사성만으로 판정하지 않았다. 각 `index OLD..NEW`를 Git blob 이력과 대조하고, 실제 commit 범위의 `git diff --no-ext-diff BASE END -- PATHS` 결과를 원본 Buffer와 비교했다. 아래 세 파일은 **전체 bytes가 정확히 같다**. 기존 정식 patch에 일부 hunk가 포함된다는 관찰보다 강한 출처 근거다.

| 보존 파일 | 재현 가능한 Git 범위 | 대상 | byte 수 / 결과 |
|---|---|---|---|
| `plan016-sources.diff` | `b4b4d6c848280cda9fb48f972c59e2eca2c00ba4` → `83a0c1d6006c232ee9e799f29ff37d7930191dcb` | `sourcescript` | 71725 / exact |
| `plan016-pluscal.diff` | `6d1ea642488db1797784c124763c39a2ad630ee0` → `cae114657319257557759a917e825d2688d37fe2` | `pseudocode` | 53844 / exact |
| `plan016-code.diff` | `b4b5634519129c8312504e283ab0e7293e380f60` → `9ef0455e1a06523ac67b297c17fb33d03eaf168c` | `fast-figure-ui.js fast-figure.js` | 37803 / exact |

위 세 파일은 미반영 결과물이 아니라 **이미 Git 이력에 들어 있는 변경을 계층별로 모은 누적 비교**다. 정식 `YYYYMMDD-NNN.patch`와 baseline/endpoint, 포함 경로가 다르다. Source diff는 2026-10-15 r24/r25 경계 변경을, PlusCal diff는 같은 날 경계 번역을, code diff는 더 오래된 JS baseline부터 2026-10-16 image boundary까지를 포함한다. 정식 patch와 byte hash가 다르다는 사실은 이 셋의 유실·손상 근거가 아니다.

### plan016-local.diff만 다른 이유

이 파일은 committed image-boundary 상태 위에 추가하던 palette JS/회귀 초안이다. 원본 hunk를 old Git blob에 메모리에서 대조·재구성하여 new blob ID를 확인했다. 작업 트리에 적용하지 않았다.

| 경로 | 기존 blob | 재구성된 초안 blob | reachable Git 이력 |
|---|---|---|---|
| `agent_space/tests/browser-regression.js` | `94c0d36ac3198f49f3861a44028286a3c09e0739` | `06dc038c601bb56cd217eaaabdd4e5f3997d096f` | new blob 없음 |
| `fast-figure.js` | `b146f77359ca2cab965fead8834ed06f1f720bbb` | `07c5923a519be94540d07dbf9198d8c6ac66567c` | new blob 없음 |

두 재구성 ID 모두 diff header와 일치했다. `git log --all --find-object=FULL_NEW_BLOB`에는 두 new blob의 변경 이력이 없다. 내용은 `appearance.readPalette`/`ui-palette` query, CSS projection 분리, palette case 41 추가다.

폐기 근거도 기존 문서에 명시되어 있다.

- `agent_space/reviews/review-20261016-004-sourcescript-r26-open.md:5`: baseline `1b854ba7ace34614b17c4cda21747882629c22af`는 사용자 요청으로 미커밋 palette JS/test를 폐기한 뒤의 remote main이다.
- `agent_space/patches/20261016-008.md`: discarded palette code/tests를 복원하지 않고 Source Script부터 고친다고 기록한다.
- `agent_space/plans/plan-016.md:1294`: 미커밋 palette 변경은 폐기됐고 해당 단위에서 복원하지 않는다고 기록한다.

결론: 이 초안이 정식 patch에 그대로 없었던 것은 **게시 누락이 아니라 당시 사용자 요청에 따른 폐기**와 일치한다. 현재 구현에 재적용하거나 정식 patch로 재분류하지 않는다. 과거 초안을 확인할 수 있도록 원본만 보존한다.

## 별도로 구분한 실제 과거 patch 오류

`agent_space/patches/20261016-004.md`는 당시 정식 002/003 patch가 local index에 없는 새 review를 삭제 diff로 잘못 표현하여 실제 시작/종료 commit 비교로 001–003을 재생성했다고 기록한다. 이는 위 네 `.work` 비교 파일의 출처와 별개인, 이미 기록된 과거 patch 생성 오류다. 지금 네 diff가 정식 patch와 다르다는 이유만으로 같은 오류라고 단정하지 않는다. 기존 정식 기록은 덮어쓰지 않는다.

## 검증 한계

이번 확인은 파일 이동/hash/중복 비교, Git object·commit diff 대조 및 기존 폐기 기록 확인이다. 로그는 과거 run의 원시 기록이며 새 실행 결과가 아니다. application/test/build/version checker/Actions/TLC는 실행하지 않았다. Source/PlusCal/code/lineage와 기존 pending 상태는 바꾸지 않았다. 단계1 또는 전체 번역 완료를 주장하지 않는다.
