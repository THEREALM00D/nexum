import { backupBeforeWrite } from "../../../utils/ini";
import {
  readIniText,
  writeIniText,
  type IniFormat,
} from "../../../utils/iniText";
import { IniDocument } from "./iniDocument";

// En-tête et fins de ligne (CRLF) qu'écrit le serveur dans GameUserSettings.ini
// et Game.ini (vérifié), pour un fichier créé par Nexum.
const NEW_FILE_HEADER = ";METADATA=(Diff=true, UseCommands=true)\n";
const NEW_FORMAT: IniFormat = { encoding: "utf8", eol: "\r\n" };

export interface ArkIniFile {
  doc: IniDocument;
  format: IniFormat;
  exists: boolean;
}

/** Fichier lu (encodage et fins de ligne gardés), ou document vide s'il manque. */
export function readArkIni(path: string): ArkIniFile {
  const file = readIniText(path);
  if (!file) {
    return {
      doc: new IniDocument(NEW_FILE_HEADER),
      format: NEW_FORMAT,
      exists: false,
    };
  }
  return { doc: new IniDocument(file.text), format: file, exists: true };
}

/** Écrit le document, après une copie `.backup` du fichier existant. */
export function writeArkIni(path: string, file: ArkIniFile): void {
  backupBeforeWrite(path);
  writeIniText(path, file.doc.toText(), file.format);
}
