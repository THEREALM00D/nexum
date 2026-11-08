import { Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useTranslation } from "react-i18next";
import { useServers } from "./hooks/useServers";
import ServersTable from "./components/ServersTable";
import ServerDialog from "./components/ServerDialog";
import ConfirmDeleteDialog from "./components/ConfirmDeleteDialog";
import PageHeader from "../../components/common/PageHeader";

export default function Servers({ onOpenSetup }: { onOpenSetup: () => void }) {
  const { t } = useTranslation();
  const {
    state,
    dialogOpen,
    editing,
    deletingServer,
    openAdd,
    openEdit,
    closeDialog,
    handleSubmit,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    handleActivate,
    handleServerAction,
  } = useServers();

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t("servers.title")}
        subtitle={t("servers.subtitle")}
        actions={
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexShrink: 0,
              "& .MuiButton-root": { whiteSpace: "nowrap" },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<AutoFixHighIcon />}
              onClick={onOpenSetup}
            >
              {t("servers.setupWizard")}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAdd}
            >
              {t("servers.addServer")}
            </Button>
          </Stack>
        }
      />

      <ServersTable
        servers={state.servers}
        statuses={state.statuses}
        activeServerId={state.activeServerId}
        onActivate={handleActivate}
        onStart={(srv) => handleServerAction("start", srv)}
        onStop={(srv) => handleServerAction("stop", srv)}
        onRestart={(srv) => handleServerAction("restart", srv)}
        onEdit={openEdit}
        onDelete={openDeleteConfirm}
      />

      <ServerDialog
        open={dialogOpen}
        initial={editing}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        server={deletingServer}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
}
