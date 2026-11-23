import { Alert, Button, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  running: boolean;
  argsMods: number[];
  disabled: boolean;
  onTakeFromArgs: () => void;
}

// Avertissements au-dessus de la liste : changements pris au prochain
// démarrage, -mods= encore dans les arguments de lancement.
export default function ModsNotices({
  running,
  argsMods,
  disabled,
  onTakeFromArgs,
}: Props) {
  const { t } = useTranslation();
  if (!running && argsMods.length === 0) return null;

  return (
    <Stack spacing={1.5}>
      {running && <Alert severity="info">{t("arkMods.notices.running")}</Alert>}
      {argsMods.length > 0 && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              disabled={disabled}
              onClick={onTakeFromArgs}
            >
              {t("arkMods.notices.argsButton")}
            </Button>
          }
        >
          {t("arkMods.notices.args", { ids: argsMods.join(", ") })}
        </Alert>
      )}
    </Stack>
  );
}
