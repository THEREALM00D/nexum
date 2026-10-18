/** Port ouvert par un serveur de jeu (détection des conflits, carte « Rejoindre »). */
export interface GamePort {
  port: number;
  protocol: "TCP" | "UDP";
  label: "game" | "query" | "crossplay" | "beacon" | "rcon" | "restapi";
  /** À rediriger sur la box pour les joueurs extérieurs (pas RCON / REST). */
  forward: boolean;
}

/** "2456-2458" pour des ports qui se suivent, sinon "7777, 8888". */
export function formatPortRange(ports: number[]): string {
  const sorted = [...new Set(ports)].sort((a, b) => a - b);
  if (sorted.length === 0) return "";
  const contiguous = sorted.every((p, i) => i === 0 || p === sorted[i - 1] + 1);
  if (contiguous && sorted.length > 1) {
    return `${sorted[0]}-${sorted[sorted.length - 1]}`;
  }
  return sorted.join(", ");
}
