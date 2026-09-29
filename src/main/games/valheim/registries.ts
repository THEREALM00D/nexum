import { app } from "electron/main";
import type { ModRegistry } from "../../../shared/types";

export const REGISTRIES: ModRegistry[] = ["thunderstore", "hexium"];

export const REGISTRY_API_BASE: Record<ModRegistry, string> = {
  thunderstore: "https://thunderstore.io",
  hexium: "https://hexium.gg",
};

export const REGISTRY_LABEL: Record<ModRegistry, string> = {
  thunderstore: "Thunderstore",
  hexium: "Hexium",
};

// Page publique d'un mod — pattern différent par registre : Hexium sert son
// front via un sous-domaine par jeu + /mods/<owner>/<name>, pas /c/<communauté>/p/
// comme Thunderstore (vérifié sur une page Hexium réelle, pas dans leur doc API).
export function modPageUrl(
  registry: ModRegistry,
  owner: string,
  name: string,
): string {
  return registry === "hexium"
    ? `https://valheim.hexium.gg/mods/${owner}/${name}`
    : `https://thunderstore.io/c/valheim/p/${owner}/${name}/`;
}

// User-Agent envoyé aux registres de mods (bonne pratique d'API publique).
export const USER_AGENT = `Nexum/${app.getVersion()}`;
