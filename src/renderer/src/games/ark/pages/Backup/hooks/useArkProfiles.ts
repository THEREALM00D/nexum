import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  ArkProfileBackupConfig,
  ArkProfilePlayer,
  ArkProfileVersion,
} from "@shared/types";
import { DEFAULT_ARK_PROFILE_BACKUP } from "@shared/arkProfiles";
import { useServer } from "../../../../../context/ServerContext";
import { useNotification } from "../../../../../context/NotificationContext";
import {
  appErrorMessage,
  errorMessage,
} from "../../../../../utils/appErrorMessage";

export interface RestoreRequest {
  player: ArkProfilePlayer;
  version: ArkProfileVersion;
}

/** Onglet Profils des joueurs : réglages, liste, sauvegarde et restauration. */
export function useArkProfiles() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const serverId = state.activeServerId;

  const [config, setConfig] = useState<ArkProfileBackupConfig>(
    DEFAULT_ARK_PROFILE_BACKUP,
  );
  const [players, setPlayers] = useState<ArkProfilePlayer[]>([]);
  // Premier chargement seulement (les rafraîchissements gardent l'affichage).
  const [loading, setLoading] = useState(true);
  // Réglages illisibles : édition bloquée, sinon les valeurs par défaut
  // affichées écrasaient les vraies au premier changement.
  const [configFailed, setConfigFailed] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Réglages et liste lus à part : une liste illisible (dossier de
  // sauvegarde injoignable) ne bloque pas les réglages.
  const refresh = async () => {
    if (!serverId) return;
    const [saved, list] = await Promise.allSettled([
      window.api.arkProfiles.getConfig(serverId),
      window.api.arkProfiles.list(serverId),
    ]);
    if (saved.status === "fulfilled") setConfig(saved.value);
    setConfigFailed(saved.status === "rejected");
    if (list.status === "fulfilled") setPlayers(list.value);
    const failure = [saved, list].find(
      (result) => result.status === "rejected",
    );
    if (failure?.status === "rejected")
      notify(
        errorMessage(
          t,
          failure.reason,
          t("arkBackup.profiles.notify.cannotLoad"),
        ),
      );
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, [serverId, state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeConfig = async (patch: Partial<ArkProfileBackupConfig>) => {
    if (!serverId) return;
    const previous = config;
    const next = { ...config, ...patch };
    setConfig(next);
    try {
      setConfig(await window.api.arkProfiles.setConfig(serverId, next));
    } catch (error) {
      // Pas enregistré : l'écran revient à ce qui l'est.
      setConfig(previous);
      notify(errorMessage(t, error, t("backup.notify.configFailed")));
    }
  };

  const backupNow = async () => {
    if (!serverId) return;
    setBackingUp(true);
    try {
      const result = await window.api.arkProfiles.backupNow(serverId);
      if (!result.success)
        notify(
          appErrorMessage(t, result.error, t("backup.notify.createFailed")),
        );
      else
        notify(
          result.saved
            ? t("arkBackup.profiles.notify.saved", { count: result.saved })
            : t("arkBackup.profiles.notify.unchanged"),
          "success",
        );
      await refresh();
    } catch (error) {
      notify(errorMessage(t, error, t("backup.notify.createFailed")));
    } finally {
      setBackingUp(false);
    }
  };

  /** Renvoie vrai si la restauration a réussi (le dialogue se ferme). */
  const restore = async ({ player, version }: RestoreRequest) => {
    if (!serverId) return false;
    setRestoring(true);
    try {
      const result = await window.api.arkProfiles.restore(
        serverId,
        player.eosId,
        version.id,
      );
      if (!result.success) {
        notify(
          appErrorMessage(t, result.error, t("backup.notify.restoreFailed")),
        );
        return false;
      }
      notify(
        t("arkBackup.profiles.notify.restored", {
          name: player.playerName ?? player.eosId,
        }),
        "success",
      );
      await refresh();
      return true;
    } catch (error) {
      notify(errorMessage(t, error, t("backup.notify.restoreFailed")));
      return false;
    } finally {
      setRestoring(false);
    }
  };

  return {
    config,
    players,
    loading,
    configFailed,
    backingUp,
    restoring,
    // Le jeu réécrirait le profil : restauration serveur arrêté seulement.
    canRestore: state.status === "stopped" || state.status === "crashed",
    hasServer: !!state.serverPath,
    changeConfig,
    backupNow,
    restore,
  };
}
