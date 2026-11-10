import type { ModRegistry, ValheimMod } from "../../../shared/types";
import type { ValheimModsManager } from "./ValheimModsManager";
import { REGISTRIES } from "./registries";

export interface CodeToInstall {
  code: string;
  /** Registre d'origine, essayé en premier ; absent = chaque registre. */
  registry?: ModRegistry;
}

// Installe une liste de codes de packages ("Auteur-Nom-Version") en série,
// en continuant sur erreur — partagé entre l'import de profil (code ou
// fichier) et la réinstallation des mods d'un serveur importé. Un profil
// r2modman/Gale peut mélanger Thunderstore et Hexium (voir
// resolveProfileCodeViaApi) : sans registre connu, on essaie chacun jusqu'à
// ce que l'un accepte le code ; avec, il passe en premier.
export async function installCodes(
  manager: ValheimModsManager,
  items: CodeToInstall[],
  onProgress: (msg: string) => void,
): Promise<{ installed: ValheimMod[]; errors: string[] }> {
  const installed: ValheimMod[] = [];
  const errors: string[] = [];
  for (const { code, registry } of items) {
    const order = registry
      ? [registry, ...REGISTRIES.filter((r) => r !== registry)]
      : REGISTRIES;
    let lastError: unknown;
    let mod: ValheimMod | null = null;
    for (const r of order) {
      try {
        mod = await manager.installMod(r, code, onProgress);
        break;
      } catch (e) {
        lastError = e;
      }
    }
    if (mod) {
      installed.push(mod);
    } else {
      const message = (lastError as Error)?.message ?? "?";
      errors.push(`${code}: ${message}`);
      onProgress(`⚠ ${code} — ${message}`);
    }
  }
  return { installed, errors };
}
