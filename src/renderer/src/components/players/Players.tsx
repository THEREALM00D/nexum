import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useTranslation } from "react-i18next";
import type { PlayerHistoryEntry } from "@shared/types";
import { useNotification } from "../../context/NotificationContext";
import ScrollPanel from "../common/ScrollPanel";
import SearchField from "../common/SearchField";
import LoadingSkeleton, { skeletonTableRows } from "../common/LoadingSkeleton";
import PlayerRow from "./PlayerRow";

const REFRESH_INTERVAL_MS = 10_000;

export default function Players() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [entries, setEntries] = useState<PlayerHistoryEntry[]>([]);
  const [search, setSearch] = useState("");
  // Premier chargement seulement (le rafraîchissement toutes les 10 s garde
  // l'affichage en place)
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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

      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ alignItems: "center", flexWrap: "wrap" }}
      >
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t("players.search")}
          sx={{ flex: 1, maxWidth: 420 }}
        />
        <LoadingSkeleton loading={loading}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("players.summary.total", { count: entries.length })}
            {" — "}
            {t("players.summary.online", { count: onlineCount })}
          </Typography>
        </LoadingSkeleton>
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
        grow={loading || filtered.length > 0}
        minHeight={loading || filtered.length > 0 ? 240 : 0}
      >
        {!loading && entries.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("players.none")}
            </Typography>
          </Box>
        ) : !loading && filtered.length === 0 ? (
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
              {loading && skeletonTableRows(7)}
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
