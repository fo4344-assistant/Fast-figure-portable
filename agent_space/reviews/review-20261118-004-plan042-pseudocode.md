# Plan042 Source Script 55 → pseudocode 32 검토

## 기준

- 기준 commit: `c61f298`. Source Script 55의 실제 변경과 전체 UI 절차를 기준으로 번역했다.
- Source Script: `sha256:3f2615ec38ee772db09faa669568bf393df8f85bd9c3e0609375145352306913`.
- pseudocode: `sha256:b7b82a6a200d26568648282767a2ab01ec56d1cfd6101a6d2e286f7b39734566`.

## 대응

| Source Script 절차 | pseudocode 반영 |
| --- | --- |
| UiCommand 생성·input·commit·send·cancel·step·dispose | frontend/mantine_ui.pcal의 동명 private 확장. 원문·조합·현재 대상·ready·중복 방지·동기 진입·비동기 종료·실패 정리 명시 |
| prepareNumericInput | 전체 문자열 십진 문법과 유한성, 지정한 자동 빈 값, 필수 빈 값 거부 |
| FastFigureApp 숫자 연결 | 공식 read와 기존 API 인자로 54개 필드 연결. 컴포넌트 생성/render에서 같은 객체 재사용·현재 callback 적용 |
| changeLayoutGridDimension | 확정 값과 현재 companion 크기·gridLimits, 동기 setGrid 한 번, 성공 시 로컬 선택 정리·공식 결과 표시 |
| 버튼 | 기존 기능별 target/invoke callback을 UiCommand.send에 연결. UI-local 접기·collision·Modal 응답은 기존 처리 유지 |
| 크기 잠금 제거 | FSM 필드·이벤트·분기, Application 너비 분기, 공개 API·read 반환·UI 연결 제거. 배율과 100% reset 유지 |
| 미리보기 | 공통 frame의 decoration에만 OFF 점선. 매 갱신 이전 표시 정리 후 선택·포커스를 별도로 표시 |
| 작업공간 | 빈 선택 슬롯 안쪽 4px 경계, graph/image bookmark의 클릭·포커스·선택 강조, host별 정리 |
| raster | 작업 전용 호스트·캡처 입력에서 편집 장식 제외. live 선택과 content·자원 수명 유지 |

## 논리·목적·중복 검토

1. 편집 중에는 문자열만 보존한다. Enter/blur 확정 전에 현재 대상과 lifecycle을 확인하고 editing을 먼저 종료하여 같은 편집이 재전송되지 않게 한다.
2. 전송은 현재 식별값·새 입력과 기존 API를 사용한다. API의 원래 반환·취소·예외, Backend 정규화·검증·한 번 반영을 유지한다.
3. 비동기 종료 시 running을 정리하고 같은 active 대상에서만 공식 값을 다시 표시한다. 원래 명령 실패가 표시 갱신 실패보다 우선한다.
4. 필드별 범위·정수화·자동 빈 값은 기존 소유자와 명시한 API에 연결했다. 새 Project 상태·범위 저장소·명령 등록부를 만들지 않았다.
5. 54개 연결의 반복 표기는 Source Script의 컴포넌트별 연결을 펼친 것이다. callback/reference·컴포넌트 수명·위젯 이벤트는 플랫폼 표기이며 도메인 알고리즘은 절차에 명시했다.
6. 공통 틀의 geometry·content와 Plotly·이미지 generation/해제·출력 한계는 보존했다. 점선·선택은 decoration 및 출력 작업의 표시 선택만 바꾼다.
7. Backend·system의 Source Script 55 변경은 너비 설명 정리다. 기존 pseudocode의 현재 너비 전달이 이미 대응하므로 두 파일을 추가 수정하지 않았다.

## 확인 범위

- 변경 대상 pseudocode와 Source UI를 전체 읽었고, Source Script 55의 실제 native patch 및 관련 절차와 비교했다.
- 전체 실제 diff, procedure 경계, 잠금·옛 입력 handler 참조 제거, 실제 layer fingerprint와 metadata 범위, native patch 역적용·공백을 정적으로 확인했다.
- Source Script·source code·dist·settings·verification·기존 계획과 검토 문서는 유지했다. code 160의 종전 derived_from도 유지했다.
- PlusCal 변환·TLC·테스트·앱·브라우저·빌드·checker main·commit/push는 실행하지 않았다.
- 상태는 stale이며 정적 번역 검토다. source code 구현과 실제 입력·선택·출력 확인은 후속 단계다.
