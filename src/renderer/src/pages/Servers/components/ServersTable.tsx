import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Server, ServerStatus } from "@shared/types";
import ServerRow from "./ServerRow";
import type { ServerActionHandlers } from "./ServerRowActions";

interface Props extends ServerActionHandlers {
  servers: Server[];
  statuses: Record<string, ServerStatus>;
  activeServerId: string | null;
  onActivate: (server: Server) => void;
}

export default function ServersTable({
  servers,
  statuses,
  activeServerId,
  onActivate,
  ...actions
}: Props) {
  const { t } = useTranslation();

  return (
    <Paper sx={{ overflow: "hidden" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("servers.columns.name")}</TableCell>
              <TableCell>{t("servers.columns.status")}</TableCell>
              <TableCell>{t("servers.columns.game")}</TableCell>
              <TableCell>{t("servers.columns.path")}</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {servers.map((srv) => (
              <ServerRow
                key={srv.id}
                server={srv}
                status={statuses[srv.id] ?? "stopped"}
                isActive={srv.id === activeServerId}
                onActivate={onActivate}
                {...actions}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
