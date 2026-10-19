import { Alert, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import { useTranslation } from "react-i18next";
import LoadingSkeleton from "../common/LoadingSkeleton";

export default function AdminBanner({ isAdmin }: { isAdmin: boolean | null }) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <ShieldIcon
            sx={{ color: isAdmin ? "success.main" : "text.secondary" }}
          />
          <Box>
            <Typography variant="subtitle2">
              {t("network.admin.title")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("network.admin.subtitle")}
            </Typography>
          </Box>
        </Stack>
        {/* flex : pas de hauteur de ligne autour de la pastille (décalage de 1 px) */}
        <LoadingSkeleton loading={isAdmin === null} sx={{ display: "flex" }}>
          <Chip
            label={
              isAdmin ? t("network.admin.isAdmin") : t("network.admin.notAdmin")
            }
            color={isAdmin ? "success" : "default"}
            size="small"
            variant="outlined"
          />
        </LoadingSkeleton>
      </Stack>
      {/* Cas courant (Nexum tourne sans droits admin) : le bloc est réservé
          en skeleton pendant la vérification, pour ne pas apparaître après */}
      {isAdmin !== true && (
        <LoadingSkeleton loading={isAdmin === null} fullWidth sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mt: isAdmin === null ? 0 : 2 }}>
            {t("network.admin.warning")}
          </Alert>
        </LoadingSkeleton>
      )}
    </Paper>
  );
}
