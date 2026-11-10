import { Alert, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useTranslation } from "react-i18next";
import { useServers } from "./hooks/useServers";
import ServersTable from "./components/ServersTable";
import ServersEmptyState from "./components/ServersEmptyState";
import ServerDialog from "./components/ServerDialog";
import ConfirmDeleteDialog from "./components/ConfirmDeleteDialog";
import PageHeader from "../../components/common/PageHeader";
import ExportDialog from "../../components/transfer/ExportDialog";
import ImportServerDialog from "./components/ImportServerDialog";
import { useServerTransfer } from "./hooks/useServerTransfer";

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
  const transfer = useServerTransfer();

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t("servers.title")}
        subtitle={t("servers.subtitle")}
        actions={
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              flexWrap: "wrap",
              justifyContent: "flex-end",
              "& .MuiButton-root": { whiteSpace: "nowrap" },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={transfer.pickFile}
            >
              {t("servers.transfer.importButton")}
            </Button>
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

      {state.servers.length === 0 ? (
        <ServersEmptyState onOpenSetup={onOpenSetup} onImport={openAdd} />
      ) : (
        <ServersTable
          servers={state.servers}
          statuses={state.statuses}
          activeServerId={state.activeServerId}
          onActivate={handleActivate}
          onStart={(srv) => handleServerAction("start", srv)}
          onStop={(srv) => handleServerAction("stop", srv)}
          onRestart={(srv) => handleServerAction("restart", srv)}
          onEdit={openEdit}
          onExport={transfer.openExport}
          onDelete={openDeleteConfirm}
        />
      )}

      <ServerDialog
        open={dialogOpen}
        initial={editing}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      <ExportDialog
        open={!!transfer.exporting}
        title={t("servers.transfer.exportTitle", {
          name: transfer.exporting?.name ?? "",
        })}
        description={t("servers.transfer.exportDescription")}
        extra={
          <Alert severity="info">
            {t("servers.transfer.gameFilesWarning")}
          </Alert>
        }
        onClose={transfer.closeExport}
        onExport={transfer.runExport}
      />
      <ImportServerDialog
        preview={transfer.preview}
        onCancel={transfer.cancelImport}
        onImport={transfer.runImport}
      />

      <ConfirmDeleteDialog
        server={deletingServer}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
}
