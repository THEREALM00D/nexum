import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import SectionTitle from "../../../../../../components/common/SectionTitle";
import type { SettingItem, SettingsGroupId } from "../hooks/useSettingsGroups";
import type { useArkSettings } from "../hooks/useArkSettings";
import SettingRow from "./SettingRow";

interface Props {
  group: SettingsGroupId;
  items: SettingItem[];
  expanded: boolean;
  onToggle: () => void;
  settings: ReturnType<typeof useArkSettings>;
}

// Un thème de réglages, replié par défaut : ses lignes ne sont rendues
// qu'une fois déplié (des centaines de réglages au total).
export default function SettingsGroup({
  group,
  items,
  expanded,
  onToggle,
  settings,
}: Props) {
  const { t } = useTranslation();
  const disabled = settings.locked || settings.saving;
  // `mod:<fichier>:<section>` : nom de la section tel qu'écrit, pas traduit.
  const [, modFile, ...modSection] = group.split(":");
  const isMod = group.startsWith("mod:");
  const groupTitle = isMod
    ? t("arkSettingsUi.modGroup", {
        section: modSection.join(":"),
        file: t(`arkSettingsUi.sources.${modFile}`),
      })
    : t(`arkSettingsUi.groups.${group}`);

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      slotProps={{ transition: { unmountOnExit: true } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
          <SectionTitle component="span">{groupTitle}</SectionTitle>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("arkSettingsUi.count", { count: items.length })}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {(group === "other" || isMod) && (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            {t(isMod ? "arkSettingsUi.modHint" : "arkSettingsUi.otherHint")}
          </Typography>
        )}
        <Stack divider={<Divider flexItem />}>
          {items.map((item) => {
            const value = settings.valueOf(item.id);
            return (
              <SettingRow
                key={item.id}
                id={item.id}
                label={item.label}
                description={item.description}
                type={item.def?.type ?? "string"}
                defaultValue={item.def?.default ?? ""}
                options={item.def?.options}
                min={item.def?.min}
                max={item.def?.max}
                value={value}
                overridden={value !== ""}
                written={settings.isWritten(item.id)}
                edited={settings.isEdited(item.id)}
                disabled={disabled}
                onChange={settings.setValue}
              />
            );
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
