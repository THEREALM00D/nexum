import {
  Box,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { useTranslation } from "react-i18next";
import type { ValheimMod, ModUpdate, ModRegistry } from "@shared/types";
import { formatDate } from "../../../../../utils/format";
import { REGISTRY_LABEL, modPageUrl } from "../utils/modPageUrl";
import RegistryChip from "./RegistryChip";
import DeprecatedChip from "./DeprecatedChip";

// Le nom complet est stocké comme "auteur-nom" (voir
// ValheimModsManager.installMod) — on retire le préfixe auteur pour
// reconstruire l'URL de la page du package sur son registre d'origine.
function modPage(mod: ValheimMod): string | null {
  if (
    !mod.thunderstoreCode ||
    !mod.author ||
    (mod.source !== "thunderstore" && mod.source !== "hexium")
  )
    return null;
  const prefix = `${mod.author}-`;
  if (!mod.name.startsWith(prefix)) return null;
  const name = mod.name.slice(prefix.length);
  return modPageUrl(mod.source, mod.author, name);
}

interface Props {
  mod: ValheimMod;
  locale: string;
  update: ModUpdate | undefined;
  deprecated: boolean;
  onRemove: (modId: number, name: string) => void;
  onToggle: (modId: number, enabled: boolean) => void;
  onUpdate: (registry: ModRegistry, latestCode: string) => void;
}

// Une ligne de la liste des mods installés : nom, version, provenance,
// statut (déprécié, mise à jour disponible) et actions.
export default function InstalledModRow({
  mod,
  locale,
  update,
  deprecated,
  onRemove,
  onToggle,
  onUpdate,
}: Props) {
  const { t } = useTranslation();
  const pageUrl = modPage(mod);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
      {mod.pictureUrl && (
        <Box
          component="img"
          src={mod.pictureUrl}
          alt={mod.name}
          sx={{
            width: 56,
            height: 40,
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
              {t("valheimMods.installed.version", { version: mod.version })}
            </Typography>
          </Typography>
          {mod.source && <RegistryChip source={mod.source} />}
          {deprecated &&
            (mod.source === "thunderstore" || mod.source === "hexium") && (
              <DeprecatedChip
                registry={mod.source}
                alternative={
                  update?.sourceChanged ? update.registry : undefined
                }
              />
            )}
          {update && (
            <Chip
              label={
                update.sourceChanged
                  ? t("valheimMods.updates.newVersionOnRegistry", {
                      version: update.latestVersion,
                      registry: REGISTRY_LABEL[update.registry],
                    })
                  : t("valheimMods.updates.newVersion", {
                      version: update.latestVersion,
                    })
              }
              size="small"
              color="warning"
              sx={{ fontSize: 10, height: 18, px: 0.5 }}
            />
          )}
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
          {mod.author || "—"}{" "}
          {mod.installedAt > 0 &&
            `— ${t("valheimMods.installed.installedAt", { date: formatDate(mod.installedAt, locale) })}`}
          {mod.publishedAt &&
            (mod.source === "thunderstore" || mod.source === "hexium") &&
            ` — ${t("valheimMods.installed.updatedAt", {
              registry: REGISTRY_LABEL[mod.source],
              date: formatDate(mod.publishedAt * 1000, locale),
            })}`}
        </Typography>
      </Box>
      <Tooltip
        title={
          mod.enabled
            ? t("valheimMods.installed.enabled")
            : t("valheimMods.installed.disabled")
        }
      >
        <Switch
          size="small"
          checked={mod.enabled}
          onChange={(e) => onToggle(mod.modId, e.target.checked)}
        />
      </Tooltip>
      {update && (
        <Tooltip
          title={
            update.sourceChanged
              ? t("valheimMods.updates.updateBtnSourceChanged", {
                  version: update.latestVersion,
                  from: REGISTRY_LABEL[mod.source as "thunderstore" | "hexium"],
                  to: REGISTRY_LABEL[update.registry],
                })
              : t("valheimMods.updates.updateBtn", {
                  version: update.latestVersion,
                })
          }
        >
          <IconButton
            size="small"
            color="warning"
            onClick={() => onUpdate(update.registry, update.latestCode)}
          >
            <SystemUpdateAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {pageUrl && (
        <Tooltip
          title={t("valheimMods.browse.openTooltip", {
            registry: REGISTRY_LABEL[mod.source as "thunderstore" | "hexium"],
          })}
        >
          <IconButton
            size="small"
            onClick={() => window.api.shell.openExternal(pageUrl)}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={t("valheimMods.installed.remove")}>
        <IconButton
          size="small"
          color="error"
          onClick={() => onRemove(mod.modId, mod.name)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
