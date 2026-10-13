import { BrowserWindow } from "electron/main";
import type { IpcContext } from "../../ipc/context";
import type { ModRegistry, ModUpdateNotice } from "../../../shared/types";
import { ModRegistryClient } from "./ModRegistryClient";
import { ValheimModsManager } from "./ValheimModsManager";

/**
 * Au démarrage d'un serveur Valheim, vérifie en arrière-plan si ses mods
 * actifs ont une mise à jour (ou sont dépréciés) : après un patch du jeu, un
 * mod pas à jour peut faire planter le serveur ou refuser les joueurs.
 *
 * Même règles que `checkGameUpdateOnStart` : appelée APRÈS `start()` sans être
 * attendue, silencieuse si les registres ne répondent pas, résultat écrit
 * dans la session de log et notification si quelque chose est à faire.
 */
export async function checkModUpdatesOnStart(
  ctx: IpcContext,
  id: string,
): Promise<void> {
  const mods = new ValheimModsManager(
    ctx.getServerPath(id),
    ctx.getModsDataDir(id),
  )
    .list()
    .filter(
      (m) =>
        m.enabled &&
        m.thunderstoreCode &&
        (m.source === "thunderstore" || m.source === "hexium"),
    );
  if (mods.length === 0) return;

  const { updates, deprecatedCodes } = await ModRegistryClient.checkUpdates(
    mods.map((m) => ({
      code: m.thunderstoreCode as string,
      registry: m.source as ModRegistry,
    })),
  );
  const mgr = ctx.serverManagers.getOrCreate(id);

  if (updates.length === 0 && deprecatedCodes.length === 0) {
    mgr.log(`[Manager] Mods à jour (${mods.length} vérifiés).`);
    return;
  }
  if (updates.length > 0) {
    mgr.log(
      `[Manager] ${updates.length} mod(s) ont une mise à jour : ${updates
        .map((u) => `${u.name} → v${u.latestVersion}`)
        .join(", ")}. Mettez-les à jour depuis la page Mods (serveur arrêté).`,
    );
  }
  if (deprecatedCodes.length > 0) {
    mgr.log(
      `[Manager] ${deprecatedCodes.length} mod(s) dépréciés par leur auteur : ${deprecatedCodes.join(", ")}.`,
    );
  }

  const notice: ModUpdateNotice = {
    serverId: id,
    updates: updates.length,
    deprecated: deprecatedCodes.length,
  };
  BrowserWindow.getAllWindows().forEach((w) =>
    w.webContents.send("valheim:modUpdatesAvailable", notice),
  );
}
