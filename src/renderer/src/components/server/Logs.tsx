import { Box, Typography, Paper, Button, Stack } from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import LogExportButtons from "./LogExportButtons";
import LogSessionPicker from "./LogSessionPicker";
import LogLines from "./LogLines";
import { useLogSessions } from "./hooks/useLogSessions";

export default function Logs() {
  const { t } = useTranslation();
  const { dispatch } = useServer();
  const logs = useLogSessions();
  const viewingPast = logs.selected !== null;

  return (
    <Stack
      spacing={2}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h6">{t("logs.title")}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {t("logs.lines", { count: logs.displayed.length })}
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <LogSessionPicker
            sessions={logs.sessions}
            selected={logs.selected}
            onSelect={logs.setSelected}
            onOpen={logs.refresh}
            onOpenDir={logs.openDir}
          />
          <LogExportButtons
            loadLog={logs.loadFullLog}
            disabled={logs.displayed.length === 0}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<DeleteSweepIcon />}
            onClick={() => dispatch({ type: "CLEAR_LOGS" })}
            disabled={viewingPast}
          >
            {t("logs.clear")}
          </Button>
        </Stack>
      </Stack>

      <Paper
        sx={{
          flex: 1,
          p: 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {/* key : une autre session s'ouvre en bas de son log */}
        <LogLines key={logs.selected ?? "live"} lines={logs.displayed} />
      </Paper>
    </Stack>
  );
}
