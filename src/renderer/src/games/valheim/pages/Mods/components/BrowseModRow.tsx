import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";
import type { ThunderstoreModInfo } from "@shared/types";
import ModRow from "../../../../../components/mods/ModRow";
import { REGISTRY_LABEL, modPageUrl } from "../utils/modPageUrl";
import ModUpdatedDate from "./ModUpdatedDate";
import DeprecatedChip from "./DeprecatedChip";

/** Mod d'exemple pour les skeletons de l'onglet Parcourir (jamais visible). */
export const PLACEHOLDER_MOD: ThunderstoreModInfo = {
  mod_id: 0,
  name: "ModName",
  summary: "Mod summary",
  picture_url: "",
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

/**
 * Un mod de l'onglet Parcourir, sur la ligne commune des pages Mods
 * (`components/mods/ModRow`, comme Installés et ARK) : j'aime, versions,
 * installer la dernière, page du mod.
 */
export default function BrowseModRow({ mod, onOpenFiles, onInstall }: Props) {
  const { t } = useTranslation();
  return (
    <ModRow
      logoUrl={mod.picture_url || null}
      name={mod.name}
      nameSuffix={`v${mod.version}`}
      chips={mod.deprecated && <DeprecatedChip registry={mod.registry} />}
      details={
        <>
          {mod.author} · <ModUpdatedDate timestamp={mod.updated_timestamp} />
        </>
      }
      summary={mod.summary}
      actions={
        <>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", mr: 1 }}
          >
            <ThumbUpIcon sx={{ fontSize: 12, color: "text.disabled" }} />
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              {mod.endorsement_count.toLocaleString()}
            </Typography>
          </Stack>
          <Tooltip title={t("valheimMods.browse.viewFiles")}>
            <IconButton
              size="small"
              aria-label={t("valheimMods.browse.viewFiles")}
              onClick={() => onOpenFiles(mod)}
            >
              <FolderOpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {/* Installation directe de la dernière version */}
          <Tooltip title={t("valheimMods.browse.installLatest")}>
            <IconButton
              size="small"
              color="primary"
              aria-label={t("valheimMods.browse.installLatest")}
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
              aria-label={t("valheimMods.browse.openTooltip", {
                registry: REGISTRY_LABEL[mod.registry],
              })}
              onClick={() =>
                window.api.shell.openExternal(
                  modPageUrl(mod.registry, mod.author, mod.name),
                )
              }
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      }
    />
  );
}
