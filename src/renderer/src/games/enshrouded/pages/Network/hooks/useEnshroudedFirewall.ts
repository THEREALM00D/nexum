import { useNamedRulesFirewall } from "../../../../../components/firewall/useNamedRulesFirewall";

// Un seul port fixe, en UDP (vérifié). Le port dans le nom : plusieurs
// serveurs Enshrouded sur ce PC ont chacun leur règle — la présence d'une
// règle n'est vérifiée que par son nom.
export function useEnshroudedFirewall(queryPort: number, ready: boolean) {
  return useNamedRulesFirewall(
    [
      {
        name: `Enshrouded Server - Query (${queryPort})`,
        port: queryPort,
        protocol: "UDP",
      },
    ],
    ready,
  );
}
