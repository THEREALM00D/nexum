import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import { useTranslation } from "react-i18next";

/** Recherche de paramètre + bouton tout déplier / tout replier. */
export default function ConfigSearchBar({
  search,
  onSearch,
  allExpanded,
  onToggleAll,
}: {
  search: string;
  onSearch: (value: string) => void;
  allExpanded: boolean;
  onToggleAll: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <TextField
        size="small"
        placeholder={t("config.search")}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        sx={{ flex: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onSearch("")}
                  aria-label={t("config.searchClear")}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />
      <Tooltip
        title={allExpanded ? t("config.collapseAll") : t("config.expandAll")}
      >
        <IconButton size="small" onClick={onToggleAll}>
          {allExpanded ? (
            <UnfoldLessIcon fontSize="small" />
          ) : (
            <UnfoldMoreIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
