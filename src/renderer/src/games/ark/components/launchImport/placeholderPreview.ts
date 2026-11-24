import type { ArkLaunchImport } from "@shared/types";

/** Aperçu réaliste pour le skeleton du résumé (même hauteur que le vrai). */
export const PLACEHOLDER_PREVIEW: ArkLaunchImport = {
  launch: {
    map: "TheIsland_WP",
    port: 7777,
    queryPort: 27015,
    rconPort: 27020,
    maxPlayers: 70,
    battlEye: true,
    customArgs: "",
    saveDirectory: "",
    mods: [],
    launchOptions: { ServerPlatform: "ALL" },
  },
  iniKeys: ["SessionName"],
  lineSaveDirectory: "",
  worlds: [
    { saveDirectory: "", modifiedAt: Date.now(), profiles: 1, tribes: 1 },
  ],
  notices: [],
  conflicts: [],
  modSettings: { iniSections: [], files: [], serverApiPlugins: [] },
};
