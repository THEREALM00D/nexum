import { useId, useState, type ReactNode } from "react";
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StopIcon from "@mui/icons-material/Stop";
import UpdateIcon from "@mui/icons-material/Update";
import SyncIcon from "@mui/icons-material/Sync";
import { useTranslation } from "react-i18next";
import type { BulkAction } from "@shared/types";

interface Props {
  /** Serveurs arrêtés (ou plantés) et lancés. */
  counts: { down: number; running: number };
  /** Une action est en cours : menu désactivé. */
  busy: boolean;
  onSelect: (action: BulkAction) => void;
}

interface Entry {
  action: BulkAction;
  icon: ReactNode;
  /** Nombre de serveurs visés (0 : entrée désactivée). */
  count: number;
  hint?: string;
}

/** « Tous les serveurs ▾ » de l'en-tête de la page Serveurs. */
export default function BulkActionsMenu({ counts, busy, onSelect }: Props) {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const captionId = useId();
  const stoppedHint = t("servers.bulk.stopped", { count: counts.down });
  const runningHint = t("servers.bulk.running", { count: counts.running });

  const entries: Entry[] = [
    {
      action: "startAll",
      icon: <PlayArrowIcon fontSize="small" color="success" />,
      count: counts.down,
      hint: stoppedHint,
    },
    {
      action: "restartRunning",
      icon: <RestartAltIcon fontSize="small" color="warning" />,
      count: counts.running,
      hint: runningHint,
    },
    {
      action: "stopAll",
      icon: <StopIcon fontSize="small" color="error" />,
      count: counts.running,
      hint: runningHint,
    },
  ];
  const updateEntries: Entry[] = [
    {
      action: "updateStopped",
      icon: <UpdateIcon fontSize="small" />,
      count: counts.down,
      hint: stoppedHint,
    },
    {
      action: "stopUpdateRestartAll",
      icon: <SyncIcon fontSize="small" />,
      count: counts.down + counts.running,
    },
  ];

  const renderEntry = ({ action, icon, count, hint }: Entry) => (
    <MenuItem
      key={action}
      disabled={count === 0}
      // La légende sous les entrées de mise à jour les décrit (lue avec elles).
      aria-describedby={
        action === "updateStopped" || action === "stopUpdateRestartAll"
          ? captionId
          : undefined
      }
      onClick={() => {
        setAnchor(null);
        onSelect(action);
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={t(`servers.bulk.actions.${action}`)} />
      {hint && (
        <Typography variant="caption" sx={{ color: "text.secondary", ml: 3 }}>
          {hint}
        </Typography>
      )}
    </MenuItem>
  );

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<MenuIcon />}
        endIcon={<ArrowDropDownIcon />}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        aria-controls={anchor ? menuId : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        {t("servers.bulk.button")}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {entries.map(renderEntry)}
        <Divider />
        {updateEntries.map(renderEntry)}
        {/* Pas une entrée du menu : `li` de présentation (un `p` n'a pas sa
            place dans la liste du menu). */}
        <Typography
          id={captionId}
          variant="caption"
          component="li"
          role="presentation"
          sx={{
            display: "block",
            color: "text.secondary",
            px: 2,
            pl: 7,
            pb: 0.5,
            maxWidth: 360,
          }}
        >
          {t("servers.bulk.menuCaption")}
        </Typography>
      </Menu>
    </>
  );
}
