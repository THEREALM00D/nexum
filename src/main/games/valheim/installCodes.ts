import type {
  ModInstallProgress,
  ModRegistry,
  ValheimMod,
} from "../../../shared/types";
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
  onProgress: (progress: ModInstallProgress) => void,
): Promise<{ installed: ValheimMod[]; errors: string[] }> {
  const installed: ValheimMod[] = [];
  const errors: string[] = [];
  for (const [index, { code, registry }] of items.entries()) {
    const batch = { index: index + 1, total: items.length };
    const order = registry
      ? [registry, ...REGISTRIES.filter((other) => other !== registry)]
      : REGISTRIES;
    let lastError: unknown;
    let mod: ValheimMod | null = null;
    for (const candidateRegistry of order) {
      try {
        mod = await manager.installMod(candidateRegistry, code, (progress) =>
          onProgress({ ...progress, batch }),
        );
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (mod) {
      installed.push(mod);
    } else {
      const message = (lastError as Error)?.message ?? "?";
      errors.push(`${code}: ${message}`);
    }
  }
  return { installed, errors };
}
