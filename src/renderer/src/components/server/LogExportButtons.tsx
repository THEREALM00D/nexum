import { useState } from "react";
import { Button, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useServer } from "../../context/ServerContext";
import { useNotification } from "../../context/NotificationContext";

/**
 * Copier / enregistrer le log du serveur actif pour un rapport de bug.
 * Tout le log est exporté (pas « les N dernières lignes ») : la cause d'un
 * arrêt est souvent au début, les dernières lignes ne montrent que la
 * fermeture. L'en-tête évite de devoir demander la version et le jeu.
 */
export default function LogExportButtons() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const disabled = state.logs.length === 0;

  const buildReport = async (): Promise<string> => {
    const version = await window.api.app.getVersion();
    const game = state.activeServer?.gameType ?? "unknown";
    const header = [
      `Nexum ${version} · ${game} · ${new Date().toISOString()}`,
      "-".repeat(60),
    ];
    return [...header, ...state.logs].join("\n");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(await buildReport());
      notify(t("logs.copied"), "success");
    } catch {
      notify(t("logs.copyError"));
    }
  };

  const save = async () => {
    try {
      const game = state.activeServer?.gameType ?? "server";
      const name = `nexum-${game}-log-${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.txt`;
      const path = await window.api.logs.saveToFile(await buildReport(), name);
      if (!path) return;
      setSavedPath(path);
      notify(t("logs.saved"), "success");
    } catch (err) {
      notify(t("logs.saveError", { error: (err as Error).message }));
    }
  };

  return (
    <>
      <Tooltip title={t("logs.copyTooltip")}>
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={copy}
            disabled={disabled}
          >
            {t("logs.copy")}
          </Button>
        </span>
      </Tooltip>
      <Button
        size="small"
        variant="outlined"
        startIcon={<SaveAltIcon />}
        onClick={save}
        disabled={disabled}
      >
        {t("logs.save")}
      </Button>
      {savedPath && (
        <Button
          size="small"
          startIcon={<FolderOpenIcon />}
          onClick={() => window.api.shell.showItemInFolder(savedPath)}
        >
          {t("logs.showInFolder")}
        </Button>
      )}
    </>
  );
}
