import { useEffect, useRef } from "react";
import { Box, Typography, Paper, Button, Stack, Divider } from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import { FONT_MONO } from "../../theme";
import LogExportButtons from "./LogExportButtons";

export default function Logs() {
  const { t } = useTranslation();
  const { state, dispatch } = useServer();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.logs]);

  return (
    <Stack
      spacing={2}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Box>
          <Typography variant="h6">{t("logs.title")}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {t("logs.lines", { count: state.logs.length })}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <LogExportButtons />
          <Button
            size="small"
            variant="outlined"
            startIcon={<DeleteSweepIcon />}
            onClick={() => dispatch({ type: "CLEAR_LOGS" })}
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
        }}
      >
        <Divider sx={{ mb: 1 }} />
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            fontFamily: FONT_MONO,
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          {state.logs.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              {t("logs.empty")}
            </Typography>
          ) : (
            state.logs.map((line, i) => (
              <Box
                key={i}
                component="div"
                sx={{
                  color:
                    line.includes("[ERR]") || line.includes("Error")
                      ? "error.main"
                      : line.includes("[Manager]")
                        ? "primary.main"
                        : "text.secondary",
                }}
              >
                {line}
              </Box>
            ))
          )}
          <div ref={endRef} />
        </Box>
      </Paper>
    </Stack>
  );
}
