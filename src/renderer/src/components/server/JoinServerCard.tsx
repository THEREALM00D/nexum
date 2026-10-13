import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PublicIcon from "@mui/icons-material/Public";
import { useTranslation } from "react-i18next";
import type { JoinInfo } from "@shared/types";
import { useServer } from "../../context/ServerContext";
import { useNotification } from "../../context/NotificationContext";
import { FONT_MONO } from "../../theme";

// Dernier code de connexion crossplay Valheim vu dans les logs
// (« … with join code 123456 and IP … »).
const JOIN_CODE = /join code ([A-Za-z0-9]+)/i;

function CopyRow({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      notify(t("join.copied"), "success");
    } catch {
      notify(t("logs.copyError"));
    }
  };
  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", minWidth: 170 }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontFamily: FONT_MONO, fontSize: 14 }}>
        {value}
      </Typography>
      <Tooltip title={t("join.copy")}>
        <IconButton size="small" onClick={copy}>
          <ContentCopyIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/**
 * « Rejoindre le serveur » : l'adresse à donner aux amis (réseau local et
 * Internet), le code crossplay Valheim s'il existe, et les ports à ouvrir
 * sur la box. L'IP publique n'est demandée qu'au clic (service tiers).
 */
export default function JoinServerCard() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const serverId = state.activeServer?.id;
  const [info, setInfo] = useState<JoinInfo | null>(null);
  const [publicIp, setPublicIp] = useState<string | null>(null);
  const [loadingIp, setLoadingIp] = useState(false);

  // Relu au changement de serveur et de statut (config modifiée entre-temps)
  useEffect(() => {
    if (!serverId) return;
    window.api.server
      .getJoinInfo(serverId)
      .then(setInfo)
      .catch(() => setInfo(null));
  }, [serverId, state.status]);

  const joinCode = useMemo(() => {
    for (let i = state.logs.length - 1; i >= 0; i--) {
      const m = JOIN_CODE.exec(state.logs[i]);
      if (m) return m[1];
    }
    return null;
  }, [state.logs]);

  const showPublicIp = async () => {
    setLoadingIp(true);
    try {
      setPublicIp(await window.api.server.getPublicIp());
    } catch {
      notify(t("join.publicIpError"));
    } finally {
      setLoadingIp(false);
    }
  };

  if (!info) return null;
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        {t("join.title")}
      </Typography>
      <Stack spacing={1}>
        {info.localIp && (
          <CopyRow
            label={t("join.local")}
            value={`${info.localIp}:${info.port}`}
          />
        )}
        {publicIp ? (
          <CopyRow
            label={t("join.internet")}
            value={`${publicIp}:${info.port}`}
          />
        ) : (
          <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", minWidth: 170 }}
            >
              {t("join.internet")}
            </Typography>
            <Tooltip title={t("join.publicIpTooltip")}>
              <span>
                <Button
                  size="small"
                  startIcon={<PublicIcon />}
                  onClick={showPublicIp}
                  disabled={loadingIp}
                >
                  {t("join.showPublicIp")}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        )}
        {info.crossplay && joinCode && (
          <CopyRow label={t("join.code")} value={joinCode} />
        )}
      </Stack>
      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t("join.hint", {
            range: info.portRange,
            ip: info.localIp ?? t("join.thisPc"),
          })}
        </Typography>
      </Box>
    </Paper>
  );
}
