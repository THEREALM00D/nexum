import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import { useTranslation } from "react-i18next";
import type { UpdateStatus } from "../hooks/useInstall";
import SectionTitle from "../../../components/common/SectionTitle";

export default function UpdateStatusCard({
  updateStatus,
  checkingUpdate,
  running,
  steamInstalled,
  onCheckUpdate,
  onUpdate,
}: {
  updateStatus: UpdateStatus | null;
  checkingUpdate: boolean;
  running: boolean;
  steamInstalled: boolean | null;
  onCheckUpdate: () => void;
  onUpdate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: updateStatus?.checked ? 2 : 0,
        }}
      >
        <Box>
          <SectionTitle>{t("install.update.title")}</SectionTitle>
          {updateStatus?.installedBuild && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("install.update.installedBuild", {
                build: updateStatus.installedBuild,
              })}
            </Typography>
          )}
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<SyncIcon />}
          disabled={checkingUpdate || running || !steamInstalled}
          onClick={onCheckUpdate}
        >
          {checkingUpdate
            ? t("install.update.checking")
            : t("install.update.check")}
        </Button>
      </Stack>

      {updateStatus?.checked &&
        (updateStatus.upToDate ? (
          <Alert severity="success" sx={{ mt: 0 }}>
            {t("install.update.upToDate")}
          </Alert>
        ) : updateStatus.installedBuild === null ? (
          <Alert severity="warning" sx={{ mt: 0 }}>
            {t("install.update.cannotRead")}
          </Alert>
        ) : (
          <Alert
            severity="warning"
            sx={{ mt: 0 }}
            action={
              <Button
                color="inherit"
                size="small"
                disabled={running || !steamInstalled}
                onClick={onUpdate}
              >
                {t("install.folder.update")}
              </Button>
            }
          >
            {updateStatus.requiredBuild
              ? t("install.update.availableWithBuild", {
                  build: updateStatus.requiredBuild,
                })
              : t("install.update.available")}
          </Alert>
        ))}
    </Paper>
  );
}
