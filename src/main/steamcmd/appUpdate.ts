import { spawn } from "child_process";
import { appError } from "../utils/appError";
import { lt } from "../i18n/logStrings";

export interface AppUpdateResult {
  success: boolean;
  error?: string;
  /** Code de sortie de SteamCMD (ou message de l'erreur de lancement). */
  code: string;
}

/** Un lancement de `app_update <appId> validate` dans `installPath`. */
export function runAppUpdate(
  exe: string,
  steamcmdDir: string,
  appId: string,
  installPath: string,
  onProgress: (msg: string) => void,
): Promise<AppUpdateResult> {
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

    const proc = spawn(exe, args, { cwd: steamcmdDir });

    proc.stdout?.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n").filter(Boolean);
      lines.forEach((line) => onProgress(line.trim()));
    });

    proc.stderr?.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n").filter(Boolean);
      lines.forEach((line) => onProgress(`[ERR] ${line.trim()}`));
    });

    proc.on("close", (exitCode) => {
      const code = String(exitCode);
      if (exitCode === 0) {
        onProgress(lt().serverInstalled);
        resolve({ success: true, code });
      } else {
        resolve({
          success: false,
          error: appError("STEAMCMD_FAILED", { code }),
          code,
        });
      }
    });

    proc.on("error", (error) =>
      resolve({
        success: false,
        error: appError("STEAMCMD_FAILED", { code: error.message }),
        code: error.message,
      }),
    );
  });
}
