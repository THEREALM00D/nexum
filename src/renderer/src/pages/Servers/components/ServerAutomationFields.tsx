import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { GameType } from "@shared/types";
import CheckboxField from "../../../components/common/CheckboxField";
import { getGamePlugin } from "../../../games/registry";
import WatchdogFields, { type WatchdogValues } from "./WatchdogFields";

export interface AutomationValues extends WatchdogValues {
  autoStart: boolean;
  autoRestart: boolean;
}

interface Props {
  values: AutomationValues & { gameType: GameType };
  onChange: (patch: Partial<AutomationValues>) => void;
}

/**
 * Ce que Nexum fait seul pour ce serveur : démarrage avec Nexum, relance
 * après un plantage, surveillance (démarrage bloqué, RAM).
 */
export default function ServerAutomationFields({ values, onChange }: Props) {
  const { t } = useTranslation();
  const plugin = getGamePlugin(values.gameType);
  return (
    <Stack spacing={1}>
      <CheckboxField
        checked={values.autoStart}
        onChange={(autoStart) => onChange({ autoStart })}
        label={t("servers.dialog.autoStart")}
        helper={t("servers.dialog.autoStartHelper")}
      />
      <CheckboxField
        checked={values.autoRestart}
        onChange={(autoRestart) => onChange({ autoRestart })}
        label={t("servers.dialog.autoRestart")}
        helper={t("servers.dialog.autoRestartHelper")}
      />
      <WatchdogFields
        values={values}
        onChange={onChange}
        startupReadyHintKey={plugin?.startupReadyHintKey}
        recommendedRamGb={plugin?.requirements?.ramGb}
      />
    </Stack>
  );
}
