import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import { useTranslation } from "react-i18next";

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
        {isAdmin === null ? (
          <CircularProgress size={20} />
        ) : (
          <Chip
            label={
              isAdmin ? t("network.admin.isAdmin") : t("network.admin.notAdmin")
            }
            color={isAdmin ? "success" : "default"}
            size="small"
            variant="outlined"
          />
        )}
      </Stack>
      {isAdmin === false && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t("network.admin.warning")}
        </Alert>
      )}
    </Paper>
  );
}
