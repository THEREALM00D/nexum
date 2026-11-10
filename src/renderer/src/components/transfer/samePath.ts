import type { Server } from "@shared/types";

// Chemins Windows : insensibles à la casse, `/` ≡ `\`, sans séparateur final.
const normalize = (p: string) =>
  p
    .trim()
    .replace(/[\\/]+/g, "\\")
    .replace(/\\$/, "")
    .toLowerCase();

/** Un serveur de Nexum utilise déjà ce dossier ? */
export const isUsedPath = (servers: Server[], path: string): boolean =>
  !!path.trim() && servers.some((s) => normalize(s.path) === normalize(path));
