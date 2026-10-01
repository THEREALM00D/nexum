import { exec } from "child_process";
import { promisify } from "util";
import type Store from "electron-store";
import type { FirewallNamedRule } from "../../shared/types";

const execAsync = promisify(exec);

export interface FirewallPort {
  name: string;
  port: number;
  protocol: "TCP" | "UDP";
  active: boolean;
}

interface StoredCustomRule {
  name: string;
  port: number;
  protocol: "TCP" | "UDP";
}

interface FWStore {
  customRules: StoredCustomRule[];
}

type Result = { success: boolean; error?: string };

// Codes d'erreur renvoyés au renderer (traduits côté UI, voir
// components/firewall/firewallError.ts).
export const FW_ERROR = {
  uacCancelled: "UAC_CANCELLED",
  invalidRule: "INVALID_RULE",
  notApplied: "NOT_APPLIED",
} as const;

const RULE_NAMES = {
  game: "Palworld Server - Game",
  rcon: "Palworld Server - RCON",
  restapi: "Palworld Server - REST API",
};

// Game port needs both TCP and UDP; other rules use a single protocol.
function getRuleName(
  key: keyof typeof RULE_NAMES,
  protocol: "TCP" | "UDP",
): string {
  return key === "game" ? `${RULE_NAMES.game} ${protocol}` : RULE_NAMES[key];
}

// Les noms de règles finissent dans une ligne de commande exécutée avec les
// droits admin : on n'accepte que des caractères sans signification pour
// cmd.exe (pas de " & | < > ^ % …) — sinon injection de commande élevée.
const SAFE_NAME = /^[\p{L}\p{N} _().:-]{1,80}$/u;

function isValidRule(name: string, port?: number, protocol?: string): boolean {
  if (!SAFE_NAME.test(name)) return false;
  if (
    port !== undefined &&
    !(Number.isInteger(port) && port > 0 && port < 65536)
  )
    return false;
  if (protocol !== undefined && protocol !== "TCP" && protocol !== "UDP")
    return false;
  return true;
}

const addCmd = (name: string, port: number, protocol: "TCP" | "UDP") =>
  `netsh advfirewall firewall add rule name="${name}" dir=in action=allow protocol=${protocol} localport=${port}`;
const deleteCmd = (name: string, protocol?: "TCP" | "UDP") =>
  `netsh advfirewall firewall delete rule name="${name}"${protocol ? ` protocol=${protocol}` : ""}`;

export class FirewallManager {
  // electron-store est en ESM pur depuis la v9 — chargé dynamiquement (seul
  // moyen depuis notre process main en CJS) et mis en cache après le premier
  // appel, car un champ de classe ne peut pas être initialisé par un await.
  private storePromise: Promise<Store<FWStore>> | null = null;

  private getStore(): Promise<Store<FWStore>> {
    if (!this.storePromise) {
      this.storePromise = import("electron-store").then(
        ({ default: StoreClass }) =>
          new StoreClass<FWStore>({
            name: "firewall",
            defaults: { customRules: [] },
          }),
      );
    }
    return this.storePromise;
  }

  async isAdmin(): Promise<boolean> {
    try {
      await execAsync("net session", { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  // Exécute un lot de commandes netsh. L'app ne tourne plus en admin : si
  // besoin, tout le lot passe par UN processus élevé (une seule invite UAC
  // pour « Tout appliquer », pas une par règle). La sortie d'un processus
  // élevé n'est pas récupérable : l'appelant vérifie le résultat avec
  // ruleExists(). Les échecs de `delete` (règle absente) sont ignorés.
  private async runNetsh(cmds: string[]): Promise<void> {
    if (cmds.length === 0) return;
    if (await this.isAdmin()) {
      for (const cmd of cmds) {
        await execAsync(cmd, { timeout: 10000 }).catch((err) => {
          if (!cmd.includes(" delete rule ")) throw err;
        });
      }
      return;
    }
    // PowerShell via -EncodedCommand : évite d'imbriquer les guillemets de
    // netsh dans ceux de cmd puis de PowerShell. Les apostrophes sont
    // doublées pour la chaîne PowerShell entre apostrophes.
    const batch = cmds.join(" & ").replace(/'/g, "''");
    const ps =
      `$ErrorActionPreference = 'Stop'; ` +
      `Start-Process -FilePath 'cmd.exe' -ArgumentList '/c ${batch}' ` +
      `-Verb RunAs -WindowStyle Hidden -Wait`;
    const encoded = Buffer.from(ps, "utf16le").toString("base64");
    try {
      await execAsync(
        `powershell -NoProfile -NonInteractive -EncodedCommand ${encoded}`,
        { timeout: 120000 },
      );
    } catch {
      // Seule cause réaliste : l'utilisateur a refusé l'invite UAC
      throw new Error(FW_ERROR.uacCancelled);
    }
  }

  // Lance le lot puis vérifie que chaque règle attendue existe (ou non)
  private async apply(
    cmds: string[],
    expect: { name: string; exists: boolean }[],
  ): Promise<Result> {
    try {
      await this.runNetsh(cmds);
    } catch (err) {
      const msg = (err as Error).message;
      return {
        success: false,
        error: msg === FW_ERROR.uacCancelled ? msg : String(err),
      };
    }
    for (const e of expect) {
      if ((await this.ruleExists(e.name)) !== e.exists)
        return { success: false, error: FW_ERROR.notApplied };
    }
    return { success: true };
  }

  async getStatus(
    gamePort: number,
    rconPort: number,
    restApiPort: number,
  ): Promise<FirewallPort[]> {
    const targets = [
      {
        name: getRuleName("game", "UDP"),
        port: gamePort,
        protocol: "UDP" as const,
      },
      {
        name: getRuleName("game", "TCP"),
        port: gamePort,
        protocol: "TCP" as const,
      },
      { name: RULE_NAMES.rcon, port: rconPort, protocol: "TCP" as const },
      { name: RULE_NAMES.restapi, port: restApiPort, protocol: "TCP" as const },
    ];

    return Promise.all(
      targets.map(async (t) => ({
        ...t,
        active: await this.ruleExists(t.name),
      })),
    );
  }

  private async ruleExists(name: string): Promise<boolean> {
    if (!isValidRule(name)) return false;
    try {
      const { stdout } = await execAsync(
        `netsh advfirewall firewall show rule name="${name}"`,
        { timeout: 5000 },
      );
      return !stdout.includes("No rules match");
    } catch (err: unknown) {
      const out = String((err as { stdout?: string })?.stdout ?? "");
      if (out.includes("No rules match")) return false;
      console.error("[FirewallManager] ruleExists:", name, err);
      return false;
    }
  }

  async enableRule(
    key: "game" | "rcon" | "restapi",
    port: number,
    protocol: "TCP" | "UDP",
  ): Promise<Result> {
    return this.applyNamedRules([
      { name: getRuleName(key, protocol), port, protocol },
    ]);
  }

  async disableRule(key: "game" | "rcon" | "restapi"): Promise<Result> {
    const names =
      key === "game"
        ? [getRuleName("game", "UDP"), getRuleName("game", "TCP")]
        : [RULE_NAMES[key]];
    return this.apply(
      names.map((n) => deleteCmd(n)),
      names.map((name) => ({ name, exists: false })),
    );
  }

  async applyAll(
    gamePort: number,
    rconPort: number,
    restApiPort: number,
  ): Promise<{ success: boolean; errors: string[] }> {
    const res = await this.applyNamedRules([
      { name: getRuleName("game", "UDP"), port: gamePort, protocol: "UDP" },
      { name: getRuleName("game", "TCP"), port: gamePort, protocol: "TCP" },
      { name: RULE_NAMES.rcon, port: rconPort, protocol: "TCP" },
      { name: RULE_NAMES.restapi, port: restApiPort, protocol: "TCP" },
    ]);
    return { success: res.success, errors: res.error ? [res.error] : [] };
  }

  async removeAll(): Promise<void> {
    await this.removeNamedRules([
      { name: getRuleName("game", "UDP") },
      { name: getRuleName("game", "TCP") },
      { name: RULE_NAMES.rcon },
      { name: RULE_NAMES.restapi },
    ]);
  }

  async checkRule(name: string): Promise<boolean> {
    return this.ruleExists(name);
  }

  // Crée (ou recrée) plusieurs règles en un seul lot — une seule invite UAC
  async applyNamedRules(rules: FirewallNamedRule[]): Promise<Result> {
    if (!rules.every((r) => isValidRule(r.name, r.port, r.protocol)))
      return { success: false, error: FW_ERROR.invalidRule };
    return this.apply(
      rules.flatMap((r) => [
        deleteCmd(r.name, r.protocol),
        addCmd(r.name, r.port, r.protocol),
      ]),
      rules.map((r) => ({ name: r.name, exists: true })),
    );
  }

  // Supprime plusieurs règles en un seul lot — une seule invite UAC
  async removeNamedRules(
    rules: { name: string; protocol?: "TCP" | "UDP" }[],
  ): Promise<Result> {
    if (!rules.every((r) => isValidRule(r.name, undefined, r.protocol)))
      return { success: false, error: FW_ERROR.invalidRule };
    // Une règle « Game » existe en TCP et UDP sous des noms distincts : on ne
    // vérifie l'absence que si le protocole n'est pas précisé.
    return this.apply(
      rules.map((r) => deleteCmd(r.name, r.protocol)),
      rules
        .filter((r) => !r.protocol)
        .map((r) => ({ name: r.name, exists: false })),
    );
  }

  async enableNamedRule(
    name: string,
    port: number,
    protocol: "TCP" | "UDP",
  ): Promise<Result> {
    return this.applyNamedRules([{ name, port, protocol }]);
  }

  async disableNamedRule(
    name: string,
    protocol?: "TCP" | "UDP",
  ): Promise<Result> {
    return this.removeNamedRules([{ name, protocol }]);
  }

  async createCustomRule(
    name: string,
    port: number,
    protocol: "TCP" | "UDP",
  ): Promise<Result> {
    const result = await this.applyNamedRules([{ name, port, protocol }]);
    if (result.success) {
      const store = await this.getStore();
      const existing = store.get("customRules");
      const alreadyStored = existing.some(
        (r) => r.name === name && r.protocol === protocol,
      );
      if (!alreadyStored) {
        store.set("customRules", [...existing, { name, port, protocol }]);
      }
    }
    return result;
  }

  async deleteCustomRule(
    name: string,
    protocol: "TCP" | "UDP",
  ): Promise<Result> {
    const result = await this.removeNamedRules([{ name, protocol }]);
    if (result.success) {
      const store = await this.getStore();
      const remaining = store
        .get("customRules")
        .filter((r) => !(r.name === name && r.protocol === protocol));
      store.set("customRules", remaining);
    }
    return result;
  }

  async listCustomRules(): Promise<FirewallPort[]> {
    const store = await this.getStore();
    const stored = store.get("customRules");
    return Promise.all(
      stored.map(async (r) => ({
        name: r.name,
        port: r.port,
        protocol: r.protocol,
        active: await this.ruleExists(r.name),
      })),
    );
  }
}
