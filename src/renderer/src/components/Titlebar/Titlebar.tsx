import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Page } from "../../App";
import logo from "../../assets/logo.svg";
import { useServer } from "../../context/ServerContext";
import { FONT_DISPLAY } from "../../theme";
import CaptionButton from "./CaptionButton";
import { useWindowMaximized } from "./useWindowMaximized";

export default function Titlebar({ page }: { page: Page }) {
  const { t } = useTranslation();
  const { state } = useServer();
  const maximized = useWindowMaximized();

  const pageLabel = page === "setup" ? t("setup.title") : t(`sidebar.${page}`);
  const context = state.loaded
    ? [state.activeServer?.name, pageLabel].filter(Boolean).join(" · ")
    : "";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 40,
        pl: 2,
        bgcolor: "background.default",
        flexShrink: 0,
        WebkitAppRegion: "drag",
        userSelect: "none",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <img src={logo} alt="" width={20} height={20} />
        <Typography
          variant="body2"
          sx={{
            fontFamily: FONT_DISPLAY,
            fontStretch: "125%",
            fontWeight: 700,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: "text.primary",
            flexShrink: 0,
          }}
        >
          Nexum
        </Typography>
        {context && (
          <>
            <Typography
              variant="body2"
              aria-hidden
              sx={{ color: "text.disabled" }}
            >
              /
            </Typography>
            <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
              {context}
            </Typography>
          </>
        )}
      </Box>

      <Box sx={{ display: "flex", flexShrink: 0, WebkitAppRegion: "no-drag" }}>
        <CaptionButton
          icon="minimize"
          label={t("common.minimize")}
          onClick={() => window.api.window.minimize()}
        />
        <CaptionButton
          icon={maximized ? "restore" : "maximize"}
          label={maximized ? t("common.restore") : t("common.maximize")}
          onClick={() => window.api.window.maximize()}
        />
        <CaptionButton
          icon="close"
          label={t("common.close")}
          onClick={() => window.api.window.close()}
        />
      </Box>
    </Box>
  );
}
