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

interface Props {
  confirmation: BulkConfirmation | null;
  servers: Server[];
  /** Serveurs lancés : nombre affiché si les joueurs n'ont pas pu être lus. */
  runningCount: number;
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
  runningCount,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const [warnPlayers, setWarnPlayers] = useState(true);

  useEffect(() => {
    if (confirmation) setWarnPlayers(true);
  }, [confirmation]);

  const players = confirmation?.players ?? [];
  const total = players.reduce((sum, entry) => sum + (entry.count ?? 0), 0);
  const count = players.length || runningCount;
  const nameOf = (serverId: string) =>
    servers.find((server) => server.id === serverId)?.name ?? serverId;
  const playersText = (playerCount: number | null) => {
    if (playerCount === null) return t("servers.bulk.confirm.unknownPlayers");
    if (playerCount === 0) return t("servers.bulk.confirm.noPlayers");
    return t("servers.bulk.confirm.players", { count: playerCount });
  };
  const action = confirmation?.action ?? "stopAll";

  return (
    <Dialog
      open={confirmation !== null}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {t(`servers.bulk.confirm.title.${action}`, { count })}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {total > 0 && (
            <Alert severity="warning">
              {t("servers.bulk.confirm.playersOnline", { count: total })}
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
                  {nameOf(entry.serverId)}
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
          {t(`servers.bulk.confirm.button.${action}`, {
            count,
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
