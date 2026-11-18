# 현재 작업영역 렌더링 범위 검토

- 기준: `8edca8e56cc1698623c5ee81220e47b22cd71845`의 source code.
- 방법: 실제 호출자, Backend 표시 조회, 작업영역 DOM 구성, Plotly 실행·완료·resize 경로를 정적으로 대조했다. 브라우저 재현과 호출 횟수 측정은 수행하지 않았다.
- 범위: 현재 작동 방식의 조사. 수동 Render 버튼 추가와 자동 갱신 차단은 수행하지 않았다.

## 1. 결론

**작업영역 전체를 대상으로 갱신을 시작하고, 그 안의 각 그래프 슬롯을 별도의 Plotly host에서 그리는 구조다.**

따라서 다음 두 사실을 구분해야 한다.

1. **Plotly 실행 단위는 그래프 슬롯이다.** 각 슬롯에 별도의 plot DOM, chart 연결, 비동기 작업이 있다. 작업영역 전체를 하나의 Plotly 그림으로 만드는 구조는 없다.
2. **갱신 요청의 범위는 여러 주요 경로에서 작업영역 전체다.** 그래프 하나의 설정이나 object를 바꾸어도 전체 표시 경로를 호출한다. 이 경로는 보이는 그래프 슬롯을 모두 순회하여 각 슬롯에 Plotly 갱신을 예약한다.

현재 방식은 ‘변경된 슬롯 하나만 골라 다시 그리는 방식’으로 설명할 수 없다. 다만 모든 변경이 항상 전체 갱신으로 이어지는 것도 아니다. caption·label·이미지 설정 등의 부분 갱신과 표시를 생략하는 분기가 있다.

## 2. 전체 갱신의 실제 흐름

```text
그래프/슬롯/레이아웃 변경
  → dispatchProjectCommand: Backend 반영과 Frontend 참조 보정
  → 현재 작업영역 전체의 renderer projection 조회
  → 공개 API 호출자가 renderDashboard 또는 invalidation 적용
  → renderDashboardProjection
      → 전체 슬롯 틀 구성/재사용
      → 각 그래프 슬롯에 presentSuppliedGraph 예약
      → 각 plot DOM에 Plotly.react
      → 슬롯별 완료 Promise를 Promise.all로 모음
```

### 2.1 조회부터 전체 슬롯을 준비한다

- `sourcecode/application/adapter.js:175-184`의 `dispatchProjectCommand(event, payload = {})`는 반영 성공 후 현재 Frontend 참조로 renderer projection을 조회한다. 이 함수 자체에서 Plotly를 실행하지는 않는다.
- `sourcecode/backend/project_state.js:476-488`은 renderer 요청을 `buildBackendSurfaceRead(source)`로 처리한다.
- `sourcecode/backend/project_state.js:558-582`의 `buildBackendSurfaceRead(source)`는 숨김 슬롯을 제외한 모든 슬롯을 순회하고 각 chart의 `figure`를 만든다. 선택 슬롯 하나만 조회하는 분기는 아니다.

### 2.2 전체 표시 함수는 슬롯별 자원을 재사용하면서 모두 순회한다

`sourcecode/frontend/renderer.js:633-733`의 `renderDashboardProjection(projectProjection, interfaceState, frontendActions = {})`는 다음을 수행한다.

- 작업영역 공통 generation을 증가시킨다.
- 사라졌거나 chart 연결이 달라진 그래프 host를 정리한다. 기존 이미지 표시 자원도 해제한다.
- `renderDashboardFrame`으로 전체 grid와 슬롯 틀을 구성한다.
- 보이는 슬롯을 모두 순회한다. 같은 slot/chart의 살아 있는 그래프 host는 재사용하고, 필요한 경우 새 host를 만든다.
- 각 그래프 record에 `presentSuppliedGraph`를 호출한다. 이 루프에는 ‘이번 명령에서 변경된 슬롯인가’ 또는 ‘이전 figure와 같은가’에 따라 생략하는 검사가 없다.
- 이미지와 빈 슬롯의 content, 선택 표시, label, caption도 해당 전체 표시 경로에서 적용한다.

`sourcecode/frontend/renderer.js:124-158`의 `renderDashboardFrame(host, layout, visibleSlots, geometry)`는 grid/slot/content/decoration DOM을 구성하는 공통 함수다. 이 함수 자체는 Plotly를 호출하지 않는다. 전체 표시라고 해서 매번 모든 그래프 DOM을 버리고 새로 만든다는 뜻도 아니다.

## 3. Plotly는 슬롯마다 별도로 실행한다

`sourcecode/frontend/renderer.js:447-482`의 `presentSuppliedGraph(record, slot, selected, generation, scale, frontendActions)`에서 실제 `Plotly.react(record.plot, ...)`가 실행된다.

- `rendererRuntime.graphInstances`는 slot id별 record를 보관한다. record에는 해당 슬롯의 host, plot, chartId, generation, pending 작업이 있다.
- `record.pending`에 다음 작업을 연결하므로 **같은 plot host의 갱신은 앞선 작업이 끝난 뒤 순서대로 실행**된다.
- 서로 다른 슬롯의 pending 작업 사이에는 이 함수가 정하는 전역 직렬 실행 순서가 없다. 전체 표시 함수는 이들을 예약한 뒤 `Promise.all`로 완료를 모은다.
- 예약 후 generation·operation·slot/chart·host 연결이 달라진 오래된 작업은 실행 또는 완료 적용을 건너뛴다.

그러므로 그래프 슬롯이 세 개이고 host가 계속 유효한 상태에서 하나의 그래프 설정을 변경하면, 현재 전체 표시 경로는 세 슬롯 각각에 Plotly 갱신을 예약한다. 이는 코드 흐름의 예시이며 실제 브라우저에서 세 번의 호출을 계측한 결과는 아니다.

## 4. 슬롯 선택도 선택 표시만 바꾸는 경로가 아니다

- `sourcecode/application/public_api/layout_annotations.js:14-21`의 `setSelectedSlot`은 선택을 처리한 뒤 `updateGraphView`와 resize 예약을 호출한다.
- `sourcecode/application/adapter.js:99-102`는 이를 `updateGraphViewProjection`으로 전달한다.
- `sourcecode/frontend/renderer.js:571-600`의 `updateGraphViewProjection`은 기존 host와 현재 슬롯 연결을 먼저 검사한다. 일치하지 않으면 전체 표시 함수로 전환한다.
- 기존 host가 모두 일치해도 **모든 그래프 슬롯**의 `presentSuppliedGraph`를 호출한다. 선택 여부에 따른 Plotly의 `staticPlot` 값도 이때 전달한다.

따라서 유효한 슬롯 선택·선택 해제는 DOM의 selected class만 갱신하는 작업에 그치지 않으며, 선택하지 않은 다른 그래프의 Plotly 갱신도 예약할 수 있다.

## 5. 동작별 갱신 범위

| 동작 | 현재 호출 경로와 범위 |
|---|---|
| 그래프 object 추가·값 변경·이동·삭제, CSV header 변경, editable 변경, graph layout/palette 변경 | `sourcecode/application/public_api/graphs.js:25-172`에서 반영 성공 후 `renderDashboard` 호출. 작업영역 전체 표시와 슬롯별 Plotly 갱신. |
| 슬롯 교환·merge/split·종류 변경·reset | `sourcecode/application/public_api/layout_annotations.js:8-76`에서 성공 후 전체 표시. |
| 작업영역 zoom 설정·100% 복귀 | `sourcecode/application/public_api/layout_annotations.js:303-319`에서 session revision이 바뀌면 전체 표시. |
| caption 켜기/끄기, label/이미지 설정, UI palette, layout/grid 변경 | 각 공개 API가 `applyDashboardProjectionInvalidation`으로 전달하며, 이벤트와 host 관계에 따라 아래 부분 갱신 또는 전체 표시를 선택. |
| caption text·이름·글꼴 등의 편집 | `sourcecode/application/public_api/layout_annotations.js:145-201`의 global caption 계열은 caption 동기화 함수를 직접 호출한다. `setSlotCaptionText`는 명령과 성공 후 슬롯 caption 조회를 수행하며 이 함수에서 작업영역 표시를 직접 호출하지 않는다. |
| 경로 이동 등 | `projectionEffect.pathOnly`가 참이고 제거된 참조가 없으면 invalidation은 `NONE`을 반환. 모든 이동·삭제를 동일하게 생략하는 규칙은 아님. |
| 초기 시작 | `sourcecode/frontend/renderer.js:604-613`에서 controller 준비와 전체 표시 실행. |
| 작업영역/창 크기 변화 | `sourcecode/frontend/renderer.js:252-278`에서 전체 refresh 또는 resize를 요청. Render 버튼과 무관한 자동 경로가 현재 존재함. |

### 부분 갱신도 ‘변경된 슬롯만’과는 다르다

`sourcecode/frontend/renderer.js:485-547`의 `applyDashboardProjectionInvalidation`:

- caption 계열은 caption 표시를 갱신한다.
- label 계열은 슬롯을 순회하여 label을 갱신한다.
- 이미지 설정은 표시 중인 이미지 슬롯들을 순회하여 style을 갱신하며 해당 분기에서 Plotly를 호출하지 않는다.
- `APPEARANCE_CHANGED`는 CSS 색상을 적용하고 모든 그래프 record에 `presentSuppliedGraph`를 호출한다. 부분 갱신이라는 분류라도 Plotly 대상이 한 슬롯에 한정되지는 않는다.
- 위 이벤트 외의 변경, 제거된 참조, host 불일치이면 전체 표시로 전환한다.

## 6. resize·React·출력용 렌더링의 구분

- **resize:** `sourcecode/frontend/renderer.js:219-250`은 현재 그래프 record들을 수집하고 유효한 각 plot에 `Plotly.Plots.resize`를 호출한다. 예약은 animation frame으로 합치지만, 그래프 하나만 자동으로 선택하는 구조는 아니다. `Plotly.react` 완료 뒤에도 해당 host의 resize가 예약된다.
- **React Sidebar:** `sourcecode/frontend/mantine_ui.js:277-293,413-416`의 상태 구독과 입력용 local state 갱신은 React 컴포넌트 재실행 경로다. 이것만으로 작업영역 Plotly가 실행되었다고 셀 수 없다. 위 공개 API와 renderer 호출이 실제 Plotly 실행 경로다.
- **레이아웃 미리보기:** `sourcecode/frontend/mantine_ui.js:353-380`은 별도 host에서 공통 `renderDashboardFrame`과 선택 장식을 사용한다. 이 미리보기는 Plotly 그래프를 그리지 않는다.
- **프린트/이미지 출력:** `sourcecode/frontend/renderer.js:1091-1124`의 `exportChartImage`는 출력 작업 소유의 화면 밖 host에 `Plotly.newPlot`을 실행하고 이미지 변환 후 정리한다. `exportDashboard`는 슬롯별 출력 이미지를 canvas에 합성한다(`sourcecode/frontend/renderer.js:895-1090`). 이는 작업영역의 live plot 갱신과 별도 경로다.

## 7. 판단 범위

현재 구조는 **전체 작업영역을 관리하는 갱신 경로와 슬롯별 Plotly 실행 자원을 함께 사용한다.** 특히 그래프 편집과 슬롯 선택은 변경 슬롯 하나만 갱신하도록 제한되어 있지 않다.

이 검토는 source code의 호출·반복·비동기 연결을 확인한 결과다. 실제 사용자 동작당 호출 횟수, 소요 시간, 다른 슬롯 object가 보였다는 보고의 원인은 이번에 재현하거나 확정하지 않았다. 코드·Source Script·pseudocode·배포 파일은 수정하지 않았다.
