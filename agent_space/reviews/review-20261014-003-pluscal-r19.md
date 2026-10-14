# PlusCal translation review — Source Script r19

## 대상

- Source Script: r19 / closed
- Source Script fingerprint: `sha256:a6f3ce83d62984f9a18ca38574204a891b3f55c454f06579e4fff9fd2e589047`
- PlusCal pseudocode: r5
- pseudocode fingerprint: `sha256:b99611f367162b52927d0f18d8d0b7cca0965dca241c5c465ce421ebfe06ce93`

## 번역 내용

`pseudocode/project_state.pcal`에 `DefaultSlotStylePayload`를 추가하고 `CreateProject`에서 새 candidate의 `layout.slotStyle`에 적용한다.

`outerMargin = 0`을 포함한 Source Script의 default slot style 값을 그대로 번역했다.

## 범위

이 변경은 새 project 초기값에만 관여하며 existing project mutation/state transition을 추가하지 않는다.

## 판정

Source Script r19의 기본 layout style 의미가 pseudocode r5에 직접 반영되어 있다.

translation fidelity: **충족**.
