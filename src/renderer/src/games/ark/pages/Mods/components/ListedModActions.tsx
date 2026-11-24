import { IconButton, Switch, Tooltip } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";

interface Props {
  enabled: boolean;
  websiteUrl: string | null;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
}

// Actions d'un mod de la liste : activer, ordre de chargement, page
// CurseForge, retirer.
export default function ListedModActions({
  enabled,
  websiteUrl,
  isFirst,
  isLast,
  disabled,
  onToggle,
  onMove,
  onRemove,
}: Props) {
  const { t } = useTranslation();
  const moveUp = t("arkMods.list.moveUp");
  const moveDown = t("arkMods.list.moveDown");
  const open = t("arkMods.list.open");
  const remove = t("arkMods.list.remove");

  return (
    <>
      <Tooltip
        title={enabled ? t("arkMods.list.enabled") : t("arkMods.list.disabled")}
      >
        <Switch
          size="small"
          checked={enabled}
          disabled={disabled}
          onChange={(event) => onToggle(event.target.checked)}
          slotProps={{ input: { "aria-label": t("arkMods.list.toggle") } }}
        />
      </Tooltip>
      <Tooltip title={moveUp}>
        <span>
          <IconButton
            size="small"
            aria-label={moveUp}
            disabled={disabled || isFirst}
            onClick={() => onMove(-1)}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={moveDown}>
        <span>
          <IconButton
            size="small"
            aria-label={moveDown}
            disabled={disabled || isLast}
            onClick={() => onMove(1)}
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      {websiteUrl && (
        <Tooltip title={open}>
          <IconButton
            size="small"
            aria-label={open}
            onClick={() => void window.api.shell.openExternal(websiteUrl)}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={remove}>
        <span>
          <IconButton
            size="small"
            aria-label={remove}
            color="error"
            disabled={disabled}
            onClick={onRemove}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
}
