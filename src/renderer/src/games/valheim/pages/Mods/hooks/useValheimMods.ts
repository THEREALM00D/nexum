import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../../context/NotificationContext";
import { useServer } from "../../../../../context/ServerContext";
import type {
  ThunderstoreModInfo,
  ValheimMod,
  ModUpdate,
  ModRegistry,
} from "@shared/types";
import { REGISTRY_LABEL } from "../utils/modPageUrl";

type BrowseTab = "trending" | "latest" | "updated";

export function useValheimMods() {
  const { t, i18n } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
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
  const [browseTab, setBrowseTab] = useState<BrowseTab>("trending");
  const [browseRegistry, setBrowseRegistry] =
    useState<ModRegistry>("thunderstore");
  const [browseMods, setBrowseMods] = useState<ThunderstoreModInfo[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installingBepInEx, setInstallingBepInEx] = useState(false);
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
        notify((e as Error).message, "error");
      }
    },
    [notify],
  );

  const loadBrowse = useCallback(
    async (registry: ModRegistry, tab: BrowseTab, searchQuery = "") => {
      setBrowseLoading(true);
      setBrowseError(false);
      try {
        let mods: ThunderstoreModInfo[];
        if (searchQuery.trim()) {
          mods = await window.api.valheim.mods.search(
            registry,
            searchQuery.trim(),
          );
        } else if (tab === "trending") {
          mods = await window.api.valheim.mods.getTrending(registry);
        } else if (tab === "latest") {
          mods = await window.api.valheim.mods.getLatestAdded(registry);
        } else {
          mods = await window.api.valheim.mods.getLatestUpdated(registry);
        }
        setBrowseMods(mods);
      } catch {
        setBrowseError(true);
        setBrowseMods([]);
      } finally {
        setBrowseLoading(false);
      }
    },
    [],
  );

  // Chargement initial
  useEffect(() => {
    loadBrowse("thunderstore", "trending");
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
      .catch(() => notify(t("valheimMods.installed.loadFailed"), "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = useCallback(
    (tab: BrowseTab) => {
      setBrowseTab(tab);
      loadBrowse(browseRegistry, tab);
    },
    [loadBrowse, browseRegistry],
  );

  const handleBrowseRegistryChange = useCallback(
    (registry: ModRegistry) => {
      setBrowseRegistry(registry);
      loadBrowse(registry, browseTab);
    },
    [loadBrowse, browseTab],
  );

  const handleSearch = useCallback(
    (query: string) => {
      loadBrowse(browseRegistry, browseTab, query);
    },
    [loadBrowse, browseRegistry, browseTab],
  );

  const handleInstallBepInEx = useCallback(async () => {
    setInstallingBepInEx(true);
    try {
      await window.api.valheim.mods.installBepInEx();
      const detected = await window.api.valheim.mods.detectBepInEx();
      setBepInEx(detected);
      notify(t("valheimMods.bepinex.success"), "success");
    } catch (e) {
      notify((e as Error).message, "error");
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
        notify((e as Error).message, "warning");
      }
    },
    [notify],
  );

  const handleInstallMod = useCallback(
    async (registry: ModRegistry, code: string) => {
      setInstalling(true);
      try {
        const mod = await window.api.valheim.mods.installMod(registry, code);
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
        notify((e as Error).message, "error");
      } finally {
        setInstalling(false);
      }
    },
    [notify, t, refreshUpdates, checkDepsAfterInstall],
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
        notify((e as Error).message, "error");
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
        notify((e as Error).message, "error");
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
        notify((e as Error).message, "error");
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
        notify((e as Error).message, "error");
      }
    },
    [notify, notifyRestartNeeded],
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
      notify((e as Error).message, "error");
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
      for (const update of updates) {
        try {
          await window.api.valheim.mods.installMod(
            update.registry,
            update.latestCode,
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
  }, [updates, notify, t, refreshUpdates]);

  const handleInstallAllDeps = useCallback(async () => {
    if (!pendingDeps) return;
    const deps = pendingDeps.deps;
    setPendingDeps(null);
    for (const dep of deps) {
      await handleInstallMod(
        dep.registry,
        `${dep.author}-${dep.name}-${dep.version}`,
      );
    }
  }, [pendingDeps, handleInstallMod]);

  return {
    bepInEx,
    installedMods,
    browseTab,
    browseRegistry,
    browseMods,
    browseLoading,
    browseError,
    installing,
    installingBepInEx,
    checkingUpdates,
    locale,
    pendingDeps,
    updates,
    deprecatedCodes,
    handleTabChange,
    handleBrowseRegistryChange,
    handleSearch,
    handleRemoveMod,
    handleToggleMod,
    handleInstallBepInEx,
    handleInstallMod,
    handleImportProfile: handleInstallImportProfile,
    handleImportProfileFile,
    handleRefreshUpdates,
    handleUpdateAll,
    handleInstallAllDeps,
    handleDismissDeps: () => setPendingDeps(null),
  };
}
