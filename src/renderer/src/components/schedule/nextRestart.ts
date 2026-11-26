import type { TFunction } from "i18next";
import { format, isToday, isTomorrow } from "date-fns";
import { enUS as dateFnsEnglish, fr as dateFnsFrench } from "date-fns/locale";
import type { RestartConfig } from "@shared/types";
import { nextRestartAt } from "@shared/restartSchedule";

/**
 * « aujourd'hui à 16:00 », « demain à 04:00 », « samedi à 04:00 » : heure du
 * prochain arrêt planifié, ou null (désactivé, aucune heure, aucun jour).
 */
export function formatNextRestart(
  config: RestartConfig,
  t: TFunction,
  language: string | undefined,
  now = new Date(),
): string | null {
  if (!config.enabled) return null;
  const next = nextRestartAt(config, now);
  if (!next) return null;
  const time = format(next, "HH:mm");
  if (isToday(next)) return t("schedule.next.today", { time });
  if (isTomorrow(next)) return t("schedule.next.tomorrow", { time });
  const locale = language === "en" ? dateFnsEnglish : dateFnsFrench;
  return t("schedule.next.other", {
    day: format(next, "EEEE", { locale }),
    time,
  });
}
