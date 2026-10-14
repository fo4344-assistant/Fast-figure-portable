# Source Code validation review — r22

## 대상

- Source Script: r18 / closed
- PlusCal pseudocode: r4 / current
- verification-model: r15 / TLC passed
- Source Code: r22
- Source Code fingerprint: `sha256:b10cfd11a1e442af203d87a96a8d86561cc6970e73bca37e305bf453e253436d`
- implementation commit: `f9778a74b7905896e86cc2bf676456bfaca2c11a`

## 구현 결과

### Mantine Tree

`/assets` 계층은 Mantine 9.5.2 `Tree` 기반으로 전환되었다.

- tree data는 current VFS snapshot의 projection이다.
- node value는 canonical project path다.
- tree 내부 이동은 기존 `planMove → move` authority로 수렴한다.
- resource row 자체에서 drag가 시작되고 오른쪽 slot drop target의 기존 `connectToSlot` 경로를 사용한다.
- Mantine local tree data를 project authority로 사용하지 않는다.

### trash resource

- trash CSV/image row가 disabled되지 않는다.
- trash asset selection이 가능하다.
- fixed trash root 자체는 move 불가다.
- trash descendant asset/directory는 일반 directory로 이동해 복구할 수 있다.
- entering-trash reference detach는 유지된다.
- leaving-trash에서 과거 reference를 자동 복원하지 않는다.
- trash 상태 direct slot connection은 거부된다.

### bookmark slot swap

successful `SLOTS_SWAPPED` 직후 기존 dashboard renderer entry point를 호출한다.

project state와 selected payload identity가 바뀐 뒤 별도 click/selection trigger 없이 DOM projection이 즉시 갱신된다.

### Layout preview

지난 회귀에서 추가된 preview 전용 width resize handle을 제거했다.

preview actual rendered width 하나를 `layoutApi.readState(width)`의 입력으로 사용하며 height/gap/margin/radius는 같은 geometry 기준에서 계산된다.

configured aspect와 rendered preview aspect가 일치한다.

### settings Modal

Layout / Label / Caption / Print는 다시 Mantine 편의 `Modal` 하나를 공통 wrapper로 사용한다.

- common size: `min(96vw, 1320px)`
- initial opening: centered
- 네 popup의 actual content width가 동일
- resize 시작 시 current top을 고정
- drag 중 `--modal-content-height`만 변경
- width는 변경되지 않음
- top edge는 움직이지 않음
- horizontal center는 유지
- popup height는 UI-local이며 project/FFPX state에 저장되지 않음

직접 `Modal.Root / Content` 조립은 제거하여 theme의 Modal lifecycle/portal/overlay/header behavior를 다시 재사용한다.

## Browser regression

GitHub-hosted `Fast Figure regression` run `38507767069`:

- browser job `115669089030`: success
- inline portable regression: success
- split-zip regression: success

관련 직접 검증 항목:

- bookmark drag 후 즉시 dashboard DOM rerender
- Layout preview aspect 보존과 obsolete resize handle 부재
- 네 settings popup 실제 width 동일
- settings popup horizontal centering
- resize 후 height 변화
- resize 후 width 불변
- resize 후 top edge 불변
- resize 후 horizontal centering 유지
- trash asset selection/recovery drag
- recovered asset reference 비복원
- Mantine Tree resource → slot connection drag

## 기타 검증

GitHub-hosted `Development layer versions` run `38507767089`: success.

GitHub-hosted `Build distribution` run `38507767093`: success.

distribution artifact는 APP build `1.1.42-wip` 기준으로 생성되었다.

## 정책 검토

- persistent authority는 기존 project/VFS/FSM에 유지된다.
- UI tree와 popup geometry는 projection/local interaction에 한정된다.
- tree move와 slot connection eligibility는 분리되어 있다.
- settings popup resize는 하나의 공통 helper에 통합되어 있다.
- legacy hidden DOM bridge를 추가하지 않았다.
- Layout preview size를 별도 persistent state로 만들지 않았다.
- 변경은 exact diff patch와 설명 문서로 기록했다.

## 판정

Source Code r22는 Source Script r18 / pseudocode r4 / verification r15의 현재 의미를 구현하며, 계획 013의 이번 수정 범위에 대한 hosted regression과 build/version validation을 통과했다.

Source Code r22 validation: **passed**.
