import { join } from "path";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  renameSync,
  createWriteStream,
  unlinkSync,
  statSync,
} from "fs";
import https from "https";
import http from "http";
import extractZip from "extract-zip";
import type {
  ModRegistry,
  ValheimMod,
  ValheimModConfigFile,
} from "../../../shared/types";
import { ModRegistryClient } from "./ModRegistryClient";
import { REGISTRIES, REGISTRY_API_BASE, USER_AGENT } from "./registries";
import { backupBeforeWrite } from "../../utils/ini";

interface TSVersion {
  version_number: string;
  download_url: string;
}

export class ValheimModsManager {
  constructor(
    private serverPath: string,
    private dataDir: string,
  ) {}

  private get pluginsPath(): string {
    return join(this.serverPath, "BepInEx", "plugins");
  }

  // Dossier hors de BepInEx/plugins/ pour les mods désactivés. BepInEx scanne
  // récursivement TOUS les .dll sous plugins/, peu importe le nom du dossier
  // parent — renommer sur place en "<dir>.disabled" ne désactive donc rien,
  // BepInEx charge quand même le plugin (confirmé par les logs : Awake/Start
  // s'exécutent normalement pour des dossiers ".disabled"). Il faut sortir le
  // dossier de l'arborescence scannée pour le désactiver réellement.
  private get disabledPluginsPath(): string {
    return join(this.serverPath, "BepInEx", "disabled_plugins");
  }

  // Migre les anciens dossiers "<installDir>.disabled" laissés sous plugins/
  // (toujours chargés par BepInEx malgré leur nom) vers disabledPluginsPath.
  private migrateLegacyDisabled(): void {
    if (!existsSync(this.pluginsPath)) return;
    for (const entry of readdirSync(this.pluginsPath, {
      withFileTypes: true,
    })) {
      if (!entry.isDirectory() || !entry.name.endsWith(".disabled")) continue;
      const baseName = entry.name.slice(0, -".disabled".length);
      const from = join(this.pluginsPath, entry.name);
      const to = join(this.disabledPluginsPath, baseName);
      try {
        mkdirSync(this.disabledPluginsPath, { recursive: true });
        if (existsSync(to)) rmSync(to, { recursive: true, force: true });
        renameSync(from, to);
      } catch {
        // best-effort — ne doit pas bloquer le chargement de la liste
      }
    }
  }

  private get metaPath(): string {
    return join(this.dataDir, "mods.json");
  }

  private get configPath(): string {
    return join(this.serverPath, "BepInEx", "config");
  }

  // BepInEx ne relie pas fiablement un .cfg à un mod installé (le fichier est
  // nommé d'après le GUID interne du plugin, pas le nom Thunderstore) — on se
  // contente donc de lister tous les .cfg présents, sans tenter de matching.
  listConfigFiles(): ValheimModConfigFile[] {
    if (!existsSync(this.configPath)) return [];
    return readdirSync(this.configPath, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".cfg"))
      .map((e) => {
        const stat = statSync(join(this.configPath, e.name));
        return { name: e.name, size: stat.size, mtime: stat.mtimeMs };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private resolveConfigFile(fileName: string): string {
    // Nom de fichier plat uniquement (pas de séparateur) — évite toute
    // traversée de chemin hors de BepInEx/config/.
    if (!/^[^/\\]+\.cfg$/i.test(fileName))
      throw new Error("Nom de fichier de config invalide");
    return join(this.configPath, fileName);
  }

  readConfigFile(fileName: string): string {
    return readFileSync(this.resolveConfigFile(fileName), "utf-8");
  }

  writeConfigFile(fileName: string, content: string): void {
    const path = this.resolveConfigFile(fileName);
    // Un mod avec ConfigSync (ex: AzuAntiArthriticCrafting) peut planter la
    // synchro serveur→client si une valeur ne correspond pas au type attendu
    // — sauvegarde avant écriture pour pouvoir revenir en arrière (même
    // pattern que PalConfigParser/AstroConfigParser, voir utils/ini.ts).
    backupBeforeWrite(path);
    writeFileSync(path, content, "utf-8");
  }

  detectBepInEx(): boolean {
    return existsSync(join(this.serverPath, "BepInEx", "core", "BepInEx.dll"));
  }

  // Lit uniquement le JSON — sans scanner le filesystem.
  // Déduplique par installDir en gardant l'entrée non-manuelle si les deux existent
  // (artefact d'un ancien bug où l'install créait un doublon "manuel").
  private readJson(): ValheimMod[] {
    if (!existsSync(this.metaPath)) return [];
    let mods: ValheimMod[];
    try {
      mods = JSON.parse(readFileSync(this.metaPath, "utf-8")) as ValheimMod[];
    } catch {
      return [];
    }
    const seen = new Map<string, ValheimMod>();
    for (const m of mods) {
      const existing = seen.get(m.installDir);
      // Préférer l'entrée thunderstore à l'entrée manual
      if (!existing || existing.source === "manual") seen.set(m.installDir, m);
    }
    const deduped = Array.from(seen.values());
    // Nettoyer le fichier si des doublons ont été trouvés
    if (deduped.length !== mods.length) this.save(deduped);
    return deduped;
  }

  list(): ValheimMod[] {
    this.migrateLegacyDisabled();
    const known = this.readJson();
    const knownDirs = new Set(known.map((m) => m.installDir));

    // Scanne plugins/ (actifs) et disabled_plugins/ (désactivés) pour
    // détecter les mods installés manuellement (absents du JSON).
    const manual: ValheimMod[] = [];
    const scanManual = (dir: string, enabled: boolean): void => {
      if (!existsSync(dir)) return;
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory() || knownDirs.has(entry.name)) continue;
        manual.push({
          modId: this.hashDir(entry.name),
          fileId: 0,
          name: entry.name,
          version: "?",
          author: "",
          summary: "",
          installedAt: 0,
          enabled,
          installDir: entry.name,
          source: "manual",
        });
      }
    };
    scanManual(this.pluginsPath, true);
    scanManual(this.disabledPluginsPath, false);

    return [...known, ...manual];
  }

  // Cherche le dossier qui contient directement BepInEx/core/BepInEx.dll.
  // Vérifie la racine puis un niveau de sous-dossiers (pattern Thunderstore).
  private findBepInExRoot(base: string): string | null {
    if (existsSync(join(base, "BepInEx", "core", "BepInEx.dll"))) return base;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const sub = join(base, entry.name);
      if (existsSync(join(sub, "BepInEx", "core", "BepInEx.dll"))) return sub;
    }
    return null;
  }

  private hashDir(s: string): number {
    let h = 5381;
    for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
    return Math.abs(h) || 1;
  }

  private save(mods: ValheimMod[]): void {
    mkdirSync(this.dataDir, { recursive: true });
    writeFileSync(this.metaPath, JSON.stringify(mods, null, 2), "utf-8");
  }

  // Fetch brut avec suivi des redirections (30x) et headers custom — base
  // commune à fetchJson/fetchText, qui ne diffèrent que par le parsing du body.
  private static fetchRaw(
    url: string,
    headers: Record<string, string>,
    depth = 0,
  ): Promise<{ statusCode: number; body: string }> {
    if (depth > 5) return Promise.reject(new Error("Trop de redirections"));
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const mod = parsed.protocol === "https:" ? https : http;
      mod
        .get(
          {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            headers,
          },
          (res) => {
            // Suivre les redirections 301/302/303/307/308
            if (
              res.statusCode &&
              res.statusCode >= 300 &&
              res.statusCode < 400 &&
              res.headers.location
            ) {
              res.resume();
              ValheimModsManager.fetchRaw(
                res.headers.location,
                headers,
                depth + 1,
              )
                .then(resolve)
                .catch(reject);
              return;
            }
            if (res.statusCode && res.statusCode >= 400) {
              res.resume();
              reject(new Error(`Thunderstore API erreur ${res.statusCode}`));
              return;
            }
            let data = "";
            res.on("data", (c: string) => (data += c));
            res.on("end", () =>
              resolve({ statusCode: res.statusCode ?? 0, body: data }),
            );
          },
        )
        .on("error", reject);
    });
  }

  private static async fetchJson<T>(url: string): Promise<T> {
    const { statusCode, body } = await ValheimModsManager.fetchRaw(url, {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    });
    try {
      return JSON.parse(body) as T;
    } catch {
      throw new Error(
        `Réponse JSON invalide (${statusCode}): ${body.slice(0, 120)}`,
      );
    }
  }

  private static async fetchText(url: string): Promise<string> {
    const { body } = await ValheimModsManager.fetchRaw(url, {
      "User-Agent": USER_AGENT,
    });
    return body;
  }

  async installBepInEx(onProgress: (msg: string) => void): Promise<void> {
    onProgress("Récupération de BepInExPack_Valheim depuis Thunderstore…");
    interface TSPkg {
      versions?: TSVersion[];
      latest?: TSVersion;
    }
    const pkg = await ValheimModsManager.fetchJson<TSPkg>(
      `${REGISTRY_API_BASE.thunderstore}/api/experimental/package/denikson/BepInExPack_Valheim/`,
    );
    // L'API peut retourner soit versions[], soit un objet latest
    const latest = pkg.versions?.[0] ?? pkg.latest;
    if (!latest?.version_number || !latest?.download_url)
      throw new Error(
        "Impossible d'obtenir la version de BepInExPack_Valheim depuis Thunderstore",
      );

    onProgress(
      `Téléchargement de BepInExPack_Valheim v${latest.version_number}…`,
    );
    mkdirSync(this.dataDir, { recursive: true });
    const tempZip = join(this.dataDir, "bepinex_install.zip");
    await this.downloadFile(latest.download_url, tempZip, onProgress);

    onProgress("Extraction de BepInEx…");
    mkdirSync(this.serverPath, { recursive: true });

    // Les ZIPs Thunderstore ont souvent un dossier racine unique (ex: BepInExPack_Valheim/)
    // On extrait d'abord dans un dossier temporaire pour aplatir si nécessaire.
    const tempExtract = join(this.dataDir, "_bepinex_extract_" + Date.now());
    try {
      mkdirSync(tempExtract, { recursive: true });
      await extractZip(tempZip, { dir: tempExtract });

      // Trouver le dossier qui contient réellement BepInEx/core/BepInEx.dll.
      // Les ZIPs Thunderstore peuvent avoir manifest.json + icon.png à la racine
      // ET les fichiers du mod dans un sous-dossier (ex: BepInExPack_Valheim/).
      const srcDir = this.findBepInExRoot(tempExtract);
      if (!srcDir)
        throw new Error(
          "Structure BepInEx non reconnue dans le ZIP Thunderstore — BepInEx/core/BepInEx.dll introuvable",
        );

      for (const item of readdirSync(srcDir)) {
        const src = join(srcDir, item);
        const dest = join(this.serverPath, item);
        if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
        // cpSync fonctionne inter-lecteurs (C: → E:), renameSync non
        cpSync(src, dest, { recursive: true });
      }
    } finally {
      try {
        rmSync(tempExtract, { recursive: true, force: true });
        unlinkSync(tempZip);
      } catch {
        // ignore
      }
    }
    onProgress(
      `BepInExPack_Valheim v${latest.version_number} installé avec succès.`,
    );
  }

  async installMod(
    registry: ModRegistry,
    packageCode: string,
    onProgress: (msg: string) => void,
  ): Promise<ValheimMod> {
    const parts = packageCode.trim().split("-");
    if (parts.length < 3)
      throw new Error(
        "Format invalide. Attendu : Auteur-NomDuMod-Version (ex: denikson-BepInExPack_Valheim-5.4.2202)",
      );
    const version = parts[parts.length - 1];
    const name = parts[parts.length - 2];
    const namespace = parts.slice(0, parts.length - 2).join("-");

    mkdirSync(this.pluginsPath, { recursive: true });

    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const installDir = `${namespace}_${safeName}`;
    const tempZip = join(this.dataDir, `${safeName}_${registry}.zip`);
    // URL construite par convention (marche pour Thunderstore) — remplacée
    // ci-dessous par le download_url réel de l'API dès qu'on l'a, seul moyen
    // fiable pour un registre dont on n'a pas vérifié le pattern d'URL.
    let downloadUrl = `${REGISTRY_API_BASE[registry]}/package/download/${namespace}/${name}/${version}/`;

    // Icône + date de publication de cette version — best-effort, un échec
    // réseau ici ne doit pas bloquer l'installation du mod lui-même.
    let pictureUrl: string | undefined;
    let publishedAt: number | undefined;
    try {
      const pkg = await ModRegistryClient.getPackage(registry, namespace, name);
      const versionInfo =
        pkg.versions.find((v) => v.version_number === version) ??
        pkg.versions[0];
      if (versionInfo?.download_url) downloadUrl = versionInfo.download_url;
      pictureUrl = versionInfo?.icon ?? undefined;
      if (versionInfo?.date_created) {
        publishedAt = Math.floor(
          new Date(versionInfo.date_created).getTime() / 1000,
        );
      }
    } catch {
      // pas bloquant — le mod s'installe sans icône/date si l'API est indisponible
    }

    onProgress(`Téléchargement de ${namespace}-${name} v${version}…`);
    await this.downloadFile(downloadUrl, tempZip, onProgress);

    const targetPath = join(this.pluginsPath, installDir);
    if (existsSync(targetPath))
      rmSync(targetPath, { recursive: true, force: true });
    mkdirSync(targetPath, { recursive: true });

    onProgress("Extraction…");
    try {
      await extractZip(tempZip, { dir: targetPath });
    } finally {
      try {
        unlinkSync(tempZip);
      } catch {
        // ignore
      }
    }

    const entry: ValheimMod = {
      modId: Date.now(),
      fileId: 0,
      name: `${namespace}-${name}`,
      version,
      author: namespace,
      summary: "",
      installedAt: Date.now(),
      enabled: true,
      installDir,
      pictureUrl,
      publishedAt,
      source: registry,
      thunderstoreCode: packageCode,
    };

    // Dédupliquer par code exact ET par installDir (mise à jour de version)
    const mods = this.readJson().filter(
      (m) => m.thunderstoreCode !== packageCode && m.installDir !== installDir,
    );
    mods.push(entry);
    this.save(mods);

    onProgress(`${entry.name} v${version} installé depuis ${registry}.`);
    return entry;
  }

  // Extrait les refs de mods ("Auteur-Nom-Major.Minor.Patch") d'un export.r2x
  // (YAML dumpé par r2modman/Gale — liste d'objets { name, version: { major, minor, patch } }).
  private static extractModRefsFromR2x(yamlContent: string): string[] {
    const pattern =
      /name:\s*["']?([^"'\n\r]+?)["']?\r?\n[\s\S]*?major:\s*(\d+)\r?\n\s*minor:\s*(\d+)\r?\n\s*patch:\s*(\d+)/g;
    const codes: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(yamlContent)) !== null) {
      codes.push(`${m[1].trim()}-${m[2]}.${m[3]}.${m[4]}`);
    }
    return codes;
  }

  // Extrait les refs de mods d'un fichier .r2z/.zip local contenant un
  // export.r2x — partagé entre le téléchargement via code (API Thunderstore)
  // et l'import direct d'un fichier ("Exporter en tant que fichier" dans
  // r2modman/Gale, distinct du code d'export en ligne).
  private async extractModRefsFromZipFile(zipPath: string): Promise<string[]> {
    mkdirSync(this.dataDir, { recursive: true });
    const tempExtract = join(this.dataDir, `_profile_extract_${Date.now()}`);
    try {
      mkdirSync(tempExtract, { recursive: true });
      await extractZip(zipPath, { dir: tempExtract });

      const r2xPath = join(tempExtract, "export.r2x");
      if (!existsSync(r2xPath))
        throw new Error("export.r2x introuvable dans le profil");
      const codes = ValheimModsManager.extractModRefsFromR2x(
        readFileSync(r2xPath, "utf-8"),
      );
      if (codes.length === 0)
        throw new Error("Aucun mod trouvé dans le profil (export.r2x vide)");
      return codes;
    } finally {
      try {
        rmSync(tempExtract, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }

  // Résout un code d'export "r2modman"/Gale — le code est un jeton opaque
  // (UUID historique ou format récent "xxx#yyy") créé par l'un ou l'autre
  // registre (Gale permet de mélanger Thunderstore et Hexium dans un même
  // profil), donc on essaie chaque registre jusqu'à ce que l'un réponde. La
  // réponse est du texte brut "#r2modman\n" + base64(zip du profil), le zip
  // contenant un export.r2x (YAML) listant les mods.
  private async resolveProfileCodeViaApi(code: string): Promise<string[]> {
    let lastError: unknown;
    let raw: string | undefined;
    for (const registry of REGISTRIES) {
      try {
        raw = await ValheimModsManager.fetchText(
          `${REGISTRY_API_BASE[registry]}/api/experimental/legacyprofile/get/${encodeURIComponent(code)}/`,
        );
        break;
      } catch (e) {
        lastError = e;
      }
    }
    if (raw === undefined)
      throw lastError ?? new Error("Impossible de résoudre le profil");

    const PREFIX = "#r2modman";
    if (!raw.startsWith(PREFIX))
      throw new Error("Réponse de profil inattendue");
    const zipBuf = Buffer.from(raw.slice(PREFIX.length).trim(), "base64");

    mkdirSync(this.dataDir, { recursive: true });
    const tempZip = join(this.dataDir, `profile_${Date.now()}.r2z`);
    try {
      writeFileSync(tempZip, zipBuf);
      return await this.extractModRefsFromZipFile(tempZip);
    } finally {
      try {
        rmSync(tempZip, { force: true });
      } catch {
        // ignore
      }
    }
  }

  /**
   * Importe un profil r2modman/Gale depuis un fichier .r2z/.zip local sur
   * le disque ("Exporter en tant que fichier" plutôt qu'un code en ligne —
   * utile pour partager un profil sans passer par le service Thunderstore,
   * ex: via Discord).
   */
  async parseThunderstoreProfileFile(filePath: string): Promise<string[]> {
    if (!existsSync(filePath)) throw new Error("Fichier introuvable");
    return this.extractModRefsFromZipFile(filePath);
  }

  // Décode un code de profil Thunderstore/r2modman et retourne la liste des
  // codes de packages au format "Auteur-Nom-Major.Minor.Patch".
  // Supporte :
  //  - code d'export r2modman/Gale (jeton opaque à un seul "mot") → API fetch
  //  - base64 YAML r2modman (versionNumber.major/minor/patch)
  //  - base64 YAML simplifié (version: "X.Y.Z")
  //  - base64 JSON {mods:[{modRef}]}
  //  - liste brute de codes (un par ligne)
  async parseThunderstoreProfile(input: string): Promise<string[]> {
    const code = input.trim();

    // Un code d'export ("Exporter en tant que code" dans r2modman/Gale) est un jeton
    // opaque sans espace ni retour à la ligne — son format n'est pas garanti (UUID
    // historique ou "xxx#yyy" pour les backends plus récents), donc on tente toujours
    // l'API pour ce cas avant de retomber sur les heuristiques locales ci-dessous.
    if (code.length > 0 && !/\s/.test(code)) {
      try {
        return await this.resolveProfileCodeViaApi(code);
      } catch {
        // Pas un code de profil valide (ou API indisponible) — on retente en local.
      }
    }

    let decoded: string;
    try {
      let buf = Buffer.from(code, "base64");
      // Décompresser si le contenu est du gzip (signature 0x1f 0x8b)
      if (buf.length >= 2 && buf[0] === 0x1f && buf[1] === 0x8b) {
        const { gunzipSync } = require("zlib") as typeof import("zlib");
        try {
          buf = gunzipSync(buf);
        } catch {
          // Pas du gzip valide, continuer avec le buffer original
        }
      }
      decoded = buf.toString("utf-8");
    } catch {
      throw new Error("Code de profil invalide (base64 incorrect)");
    }

    // Format 1: JSON { mods: [{ modRef: "Author-Name-Version", ... }] }
    try {
      const json = JSON.parse(decoded) as Record<string, unknown>;
      if (Array.isArray(json?.mods)) {
        const codes: string[] = [];
        for (const mod of json.mods as Record<string, unknown>[]) {
          const ref =
            (mod.modRef as string | undefined) ??
            (mod.dependency_string as string | undefined);
          if (ref && /^[^-]+-[^-]+-\d/.test(ref)) codes.push(ref);
        }
        if (codes.length > 0) return codes;
      }
    } catch {
      // pas du JSON
    }

    // Format 2: YAML r2modman avec versionNumber.major/minor/patch
    if (decoded.includes("versionNumber")) {
      const codes = ValheimModsManager.extractModRefsFromR2x(decoded);
      if (codes.length > 0) return codes;
    }

    // Format 3: YAML simplifié avec version: "X.Y.Z"
    if (decoded.includes("version:")) {
      const pattern =
        /name:\s*["']?([^"'\n\r]+?)["']?[^\n]*\n[^\n]*version:\s*["']?(\d+\.\d+\.\d+)/g;
      const codes: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(decoded)) !== null) {
        codes.push(`${m[1].trim()}-${m[2]}`);
      }
      if (codes.length > 0) return codes;
    }

    // Format 4: liste brute de codes (un par ligne, format Auteur-Nom-X.Y.Z)
    const lines = decoded
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter(
        (l) =>
          l &&
          !l.startsWith("#") &&
          /^[A-Za-z0-9_]+-[A-Za-z0-9_]+-\d+\.\d+/.test(l),
      );
    if (lines.length > 0) return lines;

    throw new Error(
      `Format de profil Thunderstore non reconnu.\nContenu décodé (${decoded.length} car.) : ${decoded.slice(0, 300)}`,
    );
  }

  remove(modId: number): void {
    const jsonMods = this.readJson();
    // Chercher dans le JSON d'abord, fallback filesystem pour les mods manuels
    const mod =
      jsonMods.find((m) => m.modId === modId) ??
      this.list().find((m) => m.modId === modId);
    if (!mod) return;

    for (const dir of [this.pluginsPath, this.disabledPluginsPath]) {
      const p = join(dir, mod.installDir);
      if (existsSync(p)) rmSync(p, { recursive: true, force: true });
    }
    // Legacy : ancien dossier "<installDir>.disabled" sous plugins/
    const legacy = join(this.pluginsPath, `${mod.installDir}.disabled`);
    if (existsSync(legacy)) rmSync(legacy, { recursive: true, force: true });

    // Mettre à jour le JSON (les mods manuels n'y sont pas, save() est no-op)
    this.save(jsonMods.filter((m) => m.modId !== modId));
  }

  toggle(modId: number, enabled: boolean): void {
    this.migrateLegacyDisabled();
    const jsonMods = this.readJson();
    const jsonMod = jsonMods.find((m) => m.modId === modId);
    const mod = jsonMod ?? this.list().find((m) => m.modId === modId);
    if (!mod) return;

    const activePath = join(this.pluginsPath, mod.installDir);
    const disabledPath = join(this.disabledPluginsPath, mod.installDir);

    if (enabled && existsSync(disabledPath)) {
      mkdirSync(this.pluginsPath, { recursive: true });
      renameSync(disabledPath, activePath);
    } else if (!enabled && existsSync(activePath)) {
      mkdirSync(this.disabledPluginsPath, { recursive: true });
      renameSync(activePath, disabledPath);
    }

    // Persister uniquement pour les mods enregistrés dans le JSON
    if (jsonMod) {
      jsonMod.enabled = enabled;
      this.save(jsonMods);
    }
  }

  private downloadFile(
    url: string,
    dest: string,
    onProgress: (msg: string) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      mkdirSync(this.dataDir, { recursive: true });

      const protocol = url.startsWith("https") ? https : http;
      const file = createWriteStream(dest);

      const request = protocol.get(url, (res) => {
        // Suivre les redirections (302/301)
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          file.close();
          try {
            unlinkSync(dest);
          } catch {
            /* ignore */
          }
          this.downloadFile(res.headers.location, dest, onProgress)
            .then(resolve)
            .catch(reject);
          return;
        }

        const total = parseInt(res.headers["content-length"] ?? "0", 10);
        let received = 0;
        let lastPct = -1;

        res.on("data", (chunk: Buffer) => {
          received += chunk.length;
          if (total > 0) {
            const pct = Math.floor((received / total) * 100);
            if (pct !== lastPct && pct % 10 === 0) {
              lastPct = pct;
              onProgress(`Téléchargement… ${pct}%`);
            }
          }
        });

        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
        file.on("error", (err) => {
          try {
            unlinkSync(dest);
          } catch {
            /* ignore */
          }
          reject(err);
        });
      });

      request.on("error", (err) => {
        try {
          unlinkSync(dest);
        } catch {
          /* ignore */
        }
        reject(err);
      });

      request.setTimeout(60000, () => {
        request.destroy();
        reject(new Error("Timeout du téléchargement"));
      });
    });
  }
}
