import { useState } from "react";
import {
  Box,
  Button,
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
import { NEXUM } from "../../theme";

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
  const activeColor = state.activeServer?.color ?? NEXUM.steel;

  const colorDot = (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: activeColor,
        flexShrink: 0,
      }}
    />
  );

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
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: srv.color ?? NEXUM.steel,
              }}
            />
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
        <Tooltip title={activeName} placement="right">
          <Box
            onClick={handleOpen}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: activeColor,
              cursor: "pointer",
              border: "2px solid",
              borderColor: "divider",
              "&:hover": { opacity: 0.85 },
            }}
          />
        </Tooltip>
        {menu}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.5 }}>
      <Button
        onClick={handleOpen}
        fullWidth
        endIcon={<ExpandMoreIcon fontSize="small" />}
        sx={{
          justifyContent: "space-between",
          textTransform: "none",
          bgcolor: "rgba(255,255,255,0.05)",
          color: "text.primary",
          py: 1,
          px: 1.5,
          borderRadius: 2,
          "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
        >
          {colorDot}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activeName}
          </Typography>
        </Box>
      </Button>
      {menu}
    </Box>
  );
}
