# Source Script r28 — import와 의미 계층 파일 배치 / OPEN

- 날짜: 2026-10-16
- 기준 main: `b3cd9648ff6705f07510c8b3c4947d4276ffdb61`
- 요구: 사용자 지시에 따라 `참조 Source Script` 목록 대신 import 표기를 사용하고, 평면 파일 배치를 의미상 module hierarchy에 맞게 정리한다.
- 선행: Plan 017, `review-20261016-005-plan017-r27-open.md`.
- 판정: 구조 정리 단위이며 전체 Source Script closure는 **open**이다. 하위 PlusCal/model/code는 stale을 유지한다.

## 1. 적용 근거와 책임 배치

`agent_space/policies/development-policy.md` §3.2.1–3.2.3과 §4.3.2를 재확인했다. 부모–자식은 호출/재사용 관계가 아니라 `Meaning(child) ⊆ Meaning(parent)`이며, import는 다른 Source Script의 책임과 식별자를 재사용하는 명세 표기다. 정책 원문은 수정하지 않았다.

기존 `system.py`의 Backend / Application boundary / Frontend / Portable build 의미 계층을 유지했다. domain과 wrapper/UI가 함께 있던 물리 파일은 각 기존 logical owner의 경로로 분리했다. 새로운 중간 authority나 독립 논리 decomposition은 추가하지 않았다.

```text
sourcescript/
├─ system.py
├─ backend/
│  ├─ project_state.py
│  ├─ project_efsm.py
│  ├─ assets_files.py
│  ├─ graphs.py
│  └─ layout_annotations.py
├─ application/
│  ├─ adapter.py
│  └─ public_api/
│     ├─ __init__.py
│     ├─ assets.py
│     ├─ graphs.py
│     └─ layout_annotations.py
├─ frontend/
│  ├─ interface_fsm.py
│  ├─ mantine_ui.py
│  └─ renderer.py
└─ portable_build/
   └─ portable_build.py
```

- Backend: authority/query/validation/candidate/serialization 계산. Application 또는 Frontend를 import하지 않는다.
- Application: adapter와 public wrapper. Backend의 query/command를 호출하고, 반환된 immutable 입력으로 Frontend를 조정한다.
- Frontend: FSM, Mantine-local interaction, supplied-input renderer. Backend를 import하지 않는다. renderer는 callback/projection/snapshot을 명시적 입력으로 받아 API/FSM을 재귀 호출하지 않는다.
- Portable build: runtime의 자식이 아닌 system-level packaging 책임을 그대로 유지한다.
- `application/public_api/`의 네 파일은 기존 하나의 public-api 논리 모듈을 구성하는 물리 파일이다. assets/graphs/layout을 별도의 논리 하위 계층으로 새로 승격하지 않는다.

## 2. import·절차 연결

- 평면 모듈 import와 `참조 Source Script` 서술 목록을 제거하고 실제 `sourcescript.backend...`, `sourcescript.application...`, `sourcescript.frontend...`, `sourcescript.portable_build...` 경로를 사용했다.
- `system.py`는 실제 모듈을 import하고 기존 hierarchy의 owner를 현재 module path로 연결한다. 중복된 평면 파일 목록은 제거했다.
- Backend 내부 state/domain dependency는 실제 module import로 식별한다. state가 선언된 뒤 provider dependency를 연결하고 asset/domain 간에는 module import를 사용해 불필요한 초기화 순환을 피한다. 이를 Python runtime import 성공의 실행 증거로 주장하지 않는다.
- graph one-object edit 계산 규칙은 기존 Backend `graphEditorCommit` 명세로 옮겼다. Application `graphEditorObjectValues`는 새 values 전달과 성공 후 query만 소유한다. 계산 규칙을 복제하거나 새 candidate authority를 만들지 않았다.
- export의 기존 공개 이름은 Application wrapper에 유지한다. 공식 export query의 한 작업용 snapshot을 Frontend `renderDashboardTarget(snapshot, statusSink)` / `renderDashboardCurrent(snapshot, statusSink)`로 전달한다. raster renderer가 Backend snapshot helper를 직접 호출하지 않는다. snapshot은 기존 color/style과 raster 제한을 제공하고 capture는 persistent target settings를 변경하지 않는다.
- 평면 compatibility/re-export 파일은 남기지 않았다. 하위 단계의 import 또는 logical path 재전파를 완료한 것으로 취급하지 않는다.

## 3. 정적 대조와 한계

- 기존 함수/클래스와 계약을 각 owner 경로에 옮기고 import 대상 선언과 파일 경로를 대조했다. co-location을 전제로 하던 설명과 제거된 평면 경로를 현재 Source Script에서 정리했다.
- Frontend에 Backend import가 없고 Backend에 Application/Frontend import가 없음을 텍스트로 확인했다. renderer가 Application API를 import해 순환 호출하는 연결도 두지 않았다.
- Source Script는 Python 표기의 구현 명세다. 로컬 application, Source Script import, 테스트, version checker, build, TLC는 실행하지 않았다. 로컬 작업은 파일 편집·읽기·Git diff/hash/전송으로 제한했다.
- fingerprint와 revision을 r28로 갱신했다. 전체 계층 검사는 GitHub Actions의 기존 version workflow에서 최종 patch 쌍이 존재하는 HEAD에 대해 baseline을 명시하여 수행한다. 실제 run/commit/결과는 `20261016-011.md`에 별도 기록한다.
- 이번 diff는 구조·책임 배치 정리다. Plan 017 D/E의 전체 공개 API trace, numeric/axis/Plotly field별 계산, concrete default/palette 원천은 여전히 미완료이며 closed 근거가 아니다.

## 4. 닫힘과 후속 전파

- 논리 완결성: owner와 dependency를 명시했지만 위 미정 계산/전체 왕복 trace가 남으므로 open.
- 프로젝트 목적: figure 편집/import/export의 기존 기능·참조·실패·current-authority commit 의미를 보존하는 배치이며 기능 축소나 새 persistent schema를 도입하지 않았다. 실행 등가성은 이번 검토로 증명하지 않았다.
- 중복/통합: 평면 잔존 bridge와 중복 모듈 목록을 두지 않고, Backend 계산 / Application 조정 / Frontend 표현으로 기존 책임을 모았다. 호출되는 모듈을 호출자 밑으로 재부모화하지 않았다.
- 이후 Source Script의 미정 의미와 전체 trace를 먼저 해소하고 closure 근거를 갖춘 뒤 PlusCal → 선택적 model → Source Code 순서로 현재 논리 hierarchy와 import dependency를 전파해야 한다.
