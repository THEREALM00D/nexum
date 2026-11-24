import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import type {
  ArkLaunchImport,
  ArkLaunchLineSource,
} from "../../../../shared/types";
import { arkConfigLockedError } from "./configLock";
import { readServerPorts } from "../../../server/startServer";
import { findPortClashes } from "../../../servers/portConflicts";
import { arkServerConfig } from "../serverConfig";
import {
  launchLineFromLogs,
  launchLineFromScript,
} from "../launchImport/launchLineSources";
import {
  applyLaunchImport,
  previewLaunchImport,
} from "../launchImport/launchImport";

type Result = { success: boolean; error?: string };

const isText = (value: unknown): value is string => typeof value === "string";

// Import de la ligne de lancement d'un serveur ARK existant (autre outil,
// .bat) : à l'ajout du serveur (dossier seul, le serveur n'existe pas
// encore) puis appliqué une fois créé, ou depuis l'onglet Général.
export function registerArkLaunchImportHandlers(ctx: IpcContext): void {
  ipcMain.handle(
    "ark:launchImport:fromLog",
    (_, serverPath: string): ArkLaunchLineSource | null =>
      isText(serverPath) && serverPath ? launchLineFromLogs(serverPath) : null,
  );

  // Fichier choisi par le dialogue modal partagé (dialog:selectFile) ;
  // chemin revalidé ici (.bat / .cmd seulement).
  ipcMain.handle(
    "ark:launchImport:fromScript",
    (_, path: string): ArkLaunchLineSource => launchLineFromScript(path),
  );

  // Conflits contre tous les serveurs (lancés ou non) : deux serveurs d'un
  // cluster importés avec le même port ne démarreraient pas ensemble.
  ipcMain.handle(
    "ark:launchImport:preview",
    (
      _,
      serverPath: string,
      line: string,
      serverId: string | null,
    ): ArkLaunchImport | null => {
      if (!isText(serverPath) || !serverPath || !isText(line)) return null;
      const preview = previewLaunchImport(serverPath, line);
      const others = ctx.servers
        .list()
        .filter((server) => server.id !== serverId);
      const conflicts = findPortClashes(
        arkServerConfig.getPorts(preview.launch),
        others,
        (server) => readServerPorts(ctx, server),
      ).map(({ serverName, port, protocol, label }) => ({
        serverName,
        port,
        protocol,
        label,
      }));
      return { ...preview, conflicts };
    },
  );

  ipcMain.handle(
    "ark:launchImport:apply",
    (_, serverId: string, line: string, saveDirectory: string): Result => {
      const locked = arkConfigLockedError(ctx, serverId);
      if (locked) return { success: false, error: locked };
      try {
        const launch = applyLaunchImport(
          ctx.getServerPath(serverId),
          line,
          saveDirectory,
        );
        ctx.updateArkConfig(serverId, launch);
        return { success: true };
      } catch (error) {
        return { success: false, error: String((error as Error).message) };
      }
    },
  );
}
