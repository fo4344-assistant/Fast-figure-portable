(() => {
  const runtime = window.FastFigureUiRuntime;
  if (!runtime) throw new Error("Fast Figure UI runtime failed to load");
  if (!window.fastFigureUiRoot) throw new Error("Fast Figure React root is not initialized");

  const { React, MantineCore } = runtime;
  const {
    AppShell,
    Button,
    ColorInput,
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

  function FastFigureGraphDataEditor() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const dragRef = useRef(null);
    if (state.workspace !== "slot.graph") return null;
    const chart = graphEditorChart();
    const objects = chart ? ensureGraphObjects(chart) : [];
    const selectedIndex = Number.isInteger(selectedObjectIndex) && objects[selectedObjectIndex] ? selectedObjectIndex : null;
    const selected = selectedIndex === null ? null : objects[selectedIndex];
    const activeCsv = getProjectCsv(selected?.csvId) || getProjectCsv(activeCsvId) || activeProject.csvFiles[0] || null;
    const csvOptions = activeProject.csvFiles.map((csv) => ({ value: String(csv.id), label: csv.name }));
    const columns = activeCsv ? columnDefinitions(activeCsv.rows, activeCsv.headerLines) : [];
    const columnOptions = columns.map((column) => ({ value: column.id, label: column.label }));
    const update = (values) => selectedIndex !== null && graphEditorObjectValues(selectedIndex, values);
    const selectField = (label, key, data) => React.createElement(Select, {
      label, data, value: selected?.[key] ?? null, disabled: busy,
      onChange: (value) => value !== null && update({ [key]: value }),
    });
    const numberField = (label, key, min, max, step = 1) => React.createElement(NumberInput, {
      label, value: selected?.[key], min, max, step, disabled: busy,
      onChange: (value) => update({ [key]: value }),
    });
    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "그래프 / 데이터"),
      React.createElement(Select, {
        label: "사용할 CSV", data: csvOptions, value: activeCsv ? String(activeCsv.id) : null,
        disabled: busy || !csvOptions.length,
        onChange: (value) => value !== null && graphEditorSelectCsv(Number(value)),
      }),
      activeCsv ? React.createElement(NumberInput, {
        label: "헤더 행 수", value: activeCsv.headerLines, min: 0, max: activeCsv.rows.length,
        allowDecimal: false, disabled: busy,
        onChange: (value) => graphEditorHeaderLines(activeCsv.id, value),
      }) : null,
      activeCsv && columns.length ? React.createElement(
        "div",
        { style: { maxHeight: 220, overflow: "auto" } },
        React.createElement(
          "table",
          { style: { width: "100%", borderCollapse: "collapse", fontSize: "var(--mantine-font-size-xs)" } },
          React.createElement("thead", null, React.createElement("tr", null,
            ...columns.map((column) => React.createElement("th", { key: column.id, style: { textAlign: "left", padding: 4 } }, column.label)),
          )),
          React.createElement("tbody", null,
            ...activeCsv.rows.slice(0, 30).map((row, rowIndex) => React.createElement("tr", { key: rowIndex },
              ...columns.map((column) => React.createElement("td", {
                key: column.id,
                style: { padding: 4, fontWeight: rowIndex < activeCsv.headerLines ? 600 : 400 },
              }, String(row?.[column.index] ?? ""))),
            )),
          ),
        ),
      ) : null,
      React.createElement(Group, { gap: "xs", grow: true },
        React.createElement(Button, {
          variant: chart?.editor?.editable !== false ? "filled" : "light", disabled: busy || !chart,
          onClick: () => graphEditorSetEditable(chart?.editor?.editable === false),
        }, chart?.editor?.editable !== false ? "편집 가능" : "원본 JSON"),
        React.createElement(Button, {
          variant: "light", disabled: busy || !activeCsv,
          onClick: () => activeCsv && graphEditorAdd(activeCsv.id),
        }, "오브젝트 추가"),
      ),
      React.createElement(Text, { size: "sm", fw: 600 }, "그래프 오브젝트"),
      objects.length ? React.createElement(Stack, { gap: 4 },
        ...objects.map((object, index) => React.createElement(Group, {
          key: `${chart.id}-${index}`, gap: 4, wrap: "nowrap", draggable: true,
          onDragStart: () => { dragRef.current = index; },
          onDragEnd: () => { dragRef.current = null; },
          onDragOver: (event) => event.preventDefault(),
          onDrop: (event) => {
            event.preventDefault();
            if (Number.isInteger(dragRef.current)) graphEditorMove(dragRef.current, index);
            dragRef.current = null;
          },
        },
          React.createElement(Button, {
            size: "xs", variant: selectedIndex === index ? "filled" : "light",
            style: { flex: "1 1 auto", minWidth: 0 },
            onClick: () => graphEditorSelectObject(index),
          }, `${index + 1}. ${object.legendName || `${object.x} · ${object.y}`}`),
          React.createElement(ColorInput, {
            size: "xs", value: object.color, style: { width: 72 }, disabled: busy,
            onChange: (color) => graphEditorObjectValues(index, { color }),
          }),
          React.createElement(Button, {
            size: "xs", variant: "subtle", disabled: busy,
            "aria-label": `${index + 1}번 그래프 오브젝트 삭제`,
            onClick: () => graphEditorDelete(index),
          }, "×"),
        )),
      ) : React.createElement(Text, { size: "xs", c: "dimmed" }, "추가된 그래프 오브젝트가 없습니다."),
      selected && activeCsv && chart?.editor?.editable !== false ? React.createElement(Stack, { gap: "xs" },
        React.createElement(Select, {
          label: "오브젝트 CSV", data: csvOptions, value: String(selected.csvId), disabled: busy,
          onChange: (value) => value !== null && update({ csvId: Number(value) }),
        }),
        React.createElement(Group, { gap: "xs", grow: true },
          selectField("X 열", "x", columnOptions), selectField("Y 열", "y", columnOptions),
        ),
        React.createElement(Group, { gap: "xs", grow: true },
          selectField("X 축", "xAxisSide", [{ value: "bottom", label: "아래" }, { value: "top", label: "위" }]),
          selectField("Y 축", "yAxisSide", [{ value: "left", label: "왼쪽" }, { value: "right", label: "오른쪽" }]),
        ),
        selectField("유형", "type", [
          { value: "scatter", label: "선" }, { value: "markers", label: "마커" },
          { value: "lines+markers", label: "선 + 마커" }, { value: "bar", label: "막대" },
          { value: "hidden", label: "숨김" },
        ]),
        React.createElement(TextInput, {
          label: "범례 이름", value: selected.legendName, disabled: busy,
          onChange: (event) => update({ legendName: event.target.value }),
        }),
        ["scatter", "lines+markers", "hidden"].includes(selected.type) ? React.createElement(Group, { gap: "xs", grow: true },
          numberField("선 굵기", "lineWidth", 0.1, 20, 0.1),
          React.createElement(TextInput, {
            label: "선 스타일", value: selected.lineDash, disabled: busy,
            onChange: (event) => update({ lineDash: event.target.value }),
          }),
        ) : null,
        ["markers", "lines+markers"].includes(selected.type) ? React.createElement(Group, { gap: "xs", grow: true },
          React.createElement(TextInput, {
            label: "마커", value: selected.markerSymbol, disabled: busy,
            onChange: (event) => update({ markerSymbol: event.target.value }),
          }),
          numberField("마커 크기", "markerSize", 1, 40),
        ) : null,
        selected.type === "bar" ? React.createElement(Group, { gap: "xs", grow: true },
          numberField("막대 불투명도", "barOpacity", 0.05, 1, 0.05),
          numberField("막대 테두리", "barLineWidth", 0, 10, 0.1),
        ) : null,
      ) : null,
    );
  }
  function FastFigureGraphLayoutEditor() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    if (state.workspace !== "slot.graph") return null;
    const slot = getSelectedSlot();
    const chart = slot?.chart ? getChart(slot.chart) : null;
    if (!chart) return null;
    const settings = readGlobalSettings(chart);
    const editable = chart.editor?.editable !== false;
    const axisLabels = {
      xBottom: "아래 X축",
      xTop: "위 X축",
      yLeft: "왼쪽 Y축",
      yRight: "오른쪽 Y축",
    };
    const commit = (title, globalSettings) => {
      if (!editable) return status("편집 가능 토글을 켠 뒤 설정을 변경하세요.");
      const payload = {
        slotId: slot.id,
        chartId: chart.id,
        title,
        globalSettings,
        direction: "fsm-to-model",
      };
      appFSM.send("CHART_LAYOUT_CHANGED", payload);
      renderDashboard();
      debugLog("mantine:graph-layout", { slotId: slot.id, chartId: chart.id });
    };
    const updateGlobal = (values) =>
      commit(chart.editor.title, { ...readGlobalSettings(chart), ...values });
    const updateTitle = (title) => commit(title, readGlobalSettings(chart));
    const updateAxis = (key, values) => {
      const current = readGlobalSettings(chart);
      commit(chart.editor.title, {
        ...current,
        axes: {
          ...current.axes,
          [key]: { ...current.axes[key], ...values },
        },
      });
    };
    const toggleGlobal = (key, label) =>
      React.createElement(
        Button,
        {
          size: "xs",
          variant: settings[key] ? "filled" : "light",
          disabled: busy || !editable,
          "aria-pressed": settings[key],
          onClick: () => updateGlobal({ [key]: !settings[key] }),
        },
        label,
      );
    const axisNumber = (key, axis, field, label, options = {}) =>
      React.createElement(NumberInput, {
        label,
        value: axis[field],
        disabled: busy || !editable,
        ...options,
        onChange: (value) =>
          updateAxis(key, {
            [field]: value === "" ? "" : String(value),
          }),
      });
    const axisToggle = (key, axis, field, label) =>
      React.createElement(
        Button,
        {
          size: "xs",
          variant: axis[field] ? "filled" : "light",
          disabled: busy || !editable,
          "aria-pressed": axis[field],
          onClick: () => updateAxis(key, { [field]: !axis[field] }),
        },
        label,
      );
    const axisEditor = (key) => {
      const axis = settings.axes[key];
      const logScale = axis.scaleType === "log";
      return React.createElement(
        Stack,
        { key, gap: "xs" },
        React.createElement(Text, { size: "sm", fw: 600 }, axisLabels[key]),
        React.createElement(TextInput, {
          label: "축 이름",
          value: axis.title,
          disabled: busy || !editable,
          onChange: (event) => updateAxis(key, { title: event.target.value }),
        }),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          axisNumber(key, axis, "min", "최소"),
          axisNumber(key, axis, "max", "최대"),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(
            Button,
            {
              variant:
                logScale
                  ? axis.minorTicks
                    ? "filled"
                    : "light"
                  : axis.tickMode === "increment"
                    ? "filled"
                    : "light",
              disabled: busy || !editable,
              "aria-pressed": logScale ? axis.minorTicks : axis.tickMode === "increment",
              onClick: () =>
                logScale
                  ? updateAxis(key, { minorTicks: !axis.minorTicks, tickMode: "plotly" })
                  : updateAxis(key, {
                      tickMode: axis.tickMode === "increment" ? "plotly" : "increment",
                    }),
            },
            logScale
              ? axis.minorTicks
                ? "minor tick 표시"
                : "minor tick 숨김"
              : axis.tickMode === "increment"
                ? "increment"
                : "Plotly tick",
          ),
          logScale
            ? null
            : axisNumber(key, axis, "tick", "tick 간격"),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(Select, {
            label: "표기",
            data: [
              { value: "none", label: "숫자" },
              { value: "power", label: "지수" },
              { value: "e", label: "과학 표기" },
            ],
            value: axis.notation,
            disabled: busy || !editable,
            onChange: (value) => value !== null && updateAxis(key, { notation: value }),
          }),
          React.createElement(Select, {
            label: "축 유형",
            data: [
              { value: "linear", label: "선형" },
              { value: "log", label: "로그" },
              { value: "reciprocal", label: "역수" },
            ],
            value: axis.scaleType,
            disabled: busy || !editable,
            onChange: (value) =>
              value !== null &&
              updateAxis(key, {
                scaleType: value,
                tickMode: value === "log" ? "plotly" : axis.tickMode,
              }),
          }),
        ),
        axisNumber(key, axis, "divide", "값 나누기"),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          axisNumber(key, axis, "titleSize", "축 이름 크기"),
          axisNumber(key, axis, "fontSize", "숫자 크기"),
        ),
        axisNumber(key, axis, "lineWidth", "축선 굵기", { min: 0 }),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          axisToggle(key, axis, "showGrid", "격자"),
          axisToggle(key, axis, "visible", "축"),
          axisToggle(key, axis, "showValues", "값"),
        ),
      );
    };

    return React.createElement(
      Stack,
      { gap: "xs", p: "md" },
      React.createElement(Text, { fw: 600 }, "그래프 전역 / 축"),
      React.createElement(TextInput, {
        label: "그래프 제목",
        value: chart.editor.title,
        disabled: busy || !editable,
        onChange: (event) => updateTitle(event.target.value),
      }),
      React.createElement(
        Group,
        { gap: "xs", grow: true },
        toggleGlobal("showLegend", "범례"),
        toggleGlobal("showTitle", "제목"),
        toggleGlobal("showZeroLine", "0선"),
      ),
      React.createElement(TextInput, {
        label: "그래프 글꼴",
        value: settings.graphFontFamily,
        disabled: busy || !editable,
        onChange: (event) => updateGlobal({ graphFontFamily: event.target.value }),
      }),
      React.createElement(
        Group,
        { gap: "xs", grow: true },
        React.createElement(NumberInput, {
          label: "제목 크기",
          value: settings.titleFontSize,
          disabled: busy || !editable,
          onChange: (value) =>
            updateGlobal({ titleFontSize: value === "" ? "" : String(value) }),
        }),
        React.createElement(NumberInput, {
          label: "범례 크기",
          value: settings.legendFontSize,
          disabled: busy || !editable,
          onChange: (value) =>
            updateGlobal({ legendFontSize: value === "" ? "" : String(value) }),
        }),
      ),
      ...Object.keys(axisLabels).map(axisEditor),
    );
  }
  function FastFigureGraphPaletteActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const importRef = useRef(null);
    if (state.workspace !== "slot.graph") return null;
    const chart = graphEditorChart();
    const objects = chart ? ensureGraphObjects(chart) : [];
    const selected =
      Number.isInteger(selectedObjectIndex) &&
      selectedObjectIndex >= 0 &&
      selectedObjectIndex < objects.length
        ? selectedObjectIndex
        : null;
    const canEdit = !!chart && chart.editor?.editable !== false;
    const commitColors = (colors) => {
      if (!canEdit) return status("편집 가능 토글을 켠 뒤 색상 구성을 변경하세요.");
      if (!Array.isArray(colors) || !colors.length)
        throw Error("적용할 색상 배열이 없습니다.");
      const next = objects.map((object, index) => ({
        ...object,
        color: colors[index % colors.length],
      }));
      graphEditorCommit(next, selected);
      return next;
    };
    const resetPalette = () => {
      if (!chart) return status("그래프 슬롯을 먼저 선택하세요.");
      commitColors(DEFAULT_COLORS);
      debugLog("graphPalette:reset", { slotId: getSelectedSlot()?.id ?? null });
    };
    const savePalette = () => {
      if (!chart) return status("그래프 슬롯을 먼저 선택하세요.");
      const colors = objects.map((object) => object.color).filter(Boolean);
      const blob = new Blob([JSON.stringify({ colors }, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const link = document.createElement("a");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = URL.createObjectURL(blob);
      link.download = `chart-palette-${stamp}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 0);
      debugLog("graphPalette:save", {
        slotId: getSelectedSlot()?.id ?? null,
        colors: colors.length,
      });
    };
    const loadPalette = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        await runLifecycleTask("importing", "PALETTE_IMPORT", async () => {
          try {
            const parsed = JSON.parse(await file.text());
            const colors = Array.isArray(parsed) ? parsed : parsed.colors;
            if (!Array.isArray(colors) || !colors.length)
              throw Error("colors 배열이 없습니다.");
            const valid = colors.filter(
              (color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color),
            );
            if (!valid.length) throw Error("유효한 HEX 색상이 없습니다.");
            commitColors(valid);
            status(`${file.name} 색상 구성을 덮어썼습니다.`);
            debugLog("graphPalette:load", {
              slotId: getSelectedSlot()?.id ?? null,
              name: file.name,
              colors: valid.length,
            });
          } catch (error) {
            status("팔레트 불러오기 실패: " + error.message);
            debugLog("graphPalette:load-error", { message: error.message });
            throw error;
          }
        });
      } finally {
        event.target.value = "";
      }
    };

    return React.createElement(
      Stack,
      { gap: "xs", px: "md", pb: "md" },
      React.createElement(Text, { fw: 600 }, "그래프 색상 구성"),
      React.createElement("input", {
        ref: importRef,
        type: "file",
        accept: ".json,application/json",
        hidden: true,
        onChange: loadPalette,
      }),
      React.createElement(
        Group,
        { gap: "xs", grow: true },
        React.createElement(
          Button,
          { variant: "light", disabled: busy || !canEdit, onClick: resetPalette },
          "기본색",
        ),
        React.createElement(
          Button,
          { variant: "light", disabled: busy || !chart, onClick: savePalette },
          "저장",
        ),
        React.createElement(
          Button,
          {
            variant: "light",
            disabled: busy || !canEdit,
            onClick: () => importRef.current?.click(),
          },
          "불러오기",
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

  function FastFigurePaletteActions() {
    const state = useAppState();
    const busy = state.lifecycle !== "ready";
    const [opened, setOpened] = useState(false);
    const [draft, setDraft] = useState(() => ({
      ...activeProject.appearance.uiPalette,
    }));
    const fields = [
      ["uiColor", "강조색"],
      ["uiBackgroundColor", "UI 배경"],
      ["uiSurfaceColor", "UI 표면"],
      ["uiMutedColor", "보조 텍스트"],
      ["uiSubtleColor", "약한 텍스트"],
      ["uiDisabledBgColor", "비활성 배경"],
      ["uiDisabledTextColor", "비활성 텍스트"],
      ["uiShadowColor", "그림자"],
      ["paperColor", "그래프 배경"],
      ["fontColor", "그래프 글자"],
    ];
    const openPalette = () => {
      setDraft({ ...activeProject.appearance.uiPalette });
      setOpened(true);
    };
    const applyPalette = () => {
      applyUiPaletteValues(draft);
      setOpened(false);
    };
    const resetPalette = () => {
      const defaults = { ...DEFAULT_UI_PALETTE };
      setDraft(defaults);
      applyUiPaletteValues(defaults);
    };

    return React.createElement(
      Stack,
      { gap: "xs", px: "md", pb: "md" },
      React.createElement(
        Button,
        { variant: "light", disabled: busy, onClick: openPalette },
        "UI 색상",
      ),
      React.createElement(
        Modal,
        {
          opened,
          onClose: () => setOpened(false),
          title: "UI 색상",
          centered: true,
          size: "lg",
        },
        React.createElement(
          Stack,
          { gap: "sm" },
          ...fields.map(([key, label]) =>
            React.createElement(ColorInput, {
              key,
              label,
              value: draft[key],
              disabled: busy,
              onChange: (value) =>
                setDraft((current) => ({ ...current, [key]: value })),
            }),
          ),
          React.createElement(
            Group,
            { justify: "space-between", gap: "xs" },
            React.createElement(
              Button,
              { variant: "light", disabled: busy, onClick: resetPalette },
              "기본값",
            ),
            React.createElement(
              Group,
              { gap: "xs" },
              React.createElement(
                Button,
                { variant: "light", onClick: () => setOpened(false) },
                "취소",
              ),
              React.createElement(
                Button,
                { disabled: busy, onClick: applyPalette },
                "적용",
              ),
            ),
          ),
        ),
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

  function FastFigureLayoutOverlay() {
    const state = useAppState();
    const [selectionRevision, setSelectionRevision] = useState(0);
    const [zoom, setZoom] = useState(() =>
      Number.isFinite(dashboardZoomIntent) ? dashboardZoomIntent : 100,
    );
    if (state.overlay !== "layout") return null;
    const busy = state.lifecycle !== "ready";
    const style = activeProject.layout.slotStyle;
    const visibleSlots = activeProject.slots.filter((slot) => !slot.hidden);
    void selectionRevision;

    const clamp = (value, fallback, min, max) => {
      const number = Number(value);
      return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
    };
    const commitStyle = (patch) => {
      activeProject.layout.slotStyle = { ...style, ...patch };
      applySlotStyle(false);
      applyDashboardZoom(false);
      schedulePlotResize();
    };
    const changeGrid = (patch) => {
      const rows = patch.rows ?? activeProject.gridRows;
      const cols = patch.cols ?? activeProject.gridCols;
      makeSlots(rows, cols);
      applySlotStyle(false);
      schedulePlotResize();
    };
    const toggleSlot = (slotId) => {
      if (layoutSelected.has(slotId)) layoutSelected.delete(slotId);
      else layoutSelected.add(slotId);
      setSelectionRevision((revision) => revision + 1);
      renderLayout();
    };
    const runLayoutCommand = (command) => {
      command();
      setSelectionRevision((revision) => revision + 1);
    };
    const changeZoom = (value) => {
      const next = clamp(value, 100, 50, 200);
      setZoom(next);
      applyDashboardZoom(false, next);
    };
    const commitZoom = () => commitDashboardScale("mantine-layout");
    const close = () => appFSM.send("CLOSE_OVERLAY", { reason: "mantine-layout" });

    return React.createElement(
      Modal,
      {
        opened: true,
        onClose: close,
        title: "레이아웃",
        size: "xl",
        centered: true,
        closeOnClickOutside: true,
        closeOnEscape: true,
        "data-fastfigure-overlay": "layout",
      },
      React.createElement(
        Stack,
        { gap: "md" },
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(NumberInput, {
            label: "행",
            value: activeProject.gridRows,
            min: 1,
            max: 8,
            allowDecimal: false,
            disabled: busy,
            onChange: (value) =>
              changeGrid({ rows: clamp(value, activeProject.gridRows, 1, 8) }),
          }),
          React.createElement(NumberInput, {
            label: "열",
            value: activeProject.gridCols,
            min: 1,
            max: 8,
            allowDecimal: false,
            disabled: busy,
            onChange: (value) =>
              changeGrid({ cols: clamp(value, activeProject.gridCols, 1, 8) }),
          }),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(NumberInput, {
            label: "기준 폭",
            value: style.referenceWidth,
            min: 100,
            max: 20000,
            disabled: busy,
            onChange: (value) =>
              commitStyle({ referenceWidth: clamp(value, style.referenceWidth, 100, 20000) }),
          }),
          React.createElement(NumberInput, {
            label: "간격",
            value: style.gap,
            min: 0,
            max: 2000,
            disabled: busy,
            onChange: (value) => commitStyle({ gap: clamp(value, style.gap, 0, 2000) }),
          }),
          React.createElement(NumberInput, {
            label: "바깥 여백",
            value: style.outerMargin,
            min: 0,
            max: 5000,
            disabled: busy,
            onChange: (value) => commitStyle({ outerMargin: clamp(value, style.outerMargin, 0, 5000) }),
          }),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(NumberInput, {
            label: "모서리 반경",
            value: style.radius,
            min: 0,
            max: 2000,
            disabled: busy,
            onChange: (value) => commitStyle({ radius: clamp(value, style.radius, 0, 2000) }),
          }),
          React.createElement(NumberInput, {
            label: "종횡비",
            value: style.aspect,
            min: 0.1,
            max: 10,
            step: 0.01,
            disabled: busy,
            onChange: (value) => commitStyle({ aspect: clamp(value, style.aspect, 0.1, 10) }),
          }),
          React.createElement(
            Button,
            {
              variant: style.showBorders ? "filled" : "light",
              disabled: busy,
              "aria-pressed": style.showBorders,
              onClick: () => commitStyle({ showBorders: !style.showBorders }),
            },
            "슬롯 외곽선",
          ),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(NumberInput, {
            label: "확대 비율 (%)",
            value: zoom,
            min: 50,
            max: 200,
            disabled: busy || dashboardZoomLocked,
            onChange: changeZoom,
            onBlur: commitZoom,
          }),
          React.createElement(
            Button,
            {
              variant: dashboardZoomLocked ? "filled" : "light",
              disabled: busy,
              "aria-pressed": dashboardZoomLocked,
              onClick: () => {
                const nextLocked = !dashboardZoomLocked;
                setDashboardZoomLocked(nextLocked);
                if (!nextLocked) setZoom(100);
              },
            },
            dashboardZoomLocked ? "크기 고정" : "크기 고정 해제",
          ),
          React.createElement(
            Button,
            {
              variant: "light",
              disabled: busy,
              onClick: () => {
                if (dashboardZoomLocked) setDashboardZoomLocked(false);
                setZoom(100);
                applyDashboardZoom(false, 100);
                commitDashboardScale("mantine-layout-reset");
              },
            },
            "100% 초기화",
          ),
        ),
        React.createElement(
          "div",
          {
            role: "grid",
            "aria-label": "레이아웃 슬롯 선택",
            style: {
              display: "grid",
              gridTemplateColumns: `repeat(${activeProject.gridCols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${activeProject.gridRows}, minmax(48px, 1fr))`,
              gap: 6,
              minHeight: 260,
              padding: 8,
              border: "1px solid var(--mantine-color-default-border)",
              borderRadius: "var(--mantine-radius-sm)",
            },
          },
          ...visibleSlots.map((slot) =>
            React.createElement(
              Button,
              {
                key: slot.id,
                variant: layoutSelected.has(slot.id) ? "filled" : "light",
                disabled: busy,
                onClick: () => toggleSlot(slot.id),
                style: {
                  gridColumn: `${slot.col} / span ${slot.colSpan}`,
                  gridRow: `${slot.row} / span ${slot.rowSpan}`,
                  minHeight: 48,
                },
              },
              `${slot.row},${slot.col}`,
            ),
          ),
        ),
        React.createElement(
          Group,
          { gap: "xs", grow: true },
          React.createElement(
            Button,
            {
              disabled: busy || layoutSelected.size < 2,
              onClick: () => runLayoutCommand(mergeSelected),
            },
            "선택 슬롯 합치기",
          ),
          React.createElement(
            Button,
            {
              variant: "light",
              disabled: busy || layoutSelected.size < 1,
              onClick: () => runLayoutCommand(splitSelected),
            },
            "선택 슬롯 나누기",
          ),
          React.createElement(
            Button,
            {
              variant: "subtle",
              disabled: busy || layoutSelected.size < 1,
              onClick: () => {
                layoutSelected.clear();
                setSelectionRevision((revision) => revision + 1);
                renderLayout();
              },
            },
            "선택 해제",
          ),
        ),
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
        React.createElement(FastFigureGraphDataEditor),
        React.createElement(FastFigureGraphLayoutEditor),
        React.createElement(FastFigureGraphPaletteActions),
        React.createElement(FastFigureGraphFileActions),
        React.createElement(FastFigurePaletteActions),
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
      React.createElement(FastFigureLayoutOverlay),
    );
  }

  window.FastFigureMantineUi = Object.freeze({
    FastFigureShell,
    FastFigureToolbar,
    FastFigureDataActions,
    FastFigureImageEditor,
    FastFigureProjectDataTree,
    FastFigureProjectActions,
    FastFigureGraphDataEditor,
    FastFigureGraphLayoutEditor,
    FastFigureGraphPaletteActions,
    FastFigureGraphFileActions,
    FastFigureLayoutOverlay,
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
