import { memo } from "react";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import SectionTitle from "../../../../../../components/common/SectionTitle";
import { FOCUS_RING_SX } from "../../../../../../theme";
import type { SettingsGroupId } from "../hooks/useSettingsGroups";

interface Props {
  group: SettingsGroupId;
  count: number;
  expanded: boolean;
  onToggle: (group: SettingsGroupId) => void;
}

/**
 * En-tête d'un thème de réglages dans la liste virtualisée : bouton qui
 * déplie ou replie le groupe, collé en haut de la liste en défilant.
 * Section de mod (`mod:<fichier>:<section>`) : nom tel qu'écrit, non traduit.
 */
function SettingsGroupHeader({ group, count, expanded, onToggle }: Props) {
  const { t } = useTranslation();
  const [, modFile, ...modSection] = group.split(":");
  const isMod = group.startsWith("mod:");
  const title = isMod
    ? t("arkSettingsUi.modGroup", {
        section: modSection.join(":"),
        file: t(`arkSettingsUi.sources.${modFile}`),
      })
    : t(`arkSettingsUi.groups.${group}`);
  const hint =
    expanded && (isMod || group === "other")
      ? t(isMod ? "arkSettingsUi.modHint" : "arkSettingsUi.otherHint")
      : null;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <ButtonBase
        onClick={() => onToggle(group)}
        aria-expanded={expanded}
        sx={{
          width: "100%",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          ...FOCUS_RING_SX,
        }}
      >
        <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
          <SectionTitle component="span">{title}</SectionTitle>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("arkSettingsUi.count", { count })}
          </Typography>
        </Stack>
        <ExpandMoreIcon
          fontSize="small"
          sx={{
            color: "text.secondary",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 150ms",
          }}
        />
      </ButtonBase>
      {hint && (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", px: 2, pb: 1.5 }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  );
}

export default memo(SettingsGroupHeader);
