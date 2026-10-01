import { useNamedRulesFirewall } from "../../../../../components/firewall/useNamedRulesFirewall";

// Uniquement le port de jeu — le port console/RCON (ConsolePort) ne doit
// jamais être exposé publiquement (avertissement officiel Astroneer).
export function useAstroneerFirewall(gamePort: number) {
  return useNamedRulesFirewall([
    { name: "Astroneer Server - Game", port: gamePort, protocol: "UDP" },
  ]);
}
