import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkPerLevelStats, ArkStatsTable } from "@shared/types";

const TABLES: ArkStatsTable[] = [
  "Player",
  "DinoWild",
  "DinoTamed",
  "DinoTamed_Add",
  "DinoTamed_Affinity",
];
const STAT_COUNT = 12;

// Valeurs du jeu quand la ligne n'est pas écrite (wiki ; 1 si non précisé).
const DEFAULTS: Partial<Record<ArkStatsTable, Record<number, string>>> = {
  DinoTamed: { 0: "0.2", 8: "0.17" },
  DinoTamed_Add: { 0: "0.14", 8: "0.14" },
  DinoTamed_Affinity: { 0: "0.44", 8: "0.44" },
};
const defaultOf = (table: ArkStatsTable, stat: number) =>
  DEFAULTS[table]?.[stat] ?? "1";

interface Props {
  stats: ArkPerLevelStats;
  disabled: boolean;
  onChange: (stats: ArkPerLevelStats) => void;
}

// PerLevelStatsMultiplier_<table>[0..11] : une ligne par stat, une colonne
// par tableau. Vide = valeur par défaut du jeu (ligne non écrite).
export default function StatsEditor({ stats, disabled, onChange }: Props) {
  const { t } = useTranslation();
  const update = (table: ArkStatsTable, stat: number, value: string) => {
    const values = Array.from(
      { length: STAT_COUNT },
      (_, index) => stats[table]?.[index] ?? "",
    );
    values[stat] = value;
    onChange({ ...stats, [table]: values });
  };

  return (
    <>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("arkListsUi.statsHint")}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("arkListsUi.stat")}</TableCell>
              {TABLES.map((table) => (
                <TableCell key={table}>
                  {t(`arkListsUi.statsTables.${table}`)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: STAT_COUNT }, (_, stat) => (
              <TableRow key={stat}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {t(`arkListsUi.stats.${stat}`)}
                </TableCell>
                {TABLES.map((table) => (
                  <TableCell key={table}>
                    {/* OutlinedInput plutôt que TextField (sans label ni
                        FormControl) : 60 champs, 4 fois moins de nœuds. */}
                    <OutlinedInput
                      size="small"
                      value={stats[table]?.[stat] ?? ""}
                      placeholder={defaultOf(table, stat)}
                      disabled={disabled}
                      onChange={(event) =>
                        update(table, stat, event.target.value)
                      }
                      inputProps={{
                        inputMode: "decimal",
                        "aria-label": `${t(`arkListsUi.stats.${stat}`)} — ${t(`arkListsUi.statsTables.${table}`)}`,
                      }}
                      sx={{ minWidth: 80 }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
