# Source Script r22 closure review — persistent mutation command coverage

## 범위와 되돌아온 이유

plan-015 J1 구현을 시작하는 과정에서 Source Script r21의 책임 선언과 실제 public persistent mutation surface 사이의 누락을 발견했다. 정책에 따라 Source Code에서 새 command 의미를 발명하지 않고 Source Script로 돌아왔다.

r21 closure에서 놓친 핵심은 `PUBLIC_API_METHODS`의 persistent mutation 전체를 `PROJECT_COMMANDS`와 일대일로 대조하지 않은 것이다. 당시 review는 projectEFSM/interfaceFSM의 상위 ownership 분리에 집중했고, 각 public mutation이 실제로 하나의 명시적 project command로 수렴하는지까지 command coverage 관점에서 닫힘을 확인하지 못했다.

## 논리적 완결성

persistent ProjectObject mutation 가운데 r21에서 explicit project command가 빠졌던 다음 의미를 보강했다.

- slot-local image settings → `SLOT_IMAGE_SETTINGS_CHANGED`
- global caption enabled/name/nameBold/presentation settings → `CAPTION_SETTINGS_CHANGED`
- persistent slotStyle → `LAYOUT_STYLE_CHANGED`
- slot merge → `SLOTS_MERGED`
- slot split → `SLOTS_SPLIT`

기존 command인 `GRID_LAYOUT_CHANGED`, `CAPTION_TEXT_INPUT`, `SLOT_CAPTIONS_INSERTED`, `LABEL_SETTINGS_CHANGED`, `LABEL_POSITION_CHANGED`, `APPEARANCE_CHANGED`, `EXPORT_SETTINGS_CHANGED`도 관련 Source Script 함수에서 `dispatchProjectCommand`로 수렴하는 경로를 명시했다.

`PROJECT_COMMAND_COVERAGE_RULE`을 추가해 public API에서 persistent mutation으로 분류된 operation이 독립 commit path를 만들지 않고 반드시 선언된 project command semantics에 수렴하도록 했다.

## 프로젝트 목적 부합

이번 변경은 새 사용자 기능을 추가하지 않는다. 기존 Fast Figure ProjectObject의 persistent state owner를 projectEFSM으로 일관되게 만들고, interfaceFSM과 renderer가 project authority를 직접 변경하지 않게 하는 plan-015의 목적만 보완한다.

Layout selection, zoom, pointer interaction, form draft 같은 UI/runtime-local 상태는 project command로 승격하지 않았다.

## 중복·통합·복잡도 검토

- public API마다 별도 mutation engine을 만들지 않고 기존 `dispatchProjectCommand` 경계로 통합했다.
- image settings, caption settings, layout style, merge/split을 각각 의미 있는 project command로만 추가했다.
- enabled/name/nameBold/font settings처럼 같은 global caption owner를 변경하는 항목은 여러 command로 쪼개지 않고 `CAPTION_SETTINGS_CHANGED` 하나에 explicit fields로 통합했다.
- label enabled/settings도 기존 `LABEL_SETTINGS_CHANGED`를 확장해 같은 owner의 중복 command를 만들지 않았다.
- 하나의 범용 `PROJECT_PATCH` command는 precondition, writable owner, candidate validation, selection reconciliation 차이를 숨기고 예외 분기를 늘리므로 채택하지 않았다.
- candidate 계산과 authoritative commit은 분리하며 helper 계산 결과가 별도 authority가 되지 않는다.

## 권위와 데이터 흐름

정상 경로는 다음 하나다.

`UI/API input → candidate calculation → dispatchProjectCommand → projectEFSM validate/commit → ProjectMutationResult → interfaceFSM reconcile → renderer projection`

ProjectMutationResult는 장기 상태가 아니며 interface reconciliation/renderer effect 동안만 소비한다. 영속 ProjectObject의 유일한 authority는 계속 `activeProject`다.

## 닫힘 판정

1. 논리적 완결성: public persistent mutation surface와 project command coverage를 대조했고 누락을 보완했다.
2. 프로젝트 목적 부합: FFPX EFSM/UI-FSM 책임 분리 외 새 기능을 추가하지 않았다.
3. 중복과 통합·확장: 같은 owner는 기존 command에 통합하고, 서로 다른 mutation 의미만 별도 command로 유지했다.

따라서 Source Script r22를 closed로 판정한다.

## 하위 계층 전파

- pseudocode r7은 r22에 대해 stale이다.
- verification r19는 pseudocode r7 lineage이므로 stale이며 기존 TLC 진행 결과를 r22의 검증 결과로 재사용하지 않는다.
- Source Code r24는 stale 상태를 유지한다.
- 다음 단계는 r22를 PlusCal pseudocode로 직접 번역하고 translation review를 수행하는 것이다.
