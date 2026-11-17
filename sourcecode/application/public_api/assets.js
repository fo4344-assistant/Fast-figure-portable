// Source: sourcescript/application/public_api/assets.py (same logical owner); pseudocode/application/public_api/assets.pcal.
import { appFSM, applyCommittedDashboardProjection, dispatchProjectCommand, runLifecycleTask, renderDashboard, updateFileAvailability } from '../adapter.js';
import { importSelectedGraphFile } from './graphs.js';
import { setSelectedSlot } from './layout_annotations.js';
import { PROJECT_ASSET_DIRECTORIES, projectParentPath, projectPathName } from '../../backend/assets_files.js';
import { immutableProjectCopy, projectObjects, readBackendProjection } from '../../backend/project_state.js';
import { interfaceFSM } from '../../frontend/interface_fsm.js';
import { downloadExportPayload, status } from '../../frontend/renderer.js';

export function readAssetFileKind(file) {
  return readBackendProjection("project-api", { operation: "assets.fileKind",
    file: { name: file?.name, type: file?.type } });
}

export function readAssetCollisionModel(file, directory, reservedPaths = null) {
  return readBackendProjection("project-api", { operation: "assets.collisionModel",
    file: { name: file?.name, type: file?.type }, directory, reservedPaths: Array.from(reservedPaths || []) });
}

export function readAssetImportPlan(model, choice = "rename", reservedPaths = null) {
  return readBackendProjection("project-api", { operation: "assets.resolveImportPlan",
    model: immutableProjectCopy(model), choice, reservedPaths: Array.from(reservedPaths || []) });
}

export async function prepareCopiedImportFiles(files) {
  const copied = [];
  for (const file of files)
    copied.push({ name: file.name, type: file.type, bytes: new Uint8Array(await file.arrayBuffer()).slice() });
  return copied;
}

export async function collectCompletedImportChoices(files, directory, choosePlan) {
  if (typeof choosePlan !== "function") throw Error("프로젝트 자산 가져오기 계획이 없습니다.");
  const reserved = new Set(), choices = [];
  for (const file of files) {
    const plan = await choosePlan(file, directory, reserved);
    if (!plan) return null;
    if (typeof plan.path !== "string" ||
        !(plan.replaceId === null || (Number.isInteger(plan.replaceId) && plan.replaceId > 0)))
      throw Error("프로젝트 자산 가져오기 계획이 올바르지 않습니다.");
    choices.push({ path: plan.path, replaceId: plan.replaceId }); reserved.add(plan.path);
  }
  return choices;
}

export function readImportedAssets(result) {
  return result.changed.assets.map(fact => readBackendProjection("project-api",
    { operation: "assets.readDeletionTarget", path: fact.path }).target);
}

export async function importProjectFilesToDirectory(files, directory, planImport) {
  const list = Array.from(files || []);
  if (!list.length) return [];
  const choices = await collectCompletedImportChoices(list, directory, planImport);
  if (!choices) return null;
  const copied = await prepareCopiedImportFiles(list),
    [result, state, projection] = dispatchProjectCommand("ASSETS_IMPORTED", { files: copied, directory, choices });
  if (!result.committed) return result;
  const imported = readImportedAssets(result);
  updateFileAvailability(); renderDashboard(projection, state); status(`${imported.length}개 자산을 프로젝트에 추가했습니다.`);
  return imported;
}

export function projectDataTreeObjects() {
  return {
    files: projectObjects.read("files"),
    data: projectObjects.read("data"),
    images: projectObjects.read("images"),
    charts: projectObjects.read("charts"),
    slots: projectObjects.read("slots"),
  };
}

export function connectProjectAssetToSlot(path, kind, slotId) {
  if (!["csv", "image"].includes(kind)) throw Error("연결할 asset kind가 올바르지 않습니다.");
  const [result] = dispatchProjectCommand(kind === "csv" ? "SLOT_DATA_CONNECTED" : "SLOT_IMAGE_LINKED", { path, kind, slotId });
  if (!result.committed) return null;
  setSelectedSlot(slotId, "model-to-fsm");
  status("프로젝트 파일을 슬롯에 연결했습니다.");
  return null;
}

export function downloadProjectAsset(path) {
  return appFSM.run("exporting", "assets.download", async () => {
    const target = path === undefined ? interfaceFSM.readState().assetPath : path,
      payload = appFSM.query("export", { operation: "assets.download", path: target });
    if (payload === null) return false;
    await downloadExportPayload(payload);
    return true;
  });
}

export function selectDirectoryFromTree(path) {
  return appFSM.send("SELECT_ASSET", { kind: "directory", path, direction: "ui-to-fsm" });
}

export function selectProjectCsv(path) {
  const resolved = appFSM.query("project-api", { operation: "assets.readDeletionTarget", path });
  if (resolved?.kind !== "csv") return null;
  const priorRevision = interfaceFSM.readState().revision, state = appFSM.send("SELECT_ASSET", {
    kind: "csv", path: resolved.path, direction: "ui-to-fsm",
  });
  if (!(state.revision > priorRevision && state.assetSelection === "csv" && state.assetPath === resolved.path)) return null;
  const current = appFSM.query("project-api", { operation: "assets.readDeletionTarget", path: resolved.path });
  return current?.kind === "csv" ? current.target : null;
}

export function selectImageFromTree(path) {
  return appFSM.send("SELECT_ASSET", { kind: "image", path, direction: "ui-to-fsm" });
}

export function readAssetDeletionTarget(path) {
  return appFSM.query("project-api", { operation: "assets.readDeletionTarget", path });
}

export function deleteProjectAsset(target) {
  if (!target || !["csv", "image"].includes(target.kind)) return null;
  const [result, state, projection] = dispatchProjectCommand(target.kind === "csv" ? "DATA_OBJECT_DELETED" : "IMAGE_OBJECT_DELETED", {
    target: { kind: target.kind, id: target.id, path: target.path },
  });
  if (!result.committed) return null;
  const removed = result.changed.assets[0], count = result.changed.removedGraphReferenceCount + result.changed.resetImageSlotCount;
  if (count) renderDashboard(projection, state);
  status(`${removed.name}을 프로젝트에서 삭제했습니다.`);
  return null;
}

export function readProjectTrash() {
  return appFSM.query("project-api", { operation: "assets.readTrash" });
}

export function projectNodeMoveOptions(path) {
  return appFSM.query("project-api", { operation: "assets.moveOptions", path });
}

export function moveProjectNode(plan, useUniqueName = false) {
  if (!plan) return null;
  const [result, state, projection] = dispatchProjectCommand("PROJECT_NODE_MOVED", {
    path: plan.path, directory: plan.directory, useUniqueName,
  });
  if (!result.committed) return null;
  const path = result.changed.movedPathTo,
    trashed = appFSM.query("project-api", { operation: "assets.isTrashed", path });
  applyCommittedDashboardProjection("PROJECT_NODE_MOVED", result, state, projection);
  status(trashed
    ? `${projectPathName(result.changed.movedPathFrom)}을 휴지통으로 이동했습니다.`
    : `${projectPathName(result.changed.movedPathFrom)}을 ${projectParentPath(path)}로 이동했습니다.`);
  return immutableProjectCopy({ path, trashed });
}

export function createProjectDirectory(parent, name) {
  const [result] = dispatchProjectCommand("PROJECT_DIRECTORY_CREATED", { parent, name });
  if (!result.committed) return null;
  const path = result.changed.createdDirectoryPath;
  appFSM.send("SELECT_ASSET", { kind: "directory", path, direction: "ui-to-fsm" });
  return path;
}

export function emptyProjectTrash() {
  const [result, state, projection] = dispatchProjectCommand("PROJECT_TRASH_EMPTIED", {});
  if (!result.committed) return null;
  applyCommittedDashboardProjection("PROJECT_TRASH_EMPTIED", result, state, projection);
  updateFileAvailability();
  status(`휴지통을 비웠습니다. 폴더 ${result.changed.directoryCount}개, CSV ${result.changed.csvCount}개, 이미지 ${result.changed.imageCount}개를 삭제했습니다.`);
  return null;
}

export function draggableProjectAsset(path) {
  return appFSM.query("project-api", { operation: "assets.draggableAsset", path });
}

export function connectProjectAssetPathToSlot(path, kind, slotId) {
  return connectProjectAssetToSlot(path, kind, slotId);
}

export async function importProjectFileToSlot(file, slotId, choosePlan) {
  const target = readBackendProjection("slot-selection-context", { slotId });
  if (!target) throw Error("가져올 대상 슬롯이 없습니다.");
  const kind = readAssetFileKind(file);
  if (kind === "slot") return importSelectedGraphFile(file, target.id);
  if (!["data", "image"].includes(kind)) throw Error("지원하지 않는 파일 형식입니다.");
  const directory = PROJECT_ASSET_DIRECTORIES[kind === "data" ? "csv" : "image"],
    choices = await collectCompletedImportChoices([file], directory, choosePlan);
  if (!choices) return null;
  const files = await prepareCopiedImportFiles([file]),
    [result, state, projection] = dispatchProjectCommand("ASSETS_IMPORTED", { files, directory, choices, targetSlotId: slotId });
  if (!result.committed) return result;
  const imported = readImportedAssets(result)[0];
  renderDashboard(projection, state); updateFileAvailability();
  return imported;
}

export async function importProjectAssetFiles(files, choosePlan) {
  return runLifecycleTask("importing", "assets.importFiles", async () => {
    const inputs = Array.from(files && typeof files[Symbol.iterator] === "function" ? files : files ? [files] : []);
    if (!inputs.length) return [];
    const targetSlotId = interfaceFSM.readState().selectedSlotId, output = [];
    for (const file of inputs) {
      const kind = readAssetFileKind(file);
      let item;
      if (kind === "slot") {
        if (targetSlotId == null) throw Error("FFSX를 불러올 슬롯을 먼저 선택하세요.");
        item = await importSelectedGraphFile(file, targetSlotId);
      } else if (kind === "data" || kind === "image") {
        if (targetSlotId != null) item = await importProjectFileToSlot(file, targetSlotId, choosePlan);
        else {
          const directory = PROJECT_ASSET_DIRECTORIES[kind === "data" ? "csv" : "image"];
          item = await importProjectFilesToDirectory([file], directory, choosePlan);
          if (Array.isArray(item)) item = item[0];
        }
      } else throw Error(`${file?.name || "파일"}: 지원하지 않는 파일 형식입니다.`);
      if (item == null || item.committed === false) return item;
      output.push(item);
    }
    return output;
  });
}
