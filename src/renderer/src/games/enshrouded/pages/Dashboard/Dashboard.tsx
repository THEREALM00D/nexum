import { useEffect, useState } from "react";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import SimpleDashboard from "../../../../components/server/SimpleDashboard";
import { enshroudedConfigService } from "../../services/configService";

export default function EnshroudedDashboard() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { status, serverPath } = state;
  // Un groupe sans mot de passe laisse entrer tout le monde avec ses droits :
  // on le dit ici, pas seulement dans la page Config.
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    if (!serverPath) return;
    enshroudedConfigService
      .readGroups()
      .then((groups) =>
        setOpenGroups(
          groups.filter((g) => !g.password.trim()).map((g) => g.name),
        ),
      )
      .catch(() => {});
  }, [serverPath, status]);

  return (
    <SimpleDashboard
      titleKey="enshroudedDashboard.title"
      noServerPathKey="enshroudedDashboard.noServerPath"
      infoKey="enshroudedDashboard.noApi"
      showLogs
      warning={
        openGroups.length > 0 && (
          <Alert severity="warning" sx={{ fontSize: 13 }}>
            {t("enshroudedDashboard.openGroups", {
              groups: openGroups.join(", "),
            })}
          </Alert>
        )
      }
    />
  );
}
