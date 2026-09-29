import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Server } from "@shared/types";
import { useServer } from "../../../context/ServerContext";
import { useNotification } from "../../../context/NotificationContext";
import { serverService } from "../../../services/serverService";
import type { ServerFormValues } from "../components/ServerDialog";

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

  // À l'import d'un serveur Valheim déjà installé, pas de fichier de config
  // à lire (tout passe par les args CLI) — mais s'il n'existe qu'un seul
  // monde déjà sur disque, on peut au moins deviner son nom sans que
  // l'utilisateur ait à retaper exactement le même. Si plusieurs mondes sont
  // trouvés, on laisse le choix se faire via l'Autocomplete de la page Config.
  const importValheimWorld = async (server: Server) => {
    try {
      const worlds = await window.api.valheim.listExistingWorlds("");
      if (worlds.length === 1) {
        await window.api.valheim.setConfig(
          { world: worlds[0].name },
          server.id,
        );
      }
    } catch {
      // best-effort — l'utilisateur peut toujours choisir manuellement
    }
  };

  const handleSubmit = async (values: ServerFormValues) => {
    try {
      if (editing) {
        await window.api.servers.update(editing.id, values);
        notify(t("servers.notify.updated", { name: values.name }), "success");
      } else {
        const created = await window.api.servers.create(values);
        notify(t("servers.notify.created", { name: created.name }), "success");
        if (created.gameType === "valheim") await importValheimWorld(created);
      }
      await refreshServers();
      setDialogOpen(false);
    } catch (e) {
      notify((e as Error).message, "error");
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
      notify((e as Error).message, "error");
    } finally {
      setDeletingServer(null);
    }
  };

  const handleActivate = async (server: Server) => {
    try {
      await switchActive(server.id);
      notify(t("servers.notify.activated", { name: server.name }), "success");
    } catch (e) {
      notify((e as Error).message, "error");
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
        notify(t(key, { error: res.error ?? "?" }), "error");
      }
    } catch (e) {
      notify((e as Error).message, "error");
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
