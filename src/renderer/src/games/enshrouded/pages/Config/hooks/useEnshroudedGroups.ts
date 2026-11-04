import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { EnshroudedUserGroup } from "@shared/types";
import { useNotification } from "../../../../../context/NotificationContext";
import { useConfigLoad } from "../../../../../components/config/useConfigLoad";
import { appErrorMessage } from "../../../../../utils/appErrorMessage";
import { enshroudedConfigService } from "../../../services/configService";

const SAVE_FLASH_MS = 2000;
const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Mot de passe aléatoire (sans caractères ambigus : 0/O, 1/l/I). */
export function randomPassword(length = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(
    bytes,
    (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length],
  ).join("");
}

// Nouveau groupe : droits d'un invité (monde ouvert, rien dans les bases).
const newGroup = (): EnshroudedUserGroup => ({
  name: "",
  password: randomPassword(),
  canKickBan: false,
  canAccessInventories: false,
  canEditWorld: true,
  canEditBase: false,
  canExtendBase: false,
  reservedSlots: 0,
});

/**
 * Groupes d'utilisateurs, avec leur propre bouton Enregistrer (comme les
 * listes d'admins de Valheim). Même verrou que la config : le serveur
 * réécrit son JSON à chaque démarrage.
 */
export function useEnshroudedGroups() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [groups, setGroups] = useState<EnshroudedUserGroup[]>([]);
  const [saved, setSaved] = useState(false);
  const { loading, locked, markDirty, markClean } = useConfigLoad(
    enshroudedConfigService.readGroups,
    setGroups,
    true,
  );

  const edit = (
    next: (prev: EnshroudedUserGroup[]) => EnshroudedUserGroup[],
  ) => {
    markDirty();
    setGroups(next);
  };

  const update = (index: number, patch: Partial<EnshroudedUserGroup>) =>
    edit((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  const add = () => edit((prev) => [...prev, newGroup()]);
  const remove = (index: number) =>
    edit((prev) => prev.filter((_, i) => i !== index));

  const save = async () => {
    try {
      const res = await enshroudedConfigService.writeGroups(groups);
      if (!res.success) {
        notify(
          appErrorMessage(t, res.error, t("config.unknownError")),
          "error",
        );
        return;
      }
      markClean();
      setSaved(true);
      setTimeout(() => setSaved(false), SAVE_FLASH_MS);
    } catch (e) {
      notify(appErrorMessage(t, (e as Error).message), "error");
    }
  };

  return { groups, loading, locked, saved, update, add, remove, save };
}
