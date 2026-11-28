import { Button, Chip, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import type { ArkModSearchResult } from "@shared/types";
import { formatDay } from "../../../../../utils/format";
import ArkModRow, { ARK_CHIP_SX } from "./ArkModRow";

interface Props {
  mod: ArkModSearchResult;
  /** Déjà dans la liste du serveur. */
  added: boolean;
  disabled: boolean;
  onAdd: (id: number) => void;
}

// Un résultat de Parcourir : fiche CurseForge, puces d'avertissement et
// bouton Ajouter (désactivé pour un mod cosmétique, qui empêcherait le
// serveur de démarrer).
export default function BrowseModRow({ mod, added, disabled, onAdd }: Props) {
  const { t, i18n } = useTranslation();
  const open = t("arkMods.list.open");
  const details = [
    mod.authors.length
      ? t("arkMods.list.by", { authors: mod.authors.join(", ") })
      : null,
    t("arkMods.browse.downloads", {
      count: mod.downloadCount,
      formatted: mod.downloadCount.toLocaleString(i18n.resolvedLanguage),
    }),
    mod.updatedAt
      ? t("arkMods.browse.updatedOn", {
          date: formatDay(Date.parse(mod.updatedAt), i18n.language),
        })
      : null,
  ].filter((detail): detail is string => Boolean(detail));

  const addButton = (
    <Button
      size="small"
      variant={added ? "text" : "outlined"}
      startIcon={added ? <CheckIcon /> : <AddIcon />}
      disabled={added || disabled || mod.cosmetic}
      onClick={() => onAdd(mod.id)}
    >
      {added ? t("arkMods.browse.added") : t("arkMods.browse.add")}
    </Button>
  );

  return (
    <ArkModRow
      id={mod.id}
      info={mod}
      details={details}
      showSummary
      chips={
        <>
          {mod.cosmetic && (
            <Tooltip title={t("arkMods.browse.cosmeticHint")} describeChild>
              <Chip
                label={t("arkMods.browse.cosmetic")}
                size="small"
                color="error"
                sx={ARK_CHIP_SX}
              />
            </Tooltip>
          )}
          {mod.pcOnly && (
            <Tooltip title={t("arkMods.browse.pcOnlyHint")} describeChild>
              <Chip
                label={t("arkMods.browse.pcOnly")}
                size="small"
                color="warning"
                sx={ARK_CHIP_SX}
              />
            </Tooltip>
          )}
        </>
      }
      actions={
        <>
          {mod.websiteUrl && (
            <Tooltip title={open}>
              <IconButton
                size="small"
                aria-label={open}
                onClick={() =>
                  void window.api.shell.openExternal(mod.websiteUrl as string)
                }
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {mod.cosmetic ? (
            <Tooltip title={t("arkMods.browse.cosmeticHint")} describeChild>
              <span>{addButton}</span>
            </Tooltip>
          ) : (
            addButton
          )}
        </>
      }
    />
  );
}
