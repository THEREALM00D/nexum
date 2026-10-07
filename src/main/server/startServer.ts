import type { IpcContext } from "../ipc/context";
import {
  detectPortConflicts,
  formatConflictsError,
} from "../servers/portConflicts";
import {
  buildGameArgs,
  getGameEnv,
  getGameServerConfig,
} from "../games/registry";
import { ValheimModsManager } from "../games/valheim/ValheimModsManager";

// Liste les mods BepInEx actifs dans la console au démarrage — Valheim ne
// donne aucune indication en jeu de ce qui est chargé côté serveur.
export function logActiveValheimMods(
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

/**
 * Démarre un serveur avec toutes les vérifications préalables. Point d'entrée
 * UNIQUE : bouton Démarrer (IPC `server:start`) ET démarrage automatique à
 * l'ouverture de Nexum — les deux chemins doivent appliquer les mêmes règles.
 */
export async function startServer(
  ctx: IpcContext,
  id: string,
  sendLog: (line: string) => void,
): Promise<{ success: boolean; error?: string }> {
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

  // Valheim quitte silencieusement (code 0) quelques secondes après le
  // démarrage si le mot de passe fait moins de 5 caractères ou apparaît dans
  // le nom du serveur (notes du script officiel start_headless_server.bat).
  // On bloque en amont plutôt que de laisser l'utilisateur deviner.
  if (gameType === "valheim") {
    const { password, name } = ctx.getServerConfig(id).valheimConfig;
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

  const mgr = ctx.serverManagers.getOrCreate(id);
  const res = await mgr.start(
    serverPath,
    exeName,
    args,
    sendLog,
    getGameEnv(gameType),
  );
  // Après start() : le démarrage ouvre une nouvelle session de log (vue vidée,
  // nouveau fichier), la liste des mods doit y figurer.
  if (res.success && gameType === "valheim") {
    logActiveValheimMods(ctx, id, (line) => mgr.log(line));
  }
  return res;
}

/**
 * Démarre les serveurs marqués « démarrage automatique » (`Server.autoStart`)
 * à l'ouverture de Nexum. Appelé APRÈS l'adoption des process existants : un
 * serveur déjà en cours (orphelin d'une session précédente) n'est pas relancé.
 * Échelonné de quelques secondes pour ne pas lancer tous les serveurs d'un
 * coup (SteamCMD, disque, ports).
 */
export async function autoStartServers(
  ctx: IpcContext,
  broadcastLog: (serverId: string, line: string) => void,
): Promise<void> {
  const toStart = ctx.servers.list().filter((s) => s.autoStart);
  for (const [i, server] of toStart.entries()) {
    const status = ctx.serverManagers.getOrCreate(server.id).getStatus();
    if (status === "running" || status === "starting") continue;
    if (i > 0) await new Promise((r) => setTimeout(r, 5000));
    const log = (line: string) => broadcastLog(server.id, line);
    const res = await startServer(ctx, server.id, log).catch((e: Error) => ({
      success: false,
      error: e.message,
    }));
    if (res.success) {
      ctx.serverManagers
        .getOrCreate(server.id)
        .log("[Manager] Démarré automatiquement à l'ouverture de Nexum.");
    } else {
      log(`[Manager] Démarrage automatique impossible : ${res.error}`);
    }
  }
}
