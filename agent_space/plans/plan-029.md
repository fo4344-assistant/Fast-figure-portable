# Plan 029 — Slot 오브젝트 정의와 전체 Source Script 예시 양식 재작성

작성일: 2026-11-15
상태: Source Script 50까지 수정했다. 변수 정의와 담당 처리의 분리를 추가 반영했으며 Source Script의 닫힘 검토는 열려 있다. pseudocode·source code는 미착수다.
기준 commit: `3081b4120257cfea77b72fb2941ed688f7617d5a`. 현재 로컬 작업을 먼저 커밋한 뒤 이 계획을 수정했다. 2절의 위치는 이 commit에 보존된 조사 대상의 위치다.

## 1. 요구와 조사 범위

현재 dictionary로 적힌 slot 정의를 슬롯 오브젝트의 공통 원형과 생성 절차로 먼저 정리한다. 그 다음 현재 Source Script 전체를 `agent_space/policies/examples/source-script_example1.py`의 예시 양식에 맞춰 재작성한다. Plan028의 선택 참조·객체 추가·파일 불러오기 문제도 이 전체 재작성에 포함한다.

대상은 `sourcescript/`의 Python 파일 15개 전체다. 모듈의 상태·원형·상수·참조 관계와 모든 클래스·함수·메서드·내부 함수의 설명 및 처리 절차를 함께 재작성한다. 2절의 105개 검출 항목만으로 범위를 제한하지 않는다. `sourcescript/backend/settings.json`은 기존 설정값 자료로 유지하고, 해당 값을 읽는 알고리즘과 연결한다.

기존 구문 조사에서는 함수·메서드·내부 함수 184개 중 105개에서 설명 문자열 형태를 검출했다. 이 목록은 이전 문제 위치를 추적하는 자료다. 원형의 필드 설명과 지역변수의 선언에는 예시처럼 설명 문자열을 사용할 수 있다. 각 함수의 실제 처리·분기·반환을 자연어로 충분히 정의했는지를 별도로 확인한다.

전체 재작성에서 기존 도메인 의미와 설정 원천을 유지한다. 기존 `chartModel`, `globalSettings`, `axisSettings` 같은 공통 정의는 재사용하며, 필요한 원형·상태·인스턴스의 구분을 명확하게 한다.

## 2. 수정 대상 전수 목록

각 항목의 함수, 위치와 발견한 표현을 기록한다. 동일한 함수에서 여러 형태가 발견되어도 함수 수에는 한 번 포함했다.

### `Fast-figure-portable/sourcescript/application/adapter.py`

함수 8개, 아래 형태 3개.

- `Fast-figure-portable/sourcescript/application/adapter.py:88` — `dispatchSlotSelection(slotId, pendingContentType=None, direction='ui-to-fsm')`: 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/application/adapter.py:112` — `dispatchProjectCommand(event, payload)`: 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/application/adapter.py:139` — `runLifecycleTask(lifecycle, event, task)`: 문자열로 표시한 반환 결과.

### `Fast-figure-portable/sourcescript/application/public_api/__init__.py`

함수 2개, 아래 형태 0개.

반환값·중간값·조건의 설명 문자열은 이번 구문 조사에서 검출되지 않았다. 공개 읽기의 입력·반환·참조 흐름은 Plan028에서 별도로 대조한다.


### `Fast-figure-portable/sourcescript/application/public_api/assets.py`

함수 19개, 아래 형태 9개.

- `Fast-figure-portable/sourcescript/application/public_api/assets.py:33` — `selectProjectCsv(path)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/application/public_api/assets.py:54` — `createEmptyProjectCsvAndSelect()`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/application/public_api/assets.py:67` — `importProjectFilesToDirectory(files, directory, planImport)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/application/public_api/assets.py:173` — `deleteProjectAsset(target)`: 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/application/public_api/assets.py:198` — `moveProjectNode(plan, useUniqueName)`: 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/application/public_api/assets.py:246` — `createProjectDirectory(parent, name)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/application/public_api/assets.py:267` — `connectProjectAssetToSlot(path, kind, slotId)`: 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/application/public_api/assets.py:297` — `importProjectFileToSlot(file, slotId, planImport)`: 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/application/public_api/assets.py:340` — `importProjectAssetFiles(files, planImport)`: 문자열로 표시한 반환 결과.

### `Fast-figure-portable/sourcescript/application/public_api/graphs.py`

함수 10개, 아래 형태 1개.

- `Fast-figure-portable/sourcescript/application/public_api/graphs.py:70` — `graphEditorMove(chartId, fromIndex, toIndex)`: 설명 문자열 조건.

### `Fast-figure-portable/sourcescript/application/public_api/layout_annotations.py`

함수 35개, 아래 형태 4개.

- `Fast-figure-portable/sourcescript/application/public_api/layout_annotations.py:68` — `insertEmptyImageIntoSelectedSlot()`: 설명 문자열 조건.
- `Fast-figure-portable/sourcescript/application/public_api/layout_annotations.py:93` — `prepareDashboardFileDrop(slotId)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/application/public_api/layout_annotations.py:111` — `readLayoutApiState(previewWidth=None)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/application/public_api/layout_annotations.py:137` — `setLayoutApiZoomLocked(locked)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.

### `Fast-figure-portable/sourcescript/backend/assets_files.py`

함수 21개, 아래 형태 21개.

- `Fast-figure-portable/sourcescript/backend/assets_files.py:162` — `normalizeProjectPath(value, directory)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:180` — `projectAssetPath(asset)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:197` — `slotFileKind(file)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:208` — `projectAssetImportCollisionModel(file, directory, reservedPaths)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:229` — `resolveProjectAssetImportPlan(model, choice, reservedPaths)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:254` — `buildProjectAssetImportCandidate(files, directory, planImport, targetSlotId=None)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:275` — `planProjectNodeMove(path, directory)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:294` — `projectFileStem(value)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:304` — `ffpxBuildProject()`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:327` — `ffpxReadProject(file)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:350` — `ffsxBuildSlot(slot, chart)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:370` — `ffsxReadSlot(file)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:390` — `projectVfsResolve(path, state)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:407` — `projectVfsUniquePath(path, state, reservedPaths)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:424` — `projectVfsDescendants(directory, state)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:440` — `parseProjectDataAsset(name, bytes)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:461` — `collectAssetReferences(csvIds, imageIds, state)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:484` — `ffpxEncodeValue(value)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:502` — `ffpxDecodeValue(element)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:519` — `buildProjectObject(payload, fileName)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/assets_files.py:547` — `applyFfsxSlot(slotPayload, targetSlot)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.

### `Fast-figure-portable/sourcescript/backend/graphs.py`

함수 15개, 아래 형태 13개.

- `Fast-figure-portable/sourcescript/backend/graphs.py:150` — `dataTable(data)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/graphs.py:168` — `columnDefinitions(table, headerLines)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/graphs.py:185` — `graphDataSelection(matrix, headerLines, editor)`: 반환 구조 안의 설명 문자열.
- `Fast-figure-portable/sourcescript/backend/graphs.py:204` — `connectDataToSlotModel(slot, data, sourceName, projectCsv)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/graphs.py:249` — `graphEditorCommit(chartId, objects, index)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/graphs.py:279` — `tracesSingle(objectView)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/graphs.py:329` — `traces(chart, project)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/graphs.py:382` — `chartFigure(chart, project)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/graphs.py:404` — `layout(chart, project)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/backend/graphs.py:447` — `normalizeAxisSettings(axis, key)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/graphs.py:476` — `normalizeGlobalSettings(settings)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/graphs.py:528` — `parsePlotlyToEditor(figure, chartId)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/graphs.py:570` — `convertImportedChartToEditable(chart)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.

### `Fast-figure-portable/sourcescript/backend/layout_annotations.py`

함수 11개, 아래 형태 11개.

- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:122` — `orderedSlotLabels(project)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:140` — `insertSlotCaptions(project, slotIds=None)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:167` — `dashboardGeometry(width, heightOverride)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:188` — `gridSlotGeometry(layout, geometry, slot)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:208` — `buildGridResizeCandidate(rows, cols)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:236` — `readImageEditorApi(slotId)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:249` — `readLabelsApiState(slotId)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:269` — `readGlobalCaptionState()`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:286` — `readSlotCaptionState(slotId)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:303` — `readExportSettings()`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/layout_annotations.py:316` — `createTargetExportSnapshot()`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.

### `Fast-figure-portable/sourcescript/backend/project_efsm.py`

함수 1개, 아래 형태 1개.

- `Fast-figure-portable/sourcescript/backend/project_efsm.py:182` — `send(self, event, payload)`: 문자열로 표시한 반환 결과.

### `Fast-figure-portable/sourcescript/backend/project_state.py`

함수 16개, 아래 형태 12개.

- `Fast-figure-portable/sourcescript/backend/project_state.py:376` — `buildSlotAssetDisplay(slot, project)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/backend/project_state.py:402` — `readBackendProjection(kind, request)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/project_state.py:571` — `slotHasNonDefaultLocalState(slot)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/project_state.py:679` — `createProjectState()`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/project_state.py:706` — `resolveOwningSlot(chartId, state)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/project_state.py:725` — `getProjectCsv(csvId)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/project_state.py:738` — `getProjectImage(imageId)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/project_state.py:751` — `getChart(chartId)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/project_state.py:505` — `read(self, path)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/project_state.py:521` — `initialize(self, source)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/project_state.py:539` — `read(self, name)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/backend/project_state.py:554` — `snapshot(self, names)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.

### `Fast-figure-portable/sourcescript/frontend/interface_fsm.py`

함수 7개, 아래 형태 3개.

- `Fast-figure-portable/sourcescript/frontend/interface_fsm.py:143` — `send(self, event, validatedInput)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/interface_fsm.py:154` — `reconcileProjectResult(self, event, reconciliationInput)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/interface_fsm.py:165` — `notify(self, objectName, event, payload)`: 문자열로 표시한 반환 결과.

### `Fast-figure-portable/sourcescript/frontend/mantine_ui.py`

함수 15개, 아래 형태 5개.

- `Fast-figure-portable/sourcescript/frontend/mantine_ui.py:177` — `changeLayoutGridDimension(dimension, value)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/mantine_ui.py:195` — `handleDebugToggle()`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/mantine_ui.py:375` — `useProjectAssetImportCollision()`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/mantine_ui.py:415` — `FastFigureApp()`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/frontend/mantine_ui.py:444` — `FastFigureShell()`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.

### `Fast-figure-portable/sourcescript/frontend/renderer.py`

함수 22개, 아래 형태 20개.

- `Fast-figure-portable/sourcescript/frontend/renderer.py:60` — `publishUiTelemetry(patch)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:77` — `readDebugEnabled()`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:86` — `setDebugEnabled(enabled)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:100` — `status(message)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:128` — `applyDashboardProjectionInvalidation(event, mutationResult, interfaceState, projectProjection)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:137` — `renderDashboard(projectProjection, interfaceState)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:176` — `setSelectedSlot(slotId, direction, frontendActions)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:196` — `installSlotClickController(frontendActions)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:237` — `swapSlotContents(source, target, frontendActions)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:265` — `prepareDashboardFileDrop(slotId, frontendActions)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:290` — `applyUiPalette(projectProjection, notify)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:302` — `applySlotStyle(projectProjection, notify)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:315` — `resolveSelectedChart(projectProjection, interfaceState)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:332` — `updateGraphView(projectProjection, interfaceState)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:344` — `startupCoreRuntime(projectProjection, interfaceState, frontendActions)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:363` — `readDashboardRenderedWidth()`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:370` — `downloadExportPayload(payload)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:384` — `exportCaptionLayout(snapshot, measureText)`: 문자열로 표시한 반환 결과.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:409` — `renderDashboardTarget(snapshot, statusSink)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.
- `Fast-figure-portable/sourcescript/frontend/renderer.py:451` — `renderDashboardCurrent(snapshot, statusSink)`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.

### `Fast-figure-portable/sourcescript/portable_build/portable_build.py`

함수 1개, 아래 형태 1개.

- `Fast-figure-portable/sourcescript/portable_build/portable_build.py:54` — `build(output)`: 문자열로 표시한 반환 결과.

### `Fast-figure-portable/sourcescript/system.py`

함수 1개, 아래 형태 1개.

- `Fast-figure-portable/sourcescript/system.py:214` — `initializeFastFigure()`: 문자열로 표시한 반환 결과, 설명 문자열 중간값.

## 3. 구문 목록 외에 함께 보완할 연결

- 조사 당시 `sourcescript/frontend/mantine_ui.py`의 `MANTINE_COMPONENT_OWNERSHIP`에 적었던 화면 책임은 현재 각 담당 함수의 `처리`로 옮겼다. 화면 입력을 설명할 때 화면 이름과 실제로 호출하는 함수, 인자와 반환 필드를 연결한다. 정의되지 않은 “control”, “지정 필드”, “적절한 설정”으로 처리를 생략한 부분을 대조한다.
- `sourcescript/application/public_api/__init__.py`의 `PUBLIC_API_METHODS`는 공개 계약의 연결 표다. 구현 절차에 사용하는 함수 이름·인자·결과 경로가 해당 Source Script의 함수 정의와 연결되는지 확인한다.
- `sourcescript/frontend/interface_fsm.py`의 `send`, `reconcileProjectResult`, `notify`와 `subscribe` 사이에서 상태 확정, revision 증가, listener 호출 순서를 연결한다. Plan028의 구독 변경이 의존하는 부분부터 보완한다.
- `sourcescript/application/adapter.py`의 `dispatchProjectCommand`와 `runLifecycleTask`는 성공·미반영·예외마다 실제 반환값과 ready 복귀를 구분한다.
- `sourcescript/backend/project_state.py`의 읽기 반환 구조와 `buildSlotAssetDisplay`에서 읽는 slot·chart·CSV 참조를 연결한다.
- `sourcescript/backend/graphs.py`의 `rebuildEditableGraph`, `validateChartModel`처럼 입력 객체를 그대로 반환하는 함수도 docstring에 기술된 계산·검증 단계와 변경 범위를 대조한다. 문자열 검출 여부만으로 완료 판정을 내리지 않는다.
- `sourcescript/backend/settings.json`은 기본값 자료다. 알고리즘은 이 기본값을 읽는 위치와 누락·유효한 0·False·빈 값의 해석을 설명한다.

## 4. 1단계 — Slot 오브젝트의 원형·생성·소유 관계 정리

주 대상은 `sourcescript/backend/project_state.py`다.

1. 현재 `slot = {...}`에 설명만 나열한 정의를 공통 원형 `class Slot`으로 작성한다. id, row, col, rowSpan, colSpan, hidden, content, caption의 의미와 자료형을 정의하고, content의 chart/image 참조 및 imageSettings의 소유 관계를 연결한다.
2. Slot의 원형과 실제 슬롯 인스턴스를 구분한다. 생성에 필요한 인자와 각 필드의 초기값을 어디서 읽거나 계산하는지 생성 절차에 명시한다. 기존 slot-local 기본값·빈 참조·좌표·id 생성 규칙을 유지한다.
3. `createProjectState`와 grid 확대에서 각 셀에 Slot 인스턴스를 만들고 프로젝트의 slots 컬렉션에 넣는 절차를 작성한다. FFPX 복원, FFSX 적용, 정규화·복사 과정에서도 원형과 인스턴스의 관계를 연결한다.
4. `ProjectObject`가 `_state`를 소유하고, `_state.layout`에 레이아웃 딕셔너리, `_state.slots`에 개별 Slot 인스턴스를 담는 관계를 Source Script에 명시한다. 현재 프로젝트 인스턴스의 Source of Truth는 기존 `activeProject`로 유지한다.
5. 슬롯 조회에서는 읽을 프로젝트, slots 컬렉션, id·hidden 조건, 찾은 인스턴스와 부재 결과를 명시한다. 호출자는 그 결과를 어떤 인자로 넘기는지 설명한다.
6. 모든 슬롯 소비 절차의 접근 표기·인자 설명·원형 경로를 Slot 정의와 맞춘다. 공통 원형을 `Slot`으로 정리하면 원형 참조도 `/backend/project_state/Slot`로 연결한다. layout 딕셔너리 접근과 Slot 속성 접근을 구분한다.

이 단계의 완료 근거는 원형 정의에서 생성, 소유 컬렉션 저장, 조회, 인자 전달, 사용까지 이어지는 Source Script의 실제 위치다. 기존 데이터의 필드명과 저장 형식, 슬롯의 영속 의미를 유지한다.

## 5. 2단계 — 전체 Source Script를 예시 양식으로 재작성

작성 기준은 `agent_space/policies/examples/source-script_example1.py`와 `agent_space/policies/development-policy.md`다.

### 5.1. 공통 작성 형식

- 함수 설명은 `Args`·`Return`·`변경`·`처리` 순서로 작성한다. 인자와 반환값은 `- 이름:` 아래 들여쓴 설명으로 구분한다.
- `Args`에는 상단 정의로 충분하지 않거나 구조 이해에 추가 설명이 필요한 내용을 적는다. 딕셔너리, 오브젝트, 배열, 숫자, 참조와 부재 값을 구분한다.
- 원형은 `원형: /모듈경로/정의`로, 실제 상태 소유자는 `Source of Truth: /모듈경로/변수.필드`로 표시한다. 컬렉션 원소라면 `…의 원소`까지 적는다. 계산 결과와 작업용 반환값의 생성·저장·전달은 처리 절차에 연결한다.
- `Return`에는 반환값의 의미를 적는다. 같은 함수 안에 원형을 정의한 결과는 그 원형 경로를 반복하지 않는다. 본문 끝에는 실제 반환 변수의 `return`을 작성한다.
- `변경`에는 다른 객체나 소유 상태의 어느 값을 바꾸는지 적는다. 읽기·계산 함수는 `- 없음.`으로 표시한다. 지역변수 대입과 반환값 구성은 상태 변경과 구분한다.
- 지역변수와 지역 결과 구조는 예시처럼 함수 안에 선언한다. 처리 설명에서 처음 등장한 이름을 선언 없이 사용하지 않는다.
- `처리`에는 입력을 읽는 위치, 분기 조건, 계산·반복 순서, 참조 해결, 변경 대상, 반환 구성과 실패 경로를 자연어로 작성한다. 계산식은 정의한 변수와 정확한 속성 접근으로 적는다.
- 핵심 알고리즘과 오류 처리는 언어 독립적인 자연어로 설명한다. Python의 try/except 등 실행 구문을 핵심 명세의 대용으로 사용하지 않는다. 기존 함수 호출·변수 선언·반환은 설명과 대응하도록 작성한다.
- 길이는 px 등 확정된 단위를 명시한다. 자료형·정수화 시점·기본값은 기존 정의에서 확인한 규칙을 적고, 미확정 사항은 해당 위치에서 해결한다.
- ‘기존 규칙에 따라 필요한’, ‘적절한 설정’, 정의되지 않은 ‘control’처럼 처리를 생략하는 표현을 구체적인 정의·조건·계산·호출로 바꾼다. 설명 목적과 관계없는 부정문과 A-not-B 서술은 줄인다.

### 5.2. 전체 파일 진행 순서

1. Backend project_state의 상태 소유자·공통 원형·읽기·참조·생성·검증을 정리한다. 1단계 Slot 정의와 실제 소비 관계를 함께 대조한다.
2. Backend graphs, layout_annotations, assets_files의 모든 자료 정의와 함수 알고리즘을 재작성한다. 원형과 값 생성, 부분 변경과 전체 교체, 원본과 작업용 복사를 구분한다.
3. Backend project_efsm의 모든 명령을 현재 상태 조회, candidate 구성, 검증, 재계산 조건, 한 번 반영, 반환·실패 순서로 재작성한다.
4. Application adapter와 public_api의 모든 Python 문서를 재작성한다. 입력 전달, 공식 읽기와 명령, 파일 입력, lifecycle과 성공·미반영·예외 반환을 연결한다.
5. Frontend interface_fsm, renderer, mantine_ui의 모든 상태·원형·클래스·함수를 재작성한다. Plan028의 선택 참조·구독·객체 추가·파일 불러오기 경로를 함께 완성한다.
6. system과 portable_build를 같은 양식으로 재작성한다. 구성·초기화·입출력·완료·실패·자원 정리의 실제 순서를 설명한다.
7. 전체 15개 Python 문서를 처음부터 끝까지 다시 읽어 빠진 정의와 함수, 인자·반환·상태 소유자의 연결을 확인한다. 2절의 기존 검출 목록과 3절의 연결도 이때 대조한다.

## 6. 완료 근거와 후속 계층

- 1단계 Slot 오브젝트의 원형·생성·소유·조회·소비 연결이 작성되어야 한다.
- 15개 Python 문서 전체의 정의와 모든 함수에 예시 양식을 적용한 위치를 기록한다. 기존 105개 검출 항목 외 함수도 포함한다.
- 자연어 알고리즘에서 사용하는 변수·필드·메서드·명령·기본값은 실제 정의에 연결되어야 한다. 호출자와 피호출자 사이의 인자·반환·부재·오류 의미를 대조한다.
- 원형 선언, 실제 상태 인스턴스, 현재 상태를 소유하는 변수, 작업용 계산 결과를 구분한다. 기존 공통 정의와 설정 원천을 재사용한다.
- Source Script의 논리적 완결성·요구 부합·중복 정의·복사본의 소비 경로를 검토한 근거를 확인한 뒤 닫힘을 판단한다. 미해결 의미가 남은 위치는 열린 상태로 기록한다.
- 실제 Source Script 수정 시 revision·fingerprint, 실제 native Git diff와 동명 설명을 기록한다. 실행한 검사와 정적 대조를 구분한다.
- 전체 Source Script의 보완·닫힘 근거를 확인한 뒤 pseudocode, source code 순으로 대응 절차와 전체 소비 경로에 전파한다. 하위 계층에서 발견한 미정 의미는 Source Script에 먼저 반영한다.
- 계획 수정 요청에서 수행한 작업은 기존 로컬 변경의 선행 커밋과 Plan029 수정이다. 이어진 작업 시작 지시에 따른 Source Script 수정 경과는 8절에 기록한다. 전체 Source Script의 보완과 닫힘 판단 전까지 pseudocode·source code를 수정하지 않는다. 정책 본문·AGENT·색인·배포 파일을 변경하지 않는다.

## 7. 계획 수정 시점의 결과

- 선행 로컬 커밋: `3081b4120257cfea77b72fb2941ed688f7617d5a`.
- 기존 구문 조사 목록을 보존하고, Slot 오브젝트 정리를 첫 단계로 배치했다.
- 예시 양식의 적용 대상을 105개 검출 함수에서 현재 Source Script 전체로 확대했다.
- 계획 수정 완료 시점에는 이후 구현과 추가 커밋·푸시를 실행하지 않았다.

## 8. 구현 경과 — Source Script 48, 열린 상태

- 작업 시작 지시에 따라 1단계의 `Slot` 클래스와 `ProjectObject._state` 소유 구조를 작성했다. `createProjectState`, `normalizeSlotContent`, `resolveVisibleSlot`에 생성·복원·조회 경로를 연결했다.
- grid 확대의 새 슬롯 생성, 프로젝트/슬롯 패키지의 저장 자료와 Slot 간 변환, 라벨 기준 치수 조회와 `gridSlotGeometry` 전달을 보완했다. 기존 소비 절차와 예시의 슬롯 원형·속성 접근도 맞췄다.
- 새 프로젝트의 행 우선 id 계산, 기존 슬롯 id·좌표·span·내용 보존, 현재 `activeProject` 소유와 검증 후 반영 경계를 유지한다. 슬롯 기본값은 `sourcescript/backend/settings.json`에서 읽는다.
- Source Script 48의 실제 fingerprint와 native 변경 기록은 `development-versions.json`, `agent_space/patches/20261115-009.patch` 및 동명 설명에 기록한다. 구문 파싱과 실제 변경 대조만 수행했다.
- 이 기록은 1단계의 1차 반영 시점이다. 이후 전체 재작성 결과는 9절에 기록한다. Source Script 48 시점에는 `stale`·`open`을 유지했다.
- pseudocode·source code·배포 파일은 수정하지 않았다. 테스트·앱·빌드·브라우저·version checker 본체·커밋·푸시는 실행하지 않았다.

## 9. 전체 작성 형식 반영 — Source Script 49

변수 정의와 처리 설명을 분리하라는 후속 지시에 따라 아래 15개 Python 문서 전체에 예시 양식을 반영했다. 2절의 105개 항목은 이전 조사 시점의 위치 기록으로 보존한다. 이때의 함수 양식 적용 범위는 중첩 함수와 클래스 메서드를 포함한 188개 함수다. 이후 전역 변수에 절차 설명이 남아 있다는 사용자 지적을 받아 10절의 추가 수정을 수행했다.

| Source Script 파일 | 함수·메서드 수 |
| --- | ---: |
| `sourcescript/application/adapter.py` | 8 |
| `sourcescript/application/public_api/__init__.py` | 2 |
| `sourcescript/application/public_api/assets.py` | 19 |
| `sourcescript/application/public_api/graphs.py` | 10 |
| `sourcescript/application/public_api/layout_annotations.py` | 35 |
| `sourcescript/backend/assets_files.py` | 21 |
| `sourcescript/backend/graphs.py` | 15 |
| `sourcescript/backend/layout_annotations.py` | 11 |
| `sourcescript/backend/project_efsm.py` | 1 |
| `sourcescript/backend/project_state.py` | 19 |
| `sourcescript/frontend/interface_fsm.py` | 8 |
| `sourcescript/frontend/mantine_ui.py` | 15 |
| `sourcescript/frontend/renderer.py` | 22 |
| `sourcescript/portable_build/portable_build.py` | 1 |
| `sourcescript/system.py` | 1 |
| 합계 | 188 |

- 지역변수 선언을 설명 앞에 두고 자료형·원형·값의 의미를 적었다. 생성·복사·검증·반영 순서는 `처리`에 배치했다. `buildProjectObject`의 candidate 정의에는 `ProjectObject` 원형을 연결했다.
- 함수 설명을 `Args`·`Return`·`변경`·`처리` 순서로 통일하고 실제 반환 변수를 연결했다. 계산 결과 구성, candidate 변경, 현재 소유 상태 반영, DOM·자원·다운로드 변경을 구분했다.
- Slot 생성·저장 자료 변환·현재 소유자 조회, graph 참조·축 병합, VFS 이동·휴지통·패키지, Frontend 발행·구독·현재 선택 입력, renderer 자원·raster·caption, 초기화·portable build 절차를 각 담당 함수에 작성했다. 기존 설정 값과 수식은 유지했다.
- Application의 슬롯·chart 조회 인자를 Backend 등록 조회와 맞췄다. CSV 선택, 디렉터리 생성·이동, 빈 이미지 생성의 반영 후 실제 반환 경로와 미반영·실패 처리를 연결했다. UI 반환형에는 chart·layout·논리값 및 미반영 결과·None을 명시했다.
- 당시 188개 함수 설명의 절 순서와 반환 변수 선언을 정적으로 확인했다. 전역 절차 설명을 빠뜨린 이 확인만으로 전체 변수 정의 정리가 끝났다고 보고한 판단은 철회한다. 이전 Source Script의 함수명·명령명·주요 수치 보존도 대조했다. 이는 Source Script 또는 앱을 실행한 결과가 아니다.
- Source Script 49의 fingerprint는 `development-versions.json`에 기록했다. 실제 변경과 목적은 `agent_space/patches/20261115-010.patch` 및 동명 설명에 기록한다.
- Source Script 49는 `stale`·`open`을 유지했다. pseudocode·source code·설정 데이터·배포 파일·정책 본문·AGENT는 수정하지 않았다. 테스트·앱·빌드·브라우저·version checker 본체·커밋·푸시는 실행하지 않았다.

## 10. 전역·클래스·지역 변수의 절차 설명 분리 — Source Script 50

- 15개 Python 파일의 모듈 변수, 클래스 필드와 원형, 함수 지역변수를 함께 대조했다. 전역·클래스 정의 158개 블록을 읽고 전체 대입과 남은 절차·부정 표현을 추가 조사했다.
- 절차를 담았던 전역 정의 91개를 제거했다. EFSM 명령 처리, Frontend 전이, 생성·정규화, 읽기, renderer 자원·내보내기, 초기화·빌드의 실제 절차는 각 담당 함수의 `처리`에 배치했다. 이전 검토·이력 문구는 Source Script에서 제거했다.
- `PROJECT_COMMANDS`는 명령 이름 tuple, 이벤트 목록은 식별자 tuple, 등록 객체 경로는 실제 필드 경로 tuple로 작성했다. `PUBLIC_API_METHODS`에는 함수 식별자와 query/event/call 연결 자료를 두고 `createPublicApi`에서 callable 구성·현재 참조 조회·lifecycle 연결을 설명했다. 공개 namespace와 메서드 이름을 보존했다.
- `ProjectStateMachine.send`에서 명령별 candidate 구성, 전체 검증, 현재 authority 재확인, 한 번 반영, 실제 반영 결과와 index mapping 반환을 순서대로 연결했다. Frontend 전이는 거부·no-op·성공과 error→ready 두 발행을 구분했다.
- 변수 정의에는 자료형·원형·값의 의미를 남겼다. directory 생성, content/caption의 존재 여부 처리, 상태 복사·검증·반환은 담당 처리로 옮겼다. 불필요한 경계 구호와 A-not-B 문구를 제거하고 실제 거부·유효성·no-op 조건을 보존했다.
- 삭제한 정의의 참조와 내부 import, API 연결 함수, 192개 함수·메서드 설명의 절 순서 및 전체 대입 357개를 정적으로 대조했다. 실제 수정은 14개 Python 파일이다. 공개 graph wrapper 파일도 정의 대조에 포함했으며 이번 추가 수정은 없었다.
- 이전 전역 설명을 옮긴 위치도 실제 입력과 처리 대상으로 다시 대조했다. 공통 STORE 패키지 읽기는 readStorePackage, CSV header 수치는 normalizeCsvHeaderLines, 프로젝트 설정은 normalizeProjectSettings에서 처리한다. createPublicApi를 포함하여 기존 188개 함수에서 4개 담당 절차가 추가되었다.
- 프로젝트 초기화는 candidate 정규화·전체 검증 후 한 번 교체하도록 연결했다. 읽기 함수는 한 번 잡은 프로젝트와 요청 operation으로 분기하고, graph·UI·renderer의 처리 대상을 각 소유 절차에 연결했다. system은 runtime 준비·초기 projection·ready·단일 UI mount 순서로 정리했다.
- Source Script 50의 fingerprint와 실제 native 변경은 `development-versions.json`, `agent_space/patches/20261115-011.patch`와 동명 설명에 기록한다. Source Script는 `stale`·`open`이며 전체 의미의 닫힘 검토는 남아 있다. 하위 계층·설정 데이터·배포 파일·정책 본문·AGENT는 보존했다. 테스트·앱·빌드·브라우저·version checker 본체·커밋·푸시는 실행하지 않았다.
