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
import { GAMES, getGamePlugin } from "../../../games/registry";
import { watchdogInvalid } from "./WatchdogFields";
import ServerAutomationFields from "./ServerAutomationFields";
import ProcessorFields from "./ProcessorFields";
import { formValuesOf, type ServerFormValues } from "./serverFormValues";

export type { ServerFormValues };

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
  const [values, setValues] = useState<ServerFormValues>(formValuesOf(null));
  const [submitting, setSubmitting] = useState(false);
  const [importState, setImportState] = useState<unknown>(null);
  const [importPending, setImportPending] = useState(false);
  const exeStatus = useExeDetection(open, values.path, values.gameType);

  useEffect(() => {
    if (open) {
      setValues(formValuesOf(initial));
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
    !watchdogInvalid(
      values,
      Boolean(getGamePlugin(values.gameType)?.startupReadyHintKey),
    );

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
            onChange={(patch) =>
              setValues((current) => ({ ...current, ...patch }))
            }
          />
          <ProcessorFields
            priority={values.cpuPriority}
            cores={values.cpuCores}
            onChange={(patch) =>
              setValues((current) => ({ ...current, ...patch }))
            }
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
