import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useTranslation } from "react-i18next";
import type { FirewallRuleStatus } from "@shared/types";
import { useState } from "react";
import RuleStatus from "./RuleStatus";
import { FONT_MONO } from "../../theme";

const HEAD_SX = {
  color: "text.secondary",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.6,
};

interface Props {
  rules: FirewallRuleStatus[];
  loading: boolean;
  isAdmin: boolean | null;
  onRefresh: () => Promise<void>;
  onToggle: (rule: FirewallRuleStatus) => Promise<void>;
  onApplyAll?: () => Promise<void>;
  onRemoveAll?: () => Promise<void>;
}

export default function StandardRules({
  rules,
  loading,
  isAdmin,
  onRefresh,
  onToggle,
  onApplyAll,
  onRemoveAll,
}: Props) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<string | null>(null);

  const handleToggle = async (rule: FirewallRuleStatus) => {
    setBusy(rule.name);
    await onToggle(rule);
    await onRefresh();
    setBusy(null);
  };

  const handleApplyAll = async () => {
    if (!onApplyAll) return;
    setBusy("all");
    await onApplyAll();
    await onRefresh();
    setBusy(null);
  };

  const handleRemoveAll = async () => {
    if (!onRemoveAll) return;
    setBusy("all");
    await onRemoveAll();
    await onRefresh();
    setBusy(null);
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 0.8,
            color: "text.secondary",
          }}
        >
          {t("network.standard.title")}
        </Typography>
        <Stack direction="row" spacing={1}>
          {onApplyAll && (
            <Tooltip title={t("network.standard.applyAllTooltip")}>
              <span>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={
                    busy === "all" ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <SyncIcon />
                    )
                  }
                  disabled={busy !== null || !isAdmin}
                  onClick={handleApplyAll}
                >
                  {t("network.standard.applyAll")}
                </Button>
              </span>
            </Tooltip>
          )}
          {onRemoveAll && (
            <Tooltip title={t("network.standard.removeAllTooltip")}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  disabled={busy !== null || !isAdmin}
                  onClick={handleRemoveAll}
                >
                  {t("network.standard.removeAll")}
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={HEAD_SX}>
                {t("network.standard.colRule")}
              </TableCell>
              <TableCell sx={HEAD_SX}>
                {t("network.standard.colPort")}
              </TableCell>
              <TableCell sx={HEAD_SX}>
                {t("network.standard.colProto")}
              </TableCell>
              <TableCell sx={HEAD_SX}>
                {t("network.standard.colState")}
              </TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow
                key={rule.name}
                sx={{ "&:last-child td": { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="body2">{rule.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: FONT_MONO }}>
                    {rule.port}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={rule.protocol}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 10 }}
                  />
                </TableCell>
                <TableCell>
                  <RuleStatus active={rule.active} />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant={rule.active ? "outlined" : "contained"}
                    color={rule.active ? "error" : "success"}
                    disabled={busy !== null || !isAdmin}
                    onClick={() => handleToggle(rule)}
                    sx={{ minWidth: 90 }}
                  >
                    {busy === rule.name ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : rule.active ? (
                      t("network.standard.disable")
                    ) : (
                      t("network.standard.enable")
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
