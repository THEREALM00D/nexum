import { memo } from "react";
import {
  Alert,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import LoadingSkeleton, {
  skeletonRows,
} from "../../../../../components/common/LoadingSkeleton";
import ScrollPanel from "../../../../../components/common/ScrollPanel";
import { useArkSettings } from "./hooks/useArkSettings";
import { useSettingsGroups } from "./hooks/useSettingsGroups";
import SettingsGroupHeader from "./components/SettingsGroupHeader";
import SettingsList from "./components/SettingsList";

const noop = () => {};

/**
 * Onglet Réglages de jeu : tous les réglages ASA du catalogue
 * (src/shared/arkSettings) par thème, plus ceux des fichiers que Nexum ne
 * connaît pas et ceux des mods. Seules les modifications sont écrites. La
 * liste défile seule (ScrollPanel) : recherche et Enregistrer restent en vue.
 */
function SettingsTab() {
  const { t } = useTranslation();
  const settings = useArkSettings();
  const groups = useSettingsGroups(settings.unknown);
  const disabled = settings.locked || settings.saving;

  const header = (
    <Stack
      direction="row"
      useFlexGap
      sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "center", p: 2, pb: 1 }}
    >
      <TextField
        size="small"
        value={groups.search}
        onChange={(event) => groups.setSearch(event.target.value)}
        placeholder={t("arkSettingsUi.search")}
        slotProps={{
          htmlInput: { "aria-label": t("arkSettingsUi.search") },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ flex: "1 1 280px" }}
      />
      {settings.changeCount > 0 && (
        <Button onClick={settings.discard} disabled={settings.saving}>
          {t("arkSettingsUi.discard")}
        </Button>
      )}
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        disabled={disabled || settings.changeCount === 0}
        onClick={() => void settings.save()}
      >
        {settings.changeCount > 0
          ? t("arkSettingsUi.saveCount", { count: settings.changeCount })
          : t("arkSettingsUi.save")}
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={2} sx={{ width: "100%", minHeight: 0 }}>
      <Alert severity="info">{t("arkSettingsUi.notice")}</Alert>
      {settings.running && (
        <Alert severity="warning">{t("configPage.lockedWhileRunning")}</Alert>
      )}
      <ScrollPanel
        padding={0}
        minHeight={320}
        header={
          <LoadingSkeleton loading={settings.loading} fullWidth>
            {header}
          </LoadingSkeleton>
        }
      >
        {settings.loading ? (
          skeletonRows(
            <SettingsGroupHeader
              group="rates"
              count={12}
              expanded={false}
              onToggle={noop}
            />,
            10,
          )
        ) : groups.searching && groups.groups.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary", p: 2 }}>
            {t("arkSettingsUi.noResults", { query: groups.search })}
          </Typography>
        ) : (
          <SettingsList
            groups={groups.groups}
            isExpanded={groups.isExpanded}
            onToggle={groups.toggle}
            settings={settings}
            resetKey={groups.search}
          />
        )}
      </ScrollPanel>
    </Stack>
  );
}

// Sans props : en memo, un changement d'onglet de la page ne le re-rend pas.
export default memo(SettingsTab);
