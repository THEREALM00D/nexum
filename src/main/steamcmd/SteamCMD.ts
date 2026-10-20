import { basename, dirname, join } from "path";
import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import { spawn } from "child_process";
import { app } from "electron/main";
import fs from "fs";
import https from "https";
import type { GameType, UpdateCheckResult } from "../../shared/types";
import { AppError, appError, networkError } from "../utils/appError";

/** AppId Steam du serveur dédié de chaque jeu (téléchargeable en anonyme). */
export const STEAM_APP_IDS: Record<GameType, string> = {
  palworld: "2394010",
  valheim: "896660",
  astroneer: "728470",
  // « RuneScape: Dragonwilds - Dedicated Servers » (1374490 = le client).
  dragonwilds: "4019830",
};

/**
 * Serveur installé via la bibliothèque Steam (`<bibliothèque>/steamapps/common/<jeu>`) :
 * c'est le client Steam qui le met à jour, et son manifest est dans
 * `<bibliothèque>/steamapps/`, pas dans le dossier du serveur.
 */
export function isSteamLibraryInstall(installPath: string): boolean {
  const parent = dirname(installPath);
  return (
    basename(parent).toLowerCase() === "common" &&
    basename(dirname(parent)).toLowerCase() === "steamapps"
  );
}
interface AppManifest {
  buildId: string;
  /** Date de dernière mise à jour (ms) : champ LastUpdated, sinon date du fichier. */
  updatedAt: number;
}

function readManifest(acf: string): AppManifest | null {
  try {
    const text = readFileSync(acf, "utf-8");
    const build = text.match(/"buildid"\s+"(\d+)"/);
    if (!build) return null;
    const lastUpdated = text.match(/"LastUpdated"\s+"(\d+)"/);
    return {
      buildId: build[1],
      updatedAt: lastUpdated
        ? Number(lastUpdated[1]) * 1000
        : statSync(acf).mtimeMs,
    };
  } catch {
    return null; // absent ou illisible
  }
}

const STEAMCMD_URL =
  "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip";

export class SteamCMD {
  private get steamcmdDir(): string {
    return join(app.getPath("userData"), "steamcmd");
  }

  private get exe(): string {
    return join(this.steamcmdDir, "steamcmd.exe");
  }

  isInstalled(): boolean {
    return existsSync(this.exe);
  }

  async install(
    onProgress: (msg: string) => void,
  ): Promise<{ success: boolean; error?: string }> {
    if (this.isInstalled()) {
      onProgress("SteamCMD already installed.");
      return { success: true };
    }

    mkdirSync(this.steamcmdDir, { recursive: true });
    const zipPath = join(this.steamcmdDir, "steamcmd.zip");

    onProgress("Downloading SteamCMD...");

    try {
      await this.downloadFile(STEAMCMD_URL, zipPath);
      onProgress("Extracting SteamCMD...");
      await this.extractZip(zipPath, this.steamcmdDir);
      onProgress("SteamCMD installed successfully.");
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  /** Installe ou met à jour le serveur dédié d'un jeu dans `installPath`. */
  async installGame(
    gameType: GameType,
    installPath: string,
    onProgress: (msg: string) => void,
  ): Promise<{ success: boolean; error?: string }> {
    return this.runInstall(STEAM_APP_IDS[gameType], installPath, onProgress);
  }

  private async runInstall(
    appId: string,
    installPath: string,
    onProgress: (msg: string) => void,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isInstalled()) {
      const result = await this.install(onProgress);
      if (!result.success) return result;
    }

    mkdirSync(installPath, { recursive: true });
    onProgress(`Installing app ${appId} to: ${installPath}`);

    return new Promise((resolve) => {
      const args = [
        "+force_install_dir",
        installPath,
        "+login",
        "anonymous",
        "+app_update",
        appId,
        "validate",
        "+quit",
      ];

      const proc = spawn(this.exe, args, { cwd: this.steamcmdDir });

      proc.stdout?.on("data", (data: Buffer) => {
        const lines = data.toString().split("\n").filter(Boolean);
        lines.forEach((line) => onProgress(line.trim()));
      });

      proc.stderr?.on("data", (data: Buffer) => {
        const lines = data.toString().split("\n").filter(Boolean);
        lines.forEach((line) => onProgress(`[ERR] ${line.trim()}`));
      });

      proc.on("close", (code) => {
        if (code === 0) {
          onProgress("Server installed/updated successfully!");
          resolve({ success: true });
        } else {
          resolve({
            success: false,
            error: appError("STEAMCMD_FAILED", { code: String(code) }),
          });
        }
      });

      proc.on("error", (err) =>
        resolve({
          success: false,
          error: appError("STEAMCMD_FAILED", { code: err.message }),
        }),
      );
    });
  }

  private getInstalledBuildId(
    installPath: string,
    appId: string,
  ): string | null {
    const manifest = `appmanifest_${appId}.acf`;
    // Manifests propres à cette install : celui que SteamCMD écrit dans
    // installPath/steamapps/ et, pour une install de la bibliothèque Steam,
    // celui du client Steam (<bibliothèque>/steamapps/). Les deux peuvent
    // coexister : on garde le plus récent. Avant, celui de la bibliothèque
    // passait toujours en premier ; après une mise à jour faite depuis Nexum
    // (SteamCMD), il restait sur l'ancien build et Nexum annonçait une mise à
    // jour en boucle (signalé sur Discord).
    const own = [join(installPath, "steamapps", manifest)];
    if (isSteamLibraryInstall(installPath)) {
      own.push(join(dirname(dirname(installPath)), manifest));
    }
    const newest = own
      .map(readManifest)
      .filter((m): m is AppManifest => m !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];
    if (newest) return newest.buildId;
    // Dernier recours : manifest resté dans le dossier de SteamCMD.
    return (
      readManifest(join(this.steamcmdDir, "steamapps", manifest))?.buildId ??
      null
    );
  }

  checkForUpdate(
    installPath: string,
    appId: string,
  ): Promise<UpdateCheckResult> {
    const installedBuild = this.getInstalledBuildId(installPath, appId);
    const steamLibrary = isSteamLibraryInstall(installPath);
    const fallback: UpdateCheckResult = {
      upToDate: false,
      installedBuild,
      requiredBuild: null,
      steamLibrary,
    };
    if (!installedBuild || !this.isInstalled()) {
      return Promise.resolve(fallback);
    }

    return new Promise((resolve) => {
      let settled = false;
      const done = (result: UpdateCheckResult) => {
        if (!settled) {
          settled = true;
          resolve(result);
        }
      };

      const timer = setTimeout(() => done(fallback), 30000);
      let output = "";

      // app_info_update 1 force le rafraîchissement du cache Steam
      // app_info_print retourne les infos du depot en VDF (inclut le buildid de la branche public)
      const proc = spawn(
        this.exe,
        [
          "+login",
          "anonymous",
          "+app_info_update",
          "1",
          "+app_info_print",
          appId,
          "+quit",
        ],
        { cwd: this.steamcmdDir },
      );

      proc.stdout?.on("data", (d: Buffer) => {
        output += d.toString();
      });
      proc.stderr?.on("data", (d: Buffer) => {
        output += d.toString();
      });

      proc.on("close", () => {
        clearTimeout(timer);
        // Trouver le buildid dans la section "public" du VDF
        const match = output.match(/"public"\s*\{[^}]*?"buildid"\s+"(\d+)"/s);
        if (!match) {
          done(fallback);
          return;
        }
        const latestBuild = match[1];
        done({
          upToDate: installedBuild === latestBuild,
          installedBuild,
          requiredBuild: installedBuild !== latestBuild ? latestBuild : null,
          steamLibrary,
        });
      });

      proc.on("error", () => {
        clearTimeout(timer);
        done(fallback);
      });
    });
  }

  private downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      https
        .get(url, (res) => {
          res.pipe(file);
          file.on("finish", () => file.close(() => resolve()));
        })
        .on("error", (err) => {
          fs.unlink(dest, () => {});
          reject(networkError(url, err));
        });
    });
  }

  private extractZip(zipPath: string, destDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn("powershell", [
        "-Command",
        `Expand-Archive -Path "${zipPath}" -DestinationPath "${destDir}" -Force`,
      ]);
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else
          reject(
            new AppError("STEAMCMD_EXTRACT_FAILED", { code: String(code) }),
          );
      });
      proc.on("error", reject);
    });
  }
}
