# Source Script closure review — r19

## 대상

- Source Script revision: r19
- fingerprint: `sha256:a6f3ce83d62984f9a18ca38574204a891b3f55c454f06579e4fff9fd2e589047`
- 변경 파일: `sourcescript/project_state.py`
- 요구: 새 layout의 기본 바깥 여백을 0으로 변경.

## 변경 의미

`SLOT_STYLE_DEFAULTS`를 Source Script에 명시하고 새 project의 `layout.slotStyle` 기본값을 이 구조에서 가져오도록 정의했다.

현재 기본값:

- referenceWidth: 1200
- gap: 0
- outerMargin: 0
- radius: 0
- aspect: 1.618
- showBorders: true

기존 project에 명시적으로 저장된 `outerMargin`은 변경하지 않는다.

## 논리적 완결성

새 project 생성 경로는 `SLOT_STYLE_DEFAULTS`를 사용한다. `outerMargin` 허용 범위는 기존 0..5000을 유지하므로 validation rule을 변경할 필요가 없다.

기본값 변경은 grid/slot/reference 관계나 project mutation semantics를 변경하지 않는다.

## 중복/통합 검토

기본 layout style을 별도 literal로 여러 번 재정의하지 않고 하나의 default structure로 묶는 방향을 명시했다.

## 판정

- 논리적 완결성: 충족
- 프로젝트 목적 부합: 충족
- 중복/통합 검토: 충족

Source Script r19를 **closed**로 판정한다.
