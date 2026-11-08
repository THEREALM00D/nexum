import { useState } from "react";
import {
  Box,
  Button,
  ButtonBase,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import type { Page } from "../../App";
import LoadingSkeleton from "../common/LoadingSkeleton";
import ServerTile from "../common/ServerTile";
import StatusDot from "../common/StatusDot";
import { DEFAULT_GAME } from "../../games/registry";
import { FOCUS_RING_SX, NEXUM } from "../../theme";

interface Props {
  onManage: (page: Page) => void;
  collapsed?: boolean;
}

export default function ServerSwitcher({ onManage, collapsed }: Props) {
  const { state, switchActive } = useServer();
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const open = Boolean(anchor);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  const handleSelect = async (id: string) => {
    handleClose();
    if (id === state.activeServerId) return;
    await switchActive(id);
  };

  const handleManage = () => {
    handleClose();
    onManage("servers");
  };

  const activeName = state.activeServer?.name ?? t("sidebar.noServer");
  const tileProps = {
    name: state.activeServer?.name ?? "",
    color: state.activeServer?.color ?? null,
  };
  const statusLabel = t(`status.${state.status}`, {
    defaultValue: state.status,
  });
  const gameLabel = t(
    `servers.games.${state.activeServer?.gameType ?? DEFAULT_GAME}`,
  );
  // Pendant le chargement aussi : le skeleton garde la hauteur finale
  const showStatus = !state.loaded || !!state.activeServer;

  const menu = (
    <Menu
      anchorEl={anchor}
      open={open}
      onClose={handleClose}
      slotProps={{ paper: { sx: { minWidth: 200 } } }}
    >
      {state.servers.length === 0 && (
        <MenuItem disabled>
          <ListItemText primary={t("sidebar.noServers")} />
        </MenuItem>
      )}
      {state.servers.map((srv) => (
        <MenuItem
          key={srv.id}
          selected={srv.id === state.activeServerId}
          onClick={() => handleSelect(srv.id)}
        >
          <ListItemIcon>
            <ServerTile name={srv.name} color={srv.color} />
          </ListItemIcon>
          <ListItemText primary={srv.name} />
          {srv.id === state.activeServerId && (
            <CheckIcon fontSize="small" sx={{ ml: 1, color: "primary.main" }} />
          )}
        </MenuItem>
      ))}
      <Divider />
      <MenuItem onClick={handleManage}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t("sidebar.manageServers")} />
      </MenuItem>
    </Menu>
  );

  if (collapsed) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
        <LoadingSkeleton loading={!state.loaded}>
          <Tooltip
            title={showStatus ? `${activeName} · ${statusLabel}` : activeName}
            placement="right"
          >
            <ButtonBase
              onClick={handleOpen}
              aria-haspopup="menu"
              sx={{
                borderRadius: 1,
                "&:hover": { opacity: 0.85 },
                ...FOCUS_RING_SX,
              }}
            >
              <ServerTile {...tileProps} size={28} />
              {showStatus && (
                <StatusDot
                  status={state.status}
                  sx={{
                    position: "absolute",
                    right: -3,
                    bottom: -3,
                    outline: "2px solid",
                    outlineColor: "background.paper",
                  }}
                />
              )}
            </ButtonBase>
          </Tooltip>
        </LoadingSkeleton>
        {menu}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.5 }}>
      <LoadingSkeleton loading={!state.loaded} fullWidth>
        <Button
          onClick={handleOpen}
          fullWidth
          endIcon={<ExpandMoreIcon fontSize="small" />}
          sx={{
            justifyContent: "space-between",
            textTransform: "none",
            bgcolor: NEXUM.raised,
            color: "text.primary",
            py: 1,
            px: 1.5,
            borderRadius: 2,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
          >
            <ServerTile {...tileProps} size={32} />
            <Box sx={{ minWidth: 0, textAlign: "left" }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                {activeName}
              </Typography>
              {showStatus && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    color: "text.secondary",
                  }}
                >
                  <StatusDot status={state.status} />
                  <Typography variant="caption" noWrap>
                    {statusLabel} · {gameLabel}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Button>
      </LoadingSkeleton>
      {menu}
    </Box>
  );
}
