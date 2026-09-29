import { exec } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import { writeFileSync, unlinkSync } from "fs";

/**
 * Émule un CTRL+C envoyé au process `pid` sur Windows — Node n'a pas
 * d'équivalent portable à `process.kill(pid, "SIGINT")` sur cette
 * plateforme (ça termine le process directement, comme un kill). C'est la
 * méthode recommandée par le manuel officiel Valheim pour un arrêt propre
 * (sans quoi le process peut rester en zombie ou corrompre sa sauvegarde).
 *
 * GenerateConsoleCtrlEvent ne peut cibler qu'une console entière, pas un
 * process isolé — d'où l'AttachConsole/FreeConsole autour pour se greffer
 * temporairement sur la console du process visé avant d'envoyer l'event.
 * Passe par un script PowerShell (déjà présent sur Windows) plutôt qu'un
 * module natif, pour rester une dépendance zéro-install.
 */
export function sendCtrlC(pid: number): Promise<void> {
  return new Promise((resolve) => {
    const script = [
      `Add-Type -Name Win -Namespace Console -MemberDefinition '`,
      `[DllImport("kernel32.dll", SetLastError = true)]`,
      `public static extern bool AttachConsole(uint dwProcessId);`,
      `[DllImport("kernel32.dll", SetLastError = true)]`,
      `public static extern bool FreeConsole();`,
      `[DllImport("kernel32.dll")]`,
      `public static extern bool SetConsoleCtrlHandler(IntPtr HandlerRoutine, bool Add);`,
      `[DllImport("kernel32.dll")]`,
      `public static extern bool GenerateConsoleCtrlEvent(uint dwCtrlEvent, uint dwProcessGroupId);`,
      `'`,
      `[Console.Win]::FreeConsole() | Out-Null`,
      `if ([Console.Win]::AttachConsole(${pid})) {`,
      `    [Console.Win]::SetConsoleCtrlHandler([IntPtr]::Zero, $true) | Out-Null`,
      `    [Console.Win]::GenerateConsoleCtrlEvent(0, 0) | Out-Null`,
      `    Start-Sleep -Milliseconds 300`,
      `    [Console.Win]::FreeConsole() | Out-Null`,
      `}`,
    ].join("\r\n");

    const scriptPath = join(tmpdir(), `nexum-ctrlc-${pid}-${Date.now()}.ps1`);
    try {
      writeFileSync(scriptPath, script, "utf-8");
    } catch {
      resolve();
      return;
    }

    exec(
      `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${scriptPath}"`,
      { windowsHide: true, timeout: 5000 },
      () => {
        try {
          unlinkSync(scriptPath);
        } catch {
          // ignore
        }
        resolve();
      },
    );
  });
}
