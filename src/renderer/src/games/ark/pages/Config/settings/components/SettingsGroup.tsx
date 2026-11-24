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

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      slotProps={{ transition: { unmountOnExit: true } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
          <SectionTitle component="span">
            {t(`arkSettingsUi.groups.${group}`)}
          </SectionTitle>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("arkSettingsUi.count", { count: items.length })}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {group === "other" && (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            {t("arkSettingsUi.otherHint")}
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
