# Plan025 / 2차 backend/layout_annotations — 정적 번역 종료

2026-11-12, code143. Source 337줄/PlusCal 433줄과 runtime 모듈 전체, 실제 Backend read 및 관련 EFSM command를 대조했다. 이전 renderer/public/export 대응은 재사용했다. 새 기능·UI 입력 정책·상위 명세 변경 없이 기록된 절차를 번역했다. 아래는 이 모듈의 11개 Source 절차와 PlusCal 확장 전체의 정적 대응이며 실행 검증이나 project_state/EFSM 전체 종료가 아니다.

G=`sourcecode/backend/layout_annotations.js`, P=`sourcecode/backend/project_state.js`, E=`sourcecode/backend/project_efsm.js`. 물리적으로 P/E에 배치된 기존 read/command는 같은 Backend owner 절차다.

| Source / PlusCal 절차 | 대응·분기·이번 변경 |
| --- | --- |
| orderedSlotLabels / formatLabel | G.orderedSlotLabels/orderedVisibleSlots/slotIdentifier/alphaIdentifier/romanIdentifier. visible anchor 전체(빈 slot 포함), row/column order, 순차 ordinal, bijective alpha/decimal/subtractive Roman, parentheses, enabled와 numbering 분리, immutable 출력은 기존 대응. displayedSlotIdentifier도 canonical annotation 설정을 사용하도록 했다. |
| insertSlotCaptions / renderCaptionGroup | G.insertSlotCaptions와 E.applySlotCaptionsInsertedAction의 기존 대응. explicit targets 검증/중복 제거, 순번 유지, 인접 ordinal과 exact/empty caption 그룹, empty는 저장 text를 덮지 않음, U+0020 경계와 기존 text/afterText/name/settings 보존, empty 대상 no commit, 후보 validation/current 재계산/한 번 commit. |
| dashboardGeometry / DashboardGeometryInProject | G.dashboardGeometry/dashboardGeometryInProject. 하나의 source, width/referenceWidth, valid height override 또는 natural aspect, 0.49 margin clamp, gap/radius scale. width 필드도 입력 width 그대로 반환한다. |
| gridSlotGeometry | G.gridSlotGeometry. cell gaps/margins와 merged span 내부 gap, missing slot의 1x1 reference. 기본 slot/선택/영속 state를 생성하지 않는다. |
| buildGridResizeCandidate / BuildGridResizeInAttempt | G의 public wrapper는 source를 한 번 잡아 새 buildGridResizeInProject에 전달한다. 모든 source slot(covered 포함)의 제거/교차 검사 → nondefault/merged 거부 → copy → resize/허용된 cell만 제거 → 기존 최대 id+1로 row-major 새 좌표만 생성 → whole candidate validation. 기존 두 번의 authority read와 copy 후 별도 hidden 판정 대신 명세의 검사 순서를 사용한다. newGridSlot은 config content의 deep-copy와 null chart/image/caption으로 생성한다. E.applyGridLayoutChangedAction은 같은 source helper를 호출하고 authority 교체 시 재계산한 성공 attempt만 commit한다. |
| readImageEditorApi | P.readBackendProjection → buildBackendImageRead. explicit visible image slot/type와 asset 확인, slot 복사본만 normalize, 복사 bytes/pure data URL/settings 출력, revocable resource/authority repair 없음. graph slot에 dormant image reference가 있거나 hidden/missing이면 none. runtime URL 필드명은 기존 소비자와 같은 src다. G.readImageSettings도 config default/limits 및 unknown extension 복사를 사용하고 literal fallback 숫자를 제거했다. 실제 asset/package import callers는 이 helper를 그대로 사용한다. |
| readLabelsApiState / BackendAnnotations_readLabelsApiState / LabelsReadInProject | P labels.readState. 하나의 source의 labels/layout/explicit visible slot, reference width의 dashboard geometry와 grid cell/span, 같은 ordinal0 formatter sample, immutable settings/reference. missing slot은 표시 geometry만 반환한다. |
| readGlobalCaptionState | P captions.readGlobal. global annotations.captions만 immutable copy한다. 정해진 몇 field만 다시 묶던 코드를 전체 copy로 바꿔 extension도 보존한다. UI mode/selection을 합성하지 않는다. |
| readSlotCaptionState | P captions.readSlot. hidden/missing은 none, explicit owner id/row/col과 현재 caption을 read-only로 반환한다. 기존 public/UI 직렬화의 text 필드 및 empty presentation은 유지한다. caption 저장값을 보완하거나 placeholder를 저장하지 않는다. |
| readExportSettings | P print.readSettings. current persistent export settings의 immutable copy. 계산된 geometry/status/DOM/blob은 영속화하지 않는다. |
| createTargetExportSnapshot | P의 print.save/print.capture export provider가 한 source에서 buildBackendSurfaceRead를 계산하고 export/raster limits를 붙여 immutable copy. layout/labels/captions/appearance/visible slot/chart figure/참조 CSV/image bytes/settings와 config captionReferenceStyle은 그 source/작업에서만 파생한다. runtime renderer-input 직렬화는 visibleSlots/figure/imageView 형태이며 registry를 여러 번 읽는 별도 authority/cache가 아니다. target geometry/DPI/현재 DOM 구분과 task 자원 해제는 r137 기록을 재사용한다. |

## 연결된 slot/annotation 규칙

E의 merge는 직사각형과 nondefault local 최대1을 검증하고 전체 local payload를 top-left anchor로 옮긴다. covered cell은 defaults로 비우며 split은 anchor payload를 유지하고 드러난 cell을 defaults로 복원한다. slotLocalState/setSlotLocalState는 caption/imageSettings/unknown content를 함께 복사한다. swap/reset/FFSX 대응은 기존 구현·검증 기록을 재사용하며 새 의미를 추가하지 않는다.

grid와 함께 label settings/position, layout style, merge/split에도 Source/EFSM의 current-source 재확인·재계산을 연결했다. 숫자/enum/position/reset/config/partial omitted field 처리 자체는 기존 명세 대응을 유지한다. image/caption text/settings/export command의 기존 current-source candidate 경로는 재작성하지 않았다. 다른 EFSM event 전체는 5차 범위이며 이 기록으로 종료시키지 않는다. Mantine 단일 grid dimension의 companion 값 조합은 8차의 미정 의미로 그대로 분리한다.

## 증거·미실행

기존 regression47에 explicit-source/no mutation/extension/id 및 6개 layout·label command의 validation 중 authority 교체→재계산/한 번 commit fixture를 추가했다. regression97에는 graph/hidden image read 거부, 읽기 복사본만 missing 설정 보완, config bounds/zero/extension detachment를 추가했다. regression106은 hidden slot caption 및 global read extension 보존을 확인한다. 새 ID 없이 작성했으며 실행하지 않았다.

Source45/PlusCal25/verification26/derived_from 불변, code143/stale. 독립 canonical-LF byte hash로 code142 `8c5ce7788c458fda2bea1cb17ef8ba36b707de4ef16cee8422c1e5318938bfe1`을 재현했고 code143은 `4edcba7b1f7a9c0617d0fad78c944b0385f7407925eef0d2d2ba4b2072eaae77`이다. 이는 공식 checker나 앱/테스트 pass가 아니다. local app/test/build/checker/TLC/browser, Actions/remote/commit/push/new goal은 실행하지 않았다.

이 모듈의 확인 범위에는 알려진 번역 누락/새 상위 결정 차단이 남지 않는다. native renderer/import/export/inline-split 통합 실행은 별도 대기한다. 다음은 Plan025 3차 backend/assets_files이며 완료된 graph/layout 계산을 새 근거 없이 다시 폴리싱하지 않는다.
