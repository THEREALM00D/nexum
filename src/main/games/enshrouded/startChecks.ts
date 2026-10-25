import { readServerJson } from "./serverJson";
import { appError } from "../../utils/appError";

/**
 * Exécuté avant CHAQUE démarrage (manuel, planifié, relance après plantage).
 * Fichier absent : le serveur le crée. JSON illisible : le serveur refuserait
 * de démarrer, on le dit avant.
 */
export function prepareEnshroudedStart(serverPath: string): string | null {
  try {
    readServerJson(serverPath);
    return null;
  } catch (err) {
    return (err as Error).message || appError("ENSHROUDED_CONFIG_INVALID");
  }
}
