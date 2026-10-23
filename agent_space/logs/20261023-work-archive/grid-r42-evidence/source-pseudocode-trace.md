# Static Source → pseudocode entry/input trace

Coverage/binding only; not semantic execution, PlusCal parser or TLC evidence.

| Source entry/input | Translated entry/input |
|---|---|
| sourcescript/system.py:212 `initializeFastFigure()` | pseudocode/system.pcal:14 `initializeFastFigure()` |
| sourcescript/backend/project_state.py:367 `readBackendProjection(kind, request)` | pseudocode/backend/project_state.pcal:667 `readBackendProjection(kind, request)` |
| sourcescript/backend/project_state.py:402 `validateFrontendIntent(event, payload)` | pseudocode/backend/project_state.pcal:44 `validateFrontendIntent(event, payload)` |
| sourcescript/backend/project_state.py:434 `buildFrontendReconciliationInput(event, mutationResult, frontendReferences)` | pseudocode/backend/project_state.pcal:115 `buildFrontendReconciliationInput(event, mutationResult, frontendReferences)` |
| sourcescript/backend/project_state.py:470 `ProjectObject.read(path)` | pseudocode/backend/project_state.pcal:438 `ProjectObject_read(path)` |
| sourcescript/backend/project_state.py:486 `ProjectObject.initialize(source)` | pseudocode/backend/project_state.pcal:446 `ProjectObject_initialize(source)` |
| sourcescript/backend/project_state.py:504 `ProjectObjectRegistry.read(name)` | pseudocode/backend/project_state.pcal:462 `ProjectObjectRegistry_read(name)` |
| sourcescript/backend/project_state.py:519 `ProjectObjectRegistry.snapshot(names)` | pseudocode/backend/project_state.pcal:483 `ProjectObjectRegistry_snapshot(names)` |
| sourcescript/backend/project_state.py:536 `slotHasNonDefaultLocalState(slot)` | pseudocode/backend/project_state.pcal:266 `slotHasNonDefaultLocalState(slot)` |
| sourcescript/backend/project_state.py:553 `normalizeSlotContent(slot)` | pseudocode/backend/project_state.pcal:213 `normalizeSlotContent(slot)` |
| sourcescript/backend/project_state.py:578 `validateProjectObjectState(state, requireSlots)` | pseudocode/backend/project_state.pcal:314 `validateProjectObjectState(state, requireSlots)` |
| sourcescript/backend/project_state.py:644 `createProjectState()` | pseudocode/backend/project_state.pcal:393 `createProjectState()` |
| sourcescript/backend/project_state.py:671 `resolveOwningSlot(chartId, state)` | pseudocode/backend/project_state.pcal:280 `resolveOwningSlot(chartId, state)` |
| sourcescript/backend/project_state.py:690 `getProjectCsv(csvId)` | pseudocode/backend/project_state.pcal:293 `getProjectCsv(csvId)` |
| sourcescript/backend/project_state.py:703 `getProjectImage(imageId)` | pseudocode/backend/project_state.pcal:300 `getProjectImage(imageId)` |
| sourcescript/backend/project_state.py:716 `getChart(chartId)` | pseudocode/backend/project_state.pcal:307 `getChart(chartId)` |
| sourcescript/backend/project_efsm.py:182 `ProjectStateMachine.send(event, payload)` | pseudocode/backend/project_efsm.pcal:695 `ProjectStateMachine_send(event, payload)` |
| sourcescript/backend/assets_files.py:162 `normalizeProjectPath(value, directory)` | pseudocode/backend/assets_files.pcal:28 `normalizeProjectPath(value, directory)` |
| sourcescript/backend/assets_files.py:180 `projectAssetPath(asset)` | pseudocode/backend/assets_files.pcal:46 `projectAssetPath(asset)` |
| sourcescript/backend/assets_files.py:197 `slotFileKind(file)` | pseudocode/backend/assets_files.pcal:55 `slotFileKind(file)` |
| sourcescript/backend/assets_files.py:208 `projectAssetImportCollisionModel(file, directory, reservedPaths)` | pseudocode/backend/assets_files.pcal:159 `projectAssetImportCollisionModel(file, directory, reservedPaths)` |
| sourcescript/backend/assets_files.py:229 `resolveProjectAssetImportPlan(model, choice, reservedPaths)` | pseudocode/backend/assets_files.pcal:196 `resolveProjectAssetImportPlan(model, choice, reservedPaths)` |
| sourcescript/backend/assets_files.py:254 `buildProjectAssetImportCandidate(files, directory, planImport, targetSlotId)` | pseudocode/backend/assets_files.pcal:294 `buildProjectAssetImportCandidate(files, directory, planImport, targetSlotId)` |
| sourcescript/backend/assets_files.py:275 `planProjectNodeMove(path, directory)` | pseudocode/backend/assets_files.pcal:303 `planProjectNodeMove(path, directory)` |
| sourcescript/backend/assets_files.py:294 `projectFileStem(value)` | pseudocode/backend/assets_files.pcal:326 `projectFileStem(value)` |
| sourcescript/backend/assets_files.py:304 `ffpxBuildProject()` | pseudocode/backend/assets_files.pcal:683 `ffpxBuildProject()` |
| sourcescript/backend/assets_files.py:327 `ffpxReadProject(file)` | pseudocode/backend/assets_files.pcal:916 `ffpxReadProject(file)` |
| sourcescript/backend/assets_files.py:350 `ffsxBuildSlot(slot, chart)` | pseudocode/backend/assets_files.pcal:958 `ffsxBuildSlot(slot, chart)` |
| sourcescript/backend/assets_files.py:370 `ffsxReadSlot(file)` | pseudocode/backend/assets_files.pcal:1051 `ffsxReadSlot(file)` |
| sourcescript/backend/assets_files.py:390 `projectVfsResolve(path, state)` | pseudocode/backend/assets_files.pcal:68 `projectVfsResolve(path, state)` |
| sourcescript/backend/assets_files.py:407 `projectVfsUniquePath(path, state, reservedPaths)` | pseudocode/backend/assets_files.pcal:85 `projectVfsUniquePath(path, state, reservedPaths)` |
| sourcescript/backend/assets_files.py:424 `projectVfsDescendants(directory, state)` | pseudocode/backend/assets_files.pcal:98 `projectVfsDescendants(directory, state)` |
| sourcescript/backend/assets_files.py:440 `parseProjectDataAsset(name, bytes)` | pseudocode/backend/assets_files.pcal:396 `parseProjectDataAsset(name, bytes)` |
| sourcescript/backend/assets_files.py:461 `collectAssetReferences(csvIds, imageIds, state)` | pseudocode/backend/assets_files.pcal:414 `collectAssetReferences(csvIds, imageIds, state)` |
| sourcescript/backend/assets_files.py:484 `ffpxEncodeValue(value)` | pseudocode/backend/assets_files.pcal:444 `ffpxEncodeValue(value)` |
| sourcescript/backend/assets_files.py:502 `ffpxDecodeValue(element)` | pseudocode/backend/assets_files.pcal:469 `ffpxDecodeValue(element)` |
| sourcescript/backend/assets_files.py:519 `buildProjectObject(payload, fileName)` | pseudocode/backend/assets_files.pcal:1287 `buildProjectObject(payload, fileName)` |
| sourcescript/backend/assets_files.py:547 `applyFfsxSlot(slotPayload, targetSlot)` | pseudocode/backend/assets_files.pcal:1318 `applyFfsxSlot(slotPayload, targetSlot)` |
| sourcescript/backend/graphs.py:150 `dataTable(data)` | pseudocode/backend/graphs.pcal:33 `dataTable(data)` |
| sourcescript/backend/graphs.py:168 `columnDefinitions(table, headerLines)` | pseudocode/backend/graphs.pcal:63 `columnDefinitions(table, headerLines)` |
| sourcescript/backend/graphs.py:185 `graphDataSelection(matrix, headerLines, editor)` | pseudocode/backend/graphs.pcal:81 `graphDataSelection(matrix, headerLines, editor)` |
| sourcescript/backend/graphs.py:204 `connectDataToSlotModel(slot, data, sourceName, projectCsv)` | pseudocode/backend/graphs.pcal:226 `connectDataToSlotModel(slot, data, sourceName, projectCsv)` |
| sourcescript/backend/graphs.py:245 `graphEditorCommit(chartId, objects, index)` | pseudocode/backend/graphs.pcal:235 `graphEditorCommit(chartId, objects, index)` |
| sourcescript/backend/graphs.py:275 `tracesSingle(objectView)` | pseudocode/backend/graphs.pcal:319 `tracesSingle(objectView)` |
| sourcescript/backend/graphs.py:325 `traces(chart, project)` | pseudocode/backend/graphs.pcal:394 `traces(chart, project)` |
| sourcescript/backend/graphs.py:361 `rebuildEditableGraph(chart, project)` | pseudocode/backend/graphs.pcal:455 `rebuildEditableGraph(chart, project)` |
| sourcescript/backend/graphs.py:378 `chartFigure(chart, project)` | pseudocode/backend/graphs.pcal:466 `chartFigure(chart, project)` |
| sourcescript/backend/graphs.py:400 `layout(chart, project)` | pseudocode/backend/graphs.pcal:577 `layout(chart, project)` |
| sourcescript/backend/graphs.py:443 `normalizeAxisSettings(axis, key)` | pseudocode/backend/graphs.pcal:489 `normalizeAxisSettings(axis, key)` |
| sourcescript/backend/graphs.py:472 `normalizeGlobalSettings(settings)` | pseudocode/backend/graphs.pcal:521 `normalizeGlobalSettings(settings)` |
| sourcescript/backend/graphs.py:493 `validateChartModel(chart, csvCollection)` | pseudocode/backend/graphs.pcal:632 `validateChartModel(chart, csvCollection)` |
| sourcescript/backend/graphs.py:520 `parsePlotlyToEditor(figure, chartId)` | pseudocode/backend/graphs.pcal:712 `parsePlotlyToEditor(figure, chartId)` |
| sourcescript/backend/graphs.py:562 `convertImportedChartToEditable(chart)` | pseudocode/backend/graphs.pcal:769 `convertImportedChartToEditable(chart)` |
| sourcescript/backend/layout_annotations.py:113 `orderedSlotLabels(project)` | pseudocode/backend/layout_annotations.pcal:77 `orderedSlotLabels(project)` |
| sourcescript/backend/layout_annotations.py:131 `insertSlotCaptions(project, slotIds)` | pseudocode/backend/layout_annotations.pcal:126 `insertSlotCaptions(project, slotIds)` |
| sourcescript/backend/layout_annotations.py:158 `dashboardGeometry(width, heightOverride)` | pseudocode/backend/layout_annotations.pcal:204 `dashboardGeometry(width, heightOverride)` |
| sourcescript/backend/layout_annotations.py:179 `gridSlotGeometry(layout, geometry, slot)` | pseudocode/backend/layout_annotations.pcal:238 `gridSlotGeometry(layout, geometry, slot)` |
| sourcescript/backend/layout_annotations.py:199 `buildGridResizeCandidate(rows, cols)` | pseudocode/backend/layout_annotations.pcal:260 `buildGridResizeCandidate(rows, cols)` |
| sourcescript/backend/layout_annotations.py:227 `readImageEditorApi(slotId)` | pseudocode/backend/layout_annotations.pcal:326 `readImageEditorApi(slotId)` |
| sourcescript/backend/layout_annotations.py:240 `readLabelsApiState(slotId)` | pseudocode/backend/layout_annotations.pcal:347 `BackendAnnotations_readLabelsApiState(slotId)` |
| sourcescript/backend/layout_annotations.py:260 `readGlobalCaptionState()` | pseudocode/backend/layout_annotations.pcal:376 `readGlobalCaptionState()` |
| sourcescript/backend/layout_annotations.py:277 `readSlotCaptionState(slotId)` | pseudocode/backend/layout_annotations.pcal:384 `readSlotCaptionState(slotId)` |
| sourcescript/backend/layout_annotations.py:294 `readExportSettings()` | pseudocode/backend/layout_annotations.pcal:397 `readExportSettings()` |
| sourcescript/backend/layout_annotations.py:307 `createTargetExportSnapshot()` | pseudocode/backend/layout_annotations.pcal:404 `createTargetExportSnapshot()` |
| sourcescript/application/adapter.py:40 `dispatchProjectQuery(query, payload)` | pseudocode/application/adapter.pcal:18 `dispatchProjectQuery(query, payload)` |
| sourcescript/application/adapter.py:49 `dispatchInterfaceEvent(event, payload)` | pseudocode/application/adapter.pcal:26 `dispatchInterfaceEvent(event, payload)` |
| sourcescript/application/adapter.py:68 `dispatchSlotSelection(slotId, pendingContentType, direction)` | pseudocode/application/adapter.pcal:47 `dispatchSlotSelection(slotId, pendingContentType, direction)` |
| sourcescript/application/adapter.py:92 `dispatchProjectCommand(event, payload)` | pseudocode/application/adapter.pcal:88 `dispatchProjectCommand(event, payload)` |
| sourcescript/application/adapter.py:119 `runLifecycleTask(lifecycle, event, task)` | pseudocode/application/adapter.pcal:126 `ApplicationAdapter_runLifecycleTask(lifecycle, event, task)` |
| sourcescript/application/public_api/assets.py:14 `readAssetFileKind(file)` | pseudocode/application/public_api/assets.pcal:11 `readAssetFileKind(file)` |
| sourcescript/application/public_api/assets.py:19 `readAssetCollisionModel(file, directory, reservedPaths)` | pseudocode/application/public_api/assets.pcal:18 `readAssetCollisionModel(file, directory, reservedPaths)` |
| sourcescript/application/public_api/assets.py:26 `readAssetImportPlan(model, choice, reservedPaths)` | pseudocode/application/public_api/assets.pcal:25 `readAssetImportPlan(model, choice, reservedPaths)` |
| sourcescript/application/public_api/assets.py:33 `selectProjectCsv(path)` | pseudocode/application/public_api/assets.pcal:32 `selectProjectCsv(path)` |
| sourcescript/application/public_api/assets.py:49 `createEmptyProjectCsvAndSelect()` | pseudocode/application/public_api/assets.pcal:47 `createEmptyProjectCsvAndSelect()` |
| sourcescript/application/public_api/assets.py:62 `importProjectFilesToDirectory(files, directory, planImport)` | pseudocode/application/public_api/assets.pcal:93 `importProjectFilesToDirectory(files, directory, planImport)` |
| sourcescript/application/public_api/assets.py:86 `createProjectCsv(data, name, id, bytesBase64, mime, headerLines, path)` | pseudocode/application/public_api/assets.pcal:109 `createProjectCsv(data, name, id, bytesBase64, mime, headerLines, path)` |
| sourcescript/application/public_api/assets.py:108 `createEmptyProjectCsv()` | pseudocode/application/public_api/assets.pcal:120 `createEmptyProjectCsv()` |
| sourcescript/application/public_api/assets.py:137 `createProjectImage(bytes, name, mime, id, path)` | pseudocode/application/public_api/assets.pcal:132 `createProjectImage(bytes, name, mime, id, path)` |
| sourcescript/application/public_api/assets.py:168 `deleteProjectAsset(target)` | pseudocode/application/public_api/assets.pcal:142 `deleteProjectAsset(target)` |
| sourcescript/application/public_api/assets.py:193 `moveProjectNode(plan, useUniqueName)` | pseudocode/application/public_api/assets.pcal:156 `moveProjectNode(plan, useUniqueName)` |
| sourcescript/application/public_api/assets.py:223 `emptyProjectTrash()` | pseudocode/application/public_api/assets.pcal:170 `emptyProjectTrash()` |
| sourcescript/application/public_api/assets.py:241 `createProjectDirectory(parent, name)` | pseudocode/application/public_api/assets.pcal:178 `createProjectDirectory(parent, name)` |
| sourcescript/application/public_api/assets.py:262 `connectProjectAssetToSlot(path, kind, slotId)` | pseudocode/application/public_api/assets.pcal:191 `connectProjectAssetToSlot(path, kind, slotId)` |
| sourcescript/application/public_api/assets.py:292 `importProjectFileToSlot(file, slotId, planImport)` | pseudocode/application/public_api/assets.pcal:205 `importProjectFileToSlot(file, slotId, planImport)` |
| sourcescript/application/public_api/assets.py:313 `importProjectFile(file)` | pseudocode/application/public_api/assets.pcal:225 `importProjectFile(file)` |
| sourcescript/application/public_api/assets.py:335 `importProjectAssetFiles(files, planImport)` | pseudocode/application/public_api/assets.pcal:236 `importProjectAssetFiles(files, planImport)` |
| sourcescript/application/public_api/assets.py:357 `downloadProjectAsset(path)` | pseudocode/application/public_api/assets.pcal:269 `downloadProjectAsset(path)` |
| sourcescript/application/public_api/assets.py:369 `downloadProject()` | pseudocode/application/public_api/assets.pcal:281 `downloadProject()` |
| sourcescript/application/public_api/graphs.py:11 `graphEditorAdd(slotId, csvId)` | pseudocode/application/public_api/graphs.pcal:10 `graphEditorAdd(slotId, csvId)` |
| sourcescript/application/public_api/graphs.py:35 `graphEditorObjectValues(chartId, index, values)` | pseudocode/application/public_api/graphs.pcal:23 `graphEditorObjectValues(chartId, index, values)` |
| sourcescript/application/public_api/graphs.py:59 `graphEditorMove(chartId, fromIndex, toIndex)` | pseudocode/application/public_api/graphs.pcal:33 `graphEditorMove(chartId, fromIndex, toIndex)` |
| sourcescript/application/public_api/graphs.py:76 `graphEditorDelete(chartId, index)` | pseudocode/application/public_api/graphs.pcal:47 `graphEditorDelete(chartId, index)` |
| sourcescript/application/public_api/graphs.py:89 `graphEditorSetEditable(slotId, chartId, editable)` | pseudocode/application/public_api/graphs.pcal:58 `graphEditorSetEditable(slotId, chartId, editable)` |
| sourcescript/application/public_api/graphs.py:115 `graphEditorSetHeaderLines(csvId, headerLines)` | pseudocode/application/public_api/graphs.pcal:68 `graphEditorSetHeaderLines(csvId, headerLines)` |
| sourcescript/application/public_api/graphs.py:132 `graphEditorUpdateLayout(slotId, chartId, values)` | pseudocode/application/public_api/graphs.pcal:79 `graphEditorUpdateLayout(slotId, chartId, values)` |
| sourcescript/application/public_api/graphs.py:149 `graphEditorApplyPalette(chartId, colors)` | pseudocode/application/public_api/graphs.pcal:89 `graphEditorApplyPalette(chartId, colors)` |
| sourcescript/application/public_api/graphs.py:165 `importSelectedGraphFile(slotId, file)` | pseudocode/application/public_api/graphs.pcal:99 `importSelectedGraphFile(slotId, file)` |
| sourcescript/application/public_api/graphs.py:182 `exportSelectedGraph(slotId, operation)` | pseudocode/application/public_api/graphs.pcal:109 `exportSelectedGraph(slotId, operation)` |
| sourcescript/application/public_api/layout_annotations.py:36 `setProjectName(value, trim)` | pseudocode/application/public_api/layout_annotations.pcal:10 `setProjectName(value, trim)` |
| sourcescript/application/public_api/layout_annotations.py:46 `setSlotContentType(slotId, contentType)` | pseudocode/application/public_api/layout_annotations.pcal:20 `setSlotContentType(slotId, contentType)` |
| sourcescript/application/public_api/layout_annotations.py:54 `resetSlotApi(slotId)` | pseudocode/application/public_api/layout_annotations.pcal:28 `resetSlotApi(slotId)` |
| sourcescript/application/public_api/layout_annotations.py:60 `swapSlots(sourceSlotId, targetSlotId)` | pseudocode/application/public_api/layout_annotations.pcal:36 `swapSlots(sourceSlotId, targetSlotId)` |
| sourcescript/application/public_api/layout_annotations.py:68 `insertEmptyImageIntoSelectedSlot()` | pseudocode/application/public_api/layout_annotations.pcal:44 `insertEmptyImageIntoSelectedSlot()` |
| sourcescript/application/public_api/layout_annotations.py:91 `prepareDashboardFileDrop(slotId)` | pseudocode/application/public_api/layout_annotations.pcal:61 `ApplicationApi_prepareDashboardFileDrop(slotId)` |
| sourcescript/application/public_api/layout_annotations.py:103 `finishDashboardFileDrop()` | pseudocode/application/public_api/layout_annotations.pcal:75 `finishDashboardFileDrop()` |
| sourcescript/application/public_api/layout_annotations.py:109 `readLayoutApiState(previewWidth)` | pseudocode/application/public_api/layout_annotations.pcal:83 `readLayoutApiState(previewWidth)` |
| sourcescript/application/public_api/layout_annotations.py:121 `setLayoutApiZoom(value)` | pseudocode/application/public_api/layout_annotations.pcal:94 `setLayoutApiZoom(value)` |
| sourcescript/application/public_api/layout_annotations.py:127 `commitLayoutApiZoom()` | pseudocode/application/public_api/layout_annotations.pcal:102 `commitLayoutApiZoom()` |
| sourcescript/application/public_api/layout_annotations.py:133 `setLayoutApiZoomLocked(locked)` | pseudocode/application/public_api/layout_annotations.pcal:110 `setLayoutApiZoomLocked(locked)` |
| sourcescript/application/public_api/layout_annotations.py:144 `resetLayoutApiZoom()` | pseudocode/application/public_api/layout_annotations.pcal:124 `resetLayoutApiZoom()` |
| sourcescript/application/public_api/layout_annotations.py:150 `setLayoutApiStyle(values)` | pseudocode/application/public_api/layout_annotations.pcal:132 `setLayoutApiStyle(values)` |
| sourcescript/application/public_api/layout_annotations.py:168 `setLayoutApiGrid(rows, cols)` | pseudocode/application/public_api/layout_annotations.pcal:142 `setLayoutApiGrid(rows, cols)` |
| sourcescript/application/public_api/layout_annotations.py:185 `mergeSlots(slotIds)` | pseudocode/application/public_api/layout_annotations.pcal:152 `mergeSlots(slotIds)` |
| sourcescript/application/public_api/layout_annotations.py:208 `splitSlots(slotIds)` | pseudocode/application/public_api/layout_annotations.pcal:162 `splitSlots(slotIds)` |
| sourcescript/application/public_api/layout_annotations.py:226 `applyImageSettingsFromValues(slotId, values)` | pseudocode/application/public_api/layout_annotations.pcal:172 `applyImageSettingsFromValues(slotId, values)` |
| sourcescript/application/public_api/layout_annotations.py:256 `readLabelsApiState()` | pseudocode/application/public_api/layout_annotations.pcal:184 `ApplicationApi_readLabelsApiState()` |
| sourcescript/application/public_api/layout_annotations.py:268 `setLabelsApiEnabled(enabled)` | pseudocode/application/public_api/layout_annotations.pcal:193 `setLabelsApiEnabled(enabled)` |
| sourcescript/application/public_api/layout_annotations.py:283 `setLabelsApiSettings(values)` | pseudocode/application/public_api/layout_annotations.pcal:203 `setLabelsApiSettings(values)` |
| sourcescript/application/public_api/layout_annotations.py:298 `setLabelsApiPosition(x, y)` | pseudocode/application/public_api/layout_annotations.pcal:213 `setLabelsApiPosition(x, y)` |
| sourcescript/application/public_api/layout_annotations.py:315 `resetLabelsApiPosition()` | pseudocode/application/public_api/layout_annotations.pcal:223 `resetLabelsApiPosition()` |
| sourcescript/application/public_api/layout_annotations.py:323 `finishLabelsApiPositionInteraction()` | pseudocode/application/public_api/layout_annotations.pcal:233 `finishLabelsApiPositionInteraction()` |
| sourcescript/application/public_api/layout_annotations.py:338 `setGlobalCaptionText(text)` | pseudocode/application/public_api/layout_annotations.pcal:241 `setGlobalCaptionText(text)` |
| sourcescript/application/public_api/layout_annotations.py:357 `setSlotCaptionText(slotId, text)` | pseudocode/application/public_api/layout_annotations.pcal:251 `setSlotCaptionText(slotId, text)` |
| sourcescript/application/public_api/layout_annotations.py:375 `insertSlotCaptionsIntoGlobalCaption(slotIds)` | pseudocode/application/public_api/layout_annotations.pcal:261 `insertSlotCaptionsIntoGlobalCaption(slotIds)` |
| sourcescript/application/public_api/layout_annotations.py:393 `setCaptionsApiEnabled(enabled)` | pseudocode/application/public_api/layout_annotations.pcal:271 `setCaptionsApiEnabled(enabled)` |
| sourcescript/application/public_api/layout_annotations.py:407 `setCaptionsApiName(name)` | pseudocode/application/public_api/layout_annotations.pcal:281 `setCaptionsApiName(name)` |
| sourcescript/application/public_api/layout_annotations.py:421 `setCaptionsApiNameBold(nameBold)` | pseudocode/application/public_api/layout_annotations.pcal:291 `setCaptionsApiNameBold(nameBold)` |
| sourcescript/application/public_api/layout_annotations.py:435 `setCaptionsApiSettings(values)` | pseudocode/application/public_api/layout_annotations.pcal:301 `setCaptionsApiSettings(values)` |
| sourcescript/application/public_api/layout_annotations.py:450 `setAppearanceApiPalette(values)` | pseudocode/application/public_api/layout_annotations.pcal:311 `setAppearanceApiPalette(values)` |
| sourcescript/application/public_api/layout_annotations.py:462 `resetAppearanceApiPalette()` | pseudocode/application/public_api/layout_annotations.pcal:321 `resetAppearanceApiPalette()` |
| sourcescript/application/public_api/layout_annotations.py:467 `setExportSettings(values)` | pseudocode/application/public_api/layout_annotations.pcal:328 `setExportSettings(values)` |
| sourcescript/application/public_api/layout_annotations.py:490 `exportDashboardTarget(statusSink)` | pseudocode/application/public_api/layout_annotations.pcal:338 `exportDashboardTarget(statusSink)` |
| sourcescript/application/public_api/layout_annotations.py:496 `captureDashboardCurrent(statusSink)` | pseudocode/application/public_api/layout_annotations.pcal:347 `captureDashboardCurrent(statusSink)` |
| sourcescript/frontend/interface_fsm.py:106 `InterfaceStateMachine.readState()` | pseudocode/frontend/interface_fsm.pcal:26 `InterfaceStateMachine_readState()` |
| sourcescript/frontend/interface_fsm.py:121 `InterfaceStateMachine.send(event, validatedInput)` | pseudocode/frontend/interface_fsm.pcal:42 `InterfaceStateMachine_send(event, validatedInput)` |
| sourcescript/frontend/interface_fsm.py:132 `InterfaceStateMachine.reconcileProjectResult(event, reconciliationInput)` | pseudocode/frontend/interface_fsm.pcal:183 `InterfaceStateMachine_reconcileProjectResult(event, reconciliationInput)` |
| sourcescript/frontend/interface_fsm.py:143 `InterfaceStateMachine.notify(objectName, event, payload)` | pseudocode/frontend/interface_fsm.pcal:200 `InterfaceStateMachine_notify(objectName, event, payload)` |
| sourcescript/frontend/mantine_ui.py:130 `subscribeAppState(onStoreChange)` | pseudocode/frontend/mantine_ui.pcal:35 `subscribeAppState(onStoreChange)` |
| sourcescript/frontend/mantine_ui.py:147 `useProjectAssetImportCollision()` | pseudocode/frontend/mantine_ui.pcal:43 `useProjectAssetImportCollision()` |
| sourcescript/frontend/mantine_ui.py:170 `runLifecycleTask(lifecycle, eventName, task)` | pseudocode/frontend/mantine_ui.pcal:74 `MantineUi_runLifecycleTask(lifecycle, eventName, task)` |
| sourcescript/frontend/mantine_ui.py:187 `FastFigureApp()` | pseudocode/frontend/mantine_ui.pcal:90 `FastFigureApp()` |
| sourcescript/frontend/mantine_ui.py:216 `FastFigureShell()` | pseudocode/frontend/mantine_ui.pcal:124 `FastFigureShell()` |
| sourcescript/frontend/renderer.py:51 `publishUiTelemetry(patch)` | pseudocode/frontend/renderer.pcal:16 `publishUiTelemetry(patch)` |
| sourcescript/frontend/renderer.py:68 `setDebugEnabled(enabled)` | pseudocode/frontend/renderer.pcal:25 `setDebugEnabled(enabled)` |
| sourcescript/frontend/renderer.py:80 `status(message)` | pseudocode/frontend/renderer.pcal:34 `status(message)` |
| sourcescript/frontend/renderer.py:108 `applyDashboardProjectionInvalidation(event, mutationResult, interfaceState, projectProjection)` | pseudocode/frontend/renderer.pcal:43 `applyDashboardProjectionInvalidation(event, mutationResult, interfaceState, projectProjection)` |
| sourcescript/frontend/renderer.py:117 `renderDashboard(projectProjection, interfaceState)` | pseudocode/frontend/renderer.pcal:59 `renderDashboard(projectProjection, interfaceState)` |
| sourcescript/frontend/renderer.py:156 `setSelectedSlot(slotId, direction, frontendActions)` | pseudocode/frontend/renderer.pcal:143 `setSelectedSlot(slotId, direction, frontendActions)` |
| sourcescript/frontend/renderer.py:176 `installSlotClickController(frontendActions)` | pseudocode/frontend/renderer.pcal:154 `installSlotClickController(frontendActions)` |
| sourcescript/frontend/renderer.py:217 `swapSlotContents(source, target, frontendActions)` | pseudocode/frontend/renderer.pcal:217 `swapSlotContents(source, target, frontendActions)` |
| sourcescript/frontend/renderer.py:234 `finishDashboardFileDropInteraction()` | pseudocode/frontend/renderer.pcal:229 `finishDashboardFileDropInteraction()` |
| sourcescript/frontend/renderer.py:245 `prepareDashboardFileDrop(slotId, frontendActions)` | pseudocode/frontend/renderer.pcal:239 `Renderer_prepareDashboardFileDrop(slotId, frontendActions)` |
| sourcescript/frontend/renderer.py:270 `applyUiPalette(projectProjection, notify)` | pseudocode/frontend/renderer.pcal:246 `applyUiPalette(projectProjection, notify)` |
| sourcescript/frontend/renderer.py:282 `applySlotStyle(projectProjection, notify)` | pseudocode/frontend/renderer.pcal:258 `applySlotStyle(projectProjection, notify)` |
| sourcescript/frontend/renderer.py:295 `resolveSelectedChart(projectProjection, interfaceState)` | pseudocode/frontend/renderer.pcal:267 `resolveSelectedChart(projectProjection, interfaceState)` |
| sourcescript/frontend/renderer.py:312 `updateGraphView(projectProjection, interfaceState)` | pseudocode/frontend/renderer.pcal:274 `updateGraphView(projectProjection, interfaceState)` |
| sourcescript/frontend/renderer.py:324 `startupCoreRuntime(projectProjection, interfaceState, frontendActions)` | pseudocode/frontend/renderer.pcal:281 `startupCoreRuntime(projectProjection, interfaceState, frontendActions)` |
| sourcescript/frontend/renderer.py:343 `readDashboardRenderedWidth()` | pseudocode/frontend/renderer.pcal:296 `readDashboardRenderedWidth()` |
| sourcescript/frontend/renderer.py:350 `downloadExportPayload(payload)` | pseudocode/frontend/renderer.pcal:304 `downloadExportPayload(payload)` |
| sourcescript/frontend/renderer.py:364 `exportCaptionLayout(snapshot, measureText)` | pseudocode/frontend/renderer.pcal:324 `exportCaptionLayout(snapshot, measureText)` |
| sourcescript/frontend/renderer.py:389 `renderDashboardTarget(snapshot, statusSink)` | pseudocode/frontend/renderer.pcal:377 `renderDashboardTarget(snapshot, statusSink)` |
| sourcescript/frontend/renderer.py:431 `renderDashboardCurrent(snapshot, statusSink)` | pseudocode/frontend/renderer.pcal:434 `renderDashboardCurrent(snapshot, statusSink)` |
| sourcescript/portable_build/portable_build.py:54 `build(output)` | pseudocode/portable_build/portable_build.pcal:23 `build(output)` |

163 entries; 87 APIs; 60 explicit wrapper bindings; 15 active owner files.
