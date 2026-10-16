# Annotation r36 — 공통 설정 데이터 / caption append / reference-width export

## 기준·판정

- Source 변경 시작 main: `e5b9d3ec7cbd68fee578e202f714f69ceb1fd9c0`. Plan 019를 먼저 게시했고 사용자 정정 후 Plan 020을 추가·수정하고 patch 021로 기록한 다음 추가 Source 수정을 진행했다.
- Source r36 current/open, fingerprint `sha256:9faab3f5111e06acfc3c498b6bfef0a68811c178a4d00ce975f9d7261fbe7212`. closure_review null, 하위 stale 유지.
- review 016의 C1–C3에 해당하는 구체화다. 설정값뿐 아니라 numbering/group/append와 측정·높이 합성 경로를 같은 annotation 책임으로 연결했다. 전체 의미 closure나 lower fidelity/시각 테스트 완료를 주장하지 않는다.

## 위치·정리·선택 이유

- `sourcescript/backend/settings.json` **한 공통 파일**에 labels/captions/captionReferenceStyle 값만 두었다. 코드·import·정책 설명 없음. label용/caption용 파일을 따로 만들거나 다른 설정까지 일괄 이전하지 않았다.
- 기존 `sourcescript/backend/layout_annotations.py`가 해석·계산 책임을 유지한다. 별도 loader/registry/service/state authority 없음. Backend 내부 Project가 현재 사용자 설정의 원천이며 defaults 데이터와 동기화하지 않는다.
- 미게시 `sourcescript/backend/settings/annotations.py`와 전용 디렉터리, 관련 Python import를 삭제했다. 이 잘못된 파일은 원격에 게시한 적이 없어 actual git diff에 삭제로 나오지 않는다. `annotation-settings.json`은 제안한 경로일 뿐 생성하지 않았다.
- 기존 layout_annotations.py는 최초 새 모듈을 이번에 만든 것이 아니라 r28의 역할 재배치 결과다. 이번에는 기존 책임을 사용하며 삭제·새 wrapper bridge를 만들지 않았다.
- 기본값은 기존 createProjectState의 label/caption 값과 호환되도록 채택했다: initial disabled, lower-alpha/row-major, parentheses false, origin position, font system-ui 및 size14, caption lineHeight1.45. 이는 사용자 요구와 초기 출력 보존을 위한 채택 근거이지 lower code를 자동 권위로 삼는 절차가 아니다. 실제 값의 단일 정의는 JSON이다.
- caption reference padding/gap/border/minimum-width도 같은 JSON에서 정의해 숫자를 renderer 기본값과 따로 소유하지 않는다. application position reset은 새 숫자를 복제하지 않고 Backend reset intent로 단일 기본값을 참조한다.

## 생성→소비 경로

1. create/load missing → JSON labels/captions → current Project. valid saved false/0/empty 보존. read는 Project를 채우지 않으며 partial edits는 current 값 보존.
2. current Project → orderedSlotLabels → current visible anchors의 전체 ordinal/identifier. row/column order, merged covered 제외, sampleText와 renderer map의 같은 formatter.
3. SLOT_CAPTIONS_INSERTED → current candidate+slotIds → insertSlotCaptions → whole validation → one commit → 기존 공식 captions.readGlobal. wrapper는 model/candidate를 만들지 않는다.
4. snapshot input → copied captionReferenceStyle + current label/caption/layout → Frontend reference font 측정 → 하나의 emitted line list로 높이/painting → width ratio scaling. Frontend는 Backend/JSON을 직접 읽지 않는다.
5. settings JSON → checker의 Source file collection/fingerprint 및 --base 변경 감지/patch marker/revision 검사. Python file만 변경된 것으로 한정하지 않는다. JSON missing/malformed/non-object는 checker 오류다. 설정 전체 application schema 검증을 checker가 대체한다고 주장하지 않는다.

## 정적 시나리오 — 실행 결과가 아님

| 입력·경로 | 명세 대조 결과 |
|---|---|
| 새 project와 saved 설정 | 초기값 JSON deep-copy; 유효 저장값 유지, missing만 보완, read mutation 없음 |
| position reset | wrapper는 reset=True만 전달; Backend가 JSON의 x/y 적용; 이전 독립 0,0 상수 제거 |
| a=A,b=B | `(a) A (b) B` |
| a=A,b=A / a=A,b=empty / a=A,b=empty,c=A | `(a-b) A` / `(a-b) A` / `(a-c) A` |
| a=empty,b=B / a=empty,b=empty | `(a) (b) B` / `(a-b)` |
| a=A,b=B,c=A / A와 a / A와 A+space | nonadjacent 또는 문자열이 다른 항목은 합치지 않음 |
| filter a,c / hidden/merged / column-major | filtered ordinal을 재번호 매기지 않음; a,c를 a-c로 묶지 않음; 전체 visible anchor 순서 사용 |
| labels disabled/parentheses false | label drawing만 끄며 caption은 `(identifier)`로 생성 |
| 기존 global text / no target / 재호출 | 기존 내용을 보존해 뒤에 append; trailing U+0020 재사용; no target unchanged/미commit; 재호출은 다시 append |
| name/afterText/slot.caption | insertion은 global text만 변경. ordinary export caption body는 기존 text이며 afterText를 암묵적으로 추가하지 않음 |
| 기준 폭 R=1200, aspect=2, caption disabled, 목표 W=2400 | H0=600, s=2, auto H=1200. reference dashboard/typography/gap 동일 배율 |
| C0=100,G0=10를 같은 R에서 측정, W=2400 | auto H=ceil((600+100+10)*2)=1420, dashboard1200/caption200/gap20 |
| DPI만 변경 | 목표 width가 pixel이므로 geometry 불변, 기존 DPI metadata만 변경 |
| enabled empty / multiline/overlong word | enabled empty는 기존처럼 blank line 예약; newline/greedy word-wrap/prefix 측정 후 같은 lines로 height와 drawing. 긴 단어는 분할하지 않고 caption drawing 영역에서 clip |
| explicit H 부족 / raster limit / font 측정 실패 | 다운로드 전 rejected 또는 원래 예외 전파; Project/settings에 숨은 수정 없음; 작업 resource finally 정리 |
| JSON-only Source change | is_source_script_path가 exact settings.json을 포함하며 source collection과 patch/revision 경로도 같은 범위 |

## 복잡도·통합·닫힘 영향

설정별 파일/Python settings package를 추가하는 이득을 입증하지 못한 점을 수정했다. 공통 데이터 파일 하나와 기존 owner 함수만 사용한다. JSON 경로를 fingerprint 범위에 포함하는 변경은 값 변경의 revision 우회를 막기 위한 필요한 비용이다. 새로운 schema registry나 general loader는 없다.

Caption label 생성은 기존 label formatting을 공유하되 괄호는 사용자 caption 규칙에 따라 항상 표시한다. metadata/FFPX/Backend current state와 config를 양방향 동기화하지 않는다. dashboard/render/export가 독립 numbering 알고리즘을 갖지 않도록 공급 projection을 연결했다.

C1–C3의 구체적인 원천/알고리즘은 기록했지만 전체 create/load/FFPX 왕복, selection, output purpose/duplicate-integration의 최종 검토는 별도다. 하위 JS/PlusCal/model/test/dist를 이번에 번역하지 않았다. Source를 자동 close하지 않는다.

## 검증·게시 기록

- 로컬 Source/application/checker/test/build/TLC 실행 없음. fingerprint는 파일 경로/byte의 git blob hash를 계산한 것으로 Source 실행과 다르다.
- 누적 patch와 GitHub Actions cumulative version checker의 실제 결과는 patch 022 설명과 아래 후속 결과에 기록한다. 순차 Contents API의 source-before-metadata 상태는 최종 coherent snapshot 검증과 구분한다.
- 검증 실행 전 작성 후 결과 추가: cumulative GitHub Actions `38865899313` PASS. 실행 HEAD `7122e86ab3964dfe487ee7792cac1d620867e156`, 실제 BASE_SHA `e5b9d3ec7cbd68fee578e202f714f69ceb1fd9c0`, 로그 Source r36 current/open 및 fingerprint 위 값 일치. https://github.com/fo4344-assistant/Fast-figure-portable/actions/runs/38865899313
- 이 결과 추가는 실행 HEAD 이후의 documentation-only commit이다. 같은 최종 HEAD를 실행했다고 주장하지 않으며 checker PASS는 semantic/runtime/시각 성공이나 Source closure를 뜻하지 않는다.
