import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";

export default function SteamCmdCard({
  steamInstalled,
  running,
  onInstall,
}: {
  steamInstalled: boolean | null;
  running: boolean;
  onInstall: () => void;
}) {
  const { t } = useTranslation();
  // Vérification en cours : skeletons à la forme du cas courant (installé)
  const loading = steamInstalled === null;
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle2">
            {t("install.steamcmd.label")}
          </Typography>
          <LoadingSkeleton loading={loading}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {steamInstalled === false
                ? t("install.steamcmd.notInstalled")
                : t("install.steamcmd.installed")}
            </Typography>
          </LoadingSkeleton>
        </Box>
        {/* flex : pas de hauteur de ligne autour de la pastille (décalage de 1 px) */}
        <LoadingSkeleton loading={loading} sx={{ display: "flex" }}>
          <Chip
            label={
              steamInstalled === false
                ? t("install.steamcmd.statusMissing")
                : t("install.steamcmd.statusOk")
            }
            color={steamInstalled ? "success" : "default"}
            size="small"
          />
        </LoadingSkeleton>
      </Stack>
      {steamInstalled === false && (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<DownloadIcon />}
          disabled={running}
          onClick={onInstall}
        >
          {t("install.steamcmd.install")}
        </Button>
      )}
    </Paper>
  );
}
