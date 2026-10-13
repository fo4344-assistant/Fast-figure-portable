# Review 20261013-008 — verification-model r11 interaction TLC validation

## 판정

Source Script r17에서 추가·수정된 interaction 의미를 canonical `verification/FastFigureInteractionCore.tla`에 번역하고 GitHub Actions에서 PlusCal translation, SANY semantic parse, TLC exhaustive model checking을 수행했다.

판정:

```text
verification-model r11 = current
TLC validation = passed
interaction bounded model = passed
```

## 권위 계층

검증 대상 lineage:

- Source Script: r17, current/closed
- Source Script fingerprint:
  `sha256:2fec6d0c59f9b29a3d1d824ced75db46787fb566dd81373b07812db03b357664`
- verification-model: r11
- verification fingerprint:
  `sha256:66274b5f28db2ce3ba3a509689fa2d827713ece54c71c69bbd2ce898471acf8a`

## canonical verification 구성

이번 verification-model fingerprint에는 다음 canonical 파일이 포함된다.

- `verification/FastFigureSlotCore.tla`
- `verification/FastFigureSlotCore.cfg`
- `verification/FastFigureInteractionCore.tla`
- `verification/FastFigureInteractionCore.cfg`
- `verification/README.md`

`FastFigureSlotCore.tla/.cfg`는 r6 TLC validation 이후 변경되지 않았다. 해당 기존 bounded verification은 `review-017-tlc-slot-core-r6-2x2.md`에서 통과 기록을 유지한다.

r17에서 새로 추가된 interaction 의미는 `FastFigureInteractionCore`에서 별도로 검증했다.

## interaction 검증 범위

상태 변경 의미:

- explicit no-slot selection에 의한 deselection
- 미선택 visible slot surface click의 graph/image/empty 공통 selection
- 선택된 graph/image content slot surface의 content interaction pass-through
- 선택된 empty slot surface의 same-slot toggle
- bookmark same-slot toggle
- dashboard background deselection
- 일반 empty CSV asset 생성
- 생성된 CSV가 existing CSV selection authority의 current selection이 됨
- empty CSV 생성 자체는 graph-object sequence를 변경하지 않음
- 이후 graph object 추가는 current selected CSV id를 reference함

UI-local이라 verification state로 만들지 않은 항목:

- trash row Menu opened 상태
- concrete Mantine Modal width
- layout preview DOM measurement

## bounded harness

interaction verification의 representative bounds:

```text
SlotIds = 1..3
CsvIds = 1..2
MaxGraphObjects = 2
NoSlot = 0
NoCsv = 0
```

세 slot은 각각 graph-content, image-content, empty-slot interaction branch를 포함하기 위한 representative state다.

`MaxGraphObjects = 2`는 실제 application 제한이 아니다. 다음 상태를 유한 모델에서 모두 포함하기 위한 verification bound다.

- object 0개
- 첫 CSV reference 추가
- 둘째 reference 추가
- bound 이후 추가 transition 거부

## 실행 증거

성공 실행:

- GitHub Actions workflow: `TLA Slot Core`
- run id: `38357202939`
- job: `verify-interaction-core`
- job id: `115162738559`
- tested commit: `aa4513cda5ced14f36831f87c78f6c0df6885021`
- trigger: `push`
- TLA+ tools: v1.7.4
- TLC: 2.19
- workers: 4
- search: breadth-first exhaustive model checking

단계 결과:

- TLA+ tools fixed SHA-1 validation: success
- PlusCal translation: success
- SANY parse/semantic processing: success
- TLC model check: success
- invariant violation: none
- error/counterexample: none

TLC 최종 통계:

```text
generated states: 3,937
distinct states: 2,808
states left on queue: 0
complete graph depth: 34
maximum outdegree: 9
elapsed TLC model check: 1 second
```

최종 메시지:

```text
Model checking completed. No error has been found.
```

## 수정 과정에서 발견된 verification-only 오류

validation 이전 push에서 세 종류의 verification harness 문제가 발견되어 수정됐다.

1. 숫자 field record 표기:
   - `[1 |-> ...]`를 사용하여 SANY parse 실패.
   - 1-based sequence로 교체.

2. generated PlusCal symbol collision:
   - 두 main branch의 `with slotId`가 generated module에서 충돌.
   - `surfaceSlotId`, `bookmarkSlotId`로 분리.

3. heterogeneous sentinel:
   - 문자열 `"no-slot"`을 integer interval membership과 함께 평가하여 TLC 초기 상태 오류.
   - bounded harness sentinel을 0으로 통일.

4. unbounded graph-object sequence:
   - AddGraphObject harness가 무한 append 가능하여 finite exhaustive search가 닫히지 않음.
   - verification-only `MaxGraphObjects = 2` bound를 추가.

이 수정들은 Source Script 의미를 변경하지 않는다.

## 기존 slot-core 검증과의 결합

기존 `FastFigureSlotCore` 파일은 r6 검증 후 변경되지 않았고 기존 통과 증거가 유효하다.

따라서 r11 verification-model의 현재 검증 근거는:

```text
unchanged slot/layout/chart slice
  -> review-017 TLC pass

new r17 interaction slice
  -> this review TLC pass
```

이다.

## 결론

r11 verification-model은 현재 closed Source Script r17에서 파생되었고, 현재 canonical verification slice에 필요한 TLC validation evidence가 확보되었다.

```text
verification-model status = current
tlc = passed
```

Source Code는 이제 r17/r11 lineage를 명시적으로 사용하여 다음 revision으로 갱신할 수 있다.
