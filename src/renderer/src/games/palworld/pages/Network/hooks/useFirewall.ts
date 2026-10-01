import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { firewallService } from "../../../services/firewallService";
import { configService } from "../../../services/configService";
import { useNotification } from "../../../../../context/NotificationContext";
import type { FirewallRuleStatus } from "@shared/types";
import { firewallErrorMessage } from "../../../../../components/firewall/useNamedRulesFirewall";

const RULE_KEYS: Record<string, "game" | "rcon" | "restapi"> = {
  "Palworld Server - Game": "game",
  "Palworld Server - RCON": "rcon",
  "Palworld Server - REST API": "restapi",
};

export function useFirewall(serverPath: string) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rules, setRules] = useState<FirewallRuleStatus[]>([]);
  const [customRules, setCustomRules] = useState<FirewallRuleStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const getPorts = useCallback(async () => {
    if (!serverPath)
      return { gamePort: 8211, rconPort: 25575, restApiPort: 8212 };
    const cfg = await configService.readPalConfig();
    return {
      gamePort: Number(cfg.PublicPort ?? 8211),
      rconPort: Number(cfg.RCONPort ?? 25575),
      restApiPort: Number(cfg.RESTAPIPort ?? 8212),
    };
  }, [serverPath]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [admin, { gamePort, rconPort, restApiPort }] = await Promise.all([
      firewallService.isAdmin(),
      getPorts(),
    ]);
    setIsAdmin(admin);
    const [status, custom] = await Promise.all([
      firewallService.getStatus(gamePort, rconPort, restApiPort),
      firewallService.listCustomRules(),
    ]);
    setRules(status);
    setCustomRules(custom);
    setLoading(false);
  }, [getPorts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onToggle = useCallback(
    async (rule: FirewallRuleStatus) => {
      const key = RULE_KEYS[rule.name];
      if (!key) return;
      if (rule.active) {
        const res = await firewallService.disableRule(key);
        if (!res.success) notify(firewallErrorMessage(t, res.error), "error");
        else
          notify(
            t("network.standard.ruleRemoved", { name: rule.name }),
            "success",
          );
      } else {
        const res = await firewallService.enableRule(
          key,
          rule.port,
          rule.protocol,
        );
        if (!res.success) notify(firewallErrorMessage(t, res.error), "error");
        else
          notify(
            t("network.standard.ruleAdded", { name: rule.name }),
            "success",
          );
      }
    },
    [notify, t],
  );

  const onApplyAll = useCallback(async () => {
    const { gamePort, rconPort, restApiPort } = await getPorts();
    const res = await firewallService.applyAll(gamePort, rconPort, restApiPort);
    if (!res.success)
      notify(
        res.errors.map((e) => firewallErrorMessage(t, e)).join("\n"),
        "error",
      );
    else notify(t("network.standard.allApplied"), "success");
  }, [getPorts, notify, t]);

  const onRemoveAll = useCallback(async () => {
    await firewallService.removeAll();
    notify(t("network.standard.allRemoved"), "info");
  }, [notify, t]);

  return {
    isAdmin,
    rules,
    customRules,
    loading,
    refresh,
    onToggle,
    onApplyAll,
    onRemoveAll,
  };
}
