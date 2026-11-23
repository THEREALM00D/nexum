import { useNamedRulesFirewall } from "../../../../../components/firewall/useNamedRulesFirewall";

// Seul le port de jeu (UDP) sert aux joueurs ; le port de requête et RCON
// restent fermés (vérifié). Le port dans le nom : plusieurs serveurs ARK sur
// ce PC ont chacun leur règle, dont la présence n'est vérifiée que par le nom.
export function useArkFirewall(port: number, ready: boolean) {
  return useNamedRulesFirewall(
    [{ name: `ARK Server - Game (${port})`, port, protocol: "UDP" }],
    ready,
  );
}
