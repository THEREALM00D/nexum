import { CircularProgress, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";
import type { GameType } from "@shared/types";
import type { ExeStatus } from "../hooks/useExeDetection";

interface Props {
  status: ExeStatus;
  gameType: GameType;
}

export default function ExeStatusHint({ status, gameType }: Props) {
  const { t } = useTranslation();
  if (status === "idle") return null;

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{ alignItems: "center", mt: -1.5 }}
    >
      {status === "checking" && (
        <>
          <CircularProgress size={14} />
          <Typography variant="caption" color="text.secondary">
            {t("servers.dialog.exeChecking")}
          </Typography>
        </>
      )}
      {status === "found" && (
        <>
          <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="success.main">
            {t("servers.dialog.exeFound", {
              game: t(`servers.games.${gameType}`),
            })}
          </Typography>
        </>
      )}
      {status === "missing" && (
        <>
          <WarningAmberIcon color="warning" sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="warning.main">
            {t("servers.dialog.exeMissing")}
          </Typography>
        </>
      )}
    </Stack>
  );
}
