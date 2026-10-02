# Source code r4 validation — UI primary color

## 검토 대상

- Source Script r12
- verification-model r6
- source code r4
- source-code fingerprint:
  `sha256:9339a9059161aa8a007c65a2ca62757e015056f6a71741d25bb4d5142436b094`

## Source Script 판정

이번 문제는 Source Script 의미의 누락으로 판정하지 않는다.

`sourcescript/api_ui.py`의 `FastFigureApp` 책임에는 이미 다음 의미가 있다.

- persistent appearance palette를 FastFigureApi에서 읽는다.
- 그 palette를 Mantine CSS variable로 투영한다.
- UI color luminance에서 primary contrast text를 계산한다.

따라서 Mantine의 generic primary UI가 별도의 기본 blue 상태를 독립적으로 소유하는 것은
Source Script가 요구한 palette projection과 맞지 않는다.

Source Script와 verification-model은 변경하지 않는다.

## 구현 문제

기존 구현은 `--mantine-primary-color-*` CSS variable을 `palette.uiColor`에서
생성했지만 Mantine Button/ActionIcon의 vars resolver는 theme의
`primaryColor` 기본값인 `blue`를 사용해 `--button-*` / `--ai-*` 변수를
별도로 계산했다.

그 결과 global primary CSS variable과 실제 generic button 색이 분리될 수 있었다.

## r4 수정

`FastFigureApp`에서 현재 `palette.uiColor`로 Mantine custom color
`ffui`를 만들고 이를 provider theme의 `primaryColor`로 지정한다.

`--mantine-color-ffui-*`는 기존 palette 기반
`--mantine-primary-color-*` variable을 참조하도록 연결한다.

따라서 별도 버튼 색 상태를 추가하지 않고 다음 경로로 단일화된다.

`activeProject.appearance.uiPalette.uiColor`
→ Mantine primary CSS variables
→ Mantine `ffui` primary color
→ Button / ActionIcon variant variables.

## 회귀 검사

browser regression target을 source code r4로 올리고 filled Mantine Button의
computed background color가 현재 `appearance.uiColor`와 동일한지 확인하는 검사를
추가했다.

## 의미 및 경계

- project schema 변경 없음
- UI palette schema 변경 없음
- Source Script 의미 변경 없음
- verification model 의미 변경 없음
- renderer/domain command 변경 없음
- Mantine generic component의 appearance projection만 수정

## 결론

source code r4는 Source Script r12의 기존 appearance projection 책임을 더 정확히
구현한다. 상위 계층 변경 없이 source-code revision만 증가시키는 것이 맞다.
