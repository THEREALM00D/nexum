import {
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type {
  ArkEngramAutoUnlock,
  ArkEngramLists,
  ArkEngramOverride,
} from "@shared/types";
import SectionTitle from "../../../../../../components/common/SectionTitle";
import EditableTable, { type TableColumn } from "./EditableTable";

const OVERRIDE_COLUMNS: TableColumn<ArkEngramOverride>[] = [
  {
    field: "engramClass",
    labelKey: "arkListsUi.engramClass",
    type: "text",
    placeholder: "EngramEntry_Campfire_C",
    minWidth: 220,
  },
  {
    field: "hidden",
    labelKey: "arkListsUi.engramHidden",
    type: "optionalBool",
  },
  { field: "pointsCost", labelKey: "arkListsUi.engramCost", type: "number" },
  {
    field: "levelRequirement",
    labelKey: "arkListsUi.engramLevel",
    type: "number",
  },
  {
    field: "removePrereq",
    labelKey: "arkListsUi.engramNoPrereq",
    type: "optionalBool",
  },
];
const AUTO_UNLOCK_COLUMNS: TableColumn<ArkEngramAutoUnlock>[] = [
  {
    field: "engramClass",
    labelKey: "arkListsUi.engramClass",
    type: "text",
    placeholder: "EngramEntry_TekTeleporter_C",
    minWidth: 220,
  },
  { field: "level", labelKey: "arkListsUi.engramUnlockLevel", type: "number" },
];

interface Props {
  engrams: ArkEngramLists;
  disabled: boolean;
  onChange: (engrams: ArkEngramLists) => void;
}

// Engrammes : modifications par classe, déblocages automatiques, points
// d'engramme par niveau (un nombre par ligne, à partir du niveau 1).
export default function EngramsEditor({ engrams, disabled, onChange }: Props) {
  const { t } = useTranslation();
  const set = (patch: Partial<ArkEngramLists>) =>
    onChange({ ...engrams, ...patch });

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={engrams.onlyAllowSpecified}
            disabled={disabled}
            onChange={(event) =>
              set({ onlyAllowSpecified: event.target.checked })
            }
          />
        }
        label={t("arkListsUi.onlyAllowSpecified")}
      />
      <SectionTitle>{t("arkListsUi.engramOverrides")}</SectionTitle>
      <EditableTable
        columns={OVERRIDE_COLUMNS}
        rows={engrams.overrides}
        disabled={disabled}
        onChange={(overrides) => set({ overrides })}
        newRow={() => ({
          engramClass: "",
          hidden: null,
          pointsCost: "",
          levelRequirement: "",
          removePrereq: null,
        })}
        addLabelKey="arkListsUi.addEngram"
      />
      <SectionTitle>{t("arkListsUi.engramAutoUnlocks")}</SectionTitle>
      <EditableTable
        columns={AUTO_UNLOCK_COLUMNS}
        rows={engrams.autoUnlocks}
        disabled={disabled}
        onChange={(autoUnlocks) => set({ autoUnlocks })}
        newRow={() => ({ engramClass: "", level: "0" })}
        addLabelKey="arkListsUi.addAutoUnlock"
      />
      <SectionTitle>{t("arkListsUi.levelPoints")}</SectionTitle>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("arkListsUi.levelPointsHint", { count: engrams.levelPoints.length })}
      </Typography>
      <TextField
        multiline
        minRows={4}
        maxRows={12}
        value={engrams.levelPoints.join("\n")}
        disabled={disabled}
        onChange={(event) =>
          set({
            levelPoints: event.target.value
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(
                (line, index, lines) => line !== "" || index < lines.length - 1,
              ),
          })
        }
        slotProps={{ htmlInput: { "aria-label": t("arkListsUi.levelPoints") } }}
      />
    </Stack>
  );
}
