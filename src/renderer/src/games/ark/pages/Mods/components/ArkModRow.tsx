import type { ReactNode } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import ExtensionIcon from "@mui/icons-material/Extension";
import { useTranslation } from "react-i18next";
import type { ArkModInfo } from "@shared/types";
import { formatDay } from "../../../../../utils/format";

interface Props {
  id: number;
  /** null : mod pas encore téléchargé par le serveur et pas de fiche CurseForge. */
  info: ArkModInfo | null;
  /** Mod désactivé : ligne estompée. */
  dimmed?: boolean;
  /** Remplace la ligne de détails (Parcourir : auteur, téléchargements…). */
  details?: string[];
  /** Puces après le nom (Parcourir : cosmétique, PC seulement). */
  chips?: ReactNode;
  /** Résumé du mod, sous les détails (Parcourir). */
  showSummary?: boolean;
  actions: ReactNode;
}

const LOGO_SIZE = 40;

// Une ligne de mod : logo, nom, auteurs, fichier téléchargé par le serveur
// (Liste) ou détails de la recherche (Parcourir). Sert aussi aux skeletons.
export default function ArkModRow({
  id,
  info,
  dimmed,
  details,
  chips,
  showSummary,
  actions,
}: Props) {
  const { t, i18n } = useTranslation();
  const name = info?.name || t("arkMods.list.unknownName", { id });
  const listDetails = [
    info?.authors.length
      ? t("arkMods.list.by", { authors: info.authors.join(", ") })
      : null,
    // Sans nom, l'ID est déjà dans le titre (« Mod 928621 »).
    info?.name ? t("arkMods.list.id", { id }) : null,
    info?.installedFile
      ? info.installedFileDate
        ? t("arkMods.list.fileWithDate", {
            file: info.installedFile,
            date: formatDay(Date.parse(info.installedFileDate), i18n.language),
          })
        : info.installedFile
      : t("arkMods.list.notDownloaded"),
  ].filter(Boolean);

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{
        alignItems: "center",
        gap: 2,
        py: 1.25,
        flexWrap: "wrap",
        opacity: dimmed ? 0.55 : 1,
      }}
    >
      {info?.logoUrl ? (
        <Box
          component="img"
          src={info.logoUrl}
          alt=""
          sx={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            objectFit: "cover",
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
      ) : (
        <Box
          sx={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            borderRadius: 1,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: "action.hover",
            color: "text.secondary",
          }}
        >
          <ExtensionIcon fontSize="small" />
        </Box>
      )}
      <Box sx={{ flex: "1 1 240px", minWidth: 0 }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
            {name}
          </Typography>
          {chips}
          {info?.premium && (
            <Chip
              label={t("arkMods.list.premium")}
              size="small"
              color="warning"
              sx={{ typography: "micro", height: 18, px: 0.5 }}
            />
          )}
        </Stack>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block" }}
          noWrap
        >
          {(details ?? listDetails).join(" — ")}
        </Typography>
        {showSummary && info?.summary && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block" }}
            noWrap
          >
            {info.summary}
          </Typography>
        )}
      </Box>
      <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
        {actions}
      </Stack>
    </Stack>
  );
}
