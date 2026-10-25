import { networkInterfaces } from "os";
import type { IpcContext } from "../ipc/context";
import type { JoinInfo } from "../../shared/types";
import { getGamePorts, getGameSearchName } from "../games/registry";
import { formatPortRange } from "../games/ports";
import { AppError, networkError } from "../utils/appError";

// Réseaux internes créés par les outils de virtualisation / VPN : leur IP
// n'est jamais celle à donner aux amis. ⚠️ Pas « vEthernet » en général : un
// commutateur Hyper-V EXTERNE (« vEthernet (Mon switch) ») porte la vraie IP
// du PC sur la box. Seul « Default Switch » (NAT interne) est à écarter.
const INTERNAL_ADAPTER =
  /Default Switch|WSL|VirtualBox|VMware|VPN|TAP|Tailscale|ZeroTier|Hamachi|Loopback/i;

const isPrivate = (ip: string): boolean => {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31)
  );
};

/** IPv4 de ce PC sur le réseau local (box), ou null si introuvable. */
export function localIpv4(): string | null {
  const scored: { ip: string; score: number }[] = [];
  for (const [name, addrs] of Object.entries(networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family !== "IPv4" || a.internal || !isPrivate(a.address)) continue;
      let score = 0;
      if (INTERNAL_ADAPTER.test(name)) score -= 10;
      // Les box domestiques sont presque toujours en 192.168.x.x
      if (a.address.startsWith("192.168.")) score += 2;
      else if (a.address.startsWith("10.")) score += 1;
      scored.push({ ip: a.address, score });
    }
  }
  scored.sort((x, y) => y.score - x.score);
  return scored[0] && scored[0].score >= 0 ? scored[0].ip : null;
}

/**
 * Ce qu'il faut pour rejoindre un serveur : port de jeu (lu dans la config du
 * jeu, comme les règles de pare-feu) et ports UDP à rediriger sur la box.
 */
export function getJoinInfo(ctx: IpcContext, id: string): JoinInfo {
  const server = ctx.servers.list().find((s) => s.id === id);
  const gameType = server?.gameType ?? "palworld";
  const path = ctx.getServerPath(id);
  const cfg = ctx.getServerConfig(id);

  // Mêmes ports que la détection de conflits ; seuls ceux à rediriger sur la
  // box sont donnés (jamais RCON / REST).
  const forwarded = getGamePorts(gameType, path, cfg, {
    palworld: ctx.configParser,
    astroneer: ctx.astroConfigParser,
  }).filter((p) => p.forward);

  return {
    localIp: localIpv4(),
    port: forwarded[0]?.port ?? 0,
    portRange: formatPortRange(forwarded.map((p) => p.port)),
    crossplay: gameType === "valheim" && cfg.valheimConfig.crossplay,
    searchName: getGameSearchName(gameType, path),
  };
}

let publicIpCache: { ip: string; at: number } | null = null;

/**
 * IP publique (celle à donner aux amis hors du réseau). Demandée à ipify
 * UNIQUEMENT quand l'utilisateur clique « Afficher mon IP publique » —
 * appel tiers déclaré dans docs/code-signing*.md. Mise en cache 10 min.
 */
export async function getPublicIp(): Promise<string> {
  if (publicIpCache && Date.now() - publicIpCache.at < 10 * 60_000) {
    return publicIpCache.ip;
  }
  const res = await fetch("https://api.ipify.org?format=json", {
    signal: AbortSignal.timeout(5000),
  }).catch((e: unknown) => {
    throw networkError("https://api.ipify.org", (e as Error).cause ?? e);
  });
  if (!res.ok)
    throw new AppError("PUBLIC_IP_FAILED", { detail: `HTTP ${res.status}` });
  const { ip } = (await res.json()) as { ip?: string };
  if (!ip) throw new AppError("PUBLIC_IP_FAILED", { detail: "?" });
  publicIpCache = { ip, at: Date.now() };
  return ip;
}
