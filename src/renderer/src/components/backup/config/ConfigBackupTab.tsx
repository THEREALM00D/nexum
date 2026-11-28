import { useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ConfigBackupEntry } from "@shared/types";
import { useConfigBackups } from "./useConfigBackups";
import ConfigBackupSettings from "./ConfigBackupSettings";
import ConfigBackupList from "./ConfigBackupList";
import ConfigDiffDialog from "./ConfigDiffDialog";

/** Onglet « Configuration » de la page Sauvegardes (tous les jeux). */
export default function ConfigBackupTab() {
  const { t } = useTranslation();
  const backups = useConfigBackups();
  const [diffOf, setDiffOf] = useState<ConfigBackupEntry | null>(null);

  // Même confirmation que les sauvegardes du monde.
  const restore = async (backup: ConfigBackupEntry) => {
    if (!window.confirm(t("configBackup.list.restoreConfirm"))) return;
    if (await backups.restore(backup)) setDiffOf(null);
  };

  return (
    <Box
      sx={{
        display: "grid",
        // Une colonne sous 900 px de large (réglages au-dessus de la liste).
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: "340px minmax(0, 1fr)",
        },
        gap: 3,
        alignItems: "start",
        flex: 1,
        minHeight: 0,
      }}
    >
      <ConfigBackupSettings
        settings={backups.settings}
        loading={backups.loading}
        disabled={backups.settingsFailed}
        files={backups.files}
        onChange={backups.changeSettings}
      />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <ConfigBackupList
          backups={backups.backups}
          loading={backups.loading}
          busy={backups.busy}
          creating={backups.creating}
          canRestore={backups.canRestore}
          onCreate={() => void backups.create()}
          onDiff={setDiffOf}
          onRestore={(backup) => void restore(backup)}
          onDelete={(backup) => {
            if (window.confirm(t("configBackup.list.deleteConfirm")))
              void backups.remove(backup);
          }}
        />
      </Box>
      <ConfigDiffDialog
        serverId={backups.serverId}
        backup={diffOf}
        canRestore={backups.canRestore}
        busy={backups.busy}
        onClose={() => setDiffOf(null)}
        onRestore={(backup) => void restore(backup)}
      />
    </Box>
  );
}
