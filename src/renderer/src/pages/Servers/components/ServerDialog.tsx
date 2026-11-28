import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { GameType, Server } from "@shared/types";
import { useExeDetection } from "../../../hooks/useExeDetection";
import ExeStatusHint from "./ExeStatusHint";
import ExistingServerPanel from "./ExistingServerPanel";
import FolderField from "../../../components/common/FolderField";
import ColorPicker from "./ColorPicker";
import { SERVER_COLORS } from "@shared/serverColors";
import { GAMES } from "../../../games/registry";
import { watchdogInvalid } from "./WatchdogFields";
import ServerAutomationFields from "./ServerAutomationFields";

export interface ServerFormValues {
  name: string;
  path: string;
  gameType: GameType;
  color: string | null;
  autoStart: boolean;
  autoRestart: boolean;
  /** Démarrage bloqué : minutes avant relance, 0 = désactivé. */
  stuckStartMinutes: number;
  /** Limite de RAM en Go, 0 = désactivée. */
  ramLimitGb: number;
}

interface Props {
  open: boolean;
  initial: Server | null;
  onClose: () => void;
  onSubmit: (values: ServerFormValues, importState: unknown) => Promise<void>;
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
    color: SERVER_COLORS[0],
    autoStart: false,
    autoRestart: false,
    stuckStartMinutes: 0,
    ramLimitGb: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [importState, setImportState] = useState<unknown>(null);
  const [importPending, setImportPending] = useState(false);
  const exeStatus = useExeDetection(open, values.path, values.gameType);

  useEffect(() => {
    if (open) {
      setValues({
        name: initial?.name ?? "",
        path: initial?.path ?? "",
        gameType: initial?.gameType ?? "palworld",
        color: initial?.color ?? SERVER_COLORS[0],
        autoStart: initial?.autoStart ?? false,
        autoRestart: initial?.autoRestart ?? false,
        stuckStartMinutes: initial?.stuckStartMinutes ?? 0,
        ramLimitGb: initial?.ramLimitGb ?? 0,
      });
    }
  }, [open, initial]);

  const handlePicked = async (folder: string) => {
    const detected = await window.api.servers.detectGameType(folder);
    setValues((current) => ({
      ...current,
      path: folder,
      gameType: detected ?? current.gameType,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(values, initial ? null : importState);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    values.name.trim() &&
    values.path.trim() &&
    !submitting &&
    !importPending &&
    !watchdogInvalid(values);

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

          <FolderField
            label={t("servers.dialog.path")}
            value={values.path}
            onChange={(path) => setValues((current) => ({ ...current, path }))}
            onPicked={handlePicked}
            helper={t("servers.dialog.pathHelper")}
            installDirWarning
          />

          <ExeStatusHint status={exeStatus} gameType={values.gameType} />

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

          {/* Après le choix du jeu : le résumé de reprise peut être long. */}
          {!initial && (
            <ExistingServerPanel
              gameType={values.gameType}
              path={values.path}
              exeStatus={exeStatus}
              onChange={setImportState}
              onPendingChange={setImportPending}
            />
          )}

          <ColorPicker
            name={values.name}
            value={values.color}
            onChange={(color) => setValues((v) => ({ ...v, color }))}
          />

          <ServerAutomationFields
            values={values}
            onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
          />
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
