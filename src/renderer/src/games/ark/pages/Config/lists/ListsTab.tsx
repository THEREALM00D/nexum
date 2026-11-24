import { useState } from "react";
import {
  Alert,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useTranslation } from "react-i18next";
import type { ArkListName, ArkStackSize } from "@shared/types";
import LoadingSkeleton from "../../../../../components/common/LoadingSkeleton";
import { useGameLists } from "./hooks/useGameLists";
import EditableTable, { type TableColumn } from "./components/EditableTable";
import StatsEditor from "./components/StatsEditor";
import EngramsEditor from "./components/EngramsEditor";
import SpawnsEditor from "./components/SpawnsEditor";

const LISTS: ArkListName[] = ["stats", "stackSizes", "engrams", "spawns"];
const STACK_COLUMNS: TableColumn<ArkStackSize>[] = [
  {
    field: "itemClass",
    labelKey: "arkListsUi.itemClass",
    type: "text",
    placeholder: "PrimalItemResource_Stone_C",
    minWidth: 260,
  },
  { field: "quantity", labelKey: "arkListsUi.stackQuantity", type: "number" },
  {
    field: "ignoreMultiplier",
    labelKey: "arkListsUi.ignoreMultiplier",
    type: "bool",
  },
];

/**
 * Onglet Listes : listes de Game.ini éditées en tableaux, chacune
 * enregistrée à part. Les autres listes restent dans l'éditeur brut.
 */
export default function ListsTab() {
  const { t } = useTranslation();
  const lists = useGameLists();
  const [list, setList] = useState<ArkListName>("stats");
  const disabled = lists.locked || lists.saving;
  const dirty = lists.isDirty(list);

  return (
    <Stack spacing={2}>
      <Alert severity="info">{t("arkListsUi.notice")}</Alert>
      {lists.running && (
        <Alert severity="warning">{t("configPage.lockedWhileRunning")}</Alert>
      )}
      {lists.unreadable.length > 0 && (
        <Alert severity="warning">
          {t("arkListsUi.unreadable", { count: lists.unreadable.length })}
        </Alert>
      )}
      <Stack
        direction="row"
        useFlexGap
        sx={{ gap: 1.5, flexWrap: "wrap", alignItems: "center" }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={list}
          onChange={(_, next) => next && setList(next as ArkListName)}
        >
          {LISTS.map((name) => (
            <ToggleButton key={name} value={name}>
              {t(`arkListsUi.lists.${name}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Stack direction="row" sx={{ gap: 1, ml: "auto" }}>
          {dirty && (
            <Button onClick={() => lists.discard(list)} disabled={lists.saving}>
              {t("arkSettingsUi.discard")}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={disabled || !dirty}
            onClick={() => void lists.save(list)}
          >
            {t("arkSettingsUi.save")}
          </Button>
        </Stack>
      </Stack>
      <LoadingSkeleton loading={lists.loading} fullWidth>
        <Stack spacing={1.5}>
          {list === "stats" && (
            <StatsEditor
              stats={lists.draft.stats}
              disabled={disabled}
              onChange={(stats) => lists.change("stats", stats)}
            />
          )}
          {list === "stackSizes" && (
            <EditableTable
              columns={STACK_COLUMNS}
              rows={lists.draft.stackSizes}
              disabled={disabled}
              onChange={(rows) => lists.change("stackSizes", rows)}
              newRow={() => ({
                itemClass: "",
                quantity: "",
                ignoreMultiplier: false,
              })}
              addLabelKey="arkListsUi.addStack"
            />
          )}
          {list === "engrams" && (
            <EngramsEditor
              engrams={lists.draft.engrams}
              disabled={disabled}
              onChange={(engrams) => lists.change("engrams", engrams)}
            />
          )}
          {list === "spawns" && (
            <SpawnsEditor
              spawns={lists.draft.spawns}
              disabled={disabled}
              onChange={(spawns) => lists.change("spawns", spawns)}
            />
          )}
        </Stack>
      </LoadingSkeleton>
    </Stack>
  );
}
