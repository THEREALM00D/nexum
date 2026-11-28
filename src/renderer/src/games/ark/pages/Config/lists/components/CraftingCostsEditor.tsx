import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import type { ArkCraftingCost } from "@shared/types";
import CraftingCostCard from "./CraftingCostCard";

interface Props {
  costs: ArkCraftingCost[];
  disabled: boolean;
  onChange: (costs: ArkCraftingCost[]) => void;
}

// Coûts de fabrication (ConfigOverrideItemCraftingCosts) : une carte par
// objet. Un objet sans ressource n'est pas écrit (le main l'écarte : il
// deviendrait gratuit).
export default function CraftingCostsEditor({
  costs,
  disabled,
  onChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("arkListsUi.craftingHint")}
      </Typography>
      {costs.length === 0 && (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            border: 1,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("arkListsUi.craftingEmpty")}
          </Typography>
        </Box>
      )}
      {costs.map((cost, index) => (
        <CraftingCostCard
          key={index}
          cost={cost}
          disabled={disabled}
          onChange={(next) =>
            onChange(
              costs.map((current, position) =>
                position === index ? next : current,
              ),
            )
          }
          onRemove={() =>
            onChange(costs.filter((_, position) => position !== index))
          }
        />
      ))}
      <Button
        size="small"
        startIcon={<AddIcon />}
        disabled={disabled}
        sx={{ alignSelf: "flex-start" }}
        onClick={() =>
          onChange([
            ...costs,
            {
              item: "",
              resources: [{ resource: "", quantity: "1", exact: false }],
            },
          ])
        }
      >
        {t("arkListsUi.addCraftingItem")}
      </Button>
    </Stack>
  );
}
