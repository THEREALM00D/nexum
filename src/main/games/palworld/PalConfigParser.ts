import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { parseIniValue, backupBeforeWrite } from "../../utils/ini";

export type PalSettings = Record<string, string | number | boolean>;

// Enum fields: Palworld expects unquoted identifiers, not quoted strings.
const UNQUOTED_FIELDS = new Set([
  "Difficulty",
  "DeathPenalty",
  "RandomizerType",
  "LogFormatType",
]);

// Integer fields: serialized without decimal places.
const INTEGER_FIELDS = new Set([
  "DropItemMaxNum",
  "DropItemMaxNum_UNKO",
  "BaseCampMaxNum",
  "BaseCampMaxNumInGuild",
  "BaseCampWorkerMaxNum",
  "GuildPlayerMaxNum",
  "CoopPlayerMaxNum",
  "ServerPlayerMaxNum",
  "MaxBuildingLimitNum",
  "SupplyDropSpan",
  "ChatPostLimitPerMinute",
  "RCONPort",
  "RESTAPIPort",
  "PublicPort",
  "GuildRejoinCooldownMinutes",
  "AdditionalDropItemNumWhenPlayerKillingInPvPMode",
]);

export const CONFIG_REL_PATH =
  "Pal/Saved/Config/WindowsServer/PalWorldSettings.ini";

/**
 * Default values sourced from https://docs.palworldgame.com/settings-and-operation/configuration/
 * Field order matches the official PalWorldSettings.ini format.
 */
export const DEFAULT_SETTINGS: PalSettings = {
  // Difficulty / randomizer
  Difficulty: "None",
  RandomizerType: "None",
  RandomizerSeed: "",
  bIsRandomizerPalLevelRandom: false,

  // Time speed
  DayTimeSpeedRate: 1.0,
  NightTimeSpeedRate: 1.0,

  // XP & capture
  ExpRate: 1.0,
  PalCaptureRate: 1.0,
  PalSpawnNumRate: 1.0,

  // Damage rates
  PalDamageRateAttack: 1.0,
  PalDamageRateDefense: 1.0,
  PlayerDamageRateAttack: 1.0,
  PlayerDamageRateDefense: 1.0,

  // Player survival
  PlayerStomachDecreaceRate: 1.0,
  PlayerStaminaDecreaceRate: 1.0,
  PlayerAutoHPRegeneRate: 1.0,
  PlayerAutoHpRegeneRateInSleep: 1.0,

  // Pal survival
  PalStomachDecreaceRate: 1.0,
  PalStaminaDecreaceRate: 1.0,
  PalAutoHPRegeneRate: 1.0,
  PalAutoHpRegeneRateInSleep: 1.0,

  // Buildings
  BuildObjectHpRate: 1.0,
  BuildObjectDamageRate: 1.0,
  BuildObjectDeteriorationDamageRate: 1.0,

  // Collection
  CollectionDropRate: 1.0,
  CollectionObjectHpRate: 1.0,
  CollectionObjectRespawnSpeedRate: 1.0,
  EnemyDropItemRate: 1.0,

  // Death / combat
  DeathPenalty: "All",
  bEnablePlayerToPlayerDamage: false,
  bEnableFriendlyFire: false,
  bEnableInvaderEnemy: true,
  EnablePredatorBossPal: true,
  bActiveUNKO: false,
  bEnableAimAssistPad: true,
  bEnableAimAssistKeyboard: false,

  // Items / drops
  DropItemMaxNum: 3000,
  DropItemMaxNum_UNKO: 100,
  BaseCampMaxNum: 128,
  BaseCampMaxNumInGuild: 4,
  BaseCampWorkerMaxNum: 15,
  DropItemAliveMaxHours: 1.0,

  // Guild
  bAutoResetGuildNoOnlinePlayers: false,
  AutoResetGuildTimeNoOnlinePlayers: 72.0,
  GuildPlayerMaxNum: 20,

  // Pal / work
  PalEggDefaultHatchingTime: 72.0,
  WorkSpeedRate: 1.0,
  AutoSaveSpan: 10.0,

  // Platform / logging
  CrossplayPlatforms: "(Steam,Xbox,PS5,Mac)",
  LogFormatType: "Text",

  // Gameplay features
  bIsMultiplay: false,
  bIsPvP: false,
  bHardcore: false,
  bPalLost: false,
  bCharacterRecreateInHardcore: false,
  bCanPickupOtherGuildDeathPenaltyDrop: false,
  bEnableNonLoginPenalty: true,
  bEnableFastTravel: true,
  bIsStartLocationSelectByMap: true,
  bExistPlayerAfterLogout: false,
  bEnableDefenseOtherGuildPlayer: false,
  bInvisibleOtherGuildBaseCampAreaFX: false,
  bBuildAreaLimit: false,
  ItemWeightRate: 1.0,
  bShowPlayerList: false,

  // Server identity
  CoopPlayerMaxNum: 4,
  ServerPlayerMaxNum: 32,
  ServerName: "Default Palworld Server",
  ServerDescription: "",
  AdminPassword: "",
  ServerPassword: "",
  PublicPort: 8211,
  PublicIP: "",
  RCONEnabled: false,
  RCONPort: 25575,
  RESTAPIEnabled: false,
  RESTAPIPort: 8212,
  bIsUseBackupSaveData: true,
  Region: "",
  bUseAuth: true,
  BanListURL: "https://api.palworldgame.com/api/banlist.txt",

  // Misc
  SupplyDropSpan: 180,
  ChatPostLimitPerMinute: 10,
  MaxBuildingLimitNum: 0,
  ServerReplicatePawnCullDistance: 15000.0,
  bAllowGlobalPalboxExport: false,
  bAllowGlobalPalboxImport: false,
  EquipmentDurabilityDamageRate: 1.0,
  ItemContainerForceMarkDirtyInterval: 1.0,
  ItemCorruptionMultiplier: 1.0,
  bEnableFastTravelOnlyBaseCamp: false,
  bAllowClientMod: false,
  bIsShowJoinLeftMessage: false,
  DenyTechnologyList: "()",

  // Respawn penalties
  GuildRejoinCooldownMinutes: 0,
  BlockRespawnTime: 0.0,
  RespawnPenaltyDurationThreshold: 0.0,
  RespawnPenaltyTimeScale: 1.0,

  // PvP kill drops
  bDisplayPvPItemNumOnWorldMap_BaseCamp: false,
  bDisplayPvPItemNumOnWorldMap_Player: false,
  AdditionalDropItemWhenPlayerKillingInPvPMode: "PlayerDropItem",
  AdditionalDropItemNumWhenPlayerKillingInPvPMode: 1,
  bAdditionalDropItemWhenPlayerKillingInPvPMode: false,

  // Stat enhancement
  bAllowEnhanceStat_Health: true,
  bAllowEnhanceStat_Attack: true,
  bAllowEnhanceStat_Stamina: true,
  bAllowEnhanceStat_Weight: true,
  bAllowEnhanceStat_WorkSpeed: true,
};

export class PalConfigParser {
  read(serverPath: string): PalSettings {
    const iniPath = join(serverPath, CONFIG_REL_PATH);
    if (!existsSync(iniPath)) return { ...DEFAULT_SETTINGS };
    const content = readFileSync(iniPath, "utf-8");
    return this.parseIni(content);
  }

  write(
    serverPath: string,
    settings: PalSettings,
  ): { success: boolean; error?: string } {
    const iniPath = join(serverPath, CONFIG_REL_PATH);
    try {
      backupBeforeWrite(iniPath);
      writeFileSync(iniPath, this.serializeIni(settings), "utf-8");
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  private parseIni(content: string): PalSettings {
    const settings: PalSettings = { ...DEFAULT_SETTINGS };
    const match = content.match(
      /OptionSettings=\(([^()]*(?:\([^)]*\)[^()]*)*)\)/,
    );
    if (!match) return settings;

    const pairs = this.splitTopLevelPairs(match[1]);
    for (const pair of pairs) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) continue;
      const key = pair.slice(0, eqIdx).trim();
      const raw = pair.slice(eqIdx + 1).trim();
      settings[key] = parseIniValue(raw);
    }
    return settings;
  }

  /**
   * Découpe sur les virgules de premier niveau, en ignorant celles à
   * l'intérieur de parenthèses ou de guillemets — une valeur de type string
   * (ex: ServerDescription) peut contenir une virgule littérale, qui ne doit
   * pas être confondue avec le séparateur entre paires key=value.
   */
  private splitTopLevelPairs(content: string): string[] {
    const pairs: string[] = [];
    let depth = 0;
    let inQuotes = false;
    let current = "";
    for (const ch of content) {
      if (ch === '"') {
        inQuotes = !inQuotes;
        current += ch;
        continue;
      }
      if (!inQuotes) {
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        else if (ch === "," && depth === 0) {
          pairs.push(current);
          current = "";
          continue;
        }
      }
      current += ch;
    }
    if (current.trim()) pairs.push(current);
    return pairs;
  }

  private serializeIni(settings: PalSettings): string {
    const pairs = Object.entries(settings).map(([key, val]) => {
      if (typeof val === "boolean") return `${key}=${val ? "True" : "False"}`;
      if (typeof val === "number") {
        return INTEGER_FIELDS.has(key)
          ? `${key}=${val}`
          : `${key}=${val.toFixed(6)}`;
      }
      if (typeof val === "string" && val.startsWith("(") && val.endsWith(")"))
        return `${key}=${val}`;
      if (UNQUOTED_FIELDS.has(key)) return `${key}=${val}`;
      return `${key}="${val}"`;
    });
    return `[/Script/Pal.PalGameWorldSettings]\nOptionSettings=(${pairs.join(",")})\n`;
  }
}
