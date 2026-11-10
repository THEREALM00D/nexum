import { useState } from "react";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useTranslation } from "react-i18next";
import type { Server, ServerStatus } from "@shared/types";

export interface ServerActionHandlers {
  onStart: (server: Server) => void;
  onStop: (server: Server) => void;
  onRestart: (server: Server) => void;
  onEdit: (server: Server) => void;
  onExport: (server: Server) => void;
  onDelete: (server: Server) => void;
}

/**
 * Actions d'une ligne : un seul bouton Démarrer / Arrêter, Redémarrer, et le
 * reste dans un menu. Supprimer y est isolé, loin d'Arrêter, lui aussi rouge.
 */
export default function ServerRowActions({
  server,
  status,
  onStart,
  onStop,
  onRestart,
  onEdit,
  onExport,
  onDelete,
}: ServerActionHandlers & { server: Server; status: ServerStatus }) {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const isDown = status === "stopped" || status === "crashed";
  const mainLabel = t(`servers.serverActions.${isDown ? "start" : "stop"}`);
  const closeThen = (action: () => void) => () => {
    setAnchor(null);
    action();
  };

  return (
    <>
      <Tooltip title={mainLabel}>
        <span>
          <IconButton
            size="small"
            color={isDown ? "success" : "error"}
            disabled={status === "stopping"}
            aria-label={mainLabel}
            onClick={() => (isDown ? onStart(server) : onStop(server))}
          >
            {isDown ? (
              <PlayArrowIcon fontSize="small" />
            ) : (
              <StopIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("servers.serverActions.restart")}>
        <span>
          <IconButton
            size="small"
            color="warning"
            disabled={status !== "running"}
            aria-label={t("servers.serverActions.restart")}
            onClick={() => onRestart(server)}
          >
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("servers.actions.more")}>
        <IconButton
          size="small"
          aria-haspopup="menu"
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={closeThen(() => onEdit(server))}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("servers.actions.edit")} />
        </MenuItem>
        <MenuItem
          onClick={closeThen(() => window.api.shell.openPath(server.path))}
        >
          <ListItemIcon>
            <FolderOpenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("servers.actions.openFolder")} />
        </MenuItem>
        {/* Monde copié serveur arrêté seulement (refusé par le main sinon) */}
        <MenuItem
          disabled={!isDown}
          onClick={closeThen(() => onExport(server))}
        >
          <ListItemIcon>
            <FileUploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("servers.transfer.exportMenu")}
            secondary={
              isDown ? undefined : t("servers.transfer.exportStopFirst")
            }
          />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={closeThen(() => onDelete(server))}
          sx={{ color: "error.light" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("servers.actions.delete")} />
        </MenuItem>
      </Menu>
    </>
  );
}
