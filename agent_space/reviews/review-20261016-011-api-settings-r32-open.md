# Annotation / UI-palette public results — Source Script r32 / OPEN

## 범위와 근거

- 사용자 지시에 따라 공개 반환 보완(F1)을 계속한다. 기준 main `8e4f5242ea6c11ca51ea497d59b076ddc688fcc6`.
- 권위는 Source Script다. 하위 JS의 caption/label/appearance wrapper와 UI 소비자를 정적으로 대조했다. annotation UI는 주로 변경 알림 후 다시 읽고, appearance reset UI는 반환 palette를 새 draft로 복사한다. bool/내부 triple로 성공을 획일화하면 이 사용을 보존하지 못한다.
- 기존 `dispatchProjectCommand`의 committed 검사 및 성공 후 공식 query 규칙을 재사용한다. 새 API/envelope/framework나 persistent/runtime authority는 추가하지 않는다.
- 변경 owner: `sourcescript/application/public_api/{__init__,layout_annotations}.py`, `sourcescript/backend/layout_annotations.py`, `sourcescript/system.py`.

## 공개 반환 trace

| API | command / 완료 | 성공 반환 |
|---|---|---|
| captions.setEnabled | CAPTION_SETTINGS_CHANGED | captions.readGlobal |
| captions.setGlobalText | CAPTION_TEXT_INPUT(global) | captions.readGlobal |
| captions.setSlotText | CAPTION_TEXT_INPUT(explicit slotId) | 그 slotId의 captions.readSlot |
| captions.insertSlotCaptions | SLOT_CAPTIONS_INSERTED | captions.readGlobal |
| captions.setName | CAPTION_SETTINGS_CHANGED | captions.readGlobal |
| captions.setNameBold | CAPTION_SETTINGS_CHANGED | captions.readGlobal |
| captions.setSettings | CAPTION_SETTINGS_CHANGED | captions.readGlobal |
| labels.setEnabled | LABEL_SETTINGS_CHANGED | public labels.readState |
| labels.setSettings | LABEL_SETTINGS_CHANGED | public labels.readState |
| labels.setPosition | LABEL_POSITION_CHANGED | public labels.readState |
| labels.resetPosition | 같은 setPosition(0, 0) | public labels.readState |
| labels.finishPositionInteraction | 기존 완료 알림, command 없음 | public labels.readState |
| appearance.setPalette | APPEARANCE_CHANGED | appearance.readPalette |
| appearance.resetPalette | 같은 setPalette(DEFAULT_UI_PALETTE copy) | appearance.readPalette |

- command operation 13개는 미commit/명시적 취소면 False, 성공 read/선택/completion notification 없음이다. validation throw/rejection은 False로 삼키지 않고 전파한다. 새 cancel dialog는 없다. 이 미commit 규칙을 graph/asset/lifecycle의 다른 실패 계약에 일괄 적용하지 않는다.
- public label read는 Application이 현재 Frontend selectedSlotId만 scalar로 Backend query에 전달한다. Backend는 current layout/referenceWidth와 slot span을 계산한다. none/missing slot은 기본 1x1 cell 크기이며 fake slot 생성/selection 변경은 없다. label sampleText는 현재 format/parentheses의 index 0 예시다.
- label reset은 x/y origin을 같은 command에 전달한다. finish는 저장의 두 번째 commit이나 preview mirror가 아니며 현재 read 값을 반환한다.
- palette reset은 project-state의 유일한 default를 import해 사용한다. set은 r30 전체 palette 규칙(누락/invalid field는 default)을 사용하며 current palette partial merge로 바꾸지 않는다.
- 반환 projection은 immutable/detached이고 mutation 원천이나 장기 read store가 아니다. command 성공 뒤 read/render/notification failure는 caller에 전파한다. 이미 commit한 state를 숨은 rollback하거나 오래된 성공 read로 위장하지 않는다.
- Application result/reconciliation/renderer 경계는 기존 공통 adapter 의미를 사용한다. 공개 반환을 renderer input 전달의 대용으로 삼지 않는다. 이 단위는 renderer 하위 구현의 실행/완료 증명이 아니다.

## 정적 시나리오 — 실행 시험 아님

1. global text/name/enabled/settings 변경은 global read, slot text 변경은 explicit slot read다. 다른 owner를 반환하거나 selected slot으로 다시 바인딩하지 않는다.
2. command가 거부되면 fresh 성공 query가 없고 Project/Frontend는 공통 command failure 규칙으로 보존된다. throw는 원래 실패로 전파한다.
3. commit 뒤 read 오류는 성공 전 값이나 False로 위장하지 않는다. 이미 commit한 변경은 남는다.
4. merged slot 선택의 label reference는 span 크기이고, none/missing selection은 1x1 reference다. position/settings read가 선택을 만들거나 변경하지 않는다.
5. position 연속 edit는 같은 persistent x/y를 변경한다. finish에는 command가 없고 reset에는 같은 position command 한 번만 있다.
6. appearance reset은 fresh default palette를 반환하므로 UI가 draft copy를 만들 수 있다. 이후 draft 편집은 Project를 변경하지 않으며 적용 때 새 값만 command에 전달한다.
7. 기존 public inventory 87개와 logical hierarchy를 유지한다. 14개 operation의 이 반환 연결을 전체 API 계약 완료로 확장하지 않는다.

## 남은 보완 / 닫힘

- F1: project/slot/image creation/asset/graph/layout 등 나머지 미완결 반환. image/print 설정처럼 이미 read/False가 선언된 operation을 중복 재설계하지 않는다.
- F2: 다른 selection/drop/zoom runtime과 알림 완료, F4: import router/batch/export completion, 전체 import/edit/export 왕복·purpose·duplicate-integration 검토가 남아 있다.
- Source r32 current/open, closure_review null. PlusCal/model/code는 stale을 유지하고 하위 파일/lineage는 변경하지 않는다.
- 로컬 Source Script/app/checker/test/build/TLC를 실행하지 않았다. metadata Actions의 성공은 API 실행/semantic closure 증명이 아니다. 실제 누적 diff/검사는 `agent_space/patches/20261016-015.patch` 및 같은 basename 설명에 기록한다.
