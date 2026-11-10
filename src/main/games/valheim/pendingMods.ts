import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import type { PendingMod, ValheimMod } from "../../../shared/types";
import type { ValheimModsManager } from "./ValheimModsManager";
import { installCodes } from "./installCodes";
import { REGISTRIES } from "./registries";

// Mods d'un serveur importé depuis un autre PC (`src/main/transfer/`), à
// réinstaller par leur code une fois le jeu installé (bandeau de la page
// Mods). Fichier à côté de mods.json, dans {userData}/servers/<id>/.
const PENDING_FILE = "pending-mods.json";
const pendingPath = (dataDir: string) => join(dataDir, PENDING_FILE);

/** Mods qu'un autre PC peut réinstaller : ceux qui ont un code de registre. */
export function exportableMods(mods: ValheimMod[]): PendingMod[] {
  return mods.flatMap((mod) =>
    mod.thunderstoreCode && mod.source && mod.source !== "manual"
      ? [
          {
            code: mod.thunderstoreCode,
            registry: mod.source,
            enabled: mod.enabled,
          },
        ]
      : [],
  );
}

/** Mods lus dans le manifest d'un ZIP importé (fichier venu d'ailleurs : revalidé). */
export function parsePendingMods(raw: unknown): PendingMod[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((mod) =>
    typeof mod?.code === "string" && REGISTRIES.includes(mod?.registry)
      ? [
          {
            code: mod.code,
            registry: mod.registry,
            enabled: mod.enabled !== false,
          },
        ]
      : [],
  );
}

export function readPendingMods(dataDir: string): PendingMod[] {
  try {
    const raw = JSON.parse(readFileSync(pendingPath(dataDir), "utf-8"));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function writePendingMods(dataDir: string, mods: PendingMod[]): void {
  if (mods.length === 0) {
    if (existsSync(pendingPath(dataDir))) rmSync(pendingPath(dataDir));
    return;
  }
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(pendingPath(dataDir), JSON.stringify(mods, null, 2), "utf-8");
}

/**
 * BepInEx si absent, puis chaque mod depuis son registre d'origine (repli
 * sur les autres). Un mod désactivé sur l'ancien PC est remis désactivé.
 * Les échecs restent en attente (nouvel essai ou « Ignorer »).
 */
export async function installPendingMods(
  manager: ValheimModsManager,
  dataDir: string,
  onProgress: (message: string) => void,
): Promise<{ installed: ValheimMod[]; errors: string[] }> {
  const pending = readPendingMods(dataDir);
  if (pending.length === 0) return { installed: [], errors: [] };
  if (!manager.detectBepInEx()) await manager.installBepInEx(onProgress);

  const result = await installCodes(manager, pending, onProgress);
  const installedCodes = new Set(
    result.installed.map((mod) => mod.thunderstoreCode),
  );
  for (const mod of result.installed) {
    const wanted = pending.find(
      (pendingMod) => pendingMod.code === mod.thunderstoreCode,
    );
    if (wanted && !wanted.enabled) manager.toggle(mod.modId, false);
  }
  writePendingMods(
    dataDir,
    pending.filter((pendingMod) => !installedCodes.has(pendingMod.code)),
  );
  return result;
}
