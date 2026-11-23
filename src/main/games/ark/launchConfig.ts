import type { ArkLaunchConfig } from "../../../shared/types";
import { appError } from "../../utils/appError";

// Nom d'une carte sur la ligne de commande (« TheIsland_WP ») : lettres,
// chiffres et « _ » seulement. Sinon il casserait la chaîne d'options `?`
// ou ferait sortir le dossier du monde de SavedArks (« .. »).
export const ARK_MAP_NAME = /^[A-Za-z0-9_]+$/;

// Borne de sécurité (pas une limite vérifiée du jeu) : le serveur annonce
// 70 par défaut.
export const ARK_MAX_PLAYERS = 255;

// Ports et joueurs max par défaut du serveur (vérifiés).
export const DEFAULT_ARK_CONFIG: ArkLaunchConfig = {
  map: "TheIsland_WP",
  port: 7777,
  queryPort: 27015,
  rconPort: 27020,
  maxPlayers: 70,
  battlEye: true,
  customArgs: "",
};

const isPort = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 65535;
const isPlayerCount = (value: unknown): value is number =>
  Number.isInteger(value) &&
  Number(value) >= 1 &&
  Number(value) <= ARK_MAX_PLAYERS;
const isMapName = (value: unknown): value is string =>
  typeof value === "string" && ARK_MAP_NAME.test(value);

/** Erreur codée pour la page Config, null si la config est valide. */
export function validateArkLaunch(launch: ArkLaunchConfig): string | null {
  if (!isMapName(launch.map)) {
    return appError("ARK_MAP_INVALID", { map: String(launch.map) });
  }
  const ports = [launch.port, launch.queryPort, launch.rconPort];
  if (!ports.every(isPort)) return appError("PORT_INVALID");
  // Jeu et requête sont en UDP ; RCON est en TCP.
  if (launch.port === launch.queryPort) return appError("ARK_PORTS_SAME");
  if (!isPlayerCount(launch.maxPlayers)) {
    return appError("ARK_MAX_PLAYERS_INVALID", { max: ARK_MAX_PLAYERS });
  }
  return null;
}

/**
 * Config enregistrée ou importée (`config.json` modifié à la main, export
 * d'un autre PC) : chaque valeur invalide reprend sa valeur par défaut,
 * car la carte finit dans un chemin et dans la ligne de commande.
 */
export function sanitizeArkLaunch(
  stored?: Partial<ArkLaunchConfig>,
): ArkLaunchConfig {
  const merged = { ...DEFAULT_ARK_CONFIG, ...stored };
  const pick = <T>(valid: boolean, value: T, fallback: T): T =>
    valid ? value : fallback;
  return {
    map: pick(isMapName(merged.map), merged.map, DEFAULT_ARK_CONFIG.map),
    port: pick(isPort(merged.port), merged.port, DEFAULT_ARK_CONFIG.port),
    queryPort: pick(
      isPort(merged.queryPort),
      merged.queryPort,
      DEFAULT_ARK_CONFIG.queryPort,
    ),
    rconPort: pick(
      isPort(merged.rconPort),
      merged.rconPort,
      DEFAULT_ARK_CONFIG.rconPort,
    ),
    maxPlayers: pick(
      isPlayerCount(merged.maxPlayers),
      merged.maxPlayers,
      DEFAULT_ARK_CONFIG.maxPlayers,
    ),
    battlEye: merged.battlEye !== false,
    customArgs: typeof merged.customArgs === "string" ? merged.customArgs : "",
  };
}
