import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";
import type { ValheimModConfigFile } from "@shared/types";
import type { CfgEntry } from "../utils/cfgParser";
import { formatDate, formatSize } from "../../../../../utils/format";
import { FONT_MONO } from "../../../../../theme";

// Paramètres trouvés affichés sous le nom du fichier ; le reste est compté.
const MAX_SHOWN_MATCHES = 3;

interface Props {
  file: ValheimModConfigFile;
  /** Paramètres qui correspondent à la recherche (vide : nom seul). */
  matches: CfgEntry[];
  locale: string;
  onOpen: () => void;
}

export default function ConfigFileRow({
  file,
  matches,
  locale,
  onOpen,
}: Props) {
  const { t } = useTranslation();
  const hidden = matches.length - MAX_SHOWN_MATCHES;
  return (
    <Box
      onClick={onOpen}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1,
        px: 1,
        borderRadius: 1,
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontFamily: FONT_MONO }} noWrap>
          {file.name}
        </Typography>
        {matches.slice(0, MAX_SHOWN_MATCHES).map((entry, i) => (
          <Typography
            key={entry.lineIndex}
            variant="caption"
            component="div"
            sx={{ color: "text.secondary", pl: 1 }}
            noWrap
          >
            {entry.section ? `${entry.section} › ${entry.key}` : entry.key}
            {i === MAX_SHOWN_MATCHES - 1 &&
              hidden > 0 &&
              ` ${t("valheimMods.configs.moreMatches", { count: hidden })}`}
          </Typography>
        ))}
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {formatSize(file.size)}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          minWidth: 120,
          textAlign: "right",
        }}
      >
        {formatDate(file.mtime, locale)}
      </Typography>
      {/* Pas d'onClick : le clic remonte jusqu'à la ligne (une seule ouverture) */}
      <Tooltip title={t("valheimMods.configs.edit")}>
        <IconButton size="small">
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
