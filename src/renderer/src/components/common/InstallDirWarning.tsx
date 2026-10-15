import { useEffect, useState } from "react";
import { Alert, type SxProps, type Theme } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  path: string;
  sx?: SxProps<Theme>;
}

/**
 * Avertit quand un dossier choisi par l'utilisateur (serveur, sauvegardes
 * Valheim, backups) est rangé dans le dossier d'installation de Nexum : les
 * versions ≤ 0.12.3 vident ce dossier à chaque mise à jour.
 */
export default function InstallDirWarning({ path, sx }: Props) {
  const { t } = useTranslation();
  const [installDir, setInstallDir] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    window.api.app
      .installDirConflict(path)
      .then((dir) => {
        if (!cancelled) setInstallDir(dir);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!installDir) return null;
  return (
    <Alert severity="warning" sx={sx}>
      {t("installDir.warning", { dir: installDir })}
    </Alert>
  );
}
