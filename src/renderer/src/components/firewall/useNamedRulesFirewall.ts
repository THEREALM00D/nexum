import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useNotification } from "../../context/NotificationContext";
import type { FirewallNamedRule, FirewallRuleStatus } from "@shared/types";

// Traduit les codes d'erreur du FirewallManager (main/firewall/FirewallManager.ts,
// FW_ERROR). Tout autre texte est une erreur brute, affichée telle quelle.
export function firewallErrorMessage(
  t: TFunction,
  error: string | undefined,
): string {
  switch (error) {
    case "UAC_CANCELLED":
      return t("network.errors.uacCancelled");
    case "INVALID_RULE":
      return t("network.errors.invalidRule");
    case "NOT_APPLIED":
      return t("network.errors.notApplied");
    default:
      return error || t("common.error");
  }
}

/**
 * Règles de pare-feu « nommées » d'un jeu (Valheim, Astroneer…) + règles
 * personnalisées. « Tout appliquer » / « Tout supprimer » passent par une
 * opération groupée : l'app ne tourne pas en admin, Windows ne demande donc
 * qu'UNE confirmation (UAC) pour tout le lot.
 */
export function useNamedRulesFirewall(rules: FirewallNamedRule[]) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [statuses, setStatuses] = useState<FirewallRuleStatus[]>([]);
  const [customRules, setCustomRules] = useState<FirewallRuleStatus[]>([]);
  const [loading, setLoading] = useState(true);
  // Clé stable : `rules` est recalculé à chaque rendu par l'appelant
  const rulesKey = JSON.stringify(rules);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list: FirewallNamedRule[] = JSON.parse(rulesKey);
      const [admin, custom] = await Promise.all([
        window.api.firewall.isAdmin(),
        window.api.firewall.listCustomRules(),
      ]);
      setIsAdmin(admin);
      setStatuses(
        await Promise.all(
          list.map(async (r) => ({
            ...r,
            active: await window.api.firewall.checkRule(r.name),
          })),
        ),
      );
      setCustomRules(custom);
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [rulesKey, notify]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const report = useCallback(
    (res: { success: boolean; error?: string }, okMsg: string) => {
      if (res.success) notify(okMsg, "success");
      else notify(firewallErrorMessage(t, res.error), "error");
    },
    [notify, t],
  );

  const onToggle = useCallback(
    async (rule: FirewallRuleStatus) => {
      try {
        if (rule.active) {
          report(
            await window.api.firewall.disableNamedRule(
              rule.name,
              rule.protocol,
            ),
            t("network.standard.ruleRemoved", { name: rule.name }),
          );
        } else {
          report(
            await window.api.firewall.enableNamedRule(
              rule.name,
              rule.port,
              rule.protocol,
            ),
            t("network.standard.ruleAdded", { name: rule.name }),
          );
        }
      } catch (e) {
        notify((e as Error).message, "error");
      }
    },
    [notify, report, t],
  );

  const onApplyAll = useCallback(async () => {
    try {
      report(
        await window.api.firewall.applyNamedRules(JSON.parse(rulesKey)),
        t("network.standard.allApplied"),
      );
    } catch (e) {
      notify((e as Error).message, "error");
    }
  }, [rulesKey, notify, report, t]);

  const onRemoveAll = useCallback(async () => {
    try {
      const list: FirewallNamedRule[] = JSON.parse(rulesKey);
      report(
        await window.api.firewall.removeNamedRules(
          list.map((r) => ({ name: r.name, protocol: r.protocol })),
        ),
        t("network.standard.allRemoved"),
      );
    } catch (e) {
      notify((e as Error).message, "error");
    }
  }, [rulesKey, notify, report, t]);

  return {
    isAdmin,
    rules: statuses,
    customRules,
    loading,
    refresh,
    onToggle,
    onApplyAll,
    onRemoveAll,
  };
}
