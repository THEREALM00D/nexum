// Association d'un processus Windows au serveur qu'il fait tourner.
// ⚠️ Le nom de l'exécutable ne suffit pas : le client du jeu peut tourner
// sur le même PC (ex. RSDragonwilds*.exe), et deux serveurs du même jeu ont
// le même nom de processus. On exige donc aussi que l'exécutable soit dans
// le dossier du serveur.

/** Sous-ensemble utile d'une entrée de `si.processes().list`. */
export interface ProcInfo {
  pid: number;
  parentPid: number;
  name: string;
  /** Chemin complet de l'exécutable (ExecutablePath sous Windows). */
  path?: string;
  /** Ligne de commande complète. */
  command?: string;
  memRss: number;
  started?: string;
}

/** Dossier normalisé pour comparaison : minuscules, `/`, séparateur final. */
export function normalizeDir(dir: string): string {
  return dir.toLowerCase().replace(/\\/g, "/").replace(/\/+$/, "") + "/";
}

/**
 * L'exécutable est-il dans `dir` ? null quand Windows ne donne ni chemin ni
 * ligne de commande (processus lancé en admin ou par un autre utilisateur).
 */
function isUnder(proc: ProcInfo, dir: string): boolean | null {
  const where = proc.path || proc.command;
  if (!where) return null;
  return where
    .replace(/^"/, "")
    .toLowerCase()
    .replace(/\\/g, "/")
    .startsWith(dir);
}

/**
 * Processus du serveur installé dans `serverPath` : nom commençant par
 * `prefix` ET exécutable dans ce dossier. `allowUnknownPath` accepte un
 * processus au chemin illisible (repli quand un seul serveur de ce jeu
 * existe). Préfère le processus racine (le lanceur plutôt que son
 * `…-Shipping.exe`), dont dépend le cycle de vie du serveur.
 */
export function findServerProcess(
  list: ProcInfo[],
  prefix: string,
  serverPath: string,
  allowUnknownPath: boolean,
): ProcInfo | null {
  if (!serverPath) return null;
  const dir = normalizeDir(serverPath);
  const matching = list.filter((p) => {
    if (!p.name.toLowerCase().startsWith(prefix)) return false;
    const under = isUnder(p, dir);
    return under === true || (under === null && allowUnknownPath);
  });
  const pids = new Set(matching.map((p) => p.pid));
  return matching.find((p) => !pids.has(p.parentPid)) ?? matching[0] ?? null;
}

/**
 * RAM et heure de démarrage d'un serveur à partir du PID de son processus
 * racine : le lanceur consomme peu face au vrai serveur (PalServer.exe →
 * PalServer-Win64-Shipping-Cmd.exe), on prend le plus gourmand du lanceur et
 * de ses enfants directs.
 */
export function processTreeStats(
  list: ProcInfo[],
  rootPid: number,
): { memRss: number; started: number | null } | null {
  const root = list.find((p) => p.pid === rootPid);
  if (!root) return null;
  const heaviest = list
    .filter((p) => p.parentPid === rootPid)
    .reduce((best, p) => (p.memRss > best.memRss ? p : best), root);
  const started = root.started ? new Date(root.started).getTime() : NaN;
  return {
    memRss: heaviest.memRss,
    started: Number.isNaN(started) ? null : started,
  };
}
