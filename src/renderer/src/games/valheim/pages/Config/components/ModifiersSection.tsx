import { Button, ButtonGroup, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ValheimLaunchConfig, ValheimModifiers } from "@shared/types";
import Section from "./Section";
import ModifierSelect from "./ModifierSelect";
import { MODIFIER_PRESET_NAMES } from "../presets";

const DEFAULT_MODIFIERS: ValheimModifiers = {
  combat: "",
  deathpenalty: "",
  resources: "",
  raids: "",
  portals: "",
};

export default function ModifiersSection({
  config,
  onChange,
  loading,
}: {
  config: ValheimLaunchConfig;
  loading: boolean;
  onChange: (patch: Partial<ValheimLaunchConfig>) => void;
}) {
  const { t } = useTranslation();
  const modifiers = config.modifiers ?? DEFAULT_MODIFIERS;

  return (
    <Section label={t("valheimConfig.sections.modifiers")} loading={loading}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("valheimConfig.modifiers.description")}
      </Typography>

      {/* -preset : écrase tous les modificateurs déjà appliqués sur ce monde */}
      <Stack spacing={0.5}>
        <ButtonGroup size="small" variant="outlined">
          {MODIFIER_PRESET_NAMES.map((preset) => (
            <Button
              key={preset}
              variant={
                config.modifierPreset === preset ? "contained" : "outlined"
              }
              onClick={() =>
                onChange({
                  modifierPreset: preset,
                  modifiers: DEFAULT_MODIFIERS,
                })
              }
            >
              {t(`valheimConfig.modifiers.presetNames.${preset}`)}
            </Button>
          ))}
        </ButtonGroup>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t("valheimConfig.modifiers.presetHint")}
        </Typography>
      </Stack>

      {/* Selects par modificateur — réglages fins appliqués APRÈS le preset */}
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
        <ModifierSelect
          label={t("valheimConfig.modifiers.combat.label")}
          value={modifiers.combat}
          options={["veryeasy", "easy", "hard", "veryhard"]}
          labelPrefix="valheimConfig.modifiers.combat"
          onChange={(v) =>
            onChange({
              modifiers: {
                ...modifiers,
                combat: v as ValheimModifiers["combat"],
              },
            })
          }
        />
        <ModifierSelect
          label={t("valheimConfig.modifiers.deathpenalty.label")}
          description={t("valheimConfig.modifiers.deathpenalty.description")}
          value={modifiers.deathpenalty}
          options={["casual", "veryeasy", "easy", "hard", "hardcore"]}
          labelPrefix="valheimConfig.modifiers.deathpenalty"
          onChange={(v) =>
            onChange({
              modifiers: {
                ...modifiers,
                deathpenalty: v as ValheimModifiers["deathpenalty"],
              },
            })
          }
        />
        <ModifierSelect
          label={t("valheimConfig.modifiers.resources.label")}
          value={modifiers.resources}
          options={["muchless", "less", "more", "muchmore", "most"]}
          labelPrefix="valheimConfig.modifiers.resources"
          onChange={(v) =>
            onChange({
              modifiers: {
                ...modifiers,
                resources: v as ValheimModifiers["resources"],
              },
            })
          }
        />
        <ModifierSelect
          label={t("valheimConfig.modifiers.raids.label")}
          value={modifiers.raids}
          options={["none", "muchless", "less", "more", "muchmore"]}
          labelPrefix="valheimConfig.modifiers.raids"
          onChange={(v) =>
            onChange({
              modifiers: {
                ...modifiers,
                raids: v as ValheimModifiers["raids"],
              },
            })
          }
        />
        <ModifierSelect
          label={t("valheimConfig.modifiers.portals.label")}
          value={modifiers.portals}
          options={["casual", "hard", "veryhard"]}
          labelPrefix="valheimConfig.modifiers.portals"
          onChange={(v) =>
            onChange({
              modifiers: {
                ...modifiers,
                portals: v as ValheimModifiers["portals"],
              },
            })
          }
        />
      </Stack>
    </Section>
  );
}
