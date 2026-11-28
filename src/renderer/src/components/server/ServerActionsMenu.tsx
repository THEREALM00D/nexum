import { useId, useState } from "react";
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SaveIcon from "@mui/icons-material/Save";
import ChatIcon from "@mui/icons-material/Chat";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { useTranslation } from "react-i18next";
import type {
  RemoteAdminUnavailable,
  Server,
  ServerStatus,
} from "@shared/types";
import { useServerAdminActions } from "../../hooks/useServerAdminActions";
import SendMessageDialog from "./SendMessageDialog";
import KillConfirmDialog from "./KillConfirmDialog";

interface Props {
  server: Server;
  status: ServerStatus;
}

/**
 * « ⋯ » du Dashboard : sauvegarder le monde, envoyer un message, tuer le
 * processus. Les deux premières passent par l'API REST ou RCON du jeu
 * (raison affichée sous l'entrée quand elles ne sont pas disponibles).
 */
export default function ServerActionsMenu({ server, status }: Props) {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [killOpen, setKillOpen] = useState(false);
  const menuId = useId();
  const actions = useServerAdminActions(server.id, server.name);
  const { capabilities } = actions;
  const running = status === "running";

  const reasonText = (reason: RemoteAdminUnavailable | null | undefined) =>
    reason ? t(`serverMenu.unavailable.${reason}`) : undefined;
  const choose = (action: () => void) => () => {
    setAnchor(null);
    action();
  };

  return (
    <>
      <Tooltip title={t("serverMenu.more")}>
        <Button
          variant="outlined"
          color="inherit"
          aria-label={t("serverMenu.more")}
          aria-haspopup="menu"
          aria-expanded={anchor !== null}
          aria-controls={anchor ? menuId : undefined}
          onClick={(event) => {
            setAnchor(event.currentTarget);
            void actions.loadCapabilities();
          }}
          sx={{ minWidth: 0, px: 1 }}
        >
          <MoreHorizIcon />
        </Button>
      </Tooltip>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          disabled={!running || !capabilities || capabilities.save !== null}
          onClick={choose(() => void actions.saveNow())}
        >
          <ListItemIcon>
            <SaveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("serverMenu.saveNow")}
            secondary={reasonText(capabilities?.save)}
          />
        </MenuItem>
        <MenuItem
          disabled={!running || !capabilities || capabilities.announce !== null}
          onClick={choose(() => setMessageOpen(true))}
        >
          <ListItemIcon>
            <ChatIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("serverMenu.sendMessage")}
            secondary={reasonText(capabilities?.announce)}
          />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={choose(() => setKillOpen(true))}
          sx={{ color: "error.light" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <PowerSettingsNewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("serverMenu.kill")}
            secondary={t("serverMenu.killHelper")}
          />
        </MenuItem>
      </Menu>

      <SendMessageDialog
        open={messageOpen}
        capabilities={capabilities}
        onClose={() => setMessageOpen(false)}
        onSend={async (message) => {
          if (await actions.sendMessage(message)) setMessageOpen(false);
        }}
      />
      <KillConfirmDialog
        open={killOpen}
        serverName={server.name}
        onClose={() => setKillOpen(false)}
        onConfirm={() => {
          setKillOpen(false);
          void actions.kill();
        }}
      />
    </>
  );
}
