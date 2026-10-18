import { closeSync, openSync, readSync } from "fs";

// En-tête d'un .sav Dragonwilds (format propre au jeu, relevé sur la build
// 1.0.1.1) : « SAVE » + taille, puis un bloc « CINF » = nombre de clés, les
// clés (FString), autant d'offsets (int32), la taille du bloc de valeurs et
// le bloc lui-même. Clés d'un monde : VERSION, GUID_A…D, WorldName,
// WorldMapName, SessionPasswd, WorldOwnerId… Une sauvegarde de personnage
// n'a pas de WorldName.
const HEADER_BYTES = 8192;

function readHead(path: string): Buffer | null {
  let fd: number | null = null;
  try {
    fd = openSync(path, "r");
    const buf = Buffer.alloc(HEADER_BYTES);
    return buf.subarray(0, readSync(fd, buf, 0, buf.length, 0));
  } catch {
    return null;
  } finally {
    if (fd !== null) closeSync(fd);
  }
}

/**
 * Nom du monde inscrit dans la sauvegarde, null si ce n'est pas une
 * sauvegarde de monde. ⚠️ C'est CE nom que le serveur cherche
 * (DefaultWorldName), pas le nom du fichier : « Loading configured world
 * [NexumTestWorld] from save slot [MonMondeSolo] » (vérifié).
 */
export function readWorldName(path: string): string | null {
  const buf = readHead(path);
  if (!buf || buf.subarray(0, 4).toString("latin1") !== "SAVE") return null;
  const cinf = buf.indexOf("CINF");
  if (cinf === -1) return null;
  let p = cinf + 8;
  const i32 = () => {
    const v = buf.readInt32LE(p);
    p += 4;
    return v;
  };
  // FString d'Unreal : longueur > 0 → octets (avec \0 final), < 0 → UTF-16.
  const fstring = () => {
    const len = i32();
    if (len === 0) return "";
    const bytes = len > 0 ? len : -len * 2;
    const s =
      len > 0
        ? buf.toString("latin1", p, p + len - 1)
        : buf.toString("utf16le", p, p + bytes - 2);
    p += bytes;
    return s;
  };
  try {
    const count = i32();
    if (count <= 0 || count > 256) return null;
    const keys = Array.from({ length: count }, fstring);
    const offsets = Array.from({ length: i32() }, i32);
    i32(); // taille du bloc de valeurs
    const index = keys.indexOf("WorldName");
    if (index === -1 || offsets[index] === undefined) return null;
    p += offsets[index];
    return fstring() || null;
  } catch {
    return null; // en-tête tronqué ou format inattendu
  }
}
