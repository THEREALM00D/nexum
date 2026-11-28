import { useState } from "react";
import {
  Box,
  ButtonBase,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RestoreIcon from "@mui/icons-material/Restore";
import { useTranslation } from "react-i18next";
import type { ArkProfilePlayer, ArkProfileVersion } from "@shared/types";
import { FOCUS_RING_SX, FONT_MONO } from "../../../../../theme";
import { formatDate } from "../../../../../utils/format";
import { useFormatSize } from "../../../../../hooks/useFormatSize";
import { formatRelative } from "../../../../../components/players/utils";

interface Props {
  player: ArkProfilePlayer;
  /** Serveur arrêté : le jeu réécrirait le profil restauré. */
  canRestore: boolean;
  onRestore: (player: ArkProfilePlayer, version: ArkProfileVersion) => void;
}

/** Un joueur : nom, ID, résumé ; dépliée, une ligne par version. */
export default function ProfileRow({ player, canRestore, onRestore }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "fr";
  const formatSize = useFormatSize();
  const [open, setOpen] = useState(false);
  const latest = player.versions[0];

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <ButtonBase
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        sx={{
          width: "100%",
          justifyContent: "flex-start",
          textAlign: "left",
          gap: 1.5,
          px: 0.5,
          py: 1.25,
          borderRadius: 1,
          ...FOCUS_RING_SX,
        }}
      >
        <ExpandMoreIcon
          sx={{
            color: "text.secondary",
            transform: open ? "rotate(180deg)" : "rotate(-90deg)",
            transition: "transform 150ms",
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
            {player.playerName ?? player.eosId}
            {player.characterName && (
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.secondary", ml: 1 }}
              >
                {player.characterName}
              </Typography>
            )}
          </Typography>
          <Typography
            variant="micro"
            noWrap
            sx={{
              display: "block",
              fontFamily: FONT_MONO,
              color: "text.secondary",
            }}
          >
            {player.eosId}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", flexShrink: 0 }}
        >
          {t("arkBackup.profiles.summary", {
            count: player.versions.length,
            when: latest ? formatRelative(latest.createdAt, t) : "",
          })}
        </Typography>
      </ButtonBase>

      <Collapse in={open} unmountOnExit>
        <Stack spacing={0.25} sx={{ pl: 4.5, pr: 0.5, pb: 1 }}>
          {player.versions.map((version) => (
            <Stack
              key={version.id}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", py: 0.25 }}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>
                {formatDate(version.createdAt, locale)}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {formatSize(version.size)}
              </Typography>
              <Tooltip title={t("arkBackup.profiles.restoreTooltip")}>
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    disabled={!canRestore}
                    onClick={() => onRestore(player, version)}
                    aria-label={t("arkBackup.profiles.restoreTooltip")}
                  >
                    <RestoreIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          ))}
          {!canRestore && (
            <Typography variant="caption" sx={{ color: "warning.main" }}>
              {t("arkBackup.profiles.stopToRestore")}
            </Typography>
          )}
        </Stack>
      </Collapse>
    </Box>
  );
}
