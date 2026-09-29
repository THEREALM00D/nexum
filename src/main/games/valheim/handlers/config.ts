import { ipcMain } from "electron/main";
import { join } from "path";
import { homedir } from "os";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { shell } from "electron";
import type { IpcContext } from "../../../ipc/context";
import type {
  ValheimLaunchConfig,
  ValheimWorldInfo,
} from "../../../../shared/types";

// Retourne le dossier de base des données Valheim (custom savedir ou LocalAppData\Low\IronGate\Valheim).
function getValheimDataDir(savedir: string): string {
  return (
    savedir || join(homedir(), "AppData", "LocalLow", "IronGate", "Valheim")
  );
}

function readList(filePath: string): string[] {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, "utf-8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function writeList(filePath: string, list: string[]): void {
  const dir = join(filePath, "..");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, list.join("\r\n"), "utf-8");
}

// Scanne worlds_local pour proposer les mondes déjà existants sur disque —
// permet d'importer un serveur déjà installé sans retaper le nom exact du
// monde à la main. Deux formats possibles : ancien (fichiers `<nom>.fwl` +
// `<nom>.db` à plat) et nouveau format "chunked" (un dossier `<nom>/`
// contenant des fichiers `_main.*.db2`/`.chunks`). Les sauvegardes
// automatiques de Valheim lui-même (`<nom>_backup...`) et les fichiers
// `.old` sont exclus — ce ne sont pas des mondes distincts.
function listExistingWorlds(savedir: string): ValheimWorldInfo[] {
  const worldsDir = join(getValheimDataDir(savedir), "worlds_local");
  if (!existsSync(worldsDir)) return [];

  const found = new Map<string, number>();
  for (const entry of readdirSync(worldsDir, { withFileTypes: true })) {
    if (entry.name.includes("_backup") || entry.name.endsWith(".old")) continue;

    let name: string | null = null;
    if (entry.isDirectory()) {
      name = entry.name;
    } else if (entry.name.endsWith(".fwl")) {
      name = entry.name.slice(0, -".fwl".length);
    }
    if (!name) continue;

    try {
      const mtime = statSync(join(worldsDir, entry.name)).mtimeMs;
      const prev = found.get(name);
      if (!prev || mtime > prev) found.set(name, mtime);
    } catch {
      // ignore
    }
  }

  return [...found.entries()]
    .map(([name, lastModified]) => ({ name, lastModified }))
    .sort((a, b) => b.lastModified - a.lastModified);
}

export function registerValheimHandlers(ctx: IpcContext): void {
  ipcMain.handle("valheim:getConfig", (_, serverId?: string) =>
    ctx.getValheimConfig(serverId),
  );

  ipcMain.handle(
    "valheim:setConfig",
    (_, cfg: Partial<ValheimLaunchConfig>, serverId?: string) => {
      ctx.updateValheimConfig(serverId, cfg);
    },
  );

  // Ouvre le dossier de sauvegardes Valheim : chemin custom si défini, sinon
  // le dossier par défaut (%LOCALAPPDATA_LOW%\IronGate\Valheim\worlds).
  ipcMain.handle("valheim:openSaveFolder", (_, customSavedir: string) => {
    const target = join(getValheimDataDir(customSavedir), "worlds_local");
    if (!existsSync(target)) mkdirSync(target, { recursive: true });
    return shell.openPath(target);
  });

  ipcMain.handle("valheim:listExistingWorlds", (_, customSavedir: string) =>
    listExistingWorlds(customSavedir),
  );

  // --- Listes de contrôle d'accès ---

  ipcMain.handle("valheim:getAdminList", (_, serverId?: string) => {
    const cfg = ctx.getValheimConfig(serverId);
    return readList(join(getValheimDataDir(cfg.savedir), "adminlist.txt"));
  });

  ipcMain.handle(
    "valheim:setAdminList",
    (_, list: string[], serverId?: string) => {
      const cfg = ctx.getValheimConfig(serverId);
      writeList(join(getValheimDataDir(cfg.savedir), "adminlist.txt"), list);
    },
  );

  ipcMain.handle("valheim:getBannedList", (_, serverId?: string) => {
    const cfg = ctx.getValheimConfig(serverId);
    return readList(join(getValheimDataDir(cfg.savedir), "bannedlist.txt"));
  });

  ipcMain.handle(
    "valheim:setBannedList",
    (_, list: string[], serverId?: string) => {
      const cfg = ctx.getValheimConfig(serverId);
      writeList(join(getValheimDataDir(cfg.savedir), "bannedlist.txt"), list);
    },
  );

  ipcMain.handle("valheim:getPermittedList", (_, serverId?: string) => {
    const cfg = ctx.getValheimConfig(serverId);
    return readList(join(getValheimDataDir(cfg.savedir), "permittedlist.txt"));
  });

  ipcMain.handle(
    "valheim:setPermittedList",
    (_, list: string[], serverId?: string) => {
      const cfg = ctx.getValheimConfig(serverId);
      writeList(
        join(getValheimDataDir(cfg.savedir), "permittedlist.txt"),
        list,
      );
    },
  );
}
