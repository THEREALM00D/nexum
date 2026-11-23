import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PlayersStat } from "../../../../../components/server/ServerStats";
import { arkConfigService } from "../../../services/configService";

// L'historique est mis à jour par le main toutes les 30 s (ListPlayers en
// RCON, PlayerHistoryTracker) : inutile de le relire plus souvent.
const POLL_MS = 15_000;

/**
 * Joueurs en ligne d'après l'historique des joueurs (source RCON), et
 * joueurs max de la config. Sans RCON, nombre inconnu avec une explication.
 */
export function useArkPlayers(running: boolean): PlayersStat {
  const { t } = useTranslation();
  const [count, setCount] = useState<number | null>(null);
  const [max, setMax] = useState<number | undefined>(undefined);
  const [rconEnabled, setRconEnabled] = useState(true);

  useEffect(() => {
    arkConfigService
      .readConfig()
      .then((config) => {
        setMax(Number(config.maxPlayers) || undefined);
        setRconEnabled(config.RCONEnabled === true);
      })
      .catch(() => {});
  }, [running]);

  useEffect(() => {
    if (!running || !rconEnabled) {
      setCount(null);
      return;
    }
    let cancelled = false;
    const refresh = () =>
      window.api.players
        .getHistory()
        .then((entries) => {
          if (!cancelled) {
            setCount(entries.filter((entry) => entry.online).length);
          }
        })
        .catch(() => {});
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [running, rconEnabled]);

  return {
    count: running ? count : null,
    max,
    tooltip:
      running && !rconEnabled ? t("arkDashboard.playersNeedRcon") : undefined,
  };
}
