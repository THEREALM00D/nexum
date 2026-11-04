import { useState } from "react";
import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { EnshroudedGameSettingValue } from "@shared/types";
import Section from "../../../../../components/common/Section";
import ConfigGroup from "../../../../../components/config/ConfigGroup";
import ConfigField from "../../../../../components/config/ConfigField";
import { GAME_SETTING_GROUPS } from "../gameSettingsFields";

/**
 * Réglages fins de `gameSettings`, générés depuis une liste (trop nombreux
 * pour être écrits un par un) et rangés en groupes repliables, comme la page
 * Config partagée des autres jeux.
 */
export default function GameSettingsSection({
  settings,
  loading,
  onChange,
}: {
  settings: Record<string, EnshroudedGameSettingValue>;
  loading: boolean;
  onChange: (key: string, value: EnshroudedGameSettingValue) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (labelKey: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(labelKey)) next.add(labelKey);
      return next;
    });

  return (
    <Section
      label={t("enshroudedConfig.sections.gameSettings")}
      loading={loading}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("enshroudedConfig.gameSettings.description")}
      </Typography>
      <Stack spacing={1}>
        {GAME_SETTING_GROUPS.map((group) => (
          <ConfigGroup
            key={group.labelKey}
            group={group}
            expanded={expanded.has(group.labelKey)}
            onToggle={() => toggle(group.labelKey)}
            renderField={(field) => (
              <ConfigField
                field={field}
                value={settings[field.key] ?? ""}
                i18nPrefix="enshroudedConfig.settings"
                onChange={(value) => onChange(field.key, value)}
              />
            )}
          />
        ))}
      </Stack>
    </Section>
  );
}
