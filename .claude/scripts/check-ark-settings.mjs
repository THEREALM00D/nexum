#!/usr/bin/env node
// Vérifie le catalogue des réglages ARK (src/shared/arkSettings) contre une
// install du serveur, après une mise à jour d'ASA :
//   node .claude/scripts/check-ark-settings.mjs <dossier du serveur ARK>
// 1. clés du catalogue absentes de ArkAscendedServer.exe : réglage retiré ou
//    renommé (à vérifier : quelques noms ne sont que dans les .pak, voir
//    src/main/games/ark/CLAUDE.md) ;
// 2. clés écrites par le serveur dans GameUserSettings.ini [ServerSettings]
//    et Game.ini que le catalogue ne connaît pas : réglage ajouté.
// Lecture seule : ne modifie rien.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const serverPath = process.argv[2];
if (!serverPath) {
  console.error(
    "Usage : node .claude/scripts/check-ark-settings.mjs <dossier du serveur ARK>",
  );
  process.exit(1);
}

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const catalogDir = join(repo, "src", "shared", "arkSettings");
const ROW = /\[\s*"([A-Za-z_]\w*)",\s*"(?:bool|int|float|string|flag|enum)"/g;

// Clés connues ailleurs que dans le catalogue (onglet Général, listes).
const OTHER_KNOWN = readFileSync(
  join(repo, "src", "main", "games", "ark", "config", "listKeys.ts"),
  "utf8",
)
  .match(/"([A-Za-z_]\w*)"/g)
  .map((quoted) => quoted.slice(1, -1));

const catalog = new Map();
for (const file of ["gus.ts", "game.ts", "cli.ts"]) {
  const text = readFileSync(join(catalogDir, file), "utf8");
  for (const match of text.matchAll(ROW))
    catalog.set(match[1].toLowerCase(), match[1]);
}
console.log(`Catalogue : ${catalog.size} réglages.`);

const exePath = join(
  serverPath,
  "ShooterGame",
  "Binaries",
  "Win64",
  "ArkAscendedServer.exe",
);
if (existsSync(exePath)) {
  const exe = readFileSync(exePath);
  const ascii = exe.toString("latin1").toLowerCase();
  const utf16 = exe.toString("utf16le").toLowerCase();
  const missing = [...catalog.values()].filter((key) => {
    const needle = key.toLowerCase();
    return !ascii.includes(needle) && !utf16.includes(needle);
  });
  console.log(
    `\nAbsentes de l'exe (retirées ou renommées ?) : ${missing.join(", ") || "aucune"}`,
  );
} else {
  console.log(`\nExe introuvable : ${exePath}`);
}

const configDir = join(
  serverPath,
  "ShooterGame",
  "Saved",
  "Config",
  "WindowsServer",
);
const known = new Set([
  ...catalog.keys(),
  ...OTHER_KNOWN.map((key) => key.toLowerCase()),
]);
for (const [file, section] of [
  ["GameUserSettings.ini", "serversettings"],
  ["Game.ini", "/script/shootergame.shootergamemode"],
]) {
  const path = join(configDir, file);
  if (!existsSync(path)) continue;
  let current = "";
  const unknown = new Set();
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const header = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (header) {
      current = header[1].trim().toLowerCase();
      continue;
    }
    const entry = line.match(/^\s*([A-Za-z_]\w*)(?:\[\d+\])?\s*=/);
    if (current === section && entry && !known.has(entry[1].toLowerCase())) {
      unknown.add(entry[1]);
    }
  }
  console.log(
    `\n${file} : clés inconnues du catalogue : ${[...unknown].join(", ") || "aucune"}`,
  );
}
