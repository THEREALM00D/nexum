import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../../context/NotificationContext";
import { useServer } from "../../../../../context/ServerContext";
import type {
  InstallBatch,
  ThunderstoreModInfo,
  ValheimMod,
  ModUpdate,
  ModRegistry,
} from "@shared/types";
import { REGISTRY_LABEL } from "../utils/modPageUrl";
import { useBackupBeforeUpdate } from "../../../../../hooks/useBackupBeforeUpdate";
import { errorMessage } from "../../../../../utils/appErrorMessage";

export function useValheimMods() {
  const { t, i18n } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const backupBeforeUpdate = useBackupBeforeUpdate();
  const locale = i18n.resolvedLanguage ?? "fr";

  // BepInEx ne scanne les plugins qu'au démarrage du process — un mod
  // activé/désactivé/supprimé pendant que le serveur tourne encore reste
  // chargé (ou absent) jusqu'au prochain redémarrage.
  const notifyRestartNeeded = useCallback(() => {
    if (state.status === "running") {
      notify(t("valheimMods.installed.restartRequired"), "info");
    }
  }, [notify, t, state.status]);

  const [bepInEx, setBepInEx] = useState<boolean | null>(null);
  const [installedMods, setInstalledMods] = useState<ValheimMod[]>([]);
  // Liste des mods installés pas encore lue (skeletons dans l'onglet)
  const [installedLoading, setInstalledLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [installingBepInEx, setInstallingBepInEx] = useState(false);
  // « Tout installer » (dépendances) : `handleInstallMod` remet `installing`
  // à faux après chaque mod, la page reste occupée jusqu'au dernier.
  const [installingDependencies, setInstallingDependencies] = useState(false);
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  // Dépendances manquantes après une installation
  const [pendingDeps, setPendingDeps] = useState<{
    modName: string;
    deps: ThunderstoreModInfo[];
  } | null>(null);

  // Mises à jour disponibles pour les mods installés
  const [updates, setUpdates] = useState<ModUpdate[]>([]);
  // Codes des mods installés dépréciés sur leur registre d'origine
  const [deprecatedCodes, setDeprecatedCodes] = useState<string[]>([]);

  // Entrées {code, registry} des mods installés via un registre (exclut les
  // mods manuels, qui n'ont pas de thunderstoreCode) — nécessaire pour
  // checkUpdates, qui doit savoir sur quel registre interroger chaque mod.
  const getInstalledEntries = (
    mods: ValheimMod[],
  ): { code: string; registry: ModRegistry }[] =>
    mods.flatMap((m) => {
      if (
        !m.thunderstoreCode ||
        (m.source !== "thunderstore" && m.source !== "hexium")
      )
        return [];
      return [{ code: m.thunderstoreCode, registry: m.source }];
    });

  const refreshUpdates = useCallback(
    async (mods: ValheimMod[]) => {
      const entries = getInstalledEntries(mods);
      if (entries.length === 0) {
        setUpdates([]);
        setDeprecatedCodes([]);
        return;
      }
      try {
        const found = await window.api.valheim.mods.checkUpdates(entries);
        setUpdates(found.updates);
        setDeprecatedCodes(found.deprecatedCodes);
      } catch (e) {
        notify(errorMessage(t, e), "error");
      }
    },
    [notify, t],
  );

  // Relit BepInEx et les mods installés (réinstallation après un import)
  const reloadInstalled = useCallback(async () => {
    window.api.valheim.mods
      .detectBepInEx()
      .then(setBepInEx)
      .catch(() => {});
    const fresh = await window.api.valheim.mods.list();
    setInstalledMods(fresh);
    refreshUpdates(fresh);
  }, [refreshUpdates]);

  // Chargement initial
  useEffect(() => {
    window.api.valheim.mods
      .detectBepInEx()
      .then(setBepInEx)
      .catch(() => setBepInEx(false));
    window.api.valheim.mods
      .list()
      .then((mods) => {
        setInstalledMods(mods);
        refreshUpdates(mods);
      })
      .catch(() => notify(t("valheimMods.installed.loadFailed"), "error"))
      .finally(() => setInstalledLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstallBepInEx = useCallback(async () => {
    setInstallingBepInEx(true);
    try {
      await window.api.valheim.mods.installBepInEx();
      const detected = await window.api.valheim.mods.detectBepInEx();
      setBepInEx(detected);
      notify(t("valheimMods.bepinex.success"), "success");
    } catch (e) {
      notify(errorMessage(t, e), "error");
    } finally {
      setInstallingBepInEx(false);
    }
  }, [notify, t]);

  // Vérifie les dépendances manquantes après une installation
  const checkDepsAfterInstall = useCallback(
    async (
      registry: ModRegistry,
      code: string,
      currentMods: ValheimMod[],
      modName: string,
    ) => {
      const parts = code.split("-");
      if (parts.length < 3) return;
      const name = parts[parts.length - 2];
      const namespace = parts.slice(0, parts.length - 2).join("-");
      const installedCodes = getInstalledEntries(currentMods).map(
        (e) => e.code,
      );
      try {
        const deps = await window.api.valheim.mods.getMissingDeps(
          registry,
          namespace,
          name,
          installedCodes,
        );
        if (deps.length > 0) setPendingDeps({ modName, deps });
      } catch (e) {
        notify(errorMessage(t, e), "warning");
      }
    },
    [notify, t],
  );

  const handleInstallMod = useCallback(
    async (registry: ModRegistry, code: string, batch?: InstallBatch) => {
      setInstalling(true);
      try {
        const mod = await window.api.valheim.mods.installMod(
          registry,
          code,
          undefined,
          batch,
        );
        setInstalledMods((prev) => {
          const next = [
            ...prev.filter(
              (m) =>
                m.thunderstoreCode !== code && m.installDir !== mod.installDir,
            ),
            mod,
          ];
          refreshUpdates(next);
          checkDepsAfterInstall(registry, code, next, mod.name);
          return next;
        });
        notify(
          t("valheimMods.thunderstore.success", {
            name: mod.name,
            registry: REGISTRY_LABEL[registry],
          }),
          "success",
        );
      } catch (e) {
        notify(errorMessage(t, e), "error");
      } finally {
        setInstalling(false);
      }
    },
    [notify, t, refreshUpdates, checkDepsAfterInstall],
  );

  // Mise à jour d'un mod : sauvegarde du monde d'abord (option du serveur).
  const handleUpdateMod = useCallback(
    async (registry: ModRegistry, code: string) => {
      setInstalling(true);
      const ok = await backupBeforeUpdate();
      setInstalling(false);
      if (ok) await handleInstallMod(registry, code);
    },
    [backupBeforeUpdate, handleInstallMod],
  );

  const handleInstallImportProfile = useCallback(
    async (base64Code: string) => {
      setInstalling(true);
      try {
        const { installed, errors } =
          await window.api.valheim.mods.importProfile(base64Code);
        const fresh = await window.api.valheim.mods.list();
        setInstalledMods(fresh);
        refreshUpdates(fresh);
        if (installed.length > 0)
          notify(
            t("valheimMods.thunderstore.profileSuccess", {
              count: installed.length,
            }),
            "success",
          );
        if (errors.length > 0)
          notify(
            t("valheimMods.thunderstore.profileErrors", {
              count: errors.length,
            }),
            "warning",
          );
      } catch (e) {
        notify(errorMessage(t, e), "error");
      } finally {
        setInstalling(false);
      }
    },
    [notify, t, refreshUpdates],
  );

  const handleImportProfileFile = useCallback(
    async (filePath: string) => {
      setInstalling(true);
      try {
        const { installed, errors } =
          await window.api.valheim.mods.importProfileFile(filePath);
        const fresh = await window.api.valheim.mods.list();
        setInstalledMods(fresh);
        refreshUpdates(fresh);
        if (installed.length > 0)
          notify(
            t("valheimMods.thunderstore.profileSuccess", {
              count: installed.length,
            }),
            "success",
          );
        if (errors.length > 0)
          notify(
            t("valheimMods.thunderstore.profileErrors", {
              count: errors.length,
            }),
            "warning",
          );
      } catch (e) {
        notify(errorMessage(t, e), "error");
      } finally {
        setInstalling(false);
      }
    },
    [notify, t, refreshUpdates],
  );

  const handleRemoveMod = useCallback(
    async (modId: number, name: string) => {
      if (!window.confirm(t("valheimMods.installed.removeConfirm", { name })))
        return;
      try {
        await window.api.valheim.mods.remove(modId);
        setInstalledMods((prev) => {
          const next = prev.filter((m) => m.modId !== modId);
          refreshUpdates(next);
          return next;
        });
        notifyRestartNeeded();
      } catch (e) {
        notify(errorMessage(t, e), "error");
      }
    },
    [notify, t, refreshUpdates, notifyRestartNeeded],
  );

  const handleToggleMod = useCallback(
    async (modId: number, enabled: boolean) => {
      try {
        await window.api.valheim.mods.toggle(modId, enabled);
        setInstalledMods((prev) =>
          prev.map((m) => (m.modId === modId ? { ...m, enabled } : m)),
        );
        notifyRestartNeeded();
      } catch (e) {
        notify(errorMessage(t, e), "error");
      }
    },
    [notify, notifyRestartNeeded, t],
  );

  const handleRefreshUpdates = useCallback(async () => {
    setCheckingUpdates(true);
    try {
      const entries = getInstalledEntries(installedMods);
      const { updates: found, deprecatedCodes: deprecated } =
        entries.length === 0
          ? { updates: [], deprecatedCodes: [] }
          : await window.api.valheim.mods.checkUpdates(entries);
      setUpdates(found);
      setDeprecatedCodes(deprecated);
      notify(
        found.length > 0
          ? t("valheimMods.updates.found", { count: found.length })
          : t("valheimMods.updates.none"),
        found.length > 0 ? "info" : "success",
      );
    } catch (e) {
      notify(errorMessage(t, e), "error");
    } finally {
      setCheckingUpdates(false);
    }
  }, [notify, t, installedMods]);

  const handleUpdateAll = useCallback(async () => {
    if (updates.length === 0) return;
    setInstalling(true);
    let successCount = 0;
    let errorCount = 0;
    try {
      // Une seule sauvegarde pour toute la série.
      if (!(await backupBeforeUpdate())) return;
      for (const [index, update] of updates.entries()) {
        try {
          await window.api.valheim.mods.installMod(
            update.registry,
            update.latestCode,
            undefined,
            { index: index + 1, total: updates.length },
          );
          successCount++;
        } catch {
          errorCount++;
        }
      }
      const fresh = await window.api.valheim.mods.list();
      setInstalledMods(fresh);
      refreshUpdates(fresh);
      if (successCount > 0)
        notify(
          t("valheimMods.thunderstore.profileSuccess", {
            count: successCount,
          }),
          "success",
        );
      if (errorCount > 0)
        notify(
          t("valheimMods.thunderstore.profileErrors", { count: errorCount }),
          "warning",
        );
    } finally {
      setInstalling(false);
    }
  }, [updates, notify, t, refreshUpdates, backupBeforeUpdate]);

  const handleInstallAllDeps = useCallback(async () => {
    if (!pendingDeps) return;
    const deps = pendingDeps.deps;
    setPendingDeps(null);
    setInstallingDependencies(true);
    try {
      for (const [index, dependency] of deps.entries()) {
        await handleInstallMod(
          dependency.registry,
          `${dependency.author}-${dependency.name}-${dependency.version}`,
          { index: index + 1, total: deps.length },
        );
      }
    } finally {
      setInstallingDependencies(false);
    }
  }, [pendingDeps, handleInstallMod]);

  return {
    bepInEx,
    installedMods,
    installedLoading,
    installing,
    installingBepInEx,
    installingDependencies,
    checkingUpdates,
    locale,
    pendingDeps,
    updates,
    deprecatedCodes,
    handleRemoveMod,
    handleToggleMod,
    handleInstallBepInEx,
    handleInstallMod,
    handleImportProfile: handleInstallImportProfile,
    handleImportProfileFile,
    handleRefreshUpdates,
    handleUpdateAll,
    handleUpdateMod,
    handleInstallAllDeps,
    handleDismissDeps: () => setPendingDeps(null),
    reloadInstalled,
  };
}
