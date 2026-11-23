import { readFileSync } from "fs";
import { join } from "path";
import type { ArkModInfo } from "../../../../shared/types";

// Écrit par le serveur (module CFCore) à chaque démarrage : un mod y reste
// une fois téléchargé, même retiré de -mods= (vérifié). Il dit ce que le
// serveur a téléchargé, pas ce qu'il charge.
const LIBRARY_PATH = [
  "ShooterGame",
  "Binaries",
  "Win64",
  "ShooterGame",
  "ModsUserData",
  "83374",
  "library.json",
];

// Champs lus (le fichier en contient bien plus). Clés écrites par CFCore,
// d'où « iD » et « uRL ».
interface LibraryEntry {
  details?: {
    iD?: number;
    name?: string;
    summary?: string;
    links?: { websiteUrl?: string };
    logo?: { thumbnailUrl?: string };
    authors?: { name?: string }[];
    premiumDetails?: { isPremium?: boolean };
  };
  installedFile?: { displayName?: string; fileDate?: string };
}

/**
 * URL https seulement, sinon null : le lien part dans shell.openExternal et
 * le logo dans un <img>, or ces données viennent d'un fichier ou d'une API.
 */
export function httpsUrl(value: string | undefined): string | null {
  try {
    return value && new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

/** « 2026.11.03-08.59.25 » (UTC) → ISO, null si illisible. */
function libraryDate(value: string | undefined): string | null {
  const match = value?.match(
    /^(\d{4})\.(\d{2})\.(\d{2})-(\d{2})\.(\d{2})\.(\d{2})$/,
  );
  if (!match) return null;
  const [, year, month, day, hours, minutes, seconds] = match;
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

function toModInfo(entry: LibraryEntry): ArkModInfo | null {
  const details = entry.details;
  if (!details || !Number.isInteger(details.iD)) return null;
  return {
    id: details.iD as number,
    name: details.name ?? "",
    summary: details.summary ?? "",
    logoUrl: httpsUrl(details.logo?.thumbnailUrl),
    authors: (details.authors ?? [])
      .map((author) => author.name ?? "")
      .filter(Boolean),
    websiteUrl: httpsUrl(details.links?.websiteUrl),
    premium: details.premiumDetails?.isPremium === true,
    installedFile: entry.installedFile?.displayName ?? null,
    installedFileDate: libraryDate(entry.installedFile?.fileDate),
  };
}

/**
 * Mods téléchargés par le serveur, par ID. Fichier absent (serveur jamais
 * lancé avec des mods), illisible ou d'un format inattendu → vide.
 */
export function readModLibrary(serverPath: string): Map<number, ArkModInfo> {
  const mods = new Map<number, ArkModInfo>();
  try {
    const text = readFileSync(join(serverPath, ...LIBRARY_PATH), "utf8");
    const library = JSON.parse(text.replace(/^\uFEFF/, "")) as {
      installedMods?: LibraryEntry[];
    };
    for (const entry of library.installedMods ?? []) {
      const info = toModInfo(entry);
      if (info) mods.set(info.id, info);
    }
  } catch {
    // Pas encore de bibliothèque : la page affiche les ID seuls.
  }
  return mods;
}
