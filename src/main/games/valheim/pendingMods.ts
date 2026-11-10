import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import type { PendingMod, ValheimMod } from "../../../shared/types";
import type { ValheimModsManager } from "./ValheimModsManager";
import { installCodes } from "./installCodes";

// Mods d'un serveur importé depuis un autre PC (`src/main/transfer/`), à
// réinstaller par leur code une fois le jeu installé (bandeau de la page
// Mods). Fichier à côté de mods.json, dans {userData}/servers/<id>/.
const PENDING_FILE = "pending-mods.json";
const pendingPath = (dataDir: string) => join(dataDir, PENDING_FILE);

/** Mods qu'un autre PC peut réinstaller : ceux qui ont un code de registre. */
export function exportableMods(mods: ValheimMod[]): PendingMod[] {
  return mods.flatMap((m) =>
    m.thunderstoreCode && m.source && m.source !== "manual"
      ? [{ code: m.thunderstoreCode, registry: m.source, enabled: m.enabled }]
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
  onProgress: (msg: string) => void,
): Promise<{ installed: ValheimMod[]; errors: string[] }> {
  const pending = readPendingMods(dataDir);
  if (pending.length === 0) return { installed: [], errors: [] };
  if (!manager.detectBepInEx()) await manager.installBepInEx(onProgress);

  const result = await installCodes(manager, pending, onProgress);
  const installedCodes = new Set(
    result.installed.map((m) => m.thunderstoreCode),
  );
  for (const mod of result.installed) {
    const wanted = pending.find((p) => p.code === mod.thunderstoreCode);
    if (wanted && !wanted.enabled) manager.toggle(mod.modId, false);
  }
  writePendingMods(
    dataDir,
    pending.filter((p) => !installedCodes.has(p.code)),
  );
  return result;
}
