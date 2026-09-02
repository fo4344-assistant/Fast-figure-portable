# review-006 — Mantine 기능 요소 / 미리보기 이식 감사

## 목적

`plan-005.md`의 보존 기준을 실제 UI migration에 적용한다.

판정 기준은 “legacy DOM을 그대로 보존하는가”가 아니라 다음이다.

1. 사용자가 실제로 사용하는 기능 요소가 Mantine staging에 존재하는가
2. 설정 결과를 이해하거나 조작하는 데 필요한 preview/상태 표시/시각적 보조가 이식되었는가
3. 기존 custom popup/DOM/CSS/manual lifecycle은 Mantine primitive로 대체되고 있는가
4. domain renderer를 UI framework 때문에 재작성하거나 제거하지 않았는가
5. 파일 의미와 roundtrip은 유지되는가

## Layout

### 기존 기능 요소

- 행 / 열
- 기준 가로(px)
- 칸 간격(px)
- 외곽 여백(px)
- 모서리(px)
- 종횡비 + 기본값 초기화
- 기본 경계선
- 선택 slot 합치기
- 합쳐진 slot 나누기
- `layoutMap` preview
  - 현재 slot span/배치 표시
  - content 유무 표시
  - preview에서 slot selection
- dashboard zoom 50~200%
- 현재 dashboard width lock/unlock
- zoom 100% reset
- layout preview 크기 resize handle

### staging 상태

`20260901-007`에서 기본 form만 이식되어 다음이 빠져 있었다.

- layoutMap
- merge/split
- aspect reset
- dashboard zoom/lock/reset
- resize handle

`20260902-051`에서 다음을 보완한다.

- 기존 `renderLayout()`을 Mantine Modal 내부 `layoutMap` host로 재사용
- merge/split 기존 command 재사용
- aspect reset

### 남은 항목

- dashboard zoom/lock/reset은 아직 이식 필요
- legacy resize handle 자체는 `#layoutPanel` 높이 계산에 결합되어 있으므로 그대로 복제하지 않는다. Preview 크기/Modal scroll/viewport 대응은 Mantine layout 규칙으로 대체하되 preview 가독성과 충분한 작업 공간은 유지해야 한다.

## Label

### 기존 기능 요소

- 표시 on/off
- label format
- parentheses
- row/column order
- font family
- font size
- X/Y px 위치
- 위치 reset
- 실제 slot geometry 비율을 반영한 `labelPreview`
- preview label drag
- drag 가능 범위를 실제 slot 안으로 제한
- preview label/slot 비율이 실제 dashboard reference geometry와 일치

### staging 상태

`20260901-010`은 form과 reset/apply를 이식했으나 `labelPreview`와 drag interaction이 없다.

### 판정

**cutover blocker**

Label preview는 장식이 아니라 위치 편집 UI 자체다. Mantine Modal 안에 preview surface를 이식해야 한다.

기존 `renderLabelPreview()`는 legacy X/Y input DOM 동기화까지 포함하므로 그대로 React에 연결하면 controlled draft와 충돌한다. Preview 계산/drag update와 legacy input sync를 분리해야 한다.

## Caption

### 기존 기능 요소

- caption 표시
- global / slot caption mode
- `슬롯별 캡션 추가`
- 현재 편집 대상 정보
- caption name
- name bold
- font family
- font size
- line height
- caption text body
- 실제 dashboard 하단 caption surface

### staging 상태

`20260901-013`은 다음을 이식했다.

- 표시
- slot mode
- target info
- name/name bold
- font/size/line-height
- text

누락:

- `슬롯별 캡션 추가` (`SLOT_CAPTIONS_INSERTED`)

### 판정

해당 action은 기능 누락이므로 cutover 전에 이식해야 한다.

실제 dashboard caption surface는 `20260902-050`의 workspace host가 유지하므로 Modal 내부에 별도 중복 preview를 만들 필요는 없다. 사용자가 Modal과 dashboard를 동시에 볼 수 있어야 한다는 요구가 생기면 Modal 크기/배치 정책에서 처리한다.

## Print / Export

### 기존 기능 요소

- PNG/JPEG
- DPI
- width
- optional height
- save
- capture
- 진행/오류 status

### staging 상태

`20260901-015`은 저장용 DOM-free target export와 status를 이식했다.

누락:

- capture action

### 판정

**cutover blocker**

Capture는 별도 사용자 기능이다. 기존 `exportDashboard(true)`에 남아 있는 legacy DOM read를 그대로 Mantine callback에 연결하지 말고 capture input/output 경계를 분리해야 한다.

## Graph sidebar

현재 graph-object staging은 add/select/delete/reorder/color/palette/object settings/global/axis 등 기능 경계를 상당 부분 이식했다.

추가 확인 대상:

- 기존 graph form에만 존재하고 staging에 빠진 상태 표시나 보조 설명
- active CSV/column 선택 과정의 사용자 피드백
- palette file load error/status가 Mantine UI에서 충분히 보이는지

Graph Plotly surface 자체는 domain renderer이므로 Mantine로 재작성하지 않는다.

## popup design / placement 원칙

legacy popup의 픽셀 위치와 custom resize implementation을 그대로 복사하지 않는다.

그러나 다음은 기능 요구로 취급한다.

- 설정 항목과 preview를 동시에 볼 수 있는 충분한 공간
- preview를 조작하는 동안 필요한 target surface 가시성
- apply/cancel/reset/action의 논리적 grouping
- 긴 form의 scroll 가능성
- 상태/오류 메시지 가시성
- 작은 viewport에서도 control/preview가 사용 가능한 배치

이 요구를 Mantine `Modal`, `Grid`, `Group`, `Stack`, `Paper`, scroll area 등의 primitive로 구현한다.

## 다음 순서

1. `051` Layout preview/merge/split 적용 확인
2. Caption `SLOT_CAPTIONS_INSERTED` action 이식
3. Label preview 계산/drag 경계 분리 + Mantine preview 이식
4. Print capture DOM-free 경계 + Mantine button 이식
5. Layout dashboard zoom/lock/reset 이식
6. graph/sidebar 기능 누락 재감사
7. 그 뒤에만 active shell cutover 판정
