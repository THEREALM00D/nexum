import { Alert } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import ConfigPage from "../../../../components/config/ConfigPage";
import { arkConfigService } from "../../services/configService";
import { FIELD_GROUPS } from "./fields";

export default function ArkConfig() {
  const { t } = useTranslation();
  return (
    <ConfigPage
      titleKey="arkConfig.title"
      subtitleKey="arkConfig.subtitle"
      folderPath={(serverPath) =>
        `${serverPath}/ShooterGame/Saved/Config/WindowsServer`
      }
      fieldGroups={FIELD_GROUPS}
      i18nFieldsPrefix="arkConfig.fields"
      readConfig={arkConfigService.readConfig}
      writeConfig={arkConfigService.writeConfig}
      // Le serveur réécrit GameUserSettings.ini à l'arrêt (vérifié).
      lockWhileRunning
      notice={
        <Alert severity="info" icon={<InfoOutlinedIcon fontSize="inherit" />}>
          {t("arkConfig.notice")}
        </Alert>
      }
    />
  );
}
