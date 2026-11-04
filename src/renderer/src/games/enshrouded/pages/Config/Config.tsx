import {
  Alert,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import FormPage from "../../../../components/common/FormPage";
import LoadingSkeleton from "../../../../components/common/LoadingSkeleton";
import { useEnshroudedConfig } from "./hooks/useEnshroudedConfig";
import { useEnshroudedGroups } from "./hooks/useEnshroudedGroups";
import GeneralSection from "./components/GeneralSection";
import NetworkSection from "./components/NetworkSection";
import DifficultySection from "./components/DifficultySection";
import GameSettingsSection from "./components/GameSettingsSection";
import AdvancedSection from "./components/AdvancedSection";
import UserGroupsSection from "./components/UserGroupsSection";

// Même structure que la page Config de Valheim : une carte par thème, un
// bouton Enregistrer, puis les groupes enregistrés à part.
export default function EnshroudedConfig() {
  const { t } = useTranslation();
  const { state } = useServer();
  const {
    config,
    loading,
    locked,
    saved,
    handleChange,
    handleSettingChange,
    handleSave,
  } = useEnshroudedConfig();
  const groups = useEnshroudedGroups();

  if (!state.serverPath) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60%",
        }}
      >
        <Typography sx={{ color: "text.secondary" }}>
          {t("enshroudedConfig.noServerPath")}
        </Typography>
      </Box>
    );
  }

  const sectionProps = { config, onChange: handleChange, loading };

  return (
    <FormPage>
      <Box>
        <Typography variant="h6">{t("enshroudedConfig.title")}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("enshroudedConfig.subtitle")}
          </Typography>
          <Tooltip title={t("enshroudedConfig.openServerFolder")}>
            <IconButton
              size="small"
              onClick={() => window.api.shell.openPath(state.serverPath)}
            >
              <FolderOpenIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {locked && (
        <Alert severity="warning" sx={{ fontSize: 13 }}>
          {t("enshroudedConfig.lockedWhileRunning")}
        </Alert>
      )}

      <GeneralSection {...sectionProps} />
      <NetworkSection {...sectionProps} />
      <DifficultySection {...sectionProps} />
      <GameSettingsSection
        settings={config.gameSettings}
        loading={loading}
        onChange={handleSettingChange}
      />
      <AdvancedSection {...sectionProps} />

      <LoadingSkeleton loading={loading} sx={{ alignSelf: "flex-start" }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          color={saved ? "success" : "primary"}
          onClick={handleSave}
          disabled={locked}
          sx={{ alignSelf: "flex-start" }}
        >
          {saved ? t("enshroudedConfig.saved") : t("enshroudedConfig.save")}
        </Button>
      </LoadingSkeleton>

      <UserGroupsSection groups={groups} />
    </FormPage>
  );
}
