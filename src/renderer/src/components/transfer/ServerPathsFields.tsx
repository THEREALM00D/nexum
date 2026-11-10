import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { GameType, TransferServerPaths } from "@shared/types";
import FolderField from "./FolderField";
import { useExeDetection } from "../../hooks/useExeDetection";
import InstallDirWarning from "../common/InstallDirWarning";

interface Props {
  gameType: GameType;
  paths: TransferServerPaths;
  /** Dossiers du PC d'origine : un champ n'apparaît que s'il y était rempli. */
  original: TransferServerPaths;
  onChange: (paths: TransferServerPaths) => void;
  duplicate?: boolean;
}

/**
 * Dossiers d'un serveur importé, à confirmer : les chemins de l'ancien PC
 * n'existent souvent pas sur le nouveau. Pastille « jeu absent » (le serveur
 * est importé quand même) et « déjà présent » (dossier d'un serveur existant).
 */
export default function ServerPathsFields({
  gameType,
  paths,
  original,
  onChange,
  duplicate,
}: Props) {
  const { t } = useTranslation();
  const exe = useExeDetection(true, paths.path, gameType);
  const set = (key: keyof TransferServerPaths) => (value: string) =>
    onChange({ ...paths, [key]: value });

  const serverHelper = duplicate
    ? t("transfer.paths.duplicateHelper")
    : exe === "missing"
      ? t("transfer.paths.notInstalledHelper")
      : undefined;

  return (
    <Stack spacing={2}>
      <FolderField
        label={t("transfer.paths.server")}
        value={paths.path}
        onChange={set("path")}
        helper={serverHelper}
        error={duplicate}
      />
      <InstallDirWarning path={paths.path} />
      {original.backupDir && (
        <FolderField
          label={t("transfer.paths.backupDir")}
          value={paths.backupDir}
          onChange={set("backupDir")}
          helper={t("transfer.paths.backupDirHelper")}
        />
      )}
      {original.backupDir && <InstallDirWarning path={paths.backupDir} />}
      {original.savedir && (
        <FolderField
          label={t("transfer.paths.savedir")}
          value={paths.savedir}
          onChange={set("savedir")}
          helper={t("transfer.paths.savedirHelper")}
        />
      )}
      {original.savedir && (
        <InstallDirWarning
          path={paths.savedir}
          serverRelative
          basePath={paths.path}
        />
      )}
      {original.logFile && (
        <FolderField
          label={t("transfer.paths.logFile")}
          value={paths.logFile}
          onChange={set("logFile")}
          file
        />
      )}
    </Stack>
  );
}
