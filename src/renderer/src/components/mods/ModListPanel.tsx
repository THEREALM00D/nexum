import type { ReactElement, ReactNode } from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import SearchField from "../common/SearchField";
import ScrollPanel from "../common/ScrollPanel";
import LoadingSkeleton, { skeletonRows } from "../common/LoadingSkeleton";

interface Props {
  search: string;
  onSearch: (search: string) => void;
  searchPlaceholder: string;
  /** Compteur à droite de la recherche (« 12 mods », « 3 sur 12 »). */
  count: string;
  /** Réglages en plus dans l'en-tête (tri…). */
  extra?: ReactNode;
  /** Liste pas encore lue : compteur et lignes en skeleton. */
  loading: boolean;
  /** Ligne factice (vrai composant de ligne) pour les skeletons. */
  skeletonRow: ReactElement;
  /** Aucun mod : texte à la place de la liste. */
  emptyText: string;
  /** Mods présents mais aucun ne correspond à la recherche. */
  noMatchText?: string;
  /** Bloc après les lignes, dans la même zone qui défile (ARK : mods
   * téléchargés hors liste). */
  after?: ReactNode;
  /** Retour en haut de la liste quand cette valeur change (tri). */
  resetKey?: unknown;
  /** Lignes déjà filtrées. */
  children: ReactNode[];
}

/**
 * Liste des mods d'un serveur, commune aux pages Mods (Valheim, ARK) :
 * recherche, compteur et réglages restent en place, seule la liste défile.
 */
export default function ModListPanel({
  search,
  onSearch,
  searchPlaceholder,
  count,
  extra,
  loading,
  skeletonRow,
  emptyText,
  noMatchText,
  after,
  resetKey,
  children,
}: Props) {
  const empty = !loading && children.length === 0;

  return (
    <ScrollPanel
      minHeight={240}
      resetKey={resetKey}
      header={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <SearchField
            value={search}
            onChange={onSearch}
            placeholder={searchPlaceholder}
            sx={{ flex: 1, minWidth: 200 }}
          />
          {extra}
          <LoadingSkeleton loading={loading}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
            >
              {count}
            </Typography>
          </LoadingSkeleton>
        </Box>
      }
    >
      {empty && (
        <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
          {search.trim() && noMatchText ? noMatchText : emptyText}
        </Typography>
      )}
      <Stack divider={<Divider />}>
        {loading ? skeletonRows(skeletonRow, 4) : children}
      </Stack>
      {!loading && after}
    </ScrollPanel>
  );
}
