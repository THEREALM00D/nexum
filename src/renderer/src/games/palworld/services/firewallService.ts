import type { FirewallRuleStatus, OperationResult } from "../../../types";

export const firewallService = {
  isAdmin: (): Promise<boolean> => window.api.firewall.isAdmin(),
  getStatus: (
    gamePort: number,
    rconPort: number,
    restApiPort: number,
  ): Promise<FirewallRuleStatus[]> =>
    window.api.firewall.getStatus(gamePort, rconPort, restApiPort),
  // Une règle précise (nom exact : « Palworld Server - Game UDP »…), comme
  // les autres jeux — pas de clé « game » qui en couvrait deux.
  enableRule: (rule: FirewallRuleStatus): Promise<OperationResult> =>
    window.api.firewall.enableNamedRule(rule.name, rule.port, rule.protocol),
  disableRule: (rule: FirewallRuleStatus): Promise<OperationResult> =>
    window.api.firewall.disableNamedRule(rule.name, rule.protocol),
  applyAll: (
    gamePort: number,
    rconPort: number,
    restApiPort: number,
  ): Promise<{ success: boolean; errors: string[] }> =>
    window.api.firewall.applyAll(gamePort, rconPort, restApiPort),
  removeAll: (): Promise<void> => window.api.firewall.removeAll(),
  listCustomRules: (): Promise<FirewallRuleStatus[]> =>
    window.api.firewall.listCustomRules(),
  createCustomRule: (
    name: string,
    port: number,
    protocol: "TCP" | "UDP",
  ): Promise<OperationResult> =>
    window.api.firewall.createCustomRule(name, port, protocol),
  deleteCustomRule: (
    name: string,
    protocol: "TCP" | "UDP",
  ): Promise<OperationResult> =>
    window.api.firewall.deleteCustomRule(name, protocol),
};
