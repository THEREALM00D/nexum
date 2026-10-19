import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import { useValheimConfig } from "./hooks/useValheimConfig";
import { useValheimAdminLists } from "./hooks/useValheimAdminLists";
import GeneralSection from "./components/GeneralSection";
import WorldSection from "./components/WorldSection";
import ModifiersSection from "./components/ModifiersSection";
import NetworkSection from "./components/NetworkSection";
import AdvancedSection from "./components/AdvancedSection";
import AdministrationSection from "./components/AdministrationSection";
import FormPage from "../../../../components/common/FormPage";
import LoadingSkeleton from "../../../../components/common/LoadingSkeleton";

export default function ValheimConfig() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { config, loading, saved, handleChange, handleSave } =
    useValheimConfig();
  const { adminList, bannedList, permittedList } = useValheimAdminLists();

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
          {t("valheimConfig.noServerPath")}
        </Typography>
      </Box>
    );
  }

  return (
    <FormPage>
      <Box>
        <Typography variant="h6">{t("valheimConfig.title")}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("valheimConfig.subtitle")}
          </Typography>
          <Tooltip title={t("valheimConfig.openServerFolder")}>
            <IconButton
              size="small"
              onClick={() => window.api.shell.openPath(state.serverPath)}
            >
              <FolderOpenIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <GeneralSection
        config={config}
        onChange={handleChange}
        loading={loading}
      />
      <WorldSection config={config} onChange={handleChange} loading={loading} />
      <ModifiersSection
        config={config}
        onChange={handleChange}
        loading={loading}
      />
      <NetworkSection
        config={config}
        onChange={handleChange}
        loading={loading}
      />
      <AdvancedSection
        config={config}
        onChange={handleChange}
        loading={loading}
      />

      <LoadingSkeleton loading={loading} sx={{ alignSelf: "flex-start" }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          color={saved ? "success" : "primary"}
          onClick={handleSave}
          sx={{ alignSelf: "flex-start" }}
        >
          {saved ? t("valheimConfig.saved") : t("valheimConfig.save")}
        </Button>
      </LoadingSkeleton>

      <AdministrationSection
        adminList={adminList}
        bannedList={bannedList}
        permittedList={permittedList}
      />
    </FormPage>
  );
}
