import { IconButton, Paper, Stack, TextField, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import type { ArkCraftingCost, ArkCraftingResource } from "@shared/types";
import { FONT_MONO } from "../../../../../../theme";
import EditableTable, { type TableColumn } from "./EditableTable";

const RESOURCE_COLUMNS: TableColumn<ArkCraftingResource>[] = [
  {
    field: "resource",
    labelKey: "arkListsUi.craftingResource",
    type: "text",
    placeholder: "PrimalItemResource_MetalIngot_C",
    minWidth: 260,
  },
  {
    field: "quantity",
    labelKey: "arkListsUi.craftingQuantity",
    type: "number",
  },
  { field: "exact", labelKey: "arkListsUi.craftingExact", type: "bool" },
];

interface Props {
  cost: ArkCraftingCost;
  disabled: boolean;
  onChange: (cost: ArkCraftingCost) => void;
  onRemove: () => void;
}

// Un objet et les ressources qui remplacent son coût de fabrication.
export default function CraftingCostCard({
  cost,
  disabled,
  onChange,
  onRemove,
}: Props) {
  const { t } = useTranslation();
  const remove = t("arkListsUi.removeCraftingItem");
  const set = (patch: Partial<ArkCraftingCost>) =>
    onChange({ ...cost, ...patch });

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          useFlexGap
          sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "center" }}
        >
          <TextField
            size="small"
            label={t("arkListsUi.craftingItem")}
            placeholder="PrimalItemArmor_MetalHelmet_C"
            value={cost.item}
            disabled={disabled}
            onChange={(event) => set({ item: event.target.value })}
            sx={{ flex: "1 1 260px" }}
            slotProps={{ htmlInput: { style: { fontFamily: FONT_MONO } } }}
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
          columns={RESOURCE_COLUMNS}
          rows={cost.resources}
          disabled={disabled}
          onChange={(resources) => set({ resources })}
          newRow={() => ({ resource: "", quantity: "1", exact: false })}
          addLabelKey="arkListsUi.addCraftingResource"
        />
      </Stack>
    </Paper>
  );
}
