import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { DragonwildsWorld } from "@shared/types";
import { formatDate, formatSize } from "../../../../../utils/format";

/** Une sauvegarde de monde, avec son action (charger ou importer). */
export default function WorldRow({
  world,
  current,
  actionLabel,
  disabled,
  onAction,
}: {
  world: DragonwildsWorld;
  current?: boolean;
  actionLabel: string;
  disabled: boolean;
  onAction: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "fr";
  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, py: 0.5 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {world.worldName}
          </Typography>
          {current && (
            <Chip
              size="small"
              color="success"
              label={t("dragonwildsWorlds.loadedChip")}
            />
          )}
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {world.fileName} — {formatDate(world.lastModified, locale)} —{" "}
          {formatSize(world.sizeBytes)}
        </Typography>
      </Box>
      {!current && (
        <Button
          size="small"
          variant="outlined"
          disabled={disabled}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}
