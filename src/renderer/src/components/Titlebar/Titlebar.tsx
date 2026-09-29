import { Box, IconButton, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import CloseIcon from "@mui/icons-material/Close";
import logo from "../../assets/logo.svg";

export default function Titlebar() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 40,
        px: 2,
        bgcolor: "background.default",
        flexShrink: 0,
        WebkitAppRegion: "drag",
        userSelect: "none",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <img src={logo} alt="Nexum" width={20} height={20} />
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.primary", letterSpacing: 0.5 }}
        >
          Nexum
        </Typography>
      </Box>

      <Box sx={{ display: "flex", WebkitAppRegion: "no-drag" }}>
        <IconButton
          size="small"
          onClick={() => window.api.window.minimize()}
          sx={{
            color: "text.secondary",
            borderRadius: 1,
            "&:hover": { bgcolor: "action.hover", color: "text.primary" },
          }}
        >
          <RemoveIcon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => window.api.window.maximize()}
          sx={{
            color: "text.secondary",
            borderRadius: 1,
            "&:hover": { bgcolor: "action.hover", color: "text.primary" },
          }}
        >
          <CropSquareIcon sx={{ fontSize: 12 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => window.api.window.close()}
          sx={{
            color: "text.secondary",
            borderRadius: 1,
            "&:hover": { bgcolor: "error.main", color: "#fff" },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
