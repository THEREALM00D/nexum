import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useTranslation } from "react-i18next";
import type { AdminCapabilities } from "@shared/types";
import { toAsciiChatText } from "@shared/chatText";
import { FONT_MONO } from "../../theme";

interface Props {
  open: boolean;
  capabilities: AdminCapabilities | null;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
}

/** Message aux joueurs, envoyé dans le chat du jeu (API REST ou RCON). */
export default function SendMessageDialog({
  open,
  capabilities,
  onClose,
  onSend,
}: Props) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) setMessage("");
  }, [open]);

  const players = capabilities?.players;
  // ARK : un message fait seulement d'émojis arriverait vide.
  const sendable = capabilities?.asciiChat
    ? toAsciiChatText(message).trim() !== ""
    : message.trim() !== "";
  const send = async () => {
    setSending(true);
    try {
      await onSend(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("serverMenu.messageTitle")}</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ pt: 1 }}>
          <TextField
            label={t("serverMenu.messageLabel")}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            multiline
            minRows={3}
            autoFocus
            fullWidth
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {[
              t("serverMenu.messageHelper"),
              capabilities?.asciiChat ? t("serverMenu.messageAscii") : "",
              players === null || players === undefined
                ? ""
                : t("serverMenu.playersOnline", { count: players }),
            ]
              .filter(Boolean)
              .join(" ")}
          </Typography>
          {capabilities?.asciiChat && message.trim() && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("serverMenu.messagePreview")}{" "}
              <Typography
                component="span"
                variant="caption"
                sx={{ fontFamily: FONT_MONO, color: "text.primary" }}
              >
                {toAsciiChatText(message)}
              </Typography>
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("serverMenu.cancel")}</Button>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          disabled={!sendable || sending}
          onClick={send}
        >
          {t("serverMenu.send")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
