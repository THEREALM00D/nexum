import {
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";
import type { LogSession } from "@shared/types";

interface Props {
  sessions: LogSession[];
  selected: string | null;
  onSelect: (name: string | null) => void;
  onOpen: () => void;
  onOpenDir: () => void;
}

const LIVE = "__live__";

// Choix de la session affichée : en cours (direct) ou une session terminée
// lue depuis son fichier. ⚠ = le serveur s'est arrêté seul avec une erreur.
export default function LogSessionPicker({
  sessions,
  selected,
  onSelect,
  onOpen,
  onOpenDir,
}: Props) {
  const { t, i18n } = useTranslation();
  const past = sessions.filter((s) => !s.current);
  const fmt = (ms: number) =>
    new Date(ms).toLocaleString(i18n.language === "fr" ? "fr-FR" : "en-US", {
      dateStyle: "medium",
      timeStyle: "medium",
    });

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
      <Select
        size="small"
        value={selected ?? LIVE}
        onOpen={onOpen}
        onChange={(e) =>
          onSelect(e.target.value === LIVE ? null : e.target.value)
        }
        sx={{ minWidth: 240, fontSize: 13 }}
      >
        <MenuItem value={LIVE}>{t("logs.session.live")}</MenuItem>
        {past.map((s) => (
          <MenuItem key={s.name} value={s.name}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              {s.crashed && (
                <WarningAmberIcon
                  sx={{ fontSize: 16, color: "warning.main" }}
                />
              )}
              <span>{fmt(s.startedAt)}</span>
              <Typography
                component="span"
                variant="caption"
                sx={{ color: "text.secondary" }}
              >
                {s.crashed
                  ? t("logs.session.crashed")
                  : t("logs.session.size", {
                      size: Math.max(1, Math.round(s.sizeBytes / 1024)),
                    })}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </Select>
      <Tooltip title={t("logs.session.openDir")}>
        <IconButton size="small" onClick={onOpenDir}>
          <FolderOpenIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
