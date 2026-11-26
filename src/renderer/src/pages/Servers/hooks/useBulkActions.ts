import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BulkAction, BulkRun, OnlinePlayers } from "@shared/types";
import { useServer } from "../../../context/ServerContext";
import { useNotification } from "../../../context/NotificationContext";
import { useNavigate } from "../../../context/NavigationContext";
import { errorMessage } from "../../../utils/appErrorMessage";

/** Actions qui arrêtent des serveurs lancés : confirmation si des joueurs sont là. */
const STOPPING_ACTIONS: BulkAction[] = [
  "stopAll",
  "restartRunning",
  "stopUpdateRestartAll",
];

export interface BulkConfirmation {
  action: BulkAction;
  players: OnlinePlayers[];
}

/**
 * Actions sur tous les serveurs : l'action tourne dans le main (elle continue
 * fenêtre fermée ou page quittée), la page lit son état au montage puis suit
 * `servers:bulk:changed`.
 */
export function useBulkActions() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state, switchActive } = useServer();
  const navigate = useNavigate();
  const [run, setRun] = useState<BulkRun | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<BulkConfirmation | null>(
    null,
  );

  useEffect(() => {
    window.api.bulk
      .get()
      .then(setRun)
      .catch(() => setRun(null));
    return window.api.bulk.onChange(setRun);
  }, []);

  const statuses = Object.values(state.statuses);
  const counts = {
    down: statuses.filter(
      (status) => status === "stopped" || status === "crashed",
    ).length,
    running: statuses.filter((status) => status === "running").length,
  };
  const busy = run !== null && !run.finished;

  const launch = async (action: BulkAction, warnPlayers: boolean) => {
    setConfirmation(null);
    try {
      setRun(await window.api.bulk.run(action, warnPlayers));
      setDialogOpen(true);
    } catch (error) {
      notify(errorMessage(t, error), "error");
    }
  };

  /**
   * Personne de connu en ligne : pas de confirmation ni d'annonce (un
   * serveur qui sait prévenir ses joueurs sait aussi les compter).
   */
  const request = async (action: BulkAction) => {
    if (!STOPPING_ACTIONS.includes(action)) return launch(action, false);
    try {
      const players = await window.api.bulk.onlinePlayers();
      if (players.some((entry) => (entry.count ?? 0) > 0))
        return setConfirmation({ action, players });
    } catch {
      // Joueurs illisibles : on demande quand même confirmation.
      return setConfirmation({ action, players: [] });
    }
    return launch(action, false);
  };

  /** Bilan vu : l'action terminée est oubliée (main compris). */
  const dismiss = () => {
    window.api.bulk.dismiss().catch(() => {});
    setRun(null);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    if (run?.finished) dismiss();
  };

  const stopAfterCurrent = () => {
    window.api.bulk
      .stopAfterCurrent()
      .catch((error) => notify(errorMessage(t, error), "error"));
  };

  /** « Voir les logs » d'un serveur en échec : il devient le serveur actif. */
  const viewLogs = async (serverId: string) => {
    try {
      await switchActive(serverId);
      setDialogOpen(false);
      navigate("logs");
    } catch (error) {
      notify(errorMessage(t, error), "error");
    }
  };

  return {
    run,
    busy,
    counts,
    dialogOpen,
    openDialog: () => setDialogOpen(true),
    closeDialog,
    dismiss,
    confirmation,
    cancelConfirmation: () => setConfirmation(null),
    request,
    launch,
    stopAfterCurrent,
    viewLogs,
  };
}
