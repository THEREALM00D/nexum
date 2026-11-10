import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  count: number;
  installing: boolean;
  /** Une installation est en cours (celle-ci ou une autre de la page). */
  disabled: boolean;
  install: () => void;
  dismiss: () => void;
}

// Mods à réinstaller après l'import d'un serveur depuis un autre PC
// (état : `usePendingMods`, remonté dans la page).
export default function PendingModsBanner({
  count,
  installing,
  disabled,
  install,
  dismiss,
}: Props) {
  const { t } = useTranslation();
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
            disabled={disabled}
          >
            {t("valheimMods.pending.dismiss")}
          </Button>
          <Button
            color="inherit"
            size="small"
            onClick={install}
            disabled={disabled}
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
