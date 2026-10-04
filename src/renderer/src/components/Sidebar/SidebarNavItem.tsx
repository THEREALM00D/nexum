import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import type { ReactNode } from "react";

const selectedSx = {
  "&.Mui-selected": {
    bgcolor: "action.selected",
    "&:hover": { bgcolor: "action.selected" },
  },
};

// Entrée de navigation de la Sidebar : icône + libellé, ou icône seule avec
// infobulle quand la barre est repliée.
export default function SidebarNavItem({
  label,
  icon,
  active,
  collapsed,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const iconColor = active ? "primary.main" : "text.secondary";

  if (collapsed) {
    return (
      <Tooltip title={label} placement="right">
        <ListItemButton
          selected={active}
          onClick={onClick}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            justifyContent: "center",
            px: 0,
            minHeight: 36,
            ...selectedSx,
          }}
        >
          <ListItemIcon
            sx={{ minWidth: 0, color: iconColor, justifyContent: "center" }}
          >
            {icon}
          </ListItemIcon>
        </ListItemButton>
      </Tooltip>
    );
  }

  return (
    <ListItemButton
      selected={active}
      onClick={onClick}
      sx={{ borderRadius: 2, mb: 0.5, ...selectedSx }}
    >
      <ListItemIcon sx={{ minWidth: 36, color: iconColor }}>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        slotProps={{
          primary: { sx: { fontSize: 13, fontWeight: active ? 600 : 400 } },
        }}
      />
    </ListItemButton>
  );
}
