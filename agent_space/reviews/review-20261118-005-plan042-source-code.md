# Plan042 source code 번역 검토

## 기준과 수정 위치 확인

- 기준: Source Script 55, pseudocode 32, `20261118-002.patch`의 6개 pseudocode 변경 파일.
- 선행 커밋: `b1237e5ce09a1368a6850b6aca108bcc5c8aba76`. 수정 전 patch의 절차·삭제 항목을 실제 정의와 호출부에 대조했다.

| pseudocode 변경 | source code 정의·호출부 | 반영 |
|---|---|---|
| FSM 확대 고정 상태·이벤트 삭제 | `sourcecode/frontend/interface_fsm.js` 생성·전이·읽기 | 고정 상태와 이벤트 제거, 확대 50–200과 100% 초기화 유지 |
| 현재 확대 비율로 기하 요청 | `sourcecode/application/adapter.js` 조회·확대 표시 | 기준 폭 × 현재 확대 비율 사용 |
| 고정 API·바인딩 삭제 | `sourcecode/application/public_api/layout_annotations.js`, `sourcecode/application/public_api/index.js` | 조회·함수·import·바인딩 삭제 |
| UiCommand 생성·입력·확정·취소·실행·증감·해제 | `sourcecode/frontend/mantine_ui.js` | component별 instance, 현재 대상/값 조회, ready·IME·중복·비동기 종료 처리 |
| 숫자 54개와 버튼 바인딩 | 같은 파일의 24개 숫자 생성 지점 및 Button/ActionIcon/UnstyledButton | 현재 API 읽기·기존 setter로 연결, 버튼 callback·ref 전달 유지 |
| 미리보기 OFF 점선 | 같은 파일의 LayoutPreview | 해당 host의 내부 버튼 장식에만 점선 적용 |
| 선택 빈 슬롯·북마크 | `sourcecode/frontend/renderer.js` 공통 틀과 전체/선택 갱신 | 내부 4px 장식과 북마크 층·선택 표시, 이전 host 장식 정리 |

## 논리 검토

- 입력 중 문자열을 유지한다. 완성된 유한 숫자 확인 후 Enter/blur가 한 번만 실행하고, 같은 값은 API를 호출하지 않는다. Escape·대상 변경·not-ready·unmount는 미확정 입력을 취소한다. 구독은 일시적인 lifecycle 전이도 확인한다.
- 숫자 지점: 이미지 3, CSV 1, object 4, 축 28, 전역 글꼴 2, labels 3, captions 2, print 3, layout 8. 자동 축·글꼴의 빈 문자열, 자동 출력 높이의 null과 각 Backend 범위를 유지했다.
- 실제 `graphs.readLayout()`의 `settings`와 숫자 문자열은 해당 절차의 값으로 연결했다. 명령에는 현재 식별자와 새 필드만 전달한다. labels 좌표와 grid의 나머지 차원은 확정 시 다시 읽는다.
- 문자열·선택·커서를 편집 중에 유지하기 위해 기존 Mantine TextInput/테마와 명시적 증감 버튼을 사용했다. vendor NumberInput의 blur 정규화가 추가 명령을 발생시키는 경로를 제거했다. 숫자 확정과 증감은 같은 UiCommand를 통과한다.
- UI-local 접기·충돌 선택·취소·디버그 동작은 로컬 callback을 유지한다. 공개 action은 기존 callback을 한 번 호출하며 동기 반환/비동기 결과와 원래 예외를 보존한다.
- 숫자 입력 클릭은 부모의 미리보기 선택 해제까지 전파하지 않는다. grid 확정 성공만 해당 선택을 비우며 거부·실패에는 유지한다.
- 실제 기하·슬롯 크기·테두리 폭은 공통 틀에서 유지한다. 선택 장식은 content 밖에 두고 그래프·이미지 수명과 현재 조회 소유를 유지했다. 기존 두 raster 경로는 명시적으로 figure/image/label/caption을 합성하므로 편집 장식을 수집하지 않는다.

## 목적·중복 검토

- 목적: 입력 중 조기 clamp/반사, 중복 확정, 사용하지 않는 확대 고정, 공통 틀 변경 뒤의 장식 누락을 pseudocode의 절차로 수정한다.
- 공통 UiCommand와 현재 공개 API·기존 Backend 규칙을 재사용했다. 별도 Project 상태, API 목록, 숫자 범위 저장소와 기하 계산은 추가하지 않았다.
- Source Script·pseudocode·기존 문서와 dist는 변경하지 않았다.

## 확인 범위

- 실제 diff와 호출부, 6개 변경 JS의 `node --check`, whitespace, 3개 계층 fingerprint, 메타데이터 변경 범위와 native patch를 정적으로 확인한다.
- 앱·브라우저·테스트·빌드·checker main은 실행하지 않았다. 입력/포커스/실제 클릭·장식·다운로드의 동작 성공을 주장하지 않는다.
