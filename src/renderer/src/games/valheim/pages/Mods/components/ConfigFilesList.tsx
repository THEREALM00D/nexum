import { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";
import type { ValheimModConfigFile } from "@shared/types";
import { formatDate, formatSize } from "../../../../../utils/format";
import SearchField from "../../../../../components/common/SearchField";
import { FONT_MONO } from "../../../../../theme";

interface Props {
  files: ValheimModConfigFile[];
  locale: string;
  onOpen: (fileName: string) => void;
}

export default function ConfigFilesList({ files, locale, onOpen }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const visibleFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? files.filter((f) => f.name.toLowerCase().includes(query))
      : files;
  }, [files, search]);

  if (files.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
        {t("valheimMods.configs.empty")}
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <SearchField
        value={search}
        onChange={setSearch}
        placeholder={t("valheimMods.configs.searchFiles")}
        sx={{ mb: 1.5, width: "100%" }}
      />
      {visibleFiles.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
          {t("valheimMods.configs.noMatch")}
        </Typography>
      )}
      <Stack spacing={0.5}>
        {visibleFiles.map((file) => (
          <Box
            key={file.name}
            onClick={() => onOpen(file.name)}
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
            <Typography
              variant="body2"
              sx={{ flex: 1, fontFamily: FONT_MONO }}
              noWrap
            >
              {file.name}
            </Typography>
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
            <Tooltip title={t("valheimMods.configs.edit")}>
              <IconButton size="small" onClick={() => onOpen(file.name)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
