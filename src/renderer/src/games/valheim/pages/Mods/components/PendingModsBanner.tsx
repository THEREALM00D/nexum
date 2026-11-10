import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { usePendingMods } from "../hooks/usePendingMods";

// Mods à réinstaller après l'import d'un serveur depuis un autre PC.
export default function PendingModsBanner({
  onInstalled,
}: {
  onInstalled: () => void;
}) {
  const { t } = useTranslation();
  const { count, installing, install, dismiss } = usePendingMods(onInstalled);
  if (count === 0) return null;
  return (
    <Alert
      severity="info"
      action={
        <Stack direction="row" spacing={1}>
          <Button
            color="inherit"
            size="small"
            onClick={dismiss}
            disabled={installing}
          >
            {t("valheimMods.pending.dismiss")}
          </Button>
          <Button
            color="inherit"
            size="small"
            onClick={install}
            disabled={installing}
            startIcon={
              installing ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
          >
            {installing
              ? t("valheimMods.pending.installing")
              : t("valheimMods.pending.install")}
          </Button>
        </Stack>
      }
    >
      {t("valheimMods.pending.message", { count })}
    </Alert>
  );
}
