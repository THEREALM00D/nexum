import { readFile } from "fs/promises";
import type {
  FirewallNamedRule,
  SettingsImportChoice,
  SettingsImportPreview,
  SettingsImportResult,
  TransferAppSettings,
} from "../../shared/types";
import type { IpcContext } from "../ipc/context";
import { setLanguage } from "../i18n/language";
import { getLaunchAtLogin, setLaunchAtLogin } from "../startup/launchAtLogin";
import { setBetaUpdates } from "../update/AutoUpdater";
import { isValidRule } from "../firewall/FirewallManager";
import {
  SETTINGS_FORMAT,
  TRANSFER_VERSION,
  checkHeader,
  configWithPaths,
  entryPaths,
  parseJson,
  parseServerEntry,
  toServerEntry,
  type TransferServerEntry,
} from "./transferFormat";

interface SettingsFile {
  format: typeof SETTINGS_FORMAT;
  version: number;
  appVersion: string;
  exportedAt: number;
  includesPasswords: boolean;
  app: TransferAppSettings;
  customFirewallRules: FirewallNamedRule[];
  servers: TransferServerEntry[];
}

export async function buildSettingsFile(
  ctx: IpcContext,
  includePasswords: boolean,
): Promise<string> {
  const launchAtLogin = getLaunchAtLogin();
  const file: SettingsFile = {
    format: SETTINGS_FORMAT,
    version: TRANSFER_VERSION,
    appVersion: ctx.app.getVersion(),
    exportedAt: Date.now(),
    includesPasswords: includePasswords,
    app: {
      language: ctx.store.get("language", "fr"),
      closeToTray: ctx.store.get("closeToTray", true),
      betaUpdates: ctx.store.get("betaUpdates", false),
      // Non supporté en dev : pas exporté plutôt qu'exporté à faux
      ...(launchAtLogin.supported && { launchAtLogin: launchAtLogin.enabled }),
    },
    customFirewallRules: await ctx.firewall.getCustomRules(),
    servers: ctx.servers
      .list()
      .map((server) =>
        toServerEntry(server, ctx.getServerConfig(server.id), includePasswords),
      ),
  };
  return JSON.stringify(file, null, 2);
}

const booleanOrUndefined = (value: unknown) =>
  typeof value === "boolean" ? value : undefined;

function parseApp(raw: unknown): TransferAppSettings {
  const app = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    language:
      app.language === "fr" || app.language === "en" ? app.language : undefined,
    closeToTray: booleanOrUndefined(app.closeToTray),
    betaUpdates: booleanOrUndefined(app.betaUpdates),
    launchAtLogin: booleanOrUndefined(app.launchAtLogin),
  };
}

function parseRules(raw: unknown): FirewallNamedRule[] {
  if (!Array.isArray(raw)) return [];
  // Mêmes règles que le pare-feu (noms passés à netsh en admin) : une règle
  // modifiée à la main est écartée dès l'aperçu. addCustomRules revalide.
  return raw.filter(
    (rule): rule is FirewallNamedRule =>
      typeof rule?.name === "string" &&
      isValidRule(rule.name, rule.port, rule.protocol),
  );
}

/** Lit et valide le fichier, sans rien écrire. */
async function readSettingsFile(filePath: string): Promise<SettingsFile> {
  const root = checkHeader(
    parseJson(await readFile(filePath, "utf-8")),
    SETTINGS_FORMAT,
  );
  const servers = Array.isArray(root.servers) ? root.servers : [];
  return {
    format: SETTINGS_FORMAT,
    version: root.version as number,
    appVersion: String(root.appVersion ?? ""),
    exportedAt: Number(root.exportedAt) || 0,
    includesPasswords: root.includesPasswords === true,
    app: parseApp(root.app),
    customFirewallRules: parseRules(root.customFirewallRules),
    servers: servers.map(parseServerEntry),
  };
}

export async function previewSettingsFile(
  filePath: string,
): Promise<SettingsImportPreview> {
  const file = await readSettingsFile(filePath);
  return {
    filePath,
    exportedAt: file.exportedAt,
    includesPasswords: file.includesPasswords,
    app: file.app,
    customFirewallRules: file.customFirewallRules,
    servers: file.servers.map((entry, index) => ({
      index,
      name: entry.server.name,
      gameType: entry.server.gameType,
      paths: entryPaths(entry),
    })),
  };
}

function applyAppSettings(ctx: IpcContext, app: TransferAppSettings): void {
  if (app.language) {
    ctx.store.set("language", app.language);
    setLanguage(app.language);
  }
  if (app.closeToTray !== undefined)
    ctx.store.set("closeToTray", app.closeToTray);
  if (app.betaUpdates !== undefined) setBetaUpdates(ctx.store, app.betaUpdates);
  if (app.launchAtLogin !== undefined) setLaunchAtLogin(app.launchAtLogin);
}

/**
 * Applique le fichier relu (jamais le contenu venu du renderer). Chaque
 * serveur reçoit un nouvel id : un import n'écrase jamais un serveur existant.
 */
export async function importSettingsFile(
  ctx: IpcContext,
  choice: SettingsImportChoice,
): Promise<SettingsImportResult> {
  const file = await readSettingsFile(choice.filePath);
  const result: SettingsImportResult = { serverIds: [], app: null };

  // Ce qui peut échouer (store du pare-feu, démarrage avec Windows) passe
  // avant la création des serveurs : sinon un nouvel essai les dupliquerait.
  if (choice.applyAppSettings) {
    applyAppSettings(ctx, file.app);
    result.app = file.app;
  }
  const rules =
    choice.importFirewallRules && file.customFirewallRules.length > 0
      ? await ctx.firewall.addCustomRules(file.customFirewallRules)
      : [];

  for (const { index, paths } of choice.servers) {
    const entry = file.servers[index];
    if (!entry) continue;
    const created = ctx.servers.create({
      ...entry.server,
      path: paths.path.trim(),
    });
    ctx.updateServerConfig(created.id, configWithPaths(entry.config, paths));
    result.serverIds.push(created.id);
  }

  // En dernier : une invite UAC refusée renvoie une erreur, sans lever
  if (choice.applyFirewallRules && rules.length > 0) {
    const applyResult = await ctx.firewall.applyNamedRules(rules);
    if (!applyResult.success) result.firewallError = applyResult.error;
  }
  return result;
}
