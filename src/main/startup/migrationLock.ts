import { closeSync, existsSync, openSync, rmSync, statSync } from "fs";

// Verrou exclusif de la migration du dossier de données. Elle tourne avant le
// verrou d'instance (clé sur userData, donc pas encore fixé) : sans lui, deux
// lancements simultanés au premier démarrage pouvaient supprimer le dossier
// que l'autre venait de déplacer.

// Une migration (renommage + réécriture de quelques fichiers) dure quelques
// millisecondes : un verrou plus vieux vient d'un processus tué.
const STALE_LOCK_MS = 30_000;
const WAIT_TIMEOUT_MS = 10_000;
const POLL_INTERVAL_MS = 100;

// Attente synchrone : on est avant `ready`, rien d'autre ne tourne.
function sleep(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function tryCreate(lockPath: string): boolean {
  try {
    closeSync(openSync(lockPath, "wx"));
    return true;
  } catch {
    return false;
  }
}

function isStale(lockPath: string): boolean {
  try {
    return Date.now() - statSync(lockPath).mtimeMs > STALE_LOCK_MS;
  } catch {
    return false; // Disparu entre-temps : le prochain essai le prendra.
  }
}

// Prend le verrou, en attendant qu'un autre processus le rende. `false` si
// l'attente dépasse WAIT_TIMEOUT_MS : l'appelant ne migre pas.
export function acquireMigrationLock(lockPath: string): boolean {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (tryCreate(lockPath)) return true;
    if (isStale(lockPath)) {
      rmSync(lockPath, { force: true });
      continue;
    }
    sleep(POLL_INTERVAL_MS);
  }
  return false;
}

export function releaseMigrationLock(lockPath: string): void {
  try {
    if (existsSync(lockPath)) rmSync(lockPath, { force: true });
  } catch (error) {
    console.warn("[userData] migration lock not released:", error);
  }
}
