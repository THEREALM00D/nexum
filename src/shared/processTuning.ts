// Priorité du processeur et cœurs d'un serveur (dialogue du serveur,
// application par le main au démarrage et à l'adoption).
import type { CpuPriority } from "./types";

/** Du plus bas au plus haut, comme le menu du dialogue. */
export const CPU_PRIORITIES: readonly CpuPriority[] = [
  "low",
  "belowNormal",
  "normal",
  "aboveNormal",
  "high",
];

/**
 * Un masque d'affinité ne couvre qu'un groupe de processeurs (64 cœurs
 * logiques) : au-delà, seuls les 64 premiers sont proposés.
 */
export const MAX_AFFINITY_CORES = 64;

/** « 0-3, 6, 8-9 » : liste de cœurs triés, par plages. */
export function formatCoreList(cores: readonly number[]): string {
  const sorted = [...new Set(cores)].sort((first, second) => first - second);
  const ranges: string[] = [];
  for (let index = 0; index < sorted.length; index++) {
    const start = sorted[index];
    let end = start;
    while (sorted[index + 1] === end + 1) {
      end += 1;
      index += 1;
    }
    ranges.push(end > start ? `${start}-${end}` : String(start));
  }
  return ranges.join(", ");
}
