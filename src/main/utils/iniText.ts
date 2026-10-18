import { existsSync, readFileSync, writeFileSync } from "fs";

export type IniEncoding = "utf8" | "utf8bom" | "utf16le";

export interface IniFormat {
  encoding: IniEncoding;
  eol: "\r\n" | "\n";
}

export interface IniText extends IniFormat {
  text: string;
}

const SECTION_RE = /^\s*\[([^\]]+)\]\s*$/;

/**
 * Lit un .ini en détectant son encodage : Unreal Engine enregistre ses
 * fichiers de config en ASCII, mais en UTF-16LE avec BOM dès qu'une valeur
 * contient un caractère non ASCII. Renvoie null si le fichier n'existe pas.
 */
export function readIniText(path: string): IniText | null {
  if (!existsSync(path)) return null;
  const buf = readFileSync(path);
  let encoding: IniEncoding = "utf8";
  let text: string;
  if (buf[0] === 0xff && buf[1] === 0xfe) {
    encoding = "utf16le";
    text = buf.subarray(2).toString("utf16le");
  } else if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    encoding = "utf8bom";
    text = buf.subarray(3).toString("utf8");
  } else {
    text = buf.toString("utf8");
  }
  return { text, encoding, eol: text.includes("\r\n") ? "\r\n" : "\n" };
}

/** Écrit `text` (lignes séparées par "\n") avec l'encodage et les fins de ligne voulus. */
export function writeIniText(
  path: string,
  text: string,
  format: IniFormat,
): void {
  const body = text.replace(/\r?\n/g, format.eol);
  if (format.encoding === "utf16le") {
    writeFileSync(
      path,
      Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(body, "utf16le")]),
    );
  } else if (format.encoding === "utf8bom") {
    writeFileSync(path, "﻿" + body, "utf-8");
  } else {
    writeFileSync(path, body, "utf-8");
  }
}

/**
 * Valeurs BRUTES (chaînes, sans conversion) des clés de `section`. Une
 * conversion en nombre perdrait des données : `AdminPassword=0123` → 123.
 */
export function readIniSection(
  text: string,
  section: string,
): Record<string, string> {
  const values: Record<string, string> = {};
  let inSection = false;
  for (const line of text.split(/\r?\n/)) {
    const header = line.match(SECTION_RE);
    if (header) {
      inSection = header[1].trim() === section;
      continue;
    }
    if (!inSection) continue;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(";")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    values[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return values;
}

/**
 * Met à jour les clés de `pairs` dans `section` en préservant tout le reste
 * du fichier (autres sections, clés inconnues, commentaires). Les clés
 * absentes sont ajoutées en fin de section, la section en fin de fichier si
 * elle n'existe pas. Renvoie le texte avec des fins de ligne "\n".
 */
export function patchIniSection(
  original: string,
  section: string,
  pairs: Record<string, string>,
): string {
  const lines = original.length > 0 ? original.split(/\r?\n/) : [];
  const remaining = new Set(Object.keys(pairs));
  const flushRemaining = (out: string[]): void => {
    for (const key of remaining) out.push(`${key}=${pairs[key]}`);
    remaining.clear();
  };

  const result: string[] = [];
  let inTarget = false;
  let found = false;

  for (const line of lines) {
    const header = line.match(SECTION_RE);
    if (header) {
      if (inTarget) flushRemaining(result);
      inTarget = header[1].trim() === section;
      if (inTarget) found = true;
      result.push(line);
      continue;
    }
    if (inTarget) {
      const trimmed = line.trim();
      const eqIdx = trimmed.indexOf("=");
      const key = eqIdx === -1 ? "" : trimmed.slice(0, eqIdx).trim();
      if (key && remaining.has(key)) {
        result.push(`${key}=${pairs[key]}`);
        remaining.delete(key);
        continue;
      }
    }
    result.push(line);
  }

  if (inTarget) flushRemaining(result);

  if (!found) {
    if (result.length > 0 && result[result.length - 1].trim() !== "") {
      result.push("");
    }
    result.push(`[${section}]`);
    flushRemaining(result);
  }

  return result.join("\n").replace(/\n*$/, "\n");
}
