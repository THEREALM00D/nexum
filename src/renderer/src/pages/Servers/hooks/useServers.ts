import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Server } from "@shared/types";
import { useServer } from "../../../context/ServerContext";
import { useNotification } from "../../../context/NotificationContext";
import { serverService } from "../../../services/serverService";
import type { ServerFormValues } from "../components/ServerDialog";
import { getGamePlugin } from "../../../games/registry";
import { errorMessage } from "../../../utils/appErrorMessage";
import { appErrorMessage } from "../../../utils/appErrorMessage";

export function useServers() {
  const { t } = useTranslation();
  const { state, refreshServers, switchActive } = useServer();
  const { notify } = useNotification();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Server | null>(null);
  const [deletingServer, setDeletingServer] = useState<Server | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (server: Server) => {
    setEditing(server);
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  /** `importState` : état du panneau de reprise d'un dossier existant. */
  const handleSubmit = async (
    values: ServerFormValues,
    importState: unknown = null,
  ) => {
    try {
      if (editing) {
        await window.api.servers.update(editing.id, values);
        notify(t("servers.notify.updated", { name: values.name }), "success");
      } else {
        const created = await window.api.servers.create(values);
        notify(t("servers.notify.created", { name: created.name }), "success");
        await applyExistingServer(created, importState);
      }
      await refreshServers();
      setDialogOpen(false);
    } catch (e) {
      notify(errorMessage(t, e), "error");
    }
  };

  // Serveur déjà créé : une reprise ratée est signalée sans bloquer la
  // fermeture (un 2e clic créerait un doublon). Elle se refait depuis la
  // page du jeu.
  const applyExistingServer = async (created: Server, importState: unknown) => {
    try {
      await getGamePlugin(created.gameType)?.existingServer?.apply(
        created.id,
        importState,
      );
    } catch (error) {
      notify(errorMessage(t, error), "error");
    }
  };

  const openDeleteConfirm = (server: Server) => setDeletingServer(server);
  const closeDeleteConfirm = () => setDeletingServer(null);

  const confirmDelete = async () => {
    if (!deletingServer) return;
    try {
      await window.api.servers.delete(deletingServer.id);
      notify(t("servers.notify.deleted"), "success");
      await refreshServers();
    } catch (e) {
      notify(errorMessage(t, e), "error");
    } finally {
      setDeletingServer(null);
    }
  };

  const handleActivate = async (server: Server) => {
    try {
      await switchActive(server.id);
      notify(t("servers.notify.activated", { name: server.name }), "success");
    } catch (e) {
      notify(errorMessage(t, e), "error");
    }
  };

  const handleServerAction = async (
    action: "start" | "stop" | "restart",
    server: Server,
  ) => {
    try {
      const res = await serverService[action](server.id);
      if (!res.success) {
        const key =
          action === "stop"
            ? "servers.notify.stopFailed"
            : action === "restart"
              ? "servers.notify.restartFailed"
              : "servers.notify.startFailed";
        notify(t(key, { error: appErrorMessage(t, res.error, "?") }), "error");
      }
    } catch (e) {
      notify(errorMessage(t, e), "error");
    }
  };

  return {
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
  };
}
