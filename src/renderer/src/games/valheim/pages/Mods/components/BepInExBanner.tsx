import { Alert, Button, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  detected: boolean | null;
  installing: boolean;
  onInstall: () => void;
}

export default function BepInExBanner({
  detected,
  installing,
  onInstall,
}: Props) {
  const { t } = useTranslation();
  if (detected === null || detected === true) return null;
  return (
    <Alert
      severity="warning"
      action={
        <Button
          color="inherit"
          size="small"
          onClick={onInstall}
          disabled={installing}
          startIcon={
            installing ? (
              <CircularProgress size={14} color="inherit" />
            ) : undefined
          }
        >
          {installing
            ? t("valheimMods.bepinex.installing")
            : t("valheimMods.bepinex.install")}
        </Button>
      }
    >
      {t("valheimMods.bepinex.warning")}
    </Alert>
  );
}
