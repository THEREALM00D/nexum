import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { ModRegistry } from "@shared/types";
import DownloadIcon from "@mui/icons-material/Download";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useTranslation } from "react-i18next";
import { dialogService } from "../../../../services/dialogService";
import { useValheimMods } from "./hooks/useValheimMods";
import { useValheimModConfigs } from "./hooks/useValheimModConfigs";
import BepInExBanner from "./components/BepInExBanner";
import InstalledModsList from "./components/InstalledModsList";
import ModBrowser from "./components/ModBrowser";
import DepsDialog from "./components/DepsDialog";
import ConfigFilesList from "./components/ConfigFilesList";
import ConfigFileEditorDialog from "./components/ConfigFileEditorDialog";
import { REGISTRY_LABEL } from "./utils/modPageUrl";

type MainTab = "installed" | "browse" | "configs";

export default function ValheimMods() {
  const { t } = useTranslation();
  const [mainTab, setMainTab] = useState<MainTab>("installed");
  const [thunderstoreDialog, setThunderstoreDialog] = useState(false);
  const [thunderstoreCode, setThunderstoreCode] = useState("");
  const [installRegistry, setInstallRegistry] =
    useState<ModRegistry>("thunderstore");
  const [profileDialog, setProfileDialog] = useState(false);
  const [profileCode, setProfileCode] = useState("");

  const {
    bepInEx,
    installedMods,
    browseTab,
    browseRegistry,
    browseMods,
    browseLoading,
    browseError,
    installing,
    installingBepInEx,
    checkingUpdates,
    locale,
    pendingDeps,
    updates,
    deprecatedCodes,
    handleTabChange,
    handleBrowseRegistryChange,
    handleSearch,
    handleRemoveMod,
    handleToggleMod,
    handleInstallBepInEx,
    handleInstallMod,
    handleImportProfile,
    handleImportProfileFile,
    handleRefreshUpdates,
    handleUpdateAll,
    handleInstallAllDeps,
    handleDismissDeps,
  } = useValheimMods();

  const {
    files: configFiles,
    editing: editingConfig,
    entries: configEntries,
    saving: savingConfig,
    dirty: configDirty,
    updateEntry: updateConfigEntry,
    openFile: openConfigFile,
    closeEditor: closeConfigEditor,
    save: saveConfigFile,
  } = useValheimModConfigs();

  const submitThunderstore = async () => {
    if (!thunderstoreCode.trim()) return;
    setThunderstoreDialog(false);
    await handleInstallMod(installRegistry, thunderstoreCode.trim());
    setThunderstoreCode("");
  };

  const submitProfile = async () => {
    if (!profileCode.trim()) return;
    setProfileDialog(false);
    await handleImportProfile(profileCode.trim());
    setProfileCode("");
  };

  const importProfileFromFile = async () => {
    const filePath = await dialogService.selectFile([
      { name: "Profil r2modman/Gale", extensions: ["r2z", "zip"] },
    ]);
    if (!filePath) return;
    setProfileDialog(false);
    await handleImportProfileFile(filePath);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">{t("valheimMods.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("valheimMods.subtitle")}
        </Typography>
      </Box>

      <BepInExBanner
        detected={bepInEx}
        installing={installingBepInEx}
        onInstall={handleInstallBepInEx}
      />

      {/* Boutons Thunderstore */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "flex-start", flexWrap: "wrap" }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={() => setThunderstoreDialog(true)}
          disabled={installing}
        >
          {t("valheimMods.thunderstore.title")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={() => setProfileDialog(true)}
          disabled={installing}
        >
          {t("valheimMods.thunderstore.importProfile")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FolderOpenIcon />}
          onClick={() => window.api.valheim.mods.openPluginsFolder()}
        >
          {t("valheimMods.folders.plugins")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SettingsIcon />}
          onClick={() => window.api.valheim.mods.openConfigFolder()}
        >
          {t("valheimMods.folders.config")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={
            checkingUpdates ? <CircularProgress size={14} /> : <RefreshIcon />
          }
          onClick={handleRefreshUpdates}
          disabled={installing || checkingUpdates}
        >
          {t("valheimMods.updates.refresh")}
        </Button>
        {updates.length > 0 && (
          <Button
            variant="contained"
            size="small"
            color="warning"
            startIcon={<SystemUpdateAltIcon />}
            onClick={handleUpdateAll}
            disabled={installing}
          >
            {t("valheimMods.updates.updateAll", { count: updates.length })}
          </Button>
        )}
      </Stack>

      {installing && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("valheimMods.nxm.installing")}
          </Typography>
        </Box>
      )}

      <Box>
        <Tabs
          value={mainTab}
          onChange={(_, v) => setMainTab(v as MainTab)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tab
            value="installed"
            label={
              <Badge
                badgeContent={installedMods.length}
                color="primary"
                max={99}
              >
                <Box sx={{ pr: installedMods.length > 0 ? 1.5 : 0 }}>
                  {t("valheimMods.tabs.installed")}
                </Box>
              </Badge>
            }
          />
          <Tab value="browse" label={t("valheimMods.tabs.browse")} />
          <Tab value="configs" label={t("valheimMods.tabs.configs")} />
        </Tabs>

        {mainTab === "installed" && (
          <InstalledModsList
            mods={installedMods}
            locale={locale}
            updates={updates}
            deprecatedCodes={deprecatedCodes}
            onRemove={handleRemoveMod}
            onToggle={handleToggleMod}
            onUpdate={handleInstallMod}
          />
        )}

        {mainTab === "browse" && (
          <ModBrowser
            tab={browseTab}
            registry={browseRegistry}
            mods={browseMods}
            loading={browseLoading}
            error={browseError}
            onTabChange={handleTabChange}
            onRegistryChange={handleBrowseRegistryChange}
            onSearch={handleSearch}
            onInstallVersion={handleInstallMod}
          />
        )}

        {mainTab === "configs" && (
          <ConfigFilesList
            files={configFiles}
            locale={locale}
            onOpen={openConfigFile}
          />
        )}
      </Box>

      <ConfigFileEditorDialog
        fileName={editingConfig}
        entries={configEntries}
        saving={savingConfig}
        dirty={configDirty}
        onChange={updateConfigEntry}
        onClose={closeConfigEditor}
        onSave={saveConfigFile}
      />

      {/* Dialog import package Thunderstore individuel */}
      <Dialog
        open={thunderstoreDialog}
        onClose={() => setThunderstoreDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("valheimMods.thunderstore.title")}</DialogTitle>
        <DialogContent>
          <ToggleButtonGroup
            value={installRegistry}
            exclusive
            size="small"
            onChange={(_, v) => v && setInstallRegistry(v as ModRegistry)}
            sx={{ mt: 1, mb: 1 }}
          >
            <ToggleButton value="thunderstore">
              {REGISTRY_LABEL.thunderstore}
            </ToggleButton>
            <ToggleButton value="hexium">{REGISTRY_LABEL.hexium}</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={t("valheimMods.thunderstore.label")}
            helperText={t("valheimMods.thunderstore.helper")}
            placeholder="denikson-BepInExPack_Valheim-5.4.2202"
            value={thunderstoreCode}
            onChange={(e) => setThunderstoreCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitThunderstore()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setThunderstoreDialog(false)}>
            {t("valheimMods.browse.filesDialog.close")}
          </Button>
          <Button
            variant="contained"
            disabled={!thunderstoreCode.trim()}
            onClick={submitThunderstore}
          >
            {t("valheimMods.thunderstore.install")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog import profil Thunderstore */}
      <Dialog
        open={profileDialog}
        onClose={() => setProfileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("valheimMods.thunderstore.importProfile")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            size="small"
            label={t("valheimMods.thunderstore.profileLabel")}
            helperText={t("valheimMods.thunderstore.profileHelper")}
            value={profileCode}
            onChange={(e) => setProfileCode(e.target.value)}
            sx={{ mt: 1, fontFamily: "monospace" }}
          />
          <Divider sx={{ my: 2 }}>{t("common.or")}</Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={importProfileFromFile}
          >
            {t("valheimMods.thunderstore.importProfileFile")}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialog(false)}>
            {t("valheimMods.browse.filesDialog.close")}
          </Button>
          <Button
            variant="contained"
            disabled={!profileCode.trim()}
            onClick={submitProfile}
          >
            {t("valheimMods.thunderstore.install")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog dépendances manquantes */}
      {pendingDeps && (
        <DepsDialog
          modName={pendingDeps.modName}
          deps={pendingDeps.deps}
          onInstallAll={handleInstallAllDeps}
          onDismiss={handleDismissDeps}
        />
      )}
    </Stack>
  );
}
