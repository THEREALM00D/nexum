import { readFileSync } from "fs";

/** EOS ID (nom d'un `.arkprofile`) : 32 caractères hexadécimaux sur ASA. */
export const EOS_ID = /^[0-9a-f]{32}$/i;
/** ID de tribu (nom d'un `.arktribe`). */
const TRIBE_ID = /^\d{1,10}$/;

export interface ProfileInfo {
  playerName: string | null;
  characterName: string | null;
}

/** FString d'Unreal : int32 longueur (avec le 0 final), négative = UTF-16. */
function readFString(data: Buffer, offset: number): string | null {
  if (offset + 4 > data.length) return null;
  const length = data.readInt32LE(offset);
  const start = offset + 4;
  if (length === 0) return "";
  if (length > 0) {
    if (length > 1024 || start + length > data.length) return null;
    return data.toString("latin1", start, start + length - 1);
  }
  const bytes = -length * 2;
  if (bytes > 2048 || start + bytes > data.length) return null;
  return data.toString("utf16le", start, start + bytes - 2);
}

/** Écrit un FString ASCII comme dans le fichier (pour le chercher). */
function fstringBytes(text: string): Buffer {
  const length = Buffer.alloc(4);
  length.writeInt32LE(text.length + 1);
  return Buffer.concat([length, Buffer.from(`${text}\0`, "latin1")]);
}

const STR_PROPERTY = fstringBytes("StrProperty");

/**
 * Valeur d'une `StrProperty` (vérifié sur des profils ASA de 2024 à 2026) :
 * nom, type `StrProperty`, int32 0, int32 taille, 1 octet, puis la valeur.
 * null si la propriété manque ou ne suit pas ce format.
 */
function readStrProperty(data: Buffer, name: string): string | null {
  const nameBytes = fstringBytes(name);
  const index = data.indexOf(nameBytes);
  if (index < 0) return null;
  const typeOffset = index + nameBytes.length;
  const type = data.subarray(typeOffset, typeOffset + STR_PROPERTY.length);
  if (!type.equals(STR_PROPERTY)) return null;
  const value = readFString(data, typeOffset + STR_PROPERTY.length + 9);
  return value ? value : null;
}

/** Nom du joueur (`PlayerName`) et du survivant (`PlayerCharacterName`). */
export function readProfileInfo(path: string): ProfileInfo {
  try {
    const data = readFileSync(path);
    return {
      playerName: readStrProperty(data, "PlayerName"),
      characterName: readStrProperty(data, "PlayerCharacterName"),
    };
  } catch {
    return { playerName: null, characterName: null };
  }
}

/**
 * ID de la tribu d'un joueur, lu dans son `<EOS ID>.arktributetribe`
 * (24 octets, 5e entier : vérifié sur deux joueurs de la même tribu, dont
 * le `<ID>.arktribe` existait). null si absent ou illisible.
 */
export function readTribeId(path: string): string | null {
  try {
    const data = readFileSync(path);
    if (data.length < 20) return null;
    const tribeId = String(data.readUInt32LE(16));
    return TRIBE_ID.test(tribeId) && tribeId !== "0" ? tribeId : null;
  } catch {
    return null;
  }
}
