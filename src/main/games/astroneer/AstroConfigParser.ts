import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import type { AstroneerSettings } from "../../../shared/types";
import { parseIniValue, backupBeforeWrite } from "../../utils/ini";

const ENGINE_REL_PATH = "Astro/Saved/Config/WindowsServer/Engine.ini";
const SETTINGS_REL_PATH =
  "Astro/Saved/Config/WindowsServer/AstroServerSettings.ini";

const ENGINE_SECTION = "URL";
const SETTINGS_SECTION = "/Script/Astro.AstroServerSettings";

// Astroneer répartit sa config sur 2 fichiers INI standards (contrairement au
// format Palworld OptionSettings=(k=v,...) sur une seule ligne). Port vit
// dans Engine.ini, tout le reste dans AstroServerSettings.ini.
const ENGINE_KEYS = new Set(["Port"]);

const INTEGER_FIELDS = new Set([
  "Port",
  "MaxPlayerCount",
  "PlayerActivityTimeout",
  "AutoSaveGameInterval",
  "BackupSaveGamesInterval",
  "MaxServerFramerate",
  "MaxServerIdleFramerate",
  "ConsolePort",
]);

/**
 * Valeurs par défaut sourcées de la doc communautaire (blog.astroneer.space +
 * documentation tierce). ConsolePort/ConsolePassword sont exposés en édition
 * mais sans usage applicatif (pas de client RCON dans Nexum) — ne
 * jamais ouvrir ce port au firewall (avertissement officiel Astroneer).
 */
export const DEFAULT_SETTINGS: AstroneerSettings = {
  Port: 8777,
  ServerName: "Astroneer Dedicated Server",
  ServerAdvertisedName: "",
  ServerPassword: "",
  PublicIP: "",
  MaxPlayerCount: 8,
  OwnerName: "",
  OwnerGuid: "",
  PlayerActivityTimeout: 0,
  DenyUnlistedPlayers: false,
  ActiveSaveFileDescriptiveName: "SAVE_1",
  AutoSaveGameInterval: 900,
  BackupSaveGamesInterval: 7200,
  MaxServerFramerate: 30,
  MaxServerIdleFramerate: 3,
  bDisableServerTravel: false,
  VerbosePlayerProperties: false,
  ConsolePort: 1234,
  ConsolePassword: "",
};

export class AstroConfigParser {
  read(serverPath: string): AstroneerSettings {
    const settings = { ...DEFAULT_SETTINGS };
    this.readIniInto(join(serverPath, ENGINE_REL_PATH), settings, ENGINE_KEYS);
    const settingsKeys = new Set(
      Object.keys(DEFAULT_SETTINGS).filter((k) => !ENGINE_KEYS.has(k)),
    );
    this.readIniInto(
      join(serverPath, SETTINGS_REL_PATH),
      settings,
      settingsKeys,
    );
    return settings;
  }

  write(
    serverPath: string,
    settings: AstroneerSettings,
  ): { success: boolean; error?: string } {
    try {
      const enginePairs: AstroneerSettings = {};
      const settingsPairs: AstroneerSettings = {};
      for (const [key, val] of Object.entries(settings)) {
        if (ENGINE_KEYS.has(key)) enginePairs[key] = val;
        else settingsPairs[key] = val;
      }
      this.writeIni(
        join(serverPath, ENGINE_REL_PATH),
        ENGINE_SECTION,
        enginePairs,
      );
      this.writeIni(
        join(serverPath, SETTINGS_REL_PATH),
        SETTINGS_SECTION,
        settingsPairs,
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  private readIniInto(
    iniPath: string,
    target: AstroneerSettings,
    keys: Set<string>,
  ): void {
    if (!existsSync(iniPath)) return;
    const content = readFileSync(iniPath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("[") || trimmed.startsWith(";"))
        continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      if (!keys.has(key)) continue;
      target[key] = parseIniValue(trimmed.slice(eqIdx + 1).trim());
    }
  }

  /**
   * Met à jour uniquement les clés connues de `pairs` dans la section visée,
   * en préservant tout le reste du fichier (autres sections, clés non
   * suivies par l'app, commentaires) — Engine.ini/AstroServerSettings.ini
   * sont des .ini Unreal Engine génériques qui peuvent contenir bien plus
   * que ce que Nexum édite.
   */
  private writeIni(
    iniPath: string,
    section: string,
    pairs: AstroneerSettings,
  ): void {
    const exists = existsSync(iniPath);
    backupBeforeWrite(iniPath);

    const original = exists ? readFileSync(iniPath, "utf-8") : "";
    const lines = original.length > 0 ? original.split(/\r?\n/) : [];
    const sectionHeaderRe = /^\s*\[([^\]]+)\]\s*$/;

    const remainingKeys = new Set(Object.keys(pairs));
    const flushRemaining = (result: string[]): void => {
      for (const key of remainingKeys) {
        result.push(`${key}=${this.serializeValue(key, pairs[key])}`);
      }
      remainingKeys.clear();
    };

    const result: string[] = [];
    let inTargetSection = false;
    let sectionFound = false;

    for (const line of lines) {
      const headerMatch = line.match(sectionHeaderRe);
      if (headerMatch) {
        if (inTargetSection) flushRemaining(result);
        inTargetSection = headerMatch[1].trim() === section;
        if (inTargetSection) sectionFound = true;
        result.push(line);
        continue;
      }

      if (inTargetSection) {
        const trimmed = line.trim();
        const eqIdx = trimmed.indexOf("=");
        const key = eqIdx === -1 ? "" : trimmed.slice(0, eqIdx).trim();
        if (key && remainingKeys.has(key)) {
          result.push(`${key}=${this.serializeValue(key, pairs[key])}`);
          remainingKeys.delete(key);
          continue;
        }
      }
      result.push(line);
    }

    if (inTargetSection) flushRemaining(result);

    if (!sectionFound) {
      if (result.length > 0 && result[result.length - 1].trim() !== "") {
        result.push("");
      }
      result.push(`[${section}]`);
      flushRemaining(result);
    }

    writeFileSync(iniPath, result.join("\n").replace(/\n*$/, "\n"), "utf-8");
  }

  private serializeValue(key: string, val: string | number | boolean): string {
    if (typeof val === "boolean") return val ? "True" : "False";
    if (typeof val === "number")
      return INTEGER_FIELDS.has(key) ? String(Math.round(val)) : String(val);
    return val;
  }
}
