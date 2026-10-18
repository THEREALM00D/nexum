import { Alert } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import ConfigPage from "../../../../components/config/ConfigPage";
import { dragonwildsConfigService } from "../../services/configService";
import { BEACON_OFFSET, FIELD_GROUPS } from "./fields";

export default function DragonwildsConfig() {
  const { t } = useTranslation();
  return (
    <ConfigPage
      titleKey="dragonwildsConfig.title"
      subtitleKey="dragonwildsConfig.subtitle"
      folderPath={(serverPath) =>
        `${serverPath}/RSDragonwilds/Saved/Config/WindowsServer`
      }
      fieldGroups={FIELD_GROUPS}
      i18nFieldsPrefix="dragonwildsConfig.fields"
      readConfig={dragonwildsConfigService.readConfig}
      writeConfig={dragonwildsConfigService.writeConfig}
      lockWhileRunning
      // Le port beacon suit le port de jeu (règle du dépôt officiel), il
      // reste modifiable ensuite.
      onFieldChange={(key, value, setFieldValue) => {
        if (key === "Port" && Number(value) > 0) {
          setFieldValue("BeaconPort", Number(value) + BEACON_OFFSET);
        }
      }}
      notice={
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="inherit" />}
          sx={{ fontSize: 13 }}
        >
          {t("dragonwildsConfig.notice")}
        </Alert>
      }
    />
  );
}
