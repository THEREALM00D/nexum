import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  shown: number;
  total: number;
  /** Recherche : « N résultats » une fois tout affiché. */
  isSearch: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

// Sous la liste de Parcourir : compteur et bouton « Charger plus ».
export default function BrowseLoadMore({
  shown,
  total,
  isSearch,
  loadingMore,
  onLoadMore,
}: Props) {
  const { t, i18n } = useTranslation();
  if (total === 0) {
    return isSearch ? (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
        {t("valheimMods.browse.noResults")}
      </Typography>
    ) : null;
  }
  const hasMore = shown < total;
  const formatCount = (count: number) =>
    count.toLocaleString(i18n.resolvedLanguage);

  const counter =
    isSearch && !hasMore
      ? t("valheimMods.browse.resultCount", {
          count: total,
          formatted: formatCount(total),
        })
      : t("valheimMods.browse.shownOfTotal", {
          shown: formatCount(shown),
          total: formatCount(total),
        });

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 2,
        pt: 2,
      }}
    >
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {counter}
      </Typography>
      {hasMore && (
        <Button
          size="small"
          variant="outlined"
          onClick={onLoadMore}
          disabled={loadingMore}
          startIcon={
            loadingMore ? (
              <CircularProgress size={14} color="inherit" />
            ) : undefined
          }
        >
          {t("valheimMods.browse.loadMore")}
        </Button>
      )}
    </Stack>
  );
}
