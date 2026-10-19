import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import BlockIcon from "@mui/icons-material/Block";
import { useTranslation } from "react-i18next";
import type { PalPlayer } from "@shared/types";
import { useNotification } from "../../../../../context/NotificationContext";

interface Props {
  players: PalPlayer[];
  setPlayers: React.Dispatch<React.SetStateAction<PalPlayer[]>>;
}

export default function PlayersPanel({ players, setPlayers }: Props) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [unbanId, setUnbanId] = useState("");

  const handleKick = async (player: PalPlayer) => {
    try {
      await window.api.palapi.kick(player.userId);
      notify(t("dashboard.players.kicked", { name: player.name }), "success");
      setPlayers((prev) => prev.filter((p) => p.userId !== player.userId));
    } catch {
      notify(t("dashboard.players.cannotKick", { name: player.name }));
    }
  };

  const handleBan = async (player: PalPlayer) => {
    try {
      await window.api.palapi.ban(player.userId);
      notify(t("dashboard.players.banned", { name: player.name }), "success");
      setPlayers((prev) => prev.filter((p) => p.userId !== player.userId));
    } catch {
      notify(t("dashboard.players.cannotBan", { name: player.name }));
    }
  };

  const handleUnban = async () => {
    const id = unbanId.trim();
    if (!id) return;
    try {
      await window.api.palapi.unban(id);
      notify(t("dashboard.players.unbanned", { id }), "success");
      setUnbanId("");
    } catch {
      notify(t("dashboard.players.cannotUnban", { id }));
    }
  };

  return (
    <Paper sx={{ p: 2.5, flex: "1 1 360px", minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t("dashboard.players.title", { count: players.length })}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      {players.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("dashboard.players.none")}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {players.map((p) => (
            <Box
              key={p.userId}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.5,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {p.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("dashboard.players.level", { level: p.level })}
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "center" }}
              >
                <Chip
                  label={`${p.ping.toFixed(0)} ms`}
                  size="small"
                  variant="outlined"
                />
                <Tooltip title={t("dashboard.players.kick")}>
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => handleKick(p)}
                  >
                    <PersonRemoveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("dashboard.players.ban")}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleBan(p)}
                  >
                    <BlockIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t("dashboard.players.unbanTitle")}
      </Typography>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          placeholder={t("dashboard.players.userId")}
          value={unbanId}
          onChange={(e) => setUnbanId(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          variant="outlined"
          size="small"
          disabled={!unbanId.trim()}
          onClick={handleUnban}
        >
          {t("dashboard.players.unban")}
        </Button>
      </Stack>
    </Paper>
  );
}
