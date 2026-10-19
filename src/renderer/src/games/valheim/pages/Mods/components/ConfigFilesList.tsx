import { useMemo, useState } from "react";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";
import type { ValheimModConfigFile } from "@shared/types";
import { formatDate, formatSize } from "../../../../../utils/format";
import SearchField from "../../../../../components/common/SearchField";
import ScrollPanel from "../../../../../components/common/ScrollPanel";
import { skeletonRows } from "../../../../../components/common/LoadingSkeleton";
import { FONT_MONO } from "../../../../../theme";

// Fichier d'exemple des lignes en skeleton (jamais affiché)
const PLACEHOLDER_FILE: ValheimModConfigFile = {
  name: "author.modname.cfg",
  size: 4096,
  mtime: 0,
};

function ConfigFileRow({
  file,
  locale,
  onOpen,
}: {
  file: ValheimModConfigFile;
  locale: string;
  onOpen: (fileName: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Box
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
  );
}

interface Props {
  files: ValheimModConfigFile[];
  /** Liste pas encore lue : lignes en skeleton. */
  loading: boolean;
  locale: string;
  onOpen: (fileName: string) => void;
}

export default function ConfigFilesList({
  files,
  loading,
  locale,
  onOpen,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const visibleFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? files.filter((f) => f.name.toLowerCase().includes(query))
      : files;
  }, [files, search]);

  if (!loading && files.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
        {t("valheimMods.configs.empty")}
      </Typography>
    );
  }

  return (
    <ScrollPanel
      minHeight={280}
      header={
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t("valheimMods.configs.searchFiles")}
          sx={{ width: "100%" }}
        />
      }
    >
      {visibleFiles.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
          {t("valheimMods.configs.noMatch")}
        </Typography>
      )}
      <Stack spacing={0.5}>
        {loading &&
          skeletonRows(
            <ConfigFileRow
              file={PLACEHOLDER_FILE}
              locale={locale}
              onOpen={() => {}}
            />,
            6,
          )}
        {visibleFiles.map((file) => (
          <ConfigFileRow
            key={file.name}
            file={file}
            locale={locale}
            onOpen={onOpen}
          />
        ))}
      </Stack>
    </ScrollPanel>
  );
}
