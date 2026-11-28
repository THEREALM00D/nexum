import {
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import type { ArkModState } from "@shared/types";

const STATES: ArkModState[] = ["active", "passive", "disabled"];

interface Props {
  modState: ArkModState;
  websiteUrl: string | null;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onStateChange: (modState: ArkModState) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
}

// Actions d'un mod de la liste : état (actif, passif, désactivé), ordre de
// chargement, page CurseForge, retirer.
export default function ListedModActions({
  modState,
  websiteUrl,
  isFirst,
  isLast,
  disabled,
  onStateChange,
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
      <ToggleButtonGroup
        exclusive
        size="small"
        value={modState}
        disabled={disabled}
        // Un clic sur l'état déjà choisi renvoie null : rien à changer.
        onChange={(_, value: ArkModState | null) =>
          value && value !== modState && onStateChange(value)
        }
        aria-label={t("arkMods.list.state")}
        sx={{ mr: 0.5 }}
      >
        {STATES.map((value) => (
          <Tooltip
            key={value}
            title={t(`arkMods.list.stateHelp.${value}`)}
            describeChild
          >
            <ToggleButton
              value={value}
              // Actif en vert, comme les autres états « en marche » de l'app.
              color={value === "active" ? "primary" : "standard"}
              sx={{
                typography: "micro",
                textTransform: "none",
                px: 1,
                py: 0.25,
              }}
            >
              {t(`arkMods.list.states.${value}`)}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
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
