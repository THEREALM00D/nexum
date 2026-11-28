import type { CpuPriority, GameType, Server } from "@shared/types";
import { SERVER_COLORS } from "@shared/serverColors";

export interface ServerFormValues {
  name: string;
  path: string;
  gameType: GameType;
  color: string | null;
  autoStart: boolean;
  autoRestart: boolean;
  /** Démarrage bloqué : minutes avant relance, 0 = désactivé. */
  stuckStartMinutes: number;
  /** Limite de RAM en Go, 0 = désactivée. */
  ramLimitGb: number;
  cpuPriority: CpuPriority;
  /**
   * Cœurs du serveur, vide = tous. Jamais `undefined` : l'IPC l'omettrait et
   * un serveur ne pourrait plus revenir à « Tous ».
   */
  cpuCores: number[];
}

/** Valeurs du dialogue pour un serveur à modifier, ou un nouveau serveur. */
export function formValuesOf(server: Server | null): ServerFormValues {
  return {
    name: server?.name ?? "",
    path: server?.path ?? "",
    gameType: server?.gameType ?? "palworld",
    color: server?.color ?? SERVER_COLORS[0],
    autoStart: server?.autoStart ?? false,
    autoRestart: server?.autoRestart ?? false,
    stuckStartMinutes: server?.stuckStartMinutes ?? 0,
    ramLimitGb: server?.ramLimitGb ?? 0,
    cpuPriority: server?.cpuPriority ?? "normal",
    cpuCores: server?.cpuCores ?? [],
  };
}
