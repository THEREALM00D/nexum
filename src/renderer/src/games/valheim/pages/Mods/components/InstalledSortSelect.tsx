import { MenuItem, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  INSTALLED_SORTS,
  type InstalledSort,
} from "../utils/sortInstalledMods";

interface Props {
  value: InstalledSort;
  onChange: (sort: InstalledSort) => void;
}

// Sélecteur de tri de l'onglet Installés.
export default function InstalledSortSelect({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <TextField
      select
      size="small"
      label={t("valheimMods.installed.sort.label")}
      value={value}
      onChange={(e) => onChange(e.target.value as InstalledSort)}
      sx={{ minWidth: 220 }}
    >
      {INSTALLED_SORTS.map((sort) => (
        <MenuItem key={sort} value={sort}>
          {t(`valheimMods.installed.sort.${sort}`)}
        </MenuItem>
      ))}
    </TextField>
  );
}
