import { ipcMain } from "electron/main";
import type { Server } from "../../../shared/types";
import type { IpcContext } from "../context";
import type { ServerRegistry } from "../../servers/ServerRegistry";
import { detectGameType, hasExpectedExe } from "../../servers/detectGameType";

export function registerServersHandlers(
  ctx: IpcContext,
  registry: ServerRegistry,
): void {
  ipcMain.handle("servers:list", () => registry.list());
  // Devine le type de jeu (et confirme la présence de son exécutable) d'un
  // dossier existant — utilisé par le dialogue d'ajout de serveur pour
  // importer une installation déjà présente sur le disque.
  ipcMain.handle("servers:detectGameType", (_, path: string) =>
    detectGameType(path),
  );
  ipcMain.handle(
    "servers:hasExpectedExe",
    (_, path: string, gameType: Server["gameType"]) =>
      hasExpectedExe(path, gameType),
  );
  ipcMain.handle("servers:getActive", () => registry.getActive());
  ipcMain.handle("servers:setActive", (_, id: string | null) => {
    registry.setActive(id);
  });
  ipcMain.handle(
    "servers:create",
    (
      _,
      input: {
        name: string;
        path: string;
        gameType?: Server["gameType"];
        color?: string | null;
      },
    ) => registry.create(input),
  );
  ipcMain.handle(
    "servers:update",
    (_, id: string, patch: Partial<Omit<Server, "id" | "createdAt">>) =>
      registry.update(id, patch),
  );
  ipcMain.handle("servers:delete", async (_, id: string) => {
    // Arrête le process (owned ou adopté) avant de retirer le serveur pour
    // ne pas l'orpheliner — plus aucun moyen de le stopper depuis l'UI une
    // fois le serveur retiré du registre.
    await ctx.serverManagers.remove(id);
    ctx.playerHistories.remove(id);
    registry.delete(id);
    // Nettoie la config stockée du serveur (sans toucher au filesystem :
    // les .zip de backup et le history.json restent dans
    // {userData}/servers/<id>/ — l'utilisateur peut les supprimer manuellement
    // s'il veut, ou les récupérer en cas de suppression accidentelle).
    ctx.removeServerConfig(id);
  });
}
