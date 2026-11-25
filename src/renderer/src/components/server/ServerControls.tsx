import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useTranslation } from "react-i18next";
import type { ServerStatus } from "@shared/types";
import { STATUS_COLOR } from "../../utils/status";
import { formatDuration } from "../../utils/format";
import StatusDot from "../common/StatusDot";

interface Props {
  status: ServerStatus;
  canStart: boolean;
  canStop: boolean;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  /** Secondes depuis le démarrage, affichées sous le statut quand il est en ligne. */
  uptime?: number;
  /** Bouton « Voir les logs » si le serveur a planté. */
  onViewLogs?: () => void;
}

/** Statut du serveur et, à droite, seulement les actions possibles. */
export default function ServerControls({
  status,
  canStart,
  canStop,
  onStart,
  onStop,
  onRestart,
  uptime,
  onViewLogs,
}: Props) {
  const { t, i18n } = useTranslation();
  const running = status === "running";

  // Grille : statut et boutons sur la 1re ligne, durée dessous. En colonne
  // avec le statut, la durée allongeait la colonne et les boutons se
  // centraient sur elle, plus bas que le statut.
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto auto",
        alignItems: "center",
        columnGap: 2,
        rowGap: 0.25,
      }}
    >
      <Chip
        // Marge ici : Chip ne peut pas poser sa classe d'icône sur StatusDot
        icon={<StatusDot status={status} size={10} sx={{ ml: 1.25 }} />}
        label={t(`status.${status}`, { defaultValue: status })}
        color={STATUS_COLOR[status] ?? "default"}
        variant="outlined"
        sx={{
          gridColumn: 1,
          gridRow: 1,
          justifySelf: "end",
          typography: "body2",
          fontWeight: 600,
        }}
      />
      {running && !!uptime && (
        <Typography
          variant="caption"
          sx={{
            gridColumn: 1,
            gridRow: 2,
            justifySelf: "end",
            color: "text.secondary",
            pr: 0.5,
          }}
        >
          {t("serverDashboard.since", {
            duration: formatDuration(uptime, i18n.resolvedLanguage ?? "fr"),
          })}
        </Typography>
      )}

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ gridColumn: 2, gridRow: 1, flexWrap: "wrap" }}
      >
        {status === "crashed" && onViewLogs && (
          <Button variant="outlined" color="inherit" onClick={onViewLogs}>
            {t("serverDashboard.viewLogs")}
          </Button>
        )}
        {running && (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon sx={{ color: "warning.main" }} />}
            onClick={onRestart}
          >
            {t("dashboard.controls.restart")}
          </Button>
        )}
        {canStart ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrowIcon />}
            onClick={onStart}
          >
            {t("dashboard.controls.start")}
          </Button>
        ) : (
          // Démarrage ou arrêt en cours : action possible mais pas à mettre en avant
          // Serveur lancé : contour rouge, pas de rouge plein. Arrêter est
          // l'action la plus rare et la plus perturbante ; le plein reste
          // aux confirmations destructrices.
          <Button
            variant="outlined"
            color={running ? "error" : "inherit"}
            sx={running ? { color: "error.light" } : undefined}
            startIcon={<StopIcon />}
            disabled={!canStop}
            onClick={onStop}
          >
            {t("dashboard.controls.stop")}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
