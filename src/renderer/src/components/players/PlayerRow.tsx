import {
  Box,
  Chip,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import type { PlayerHistoryEntry } from "@shared/types";
import { formatDuration, formatRelative } from "./utils";
import { FONT_MONO } from "../../theme";

interface Props {
  entry: PlayerHistoryEntry;
  onRemove: (entry: PlayerHistoryEntry) => void;
}

export default function PlayerRow({ entry, onRemove }: Props) {
  const { t } = useTranslation();
  return (
    <TableRow hover>
      <TableCell>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {entry.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontFamily: FONT_MONO,
              fontSize: 11,
            }}
          >
            {entry.userId}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={entry.online ? t("players.online") : t("players.offline")}
          size="small"
          color={entry.online ? "success" : "default"}
          variant={entry.online ? "filled" : "outlined"}
        />
      </TableCell>
      <TableCell>
        <Tooltip title={new Date(entry.lastSeen).toLocaleString()}>
          <Typography variant="body2">
            {entry.online ? "—" : formatRelative(entry.lastSeen, t)}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {formatDuration(entry.totalPlaytimeMs, t)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{entry.sessionCount}</Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="caption"
          sx={{ fontFamily: FONT_MONO, color: "text.secondary" }}
        >
          {entry.lastIp || "—"}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ justifyContent: "flex-end" }}
        >
          <Tooltip title={t("players.actions.remove")}>
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(entry)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
