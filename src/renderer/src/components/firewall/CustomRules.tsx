import { useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import type { FirewallRuleStatus } from "@shared/types";
import { useNotification } from "../../context/NotificationContext";
import RuleStatus from "./RuleStatus";
import { FONT_MONO } from "../../theme";
import { firewallErrorMessage } from "./useNamedRulesFirewall";

const HEAD_SX = {
  color: "text.secondary",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0.6,
};

interface Props {
  rules: FirewallRuleStatus[];
  onRefresh: () => Promise<void>;
}

export default function CustomRules({ rules, onRefresh }: Props) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [newName, setNewName] = useState("");
  const [newPort, setNewPort] = useState("");
  const [newProtocol, setNewProtocol] = useState<"TCP" | "UDP">("UDP");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async () => {
    const port = parseInt(newPort, 10);
    if (!newName.trim() || isNaN(port) || port < 1 || port > 65535) {
      notify(t("network.custom.invalidInput"), "warning");
      return;
    }
    setCreating(true);
    const res = await window.api.firewall.createCustomRule(
      newName.trim(),
      port,
      newProtocol,
    );
    if (!res.success) {
      notify(
        res.error
          ? firewallErrorMessage(t, res.error)
          : t("network.custom.createErrorFallback"),
        "error",
      );
    } else {
      notify(t("network.custom.created", { name: newName.trim() }), "success");
      setNewName("");
      setNewPort("");
      await onRefresh();
    }
    setCreating(false);
  };

  const handleDelete = async (rule: FirewallRuleStatus) => {
    setDeleting(`${rule.name}-${rule.protocol}`);
    const res = await window.api.firewall.deleteCustomRule(
      rule.name,
      rule.protocol,
    );
    if (!res.success)
      notify(
        res.error
          ? firewallErrorMessage(t, res.error)
          : t("network.custom.deleteErrorFallback"),
        "error",
      );
    else notify(t("network.custom.deleted", { name: rule.name }), "success");
    await onRefresh();
    setDeleting(null);
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography
        variant="subtitle2"
        sx={{
          textTransform: "uppercase",
          letterSpacing: 0.8,
          color: "text.secondary",
          mb: 2,
        }}
      >
        {t("network.custom.title")}
      </Typography>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "flex-start", mb: 2 }}
      >
        <TextField
          label={t("network.custom.name")}
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={creating}
          sx={{ flex: 2 }}
        />
        <TextField
          label={t("network.custom.port")}
          size="small"
          value={newPort}
          onChange={(e) => setNewPort(e.target.value.replace(/\D/g, ""))}
          disabled={creating}
          slotProps={{ htmlInput: { maxLength: 5 } }}
          sx={{ flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 90 }} disabled={creating}>
          <InputLabel>{t("network.custom.proto")}</InputLabel>
          <Select
            label={t("network.custom.proto")}
            value={newProtocol}
            onChange={(e) => setNewProtocol(e.target.value as "TCP" | "UDP")}
          >
            <MenuItem value="UDP">UDP</MenuItem>
            <MenuItem value="TCP">TCP</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="small"
          startIcon={
            creating ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <AddIcon />
            )
          }
          disabled={creating || !newName.trim() || !newPort}
          onClick={handleCreate}
          sx={{ height: 40 }}
        >
          {t("network.custom.create")}
        </Button>
      </Stack>

      {rules.length > 0 ? (
        <>
          <Divider sx={{ mb: 1.5 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={HEAD_SX}>{t("network.custom.name")}</TableCell>
                <TableCell sx={HEAD_SX}>{t("network.custom.port")}</TableCell>
                <TableCell sx={HEAD_SX}>{t("network.custom.proto")}</TableCell>
                <TableCell sx={HEAD_SX}>
                  {t("network.standard.colState")}
                </TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => (
                <TableRow
                  key={`${rule.name}-${rule.protocol}`}
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
                    <Tooltip title={t("network.custom.delete")}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deleting !== null}
                          onClick={() => handleDelete(rule)}
                        >
                          {deleting === `${rule.name}-${rule.protocol}` ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {t("network.custom.none")}
        </Typography>
      )}
    </Paper>
  );
}
