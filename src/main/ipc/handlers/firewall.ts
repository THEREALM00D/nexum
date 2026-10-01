import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type { FirewallNamedRule } from "../../../shared/types";

type RuleKey = "game" | "rcon" | "restapi";
type Protocol = "TCP" | "UDP";

export function registerFirewallHandlers(ctx: IpcContext): void {
  ipcMain.handle("firewall:isAdmin", () => ctx.firewall.isAdmin());

  ipcMain.handle(
    "firewall:getStatus",
    (_, gamePort: number, rconPort: number, restApiPort: number) =>
      ctx.firewall.getStatus(gamePort, rconPort, restApiPort),
  );

  ipcMain.handle(
    "firewall:enableRule",
    (_, key: RuleKey, port: number, protocol: Protocol) =>
      ctx.firewall.enableRule(key, port, protocol),
  );

  ipcMain.handle("firewall:disableRule", (_, key: RuleKey) =>
    ctx.firewall.disableRule(key),
  );

  ipcMain.handle(
    "firewall:applyAll",
    (_, gamePort: number, rconPort: number, restApiPort: number) =>
      ctx.firewall.applyAll(gamePort, rconPort, restApiPort),
  );

  ipcMain.handle("firewall:removeAll", () => ctx.firewall.removeAll());

  ipcMain.handle("firewall:checkRule", (_, name: string) =>
    ctx.firewall.checkRule(name),
  );

  ipcMain.handle(
    "firewall:enableNamedRule",
    (_, name: string, port: number, protocol: Protocol) =>
      ctx.firewall.enableNamedRule(name, port, protocol),
  );

  ipcMain.handle(
    "firewall:disableNamedRule",
    (_, name: string, protocol?: Protocol) =>
      ctx.firewall.disableNamedRule(name, protocol),
  );
  // Opérations groupées : une seule invite UAC pour tout le lot
  ipcMain.handle("firewall:applyNamedRules", (_, rules: FirewallNamedRule[]) =>
    ctx.firewall.applyNamedRules(rules),
  );
  ipcMain.handle(
    "firewall:removeNamedRules",
    (_, rules: { name: string; protocol?: Protocol }[]) =>
      ctx.firewall.removeNamedRules(rules),
  );
  ipcMain.handle("firewall:listCustomRules", () =>
    ctx.firewall.listCustomRules(),
  );

  ipcMain.handle(
    "firewall:createCustomRule",
    (_, name: string, port: number, protocol: Protocol) =>
      ctx.firewall.createCustomRule(name, port, protocol),
  );

  ipcMain.handle(
    "firewall:deleteCustomRule",
    (_, name: string, protocol: Protocol) =>
      ctx.firewall.deleteCustomRule(name, protocol),
  );
}
