# Plan 021 — Backend 설정 데이터의 계층·원천 통합

## 요구·범위

프로젝트 오브젝트에 저장되는 설정의 기본값과 Backend 동작/생성 기본값을 분리한다. 전체 설정의 backend 부분만 기존 `sourcescript/backend/settings.json` 하나가 담당한다. Frontend placeholder/설정, 실제 project instance/asset/chart/slot 데이터, caption 본문, id/nextId, bytes/rows 등을 넣지 않는다. Python settings 모듈이나 파일별 registry를 추가하지 않는다.

## 위치·형태

- `backend.project_object`: ProjectObject의 layout / annotations.labels·captions / appearance.uiPalette / export 경로에 대응하는 **설정 field만** 기록한다. ffpx.formatVersion은 package 호환 설정이며 Project instance로 복사할 field가 아니다.
- `backend.defaults`: 새 slot/chart의 설정 prototype, graph color sequence, caption reference style, VFS root, name length, validation/export 한계 및 graph presentation 기본값. 실제 slot/chart instance는 만들지 않는다.
- schema/command/event/파일 codec/계산 알고리즘/참조 관계는 기존 Source owner에 남긴다. 설정과 무관한 상수·숫자까지 무차별 JSON화하지 않는다.

## 작업 순서

1. 기존 Backend 다섯 파일의 기본값/제한/설정 목록을 대조하고 config를 재구성한다. 기존 숫자·색·허용 범위의 의미는 유지한다.
2. project_state/graphs/layout_annotations/assets_files/project_efsm의 정의·reset/load/render 참조를 같은 config 경로로 연결한다. 기존 이름은 config 참조일 뿐 독립 값 목록/복제 권위가 아니다.
3. 기존 caption 본문/name/afterText 초기 empty는 데이터 생성 알고리즘에 남기고 config에서 제거한다. slot의 null chart/image/caption도 설정 prototype에 넣지 않는다.
4. Frontend는 supplied projection만 소비한다. Backend config를 직접 import/read하지 않는다. 기존 Application의 Backend default import는 config로 파생된 공식 default read 경로와 일치하도록 유지한다.
5. Source r37 fingerprint/lineage 기록, checker가 backend 구조와 데이터 혼입을 검증하도록 한정 보완한다. actual cumulative patch와 review 기록 후 GitHub Actions cumulative checker 실행.

## 진행 기록

- 계획 먼저 main `17aae6445abd3a388d1a2f03b1cbb2e9a9be070e`에 게시한 뒤 Source r37 변경.
- `backend.project_object`와 `backend.defaults`로 기존 한 JSON을 재구성하고 Backend 5개 owner 및 Application/renderer의 관련 경로 참조를 정리했다. 실제 프로젝트 데이터와 Frontend 설정을 config에서 제외했다.
- 상세 이동·잔류 목록, 정적 생성→소비 대조, 제외 범위: `agent_space/reviews/review-20261016-018-backend-config-r37-open.md`.
- Source37 current/open, lower stale 유지. actual patch 023 및 endpoint diff/reverse cached apply check PASS. cumulative Actions `38867034222`도 PASS (HEAD `1478969a5638ceaad8ba83f76a954b925d563bb3`, base `a65decea01ca08639cc9d207f560dfececdb72b9`). 이 결과 문서는 실행 후 후속 기록이다. 정적/checker 검사는 runtime/전체 closure 증거로 부풀리지 않는다.

## 제외·완료 조건

정책/lower JS/PlusCal/model/tests/dist 변경과 Source closure 선언 제외. 아직 실제 소비 경로가 없는 값을 상상해 추가하지 않는다. Config는 mutable Project와 동기화하지 않으며 valid 저장값은 유지한다. JSON 변경만으로 기존 Project나 package version을 자동 migration하지 않는다. 전체 Backend 설정 목록의 이동/잔류 이유와 생성→소비 경로를 review에 기록한다. 새 framework를 만드는 비용은 필요하지 않다.
