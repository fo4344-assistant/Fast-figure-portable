# Plan 020 — annotation 설정 파일 형식·분리 비용 보완

## 1. 요구·현재 상태

사용자는 설정 파일에 코드를 넣은 점과 분리 비용을 지적하고 수정을 승인한 뒤, 보완 계획 문서부터 추가하도록 요청했다.

- 현재 main: `819a0f5f07fcf4a34410265d1ef7dbc09774b2d9` — Plan 019만 먼저 게시된 상태다.
- Source r35 current/open, fingerprint `sha256:6b1b16ef3e2a0e5725c9fa7b7191bda06265b96cc1844d7a94a130d4d3c97ef9`.
- 로컬에는 Plan 019의 일부 Source 수정과 미게시 `sourcescript/backend/settings/annotations.py`가 있다. 아직 완료/배포된 변경으로 취급하지 않는다.
- 이 계획은 Plan 019 §2의 Python settings 모듈·import 방식과 관련 기본값 계획을 대체한다. 설정 종류별 config 파일을 만드는 계획이 아니다. 공통 `sourcescript/backend/settings.json` 한 파일 안에 label/caption을 데이터 항목으로 둔다. 기존 계획은 결정 이력으로 보존한다. caption 삽입·reference-width export 요구는 유지한다.

## 2. 파일 위치와 형식 — 추가 수정 전에 확정

| 경로 | 책임·처리 |
|---|---|
| `sourcescript/backend/settings.json` | **하나의 공통 설정 데이터 파일.** 그 안의 labels/captions/captionReferenceStyle 항목에 이번 범위의 기본값을 JSON 값으로 기록한다. label용·caption용 파일을 각각 만들지 않는다. 함수/import/정책 설명/계산식은 넣지 않는다. |
| `sourcescript/backend/layout_annotations.py` | 기존 annotation 책임에서 설정의 의미·참조 규칙과 label/order/caption 삽입·geometry 계산을 기술한다. 설정값을 재정의하지 않는다. |
| `sourcescript/backend/project_state.py` | 기본 project 생성·load의 missing field 처리에서 위 JSON의 annotation 기본값을 참조한다. 기존 Project가 실제 저장 설정의 유일한 authority다. |
| `sourcescript/application/public_api/layout_annotations.py`, `sourcescript/backend/project_efsm.py` | 새 입력 전달→current authority candidate 계산→검증→one commit→공식 성공 read 경계를 유지한다. |
| `sourcescript/frontend/renderer.py` | supplied projection/snapshot에 포함된 설정 값으로 caption 측정·reference geometry 비례 render만 수행한다. JSON/Backend를 Frontend가 직접 읽는 경로를 만들지 않는다. |
| `sourcescript/system.py` | JSON이 기존 Backend layout-annotation-domain의 데이터 구성 파일임을 명시한다. 새 논리 계층은 만들지 않는다. |
| `scripts/check-development-layer-versions.py`, `development-versions.json` | 설정 JSON도 Source 의미 변경으로 추적되도록 파일 수집·변경 감지·patch marker·revision/fingerprint 범위를 일치시킨다. |

정리 대상은 미게시 `sourcescript/backend/settings/annotations.py`, 그 전용 디렉터리, 해당 Python import다. `annotation-settings.json`은 아직 파일로 생성하지 않았으므로 만들지 않고 폐기된 경로로 처리한다. Plan 019의 설정별 Python 경로 지시는 본 계획으로 대체되었음을 명시한다. 기존 `sourcescript/backend/layout_annotations.py`는 r28 이전 명세를 분리·재배치한 기존 계산 책임이므로 이번 설정 파일 정리에서 삭제하지 않는다. 재수출/호환 모듈이나 `.py`에 JSON 내용을 복제하는 대안은 두지 않는다. 일반 config loader, plugin, registry, mutable settings cache, 동기화 계층은 추가하지 않는다.

## 3. 분리 이득과 비용 판단

사용자가 기본값을 별도 설정 파일에 두도록 명시했으므로 데이터 분리는 유지한다. 이득은 기본값을 계산 문장과 분리해 한곳에서 확인·수정하고, 같은 기본값을 create/load/reset에서 재사용하는 것이다.

현재 규모에서 settings package/Python 모듈/import 계층이나 설정 종류별 config 파일을 추가하는 이득은 비용보다 크다고 입증하지 못했다. 따라서 기존 Backend 디렉터리에 공통 settings.json 하나만 추가한다. 다른 설정을 이번에 모두 이전하거나 향후 설정별 파일을 늘리는 작업은 포함하지 않는다. JSON 의미 추적을 기존 checker에 포함하는 비용은 피하지 않는다. 그렇지 않으면 값 변경이 Source revision 없이 지나가 추적성이 깨진다. 설정 파일을 별도 runtime state authority로 만드는 비용은 지지 않는다.

## 4. 수정 순서

1. 이 plan을 먼저 게시하고 patch pair로 기록한다. 이 단계에서는 추가 Source 수정을 하지 않는다.
2. 미게시 Python 설정 파일을 JSON으로 대체한다. 기존 하위 구현의 초기값은 호환 근거로만 사용하고 선택 이유는 review에 기록한다. JSON에는 labels/captions/captionReferenceStyle의 값만 둔다. 기존 유효 저장값, false/0/empty를 보존한다.
3. 기존 annotation 명세에서 실제 JSON 경로·key를 식별 가능한 원천으로 참조한다. 생성은 deep copy, load는 missing 기본값 보완, partial edit는 현재 Project 기준, read는 무변경이다. annotation 설정의 해석/검증은 기존 owner에 두며 새 범용 로더를 설계하지 않는다.
4. Plan 019의 나머지 caption 삽입·자동 높이를 이 수정과 함께 하나의 annotation ownership 단위로 정리한다.
   - 전체 visible anchor의 현재 row/column label 순서로 번호를 매기고 slotIds는 filter로만 사용한다.
   - 정확히 같은 문자열 또는 뒤따르는 empty caption은 인접 ordinal 범위로 묶는다. 시작 empty는 label만 남긴다. `(a) A (b) B`, `(a-b) A`, `(a) (b) B`, `(a-b)` 예시를 대조한다.
   - label/group 사이 공백 하나를 두고 기존 global text 끝에 append한다. source caption 자체를 trim/정규화하지 않는다. 기존 text의 마지막 공백은 재사용하고 no target은 unchanged, 반복 호출은 다시 append한다.
   - layout referenceWidth에서 dashboard/caption geometry를 정하고 목표 width/referenceWidth로 비례 scaling한다. DPI metadata에 pixel width를 이중 scaling하지 않는다. explicit total height와 raster limits/오류·resource cleanup 계약은 유지한다.
5. checker는 Python Source와 공통 settings.json을 함께 fingerprint한다. `--base`의 source 변경 감지, 누적 patch의 JSON diff marker 확인, revision 증가 검사도 같은 범위를 사용한다. JSON만 바뀌어도 새 Source revision이 필요하다. 기존 `.github/workflows/development-layer-version.yml`의 `sourcescript/**` trigger는 이미 JSON을 포함하므로 무관한 workflow 변경은 하지 않는다.
6. 새 Source revision/fingerprint와 review를 기록하고 lower stale를 유지한다. closure는 별도 전체 검토 없이 닫지 않는다. 실행 검증은 GitHub Actions cumulative version checker만 사용한다. 로컬 Source/application/checker/test/build/TLC는 실행하지 않는다.

## 5. 검증과 산출물

- 설정 파일이 JSON 데이터만 포함하는지, Python settings 경로/import/중복 기본값이 남지 않는지 정적 대조한다.
- JSON만 변경되는 경우도 Source 파일 수집/변경 감지/patch 기록 대상인지 checker 경로를 대조한다. JSON missing/malformed는 조용히 기본값을 새로 발명하지 않고 검사 실패로 드러나야 한다.
- fresh/create/load saved/missing, position reset, caption grouping/initial empty/filter gap, referenceWidth/2배 width/DPI-only/explicit height/raster failure를 정적으로 대조한다. 이를 실제 runtime 테스트 성공으로 표현하지 않는다.
- 실제 수정 결과 review 경로: `agent_space/reviews/review-20261016-017-annotation-r36-open.md`.
- 이 계획만의 기록은 `agent_space/patches/20261016-021.patch/.md`로 둔다. Plan 019의 해당 번호 예약은 이 계획 단계의 기록으로 대체한다. 이후 Source 변경은 다음 미사용 번호로 별도 기록한다.
- 모든 기록은 실제 시작 HEAD→semantic endpoint의 cumulative diff다. Contents API의 순차 HEAD/blob/new-path 확인과 pair의 사후 게시 한계를 명시하며 atomic multi-file commit이라고 주장하지 않는다.

## 6. 제외·중단 조건

정책 변경, 새 설정 프레임워크, lower JS/PlusCal/model/tests/dist 구현, 전체 closure 선언은 제외한다. 이 보완 계획의 게시에는 Source/metadata 수정이나 runtime/checker 실행을 섞지 않는다. 원격 HEAD 충돌이나 사용자 요구와 다른 새 의미가 발견되면 먼저 대조하고 stale 기준으로 덮어쓰지 않는다.
