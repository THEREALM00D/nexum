import type {
  AdminCapabilities,
  RemoteAdminUnavailable,
} from "../../shared/types";
import type { IpcContext } from "../ipc/context";
import { getGameSaveRequest } from "../games/saveRequests";
import { createGracefulShutdown } from "./shutdownClient";
import { toAsciiChatText } from "../../shared/chatText";
import { AppError, appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";

// Commandes du menu « ⋯ » du Dashboard : sauvegarder maintenant, envoyer un
// message aux joueurs, tuer le processus. Toujours pour un `serverId`
// explicite, jamais le serveur actif du main.

function serverOf(ctx: IpcContext, serverId: string) {
  const server = ctx.servers
    .list()
    .find((candidate) => candidate.id === serverId);
  if (!server) throw new AppError("SERVER_NOT_FOUND", { id: serverId });
  return server;
}

function saveRequest(ctx: IpcContext, serverId: string) {
  const server = serverOf(ctx, serverId);
  return getGameSaveRequest(
    server.gameType,
    server.path,
    ctx.configParser,
    ctx.getServerConfig(serverId),
  );
}

/**
 * Ce que le jeu permet (API REST, RCON) : chaque commande est disponible
 * (null) ou a une raison de ne pas l'être, affichée en infobulle.
 */
export function getAdminCapabilities(
  ctx: IpcContext,
  serverId: string,
): AdminCapabilities {
  const request = saveRequest(ctx, serverId);
  const saveUnavailable: RemoteAdminUnavailable | null =
    "unavailable" in request ? request.unavailable : null;
  const graceful = createGracefulShutdown(ctx.getStopConfig(serverId));
  return {
    save: saveUnavailable,
    // Même accès que la sauvegarde (API REST, RCON) : même raison.
    announce: graceful ? null : (saveUnavailable ?? "noCommand"),
    asciiChat: graceful?.asciiChat === true,
    players: ctx.getOnlinePlayers(serverId),
  };
}

function requireRunning(ctx: IpcContext, serverId: string) {
  const manager = ctx.serverManagers.getOrCreate(serverId);
  if (manager.getStatus() !== "running")
    throw new AppError("SERVER_NOT_RUNNING");
  return manager;
}

/** Sauvegarde du monde demandée au jeu (ARK : `SaveWorld`, Palworld : API). */
export async function saveNow(
  ctx: IpcContext,
  serverId: string,
): Promise<void> {
  const manager = requireRunning(ctx, serverId);
  const request = saveRequest(ctx, serverId);
  if (!("run" in request)) throw new AppError("REMOTE_ADMIN_UNAVAILABLE");
  manager.log(managerLine(lt().saveNowRequested));
  try {
    await request.run();
    manager.log(managerLine(lt().saveNowDone));
  } catch (error) {
    const message = (error as Error).message;
    manager.log(managerLine(lt().saveRequestFailed(appErrorLogText(message))));
    throw error;
  }
}

/** Message aux joueurs, par le même client que les annonces de redémarrage. */
export async function sendMessage(
  ctx: IpcContext,
  serverId: string,
  message: string,
): Promise<void> {
  const manager = requireRunning(ctx, serverId);
  const text = message.trim();
  if (!text) return;
  const graceful = createGracefulShutdown(ctx.getStopConfig(serverId));
  if (!graceful) throw new AppError("REMOTE_ADMIN_UNAVAILABLE");
  // Que des caractères que le jeu retire (émojis…) : rien à envoyer.
  if (graceful.asciiChat && !toAsciiChatText(text).trim()) return;
  try {
    await graceful.client.announce(text);
    manager.log(managerLine(lt().announceSent(text)));
  } catch (error) {
    const reason = appErrorLogText((error as Error).message);
    manager.log(managerLine(graceful.unavailableLine(reason)));
    throw error;
  }
}

/** Arrêt forcé, sans annonce ni sauvegarde (`ServerManager.kill`). */
export async function killServer(
  ctx: IpcContext,
  serverId: string,
): Promise<{ success: boolean; error?: string }> {
  serverOf(ctx, serverId);
  const manager = ctx.serverManagers.getOrCreate(serverId);
  // Pas lancé : `stop()` écrit le refus, sans ligne « arrêt forcé ».
  if (manager.getPid() && manager.getStatus() !== "stopped")
    manager.log(managerLine(lt().killRequested));
  return manager.kill();
}
