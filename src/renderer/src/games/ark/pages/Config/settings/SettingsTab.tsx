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
import LoadingSkeleton from "../../../../../components/common/LoadingSkeleton";
import { useArkSettings } from "./hooks/useArkSettings";
import { useSettingsGroups } from "./hooks/useSettingsGroups";
import SettingsGroup from "./components/SettingsGroup";

/**
 * Onglet Réglages de jeu : tous les réglages ASA du catalogue
 * (src/shared/arkSettings) par thème, plus ceux des fichiers que Nexum ne
 * connaît pas. Seules les modifications sont écrites.
 */
export default function SettingsTab() {
  const { t } = useTranslation();
  const settings = useArkSettings();
  const groups = useSettingsGroups(settings.unknown);
  const disabled = settings.locked || settings.saving;

  return (
    <Stack spacing={2}>
      <Alert severity="info">{t("arkSettingsUi.notice")}</Alert>
      {settings.locked && (
        <Alert severity="warning">{t("configPage.lockedWhileRunning")}</Alert>
      )}

      <LoadingSkeleton loading={settings.loading} fullWidth>
        <Stack
          direction="row"
          useFlexGap
          sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "center" }}
        >
          <TextField
            size="small"
            value={groups.search}
            onChange={(event) => groups.setSearch(event.target.value)}
            placeholder={t("arkSettingsUi.search")}
            slotProps={{
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
      </LoadingSkeleton>

      {groups.searching && groups.groups.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("arkSettingsUi.noResults", { query: groups.search })}
        </Typography>
      )}
      <Stack spacing={1}>
        {groups.groups.map(({ group, items }) => (
          <LoadingSkeleton key={group} loading={settings.loading} fullWidth>
            <SettingsGroup
              group={group}
              items={items}
              expanded={groups.isExpanded(group)}
              onToggle={() => groups.toggle(group)}
              settings={settings}
            />
          </LoadingSkeleton>
        ))}
      </Stack>
    </Stack>
  );
}
