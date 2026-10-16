# Source r37 — Backend 설정 계층/데이터 분리

## 기준·결론

사용자 요구: 프로젝트 오브젝트의 저장 설정과 Backend 기본 설정을 분리하고, 전체 설정 중 Backend만 한 config에 모은다. ProjectObject와 비슷한 경로를 사용하되 프로젝트 데이터 자체를 넣지 않는다.

- baseline `a65decea01ca08639cc9d207f560dfececdb72b9`, Plan 021 먼저 게시 `17aae6445abd3a388d1a2f03b1cbb2e9a9be070e`.
- Source37 current/open, fingerprint `sha256:c94c310a8611c1f8994e5fe38ab5d0f8cd74ed0ecf4d902cada885d92278de5b`. 하위 stale 유지. 설정 소유권을 통합한 것이며 전체 closure 판정이 아니다.

## 파일·구조

`sourcescript/backend/settings.json` 한 파일이며 루트는 `backend`만 둔다. Frontend 블록을 빈 placeholder로도 만들지 않는다. 전체 설정이 결합될 때 이 JSON의 backend 섹션이 해당 부분을 담당한다.

| 경로 | 값의 의미 / 소비 owner |
|---|---|
| backend.project_object.ffpx.formatVersion | Project package 호환 설정, assets_files의 version 검사/기록. Project instance에 ffpx block을 추가하지 않음 |
| backend.project_object.layout | gridRows/gridCols/slotStyle의 초기 저장 설정, project_state create/load 및 layout reset |
| backend.project_object.annotations.labels/captions | enabled/settings/nameBold 등 저장 설정, annotation create/load/reset |
| backend.project_object.appearance.uiPalette | 실제 프로젝트 palette의 기본값, Project appearance create/reset/normalize |
| backend.project_object.export | heightMode/dpi/format 기본 설정. width는 layout.referenceWidth에서 계산하며 결과 geometry는 config에 저장하지 않음 |
| backend.defaults.slotSettings.content | 새 slot의 contentType/imageSettings prototype. chart/image/caption reference는 생성 알고리즘이 별도로 empty 구성 |
| backend.defaults.chartSettings.editor | axis/globalSettings/axisVisibility/objectStyle의 설정 prototype, graph normalization/trace fallback. chart/object instance 아님 |
| backend.defaults.graphColors | graph object 색 순환. appearance UI palette와 별도 의미 유지 |
| backend.defaults.graphRendering | title/legend font fallback, grid/zero-line 색, margin. figure는 기존 graph 계산이 만듦 |
| backend.defaults.captionReferenceStyle | caption reference 측정 입력. Backend가 export 작업 projection에 copy하고 Frontend는 supplied 값만 소비 |
| backend.defaults.limits | layout/image/label/caption/graphObject/export 수치 한계. 기존 validation과 numeric clamp가 사용 |
| backend.defaults.vfs | root/csv/image/trash 고정 경로. directory instance는 생성/복원 알고리즘이 만듦 |
| backend.defaults.naming | 프로젝트 이름/다운로드 stem 길이 한계 |
| backend.defaults.preview | Backend layout query의 preview width bounds/fallback. session zoom/lock은 포함하지 않음 |

`project_object`는 설정 leaf의 구조를 Project와 대응시킨 것이지 프로젝트 직렬화 payload가 아니다. `defaults`는 저장 설정 바깥의 생성/동작 prototype이다. 두 블록 모두 immutable config 데이터이며 현재 Project와 양방향 동기화하지 않는다.

## 제거·잔류 항목 대조

- project_state의 slotStyle/UI palette/slot-local 설정 목록, graphs의 color/axis/global/style/render defaults, layout의 수치 제한, assets의 version/VFS, EFSM의 이름 길이 값을 config로 이동했다. 기존 DEFAULT 이름은 값 목록을 다시 가진 상수가 아니라 **Source 표기의 config 경로 참조**다. Python runtime에서 문자열을 설정 객체로 실행한다고 주장하지 않는다.
- Backend 밖 Application 문서의 preview/reset/print/naming/VFS 복제값도 같은 Backend 경로를 사용하도록 수정했다. readLayoutApiState omitted default는 None으로 전달하고 Backend가 기존 fallback을 적용한다. 유효 caller width의 의미는 바꾸지 않았다.
- 기존 JSON의 captions.text/afterText/name은 제거했다. 신규 Project의 empty 본문/이름은 instance 생성 알고리즘에서 만들고 valid 저장 데이터는 복원한다. config가 caption 본문/asset bytes/CSV rows/chart/slot collections/id/nextId를 소유하지 않는다.
- EMPTY_CSV_TEMPLATE의 rows/filename과 빈 SVG의 bytes/dimension은 **생성되는 asset 데이터의 구조**이므로 config에 이동하지 않았다. 각 codec 파일 경로/ZIP STORE/CRC32/UTF-8, event/command/모델 schema·enum 의미도 설정값이 아니라 기존 형식/알고리즘이다.
- 1x1 cell 구성, Roman/base26 numbering, log10/reciprocal, zero identity, geometry의 0.49 안전 clamp는 계산 규칙이며 동작값 목록을 만드는 옵션으로 변환하지 않았다. Frontend zoom/lock/contrast/theme 계산도 Backend 설정으로 가져오지 않았다.
- 이전 flat JSON 경로는 현행 Source에서 새 backend 경로로 교체했다. Python settings 모듈/loader/service/registry, 두 config를 동기화하는 호환 bridge는 추가하지 않았다. 과거 plan/review/patch의 기록은 역사 자료로 유지한다.

## 정적 생성→소비 대조 — runtime test 아님

1. create: configured grid 크기로 cells 생성 → 저장 설정만 복사 → assets/charts empty, data references/ids 별도 생성 → whole validation. config에 실제 project instance 없음.
2. load: valid stored settings/data 유지 → missing 설정만 owner 경로로 보완 → whole validation. config 변경으로 기존 Project 전체를 덮지 않음.
3. reset: 대상 설정만 config leaf에서 복사하고 다른 사용자 데이터는 기존 reset 의미 유지. labels position도 새 annotations 경로 사용.
4. graph: current object/axis 값 우선 → config fallback/bounds → same-project trace/layout. 실제 object/data/figure를 config에 넣지 않음. palette index는 고정 8 대신 config sequence length 사용.
5. export: current pixel width/DPI/heightMode 유지 → limits/naming/style만 config에서 참조 → snapshot에 필요한 값 전달 → renderer는 config를 직접 읽지 않음.
6. VFS: config 경로를 create/lookup/trash/export가 함께 사용. 상이한 hardcoded directory를 새 권위로 남기지 않음.
7. checker: JSON이 Source fingerprint/revision/patch 범위에 포함. backend/project_object/defaults 및 필수 object 경로와 graphColors를 검사하고 project data/Frontend key 혼입을 거부한다. 모든 수치/enum의 application validation을 이 checker가 대신한다고 주장하지 않음.

## 복잡도·전파·제외

하나의 데이터 파일과 기존 owner의 경로 참조로 통합했다. config 전체를 Project에 merge하거나 현재 Project를 config의 사본으로 유지하는 대안은 instance/기본 설정 권위를 섞으므로 기각했다. 설정마다 파일/새 Python settings package를 만드는 대안도 불필요하다. 일반 schema engine을 도입하지 않았다.

정책/하위 JS/PlusCal/model/tests/dist 변경 없음. 설정 재배치는 값·허용 범위를 유지한다. Source closure는 open이며 lower 번역 때 이 backend 경로/기본값 참조를 반영해야 한다. 전체 왕복·purpose/integration 검토나 runtime/시각 성공을 선언하지 않는다.

## 실제 검사 기록

로컬 Source/application/checker/test/build/TLC 실행 없음. bytes-only fingerprint, actual diff/check 및 격리 index patch 검사는 runtime 검증과 구분한다. 순차 Contents API로 source-before-metadata push는 일시 실패할 수 있다. 실제 cumulative Actions run/HEAD/BASE_SHA/결과는 patch 023 게시 후 기록한다. 실행 전 결과를 PASS로 쓰지 않는다.
