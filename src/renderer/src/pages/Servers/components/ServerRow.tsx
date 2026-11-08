import {
  ButtonBase,
  Chip,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Server, ServerStatus } from "@shared/types";
import ServerTile from "../../../components/common/ServerTile";
import StatusDot from "../../../components/common/StatusDot";
import { FOCUS_RING_SX, FONT_MONO, NEXUM } from "../../../theme";
import ServerRowActions, {
  type ServerActionHandlers,
} from "./ServerRowActions";

interface Props extends ServerActionHandlers {
  server: Server;
  status: ServerStatus;
  isActive: boolean;
  onActivate: (server: Server) => void;
}

export default function ServerRow({
  server,
  status,
  isActive,
  onActivate,
  ...actions
}: Props) {
  const { t } = useTranslation();

  return (
    <TableRow
      hover
      selected={isActive}
      onClick={() => !isActive && onActivate(server)}
      sx={{
        cursor: isActive ? "default" : "pointer",
        ...(isActive && {
          "& > td:first-of-type": {
            boxShadow: `inset 3px 0 0 ${NEXUM.signal}`,
          },
        }),
      }}
    >
      <TableCell>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          {/* Pas d'onClick : le clic remonte à la ligne (une seule activation).
              Bouton pour que le clavier puisse activer le serveur. */}
          <ButtonBase
            disabled={isActive}
            aria-label={
              isActive
                ? undefined
                : `${t("servers.actions.activate")} ${server.name}`
            }
            sx={{ gap: 1, borderRadius: 1, ...FOCUS_RING_SX }}
          >
            <ServerTile name={server.name} color={server.color} />
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: isActive ? 600 : 400 }}
            >
              {server.name}
            </Typography>
          </ButtonBase>
          {isActive && (
            <Chip
              label={t("servers.active")}
              size="small"
              color="success"
              variant="outlined"
              sx={{ typography: "micro", height: 20 }}
            />
          )}
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <StatusDot status={status} />
          <Typography variant="caption" sx={{ whiteSpace: "nowrap" }}>
            {t(`servers.status.${status}`)}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="caption">
          {t(`servers.games.${server.gameType}`)}
        </Typography>
      </TableCell>
      {/* Chemin tronqué (complet au survol) : un long chemin élargissait le
          tableau au-delà de la fenêtre. */}
      <TableCell sx={{ maxWidth: 280 }}>
        <Tooltip title={server.path}>
          <Typography
            variant="caption"
            noWrap
            component="div"
            sx={{ fontFamily: FONT_MONO, color: "text.secondary" }}
          >
            {server.path}
          </Typography>
        </Tooltip>
      </TableCell>
      {/* Propagation arrêtée : une action ne doit pas activer le serveur. Vaut
          aussi pour le menu : un portail React remonte ses clics à ses parents. */}
      <TableCell
        align="right"
        onClick={(e) => e.stopPropagation()}
        sx={{ whiteSpace: "nowrap", cursor: "default" }}
      >
        <ServerRowActions server={server} status={status} {...actions} />
      </TableCell>
    </TableRow>
  );
}
