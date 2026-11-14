# Plan025 / 4차 backend/project_state — r145 번역, 전체 종료 아님

2026-11-13. Source45/PlusCal25를 code145로 번역했다. Source729줄/PlusCal746줄/runtime880줄을 끝까지 확인하고 실제 registry/Frontend/System/public asset 소비자를 대조했다. 이미 대응된 절차는 재사용했다. 실행 검증은 하지 않았다.

## 15개 Source 절차·메서드 / PlusCal 확장 대응

| Source / private 확장 | 대응 및 이번 번역 |
| --- | --- |
| createProjectState | Backend config의 layout template 전체를 복사하고 export width를 referenceWidth에서 최종 도출, auto height=null/explicit height 하한으로 설정, 새 빈 slot 이후 whole validation을 거쳐 반환. config는 공유 불변 데이터이며 instance state가 아니다. |
| validateProjectObjectState | 기존 schema/record/assets bytes·metadata/VFS parent/path/id/nextId/chart owner/geometry/local state 검사 유지. grid/style/label/export/image 범위와 고정 경로는 Backend config를 사용한다. auto height의 명시적 null 제약을 추가. 보정/commit은 하지 않는다. |
| normalizeSlotContent | 기존 canonical content 우선, missing-only 초기값, legacy alias의 단일 owner plumbing과 extension 보존을 유지. 읽기 시 normalize하는 경로를 제거해 normalize와 immutable read를 구분했다. |
| slotHasNonDefaultLocalState | content type/chart/image/caption 및 imageSettings 전체의 구조적 값 비교. 고정 4필드 비교 대신 record 순서와 무관한 equality로 Source의 전체 설정 비교를 구현한다. |
| ProjectObject.read | projectObjectPath의 명시 path를 읽고 structuredClone+recursive freeze. 이전 projectClone의 whole-project slot normalize가 읽기 복사에 섞이지 않게 변경. 권위 변경/보정 없음. |
| ProjectObject.initialize | 기존 source copy→slot normalize→validate→단일 _state 교체를 유지. Source의 교체 전 실패 보존과 대응한다. |
| ProjectObjectRegistry.read | 기존 등록 path/reader 확인→현재 provider의 ProjectObject 확인→공식 immutable read를 유지. 아래 ui custom adapter는 별도 미완료 경계다. |
| Registry.snapshot / SnapshotProjectPathsInRead | provider와 raw _state를 한 번 capture하고 지정된 registered PROJECT_OBJECT_PATHS를 같은 source에서 읽어 전체 immutable snapshot으로 반환. this.read 반복으로 다른 current를 섞거나 읽기 복사에 normalize하지 않는다. 기본 names는 Backend project paths이며 ui는 snapshot field가 아니다. |
| resolveOwningSlot | 지정 project에 chart가 있고 content.chart를 참조하는 slot이 정확히 하나일 때 반환하는 helper를 추가했다. graph editor 명시 chartId read가 사용한다. |
| getProjectCsv / getProjectImage / getChart | current collection의 id resolve, 없으면 null. chart의 undefined 반환을 null로 맞췄다. |
| validateFrontendIntent | 명시 null만 deselection, missing/undefined는 거부. null SELECT_SLOT은 direction과 무관하게 project/toggle-clear. visible content/chart/editable/CSV 참조를 확인한 뒤 승인하며 잘못된 선택은 UI를 변경하지 않는다. reference와 hint만 반환. |
| buildFrontendReconciliationInput | committed 결과만 수용. reset/clear → 같은 chart의 explicit index hint → 같은 chart map/유효 index 우선순위, current slot/asset 재확인과 canonical path. raw payload.clearGraphSelection을 권위로 사용하지 않는다. projectionEffect는 detached/frozen, 자산 없음은 Backend null이다. 실제 Frontend 소비자만 null을 자기 state의 none으로 변환한다. graph index-only 계산은 CSV 선택을 새로 만들지 않는다. |
| readBackendProjection / BuildPlainProjectRead | 등록 kind/operation guard와 interface-intent/reconciliation owner 연결. plain immutable copy는 slot을 normalize하지 않는다. Project/slot/layout/labels/settings/palette 반환은 해당 same-source snapshot이며 nested extension도 freeze한다. |
| BuildGraphEditorRead / BuildImageEditorRead / BuildSurfaceRead / NormalizePreviewReadWidth | canonical slot.content 참조로 읽고 graphId는 유일 owner를 resolve. explicit chart owner는 selected-slot read의 visibility와 혼동하지 않는다. 기존 graph/CSV table/figure/image copied bytes·pure data URL·supplied screen projection은 재사용했다. preview scalar는 number/string/boolean/null만 숫자 변환하고 array/object coercion은 하지 않는다. renderer의 slot-image 외 요청은 supplied surface 분기다. |
| BuildVfsRead | 기존 path/collision/move/deletion-target 계산의 read 경계를 유지. canonical tree/trash 소비 연결은 아래처럼 남아 있으므로 이 행/모듈을 종료로 표시하지 않는다. |

## 아직 남은 정확한 경계

1. **canonical tree/trash의 coherent public/UI 소비**: Backend `assets.readTree`는 아직 legacy `projectDataTreeSnapshot` flat envelope를 반환하고 `assets.readTrash`는 등록 목록에 있으나 구현 분기가 없다. PlusCal의 canonical node tree/trash subtree로 Backend만 바꾸면 실제 public/Mantine의 directories/data/images/charts/slots·editability 표시가 깨진다. 새 envelope/API, all-chart 공식 read, feature 삭제나 unused Backend-only parallel branch를 만들지 않았다. docs004의 정정대로 CSV metadata/reference counts/explicit-path deletion target은 이미 Source에 있다. 미정인 all-chart/slot 표시 공급 의미만 상위 결정 대상이다. 7d/8차의 실제 소비와 함께 해소 후 이 모듈을 닫는다.
2. **ui registry의 Backend→Frontend 역참조**: initializeProjectObjects의 기존 ui custom reader가 interfaceRuntime.selectedSlotId를 읽는다. 실제 Frontend definition.objects 알림과 System audit가 ui를 registry 항목처럼 사용하므로 callback 하나만 제거하거나 가짜 Backend ui state로 대체하지 않았다. 이는 새 상위 의미 결정이 아니라 이미 명시된 소유권의 연결 번역 잔여다. 6a/9차에서 실제 metadata/audit owner 경로와 묶어 제거해야 하며 그 전에는 이 모듈을 전체 종료로 표시하지 않는다. snapshot을 Backend path로 한정한 것이 이 custom reader 자체를 제거한 것은 아니다.

알려진 두 경계를 이유로 이미 명시된 다른 절차 번역을 미루지 않았다. Plan025 규칙에 따라 이 모듈은 **미완료/연결 대기**로 남기고 다음 독립 5차 backend/project_efsm을 진행할 수 있다. 상위 결정은 필요할 때 구체적인 read/표시 선택지로 요청하며 freshness나 권위 정책에서 UI 의미를 추측하지 않는다.

## 증거와 실행 경계

기존 regression37/38/109/140/141/142에 명시 null vs missing, noneditable 선택 거부, committed-only/hint-only 우선순위·detached effect, 설정 범위/auto height, one-provider immutable snapshot, read의 normalize 무혼입, record 순서 독립 비교를 추가했다. 새 ID 없이 authored-only, 미실행이다.

r144 canonical-LF byte hash `sha256:21da391d3918b20b7041083cbdd09762847afe8d6232cab19e445b115a5fbf68`를 재현했다. code145/stale `sha256:ba6ad182dc54a6045c4eb034ee6f59e871bed05bc5d9ad157a247a2c96d9716e`. Source45/PlusCal25/verification26/derived_from 불변. 이 독립 hash/정적 대조는 공식 checker/전체 current 판정이 아니다. app/tests/build/checker/TLC/browser/Actions/remote/commit/push/new goal은 실행하지 않았다.
