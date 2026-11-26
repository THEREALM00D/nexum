import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import StopIcon from "@mui/icons-material/Stop";
import { useTranslation } from "react-i18next";
import type { BulkAction, Server } from "@shared/types";
import CheckboxField from "../../../components/common/CheckboxField";
import type { BulkConfirmation } from "../hooks/useBulkActions";
import { serverName } from "../hooks/useBulkStepText";

interface Props {
  confirmation: BulkConfirmation | null;
  servers: Server[];
  /** Serveurs arrêtés et lancés (titre ; joueurs illisibles). */
  counts: { down: number; running: number };
  onCancel: () => void;
  onConfirm: (action: BulkAction, warnPlayers: boolean) => void;
}

/**
 * Avant d'arrêter des serveurs où des joueurs sont connectés : un serveur
 * par ligne avec ses joueurs, et le choix de les prévenir d'abord.
 */
export default function BulkConfirmDialog({
  confirmation,
  servers,
  counts,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const [warnPlayers, setWarnPlayers] = useState(true);
  // Dernière confirmation affichée : le contenu ne change pas pendant le
  // fondu de fermeture (confirmation déjà remise à null).
  const [shown, setShown] = useState<BulkConfirmation | null>(null);

  useEffect(() => {
    if (!confirmation) return;
    setShown(confirmation);
    setWarnPlayers(true);
  }, [confirmation]);

  const players = shown?.players ?? [];
  const playerTotal = players.reduce(
    (sum, entry) => sum + (entry.count ?? 0),
    0,
  );
  const action = shown?.action ?? "stopAll";
  const stoppedCount = players.length || counts.running;
  // « Arrêter, mettre à jour et redémarrer tout » vise aussi les arrêtés.
  const targetCount =
    action === "stopUpdateRestartAll"
      ? counts.running + counts.down
      : stoppedCount;
  const playersText = (playerCount: number | null) => {
    if (playerCount === null) return t("servers.bulk.confirm.unknownPlayers");
    if (playerCount === 0) return t("servers.bulk.confirm.noPlayers");
    return t("servers.bulk.confirm.players", { count: playerCount });
  };

  return (
    <Dialog
      open={confirmation !== null}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {t(`servers.bulk.confirm.title.${action}`, {
          count: Math.max(targetCount, stoppedCount),
        })}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {playerTotal > 0 && (
            <Alert severity="warning">
              {t("servers.bulk.confirm.playersOnline", { count: playerTotal })}
            </Alert>
          )}
          <Stack spacing={0.5}>
            {players.map((entry) => (
              <Stack
                key={entry.serverId}
                direction="row"
                spacing={2}
                useFlexGap
                sx={{ justifyContent: "space-between", flexWrap: "wrap" }}
              >
                <Typography variant="body2">
                  {serverName(servers, entry.serverId)}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {playersText(entry.count)}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <CheckboxField
            checked={warnPlayers}
            onChange={setWarnPlayers}
            label={t("servers.bulk.confirm.warnPlayers")}
            helper={t("servers.bulk.confirm.warnHelper")}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t("servers.bulk.confirm.cancel")}</Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<StopIcon />}
          onClick={() => onConfirm(action, warnPlayers)}
        >
          {t(`servers.bulk.confirm.button.${action}`, { count: stoppedCount })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
