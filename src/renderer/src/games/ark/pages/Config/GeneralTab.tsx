import { memo } from "react";
import { Alert, Button, Stack } from "@mui/material";
import InputIcon from "@mui/icons-material/Input";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import ConfigPage from "../../../../components/config/ConfigPage";
import { arkConfigService } from "../../services/configService";
import { FIELD_GROUPS } from "./fields";
import { useConfigSaved } from "./ConfigTabs";

export const PAGE_WIDTH = 960;

export const configFolder = (serverPath: string) =>
  `${serverPath}/ShooterGame/Saved/Config/WindowsServer`;

/**
 * Onglet Général : page partagée ConfigPage, sans son en-tête (`embedded` :
 * en-tête et onglets sont ceux de la page Config). En `memo` (prop stable) :
 * un changement d'onglet ne la re-rend pas.
 */
function GeneralTab({ onOpenImport }: { onOpenImport: () => void }) {
  const { t } = useTranslation();
  const { revision, saved } = useConfigSaved();
  return (
    <ConfigPage
      embedded
      reloadKey={revision}
      onSaved={saved}
      titleKey="arkConfig.title"
      subtitleKey="arkConfig.subtitle"
      folderPath={configFolder}
      fieldGroups={FIELD_GROUPS}
      i18nFieldsPrefix="arkConfig.fields"
      readConfig={arkConfigService.readConfig}
      writeConfig={arkConfigService.writeConfig}
      // Le serveur réécrit GameUserSettings.ini à l'arrêt (vérifié).
      lockWhileRunning
      notice={
        <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <Alert
            severity="info"
            icon={<InfoOutlinedIcon fontSize="inherit" />}
            sx={{ alignSelf: "stretch" }}
          >
            {t("arkConfig.notice")}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<InputIcon />}
            onClick={onOpenImport}
          >
            {t("arkLaunchImport.openDialog")}
          </Button>
        </Stack>
      }
    />
  );
}

export default memo(GeneralTab);
