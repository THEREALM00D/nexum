import type { ModpackShare, ValheimMod } from "../../../shared/types";
import { ModRegistryClient } from "./ModRegistryClient";
import { REGISTRY_API_BASE, USER_AGENT } from "./registries";
import { AppError } from "../../utils/appError";

const BEPINEX_PACK = "denikson-BepInExPack_Valheim";

interface ModRef {
  name: string; // "Auteur-Nom"
  major: number;
  minor: number;
  patch: number;
}

// "Auteur-Nom-1.2.3" → { name: "Auteur-Nom", major: 1, minor: 2, patch: 3 }
function parseCode(code: string): ModRef | null {
  const m = /^(.+)-(\d+)\.(\d+)\.(\d+)$/.exec(code);
  if (!m) return null;
  return { name: m[1], major: +m[2], minor: +m[3], patch: +m[4] };
}

/**
 * export.r2x : le YAML que r2modman et Gale écrivent et relisent (même format
 * que celui lu à l'import, `extractModRefsFromR2x`).
 */
export function buildR2x(profileName: string, mods: ModRef[]): string {
  const safeName = profileName.replace(/[\r\n"]/g, " ").trim() || "Nexum";
  const lines = [`profileName: "${safeName}"`, "mods:"];
  for (const m of mods) {
    lines.push(
      `  - name: ${m.name}`,
      "    version:",
      `      major: ${m.major}`,
      `      minor: ${m.minor}`,
      `      patch: ${m.patch}`,
      "    enabled: true",
    );
  }
  return lines.join("\n") + "\n";
}

async function zipR2x(r2x: string): Promise<Buffer> {
  // archiver est en ESM pur : import dynamique obligatoire (voir CLAUDE.md).
  const { ZipArchive } = await import("archiver");
  return new Promise((resolve, reject) => {
    const archive = new ZipArchive({ zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on("data", (c: Buffer) => chunks.push(c));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
    archive.append(r2x, { name: "export.r2x" });
    archive.finalize();
  });
}

/**
 * Partage le modpack du serveur : crée un code de profil r2modman/Gale à
 * partir des mods actifs, pour que les joueurs installent les mêmes mods.
 * Envoyé à Thunderstore (le service que r2modman et Gale interrogent par
 * défaut) via `legacyprofile/create`. Les mods installés à la main n'ont pas
 * de code de registre : ils sont ignorés et comptés.
 */
export async function shareModpack(
  mods: ValheimMod[],
  profileName: string,
): Promise<ModpackShare> {
  const active = mods.filter((m) => m.enabled);
  const refs: ModRef[] = [];
  let skippedManual = 0;
  for (const m of active) {
    const ref = m.thunderstoreCode ? parseCode(m.thunderstoreCode) : null;
    if (ref) refs.push(ref);
    else skippedManual++;
  }

  // BepInEx n'est pas dans la liste des mods (installé à part) mais les
  // joueurs en ont besoin : on ajoute sa dernière version.
  if (!refs.some((r) => r.name === BEPINEX_PACK)) {
    try {
      const pkg = await ModRegistryClient.getPackage(
        "thunderstore",
        "denikson",
        "BepInExPack_Valheim",
      );
      const ref = parseCode(
        `${BEPINEX_PACK}-${pkg.versions[0].version_number}`,
      );
      if (ref) refs.unshift(ref);
    } catch {
      // le client du joueur l'installera comme dépendance des autres mods
    }
  }

  if (refs.length === 0) throw new AppError("MODPACK_NO_MODS");

  const zip = await zipR2x(buildR2x(profileName, refs));
  const res = await fetch(
    `${REGISTRY_API_BASE.thunderstore}/api/experimental/legacyprofile/create/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "User-Agent": USER_AGENT,
      },
      body: `#r2modman\n${zip.toString("base64")}`,
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!res.ok)
    throw new AppError("HTTP_ERROR", {
      host: "thunderstore.io",
      status: res.status,
    });
  const { key } = (await res.json()) as { key?: string };
  if (!key) throw new AppError("MODPACK_NO_CODE");

  return {
    code: key,
    modCount: refs.length,
    skippedManual,
    includesHexium: active.some((m) => m.source === "hexium"),
  };
}
