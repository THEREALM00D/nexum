import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import type { Server, ServerStatus } from "@shared/types";
import { STATUS_COLOR } from "../../../utils/status";
import { NEXUM } from "../../../theme";

interface Props {
  servers: Server[];
  statuses: Record<string, ServerStatus>;
  activeServerId: string | null;
  onActivate: (server: Server) => void;
  onStart: (server: Server) => void;
  onStop: (server: Server) => void;
  onRestart: (server: Server) => void;
  onEdit: (server: Server) => void;
  onDelete: (server: Server) => void;
}

export default function ServersTable({
  servers,
  statuses,
  activeServerId,
  onActivate,
  onStart,
  onStop,
  onRestart,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  if (servers.length === 0) {
    return (
      <Paper sx={{ overflow: "hidden" }}>
        <Box sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("servers.empty")}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: "hidden" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>{t("servers.columns.name")}</TableCell>
              <TableCell>{t("servers.columns.status")}</TableCell>
              <TableCell>{t("servers.columns.game")}</TableCell>
              <TableCell>{t("servers.columns.path")}</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {servers.map((srv) => {
              const isActive = srv.id === activeServerId;
              const status = statuses[srv.id] ?? "stopped";
              const canStart = status === "stopped" || status === "crashed";
              const canStop = status === "running" || status === "starting";
              return (
                <TableRow key={srv.id} hover selected={isActive}>
                  <TableCell sx={{ width: 50 }}>
                    <Tooltip
                      title={
                        isActive
                          ? t("servers.active")
                          : t("servers.actions.activate")
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() => !isActive && onActivate(srv)}
                        color={isActive ? "success" : "default"}
                      >
                        {isActive ? (
                          <CheckCircleIcon fontSize="small" />
                        ) : (
                          <RadioButtonUncheckedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: srv.color ?? NEXUM.steel,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: isActive ? 600 : 400 }}
                      >
                        {srv.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`servers.status.${status}`)}
                      size="small"
                      color={STATUS_COLOR[status]}
                      variant="outlined"
                      sx={{ height: 22, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {t(`servers.games.${srv.gameType}`)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: "monospace", color: "text.secondary" }}
                    >
                      {srv.path}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title={t("servers.serverActions.start")}>
                      <span>
                        <IconButton
                          size="small"
                          color="success"
                          disabled={!canStart}
                          onClick={() => onStart(srv)}
                        >
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t("servers.serverActions.restart")}>
                      <span>
                        <IconButton
                          size="small"
                          color="warning"
                          disabled={status !== "running"}
                          onClick={() => onRestart(srv)}
                        >
                          <RestartAltIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t("servers.serverActions.stop")}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={!canStop}
                          onClick={() => onStop(srv)}
                        >
                          <StopIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t("servers.actions.edit")}>
                      <IconButton size="small" onClick={() => onEdit(srv)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("servers.actions.delete")}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(srv)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
