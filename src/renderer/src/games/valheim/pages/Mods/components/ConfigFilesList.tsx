import { useState } from "react";
import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ValheimModConfigFile } from "@shared/types";
import SearchField from "../../../../../components/common/SearchField";
import ScrollPanel from "../../../../../components/common/ScrollPanel";
import { skeletonRows } from "../../../../../components/common/LoadingSkeleton";
import { useConfigFilesSearch } from "../hooks/useConfigFilesSearch";
import ConfigFileRow from "./ConfigFileRow";

// Fichier d'exemple des lignes en skeleton (jamais affiché)
const PLACEHOLDER_FILE: ValheimModConfigFile = {
  name: "author.modname.cfg",
  size: 4096,
  mtime: 0,
};

interface Props {
  files: ValheimModConfigFile[];
  /** Liste pas encore lue : lignes en skeleton. */
  loading: boolean;
  locale: string;
  /** `search` : recherche à reporter dans l'éditeur (paramètres trouvés). */
  onOpen: (fileName: string, search?: string) => void;
}

export default function ConfigFilesList({
  files,
  loading,
  locale,
  onOpen,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { results, query, indexing } = useConfigFilesSearch(files, search);

  if (!loading && files.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
        {t("valheimMods.configs.empty")}
      </Typography>
    );
  }

  const placeholderRows = (count: number) =>
    skeletonRows(
      <ConfigFileRow
        file={PLACEHOLDER_FILE}
        matches={[]}
        locale={locale}
        onOpen={() => {}}
      />,
      count,
    );

  return (
    <ScrollPanel
      minHeight={280}
      resetKey={query}
      header={
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t("valheimMods.configs.searchFiles")}
          sx={{ width: "100%" }}
        />
      }
    >
      {!loading && !indexing && results.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
          {t("valheimMods.configs.noMatch")}
        </Typography>
      )}
      <Stack spacing={0.5}>
        {loading && placeholderRows(6)}
        {results.map(({ file, matches }) => (
          <ConfigFileRow
            key={file.name}
            file={file}
            matches={matches}
            locale={locale}
            // Fichier trouvé par son nom seul : ouvert sans filtre
            onOpen={() =>
              onOpen(file.name, matches.length > 0 ? query : undefined)
            }
          />
        ))}
        {/* Paramètres en cours de lecture : d'autres fichiers vont s'ajouter */}
        {indexing && placeholderRows(3)}
      </Stack>
    </ScrollPanel>
  );
}
