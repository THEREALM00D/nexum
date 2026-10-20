import type { IpcContext } from "../ipc/context";
import {
  detectPortConflicts,
  formatConflictsError,
} from "../servers/portConflicts";
import { getGamePorts, getLaunchSpec } from "../games/registry";
import type { GamePort } from "../games/ports";
import type { StopConfig } from "./ServerManager";
import type { Server } from "../../shared/types";
import { ValheimModsManager } from "../games/valheim/ValheimModsManager";
import { checkModUpdatesOnStart } from "../games/valheim/modUpdateCheck";
import { checkGameUpdateOnStart } from "./gameUpdateCheck";
import { appError, appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";

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
        ? managerLine(
            lt().activeMods(
              active.length,
              active.map((m) => `${m.name} v${m.version}`).join(", "),
            ),
          )
        : managerLine(lt().noActiveMods),
    );
  } catch {
    // best-effort — ne doit jamais empêcher le démarrage du serveur
  }
}

/** Ports d'un serveur d'après sa config, null si elle est illisible. */
function readServerPorts(ctx: IpcContext, server: Server): GamePort[] | null {
  if (!server.path) return null;
  try {
    return getGamePorts(
      server.gameType,
      server.path,
      ctx.getServerConfig(server.id),
      { palworld: ctx.configParser, astroneer: ctx.astroConfigParser },
    );
  } catch {
    return null;
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

  // Refuse de démarrer si un autre serveur déjà lancé (tous jeux confondus)
  // utilise un des mêmes ports. Évite un serveur qui plante en silence sur
  // EADDRINUSE — ou qui reste lancé sans être joignable — et laisse
  // l'utilisateur deviner.
  const conflicts = detectPortConflicts(
    id,
    ctx.servers,
    ctx.serverManagers,
    (s) => readServerPorts(ctx, s),
  );
  if (conflicts.length > 0) {
    return { success: false, error: formatConflictsError(conflicts) };
  }

  // Valheim quitte silencieusement (code 0) quelques secondes après le
  // démarrage si le mot de passe fait moins de 5 caractères ou apparaît dans
  // le nom du serveur (notes du script officiel start_headless_server.bat).
  // On bloque en amont plutôt que de laisser l'utilisateur deviner.
  if (gameType === "valheim") {
    const { password, name } = ctx.getServerConfig(id).valheimConfig;
    if (password && name.includes(password)) {
      return { success: false, error: appError("VALHEIM_PASSWORD_IN_NAME") };
    }
    if (password && password.length < 5) {
      return { success: false, error: appError("VALHEIM_PASSWORD_TOO_SHORT") };
    }
  }

  const serverPath = ctx.getServerPath(id);
  const spec = getLaunchSpec(gameType, serverPath, ctx.getServerConfig(id));

  const mgr = ctx.serverManagers.getOrCreate(id);
  const res = await mgr.start(serverPath, spec, sendLog);
  // Après start() : le démarrage ouvre une nouvelle session de log (vue vidée,
  // nouveau fichier), la liste des mods doit y figurer.
  if (res.success && gameType === "valheim") {
    logActiveValheimMods(ctx, id, (line) => mgr.log(line));
  }
  // Non attendues : SteamCMD peut mettre jusqu'à 30 s à répondre, et la
  // liste des registres de mods est lourde. Best-effort : une vérification
  // ratée ne concerne pas le démarrage.
  if (res.success) {
    checkGameUpdateOnStart(ctx, id).catch(() => {});
    if (gameType === "valheim") {
      checkModUpdatesOnStart(ctx, id).catch(() => {});
    }
  }
  return res;
}

/**
 * Redémarre un serveur (arrêt propre puis démarrage). Partagé par l'IPC
 * `server:restart`, le menu de l'icône de la zone de notification et le
 * redémarrage planifié (qui passe sa propre config d'arrêt : annonce +
 * délai d'avertissement).
 */
export async function restartServer(
  ctx: IpcContext,
  id: string,
  sendLog: (line: string) => void,
  stopConfig: StopConfig = ctx.getStopConfig(id),
): Promise<{ success: boolean; error?: string }> {
  const server = ctx.servers.list().find((s) => s.id === id);
  const gameType = server?.gameType ?? "palworld";
  const serverPath = ctx.getServerPath(id);
  const mgr = ctx.serverManagers.getOrCreate(id);
  const res = await mgr.restart(
    serverPath,
    getLaunchSpec(gameType, serverPath, ctx.getServerConfig(id)),
    sendLog,
    stopConfig,
  );
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
  // Pas en dev : `yarn dev` (et les tests automatisés) partagent le dossier
  // de données de l'app installée, donc ses VRAIS serveurs — chaque lancement
  // les démarrait, puis les coupait net à la fermeture. NEXUM_DEV_AUTOSTART=1
  // pour tester la fonction elle-même.
  if (!ctx.app.isPackaged && process.env.NEXUM_DEV_AUTOSTART !== "1") return;

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
        .log(managerLine(lt().autoStarted));
    } else {
      log(managerLine(lt().autoStartFailed(appErrorLogText(res.error ?? ""))));
    }
  }
}
