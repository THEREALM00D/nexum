import type { Server } from "../../shared/types";
import type { GamePort } from "../games/ports";
import type { ServerRegistry } from "./ServerRegistry";
import type { ServerManagerRegistry } from "./ServerManagerRegistry";

export interface PortConflict {
  serverId: string;
  serverName: string;
  port: number;
  protocol: GamePort["protocol"];
  label: GamePort["label"];
}

/**
 * Vérifie qu'aucun autre serveur déjà démarré n'utilise un des ports de
 * celui qu'on s'apprête à lancer — tous jeux confondus : même numéro et même
 * protocole (le beacon 8888 d'un serveur Dragonwilds contre le port de jeu
 * 8888 d'un autre compte aussi). `readPorts` renvoie null si la config est
 * illisible. Renvoie la liste des conflits trouvés (vide si OK).
 */
export function detectPortConflicts(
  startingServerId: string,
  servers: ServerRegistry,
  managers: ServerManagerRegistry,
  readPorts: (server: Server) => GamePort[] | null,
): PortConflict[] {
  const all = servers.list();
  const target = all.find((s) => s.id === startingServerId);
  if (!target) return [];

  const targetPorts = readPorts(target);
  if (!targetPorts) return [];

  const statuses = managers.statuses();
  const conflicts: PortConflict[] = [];

  for (const other of all) {
    if (other.id === startingServerId) continue;
    const otherStatus = statuses[other.id];
    if (otherStatus !== "running" && otherStatus !== "starting") continue;

    const otherPorts = readPorts(other);
    if (!otherPorts) continue;

    for (const tp of targetPorts) {
      const clash = otherPorts.some(
        (op) => op.port === tp.port && op.protocol === tp.protocol,
      );
      if (clash) {
        conflicts.push({
          serverId: other.id,
          serverName: other.name,
          port: tp.port,
          protocol: tp.protocol,
          label: tp.label,
        });
      }
    }
  }

  return conflicts;
}

export function formatConflictsError(conflicts: PortConflict[]): string {
  const lines = conflicts.map(
    (c) =>
      `${c.label.toUpperCase()} ${c.port}/${c.protocol} (déjà utilisé par « ${c.serverName} »)`,
  );
  return `Conflit de ports : ${lines.join(", ")}`;
}
