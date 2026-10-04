import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type { LaunchArgsConfig, ServerStatus } from "../../../shared/types";
import {
  detectPortConflicts,
  formatConflictsError,
} from "../../servers/portConflicts";
import {
  buildGameArgs,
  getGameEnv,
  getGameServerConfig,
} from "../../games/registry";
import { ValheimModsManager } from "../../games/valheim/ValheimModsManager";

// Liste les mods BepInEx actifs dans la console au démarrage — Valheim ne
// donne aucune indication en jeu de ce qui est chargé côté serveur.
function logActiveValheimMods(
  ctx: IpcContext,
  id: string,
  send: (line: string) => void,
): void {
  try {
    const manager = new ValheimModsManager(
      ctx.getServerPath(id),
      ctx.getModsDataDir(id),
    );
    const active = manager.list().filter((m) => m.enabled);
    send(
      active.length > 0
        ? `[Manager] Mods actifs (${active.length}) : ${active
            .map((m) => `${m.name} v${m.version}`)
            .join(", ")}`
        : "[Manager] Aucun mod actif.",
    );
  } catch {
    // best-effort — ne doit jamais empêcher le démarrage du serveur
  }
}

export function registerServerHandlers(ctx: IpcContext): void {
  // Résout un serverId argumenté en serveur du registre. Fallback : actif.
  const resolveId = (id: string | undefined): string => {
    const resolved = id ?? ctx.getActiveServer()?.id ?? null;
    if (!resolved) throw new Error("Aucun serveur actif configuré");
    return resolved;
  };

  ipcMain.handle("server:start", async (event, serverId?: string) => {
    const id = resolveId(serverId);
    const server = ctx.servers.list().find((s) => s.id === id);
    const gameType = server?.gameType ?? "palworld";

    // Refuse de démarrer si un autre serveur déjà running utilise les mêmes
    // ports (game/RCON/REST). Évite que PalServer.exe plante silencieusement
    // sur EADDRINUSE et laisse l'utilisateur deviner.
    if (gameType === "palworld") {
      const conflicts = detectPortConflicts(
        id,
        ctx.servers,
        ctx.serverManagers,
        ctx.configParser,
      );
      if (conflicts.length > 0) {
        return { success: false, error: formatConflictsError(conflicts) };
      }
    }

    // Valheim refuse de démarrer si un mot de passe est défini mais fait
    // moins de 5 caractères — sans crash ni message clair côté serveur, le
    // process quitte juste silencieusement (code 0) après avoir échoué à
    // générer le monde. On bloque en amont plutôt que de laisser
    // l'utilisateur deviner pourquoi le serveur ne démarre jamais.
    if (gameType === "valheim") {
      const { password, name } = ctx.getServerConfig(id).valheimConfig;
      // Valheim refuse aussi un mot de passe contenu dans le nom du serveur
      // (note du script officiel start_headless_server.bat) — même symptôme :
      // arrêt silencieux quelques secondes après le démarrage.
      if (password && name.includes(password)) {
        return {
          success: false,
          error:
            "Le mot de passe Valheim ne doit pas apparaître dans le nom du serveur.",
        };
      }
      if (password && password.length < 5) {
        return {
          success: false,
          error:
            "Le mot de passe Valheim doit faire au moins 5 caractères (ou être vide).",
        };
      }
    }

    const serverPath = ctx.getServerPath(id);
    const exeName = getGameServerConfig(gameType).exeName;
    const args = buildGameArgs(gameType, ctx.getServerConfig(id));
    const sendLog = (line: string) =>
      event.sender.send("server:log", { serverId: id, line });

    if (gameType === "valheim") logActiveValheimMods(ctx, id, sendLog);

    return ctx.serverManagers
      .getOrCreate(id)
      .start(serverPath, exeName, args, sendLog, getGameEnv(gameType));
  });

  ipcMain.handle("server:stop", (_, serverId?: string) => {
    const id = resolveId(serverId);
    return ctx.serverManagers.getOrCreate(id).stop(ctx.getStopConfig(id));
  });

  ipcMain.handle("server:restart", async (event, serverId?: string) => {
    const id = resolveId(serverId);
    const server = ctx.servers.list().find((s) => s.id === id);
    const gameType = server?.gameType ?? "palworld";
    const serverPath = ctx.getServerPath(id);
    const exeName = getGameServerConfig(gameType).exeName;
    const args = buildGameArgs(gameType, ctx.getServerConfig(id));
    const sendLog = (line: string) =>
      event.sender.send("server:log", { serverId: id, line });

    if (gameType === "valheim") logActiveValheimMods(ctx, id, sendLog);

    return ctx.serverManagers
      .getOrCreate(id)
      .restart(
        serverPath,
        exeName,
        args,
        sendLog,
        ctx.getStopConfig(id),
        getGameEnv(gameType),
      );
  });

  // Compat : status du serveur actif. Retourne "stopped" si aucun actif.
  ipcMain.handle(
    "server:status",
    () => ctx.serverManagers.getActive()?.getStatus() ?? "stopped",
  );

  // Phase 5 : statuses agrégés pour tous les serveurs configurés.
  ipcMain.handle("server:statuses", (): Record<string, ServerStatus> =>
    ctx.serverManagers.statuses(),
  );

  // Launch arguments — stockés par-serveur. serverId optionnel = actif.
  ipcMain.handle(
    "server:getLaunchArgs",
    (_, serverId?: string) => ctx.getServerConfig(serverId).launchArgs,
  );
  ipcMain.handle(
    "server:setLaunchArgs",
    (_, cfg: LaunchArgsConfig, serverId?: string) => {
      ctx.updateServerConfig(serverId, { launchArgs: cfg });
    },
  );

  // Palworld .ini config
  ipcMain.handle("palconfig:read", async (_, serverId?: string) => {
    return ctx.configParser.read(ctx.getServerPath(serverId));
  });
  ipcMain.handle(
    "palconfig:write",
    async (
      _,
      settings: Record<string, string | number | boolean>,
      serverId?: string,
    ) => {
      return ctx.configParser.write(ctx.getServerPath(serverId), settings);
    },
  );
}
