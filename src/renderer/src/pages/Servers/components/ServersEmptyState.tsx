import { Button, Stack, Typography } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import { useTranslation } from "react-i18next";

/** Aucun serveur : les deux façons d'en ajouter un, pas seulement une phrase. */
export default function ServersEmptyState({
  onOpenSetup,
  onImport,
}: {
  onOpenSetup: () => void;
  onImport: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Stack
      spacing={1.5}
      useFlexGap
      sx={{
        alignItems: "center",
        textAlign: "center",
        p: 4,
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      <StorageIcon sx={{ fontSize: 32, color: "text.secondary" }} />
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {t("servers.emptyTitle")}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", maxWidth: 460 }}
      >
        {t("servers.emptyHint")}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ justifyContent: "center", flexWrap: "wrap", mt: 0.5 }}
      >
        <Button variant="contained" onClick={onOpenSetup}>
          {t("servers.launchWizard")}
        </Button>
        <Button variant="outlined" onClick={onImport}>
          {t("servers.importFolder")}
        </Button>
      </Stack>
    </Stack>
  );
}
