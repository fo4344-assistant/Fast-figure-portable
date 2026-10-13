# Fast Figure verification model r11

이 디렉터리는 PlusCal pseudocode에서 상태 기반 검증이 필요한 범위를 파생한 선택적 verification model이다. verification model은 Source Script 전체 번역 계층이 아니며 별도의 설계 권위도 아니다.

```text
Source Script
→ PlusCal pseudocode
→ [선택적] verification model
→ TLA+/TLC
→ Source Code
```

Source Script와 pseudocode가 충돌하면 Source Script가 원천이다. pseudocode와 verification model이 충돌하면 pseudocode가 직접 원천이며 verification model을 수정한다.

## 현재 lineage

- Source Script: r17 / current / closed
- Source Script fingerprint: `sha256:2fec6d0c59f9b29a3d1d824ced75db46787fb566dd81373b07812db03b357664`
- PlusCal pseudocode: r3 / current
- pseudocode fingerprint: `sha256:459b4ea5f5eefe9cda1e27b9241e4deb379df5c5ec9e2e82b0649751b8caf898`
- verification-model: r11 / current
- verification fingerprint: `sha256:b4156896514d84f2b38b2d9346aaf93111249e927297ff3173485c702bd70a2b`
- TLC: passed

verification fingerprint는 의미 파일인 `verification/**/*.tla`와 `verification/**/*.cfg`만 대상으로 한다. README는 상태 설명 문서이며 verification 의미 fingerprint에 포함하지 않는다.

## canonical verification modules

- `FastFigureSlotCore.tla` / `FastFigureSlotCore.cfg`: slot/layout/chart candidate와 reference consistency bounded slice.
- `FastFigureInteractionCore.tla` / `FastFigureInteractionCore.cfg`: r17 interaction과 empty-CSV bounded slice.

기존 slot core의 r6 TLC 결과는 해당 의미 파일이 변경되지 않아 유지된다.

r17 interaction core는 다음 pseudocode 의미를 파생해 검증한다.

- explicit no-slot deselection
- 미선택 visible graph/image/empty slot surface selection
- selected graph/image content interaction pass-through
- selected empty slot same-slot toggle
- bookmark same-slot toggle
- dashboard background deselection
- 일반 empty CSV 생성
- 새 CSV의 current selection
- empty CSV 생성 자체가 graph-object sequence를 변경하지 않음
- 이후 graph object가 current selected CSV를 reference함

UI-local이라 verification state로 만들지 않은 항목은 trash row Menu opened 상태, concrete Mantine Modal width, layout preview DOM measurement다. 이 값들은 persistent project authority가 아니며 Source Code의 renderer/UI 구체화 영역이다.

## bounded verification

```text
SlotIds = 1..3
CsvIds = 1..2
MaxGraphObjects = 2
NoSlot = 0
NoCsv = 0
```

이 값들은 application 제한이 아니라 TLC의 유한 상태공간을 위한 verification-only bound다.

## TLC validation

r11 interaction validation:

- review: `agent_space/reviews/review-20261013-008-tlc-interaction-r11.md`
- GitHub Actions run: `38357202939`
- job: `verify-interaction-core`
- TLA+ tools: v1.7.4
- TLC: 2.19
- generated states: 3,937
- distinct states: 2,808
- states left on queue: 0
- complete graph depth: 34
- maximum outdegree: 9
- invariant violation: none
- counterexample/error: none

```text
verification-model r11 = current
TLC = passed
```

## coverage의 의미

verification model은 pseudocode 전체를 복제하지 않는다. 상태공간 탐색이 필요한 범위를 선택적으로 파생한다. verification에 없는 asset parsing, 전체 UI renderer, serialization 등의 영역은 pseudocode 누락이 아니라 현재 TLC coverage 밖의 영역이다.
