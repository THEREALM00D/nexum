import { randomBytes } from "crypto";
import {
  readGameUserSettings,
  writeGameUserSettings,
  type GameUserSettingsKey,
} from "./gameUserSettingsIni";

/**
 * Exécuté avant CHAQUE démarrage (manuel, planifié, relance après plantage).
 * RCON est le seul moyen d'arrêter ARK proprement, de forcer une sauvegarde
 * et de lister les joueurs : Nexum l'active tant que l'utilisateur n'a rien
 * choisi (clé absente), sans jamais repasser un `False` à `True`. RCON exige
 * un mot de passe admin : un mot de passe aléatoire est écrit s'il manque.
 */
export function prepareArkStart(serverPath: string): string | null {
  const values = readGameUserSettings(serverPath);
  const changes: Partial<Record<GameUserSettingsKey, string>> = {};
  if (values.RCONEnabled === "") changes.RCONEnabled = "True";
  const rconEnabled =
    (changes.RCONEnabled ?? values.RCONEnabled).toLowerCase() === "true";
  if (rconEnabled && values.ServerAdminPassword === "") {
    changes.ServerAdminPassword = randomBytes(12).toString("base64url");
  }
  if (Object.keys(changes).length > 0) {
    writeGameUserSettings(serverPath, changes);
  }
  return null;
}
