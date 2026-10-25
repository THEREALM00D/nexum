import { useEffect, useState } from "react";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import SimpleDashboard from "../../../../components/server/SimpleDashboard";
import { dragonwildsConfigService } from "../../services/configService";

export default function DragonwildsDashboard() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { status, serverPath } = state;
  // Sans Player ID, le démarrage est refusé : on le dit avant le clic.
  const [ownerMissing, setOwnerMissing] = useState(false);

  useEffect(() => {
    if (!serverPath) return;
    dragonwildsConfigService
      .readConfig()
      .then((cfg) => setOwnerMissing(!String(cfg.OwnerId ?? "").trim()))
      .catch(() => {});
  }, [serverPath, status]);

  return (
    <SimpleDashboard
      titleKey="dragonwildsDashboard.title"
      noServerPathKey="dragonwildsDashboard.noServerPath"
      infoKey="dragonwildsDashboard.noApi"
      showLogs
      warning={
        ownerMissing && (
          <Alert severity="warning" sx={{ fontSize: 13 }}>
            {t("dragonwildsDashboard.ownerMissing")}
          </Alert>
        )
      }
    />
  );
}
