import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from "react-i18next";
import type { ModpackShare } from "@shared/types";
import { useNotification } from "../../../../../context/NotificationContext";
import { FONT_MONO } from "../../../../../theme";
import { errorMessage } from "../../../../../utils/appErrorMessage";

/**
 * « Partager le modpack » : crée un code de profil r2modman/Gale avec les
 * mods actifs du serveur, à donner aux joueurs pour qu'ils aient exactement
 * les mêmes mods (la plupart doivent aussi être installés côté client).
 */
export default function ShareModpackButton({
  disabled,
}: {
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ModpackShare | null>(null);

  const share = async () => {
    setOpen(true);
    setResult(null);
    setLoading(true);
    try {
      setResult(await window.api.valheim.mods.shareModpack());
    } catch (e) {
      setOpen(false);
      notify(t("valheimMods.share.error", { error: errorMessage(t, e) }));
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.code);
      notify(t("valheimMods.share.copied"), "success");
    } catch {
      notify(t("logs.copyError"));
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<ShareIcon />}
        onClick={share}
        disabled={disabled}
      >
        {t("valheimMods.share.button")}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("valheimMods.share.title")}</DialogTitle>
        <DialogContent>
          {loading || !result ? (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", py: 2 }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2">
                {t("valheimMods.share.creating")}
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                value={result.code}
                label={t("valheimMods.share.codeLabel")}
                fullWidth
                slotProps={{
                  input: { readOnly: true, sx: { fontFamily: FONT_MONO } },
                }}
              />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {t("valheimMods.share.howTo", { count: result.modCount })}
              </Typography>
              {result.includesHexium && (
                <Alert severity="warning" sx={{ fontSize: 13 }}>
                  {t("valheimMods.share.hexiumWarning")}
                </Alert>
              )}
              {result.skippedManual > 0 && (
                <Alert severity="info" sx={{ fontSize: 13 }}>
                  {t("valheimMods.share.skippedManual", {
                    count: result.skippedManual,
                  })}
                </Alert>
              )}
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {t("valheimMods.share.expiry")}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {t("valheimMods.share.close")}
          </Button>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={copy}
            disabled={!result}
          >
            {t("valheimMods.share.copy")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
