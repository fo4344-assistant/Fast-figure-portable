# Source Script r29 — trace 계산·read 문맥 검토 / OPEN

## 범위와 판정

Plan 017 E 중 CSV → trace numeric 변환·제외 순서, reciprocal 축, chart/CSV의 동일 작업 문맥을 구체화했다. 기준 main은 `2da42296aa71cb662605fbbe991591654900297a`다. Source Script만 의미 authority로 수정하며 PlusCal/model/JS를 먼저 수정하지 않는다. **전체 Source Script closure는 open이고 closure_review는 null이다.** 이 문서는 부분 정적 검토이며 전체 실행 등가성 또는 세 가지 closure 근거의 완성을 주장하지 않는다.

## 변경과 이유

- `sourcescript/backend/graphs.py`: `tracesSingle(objectView)`에 header 제외 → paired cell 변환 → divide → 축 변환 → paired row 제외 순서를 명시했다. literal empty x와 누락 cell, y의 변환 실패, 실제 비유한 수치와 변환 overflow를 구별한다. x category는 linear에서 보존하지만 log/reciprocal에서 제외한다. row별 x/y를 따로 filter해 서로 다른 row끼리 연결하지 않는다.
- CSV의 기존 scalar 호환 의미인 y empty/whitespace/null → 0, boolean → 0/1과 x의 numeric/category 구분을 명시했다. literal empty x는 제외하고 whitespace-only x는 0으로 변환한다. 이는 모든 blank를 일괄 결측값으로 바꾸거나 category를 삭제하는 변경을 피하기 위한 선택이다. numeric x 자체의 NaN/무한 값과 연산 overflow는 유효 좌표가 아니므로 제외한다. text가 유한 수치로 변환되지 않으면 x category로 남는 것과 실제 비유한 number를 혼동하지 않는다. 하위 `fast-figure.js`의 `value`/`tracesSingle`/`chartFigure`는 호환 차이 확인용으로만 읽었으며 실행하거나 자동 복제하지 않았다. 비유한 값 안전성은 하위의 우연한 통과 동작에 종속시키지 않는다.
- `AXIS_SETTINGS_SCHEMA`와 `normalizeAxisSettings(values)`의 linear/log/reciprocal을 일치시켰다. divisor의 invalid/0은 항등값 1, scale의 invalid는 항등 linear다. reciprocal은 divide 다음 역수이고 0/category를 제외하되 음수는 허용한다. Plotly axis는 linear이며 min/max는 변환 후 표시 좌표다. inverse를 범위에 다시 적용하지 않는다. 기존 축 종류를 삭제하거나 새 축 owner를 만들지 않는다.
- `traces(chart, project)`, `rebuildEditableGraph(chart, project)`, `chartFigure(chart, project)`가 같은 작업의 project를 명시적으로 사용한다. Backend command의 candidate chart는 그 candidate CSV와 결합하며 live getProjectCsv 기본 조회로 돌아가지 않는다. candidate CSV를 조회하기 위한 부분 commit, Application candidate 전달 예외, current selected CSV fallback은 없다.
- `rebuildEditableGraph`는 command candidate 또는 query-local chart copy만 변경한다. `chartFigure`는 copy를 계산하며 non-editable imported data/layout/config/frames를 detached copy로 보존한다. conversion view에 project CSV를 요구하지 않는다. 일반 CSV chart의 편집 잠금을 conversion representation으로 오해하지 않는다.
- `sourcescript/backend/project_state.py`의 renderer/export query와 `sourcescript/frontend/renderer.py`의 소비 절차를 연결했다. print.save/capture는 같은 작업에서 계산한 slot별 figure/image 입력을 받으며 Frontend가 CSV/trace를 재계산하지 않는다. 일반 FFPX whole-project snapshot 반환은 유지하고 persistent schema나 project mirror는 추가하지 않는다. renderer geometry/style scaling은 figure copy의 표시 작업이다.
- `sourcescript/system.py`의 미완료 목록을 좁혔으나 제거하지 않았다. 새 module/validator/envelope/authority는 추가하지 않는다.

## 정적 시나리오 대조 — 실행 결과가 아님

| 입력/상황 | 명세에서 따라가는 결과 |
|---|---|
| x=6, y=8, x divisor=2, y divisor=4, x reciprocal/y linear | divide 후 (3,2), 최종 (1/3,2) |
| x=0 reciprocal 또는 y<=0 log | 해당 row의 x/y를 함께 제외 |
| x=-2 reciprocal, divisor=1 | x=-1/2 허용; log로 바꾸면 제외 |
| x='A', y=8 | linear x category 유지; log/reciprocal x에서는 row 제외 |
| literal empty x / 누락 y | row 제외, 이웃 row의 cell로 채우지 않음 |
| x=2, y='' | linear y=0; log/reciprocal y이면 제외 |
| 유한 입력의 divide/reciprocal 결과 overflow | row 제외, 비유한 좌표를 renderer에 전달하지 않음 |
| header만 있거나 모든 row가 제외됨 | object trace 없음; default CSV/object를 만들지 않음 |
| candidate 새 CSV id를 live collection이 아직 갖지 않음 | 같은 candidate collection에서 resolve; live fallback/부분 commit 없음 |
| non-editable conversion view에 가짜 csvId가 있음 | 보존 imported figure 경로; project CSV/column resolve 없음 |
| query/renderer 반복 또는 export scaling | Backend authority/원본 figure/독립 CSV selection 변경 없음 |

## 남은 closure 항목

1. Plan 017 D 전체 public API의 입력·성공·실패·취소 반환 및 command/query/reconciliation/renderer producer-consumer 대조. 일부 wrapper의 내부 tuple/public 반환 분리만으로 완료하지 않는다.
2. E의 global/axis → Plotly layout 전 field, style/extension 우선순위와 axis 보조 표시, palette/default color의 concrete 원천 및 defaults. 여기서 수치 변환을 정했다고 해당 의미가 모두 닫힌 것은 아니다.
3. 전체 operation/왕복 흐름에서 논리 완결성·목적 부합성·중복 및 통합 검토를 다시 수행한 뒤에만 closed를 검토한다. 그 전에는 PlusCal 충실 번역이나 하위 구현을 재개하지 않는다.

## 검증·제외

로컬에서는 읽기/편집/Git diff 및 byte fingerprint 계산만 수행했다. Source Script import, application, test, checker, build, TLC는 실행하지 않았다. Actions의 실제 누적 검사와 patch endpoint는 `agent_space/patches/20261016-012.md`에 기록한다. version checker 통과는 semantic closure/실행 정확성 증명이 아니다. 정책과 하위 PlusCal/model/JS/tests/build/distribution은 변경하지 않았다.
