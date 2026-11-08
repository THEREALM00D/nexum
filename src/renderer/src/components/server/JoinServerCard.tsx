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
import LoadingSkeleton, { SkeletonChildren } from "../common/LoadingSkeleton";
import SectionTitle from "../common/SectionTitle";

// Dernier code de connexion crossplay Valheim vu dans les logs
// (« … with join code 123456 and IP … »).
const JOIN_CODE = /join code ([A-Za-z0-9]+)/i;

// Libellé à gauche, valeur à droite ; passe à la ligne dans une fenêtre
// étroite plutôt que de déborder de la carte.
const ROW_SX = { alignItems: "center", flexWrap: "wrap", columnGap: 1 };
// Forme d'exemple de la carte pendant le chargement (jamais affichée)
const PLACEHOLDER_INFO: JoinInfo = {
  localIp: "192.168.1.10",
  port: 7777,
  portRange: "7777",
  crossplay: false,
};

const LABEL_SX = { color: "text.secondary", minWidth: { xs: 120, md: 170 } };

function CopyRow({
  label,
  value,
  large = false,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
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
    <Stack direction="row" sx={ROW_SX}>
      <Typography variant="body2" sx={LABEL_SX}>
        {label}
      </Typography>
      <Typography variant={large ? "address" : "code"}>{value}</Typography>
      <Tooltip title={t("join.copy")}>
        <IconButton size="small" onClick={copy}>
          <ContentCopyIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/**
 * « Rejoindre le serveur » : l'adresse à donner aux amis (Internet puis
 * réseau local), le code crossplay Valheim s'il existe, et les ports à ouvrir
 * sur la box. L'IP publique n'est demandée qu'au clic (service tiers). Une
 * adresse n'est utile que serveur en ligne : une phrase la remplace sinon.
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

  if (!serverId) return null;
  // Pas encore lues : la carte garde sa place, contenu en skeleton
  const loading = info === null;
  const data = info ?? PLACEHOLDER_INFO;
  return (
    <Paper sx={{ p: 2.5 }}>
      <SectionTitle sx={{ mb: 1.5 }}>{t("join.title")}</SectionTitle>
      {state.status === "running" ? (
        <Stack spacing={1}>
          <SkeletonChildren loading={loading}>
            {publicIp ? (
              <CopyRow
                large
                label={t("join.internet")}
                value={`${publicIp}:${data.port}`}
              />
            ) : (
              <Stack direction="row" sx={ROW_SX}>
                <Typography variant="body2" sx={LABEL_SX}>
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
            {data.localIp && (
              <CopyRow
                large
                label={t("join.local")}
                value={`${data.localIp}:${data.port}`}
              />
            )}
            {data.crossplay && joinCode && (
              <CopyRow label={t("join.code")} value={joinCode} />
            )}
            {data.searchName && (
              <CopyRow label={t("join.searchName")} value={data.searchName} />
            )}
          </SkeletonChildren>
        </Stack>
      ) : (
        <Typography
          variant="body2"
          sx={{
            p: 2,
            color: "text.secondary",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          {t("join.notRunning")}
        </Typography>
      )}
      <Box sx={{ mt: 1.5 }}>
        <LoadingSkeleton loading={loading}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("join.hint", {
              range: data.portRange,
              ip: data.localIp ?? t("join.thisPc"),
            })}
          </Typography>
        </LoadingSkeleton>
      </Box>
    </Paper>
  );
}
