import { useDeferredValue, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { CfgEntry } from "../utils/cfgParser";
import SearchField from "../../../../../components/common/SearchField";
import CfgStructuredEditor from "./CfgStructuredEditor";

interface Props {
  fileName: string | null;
  entries: CfgEntry[];
  saving: boolean;
  /** Modifications non sauvegardées : la fermeture demande confirmation. */
  dirty: boolean;
  onChange: (lineIndex: number, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function ConfigFileEditorDialog({
  fileName,
  entries,
  saving,
  dirty,
  onChange,
  onClose,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  // La saisie reste fluide : le filtrage (lourd sur un gros fichier) est différé.
  const deferredSearch = useDeferredValue(search);

  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    setSearch("");
    setConfirmClose(false);
  }, [fileName]);

  // Croix/Échap/clic à côté/bouton Fermer passent tous par ici
  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  return (
    <>
      <Dialog
        open={fileName !== null}
        onClose={requestClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: "monospace" }}>{fileName}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder={t("valheimMods.configs.searchSettings")}
              sx={{ mb: 2, width: "100%" }}
            />
            <CfgStructuredEditor
              entries={entries}
              search={deferredSearch}
              onChange={onChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={requestClose}>
            {t("valheimMods.configs.close")}
          </Button>
          <Button variant="contained" disabled={saving} onClick={onSave}>
            {t("valheimMods.configs.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)}>
        <DialogTitle>{t("valheimMods.configs.unsaved.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("valheimMods.configs.unsaved.message", { name: fileName })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(false)}>
            {t("valheimMods.configs.unsaved.keepEditing")}
          </Button>
          <Button
            color="error"
            onClick={() => {
              setConfirmClose(false);
              onClose();
            }}
          >
            {t("valheimMods.configs.unsaved.discard")}
          </Button>
          <Button
            variant="contained"
            disabled={saving}
            onClick={() => {
              setConfirmClose(false);
              onSave();
            }}
          >
            {t("valheimMods.configs.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
