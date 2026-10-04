import { Box, Button, Stack, Typography } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BugReportIcon from "@mui/icons-material/BugReport";
import GavelIcon from "@mui/icons-material/Gavel";
import { useTranslation } from "react-i18next";
import LanguageToggle from "../../components/common/LanguageToggle";
import UpdateIndicator from "../../components/Sidebar/UpdateIndicator";
import {
  DISCORD_INVITE_URL,
  DiscordIcon,
} from "../../components/Sidebar/DiscordButton";
import SettingsSection from "./components/SettingsSection";
import LaunchAtLoginSwitch from "./components/LaunchAtLoginSwitch";

const REPO = "https://github.com/THEREALM00D/nexum";
const open = (url: string) => window.api.shell.openExternal(url);

// Page globale (pas liée au serveur actif) : réglages de l'app elle-même.
// Les réglages propres à un serveur restent dans sa fenêtre (page Serveurs).
export default function Settings() {
  const { t, i18n } = useTranslation();
  const docsSuffix = i18n.resolvedLanguage === "en" ? "" : ".fr";

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Box>
        <Typography variant="h6">{t("settings.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("settings.subtitle")}
        </Typography>
      </Box>

      <SettingsSection
        title={t("settings.startup.title")}
        description={t("settings.startup.description")}
      >
        <LaunchAtLoginSwitch />
      </SettingsSection>

      <SettingsSection title={t("settings.language.title")}>
        <Box>
          <LanguageToggle size="medium" />
        </Box>
      </SettingsSection>

      <SettingsSection title={t("settings.updates.title")}>
        <UpdateIndicator align="left" />
      </SettingsSection>

      <SettingsSection title={t("settings.help.title")}>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
          <Button
            size="small"
            startIcon={<DiscordIcon />}
            onClick={() => open(DISCORD_INVITE_URL)}
          >
            Discord
          </Button>
          <Button
            size="small"
            startIcon={<MenuBookIcon />}
            onClick={() => open(`${REPO}#documentation`)}
          >
            {t("settings.help.docs")}
          </Button>
          <Button
            size="small"
            startIcon={<BugReportIcon />}
            onClick={() => open(`${REPO}/issues/new/choose`)}
          >
            {t("settings.help.bug")}
          </Button>
          <Button
            size="small"
            startIcon={<GavelIcon />}
            onClick={() =>
              open(`${REPO}/blob/main/docs/code-signing${docsSuffix}.md`)
            }
          >
            {t("settings.help.privacy")}
          </Button>
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t("settings.help.license")}
        </Typography>
      </SettingsSection>
    </Stack>
  );
}
