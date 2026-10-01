# Review 012 — Mantine cutover completion audit

기준 commit: `a06ea7967e9a23f3b42b22ae33c14146730827ed`

## 목적

`plan-006`의 Mantine 직접 포팅, SoT/API 경계, legacy generic UI 제거, split/portable 회귀 상태를 현재 main에서 다시 확인한다.

이 검토는 새 기능을 추가하거나 EFSM/project model을 바꾸지 않는다. 최근 패치 문서에 남아 있던 후속 작업이 실제로 남아 있는지만 확인한다.

## 결론

현재 main에서 Mantine 전환을 위해 추가로 제거해야 할 legacy generic UI나 migration bridge는 확인되지 않았다.

현재 구조는 다음 경계를 만족한다.

```text
Mantine frontend / UI FSM
        ↓
FastFigureApi 또는 기존 appFSM UI event
        ↓
logic EFSM / project-domain SoT / functional renderer
```

`APP_BUILD = "1.1.31-wip"`은 남아 있지만, 이는 빌드 표식이며 이 검토에서 발견한 미완료 migration code를 의미하지 않는다. 버전 상태 변경은 별도 릴리스 판단으로 남긴다.

## 1. 브라우저 회귀

20261001-001에서 기능 회귀와 구조 감사를 분리해 불필요하거나 실제 요구를 검증하지 못하는 항목을 제거했다.

20261001-002에서 테스트용 `select(slot)` helper가 애플리케이션의 선택 토글 semantics를 잘못 사용하던 문제를 수정했다.

최종 Actions 결과:

- split `file://`: 12/12 pass
- portable `file://`: 12/12 pass
- workflow: `Fast Figure regression` success

현재 필수 기능 회귀:

1. FFPX save/reload
2. mixed CSV/image/graph/merge/label/caption roundtrip
3. empty image/graph slot
4. FFSX graph roundtrip
5. multi-CSV FFSX
6. imported Plotly edit → FFPX
7. Plotly export/import
8. palette save/load
9. collision replace/rename
10. asset delete/reference cascade
11. move-to-trash/reference cascade
12. layout/label preview geometry

pre-Mantine 실물 fixture가 없는 compatibility placeholder, 구현 구조만 검사하는 React root/DOM ID/legacy grep, 실제 file-input 재선택을 검증하지 못하는 API 재호출 검사는 필수 회귀에서 제거했다.

## 2. legacy generic UI / DOM

현재 `Fast-figure.html`에는 native generic UI markup이 없다.

확인 항목:

- `<button>`: 없음
- `<input>`: 없음
- `<select>`: 없음
- `<dialog>`: 없음
- legacy popup markup: 없음

core에서 literal DOM ID로 읽는 항목은 다음 6개이며 모두 현재 renderer 구조에 실제로 존재한다.

- `dashboard`
- `graphArea`
- `dashboardCaption`
- `captionPrefix`
- `captionText`
- `readmeContent`

따라서 no-op legacy control ID는 확인되지 않았다.

## 3. CSS ownership

`Fast-figure.html`의 첫 번째 style block은 vendored Mantine CSS다.

두 번째 Fast Figure 전용 style block은 다음 renderer/surface에 한정된다.

- app/dashboard geometry
- slot/image surface
- graph/Plotly host
- dashboard caption renderer
- label renderer
- slot selection/drag surface
- React bootstrap root positioning

legacy button/input/select/popup/dialog lifecycle을 위한 Fast Figure 전용 CSS는 확인되지 않았다.

즉 버튼 크기, 입력 스타일, Modal 크기/수명주기 같은 generic UI 요소는 Mantine 쪽으로 이동한 상태다.

## 4. Mantine → SoT/API 경계

`fast-figure-ui.js`에서 다음 core/domain 구현에 대한 직접 참조는 없다.

- `activeProject`
- `projectVfs`
- `getSelectedSlot`
- `getChart`
- `createProjectCsv`
- `projectObjects`
- shared `editing` state

영속/기능 값은 `window.FastFigureApi`를 통해 읽거나 변경한다.

`appFSM` 직접 호출은 다음 UI FSM/lifecycle 성격으로 제한되어 있다.

- overlay open/close/toggle
- lifecycle run
- UI state subscribe/read

이는 `plan-006`의 허용 경계다.

## 5. review-011 CSV projection 확인

`review-011`에서 두 번째 SoT 후보로 지적한 공유 projection 변수는 현재 source에 없다.

- `activeCsvId`: 없음
- `activeDataName`: 없음
- `activeDataReady`: 없음

따라서 Mantine CSV 선택 경로가 해당 shared projection에 다시 의존하는 문제는 현재 main에서 확인되지 않는다.

## 6. 기능 inventory 대조

현재 `fast-figure-ui.js`에는 다음 Mantine 영역이 존재한다.

- toolbar
- project/data actions
- image editor
- project asset tree
- project import/export
- graph data/object editor
- graph layout/axis editor
- graph palette
- graph file I/O
- UI palette
- status/debug
- README
- label
- caption
- print/export
- layout
- dashboard file drop

layout의 slot 합치기/나누기, label drag preview, sidebar resize/collapse, debug log save/clear, collision modal 등 `review-010`의 주요 interaction도 현재 구현에 존재한다.

## 7. 유지해야 하는 `legacy` 명칭

`fast-figure.js`에 남은 `legacy` 문자열은 generic UI가 아니다.

- 과거 slot serialization 호환
- 기존 slot caption 기본값 정규화

이 코드는 FFPX/project compatibility와 관련되므로 Mantine 정리를 이유로 삭제하지 않는다.

## 8. 남은 비차단 항목

다음은 migration 완료 조건의 결함으로 보지 않는다.

- 실제 pre-Mantine FFPX fixture가 확보되면 별도 compatibility fixture 검사를 추가할 수 있다.
- pointer drag/file-input 같은 브라우저 미세 interaction은 현재 필수 회귀에 억지로 포함하지 않는다.
- 화면의 세부 시각 품질은 실제 사용 중 발견되는 문제를 개별 UI 패치로 다룬다.
- `1.1.31-wip`을 alpha/release 표식으로 바꾸는 것은 별도 버전 결정이다.

## 다음 작업 항목

Mantine migration 자체를 더 확장하지 않는다.

다음 소스 변경은 실제 사용자 동작에서 확인되는 UI/기능 결함, 또는 별도로 결정한 버전 안정화 작업만 대상으로 한다. 구조 정리를 이유로 EFSM/core/project model을 추가 변경하지 않는다.
