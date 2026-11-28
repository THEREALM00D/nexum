import { PalworldApiClient } from "../games/palworld/PalworldApiClient";
import {
  ARK_EXIT_TIMEOUT_SECONDS,
  ArkRconClient,
} from "../games/ark/ArkRconClient";
import { lt } from "../i18n/logStrings";
import type { StopConfig } from "./ServerManager";

/** Ce qu'un jeu sait faire pour s'arrêter proprement (API REST, RCON). */
export interface GracefulShutdownClient {
  announce(message: string): Promise<unknown>;
  save(): Promise<unknown>;
  /** Demande l'arrêt (dans `waitSeconds` secondes si le jeu sait attendre). */
  shutdown(waitSeconds: number): Promise<unknown>;
}

export interface GracefulShutdown {
  client: GracefulShutdownClient;
  /**
   * Présent quand le jeu ne sait pas différer son arrêt (ARK) : Nexum
   * attend lui-même le délai annoncé, puis appelle `shutdown(0)`. Renvoie la
   * ligne de log écrite avant l'attente.
   */
  nexumWaitLine?: (waitSeconds: number) => string;
  /** Le chat du jeu n'affiche pas les accents : le client les retire (ARK). */
  asciiChat?: boolean;
  /** Ligne de log une fois l'arrêt demandé. */
  sentLine: (waitSeconds: number) => string;
  /** Ligne de log quand l'API / RCON ne répond pas. */
  unavailableLine: (error: string) => string;
  /**
   * Attente maximale de la fin du processus une fois `shutdown` résolu
   * (0 = ne pas attendre, puis taskkill : comportement historique de
   * Palworld sans délai).
   */
  exitTimeoutSeconds: (waitSeconds: number) => number;
}

/** Client d'arrêt propre du jeu, ou null s'il n'en a pas (signal, taskkill). */
export function createGracefulShutdown(
  stopConfig: StopConfig | undefined,
): GracefulShutdown | null {
  if (
    stopConfig?.restApiEnabled &&
    stopConfig.restApiPort &&
    stopConfig.adminPassword
  ) {
    const palworld = new PalworldApiClient(
      stopConfig.restApiPort,
      stopConfig.adminPassword,
    );
    return {
      client: {
        announce: (message) => palworld.announce(message),
        save: () => palworld.save(),
        shutdown: (waitSeconds) => palworld.shutdown(waitSeconds, ""),
      },
      sentLine: (waitSeconds) => lt().shutdownSent(waitSeconds),
      unavailableLine: (error) => lt().apiUnavailable(error),
      exitTimeoutSeconds: (waitSeconds) =>
        waitSeconds > 0 ? waitSeconds + 10 : 0,
    };
  }
  if (stopConfig?.rcon) {
    return {
      client: new ArkRconClient(stopConfig.rcon.port, stopConfig.rcon.password),
      nexumWaitLine: (waitSeconds) => lt().rconExitIn(waitSeconds),
      asciiChat: true,
      sentLine: () => lt().rconExitSent,
      unavailableLine: (error) => lt().rconUnavailable(error),
      exitTimeoutSeconds: () => ARK_EXIT_TIMEOUT_SECONDS,
    };
  }
  return null;
}
