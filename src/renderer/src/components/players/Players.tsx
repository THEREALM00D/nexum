import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useTranslation } from "react-i18next";
import type { PlayerHistoryEntry } from "@shared/types";
import { useNotification } from "../../context/NotificationContext";
import ScrollPanel from "../common/ScrollPanel";
import PlayerRow from "./PlayerRow";

const REFRESH_INTERVAL_MS = 10_000;

export default function Players() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [entries, setEntries] = useState<PlayerHistoryEntry[]>([]);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    try {
      if (!window.api.players) {
        console.error(
          "window.api.players non exposé — le preload doit être rechargé",
        );
        notify(t("players.notify.cannotLoad"));
        return;
      }
      const list = await window.api.players.getHistory();
      setEntries(list);
    } catch (e) {
      console.error("getHistory failed:", e);
      notify(t("players.notify.cannotLoad"));
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.userId.toLowerCase().includes(q) ||
        e.lastIp.toLowerCase().includes(q),
    );
  }, [entries, search]);

  const onlineCount = entries.filter((e) => e.online).length;

  const handleRemove = async (entry: PlayerHistoryEntry) => {
    if (
      !window.confirm(t("players.actions.removeConfirm", { name: entry.name }))
    )
      return;
    try {
      await window.api.players.removeEntry(entry.userId);
      notify(t("players.notify.removed", { name: entry.name }), "success");
      await refresh();
    } catch {
      notify(t("players.notify.removeFailed", { name: entry.name }), "error");
    }
  };

  const handleClear = async () => {
    if (!window.confirm(t("players.actions.clearConfirm"))) return;
    try {
      await window.api.players.clearHistory();
      notify(t("players.notify.cleared"), "success");
      await refresh();
    } catch {
      notify(t("players.notify.clearFailed"), "error");
    }
  };

  return (
    <Stack spacing={3} sx={{ height: "100%" }}>
      <Box>
        <Typography variant="h6">{t("players.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("players.subtitle")}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <TextField
          size="small"
          placeholder={t("players.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, maxWidth: 420 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("players.summary.total", { count: entries.length })}
          {" — "}
          {t("players.summary.online", { count: onlineCount })}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteSweepIcon />}
          disabled={entries.length === 0}
          onClick={handleClear}
        >
          {t("players.actions.clear")}
        </Button>
      </Stack>

      {/* Message seul (aucun joueur / aucun résultat) : pas de grand
          panneau vide étiré jusqu'en bas. */}
      <ScrollPanel
        padding={0}
        grow={filtered.length > 0}
        minHeight={filtered.length > 0 ? 240 : 0}
      >
        {entries.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("players.none")}
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("players.noResults", { query: search })}
            </Typography>
          </Box>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t("players.columns.name")}</TableCell>
                <TableCell>{t("players.columns.status")}</TableCell>
                <TableCell>{t("players.columns.lastSeen")}</TableCell>
                <TableCell>{t("players.columns.playtime")}</TableCell>
                <TableCell>{t("players.columns.sessions")}</TableCell>
                <TableCell>{t("players.columns.ip")}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((entry) => (
                <PlayerRow
                  key={entry.userId}
                  entry={entry}
                  onRemove={handleRemove}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollPanel>
    </Stack>
  );
}
