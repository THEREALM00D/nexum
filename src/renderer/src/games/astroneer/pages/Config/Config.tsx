import ConfigPage from "../../../../components/config/ConfigPage";
import { astroConfigService } from "../../services/configService";
import { FIELD_GROUPS } from "./fields";

export default function AstroneerConfig() {
  return (
    <ConfigPage
      titleKey="astroneerConfig.title"
      subtitleKey="astroneerConfig.subtitle"
      folderPath={(serverPath) =>
        `${serverPath}/Astro/Saved/Config/WindowsServer`
      }
      fieldGroups={FIELD_GROUPS}
      i18nFieldsPrefix="astroneerConfig.fields"
      readConfig={astroConfigService.readConfig}
      writeConfig={astroConfigService.writeConfig}
      lockWhileRunning
    />
  );
}
