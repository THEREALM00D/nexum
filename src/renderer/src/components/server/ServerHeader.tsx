import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import { useNavigate } from "../../context/NavigationContext";
import { useServer } from "../../context/ServerContext";
import { useServerControls } from "../../hooks/useServerControls";
import { FONT_MONO } from "../../theme";
import ServerTile from "../common/ServerTile";
import ServerControls from "./ServerControls";

/** Haut du Dashboard : quel serveur, dans quel état, et quoi faire. */
export default function ServerHeader({
  noServerPathKey,
}: {
  noServerPathKey: string;
}) {
  const { t } = useTranslation();
  const { state } = useServer();
  const navigate = useNavigate();
  const { start, stop, restart, canStart, canStop } = useServerControls();
  const { activeServer: server, serverPath, status, stats } = state;

  return (
    <Paper
      component="section"
      sx={{
        p: 3,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2.5,
      }}
    >
      {/* Base réduite : un chemin long passe à la ligne, pas les boutons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          minWidth: 0,
          flex: "1 1 320px",
        }}
      >
        <ServerTile
          name={server?.name ?? ""}
          color={server?.color ?? null}
          size={56}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="display" sx={{ overflowWrap: "anywhere" }}>
            {server?.name ?? t("sidebar.noServer")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              columnGap: 1,
              mt: 0.5,
              color: "text.secondary",
            }}
          >
            {server && (
              <Typography variant="body2">
                {t(`servers.games.${server.gameType}`)}
              </Typography>
            )}
            {serverPath ? (
              <>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: FONT_MONO, overflowWrap: "anywhere" }}
                >
                  {serverPath}
                </Typography>
                <Tooltip title={t("servers.actions.openFolder")}>
                  <IconButton
                    size="small"
                    onClick={() => window.api.shell.openPath(serverPath)}
                  >
                    <FolderOpenIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Typography variant="body2">{t(noServerPathKey)}</Typography>
            )}
          </Box>
        </Box>
      </Box>

      <ServerControls
        status={status}
        canStart={canStart}
        canStop={canStop}
        onStart={start}
        onStop={stop}
        onRestart={restart}
        uptime={stats?.serverUptime}
        onViewLogs={() => navigate("logs")}
      />
    </Paper>
  );
}
