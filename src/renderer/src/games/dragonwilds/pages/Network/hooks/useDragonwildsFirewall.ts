import { useNamedRulesFirewall } from "../../../../../components/firewall/useNamedRulesFirewall";

// Les deux ports UDP du serveur (aucun port TCP, vérifié). Le port dans le
// nom : plusieurs serveurs Dragonwilds sur ce PC (7777, 7778…) ont chacun
// leurs règles — la présence d'une règle n'est vérifiée que par son nom.
export function useDragonwildsFirewall(gamePort: number, beaconPort: number) {
  return useNamedRulesFirewall([
    {
      name: `Dragonwilds Server - Game (${gamePort})`,
      port: gamePort,
      protocol: "UDP",
    },
    {
      name: `Dragonwilds Server - Beacon (${beaconPort})`,
      port: beaconPort,
      protocol: "UDP",
    },
  ]);
}
