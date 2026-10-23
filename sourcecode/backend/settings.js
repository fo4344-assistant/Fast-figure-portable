// Shared configuration: sourcescript/backend/settings.json.
// Physical configuration reader/constants used by the Backend modules; not a second settings source.

export function readBackendSettings() {
  const config = JSON.parse(document.getElementById("ff-backend-settings").textContent);
  if (!config.backend?.project_object || !config.backend?.defaults)
    throw Error("Backend 설정 원천이 올바르지 않습니다.");
  const freeze = (value) => {
    if (value && typeof value === "object") {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  };
  return freeze(config.backend);
}

export const BackendSettings = readBackendSettings();

export const PACKAGE_FORMAT_VERSION = BackendSettings.project_object.ffpx.formatVersion;

export const APP_BUILD = "1.1.43-wip";

export const PROJECT_OBJECT_PATHS = Object.freeze({
  project: "meta",
  layout: "layout",
  labels: "annotations.labels",
  captions: "annotations.captions",
  data: "assets.csvFiles",
  images: "assets.images",
  files: "fileSystem",
  charts: "charts",
  slots: "slots",
  sequences: "nextId",
  appearance: "appearance",
  export: "export",
});

export const DEFAULT_SLOT_STYLE = BackendSettings.project_object.layout.slotStyle;

export const DEFAULT_UI_PALETTE = BackendSettings.project_object.appearance.uiPalette;

export const DEFAULT_COLORS = BackendSettings.defaults.graphColors;

export const DEFAULT_IMAGE_SETTINGS = BackendSettings.defaults.slotSettings.content.imageSettings;

export const SLOT_LOCAL_DEFAULTS = Object.freeze({
  chart: null,
  imageId: null,
  contentType: "graph",
  imageSettings: DEFAULT_IMAGE_SETTINGS,
  caption: null,
});
