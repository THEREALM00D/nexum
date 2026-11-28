import type { ReactNode } from "react";
import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkModInfo } from "@shared/types";
import { formatDay } from "../../../../../utils/format";
import ModRow from "../../../../../components/mods/ModRow";

/** Mini-puce d'une ligne de mod (Payant, Passif, Cosmétique…). */
export const ARK_CHIP_SX = {
  typography: "micro",
  height: 18,
  px: 0.5,
} as const;

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

// Une ligne de mod ARK sur la ligne commune (components/mods/ModRow) :
// auteurs, ID et fichier téléchargé par le serveur (Liste) ou détails de la
// recherche (Parcourir). Sert aussi aux skeletons.
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
    <ModRow
      logoUrl={info?.logoUrl}
      name={name}
      dimmed={dimmed}
      details={(details ?? listDetails).join(" — ")}
      summary={showSummary ? info?.summary : undefined}
      chips={
        <>
          {chips}
          {info?.premium && (
            <Chip
              label={t("arkMods.list.premium")}
              size="small"
              color="warning"
              sx={ARK_CHIP_SX}
            />
          )}
        </>
      }
      actions={actions}
    />
  );
}
