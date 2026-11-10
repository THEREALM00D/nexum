import { ipcMain } from "electron/main";
import { shell } from "electron";
import { join } from "path";
import { mkdirSync } from "fs";
import type { IpcContext } from "../../../ipc/context";
import type { ModRegistry } from "../../../../shared/types";
import { ModRegistryClient } from "../ModRegistryClient";
import { ValheimModsManager } from "../ValheimModsManager";
import { installCodes } from "../installCodes";
import {
  installPendingMods,
  readPendingMods,
  writePendingMods,
} from "../pendingMods";
import { shareModpack } from "../modpackExport";

function getManager(ctx: IpcContext, serverId?: string): ValheimModsManager {
  return new ValheimModsManager(
    ctx.getServerPath(serverId),
    ctx.getModsDataDir(serverId),
  );
}

const progressTo = (event: Electron.IpcMainInvokeEvent) => (msg: string) =>
  event.sender.send("valheim:mods:progress", msg);

// Import de profil : le r2x ne dit pas d'où vient chaque mod.
const installProfileCodes = (
  manager: ValheimModsManager,
  codes: string[],
  event: Electron.IpcMainInvokeEvent,
) =>
  installCodes(
    manager,
    codes.map((code) => ({ code })),
    progressTo(event),
  );

export function registerValheimModsHandlers(ctx: IpcContext): void {
  // --- Mods d'un serveur importé depuis un autre PC (pendingMods.ts) ---
  ipcMain.handle("valheim:mods:getPending", (_, serverId?: string) =>
    readPendingMods(ctx.getModsDataDir(serverId)),
  );
  ipcMain.handle("valheim:mods:installPending", (event, serverId?: string) =>
    installPendingMods(
      getManager(ctx, serverId),
      ctx.getModsDataDir(serverId),
      progressTo(event),
    ),
  );
  ipcMain.handle("valheim:mods:dismissPending", (_, serverId?: string) =>
    writePendingMods(ctx.getModsDataDir(serverId), []),
  );

  // --- Parcourir un registre (public, sans clé API) ---

  ipcMain.handle("valheim:mods:getTrending", (_, registry: ModRegistry) =>
    ModRegistryClient.getTrending(registry),
  );

  ipcMain.handle("valheim:mods:getLatestAdded", (_, registry: ModRegistry) =>
    ModRegistryClient.getLatestAdded(registry),
  );

  ipcMain.handle("valheim:mods:getLatestUpdated", (_, registry: ModRegistry) =>
    ModRegistryClient.getLatestUpdated(registry),
  );

  ipcMain.handle(
    "valheim:mods:search",
    (_, registry: ModRegistry, query: string) =>
      ModRegistryClient.search(registry, query),
  );

  ipcMain.handle(
    "valheim:mods:getModFiles",
    (_, registry: ModRegistry, namespace: string, name: string) =>
      ModRegistryClient.getPackage(registry, namespace, name).then(
        ModRegistryClient.toModFiles,
      ),
  );

  // --- Gestion locale des mods installés ---

  ipcMain.handle("valheim:mods:detectBepInEx", (_, serverId?: string) =>
    getManager(ctx, serverId).detectBepInEx(),
  );

  ipcMain.handle("valheim:mods:list", (_, serverId?: string) =>
    getManager(ctx, serverId).list(),
  );

  ipcMain.handle("valheim:mods:openPluginsFolder", (_, serverId?: string) => {
    const dir = join(ctx.getServerPath(serverId), "BepInEx", "plugins");
    mkdirSync(dir, { recursive: true });
    return shell.openPath(dir);
  });

  ipcMain.handle("valheim:mods:openConfigFolder", (_, serverId?: string) => {
    const dir = join(ctx.getServerPath(serverId), "BepInEx", "config");
    mkdirSync(dir, { recursive: true });
    return shell.openPath(dir);
  });

  ipcMain.handle("valheim:mods:remove", (_, modId: number, serverId?: string) =>
    getManager(ctx, serverId).remove(modId),
  );

  ipcMain.handle(
    "valheim:mods:toggle",
    (_, modId: number, enabled: boolean, serverId?: string) =>
      getManager(ctx, serverId).toggle(modId, enabled),
  );

  ipcMain.handle(
    "valheim:mods:installBepInEx",
    async (event, serverId?: string) =>
      getManager(ctx, serverId).installBepInEx((msg) =>
        event.sender.send("valheim:mods:progress", msg),
      ),
  );

  // Partage du modpack : code de profil r2modman/Gale pour les joueurs.
  ipcMain.handle("valheim:mods:shareModpack", (_, serverId?: string) => {
    const name =
      ctx.servers
        .list()
        .find((s) => s.id === (serverId ?? ctx.getActiveServer()?.id))?.name ??
      "Nexum";
    return shareModpack(getManager(ctx, serverId).list(), name);
  });

  ipcMain.handle(
    "valheim:mods:installMod",
    async (event, registry: ModRegistry, code: string, serverId?: string) =>
      getManager(ctx, serverId).installMod(registry, code, (msg) =>
        event.sender.send("valheim:mods:progress", msg),
      ),
  );

  ipcMain.handle(
    "valheim:mods:importProfile",
    async (event, base64Code: string, serverId?: string) => {
      const manager = getManager(ctx, serverId);
      const codes = await manager.parseThunderstoreProfile(base64Code);
      return installProfileCodes(manager, codes, event);
    },
  );

  // Import d'un profil r2modman/Gale depuis un fichier .r2z/.zip local
  // (bouton "Exporter en tant que fichier" — distinct du code en ligne).
  ipcMain.handle(
    "valheim:mods:importProfileFile",
    async (event, filePath: string, serverId?: string) => {
      const manager = getManager(ctx, serverId);
      const codes = await manager.parseThunderstoreProfileFile(filePath);
      return installProfileCodes(manager, codes, event);
    },
  );

  ipcMain.handle(
    "valheim:mods:getMissingDeps",
    (
      _,
      registry: ModRegistry,
      namespace: string,
      name: string,
      installedCodes: string[],
    ) =>
      ModRegistryClient.getMissingDeps(
        registry,
        namespace,
        name,
        installedCodes,
      ),
  );

  ipcMain.handle(
    "valheim:mods:checkUpdates",
    (_, entries: { code: string; registry: ModRegistry }[]) =>
      ModRegistryClient.checkUpdates(entries),
  );

  // --- Fichiers de config BepInEx (BepInEx/config/*.cfg) ---

  ipcMain.handle("valheim:mods:listConfigFiles", (_, serverId?: string) =>
    getManager(ctx, serverId).listConfigFiles(),
  );

  ipcMain.handle(
    "valheim:mods:readConfigFile",
    (_, fileName: string, serverId?: string) =>
      getManager(ctx, serverId).readConfigFile(fileName),
  );

  ipcMain.handle(
    "valheim:mods:writeConfigFile",
    (_, fileName: string, content: string, serverId?: string) =>
      getManager(ctx, serverId).writeConfigFile(fileName, content),
  );
}
