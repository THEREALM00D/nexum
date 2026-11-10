import { useEffect, useState } from "react";
import { Alert, type SxProps, type Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";

interface Props {
  path: string;
  /** Chemin lu par le serveur du jeu : relatif à son dossier (`./savegame`). */
  serverRelative?: boolean;
  /** Dossier du serveur pour `serverRelative` quand ce n'est pas le serveur actif (import). */
  basePath?: string;
  sx?: SxProps<Theme>;
}

/**
 * Avertit quand un dossier choisi par l'utilisateur (serveur, sauvegardes
 * Valheim, backups) est rangé dans le dossier d'installation de Nexum : les
 * versions ≤ 0.12.3 vident ce dossier à chaque mise à jour.
 */
export default function InstallDirWarning({
  path,
  serverRelative = false,
  basePath: base,
  sx,
}: Props) {
  const { t } = useTranslation();
  const { state } = useServer();
  const [installDir, setInstallDir] = useState<string | null>(null);
  const basePath = serverRelative ? (base ?? state.serverPath) : undefined;

  useEffect(() => {
    let cancelled = false;
    window.api.app
      .installDirConflict(path, basePath)
      .then((dir) => {
        if (!cancelled) setInstallDir(dir);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [path, basePath]);

  if (!installDir) return null;
  return (
    <Alert severity="warning" sx={sx}>
      {t("installDir.warning", { dir: installDir })}
    </Alert>
  );
}
