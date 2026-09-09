(() => {
  const runtime = window.FastFigureUiRuntime;
  if (!runtime) throw new Error("Fast Figure UI runtime failed to load");
  if (!window.fastFigureUiRoot) throw new Error("Fast Figure React root is not initialized");

  const { React, MantineCore } = runtime;
  const {
    AppShell,
    Button,
    Group,
    Image,
    MantineProvider,
    Modal,
    NumberInput,
    Select,
    Stack,
    Text,
    TextInput,
  } = MantineCore;
  const { useRef, useState, useSyncExternalStore } = React;

  function subscribeAppState(onStoreChange) {
    return appFSM.subscribe(onStoreChange);
  }

  function getAppStateSnapshot() {
    return appFSM.state;
  }

  function useAppState() {
    return useSyncExternalStore(subscribeAppState, getAppStateSnapshot, getAppStateSnapshot);
  }

  function selectedTargetText(state) {
    if (state.workspace === "project") return "빈 슬롯 또는 그래프를 선택하세요.";
    const slot = typeof getSelectedSlot === "function" ? getSelectedSlot() : null;
    return slot ? `선택한 슬롯: ${slot.row}행 ${slot.col}열` : "빈 슬롯 또는 그래프를 선택하세요.";
  }

  function toggleOverlay(overlay) {
    appFSM.send("TOGGLE_OVERLAY", { overlay, source: "mantine" });
  }

  function runLifecycleTask(lifecycle, eventName, task) {
    return appFSM
      .run(lifecycle, eventName, task)
      .catch((error) => {
        debugLog(
          "fsm:lifecycle-task-error",
          { event: eventName, message: error.message },
          "error",
        );
      });
  }

  function exportProjectFromMantine() {
    return runLifecycleTask("exporting", "PROJECT_EXPORT", () => downloadProject());
  }

  function exportSlotFfsxFromMantine() {
    return runLifecycleTask("exporting", "SLOT_EXPORT", () => downloadSlotFfsx());
  }

  function exportPlotlyJsonFromMantine() {
    return runLifecycleTask("exporting", "PLOTLY_EXPORT", () => downloadPlotlyJson());
  }

  function FastFigureToolbar() {
    const state = useAppState();
    const activeOverlay = state.overlay;
    const buttonProps = (overlay) => ({
      variant: activeOverlay === overlay ? "filled" : "light",
      "aria-expanded": activeOverlay === overlay,
      onClick: () => toggleOverlay(overlay),
    });

    return React.createElement(
      Group,
      { gap: "xs", wrap: "nowrap", role: "toolbar", "aria-label": "Fast figure 도구" },
      React.createElement(Button, { ...buttonProps("layout") }, "레이아웃"),
      React.createElement(Button, { ...buttonProps("label") }, "레이블"),
      React.createElement(Button, { ...buttonProps("caption") }, "캡션"),
      React.createElement(
        Text,
        {
          size: "sm",
          c: "dimmed",
          style: { flex: "1 1 auto", minWidth: 0 },
        },
        selectedTargetText(state),
      ),
      React.createElement(Button, { ...buttonProps("print"), "aria-label": "프린트" }, "프린트"),
    );
  }

  function FastFigureDataActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const slot = state.workspace === "project" ? null : getSelectedSlot();
    const slotType = slot?.contentType || "graph";
    const [resetSlotId, setResetSlotId] = useState(null);
    const selectedAsset = state.assetPath ? projectVfs.resolve(state.assetPath) : null;
    const selectedAssetDeletable =
      ["csv", "image"].includes(selectedAsset?.kind) &&
      !(selectedAsset.kind === "csv" && selectedAsset.asset.isDefaultEmpty === true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const fileInputRef = useRef(null);
    const importChoiceResolverRef = useRef(null);
    const [importCollision, setImportCollision] = useState(null);

    const closeImportCollision = (choice = "rename") => {
      const resolve = importChoiceResolverRef.current;
      importChoiceResolverRef.current = null;
      setImportCollision(null);
      resolve?.(choice);
    };
    const chooseProjectAssetImportPlan = async (file, directory) => {
      const model = projectAssetImportCollisionModel(file, directory);
      if (model.mode === "available")
        return resolveProjectAssetImportPlan(model, "rename");
      const choice = await new Promise((resolve) => {
        importChoiceResolverRef.current = resolve;
        setImportCollision(model);
      });
      return resolveProjectAssetImportPlan(model, choice || "rename");
    };
    const importFilesFromMantine = async (event) => {
      const input = event.target;
      const files = [...(input.files || [])];
      if (!files.length) return;
      const target = getSelectedSlot();
      try {
        await runLifecycleTask("importing", "ASSET_IMPORT", async () => {
          try {
            if (target && (target.contentType || "graph") === "image") {
              const file = files[0];
              const kind = slotFileKind(file);
              if (kind === "slot") await importSlotFile(file, target);
              else if (kind === "image") {
                const plan = await chooseProjectAssetImportPlan(
                  file,
                  PROJECT_ASSET_DIRECTORIES.image,
                );
                await loadImageFile(file, target, {
                  assetPath: plan.path,
                  replaceAssetId: plan.replaceId,
                });
              } else if (kind === "data") {
                const plan = await chooseProjectAssetImportPlan(
                  file,
                  PROJECT_ASSET_DIRECTORIES.csv,
                );
                await loadDataFile(file, target, {
                  replaceSlotContent: true,
                  assetPath: plan.path,
                  replaceAssetId: plan.replaceId,
                });
              } else throw Error(`${file.name}: 지원하지 않는 파일 형식입니다.`);
            } else if (target) {
              for (const file of files) {
                const plan = await chooseProjectAssetImportPlan(
                  file,
                  PROJECT_ASSET_DIRECTORIES.csv,
                );
                await loadDataFile(file, target, {
                  assetPath: plan.path,
                  replaceAssetId: plan.replaceId,
                });
              }
            } else {
              for (const file of files) {
                const kind = slotFileKind(file);
                if (kind === "image") {
                  const plan = await chooseProjectAssetImportPlan(
                    file,
                    PROJECT_ASSET_DIRECTORIES.image,
                  );
                  await loadImageFile(file, null, {
                    assetPath: plan.path,
                    replaceAssetId: plan.replaceId,
                  });
                } else if (kind === "data") {
                  const plan = await chooseProjectAssetImportPlan(
                    file,
                    PROJECT_ASSET_DIRECTORIES.csv,
                  );
                  await loadDataFile(file, null, {
                    assetPath: plan.path,
                    replaceAssetId: plan.replaceId,
                  });
                } else throw Error(`${file.name}: 지원하지 않는 파일 형식입니다.`);
              }
            }
          } catch (error) {
            status("불러오기 실패: " + error.message);
          }
        });
      } finally {
        input.value = "";
      }
    };

    const deletionDescriptor = () => {
      if (!selectedAssetDeletable) return null;
      if (selectedAsset.kind === "csv") {
        const referenceCount = activeProject.charts.reduce(
          (count, chart) =>
            count +
            (chart.editor?.objects || []).filter(
              (object) => object.csvId === selectedAsset.asset.id,
            ).length,
          0,
        );
        return {
          kind: "csv",
          id: selectedAsset.asset.id,
          name: selectedAsset.asset.name,
          referenceCount,
        };
      }
      return {
        kind: "image",
        id: selectedAsset.asset.id,
        name: selectedAsset.asset.name,
        referenceCount: activeProject.slots.filter(
          (candidate) => candidate.imageId === selectedAsset.asset.id,
        ).length,
      };
    };
    const performAssetDelete = (target) => {
      if (!target) return;
      try {
        if (target.kind === "csv") {
          const csv = getProjectCsv(target.id);
          if (!csv || csv.isDefaultEmpty === true) return setDeleteTarget(null);
          const references = activeProject.charts.flatMap((chart) =>
            (chart.editor?.objects || [])
              .map((object) => ({ chart, object }))
              .filter(({ object }) => object.csvId === target.id),
          );
          if (references.length) {
            appFSM.send("CLEAR_GRAPH_OBJECT", {
              index: null,
              direction: "ui-to-fsm",
            });
            activeProject.charts.forEach((chart) => {
              if (!Array.isArray(chart.editor?.objects)) return;
              const objects = chart.editor.objects.filter((object) => object.csvId !== target.id);
              if (objects.length === chart.editor.objects.length) return;
              appFSM.send("GRAPH_OBJECTS_REPLACED", {
                chartId: chart.id,
                objects,
                direction: "fsm-to-model",
              });
            });
          }
          appFSM.send("DATA_OBJECT_DELETED", {
            csvId: target.id,
            direction: "fsm-to-model",
          });
          appFSM.send("CLEAR_ASSET_SELECTION", { direction: "fsm-to-model" });
          renderDashboard();
          status(
            references.length
              ? `${csv.name}과 이를 참조하던 그래프 오브젝트 ${references.length}개를 삭제했습니다.`
              : `${csv.name}을 프로젝트에서 삭제했습니다.`,
          );
        } else {
          const image = getProjectImage(target.id);
          if (!image) return setDeleteTarget(null);
          const references = activeProject.slots.filter((candidate) => candidate.imageId === target.id);
          if (references.length)
            appFSM.send("SLOTS_RESET", {
              slotIds: references.map((candidate) => candidate.id),
              direction: "fsm-to-model",
            });
          appFSM.send("IMAGE_OBJECT_DELETED", {
            imageId: target.id,
            direction: "fsm-to-model",
          });
          appFSM.send("CLEAR_ASSET_SELECTION", { direction: "fsm-to-model" });
          renderDashboard();
          status(
            references.length
              ? `${image.name}을 삭제하고 참조 슬롯 ${references.length}개를 초기화했습니다.`
              : `${image.name}을 프로젝트에서 삭제했습니다.`,
          );
        }
        setDeleteTarget(null);
      } catch (error) {
        status(`에셋 삭제 오류: ${error.message}`);
      }
    };
    const requestAssetDelete = () => {
      const target = deletionDescriptor();
      if (!target) return;
      if (target.referenceCount > 0) setDeleteTarget(target);
      else performAssetDelete(target);
    };
    const closeResetDialog = () => setResetSlotId(null);
    const confirmSlotReset = () => {
      if (!Number.isInteger(resetSlotId)) return;
      const payload = {
        slotIds: [resetSlotId],
        direction: "fsm-to-model",
      };
      try {
        appFSM.send("SLOTS_RESET", payload);
        appFSM.send("CLEAR_ASSET_SELECTION", {
          direction: "fsm-to-model",
        });
        renderDashboard();
        status("선택한 슬롯을 초기화했습니다.");
        debugLog("slotReset:complete", {
          slotId: resetSlotId,
          removedChartIds: payload.removedChartIds,
        });
        closeResetDialog();
      } catch (error) {
        status(`슬롯 초기화 오류: ${error.message}`);
      }
    };
    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "데이터"),
      slot
        ? React.createElement(
            Group,
            { gap: "xs", grow: true },
            React.createElement(
              Button,
              {
                variant: slotType === "graph" ? "filled" : "light",
                disabled: busy,
                onClick: () => setSlotContentType("graph"),
              },
              "그래프",
            ),
            React.createElement(
              Button,
              {
                variant: slotType === "image" ? "filled" : "light",
                disabled: busy,
                onClick: () => setSlotContentType("image"),
              },
              "이미지",
            ),
          )
        : null,
      React.createElement("input", {
        ref: fileInputRef,
        type: "file",
        accept: ".csv,.tsv,.json",
        multiple: true,
        hidden: true,
        onChange: importFilesFromMantine,
      }),
      React.createElement(
        Button,
        {
          variant: "light",
          disabled: busy,
          onClick: () => fileInputRef.current?.click(),
        },
        "데이터 추가",
      ),
      React.createElement(
        Modal,
        {
          opened: !!importCollision,
          onClose: () => closeImportCollision("rename"),
          title:
            importCollision?.mode === "replace-or-rename"
              ? "같은 이름의 파일"
              : "파일 이름 충돌",
          centered: true,
        },
        importCollision
          ? React.createElement(
              Stack,
              { gap: "sm" },
              React.createElement(
                Text,
                { style: { whiteSpace: "pre-wrap" } },
                importCollision.mode === "replace-or-rename"
                  ? importCollision.message
                  : importCollision.notice ||
                      `${importCollision.path}에 같은 이름의 항목이 있습니다.`,
              ),
              React.createElement(
                Group,
                { justify: "flex-end", gap: "xs" },
                React.createElement(
                  Button,
                  { variant: "light", onClick: () => closeImportCollision("rename") },
                  "새 이름으로 추가",
                ),
                importCollision.mode === "replace-or-rename"
                  ? React.createElement(
                      Button,
                      { onClick: () => closeImportCollision("replace") },
                      "기존 파일 교체",
                    )
                  : null,
              ),
            )
          : null,
      ),
      React.createElement(
        Button,
        {
          variant: "light",
          disabled: busy || !["csv", "image"].includes(state.assetSelection),
          onClick: () => downloadProjectAsset(),
        },
        "선택 에셋 다운로드",
      ),
      React.createElement(
        Button,
        {
          variant: "light",
          disabled: busy || !selectedAssetDeletable,
          onClick: requestAssetDelete,
        },
        "선택 에셋 삭제",
      ),
      React.createElement(
        Modal,
        {
          opened: !!deleteTarget,
          onClose: () => setDeleteTarget(null),
          title: "선택 에셋 삭제",
          centered: true,
        },
        deleteTarget
          ? React.createElement(
              Stack,
              { gap: "sm" },
              React.createElement(
                Text,
                null,
                deleteTarget.kind === "csv"
                  ? `${deleteTarget.name}을 ${deleteTarget.referenceCount}개 그래프 오브젝트가 참조 중입니다. 참조 중인 그래프 오브젝트와 CSV를 함께 삭제할까요?`
                  : `${deleteTarget.name}을 ${deleteTarget.referenceCount}개 이미지 슬롯이 참조 중입니다. 참조 슬롯을 초기화하고 이미지를 삭제할까요?`,
              ),
              React.createElement(
                Group,
                { justify: "flex-end", gap: "xs" },
                React.createElement(
                  Button,
                  { variant: "light", onClick: () => setDeleteTarget(null) },
                  "취소",
                ),
                React.createElement(
                  Button,
                  { onClick: () => performAssetDelete(deleteTarget) },
                  "삭제",
                ),
              ),
            )
          : null,
      ),
      slot
        ? React.createElement(
            Button,
            {
              variant: "light",
              disabled: busy,
              onClick: () => setResetSlotId(slot.id),
            },
            "선택 슬롯 초기화",
          )
        : null,
      React.createElement(
        Modal,
        {
          opened: Number.isInteger(resetSlotId),
          onClose: closeResetDialog,
          title: "선택 슬롯 초기화",
          centered: true,
        },
        React.createElement(
          Stack,
          { gap: "sm" },
          React.createElement(Text, null, "데이터를 잃습니다."),
          React.createElement(
            Group,
            { justify: "flex-end", gap: "xs" },
            React.createElement(Button, { variant: "light", onClick: closeResetDialog }, "취소"),
            React.createElement(Button, { onClick: confirmSlotReset }, "초기화"),
          ),
        ),
      ),
    );
  }

  function FastFigureImageEditor() {
    const state = useAppState();
    if (state.workspace !== "slot.image") return null;
    const busy = state.lifecycle !== "ready";
    const slot = getSelectedSlot();
    const image = slotImage(slot);
    const settings = normalizeImageSettings(image);
    const updateSettings = (patch) => {
      if (!settings) return;
      applyImageSettingsFromValues({ ...settings, ...patch });
    };

    return React.createElement(
      Stack,
      { gap: "xs", px: "md", pb: "md" },
      React.createElement(Text, { fw: 600, size: "sm" }, "이미지"),
      image
        ? React.createElement(Image, {
            src: projectImageDisplayUrl(image),
            alt: image.name || "선택 이미지",
            h: 160,
            fit: "contain",
            radius: "sm",
          })
        : React.createElement(
            Text,
            { size: "sm", c: "dimmed" },
            "이미지를 추가하거나 프로젝트 이미지 에셋을 연결하세요.",
          ),
      React.createElement(
        Button,
        {
          variant: "light",
          disabled: busy,
          onClick: insertEmptyImageIntoSelectedSlot,
        },
        "빈 이미지 삽입",
      ),
      React.createElement(Select, {
        label: "맞춤",
        value: settings?.fit || "contain",
        data: [
          { value: "contain", label: "맞춰 넣기" },
          { value: "cover", label: "채우기" },
          { value: "manual", label: "수동" },
        ],
        disabled: busy || !image,
        allowDeselect: false,
        onChange: (value) => updateSettings({ fit: value || settings?.fit || "contain" }),
      }),
      settings?.fit === "manual"
        ? React.createElement(
            Stack,
            { gap: "xs" },
            React.createElement(NumberInput, {
              label: "크기 (%)",
              value: settings.scale,
              min: 1,
              max: 1000,
              disabled: busy,
              onChange: (value) => updateSettings({ scale: value }),
            }),
            React.createElement(
              Group,
              { gap: "xs", grow: true },
              React.createElement(NumberInput, {
                label: "X (%)",
                value: settings.x,
                min: -100,
                max: 200,
                disabled: busy,
                onChange: (value) => updateSettings({ x: value }),
              }),
              React.createElement(NumberInput, {
                label: "Y (%)",
                value: settings.y,
                min: -100,
                max: 200,
                disabled: busy,
                onChange: (value) => updateSettings({ y: value }),
              }),
            ),
          )
        : null,
    );
  }

  function FastFigureProjectDataTree() {
    const state = useAppState();
    const snapshot = projectDataTreeSnapshot(projectDataTreeObjects());
    const [expanded, setExpanded] = useState(() => new Set(["/assets", "/slots"]));
    const [lastDirectory, setLastDirectory] = useState("/assets");
    const [folderDialog, setFolderDialog] = useState({
      opened: false,
      parent: "/assets",
      name: "New Folder",
    });
    const [trashDialog, setTrashDialog] = useState(null);
    const busy = state.lifecycle !== "ready";
    const directories = [...new Set(snapshot.directories)]
      .filter((path) => path === "/assets" || path.startsWith("/assets/"))
      .sort((a, b) => a.localeCompare(b));

    const openFolderDialog = () => {
      const selectedDirectory =
        state.assetSelection === "directory" ? state.assetPath : lastDirectory;
      const parent =
        typeof selectedDirectory === "string" &&
        (selectedDirectory === "/assets" || selectedDirectory.startsWith("/assets/")) &&
        !projectVfs.isTrashed(selectedDirectory)
          ? selectedDirectory
          : "/assets";
      setFolderDialog({ opened: true, parent, name: "New Folder" });
    };
    const closeFolderDialog = () =>
      setFolderDialog((current) => ({ ...current, opened: false }));
    const createFolderFromMantine = () => {
      const payload = {
        parent: folderDialog.parent,
        name: folderDialog.name,
        direction: "ui-to-fsm",
      };
      try {
        appFSM.send("PROJECT_DIRECTORY_CREATED", payload);
        setLastDirectory(payload.path);
        appFSM.send("SELECT_ASSET", {
          kind: "directory",
          path: payload.path,
          direction: "ui-to-fsm",
        });
        status(`${payload.path} 폴더를 만들었습니다.`);
        closeFolderDialog();
      } catch (error) {
        status(`폴더 생성 오류: ${error.message}`);
      }
    };
    const trashSelected =
      state.assetSelection === "directory" && state.assetPath === PROJECT_TRASH_DIRECTORY;
    const trashedCsvIds = new Set(
      snapshot.data.filter((asset) => projectVfs.isTrashed(asset.path)).map((asset) => asset.id),
    );
    const trashedImageIds = new Set(
      snapshot.images.filter((asset) => projectVfs.isTrashed(asset.path)).map((asset) => asset.id),
    );
    const trashHasContents =
      directories.some(
        (path) => path !== PROJECT_TRASH_DIRECTORY && projectVfs.isTrashed(path),
      ) ||
      trashedCsvIds.size > 0 ||
      trashedImageIds.size > 0;
    const openTrashDialog = () => {
      if (!trashSelected || !trashHasContents) return;
      setTrashDialog({
        referenceCount: projectAssetReferenceCount(trashedCsvIds, trashedImageIds),
      });
    };
    const closeTrashDialog = () => setTrashDialog(null);
    const emptyTrashFromMantine = () => {
      const payload = { direction: "ui-to-fsm" };
      try {
        appFSM.send("PROJECT_TRASH_EMPTIED", payload);
        updateFileAvailability();
        status(
          `휴지통을 비웠습니다. 폴더 ${payload.directoryCount}개, CSV ${payload.csvCount}개, 이미지 ${payload.imageCount}개를 삭제했습니다.`,
        );
        closeTrashDialog();
      } catch (error) {
        status(`휴지통 비우기 오류: ${error.message}`);
      }
    };
    const toggleExpanded = (path) => {
      setExpanded((current) => {
        const next = new Set(current);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      });
    };
    const csvReferenceCount = (id) =>
      snapshot.charts.reduce(
        (count, chart) => count + chart.csvReferences.filter((csvId) => csvId === id).length,
        0,
      );
    const imageReferenceCount = (id) =>
      snapshot.slots.filter((slot) => slot.imageId === id).length;
    const assetRow = (asset, kind) => {
      const inactive = projectVfs.isTrashed(asset.path);
      const selected = state.assetSelection === kind && state.assetPath === asset.path;
      const meta =
        kind === "csv"
          ? `${asset.readable ? `${asset.rowCount}행` : "읽기 실패"} · 참조 ${csvReferenceCount(asset.id)}`
          : `참조 ${imageReferenceCount(asset.id)}`;
      return React.createElement(
        Button,
        {
          key: `${kind}:${asset.path}`,
          variant: selected ? "filled" : "subtle",
          size: "xs",
          fullWidth: true,
          disabled: inactive,
          justify: "space-between",
          onClick: () =>
            kind === "csv" ? selectCsvFromTree(asset.path) : selectImageFromTree(asset.path),
        },
        React.createElement("span", null, projectPathName(asset.path)),
        React.createElement("span", { style: { opacity: 0.7 } }, meta),
      );
    };
    const directoryNode = (path) => {
      const selected = state.assetSelection === "directory" && state.assetPath === path;
      const childDirectories = directories.filter(
        (candidate) => candidate !== path && projectParentPath(candidate) === path,
      );
      const childAssets = [
        ...snapshot.data
          .filter((asset) => projectParentPath(asset.path) === path)
          .map((asset) => assetRow(asset, "csv")),
        ...snapshot.images
          .filter((asset) => projectParentPath(asset.path) === path)
          .map((asset) => assetRow(asset, "image")),
      ];
      const open = expanded.has(path);
      return React.createElement(
        Stack,
        { key: path, gap: 2 },
        React.createElement(
          Button,
          {
            variant: selected ? "filled" : "subtle",
            size: "xs",
            fullWidth: true,
            justify: "flex-start",
            "aria-expanded": open,
            onClick: () => {
              setLastDirectory(path);
              selectDirectoryFromTree(path);
              toggleExpanded(path);
            },
          },
          `${open ? "▾" : "▸"} ${path === "/assets" ? "/assets" : projectPathName(path)}`,
        ),
        open
          ? React.createElement(
              Stack,
              { gap: 2, pl: "md" },
              ...childDirectories.map(directoryNode),
              ...childAssets,
            )
          : null,
      );
    };
    const visibleSlots = snapshot.slots
      .filter((slot) => !slot.hidden)
      .sort((a, b) => a.row - b.row || a.col - b.col);
    const slotReference = (slot) => {
      if (slot.contentType === "image") {
        const image = snapshot.images.find((item) => item.id === slot.imageId);
        return image ? `${image.name} · ${image.path}` : "(에셋 없음)";
      }
      const chart = snapshot.charts.find((item) => item.id === slot.chart);
      if (!chart) return "(에셋 없음)";
      if (chart.editable === false) return "Plotly JSON 내부 데이터 · 외부 참조 없음";
      const references = chart.csvIds
        .map((id) => snapshot.data.find((item) => item.id === id))
        .filter(Boolean)
        .map((csv) => `${csv.name} · ${csv.path}`);
      return references.length ? references.join(", ") : "(에셋 없음)";
    };

    return React.createElement(
      Stack,
      { gap: "xs", px: "md", pb: "md" },
      React.createElement(Text, { fw: 600, size: "sm" }, "PROJECT DATA"),
      React.createElement(
        Button,
        {
          variant: "light",
          size: "xs",
          disabled: busy,
          onClick: openFolderDialog,
        },
        "새 폴더",
      ),
      React.createElement(
        Modal,
        {
          opened: folderDialog.opened,
          onClose: closeFolderDialog,
          title: "새 폴더",
          centered: true,
        },
        React.createElement(
          Stack,
          { gap: "sm" },
          React.createElement(Text, { size: "sm", c: "dimmed" }, `위치: ${folderDialog.parent}`),
          React.createElement(TextInput, {
            label: "폴더 이름",
            value: folderDialog.name,
            autoFocus: true,
            onChange: (event) =>
              setFolderDialog((current) => ({ ...current, name: event.target.value })),
            onKeyDown: (event) => {
              if (event.key !== "Enter" || event.nativeEvent?.isComposing) return;
              event.preventDefault();
              createFolderFromMantine();
            },
          }),
          React.createElement(
            Group,
            { justify: "flex-end", gap: "xs" },
            React.createElement(Button, { variant: "light", onClick: closeFolderDialog }, "취소"),
            React.createElement(Button, { onClick: createFolderFromMantine }, "만들기"),
          ),
        ),
      ),
      trashSelected
        ? React.createElement(
            Button,
            {
              variant: "light",
              size: "xs",
              disabled: busy || !trashHasContents,
              onClick: openTrashDialog,
            },
            "휴지통 비우기",
          )
        : null,
      React.createElement(
        Modal,
        {
          opened: !!trashDialog,
          onClose: closeTrashDialog,
          title: "휴지통 비우기",
          centered: true,
        },
        trashDialog
          ? React.createElement(
              Stack,
              { gap: "sm" },
              React.createElement(
                Text,
                null,
                trashDialog.referenceCount
                  ? `휴지통 자산에 남아 있는 참조 ${trashDialog.referenceCount}개도 함께 제거됩니다. 휴지통의 폴더와 파일을 영구적으로 비우시겠습니까?`
                  : "휴지통의 폴더와 파일을 영구적으로 비우시겠습니까?",
              ),
              React.createElement(
                Group,
                { justify: "flex-end", gap: "xs" },
                React.createElement(Button, { variant: "light", onClick: closeTrashDialog }, "취소"),
                React.createElement(Button, { onClick: emptyTrashFromMantine }, "비우기"),
              ),
            )
          : null,
      ),
      directoryNode("/assets"),
      React.createElement(
        Button,
        {
          variant: "subtle",
          size: "xs",
          fullWidth: true,
          justify: "flex-start",
          "aria-expanded": expanded.has("/slots"),
          onClick: () => toggleExpanded("/slots"),
        },
        `${expanded.has("/slots") ? "▾" : "▸"} /slots`,
      ),
      expanded.has("/slots")
        ? React.createElement(
            Stack,
            { gap: 2, pl: "md" },
            ...(visibleSlots.length
              ? visibleSlots.map((slot) =>
                  React.createElement(
                    Text,
                    { key: slot.id, size: "xs" },
                    `[row=${slot.row},col=${slot.col}] — ${slotReference(slot)}`,
                  ),
                )
              : [React.createElement(Text, { key: "empty", size: "xs", c: "dimmed" }, "(표시 슬롯 없음)")]),
          )
        : null,
    );
  }
  function FastFigureProjectActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const importInputRef = useRef(null);

    const openProjectImportPicker = () => {
      if (getSelectedSlot())
        return status("프로젝트 불러오기는 슬롯 선택을 해제한 뒤 사용할 수 있습니다.");
      importInputRef.current?.click();
    };
    const importProjectFileFromMantine = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        await runLifecycleTask("importing", "PROJECT_IMPORT", async () => {
          try {
            const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
            const payload =
              header.length === 4 && header[0] === 0x50 && header[1] === 0x4b
                ? await ffpxReadProject(file)
                : JSON.parse(await file.text());
            importProject(payload, file.name);
            status(`${file.name} 프로젝트를 불러왔습니다.`);
          } catch (error) {
            status("프로젝트 불러오기 오류: " + error.message);
            debugLog("project:import-error", { message: error.message });
          }
        });
      } finally {
        event.target.value = "";
      }
    };

    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "프로젝트"),
      React.createElement(TextInput, {
        key: `project-name-${activeProject.projectName}`,
        label: "프로젝트 이름",
        defaultValue: activeProject.projectName,
        disabled: busy,
        onChange: (event) => {
          activeProject.projectName = event.target.value.slice(0, 120);
        },
        onBlur: (event) => {
          activeProject.projectName = event.target.value.trim().slice(0, 120);
          event.target.value = activeProject.projectName;
          debugLog("project:name", { projectName: activeProject.projectName });
        },
      }),
      React.createElement("input", {
        ref: importInputRef,
        type: "file",
        hidden: true,
        onChange: importProjectFileFromMantine,
      }),
      React.createElement(
        Group,
        { gap: "xs" },
        React.createElement(
          Button,
          { variant: "light", disabled: busy, onClick: exportProjectFromMantine },
          "FFPX 내보내기",
        ),
        React.createElement(
          Button,
          { variant: "light", disabled: busy, onClick: openProjectImportPicker },
          "FFPX 불러오기",
        ),
      ),
    );
  }

  function FastFigureGraphFileActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const importInputRef = useRef(null);
    if (state.workspace !== "slot.graph") return null;

    const openSlotImportPicker = () => {
      if (!getSelectedSlot())
        return status("FFSX 또는 Plotly JSON을 불러올 슬롯을 먼저 선택하세요.");
      importInputRef.current?.click();
    };
    const importSlotFileFromMantine = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const slot = getSelectedSlot();
      try {
        await runLifecycleTask("importing", "SLOT_IMPORT", async () => {
          try {
            await importSlotFile(file, slot);
          } catch (error) {
            refreshCsvControls();
            status("슬롯 불러오기 오류: " + error.message);
            debugLog("slot:import-error", { message: error.message });
          }
        });
      } finally {
        event.target.value = "";
      }
    };

    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "그래프 파일"),
      React.createElement("input", {
        ref: importInputRef,
        type: "file",
        hidden: true,
        onChange: importSlotFileFromMantine,
      }),
      React.createElement(
        Group,
        { gap: "xs", grow: true },
        React.createElement(
          Button,
          { variant: "light", disabled: busy, onClick: exportSlotFfsxFromMantine },
          "FFSX 내보내기",
        ),
        React.createElement(
          Button,
          { variant: "light", disabled: busy, onClick: exportPlotlyJsonFromMantine },
          "Plotly JSON 내보내기",
        ),
      ),
      React.createElement(
        Button,
        { variant: "light", disabled: busy, onClick: openSlotImportPicker },
        "FFSX/Plotly JSON 불러오기",
      ),
    );
  }

  function FastFigureUtilityActions() {
    const state = useAppState();
    return React.createElement(
      Stack,
      { gap: "xs", p: "md", mt: "auto" },
      React.createElement(
        Button,
        {
          variant: state.overlay === "readme" ? "filled" : "light",
          "aria-expanded": state.overlay === "readme",
          onClick: () => toggleOverlay("readme"),
        },
        "README",
      ),
    );
  }

  function FastFigureShell() {
    const [navbarWidth, setNavbarWidth] = useState(370);
    const [navbarCollapsed, setNavbarCollapsed] = useState(false);
    const navbarDragRef = useRef(null);
    const clampNavbarWidth = (value) => Math.max(360, Math.min(620, value));
    const refreshDashboardAfterNavbarChange = () => {
      requestAnimationFrame(() => {
        syncLayoutMapSize();
        schedulePlotResize();
      });
    };
    const toggleNavbar = () => {
      setNavbarCollapsed((collapsed) => !collapsed);
      refreshDashboardAfterNavbarChange();
    };
    const startNavbarResize = (event) => {
      if (navbarCollapsed) return;
      navbarDragRef.current = event.pointerId;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    };
    const resizeNavbar = (event) => {
      if (navbarDragRef.current !== event.pointerId) return;
      const width = clampNavbarWidth(event.clientX);
      setNavbarWidth(width);
      syncLayoutMapSize();
      schedulePlotResize();
    };
    const stopNavbarResize = (event) => {
      if (navbarDragRef.current !== event.pointerId) return;
      navbarDragRef.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      debugLog("mantine:sidebar-resize", { width: navbarWidth });
    };

    return React.createElement(
      AppShell,
      {
        header: { height: 57 },
        navbar: {
          width: navbarWidth,
          breakpoint: "sm",
          collapsed: { desktop: navbarCollapsed, mobile: navbarCollapsed },
        },
        padding: 0,
      },
      React.createElement(
        AppShell.Header,
        null,
        React.createElement(
          Group,
          { h: "100%", px: "md", gap: "md", wrap: "nowrap" },
          React.createElement(
            Button,
            {
              variant: "light",
              "aria-expanded": !navbarCollapsed,
              onClick: toggleNavbar,
            },
            navbarCollapsed ? "사이드바 표시" : "사이드바 숨기기",
          ),
          React.createElement(Text, { fw: 700, size: "xl", style: { flex: "0 0 auto" } }, "Fast figure"),
          React.createElement("div", { style: { flex: "1 1 auto", minWidth: 0 } }, React.createElement(FastFigureToolbar)),
        ),
      ),
      React.createElement(
        AppShell.Navbar,
        { p: 0, style: { position: "relative" } },
        React.createElement(FastFigureDataActions),
        React.createElement(FastFigureImageEditor),
        React.createElement(FastFigureProjectDataTree),
        React.createElement(FastFigureProjectActions),
        React.createElement(FastFigureGraphFileActions),
        React.createElement(FastFigureUtilityActions),
        React.createElement("div", {
          role: "separator",
          "aria-orientation": "vertical",
          "aria-label": "사이드바 너비 조절",
          onPointerDown: startNavbarResize,
          onPointerMove: resizeNavbar,
          onPointerUp: stopNavbarResize,
          onPointerCancel: stopNavbarResize,
          style: {
            position: "absolute",
            top: 0,
            right: -4,
            bottom: 0,
            width: 8,
            cursor: "col-resize",
            touchAction: "none",
          },
        }),
      ),
      React.createElement(AppShell.Main, null),
    );
  }

  window.FastFigureMantineUi = Object.freeze({
    FastFigureShell,
    FastFigureToolbar,
    FastFigureDataActions,
    FastFigureImageEditor,
    FastFigureProjectDataTree,
    FastFigureProjectActions,
    FastFigureGraphFileActions,
    FastFigureUtilityActions,
    getAppStateSnapshot,
    selectedTargetText,
  });

  window.fastFigureUiRoot.render(
    React.createElement(
      MantineProvider,
      { defaultColorScheme: "light" },
      React.createElement(FastFigureShell),
    ),
  );
})();
