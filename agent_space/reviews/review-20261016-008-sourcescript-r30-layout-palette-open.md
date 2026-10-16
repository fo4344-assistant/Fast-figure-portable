# Source Script r30 — layout/palette / OPEN

## 요구와 범위

사용자 지시대로 layout/palette 명세를 먼저 구체화한 뒤 전체 API trace를 수행했다. 기준 main은 `eef0d9252c30a5f85dcb268cb2c32d2fc7e97cce`(r29)다. 이 검토는 Source Script 정적 검토이며 하위 JavaScript를 수정하거나 실행하지 않았다.

## 의미와 ownership

- `sourcescript/backend/graphs.py`에 axis/global default와 `layout(chart, project)`를 명시했다. 네 axis reference, range/log 변환, reciprocal 표시 좌표, visibility/tick/notation/font/title/legend/margin/paper/ink를 같은 Backend 작업의 chart/project에서 계산한다.
- imported layout extension보다 editor-owned field가 우선한다. auto/omitted인 range/tick 등은 extension의 같은 key도 제거하며 unknown field는 보존한다. non-editable imported figure는 원본 data/layout/config/frames 보존 경로를 유지한다.
- trace style과 line/marker extension merge, object-independent axis placeholder의 순서/field를 명시했다. placeholder는 renderer 결과이며 persistent object/CSV가 아니다.
- UI palette는 `sourcescript/backend/project_state.py:DEFAULT_UI_PALETTE`의 10개 field가 원천이다. 전체 palette 설정은 missing/invalid field를 각 default로 정규화한다. UI CSS/DOM/default graph colors를 읽어 project를 역수정하지 않는다.
- graph 색은 `sourcescript/backend/graphs.py:DEFAULT_COLORS`의 독립 8색 sequence다. base/import/fallback 적용 위치를 명시했다. applyPalette는 non-empty color text sequence를 현재 editable objects에 순환 적용하고 다른 field/selection/UI palette를 변경하지 않는다.
- `sourcescript/frontend/mantine_ui.py`와 `sourcescript/frontend/renderer.py`는 supplied palette의 CSS/contrast projection을 계산한다. current authority나 임의 CSS fallback을 두 번째 project 원천으로 사용하지 않는다.
- EFSM layout edit는 current axis/global field에 새 patch만 적용한다. UI palette의 전체 설정과 chart layout의 partial edit를 혼동하지 않는다.

## 선택 이유·대안

- 과학 figure의 축/데이터 pairing과 imported 확장 보존을 유지하면서 표시 default와 merge 순서를 상위에서 결정하기 위해 기존 graph domain에 계산을 모았다. 새 theme/domain authority나 palette 동기화 framework를 만들지 않았다.
- 하위 JS는 기존 호환 동작과 field 누락을 확인하는 자료로 읽었다. 이를 이유만으로 Source Script closure나 최신 번역을 주장하지 않는다. 특히 editor auto field가 stale extension에 의해 되살아나는 경로는 상위 우선순위를 명시해 제거했다.
- UI/graph palette 통합은 의미와 적용 대상이 달라 제외했다. renderer에서 live Backend를 읽거나 style snapshot을 mutation source로 보내는 우회도 제외했다.
- API 반환 미정 항목을 모든 operation에 bool/내부 tuple로 일괄 통일하지 않았다. 구체 계약은 기존 소비자/목적과 대조해 보완해야 한다.

## 정적 시나리오 대조

1. empty chart에도 global/layout을 계산하고 visible-axis 조합용 표시 trace만 추가한다. fake CSV/object는 생성하지 않는다.
2. log range는 양수 경계만 log10으로 변환한다. reciprocal range는 이미 변환 후 표시 좌표이며 재역수하지 않는다. reversed range는 보존한다.
3. editor range auto는 imported extension range를 제거한다. unknown annotations/config/frames는 보존한다.
4. graph paperColor/fontColor와 UI background/surface는 다른 의미다. graph palette 적용은 object 색만 바꾸고 UI palette를 변경하지 않는다.
5. palette 길이보다 objects가 많으면 modulo 순환, objects가 0개이면 새 object 없이 유효하다. invalid 입력은 command failure로 state를 보존한다.
6. UI palette partial input은 전체 설정 규칙에 따라 나머지 field가 default가 된다. chart axis partial edit는 다른 current field를 보존한다.
7. non-editable imported representation은 layout 재생성/CSV validation 우회가 아니라 원본 보존 경로를 사용한다.

## API trace·닫힘·하위 전파

- 후속 전체 inventory 87개 대조 및 미정 사항은 `review-20261016-009-public-api-trace-r30-open.md`에 기록했다. 이미 chart 반환을 선언한 graph move/delete는 기존 post-commit query 경로로 연결했다.
- 위 시나리오는 정적 producer/consumer 대조이며 실행 테스트가 아니다. 전체 API의 반환·runtime composition·query route·export completion 및 전체 왕복/목적/중복통합 검토가 남는다.
- source r30은 current/open, closure_review=null이다. PlusCal/model/code는 stale이며 정책·하위 코드·테스트·배포는 변경하지 않는다. Source closure 후 PlusCal을 충실하게 번역하고 API/Backend projection/renderer/theme/EFSM 의미를 차례로 전파해야 한다.
- 실제 누적 diff, Contents API 비원자성, Actions 검사 결과와 실행 HEAD는 `agent_space/patches/20261016-013.md`에 기록한다. metadata 검사는 의미적 closure/실행 증명이 아니다.
