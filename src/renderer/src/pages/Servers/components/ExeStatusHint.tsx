import { Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";
import type { GameType } from "@shared/types";
import type { ExeStatus } from "../hooks/useExeDetection";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";

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
      {/* Vérification : skeleton à la forme du message « trouvé » */}
      {(status === "found" || status === "checking") && (
        <LoadingSkeleton loading={status === "checking"}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="success.main">
              {t("servers.dialog.exeFound", {
                game: t(`servers.games.${gameType}`),
              })}
            </Typography>
          </Stack>
        </LoadingSkeleton>
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
