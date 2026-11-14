# Plan 029 — Source Script의 설명 문자열과 불완전한 처리 절차 보완

작성일: 2026-11-15
상태: 전체 Python 문서의 구문 조사와 수정 대상 목록 작성. 의미 검토 및 보완 작업은 미완료.
기준 commit: `9e58bdf0381b62bb59068a44ca78d75be6edcaed`. 아래 위치는 Plan028 Source Script 수정 중 작업 파일 기준이다.

## 1. 요구와 조사 범위

Plan028을 먼저 진행하고, 처리 결과나 조건을 설명 문자열로 대신한 Source Script를 모두 찾아 이 계획에 기록하라는 요청을 따른다. Source Script에는 입력의 자료형·참조·소유자, 사용하는 정의, 판단 기준, 상태 변경 순서, 결과 구성과 실패 경로를 자연어 알고리즘으로 작성한다. 필요한 Python 표기는 그 설명에 대응한다.

`sourcescript/`의 Python 파일 15개를 전부 구문 분석했다. 함수·메서드와 내부 함수 184개 중 아래 105개에서 반환 결과·중간값·조건을 설명 문자열로 표현한 위치를 찾았다. 실제 명령 이름이나 파일명 문자열과 자료구조의 필드 설명은 용도에 따라 구분한다. 이 수치는 구문으로 확인한 수정 대상 수다. 나머지 함수의 의미적 완결성까지 확인한 수치로 사용하지 않는다.

설정 자료형은 기존 `sourcescript/backend/graphs.py`의 `chartModel`, `globalSettings`, `axisSettings`를 사용한다. 설정 이름과 축 이름 집합을 다른 함수에서 다시 소유하지 않는다.

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

- `sourcescript/frontend/mantine_ui.py`의 `MANTINE_COMPONENT_OWNERSHIP`에 등록한 이름은 각 화면의 책임 표다. 화면 입력을 설명할 때 해당 이름과 실제로 호출하는 함수, 인자와 반환 필드를 연결한다. 정의되지 않은 “control”, “지정 필드”, “적절한 설정”으로 처리를 생략한 부분을 대조한다.
- `sourcescript/application/public_api/__init__.py`의 `PUBLIC_API_METHODS`는 공개 계약의 연결 표다. 구현 절차에 사용하는 함수 이름·인자·결과 경로가 해당 Source Script의 함수 정의와 연결되는지 확인한다.
- `sourcescript/frontend/interface_fsm.py`의 `send`, `reconcileProjectResult`, `notify`와 `subscribe` 사이에서 상태 확정, revision 증가, listener 호출 순서를 연결한다. Plan028의 구독 변경이 의존하는 부분부터 보완한다.
- `sourcescript/application/adapter.py`의 `dispatchProjectCommand`와 `runLifecycleTask`는 성공·미반영·예외마다 실제 반환값과 ready 복귀를 구분한다.
- `sourcescript/backend/project_state.py`의 읽기 반환 구조와 `buildSlotAssetDisplay`에서 읽는 slot·chart·CSV 참조를 연결한다.
- `sourcescript/backend/graphs.py`의 `rebuildEditableGraph`, `validateChartModel`처럼 입력 객체를 그대로 반환하는 함수도 docstring에 기술된 계산·검증 단계와 변경 범위를 대조한다. 문자열 검출 여부만으로 완료 판정을 내리지 않는다.
- `sourcescript/backend/settings.json`은 기본값 자료다. 알고리즘은 이 기본값을 읽는 위치와 누락·유효한 0·False·빈 값의 해석을 설명한다.

## 4. 보완 순서

1. Plan028의 선택 참조 읽기, 객체 추가, 파일 불러오기와 구독 발행 경로를 먼저 보완한다. 현재 단계는 Source Script다.
2. Backend의 자료구조·현재 참조 해결·검증·읽기 반환 구성부터 보완한다. 기존 schema와 명시된 도메인 의미를 유지한다.
3. 자산·그래프·레이아웃 계산, Project EFSM의 candidate 구성·검증·한 번 반영·결과 구성을 보완한다.
4. Application의 공개 읽기·명령·파일 입력·lifecycle과 Frontend의 입력·표시·renderer 연결을 보완한다.
5. system 초기화와 portable build의 입력·출력·실패·자원 정리 순서를 보완한다.
6. 각 책임 단위에서 Source Script의 논리적 완결성, 요구 부합, 기존 정의 재사용과 복사본의 소비 경로를 확인한 뒤 pseudocode, source code 순으로 전파한다.

각 함수의 자연어 처리 절차에는 실제 정의된 인자·필드·메서드를 사용한다. 분기마다 조건을 판별하는 값, 그 값을 읽는 소유자, 적용 대상과 반환값을 기록한다. 표기의 길이나 Python 문장 수를 완료 기준으로 삼지 않는다.

## 5. 완료 근거와 경계

- 위 105개 항목과 3절의 연결마다 보완된 Source Script 위치 및 남은 의문을 기록한다.
- 결과 record·sequence의 구성, 참조 해결, 분기·반복·재계산과 실패 경로가 다음 계층으로 직접 번역될 정도로 구체화되어야 한다.
- schema의 필드명·명령 enum·기본값·자료 소유자를 중복 정의하지 않는다. 기존 정의를 참조한다.
- 문서에 근거가 있는 의미를 유지한다. 의미가 미정이면 그 위치와 필요한 결정을 기록하고 해당 단위를 닫지 않는다.
- 실제 Source Script 수정에는 revision·fingerprint와 native Git diff 및 동명 설명을 기록한다. 검사를 실행한 범위와 정적 대조 범위를 구분한다.
- 이번 목록 작성으로 전체 Source Script의 닫힘 또는 구현 정상 동작을 선언하지 않는다. 정책·AGENT·색인·배포 파일은 변경하지 않는다. 테스트·빌드·브라우저·commit·push는 이번 Source Script 보완에서 실행하지 않았다.
