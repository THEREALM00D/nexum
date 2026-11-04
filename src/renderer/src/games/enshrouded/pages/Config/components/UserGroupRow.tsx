import { useState } from "react";
import {
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CasinoIcon from "@mui/icons-material/Casino";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import type { EnshroudedUserGroup } from "@shared/types";
import { randomPassword } from "../hooks/useEnshroudedGroups";

// Droits d'un groupe, dans l'ordre du fichier.
const PERMISSIONS = [
  "canKickBan",
  "canAccessInventories",
  "canEditWorld",
  "canEditBase",
  "canExtendBase",
] as const;

export default function UserGroupRow({
  group,
  onChange,
  onRemove,
}: {
  group: EnshroudedUserGroup;
  onChange: (patch: Partial<EnshroudedUserGroup>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const noPassword = group.password.trim() === "";

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <TextField
            label={t("enshroudedConfig.userGroups.name")}
            value={group.name}
            onChange={(e) => onChange({ name: e.target.value })}
            error={group.name.trim() === ""}
            size="small"
            sx={{ flex: "1 1 160px" }}
          />
          <TextField
            label={t("enshroudedConfig.userGroups.password")}
            value={group.password}
            onChange={(e) => onChange({ password: e.target.value })}
            type={showPassword ? "text" : "password"}
            helperText={
              noPassword ? t("enshroudedConfig.userGroups.noPassword") : " "
            }
            slotProps={{
              formHelperText: {
                sx: noPassword ? { color: "warning.main" } : undefined,
              },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={t("enshroudedConfig.userGroups.showPassword")}
                    >
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon fontSize="small" />
                        ) : (
                          <VisibilityIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("enshroudedConfig.userGroups.generate")}>
                      <IconButton
                        size="small"
                        onClick={() => onChange({ password: randomPassword() })}
                      >
                        <CasinoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
            size="small"
            sx={{ flex: "2 1 240px" }}
          />
          <TextField
            label={t("enshroudedConfig.userGroups.reservedSlots")}
            type="number"
            value={group.reservedSlots}
            onChange={(e) =>
              onChange({ reservedSlots: Math.max(0, Number(e.target.value)) })
            }
            slotProps={{ htmlInput: { min: 0, max: 16, step: 1 } }}
            size="small"
            sx={{ width: 140 }}
          />
          <Tooltip title={t("enshroudedConfig.userGroups.remove")}>
            <IconButton onClick={onRemove} sx={{ mt: 0.5 }}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack
          direction="row"
          useFlexGap
          sx={{ flexWrap: "wrap", columnGap: 2 }}
        >
          {PERMISSIONS.map((perm) => (
            <Tooltip
              key={perm}
              title={t(
                `enshroudedConfig.userGroups.permissions.${perm}.description`,
              )}
            >
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={group[perm]}
                    onChange={(e) => onChange({ [perm]: e.target.checked })}
                  />
                }
                label={t(
                  `enshroudedConfig.userGroups.permissions.${perm}.label`,
                )}
                slotProps={{ typography: { variant: "body2" } }}
              />
            </Tooltip>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
