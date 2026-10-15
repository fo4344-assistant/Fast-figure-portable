# Plan 016 Source Code r30 WIP — image/slot read projection ownership review

## 기준 및 범위

- 의미 기준: Source Script r25/current/closed, PlusCal pseudocode r11/current.
- 변경 시작 HEAD: `2609c3cbefb4256273738b7c03ed213992509753`.
- Source Code 의미 변경: `fast-figure.js`의 이미지 슬롯 설정 계산과 두 public read projection.
- 추가 회귀: `agent_space/tests/browser-regression.js` 35번.
- 개발 계층: Source Code r29 → r30, `status: stale` 유지.
- 계층 fingerprint: `sha256:b906b8ffcb62cfac948946b7a7e3120ec3fda76b1da059a35d274c129b0eab18`.

## 상위 명세 대응

Source Script r25는 read-time image settings normalization이 live ProjectObject를 바꾸지 않고 Backend read projection의 복사본에서 수행되어야 한다고 정의한다. PlusCal r11은 Frontend read가 immutable Backend projection을 소비하도록 한다.

변경 전 `normalizeImageSettings(slot)`는 `normalizeSlotContent(slot)`을 호출하여 `slot.content` 자체를 교체하고 `slot.content.imageSettings`에도 계산 결과를 다시 대입했다. 이 함수는 `readImageEditorApi()`, `renderDashboard()`, `syncSlotImageElement()`에서 사용된다. 따라서 읽기·렌더링 과정이 Backend live slot을 변경할 수 있었다.

변경 후 `normalizeImageSettings`는 기존 우선순위(content.imageSettings → legacy slot.imageSettings → default)를 읽어 `readImageSettings`가 만든 별도 설정 객체만 반환한다. live slot을 정규화하거나 대입하지 않는다. 기존 fit/scale/x/y validation을 재사용하며 저장 schema나 값의 의미를 바꾸지 않는다.

`readImageEditorApi()`는 최상위 editor projection과 nested settings를 모두 freeze한다. `readSelectedSlotApi()`도 필요한 id/position/content reference만 포함하는 별도의 frozen snapshot을 반환한다. 이들 복사본을 authoritative ProjectObject로 사용하지 않는다.

## 확인 결과

- GitHub Actions Fast Figure regression `38734995405`: `ebca289e1cb7edc63d67b092bef6c7ef58140bc4` 기준 success. 새 35번 browser test는 공개 read projection 불변성과, readEditor/renderDashboard 이후 live slot.content 및 imageSettings 객체 정체성·값 보존을 검사한다.
- GitHub Actions Build distribution `38734910807`: source 변경 커밋 `0914a92881f151b83dc7f07559d5e56418525942` 기준 success. Actions bot이 generated `dist/inline/Fast-figure.html`과 `dist/split/Fast-figure.zip`을 별도 commit `9af3aacb08fb5afdbff7d2b7d0bc65c8525034c1`로 갱신했다.
- GitHub Actions Development layer versions `38735137728`: 메타데이터 갱신 커밋 `cdce1a6e78d4079ef6041bfe6b6f19ff0d749b38` 기준 success.
- Source Code 변경만 먼저 반영한 중간 커밋 `0914a92881f151b83dc7f07559d5e56418525942`에서 version check가 실패했다. 파일 단위 순차 커밋 중 version metadata가 이전 r29였기 때문이며, 위 r30 메타데이터 갱신 뒤 검사를 성공시켰다.

## 미완료 범위

이는 전체 Plan 016을 끝낸 검토가 아니다. `InterfaceStateMachine`의 projectObjects 직접 참조, Frontend reconciliation의 Backend helper 직접 조회, renderer의 direct activeProject read, legacy command route 등 핵심 경계 전환이 여전히 남아 있다.

그 때문에 Source Code r30은 `stale`로 유지한다. 현재 상위 Source Script/PlusCal lineage와 전체 의미 대응을 완료한 것으로 선언하지 않으며, `validation_review`도 설정하지 않는다. TLC 검증은 선택 사항으로 별도 유지하고 작업 진행을 막지 않는다.

## 구현 판단 및 기각한 대안

- 기존 정규화·검증 로직을 재사용해 immutable projection만 반환한다.
- 조회 중 live slot을 복제하기 위해 `JSON.stringify(slot)`을 호출하는 방향은 기각한다. 현재 slot의 `toJSON`이 `slotLegacyState`를 통해 정규화에 재진입하므로 추가 부작용과 재귀 호출 위험이 있다.
- 새 프로젝트 스토어나 장기 imageSettings mirror를 만드는 방향은 중복 SoT가 되므로 기각한다.
- Source Code 전체를 `current`로 설정하는 방향은 Plan 016이 아직 미완료이므로 기각한다.
