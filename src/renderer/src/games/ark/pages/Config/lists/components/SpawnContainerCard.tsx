import {
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import type {
  ArkSpawnContainer,
  ArkSpawnEntry,
  ArkSpawnLimit,
  ArkSpawnMode,
} from "@shared/types";
import EditableTable, { type TableColumn } from "./EditableTable";

const MODES: ArkSpawnMode[] = ["add", "subtract", "override"];
const ENTRY_COLUMNS: TableColumn<ArkSpawnEntry>[] = [
  { field: "name", labelKey: "arkListsUi.spawnEntryName", type: "text" },
  { field: "weight", labelKey: "arkListsUi.spawnWeight", type: "number" },
  {
    field: "creatures",
    labelKey: "arkListsUi.spawnCreatures",
    type: "list",
    placeholder: "Rex_Character_BP_C",
    minWidth: 220,
  },
];
const LIMIT_COLUMNS: TableColumn<ArkSpawnLimit>[] = [
  {
    field: "creature",
    labelKey: "arkListsUi.spawnCreature",
    type: "text",
    placeholder: "Rex_Character_BP_C",
    minWidth: 200,
  },
  {
    field: "maxPercentage",
    labelKey: "arkListsUi.spawnMaxPercentage",
    type: "number",
  },
];

interface Props {
  container: ArkSpawnContainer;
  disabled: boolean;
  onChange: (container: ArkSpawnContainer) => void;
  onRemove: () => void;
}

// Un conteneur de spawns (zone de la carte) : ajouter, retirer ou remplacer
// des créatures, avec leurs poids et limites.
export default function SpawnContainerCard({
  container,
  disabled,
  onChange,
  onRemove,
}: Props) {
  const { t } = useTranslation();
  const remove = t("arkListsUi.removeContainer");
  const set = (patch: Partial<ArkSpawnContainer>) =>
    onChange({ ...container, ...patch });

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          useFlexGap
          sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "center" }}
        >
          <TextField
            select
            size="small"
            label={t("arkListsUi.spawnMode")}
            value={container.mode}
            disabled={disabled}
            onChange={(event) =>
              set({ mode: event.target.value as ArkSpawnMode })
            }
            sx={{ minWidth: 200 }}
          >
            {MODES.map((mode) => (
              <MenuItem key={mode} value={mode}>
                {t(`arkListsUi.spawnModes.${mode}`)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label={t("arkListsUi.spawnContainer")}
            placeholder="DinoSpawnEntriesBeach_C"
            value={container.container}
            disabled={disabled}
            onChange={(event) => set({ container: event.target.value })}
            sx={{ flex: "1 1 260px" }}
          />
          <Tooltip title={remove}>
            <span>
              <IconButton
                aria-label={remove}
                disabled={disabled}
                onClick={onRemove}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <EditableTable
          columns={ENTRY_COLUMNS}
          rows={container.entries}
          disabled={disabled}
          onChange={(entries) => set({ entries })}
          newRow={() => ({ name: "", weight: "1", creatures: [] })}
          addLabelKey="arkListsUi.addSpawnEntry"
        />
        <EditableTable
          columns={LIMIT_COLUMNS}
          rows={container.limits}
          disabled={disabled}
          onChange={(limits) => set({ limits })}
          newRow={() => ({ creature: "", maxPercentage: "" })}
          addLabelKey="arkListsUi.addSpawnLimit"
        />
      </Stack>
    </Paper>
  );
}
