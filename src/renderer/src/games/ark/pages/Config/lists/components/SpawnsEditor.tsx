import { Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import type {
  ArkNpcReplacement,
  ArkSpawnLists,
  ArkSpawnWeight,
} from "@shared/types";
import SectionTitle from "../../../../../../components/common/SectionTitle";
import EditableTable, { type TableColumn } from "./EditableTable";
import SpawnContainerCard from "./SpawnContainerCard";

const WEIGHT_COLUMNS: TableColumn<ArkSpawnWeight>[] = [
  {
    field: "tag",
    labelKey: "arkListsUi.spawnTag",
    type: "text",
    placeholder: "Bronto",
    minWidth: 160,
  },
  { field: "weight", labelKey: "arkListsUi.spawnWeight", type: "number" },
  {
    field: "overrideLimit",
    labelKey: "arkListsUi.spawnOverrideLimit",
    type: "optionalBool",
  },
  { field: "limit", labelKey: "arkListsUi.spawnLimit", type: "number" },
];
const REPLACEMENT_COLUMNS: TableColumn<ArkNpcReplacement>[] = [
  {
    field: "from",
    labelKey: "arkListsUi.replaceFrom",
    type: "text",
    placeholder: "MegaRaptor_Character_BP_C",
    minWidth: 220,
  },
  {
    field: "to",
    labelKey: "arkListsUi.replaceTo",
    type: "text",
    placeholder: "Dodo_Character_BP_C",
    minWidth: 220,
  },
];

interface Props {
  spawns: ArkSpawnLists;
  disabled: boolean;
  onChange: (spawns: ArkSpawnLists) => void;
}

// Spawns : conteneurs (zones), multiplicateurs de poids par créature et
// remplacements d'une créature par une autre.
export default function SpawnsEditor({ spawns, disabled, onChange }: Props) {
  const { t } = useTranslation();
  const set = (patch: Partial<ArkSpawnLists>) =>
    onChange({ ...spawns, ...patch });

  return (
    <Stack spacing={2}>
      <SectionTitle>{t("arkListsUi.spawnContainers")}</SectionTitle>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("arkListsUi.spawnContainersHint")}
      </Typography>
      {spawns.containers.map((container, index) => (
        <SpawnContainerCard
          key={index}
          container={container}
          disabled={disabled}
          onChange={(next) =>
            set({
              containers: spawns.containers.map((current, position) =>
                position === index ? next : current,
              ),
            })
          }
          onRemove={() =>
            set({
              containers: spawns.containers.filter(
                (_, position) => position !== index,
              ),
            })
          }
        />
      ))}
      <Button
        size="small"
        startIcon={<AddIcon />}
        disabled={disabled}
        sx={{ alignSelf: "flex-start" }}
        onClick={() =>
          set({
            containers: [
              ...spawns.containers,
              { mode: "add", container: "", entries: [], limits: [] },
            ],
          })
        }
      >
        {t("arkListsUi.addContainer")}
      </Button>
      <SectionTitle>{t("arkListsUi.spawnWeights")}</SectionTitle>
      <EditableTable
        columns={WEIGHT_COLUMNS}
        rows={spawns.weights}
        disabled={disabled}
        onChange={(weights) => set({ weights })}
        newRow={() => ({
          tag: "",
          weight: "1",
          overrideLimit: null,
          limit: "",
        })}
        addLabelKey="arkListsUi.addWeight"
      />
      <SectionTitle>{t("arkListsUi.replacements")}</SectionTitle>
      <EditableTable
        columns={REPLACEMENT_COLUMNS}
        rows={spawns.replacements}
        disabled={disabled}
        onChange={(replacements) => set({ replacements })}
        newRow={() => ({ from: "", to: "" })}
        addLabelKey="arkListsUi.addReplacement"
      />
    </Stack>
  );
}
