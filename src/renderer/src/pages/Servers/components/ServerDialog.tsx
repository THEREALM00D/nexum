import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import type { GameType, Server } from "@shared/types";
import { useExeDetection } from "../hooks/useExeDetection";
import ExeStatusHint from "./ExeStatusHint";
import InstallDirWarning from "../../../components/common/InstallDirWarning";
import CheckboxField from "../../../components/common/CheckboxField";
import ColorPicker, { DEFAULT_COLORS } from "./ColorPicker";
import { GAMES } from "../../../games/registry";

export interface ServerFormValues {
  name: string;
  path: string;
  gameType: GameType;
  color: string | null;
  autoStart: boolean;
  autoRestart: boolean;
}

interface Props {
  open: boolean;
  initial: Server | null;
  onClose: () => void;
  onSubmit: (values: ServerFormValues) => Promise<void>;
}

export default function ServerDialog({
  open,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [values, setValues] = useState<ServerFormValues>({
    name: "",
    path: "",
    gameType: "palworld",
    color: DEFAULT_COLORS[0],
    autoStart: false,
    autoRestart: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const exeStatus = useExeDetection(open, values.path, values.gameType);

  useEffect(() => {
    if (open) {
      setValues({
        name: initial?.name ?? "",
        path: initial?.path ?? "",
        gameType: initial?.gameType ?? "palworld",
        color: initial?.color ?? DEFAULT_COLORS[0],
        autoStart: initial?.autoStart ?? false,
        autoRestart: initial?.autoRestart ?? false,
      });
    }
  }, [open, initial]);

  const handleBrowse = async () => {
    const folder = await window.api.dialog.selectFolder();
    if (!folder) return;
    const detected = await window.api.servers.detectGameType(folder);
    setValues((v) => ({
      ...v,
      path: folder,
      gameType: detected ?? v.gameType,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = values.name.trim() && values.path.trim() && !submitting;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initial ? t("servers.dialog.editTitle") : t("servers.dialog.addTitle")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label={t("servers.dialog.name")}
            size="small"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            helperText={t("servers.dialog.nameHelper")}
            fullWidth
            autoFocus
          />

          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
            <TextField
              label={t("servers.dialog.path")}
              size="small"
              value={values.path}
              onChange={(e) =>
                setValues((v) => ({ ...v, path: e.target.value }))
              }
              helperText={t("servers.dialog.pathHelper")}
              fullWidth
            />
            <IconButton
              onClick={handleBrowse}
              sx={{ mt: 0.5 }}
              title={t("servers.dialog.pathBrowse")}
            >
              <FolderOpenIcon />
            </IconButton>
          </Stack>

          <ExeStatusHint status={exeStatus} gameType={values.gameType} />
          <InstallDirWarning path={values.path} />

          <FormControl size="small" fullWidth>
            <InputLabel>{t("servers.dialog.gameType")}</InputLabel>
            <Select
              label={t("servers.dialog.gameType")}
              value={values.gameType}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  gameType: e.target.value as GameType,
                }))
              }
            >
              {GAMES.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {t(`servers.games.${g.id}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <ColorPicker
            value={values.color}
            onChange={(color) => setValues((v) => ({ ...v, color }))}
          />

          <Stack spacing={1}>
            <CheckboxField
              checked={values.autoStart}
              onChange={(autoStart) => setValues((v) => ({ ...v, autoStart }))}
              label={t("servers.dialog.autoStart")}
              helper={t("servers.dialog.autoStartHelper")}
            />
            <CheckboxField
              checked={values.autoRestart}
              onChange={(autoRestart) =>
                setValues((v) => ({ ...v, autoRestart }))
              }
              label={t("servers.dialog.autoRestart")}
              helper={t("servers.dialog.autoRestartHelper")}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t("servers.dialog.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          variant="contained"
        >
          {t("servers.dialog.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
