import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type {
  SettingsImportChoice,
  SettingsImportPreview,
} from "@shared/types";
import { useServer } from "../../../context/ServerContext";
import CheckboxField from "../../../components/common/CheckboxField";
import SectionTitle from "../../../components/common/SectionTitle";
import { isUsedPath } from "../../../components/transfer/samePath";
import { formatDate } from "../../../utils/format";
import ImportServerRow, { type ImportRowState } from "./ImportServerRow";

interface Props {
  preview: SettingsImportPreview | null;
  onClose: () => void;
  onImport: (choice: SettingsImportChoice) => Promise<void>;
}

export default function ImportSettingsDialog({
  preview,
  onClose,
  onImport,
}: Props) {
  const { t, i18n } = useTranslation();
  const { state } = useServer();
  const [rows, setRows] = useState<ImportRowState[]>([]);
  const [applyApp, setApplyApp] = useState(true);
  const [importFirewall, setImportFirewall] = useState(true);
  const [applyFirewall, setApplyFirewall] = useState(false);
  const [busy, setBusy] = useState(false);

  // Nouveau fichier : un serveur déjà présent (même dossier) est décoché
  useEffect(() => {
    if (!preview) return;
    setRows(
      preview.servers.map((server) => ({
        include: !isUsedPath(state.servers, server.paths.path),
        paths: server.paths,
      })),
    );
    setApplyApp(true);
    setImportFirewall(preview.customFirewallRules.length > 0);
    setApplyFirewall(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seulement à l'ouverture
  }, [preview]);

  if (!preview) return null;
  const ruleCount = preview.customFirewallRules.length;

  const submit = async () => {
    setBusy(true);
    try {
      await onImport({
        filePath: preview.filePath,
        servers: rows.flatMap((row, index) =>
          row.include ? [{ index, paths: row.paths }] : [],
        ),
        applyAppSettings: applyApp,
        importFirewallRules: importFirewall,
        applyFirewallRules: importFirewall && applyFirewall,
      });
    } finally {
      setBusy(false);
    }
  };

  const nothing =
    !rows.some((row) => row.include) &&
    !applyApp &&
    !(importFirewall && ruleCount);

  return (
    <Dialog open onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("settings.transfer.importButton")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("transfer.exportedAt", {
              date: formatDate(
                preview.exportedAt,
                i18n.resolvedLanguage ?? "fr",
              ),
            })}
          </Typography>
          {!preview.includesPasswords && preview.servers.length > 0 && (
            <Alert severity="info">{t("transfer.passwords.missing")}</Alert>
          )}

          <div>
            <SectionTitle>{t("settings.transfer.servers")}</SectionTitle>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {preview.servers.length
                ? t("settings.transfer.serversHelper")
                : t("settings.transfer.noServers")}
            </Typography>
          </div>
          {preview.servers.map((server, serverIndex) =>
            rows[serverIndex] ? (
              <ImportServerRow
                key={server.index}
                server={server}
                value={rows[serverIndex]}
                duplicate={isUsedPath(
                  state.servers,
                  rows[serverIndex].paths.path,
                )}
                onChange={(next) =>
                  setRows((all) =>
                    all.map((row, rowIndex) =>
                      rowIndex === serverIndex ? next : row,
                    ),
                  )
                }
              />
            ) : null,
          )}

          <Divider />
          <CheckboxField
            checked={applyApp}
            onChange={setApplyApp}
            label={t("settings.transfer.appSettings")}
            helper={t("settings.transfer.appSettingsHelper")}
          />
          {ruleCount > 0 && (
            <CheckboxField
              checked={importFirewall}
              onChange={setImportFirewall}
              label={t("settings.transfer.firewall", { count: ruleCount })}
              helper={t("settings.transfer.firewallHelper")}
            />
          )}
          {ruleCount > 0 && importFirewall && (
            <Stack sx={{ pl: 4 }}>
              <CheckboxField
                checked={applyFirewall}
                onChange={setApplyFirewall}
                label={t("settings.transfer.applyFirewall")}
                helper={t("settings.transfer.applyFirewallHelper")}
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={busy || nothing}
          startIcon={busy ? <CircularProgress size={16} /> : undefined}
        >
          {t("transfer.import")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
