"""
Fast Figure Source Script — FFPX ProjectObject EFSM

EFSM 대상은 저장 파일이 아니라 저장·복원되는 authoritative ProjectObject 자체다.
"""

from sourcescript.backend.project_state import activeProject, projectObjects
from sourcescript.backend import assets_files, graphs, layout_annotations

PROJECT_EFSM_BOUNDARY_RULE = (
    "Project EFSM은 Backend 내부 persistent mutation controller다. "
    "Frontend component/FSM/renderer는 projectEFSM.send를 직접 호출하지 않는다. "
    "persistent mutation intent는 public mutation API와 Application adapter를 통해 command로 전달된다. "
    "Project EFSM은 Frontend state, DOM, Mantine/React state를 import하거나 변경하지 않는다."
)

PROJECT_COMMANDS = {
    "PROJECT_LOADED": "검증된 ProjectObject 전체 교체",
    "PROJECT_NAME_CHANGED": "project metadata 이름 변경",
    "PROJECT_DIRECTORY_CREATED": "VFS directory 추가",
    "PROJECT_NODE_MOVED": "VFS path 변경과 entering-trash reference detach",
    "PROJECT_TRASH_EMPTIED": "trash subtree와 남은 reference 제거",
    "ASSETS_IMPORTED": "raw CSV/image file batch와 선택적 target slot 연결을 하나의 whole-project candidate로 import",
    "DATA_OBJECT_CREATED": "CSV asset 추가",
    "DATA_OBJECT_REPLACED": "CSV asset 내용 교체",
    "DATA_OBJECT_DELETED": "CSV asset과 그 asset을 참조하는 graph-object reference를 같은 candidate에서 원자적으로 제거",
    "IMAGE_OBJECT_CREATED": "image asset 추가",
    "IMAGE_OBJECT_REPLACED": "image asset 내용 교체",
    "IMAGE_OBJECT_DELETED": "image asset과 그 asset을 참조하는 slot image reference를 같은 candidate에서 원자적으로 제거",
    "SLOT_TYPE_CHANGED": "slot-local contentType 변경",
    "SLOTS_RESET": "slot-local payload reset과 owned chart 제거",
    "SLOTS_SWAPPED": "두 GUI 위치의 slot-local payload 교환",
    "SLOT_IMAGE_LINKED": "existing image reference를 slot에 연결",
    "SLOT_IMAGE_SETTINGS_CHANGED": "slot-local imageSettings candidate commit",
    "SLOT_DATA_CONNECTED": "CSV를 graph slot/chart object에 연결",
    "SLOT_IMAGE_IMPORTED": "imported image와 slot reference commit",
    "SLOT_CHART_IMPORTED": "FFSX/Plotly chart, 필요한 package CSV와 owning slot을 같은 candidate로 commit",
    "GRAPH_OBJECTS_REPLACED": "chart.editor.objects 교체",
    "CHART_LAYOUT_CHANGED": "chart persistent layout 설정 교체",
    "CHART_MODEL_REPLACED": "chart model 교체; imported chart editable 전환이면 필요한 project CSV 생성과 reference remap도 같은 candidate에 포함",
    "GRID_LAYOUT_CHANGED": "grid 크기와 slot arrangement 변경",
    "LAYOUT_STYLE_CHANGED": "persistent slotStyle candidate commit",
    "SLOTS_MERGED": "선택 직사각형의 slot-local payload를 top-left anchor로 원자적 병합",
    "SLOTS_SPLIT": "merged anchor를 visible 1x1 slots로 복원",
    "CAPTION_TEXT_INPUT": "explicit global/slot caption owner text 변경",
    "SLOT_CAPTIONS_INSERTED": "layout_annotations.insertSlotCaptions의 current-order label grouping/append 계산을 한 candidate로 commit",
    "CAPTION_SETTINGS_CHANGED": "global caption enabled/name/nameBold/presentation settings commit",
    "LABEL_SETTINGS_CHANGED": "persistent label 설정 변경",
    "LABEL_POSITION_CHANGED": "persistent label 위치 변경",
    "APPEARANCE_CHANGED": "persistent UI palette 변경",
    "EXPORT_SETTINGS_CHANGED": "persistent export 설정 변경",
}

PUBLIC_PROJECT_MUTATION_ROUTES = {
    "project.setName": "PROJECT_NAME_CHANGED",
    "project.importFile": "PROJECT_LOADED",
    "slots.setContentType": "SLOT_TYPE_CHANGED",
    "slots.select.pendingContentType": "SLOT_TYPE_CHANGED",
    "slots.reset": "SLOTS_RESET",
    "slots.swap": "SLOTS_SWAPPED",
    "images.setSettings": "SLOT_IMAGE_SETTINGS_CHANGED",
    "images.insertEmpty": "SLOT_IMAGE_IMPORTED",
    "assets.delete.csv": "DATA_OBJECT_DELETED",
    "assets.delete.image": "IMAGE_OBJECT_DELETED",
    "assets.move": "PROJECT_NODE_MOVED",
    "assets.createDirectory": "PROJECT_DIRECTORY_CREATED",
    "assets.createEmptyCsv": "DATA_OBJECT_CREATED",
    "assets.emptyTrash": "PROJECT_TRASH_EMPTIED",
    "assets.connectToSlot.csv": "SLOT_DATA_CONNECTED",
    "assets.connectToSlot.image": "SLOT_IMAGE_LINKED",
    "assets.importToDirectory": "ASSETS_IMPORTED",
    "assets.importToSlot": "ASSETS_IMPORTED",
    "graphs.setHeaderLines": "DATA_OBJECT_REPLACED",
    "graphs.setEditable": "CHART_MODEL_REPLACED",
    "graphs.addObject.emptySlot": "SLOT_DATA_CONNECTED",
    "graphs.addObject.existingChart": "GRAPH_OBJECTS_REPLACED",
    "graphs.moveObject": "GRAPH_OBJECTS_REPLACED",
    "graphs.setObjectValues": "GRAPH_OBJECTS_REPLACED",
    "graphs.deleteObject": "GRAPH_OBJECTS_REPLACED",
    "graphs.updateLayout": "CHART_LAYOUT_CHANGED",
    "graphs.applyPalette": "GRAPH_OBJECTS_REPLACED",
    "graphs.importFile": "SLOT_CHART_IMPORTED",
    "print.setSettings": "EXPORT_SETTINGS_CHANGED",
    "captions.setEnabled": "CAPTION_SETTINGS_CHANGED",
    "captions.setGlobalText": "CAPTION_TEXT_INPUT",
    "captions.setSlotText": "CAPTION_TEXT_INPUT",
    "captions.insertSlotCaptions": "SLOT_CAPTIONS_INSERTED",
    "captions.setName": "CAPTION_SETTINGS_CHANGED",
    "captions.setNameBold": "CAPTION_SETTINGS_CHANGED",
    "captions.setSettings": "CAPTION_SETTINGS_CHANGED",
    "labels.setEnabled": "LABEL_SETTINGS_CHANGED",
    "labels.setSettings": "LABEL_SETTINGS_CHANGED",
    "labels.setPosition": "LABEL_POSITION_CHANGED",
    "labels.resetPosition": "LABEL_POSITION_CHANGED",
    "appearance.setPalette": "APPEARANCE_CHANGED",
    "appearance.resetPalette": "APPEARANCE_CHANGED",
    "layout.setStyle": "LAYOUT_STYLE_CHANGED",
    "layout.setGrid": "GRID_LAYOUT_CHANGED",
    "layout.mergeSlots": "SLOTS_MERGED",
    "layout.splitSlots": "SLOTS_SPLIT",
}

PROJECT_MUTATION_GROUPS = {
    "project": "whole ProjectObject replacement와 metadata",
    "assets": "CSV/image/VFS와 reference",
    "slot-local": "slot content/chart/image/imageSettings/caption",
    "graphs": "chart model과 graph object/CSV reference",
    "layout": "grid와 slot geometry/payload ownership",
    "annotations": "persistent label/global caption/slot caption",
    "appearance-export": "persistent palette/export settings",
}

PROJECT_MUTATION_CONTRACT = [
    "Application boundary에서 전달된 declared command만 persistent mutation entry로 받으며 Frontend/renderer direct call을 공식 route로 두지 않는다.",
    "command input의 id/path/reference를 current activeProject에서 다시 resolve한다.",
    "command writable scope와 precondition을 확인한다.",
    "activeProject를 직접 부분 변경하기 전에 candidate ProjectObject 또는 candidate patch를 만든다.",
    "local rule, VFS/reference integrity, chart ownership, whole-project invariant를 검증한다.",
    "검증 성공 뒤 activeProject authority를 정확히 한 번 commit한다.",
    "실패하면 activeProject는 command 시작 전 authoritative state를 유지한다.",
    "commit pre/post에서 실제 mutation 사실을 ProjectMutationResult로 산출한다.",
    "selectedSlotId, asset/graph selection, workspace, overlay 등 interface state는 직접 변경하지 않는다.",
    "DOM/Plotly/Mantine projection을 수행하지 않는다.",
]

GRAPH_OBJECT_EDIT_INPUT_CONTRACT = {
    "input": (
        "GRAPH_OBJECTS_REPLACED receives chartId (add also accepts slotId/csvId), the existing public operation name, "
        "and only that operation's new values/index/from/to/colors. Current objects/candidate arrays are not Application inputs. "
        "Backend resolves current owning editable chart, CSV and index, calculates objects using sourcescript.backend.graphs, "
        "and uses graphEditorCommit as a Backend-only candidate helper. SLOT_DATA_CONNECTED add rejects a now-occupied target; "
        "GRAPH_OBJECTS_REPLACED add rejects a now-missing/non-editable chart rather than trusting the earlier routing read."
    ),
    "add": "append the base object from the resolved CSV; result hint is the appended post-edit index.",
    "move": (
        "resolve the requested existing from/to indices, not just adjacent moves; invalid/out-of-bounds rejects without commit. "
        "Move that object and result hint selects to, not the previous numeric index; from=to preserves the no-op meaning."
    ),
    "one-object": "resolve index and values using graphs.graphEditorCommit one-object rules; result hint selects that same post-edit index.",
    "delete": (
        "remove the resolved requested index; result hint is explicit none, retaining the existing selection-clear meaning. "
        "Do not invent selection of a neighboring object. Empty chart remains valid."
    ),
    "palette": "use graphs.GRAPH_PALETTE_RULE on current editable objects, cycling the non-empty input; omit index hint so existing selection remains.",
    "selection": (
        "Backend writes selectionHints.chartId and selectedIndexHint from the actual post-edit array. "
        "Missing hint preserves the current index; explicit none clears. Application forwards it through the common "
        "buildFrontendReconciliationInput path only, and never substitutes object.csvId for current CSV selection."
    ),
}

ProjectMutationResult = {
    "event": "처리한 project command",
    "committed": "commit 성공 여부",
    "changed": "command별 실제 changed ids/path/owner; create/import는 input 순서의 실제 생성 asset path/id와 owning chart/slot id, DATA_OBJECT_REPLACED는 실제 updated CSV path, PROJECT_DIRECTORY_CREATED는 실제 생성 directory path, PROJECT_NODE_MOVED는 실제 final destination path를 포함한다. 기존 공식 query의 post-commit read에 사용하며 stale input/plan path를 성공 결과로 재사용하지 않는다",
    "removedGraphReferenceCount": "실제 제거한 graph-object CSV reference 수",
    "resetImageSlotCount": "실제 image reference를 비운 slot 수",
    "selectionHints": (
        "후속 reconciliation의 identity/path 결과와 chartId에 한정된 optional selectedIndexHint; absence와 explicit none을 구별. "
        "CSV cascade는 graphObjectIndexMaps=[{chartId, indices}]를 사용한다. chartId는 중복 없는 실제 affected chart의 id, "
        "indices는 제거 전 object 개수 길이의 배열이며 각 old index entry는 retained object의 post index 또는 제거된 경우 none이다. "
        "identity/path나 objects snapshot을 대체하지 않는 한 command의 immutable delta다"
    ),
    "projectionEffect": "renderer effect를 결정할 수 있는 실제 commit 결과",
}

PROJECT_COMMAND_COVERAGE_RULE = (
    "PUBLIC_API_METHODS에서 persistent ProjectObject mutation으로 분류한 operation은 PUBLIC_PROJECT_MUTATION_ROUTES에 존재하고 "
    "그 route가 PROJECT_COMMANDS의 declared command로 수렴해야 한다. "
    "kind 또는 precondition에 따라 command가 달라지는 operation은 matrix에 explicit branch route를 둔다. "
    "domain helper가 candidate를 계산할 수는 있지만 activeProject commit을 독립 mutation path로 수행하지 않는다. "
    "같은 owner를 변경하는 UI/API 진입점은 동일 project command semantics를 공유한다."
)

PROJECT_RESULT_RULE = (
    "ProjectMutationResult는 장기 authority가 아니라 한 command의 immutable result다. "
    "Backend는 result를 Application boundary에 반환하고, Application adapter가 Backend reconciliation query를 거쳐 "
    "Frontend reconciliation input과 renderer effect로 변환한다. Project EFSM이 Frontend FSM 또는 renderer를 직접 호출하지 않는다."
)

class ProjectStateMachine:
    def send(self, event, payload):
        """
        1. PROJECT_COMMANDS membership과 precondition을 검증한다.
        2. current activeProject에서 모든 input/reference를 다시 resolve한다.
        3. 해당 domain module의 candidate builder를 실행한다. Application-provided project/model/objects candidate는 받지 않는다.
           asset import는 buildProjectAssetImportCandidate, project load는 ffpxReadProject/buildProjectObject,
           slot package import는 ffsxReadSlot/applyFfsxSlot, editable 전환은 convertImportedChartToEditable를 내부에서 호출한다.
           file bytes 읽기/parsing 동안 authority를 변경하지 않는다. collision prompt와 choice 수집은 Application이 dispatch 전에 완료한다.
           Backend는 UI resolver/callback을 호출하지 않는다. file 대기가 끝난 뒤에는 전달된 choice와
           current directory/target/reference/collision/next-id를 다시 resolve하고 candidate를 완성한다.
           선택된 replace id/path가 더 이상 같은 대상을 가리키지 않으면 거부한다. stale 계획으로 덮어쓰거나 자동 재선택하지 않는다.
           candidate의 원천이 된 authority가 commit 전 바뀌면 그대로 commit하지 않고 현재 authority에 대해 재계산/검증한다.
           실패/취소는 미commit 결과이며 부분 변경/복구용 rollback/성공 hint를 만들지 않는다.
           PROJECT_NAME_CHANGED는 value를 문자열로 변환하고 trim=True이면 양끝 공백 제거 뒤 backend.defaults.naming.projectNameMaxLength로 제한해 meta.projectName candidate를 만든다.
           SLOT_TYPE_CHANGED는 explicit visible slotId를 resolve하며 type은 image일 때 image, 그 외 graph로 정규화한다.
           missing/hidden slot은 거부하며 선택되지 않았다고 pending type을 별도 저장하지 않는다.
           SLOTS_RESET은 explicit visible slotIds의 SLOT_LOCAL_DEFAULTS 복원과 owned chart 제거를 같은 candidate로 수행한다.
           SLOTS_SWAPPED는 서로 다른 visible 두 slot만 허용한다. missing/hidden/same-id는 미commit이며
           slot-local payload 전체를 교환하고 위치/geometry identity는 유지한다. result hint로 공통 selection reconciliation을 수행한다.
           SLOT_IMAGE_IMPORTED의 images.insertEmpty는 new SVG bytes/name/MIME만 받아 current next-id/VFS로 model을 만들고
           current target이 visible image slot인지 재검증한다. asset 생성과 slot reference를 한 번에 commit한다.
           ASSET delete의 없는 target은 미commit이며 kind/id/path가 다른 asset으로 바뀌었으면 자동 재선택하지 않는다.
           PROJECT_NODE_MOVED/PROJECT_DIRECTORY_CREATED는 actual final canonical path를 changed에 기록한다.
           APPEARANCE_CHANGED는 project_state.APPEARANCE_PALETTE_RULE에 따라 10개 field의 전체 palette candidate를 만든다.
           CHART_LAYOUT_CHANGED는 current owning chart의 title/global/axis field에 새 edit만 적용하고 graphs의 normalize/layout을 사용한다.
           새 값에 없는 current title/axis field는 유지하며 invalid 새 값은 graph default/empty 규칙으로 정규화한다.
           nested axis patch는 해당 axis의 명시된 field에만 적용하고 다른 axis/global field를 버리지 않는다.
           project.appearance와 chart.editor가 각 의미의 원천이며 graph.data/layout/CSS는 candidate 계산/표시 결과다.
           label/caption create/load/missing/partial edit는 layout_annotations.ANNOTATION_SETTINGS_RULE을 사용한다.
           LABEL_POSITION_CHANGED의 reset=True는 settings.json backend.project_object.annotations.labels.settings.x/y를 Backend 내부에서 읽어 적용한다.
           SLOT_CAPTIONS_INSERTED는 current candidate와 payload.slotIds로 layout_annotations.insertSlotCaptions를 계산한다.
           no target이면 committed=False/unchanged이고 success read나 selection을 실행하지 않는다.
           JSON config 값/계산 결과를 Frontend state에서 다시 만들거나 별도 authority로 저장하지 않는다.
        4. candidate whole-project invariant를 검증한다.
        5. 성공 candidate만 activeProject에 한 번 commit한다.
        6. 실제 pre/post 차이에서 ProjectMutationResult를 계산한다. 생성/import의 changed id/path/owner는 실제 commit 결과를 사용한다.
           graphEditorCommit이 계산한 index hint가 있으면 실제 owning chart id와 함께 selectionHints.chartId/selectedIndexHint에 담는다.
           graphs.addObject는 append된 index, graphs.moveObject는 제거 후 목적 위치 to, graphs.setObjectValues는 편집한 index,
           graphs.deleteObject는 explicit none을 계산한다. current chart/index/from/to를 command에서 resolve하고 유효하지 않으면 commit 전에 거부한다.
           이동은 from object를 제거해 최종 to 위치에 삽입하고 나머지 상대 순서를 유지한다. 마지막 object 삭제도 empty 배열로 유효하다.
           DATA_OBJECT_DELETED, PROJECT_NODE_MOVED의 entering-trash detach, PROJECT_TRASH_EMPTIED가 실제 graph reference를 제거하면
           같은 candidate의 filter에서 chart별 retained original index 순서를 사용해 graphObjectIndexMaps를 계산한다.
           원래 n개 object에 대해 indices를 n개의 none으로 시작하고 retained original indices [k0,k1,...]의
           indices[kj]=j로 채운다. 예: [A,B,C]에서 A 제거는 [none,0,1], B 제거는 [0,none,1]이다.
           동일 값의 중복 object/같은 CSV의 여러 reference도 original 위치로 구별한다. equality로 post 배열을 역매칭하지 않는다.
           실제 제거가 있는 retained chart만 항목을 만들고 다른 chart/단순 path 이동/image-only detach에는 mapping을 만들지 않는다.
           이 filter와 reference count는 asset-domain의 동일 actual reference set을 사용한다. conversion view는 그 집합에서 제외한다.
           삭제된 chart는 current owner resolve 실패로 clear되므로 map이 필요 없다. 여러 affected chart는 각각 별도 항목을 만든다.
           candidate 재계산 시 mapping도 새 authority에서 다시 계산한다. mapping을 persistent chart에 저장하거나 Frontend 선택을 읽지 않는다.
           direct graphs.deleteObject의 explicit-none hint는 그대로 유지하며 cascade와 다른 선택 의미를 임의로 합치지 않는다.
           hint가 없는 command는 그 key를 생략하며 none과 혼동하지 않는다. 실패 결과에는 성공 hint/map을 넣지 않는다.
        7. interface state와 renderer를 변경하지 않고 result를 반환한다.
        """
        result = "ProjectMutationResult"
        return result

projectEFSM = (
    "activeProject를 유일한 persistent authority로 사용하는 ProjectStateMachine instance. "
    "별도 persistent project-state copy를 소유하지 않는다."
)
