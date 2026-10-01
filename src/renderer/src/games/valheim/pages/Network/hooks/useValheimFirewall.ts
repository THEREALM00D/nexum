import { useNamedRulesFirewall } from "../../../../../components/firewall/useNamedRulesFirewall";

// Port de jeu + port de requête Steam (port + 1)
export function useValheimFirewall(gamePort: number) {
  return useNamedRulesFirewall([
    { name: "Valheim Server - Game", port: gamePort, protocol: "UDP" },
    { name: "Valheim Server - Query", port: gamePort + 1, protocol: "UDP" },
  ]);
}
