import {
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import type { LaunchArgsConfig } from "@shared/types";
import { SkeletonChildren } from "../../../components/common/LoadingSkeleton";

export default function LaunchArgsCard({
  launchArgs,
  loading,
  onCustomArgsChange,
  onUpdate,
}: {
  launchArgs: LaunchArgsConfig;
  /** Arguments pas encore lus : chaque réglage en skeleton. */
  loading: boolean;
  onCustomArgsChange: (customArgs: string) => void;
  onUpdate: (patch: Partial<LaunchArgsConfig>) => void;
}) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {t("install.launchArgs.title")}
      </Typography>
      <Stack spacing={1.5}>
        <SkeletonChildren loading={loading}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={launchArgs.publicLobby}
                onChange={(e) => onUpdate({ publicLobby: e.target.checked })}
              />
            }
            label={
              <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2">
                  {t("install.launchArgs.publicLobby")}
                </Typography>
                <Tooltip
                  arrow
                  placement="top"
                  title={t("install.launchArgs.publicLobbyTooltip")}
                >
                  <InfoOutlinedIcon
                    sx={{
                      fontSize: 16,
                      color: "text.secondary",
                      cursor: "help",
                    }}
                  />
                </Tooltip>
              </Stack>
            }
            sx={{
              justifyContent: "space-between",
              ml: 0,
              flexDirection: "row-reverse",
            }}
          />
          <Divider />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={launchArgs.performanceFlags}
                onChange={(e) =>
                  onUpdate({ performanceFlags: e.target.checked })
                }
              />
            }
            label={
              <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2">
                  {t("install.launchArgs.performanceFlags")}
                </Typography>
                <Tooltip
                  arrow
                  placement="top"
                  title={t("install.launchArgs.performanceFlagsTooltip")}
                >
                  <InfoOutlinedIcon
                    sx={{
                      fontSize: 16,
                      color: "text.secondary",
                      cursor: "help",
                    }}
                  />
                </Tooltip>
              </Stack>
            }
            sx={{
              justifyContent: "space-between",
              ml: 0,
              flexDirection: "row-reverse",
            }}
          />
          <Divider />
          <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
            <Stack
              direction="row"
              sx={{ alignItems: "center", gap: 0.5, minWidth: 200 }}
            >
              <Typography variant="body2">
                {t("install.launchArgs.customArgs")}
              </Typography>
              <Tooltip
                arrow
                placement="top"
                title={t("install.launchArgs.customArgsTooltip")}
              >
                <InfoOutlinedIcon
                  sx={{ fontSize: 16, color: "text.secondary", cursor: "help" }}
                />
              </Tooltip>
            </Stack>
            <TextField
              size="small"
              placeholder="-log -port=8211"
              value={launchArgs.customArgs}
              onChange={(e) => onCustomArgsChange(e.target.value)}
              onBlur={() => onUpdate({ customArgs: launchArgs.customArgs })}
              sx={{ flex: 1 }}
            />
          </Stack>
        </SkeletonChildren>
      </Stack>
    </Paper>
  );
}
