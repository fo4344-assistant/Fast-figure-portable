# Plan025 / 1차 backend/graphs — 정적 번역 종료

2026-11-12, code142. Source45/PlusCal25의 의미를 그대로 번역한다. 해당 Source 595줄/PlusCal 821줄과 runtime, 실제 command/import 소비자를 전체/관련 구간으로 확인했다. r140 계산·r141 import는 재사용했다. 이 기록은 모듈의 정적 대응 종료이며 실행 검증 통과나 EFSM/assets 전체 모듈 종료가 아니다.

## 전체 대응표

경로 약칭: G=`sourcecode/backend/graphs.js`, E=`sourcecode/backend/project_efsm.js`, A=`sourcecode/backend/assets_files.js`. 모두 같은 Backend 후보/공식 read 경계이며 물리적 파일 배치는 새 논리 분해가 아니다.

| Source 절차 / PlusCal 확장 | 실제 대응과 분기 |
| --- | --- |
| dataTable | G.dataTable: string CSV parsing/array rectangular padding, 기존 missing 처리. |
| columnDefinitions | G.headerLineCount/dataRows/columnDefinitions: header count/최대 행 너비/C1…/원래 header값/별도 표시 label. r142에서 name의 강제 문자열 변환을 제거했다. |
| graphDataSelection | G.graphDataSelection: 유효 저장 x/y 유지, numeric/default 순서, 빈 표의 빈 참조. scalar 판정은 r140 graphScalarNumber를 사용하며 array/object의 Number coercion을 numeric으로 보지 않는다. |
| connectDataToSlotModel / NewChartInCandidate / CreateBaseGraphObject / ConnectDataInsideCandidate | E.applySlotDataConnectedAction 및 E.applyGraphObjectEditAction(addObject), A.buildProjectAssetImportCandidate: target/current CSV를 한 source에서 resolve, candidate clone, 새 chart id/title/global/object config 기본값, candidate CSV 참조, 후보 검증/투영, current 재확인 뒤 commit. G.createCandidateBaseGraphObject를 사용한다. G.baseGraphObject도 explicit CSV/config만 사용하게 바꾸고 Application selected CSV 의존을 제거했다. |
| graphEditorCommit / GraphCommitInAttempt / NormalizeCommandObjects | E.applyGraphObjectEditAction: command 내부 계산 배열만 candidate에, missing style만 보충, enum/limit 검증, 참조/순서/extension 임의 수선 금지, empty object 허용, index hint 반환. 원래 존재하던 일반 payload.objects 교체→commit→live rebuild 별도 경로는 명세에 없으므로 제거했다. G.normalizedGraphObjects도 missing style만 detached 복사한다. |
| CalculateOneObjectValues / NormalizeOneObjectEdit | E.applyGraphObjectEditAction(setObjectValues): 지정 current index/object/CSV, 명시된 own patch만 반영, config enum/default·finite numeric/text style clamp, invalid 값 유지, column fallback, 다른 object/unknown extension 보존. array/object/boolean을 numeric edit로 강제 변환하지 않는다. null은 기존처럼 invalid edit다. 현재 authority 변경 시 candidate를 버리고 재시도한다. |
| tracesSingle / NormalizeDivisor / ScaleCoordinate | G.tracesSingle + graphScalarNumber/graphDivisor/graphScaleCoordinate: r140 대응 유지. row/column pair filtering, divide→scale, finite/positive/reciprocal 분기, type/style/bar omission. |
| traces | G.traces: r140의 supplied project/chart owner/CSV resolve, conversion 금지, detached extension-first merge, computed bar mode 제거 유지. |
| rebuildEditableGraph | G.rebuildEditableGraph: 같은 project의 traces/layout로 command/query-owned chart만 갱신하고 chart를 반환한다. graph만 반환하던 차이를 수정했다. A/E 실제 호출은 모두 candidate/state를 전달하며 반환값을 사용하지 않는다. |
| chartFigure | G.chartFigure: editable은 복사본 rebuild, imported/noneditable은 원본 figure의 detached 출력, authority 수정 없음. 소비자의 pixel scaling은 별도 표현 plumbing이다. |
| layout / PlotlyAxis | G.layout의 r140 supplied chart/copy/config/extension 대응 유지. axis reference, Cartesian placeholders, optional property 실제 omission, font/title/legend/range/tick/grid/scale/zero-line 변환. |
| normalizeAxisSettings / OptionalNumber | G.normalizeGraphLayoutSettings 내부 축 normalize: config 기본값, numeric/text optional number, finite bounds와 zero 보존, scale/tick enum, 값 clamp. 별도 함수 이름이 아니라 동일한 의미 단위의 target-language helper다. |
| normalizeGlobalSettings | G.normalizeGlobalSettings(settings)→normalizeGraphLayoutSettings: 새 normalized settings 반환, 입력/authority 무변경. Application write lock 검사와 chart write를 제거했다. readGlobalSettings는 이 pure 계산을 사용한다. 실제 A.normalizeProjectObject/E.applySlotChartImportedAction은 소유한 candidate chart에 반환값을 명시적으로 대입한다. |
| validateChartModel | G.validateChartModel: optional positive id, boolean editable/objects, figure data의 record 항목/layout/config/frames/imported, global/axes/extension shape, conversion rows, 각 object record/csv/x/y/type/axis/dash/symbol/style finite bounds/trace extension. zero object를 허용하며 validation은 보정하지 않는다. conversion과 project CSV의 참조 분기를 유지한다. |
| parsePlotlyToEditor / ImportAxis | G.parsePlotlyToEditor/setNestedAxisFromPlotly: r141의 전체 trace structural columns/빈 trace/원본·extension detached 보존/import style 및 axis 변환 유지. |
| convertImportedChartToEditable / ConvertImportedChartInAttempt | E.applyChartModelReplacedAction: current chart/representation 확인, conversionRows를 새 candidate CSV bytes/metadata/id/path로 생성, object csvId 변경, candidate 검증/rebuild, current 재확인→commit. editable 분기에서 conversion용 CSV를 중복 생성하지 않는다. |

모든 15개 Source 절차 및 PlusCal private expansion을 위에서 대응시켰다. 이 모듈에서 새 상위 의미 결정이 필요한 분기는 발견하지 않았다. EFSM의 비그래프 command, assets의 비그래프 VFS/import 전체, public/UI 결과 정책은 후속 차수 범위다.

## 변경·검증 경계

기존 regression65에는 미등록 projected-array replacement가 commit/live rebuild로 가지 못하는 사례를, regression66에는 validator 실패 분기·무변경 pure normalize·raw header·scalar selection·missing-style-only 복사를 추가했다. 새 ID는 만들지 않았고 fixtures는 실행하지 않았다. native browser/Plotly와 import/package 호환성 회귀, 공식 checker는 마지막 허가된 검증 차수에 남는다.

code142는 계속 stale이다. Source/PlusCal/verification 및 derived_from을 바꾸지 않는다. 독립 canonical-LF byte hash로 r141 `a785b8dc5287466d4fac2893a925adda97378de307965dd688216226a554700f`를 재현하고 r142 `8c5ce7788c458fda2bea1cb17ef8ba36b707de4ef16cee8422c1e5318938bfe1`을 계산했다. app/tests/build/checker/TLC/browser/Actions/remote/commit/push는 실행하지 않았다.

Plan025의 다음 작업은 2차 backend/layout_annotations 전체 절차 번역이다. graph 모듈을 새 근거 없이 다시 열거나 완료된 계산/import를 폴리싱하지 않는다.
