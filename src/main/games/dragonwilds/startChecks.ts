import type { DragonwildsLaunchConfig } from "../../../shared/types";
import {
  readDedicatedServerIni,
  writeDedicatedServerIni,
} from "./dedicatedServerIni";
import { appError } from "../../utils/appError";

/**
 * Exécuté avant CHAQUE démarrage (manuel, planifié, relance après plantage).
 * Renvoie un message d'erreur pour refuser le démarrage, sinon null.
 */
export function prepareDragonwildsStart(
  serverPath: string,
  cfg: DragonwildsLaunchConfig,
): string | null {
  // Sans OwnerId, le serveur écrit « Dedicated Server cannot continue due to
  // DedicatedServer.ini configuration » puis reste lancé sans rien faire.
  if (!readDedicatedServerIni(serverPath).OwnerId) {
    return appError("DW_OWNER_ID_MISSING");
  }
  // Le serveur retire AdminPassword du fichier après l'avoir lu : sans cette
  // réécriture, il redémarrerait sans mot de passe admin.
  if (cfg.adminPassword) {
    writeDedicatedServerIni(serverPath, { AdminPassword: cfg.adminPassword });
  }
  return null;
}
