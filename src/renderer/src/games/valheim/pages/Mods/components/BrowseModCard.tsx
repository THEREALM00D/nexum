import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";
import type { ThunderstoreModInfo } from "@shared/types";
import { REGISTRY_LABEL, modPageUrl } from "../utils/modPageUrl";
import ModUpdatedDate from "./ModUpdatedDate";
import DeprecatedChip from "./DeprecatedChip";

// Image transparente de 1 px : vignette de la carte d'exemple des skeletons
const BLANK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Carte d'exemple pour les skeletons de l'onglet Parcourir (jamais visible). */
export const PLACEHOLDER_MOD: ThunderstoreModInfo = {
  mod_id: 0,
  name: "ModName",
  summary: "Mod summary",
  picture_url: BLANK_IMAGE,
  version: "1.0.0",
  author: "Author",
  endorsement_count: 1000,
  updated_timestamp: 0,
  registry: "thunderstore",
};

interface Props {
  mod: ThunderstoreModInfo;
  onOpenFiles: (mod: ThunderstoreModInfo) => void;
  onInstall: (mod: ThunderstoreModInfo) => void;
}

/** Un mod de l'onglet Parcourir : vignette, infos, versions / installer / page. */
export default function BrowseModCard({ mod, onOpenFiles, onInstall }: Props) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        {mod.picture_url && (
          <Box
            component="img"
            src={mod.picture_url}
            alt={mod.name}
            sx={{
              width: 80,
              height: 45,
              objectFit: "cover",
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {mod.name}{" "}
              <Typography
                component="span"
                variant="caption"
                sx={{ color: "text.secondary" }}
              >
                v{mod.version}
              </Typography>
            </Typography>
            {mod.deprecated && <DeprecatedChip registry={mod.registry} />}
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
            {mod.author} · <ModUpdatedDate timestamp={mod.updated_timestamp} />
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.disabled",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {mod.summary}
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: "center", flexShrink: 0 }}
        >
          <ThumbUpIcon sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography variant="caption" sx={{ color: "text.disabled", mr: 1 }}>
            {mod.endorsement_count.toLocaleString()}
          </Typography>
          <Tooltip title={t("valheimMods.browse.viewFiles")}>
            <IconButton size="small" onClick={() => onOpenFiles(mod)}>
              <FolderOpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {/* Installation directe de la dernière version */}
          <Tooltip title={t("valheimMods.browse.installLatest")}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onInstall(mod)}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={t("valheimMods.browse.openTooltip", {
              registry: REGISTRY_LABEL[mod.registry],
            })}
          >
            <IconButton
              size="small"
              onClick={() =>
                window.api.shell.openExternal(
                  modPageUrl(mod.registry, mod.author, mod.name),
                )
              }
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
